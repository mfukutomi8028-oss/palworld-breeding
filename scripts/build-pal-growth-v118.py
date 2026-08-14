#!/usr/bin/env python3
"""Build fixed PalDB growth data for Palworld 1.0.

Stores structured, factual fields only: five partner-skill levels, learnset
levels/elements/CT/power/status metadata. Long prose is intentionally not copied.
"""
from __future__ import annotations

import concurrent.futures
import datetime as dt
import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

from bs4 import BeautifulSoup, NavigableString, Tag

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data" / "pals-v1.json"
OUTPUT = ROOT / "data" / "pal-growth-v1.json"
EXPECTED = 299
USER_AGENT = "pal-breeding-note/1.0 growth snapshot builder"
HEADINGS = re.compile(r"^h[1-6]$", re.I)
ELEMENTS = {"無属性", "炎属性", "水属性", "草属性", "雷属性", "氷属性", "地属性", "闇属性", "竜属性"}
ELEMENT_CODE = {
    "Normal": "無", "Fire": "炎", "Aqua": "水", "Water": "水", "Leaf": "草",
    "Electric": "雷", "Ice": "氷", "Earth": "地", "Ground": "地", "Dark": "闇", "Dragon": "竜",
}


def norm(value: Any) -> str:
    return re.sub(r"[\s:：・_\-/]+", "", str(value or "").strip().casefold())


def source_slug(url: str) -> str:
    path = urllib.parse.urlparse(url).path.rstrip("/")
    return urllib.parse.unquote(path.rsplit("/", 1)[-1])


def japanese_url(url: str) -> str:
    slug = source_slug(url)
    return f"https://paldb.cc/ja/{urllib.parse.quote(slug, safe='_')}"


def fetch_html(url: str, retries: int = 5) -> str:
    last: Exception | None = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={
                "User-Agent": USER_AGENT,
                "Accept": "text/html,application/xhtml+xml",
                "Accept-Language": "ja,en;q=0.6",
            })
            with urllib.request.urlopen(req, timeout=90) as response:
                if response.status != 200:
                    raise RuntimeError(f"HTTP {response.status}")
                return response.read().decode("utf-8", errors="replace")
        except Exception as error:  # noqa: BLE001
            last = error
            time.sleep(1.0 + attempt * 1.2)
    raise RuntimeError(f"{url}: {last}")


def heading_text(tag: Tag) -> str:
    return " ".join(tag.get_text(" ", strip=True).split())


def find_heading(soup: BeautifulSoup, predicate) -> Tag | None:
    for tag in soup.find_all(HEADINGS):
        if predicate(heading_text(tag)):
            return tag
    return None


def section_nodes(heading: Tag):
    level = int(heading.name[1]) if heading.name and heading.name[1:].isdigit() else 6
    node = heading.next_sibling
    while node is not None:
        if isinstance(node, Tag) and HEADINGS.fullmatch(node.name or ""):
            other_level = int(node.name[1]) if node.name[1:].isdigit() else 6
            if other_level <= level:
                break
        yield node
        node = node.next_sibling


def section_tokens(heading: Tag) -> list[str]:
    result: list[str] = []
    for node in section_nodes(heading):
        if isinstance(node, NavigableString):
            text = " ".join(str(node).split())
            if text:
                result.append(text)
        elif isinstance(node, Tag):
            result.extend(" ".join(text.split()) for text in node.stripped_strings if text.strip())
    if result:
        return result
    # Fallback for PalDB layouts where headings and content sit in nested wrappers.
    for element in heading.next_elements:
        if element is heading:
            continue
        if isinstance(element, Tag) and HEADINGS.fullmatch(element.name or ""):
            break
        if isinstance(element, NavigableString):
            text = " ".join(str(element).split())
            if text:
                result.append(text)
    return result


def find_partner_heading(soup: BeautifulSoup) -> Tag | None:
    candidates = []
    for tag in soup.find_all(HEADINGS):
        text = heading_text(tag)
        key = norm(text)
        if key.startswith(norm("Partner Skill:")) or key.startswith(norm("パートナースキル:")) or key.startswith(norm("パートナースキル：")):
            candidates.append(tag)
    return candidates[0] if candidates else None


def next_table_in_section(heading: Tag) -> Tag | None:
    for node in section_nodes(heading):
        if isinstance(node, Tag):
            if node.name == "table":
                return node
            nested = node.find("table")
            if nested is not None:
                return nested
    table = heading.find_next("table")
    return table


def unique_numbers(text: str) -> list[str]:
    values: list[str] = []
    for match in re.findall(r"(?<![A-Za-z_])(-?\d+(?:\.\d+)?)%?", text):
        if match not in values:
            values.append(match)
    return values


