#!/usr/bin/env python3
"""Build a fixed Japanese PalDB detail snapshot for the 299 Palworld 1.0 Pals.

The output intentionally stores structured facts and short labels only. Long
PalDB prose (summary and full partner-skill descriptions) is not copied into
the repository. Partner-skill descriptions are used only to derive concise
Japanese effect categories and mount types.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import datetime as dt
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any, Iterable

from bs4 import BeautifulSoup, NavigableString, Tag

EXPECTED_COUNT = 299
USER_AGENT = "pal-breeding-note/1.0 PalDB Japanese detail snapshot builder"
HEADINGS = re.compile(r"^h[1-6]$", re.IGNORECASE)
NOISE = {"image", "item", "probability", "lv.", "lv", "-"}


def norm(value: Any) -> str:
    return re.sub(r"[\s:：・_\-/]+", "", str(value or "").strip().casefold())


def source_slug(url: str) -> str:
    path = urllib.parse.urlparse(url).path.rstrip("/")
    return urllib.parse.unquote(path.rsplit("/", 1)[-1])


def japanese_url(url: str) -> str:
    parsed = urllib.parse.urlparse(url)
    slug = source_slug(url)
    return urllib.parse.urlunparse(
        (
            parsed.scheme or "https",
            parsed.netloc or "paldb.cc",
            f"/ja/{urllib.parse.quote(slug, safe='_')}",
            "",
            "",
            "",
        )
    )


def fetch_html(url: str, retries: int = 4) -> str:
    last_error: Exception | None = None
    for attempt in range(retries):
        try:
            request = urllib.request.Request(
                url,
                headers={
                    "User-Agent": USER_AGENT,
                    "Accept": "text/html,application/xhtml+xml",
                    "Accept-Language": "ja,en;q=0.7",
                },
            )
            with urllib.request.urlopen(request, timeout=90) as response:
                if response.status != 200:
                    raise RuntimeError(f"HTTP {response.status}")
                return response.read().decode("utf-8", errors="replace")
        except Exception as error:  # noqa: BLE001
            last_error = error
            time.sleep(1.2 * (attempt + 1))
    raise RuntimeError(f"{url}: {last_error}")


def heading_text(heading: Tag) -> str:
    return " ".join(heading.get_text(" ", strip=True).split())


def find_heading(soup: BeautifulSoup, matcher) -> Tag | None:
    for heading in soup.find_all(HEADINGS):
        if matcher(heading_text(heading)):
            return heading
    return None


def section_tokens(heading: Tag) -> list[str]:
    tokens: list[str] = []
    current = heading.next_sibling
    while current is not None:
        if isinstance(current, Tag) and HEADINGS.fullmatch(current.name or ""):
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

    for element in heading.next_elements:
        if element is heading:
            continue
        if isinstance(element, Tag) and HEADINGS.fullmatch(element.name or ""):
            break
        if isinstance(element, NavigableString):
            text = " ".join(str(element).split())
            if text:
                tokens.append(text)
    return tokens


def clean_tokens(tokens: Iterable[str]) -> list[str]:
    result: list[str] = []
    for token in tokens:
        text = " ".join(str(token).split()).strip()
        if not text or norm(text) in NOISE:
            continue
        if text not in result:
            result.append(text)
    return result


def first_after(tokens: list[str], labels: Iterable[str]) -> str | None:
    keys = {norm(label) for label in labels}
    label_like = {
        "size", "rarity", "hp", "health", "食事量", "food", "meleeattack", "攻撃", "attack", "防御", "defense",
        "作業速度", "workspeed", "support", "captureratecorrect", "maleprobability", "combirank", "金貨", "goldcoin",
        "egg", "code", "slowwalkspeed", "walkspeed", "runspeed", "ridesprintspeed", "transportspeed", "swimspeed",
        "swimdashspeed", "stamina",
    }
    for index, token in enumerate(tokens):
        if norm(token) not in keys:
            continue
        for candidate in tokens[index + 1 :]:
            candidate_norm = norm(candidate)
            if not candidate_norm or candidate_norm in NOISE:
                continue
            if candidate_norm in label_like:
                break
            return candidate.strip()
    return None


def number_after(tokens: list[str], labels: Iterable[str]) -> int | float | None:
    value = first_after(tokens, labels)
    if value is None:
        return None
    match = re.search(r"-?\d+(?:\.\d+)?", value.replace(",", ""))
    if not match:
        return None
    number = float(match.group())
    return int(number) if number.is_integer() else number


def partner_description_tokens(heading: Tag, name: str) -> list[str]:
    result: list[str] = []
    for token in section_tokens(heading):
        text = " ".join(str(token).split()).strip()
        token_norm = norm(text)
        if not text or token_norm in {"image"} or text == name:
            continue
        if token_norm in {"lv", "lv.", "item", "probability"} or re.fullmatch(r"Lv\.?", text, re.IGNORECASE):
            break
        if re.fullmatch(r"\d+(?:\.\d+)?%?", text):
            continue
        result.append(text)
        if len(" ".join(result)) >= 600:
            break
    return result


def infer_mount_types(description: str) -> list[str]:
    text = str(description or "")
    types: list[str] = []
    air = any(keyword in text for keyword in ("飛行", "空中", "空を飛", "飛んで移動", "飛び回"))
    water = any(keyword in text for keyword in ("水上", "水面", "泳いで移動", "水中"))
    ride = any(keyword in text for keyword in ("背中に乗", "乗って移動", "乗ることが", "ライド", "騎乗", "搭乗"))
    if air:
        types.append("空中")
    if water:
        types.append("水上")
    if ride and not air and not water:
        types.append("陸上")
    return types


def infer_effect_tags(description: str, mount_types: list[str]) -> list[str]:
    text = str(description or "")
    tags: list[str] = []
    tags.extend(f"{mount}騎乗" for mount in mount_types)
    rules = [
        (("家畜牧場", "牧場にアサイン"), "牧場ドロップ"),
        (("グライダー",), "グライダー"),
        (("装備され", "装備すると", "武器として"), "プレイヤー装備"),
        (("追撃", "援護射撃", "一緒に戦"), "戦闘支援"),
        (("所持重量",), "所持重量増加"),
        (("回復", "HPを", "体力を"), "回復支援"),
        (("攻撃力が", "与えるダメージ", "ダメージが"), "攻撃強化"),
        (("防御力", "受けるダメージ"), "防御支援"),
        (("移動速度",), "移動強化"),
        (("作業速度",), "作業強化"),
        (("属性を付与", "属性に変化", "属性ダメージ"), "属性効果"),
        (("捕獲", "捕まえ"), "捕獲支援"),
        (("採掘",), "採掘支援"),
        (("伐採",), "伐採支援"),
        (("冷却",), "冷却支援"),
    ]
    for keywords, label in rules:
        if any(keyword in text for keyword in keywords) and label not in tags:
            tags.append(label)
    return tags[:8]


def parse_partner_skill(soup: BeautifulSoup) -> dict[str, Any]:
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
            combined = re.fullmatch(r"(.+?)\s+Lv\.?\s*\d+", candidate, re.IGNORECASE)
            if combined:
                name = combined.group(1).strip()
                description_start = offset + 1
                break
            if offset + 1 < len(tokens) and re.fullmatch(r"Lv\.?\s*\d+", tokens[offset + 1], re.IGNORECASE):
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


def parse_drops(soup: BeautifulSoup) -> list[dict[str, str]]:
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
        item = re.sub(r"\s+\d+(?:[–—-]\d+)?$", "", item).strip()
        if not item:
            continue
        drops.append({"item": item, "probability": probability})
    return drops[:20]


def value_or(value: Any, fallback: Any) -> Any:
    return fallback if value is None or value == "" else value


def parse_page(record: dict[str, Any]) -> dict[str, Any]:
    en_url = str(record.get("sourceUrl") or "").strip()
    if not en_url:
        raise RuntimeError(f"{record.get('name')}: sourceUrl missing")
    url = japanese_url(en_url)
    soup = BeautifulSoup(fetch_html(url), "html.parser")

    stats_heading = find_heading(soup, lambda value: norm(value) == "stats")
    movement_heading = find_heading(soup, lambda value: norm(value) == "movement")
    if stats_heading is None or movement_heading is None:
        raise RuntimeError(f"{record.get('name')}: Stats or Movement heading missing")
    stats_tokens = section_tokens(stats_heading)
    movement_tokens = section_tokens(movement_heading)
    partner = parse_partner_skill(soup)

    stats = {
        "size": first_after(stats_tokens, ["Size"]),
        "rarity": value_or(number_after(stats_tokens, ["Rarity"]), record.get("rarity")),
        "food": number_after(stats_tokens, ["食事量", "Food"]),
        "meleeAttack": number_after(stats_tokens, ["MeleeAttack"]),
        "workSpeed": number_after(stats_tokens, ["作業速度", "Work Speed"]),
        "support": number_after(stats_tokens, ["Support"]),
        "captureRate": number_after(stats_tokens, ["CaptureRateCorrect"]),
        "maleProbability": number_after(stats_tokens, ["MaleProbability"]),
        "breedingPower": value_or(number_after(stats_tokens, ["CombiRank"]), record.get("breedingPower")),
        "price": value_or(number_after(stats_tokens, ["金貨", "Gold Coin"]), record.get("price")),
        "egg": first_after(stats_tokens, ["Egg"]),
    }
    movement = {
        "slowWalk": number_after(movement_tokens, ["SlowWalkSpeed"]),
        "walk": number_after(movement_tokens, ["WalkSpeed"]),
        "run": value_or(number_after(movement_tokens, ["RunSpeed"]), record.get("run")),
        "rideSprint": value_or(number_after(movement_tokens, ["RideSprintSpeed"]), record.get("rideSprint")),
        "transport": number_after(movement_tokens, ["TransportSpeed"]),
        "swim": number_after(movement_tokens, ["SwimSpeed"]),
        "swimDash": number_after(movement_tokens, ["SwimDashSpeed"]),
        "stamina": value_or(number_after(movement_tokens, ["Stamina"]), record.get("stamina")),
    }
    title = soup.find("h1")
    japanese_name = " ".join(title.get_text(" ", strip=True).split()) if title else ""
    japanese_name = re.sub(r"\s*#\w+\s*$", "", japanese_name).strip()
    return {
        "number": str(record.get("number") or ""),
        "name": str(record.get("name") or ""),
        "japaneseName": japanese_name,
        "sourceUrl": url,
        "partnerSkill": {"name": partner["name"], "effectTags": partner["effectTags"]},
        "stats": stats,
        "movement": movement,
        "mountTypes": partner["mountTypes"],
        "drops": parse_drops(soup),
    }


def build(pals_path: Path, output_path: Path, workers: int) -> None:
    payload = json.loads(pals_path.read_text(encoding="utf-8"))
    records = payload.get("records")
    if not isinstance(records, list) or len(records) != EXPECTED_COUNT:
        raise RuntimeError(f"Expected {EXPECTED_COUNT} Pal records")

    results: list[dict[str, Any] | None] = [None] * len(records)
    failures: list[str] = []

    def task(index_record: tuple[int, dict[str, Any]]) -> tuple[int, dict[str, Any]]:
        index, record = index_record
        return index, parse_page(record)

    with concurrent.futures.ThreadPoolExecutor(max_workers=max(1, workers)) as executor:
        futures = {executor.submit(task, item): item for item in enumerate(records)}
        for future in concurrent.futures.as_completed(futures):
            index, record = futures[future]
            try:
                resolved_index, result = future.result()
                results[resolved_index] = result
                print(f"[{resolved_index + 1:03d}/{EXPECTED_COUNT}] {record.get('name')}")
            except Exception as error:  # noqa: BLE001
                failures.append(f"{index + 1} {record.get('name')}: {error}")

    if failures:
        raise RuntimeError("PalDB detail generation failed:\n" + "\n".join(failures))
    final_records = [item for item in results if item is not None]
    if len(final_records) != EXPECTED_COUNT:
        raise RuntimeError(f"Generated {len(final_records)} records")

    lamball = next(item for item in final_records if item["name"] == "Lamball")
    expected = {
        "food": 100,
        "egg": "平凡なタマゴ",
        "run": 400,
        "rideSprint": 550,
        "swim": 120,
        "swimDash": 165,
        "stamina": 100,
    }
    actual = {
        "food": lamball["stats"]["food"],
        "egg": lamball["stats"]["egg"],
        "run": lamball["movement"]["run"],
        "rideSprint": lamball["movement"]["rideSprint"],
        "swim": lamball["movement"]["swim"],
        "swimDash": lamball["movement"]["swimDash"],
        "stamina": lamball["movement"]["stamina"],
    }
    if actual != expected or lamball["partnerSkill"]["name"] != "モコモコの盾":
        raise RuntimeError(f"Lamball verification failed: {actual}, partner={lamball['partnerSkill']}")

    output = {
        "source": "PalDB Japanese individual Pal pages",
        "sourceUrl": "https://paldb.cc/ja/Pals",
        "gameVersion": "Palworld 1.0",
        "retrieved": dt.date.today().isoformat(),
        "count": len(final_records),
        "copyrightNote": "Structured facts and short labels only; long PalDB descriptions are not stored.",
        "fields": {
            "stats.food": "PalDB Stats panel 食事量",
            "movement": "PalDB Movement panel comparison values",
            "mountTypes": "Classification derived from the Japanese partner-skill description",
            "partnerSkill.effectTags": "Short categories derived from the description; not a copied description",
        },
        "records": final_records,
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Built {len(final_records)} PalDB Japanese detail records")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pals", default="data/pals-v1.json")
    parser.add_argument("--output", default="data/pal-details-v1.json")
    parser.add_argument("--workers", type=int, default=4)
    args = parser.parse_args()
    build(Path(args.pals), Path(args.output), args.workers)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:  # noqa: BLE001
        print(f"ERROR: {error}", file=sys.stderr)
        raise
