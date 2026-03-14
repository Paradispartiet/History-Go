(function () {
  const MANIFEST_PATH = "/data/stories/stories_manifest.json";

  function ensureArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function addToIndex(index, key, story) {
    if (!key) return;
    if (!index[key]) index[key] = [];
    index[key].push(story);
  }

  function isValidStory(story) {
    if (!story || typeof story !== "object") return false;
    if (!story.id || !story.type || !story.title || !story.story) return false;
    if (!Array.isArray(story.sources) || story.sources.length === 0) return false;
    if (!story.place_id && !story.person_id) return false;
    return true;
  }

  function sortStories(list) {
    list.sort((a, b) => {
      const scoreA = a?.score?.total ?? -1;
      const scoreB = b?.score?.total ?? -1;
      if (scoreB !== scoreA) return scoreB - scoreA;

      const yearA = typeof a.year === "number" ? a.year : 999999;
      const yearB = typeof b.year === "number" ? b.year : 999999;
      if (yearA !== yearB) return yearA - yearB;

      return String(a.title || "").localeCompare(String(b.title || ""), "no");
    });
  }

  window.HGStories = {
    ready: false,
    manifest: null,
    all: [],
    byId: {},
    byPlace: {},
    byPerson: {},
    byType: {},
    byTag: {},

    async init() {
      if (this.ready) return this;

      const manifestRes = await fetch(MANIFEST_PATH);
      if (!manifestRes.ok) {
        throw new Error(`Kunne ikke laste stories_manifest.json: ${manifestRes.status}`);
      }

      const manifest = await manifestRes.json();
      const files = ensureArray(manifest.files);
      this.manifest = manifest;

      const loadedStories = [];

      for (const file of files) {
        if (!file?.path) continue;

        try {
          const res = await fetch(file.path);
          if (!res.ok) continue;

          const stories = await res.json();
          if (!Array.isArray(stories)) continue;

          for (const story of stories) {
            if (!isValidStory(story)) continue;
            loadedStories.push(story);
          }
        } catch (err) {
          console.warn("Story load feilet:", file.path, err);
        }
      }

      this.all = loadedStories;

      for (const story of this.all) {
        this.byId[story.id] = story;

        addToIndex(this.byPlace, story.place_id, story);
        addToIndex(this.byPerson, story.person_id, story);
        addToIndex(this.byType, story.type, story);

        for (const tag of ensureArray(story.tags)) {
          addToIndex(this.byTag, tag, story);
        }
      }

      Object.values(this.byPlace).forEach(sortStories);
      Object.values(this.byPerson).forEach(sortStories);
      Object.values(this.byType).forEach(sortStories);
      Object.values(this.byTag).forEach(sortStories);
      sortStories(this.all);

      this.ready = true;
      return this;
    },

    getById(id) {
      return this.byId[id] || null;
    },

    getByPlace(placeId) {
      return this.byPlace[placeId] || [];
    },

    getByPerson(personId) {
      return this.byPerson[personId] || [];
    },

    getByType(type) {
      return this.byType[type] || [];
    },

    getByTag(tag) {
      return this.byTag[tag] || [];
    }
  };
})();
