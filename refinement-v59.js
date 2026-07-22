(() => {
  "use strict";

  const VERSION = "59";
  const LOCAL_MUTATION_EGG_ICON = "assets/mutation-egg-v59.svg?v=59";
  let scheduled = 0;

  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function fixMutationEggImages(root = document) {
    $$(".v58-mutation-egg img, img[alt=\"突然変異タマゴ\"]", root).forEach(image => {
      if (image.dataset.v59MutationFix === VERSION && image.getAttribute("src") === LOCAL_MUTATION_EGG_ICON) return;
      image.dataset.v59MutationFix = VERSION;
      image.removeAttribute("onerror");
      image.onerror = null;
      image.src = LOCAL_MUTATION_EGG_ICON;
      image.alt = "突然変異タマゴ";
    });
  }

  function scheduleFix(root = document) {
    window.clearTimeout(scheduled);
    scheduled = window.setTimeout(() => fixMutationEggImages(root), 30);
  }

  function init() {
    fixMutationEggImages();

    new MutationObserver(mutations => {
      let shouldFix = false;
      for (const mutation of mutations) {
        if (mutation.type === "childList" && mutation.addedNodes.length) {
          shouldFix = true;
          break;
        }
        if (mutation.type === "attributes" && mutation.target instanceof HTMLImageElement) {
          shouldFix = true;
          break;
        }
      }
      if (shouldFix) scheduleFix();
    }).observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["src"]
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
