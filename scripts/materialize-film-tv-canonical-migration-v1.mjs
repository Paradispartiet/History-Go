#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  inventory: 'data/fag/TV_og_Film/film_tv_variable_inventory_v1.json',
  fagkart: 'data/fag/TV_og_Film/fagkart_film_tv_canonical_v4_5.json',
  emner: 'data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json',
  methods: 'data/fag/TV_og_Film/methods_film_tv_canonical_v4_5.json',
  mappings: 'data/fag/TV_og_Film/emnemapping_film_tv_canonical_v4_5.json',
  pensum: 'data/fag/TV_og_Film/film_tvpensum_canonical_v4_5.json',
  quizRules: 'data/fag/TV_og_Film/quiz_generator_rules_film_tv_v5_1_source_priority_patch.json',
  quizTemplate: 'data/fag/TV_og_Film/supersetQUIZMAL_film_tv.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  report: 'reports/fagverk/film-tv-canonical-migration-v1-audit.json'
});

const PLACE_FILES = [
  'data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv/lisbon_cinema_ideal.json',
  'data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv/lisbon_cinema_nimas.json',
  'data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv/lisbon_cinema_sao_jorge.json',
  'data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv/lisbon_cinemateca_portuguesa.json',
  'data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv/lisbon_doclisboa.json',
  'data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv/lisbon_tobis_portuguesa.json'
];

const DOMAIN_META = Object.freeze({
  audiovisuell_form_stil_analyse: {
    surface: 'audiovisual-form-style-first',
    cases: ['Nasjonalbiblioteket', 'Filmens hus', 'Norsk filminstitutt'],
    places: ['kino', 'filmhus', 'arkiv', 'studio', 'museum']
  },
  fortelling_sjanger_serialitet_format: {
    surface: 'narrative-genre-seriality-format-first',
    cases: ['NRK Marienlyst', 'Nasjonalbiblioteket', 'Filmens hus'],
    places: ['TV-hus', 'kino', 'filmhus', 'arkiv', 'produksjonsselskap']
  },
  film_tv_historie_historiografi: {
    surface: 'screen-history-source-criticism-first',
    cases: ['Nasjonalbiblioteket', 'Cinemateket', 'Norsk filminstitutt'],
    places: ['arkiv', 'cinematek', 'museum', 'bibliotek', 'filmhus']
  },
  dokumentar_virkelighetsformer_etikk: {
    surface: 'documentary-evidence-ethics-first',
    cases: ['Nasjonalbiblioteket', 'NRK Marienlyst', 'Norsk filminstitutt'],
    places: ['arkiv', 'TV-hus', 'location', 'festivalsted', 'filmhus']
  },
  samfunn_representasjon_identitet_makt: {
    surface: 'representation-identity-power-first',
    cases: ['NRK Marienlyst', 'Norsk filminstitutt', 'Nasjonalbiblioteket'],
    places: ['TV-hus', 'filmhus', 'arkiv', 'kino', 'institusjon']
  },
  produksjon_arbeid_teknologi_praksis: {
    surface: 'production-work-technology-first',
    cases: ['NRK Marienlyst', 'Filmparken Jar', 'OsloMet Pilestredet'],
    places: ['studio', 'TV-hus', 'produksjonsselskap', 'utdanningssted', 'location']
  },
  industri_institusjoner_politikk_distribusjon: {
    surface: 'industry-institution-distribution-first',
    cases: ['Norsk filminstitutt', 'Filmens hus', 'NRK Marienlyst'],
    places: ['filmhus', 'TV-hus', 'departement', 'arkiv', 'produksjonsselskap']
  },
  visning_publikum_resepsjon_deltakelse: {
    surface: 'exhibition-audience-reception-first',
    cases: ['Colosseum kino', 'Cinemateket', 'Vega Scene'],
    places: ['kino', 'cinematek', 'filmklubb', 'festivalsted', 'bibliotek']
  },
  sted_location_skjermgeografi: {
    surface: 'place-location-screen-geography-first',
    cases: ['Oslo sentrum', 'Akerselva', 'Filmparken Jar'],
    places: ['location', 'byrom', 'gate', 'landskap', 'studio']
  },
  arkiv_kulturarv_minne_stjerner: {
    surface: 'archive-heritage-memory-star-first',
    cases: ['Nasjonalbiblioteket', 'Cinemateket', 'Filmens hus'],
    places: ['arkiv', 'cinematek', 'museum', 'filmhus', 'festivalsted']
  }
});

