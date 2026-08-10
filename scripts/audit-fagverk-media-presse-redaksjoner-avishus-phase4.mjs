#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { auditMediaPhase3 } from './audit-fagverk-media-phase3.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  chapter: 'data/fagverk/media/presse-redaksjoner-og-avishus.json',
  brief: 'data/fagverk/media/presse-redaksjoner-og-avishus/brief.json',
  claims: 'data/fagverk/media/presse-redaksjoner-og-avishus/claims.json',
  registry: 'data/fagverk/fagverk_registry.json', status: 'data/fagverk/subject_status.json',
  emners: 'data/fag/media/emner_media_canonical_v4_5.json', methods: 'data/fag/media/methods_media_canonical_v4_5.json',
  places: 'data/places/places_index.json', report: 'reports/fagverk/media-presse-redaksjoner-avishus-phase4-audit.json'
});
const EXPECTED_EMNES = [
  'em_media_av_og_tv_produksjon', 'em_media_avisens_materielle_form', 'em_media_avishus_offentlighetsrom',
  'em_media_byline_ansvar', 'em_media_dagsorden', 'em_media_forside_prioritering',
  'em_media_hendelse_og_presse', 'em_media_journalist_kilde', 'em_media_journalistisk_ansvar',
  'em_media_kildearbeid', 'em_media_lokal_offentlighet', 'em_media_lokalavis',
  'em_media_mediefellesskap', 'em_media_mediehistorisk_endring', 'em_media_nyhetsproduksjon',
  'em_media_nyhetssted', 'em_media_pressehistorie', 'em_media_presseklubb',
  'em_media_redaksjon_desk', 'em_media_redaksjonell_institusjon', 'em_media_trykkeri_materialitet'
];
const EXPECTED_METHODS = [
  'met_media_trykkerianalyse', 'met_media_materialitetsanalyse', 'met_media_avishusanalyse',
  'met_media_institusjonsanalyse', 'met_media_bylineanalyse', 'met_media_ansvarsanalyse',
  'met_media_forsideanalyse', 'met_media_dagsordenanalyse', 'met_media_nyhetsstedsanalyse',
  'met_media_hendelsesanalyse', 'met_media_journalistisk_analyse', 'met_media_kildeanalyse',
  'met_media_lokalavisanalyse', 'met_media_lokaloffentlighetsanalyse', 'met_media_presseklubbanalyse',
  'met_media_fellesskapsanalyse', 'met_media_pressehistorisk_analyse', 'met_media_mediehistorisk_analyse',
  'met_media_produksjonsanalyse', 'met_media_redaksjonsanalyse', 'met_media_deskanalyse'
];
const EXPECTED_PLACES = ['aftenposten_akersgata', 'vg_huset', 'dagbladet_akersgata', 'nrk_huset_marienlyst'];
const NEXT_GATE = 'remaining_domain_chapter_production';
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

