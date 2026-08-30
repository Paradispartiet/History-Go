// @ts-nocheck
(function installFagverkSubjectCore(root) {
  'use strict';

  function text(value) {
    return String(value == null ? '' : value).trim();
  }

  function list(value) {
    return Array.isArray(value) ? value : [];
  }

  function unique(values) {
    const seen = new Set();
    const result = [];
    for (const raw of list(values)) {
      const value = text(raw);
      if (!value || seen.has(value)) continue;
      seen.add(value);
      result.push(value);
    }
    return result;
  }

  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  function firstText(...values) {
    for (const value of values) {
      const normalized = text(value);
      if (normalized) return normalized;
    }
    return '';
  }

  function humanize(value) {
    const normalized = text(value).replace(/^em_[a-z]+_/, '').replace(/^kur_[a-z]+_\d+_/, '');
    if (!normalized) return '';
    const sentence = normalized.replaceAll('_', ' ').replaceAll('-', ' ');
    return sentence.charAt(0).toLocaleUpperCase('nb-NO') + sentence.slice(1);
  }

  function slug(value) {
    return text(value)
      .toLocaleLowerCase('nb-NO')
      .replaceAll('æ', 'ae')
      .replaceAll('ø', 'o')
      .replaceAll('å', 'a')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function cleanSubjectLabel(value) {
    return text(value).replace(/\s+[–-]\s+pensum$/i, '').trim();
  }

  function resolveCanonicalSubjectId(requested, categoryContract, manifest) {
    const subjectId = text(requested);
    assert(subjectId, 'Fagsiden krever en eksplisitt subject-id.');
    const canonical = list(categoryContract?.fagSubjects).map(text);
    assert(canonical.includes(subjectId), `Ukjent canonical subject-id: ${subjectId}`);
    assert(Object.hasOwn(manifest || {}, subjectId), `Fagmanifestet mangler subject-id: ${subjectId}`);
    return subjectId;
  }

  function resolveManifestPointer(pointer) {
    const value = text(pointer).replaceAll('\\', '/');
    assert(value, 'Tom manifestpeker.');
    assert(!value.startsWith('/') && !/^[a-z][a-z0-9+.-]*:/i.test(value), `Manifestpekeren må være relativ: ${value}`);
    const parts = ['data', 'fag'];
    for (const part of value.split('/')) {
      if (!part || part === '.') continue;
      if (part === '..') parts.pop();
      else parts.push(part);
    }
    const resolved = parts.join('/');
    assert(resolved.startsWith('data/fag/'), `Kjernefil peker utenfor data/fag: ${value}`);
    return resolved;
  }

  function adapterForFamily(schemaFamily) {
    const family = text(schemaFamily);
    if (family === 'by_compatibility') return 'by';
    if (family === 'technology_scientific_v2_4') return 'technology';
    if (family === 'standard_canonical' || family === 'foundation_v1') return 'standard';
    throw new Error(`Ukjent schemafamilie: ${family}`);
  }

  function conceptsForEmne(emne) {
    return unique([
      ...list(emne?.core_concepts),
      ...list(emne?.key_concepts),
      ...list(emne?.sub_concepts),
      ...list(emne?.keywords),
      ...list(emne?.konsepter)
    ]);
  }

  function rawDomainCandidates(adapter, pensum, fagkart) {
    if (adapter === 'by') return list(fagkart?.categories);
    if (adapter === 'technology') return list(fagkart?.categories).length ? list(fagkart.categories) : list(pensum?.modules);
    if (list(pensum?.domains).length) return list(pensum.domains);
    if (list(fagkart?.categories).length) return list(fagkart.categories);
    return list(pensum?.modules);
  }

  function candidateEmneIds(candidate) {
    const nested = list(candidate?.topic_hooks).flatMap((hook) => list(hook?.emne_ids));
    return unique([
      ...list(candidate?.emne_ids),
      ...list(candidate?.emners),
      ...list(candidate?.emner),
      ...list(candidate?.focus),
      ...nested
    ]);
  }

  function candidateMethodIds(candidate) {
    const nested = list(candidate?.topic_hooks).flatMap((hook) => list(hook?.recommended_method_ids));
    return unique([
      ...list(candidate?.method_ids),
      ...list(candidate?.metoder),
      ...nested
    ]);
  }

  function candidateHookIds(candidate) {
    return unique([
      ...list(candidate?.hook_ids),
      ...list(candidate?.topic_hooks).map((hook) => hook?.id)
    ]);
  }

  function normalizeMethods(rawMethods) {
    const source = Array.isArray(rawMethods) ? rawMethods : list(rawMethods?.methods);
    const methods = source.map((method) => ({
      id: firstText(method?.method_id, method?.id),
      title: firstText(method?.title, method?.label, method?.short_label, method?.method_id, method?.id),
      description: firstText(method?.description, method?.purpose, method?.definition),
      dataForms: unique([...
        list(method?.data_forms),
        ...list(method?.evidence_forms),
        ...list(method?.materials)
      ]),
      procedure: unique([
        ...list(method?.procedure),
        ...list(method?.steps)
      ]),
      limitations: unique([
        ...list(method?.limitations),
        ...list(method?.blindspots)
      ]),
      domainIds: unique([...
        list(method?.coverage_domains),
        ...list(method?.best_for_emne_kinds)
      ]),
      emneIds: unique([...
        list(method?.emne_affinities),
        ...list(method?.emne_ids)
      ]),
      source: method
    })).filter((method) => method.id);
    const ids = new Set();
    for (const method of methods) {
      assert(!ids.has(method.id), `Duplisert metode-id: ${method.id}`);
      ids.add(method.id);
    }
    return methods;
  }

  function normalizeConcepts(rawConcepts) {
    const source = Array.isArray(rawConcepts) ? rawConcepts : list(rawConcepts?.concepts);
    const concepts = source.map((concept) => ({
      id: firstText(concept?.concept_id, concept?.id),
      label: firstText(concept?.label, concept?.term, concept?.title, concept?.concept_id, concept?.id),
      definition: firstText(concept?.definition, concept?.description),
      definitionStatus: firstText(concept?.definition_status),
      contextualUse: firstText(concept?.contextual_use),
      editorialReview: concept?.editorial_review ? {
        status: firstText(concept.editorial_review.review_status),
        method: firstText(concept.editorial_review.review_method),
        chapterId: firstText(concept.editorial_review.chapter_id),
        claimsFile: firstText(concept.editorial_review.claims_file),
        traceQuality: firstText(concept.editorial_review.trace_quality),
        claimIds: unique(list(concept.editorial_review.claim_ids)),
        note: firstText(concept.editorial_review.review_note),
        sourceReferences: list(concept.editorial_review.source_references).map((source) => ({
          id: firstText(source?.source_id),
          label: firstText(source?.label, source?.source_id),
          url: firstText(source?.url),
          publisher: firstText(source?.publisher),
          location: firstText(source?.source_location)
        })).filter((source) => source.id && source.label && source.url && source.location)
      } : null,
      type: firstText(concept?.concept_type, concept?.type),
      historicalScope: firstText(concept?.historical_scope, concept?.scope),
      scopeNote: firstText(concept?.scope_note, concept?.historical_scope, concept?.scope),
      whyItMatters: firstText(concept?.why_it_matters),
      domainIds: unique(list(concept?.domain_ids)),
      emneIds: unique([...list(concept?.source_emne_ids), ...list(concept?.emne_ids)]),
      broaderIds: unique(list(concept?.broader_concepts)),
      narrowerIds: unique(list(concept?.narrower_concepts)),
      relatedIds: unique([...list(concept?.related_concepts), ...list(concept?.related_ids)]),
      distinguishFromIds: unique(list(concept?.distinguish_from)),
      distinguishFrom: unique(list(concept?.distinguish_from)),
      commonMisuse: unique(list(concept?.common_misuse)),
      indicators: unique(list(concept?.indicators)),
      sourceRequirements: unique(list(concept?.source_requirements)),
      methodIds: unique(list(concept?.method_ids)),
      keyQuestions: unique(list(concept?.key_questions)),
      source: concept
    })).filter((concept) => concept.id && concept.label && concept.definition);
    const ids = new Set();
    for (const concept of concepts) {
      assert(!ids.has(concept.id), `Duplisert begreps-id: ${concept.id}`);
      ids.add(concept.id);
    }
    return concepts;
  }

  function normalizeDomains({ adapter, pensum, fagkart, emners, methods }) {
    const methodIds = new Set(methods.map((method) => method.id));
    const candidates = rawDomainCandidates(adapter, pensum, fagkart);
    const domains = [];
    const domainsById = new Map();

    for (const candidate of candidates) {
      const id = firstText(candidate?.domain_id, candidate?.id, candidate?.module_id);
      if (!id || domainsById.has(id)) continue;
      const domain = {
        id,
        label: firstText(candidate?.label, candidate?.title, humanize(id)),
        definition: firstText(candidate?.definition, candidate?.tagline, candidate?.core_question, candidate?.purpose),
        emneIds: candidateEmneIds(candidate),
        methodIds: candidateMethodIds(candidate).filter((methodId) => methodIds.has(methodId)),
        hookIds: candidateHookIds(candidate),
        sourceKind: candidate?.domain_id ? 'pensum_domain' : candidate?.module_id ? 'pensum_module' : 'fagkart_category',
        source: candidate
      };
      domains.push(domain);
      domainsById.set(id, domain);
    }

    const orderedIds = unique(list(pensum?.domain_order));
    if (orderedIds.length) {
      const position = new Map(orderedIds.map((id, index) => [id, index]));
      domains.sort((a, b) => (position.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (position.get(b.id) ?? Number.MAX_SAFE_INTEGER));
    }

    const containedByEmne = new Map();
    for (const domain of domains) {
      for (const emneId of domain.emneIds) if (!containedByEmne.has(emneId)) containedByEmne.set(emneId, domain.id);
    }

    const assignments = new Map();
    for (const emne of emners) {
      const emneId = firstText(emne?.emne_id, emne?.id);
      if (!emneId) continue;
      let domainId = containedByEmne.get(emneId) || '';
      if (!domainId) {
        const directCandidates = unique([emne?.domain_id, emne?.domain, emne?.area_id, emne?.logic_family]);
        domainId = directCandidates.find((candidate) => domainsById.has(candidate)) || '';
      }
      if (!domainId) {
        domainId = firstText(emne?.area_id, emne?.domain, emne?.logic_family);
        assert(domainId, `${emneId}: kan ikke knyttes til et source-definert fagområde`);
        if (!domainsById.has(domainId)) {
          const fallback = {
            id: domainId,
            label: firstText(emne?.area_label, humanize(domainId)),
            definition: '',
            emneIds: [],
            methodIds: [],
            hookIds: [],
            sourceKind: 'emne_area_compatibility',
            source: { area_id: emne?.area_id, domain: emne?.domain, logic_family: emne?.logic_family }
          };
          domains.push(fallback);
          domainsById.set(domainId, fallback);
        }
      }
      assignments.set(emneId, domainId);
      const domain = domainsById.get(domainId);
      if (!domain.emneIds.includes(emneId)) domain.emneIds.push(emneId);
    }

    return { domains, domainsById, assignments };
  }

  function normalizeEmners({ subjectId, rawEmners, assignments, methods }) {
    const methodIds = new Set(methods.map((method) => method.id));
    const emners = list(rawEmners).map((emne) => {
      const id = firstText(emne?.emne_id, emne?.id);
      if (!id) return null;
      const declaredSubject = text(emne?.subject_id);
      assert(!declaredSubject || declaredSubject === subjectId, `${id}: subject_id ${declaredSubject} samsvarer ikke med ${subjectId}`);
      const rawMethodRefs = unique([...
        list(emne?.method_ids),
        ...list(emne?.methods),
        ...list(emne?.metoder)
      ]);
      return {
        id,
        subjectId,
        domainId: assignments.get(id),
        title: firstText(emne?.title, emne?.short_label, humanize(id)),
        shortLabel: firstText(emne?.short_label),
        definition: firstText(emne?.definition, emne?.description),
        whyItMatters: firstText(emne?.why_it_matters, emne?.purpose),
        concepts: conceptsForEmne(emne),
        keyQuestions: unique([...
          list(emne?.key_questions),
          ...list(emne?.questions)
        ]),
        methodIds: rawMethodRefs.filter((methodId) => methodIds.has(methodId)),
        methodLabels: rawMethodRefs.filter((methodId) => !methodIds.has(methodId)),
        conflicts: unique([...
          list(emne?.conflicts),
          ...list(emne?.critical_distinctions)
        ]),
        analysisAxes: list(emne?.analysis_axes).length
          ? unique(list(emne?.analysis_axes))
          : unique([...
              list(emne?.akse),
              ...list(emne?.ideological_dimensions)
            ]),
        level: emne?.level ?? null,
        status: firstText(emne?.status, 'active'),
        source: emne
      };
    }).filter(Boolean);

    const ids = new Set();
    for (const emne of emners) {
      assert(!ids.has(emne.id), `Duplisert emne-id: ${emne.id}`);
      assert(emne.domainId, `${emne.id}: mangler normalisert fagområde`);
      ids.add(emne.id);
    }
    return emners;
  }

  function normalizeChapters(registrySubject) {
    return list(registrySubject?.chapters).map((chapter) => ({
      id: firstText(chapter?.id, chapter?.chapter_id),
      title: firstText(chapter?.title),
      subtitle: firstText(chapter?.subtitle),
      file: firstText(chapter?.file),
      role: firstText(chapter?.chapter_role, 'core'),
      primaryDomainId: firstText(chapter?.primary_domain_id, chapter?.domain_id),
      emneIds: unique(list(chapter?.emne_ids)),
      source: chapter
    })).filter((chapter) => chapter.id && chapter.file);
  }

  function mergeChapterPayload(target, payload) {
    const merged = { ...(target || {}) };
    for (const [key, value] of Object.entries(payload || {})) {
      if (Array.isArray(value)) merged[key] = [...list(merged[key]), ...value];
      else if (value && typeof value === 'object') merged[key] = { ...(merged[key] || {}), ...value };
      else if (value != null) merged[key] = value;
    }
    return merged;
  }

  function normalizeChapterPayload(chapter) {
    const normalized = { ...(chapter || {}) };
    normalized.workedExamples = list(normalized.workedExamples).map((example) => ({
      ...example,
      situation: firstText(example?.situation, example?.scenario),
      analysis: list(example?.analysis).length
        ? list(example.analysis)
        : list(example?.steps).length
          ? list(example.steps)
          : text(example?.analysis)
            ? [text(example.analysis)]
            : []
    }));
    normalized.commonMisconceptions = [
      ...list(normalized.commonMisconceptions),
      ...list(normalized.misconceptions)
    ];
    normalized.applicationTasks = list(normalized.applicationTasks).map((item) => ({
      ...item,
      task: firstText(item?.task, item?.title),
      prompts: list(item?.prompts).length
        ? list(item.prompts)
        : text(item?.prompt)
          ? [text(item.prompt)]
          : []
    }));
    normalized.causalFramework = unique(list(normalized.causalFramework).map(text));
    normalized.historiographicalDebate = normalized.historiographicalDebate && typeof normalized.historiographicalDebate === 'object'
      ? {
          question: firstText(normalized.historiographicalDebate.question),
          positions: unique(list(normalized.historiographicalDebate.positions).map(text)),
          editorialNote: firstText(normalized.historiographicalDebate.editorial_note, normalized.historiographicalDebate.editorialNote)
        }
      : null;
    normalized.caseAnchors = list(normalized.caseAnchors).map((place) => ({
      ...place,
      id: firstText(place?.place_id, place?.id),
      name: firstText(place?.name, place?.title, humanize(place?.place_id || place?.id)),
      use: firstText(place?.use, place?.role, place?.description)
    })).filter((place) => place.id && place.use);
    normalized.relatedPlaces = list(normalized.relatedPlaces).map((place) => ({
      ...place,
      name: firstText(place?.name, place?.title, humanize(place?.id)),
      role: firstText(place?.role, place?.description, 'Stedscase i kapittelet.')
    }));
    const sectionConcepts = list(normalized.sections).flatMap((section) => list(section?.concepts));
    const concepts = list(normalized.concepts).length ? list(normalized.concepts) : sectionConcepts;
    const seenConcepts = new Set();
    normalized.concepts = concepts.map((concept) => {
      const term = typeof concept === 'string' ? text(concept) : firstText(concept?.term, concept?.title);
      return {
        ...(concept && typeof concept === 'object' ? concept : {}),
        id: firstText(concept?.id, slug(term)),
        term,
        definition: firstText(concept?.definition, concept?.description, 'Begrepet brukes som analysebegrep i dette kapittelet.')
      };
    }).filter((concept) => {
      const key = firstText(concept.id, concept.term).toLocaleLowerCase('nb-NO');
      if (!key || seenConcepts.has(key)) return false;
      seenConcepts.add(key);
      return true;
    });
    return normalized;
  }

  async function hydrateChapter(chapter, fetchJson) {
    assert(typeof fetchJson === 'function', 'hydrateChapter krever en JSON-laster.');
    const data = await fetchJson(chapter?.file);
    let merged = { ...data };
    const modules = await Promise.all(list(data?.moduleFiles).map(fetchJson));
    for (const module of modules) merged = mergeChapterPayload(merged, module);

    const claimsFile = firstText(data?.claimsFile, chapter?.claimsFile);
    if (claimsFile) {
      const claimsDocument = await fetchJson(claimsFile);
      merged.claims = list(claimsDocument?.claims);
      if (list(claimsDocument?.sources).length) merged.sources = list(claimsDocument.sources);
    }
    return normalizeChapterPayload(merged);
  }

  function normalizePlaces(registry, emneIds) {
    const knownEmners = new Set(emneIds);
    const result = [];
    for (const [id, place] of Object.entries(registry?.placeLinks || {})) {
      const placeEmneIds = unique([...
        list(place?.emneIds),
        ...list(place?.emne_ids)
      ]);
      if (!placeEmneIds.some((emneId) => knownEmners.has(emneId))) continue;
      result.push({
        id,
        title: firstText(place?.title, humanize(id)),
        intro: firstText(place?.intro),
        emneIds: placeEmneIds.filter((emneId) => knownEmners.has(emneId)),
        route: `fagverk-sted.html?place=${encodeURIComponent(id)}`,
        source: place
      });
    }
    return result;
  }

  function normalizeSubject(input) {
    const subjectId = text(input?.subjectId);
    assert(subjectId, 'normalizeSubject krever subjectId');
    const schemaFamily = text(input?.schemaFamily);
    const adapter = adapterForFamily(schemaFamily);
    const source = input?.source || {};
    const pensum = source.pensum || {};
    const fagkart = source.fagkart || {};
    const sourceRawEmners = Array.isArray(source.emners) ? source.emners : list(source.emners?.emners);
    // Standard-canonical fag med eksplisitt emnemapping bruker pensumdomenene som autoritativt aktivt emnesett.
    // Rå emnekataloger kan dermed bevare legacy-/paraplyrader uten at de materialiseres som aktive emner.
    const domainOwnedEmneIds = new Set(rawDomainCandidates(adapter, pensum, fagkart).flatMap(candidateEmneIds));
    const rawEmners = adapter === 'standard' && text(input?.manifestEntry?.emneMappings) && domainOwnedEmneIds.size
      ? sourceRawEmners.filter((emne) => domainOwnedEmneIds.has(firstText(emne?.emne_id, emne?.id)))
      : sourceRawEmners;
    const methods = normalizeMethods(source.methods || {});
    const concepts = normalizeConcepts(source.concepts || []);
    const { domains, domainsById, assignments } = normalizeDomains({ adapter, pensum, fagkart, emners: rawEmners, methods });
    const emners = normalizeEmners({ subjectId, rawEmners, assignments, methods });
    const emnersById = new Map(emners.map((emne) => [emne.id, emne]));

    for (const domain of domains) {
      domain.emneIds = unique(domain.emneIds).filter((emneId) => emnersById.has(emneId));
      domain.methodIds = unique([
        ...domain.methodIds,
        ...domain.emneIds.flatMap((emneId) => emnersById.get(emneId)?.methodIds || [])
      ]);
    }

    const mappings = emners.map((emne) => ({
      emneId: emne.id,
      domainId: emne.domainId,
      methodIds: [...emne.methodIds]
    }));
    const registrySubject = input?.registry?.subjects?.[subjectId] || {};
    const chapters = normalizeChapters(registrySubject);
    const places = normalizePlaces(input?.registry || {}, emners.map((emne) => emne.id));
    const categoryLabel = text(input?.categoryLabel);
    const title = cleanSubjectLabel(firstText(
      registrySubject?.title,
      pensum?.subject_title,
      fagkart?.subject_title,
      pensum?.label,
      categoryLabel,
      subjectId
    ));
    const description = firstText(
      registrySubject?.description,
      pensum?.purpose,
      fagkart?.purpose,
      input?.categoryDescription
    );
    const badgeData = input?.badge || {};
    const portalEntry = input?.portalEntry || {};
    const statusEntry = input?.statusEntry || {};
    const hookCount = domains.reduce((sum, domain) => sum + domain.hookIds.length, 0);

    return {
      subject: {
        id: subjectId,
        title,
        description,
        schemaFamily,
        adapter,
        badge: {
          id: firstText(badgeData?.id, subjectId),
          title: firstText(badgeData?.title, badgeData?.name, title),
          image: firstText(badgeData?.image, badgeData?.icon),
          tiers: list(badgeData?.tiers),
          page: firstText(portalEntry?.badgePage)
        },
        routes: {
          portal: 'fagverk-forside.html',
          subject: `fagverk.html?subject=${encodeURIComponent(subjectId)}`,
          badge: firstText(portalEntry?.badgePage),
          progress: 'emner.html',
          map: 'index.html'
        },
        status: {
          navigation: firstText(portalEntry?.subjectStatus, statusEntry?.navigationStatus),
          assessment: firstText(statusEntry?.assessmentStatus),
          editorial: firstText(statusEntry?.editorialStatus)
        }
      },
      summary: {
        domainCount: domains.length,
        emneCount: emners.length,
        methodCount: methods.length,
        mappingCount: mappings.length,
        hookCount
      },
      domains,
      domainsById,
      emners,
      emnersById,
      methods,
      methodsById: new Map(methods.map((method) => [method.id, method])),
      concepts,
      conceptsById: new Map(concepts.map((concept) => [concept.id, concept])),
      mappings,
      chapters,
      chaptersById: new Map(chapters.map((chapter) => [chapter.id, chapter])),
      places,
      progress: {},
      source: {
        pensum,
        emners: rawEmners,
        fagkart,
        methods: source.methods || {},
        concepts: source.concepts || [],
        curriculum: source.curriculum || null,
        periodGuides: source.periodGuides || null,
        periodModules: source.periodModules || null,
        runtimeManifest: source.runtimeManifest || null,
        manifestEntry: input?.manifestEntry || {},
        inventoryEntry: input?.inventoryEntry || {},
        statusEntry,
        portalEntry
      }
    };
  }

  function deriveTier(badge, points) {
    const tiers = list(badge?.tiers)
      .map((tier, index) => ({ ...tier, index, threshold: Number(tier?.threshold || 0) }))
      .sort((a, b) => a.threshold - b.threshold);
    let current = { index: -1, label: 'Nybegynner', threshold: 0 };
    for (const tier of tiers) if (points >= tier.threshold) current = { index: tier.index, label: firstText(tier?.label, tier?.title), threshold: tier.threshold };
    const next = tiers.find((tier) => tier.threshold > points) || null;
    const span = next ? Math.max(1, next.threshold - current.threshold) : 1;
    const percent = next ? Math.max(0, Math.min(100, ((points - current.threshold) / span) * 100)) : 100;
    return { ...current, next, percent };
  }

  const api = {
    text,
    list,
    unique,
    humanize,
    resolveCanonicalSubjectId,
    resolveManifestPointer,
    adapterForFamily,
    conceptsForEmne,
    normalizeConcepts,
    mergeChapterPayload,
    normalizeChapterPayload,
    hydrateChapter,
    normalizeSubject,
    deriveTier
  };

  root.HGFagverkSubjectCore = api;
  if (typeof module === 'object' && module?.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
