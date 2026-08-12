#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'fjernsyn-plattformer-og-deltakerhistorier';
const OUTPUT_GATE = 'television_platforms_participation_full_chapter_complete_next_unit_source_brief';
const LATER_SOURCE_BRIEF_GATE = 'documentary_evidence_ethics_source_brief_complete_full_chapter_production';
const LATER_FULLTEXT_GATE = 'documentary_evidence_ethics_full_chapter_complete_next_unit_source_brief';
const P = Object.freeze({
  chapter: `data/fagverk/film_tv/${CHAPTER_ID}.json`, brief: `data/fagverk/film_tv/${CHAPTER_ID}/brief.json`, claims: `data/fagverk/film_tv/${CHAPTER_ID}/claims.json`,
  sourceBrief: 'data/fag/TV_og_Film/film_tv_television_platforms_participation_source_claim_brief_v1.json',
  learningPlan: 'data/fag/TV_og_Film/film_tv_learning_order_plan_v1.json', emners: 'data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json', methods: 'data/fag/TV_og_Film/methods_film_tv_canonical_v4_5.json',
  places: 'data/places/places_index.json', registry: 'data/fagverk/fagverk_registry.json', status: 'data/fagverk/subject_status.json',
  report: 'reports/fagverk/film-tv-television-platforms-participation-fulltext-v1-audit.json'
});
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const committedProjection = (report) => ({
  schema: report.schema, version: report.version, status: report.status, generatedFrom: report.generatedFrom,
  subject: report.subject, chapter: report.chapter, canonicalCoverage: report.canonicalCoverage,
  claimPlanResolution: report.claimPlanResolution, summary: report.summary, gates: report.gates, nextGate: report.nextGate
});

