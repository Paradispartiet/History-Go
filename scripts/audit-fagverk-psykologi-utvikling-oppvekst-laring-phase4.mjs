#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'utvikling-oppvekst-og-laring';
const DOMAIN_ID = 'utvikling_oppvekst_laring';
const CHAPTER_DIR = `data/fagverk/psykologi/${CHAPTER_ID}`;
const P = Object.freeze({
  pensum: 'data/fag/psykologi/psykologipensum_canonical_v4_5.json',
  methods: 'data/fag/psykologi/methods_psykologi_canonical_v4_5.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  chapter: `data/fagverk/psykologi/${CHAPTER_ID}.json`,
  brief: `${CHAPTER_DIR}/brief.json`,
  claims: `${CHAPTER_DIR}/claims.json`,
  internalPlace: 'data/places/psykologi/oslo/places_psykologi/psykologisk_institutt_uio.json',
  report: 'reports/fagverk/psykologi-utvikling-oppvekst-laring-phase4-audit.json'
});
const MODULES = [
  `${CHAPTER_DIR}/01-tidlig-utvikling-og-relasjoner.json`,
  `${CHAPTER_DIR}/02-laring-skole-og-motivasjon.json`,
  `${CHAPTER_DIR}/03-ungdom-identitet-og-livslop.json`
];
const EXPECTED_RUNTIME_PLACE_IDS = ['psykologisk_institutt_uio'];
const EXPECTED_DEVELOPMENT_CASES = [
  'Tidlig utvikling og responsiv omsorg',
  'Tilknytningsforskning',
  'Skole, læring og motivasjon',
  'Ungdom, sosial utvikling og identitet'
];
const abs = (file) => path.join(ROOT, file);
const readJson = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const committedProjection = (report) => ({
  schema: report.schema, version: report.version, status: report.status, generatedFrom: report.generatedFrom,
  subject: report.subject, chapter: report.chapter, summary: report.summary,
  canonicalEmneIds: report.canonicalEmneIds, methodIds: report.methodIds,
  runtimePlaceIds: report.runtimePlaceIds, developmentCaseNames: report.developmentCaseNames, gates: report.gates
});

