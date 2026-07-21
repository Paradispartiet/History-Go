// js/knowledgeMemoryPageBridge.js
// Kobler hg_knowledge_memory_v1 inn i Knowledge-sidens eksisterende read-model.
(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HGKnowledgeMemoryPageBridge = api;
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  const STORAGE_KEY = "hg_knowledge_memory_v1";
  const BRIDGE_FLAG = "__HG_KNOWLEDGE_MEMORY_PAGE_BRIDGE__";

  function s(value) {
    return String(value == null ? "" : value).trim();
  }

  function rows(value) {
    return Array.isArray(value) ? value : [];
  }

  function unique(values) {
    return Array.from(new Set(rows(values).map(s).filter(Boolean)));
  }

  function esc(value) {
    return s(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function humanize(value) {
    return s(value)
      .replace(/^em_[a-z]+_/i, "")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function emptyMemory() {
    return {
      schema: "hg_knowledge_memory_v1",
      bundles: {},
      indexes: {}
    };
  }

  function readMemory() {
    if (root?.HGQuizKnowledgeMemory?.readMemory) {
      try {
        return root.HGQuizKnowledgeMemory.readMemory() || emptyMemory();
      } catch (_error) {}
    }

    try {
      const parsed = JSON.parse(root?.localStorage?.getItem(STORAGE_KEY) || "null");
      return parsed && parsed.bundles ? parsed : emptyMemory();
    } catch (_error) {
      return emptyMemory();
    }
  }

  function subjectLabel(subjectId) {
    return s(root?.HGKnowledgeV2?.SUBJECT_LABELS?.[subjectId] || subjectId || "Ukjent fag");
  }

  function sourceFor(bundle, extra = {}) {
    return {
      type: "quiz_memory",
      target_id: s(bundle?.target_id),
      quiz_id: s(bundle?.set_id),
      source_file: s(bundle?.source_file),
      ...extra
    };
  }

  function entryIdentity(entry) {
    return [
      s(entry?.subject_id || entry?.fagkart_category_id),
      s(entry?.source?.target_id || entry?.source?.place_id || entry?.source?.person_id),
      s(entry?.text)
    ].join("::");
  }

  function unitEntry(bundle, unit) {
    const emneIds = unique([...(unit?.emne_ids || [])]);
    const concepts = unique([
      ...(unit?.concepts || []),
      ...(unit?.concept_focus || [])
    ]);
    const terms = unique(unit?.terms || []);
    const unitId = s(unit?.unit_id || unit?.id);

    return {
      schema: "history_go_knowledge_entry_v2",
      version: 2,
      id: `quiz_memory::${s(bundle?.bundle_id)}::${unitId}`,
      subject_id: s(bundle?.subject_id),
      fagkart_category_id: s(bundle?.subject_id),
      emne_ids: emneIds,
      resolved_emne_ids: emneIds,
      concepts,
      terms,
      tags: unique(unit?.tags || []),
      dimension: s(unit?.dimension || unit?.kind || "kunnskap"),
      topic: s(unit?.topic || unit?.question_family || unit?.question_type || "Kunnskap"),
      text: s(unit?.text),
      source: sourceFor(bundle, { unit_id: unitId }),
      learned_at: bundle?.collected_at || null,
      last_seen_at: bundle?.updated_at || bundle?.collected_at || null,
      times_seen: 1,
      link_status: emneIds.length ? "explicit_quiz_memory" : "quiz_memory_unresolved",
      memory_kind: s(unit?.kind || "knowledge"),
      memory_evidence: {
        bundle_id: s(bundle?.bundle_id),
        unit_id: unitId,
        reading_state: s(unit?.reading?.state || bundle?.reading?.state || "collected"),
        assessment_state: s(unit?.assessment?.state),
        correct: unit?.assessment?.correct === true
      }
    };
  }

  function materialEntry(bundle, item, kind, index) {
    const itemId = s(item?.id) || `${kind}_${index + 1}`;
    return {
      schema: "history_go_knowledge_entry_v2",
      version: 2,
      id: `quiz_memory::${s(bundle?.bundle_id)}::${kind}::${itemId}`,
      subject_id: s(bundle?.subject_id),
      fagkart_category_id: s(bundle?.subject_id),
      emne_ids: [],
      resolved_emne_ids: [],
      concepts: [],
      terms: [],
      tags: unique(item?.tags || []),
      dimension: kind,
      topic: s(item?.title || humanize(kind) || "Kunnskap"),
      text: s(item?.text),
      source: sourceFor(bundle, { material_id: itemId, material_kind: kind }),
      learned_at: bundle?.collected_at || null,
      last_seen_at: bundle?.updated_at || bundle?.collected_at || null,
      times_seen: 1,
      link_status: "quiz_memory_material",
      memory_kind: kind,
      memory_evidence: {
        bundle_id: s(bundle?.bundle_id),
        reading_state: s(bundle?.reading?.state || "collected"),
        assessment_state: "not_assessed"
      }
    };
  }

  function bundleEntries(bundle) {
    const out = rows(bundle?.knowledge_units)
      .map((unit) => unitEntry(bundle, unit))
      .filter((entry) => entry.text);

    const materialGroups = [
      ["fun_fact", bundle?.fun_facts],
      ["story", bundle?.stories],
      ["building_story", bundle?.building_stories],
      ["conflict", bundle?.conflicts]
    ];

    materialGroups.forEach(([kind, items]) => {
      rows(items).forEach((item, index) => {
        const entry = materialEntry(bundle, item, kind, index);
        if (entry.text) out.push(entry);
      });
    });

    return out;
  }

  function ensureSubject(profile, subjectId) {
    profile.subjects ||= {};
    if (!profile.subjects[subjectId]) {
      profile.subjects[subjectId] = {
        subject_id: subjectId,
        label: subjectLabel(subjectId),
        knowledge_count: 0,
        linked_count: 0,
        unresolved_count: 0,
        concepts: [],
        entries: [],
        emners: [],
        course: null
      };
    }
    return profile.subjects[subjectId];
  }

  function mergeEntries(subject, incoming) {
    const existing = rows(subject?.entries);
    const byIdentity = new Map(existing.map((entry) => [entryIdentity(entry), entry]));

    incoming.forEach((entry) => {
      const identity = entryIdentity(entry);
      const previous = byIdentity.get(identity);
      if (previous && identity && s(entry.text)) {
        previous.memory_kind ||= entry.memory_kind;
        previous.memory_evidence ||= entry.memory_evidence;
        previous.emne_ids = unique([...(previous.emne_ids || []), ...(entry.emne_ids || [])]);
        previous.resolved_emne_ids = unique([...(previous.resolved_emne_ids || []), ...(entry.resolved_emne_ids || [])]);
        previous.concepts = unique([...(previous.concepts || []), ...(entry.concepts || [])]);
        previous.terms = unique([...(previous.terms || []), ...(entry.terms || [])]);
        previous.tags = unique([...(previous.tags || []), ...(entry.tags || [])]);
        return;
      }
      existing.push(entry);
      if (identity) byIdentity.set(identity, entry);
    });

    subject.entries = existing;
  }

  function rebuildSubject(subject) {
    const entries = rows(subject?.entries);
    const conceptCounts = new Map();

    entries.forEach((entry) => {
      unique(entry?.concepts || []).forEach((concept) => {
        const key = concept.toLowerCase();
        const current = conceptCounts.get(key) || { id: key, label: concept, count: 0 };
        current.count += 1;
        conceptCounts.set(key, current);
      });
    });

    const emneMap = new Map(rows(subject?.emners).map((emne) => [s(emne?.emne_id), { ...emne, entries: rows(emne?.entries).slice() }]));
    emneMap.forEach((emne) => { emne.entries = []; });

    entries.forEach((entry) => {
      rows(entry?.resolved_emne_ids).forEach((emneIdRaw) => {
        const emneId = s(emneIdRaw);
        if (!emneId) return;
        if (!emneMap.has(emneId)) {
          emneMap.set(emneId, {
            emne_id: emneId,
            title: humanize(emneId) || emneId,
            description: "",
            core_concepts: [],
            dimensions: [],
            knowledge_count: 0,
            entries: []
          });
        }
        emneMap.get(emneId).entries.push(entry);
      });
    });

    subject.knowledge_count = entries.length;
    subject.linked_count = entries.filter((entry) => rows(entry?.resolved_emne_ids).length).length;
    subject.unresolved_count = entries.length - subject.linked_count;
    subject.concepts = Array.from(conceptCounts.values()).sort((a, b) => b.count - a.count || s(a.label).localeCompare(s(b.label), "nb"));
    subject.emners = Array.from(emneMap.values())
      .map((emne) => ({ ...emne, knowledge_count: rows(emne.entries).length }))
      .sort((a, b) => Number(b.knowledge_count || 0) - Number(a.knowledge_count || 0) || s(a.title).localeCompare(s(b.title), "nb"));
  }

  function memorySummary(memory) {
    const bundles = Object.values(memory?.bundles || {});
    const units = bundles.flatMap((bundle) => rows(bundle?.knowledge_units));
    return {
      bundle_count: bundles.length,
      knowledge_unit_count: units.length,
      mastered_count: units.filter((unit) => unit?.assessment?.state === "mastered").length,
      review_count: units.filter((unit) => unit?.assessment?.state === "needs_review").length,
      read_bundle_count: bundles.filter((bundle) => bundle?.reading?.state === "read").length,
      presented_bundle_count: bundles.filter((bundle) => bundle?.reading?.state === "presented").length,
      fun_fact_count: bundles.reduce((sum, bundle) => sum + rows(bundle?.fun_facts).length, 0),
      story_count: bundles.reduce((sum, bundle) => sum + rows(bundle?.stories).length + rows(bundle?.building_stories).length, 0)
    };
  }

  function rebuildProfileSummary(profile) {
    const subjects = Object.values(profile?.subjects || {});
    const concepts = new Map();
    subjects.forEach((subject) => rows(subject?.concepts).forEach((concept) => {
      const key = s(concept?.id || concept?.label).toLowerCase();
      if (!key) return;
      const current = concepts.get(key) || { id: key, label: s(concept?.label || concept?.id), count: 0 };
      current.count += Number(concept?.count || 0);
      concepts.set(key, current);
    }));

    profile.summary = {
      ...(profile.summary || {}),
      knowledge_count: subjects.reduce((sum, subject) => sum + Number(subject?.knowledge_count || 0), 0),
      linked_count: subjects.reduce((sum, subject) => sum + Number(subject?.linked_count || 0), 0),
      unresolved_count: subjects.reduce((sum, subject) => sum + Number(subject?.unresolved_count || 0), 0),
      subject_count: subjects.filter((subject) => Number(subject?.knowledge_count || 0) > 0).length,
      concept_count: concepts.size
    };
    profile.concepts = Array.from(concepts.values()).sort((a, b) => b.count - a.count || s(a.label).localeCompare(s(b.label), "nb"));
    return profile;
  }

  function mergeMemoryIntoProfile(profile, memory = readMemory()) {
    const next = profile && typeof profile === "object" ? profile : { subjects: {}, summary: {}, concepts: [] };
    const bundles = Object.values(memory?.bundles || {});

    bundles.forEach((bundle) => {
      const subjectId = s(bundle?.subject_id);
      if (!subjectId) return;
      const subject = ensureSubject(next, subjectId);
      mergeEntries(subject, bundleEntries(bundle));
    });

    Object.values(next.subjects || {}).forEach(rebuildSubject);
    next.quiz_memory = {
      schema: s(memory?.schema || "hg_knowledge_memory_v1"),
      summary: memorySummary(memory),
      bundles: bundles
        .slice()
        .sort((a, b) => (Date.parse(b?.updated_at || b?.collected_at || 0) || 0) - (Date.parse(a?.updated_at || a?.collected_at || 0) || 0))
    };
    return rebuildProfileSummary(next);
  }

  function statusLabel(state) {
    if (state === "read") return "Lest";
    if (state === "presented") return "Åpnet";
    return "Samlet";
  }

  function renderOverview(profile) {
    if (!root?.document) return;
    const content = root.document.getElementById("knowledgeContent");
    if (!content) return;

    let panel = root.document.getElementById("knowledgeMemoryOverview");
    if (!panel) {
      panel = root.document.createElement("section");
      panel.id = "knowledgeMemoryOverview";
      panel.className = "kv2-panel";
      panel.style.marginBottom = "18px";
      content.parentElement?.insertBefore(panel, content);
    }

    const memory = profile?.quiz_memory || { summary: {}, bundles: [] };
    const summary = memory.summary || {};
    const selectedSubject = s(new URLSearchParams(root.location?.search || "").get("subject"));
    const bundles = rows(memory.bundles)
      .filter((bundle) => !selectedSubject || s(bundle?.subject_id) === selectedSubject)
      .slice(0, 8);

    if (!Number(summary.bundle_count || 0)) {
      panel.innerHTML = `
        <div class="kv2-panel-head">
          <div><span class="kv2-eyebrow">Quiz-minnekammer</span><h2>Kunnskap fra fullførte quizzer</h2></div>
        </div>
        <p class="kv2-empty">Ingen kunnskapsbundle er samlet ennå. Fullfør en quiz for å fylle minnekammeret.</p>`;
      return;
    }

    panel.innerHTML = `
      <div class="kv2-panel-head">
        <div><span class="kv2-eyebrow">Quiz-minnekammer</span><h2>Kunnskap samlet i quiz</h2></div>
        <span class="kv2-panel-meta">Bevarer kunnskap, historier, funfacts og vurderingsevidens som egne lag.</span>
      </div>
      <div class="kv2-summary" style="margin:0 0 16px">
        <article class="kv2-stat"><strong>${Number(summary.bundle_count || 0)}</strong><span>Quizforløp</span></article>
        <article class="kv2-stat"><strong>${Number(summary.knowledge_unit_count || 0)}</strong><span>Kunnskapsenheter</span></article>
        <article class="kv2-stat"><strong>${Number(summary.mastered_count || 0)}</strong><span>Mestret</span></article>
        <article class="kv2-stat ${Number(summary.review_count || 0) ? "has-warning" : ""}"><strong>${Number(summary.review_count || 0)}</strong><span>Til repetisjon</span></article>
      </div>
      ${bundles.length ? `<div class="kv2-recent-list">${bundles.map((bundle) => `
        <article class="kv2-recent-item">
          <span class="kv2-recent-meta">${esc(subjectLabel(s(bundle?.subject_id)))} · ${esc(statusLabel(s(bundle?.reading?.state)))}</span>
          <button type="button" data-knowledge-bundle="${esc(bundle?.bundle_id)}" style="appearance:none;border:0;background:none;color:inherit;padding:0;text-align:left;font:inherit;cursor:pointer;font-weight:700">
            ${esc(bundle?.set_title || humanize(bundle?.target_id) || "Quizkunnskap")}
          </button>
          <p>${Number(bundle?.result?.correct || 0)} av ${Number(bundle?.result?.total || 0)} riktig · ${rows(bundle?.knowledge_units).length} kunnskapspunkter · ${rows(bundle?.fun_facts).length} funfacts · ${rows(bundle?.stories).length} historier</p>
        </article>`).join("")}</div>` : `<p class="kv2-empty">Ingen quizforløp i dette faget ennå.</p>`}`;

    panel.querySelectorAll("[data-knowledge-bundle]").forEach((button) => {
      button.addEventListener("click", () => {
        const bundleId = s(button.getAttribute("data-knowledge-bundle"));
        root.HGQuizKnowledgeMemory?.openKnowledgePopup?.(bundleId);
      });
    });
  }

  function install() {
    const engine = root?.HGKnowledgeV2;
    if (!engine?.buildProfile || root[BRIDGE_FLAG]) return false;

    const originalBuildProfile = engine.buildProfile.bind(engine);
    engine.buildProfile = async function buildProfileWithQuizMemory(options = {}) {
      const profile = await originalBuildProfile(options);
      const merged = mergeMemoryIntoProfile(profile, readMemory());
      Promise.resolve().then(() => renderOverview(merged));
      return merged;
    };

    root[BRIDGE_FLAG] = true;
    root.addEventListener?.("hg:knowledgeMemoryUpdated", () => {
      const current = root.hgKnowledgeProfileV2;
      if (!current) return;
      const merged = mergeMemoryIntoProfile(current, readMemory());
      root.hgKnowledgeProfileV2 = merged;
      renderOverview(merged);
    });
    return true;
  }

  const api = {
    STORAGE_KEY,
    readMemory,
    bundleEntries,
    mergeMemoryIntoProfile,
    memorySummary,
    renderOverview,
    install
  };

  install();
  return api;
});