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
  brief: 'data/fag/TV_og_Film/film_tv_audiovisual_form_source_claim_brief_v1.json',
  report: 'reports/fagverk/film-tv-audiovisual-form-source-brief-v1-audit.json'
});
const UNIT_ID = 'audiovisuell-form-og-sansing';
const FUTURE_CHAPTER_ID = 'audiovisuell-form-og-sansing';
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
const assert = (ok, message) => { if (!ok) throw new Error(message); };

const SOURCES = Object.freeze([
  { id: 'ftvaf01-yale-mise', publisher: 'Yale University Film Analysis', title: 'Part 2: Mise-en-scene', url: 'https://filmanalysis.yale.edu/mise-en-scene/', type: 'university-film-analysis-guide', source_location: 'Decor, lighting, space, matte shots, offscreen space, costume and acting', retrieval_status: 'verified_2026-08-11' },
  { id: 'ftvaf02-yale-cinematography', publisher: 'Yale University Film Analysis', title: 'Part 3: Cinematography', url: 'https://filmanalysis.yale.edu/cinematography/', type: 'university-film-analysis-guide', source_location: 'Image quality, rate, framing, aspect ratio, lenses, focus and camera movement', retrieval_status: 'verified_2026-08-11' },
  { id: 'ftvaf03-yale-editing', publisher: 'Yale University Film Analysis', title: 'Part 4: Editing', url: 'https://filmanalysis.yale.edu/editing/', type: 'university-film-analysis-guide', source_location: 'Transitions, continuity, montage, duration and relations between shots', retrieval_status: 'verified_2026-08-11' },
  { id: 'ftvaf04-yale-sound', publisher: 'Yale University Film Analysis', title: 'Part 5: Sound', url: 'https://filmanalysis.yale.edu/sound/', type: 'university-film-analysis-guide', source_location: 'Sound editing, sound bridges, source, diegesis and offscreen sound', retrieval_status: 'verified_2026-08-11' },
  { id: 'ftvaf05-bfi-citizen-kane', publisher: 'British Film Institute', title: '20 inspired visual moments in Citizen Kane', url: 'https://www.bfi.org.uk/features/20-inspired-visual-moments-citizen-kane', type: 'national-film-institute-sequence-analysis', source_location: 'Dissolves, lighting, camera movement, montage, blocking, low angles and deep focus', retrieval_status: 'verified_2026-08-11' },
  { id: 'ftvaf06-academy-gravity', publisher: 'Academy of Motion Picture Arts and Sciences', title: 'Deconstructing Gravity', url: 'https://www.oscars.org/events/deconstructing-gravity', type: 'academy-production-analysis', source_location: 'Previsualization, animation, live action, invisible edits, camera, lighting and synthetic environments', retrieval_status: 'verified_2026-08-11' },
  { id: 'ftvaf07-bfi-anime', publisher: 'British Film Institute / Sight and Sound', title: '50 key anime films', url: 'https://www.bfi.org.uk/sight-and-sound/lists/50-key-anime-films', type: 'national-film-institute-critical-survey', source_location: 'Animation design, movement, color, mise-en-scene, performance and rhythm across documented works', retrieval_status: 'verified_2026-08-11' },
  { id: 'ftvaf08-loc-film-registry', publisher: 'Library of Congress / National Film Preservation Board', title: 'Brief Descriptions and Expanded Essays of National Film Registry Titles', url: 'https://www.loc.gov/programs/national-film-preservation-board/film-registry/descriptions-and-essays/', type: 'national-film-registry-case-corpus', source_location: 'Inspectable case records including The Matrix, The Thing, Tin Toy and Forbidden Planet', retrieval_status: 'verified_2026-08-11' }
]);

