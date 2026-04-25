// ============================================================
// LISTS (Nearby, People, Collection)
// Global-safe versjon
// ============================================================

function renderNearbyPlaces() {
  const listEl = document.getElementById("nearbyList");
  if (!listEl) return;

  const PLACES = window.PLACES || [];
  const visited = window.visited || {};
  const pos = window.getPos?.();

  const filterMode = window.HG_NEARBY_FILTER || "unvisited";
  const freshPlaceId = String(window.HG_LAST_DISCOVERED_PLACE_ID || "").trim();

  let items = PLACES.map(p => ({
    ...p,
    _d: pos && typeof window.distMeters === "function"
      ? Math.round(window.distMeters(pos, { lat: p.lat, lon: p.lon }))
      : null
  }));

  // 🔹 FILTER
  if (filterMode === "unvisited") {
    items = items.filter(p => !visited[p.id]);
  }

  if (filterMode === "unlocked") {
   items = items.filter(p => visited[p.id]);
  }

  // 🔹 SORT
  items.sort((a, b) => (a._d ?? 1e12) - (b._d ?? 1e12));

  listEl.innerHTML = "";

  items.forEach(place => {

    const img = place.image || place.cardImage || "";

    const item = document.createElement("div");
    item.className = "nearby-item";

    if (freshPlaceId && String(place.id || "").trim() === freshPlaceId) {
      item.classList.add("is-fresh-discovery");
    }

    item.innerHTML = `
      <div class="nearby-thumbWrap">
        <img class="nearby-thumb" src="${img}" alt="${place.name}">
        <img class="nearby-badge"
             src="bilder/merker/${place.category}.PNG"
             alt="">
      </div>

      <div class="nearby-content">
        <div class="nearby-title">${place.name}</div>
        <div class="nearby-meta">
          ${place._d != null ? place._d + " m" : ""}
          ${visited[place.id] ? " • ✔" : ""}
          ${freshPlaceId && String(place.id || "").trim() === freshPlaceId ? " • Ny" : ""}
        </div>
      </div>
    `;

    item.addEventListener("click", () => {
  const map = window.HGMap?.getMap?.() || window.MAP;

  if (map && Number.isFinite(place.lon) && Number.isFinite(place.lat)) {
    map.flyTo({
      center: [place.lon, place.lat],
      zoom: Math.max(map.getZoom?.() || 13, 16),
      speed: 1.1,
      essential: true
    });
  }

  setTimeout(() => {
    window.openPlaceCard?.(place);
  }, 820);
});

    listEl.appendChild(item);
  });
}

function renderNearbyPeople() {
  const listEl = document.getElementById("leftPeopleList");
  if (!listEl) return;

  const PEOPLE = window.PEOPLE || [];
  const visited = window.visited || {};
  const REL = window.REL_BY_PLACE || {};

  listEl.innerHTML = "";

  const visitedPlaceIds = Object.keys(visited).filter(id => visited[id]);
  const relatedIds = new Set();

  visitedPlaceIds.forEach(pid => {
    const rels = REL[pid] || [];
    rels.forEach(r => {
      if (r.person) relatedIds.add(r.person);
    });
  });

  const relatedPeople = PEOPLE.filter(p => relatedIds.has(p.id));

  relatedPeople.forEach(person => {
    const img = person.cardImage || person.image || "";

    const item = document.createElement("div");
    item.className = "nearby-item";

    item.innerHTML = `
      <div class="nearby-thumbWrap">
        <img class="nearby-thumb" src="${img}" alt="${person.name}">
      </div>
      <div class="nearby-title">${person.name}</div>
    `;

    item.addEventListener("click", () => {
      if (typeof window.openPersonCard === "function") {
        window.openPersonCard(person);
      }
    });

    listEl.appendChild(item);
  });
}

// ============================================================
// NATURE — flora + fauna fra window.FLORA / window.FAUNA
// Flatter ut emne_pack-objekter (tar med .items) og viser som flat liste.
// ============================================================

function flattenNatureEntries(arr, kind) {
  const out = [];
  (Array.isArray(arr) ? arr : []).forEach(entry => {
    if (!entry || typeof entry !== "object") return;
    if (entry.kind === "emne_pack" && Array.isArray(entry.items)) {
      entry.items.forEach(it => {
        if (it && typeof it === "object" && it.id) out.push({ ...it, _kind: kind });
      });
    } else if (entry.id) {
      out.push({ ...entry, _kind: kind });
    }
  });
  return out;
}

