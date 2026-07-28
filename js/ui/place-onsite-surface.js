// js/ui/place-onsite-surface.js
// Canonical "På stedet"-flate under PlaceCard-rundingene.
// Samler handlinger, møter/kunnskapsmøter og events uten å gjøre dem til rundinger.
(function installPlaceOnSiteSurface(global) {
  "use strict";

  const SURFACE_ATTR = "data-hg-onsite-surface";
  const BOUND_FLAG = "__HG_PLACE_ONSITE_SURFACE_BOUND__";
  let observer = null;

  function text(value) {
    return String(value == null ? "" : value).trim();
  }

  function list(value) {
    return Array.isArray(value) ? value : [];
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function currentPlace() {
    const id = text(document.getElementById("placeCard")?.dataset?.currentPlaceId);
    if (!id) return null;
    return (Array.isArray(global.PLACES) ? global.PLACES : []).find(place => text(place?.id) === id) || null;
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
    if (social?.social_enabled === false) return [];
    const ids = list(social?.canonical_event_ids).map(text).filter(Boolean);
    const idSet = new Set(ids);
    return list(global.__HG_CANONICAL_SOCIAL_EVENTS__).filter(event => {
      const placeMatch = text(event?.place_id) === placeId;
      const eventId = text(event?.id);
      return placeMatch && (!idSet.size || idSet.has(eventId));
    });
  }

  function actionAvailability(place) {
    const out = [];
    const tasks = place?.tasks_profile && typeof place.tasks_profile === "object"
      ? list(place.tasks_profile.tasks).filter(Boolean)
      : [];
    const training = place?.training_profile && typeof place.training_profile === "object"
      ? list(place.training_profile.exercises).filter(Boolean)
      : [];
    const play = place?.play_profile && typeof place.play_profile === "object"
      ? list(place.play_profile.activities || place.play_profile.items || place.play_profile.tasks).filter(Boolean)
      : [];

    if (tasks.length) out.push({ id: "tasks", label: "Oppgaver", count: tasks.length, icon: "✅" });
    if (training.length) out.push({ id: "training", label: "Trening", count: training.length, icon: "🏃" });
    if (play.length) out.push({ id: "play", label: "Lek", count: play.length, icon: "🛝" });
    return out;
  }

  function renderEvents(events) {
    if (!events.length) return "";
    const visible = events.slice(0, 3);
    return `
      <section class="pc-onsite-section pc-onsite-events">
        <div class="pc-onsite-section-title">Events</div>
        <div class="pc-onsite-list">
          ${visible.map(event => {
            const when = text(event?.date || event?.start_date || event?.start || event?.year);
            return `<div class="pc-onsite-event"><strong>${esc(event?.title || event?.name || event?.id || "Event")}</strong>${when ? `<span>${esc(when)}</span>` : ""}</div>`;
          }).join("")}
        </div>
        ${events.length > visible.length ? `<div class="pc-onsite-more">+${events.length - visible.length} flere</div>` : ""}
      </section>
    `;
  }

  function renderMeetings(placeId, social) {
    const modes = new Set(list(social?.social_modes).map(text).filter(Boolean));
    const canMeet = social?.social_enabled !== false && (!modes.size || modes.has("meetup"));
    return `
      <section class="pc-onsite-section pc-onsite-meetings">
        <div class="pc-onsite-section-title">Møter</div>
        <div class="pc-onsite-actions">
          ${canMeet ? `<button class="pc-onsite-action" type="button" data-hg-onsite-action="social-meet" data-place-id="${esc(placeId)}">👥 Avtal å møtes</button>` : ""}
          <button class="pc-onsite-action" type="button" data-hg-onsite-action="knowledge-meet" data-place-id="${esc(placeId)}">🧠 Kunnskapsmøte</button>
        </div>
      </section>
    `;
  }

  function renderDoHere(actions) {
    if (!actions.length) return "";
    return `
      <section class="pc-onsite-section pc-onsite-do-here">
        <div class="pc-onsite-section-title">Gjør på stedet</div>
        <div class="pc-onsite-actions">
          ${actions.map(action => `<button class="pc-onsite-action" type="button" data-hg-onsite-action="round" data-round-id="${esc(action.id)}">${esc(action.icon)} ${esc(action.label)}${action.count ? ` <span>${action.count}</span>` : ""}</button>`).join("")}
        </div>
      </section>
    `;
  }

  function renderSurface(place) {
    const placeId = text(place?.id);
    const social = socialForPlace(placeId);
    const events = eventsForPlace(placeId, social);
    const actions = actionAvailability(place);
    return `
      <div class="pc-onsite-surface" ${SURFACE_ATTR}="${esc(placeId)}">
        ${renderEvents(events)}
        ${renderMeetings(placeId, social)}
        ${renderDoHere(actions)}
      </div>
    `;
  }

  function decorate() {
    const box = document.getElementById("pcEventsBox");
    const place = currentPlace();
    if (!box || !place) return;
    const placeId = text(place.id);
    const existing = box.querySelector(`[${SURFACE_ATTR}]`);
    if (existing?.getAttribute(SURFACE_ATTR) === placeId) return;

    // PlaceCard sin nåværende kompakte Kunnskapsmøte-preview erstattes av den
    // komplette På stedet-flaten. Header og + beholdes.
    [...box.children].forEach(child => {
      if (!child.classList?.contains("pc-events-head")) child.remove();
    });
    box.insertAdjacentHTML("beforeend", renderSurface(place));
  }

  function openRoundAction(button) {
    const roundId = text(button?.dataset?.roundId);
    const def = global.HGPlaceRounds?.byId?.[roundId];
    const listEl = def?.listId ? document.getElementById(def.listId) : null;
    const place = currentPlace();
    const html = text(listEl?.innerHTML) || '<div class="pc-empty">Ingen innhold ennå</div>';
    if (typeof global.showPlaceCardRoundPopup === "function") {
      global.showPlaceCardRoundPopup({
        title: def?.label || roundId,
        subtitle: text(place?.name || place?.title),
        html,
        place,
        kind: def?.kind || roundId
      });
    }
  }

  function openSocialMeet(placeId) {
    if (typeof global.HG_SocialMeetUI?.open === "function") {
      global.HG_SocialMeetUI.open({ filter: "place", placeId, sourceSurface: "placeCardOnSite" });
      return;
    }
    global.showToast?.("Møtefunksjonen er ikke lastet ennå");
  }

  function openKnowledgeMeet(placeId) {
    const place = currentPlace();
    if (typeof global.HG_SpotmeetingUI?.open === "function") {
      global.HG_SpotmeetingUI.open({
        contextType: "place",
        contextId: placeId,
        title: text(place?.name || place?.title || placeId),
        reason: "Kunnskapsmøte rundt dette stedet",
        sourceSurface: "placeCardOnSite",
        preferredAction: "match"
      });
      return;
    }
    if (typeof global.openSpotMatchList === "function") {
      global.openSpotMatchList(placeId);
      return;
    }
    global.showToast?.("Kunnskapsmøte er ikke lastet ennå");
  }

  function handleClick(event) {
    const button = event.target instanceof Element
      ? event.target.closest("[data-hg-onsite-action]")
      : null;
    if (!(button instanceof HTMLElement)) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const action = text(button.dataset.hgOnsiteAction);
    if (action === "round") return openRoundAction(button);
    const placeId = text(button.dataset.placeId || currentPlace()?.id);
    if (!placeId) return;
    if (action === "social-meet") return openSocialMeet(placeId);
    if (action === "knowledge-meet") return openKnowledgeMeet(placeId);
  }

  function observe() {
    const card = document.getElementById("placeCard");
    if (!card || observer) return;
    observer = new MutationObserver(() => decorate());
    observer.observe(card, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-current-place-id"] });
  }

  function init() {
    if (!global[BOUND_FLAG]) {
      document.addEventListener("click", handleClick, true);
      global[BOUND_FLAG] = true;
    }
    decorate();
    observe();
  }

  global.HGPlaceOnSiteSurface = { decorate, renderSurface };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
  global.addEventListener?.("hg:appReady", init);
})(window);