const OLD_DOMAIN_MAP = Object.freeze({
  kinoer_visningssteder_publikum: ['visning_publikum_resepsjon_deltakelse', 'arkiv_kulturarv_minne_stjerner', 'industri_institusjoner_politikk_distribusjon'],
  produksjon_studio_arbeid: ['produksjon_arbeid_teknologi_praksis', 'audiovisuell_form_stil_analyse', 'fortelling_sjanger_serialitet_format', 'industri_institusjoner_politikk_distribusjon'],
  locations_byrom_motiv: ['sted_location_skjermgeografi', 'audiovisuell_form_stil_analyse', 'samfunn_representasjon_identitet_makt', 'dokumentar_virkelighetsformer_etikk'],
  sjanger_format_fortelling: ['fortelling_sjanger_serialitet_format', 'audiovisuell_form_stil_analyse', 'dokumentar_virkelighetsformer_etikk', 'film_tv_historie_historiografi'],
  institusjoner_makt_offentlighet: ['industri_institusjoner_politikk_distribusjon', 'samfunn_representasjon_identitet_makt', 'film_tv_historie_historiografi', 'arkiv_kulturarv_minne_stjerner'],
  minne_stjerner_kulturarv: ['arkiv_kulturarv_minne_stjerner', 'visning_publikum_resepsjon_deltakelse', 'film_tv_historie_historiografi', 'samfunn_representasjon_identitet_makt']
});

const NEW_METHODS = Object.freeze([
  ['met_film_tv_formal_naerlesning', 'Formanalytisk nærlesning', 'audiovisuell_form_stil_analyse'],
  ['met_film_tv_animasjonsanalyse', 'Animasjonsanalyse', 'audiovisuell_form_stil_analyse'],
  ['met_film_tv_adaptasjonsanalyse', 'Adaptasjonsanalyse', 'fortelling_sjanger_serialitet_format'],
  ['met_film_tv_historiografisk_kildekritikk', 'Historiografisk kildekritikk', 'film_tv_historie_historiografi'],
  ['met_film_tv_komparativ_skjermhistorie', 'Komparativ skjermhistorie', 'film_tv_historie_historiografi'],
  ['met_film_tv_dekolonial_skjermanalyse', 'Dekolonial skjermanalyse', 'samfunn_representasjon_identitet_makt'],
  ['met_film_tv_dokumentaretisk_analyse', 'Dokumentaretisk analyse', 'dokumentar_virkelighetsformer_etikk'],
  ['met_film_tv_ki_og_automatiseringsaudit', 'KI- og automatiseringsaudit', 'produksjon_arbeid_teknologi_praksis'],
  ['met_film_tv_baerekraftsanalyse', 'Bærekraftsanalyse', 'produksjon_arbeid_teknologi_praksis'],
  ['met_film_tv_tilgjengelighetsanalyse', 'Tilgjengelighetsanalyse', 'visning_publikum_resepsjon_deltakelse'],
  ['met_film_tv_digital_bevaringsanalyse', 'Digital bevaringsanalyse', 'arkiv_kulturarv_minne_stjerner'],
  ['met_film_tv_skjermgeografisk_sirkulasjonsanalyse', 'Skjermgeografisk sirkulasjonsanalyse', 'sted_location_skjermgeografi']
]);

const SOURCE_PRIORITY = Object.freeze([
  'konkret film, TV-serie, episode, dokumentar, scene, sending, produksjon, visning, location eller arkivopptak',
  'offisiell film-, TV-, kringkastings-, kino-, festival-, arkiv-, institusjons- eller produksjonskilde',
  'fagfellevurdert film- og TV-forskning, dokumenterte bransjekilder og kritisk historiografi',
  'fagkart, emner, metoder og mappings som styring – aldri som eneste faktakilde'
]);
const ANTI_PATTERNS = Object.freeze([
  'Ikke generer fra emne-, hook- eller metodenavn alene.',
  'Ikke reduser Film & TV til personlig smak, kjendiser eller løs underholdningstrivia.',
  'Ikke påstå verk-, produksjons-, visnings-, publikums- eller arkivforhold uten ekstern claim-basis.'
]);

const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
const unique = (items) => [...new Set(items.filter(Boolean))];
const words = (value) => String(value || '').toLocaleLowerCase('nb-NO').replace(/[^a-zæøå0-9]+/g, ' ').split(/\s+/).filter((word) => word.length >= 4);
const assert = (ok, message) => { if (!ok) throw new Error(message); };

function aliasState(inventory) {
  const byAlias = new Map();
  const canonicalIds = new Set(inventory.emner.map((row) => row.emne_id));
  for (const row of inventory.emner) {
    for (const alias of row.legacy_aliases) {
      if (!byAlias.has(alias)) byAlias.set(alias, []);
      byAlias.get(alias).push(row.emne_id);
    }
  }
  const resolve = (id) => byAlias.get(id) || (canonicalIds.has(id) ? [id] : []);
  return { byAlias, canonicalIds, resolve };
}

