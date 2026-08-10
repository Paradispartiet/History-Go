#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { auditKunstPhase3 } from './audit-fagverk-kunst-phase3.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  chapter: 'data/fagverk/kunst/produksjon-og-praksis.json',
  brief: 'data/fagverk/kunst/produksjon-og-praksis/brief.json',
  claims: 'data/fagverk/kunst/produksjon-og-praksis/claims.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  emners: 'data/fag/kunst/emner_kunst_canonical_v4_5.json',
  methods: 'data/fag/kunst/methods_kunst_canonical_v4_5.json',
  places: 'data/places/places_index.json',
  report: 'reports/fagverk/kunst-produksjon-praksis-phase4-audit.json'
});
const EXPECTED_EMNES = [
  'em_kunst_undergrunn_selvorganisert',
  'em_kunst_arbeidsformer_og_prosess',
  'em_kunst_teknologi_og_materialitet',
  'em_kunst_materialitet_teknikk_handverk',
  'em_kunst_kunstnerokonomi_og_prekaritet'
];
const EXPECTED_PLACES = ['edvard_munchs_atelier_ekely', 'kunsthall_oslo', 'hausmania', 'kunstnernes_hus'];
const abs = (p) => path.join(ROOT, p);
const read = (p) => fs.readFileSync(abs(p), 'utf8');
const json = (p) => JSON.parse(read(p));
const assert = (ok, message) => { if (!ok) throw new Error(message); };

function committedProjection(report) {
  return {
    schema: report.schema,
    version: report.version,
    status: report.status,
    generatedFrom: report.generatedFrom,
    subject: report.subject,
    chapter: report.chapter,
    canonicalCoverage: report.canonicalCoverage,
    summary: report.summary,
    gates: report.gates
  };
}

