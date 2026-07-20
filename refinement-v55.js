(() => {
  "use strict";

  function loadScript(src, marker) {
    if (document.querySelector(`script[data-${marker}]`)) return;
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.dataset[marker] = "true";
    document.head.appendChild(script);
  }

  function loadStyle(href, marker) {
    if (document.querySelector(`link[data-${marker}]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.dataset[marker] = "true";
    document.head.appendChild(link);
  }

  loadStyle("refinement-v56.css?v=56", "refinementV56Style");
  loadScript("refinement-v55-core.js?v=56", "refinementV55Core");
  loadScript("refinement-v56.js?v=56", "refinementV56Script");
})();