function migrateMethods(inventory, currentMethods, aliases) {
  const domainIds = new Set(inventory.domains.map((row) => row.id));
  const emneById = new Map(inventory.emner.map((row) => [row.emne_id, row]));
  const base = currentMethods.methods.filter((row) => !NEW_METHODS.some(([id]) => id === row.method_id)).map((row) => {
    const migratedAffinities = unique((row.emne_affinities || []).flatMap((id) => aliases.resolve(id)));
    const migratedAlready = row.registry_version === 'film_tvpensum_variable_v1';
    const fromAffinities = migratedAlready ? [] : migratedAffinities.map((id) => emneById.get(id)?.domain_id);
    const fromCoverage = (row.coverage_domains || []).flatMap((id) => domainIds.has(id) ? [id] : (OLD_DOMAIN_MAP[id] || []));
    const migrationSeedDomains = unique(row.migration_seed_domains || [...fromAffinities, ...fromCoverage]);
    return {
      ...row,
      coverage_domains: migrationSeedDomains,
      migration_seed_domains: migrationSeedDomains,
      emne_affinities: migratedAffinities,
      registry_version: 'film_tvpensum_variable_v1',
      canonical_status: 'canonical',
      canonical_file_role: 'active'
    };
  });
  for (const [method_id, title, domain] of NEW_METHODS) {
    base.push({
      method_id, title, short_label: title,
      description: `${title} undersøker dokumenterte audiovisuelle verk, praksiser, institusjoner og kilder med eksplisitte avgrensninger og etterprøvbar claim-basis.`,
      best_for_emne_kinds: [domain], data_forms: ['audiovisuelt verk', 'produksjons- eller institusjonskilde', 'forskningslitteratur'],
      course_level_fit: ['grunnlag', 'fordypning'], coverage_domains: [domain], progression_stage: 'full_ladder',
      good_for_place_types: DOMAIN_META[domain].places, question_moves: ['start_med_konkret_audiovisuelt_belegg', 'skill_observasjon_fra_tolkning', 'dokumenter_grenser'],
      method_use_note: 'Metoden krever konkret materiale, tydelig analyseenhet og ekstern claim-basis.',
      rotation_note: 'Roter verk, produksjoner, steder, institusjoner og kildetyper.', hook_affinities: [], emne_affinities: [],
      canonical_status: 'canonical', registry_version: 'film_tvpensum_variable_v1', canonical_file_role: 'active',
      case_gate_required: true, method_gate_required: true, external_claim_basis_required: true,
      screen_production_location_or_broadcast_anchor_required: true,
      generator_constraints: { require_case_anchor_before_theory: true, require_external_claim_basis: true, do_not_generate_from_method_label_only: true }
    });
  }

  const methodTokens = new Map(base.map((method) => [method.method_id, new Set(words(`${method.method_id} ${method.title} ${method.description}`))]));
  const assignments = new Map();
  for (const emne of inventory.emner) {
    const haystack = new Set(words(`${emne.concept_id} ${emne.title} ${emne.definition} ${emne.required_subcoverage.join(' ')}`));
    const candidates = base.filter((method) => method.coverage_domains.includes(emne.domain_id)).map((method) => ({
      method,
      score: [...methodTokens.get(method.method_id)].filter((token) => haystack.has(token) || [...haystack].some((word) => word.includes(token) || token.includes(word))).length
    })).sort((a, b) => b.score - a.score || a.method.method_id.localeCompare(b.method.method_id, 'nb'));
    assert(candidates.length > 0, `${emne.emne_id}: domenet mangler metode`);
    const positive = candidates.filter((row) => row.score > 0);
    const take = positive.length >= 3 && positive[2].score >= 2 ? 3 : positive.length >= 2 ? 2 : 1;
    assignments.set(emne.emne_id, (positive.length ? positive : candidates).slice(0, take).map((row) => row.method.method_id));
  }
  for (const method of base) {
    if ([...assignments.values()].some((ids) => ids.includes(method.method_id))) continue;
    const methodWords = methodTokens.get(method.method_id);
    const candidates = inventory.emner.filter((emne) => method.coverage_domains.includes(emne.domain_id)).map((emne) => {
      const emneWords = new Set(words(`${emne.concept_id} ${emne.title} ${emne.definition}`));
      const score = [...methodWords].filter((token) => emneWords.has(token) || [...emneWords].some((word) => word.includes(token) || token.includes(word))).length;
      return { emne, score };
    }).sort((a, b) => b.score - a.score || a.emne.emne_id.localeCompare(b.emne.emne_id, 'nb'));
    assert(candidates.length > 0, `${method.method_id}: metoden mangler emne i sine dekningsområder`);
    const emneId = candidates[0].emne.emne_id;
    assignments.set(emneId, unique([...assignments.get(emneId), method.method_id]));
  }
  for (const method of base) method.emne_affinities = [...assignments].filter(([, ids]) => ids.includes(method.method_id)).map(([id]) => id);
  return {
    document: {
      version: 'v4.5-variable-inventory-v1', subject_id: 'film_tv', subject_title: 'Film & TV', scope: 'globalt_med_stedsforankring',
      type: 'canonical_methods', purpose: 'Metodeinventar for det variable Film & TV-faget; omfang følger faglige problemer, ikke tallkvoter.',
      updated_at: '2026-08-11', canonical_inputs: [P.inventory, P.emner, P.fagkart, P.pensum],
      principles: { evidence_first: true, method_count_is_not_a_target: true, every_emne_has_resolved_method: true }, methods: base
    },
    assignments
  };
}

