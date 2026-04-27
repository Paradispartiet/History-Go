// js/nature_place_map_bridge.js
// ------------------------------------------------------------
// Kobler data/natur/nature_place_map.json til PlaceCard/Natur-rundingen.
// Endrer ikke HGNatureUnlocks eller quiz-unlock-logikken.
// ------------------------------------------------------------
(function () {
  "use strict";

  const MAP_URL = "data/natur/nature_place_map.json";

  let _map = null;
  let _mapLoading = null;

  function s(x) {
    return String(x ?? "").trim();
  }

  function uniq(xs) {
    return [...new Set((Array.isArray(xs) ? xs : []).map(s).filter(Boolean))];
  }

  function flattenNature(list) {
    const out = [];
    (Array.isArray(list) ? list : []).forEach(item => {
      if (!item) return;
      if (Array.isArray(item.items)) out.push(...item.items.filter(Boolean));
      if (item.id) out.push(item);
    });
    return out;
  }

  function indexById(list) {
    const idx = Object.create(null);
    flattenNature(list).forEach(item => {
      const id = s(item && item.id);
      if (id && !idx[id]) idx[id] = item;
    });
    return idx;
  }

  async function fetchJson(path) {
    if (window.DataHub && typeof window.DataHub.fetchJSON === "function") {
      try {
        return await window.DataHub.fetchJSON(path, { cache: "no-store", bust: true });
      } catch {}
    }
    const url = new URL(path, document.baseURI).toString();
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`${res.status} ${path}`);
    return await res.json();
  }

  async function loadNaturePlaceMap() {
    if (_map) return _map;
    if (_mapLoading) return _mapLoading;

    _mapLoading = (async () => {
      const raw = await fetchJson(MAP_URL).catch(() => ({}));
      _map = raw && typeof raw === "object" ? (raw.places || raw) : {};
      window.NATURE_PLACE_MAP = _map;
      return _map;
    })();

    return _mapLoading;
  }

  async function ensureNatureLoaded() {
    if (window.DataHub && typeof window.DataHub.loadNature === "function") {
      try { await window.DataHub.loadNature(); } catch {}
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
      const res = await original(...args);
      window.FLORA = flattenNature(Array.isArray(window.FLORA) ? window.FLORA : []);
      window.FAUNA = flattenNature(Array.isArray(window.FAUNA) ? window.FAUNA : []);
      return res;
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
    return s(item?.imageCard || item?.cardImage || item?.image || item?.img || item?.icon);
  }

  function renderNatureButton(item, kind) {
    const id = s(item?.id);
    if (!id) return "";
    const title = titleOf(item);
    const latin = latinOf(item);
    const img = imgOf(item);
    const attr = kind === "fauna" ? "data-fauna" : "data-flora";

    return `
      <button class="pc-flora pc-nature-entry pc-nature-entry-${kind}" ${attr}="${id}" aria-label="${title}">
        ${img ? `<img src="${img}" class="pc-person-img" alt="">` : `<span class="pc-nature-emoji">${kind === "fauna" ? "🐝" : "🌿"}</span>`}
        <span class="pc-nature-name">${title}</span>
        ${latin ? `<span class="pc-nature-latin">${latin}</span>` : ""}
      </button>
    `;
  }

  function renderNatureList({ floraItems, faunaItems }) {
    const floraHtml = floraItems.length
      ? `<div class="pc-nature-section"><div class="pc-nature-section-title">Flora</div>${floraItems.map(x => renderNatureButton(x, "flora")).join("")}</div>`
      : "";

    const faunaHtml = faunaItems.length
      ? `<div class="pc-nature-section"><div class="pc-nature-section-title">Fauna</div>${faunaItems.map(x => renderNatureButton(x, "fauna")).join("")}</div>`
      : "";

    return (floraHtml || faunaHtml)
      ? `<div class="pc-flora-row pc-nature-row">${floraHtml}${faunaHtml}</div>`
      : `<div class="pc-empty">Ingen naturkoblinger ennå</div>`;
  }

  async function getNatureForPlace(place) {
    const placeId = s(place && place.id);
    const map = await loadNaturePlaceMap();
    const bio = await ensureNatureLoaded();
    const entry = map && map[placeId] ? map[placeId] : null;

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

    if (natureEl) {
      natureEl.innerHTML = renderNatureList(nature);
    }

    if (natureIcon) {
      const firstWithImg = [...nature.floraItems, ...nature.faunaItems].find(imgOf);
      const img = firstWithImg ? imgOf(firstWithImg) : "";
      if (img) {
        natureIcon.innerHTML = `<img src="${img}" class="pc-person-img" alt="">`;
      } else {
        natureIcon.innerHTML = `
          <div class="pc-round-label">
            <span class="pc-round-emoji">🌿</span>
            <span class="pc-round-count">${count}</span>
          </div>
        `;
      }
    }
  }

  function showNatureItemPopup(item, kind) {
    if (!item) return;

    if (kind === "flora" && typeof window.showFloraPopup === "function") {
      window.showFloraPopup(item);
      return;
    }

    const img = imgOf(item);
    const title = titleOf(item) || (kind === "fauna" ? "Art" : "Plante");
    const latin = latinOf(item);
    const desc = s(item?.desc || item?.description || item?.fenologi?.strategi || item?.observasjonstips?.[0]);

    if (typeof window.showPlaceCardRoundPopup === "function") {
      window.showPlaceCardRoundPopup({
        title,
        subtitle: latin,
        kind: kind || "nature",
        html: `
          <div class="hg-flora-popup hg-fauna-popup">
            ${img ? `<img src="${img}" class="hg-flora-img">` : ""}
            ${desc ? `<p class="hg-popup-desc">${desc}</p>` : `<p class="hg-muted">Ingen beskrivelse ennå.</p>`}
          </div>
        `
      });
    }
  }

  document.addEventListener("click", async (e) => {
    const faunaBtn = e.target.closest("[data-fauna]");
    if (!faunaBtn) return;
    e.preventDefault();
    e.stopPropagation();

    const id = s(faunaBtn.dataset.fauna);
    const bio = await ensureNatureLoaded();
    showNatureItemPopup(bio.faunaById[id], "fauna");
  }, true);

  function patchOpenPlaceCard() {
    if (typeof window.openPlaceCard !== "function") return false;
    if (window.openPlaceCard.__naturePlaceBridgePatched) return true;

    const original = window.openPlaceCard;

    const patched = async function patchedOpenPlaceCard(place) {
      const map = await loadNaturePlaceMap();
      const entry = map && map[s(place?.id)] ? map[s(place?.id)] : null;
      const enrichedPlace = entry
        ? {
            ...place,
            flora: uniq([...(Array.isArray(place?.flora) ? place.flora : []), ...(Array.isArray(entry.flora) ? entry.flora : [])]),
            fauna: uniq([...(Array.isArray(place?.fauna) ? place.fauna : []), ...(Array.isArray(entry.fauna) ? entry.fauna : [])])
          }
        : place;

      const res = await original.call(this, enrichedPlace);
      await applyNatureToPlaceCard(enrichedPlace);
      return res;
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
