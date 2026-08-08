(() => {
  "use strict";

  // `""` is a real form value here: it means "タマゴ未設定".
  // The legacy implementation used `value || previousValue`, which caused an
  // explicit unset and a fresh new-record form to inherit the previous egg.
  window.syncEggSelection = function syncEggSelectionV117(value) {
    const mutation = byId("recordMutation")?.checked;
    const button = byId("openEggPicker");
    if (!button) return;

    if (mutation) {
      button.disabled = true;
      button.classList.add("is-locked");
      button.dataset.value = "";
      button.innerHTML = eggChip({ mutation: true });
      return;
    }

    button.disabled = false;
    button.classList.remove("is-locked");

    // Do not fall back to the DOM's previous value. An empty string is an
    // intentional selection and must clear stale state from the prior dialog.
    button.dataset.value = value === null || value === undefined ? "" : String(value);
    const meta = eggMeta(button.dataset.value);
    button.innerHTML = meta
      ? `<span class="egg-chip"><img src="${escapeHtml(meta.icon)}" alt="${escapeHtml(meta.name)}"><span>${escapeHtml(meta.name)}</span></span>`
      : '<span id="eggSelection">タマゴを選択</span>';
  };
})();
