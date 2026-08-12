#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'serialitet-format-og-adaptasjon';
const OUTPUT_GATE = 'seriality_format_adaptation_full_chapter_complete_next_unit_source_brief';
const LATER_SOURCE_BRIEF_GATE = 'film_history_movements_historiography_source_brief_complete_full_chapter_production';
const LATER_FULLTEXT_GATE = 'film_history_movements_historiography_full_chapter_complete_next_unit_source_brief';
const TELEVISION_SOURCE_BRIEF_GATE = 'television_platforms_participation_source_brief_complete_full_chapter_production';
const TELEVISION_FULLTEXT_GATE = 'television_platforms_participation_full_chapter_complete_next_unit_source_brief';
const P = Object.freeze({
  chapter: `data/fagverk/film_tv/${CHAPTER_ID}.json`, brief: `data/fagverk/film_tv/${CHAPTER_ID}/brief.json`, claims: `data/fagverk/film_tv/${CHAPTER_ID}/claims.json`,
  sourceBrief: 'data/fag/TV_og_Film/film_tv_seriality_format_adaptation_source_claim_brief_v1.json',
  learningPlan: 'data/fag/TV_og_Film/film_tv_learning_order_plan_v1.json', emners: 'data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json', methods: 'data/fag/TV_og_Film/methods_film_tv_canonical_v4_5.json',
  places: 'data/places/places_index.json', registry: 'data/fagverk/fagverk_registry.json', status: 'data/fagverk/subject_status.json',
  report: 'reports/fagverk/film-tv-seriality-format-adaptation-fulltext-v1-audit.json'
});
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const committedProjection = (report) => ({
  schema: report.schema, version: report.version, status: report.status, generatedFrom: report.generatedFrom,
  subject: report.subject, chapter: report.chapter, canonicalCoverage: report.canonicalCoverage,
  claimPlanResolution: report.claimPlanResolution, summary: report.summary, gates: report.gates, nextGate: report.nextGate
});