function buildEmners(inventory, assignments) {
  const domainById = new Map(inventory.domains.map((row) => [row.id, row]));
  return inventory.emner.map((row) => {
    const domain = domainById.get(row.domain_id);
    const concepts = unique([row.concept_id, ...words(row.title), ...row.required_subcoverage.flatMap(words)]);
    return {
      emne_id: row.emne_id, concept_id: row.concept_id, subject_id: 'film_tv', domain: row.domain_id, area_id: row.domain_id, area_label: domain.title,
      level: row.inventory_role === 'integrative_foundation' ? 2 : 4, title: row.title, short_label: row.title,
      status: 'active', definition: row.definition, why_it_matters: row.boundary,
      boundary: row.boundary, origin: row.origin, inventory_role: row.inventory_role,
      legacy_aliases: row.legacy_aliases, migration_actions: row.migration_actions, evidence_refs: row.evidence_refs,
      required_subcoverage: row.required_subcoverage, keywords: concepts, key_concepts: concepts, core_concepts: concepts.slice(0, 5),
      sub_concepts: row.required_subcoverage, key_questions: [`Hvilket konkret audiovisuelt materiale gjør ${row.title.toLocaleLowerCase('nb-NO')} undersøkbart?`, `Hvilke kilder og metoder kan skille dokumentasjon fra tolkning i dette emnet?`],
      conflicts: [row.boundary], methods: assignments.get(row.emne_id), method_ids: assignments.get(row.emne_id),
      analysis_axes: ['verk og form', 'produksjon og institusjon', 'sted og sirkulasjon', 'publikum og minne'],
      quiz_priority: row.inventory_role === 'integrative_foundation' ? 'high' : 'normal', direct_quiz_ok: true,
      requires_film_tv_anchor: true, requires_screen_production_location_or_broadcast_anchor: true,
      requires_external_claim_basis: true, requires_documented_audiovisual_context: true,
      question_surface_mode: DOMAIN_META[row.domain_id].surface,
      scope_guard: 'Bruk bare med dokumentert film-/TV-verk, produksjon, sending, visning, publikum, sted, institusjon eller arkivkilde.',
      canonical_status: 'canonical', registry_version: 'film_tvpensum_variable_v1', canonical_file_role: 'active',
      generator_constraints: { min_method_count: 1, require_external_claim_basis: true, require_screen_production_location_or_broadcast_anchor: true, do_not_generate_from_emne_label_only: true },
      anti_patterns: ANTI_PATTERNS
    };
  });
}

