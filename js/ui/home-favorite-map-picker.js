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
    const select = panel.querySelector("[data-favorite-place]");
    const iconSelect = panel.querySelector("[data-favorite-place-icon]");
    const customSection = panel.querySelector("[data-favorite-custom]");
    if (customSection) customSection.hidden = style === "badges" || !places.length;
    if (select) {
      select.replaceChildren();
      for (const place of places) select.add(new Option(place.name, place.id));
      if (!places.some((place) => place.id === selectedPlaceId)) selectedPlaceId = places[0]?.id || "";
      select.value = selectedPlaceId;
    }
    if (iconSelect) iconSelect.value = map?.getFavoritePlaceIcon?.(selectedPlaceId) || "default";
    const hint = panel.querySelector("[data-favorite-hint]");
    if (hint) hint.textContent = count
      ? "Velg visning og hvordan favorittstedene merkes på forsidekartet."
      : "Marker steder med ☆ i stedskortet for å legge dem til her.";
    if (button) {
      button.textContent = favoritesOnly ? "★" : "☆";
      button.classList.toggle("is-active", favoritesOnly);
      button.setAttribute("aria-pressed", String(favoritesOnly));
      button.setAttribute("aria-label", "Favorittvelger for kartet");
      button.title = "Velg favoritter på kartet";
    }
  }

  function init() {
    if (panel && button?.isConnected) return true;
    const target = document.getElementById("nearbyFavoritesFilterBtn");
    const host = document.querySelector("#nearbyListContainer .leftpanel-head");
    if (!(target instanceof HTMLButtonElement) || !(host instanceof HTMLElement)) return false;
    button = target;
    button.setAttribute("aria-haspopup", "dialog");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", "hgHomeFavoriteMapPicker");
    // The old button immediately toggles only the nearby list. Intercept it so
    // this same control instead opens the map-and-icons selector.
    if (button.dataset.hgFavoritePickerBound !== "1") {
      button.dataset.hgFavoritePickerBound = "1";
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        toggle();
      }, true);
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
      iconSelect.add(new Option("Bruk valgt standardikon", "default"));
      for (const [id, emoji, label] of symbols) {
        if (id !== "badges") iconSelect.add(new Option(`${emoji} ${label}`, id));
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
        selectedPlaceId = String(event.target.value || "");
        render();
      });
      panel.querySelector("[data-favorite-place-icon]").addEventListener("change", (event) => {
        window.HGMap?.setFavoritePlaceIcon?.(selectedPlaceId, event.target.value);
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
  window.HGHomeFavoriteMapPicker = { init, render, toggle, close };
})();
