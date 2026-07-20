(() => {
  // js/ui/nearbyPeopleList.ts
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
  function getActiveBadgeFilter() {
    var _a, _b;
    return ((_b = (_a = win.HGNearbyFilters) == null ? void 0 : _a.getActiveBadgeFilter) == null ? void 0 : _b.call(_a)) || "all";
  }
  function isBadgeFilterActive() {
    var _a, _b;
    return ((_b = (_a = win.HGNearbyFilters) == null ? void 0 : _a.isBadgeFilterActive) == null ? void 0 : _b.call(_a)) || false;
  }
  function categoryNameForBadgeFilter() {
    var _a, _b;
    const id = getActiveBadgeFilter();
    const category = (_b = (_a = win.HGNearbyFilters) == null ? void 0 : _a.getCategoryById) == null ? void 0 : _b.call(_a, id);
    return String((category == null ? void 0 : category.name) || id);
  }
  function renderBadgeFilterEmpty(listEl) {
    const label = categoryNameForBadgeFilter();
    const noun = tUI("ui.noun.people", "personer");
    listEl.innerHTML = `
    <div class="hg-empty-guide">
      <div class="hg-empty-guide-icon">\u{1F3C5}</div>
      <div class="hg-empty-guide-title">${tUI("ui.empty.noMatches", "Ingen treff")}</div>
      <div class="hg-empty-guide-text">${escapeHTML(tfUI("ui.filter.noMatchesForBadge", "Ingen {noun} passer med badgefilteret {label}. Trykk badgeknappen for \xE5 velge et annet badge eller alle.", { noun, label }))}</div>
    </div>
  `;
  }
  function personPlaceIds(person) {
    const ids = /* @__PURE__ */ new Set();
    if (person.placeId) ids.add(String(person.placeId).trim());
    for (const placeId of person.places || []) {
      const id = String(placeId || "").trim();
      if (id) ids.add(id);
    }
    return ids;
  }
  function personMatchesActiveBadge(person, placesById) {
    if (!isBadgeFilterActive()) return true;
    const activeBadge = getActiveBadgeFilter();
    if (String(person.category || "").trim() === activeBadge) return true;
    for (const placeId of personPlaceIds(person)) {
      const place = placesById.get(placeId);
      if (place && String(place.category || "").trim() === activeBadge) return true;
    }
    return false;
  }
  function distanceForPerson(person, placesById, position) {
    const distMeters = win.distMeters;
    const placeIds = personPlaceIds(person);
    if (!placeIds.size || !position || typeof distMeters !== "function") return Infinity;
    let min = Infinity;
    for (const placeId of placeIds) {
      const place = placesById.get(placeId);
      if (!place || !Number.isFinite(place.lat) || !Number.isFinite(place.lon)) continue;
      const distance = distMeters(position, { lat: place.lat, lon: place.lon });
      if (Number.isFinite(distance) && distance < min) min = distance;
    }
    return min;
  }
  function openPerson(person) {
    if (typeof win.showPersonPopup === "function") {
      win.showPersonPopup(person);
    } else if (typeof win.openPersonCard === "function") {
      win.openPersonCard(person);
    }
  }
  function render() {
    var _a;
    const listEl = document.getElementById("leftPeopleList");
    if (!listEl) return;
    const people = Array.isArray(win.PEOPLE) ? win.PEOPLE : [];
    const places = Array.isArray(win.PLACES) ? win.PLACES : [];
    const visited = win.visited || {};
    const relations = win.REL_BY_PLACE || {};
    listEl.innerHTML = "";
    if (!people.length) {
      listEl.innerHTML = `
      <div class="hg-empty-guide">
        <div class="hg-empty-guide-icon">\u{1F464}</div>
        <div class="hg-empty-guide-title">${tUI("ui.people.loading", "Folk lastes inn")}</div>
        <div class="hg-empty-guide-text">${tUI("ui.people.loadingText", "Personene som h\xF8rer til Oslo lastes n\xE5.")}</div>
      </div>
    `;
      return;
    }
    const visitedRelatedIds = /* @__PURE__ */ new Set();
    for (const placeId of Object.keys(visited).filter((id) => visited[id])) {
      for (const relation of relations[placeId] || []) {
        if (relation.person) visitedRelatedIds.add(relation.person);
      }
    }
    const position = (_a = win.getPos) == null ? void 0 : _a.call(win);
    const placesById = new Map(places.map((place) => [String(place.id || "").trim(), place]));
    let decorated = people.map((person) => ({
      person,
      isVisited: visitedRelatedIds.has(person.id),
      dist: distanceForPerson(person, placesById, position)
    }));
    if (isBadgeFilterActive()) {
      decorated = decorated.filter(({ person }) => personMatchesActiveBadge(person, placesById));
    }
    if (!decorated.length) {
      renderBadgeFilterEmpty(listEl);
      return;
    }
    decorated.sort((a, b) => {
      if (a.isVisited !== b.isVisited) return a.isVisited ? -1 : 1;
      if (a.dist !== b.dist) return a.dist - b.dist;
      return String(a.person.name || "").localeCompare(String(b.person.name || ""), "nb");
    });
    for (const { person, isVisited, dist } of decorated) {
      const image = person.cardImage || person.image || "";
      const distText = Number.isFinite(dist) ? `${Math.round(dist)} m` : "";
      const item = document.createElement("div");
      item.className = `nearby-item${isVisited ? " is-visited" : ""}`;
      item.dataset.personId = String(person.id || "").trim();
      const thumb = image ? `<img class="nearby-thumb" src="${image}" alt="${person.name || ""}"
              onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'nearby-thumb nearby-thumb-icon',textContent:'\u{1F464}'}))">` : `<div class="nearby-thumb nearby-thumb-icon">\u{1F464}</div>`;
      item.innerHTML = `
      <div class="nearby-thumbWrap">${thumb}</div>
      <div class="nearby-content">
        <div class="nearby-title">${person.name || ""}</div>
        ${distText || isVisited ? `<div class="nearby-meta">${distText}${isVisited ? " \xB7 \u2714" : ""}</div>` : ""}
      </div>
    `;
      item.addEventListener("click", () => openPerson(person));
      listEl.appendChild(item);
    }
  }
  var api = { render };
  win.HGNearbyPeopleList = api;
  win.renderNearbyPeople = render;
})();
