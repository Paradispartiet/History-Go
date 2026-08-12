#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'audiovisuell-form-og-sansing';
const P = Object.freeze({
  chapter: `data/fagverk/film_tv/${CHAPTER_ID}.json`,
  brief: `data/fagverk/film_tv/${CHAPTER_ID}/brief.json`,
  claims: `data/fagverk/film_tv/${CHAPTER_ID}/claims.json`,
  sourceBrief: 'data/fag/TV_og_Film/film_tv_audiovisual_form_source_claim_brief_v1.json',
  learningPlan: 'data/fag/TV_og_Film/film_tv_learning_order_plan_v1.json',
  emners: 'data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json',
  methods: 'data/fag/TV_og_Film/methods_film_tv_canonical_v4_5.json',
  places: 'data/places/places_index.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  report: 'reports/fagverk/film-tv-audiovisual-form-fulltext-v1-audit.json'
});
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const committedProjection = (report) => ({
  schema: report.schema, version: report.version, status: report.status, generatedFrom: report.generatedFrom,
  subject: report.subject, chapter: report.chapter, canonicalCoverage: report.canonicalCoverage,
  claimPlanResolution: report.claimPlanResolution, summary: report.summary, gates: report.gates, nextGate: report.nextGate
});

export function auditFilmTvAudiovisualFormFulltextV1({ writeReport = false, checkReport = true } = {}) {
  const chapter = read(P.chapter);
  const brief = read(P.brief);
  const claimsDoc = read(P.claims);
  const sourceBrief = read(P.sourceBrief);
  const plan = read(P.learningPlan);
  const emners = read(P.emners);
  const methodsDoc = read(P.methods);
  const registry = read(P.registry);
  const status = read(P.status);
  const places = read(P.places);
  const unit = plan.planned_units.find((row) => row.id === CHAPTER_ID);
  const statusEntry = status.subjects.find((row) => row.id === 'film_tv');
  const registryChapter = registry.subjects.film_tv.chapters.find((row) => row.id === CHAPTER_ID);
  const modules = chapter.moduleFiles.map((file) => ({ file, value: read(file) }));
  const sections = modules.flatMap((row) => row.value.sections || []);
  const paragraphClaimIds = sections.flatMap((row) => row.paragraphClaimIds || []).flat();
  const keyPointClaimIds = sections.flatMap((row) => row.keyPointClaimIds || []).flat();
  const plannedClaims = sourceBrief.topic_briefs.flatMap((row) => row.planned_claims);
  const canonicalEmneIds = new Set(emners.map((row) => row.emne_id));
  const canonicalMethodIds = new Set((Array.isArray(methodsDoc) ? methodsDoc : methodsDoc.methods).map((row) => row.method_id || row.id));
  const sourceIds = new Set(claimsDoc.sources.map((row) => row.id));
  const claimIds = new Set(claimsDoc.claims.map((row) => row.id));
  const sectionIds = new Set(sections.map((row) => row.id));
  const usedSourceIds = new Set(claimsDoc.claims.flatMap((row) => row.source_ids));
  const plannedClaimIds = new Set(plannedClaims.map((row) => row.id));

  assert(chapter.schema === 'history_go_fagverk_chapter_v1' && chapter.subject_id === 'film_tv', 'Kapittelet har feil schema eller fag');
  assert(chapter.id === CHAPTER_ID && chapter.primary_domain_id === 'audiovisuell_form_stil_analyse', 'Kapittelet har feil ID eller eierdomene');
  assert(chapter.editorialStatus === 'chapter_ready' && chapter.claimTraceRequired === true && chapter.sourceFirst === true, 'Kapittelet er ikke fulltekstklart og source-first');
  assert(isDeepStrictEqual(chapter.emne_ids, unit.emne_ids) && chapter.emne_ids.length === 10, 'Kapittelet dekker ikke læringsenhetens 10 canonicale emner eksakt');
  assert(new Set(chapter.emne_ids).size === chapter.emne_ids.length && chapter.emne_ids.every((id) => canonicalEmneIds.has(id)), 'Kapittelet har dupliserte eller ukjente emner');
  assert(chapter.method_ids.length > 0 && chapter.method_ids.every((id) => canonicalMethodIds.has(id)), 'Kapittelet har uløst metode-ID');
  assert(chapter.relatedPlaces.length === 2 && chapter.workCases.length === 7, 'Kapittelet skal ha sju verkcase og to canonicale anvendelsessteder');
  assert(chapter.workCases.every((row) => row.id && row.title && row.year && row.role && row.source_ids.length), 'Et verkcase er ikke renderbart eller kildekoblet');
  const knownPlaceIds = new Set(places.map((row) => row.id));
  assert(chapter.relatedPlaces.every((row) => knownPlaceIds.has(row.id) && row.name && row.role), 'Et anvendelsessted er ukjent eller ikke renderbart');

  assert(brief.schema === 'history_go_fagverk_chapter_brief_v1' && brief.chapter_id === CHAPTER_ID, 'Kapittelbriefen er usynkronisert');
  assert(isDeepStrictEqual(brief.requiredEmneIds, chapter.emne_ids), 'Kapittelbriefen har feil emnedekning');
  assert(isDeepStrictEqual(brief.requiredMethodIds, chapter.method_ids), 'Kapittelbriefen har feil metodedekning');
  assert(isDeepStrictEqual(brief.relatedPlaceIds, chapter.relatedPlaces.map((row) => row.id)), 'Kapittelbriefen har feil anvendelsessteder');
  assert(brief.qa.sectionCountDerivedFromEmneOwnership === true && brief.qa.actualFulltextSections === 10 && brief.qa.paragraphCountsAreNotQuota === true, 'Briefen dokumenterer ikke naturlig seksjons- og avsnittsomfang');
  assert(brief.qa.paragraphClaimTraceRequired === true && brief.qa.plannedClaimResolution === '20/20', 'Briefens claimport er ikke fullført');

  assert(modules.length === 3 && sections.length === 10, 'Kapittelet skal ha tre progresjonsmoduler og ti emneeide seksjoner');
  assert(sections.every((row) => row.emne_ids.length === 1), 'Hver seksjon skal eie nøyaktig ett av denne enhetens emner');
  assert(isDeepStrictEqual(new Set(sections.flatMap((row) => row.emne_ids)), new Set(chapter.emne_ids)), 'Seksjonene dekker ikke alle emner nøyaktig én gang');
  assert(new Set(sections.map((row) => row.paragraphs.length)).size > 1, 'Avsnittstallet er blitt en skjult likhetskvote');
  assert(sections.every((row) => row.paragraphs.length >= 2 && row.paragraphClaimIds.length === row.paragraphs.length), 'Et fulltekstavsnitt mangler claimspor');
  assert(sections.every((row) => row.paragraphClaimIds.every((ids) => Array.isArray(ids) && ids.length === 1)), 'Et avsnitt mangler entydig claimspor');
  assert(sections.every((row) => row.keyPoints.length === 2 && row.keyPointClaimIds.length === 2), 'Nøkkelpunktene er ikke claimsporet');
  assert(modules[0].value.concepts.length === 6, 'Grunnlagsmodulen mangler begreper');
  assert(modules[1].value.workedExamples.length === 3 && modules[1].value.commonMisconceptions.length === 5, 'Fordypningsmodulen mangler eksempler eller misoppfatninger');
  assert(modules[1].value.workedExamples.every((row) => row.title && row.situation && Array.isArray(row.analysis) && row.analysis.length >= 2 && row.analysis.every(Boolean)), 'Et arbeidseksempel mangler renderbare analysesteg');
  assert(modules[2].value.applicationTasks.length === 5 && modules[2].value.selfCheck.length === 7, 'Anvendelsesmodulen mangler oppgaver eller selvkontroll');

  assert(claimsDoc.schema === 'history_go_fagverk_chapter_claims_v1' && claimsDoc.chapter_id === CHAPTER_ID, 'Claims-filen er usynkronisert');
  assert(claimsDoc.sources.length === 8 && sourceIds.size === 8, 'Kapittelet skal bruke åtte unike inspectable kilder');
  assert(claimsDoc.sources.every((row) => /^https:\/\//.test(row.url) && row.label && row.publisher && row.title && row.source_location && row.retrieval_status), 'En kilde er ikke inspectable eller renderbar');
  assert(claimsDoc.claims.length === 20 && claimIds.size === 20, 'Kapittelet skal ha 20 unike endelige claims');
  assert(isDeepStrictEqual(claimIds, plannedClaimIds), 'De endelige claim-ID-ene løser ikke nøyaktig briefens 20 claimplaner');
  assert(claimsDoc.claims.every((row) => row.claim_plan_id === row.id && row.status === 'verified' && ['verified_as_planned', 'verified_after_scope_rewrite', 'verified_after_case_narrowing'].includes(row.plan_resolution)), 'En claim mangler verifisert planoppløsning');
  assert(claimsDoc.claims.every((row) => row.source_ids.length && row.source_ids.every((id) => sourceIds.has(id))), 'En claim peker til ukjent kilde');
  assert(claimsDoc.claims.every((row) => row.used_in.length === 1 && row.used_in.every((id) => sectionIds.has(id))), 'En claim har ugyldig seksjonsspor');
  assert([...sourceIds].every((id) => usedSourceIds.has(id)), 'En registrert kilde brukes ikke av noen claim');
  assert(paragraphClaimIds.length === 23 && new Set(paragraphClaimIds).size === 20 && paragraphClaimIds.every((id) => claimIds.has(id)), 'Avsnittssporene dekker ikke alle claims i den variable teksten');
  assert(keyPointClaimIds.every((id) => claimIds.has(id)), 'Et nøkkelpunkt peker til ukjent claim');

  assert(sourceBrief.status === 'source_claim_brief_consumed_by_verified_chapter', 'Kildebriefen er ikke markert konsumert av verifisert kapittel');
  assert(sourceBrief.runtime_registration.registered === true && sourceBrief.runtime_registration.chapter_id === CHAPTER_ID, 'Kildebriefen dokumenterer ikke runtime-registreringen');
  assert(plannedClaims.every((row) => row.status === 'resolved_to_verified_claim' && row.final_claim_id === row.id && claimIds.has(row.id)), 'En claimplan er ikke løst til endelig claim');
  assert(registryChapter?.file === P.chapter && isDeepStrictEqual(registryChapter.emne_ids, chapter.emne_ids), 'Fagverkregisteret mangler eller feilregistrerer kapitlet');
  assert(statusEntry.editorialStatus === 'chapters_in_progress' && ['audiovisual_form_full_chapter_complete_next_unit_source_brief', 'narrative_viewpoint_genre_source_brief_complete_full_chapter_production', 'narrative_viewpoint_genre_full_chapter_complete_next_unit_source_brief', 'seriality_format_adaptation_source_brief_complete_full_chapter_production', 'seriality_format_adaptation_full_chapter_complete_next_unit_source_brief', 'film_history_movements_historiography_source_brief_complete_full_chapter_production', 'film_history_movements_historiography_full_chapter_complete_next_unit_source_brief', 'television_platforms_participation_source_brief_complete_full_chapter_production', 'television_platforms_participation_full_chapter_complete_next_unit_source_brief', 'documentary_evidence_ethics_source_brief_complete_full_chapter_production', 'documentary_evidence_ethics_full_chapter_complete_next_unit_source_brief', 'representation_position_counterimages_source_brief_complete_full_chapter_production'].includes(statusEntry.nextGate), 'Film & TV står ikke på neste kildebrief- eller fulltekstport');

  const combined = JSON.stringify({ chapter, brief, modules: modules.map((row) => row.value) });
  assert(/observasjon.{0,180}tolkning|tolkning.{0,180}observasjon/is.test(combined), 'Observasjon/tolkning-vakten mangler');
  assert(/mise-en-sc.ne.{0,180}kamera|kameraarbeid.{0,180}mise-en-sc.ne/is.test(combined), 'Mise-en-scène/kamera-vakten mangler');
  assert(/rytme.{0,220}(shotvarighet|bevegelse).{0,160}(musikk|stillhet)/is.test(combined), 'Flerlagsrytme-vakten mangler');
  assert(/diegetisk.{0,180}ikke-diegetisk|verkets verden.{0,180}utenfor/is.test(combined), 'Lydkilde-vakten mangler');
  assert(/atmosf.re.{0,220}(kombinasjon|samspill).{0,160}(lys|rom|lyd)/is.test(combined), 'Atmosfære-kombinasjonsvakten mangler');
  assert(/suspense.{0,220}(synlighet|kunnskap|rom|tid)/is.test(combined), 'Suspense-vakten mangler');
  assert(/framf.ring.{0,220}(kropp|stemme|blikk)/is.test(combined), 'Framføringsvakten mangler');
  assert(/syntetisk realisme.{0,220}(lys|perspektiv|bevegelse|tekstur)/is.test(combined), 'Syntetisk-realisme-vakten mangler');

  const report = {
    schema: 'history_go_film_tv_audiovisual_form_fulltext_v1_audit', version: '1.0.0',
    status: 'audiovisual_form_chapter_verified_registered', generatedFrom: P,
    subject: { id: 'film_tv', editorialStatus: statusEntry.editorialStatus, nextGate: statusEntry.nextGate, registeredChapterCount: registry.subjects.film_tv.chapters.length },
    chapter: { id: chapter.id, title: chapter.title, primaryDomainId: chapter.primary_domain_id, moduleFiles: chapter.moduleFiles, briefFile: chapter.briefFile, claimsFile: chapter.claimsFile },
    canonicalCoverage: { requiredEmneIds: unit.emne_ids, coveredEmneIds: chapter.emne_ids, exactCoverage: '10/10 canonical emner', sectionOwnership: '10 emner eid av 10 naturlig avgrensede seksjoner' },
    claimPlanResolution: { plannedClaimIds: [...plannedClaimIds], finalClaimIds: [...claimIds], exactResolution: '20/20', rewrittenClaimIds: claimsDoc.claims.filter((row) => row.plan_resolution !== 'verified_as_planned').map((row) => row.id) },
    summary: {
      moduleCount: modules.length, sectionCount: sections.length,
      paragraphCount: sections.reduce((sum, row) => sum + row.paragraphs.length, 0),
      conceptCount: modules[0].value.concepts.length, workedExampleCount: modules[1].value.workedExamples.length,
      misconceptionCount: modules[1].value.commonMisconceptions.length, applicationTaskCount: modules[2].value.applicationTasks.length,
      selfCheckCount: modules[2].value.selfCheck.length, methodCount: chapter.method_ids.length,
      sourceCount: claimsDoc.sources.length, claimCount: claimsDoc.claims.length, workCaseCount: chapter.workCases.length, placeCaseCount: chapter.relatedPlaces.length
    },
    gates: {
      exactCanonicalCoverage: true, oneSectionOwnerPerEmne: true, variableSectionCountDocumented: true, variableParagraphStructure: true,
      fulltextParagraphClaimTrace: true, everyClaimPlanResolved: true, allClaimsVerifiedAndUsed: true,
      allSourcesUsedAndInspectable: true, sourceFactObservationInterpretationSeparated: true,
      canonicalPlaceApplicationsResolved: true, sevenDocumentedWorkCases: true, methodsResolve: true,
      rendererFieldsPresent: true, sourceBriefConsumedAfterGate: true, registryAndRuntimeSynchronized: true,
      observationInterpretationGuard: true, miseCameraGuard: true, multiLayerRhythmGuard: true,
      soundSourceGuard: true, atmosphereCombinationGuard: true, suspenseKnowledgeGuard: true,
      performanceMediationGuard: true, syntheticRealismGuard: true, releaseReady: true
    },
    nextGate: 'produce_source_and_claim_brief_for_fortelling_synsvinkel_og_sjanger'
  };
  const committed = committedProjection(report);
  if (writeReport) {
    fs.mkdirSync(path.dirname(abs(P.report)), { recursive: true });
    fs.writeFileSync(abs(P.report), `${JSON.stringify(committed, null, 2)}\n`);
  }
  if (checkReport) assert(isDeepStrictEqual(read(P.report), committed), `${P.report} er utdatert`);
  assert(Object.values(report.gates).every(Boolean), 'Minst én fulltekstport feiler');
  return { report, chapter, brief, claimsDoc, sourceBrief, modules: modules.map((row) => row.value), registry, status };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const { report } = auditFilmTvAudiovisualFormFulltextV1({ writeReport: args.has('--write-report'), checkReport: !args.has('--write-report') && !args.has('--no-check-report') });
    console.log(`Film & TV Audiovisuell form OK: ${report.canonicalCoverage.exactCoverage}, ${report.summary.sectionCount} seksjoner, ${report.summary.claimCount} claims og ${report.summary.sourceCount} kilder.`);
  } catch (error) { console.error(`Film & TV Audiovisuell form FEIL: ${error.message}`); process.exitCode = 1; }
}
