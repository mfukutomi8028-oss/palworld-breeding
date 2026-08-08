(() => {
  "use strict";

  const PROFILE_HASH_KEY = "pal";
  const originalSwitchViewV115 = window.switchView;

  function clearProfileRouteBeforeLeavingPaldex(view) {
    if (!view || view === "paldex") return;
    const params = new URLSearchParams(location.hash.replace(/^#/, ""));
    if (!params.has(PROFILE_HASH_KEY)) return;
    params.delete(PROFILE_HASH_KEY);
    if (!params.get("room") && state?.roomId) params.set("room", state.roomId);
    const nextHash = params.toString();
    const nextUrl = `${location.pathname}${location.search}${nextHash ? `#${nextHash}` : ""}`;
    history.replaceState(history.state, "", nextUrl);
    byId("view-paldex")?.classList.remove("is-pal-profile-open");
    document.title = "パル配合ノート";
  }

  window.switchView = function switchViewV115(view) {
    clearProfileRouteBeforeLeavingPaldex(view);
    return originalSwitchViewV115(view);
  };
})();
