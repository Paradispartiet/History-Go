(function (global) {
  "use strict";

  const INDEX_KEY = "aha_calibration_index_v1";
  const INDEX_VERSION = "aha_calibration_index_v1";
  const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
  const HG_RAW_BASE = "https://raw.githubusercontent.com/Paradispartiet/History-Go/main/";
  const EMNER_LOADER_URL = HG_RAW_BASE + "js/emnerLoader.js";
  const PLACES_MANIFEST_URL = HG_RAW_BASE + "data/places/manifest.json";
  const STOPWORDS = new Set(["og","i","på","av","for","til","med","som","det","de","en","et","er","å","om","fra","den","at","har","kan","ikke"]);

  let _index = null;
  let _loadingPromise = null;
  const _status = { loaded: false, loading: false, source_count: 0, fag_file_count: 0, place_file_count: 0, concept_count: 0, category_count: 0, relation_count: 0, theory_hook_count: 0, method_count: 0, last_error: null, cached: false };

  function emptyIndex() {
    return { version: INDEX_VERSION, generated_at: new Date().toISOString(), source: "historygo_fag", subjects: [], subjectProfiles: [], categories: [], categoryProfiles: [], concepts: [], relations: [], progressionLevels: [], theoryHooks: [], methodProfiles: [], questionPatterns: [], conflictPatterns: [], blindspotPatterns: [], nextStepRules: [], placeContext: [] };
  }
  function norm(v){ return String(v||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9æøå\s_-]+/gi," ").replace(/\s+/g," ").trim(); }
  function arr(v){ return Array.isArray(v)?v:(v==null?[]:[v]); }
  function uniq(a){ return Array.from(new Set(a.filter(Boolean))); }
  async function fetchJson(url){ const r=await fetch(url); if(!r.ok) throw new Error("Fetch failed "+url); return r.json(); }
  async function fetchText(url){ const r=await fetch(url); if(!r.ok) throw new Error("Fetch failed "+url); return r.text(); }

  function extractEmnerPaths(loaderText) {
    const m = loaderText.match(/EMNER_INDEX\s*=\s*(\[[\s\S]*?\]);/);
    if (!m) return [];
    try {
      const list = JSON.parse(m[1].replace(/\/(\/\/.*)$/gm, ""));
      return list.map((e) => String(e.path || "")).filter((p) => p.includes("data/fag/"));
    } catch { return []; }
  }

  function buildFromEmne(index, emne) {
    const emneId = emne.emne_id || emne.id || norm(emne.title);
    const subjectId = emne.subject_id || emne.domain || "unknown";
    const areaId = emne.area_id || "";
    const areaLabel = emne.area_label || "";

    const conceptSources = [
      ["keywords", 1.2], ["key_concepts", 1.6], ["core_concepts", 2.2], ["sub_concepts", 1.3], ["dimensions", 1.2], ["analysis_axes", 1.2], ["methods", 1.2], ["conflicts", 1.2], ["ideological_dimensions", 1.2]
    ];
    conceptSources.forEach(([field, w]) => arr(emne[field]).forEach((label) => {
      const key = norm(label); if (!key || STOPWORDS.has(key) || key.length < 3) return;
      index.concepts.push({ key, label: String(label), score_weight: w, source_field: field, emne_id: emneId, subject_id: subjectId, area_id: areaId, area_label: areaLabel, source: "historygo_fag" });
    }));
    ["title","definition","why_it_matters"].forEach((f) => { if (emne[f]) index.concepts.push({ key: norm(emne[f]), label: String(emne[f]), score_weight: f === "title" ? 1.8 : 1.4, source_field: f, emne_id: emneId, subject_id: subjectId, area_id: areaId, area_label: areaLabel, source: "historygo_fag" }); });

    arr(emne.related_emner).forEach((target)=> index.relations.push({ type: "related_emne", from: emneId, to: target, subject_id: subjectId }));
    if (emne.parent_emne_id) index.relations.push({ type: "parent", from: emneId, to: emne.parent_emne_id, subject_id: subjectId });
    ["area_id","area_label","domain","logic_family","akse"].forEach((f) => emne[f] && index.relations.push({ type: f, from: emneId, value: emne[f], subject_id: subjectId }));

    index.progressionLevels.push({ emne_id: emneId, level: emne.level, progression_stage: emne.progression_stage, pedagogical_track: emne.pedagogical_track, history_weight: emne.history_weight, theory_weight: emne.theory_weight, broadness: emne.broadness, quiz_priority: emne.quiz_priority });
    index.theoryHooks.push({ id: emneId + "_theory", source_emne_id: emneId, canonical_thinkers: arr(emne.canonical_thinkers), canonical_thinker_ids: arr(emne.canonical_thinker_ids), norwegian_thinkers: arr(emne.norwegian_thinkers), primary_theory_hooks: arr(emne.primary_theory_hooks), secondary_theory_hooks: arr(emne.secondary_theory_hooks), reserve_theory_hooks: arr(emne.reserve_theory_hooks), theory_progression_note: emne.theory_progression_note || "" });
    index.methodProfiles.push({ id: emneId + "_methods", source_emne_id: emneId, methods: arr(emne.methods), method_ids: arr(emne.method_ids), recommended_methods: arr(emne.recommended_methods) });
    index.questionPatterns.push({ emne_id: emneId, key_questions: arr(emne.key_questions), quiz_angles: arr(emne.quiz_angles), question_surface_mode: emne.question_surface_mode, generator_use_note: emne.generator_use_note });
    index.conflictPatterns.push({ emne_id: emneId, conflicts: arr(emne.conflicts), ideological_dimensions: arr(emne.ideological_dimensions), analysis_axes: arr(emne.analysis_axes), anti_patterns: arr(emne.anti_patterns) });
    index.blindspotPatterns.push({ emne_id: emneId, blindspots: arr(emne.blindspots), theory_overreach_risk: emne.theory_overreach_risk, overlap_risk: emne.overlap_risk, scope_guard: emne.scope_guard });
    index.nextStepRules.push({ emne_id: emneId, progression_stage: emne.progression_stage, pedagogical_track: emne.pedagogical_track, recommended_set_phases: arr(emne.recommended_set_phases), generator_constraints: emne.generator_constraints, requires_history_anchor: emne.requires_history_anchor, requires_visible_trace: emne.requires_visible_trace });
    index.subjects.push({ subject_id: subjectId, title: emne.title || emne.short_label || emneId });
    index.categories.push({ id: areaId || emne.domain || subjectId, label: areaLabel || emne.domain || subjectId, subject_id: subjectId, emne_id: emneId });
    index.subjectProfiles.push({ emne_id: emneId, subject_id: subjectId, domain: emne.domain, area_id: areaId, area_label: areaLabel, title: emne.title, short_label: emne.short_label, level: emne.level, progression_stage: emne.progression_stage });
  }

  async function buildIndex() {
    const index = emptyIndex();
    const loaderText = await fetchText(EMNER_LOADER_URL);
    const fagPaths = extractEmnerPaths(loaderText);
    _status.fag_file_count = fagPaths.length;
    for (const path of fagPaths) {
      try {
        const data = await fetchJson(HG_RAW_BASE + path);
        const emner = Array.isArray(data) ? data : (data && Array.isArray(data.emner) ? data.emner : []);
        emner.forEach((emne) => buildFromEmne(index, emne || {}));
      } catch (e) { _status.last_error = String(e && e.message || e); }
    }
    try {
      const manifest = await fetchJson(PLACES_MANIFEST_URL);
      const files = arr(manifest.files || manifest.place_files || manifest);
      _status.place_file_count = files.length;
      for (const f of files.slice(0, 120)) {
        const path = typeof f === "string" ? f : (f.path || f.file || "");
        if (!path) continue;
        try {
          const placeData = await fetchJson(HG_RAW_BASE + path.replace(/^\.?\/?/, ""));
          index.placeContext.push({ path, sample: placeData && placeData.name ? placeData.name : (placeData && placeData.title ? placeData.title : null), place_type: placeData && placeData.type, categories: arr(placeData && (placeData.categories || placeData.category_ids)) });
        } catch {}
      }
    } catch {}

    index.subjects = uniq(index.subjects.map((s) => s.subject_id)).map((id) => ({ subject_id: id }));
    const catMap = new Map(); index.categories.forEach((c) => { const k = norm(c.id || c.label); if (k && !catMap.has(k)) catMap.set(k, c); }); index.categories = Array.from(catMap.values());
    const cMap = new Map(); index.concepts.forEach((c) => { if (!c.key || STOPWORDS.has(c.key) || c.key.length < 3) return; const k = c.key + "::" + c.emne_id; if (!cMap.has(k)) cMap.set(k, c); }); index.concepts = Array.from(cMap.values());
    return index;
  }

  function cacheIndex(index) { try { localStorage.setItem(INDEX_KEY, JSON.stringify({ cached_at: Date.now(), index })); } catch {} }
  function readCache() { try { const raw = localStorage.getItem(INDEX_KEY); if(!raw) return null; const parsed = JSON.parse(raw); if(!parsed||!parsed.index) return null; return parsed; } catch { return null; } }

  async function ensureLoaded(force) {
    if (_index && !force) return _index;
    if (_loadingPromise && !force) return _loadingPromise;
    _status.loading = true;
    _loadingPromise = (async () => {
      const cached = readCache();
      if (!force && cached && (Date.now() - (cached.cached_at || 0) < CACHE_TTL_MS)) {
        _index = cached.index; _status.cached = true; _status.loaded = true; _status.loading = false; return _index;
      }
      try {
        _index = await buildIndex();
        _status.cached = false; _status.loaded = true; _status.last_error = null;
        cacheIndex(_index);
      } catch (e) {
        _status.last_error = String(e && e.message || e);
        if (cached && cached.index) { _index = cached.index; _status.cached = true; _status.loaded = true; }
        else { _index = emptyIndex(); _status.loaded = false; }
      }
      _status.loading = false;
      _status.source_count = 1 + (_status.place_file_count > 0 ? 1 : 0);
      _status.concept_count = (_index.concepts || []).length;
      _status.category_count = (_index.categories || []).length;
      _status.relation_count = (_index.relations || []).length;
      _status.theory_hook_count = (_index.theoryHooks || []).length;
      _status.method_count = (_index.methodProfiles || []).length;
      return _index;
    })();
    return _loadingPromise;
  }

  function matchText(text, options) {
    const index = _index || emptyIndex();
    const topN = Math.max(1, Number(options && options.topN) || 12);
    const raw = String(text || ""); const n = norm(raw);
    const words = new Set(n.split(" ").filter((w) => w && !STOPWORDS.has(w)));
    const emneScores = new Map();
    const concepts = [];
    (index.concepts || []).forEach((c) => {
      if (!c.key || c.key.length < 3) return;
      const isPhrase = c.key.includes(" ");
      const exact = n.includes(c.key);
      const partial = !isPhrase && words.has(c.key);
      if (!exact && !partial) return;
      let score = (c.score_weight || 1) * (isPhrase ? 1.25 : 1);
      if (c.source_field === "definition" || c.source_field === "why_it_matters") score *= 1.2;
      concepts.push({ key: c.key, label: c.label, score, subject_id: c.subject_id, emne_id: c.emne_id, area_id: c.area_id, area_label: c.area_label, source: "historygo_fag_calibration" });
      emneScores.set(c.emne_id, (emneScores.get(c.emne_id) || 0) + score);
    });

    const matchedConcepts = concepts.sort((a,b)=>b.score-a.score).slice(0, topN);
    const matchedEmner = Array.from(emneScores.entries()).sort((a,b)=>b[1]-a[1]).slice(0, topN).map(([emne_id, score]) => {
      const p = (index.subjectProfiles || []).find((x) => x.emne_id === emne_id) || {};
      return { emne_id, subject_id: p.subject_id, title: p.title, short_label: p.short_label, score, level: p.level, progression_stage: p.progression_stage };
    });
    const matchedCategories = (index.categories || []).map((c)=>({id:c.id,label:c.label,score:n.includes(norm(c.label))?1:0})).filter((c)=>c.score>0).slice(0, topN);
    const matchedTheory = (index.theoryHooks || []).flatMap((t)=>uniq([].concat(t.primary_theory_hooks||[],t.secondary_theory_hooks||[],t.reserve_theory_hooks||[],t.canonical_thinkers||[],t.norwegian_thinkers||[])).map((label)=>({id:norm(label),label,source_emne_id:t.source_emne_id,score:n.includes(norm(label))?1.6:0}))).filter((x)=>x.score>0).slice(0, topN);
    const matchedMethods = (index.methodProfiles || []).flatMap((m)=>uniq([].concat(m.methods||[],m.recommended_methods||[],m.method_ids||[])).map((label)=>({id:norm(label),label,source_emne_id:m.source_emne_id,score:n.includes(norm(label))?1.5:0}))).filter((x)=>x.score>0).slice(0, topN);

    return { matched_concepts: matchedConcepts, matched_categories: matchedCategories, matched_emner: matchedEmner, matched_theory_hooks: matchedTheory, matched_methods: matchedMethods, conflict_patterns: [], blindspot_patterns: [], suggested_next_steps: [], calibration_score: Math.min(1, matchedConcepts.reduce((s,c)=>s+c.score,0)/12), source: "historygo_fag_calibration" };
  }

  function getStatus(){ return Object.assign({}, _status); }
  function getIndex(){ return _index || emptyIndex(); }
  async function rebuild(){ return ensureLoaded(true); }

  global.AHACalibration = { ensureLoaded, getIndex, matchText, getStatus, rebuild };
})(window);
