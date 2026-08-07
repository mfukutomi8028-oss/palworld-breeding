#!/usr/bin/env python3
"""One-time self-deleting patch used by the v111 data generation workflow."""

from pathlib import Path

parser_path = Path("scripts/build-paldb-details-v111.py")
source = parser_path.read_text(encoding="utf-8")
start = source.index("def parse_partner_skill")
end = source.index("\n\ndef parse_drops", start)
replacement = '''def parse_partner_skill(soup: BeautifulSoup) -> dict[str, Any]:
    # PalDB renders the compact top card more consistently than the lower
    # Partner Skill detail section. Find a label followed by a Lv.1 name.
    tokens = [" ".join(text.split()).strip() for text in soup.stripped_strings if text.strip()]
    stop_keys = {
        "作業適性", "worksuitability", "食事量", "food", "stats", "movement",
        "breedingfarm", "map", "summary", "activeskills", "passiveskills",
    }
    label_keys = {"パートナースキル", "partnerskill"}

    for index, token in enumerate(tokens):
        if norm(token) not in label_keys:
            continue
        name = ""
        description_start = index + 1
        for offset in range(index + 1, min(index + 8, len(tokens))):
            candidate = tokens[offset]
            if norm(candidate) in {"image", "lv", "lv."}:
                continue
            combined = re.fullmatch(r"(.+?)\\s+Lv\\.?\\s*\\d+", candidate, re.IGNORECASE)
            if combined:
                name = combined.group(1).strip()
                description_start = offset + 1
                break
            if offset + 1 < len(tokens) and re.fullmatch(r"Lv\\.?\\s*\\d+", tokens[offset + 1], re.IGNORECASE):
                name = candidate.strip()
                description_start = offset + 2
                break
        if not name:
            continue

        description_parts: list[str] = []
        for candidate in tokens[description_start:]:
            candidate_key = norm(candidate)
            if candidate_key in stop_keys:
                break
            if candidate_key in {"image", "lv", "lv."}:
                continue
            description_parts.append(candidate)
            if len(" ".join(description_parts)) >= 600:
                break
        description = " ".join(description_parts)
        mount_types = infer_mount_types(description)
        return {
            "name": name,
            "effectTags": infer_effect_tags(description, mount_types),
            "mountTypes": mount_types,
        }

    # Fallback for layouts where only the lower detail heading is exposed.
    heading = find_heading(
        soup,
        lambda value: value.casefold().startswith("partner skill:")
        or value.startswith("パートナースキル:")
        or value.startswith("パートナースキル："),
    )
    if heading is None:
        return {"name": "", "effectTags": [], "mountTypes": []}
    title = heading_text(heading)
    name = re.split(r"[:：]", title, maxsplit=1)[1].strip() if re.search(r"[:：]", title) else ""
    description = " ".join(partner_description_tokens(heading, name))
    mount_types = infer_mount_types(description)
    return {
        "name": name,
        "effectTags": infer_effect_tags(description, mount_types),
        "mountTypes": mount_types,
    }
'''
parser_path.write_text(source[:start] + replacement + source[end:], encoding="utf-8")
Path(__file__).unlink()
print("Applied robust compact-card partner skill parser and removed temporary patch.")