function getNatureUnlockedIds() {
  try {
    const db = window.HGNatureUnlocks?.load?.() || {};
    const flora = Array.isArray(db?.collected?.flora) ? db.collected.flora : [];
    const fauna = Array.isArray(db?.collected?.fauna) ? db.collected.fauna : [];
    return new Set([...flora, ...fauna].map(x => String(x || "").trim()));
  } catch { return new Set(); }
}

window.isNatureUnlocked = function (id) {
  return getNatureUnlockedIds().has(String(id || "").trim());
};

// ---- Bildeopppslag --------------------------------------------------------
// Prøver flere navnekonvensjoner før vi faller tilbake til emoji i UI.
// For fauna har vi faktiske bilder under bilder/natur/insekter/; for flora
// finnes ingen bilder ennå, og funksjonen returnerer "" så CSS viser emoji.
const _natureImageCache = new Map();

function natureImageCandidates(obj, kind) {
  const cands = [];
  const id = String(obj.id || "").trim();
  const rel = String(obj.related_fauna_id || obj.related_flora_id || "").trim();

  const strips = new Set();
  if (id) {
    strips.add(id);
    strips.add(id.replace(/^emne_fauna_bille_/, ""));
    strips.add(id.replace(/^emne_fauna_/, ""));
    strips.add(id.replace(/^emne_flora_/, ""));
    strips.add(id.replace(/^emne_kratt_/, ""));
    strips.add(id.replace(/^emne_ved_/, ""));
    strips.add(id.replace(/^emne_gress_/, ""));
    strips.add(id.split("_").pop());
  }
  if (rel) {
    strips.add(rel);
    strips.add(rel.replace(/^fauna_/, ""));
    strips.add(rel.replace(/^flora_/, ""));
  }

  const subdir = kind === "fauna" ? "insekter" : "flora";
  for (const stem of strips) {
    if (!stem) continue;
    cands.push(`bilder/natur/${subdir}/${stem}.PNG`);
    cands.push(`bilder/natur/${subdir}/${stem}.png`);
  }
  return cands;
}

async function probeImage(url) {
  return new Promise(res => {
    const img = new Image();
    img.onload = () => res(true);
    img.onerror = () => res(false);
    img.src = url;
  });
}

window.resolveNatureImage = function (obj, kind) {
  if (!obj) return "";
  const cached = _natureImageCache.get(obj.id);
  if (cached !== undefined) return cached;
  // Synkron best-effort: returner første kandidat og la <img onerror> fallback i UI.
  const cands = natureImageCandidates(obj, kind || obj._kind);
  const guess = cands[0] || "";
  _natureImageCache.set(obj.id, guess);
  return guess;
};

// ---- Distance-kobling (natur → steder via nature_unlock_map) --------------
let _natureToPlaces = null;
let _natureMapLoading = null;

async function ensureNatureToPlacesMap() {
  if (_natureToPlaces) return _natureToPlaces;
  if (_natureMapLoading) return _natureMapLoading;

  _natureMapLoading = (async () => {
    const map = new Map(); // natureId → Set<placeId>
    try {
      const url = new URL("data/natur/nature_unlock_map.json", document.baseURI).toString();
      const r = await fetch(url, { cache: "no-store" });
      if (!r.ok) throw new Error(r.status);
      const data = await r.json();
      const PLACE_IDS = new Set((window.PLACES || []).map(p => String(p.id || "").trim()).filter(Boolean));
      for (const [quizOrPlaceId, hit] of Object.entries(data || {})) {
        // Nøkler i unlock_map ser ut som "<placeId>_quiz_<n>". Strip suffix.
        const placeId = String(quizOrPlaceId).replace(/_quiz_\d+$/, "").trim();
        if (!PLACE_IDS.has(placeId)) continue;
        const ids = [...(hit?.flora || []), ...(hit?.fauna || [])];
        for (const raw of ids) {
          const id = String(raw || "").trim();
          if (!id) continue;
          if (!map.has(id)) map.set(id, new Set());
          map.get(id).add(placeId);
          // Legg også til "emne_"-prefiksvarianten hvis registerid er brukt rått.
          if (!id.startsWith("emne_")) {
            const pref = id.startsWith("fauna_") ? "emne_fauna_" :
                         id.startsWith("flora_") ? "emne_flora_" : "";
            if (pref) {
              const alt = pref + id.replace(/^(fauna|flora)_/, "");
              if (!map.has(alt)) map.set(alt, new Set());
              map.get(alt).add(placeId);
            }
          }
        }
      }
    } catch (e) {
      if (window.DEBUG) console.warn("[natur] nature_unlock_map kunne ikke lastes:", e);
    }
    _natureToPlaces = map;
    return map;
  })();

  return _natureMapLoading;
}

