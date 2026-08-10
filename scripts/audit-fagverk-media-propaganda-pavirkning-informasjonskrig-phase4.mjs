#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { auditMediaPhase3 } from './audit-fagverk-media-phase3.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  chapter: 'data/fagverk/media/propaganda-pavirkning-og-informasjonskrig.json',
  brief: 'data/fagverk/media/propaganda-pavirkning-og-informasjonskrig/brief.json',
  claims: 'data/fagverk/media/propaganda-pavirkning-og-informasjonskrig/claims.json',
  registry: 'data/fagverk/fagverk_registry.json', status: 'data/fagverk/subject_status.json',
  emners: 'data/fag/media/emner_media_canonical_v4_5.json', methods: 'data/fag/media/methods_media_canonical_v4_5.json',
  places: 'data/places/places_index.json', report: 'reports/fagverk/media-propaganda-pavirkning-informasjonskrig-phase4-audit.json'
});
const EXPECTED_EMNES = [
  'em_media_bots_troll', 'em_media_faktasjekk_motstand', 'em_media_frykt_og_media',
  'em_media_informasjonskontroll', 'em_media_kampanjestrategi', 'em_media_konspirasjon',
  'em_media_koordinerte_pavirkningsnettverk', 'em_media_krigsbilder', 'em_media_kriseretorikk',
  'em_media_mediepolarisering', 'em_media_mistillitsfortelling', 'em_media_motpropaganda',
  'em_media_opinion', 'em_media_politisk_kommunikasjon', 'em_media_propaganda',
  'em_media_sensur', 'em_media_tillitssvikt', 'em_media_visuell_pavirking'
];
const EXPECTED_METHODS = [
  'met_media_botanalyse', 'met_media_nettverksanalyse', 'met_media_motpropagandaanalyse',
  'met_media_motstandsanalyse', 'met_media_retorikkanalyse', 'met_media_fryktanalyse',
  'met_media_sensuranalyse', 'met_media_kontrollanalyse', 'met_media_politisk_kommunikasjonsanalyse',
  'met_media_kampanjeanalyse', 'met_media_konspirasjonsanalyse', 'met_media_mistillitsanalyse',
  'met_media_krigsbildeanalyse', 'met_media_visuell_pavirkningsanalyse',
  'met_media_tillitssviktanalyse', 'met_media_polariseringsanalyse',
  'met_media_propagandaanalyse', 'met_media_opinionsanalyse'
];
const EXPECTED_PLACES = ['stortinget', 'regjeringskvartalet', 'youngstorget', 'nrk_huset_marienlyst'];
const EXPECTED_CHAPTERS = [
  'presse-redaksjoner-og-avishus', 'offentlighet-ytringsfrihet-og-medieetikk',
  'kilder-kritikk-og-sannhet', 'plattformer-algoritmer-og-distribusjon',
  'propaganda-pavirkning-og-informasjonskrig'
];
const EXPECTED_DISTINCTIONS = [
  'påvirkning vs manipulasjon', 'politisk kommunikasjon vs propaganda', 'kampanje vs fordekt operasjon',
  'opinion vs målt opinion', 'intensjon vs dokumentert effekt', 'desinformasjon vs feilinformasjon',
  'FIMI vs all utenlandsk tale', 'koordinering vs likhet', 'bot vs menneskelig konto',
  'trollatferd vs upopulær mening', 'nettverksspor vs sikker attribusjon', 'sensur vs redaksjonelt utvalg',
  'informasjonskontroll vs kildevern', 'dokumentert sammensvergelse vs konspirasjonsfortelling',
  'mistillitsfortelling vs empirisk kritikk', 'polarisering vs uenighet', 'fryktappell vs dokumentert risiko',
  'kriseretorikk vs krisefakta', 'krigsbilde vs hele hendelsen', 'visuell virkning vs autentisitet',
  'faktasjekk vs endelig sannhet', 'motpropaganda vs uavhengig korrigering',
  'rekkevidde vs opinionsendring', 'tillitsmåling vs sannhetsdom'
];
const abs = (p) => path.join(ROOT, p);
const json = (p) => JSON.parse(fs.readFileSync(abs(p), 'utf8'));
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const projection = (report) => ({
  schema: report.schema, version: report.version, status: report.status, generatedFrom: report.generatedFrom,
  subject: report.subject, chapter: report.chapter, canonicalCoverage: report.canonicalCoverage,
  summary: report.summary, gates: report.gates
});