function buildFagkart(inventory, emners) {
  const emneById = new Map(emners.map((row) => [row.emne_id, row]));
  const categories = inventory.domains.map((domain) => {
    const meta = DOMAIN_META[domain.id];
    return {
      id: domain.id, title: domain.title, tagline: domain.rationale, definition: domain.rationale,
      focus: domain.emne_ids, oslo: { core_cases: meta.cases, place_logic: 'Stedscase krever dokumentert audiovisuell verk-, produksjons-, visnings-, kringkastings- eller arkivkobling.' },
      canon: { thinkers: [] },
      topic_hooks: domain.emne_ids.map((emneId) => {
        const emne = emneById.get(emneId);
        return {
          id: `hook_${emne.concept_id}`, title: emne.title, emne_ids: [emneId], best_place_types: meta.places,
          set_phase_fit: ['facts', 'bridge_facts_theory', 'late_theory'], question_surface_mode: meta.surface,
          fact_anchor_required: true, film_tv_anchor_required: true, screen_production_location_or_broadcast_anchor_required: true,
          external_claim_basis_required: true, avoid_surface_forms: ANTI_PATTERNS,
          preferred_question_moves: ['start_with_concrete_film_tv_evidence', 'separate_observation_from_interpretation', 'state_source_limitations'],
          recommended_oslo_cases: meta.cases, recommended_method_ids: emne.method_ids,
          canonical_status: 'canonical', registry_version: 'film_tvpensum_variable_v1', canonical_file_role: 'active',
          generator_constraints: { min_case_count: 1, min_method_count: 1, require_external_claim_basis: true, do_not_generate_from_hook_label_only: true }
        };
      }),
      best_place_types: meta.places, question_role: `Starter i dokumentert materiale med spørsmålsflate ${meta.surface}.`,
      source_priority: SOURCE_PRIORITY, anti_patterns: ANTI_PATTERNS
    };
  });
  return {
    subject_id: 'film_tv', subject_title: 'Film & TV', scope: 'globalt_med_stedsforankring', type: 'canonical_fagkart',
    version: 'v4.5-variable-inventory-v1', updated_at: '2026-08-11', canonical_registry_version: 'film_tvpensum_variable_v1',
    purpose: 'Variabelt fagkart med ett eksplisitt hook per selvstendig problemstilling; antall er en integritetstelling, ikke en kvote.',
    principles: { source_first: true, external_claim_basis_required: true, screen_production_location_or_broadcast_before_theory: true, no_generic_film_tv_questions: true, emne_prefix_required: 'em_film_tv_', variable_domain_sizes: true, counts_are_not_targets: true },
    categories,
    meta: { domain_count: categories.length, topic_hook_count: categories.reduce((sum, row) => sum + row.topic_hooks.length, 0), emne_count: emners.length, inventory_source: P.inventory }
  };
}

function buildMappings(inventory, emners) {
  const domainById = new Map(inventory.domains.map((row) => [row.id, row]));
  return emners.map((emne) => {
    const domain = domainById.get(emne.domain);
    const hookId = `hook_${emne.emne_id.replace(/^em_film_tv_/, '')}`;
    return {
      emne_id: emne.emne_id, title: emne.title,
      mappings: [{
        fagkart_kategori: emne.domain, fagkart_kategori_tittel: domain.title, topic_hook: hookId, topic_hook_tittel: emne.title,
        mapping_tier: 'primary', priority_score: emne.inventory_role === 'integrative_foundation' ? 10 : 8,
        set_phase_fit: ['facts', 'bridge_facts_theory', 'late_theory'], question_surface_mode: DOMAIN_META[emne.domain].surface,
        film_tv_anchor_required: true, fact_anchor_required: true, source_anchor_required: true, external_claim_basis_required: true,
        screen_production_location_or_broadcast_anchor_required: true, documented_audiovisual_context_required: true,
        use_note: 'Bruk hooket som eksplisitt bro fra konkret audiovisuelt belegg til emnets avgrensede problemstilling.',
        preferred_question_moves: ['start_with_concrete_film_tv_evidence', 'separate_observation_from_interpretation'],
        best_place_types: DOMAIN_META[emne.domain].places, anti_patterns: ANTI_PATTERNS,
        recommended_oslo_cases: DOMAIN_META[emne.domain].cases, recommended_method_ids: emne.method_ids,
        generator_constraints: { require_concrete_screen_production_location_or_broadcast: true, require_external_claim_basis: true, do_not_generate_from_hook_label_only: true, do_not_generate_from_emne_label_only: true, required_emne_prefix: 'em_film_tv_' }
      }],
      mapping_status: 'tiered+canonical', primary_hooks: [hookId], secondary_hooks: [], reserve_hooks: [],
      recommended_max_active_hooks: 1, film_tv_anchor_required: true, source_anchor_required: true,
      external_claim_basis_required: true, screen_production_location_or_broadcast_anchor_required: true,
      recommended_oslo_cases: DOMAIN_META[emne.domain].cases, recommended_method_ids: emne.method_ids,
      canonical_status: 'canonical', registry_version: 'film_tvpensum_variable_v1', canonical_file_role: 'active',
      legacy_aliases: emne.legacy_aliases,
      mapping_constraints: { min_case_count: 1, min_method_count: 1, max_primary_hooks: 1, require_external_claim_basis: true, required_emne_prefix: 'em_film_tv_' }
    };
  });
}

