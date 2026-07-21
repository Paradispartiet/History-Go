(() => {
  // js/knowledgeClaimCore.ts
  function record(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }
  function text(value) {
    return String(value == null ? "" : value).trim();
  }
  function array(value) {
    return Array.isArray(value) ? value : [];
  }
  function unique(values) {
    return Array.from(new Set(values.map(text).filter(Boolean)));
  }
  function normalized(value) {
    return text(value).toLocaleLowerCase("nb").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9æøå]+/gi, " ").replace(/\s+/g, " ").trim();
  }
  function wordOverlap(a, b) {
    const aa = new Set(normalized(a).split(" ").filter((word) => word.length > 1));
    const bb = new Set(normalized(b).split(" ").filter((word) => word.length > 1));
    if (!aa.size || !bb.size) return 0;
    let common = 0;
    aa.forEach((word) => {
      if (bb.has(word)) common += 1;
    });
    return common / Math.min(aa.size, bb.size);
  }
  function splitClaims(value) {
    const raw = text(value).replace(/\r\n?/g, "\n").replace(/\n[•·*-]?\s*/g, ". ").trim();
    if (!raw) return [];
    return unique(raw.split(/(?<=[.!?])\s+|;\s+(?=[A-ZÆØÅ0-9])/u).map((claim) => text(claim).replace(/^[•·*-]+\s*/, "").replace(/^(kunnskap|forklaring|fakta?|fact)\s*:\s*/i, "").replace(/\s+/g, " ")).filter((claim) => claim.length >= 8));
  }
  function isQuestion(value) {
    return /[?]\s*$/.test(text(value));
  }
  function isQuestionOrAnswerCopy(claim, context = {}) {
    const candidate = normalized(claim);
    const question = normalized(context.question);
    const answer = normalized(context.answer);
    if (!candidate || candidate === "ingen forklaring registrert") return true;
    if (isQuestion(claim)) return true;
    if (/^(riktig svar|svaret er|du svarte|spørsmålet er|spørsmålet viser)\b/.test(candidate)) return true;
    if (question && candidate === question || answer && candidate === answer) return true;
    const candidateWords = candidate.split(" ").filter(Boolean).length;
    const answerWords = answer.split(" ").filter(Boolean).length;
    if (question && candidateWords <= 3) return true;
    if (answer && candidateWords <= answerWords + 1 && (candidate.includes(answer) || answer.includes(candidate))) return true;
    if (question) {
      const ratio = candidate.length / Math.max(1, question.length);
      if (ratio >= 0.72 && ratio <= 1.35 && wordOverlap(candidate, question) >= 0.86) return true;
    }
    return false;
  }
  function extractTextClaims(value, context = {}) {
    return splitClaims(value).filter((claim) => !isQuestionOrAnswerCopy(claim, context));
  }
  function claimSourceValues(item) {
    const payload = record(item.knowledge_payload);
    return [
      item.canonical_claim,
      payload.canonical_claim,
      payload.summary,
      payload.claims,
      item.knowledge,
      item.explanation
    ];
  }
  function sourceText(value) {
    const values = Array.isArray(value) ? value : [value];
    return values.map((item) => typeof item === "object" && item !== null ? record(item).text : item).map(text).filter(Boolean).join(" ");
  }
  function extractQuizClaims(value) {
    const item = record(value);
    for (const candidate of claimSourceValues(item)) {
      const raw = sourceText(candidate);
      if (!raw) continue;
      return extractTextClaims(raw, {
        question: item.question || item.prompt,
        answer: item.answer || item.correct_answer || item.correctAnswer
      });
    }
    return [];
  }
  function explicitConcepts(value) {
    const row = record(value);
    return unique([
      ...array(row.concepts),
      ...array(row.core_concepts),
      ...array(row.conceptIds),
      ...array(row.concept_ids),
      ...array(row.begreper)
    ]);
  }
  function explicitTerms(value) {
    const row = record(value);
    return unique([
      ...array(row.terms),
      ...array(row.term_ids),
      ...array(row.terminology),
      ...array(row.terminologi),
      ...array(row.faguttrykk)
    ]);
  }
  function explicitTags(value) {
    return unique(array(record(value).tags));
  }
  function inferKind(value) {
    const row = record(value);
    const current = normalized(row.kind);
    const type = normalized(row.question_type || row.question_family || row.dimension);
    if (/^(fact|fakta|faktum)$/.test(current) || /\b(fact|fakta|faktum)\b/.test(type)) return "fact";
    if (current && current !== "knowledge") return text(row.kind);
    if (/\b(concept|begrep|terminologi)\b/.test(type)) return "concept";
    if (/\b(method|metode)\b/.test(type)) return "method";
    if (/\b(story|historie|fortelling)\b/.test(type)) return "story";
    if (/\b(analysis|analyse|theory|teori)\b/.test(type)) return "analysis";
    if (/\b(observation|observasjon|place reading|stedslesning)\b/.test(type)) return "observation";
    return "knowledge";
  }
  function cleanTopic(value, kind = "knowledge") {
    const topic = text(value);
    if (topic && !isQuestion(topic)) return topic;
    return {
      fact: "Fakta",
      concept: "Begrep",
      method: "Metode",
      story: "Historie",
      analysis: "Sammenheng",
      observation: "Observasjon"
    }[kind] || "Kunnskap";
  }
  var claimCore = {
    text,
    array,
    unique,
    normalized,
    splitClaims,
    isQuestion,
    isQuestionOrAnswerCopy,
    extractTextClaims,
    extractQuizClaims,
    explicitConcepts,
    explicitTerms,
    explicitTags,
    inferKind,
    cleanTopic
  };
  var knowledgeClaimCore_default = claimCore;

  // js/knowledgeQuizMemory.ts
  var STORAGE_KEY = "hg_knowledge_memory_v1";
  var REVIEW_REQUEST_KEY = "hg_quiz_review_request_v1";
  var SCHEMA = "hg_knowledge_memory_v1";
  var MANIFEST_PATH = "data/quiz/manifest.json";
  var QUALITY_VERSION = 3;
  function text2(value) {
    return String(value != null ? value : "").trim();
  }
  function array2(value) {
    return Array.isArray(value) ? value : [];
  }
  function object(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }
  function unique2(values) {
    return Array.from(new Set(values.flatMap((value) => Array.isArray(value) ? value : [value]).map(text2).filter(Boolean)));
  }
  function stableId(...parts) {
    return parts.map(text2).filter(Boolean).join("::");
  }
  function escapeHtml(value) {
    return text2(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function humanize(value) {
    return text2(value).replace(/^em_[a-z]+_/i, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  }
  function valueText(value) {
    if (typeof value === "string" || typeof value === "number") return text2(value);
    const row = object(value);
    return text2(row.text || row.knowledge || row.fact || row.fun_fact || row.funFact || row.summary || row.description || row.desc || row.title || row.name || row.label);
  }
  function normalizeSources(value) {
    const seen = /* @__PURE__ */ new Set();
    const output = [];
    for (const item of Array.isArray(value) ? value : value == null ? [] : [value]) {
      const row = typeof item === "string" ? { name: text2(item), type: "source", url: "", role: "" } : {
        name: text2(object(item).name || object(item).title || object(item).label || object(item).url),
        type: text2(object(item).type || "source"),
        url: text2(object(item).url || object(item).href),
        role: text2(object(item).role || object(item).note || object(item).description)
      };
      if (!row.name && !row.url) continue;
      const key = stableId(row.type, row.name, row.url);
      if (seen.has(key)) continue;
      seen.add(key);
      output.push(row);
    }
    return output;
  }
  function normalizeNamedRows(value, kind, origin) {
    const rows = Array.isArray(value) ? value : value == null ? [] : [value];
    return rows.map((item, index) => {
      var _a;
      const raw = object(item);
      const itemText = valueText(item);
      if (!itemText) return null;
      return {
        id: text2(raw.id || raw.key || raw.slug) || stableId(origin, kind, index + 1),
        kind,
        title: text2(raw.title || raw.name || raw.label),
        text: itemText,
        target_id: text2(raw.targetId || raw.target_id || raw.placeId || raw.place_id || raw.personId || raw.person_id),
        year: (_a = raw.year) != null ? _a : null,
        tags: unique2([raw.tags]),
        source: normalizeSources(raw.source || raw.sources),
        origin
      };
    }).filter(Boolean);
  }
  function mergeNamedRows(...groups) {
    const rows = /* @__PURE__ */ new Map();
    for (const row of groups.flat().filter(Boolean)) {
      const key = text2(row.id) || stableId(row.kind, row.title, row.text);
      if (key && !rows.has(key)) rows.set(key, row);
    }
    return Array.from(rows.values());
  }
  function explicitUnitId(question, fallback) {
    return text2(
      question.primary_knowledge_unit_id || question.knowledge_unit_id || array2(question.knowledge_unit_ids)[0] || question.quiz_id || question.quizId || question.id || fallback
    );
  }
  function buildCorrectQuestionKeys(result) {
    const keys = /* @__PURE__ */ new Set();
    for (const row of array2(result.correctAnswers)) {
      const question = text2(row.question);
      const answer = text2(row.answer || row.correctAnswer);
      if (question) keys.add(question);
      if (question) keys.add(stableId(question, answer));
    }
    for (const row of array2(result.answers)) {
      if (row.correct !== true) continue;
      const id = text2(row.question_id || row.questionId || row.quiz_id || row.quizId);
      const question = text2(row.question);
      const answer = text2(row.correct_answer || row.correctAnswer || row.answer);
      if (id) keys.add(id);
      if (question) keys.add(question);
      if (question) keys.add(stableId(question, answer));
    }
    return keys;
  }
  function questionWasCorrect(question, correctKeys, result, index) {
    var _a;
    const id = text2(question.quiz_id || question.quizId || question.id);
    const prompt = text2(question.question || question.text);
    const answer = text2(question.answer);
    return !!(id && correctKeys.has(id) || prompt && correctKeys.has(prompt) || prompt && correctKeys.has(stableId(prompt, answer)) || ((_a = array2(result.answers)[index]) == null ? void 0 : _a.correct) === true);
  }
  function collectTopLevelMaterial(setDataValue) {
    const setData = object(setDataValue);
    const ext = object(setData.source_profile_extensions);
    return {
      funFacts: mergeNamedRows(
        normalizeNamedRows(setData.fun_facts, "fun_fact", "fun_facts"),
        normalizeNamedRows(setData.funFacts, "fun_fact", "funFacts"),
        normalizeNamedRows(ext.fun_facts, "fun_fact", "source_profile_extensions.fun_facts"),
        normalizeNamedRows(ext.funFacts, "fun_fact", "source_profile_extensions.funFacts")
      ),
      stories: mergeNamedRows(normalizeNamedRows(setData.stories, "story", "stories"), normalizeNamedRows(ext.stories, "story", "source_profile_extensions.stories")),
      people: mergeNamedRows(normalizeNamedRows(setData.related_people, "person", "related_people"), normalizeNamedRows(ext.related_people, "person", "source_profile_extensions.related_people")),
      events: mergeNamedRows(normalizeNamedRows(setData.related_events, "event", "related_events"), normalizeNamedRows(ext.related_events, "event", "source_profile_extensions.related_events")),
      institutions: mergeNamedRows(normalizeNamedRows(setData.institutions, "institution", "institutions"), normalizeNamedRows(ext.institutions, "institution", "source_profile_extensions.institutions")),
      artifacts: mergeNamedRows(normalizeNamedRows(setData.artifacts, "artifact", "artifacts"), normalizeNamedRows(ext.artifacts, "artifact", "source_profile_extensions.artifacts")),
      buildingStories: mergeNamedRows(normalizeNamedRows(setData.building_stories, "building_story", "building_stories"), normalizeNamedRows(ext.building_stories, "building_story", "source_profile_extensions.building_stories")),
      conflicts: mergeNamedRows(normalizeNamedRows(setData.local_conflicts, "conflict", "local_conflicts"), normalizeNamedRows(ext.local_conflicts, "conflict", "source_profile_extensions.local_conflicts"))
    };
  }
  function buildKnowledgeUnit(questionValue, index, correctKeys, result, context) {
    var _a;
    const question = object(questionValue);
    const fallbackId = stableId(context.setId, "q", index + 1);
    const unitId = explicitUnitId(question, fallbackId);
    const correct = questionWasCorrect(question, correctKeys, result, index);
    return {
      unit_id: unitId,
      source_question_id: text2(question.quiz_id || question.quizId || question.id || fallbackId),
      kind: knowledgeClaimCore_default.inferKind(question),
      subject_id: context.categoryId,
      target_id: context.targetId,
      set_id: context.setId,
      question: text2(question.question || question.text),
      answer: text2(question.answer),
      text: knowledgeClaimCore_default.extractQuizClaims(question).join(" "),
      topic: text2(question.topic),
      dimension: text2(question.dimension),
      question_type: text2(question.question_type),
      question_family: text2(question.question_family),
      question_layer: text2(question.question_layer),
      year: (_a = question.year) != null ? _a : null,
      epoke_id: text2(question.epoke_id),
      emne_ids: unique2([question.emne_id, question.emne_ids, question.related_emner, question.related_emnes]),
      concepts: unique2([question.core_concepts, question.concept_ids]),
      concept_focus: unique2([question.concept_focus]),
      terms: unique2([question.term_ids, question.terminology, question.terminologi, question.faguttrykk]),
      people: unique2([question.personId, question.person_id, question.theorist_names, question.related_people]),
      events: unique2([question.event_ids, question.related_events]),
      methods: unique2([question.method_id, object(question.guidance_basis).method_id]),
      stories: unique2([question.story_ids, question.related_stories]),
      theory_focus: unique2([question.theory_focus]),
      tags: unique2([question.tags]),
      sources: normalizeSources(question.source || question.sources),
      claim_basis: text2(question.claim_basis),
      source_note: text2(question.source_note),
      trivia: normalizeNamedRows(question.trivia, "fun_fact", unitId),
      assessment: { correct, state: correct ? "mastered" : "needs_review" },
      reading: { state: "collected" }
    };
  }
  function splitUnit(unitValue) {
    const unit = object(unitValue);
    const claims = knowledgeClaimCore_default.extractTextClaims(unit.text, { question: unit.question, answer: unit.answer });
    if (!claims.length) return [];
    const kind = knowledgeClaimCore_default.inferKind(unit);
    const currentId = text2(unit.unit_id || unit.id || "knowledge_unit");
    const sourceId = text2(unit.source_question_id || currentId);
    return claims.map((claim, index) => {
      const next = { ...unit };
      delete next.question;
      delete next.answer;
      delete next.trivia;
      next.unit_id = claims.length === 1 ? currentId : `${currentId}::claim::${index + 1}`;
      next.source_question_id = sourceId;
      next.kind = kind;
      next.topic = knowledgeClaimCore_default.cleanTopic(unit.topic, kind);
      next.text = claim;
      next.quality = { version: QUALITY_VERSION, source: "canonical_typescript_quiz_memory", split_from_question: claims.length > 1 };
      return next;
    });
  }
  function mergeAssessment(aValue, bValue) {
    const a = object(aValue);
    const b = object(bValue);
    const mastered = a.state === "mastered" || b.state === "mastered" || a.correct === true || b.correct === true;
    return { ...a, ...b, correct: mastered, state: mastered ? "mastered" : text2(a.state || b.state || "needs_review") };
  }
  function dedupeUnits(units) {
    const rows = /* @__PURE__ */ new Map();
    for (const unit of units) {
      const key = knowledgeClaimCore_default.normalized(unit.text);
      if (!key) continue;
      const previous = rows.get(key);
      if (!previous) {
        rows.set(key, unit);
        continue;
      }
      for (const field of ["emne_ids", "concepts", "concept_focus", "terms", "tags", "people", "events", "methods", "stories"]) {
        previous[field] = unique2([previous[field], unit[field]]);
      }
      previous.sources = normalizeSources([previous.sources, unit.sources].flat());
      previous.assessment = mergeAssessment(previous.assessment, unit.assessment);
    }
    return Array.from(rows.values());
  }
  function sanitizeFunFacts(items, blocked) {
    const output = [];
    array2(items).forEach((item, itemIndex) => {
      knowledgeClaimCore_default.splitClaims(object(item).text || item).forEach((claim, claimIndex) => {
        const key = knowledgeClaimCore_default.normalized(claim);
        if (!key || blocked.has(key)) return;
        blocked.add(key);
        const raw = object(item);
        output.push({ ...raw, id: text2(raw.id) || `fun_fact_${itemIndex + 1}_${claimIndex + 1}`, kind: "fun_fact", text: claim });
      });
    });
    return output;
  }
  function emptyMemory() {
    return {
      schema: SCHEMA,
      updated_at: null,
      bundles: {},
      indexes: { by_subject: {}, by_target: {}, by_emne: {}, by_concept: {}, mastered: [], needs_review: [] }
    };
  }
  function rebuildBundleIndexes(bundle) {
    const units = array2(bundle.knowledge_units);
    bundle.indexes = {
      ...object(bundle.indexes),
      emne_ids: unique2(units.flatMap((unit) => array2(unit.emne_ids))),
      concepts: unique2(units.flatMap((unit) => array2(unit.concepts))),
      concept_focus: unique2(units.flatMap((unit) => array2(unit.concept_focus))),
      terms: unique2(units.flatMap((unit) => array2(unit.terms))),
      people: unique2(units.flatMap((unit) => array2(unit.people))),
      events: unique2(units.flatMap((unit) => array2(unit.events))),
      methods: unique2(units.flatMap((unit) => array2(unit.methods))),
      stories: unique2(units.flatMap((unit) => array2(unit.stories)))
    };
    return bundle;
  }
  function sanitizeBundle(bundleValue) {
    const bundle = object(bundleValue);
    if (!Object.keys(bundle).length) return bundle;
    const original = array2(bundle.knowledge_units);
    const knowledgeUnits = dedupeUnits(original.flatMap(splitUnit));
    const blocked = new Set(knowledgeUnits.map((unit) => knowledgeClaimCore_default.normalized(unit.text)));
    return rebuildBundleIndexes({
      ...bundle,
      knowledge_units: knowledgeUnits,
      fun_facts: sanitizeFunFacts(bundle.fun_facts, blocked),
      content_quality: {
        version: QUALITY_VERSION,
        original_unit_count: original.length,
        precise_unit_count: knowledgeUnits.length,
        removed_or_merged_count: Math.max(0, original.length - knowledgeUnits.length),
        automatic_storage: true,
        canonical_builder: true,
        canonical_typescript_runtime: true
      }
    });
  }
  function buildQuizKnowledgeBundle(inputValue = {}) {
    var _a, _b, _c, _d, _e;
    const input = object(inputValue);
    const setBlock = object(input.setBlock);
    const setData = object(input.setData);
    const questions = array2(input.questions || setBlock.questions);
    const result = object(input.result);
    const correctKeys = buildCorrectQuestionKeys(result);
    const targetId = text2(input.targetId || setData.targetId || ((_a = questions[0]) == null ? void 0 : _a.targetId) || ((_b = questions[0]) == null ? void 0 : _b.placeId) || ((_c = questions[0]) == null ? void 0 : _c.personId));
    const categoryId = text2(input.categoryId || setData.categoryId || ((_d = questions[0]) == null ? void 0 : _d.categoryId) || ((_e = questions[0]) == null ? void 0 : _e.category_id));
    const setId = text2(input.setId || setBlock.set_id || result.setId || result.set_id || targetId);
    const top = collectTopLevelMaterial(setData);
    const units = questions.map((question, index) => buildKnowledgeUnit(question, index, correctKeys, result, { targetId, categoryId, setId }));
    const unitTrivia = mergeNamedRows(...units.map((unit) => array2(unit.trivia)));
    const correctCount = Number.isFinite(Number(result.correct)) ? Number(result.correct) : units.filter((unit) => unit.assessment.correct).length;
    const total = Number.isFinite(Number(result.total)) ? Number(result.total) : units.length;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    return sanitizeBundle({
      schema: SCHEMA,
      bundle_id: stableId(targetId, setId),
      target_id: targetId,
      subject_id: categoryId,
      set_id: setId,
      set_title: text2(setBlock.title || setBlock.name || setBlock.label),
      source_file: text2(input.sourceFile),
      collected_at: now,
      updated_at: now,
      result: { correct: correctCount, total, percent: total > 0 ? Math.round(correctCount / total * 100) : null },
      reading: { state: "collected", presented_at: null, read_at: null },
      knowledge_units: units,
      fun_facts: mergeNamedRows(top.funFacts, unitTrivia),
      stories: top.stories,
      people: top.people,
      events: top.events,
      institutions: top.institutions,
      artifacts: top.artifacts,
      building_stories: top.buildingStories,
      conflicts: top.conflicts
    });
  }
  function createQuizKnowledgeMemory({ root: root2, upsertEntry: upsertEntry2, normalizeSubjectId: normalizeSubjectId2 }) {
    const fetchCache = /* @__PURE__ */ new Map();
    let pendingBundle = null;
    let summaryObserver = null;
    function addIndex(index, keyValue, bundleId) {
      const key = text2(keyValue);
      if (!key) return;
      if (!Array.isArray(index[key])) index[key] = [];
      if (!index[key].includes(bundleId)) index[key].push(bundleId);
    }
    function rebuildIndexes(memory) {
      var _a, _b;
      const indexes = emptyMemory().indexes;
      for (const bundle of Object.values(object(memory.bundles))) {
        const bundleId = text2(bundle.bundle_id);
        addIndex(indexes.by_subject, bundle.subject_id, bundleId);
        addIndex(indexes.by_target, bundle.target_id, bundleId);
        array2((_a = bundle.indexes) == null ? void 0 : _a.emne_ids).forEach((id) => addIndex(indexes.by_emne, id, bundleId));
        array2((_b = bundle.indexes) == null ? void 0 : _b.concepts).forEach((id) => addIndex(indexes.by_concept, id, bundleId));
        array2(bundle.knowledge_units).forEach((unit) => {
          var _a2, _b2;
          const row = { bundle_id: bundleId, unit_id: unit.unit_id, target_id: bundle.target_id, subject_id: bundle.subject_id };
          if (((_a2 = unit.assessment) == null ? void 0 : _a2.state) === "mastered") indexes.mastered.push(row);
          if (((_b2 = unit.assessment) == null ? void 0 : _b2.state) === "needs_review") indexes.needs_review.push(row);
        });
      }
      memory.indexes = indexes;
      return memory;
    }
    function readMemory() {
      if (!root2.localStorage) return emptyMemory();
      try {
        const parsed = JSON.parse(root2.localStorage.getItem(STORAGE_KEY) || "null");
        if (!parsed || parsed.schema !== SCHEMA || !parsed.bundles) return emptyMemory();
        const next = { ...parsed, bundles: { ...parsed.bundles } };
        let changed = false;
        for (const [bundleId, bundle] of Object.entries(next.bundles)) {
          const clean = sanitizeBundle(bundle);
          next.bundles[bundleId] = clean;
          if (JSON.stringify(clean) !== JSON.stringify(bundle)) changed = true;
        }
        rebuildIndexes(next);
        if (changed) root2.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      } catch {
        return emptyMemory();
      }
    }
    function sourceFor(bundle, extra = {}) {
      return { type: "quiz_memory", target_id: text2(bundle.target_id), quiz_id: text2(bundle.set_id), source_file: text2(bundle.source_file), ...extra };
    }
    function unitEntry(bundle, unit) {
      var _a, _b, _c, _d;
      const unitId = text2(unit.unit_id || unit.id);
      const emneIds = unique2([unit.emne_ids]);
      return {
        schema: "history_go_knowledge_entry_v2",
        version: 2,
        id: `quiz_memory::${text2(bundle.bundle_id)}::${unitId}`,
        subject_id: normalizeSubjectId2(bundle.subject_id),
        fagkart_category_id: normalizeSubjectId2(bundle.subject_id),
        emne_ids: emneIds,
        concepts: unique2([unit.concepts, unit.concept_focus]),
        terms: unique2([unit.terms]),
        tags: unique2([unit.tags]),
        kind: text2(unit.kind || "knowledge"),
        dimension: text2(unit.dimension || unit.kind || "kunnskap"),
        topic: knowledgeClaimCore_default.cleanTopic(unit.topic || unit.question_family || unit.question_type, unit.kind),
        text: text2(unit.text),
        source: sourceFor(bundle, { unit_id: unitId }),
        learned_at: bundle.collected_at || null,
        last_seen_at: bundle.updated_at || bundle.collected_at || null,
        times_seen: 1,
        link_status: emneIds.length ? "explicit_quiz_memory" : "quiz_memory_unresolved",
        memory_kind: text2(unit.kind || "knowledge"),
        memory_evidence: {
          bundle_id: text2(bundle.bundle_id),
          unit_id: unitId,
          reading_state: text2(((_a = unit.reading) == null ? void 0 : _a.state) || ((_b = bundle.reading) == null ? void 0 : _b.state) || "collected"),
          assessment_state: text2((_c = unit.assessment) == null ? void 0 : _c.state),
          correct: ((_d = unit.assessment) == null ? void 0 : _d.correct) === true
        }
      };
    }
    function materialEntry(bundle, item, kind, index) {
      var _a;
      const itemId = text2(item.id) || `${kind}_${index + 1}`;
      return {
        schema: "history_go_knowledge_entry_v2",
        version: 2,
        id: `quiz_memory::${text2(bundle.bundle_id)}::${kind}::${itemId}`,
        subject_id: normalizeSubjectId2(bundle.subject_id),
        fagkart_category_id: normalizeSubjectId2(bundle.subject_id),
        emne_ids: [],
        concepts: [],
        terms: [],
        tags: unique2([item.tags]),
        kind,
        dimension: kind,
        topic: text2(item.title || humanize(kind) || "Kunnskap"),
        text: text2(item.text),
        source: sourceFor(bundle, { material_id: itemId, material_kind: kind }),
        learned_at: bundle.collected_at || null,
        last_seen_at: bundle.updated_at || bundle.collected_at || null,
        times_seen: 1,
        link_status: "quiz_memory_material",
        memory_kind: kind,
        memory_evidence: { bundle_id: text2(bundle.bundle_id), reading_state: text2(((_a = bundle.reading) == null ? void 0 : _a.state) || "collected"), assessment_state: "not_assessed" }
      };
    }
    function bundleEntries(bundleValue) {
      const bundle = object(bundleValue);
      const output = array2(bundle.knowledge_units).map((unit) => unitEntry(bundle, unit)).filter((entry) => entry.text);
      const groups = [
        ["fun_fact", bundle.fun_facts],
        ["story", bundle.stories],
        ["building_story", bundle.building_stories],
        ["conflict", bundle.conflicts]
      ];
      for (const [kind, items] of groups) {
        array2(items).forEach((item, index) => {
          const entry = materialEntry(bundle, item, kind, index);
          if (entry.text) output.push(entry);
        });
      }
      return output;
    }
    function syncBundleEntries(bundle) {
      return bundleEntries(bundle).map((entry) => upsertEntry2(entry, { incrementSeen: false })).filter(Boolean);
    }
    function syncMemoryEntries(memory = readMemory()) {
      let entries = 0;
      const bundles = Object.values(object(memory.bundles));
      bundles.forEach((bundle) => {
        entries += syncBundleEntries(bundle).length;
      });
      return { bundles: bundles.length, entries };
    }
    function saveBundle(bundleValue) {
      var _a, _b, _c;
      const bundle = sanitizeBundle(bundleValue);
      if (!bundle.bundle_id) return null;
      const memory = readMemory();
      const previous = object((_a = memory.bundles) == null ? void 0 : _a[bundle.bundle_id]);
      const saved = {
        ...previous,
        ...bundle,
        reading: { ...object(previous.reading), ...object(bundle.reading) },
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      memory.bundles[bundle.bundle_id] = saved;
      memory.updated_at = saved.updated_at;
      rebuildIndexes(memory);
      try {
        (_b = root2.localStorage) == null ? void 0 : _b.setItem(STORAGE_KEY, JSON.stringify(memory));
      } catch {
      }
      syncBundleEntries(saved);
      try {
        (_c = root2.dispatchEvent) == null ? void 0 : _c.call(root2, new CustomEvent("hg:knowledgeMemoryUpdated", { detail: { bundle_id: bundle.bundle_id } }));
      } catch {
      }
      return saved;
    }
    function updateReadingState(bundleIdValue, stateValue) {
      var _a, _b, _c;
      const bundleId = text2(bundleIdValue);
      const state = text2(stateValue);
      const memory = readMemory();
      const bundle = (_a = memory.bundles) == null ? void 0 : _a[bundleId];
      if (!bundle) return null;
      const now = (/* @__PURE__ */ new Date()).toISOString();
      bundle.reading || (bundle.reading = {});
      bundle.reading.state = state;
      if (state === "presented" && !bundle.reading.presented_at) bundle.reading.presented_at = now;
      if (state === "read") {
        (_b = bundle.reading).presented_at || (_b.presented_at = now);
        bundle.reading.read_at = now;
      }
      array2(bundle.knowledge_units).forEach((unit) => {
        unit.reading || (unit.reading = {});
        unit.reading.state = state;
      });
      bundle.updated_at = now;
      memory.updated_at = now;
      rebuildIndexes(memory);
      try {
        (_c = root2.localStorage) == null ? void 0 : _c.setItem(STORAGE_KEY, JSON.stringify(memory));
      } catch {
      }
      syncBundleEntries(bundle);
      return bundle;
    }
    function reviewQuestionIds(bundleValue) {
      return unique2(array2(object(bundleValue).knowledge_units).filter((unit) => {
        var _a;
        return ((_a = unit.assessment) == null ? void 0 : _a.state) === "needs_review";
      }).map((unit) => unit.source_question_id || unit.unit_id));
    }
    function reviewCount(bundleValue) {
      return array2(object(bundleValue).knowledge_units).filter((unit) => {
        var _a;
        return ((_a = unit.assessment) == null ? void 0 : _a.state) === "needs_review";
      }).length;
    }
    function applyReviewBundle(bundleIdValue, reviewedValue) {
      var _a, _b, _c;
      const bundleId = text2(bundleIdValue);
      const memory = readMemory();
      const existing = object((_a = memory.bundles) == null ? void 0 : _a[bundleId]);
      if (!bundleId || !Object.keys(existing).length) return null;
      const reviewed = sanitizeBundle(reviewedValue);
      const reviewedByQuestion = /* @__PURE__ */ new Map();
      array2(reviewed.knowledge_units).forEach((unit) => {
        const questionId = text2(unit.source_question_id || unit.unit_id);
        if (questionId && !reviewedByQuestion.has(questionId)) reviewedByQuestion.set(questionId, unit);
      });
      if (!reviewedByQuestion.size) return existing;
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const knowledgeUnits = array2(existing.knowledge_units).map((unit) => {
        var _a2, _b2;
        const questionId = text2(unit.source_question_id || unit.unit_id);
        const reviewedUnit = reviewedByQuestion.get(questionId);
        if (!reviewedUnit) return unit;
        const previousReview2 = object(unit.review);
        return {
          ...unit,
          assessment: { ...object(unit.assessment), ...object(reviewedUnit.assessment) },
          review: {
            attempt_count: Number(previousReview2.attempt_count || 0) + 1,
            last_reviewed_at: now,
            last_result: text2((_a2 = reviewedUnit.assessment) == null ? void 0 : _a2.state),
            correct: ((_b2 = reviewedUnit.assessment) == null ? void 0 : _b2.correct) === true
          }
        };
      });
      const previousReview = object(existing.review);
      return saveBundle({
        ...existing,
        knowledge_units: knowledgeUnits,
        review: {
          attempt_count: Number(previousReview.attempt_count || 0) + 1,
          last_reviewed_at: now,
          correct: Number(((_b = reviewed.result) == null ? void 0 : _b.correct) || 0),
          total: Number(((_c = reviewed.result) == null ? void 0 : _c.total) || 0)
        },
        updated_at: now
      });
    }
    function startReview(bundleOrId) {
      var _a, _b, _c, _d, _e;
      const memory = readMemory();
      const bundle = typeof bundleOrId === "string" ? object((_a = memory.bundles) == null ? void 0 : _a[bundleOrId]) : object(bundleOrId);
      const questionIds = reviewQuestionIds(bundle);
      if (!bundle.bundle_id || !bundle.target_id || !bundle.set_id || !questionIds.length) return false;
      const request = {
        bundleId: text2(bundle.bundle_id),
        targetId: text2(bundle.target_id),
        setId: text2(bundle.set_id),
        questionIds,
        requestedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      closeKnowledgePopup();
      (_c = (_b = root2.document) == null ? void 0 : _b.getElementById("quizSummaryModal")) == null ? void 0 : _c.remove();
      if (typeof ((_d = root2.QuizEngine) == null ? void 0 : _d.startReview) === "function") {
        void Promise.resolve(root2.QuizEngine.startReview(request));
        return true;
      }
      try {
        (_e = root2.localStorage) == null ? void 0 : _e.setItem(REVIEW_REQUEST_KEY, JSON.stringify(request));
      } catch {
        return false;
      }
      if (root2.location) root2.location.href = new URL("index.html", root2.location.href).toString();
      return true;
    }
    function consumePendingReview() {
      var _a, _b, _c;
      if (typeof ((_a = root2.QuizEngine) == null ? void 0 : _a.startReview) !== "function") return false;
      let request = {};
      try {
        request = JSON.parse(((_b = root2.localStorage) == null ? void 0 : _b.getItem(REVIEW_REQUEST_KEY)) || "null") || {};
      } catch {
      }
      if (!request.targetId || !request.setId || !array2(request.questionIds).length) return false;
      try {
        (_c = root2.localStorage) == null ? void 0 : _c.removeItem(REVIEW_REQUEST_KEY);
      } catch {
      }
      void Promise.resolve(root2.QuizEngine.startReview(request));
      return true;
    }
    function memorySummary(memory = readMemory()) {
      const bundles = Object.values(object(memory.bundles));
      const units = bundles.flatMap((bundle) => array2(bundle.knowledge_units));
      return {
        bundle_count: bundles.length,
        knowledge_unit_count: units.length,
        mastered_count: units.filter((unit) => {
          var _a;
          return ((_a = unit.assessment) == null ? void 0 : _a.state) === "mastered";
        }).length,
        review_count: units.filter((unit) => {
          var _a;
          return ((_a = unit.assessment) == null ? void 0 : _a.state) === "needs_review";
        }).length,
        read_bundle_count: bundles.filter((bundle) => {
          var _a;
          return ((_a = bundle.reading) == null ? void 0 : _a.state) === "read";
        }).length,
        presented_bundle_count: bundles.filter((bundle) => {
          var _a;
          return ((_a = bundle.reading) == null ? void 0 : _a.state) === "presented";
        }).length,
        fun_fact_count: bundles.reduce((sum, bundle) => sum + array2(bundle.fun_facts).length, 0),
        story_count: bundles.reduce((sum, bundle) => sum + array2(bundle.stories).length + array2(bundle.building_stories).length, 0)
      };
    }
    function attachMemoryToProfile(profileValue, memory = readMemory()) {
      const profile = object(profileValue);
      const bundles = Object.values(object(memory.bundles));
      return {
        ...profile,
        quiz_memory: {
          schema: text2(memory.schema || SCHEMA),
          summary: memorySummary(memory),
          bundles: bundles.slice().sort((a, b) => (Date.parse(b.updated_at || b.collected_at || 0) || 0) - (Date.parse(a.updated_at || a.collected_at || 0) || 0))
        }
      };
    }
    async function fetchJson(pathValue) {
      var _a, _b;
      const url = new URL(text2(pathValue), ((_a = root2.document) == null ? void 0 : _a.baseURI) || ((_b = root2.location) == null ? void 0 : _b.href) || "http://localhost/").toString();
      if (!fetchCache.has(url)) {
        fetchCache.set(url, root2.fetch(url, { cache: "no-store" }).then((response) => {
          if (!response.ok) throw new Error(`${response.status} ${url}`);
          return response.json();
        }));
      }
      return fetchCache.get(url);
    }
    async function resolveLegacyContext(detail, manifest, targetId) {
      for (const file of array2(manifest.files)) {
        const data = await fetchJson(file);
        if (!Array.isArray(data)) continue;
        const questions = data.filter((question) => text2(question.targetId || question.placeId || question.personId) === targetId);
        if (questions.length) return { targetId, setId: text2(detail.quizId || targetId), sourceFile: file, setData: null, setBlock: null, questions };
      }
      return { targetId, setId: text2(detail.quizId || targetId), sourceFile: "", setData: null, setBlock: null, questions: [] };
    }
    async function resolveSetContext(detailValue) {
      const detail = object(detailValue);
      const targetId = text2(detail.targetId || detail.placeId || text2(detail.quizId).split("::")[0]);
      const compositeQuizId = text2(detail.quizId);
      const setId = compositeQuizId.includes("::") ? compositeQuizId.split("::").slice(1).join("::") : "";
      const manifest = await fetchJson(MANIFEST_PATH);
      const entries = array2(manifest.sets);
      for (const entry of entries) {
        if (targetId && text2(entry.targetId) !== targetId) continue;
        if (setId && entry.set_id && text2(entry.set_id) !== setId) continue;
        const setData = await fetchJson(entry.file);
        const block = array2(setData.sets).find((item) => text2(item.set_id) === (setId || text2(entry.set_id)));
        if (block) return { targetId, setId: text2(block.set_id), sourceFile: text2(entry.file), setData, setBlock: block, questions: array2(block.questions) };
      }
      return resolveLegacyContext(detail, manifest, targetId);
    }
    function latestResult(detailValue) {
      var _a;
      const detail = object(detailValue);
      let rows = [];
      try {
        rows = JSON.parse(((_a = root2.localStorage) == null ? void 0 : _a.getItem("hg_learning_log_v1")) || "[]");
      } catch {
      }
      const quizId = text2(detail.quizId);
      const targetId = text2(detail.targetId || detail.placeId);
      const matching = rows.filter((row2) => text2(row2.id) === quizId || text2(row2.targetId) === quizId || targetId && text2(row2.parentTargetId) === targetId && (!quizId || quizId.endsWith(text2(row2.setId))));
      const row = matching[matching.length - 1] || {};
      return {
        correct: Number.isFinite(Number(detail.correct)) ? Number(detail.correct) : Number(row.correctCount || 0),
        total: Number.isFinite(Number(detail.total)) ? Number(detail.total) : Number(row.total || 0),
        correctAnswers: array2(row.correctAnswers),
        answers: array2(row.answers),
        setId: text2(row.setId),
        completed_at: row.date || null
      };
    }
    function renderChips(values) {
      const list = unique2(values).slice(0, 18);
      return list.length ? `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">${list.map((item) => `<span style="border:1px solid rgba(255,255,255,.2);border-radius:999px;padding:4px 8px;font-size:.78rem">${escapeHtml(item)}</span>`).join("")}</div>` : "";
    }
    function knowledgePopupHtml(bundle) {
      const units = array2(bundle.knowledge_units);
      const facts = array2(bundle.fun_facts);
      const stories = array2(bundle.stories);
      const mastered = units.filter((unit) => {
        var _a;
        return ((_a = unit.assessment) == null ? void 0 : _a.state) === "mastered";
      }).length;
      const review = reviewCount(bundle);
      const unitHtml = units.map((unit) => {
        var _a;
        return `<article style="padding:11px 0;border-bottom:1px solid rgba(255,255,255,.12)"><div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start"><strong>${escapeHtml(unit.topic || unit.dimension || "Kunnskap")}</strong><small style="white-space:nowrap">${((_a = unit.assessment) == null ? void 0 : _a.state) === "mastered" ? "Mestret" : "Til repetisjon"}</small></div><p style="margin:6px 0 0;line-height:1.45">${escapeHtml(unit.text)}</p>${renderChips([unit.emne_ids, unit.concepts, unit.concept_focus, unit.terms])}</article>`;
      }).join("");
      const reviewAction = review > 0 ? `<div style="display:flex;justify-content:flex-end;margin:14px 0"><button class="ghost" id="quizKnowledgeMemoryReview" type="button">Gjenta feil (${review})</button></div>` : "";
      return `<div class="modal-body" style="max-height:min(86vh,900px);overflow:hidden"><div class="modal-head"><div><small class="muted">Knowledge-minnekammer</small><strong style="display:block">${escapeHtml(bundle.set_title || bundle.target_id || "Kunnskapen du samlet")}</strong></div><button class="ghost" id="quizKnowledgeMemoryClose">Lukk</button></div><div class="sheet-body" style="overflow:auto;max-height:68vh"><p class="muted" style="margin-top:0">${mastered} mestret \u2022 ${review} til repetisjon \u2022 ${units.length} kunnskapspunkter</p>${reviewAction}${unitHtml || "<p>Ingen strukturerte kunnskapspunkter ble funnet.</p>"}${facts.length ? `<section style="margin-top:18px"><h3>Funfacts og trivia</h3>${facts.map((row) => `<p>\u2022 ${escapeHtml(row.text)}</p>`).join("")}</section>` : ""}${stories.length ? `<section style="margin-top:18px"><h3>Historier</h3>${stories.map((row) => `<p>\u2022 ${escapeHtml(row.text)}</p>`).join("")}</section>` : ""}</div></div>`;
    }
    function closeKnowledgePopup() {
      var _a, _b;
      (_b = (_a = root2.document) == null ? void 0 : _a.getElementById("quizKnowledgeMemoryModal")) == null ? void 0 : _b.remove();
    }
    function openKnowledgePopup(bundleOrId) {
      var _a;
      if (!root2.document) return null;
      const memory = readMemory();
      const bundle = typeof bundleOrId === "string" ? (_a = memory.bundles) == null ? void 0 : _a[bundleOrId] : object(bundleOrId);
      if (!bundle) return null;
      closeKnowledgePopup();
      const modal = root2.document.createElement("div");
      modal.id = "quizKnowledgeMemoryModal";
      modal.className = "modal";
      modal.style.display = "flex";
      modal.innerHTML = knowledgePopupHtml(bundle);
      root2.document.body.appendChild(modal);
      updateReadingState(bundle.bundle_id, "presented");
      const close = modal.querySelector("#quizKnowledgeMemoryClose");
      if (close) close.onclick = closeKnowledgePopup;
      const reviewButton = modal.querySelector("#quizKnowledgeMemoryReview");
      if (reviewButton) reviewButton.onclick = () => {
        startReview(bundle.bundle_id);
      };
      modal.addEventListener("click", (event) => {
        if (event.target === modal) closeKnowledgePopup();
      });
      return modal;
    }
    function attachBundleToSummary(bundleValue) {
      var _a;
      const bundle = object(bundleValue);
      const modal = (_a = root2.document) == null ? void 0 : _a.getElementById("quizSummaryModal");
      const primary = modal == null ? void 0 : modal.querySelector("#quizSummaryPrimary");
      const actions = primary == null ? void 0 : primary.parentElement;
      if (!modal || !actions || !bundle.bundle_id) return false;
      let button = modal.querySelector("#quizSummaryKnowledge");
      if (!button) {
        button = root2.document.createElement("button");
        button.id = "quizSummaryKnowledge";
        button.className = "ghost";
        actions.insertBefore(button, primary);
      }
      button.textContent = `Kunnskapen du samlet (${array2(bundle.knowledge_units).length})`;
      button.onclick = () => {
        openKnowledgePopup(bundle.bundle_id);
      };
      const review = reviewCount(bundle);
      let reviewButton = modal.querySelector("#quizSummaryReview");
      if (review > 0) {
        if (!reviewButton) {
          reviewButton = root2.document.createElement("button");
          reviewButton.id = "quizSummaryReview";
          reviewButton.className = "ghost";
          actions.insertBefore(reviewButton, primary);
        }
        reviewButton.textContent = `Gjenta feil (${review})`;
        reviewButton.onclick = () => {
          startReview(bundle.bundle_id);
        };
      } else {
        reviewButton == null ? void 0 : reviewButton.remove();
      }
      const meta = modal.querySelector("#quizSummaryMeta");
      if (meta && !modal.querySelector("#quizSummaryKnowledgeLine")) {
        const line = root2.document.createElement("div");
        line.id = "quizSummaryKnowledgeLine";
        line.className = "muted";
        line.style.margin = "-6px 0 14px";
        line.textContent = `${array2(bundle.knowledge_units).length} kunnskapspunkter er automatisk lagt til i Knowledge.`;
        meta.insertAdjacentElement("afterend", line);
      }
      return true;
    }
    function watchForSummary() {
      if (!root2.document || summaryObserver) return;
      summaryObserver = new MutationObserver(() => {
        if (pendingBundle && attachBundleToSummary(pendingBundle)) pendingBundle = null;
      });
      summaryObserver.observe(root2.document.documentElement, { childList: true, subtree: true });
    }
    async function captureCompletion(detailValue = {}) {
      var _a;
      try {
        const detail = object(detailValue);
        const context = await resolveSetContext(detail);
        const result = latestResult(detail);
        const bundle = buildQuizKnowledgeBundle({
          targetId: context.targetId,
          categoryId: text2(detail.categoryId || detail.domain || ((_a = context.setData) == null ? void 0 : _a.categoryId)),
          setId: context.setId,
          sourceFile: context.sourceFile,
          setData: context.setData,
          setBlock: context.setBlock,
          questions: context.questions,
          result
        });
        const saved = saveBundle(bundle);
        pendingBundle = saved;
        if (saved && attachBundleToSummary(saved)) pendingBundle = null;
        return saved;
      } catch (error) {
        if (root2.DEBUG) console.warn("[HGKnowledgeV2.quizMemory] capture failed", error, detailValue);
        return null;
      }
    }
    async function captureReviewCompletion(detailValue = {}) {
      var _a;
      try {
        const detail = object(detailValue);
        const context = await resolveSetContext(detail);
        const questionIds = new Set(array2(detail.questionIds).map(text2).filter(Boolean));
        const questions = array2(context.questions).filter((question) => questionIds.has(text2(question.quiz_id || question.quizId || question.id)));
        const reviewed = buildQuizKnowledgeBundle({
          targetId: context.targetId,
          categoryId: text2(detail.categoryId || detail.domain || ((_a = context.setData) == null ? void 0 : _a.categoryId)),
          setId: context.setId,
          sourceFile: context.sourceFile,
          setData: context.setData,
          setBlock: context.setBlock,
          questions,
          result: {
            correct: Number(detail.correct || 0),
            total: Number(detail.total || 0),
            correctAnswers: array2(detail.correctAnswers),
            answers: array2(detail.answers)
          }
        });
        const saved = applyReviewBundle(stableId(context.targetId, context.setId), reviewed);
        pendingBundle = saved;
        if (saved && attachBundleToSummary(saved)) pendingBundle = null;
        return saved;
      } catch (error) {
        if (root2.DEBUG) console.warn("[HGKnowledgeV2.quizMemory] review capture failed", error, detailValue);
        return null;
      }
    }
    function renderOverview(profileValue) {
      var _a, _b;
      if (!root2.document) return;
      const profile = object(profileValue);
      const content = root2.document.getElementById("knowledgeContent");
      if (!content) return;
      let panel = root2.document.getElementById("knowledgeMemoryOverview");
      if (!panel) {
        panel = root2.document.createElement("section");
        panel.id = "knowledgeMemoryOverview";
        panel.className = "kv2-panel";
        panel.style.marginBottom = "18px";
        (_a = content.parentElement) == null ? void 0 : _a.insertBefore(panel, content);
      }
      const memory = object(profile.quiz_memory);
      const summary = object(memory.summary);
      const selectedSubject = text2(new URLSearchParams(((_b = root2.location) == null ? void 0 : _b.search) || "").get("subject"));
      const bundles = array2(memory.bundles).filter((bundle) => !selectedSubject || text2(bundle.subject_id) === selectedSubject).slice(0, 8);
      if (!Number(summary.bundle_count || 0)) {
        panel.innerHTML = `<div class="kv2-panel-head"><div><span class="kv2-eyebrow">Quiz-minnekammer</span><h2>Kunnskap fra fullf\xF8rte quizzer</h2></div></div><p class="kv2-empty">Ingen kunnskapsbundle er samlet enn\xE5.</p>`;
        return;
      }
      panel.innerHTML = `<div class="kv2-panel-head"><div><span class="kv2-eyebrow">Quiz-minnekammer</span><h2>Kunnskap samlet i quiz</h2></div><span class="kv2-panel-meta">Kunnskap, historier, funfacts og vurderingsevidens er separate roller i samme TypeScript-motor.</span></div><div class="kv2-summary" style="margin:0 0 16px"><article class="kv2-stat"><strong>${Number(summary.bundle_count || 0)}</strong><span>Quizforl\xF8p</span></article><article class="kv2-stat"><strong>${Number(summary.knowledge_unit_count || 0)}</strong><span>Kunnskapsenheter</span></article><article class="kv2-stat"><strong>${Number(summary.mastered_count || 0)}</strong><span>Mestret</span></article><article class="kv2-stat"><strong>${Number(summary.review_count || 0)}</strong><span>Til repetisjon</span></article></div>${bundles.length ? `<div class="kv2-recent-list">${bundles.map((bundle) => {
        var _a2, _b2, _c, _d, _e;
        const review = reviewCount(bundle);
        return `<article class="kv2-recent-item"><span class="kv2-recent-meta">${escapeHtml(((_b2 = (_a2 = root2.HGKnowledgeV2) == null ? void 0 : _a2.SUBJECT_LABELS) == null ? void 0 : _b2[bundle.subject_id]) || bundle.subject_id)} \xB7 ${escapeHtml(((_c = bundle.reading) == null ? void 0 : _c.state) || "Samlet")}</span><button type="button" data-knowledge-bundle="${escapeHtml(bundle.bundle_id)}" style="appearance:none;border:0;background:none;color:inherit;padding:0;text-align:left;font:inherit;cursor:pointer;font-weight:700">${escapeHtml(bundle.set_title || humanize(bundle.target_id) || "Quizkunnskap")}</button><p>${Number(((_d = bundle.result) == null ? void 0 : _d.correct) || 0)} av ${Number(((_e = bundle.result) == null ? void 0 : _e.total) || 0)} riktig \xB7 ${array2(bundle.knowledge_units).length} kunnskapspunkter</p>${review > 0 ? `<button type="button" class="ghost" data-knowledge-review="${escapeHtml(bundle.bundle_id)}">Gjenta feil (${review})</button>` : ""}</article>`;
      }).join("")}</div>` : ""}`;
      panel.querySelectorAll("[data-knowledge-bundle]").forEach((button) => {
        button.addEventListener("click", () => openKnowledgePopup(button.getAttribute("data-knowledge-bundle") || ""));
      });
      panel.querySelectorAll("[data-knowledge-review]").forEach((button) => {
        button.addEventListener("click", () => startReview(button.getAttribute("data-knowledge-review") || ""));
      });
    }
    function initBrowserIntegration() {
      if (!root2.addEventListener || !root2.document || !root2.fetch || root2.__HG_KNOWLEDGE_MEMORY_BROWSER_INTEGRATION__) return;
      root2.__HG_KNOWLEDGE_MEMORY_BROWSER_INTEGRATION__ = true;
      watchForSummary();
      root2.addEventListener("hg:quizCompleted", (event) => {
        void captureCompletion(event.detail || {});
      });
      root2.addEventListener("hg:quizReviewCompleted", (event) => {
        void captureReviewCompletion(event.detail || {});
      });
      root2.addEventListener("hg:appReady", () => {
        consumePendingReview();
      });
    }
    return {
      STORAGE_KEY,
      SCHEMA,
      QUALITY_VERSION,
      buildQuizKnowledgeBundle,
      sanitizeBundle,
      readMemory,
      saveBundle,
      rebuildIndexes,
      updateReadingState,
      bundleEntries,
      syncBundleEntries,
      syncMemoryEntries,
      memorySummary,
      attachMemoryToProfile,
      reviewQuestionIds,
      reviewCount,
      applyReviewBundle,
      startReview,
      consumePendingReview,
      openKnowledgePopup,
      attachBundleToSummary,
      captureCompletion,
      captureReviewCompletion,
      renderOverview,
      initBrowserIntegration
    };
  }

  // js/knowledgeV2.ts
  var root = globalThis;
  var ENTRY_KEY = "hg_knowledge_entries_v2";
  var LEGACY_KEY = "knowledge_universe";
  var LEARNING_LOG_KEY = "hg_learning_log_v1";
  var SCHEMA2 = "history_go_knowledge_entry_v2";
  var VERSION = 2;
  var QUALITY_VERSION2 = 2;
  var SUBJECT_LABELS = Object.freeze({
    historie: "Historie",
    vitenskap: "Vitenskap",
    kunst: "Kunst & kultur",
    natur: "Natur & milj\xF8",
    musikk: "Musikk",
    populaerkultur: "Popul\xE6rkultur",
    subkultur: "Subkultur",
    sport: "Sport",
    by: "By & arkitektur",
    politikk: "Politikk & samfunn",
    naeringsliv: "N\xE6ringsliv",
    litteratur: "Litteratur",
    psykologi: "Psykologi"
  });
  function s(value) {
    return knowledgeClaimCore_default.text(value);
  }
  function toArray(value) {
    return Array.isArray(value) ? value : [];
  }
  function toObject(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }
  function unique3(values) {
    return knowledgeClaimCore_default.unique(values);
  }
  function readJson(key, fallback) {
    try {
      if (!root.localStorage) return fallback;
      const raw = root.localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed == null ? fallback : parsed;
    } catch {
      return fallback;
    }
  }
  function writeJson(key, value) {
    try {
      if (!root.localStorage) return false;
      root.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }
  function slug(value) {
    return s(value).toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9_-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 120);
  }
  function normalizeSubjectId(value) {
    var _a, _b;
    const raw = s(value);
    if (!raw) return "";
    try {
      if ((_a = root.DomainRegistry) == null ? void 0 : _a.toRuntimeCategoryId) return s(root.DomainRegistry.toRuntimeCategoryId(raw));
      if ((_b = root.DomainRegistry) == null ? void 0 : _b.resolve) return s(root.DomainRegistry.resolve(raw));
    } catch {
    }
    return raw === "popkultur" ? "populaerkultur" : raw;
  }
  function normalizeEmneIds(value) {
    const row = toObject(value);
    return unique3([
      row.emne_id,
      ...toArray(row.emne_ids),
      ...toArray(row.related_emner),
      ...toArray(row.related_emners),
      ...toArray(row.relatedEmner),
      ...toArray(row.relatedEmneIds)
    ]);
  }
  function normalizeConcepts(value) {
    return knowledgeClaimCore_default.explicitConcepts(value);
  }
  function normalizeTerms(value) {
    return knowledgeClaimCore_default.explicitTerms(value);
  }
  function normalizeTags(value) {
    return knowledgeClaimCore_default.explicitTags(value);
  }
  function normalizeTargetIds(event) {
    const row = toObject(event);
    return unique3([
      row.parentTargetId,
      row.targetId,
      row.placeId,
      row.place_id,
      row.personId,
      row.person_id,
      row.id
    ]);
  }
  function getEntries() {
    const rows = readJson(ENTRY_KEY, []);
    return Array.isArray(rows) ? rows : [];
  }
  function saveEntries(entries) {
    return writeJson(ENTRY_KEY, Array.isArray(entries) ? entries : []);
  }
  function inferTargetKind(targetId) {
    const id = s(targetId);
    if (!id) return { place_id: null, person_id: null };
    if (toArray(root.PLACES).some((place) => s(place == null ? void 0 : place.id) === id)) return { place_id: id, person_id: null };
    if (toArray(root.PEOPLE).some((person) => s(person == null ? void 0 : person.id) === id)) return { place_id: null, person_id: id };
    return { place_id: null, person_id: null };
  }
  function mergeEntry(previous, incoming, now, incrementSeen = true) {
    return {
      ...previous,
      ...incoming,
      learned_at: previous.learned_at || incoming.learned_at || now,
      last_seen_at: incrementSeen ? now : incoming.last_seen_at || previous.last_seen_at || now,
      times_seen: incrementSeen ? Number(previous.times_seen || 1) + 1 : Math.max(Number(previous.times_seen || 1), Number(incoming.times_seen || 1)),
      emne_ids: unique3([...previous.emne_ids || [], ...incoming.emne_ids || []]),
      concepts: unique3([...previous.concepts || [], ...incoming.concepts || []]),
      terms: unique3([...previous.terms || [], ...incoming.terms || []]),
      tags: unique3([...previous.tags || [], ...incoming.tags || []]),
      memory_evidence: { ...previous.memory_evidence || {}, ...incoming.memory_evidence || {} }
    };
  }
  function upsertEntry(entry, options = {}) {
    if (!(entry == null ? void 0 : entry.id) || !(entry == null ? void 0 : entry.text)) return null;
    const rows = getEntries();
    const identity = entryIdentity(entry);
    const index = rows.findIndex((row) => s(row == null ? void 0 : row.id) === s(entry.id) || !!identity && entryIdentity(row) === identity);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const incrementSeen = options.incrementSeen !== false;
    if (index >= 0) {
      rows[index] = mergeEntry(rows[index], entry, now, incrementSeen);
      saveEntries(rows);
      return rows[index];
    }
    const next = {
      schema: SCHEMA2,
      version: VERSION,
      learned_at: entry.learned_at || now,
      last_seen_at: entry.last_seen_at || now,
      times_seen: Number(entry.times_seen || 1),
      ...entry
    };
    rows.push(next);
    saveEntries(rows);
    return next;
  }
  function sourceForQuiz(quizItem, context, sourceQuizId, targetId) {
    const targetKind = inferTargetKind(targetId);
    return {
      type: "quiz",
      quiz_id: sourceQuizId || null,
      target_id: targetId || null,
      place_id: s(quizItem.placeId || context.placeId || targetKind.place_id) || null,
      person_id: s(quizItem.personId || context.personId || targetKind.person_id) || null,
      source_file: s(quizItem.source_file || context.sourceFile) || null
    };
  }
  function captureQuizKnowledgeClaims(quizValue, contextValue = {}) {
    const quizItem = toObject(quizValue);
    const context = toObject(contextValue);
    if (!Object.keys(quizItem).length) return [];
    const subjectId = normalizeSubjectId(
      quizItem.fagkart_category_id || quizItem.subject_id || quizItem.categoryId || quizItem.category || context.categoryId || context.subjectId
    );
    if (!subjectId) return [];
    const claims = knowledgeClaimCore_default.extractQuizClaims(quizItem);
    if (!claims.length) return [];
    const sourceQuizId = s(quizItem.quiz_id || quizItem.quizId || quizItem.id || context.id);
    const targetId = s(
      quizItem.targetId || quizItem.placeId || quizItem.personId || context.targetId || context.placeId || context.personId
    );
    const emneIds = normalizeEmneIds(quizItem);
    const concepts = normalizeConcepts(quizItem);
    const terms = normalizeTerms(quizItem);
    const tags = normalizeTags(quizItem);
    const kind = knowledgeClaimCore_default.inferKind(quizItem);
    const topic = knowledgeClaimCore_default.cleanTopic(quizItem.topic || context.topic, kind);
    const stableSource = sourceQuizId || [targetId, topic, claims[0]].map(slug).filter(Boolean).join("_");
    const source = sourceForQuiz(quizItem, context, sourceQuizId, targetId);
    return claims.map((claim, index) => upsertEntry({
      id: `kv2_${slug(subjectId)}_${slug(stableSource)}${claims.length > 1 ? `_claim_${index + 1}` : ""}`,
      subject_id: subjectId,
      fagkart_category_id: subjectId,
      emne_ids: emneIds,
      concepts,
      terms,
      tags,
      kind,
      dimension: s(quizItem.dimension || context.dimension || "generelt") || "generelt",
      topic,
      text: claim,
      source,
      content_quality: {
        version: QUALITY_VERSION2,
        precise_claim: true,
        canonical_capture: true
      },
      link_status: emneIds.length ? "linked" : "pending_emne_link"
    })).filter(Boolean);
  }
  function captureQuizKnowledge(quizItem, context = {}) {
    return captureQuizKnowledgeClaims(quizItem, context)[0] || null;
  }
  function findLegacyTargetId(itemId, learningLog) {
    const id = s(itemId);
    if (!id) return "";
    const candidates = unique3(learningLog.flatMap((event) => normalizeTargetIds(event))).sort((a, b) => b.length - a.length);
    for (const targetId of candidates) {
      if (id === `quiz_${targetId}` || id.startsWith(`quiz_${targetId}_`)) return targetId;
    }
    return "";
  }
  function cleanStoredEntry(entryValue) {
    const entry = toObject(entryValue);
    const question = knowledgeClaimCore_default.isQuestion(entry.topic) ? s(entry.topic) : "";
    const claims = knowledgeClaimCore_default.extractTextClaims(entry.text, { question, answer: entry.answer });
    const tags = normalizeTags(entry);
    const concepts = normalizeConcepts(entry).filter((concept) => !tags.includes(concept));
    return claims.map((claim, index) => {
      const sourceId = s(entry.source_entry_id || entry.id || "knowledge_entry");
      const next = {
        ...entry,
        id: claims.length === 1 ? s(entry.id || sourceId) : `${sourceId}::claim::${index + 1}`,
        source_entry_id: sourceId,
        topic: knowledgeClaimCore_default.cleanTopic(entry.topic, entry.kind),
        text: claim,
        concepts,
        terms: normalizeTerms(entry),
        tags,
        content_quality: {
          ...entry.content_quality || {},
          version: QUALITY_VERSION2,
          precise_claim: true
        }
      };
      delete next.answer;
      return next;
    });
  }
  function entryIdentity(entry) {
    var _a, _b, _c;
    return [
      normalizeSubjectId(entry.subject_id || entry.fagkart_category_id),
      s(((_a = entry.source) == null ? void 0 : _a.target_id) || ((_b = entry.source) == null ? void 0 : _b.place_id) || ((_c = entry.source) == null ? void 0 : _c.person_id)),
      knowledgeClaimCore_default.normalized(entry.text)
    ].join("::");
  }
  function sanitizeStoredEntries() {
    const before = getEntries();
    const output = [];
    const seen = /* @__PURE__ */ new Map();
    before.flatMap(cleanStoredEntry).forEach((entry) => {
      const key = entryIdentity(entry);
      const previous = seen.get(key);
      if (!previous) {
        seen.set(key, entry);
        output.push(entry);
        return;
      }
      previous.emne_ids = unique3([...previous.emne_ids || [], ...entry.emne_ids || []]);
      previous.concepts = unique3([...previous.concepts || [], ...entry.concepts || []]);
      previous.terms = unique3([...previous.terms || [], ...entry.terms || []]);
      previous.tags = unique3([...previous.tags || [], ...entry.tags || []]);
      previous.times_seen = Number(previous.times_seen || 1) + Number(entry.times_seen || 1);
    });
    const changed = JSON.stringify(before) !== JSON.stringify(output);
    if (changed) saveEntries(output);
    return { changed, total: output.length };
  }
  function migrateLegacyKnowledge() {
    const legacy = toObject(readJson(LEGACY_KEY, {}));
    const learningLog = toArray(readJson(LEARNING_LOG_KEY, []));
    const existingIds = new Set(getEntries().map((entry) => {
      var _a;
      return s((_a = entry == null ? void 0 : entry.legacy) == null ? void 0 : _a.legacy_entry_id);
    }).filter(Boolean));
    const cleanLegacy = {};
    let migrated = 0;
    for (const [rawSubjectId, dimensionsValue] of Object.entries(legacy)) {
      const subjectId = normalizeSubjectId(rawSubjectId);
      const cleanDimensions = {};
      for (const [dimension, itemsValue] of Object.entries(toObject(dimensionsValue))) {
        const cleanItems = [];
        for (const itemValue of toArray(itemsValue)) {
          const item = toObject(itemValue);
          const question = knowledgeClaimCore_default.isQuestion(item.topic) ? s(item.topic) : "";
          const claims = knowledgeClaimCore_default.extractTextClaims(item.text, { question, answer: item.answer });
          claims.forEach((claim, index) => {
            const base = s(item.source_entry_id || item.id || item.topic || "legacy_knowledge");
            const cleanItem = {
              ...item,
              id: claims.length === 1 ? s(item.id || base) : `${base}::claim::${index + 1}`,
              source_entry_id: base,
              topic: knowledgeClaimCore_default.cleanTopic(item.topic),
              text: claim,
              content_quality: { version: QUALITY_VERSION2, precise_claim: true }
            };
            delete cleanItem.answer;
            cleanItems.push(cleanItem);
            const legacyEntryId = `${subjectId}:${dimension}:${cleanItem.id}`;
            if (existingIds.has(legacyEntryId)) return;
            const targetId = findLegacyTargetId(item.id, learningLog);
            upsertEntry({
              id: `legacy_${slug(legacyEntryId)}`,
              subject_id: subjectId,
              fagkart_category_id: subjectId,
              emne_ids: [],
              concepts: [],
              terms: [],
              tags: [],
              dimension: s(dimension || "generelt") || "generelt",
              topic: cleanItem.topic,
              text: claim,
              source: {
                type: "legacy_quiz_knowledge",
                quiz_id: s(item.id) || null,
                target_id: targetId || null,
                place_id: null,
                person_id: null
              },
              legacy: { legacy_entry_id: legacyEntryId, storage_key: LEGACY_KEY },
              content_quality: { version: QUALITY_VERSION2, precise_claim: true, migrated: true },
              link_status: "legacy_unresolved"
            });
            existingIds.add(legacyEntryId);
            migrated += 1;
          });
        }
        if (cleanItems.length) cleanDimensions[dimension] = cleanItems;
      }
      if (Object.keys(cleanDimensions).length) cleanLegacy[rawSubjectId] = cleanDimensions;
    }
    if (JSON.stringify(legacy) !== JSON.stringify(cleanLegacy)) writeJson(LEGACY_KEY, cleanLegacy);
    return { migrated, total: getEntries().length };
  }
  function scoreConceptOverlap(entryConcepts, eventConcepts) {
    const eventSet = new Set(unique3(eventConcepts).map((value) => value.toLowerCase()));
    return unique3(entryConcepts).reduce((score, concept) => eventSet.has(concept.toLowerCase()) ? score + 1 : score, 0);
  }
  function reconcileEntriesFromLearningLog() {
    const entries = getEntries();
    const learningLog = toArray(readJson(LEARNING_LOG_KEY, []));
    let changed = 0;
    const next = entries.map((entry) => {
      var _a;
      if (toArray(entry.emne_ids).length) return entry;
      const subjectId = normalizeSubjectId(entry.subject_id || entry.fagkart_category_id);
      const targetId = s((_a = entry.source) == null ? void 0 : _a.target_id);
      const entryConcepts = normalizeConcepts(entry);
      const candidates = learningLog.map((eventValue) => {
        const event = toObject(eventValue);
        return {
          event,
          subjectId: normalizeSubjectId(event.subjectId || event.subject_id || event.categoryId || event.category || event.domain),
          targetIds: normalizeTargetIds(event),
          emneIds: normalizeEmneIds(event),
          concepts: normalizeConcepts(event)
        };
      }).filter((candidate) => candidate.emneIds.length).filter((candidate) => !subjectId || !candidate.subjectId || candidate.subjectId === subjectId).filter((candidate) => !targetId || candidate.targetIds.includes(targetId)).map((candidate) => ({ ...candidate, overlap: scoreConceptOverlap(entryConcepts, candidate.concepts) })).filter((candidate) => !entryConcepts.length || candidate.overlap > 0).sort((a, b) => b.overlap - a.overlap || Number(b.event.ts || 0) - Number(a.event.ts || 0));
      const best = candidates[0];
      if (!best) return entry;
      changed += 1;
      return {
        ...entry,
        emne_ids: unique3(best.emneIds),
        link_status: "linked_from_learning_log",
        link_evidence: {
          event_type: s(best.event.type),
          event_id: s(best.event.id || best.event.quizId),
          concept_overlap: best.overlap
        }
      };
    });
    if (changed) saveEntries(next);
    return { changed, total: next.length };
  }
  function installCaptureBridge() {
    if (root.__HG_KNOWLEDGE_V2_CAPTURE_INSTALLED__) return false;
    root.saveKnowledgeFromQuiz = (quizItem, context) => captureQuizKnowledge(quizItem, context || {});
    root.__HG_KNOWLEDGE_V2_CAPTURE_INSTALLED__ = true;
    return true;
  }
  var quizMemory = createQuizKnowledgeMemory({ root, upsertEntry, normalizeSubjectId });
  async function loadEmner(subjectId) {
    var _a, _b;
    if ((_a = root.DataHub) == null ? void 0 : _a.loadEmner) {
      try {
        const rows = await root.DataHub.loadEmner(subjectId, { cache: "default" });
        if (Array.isArray(rows)) return rows;
      } catch {
      }
    }
    if ((_b = root.Emner) == null ? void 0 : _b.loadForSubject) {
      try {
        const rows = await root.Emner.loadForSubject(subjectId);
        if (Array.isArray(rows)) return rows;
      } catch {
      }
    }
    return [];
  }
  async function listSubjectIds(entries) {
    var _a;
    const ids = new Set(entries.map((entry) => normalizeSubjectId(entry.subject_id || entry.fagkart_category_id)).filter(Boolean));
    if ((_a = root.DataHub) == null ? void 0 : _a.loadFagManifest) {
      try {
        const manifest = await root.DataHub.loadFagManifest({ cache: "default" });
        Object.keys(toObject(manifest)).forEach((id) => ids.add(normalizeSubjectId(id)));
      } catch {
      }
    }
    Object.keys(SUBJECT_LABELS).forEach((id) => ids.add(id));
    return Array.from(ids).filter(Boolean);
  }
  function inferEntryEmneIds(entry, emner, learningLog) {
    var _a;
    const explicit = normalizeEmneIds(entry);
    if (explicit.length) return { ids: explicit, method: entry.link_status || "explicit" };
    const entryConcepts = new Set(normalizeConcepts(entry).map((concept) => concept.toLowerCase()));
    if (entryConcepts.size) {
      const scored = emner.map((emne) => {
        const concepts = unique3([...emne.core_concepts || [], ...emne.keywords || []]);
        const score = concepts.reduce((sum, concept) => sum + (entryConcepts.has(s(concept).toLowerCase()) ? 1 : 0), 0);
        return { id: s(emne.emne_id || emne.id), score };
      }).filter((row) => row.id && row.score > 0).sort((a, b) => b.score - a.score);
      if (scored.length) {
        const top = scored[0].score;
        return { ids: scored.filter((row) => row.score === top).map((row) => row.id), method: "concept_overlap" };
      }
    }
    const targetId = s((_a = entry.source) == null ? void 0 : _a.target_id);
    const subjectId = normalizeSubjectId(entry.subject_id || entry.fagkart_category_id);
    const fromLog = unique3(learningLog.filter((event) => {
      const eventSubject = normalizeSubjectId(event.subjectId || event.subject_id || event.categoryId || event.category || event.domain);
      return (!subjectId || !eventSubject || eventSubject === subjectId) && (!targetId || normalizeTargetIds(event).includes(targetId));
    }).flatMap((event) => normalizeEmneIds(event)));
    return { ids: fromLog, method: fromLog.length ? "learning_log_target" : "unresolved" };
  }
  async function buildProfile(options = {}) {
    var _a;
    sanitizeStoredEntries();
    migrateLegacyKnowledge();
    reconcileEntriesFromLearningLog();
    quizMemory.syncMemoryEntries();
    const entries = getEntries();
    const learningLog = toArray(readJson(LEARNING_LOG_KEY, []));
    const subjectIds = await listSubjectIds(entries);
    const requestedSubjectId = normalizeSubjectId(options.subjectId);
    const subjects = {};
    for (const subjectId of subjectIds) {
      if (requestedSubjectId && requestedSubjectId !== subjectId) continue;
      const emner = await loadEmner(subjectId);
      const subjectEntries = entries.filter((entry) => normalizeSubjectId(entry.subject_id || entry.fagkart_category_id) === subjectId);
      const conceptCounts = /* @__PURE__ */ new Map();
      const enrichedEntries = subjectEntries.map((entry) => {
        normalizeConcepts(entry).forEach((concept) => {
          const key = concept.toLowerCase();
          const previous = conceptCounts.get(key) || { id: key, label: concept, count: 0 };
          previous.count += 1;
          conceptCounts.set(key, previous);
        });
        const resolved = inferEntryEmneIds(entry, emner, learningLog);
        return { ...entry, resolved_emne_ids: resolved.ids, resolved_link_method: resolved.method };
      });
      const emneRows = emner.map((emne) => {
        const emneId = s(emne.emne_id || emne.id);
        const linkedEntries = enrichedEntries.filter((entry) => toArray(entry.resolved_emne_ids).includes(emneId));
        return {
          emne_id: emneId,
          title: s(emne.title || emne.name || emneId),
          description: s(emne.description || emne.summary || emne.ingress),
          core_concepts: unique3(emne.core_concepts || []),
          dimensions: unique3(emne.dimensions || []),
          knowledge_count: linkedEntries.length,
          entries: linkedEntries
        };
      });
      let course = null;
      if ((_a = root.HGCourses) == null ? void 0 : _a.compute) {
        try {
          course = await root.HGCourses.compute({ subjectId, emnerAll: emner });
        } catch {
        }
      }
      subjects[subjectId] = {
        subject_id: subjectId,
        label: SUBJECT_LABELS[subjectId] || subjectId,
        knowledge_count: enrichedEntries.length,
        linked_count: enrichedEntries.filter((entry) => toArray(entry.resolved_emne_ids).length).length,
        unresolved_count: enrichedEntries.filter((entry) => !toArray(entry.resolved_emne_ids).length).length,
        concepts: Array.from(conceptCounts.values()).sort((a, b) => b.count - a.count),
        entries: enrichedEntries,
        emner: emneRows.sort((a, b) => b.knowledge_count - a.knowledge_count || a.title.localeCompare(b.title, "nb")),
        course
      };
    }
    const visibleSubjects = Object.values(subjects);
    const allConcepts = /* @__PURE__ */ new Map();
    visibleSubjects.forEach((subject) => toArray(subject.concepts).forEach((concept) => {
      const previous = allConcepts.get(concept.id) || { ...concept, count: 0 };
      previous.count += concept.count;
      allConcepts.set(concept.id, previous);
    }));
    const profile = {
      schema: "history_go_knowledge_profile_v2",
      version: VERSION,
      generated_at: (/* @__PURE__ */ new Date()).toISOString(),
      summary: {
        knowledge_count: visibleSubjects.reduce((sum, subject) => sum + subject.knowledge_count, 0),
        linked_count: visibleSubjects.reduce((sum, subject) => sum + subject.linked_count, 0),
        unresolved_count: visibleSubjects.reduce((sum, subject) => sum + subject.unresolved_count, 0),
        subject_count: visibleSubjects.filter((subject) => subject.knowledge_count > 0).length,
        concept_count: allConcepts.size
      },
      concepts: Array.from(allConcepts.values()).sort((a, b) => b.count - a.count),
      subjects
    };
    return quizMemory.attachMemoryToProfile(profile);
  }
  function getContractHealth(entries = getEntries()) {
    const missingSubject = entries.filter((entry) => !normalizeSubjectId(entry.subject_id || entry.fagkart_category_id));
    const missingEmne = entries.filter((entry) => !normalizeEmneIds(entry).length);
    const missingConcepts = entries.filter((entry) => !normalizeConcepts(entry).length);
    const missingText = entries.filter((entry) => !s(entry.text));
    return {
      total: entries.length,
      missing_subject: missingSubject.length,
      missing_emne: missingEmne.length,
      missing_concepts: missingConcepts.length,
      missing_text: missingText.length,
      ok: missingSubject.length === 0 && missingEmne.length === 0 && missingText.length === 0
    };
  }
  function boot() {
    sanitizeStoredEntries();
    migrateLegacyKnowledge();
    installCaptureBridge();
    reconcileEntriesFromLearningLog();
    quizMemory.syncMemoryEntries();
    quizMemory.initBrowserIntegration();
  }
  var api = {
    SCHEMA: SCHEMA2,
    VERSION,
    QUALITY_VERSION: QUALITY_VERSION2,
    KEYS: { ENTRIES: ENTRY_KEY, LEGACY: LEGACY_KEY, LEARNING_LOG: LEARNING_LOG_KEY, MEMORY: quizMemory.STORAGE_KEY },
    SUBJECT_LABELS,
    claimCore: knowledgeClaimCore_default,
    normalizeEmneIds,
    normalizeConcepts,
    normalizeTerms,
    normalizeTags,
    captureQuizKnowledge,
    captureQuizKnowledgeClaims,
    sanitizeStoredEntries,
    migrateLegacyKnowledge,
    reconcileEntriesFromLearningLog,
    installCaptureBridge,
    getEntries,
    buildProfile,
    getContractHealth,
    quizMemory,
    renderQuizMemoryOverview: quizMemory.renderOverview
  };
  root.HGKnowledgeV2 = api;
  root.HGQuizKnowledgeMemory = quizMemory;
  root.buildQuizKnowledgeBundle = quizMemory.buildQuizKnowledgeBundle;
  if (typeof root.addEventListener === "function") {
    root.addEventListener("hg:quizCompleted", () => {
      try {
        reconcileEntriesFromLearningLog();
      } catch {
      }
    });
    root.addEventListener("hg:appReady", () => {
      try {
        installCaptureBridge();
      } catch {
      }
    });
  }
  boot();
  var knowledgeV2_default = api;
})();
//# sourceMappingURL=knowledgeV2.js.map
