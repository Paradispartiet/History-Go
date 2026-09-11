#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROUND_FILE = 'data/fagverk/musikk/maintenance/source-refresh-place-case-expansion-round1-2026-09-11.json';
const STATUS_FILE = 'data/fagverk/subject_status.json';
const COMPLETE_REPORT = 'reports/fagverk/musikk-subject-audit.json';
const MUSIKK_ROOT = 'data/fagverk/musikk';
const EXPECTED_BASELINE = 'a44325b76bae8734ab12d3428c2dea7e938841bd';

const TARGET_CHAPTERS = new Set([
  'musikalsk-analyse-lyd-struktur',
  'historisk-musikkvitenskap-historiografi',
  'etnomusikologi-kultur-samfunn',
  'framforing-praksis-samspill',
  'lydmedier-teknologi-beregning',
  'persepsjon-kognisjon-akustikk',
  'institusjoner-okonomi-politikk-offentlighet',
  'norsk-nordisk-samisk-sted-arkiv'
]);

const REQUIRED_PLACE_FILES = new Map([
  ['blaa', 'data/places/musikk/oslo/places_musikk/blaa.json'],
  ['bla_skilt_robert_levin_gabels_gate_46b', 'data/places/musikk/oslo/bla_skilt/bla_skilt_robert_levin_gabels_gate_46b.json'],
  ['chateau_neuf', 'data/places/scenekunst/oslo/chateau_neuf.json'],
  ['john_dee', 'data/places/musikk/oslo/places_musikk/john_dee.json'],
  ['nrk_huset_marienlyst', 'data/places/media/oslo/places_oslo_media/nrk_huset_marienlyst.json'],
  ['sentrum_scene', 'data/places/musikk/oslo/places_musikk/sentrum_scene.json'],
  ['rockefeller', 'data/places/musikk/oslo/places_musikk/rockefeller.json'],
  ['salt', 'data/places/musikk/oslo/places_musikk/salt.json']
]);

const REQUIRED_GATES = [
  'all_sources_https',
  'all_sources_authoritative_or_institutional',
  'all_cases_source_bound',
  'all_cases_place_bound',
  'all_case_places_canonical',
  'all_case_places_existing_before_round',
  'all_eight_chapters_reconciled',
  'claim_provenance_preserved',
  'theory_integrity_scope_unchanged',
  'canonical_subject_architecture_unchanged',
  'completion_status_preserved',
  'institutional_self_description_bounded',
  'place_metadata_not_sonic_evidence',
  'venue_specs_not_artistic_quality',
  'advertised_acoustics_not_listener_response',
  'historic_memorial_not_full_biography',
  'nordic_place_case_not_essentialist_identity_claim',
  'broadcast_metadata_not_unmediated_sound',
  'field_site_not_population_representativeness'
];

const abs = (value) => path.join(ROOT, value);
const readJson = (value) => JSON.parse(fs.readFileSync(abs(value), 'utf8'));
const text = (value) => String(value ?? '').trim();
const assert = (ok, message) => { if (!ok) throw new Error(message); };

