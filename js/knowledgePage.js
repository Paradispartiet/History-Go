// js/knowledgePage.js
(function () {
  "use strict";

  const LANGUAGE_COLLECTION_ID = "language";
  const AHA_URL = "https://paradispartiet.github.io/AHA-EchoNet/?source=historygo&intent=collection";
  const SUBJECT_ICONS = Object.freeze({
    historie: "⌛",
    vitenskap: "✦",
    kunst: "◇",
    natur: "♧",
    musikk: "♫",
    populaerkultur: "★",
    subkultur: "⚡",
    sport: "●",
    by: "▦",
    politikk: "◎",
    naeringsliv: "↗",
    litteratur: "¶",
    psykologi: "◉"
  });

  const LANGUAGE_DIMENSION_LABELS = Object.freeze({
    word: "Ord",
    expression: "Uttrykk",
    dialect_feature: "Dialekttrekk",
    pronunciation: "Uttale",
    place_name: "Stedsnavn",
    language_history: "Språkhistorie",
    structural_feature: "Strukturelt trekk",
    social_variation: "Sosial variasjon",
    language_change: "Språkendring",
    contact_history: "Kontakt-/språkhistorie",
    corpus_basis: "Korpusgrunnlag",
    term: "Begrep"
  });

  let activeProfile = null;
  let activeSubjectId = "";
  let activeCollectionId = "";

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

  function pct(value) {
    const n = Number(value || 0);
    return Math.max(0, Math.min(100, Number.isFinite(n) ? Math.round(n) : 0));
  }

  function humanizeId(value) {
    return s(value)
      .replace(/^em_[a-z]+_/i, "")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function subjectHref(subjectId) {
    return `knowledge.html?subject=${encodeURIComponent(subjectId)}`;
  }

  function collectionHref(collectionId) {
    return `knowledge.html?collection=${encodeURIComponent(collectionId)}`;
  }

  function subjectIcon(subjectId) {
    return SUBJECT_ICONS[s(subjectId)] || "•";
  }

  function isLanguageEntry(entry) {
    const sourceType = s(entry?.source?.type);
    return sourceType === "language_lexicon"
      || sourceType === "language_atlas"
      || s(entry?.collection_kind) === LANGUAGE_COLLECTION_ID
      || s(entry?.kind) === LANGUAGE_COLLECTION_ID;
  }

  function entryHref(entry) {
    return isLanguageEntry(entry)
      ? collectionHref(LANGUAGE_COLLECTION_ID)
      : subjectHref(entry?._subject_id || entry?.subject_id || entry?.fagkart_category_id || "");
  }

  function sourceLabel(entry) {
    const source = entry?.source || {};
    if (s(source.type) === "language_atlas") {
      const profile = source.atlas_profile_id || entry?.atlas_provenance?.atlas_profile_name || entry?.atlas_provenance?.atlas_profile_id;
      return profile ? `Språkatlas · ${humanizeId(profile)}` : "Språkatlas";
    }
    if (s(source.type) === "language_lexicon") {
      const target = source.place_id || source.target_id;
      return target ? `Språk · ${humanizeId(target)}` : "Språkleksikon";
    }
    if (source.place_id) return `Sted · ${humanizeId(source.place_id)}`;
    if (source.person_id) return `Person · ${humanizeId(source.person_id)}`;
    if (source.target_id) return `Kilde · ${humanizeId(source.target_id)}`;
    if (source.quiz_id) return `Quiz · ${humanizeId(source.quiz_id)}`;
    return source.type === "legacy_quiz_knowledge" ? "Eldre quizkunnskap" : "Knowledge";
  }

  function safeHttpsUrl(value) {
    const raw = s(value);
    if (!raw) return "";
    try {
      const parsed = new URL(raw, location.origin);
      return parsed.protocol === "https:" ? parsed.href : "";
    } catch {
      return "";
    }
  }

  function unique(values) {
    return [...new Set((Array.isArray(values) ? values : []).map(s).filter(Boolean))];
  }

  function sourceUrls(entry) {
    const candidates = [
      ...(Array.isArray(entry?.sources) ? entry.sources : []).map((row) => typeof row === "string" ? row : row?.url),
      ...(Array.isArray(entry?.source?.source_urls) ? entry.source.source_urls : []),
      ...(Array.isArray(entry?.atlas_provenance?.source_urls) ? entry.atlas_provenance.source_urls : [])
    ];
    return unique(candidates.map(safeHttpsUrl).filter(Boolean));
  }

  function entryPlaceId(entry) {
    return s(
      entry?.source?.place_id
      || entry?.atlas_provenance?.geographic_scope?.place_ids?.[0]
      || ""
    );
  }

  function provenanceRows(entry) {
    const source = entry?.source || {};
    const atlas = entry?.atlas_provenance || {};
    const geo = atlas?.geographic_scope || {};
    return [
      ["Fag", entry?._subject_label || entry?.subject_id || entry?.fagkart_category_id],
      ["Sted", source.place_id || geo.place_names?.[0] || ""],
      ["Atlasprofil", atlas.atlas_profile_name || atlas.atlas_profile_id || source.atlas_profile_id || ""],
      ["Belegg", atlas.evidence_label || atlas.feature_evidence_id || source.feature_evidence_id || source.unit_id || ""],
      ["Tid", atlas.time_scope || entry?.historical_period || ""],
      ["Verifisert", atlas.evidence_last_verified || ""],
      ["Kilde-eier", atlas.owner || source.type || ""],
      ["Kildedata", source.source_file || ""]
    ].filter(([, value]) => Array.isArray(value) ? value.length : Boolean(s(value)));
  }

  function renderSummary(profile) {
    const summary = profile?.summary || {};
    const root = document.getElementById("knowledgeSummary");
    if (!root) return;

    root.innerHTML = `
      <article class="kv2-stat"><strong>${Number(summary.knowledge_count || 0)}</strong><span>Kunnskapspunkter</span></article>
      <article class="kv2-stat"><strong>${Number(summary.subject_count || 0)}</strong><span>Fag med kunnskap</span></article>
      <article class="kv2-stat"><strong>${Number(summary.concept_count || 0)}</strong><span>Begreper</span></article>
      <article class="kv2-stat ${Number(summary.unresolved_count || 0) ? "has-warning" : ""}"><strong>${Number(summary.linked_count || 0)}</strong><span>Koblet til emner</span></article>
    `;
  }

  function sortedSubjects(profile) {
    return Object.values(profile?.subjects || {})
      .sort((a, b) => Number(b.knowledge_count || 0) - Number(a.knowledge_count || 0) || s(a.label).localeCompare(s(b.label), "nb"));
  }

  function allEntries(profile) {
    return sortedSubjects(profile).flatMap((subject) => (subject.entries || []).map((entry) => ({
      ...entry,
      _subject_id: subject.subject_id,
      _subject_label: subject.label
    })));
  }

  function languageEntries(profile) {
    return allEntries(profile).filter(isLanguageEntry);
  }

  function renderSubjectNav(profile, selectedSubjectId, selectedCollectionId) {
    const root = document.getElementById("knowledgeSubjectNav");
    if (!root) return;

    const subjects = sortedSubjects(profile);
    const languageCount = languageEntries(profile).length;
    root.innerHTML = [
      `<a class="kv2-subject-pill ${selectedSubjectId || selectedCollectionId ? "" : "is-active"}" href="knowledge.html">Alle</a>`,
      languageCount ? `
        <a class="kv2-subject-pill ${selectedCollectionId === LANGUAGE_COLLECTION_ID ? "is-active" : ""}" href="${collectionHref(LANGUAGE_COLLECTION_ID)}">
          <span>Språk</span><small>${languageCount}</small>
        </a>` : "",
      ...subjects.map((subject) => `
        <a class="kv2-subject-pill ${!selectedCollectionId && selectedSubjectId === subject.subject_id ? "is-active" : ""}" href="${subjectHref(subject.subject_id)}">
          <span>${esc(subject.label)}</span><small>${Number(subject.knowledge_count || 0)}</small>
        </a>
      `)
    ].join("");
  }

  function renderConcepts(concepts, limit = 24) {
    const rows = Array.isArray(concepts) ? concepts.slice(0, limit) : [];
    if (!rows.length) return `<p class="kv2-empty">Ingen begreper er koblet til kunnskapen ennå.</p>`;

    return `<div class="kv2-concepts">${rows.map((concept) => `
      <span class="kv2-concept">${esc(concept.label)}<small>${Number(concept.count || 0)}</small></span>
    `).join("")}</div>`;
  }

  function recentEntries(profile, limit = 7) {
    return allEntries(profile)
      .sort((a, b) => {
        const at = Date.parse(a.last_seen_at || a.learned_at || 0) || 0;
        const bt = Date.parse(b.last_seen_at || b.learned_at || 0) || 0;
        return bt - at;
      })
      .slice(0, limit);
  }

  function renderRecent(profile) {
    const entries = recentEntries(profile);
    if (!entries.length) return `<p class="kv2-empty">Ingen kunnskap er samlet ennå.</p>`;

    return `<div class="kv2-recent-list">${entries.map((entry) => `
      <article class="kv2-recent-item">
        <span class="kv2-recent-meta">${esc(entry._subject_label)} · ${esc(sourceLabel(entry))}</span>
        <a href="${entryHref(entry)}">${esc(entry.topic || "Kunnskap")}</a>
        <p>${esc(entry.text || "")}</p>
      </article>
    `).join("")}</div>`;
  }

  function renderSubjectRows(profile) {
    const subjects = sortedSubjects(profile);
    return `<div class="kv2-subject-list">${subjects.map((subject) => {
      const linked = Number(subject.linked_count || 0);
      const total = Number(subject.knowledge_count || 0);
      const linkedPercent = total ? pct((linked / total) * 100) : 0;
      const meta = total
        ? `${linked} av ${total} plassert i emner`
        : "Ingen kunnskap samlet ennå";
      return `
        <a class="kv2-subject-row" href="${subjectHref(subject.subject_id)}">
          <div class="kv2-subject-row-main">
            <div class="kv2-subject-row-title"><span aria-hidden="true">${subjectIcon(subject.subject_id)}</span><strong>${esc(subject.label)}</strong></div>
            <p>${meta}</p>
            <div class="kv2-progress"><span style="width:${linkedPercent}%"></span></div>
          </div>
          <strong class="kv2-subject-row-count">${total}</strong>
        </a>`;
    }).join("")}</div>`;
  }

  function renderLanguageCollectionCard(profile) {
    const entries = languageEntries(profile);
    if (!entries.length) return "";
    const places = new Set(entries.flatMap((entry) => [
      entryPlaceId(entry),
      s(entry?.source?.atlas_profile_id)
    ]).filter(Boolean));
    return `
      <section class="kv2-panel">
        <div class="kv2-panel-head"><div><span class="kv2-eyebrow">Samling</span><h2>Språk</h2></div></div>
        <a class="kv2-subject-row" href="${collectionHref(LANGUAGE_COLLECTION_ID)}">
          <div class="kv2-subject-row-main">
            <div class="kv2-subject-row-title"><span aria-hidden="true">Aa</span><strong>Språksamlingen din</strong></div>
            <p>${entries.length} ${entries.length === 1 ? "språkspor" : "språkspor"} fra ${places.size} ${places.size === 1 ? "sted/profil" : "steder/profiler"}</p>
          </div>
          <strong class="kv2-subject-row-count">${entries.length}</strong>
        </a>
      </section>`;
  }

  function renderAll(profile) {
    const root = document.getElementById("knowledgeContent");
    if (!root) return;

    root.innerHTML = `
      <div class="kv2-overview-grid">
        <section class="kv2-panel">
          <div class="kv2-panel-head">
            <div><span class="kv2-eyebrow">Fag</span><h2>Kunnskapskartet ditt</h2></div>
            <span class="kv2-panel-meta">Trykk på et fag for å se emnene kunnskapen er koblet til.</span>
          </div>
          ${renderSubjectRows(profile)}
        </section>

        <div class="kv2-side-stack">
          ${renderLanguageCollectionCard(profile)}
          <section class="kv2-panel">
            <div class="kv2-panel-head"><div><span class="kv2-eyebrow">Sist lært</span><h2>Nylig kunnskap</h2></div></div>
            ${renderRecent(profile)}
          </section>
          <section class="kv2-panel">
            <div class="kv2-panel-head"><div><span class="kv2-eyebrow">Begreper</span><h2>Det du møter oftest</h2></div></div>
            ${renderConcepts(profile?.concepts || [], 18)}
          </section>
        </div>
      </div>
    `;
  }

  function dimensionLabel(entry) {
    const dimension = s(entry?.dimension || "generelt");
    if (isLanguageEntry(entry)) return LANGUAGE_DIMENSION_LABELS[dimension] || humanizeId(dimension) || "Språk";
    return dimension;
  }

  function renderEntry(entry) {
    const emneIds = Array.isArray(entry?.resolved_emne_ids) ? entry.resolved_emne_ids : [];
    const concepts = Array.isArray(entry?.concepts) ? entry.concepts : [];
    const provenance = provenanceRows(entry);
    const urls = sourceUrls(entry);
    const placeId = entryPlaceId(entry);
    return `
      <article class="kv2-entry" data-knowledge-entry-id="${esc(entry?.id || entry?.knowledge_unit_id || "")}">
        <div class="kv2-entry-head">
          <strong>${esc(entry?.topic || "Kunnskap")}</strong>
          <span>${esc(dimensionLabel(entry))}</span>
        </div>
        <p>${esc(entry?.text || "")}</p>
        ${concepts.length ? `<div class="kv2-entry-concepts">${concepts.map((concept) => `<span>${esc(concept)}</span>`).join("")}</div>` : ""}
        <div class="kv2-entry-source">
          <span>${esc(sourceLabel(entry))}</span>
          ${emneIds.length
            ? `<span>${emneIds.map((id) => esc(humanizeId(id))).join(" · ")}</span>`
            : isLanguageEntry(entry)
              ? `<span>Samlet språkspor</span>`
              : `<span class="kv2-warning-text">Ikke plassert i emne</span>`}
        </div>
        ${provenance.length || urls.length || placeId ? `
          <div class="knowledge-entry-provenance">
            <div class="knowledge-entry-provenance-row">
              ${provenance.map(([label, value]) => `<span><strong>${esc(label)}:</strong> ${esc(Array.isArray(value) ? value.join(" · ") : value)}</span>`).join("")}
            </div>
            <div class="knowledge-entry-actions">
              ${placeId ? `<a href="index.html?collectionPlace=${encodeURIComponent(placeId)}">Vis stedet på kartet</a>` : ""}
              ${urls.map((url, index) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Kilde${urls.length > 1 ? ` ${index + 1}` : ""} ↗</a>`).join("")}
            </div>
          </div>` : ""}
      </article>
    `;
  }

  function renderEmner(subject) {
    const linkedEmner = (subject?.emner || []).filter((emne) => Number(emne.knowledge_count || 0) > 0);
    if (!linkedEmner.length) return `<p class="kv2-empty">Kunnskap finnes i dette faget, men er ikke sikkert plassert i definerte emner ennå.</p>`;

    const seen = new Set();
    const rows = [];
    for (const emne of linkedEmner) {
      const entries = (emne.entries || []).filter((entry) => {
        const key = s(entry?.id) || `${s(entry?.topic)}|${s(entry?.text)}`;
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      if (!entries.length) continue;
      rows.push({ ...emne, entries });
    }

    return `<div class="kv2-emne-list">${rows.map((emne, index) => `
      <details class="kv2-emne" ${index === 0 ? "open" : ""}>
        <summary>
          <span><strong>${esc(emne.title)}</strong><small>${Number(emne.entries.length || 0)} kunnskapspunkt${emne.entries.length === 1 ? "" : "er"}</small></span>
          <span class="kv2-emne-toggle" aria-hidden="true">＋</span>
        </summary>
        <div class="kv2-emne-body">
          ${emne.description ? `<p class="kv2-muted">${esc(emne.description)}</p>` : ""}
          ${emne.entries.map((entry) => renderEntry({ ...entry, _subject_id: subject?.subject_id, _subject_label: subject?.label })).join("")}
        </div>
      </details>
    `).join("")}</div>`;
  }

  function renderSubject(subject) {
    const root = document.getElementById("knowledgeContent");
    if (!root) return;

    const emptyEmner = (subject?.emner || []).filter((emne) => Number(emne.knowledge_count || 0) === 0);
    const unresolvedEntries = (subject?.entries || []).filter((entry) => !(entry?.resolved_emne_ids || []).length);
    const coursePercent = pct(subject?.course?.course?.percent);
    const courseDone = Number(subject?.course?.course?.done || 0);
    const courseTotal = Number(subject?.course?.course?.total || 0);

    root.innerHTML = `
      <section class="kv2-panel kv2-subject-hero">
        <a class="kv2-back" href="knowledge.html">← Alle fag</a>
        <span class="kv2-eyebrow">${subjectIcon(subject.subject_id)} Fag</span>
        <h2>${esc(subject.label)}</h2>
        <div class="kv2-subject-metrics">
          <span>${Number(subject.knowledge_count || 0)} kunnskapspunkter</span>
          <span>${Number(subject.concepts?.length || 0)} begreper</span>
          <span>${Number(subject.linked_count || 0)} plassert i emner</span>
        </div>
        ${Number(subject.unresolved_count || 0) ? `<div class="kv2-warning">${Number(subject.unresolved_count || 0)} kunnskapspunkt${Number(subject.unresolved_count || 0) === 1 ? "" : "er"} er bevart, men mangler sikker emnekobling.</div>` : ""}
      </section>

      ${courseTotal ? `<section class="kv2-panel">
        <div class="kv2-course-row"><div><span class="kv2-eyebrow">Progresjon</span><h2>Kursstatus</h2></div><strong>${coursePercent}%</strong></div>
        <div class="kv2-progress kv2-progress-large"><span style="width:${coursePercent}%"></span></div>
        <p class="kv2-muted">${courseDone} av ${courseTotal} moduler fullført.</p>
      </section>` : ""}

      <section class="kv2-panel">
        <div class="kv2-panel-head"><div><span class="kv2-eyebrow">Emner</span><h2>Hvor kunnskapen hører hjemme</h2></div></div>
        ${renderEmner(subject)}
        ${emptyEmner.length ? `<details class="kv2-empty-emners"><summary>Vis ${emptyEmner.length} emner uten samlet kunnskap</summary><div>${emptyEmner.map((emne) => `<span>${esc(emne.title)}</span>`).join("")}</div></details>` : ""}
      </section>

      ${subject.concepts?.length ? `<section class="kv2-panel">
        <div class="kv2-panel-head"><div><span class="kv2-eyebrow">Begreper</span><h2>Begrepene i dette faget</h2></div></div>
        ${renderConcepts(subject.concepts || [], 36)}
      </section>` : ""}

      ${unresolvedEntries.length ? `<section class="kv2-panel">
        <div class="kv2-panel-head"><div><span class="kv2-eyebrow">Uplassert</span><h2>Mangler emnekobling</h2></div><span class="kv2-panel-meta">Disse er ikke tapt. De venter på en sikker kobling.</span></div>
        <div class="kv2-unresolved-list">${unresolvedEntries.map((entry) => renderEntry({ ...entry, _subject_id: subject?.subject_id, _subject_label: subject?.label })).join("")}</div>
      </section>` : ""}
    `;
  }

  function groupLanguageEntriesByPlace(entries) {
    const groups = new Map();
    entries.forEach((entry) => {
      const placeId = entryPlaceId(entry)
        || s(entry?.source?.atlas_profile_id)
        || s(entry?.source?.target_id)
        || "ukjent_sted";
      const rows = groups.get(placeId) || [];
      rows.push(entry);
      groups.set(placeId, rows);
    });
    return [...groups.entries()]
      .map(([placeId, rows]) => ({ placeId, label: humanizeId(placeId), entries: rows }))
      .sort((a, b) => a.label.localeCompare(b.label, "nb"));
  }

  function renderLanguageCollection(profile) {
    const root = document.getElementById("knowledgeContent");
    if (!root) return;
    const entries = languageEntries(profile);
    const groups = groupLanguageEntriesByPlace(entries);
    const dimensions = new Set(entries.map((entry) => s(entry?.dimension)).filter(Boolean));

    root.innerHTML = `
      <section class="kv2-panel kv2-subject-hero">
        <a class="kv2-back" href="knowledge.html">← All kunnskap</a>
        <span class="kv2-eyebrow">Aa Samling</span>
        <h2>Språksamlingen din</h2>
        <p class="kv2-muted">Ord, uttrykk, dialekttrekk, språkendring og andre dokumenterte språkspor du eksplisitt har samlet i History Go.</p>
        <div class="kv2-subject-metrics">
          <span>${entries.length} ${entries.length === 1 ? "språkspor" : "språkspor"}</span>
          <span>${groups.length} ${groups.length === 1 ? "sted/profil" : "steder/profiler"}</span>
          <span>${dimensions.size} ${dimensions.size === 1 ? "type" : "typer"}</span>
        </div>
      </section>

      <section class="kv2-panel">
        <div class="kv2-panel-head"><div><span class="kv2-eyebrow">Proveniens</span><h2>Språk du har samlet</h2></div><span class="kv2-panel-meta">Atlasprofilen eller Språkleksikonet beholder eierskapet til kildedataene.</span></div>
        ${groups.length ? `<div class="kv2-emne-list">${groups.map((group, index) => `
          <details class="kv2-emne" ${index === 0 ? "open" : ""}>
            <summary>
              <span><strong>${esc(group.label)}</strong><small>${group.entries.length} ${group.entries.length === 1 ? "språkspor" : "språkspor"}</small></span>
              <span class="kv2-emne-toggle" aria-hidden="true">＋</span>
            </summary>
            <div class="kv2-emne-body">${group.entries.map(renderEntry).join("")}</div>
          </details>
        `).join("")}</div>` : `<p class="kv2-empty">Du har ikke samlet språkspor ennå.</p>`}
      </section>
    `;
  }

  function entryMatches(entry, query) {
    const haystack = [
      entry?._subject_label,
      entry?.topic,
      entry?.text,
      entry?.dimension,
      entry?.collection_kind,
      entry?.source?.type,
      entry?.source?.place_id,
      entry?.source?.atlas_profile_id,
      entry?.atlas_provenance?.atlas_profile_name,
      entry?.atlas_provenance?.evidence_label,
      sourceLabel(entry),
      ...(entry?.concepts || []),
      ...(entry?.tags || []),
      ...(entry?.resolved_emne_ids || []).map(humanizeId)
    ].map(s).join(" ").toLowerCase();
    return haystack.includes(query);
  }

  function renderSearch(profile, rawQuery) {
    const root = document.getElementById("knowledgeContent");
    if (!root) return;
    const query = s(rawQuery).toLowerCase();
    if (!query) return renderCurrentView();

    const entries = activeCollectionId === LANGUAGE_COLLECTION_ID ? languageEntries(profile) : allEntries(profile);
    const matches = entries.filter((entry) => entryMatches(entry, query)).slice(0, 60);
    root.innerHTML = `
      <section class="kv2-panel">
        <div class="kv2-panel-head">
          <div><span class="kv2-eyebrow">Søk</span><h2>${matches.length} treff på «${esc(rawQuery)}»</h2></div>
        </div>
        ${matches.length ? `<div class="kv2-search-results">${matches.map(renderEntry).join("")}</div>` : `<p class="kv2-empty">Ingen kunnskap matcher søket.</p>`}
      </section>
    `;
  }

  function renderRouteError(value) {
    const root = document.getElementById("knowledgeContent");
    if (!root) return;
    root.innerHTML = `
      <section class="kv2-panel kv2-route-error">
        <span class="kv2-eyebrow">Ugyldig lenke</span>
        <h2>Visningen «${esc(value)}» finnes ikke</h2>
        <p class="kv2-muted">Lenken peker til en del av Knowledge-modellen som ikke finnes.</p>
        <a href="knowledge.html">Åpne hele kunnskapsprofilen</a>
      </section>
    `;
  }

  function renderCurrentView() {
    if (!activeProfile) return;
    if (activeCollectionId) {
      if (activeCollectionId === LANGUAGE_COLLECTION_ID) return renderLanguageCollection(activeProfile);
      return renderRouteError(activeCollectionId);
    }
    if (!activeSubjectId) return renderAll(activeProfile);
    const subject = activeProfile.subjects?.[activeSubjectId];
    if (subject) renderSubject(subject);
    else renderRouteError(activeSubjectId);
  }

  function bindSearch() {
    const input = document.getElementById("knowledgeSearch");
    if (!(input instanceof HTMLInputElement)) return;
    input.addEventListener("input", () => {
      const query = s(input.value);
      if (query.length < 2) renderCurrentView();
      else renderSearch(activeProfile, query);
    });
  }

  async function openAhaCollection() {
    let state = null;
    try { state = await window.HistoryGoAHAAuth?.refresh?.(); } catch {}
    if (!state?.signed_in) {
      if (typeof window.HGUserProfile?.openLoginPopup === "function") {
        window.HGUserProfile.openLoginPopup();
        return;
      }
      if (typeof window.HistoryGoAHAAuth?.openAhaLogin === "function") {
        window.HistoryGoAHAAuth.openAhaLogin();
        return;
      }
    }
    try { window.exportHistoryGoData?.(); } catch {}
    location.href = AHA_URL;
  }

  async function boot() {
    const loading = document.getElementById("knowledgeLoading");
    const error = document.getElementById("knowledgeError");
    const params = new URLSearchParams(location.search);
    activeCollectionId = s(params.get("collection"));
    activeSubjectId = activeCollectionId ? "" : s(params.get("subject"));

    document.querySelector("[data-knowledge-aha]")?.addEventListener("click", () => void openAhaCollection());

    if (!window.HGKnowledgeV2?.buildProfile) {
      if (loading) loading.hidden = true;
      if (error) {
        error.hidden = false;
        error.textContent = "Kunnskapssiden kunne ikke lastes.";
      }
      return;
    }

    try {
      activeProfile = await window.HGKnowledgeV2.buildProfile();
      window.hgKnowledgeProfileV2 = activeProfile;
      renderSummary(activeProfile);
      renderSubjectNav(activeProfile, activeSubjectId, activeCollectionId);
      renderCurrentView();
      bindSearch();
      window.HGKnowledgeV2.renderQuizMemoryOverview?.(activeProfile);
      if (loading) loading.hidden = true;
    } catch (err) {
      console.error("[KnowledgePage]", err);
      if (loading) loading.hidden = true;
      if (error) {
        error.hidden = false;
        error.textContent = "Kunne ikke bygge kunnskapsprofilen akkurat nå.";
      }
    }
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