def decode_partner_effects(raw: str) -> list[str]:
    text = " ".join(str(raw or "").split())
    effects: list[str] = []

    def add(label: str):
        if label and label not in effects:
            effects.append(label)

    for code, jp in ELEMENT_CODE.items():
        match = re.search(rf"ElementAddDrop_{code}_\d+_PAL\s+(\d+(?:\.\d+)?)", text, re.I)
        if match:
            add(f"{jp}属性パルのドロップ +{match.group(1)}%")
    patterns = [
        (r"TrainerDEF_UP[^\d-]*(-?\d+(?:\.\d+)?)", "プレイヤー防御 +{}%"),
        (r"TrainerATK_UP[^\d-]*(-?\d+(?:\.\d+)?)", "プレイヤー攻撃 +{}%"),
        (r"MoveSpeed_up[^\d-]*(-?\d+(?:\.\d+)?)", "ライド移動速度 +{}%"),
        (r"MaxWeight[^\d-]*(-?\d+(?:\.\d+)?)", "所持重量 +{}"),
        (r"Weight[^\d-]*(-?\d+(?:\.\d+)?)", "所持重量 +{}"),
        (r"WorkSpeed[^\d-]*(-?\d+(?:\.\d+)?)", "作業速度 +{}%"),
        (r"PlayerATK[^\d-]*(-?\d+(?:\.\d+)?)", "プレイヤー攻撃 +{}%"),
        (r"PlayerDEF[^\d-]*(-?\d+(?:\.\d+)?)", "プレイヤー防御 +{}%"),
        (r"Heal[^\d-]*(-?\d+(?:\.\d+)?)", "回復効果 {}"),
    ]
    for pattern, template in patterns:
        match = re.search(pattern, text, re.I)
        if match:
            add(template.format(match.group(1)))

    boost = re.search(r"ElementBoost_([A-Za-z]+)[^\d-]*(-?\d+(?:\.\d+)?)", text, re.I)
    if boost:
        add(f"{ELEMENT_CODE.get(boost.group(1), boost.group(1))}属性ダメージ +{boost.group(2)}%")

    cleaned = re.sub(r"覚醒\s*[:：].*$", "", text).strip()
    if not effects and cleaned and not re.search(r"_[A-Za-z0-9_]+", cleaned):
        add(cleaned)
    if not effects:
        nums = unique_numbers(cleaned)
        if nums:
            add("効果値 " + " / ".join(nums[:4]))
        elif cleaned:
            add(cleaned[:120])
    return effects[:5]


def parse_partner_stars(soup: BeautifulSoup) -> tuple[str, list[dict[str, Any]]]:
    heading = find_partner_heading(soup)
    if heading is None:
        return "", []
    title = heading_text(heading)
    partner_name = re.split(r"[:：]", title, maxsplit=1)[1].strip() if re.search(r"[:：]", title) else ""
    table = next_table_in_section(heading)
    rows: list[dict[str, Any]] = []
    if table is None:
        return partner_name, rows
    for tr in table.find_all("tr"):
        cells = [" ".join(cell.get_text(" ", strip=True).split()) for cell in tr.find_all(["th", "td"])]
        if len(cells) < 2:
            continue
        match = re.search(r"\d+", cells[0])
        if not match:
            continue
        level = int(match.group())
        if level < 1 or level > 5:
            continue
        raw = " ".join(cells[1:]).strip()
        rows.append({
            "star": level - 1,
            "partnerLevel": level,
            "effects": decode_partner_effects(raw),
            "rawValue": raw[:300],
        })
    rows.sort(key=lambda row: row["star"])
    return partner_name, rows[:5]


def skill_headings(active_heading: Tag):
    started = False
    for tag in active_heading.find_all_next(HEADINGS):
        if tag is active_heading:
            started = True
            continue
        if not started:
            continue
        text = heading_text(tag)
        if norm(text) in {norm("Passive Skills"), norm("Possible Drops"), norm("パッシブスキル"), norm("ドロップ")}: 
            break
        match = re.match(r"^Lv\.?\s*(\d+)\s+(.+)$", text, re.I)
        if match:
            yield tag, int(match.group(1)), match.group(2).strip()


