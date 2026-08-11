#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'psykisk-helse-institusjoner-og-behandling';
const DOMAIN_ID = 'psykisk_helse_institusjoner_behandling';
const CHAPTER_DIR = `data/fagverk/psykologi/${CHAPTER_ID}`;
const P = Object.freeze({
  pensum: 'data/fag/psykologi/psykologipensum_canonical_v4_5.json',
  methods: 'data/fag/psykologi/methods_psykologi_canonical_v4_5.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  chapter: `data/fagverk/psykologi/${CHAPTER_ID}.json`,
  brief: `${CHAPTER_DIR}/brief.json`,
  claims: `${CHAPTER_DIR}/claims.json`,
  report: 'reports/fagverk/psykologi-psykisk-helse-phase4-audit.json'
});
const MODULES = [
  `${CHAPTER_DIR}/01-grunnlag.json`,
  `${CHAPTER_DIR}/02-rettigheter-og-praksis.json`,
  `${CHAPTER_DIR}/03-institusjon-sted-og-krise.json`
];
const EXPECTED_RUNTIME_PLACE_IDS = ['psykologisk_institutt_uio'];
const EXPECTED_CASE_NAMES = ['Gaustad sykehus', 'Dikemark sykehus', 'Psykiatrisk avdeling, Vinderen'];
const REQUIRED_CURRENT_SOURCE_IDS = [
  'src-phvl-2026',
  'src-phvf-2026',
  'src-helsenorge-vern',
  'src-helsenorge-tvang',
  'src-helsedir-kontroll'
];

const abs = (file) => path.join(ROOT, file);
const readJson = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function committedProjection(report) {
  return {
    schema: report.schema,
    version: report.version,
    status: report.status,
    generatedFrom: report.generatedFrom,
    subject: report.subject,
    chapter: report.chapter,
    summary: report.summary,
    canonicalEmneIds: report.canonicalEmneIds,
    methodIds: report.methodIds,
    runtimePlaceIds: report.runtimePlaceIds,
    institutionCaseNames: report.institutionCaseNames,
    gates: report.gates
  };
}