const CASES = Object.freeze([
  { id: 'case-citizen-kane', work: 'Citizen Kane', year: 1941, source_ids: ['ftvaf05-bfi-citizen-kane','ftvaf01-yale-mise','ftvaf02-yale-cinematography','ftvaf03-yale-editing'], purpose: 'Komposisjon, dybde, lys, kamerabevegelse, blokkering, overgang og rytme i samme dokumenterte sekvenskorpus.' },
  { id: 'case-gravity', work: 'Gravity', year: 2013, source_ids: ['ftvaf06-academy-gravity'], purpose: 'Syntetisk realisme, animert bevegelse, previsualisering, lys og kamera som sammenkoblet form.' },
  { id: 'case-yi-yi', work: 'Yi Yi', year: 2000, source_ids: ['ftvaf03-yale-editing','ftvaf04-yale-sound'], purpose: 'Lydbro, forventning, sceneskifte og audiovisuell rytme.' },
  { id: 'case-night-is-short', work: 'The Night Is Short, Walk on Girl', year: 2017, source_ids: ['ftvaf07-bfi-anime'], purpose: 'Design, farge, kropp, bevegelse og atmosfære i animasjon.' },
  { id: 'case-matrix', work: 'The Matrix', year: 1999, source_ids: ['ftvaf08-loc-film-registry'], purpose: 'Digitalt kontrollert tid, bevegelse, visuelle effekter og syntetisk rom.' },
  { id: 'case-the-thing', work: 'The Thing', year: 1982, source_ids: ['ftvaf08-loc-film-registry'], purpose: 'Lange suspenseforløp, atmosfære, effektarbeid og musikk.' },
  { id: 'case-touch-of-evil', work: 'Touch of Evil', year: 1958, source_ids: ['ftvaf01-yale-mise','ftvaf02-yale-cinematography'], purpose: 'Lyskontrast, dybde, utsnitt og suspense som observerbare formvalg.' }
]);

