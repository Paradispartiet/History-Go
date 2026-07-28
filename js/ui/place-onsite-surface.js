// @ts-nocheck
// js/ui/place-onsite-surface.js
// Canonical "På stedet"-flate under PlaceCard-rundingene.
// De fire faste funksjonene er Events, Social Meet, Kunnskapsmøte og Lek.
(function installPlaceOnSiteSurface(global) {
  "use strict";

  const SURFACE_ATTR = "data-hg-onsite-surface";
  const BOUND_FLAG = "__HG_PLACE_ONSITE_SURFACE_BOUND__";
  let observer = null;

  const text = value => String(value == null ? "" : value).trim();
  const list = value => Array.isArray(value) ? value : [];
  const esc = value => String(value == null ? "" : value)
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");

  function currentPlace() {
    const id = text(document.getElementById("placeCard")?.dataset?.currentPlaceId);
    if (!id) return null;
    return list(global.PLACES).find(place => text(place?.id) === id) || null;
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

  function renderPlayProfile(place) {
    const profile = place?.play_profile && typeof place.play_profile === "object" ? place.play_profile : null;
    if (!profile) return '<div class="pc-empty">Ingen lek registrert for dette stedet ennå</div>';
    const items = list(profile.activities || profile.items || profile.tasks).filter(Boolean);
    return `<article class="pc-tasks-card pc-play-card"><h2 class="pc-tasks-title">${esc(profile.title || "Lek")}</h2>${text(profile.summary) ? `<p class="pc-tasks-summary">${esc(profile.summary)}</p>` : ""}${items.length ? `<ol class="pc-tasks-list">${items.map(item => `<li class="pc-task-item">${text(item?.title || item?.name) ? `<h3 class="pc-task-title">${esc(item.title || item.name)}</h3>` : ""}${text(item?.instruction || item?.desc || item?.description) ? `<p class="pc-task-instruction">${esc(item.instruction || item.desc || item.description)}</p>` : ""}</li>`).join("")}</ol>` : '<div class="pc-empty">Ingen lekeforslag registrert ennå</div>'}</article>`;
  }

  function renderEventContent(events) {
    if (!events.length) return '<div class="pc-empty">Ingen aktuelle events registrert her ennå</div>';
    return `<div class="pc-onsite-event-popup">${events.map(event => { const when=text(event?.date || event?.start_date || event?.start || event?.year); return `<article class="pc-onsite-event"><strong>${esc(event?.title || event?.name || event?.id || "Event")}</strong>${when ? `<span>${esc(when)}</span>` : ""}</article>`; }).join("")}</div>`;
  }

  function button({ action, placeId, icon, label, count = 0, className = "", roundId = "" }) {
    return `<button class="pc-onsite-action ${className}" type="button" data-hg-onsite-action="${esc(action)}"${placeId ? ` data-place-id="${esc(placeId)}"` : ""}${roundId ? ` data-round-id="${esc(roundId)}"` : ""}><span class="pc-onsite-action-icon">${esc(icon)}</span><span class="pc-onsite-action-label">${esc(label)}</span>${count > 0 ? `<span class="pc-onsite-action-count">${count}</span>` : ""}</button>`;
  }

  function renderSurface(place) {
    const placeId = text(place?.id);
    const events = eventsForPlace(placeId, socialForPlace(placeId));
    const buttons = [
      button({ action:"events", placeId, icon:"📅", label:"Events", count:events.length, className:"pc-onsite-action-event" }),
      button({ action:"social-meet", placeId, icon:"👥", label:"Avtal å møtes" }),
      button({ action:"knowledge-meet", placeId, icon:"🧠", label:"Kunnskapsmøte", className:"pc-onsite-action-knowledge" }),
      button({ action:"round", roundId:"play", icon:"🛝", label:"Lek", count:playCount(place) })
    ];
    return `<div class="pc-onsite-surface" ${SURFACE_ATTR}="${esc(placeId)}"><div class="pc-onsite-actions" role="group" aria-label="Funksjoner på stedet">${buttons.join("")}</div></div>`;
  }

  function decorate() {
    const box = document.getElementById("pcEventsBox");
    const place = currentPlace();
    if (!box || !place) return;
    const placeId = text(place.id);
    const existing = box.querySelector(`[${SURFACE_ATTR}]`);
    if (existing?.getAttribute(SURFACE_ATTR) === placeId) return;
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
    if (action === "round" && text(buttonEl.dataset.roundId) === "play") return openPlay();
    const placeId = text(buttonEl.dataset.placeId || currentPlace()?.id);
    if (!placeId) return;
    if (action === "events") return openEvents(placeId);
    if (action === "social-meet") return openSocialMeet(placeId);
    if (action === "knowledge-meet") return openKnowledgeMeet(placeId);
  }

  function observe() {
    const card = document.getElementById("placeCard");
    if (!card || observer) return;
    observer = new MutationObserver(() => decorate());
    observer.observe(card, { attributes:true, attributeFilter:["data-current-place-id"] });
  }

  function init() {
    if (!global[BOUND_FLAG]) { document.addEventListener("click", handleClick, true); global[BOUND_FLAG] = true; }
    decorate(); observe();
  }

  global.HGPlaceOnSiteSurface = { decorate, renderSurface, renderPlayProfile, renderEventContent };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true }); else init();
  ["hg:appReady","hg:place-selected","hg:placesUpdated"].forEach(name => global.addEventListener?.(name, decorate));
})(window);
