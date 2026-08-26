// One-request hydration for opening a History Go place.
/** @param {any} global */
(function installPlaceOpenLoader(global) {
  "use strict";

  if (global.HGPlaceOpen) return;

  const promises = new Map();
  const payloads = new Map();

  const idOf = value => String(value && typeof value === "object" ? value.id : value || "").trim();
  const list = value => Array.isArray(value) ? value : [];

  function mergeById(current, incoming) {
    const map = new Map();
    for (const item of [...list(current), ...list(incoming)]) {
      const id = String(item?.id || [item?.place_id, item?.title || item?.name || item?.term].filter(Boolean).join("|") || "").trim();
      if (!id) continue;
      map.set(id, map.has(id) ? { ...map.get(id), ...item } : item);
    }
    return [...map.values()];
  }

  function replacePlaceIn(name, place) {
    const collection = list(global[name]);
    const index = collection.findIndex(item => idOf(item) === idOf(place));
    const merged = index >= 0 ? { ...collection[index], ...place } : place;
    if (index >= 0) collection[index] = merged;
    else collection.push(merged);
    Reflect.set(global, name, collection);
    return merged;
  }

  function relationKey(relation) {
    return String(relation?.id || [
      relation?.place || relation?.place_id,
      relation?.person || relation?.person_id,
      relation?.type || relation?.relation
    ].join("|")).trim();
  }

  function mergeRelations(incoming) {
    const byKey = new Map();
    for (const relation of [...list(global.RELATIONS), ...list(incoming)]) {
      const key = relationKey(relation);
      if (key) byKey.set(key, relation);
    }
    global.RELATIONS = [...byKey.values()];
    global.REL_BY_PLACE ||= Object.create(null);
    global.REL_BY_PERSON ||= Object.create(null);
    for (const relation of list(incoming)) {
      const placeId = String(relation?.place || relation?.place_id || relation?.placeId || "").trim();
      const personId = String(relation?.person || relation?.person_id || relation?.personId || "").trim();
      if (placeId) global.REL_BY_PLACE[placeId] = list(global.REL_BY_PLACE[placeId]).filter(item => relationKey(item) !== relationKey(relation)).concat(relation);
      if (personId) global.REL_BY_PERSON[personId] = list(global.REL_BY_PERSON[personId]).filter(item => relationKey(item) !== relationKey(relation)).concat(relation);
    }
  }

  function mergeStories(placeId, stories) {
    const runtime = global.HGStories;
    if (!runtime) return;
    runtime.byPlace ||= Object.create(null);
    runtime.byId ||= Object.create(null);
    runtime.all = mergeById(runtime.all, stories);
    runtime.byPlace[placeId] = mergeById(runtime.byPlace[placeId], stories);
    for (const story of stories) if (story?.id) runtime.byId[story.id] = story;
  }

  function mergeLeksikon(placeId, articles) {
    global.LEKSIKON_BY_PLACE ||= Object.create(null);
    global.LEKSIKON_BY_PLACE[placeId] = mergeById(global.LEKSIKON_BY_PLACE[placeId], articles);
    global.LEKSIKON_ARTICLES = mergeById(global.LEKSIKON_ARTICLES, articles);
  }

  function mergeLesespor(placeId, items) {
    global.LESESPOR_BY_PLACE ||= Object.create(null);
    global.LESESPOR_BY_PLACE[placeId] = mergeById(global.LESESPOR_BY_PLACE[placeId], items);
    global.LESESPOR = mergeById(global.LESESPOR, items);
  }

  function mergeEvents(placeId, events) {
    global.HG_PLACE_OPEN_EVENTS ||= Object.create(null);
    global.HG_PLACE_OPEN_EVENTS[placeId] = mergeById(global.HG_PLACE_OPEN_EVENTS[placeId], events);
    if (!global.HGEvents) return;
    global.HGEvents.byPlace ||= Object.create(null);
    global.HGEvents.byId ||= Object.create(null);
    global.HGEvents.byPlace[placeId] = mergeById(global.HGEvents.byPlace[placeId], events);
    global.HGEvents.all = mergeById(global.HGEvents.all, events);
    for (const event of events) if (event?.id) global.HGEvents.byId[event.id] = event;
  }

  function mergeBrands(placeId, brands) {
    const incoming = list(brands);
    if (!incoming.length) return;
    global.BRANDS_BY_PLACE ||= Object.create(null);
    global.BRANDS_BY_PLACE[placeId] = mergeById(global.BRANDS_BY_PLACE[placeId], incoming);
    global.BRANDS = mergeById(global.BRANDS, incoming);
    if (!global.HGBrands) return;
    global.HGBrands.byId ||= Object.create(null);
    global.HGBrands.byPlace ||= Object.create(null);
    global.HGBrands.all = mergeById(global.HGBrands.all, incoming);
    global.HGBrands.catalog = mergeById(global.HGBrands.catalog, incoming.filter(item => item?.state === "catalog"));
    global.HGBrands.byPlace[placeId] = mergeById(global.HGBrands.byPlace[placeId], incoming);
    for (const brand of incoming) if (brand?.id) global.HGBrands.byId[brand.id] = brand;
  }

  function apply(payload) {
    const placeId = idOf(payload?.place);
    if (!placeId) throw new Error("Place-open payload mangler place.id");

    const place = replacePlaceIn("PLACES", payload.place);
    replacePlaceIn("HGPlaces", place);
    replacePlaceIn("allPlaces", place);
    global.PEOPLE = mergeById(global.PEOPLE, payload.people);
    mergeRelations(payload.relations);
    mergeStories(placeId, list(payload.stories));
    mergeLeksikon(placeId, list(payload.leksikon));
    mergeLesespor(placeId, list(payload.lesespor));
    global.FLORA = mergeById(global.FLORA, payload.flora);
    global.FAUNA = mergeById(global.FAUNA, payload.fauna);
    global.WK_BY_PLACE ||= Object.create(null);
    global.WK_BY_PLACE[placeId] = list(payload.wonderkammer);
    global.HG_PLACE_OPEN_LANGUAGE ||= Object.create(null);
    global.HG_PLACE_OPEN_LANGUAGE[placeId] = payload.language || null;
    mergeEvents(placeId, list(payload.events));
    mergeBrands(placeId, list(payload.brands));

    payloads.set(placeId, { ...payload, place });
    global.dispatchEvent?.(new CustomEvent("hg:place-open-ready", {
      detail: { placeId, place, people: list(payload.people).length }
    }));
    return place;
  }

  function preload(value) {
    const placeId = idOf(value);
    if (!placeId) return Promise.resolve(null);
    if (payloads.has(placeId)) return Promise.resolve(payloads.get(placeId).place);
    if (promises.has(placeId)) return promises.get(placeId);

    const url = new URL(`data/runtime/place-open/${encodeURIComponent(placeId)}.json`, document.baseURI);
    // Place-open is the canonical payload for the card currently being opened.
    // Revalidate it instead of pinning an older HTTP-cache entry: the service
    // worker provides the bounded offline fallback when the network is down.
    const promise = fetch(url, { cache: "no-cache" })
      .then(response => {
        if (!response.ok) throw new Error(`${response.status} ${url}`);
        return response.json();
      })
      .then(apply)
      .catch(error => {
        promises.delete(placeId);
        console.warn("[HGPlaceOpen]", placeId, error);
        return value && typeof value === "object" ? value : null;
      });
    promises.set(placeId, promise);
    return promise;
  }

  global.HGPlaceOpen = {
    preload,
    ensure: preload,
    has: value => payloads.has(idOf(value)),
    get: value => payloads.get(idOf(value)) || null,
    getPlace: value => payloads.get(idOf(value))?.place || null
  };
})(window);
