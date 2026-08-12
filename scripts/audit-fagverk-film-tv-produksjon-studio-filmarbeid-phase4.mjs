#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { auditFilmTvPhase3 } from './audit-fagverk-film-tv-phase3.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  chapter: 'data/fagverk/film_tv/produksjon-studio-og-filmarbeid.json',
  brief: 'data/fagverk/film_tv/produksjon-studio-og-filmarbeid/brief.json',
  claims: 'data/fagverk/film_tv/produksjon-studio-og-filmarbeid/claims.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  emners: 'data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json',
  methods: 'data/fag/TV_og_Film/methods_film_tv_canonical_v4_5.json',
  inventory: 'data/fag/TV_og_Film/film_tv_variable_inventory_v1.json',
  places: 'data/places/places_index.json',
  report: 'reports/fagverk/film-tv-produksjon-studio-filmarbeid-phase4-audit.json'
});
const EXPECTED_EMNES = [
  'em_film_tv_audiovisuell_form', 'em_film_tv_digital_etterarbeid',
  'em_film_tv_filmarbeidsliv', 'em_film_tv_filmokonomi', 'em_film_tv_filmproduksjon',
  'em_film_tv_filmrytme', 'em_film_tv_fortellingsstruktur', 'em_film_tv_fotografi_film',
  'em_film_tv_kamera_bildearbeid', 'em_film_tv_klipp_montasje',
  'em_film_tv_kollektivt_filmwerk', 'em_film_tv_kringkastingsproduksjon',
  'em_film_tv_lys_lyd', 'em_film_tv_manus_dramaturgi', 'em_film_tv_postproduksjon',
  'em_film_tv_produksjonsteam', 'em_film_tv_produsent_finansiering',
  'em_film_tv_studio_produksjonsrom', 'em_film_tv_tv_hus_redaksjon',
  'em_film_tv_usynlig_filmproduksjon'
];
const EXPECTED_METHODS = [
  'met_film_tv_lysanalyse', 'met_film_tv_lydanalyse',
  'met_film_tv_postproduksjonsanalyse', 'met_film_tv_digital_arbeidsflytanalyse',
  'met_film_tv_arbeidslivsanalyse', 'met_film_tv_produksjonskulturanalyse',
  'met_film_tv_produsentanalyse', 'met_film_tv_finansieringsanalyse',
  'met_film_tv_studioanalyse', 'met_film_tv_produksjonsanalyse',
  'met_film_tv_klippanalyse', 'met_film_tv_montasjeanalyse',
  'met_film_tv_manusanalyse', 'met_film_tv_dramaturgianalyse',
  'met_film_tv_kameraanalyse', 'met_film_tv_bildeanalyse',
  'met_film_tv_arbeidsanalyse', 'met_film_tv_team_analyse',
  'met_film_tv_tv_husanalyse', 'met_film_tv_redaksjonsanalyse'
];
const EXPECTED_PLACES = ['nrk_huset_marienlyst', 'hartvig_nissens_skole_skam', 'oslo_met_pilestredet', 'lisbon_tobis_portuguesa'];
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

