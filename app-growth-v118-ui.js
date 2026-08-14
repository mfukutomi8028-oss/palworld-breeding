(() => {
  "use strict";

  const growth = window.PalGrowthV118;
  if (!growth) return;
  const originalRenderPalDetail = window.renderPalDetail;
  const ELEMENT_JA = { Neutral: "無", Normal: "無", Fire: "炎", Water: "水", Electric: "雷", Electricity: "雷", Thunder: "雷", Grass: "草", Ice: "氷", Ground: "地", Dark: "闇", Dragon: "竜" };

  function effectLabel(key, index) {
    const elements = { Fire: "炎", Water: "水", Electric: "雷", Electricity: "雷", Thunder: "雷", Grass: "草", Ice: "氷", Ground: "地", Dark: "闇", Dragon: "竜", Normal: "無" };
    if (/TrainerDEF/i.test(key)) return "プレイヤー防御力";
    if (/TrainerATK/i.test(key)) return "プレイヤー攻撃力";
    if (/TrainerHP/i.test(key)) return "プレイヤーHP";
    if (/MoveSpeed/i.test(key)) return "移動速度";
    if (/WorkSpeed/i.test(key)) return "作業速度";
    if (/Weight/i.test(key)) return "最大所持重量";
    const match = key.match(/(?:ElementAddDrop|ElementBoostWeakness|ElementBoost|ElementResist)_([A-Za-z]+)/i);
    if (match) {
      const element = elements[match[1]] || match[1];
      if (/ElementAddDrop/i.test(key)) return `${element}属性パルのドロップ増加`;
      if (/ElementBoostWeakness/i.test(key)) return `${element}属性・弱点強化`;
      if (/ElementBoost/i.test(key)) return `${element}属性ダメージ強化`;
      return `${element}属性耐性`;
    }
    if (/Heal/i.test(key)) return "回復効果";
    if (/Drop/i.test(key)) return "ドロップ増加";
    if (/Damage|Attack|ATK/i.test(key)) return "攻撃効果";
    if (/Defense|DEF/i.test(key)) return "防御効果";
    return `効果${index + 1}`;
  }

  function unitFor(key) {
    return /(TrainerDEF|TrainerATK|TrainerHP|MoveSpeed|WorkSpeed|ElementAddDrop|ElementBoost|ElementResist|DropRate)/i.test(key) ? "%" : "";
  }

  function rankSeries(raw) {
    const rows = [];
    const pattern = /([A-Za-z0-9_]+)\(1★=([-+\d.]+)\s+2★=([-+\d.]+)\s+3★=([-+\d.]+)\s+4★=([-+\d.]+)\s+5★=([-+\d.]+)\)/g;
    let match;
    while ((match = pattern.exec(String(raw?.description || "")))) rows.push({ key: match[1], values: match.slice(2, 7).map(Number) });
    if (!rows.length && Array.isArray(raw?.values) && raw.values.length >= 5) rows.push({ key: raw.skillType || "PartnerSkill", values: raw.values.slice(0, 5).map(Number) });
    return rows.filter(row => row.values.every(Number.isFinite));
  }

  function partnerMarkup(pal, root) {
    const raw = growth.data.partner.get(pal.engineCode);
    const rows = rankSeries(raw);
    if (!rows.length) return '<div class="progression-empty-v118"><strong>★別数値を確認できませんでした</strong><span>特殊スキルは推測で補完していません。</span></div>';
    const name = root.querySelector(".partner-skill-copy-v113 h4")?.textContent?.trim() || "パートナースキル";
    return `<div class="partner-rank-head-v118"><div><span class="section-kicker">CONDENSATION</span><h4>${escapeHtml(name)}</h4></div><span class="source-chip-v118">★0 → ★4</span></div><div class="rank-table-scroll-v118"><table class="rank-table-v118"><thead><tr><th>効果</th>${[0,1,2,3,4].map(star => `<th${star === 4 ? ' class="is-max-v118"' : ""}>★${star}</th>`).join("")}</tr></thead><tbody>${rows.map((row, index) => `<tr><th>${escapeHtml(effectLabel(row.key, index))}</th>${row.values.map((value, star) => `<td${star === 4 ? ' class="is-max-v118"' : ""}>${escapeHtml(`${Number.isInteger(value) ? value : value.toFixed(2)}${unitFor(row.key)}`)}</td>`).join("")}</tr>`).join("")}</tbody></table></div><p class="progression-note-v118">ゲーム内部の Partner Skill Lv.1〜5 を凝縮★0〜★4へ対応させています。</p>`;
  }

  function workMarkup(pal) {
    const works = Array.isArray(pal.works) ? pal.works : [];
    if (!works.length) return '<p class="form-help">作業適性データなし</p>';
    const chips = works.map(work => `<span class="work-rank-chip-v118"><strong>${escapeHtml(work.name)}</strong><b>Lv.${escapeHtml(work.level)}</b></span>`).join("");
    return `<div class="work-rank-base-v118">${chips}</div><div class="work-rank-steps-v118"><div><b>★0</b><span>基礎値</span></div><div><b>★1</b><span>保有適性の1項目が+1</span></div><div><b>★2</b><span>さらに1項目が+1</span></div><div><b>★3</b><span>さらに1項目が+1</span></div><div class="is-max-v118"><b>★4</b><span>全作業適性が+1</span></div></div><p class="progression-note-v118">★1〜3は複数適性パルで強化先が固定ではないため、固定Lvを捏造せず仕様をそのまま表示しています。</p>`;
  }

  function skillsMarkup(pal) {
    const skills = growth.skillsFor(pal);
    if (!skills.length) return '<div class="progression-empty-v118"><strong>習得スキルデータを確認できませんでした</strong><span>未収録値は推測で補完していません。</span></div>';
    return `<div class="skill-list-v118">${skills.map(skill => {
      const detail = skill.detail || {};
      const element = ELEMENT_JA[detail.element] || detail.element || "—";
      const power = Number.isFinite(Number(detail.power)) ? Number(detail.power) : "—";
      const cooldownRaw = detail.cooldown_seconds ?? detail.cooldown ?? detail.cool_time;
      const cooldown = Number.isFinite(Number(cooldownRaw)) ? `${Number(cooldownRaw)}秒` : "—";
      const description = skill.description || detail.description || "効果詳細は参照データに未収録です。";
      return `<article class="skill-row-v118"><div class="skill-level-v118"><small>習得</small><strong>Lv.${skill.level}</strong></div><div class="skill-main-v118"><div class="skill-title-v118"><h4>${escapeHtml(skill.name)}</h4>${skill.name !== skill.english ? `<small>${escapeHtml(skill.english)}</small>` : ""}</div><div class="skill-metrics-v118"><span>属性 <b>${escapeHtml(element)}</b></span><span>威力 <b>${power}</b></span><span>CT <b>${cooldown}</b></span></div><p>${escapeHtml(description)}</p></div></article>`;
    }).join("")}</div><p class="progression-note-v118">習得Lv・日本語名・効果説明はPalworld 1.0ゲーム抽出データ、威力・CTは1.0 Active Skillsデータを照合しています。</p>`;
  }

  function shell(pal) {
    return `<section class="detail-section pal-progression-v118" data-progression-pal-v118="${escapeHtml(pal.id)}"><div class="progression-heading-v118"><div><span class="section-kicker">PAL GROWTH</span><h3>★強化・習得スキル</h3></div><span class="source-chip-v118">Palworld 1.0</span></div><div class="progression-grid-v118"><section class="progression-card-v118"><div class="progression-card-title-v118"><h4>パートナースキル ★別効果</h4><span>凝縮</span></div><div data-partner-ranks-v118><div class="progression-loading-v118"><span></span>★別データを読み込み中</div></div></section><section class="progression-card-v118"><div class="progression-card-title-v118"><h4>作業適性の★強化</h4><span>拠点</span></div>${workMarkup(pal)}</section></div><section class="progression-card-v118 progression-skills-v118"><div class="progression-card-title-v118"><h4>レベル習得アクティブスキル</h4><span>戦闘</span></div><div data-active-skills-v118><div class="progression-loading-v118"><span></span>習得スキルを読み込み中</div></div></section><div class="progression-source-v118">参照: PalDB / Palworld 1.0ゲーム抽出データ / palworld-kb。固定できない値は推測で補完しません。</div></section>`;
  }

  async function hydrate(root, pal) {
    const section = root.querySelector(`.pal-progression-v118[data-progression-pal-v118="${CSS.escape(pal.id)}"]`);
    if (!section) return;
    try {
      await growth.load();
      if (!section.isConnected) return;
      section.querySelector("[data-partner-ranks-v118]").innerHTML = partnerMarkup(pal, root);
      section.querySelector("[data-active-skills-v118]").innerHTML = skillsMarkup(pal);
    } catch (error) {
      console.warn("v118 progression data load failed", error);
      const message = '<div class="progression-empty-v118"><strong>追加データを取得できませんでした</strong><span>既存の図鑑情報は引き続き利用できます。</span></div>';
      section.querySelectorAll("[data-partner-ranks-v118],[data-active-skills-v118]").forEach(node => { node.innerHTML = message; });
    }
  }

  function append(root) {
    if (!root) return;
    const pal = getPal(state.selectedPalId) || availablePalsForPaldex()[0];
    if (!pal) return;
    root.querySelectorAll(".pal-progression-v118").forEach(node => node.remove());
    const body = root.querySelector(".pal-detail-body") || root;
    const partner = [...body.querySelectorAll(".pal-extra-accordion")].find(item => item.querySelector("summary")?.textContent?.includes("パートナースキル"));
    if (partner) partner.insertAdjacentHTML("afterend", shell(pal));
    else body.insertAdjacentHTML("beforeend", shell(pal));
    const paldexView = root.closest?.("#view-paldex");
    if (!paldexView || state.currentView === "paldex") hydrate(root, pal);
  }

  window.renderPalDetail = function renderPalDetailV118(root = byId("palDetail")) {
    originalRenderPalDetail(root);
    append(root);
  };
})();
