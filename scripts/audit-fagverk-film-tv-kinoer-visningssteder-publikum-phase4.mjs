#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { auditFilmTvPhase3 } from './audit-fagverk-film-tv-phase3.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  chapter: 'data/fagverk/film_tv/kinoer-visningssteder-og-publikum.json',
  brief: 'data/fagverk/film_tv/kinoer-visningssteder-og-publikum/brief.json',
  claims: 'data/fagverk/film_tv/kinoer-visningssteder-og-publikum/claims.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  emners: 'data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json',
  methods: 'data/fag/TV_og_Film/methods_film_tv_canonical_v4_5.json',
  places: 'data/places/places_index.json',
  report: 'reports/fagverk/film-tv-kinoer-visningssteder-publikum-phase4-audit.json'
});
const EXPECTED_EMNES = [
  'em_film_tv_besokstall', 'em_film_tv_cinematek_filmarv', 'em_film_tv_distribusjon_tilgang',
  'em_film_tv_filmfestival_premiere', 'em_film_tv_filmhistorisk_formidling', 'em_film_tv_filmklubb_nisje',
  'em_film_tv_kino_fellesrom', 'em_film_tv_kinoarkitektur', 'em_film_tv_kollektiv_filmhukommelse',
  'em_film_tv_kuratering_publikum', 'em_film_tv_offentlig_filmbegivenhet', 'em_film_tv_plattformpublikum',
  'em_film_tv_publikumsdata', 'em_film_tv_publikumsminne', 'em_film_tv_publikumsopplevelse',
  'em_film_tv_seervaner', 'em_film_tv_stromming_fragmentering', 'em_film_tv_tv_ritualer',
  'em_film_tv_visningspolitikk', 'em_film_tv_visningsrom_estetikk'
];
const EXPECTED_METHODS = [
  'met_film_tv_publikumsdataanalyse', 'met_film_tv_statistikkanalyse',
  'met_film_tv_cinematekanalyse', 'met_film_tv_filmarvsanalyse',
  'met_film_tv_distribusjonsanalyse', 'met_film_tv_tilgangsanalyse',
  'met_film_tv_festivalanalyse', 'met_film_tv_premiereanalyse',
  'met_film_tv_filmklubbanalyse', 'met_film_tv_kurateringsanalyse',
  'met_film_tv_kinoanalyse', 'met_film_tv_publikumsanalyse',
  'met_film_tv_arkitekturanalyse', 'met_film_tv_visningsromanalyse',
  'met_film_tv_minneanalyse', 'met_film_tv_kollektiv_hukommelsesanalyse',
  'met_film_tv_strommeanalyse', 'met_film_tv_plattformanalyse',
  'met_film_tv_tv_resepsjonsanalyse', 'met_film_tv_seervaneanalyse'
];
const EXPECTED_PLACES = ['colosseum_kino', 'cinemateket_oslo', 'vega_scene', 'gimle_kino'];
const abs = (file) => path.join(ROOT, file);
const json = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const assert = (ok, message) => { if (!ok) throw new Error(message); };

function committedProjection(report) {
  return {
    schema: report.schema, version: report.version, status: report.status,
    generatedFrom: report.generatedFrom, subject: report.subject, chapter: report.chapter,
    canonicalCoverage: report.canonicalCoverage, summary: report.summary, gates: report.gates
  };
}