const TOPIC_PLANS = Object.freeze([
  {
    emne_id: 'em_film_tv_animasjon_bevegelse_design_og_tidsdannelse', case_ids: ['case-night-is-short','case-gravity'], source_ids: ['ftvaf02-yale-cinematography','ftvaf06-academy-gravity','ftvaf07-bfi-anime'],
    learning_goal: 'Skille animert tidsdannelse, design og bevegelse fra animasjonsproduksjonens arbeidsløp.',
    planned_claims: [
      { id: 'ftv-af-pc-01', claim_focus: 'Hvordan frame rate, stop-motion og konstruert bevegelse gjør tid til et formvalg.', claim_type: 'analytical-concept' },
      { id: 'ftv-af-pc-02', claim_focus: 'Hvordan design, farge, kropp og bevegelse kan bygge ulik materialitet og atmosfære i to dokumenterte animasjonscase.', claim_type: 'comparative-case' }
    ]
  },
  {
    emne_id: 'em_film_tv_audiovisuell_atmosfare', case_ids: ['case-night-is-short','case-the-thing','case-citizen-kane'], source_ids: ['ftvaf01-yale-mise','ftvaf03-yale-editing','ftvaf04-yale-sound','ftvaf05-bfi-citizen-kane','ftvaf07-bfi-anime','ftvaf08-loc-film-registry'],
    learning_goal: 'Analysere atmosfære som samspill mellom bilde, lyd, rytme og rom framfor som løs stemningsetikett.',
    planned_claims: [
      { id: 'ftv-af-pc-03', claim_focus: 'Hvordan lys, dekor, rom, lydkilde og varighet må analyseres samlet før atmosfære tilskrives én teknikk.', claim_type: 'analytical-concept' },
      { id: 'ftv-af-pc-04', claim_focus: 'Hvordan tre case bygger henholdsvis drømmeaktig, truende og foregripende atmosfære med ulike observerbare formkombinasjoner.', claim_type: 'comparative-case' }
    ]
  },
  {
    emne_id: 'em_film_tv_audiovisuell_rytme', case_ids: ['case-yi-yi','case-citizen-kane'], source_ids: ['ftvaf03-yale-editing','ftvaf04-yale-sound','ftvaf05-bfi-citizen-kane'],
    learning_goal: 'Skille klipperytme, kamerarytme, lydrytme og framføringsrytme fra narrativ informasjonsstans.',
    planned_claims: [
      { id: 'ftv-af-pc-05', claim_focus: 'Hvordan overgang, shotlengde, bevegelse og lydbro danner flere samtidige rytmelag.', claim_type: 'analytical-concept' },
      { id: 'ftv-af-pc-06', claim_focus: 'Hvordan Yi Yi og Citizen Kane organiserer tempo og forventning gjennom ulike kombinasjoner av lyd og bildeovergang.', claim_type: 'comparative-case' }
    ]
  },
  {
    emne_id: 'em_film_tv_bildeformat_skjermflate_og_audiovisuell_materialitet', case_ids: ['case-citizen-kane'], source_ids: ['ftvaf02-yale-cinematography','ftvaf05-bfi-citizen-kane'],
    learning_goal: 'Koble sideforhold og skjermflate til komposisjon uten å blande inn visningsrommets sosiale organisering eller arkivbevaring.',
    planned_claims: [
      { id: 'ftv-af-pc-07', claim_focus: 'Hvordan sideforhold og beskjæring endrer romlige relasjoner og oppmerksomhetsfordeling i bildet.', claim_type: 'analytical-concept' },
      { id: 'ftv-af-pc-08', claim_focus: 'Hvordan dybde, plassering og billedkant i Citizen Kane kan analyseres mot alternative presentasjonsformater.', claim_type: 'case-analysis' }
    ]
  },
  {
    emne_id: 'em_film_tv_digitale_bilder_vfx_og_syntetisk_realisme', case_ids: ['case-gravity','case-matrix'], source_ids: ['ftvaf01-yale-mise','ftvaf06-academy-gravity','ftvaf08-loc-film-registry'],
    learning_goal: 'Analysere hvordan sammensatte og syntetiske bilder etablerer troverdig rom og bevegelse uten å gjøre verktøyhistorie til hovedsak.',
    planned_claims: [
      { id: 'ftv-af-pc-09', claim_focus: 'Hvordan live action, animasjon, usynlige overganger og matchet lys kan danne en sammenhengende syntetisk billedverden.', claim_type: 'analytical-concept' },
      { id: 'ftv-af-pc-10', claim_focus: 'Hvordan Gravity og The Matrix bruker ulik kontroll over tid, kamera og digitale elementer for å produsere troverdighet.', claim_type: 'comparative-case' }
    ]
  },
  {
    emne_id: 'em_film_tv_lydform_dialog_musikk_effekt_og_stillhet', case_ids: ['case-yi-yi','case-the-thing'], source_ids: ['ftvaf04-yale-sound','ftvaf08-loc-film-registry'],
    learning_goal: 'Skille dialog, musikk, effekt, romlyd og stillhet etter funksjon, kilde og forhold til bildet.',
    planned_claims: [
      { id: 'ftv-af-pc-11', claim_focus: 'Hvordan diegetisk, ikke-diegetisk, intern og offscreen lyd skaper ulike perspektiv- og romrelasjoner.', claim_type: 'analytical-concept' },
      { id: 'ftv-af-pc-12', claim_focus: 'Hvordan lydbro i Yi Yi og musikk/lyd i The Thing organiserer forventning på ulike måter.', claim_type: 'comparative-case' }
    ]
  },
  {
    emne_id: 'em_film_tv_mise_en_scene_og_bildekomposisjon', case_ids: ['case-citizen-kane','case-touch-of-evil'], source_ids: ['ftvaf01-yale-mise','ftvaf02-yale-cinematography','ftvaf05-bfi-citizen-kane'],
    learning_goal: 'Analysere scenografi, plassering, dybde, lys og bevegelse i det ferdige bildet uten å overta produksjonsdesignets arbeidsprosess.',
    planned_claims: [
      { id: 'ftv-af-pc-13', claim_focus: 'Hvordan dekor, lys, dybde og plassering organiserer forhold mellom elementer i det diegetiske rommet.', claim_type: 'analytical-concept' },
      { id: 'ftv-af-pc-14', claim_focus: 'Hvordan blokkering og dybde i Citizen Kane og lys/rom i Touch of Evil skaper ulike relasjoner mellom figur og miljø.', claim_type: 'comparative-case' }
    ]
  },
  {
    emne_id: 'em_film_tv_skuespillerprestasjon_kropp_stemme_og_blikk', case_ids: ['case-night-is-short','case-gravity','case-citizen-kane'], source_ids: ['ftvaf01-yale-mise','ftvaf05-bfi-citizen-kane','ftvaf06-academy-gravity','ftvaf07-bfi-anime'],
    learning_goal: 'Beskrive kropp, stemme, ansikt, timing, blikk og kameraavstand som framføringsform uten å gjøre casting eller stjernepersona til hovedtema.',
    planned_claims: [
      { id: 'ftv-af-pc-15', claim_focus: 'Hvordan framføringsstil varierer historisk og kulturelt og blir formet av utsnitt, rom og samspill.', claim_type: 'analytical-concept' },
      { id: 'ftv-af-pc-16', claim_focus: 'Hvordan animert gest, vektløs kroppsbevegelse og blokkert ensembleframføring krever ulike observasjonskriterier.', claim_type: 'comparative-case' }
    ]
  },
  {
    emne_id: 'em_film_tv_suspense_som_audiovisuell_teknikk', case_ids: ['case-the-thing','case-touch-of-evil'], source_ids: ['ftvaf01-yale-mise','ftvaf02-yale-cinematography','ftvaf04-yale-sound','ftvaf08-loc-film-registry'],
    learning_goal: 'Analysere suspense som tids-, rom- og kunnskapsstyring på tvers av sjangre, ikke som synonym for thriller.',
    planned_claims: [
      { id: 'ftv-af-pc-17', claim_focus: 'Hvordan offscreen rom og lyd, fokus, utsnitt og varighet kan fordele kunnskap ulikt mellom figur og tilskuer.', claim_type: 'analytical-concept' },
      { id: 'ftv-af-pc-18', claim_focus: 'Hvordan The Thing og Touch of Evil bygger suspense med ulike kombinasjoner av synlighet, varighet, lyd og rom.', claim_type: 'comparative-case' }
    ]
  },
  {
    emne_id: 'em_film_tv_utsnitt_linse_kamerabevegelse_og_blokkering', case_ids: ['case-citizen-kane','case-gravity','case-matrix'], source_ids: ['ftvaf01-yale-mise','ftvaf02-yale-cinematography','ftvaf05-bfi-citizen-kane','ftvaf06-academy-gravity','ftvaf08-loc-film-registry'],
    learning_goal: 'Skille utsnitt, optisk perspektiv, kamerabevegelse og bevegelse foran kamera før virkning fortolkes.',
    planned_claims: [
      { id: 'ftv-af-pc-19', claim_focus: 'Hvordan linse, fokus, vinkel, kamerabane og blokkering er forskjellige variabler som kan kombineres i ett shot.', claim_type: 'analytical-concept' },
      { id: 'ftv-af-pc-20', claim_focus: 'Hvordan tre case fordeler bevegelse mellom kamera, figur og syntetisk rom på ulike måter.', claim_type: 'comparative-case' }
    ]
  }
]);

