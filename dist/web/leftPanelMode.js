(() => {
  // js/ui/leftPanelMode.ts
  var win = window;
  var LIST_IDS_BY_MODE = {
    nearby: "nearbyList",
    people: "leftPeopleList",
    nature: "leftNatureList",
    events: "leftEventsList",
    social: "leftSocialList",
    routes: "leftRoutesList",
    badges: "leftBadgesList"
  };
  var MODES = new Set(Object.keys(LIST_IDS_BY_MODE));
  var renderRaf = 0;
  var renderTimer = 0;
  function normalizeMode(mode) {
    const normalized = String(mode != null ? mode : "").trim();
    return MODES.has(normalized) ? normalized : "nearby";
  }
  function getActiveMode() {
    var _a;
    const activeMode = (_a = document.querySelector(".nearby-tab.is-active")) == null ? void 0 : _a.getAttribute("data-leftmode");
    return normalizeMode(activeMode);
  }
  function cleanText(value) {
    return String(value == null ? "" : value).trim();
  }
  function escapeHtml(value) {
    return cleanText(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function list(value) {
    return Array.isArray(value) ? value : [];
  }
  function selectedPlaceId() {
    const card = document.getElementById("placeCard");
    return cleanText(card instanceof HTMLElement ? card.dataset.currentPlaceId : "");
  }
  function placeById(placeId) {
    const id = cleanText(placeId);
    if (!id) return null;
    return list(win.PLACES).find((place) => cleanText(place && place.id) === id) || null;
  }
  function formatEventDate(value) {
    const raw = cleanText(value);
    if (!raw) return "";
    const timestamp = Date.parse(raw);
    if (!Number.isFinite(timestamp)) return raw;
    const options = raw.length <= 10 ? { day: "numeric", month: "short" } : { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" };
    return new Intl.DateTimeFormat("nb-NO", options).format(new Date(timestamp));
  }
  function eventIsCurrent(event, now = Date.now()) {
    const status = cleanText(event.status).toLowerCase();
    if (status === "cancelled" || status === "past") return false;
    if (status === "ongoing") return true;
    const endMs = Date.parse(cleanText(event.end));
    if (Number.isFinite(endMs)) return endMs >= now;
    const startRaw = cleanText(event.start);
    const startMs = Date.parse(startRaw);
    if (!Number.isFinite(startMs)) return status === "upcoming";
    const startDate = new Date(startMs);
    const today = new Date(now);
    const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    return startDate.getTime() >= dayStart;
  }
  function bindExploreEvents(host) {
    if (host.dataset.hgExploreEventsBound === "1") return;
    host.dataset.hgExploreEventsBound = "1";
    host.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target.closest("[data-explore-event-place]") : null;
      if (!(target instanceof HTMLElement)) return;
      const placeId = cleanText(target.dataset.exploreEventPlace);
      if (!placeId) return;
      event.preventDefault();
      if (typeof win.closeNearbyDrawer === "function") win.closeNearbyDrawer();
      const opened = win.HGMapView && typeof win.HGMapView.openPlace === "function" ? win.HGMapView.openPlace(placeId) : false;
      if (opened === false && typeof win.showToast === "function") {
        win.showToast("Kunne ikke \xE5pne stedet for eventet akkurat n\xE5.");
      }
    });
  }
  async function renderExploreEvents() {
    const host = document.getElementById("leftEventsList");
    if (!(host instanceof HTMLElement)) return;
    bindExploreEvents(host);
    const eventsRuntime = win.HGEvents;
    if (!eventsRuntime) {
      host.innerHTML = '<div class="hg-explore-empty">Eventoversikten lastes inn \u2026</div>';
      return;
    }
    if (!eventsRuntime.ready && typeof eventsRuntime.init === "function") {
      try {
        await eventsRuntime.init();
      } catch {
        host.innerHTML = '<div class="hg-explore-empty">Kunne ikke laste events akkurat n\xE5.</div>';
        return;
      }
    }
    const events = list(
      typeof eventsRuntime.getAll === "function" ? eventsRuntime.getAll() : eventsRuntime.all
    ).filter((event) => eventIsCurrent(event)).sort((a, b) => {
      const aMs = Date.parse(cleanText(a.start));
      const bMs = Date.parse(cleanText(b.start));
      const safeA = Number.isFinite(aMs) ? aMs : Number.MAX_SAFE_INTEGER;
      const safeB = Number.isFinite(bMs) ? bMs : Number.MAX_SAFE_INTEGER;
      if (safeA !== safeB) return safeA - safeB;
      return cleanText(a.title).localeCompare(cleanText(b.title), "nb");
    }).slice(0, 24);
    if (!events.length) {
      host.innerHTML = '<div class="hg-explore-empty">Ingen kommende events er registrert akkurat n\xE5.</div>';
      return;
    }
    host.innerHTML = events.map((event) => {
      const placeId = cleanText(event.place_id);
      const place = placeById(placeId);
      const placeName = cleanText(place && (place.name || place.title) || placeId);
      const when = formatEventDate(event.start);
      const description = cleanText(event.description);
      return `<button type="button" class="hg-explore-card hg-explore-event-card" data-explore-event-place="${escapeHtml(placeId)}">
      <span class="hg-explore-card-kicker">${escapeHtml(when || "Event")}</span>
      <strong>${escapeHtml(event.title || "Event")}</strong>
      <span class="hg-explore-card-meta">${escapeHtml(placeName || "History Go-sted")}</span>
      ${description ? `<small>${escapeHtml(description)}</small>` : ""}
    </button>`;
    }).join("");
  }
  function bindExploreSocial(host) {
    if (host.dataset.hgExploreSocialBound === "1") return;
    host.dataset.hgExploreSocialBound = "1";
    host.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target.closest("[data-explore-social-action]") : null;
      if (!(target instanceof HTMLElement)) return;
      const action = cleanText(target.dataset.exploreSocialAction);
      if (action === "manage") {
        event.preventDefault();
        if (win.HG_SocialMeetUI && typeof win.HG_SocialMeetUI.open === "function") {
          win.HG_SocialMeetUI.open({
            filter: "all",
            placeId: "",
            sourceSurface: "explorePanel"
          });
        } else if (typeof win.showToast === "function") {
          win.showToast("Social Meet er ikke lastet enn\xE5.");
        }
        return;
      }
      if (action !== "propose") return;
      event.preventDefault();
      const placeId = selectedPlaceId();
      const place = placeById(placeId);
      if (!placeId || !place) {
        if (typeof win.showToast === "function") {
          win.showToast("Velg et sted f\xF8rst for \xE5 foresl\xE5 et kunnskapsm\xF8te.");
        }
        return;
      }
      if (win.HG_SpotmeetingUI && typeof win.HG_SpotmeetingUI.open === "function") {
        win.HG_SpotmeetingUI.open({
          contextType: "place",
          contextId: placeId,
          title: cleanText(place.name || place.title || placeId),
          reason: "Kunnskapsm\xF8te rundt dette stedet",
          sourceSurface: "explorePanel",
          preferredAction: "match"
        });
      } else if (typeof win.showToast === "function") {
        win.showToast("Kunnskapsm\xF8te er ikke lastet enn\xE5.");
      }
    });
  }
  function renderExploreSocial() {
    const host = document.getElementById("leftSocialList");
    if (!(host instanceof HTMLElement)) return;
    bindExploreSocial(host);
    const placeId = selectedPlaceId();
    const place = placeById(placeId);
    const placeName = cleanText(place && (place.name || place.title) || "");
    const proposeDisabled = !placeId || !place;
    const proposeMeta = proposeDisabled ? "Velg et sted under Steder f\xF8rst." : `Rundt ${placeName}.`;
    host.innerHTML = `
    <article class="hg-explore-card hg-explore-social-card">
      <span class="hg-explore-card-kicker">M\xF8tes</span>
      <strong>Foresl\xE5 kunnskapsm\xF8te</strong>
      <span class="hg-explore-card-meta">${escapeHtml(proposeMeta)}</span>
      <button type="button" data-explore-social-action="propose" ${proposeDisabled ? "disabled" : ""}>Foresl\xE5 m\xF8te</button>
    </article>
    <article class="hg-explore-card hg-explore-social-card">
      <span class="hg-explore-card-kicker">Social Meet</span>
      <strong>Mine m\xF8ter</strong>
      <span class="hg-explore-card-meta">Forslag, avtaler, svar, l\xE6ringssirkler og m\xF8tehistorikk.</span>
      <button type="button" data-explore-social-action="manage">\xC5pne Social Meet</button>
    </article>
  `;
  }
  function updateControlVisibility() {
    const mode = getActiveMode();
    const placeFilterButton = document.getElementById("nearbyFilterBtn");
    const badgeButton = document.getElementById("nearbyBadgeFilterBtn");
    const sortButton = document.getElementById("nearbySortBtn");
    const favoritesButton = document.getElementById("nearbyFavoritesFilterBtn");
    if (placeFilterButton) {
      placeFilterButton.style.display = mode === "nearby" || mode === "nature" ? "inline-flex" : "none";
    }
    if (badgeButton) {
      badgeButton.style.display = mode === "nature" ? "none" : "inline-flex";
    }
    if (sortButton) {
      sortButton.style.display = mode === "nearby" ? "inline-flex" : "none";
    }
    if (favoritesButton) {
      favoritesButton.style.display = mode === "nearby" ? "inline-flex" : "none";
    }
  }
  function renderNow() {
    var _a, _b, _c, _d, _e;
    const mode = getActiveMode();
    if (mode === "nearby") (_a = win.renderNearbyPlaces) == null ? void 0 : _a.call(win);
    if (mode === "people") (_b = win.renderNearbyPeople) == null ? void 0 : _b.call(win);
    if (mode === "nature") (_c = win.renderNearbyNature) == null ? void 0 : _c.call(win);
    if (mode === "events") void renderExploreEvents();
    if (mode === "social") renderExploreSocial();
    if (mode === "routes") (_d = win.renderLeftRoutesList) == null ? void 0 : _d.call(win);
    if (mode === "badges") (_e = win.renderLeftBadges) == null ? void 0 : _e.call(win);
  }
  function rerender() {
    if (typeof win.requestAnimationFrame === "function") {
      if (renderRaf) win.cancelAnimationFrame(renderRaf);
      renderRaf = win.requestAnimationFrame(() => {
        renderRaf = 0;
        renderNow();
      });
      return;
    }
    if (renderTimer) win.clearTimeout(renderTimer);
    renderTimer = win.setTimeout(() => {
      renderTimer = 0;
      renderNow();
    }, 0);
  }
  function setMode(input) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    const mode = normalizeMode(input);
    for (const [candidateMode, id] of Object.entries(LIST_IDS_BY_MODE)) {
      const list2 = document.getElementById(id);
      if (list2) list2.hidden = candidateMode !== mode;
    }
    if (mode === "nature") {
      (_b = (_a = win.HGNearbyFilters) == null ? void 0 : _a.setActiveBadgeFilter) == null ? void 0 : _b.call(_a, "all");
    }
    try {
      localStorage.setItem("hg_leftpanel_mode_v1", mode);
    } catch {
    }
    document.querySelectorAll(".nearby-tab").forEach((button) => {
      const active = button.getAttribute("data-leftmode") === mode;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", active ? "true" : "false");
    });
    (_c = win.updateNearbyFilterButton) == null ? void 0 : _c.call(win);
    (_d = win.updateNearbyBadgeFilterButton) == null ? void 0 : _d.call(win);
    (_e = win.updateNearbySortButton) == null ? void 0 : _e.call(win);
    updateControlVisibility();
    rerender();
    (_g = (_f = win.HGMap) == null ? void 0 : _f.resize) == null ? void 0 : _g.call(_f);
    (_i = (_h = win.MAP) == null ? void 0 : _h.resize) == null ? void 0 : _i.call(_h);
    return mode;
  }
  win.HGLeftPanelMode = {
    getActiveMode,
    setMode,
    renderNow,
    rerender,
    updateControlVisibility
  };
  win.addEventListener("hg:placeCardUpdated", () => {
    if (getActiveMode() === "social") rerender();
  });
  win.addEventListener("hg:spotmeetingChanged", () => {
    if (getActiveMode() === "social") rerender();
  });
})();