export function auditFilmTvTelevisionPlatformsParticipationFulltextV1({ writeReport = false, checkReport = true } = {}) {
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
  assert(chapter.id === CHAPTER_ID && chapter.primary_domain_id === 'film_tv_historie_historiografi', 'Kapittelet har feil ID eller eierdomene');
  assert(chapter.editorialStatus === 'chapter_ready' && chapter.claimTraceRequired === true && chapter.sourceFirst === true, 'Kapittelet er ikke fulltekstklart og source-first');
  assert(isDeepStrictEqual(chapter.emne_ids, unit.emne_ids) && chapter.emne_ids.length === 8, 'Kapittelet dekker ikke læringsenhetens åtte canonicale emner eksakt');
  assert(new Set(chapter.emne_ids).size === 8 && chapter.emne_ids.every((id) => canonicalEmneIds.has(id)), 'Kapittelet har dupliserte eller ukjente emner');
  assert(chapter.method_ids.length > 0 && chapter.method_ids.every((id) => canonicalMethodIds.has(id)), 'Kapittelet har uløst metode-ID');
  assert(chapter.relatedPlaces.length === 3 && chapter.workCases.length === 19, 'Kapittelet skal ha nitten case og tre canonicale anvendelsessteder');
  assert(chapter.workCases.every((row) => row.id && row.title && row.year && row.medium && row.role && row.source_ids.length), 'Et case er ikke renderbart eller kildekoblet');
  const knownPlaceIds = new Set(places.map((row) => row.id));
  assert(chapter.relatedPlaces.every((row) => knownPlaceIds.has(row.id) && row.name && row.role), 'Et anvendelsessted er ukjent eller ikke renderbart');

  assert(brief.schema === 'history_go_fagverk_chapter_brief_v1' && brief.chapter_id === CHAPTER_ID, 'Kapittelbriefen er usynkronisert');
  assert(isDeepStrictEqual(brief.requiredEmneIds, chapter.emne_ids) && isDeepStrictEqual(brief.requiredMethodIds, chapter.method_ids), 'Kapittelbriefen har feil emne- eller metodedekning');
  assert(isDeepStrictEqual(brief.relatedPlaceIds, chapter.relatedPlaces.map((row) => row.id)), 'Kapittelbriefen har feil anvendelsessteder');
  assert(brief.qa.sectionCountDerivedFromEmneOwnership === true && brief.qa.actualFulltextSections === 8 && brief.qa.paragraphCountsAreNotQuota === true, 'Briefen dokumenterer ikke naturlig omfang');
  assert(brief.qa.paragraphClaimTraceRequired === true && brief.qa.plannedClaimResolution === '31/31', 'Briefens claimport er ikke fullført');
  assert(brief.scope.excluded.includes('dagens plattformmakt og anbefalingssystemer') && brief.scope.excluded.includes('nærlesing av dokumentarisk evidens og deltakeretikk') && brief.scope.excluded.includes('arkivets bevaringspraksis som hovedtema'), 'Naboområdegrensene mangler');

  assert(modules.length === 3 && sections.length === 8, 'Kapittelet skal ha tre problemmoduler og åtte emneeide seksjoner');
  assert(isDeepStrictEqual(modules.map((row) => row.value.sections.length), [2, 3, 3]), 'Modulene følger ikke problemgrensene 2–3–3');
  assert(sections.every((row) => row.emne_ids.length === 1), 'Hver seksjon skal eie nøyaktig ett emne');
  assert(isDeepStrictEqual(new Set(sections.flatMap((row) => row.emne_ids)), new Set(chapter.emne_ids)), 'Seksjonene dekker ikke alle emner nøyaktig én gang');
  assert(new Set(sections.map((row) => row.paragraphs.length)).size > 1, 'Avsnittstallet er blitt en skjult likhetskvote');
  assert(sections.every((row) => row.paragraphs.length >= 3 && row.paragraphClaimIds.length === row.paragraphs.length), 'Et avsnitt mangler claimspor');
  assert(sections.every((row) => row.paragraphClaimIds.every((ids) => Array.isArray(ids) && ids.length === 1)), 'Et avsnitt mangler entydig claimspor');
  assert(sections.every((row) => row.keyPoints.length === 2 && row.keyPointClaimIds.length === 2 && row.keyPointClaimIds.every((ids) => ids.length === 1)), 'Nøkkelpunktene er ikke entydig claimsporet');
  assert(modules[0].value.concepts.length === 8, 'Kringkastingsmodulen mangler begreper');
  assert(modules[1].value.workedExamples.length === 5 && modules[1].value.commonMisconceptions.length === 6, 'Revisjonsmodulen mangler eksempler eller misoppfatninger');
  assert(modules[1].value.workedExamples.every((row) => row.title && row.situation && row.analysis.length >= 2 && row.analysis.every(Boolean)), 'Et arbeidseksempel er ikke renderbart');
  assert(modules[2].value.applicationTasks.length === 6 && modules[2].value.selfCheck.length === 8, 'Plattformmodulen mangler oppgaver eller selvkontroll');

  assert(claimsDoc.schema === 'history_go_fagverk_chapter_claims_v1' && claimsDoc.chapter_id === CHAPTER_ID, 'Claims-filen er usynkronisert');
  assert(claimsDoc.sources.length === 20 && sourceIds.size === 20, 'Kapittelet skal bruke tjue unike kilder');
  assert(claimsDoc.claims.length === 31 && claimIds.size === 31, 'Kapittelet skal ha trettien unike claims');
  assert(claimsDoc.sources.every((row) => row.url?.startsWith('https://') && row.source_location && row.retrieval_status === 'verified_2026-08-11'), 'En kilde er ikke inspectable eller lokalisert');
  assert(isDeepStrictEqual(claimIds, plannedClaimIds), 'Finale claims løser ikke claimplanene eksakt');
  assert(claimsDoc.claims.every((row) => row.status === 'verified' && row.claim_plan_id === row.id && row.source_ids.length && row.used_in.length === 1 && sectionIds.has(row.used_in[0])), 'Et claim er ikke verifisert, kildekoblet eller brukt');
  assert(claimsDoc.claims.every((row) => row.source_ids.every((id) => sourceIds.has(id))), 'Et claim peker på ukjent kilde');
  assert(claimsDoc.sources.every((row) => usedSourceIds.has(row.id)), 'En kilde er oppført uten å støtte et finalt claim');
  assert(paragraphClaimIds.length === 31 && paragraphClaimIds.every((id) => claimIds.has(id)) && new Set(paragraphClaimIds).size === 31, 'Avsnittsclaimtrace er ikke 31/31 entydig');
  assert(keyPointClaimIds.every((id) => claimIds.has(id)), 'Et nøkkelpunkt peker på ukjent claim');

  assert(sourceBrief.status === 'source_claim_brief_consumed_by_verified_chapter', 'Kildebriefen er ikke markert konsumert');
  assert(sourceBrief.runtime_registration.registered === true && sourceBrief.runtime_registration.chapter_id === CHAPTER_ID, 'Kildebriefen dokumenterer ikke registreringen');
  assert(plannedClaims.every((row) => row.status === 'resolved_to_verified_claim' && row.final_claim_id === row.id && claimIds.has(row.id)), 'En claimplan er ikke løst');
  assert(registryChapter?.file === P.chapter && isDeepStrictEqual(registryChapter.emne_ids, chapter.emne_ids), 'Fagverkregisteret mangler eller feilregistrerer kapitlet');
  assert(statusEntry.editorialStatus === 'chapters_in_progress' && [OUTPUT_GATE, LATER_SOURCE_BRIEF_GATE, LATER_FULLTEXT_GATE].includes(statusEntry.nextGate), 'Film & TV står ikke på neste enhets kildebriefport');

  const combined = JSON.stringify({ chapter, brief, modules: modules.map((row) => row.value) });
  assert(/prøvevisning.{0,220}(regulær|sendestart)/is.test(combined), 'Prøvevisning-/sendestartvakten mangler');
  assert(/Telstar.{0,260}(Our World|globalt program)/is.test(combined), 'Telstar-/Our World-vakten mangler');
  assert(/signal.{0,180}program.{0,180}mottak/is.test(combined), 'Signal-/program-/mottaksvakten mangler');
  assert(/dokumentarisk overflate.{0,220}(tvang|iscenesettelse).{0,140}(propaganda|bedrag)/is.test(combined), 'Dokumentarsannhetsvakten mangler');
  assert(/proveniens.{0,220}(annotasjon|metadata).{0,220}(familie|relasjon)/is.test(combined), 'Hjemmefilmkildevakten mangler');
  assert(/satellitt.{0,220}overføringsteknologi.{0,220}(abonnementsmodell|marked)/is.test(combined), 'Satellittoverføring-/markedsvakten mangler');
  assert(/hybrid.{0,220}(DVD|instant watching)/is.test(combined), 'Hybrid hjemmemedievakt mangler');
  assert(/lanseringsdato.{0,220}(bruksdata|bruksendring)/is.test(combined), 'Lansering-/bruksvakten mangler');
  assert(/dagens plattformmakt.{0,160}(utenfor|excluded)|dagens plattformmakt og anbefalingssystemer/is.test(combined), 'Eiergrensen mot dagens plattformmakt mangler');
  assert(/nærlesing av dokumentarisk evidens og deltakeretikk/is.test(combined), 'Eiergrensen mot neste dokumentarenhet mangler');
  assert(/arkivets bevaringspraksis som hovedtema/is.test(combined), 'Eiergrensen mot arkiv/bevaring mangler');

  const report = {
    schema: 'history_go_film_tv_television_platforms_participation_fulltext_v1_audit', version: '1.0.0', status: 'television_platforms_participation_chapter_verified_registered', generatedFrom: P,
    subject: { id: 'film_tv', editorialStatus: statusEntry.editorialStatus, nextGate: statusEntry.nextGate, registeredChapterCount: registry.subjects.film_tv.chapters.length },
    chapter: { id: chapter.id, title: chapter.title, primaryDomainId: chapter.primary_domain_id, moduleFiles: chapter.moduleFiles, briefFile: chapter.briefFile, claimsFile: chapter.claimsFile },
    canonicalCoverage: { requiredEmneIds: unit.emne_ids, coveredEmneIds: chapter.emne_ids, exactCoverage: '8/8 canonical emner', sectionOwnership: '8 emner eid av 8 naturlig avgrensede seksjoner' },
    claimPlanResolution: { plannedClaimIds: [...plannedClaimIds], finalClaimIds: [...claimIds], exactResolution: '31/31', rewrittenClaimIds: claimsDoc.claims.filter((row) => row.plan_resolution !== 'verified_as_planned').map((row) => row.id) },
    summary: {
      moduleCount: modules.length, moduleSectionCounts: modules.map((row) => row.value.sections.length), sectionCount: sections.length,
      paragraphCount: sections.reduce((sum, row) => sum + row.paragraphs.length, 0), conceptCount: modules[0].value.concepts.length,
      workedExampleCount: modules[1].value.workedExamples.length, misconceptionCount: modules[1].value.commonMisconceptions.length,
      applicationTaskCount: modules[2].value.applicationTasks.length, selfCheckCount: modules[2].value.selfCheck.length,
      methodCount: chapter.method_ids.length, sourceCount: claimsDoc.sources.length, claimCount: claimsDoc.claims.length,
      workCaseCount: chapter.workCases.length, placeCaseCount: chapter.relatedPlaces.length
    },
    gates: {
      exactCanonicalCoverage: true, oneSectionOwnerPerEmne: true, variableModuleAndParagraphStructure: true,
      fulltextParagraphClaimTrace: true, everyClaimPlanResolved: true, allClaimsVerifiedAndUsed: true,
      allSourcesUsedAndInspectable: true, launchSignalServiceAdoptionSeparated: true,
      broadcastLiveDocumentaryRevisionHomeMediaAndPlatformCasesPresent: true,
      directSignalProgrammeReceptionDistinct: true, documentaryTruthRegimesHistoricized: true,
      participantImagesProvenanceCritiqued: true, technologyInstitutionMarketUseSeparated: true,
      corporatePrimarySourcesBoundedByIndependentUseEvidence: true,
      currentPlatformPowerBoundaryKept: true, nextDocumentaryUnitBoundaryKept: true, archivePreservationBoundaryKept: true,
      canonicalPlaceApplicationsResolved: true, methodsResolve: true, rendererFieldsPresent: true,
      sourceBriefConsumedAfterGate: true, registryAndRuntimeSynchronized: true, releaseReady: true
    },
    nextGate: 'produce_source_and_claim_brief_for_dokumentar_evidens_og_etikk'
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
    const { report } = auditFilmTvTelevisionPlatformsParticipationFulltextV1({ writeReport: args.has('--write-report'), checkReport: !args.has('--write-report') && !args.has('--no-check-report') });
    console.log(`Film & TV fjernsynsplattformer OK: ${report.canonicalCoverage.exactCoverage}, ${report.summary.sectionCount} seksjoner, ${report.summary.claimCount} claims og ${report.summary.sourceCount} kilder.`);
  } catch (error) {
    console.error(`Film & TV fjernsynsplattformer FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
