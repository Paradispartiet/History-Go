#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  plan: 'data/fag/TV_og_Film/film_tv_learning_order_plan_v1.json',
  emners: 'data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json',
  methods: 'data/fag/TV_og_Film/methods_film_tv_canonical_v4_5.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  brief: 'data/fag/TV_og_Film/film_tv_narrative_viewpoint_genre_source_claim_brief_v1.json',
  report: 'reports/fagverk/film-tv-narrative-viewpoint-genre-source-brief-v1-audit.json'
});
const UNIT_ID = 'fortelling-synsvinkel-og-sjanger';
const FUTURE_CHAPTER_ID = 'fortelling-synsvinkel-og-sjanger';
const INPUT_GATE = 'audiovisual_form_full_chapter_complete_next_unit_source_brief';
const SOURCE_BRIEF_GATE = 'narrative_viewpoint_genre_source_brief_complete_full_chapter_production';
const FULLTEXT_GATE = 'narrative_viewpoint_genre_full_chapter_complete_next_unit_source_brief';
const LATER_SOURCE_BRIEF_GATE = 'seriality_format_adaptation_source_brief_complete_full_chapter_production';
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
const assert = (ok, message) => { if (!ok) throw new Error(message); };

const SOURCES = Object.freeze([
  {
    id: 'ftvnvg01-lhn-film-narration', publisher: 'Universität Hamburg / the living handbook of narratology',
    title: 'Narration in Film', url: 'https://www-archiv.fdm.uni-hamburg.de/lhn/node/64.html', type: 'university-narratology-reference',
    source_location: 'Sections 3.1–3.3 on audiovisual narration, visual and verbal instances, camera, editing, sound and ocularization', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvnvg02-lhn-possible-worlds', publisher: 'Universität Hamburg / the living handbook of narratology',
    title: 'Possible Worlds', url: 'https://www-archiv.fdm.uni-hamburg.de/lhn/node/54.html', type: 'university-narratology-reference',
    source_location: 'Sections on minimal departure, incomplete fictional worlds, disclosure and modal organization', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvnvg03-lhn-focalization', publisher: 'Universität Hamburg / the living handbook of narratology',
    title: 'Focalization', url: 'https://www-archiv.fdm.uni-hamburg.de/lhn/node/18.html', type: 'university-narratology-reference',
    source_location: 'Definition and explication of information selection, knowledge restriction, point of view and focalization', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvnvg04-lhn-time', publisher: 'Universität Hamburg / the living handbook of narratology',
    title: 'Time', url: 'https://www-archiv.fdm.uni-hamburg.de/lhn/node/106.html', type: 'university-narratology-reference',
    source_location: 'Story time and discourse time; order, duration, frequency, analepsis, prolepsis, scene, summary and ellipsis', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvnvg05-lhn-character', publisher: 'Universität Hamburg / the living handbook of narratology',
    title: 'Character', url: 'https://www-archiv.fdm.uni-hamburg.de/lhn/node/41.html', type: 'university-narratology-reference',
    source_location: 'Character as storyworld figure; characterization, action roles, thematic function and historically variable models', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvnvg06-bfi-genre', publisher: 'British Film Institute', title: 'Genres: where to draw the line?',
    url: 'https://www.bfi.org.uk/features/genres-where-draw-line', type: 'national-film-institute-genre-history',
    source_location: 'Genre as historical, industrial and archival classification; ambiguity between genre, style, mood, movement and format', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvnvg07-bfi-neorealism', publisher: 'British Film Institute / Sight and Sound', title: 'The roots of neorealism',
    url: 'https://www.bfi.org.uk/sight-and-sound/features/roots-neorealism', type: 'national-film-institute-historical-analysis',
    source_location: 'People on Sunday section on Berlin leisure spaces, collective authorship, the popular/art-cinema boundary and neorealist influence', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvnvg08-bfi-rashomon', publisher: 'British Film Institute', title: '10 great films based on short stories',
    url: 'https://www.bfi.org.uk/lists/10-great-films-based-short-stories', type: 'national-film-institute-work-analysis',
    source_location: 'Rashomon section on split perspective, incompatible accounts, adaptation source and historical context', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvnvg09-bfi-memento', publisher: 'British Film Institute', title: '10 great puzzle films',
    url: 'https://www.bfi.org.uk/lists/10-great-puzzle-films', type: 'national-film-institute-work-analysis',
    source_location: 'Introduction on Memento’s interlocking timeframes and restricted access through Leonard’s short-term memory', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvnvg10-bfi-long-goodbye', publisher: 'British Film Institute', title: 'Where to begin with neo-noir',
    url: 'https://www.bfi.org.uk/features/where-begin-neo-noir', type: 'national-film-institute-work-and-genre-analysis',
    source_location: 'The Long Goodbye section on Marlowe’s inherited detective code, temporal displacement and noir subversion', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvnvg11-bfi-i-may-destroy-you', publisher: 'British Film Institute / Sight and Sound', title: 'A survivor’s take on I May Destroy You',
    url: 'https://www.bfi.org.uk/sight-and-sound/features/i-may-destroy-you-michaela-coel-survivors-take', type: 'national-film-institute-television-analysis',
    source_location: 'Discussion of the 12-episode series, narrative expectation, unresolved aftermath, character complexity and rape-revenge convention', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvnvg12-bfi-wizard-oz', publisher: 'British Film Institute', title: '10 great films about dreaming',
    url: 'https://www.bfi.org.uk/lists/10-great-films-about-dreaming', type: 'national-film-institute-work-analysis',
    source_location: 'The Wizard of Oz section on the Kansas/Oz contrast, dreamworld construction, Technicolor and tonal instability', retrieval_status: 'verified_2026-08-11'
  }
]);

