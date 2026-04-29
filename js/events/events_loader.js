// Early support loader: HGNavigator + NextUpRuntime must exist before place cards emit NextUp.
(function () {
  "use strict";

  if (!document.querySelector('script[src="js/hgNavigator.js"]')) {
    document.write('<script src="js/hgNavigator.js"><\/script>');
  }

  if (!document.querySelector('script[src="js/nextUpRuntime.js"]')) {
    document.write('<script src="js/nextUpRuntime.js"><\/script>');
  }
})();

(function () {
  const EVENTS_MANIFEST_PATH = "data/events/events_manifest.json";

  function ensureArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function asString(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function normalizeId(value) {
    return asString(value);
  }

  function addToIndex(index, key, item) {
    const safeKey = asString(key);
    if (!safeKey) return;
    if (!index[safeKey]) index[safeKey] = [];
    index[safeKey].push(item);
  }

  function parseDateValue(value) {
    const raw = asString(value);
    if (!raw) return null;
    const ms = Date.parse(raw);
    return Number.isNaN(ms) ? null : ms;
  }

  function isValidStatus(status) {
    return ["upcoming", "ongoing", "past", "cancelled"].includes(asString(status));
  }

  function normalizeStatus(status) {
    return isValidStatus(status) ? asString(status) : "upcoming";
  }

  function isValidEvent(evt) {
    if (!evt || typeof evt !== "object") return false;
    if (!normalizeId(evt.id)) return false;
    if (!normalizeId(evt.place_id)) return false;
    if (!asString(evt.title)) return false;
    if (!asString(evt.start)) return false;
    return true;
  }

  function normalizeEvent(evt, fileMeta = {}) {
    return {
      id: normalizeId(evt.id),
      place_id: normalizeId(evt.place_id),
      title: asString(evt.title),
      start: asString(evt.start),
      end: asString(evt.end),
      status: normalizeStatus(evt.status),
      source: asString(evt.source),
      source_url: asString(evt.source_url),
      organizer: asString(evt.organizer),
      category: asString(evt.category),
      description: asString(evt.description),
      tags: ensureArray(evt.tags).map(asString).filter(Boolean),
      __file_category: asString(fileMeta.category),
      __file_entity_id: asString(fileMeta.entity_id),
      __file_path: asString(fileMeta.path)
    };
  }

  function sortEvents(list) {
    list.sort((a, b) => {
      const aStart = parseDateValue(a.start);
      const bStart = parseDateValue(b.start);

      if (aStart == null && bStart == null) {
        return a.title.localeCompare(b.title, "no");
      }
      if (aStart == null) return 1;
      if (bStart == null) return -1;
      if (aStart !== bStart) return aStart - bStart;

      return a.title.localeCompare(b.title, "no");
    });
  }

  function eventIsUpcoming(evt, nowMs = Date.now()) {
    const startMs = parseDateValue(evt.start);
    const endMs = parseDateValue(evt.end);

    if (evt.status === "cancelled") return false;
    if (evt.status === "ongoing") return true;
    if (evt.status === "upcoming") return true;
    if (evt.status === "past") return false;

    if (startMs == null) return false;
    if (endMs != null) return endMs >= nowMs;
    return startMs >= nowMs;
  }

  function eventIsPast(evt, nowMs = Date.now()) {
    const startMs = parseDateValue(evt.start);
    const endMs = parseDateValue(evt.end);

    if (evt.status === "past") return true;
    if (evt.status === "cancelled") return false;
    if (evt.status === "upcoming") return false;
    if (evt.status === "ongoing") return false;

    if (endMs != null) return endMs < nowMs;
    if (startMs != null) return startMs < nowMs;
    return false;
  }

  async function fetchJson(path) {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Kunne ikke laste ${path}: ${res.status}`);
    }
    return res.json();
  }

  window.HGEvents = {
    ready: false,
    manifest: null,
    all: [],
    byId: {},
    byPlace: {},
    byStatus: {},
    byTag: {},

    async init() {
      if (this.ready) return this;

      const manifest = await fetchJson(EVENTS_MANIFEST_PATH);
      const files = ensureArray(manifest?.files);

      this.manifest = manifest;

      const loaded = [];

      for (const file of files) {
        const path = asString(file?.path);
        if (!path) continue;

        try {
          const data = await fetchJson(path);
          const arr = ensureArray(data);

          for (const evt of arr) {
            if (!isValidEvent(evt)) continue;
            loaded.push(normalizeEvent(evt, file));
          }
        } catch (err) {
          console.warn("[HGEvents] load failed:", path, err);
        }
      }

      this.all = loaded;
      this.byId = {};
      this.byPlace = {};
      this.byStatus = {};
      this.byTag = {};

      for (const evt of this.all) {
        this.byId[evt.id] = evt;
        addToIndex(this.byPlace, evt.place_id, evt);
        addToIndex(this.byStatus, evt.status, evt);

        for (const tag of evt.tags) {
          addToIndex(this.byTag, tag, evt);
        }
      }

      sortEvents(this.all);
      Object.values(this.byPlace).forEach(sortEvents);
      Object.values(this.byStatus).forEach(sortEvents);
      Object.values(this.byTag).forEach(sortEvents);

      this.ready = true;
      return this;
    },

    async refresh() {
      this.ready = false;
      this.manifest = null;
      this.all = [];
      this.byId = {};
      this.byPlace = {};
      this.byStatus = {};
      this.byTag = {};
      return this.init();
    },

    getAll() {
      return this.all || [];
    },

    getById(id) {
      return this.byId[normalizeId(id)] || null;
    },

    getByPlace(placeId) {
      return this.byPlace[normalizeId(placeId)] || [];
    },

    getByStatus(status) {
      return this.byStatus[asString(status)] || [];
    },

    getByTag(tag) {
      return this.byTag[asString(tag)] || [];
    },

    getUpcomingByPlace(placeId) {
      const nowMs = Date.now();
      return this.getByPlace(placeId).filter(evt => eventIsUpcoming(evt, nowMs));
    },

    getPastByPlace(placeId) {
      const nowMs = Date.now();
      return this.getByPlace(placeId).filter(evt => eventIsPast(evt, nowMs));
    },

    getOngoingByPlace(placeId) {
      return this.getByPlace(placeId).filter(evt => evt.status === "ongoing");
    }
  };
})();
