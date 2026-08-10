#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { auditMediaPhase3 } from './audit-fagverk-media-phase3.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  chapter: 'data/fagverk/media/medieokonomi-eierskap-og-arbeid.json',
  brief: 'data/fagverk/media/medieokonomi-eierskap-og-arbeid/brief.json',
  claims: 'data/fagverk/media/medieokonomi-eierskap-og-arbeid/claims.json',
  registry: 'data/fagverk/fagverk_registry.json', status: 'data/fagverk/subject_status.json',
  emners: 'data/fag/media/emner_media_canonical_v4_5.json', methods: 'data/fag/media/methods_media_canonical_v4_5.json',
  places: 'data/places/places_index.json', report: 'reports/fagverk/media-medieokonomi-eierskap-arbeid-phase4-audit.json'
});
const EXPECTED_EMNES = [
  'em_media_annonseokonomi', 'em_media_arbeidsdeling', 'em_media_betalingsmur',
  'em_media_desk_utvikling_design', 'em_media_digitalisering_av_redaksjon', 'em_media_frilans_og_press',
  'em_media_journalistisk_arbeidsliv', 'em_media_klikklogikk', 'em_media_kommersialisering_media',
  'em_media_konsernstruktur', 'em_media_lisens_og_finansiering', 'em_media_medieeierskap',
  'em_media_mediekonsern', 'em_media_nedbemanning', 'em_media_public_service_okonomi',
  'em_media_publikumsmarked', 'em_media_redaksjonell_kapasitet', 'em_media_sentralisering',
  'em_media_teknologisk_omstilling', 'em_media_tilgang_og_abonnement'
];
const EXPECTED_METHODS = [
  'met_media_abonnementsanalyse', 'met_media_annonseokonomisk_analyse', 'met_media_arbeidsdelingsanalyse',
  'met_media_arbeidslivsanalyse', 'met_media_betalingsmuranalyse', 'met_media_digitaliseringsanalyse',
  'met_media_eierskapsanalyse', 'met_media_finansieringsanalyse', 'met_media_frilansanalyse',
  'met_media_kapasitetsanalyse', 'met_media_klikklogikkanalyse', 'met_media_kommersialiseringsanalyse',
  'met_media_konsernanalyse', 'met_media_nedbemanningsanalyse', 'met_media_omstillinganalyse',
  'met_media_produksjonsanalyse', 'met_media_public_service_analyse', 'met_media_publikumsmarkedsanalyse',
  'met_media_sentraliseringsanalyse'
];
const EXPECTED_CHAPTERS = [
  'presse-redaksjoner-og-avishus', 'offentlighet-ytringsfrihet-og-medieetikk',
  'kilder-kritikk-og-sannhet', 'plattformer-algoritmer-og-distribusjon',
  'propaganda-pavirkning-og-informasjonskrig', 'medieokonomi-eierskap-og-arbeid'
];
const EXPECTED_PLACES = ['aftenposten_akersgata', 'vg_huset', 'nrk_huset_marienlyst', 'dagbladet_akersgata'];
const abs = (p) => path.join(ROOT, p);
const json = (p) => JSON.parse(fs.readFileSync(abs(p), 'utf8'));
const assert = (ok, message) => { if (!ok) throw new Error(message); };

