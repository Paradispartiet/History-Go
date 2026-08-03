// @ts-nocheck
(function () {
  "use strict";
  const VISITED_KEY = "visited_places";
  const COLLECTED_KEY = "places_collected";
  const PEOPLE_KEY = "people_collected";

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (ch) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));
  }
  function readIdSet(key) {
    let raw = null;
    try { raw = JSON.parse(localStorage.getItem(key) || "null"); } catch {}
    const ids = new Set();
    const add = (value) => { const id = String(value ?? "").trim(); if (id) ids.add(id); };
    if (Array.isArray(raw)) { raw.forEach(add); return ids; }
    if (raw && typeof raw === "object") Object.entries(raw).forEach(([id, value]) => { if (value) add(id); });
    return ids;
  }
  function getVisitedPlaceIds() { return readIdSet(VISITED_KEY); }
  function getQuizCollectedPlaceIds() { return readIdSet(COLLECTED_KEY); }
  function getCollectedPlaceIds() { return new Set([...getVisitedPlaceIds(), ...getQuizCollectedPlaceIds()]); }
  function getCollectedSource(placeId) {
    const id = String(placeId || "").trim();
    if (getVisitedPlaceIds().has(id)) return "Besøkt";
    if (getQuizCollectedPlaceIds().has(id)) return "Quiz";
    return "";
  }
  function renderPlacesCollection() {
    const grid = document.getElementById("collectionGrid");
    if (!grid) return;
    const places = Array.isArray(window.PLACES) ? window.PLACES : [];
    const collectedIds = getCollectedPlaceIds();
    const collectedPlaces = places.filter((place) => collectedIds.has(String(place?.id || "").trim()));
    if (!collectedPlaces.length) { grid.innerHTML = '<div class="muted">Ingen steder samlet ennå.</div>'; return; }
    grid.innerHTML = collectedPlaces.map((place) => {
      const source = getCollectedSource(place.id);
      const meta = [place.category, place.year || "", source].filter(Boolean).join(" · ");
      return `<div class="card place-card" data-place="${esc(place.id)}"><div class="name">${esc(place.name)}</div><div class="meta">${esc(meta)}</div><p class="desc">${esc(place.desc || "")}</p></div>`;
    }).join("");
    grid.querySelectorAll?.(".place-card").forEach((el) => { el.onclick = () => { const place = places.find((candidate) => String(candidate?.id || "") === String(el.dataset?.place || "")); if (place) window.showPlacePopup?.(place); }; });
  }
  function renderTimeline() {
    const body = document.getElementById("timelineBody");
    const bar = document.getElementById("timelineProgressBar");
    const text = document.getElementById("timelineProgressText");
    if (!body) return;
    const places = Array.isArray(window.PLACES) ? window.PLACES : [];
    const people = Array.isArray(window.PEOPLE) ? window.PEOPLE : [];
    const collectedPlaceIds = getCollectedPlaceIds();
    const collectedPeopleIds = readIdSet(PEOPLE_KEY);
    const items = [
      ...places.filter((place) => collectedPlaceIds.has(String(place?.id || "").trim())).map((place) => ({type:"place",id:place.id,name:place.name,year:Number(place.year)||0,image:place.image||place.cardImage||place.popupImage||`bilder/places/${place.id}.PNG`})),
      ...people.filter((person) => collectedPeopleIds.has(String(person?.id || "").trim())).map((person) => ({type:"person",id:person.id,name:person.name,year:Number(person.year)||0,image:person.image||`bilder/people/${person.id}.PNG`}))
    ].sort((a,b) => a.year - b.year);
    if (!items.length) { body.innerHTML = '<div class="muted">Du har ingen historiekort ennå.</div>'; if (bar) bar.style.width = "0%"; if (text) text.textContent = "Du har låst opp 0 kort"; return; }
    body.innerHTML = items.map((item) => `<div class="timeline-card ${esc(item.type)}" data-id="${esc(item.id)}"><img src="${esc(item.image)}" alt=""><div class="timeline-name">${esc(item.name)}</div><div class="timeline-year">${item.year || "–"}</div></div>`).join("");
    const max = Math.max(people.length + places.length, 1);
    if (bar) bar.style.width = `${Math.min(100, (items.length / max) * 100)}%`;
    if (text) text.textContent = `Du har låst opp ${items.length} kort`;
  }
  function renderCollectionCards() {
    const body = document.getElementById("collectionCardsBody");
    if (!body) return;
    const places = Array.isArray(window.PLACES) ? window.PLACES : [];
    const people = Array.isArray(window.PEOPLE) ? window.PEOPLE : [];
    const collectedPlaceIds = getCollectedPlaceIds();
    const collectedPeopleIds = readIdSet(PEOPLE_KEY);
    const items = [
      ...places.filter((place) => collectedPlaceIds.has(String(place?.id || "").trim())).map((place) => ({type:"place",id:place.id,name:place.name,year:Number(place.year)||0,image:place.cardImage||place.image||place.popupImage||""})),
      ...people.filter((person) => collectedPeopleIds.has(String(person?.id || "").trim())).map((person) => ({type:"person",id:person.id,name:person.name,year:Number(person.year)||0,image:person.imageCard||person.cardImage||person.image||""}))
    ].sort((a,b) => a.year - b.year);
    if (!items.length) { body.innerHTML = '<div class="muted">Ingen kort låst opp ennå.</div>'; return; }
    body.innerHTML = items.map((item) => `<div class="collection-card" data-id="${esc(item.id)}">${item.image ? `<img src="${esc(item.image)}" alt="${esc(item.name)}">` : ""}<div class="collection-card-name">${esc(item.name)}</div><div class="collection-card-year">${item.year || ""}</div></div>`).join("");
  }
  function install() { window.renderPlacesCollection = renderPlacesCollection; window.renderTimeline = renderTimeline; window.renderCollectionCards = renderCollectionCards; }
  function refresh() { renderPlacesCollection(); renderTimeline(); renderCollectionCards(); }
  function refreshWhenReady(attempt = 0) { install(); const ready = Array.isArray(window.PLACES) && !!document.getElementById?.("collectionGrid"); if (ready) { refresh(); return; } if (attempt < 80) setTimeout(() => refreshWhenReady(attempt + 1), 50); }
  window.HGProfilePlaceCollection = { getVisitedPlaceIds, getQuizCollectedPlaceIds, getCollectedPlaceIds, getCollectedSource, install, refresh };
  window.addEventListener?.("updateProfile", () => setTimeout(refresh, 0));
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => refreshWhenReady()); else refreshWhenReady();
})();
