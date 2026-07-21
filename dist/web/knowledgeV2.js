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

  // js/knowledgeV2.ts
  var root = globalThis;
  var ENTRY_KEY = "hg_knowledge_entries_v2";
  var LEGACY_KEY = "knowledge_universe";
  var LEARNING_LOG_KEY = "hg_learning_log_v1";
  var SCHEMA = "history_go_knowledge_entry_v2";
  var VERSION = 2;
  var QUALITY_VERSION = 2;
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
  function unique2(values) {
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
    return unique2([
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
    return unique2([
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
  function mergeEntry(previous, incoming, now) {
    return {
      ...previous,
      ...incoming,
      learned_at: previous.learned_at || incoming.learned_at || now,
      last_seen_at: now,
      times_seen: Number(previous.times_seen || 1) + 1,
      emne_ids: unique2([...previous.emne_ids || [], ...incoming.emne_ids || []]),
      concepts: unique2([...previous.concepts || [], ...incoming.concepts || []]),
      terms: unique2([...previous.terms || [], ...incoming.terms || []]),
      tags: unique2([...previous.tags || [], ...incoming.tags || []])
    };
  }
  function upsertEntry(entry) {
    if (!(entry == null ? void 0 : entry.id) || !(entry == null ? void 0 : entry.text)) return null;
    const rows = getEntries();
    const index = rows.findIndex((row) => s(row == null ? void 0 : row.id) === s(entry.id));
    const now = (/* @__PURE__ */ new Date()).toISOString();
    if (index >= 0) {
      rows[index] = mergeEntry(rows[index], entry, now);
      saveEntries(rows);
      return rows[index];
    }
    const next = {
      schema: SCHEMA,
      version: VERSION,
      learned_at: now,
      last_seen_at: now,
      times_seen: 1,
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
        version: QUALITY_VERSION,
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
    const candidates = unique2(learningLog.flatMap((event) => normalizeTargetIds(event))).sort((a, b) => b.length - a.length);
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
          version: QUALITY_VERSION,
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
      previous.emne_ids = unique2([...previous.emne_ids || [], ...entry.emne_ids || []]);
      previous.concepts = unique2([...previous.concepts || [], ...entry.concepts || []]);
      previous.terms = unique2([...previous.terms || [], ...entry.terms || []]);
      previous.tags = unique2([...previous.tags || [], ...entry.tags || []]);
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
              content_quality: { version: QUALITY_VERSION, precise_claim: true }
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
              content_quality: { version: QUALITY_VERSION, precise_claim: true, migrated: true },
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
    const eventSet = new Set(unique2(eventConcepts).map((value) => value.toLowerCase()));
    return unique2(entryConcepts).reduce((score, concept) => eventSet.has(concept.toLowerCase()) ? score + 1 : score, 0);
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
        emne_ids: unique2(best.emneIds),
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
        const concepts = unique2([...emne.core_concepts || [], ...emne.keywords || []]);
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
    const fromLog = unique2(learningLog.filter((event) => {
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
          core_concepts: unique2(emne.core_concepts || []),
          dimensions: unique2(emne.dimensions || []),
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
    return {
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
  }
  var api = {
    SCHEMA,
    VERSION,
    QUALITY_VERSION,
    KEYS: { ENTRIES: ENTRY_KEY, LEGACY: LEGACY_KEY, LEARNING_LOG: LEARNING_LOG_KEY },
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
    getContractHealth
  };
  root.HGKnowledgeV2 = api;
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
