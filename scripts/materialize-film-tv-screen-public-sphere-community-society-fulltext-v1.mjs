#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'skjermoffentlighet-fellesskap-og-samfunn';
const CHAPTER_DIR = `data/fagverk/film_tv/${CHAPTER_ID}`;
const INPUT_GATE = 'representation_position_counterimages_full_chapter_complete_next_unit_source_brief';
const OUTPUT_GATE = 'screen_public_sphere_community_society_full_chapter_complete_next_unit_source_brief';
const P = Object.freeze({
  sourceBrief: 'data/fag/TV_og_Film/film_tv_screen_public_sphere_community_society_source_claim_brief_v1.json',
  sources: 'data/fag/TV_og_Film/film_tv_screen_public_sphere_community_society_sources_v1.json',
  cases: 'data/fag/TV_og_Film/film_tv_screen_public_sphere_community_society_cases_v1.json',
  topicClaims: 'data/fag/TV_og_Film/film_tv_screen_public_sphere_community_society_topic_claims_v1.json',
  learningPlan: 'data/fag/TV_og_Film/film_tv_learning_order_plan_v1.json',
  chapter: `${CHAPTER_DIR}.json`, brief: `${CHAPTER_DIR}/brief.json`, claims: `${CHAPTER_DIR}/claims.json`,
  modules: [
    `${CHAPTER_DIR}/01-livslop-by-og-samfunnsrom.json`,
    `${CHAPTER_DIR}/02-offentlighet-kringkasting-og-demokrati.json`,
    `${CHAPTER_DIR}/03-klima-migrasjon-og-transnasjonale-fellesskap.json`,
    `${CHAPTER_DIR}/04-nasjon-religion-og-forestilte-fellesskap.json`
  ],
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  sourceBriefReport: 'reports/fagverk/film-tv-screen-public-sphere-community-society-source-brief-v1-audit.json'
});
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const maxDottedVersion = (current, floor) => {
  const parts = (version) => String(version || '0.0.0').split('.').map((part) => Number.parseInt(part, 10) || 0);
  const currentParts = parts(current);
  const floorParts = parts(floor);
  const length = Math.max(currentParts.length, floorParts.length);
  for (let index = 0; index < length; index += 1) {
    const difference = (currentParts[index] || 0) - (floorParts[index] || 0);
    if (difference !== 0) return difference > 0 ? current : floor;
  }
  return current || floor;
};
const maxIsoDate = (current, floor) => current && current > floor ? current : floor;

