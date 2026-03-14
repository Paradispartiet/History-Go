(function () {
  const GENERATION_MANIFEST_PATH = "/data/stories/stories_generation_manifest.json";

  function ensureArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function asString(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function normalizeId(value) {
    return asString(value);
  }

  function lower(value) {
    return asString(value).toLowerCase();
  }

  function uniqueStrings(values) {
    return [...new Set(ensureArray(values).map(asString).filter(Boolean))];
  }

  async function fetchJson(path) {
    const res = await fetch(path);
    if (!res.ok) {
      throw new Error(`Kunne ikke laste ${path}: ${res.status}`);
    }
    return res.json();
  }

  function yearFromText(text) {
    const match = asString(text).match(/\b(1[6-9]\d{2}|20\d{2})\b/);
    return match ? Number(match[0]) : null;
  }

  function stableStoryId(entityId, title) {
    const base = `${entityId}__${lower(title).replace(/[^a-z0-9æøå]+/gi, "_")}`;
    return `st_${base.replace(/^_+|_+$/g, "").slice(0, 80)}`;
  }

  function shortenSummary(text, max = 180) {
    const clean = asString(text);
    if (clean.length <= max) return clean;
    return `${clean.slice(0, max).replace(/\s+\S*$/, "")} …`;
  }

  window.HGStoryGenerator = {
    ready: false,
    manifest: null,
    entityIndex: {
      place: {},
      person: {}
    },

    async init() {
      if (this.ready) return this;

      this.manifest = await fetchJson(GENERATION_MANIFEST_PATH);
      await this.loadEntityIndexes();
      this.ready = true;
      return this;
    },

    async loadEntityIndexes() {
      const targets = ensureArray(this.manifest?.targets);

      const byCategory = {
        place: new Set(),
        person: new Set()
      };

      for (const target of targets) {
        const kind = lower(target?.kind);
        const category = asString(target?.category);
        if (!kind || !category) continue;
        if (kind !== "place" && kind !== "person") continue;
        byCategory[kind].add(category);
      }

      for (const category of byCategory.place) {
        const path = `/data/places/places_${category}.json`;

        try {
          const data = await fetchJson(path);
          const items = Array.isArray(data) ? data : ensureArray(data?.places);

          for (const item of items) {
            const id = normalizeId(item?.id);
            if (!id) continue;

            this.entityIndex.place[id] = {
              ...item,
              category: asString(item?.category) || category,
              kind: "place"
            };
          }
        } catch (err) {
          console.warn(`Kunne ikke laste places-kategori ${category}:`, err);
        }
      }

      for (const category of byCategory.person) {
        const path = `/data/people/people_${category}.json`;

        try {
          const data = await fetchJson(path);
          const items = Array.isArray(data) ? data : ensureArray(data?.people);

          for (const item of items) {
            const id = normalizeId(item?.id);
            if (!id) continue;

            this.entityIndex.person[id] = {
              ...item,
              category: asString(item?.category) || category,
              kind: "person"
            };
          }
        } catch (err) {
          console.warn(`Kunne ikke laste people-kategori ${category}:`, err);
        }
      }
    },

    resolveEntity(target) {
      const kind = lower(target?.kind);
      const id = normalizeId(target?.id);
      if (!id) return null;

      const entity = kind === "place"
        ? this.entityIndex.place[id]
        : this.entityIndex.person[id];

      if (!entity) return null;

      const label =
        asString(entity?.title) ||
        asString(entity?.name) ||
        asString(entity?.label) ||
        id;

      return {
        ...entity,
        id,
        kind,
        label,
        aliases: uniqueStrings(entity?.aliases),
        tags: uniqueStrings(entity?.tags),
        years: ensureArray(entity?.years)
      };
    },

    buildQuerySet(entity) {
      const base = [entity.label, ...uniqueStrings(entity.aliases)];
      const queries = [];

      const personPatterns = [
        "konflikt",
        "anekdote",
        "episode",
        "skandale",
        "drama",
        "brev strid",
        "morsom historie",
        "merkelig historie",
        "rise",
        "fall"
      ];

      const placePatterns = [
        "debatt",
        "konflikt",
        "protest",
        "historisk hendelse",
        "strid",
        "utvikling",
        "skandale",
        "uventet historie",
        "politisk konflikt",
        "transformasjon"
      ];

      const patterns = entity.kind === "person" ? personPatterns : placePatterns;

      for (const name of base) {
        for (const pattern of patterns) {
          queries.push(`${name} ${pattern}`);
        }
      }

      return [...new Set(queries)];
    },

    async collectSourceBlocks(entity, queries) {
      const collector = window.HGStorySourceCollector;
      if (collector?.collectForEntity) {
        return collector.collectForEntity(entity, queries);
      }
      return [];
    },

    extractEpisodes(entity, sourceBlocks) {
      const extractor = window.HGStoryEpisodeExtractor;
      if (extractor?.extract) {
        return extractor.extract(entity, sourceBlocks);
      }
      return [];
    },

    classifyEpisode(entity, episode) {
      const text = lower(`${episode?.episode_text} ${episode?.raw_text}`);

      if (/\b(skandale|avsløring|kontrovers)\b/.test(text)) return "scandal";
      if (/\b(konflikt|strid|debatt|krangel)\b/.test(text)) return "conflict";
      if (/\b(protest|storting|bystyre|politikk|regjering|parti)\b/.test(text)) return "political";
      if (/\b(døde|ulykke|tragisk|selvmord|mord)\b/.test(text)) return "tragedy";
      if (/\b(lo|komisk|morsom|absurd)\b/.test(text)) return "funny";
      if (/\b(rar|merkelig|bisarr|underlig)\b/.test(text)) return "strange";
      if (/\b(gjennombrudd|starten på|vekst|løftet)\b/.test(text)) return "rise";
      if (/\b(fall|kollaps|nedgang|mistet)\b/.test(text)) return "fall";
      if (/\b(vendepunkt|endret|forvandlet|transformasjon)\b/.test(text)) return "turning_point";
      if (/\b(krig|okkupasjon|slaget|sabotasje)\b/.test(text)) return "historical_event";
      if (/\b(kunst|roman|teater|maleri|bok|forestilling)\b/.test(text)) return "cultural";

      return entity.kind === "place" ? "historical_event" : "personal";
    },

    inferTags(entity, episode, type) {
      const tags = new Set([type, entity.category]);

      for (const tag of uniqueStrings(entity.tags)) {
        tags.add(tag);
      }

      const text = lower(`${episode?.episode_text} ${episode?.raw_text}`);
      const vocab = [
        "byutvikling",
        "arkitektur",
        "arbeiderbevegelsen",
        "politikk",
        "kunst",
        "litteratur",
        "krig",
        "fjord",
        "konflikt",
        "skandale",
        "protest",
        "oslo",
        "kristiania"
      ];

      for (const token of vocab) {
        if (text.includes(lower(token))) tags.add(token);
      }

      return [...tags].filter(Boolean);
    },

    inferRelatedPeople(entity, episode) {
      if (entity.kind === "person") return [];
      return [...new Set((episode?.detected_names || []).slice(0, 4))];
    },

    inferRelatedPlaces(entity) {
      return uniqueStrings(entity?.related_places || []);
    },

    buildTitle(entity, episode, type, index) {
      const label = entity.label;

      const titles = {
        political: `Den politiske striden rundt ${label}`,
        conflict: `Konflikten rundt ${label}`,
        scandal: `Skandalen knyttet til ${label}`,
        tragedy: `Den tragiske historien om ${label}`,
        funny: `Den merkelige episoden rundt ${label}`,
        strange: `Den rare historien om ${label}`,
        rise: `${label} på vei opp`,
        fall: `${label} i nedgang`,
        turning_point: `Vendepunktet for ${label}`,
        cultural: `Det kulturelle øyeblikket rundt ${label}`,
        historical_event: `Den historiske hendelsen ved ${label}`,
        personal: `En personlig historie om ${label}`
      };

      return titles[type] || `Historie ${index} om ${label}`;
    },

    buildStory(entity, episode, index = 1) {
      const type = this.classifyEpisode(entity, episode);
      const summary = shortenSummary(episode?.summary_hint || episode?.episode_text || episode?.raw_text);
      const title = this.buildTitle(entity, episode, type, index);
      const id = stableStoryId(entity.id, title);

      return {
        id,
        type,
        title,
        year: episode?.year ?? yearFromText(episode?.episode_text) ?? null,
        place_id: entity.kind === "place" ? entity.id : null,
        person_id: entity.kind === "person" ? entity.id : null,
        summary,
        story: asString(episode?.episode_text || episode?.raw_text),
        sources: uniqueStrings([episode?.source]),
        tags: this.inferTags(entity, episode, type),
        related_people: this.inferRelatedPeople(entity, episode),
        related_places: this.inferRelatedPlaces(entity),
        score: {
          narrative: 0,
          historical: 0,
          source: 0,
          play_value: 0,
          originality: 0,
          total: 0
        }
      };
    },

    scoreStory(story) {
      const scorer = window.HGStoryScoring;
      if (scorer?.scoreStory) {
        return scorer.scoreStory(story);
      }
      return story;
    },

    dedupeStories(stories) {
      const deduper = window.HGStoryDedupe;
      if (deduper?.dedupeStories) {
        return deduper.dedupeStories(stories);
      }
      return stories;
    },

    sortStories(stories) {
      return [...stories].sort((a, b) => {
        const scoreA = a?.score?.total ?? -1;
        const scoreB = b?.score?.total ?? -1;
        if (scoreB !== scoreA) return scoreB - scoreA;

        const yearA = typeof a?.year === "number" ? a.year : 999999;
        const yearB = typeof b?.year === "number" ? b.year : 999999;
        if (yearA !== yearB) return yearA - yearB;

        return asString(a?.title).localeCompare(asString(b?.title), "no");
      });
    },

    async generateForTarget(target) {
      await this.init();

      const entity = this.resolveEntity(target);
      if (!entity) {
        return {
          target,
          entity: null,
          stories: [],
          error: "Fant ikke entiteten i kildedataene"
        };
      }

      const querySet = this.buildQuerySet(entity);
      const sourceBlocks = await this.collectSourceBlocks(entity, querySet);
      const episodes = this.extractEpisodes(entity, sourceBlocks);

      let stories = episodes.map((episode, index) => this.buildStory(entity, episode, index + 1));
      stories = stories.map(story => this.scoreStory(story));
      stories = stories.filter(story => (story?.score?.total ?? 0) >= 12);
      stories = this.dedupeStories(stories);
      stories = this.sortStories(stories);

      const wanted = Number(target?.target_story_count) || stories.length;
      stories = stories.slice(0, wanted);

      return {
        target,
        entity,
        queries: querySet,
        source_blocks: sourceBlocks,
        episodes,
        stories
      };
    },

    async generateAll() {
      await this.init();

      const targets = ensureArray(this.manifest?.targets)
        .slice()
        .sort((a, b) => (Number(b?.priority) || 0) - (Number(a?.priority) || 0));

      const results = [];

      for (const target of targets) {
        try {
          const result = await this.generateForTarget(target);
          results.push(result);
        } catch (err) {
          results.push({
            target,
            entity: null,
            stories: [],
            error: String(err?.message || err)
          });
        }
      }

      return results;
    },

    async buildReadyJsonMap() {
      const results = await this.generateAll();
      const out = {};

      for (const result of results) {
        const entity = result?.entity;
        if (!entity) continue;

        const category = asString(entity.category);
        const id = normalizeId(entity.id);
        if (!category || !id) continue;

        const path = `/data/stories/${category}/stories_${id}.json`;
        out[path] = ensureArray(result.stories);
      }

      return out;
    }
  };
})();
