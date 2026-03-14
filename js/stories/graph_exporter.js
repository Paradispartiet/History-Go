(function () {
  function prettyJson(value) {
    return JSON.stringify(value, null, 2);
  }

  function downloadText(filename, text, mime = "application/json") {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  window.HGGraphExporter = {
    async exportBuiltGraph() {
      if (!window.HGGraphBuilder?.build) {
        throw new Error("HGGraphBuilder er ikke lastet");
      }

      const result = await window.HGGraphBuilder.build();
      return {
        nodesText: prettyJson(result.nodes),
        edgesText: prettyJson(result.edges),
        nodes: result.nodes,
        edges: result.edges
      };
    },

    async downloadBuiltGraph() {
      const built = await this.exportBuiltGraph();
      downloadText("graph_nodes.json", built.nodesText);
      downloadText("graph_edges.json", built.edgesText);
      return built;
    }
  };
})();
