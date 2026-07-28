// @ts-nocheck
(function installFagverkSubjectModel(global) {
  'use strict';

  const CORE = global.HGFagverkSubjectCore;
  if (!CORE) throw new Error('HGFagverkSubjectCore må lastes før fagverk-subject-model.js');

  const PATHS = Object.freeze({
    categories: 'data/categories/category_contract.json',
    manifest: 'data/fag/fag_manifest.json',
    portal: 'data/fagverk/fagverk_portal.json',
    inventory: 'data/fagverk/subject_inventory.json',
    status: 'data/fagverk/subject_status.json',
    registry: 'data/fagverk/fagverk_registry.json'
  });

  function projectRoot() {
    const script = document.currentScript;
    const src = script instanceof HTMLScriptElement ? script.src : '';
    return src ? new URL('../', src).toString() : new URL('./', global.location.href).toString();
  }

  const PROJECT_ROOT = projectRoot();
  let controlsPromise = null;
  const subjectPromises = new Map();

  async function fetchJson(path, { optional = false } = {}) {
    const url = new URL(path, PROJECT_ROOT).toString();
    const response = await fetch(url, { cache: 'no-store' });
    if (optional && response.status === 404) return null;
    if (!response.ok) throw new Error(`${response.status} ${path}`);
    return response.json();
  }

  function loadControls() {
    if (!controlsPromise) {
      controlsPromise = Promise.all(Object.values(PATHS).map((path) => fetchJson(path)))
        .then(([categories, manifest, portal, inventory, status, registry]) => ({
          categories,
          manifest,
          portal,
          inventory,
          status,
          registry,
          portalById: new Map(CORE.list(portal?.categories).map((item) => [CORE.text(item?.id), item])),
          inventoryById: new Map(CORE.list(inventory?.subjects).map((item) => [CORE.text(item?.id), item])),
          statusById: new Map(CORE.list(status?.subjects).map((item) => [CORE.text(item?.id), item]))
        }))
        .catch((error) => {
          controlsPromise = null;
          throw error;
        });
    }
    return controlsPromise;
  }

  function load(subjectId, { allowPlanned = false } = {}) {
    const cacheKey = `${CORE.text(subjectId)}:${allowPlanned ? 'planned-ok' : 'materialized'}`;
    if (!subjectPromises.has(cacheKey)) {
      subjectPromises.set(cacheKey, (async () => {
        const controls = await loadControls();
        const id = CORE.resolveCanonicalSubjectId(subjectId, controls.categories, controls.manifest);
        const portalEntry = controls.portalById.get(id);
        const inventoryEntry = controls.inventoryById.get(id);
        const statusEntry = controls.statusById.get(id);
        if (!portalEntry || !inventoryEntry || !statusEntry) throw new Error(`${id}: mangler portal-, inventory- eller statusoppføring`);
        if (!allowPlanned && portalEntry.subjectStatus !== 'materialized') throw new Error(`Faget ${id} er ikke teknisk materialisert ennå.`);
        if (portalEntry.subjectStatus !== statusEntry.navigationStatus) throw new Error(`${id}: portal- og statusregister er usynkronisert`);

        const manifestEntry = controls.manifest[id];
        const required = CORE.list(inventoryEntry.requiredManifestFields);
        const coreFields = ['pensum', 'emner', 'fagkart', 'methods'];
        for (const field of coreFields) {
          if (!required.includes(field) || !CORE.text(manifestEntry?.[field])) throw new Error(`${id}: mangler required manifestfelt ${field}`);
        }
        const [pensum, emners, fagkart, methods, badge] = await Promise.all([
          fetchJson(CORE.resolveManifestPointer(manifestEntry.pensum)),
          fetchJson(CORE.resolveManifestPointer(manifestEntry.emner)),
          fetchJson(CORE.resolveManifestPointer(manifestEntry.fagkart)),
          fetchJson(CORE.resolveManifestPointer(manifestEntry.methods)),
          fetchJson(`data/badges/${encodeURIComponent(id)}.json`, { optional: true })
        ]);

        return CORE.normalizeSubject({
          subjectId: id,
          categoryLabel: controls.categories?.labels?.[id],
          categoryDescription: controls.categories?.decisions?.[id],
          schemaFamily: inventoryEntry.schemaFamily,
          manifestEntry,
          portalEntry,
          inventoryEntry,
          statusEntry,
          registry: controls.registry,
          badge,
          source: { pensum, emners, fagkart, methods }
        });
      })().catch((error) => {
        subjectPromises.delete(cacheKey);
        throw error;
      }));
    }
    return subjectPromises.get(cacheKey);
  }

  function storageJson(key, fallback) {
    try {
      const parsed = JSON.parse(global.localStorage?.getItem(key) || '');
      return parsed == null ? fallback : parsed;
    } catch {
      return fallback;
    }
  }

  function readLearningSignals() {
    const userId = global.getCurrentUserId?.() || 'anon';
    const concepts = global.getUserConceptsFromLearningLog?.()
      || global.HGInsights?.getUserConcepts?.(userId)
      || [];
    const emneHits = global.getUserEmneHitsFromLearningLog?.() || new Set();
    return {
      concepts: CORE.unique(CORE.list(concepts)),
      emneHits: emneHits instanceof Set ? emneHits : new Set(CORE.list(emneHits).map(CORE.text))
    };
  }

  function manualCoverage(model, signals) {
    const conceptSet = new Set(signals.concepts.map((value) => CORE.text(value).toLocaleLowerCase('nb-NO')));
    return model.emners.map((emne) => {
      const matched = emne.concepts.filter((concept) => conceptSet.has(concept.toLocaleLowerCase('nb-NO')));
      const direct = signals.emneHits.has(emne.id);
      const matchCount = direct ? emne.concepts.length : matched.length;
      const total = emne.concepts.length;
      return { emne_id: emne.id, title: emne.title, total, matchCount, percent: total ? Math.round((matchCount / total) * 100) : 0 };
    });
  }

  function coverageFor(model, signals = readLearningSignals()) {
    if (typeof global.computeEmneDekningV2 === 'function') {
      try {
        return global.computeEmneDekningV2(signals.concepts, model.source.emners, { emneHits: signals.emneHits });
      } catch {}
    }
    return manualCoverage(model, signals);
  }

  function quizHistory() {
    const fromRuntime = global.HGLearningLog?.getQuizHistory?.();
    if (Array.isArray(fromRuntime)) return fromRuntime;
    const log = storageJson('hg_learning_log_v1', {});
    if (Array.isArray(log?.quizHistory)) return log.quizHistory;
    const legacy = storageJson('quiz_history', []);
    return Array.isArray(legacy) ? legacy : [];
  }

  function visitedPlaceIds() {
    const raw = storageJson('visited_places', {});
    if (Array.isArray(raw)) return new Set(raw.map(CORE.text).filter(Boolean));
    return new Set(Object.entries(raw || {}).filter(([, value]) => Boolean(value)).map(([id]) => CORE.text(id)).filter(Boolean));
  }

  function readProgress(model) {
    const merits = storageJson('merits_by_category', {});
    const merit = merits?.[model.subject.id] || merits?.[model.subject.badge.title] || {};
    const points = Number(merit?.points || 0);
    const tier = CORE.deriveTier(model.subject.badge, points);
    const coverage = coverageFor(model);
    const coverageById = new Map(coverage.map((row) => [CORE.text(row?.emne_id || row?.id), row]));
    const domainProgress = model.domains.map((domain) => {
      const rows = domain.emneIds.map((id) => coverageById.get(id)).filter(Boolean);
      const percent = rows.length ? Math.round(rows.reduce((sum, row) => sum + Number(row?.percent || 0), 0) / rows.length) : 0;
      return { domainId: domain.id, percent, emneCount: rows.length };
    });
    const subjectQuizHistory = quizHistory().filter((entry) => {
      const category = CORE.text(entry?.categoryId || entry?.category || entry?.subjectId || entry?.subject);
      return category === model.subject.id;
    });
    const visited = visitedPlaceIds();
    const visitedPlaces = model.places.filter((place) => visited.has(place.id)).length;
    return { points, tier, coverage, coverageById, domainProgress, quizHistory: subjectQuizHistory, visited, visitedPlaces };
  }

  function subjectUrl(subjectId, extras = {}) {
    const params = new URLSearchParams({ subject: CORE.text(subjectId) });
    for (const [key, value] of Object.entries(extras)) {
      const normalized = CORE.text(value);
      if (normalized) params.set(key, normalized);
    }
    return `fagverk.html?${params.toString()}`;
  }

  function domainUrl(subjectId, domainId, extras = {}) {
    return subjectUrl(subjectId, { domain: domainId, ...extras });
  }

  function emneUrl(subjectId, domainId, emneId, extras = {}) {
    return subjectUrl(subjectId, { domain: domainId, emne: emneId, ...extras });
  }

  function chapterUrl(subjectId, chapterId, extras = {}) {
    return subjectUrl(subjectId, { chapter: chapterId, ...extras });
  }

  function placePageUrl(placeId) {
    return `fagverk-sted.html?place=${encodeURIComponent(CORE.text(placeId))}`;
  }

  global.HGFagverkSubjectModel = {
    PATHS,
    PROJECT_ROOT,
    loadControls,
    load,
    readProgress,
    subjectUrl,
    domainUrl,
    emneUrl,
    chapterUrl,
    placePageUrl
  };
})(window);