export function auditKunstProduksjonPraksisPhase4({ writeReport = false, checkReport = true } = {}) {
  const phase3 = auditKunstPhase3({ checkReport });
  const chapter = json(P.chapter);
  const brief = json(P.brief);
  const claimsDoc = json(P.claims);
  const registry = json(P.registry);
  const status = json(P.status);
  const emners = json(P.emners);
  const methodsDoc = json(P.methods);
  const places = json(P.places);
  const statusEntry = status.subjects.find((row) => row.id === 'kunst');
  const registrySubject = registry.subjects.kunst;
  const registryChapter = registrySubject.chapters.find((row) => row.id === chapter.id);

  assert(chapter.schema === 'history_go_fagverk_chapter_v1', 'Kunst-kapittelet har feil schema');
  assert(chapter.subject === 'kunst' && chapter.subject_id === 'kunst', 'Kunst-kapittelet har feil fag');
  assert(chapter.primary_domain_id === 'produksjon_praksis', 'Kapittelet har feil eierdomene');
  assert(chapter.editorialStatus === 'chapter_ready' && chapter.claimTraceRequired === true, 'Kapittelet er ikke claimsporet chapter_ready');
  assert(isDeepStrictEqual(chapter.emne_ids, EXPECTED_EMNES), 'Kapittelet dekker ikke de fem canonicale emnene i riktig rekkefølge');
  assert(new Set(chapter.emne_ids).size === 5, 'Kunst-kapittelet har duplikate emner');
  assert(registrySubject.chapters.length === 3 && registryChapter, 'Kunst-registeret skal ha nøyaktig tre kapitler');
  assert(registryChapter.file === P.chapter && registryChapter.primary_domain_id === 'produksjon_praksis', 'Registry-kapittelet er usynkronisert');
  assert(isDeepStrictEqual(registryChapter.emne_ids, EXPECTED_EMNES), 'Registry-emnene er usynkronisert');
  assert(statusEntry.editorialStatus === 'chapters_in_progress', 'Kunst kan ikke stå complete etter tre av seks domener');
  assert(statusEntry.nextGate === 'remaining_domain_chapter_production', 'Kunst har feil neste port');
  assert(phase3.report.summary.domainCount === 6 && phase3.report.summary.emneCount === 21, 'Kunst-baseline er ikke bevart');
  assert(phase3.report.summary.registeredChapterCount === 3, 'Fase 3-auditen ser ikke alle tre kapitlene');

  const canonicalEmneIds = new Set(emners.map((row) => row.emne_id));
  assert(EXPECTED_EMNES.every((id) => canonicalEmneIds.has(id)), 'Kapittelet peker til ukjent Kunst-emne');
  const domain = phase3.model.domainsById.get('produksjon_praksis');
  assert(domain && isDeepStrictEqual([...domain.emneIds], EXPECTED_EMNES), 'Canonical domeneeierskap er usynkronisert');
  const canonicalMethodIds = new Set(methodsDoc.methods.map((row) => row.method_id));
  assert(chapter.method_ids.length === 9 && chapter.method_ids.every((id) => canonicalMethodIds.has(id)), 'Kapittelet har uløst metode-ID');

  assert(brief.schema === 'history_go_fagverk_chapter_brief_v1' && brief.chapter_id === chapter.id, 'Briefen er usynkronisert');
  assert(isDeepStrictEqual(brief.requiredEmneIds, EXPECTED_EMNES), 'Briefen har feil emnedekning');
  assert(brief.sourceStrategy.minimumExternalSources >= 15 && brief.sourceStrategy.claimLevelTrace === true, 'Briefens kildestrategi er for svak');
  assert(isDeepStrictEqual(brief.relatedPlaceIds, EXPECTED_PLACES), 'Briefen har feil canonicale stedscase');
  const knownPlaceIds = new Set(places.map((row) => row.id));
  assert(EXPECTED_PLACES.every((id) => knownPlaceIds.has(id)), 'Briefen peker til ukjent sted');
  assert(isDeepStrictEqual(chapter.relatedPlaces.map((row) => row.id), EXPECTED_PLACES), 'Kapittelpayloaden mangler canonicale stedscase');
  assert(chapter.relatedPlaces.every((row) => row.name && row.role), 'Et runtime-stedscase mangler navn eller rolle');

  const modules = chapter.moduleFiles.map((file) => ({ file, value: json(file) }));
  assert(modules.length === 3, 'Kapittelet skal ha tre moduler');
  const sections = modules.flatMap(({ value }) => value.sections || []);
  assert(sections.length === 9, 'Kapittelet skal ha ni redigerte seksjoner');
  assert(sections.every((item) => item.paragraphs.length === 3), 'Hver seksjon skal ha tre fagavsnitt');
  assert(sections.every((item) => item.paragraphClaimIds.length === item.paragraphs.length), 'Avsnitt og claimspor er usynkronisert');
  assert(sections.every((item) => item.paragraphClaimIds.every((ids) => Array.isArray(ids) && ids.length >= 1)), 'Et fagavsnitt mangler claimspor');
  assert(sections.every((item) => item.keyPoints.length >= 2 && item.keyPointClaimIds.length === item.keyPoints.length), 'Seksjonens nøkkelpunkter er ikke claimsporet');
  assert(modules[0].value.concepts.length === 6, 'Grunnlagsmodulen skal ha seks begreper');
  assert(modules[1].value.workedExamples.length === 3, 'Fordypningsmodulen skal ha tre gjennomarbeidede eksempler');
  assert(modules[1].value.commonMisconceptions.length === 5, 'Fordypningsmodulen skal ha fem misoppfatninger');
  assert(modules[1].value.commonMisconceptions.every((row) => row.claim && row.correction), 'En misoppfatning kan ikke rendres med claim og correction');
  assert(modules[2].value.applicationTasks.length === 5, 'Anvendelsesmodulen skal ha fem oppgaver');
  assert(modules[2].value.selfCheck.length === 7, 'Anvendelsesmodulen skal ha sju selvkontroller');

  assert(claimsDoc.schema === 'history_go_fagverk_chapter_claims_v1' && claimsDoc.chapter_id === chapter.id, 'Claims-filen er usynkronisert');
  assert(claimsDoc.sources.length === 16, 'Kapittelet skal ha 16 kilder');
  assert(claimsDoc.claims.length === 23, 'Kapittelet skal ha 23 claims');
  const sourceIds = new Set(claimsDoc.sources.map((row) => row.id));
  const claimIds = new Set(claimsDoc.claims.map((row) => row.id));
  const sectionIds = new Set(sections.map((row) => row.id));
  assert(sourceIds.size === claimsDoc.sources.length && claimIds.size === claimsDoc.claims.length, 'Kilde- eller claim-ID er duplisert');
  assert(claimsDoc.sources.every((row) => /^https:\/\//.test(row.url) && row.label && row.publisher && row.title && row.source_location && row.type), 'En kilde er ikke inspectable eller renderbar');
  assert(claimsDoc.claims.every((row) => row.status === 'verified'), 'En claim er ikke verifisert');
  assert(claimsDoc.claims.every((row) => row.source_ids.length >= 1 && row.source_ids.every((id) => sourceIds.has(id))), 'En claim har uløst kilde');
  assert(claimsDoc.claims.every((row) => row.used_in.length >= 1 && row.used_in.every((id) => sectionIds.has(id))), 'En claim har ugyldig used_in');
  const referencedClaimIds = new Set(sections.flatMap((row) => [...row.paragraphClaimIds, ...row.keyPointClaimIds].flat()));
  assert([...referencedClaimIds].every((id) => claimIds.has(id)), 'Modulene peker til ukjent claim');
  assert([...claimIds].every((id) => referencedClaimIds.has(id)), 'En verifisert claim brukes ikke i kapittelet');

  const combined = JSON.stringify({ chapter, brief, modules: modules.map((row) => row.value) });
  assert(/ferdig.{0,80}prosess|prosess.{0,80}ferdig/is.test(combined), 'Ferdig verk/prosess-vakten mangler');
  assert(/material.{0,100}(ikke automatisk|ikke.*alene|kontekst)|ikke automatisk.{0,100}material/is.test(combined), 'Materialbetydning-vakten mangler');
  assert(/selvorganiser.{0,120}(regler|arbeid|dugnad)|(?:regler|arbeid|dugnad).{0,120}selvorganiser/is.test(combined), 'Selvorganisering/arbeid-vakten mangler');
  assert(/(?:støtte|honorar).{0,120}(ikke.*effekt|effekt.*krever)|effekt.{0,120}(?:støtte|honorar)/is.test(combined), 'Finansiering/effekt-vakten mangler');

  const report = {
    schema: 'history_go_fagverk_kunst_produksjon_praksis_phase4_audit_v1',
    version: '1.0.0',
    status: 'kunst_produksjon_praksis_canonical_5_of_5',
    generatedFrom: P,
    subject: {
      id: 'kunst',
      canonicalDomainCount: phase3.report.summary.domainCount,
      canonicalEmneCount: phase3.report.summary.emneCount,
      registeredChapterCount: registrySubject.chapters.length,
      editorialStatus: statusEntry.editorialStatus,
      nextGate: statusEntry.nextGate
    },
    chapter: {
      id: chapter.id,
      title: chapter.title,
      primaryDomainId: chapter.primary_domain_id,
      moduleFiles: chapter.moduleFiles,
      briefFile: chapter.briefFile,
      claimsFile: chapter.claimsFile,
      relatedPlaceIds: chapter.relatedPlaces.map((row) => row.id)
    },
    canonicalCoverage: {
      ownerDomainId: 'produksjon_praksis',
      requiredEmneIds: EXPECTED_EMNES,
      coveredEmneIds: chapter.emne_ids,
      exactCoverage: '5/5',
      remainingDomainCount: 3
    },
    summary: {
      moduleCount: modules.length,
      sectionCount: sections.length,
      paragraphCount: sections.reduce((sum, row) => sum + row.paragraphs.length, 0),
      conceptCount: modules[0].value.concepts.length,
      workedExampleCount: modules[1].value.workedExamples.length,
      misconceptionCount: modules[1].value.commonMisconceptions.length,
      applicationTaskCount: modules[2].value.applicationTasks.length,
      selfCheckCount: modules[2].value.selfCheck.length,
      methodCount: chapter.method_ids.length,
      sourceCount: claimsDoc.sources.length,
      claimCount: claimsDoc.claims.length,
      placeCaseCount: chapter.relatedPlaces.length
    },
    gates: {
      canonicalOwnerDomain: true,
      exactFiveOfFiveEmneCoverage: true,
      allMethodReferencesResolved: true,
      threeEditedModules: true,
      paragraphLevelClaimTrace: true,
      allClaimsVerifiedAndUsed: true,
      inspectablePrimarySources: true,
      canonicalPlacesResolved: true,
      chapterSourcesRenderable: true,
      chapterPlacesRenderable: true,
      misconceptionsRenderable: true,
      finishedWorkProcessGuard: true,
      materialMeaningGuard: true,
      selfOrganizationLaborGuard: true,
      fundingPaymentEffectGuard: true,
      previousKunstStructurePreserved: true,
      incompleteSubjectStatusHonest: true,
      releaseReady: true
    }
  };
  const committed = committedProjection(report);
  if (writeReport) {
    fs.mkdirSync(path.dirname(abs(P.report)), { recursive: true });
    fs.writeFileSync(abs(P.report), `${JSON.stringify(committed, null, 2)}\n`);
  }
  if (checkReport) assert(isDeepStrictEqual(json(P.report), committed), `${P.report} er utdatert`);
  return { report, chapter, brief, claimsDoc, modules: modules.map((row) => row.value) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const { report } = auditKunstProduksjonPraksisPhase4({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Kunst Produksjon og praksis OK: ${report.canonicalCoverage.exactCoverage} emner, ${report.summary.paragraphCount} avsnitt, ${report.summary.claimCount} claims og ${report.summary.sourceCount} kilder.`);
  } catch (error) {
    console.error(`Kunst Produksjon og praksis FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
