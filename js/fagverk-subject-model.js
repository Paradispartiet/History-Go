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
  const NATUR_FINAL_PATH = 'data/fag/natur/natur_final_phase_canonical_v1.json';

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

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function unique(values) {
    return [...new Set((Array.isArray(values) ? values : []).filter(Boolean))];
  }

  function composeNaturFinal({ pensum, emners, fagkart, methods, registry, statusEntry, overlay }) {
    if (!overlay || overlay.status !== 'canonical_final_phase_overlay') {
      return { pensum, emners, fagkart, methods, registry, statusEntry };
    }

    const nextPensum = clone(pensum);
    const nextEmners = [...clone(emners), ...clone(overlay.emners || [])];
    const nextMethods = clone(methods);
    nextMethods.methods = [...CORE.list(nextMethods.methods), ...clone(overlay.methods || [])];
    nextMethods.version = 'v5.3-canonical-final-overlay';
    nextMethods.updated_at = overlay.updated_at;

    const patchByDomain = new Map(CORE.list(overlay.domain_patches).map((patch) => [patch.domain_id, patch]));
    for (const domain of CORE.list(nextPensum.domains)) {
      const patch = patchByDomain.get(domain.domain_id);
      if (!patch) continue;
      domain.coverage_status = patch.coverage_status;
      domain.status = patch.status;
      domain.chapter_status = patch.chapter_status;
      if (patch.definition) domain.definition = patch.definition;
      if (patch.question_role) domain.question_role = patch.question_role;
      if (patch.replace_emne_ids) domain.emne_ids = [...patch.replace_emne_ids];
      if (patch.replace_method_ids) domain.method_ids = [...patch.replace_method_ids];
      if (patch.replace_hook_ids) domain.hook_ids = [...patch.replace_hook_ids];
      if (patch.append_emne_ids) domain.emne_ids = unique([...(domain.emne_ids || []), ...patch.append_emne_ids]);
      if (patch.append_method_ids) domain.method_ids = unique([...(domain.method_ids || []), ...patch.append_method_ids]);
      if (patch.append_hook_ids) domain.hook_ids = unique([...(domain.hook_ids || []), ...patch.append_hook_ids]);
      domain.emne_count = CORE.list(domain.emne_ids).length;
      domain.method_count = CORE.list(domain.method_ids).length;
      domain.hook_count = CORE.list(domain.hook_ids).length;
    }
    nextPensum.version = 'v5.3-canonical-final-overlay';
    nextPensum.canonical_registry_version = 'naturpensum_v5_3';
    nextPensum.updated_at = overlay.updated_at;
    nextPensum.summary = {
      ...(nextPensum.summary || {}),
      materialized_domain_count: overlay.completion.materialized_domain_count,
      partial_domain_count: 0,
      required_gap_domain_count: 0,
      current_emne_count: overlay.completion.emne_count,
      current_method_count: overlay.completion.method_count,
      current_mapping_count: overlay.completion.mapping_count,
      current_topic_hook_count: overlay.completion.hook_count,
      all_current_emners_have_mapping: true,
      all_current_method_refs_valid: true,
      editorial_complete: true
    };

    const nextFagkart = clone(fagkart);
    const categories = [...CORE.list(nextFagkart.categories)];
    for (const categoryPatch of CORE.list(overlay.categories)) {
      const index = categories.findIndex((category) => category.id === categoryPatch.id);
      if (categoryPatch.mode === 'replace' || index < 0) {
        const replacement = {
          id: categoryPatch.id,
          title: categoryPatch.title,
          definition: patchByDomain.get(categoryPatch.id)?.definition || '',
          topic_hooks: clone(categoryPatch.topic_hooks || [])
        };
        if (index >= 0) categories[index] = replacement;
        else categories.push(replacement);
      } else {
        const existing = categories[index];
        const incoming = new Set(CORE.list(categoryPatch.topic_hooks).map((hook) => hook.id));
        existing.title = categoryPatch.title || existing.title;
        existing.definition = patchByDomain.get(categoryPatch.id)?.definition || existing.definition;
        existing.topic_hooks = [
          ...CORE.list(existing.topic_hooks).filter((hook) => !incoming.has(hook.id)),
          ...clone(categoryPatch.topic_hooks || [])
        ];
      }
    }
    const order = new Map(CORE.list(nextPensum.domain_order).map((id, index) => [id, index]));
    categories.sort((a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99));
    nextFagkart.categories = categories;
    nextFagkart.version = 'v5.3-canonical-final-overlay';
    nextFagkart.updated_at = overlay.updated_at;
    nextFagkart.meta = {
      ...(nextFagkart.meta || {}),
      category_count: categories.length,
      hook_count: categories.reduce((sum, category) => sum + CORE.list(category.topic_hooks).length, 0),
      canonical_round: 'v5.3'
    };

    const nextRegistry = clone(registry);
    const naturRegistry = nextRegistry?.subjects?.natur;
    if (naturRegistry) {
      const overlayChapterIds = new Set(CORE.list(overlay.chapters).map((chapter) => chapter.id));
      naturRegistry.description = 'Et sammenhengende og universelt læreverk om økologi, artskunnskap, evolusjon, botanikk, zoologi, sopp, mikroorganismer, fysiologi, vann, klima, geologi, urban natur, miljøpåvirkning og forvaltning.';
      naturRegistry.canonicalModel = {
        ...(naturRegistry.canonicalModel || {}),
        note: 'Canonical Natur v5.3 komponerer den frosne fase-2-basisen med sluttfaseoverlayet. Registryet viser tolv redigerte lærekapitler og faget er redaksjonelt complete.'
      };
      naturRegistry.chapters = [
        ...CORE.list(naturRegistry.chapters).filter((chapter) => !overlayChapterIds.has(chapter.id)),
        ...clone(overlay.chapters || [])
      ].sort((a, b) => (order.get(a.primary_domain_id) ?? 99) - (order.get(b.primary_domain_id) ?? 99));
    }

    const nextStatusEntry = clone(statusEntry);
    nextStatusEntry.navigationStatus = 'materialized';
    nextStatusEntry.assessmentStatus = overlay.completion.assessmentStatus;
    nextStatusEntry.editorialStatus = overlay.completion.editorialStatus;
    nextStatusEntry.nextGate = overlay.completion.nextGate;
    nextStatusEntry.note = 'Natur komponerer fase-2-basisen med canonical v5.3-sluttfaseoverlayet: 12/12 fagområder, 77 emner, 51 metoder, 136 hooks og 12 redigerte kapitler.';

    return {
      pensum: nextPensum,
      emners: nextEmners,
      fagkart: nextFagkart,
      methods: nextMethods,
      registry: nextRegistry,
      statusEntry: nextStatusEntry
    };
  }

  function resolveRelativeFagPointer(basePath, pointer) {
    const base = CORE.text(basePath).replaceAll('\\', '/');
    const value = CORE.text(pointer).replaceAll('\\', '/');
    if (!base.startsWith('data/fag/') || !value || value.startsWith('/') || /^[a-z][a-z0-9+.-]*:/i.test(value)) {
      throw new Error(`Ugyldig vitenskapelig fagpeker: ${value}`);
    }
    const parts = base.split('/').slice(0, -1);
    for (const part of value.split('/')) {
      if (!part || part === '.') continue;
      if (part === '..') parts.pop();
      else parts.push(part);
    }
    const resolved = parts.join('/');
    if (!resolved.startsWith('data/fag/')) throw new Error(`Vitenskapelig fagpeker går utenfor data/fag: ${value}`);
    return resolved;
  }

  function buildScientificSource({ index, domainCatalog, modules, methodProtocols }) {
    const topics = modules.flatMap((module) => CORE.list(module?.topics));
    const topicByDomain = new Map();
    for (const topic of topics) {
      const domainId = CORE.text(topic?.domain_id);
      if (!topicByDomain.has(domainId)) topicByDomain.set(domainId, []);
      topicByDomain.get(domainId).push(topic);
    }

    const domains = CORE.list(domainCatalog?.domains).map((domain) => {
      const domainId = CORE.text(domain?.domain_id);
      const domainTopics = topicByDomain.get(domainId) || [];
      return {
        ...domain,
        emne_ids: domainTopics.map((topic) => topic.emne_id),
        method_ids: CORE.unique(domainTopics.flatMap((topic) => CORE.list(topic?.method_protocol_ids)))
      };
    });

    const emners = topics.map((topic) => ({
      ...topic,
      subject_id: index.subject_id,
      definition: topic.evidence_focus,
      why_it_matters: topic.research_question,
      key_questions: topic.research_question ? [topic.research_question] : [],
      method_ids: CORE.list(topic.method_protocol_ids),
      conflicts: topic.topic_specific_inference_limit ? [topic.topic_specific_inference_limit] : [],
      analysis_axes: CORE.list(topic.claim_type_ids),
      status: 'active'
    }));

    const methods = {
      methods: CORE.list(methodProtocols?.protocols).map((method) => ({
        ...method,
        title: method.label,
        data_forms: CORE.list(method.compatible_evidence),
        limitations: CORE.unique([
          ...CORE.list(method.validity_threats),
          method.forbidden_overreach
        ]),
        emne_ids: topics
          .filter((topic) => CORE.list(topic?.method_protocol_ids).includes(method.method_id))
          .map((topic) => topic.emne_id)
      }))
    };

    return {
      pensum: {
        subject_id: index.subject_id,
        subject_title: index.subject_title,
        scope: index.scope,
        purpose: 'Canonical vitenskapelig fagstruktur fra aktiv musikkvitenskapelig pakke.',
        domain_order: domains.map((domain) => domain.domain_id),
        domains
      },
      emners,
      fagkart: {
        subject_id: index.subject_id,
        subject_title: index.subject_title,
        status: index.status
      },
      methods
    };
  }

  async function loadScientificSource(manifestEntry) {
    const packagePath = CORE.resolveManifestPointer(manifestEntry.scientificPackage);
    const scientificPackage = await fetchJson(packagePath);
    const indexPath = resolveRelativeFagPointer(packagePath, scientificPackage.active_scientific_package);
    const index = await fetchJson(indexPath);
    const domainCatalogPath = resolveRelativeFagPointer(indexPath, index?.files?.domain_catalog);
    const methodProtocolsPath = resolveRelativeFagPointer(indexPath, index?.files?.method_protocols);
    const modulePaths = CORE.list(index?.files?.canonical_modules).map((pointer) => resolveRelativeFagPointer(indexPath, pointer));
    if (!modulePaths.length) throw new Error(`${indexPath}: mangler canonical_modules`);
    const [domainCatalog, methodProtocols, ...modules] = await Promise.all([
      fetchJson(domainCatalogPath),
      fetchJson(methodProtocolsPath),
      ...modulePaths.map((path) => fetchJson(path))
    ]);
    return buildScientificSource({ index, domainCatalog, modules, methodProtocols });
  }

  async function loadSubjectSource(manifestEntry) {
    if (CORE.text(manifestEntry?.scientificPackage)) {
      const packagePath = CORE.resolveManifestPointer(manifestEntry.scientificPackage);
      const scientificPackage = await fetchJson(packagePath);
      if (CORE.text(scientificPackage?.active_scientific_package)) return loadScientificSource(manifestEntry);
    }
    return loadLegacySource(manifestEntry);
  }

  async function loadLegacySource(manifestEntry) {
    const [pensum, emners, fagkart, methods, curriculum, concepts, periodGuides, periodModules, runtimeManifest] = await Promise.all([
      fetchJson(CORE.resolveManifestPointer(manifestEntry.pensum)),
      fetchJson(CORE.resolveManifestPointer(manifestEntry.emner)),
      fetchJson(CORE.resolveManifestPointer(manifestEntry.fagkart)),
      fetchJson(CORE.resolveManifestPointer(manifestEntry.methods)),
      CORE.text(manifestEntry.curriculumArchitecture || manifestEntry.curriculum)
        ? fetchJson(CORE.resolveManifestPointer(manifestEntry.curriculumArchitecture || manifestEntry.curriculum))
        : Promise.resolve(null),
      CORE.text(manifestEntry.concepts)
        ? fetchJson(CORE.resolveManifestPointer(manifestEntry.concepts))
        : Promise.resolve([]),
      CORE.text(manifestEntry.periodGuides)
        ? fetchJson(CORE.resolveManifestPointer(manifestEntry.periodGuides))
        : Promise.resolve(null),
      CORE.text(manifestEntry.periodModules)
        ? fetchJson(CORE.resolveManifestPointer(manifestEntry.periodModules))
        : Promise.resolve(null),
      CORE.text(manifestEntry.runtimeManifest)
        ? fetchJson(CORE.resolveManifestPointer(manifestEntry.runtimeManifest))
        : Promise.resolve(null)
    ]);
    return { pensum, emners, fagkart, methods, curriculum, concepts, periodGuides, periodModules, runtimeManifest };
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
        const baseStatusEntry = controls.statusById.get(id);
        if (!portalEntry || !inventoryEntry || !baseStatusEntry) throw new Error(`${id}: mangler portal-, inventory- eller statusoppføring`);
        if (!allowPlanned && portalEntry.subjectStatus !== 'materialized') throw new Error(`Faget ${id} er ikke teknisk materialisert ennå.`);
        if (portalEntry.subjectStatus !== baseStatusEntry.navigationStatus) throw new Error(`${id}: portal- og statusregister er usynkronisert`);

        const manifestEntry = controls.manifest[id];
        const required = CORE.list(inventoryEntry.requiredManifestFields);
        const coreFields = ['pensum', 'emner', 'fagkart', 'methods'];
        for (const field of coreFields) {
          if (!required.includes(field) || !CORE.text(manifestEntry?.[field])) throw new Error(`${id}: mangler required manifestfelt ${field}`);
        }

        const [source, badge, finalOverlay] = await Promise.all([
          loadSubjectSource(manifestEntry),
          fetchJson(`data/badges/${encodeURIComponent(id)}.json`, { optional: true }),
          id === 'natur' ? fetchJson(NATUR_FINAL_PATH, { optional: true }) : Promise.resolve(null)
        ]);
        const composed = id === 'natur'
          ? composeNaturFinal({ ...source, registry: controls.registry, statusEntry: baseStatusEntry, overlay: finalOverlay })
          : { ...source, registry: controls.registry, statusEntry: baseStatusEntry };

        return CORE.normalizeSubject({
          subjectId: id,
          categoryLabel: controls.categories?.labels?.[id],
          categoryDescription: controls.categories?.decisions?.[id],
          schemaFamily: inventoryEntry.schemaFamily,
          manifestEntry,
          portalEntry,
          inventoryEntry,
          statusEntry: composed.statusEntry,
          registry: composed.registry,
          badge,
          source: { pensum: composed.pensum, emners: composed.emners, fagkart: composed.fagkart, methods: composed.methods, curriculum: composed.curriculum, concepts: composed.concepts, periodGuides: composed.periodGuides, periodModules: composed.periodModules, runtimeManifest: composed.runtimeManifest }
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