export function buildFilmTvAudiovisualFormSourceBriefV1() {
  const plan = read(P.plan);
  const unit = plan.planned_units.find((row) => row.id === UNIT_ID);
  const emners = read(P.emners);
  const emneById = new Map(emners.map((row) => [row.emne_id, row]));
  const methodsDoc = read(P.methods);
  const methodRows = Array.isArray(methodsDoc) ? methodsDoc : methodsDoc.methods;
  const methodIds = new Set(methodRows.map((row) => row.method_id || row.id));
  const sourceIds = new Set(SOURCES.map((row) => row.id));
  const caseIds = new Set(CASES.map((row) => row.id));
  const topicBriefs = TOPIC_PLANS.map((topic) => {
    const canonical = emneById.get(topic.emne_id);
    return {
      ...topic,
      title: canonical.title,
      canonical_boundary: canonical.boundary,
      method_ids: canonical.method_ids,
      planned_claims: topic.planned_claims.map((claim) => ({ ...claim, source_ids: topic.source_ids, status: 'planned_requires_fulltext_verification' }))
    };
  });
  const currentStatus = read(P.status);
  const laterFulltextGate = ['audiovisual_form_full_chapter_complete_next_unit_source_brief', 'narrative_viewpoint_genre_source_brief_complete_full_chapter_production', 'narrative_viewpoint_genre_full_chapter_complete_next_unit_source_brief', 'seriality_format_adaptation_source_brief_complete_full_chapter_production', 'seriality_format_adaptation_full_chapter_complete_next_unit_source_brief'].includes(currentStatus.subjects.find((row) => row.id === 'film_tv')?.nextGate);
  if (laterFulltextGate) {
    const brief = read(P.brief);
    const consumedTopicBriefs = brief.topic_briefs;
    return {
      brief,
      report: read(P.report),
      registry: read(P.registry),
      status: currentStatus,
      unit,
      topicBriefs: consumedTopicBriefs,
      plannedClaims: consumedTopicBriefs.flatMap((topic) => topic.planned_claims)
    };
  }
  const brief = {
    schema: 'history_go_film_tv_audiovisual_form_source_claim_brief_v1',
    version: '1.0.0', updated_at: '2026-08-11', status: 'source_claim_brief_complete_full_chapter_next', subject_id: 'film_tv',
    planned_unit_id: UNIT_ID,
    future_chapter_id: FUTURE_CHAPTER_ID,
    runtime_registration: { registered: false, allowed_before_full_chapter_gate: false },
    scope: {
      title: unit.title,
      primary_domain_ids: unit.primary_domain_ids,
      prerequisite_existing_chapter_ids: unit.prerequisite_existing_chapter_ids,
      emne_count: unit.emne_count,
      emne_ids: unit.emne_ids,
      overlap_boundary: unit.overlap_boundary
    },
    source_policy: {
      sources_are_inspectable_https: true,
      institutional_and_university_sources_prioritized: true,
      conceptual_claims_require_faglig_source: true,
      case_claims_require_work_specific_source: true,
      analysis_must_name_observable_form_before_interpretation: true,
      planned_claim_is_not_verified_claim: true,
      fulltext_requires_paragraph_level_claim_trace: true
    },
    sources: SOURCES,
    case_candidates: CASES,
    topic_briefs: topicBriefs,
    proposed_module_order: [
      { id: 'bilde-rom-og-bevegelse', sequence: 1, emne_ids: [unit.emne_ids[6], unit.emne_ids[9], unit.emne_ids[3], unit.emne_ids[0]], purpose: 'Fra komposisjon og ramme til optikk, bevegelse og animert tidsdannelse.' },
      { id: 'tid-lyd-og-atmosfaere', sequence: 2, emne_ids: [unit.emne_ids[2], unit.emne_ids[5], unit.emne_ids[1], unit.emne_ids[8]], purpose: 'Fra målbar organisering av tid og lyd til sammensatt atmosfære og suspense.' },
      { id: 'kropp-syntese-og-troverdighet', sequence: 3, emne_ids: [unit.emne_ids[7], unit.emne_ids[4]], purpose: 'Fra framført kropp og stemme til syntetiske bilder og konstruksjon av troverdighet.' }
    ],
    production_requirements: {
      section_scope_is_derived_from_emne_ownership: true,
      expected_current_section_owner_count: unit.emne_count,
      paragraph_claim_trace_required: true,
      every_planned_claim_must_be_verified_rewritten_or_rejected: true,
      every_used_source_must_support_at_least_one_final_claim: true,
      case_comparison_must_distinguish_observation_source_fact_and_interpretation: true,
      chapter_registration_only_after_audit: true
    },
    next_gate: 'produce_full_chapter_claims_and_inspectable_sources_for_audiovisual_form'
  };

  const registry = structuredClone(read(P.registry));
  const status = structuredClone(currentStatus);
  const filmStatus = status.subjects.find((row) => row.id === 'film_tv');
  registry.version = '2.75.0';
  registry.updatedAt = '2026-08-11';
  registry.subjects.film_tv.canonicalModel.note = 'Film & TVs læringsrekkefølge dekker alle 192 canonicale emner. Første planenhet, Audiovisuell form og sansing, har nå en kilde- og claimbrief med 10 emner, 8 inspectable institusjonskilder, 7 dokumenterte case og 20 planlagte claimspor. Ingen planlagt claim er merket verifisert, og kapitlet er ikke registrert. Neste port er fulltekstproduksjon med avsnittsnivå claimtrace og ny audit før runtime-registrering.';
  status.version = '1.63.0';
  status.updatedAt = '2026-08-11';
  filmStatus.nextGate = 'audiovisual_form_source_brief_complete_full_chapter_production';
  filmStatus.note = 'Kilde- og claimbriefen for Audiovisuell form og sansing er komplett: 10 canonicale emner, 8 inspectable institusjonskilder, 7 verkcase og 20 eksplisitte planlagte claimspor. Planlagte claims er ikke verifiserte claims, og kapitlet er fortsatt uregistrert. Neste port er fulltekst, claims, kildebruk og avsnittsnivå trace før kapittel- og runtime-registrering.';
  registry.subjects.film_tv.canonicalModel.firstSourceClaimBrief = P.brief;

  const plannedClaims = topicBriefs.flatMap((topic) => topic.planned_claims);
  const usedSourceIds = new Set([...topicBriefs.flatMap((topic) => topic.source_ids), ...CASES.flatMap((row) => row.source_ids)]);
  const report = {
    schema: 'history_go_film_tv_audiovisual_form_source_brief_v1_audit',
    version: '1.0.0', updated_at: '2026-08-11', status: 'source_claim_brief_complete_full_chapter_next', subject_id: 'film_tv',
    summary: { emne_count: unit.emne_count, source_count: SOURCES.length, case_count: CASES.length, planned_claim_count: plannedClaims.length, proposed_module_count: brief.proposed_module_order.length, registered_chapter_count_delta: 0 },
    coverage: topicBriefs.map((topic) => ({ emne_id: topic.emne_id, method_count: topic.method_ids.length, source_count: topic.source_ids.length, case_count: topic.case_ids.length, planned_claim_count: topic.planned_claims.length })),
    gates: {
      first_learning_order_unit_selected: plan.first_production_candidate.planned_unit_id === UNIT_ID,
      exact_ten_of_ten_emne_coverage: topicBriefs.length === unit.emne_count && new Set(topicBriefs.map((row) => row.emne_id)).size === unit.emne_count && unit.emne_ids.every((id) => topicBriefs.some((row) => row.emne_id === id)),
      all_emners_active_canonical: topicBriefs.every((row) => emneById.has(row.emne_id)),
      all_methods_resolve: topicBriefs.every((row) => row.method_ids.every((id) => methodIds.has(id))),
      eight_inspectable_https_sources: SOURCES.length === 8 && SOURCES.every((row) => row.url.startsWith('https://') && row.retrieval_status === 'verified_2026-08-11'),
      every_source_used: SOURCES.every((row) => usedSourceIds.has(row.id)),
      every_source_reference_resolves: [...usedSourceIds].every((id) => sourceIds.has(id)),
      seven_documented_cases: CASES.length === 7 && CASES.every((row) => row.source_ids.length && row.source_ids.every((id) => sourceIds.has(id))),
      every_case_reference_resolves: topicBriefs.every((row) => row.case_ids.every((id) => caseIds.has(id))),
      exactly_two_planned_claims_per_emne: topicBriefs.every((row) => row.planned_claims.length === 2),
      no_planned_claim_overstated_as_verified: plannedClaims.every((row) => row.status === 'planned_requires_fulltext_verification'),
      all_planned_claim_ids_unique: new Set(plannedClaims.map((row) => row.id)).size === plannedClaims.length,
      all_topics_have_boundaries_sources_cases_and_methods: topicBriefs.every((row) => row.canonical_boundary && row.source_ids.length >= 2 && row.case_ids.length >= 1 && row.method_ids.length >= 1),
      module_order_covers_every_emne_once: brief.proposed_module_order.flatMap((row) => row.emne_ids).length === unit.emne_count && new Set(brief.proposed_module_order.flatMap((row) => row.emne_ids)).size === unit.emne_count,
      chapter_remains_unregistered: !registry.subjects.film_tv.chapters.some((row) => row.id === FUTURE_CHAPTER_ID),
      registration_waits_for_fulltext_claim_source_audit: !brief.runtime_registration.registered && !brief.runtime_registration.allowed_before_full_chapter_gate && brief.production_requirements.chapter_registration_only_after_audit
    },
    next_gate: brief.next_gate
  };
  return { brief, report, registry, status, unit, topicBriefs, plannedClaims };
}