export function auditMusikkSourceRefreshPlaceCaseExpansion() {
  const doc = readJson(ROUND_FILE);
  const status = readJson(STATUS_FILE);
  const complete = readJson(COMPLETE_REPORT);

  assert(doc.schema === 'history_go_musikk_maintenance_round_v1', 'Musikk maintenance bruker feil schema');
  assert(doc.subject_id === 'musikk', 'Musikk maintenance bruker feil subject_id');
  assert(doc.round_id === 'source_refresh_and_place_case_expansion_round1_2026_09_11', 'Musikk maintenance har uventet round_id');
  assert(doc.baseline_main_sha === EXPECTED_BASELINE, 'Musikk maintenance er ikke bundet til eksakt main-baseline');
  assert(doc.checked_at === '2026-09-11' && doc.status === 'verified', 'Musikk maintenance er ikke datert og verifisert');
  assert(doc.scope?.new_strict_subcategory === false, 'Musikk maintenance skal ikke opprette ny strict-underkategori');
  assert(doc.scope?.place_production === false, 'Musikk maintenance skal ikke være stedsproduksjon');
  assert(doc.scope?.canonical_architecture_change === false, 'Musikk maintenance skal ikke endre canonical fagarkitektur');
  assert(doc.scope?.chapter_prose_rewrite === false, 'Musikk maintenance skal ikke omskrive kapittelprosa');
  assert(doc.scope?.maintenance_evidence_only === true, 'Musikk maintenance skal være evidence-only vedlikehold');

  const musikkStatus = (status.subjects || []).find((row) => row.id === 'musikk');
  assert(musikkStatus?.navigationStatus === 'materialized', 'Musikk skal fortsatt være materialized');
  assert(musikkStatus?.assessmentStatus === 'audited', 'Musikk skal fortsatt være audited');
  assert(musikkStatus?.editorialStatus === 'complete', 'Musikk completion-status skal bevares');
  assert(musikkStatus?.nextGate === 'maintenance_source_refresh_and_place_case_expansion', 'Musikk maintenance-porten skal bevares');

  assert(complete.schema === 'history_go_fagverk_musikk_subject_audit_v1', 'Musikk subject-audit har feil schema');
  assert(complete.status === 'complete', 'Musikk subject-audit er ikke complete');
  assert(complete.summary?.domainCount === 8, 'Musikk complete-baseline skal ha 8 fagområder');
  assert(complete.summary?.chapterCount === 8, 'Musikk complete-baseline skal ha 8 kapitler');
  assert(complete.summary?.emneCount === 48, 'Musikk complete-baseline skal ha 48 emner');
  assert(complete.summary?.methodCount === 18, 'Musikk complete-baseline skal ha 18 metoder');
  assert(complete.summary?.chapterClaimCount === 55, 'Musikk complete-baseline skal ha 55 claims');
  assert(complete.summary?.chapterSourceCount === 67, 'Musikk complete-baseline skal ha 67 kapittelkilder');
  assert(complete.summary?.chapterParagraphCount === 216, 'Musikk complete-baseline skal ha 216 fagavsnitt');
  assert(complete.summary?.placeCount === 0, 'Musikk maintenance forventer baseline på 0 registrerte Fagverk-stedscase');

  const canonicalChapterIds = new Set((complete.chapterAudits || []).map((row) => row.chapterId));
  assert(canonicalChapterIds.size === 8, 'Musikk subject-audit skal deklarere 8 canonicale kapittel-ID-er');
  const declaredTargets = new Set(doc.target_chapters || []);
  assert(declaredTargets.size === 8, 'Musikk maintenance skal deklarere nøyaktig åtte målkapitler');
  for (const chapterId of TARGET_CHAPTERS) {
    assert(declaredTargets.has(chapterId), `Mangler Musikk maintenance-målkapittel ${chapterId}`);
    assert(canonicalChapterIds.has(chapterId), `${chapterId}: er ikke canonicalt Musikk-kapittel`);
    assert(fs.existsSync(abs(`${MUSIKK_ROOT}/${chapterId}.json`)), `${chapterId}: mangler canonical kapittelfil`);
  }
  for (const chapterId of canonicalChapterIds) assert(declaredTargets.has(chapterId), `Musikk maintenance mangler canonicalt kapittel ${chapterId}`);

  const refreshes = doc.source_refresh || [];
  const cases = doc.cases || [];
  assert(refreshes.length === 16, 'Musikk maintenance skal ha nøyaktig 16 kildekontroller');
  assert(cases.length === 8, 'Musikk maintenance skal ha nøyaktig 8 nye case');

  const refreshById = new Map();
  const publishers = new Set();
  const sourcesPerChapter = new Map();
  for (const source of refreshes) {
    assert(text(source.id) && !refreshById.has(source.id), `Duplisert eller tom Musikk-kilde-ID: ${source.id}`);
    refreshById.set(source.id, source);
    publishers.add(text(source.publisher));
    assert(/^https:\/\//.test(text(source.url)), `${source.id}: URL skal bruke https`);
    assert(text(source.publisher).length >= 3, `${source.id}: mangler publisher`);
    assert(text(source.source_location).length >= 120, `${source.id}: source_location er for svak`);
    assert(source.health === 'verified_live', `${source.id}: source health er ikke verified_live`);
    assert(text(source.authority).length >= 8, `${source.id}: authority mangler`);
    assert(Array.isArray(source.chapter_ids) && source.chapter_ids.length === 1, `${source.id}: skal bindes til nøyaktig ett kapittel`);
    const chapterId = source.chapter_ids[0];
    assert(TARGET_CHAPTERS.has(chapterId), `${source.id}: ukjent chapter binding ${chapterId}`);
    sourcesPerChapter.set(chapterId, (sourcesPerChapter.get(chapterId) || 0) + 1);
  }
  assert(publishers.size >= 10, 'Musikk maintenance skal ha minst ti tydelige utgiveridentiteter');
  for (const chapterId of TARGET_CHAPTERS) assert(sourcesPerChapter.get(chapterId) === 2, `${chapterId}: skal ha nøyaktig to kildeoppfriskninger`);

  const caseIds = new Set();
  const usedSources = new Set();
  const usedPlaces = new Set();
  const usedChapters = new Set();

  for (const item of cases) {
    assert(text(item.id) && !caseIds.has(item.id), `Duplisert eller tom Musikk-case-ID: ${item.id}`);
    caseIds.add(item.id);
    assert(text(item.title).length >= 25, `${item.id}: tittel er for svak`);
    assert(text(item.case_claim).length >= 400, `${item.id}: case_claim er for kort`);
    assert(TARGET_CHAPTERS.has(item.chapter_id), `${item.id}: ukjent målkapittel ${item.chapter_id}`);
    assert(!usedChapters.has(item.chapter_id), `${item.id}: flere case bruker samme kapittel ${item.chapter_id}`);
    usedChapters.add(item.chapter_id);

    assert(Array.isArray(item.source_ids) && item.source_ids.length === 2, `${item.id}: caset skal bruke nøyaktig to kilder`);
    for (const sourceId of item.source_ids) {
      const source = refreshById.get(sourceId);
      assert(source, `${item.id}: ukjent source ${sourceId}`);
      assert(source.chapter_ids[0] === item.chapter_id, `${item.id}: source ${sourceId} er bundet til feil kapittel`);
      usedSources.add(sourceId);
    }

    assert(text(item.place_id) && !usedPlaces.has(item.place_id), `${item.id}: tom eller gjenbrukt place_id ${item.place_id}`);
    const expectedPlaceFile = REQUIRED_PLACE_FILES.get(item.place_id);
    assert(expectedPlaceFile, `${item.id}: uventet place_id ${item.place_id}`);
    assert(item.place_file === expectedPlaceFile, `${item.id}: place_file avviker fra låst canonical path`);
    assert(fs.existsSync(abs(expectedPlaceFile)), `${item.id}: canonical place-fil mangler`);
    const place = readJson(expectedPlaceFile);
    assert(place.id === item.place_id && text(place.name), `${item.id}: canonical place-identitet er ugyldig`);
    usedPlaces.add(item.place_id);

    assert(Array.isArray(item.analysis_questions) && item.analysis_questions.length === 3, `${item.id}: caset skal ha nøyaktig tre analysespørsmål`);
    assert(item.analysis_questions.every((question) => text(question).length >= 120), `${item.id}: analysespørsmålene er for svake`);
    assert(Array.isArray(item.inference_boundaries) && item.inference_boundaries.length === 3, `${item.id}: caset skal ha nøyaktig tre slutningsgrenser`);
    assert(item.inference_boundaries.every((boundary) => text(boundary).length >= 100), `${item.id}: slutningsgrensene er for svake`);
  }

  assert(usedChapters.size === 8, 'Musikk maintenance skal dekke alle åtte kapitler nøyaktig én gang');
  for (const chapterId of TARGET_CHAPTERS) assert(usedChapters.has(chapterId), `Musikk maintenance mangler ${chapterId}`);
  assert(usedSources.size === 16, 'Alle 16 Musikk-kilder skal brukes av nøyaktig ett casepar');
  assert(usedPlaces.size === 8, 'Musikk maintenance skal legge til nøyaktig åtte unike eksisterende steder');
  for (const placeId of REQUIRED_PLACE_FILES.keys()) assert(usedPlaces.has(placeId), `Musikk maintenance mangler obligatorisk sted ${placeId}`);

  const gates = doc.quality_gates || {};
  for (const gate of REQUIRED_GATES) assert(gates[gate] === true, `Musikk maintenance mangler grønn kvalitetsport: ${gate}`);

  return {
    schema: 'history_go_musikk_maintenance_audit_v1',
    version: '1.0.0',
    status: 'passed',
    round: 1,
    round_id: doc.round_id,
    baseline_main_sha: doc.baseline_main_sha,
    source_refresh_count: refreshes.length,
    publisher_count: publishers.size,
    case_count: cases.length,
    chapter_count: usedChapters.size,
    canonical_chapter_count: canonicalChapterIds.size,
    baseline_unique_place_count: 0,
    new_unique_place_count: usedPlaces.size,
    projected_unique_place_count: usedPlaces.size,
    gates: {
      source_health: true,
      canonical_chapter_identity: true,
      canonical_place_identity: true,
      full_8_of_8_chapter_reconciliation: true,
      existing_place_only: true,
      case_source_trace: true,
      claim_provenance_preserved: true,
      theory_integrity_scope_unchanged: true,
      subject_architecture_unchanged: true,
      completion_status_preserved: true,
      inference_boundaries_explicit: true,
      no_strict_subcategory: true,
      no_place_production: true,
      no_chapter_prose_rewrite: true
    }
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.stdout.write(`${JSON.stringify(auditMusikkSourceRefreshPlaceCaseExpansion(), null, 2)}\n`);
}
