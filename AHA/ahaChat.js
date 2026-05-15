(function (global) {
  "use strict";

  const MAX_CONCEPTS = 5;
  const MAX_LINKS = 8;

  function getEntries(obj) {
    if (!obj || typeof obj !== "object") return [];
    return Object.entries(obj);
  }

  function normalizeGraphData(graphData) {
    if (!graphData || typeof graphData !== "object") return { concepts: [], links: [] };

    const conceptWeights = getEntries(graphData.concepts || graphData.concept_counts || graphData.nodes || {})
      .map(([name, value]) => [String(name), Number(value) || 0])
      .filter(([name]) => name.trim().length > 0)
      .sort((a, b) => b[1] - a[1]);

    const topConcepts = conceptWeights.slice(0, MAX_CONCEPTS).map(([name]) => name);
    const conceptSet = new Set(topConcepts);

    let candidatePairs = Array.isArray(graphData.strongest_pairs) ? graphData.strongest_pairs : [];
    if (!candidatePairs.length && Array.isArray(graphData.co_occurs)) {
      candidatePairs = graphData.co_occurs;
    }

    const links = candidatePairs
      .map((pair) => {
        if (Array.isArray(pair) && pair.length >= 2) {
          return {
            a: String(pair[0] || "").trim(),
            b: String(pair[1] || "").trim(),
            weight: Number(pair[2] || pair.weight || 0) || 0
          };
        }

        if (pair && typeof pair === "object") {
          const a = String(pair.a || pair.from || pair.source || pair.concept_a || "").trim();
          const b = String(pair.b || pair.to || pair.target || pair.concept_b || "").trim();
          const weight = Number(pair.weight || pair.score || pair.count || 0) || 0;
          return { a, b, weight };
        }

        return { a: "", b: "", weight: 0 };
      })
      .filter((link) => link.a && link.b && link.a !== link.b)
      .filter((link) => conceptSet.has(link.a) || conceptSet.has(link.b))
      .sort((x, y) => y.weight - x.weight)
      .slice(0, MAX_LINKS);

    return { concepts: topConcepts, links };
  }

  function renderConceptNetwork(graphData) {
    const normalized = normalizeGraphData(graphData);
    const hasEnoughData = normalized.concepts.length >= 2 && normalized.links.length >= 1;

    if (!hasEnoughData) {
      return '<div class="concept-network-empty">For få koblinger til å bygge nettverk ennå.</div>';
    }

    const rows = normalized.links.map((link) => {
      return [
        '<div class="concept-network-link">',
        `<span class="concept-node">${link.a}</span>`,
        '<span class="concept-network-line" aria-hidden="true"></span>',
        `<span class="concept-node">${link.b}</span>`,
        "</div>"
      ].join("");
    }).join("");

    return [
      '<section class="concept-network" aria-label="Begrepsnettverk">',
      '<h4 class="concept-network-title">Begrepsnettverk</h4>',
      '<div class="concept-network-links">',
      rows,
      "</div>",
      "</section>"
    ].join("");
  }

  global.renderConceptNetwork = renderConceptNetwork;
})(typeof window !== "undefined" ? window : globalThis);