export function auditFilmTvAudiovisualFormSourceBriefV1({ writeFiles = false, checkFiles = true } = {}) {
  const currentStatus = read(P.status);
  const currentGate = currentStatus.subjects.find((row) => row.id === 'film_tv')?.nextGate;
  if (['audiovisual_form_full_chapter_complete_next_unit_source_brief', 'narrative_viewpoint_genre_source_brief_complete_full_chapter_production', 'narrative_viewpoint_genre_full_chapter_complete_next_unit_source_brief', 'seriality_format_adaptation_source_brief_complete_full_chapter_production', 'seriality_format_adaptation_full_chapter_complete_next_unit_source_brief'].includes(currentGate)) {
    const brief = read(P.brief);
    const report = read(P.report);
    const registry = read(P.registry);
    const plan = read(P.plan);
    const unit = plan.planned_units.find((row) => row.id === UNIT_ID);
    const topicBriefs = brief.topic_briefs;
    const plannedClaims = topicBriefs.flatMap((topic) => topic.planned_claims);
    assert(brief.status === 'source_claim_brief_consumed_by_verified_chapter', 'Kildebriefen skal være konsumert etter fulltekstporten');
    assert(brief.runtime_registration.registered === true && brief.runtime_registration.chapter_id === FUTURE_CHAPTER_ID, 'Kildebriefen mangler etterfølgende kapittelregistrering');
    assert(plannedClaims.length === 20 && plannedClaims.every((row) => row.status === 'resolved_to_verified_claim' && row.final_claim_id === row.id), 'Kildebriefens claimplaner er ikke løst');
    assert(registry.subjects.film_tv.chapters.some((row) => row.id === FUTURE_CHAPTER_ID), 'Det verifiserte kapitlet mangler i registeret');
    assert(report.status === 'source_claim_brief_consumed_by_verified_chapter' && Object.values(report.gates).every(Boolean), 'Kildebriefens etteraudit er ikke grønn');
    return { brief, report, registry, status: currentStatus, unit, topicBriefs, plannedClaims };
  }
  const built = buildFilmTvAudiovisualFormSourceBriefV1();
  const outputs = { [P.brief]: built.brief, [P.report]: built.report, [P.registry]: built.registry, [P.status]: built.status };
  if (writeFiles) for (const [file, value] of Object.entries(outputs)) write(file, value);
  if (checkFiles) for (const [file, value] of Object.entries(outputs)) assert(isDeepStrictEqual(read(file), value), `${file} er utdatert`);
  assert(Object.values(built.report.gates).every(Boolean), 'Minst én kildebriefport feiler');
  return built;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const result = auditFilmTvAudiovisualFormSourceBriefV1({ writeFiles: args.has('--write'), checkFiles: !args.has('--write') && !args.has('--no-check') });
    console.log(`Film & TV kildebrief OK: ${result.topicBriefs.length} emner, ${result.brief.sources.length} kilder, ${result.brief.case_candidates.length} case og ${result.plannedClaims.length} claimspor; status ${result.brief.status}.`);
  } catch (error) {
    console.error(`Film & TV kildebrief FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
