#!/usr/bin/env python3
"""Integrate verified PalDB species stats into the Paldex UI."""

from __future__ import annotations

import re
from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    file = Path(path)
    text = file.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{path}: expected one match, found {count}: {old[:120]!r}")
    file.write_text(text.replace(old, new), encoding="utf-8")


def replace_regex_once(path: str, pattern: str, replacement: str) -> None:
    file = Path(path)
    text = file.read_text(encoding="utf-8")
    updated, count = re.subn(pattern, replacement, text, count=1, flags=re.S)
    if count != 1:
        raise RuntimeError(f"{path}: regex match count was {count}: {pattern[:120]!r}")
    file.write_text(updated, encoding="utf-8")


def append_once(path: str, marker: str, content: str) -> None:
    file = Path(path)
    text = file.read_text(encoding="utf-8")
    if marker in text:
        return
    file.write_text(text.rstrip() + "\n\n" + content.strip() + "\n", encoding="utf-8")


# Ensure new fixed JSON is not hidden behind an old browser cache.
replace_once("app-data.js", 'const DATA_CACHE_VERSION = "103";', 'const DATA_CACHE_VERSION = "110";')
for filename in ("pals-v1.json", "pal-localization-ja-v1.json", "breeding-v1.json", "pal-images-v1.json"):
    replace_once(
        "app-data.js",
        f'"data/{filename}"',
        f'"data/{filename}?v=110"',
    )

replace_once(
    "app-data.js",
    '      const name = JP_NAME_OVERRIDES[enName] || translations.get(enName) || enName;\n      return {',
    '      const name = JP_NAME_OVERRIDES[enName] || translations.get(enName) || enName;\n'
    '      const hp = Number(record.hp);\n'
    '      const attack = Number(record.attack);\n'
    '      const defense = Number(record.defense);\n'
    '      const statTotal = Number(record.statTotal);\n'
    '      return {',
)
replace_once(
    "app-data.js",
    '        rarity: Number(record.rarity || 0),\n        icon: PLACEHOLDER,',
    '        rarity: Number(record.rarity || 0),\n'
    '        hp: Number.isFinite(hp) ? hp : null,\n'
    '        attack: Number.isFinite(attack) ? attack : null,\n'
    '        defense: Number.isFinite(defense) ? defense : null,\n'
    '        statTotal: Number.isFinite(statTotal) ? statTotal : (Number.isFinite(hp + attack + defense) ? hp + attack + defense : null),\n'
    '        icon: PLACEHOLDER,',
)
replace_once(
    "app-data.js",
    '        rarity: 0,\n        icon: PLACEHOLDER,',
    '        rarity: 0,\n'
    '        hp: null,\n'
    '        attack: null,\n'
    '        defense: null,\n'
    '        statTotal: null,\n'
    '        icon: PLACEHOLDER,',
)

replace_once(
    "app-core.js",
    'paldexLimit:60,brokenPalIds:',
    'paldexLimit:60,paldexSort:"numberAsc",brokenPalIds:',
)

replace_once(
    "ui-shell.js",
    '<label class="select-field"><span>作業適性</span><select id="paldexWork"><option value="">すべて</option></select></label>\n          <span class="result-count" id="paldexCount">0体</span>',
    '<label class="select-field"><span>作業適性</span><select id="paldexWork"><option value="">すべて</option></select></label>\n'
    '          <label class="select-field"><span>並び順</span><select id="paldexSort">'
    '<option value="numberAsc">図鑑番号順</option><option value="nameAsc">名前順</option>'
    '<option value="hpDesc">HPが高い順</option><option value="hpAsc">HPが低い順</option>'
    '<option value="attackDesc">攻撃が高い順</option><option value="attackAsc">攻撃が低い順</option>'
    '<option value="defenseDesc">防御が高い順</option><option value="defenseAsc">防御が低い順</option>'
    '<option value="totalDesc">合計が高い順</option><option value="totalAsc">合計が低い順</option>'
    '</select></label>\n'
    '          <span class="result-count" id="paldexCount">0体</span>',
)

