#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { auditMediaPhase3 } from './audit-fagverk-media-phase3.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  chapter: 'data/fagverk/media/offentlighet-ytringsfrihet-og-medieetikk.json',
  brief: 'data/fagverk/media/offentlighet-ytringsfrihet-og-medieetikk/brief.json',
  claims: 'data/fagverk/media/offentlighet-ytringsfrihet-og-medieetikk/claims.json',
  previousChapter: 'data/fagverk/media/presse-redaksjoner-og-avishus.json',
  registry: 'data/fagverk/fagverk_registry.json', status: 'data/fagverk/subject_status.json',
  emners: 'data/fag/media/emner_media_canonical_v4_5.json', methods: 'data/fag/media/methods_media_canonical_v4_5.json',
  places: 'data/places/places_index.json', report: 'reports/fagverk/media-offentlighet-ytringsfrihet-etikk-phase4-audit.json'
});
const EXPECTED_EMNES = [
  'em_media_kritikk_kommentar', 'em_media_debatt_offentlighet', 'em_media_kildevern',
  'em_media_makt_moter_presse', 'em_media_medieansvar', 'em_media_medieetikk',
  'em_media_medielegitimitet', 'em_media_medietillit', 'em_media_minoritetsmedier',
  'em_media_motoffentligheter', 'em_media_opplyst_offentlighet', 'em_media_pressefrihet',
  'em_media_pressekonferanse', 'em_media_pressekritikk', 'em_media_publiseringsansvar',
  'em_media_redaktoransvar', 'em_media_rettelser', 'em_media_tillit_politisering',
  'em_media_var_varsom', 'em_media_varsling', 'em_media_ytringsfrihet'
];
const EXPECTED_METHODS = [
  'met_media_ansvarsanalyse', 'met_media_debattanalyse', 'met_media_kildevernanalyse',
  'met_media_legitimitetsanalyse', 'met_media_maktanalyse', 'met_media_medieetisk_analyse',
  'met_media_minoritetsmedieanalyse', 'met_media_motoffentlighetsanalyse',
  'met_media_offentlighetsanalyse', 'met_media_politiseringsanalyse',
  'met_media_pressefrihetsanalyse', 'met_media_pressekonferanseanalyse',
  'met_media_pressekritikkanalyse', 'met_media_publiseringsanalyse',
  'met_media_redaktoransvarsanalyse', 'met_media_rettelsesanalyse',
  'met_media_tillitsanalyse', 'met_media_var_varsom_analyse',
  'met_media_varsleranalyse', 'met_media_ytringsfrihetsanalyse'
];
const EXPECTED_PLACES = ['stortinget', 'tinghuset', 'litteraturhuset', 'aftenposten_akersgata'];
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

