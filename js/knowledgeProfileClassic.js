// js/knowledgeProfileClassic.js
(function () {
  "use strict";

  const LABELS = Object.freeze({
    historie: "Historie",
    vitenskap: "Vitenskap",
    kunst: "Kunst & Kultur",
    natur: "Natur & Miljø",
    musikk: "Musikk",
    populaerkultur: "Populærkultur",
    subkultur: "Subkultur",
    sport: "Sport",
    by: "By & Arkitektur",
    politikk: "Politikk & Samfunn",
    naeringsliv: "Næringsliv",
    litteratur: "Litteratur",
    psykologi: "Psykologi",
    media: "Media",
    film_tv: "Film & TV",
    religion: "Religion",
    sosial_laering: "Sosial læring"
  });

  let activeProfile = null;

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

  function subjectLabel(id, fallback) {
    return fallback || LABELS[id] || s(id).replace(/[_-]+/g, " ").replace(/^./, (c) => c.toUpperCase());
  }

  function prettyDimension(id) {
    const value = s(id).replace(/[_-]+/g, " ");
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : "Generelt";
  }

  function allEntries(profile) {
    return Object.values(profile?.subjects || {}).flatMap((subject) =>
      (subject?.entries || []).map((entry) => ({
        ...entry,
        _subject_id: subject.subject_id,
        _subject_label: subjectLabel(subject.subject_id, subject.label)
      }))
    );
  }

  function countMap(values) {
    const map = new Map();
    values.forEach((value) => {
      const key = s(value);
      if (key) map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }

  function topEntry(map) {
    let bestKey = "";
    let bestValue = 0;
    for (const [key, value] of map.entries()) {
      if (value > bestValue) {
        bestKey = key;
        bestValue = value;
      }
    }
    return { key: bestKey, value: bestValue };
  }

  function renderStats(profile) {
    const entries = allEntries(profile);
    const activeSubjects = Object.values(profile?.subjects || {}).filter((subject) => Number(subject?.knowledge_count || 0) > 0);
    const dimensionCounts = countMap(entries.map((entry) => entry.dimension || "generelt"));
    const topSubject = activeSubjects.sort((a, b) => Number(b.knowledge_count || 0) - Number(a.knowledge_count || 0))[0] || null;
    const topDimension = topEntry(dimensionCounts);

    document.getElementById("statTotalPoints").textContent = String(entries.length);
    document.getElementById("statTotalPointsDetail").textContent = `Fordelt på ${activeSubjects.length} felt og ${dimensionCounts.size} dimensjoner.`;
    document.getElementById("statCategories").textContent = String(activeSubjects.length);
    document.getElementById("statDimensions").textContent = String(dimensionCounts.size);
    document.getElementById("statTopCategory").textContent = topSubject ? subjectLabel(topSubject.subject_id, topSubject.label) : "–";
    document.getElementById("statTopCategoryDetail").textContent = topSubject ? `${Number(topSubject.knowledge_count || 0)} kunnskapspunkter i dette feltet.` : "";
    document.getElementById("statTopDimension").textContent = topDimension.key ? prettyDimension(topDimension.key) : "–";
    document.getElementById("statTopDimensionDetail").textContent = topDimension.key ? `${topDimension.value} kunnskapspunkter med denne dimensjonen.` : "";
  }

  function renderConceptCloud(profile) {
    const root = document.getElementById("conceptCloud");
    const concepts = Array.isArray(profile?.concepts) ? profile.concepts.slice(0, 60) : [];
    if (!concepts.length) {
      root.innerHTML = "<p class='muted'>Ingen begreper registrert ennå. Ta noen quizer og lås opp begreper.</p>";
      return;
    }

    const max = Math.max(...concepts.map((concept) => Number(concept.count || 1)), 1);
    root.innerHTML = `<div class="hg-concept-cloud">${concepts.map((concept) => {
      const ratio = Number(concept.count || 1) / max;
      const sizeClass = ratio > .75 ? "size-xl" : ratio > .5 ? "size-lg" : ratio > .3 ? "size-md" : ratio > .15 ? "size-sm" : "size-xs";
      return `<span class="hg-concept-pill ${sizeClass}" title="Brukt ${Number(concept.count || 0)} ganger">${esc(concept.label)}</span>`;
    }).join("")}</div>`;
  }

  function renderEmneCoverage(profile) {
    const root = document.getElementById("emneDekningSection");
    const suggestionsRoot = document.getElementById("emneSuggestions");
    const subjects = Object.values(profile?.subjects || {}).filter((subject) => Number(subject?.knowledge_count || 0) > 0);
    const suggestions = [];
    let html = "";

    subjects.forEach((subject) => {
      const emner = Array.isArray(subject?.emner) ? subject.emner : [];
      const withKnowledge = emner.filter((emne) => Number(emne?.knowledge_count || 0) > 0);
      const totalKnowledge = Math.max(1, Number(subject?.knowledge_count || 0));
      if (!withKnowledge.length) return;

      html += `<section class="emne-dekning-blokk"><h3>${esc(subjectLabel(subject.subject_id, subject.label))}</h3><ul class="emne-list">${withKnowledge.map((emne) => {
        const count = Number(emne.knowledge_count || 0);
        const percent = Math.max(1, Math.min(100, Math.round((count / totalKnowledge) * 100)));
        return `<li class="emne-item"><div class="emne-header"><strong>${esc(emne.title || emne.emne_id)}</strong><small>${count} kunnskapspunkt${count === 1 ? "" : "er"}</small></div><div class="bar-bg"><div class="bar" style="width:${percent}%;"></div></div></li>`;
      }).join("")}</ul></section>`;

      emner.filter((emne) => Number(emne?.knowledge_count || 0) === 0).slice(0, 2).forEach((emne) => {
        suggestions.push({ subject: subjectLabel(subject.subject_id, subject.label), title: emne.title || emne.emne_id });
      });
    });

    root.innerHTML = html || "<p class='muted'>Ingen emne-dekning å vise ennå. Ta flere quizer for å fylle kunnskapsprofilen.</p>";
    suggestionsRoot.innerHTML = suggestions.length
      ? `<div class="emne-suggestions-inner"><h3>Emner du kan bygge videre på</h3><p class="muted">Disse emnene ligger i fag du allerede har begynt å samle kunnskap i.</p><ul class="emne-suggestion-list">${suggestions.slice(0, 6).map((item) => `<li class="emne-suggestion-item"><strong>${esc(item.title)}</strong><span class="emne-suggestion-meta">i ${esc(item.subject)}</span></li>`).join("")}</ul></div>`
      : "";
  }

  function populateFilters(profile) {
    const categoryFilter = document.getElementById("filterCategory");
    const dimensionFilter = document.getElementById("filterDimension");
    const entries = allEntries(profile);
    const subjects = Object.values(profile?.subjects || {}).filter((subject) => Number(subject?.knowledge_count || 0) > 0);

    subjects.sort((a, b) => subjectLabel(a.subject_id, a.label).localeCompare(subjectLabel(b.subject_id, b.label), "nb"));
    subjects.forEach((subject) => {
      const option = document.createElement("option");
      option.value = subject.subject_id;
      option.textContent = subjectLabel(subject.subject_id, subject.label);
      categoryFilter.appendChild(option);
    });

    [...new Set(entries.map((entry) => s(entry.dimension || "generelt")).filter(Boolean))].sort().forEach((dimension) => {
      const option = document.createElement("option");
      option.value = dimension;
      option.textContent = prettyDimension(dimension);
      dimensionFilter.appendChild(option);
    });

    categoryFilter.addEventListener("change", renderKnowledgeList);
    dimensionFilter.addEventListener("change", renderKnowledgeList);
  }

  function renderKnowledgeList() {
    if (!activeProfile) return;
    const root = document.getElementById("knowledgeContainer");
    const category = document.getElementById("filterCategory").value;
    const dimension = document.getElementById("filterDimension").value;
    const entries = allEntries(activeProfile).filter((entry) => {
      if (category && entry._subject_id !== category) return false;
      if (dimension && s(entry.dimension || "generelt") !== dimension) return false;
      return true;
    });

    if (!entries.length) {
      root.innerHTML = "<div class='empty-note'>Ingen treff med disse filtrene.</div>";
      return;
    }

    const grouped = new Map();
    entries.forEach((entry) => {
      if (!grouped.has(entry._subject_id)) grouped.set(entry._subject_id, { label: entry._subject_label, dimensions: new Map() });
      const group = grouped.get(entry._subject_id);
      const dim = s(entry.dimension || "generelt");
      if (!group.dimensions.has(dim)) group.dimensions.set(dim, []);
      group.dimensions.get(dim).push(entry);
    });

    root.innerHTML = [...grouped.entries()].map(([subjectId, group]) => `<section class="know-cat-block"><h2><a href="knowledge.html?subject=${encodeURIComponent(subjectId)}">${esc(group.label)}</a></h2>${[...group.dimensions.entries()].map(([dim, items]) => `<div class="dimension-title">${esc(prettyDimension(dim))}</div>${items.map((item) => `<article class="knowledge-item"><div class="knowledge-topic">${esc(item.topic || "Kunnskap")}</div><div class="knowledge-text">${esc(item.text || "")}</div></article>`).join("")}`).join("")}</section>`).join("");
  }

  async function boot() {
    const root = document.getElementById("knowledgeContainer");
    if (!window.HGKnowledgeV2?.buildProfile) {
      root.innerHTML = "<div class='empty-note'>Kunnskapsprofilen kunne ikke lastes.</div>";
      return;
    }

    try {
      activeProfile = await window.HGKnowledgeV2.buildProfile();
      renderStats(activeProfile);
      renderConceptCloud(activeProfile);
      renderEmneCoverage(activeProfile);
      populateFilters(activeProfile);
      renderKnowledgeList();
    } catch (error) {
      console.error("[KnowledgeProfileClassic]", error);
      root.innerHTML = "<div class='empty-note'>Kunnskapsprofilen kunne ikke bygges akkurat nå.</div>";
    }
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
