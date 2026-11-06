// Progressive enhancement for the existing Utforsk drawer.
// Uses the canonical mode/filter APIs; never replaces the category cards or map.
(() => {
  "use strict";

  const LIST_IDS = {
    nearby: "nearbyList",
    people: "leftPeopleList",
    nature: "leftNatureList",
    routes: "leftRoutesList",
    badges: "leftBadgesList",
    events: "leftEventsList",
    social: "leftSocialList"
  };
  const LABELS = {
    nearby: "steder",
    people: "folk",
    nature: "natur",
    routes: "ruter",
    badges: "merker",
    events: "hendelser",
    social: "møter"
  };

  function normalize(value) {
    return String(value || "").normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("nb").trim();
  }

  function init() {
    const root = document.getElementById("nearbyListContainer");
    const input = /** @type {HTMLInputElement | null} */ (document.getElementById("nearbyQuickSearch"));
    const count = document.getElementById("nearbySearchCount");
    const summary = document.getElementById("nearbyActiveFilter");
    const toggle = document.getElementById("nearbyGuideToggle");
    const guide = document.getElementById("nearbyGuidePanel");
    const row = root?.querySelector(".nearby-row2");
    if (!root || !input || !count || !summary || !toggle || !guide || !row) return;

    let scheduled = false;
    const mode = () => window.HGLeftPanelMode?.getActiveMode?.()
      || root.querySelector(".nearby-tab.is-active")?.getAttribute("data-leftmode")
      || "nearby";
    let lastMode = mode();

    function update() {
      scheduled = false;
      const activeMode = mode();
      // A search belongs to its category; do not hide another tab's cards.
      if (activeMode !== lastMode) {
        input.value = "";
        lastMode = activeMode;
      }
      const list = document.getElementById(LIST_IDS[activeMode] || "nearbyList");
      const query = normalize(input.value);
      const noun = LABELS[activeMode] || "treff";
      input.placeholder = "Søk i " + noun + "…";
      input.setAttribute("aria-label", "Søk i " + noun);

      if (!list) return;
      const cards = Array.from(list.children).filter((node) =>
        node instanceof HTMLElement && !node.classList.contains("hg-empty-guide")
      );
      let visible = 0;
      cards.forEach((card) => {
        if (!(card instanceof HTMLElement)) return;
        const image = card.querySelector("img.nearby-thumb");
        if (image && !image.getAttribute("src")) {
          image.closest(".nearby-thumbWrap")?.classList.add("hg-image-missing");
        }
        const searchable = normalize(
          card.textContent + " " + (image?.getAttribute("alt") || "")
        );
        const matches = !query || searchable.includes(query);
        card.hidden = !matches;
        if (matches) visible++;
      });

      if (cards.length) {
        count.textContent = query
          ? (visible ? visible + " av " + cards.length + " treff" : "Ingen treff – prøv et annet søk")
          : cards.length + " " + noun;
      } else {
        // An empty list can be an intentional loading/empty-state surface.
        count.textContent = "";
      }

      const filters = window.HGNearbyFilters;
      if (activeMode === "nearby") {
        const place = { unvisited: "Ikke besøkt", unlocked: "Besøkt", all: "Alle" };
        const sort = { distance: "Nærmest", oldest: "Eldst først", newest: "Nyest først" };
        const parts = [
          place[filters?.getPlaceFilter?.()] || "Steder",
          sort[filters?.getSort?.()] || "Nærmest"
        ];
        if (filters?.getFavoritesOnly?.()) parts.push("Favoritter");
        if ((filters?.getActiveBadgeFilter?.() || "all") !== "all") parts.push("Merke-filter");
        summary.textContent = parts.join(" · ");
      } else {
        summary.textContent = "";
      }
    }

    function scheduleUpdate() {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(update);
    }

    function closeGuide() {
      guide.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
    }

    function choose(action) {
      const filters = window.HGNearbyFilters;
      const modes = window.HGLeftPanelMode;
      if (!modes?.setMode) return;

      input.value = "";
      filters?.setActiveBadgeFilter?.("all");
      if (action === "near" || action === "new" || action === "history") {
        filters?.setFavoritesOnly?.(false);
        filters?.setPlaceFilter?.(action === "new" ? "unvisited" : "all");
        filters?.setSort?.(action === "history" ? "oldest" : "distance");
        modes.setMode("nearby");
      } else if (["people", "nature", "routes", "badges"].includes(action)) {
        modes.setMode(action);
      } else {
        return;
      }
      closeGuide();
      modes.rerender?.();
      window.updateNearbyFilterButton?.();
      window.updateNearbySortButton?.();
      scheduleUpdate();
    }

    input.addEventListener("input", scheduleUpdate);
    root.querySelector(".nearby-tabs")?.addEventListener("click", scheduleUpdate);
    root.querySelector(".nearby-controls")?.addEventListener("click", scheduleUpdate);

    toggle.addEventListener("click", () => {
      const next = !guide.hidden;
      guide.hidden = next;
      toggle.setAttribute("aria-expanded", String(!next));
    });

    guide.addEventListener("click", (event) => {
      const button = event.target instanceof Element
        ? event.target.closest("[data-hg-guide-action]")
        : null;
      if (button) choose(button.getAttribute("data-hg-guide-action"));
    });

    // Capture loading failures on newly rendered cards, without touching canonical
    // place data or causing failed-image network retries.
    root.addEventListener("error", (event) => {
      const image = event.target;
      if (image instanceof HTMLImageElement && image.matches("img.nearby-thumb")) {
        image.closest(".nearby-thumbWrap")?.classList.add("hg-image-missing");
      }
    }, true);

    // Lists are rebuilt by the canonical renderers after data load/filter changes.
    // Observe children only; the hidden attributes applied by search do not loop.
    new MutationObserver(scheduleUpdate).observe(row, {
      childList: true, subtree: true
    });
    scheduleUpdate();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