export function auditPsykologiUtviklingOppvekstLaringPhase4({ writeReport = false, checkReport = true } = {}) {
  for (const file of [P.pensum, P.methods, P.registry, P.status, P.chapter, P.brief, P.claims, P.internalPlace, ...MODULES]) {
    assert(fs.existsSync(abs(file)), `Mangler ${file}`);
  }
  const pensum = readJson(P.pensum);
  const methodsDoc = readJson(P.methods);
  const registry = readJson(P.registry);
  const status = readJson(P.status);
  const chapter = readJson(P.chapter);
  const brief = readJson(P.brief);
  const claimsDoc = readJson(P.claims);
  const modules = MODULES.map(readJson);
  const domain = pensum.domains.find((row) => row.domain_id === DOMAIN_ID);
  assert(domain, `Mangler canonicalt domene ${DOMAIN_ID}`);

  const canonicalEmneIds = [...domain.emne_ids];
  assert(canonicalEmneIds.length === 9, 'Canonicalt domene skal ha 9 emner');
  assert(isDeepStrictEqual(chapter.emne_ids, canonicalEmneIds), 'Kapittelet dekker ikke 9 canonicale emner i eksakt rekkefølge');
  assert(domain.method_ids.length === 18 && isDeepStrictEqual(chapter.method_ids, domain.method_ids), 'Kapittelet bruker ikke 18 canonicale metoder i eksakt rekkefølge');
  const canonicalMethodIds = new Set(methodsDoc.methods.map((row) => row.method_id));
  assert(chapter.method_ids.every((id) => canonicalMethodIds.has(id)), 'Kapittelet peker til ukjent metode');
  assert(chapter.schema === 'history_go_fagverk_chapter_v1' && chapter.subject_id === 'psykologi' && chapter.subject === 'psykologi', 'Feil kapittelschema eller fag-ID');
  assert(chapter.chapter_id === CHAPTER_ID && chapter.id === CHAPTER_ID && chapter.primary_domain_id === DOMAIN_ID, 'Feil kapittel- eller domene-ID');
  assert(chapter.editorialStatus === 'chapter_ready' && chapter.claimTraceRequired === true, 'Kapittelet er ikke claimsporet chapter_ready');

  assert(chapter.doNotDiagnosePeople === true && brief.safety?.doNotDiagnosePeople === true && claimsDoc.source_policy?.noDiagnosisOfIndividuals === true, 'Diagnosevernet mangler');
  assert(brief.safety?.noIndividualTreatmentAdvice === true && claimsDoc.source_policy?.noIndividualTreatmentAdvice === true, 'Behandlingsrådvernet mangler');
  assert(brief.safety?.noScreeningInterpretation === true && claimsDoc.source_policy?.noScreeningInterpretation === true, 'Screeningvernet mangler');
  assert(brief.safety?.noDevelopmentalLabelingFromCasualObservation === true && claimsDoc.source_policy?.noDevelopmentalLabelingFromCasualObservation === true, 'Utviklingsmerkingsvernet mangler');
  assert(claimsDoc.source_policy?.verified_at === '2026-08-11', 'Kildeverifiseringsdato er ikke låst');

  assert(isDeepStrictEqual(chapter.moduleFiles, MODULES), 'Kapittelwrapperen peker til feil modulsett');
  const sections = modules.flatMap((module) => module.sections || []);
  const paragraphs = sections.flatMap((section) => section.paragraphs || []);
  const paragraphTraces = sections.flatMap((section) => section.paragraphClaimIds || []);
  assert(modules.length === 3 && sections.length === 9 && paragraphs.length === 27, 'Kapittelet må ha 3 moduler, 9 seksjoner og 27 fagavsnitt');
  assert(paragraphTraces.length === 27 && paragraphTraces.every((ids) => Array.isArray(ids) && ids.length), 'Alle 27 fagavsnitt må ha claimspor');
  assert(paragraphs.every((text) => typeof text === 'string' && text.length >= 180), 'Et fagavsnitt er for tynt');
  const sectionEmneIds = new Set(sections.flatMap((section) => section.emne_ids || []));
  const sectionMethodIds = new Set(sections.flatMap((section) => section.method_ids || []));
  assert(sectionEmneIds.size === 9 && canonicalEmneIds.every((id) => sectionEmneIds.has(id)), 'Seksjonene dekker ikke 9/9 emner');
  assert(sectionMethodIds.size === 18 && chapter.method_ids.every((id) => sectionMethodIds.has(id)), 'Seksjonene bruker ikke 18/18 metoder');

  const sources = claimsDoc.sources || [];
  const claims = claimsDoc.claims || [];
  const externalSources = sources.filter((source) => source.type !== 'internal_place_record');
  const sourceIds = new Set(sources.map((source) => source.id));
  const claimIds = new Set(claims.map((claim) => claim.id));
  assert(sources.length === 19 && externalSources.length === 18 && claims.length === 27, 'Kapittelet skal ha 19 kilder, 18 eksterne og 27 claims');
  assert(sourceIds.size === 19 && claimIds.size === 27, 'Dupliserte kilde- eller claim-ID-er');
  assert(sources.every((source) => source.id && source.publisher && source.title && source.url && source.source_location && source.label), 'Kilde mangler metadata');
  assert(externalSources.every((source) => /^https:\/\//.test(source.url)), 'Ekstern kilde mangler HTTPS');
  assert(claims.every((claim) => claim.source_ids?.length && claim.source_ids.every((id) => sourceIds.has(id))), 'Claim mangler løst kildepeker');
  assert(paragraphTraces.flat().every((id) => claimIds.has(id)), 'Fagavsnitt peker til ukjent claim');
  assert(claims.every((claim) => paragraphTraces.flat().includes(claim.id)), 'Et verifisert claim brukes ikke i fagtekst');

  const runtimePlaceIds = (chapter.relatedPlaces || []).map((place) => place.id);
  assert(isDeepStrictEqual(runtimePlaceIds, EXPECTED_RUNTIME_PLACE_IDS), 'Kapittelet har ukjent runtime-place-ID');
  const internalPlace = sources.find((source) => source.id === 'src-hg-uio-place');
  assert(internalPlace?.url === P.internalPlace, 'UiO-place-kilden peker feil');
  const developmentCases = chapter.developmentCases || [];
  const developmentCaseNames = developmentCases.map((item) => item.name);
  assert(isDeepStrictEqual(developmentCaseNames, EXPECTED_DEVELOPMENT_CASES), 'Utviklingscasene avviker fra låst case-sett');
  assert(developmentCases.every((item) => item.caseStatus === 'documented_case_not_runtime_place'), 'Utviklingscase later som runtime-sted');

  const registrySubject = registry.subjects?.psykologi;
  assert(registrySubject?.chapters?.length === 3, 'Psykologi skal ha nøyaktig tre registrerte kapitler');
  const registryChapter = registrySubject.chapters.find((item) => item.id === CHAPTER_ID);
  assert(registryChapter && registryChapter.file === P.chapter && registryChapter.primary_domain_id === DOMAIN_ID, 'Registry mangler eller feilregistrerer kapittelet');
  assert(isDeepStrictEqual(registryChapter.emne_ids, canonicalEmneIds) && registryChapter.claimsFile === P.claims && registryChapter.briefFile === P.brief, 'Registry har feil emner/brief/claims');
  assert(registrySubject.editorialPlan?.targetChapterCount === 6 && registrySubject.editorialPlan?.nextGate === 'remaining_domain_chapter_production', 'Psykologi mangler korrekt 3/6-plan');
  const statusEntry = status.subjects.find((item) => item.id === 'psykologi');
  assert(statusEntry?.navigationStatus === 'materialized' && statusEntry?.assessmentStatus === 'audited', 'Psykologi mistet materialized/audited status');
  assert(statusEntry?.editorialStatus === 'chapters_in_progress' && statusEntry?.nextGate === 'remaining_domain_chapter_production', 'Psykologi har feil redaksjonell fremdrift');

  const forbiddenPatterns = [
    /du har (?:en|et) [a-zæøå-]+lidelse/i,
    /du er (?:deprimert|psykotisk|bipolar)/i,
    /testen viser at du har/i,
    /barnet er (?:unormalt|utrygt tilknyttet)/i,
    /ungdom gjør dette fordi frontallappen ikke er ferdig/i
  ];
  assert(forbiddenPatterns.every((pattern) => !pattern.test(JSON.stringify({ chapter, brief, modules }))), 'Kapittelet inneholder diagnostisk, utviklingsstemplende eller deterministisk språk');

  const report = {
    schema: 'history_go_fagverk_psykologi_utvikling_oppvekst_laring_phase4_audit_v1',
    version: '1.0.0',
    status: 'psykologi_utvikling_oppvekst_laring_chapter_ready',
    generatedFrom: P,
    subject: {
      id: 'psykologi', editorialStatus: statusEntry.editorialStatus, nextGate: statusEntry.nextGate,
      registeredChapterCount: registrySubject.chapters.length, targetChapterCount: registrySubject.editorialPlan.targetChapterCount
    },
    chapter: { id: CHAPTER_ID, primaryDomainId: DOMAIN_ID, editorialStatus: chapter.editorialStatus, doNotDiagnosePeople: chapter.doNotDiagnosePeople },
    summary: {
      emneCount: 9, methodCount: 18, moduleCount: 3, sectionCount: 9, paragraphCount: 27,
      claimCount: 27, sourceCount: 19, externalSourceCount: 18,
      runtimePlaceCount: runtimePlaceIds.length, developmentCaseCount: developmentCases.length
    },
    canonicalEmneIds,
    methodIds: chapter.method_ids,
    runtimePlaceIds,
    developmentCaseNames,
    gates: {
      exactCanonicalEmneCoverage: true,
      exactCanonicalMethodCoverage: true,
      threeModulesNineSectionsTwentySevenParagraphs: true,
      paragraphClaimTraceComplete: true,
      allClaimsUsedAndSourceResolved: true,
      eighteenExternalSourcesPresent: true,
      sourceLocationsComplete: true,
      doNotDiagnosePeopleGuardPresent: true,
      noIndividualTreatmentAdviceGuardPresent: true,
      noScreeningInterpretationGuardPresent: true,
      noDevelopmentalLabelingGuardPresent: true,
      noInventedRuntimePlaces: true,
      developmentCasesExplicitlyNonRuntime: true,
      registrySynchronizedAtThreeOfSix: true,
      statusChaptersInProgress: true
    }
  };

  if (writeReport) {
    fs.mkdirSync(path.dirname(abs(P.report)), { recursive: true });
    fs.writeFileSync(abs(P.report), `${JSON.stringify(committedProjection(report), null, 2)}\n`);
  }
  if (checkReport) {
    assert(fs.existsSync(abs(P.report)), `${P.report} mangler. Kjør audit med --write-report`);
    assert(isDeepStrictEqual(readJson(P.report), committedProjection(report)), `${P.report} er utdatert`);
  }
  return { report: committedProjection(report), chapter, brief, claimsDoc, modules };
}

function main() {
  const args = new Set(process.argv.slice(2));
  try {
    const result = auditPsykologiUtviklingOppvekstLaringPhase4({
      writeReport: args.has('--write-report'),
      checkReport: !args.has('--no-check-report') && !args.has('--write-report')
    });
    console.log(`Psykologi Utvikling Phase 4 OK: ${result.report.summary.emneCount}/9 emner, ${result.report.summary.methodCount} metoder, ${result.report.summary.paragraphCount} avsnitt, ${result.report.summary.claimCount} claims og ${result.report.summary.externalSourceCount} eksterne kilder.`);
  } catch (error) {
    console.error(`Psykologi Utvikling Phase 4 FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
