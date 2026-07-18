// js/nature_place_map_bridge.js
// ------------------------------------------------------------
// Kobler de aktive place-level naturkartene til PlaceCard/Natur-rundingen.
// Endrer ikke HGNatureUnlocks eller quiz-unlock-logikken.
// ------------------------------------------------------------
(function () {
  "use strict";

  const MAP_URLS = [
    "data/natur/nature_place_map.json",
    "data/natur/nature_bird_place_map.json",
    "data/natur/nature_oslo_expansion_place_map.json",
    "data/natur/nature_routes_place_map.json",
    "data/natur/nature_etne_place_map.json"
  ];

  let mapCache = null;
  let mapPromise = null;

  function s(value) {
    return String(value ?? "").trim();
  }

  function uniq(values) {
    return [...new Set((Array.isArray(values) ? values : []).map(s).filter(Boolean))];
  }

  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderNatureProfile(place) {
    return window.HGPlaceNatureProfile && typeof window.HGPlaceNatureProfile.render === "function"
      ? window.HGPlaceNatureProfile.render(place)
      : "";
  }

  function mergeEntry(base, extra) {
    const out = { ...(base || {}), ...(extra || {}) };
    out.flora = uniq([
      ...(Array.isArray(base?.flora) ? base.flora : []),
      ...(Array.isArray(extra?.flora) ? extra.flora : [])
    ]);
    out.fauna = uniq([
      ...(Array.isArray(base?.fauna) ? base.fauna : []),
      ...(Array.isArray(extra?.fauna) ? extra.fauna : [])
    ]);

    if (base?.sourceQuizIds || extra?.sourceQuizIds) {
      out.sourceQuizIds = uniq([
        ...(Array.isArray(base?.sourceQuizIds) ? base.sourceQuizIds : []),
        ...(Array.isArray(extra?.sourceQuizIds) ? extra.sourceQuizIds : [])
      ]);
    }

    return out;
  }

  function mergeMaps(maps) {
    const merged = Object.create(null);
    for (const map of maps) {
      if (!map || typeof map !== "object") continue;
      for (const [placeId, entry] of Object.entries(map)) {
        merged[placeId] = mergeEntry(merged[placeId], entry);
      }
    }
    return merged;
  }

  function flattenNature(list) {
    const out = [];
    for (const item of Array.isArray(list) ? list : []) {
      if (!item) continue;
      if (Array.isArray(item.items)) out.push(...item.items.filter(Boolean));
      if (item.id) out.push(item);
    }
    return out;
  }

  function indexById(list) {
    const index = Object.create(null);
    for (const item of flattenNature(list)) {
      const id = s(item?.id);
      if (id && !index[id]) index[id] = item;
    }
    return index;
  }

  async function fetchJson(path) {
    if (window.DataHub && typeof window.DataHub.fetchJSON === "function") {
      try {
        return await window.DataHub.fetchJSON(path, { cache: "no-store", bust: true });
      } catch {}
    }

    const url = new URL(path, document.baseURI).toString();
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`${response.status} ${path}`);
    return await response.json();
  }

  async function loadNaturePlaceMap() {
    if (mapCache) return mapCache;
    if (mapPromise) return mapPromise;

    mapPromise = (async () => {
      const maps = [];
      for (const url of MAP_URLS) {
        const raw = await fetchJson(url).catch(() => ({}));
        maps.push(raw && typeof raw === "object" ? (raw.places || raw) : {});
      }
      mapCache = mergeMaps(maps);
      window.NATURE_PLACE_MAP = mapCache;
      return mapCache;
    })();

    return mapPromise;
  }

  async function ensureNatureLoaded() {
    if (window.DataHub && typeof window.DataHub.loadNature === "function") {
      try {
        await window.DataHub.loadNature();
      } catch {}
    }

    window.FLORA = flattenNature(Array.isArray(window.FLORA) ? window.FLORA : []);
    window.FAUNA = flattenNature(Array.isArray(window.FAUNA) ? window.FAUNA : []);

    return {
      flora: window.FLORA,
      fauna: window.FAUNA,
      floraById: indexById(window.FLORA),
      faunaById: indexById(window.FAUNA)
    };
  }

  function patchDataHubLoadNature() {
    if (!window.DataHub || typeof window.DataHub.loadNature !== "function") return;
    if (window.DataHub.__naturePlaceBridgePatched) return;

    const original = window.DataHub.loadNature.bind(window.DataHub);
    window.DataHub.loadNature = async function patchedLoadNature(...args) {
      const result = await original(...args);
      window.FLORA = flattenNature(Array.isArray(window.FLORA) ? window.FLORA : []);
      window.FAUNA = flattenNature(Array.isArray(window.FAUNA) ? window.FAUNA : []);
      return result;
    };

    window.DataHub.__naturePlaceBridgePatched = true;
  }

  function titleOf(item) {
    return s(item?.title || item?.name || item?.taxonomy?.norsk_navn || item?.id);
  }

  function latinOf(item) {
    return s(item?.latin || item?.taxonomy?.latin_navn);
  }

  function imgOf(item) {
    return s(item?.imageCard || item?.cardImage || item?.image || item?.img);
  }

  function faunaEmoji(item) {
    const klass = s(item?.taxonomy?.klasse || item?.taxonomy?.klass || item?.klass).toLowerCase();
    const order = s(item?.taxonomy?.orden || item?.taxonomy?.order || item?.order).toLowerCase();
    const family = s(item?.taxonomy?.familie || item?.family).toLowerCase();
    const latin = latinOf(item).toLowerCase();

    if (
      klass.includes("actinopteryg") ||
      order.includes("salmoniform") ||
      order.includes("anguilliform") ||
      order.includes("gasterosteiform") ||
      family.includes("salmonidae") ||
      family.includes("anguillidae") ||
      family.includes("gasterosteidae")
    ) return "🐟";

    if (
      klass.includes("aves") ||
      family.includes("laridae") ||
      family.includes("corvidae") ||
      ["passer", "corvus", "larus", "anas", "columba", "turdus", "parus", "cyanistes", "pica"].some(token => latin.includes(token))
    ) return "🐦";

    return "🐝";
  }

  function renderNatureButton(item, kind) {
    const id = s(item?.id);
    if (!id) return "";

    const title = titleOf(item);
    const latin = latinOf(item);
    const img = imgOf(item);
    const attr = kind === "fauna" ? "data-fauna" : "data-flora";
    const emoji = kind === "fauna" ? faunaEmoji(item) : "🌿";

    return `
      <button class="pc-flora pc-nature-entry pc-nature-entry-${esc(kind)}" ${attr}="${esc(id)}" aria-label="${esc(title)}">
        ${img ? `<img src="${esc(img)}" class="pc-person-img" alt="">` : `<span class="pc-nature-emoji">${esc(emoji)}</span>`}
        <span class="pc-nature-name">${esc(title)}</span>
        ${latin ? `<span class="pc-nature-latin">${esc(latin)}</span>` : ""}
      </button>
    `;
  }

  function renderNatureList({ place, floraItems, faunaItems }) {
    const profileHtml = renderNatureProfile(place);
    const floraHtml = floraItems.length
      ? `<div class="pc-nature-section"><div class="pc-nature-section-title">Flora</div>${floraItems.map(item => renderNatureButton(item, "flora")).join("")}</div>`
      : "";
    const faunaHtml = faunaItems.length
      ? `<div class="pc-nature-section"><div class="pc-nature-section-title">Fauna</div>${faunaItems.map(item => renderNatureButton(item, "fauna")).join("")}</div>`
      : "";
    const speciesHtml = (floraHtml || faunaHtml)
      ? `<div class="pc-flora-row pc-nature-row">${floraHtml}${faunaHtml}</div>`
      : "";

    return `${profileHtml}${speciesHtml}`;
  }

  async function getNatureForPlace(place) {
    const placeId = s(place?.id);
    const map = await loadNaturePlaceMap();
    const bio = await ensureNatureLoaded();
    const entry = map?.[placeId] || null;

    const floraIds = uniq([
      ...(Array.isArray(place?.flora) ? place.flora : []),
      ...(Array.isArray(entry?.flora) ? entry.flora : [])
    ]);
    const faunaIds = uniq([
      ...(Array.isArray(place?.fauna) ? place.fauna : []),
      ...(Array.isArray(entry?.fauna) ? entry.fauna : [])
    ]);

    return {
      entry,
      floraIds,
      faunaIds,
      floraItems: floraIds.map(id => bio.floraById[id]).filter(Boolean),
      faunaItems: faunaIds.map(id => bio.faunaById[id]).filter(Boolean)
    };
  }

  async function applyNatureToPlaceCard(place) {
    const natureEl = document.getElementById("pcNatureList");
    const natureIcon = document.getElementById("pcNatureIcon");
    if (!natureEl && !natureIcon) return;

    const nature = await getNatureForPlace(place);
    const count = nature.floraItems.length + nature.faunaItems.length;

    if (natureEl) natureEl.innerHTML = renderNatureList({ place, ...nature });

    if (natureIcon) {
      const firstWithImg = [...nature.floraItems, ...nature.faunaItems].find(imgOf);
      const img = firstWithImg ? imgOf(firstWithImg) : "";
      if (img) {
        natureIcon.innerHTML = `<img src="${esc(img)}" class="pc-person-img" alt="">`;
      } else {
        const emoji = nature.floraItems.length
          ? "🌿"
          : (nature.faunaItems.length ? faunaEmoji(nature.faunaItems[0]) : "🌿");
        natureIcon.innerHTML = `
          <div class="pc-round-label">
            <span class="pc-round-emoji">${emoji}</span>
            <span class="pc-round-count">${count}</span>
          </div>
        `;
      }
    }
  }

  function showNatureItemPopup(item, kind) {
    if (!item) return;
    if (typeof window.openNatureCard === "function") {
      window.openNatureCard({ ...item, _kind: kind });
      return;
    }
    if (kind === "flora" && typeof window.showFloraPopup === "function") {
      window.showFloraPopup(item);
      return;
    }

    const img = imgOf(item);
    const title = titleOf(item) || (kind === "fauna" ? "Art" : "Plante");
    const latin = latinOf(item);
    const desc = s(item?.desc || item?.description || item?.fenologi?.strategi || item?.observasjonstips?.[0]);

    window.showPlaceCardRoundPopup?.({
      title,
      subtitle: latin,
      kind: kind || "nature",
      html: `
        <div class="hg-flora-popup hg-fauna-popup">
          ${img ? `<img src="${esc(img)}" class="hg-flora-img" alt="">` : `<div class="pc-nature-emoji">${kind === "fauna" ? faunaEmoji(item) : "🌿"}</div>`}
          ${desc ? `<p class="hg-popup-desc">${esc(desc)}</p>` : `<p class="hg-muted">Ingen beskrivelse ennå.</p>`}
        </div>
      `
    });
  }

  document.addEventListener("click", async event => {
    const target = event.target instanceof Element
      ? event.target.closest("[data-flora], [data-fauna]")
      : null;
    if (!(target instanceof HTMLElement)) return;

    const kind = target.hasAttribute("data-fauna") ? "fauna" : "flora";
    const id = s(kind === "fauna" ? target.dataset.fauna : target.dataset.flora);
    if (!id) return;

    event.preventDefault();
    event.stopPropagation();
    const bio = await ensureNatureLoaded();
    const item = kind === "fauna" ? bio.faunaById[id] : bio.floraById[id];
    showNatureItemPopup(item, kind);
  }, true);

  function patchOpenPlaceCard() {
    if (typeof window.openPlaceCard !== "function") return false;
    if (window.openPlaceCard.__naturePlaceBridgePatched) return true;

    const original = window.openPlaceCard;
    const patched = async function patchedOpenPlaceCard(place) {
      const map = await loadNaturePlaceMap();
      const entry = map?.[s(place?.id)] || null;
      const enrichedPlace = entry
        ? {
            ...place,
            flora: uniq([
              ...(Array.isArray(place?.flora) ? place.flora : []),
              ...(Array.isArray(entry.flora) ? entry.flora : [])
            ]),
            fauna: uniq([
              ...(Array.isArray(place?.fauna) ? place.fauna : []),
              ...(Array.isArray(entry.fauna) ? entry.fauna : [])
            ])
          }
        : place;

      const result = await original.call(this, enrichedPlace);
      const latestPlace = (Array.isArray(window.PLACES) ? window.PLACES : []).find(
        candidate => s(candidate?.id) === s(enrichedPlace?.id)
      ) || enrichedPlace;
      await applyNatureToPlaceCard(latestPlace);
      return result;
    };

    patched.__naturePlaceBridgePatched = true;
    window.openPlaceCard = patched;
    return true;
  }

  function init() {
    patchDataHubLoadNature();
    patchOpenPlaceCard();
    loadNaturePlaceMap();
  }

  window.HGNaturePlaceMap = {
    load: loadNaturePlaceMap,
    getForPlace: getNatureForPlace,
    applyToPlaceCard: applyNatureToPlaceCard,
    patchOpenPlaceCard
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
