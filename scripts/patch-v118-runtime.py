#!/usr/bin/env python3
from pathlib import Path

path = Path("app-pal-growth.js")
text = path.read_text(encoding="utf-8")

start = text.index("  function workBoostState(pal, star) {")
end = text.index("  function partnerStar(growth, star) {", start)
replacement = '''  function workBoostState(pal, star) {
    const works = Array.isArray(pal?.works) ? pal.works : [];
    if (!works.length) return [];
    const boosted = Number(star) >= 4;
    return works.map(work => ({
      ...work,
      boost: boosted ? "guaranteed" : "none",
      displayLevel: Number(work.level || 0) + (boosted ? 1 : 0),
    }));
  }

  function workPreview(pal, star) {
    const works = workBoostState(pal, star);
    if (!works.length) return `<p class="form-help">作業適性はありません。</p>`;
    return `<div class="growth-work-grid">${works.map(work => {
      const changed = work.boost === "guaranteed";
      return `<span class="growth-work-chip${changed ? " is-boosted" : ""}"><small>${escapeHtml(work.name)}</small><strong>Lv.${escapeHtml(work.displayLevel)}</strong>${changed ? `<em>+1</em>` : ""}</span>`;
    }).join("")}</div>`;
  }

'''
text = text[:start] + replacement + text[end:]

old_label = '${star === 4 ? "★4は全適性+1" : star > 0 ? `★${star}は上位${star}枠まで+1` : "基礎値"}'
new_label = '${star === 4 ? "★4で全適性+1" : star > 0 ? `★${star}では適性Lvは基礎値のまま` : "基礎値"}'
if old_label not in text:
    raise SystemExit("growth work label target not found")
text = text.replace(old_label, new_label, 1)

old_note = '${star > 0 && star < 4 ? `<p class="form-help growth-work-note">同じLvの適性が境界に並ぶ場合は対象候補として表示します。★4ではすべての既存適性が確実に+1されます。</p>` : ""}'
new_note = '${star > 0 && star < 4 ? `<p class="form-help growth-work-note">★1〜3では作業適性Lvは変化しません。★4になると、元から持つすべての作業適性が+1されます。</p>` : ""}'
if old_note not in text:
    raise SystemExit("growth work note target not found")
text = text.replace(old_note, new_note, 1)

path.write_text(text, encoding="utf-8")
print("Patched", path)