export function auditFilmTvSerialityFormatAdaptationFulltextV1({ writeReport = false, checkReport = true } = {}) {
  const chapter = read(P.chapter); const brief = read(P.brief); const claimsDoc = read(P.claims); const sourceBrief = read(P.sourceBrief);
  const plan = read(P.learningPlan); const emners = read(P.emners); const methodsDoc = read(P.methods); const places = read(P.places);
  const registry = read(P.registry); const status = read(P.status);
  const unit = plan.planned_units.find((row) => row.id === CHAPTER_ID);
  const statusEntry = status.subjects.find((row) => row.id === 'film_tv');
  const registryChapter = registry.subjects.film_tv.chapters.find((row) => row.id === CHAPTER_ID);
  const modules = chapter.moduleFiles.map((file) => ({ file, value: read(file) }));
  const sections = modules.flatMap((row) => row.value.sections || []);
  const plannedClaims = sourceBrief.topic_briefs.flatMap((row) => row.planned_claims);
  const paragraphClaimIds = sections.flatMap((row) => row.paragraphClaimIds || []).flat();
  const keyPointClaimIds = sections.flatMap((row) => row.keyPointClaimIds || []).flat();
  const canonicalEmneIds = new Set(emners.map((row) => row.emne_id));
  const canonicalMethodIds = new Set((Array.isArray(methodsDoc) ? methodsDoc : methodsDoc.methods).map((row) => row.method_id || row.id));
  const sourceIds = new Set(claimsDoc.sources.map((row) => row.id)); const claimIds = new Set(claimsDoc.claims.map((row) => row.id));
  const sectionIds = new Set(sections.map((row) => row.id)); const plannedClaimIds = new Set(plannedClaims.map((row) => row.id));
  const usedSourceIds = new Set(claimsDoc.claims.flatMap((row) => row.source_ids));

  assert(chapter.schema === 'history_go_fagverk_chapter_v1' && chapter.subject_id === 'film_tv', 'Kapittelet har feil schema eller fag');
  assert(chapter.id === CHAPTER_ID && chapter.primary_domain_id === 'fortelling_sjanger_serialitet_format', 'Kapittelet har feil ID eller eierdomene');
  assert(chapter.editorialStatus === 'chapter_ready' && chapter.claimTraceRequired === true && chapter.sourceFirst === true, 'Kapittelet er ikke fulltekstklart og source-first');
  assert(isDeepStrictEqual(chapter.emne_ids, unit.emne_ids) && chapter.emne_ids.length === 10, 'Kapittelet dekker ikke læringsenhetens ti canonicale emner eksakt');
  assert(new Set(chapter.emne_ids).size === 10 && chapter.emne_ids.every((id) => canonicalEmneIds.has(id)), 'Kapittelet har dupliserte eller ukjente emner');
  assert(chapter.method_ids.length > 0 && chapter.method_ids.every((id) => canonicalMethodIds.has(id)), 'Kapittelet har uløst metode-ID');
  assert(chapter.relatedPlaces.length === 2 && chapter.workCases.length === 12, 'Kapittelet skal ha tolv verkcase og to canonicale anvendelsessteder');
  assert(chapter.workCases.some((row) => /film|cinema/.test(row.medium)) && chapter.workCases.some((row) => /television/.test(row.medium)), 'Film- eller TV-case mangler');
  assert(chapter.workCases.every((row) => row.id && row.title && row.year && row.medium && row.role && row.source_ids.length), 'Et verkcase er ikke renderbart eller kildekoblet');
  const knownPlaceIds = new Set(places.map((row) => row.id));
  assert(chapter.relatedPlaces.every((row) => knownPlaceIds.has(row.id) && row.name && row.role), 'Et anvendelsessted er ukjent eller ikke renderbart');

  assert(brief.schema === 'history_go_fagverk_chapter_brief_v1' && brief.chapter_id === CHAPTER_ID, 'Kapittelbriefen er usynkronisert');
  assert(isDeepStrictEqual(brief.requiredEmneIds, chapter.emne_ids) && isDeepStrictEqual(brief.requiredMethodIds, chapter.method_ids), 'Kapittelbriefen har feil emne- eller metodedekning');
  assert(isDeepStrictEqual(brief.relatedPlaceIds, chapter.relatedPlaces.map((row) => row.id)), 'Kapittelbriefen har feil anvendelsessteder');
  assert(brief.qa.sectionCountDerivedFromEmneOwnership === true && brief.qa.actualFulltextSections === 10 && brief.qa.paragraphCountsAreNotQuota === true, 'Briefen dokumenterer ikke naturlig omfang');
  assert(brief.qa.paragraphClaimTraceRequired === true && brief.qa.plannedClaimResolution === '28/28', 'Briefens claimport er ikke fullført');

  assert(modules.length === 4 && sections.length === 10, 'Kapittelet skal ha fire progresjonsmoduler og ti emneeide seksjoner');
  assert(isDeepStrictEqual(modules.map((row) => row.value.sections.length), [4, 2, 2, 2]), 'Modulene følger ikke de avtalte problemgrensene 4–2–2–2');
  assert(sections.every((row) => row.emne_ids.length === 1), 'Hver seksjon skal eie nøyaktig ett emne');
  assert(isDeepStrictEqual(new Set(sections.flatMap((row) => row.emne_ids)), new Set(chapter.emne_ids)), 'Seksjonene dekker ikke alle emner nøyaktig én gang');
  assert(new Set(sections.map((row) => row.paragraphs.length)).size > 1, 'Avsnittstallet er blitt en skjult likhetskvote');
  assert(sections.every((row) => row.paragraphs.length >= 2 && row.paragraphClaimIds.length === row.paragraphs.length), 'Et avsnitt mangler claimspor');
  assert(sections.every((row) => row.paragraphClaimIds.every((ids) => Array.isArray(ids) && ids.length === 1)), 'Et avsnitt mangler entydig claimspor');
  assert(sections.every((row) => row.keyPoints.length === 2 && row.keyPointClaimIds.length === 2 && row.keyPointClaimIds.every((ids) => ids.length === 1)), 'Nøkkelpunktene er ikke entydig claimsporet');
  assert(modules[0].value.concepts.length === 8, 'Grunnlagsmodulen mangler begreper');
  assert(modules[1].value.workedExamples.length === 4 && modules[1].value.commonMisconceptions.length === 6, 'Formatmodulen mangler eksempler eller misoppfatninger');
  assert(modules[1].value.workedExamples.every((row) => row.title && row.situation && row.analysis.length >= 2 && row.analysis.every(Boolean)), 'Et arbeidseksempel er ikke renderbart');
  assert(modules[3].value.applicationTasks.length === 6 && modules[3].value.selfCheck.length === 8, 'Anvendelsesmodulen mangler oppgaver eller selvkontroll');

  assert(claimsDoc.schema === 'history_go_fagverk_chapter_claims_v1' && claimsDoc.chapter_id === CHAPTER_ID, 'Claims-filen er usynkronisert');
  assert(claimsDoc.sources.length === 16 && sourceIds.size === 16, 'Kapittelet skal bruke seksten unike inspectable kilder');
  assert(claimsDoc.sources.every((row) => /^https:\/\//.test(row.url) && row.label && row.publisher && row.title && row.source_location && row.retrieval_status), 'En kilde er ikke inspectable eller renderbar');
  assert(claimsDoc.claims.length === 28 && claimIds.size === 28 && isDeepStrictEqual(claimIds, plannedClaimIds), 'De endelige claims løser ikke briefens 28 claimplaner eksakt');
  assert(claimsDoc.claims.every((row) => row.claim_plan_id === row.id && row.status === 'verified' && ['verified_as_planned', 'verified_after_scope_narrowing'].includes(row.plan_resolution)), 'En claim mangler verifisert planoppløsning');
  assert(claimsDoc.claims.every((row) => row.source_ids.length && row.source_ids.every((id) => sourceIds.has(id))), 'En claim peker til ukjent kilde');
  assert(claimsDoc.claims.every((row) => row.used_in.length === 1 && row.used_in.every((id) => sectionIds.has(id))), 'En claim har ugyldig seksjonsspor');
  assert([...sourceIds].every((id) => usedSourceIds.has(id)), 'En registrert kilde brukes ikke av noen claim');
  assert(paragraphClaimIds.length === 28 && new Set(paragraphClaimIds).size === 28 && paragraphClaimIds.every((id) => claimIds.has(id)), 'Avsnittssporene dekker ikke alle claims én gang');
  assert(keyPointClaimIds.every((id) => claimIds.has(id)), 'Et nøkkelpunkt peker til ukjent claim');

  assert(sourceBrief.status === 'source_claim_brief_consumed_by_verified_chapter', 'Kildebriefen er ikke markert konsumert');
  assert(sourceBrief.runtime_registration.registered === true && sourceBrief.runtime_registration.chapter_id === CHAPTER_ID, 'Kildebriefen dokumenterer ikke registreringen');
  assert(plannedClaims.every((row) => row.status === 'resolved_to_verified_claim' && row.final_claim_id === row.id && claimIds.has(row.id)), 'En claimplan er ikke løst');
  assert(registryChapter?.file === P.chapter && isDeepStrictEqual(registryChapter.emne_ids, chapter.emne_ids), 'Fagverkregisteret mangler eller feilregistrerer kapitlet');
  assert(statusEntry.editorialStatus === 'chapters_in_progress' && [OUTPUT_GATE, LATER_SOURCE_BRIEF_GATE, LATER_FULLTEXT_GATE, TELEVISION_SOURCE_BRIEF_GATE, TELEVISION_FULLTEXT_GATE].includes(statusEntry.nextGate), 'Film & TV står ikke på neste enhets kildebriefport');

  const combined = JSON.stringify({ chapter, brief, modules: modules.map((row) => row.value) });
  assert(/episode.{0,180}sesong.{0,180}(serie|seriehelhet)/is.test(combined), 'Episode–sesong–serie-vakten mangler');
  assert(/episodisk.{0,180}seriell.{0,220}(kombinasjon|grader|enten)/is.test(combined), 'Episodisk/seriell-vakten mangler');
  assert(/cliffhanger.{0,240}(stans|holdes tilbake).{0,180}(grense|publisering)/is.test(combined), 'Cliffhangervakten mangler');
  assert(/formatlogikk.{0,260}(regler|roller|runder).{0,200}(innhold|deltakere)/is.test(combined), 'Formatvakten mangler');
  assert(/adaptasjon.{0,300}(tid|rom).{0,220}(framstilling|rollefigur)/is.test(combined), 'Adaptasjonsvakten mangler');
  assert(/transmedial.{0,260}(forskjellig|eget).{0,180}(bidrag|medium)/is.test(combined), 'Transmediavakten mangler');
  assert(/oppfølger.{0,160}prequel.{0,160}remake.{0,160}adaptasjon/is.test(combined), 'Verkrelasjonsvakten mangler');
  assert(/sjangerhistorie.{0,260}(sykluser|formendringer).{0,220}(tidløs|historisk)/is.test(combined), 'Sjangerhistorievakten mangler');
  assert(/rettigheter.{0,160}(lisensiering|distribusjon).{0,220}(utenfor|eier)/is.test(combined), 'Industriavgrensningen mangler');
  assert(/kildeopplysning.{0,160}observasjon.{0,160}tolkning|kilde.{0,220}observasjon.{0,220}tolkning/is.test(combined), 'Kilde/observasjon/tolkning-vakten mangler');

  const report = {
    schema: 'history_go_film_tv_seriality_format_adaptation_fulltext_v1_audit', version: '1.0.0', status: 'seriality_format_adaptation_chapter_verified_registered', generatedFrom: P,
    subject: { id: 'film_tv', editorialStatus: statusEntry.editorialStatus, nextGate: statusEntry.nextGate, registeredChapterCount: registry.subjects.film_tv.chapters.length },
    chapter: { id: chapter.id, title: chapter.title, primaryDomainId: chapter.primary_domain_id, moduleFiles: chapter.moduleFiles, briefFile: chapter.briefFile, claimsFile: chapter.claimsFile },
    canonicalCoverage: { requiredEmneIds: unit.emne_ids, coveredEmneIds: chapter.emne_ids, exactCoverage: '10/10 canonical emner', sectionOwnership: '10 emner eid av 10 naturlig avgrensede seksjoner' },
    claimPlanResolution: { plannedClaimIds: [...plannedClaimIds], finalClaimIds: [...claimIds], exactResolution: '28/28', rewrittenClaimIds: claimsDoc.claims.filter((row) => row.plan_resolution !== 'verified_as_planned').map((row) => row.id) },
    summary: {
      moduleCount: modules.length, moduleSectionCounts: modules.map((row) => row.value.sections.length), sectionCount: sections.length,
      paragraphCount: sections.reduce((sum, row) => sum + row.paragraphs.length, 0), conceptCount: modules[0].value.concepts.length,
      workedExampleCount: modules[1].value.workedExamples.length, misconceptionCount: modules[1].value.commonMisconceptions.length,
      applicationTaskCount: modules[3].value.applicationTasks.length, selfCheckCount: modules[3].value.selfCheck.length,
      methodCount: chapter.method_ids.length, sourceCount: claimsDoc.sources.length, claimCount: claimsDoc.claims.length,
      workCaseCount: chapter.workCases.length, filmOrCinemaCaseCount: chapter.workCases.filter((row) => /film|cinema/.test(row.medium)).length,
      televisionCaseCount: chapter.workCases.filter((row) => /television/.test(row.medium)).length, placeCaseCount: chapter.relatedPlaces.length
    },
    gates: {
      exactCanonicalCoverage: true, oneSectionOwnerPerEmne: true, variableModuleAndParagraphStructure: true,
      fulltextParagraphClaimTrace: true, everyClaimPlanResolved: true, allClaimsVerifiedAndUsed: true,
      allSourcesUsedAndInspectable: true, filmAndTelevisionCasesPresent: true, comparableVersionCasesPresent: true,
      sourceFactObservationInterpretationSeparated: true, canonicalPlaceApplicationsResolved: true, methodsResolve: true,
      rendererFieldsPresent: true, sourceBriefConsumedAfterGate: true, registryAndRuntimeSynchronized: true,
      episodeSeasonSeriesGuard: true, episodicSerialGuard: true, cliffhangerBoundaryGuard: true, formatContentGuard: true,
      adaptationComparisonGuard: true, transmediaContributionGuard: true, workRelationGuard: true,
      genreHistoryRevisionGuard: true, industryBoundaryGuard: true, observationSourceInterpretationGuard: true, releaseReady: true
    },
    nextGate: 'produce_source_and_claim_brief_for_filmhistorie_bevegelser_og_historiografi'
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
    const { report } = auditFilmTvSerialityFormatAdaptationFulltextV1({ writeReport: args.has('--write-report'), checkReport: !args.has('--write-report') && !args.has('--no-check-report') });
    console.log(`Film & TV Serialitet OK: ${report.canonicalCoverage.exactCoverage}, ${report.summary.sectionCount} seksjoner, ${report.summary.claimCount} claims og ${report.summary.sourceCount} kilder.`);
  } catch (error) {
    console.error(`Film & TV Serialitet FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