const CASES = Object.freeze([
  { id: 'case-wizard-of-oz', work: 'The Wizard of Oz', medium: 'film', year: 1939, source_ids: ['ftvnvg12-bfi-wizard-oz'], purpose: 'Skille verdenens regler og kontraster fra en generell påstand om fantasi eller eskapisme.' },
  { id: 'case-people-on-sunday', work: 'People on Sunday', medium: 'film', year: 1930, source_ids: ['ftvnvg07-bfi-neorealism'], purpose: 'Historisere realisme gjennom sted, tone, hverdagsmateriale og blandingen av populærfilm og kunstfilm.' },
  { id: 'case-rashomon', work: 'Rashomon', medium: 'film', year: 1950, source_ids: ['ftvnvg08-bfi-rashomon'], purpose: 'Analysere kunnskapsfordeling gjennom flere uforenlige framstillinger av samme hendelsesforløp.' },
  { id: 'case-memento', work: 'Memento', medium: 'film', year: 2000, source_ids: ['ftvnvg09-bfi-memento'], purpose: 'Koble dobbel tidsordning og informasjonsbegrensning uten å redusere fortellingstid til klipperytme.' },
  { id: 'case-long-goodbye', work: 'The Long Goodbye', medium: 'film', year: 1973, source_ids: ['ftvnvg10-bfi-long-goodbye'], purpose: 'Vise hvordan rollefigurmodell og sjangerkonvensjon kan aktiveres, forskyves og parodieres samtidig.' },
  { id: 'case-i-may-destroy-you', work: 'I May Destroy You', medium: 'television-series', year: 2020, source_ids: ['ftvnvg11-bfi-i-may-destroy-you'], purpose: 'Undersøke hvordan TV-fortelling omordner forventning, rollefigur og mulig avslutning uten å gjøre serialitet til hovedtema.' }
]);

