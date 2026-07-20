(() => {
  // js/ui/nearbyPlacesList.ts
  var win = window;
  function tUI(key, fallback = "") {
    var _a, _b;
    try {
      return ((_b = (_a = win.HG_I18N) == null ? void 0 : _a.t) == null ? void 0 : _b.call(_a, key, fallback)) || fallback;
    } catch {
      return fallback;
    }
  }
  function tfUI(key, fallback = "", vars = {}) {
    const template = tUI(key, fallback);
    return String(template).replace(
      /\{(\w+)\}/g,
      (_, name) => Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : `{${name}}`
    );
  }
  function escapeHTML(value) {
    return String(value != null ? value : "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function routeToPlace(placeId) {
    var _a;
    const id = String(placeId || "").trim();
    if (!id) return;
    const next = `#/place/${encodeURIComponent(id)}`;
    if (typeof ((_a = win.HGAppRouter) == null ? void 0 : _a.navigate) === "function") {
      win.HGAppRouter.navigate(next);
    } else if (window.location.hash !== next) {
      window.location.hash = next;
    }
  }
  function categoryNameForBadgeFilter(badgeFilter) {
    var _a, _b;
    const category = (_b = (_a = win.HGNearbyFilters) == null ? void 0 : _a.getCategoryById) == null ? void 0 : _b.call(_a, badgeFilter);
    return String((category == null ? void 0 : category.name) || badgeFilter);
  }
  function renderBadgeFilterEmpty(listEl, badgeFilter) {
    const label = categoryNameForBadgeFilter(badgeFilter);
    const noun = tUI("ui.noun.places", "steder");
    listEl.innerHTML = `
    <div class="hg-empty-guide">
      <div class="hg-empty-guide-icon">\u{1F3C5}</div>
      <div class="hg-empty-guide-title">${tUI("ui.empty.noMatches", "Ingen treff")}</div>
      <div class="hg-empty-guide-text">${escapeHTML(tfUI("ui.filter.noMatchesForBadge", "Ingen {noun} passer med badgefilteret {label}. Trykk badgeknappen for \xE5 velge et annet badge eller alle.", { noun, label }))}</div>
    </div>
  `;
  }
  function renderFavoritesEmpty(listEl) {
    listEl.innerHTML = `
    <div class="hg-empty-guide">
      <div class="hg-empty-guide-icon">\u2606</div>
      <div class="hg-empty-guide-title">Ingen favoritter enn\xE5</div>
      <div class="hg-empty-guide-text">Sl\xE5 av favorittfilteret, eller \xE5pne et sted og bruk stjernen i stedskortet for \xE5 lagre det som favoritt.</div>
    </div>
  `;
  }
  function createRenderSignature(selection) {
    const { items, filterMode, sortMode, badgeFilter, favoritesOnly, freshPlaceId } = selection;
    return JSON.stringify({
      ids: items.map((place) => String(place.id || "").trim()),
      filterMode,
      sortMode,
      badge: badgeFilter,
      favoritesOnly,
      freshPlaceId,
      distances: items.map((place) => {
        var _a;
        return (_a = place._d) != null ? _a : null;
      })
    });
  }
  function buildMetaParts(place, selection, visited) {
    const parts = [];
    if (selection.sortMode === "distance") {
      if (place._d != null) parts.push(`${place._d} m`);
    } else {
      if (place._timeLabel) {
        parts.push(
          place._epokeLabel ? `${place._timeLabel} \xB7 ${place._epokeLabel}` : place._timeLabel
        );
      }
      if (place._d != null) parts.push(`${place._d} m`);
    }
    if (visited[place.id]) parts.push("\u2714");
    if (selection.freshPlaceId && String(place.id || "").trim() === selection.freshPlaceId) {
      parts.push("Ny");
    }
    return parts;
  }
  function createPlaceItem(place, selection, visited) {
    const image = place.image || place.cardImage || "";
    const item = document.createElement("div");
    item.className = "nearby-item";
    if (selection.freshPlaceId && String(place.id || "").trim() === selection.freshPlaceId) {
      item.classList.add("is-fresh-discovery");
    }
    const parts = buildMetaParts(place, selection, visited);
    item.innerHTML = `
    <div class="nearby-thumbWrap">
      <img class="nearby-thumb" src="${image}" alt="${place.name || ""}" loading="lazy" decoding="async">
      <img class="nearby-badge"
           src="bilder/merker/${place.category || ""}.PNG"
           alt="">
    </div>

    <div class="nearby-content">
      <div class="nearby-title">${place.name || ""}</div>
      <div class="nearby-meta">
        ${parts.join(" \xB7 ")}
      </div>
    </div>
  `;
    item.addEventListener("click", () => routeToPlace(place.id));
    return item;
  }
  function render() {
    var _a, _b;
    const listEl = document.getElementById("nearbyList");
    if (!listEl) return;
    const selection = (_b = (_a = win.HGNearbyPlaceSelector) == null ? void 0 : _a.select) == null ? void 0 : _b.call(_a);
    if (!selection) {
      console.warn("[Nearby] HGNearbyPlaceSelector is not available");
      return;
    }
    const renderSignature = createRenderSignature(selection);
    if (listEl.dataset.renderSignature === renderSignature) return;
    listEl.dataset.renderSignature = renderSignature;
    listEl.innerHTML = "";
    if (!selection.items.length) {
      if (selection.favoritesOnly) {
        renderFavoritesEmpty(listEl);
      } else {
        renderBadgeFilterEmpty(listEl, selection.badgeFilter);
      }
      return;
    }
    const visited = win.visited || {};
    for (const place of selection.items) {
      listEl.appendChild(createPlaceItem(place, selection, visited));
    }
  }
  var api = { render };
  win.HGNearbyPlacesList = api;
  win.renderNearbyPlaces = render;
})();
