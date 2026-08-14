#!/usr/bin/env python3
from pathlib import Path

path = Path(__file__).with_name("build-pal-growth-v118.py")
text = path.read_text(encoding="utf-8")

if '"Thunder": "雷",' not in text:
    text = text.replace('    "Electric": "雷",', '    "Electric": "雷", "Thunder": "雷",', 1)

partner_start = text.index("def parse_partner_stars(soup: BeautifulSoup) -> tuple[str, list[dict[str, Any]]]:")
partner_end = text.index("\ndef skill_headings(active_heading: Tag):", partner_start)
partner_replacement = r'''PARTNER_BASE_NO_BONUS = {"Direhowl", "Nitewing", "Fenglope", "Paladius", "Necromus"}
PARTNER_BASE_ONLY = {"Valentail"}
PARTNER_NO_STAR_TABLE = {"Swee", "Green Slime", "Blue Slime", "Red Slime", "Purple Slime", "Illuminant Slime", "Rainbow Slime"}
PARTNER_UNAVAILABLE = {"Astralym"}


def parse_partner_stars(soup: BeautifulSoup) -> tuple[str, list[dict[str, Any]]]:
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
        level_text = direct_string(direct_cells[0])
        if not level_text or norm(level_text) in {"lv", "level", "range", "value"}:
            continue
        level_match = re.fullmatch(r"(?:Lv\s*\.?)?\s*(\d{1,2})", level_text, re.I)
        if not level_match:
            continue
        level = int(level_match.group(1))
        if level < 1 or level > 5:
            continue
        effect_cell = direct_cells[1] if len(direct_cells) >= 2 else direct_cells[0].find(["th", "td"], recursive=False)
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
            "dataStatus": "source",
        })
    return partner_name, rows


def normalize_partner_stars(en_name: str, partner_name: str, rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    by_star = {int(row["star"]): dict(row) for row in rows}
    actual = sorted(by_star)
    if actual == [0, 1, 2, 3, 4]:
        return [by_star[star] for star in range(5)]

    if en_name in PARTNER_BASE_NO_BONUS and actual == [1, 2, 3, 4]:
        by_star[0] = {
            "star": 0, "partnerLevel": 1,
            "effects": ["追加覚醒補正なし"],
            "rawValue": "PalDB level 1 has no additional numeric awakening bonus",
            "dataStatus": "base-no-bonus",
        }
    elif en_name in PARTNER_BASE_ONLY and actual == [0]:
        for star in range(1, 5):
            by_star[star] = {
                "star": star, "partnerLevel": star + 1,
                "effects": ["PalDBにこの★段階の追加数値なし"],
                "rawValue": "", "dataStatus": "no-additional-star-value",
            }
    elif en_name in PARTNER_NO_STAR_TABLE and actual == []:
        for star in range(5):
            by_star[star] = {
                "star": star, "partnerLevel": star + 1,
                "effects": ["PalDBに★別数値データなし"],
                "rawValue": "", "dataStatus": "no-star-table",
            }
    elif en_name in PARTNER_UNAVAILABLE and actual == []:
        for star in range(5):
            by_star[star] = {
                "star": star, "partnerLevel": star + 1,
                "effects": ["パートナースキル未設定"],
                "rawValue": "", "dataStatus": "partner-skill-unavailable",
            }
    else:
        raise RuntimeError(f"{en_name}: unexpected Partner Skill star coverage {actual} ({partner_name})")

    normalized = [by_star.get(star) for star in range(5)]
    if any(row is None for row in normalized):
        raise RuntimeError(f"{en_name}: failed to normalize Partner Skill stars {sorted(by_star)}")
    return normalized

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
        level = int(header.group(1)); name = header.group(2).strip(); element = header.group(3).strip()
        rest = entry[header.end():].strip()
        power_match = re.search(r"威力\s*[:：]\s*(\d+)", rest)
        power = int(power_match.group(1)) if power_match else None
        before_power = rest[:power_match.start()] if power_match else rest
        ct_matches = re.findall(r"(?<!\d)(\d+)(?!\d)", before_power)
        ct = int(ct_matches[-1]) if ct_matches else None
        effects = effect_tags_from_text(rest)
        for match in re.finditer(r"蓄積値\s*[:：]\s*([^\d]+?)\s+(\d+)", rest):
            label = " ".join(match.group(1).split()).strip(" :：")
            status = f"{label} {int(match.group(2))}" if label else ""
            if status and status not in effects:
                effects.append(status)
        skills.append({"level": level, "name": name, "element": element, "ct": ct, "power": power, "effects": effects[:6], "exclusive": "専用スキル" in rest})
    deduped: list[dict[str, Any]] = []; seen = set()
    for skill in skills:
        key = (skill["level"], skill["name"])
        if key not in seen:
            seen.add(key); deduped.append(skill)
    return sorted(deduped, key=lambda skill: (skill["level"], skill["name"]))

'''
text = text[:active_start] + active_replacement + text[active_end + 1:]

parse_record_start = text.index("def parse_record(record: dict[str, Any]) -> dict[str, Any]:")
parse_record_end = text.index("\ndef main() -> None:", parse_record_start)
parse_record_replacement = r'''def parse_record(record: dict[str, Any]) -> dict[str, Any]:
    en_url = str(record.get("sourceUrl") or "").strip()
    if not en_url:
        raise RuntimeError(f"{record.get('name')}: sourceUrl missing")
    url = japanese_url(en_url)
    soup = BeautifulSoup(fetch_html(url), "html.parser")
    en_name = str(record.get("name") or "")
    partner_name, raw_stars = parse_partner_stars(soup)
    stars = normalize_partner_stars(en_name, partner_name, raw_stars)
    skills = parse_active_skills(soup)
    return {"number": str(record.get("number") or ""), "enName": en_name, "sourceUrl": url, "partnerSkill": {"name": partner_name, "stars": stars}, "activeSkills": skills}

'''
text = text[:parse_record_start] + parse_record_replacement + text[parse_record_end + 1:]
path.write_text(text, encoding="utf-8")
print("Repaired", path)