const TOPIC_PLANS = Object.freeze([
  {
    emne_id: 'em_film_tv_fiksjon_realisme_og_verdensbygging', case_ids: ['case-wizard-of-oz','case-people-on-sunday'],
    source_ids: ['ftvnvg01-lhn-film-narration','ftvnvg02-lhn-possible-worlds','ftvnvg07-bfi-neorealism','ftvnvg12-bfi-wizard-oz'],
    learning_goal: 'Skille fiksjonsstatus, verdensregler, realistisk strategi og opplevd troverdighet uten å gjøre realisme til synonym for virkelighet.',
    planned_claims: [
      { id: 'ftv-nvg-pc-01', claim_focus: 'Hvordan en audiovisuell fiksjonsverden etableres gjennom opplysninger, utelatelser, muligheter og grenser som ikke trenger å fylle ut en komplett verden.', claim_type: 'analytical-concept' },
      { id: 'ftv-nvg-pc-02', claim_focus: 'Hvordan Kansas/Oz-kontrasten bygger to forskjellige verdensordener med farge, rom, figurtyper og overgang, uten at virkning på alle seere kan tas for gitt.', claim_type: 'case-analysis' },
      { id: 'ftv-nvg-pc-03', claim_focus: 'Hvordan People on Sunday viser at realisme er en historisk form- og sjangerstrategi knyttet til sted, tone og produksjonsvalg, ikke fravær av konstruksjon.', claim_type: 'historical-case' }
    ]
  },
  {
    emne_id: 'em_film_tv_fokalisering_synsvinkel_og_kunnskapsfordeling', case_ids: ['case-rashomon','case-memento'],
    source_ids: ['ftvnvg01-lhn-film-narration','ftvnvg03-lhn-focalization','ftvnvg08-bfi-rashomon','ftvnvg09-bfi-memento'],
    learning_goal: 'Analysere hvem som får se, høre og vite hva uten å forveksle kameraets plassering med hele fortellingens kunnskapsordning.',
    planned_claims: [
      { id: 'ftv-nvg-pc-04', claim_focus: 'Hvorfor fokalisering beskriver seleksjon og begrensning av informasjon på tvers av bilde, lyd, klipp og verbal fortelling, ikke bare point-of-view-shot.', claim_type: 'analytical-concept' },
      { id: 'ftv-nvg-pc-05', claim_focus: 'Hvordan Rashomon og Memento begrenser og omfordeler kunnskap på ulike måter, og hvorfor motstridende framstilling ikke automatisk betyr at alle påstander er like sanne.', claim_type: 'comparative-case' }
    ]
  },
  {
    emne_id: 'em_film_tv_fortellingstid_rekkefolge_varighet_og_frekvens', case_ids: ['case-memento','case-i-may-destroy-you'],
    source_ids: ['ftvnvg04-lhn-time','ftvnvg09-bfi-memento','ftvnvg11-bfi-i-may-destroy-you'],
    learning_goal: 'Skille hendelsestid og framstillingstid gjennom rekkefølge, varighet og frekvens, med klipperytme og sendeskjema holdt utenfor.',
    planned_claims: [
      { id: 'ftv-nvg-pc-06', claim_focus: 'Hvordan rekkefølge, varighet og frekvens beskriver forskjellige relasjoner mellom hendelser og framstilling.', claim_type: 'analytical-concept' },
      { id: 'ftv-nvg-pc-07', claim_focus: 'Hvordan Mementos to tidsrekker regulerer hva tilskueren kan rekonstruere, uten at baklengs orden alene forklarer all kunnskapsfordeling.', claim_type: 'case-analysis' },
      { id: 'ftv-nvg-pc-08', claim_focus: 'Hvordan I May Destroy You bruker repetisjon, mulige handlingsforløp og en ikke-entydig avslutningslogikk til å prøve fortellingsforventninger.', claim_type: 'television-case' }
    ]
  },
  {
    emne_id: 'em_film_tv_karakter_rollefigur_og_fortellingsfunksjon', case_ids: ['case-long-goodbye','case-i-may-destroy-you','case-rashomon'],
    source_ids: ['ftvnvg01-lhn-film-narration','ftvnvg05-lhn-character','ftvnvg08-bfi-rashomon','ftvnvg10-bfi-long-goodbye','ftvnvg11-bfi-i-may-destroy-you'],
    learning_goal: 'Skille rollefigur som konstruert deltaker, handlingsfunksjon og karakterisering fra skuespillerens offentlige persona og publikums faktiske identifikasjon.',
    planned_claims: [
      { id: 'ftv-nvg-pc-09', claim_focus: 'Hvordan rollefigurer kan analyseres samtidig som fiktive vesener, handlingsfunksjoner, formskapte artefakter og tematiske bærere.', claim_type: 'analytical-concept' },
      { id: 'ftv-nvg-pc-10', claim_focus: 'Hvordan Marlowe, Arabella og Rashomons vitner får ulik fortellingsfunksjon gjennom sjangerkode, karakterisering og tilgang til informasjon.', claim_type: 'comparative-case' }
    ]
  },
  {
    emne_id: 'em_film_tv_sjanger_konvensjon_og_kontrakt', case_ids: ['case-long-goodbye','case-i-may-destroy-you','case-people-on-sunday'],
    source_ids: ['ftvnvg06-bfi-genre','ftvnvg07-bfi-neorealism','ftvnvg10-bfi-long-goodbye','ftvnvg11-bfi-i-may-destroy-you'],
    learning_goal: 'Forstå sjanger som historisk skiftende forventnings-, produksjons- og klassifikasjonspraksis, ikke som en tidløs sjekkliste.',
    planned_claims: [
      { id: 'ftv-nvg-pc-11', claim_focus: 'Hvorfor sjangerbetegnelser oppstår og brukes forskjellig i produksjon, markedsføring, kritikk, arkiv og analyse.', claim_type: 'historical-concept' },
      { id: 'ftv-nvg-pc-12', claim_focus: 'Hvordan The Long Goodbye gjør noirforventninger synlige ved å flytte en etablert detektivmodell inn i en senere sosial og filmhistorisk situasjon.', claim_type: 'case-analysis' },
      { id: 'ftv-nvg-pc-13', claim_focus: 'Hvordan I May Destroy You og People on Sunday forhandler med henholdsvis rape-revenge- og realismeforventninger uten å kunne reduseres til én sjangeretikett.', claim_type: 'comparative-case' }
    ]
  }
]);

