(() => {
  "use strict";

  function loadScript(src, marker) {
    if (document.querySelector(`script[data-refinement-loader="${marker}"]`)) return;
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.dataset.refinementLoader = marker;
    document.head.appendChild(script);
  }

  function loadStyle(href, marker) {
    if (document.querySelector(`link[data-refinement-loader="${marker}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.dataset.refinementLoader = marker;
    document.head.appendChild(link);
  }

  loadStyle("refinement-v56.css?v=56", "v56-style");
  loadStyle("refinement-v58.css?v=58", "v58-style");
  loadScript("refinement-v55-core.js?v=56", "v55-core");
  loadScript("refinement-v56.js?v=56", "v56-script");
  loadScript("refinement-v58.js?v=58", "v58-script");
  loadScript("refinement-v59.js?v=59", "v59-script");
})();
