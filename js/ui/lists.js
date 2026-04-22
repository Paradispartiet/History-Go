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

function renderNearbyNature() {
  const listEl = document.getElementById("leftNatureList");
  if (!listEl) return;

  const flora = flattenNatureEntries(window.FLORA, "flora");
  const fauna = flattenNatureEntries(window.FAUNA, "fauna");
  const all = flora.concat(fauna);

  if (!all.length) {
    listEl.innerHTML = `<div class="muted" style="padding:12px;">Ingen natur-data lastet ennå.</div>`;
    return;
  }

  const unlocked = getNatureUnlockedIds();

  // Sortering: låst opp først, deretter alfabetisk på tittel.
  all.sort((a, b) => {
    const au = unlocked.has(a.id) ? 0 : 1;
    const bu = unlocked.has(b.id) ? 0 : 1;
    if (au !== bu) return au - bu;
    return String(a.title || "").localeCompare(String(b.title || ""), "nb");
  });

  listEl.innerHTML = "";

  all.forEach(obj => {
    const isUnlocked = unlocked.has(obj.id);
    const title = obj.title || obj.id || "";
    const latin = obj.latin || obj.taxonomy?.latin_navn || "";
    const kindIcon = obj._kind === "fauna" ? "🐞" : "🌿";

    const item = document.createElement("div");
    item.className = "nearby-item" + (isUnlocked ? " is-unlocked" : " is-locked");

    item.innerHTML = `
      <div class="nearby-thumbWrap">
        <div class="nearby-thumb" style="display:flex;align-items:center;justify-content:center;background:#e8efe6;font-size:22px;">
          ${kindIcon}
        </div>
      </div>
      <div class="nearby-content">
        <div class="nearby-title">${title}</div>
        <div class="nearby-meta">
          ${latin ? `<em>${latin}</em>` : ""}
          ${isUnlocked ? " • ✔" : ""}
        </div>
      </div>
    `;

    item.addEventListener("click", () => {
      window.openNatureCard?.(obj) || openNatureInfoToast(obj, isUnlocked);
    });

    listEl.appendChild(item);
  });
}

function openNatureInfoToast(obj, isUnlocked) {
  const parts = [];
  parts.push(`${obj.title}${obj.latin ? ` (${obj.latin})` : ""}`);
  if (!isUnlocked) parts.push("Ikke låst opp ennå — ta en quiz på riktig sted.");
  if (Array.isArray(obj.kjennetegn) && obj.kjennetegn.length) {
    parts.push("Kjennetegn: " + obj.kjennetegn.slice(0, 2).join("; "));
  }
  if (typeof window.showToast === "function") {
    window.showToast(parts.join(" • "));
  } else {
    console.log("[nature]", parts.join(" • "));
  }
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
