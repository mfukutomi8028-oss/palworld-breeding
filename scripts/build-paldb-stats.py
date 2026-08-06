#!/usr/bin/env python3
"""Build a fixed Palworld 1.0 species-stat snapshot from PalDB.

PalDB exposes the ordinary roster in the ``Stats /288`` table and the 11
unnumbered collaboration Pals only on their individual pages.  This builder
combines both sources, verifies the existing HP/Defense fields, and writes the
PalDB Attack value (the game's ranged/ShotAttack species scaling value).
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

from bs4 import BeautifulSoup, NavigableString, Tag

SOURCE_URL = "https://paldb.cc/en/Pal_Stats"
USER_AGENT = "pal-breeding-note/1.0 PalDB stat snapshot builder"
EXPECTED_COUNT = 299
EXPECTED_TABLE_COUNT = 288
EXPECTED_INDIVIDUAL_COUNT = EXPECTED_COUNT - EXPECTED_TABLE_COUNT


def normalized(value: Any) -> str:
    return re.sub(r"[^a-z0-9]+", "", str(value or "").casefold())


def integer(text: str) -> int:
    match = re.search(r"-?\d+", text.replace(",", ""))
    if not match:
        raise ValueError(f"No integer found in {text!r}")
    return int(match.group())


def source_slug(url: str) -> str:
    path = urllib.parse.urlparse(url).path.rstrip("/")
    return urllib.parse.unquote(path.rsplit("/", 1)[-1])


def fetch_html(url: str) -> str:
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml",
            "Accept-Language": "en-US,en;q=0.9",
        },
    )
    with urllib.request.urlopen(request, timeout=90) as response:
        if response.status != 200:
            raise RuntimeError(f"{url}: HTTP {response.status}")
        return response.read().decode("utf-8", errors="replace")


def heading_text(heading: Tag) -> str:
    return " ".join(heading.get_text(" ", strip=True).split())


def find_base_stats_table(soup: BeautifulSoup) -> tuple[Tag, int]:
    for heading in soup.find_all(re.compile(r"^h[1-6]$")):
        title = heading_text(heading)
        match = re.fullmatch(r"Stats\s*/\s*(\d+)", title, flags=re.IGNORECASE)
        if not match:
            continue
        table = heading.find_next("table")
        if table is None:
            raise RuntimeError(f"PalDB {title} heading has no following table")
        return table, int(match.group(1))
    raise RuntimeError("PalDB base Stats /N table was not found")


def parse_base_stats(html: str) -> list[dict[str, Any]]:
    soup = BeautifulSoup(html, "html.parser")
    table, declared_count = find_base_stats_table(soup)
    rows = table.find_all("tr")
    if not rows:
        raise RuntimeError("PalDB base Stats table is empty")

    header = [normalized(cell.get_text(" ", strip=True)) for cell in rows[0].find_all(["th", "td"])]
    expected = ["name", "element", "total", "hp", "attack", "defense"]
    if header[-6:] != expected:
        raise RuntimeError(f"Unexpected PalDB stat header: {header}")

    results: list[dict[str, Any]] = []
    for row in rows[1:]:
        cells = row.find_all(["th", "td"])
        if len(cells) < 6:
            continue
        name_cell = cells[0]
        link = name_cell.find("a", href=True)
        name = name_cell.get_text(" ", strip=True)
        href = link.get("href", "") if link else ""
        slug = source_slug(urllib.parse.urljoin(SOURCE_URL, href)) if href else ""
        total, hp, attack, defense = [integer(cell.get_text(" ", strip=True)) for cell in cells[-4:]]
        if total != hp + attack + defense:
            raise RuntimeError(
                f"PalDB total mismatch for {name}: {total} != {hp}+{attack}+{defense}"
            )
        results.append(
            {
                "name": name,
                "slug": slug,
                "hp": hp,
                "attack": attack,
                "defense": defense,
                "total": total,
                "sourceType": "PalDB Stats table",
            }
        )

    if declared_count != EXPECTED_TABLE_COUNT:
        raise RuntimeError(
            f"Expected PalDB base heading Stats /{EXPECTED_TABLE_COUNT}, got Stats /{declared_count}"
        )
    if len(results) != declared_count:
        raise RuntimeError(f"PalDB declared {declared_count} base rows, parsed {len(results)}")
    return results


def section_tokens(heading: Tag) -> list[str]:
    """Collect visible text after a heading until the next heading."""

    tokens: list[str] = []
    current = heading.next_sibling
    while current is not None:
        if isinstance(current, Tag) and re.fullmatch(r"h[1-6]", current.name or "", flags=re.IGNORECASE):
            break
        if isinstance(current, NavigableString):
            text = " ".join(str(current).split())
            if text:
                tokens.append(text)
        elif isinstance(current, Tag):
            tokens.extend(" ".join(text.split()) for text in current.stripped_strings if text.strip())
        current = current.next_sibling

    if tokens:
        return tokens

    # Some PalDB layouts wrap the heading and values in different containers.
    for element in heading.next_elements:
        if element is heading:
            continue
        if isinstance(element, Tag) and re.fullmatch(r"h[1-6]", element.name or "", flags=re.IGNORECASE):
            break
        if isinstance(element, NavigableString):
            text = " ".join(str(element).split())
            if text:
                tokens.append(text)
    return tokens


def numeric_after(tokens: list[str], label: str) -> int:
    label_key = normalized(label)
    for index, token in enumerate(tokens):
        if normalized(token) != label_key:
            continue
        for candidate in tokens[index + 1 :]:
            stripped = candidate.replace(",", "").strip()
            if re.fullmatch(r"-?\d+(?:\.\d+)?", stripped):
                return int(float(stripped))
            # A new stat label means the requested value was not found.
            if normalized(candidate) in {
                "health",
                "food",
                "meleeattack",
                "attack",
                "defense",
                "workspeed",
                "support",
            }:
                break
    raise RuntimeError(f"Could not find numeric value after {label!r}; tokens={tokens[:80]!r}")


def parse_individual_stats(html: str, name: str, url: str) -> dict[str, Any]:
    soup = BeautifulSoup(html, "html.parser")
    heading = next(
        (
            item
            for item in soup.find_all(re.compile(r"^h[1-6]$"))
            if re.fullmatch(r"Stats", heading_text(item), flags=re.IGNORECASE)
        ),
        None,
    )
    if heading is None:
        raise RuntimeError(f"{name}: individual PalDB Stats heading not found at {url}")

    tokens = section_tokens(heading)
    hp = numeric_after(tokens, "Health")
    attack = numeric_after(tokens, "Attack")
    defense = numeric_after(tokens, "Defense")
    return {
        "name": name,
        "slug": source_slug(url),
        "hp": hp,
        "attack": attack,
        "defense": defense,
        "total": hp + attack + defense,
        "sourceType": "Individual PalDB Stats panel",
    }


def build_snapshot(pals_path: Path, output_path: Path, update_pals: bool) -> None:
    pal_data = json.loads(pals_path.read_text(encoding="utf-8"))
    records = pal_data.get("records")
    if not isinstance(records, list) or len(records) != EXPECTED_COUNT:
        raise RuntimeError(
            f"Expected {EXPECTED_COUNT} local Pal records, got {len(records) if isinstance(records, list) else 'invalid'}"
        )

    stats = parse_base_stats(fetch_html(SOURCE_URL))
    by_slug = {normalized(row["slug"]): row for row in stats if row["slug"]}
    by_name = {normalized(row["name"]): row for row in stats}

    missing_records: list[dict[str, Any]] = []
    for record in records:
        slug = source_slug(str(record.get("sourceUrl") or ""))
        if by_slug.get(normalized(slug)) or by_name.get(normalized(record.get("name"))):
            continue
        missing_records.append(record)

    if len(missing_records) != EXPECTED_INDIVIDUAL_COUNT:
        names = [f"{record.get('number')} {record.get('name')}" for record in missing_records]
        raise RuntimeError(
            f"Expected {EXPECTED_INDIVIDUAL_COUNT} individual-page Pals, got {len(missing_records)}: {names}"
        )

    for record in missing_records:
        url = str(record.get("sourceUrl") or "").strip()
        if not url:
            raise RuntimeError(f"{record.get('name')}: sourceUrl is missing")
        stat = parse_individual_stats(fetch_html(url), str(record.get("name") or ""), url)
        stats.append(stat)
        by_slug[normalized(stat["slug"])] = stat
        by_name[normalized(stat["name"])] = stat

    snapshot_records: list[dict[str, Any]] = []
    missing: list[str] = []
    mismatches: list[str] = []

    for record in records:
        slug = source_slug(str(record.get("sourceUrl") or ""))
        stat = by_slug.get(normalized(slug)) or by_name.get(normalized(record.get("name")))
        if stat is None:
            missing.append(f"{record.get('number')} {record.get('name')} ({slug})")
            continue

        existing_hp = record.get("hp")
        existing_defense = record.get("defense")
        if existing_hp is not None and int(existing_hp) != stat["hp"]:
            mismatches.append(
                f"{record.get('name')} HP local={existing_hp} PalDB={stat['hp']}"
            )
        if existing_defense is not None and int(existing_defense) != stat["defense"]:
            mismatches.append(
                f"{record.get('name')} Defense local={existing_defense} PalDB={stat['defense']}"
            )

        record["hp"] = stat["hp"]
        record["attack"] = stat["attack"]
        record["defense"] = stat["defense"]
        record["statTotal"] = stat["total"]
        snapshot_records.append(
            {
                "number": str(record.get("number") or ""),
                "name": str(record.get("name") or ""),
                "hp": stat["hp"],
                "attack": stat["attack"],
                "defense": stat["defense"],
                "total": stat["total"],
                "sourceUrl": str(record.get("sourceUrl") or ""),
                "sourceType": stat["sourceType"],
            }
        )

    if missing:
        raise RuntimeError("Missing PalDB stat rows:\n" + "\n".join(missing))
    if mismatches:
        raise RuntimeError("Existing HP/Defense differs from PalDB:\n" + "\n".join(mismatches))
    if len(snapshot_records) != EXPECTED_COUNT:
        raise RuntimeError(f"Built {len(snapshot_records)} stat records")

    identities = {(row["number"], row["name"]) for row in snapshot_records}
    if len(identities) != EXPECTED_COUNT:
        raise RuntimeError(f"Species-stat identities are not unique: {len(identities)}")

    lamball = next(row for row in snapshot_records if row["name"] == "Lamball")
    if (lamball["hp"], lamball["attack"], lamball["defense"], lamball["total"]) != (
        70,
        70,
        70,
        210,
    ):
        raise RuntimeError(f"Lamball verification failed: {lamball}")

    retrieved = dt.date.today().isoformat()
    snapshot = {
        "source": "PalDB Stats /288 plus 11 individual Pal Stats panels",
        "sourceUrl": SOURCE_URL,
        "gameVersion": "Palworld 1.0",
        "retrieved": retrieved,
        "definition": {
            "hp": "Species HP scaling value shown as Health in PalDB",
            "attack": "Species ranged/ShotAttack scaling value shown as Attack in PalDB",
            "defense": "Species Defense scaling value shown in PalDB",
            "total": "HP + Attack + Defense",
        },
        "tableCount": EXPECTED_TABLE_COUNT,
        "individualPageCount": EXPECTED_INDIVIDUAL_COUNT,
        "count": len(snapshot_records),
        "records": snapshot_records,
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(snapshot, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    if update_pals:
        pal_data["statsSource"] = SOURCE_URL
        pal_data["statsRetrieved"] = retrieved
        pal_data["statsDefinition"] = "PalDB species HP / Attack / Defense scaling values"
        pals_path.write_text(
            json.dumps(pal_data, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )

    print(
        f"Built {len(snapshot_records)} PalDB species stat rows "
        f"({EXPECTED_TABLE_COUNT} table + {EXPECTED_INDIVIDUAL_COUNT} individual). "
        f"Lamball={lamball['hp']}/{lamball['attack']}/{lamball['defense']} total={lamball['total']}"
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pals", default="data/pals-v1.json")
    parser.add_argument("--output", default="data/pal-stats-v1.json")
    parser.add_argument("--update-pals", action="store_true")
    args = parser.parse_args()
    build_snapshot(Path(args.pals), Path(args.output), args.update_pals)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(f"ERROR: {error}", file=sys.stderr)
        raise
