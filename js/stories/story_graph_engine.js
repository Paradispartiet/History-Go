(function () {
  function ensureArray(v) {
    return Array.isArray(v) ? v : [];
  }

  function asString(v) {
    return typeof v === "string" ? v.trim() : "";
  }

  function normalizeId(id) {
    return asString(id).toLowerCase();
  }

  function createNode(id, type, label) {
    return { id, type, label };
  }

  function createEdge(from, to, type) {
    return { from, to, type };
  }

  function addNode(graph, node) {
    if (!graph.nodes[node.id]) {
      graph.nodes[node.id] = node;
    }
  }

  function addEdge(graph, edge) {
    graph.edges.push(edge);
  }

  function storyNodeId(story) {
    return `story_${story.id}`;
  }

  function personNodeId(person) {
    return `person_${normalizeId(person)}`;
  }

  function placeNodeId(place) {
    return `place_${normalizeId(place)}`;
  }

  function tagNodeId(tag) {
    return `tag_${normalizeId(tag)}`;
  }

  window.HGStoryGraphEngine = {
    buildGraph(stories) {
      const graph = {
        nodes: {},
        edges: []
      };

      for (const story of ensureArray(stories)) {
        const storyId = storyNodeId(story);
        addNode(graph, createNode(storyId, "story", story.title));

        if (story.place_id) {
          const placeId = placeNodeId(story.place_id);
          addNode(graph, createNode(placeId, "place", story.place_id));
          addEdge(graph, createEdge(storyId, placeId, "happened_at"));
        }

        if (story.person_id) {
          const personId = personNodeId(story.person_id);
          addNode(graph, createNode(personId, "person", story.person_id));
          addEdge(graph, createEdge(storyId, personId, "involves"));
        }

        for (const person of ensureArray(story.related_people)) {
          const personId = personNodeId(person);
          addNode(graph, createNode(personId, "person", person));
          addEdge(graph, createEdge(storyId, personId, "related_to"));
        }

        for (const place of ensureArray(story.related_places)) {
          const placeId = placeNodeId(place);
          addNode(graph, createNode(placeId, "place", place));
          addEdge(graph, createEdge(storyId, placeId, "related_to"));
        }

        for (const tag of ensureArray(story.tags)) {
          const tagId = tagNodeId(tag);
          addNode(graph, createNode(tagId, "tag", tag));
          addEdge(graph, createEdge(storyId, tagId, "tagged"));
        }
      }

      return graph;
    },

    findConnectedStories(graph, nodeId) {
      const stories = [];

      for (const edge of graph.edges) {
        if (edge.to === nodeId && edge.from.startsWith("story_")) {
          stories.push(edge.from);
        }
      }

      return stories;
    },

    findRelatedPlaces(graph, storyId) {
      const places = [];

      for (const edge of graph.edges) {
        if (edge.from === storyId && edge.type === "happened_at") {
          places.push(edge.to);
        }
      }

      return places;
    }
  };
})();
