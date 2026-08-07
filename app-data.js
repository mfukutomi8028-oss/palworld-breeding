// Palworld 1.0 data runtime.
// Core Pal/breeding data is loaded independently from optional image data.
(() => {
  "use strict";

  const DATA_CACHE_VERSION = "110";
  const LOCAL_SOURCES = {
    pals: "data/pals-v1.json?v=110",
    localization: "data/pal-localization-ja-v1.json?v=110",
    breeding: "data/breeding-v1.json?v=110",
    images: "data/pal-images-v1.json?v=110",
  };
  const EXTERNAL_SOURCES = {
    pals: DATA_SOURCES.pals,
    localization: DATA_SOURCES.localization,
    breeding: DATA_SOURCES.breedingEngine,
    images: "https://raw.githubusercontent.com/bowenchen-1/palworld-guide/bbe68288a4404ea22467d53b73aee15a70abaa97/data/sources/palworld-icon-manifest.json",
  };
  const IMAGE_REPOSITORY_BASE = "https://raw.githubusercontent.com/bowenchen-1/palworld-guide/bbe68288a4404ea22467d53b73aee15a70abaa97/public/icons/palworld/";
  const IMAGE_CDN_BASE = "https://assets.palworldguide.net/icons/palworld/";
  const PLACEHOLDER = "assets/unknown-pal-v8.svg";
  const DATA_CACHE_PREFIX = `pal-breeding-note:data:${DATA_CACHE_VERSION}:`;

  function normalizedDeckNumber(value) {
    if (value === null || value === undefined) return "";
    const raw = String(value).trim().toUpperCase();
    if (!raw || ["NULL", "NONE", "N/A", "NA", "-", "—", "–", "―"].includes(raw)) return "";
    const match = raw.match(/^(\d+)([A-Z]*)$/);
    return match ? `${match[1].padStart(3, "0")}${match[2]}` : "";
  }

  function cacheRead(key, validator) {
    const cached = safeJsonParse(localStorage.getItem(`${DATA_CACHE_PREFIX}${key}`), null);
    if (!cached || !validator(cached.data)) return null;
    return cached.data;
  }

  function cacheWrite(key, data) {
    try {
      localStorage.setItem(`${DATA_CACHE_PREFIX}${key}`, JSON.stringify({ savedAt: Date.now(), data }));
    } catch (error) {
      console.warn(`Data cache write failed: ${key}`, error);
    }
  }

  async function fetchJson(url) {
    const response = await fetch(url, { cache: url.startsWith("data/") ? "default" : "no-store" });
    if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
    const data = await response.json();
    return data;
  }

  async function loadJsonResource(key, localUrl, externalUrl, validator) {
    const failures = [];
    for (const [source, url] of [["local", localUrl], ["external", externalUrl]]) {
      try {
        const data = await fetchJson(url);
        if (!validator(data)) throw new Error(`${url}: invalid data structure`);
        cacheWrite(key, data);
        return { data, source, failures };
      } catch (error) {
        failures.push(error);
      }
    }
    const cached = cacheRead(key, validator);
    if (cached) return { data: cached, source: "cache", failures };
    throw new Error(`${key} load failed: ${failures.map(error => error.message).join(" | ")}`);
  }

  async function loadBreedingResource() {
    const validator = data => Boolean(data?.pals && Array.isArray(data?.unique));
    const failures = [];
    try {
      const data = await fetchJson(LOCAL_SOURCES.breeding);
      if (!validator(data)) throw new Error("local breeding data has an invalid structure");
      cacheWrite("breeding", data);
      return { data, source: "local", failures };
    } catch (error) {
      failures.push(error);
    }
    try {
      const response = await fetch(EXTERNAL_SOURCES.breeding, { cache: "no-store" });
      if (!response.ok) throw new Error(`${EXTERNAL_SOURCES.breeding}: HTTP ${response.status}`);
      const data = parseBreedingEngineDocument(await response.text());
      if (!validator(data)) throw new Error("external breeding data has an invalid structure");
      cacheWrite("breeding", data);
      return { data, source: "external", failures };
    } catch (error) {
      failures.push(error);
    }
    const cached = cacheRead("breeding", validator);
    if (cached) return { data: cached, source: "cache", failures };
    throw new Error(`breeding load failed: ${failures.map(error => error.message).join(" | ")}`);
  }

  function manifestPath(value) {
    return String(value || "")
      .replace(/^\/+/, "")
      .replace(/^partner_skills\//, "partner-skills/");
  }

  function encodedPath(value) {
    return manifestPath(value).split("/").map(encodeURIComponent).join("/");
  }

  function localImagePath(value) {
    const filename = manifestPath(value).split("/").pop();
    return filename ? `assets/pals/${encodeURIComponent(filename)}` : "";
  }

  function imageSources(row) {
    if (!row?.displayIconFile) return [];
    const remotePath = encodedPath(row.displayIconFile);
    return [
      localImagePath(row.displayIconFile),
      `${IMAGE_REPOSITORY_BASE}${remotePath}`,
      `${IMAGE_CDN_BASE}${remotePath}`,
    ].filter(Boolean);
  }

  function buildManifestMaps(manifest) {
    const rows = Array.isArray(manifest?.partnerSkills) ? manifest.partnerSkills : [];
    const byNumber = new Map();
    const byName = new Map();
    for (const row of rows) {
      const number = normalizedDeckNumber(row.palNumber);
      const name = normalizeText(row.pal);
      if (number && !byNumber.has(number)) byNumber.set(number, row);
      if (name && !byName.has(name)) byName.set(name, row);
    }
    return { rows, byNumber, byName };
  }

  function stableSpecialId(enginePal, enName, order) {
    const key = String(enginePal?.code || normalizeText(enName) || order)
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return `special-${key || order}`;
  }

  function applyImageData(pal, maps) {
    const number = normalizedDeckNumber(pal.no);
    const row = (number && maps.byNumber.get(number)) || maps.byName.get(normalizeText(pal.enName));
    const sources = imageSources(row);
    return {
      ...pal,
      icon: sources[0] || PLACEHOLDER,
      iconFallbacks: sources.slice(1),
      iconManifestName: row?.pal || "",
      iconAssetName: row?.displayIconAsset || "",
      iconVerified: Boolean(row && sources.length),
    };
  }

  function createCorePals(palData, localization, engineData) {
    const translations = buildTranslationMap(localization);
    const engineByDeck = new Map();
    const engineByName = new Map();
    for (const [code, enginePal] of Object.entries(engineData.pals)) {
      const item = { code, ...enginePal };
      const deck = normalizedDeckNumber(enginePal.deck);
      if (deck) engineByDeck.set(deck, item);
      if (enginePal.name) engineByName.set(normalizeText(enginePal.name), item);
    }

    const rows = Array.isArray(palData?.records) ? palData.records : [];
    const pals = rows.map((record, order) => {
      const enName = String(record.name || "").trim();
      const number = normalizedDeckNumber(record.number);
      const enginePal = (number && engineByDeck.get(number)) || engineByName.get(normalizeText(enName));
      const name = JP_NAME_OVERRIDES[enName] || translations.get(enName) || enName;
      const hp = Number(record.hp);
      const attack = Number(record.attack);
      const defense = Number(record.defense);
      const statTotal = Number(record.statTotal);
      return {
        id: number || stableSpecialId(enginePal, enName, order),
        no: number || "—",
        order,
        name,
        enName,
        aliases: unique([name, enName]),
        elements: parseElements(record.elements),
        works: parseWorks(record.work),
        power: Number(enginePal?.rank ?? record.breedingPower),
        rarity: Number(record.rarity || 0),
        hp: Number.isFinite(hp) ? hp : null,
        attack: Number.isFinite(attack) ? attack : null,
        defense: Number.isFinite(defense) ? defense : null,
        statTotal: Number.isFinite(statTotal) ? statTotal : (Number.isFinite(hp + attack + defense) ? hp + attack + defense : null),
        icon: PLACEHOLDER,
        iconFallbacks: [],
        sourceUrl: String(record.sourceUrl || ""),
        engineCode: enginePal?.code || "",
        rankResult: Boolean(enginePal?.rankResult),
        selfOnly: enginePal ? !enginePal.rankResult : SELF_ONLY_EN.has(enName),
      };
    }).filter(pal => pal.name && Number.isFinite(pal.power));

    const knownDecks = new Set(pals.map(pal => normalizedDeckNumber(pal.no)).filter(Boolean));
    for (const [code, enginePal] of Object.entries(engineData.pals)) {
      const number = normalizedDeckNumber(enginePal.deck);
      if (!number || knownDecks.has(number)) continue;
      const enName = String(enginePal.name || code);
      const name = JP_NAME_OVERRIDES[enName] || translations.get(enName) || enName;
      pals.push({
        id: number,
        no: number,
        order: pals.length,
        name,
        enName,
        aliases: unique([name, enName]),
        elements: [],
        works: [],
        power: Number(enginePal.rank),
        rarity: 0,
        hp: null,
        attack: null,
        defense: null,
        statTotal: null,
        icon: PLACEHOLDER,
        iconFallbacks: [],
        sourceUrl: "",
        engineCode: code,
        rankResult: Boolean(enginePal.rankResult),
        selfOnly: !enginePal.rankResult,
      });
      knownDecks.add(number);
    }

    const ids = new Set(pals.map(pal => pal.id));
    if (ids.size !== pals.length) {
      const groups = new Map();
      for (const pal of pals) groups.set(pal.id, [...(groups.get(pal.id) || []), pal.enName]);
      const duplicates = [...groups.entries()].filter(([, names]) => names.length > 1);
      throw new Error(`Duplicate Pal IDs: ${JSON.stringify(duplicates)}`);
    }
    return pals;
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
    image.src = PLACEHOLDER;
    if (typeof renderReview === "function") renderReview();
  };

  window.palImageAttrs = function palImageAttrs(pal, className = "") {
    const src = pal?.icon || PLACEHOLDER;
    const fallbacks = Array.isArray(pal?.iconFallbacks) ? pal.iconFallbacks : [];
    return [
      `src="${escapeHtml(src)}"`,
      `alt="${escapeHtml(pal?.name || "パル画像未確認")}"`,
      `class="${escapeHtml(className)}"`,
      "loading=\"lazy\"",
      "decoding=\"async\"",
      `data-pal-key="${escapeHtml(pal?.id || "")}"`,
      `data-pal-fallbacks="${escapeHtml(JSON.stringify(fallbacks))}"`,
      "onerror=\"window.handlePalImageError(this)\"",
    ].join(" ");
  };

  window.palChip = function palChip(value, options = {}) {
    const pal = getPal(value);
    const name = pal?.name || String(value || "");
    if (!name) {
      return `<span class="pal-chip pal-chip--pending"><img src="${PLACEHOLDER}" alt="結果未確認" class="pal-chip__image"><span class="pal-chip__text"><strong>未確認</strong><small>結果未入力</small></span></span>`;
    }
    return `<span class="pal-chip${options.result ? " pal-chip--result" : ""}"><img ${palImageAttrs(pal, "pal-chip__image")}><span class="pal-chip__text"><strong>${escapeHtml(name)}</strong><small>${pal ? `No.${escapeHtml(pal.no)}` : "候補リスト外"}</small></span></span>`;
  };

  window.loadPalData = async function loadPalData() {
    state.dataState = "loading";
    state.imageDataState = "loading";
    state.dataError = "";
    renderConnectionStates();

    try {
      const [palResult, localizationResult, breedingResult] = await Promise.all([
        loadJsonResource("pals", LOCAL_SOURCES.pals, EXTERNAL_SOURCES.pals, data => Array.isArray(data?.records) && data.records.length > 0),
        loadJsonResource("localization", LOCAL_SOURCES.localization, EXTERNAL_SOURCES.localization, data => Boolean(data?.en && (data?.ja || data?.jp))),
        loadBreedingResource(),
      ]);

      state.pals = createCorePals(palResult.data, localizationResult.data, breedingResult.data);
      state.breedingEngine = breedingResult.data;
      state.breedingEngineState = breedingResult.source === "cache" ? "cache" : "ready";
      rebuildPalMaps();
      state.dataState = [palResult.source, localizationResult.source, breedingResult.source].includes("cache") ? "cache" : "ready";

      try {
        const imageResult = await loadJsonResource("images", LOCAL_SOURCES.images, EXTERNAL_SOURCES.images, data => Array.isArray(data?.partnerSkills) && data.partnerSkills.length > 0);
        const maps = buildManifestMaps(imageResult.data);
        state.pals = state.pals.map(pal => applyImageData(pal, maps));
        state.iconManifestRows = maps.rows.length;
        state.iconVerifiedCount = state.pals.filter(pal => pal.iconVerified).length;
        state.imageDataState = imageResult.source === "cache" ? "cache" : "ready";
        if (state.iconVerifiedCount !== state.pals.length) {
          state.imageDataState = "partial";
          state.dataError = `画像未照合 ${state.pals.length - state.iconVerifiedCount}体`;
        }
        rebuildPalMaps();
      } catch (imageError) {
        console.warn("Pal image data load failed", imageError);
        state.imageDataState = "error";
        state.iconVerifiedCount = 0;
        state.dataError = "画像データを一部取得できませんでした。パル名・図鑑番号・配合検索は利用できます。";
      }

      buildBreedingMatrix();
    } catch (coreError) {
      console.error("Pal core data load failed", coreError);
      state.dataState = "error";
      state.imageDataState = "unavailable";
      state.breedingEngineState = "error";
      state.dataError = `Palworld 1.0データを取得できませんでした: ${coreError.message}`;
      buildFallbackPalsFromRecords();
    }

    populateFilters();
    renderAll();
    renderConnectionStates();
  };

  window.clearPalDataCaches = function clearPalDataCaches() {
    for (let index = localStorage.length - 1; index >= 0; index -= 1) {
      const key = localStorage.key(index);
      if (key?.startsWith("pal-breeding-note:data:") || key?.startsWith("pal-breeding-note:pals:") || key?.startsWith("pal-breeding-note:localization:") || key?.startsWith("pal-breeding-note:breeding-engine:") || key?.startsWith("pal-breeding-note:icon-manifest:")) {
        localStorage.removeItem(key);
      }
    }
  };
})();