explore_helpers = r'''function palStatValue(pal,key){
  const raw=pal?.[key];
  if(raw===null||raw===undefined||raw==="")return null;
  const value=Number(raw);
  return Number.isFinite(value)?value:null;
}

function palStatsMarkup(pal,variant="card"){
  const stats=[
    ["HP",palStatValue(pal,"hp")],
    ["攻撃",palStatValue(pal,"attack")],
    ["防御",palStatValue(pal,"defense")],
    ["合計",palStatValue(pal,"statTotal")],
  ];
  return `<div class="pal-stats pal-stats--${variant}">${stats.map(([label,value])=>`<span><small>${label}</small><strong>${value??"—"}</strong></span>`).join("")}</div>`;
}

function paldexNumberCompare(a,b){
  return String(a.no||"").localeCompare(String(b.no||""),"ja",{numeric:true,sensitivity:"base"});
}

function sortPaldexPals(pals){
  const mode=state.paldexSort||"numberAsc";
  const sorted=[...pals];
  const fallback=(a,b)=>paldexNumberCompare(a,b)||a.name.localeCompare(b.name,"ja");
  sorted.sort((a,b)=>{
    if(mode==="nameAsc")return a.name.localeCompare(b.name,"ja")||fallback(a,b);
    if(mode==="numberAsc")return fallback(a,b);
    const descending=mode.endsWith("Desc"),key=mode.replace(/(?:Asc|Desc)$/u,"");
    const statKey=key==="total"?"statTotal":key;
    const left=palStatValue(a,statKey),right=palStatValue(b,statKey);
    if(left===null&&right===null)return fallback(a,b);
    if(left===null)return 1;
    if(right===null)return -1;
    const difference=left-right;
    return (descending?-difference:difference)||fallback(a,b);
  });
  return sorted;
}

function filteredPals(){
  const q=normalizeText(byId("paldexSearch")?.value),element=byId("paldexElement")?.value,work=byId("paldexWork")?.value;
  const filtered=availablePalsForPaldex().filter(p=>(!q||normalizeText(`${p.name} ${p.enName} ${p.no}`).includes(q))&&(!element||p.elements.includes(element))&&(!work||p.works.some(w=>w.name===work)));
  return sortPaldexPals(filtered);
}
'''
replace_regex_once(
    "app-explore.js",
    r'function filteredPals\(\)\{.*?\}\n\nfunction renderPaldex\(\)\{',
    explore_helpers + '\nfunction renderPaldex(){',
)

replace_once(
    "app-explore.js",
    '<div class="element-list">${p.elements.map(e=>`<span class="element-tag">${e}</span>`).join("")}</div></button>',
    '<div class="element-list">${p.elements.map(e=>`<span class="element-tag">${e}</span>`).join("")}</div>${palStatsMarkup(p)}</button>',
)
replace_once(
    "app-explore.js",
    '<div class="pal-detail-body"><section class="detail-section"><h3>作業適性</h3>',
    '<div class="pal-detail-body"><section class="detail-section pal-stat-section"><h3>種族値</h3>${palStatsMarkup(pal,"detail")}<p class="form-help">PalDBの種族別係数です。攻撃はPalDBのAttack（ShotAttack）を使用し、合計はHP＋攻撃＋防御です。</p></section><section class="detail-section"><h3>作業適性</h3>',
)

replace_once(
    "app-actions.js",
    "byId('paldexWork').addEventListener('change',renderPaldex);byId('paldexLoadMore')",
    "byId('paldexWork').addEventListener('change',renderPaldex);byId('paldexSort').addEventListener('change',e=>{state.paldexSort=e.target.value;renderPaldex();});byId('paldexLoadMore')",
)

append_once(
    "style-components.css",
    "/* PALDB_STATS_V110 */",
    r'''/* PALDB_STATS_V110 */
.pal-card-button{align-content:start}
.pal-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;width:100%}
.pal-stats span{min-width:0;border:1px solid rgba(113,206,185,.14);background:rgba(4,22,28,.34);border-radius:8px;padding:5px 3px;text-align:center}
.pal-stats small{display:block;color:var(--muted);font-size:9px;line-height:1.2}
.pal-stats strong{display:block;margin-top:2px;color:var(--ink);font-size:12px;font-variant-numeric:tabular-nums}
.pal-stats--card{margin-top:8px}
.pal-stats--detail{gap:8px}
.pal-stats--detail span{padding:10px 6px}
.pal-stats--detail small{font-size:11px}
.pal-stats--detail strong{font-size:20px}
.pal-stat-section .form-help{margin-top:9px}
''',
)
append_once(
    "style-responsive.css",
    "/* PALDB_STATS_V110_MOBILE */",
    r'''/* PALDB_STATS_V110_MOBILE */
@media(max-width:680px){
  .paldex-toolbar .select-field{min-width:calc(50% - 6px)}
  .pal-stats{gap:4px}
  .pal-stats span{padding:4px 2px}
  .pal-stats small{font-size:8px}
  .pal-stats strong{font-size:11px}
  .pal-stats--detail strong{font-size:17px}
}
''',
)

index_file = Path("index.html")
index_text = index_file.read_text(encoding="utf-8")
version_count = index_text.count("?v=109")
if version_count < 1:
    raise RuntimeError("index.html: no v109 cache references were found")
index_file.write_text(index_text.replace("?v=109", "?v=110"), encoding="utf-8")
replace_once("config.js", 'window.palSiteVersion = "109";', 'window.palSiteVersion = "110";')

append_once(
    "data/SOURCES.md",
    "## PalDB species stats v110",
    r'''## PalDB species stats v110

- Source: `https://paldb.cc/en/Pal_Stats`
- Ordinary roster: PalDB `Stats /288` table.
- Unnumbered collaboration roster: 11 individual PalDB `Stats` panels.
- Fields: HP, Attack, Defense, Total.
- `Attack` is PalDB's ranged/ShotAttack species scaling value, not MeleeAttack.
- Generated reproducibly with `scripts/build-paldb-stats.py`.
- The generator verifies 288 + 11 = 299 rows, checks `Total = HP + Attack + Defense`, and compares the existing HP/Defense values before writing Attack.
''',
)

print("Applied Paldex species-stat UI and v110 cache changes.")