export function auditPsykologiPsykiskHelsePhase4({ writeReport = false, checkReport = true } = {}) {
  for (const file of [P.pensum, P.methods, P.registry, P.status, P.chapter, P.brief, P.claims, ...MODULES]) {
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
  const chapterEmneIds = [...chapter.emne_ids];
  assert(canonicalEmneIds.length === 12, 'Canonicalt domene skal ha 12 emner');
  assert(isDeepStrictEqual(chapterEmneIds, canonicalEmneIds), 'Kapittelet dekker ikke canonicale emner i eksakt rekkefølge');
  assert(new Set(chapterEmneIds).size === 12, 'Kapittelet har dupliserte emner');

  const canonicalMethodIds = new Set(methodsDoc.methods.map((row) => row.method_id));
  assert(chapter.method_ids.length === 18, 'Kapittelet skal bruke 18 metoder');
  assert(new Set(chapter.method_ids).size === 18, 'Kapittelet har dupliserte metode-ID-er');
  assert(chapter.method_ids.every((id) => canonicalMethodIds.has(id)), 'Kapittelet peker til ukjent Psykologi-metode');

  assert(chapter.schema === 'history_go_fagverk_chapter_v1', 'Feil kapittelschema');
  assert(chapter.subject_id === 'psykologi' && chapter.subject === 'psykologi', 'Feil fag-ID');
  assert(chapter.chapter_id === CHAPTER_ID && chapter.id === CHAPTER_ID, 'Feil kapittel-ID');
  assert(chapter.primary_domain_id === DOMAIN_ID, 'Feil primærdomene');
  assert(chapter.editorialStatus === 'chapter_ready', 'Kapittelet er ikke chapter_ready');
  assert(chapter.claimTraceRequired === true, 'Claimspor er ikke obligatorisk');
  assert(chapter.doNotDiagnosePeople === true, 'Kapittelet mangler diagnosevern');
  assert(brief.safety?.doNotDiagnosePeople === true, 'Brief mangler diagnosevern');
  assert(brief.safety?.noIndividualTreatmentAdvice === true, 'Brief mangler vern mot individuell behandlingsrådgivning');
  assert(brief.safety?.noScreeningInterpretation === true, 'Brief mangler vern mot screeningtolkning');
  assert(claimsDoc.source_policy?.noDiagnosisOfIndividuals === true, 'Claims-policy mangler diagnosevern');
  assert(claimsDoc.source_policy?.noIndividualTreatmentAdvice === true, 'Claims-policy mangler behandlingsrådvern');
  assert(claimsDoc.source_policy?.legalClaimsRequireCurrentLegalSource === true, 'Claims-policy mangler krav om aktuell rettskilde');

  assert(modules.length === 3, 'Kapittelet må ha tre moduler');
  assert(isDeepStrictEqual(chapter.moduleFiles, MODULES), 'Kapittelwrapperen peker ikke til eksakt modulsett');
  const sections = modules.flatMap((module) => module.sections || []);
  assert(sections.length === 9, 'Kapittelet må ha ni seksjoner');
  const paragraphs = sections.flatMap((section) => section.paragraphs || []);
  const paragraphTraces = sections.flatMap((section) => section.paragraphClaimIds || []);
  assert(paragraphs.length === 27, 'Kapittelet må ha 27 fagavsnitt');
  assert(paragraphTraces.length === 27, 'Alle 27 fagavsnitt må ha claimspor');
  assert(paragraphTraces.every((ids) => Array.isArray(ids) && ids.length >= 1), 'Et fagavsnitt mangler claim-ID');
  assert(paragraphs.every((text) => typeof text === 'string' && text.length >= 180), 'Et fagavsnitt er for tynt');

  const sectionEmneIds = new Set(sections.flatMap((section) => section.emne_ids || []));
  assert(sectionEmneIds.size === 12, 'Seksjonene dekker feil antall emner');
  assert(canonicalEmneIds.every((id) => sectionEmneIds.has(id)), 'Et canonicalt emne mangler i seksjonene');
  assert([...sectionEmneIds].every((id) => canonicalEmneIds.includes(id)), 'Seksjonene introduserer ukjent emne');
  const sectionMethodIds = new Set(sections.flatMap((section) => section.method_ids || []));
  assert(sectionMethodIds.size === 18, 'Seksjonene bruker feil antall unike metoder');
  assert(chapter.method_ids.every((id) => sectionMethodIds.has(id)), 'En required metode brukes ikke i seksjonene');

  const sources = claimsDoc.sources || [];
  const claims = claimsDoc.claims || [];
  const sourceIds = new Set(sources.map((source) => source.id));
  const claimIds = new Set(claims.map((claim) => claim.id));
  const externalSources = sources.filter((source) => source.type !== 'internal_place_record');
  assert(sources.length >= 20, 'Kapittelet må ha minst 20 registrerte kilder');
  assert(externalSources.length >= 15, 'Kapittelet må ha minst 15 eksterne kilder');
  assert(claims.length >= 24, 'Kapittelet må ha minst 24 verifiserte claims');
  assert(sourceIds.size === sources.length, 'Dupliserte kilde-ID-er');
  assert(claimIds.size === claims.length, 'Dupliserte claim-ID-er');
  assert(sources.every((source) => source.id && source.publisher && source.title && source.url && source.source_location && source.label), 'Kilde mangler obligatorisk metadata');
  assert(externalSources.every((source) => /^https:\/\//.test(source.url)), 'Ekstern kilde mangler HTTPS-URL');
  assert(claims.every((claim) => Array.isArray(claim.source_ids) && claim.source_ids.length >= 1), 'Claim mangler kildepeker');
  assert(claims.every((claim) => claim.source_ids.every((id) => sourceIds.has(id))), 'Claim peker til ukjent kilde');
  assert(paragraphTraces.flat().every((id) => claimIds.has(id)), 'Fagavsnitt peker til ukjent claim');
  assert(REQUIRED_CURRENT_SOURCE_IDS.every((id) => sourceIds.has(id)), 'Gjeldende lov-/rettighetskilde mangler');
  assert(claimsDoc.source_policy?.verified_at === '2026-08-11', 'Kildeverifiseringsdato er ikke låst til produksjonsdato');

  const runtimePlaceIds = (chapter.relatedPlaces || []).map((place) => place.id);
  assert(isDeepStrictEqual(runtimePlaceIds, EXPECTED_RUNTIME_PLACE_IDS), 'Kapittelet har ukjent eller oppdiktet runtime-place-ID');
  const internalPlace = sources.find((source) => source.id === 'src-hg-uio-place');
  assert(internalPlace?.url === 'data/places/psykologi/oslo/places_psykologi/psykologisk_institutt_uio.json', 'UiO-place-kilden peker feil');
  assert(fs.existsSync(abs(internalPlace.url)), 'Canonicalt UiO-place mangler i repoet');
  const institutionCases = chapter.institutionCases || [];
  const institutionCaseNames = institutionCases.map((item) => item.name);
  assert(isDeepStrictEqual(institutionCaseNames, EXPECTED_CASE_NAMES), 'Institusjonscasene avviker fra låst case-sett');
  assert(institutionCases.every((item) => item.placeStatus === 'documented_case_not_runtime_place'), 'Institusjonscase later som runtime-sted');

  const registrySubject = registry.subjects?.psykologi;
  assert(registrySubject, 'Psykologi mangler i registry');
  const registryChapter = registrySubject.chapters?.find((item) => item.id === CHAPTER_ID);
  assert(registryChapter, 'Kapittelet mangler i registry');
  assert(registryChapter.file === P.chapter, 'Registry peker til feil kapittelfil');
  assert(registryChapter.primary_domain_id === DOMAIN_ID, 'Registry har feil domene');
  assert(isDeepStrictEqual(registryChapter.emne_ids, canonicalEmneIds), 'Registry har feil emneliste');
  assert(registryChapter.claimsFile === P.claims && registryChapter.briefFile === P.brief, 'Registry har feil brief/claims-peker');
  assert(registrySubject.editorialPlan?.targetChapterCount === 6, 'Psykologi mangler targetChapterCount=6');

  const statusEntry = status.subjects.find((item) => item.id === 'psykologi');
  assert(statusEntry?.navigationStatus === 'materialized', 'Psykologi mistet materialized-status');
  assert(statusEntry?.assessmentStatus === 'audited', 'Psykologi mistet audited strukturstatus');
  assert(statusEntry?.editorialStatus === 'chapters_in_progress', 'Psykologi må stå chapters_in_progress etter første kapittel');
  assert(statusEntry?.nextGate === 'remaining_domain_chapter_production', 'Psykologi har feil neste port');

  const forbiddenPatterns = [
    /du har (?:en|et) [a-zæøå-]+lidelse/i,
    /du er (?:deprimert|psykotisk|bipolar)/i,
    /testen viser at du/i,
    /du bør (?:starte|slutte|øke|redusere) (?:med )?(?:medisin|medikament)/i
  ];
  const editorialText = JSON.stringify({ chapter, brief, modules });
  assert(forbiddenPatterns.every((pattern) => !pattern.test(editorialText)), 'Kapittelet inneholder diagnostisk eller individualisert behandlingsspråk');

  const report = {
    schema: 'history_go_fagverk_psykologi_psykisk_helse_phase4_audit_v1',
    version: '1.0.0',
    status: 'psykologi_psykisk_helse_chapter_ready',
    generatedFrom: P,
    subject: {
      id: 'psykologi',
      editorialStatus: statusEntry.editorialStatus,
      nextGate: statusEntry.nextGate,
      registeredChapterCount: registrySubject.chapters.length,
      targetChapterCount: registrySubject.editorialPlan.targetChapterCount
    },
    chapter: {
      id: CHAPTER_ID,
      primaryDomainId: DOMAIN_ID,
      editorialStatus: chapter.editorialStatus,
      doNotDiagnosePeople: chapter.doNotDiagnosePeople
    },
    summary: {
      emneCount: chapterEmneIds.length,
      methodCount: chapter.method_ids.length,
      moduleCount: modules.length,
      sectionCount: sections.length,
      paragraphCount: paragraphs.length,
      claimCount: claims.length,
      sourceCount: sources.length,
      externalSourceCount: externalSources.length,
      runtimePlaceCount: runtimePlaceIds.length,
      institutionCaseCount: institutionCases.length
    },
    canonicalEmneIds,
    methodIds: chapter.method_ids,
    runtimePlaceIds,
    institutionCaseNames,
    gates: {
      exactCanonicalEmneCoverage: true,
      allMethodsCanonicalAndUsed: true,
      threeModulesNineSectionsTwentySevenParagraphs: true,
      paragraphClaimTraceComplete: true,
      minimumExternalSourcesMet: true,
      allClaimsSourceResolved: true,
      currentLegalSourcesPresent: true,
      doNotDiagnosePeopleGuardPresent: true,
      noIndividualTreatmentAdviceGuardPresent: true,
      noInventedRuntimePlaces: true,
      registrySynchronized: true,
      statusChaptersInProgress: true
    }
  };

  if (writeReport) {
    fs.mkdirSync(path.dirname(abs(P.report)), { recursive: true });
    fs.writeFileSync(abs(P.report), `${JSON.stringify(committedProjection(report), null, 2)}\n`);
  }
  if (checkReport) {
    assert(fs.existsSync(abs(P.report)), `${P.report} mangler. Kjør audit med --write-report`);
    const committed = readJson(P.report);
    assert(isDeepStrictEqual(committed, committedProjection(report)), `${P.report} er utdatert. Kjør audit med --write-report`);
  }
  return { report: committedProjection(report), chapter, brief, claimsDoc, modules };
}

function main() {
  const args = new Set(process.argv.slice(2));
  try {
    const result = auditPsykologiPsykiskHelsePhase4({
      writeReport: args.has('--write-report'),
      checkReport: !args.has('--no-check-report') && !args.has('--write-report')
    });
    console.log(`Psykologi Psykisk helse Phase 4 OK: ${result.report.summary.emneCount}/12 emner, ${result.report.summary.methodCount} metoder, ${result.report.summary.paragraphCount} avsnitt, ${result.report.summary.claimCount} claims og ${result.report.summary.externalSourceCount} eksterne kilder.`);
  } catch (error) {
    console.error(`Psykologi Psykisk helse Phase 4 FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