export function auditMediaPropagandaPavirkningInformasjonskrigPhase4({ writeReport = false, checkReport = true } = {}) {
  const phase3 = auditMediaPhase3({ checkReport });
  const chapter = json(P.chapter);
  const brief = json(P.brief);
  const claimsDoc = json(P.claims);
  const registry = json(P.registry);
  const statusEntry = json(P.status).subjects.find((row) => row.id === 'media');
  const registrySubject = registry.subjects.media;
  const registryChapter = registrySubject.chapters.find((row) => row.id === chapter.id);

  assert(chapter.schema === 'history_go_fagverk_chapter_v1', 'Kapittelet har feil schema');
  assert(chapter.subject === 'media' && chapter.subject_id === 'media', 'Kapittelet har feil fag');
  assert(chapter.primary_domain_id === 'propaganda_pavirkning_informasjonskrig', 'Kapittelet har feil eierdomene');
  assert(chapter.editorialStatus === 'chapter_ready' && chapter.claimTraceRequired === true, 'Kapittelet er ikke claimsporet chapter_ready');
  assert(isDeepStrictEqual(chapter.emne_ids, EXPECTED_EMNES) && new Set(chapter.emne_ids).size === 18, 'Kapittelet dekker ikke eksakt 18/18 canonicale emner');
  assert(isDeepStrictEqual(chapter.method_ids, EXPECTED_METHODS) && new Set(chapter.method_ids).size === 18, 'Kapittelet dekker ikke eksakt 18 canonicale metoder');
  assert(isDeepStrictEqual(registrySubject.chapters.map((row) => row.id), EXPECTED_CHAPTERS), 'Media-registeret har feil kapittelrekkefølge');
  assert(registryChapter?.file === P.chapter && registryChapter.primary_domain_id === chapter.primary_domain_id, 'Registry-kapittelet er usynkronisert');
  assert(isDeepStrictEqual(registryChapter.emne_ids, EXPECTED_EMNES), 'Registry-emnene er usynkronisert');
  assert(statusEntry.editorialStatus === 'chapters_in_progress' && statusEntry.nextGate === 'remaining_domain_chapter_production', 'Media må stå ærlig som chapters_in_progress');
  assert(phase3.report.summary.domainCount === 6 && phase3.report.summary.emneCount === 120, 'Media-baseline er ikke bevart');
  assert(phase3.report.summary.registeredChapterCount === 5, 'Fase 3-auditen ser ikke alle fem Media-kapitlene');
  assert(phase3.report.nestedSupplement.emneCount === 56 && phase3.report.nestedSupplement.topLevelSubject === false, 'Nested Populærkultur er ikke bevart');
  assert(EXPECTED_CHAPTERS.slice(0, 4).every((id, index) => registrySubject.chapters[index].id === id), 'Tidligere Media-kapitler er ikke bevart');

  const canonicalEmneIds = new Set(json(P.emners).map((row) => row.emne_id));
  const canonicalMethodIds = new Set(json(P.methods).methods.map((row) => row.method_id));
  assert(EXPECTED_EMNES.every((id) => canonicalEmneIds.has(id)), 'Kapittelet peker til ukjent Media-emne');
  assert(EXPECTED_METHODS.every((id) => canonicalMethodIds.has(id)), 'Kapittelet peker til ukjent Media-metode');
  const domain = phase3.model.domainsById.get('propaganda_pavirkning_informasjonskrig');
  assert(domain && isDeepStrictEqual([...domain.emneIds], EXPECTED_EMNES), 'Canonical domeneeierskap er usynkronisert');
  assert(brief.schema === 'history_go_fagverk_chapter_brief_v1' && brief.chapter_id === chapter.id, 'Briefen er usynkronisert');
  assert(isDeepStrictEqual(brief.requiredEmneIds, EXPECTED_EMNES), 'Briefen har feil emnedekning');
  assert(isDeepStrictEqual(brief.requiredMethodIds, EXPECTED_METHODS), 'Briefen har feil metodedekning');
  assert(isDeepStrictEqual(brief.requiredCriticalDistinctions, EXPECTED_DISTINCTIONS), 'Briefen mangler et kritisk fagskille');
  assert(brief.sourceStrategy.minimumExternalSources >= 18 && brief.sourceStrategy.claimLevelTrace && brief.sourceStrategy.sourceLocationsRequired, 'Briefens kildestrategi er for svak');
  assert(isDeepStrictEqual(brief.relatedPlaceIds, EXPECTED_PLACES), 'Briefen har feil canonicale stedscase');
  const knownPlaceIds = new Set(json(P.places).map((row) => row.id));
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
  assert(modules[1].value.commonMisconceptions.length === 5 && modules[1].value.commonMisconceptions.every((row) => row.claim && row.correction), 'Misoppfatningene er ikke komplette');
  assert(modules[2].value.applicationTasks.length === 5, 'Anvendelsesmodulen skal ha fem oppgaver');
  assert(modules[2].value.selfCheck.length === 7, 'Anvendelsesmodulen skal ha sju selvkontroller');

  assert(claimsDoc.schema === 'history_go_fagverk_chapter_claims_v1' && claimsDoc.chapter_id === chapter.id, 'Claims-filen er usynkronisert');
  assert(claimsDoc.sources.length === 23 && claimsDoc.claims.length === 27, 'Kapittelet skal ha 23 kilder og 27 claims');
  const sourceIds = new Set(claimsDoc.sources.map((row) => row.id));
  const claimIds = new Set(claimsDoc.claims.map((row) => row.id));
  const sectionIds = new Set(sections.map((row) => row.id));
  assert(sourceIds.size === 23 && claimIds.size === 27, 'Kilde- eller claim-ID er duplisert');
  assert(claimsDoc.sources.every((row) => /^https:\/\//.test(row.url) && row.label && row.publisher && row.title && row.source_location?.length >= 30 && row.type), 'En kilde er ikke inspiserbar eller presist lokalisert');
  assert(claimsDoc.claims.every((row) => row.status === 'verified' && row.source_ids.length >= 1 && row.source_ids.every((id) => sourceIds.has(id))), 'En claim er ikke verifisert eller har uløst kilde');
  assert(claimsDoc.claims.every((row) => row.used_in.length >= 1 && row.used_in.every((id) => sectionIds.has(id))), 'En claim har ugyldig used_in');
  const usedSourceIds = new Set(claimsDoc.claims.flatMap((row) => row.source_ids));
  assert([...sourceIds].every((id) => usedSourceIds.has(id)), 'En registrert kilde brukes ikke');
  const referencedClaimIds = new Set(sections.flatMap((row) => [...row.paragraphClaimIds, ...row.keyPointClaimIds].flat()));
  assert([...referencedClaimIds].every((id) => claimIds.has(id)) && [...claimIds].every((id) => referencedClaimIds.has(id)), 'Claimbruk og claimregister er usynkronisert');

  const report = {
    schema: 'history_go_fagverk_media_propaganda_pavirkning_informasjonskrig_phase4_audit_v1', version: '1.0.0',
    status: 'media_propaganda_pavirkning_informasjonskrig_canonical_18_of_18', generatedFrom: P,
    subject: { id: 'media', canonicalDomainCount: 6, canonicalEmneCount: 120, registeredChapterCount: 5, editorialStatus: statusEntry.editorialStatus, nextGate: statusEntry.nextGate, nestedPopularCultureEmneCount: 56 },
    chapter: { id: chapter.id, title: chapter.title, primaryDomainId: chapter.primary_domain_id, moduleFiles: chapter.moduleFiles, briefFile: chapter.briefFile, claimsFile: chapter.claimsFile, relatedPlaceIds: chapter.relatedPlaces.map((row) => row.id) },
    canonicalCoverage: { ownerDomainId: 'propaganda_pavirkning_informasjonskrig', requiredEmneIds: EXPECTED_EMNES, coveredEmneIds: chapter.emne_ids, exactCoverage: '18/18', coveredSubjectEmneCount: 100, totalSubjectEmneCount: 120, remainingDomainCount: 1 },
    summary: { moduleCount: 3, sectionCount: 9, paragraphCount: 27, conceptCount: 6, workedExampleCount: 3, misconceptionCount: 5, applicationTaskCount: 5, selfCheckCount: 7, methodCount: 18, sourceCount: 23, claimCount: 27, placeCaseCount: 4, criticalDistinctionCount: EXPECTED_DISTINCTIONS.length },
    gates: {
      canonicalOwnerDomain: true, exactEighteenOfEighteenEmneCoverage: true, allMethodReferencesResolved: true,
      threeEditedModules: true, paragraphLevelClaimTrace: true, allClaimsVerifiedAndUsed: true,
      allSourcesUsedAndPreciselyLocated: true, canonicalPlacesResolved: true, chapterSourcesRenderable: true,
      chapterPlacesRenderable: true, misconceptionsRenderable: true, allCriticalDistinctionsLocked: true,
      previousMediaChaptersPreserved: true, nestedPopularCulturePreserved: true,
      incompleteSubjectStatusHonest: true, releaseReady: true
    }
  };
  const committed = projection(report);
  if (writeReport) { fs.mkdirSync(path.dirname(abs(P.report)), { recursive: true }); fs.writeFileSync(abs(P.report), JSON.stringify(committed, null, 2) + '\n'); }
  if (checkReport) assert(isDeepStrictEqual(json(P.report), committed), P.report + ' er utdatert');
  return { report, chapter, brief, claimsDoc, modules: modules.map((row) => row.value) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const { report } = auditMediaPropagandaPavirkningInformasjonskrigPhase4({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Media Propaganda, påvirkning og informasjonskrig OK: ${report.canonicalCoverage.exactCoverage} emner, ${report.summary.paragraphCount} avsnitt, ${report.summary.claimCount} claims og ${report.summary.sourceCount} kilder.`);
  } catch (error) {
    console.error(`Media Propaganda, påvirkning og informasjonskrig FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
