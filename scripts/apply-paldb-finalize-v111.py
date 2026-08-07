#!/usr/bin/env python3
"""One-time self-deleting cleanup for the v111 PalDB detail snapshot."""

from pathlib import Path

parser_path = Path("scripts/build-paldb-details-v111.py")
source = parser_path.read_text(encoding="utf-8")
old = '''def parse_drops(soup: BeautifulSoup) -> list[dict[str, str]]:
    heading = find_heading(soup, lambda value: norm(value) == norm("Possible Drops"))
    if heading is None:
        return []
    table = heading.find_next("table")
    if table is None:
        return []
    drops: list[dict[str, str]] = []
    for row in table.find_all("tr"):
        cells = [" ".join(cell.get_text(" ", strip=True).split()) for cell in row.find_all(["th", "td"])]
        if len(cells) < 2 or norm(cells[0]) in {"item", "アイテム"}:
            continue
        drops.append({"item": cells[0], "probability": cells[-1]})
    return drops[:20]
'''
new = '''def parse_drops(soup: BeautifulSoup) -> list[dict[str, str]]:
    heading = find_heading(soup, lambda value: norm(value) == norm("Possible Drops"))
    if heading is None:
        return []
    table = heading.find_next("table")
    if table is None:
        return []
    drops: list[dict[str, str]] = []
    for row in table.find_all("tr"):
        cells = [" ".join(cell.get_text(" ", strip=True).split()) for cell in row.find_all(["th", "td"])]
        if len(cells) < 2:
            continue
        raw_item = cells[0].strip()
        probability = cells[-1].strip()
        raw_key = norm(raw_item)
        if raw_key in {"item", "アイテム", "itemqtyprobability", "アイテム数量確率"} or norm(probability) == "probability":
            continue
        item = raw_item
        if probability and item.endswith(probability):
            item = item[: -len(probability)].rstrip()
        item = re.sub(r"\\s+\\d+(?:[–—-]\\d+)?$", "", item).strip()
        if not item:
            continue
        drops.append({"item": item, "probability": probability})
    return drops[:20]
'''
if old not in source:
    raise RuntimeError("Expected parse_drops block was not found")
parser_path.write_text(source.replace(old, new), encoding="utf-8")

workflow_path = Path(".github/workflows/generate-pal-details-v111.yml")
workflow = workflow_path.read_text(encoding="utf-8")
step = '''      - name: Apply final data parser cleanup
        run: python scripts/apply-paldb-finalize-v111.py

'''
if step not in workflow:
    raise RuntimeError("Expected one-time workflow step was not found")
workflow_path.write_text(workflow.replace(step, ""), encoding="utf-8")

Path(__file__).unlink()
print("Cleaned drop parsing, removed the one-time workflow step, and deleted this patch.")
