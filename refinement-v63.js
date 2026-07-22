(() => {
  "use strict";

  const VERSION = "63";
  const PLAIN_EGG_ICON = "assets/plain-egg.png?v=63";
  let scheduled = 0;

  function createPlainEggImage(className = "") {
    const image = document.createElement("img");
    image.src = PLAIN_EGG_ICON;
    image.alt = "平凡なタマゴ";
    image.className = ["v63-plain-egg", className].filter(Boolean).join(" ");
    image.loading = "eager";
    return image;
  }

  function replaceEmptyStateEgg(root = document) {
    root.querySelectorAll?.(".empty-egg").forEach(container => {
      if (container.dataset.v63PlainEgg === VERSION) return;
      container.dataset.v63PlainEgg = VERSION;
      container.textContent = "";
      container.appendChild(createPlainEggImage("v63-empty-state-egg"));
    });
  }

  function replaceEggEmojiText(root = document) {
    const walker = document.createTreeWalker(
      root === document ? document.body : root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (!node.nodeValue?.includes("🥚")) return NodeFilter.FILTER_REJECT;
          const parent = node.parentElement;
          if (!parent || parent.closest("script, style, textarea, input, select, option")) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    for (const node of nodes) {
      const text = node.nodeValue || "";
      const parts = text.split("🥚");
      const fragment = document.createDocumentFragment();
      parts.forEach((part, index) => {
        if (part) fragment.appendChild(document.createTextNode(part));
        if (index < parts.length - 1) {
          fragment.appendChild(createPlainEggImage("v63-inline-egg"));
        }
      });
      node.replaceWith(fragment);
    }
  }

  function replaceAll(root = document) {
    replaceEmptyStateEgg(root);
    if (document.body) replaceEggEmojiText(root);
  }

  function scheduleReplace(root = document) {
    clearTimeout(scheduled);
    scheduled = setTimeout(() => replaceAll(root), 20);
  }

  function init() {
    replaceAll();
    new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (!mutation.addedNodes.length) continue;
        scheduleReplace(document);
        break;
      }
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
