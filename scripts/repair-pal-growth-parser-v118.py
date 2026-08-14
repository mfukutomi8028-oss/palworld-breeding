#!/usr/bin/env python3
from pathlib import Path

path = Path(__file__).with_name("build-pal-growth-v118.py")
text = path.read_text(encoding="utf-8")
start = text.index("def parse_active_skills(soup: BeautifulSoup) -> list[dict[str, Any]]:")
end = text.index("\ndef parse_record(record: dict[str, Any]) -> dict[str, Any]:", start)
replacement = r'''def parse_active_skills(soup: BeautifulSoup) -> list[dict[str, Any]]:
    text = " ".join(soup.get_text(" ", strip=True).split())
    start = text.find("Active Skills")
    if start < 0:
        return []
    end_candidates = [index for label in ("Passive Skills", "Possible Drops") if (index := text.find(label, start + 1)) >= 0]
    end = min(end_candidates) if end_candidates else len(text)
    segment = text[start + len("Active Skills"):end].strip()
    if not segment:
        return []

    entries = re.split(r"(?=Lv\.\s*\d+\s+)", segment)
    skills: list[dict[str, Any]] = []
    element_pattern = "|".join(sorted((re.escape(value) for value in ELEMENTS), key=len, reverse=True))
    for entry in entries:
        entry = " ".join(entry.split()).strip()
        if not entry.startswith("Lv."):
            continue
        header = re.match(rf"^Lv\.\s*(\d+)\s+(.+?)\s+({element_pattern})\s+", entry)
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
path.write_text(text[:start] + replacement + text[end + 1:], encoding="utf-8")
print("Repaired", path)
