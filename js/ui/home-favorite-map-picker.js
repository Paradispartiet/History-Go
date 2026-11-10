// Homepage favorites selector. Uses the existing Explore favorite button beside badge selection.
(function () {
  "use strict";
  if (window.HGHomeFavoriteMapPicker) return;

  const symbols = [
    ["badges", "🏅", "Badges"],
    ["star", "⭐", "Stjerne"],
    ["heart", "❤️", "Hjerte"],
    ["pin", "📍", "Kartnål"],
    ["flag", "🚩", "Flagg"],
    ["museum", "🏛️", "Historie"],
    ["book", "📚", "Bok"],
    ["music", "🎵", "Musikk"],
    ["nature", "🌳", "Natur"]
  ];
  let button = null;
  let panel = null;
  let selectedPlaceId = "";

  function close() {
    if (!panel) return;
    panel.hidden = true;
    button?.setAttribute("aria-expanded", "false");
  }
  function toggle() {
    if (!panel && !init()) return;
    if (!panel.hidden) {
      close();
      return;
    }
    // Keep the existing category badge dropdown from overlapping the favorites menu.
    const badgeOptions = document.getElementById("hgMapCategoryOptions");
    if (badgeOptions) badgeOptions.hidden = true;
    document.querySelector(".hg-map-category-trigger")?.setAttribute("aria-expanded", "false");
    render();
    panel.hidden = false;
    button?.setAttribute("aria-expanded", "true");
  }

  function updateMapView(next) {
    window.HGMap?.setFavoriteViewOnly?.(next);
    // Keep the existing Explore place list consistent with the map.
    window.HGNearbyFilters?.setFavoritesOnly?.(next);
    window.updateNearbyFavoritesFilterButton?.();
    window.HGLeftPanelMode?.rerender?.();
    render();
  }

  function favoritePlaces() {
    const ids = new Set(window.HGFavoritePlaces?.getIds?.() || []);
    return (Array.isArray(window.PLACES) ? window.PLACES : [])
      .filter((place) => ids.has(String(place?.id || "")))
      .map((place) => ({ id: String(place.id), name: String(place.name || place.title || place.id) }))
      .sort((a, b) => a.name.localeCompare(b.name, "nb"));
  }

  function render() {
    if (!panel) return;
    const map = window.HGMap;
    const favoritesOnly = !!map?.getFavoriteViewOnly?.();
    const style = map?.getFavoriteMarkerStyle?.() || "badges";
    const count = window.HGFavoritePlaces?.count?.() || 0;
    const countLabel = panel.querySelector("[data-favorite-count]");
    if (countLabel) countLabel.textContent = count === 1 ? "1 favorittsted" : `${count} favorittsteder`;
    panel.querySelectorAll("[data-favorite-view]").forEach((el) => {
      const selected = (el.dataset.favoriteView === "favorites") === favoritesOnly;
      el.classList.toggle("is-active", selected);
      el.setAttribute("aria-pressed", String(selected));
    });
    panel.querySelectorAll("[data-favorite-style]").forEach((el) => {
      const selected = el.dataset.favoriteStyle === style;
      el.classList.toggle("is-active", selected);
      el.setAttribute("aria-pressed", String(selected));
    });

    const places = favoritePlaces();
    const select = /** @type {HTMLSelectElement|null} */ (panel.querySelector("[data-favorite-place]"));
    const iconSelect = /** @type {HTMLSelectElement|null} */ (panel.querySelector("[data-favorite-place-icon]"));
    const customSection = panel.querySelector("[data-favorite-custom]");
    if (customSection) customSection.hidden = style === "badges" || !places.length;
    if (select) {
      select.replaceChildren();
      for (const place of places) select.appendChild(new Option(place.name, place.id));
      if (!places.some((place) => place.id === selectedPlaceId)) selectedPlaceId = places[0]?.id || "";
      select.value = selectedPlaceId;
    }
    if (iconSelect) iconSelect.value = map?.getFavoritePlaceIcon?.(selectedPlaceId) || "default";
    const hint = panel.querySelector("[data-favorite-hint]");
    if (hint) hint.textContent = count
      ? "Velg visning og hvordan favorittstedene merkes på forsidekartet."
      : "Marker steder med ☆ i stedskortet for å legge dem til her.";
    if (button) {
      const icon = button.querySelector("[data-favorite-trigger-icon]");
      if (icon) icon.textContent = favoritesOnly ? "★" : "☆";
      button.classList.toggle("is-active", favoritesOnly);
      button.setAttribute("aria-pressed", String(favoritesOnly));
      button.setAttribute("aria-label", favoritesOnly ? "Favorittkart aktivt. Velg kartvisning" : "Åpne favorittvelger for kartet");
      button.title = "Velg favoritter på kartet";
    }
  }

  function init() {
    // The actual homepage badge selector belongs to the fixed map dock.
    // The old nearbyFavoritesFilterBtn is inside the hidden Explore drawer in map mode.
    const dock = document.querySelector(".map-controls");
    const badgeFilter = dock?.querySelector(".hg-map-category-filter");
    if (!(dock instanceof HTMLElement) || !(badgeFilter instanceof HTMLElement)) return false;
    if (panel && button?.isConnected && button.closest(".map-controls") === dock) return true;

    let host = dock.querySelector(".hg-map-favorite-filter");
    if (!(host instanceof HTMLElement)) {
      host = document.createElement("div");
      host.className = "hg-map-favorite-filter";
      dock.insertBefore(host, badgeFilter);
    }

    const existing = document.getElementById("hgMapFavoriteTrigger");
    button = existing instanceof HTMLButtonElement ? existing : document.createElement("button");
    if (!existing) {
      button.id = "hgMapFavoriteTrigger";
      button.type = "button";
      button.className = "hg-map-favorite-trigger";
      button.innerHTML = '<span data-favorite-trigger-icon aria-hidden="true">☆</span><span class="hg-map-favorite-label">Favoritter</span>';
    }
    if (button.parentElement !== host) host.appendChild(button);
    button.setAttribute("aria-haspopup", "dialog");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", "hgHomeFavoriteMapPicker");
    if (button.dataset.hgFavoritePickerBound !== "1") {
      button.dataset.hgFavoritePickerBound = "1";
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle();
      });
    }
    panel = document.getElementById("hgHomeFavoriteMapPicker");
    if (!panel) {
      panel = document.createElement("section");
      panel.id = "hgHomeFavoriteMapPicker";
      panel.className = "hg-home-favorite-map-picker";
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-label", "Favorittvelger for forsidekartet");
      panel.hidden = true;
      panel.innerHTML = `
        <div class="hg-fav-picker-heading">
          <strong>Mine favoritter</strong>
          <button type="button" class="hg-fav-picker-close" data-favorite-close aria-label="Lukk favorittvelger">×</button>
        </div>
        <small data-favorite-count></small>
        <p data-favorite-hint></p>
        <div class="hg-fav-picker-group" role="group" aria-label="Hvilke steder skal kartet vise?">
          <button type="button" data-favorite-view="all">Alle steder</button>
          <button type="button" data-favorite-view="favorites">★ Bare favoritter</button>
        </div>
        <div class="hg-fav-picker-subtitle">Kartikoner</div>
        <div class="hg-fav-picker-symbols" role="group" aria-label="Vis favoritter med"></div>
        <div class="hg-fav-picker-custom" data-favorite-custom>
          <label for="hgFavoritePlaceSelect">Velg eget ikon for et favorittsted</label>
          <select id="hgFavoritePlaceSelect" data-favorite-place></select>
          <select data-favorite-place-icon aria-label="Ikon for valgt favorittsted"></select>
        </div>
      `;
      const styleHost = panel.querySelector(".hg-fav-picker-symbols");
      for (const [id, emoji, label] of symbols) {
        const item = document.createElement("button");
        item.type = "button";
        item.dataset.favoriteStyle = id;
        item.textContent = `${emoji} ${label}`;
        item.setAttribute("aria-pressed", "false");
        styleHost.appendChild(item);
      }
      const iconSelect = panel.querySelector("[data-favorite-place-icon]");
      iconSelect.appendChild(new Option("Bruk valgt standardikon", "default"));
      for (const [id, emoji, label] of symbols) {
        if (id !== "badges") iconSelect.appendChild(new Option(`${emoji} ${label}`, id));
      }
      host.appendChild(panel);
      panel.addEventListener("click", (event) => {
        event.stopPropagation();
        const target2 = event.target instanceof Element ? event.target : null;
        if (target2?.closest("[data-favorite-close]")) { close(); return; }
        const view = target2?.closest("[data-favorite-view]")?.getAttribute("data-favorite-view");
        if (view) { updateMapView(view === "favorites"); return; }
        const style = target2?.closest("[data-favorite-style]")?.getAttribute("data-favorite-style");
        if (style) {
          window.HGMap?.setFavoriteMarkerStyle?.(style);
          // A styling choice should immediately show the personalized map.
          updateMapView(true);
        }
      });
      panel.querySelector("[data-favorite-place]").addEventListener("change", (event) => {
        selectedPlaceId = event.target instanceof HTMLSelectElement ? event.target.value : "";
        render();
      });
      panel.querySelector("[data-favorite-place-icon]").addEventListener("change", (event) => {
        window.HGMap?.setFavoritePlaceIcon?.(selectedPlaceId, event.target instanceof HTMLSelectElement ? event.target.value : "default");
        render();
      });
      document.addEventListener("click", (event) => {
        if (!panel?.hidden && !panel.contains(event.target) && !button?.contains(event.target)) close();
      });
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && panel && !panel.hidden) close();
      });
      window.addEventListener("hg:favorites-changed", render);
    }
    render();
    return true;
  }
  // The map dock may be injected after bootCritical; attach as soon as it exists.
  // Do not depend on opening Utforsk, and do not create a second map.
  let dockObserver = null;
  function ensureVisible() {
    if (init()) {
      dockObserver?.disconnect();
      dockObserver = null;
      return true;
    }
    if (!dockObserver && document.body && typeof MutationObserver === "function") {
      dockObserver = new MutationObserver(() => {
        if (document.querySelector(".map-controls .hg-map-category-filter")) {
          if (init()) {
            dockObserver.disconnect();
            dockObserver = null;
          }
        }
      });
      dockObserver.observe(document.body, { childList: true, subtree: true });
    }
    return false;
  }
  window.HGHomeFavoriteMapPicker = { init: ensureVisible, render, toggle, close };
})();
