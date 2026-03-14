(function () {
  const GRAPH_MANIFEST_PATH = "/data/graph/graph_manifest.json";

  function ensureArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function asString(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function normalizeId(value) {
    return asString(value);
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

  function extractEntityLabel(obj) {
    return asString(obj?.title) || asString(obj?.name) || asString(obj?.label) || normalizeId(obj?.id);
  }

  function extractEntityTags(obj) {
    return uniqueStrings(obj?.tags);
  }

  function extractEntityCategory(obj, fallback = "") {
    return asString(obj?.category) || fallback;
  }

  function edgeKey(type, from, to) {
    return `${type}__${from}__${to}`;
  }

  function makeNode({ id, type, label, category = "", source_ref = null, tags = [] }) {
    return {
      id: normalizeId(id),
      type: asString(type),
      label: asString(label),
      category: asString(category),
      source_ref: source_ref || null,
      tags: uniqueStrings(tags)
    };
  }

  function makeEdge({ id, type, from, to, weight = 1, evidence = [] }) {
    return {
      id: asString(id),
      type: asString(type),
      from: normalizeId(from),
      to: normalizeId(to),
      weight: typeof weight === "number" ? weight : 1,
      evidence: uniqueStrings(evidence)
    };
  }

  function addEvidence(edge, evidence) {
    edge.evidence = uniqueStrings([...(edge.evidence || []), ...ensureArray(evidence)]);
  }

  window.HGGraphBuilder = {
    async build() {
      const graphManifest = await fetchJson(GRAPH_MANIFEST_PATH);
      const sourcePaths = ensureArray(graphManifest?.sources);
      const sourcePayloads = await this.loadSources(sourcePaths);

      const places = this.collectPlaces(sourcePayloads);
      const people = this.collectPeople(sourcePayloads);
      const storiesManifest = this.findStoriesManifest(sourcePayloads);
      const narratives = this.findNarratives(sourcePayloads);
      const stories = await this.loadStoriesFromManifest(storiesManifest);

      const nodeMap = new Map();
      const edgeMap = new Map();

      this.buildPlaceNodes(places, nodeMap);
      this.buildPersonNodes(people, nodeMap);
      this.buildStoryNodes(stories, nodeMap);
      this.buildNarrativeNodes(narratives, nodeMap);

      this.buildStoryEdges(stories, edgeMap);
      this.buildNarrativeEdges(narratives, edgeMap);
      this.buildDerivedEdges(stories, narratives, edgeMap);

      const nodes = [...nodeMap.values()].sort(this.sortNodes);
      const edges = [...edgeMap.values()].sort(this.sortEdges);

      return { nodes, edges };
    },

    async loadSources(sourcePaths) {
      const payloads = [];

      for (const path of sourcePaths) {
        payloads.push({
          path,
          data: await fetchJson(path)
        });
      }

      return payloads;
    },

    collectPlaces(sourcePayloads) {
      const out = [];

      for (const item of sourcePayloads) {
        if (!item.path.includes("/data/places/")) continue;
        if (Array.isArray(item.data)) {
          out.push(...item.data);
        } else if (Array.isArray(item.data?.places)) {
          out.push(...item.data.places);
        }
      }

      return out.filter(obj => normalizeId(obj?.id));
    },

    collectPeople(sourcePayloads) {
      const out = [];

      for (const item of sourcePayloads) {
        if (!item.path.includes("/data/people/")) continue;
        if (Array.isArray(item.data)) {
          out.push(...item.data);
        } else if (Array.isArray(item.data?.people)) {
          out.push(...item.data.people);
        }
      }

      return out.filter(obj => normalizeId(obj?.id));
    },

    findStoriesManifest(sourcePayloads) {
      const item = sourcePayloads.find(source => source.path.endsWith("/data/stories/stories_manifest.json"));
      if (!item) {
        throw new Error("Fant ikke /data/stories/stories_manifest.json i graph_manifest.json");
      }
      return item.data;
    },

    findNarratives(sourcePayloads) {
      const item = sourcePayloads.find(source => source.path.endsWith("/data/stories/narratives.json"));
      if (!item) return [];
      return ensureArray(item.data?.narratives);
    },

    async loadStoriesFromManifest(storiesManifest) {
      const files = ensureArray(storiesManifest?.files);
      const allStories = [];

      for (const file of files) {
        const path = asString(file?.path);
        if (!path) continue;

        const data = await fetchJson(path);
        const stories = ensureArray(data);

        for (const story of stories) {
          if (!normalizeId(story?.id)) continue;

          allStories.push({
            ...story,
            __file_category: asString(file?.category),
            __file_entity_id: asString(file?.entity_id),
            __file_path: path
          });
        }
      }

      return allStories;
    },

    buildPlaceNodes(places, nodeMap) {
      for (const place of places) {
        const id = normalizeId(place.id);
        if (!id) continue;

        nodeMap.set(id, makeNode({
          id,
          type: "place",
          label: extractEntityLabel(place),
          category: extractEntityCategory(place),
          source_ref: { kind: "place", id },
          tags: extractEntityTags(place)
        }));
      }
    },

    buildPersonNodes(people, nodeMap) {
      for (const person of people) {
        const id = normalizeId(person.id);
        if (!id) continue;

        nodeMap.set(id, makeNode({
          id,
          type: "person",
          label: extractEntityLabel(person),
          category: extractEntityCategory(person),
          source_ref: { kind: "person", id },
          tags: extractEntityTags(person)
        }));
      }
    },

    buildStoryNodes(stories, nodeMap) {
      for (const story of stories) {
        const id = normalizeId(story.id);
        if (!id) continue;

        nodeMap.set(id, makeNode({
          id,
          type: "story",
          label: asString(story.title) || id,
          category: asString(story.type),
          source_ref: { kind: "story", id },
          tags: uniqueStrings(story.tags)
        }));
      }
    },

    buildNarrativeNodes(narratives, nodeMap) {
      for (const narrative of narratives) {
        const id = normalizeId(narrative.id);
        if (!id) continue;

        nodeMap.set(id, makeNode({
          id,
          type: "narrative",
          label: asString(narrative.title) || id,
          category: "narrative",
          source_ref: { kind: "narrative", id },
          tags: uniqueStrings(narrative.tags)
        }));
      }
    },

    addEdge(edgeMap, { type, from, to, weight = 1, evidence = [] }) {
      const safeFrom = normalizeId(from);
      const safeTo = normalizeId(to);
      if (!safeFrom || !safeTo || !type) return;

      const key = edgeKey(type, safeFrom, safeTo);

      if (edgeMap.has(key)) {
        const existing = edgeMap.get(key);
        addEvidence(existing, evidence);
        existing.weight = Math.max(existing.weight || 0, weight);
        return;
      }

      edgeMap.set(key, makeEdge({
        id: key,
        type,
        from: safeFrom,
        to: safeTo,
        weight,
        evidence
      }));
    },

    buildStoryEdges(stories, edgeMap) {
      for (const story of stories) {
        const storyId = normalizeId(story.id);
        const placeId = normalizeId(story.place_id);
        const personId = normalizeId(story.person_id);

        if (placeId) {
          this.addEdge(edgeMap, {
            type: "happened_at",
            from: storyId,
            to: placeId,
            evidence: ["story.place_id"]
          });
        }

        if (personId) {
          this.addEdge(edgeMap, {
            type: "involves",
            from: storyId,
            to: personId,
            evidence: ["story.person_id"]
          });
        }

        for (const relatedPerson of uniqueStrings(story.related_people)) {
          this.addEdge(edgeMap, {
            type: "related_to",
            from: storyId,
            to: relatedPerson,
            weight: 0.8,
            evidence: ["story.related_people"]
          });
        }

        for (const relatedPlace of uniqueStrings(story.related_places)) {
          this.addEdge(edgeMap, {
            type: "related_to",
            from: storyId,
            to: relatedPlace,
            weight: 0.8,
            evidence: ["story.related_places"]
          });
        }
      }
    },

    buildNarrativeEdges(narratives, edgeMap) {
      for (const narrative of narratives) {
        const narrativeId = normalizeId(narrative.id);
        if (!narrativeId) continue;

        for (const placeId of uniqueStrings(narrative.place_ids)) {
          this.addEdge(edgeMap, {
            type: "connected_to",
            from: narrativeId,
            to: placeId,
            evidence: ["narrative.place_ids"]
          });
        }

        for (const storyId of uniqueStrings(narrative.story_ids)) {
          this.addEdge(edgeMap, {
            type: "part_of",
            from: narrativeId,
            to: storyId,
            evidence: ["narrative.story_ids"]
          });

          this.addEdge(edgeMap, {
            type: "belongs_to_narrative",
            from: storyId,
            to: narrativeId,
            evidence: ["narrative.story_ids"]
          });
        }
      }
    },

    buildDerivedEdges(stories, narratives, edgeMap) {
      this.buildDerivedPersonPlaceEdges(stories, edgeMap);
      this.buildDerivedPlacePlaceEdges(stories, edgeMap);
      this.buildDerivedPersonPersonEdges(stories, edgeMap);
      this.buildDerivedNarrativePlaceEdges(narratives, edgeMap);
    },

    buildDerivedPersonPlaceEdges(stories, edgeMap) {
      for (const story of stories) {
        const storyId = normalizeId(story.id);
        const storyPlace = normalizeId(story.place_id);
        const primaryPerson = normalizeId(story.person_id);
        const relatedPeople = uniqueStrings(story.related_people);
        const people = uniqueStrings([primaryPerson, ...relatedPeople]);

        if (!storyPlace || people.length === 0) continue;

        for (const personId of people) {
          this.addEdge(edgeMap, {
            type: "associated_with",
            from: personId,
            to: storyPlace,
            weight: 0.7,
            evidence: [`derived_from_story:${storyId}`]
          });
        }
      }
    },

    buildDerivedPlacePlaceEdges(stories, edgeMap) {
      for (const story of stories) {
        const storyId = normalizeId(story.id);
        const storyPlace = normalizeId(story.place_id);
        const relatedPlaces = uniqueStrings(story.related_places);

        if (!storyPlace || relatedPlaces.length === 0) continue;

        for (const relatedPlaceId of relatedPlaces) {
          this.addEdge(edgeMap, {
            type: "connected_to",
            from: storyPlace,
            to: relatedPlaceId,
            weight: 0.6,
            evidence: [`derived_from_story:${storyId}`]
          });

          this.addEdge(edgeMap, {
            type: "connected_to",
            from: relatedPlaceId,
            to: storyPlace,
            weight: 0.6,
            evidence: [`derived_from_story:${storyId}`]
          });
        }
      }
    },

    buildDerivedPersonPersonEdges(stories, edgeMap) {
      for (const story of stories) {
        const storyId = normalizeId(story.id);
        const primaryPerson = normalizeId(story.person_id);
        const relatedPeople = uniqueStrings(story.related_people);
        const people = uniqueStrings([primaryPerson, ...relatedPeople]);

        if (people.length < 2) continue;

        for (let i = 0; i < people.length; i += 1) {
          for (let j = i + 1; j < people.length; j += 1) {
            const a = people[i];
            const b = people[j];

            this.addEdge(edgeMap, {
              type: "connected_to",
              from: a,
              to: b,
              weight: 0.5,
              evidence: [`derived_from_story:${storyId}`]
            });

            this.addEdge(edgeMap, {
              type: "connected_to",
              from: b,
              to: a,
              weight: 0.5,
              evidence: [`derived_from_story:${storyId}`]
            });
          }
        }
      }
    },

    buildDerivedNarrativePlaceEdges(narratives, edgeMap) {
      for (const narrative of narratives) {
        const places = uniqueStrings(narrative.place_ids);
        const narrativeId = normalizeId(narrative.id);

        if (places.length < 2 || !narrativeId) continue;

        for (let i = 0; i < places.length; i += 1) {
          for (let j = i + 1; j < places.length; j += 1) {
            const a = places[i];
            const b = places[j];

            this.addEdge(edgeMap, {
              type: "connected_to",
              from: a,
              to: b,
              weight: 0.65,
              evidence: [`derived_from_narrative:${narrativeId}`]
            });

            this.addEdge(edgeMap, {
              type: "connected_to",
              from: b,
              to: a,
              weight: 0.65,
              evidence: [`derived_from_narrative:${narrativeId}`]
            });
          }
        }
      }
    },

    sortNodes(a, b) {
      const typeCmp = asString(a.type).localeCompare(asString(b.type), "no");
      if (typeCmp !== 0) return typeCmp;

      const labelCmp = asString(a.label).localeCompare(asString(b.label), "no");
      if (labelCmp !== 0) return labelCmp;

      return asString(a.id).localeCompare(asString(b.id), "no");
    },

    sortEdges(a, b) {
      const typeCmp = asString(a.type).localeCompare(asString(b.type), "no");
      if (typeCmp !== 0) return typeCmp;

      const fromCmp = asString(a.from).localeCompare(asString(b.from), "no");
      if (fromCmp !== 0) return fromCmp;

      const toCmp = asString(a.to).localeCompare(asString(b.to), "no");
      if (toCmp !== 0) return toCmp;

      return asString(a.id).localeCompare(asString(b.id), "no");
    }
  };
})();