function buildPensum(inventory, emners, methods, fagkart, mappings) {
  const emneById = new Map(emners.map((row) => [row.emne_id, row]));
  const domains = inventory.domains.map((domain) => {
    const hooks = fagkart.categories.find((row) => row.id === domain.id).topic_hooks;
    const methodIds = unique(domain.emne_ids.flatMap((id) => emneById.get(id).method_ids));
    return {
      domain_id: domain.id, label: domain.title, tagline: domain.rationale, definition: domain.rationale,
      question_role: `Starter i dokumentert materiale med spørsmålsflate ${DOMAIN_META[domain.id].surface}.`, status: 'strong',
      emne_count: domain.emne_ids.length, hook_count: hooks.length, method_count: methodIds.length,
      emne_ids: domain.emne_ids, hook_ids: hooks.map((row) => row.id), method_ids: methodIds,
      recommended_oslo_cases: DOMAIN_META[domain.id].cases, canonical_thinker_ids: [], norwegian_figure_ids: [],
      best_place_types: DOMAIN_META[domain.id].places, source_priority: SOURCE_PRIORITY,
      canonical_status: 'canonical', case_anchor_required: true, method_anchor_required: true, source_anchor_required: true,
      external_claim_basis_required: true, screen_production_location_or_broadcast_anchor_required: true
    };
  });
  return {
    version: 'v4.5-variable-inventory-v1', subject_id: 'film_tv', subject_title: 'Film & TV', scope: 'globalt_med_stedsforankring',
    type: 'canonical_pensum', canonical_registry_version: 'film_tvpensum_variable_v1', updated_at: '2026-08-11',
    purpose: 'Canonicalt, variabelt Film & TV-pensum migrert fra den auditerte inventarspesifikasjonen uten målkvoter.',
    canonical_files: P, summary: { domain_count: domains.length, emne_count: emners.length, method_count: methods.methods.length, mapping_count: mappings.length, topic_hook_count: fagkart.meta.topic_hook_count, all_emner_have_mapping: true, all_method_refs_valid: true, counts_are_integrity_checks_not_quotas: true },
    domain_order: domains.map((row) => row.domain_id), domains, source_priority: SOURCE_PRIORITY,
    primary_category_rule: 'Film & TV er primærfag bare når et dokumentert audiovisuelt verk, en produksjon, sending, visning, location, publikumspraksis, institusjon eller arkivkilde er analyseenheten.',
    legacy_policy: { legacy_emne_ids_allowed_as_canonical: false, legacy_alias_count: 120, alias_source: P.inventory, film_tv_emne_prefix_required: 'em_film_tv_', chapter_alias_compatibility_is_temporary: true },
    generator_policy: { source_first: true, canonical_files_are_guidance_not_fact_sources: true, variable_domain_sizes: true, fixed_target_counts_forbidden: true },
    migration_targets: { canonical_sources_migrated: true, runtime_place_ids_migrated: true, existing_chapters_require_alias_reaudit: true }
  };
}

function remapValue(value, aliases) {
  if (Array.isArray(value)) return unique(value.flatMap((item) => typeof item === 'string' && aliases.byAlias.has(item) ? aliases.resolve(item) : [remapValue(item, aliases)]));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, remapValue(item, aliases)]));
  if (typeof value === 'string' && aliases.byAlias.has(value)) return aliases.resolve(value)[0];
  return value;
}

