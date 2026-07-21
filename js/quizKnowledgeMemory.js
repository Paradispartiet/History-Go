// js/quizKnowledgeMemory.js
// Kompatibilitetslag mellom eksisterende quizgenerasjoner og Knowledge-minnekammeret.
// Endrer ikke spørsmålsviseren. Lytter til hg:quizCompleted og kobler seg til sluttoppsummeringen.

(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) {
    root.HGQuizKnowledgeMemory = api;
    root.buildQuizKnowledgeBundle = api.buildQuizKnowledgeBundle;
  }
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  const STORAGE_KEY = "hg_knowledge_memory_v1";
  const SCHEMA = "hg_knowledge_memory_v1";
  const MANIFEST_PATH = "data/quiz/manifest.json";
  const ClaimCore = root?.HGKnowledgeV2?.claimCore;
  if (!ClaimCore) throw new Error("HGKnowledgeV2 must load before quizKnowledgeMemory.js");
  const fetchCache = new Map();
  let pendingBundle = null;
  let summaryObserver = null;

  function text(value) {
    return String(value ?? "").trim();
  }

  function array(value) {
    return Array.isArray(value) ? value : [];
  }

  function unique(values) {
    return Array.from(new Set(array(values).map(text).filter(Boolean)));
  }

  function flattenValues(...values) {
    return unique(values.flatMap((value) => Array.isArray(value) ? value : [value]));
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function stableId(...parts) {
    return parts.map(text).filter(Boolean).join("::");
  }

  function valueText(value) {
    if (typeof value === "string" || typeof value === "number") return text(value);
    if (!value || typeof value !== "object") return "";
    return text(
      value.text || value.knowledge || value.fact || value.fun_fact || value.funFact ||
      value.summary || value.description || value.desc || value.title || value.name || value.label
    );
  }

  function normalizeNamedRows(value, kind, origin) {
    const rows = Array.isArray(value) ? value : (value == null ? [] : [value]);
    return rows.map((item, index) => {
      const itemText = valueText(item);
      if (!itemText) return null;
      const raw = item && typeof item === "object" ? item : {};
      return {
        id: text(raw.id || raw.key || raw.slug) || stableId(origin, kind, index + 1),
        kind,
        title: text(raw.title || raw.name || raw.label),
        text: itemText,
        target_id: text(raw.targetId || raw.target_id || raw.placeId || raw.place_id || raw.personId || raw.person_id),
        year: raw.year ?? null,
        tags: flattenValues(raw.tags),
        source: normalizeSources(raw.source || raw.sources),
        origin
      };
    }).filter(Boolean);
  }

  function normalizeSources(value) {
    const rows = Array.isArray(value) ? value : (value == null ? [] : [value]);
    const seen = new Set();
    const out = [];
    rows.forEach((item) => {
      let row = null;
      if (typeof item === "string") {
        row = { name: text(item), type: "source", url: "", role: "" };
      } else if (item && typeof item === "object") {
        row = {
          name: text(item.name || item.title || item.label || item.url),
          type: text(item.type || "source"),
          url: text(item.url || item.href),
          role: text(item.role || item.note || item.description)
        };
      }
      if (!row || (!row.name && !row.url)) return;
      const key = stableId(row.type, row.name, row.url);
      if (seen.has(key)) return;
      seen.add(key);
      out.push(row);
    });
    return out;
  }

  function mergeNamedRows(...groups) {
    const map = new Map();
    groups.flat().filter(Boolean).forEach((row) => {
      const key = text(row.id) || stableId(row.kind, row.title, row.text);
      if (!key) return;
      if (!map.has(key)) map.set(key, row);
    });
    return Array.from(map.values());
  }

  function inferKnowledgeKind(question) {
    return ClaimCore.inferKind(question);
  }

  function buildCorrectQuestionKeys(result) {
    const keys = new Set();
    array(result?.correctAnswers).forEach((row) => {
      const q = text(row?.question);
      const answer = text(row?.answer || row?.correctAnswer);
      if (q) keys.add(stableId(q, answer));
      if (q) keys.add(q);
    });
    array(result?.answers).forEach((row) => {
      if (row?.correct !== true) return;
      const questionId = text(row?.question_id || row?.questionId || row?.quiz_id || row?.quizId);
      const q = text(row?.question);
      const answer = text(row?.correct_answer || row?.correctAnswer || row?.answer);
      if (questionId) keys.add(questionId);
      if (q) keys.add(stableId(q, answer));
      if (q) keys.add(q);
    });
    return keys;
  }

  function questionWasCorrect(question, correctKeys, result, index) {
    const id = text(question?.quiz_id || question?.quizId || question?.id);
    const q = text(question?.question || question?.text);
    const answer = text(question?.answer);
    if (id && correctKeys.has(id)) return true;
    if (q && correctKeys.has(stableId(q, answer))) return true;
    if (q && correctKeys.has(q)) return true;
    if (array(result?.answers)[index]?.correct === true) return true;
    return false;
  }

  function normalizeQuestionTrivia(question, origin) {
    return normalizeNamedRows(question?.trivia, "fun_fact", origin);
  }

  function buildKnowledgeUnit(question, index, correctKeys, result, context) {
    const questionId = text(question?.quiz_id || question?.quizId || question?.id) || stableId(context.setId, "q", index + 1);
    const correct = questionWasCorrect(question, correctKeys, result, index);
    const emneIds = flattenValues(question?.emne_id, question?.emne_ids, question?.related_emner, question?.related_emnes);
    const concepts = flattenValues(question?.core_concepts, question?.concept_ids);
    const conceptFocus = flattenValues(question?.concept_focus);
    const terms = flattenValues(question?.term_ids, question?.terminology, question?.terminologi);
    const people = flattenValues(question?.personId, question?.person_id, question?.theorist_names, question?.related_people);
    const events = flattenValues(question?.event_ids, question?.related_events);
    const methods = flattenValues(question?.method_id, question?.guidance_basis?.method_id);
    const stories = flattenValues(question?.story_ids, question?.related_stories);
    const knowledgeText = ClaimCore.extractQuizClaims(question).join(" ");

    return {
      unit_id: questionId,
      kind: inferKnowledgeKind(question),
      subject_id: context.categoryId,
      target_id: context.targetId,
      set_id: context.setId,
      question: text(question?.question || question?.text),
      answer: text(question?.answer),
      text: knowledgeText,
      topic: text(question?.topic),
      dimension: text(question?.dimension),
      question_type: text(question?.question_type),
      question_family: text(question?.question_family),
      question_layer: text(question?.question_layer),
      year: question?.year ?? null,
      epoke_id: text(question?.epoke_id),
      emne_ids: emneIds,
      concepts,
      concept_focus: conceptFocus,
      terms,
      people,
      events,
      methods,
      stories,
      theory_focus: flattenValues(question?.theory_focus),
      tags: flattenValues(question?.tags),
      sources: normalizeSources(question?.source || question?.sources),
      claim_basis: text(question?.claim_basis),
      source_note: text(question?.source_note),
      trivia: normalizeQuestionTrivia(question, questionId),
      assessment: {
        correct,
        state: correct ? "mastered" : "needs_review"
      },
      reading: {
        state: "collected"
      }
    };
  }

  function profileSnapshotRows(setData) {
    const snapshot = setData?.profile_snapshot;
    if (!snapshot || typeof snapshot !== "object") return [];
    const rows = [];
    Object.entries(snapshot).forEach(([key, value]) => {
      if (typeof value === "string" && text(value)) {
        rows.push({ id: stableId("profile_snapshot", key), kind: "profile", title: key, text: text(value), tags: [], source: [], origin: "profile_snapshot" });
      }
    });
    return rows;
  }

  function collectTopLevelMaterial(setData) {
    const ext = setData?.source_profile_extensions || {};
    return {
      funFacts: mergeNamedRows(
        normalizeNamedRows(setData?.fun_facts, "fun_fact", "fun_facts"),
        normalizeNamedRows(setData?.funFacts, "fun_fact", "funFacts"),
        normalizeNamedRows(ext?.fun_facts, "fun_fact", "source_profile_extensions.fun_facts"),
        normalizeNamedRows(ext?.funFacts, "fun_fact", "source_profile_extensions.funFacts")
      ),
      stories: mergeNamedRows(
        normalizeNamedRows(setData?.stories, "story", "stories"),
        normalizeNamedRows(ext?.stories, "story", "source_profile_extensions.stories")
      ),
      people: mergeNamedRows(
        normalizeNamedRows(setData?.related_people, "person", "related_people"),
        normalizeNamedRows(ext?.related_people, "person", "source_profile_extensions.related_people")
      ),
      events: mergeNamedRows(
        normalizeNamedRows(setData?.related_events, "event", "related_events"),
        normalizeNamedRows(ext?.related_events, "event", "source_profile_extensions.related_events")
      ),
      institutions: mergeNamedRows(
        normalizeNamedRows(setData?.institutions, "institution", "institutions"),
        normalizeNamedRows(ext?.institutions, "institution", "source_profile_extensions.institutions")
      ),
      artifacts: mergeNamedRows(
        normalizeNamedRows(setData?.artifacts, "artifact", "artifacts"),
        normalizeNamedRows(ext?.artifacts, "artifact", "source_profile_extensions.artifacts")
      ),
      buildingStories: mergeNamedRows(
        normalizeNamedRows(setData?.building_stories, "building_story", "building_stories"),
        normalizeNamedRows(ext?.building_stories, "building_story", "source_profile_extensions.building_stories")
      ),
      conflicts: mergeNamedRows(
        normalizeNamedRows(setData?.local_conflicts, "conflict", "local_conflicts"),
        normalizeNamedRows(ext?.local_conflicts, "conflict", "source_profile_extensions.local_conflicts")
      ),
      profiles: profileSnapshotRows(setData)
    };
  }

  function splitUnit(unit) {
    const claims = ClaimCore.extractTextClaims(unit?.text, { question: unit?.question, answer: unit?.answer });
    if (!claims.length) return [];
    const kind = ClaimCore.inferKind(unit);
    const currentId = text(unit?.unit_id || unit?.id || "knowledge_unit");
    const sourceId = text(unit?.source_question_id || currentId);
    return claims.map((claim, index) => {
      const next = { ...unit };
      delete next.question;
      delete next.answer;
      delete next.trivia;
      next.unit_id = claims.length === 1 ? currentId : `${sourceId}::claim::${index + 1}`;
      next.source_question_id = sourceId;
      next.kind = kind;
      next.topic = ClaimCore.cleanTopic(unit?.topic, kind);
      next.text = claim;
      next.quality = { version: 2, source: "canonical_quiz_builder", split_from_question: claims.length > 1 };
      return next;
    });
  }

  function mergeAssessment(a, b) {
    const mastered = a?.state === "mastered" || b?.state === "mastered" || a?.correct === true || b?.correct === true;
    return { ...(a || {}), ...(b || {}), correct: mastered, state: mastered ? "mastered" : (a?.state || b?.state || "needs_review") };
  }

  function dedupeUnits(units) {
    const map = new Map();
    array(units).forEach((unit) => {
      const key = ClaimCore.normalized(unit?.text);
      if (!key) return;
      const previous = map.get(key);
      if (!previous) return map.set(key, unit);
      for (const field of ["emne_ids", "concepts", "concept_focus", "terms", "tags"]) {
        previous[field] = unique([...(previous[field] || []), ...(unit[field] || [])]);
      }
      previous.sources = array(previous.sources).concat(array(unit.sources));
      previous.assessment = mergeAssessment(previous.assessment, unit.assessment);
    });
    return Array.from(map.values());
  }

  function sanitizeFunFacts(items, blocked) {
    const output = [];
    array(items).forEach((item, itemIndex) => {
      ClaimCore.splitClaims(item?.text || item).forEach((claim, claimIndex) => {
        const key = ClaimCore.normalized(claim);
        if (!key || blocked.has(key)) return;
        blocked.add(key);
        const raw = item && typeof item === "object" ? item : {};
        output.push({ ...raw, id: text(raw.id) || `fun_fact_${itemIndex + 1}_${claimIndex + 1}`, kind: "fun_fact", text: claim });
      });
    });
    return output;
  }

  function rebuildBundleIndexes(bundle) {
    const units = array(bundle?.knowledge_units);
    bundle.indexes = {
      ...(bundle.indexes || {}),
      emne_ids: unique(units.flatMap((unit) => array(unit?.emne_ids))),
      concepts: unique(units.flatMap((unit) => array(unit?.concepts))),
      concept_focus: unique(units.flatMap((unit) => array(unit?.concept_focus))),
      terms: unique(units.flatMap((unit) => array(unit?.terms))),
      people: unique(units.flatMap((unit) => array(unit?.people))),
      events: unique(units.flatMap((unit) => array(unit?.events))),
      methods: unique(units.flatMap((unit) => array(unit?.methods))),
      stories: unique(units.flatMap((unit) => array(unit?.stories)))
    };
    return bundle;
  }

  function sanitizeBundle(bundle) {
    if (!bundle || typeof bundle !== "object") return bundle;
    if (bundle?.content_quality?.version === 2 && array(bundle.knowledge_units).every((unit) => unit?.quality?.version === 2)) return bundle;
    const original = array(bundle.knowledge_units);
    const knowledgeUnits = dedupeUnits(original.flatMap(splitUnit));
    const blocked = new Set(knowledgeUnits.map((unit) => ClaimCore.normalized(unit.text)));
    return rebuildBundleIndexes({
      ...bundle,
      knowledge_units: knowledgeUnits,
      fun_facts: sanitizeFunFacts(bundle.fun_facts, blocked),
      content_quality: {
        version: 2,
        original_unit_count: original.length,
        precise_unit_count: knowledgeUnits.length,
        removed_or_merged_count: Math.max(0, original.length - knowledgeUnits.length),
        automatic_storage: true,
        canonical_builder: true
      }
    });
  }

  function buildQuizKnowledgeBundle(input = {}) {
    const questions = array(input.questions || input.setBlock?.questions);
    const result = input.result || {};
    const correctKeys = buildCorrectQuestionKeys(result);
    const targetId = text(input.targetId || input.setData?.targetId || questions[0]?.targetId || questions[0]?.placeId || questions[0]?.personId);
    const categoryId = text(input.categoryId || input.setData?.categoryId || questions[0]?.categoryId || questions[0]?.category_id);
    const setId = text(input.setId || input.setBlock?.set_id || result?.setId || result?.set_id || targetId);
    const sourceFile = text(input.sourceFile);
    const top = collectTopLevelMaterial(input.setData || {});
    const units = questions.map((question, index) => buildKnowledgeUnit(question, index, correctKeys, result, { targetId, categoryId, setId }));
    const unitTrivia = mergeNamedRows(...units.map((unit) => unit.trivia));
    const concepts = unique(units.flatMap((unit) => unit.concepts));
    const conceptFocus = unique(units.flatMap((unit) => unit.concept_focus));
    const terms = unique(units.flatMap((unit) => unit.terms));
    const emneIds = unique(units.flatMap((unit) => unit.emne_ids));
    const people = unique(units.flatMap((unit) => unit.people));
    const events = unique(units.flatMap((unit) => unit.events));
    const methods = unique(units.flatMap((unit) => unit.methods));
    const stories = unique(units.flatMap((unit) => unit.stories));
    const sources = normalizeSources(units.flatMap((unit) => unit.sources));
    const correctCount = Number.isFinite(Number(result?.correct)) ? Number(result.correct) : units.filter((unit) => unit.assessment.correct).length;
    const total = Number.isFinite(Number(result?.total)) ? Number(result.total) : units.length;
    const now = new Date().toISOString();

    return sanitizeBundle({
      schema: SCHEMA,
      bundle_id: stableId(targetId, setId),
      target_id: targetId,
      subject_id: categoryId,
      set_id: setId,
      set_title: text(input.setBlock?.title || input.setBlock?.name || input.setBlock?.label),
      source_file: sourceFile,
      collected_at: now,
      updated_at: now,
      result: {
        correct: correctCount,
        total,
        percent: total > 0 ? Math.round((correctCount / total) * 100) : null
      },
      reading: {
        state: "collected",
        presented_at: null,
        read_at: null
      },
      knowledge_units: units,
      fun_facts: mergeNamedRows(top.funFacts, unitTrivia),
      stories: top.stories,
      people: top.people,
      events: top.events,
      institutions: top.institutions,
      artifacts: top.artifacts,
      building_stories: top.buildingStories,
      conflicts: top.conflicts,
      profile_material: top.profiles,
      indexes: {
        emne_ids: emneIds,
        concepts,
        concept_focus: conceptFocus,
        terms,
        people,
        events,
        methods,
        stories,
        sources
      }
    });
  }

  function emptyMemory() {
    return {
      schema: SCHEMA,
      updated_at: null,
      bundles: {},
      indexes: {
        by_subject: {},
        by_target: {},
        by_emne: {},
        by_concept: {},
        mastered: [],
        needs_review: []
      }
    };
  }

  function readMemory() {
    if (!root?.localStorage) return emptyMemory();
    try {
      const parsed = JSON.parse(root.localStorage.getItem(STORAGE_KEY) || "null");
      if (!parsed || parsed.schema !== SCHEMA || !parsed.bundles) return emptyMemory();
      const next = { ...parsed, bundles: { ...parsed.bundles } };
      let changed = false;
      Object.entries(next.bundles).forEach(([bundleId, bundle]) => {
        const clean = sanitizeBundle(bundle);
        next.bundles[bundleId] = clean;
        if (JSON.stringify(clean) !== JSON.stringify(bundle)) changed = true;
      });
      rebuildIndexes(next);
      if (changed) root.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    } catch {
      return emptyMemory();
    }
  }

  function addIndex(index, key, bundleId) {
    const id = text(key);
    if (!id) return;
    if (!Array.isArray(index[id])) index[id] = [];
    if (!index[id].includes(bundleId)) index[id].push(bundleId);
  }

  function rebuildIndexes(memory) {
    const indexes = emptyMemory().indexes;
    Object.values(memory.bundles || {}).forEach((bundle) => {
      const bundleId = text(bundle?.bundle_id);
      addIndex(indexes.by_subject, bundle?.subject_id, bundleId);
      addIndex(indexes.by_target, bundle?.target_id, bundleId);
      array(bundle?.indexes?.emne_ids).forEach((id) => addIndex(indexes.by_emne, id, bundleId));
      array(bundle?.indexes?.concepts).forEach((id) => addIndex(indexes.by_concept, id, bundleId));
      array(bundle?.knowledge_units).forEach((unit) => {
        const row = { bundle_id: bundleId, unit_id: unit.unit_id, target_id: bundle.target_id, subject_id: bundle.subject_id };
        if (unit?.assessment?.state === "mastered") indexes.mastered.push(row);
        if (unit?.assessment?.state === "needs_review") indexes.needs_review.push(row);
      });
    });
    memory.indexes = indexes;
    return memory;
  }

  function saveBundle(bundle) {
    const preciseBundle = sanitizeBundle(bundle);
    if (!preciseBundle?.bundle_id) return null;
    bundle = preciseBundle;
    const memory = readMemory();
    const previous = memory.bundles[bundle.bundle_id];
    memory.bundles[bundle.bundle_id] = {
      ...(previous || {}),
      ...bundle,
      reading: {
        ...(previous?.reading || {}),
        ...(bundle.reading || {})
      },
      updated_at: new Date().toISOString()
    };
    memory.updated_at = new Date().toISOString();
    rebuildIndexes(memory);
    try { root.localStorage?.setItem(STORAGE_KEY, JSON.stringify(memory)); } catch {}
    try { root.dispatchEvent?.(new CustomEvent("hg:knowledgeMemoryUpdated", { detail: { bundle_id: bundle.bundle_id } })); } catch {}
    return memory.bundles[bundle.bundle_id];
  }

  function updateReadingState(bundleId, state) {
    const memory = readMemory();
    const bundle = memory.bundles[bundleId];
    if (!bundle) return null;
    const now = new Date().toISOString();
    bundle.reading = bundle.reading || {};
    bundle.reading.state = state;
    if (state === "presented" && !bundle.reading.presented_at) bundle.reading.presented_at = now;
    if (state === "read") {
      bundle.reading.presented_at = bundle.reading.presented_at || now;
      bundle.reading.read_at = now;
    }
    array(bundle.knowledge_units).forEach((unit) => {
      unit.reading = unit.reading || {};
      unit.reading.state = state;
    });
    bundle.updated_at = now;
    memory.updated_at = now;
    try { root.localStorage?.setItem(STORAGE_KEY, JSON.stringify(memory)); } catch {}
    return bundle;
  }

  async function fetchJson(path) {
    const url = new URL(text(path), root.document?.baseURI || root.location?.href || "http://localhost/").toString();
    if (fetchCache.has(url)) return fetchCache.get(url);
    const promise = root.fetch(url, { cache: "no-store" }).then((response) => {
      if (!response.ok) throw new Error(`${response.status} ${url}`);
      return response.json();
    });
    fetchCache.set(url, promise);
    return promise;
  }

  async function resolveSetContext(detail) {
    const targetId = text(detail?.targetId || detail?.placeId || detail?.quizId?.split?.("::")?.[0]);
    const compositeQuizId = text(detail?.quizId);
    const setId = compositeQuizId.includes("::") ? compositeQuizId.split("::").slice(1).join("::") : "";
    const manifest = await fetchJson(MANIFEST_PATH);
    const entries = array(manifest?.sets);

    for (const entry of entries) {
      if (targetId && text(entry?.targetId) !== targetId) continue;
      if (setId && entry?.set_id && text(entry.set_id) !== setId) continue;
      const setData = await fetchJson(entry.file);
      const block = array(setData?.sets).find((item) => text(item?.set_id) === (setId || text(entry?.set_id)));
      if (!block) continue;
      return { targetId, setId: text(block.set_id), sourceFile: text(entry.file), setData, setBlock: block, questions: array(block.questions) };
    }

    for (const entry of entries) {
      if (targetId && text(entry?.targetId) !== targetId) continue;
      const setData = await fetchJson(entry.file);
      const block = array(setData?.sets).find((item) => !setId || text(item?.set_id) === setId);
      if (block) return { targetId, setId: text(block.set_id), sourceFile: text(entry.file), setData, setBlock: block, questions: array(block.questions) };
    }

    return resolveLegacyContext(detail, manifest, targetId);
  }

  async function resolveLegacyContext(detail, manifest, targetId) {
    for (const file of array(manifest?.files)) {
      const data = await fetchJson(file);
      if (!Array.isArray(data)) continue;
      const questions = data.filter((question) => text(question?.targetId || question?.placeId || question?.personId) === targetId);
      if (!questions.length) continue;
      return { targetId, setId: text(detail?.quizId || targetId), sourceFile: text(file), setData: null, setBlock: null, questions };
    }
    return { targetId, setId: text(detail?.quizId || targetId), sourceFile: "", setData: null, setBlock: null, questions: [] };
  }

  function latestResult(detail) {
    let rows = [];
    try { rows = JSON.parse(root.localStorage?.getItem("hg_learning_log_v1") || "[]"); } catch {}
    const quizId = text(detail?.quizId);
    const targetId = text(detail?.targetId || detail?.placeId);
    const matching = array(rows).filter((row) =>
      text(row?.id) === quizId ||
      text(row?.targetId) === quizId ||
      (targetId && text(row?.parentTargetId) === targetId && (!quizId || quizId.endsWith(text(row?.setId))))
    );
    const row = matching[matching.length - 1] || {};
    return {
      correct: Number.isFinite(Number(detail?.correct)) ? Number(detail.correct) : Number(row?.correctCount || 0),
      total: Number.isFinite(Number(detail?.total)) ? Number(detail.total) : Number(row?.total || 0),
      correctAnswers: array(row?.correctAnswers),
      answers: array(row?.answers),
      setId: text(row?.setId),
      completed_at: row?.date || null
    };
  }

  function renderChips(values) {
    const list = unique(values).slice(0, 18);
    if (!list.length) return "";
    return `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">${list.map((item) => `<span style="border:1px solid rgba(255,255,255,.2);border-radius:999px;padding:4px 8px;font-size:.78rem">${escapeHtml(item)}</span>`).join("")}</div>`;
  }

  function knowledgePopupHtml(bundle) {
    const units = array(bundle?.knowledge_units);
    const facts = array(bundle?.fun_facts);
    const stories = array(bundle?.stories);
    const mastered = units.filter((unit) => unit?.assessment?.state === "mastered").length;
    const review = units.filter((unit) => unit?.assessment?.state === "needs_review").length;
    const unitHtml = units.map((unit) => `
      <article style="padding:11px 0;border-bottom:1px solid rgba(255,255,255,.12)">
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start">
          <strong>${escapeHtml(unit.topic || unit.dimension || unit.question || "Kunnskap")}</strong>
          <small style="white-space:nowrap">${unit.assessment.state === "mastered" ? "Mestret" : "Til repetisjon"}</small>
        </div>
        ${unit.text ? `<p style="margin:6px 0 0;line-height:1.45">${escapeHtml(unit.text)}</p>` : ""}
        ${renderChips([...unit.emne_ids, ...unit.concepts, ...unit.concept_focus, ...unit.terms])}
      </article>`).join("");
    const factHtml = facts.length ? `<section style="margin-top:18px"><h3 style="margin:0 0 6px">Funfacts og trivia</h3>${facts.map((row) => `<p style="margin:6px 0">• ${escapeHtml(row.text)}</p>`).join("")}</section>` : "";
    const storyHtml = stories.length ? `<section style="margin-top:18px"><h3 style="margin:0 0 6px">Historier</h3>${stories.map((row) => `<p style="margin:6px 0">• ${escapeHtml(row.text)}</p>`).join("")}</section>` : "";

    return `
      <div class="modal-body" style="max-height:min(86vh,900px);overflow:hidden">
        <div class="modal-head">
          <div><small class="muted">Knowledge-minnekammer</small><strong style="display:block">${escapeHtml(bundle.set_title || bundle.target_id || "Kunnskapen du samlet")}</strong></div>
          <button class="ghost" id="quizKnowledgeMemoryClose">Lukk</button>
        </div>
        <div class="sheet-body" style="overflow:auto;max-height:68vh">
          <p class="muted" style="margin-top:0">${mastered} mestret • ${review} til repetisjon • ${units.length} kunnskapspunkter</p>
          ${unitHtml || `<p>Ingen strukturerte kunnskapspunkter ble funnet i denne eldre quizfila.</p>`}
          ${factHtml}
          ${storyHtml}
          <section style="margin-top:18px">
            <h3 style="margin:0 0 6px">Begreper og emner</h3>
            ${renderChips([...(bundle.indexes?.emne_ids || []), ...(bundle.indexes?.concepts || []), ...(bundle.indexes?.concept_focus || []), ...(bundle.indexes?.terms || [])]) || "<p class=\"muted\">Ingen emner eller begreper registrert.</p>"}
          </section>
        </div>
      </div>`;
  }

  function closeKnowledgePopup() {
    root.document?.getElementById("quizKnowledgeMemoryModal")?.remove();
  }

  function openKnowledgePopup(bundleOrId) {
    if (!root.document) return null;
    const memory = readMemory();
    const bundle = typeof bundleOrId === "string" ? memory.bundles[bundleOrId] : bundleOrId;
    if (!bundle) return null;
    closeKnowledgePopup();
    const modal = root.document.createElement("div");
    modal.id = "quizKnowledgeMemoryModal";
    modal.className = "modal";
    modal.style.display = "flex";
    modal.innerHTML = knowledgePopupHtml(bundle);
    root.document.body.appendChild(modal);
    updateReadingState(bundle.bundle_id, "presented");
    modal.querySelector("#quizKnowledgeMemoryClose").onclick = closeKnowledgePopup;
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeKnowledgePopup();
    });
    return modal;
  }

  function attachBundleToSummary(bundle) {
    if (!root.document || !bundle) return false;
    const modal = root.document.getElementById("quizSummaryModal");
    if (!modal) return false;
    const primary = modal.querySelector("#quizSummaryPrimary");
    const actions = primary?.parentElement;
    if (!actions) return false;
    let button = modal.querySelector("#quizSummaryKnowledge");
    if (!button) {
      button = root.document.createElement("button");
      button.id = "quizSummaryKnowledge";
      button.className = "ghost";
      actions.insertBefore(button, primary);
    }
    button.textContent = `Kunnskapen du samlet (${bundle.knowledge_units.length})`;
    button.onclick = () => openKnowledgePopup(bundle.bundle_id);
    const meta = modal.querySelector("#quizSummaryMeta");
    if (meta && !modal.querySelector("#quizSummaryKnowledgeLine")) {
      const line = root.document.createElement("div");
      line.id = "quizSummaryKnowledgeLine";
      line.className = "muted";
      line.style.margin = "-6px 0 14px";
      line.textContent = `${bundle.knowledge_units.length} kunnskapspunkter er samlet i Knowledge-minnekammeret.`;
      meta.insertAdjacentElement("afterend", line);
    }
    return true;
  }

  function watchForSummary() {
    if (!root.document || summaryObserver) return;
    summaryObserver = new MutationObserver(() => {
      if (pendingBundle && attachBundleToSummary(pendingBundle)) pendingBundle = null;
    });
    summaryObserver.observe(root.document.documentElement, { childList: true, subtree: true });
  }

  async function captureCompletion(detail = {}) {
    try {
      const context = await resolveSetContext(detail);
      const result = latestResult(detail);
      const bundle = buildQuizKnowledgeBundle({
        targetId: context.targetId,
        categoryId: text(detail?.categoryId || detail?.domain || context.setData?.categoryId),
        setId: context.setId,
        sourceFile: context.sourceFile,
        setData: context.setData,
        setBlock: context.setBlock,
        questions: context.questions,
        result
      });
      const saved = saveBundle(bundle);
      pendingBundle = saved;
      if (attachBundleToSummary(saved)) pendingBundle = null;
      return saved;
    } catch (error) {
      if (root.DEBUG) console.warn("[HGQuizKnowledgeMemory] capture failed", error, detail);
      return null;
    }
  }

  function initBrowserIntegration() {
    if (!root?.addEventListener || !root.document || !root.fetch) return;
    watchForSummary();
    root.addEventListener("hg:quizCompleted", (event) => captureCompletion(event.detail || {}));
  }

  const api = {
    STORAGE_KEY,
    SCHEMA,
    buildQuizKnowledgeBundle,
    saveBundle,
    readMemory,
    rebuildIndexes,
    updateReadingState,
    openKnowledgePopup,
    attachBundleToSummary,
    captureCompletion,
    sanitizeBundle,
    initBrowserIntegration
  };

  initBrowserIntegration();
  return api;
});
