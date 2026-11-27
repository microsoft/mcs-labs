"""Prepare one private, offline build tree from the tracked Zava Sales source."""
import argparse
import json
from pathlib import Path
import re
import shutil
import subprocess
from tempfile import TemporaryDirectory
from zipfile import ZIP_DEFLATED, ZipFile

ROOT = Path(__file__).resolve().parent
PARTS = ("zava-sales", "zava-copilot-pane", "zava-app-mcp", "solutions/ZavaCRM")
IDS = {"TENANT_ID", "ENVIRONMENT_ID", "RUNTIME_APP_ID", "CONNECTION_REFERENCE_ID",
       "MODEL_APP_ID", "ACTIVITY_VIEW_ID", "PANE_CLIENT_ID"}
ORIGINS = {"DATAVERSE_ORIGIN", "AGENT_API_ORIGIN", "APP_ORIGIN", "PANE_ORIGIN", "SHELL_ORIGIN"}
GUID = re.compile(r"[a-fA-F0-9]{8}(?:-[a-fA-F0-9]{4}){3}-[a-fA-F0-9]{12}")
LABEL = r"[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?"
ORIGIN = re.compile(rf"https://{LABEL}(?:\.{LABEL})+")
MARKER = re.compile(r"@@([A-Z_]+)@@")
SCHEMA = Path("zava-sales/.ms/schemas/commondataserviceforapps/commondataserviceforapps.Schema.json")


def bindings(values):
    expected = IDS | ORIGINS | {"APP_ROLE_IDS"}
    if not isinstance(values, dict) or set(values) != expected:
        raise ValueError("Use exactly the fields in bindings.example.json")
    for key in IDS:
        if not isinstance(values[key], str) or not GUID.fullmatch(values[key]):
            raise ValueError(f"{key} must be a GUID")
    for key in ORIGINS:
        if not isinstance(values[key], str) or not ORIGIN.fullmatch(values[key]):
            raise ValueError(f"{key} must be one exact lowercase HTTPS origin, without a trailing slash")
    if values["PANE_ORIGIN"] in (values["APP_ORIGIN"], values["SHELL_ORIGIN"]):
        raise ValueError("The companion must have its own origin")
    roles = values["APP_ROLE_IDS"]
    if not isinstance(roles, list) or not roles or any(not isinstance(v, str) or not GUID.fullmatch(v) for v in roles):
        raise ValueError("APP_ROLE_IDS must contain the explicitly approved role GUIDs")
    if len({v.lower() for v in roles}) != len(roles):
        raise ValueError("APP_ROLE_IDS contains a duplicate")
    # Only validated IDs and origins can enter source, XML, JSON and CSP strings.
    return {**{key: values[key].lower() for key in IDS | ORIGINS},
            "DATAVERSE_HOST": values["DATAVERSE_ORIGIN"].removeprefix("https://"),
            "APP_ROLE_MAP": "\n    ".join(f'<Role id="{{{v}}}" />' for v in roles)}


def render(text, values):
    def replace(match):
        if match[1] not in values:
            raise ValueError(f"Unknown template field {match[1]}")
        return values[match[1]]
    result = MARKER.sub(replace, text)
    if "@@" in result:
        raise ValueError("Malformed template marker")
    return result


def package_agent(build):
    folder = build / "zava-app-mcp" / "appPackage"
    manifest = json.loads((folder / "manifest.json").read_bytes())
    agent = json.loads((folder / "declarativeAgent.json").read_bytes())
    plugin = json.loads((folder / "ai-plugin.json").read_bytes())
    names = {"manifest.json", "declarativeAgent.json", "ai-plugin.json", "color.png", "outline.png"}
    if ({p.name for p in folder.iterdir()} != names
            or [a["file"] for a in manifest["copilotAgents"]["declarativeAgents"]] != ["declarativeAgent.json"]
            or [a["file"] for a in agent["actions"]] != ["ai-plugin.json"]
            or set(manifest["icons"].values()) != {"color.png", "outline.png"}
            or not plugin["runtimes"]):
        raise ValueError("Agent package contents and manifest references must agree")
    with ZipFile(build / "ZavaSalesHub.zip", "w", ZIP_DEFLATED) as archive:
        for name in sorted(names):
            archive.write(folder / name, name)


def prepare(profile):
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_-]*", profile):
        raise ValueError("Use a profile name, not a path")
    local = ROOT / ".local" / profile
    if local.resolve() != local:
        raise ValueError("The private build directory must not be redirected")
    output = local / "build"
    if output.exists():
        raise FileExistsError("Build already exists. Move or remove only this profile's generated build first.")
    values = bindings(json.loads((local / "bindings.json").read_bytes()))
    schema = local / "connector.schema.json"
    if not json.loads(schema.read_bytes()).get("properties", {}).get("swagger", {}).get("paths"):
        raise ValueError("Expected the Managed Runtime Dataverse connector schema, not a connection or credential file")
    # Do not copy arbitrary local files (including credentials or previous SDK outputs).
    tracked = subprocess.check_output(["git", "ls-files", "-z", "--", *PARTS], cwd=ROOT)
    with TemporaryDirectory(dir=local) as tmp:
        build = Path(tmp) / "build"
        for name in tracked.decode("utf-8").split("\0"):
            if not name:
                continue
            source = ROOT / name
            if source.resolve() != source:
                raise ValueError(f"Unexpected redirected source: {name}")
            target = build / name
            target.parent.mkdir(parents=True, exist_ok=True)
            if source.suffix == ".in":
                target.with_suffix("").write_bytes(render(source.read_bytes().decode("utf-8"), values).encode("utf-8"))
            else:
                shutil.copyfile(source, target)
        (build / SCHEMA).parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(schema, build / SCHEMA)
        (build / "zava-copilot-pane/chat/.env.local").write_text(
            f"VITE_ZAVA_PANE_CLIENT_ID={values['PANE_CLIENT_ID']}\n", encoding="utf-8")
        package_agent(build)
        build.rename(output)
    print("Prepared .local/" + profile + "/build (private; nothing deployed).")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("profile", help="Name of a directory under .local")
    prepare(parser.parse_args().profile)
