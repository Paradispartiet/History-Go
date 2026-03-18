(function () {
  const BRANDS_MASTER_PATH = new URL("data/brands/brands_master.json", document.baseURI).toString();
  const BRANDS_BY_PLACE_PATH = new URL("data/brands/brands_by_place.json", document.baseURI).toString();
  function asString(v) {
    return typeof v === "string" ? v.trim() : "";
  }

  function ensureArray(v) {
    return Array.isArray(v) ? v : [];
  }

  function uniq(arr) {
    return [...new Set(ensureArray(arr).map(asString).filter(Boolean))];
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
      brand_type: asString(raw?.brand_type),
      sector: asString(raw?.sector),
      status: asString(raw?.status),
      state: asString(raw?.state || "borderline"),
      verification: asString(raw?.verification),
      logo: asString(raw?.logo),
      popupdesc: asString(raw?.popupdesc),
      desc: asString(raw?.desc),
      aliases: uniq(raw?.aliases),
      tags: uniq(raw?.tags)
    };
  }

  function filterByState(brands, state) {
    return ensureArray(brands).filter(b => asString(b?.state) === state);
  }

  window.HGBrands = {
    ready: false,

    all: [],
    catalog: [],
    strong: [],
    borderline: [],
    move_to_places: [],

    byId: {},
    byPlace: {},
    placesByBrand: {},

    async init() {
      if (this.ready) return this;

      const rawMaster = await fetchJson(BRANDS_MASTER_PATH);
      const rawByPlace = await fetchJson(BRANDS_BY_PLACE_PATH);

      this.all = ensureArray(rawMaster)
        .map(normalizeBrand)
        .filter(b => b.id && b.name);

      this.catalog = filterByState(this.all, "catalog");
      this.strong = filterByState(this.all, "strong");
      this.borderline = filterByState(this.all, "borderline");
      this.move_to_places = filterByState(this.all, "move_to_places");

      this.byId = {};
      this.byPlace = {};
      this.placesByBrand = {};

      this.all.forEach(brand => {
        this.byId[brand.id] = brand;
      });

      Object.entries(rawByPlace || {}).forEach(([placeId, brandIds]) => {
        const pid = asString(placeId);
        const ids = ensureArray(brandIds).map(asString).filter(Boolean);

        const catalogBrands = ids
          .map(id => this.byId[id])
          .filter(Boolean)
          .filter(brand => brand.state === "catalog");

        this.byPlace[pid] = catalogBrands;

        catalogBrands.forEach(brand => {
          if (!this.placesByBrand[brand.id]) this.placesByBrand[brand.id] = [];
          this.placesByBrand[brand.id].push(pid);
        });
      });

      window.BRANDS_MASTER = this.all;
      window.BRANDS = this.catalog;
      window.BRANDS_BY_PLACE = this.byPlace;

      this.ready = true;
      return this;
    },

    getAll() {
      return this.all;
    },

    getCatalog() {
      return this.catalog;
    },

    getByState(state) {
      const s = asString(state);
      return this.all.filter(b => b.state === s);
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
