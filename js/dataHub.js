// js/dataHub.js
// Laster base places/people + subject-overlays og merger til "enriched" objekter

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed ${res.status} for ${url}`);
  return res.json();
}

function indexBy(arr, key) {
  const m = new Map();
  (arr || []).forEach(x => {
    const k = x && x[key];
    if (k) m.set(k, x);
  });
  return m;
}

function mergeDeep(base, extra) {
  if (!extra) return base;
  // enkel, “forutsigbar” merge:
  // - primitive i extra overskriver base
  // - arrays concatenates (unik)
  // - objects merges
  const out = { ...(base || {}) };

  for (const [k, v] of Object.entries(extra)) {
    if (v == null) continue;

    const prev = out[k];

    if (Array.isArray(v)) {
      const a = Array.isArray(prev) ? prev : [];
      const merged = [...a, ...v].filter(Boolean);
      out[k] = Array.from(new Set(merged.map(x => JSON.stringify(x))))
        .map(s => JSON.parse(s));
    } else if (typeof v === "object") {
      out[k] = mergeDeep(prev && typeof prev === "object" ? prev : {}, v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

export async function loadTags() {
  return fetchJSON("../data/tags.json");
}

export async function loadPlacesBase() {
  return fetchJSON("../data/places.json");
}

export async function loadPeopleBase() {
  return fetchJSON("../data/people.json");
}

export async function loadPlaceOverlays(subjectId) {
  return fetchJSON(`../data/overlays/${subjectId}/places_${subjectId}.json`);
}

export async function loadPeopleOverlays(subjectId) {
  return fetchJSON(`../data/overlays/${subjectId}/people_${subjectId}.json`);
}

export async function getPlaceEnriched(placeId, subjectId) {
  const [places, overlays] = await Promise.all([
    loadPlacesBase(),
    loadPlaceOverlays(subjectId)
  ]);

  const base = places.find(p => p.id === placeId) || null;
  if (!base) return null;

  const overlay = (overlays || []).find(o => o.placeId === placeId) || null;

  // legg overlay på base, men behold base.id osv.
  return mergeDeep(base, overlay ? { ...overlay, id: base.id } : null);
}

export async function getPersonEnriched(personId, subjectId) {
  const [people, overlays] = await Promise.all([
    loadPeopleBase(),
    loadPeopleOverlays(subjectId)
  ]);

  const base = people.find(p => p.id === personId) || null;
  if (!base) return null;

  const overlay = (overlays || []).find(o => o.personId === personId) || null;
  return mergeDeep(base, overlay ? { ...overlay, id: base.id } : null);
}

// ---- TAGS: normalisering (legacy → canonical) ----
export function normalizeTags(rawTags, tagsRegistry) {
  const list = Array.isArray(rawTags) ? rawTags : [];
  const legacyMap = (tagsRegistry && tagsRegistry.legacy_map) || {};
  return list.map(t => legacyMap[t] || t).filter(Boolean);
}
