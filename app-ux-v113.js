(() => {
  "use strict";

  const RICH_DATA_URL = "data/pal-ui-v113.json?v=113";
  const RICH_CACHE_KEY = "pal-breeding-note:pal-ui:113";
  const richState = { status: "loading", error: "", byName: new Map(), elementIcons: {}, workIcons: {}, coverage: {} };

  const originalRenderPalDetailV113 = window.renderPalDetail;
  const originalRenderPaldexV113 = window.renderPaldex;

  function normalizeRichKey(value) {
    return String(value || "").normalize("NFKC").trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
  }

  function richRecordForPal(pal) {
    if (!pal) return null;
    return richState.byName.get(normalizeRichKey(pal.enName)) || null;
  }

  function selectedPalForRoot(root) {
    if (!root) return null;
    const extraId = root.querySelector("[data-extra-pal-id]")?.dataset.extraPalId;
    return getPal(extraId || state.selectedPalId) || null;
  }

  function iconMarkup(src, alt, className = "game-icon-v113") {
    if (!src) return "";
    return `<img class="${className}" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async" onerror="this.style.display='none'">`;
  }

  function compareButtonState(root, pal) {
    const existing = root.querySelector(`.pal-extra-v111 [data-compare-pal="${CSS.escape(pal.id)}"]`);
    const selected = existing?.getAttribute("aria-pressed") === "true";
    return { selected, label: selected ? "比較から外す" : "比較に追加" };
  }

  function isFullProfile(root) {
    return root?.id === "palDetail" && byId("view-paldex")?.classList.contains("is-pal-profile-open");
  }

  function ensurePrimaryActions(root, pal) {
    const hero = root.querySelector(".pal-detail-hero");
    if (!hero) return;
    hero.querySelector(".pal-primary-actions-v113")?.remove();
    const compare = compareButtonState(root, pal);
    const profile = isFullProfile(root);
    const markup = profile
      ? `<div class="pal-primary-actions-v113 pal-primary-actions-v113--profile" aria-label="パルの主要操作">
          <button class="button button--primary" type="button" data-compare-pal="${escapeHtml(pal.id)}" aria-pressed="${compare.selected}"><span class="pal-action-icon-v113">⇄</span>${escapeHtml(compare.label)}</button>
          <button class="button button--ghost" type="button" data-pal-breeding-target="${escapeHtml(pal.id)}"><span class="pal-action-icon-v113">◇</span>このパルの配合を探す</button>
          <button class="button button--ghost" type="button" data-pal-profile-share><span class="pal-action-icon-v113">↗</span>共有</button>
        </div>`
      : `<div class="pal-primary-actions-v113" aria-label="パルの主要操作">
          <button class="button button--primary" type="button" data-pal-profile-open="${escapeHtml(pal.id)}"><span class="pal-action-icon-v113">▣</span>詳細ページ</button>
          <button class="button button--ghost" type="button" data-compare-pal="${escapeHtml(pal.id)}" aria-pressed="${compare.selected}"><span class="pal-action-icon-v113">⇄</span>${escapeHtml(compare.label)}</button>
        </div>`;
    hero.insertAdjacentHTML("beforeend", markup);
  }

  function upgradePartnerSkill(root, pal) {
    const detail = richRecordForPal(pal);
    const partner = detail?.partnerSkill;
    if (!partner) return;
    const accordion = Array.from(root.querySelectorAll(".pal-extra-v111 details")).find(item => item.querySelector("summary span")?.textContent?.trim() === "パートナースキル");
    const body = accordion?.querySelector(".pal-extra-accordion__body");
    if (!accordion || !body) return;
    const tagMarkup = body.querySelector(".pal-extra-tag-list")?.outerHTML || "";
    const description = String(partner.description || "").trim();
    const descriptionMarkup = description
      ? `<p class="partner-skill-description-v113">${escapeHtml(description)}</p>`
      : `<p class="form-help">詳細な効果説明を取得できませんでした。PalDBの出典ページから確認できます。</p>`;
    body.innerHTML = `<div class="partner-skill-card-v113">
      <div class="partner-skill-icon-v113">${iconMarkup(partner.icon, `${partner.name || pal.name}のパートナースキル`, "partner-skill-icon-image-v113")}<span aria-hidden="true">✦</span></div>
      <div class="partner-skill-copy-v113">
        <h4>${escapeHtml(partner.name || "名称未確認")}</h4>
        ${tagMarkup}
        ${descriptionMarkup}
      </div>
    </div>`;
  }

  function upgradeDrops(root, pal) {
    const detail = richRecordForPal(pal);
    if (!Array.isArray(detail?.drops)) return;
    const accordion = Array.from(root.querySelectorAll(".pal-extra-v111 details")).find(item => item.querySelector("summary span")?.textContent?.trim() === "主なドロップ");
    const body = accordion?.querySelector(".pal-extra-accordion__body");
    if (!accordion || !body) return;
    if (!detail.drops.length) {
      body.innerHTML = `<p class="form-help">確認できるドロップ情報はありません。</p>`;
      return;
    }
    body.innerHTML = `<div class="pal-drop-list pal-drop-list-v113">${detail.drops.slice(0, 12).map(drop => {
      const item = escapeHtml(drop.item || "不明");
      const label = drop.sourceUrl
        ? `<a href="${escapeHtml(drop.sourceUrl)}" target="_blank" rel="noopener noreferrer">${item}</a>`
        : `<strong>${item}</strong>`;
      return `<div class="pal-drop-row-v113">
        <span class="pal-drop-icon-v113">${iconMarkup(drop.icon, drop.item || "ドロップアイテム", "pal-drop-icon-image-v113")}<i aria-hidden="true">◆</i></span>
        <span class="pal-drop-name-v113">${label}</span>
        <span class="pal-drop-qty-v113"><small>数量</small><strong>${escapeHtml(drop.quantity || "—")}</strong></span>
        <span class="pal-drop-prob-v113"><small>確率</small><strong>${escapeHtml(drop.probability || "—")}</strong></span>
      </div>`;
    }).join("")}</div>`;
  }

  function upgradeElementTags(root = document) {
    root.querySelectorAll(".element-tag").forEach(tag => {
      if (tag.dataset.richIconV113 === "1") return;
      const label = tag.textContent.trim();
      const src = richState.elementIcons[label];
      if (!src) return;
      tag.dataset.richIconV113 = "1";
      tag.classList.add("element-tag--icon-v113");
      tag.insertAdjacentHTML("afterbegin", iconMarkup(src, label, "element-icon-v113"));
    });
  }

  function upgradeWorkTags(root = document) {
    const workNames = Object.keys(richState.workIcons);
    if (!workNames.length) return;
    root.querySelectorAll(".work-tag").forEach(tag => {
      if (tag.dataset.richIconV113 === "1") return;
      const text = tag.textContent.trim();
      const name = workNames.find(item => text === item || text.startsWith(`${item} Lv.`));
      if (!name) return;
      const src = richState.workIcons[name];
      if (!src) return;
      tag.dataset.richIconV113 = "1";
      tag.classList.add("work-tag--icon-v113");
      tag.insertAdjacentHTML("afterbegin", iconMarkup(src, name, "work-icon-v113"));
    });
  }

  function palCardWorkMarkup(pal) {
    if (!Array.isArray(pal?.works) || !pal.works.length) return "";
    return `<div class="pal-card-work-icons-v113" aria-label="作業適性">${pal.works.map(work => {
      const src = richState.workIcons[work.name];
      return `<span title="${escapeHtml(`${work.name} Lv.${work.level}`)}">${iconMarkup(src, work.name, "work-icon-v113")}<b>${escapeHtml(work.level)}</b></span>`;
    }).join("")}</div>`;
  }

  function decoratePaldexCards() {
    const grid = byId("paldexGrid");
    if (!grid) return;
    grid.querySelectorAll("[data-pal-detail]").forEach(card => {
      card.title = "クリック：右側に表示 / ダブルクリック：詳細ページ";
      const pal = getPal(card.dataset.palDetail);
      if (!pal || card.querySelector(".pal-card-work-icons-v113")) return;
      const markup = palCardWorkMarkup(pal);
      if (markup) card.insertAdjacentHTML("beforeend", markup);
    });
    upgradeElementTags(grid);
  }

  function enhanceRichDetail(root) {
    if (!root) return;
    const pal = selectedPalForRoot(root);
    if (!pal) return;
    ensurePrimaryActions(root, pal);
    if (richState.status === "ready") {
      upgradePartnerSkill(root, pal);
      upgradeDrops(root, pal);
    }
    upgradeElementTags(root);
    upgradeWorkTags(root);
  }

  window.renderPalDetail = function renderPalDetailV113(root = byId("palDetail")) {
    originalRenderPalDetailV113(root);
    enhanceRichDetail(root);
  };

  window.renderPaldex = function renderPaldexV113() {
    originalRenderPaldexV113();
    decoratePaldexCards();
    enhanceRichDetail(byId("palDetail"));
  };

  function openProfileById(palId) {
    const pal = getPal(palId);
    if (!pal) return;
    state.selectedPalId = pal.id;
    const params = new URLSearchParams(location.hash.replace(/^#/, ""));
    if (!params.get("room")) params.set("room", state.roomId);
    params.set("pal", pal.id);
    location.hash = params.toString();
    if (state.currentView !== "paldex") switchView("paldex");
    else renderPaldex();
  }

  document.addEventListener("dblclick", event => {
    const card = event.target.closest("#paldexGrid [data-pal-detail]");
    if (!card) return;
    if (event.target.closest("a,input,select,textarea,[data-compare-pal]")) return;
    event.preventDefault();
    openProfileById(card.dataset.palDetail);
  });

  document.addEventListener("click", event => {
    if (!event.target.closest("[data-compare-pal]")) return;
    requestAnimationFrame(() => {
      enhanceRichDetail(byId("palDetail"));
      const modalRoot = byId("palModalBody")?.querySelector(".pal-detail-panel");
      if (modalRoot) enhanceRichDetail(modalRoot);
    });
  });

  function validatePayload(payload) {
    return Array.isArray(payload?.records) && payload.records.length === 299 && payload?.count === 299;
  }

  async function fetchRichPayload() {
    try {
      const response = await fetch(RICH_DATA_URL, { cache: "default" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      if (!validatePayload(payload)) throw new Error("補助データの件数または形式が不正です。");
      try { localStorage.setItem(RICH_CACHE_KEY, JSON.stringify(payload)); } catch {}
      return payload;
    } catch (networkError) {
      const cached = safeJsonParse(localStorage.getItem(RICH_CACHE_KEY), null);
      if (validatePayload(cached)) return cached;
      throw networkError;
    }
  }

  async function waitForPals() {
    for (let attempt = 0; attempt < 180; attempt += 1) {
      if (Array.isArray(state.pals) && state.pals.length > 0) return;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error("パル一覧の準備が完了しませんでした。");
  }

  async function loadRichData() {
    try {
      const payload = await fetchRichPayload();
      richState.elementIcons = payload.elementIcons || {};
      richState.workIcons = payload.workIcons || {};
      richState.coverage = payload.coverage || {};
      for (const record of payload.records) richState.byName.set(normalizeRichKey(record.name), record);
      richState.status = "ready";
      await waitForPals();
      if (state.currentView === "paldex") renderPaldex();
      upgradeElementTags(document);
      upgradeWorkTags(document);
    } catch (error) {
      console.warn("v113 rich Pal UI data load failed", error);
      richState.status = "error";
      richState.error = error.message;
    }
  }

  const observer = new MutationObserver(mutations => {
    if (richState.status !== "ready") return;
    if (!mutations.some(item => item.addedNodes.length)) return;
    upgradeElementTags(document);
    upgradeWorkTags(document);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  loadRichData();
})();