export function auditFilmTvProduksjonStudioFilmarbeidPhase4({ writeReport = false, checkReport = true } = {}) {
  const phase3 = auditFilmTvPhase3({ checkReport });
  const chapter = json(P.chapter);
  const brief = json(P.brief);
  const claimsDoc = json(P.claims);
  const registry = json(P.registry);
  const status = json(P.status);
  const emners = json(P.emners);
  const methodsDoc = json(P.methods);
  const inventory = json(P.inventory);
  const places = json(P.places);
  const statusEntry = status.subjects.find((row) => row.id === 'film_tv');
  const registrySubject = registry.subjects.film_tv;
  const registryChapter = registrySubject.chapters.find((row) => row.id === chapter.id);
  const aliasTargets = new Map();
  for (const row of inventory.emner) for (const alias of row.legacy_aliases) {
    if (!aliasTargets.has(alias)) aliasTargets.set(alias, []);
    aliasTargets.get(alias).push(row.emne_id);
  }
  const resolvedEmneIds = [...new Set(EXPECTED_EMNES.flatMap((id) => aliasTargets.get(id) || []))];

  assert(chapter.schema === 'history_go_fagverk_chapter_v1', 'Film & TV-kapittelet har feil schema');
  assert(chapter.subject === 'film_tv' && chapter.subject_id === 'film_tv', 'Film & TV-kapittelet har feil fag');
  assert(chapter.primary_domain_id === 'produksjon_arbeid_teknologi_praksis', 'Kapittelet har feil migrert eierdomene');
  assert(chapter.editorialStatus === 'chapter_ready' && chapter.claimTraceRequired === true, 'Kapittelet er ikke claimsporet chapter_ready');
  assert(isDeepStrictEqual(chapter.emne_ids, resolvedEmneIds), 'Kapittelet dekker ikke de 20 canonicale aliasmålene i riktig rekkefølge');
  assert(new Set(chapter.emne_ids).size === 20, 'Film & TV-kapittelet har duplikate emner');
  assert(registrySubject.chapters.length >= 2 && registryChapter, 'Film & TV-registeret skal bevare produksjonskapittelet');
  assert(registryChapter.file === P.chapter && registryChapter.primary_domain_id === 'produksjon_arbeid_teknologi_praksis', 'Registry-kapittelet er ikke projisert til migrert eierdomene');
  assert(isDeepStrictEqual(registryChapter.emne_ids, resolvedEmneIds), 'Registry-emnene er ikke projisert gjennom legacyaliasene');
  assert(statusEntry.editorialStatus === 'chapters_in_progress', 'Film & TV skal stå chapters_in_progress');
  assert(['remaining_domain_chapter_production', 'curriculum_completeness_refactor', 'canonical_inventory_migration', 'canonical_inventory_migrated_existing_chapter_reaudit', 'canonical_chapter_reaudit_complete_learning_order_plan', 'learning_order_plan_complete_first_chapter_source_brief', 'audiovisual_form_source_brief_complete_full_chapter_production', 'audiovisual_form_full_chapter_complete_next_unit_source_brief', 'narrative_viewpoint_genre_source_brief_complete_full_chapter_production', 'narrative_viewpoint_genre_full_chapter_complete_next_unit_source_brief', 'seriality_format_adaptation_source_brief_complete_full_chapter_production', 'seriality_format_adaptation_full_chapter_complete_next_unit_source_brief', 'film_history_movements_historiography_source_brief_complete_full_chapter_production', 'film_history_movements_historiography_full_chapter_complete_next_unit_source_brief', 'television_platforms_participation_source_brief_complete_full_chapter_production', 'television_platforms_participation_full_chapter_complete_next_unit_source_brief'].includes(statusEntry.nextGate), 'Film & TV har feil neste port');
  assert(phase3.report.summary.domainCount === 10 && phase3.report.summary.emneCount === 192, 'Det migrerte Film & TV-inventaret er ikke bevart');
  assert(phase3.report.summary.registeredChapterCount >= 2, 'Fase 3-auditen ser ikke de bevarte Film & TV-kapitlene');

  const canonicalEmneIds = new Set(emners.map((row) => row.emne_id));
  assert(EXPECTED_EMNES.every((id) => aliasTargets.has(id)), 'Kapittelets legacy-ID mangler aliasmål');
  assert(resolvedEmneIds.every((id) => canonicalEmneIds.has(id)), 'Kapittelets aliasmål peker til ukjent Film & TV-emne');
  assert(resolvedEmneIds.length === 20, 'Kapittelets 20 legacy-ID-er skal gi 20 avgrensede canonicale emner');
  const canonicalMethodIds = new Set(methodsDoc.methods.map((row) => row.method_id));
  assert(isDeepStrictEqual(chapter.method_ids, EXPECTED_METHODS), 'Kapittelet har feil canonicalt metodeutvalg');
  assert(chapter.method_ids.every((id) => canonicalMethodIds.has(id)), 'Kapittelet har uløst metode-ID');

  assert(brief.schema === 'history_go_fagverk_chapter_brief_v1' && brief.chapter_id === chapter.id, 'Briefen er usynkronisert');
  assert(isDeepStrictEqual(brief.requiredEmneIds, resolvedEmneIds), 'Briefen har feil canonical emnedekning');
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
  assert(/studio.{0,180}(ikke|skille).{0,120}(produksjon|prosjekt)|studiofasilitet.{0,120}produksjon/is.test(combined), 'Studio/produksjon-vakten mangler');
  assert(/kamera.{0,180}(ikke|uten).{0,120}(godt|kvalitet|resultat)|utstyr.{0,160}(ikke|uten).{0,100}kvalitet/is.test(combined), 'Kamera/kvalitet-vakten mangler');
  assert(/opptakslyd.{0,180}(sluttmiks|lyddesign|lydredigering)|skille.{0,80}opptakslyd/is.test(combined), 'Opptakslyd/miks-vakten mangler');
  assert(/rå(opptak|materiale).{0,180}(redigert|klipp|master)|opptaksmateriale.{0,140}klippeversjon/is.test(combined), 'Råopptak/redigert sekvens-vakten mangler');
  assert(/regissør.{0,140}(ikke|alene|kollektiv)|kollektivt filmverk/is.test(combined), 'Regissør/kollektiv-vakten mangler');
  assert(/(budsjett|tilskudd).{0,180}(ikke|uten).{0,120}(kvalitet|kunstnerisk)|finansiering.{0,140}kvalitet/is.test(combined), 'Budsjett/kvalitet-vakten mangler');
  assert(/rulletekst.{0,180}(ikke|utover|kontrakt)|manglende kreditering/is.test(combined), 'Rulletekst/arbeidsstokk-vakten mangler');
  assert(/7,5 timer|37,5 timer|risikovurdering.{0,160}(konkret|tilpass)/is.test(combined), 'Arbeidstid/HMS-vakten mangler');

  const report = {
    schema: 'history_go_fagverk_film_tv_produksjon_studio_arbeid_phase4_audit_v1', version: '1.0.0',
    status: 'film_tv_produksjon_studio_arbeid_reaudited_20_canonical', generatedFrom: P,
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
      ownerDomainId: 'produksjon_arbeid_teknologi_praksis', legacySourceEmneIds: EXPECTED_EMNES,
      requiredEmneIds: resolvedEmneIds, coveredEmneIds: chapter.emne_ids, aliasResolvedEmneIds: resolvedEmneIds,
      exactCoverage: '20/20 canonical emner fra 20/20 legacyaliases', remainingDomainCount: 10
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
      studioProductionGuard: true, cameraQualityGuard: true, acquisitionMixGuard: true,
      rawEditedGuard: true, directorCollectiveGuard: true, budgetQualityGuard: true,
      creditsWorkforceGuard: true, workingTimeSafetyGuard: true,
      previousFilmTvStructurePreserved: true, legacyAliasesResolveToMigratedCanon: true, releaseReady: true
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
    const { report } = auditFilmTvProduksjonStudioFilmarbeidPhase4({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Film & TV Produksjon, studio og filmarbeid OK: ${report.canonicalCoverage.exactCoverage} emner, ${report.summary.paragraphCount} avsnitt, ${report.summary.claimCount} claims og ${report.summary.sourceCount} kilder.`);
  } catch (error) {
    console.error(`Film & TV Produksjon, studio og filmarbeid FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
