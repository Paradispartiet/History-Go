(function () {
  const BRANDS_PATH = new URL("data/brands/brands.json", document.baseURI).toString();
  const BRANDS_BY_PLACE_PATH = new URL("data/brands/brands_by_place.json", document.baseURI).toString();

  function asString(v) {
    return typeof v === "string" ? v.trim() : "";
  }

  function ensureArray(v) {
    return Array.isArray(v) ? v : [];
  }

  async function fetchJson(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Kunne ikke laste ${url}: ${res.status}`);
    }
    return res.json();
  }

  function normalizeBrand(raw) {
    return {
      id: asString(raw?.id),
      name: asString(raw?.name),
      popupdesc: asString(raw?.popupdesc),
      desc: asString(raw?.desc),
      type: asString(raw?.type),
      image: asString(raw?.image),
      tags: ensureArray(raw?.tags).map(asString).filter(Boolean)
    };
  }

  window.HGBrands = {
    ready: false,
    all: [],
    byId: {},
    byPlace: {},
    placesByBrand: {},

    async init() {
      if (this.ready) return this;

      const rawBrands = await fetchJson(BRANDS_PATH);
      const rawByPlace = await fetchJson(BRANDS_BY_PLACE_PATH);

      this.all = ensureArray(rawBrands)
        .map(normalizeBrand)
        .filter(b => b.id && b.name);

      this.byId = {};
      this.byPlace = {};
      this.placesByBrand = {};

      this.all.forEach(brand => {
        this.byId[brand.id] = brand;
      });

      Object.entries(rawByPlace || {}).forEach(([placeId, brandIds]) => {
        const pid = asString(placeId);
        const ids = ensureArray(brandIds).map(asString).filter(Boolean);

        this.byPlace[pid] = ids
          .map(id => this.byId[id])
          .filter(Boolean);

        ids.forEach(id => {
          if (!this.placesByBrand[id]) this.placesByBrand[id] = [];
          this.placesByBrand[id].push(pid);
        });
      });

      window.BRANDS = this.all;
      window.BRANDS_BY_PLACE = this.byPlace;

      this.ready = true;
      return this;
    },

    getById(id) {
      return this.byId[asString(id)] || null;
    },

    getByPlace(placeId) {
      return this.byPlace[asString(placeId)] || [];
    },

    getPlacesForBrand(id) {
      const bid = asString(id);
      const ids = this.placesByBrand[bid] || [];
      const places = Array.isArray(window.PLACES) ? window.PLACES : [];
      return ids
        .map(pid => places.find(p => asString(p?.id) === pid))
        .filter(Boolean);
    }
  };
})();