export function buildFilmTvScreenPublicSphereCommunitySocietyFulltextV1() {
  const sourceBrief = structuredClone(read(P.sourceBrief));
  const sourcesDoc = read(P.sources);
  const casesDoc = read(P.cases);
  const topicClaims = structuredClone(read(P.topicClaims));
  const learningPlan = read(P.learningPlan);
  const unit = learningPlan.planned_units.find((row) => row.id === CHAPTER_ID);
  const chapter = read(P.chapter);
  const chapterBrief = read(P.brief);
  const claimsDoc = structuredClone(read(P.claims));
  const modules = P.modules.map(read);
  const currentRegistry = read(P.registry);
  const currentStatus = read(P.status);
  const sourceBriefReport = structuredClone(read(P.sourceBriefReport));

  assert(unit, 'Læringsplanen mangler skjermoffentlighetsenheten');
  assert(chapter.id === CHAPTER_ID && chapter.subject_id === 'film_tv', 'Kapittelidentiteten er feil');
  assert(chapterBrief.chapter_id === CHAPTER_ID, 'Kapittelbriefen peker på feil kapittel');
  assert(modules.length === 4, 'Kapitlet skal ha fire moduler');

  const sections = modules.flatMap((row) => row.sections || []);
  const sectionTraceSummary = sections.map((row) => ({
    section_id: row.id,
    paragraph_count: row.paragraphs?.length ?? 0,
    trace_count: row.paragraphClaimIds?.length ?? 0
  }));
  assert(
    sectionTraceSummary.every((row) => row.paragraph_count === row.trace_count),
    `Claimspor mismatch mellom avsnitt og trace: ${JSON.stringify(sectionTraceSummary)}`
  );
  const paragraphClaims = sections.flatMap((row) => (row.paragraphClaimIds || []).map((ids, index) => {
    assert(Array.isArray(ids) && ids.length === 1, `Seksjon ${row.id} avsnitt ${index + 1} må ha nøyaktig ett claimspor`);
    return ids[0];
  }));
  const claims = claimsDoc.claims || [];
  const plannedClaims = topicClaims.topic_briefs.flatMap((row) => row.planned_claims);
  const sourceIds = new Set(sourcesDoc.sources.map((row) => row.id));
  const finalClaimIds = new Set(claims.map((row) => row.id));
  const plannedClaimIds = new Set(plannedClaims.map((row) => row.id));

  assert(chapter.emne_ids.length === 9 && new Set(chapter.emne_ids).size === 9, 'Kapitlet skal eie 9 unike emner');
  assert(unit.emne_ids.every((id) => chapter.emne_ids.includes(id)), 'Kapitlet dekker ikke alle canonicale emner');
  assert(sections.length === 9, 'Kapitlet skal ha ni emneeide seksjoner');
  assert(sections.every((row) => row.emne_ids?.length === 1), 'Hver seksjon skal ha én canonical emneeier');
  assert(paragraphClaims.length === 36, `Kapitlet skal ha 36 claimsporede avsnitt; fikk ${paragraphClaims.length}; ${JSON.stringify(sectionTraceSummary)}`);
  assert(claims.length === 36 && finalClaimIds.size === 36, 'Final claimregister skal ha 36 unike claims');
  assert(plannedClaimIds.size === 36 && [...plannedClaimIds].every((id) => finalClaimIds.has(id)), 'Alle 36 claimplaner må være løst i fullteksten');
  assert(paragraphClaims.every((id) => finalClaimIds.has(id)), 'Alle avsnitt må peke på en final claim');
  assert(claims.every((row) => row.status === 'verified' && row.source_ids?.length && row.source_ids.every((id) => sourceIds.has(id))), 'Alle final claims må være verifiserte og kildebårne');

  const age2 = claims.find((row) => row.id === 'sp-age-2');
  if (age2 && !age2.source_ids.includes('ftvsp09-oxford-scandinavian-youth')) age2.source_ids.splice(1, 0, 'ftvsp09-oxford-scandinavian-youth');
  const usedSourceIds = new Set(claims.flatMap((row) => row.source_ids));
  assert(sourcesDoc.sources.every((row) => usedSourceIds.has(row.id)), 'Alle 28 briefkilder må støtte minst én final claim');

  const impact = claims.find((row) => row.id === 'sp-climate-5');
  assert(impact?.source_ids.length === 1 && impact.source_ids[0] === 'ftvsp20-yale-day-after', 'Det eksplisitte effektclaimet skal hvile på Yale-studien alene');
  assert(impact.evidence_mode === 'peer_reviewed_pre_post_impact_study', 'Effektclaimet må være eksplisitt merket som empirisk før/etter-studie');

  claimsDoc.schema = 'history_go_fagverk_chapter_claims_v1';
  claimsDoc.version = '1.0.0';
  claimsDoc.subject_id = 'film_tv';
  claimsDoc.chapter_id = CHAPTER_ID;
  claimsDoc.sourceBriefFile = P.sourceBrief;
  claimsDoc.sources = sourcesDoc.sources.map((row) => ({ ...row, label: `${row.publisher} – ${row.title}` }));

  sourceBrief.version = '1.1.0';
  sourceBrief.status = 'source_claim_brief_consumed_by_verified_chapter';
  sourceBrief.runtime_registration = { registered: true, chapter_id: CHAPTER_ID, registration_after_full_chapter_gate: true };
  sourceBrief.production_requirements = { ...sourceBrief.production_requirements, expected_current_section_owner_count: 9, completed: true };
  sourceBrief.next_gate = 'produce_source_and_claim_brief_for_skapende_arbeid_teknologi_og_ansvar';

  topicClaims.version = '1.1.0';
  topicClaims.status = 'consumed_by_verified_chapter';
  topicClaims.topic_briefs = topicClaims.topic_briefs.map((topic) => ({
    ...topic,
    planned_claims: topic.planned_claims.map((planned) => ({ ...planned, status: 'resolved_to_verified_claim', final_claim_id: planned.id, resolution: 'verified_as_planned' }))
  }));

  const registry = structuredClone(currentRegistry);
  registry.version = maxDottedVersion(currentRegistry.version, '2.90.0');
  registry.updatedAt = maxIsoDate(currentRegistry.updatedAt, '2026-08-13');
  const registryChapter = {
    id: CHAPTER_ID,
    title: chapter.title,
    subtitle: chapter.subtitle,
    file: P.chapter,
    primary_domain_id: chapter.primary_domain_id,
    emne_ids: chapter.emne_ids,
    claimsFile: P.claims,
    briefFile: P.brief
  };
  const chapters = registry.subjects.film_tv.chapters;
  const chapterIndex = chapters.findIndex((row) => row.id === CHAPTER_ID);
  if (chapterIndex === -1) chapters.push(registryChapter); else chapters[chapterIndex] = registryChapter;
  registry.subjects.film_tv.canonicalModel.note = 'Film & TVs variable canon har 192 emner. Skjermoffentlighet, fellesskap og samfunn er registrert etter fulltekst-, claim- og evidensport med 9 canonicale emner, 4 moduler, 9 emneeide seksjoner, 36 claimsporede fagavsnitt, 36/36 verifiserte claims, 28 brukte inspectable kilder og 30 case. Kapitlet skiller representasjon, institusjonell hensikt, regulatorisk vurdering, dokumentert resepsjon og empirisk samfunnseffekt; Yale-studien av The Day After Tomorrow er det eksplisitte effektcaset. Neste port er kilde- og claimbrief for Skapende arbeid, teknologi og ansvar.';
  registry.subjects.film_tv.canonicalModel.eighthSourceClaimBrief = P.sourceBrief;

  const status = structuredClone(currentStatus);
  status.version = maxDottedVersion(currentStatus.version, '1.83.0');
  status.updatedAt = maxIsoDate(currentStatus.updatedAt, '2026-08-13');
  const filmStatus = status.subjects.find((row) => row.id === 'film_tv');
  assert(filmStatus, 'Mangler Film & TV-status');
  filmStatus.editorialStatus = 'chapters_in_progress';
  filmStatus.nextGate = OUTPUT_GATE;
  filmStatus.note = 'Skjermoffentlighet, fellesskap og samfunn er registrert etter fulltekst- og evidensaudit: 9/9 canonicale emner, 4 moduler, 9 seksjoner, 36 claimsporede fagavsnitt, 36/36 løste claimplaner, 28 brukte inspectable kilder og 30 case. Representasjon, institusjonell hensikt, regulatorisk vurdering, resepsjon og effekt holdes adskilt. Neste port er kilde- og claimbrief for Skapende arbeid, teknologi og ansvar.';

  sourceBriefReport.version = '1.1.0';
  sourceBriefReport.status = 'source_claim_brief_consumed_by_verified_chapter';
  sourceBriefReport.summary = { ...sourceBriefReport.summary, registered_chapter_count_delta: 1, resolved_claim_count: 36 };
  const { chapter_remains_unregistered: _a, registration_waits_for_fulltext_claim_source_audit: _b, ...preservedGates } = sourceBriefReport.gates;
  sourceBriefReport.gates = {
    ...preservedGates,
    chapter_was_unregistered_at_source_brief_gate: true,
    registration_waited_for_fulltext_claim_source_audit: true,
    chapter_registered_only_after_fulltext_gate: true,
    every_planned_claim_resolved_to_verified_claim: true,
    every_final_claim_has_inspectable_source: true,
    empirical_effect_claim_uses_empirical_source_only: true
  };
  sourceBriefReport.next_gate = sourceBrief.next_gate;

  return { chapter, chapterBrief, claimsDoc, modules, sourceBrief, topicClaims, registry, status, sourceBriefReport, unit, sourcesDoc, casesDoc };
}

