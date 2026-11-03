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
    "data/stories/stories_manifest_naeringsliv_lisboa_batch_03.json",
    "data/stories/stories_manifest_litteratur_lisboa_batch_04.json",
    "data/stories/stories_manifest_popkultur_lisboa_batch_02.json",
    "data/stories/stories_manifest_musikk_lisboa_batch_02.json",
    "data/stories/stories_manifest_lisboa_alt_batch_01.json",
    "data/stories/stories_manifest_sport_lisboa_batch_02.json",
    "data/stories/stories_manifest_sport_lisboa_batch_03.json",
    "data/stories/stories_manifest_vitenskap_lisboa_batch_03.json",
    "data/stories/stories_manifest_natur_lisboa_batch_03.json",
    "data/stories/stories_manifest_by_lisboa_batch_06.json",
    "data/stories/stories_manifest_media_lisboa_batch_01.json",
    "data/stories/stories_manifest_film_tv_lisboa_batch_01.json",
    "data/stories/stories_manifest_by_lisboa_batch_07.json",
    "data/stories/stories_manifest_naeringsliv_lisboa_batch_04.json",
    "data/stories/stories_manifest_naeringsliv_lisboa_batch_05.json"
  ];

  function ensureArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function storySourceLabel(source) {
    if (typeof source === "string") return source;
    if (!source || typeof source !== "object") return "";
    return String(source.title || source.url || source.id || "").trim();
  }

  function renderStoryFallback(stories) {
    if (!stories.length) return `<div class="hg-no-stories">Ingen historier ennå</div>`;

    return stories.map(story => {
      const source = storySourceLabel(ensureArray(story.sources)[0]);
      const year = story.year ? `<div class="hg-story-year">${escapeHtml(story.year)}</div>` : "";
      return `
        <article class="hg-story-card">
          <div class="hg-story-header">
            <div class="hg-story-type">${escapeHtml(story.type || "story")}</div>
            ${year}
          </div>
          <div class="hg-story-title">${escapeHtml(story.title || "Fortelling")}</div>
          <div class="hg-story-text">${escapeHtml(story.story || story.summary || "")}</div>
          ${source ? `<div class="hg-story-source">${escapeHtml(source)}</div>` : ""}
        </article>
      `;
    }).join("");
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

  function resolvePlaceById(placeId) {
    const id = String(placeId || "").trim();
    if (!id) return null;
    return (Array.isArray(window.PLACES) ? window.PLACES : [])
      .find(place => String(place?.id || "").trim() === id) || null;
  }

  window.HGStories = {
    ready: false,
    initPromise: null,
    manifest: null,
    all: [],
    byId: {},
    byPlace: {},
    byPerson: {},
    byType: {},
    byTag: {},

    init() {
      if (this.ready) return Promise.resolve(this);
      if (this.initPromise) return this.initPromise;

      const inFlight = (async () => {

      const loadedStories = [];
      const seenStoryIds = new Set();
      const addStories = stories => {
        for (const story of ensureArray(stories)) {
          if (!isValidStory(story) || seenStoryIds.has(story.id)) continue;
          seenStoryIds.add(story.id);
          story.next_scenes = normalizeNextScenes(story.next_scenes);
          loadedStories.push(story);
        }
      };

      let aggregateLoaded = false;
      try {
        const aggregateResponse = await fetch("data/runtime/stories-all.json", { cache: "force-cache" });
        if (aggregateResponse.ok) {
          const aggregate = await aggregateResponse.json();
          if (aggregate?.schema === "history-go-runtime-shards-v1") {
            const shards = await Promise.all(ensureArray(aggregate.files).map(async path => {
              const response = await fetch(path, { cache: "force-cache" });
              return response.ok ? response.json() : [];
            }));
            shards.forEach(addStories);
          } else {
            addStories(aggregate);
          }
          aggregateLoaded = loadedStories.length > 0;
          this.manifest = { files: ensureArray(aggregate?.files).map(path => ({ path })), sources: ["data/runtime/stories-all.json"] };
        }
      } catch {}

      if (!aggregateLoaded) {
        const manifests = [];
        const mainManifest = await loadManifest(MANIFEST_PATH);
        manifests.push(mainManifest);
        for (const path of EXTRA_MANIFEST_PATHS) {
          try { manifests.push(await loadManifest(path)); }
          catch (err) { console.warn("Ekstra story-manifest feilet:", path, err); }
        }
        const files = manifests.flatMap(manifest => ensureArray(manifest.files));
        this.manifest = { files, sources: [MANIFEST_PATH, ...EXTRA_MANIFEST_PATHS] };
        for (const file of files) {
          if (!file?.path) continue;
          try {
            const res = await fetch(file.path);
            if (res.ok) addStories(await res.json());
          } catch (err) {
            console.warn("Story load feilet:", file.path, err);
          }
        }
      }

      // Place-open can seed stories while the background aggregate is loading.
      // Keep payload-only stories and rebuild indexes from the deduplicated list.
      addStories(this.all);
      this.all = loadedStories;
      this.byId = {};
      this.byPlace = {};
      this.byPerson = {};
      this.byType = {};
      this.byTag = {};

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
      })();

      this.initPromise = inFlight;
      inFlight.catch(() => {
        if (this.initPromise === inFlight) this.initPromise = null;
      });
      return inFlight;
    },

    async openAll() {
      await this.init();
      const popupFn = window.makePopup;
      if (typeof popupFn !== "function") {
        window.showToast?.("Stories-visningen er ikke lastet ennå.");
        return false;
      }

      const stories = this.all;
      const renderMatches = (term) => {
        const query = String(term || "").trim().toLocaleLowerCase("nb-NO");
        const matches = query
          ? stories.filter((story) => [story.title, story.type, story.story, story.summary]
              .some(value => String(value || "").toLocaleLowerCase("nb-NO").includes(query)))
          : stories;
        const rows = matches.slice(0, 30).map((story) => {
          const placeId = String(story.place_id || "").trim();
          const place = placeId ? resolvePlaceById(placeId) : null;
          const locationLabel = place?.name || placeId;
          const excerpt = String(story.story || story.summary || "").slice(0, 240);
          return `
            <article class="hg-welcome-story-item">
              <div class="hg-welcome-story-label">${escapeHtml(story.type || "Historie")}</div>
              <h3>${escapeHtml(story.title || "Fortelling")}</h3>
              <p>${escapeHtml(excerpt)}${String(story.story || story.summary || "").length > 240 ? "…" : ""}</p>
              ${placeId ? `<a href="index.html#/place/${encodeURIComponent(placeId)}">Se stedet: ${escapeHtml(locationLabel)} ↗</a>` : ""}
            </article>`;
        }).join("");
        return `
          <p class="hg-welcome-story-count">${matches.length} ${matches.length === 1 ? "fortelling" : "fortellinger"} funnet${matches.length > 30 ? " · viser de første 30, søk for flere" : ""}</p>
          <div class="hg-welcome-story-results">${rows || '<p>Ingen fortellinger passer søket.</p>'}</div>`;
      };

      popupFn(`
        <section class="hg-welcome-stories" aria-label="Stories">
          <header class="hg-welcome-stories-header">
            <button class="hg-welcome-stories-back" type="button" data-close-popup
                    aria-label="Tilbake til kartet" title="Tilbake til kartet">
              <span aria-hidden="true">←</span>
            </button>
            <h2>Stories</h2>
          </header>
          <p>Oppdag historiske fortellinger og utforsk stedene de handler om.</p>
          <label for="hgWelcomeStoriesSearch">Søk etter en fortelling</label>
          <input id="hgWelcomeStoriesSearch" type="search" autocomplete="off"
                 placeholder="Søk på tittel, tema eller innhold">
          <div id="hgWelcomeStoriesMatches" aria-live="polite">${renderMatches("")}</div>
        </section>`, "hg-welcome-stories-popup");

      const input = /** @type {HTMLInputElement | null} */ (document.getElementById("hgWelcomeStoriesSearch"));
      const results = document.getElementById("hgWelcomeStoriesMatches");
      input?.addEventListener("input", () => {
        if (results) results.innerHTML = renderMatches(input.value);
      });
      return true;
    },

    async openPlace(placeId) {
      const id = String(placeId || "").trim();
      if (!id) return;

      await this.init();
      const place = resolvePlaceById(id);
      const stories = this.getByPlace(id);

      // History Go read-signal: å åpne stedets fortellinger teller som read_story.
      // Civication-broen matcher hg_reads_v1.stories på placeId.
      try {
        (stories || []).forEach(function (st) {
          window.HGReads?.recordStory?.({ storyId: st && st.id, placeId: id });
        });
      } catch {}

      const container = document.createElement("div");
      container.className = "hg-story-popup-content";

      if (window.HGStoryUI && typeof window.HGStoryUI.renderPlaceStories === "function") {
        window.HGStoryUI.renderPlaceStories(id, container);
      } else {
        container.innerHTML = renderStoryFallback(stories);
      }

      if (typeof window.showPlaceCardRoundPopup === "function") {
        window.showPlaceCardRoundPopup({
          title: "Fortellinger",
          subtitle: place?.name || id,
          html: container.innerHTML,
          place,
          kind: "fortellinger"
        });
      }
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
