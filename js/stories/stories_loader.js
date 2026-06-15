(function () {
  const MANIFEST_PATH = "data/stories/stories_manifest.json";
  const EXTRA_MANIFEST_PATHS = [
    "data/stories/stories_manifest_music_batch_01.json",
    "data/stories/stories_manifest_naeringsliv_batch_01.json",
    "data/stories/stories_manifest_by_batch_01.json",
    "data/stories/stories_manifest_sport_batch_01.json",
    "data/stories/stories_manifest_litteratur_media_batch_01.json",
    "data/stories/stories_manifest_vitenskap_batch_01.json",
    "data/stories/stories_manifest_subkultur_batch_01.json",
    "data/stories/stories_manifest_natur_batch_01.json",
    "data/stories/stories_manifest_politikk_batch_01.json",
    "data/stories/stories_manifest_popkultur_film_batch_01.json",
    "data/stories/stories_manifest_kunst_batch_01.json",
    "data/stories/stories_manifest_historie_batch_01.json",
    "data/stories/stories_manifest_lisboa_historie_batch_01.json",
    "data/stories/stories_manifest_litteratur_batch_02.json",
    "data/stories/stories_manifest_musikk_lisboa_batch_01.json",
    "data/stories/stories_manifest_naeringsliv_lisboa_batch_01.json",
    "data/stories/stories_manifest_natur_lisboa_batch_01.json",
    "data/stories/stories_manifest_vitenskap_lisboa_batch_01.json",
    "data/stories/stories_manifest_by_lisboa_batch_01.json",
    "data/stories/stories_manifest_popkultur_lisboa_batch_01.json",
    "data/stories/stories_manifest_sport_lisboa_batch_01.json",
    "data/stories/stories_manifest_politikk_lisboa_batch_02.json",
    "data/stories/stories_manifest_subkultur_lisboa_batch_01.json",
    "data/stories/stories_manifest_litteratur_lisboa_batch_03.json",
    "data/stories/stories_manifest_kunst_lisboa_batch_02.json",
    "data/stories/stories_manifest_kunst_lisboa_batch_03.json",
    "data/stories/stories_manifest_historie_lisboa_batch_02.json",
    "data/stories/stories_manifest_by_lisboa_batch_02.json",
    "data/stories/stories_manifest_by_lisboa_batch_03.json",
    "data/stories/stories_manifest_by_lisboa_batch_04.json",
    "data/stories/stories_manifest_by_lisboa_batch_05.json",
    "data/stories/stories_manifest_historie_lisboa_batch_03.json",
    "data/stories/stories_manifest_historie_lisboa_batch_04.json",
    "data/stories/stories_manifest_natur_lisboa_batch_02.json",
    "data/stories/stories_manifest_vitenskap_lisboa_batch_02.json",
    "data/stories/stories_manifest_naeringsliv_lisboa_batch_02.json",
    "data/stories/stories_manifest_naeringsliv_lisboa_batch_03.json"
  ];

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

  function normalizeNextScenes(nextScenes) {
    return ensureArray(nextScenes)
      .map(scene => {
        if (typeof scene === "string") {
          return { place_id: scene.trim(), reason: "" };
        }
        if (!scene || typeof scene !== "object") return null;
        const placeId = String(scene.place_id ?? scene.target_id ?? scene.id ?? "").trim();
        if (!placeId) return null;
        return {
          place_id: placeId,
          reason: String(scene.reason ?? "").trim()
        };
      })
      .filter(Boolean);
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

  async function loadManifest(path) {
    const manifestRes = await fetch(path);
    if (!manifestRes.ok) {
      throw new Error(`Kunne ikke laste stories manifest ${path}: ${manifestRes.status}`);
    }
    return manifestRes.json();
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

      const manifests = [];
      const mainManifest = await loadManifest(MANIFEST_PATH);
      manifests.push(mainManifest);

      for (const path of EXTRA_MANIFEST_PATHS) {
        try {
          manifests.push(await loadManifest(path));
        } catch (err) {
          console.warn("Ekstra story-manifest feilet:", path, err);
        }
      }

      const files = manifests.flatMap(manifest => ensureArray(manifest.files));
      this.manifest = {
        files,
        sources: [MANIFEST_PATH, ...EXTRA_MANIFEST_PATHS]
      };

      const loadedStories = [];
      const seenStoryIds = new Set();

      for (const file of files) {
        if (!file?.path) continue;

        try {
          const res = await fetch(file.path);
          if (!res.ok) continue;

          const stories = await res.json();
          if (!Array.isArray(stories)) continue;

          for (const story of stories) {
            if (!isValidStory(story)) continue;
            if (seenStoryIds.has(story.id)) continue;
            seenStoryIds.add(story.id);
            story.next_scenes = normalizeNextScenes(story.next_scenes);
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
