"""Write a review checklist for a Markdown proposal using only the standard library."""

import argparse
import csv
import re
from pathlib import Path


HEADING = re.compile(r"^ {0,3}#{1,6}[ \t]+(.*?)(?:[ \t]+#+)?[ \t]*$")
NUMBERING = re.compile(
    r"^(?:(?:(?:section|part) (?:[a-z]|\d+(?:\.\d+)*)|\d+(?:\.\d+)*)"
    r"(?:[.)]| *[:\u2013\u2014-])?|[a-z]\d*[.)]) +"
)
FENCE = re.compile(r"^ {0,3}(`{3,}|~{3,})(.*)$")
MARKER = re.compile(
    r"(?P<sme>\bNEEDS[ \t]+SME[ \t]+INPUT\b)|"
    r"\b(?:TBD|TBC|TODO)\b|"
    r"\[(?:insert|enter|add|confirm|replace|placeholder)\b[^\]\n]*\]|"
    r"<(?:insert|enter|add|confirm|replace|placeholder)\b[^>\n]*>",
    re.IGNORECASE,
)


def heading_key(title):
    return NUMBERING.sub("", " ".join(title.casefold().split()))


def checklist(draft, required_headings):
    rows = []
    headings = set()
    fence = None
    for line_number, line in enumerate(draft.splitlines(), start=1):
        boundary = FENCE.match(line)
        if fence:
            if boundary:
                marker, rest = boundary.groups()
                if marker[0] == fence[0] and len(marker) >= len(fence) and not rest.strip():
                    fence = None
            continue
        if boundary:
            fence = boundary[1]
            continue
        if heading := HEADING.match(line):
            headings.add(heading_key(heading[1]))
        for marker in MARKER.finditer(line):
            check = "needs_sme_input" if marker["sme"] else "placeholder"
            rows.append(("review", check, line_number, f"Marker: {marker[0]}"))

    for title in required_headings:
        if heading_key(title) not in headings:
            rows.append(("review", "required_heading", "", f"Missing heading: {title}"))
    if not rows:
        rows.append(("clear", "checked_items", "", "No review items found in the checks run."))
    if not required_headings:
        rows.append(("skipped", "required_heading", "", "No buyer-required headings were supplied."))
    return rows


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("draft", type=Path, help="UTF-8 Markdown proposal")
    parser.add_argument("--headings", type=Path, help="UTF-8 list of buyer-required headings, one per line")
    parser.add_argument("-o", "--output", type=Path, default=Path("proposal-checks.csv"))
    args = parser.parse_args()

    try:
        draft = args.draft.read_text(encoding="utf-8-sig")
        if not draft.strip():
            parser.error("the proposal is empty")
        required = []
        if args.headings is not None:
            headings_text = args.headings.read_text(encoding="utf-8-sig")
            required = [line.strip() for line in headings_text.splitlines() if line.strip()]
            if not required:
                parser.error("the headings file is empty; omit --headings if the buyer did not specify headings")

        # Exclusive creation protects the input files and previous review results.
        with args.output.open("x", encoding="utf-8-sig", newline="") as output:
            writer = csv.writer(output)
            writer.writerow(("status", "check", "line", "detail"))
            writer.writerows(checklist(draft, required))
    except (OSError, UnicodeError) as error:
        parser.exit(1, f"{parser.prog}: {error}\n")
    print(f"Wrote {args.output}")


if __name__ == "__main__":
    main()
