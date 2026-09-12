// @ts-nocheck
// js/ui/place-onsite-surface.js
// PlaceCard viser kompakte snarveier til de canonicale Events- og Møtes-flatene.
// Utforsk beholder de globale oversiktene; PlaceCard dupliserer ikke state/data.
(function installPlaceOnSiteSurface(global) {
  "use strict";

  const SURFACE_ATTR = "data-hg-onsite-surface";
  const POLICY_ATTR = "data-hg-onsite-policy";
  const BOUND_FLAG = "__HG_PLACE_ONSITE_SURFACE_BOUND__";
  const POLICY_URL = "data/categories/place_onsite_contract.json";
  const CORE_SHORTCUTS = ["events", "meet"];
  let observer = null;
  let policyVersion = "fallback";
  let eventsInitPromise = null;
  let policy = {
    actions: {
      events: { label: "Events", icon: "📅" },
      meet: { label: "Møtes", icon: "🤝" },
      play: { label: "Lek", icon: "🛝" }
    },
    categoryPolicy: {},
    placeTypeOverrides: {
      lekeplass: { play: "always" },
      lekepark: { play: "always" },
      playground: { play: "always" }
    }
  };

  const text = value => String(value == null ? "" : value).trim();
  const list = value => Array.isArray(value) ? value : [];
  const esc = value => String(value == null ? "" : value)
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  const norm = value => text(value).toLowerCase().replaceAll("-", "_").replaceAll(" ", "_");

  function removeLegacyActionNodes() {
    ["pcTasksIcon", "pcTasksList", "pcTrainingIcon", "pcTrainingList"].forEach(id => {
      document.getElementById(id)?.remove();
    });
  }

  function currentPlace() {
    const id = text(document.getElementById("placeCard")?.dataset?.currentPlaceId);
    if (!id) return null;
    return list(global.PLACES).find(place => text(place?.id) === id) || null;
  }

  function categoryId(place) {
    return norm(place?.category || place?.categoryId || place?.domain || "");
  }

  function placeTypeIds(place) {
    return [
      place?.placeType,
      place?.place_type,
      place?.locatorType,
      place?.locator_type,
      place?.type,
      place?.subtype
    ].map(norm).filter(Boolean);
  }

  function playCount(place) {
    const profile = place?.play_profile && typeof place.play_profile === "object" ? place.play_profile : null;
    return profile ? list(profile.activities || profile.items || profile.tasks).filter(Boolean).length : 0;
  }

  function actionDataCount(actionId, place) {
    if (actionId === "play") return playCount(place);
    return 0;
  }

  function resolvedPolicy(place) {
    const category = categoryId(place);
    const base = {
      play: "never",
      ...(policy.categoryPolicy?.[category] || {})
    };
    for (const typeId of placeTypeIds(place)) {
      Object.assign(base, policy.placeTypeOverrides?.[typeId] || {});
    }
    return base;
  }

  function visibleActions(place) {
    const resolved = resolvedPolicy(place);
    return Object.entries(resolved)
      .filter(([actionId, mode]) => mode === "always" || (mode === "whenData" && actionDataCount(actionId, place) > 0))
      .map(([actionId]) => actionId);
  }

  function eventsForPlace(placeId) {
    const runtime = global.HGEvents;
    if (!runtime) return [];
    if (typeof runtime.getUpcomingByPlace === "function") {
      return list(runtime.getUpcomingByPlace(placeId));
    }
    if (typeof runtime.getByPlace === "function") {
      return list(runtime.getByPlace(placeId));
    }
    return list(runtime.all).filter(event => text(event?.place_id) === text(placeId));
  }

  function ensureEventsReady() {
    const runtime = global.HGEvents;
    if (!runtime || typeof runtime.init !== "function") return Promise.resolve(runtime || null);
    if (runtime.ready) return Promise.resolve(runtime);
    if (!eventsInitPromise) {
      eventsInitPromise = Promise.resolve()
        .then(() => runtime.init())
        .then(result => {
          decorate(true);
          return result;
        })
        .catch(error => {
          eventsInitPromise = null;
          if (global.DEBUG) console.warn("[På stedet] events kunne ikke lastes", error);
          return null;
        });
    }
    return eventsInitPromise;
  }

  function formatEventDate(value) {
    const raw = text(value);
    if (!raw) return "";
    const ms = Date.parse(raw);
    if (!Number.isFinite(ms)) return raw;
    return new Intl.DateTimeFormat("nb-NO", {
      day: "numeric",
      month: "short",
      hour: raw.length > 10 ? "2-digit" : undefined,
      minute: raw.length > 10 ? "2-digit" : undefined
    }).format(new Date(ms));
  }

  function renderPlayProfile(place) {
    const profile = place?.play_profile && typeof place.play_profile === "object" ? place.play_profile : null;
    if (!profile) return '<div class="pc-empty">Ingen lek registrert for denne lekeplassen ennå</div>';
    const items = list(profile.activities || profile.items || profile.tasks).filter(Boolean);
    return `<article class="pc-tasks-card pc-play-card"><h2 class="pc-tasks-title">${esc(profile.title || "Lek")}</h2>${text(profile.summary) ? `<p class="pc-tasks-summary">${esc(profile.summary)}</p>` : ""}${items.length ? `<ol class="pc-tasks-list">${items.map(item => `<li class="pc-task-item">${text(item?.title || item?.name) ? `<h3 class="pc-task-title">${esc(item.title || item.name)}</h3>` : ""}${text(item?.instruction || item?.desc || item?.description) ? `<p class="pc-task-instruction">${esc(item.instruction || item.desc || item.description)}</p>` : ""}</li>`).join("")}</ol>` : '<div class="pc-empty">Ingen lekeforslag registrert ennå</div>'}</article>`;
  }

  function renderEventContent(events) {
    if (!events.length) return '<div class="pc-empty">Ingen kommende events er registrert her akkurat nå.</div>';
    return `<div class="pc-onsite-event-popup">${events.map(event => {
      const when = formatEventDate(event?.start || event?.date || event?.start_date || event?.year);
      return `<article class="pc-onsite-event"><strong>${esc(event?.title || event?.name || event?.id || "Event")}</strong>${when ? `<span>${esc(when)}</span>` : ""}</article>`;
    }).join("")}</div>`;
  }

  function renderMeetHub(place) {
    const placeId = text(place?.id);
    return `<div class="pc-onsite-meet-hub">
      <button type="button" class="pc-onsite-meet-choice" data-hg-meet-hub-action="propose" data-place-id="${esc(placeId)}">
        <span aria-hidden="true">🧠</span><span><strong>Foreslå kunnskapsmøte</strong><small>Start et møte rundt dette stedet.</small></span>
      </button>
      <button type="button" class="pc-onsite-meet-choice" data-hg-meet-hub-action="manage" data-place-id="${esc(placeId)}">
        <span aria-hidden="true">🤝</span><span><strong>Mine møter / Social Meet</strong><small>Se forslag, avtaler og historikk.</small></span>
      </button>
    </div>`;
  }

  function button(actionId, placeId, count = 0) {
    const def = policy.actions?.[actionId] || {};
    const countHtml = actionId === "events" && count > 0
      ? `<span class="pc-onsite-action-count">${count}</span>`
      : "";
    return `<button class="pc-onsite-action pc-onsite-action-${esc(actionId)}" type="button" data-hg-onsite-action="${esc(actionId)}" data-place-id="${esc(placeId)}"><span class="pc-onsite-action-icon">${esc(def.icon || "•")}</span><span class="pc-onsite-action-label">${esc(def.label || actionId)}</span>${countHtml}</button>`;
  }

  function renderSurface(place) {
    const placeId = text(place?.id);
    if (!placeId) return "";
    const events = eventsForPlace(placeId);
    const localActions = visibleActions(place);
    const actions = [...CORE_SHORTCUTS, ...localActions.filter(actionId => !CORE_SHORTCUTS.includes(actionId))];
    const buttons = actions.map(actionId => button(actionId, placeId, actionId === "events" ? events.length : 0));
    return `<div class="pc-onsite-surface" ${SURFACE_ATTR}="${esc(placeId)}" ${POLICY_ATTR}="${esc(policyVersion)}"><div class="pc-onsite-actions" role="group" aria-label="Stedsfunksjoner">${buttons.join("")}</div></div>`;
  }

  function decorate(force = false) {
    const box = document.getElementById("pcEventsBox");
    const place = currentPlace();
    if (!box || !place) return;
    const placeId = text(place.id);
    const existing = box.querySelector(`[${SURFACE_ATTR}]`);
    if (!force && existing?.getAttribute(SURFACE_ATTR) === placeId && existing?.getAttribute(POLICY_ATTR) === policyVersion) return;
    [...box.children].forEach(child => { if (!child.classList?.contains("pc-events-head")) child.remove(); });
    const html = renderSurface(place);
    box.hidden = !html;
    if (html) box.insertAdjacentHTML("beforeend", html);
  }

  function openPlay() {
    const place = currentPlace();
    global.showPlaceCardRoundPopup?.({ title:"Lek", subtitle:text(place?.name || place?.title), html:renderPlayProfile(place), place, kind:"play" });
  }

  async function openEvents(placeId) {
    await ensureEventsReady();
    const place = currentPlace();
    const events = eventsForPlace(placeId);
    if (typeof global.showPlaceCardRoundPopup === "function") {
      return global.showPlaceCardRoundPopup({
        title: "Events",
        subtitle: text(place?.name || place?.title),
        html: renderEventContent(events),
        place,
        kind: "events"
      });
    }
    global.showToast?.(events.length ? `${events.length} event${events.length === 1 ? "" : "s"} registrert her.` : "Ingen kommende events registrert her.");
  }

  function openMeetHub(placeId) {
    const place = currentPlace();
    if (typeof global.showPlaceCardRoundPopup === "function") {
      return global.showPlaceCardRoundPopup({
        title: "Møtes",
        subtitle: text(place?.name || place?.title),
        html: renderMeetHub(place),
        place,
        kind: "meet"
      });
    }
    return openSocialMeet(placeId);
  }

  function openSocialMeet(placeId) {
    if (typeof global.HG_SocialMeetUI?.open === "function") {
      return global.HG_SocialMeetUI.open({
        filter: "place",
        placeId,
        sourceSurface: "placeCardOnSite"
      });
    }
    global.showToast?.("Møtefunksjonen er ikke lastet ennå");
  }

  function openKnowledgeMeet(placeId) {
    const place = currentPlace();
    if (typeof global.HG_SpotmeetingUI?.open === "function") {
      return global.HG_SpotmeetingUI.open({
        contextType: "place",
        contextId: placeId,
        title: text(place?.name || place?.title || placeId),
        reason: "Kunnskapsmøte rundt dette stedet",
        sourceSurface: "placeCardOnSite",
        preferredAction: "match"
      });
    }
    global.showToast?.("Kunnskapsmøte er ikke lastet ennå");
  }

  function handleClick(event) {
    const target = event.target instanceof Element ? event.target : null;

    const meetHubAction = target?.closest?.("[data-hg-meet-hub-action]");
    if (meetHubAction instanceof HTMLElement) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      const action = text(meetHubAction.dataset.hgMeetHubAction);
      const placeId = text(meetHubAction.dataset.placeId || currentPlace()?.id);
      if (!placeId) return;
      if (action === "propose") return openKnowledgeMeet(placeId);
      if (action === "manage") return openSocialMeet(placeId);
      return;
    }

    const surface = target?.closest?.(`[${SURFACE_ATTR}]`);
    if (!surface) return;
    const buttonEl = target.closest("[data-hg-onsite-action]");
    if (!(buttonEl instanceof HTMLElement)) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    const action = text(buttonEl.dataset.hgOnsiteAction);
    const placeId = text(buttonEl.dataset.placeId || currentPlace()?.id);
    if (!placeId) return;
    if (action === "events") return void openEvents(placeId);
    if (action === "meet") return openMeetHub(placeId);
    if (action === "play") return openPlay();
  }

  async function loadPolicy() {
    try {
      const response = await fetch(POLICY_URL, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const loaded = await response.json();
      if (!loaded || typeof loaded !== "object") throw new Error("Ugyldig På stedet-kontrakt");
      policy = loaded;
      policyVersion = text(loaded.version || "1");
      global.HGPlaceOnSitePolicy = loaded;
      decorate(true);
    } catch (error) {
      if (global.DEBUG) console.warn("[På stedet] kunne ikke laste kategori-kontrakt", error);
    }
  }

  function observe() {
    const card = document.getElementById("placeCard");
    if (!card || observer) return;
    observer = new MutationObserver(() => decorate());
    observer.observe(card, { attributes:true, attributeFilter:["data-current-place-id"] });
  }

  function init() {
    removeLegacyActionNodes();
    if (!global[BOUND_FLAG]) {
      document.addEventListener("click", handleClick, true);
      global[BOUND_FLAG] = true;
    }
    decorate();
    observe();
    loadPolicy();
    ensureEventsReady();
  }

  global.HGPlaceOnSiteSurface = {
    decorate,
    renderSurface,
    renderPlayProfile,
    renderEventContent,
    renderMeetHub,
    resolvedPolicy,
    visibleActions,
    eventsForPlace
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once:true });
  } else {
    init();
  }

  ["hg:appReady", "hg:place-selected", "hg:placesUpdated"].forEach(name => {
    global.addEventListener?.(name, () => {
      decorate();
      if (name === "hg:placesUpdated") ensureEventsReady();
    });
  });
})(window);
