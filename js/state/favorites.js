// ============================================================
// FAVORITE PLACES STATE
// Stores place ids only. Rendering resolves ids against window.PLACES.
// ============================================================
(function () {
  const key = "hg_favorite_place_ids_v1";
  let cache = null;

  function normalizeId(id) {
    return String(id ?? "").trim();
  }

  function normalizeIds(ids) {
    const out = [];
    const seen = new Set();
    if (!Array.isArray(ids)) return out;
    ids.forEach((raw) => {
      const id = normalizeId(raw);
      if (!id || seen.has(id)) return;
      seen.add(id);
      out.push(id);
    });
    return out;
  }

  function load() {
    try {
      cache = normalizeIds(JSON.parse(localStorage.getItem(key) || "[]"));
    } catch {
      cache = [];
    }
    return cache.slice();
  }

  function save(ids) {
    cache = normalizeIds(ids);
    try {
      localStorage.setItem(key, JSON.stringify(cache));
    } catch {}
    return cache.slice();
  }

  function getIds() {
    if (!cache) return load();
    return cache.slice();
  }

  function has(placeId) {
    const id = normalizeId(placeId);
    return !!id && getIds().includes(id);
  }

  function add(placeId) {
    const id = normalizeId(placeId);
    if (!id) return getIds();
    const ids = getIds();
    if (!ids.includes(id)) ids.push(id);
    return save(ids);
  }

  function remove(placeId) {
    const id = normalizeId(placeId);
    if (!id) return getIds();
    return save(getIds().filter((candidate) => candidate !== id));
  }

  function toggle(placeId) {
    const id = normalizeId(placeId);
    if (!id) return false;
    if (has(id)) {
      remove(id);
      return false;
    }
    add(id);
    return true;
  }

  function count() {
    return getIds().length;
  }

  window.HGFavoritePlaces = { key, load, save, getIds, has, add, remove, toggle, count };
})();
