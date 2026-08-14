#!/usr/bin/env python3
from pathlib import Path

path = Path(__file__).with_name("build-pal-growth-v118.py")
text = path.read_text(encoding="utf-8")

if '"Thunder": "雷",' not in text:
    text = text.replace('    "Electric": "雷",', '    "Electric": "雷", "Thunder": "雷",', 1)

partner_start = text.index("def parse_partner_stars(soup: BeautifulSoup) -> tuple[str, list[dict[str, Any]]]:")
partner_end = text.index("\ndef skill_headings(active_heading: Tag):", partner_start)
partner_replacement = r'''def parse_partner_stars(soup: BeautifulSoup) -> tuple[str, list[dict[str, Any]]]:
    heading = find_partner_heading(soup)
    if heading is None:
        return "", []
    title = heading_text(heading)
    partner_name = re.split(r"[:：]", title, maxsplit=1)[1].strip() if re.search(r"[:：]", title) else ""

    def direct_string(cell: Tag) -> str:
        values = [" ".join(str(value).split()) for value in cell.find_all(string=True, recursive=False)]
        return " ".join(value for value in values if value).strip()

    def text_before_nested_row(cell: Tag) -> str:
        parts: list[str] = []
        for child in cell.children:
            if isinstance(child, Tag) and child.name == "tr":
                break
            if isinstance(child, NavigableString):
                value = " ".join(str(child).split()).strip()
                if value:
                    parts.append(value)
            elif isinstance(child, Tag):
                # PalDB's malformed tables nest the next <tr> inside the second <td>.
                # Only read content before that nested row.
                nested_row = child.find("tr")
                if nested_row is not None:
                    for subchild in child.children:
                        if isinstance(subchild, Tag) and subchild.name == "tr":
                            break
                        if isinstance(subchild, NavigableString):
                            value = " ".join(str(subchild).split()).strip()
                        elif isinstance(subchild, Tag):
                            value = " ".join(subchild.get_text(" ", strip=True).split())
                        else:
                            value = ""
                        if value:
                            parts.append(value)
                    break
                value = " ".join(child.get_text(" ", strip=True).split())
                if value:
                    parts.append(value)
        return " ".join(parts).strip()

    grouped: dict[int, dict[str, Any]] = {}
    seen_rows: set[int] = set()

    for element in heading.next_elements:
        if element is heading:
            continue
        if isinstance(element, Tag) and HEADINGS.fullmatch(element.name or ""):
            section_title = norm(heading_text(element))
            if section_title in {norm("Active Skills"), norm("Passive Skills"), norm("Possible Drops"), norm("アクティブスキル"), norm("パッシブスキル"), norm("ドロップ")}:
                break
        if not isinstance(element, Tag) or element.name != "tr":
            continue
        identity = id(element)
        if identity in seen_rows:
            continue
        seen_rows.add(identity)

        direct_cells = element.find_all(["th", "td"], recursive=False)
        if not direct_cells:
            continue
        first_cell = direct_cells[0]
        level_text = direct_string(first_cell)
        if not level_text:
            continue
        if norm(level_text) in {"lv", "level", "range", "value"}:
            continue
        level_match = re.fullmatch(r"(?:Lv\s*\.?)?\s*(\d{1,2})", level_text, re.I)
        if not level_match:
            continue
        level = int(level_match.group(1))
        if level < 1 or level > 5:
            continue

        if len(direct_cells) >= 2:
            effect_cell = direct_cells[1]
        else:
            effect_cell = first_cell.find(["th", "td"], recursive=False)
        if effect_cell is None:
            continue
        raw = text_before_nested_row(effect_cell)
        if not raw:
            continue

        bucket = grouped.setdefault(level, {"raw": [], "effects": []})
        if raw not in bucket["raw"]:
            bucket["raw"].append(raw)
        for effect in decode_partner_effects(raw):
            if effect not in bucket["effects"]:
                bucket["effects"].append(effect)

    rows: list[dict[str, Any]] = []
    for level in range(1, 6):
        bucket = grouped.get(level)
        if not bucket:
            continue
        rows.append({
            "star": level - 1,
            "partnerLevel": level,
            "effects": bucket["effects"][:8],
            "rawValue": " | ".join(bucket["raw"])[:300],
        })
    return partner_name, rows

'''
text = text[:partner_start] + partner_replacement + text[partner_end + 1:]

active_start = text.index("def parse_active_skills(soup: BeautifulSoup) -> list[dict[str, Any]]:")
active_end = text.index("\ndef parse_record(record: dict[str, Any]) -> dict[str, Any]:", active_start)
active_replacement = r'''def parse_active_skills(soup: BeautifulSoup) -> list[dict[str, Any]]:
    active = find_heading(soup, lambda value: norm(value) == norm("Active Skills"))
    if active is None:
        return []

    tokens: list[str] = []
    for element in active.next_elements:
        if element is active:
            continue
        if isinstance(element, Tag) and HEADINGS.fullmatch(element.name or ""):
            title = norm(heading_text(element))
            if title in {norm("Passive Skills"), norm("Possible Drops"), norm("パッシブスキル"), norm("ドロップ")}:
                break
        if isinstance(element, NavigableString):
            value = " ".join(str(element).split()).strip()
            if value:
                tokens.append(value)
    segment = " ".join(tokens).strip()
    if not segment:
        return []

    entries = re.split(r"(?=Lv\s*\.\s*\d+\s+)", segment)
    skills: list[dict[str, Any]] = []
    element_pattern = "|".join(sorted((re.escape(value) for value in ELEMENTS), key=len, reverse=True))
    for entry in entries:
        entry = " ".join(entry.split()).strip()
        if not entry.startswith("Lv"):
            continue
        header = re.match(rf"^Lv\s*\.\s*(\d+)\s+(.+?)\s+({element_pattern})\s+", entry)
        if not header:
            continue
        level = int(header.group(1))
        name = header.group(2).strip()
        element = header.group(3).strip()
        rest = entry[header.end():].strip()
        power_match = re.search(r"威力\s*[:：]\s*(\d+)", rest)
        power = int(power_match.group(1)) if power_match else None
        before_power = rest[:power_match.start()] if power_match else rest
        ct_matches = re.findall(r"(?<!\d)(\d+)(?!\d)", before_power)
        ct = int(ct_matches[-1]) if ct_matches else None
        statuses: list[dict[str, Any]] = []
        for match in re.finditer(r"蓄積値\s*[:：]\s*([^\d]+?)\s+(\d+)", rest):
            label = " ".join(match.group(1).split()).strip(" :：")
            if label:
                statuses.append({"name": label[:30], "value": int(match.group(2))})
        effects = effect_tags_from_text(rest)
        for status in statuses:
            label = f"{status['name']} {status['value']}"
            if label not in effects:
                effects.append(label)
        skills.append({
            "level": level,
            "name": name,
            "element": element,
            "ct": ct,
            "power": power,
            "effects": effects[:6],
            "exclusive": "専用スキル" in rest,
        })

    deduped: list[dict[str, Any]] = []
    seen = set()
    for skill in skills:
        key = (skill["level"], skill["name"])
        if key in seen:
            continue
        seen.add(key)
        deduped.append(skill)
    return sorted(deduped, key=lambda skill: (skill["level"], skill["name"]))

'''
text = text[:active_start] + active_replacement + text[active_end + 1:]

path.write_text(text, encoding="utf-8")
print("Repaired", path)