function nearestDistanceFor(obj, placesById, pos) {
  if (!pos || !_natureToPlaces || !window.distMeters) return null;
  const placeIds = _natureToPlaces.get(obj.id);
  if (!placeIds || !placeIds.size) return null;
  let min = Infinity;
  for (const pid of placeIds) {
    const p = placesById.get(pid);
    if (!p || !Number.isFinite(p.lat) || !Number.isFinite(p.lon)) continue;
    const d = window.distMeters(pos, { lat: p.lat, lon: p.lon });
    if (Number.isFinite(d) && d < min) min = d;
  }
  return min === Infinity ? null : Math.round(min);
}

// ---- Filter -----------------------------------------------------------------
// Gyldige verdier: "all" | "unlocked" | "flora" | "fauna"
function getNatureFilter() {
  return window.HG_NATURE_FILTER || "all";
}

function applyNatureFilter(list, filter, unlocked) {
  if (filter === "unlocked") return list.filter(o => unlocked.has(o.id));
  if (filter === "flora") return list.filter(o => o._kind === "flora");
  if (filter === "fauna") return list.filter(o => o._kind === "fauna");
  return list;
}

// ---- Render -----------------------------------------------------------------
function renderNearbyNature() {
  const listEl = document.getElementById("leftNatureList");
  if (!listEl) return;

  const flora = flattenNatureEntries(window.FLORA, "flora");
  const fauna = flattenNatureEntries(window.FAUNA, "fauna");
  let all = flora.concat(fauna);

  if (!all.length) {
    listEl.innerHTML = `
      <div class="hg-empty-guide">
        <div class="hg-empty-guide-icon">🌿</div>
        <div class="hg-empty-guide-title">Natur lastes inn</div>
        <div class="hg-empty-guide-text">Gi det et øyeblikk — flora og fauna for Oslo lastes i bakgrunnen.</div>
      </div>
    `;
    return;
  }

  const unlocked = getNatureUnlockedIds();
  const filterMode = getNatureFilter();

  // Spesiell empty-state: ingen samlet ennå, hjelp brukeren videre.
  if (unlocked.size === 0 && filterMode === "all") {
    listEl.innerHTML = `
      <div class="hg-empty-guide">
        <div class="hg-empty-guide-icon">🌿</div>
        <div class="hg-empty-guide-title">Ingen arter samlet ennå</div>
        <div class="hg-empty-guide-text">Ta en quiz på et naturrikt sted for å låse opp din første plante eller ditt første dyr. Vigelandsparken, Botanisk hage og Sognsvann er gode startsteder.</div>
        <button type="button" class="hg-empty-guide-action" data-onb-action="open-places">Vis steder</button>
      </div>
    `;
    listEl.querySelector('[data-onb-action="open-places"]')?.addEventListener("click", () => {
      const placesTab = document.querySelector('[data-leftmode="nearby"]');
      if (placesTab) placesTab.click();
    });
    return;
  }

  all = applyNatureFilter(all, filterMode, unlocked);

  // Spesiell empty-state for filter med 0 treff
  if (!all.length) {
    const labels = { unlocked: "samlede arter", flora: "planter", fauna: "dyr" };
    const label = labels[filterMode] || "arter";
    listEl.innerHTML = `
      <div class="hg-empty-guide">
        <div class="hg-empty-guide-icon">🔍</div>
        <div class="hg-empty-guide-title">Ingen ${label} her</div>
        <div class="hg-empty-guide-text">Filteret ditt skjuler alle arter akkurat nå. Endre filter via 🎯-knappen for å se mer.</div>
      </div>
    `;
    return;
  }

  // Prøv å laste mapping for distance-sort (ikke-blokkerende — re-render ved ferdigstilling).
  ensureNatureToPlacesMap().then((m) => {
    if (m && m.size && document.querySelector(".nearby-tab.is-active")?.getAttribute("data-leftmode") === "nature") {
      // Re-render kun dersom vi ikke allerede har brukt mappingen (første gang).
      if (!listEl.dataset.distMapApplied) {
        listEl.dataset.distMapApplied = "1";
        renderNearbyNature();
      }
    }
  });

  const placesById = new Map((window.PLACES || []).map(p => [String(p.id || "").trim(), p]));
  const pos = window.getPos?.();

  const decorated = all.map(obj => ({
    obj,
    _d: nearestDistanceFor(obj, placesById, pos)
  }));

  // Sortering: låst opp først, deretter avstand (hvis satt), så alfabetisk.
  decorated.sort((a, b) => {
    const au = unlocked.has(a.obj.id) ? 0 : 1;
    const bu = unlocked.has(b.obj.id) ? 0 : 1;
    if (au !== bu) return au - bu;
    const ad = a._d ?? Infinity;
    const bd = b._d ?? Infinity;
    if (ad !== bd) return ad - bd;
    return String(a.obj.title || "").localeCompare(String(b.obj.title || ""), "nb");
  });

  listEl.innerHTML = "";

  decorated.forEach(({ obj, _d }) => {
    const isUnlocked = unlocked.has(obj.id);
    const title = obj.title || obj.id || "";
    const latin = obj.latin || obj.taxonomy?.latin_navn || "";
    const kindIcon = obj._kind === "fauna" ? "🐞" : "🌿";
    const imgSrc = window.resolveNatureImage(obj, obj._kind);
    const distText = _d != null ? `${_d} m` : "";

    const item = document.createElement("div");
    item.className = "nearby-item" + (isUnlocked ? " is-unlocked" : " is-locked") + ` is-${obj._kind}`;

    // Hvis bildet mangler på disk, faller vi tilbake til emoji via onerror.
    const thumb = imgSrc
      ? `<img class="nearby-thumb" src="${imgSrc}" alt="${title}"
              onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'nearby-thumb nearby-thumb-icon',textContent:'${kindIcon}'}))">`
      : `<div class="nearby-thumb nearby-thumb-icon">${kindIcon}</div>`;

    const metaParts = [];
    if (latin) metaParts.push(`<em>${latin}</em>`);
    if (distText) metaParts.push(distText);

    item.innerHTML = `
      <div class="nearby-thumbWrap">${thumb}</div>
      <div class="nearby-content">
        <div class="nearby-title">${title}</div>
        ${metaParts.length ? `<div class="nearby-meta">${metaParts.join(" · ")}</div>` : ""}
      </div>
    `;

    item.addEventListener("click", () => {
      if (typeof window.openNatureCard === "function") window.openNatureCard(obj);
      else if (typeof window.showToast === "function") {
        window.showToast(`${title}${latin ? ` (${latin})` : ""}`);
      }
    });

    listEl.appendChild(item);
  });
}

