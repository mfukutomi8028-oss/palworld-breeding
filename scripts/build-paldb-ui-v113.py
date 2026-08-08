#!/usr/bin/env python3
"""Build supplemental PalDB UI data for the Palworld breeding note.

The snapshot remains separate from the core room/Firebase data. v114 fixes the
PalDB Possible Drops parser so item names, quantities, level requirements and
condition markers are stored independently instead of shifting columns.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import datetime as dt
import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

from bs4 import BeautifulSoup, Tag

EXPECTED_COUNT = 299
USER_AGENT = "pal-breeding-note/1.0 v114 PalDB UI snapshot builder"
CDN_BASE = "https://cdn.paldb.cc/image/Pal/Texture/UI/InGame"

ELEMENT_ICON_INDEX = {
    "無属性": 0,
    "炎属性": 1,
    "水属性": 2,
    "雷属性": 3,
    "草属性": 4,
    "闇属性": 5,
    "竜属性": 6,
    "地属性": 7,
    "氷属性": 8,
}
WORK_ICON_INDEX = {
    "火おこし": 0,
    "水やり": 1,
    "種まき": 2,
    "発電": 3,
    "手作業": 4,
    "採集": 5,
    "伐採": 6,
    "採掘": 7,
    "製薬": 8,
    "冷却": 9,
    "運搬": 10,
    "牧場": 11,
}

PERCENT_RE = re.compile(r"\b\d+(?:\.\d+)?%")
DROP_NUMBER_RE = re.compile(r"(?<![\d.])(?:x\s*)?(\d+(?:\s*[–—-]\s*\d+)?)(?!\s*%)(?![\d.])", re.IGNORECASE)


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
            time.sleep(1.1 * (attempt + 1))
    raise RuntimeError(f"{url}: {last_error}")


def absolute_asset_url(value: str, page_url: str) -> str:
    raw = str(value or "").strip()
    if not raw:
        return ""
    return urllib.parse.urljoin(page_url, raw)


def img_src(tag: Tag | None, page_url: str) -> str:
    if tag is None:
        return ""
    for key in ("src", "data-src", "data-original", "data-lazy-src"):
        value = tag.get(key)
        if value:
            return absolute_asset_url(str(value), page_url)
    source = tag.find("source") if hasattr(tag, "find") else None
    if source:
        srcset = source.get("srcset") or source.get("data-srcset")
        if srcset:
            return absolute_asset_url(str(srcset).split()[0], page_url)
    return ""


def clean_description(parts: list[str]) -> str:
    text = " ".join(" ".join(str(part).split()) for part in parts if str(part).strip())
    text = re.sub(r"\s+([。、！？）】])", r"\1", text)
    text = re.sub(r"([（【])\s+", r"\1", text)
    text = re.sub(r"\s{2,}", " ", text).strip()
    return text[:1200]


def partner_icon_from_record(record: dict[str, Any]) -> str:
    icon_id = record.get("partnerSkillIconId")
    if icon_id is None or str(icon_id).strip() == "":
        return ""
    return f"{CDN_BASE}/T_icon_skill_pal_{str(icon_id).strip().zfill(3)}.webp"


def find_partner_icon(soup: BeautifulSoup, page_url: str) -> str:
    for image in soup.find_all("img"):
        src = img_src(image, page_url)
        if re.search(r"T_icon_skill_pal_[^/]+\.webp(?:\?|$)", src, re.IGNORECASE):
            return src
    return ""


def parse_partner_skill(soup: BeautifulSoup, record: dict[str, Any], page_url: str) -> dict[str, str]:
    tokens = [" ".join(text.split()).strip() for text in soup.stripped_strings if text.strip()]
    stop = {
        "作業適性",
        "worksuitability",
        "食事量",
        "food",
        "stats",
        "movement",
        "breedingfarm",
        "map",
        "summary",
        "activeskills",
        "passiveskills",
    }
    labels = {"パートナースキル", "partnerskill"}
    name = ""
    description = ""

    for index, token in enumerate(tokens):
        if norm(token) not in labels:
            continue
        description_start = index + 1
        for offset in range(index + 1, min(index + 10, len(tokens))):
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
        parts: list[str] = []
        for candidate in tokens[description_start:]:
            key = norm(candidate)
            if key in stop:
                break
            if key in {"image", "lv", "lv."}:
                continue
            if re.fullmatch(r"Lv\.?\s*\d+", candidate, re.IGNORECASE):
                continue
            parts.append(candidate)
            if len(" ".join(parts)) >= 1200:
                break
        description = clean_description(parts)
        break

    # Prefer the icon actually exposed by the current PalDB page. The local
    # source record remains a fallback only when the page does not expose one.
    icon = find_partner_icon(soup, page_url) or partner_icon_from_record(record)
    return {"name": name, "description": description, "icon": icon}


def find_heading(soup: BeautifulSoup, title: str) -> Tag | None:
    wanted = norm(title)
    for heading in soup.find_all(re.compile(r"^h[1-6]$", re.IGNORECASE)):
        if norm(heading.get_text(" ", strip=True)) == wanted:
            return heading
    return None


def normalize_drop_number(value: str) -> str:
    return re.sub(r"\s+", "", str(value or "").replace("—", "–").replace("-", "–"))


def extract_drop_numbers(text: str, item: str, probability: str) -> list[str]:
    working = " ".join(str(text or "").split())
    if item:
        working = working.replace(item, " ")
    if probability:
        working = working.replace(probability, " ")
    working = re.sub(r"\b(?:item|qty|quantity|probability|level|lv\.?)\b", " ", working, flags=re.IGNORECASE)
    return [normalize_drop_number(match.group(1)) for match in DROP_NUMBER_RE.finditer(working)]


def condition_icon_from_row(row: Tag, item_icon: str, page_url: str) -> str:
    for image in row.find_all("img"):
        src = img_src(image, page_url)
        if not src or src == item_icon:
            continue
        if "itemicon" in src.casefold():
            continue
        return src
    return ""


def parse_drops(soup: BeautifulSoup, page_url: str) -> list[dict[str, Any]]:
    heading = find_heading(soup, "Possible Drops")
    if heading is None:
        return []
    table = heading.find_next("table")
    if table is None:
        return []

    drops: list[dict[str, Any]] = []
    for row in table.find_all("tr"):
        cells = row.find_all(["th", "td"])
        if len(cells) < 2:
            continue
        row_text = " ".join(row.get_text(" ", strip=True).split())
        if not row_text or norm(row_text).startswith("item"):
            continue

        link = row.find("a", href=True)
        item = " ".join(link.get_text(" ", strip=True).split()) if link else ""
        if not item:
            first_text = " ".join(cells[0].get_text(" ", strip=True).split())
            if norm(first_text) in {"item", "アイテム"}:
                continue
            item = first_text

        percentages = PERCENT_RE.findall(row_text)
        probability = percentages[-1] if percentages else ""
        if not probability:
            continue

        # PalDB's responsive markup may repeat Qty/Level/Probability inside the
        # first visual cell. Once the exact item-link label and probability are
        # removed, the first two numeric tokens are respectively Qty and Level.
        numbers = extract_drop_numbers(cells[0].get_text(" ", strip=True), item, probability)
        if not numbers:
            numbers = extract_drop_numbers(row_text, item, probability)
        quantity = numbers[0] if numbers else ""
        level = numbers[1] if len(numbers) >= 2 and re.fullmatch(r"\d+", numbers[1]) else ""

        item_image = cells[0].find("img")
        icon = img_src(item_image, page_url)
        condition_icon = condition_icon_from_row(row, icon, page_url)
        item_url = urllib.parse.urljoin(page_url, str(link.get("href"))) if link else ""
        marker_text = " ".join(
            " ".join(filter(None, [str(image.get("alt") or ""), str(image.get("title") or ""), " ".join(image.get("class") or [])]))
            for image in row.find_all("img")
        )
        is_boss = bool(condition_icon) or bool(re.search(r"boss|alpha|ボス|強敵", marker_text, re.IGNORECASE))

        drops.append(
            {
                "item": item,
                "quantity": quantity,
                "probability": probability,
                "level": level,
                "conditionIcon": condition_icon,
                "isBoss": is_boss,
                "icon": icon,
                "sourceUrl": item_url,
            }
        )
    return drops[:40]


def parse_page(record: dict[str, Any]) -> dict[str, Any]:
    en_url = str(record.get("sourceUrl") or "").strip()
    if not en_url:
        raise RuntimeError(f"{record.get('name')}: sourceUrl missing")
    page_url = japanese_url(en_url)
    soup = BeautifulSoup(fetch_html(page_url), "html.parser")
    return {
        "number": str(record.get("number") or ""),
        "name": str(record.get("name") or ""),
        "sourceUrl": page_url,
        "partnerSkill": parse_partner_skill(soup, record, page_url),
        "drops": parse_drops(soup, page_url),
    }


def find_drop(record: dict[str, Any], item: str, level: str = "") -> dict[str, Any] | None:
    return next((drop for drop in record["drops"] if drop["item"] == item and drop.get("level", "") == level), None)


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
        raise RuntimeError("PalDB UI generation failed:\n" + "\n".join(failures))

    final_records = [item for item in results if item is not None]
    if len(final_records) != EXPECTED_COUNT:
        raise RuntimeError(f"Generated {len(final_records)} records")

    lamball = next(item for item in final_records if item["name"] == "Lamball")
    if lamball["partnerSkill"]["name"] != "モコモコの盾":
        raise RuntimeError(f"Lamball partner skill mismatch: {lamball['partnerSkill']}")
    if not lamball["partnerSkill"]["description"]:
        raise RuntimeError("Lamball partner skill description is empty")
    wool = find_drop(lamball, "羊毛")
    if not wool or wool["quantity"] != "1–3" or wool["probability"] != "100%" or wool["level"]:
        raise RuntimeError(f"Lamball wool drop mismatch: {wool}")

    lyleen = next(item for item in final_records if item["name"] == "Lyleen")
    fixed_checks = [
        ("高品質な回復薬", "", "1–3", "100%"),
        ("きれいな花", "", "1–2", "100%"),
        ("革新的な技術書", "", "1", "10%"),
        ("世界樹の聖水", "70", "1–3", "50%"),
        ("古代文明の朽ちた遺物", "70", "1–10", "10%"),
        ("草の輝石", "80", "10–20", "100%"),
        ("古代文明の朽ちた遺物", "80", "30–50", "100%"),
    ]
    for item_name, level, quantity, probability in fixed_checks:
        drop = find_drop(lyleen, item_name, level)
        if not drop or drop["quantity"] != quantity or drop["probability"] != probability:
            raise RuntimeError(f"Lyleen drop mismatch {item_name} Lv.{level or '-'}: {drop}")
        if re.search(r"\s\d+(?:[–—-]\d+)?$", drop["item"]):
            raise RuntimeError(f"Quantity leaked into Lyleen item label: {drop['item']}")

    element_icons = {
        label: f"{CDN_BASE}/T_Icon_element_s_{index:02d}.webp"
        for label, index in ELEMENT_ICON_INDEX.items()
    }
    work_icons = {
        label: f"{CDN_BASE}/T_icon_palwork_{index:02d}.webp"
        for label, index in WORK_ICON_INDEX.items()
    }

    descriptions = sum(bool(item["partnerSkill"]["description"]) for item in final_records)
    partner_icons = sum(bool(item["partnerSkill"]["icon"]) for item in final_records)
    drop_rows = [drop for item in final_records for drop in item["drops"]]
    drop_icons = sum(bool(drop["icon"]) for drop in drop_rows)
    condition_icons = sum(bool(drop.get("conditionIcon")) for drop in drop_rows)
    boss_rows = sum(bool(drop.get("isBoss")) for drop in drop_rows)
    level_rows = sum(bool(drop.get("level")) for drop in drop_rows)

    output = {
        "source": "PalDB Japanese individual Pal pages",
        "sourceUrl": "https://paldb.cc/ja/Pals",
        "gameVersion": "Palworld 1.0",
        "schemaVersion": 114,
        "retrieved": dt.date.today().isoformat(),
        "count": len(final_records),
        "fields": {
            "partnerSkill.description": "Japanese partner-skill effect text shown by PalDB",
            "partnerSkill.icon": "PalDB partner-skill icon exposed by the current Pal page",
            "drops.quantity": "Drop quantity/range independent from item name",
            "drops.level": "Optional PalDB drop level condition",
            "drops.conditionIcon": "Optional additional PalDB condition marker from the drop row",
            "drops.isBoss": "Whether the row carries a PalDB boss/special-condition marker",
            "drops.icon": "PalDB Possible Drops item icon",
            "elementIcons": "PalDB element icon URLs",
            "workIcons": "PalDB work-suitability icon URLs",
        },
        "coverage": {
            "partnerDescriptions": descriptions,
            "partnerIcons": partner_icons,
            "dropRows": len(drop_rows),
            "dropIcons": drop_icons,
            "levelRows": level_rows,
            "conditionIcons": condition_icons,
            "bossRows": boss_rows,
        },
        "elementIcons": element_icons,
        "workIcons": work_icons,
        "records": final_records,
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(
        f"Built {len(final_records)} records; descriptions={descriptions}, partnerIcons={partner_icons}, "
        f"dropIcons={drop_icons}/{len(drop_rows)}, levelRows={level_rows}, conditionIcons={condition_icons}, bossRows={boss_rows}"
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pals", default="data/pals-v1.json")
    parser.add_argument("--output", default="data/pal-ui-v113.json")
    parser.add_argument("--workers", type=int, default=4)
    args = parser.parse_args()
    build(Path(args.pals), Path(args.output), args.workers)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