export function auditMediaMedieokonomiEierskapArbeidPhase4({ writeReport = false, checkReport = true } = {}) {
  const phase3 = auditMediaPhase3({ checkReport: false });
  const chapter = json(P.chapter); const brief = json(P.brief); const claimsDoc = json(P.claims);
  const registrySubject = json(P.registry).subjects.media;
  const statusEntry = json(P.status).subjects.find((row) => row.id === 'media');
  const registryChapter = registrySubject.chapters.find((row) => row.id === chapter.id);

  assert(chapter.schema === 'history_go_fagverk_chapter_v1' && chapter.subject_id === 'media', 'Kapittelet har feil schema eller fag');
  assert(chapter.id === 'medieokonomi-eierskap-og-arbeid' && chapter.primary_domain_id === 'medieokonomi_eierskap_arbeid', 'Kapittelet har feil identitet eller eierdomene');
  assert(chapter.editorialStatus === 'chapter_ready' && chapter.claimTraceRequired === true, 'Kapittelet er ikke claimsporet chapter_ready');
  assert(isDeepStrictEqual(chapter.emne_ids, EXPECTED_EMNES) && new Set(chapter.emne_ids).size === 20, 'Kapittelet dekker ikke eksakt 20/20 canonicale emner');
  assert(isDeepStrictEqual(chapter.method_ids, EXPECTED_METHODS) && new Set(chapter.method_ids).size === 19, 'Kapittelet dekker ikke eksakt 19 canonicale metoder');
  assert(isDeepStrictEqual(registrySubject.chapters.map((row) => row.id), EXPECTED_CHAPTERS), 'Media-registeret har feil kapittelrekkefølge');
  assert(registryChapter?.file === P.chapter && isDeepStrictEqual(registryChapter.emne_ids, EXPECTED_EMNES), 'Registry-kapittelet er usynkronisert');
  assert(statusEntry.editorialStatus === 'complete' && statusEntry.nextGate === 'maintenance_source_refresh_and_place_case_expansion', 'Media har ikke dokumentert sluttstatus');
  assert(registrySubject.editorialPlan?.completionRequirements?.includes('full_subject_audit_green'), 'Registry mangler helhetsauditport');
  assert(phase3.report.summary.domainCount === 6 && phase3.report.summary.emneCount === 120 && phase3.report.summary.registeredChapterCount === 6, 'Media-baseline eller kapitteltall er feil');
  assert(phase3.report.nestedSupplement.emneCount === 56 && phase3.report.nestedSupplement.topLevelSubject === false, 'Nested Populærkultur er ikke bevart');

  const canonicalEmneIds = new Set(json(P.emners).map((row) => row.emne_id));
  const canonicalMethodIds = new Set(json(P.methods).methods.map((row) => row.method_id));
  assert(EXPECTED_EMNES.every((id) => canonicalEmneIds.has(id)), 'Kapittelet peker til ukjent Media-emne');
  assert(EXPECTED_METHODS.every((id) => canonicalMethodIds.has(id)), 'Kapittelet peker til ukjent Media-metode');
  const domain = phase3.model.domainsById.get('medieokonomi_eierskap_arbeid');
  assert(domain && isDeepStrictEqual([...domain.emneIds], EXPECTED_EMNES), 'Canonical domeneeierskap er usynkronisert');
  assert(brief.schema === 'history_go_fagverk_chapter_brief_v1' && brief.chapter_id === chapter.id, 'Briefen er usynkronisert');
  assert(isDeepStrictEqual(brief.requiredEmneIds, EXPECTED_EMNES) && isDeepStrictEqual(brief.requiredMethodIds, EXPECTED_METHODS), 'Briefen har feil canonical dekning');
  assert(brief.requiredCriticalDistinctions.length === 30 && new Set(brief.requiredCriticalDistinctions).size === 30, 'Briefen skal låse 30 unike fagskiller');
  assert(brief.sourceStrategy.minimumExternalSources >= 20 && brief.sourceStrategy.claimLevelTrace && brief.sourceStrategy.sourceLocationsRequired, 'Briefens kildestrategi er for svak');
  assert(isDeepStrictEqual(brief.relatedPlaceIds, EXPECTED_PLACES) && isDeepStrictEqual(chapter.relatedPlaces.map((row) => row.id), EXPECTED_PLACES), 'Kapittelet har feil stedscase');
  const knownPlaceIds = new Set(json(P.places).map((row) => row.id));
  assert(EXPECTED_PLACES.every((id) => knownPlaceIds.has(id)) && chapter.relatedPlaces.every((row) => row.name && row.role), 'Et stedscase er ukjent eller ufullstendig');

  const modules = chapter.moduleFiles.map(json); const sections = modules.flatMap((module) => module.sections || []);
  assert(modules.length === 3 && sections.length === 9 && sections.every((row) => row.paragraphs.length === 3), 'Kapittelet skal ha tre moduler, ni seksjoner og tre avsnitt per seksjon');
  assert(sections.every((row) => row.paragraphClaimIds.length === row.paragraphs.length && row.paragraphClaimIds.every((ids) => ids.length)), 'Avsnitt og claimspor er usynkronisert');
  assert(sections.every((row) => row.keyPoints.length >= 2 && row.keyPointClaimIds.length === row.keyPoints.length), 'Nøkkelpunkter er ikke claimsporet');
  assert(modules[0].concepts.length === 6 && modules[1].workedExamples.length === 3 && modules[1].commonMisconceptions.length === 5, 'Begreper, eksempler eller misoppfatninger er ufullstendige');
  assert(modules[1].commonMisconceptions.every((row) => row.claim && row.correction), 'Misoppfatningene kan ikke rendres');
  assert(modules[2].applicationTasks.length === 5 && modules[2].selfCheck.length === 7, 'Oppgaver eller selvkontroller er ufullstendige');

  assert(claimsDoc.schema === 'history_go_fagverk_chapter_claims_v1' && claimsDoc.chapter_id === chapter.id, 'Claims-filen er usynkronisert');
  assert(claimsDoc.sources.length === 24 && claimsDoc.claims.length === 27, 'Kapittelet skal ha 24 kilder og 27 claims');
  const sourceIds = new Set(claimsDoc.sources.map((row) => row.id)); const claimIds = new Set(claimsDoc.claims.map((row) => row.id));
  const sectionIds = new Set(sections.map((row) => row.id));
  assert(sourceIds.size === 24 && claimIds.size === 27, 'Kilde- eller claim-ID er duplisert');
  assert(claimsDoc.sources.every((row) => /^https:\/\//.test(row.url) && row.label && row.publisher && row.title && row.source_location?.length >= 30 && row.type), 'En kilde er ikke inspiserbar eller presist lokalisert');
  assert(claimsDoc.claims.every((row) => row.status === 'verified' && row.source_ids.length && row.source_ids.every((id) => sourceIds.has(id))), 'En claim mangler verifisering eller kilde');
  assert(claimsDoc.claims.every((row) => row.used_in.length && row.used_in.every((id) => sectionIds.has(id))), 'En claim har ugyldig used_in');
  assert([...sourceIds].every((id) => claimsDoc.claims.some((row) => row.source_ids.includes(id))), 'En registrert kilde brukes ikke');
  const refs = new Set(sections.flatMap((row) => [...row.paragraphClaimIds, ...row.keyPointClaimIds].flat()));
  assert([...refs].every((id) => claimIds.has(id)) && [...claimIds].every((id) => refs.has(id)), 'Claimbruk og claimregister er usynkronisert');

  const report = {
    schema: 'history_go_fagverk_media_medieokonomi_eierskap_arbeid_phase4_audit_v1', version: '1.0.0', status: 'media_medieokonomi_eierskap_arbeid_canonical_20_of_20', generatedFrom: P,
    subject: { id: 'media', canonicalDomainCount: 6, canonicalEmneCount: 120, registeredChapterCount: 6, editorialStatus: statusEntry.editorialStatus, nextGate: statusEntry.nextGate, nestedPopularCultureEmneCount: 56 },
    chapter: { id: chapter.id, title: chapter.title, primaryDomainId: chapter.primary_domain_id, moduleFiles: chapter.moduleFiles, briefFile: chapter.briefFile, claimsFile: chapter.claimsFile, relatedPlaceIds: EXPECTED_PLACES },
    canonicalCoverage: { ownerDomainId: chapter.primary_domain_id, requiredEmneIds: EXPECTED_EMNES, coveredEmneIds: chapter.emne_ids, exactCoverage: '20/20', coveredSubjectEmneCount: 120, totalSubjectEmneCount: 120, remainingDomainCount: 0 },
    summary: { moduleCount: 3, sectionCount: 9, paragraphCount: 27, conceptCount: 6, workedExampleCount: 3, misconceptionCount: 5, applicationTaskCount: 5, selfCheckCount: 7, methodCount: 19, sourceCount: 24, claimCount: 27, placeCaseCount: 4, criticalDistinctionCount: 30 },
    gates: { canonicalOwnerDomain: true, exactTwentyOfTwentyEmneCoverage: true, allMethodReferencesResolved: true, threeEditedModules: true, paragraphLevelClaimTrace: true, allClaimsVerifiedAndUsed: true, allSourcesUsedAndPreciselyLocated: true, canonicalPlacesResolved: true, chapterSourcesRenderable: true, chapterPlacesRenderable: true, misconceptionsRenderable: true, allCriticalDistinctionsLocked: true, previousMediaChaptersPreserved: true, nestedPopularCulturePreserved: true, completeSubjectStatusDeclared: true, fullSubjectAuditRequired: true, releaseReady: true }
  };
  if (writeReport) { fs.mkdirSync(path.dirname(abs(P.report)), { recursive: true }); fs.writeFileSync(abs(P.report), JSON.stringify(report, null, 2) + '\n'); }
  if (checkReport) assert(isDeepStrictEqual(json(P.report), report), P.report + ' er utdatert');
  return { report, chapter, brief, claimsDoc, modules };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const { report } = auditMediaMedieokonomiEierskapArbeidPhase4({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Media Medieøkonomi, eierskap og arbeid OK: ${report.canonicalCoverage.exactCoverage} emner, ${report.summary.paragraphCount} avsnitt, ${report.summary.claimCount} claims og ${report.summary.sourceCount} kilder.`);
  } catch (error) { console.error(`Media Medieøkonomi, eierskap og arbeid FEIL: ${error.message}`); process.exitCode = 1; }
}
