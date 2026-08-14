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
    table = next_table_in_section(heading)
    if table is None:
        return partner_name, []

    grouped: dict[int, dict[str, Any]] = {}
    current_level: int | None = None
    for tr in table.find_all("tr"):
        cells = [" ".join(cell.get_text(" ", strip=True).split()) for cell in tr.find_all(["th", "td"])]
        if not cells:
            continue
        any_level = re.search(r"(?<!\d)(\d{1,2})(?!\d)", cells[0])
        if any_level:
            detected = int(any_level.group(1))
            if detected < 1 or detected > 5:
                current_level = None
                continue
            current_level = detected
            effect_cells = cells[1:]
        elif current_level is not None:
            effect_cells = cells
        else:
            continue
        raw = " ".join(effect_cells).strip()
        if not raw:
            continue
        bucket = grouped.setdefault(current_level, {"raw": [], "effects": []})
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
