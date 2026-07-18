// js/ui/area-overview-scroll.js
// Preserve the user's reading position when Area rerenders filters or expands a band.
(function (global) {
  "use strict";

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target?.closest?.("[data-area-category], [data-area-clear-category], [data-area-expand-band]")) return;

    const root = document.getElementById("hgAreaOverview");
    if (!root || root.hidden) return;

    const previousScrollTop = root.scrollTop;
    const restore = () => {
      if (!root.hidden) root.scrollTop = previousScrollTop;
    };

    if (typeof global.requestAnimationFrame === "function") {
      global.requestAnimationFrame(restore);
    } else {
      global.setTimeout?.(restore, 0);
    }
  }, true);

  if (!global.HGAreaOverviewV2 && !document.querySelector('script[src="js/ui/area-overview-v2.js"]')) {
    const script = document.createElement("script");
    script.src = "js/ui/area-overview-v2.js";
    script.defer = true;
    document.body.appendChild(script);
  }
})(window);
