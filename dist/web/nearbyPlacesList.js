(() => {
  // js/ui/nearbyPlacesList.ts
  var win = window;
  var PAGE_SIZE = 24;
  var search = "";
  var page = 0;
  var resultCount = 0;
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
    const image = place.image || place.cardImage || place.popupImage || "";
    const item = document.createElement("button");
    item.type = "button";
    item.className = "nearby-item";
    if (selection.freshPlaceId && String(place.id || "").trim() === selection.freshPlaceId) {
      item.classList.add("is-fresh-discovery");
    }
    const parts = buildMetaParts(place, selection, visited);
    item.innerHTML = `
    <span class="nearby-thumbWrap${image ? "" : " hg-image-missing"}">
      ${image ? `<img class="nearby-thumb" src="${escapeHTML(image)}" alt="" loading="lazy" decoding="async">` : ""}
      <img class="nearby-badge"
           src="bilder/merker/${escapeHTML(place.category)}.PNG"
           loading="lazy" decoding="async"
           alt="">
    </span>
    <span class="nearby-content">
      <span class="nearby-title">${escapeHTML(place.name)}</span>
      <span class="nearby-meta">${escapeHTML(parts.join(" \xB7 "))}</span>
    </span>
  `;
    item.addEventListener("click", () => {
      var _a, _b;
      void ((_b = (_a = win.HGPlaceOpen) == null ? void 0 : _a.preload) == null ? void 0 : _b.call(_a, place));
      routeToPlace(place.id);
    });
    return item;
  }
  function matchesSearch(place, selection, visited) {
    const text = [place.name, ...buildMetaParts(place, selection, visited)].join(" ");
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("nb").includes(search);
  }
  function render() {
    var _a, _b;
    const listEl = document.getElementById("nearbyList");
    const pager = document.getElementById("nearbyPlacePager");
    const previous = document.querySelector("#nearbyPlacePager [data-page-step='-1']");
    const next = document.querySelector("#nearbyPlacePager [data-page-step='1']");
    if (!listEl) return;
    const selection = (_b = (_a = win.HGNearbyPlaceSelector) == null ? void 0 : _a.select) == null ? void 0 : _b.call(_a);
    if (!selection) return;
    const { filterMode, sortMode, badgeFilter, favoritesOnly } = selection;
    const filterSignature = JSON.stringify([filterMode, sortMode, badgeFilter, favoritesOnly]);
    if (listEl.dataset.filterSignature !== filterSignature) {
      page = 0;
      listEl.scrollTop = 0;
      listEl.dataset.filterSignature = filterSignature;
    }
    const visited = win.visited || {};
    const matches = search ? selection.items.filter((place) => matchesSearch(place, selection, visited)) : selection.items;
    resultCount = matches.length;
    const lastPage = Math.max(0, Math.ceil(resultCount / PAGE_SIZE) - 1);
    page = Math.min(page, lastPage);
    const items = matches.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    if (pager) pager.hidden = listEl.hidden || lastPage === 0;
    if (previous) previous.disabled = page === 0;
    if (next) next.disabled = page === lastPage;
    const renderSignature = JSON.stringify([
      search,
      page,
      resultCount,
      createRenderSignature({ ...selection, items }),
      items.map((place) => Boolean(visited[place.id]))
    ]);
    if (listEl.dataset.renderSignature === renderSignature) return;
    listEl.dataset.renderSignature = renderSignature;
    if (!items.length) {
      if (search) {
        listEl.innerHTML = '<div class="hg-empty-guide">Ingen treff \u2013 pr\xF8v et annet s\xF8k.</div>';
      } else if (selection.favoritesOnly) {
        renderFavoritesEmpty(listEl);
      } else {
        renderBadgeFilterEmpty(listEl, selection.badgeFilter);
      }
      return;
    }
    const fragment = document.createDocumentFragment();
    for (const place of items) fragment.appendChild(createPlaceItem(place, selection, visited));
    listEl.replaceChildren(fragment);
  }
  function setSearch(query) {
    if (query === search) {
      const list2 = document.getElementById("nearbyList");
      const pager = document.getElementById("nearbyPlacePager");
      if (list2 && pager) pager.hidden = list2.hidden || resultCount <= PAGE_SIZE;
      return resultCount;
    }
    search = query;
    page = 0;
    render();
    const list = document.getElementById("nearbyList");
    if (list) list.scrollTop = 0;
    return resultCount;
  }
  document.querySelectorAll("#nearbyPlacePager [data-page-step]").forEach((button) => {
    button.addEventListener("click", () => {
      page += Number(button.dataset.pageStep);
      render();
      const list = document.getElementById("nearbyList");
      if (list) list.scrollTop = 0;
    });
  });
  var api = { render, setSearch };
  win.HGNearbyPlacesList = api;
  win.renderNearbyPlaces = render;
})();