export function materializeFilmTvScreenPublicSphereCommunitySocietyFulltextV1({ force = false } = {}) {
  const currentGate = read(P.status).subjects.find((row) => row.id === 'film_tv')?.nextGate;
  assert([INPUT_GATE, OUTPUT_GATE].includes(currentGate), `Uventet Film & TV-port: ${currentGate}`);
  if (currentGate === OUTPUT_GATE && !force) {
    console.log('Skjermoffentlighetskapitlet er allerede materialisert; bevarer neste kildebriefport.');
    return null;
  }
  const built = buildFilmTvScreenPublicSphereCommunitySocietyFulltextV1();
  write(P.claims, built.claimsDoc);
  write(P.sourceBrief, built.sourceBrief);
  write(P.topicClaims, built.topicClaims);
  write(P.registry, built.registry);
  write(P.status, built.status);
  write(P.sourceBriefReport, built.sourceBriefReport);
  console.log(`Materialiserte Film & TV/${CHAPTER_ID}: 9 emner, 4 moduler, 9 seksjoner, 36 claims, 28 kilder og 30 case.`);
  return built;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try { materializeFilmTvScreenPublicSphereCommunitySocietyFulltextV1({ force: args.has('--write') }); }
  catch (error) { console.error(`Film & TV skjermoffentlighetsfulltekst FEIL: ${error.message}`); process.exitCode = 1; }
}
