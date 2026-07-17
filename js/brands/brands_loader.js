(function () {
  const BRANDS_MASTER_PATH = new URL("data/brands/brands_master.json", document.baseURI).toString();
  const BRANDS_BY_PLACE_PATH = new URL("data/brands/brands_by_place.json", document.baseURI).toString();
  const ACTORS_BY_PLACE_PATH = new URL("data/brands/actors_by_place.json", document.baseURI).toString();

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
      entity_type: asString(raw?.entity_type) || "brand",
      actor_kind: asString(raw?.actor_kind),
      actor_role: asString(raw?.actor_role),
      brand_group: asString(raw?.brand_group),
      brand_kind: asString(raw?.brand_kind) || "brand",
      brand_type: asString(raw?.brand_type),
      sector: asString(raw?.sector),
      status: asString(raw?.status),
      state: asString(raw?.state || "borderline"),
      verification: asString(raw?.verification),
      verified_at: asString(raw?.verified_at),
      logo: asString(raw?.logo),
      popupdesc: asString(raw?.popupdesc),
      desc: asString(raw?.desc),
      aliases: uniq(raw?.aliases),
      tags: uniq(raw?.tags),
      source_urls: uniq(raw?.source_urls)
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

      const [rawMaster, rawByPlace, rawActorsByPlace] = await Promise.all([
        fetchJson(BRANDS_MASTER_PATH),
        fetchJson(BRANDS_BY_PLACE_PATH),
        fetchJson(ACTORS_BY_PLACE_PATH)
      ]);

      const normalizedMaster = ensureArray(rawMaster)
        .map(normalizeBrand)
        .filter(item => item.id && item.name);

      const normalizedActors = Object.values(rawActorsByPlace || {})
        .flatMap(ensureArray)
        .map(normalizeBrand)
        .filter(item => item.id && item.name);

      const allById = new Map();
      [...normalizedMaster, ...normalizedActors].forEach(item => {
        if (!allById.has(item.id)) allById.set(item.id, item);
      });
      this.all = [...allById.values()];

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

      const addToPlace = (placeId, items) => {
        const pid = asString(placeId);
        if (!pid) return;

        const existing = ensureArray(this.byPlace[pid]);
        const seen = new Set(existing.map(item => asString(item?.id)).filter(Boolean));
        const additions = ensureArray(items)
          .filter(Boolean)
          .filter(item => item.state === "catalog")
          .filter(item => {
            if (!item.id || seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
          });

        this.byPlace[pid] = [...existing, ...additions];

        additions.forEach(item => {
          if (!this.placesByBrand[item.id]) this.placesByBrand[item.id] = [];
          if (!this.placesByBrand[item.id].includes(pid)) {
            this.placesByBrand[item.id].push(pid);
          }
        });
      };

      Object.entries(rawByPlace || {}).forEach(([placeId, brandIds]) => {
        const brands = ensureArray(brandIds)
          .map(asString)
          .filter(Boolean)
          .map(id => this.byId[id])
          .filter(Boolean);
        addToPlace(placeId, brands);
      });

      Object.entries(rawActorsByPlace || {}).forEach(([placeId, actorItems]) => {
        const actors = ensureArray(actorItems)
          .map(item => this.byId[asString(item?.id)])
          .filter(Boolean);
        addToPlace(placeId, actors);
      });

      window.BRANDS_MASTER = this.all;
      window.BRANDS = this.catalog;
      window.BRANDS_BY_PLACE = this.byPlace;
      window.ACTORS_BY_PLACE = rawActorsByPlace || {};

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