function buildTopicBriefs(unit, emneById) {
  return TOPIC_PLANS.map((topic) => {
    const canonical = emneById.get(topic.emne_id);
    return {
      ...topic,
      title: canonical.title,
      canonical_boundary: canonical.boundary,
      method_ids: canonical.method_ids,
      planned_claims: topic.planned_claims.map((claim) => ({
        ...claim,
        source_ids: topic.source_ids,
        status: 'planned_requires_fulltext_verification'
      }))
    };
  });
}

export function buildFilmTvNarrativeViewpointGenreSourceBriefV1() {
  const plan = read(P.plan);
  const unit = plan.planned_units.find((row) => row.id === UNIT_ID);
  const emners = read(P.emners);
  const emneById = new Map(emners.map((row) => [row.emne_id, row]));
  const methodsDoc = read(P.methods);
  const methodIds = new Set((Array.isArray(methodsDoc) ? methodsDoc : methodsDoc.methods).map((row) => row.method_id || row.id));
  const sourceIds = new Set(SOURCES.map((row) => row.id));
  const caseIds = new Set(CASES.map((row) => row.id));
  const topicBriefs = buildTopicBriefs(unit, emneById);
  const plannedClaims = topicBriefs.flatMap((topic) => topic.planned_claims);
  const currentRegistry = read(P.registry);
  const currentStatus = read(P.status);

  const brief = {
    schema: 'history_go_film_tv_narrative_viewpoint_genre_source_claim_brief_v1',
    version: '1.0.0', updated_at: '2026-08-11', status: 'source_claim_brief_complete_full_chapter_next', subject_id: 'film_tv',
    planned_unit_id: UNIT_ID, future_chapter_id: FUTURE_CHAPTER_ID,
    runtime_registration: { registered: false, allowed_before_full_chapter_gate: false },
    scope: {
      title: unit.title, primary_domain_ids: unit.primary_domain_ids,
      prerequisite_planned_unit_ids: unit.prerequisite_planned_unit_ids,
      emne_count: unit.emne_count, emne_ids: unit.emne_ids, overlap_boundary: unit.overlap_boundary
    },
    source_policy: {
      sources_are_inspectable_https: true,
      institutional_and_university_sources_prioritized: true,
      conceptual_claims_require_faglig_source: true,
      case_claims_require_work_specific_source: true,
      film_and_television_cases_are_both_required_when_relevant: true,
      analysis_must_name_observable_narrative_organization_before_interpretation: true,
      planned_claim_is_not_verified_claim: true,
      fulltext_requires_paragraph_level_claim_trace: true
    },
    sources: SOURCES,
    case_candidates: CASES,
    topic_briefs: topicBriefs,
    proposed_module_order: [
      { id: 'verdener-realisme-og-sjanger', sequence: 1, emne_ids: [unit.emne_ids[0], unit.emne_ids[4]], purpose: 'Fra fiksjonsverden og realistisk strategi til historisk sjangerkontrakt.' },
      { id: 'kunnskap-og-fortellingstid', sequence: 2, emne_ids: [unit.emne_ids[1], unit.emne_ids[2]], purpose: 'Fra informasjonsfordeling til rekkefølge, varighet og frekvens.' },
      { id: 'rollefigur-og-funksjon', sequence: 3, emne_ids: [unit.emne_ids[3]], purpose: 'Samler karakterisering, handlingsrolle og tematisk funksjon etter at verden, kunnskap og tid er etablert.' }
    ],
    production_requirements: {
      section_scope_is_derived_from_emne_ownership: true,
      paragraph_and_claim_counts_follow_problem_complexity: true,
      current_claim_plan_counts_by_emne: topicBriefs.map((row) => ({ emne_id: row.emne_id, planned_claim_count: row.planned_claims.length })),
      paragraph_claim_trace_required: true,
      every_planned_claim_must_be_verified_rewritten_or_rejected: true,
      every_used_source_must_support_at_least_one_final_claim: true,
      case_comparison_must_distinguish_observation_source_fact_and_interpretation: true,
      television_case_must_not_expand_into_seriality_or_format_history: true,
      chapter_registration_only_after_audit: true
    },
    next_gate: 'produce_full_chapter_claims_and_inspectable_sources_for_fortelling_synsvinkel_og_sjanger'
  };

  const registry = structuredClone(currentRegistry);
  registry.version = '2.78.0';
  registry.updatedAt = '2026-08-11';
  registry.subjects.film_tv.canonicalModel.note = 'Film & TVs variable canon har 192 emner. Audiovisuell form og sansing er registrert etter fulltekstporten. Fortelling, synsvinkel og sjanger har nå en egen kilde- og claimbrief for 5 canonicale emner med 12 inspectable universitets- og institusjonskilder, 6 film- og TV-case og 13 variabelt fordelte claimplaner. Claimplanene er uverifiserte, og kapitlet er ikke runtime-registrert. Neste port er fulltekst med avsnittsnivå claimtrace og ny audit; omfanget følger problemgrensene, ikke en kvote.';
  registry.subjects.film_tv.canonicalModel.secondSourceClaimBrief = P.brief;

  const status = structuredClone(currentStatus);
  status.version = '1.66.0';
  status.updatedAt = '2026-08-11';
  const filmStatus = status.subjects.find((row) => row.id === 'film_tv');
  filmStatus.nextGate = SOURCE_BRIEF_GATE;
  filmStatus.note = 'Kilde- og claimbriefen for Fortelling, synsvinkel og sjanger er komplett: 5 canonicale emner, 12 inspectable universitets- og institusjonskilder, 6 film- og TV-case og 13 claimplaner fordelt 3–2–3–2–3 etter faglig behov. Planlagte claims er ikke verifiserte claims, og kapitlet er ikke registrert. Neste port er fulltekst, faktisk kildebruk og avsnittsnivå trace før kapittel- og runtime-registrering.';

  const usedSourceIds = new Set([...topicBriefs.flatMap((topic) => topic.source_ids), ...CASES.flatMap((row) => row.source_ids)]);
  const claimCounts = topicBriefs.map((row) => row.planned_claims.length);
  const report = {
    schema: 'history_go_film_tv_narrative_viewpoint_genre_source_brief_v1_audit',
    version: '1.0.0', updated_at: '2026-08-11', status: 'source_claim_brief_complete_full_chapter_next', subject_id: 'film_tv',
    summary: {
      emne_count: unit.emne_count, source_count: SOURCES.length, case_count: CASES.length,
      film_case_count: CASES.filter((row) => row.medium === 'film').length,
      television_case_count: CASES.filter((row) => row.medium === 'television-series').length,
      planned_claim_count: plannedClaims.length, planned_claim_counts_by_emne: claimCounts,
      proposed_module_count: brief.proposed_module_order.length, registered_chapter_count_delta: 0
    },
    coverage: topicBriefs.map((topic) => ({
      emne_id: topic.emne_id, method_count: topic.method_ids.length,
      source_count: topic.source_ids.length, case_count: topic.case_ids.length,
      planned_claim_count: topic.planned_claims.length
    })),
    gates: {
      second_learning_order_unit_selected: plan.production_sequence[1] === UNIT_ID,
      audiovisual_form_prerequisite_registered: currentRegistry.subjects.film_tv.chapters.some((row) => row.id === 'audiovisuell-form-og-sansing'),
      exact_unit_emne_coverage: topicBriefs.length === unit.emne_count && new Set(topicBriefs.map((row) => row.emne_id)).size === unit.emne_count && unit.emne_ids.every((id) => topicBriefs.some((row) => row.emne_id === id)),
      all_emners_active_canonical: topicBriefs.every((row) => emneById.has(row.emne_id)),
      all_methods_resolve: topicBriefs.every((row) => row.method_ids.every((id) => methodIds.has(id))),
      inspectable_https_sources: SOURCES.every((row) => row.url.startsWith('https://') && row.retrieval_status === 'verified_2026-08-11'),
      every_source_used: SOURCES.every((row) => usedSourceIds.has(row.id)),
      every_source_reference_resolves: [...usedSourceIds].every((id) => sourceIds.has(id)),
      every_case_documented: CASES.every((row) => row.source_ids.length && row.source_ids.every((id) => sourceIds.has(id))),
      film_and_television_cases_present: CASES.some((row) => row.medium === 'film') && CASES.some((row) => row.medium === 'television-series'),
      every_case_reference_resolves: topicBriefs.every((row) => row.case_ids.every((id) => caseIds.has(id))),
      every_case_source_available_to_owning_topic: topicBriefs.every((topic) => topic.case_ids.every((caseId) => CASES.find((row) => row.id === caseId).source_ids.every((sourceId) => topic.source_ids.includes(sourceId)))),
      claim_counts_follow_variable_problem_scope: new Set(claimCounts).size > 1 && Math.min(...claimCounts) >= 2,
      no_planned_claim_overstated_as_verified: plannedClaims.every((row) => row.status === 'planned_requires_fulltext_verification'),
      all_planned_claim_ids_unique: new Set(plannedClaims.map((row) => row.id)).size === plannedClaims.length,
      all_topics_have_boundaries_sources_cases_and_methods: topicBriefs.every((row) => row.canonical_boundary && row.source_ids.length >= 3 && row.case_ids.length >= 2 && row.method_ids.length >= 1),
      module_order_covers_every_emne_once: brief.proposed_module_order.flatMap((row) => row.emne_ids).length === unit.emne_count && new Set(brief.proposed_module_order.flatMap((row) => row.emne_ids)).size === unit.emne_count,
      module_sizes_are_not_forced_equal: new Set(brief.proposed_module_order.map((row) => row.emne_ids.length)).size > 1,
      chapter_remains_unregistered: !registry.subjects.film_tv.chapters.some((row) => row.id === FUTURE_CHAPTER_ID),
      registration_waits_for_fulltext_claim_source_audit: !brief.runtime_registration.registered && !brief.runtime_registration.allowed_before_full_chapter_gate && brief.production_requirements.chapter_registration_only_after_audit
    },
    next_gate: brief.next_gate
  };
  return { brief, report, registry, status, unit, topicBriefs, plannedClaims };
}