export function auditFilmTvKinoerVisningsstederPublikumPhase4({ writeReport = false, checkReport = true } = {}) {
  const phase3 = auditFilmTvPhase3({ checkReport });
  const chapter = json(P.chapter);
  const brief = json(P.brief);
  const claimsDoc = json(P.claims);
  const registry = json(P.registry);
  const status = json(P.status);
  const emners = json(P.emners);
  const methodsDoc = json(P.methods);
  const places = json(P.places);
  const statusEntry = status.subjects.find((row) => row.id === 'film_tv');
  const registrySubject = registry.subjects.film_tv;
  const registryChapter = registrySubject.chapters.find((row) => row.id === chapter.id);

  assert(chapter.schema === 'history_go_fagverk_chapter_v1', 'Film & TV-kapittelet har feil schema');
  assert(chapter.subject === 'film_tv' && chapter.subject_id === 'film_tv', 'Film & TV-kapittelet har feil fag');
  assert(chapter.primary_domain_id === 'kinoer_visningssteder_publikum', 'Kapittelet har feil eierdomene');
  assert(chapter.editorialStatus === 'chapter_ready' && chapter.claimTraceRequired === true, 'Kapittelet er ikke claimsporet chapter_ready');
  assert(isDeepStrictEqual(chapter.emne_ids, EXPECTED_EMNES), 'Kapittelet dekker ikke de 20 canonicale emnene i riktig rekkefølge');
  assert(new Set(chapter.emne_ids).size === 20, 'Film & TV-kapittelet har duplikate emner');
  assert(registrySubject.chapters.length >= 1 && registrySubject.chapters.length <= 6 && registryChapter, 'Film & TV-registeret skal bevare kapittel 1 gjennom videre progresjon');
  assert(registryChapter.file === P.chapter && registryChapter.primary_domain_id === 'kinoer_visningssteder_publikum', 'Registry-kapittelet er usynkronisert');
  assert(isDeepStrictEqual(registryChapter.emne_ids, EXPECTED_EMNES), 'Registry-emnene er usynkronisert');
  assert(statusEntry.editorialStatus === 'chapters_in_progress', 'Film & TV skal stå chapters_in_progress');
  assert(['remaining_domain_chapter_production', 'curriculum_completeness_refactor', 'canonical_inventory_migration'].includes(statusEntry.nextGate), 'Film & TV har feil neste port');
  assert(phase3.report.summary.domainCount === 6 && phase3.report.summary.emneCount === 120, 'Film & TV-baseline er ikke bevart');
  assert(phase3.report.summary.registeredChapterCount === registrySubject.chapters.length, 'Fase 3-auditen er usynkronisert med Film & TV-registeret');

  const canonicalEmneIds = new Set(emners.map((row) => row.emne_id));
  assert(EXPECTED_EMNES.every((id) => canonicalEmneIds.has(id)), 'Kapittelet peker til ukjent Film & TV-emne');
  const domain = phase3.model.domainsById.get('kinoer_visningssteder_publikum');
  assert(domain && isDeepStrictEqual([...domain.emneIds], EXPECTED_EMNES), 'Canonical domeneeierskap er usynkronisert');
  const canonicalMethodIds = new Set(methodsDoc.methods.map((row) => row.method_id));
  assert(isDeepStrictEqual(chapter.method_ids, EXPECTED_METHODS), 'Kapittelet har feil canonicalt metodeutvalg');
  assert(chapter.method_ids.every((id) => canonicalMethodIds.has(id)), 'Kapittelet har uløst metode-ID');

  assert(brief.schema === 'history_go_fagverk_chapter_brief_v1' && brief.chapter_id === chapter.id, 'Briefen er usynkronisert');
  assert(isDeepStrictEqual(brief.requiredEmneIds, EXPECTED_EMNES), 'Briefen har feil emnedekning');
  assert(isDeepStrictEqual(brief.requiredMethodIds, EXPECTED_METHODS), 'Briefen har feil metodedekning');
  assert(brief.sourceStrategy.minimumExternalSources >= 18 && brief.sourceStrategy.claimLevelTrace === true, 'Briefens kildestrategi er for svak');
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
  assert(claimsDoc.sources.length === 22, 'Kapittelet skal ha 22 kilder');
  assert(claimsDoc.claims.length === 27, 'Kapittelet skal ha 27 claims');
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
  assert(/verk.{0,140}(ikke|skille).{0,100}visning|visningshendelse.{0,140}(verk|kopi|strøm)/is.test(combined), 'Verk/visningshendelse-vakten mangler');
  assert(/felles.{0,160}(ikke|uten).{0,100}(identisk|samme).{0,80}(opplevelse|reaksjon)|identisk publikumsopplevelse/is.test(combined), 'Fellesrom/identisk opplevelse-vakten mangler');
  assert(/besøkstall.{0,160}(ikke|uten).{0,100}(tilfredshet|opplevelse|likte)|volum.{0,100}(ikke|krever)/is.test(combined), 'Besøkstall/opplevelse-vakten mangler');
  assert(/tilgang.{0,140}(ikke|skille).{0,100}(bruk|tidsbruk)|abonnement.{0,120}(ikke|forskjellig).{0,80}bruk/is.test(combined), 'Tilgang/bruk-vakten mangler');
  assert(/program.{0,160}(ikke|utvalg).{0,100}(nøytral|hele|kanon)|kurater.{0,120}(ikke|utvalg)/is.test(combined), 'Program/kanon-vakten mangler');
  assert(/premiere.{0,160}(ikke|uten).{0,100}(varig|historisk|betydning)|festivalstatus.{0,120}(ikke|lansering)/is.test(combined), 'Premiere/betydning-vakten mangler');
  assert(/minne.{0,180}(arkiv|program|spor|sammenhold)|arkiv.{0,160}(ikke|alene).{0,100}(husker|minne)/is.test(combined), 'Publikumsminne/arkiv-vakten mangler');

  const report = {
    schema: 'history_go_fagverk_film_tv_kinoer_visningssteder_publikum_phase4_audit_v1', version: '1.0.0',
    status: 'film_tv_kinoer_visningssteder_publikum_canonical_20_of_20', generatedFrom: P,
    subject: {
      id: 'film_tv', canonicalDomainCount: phase3.report.summary.domainCount,
      canonicalEmneCount: phase3.report.summary.emneCount, registeredChapterCount: registrySubject.chapters.length,
      editorialStatus: statusEntry.editorialStatus, nextGate: statusEntry.nextGate
    },
    chapter: {
      id: chapter.id, title: chapter.title, primaryDomainId: chapter.primary_domain_id,
      moduleFiles: chapter.moduleFiles, briefFile: chapter.briefFile, claimsFile: chapter.claimsFile,
      relatedPlaceIds: chapter.relatedPlaces.map((row) => row.id)
    },
    canonicalCoverage: {
      ownerDomainId: 'kinoer_visningssteder_publikum', requiredEmneIds: EXPECTED_EMNES,
      coveredEmneIds: chapter.emne_ids, exactCoverage: '20/20', remainingDomainCount: 6 - registrySubject.chapters.length
    },
    summary: {
      moduleCount: modules.length, sectionCount: sections.length,
      paragraphCount: sections.reduce((sum, row) => sum + row.paragraphs.length, 0),
      conceptCount: modules[0].value.concepts.length,
      workedExampleCount: modules[1].value.workedExamples.length,
      misconceptionCount: modules[1].value.commonMisconceptions.length,
      applicationTaskCount: modules[2].value.applicationTasks.length,
      selfCheckCount: modules[2].value.selfCheck.length, methodCount: chapter.method_ids.length,
      sourceCount: claimsDoc.sources.length, claimCount: claimsDoc.claims.length,
      placeCaseCount: chapter.relatedPlaces.length
    },
    gates: {
      canonicalOwnerDomain: true, exactTwentyOfTwentyEmneCoverage: true,
      allMethodReferencesResolved: true, threeEditedModules: true, paragraphLevelClaimTrace: true,
      allClaimsVerifiedAndUsed: true, allSourcesUsedAndInspectable: true, canonicalPlacesResolved: true,
      chapterSourcesRenderable: true, chapterPlacesRenderable: true, misconceptionsRenderable: true,
      workScreeningEventGuard: true, sharedRoomExperienceGuard: true, attendanceExperienceGuard: true,
      accessUseGuard: true, curationCanonGuard: true, premiereSignificanceGuard: true,
      audienceMemoryArchiveGuard: true, previousFilmTvStructurePreserved: true, releaseReady: true
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
    const { report } = auditFilmTvKinoerVisningsstederPublikumPhase4({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Film & TV Kinoer, visningssteder og publikum OK: ${report.canonicalCoverage.exactCoverage} emner, ${report.summary.paragraphCount} avsnitt, ${report.summary.claimCount} claims og ${report.summary.sourceCount} kilder.`);
  } catch (error) {
    console.error(`Film & TV Kinoer, visningssteder og publikum FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
