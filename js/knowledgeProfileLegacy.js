// Detailed Knowledge profile preserved from the pre-V2 Knowledge surface.
// This page intentionally reads the legacy knowledge_universe + HGInsights because
// it is the historical detailed/profile view. Knowledge V2 remains canonical for
// the new subject/emne overview in knowledge.html.
(function () {
  "use strict";

  function s(value) {
    return String(value == null ? "" : value).trim();
  }

  function esc(value) {
    return s(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function readKnowledgeUniverse() {
    try {
      const fromRuntime = typeof window.getKnowledgeUniverse === "function"
        ? window.getKnowledgeUniverse()
        : null;
      if (fromRuntime && typeof fromRuntime === "object") return fromRuntime;
      return JSON.parse(localStorage.getItem("knowledge_universe") || "{}");
    } catch {
      return {};
    }
  }

  function flattenKnowledge(universe) {
    const rows = [];
    Object.entries(universe || {}).forEach(([category, dimensions]) => {
      Object.entries(dimensions || {}).forEach(([dimension, items]) => {
        (Array.isArray(items) ? items : []).forEach((item) => {
          rows.push({ category, dimension, item: item || {} });
        });
      });
    });
    return rows;
  }

  function topEntry(counts) {
    return Object.entries(counts)
      .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))[0] || ["", 0];
  }

  async function loadBadgeMetadata() {
    const rows = typeof window.DataHub?.loadBadges === "function"
      ? await window.DataHub.loadBadges({ cache: "default" })
      : [];
    return new Map((Array.isArray(rows) ? rows : [])
      .map((badge) => [s(badge?.id), badge])
      .filter(([id]) => id));
  }

  function labelFor(category, badges) {
    return s(badges.get(s(category))?.name) || s(category).replace(/_/g, " ").replace(/^./, (ch) => ch.toUpperCase());
  }

  function renderStats(rows, badges) {
    const categoryCounts = {};
    const dimensionCounts = {};
    rows.forEach((row) => {
      categoryCounts[row.category] = (categoryCounts[row.category] || 0) + 1;
      dimensionCounts[row.dimension] = (dimensionCounts[row.dimension] || 0) + 1;
    });

    const [topCategory, topCategoryCount] = topEntry(categoryCounts);
    const [topDimension, topDimensionCount] = topEntry(dimensionCounts);
    const set = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(value);
    };

    set("statTotalPoints", rows.length);
    set("statCategories", Object.keys(categoryCounts).length);
    set("statDimensions", Object.keys(dimensionCounts).length);
    set("statTopCategory", topCategory ? labelFor(topCategory, badges) : "–");
    set("statTopDimension", topDimension ? topDimension.replace(/_/g, " ") : "–");
    set("statTotalPointsDetail", rows.length ? `Fordelt på ${Object.keys(categoryCounts).length} felt og ${Object.keys(dimensionCounts).length} dimensjoner.` : "Ingen kunnskap samlet ennå.");
    set("statTopCategoryDetail", topCategory ? `${topCategoryCount} kunnskapspunkter innen ${labelFor(topCategory, badges)}.` : "");
    set("statTopDimensionDetail", topDimension ? `${topDimensionCount} kunnskapspunkter med denne dimensjonen.` : "");
  }

  function renderKnowledgeExplorer(rows, badges) {
    const categorySelect = document.getElementById("filterCategory");
    const dimensionSelect = document.getElementById("filterDimension");
    const container = document.getElementById("knowledgeContainer");
    if (!(categorySelect instanceof HTMLSelectElement) || !(dimensionSelect instanceof HTMLSelectElement) || !container) return;

    const categories = [...new Set(rows.map((row) => row.category))]
      .sort((a, b) => labelFor(a, badges).localeCompare(labelFor(b, badges), "nb"));
    const dimensions = [...new Set(rows.map((row) => row.dimension))]
      .sort((a, b) => a.localeCompare(b, "nb"));

    categorySelect.innerHTML = `<option value="">Alle felt</option>${categories.map((id) => `<option value="${esc(id)}">${esc(labelFor(id, badges))}</option>`).join("")}`;
    dimensionSelect.innerHTML = `<option value="">Alle dimensjoner</option>${dimensions.map((id) => `<option value="${esc(id)}">${esc(id.replace(/_/g, " "))}</option>`).join("")}`;

    function render() {
      const category = s(categorySelect.value);
      const dimension = s(dimensionSelect.value);
      const filtered = rows.filter((row) => (!category || row.category === category) && (!dimension || row.dimension === dimension));
      const groups = new Map();

      filtered.forEach((row) => {
        const key = `${row.category}::${row.dimension}`;
        if (!groups.has(key)) groups.set(key, { category: row.category, dimension: row.dimension, rows: [] });
        groups.get(key).rows.push(row);
      });

      container.innerHTML = groups.size
        ? [...groups.values()].map((group) => `
          <section class="know-cat-block">
            <h2>${esc(labelFor(group.category, badges))}</h2>
            <div class="dimension-title">${esc(group.dimension.replace(/_/g, " "))}</div>
            ${group.rows.map((row) => `
              <article class="knowledge-item">
                <div class="knowledge-topic">${esc(row.item?.topic || row.item?.question || "Kunnskap")}</div>
                <div class="knowledge-text">${esc(row.item?.text || row.item?.knowledge || "")}</div>
              </article>
            `).join("")}
          </section>
        `).join("")
        : `<div class="empty-note">${rows.length ? "Ingen treff med disse filtrene." : "Ingen kunnskap låst opp ennå. Ta noen quizer for å fylle denne siden."}</div>`;
    }

    categorySelect.addEventListener("change", render);
    dimensionSelect.addEventListener("change", render);
    render();
  }

  function renderConceptCloud() {
    const box = document.getElementById("conceptCloud");
    if (!box) return;
    const concepts = typeof window.HGInsights?.getUserConcepts === "function"
      ? window.HGInsights.getUserConcepts("anon") || []
      : [];

    if (!concepts.length) {
      box.innerHTML = "<p class='muted'>Ingen begreper registrert ennå. Ta noen quizer og lås opp begreper.</p>";
      return;
    }

    const top = [...concepts]
      .sort((a, b) => Number(b?.count || 0) - Number(a?.count || 0))
      .slice(0, 60);

    function sizeClass(count) {
      const n = Number(count || 0);
      if (n > 30) return "size-xl";
      if (n > 15) return "size-lg";
      if (n > 7) return "size-md";
      if (n > 3) return "size-sm";
      return "size-xs";
    }

    box.innerHTML = `<div class="hg-concept-cloud">${top.map((concept) => `
      <span class="hg-concept-pill ${sizeClass(concept?.count)}" title="Brukt ${Number(concept?.count || 0)} ganger">${esc(concept?.label)}</span>
    `).join("")}</div>`;
  }

  async function renderCoverage(badges) {
    const box = document.getElementById("emneDekningSection");
    const suggestionsBox = document.getElementById("emneSuggestions");
    if (!box) return;

    if (!window.HGInsights || typeof window.computeEmneDekning !== "function" || !window.Emner?.loadForSubject) {
      box.innerHTML = "<p class='muted'>Emne-dekning er ikke tilgjengelig ennå.</p>";
      return;
    }

    const concepts = window.HGInsights.getUserConcepts?.("anon") || [];
    if (!concepts.length) {
      box.innerHTML = "<p class='muted'>Ta noen quizer for å se emne-dekningen din her.</p>";
      return;
    }

    const subjectIds = [...badges.keys()];
    const sections = [];
    const suggestions = [];

    for (const subjectId of subjectIds) {
      const emner = await window.Emner.loadForSubject(subjectId);
      if (!Array.isArray(emner) || !emner.length) continue;
      const results = window.computeEmneDekning(concepts, emner).filter((row) => Number(row?.total || 0) > 0);
      if (!results.length) continue;

      results.forEach((row) => {
        const missingCount = Array.isArray(row?.missing) ? row.missing.length : Math.max(0, Number(row?.total || 0) - Number(row?.matchCount || 0));
        if (Number(row?.percent || 0) > 0 && Number(row?.percent || 0) < 100 && missingCount > 0) {
          suggestions.push({ subjectId, title: row.title, percent: Number(row.percent || 0), missingCount });
        }
      });

      sections.push(`
        <section class="emne-dekning-blokk">
          <h3>${esc(labelFor(subjectId, badges))}</h3>
          <ul class="emne-list">${results.map((row) => `
            <li class="emne-item">
              <div class="emne-header"><strong>${esc(row?.title)}</strong><small>${Number(row?.percent || 0)}% dekket (${Number(row?.matchCount || 0)}/${Number(row?.total || 0)})</small></div>
              <div class="bar-bg"><div class="bar" style="width:${Math.max(0, Math.min(100, Number(row?.percent || 0)))}%;"></div></div>
            </li>
          `).join("")}</ul>
        </section>
      `);
    }

    box.innerHTML = sections.join("") || "<p class='muted'>Ingen emne-dekning å vise ennå.</p>";

    if (suggestionsBox) {
      const top = suggestions.sort((a, b) => b.percent - a.percent || a.missingCount - b.missingCount).slice(0, 5);
      suggestionsBox.innerHTML = top.length ? `
        <div class="emne-suggestions-inner">
          <h3>Hvor du nesten er i mål</h3>
          <p class="muted">Disse emnene er allerede delvis dekket. Noen få nye begreper eller quizer kan lukke hele emnet.</p>
          <ul class="emne-suggestion-list">${top.map((item) => `
            <li class="emne-suggestion-item"><strong>${esc(item.title)}</strong><span class="emne-suggestion-meta">i ${esc(labelFor(item.subjectId, badges))} – ${item.percent}% dekket, mangler ${item.missingCount} kjernebegrep(er).</span></li>
          `).join("")}</ul>
        </div>
      ` : "<p class='muted'>Du har ikke delvis dekkede emner ennå.</p>";
    }
  }

  async function boot() {
    const [badges] = await Promise.all([loadBadgeMetadata()]);
    const universe = readKnowledgeUniverse();
    const rows = flattenKnowledge(universe);
    renderStats(rows, badges);
    renderKnowledgeExplorer(rows, badges);
    renderConceptCloud();
    await renderCoverage(badges);
  }

  document.addEventListener("DOMContentLoaded", () => {
    boot().catch((error) => console.error("[KnowledgeProfileLegacy]", error));
  });
})();
