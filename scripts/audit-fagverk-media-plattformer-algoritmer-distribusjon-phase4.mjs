#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { auditMediaPhase3 } from './audit-fagverk-media-phase3.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  chapter: 'data/fagverk/media/plattformer-algoritmer-og-distribusjon.json',
  brief: 'data/fagverk/media/plattformer-algoritmer-og-distribusjon/brief.json',
  claims: 'data/fagverk/media/plattformer-algoritmer-og-distribusjon/claims.json',
  registry: 'data/fagverk/fagverk_registry.json', status: 'data/fagverk/subject_status.json',
  emners: 'data/fag/media/emner_media_canonical_v4_5.json', methods: 'data/fag/media/methods_media_canonical_v4_5.json',
  places: 'data/places/places_index.json', report: 'reports/fagverk/media-plattformer-algoritmer-distribusjon-phase4-audit.json'
});
const EXPECTED_EMNES = [
  'em_media_algoritmisk_prioritering', 'em_media_annonsemodell', 'em_media_deling_viralitet',
  'em_media_digital_glemsel', 'em_media_digital_offentlighet', 'em_media_distribusjonsmakt',
  'em_media_feed_synlighet', 'em_media_informasjonsarkitektur', 'em_media_metrikk_klikk',
  'em_media_moderering', 'em_media_nettverkseffekt', 'em_media_nyhetstempo',
  'em_media_oppmerksomhetsokonomi', 'em_media_plattformavhengighet', 'em_media_plattformmakt',
  'em_media_plattformregler', 'em_media_publikumsdata', 'em_media_pushvarsel',
  'em_media_sok_finnbarhet', 'em_media_sokbar_hukommelse'
];
const EXPECTED_METHODS = [
  'met_media_feedanalyse', 'met_media_algoritmeanalyse', 'met_media_annonseanalyse',
  'met_media_oppmerksomhetsanalyse', 'met_media_delingsanalyse', 'met_media_viralitetsanalyse',
  'met_media_glemselsanalyse', 'met_media_hukommelsesanalyse', 'met_media_plattformanalyse',
  'met_media_digital_offentlighetsanalyse', 'met_media_avhengighetsanalyse', 'met_media_distribusjonsanalyse',
  'met_media_sokeanalyse', 'met_media_finnbarhetsanalyse', 'met_media_metrikkanalyse',
  'met_media_klikkonanalyse', 'met_media_modereringsanalyse', 'met_media_regelanalyse',
  'met_media_pushanalyse', 'met_media_tempoanalyse'
];
const EXPECTED_PLACES = ['vg_huset', 'fornebu_teknologipark', 'deichman_bjorvika', 'telegrafbygningen'];
const EXPECTED_CHAPTERS = [
  'presse-redaksjoner-og-avishus', 'offentlighet-ytringsfrihet-og-medieetikk',
  'kilder-kritikk-og-sannhet', 'plattformer-algoritmer-og-distribusjon'
];
const EXPECTED_DISTINCTIONS = [
  'transport vs rangering', 'nettnøytralitet vs plattformnøytralitet', 'algoritme vs autonom intensjon',
  'personalisering vs faktarelevans', 'anbefalingssignal vs forklaring av ett konkret treff',
  'indeksert vs synlig og høyt rangert', 'informasjonarkitektur vs søkealgoritme',
  'deling vs tilslutning', 'rekkevidde vs unike personer', 'broadcast vs strukturell viralitet',
  'moderering vs sensurdom', 'plattformregel vs lov', 'fjernet innhold vs falskt innhold',
  'annonse vs redaksjonelt innhold', 'publikumsdata vs komplett publikum', 'metrikk vs verdi',
  'klikk vs oppmerksomhet og tillit', 'direktekanal vs plattformavhengighet',
  'pushhastighet vs objektiv viktighet', 'tempo vs verifisering',
  'avindeksering vs sletting av kilde', 'rett til sletting vs absolutt glemsel',
  'arkivkopi vs søkbar hukommelse'
];
const abs = (p) => path.join(ROOT, p);
const json = (p) => JSON.parse(fs.readFileSync(abs(p), 'utf8'));
const assert = (ok, message) => { if (!ok) throw new Error(message); };

