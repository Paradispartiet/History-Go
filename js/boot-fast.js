// js/boot-fast.js
// Lett app-shell boot for index.html.
// Denne fila erstatter ikke boot.js; den legger på bootCritical/bootBackground
// slik at index kan bli brukbar før alle tunge data er ferdig lastet.

(function () {
  "use strict";

  if (window.bootCritical && window.bootBackground) return;

  const REPO_NAME = "History-Go";
  const isGitHubPages = location.hostname.includes("github.io");
  const BASE = isGitHubPages ? `/${REPO_NAME}/` : "/";

  const PLACE_FILES_FALLBACK = [
    "data/places/places_by.json",
    "data/places/places_historie.json",
    "data/places/places_kunst.json",
    "data/places/places_litteratur.json",
    "data/places/places_musikk.json",
    "data/places/places_naeringsliv.json",
    "data/places/places_natur.json",
    "data/places/places_politikk.json",
    "data/places/places_sport.json",
    "data/places/places_subkultur.json",
    "data/places/places_vitenskap.json"
  ];

  const RELATION_FILE_LIST = [
    "data/relations.json",
    "data/relations_philanthropy.json"
  ];

  const WONDERKAMMER_FALLBACK_FILES = [
    "data/wonderkammer/base.json",
    "data/wonderkammer/urban_culture.json",
    "data/wonderkammer/playgrounds.json",
    "data/wonderkammer/training.json",
    "data/wonderkammer/art.json",
    "data/wonderkammer/street_art.json",
    "data/wonderkammer/architecture.json",
    "data/wonderkammer/parks_nature.json",
    "data/wonderkammer/museums_libraries.json",
    "data/wonderkammer/seasonal.json"
  ];

  const PEOPLE_FETCH_CONCURRENCY = Math.max(
    3,
    Math.min(6, Number(globalThis.navigator?.hardwareConcurrency) || 4)
  );

  let criticalStarted = false;
  let criticalDone = false;
  let backgroundStarted = false;
  let peopleLoadPromise = null;
  let relationsLoadPromise = null;
  let priorityPeopleDataPromise = null;
  let peopleSurfaceUpdateScheduled = false;
  let currentPlacePeopleRefreshScheduled = false;

  window.HG_PEOPLE_READY = Array.isArray(window.PEOPLE) && window.PEOPLE.length > 0;
  window.HG_PEOPLE_LOADING = false;
  window.HG_PEOPLE_STATUS = window.HG_PEOPLE_READY ? "ready" : "pending";
  window.HG_RELATIONS_READY = Array.isArray(window.RELATIONS) && window.RELATIONS.length > 0;
  window.HG_RELATIONS_LOADING = false;
  window.HG_RELATIONS_STATUS = window.HG_RELATIONS_READY ? "ready" : "pending";

  /**
   * @param {string} url
   * @param {{ cache?: RequestCache }} [options]
   * @returns {Promise<any>}
   */
  async function fetchJSON(url, { cache = "default" } = {}) {
    try {
      const res = await fetch(BASE + url, { cache });
      if (!res.ok) {
        console.warn("[boot-fast] 404:", BASE + url);
        return null;
      }
      return await res.json();
    } catch (error) {
      console.warn("[boot-fast] fetch failed:", BASE + url, error);
      return null;
    }
  }

  function emit(name, detail = {}) {
    try {
      window.dispatchEvent(new CustomEvent(name, { detail }));
    } catch {}
  }

  function runSafe(label, fn) {
    try {
      return fn?.();
    } catch (error) {
      console.warn(`[boot-fast] ${label} failed`, error);
      return undefined;
    }
  }

  async function runSafeAsync(label, fn) {
    try {
      return await fn?.();
    } catch (error) {
      console.warn(`[boot-fast] ${label} failed`, error);
      return undefined;
    }
  }

  function normalizeRows(data, key) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.[key])) return data[key];
    // Canonical People-profiler lagres også som ett objekt per fil.
    if (data && typeof data === "object" && String(data.id || "").trim()) return [data];
    return [];
  }

  function mergeRowsById(primary, secondary) {
    const out = [];
    const seen = new Set();
    for (const row of [...(Array.isArray(primary) ? primary : []), ...(Array.isArray(secondary) ? secondary : [])]) {
      const id = String(row?.id || "").trim();
      if (!id || seen.has(id)) continue;
      seen.add(id);
      out.push(row);
    }
    return out;
  }

  async function loadRowsWithConcurrency(urls, key, concurrency, onProgress, prioritize) {
    const list = Array.isArray(urls) ? urls : [];
    if (!list.length) return { rows: [], failed: [] };

    const rowsByFile = new Array(list.length);
    const failed = [];
    const pending = list.map((url, index) => ({ url, index }));
    let completed = 0;

    const takeNext = () => {
      if (!pending.length) return null;
      const priorityIndex = typeof prioritize === "function"
        ? pending.findIndex(item => prioritize(item.url))
        : -1;
      const [next] = pending.splice(priorityIndex >= 0 ? priorityIndex : 0, 1);
      return next || null;
    };

    const worker = async () => {
      while (true) {
        // Prioritet beregnes på nytt for hver fil. Et place som åpnes etter
        // boot kan derfor hoppe foran resten av den pågående People-køen.
        const next = takeNext();
        if (!next) return;

        const { url, index } = next;
        const data = await fetchJSON(url, { cache: "default" });
        if (data == null) failed.push(url);
        rowsByFile[index] = normalizeRows(data, key);

        completed += 1;
        onProgress?.({
          completed,
          total: list.length,
          failed: failed.length,
          url,
          rows: rowsByFile[index]
        });
      }
    };

    const workerCount = Math.max(1, Math.min(Number(concurrency) || 1, list.length));
    await Promise.all(Array.from({ length: workerCount }, () => worker()));

    return {
      rows: rowsByFile.flatMap(rows => Array.isArray(rows) ? rows : []),
      failed
    };
  }

  function peopleAndRelationsReady() {
    return window.HG_PEOPLE_READY === true && window.HG_RELATIONS_READY === true;
  }

  function peopleDataUsable() {
    return window.HG_PEOPLE_READY === true
      || (Array.isArray(window.PEOPLE) && window.PEOPLE.length > 0);
  }

  function hasVisiblePeopleForPlace(placeId) {
    const pid = String(placeId || "").trim();
    if (!pid || !Array.isArray(window.PEOPLE)) return false;
    const visiblePeople = window.PEOPLE.filter(person => {
      const holdbacks = (Array.isArray(person?.roundHoldbacks) ? person.roundHoldbacks : [])
        .map(value => String(value || "").trim());
      return !holdbacks.includes(pid);
    });
    const directMatch = visiblePeople.some(person => {
      const placeIds = [
        person?.placeId,
        person?.place_id,
        person?.place,
        person?.places,
        person?.placeIds,
        person?.place_ids,
        person?.source_place_id
      ].flatMap(value => Array.isArray(value) ? value : [value])
        .map(value => String(value || "").trim())
        .filter(Boolean);
      return placeIds.includes(pid);
    });
    if (directMatch) return true;

    const visibleIds = new Set(visiblePeople
      .map(person => String(person?.id || "").trim())
      .filter(Boolean));
    return (Array.isArray(window.RELATIONS) ? window.RELATIONS : []).some(relation => {
      const directPlace = String(
        relation?.placeId || relation?.place_id || relation?.place || ""
      ).trim();
      const fromType = String(relation?.fromType || relation?.from_type || "").trim();
      const toType = String(relation?.toType || relation?.to_type || "").trim();
      const fromId = String(relation?.fromId || relation?.from_id || "").trim();
      const toId = String(relation?.toId || relation?.to_id || "").trim();
      const relationPlace = directPlace
        || (fromType === "place" ? fromId : "")
        || (toType === "place" ? toId : "");
      if (relationPlace !== pid) return false;

      const personIds = [
        relation?.personId,
        relation?.person_id,
        relation?.person,
        fromType === "person" ? fromId : "",
        toType === "person" ? toId : ""
      ].map(value => String(value || "").trim()).filter(Boolean);
      return personIds.some(id => visibleIds.has(id));
    });
  }

  function getCurrentPlaceId() {
    const cardId = String(document.getElementById("placeCard")?.dataset?.currentPlaceId || "").trim();
    if (cardId) return cardId;
    const match = String(location.hash || "").match(/^#\/place\/([^/?#]+)/);
    if (!match) return "";
    try {
      return decodeURIComponent(match[1]);
    } catch {
      return match[1];
    }
  }

  function getCurrentPlaceCardPlace() {
    const placeId = getCurrentPlaceId();
    if (!placeId) return null;
    return (Array.isArray(window.PLACES) ? window.PLACES : []).find(
      place => String(place?.id || "").trim() === placeId
    ) || null;
  }

  function schedulePeopleSurfaceUpdate() {
    if (peopleSurfaceUpdateScheduled) return;
    peopleSurfaceUpdateScheduled = true;

    const schedule = typeof window.requestAnimationFrame === "function"
      ? window.requestAnimationFrame.bind(window)
      : (callback) => setTimeout(callback, 0);

    schedule(() => {
      peopleSurfaceUpdateScheduled = false;
      updatePeopleSurfaceState();
    });
  }

  function scheduleCurrentPlacePeopleRefresh() {
    if (!peopleDataUsable() || currentPlacePeopleRefreshScheduled) return;
    currentPlacePeopleRefreshScheduled = true;

    setTimeout(() => {
      currentPlacePeopleRefreshScheduled = false;
      const place = getCurrentPlaceCardPlace();
      if (!place || typeof window.openPlaceCard !== "function") return;
      Promise.resolve(window.openPlaceCard(place)).catch(error => {
        console.warn("[boot-fast] refresh People-runding failed", error);
      });
    }, 0);
  }

  function updatePeopleSurfaceState() {
    const icon = document.getElementById("pcPeopleIcon");
    const list = document.getElementById("pcPeopleList");
    const ready = peopleAndRelationsReady() || window.HGPlaceOpen?.has?.(getCurrentPlaceId()) === true;
    const failed = window.HG_PEOPLE_STATUS === "error" || window.HG_RELATIONS_STATUS === "error";

    if (ready) {
      icon?.removeAttribute("aria-busy");
      list?.removeAttribute("aria-busy");
      if (icon?.dataset) delete icon.dataset.hgPeopleDataState;
      if (list?.dataset) delete list.dataset.hgPeopleDataState;

      // Initial PlaceCard-render og People-last kan fullføres i motsatt
      // rekkefølge. Hvis en sen, tom render har skrevet 0 etter at dataene er
      // klare, gjør én ny render for dette stedet i stedet for å godta stale UI.
      const placeId = getCurrentPlaceId();
      if (icon?.dataset && icon.dataset.hgPeopleObservedPlace !== placeId) {
        delete icon.dataset.hgPeopleStaleRefreshFor;
        icon.dataset.hgPeopleObservedPlace = placeId;
      }
      const countText = String(
        icon?.querySelector?.(".pc-round-count")?.textContent || ""
      ).trim();
      const renderedCount = Number(countText);
      const hasRenderedPeople = Boolean(list?.querySelector?.("[data-person]"));
      const renderHasPeople = (Number.isFinite(renderedCount) && renderedCount > 0)
        || hasRenderedPeople;
      const previewReady = Boolean(icon?.querySelector?.("img"))
        || icon?.dataset?.roundReady === "true"
        || renderHasPeople;
      if (
        icon
        && !previewReady
        && hasVisiblePeopleForPlace(placeId)
        && icon.dataset.hgPeopleStaleRefreshFor !== placeId
      ) {
        icon.dataset.hgPeopleStaleRefreshFor = placeId;
        scheduleCurrentPlacePeopleRefresh();
      }
      // Behold engangssperren for samme sted også når en <img> dukker opp:
      // bildefeilen kan senere erstatte den med fallback og trigge observeren
      // på nytt. Stedsovergangen over nullstiller sperren eksplisitt.
      return;
    }

    const state = failed ? "error" : "loading";
    const marker = failed ? "!" : "…";
    const expectedReady = failed ? "false" : "loading";
    const markerMissing = !String(icon?.textContent || icon?.innerHTML || "").includes(marker);
    const hasRenderedPeople = Boolean(list?.querySelector?.("[data-person], .pc-relations-section"));

    if (
      icon
      && !icon.querySelector?.("img")
      && (
        icon.dataset.hgPeopleDataState !== state
        || icon.dataset.roundReady !== expectedReady
        || markerMissing
      )
    ) {
      icon.innerHTML = `
        <span class="pc-round-emoji" aria-hidden="true">👥</span>
        <span class="pc-round-count" aria-hidden="true">${marker}</span>
      `;
      icon.dataset.hgPeopleDataState = state;
      icon.dataset.roundReady = expectedReady;
      icon.setAttribute("aria-busy", failed ? "false" : "true");
    }

    if (list && !hasRenderedPeople) {
      const text = failed ? "Kunne ikke laste personer" : "Laster personer …";
      const empty = list.querySelector?.(".pc-empty");
      if (empty && empty.textContent !== text) empty.textContent = text;
      list.dataset.hgPeopleDataState = state;
      list.setAttribute("aria-busy", failed ? "false" : "true");
    }
  }

  function handlePeopleDataChange() {
    schedulePeopleSurfaceUpdate();
    scheduleCurrentPlacePeopleRefresh();
  }

  function installPeopleRoundLoadingBridge() {
    const bindObserver = () => {
      const card = document.getElementById("placeCard");
      if (!card || card.dataset.hgPeopleLoadingObserved === "1") {
        schedulePeopleSurfaceUpdate();
        return;
      }

      card.dataset.hgPeopleLoadingObserved = "1";
      if (typeof MutationObserver === "function") {
        const observer = new MutationObserver(() => schedulePeopleSurfaceUpdate());
        observer.observe(card, { childList: true, subtree: true });
      }
      schedulePeopleSurfaceUpdate();
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", bindObserver, { once: true });
    } else {
      bindObserver();
    }

    [
      "hg:people-loading",
      "hg:people-progress",
      "hg:people-priority-ready",
      "hg:people-ready",
      "hg:people-error",
      "hg:place-open-ready",
      "hg:relations-loading",
      "hg:relations-ready",
      "hg:relations-error",
      "hg:city-packages-people-ready",
      "hg:city-packages-relations-ready"
    ].forEach(eventName => window.addEventListener(eventName, handlePeopleDataChange));
  }

  function setPeopleDataState(status, detail = {}) {
    window.HG_PEOPLE_STATUS = status;
    window.HG_PEOPLE_LOADING = status === "loading";
    window.HG_PEOPLE_READY = status === "ready";
    emit(`hg:people-${status}`, detail);
    handlePeopleDataChange();
  }

  function setRelationsDataState(status, detail = {}) {
    window.HG_RELATIONS_STATUS = status;
    window.HG_RELATIONS_LOADING = status === "loading";
    window.HG_RELATIONS_READY = status === "ready";
    emit(`hg:relations-${status}`, detail);
    handlePeopleDataChange();
  }

  function mergeWonderkammerData(...sources) {
    const out = { places: [], people: [] };
    const placeMap = Object.create(null);
    const personMap = Object.create(null);

    const mergeRows = (rows, map, target, idKeys) => {
      for (const row of (Array.isArray(rows) ? rows : [])) {
        const id = String(idKeys.map(key => row?.[key]).find(Boolean) || "").trim();
        if (!id) continue;

        if (!map[id]) {
          map[id] = { ...row, chambers: [] };
          target.push(map[id]);
        }

        const chambers = Array.isArray(row?.chambers) ? row.chambers : [];
        map[id].chambers.push(...chambers);
      }
    };

    for (const source of sources) {
      if (!source) continue;

      if (Array.isArray(source.places) || Array.isArray(source.people)) {
        mergeRows(source.places, placeMap, out.places, ["place_id", "place"]);
        mergeRows(source.people, personMap, out.people, ["person_id", "person"]);
        continue;
      }

      const placeId = String(source.place_id || source.place || "").trim();
      const personId = String(source.person_id || source.person || "").trim();
      const chambers = Array.isArray(source.chambers) ? source.chambers : [];

      if (placeId) mergeRows([{ place_id: placeId, chambers }], placeMap, out.places, ["place_id", "place"]);
      if (personId) mergeRows([{ person_id: personId, chambers }], personMap, out.people, ["person_id", "person"]);
    }

    return out.places.length || out.people.length ? out : null;
  }

  function updatePlacesLoadingIndicator(state, detail = {}) {
    const el = document.getElementById("placesLoadingIndicator");
    if (!el) return;

    const text = el.querySelector(".places-loading-text");
    const hasSelectedPlace = Boolean(String(document.getElementById("placeCard")?.dataset?.currentPlaceId || "").trim());
    const loading = state === "loading" && !window.HG_PLACES_READY && !hasSelectedPlace;
    const failed = state === "error" && !hasSelectedPlace;

    el.classList.toggle("is-error", failed);
    if (text) {
      text.textContent = failed
        ? (detail.message || "Kunne ikke laste steder")
        : "Laster steder …";
    }

    el.hidden = !(loading || failed);
  }

  function setPlacesReadyState(ready, detail = {}) {
    window.HG_PLACES_READY = !!ready;
    const failed = detail?.status === "error" || (detail?.phase === "critical" && ready === false && detail?.done === true);
    window.dispatchEvent(new CustomEvent(ready ? "hg:places-ready" : "hg:places-loading", { detail }));
    updatePlacesLoadingIndicator(ready ? "ready" : (failed ? "error" : "loading"), detail);
  }

  async function loadPlacesCritical() {
    if (window.DataHub?.loadPlacesBase) {
      const loaded = await runSafeAsync("DataHub.loadPlacesBase", () =>
        window.DataHub.loadPlacesBase({ cache: "default" })
      );
      if (Array.isArray(loaded) && loaded.length) return loaded;
    }

    const places = [];
    for (const url of PLACE_FILES_FALLBACK) {
      const data = await fetchJSON(url, { cache: "default" });
      places.push(...normalizeRows(data, "places"));
    }
    return places;
  }

  function initOpenMode() {
    window.OPEN_MODE = localStorage.getItem("HG_OPEN_MODE") === "1";
    window.TEST_MODE = window.OPEN_MODE;

    const openEl = /** @type {HTMLInputElement | null} */ (document.getElementById("openToggle"));
    if (openEl) {
      openEl.checked = window.OPEN_MODE;
      if (openEl.dataset.hgOpenModeBound !== "1") {
        openEl.dataset.hgOpenModeBound = "1";
        openEl.addEventListener("change", () => {
          window.OPEN_MODE = !!openEl.checked;
          window.TEST_MODE = window.OPEN_MODE;
          localStorage.setItem("HG_OPEN_MODE", window.OPEN_MODE ? "1" : "0");
        });
      }
    }

    const btnUA = document.getElementById("btnUnlockAll");
    if (btnUA) btnUA.style.display = window.OPEN_MODE ? "inline-flex" : "none";
  }

  function initMapOnce() {
    if (window.MAP || window.HGMap?.getMap?.()) return window.MAP || window.HGMap.getMap();

    if (typeof START !== "undefined") window.START = START;

    const map = window.HGMap?.initMap?.({
      containerId: "map",
      start: window.START
    });

    if (map) window.MAP = map;
    return map || null;
  }

  function applyPlacesToMap(places) {
    window.PLACES = places;
    window.HGPlaces = places;
    window.allPlaces = places;

    if (!window.HGMap) return;

    if (typeof window.catColor === "function") window.HGMap.setCatColor(window.catColor);
    if (typeof window.visited !== "undefined") window.HGMap.setVisited(window.visited);

    window.HGMap.setPlaces(window.PLACES);
    window.HGMap.setOnPlaceClick((id) => {
      const placeId = String(id || "").trim();
      const p = (window.PLACES || []).find((x) => String(x?.id || "").trim() === placeId);
      if (!p) return;

      // Kartflyvningen gir oss et gratis prefetch-vindu. Når stedet faktisk
      // åpnes er full place/People/popup-pakke allerede i minnet.
      void window.HGPlaceOpen?.preload?.(p);

      const next = `#/place/${encodeURIComponent(placeId)}`;
      if (window.HGAppRouter?.navigate) {
        window.HGAppRouter.navigate(next);
      } else if (location.hash !== next) {
        location.hash = next;
      }
    });
    window.HGMap.refreshMarkers?.();
  }

  function buildRelationIndex(relations) {
    window.REL_BY_PLACE = Object.create(null);
    window.REL_BY_PERSON = Object.create(null);

    for (const r of Array.isArray(relations) ? relations : []) {
      const place = String(r?.place || r?.place_id || "").trim();
      const person = String(r?.person || r?.person_id || "").trim();
      if (place) (window.REL_BY_PLACE[place] ||= []).push(r);
      if (person) (window.REL_BY_PERSON[person] ||= []).push(r);
    }
  }

  function buildWonderkammerIndex(wonderkammer) {
    window.WONDERKAMMER = wonderkammer || null;
    window.WK_BY_PLACE = Object.create(null);
    window.WK_BY_PERSON = Object.create(null);

    if (!wonderkammer) return;

    const wkPlaces = Array.isArray(wonderkammer.places) ? wonderkammer.places : [];
    const wkPeople = Array.isArray(wonderkammer.people) ? wonderkammer.people : [];

    for (const row of wkPlaces) {
      const id = row?.place || row?.place_id;
      if (id) window.WK_BY_PLACE[id] = row.chambers || [];
    }

    for (const row of wkPeople) {
      const id = row?.person || row?.person_id;
      if (id) window.WK_BY_PERSON[id] = row.chambers || [];
    }
  }

  function loadRelationsBackground() {
    if (relationsLoadPromise) return relationsLoadPromise;
    if (window.HG_RELATIONS_READY && Array.isArray(window.RELATIONS)) return Promise.resolve(window.RELATIONS);

    relationsLoadPromise = (async () => {
      setRelationsDataState("loading", { files: RELATION_FILE_LIST.length });
      const datasets = await Promise.all(
        RELATION_FILE_LIST.map(url => fetchJSON(url, { cache: "default" }))
      );
      const loadedFiles = datasets.filter(data => data != null).length;
      if (!loadedFiles) throw new Error("Ingen relasjonsfiler kunne lastes");

      const relations = datasets.flatMap(data => normalizeRows(data, "relations"));
      window.RELATIONS = relations;
      buildRelationIndex(relations);
      setRelationsDataState("ready", {
        count: relations.length,
        files: RELATION_FILE_LIST.length,
        loadedFiles,
        partial: loadedFiles !== RELATION_FILE_LIST.length
      });
      return relations;
    })().catch(error => {
      relationsLoadPromise = null;
      setRelationsDataState("error", { message: String(error?.message || error) });
      throw error;
    });

    return relationsLoadPromise;
  }

  async function loadWonderkammerBackground() {
    const aggregate = await fetchJSON("data/runtime/wonderkammer-all.json", { cache: "force-cache" });
    if (aggregate?.schema === "history-go-runtime-shards-v1" && aggregate.groups) {
      const [places, people] = await Promise.all([
        Promise.all((aggregate.groups.places || []).map(url => fetchJSON(url, { cache: "force-cache" }))),
        Promise.all((aggregate.groups.people || []).map(url => fetchJSON(url, { cache: "force-cache" })))
      ]);
      const merged = { places: places.flat().filter(Boolean), people: people.flat().filter(Boolean) };
      buildWonderkammerIndex(merged);
      emit("hg:wonderkammer-ready", { count: places.length + people.length, aggregate: true });
      return merged;
    }
    if (aggregate && (Array.isArray(aggregate.places) || Array.isArray(aggregate.people))) {
      buildWonderkammerIndex(aggregate);
      emit("hg:wonderkammer-ready", { count: 1, aggregate: true });
      return aggregate;
    }
    const manifest = await fetchJSON("data/wonderkammer/index.json", { cache: "default" });
    const files = Array.isArray(manifest?.files) && manifest.files.length
      ? manifest.files
      : WONDERKAMMER_FALLBACK_FILES;

    const sources = [];
    for (const url of files) {
      const data = await fetchJSON(url, { cache: "default" });
      if (data) sources.push(data);
    }

    const wonderkammer = mergeWonderkammerData(...sources);
    buildWonderkammerIndex(wonderkammer);
    emit("hg:wonderkammer-ready", { count: sources.length });
    return wonderkammer;
  }

  function normalizePeoplePath(entry) {
    const raw = String(entry || "").trim().replace(/^\.?\//, "");
    if (!raw) return null;
    return raw.startsWith("data/") ? raw : `data/${raw}`;
  }

  function loadPeopleBackground() {
    if (peopleLoadPromise) return peopleLoadPromise;
    if (window.HG_PEOPLE_READY && Array.isArray(window.PEOPLE)) return Promise.resolve(window.PEOPLE);

    peopleLoadPromise = (async () => {
      setPeopleDataState("loading", { phase: "manifest" });
      const aggregate = await fetchJSON("data/runtime/people-all.json", { cache: "force-cache" });
      const aggregateRows = aggregate?.schema === "history-go-runtime-shards-v1"
        ? (await Promise.all((aggregate.files || []).map(url => fetchJSON(url, { cache: "force-cache" })))).flatMap(data => normalizeRows(data, "people"))
        : normalizeRows(aggregate, "people");
      if (aggregateRows.length) {
        window.PEOPLE = mergeRowsById(aggregateRows, Array.isArray(window.PEOPLE) ? window.PEOPLE : []);
        setPeopleDataState("ready", { count: window.PEOPLE.length, files: 1, aggregate: true });
        return window.PEOPLE;
      }
      const manifest = await fetchJSON("data/people/manifest.json", { cache: "default" });
      if (!manifest || !Array.isArray(manifest.files)) {
        throw new Error("People-manifestet kunne ikke lastes");
      }

      const peopleFiles = [...new Set(manifest.files.map(normalizePeoplePath).filter(Boolean))];
      if (!peopleFiles.length) throw new Error("People-manifestet inneholder ingen filer");

      const progressStep = Math.max(1, Math.ceil(peopleFiles.length / 20));
      const loadedRowsByFile = new Map();
      let publishedPrioritySignature = "";
      const hasPlaceSegment = (file, placeId) => placeId
        && String(file).split("/").some(segment => segment === placeId);
      const prioritizeOpenPlace = file => hasPlaceSegment(file, getCurrentPlaceId());

      const publishOpenPlaceRows = () => {
        const placeId = getCurrentPlaceId();
        if (!placeId) return;
        const rows = [];
        for (const [file, fileRows] of loadedRowsByFile) {
          if (hasPlaceSegment(file, placeId)) rows.push(...fileRows);
        }
        if (!rows.length) return;

        const signature = `${placeId}:${rows.map(row => String(row?.id || "")).sort().join("|")}`;
        if (signature === publishedPrioritySignature) return;
        publishedPrioritySignature = signature;

        const existingPeople = Array.isArray(window.PEOPLE) ? window.PEOPLE : [];
        window.PEOPLE = mergeRowsById(rows, existingPeople);
        emit("hg:people-priority-ready", {
          placeId,
          count: window.PEOPLE.length,
          files: peopleFiles.filter(file => hasPlaceSegment(file, placeId)).length
        });
        handlePeopleDataChange();
      };

      const rememberRows = ({ url, rows }) => {
        loadedRowsByFile.set(url, Array.isArray(rows) ? rows : []);
        publishOpenPlaceRows();
      };

      const firstPass = await loadRowsWithConcurrency(
        peopleFiles,
        "people",
        PEOPLE_FETCH_CONCURRENCY,
        detail => {
          rememberRows(detail);
          if (
            detail.completed === 1
            || detail.completed === detail.total
            || detail.completed % progressStep === 0
          ) {
            emit("hg:people-progress", {
              completed: detail.completed,
              total: detail.total,
              failed: detail.failed
            });
          }
        },
        prioritizeOpenPlace
      );

      // Små, forbigående nettverksfeil skal ikke gi permanente hull i People.
      // Mislykkede filer får én roligere retry før datasettet publiseres.
      const retry = firstPass.failed.length
        ? await loadRowsWithConcurrency(
          firstPass.failed,
          "people",
          2,
          rememberRows,
          prioritizeOpenPlace
        )
        : { rows: [], failed: [] };
      const loadedRows = [...firstPass.rows, ...retry.rows];
      const failedFiles = retry.failed;
      if (!loadedRows.length && failedFiles.length === peopleFiles.length) {
        throw new Error("Ingen People-filer kunne lastes");
      }

      publishOpenPlaceRows();
      const existingPeople = Array.isArray(window.PEOPLE) ? window.PEOPLE : [];
      const peopleAll = mergeRowsById(loadedRows, existingPeople);
      window.PEOPLE = peopleAll;
      const currentPlaceId = getCurrentPlaceId();
      setPeopleDataState("ready", {
        count: peopleAll.length,
        files: peopleFiles.length,
        failedFiles: failedFiles.length,
        concurrency: PEOPLE_FETCH_CONCURRENCY,
        priorityFiles: peopleFiles.filter(file => hasPlaceSegment(file, currentPlaceId)).length,
        partial: failedFiles.length > 0
      });
      return peopleAll;
    })().catch(error => {
      peopleLoadPromise = null;
      setPeopleDataState("error", { message: String(error?.message || error) });
      throw error;
    });

    return peopleLoadPromise;
  }

  function startPriorityPeopleDataLoad() {
    if (priorityPeopleDataPromise) return priorityPeopleDataPromise;
    priorityPeopleDataPromise = Promise.all([
      runSafeAsync("loadRelationsBackground", loadRelationsBackground),
      runSafeAsync("loadPeopleBackground", loadPeopleBackground)
    ]);
    return priorityPeopleDataPromise;
  }

  async function bootCritical() {
    if (criticalDone) return;
    if (criticalStarted) return;
    criticalStarted = true;

    runSafe("CoreEngine.init", () => window.CoreEngine?.init?.());
    runSafe("HGEngine.init", () => window.HGEngine?.init?.());
    runSafe("HGLearningLog.migrateLegacy", () => window.HGLearningLog?.migrateLegacy?.());

    initOpenMode();

    // Layout/viewport må være riktig før første brukbare kartskjerm,
    // slik at #mapLayer og design-canvaset er korrekt dimensjonert.
    runSafe("ViewportManager.init", () => window.ViewportManager?.init?.());

    window.HG_ENV = {
      geo: "unknown",
      openMode: !!window.OPEN_MODE
    };

    initMapOnce();

    setPlacesReadyState(false, { phase: "critical" });
    const places = await loadPlacesCritical();
    applyPlacesToMap(Array.isArray(places) ? places : []);
    const placesReady = Array.isArray(window.PLACES) && window.PLACES.length > 0;
    setPlacesReadyState(placesReady, {
      phase: "critical",
      count: window.PLACES?.length || 0,
      done: true,
      status: placesReady ? "ready" : "error",
      message: placesReady ? undefined : "Kunne ikke laste steder"
    });

    criticalDone = true;
    emit("hg:criticalReady", { places: window.PLACES?.length || 0 });

    // People og relasjoner er synlig PlaceCard-innhold. Start dem straks kartet
    // er brukbart, i stedet for å legge dem bak Wonderkammer, tags og naturdata.
    void startPriorityPeopleDataLoad();
  }

  /**
   * Binder QuizEngine til det ekte app-API-et (window.PLACES/PEOPLE m.m.).
   * Idempotent: kan trygt kalles både fra app-entry (før router) og fra
   * bootBackground. Default-API-et i js/quizzes.js returnerer null, så denne
   * MÅ ha kjørt før #/quiz kan starte QuizEngine.start.
   * @returns {boolean}
   */
  function initQuizEngine() {
    if (!window.QuizEngine || typeof window.QuizEngine.init !== "function") return false;
    if (window.__HG_QUIZ_ENGINE_APP_API_BOUND__ === true) return true;

    const bind = (fn) => (typeof fn === "function") ? fn : undefined;
    /**
     * @param {string} name
     * @returns {(...args: any[]) => any}
     */
    const lazy = (name) => (...args) => {
      const f = /** @type {any} */ (window)[name];
      if (typeof f === "function") return f(...args);
    };

    window.QuizEngine.init({
      getPersonById: (id) => (window.PEOPLE || []).find((p) => String(p?.id || "").trim() === String(id || "").trim()),
      getPlaceById: (id) => (window.PLACES || []).find((p) => String(p?.id || "").trim() === String(id || "").trim()),
      getVisited: () => (window.visited || {}),
      isTestMode: () => !!window.OPEN_MODE,
      showToast: (...args) => window.showToast?.(...args),
      showRewardPerson: lazy("showRewardPerson"),
      showRewardPlace: lazy("showRewardPlace"),
      showPersonPopup: lazy("showPersonPopup"),
      showPlacePopup: lazy("showPlacePopup"),
      savePeopleCollected: lazy("savePeopleCollected"),
      saveVisitedFromQuiz: lazy("saveVisitedFromQuiz"),
      addCompletedQuizAndMaybePoint: lazy("addCompletedQuizAndMaybePoint"),
      logCorrectQuizAnswer: bind(window.HGInsights?.logCorrectQuizAnswer?.bind(window.HGInsights))
    });

    window.__HG_QUIZ_ENGINE_APP_API_BOUND__ = true;
    return true;
  }

  function waitForBackgroundIdle() {
    return new Promise((resolve) => {
      if (typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(() => resolve(), { timeout: 900 });
      } else {
        setTimeout(resolve, 80);
      }
    });
  }

  async function bootBackground() {
    if (backgroundStarted) return;
    backgroundStarted = true;

    if (!criticalDone) await bootCritical();

    // Prioritert, begrenset parallellitet for brukerens synlige People-data.
    // Resten av de tunge datasettene beholdes serialisert over idle-perioder.
    await startPriorityPeopleDataLoad();

    const tasks = [
      ["loadWonderkammerBackground", loadWonderkammerBackground],
      ["tags", async () => {
        window.TAGS = await fetchJSON("data/tags.json", { cache: "default" }) || [];
        emit("hg:tags-ready", { count: Array.isArray(window.TAGS) ? window.TAGS.length : 0 });
      }],
      ["DataHub.loadNature", () => window.DataHub?.loadNature?.()],
      ["DataHub.loadLesespor", () => window.DataHub?.loadLesespor?.({ cache: "default" })],
      ["HGStories.init", () => window.HGStories?.init?.()],
      ["HGEvents.init", () => window.HGEvents?.init?.()],
      ["HGBrands.init", () => window.HGBrands?.init?.()]
    ];

    // Store ikke-kritiske JSON-kilder parses og indekseres fortsatt én jobb per
    // idle-periode på Safari/iPadOS, slik at kart, router og touch-respons er levende.
    for (const [label, task] of tasks) {
      await waitForBackgroundIdle();
      await runSafeAsync(label, task);
    }

    await waitForBackgroundIdle();
    runSafe("initQuizEngine", initQuizEngine);

    await runSafeAsync("ensureBadgesLoaded", () =>
      typeof ensureBadgesLoaded === "function" ? ensureBadgesLoaded() : undefined
    );

    await waitForBackgroundIdle();
    runSafe("wire", () => typeof window.wire === "function" ? window.wire() : undefined);
    runSafe("renderCollection", () => typeof renderCollection === "function" ? renderCollection() : undefined);
    runSafe("renderGallery", () => typeof window.renderGallery === "function" ? window.renderGallery() : undefined);
    runSafe("initPlaceCardCollapse", () => typeof initPlaceCardCollapse === "function" ? initPlaceCardCollapse() : undefined);
    runSafe("LayerManager.init", () => window.LayerManager?.init?.());
    runSafe("bottomSheetController.init", () => window.bottomSheetController?.init?.());

    emit("hg:backgroundReady", {
      people: window.PEOPLE?.length || 0,
      relations: window.RELATIONS?.length || 0
    });
  }

  installPeopleRoundLoadingBridge();

  window.bootCritical = bootCritical;
  window.bootBackground = bootBackground;
  window.initQuizEngine = initQuizEngine;
})();
