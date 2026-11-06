#!/usr/bin/env python3
"""Crop raw run-through captures into published lab images.

For each name in the spec, reads <src>/<name>-light.png and <name>-dark.png
(from `capture.cjs pair`) or <name>.png (from `capture.cjs shot`), crops them
with the same box so both themes frame the same content, and writes
<dest>/<name>.<ext> and <dest>/<name>-dark.<ext>. Prints each size for the lab's
width and height fields.

--format webp (default) suits missions labs, which publish WebP light/dark
pairs. Classic labs mostly use PNG and a single light image: pass --format png
--light-only, and match the name the lab already references so the Markdown does
not change. One `pair` capture can then feed both a classic and a missions lab.

The spec is JSON mapping each name to [left, top, right, bottom] in capture
pixels, or null to keep the whole capture:

    {"dataverse-connection": [716, 344, 1196, 570], "hero": null}

Requires Pillow (pip install pillow).
"""

import argparse
import json
import sys
from pathlib import Path

try:
    from PIL import Image, ImageChops
except ImportError:
    sys.exit("Pillow is not installed. Run: pip install pillow")


def crop(path, box, max_width):
    image = Image.open(path).convert("RGB")
    if box:
        left, top, right, bottom = box
        if not (0 <= left < right <= image.width and 0 <= top < bottom <= image.height):
            raise ValueError(f"{path.name}: box {box} is outside the {image.width} x {image.height} capture")
        image = image.crop(tuple(box))
    if max_width and image.width > max_width:
        height = round(image.height * max_width / image.width)
        image = image.resize((max_width, height), Image.Resampling.LANCZOS)
    return image


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("spec", type=Path, help="JSON file mapping names to crop boxes")
    parser.add_argument("src", type=Path, help="folder with the raw PNG captures")
    parser.add_argument("dest", type=Path, help="destination, usually labs/<slug>/images")
    parser.add_argument("--max-width", type=int, default=0, help="scale down wider images to this width")
    parser.add_argument("--format", choices=("webp", "png"), default="webp", help="output format (default webp)")
    parser.add_argument("--quality", type=int, default=88, help="WebP quality (default 88)")
    parser.add_argument("--sheets", type=Path, help="also write light-over-dark contact sheets here (outside the repository)")
    parser.add_argument("--light-only", action="store_true", help="write only <name>.<ext> from <name>-light.png (classic labs)")
    args = parser.parse_args()

    spec = json.loads(args.spec.read_text(encoding="utf-8"))
    args.dest.mkdir(parents=True, exist_ok=True)
    if args.sheets:
        args.sheets.mkdir(parents=True, exist_ok=True)

    failed = False
    for name, box in spec.items():
        light, dark = args.src / f"{name}-light.png", args.src / f"{name}-dark.png"
        sources = {"": light, "-dark": dark} if light.exists() or dark.exists() else {"": args.src / f"{name}.png"}
        if args.light_only:
            sources = {"": light if light.exists() else args.src / f"{name}.png"}
        missing = [p.name for p in sources.values() if not p.exists()]
        if missing:
            print(f"{name}: missing {', '.join(missing)}", file=sys.stderr)
            failed = True
            continue
        try:
            images = {suffix: crop(path, box, args.max_width) for suffix, path in sources.items()}
        except ValueError as error:
            print(error, file=sys.stderr)
            failed = True
            continue
        if len(images) == 2 and ImageChops.difference(images[""], images["-dark"]).getbbox() is None:
            print(f"{name}: light and dark crops are identical; recapture with the product theme on System", file=sys.stderr)
            failed = True
            continue
        for suffix, image in images.items():
            out = args.dest / f"{name}{suffix}.{args.format}"
            if args.format == "webp":
                image.save(out, "WEBP", quality=args.quality, method=6)
            else:
                image.save(out, "PNG", optimize=True)
            print(f"{out.as_posix()}  width: {image.width}  height: {image.height}  ({out.stat().st_size:,} bytes)")
        if args.sheets and len(images) == 2:
            width, height = images[""].size
            sheet = Image.new("RGB", (width, height * 2 + 12), (255, 0, 255))
            sheet.paste(images[""], (0, 0))
            sheet.paste(images["-dark"], (0, height + 12))
            sheet.save(args.sheets / f"sheet-{name}.png")

    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