export function auditMediaPresseRedaksjonerAvishusPhase4({ writeReport = false, checkReport = true } = {}) {
  const phase3 = auditMediaPhase3({ checkReport });
  const chapter = json(P.chapter);
  const brief = json(P.brief);
  const claimsDoc = json(P.claims);
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
  assert(chapter.primary_domain_id === 'presse_redaksjoner_avishus', 'Kapittelet har feil eierdomene');
  assert(chapter.editorialStatus === 'chapter_ready' && chapter.claimTraceRequired === true, 'Kapittelet er ikke claimsporet chapter_ready');
  assert(isDeepStrictEqual(chapter.emne_ids, EXPECTED_EMNES), 'Kapittelet dekker ikke de 21 canonicale emnene i riktig rekkefølge');
  assert(new Set(chapter.emne_ids).size === 21, 'Media-kapittelet har duplikate emner');
  assert(registrySubject.chapters.length === 3 && registryChapter, 'Media-registeret skal ha nøyaktig tre kapitler');
  assert(registryChapter.file === P.chapter && registryChapter.primary_domain_id === 'presse_redaksjoner_avishus', 'Registry-kapittelet er usynkronisert');
  assert(isDeepStrictEqual(registryChapter.emne_ids, EXPECTED_EMNES), 'Registry-emnene er usynkronisert');
  assert(statusEntry.editorialStatus === 'chapters_in_progress', 'Media skal stå chapters_in_progress etter første domene');
  assert(statusEntry.nextGate === NEXT_GATE, 'Media har feil neste produksjonsport');
  assert(phase3.report.summary.domainCount === 6 && phase3.report.summary.emneCount === 120, 'Media-baseline er ikke bevart');
  assert(phase3.report.summary.registeredChapterCount === 3, 'Fase 3-auditen ser ikke alle tre Media-kapitlene');
  assert(phase3.report.nestedSupplement.emneCount === 56 && phase3.report.nestedSupplement.topLevelSubject === false, 'Nested Populærkultur er ikke bevart');

  const canonicalEmneIds = new Set(emners.map((row) => row.emne_id));
  assert(EXPECTED_EMNES.every((id) => canonicalEmneIds.has(id)), 'Kapittelet peker til ukjent Media-emne');
  const domain = phase3.model.domainsById.get('presse_redaksjoner_avishus');
  assert(domain && isDeepStrictEqual([...domain.emneIds], EXPECTED_EMNES), 'Canonical domeneeierskap er usynkronisert');
  const canonicalMethodIds = new Set(methodsDoc.methods.map((row) => row.method_id));
  assert(isDeepStrictEqual(chapter.method_ids, EXPECTED_METHODS), 'Kapittelet har feil canonicalt metodeutvalg');
  assert(chapter.method_ids.every((id) => canonicalMethodIds.has(id)), 'Kapittelet har uløst metode-ID');

  assert(brief.schema === 'history_go_fagverk_chapter_brief_v1' && brief.chapter_id === chapter.id, 'Briefen er usynkronisert');
  assert(isDeepStrictEqual(brief.requiredEmneIds, EXPECTED_EMNES), 'Briefen har feil emnedekning');
  assert(isDeepStrictEqual(brief.requiredMethodIds, EXPECTED_METHODS), 'Briefen har feil metodedekning');
  assert(brief.sourceStrategy.minimumExternalSources >= 16 && brief.sourceStrategy.claimLevelTrace === true, 'Briefens kildestrategi er for svak');
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
  assert(sections.every((item) => item.keyPoints.length >= 2 && item.keyPointClaimIds.length === item.keyPoints.length), 'Nøkkelpunkter er ikke claimsporet');
  assert(modules[0].value.concepts.length === 6, 'Grunnlagsmodulen skal ha seks begreper');
  assert(modules[1].value.workedExamples.length === 3, 'Fordypningsmodulen skal ha tre eksempler');
  assert(modules[1].value.commonMisconceptions.length === 5, 'Fordypningsmodulen skal ha fem misoppfatninger');
  assert(modules[1].value.commonMisconceptions.every((row) => row.claim && row.correction), 'En misoppfatning er ikke renderbar');
  assert(modules[2].value.applicationTasks.length === 5, 'Anvendelsesmodulen skal ha fem oppgaver');
  assert(modules[2].value.selfCheck.length === 7, 'Anvendelsesmodulen skal ha sju selvkontroller');

  assert(claimsDoc.schema === 'history_go_fagverk_chapter_claims_v1' && claimsDoc.chapter_id === chapter.id, 'Claims-filen er usynkronisert');
  assert(claimsDoc.sources.length === 19, 'Kapittelet skal ha 19 kilder');
  assert(claimsDoc.claims.length === 25, 'Kapittelet skal ha 25 claims');
  const sourceIds = new Set(claimsDoc.sources.map((row) => row.id));
  const claimIds = new Set(claimsDoc.claims.map((row) => row.id));
  const sectionIds = new Set(sections.map((row) => row.id));
  assert(sourceIds.size === claimsDoc.sources.length && claimIds.size === claimsDoc.claims.length, 'Kilde- eller claim-ID er duplisert');
  assert(claimsDoc.sources.every((row) => /^https:\/\//.test(row.url) && row.label && row.publisher && row.title && row.source_location && row.type), 'En kilde er ikke inspectable eller renderbar');
  assert(claimsDoc.claims.every((row) => row.status === 'verified'), 'En claim er ikke verifisert');
  assert(claimsDoc.claims.every((row) => row.source_ids.length >= 1 && row.source_ids.every((id) => sourceIds.has(id))), 'En claim har uløst kilde');
  assert(claimsDoc.claims.every((row) => row.used_in.length >= 1 && row.used_in.every((id) => sectionIds.has(id))), 'En claim har ugyldig used_in');
  const usedSourceIds = new Set(claimsDoc.claims.flatMap((row) => row.source_ids));
  assert([...sourceIds].every((id) => usedSourceIds.has(id)), 'En registrert kilde brukes ikke');
  const referencedClaimIds = new Set(sections.flatMap((row) => [...row.paragraphClaimIds, ...row.keyPointClaimIds].flat()));
  assert([...referencedClaimIds].every((id) => claimIds.has(id)), 'Modulene peker til ukjent claim');
  assert([...claimIds].every((id) => referencedClaimIds.has(id)), 'En verifisert claim brukes ikke i kapittelet');

  const combined = JSON.stringify({ chapter, brief, modules: modules.map((row) => row.value) });
  assert(/hendelse.{0,160}(ikke|skiller|separat).{0,100}(nyhet|publiser)|nyhet.{0,100}(redigert|utvalgt)/is.test(combined), 'Hendelse/nyhet-vakten mangler');
  assert(/kildeutsagn.{0,160}(ikke|skiller).{0,100}(verifisert|påstand)|kilden leverer.{0,120}redaksjonen leverer/is.test(combined), 'Kildeutsagn/verifisering-vakten mangler');
  assert(/anonym.{0,160}(ikke|kan ikke).{0,100}(verifisering|ubegrunnet)|anonymitet.{0,120}(ikke|kontroll)/is.test(combined), 'Anonym kilde/vilkårlig påstand-vakten mangler');
  assert(/byline.{0,160}(ikke|men).{0,100}(ansvar|redaktør)|redaktør.{0,120}byline/is.test(combined), 'Byline/totalansvar-vakten mangler');
  assert(/forside.{0,160}(ikke|men).{0,100}(komplett|prioriter)|prioritering.{0,120}(ikke|forside)/is.test(combined), 'Forside/hendelsesbilde-vakten mangler');
  assert(/avishus.{0,160}(ikke|roller|arbeidsdeling).{0,100}(én|samlet|intensjon)|ikke én person/is.test(combined), 'Avishus/aktør-vakten mangler');
  assert(/presseklubb.{0,160}(ikke|overta).{0,100}(redaksjon|beslut)|samlingssted.{0,120}(ikke|redaksjon)/is.test(combined), 'Presseklubb/redaksjon-vakten mangler');
  assert(/lokal.{0,160}(ikke|uten).{0,100}(representativ|hele)|representasjon.{0,120}(må|undersøk)/is.test(combined), 'Lokalavis/representasjon-vakten mangler');
  assert(/rettelse.{0,180}(ikke|histor|versjon)|rettet.{0,160}(ikke|første publisering)/is.test(combined), 'Rettelse/publiseringshistorikk-vakten mangler');

  const report = {
    schema: 'history_go_fagverk_media_presse_redaksjoner_avishus_phase4_audit_v1', version: '1.0.0',
    status: 'media_presse_redaksjoner_avishus_canonical_21_of_21', generatedFrom: P,
    subject: {
      id: 'media', canonicalDomainCount: phase3.report.summary.domainCount,
      canonicalEmneCount: phase3.report.summary.emneCount, registeredChapterCount: registrySubject.chapters.length,
      editorialStatus: statusEntry.editorialStatus, nextGate: statusEntry.nextGate,
      nestedPopularCultureEmneCount: phase3.report.nestedSupplement.emneCount
    },
    chapter: {
      id: chapter.id, title: chapter.title, primaryDomainId: chapter.primary_domain_id,
      moduleFiles: chapter.moduleFiles, briefFile: chapter.briefFile, claimsFile: chapter.claimsFile,
      relatedPlaceIds: chapter.relatedPlaces.map((row) => row.id)
    },
    canonicalCoverage: {
      ownerDomainId: 'presse_redaksjoner_avishus', requiredEmneIds: EXPECTED_EMNES, coveredEmneIds: chapter.emne_ids,
      exactCoverage: '21/21', remainingDomainCount: 5
    },
    summary: {
      moduleCount: modules.length, sectionCount: sections.length,
      paragraphCount: sections.reduce((sum, row) => sum + row.paragraphs.length, 0),
      conceptCount: modules[0].value.concepts.length, workedExampleCount: modules[1].value.workedExamples.length,
      misconceptionCount: modules[1].value.commonMisconceptions.length, applicationTaskCount: modules[2].value.applicationTasks.length,
      selfCheckCount: modules[2].value.selfCheck.length, methodCount: chapter.method_ids.length,
      sourceCount: claimsDoc.sources.length, claimCount: claimsDoc.claims.length, placeCaseCount: chapter.relatedPlaces.length
    },
    gates: {
      canonicalOwnerDomain: true, exactTwentyOneOfTwentyOneEmneCoverage: true,
      allMethodReferencesResolved: true, threeEditedModules: true, paragraphLevelClaimTrace: true,
      allClaimsVerifiedAndUsed: true, allSourcesUsedAndInspectable: true, canonicalPlacesResolved: true,
      chapterSourcesRenderable: true, chapterPlacesRenderable: true, misconceptionsRenderable: true,
      eventPublicationGuard: true, sourceVerificationGuard: true, anonymousSourceGuard: true,
      bylineResponsibilityGuard: true, frontPagePriorityGuard: true, newsroomInstitutionGuard: true,
      pressClubDecisionGuard: true, localPublicSphereGuard: true, correctionHistoryGuard: true,
      nestedPopularCulturePreserved: true, incompleteSubjectStatusHonest: true,
      previousMediaStructurePreserved: true, releaseReady: true
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
    const { report } = auditMediaPresseRedaksjonerAvishusPhase4({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log('Media Presse, redaksjoner og avishus OK: ' + report.canonicalCoverage.exactCoverage + ' emner, ' + report.summary.paragraphCount + ' avsnitt, ' + report.summary.claimCount + ' claims og ' + report.summary.sourceCount + ' kilder.');
  } catch (error) {
    console.error('Media Presse, redaksjoner og avishus FEIL: ' + error.message);
    process.exitCode = 1;
  }
}
