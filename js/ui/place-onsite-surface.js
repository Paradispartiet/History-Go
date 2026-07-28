// @ts-nocheck
// js/ui/place-onsite-surface.js
// Canonical "På stedet"-flate under PlaceCard-rundingene.
// Events, Social Meet, Kunnskapsmøte, Oppgaver, Trening og Lek.
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
    if (social?.social_enabled === false) return [];
    const ids = list(social?.canonical_event_ids).map(text).filter(Boolean);
    const idSet = new Set(ids);
    return list(global.__HG_CANONICAL_SOCIAL_EVENTS__).filter(event => {
      const eventId = text(event?.id);
      return text(event?.place_id) === placeId && (!idSet.size || idSet.has(eventId));
    });
  }

  function actionAvailability(place) {
    const out = [];
    const tasks = place?.tasks_profile && typeof place.tasks_profile === "object" ? list(place.tasks_profile.tasks).filter(Boolean) : [];
    const training = place?.training_profile && typeof place.training_profile === "object" ? list(place.training_profile.exercises).filter(Boolean) : [];
    const playProfile = place?.play_profile && typeof place.play_profile === "object" ? place.play_profile : null;
    const play = playProfile ? list(playProfile.activities || playProfile.items || playProfile.tasks).filter(Boolean) : [];
    if (tasks.length) out.push({ id: "tasks", label: "Oppgaver", count: tasks.length, icon: "✅" });
    if (training.length) out.push({ id: "training", label: "Trening", count: training.length, icon: "🏃" });
    if (play.length) out.push({ id: "play", label: "Lek", count: play.length, icon: "🛝" });
    return out;
  }

  function renderTasksProfile(place) {
    const profile = place?.tasks_profile && typeof place.tasks_profile === "object" ? place.tasks_profile : null;
    if (!profile) return '<div class="pc-empty">Ingen oppgaver ennå</div>';
    const tasks = list(profile.tasks).filter(Boolean);
    return `<article class="pc-tasks-card"><h2 class="pc-tasks-title">${esc(profile.title || "Oppgaver")}</h2>${text(profile.summary) ? `<p class="pc-tasks-summary">${esc(profile.summary)}</p>` : ""}${tasks.length ? `<ol class="pc-tasks-list">${tasks.map(task => `<li class="pc-task-item"${text(task?.id) ? ` data-task-id="${esc(task.id)}"` : ""}>${text(task?.title) ? `<h3 class="pc-task-title">${esc(task.title)}</h3>` : ""}${text(task?.instruction || task?.desc) ? `<p class="pc-task-instruction">${esc(task.instruction || task.desc)}</p>` : ""}${text(task?.why) ? `<p class="pc-task-why"><strong>Hvorfor:</strong> ${esc(task.why)}</p>` : ""}</li>`).join("")}</ol>` : ""}</article>`;
  }

  function renderTrainingProfile(place) {
    const profile = place?.training_profile && typeof place.training_profile === "object" ? place.training_profile : null;
    if (!profile) return '<div class="pc-empty">Ingen treningsopplegg ennå</div>';
    const exercises = list(profile.exercises).filter(Boolean);
    return `<article class="pc-tasks-card pc-training-card"><h2 class="pc-tasks-title">${esc(profile.title || "Trening")}</h2>${text(profile.summary) ? `<p class="pc-tasks-summary">${esc(profile.summary)}</p>` : ""}${text(profile.safety) ? `<p class="pc-task-why"><strong>Trygghet:</strong> ${esc(profile.safety)}</p>` : ""}${exercises.length ? `<ol class="pc-tasks-list">${exercises.map(exercise => { const duration=Number(exercise?.duration_minutes); const meta=[Number.isFinite(duration)&&duration>0?`${duration} min`:"",text(exercise?.intensity)].filter(Boolean).join(" · "); return `<li class="pc-task-item"${text(exercise?.id) ? ` data-training-id="${esc(exercise.id)}"` : ""}>${text(exercise?.title) ? `<h3 class="pc-task-title">${esc(exercise.title)}</h3>` : ""}${meta ? `<div class="pc-relation-chip">${esc(meta)}</div>` : ""}${text(exercise?.instruction || exercise?.desc) ? `<p class="pc-task-instruction">${esc(exercise.instruction || exercise.desc)}</p>` : ""}${text(exercise?.why) ? `<p class="pc-task-why"><strong>Hvorfor:</strong> ${esc(exercise.why)}</p>` : ""}</li>`; }).join("")}</ol>` : ""}</article>`;
  }

  function renderPlayProfile(place) {
    const profile = place?.play_profile && typeof place.play_profile === "object" ? place.play_profile : null;
    if (!profile) return '<div class="pc-empty">Ingen lekeforslag ennå</div>';
    const items = list(profile.activities || profile.items || profile.tasks).filter(Boolean);
    return `<article class="pc-tasks-card pc-play-card"><h2 class="pc-tasks-title">${esc(profile.title || "Lek")}</h2>${text(profile.summary) ? `<p class="pc-tasks-summary">${esc(profile.summary)}</p>` : ""}${items.length ? `<ol class="pc-tasks-list">${items.map(item => `<li class="pc-task-item">${text(item?.title || item?.name) ? `<h3 class="pc-task-title">${esc(item.title || item.name)}</h3>` : ""}${text(item?.instruction || item?.desc || item?.description) ? `<p class="pc-task-instruction">${esc(item.instruction || item.desc || item.description)}</p>` : ""}</li>`).join("")}</ol>` : ""}</article>`;
  }

  function renderEventContent(events) {
    if (!events.length) return '<div class="pc-empty">Ingen aktuelle events registrert her ennå</div>';
    return `<div class="pc-onsite-event-popup">${events.map(event => { const when=text(event?.date || event?.start_date || event?.start || event?.year); return `<article class="pc-onsite-event"><strong>${esc(event?.title || event?.name || event?.id || "Event")}</strong>${when ? `<span>${esc(when)}</span>` : ""}</article>`; }).join("")}</div>`;
  }

  function renderSurface(place) {
    const placeId = text(place?.id);
    const social = socialForPlace(placeId);
    const events = eventsForPlace(placeId, social);
    const modes = new Set(list(social?.social_modes).map(text).filter(Boolean));
    const canMeet = social?.social_enabled !== false && (!modes.size || modes.has("meetup"));
    const actions = actionAvailability(place);
    const buttons = [];
    if (events.length) buttons.push(`<button class="pc-onsite-action pc-onsite-action-event" type="button" data-hg-onsite-action="events" data-place-id="${esc(placeId)}"><span class="pc-onsite-action-icon">📅</span><span class="pc-onsite-action-label">Events</span><span class="pc-onsite-action-count">${events.length}</span></button>`);
    if (canMeet) buttons.push(`<button class="pc-onsite-action" type="button" data-hg-onsite-action="social-meet" data-place-id="${esc(placeId)}"><span class="pc-onsite-action-icon">👥</span><span class="pc-onsite-action-label">Avtal å møtes</span></button>`);
    buttons.push(`<button class="pc-onsite-action pc-onsite-action-knowledge" type="button" data-hg-onsite-action="knowledge-meet" data-place-id="${esc(placeId)}"><span class="pc-onsite-action-icon">🧠</span><span class="pc-onsite-action-label">Kunnskapsmøte</span></button>`);
    for (const action of actions) buttons.push(`<button class="pc-onsite-action" type="button" data-hg-onsite-action="round" data-round-id="${esc(action.id)}"><span class="pc-onsite-action-icon">${esc(action.icon)}</span><span class="pc-onsite-action-label">${esc(action.label)}</span><span class="pc-onsite-action-count">${action.count}</span></button>`);
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

  function openRoundAction(button) {
    const roundId = text(button?.dataset?.roundId);
    const def = global.HGPlaceRounds?.byId?.[roundId];
    const listEl = def?.listId ? document.getElementById(def.listId) : null;
    const place = currentPlace();
    let html = text(listEl?.innerHTML) || '<div class="pc-empty">Ingen innhold ennå</div>';
    if (roundId === "tasks") html = renderTasksProfile(place);
    if (roundId === "training") html = renderTrainingProfile(place);
    if (roundId === "play") html = renderPlayProfile(place);
    global.showPlaceCardRoundPopup?.({ title: def?.label || ({tasks:"Oppgaver",training:"Trening",play:"Lek"}[roundId]) || roundId, subtitle: text(place?.name || place?.title), html, place, kind: def?.kind || roundId });
  }

  function openEvents(placeId) {
    const place = currentPlace();
    const events = eventsForPlace(placeId, socialForPlace(placeId));
    global.showPlaceCardRoundPopup?.({ title: "Events", subtitle: text(place?.name || place?.title), html: renderEventContent(events), place, kind: "events" });
  }

  function openSocialMeet(placeId) {
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
    const button = target.closest("[data-hg-onsite-action]");
    if (!(button instanceof HTMLElement)) return;
    event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation();
    const action = text(button.dataset.hgOnsiteAction);
    if (action === "round") return openRoundAction(button);
    const placeId = text(button.dataset.placeId || currentPlace()?.id);
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

  global.HGPlaceOnSiteSurface = { decorate, renderSurface, renderTasksProfile, renderTrainingProfile, renderPlayProfile, renderEventContent };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true }); else init();
  ["hg:appReady","hg:place-selected","hg:placesUpdated"].forEach(name => global.addEventListener?.(name, decorate));
})(window);