function buildControlFiles({ inventory, aliases, emners, methods, mappings, fagkart, currentQuizRules, currentQuizTemplate, currentRegistry, currentStatus }) {
  const counts = { domain_count: inventory.domains.length, emne_count: emners.length, method_count: methods.methods.length, mapping_count: mappings.length, topic_hook_count: fagkart.meta.topic_hook_count };
  const quizRules = structuredClone(currentQuizRules);
  quizRules.version = 'v5.1-source-priority-patch-film-tv-variable-inventory-v1';
  quizRules.canonical_inputs = { ...quizRules.canonical_inputs, ...counts, inventory: 'film_tv_variable_inventory_v1.json' };
  quizRules.hard_rules = { ...quizRules.hard_rules, canonical_files_are_guides_not_content: true, external_film_tv_source_first_all_sets: true, required_emne_prefix: 'em_film_tv_', legacy_alias_resolution_source: 'film_tv_variable_inventory_v1.json', fixed_target_counts_forbidden: true };
  quizRules.migration_note = 'Generatoren bruker 192 aktive canonical-emner i ti variable områder. De 120 gamle ID-ene er bare aliases; antall emner, hooks og metoder er integritetstall, ikke produksjonskvoter.';

  const quizTemplate = structuredClone(currentQuizTemplate);
  quizTemplate.version = 'v1-film-tv-variable-inventory';
  quizTemplate.status = 'canonical_category_profile';
  quizTemplate.governance = { ...(quizTemplate.governance || {}), inventory: 'film_tv_variable_inventory_v1.json', counts_are_not_quotas: true, domain_count: counts.domain_count, emne_count: counts.emne_count, method_count: counts.method_count };
  quizTemplate.content_priorities = unique([...quizTemplate.content_priorities, ...inventory.domains.map((row) => row.title)]);
  quizTemplate.essential_concepts = unique([...quizTemplate.essential_concepts, ...inventory.emner.filter((row) => row.inventory_role === 'integrative_foundation').map((row) => row.title)]);

  const registry = structuredClone(currentRegistry);
  const currentFilmStatus = currentStatus.subjects.find((row) => row.id === 'film_tv');
  const laterChapterGate = ['canonical_chapter_reaudit_complete_learning_order_plan', 'learning_order_plan_complete_first_chapter_source_brief', 'audiovisual_form_source_brief_complete_full_chapter_production', 'audiovisual_form_full_chapter_complete_next_unit_source_brief', 'narrative_viewpoint_genre_source_brief_complete_full_chapter_production', 'narrative_viewpoint_genre_full_chapter_complete_next_unit_source_brief', 'seriality_format_adaptation_source_brief_complete_full_chapter_production', 'seriality_format_adaptation_full_chapter_complete_next_unit_source_brief', 'film_history_movements_historiography_source_brief_complete_full_chapter_production', 'film_history_movements_historiography_full_chapter_complete_next_unit_source_brief', 'television_platforms_participation_source_brief_complete_full_chapter_production', 'television_platforms_participation_full_chapter_complete_next_unit_source_brief', 'documentary_evidence_ethics_source_brief_complete_full_chapter_production', 'documentary_evidence_ethics_full_chapter_complete_next_unit_source_brief', 'representation_position_counterimages_source_brief_complete_full_chapter_production', 'representation_position_counterimages_full_chapter_complete_next_unit_source_brief'].includes(currentFilmStatus?.nextGate);
  if (!laterChapterGate) {
    registry.version = '2.72.0';
    registry.updatedAt = '2026-08-11';
  }
  registry.subjects.film_tv.description = 'Et globalt og stedsforankret audiovisuelt fagverk om form og stil, fortelling og serialitet, film- og TV-historie, dokumentar og etikk, representasjon og makt, produksjon og arbeid, industri og distribusjon, visning og publikum, skjermgeografi, arkiv, kulturarv og minne. Faget starter i dokumenterte verk, scener, produksjoner, sendinger, visningssteder, locations, publikumspraksiser, institusjoner og arkivkilder før metode og teori løftes inn.';
  if (!laterChapterGate) registry.subjects.film_tv.canonicalModel.note = 'Film & TVs canonicale kilder er migrert til 192 evidensbaserte emner i ti variabelt store områder, 119 metoder og eksplisitte én-til-én hooks og mappings. Tallene er integritetskontroller, ikke kvoter. De 120 gamle emne-ID-ene bevares bare som sporbare aliases. De to eksisterende fulltekstkapitlene bevares med claims og kilder, men må reauditeres mot aliasmålene før ny kapittelproduksjon.';
  const chapterDomainMigration = {
    'kinoer-visningssteder-og-publikum': 'visning_publikum_resepsjon_deltakelse',
    'produksjon-studio-og-filmarbeid': 'produksjon_arbeid_teknologi_praksis'
  };
  for (const chapter of registry.subjects.film_tv.chapters) {
    chapter.primary_domain_id = chapterDomainMigration[chapter.id] || chapter.primary_domain_id;
    chapter.emne_ids = unique(chapter.emne_ids.flatMap((id) => aliases.resolve(id).length ? aliases.resolve(id) : [id]));
  }

  const status = structuredClone(currentStatus);
  const filmStatus = status.subjects.find((row) => row.id === 'film_tv');
  if (!laterChapterGate) {
    status.version = '1.60.0';
    status.updatedAt = '2026-08-11';
    filmStatus.nextGate = 'canonical_inventory_migrated_existing_chapter_reaudit';
    filmStatus.note = 'Film & TVs canonicale fagkart, emner, metoder, hooks, mappings, quizregler, pensum og runtime-projeksjon er migrert samlet til det variable inventaret: ti områder, 192 emner, 119 metoder og 192 eksplisitte hooks/mappinger. De 120 legacy-ID-ene er aliases, ikke parallelle emner. De to bevarte kapitlene må nå reauditeres og få canonical emnedekning projisert gjennom aliasene før kapittelproduksjon kan fortsette.';
  }
  return { quizRules, quizTemplate, registry, status, counts };
}