function renderCollection() {
  const grid = document.getElementById("collectionGrid");
  if (!grid) return;

  const PLACES = window.PLACES || [];
  const visited = window.visited || {};

  grid.innerHTML = "";

  PLACES.filter(p => visited[p.id]).forEach(place => {
    const img = place.cardImage || place.image || "";

    const item = document.createElement("div");
    item.className = "collection-item";

    item.innerHTML = `
      <img src="${img}" alt="${place.name}">
      <div>${place.name}</div>
    `;

    item.addEventListener("click", () => {
      if (typeof window.openPlaceCard === "function") {
        window.openPlaceCard(place);
      }
    });

    grid.appendChild(item);
  });
}

// eksponer globalt
window.renderNearbyPlaces = renderNearbyPlaces;
window.renderNearbyPeople = renderNearbyPeople;
window.renderNearbyNature = renderNearbyNature;
window.renderCollection = renderCollection;

// Eksponeres for natur-kortet (map-kobling).
// getNaturePlaces(id) → Promise<Array<{place, distance}>> sortert nærmest først.
window.getNaturePlaces = async function (natureId) {
  const map = await ensureNatureToPlacesMap();
  const ids = map?.get(String(natureId || "").trim());
  if (!ids || !ids.size) return [];
  const placesById = new Map((window.PLACES || []).map(p => [String(p.id || "").trim(), p]));
  const pos = window.getPos?.();
  const out = [];
  for (const pid of ids) {
    const place = placesById.get(pid);
    if (!place) continue;
    const d = (pos && window.distMeters && Number.isFinite(place.lat) && Number.isFinite(place.lon))
      ? Math.round(window.distMeters(pos, { lat: place.lat, lon: place.lon }))
      : null;
    out.push({ place, distance: d });
  }
  out.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
  return out;
};

// flyToPlace(place) — sentrer kartet på et sted, lukker aktive modaler og
// åpner place-card. Brukes av natur-kortet for "Vis på kart"-knappen.
window.flyToPlace = function (place) {
  if (!place || !Number.isFinite(place.lat) || !Number.isFinite(place.lon)) return false;
  const map = window.HGMap?.getMap?.() || window.MAP;
  if (map) {
    map.flyTo({
      center: [place.lon, place.lat],
      zoom: Math.max(map.getZoom?.() || 13, 16),
      speed: 1.1,
      essential: true
    });
  }
  setTimeout(() => { window.openPlaceCard?.(place); }, 820);
  return true;
};
