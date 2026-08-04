// Palworld 1.0 canonical Pal image data layer.
// Images are resolved from the same fixed manifest used to build the 1.0 Pal dataset.
(() => {
  "use strict";

  const ICON_MANIFEST_COMMIT = "bbe68288a4404ea22467d53b73aee15a70abaa97";
  const ICON_MANIFEST_URL = `https://raw.githubusercontent.com/bowenchen-1/palworld-guide/${ICON_MANIFEST_COMMIT}/data/sources/palworld-icon-manifest.json`;
  const ICON_REPOSITORY_BASE = `https://raw.githubusercontent.com/bowenchen-1/palworld-guide/${ICON_MANIFEST_COMMIT}/public/icons/palworld/`;
  const ICON_CDN_BASE = "https://assets.palworldguide.net/icons/palworld/";
  const ICON_MANIFEST_CACHE_KEY = "pal-breeding-note:icon-manifest:102";

  function canonicalManifestPath(value) {
    return String(value || "")
      .replace(/^\/+/, "")
      .replace(/^partner_skills\//, "partner-skills/");
  }

  function encodeAssetPath(value) {
    return canonicalManifestPath(value)
      .split("/")
      .map(segment => encodeURIComponent(segment))
      .join("/");
  }

  function imageSources(entry) {
    const path = encodeAssetPath(entry?.displayIconFile);
    if (!path) return [];
    return [
      `${ICON_REPOSITORY_BASE}${path}`,
      `${ICON_CDN_BASE}${path}`,
    ];
  }

  function manifestMaps(manifest) {
    const rows = Array.isArray(manifest?.partnerSkills) ? manifest.partnerSkills : [];
    const byNumber = new Map();
    const byName = new Map();
    for (const row of rows) {
      const number = normalizePalNumber(row.palNumber);
      const name = normalizeText(row.pal);
      if (number && !byNumber.has(number)) byNumber.set(number, row);
      if (name && !byName.has(name)) byName.set(name, row);
    }
    return { rows, byNumber, byName };
  }

  function applyCanonicalIcon(pal, maps) {
    const row = maps.byNumber.get(normalizePalNumber(pal.id)) || maps.byName.get(normalizeText(pal.enName));
    const sources = imageSources(row);
    return {
      ...pal,
      icon: sources[0] || UNKNOWN_PAL_ICON,
      iconFallbacks: sources.slice(1),
      iconManifestName: row?.pal || "",
      iconAssetName: row?.displayIconAsset || "",
      iconVerified: Boolean(row && sources.length),
    };
  }

  window.handlePalImageError = function handlePalImageError(image) {
    if (!image || image.dataset.palFallbackActive === "1") return;
    image.dataset.palFallbackActive = "1";

    const queue = safeJsonParse(image.dataset.palFallbacks || "[]", []);
    const next = Array.isArray(queue) ? queue.shift() : "";
    if (next) {
      image.dataset.palFallbacks = JSON.stringify(queue);
      image.dataset.palFallbackActive = "0";
      image.src = next;
      return;
    }

    const palId = image.dataset.palKey;
    if (palId) state.brokenPalIds.add(palId);
    image.onerror = null;
    image.removeAttribute("data-pal-key");
    image.removeAttribute("data-pal-fallbacks");
    image.src = UNKNOWN_PAL_ICON;
    if (typeof renderReview === "function") renderReview();
  };

  window.palImageAttrs = function canonicalPalImageAttrs(pal, className = "") {
    const src = pal?.icon || UNKNOWN_PAL_ICON;
    const id = pal?.id || "";
    const fallbacks = Array.isArray(pal?.iconFallbacks) ? pal.iconFallbacks : [];
    return [
      `src="${escapeHtml(src)}"`,
      `alt="${escapeHtml(pal?.name || "パル画像未確認")}"`,
      `class="${escapeHtml(className)}"`,
      `loading="lazy"`,
      `decoding="async"`,
      `data-pal-key="${escapeHtml(id)}"`,
      `data-pal-fallbacks="${escapeHtml(JSON.stringify(fallbacks))}"`,
      `onerror="window.handlePalImageError(this)"`,
    ].join(" ");
  };

  window.loadPalData = async function loadCanonicalPalData() {
    state.dataState = "loading";
    state.breedingEngineState = "loading";
    renderConnectionStates();

    try {
      const iconPromise = fetchJsonCached(ICON_MANIFEST_URL, ICON_MANIFEST_CACHE_KEY)
        .catch(error => ({ data: { partnerSkills: [] }, source: "error", error }));
      const [palResult, locResult, engineResult, iconResult] = await Promise.all([
        fetchJsonCached(DATA_SOURCES.pals, CACHE_KEYS.pals),
        fetchJsonCached(DATA_SOURCES.localization, CACHE_KEYS.localization),
        fetchTextCached(DATA_SOURCES.breedingEngine, CACHE_KEYS.breedingEngine),
        iconPromise,
      ]);

      const translations = buildTranslationMap(locResult.data);
      const engineData = parseBreedingEngineDocument(engineResult.data);
      const maps = manifestMaps(iconResult.data);
      const engineByDeck = new Map();
      const engineByName = new Map();

      for (const [code, enginePal] of Object.entries(engineData.pals)) {
        const item = { code, ...enginePal };
        if (enginePal.deck) engineByDeck.set(normalizePalNumber(enginePal.deck), item);
        if (enginePal.name) engineByName.set(normalizeText(enginePal.name), item);
      }

      const records = Array.isArray(palResult.data?.records) ? palResult.data.records : [];
      state.pals = records.map((record, order) => {
        const enName = String(record.name || "").trim();
        const id = normalizePalNumber(record.number) || `pal-${order}`;
        const enginePal = engineByDeck.get(id) || engineByName.get(normalizeText(enName));
        const name = JP_NAME_OVERRIDES[enName] || translations.get(enName) || enName;
        return applyCanonicalIcon({
          id,
          no: id,
          order,
          name,
          enName,
          aliases: unique([name, enName]),
          elements: parseElements(record.elements),
          works: parseWorks(record.work),
          power: Number(enginePal?.rank ?? record.breedingPower),
          rarity: Number(record.rarity || 0),
          sourceUrl: String(record.sourceUrl || ""),
          engineCode: enginePal?.code || "",
          rankResult: Boolean(enginePal?.rankResult),
          selfOnly: enginePal ? !enginePal.rankResult : SELF_ONLY_EN.has(enName),
        }, maps);
      }).filter(pal => pal.name && Number.isFinite(pal.power));

      const knownDecks = new Set(state.pals.map(pal => pal.id));
      for (const [code, enginePal] of Object.entries(engineData.pals)) {
        const id = normalizePalNumber(enginePal.deck);
        if (!id || knownDecks.has(id)) continue;
        const enName = String(enginePal.name || code);
        const name = JP_NAME_OVERRIDES[enName] || translations.get(enName) || enName;
        state.pals.push(applyCanonicalIcon({
          id,
          no: id,
          order: state.pals.length,
          name,
          enName,
          aliases: unique([name, enName]),
          elements: [],
          works: [],
          power: Number(enginePal.rank),
          rarity: 0,
          sourceUrl: "",
          engineCode: code,
          rankResult: Boolean(enginePal.rankResult),
          selfOnly: !enginePal.rankResult,
        }, maps));
        knownDecks.add(id);
      }

      state.iconManifestRows = maps.rows.length;
      state.iconVerifiedCount = state.pals.filter(pal => pal.iconVerified).length;
      state.breedingEngine = engineData;
      state.breedingEngineState = engineResult.source === "network" ? "ready" : "cache";
      rebuildPalMaps();

      const allNetwork = [palResult.source, locResult.source, engineResult.source, iconResult.source]
        .every(source => source === "network");
      state.dataState = allNetwork ? "ready" : "cache";

      const messages = [];
      if ([palResult.error, locResult.error, engineResult.error].some(Boolean)) {
        messages.push("ネットワーク取得に失敗したデータは保存済みキャッシュを使用");
      }
      if (iconResult.error) {
        messages.push("画像マニフェストを取得できないため未確認画像を使用");
      }
      if (state.iconVerifiedCount !== state.pals.length) {
        messages.push(`画像未照合 ${state.pals.length - state.iconVerifiedCount}体`);
      }
      state.dataError = messages.join(" / ");

      buildBreedingMatrix();
    } catch (error) {
      console.error("Pal data load failed", error);
      state.dataState = "error";
      state.breedingEngineState = "error";
      state.dataError = "Palworld 1.0データを取得できませんでした。記録機能は利用できます。";
      buildFallbackPalsFromRecords();
    }

    populateFilters();
    renderAll();
    renderConnectionStates();
  };
})();