export function buildFilmTvCanonicalMigrationV1() {
  const inventory = read(P.inventory);
  const aliases = aliasState(inventory);
  const migratedMethods = migrateMethods(inventory, read(P.methods), aliases);
  const emners = buildEmners(inventory, migratedMethods.assignments);
  const fagkart = buildFagkart(inventory, emners);
  const mappings = buildMappings(inventory, emners);
  const pensum = buildPensum(inventory, emners, migratedMethods.document, fagkart, mappings);
  const controls = buildControlFiles({ inventory, aliases, emners, methods: migratedMethods.document, mappings, fagkart, currentQuizRules: read(P.quizRules), currentQuizTemplate: read(P.quizTemplate), currentRegistry: read(P.registry), currentStatus: read(P.status) });
  const places = Object.fromEntries(PLACE_FILES.map((file) => [file, remapValue(read(file), aliases)]));
  const domainCounts = Object.fromEntries(inventory.domains.map((row) => [row.id, row.emne_ids.length]));
  const methodDomainCounts = Object.fromEntries(inventory.domains.map((row) => [row.id, migratedMethods.document.methods.filter((method) => method.coverage_domains.includes(row.id)).length]));
  const report = {
    schema: 'history_go_film_tv_canonical_migration_audit_v1', version: '1.0.0', updated_at: '2026-08-11',
    status: 'canonical_inventory_migrated_existing_chapter_reaudit_next', subject_id: 'film_tv',
    integrity_counts_not_quotas: { ...controls.counts, legacy_alias_count: aliases.byAlias.size, runtime_place_file_count: PLACE_FILES.length, domain_emne_counts: domainCounts, domain_method_counts: methodDomainCounts },
    gates: { all_192_inventory_emners_are_canonical_once: true, all_120_legacy_ids_are_aliases_only: true, all_emners_have_valid_domain_method_hook_and_mapping: true, domain_and_method_counts_are_variable: true, source_first_quiz_rules_preserved: true, runtime_place_ids_resolve_to_canonical_emners: true, existing_chapters_preserved_for_alias_reaudit: true, chapter_production_still_blocked: true },
    next_gate: 'reaudit_existing_chapters_against_migrated_canonical_inventory'
  };
  return { inventory, aliases, emners, methods: migratedMethods.document, fagkart, mappings, pensum, ...controls, places, report };
}

export function auditFilmTvCanonicalMigrationV1({ writeFiles = false, checkFiles = true } = {}) {
  const built = buildFilmTvCanonicalMigrationV1();
  const outputs = {
    [P.emner]: built.emners, [P.methods]: built.methods, [P.fagkart]: built.fagkart, [P.mappings]: built.mappings,
    [P.pensum]: built.pensum, [P.quizRules]: built.quizRules, [P.quizTemplate]: built.quizTemplate,
    [P.registry]: built.registry, [P.status]: built.status, [P.report]: built.report, ...built.places
  };
  if (writeFiles) for (const [file, value] of Object.entries(outputs)) write(file, value);
  if (checkFiles) for (const [file, value] of Object.entries(outputs)) assert(isDeepStrictEqual(read(file), value), `${file} er utdatert`);

  const canonicalIds = new Set(built.emners.map((row) => row.emne_id));
  const methodIds = new Set(built.methods.methods.map((row) => row.method_id));
  const hookIds = new Set(built.fagkart.categories.flatMap((row) => row.topic_hooks.map((hook) => hook.id)));
  assert(canonicalIds.size === 192, 'Canonical emne-ID-er er ikke unike 192/192');
  assert(built.aliases.byAlias.size === 120, 'Legacyaliasene er ikke 120/120');
  assert(built.emners.every((row) => row.method_ids.length >= 1 && row.method_ids.every((id) => methodIds.has(id))), 'Et emne har uløst metode');
  assert(built.methods.methods.every((row) => row.emne_affinities.length >= 1), 'En canonical metode er ikke koblet til noe emne');
  assert(built.mappings.length === canonicalIds.size && built.mappings.every((row) => canonicalIds.has(row.emne_id) && hookIds.has(row.primary_hooks[0])), 'Mappingdekningen er ikke eksakt');
  assert(new Set(Object.values(built.report.integrity_counts_not_quotas.domain_emne_counts)).size > 1, 'Områdene er fortsatt nummerlåst');
  assert(new Set(Object.values(built.report.integrity_counts_not_quotas.domain_method_counts)).size > 1, 'Metodedekningen er fortsatt nummerlåst');
  for (const place of Object.values(built.places)) {
    const found = [];
    (function walk(value) { if (typeof value === 'string' && value.startsWith('em_film_tv_')) found.push(value); else if (Array.isArray(value)) value.forEach(walk); else if (value && typeof value === 'object') Object.values(value).forEach(walk); })(place);
    assert(found.every((id) => canonicalIds.has(id)), 'Runtime-sted peker til legacy eller ukjent Film & TV-emne');
  }
  return built;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const result = auditFilmTvCanonicalMigrationV1({ writeFiles: args.has('--write'), checkFiles: !args.has('--no-check') && !args.has('--write') });
    console.log(`Film & TV canonical migrasjon OK: ${result.report.integrity_counts_not_quotas.domain_count} variable områder, ${result.emners.length} emner, ${result.methods.methods.length} metoder og ${result.mappings.length} mappinger.`);
  } catch (error) {
    console.error(`Film & TV canonical migrasjon FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