export function auditFilmTvNarrativeViewpointGenreSourceBriefV1({ writeFiles = false, checkFiles = true } = {}) {
  const currentGate = read(P.status).subjects.find((row) => row.id === 'film_tv')?.nextGate;
  assert([INPUT_GATE, SOURCE_BRIEF_GATE, FULLTEXT_GATE, LATER_SOURCE_BRIEF_GATE].includes(currentGate), `Uventet Film & TV-port: ${currentGate}`);
  if ([FULLTEXT_GATE, LATER_SOURCE_BRIEF_GATE].includes(currentGate)) {
    const brief = read(P.brief);
    const report = read(P.report);
    const registry = read(P.registry);
    const status = read(P.status);
    const plan = read(P.plan);
    const unit = plan.planned_units.find((row) => row.id === UNIT_ID);
    const topicBriefs = brief.topic_briefs;
    const plannedClaims = topicBriefs.flatMap((topic) => topic.planned_claims);
    const sourceIds = new Set(brief.sources.map((row) => row.id));
    const caseById = new Map(brief.case_candidates.map((row) => [row.id, row]));
    const methodsDoc = read(P.methods);
    const methodIds = new Set((Array.isArray(methodsDoc) ? methodsDoc : methodsDoc.methods).map((row) => row.method_id || row.id));
    assert(brief.status === 'source_claim_brief_consumed_by_verified_chapter', 'Fortellingsbriefen skal være konsumert etter fulltekstporten');
    assert(brief.runtime_registration.registered === true && brief.runtime_registration.chapter_id === FUTURE_CHAPTER_ID, 'Fortellingsbriefen mangler etterfølgende kapittelregistrering');
    assert(plannedClaims.length === 13 && plannedClaims.every((row) => row.status === 'resolved_to_verified_claim' && row.final_claim_id === row.id), 'Fortellingsbriefens claimplaner er ikke løst');
    assert(sourceIds.size === 12 && brief.sources.every((row) => row.url.startsWith('https://') && row.retrieval_status === 'verified_2026-08-11' && row.source_location), 'Fortellingsbriefens inspectable kilder er ikke intakte');
    assert(caseById.size === 6 && brief.case_candidates.every((row) => row.source_ids.length && row.source_ids.every((id) => sourceIds.has(id))), 'Fortellingsbriefens casekilder er ikke intakte');
    assert(topicBriefs.length === unit.emne_count && new Set(topicBriefs.map((row) => row.emne_id)).size === unit.emne_count && unit.emne_ids.every((id) => topicBriefs.some((row) => row.emne_id === id)), 'Fortellingsbriefens canonicale emnedekning er brutt');
    assert(topicBriefs.every((topic) => topic.canonical_boundary && topic.source_ids.length >= 3 && topic.source_ids.every((id) => sourceIds.has(id)) && topic.method_ids.length && topic.method_ids.every((id) => methodIds.has(id))), 'Fortellingsbriefens emnekilder, grenser eller metoder er brutt');
    assert(topicBriefs.every((topic) => topic.case_ids.every((caseId) => caseById.has(caseId) && caseById.get(caseId).source_ids.every((sourceId) => topic.source_ids.includes(sourceId)))), 'Fortellingsbriefens case-til-emne-spor er brutt');
    assert(brief.proposed_module_order.flatMap((row) => row.emne_ids).length === unit.emne_count && new Set(brief.proposed_module_order.flatMap((row) => row.emne_ids)).size === unit.emne_count, 'Fortellingsbriefens moduldekning er brutt');
    assert(registry.subjects.film_tv.chapters.some((row) => row.id === FUTURE_CHAPTER_ID), 'Det verifiserte fortellingskapitlet mangler i registeret');
    assert(report.status === 'source_claim_brief_consumed_by_verified_chapter' && Object.values(report.gates).every(Boolean), 'Fortellingsbriefens etteraudit er ikke grønn');
    return { brief, report, registry, status, unit, topicBriefs, plannedClaims };
  }
  const built = buildFilmTvNarrativeViewpointGenreSourceBriefV1();
  const outputs = { [P.brief]: built.brief, [P.report]: built.report, [P.registry]: built.registry, [P.status]: built.status };
  if (writeFiles) for (const [file, value] of Object.entries(outputs)) write(file, value);
  if (checkFiles) for (const [file, value] of Object.entries(outputs)) assert(isDeepStrictEqual(read(file), value), `${file} er utdatert`);
  assert(Object.values(built.report.gates).every(Boolean), 'Minst én kildebriefport feiler');
  return built;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const result = auditFilmTvNarrativeViewpointGenreSourceBriefV1({ writeFiles: args.has('--write'), checkFiles: !args.has('--write') });
    console.log(`Film & TV fortellingsbrief OK: ${result.topicBriefs.length} emner, ${result.brief.sources.length} kilder, ${result.brief.case_candidates.length} case og ${result.plannedClaims.length} claimspor; status ${result.brief.status}.`);
  } catch (error) {
    console.error(`Film & TV fortellingsbrief FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