def effect_tags_from_text(text: str) -> list[str]:
    rules = [
        (("専用スキル",), "専用"), (("戦闘不能", "命をかけ", "自爆"), "自爆"),
        (("回復", "HPを回復", "体力を回復"), "回復"), (("シールド",), "シールド"),
        (("追いかけ", "追尾", "ホーミング"), "追尾"), (("広範囲", "周囲", "範囲"), "範囲攻撃"),
        (("チャージ",), "チャージ"), (("突進", "突っ込", "体当たり"), "突進"),
        (("連続", "いくつも", "複数"), "多段/複数"), (("引き寄せ",), "引き寄せ"),
    ]
    tags: list[str] = []
    for keywords, label in rules:
        if any(keyword in text for keyword in keywords):
            tags.append(label)
    return tags


def parse_active_skills(soup: BeautifulSoup) -> list[dict[str, Any]]:
    active = find_heading(soup, lambda value: norm(value) == norm("Active Skills"))
    if active is None:
        return []
    skills: list[dict[str, Any]] = []
    for heading, level, name in skill_headings(active):
        tokens = section_tokens(heading)
        joined = " ".join(tokens)
        element = next((token for token in tokens if token in ELEMENTS), "")
        power_match = re.search(r"威力\s*[:：]?\s*(\d+)", joined)
        power = int(power_match.group(1)) if power_match else None
        ct = None
        power_index = next((i for i, token in enumerate(tokens) if token.startswith("威力")), len(tokens))
        for token in reversed(tokens[:power_index]):
            value = re.fullmatch(r"(?:Image\s*:\s*)?(\d+)", token)
            if value:
                ct = int(value.group(1))
                break
        statuses: list[dict[str, Any]] = []
        for match in re.finditer(r"蓄積値\s*[:：]?\s*([^\d]+?)\s+(\d+)", joined):
            label = " ".join(match.group(1).split()).strip(" :：")
            if label:
                statuses.append({"name": label[:30], "value": int(match.group(2))})
        effects = effect_tags_from_text(joined)
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
            "exclusive": "専用スキル" in joined,
        })
    # PalDB may render the same Active Skills section twice; dedupe by level/name.
    deduped: list[dict[str, Any]] = []
    seen = set()
    for skill in skills:
        key = (skill["level"], skill["name"])
        if key in seen:
            continue
        seen.add(key)
        deduped.append(skill)
    return sorted(deduped, key=lambda skill: (skill["level"], skill["name"]))


def parse_record(record: dict[str, Any]) -> dict[str, Any]:
    en_url = str(record.get("sourceUrl") or "").strip()
    if not en_url:
        raise RuntimeError(f"{record.get('name')}: sourceUrl missing")
    url = japanese_url(en_url)
    soup = BeautifulSoup(fetch_html(url), "html.parser")
    partner_name, stars = parse_partner_stars(soup)
    skills = parse_active_skills(soup)
    return {
        "number": str(record.get("number") or ""),
        "enName": str(record.get("name") or ""),
        "sourceUrl": url,
        "partnerSkill": {"name": partner_name, "stars": stars},
        "activeSkills": skills,
    }


def main() -> None:
    payload = json.loads(SOURCE.read_text(encoding="utf-8"))
    records = payload.get("records") or []
    if len(records) != EXPECTED:
        raise SystemExit(f"Expected {EXPECTED} Pals, got {len(records)}")

    results: list[dict[str, Any] | None] = [None] * len(records)
    failures: list[str] = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        future_map = {pool.submit(parse_record, record): index for index, record in enumerate(records)}
        for future in concurrent.futures.as_completed(future_map):
            index = future_map[future]
            try:
                results[index] = future.result()
                print(f"[{index+1:03d}/{EXPECTED}] {records[index].get('name')}")
            except Exception as error:  # noqa: BLE001
                failures.append(f"{records[index].get('name')}: {error}")
                print("FAILED", failures[-1])
    if failures:
        raise SystemExit("\n".join(failures[:30]))

    final = [row for row in results if row is not None]
    if len(final) != EXPECTED:
        raise SystemExit(f"Generated {len(final)}/{EXPECTED}")
    partner_coverage = sum(1 for row in final if row["partnerSkill"]["stars"])
    skill_coverage = sum(1 for row in final if row["activeSkills"])
    output = {
        "gameVersion": "Palworld 1.0",
        "retrieved": dt.date.today().isoformat(),
        "sources": {
            "partnerSkillAndLearnset": "PalDB Japanese individual Pal pages",
            "partnerSkillSource": "https://paldb.cc/ja/",
            "condensationRules": "https://palworld.wiki.gg/wiki/Pal_Condensation",
        },
        "count": len(final),
        "partnerStarCoverage": partner_coverage,
        "activeSkillCoverage": skill_coverage,
        "records": final,
    }
    OUTPUT.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUTPUT}: partner stars {partner_coverage}/{EXPECTED}, active skills {skill_coverage}/{EXPECTED}")


if __name__ == "__main__":
    main()