function committedProjection(report) {
  return {
    schema: report.schema, version: report.version, status: report.status, generatedFrom: report.generatedFrom,
    subject: report.subject, chapter: report.chapter, canonicalCoverage: report.canonicalCoverage,
    summary: report.summary, gates: report.gates
  };
}

export function auditMediaPlattformerAlgoritmerDistribusjonPhase4({ writeReport = false, checkReport = true } = {}) {
  const phase3 = auditMediaPhase3({ checkReport });
  const chapter = json(P.chapter);
  const brief = json(P.brief);
  const claimsDoc = json(P.claims);
  const registry = json(P.registry);
  const statusEntry = json(P.status).subjects.find((row) => row.id === 'media');
  const emners = json(P.emners);
  const methodsDoc = json(P.methods);
  const places = json(P.places);
  const registrySubject = registry.subjects.media;
  const registryChapter = registrySubject.chapters.find((row) => row.id === chapter.id);

  assert(chapter.schema === 'history_go_fagverk_chapter_v1', 'Kapittelet har feil schema');
  assert(chapter.subject === 'media' && chapter.subject_id === 'media', 'Kapittelet har feil fag');
  assert(chapter.primary_domain_id === 'plattformer_algoritmer_distribusjon', 'Kapittelet har feil eierdomene');
  assert(chapter.editorialStatus === 'chapter_ready' && chapter.claimTraceRequired === true, 'Kapittelet er ikke claimsporet chapter_ready');
  assert(isDeepStrictEqual(chapter.emne_ids, EXPECTED_EMNES) && new Set(chapter.emne_ids).size === 20, 'Kapittelet dekker ikke eksakt 20/20 canonicale emner');
  assert(isDeepStrictEqual(chapter.method_ids, EXPECTED_METHODS) && new Set(chapter.method_ids).size === 20, 'Kapittelet dekker ikke eksakt 20 canonicale metoder');
  assert(isDeepStrictEqual(registrySubject.chapters.map((row) => row.id), EXPECTED_CHAPTERS), 'Media-registeret har feil kapittelrekkefølge');
  assert(registryChapter?.file === P.chapter && registryChapter.primary_domain_id === chapter.primary_domain_id, 'Registry-kapittelet er usynkronisert');
  assert(isDeepStrictEqual(registryChapter.emne_ids, EXPECTED_EMNES), 'Registry-emnene er usynkronisert');
  assert(statusEntry.editorialStatus === 'chapters_in_progress', 'Media må fortsatt stå chapters_in_progress');
  assert(statusEntry.nextGate === 'remaining_domain_chapter_production', 'Media har feil neste produksjonsport');
  assert(phase3.report.summary.domainCount === 6 && phase3.report.summary.emneCount === 120, 'Media-baseline er ikke bevart');
  assert(phase3.report.summary.registeredChapterCount === 4, 'Fase 3-auditen ser ikke alle fire Media-kapitlene');
  assert(phase3.report.nestedSupplement.emneCount === 56 && phase3.report.nestedSupplement.topLevelSubject === false, 'Nested Populærkultur er ikke bevart');
  assert(EXPECTED_CHAPTERS.slice(0, 3).every((id, index) => registrySubject.chapters[index].id === id), 'Tidligere Media-kapitler er ikke bevart');

  const canonicalEmneIds = new Set(emners.map((row) => row.emne_id));
  const canonicalMethodIds = new Set(methodsDoc.methods.map((row) => row.method_id));
  assert(EXPECTED_EMNES.every((id) => canonicalEmneIds.has(id)), 'Kapittelet peker til ukjent Media-emne');
  assert(EXPECTED_METHODS.every((id) => canonicalMethodIds.has(id)), 'Kapittelet peker til ukjent Media-metode');
  const domain = phase3.model.domainsById.get('plattformer_algoritmer_distribusjon');
  assert(domain && isDeepStrictEqual([...domain.emneIds], EXPECTED_EMNES), 'Canonical domeneeierskap er usynkronisert');
  assert(brief.schema === 'history_go_fagverk_chapter_brief_v1' && brief.chapter_id === chapter.id, 'Briefen er usynkronisert');
  assert(isDeepStrictEqual(brief.requiredEmneIds, EXPECTED_EMNES), 'Briefen har feil emnedekning');
  assert(isDeepStrictEqual(brief.requiredMethodIds, EXPECTED_METHODS), 'Briefen har feil metodedekning');
  assert(isDeepStrictEqual(brief.requiredCriticalDistinctions, EXPECTED_DISTINCTIONS), 'Briefen mangler et kritisk fagskille');
  assert(brief.sourceStrategy.minimumExternalSources >= 18 && brief.sourceStrategy.claimLevelTrace === true && brief.sourceStrategy.sourceLocationsRequired === true, 'Briefens kildestrategi er for svak');
  assert(isDeepStrictEqual(brief.relatedPlaceIds, EXPECTED_PLACES), 'Briefen har feil canonicale stedscase');
  const knownPlaceIds = new Set(places.map((row) => row.id));
  assert(EXPECTED_PLACES.every((id) => knownPlaceIds.has(id)), 'Briefen peker til ukjent sted');
  assert(isDeepStrictEqual(chapter.relatedPlaces.map((row) => row.id), EXPECTED_PLACES), 'Kapittelpayloaden mangler canonicale stedscase');
  assert(chapter.relatedPlaces.every((row) => row.name && row.role), 'Et runtime-stedscase mangler navn eller rolle');

  const modules = chapter.moduleFiles.map((file) => ({ file, value: json(file) }));
  const sections = modules.flatMap(({ value }) => value.sections || []);
  assert(modules.length === 3 && sections.length === 9, 'Kapittelet skal ha tre moduler og ni seksjoner');
  assert(sections.every((row) => row.paragraphs.length === 3), 'Hver seksjon skal ha tre fagavsnitt');
  assert(sections.every((row) => row.paragraphClaimIds.length === row.paragraphs.length), 'Avsnitt og claimspor er usynkronisert');
  assert(sections.every((row) => row.paragraphClaimIds.every((ids) => Array.isArray(ids) && ids.length >= 1)), 'Et fagavsnitt mangler claimspor');
  assert(sections.every((row) => row.keyPoints.length >= 2 && row.keyPointClaimIds.length === row.keyPoints.length), 'Nøkkelpunkter er ikke claimsporet');
  assert(modules[0].value.concepts.length === 6, 'Grunnlagsmodulen skal ha seks begreper');
  assert(modules[1].value.workedExamples.length === 3, 'Fordypningsmodulen skal ha tre eksempler');
  assert(modules[1].value.commonMisconceptions.length === 5, 'Fordypningsmodulen skal ha fem misoppfatninger');
  assert(modules[1].value.commonMisconceptions.every((row) => row.claim && row.correction), 'En misoppfatning er ikke renderbar');
  assert(modules[2].value.applicationTasks.length === 5, 'Anvendelsesmodulen skal ha fem oppgaver');
  assert(modules[2].value.selfCheck.length === 7, 'Anvendelsesmodulen skal ha sju selvkontroller');

  assert(claimsDoc.schema === 'history_go_fagverk_chapter_claims_v1' && claimsDoc.chapter_id === chapter.id, 'Claims-filen er usynkronisert');
  assert(claimsDoc.sources.length === 20 && claimsDoc.claims.length === 27, 'Kapittelet skal ha 20 kilder og 27 claims');
  const sourceIds = new Set(claimsDoc.sources.map((row) => row.id));
  const claimIds = new Set(claimsDoc.claims.map((row) => row.id));
  const sectionIds = new Set(sections.map((row) => row.id));
  assert(sourceIds.size === 20 && claimIds.size === 27, 'Kilde- eller claim-ID er duplisert');
  assert(claimsDoc.sources.every((row) => /^https:\/\//.test(row.url) && row.label && row.publisher && row.title && row.source_location?.length >= 30 && row.type), 'En kilde er ikke inspiserbar eller presist lokalisert');
  assert(claimsDoc.claims.every((row) => row.status === 'verified'), 'En claim er ikke verifisert');
  assert(claimsDoc.claims.every((row) => row.source_ids.length >= 1 && row.source_ids.every((id) => sourceIds.has(id))), 'En claim har uløst kilde');
  assert(claimsDoc.claims.every((row) => row.used_in.length >= 1 && row.used_in.every((id) => sectionIds.has(id))), 'En claim har ugyldig used_in');
  const usedSourceIds = new Set(claimsDoc.claims.flatMap((row) => row.source_ids));
  assert([...sourceIds].every((id) => usedSourceIds.has(id)), 'En registrert kilde brukes ikke');
  const referencedClaimIds = new Set(sections.flatMap((row) => [...row.paragraphClaimIds, ...row.keyPointClaimIds].flat()));
  assert([...referencedClaimIds].every((id) => claimIds.has(id)) && [...claimIds].every((id) => referencedClaimIds.has(id)), 'Claimbruk og claimregister er usynkronisert');

  const report = {
    schema: 'history_go_fagverk_media_plattformer_algoritmer_distribusjon_phase4_audit_v1', version: '1.0.0',
    status: 'media_plattformer_algoritmer_distribusjon_canonical_20_of_20', generatedFrom: P,
    subject: {
      id: 'media', canonicalDomainCount: 6, canonicalEmneCount: 120, registeredChapterCount: 4,
      editorialStatus: statusEntry.editorialStatus, nextGate: statusEntry.nextGate,
      nestedPopularCultureEmneCount: 56
    },
    chapter: {
      id: chapter.id, title: chapter.title, primaryDomainId: chapter.primary_domain_id,
      moduleFiles: chapter.moduleFiles, briefFile: chapter.briefFile, claimsFile: chapter.claimsFile,
      relatedPlaceIds: chapter.relatedPlaces.map((row) => row.id)
    },
    canonicalCoverage: {
      ownerDomainId: 'plattformer_algoritmer_distribusjon', requiredEmneIds: EXPECTED_EMNES,
      coveredEmneIds: chapter.emne_ids, exactCoverage: '20/20', coveredSubjectEmneCount: 82,
      totalSubjectEmneCount: 120, remainingDomainCount: 2
    },
    summary: {
      moduleCount: 3, sectionCount: 9, paragraphCount: 27, conceptCount: 6,
      workedExampleCount: 3, misconceptionCount: 5, applicationTaskCount: 5,
      selfCheckCount: 7, methodCount: 20, sourceCount: 20, claimCount: 27, placeCaseCount: 4,
      criticalDistinctionCount: EXPECTED_DISTINCTIONS.length
    },
    gates: {
      canonicalOwnerDomain: true, exactTwentyOfTwentyEmneCoverage: true, allMethodReferencesResolved: true,
      threeEditedModules: true, paragraphLevelClaimTrace: true, allClaimsVerifiedAndUsed: true,
      allSourcesUsedAndPreciselyLocated: true, canonicalPlacesResolved: true, chapterSourcesRenderable: true,
      chapterPlacesRenderable: true, misconceptionsRenderable: true, allCriticalDistinctionsLocked: true,
      previousMediaChaptersPreserved: true, nestedPopularCulturePreserved: true,
      incompleteSubjectStatusHonest: true, releaseReady: true
    }
  };
  const committed = committedProjection(report);
  if (writeReport) {
    fs.mkdirSync(path.dirname(abs(P.report)), { recursive: true });
    fs.writeFileSync(abs(P.report), JSON.stringify(committed, null, 2) + '\n');
  }
  if (checkReport) assert(isDeepStrictEqual(json(P.report), committed), P.report + ' er utdatert');
  return { report, chapter, brief, claimsDoc, modules: modules.map((row) => row.value) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const { report } = auditMediaPlattformerAlgoritmerDistribusjonPhase4({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Media Plattformer, algoritmer og distribusjon OK: ${report.canonicalCoverage.exactCoverage} emner, ${report.summary.paragraphCount} avsnitt, ${report.summary.claimCount} claims og ${report.summary.sourceCount} kilder.`);
  } catch (error) {
    console.error(`Media Plattformer, algoritmer og distribusjon FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
