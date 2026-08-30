// @ts-nocheck
// Shared read model for Politikk: badge, canonical subject data, textbook and places.
(function installPolitikkFagModel(global) {
  'use strict';

  const MANIFEST_URL = 'data/fag/politikk/politikk_runtime_manifest.json';
  let corePromise = null;
  let fullPromise = null;

  function text(value) {
    return String(value == null ? '' : value).trim();
  }

  function list(value) {
    return Array.isArray(value) ? value : [];
  }

  function unique(values) {
    const seen = new Set();
    return values.map(text).filter((value) => value && !seen.has(value) && seen.add(value));
  }

  function projectRoot() {
    const script = document.currentScript;
    const src = script instanceof HTMLScriptElement ? script.src : '';
    return src ? new URL('../', src).toString() : new URL('./', global.location.href).toString();
  }

  const PROJECT_ROOT = projectRoot();

  async function fetchJson(path) {
    const url = new URL(path, PROJECT_ROOT).toString();
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`${response.status} ${path}`);
    return response.json();
  }

  function storageJson(key, fallback) {
    try {
      const parsed = JSON.parse(global.localStorage?.getItem(key) || '');
      return parsed == null ? fallback : parsed;
    } catch {
      return fallback;
    }
  }

  function normalizeConcept(value) {
    return text(value).toLocaleLowerCase('nb-NO');
  }

  function conceptsForEmne(emne) {
    return unique([
      ...list(emne?.core_concepts),
      ...list(emne?.key_concepts),
      ...list(emne?.sub_concepts),
      ...list(emne?.keywords)
    ]);
  }

  function emneTitle(emne) {
    return text(emne?.title || emne?.short_label || emne?.emne_id);
  }

  function deriveTier(badge, points) {
    const tiers = list(badge?.tiers)
      .map((tier, index) => ({ ...tier, index, threshold: Number(tier?.threshold || 0) }))
      .sort((a, b) => a.threshold - b.threshold);
    let current = { index: -1, label: 'Nybegynner', threshold: 0 };
    for (const tier of tiers) {
      if (points >= tier.threshold) current = { index: tier.index, label: text(tier.label), threshold: tier.threshold };
    }
    const next = tiers.find((tier) => tier.threshold > points) || null;
    const span = next ? Math.max(1, next.threshold - current.threshold) : 1;
    const progress = next ? Math.max(0, Math.min(100, ((points - current.threshold) / span) * 100)) : 100;
    return { ...current, next, progress };
  }

  function domainIdForEmne(core, emne) {
    const direct = text(emne?.domain || emne?.area_id || emne?.logic_family);
    if (direct && core.domainsById.has(direct)) return direct;
    const id = text(emne?.emne_id);
    return list(core.pensum?.domains).find((domain) => list(domain?.emne_ids).includes(id))?.domain_id || '';
  }

  function chapterIdsForEmne(core, emne) {
    const id = text(emne?.emne_id);
    const explicit = text(core.manifest?.chapterByEmne?.[id]);
    if (explicit) return [explicit];
    const domainId = domainIdForEmne(core, emne);
    const chapter = text(core.manifest?.chapterByDomain?.[domainId]);
    return chapter ? [chapter] : [];
  }

  function chapterIdsForDomain(core, domainId) {
    const chapter = text(core.manifest?.chapterByDomain?.[text(domainId)]);
    return chapter ? [chapter] : [];
  }

  function underbadgeIdsForDomain(core, domainId) {
    const target = text(domainId);
    return Object.entries(core.manifest?.underbadgeDomains || {})
      .filter(([, domainIds]) => list(domainIds).map(text).includes(target))
      .map(([id]) => id);
  }

  function subjectUrl() {
    return 'fagverk.html?subject=politikk#fagverkIaProgresjon';
  }

  function textbookUrl(extras = {}) {
    const params = new URLSearchParams({ subject: 'politikk' });
    for (const [key, value] of Object.entries(extras)) {
      const normalized = text(value);
      if (normalized) params.set(key, normalized);
    }
    return `fagverk.html?${params.toString()}`;
  }

  function domainUrl(domainId, extras = {}) {
    return textbookUrl({ domain: domainId, ...extras });
  }

  function emneUrl(emneId, extras = {}) {
    const core = coreCache();
    const emne = core?.emnersById?.get(text(emneId));
    const domain = emne ? domainIdForEmne(core, emne) : '';
    const chapter = emne ? chapterIdsForEmne(core, emne)[0] : '';
    return textbookUrl({ domain, chapter, emne: emneId, ...extras });
  }

  function chapterUrl(chapterId, extras = {}) {
    return textbookUrl({ chapter: chapterId, ...extras });
  }

  function placePageUrl(placeId) {
    return `fagverk-sted.html?place=${encodeURIComponent(text(placeId))}`;
  }

  let lastCore = null;
  function coreCache() {
    return lastCore;
  }

  function buildCore(manifest, badge, pensum, emners, registry, curriculum, conceptDocument) {
    const domains = list(pensum?.domains);
    const domainOrder = list(pensum?.domain_order);
    const domainsById = new Map(domains.map((domain) => [text(domain?.domain_id), domain]));
    const orderedDomains = domainOrder.map((id) => domainsById.get(text(id))).filter(Boolean);
    for (const domain of domains) if (!orderedDomains.includes(domain)) orderedDomains.push(domain);
    const emnersById = new Map(list(emners).map((emne) => [text(emne?.emne_id), emne]));
    const chapters = list(registry?.subjects?.politikk?.chapters);
    const chaptersById = new Map(chapters.map((chapter) => [text(chapter?.id), chapter]));
    const concepts = list(conceptDocument?.concepts);
    const conceptsById = new Map(concepts.map((concept) => [text(concept?.concept_id), concept]));
    const underbadges = list(badge?.sub).map((id) => ({
      id: text(id),
      label: text(manifest?.underbadgeLabels?.[id]) || text(id).replaceAll('_', ' '),
      domainIds: list(manifest?.underbadgeDomains?.[id]).map(text).filter(Boolean)
    }));
    const core = {
      manifest,
      badge,
      pensum,
      emners: list(emners),
      registry,
      domains: orderedDomains,
      domainsById,
      emnersById,
      chapters,
      chaptersById,
      curriculum,
      conceptDocument,
      concepts,
      conceptsById,
      underbadges
    };
    lastCore = core;
    return core;
  }

  function loadCore() {
    if (!corePromise) {
      corePromise = (async () => {
        const manifest = await fetchJson(MANIFEST_URL);
        const sources = manifest?.sourceOfTruth || {};
        const [badge, pensum, emners, registry, curriculum, conceptDocument] = await Promise.all([
          fetchJson(sources.badge),
          fetchJson(sources.pensum),
          fetchJson(sources.emner),
          fetchJson(sources.fagverkRegistry),
          fetchJson(sources.curriculum),
          fetchJson(sources.concepts)
        ]);
        return buildCore(manifest, badge, pensum, emners, registry, curriculum, conceptDocument);
      })().catch((error) => {
        corePromise = null;
        throw error;
      });
    }
    return corePromise;
  }

  function loadFull() {
    if (!fullPromise) {
      fullPromise = (async () => {
        const core = await loadCore();
        const sources = core.manifest?.sourceOfTruth || {};
        const [fagkart, methods, emnemapping] = await Promise.all([
          fetchJson(sources.fagkart),
          fetchJson(sources.methods),
          fetchJson(sources.emnemapping)
        ]);
        return { ...core, fagkart, methods, emnemapping };
      })().catch((error) => {
        fullPromise = null;
        throw error;
      });
    }
    return fullPromise;
  }

  function resolvePlace(core, place) {
    const placeId = text(place?.id);
    const curated = core.registry?.placeLinks?.[placeId] || {};
    const emneIds = unique([
      ...list(place?.emne_ids || place?.emneIds),
      ...list(curated?.emneIds)
    ]);
    const emners = emneIds.map((id) => core.emnersById.get(id)).filter(Boolean);
    const underbadgeIds = unique(place?.underbadge_ids || place?.underbadgeIds || []);
    const domainIds = unique([
      ...emners.map((emne) => domainIdForEmne(core, emne)),
      ...underbadgeIds.flatMap((id) => list(core.manifest?.underbadgeDomains?.[id]))
    ]);
    const chapterIds = unique([
      ...emners.flatMap((emne) => chapterIdsForEmne(core, emne)),
      ...domainIds.flatMap((id) => chapterIdsForDomain(core, id))
    ]);
    const concepts = unique(emners.flatMap(conceptsForEmne));
    return {
      placeId,
      curated,
      subject: emners.length || underbadgeIds.length || text(place?.category) === 'politikk' ? 'politikk' : '',
      emneIds,
      emners,
      underbadgeIds,
      underbadges: underbadgeIds.map((id) => core.underbadges.find((item) => item.id === id)).filter(Boolean),
      domainIds,
      domains: domainIds.map((id) => core.domainsById.get(id)).filter(Boolean),
      chapterIds,
      chapters: chapterIds.map((id) => core.chaptersById.get(id)).filter(Boolean),
      concepts
    };
  }

  function readLearningSignals() {
    const userId = global.getCurrentUserId?.() || 'anon';
    const concepts = global.getUserConceptsFromLearningLog?.()
      || global.HGInsights?.getUserConcepts?.(userId)
      || [];
    const emneHits = global.getUserEmneHitsFromLearningLog?.() || new Set();
    return {
      concepts: unique(list(concepts)),
      emneHits: emneHits instanceof Set ? emneHits : new Set(list(emneHits).map(text))
    };
  }

  function manualCoverage(signals, emners) {
    const conceptSet = new Set(signals.concepts.map(normalizeConcept));
    return emners.map((emne) => {
      const concepts = unique(list(emne?.core_concepts).length ? emne.core_concepts : conceptsForEmne(emne));
      const matched = concepts.filter((concept) => conceptSet.has(normalizeConcept(concept)));
      const direct = signals.emneHits.has(text(emne?.emne_id));
      const matchCount = direct ? concepts.length : matched.length;
      const total = concepts.length;
      return {
        emne_id: text(emne?.emne_id),
        title: emneTitle(emne),
        total,
        matchCount,
        percent: total ? Math.round((matchCount / total) * 100) : 0
      };
    });
  }

  function coverageFor(core, signals = readLearningSignals()) {
    if (typeof global.computeEmneDekningV2 === 'function') {
      try {
        return global.computeEmneDekningV2(signals.concepts, core.emners, { emneHits: signals.emneHits });
      } catch {}
    }
    return manualCoverage(signals, core.emners);
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
    if (Array.isArray(raw)) return new Set(raw.map(text).filter(Boolean));
    return new Set(Object.entries(raw || {}).filter(([, value]) => Boolean(value)).map(([id]) => text(id)).filter(Boolean));
  }

  function readProgress(core, places = []) {
    const merits = storageJson('merits_by_category', {});
    const merit = merits.politikk || merits[core.badge?.name] || {};
    const points = Number(merit?.points || 0);
    const tier = deriveTier(core.badge, points);
    const signals = readLearningSignals();
    const coverage = coverageFor(core, signals);
    const coverageById = new Map(coverage.map((row) => [text(row?.emne_id || row?.id), row]));
    const visited = visitedPlaceIds();
    const politicsHistory = quizHistory().filter((entry) => text(entry?.categoryId || entry?.category) === 'politikk');
    const allPlaces = list(places);
    const underbadgeProgress = core.underbadges.map((underbadge) => {
      const relevant = allPlaces.filter((place) => unique(place?.underbadge_ids || place?.underbadgeIds || []).includes(underbadge.id));
      const done = relevant.filter((place) => visited.has(text(place?.id))).length;
      return { ...underbadge, totalPlaces: relevant.length, visitedPlaces: done };
    });
    const domainProgress = core.domains.map((domain) => {
      const rows = list(domain?.emne_ids).map((id) => coverageById.get(text(id))).filter(Boolean);
      const percent = rows.length ? Math.round(rows.reduce((sum, row) => sum + Number(row?.percent || 0), 0) / rows.length) : 0;
      return { domainId: text(domain?.domain_id), percent, emneCount: rows.length };
    });
    return { points, tier, coverage, coverageById, underbadgeProgress, domainProgress, quizHistory: politicsHistory, visited };
  }

  global.HGPolitikkFagModel = {
    loadCore,
    loadFull,
    resolvePlace,
    readProgress,
    conceptsForEmne,
    emneTitle,
    domainIdForEmne,
    chapterIdsForEmne,
    chapterIdsForDomain,
    underbadgeIdsForDomain,
    subjectUrl,
    textbookUrl,
    domainUrl,
    emneUrl,
    chapterUrl,
    placePageUrl,
    PROJECT_ROOT
  };
})(window);
