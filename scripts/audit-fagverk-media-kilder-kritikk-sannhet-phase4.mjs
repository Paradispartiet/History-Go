#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { auditMediaPhase3 } from './audit-fagverk-media-phase3.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  chapter: 'data/fagverk/media/kilder-kritikk-og-sannhet.json',
  brief: 'data/fagverk/media/kilder-kritikk-og-sannhet/brief.json',
  claims: 'data/fagverk/media/kilder-kritikk-og-sannhet/claims.json',
  firstChapter: 'data/fagverk/media/presse-redaksjoner-og-avishus.json',
  secondChapter: 'data/fagverk/media/offentlighet-ytringsfrihet-og-medieetikk.json',
  registry: 'data/fagverk/fagverk_registry.json', status: 'data/fagverk/subject_status.json',
  emners: 'data/fag/media/emner_media_canonical_v4_5.json', methods: 'data/fag/media/methods_media_canonical_v4_5.json',
  places: 'data/places/places_index.json', report: 'reports/fagverk/media-kilder-kritikk-sannhet-phase4-audit.json'
});
const EXPECTED_EMNES = [
  'em_media_arkiv_og_bevis', 'em_media_autoritet_i_media', 'em_media_balanse_og_sannhet',
  'em_media_datajournalistikk', 'em_media_desinformasjon', 'em_media_diskurs_makt',
  'em_media_dokumentasjon', 'em_media_ekspertkilder', 'em_media_etterprovbarhet',
  'em_media_faktasjekk', 'em_media_feilinformasjon', 'em_media_framing',
  'em_media_innramming', 'em_media_kildekritikk', 'em_media_nyhetsdiskurs',
  'em_media_nyhetsverdi', 'em_media_objektivitet_journalistikk',
  'em_media_redaksjonell_prioritering', 'em_media_statistikk_og_offentlighet', 'em_media_verifisering'
];
const EXPECTED_METHODS = [
  'met_media_dokumentasjonsanalyse', 'met_media_arkivanalyse', 'met_media_ekspertkildeanalyse',
  'met_media_autoritetsanalyse', 'met_media_objektivitetsanalyse', 'met_media_balanseanalyse',
  'met_media_datajournalistisk_analyse', 'met_media_statistikkanalyse',
  'met_media_feilinformasjonsanalyse', 'met_media_desinformasjonsanalyse',
  'met_media_diskursanalyse', 'met_media_maktanalyse', 'met_media_kildekritisk_analyse',
  'met_media_etterprovbarhetsanalyse', 'met_media_faktasjekkanalyse',
  'met_media_verifiseringsanalyse', 'met_media_framinganalyse', 'met_media_innrammingsanalyse',
  'met_media_nyhetsverdianalyse', 'met_media_prioriteringsanalyse'
];
const EXPECTED_PLACES = ['nasjonalbiblioteket', 'universitetet_i_oslo_blindern', 'oslo_radhus', 'nrk_huset_marienlyst'];
const EXPECTED_CHAPTERS = [
  'presse-redaksjoner-og-avishus',
  'offentlighet-ytringsfrihet-og-medieetikk',
  'kilder-kritikk-og-sannhet',
  'plattformer-algoritmer-og-distribusjon',
  'propaganda-pavirkning-og-informasjonskrig'
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

export function auditMediaKilderKritikkSannhetPhase4({ writeReport = false, checkReport = true } = {}) {
  const phase3 = auditMediaPhase3({ checkReport });
  const chapter = json(P.chapter);
  const brief = json(P.brief);
  const claimsDoc = json(P.claims);
  const firstChapter = json(P.firstChapter);
  const secondChapter = json(P.secondChapter);
  const registry = json(P.registry);
  const status = json(P.status);
  const emners = json(P.emners);
  const methodsDoc = json(P.methods);
  const places = json(P.places);
  const registrySubject = registry.subjects.media;
  const statusEntry = status.subjects.find((row) => row.id === 'media');
  const registryChapter = registrySubject.chapters.find((row) => row.id === chapter.id);

  assert(chapter.schema === 'history_go_fagverk_chapter_v1', 'Kapittelet har feil schema');
  assert(chapter.subject === 'media' && chapter.subject_id === 'media', 'Kapittelet har feil fag');
  assert(chapter.primary_domain_id === 'kilder_kritikk_sannhet', 'Kapittelet har feil eierdomene');
  assert(chapter.editorialStatus === 'chapter_ready' && chapter.claimTraceRequired === true, 'Kapittelet er ikke claimsporet chapter_ready');
  assert(isDeepStrictEqual(chapter.emne_ids, EXPECTED_EMNES) && new Set(chapter.emne_ids).size === 20, 'Kapittelet dekker ikke eksakt 20/20 canonicale emner');
  assert(isDeepStrictEqual(chapter.method_ids, EXPECTED_METHODS) && new Set(chapter.method_ids).size === 20, 'Kapittelet dekker ikke eksakt 20 canonicale metoder');
  assert(isDeepStrictEqual(registrySubject.chapters.map((row) => row.id), EXPECTED_CHAPTERS), 'Media-registeret har feil kapittelrekkefølge');
  assert(registryChapter?.file === P.chapter && registryChapter.primary_domain_id === chapter.primary_domain_id, 'Registry-kapittelet er usynkronisert');
  assert(isDeepStrictEqual(registryChapter.emne_ids, EXPECTED_EMNES), 'Registry-emnene er usynkronisert');
  assert(firstChapter.primary_domain_id === 'presse_redaksjoner_avishus' && firstChapter.emne_ids.length === 21, 'Første Media-kapittel er ikke bevart');
  assert(secondChapter.primary_domain_id === 'offentlighet_ytringsfrihet_etikk' && secondChapter.emne_ids.length === 21, 'Andre Media-kapittel er ikke bevart');
  assert(statusEntry.editorialStatus === 'chapters_in_progress', 'Media må fortsatt stå chapters_in_progress');
  assert(statusEntry.nextGate === 'remaining_domain_chapter_production', 'Media har feil neste produksjonsport');
  assert(phase3.report.summary.domainCount === 6 && phase3.report.summary.emneCount === 120, 'Media-baseline er ikke bevart');
  assert(phase3.report.summary.registeredChapterCount === 5, 'Fase 3-auditen ser ikke alle fem Media-kapitlene');
  assert(phase3.report.nestedSupplement.emneCount === 56 && phase3.report.nestedSupplement.topLevelSubject === false, 'Nested Populærkultur er ikke bevart');

  const canonicalEmneIds = new Set(emners.map((row) => row.emne_id));
  const canonicalMethodIds = new Set(methodsDoc.methods.map((row) => row.method_id));
  assert(EXPECTED_EMNES.every((id) => canonicalEmneIds.has(id)), 'Kapittelet peker til ukjent Media-emne');
  assert(EXPECTED_METHODS.every((id) => canonicalMethodIds.has(id)), 'Kapittelet peker til ukjent Media-metode');
  assert(isDeepStrictEqual(brief.requiredEmneIds, EXPECTED_EMNES), 'Briefen har feil emnedekning');
  assert(isDeepStrictEqual(brief.requiredMethodIds, EXPECTED_METHODS), 'Briefen har feil metodedekning');
  assert(brief.sourceStrategy.minimumExternalSources >= 18 && brief.sourceStrategy.claimLevelTrace === true, 'Briefens kildestrategi er for svak');
  assert(isDeepStrictEqual(brief.relatedPlaceIds, EXPECTED_PLACES), 'Briefen har feil canonicale stedscase');
  const knownPlaceIds = new Set(places.map((row) => row.id));
  assert(EXPECTED_PLACES.every((id) => knownPlaceIds.has(id)), 'Briefen peker til ukjent sted');
  assert(isDeepStrictEqual(chapter.relatedPlaces.map((row) => row.id), EXPECTED_PLACES), 'Kapittelpayloaden mangler canonicale stedscase');
  assert(chapter.relatedPlaces.every((row) => row.name && row.role), 'Et runtime-stedscase mangler navn eller rolle');

  const modules = chapter.moduleFiles.map((file) => ({ file, value: json(file) }));
  const sections = modules.flatMap(({ value }) => value.sections || []);
  assert(modules.length === 3, 'Kapittelet skal ha tre moduler');
  assert(sections.length === 9, 'Kapittelet skal ha ni redigerte seksjoner');
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
  assert(claimsDoc.sources.every((row) => /^https:\/\//.test(row.url) && row.label && row.publisher && row.title && row.source_location?.length >= 30 && row.type), 'En kilde er ikke inspiserbar eller renderbar');
  assert(claimsDoc.claims.every((row) => row.status === 'verified'), 'En claim er ikke verifisert');
  assert(claimsDoc.claims.every((row) => row.source_ids.length >= 1 && row.source_ids.every((id) => sourceIds.has(id))), 'En claim har uløst kilde');
  assert(claimsDoc.claims.every((row) => row.used_in.length >= 1 && row.used_in.every((id) => sectionIds.has(id))), 'En claim har ugyldig used_in');
  const usedSourceIds = new Set(claimsDoc.claims.flatMap((row) => row.source_ids));
  assert([...sourceIds].every((id) => usedSourceIds.has(id)), 'En registrert kilde brukes ikke');
  const referencedClaimIds = new Set(sections.flatMap((row) => [...row.paragraphClaimIds, ...row.keyPointClaimIds].flat()));
  assert([...referencedClaimIds].every((id) => claimIds.has(id)) && [...claimIds].every((id) => referencedClaimIds.has(id)), 'Claimbruk og claimregister er usynkronisert');

  const combined = JSON.stringify({ chapter, brief, modules: modules.map((row) => row.value) });
  const distinctionGuards = [
    /primærkilde.{0,180}(ikke|men).{0,120}(sannhet|korrekt)/is,
    /nærhet.{0,100}ikke.{0,100}(nøytral|korrekt)/is,
    /navngitt kilde.{0,220}ikke uavhengig verifisering/is,
    /ikke faktasjekker.{0,100}(ufeilbarlige|tidsløse)/is,
    /tre artikler.{0,200}én avhengig kjede/is,
    /framing finnes.{0,120}korrekte/is,
    /forskjellen beviser ikke.{0,120}(fabrikasjon|skjult agenda)/is,
    /intensjon.{0,120}ikke.{0,140}tekst/is,
    /maktpåstand.{0,200}(flere saker|tidsrom)/is,
    /nyhetsverdi.{0,220}ikke.{0,120}(viktigst|sant|sannhet)/is,
    /fravær.{0,160}ikke alene bevis på sensur/is,
    /objektivitet.{0,160}kontrollerbare prosedyrer/is,
    /balanse.{0,180}ikke automatisk lik taletid/is,
    /tittel og institusjon.{0,160}ikke sannhetsgarantier/is,
    /én ekspert.{0,160}ikke automatisk faglig konsensus/is,
    /sammenheng.{0,140}ikke årsak/is,
    /grafikken er en transformasjon/is,
    /revideres.{0,160}ikke.{0,100}manipulasjon/is,
    /feilinformasjon.{0,220}uten bevisst bedrag.{0,220}desinformasjon.{0,220}med vilje/is,
    /arkivstatus er ikke et sannhetsstempel/is,
    /ekte dokument kan være ufullstendig/is
  ];
  distinctionGuards.forEach((guard, index) => assert(guard.test(combined), `Faglig skillevakt ${index + 1} mangler`));

  const report = {
    schema: 'history_go_fagverk_media_kilder_kritikk_sannhet_phase4_audit_v1', version: '1.0.0',
    status: 'media_kilder_kritikk_sannhet_canonical_20_of_20', generatedFrom: P,
    subject: {
      id: 'media', canonicalDomainCount: 6, canonicalEmneCount: 120, registeredChapterCount: 5,
      editorialStatus: statusEntry.editorialStatus, nextGate: statusEntry.nextGate,
      nestedPopularCultureEmneCount: 56
    },
    chapter: {
      id: chapter.id, title: chapter.title, primaryDomainId: chapter.primary_domain_id,
      moduleFiles: chapter.moduleFiles, briefFile: chapter.briefFile, claimsFile: chapter.claimsFile,
      relatedPlaceIds: chapter.relatedPlaces.map((row) => row.id)
    },
    canonicalCoverage: {
      ownerDomainId: 'kilder_kritikk_sannhet', requiredEmneIds: EXPECTED_EMNES,
      coveredEmneIds: chapter.emne_ids, exactCoverage: '20/20', coveredSubjectEmneCount: 62,
      totalSubjectEmneCount: 120, remainingDomainCount: 3
    },
    summary: {
      moduleCount: 3, sectionCount: 9, paragraphCount: 27, conceptCount: 6,
      workedExampleCount: 3, misconceptionCount: 5, applicationTaskCount: 5,
      selfCheckCount: 7, methodCount: 20, sourceCount: 20, claimCount: 27, placeCaseCount: 4
    },
    gates: {
      canonicalOwnerDomain: true, exactTwentyOfTwentyEmneCoverage: true, allMethodReferencesResolved: true,
      threeEditedModules: true, paragraphLevelClaimTrace: true, allClaimsVerifiedAndUsed: true,
      allSourcesUsedAndInspectable: true, canonicalPlacesResolved: true, chapterSourcesRenderable: true,
      chapterPlacesRenderable: true, misconceptionsRenderable: true, primarySourceTruthGuard: true,
      proximityIndependenceGuard: true, namedSourceVerificationGuard: true, factCheckFallibilityGuard: true,
      independentEvidenceGuard: true, framingFabricationGuard: true, framingIntentGuard: true,
      discoursePatternGuard: true, newsValueTruthGuard: true, absenceCensorshipGuard: true,
      objectivityProcedureGuard: true, balanceEvidenceGuard: true, expertAuthorityGuard: true,
      expertConsensusGuard: true, correlationCausationGuard: true, graphicDataGuard: true,
      statisticalRevisionGuard: true, misinformationDisinformationGuard: true, archiveTruthGuard: true,
      documentCompletenessGuard: true, previousMediaChaptersPreserved: true,
      nestedPopularCulturePreserved: true, incompleteSubjectStatusHonest: true, releaseReady: true
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
    const { report } = auditMediaKilderKritikkSannhetPhase4({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Media Kilder, kritikk og sannhet OK: ${report.canonicalCoverage.exactCoverage} emner, ${report.summary.paragraphCount} avsnitt, ${report.summary.claimCount} claims og ${report.summary.sourceCount} kilder.`);
  } catch (error) {
    console.error(`Media Kilder, kritikk og sannhet FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