export function auditMediaOffentlighetYtringsfrihetEtikkPhase4({ writeReport = false, checkReport = true } = {}) {
  const phase3 = auditMediaPhase3({ checkReport });
  const chapter = json(P.chapter);
  const brief = json(P.brief);
  const claimsDoc = json(P.claims);
  const previousChapter = json(P.previousChapter);
  const registry = json(P.registry);
  const status = json(P.status);
  const emners = json(P.emners);
  const methodsDoc = json(P.methods);
  const places = json(P.places);
  const statusEntry = status.subjects.find((row) => row.id === 'media');
  const registrySubject = registry.subjects.media;
  const registryChapter = registrySubject.chapters.find((row) => row.id === chapter.id);

  assert(chapter.schema === 'history_go_fagverk_chapter_v1', 'Media-kapittelet har feil schema');
  assert(chapter.subject === 'media' && chapter.subject_id === 'media', 'Media-kapittelet har feil fag');
  assert(chapter.primary_domain_id === 'offentlighet_ytringsfrihet_etikk', 'Kapittelet har feil eierdomene');
  assert(chapter.editorialStatus === 'chapter_ready' && chapter.claimTraceRequired === true, 'Kapittelet er ikke claimsporet chapter_ready');
  assert(isDeepStrictEqual(chapter.emne_ids, EXPECTED_EMNES), 'Kapittelet dekker ikke de 21 canonicale emnene i riktig rekkefølge');
  assert(new Set(chapter.emne_ids).size === 21, 'Kapittelet har dupliserte emner');
  assert(registrySubject.chapters.length === 3 && registryChapter, 'Media-registeret skal ha nøyaktig tre kapitler');
  assert(registrySubject.chapters[0].id === previousChapter.id && registrySubject.chapters[1].id === chapter.id && registrySubject.chapters[2].id === 'kilder-kritikk-og-sannhet', 'Media-kapittelrekkefølgen er feil');
  assert(previousChapter.primary_domain_id === 'presse_redaksjoner_avishus' && previousChapter.emne_ids.length === 21, 'Første Media-kapittel er ikke bevart');
  assert(registryChapter.file === P.chapter && registryChapter.primary_domain_id === chapter.primary_domain_id, 'Registry-kapittelet er usynkronisert');
  assert(isDeepStrictEqual(registryChapter.emne_ids, EXPECTED_EMNES), 'Registry-emnene er usynkronisert');
  assert(statusEntry.editorialStatus === 'chapters_in_progress', 'Media må fortsatt stå chapters_in_progress');
  assert(statusEntry.nextGate === 'remaining_domain_chapter_production', 'Media har feil neste produksjonsport');
  assert(phase3.report.summary.domainCount === 6 && phase3.report.summary.emneCount === 120, 'Media-baseline er ikke bevart');
  assert(phase3.report.summary.registeredChapterCount === 3, 'Fase 3-auditen ser ikke alle tre Media-kapitlene');
  assert(phase3.report.nestedSupplement.emneCount === 56 && phase3.report.nestedSupplement.topLevelSubject === false, 'Nested Populærkultur er ikke bevart');

  const canonicalEmneIds = new Set(emners.map((row) => row.emne_id));
  assert(EXPECTED_EMNES.every((id) => canonicalEmneIds.has(id)), 'Kapittelet peker til ukjent Media-emne');
  const domain = phase3.model.domainsById.get('offentlighet_ytringsfrihet_etikk');
  assert(domain && isDeepStrictEqual([...domain.emneIds], EXPECTED_EMNES), 'Canonical domeneeierskap er usynkronisert');
  const canonicalMethodIds = new Set(methodsDoc.methods.map((row) => row.method_id));
  assert(isDeepStrictEqual(chapter.method_ids, EXPECTED_METHODS), 'Kapittelet har feil canonicalt metodeutvalg');
  assert(chapter.method_ids.every((id) => canonicalMethodIds.has(id)), 'Kapittelet har uløst metode-ID');

  assert(brief.schema === 'history_go_fagverk_chapter_brief_v1' && brief.chapter_id === chapter.id, 'Briefen er usynkronisert');
  assert(isDeepStrictEqual(brief.requiredEmneIds, EXPECTED_EMNES), 'Briefen har feil emnedekning');
  assert(isDeepStrictEqual(brief.requiredMethodIds, EXPECTED_METHODS), 'Briefen har feil metodedekning');
  assert(brief.sourceStrategy.minimumExternalSources >= 18 && brief.sourceStrategy.claimLevelTrace === true && brief.sourceStrategy.sourceLocationsRequired === true, 'Briefens kildestrategi er for svak');
  assert(isDeepStrictEqual(brief.relatedPlaceIds, EXPECTED_PLACES), 'Briefen har feil canonicale stedscase');
  const knownPlaceIds = new Set(places.map((row) => row.id));
  assert(EXPECTED_PLACES.every((id) => knownPlaceIds.has(id)), 'Briefen peker til ukjent sted');
  assert(isDeepStrictEqual(chapter.relatedPlaces.map((row) => row.id), EXPECTED_PLACES), 'Kapittelpayloaden mangler canonicale stedscase');
  assert(chapter.relatedPlaces.every((row) => row.name && row.role), 'Et runtime-stedscase mangler navn eller rolle');

  const modules = chapter.moduleFiles.map((file) => ({ file, value: json(file) }));
  const sections = modules.flatMap(({ value }) => value.sections || []);
  assert(modules.length === 3 && sections.length === 9, 'Kapittelet skal ha tre moduler og ni seksjoner');
  assert(sections.every((item) => item.paragraphs.length === 3), 'Hver seksjon skal ha tre fagavsnitt');
  assert(sections.every((item) => item.paragraphClaimIds.length === item.paragraphs.length), 'Avsnitt og claimspor er usynkronisert');
  assert(sections.every((item) => item.paragraphClaimIds.every((ids) => Array.isArray(ids) && ids.length >= 1)), 'Et fagavsnitt mangler claimspor');
  assert(sections.every((item) => item.keyPoints.length >= 2 && item.keyPointClaimIds.length === item.keyPoints.length), 'Nøkkelpunkter er ikke claimsporet');
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
  assert(claimsDoc.sources.every((row) => /^https:\/\//.test(row.url) && row.label && row.publisher && row.title && row.source_location && row.type), 'En kilde er ikke inspiserbar eller renderbar');
  assert(claimsDoc.sources.every((row) => row.source_location.length >= 30), 'En kilde mangler presis kildeplassering');
  assert(claimsDoc.claims.every((row) => row.status === 'verified'), 'En claim er ikke verifisert');
  assert(claimsDoc.claims.every((row) => row.source_ids.length >= 1 && row.source_ids.every((id) => sourceIds.has(id))), 'En claim har uløst kilde');
  assert(claimsDoc.claims.every((row) => row.used_in.length >= 1 && row.used_in.every((id) => sectionIds.has(id))), 'En claim har ugyldig used_in');
  const usedSourceIds = new Set(claimsDoc.claims.flatMap((row) => row.source_ids));
  assert([...sourceIds].every((id) => usedSourceIds.has(id)), 'En registrert kilde brukes ikke');
  const referencedClaimIds = new Set(sections.flatMap((row) => [...row.paragraphClaimIds, ...row.keyPointClaimIds].flat()));
  assert([...referencedClaimIds].every((id) => claimIds.has(id)), 'Modulene peker til ukjent claim');
  assert([...claimIds].every((id) => referencedClaimIds.has(id)), 'En verifisert claim brukes ikke i kapittelet');

  const combined = JSON.stringify({ chapter, brief, modules: modules.map((row) => row.value) });
  const guards = [
    [/ytringsfrihet.{0,180}(ikke|forskjellig).{0,100}(publiser|bestemt medium)|retten til å ytre.{0,160}publisert/is, 'Ytringsfrihet/publiseringskrav-vakten mangler'],
    [/pressefrihet.{0,180}(ikke|ansvar|rammer)|frihet.{0,120}(rettslig|etisk) ansvar/is, 'Pressefrihet/ansvar-vakten mangler'],
    [/kildevern.{0,180}(ikke|erstatter).{0,100}(sann|verifiser)|identitet.{0,120}(ikke|kontroll)/is, 'Kildevern/sannhet-vakten mangler'],
    [/kildevern.{0,180}(varslervern|arbeidstaker)|varslervern.{0,180}kildevern/is, 'Kildevern/varslervern-vakten mangler'],
    [/uavhengighet.{0,180}(ikke|eier)|eier.{0,180}(ikke|instrue).{0,80}(enkelt|redaksjon)/is, 'Redaktøruavhengighet/eier-vakten mangler'],
    [/presseetikk.{0,180}(ikke|ved siden av).{0,80}(lov|domstol)|PFU.{0,120}ikke en domstol/is, 'Lov/presseetikk-vakten mangler'],
    [/rettelse.{0,180}(ikke|slett|histor|versjon)/is, 'Rettelse/historikk-vakten mangler'],
    [/imøtegåelse.{0,180}(ikke|veto)|kildeveto/is, 'Imøtegåelse/veto-vakten mangler'],
    [/åpen.{0,180}(ikke|begrens|regel).{0,100}(opptak|publiser|kontroll)|åpenhet.{0,120}ikke bevis/is, 'Åpenhet/begrensning-vakten mangler'],
    [/tilgang.{0,180}(ikke|men).{0,100}(kritisk|kontroll)|kontrollmulighet.{0,120}ikke bevis/is, 'Tilgang/kontroll-vakten mangler'],
    [/tillit.{0,180}(ikke|verken).{0,100}(sann|kvalitet|bevis)|tillitsmåling.{0,180}ikke/is, 'Tillit/sannhet-vakten mangler'],
    [/mangfold.{0,180}(ikke|hver enkelt|alle grupper)|alle stemmer.{0,120}alle medier/is, 'Mangfold/totalrepresentasjon-vakten mangler'],
    [/mot-offentlighet.{0,180}(ikke|ekkokammer)|mot-offentligheter.{0,180}(ikke|ekkokamre)/is, 'Mot-offentlighet/ekkokammer-vakten mangler'],
    [/minoritetsmedier.{0,180}(ikke|ubetydelig|offentlig)|minoritetsmedium.{0,180}irrelevans/is, 'Minoritetsmedium/relevans-vakten mangler'],
    [/pressekritikk.{0,180}(ikke|evidens|konkret)|delegitimering/is, 'Pressekritikk/delegitimering-vakten mangler'],
    [/legitimitet.{0,180}(ikke|forskjellig).{0,100}popularitet|popularitet.{0,120}ikke identisk/is, 'Legitimitet/popularitet-vakten mangler']
  ];
  for (const [pattern, message] of guards) assert(pattern.test(combined), message);

  const report = {
    schema: 'history_go_fagverk_media_offentlighet_ytringsfrihet_etikk_phase4_audit_v1', version: '1.0.0',
    status: 'media_offentlighet_ytringsfrihet_etikk_canonical_21_of_21', generatedFrom: P,
    subject: {
      id: 'media', canonicalDomainCount: 6, canonicalEmneCount: 120,
      registeredChapterCount: 3, editorialStatus: statusEntry.editorialStatus,
      nextGate: statusEntry.nextGate, nestedPopularCultureEmneCount: 56
    },
    chapter: {
      id: chapter.id, title: chapter.title, primaryDomainId: chapter.primary_domain_id,
      moduleFiles: chapter.moduleFiles, briefFile: chapter.briefFile, claimsFile: chapter.claimsFile,
      relatedPlaceIds: chapter.relatedPlaces.map((row) => row.id)
    },
    canonicalCoverage: {
      ownerDomainId: 'offentlighet_ytringsfrihet_etikk', requiredEmneIds: EXPECTED_EMNES,
      coveredEmneIds: chapter.emne_ids, exactCoverage: '21/21', coveredSubjectEmneCount: 42,
      totalSubjectEmneCount: 120, remainingDomainCount: 4
    },
    summary: {
      moduleCount: 3, sectionCount: 9, paragraphCount: 27, conceptCount: 6,
      workedExampleCount: 3, misconceptionCount: 5, applicationTaskCount: 5,
      selfCheckCount: 7, methodCount: 20, sourceCount: 20, claimCount: 27, placeCaseCount: 4
    },
    gates: {
      canonicalOwnerDomain: true, exactTwentyOneOfTwentyOneEmneCoverage: true,
      allMethodReferencesResolved: true, threeEditedModules: true, paragraphLevelClaimTrace: true,
      allClaimsVerifiedAndUsed: true, allSourcesUsedAndPreciselyLocated: true,
      canonicalPlacesResolved: true, chapterSourcesRenderable: true, chapterPlacesRenderable: true,
      misconceptionsRenderable: true, expressionVsPublicationGuard: true, pressFreedomResponsibilityGuard: true,
      sourceProtectionTruthGuard: true, sourceProtectionWhistleblowerGuard: true,
      editorIndependenceOwnershipGuard: true, lawEthicsGuard: true, correctionHistoryGuard: true,
      replyVetoGuard: true, openAccessLimitsGuard: true, accessScrutinyGuard: true,
      trustTruthGuard: true, diversityRepresentationGuard: true, counterpublicEchoChamberGuard: true,
      minorityMediaRelevanceGuard: true, pressCriticismDelegitimationGuard: true,
      legitimacyPopularityGuard: true, previousMediaChapterPreserved: true,
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
    const { report } = auditMediaOffentlighetYtringsfrihetEtikkPhase4({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log('Media Offentlighet, ytringsfrihet og medieetikk OK: ' + report.canonicalCoverage.exactCoverage + ' emner, ' + report.summary.paragraphCount + ' avsnitt, ' + report.summary.claimCount + ' claims og ' + report.summary.sourceCount + ' kilder.');
  } catch (error) {
    console.error('Media Offentlighet, ytringsfrihet og medieetikk FEIL: ' + error.message);
    process.exitCode = 1;
  }
}
