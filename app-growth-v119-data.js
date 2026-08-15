(() => {
  "use strict";

  const PARTNER_SOURCE = "https://raw.githubusercontent.com/zhudikangta/paltoolbox/67e602a3d9dec3aa5a2c80d6a4f7a1bb7219b5fe/PalToolbox/%E6%B8%B8%E6%88%8F%E5%86%85%E5%AE%B9/%E5%B9%BB%E5%85%BD%E5%B8%95%E9%B2%811.0/%E5%8E%9F%E5%A7%8B%E6%9D%A5%E6%BA%90/%E4%BC%99%E4%BC%B4%E6%8A%80%E8%83%BD/%E6%9C%AC%E5%9C%B0%E8%A7%A3%E5%8C%85%E4%BC%99%E4%BC%B4%E6%8A%80%E8%83%BD-2026-07-06.json";
  const EXTRACTED_BASE = "https://raw.githubusercontent.com/Dhampyru/Palworld-Extracted/d38105b4dc0cf6f36c5035997fbe54205bb2d753/Pal/Content/Pal/DataTable";
  const C2T_BASE = "https://raw.githubusercontent.com/c2t-r/PalworldData/be1ed4a0a6e0986fa999bb26ea29923c920a53c5";
  const PALEDIT_BASE = "https://raw.githubusercontent.com/EternalWraith/PalEdit/42d7478831ebd2fdcf48e7dd4e92db43560baafa/palworld_pal_edit/resources/data";
  const ACTIVE_SOURCE = "https://raw.githubusercontent.com/beliarance/palworld-kb/main/data/active_skills.json";

  const data = {
    promise: null,
    partner: new Map(),
    learnsets: new Map(),
    attackNames: {},
    active: new Map(),
    namesJa: {},
    descJa: {},
  };

  const normalize = value => String(value || "").normalize("NFKC").toLowerCase().replace(/[^a-z0-9]+/g, "");
  const rawId = value => String(value || "").replace(/^EPalWazaID::/, "");

  async function json(url) {
    const response = await fetch(url, { cache: "force-cache" });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
    return response.json();
  }

  async function jsonFallback(urls) {
    let lastError = null;
    for (const url of urls) {
      try {
        return await json(url);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error("No JSON source was available");
  }

  function extractedRows(payload) {
    if (Array.isArray(payload)) {
      const rows = {};
      payload.forEach(item => Object.assign(rows, item?.Rows || {}));
      return rows;
    }
    return payload?.Rows || payload || {};
  }

  function cleanLocalizedText(value) {
    return String(value || "")
      .replace(/\r?\n/g, " ")
      .replace(/<characterName\s+id=\|[^|]+\|\s*\/>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  function localized(payload) {
    const map = {};
    for (const [key, row] of Object.entries(extractedRows(payload))) {
      if (!key.startsWith("ACTION_SKILL_")) continue;
      const id = key.slice(13);
      const text = row?.TextData?.LocalizedString ?? row?.TextData?.SourceString ?? "";
      const cleaned = cleanLocalizedText(text);
      if (id && cleaned && cleaned !== "-") map[id] = cleaned;
    }
    return map;
  }

  function learnsets(payload) {
    const map = new Map();
    for (const row of Object.values(extractedRows(payload))) {
      const code = row?.PalId || row?.PalID;
      const skillId = row?.WazaID;
      const level = Number(row?.Level);
      if (!code || !skillId || !Number.isFinite(level)) continue;
      if (/^(?:BOSS_|Boss_|PREDATOR_|Predator_)/.test(code)) continue;
      if (!map.has(code)) map.set(code, []);
      map.get(code).push({ skillId, level });
    }
    for (const rows of map.values()) {
      const unique = new Map();
      rows.forEach(row => unique.set(`${row.level}:${row.skillId}`, row));
      rows.splice(0, rows.length, ...[...unique.values()].sort((a, b) => a.level - b.level || a.skillId.localeCompare(b.skillId)));
    }
    return map;
  }

  function activeIndex(payload) {
    const map = new Map();
    const list = Array.isArray(payload) ? payload : (payload?.skills || payload?.active_skills || []);
    for (const item of list) {
      const key = normalize(item?.name || item?.skill_name || item?.english_name);
      if (key) map.set(key, item);
    }
    return map;
  }

  async function load() {
    if (data.promise) return data.promise;
    data.promise = Promise.all([
      json(PARTNER_SOURCE),
      json(`${EXTRACTED_BASE}/Waza/DT_WazaMasterLevel.json`),
      json(`${PALEDIT_BASE}/en-GB/attacks.json`),
      json(ACTIVE_SOURCE),
      jsonFallback([`${EXTRACTED_BASE}/Text/DT_SkillNameText.json`, `${C2T_BASE}/DataTable/Text/SkillNameText.json`]),
      jsonFallback([`${EXTRACTED_BASE}/Text/DT_SkillDescText.json`, `${C2T_BASE}/DataTable/Text/SkillDescText.json`]),
    ]).then(([partner, level, attackNames, active, names, desc]) => {
      data.partner = new Map(Object.entries(partner?.partnerSkills || {}));
      data.learnsets = learnsets(level);
      data.attackNames = attackNames || {};
      data.active = activeIndex(active);
      data.namesJa = localized(names);
      data.descJa = localized(desc);
      return data;
    });
    return data.promise;
  }

  function skillsFor(pal) {
    const rows = data.learnsets.get(pal.engineCode) || [];
    return rows.map(row => {
      const id = rawId(row.skillId);
      const english = data.attackNames[row.skillId] || data.attackNames[id] || id;
      return {
        ...row,
        id,
        english,
        name: data.namesJa[id] || english,
        description: data.descJa[id] || "",
        detail: data.active.get(normalize(english)) || null,
        exclusive: /^Unique_/i.test(id),
      };
    });
  }

  window.PalGrowthV119 = { data, load, skillsFor, rawId };
})();
