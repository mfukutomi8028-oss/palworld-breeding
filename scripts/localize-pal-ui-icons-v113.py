#!/usr/bin/env python3
"""Localize PalDB UI icons referenced by data/pal-ui-v113.json.

The PalDB pages are the data source, but the production site should not depend
on hundreds of third-party image requests at runtime. This script downloads the
verified icon snapshot into the repository and rewrites JSON icon fields to
local paths. Text labels remain the functional fallback in the browser.
"""

from __future__ import annotations

import argparse
import json
import re
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

USER_AGENT = "pal-breeding-note/1.0 v113 icon snapshot localizer"


def safe_basename(url: str) -> str:
    name = urllib.parse.unquote(Path(urllib.parse.urlparse(url).path).name)
    name = re.sub(r"[^A-Za-z0-9._-]+", "_", name)
    if not name or name in {".", ".."}:
        raise RuntimeError(f"Cannot derive icon filename from {url}")
    return name


def download(url: str, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists() and destination.stat().st_size > 0:
        return
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "image/avif,image/webp,image/png,image/*,*/*;q=0.8",
            "Referer": "https://paldb.cc/",
        },
    )
    with urllib.request.urlopen(request, timeout=90) as response:
        data = response.read()
    if not data:
        raise RuntimeError(f"Empty icon response: {url}")
    destination.write_bytes(data)


def localize(url: str, category: str, asset_root: Path, seen: dict[str, str]) -> str:
    raw = str(url or "").strip()
    if not raw:
        return ""
    if not raw.startswith(("http://", "https://")):
        return raw
    if raw in seen:
        return seen[raw]
    relative = Path("assets") / "paldb-ui-v113" / category / safe_basename(raw)
    destination = asset_root.parent / relative
    download(raw, destination)
    local_path = relative.as_posix()
    seen[raw] = local_path
    return local_path


def localize_payload(payload: dict[str, Any], repo_root: Path) -> dict[str, Any]:
    seen: dict[str, str] = {}
    for label, url in list((payload.get("elementIcons") or {}).items()):
        payload["elementIcons"][label] = localize(url, "elements", repo_root, seen)
    for label, url in list((payload.get("workIcons") or {}).items()):
        payload["workIcons"][label] = localize(url, "work", repo_root, seen)
    for record in payload.get("records") or []:
        partner = record.get("partnerSkill") or {}
        partner["icon"] = localize(partner.get("icon", ""), "partner", repo_root, seen)
        for drop in record.get("drops") or []:
            drop["icon"] = localize(drop.get("icon", ""), "items", repo_root, seen)

    payload["iconStorage"] = {
        "mode": "local-snapshot",
        "path": "assets/paldb-ui-v113",
        "source": "PalDB CDN URLs captured by scripts/build-paldb-ui-v113.py",
        "uniqueFiles": len(seen),
    }
    return payload


def validate_local(payload: dict[str, Any], repo_root: Path) -> None:
    paths: list[str] = []
    paths.extend((payload.get("elementIcons") or {}).values())
    paths.extend((payload.get("workIcons") or {}).values())
    for record in payload.get("records") or []:
        icon = (record.get("partnerSkill") or {}).get("icon")
        if icon:
            paths.append(icon)
        paths.extend(drop.get("icon") for drop in record.get("drops") or [] if drop.get("icon"))
    external = [path for path in paths if str(path).startswith(("http://", "https://"))]
    missing = [path for path in paths if not (repo_root / str(path)).is_file()]
    if external:
        raise RuntimeError(f"External icon URLs remain: {external[:5]}")
    if missing:
        raise RuntimeError(f"Localized icon files are missing: {missing[:5]}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default="data/pal-ui-v113.json")
    parser.add_argument("--root", default=".")
    args = parser.parse_args()
    root = Path(args.root).resolve()
    path = root / args.input
    payload = json.loads(path.read_text(encoding="utf-8"))
    localize_payload(payload, root)
    validate_local(payload, root)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Localized {payload['iconStorage']['uniqueFiles']} unique PalDB UI icons into assets/paldb-ui-v113.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
