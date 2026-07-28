// @ts-nocheck
// js/ui/place-onsite-surface.js
// Canonical "På stedet"-flate under PlaceCard-rundingene.
// Synlighet styres av data/categories/place_onsite_contract.json.
(function installPlaceOnSiteSurface(global) {
  "use strict";

  const SURFACE_ATTR = "data-hg-onsite-surface";
  const POLICY_ATTR = "data-hg-onsite-policy";
  const BOUND_FLAG = "__HG_PLACE_ONSITE_SURFACE_BOUND__";
  const POLICY_URL = "data/categories/place_onsite_contract.json";
  let observer = null;
  let policyVersion = "fallback";
  let policy = {
    actions: {
      events: { label: "Events", icon: "📅" },
      "social-meet": { label: "Avtal å møtes", icon: "👥" },
      "knowledge-meet": { label: "Kunnskapsmøte", icon: "🧠" },
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

  function socialForPlace(placeId) {
    return global.__HG_PLACE_SOCIAL_CACHE__?.[placeId] || {
      place_id: placeId,
      social_enabled: true,
      social_modes: ["meetup", "message_game", "group_quiz"],
      canonical_event_ids: []
    };
  }

  function eventsForPlace(placeId, social) {
    const ids = list(social?.canonical_event_ids).map(text).filter(Boolean);
    const idSet = new Set(ids);
    return list(global.__HG_CANONICAL_SOCIAL_EVENTS__).filter(event => {
      const eventId = text(event?.id);
      return text(event?.place_id) === placeId && (!idSet.size || idSet.has(eventId));
    });
  }

  function playCount(place) {
    const profile = place?.play_profile && typeof place.play_profile === "object" ? place.play_profile : null;
    return profile ? list(profile.activities || profile.items || profile.tasks).filter(Boolean).length : 0;
  }

  function actionDataCount(actionId, place, events) {
    if (actionId === "events") return events.length;
    if (actionId === "play") return playCount(place);
    return 1;
  }

  function resolvedPolicy(place) {
    const category = categoryId(place);
    const base = {
      events: "whenData",
      "social-meet": "always",
      "knowledge-meet": "always",
      play: "never",
      ...(policy.categoryPolicy?.[category] || {})
    };
    for (const typeId of placeTypeIds(place)) {
      Object.assign(base, policy.placeTypeOverrides?.[typeId] || {});
    }
    return base;
  }

  function visibleActions(place, events) {
    const resolved = resolvedPolicy(place);
    return Object.entries(resolved)
      .filter(([actionId, mode]) => mode === "always" || (mode === "whenData" && actionDataCount(actionId, place, events) > 0))
      .map(([actionId]) => actionId);
  }

  function renderPlayProfile(place) {
    const profile = place?.play_profile && typeof place.play_profile === "object" ? place.play_profile : null;
    if (!profile) return '<div class="pc-empty">Ingen lek registrert for denne lekeplassen ennå</div>';
    const items = list(profile.activities || profile.items || profile.tasks).filter(Boolean);
    return `<article class="pc-tasks-card pc-play-card"><h2 class="pc-tasks-title">${esc(profile.title || "Lek")}</h2>${text(profile.summary) ? `<p class="pc-tasks-summary">${esc(profile.summary)}</p>` : ""}${items.length ? `<ol class="pc-tasks-list">${items.map(item => `<li class="pc-task-item">${text(item?.title || item?.name) ? `<h3 class="pc-task-title">${esc(item.title || item.name)}</h3>` : ""}${text(item?.instruction || item?.desc || item?.description) ? `<p class="pc-task-instruction">${esc(item.instruction || item.desc || item.description)}</p>` : ""}</li>`).join("")}</ol>` : '<div class="pc-empty">Ingen lekeforslag registrert ennå</div>'}</article>`;
  }

  function renderEventContent(events) {
    if (!events.length) return '<div class="pc-empty">Ingen aktuelle events registrert her ennå</div>';
    return `<div class="pc-onsite-event-popup">${events.map(event => { const when=text(event?.date || event?.start_date || event?.start || event?.year); return `<article class="pc-onsite-event"><strong>${esc(event?.title || event?.name || event?.id || "Event")}</strong>${when ? `<span>${esc(when)}</span>` : ""}</article>`; }).join("")}</div>`;
  }

  function button(actionId, placeId, count = 0) {
    const def = policy.actions?.[actionId] || {};
    const roundId = actionId === "play" ? "play" : "";
    const className = actionId === "events" ? " pc-onsite-action-event" : actionId === "knowledge-meet" ? " pc-onsite-action-knowledge" : "";
    return `<button class="pc-onsite-action${className}" type="button" data-hg-onsite-action="${esc(actionId)}" data-place-id="${esc(placeId)}"${roundId ? ` data-round-id="${roundId}"` : ""}><span class="pc-onsite-action-icon">${esc(def.icon || "•")}</span><span class="pc-onsite-action-label">${esc(def.label || actionId)}</span>${count > 0 ? `<span class="pc-onsite-action-count">${count}</span>` : ""}</button>`;
  }

  function renderSurface(place) {
    const placeId = text(place?.id);
    const events = eventsForPlace(placeId, socialForPlace(placeId));
    const buttons = visibleActions(place, events).map(actionId => button(actionId, placeId, actionDataCount(actionId, place, events)));
    return `<div class="pc-onsite-surface" ${SURFACE_ATTR}="${esc(placeId)}" ${POLICY_ATTR}="${esc(policyVersion)}"><div class="pc-onsite-actions" role="group" aria-label="Funksjoner på stedet">${buttons.join("")}</div></div>`;
  }

  function decorate(force = false) {
    const box = document.getElementById("pcEventsBox");
    const place = currentPlace();
    if (!box || !place) return;
    const placeId = text(place.id);
    const existing = box.querySelector(`[${SURFACE_ATTR}]`);
    if (!force && existing?.getAttribute(SURFACE_ATTR) === placeId && existing?.getAttribute(POLICY_ATTR) === policyVersion) return;
    [...box.children].forEach(child => { if (!child.classList?.contains("pc-events-head")) child.remove(); });
    box.insertAdjacentHTML("beforeend", renderSurface(place));
  }

  function openPlay() {
    const place = currentPlace();
    global.showPlaceCardRoundPopup?.({ title:"Lek", subtitle:text(place?.name || place?.title), html:renderPlayProfile(place), place, kind:"play" });
  }

  function openEvents(placeId) {
    const place = currentPlace();
    const events = eventsForPlace(placeId, socialForPlace(placeId));
    global.showPlaceCardRoundPopup?.({ title: "Events", subtitle: text(place?.name || place?.title), html: renderEventContent(events), place, kind: "events" });
  }

  function openSocialMeet(placeId) {
    const social = socialForPlace(placeId);
    if (social?.social_enabled === false) {
      global.showToast?.("Møtefunksjonen er ikke aktivert på dette stedet ennå");
      return;
    }
    if (typeof global.HG_SocialMeetUI?.open === "function") return global.HG_SocialMeetUI.open({ filter: "place", placeId, sourceSurface: "placeCardOnSite" });
    global.showToast?.("Møtefunksjonen er ikke lastet ennå");
  }

  function openKnowledgeMeet(placeId) {
    const place = currentPlace();
    if (typeof global.HG_SpotmeetingUI?.open === "function") return global.HG_SpotmeetingUI.open({ contextType:"place", contextId:placeId, title:text(place?.name || place?.title || placeId), reason:"Kunnskapsmøte rundt dette stedet", sourceSurface:"placeCardOnSite", preferredAction:"match" });
    if (typeof global.openSpotMatchList === "function") return global.openSpotMatchList(placeId);
    global.showToast?.("Kunnskapsmøte er ikke lastet ennå");
  }

  function handleClick(event) {
    const target = event.target instanceof Element ? event.target : null;
    const surface = target?.closest?.(`[${SURFACE_ATTR}]`);
    if (!surface) return;
    const buttonEl = target.closest("[data-hg-onsite-action]");
    if (!(buttonEl instanceof HTMLElement)) return;
    event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation();
    const action = text(buttonEl.dataset.hgOnsiteAction);
    const placeId = text(buttonEl.dataset.placeId || currentPlace()?.id);
    if (!placeId) return;
    if (action === "play") return openPlay();
    if (action === "events") return openEvents(placeId);
    if (action === "social-meet") return openSocialMeet(placeId);
    if (action === "knowledge-meet") return openKnowledgeMeet(placeId);
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
    if (!global[BOUND_FLAG]) { document.addEventListener("click", handleClick, true); global[BOUND_FLAG] = true; }
    decorate(); observe(); loadPolicy();
  }

  global.HGPlaceOnSiteSurface = { decorate, renderSurface, renderPlayProfile, renderEventContent, resolvedPolicy, visibleActions };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true }); else init();
  ["hg:appReady","hg:place-selected","hg:placesUpdated"].forEach(name => global.addEventListener?.(name, decorate));
})(window);
