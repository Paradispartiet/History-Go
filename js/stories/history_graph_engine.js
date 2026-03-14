(function () {
  const NODES_PATH = "/data/graph/graph_nodes.json";
  const EDGES_PATH = "/data/graph/graph_edges.json";

  function ensureArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function addToIndex(index, key, value) {
    if (!key) return;
    if (!index[key]) index[key] = [];
    index[key].push(value);
  }

  function isValidNode(node) {
    return !!(node && typeof node === "object" && node.id && node.type && node.label);
  }

  function isValidEdge(edge) {
    return !!(edge && typeof edge === "object" && edge.id && edge.type && edge.from && edge.to);
  }

  window.HGGraph = {
    ready: false,
    nodes: [],
    edges: [],
    byId: {},
    byType: {},
    outgoing: {},
    incoming: {},
    byLabel: {},

    async init() {
      if (this.ready) return this;

      const [nodesRes, edgesRes] = await Promise.all([
        fetch(NODES_PATH),
        fetch(EDGES_PATH)
      ]);

      if (!nodesRes.ok) {
        throw new Error(`Kunne ikke laste graph_nodes.json: ${nodesRes.status}`);
      }

      if (!edgesRes.ok) {
        throw new Error(`Kunne ikke laste graph_edges.json: ${edgesRes.status}`);
      }

      const rawNodes = await nodesRes.json();
      const rawEdges = await edgesRes.json();

      this.nodes = ensureArray(rawNodes).filter(isValidNode);
      this.edges = ensureArray(rawEdges).filter(isValidEdge);

      this.buildIndexes();
      this.ready = true;
      return this;
    },

    buildIndexes() {
      this.byId = {};
      this.byType = {};
      this.outgoing = {};
      this.incoming = {};
      this.byLabel = {};

      for (const node of this.nodes) {
        this.byId[node.id] = node;
        addToIndex(this.byType, node.type, node);
        addToIndex(this.byLabel, String(node.label).toLowerCase(), node);
      }

      for (const edge of this.edges) {
        addToIndex(this.outgoing, edge.from, edge);
        addToIndex(this.incoming, edge.to, edge);
      }
    },

    getNode(id) {
      return this.byId[id] || null;
    },

    getNodesByType(type) {
      return this.byType[type] || [];
    },

    getOutgoing(id, edgeType = null) {
      const edges = this.outgoing[id] || [];
      if (!edgeType) return edges;
      return edges.filter(edge => edge.type === edgeType);
    },

    getIncoming(id, edgeType = null) {
      const edges = this.incoming[id] || [];
      if (!edgeType) return edges;
      return edges.filter(edge => edge.type === edgeType);
    },

    getConnectedNodes(id, edgeType = null, direction = "outgoing") {
      const edges =
        direction === "incoming"
          ? this.getIncoming(id, edgeType)
          : this.getOutgoing(id, edgeType);

      return edges
        .map(edge => {
          const targetId = direction === "incoming" ? edge.from : edge.to;
          return this.getNode(targetId);
        })
        .filter(Boolean);
    },

    findByLabel(label) {
      if (!label) return [];
      return this.byLabel[String(label).toLowerCase()] || [];
    }
  };
})();
