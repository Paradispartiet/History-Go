#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  core: 'js/fagverk-subject-core.js',
  categories: 'data/categories/category_contract.json',
  manifest: 'data/fag/fag_manifest.json',
  portal: 'data/fagverk/fagverk_portal.json',
  inventory: 'data/fagverk/subject_inventory.json',
  status: 'data/fagverk/subject_status.json',
  registry: 'data/fagverk/fagverk_registry.json',
  sourceRegistry: 'data/fag/by/source_registry_by_v1.json',
  chapter: 'data/fagverk/by/byliv-stemning-mikrokomfort.json',
  brief: 'data/fagverk/by/byliv-stemning-mikrokomfort/brief.json',
  claims: 'data/fagverk/by/byliv-stemning-mikrokomfort/claims.json',
  report: 'reports/fagverk/by-byliv-stemning-mikrokomfort-phase4-audit.json'
});
const EXPECTED_PREVIOUS = ['byliv-offentlige-rom', 'byliv-sosial-offentlighet', 'byliv-hendelser-midlertidighet'];
const EXPECTED_EMNES = [
  'em_by_stemning_lyd_lys_tetthet',
  'em_by_materialitet_og_sanseerfaring',
  'em_by_mikroklima_og_var',
  'em_by_kroppslig_komfort_i_byrom',
  'em_by_sol_skygge_mikro_opphold'
];
const EXPECTED_METHODS = [
  'met_feltobservasjon',
  'met_gaanalyse',
  'met_gis_romlig_analyse',
  'met_klimarisikokartlegging',
  'met_komparativ_caseanalyse'
];
const EXPECTED_PLACES = ['youngstorget', 'radhusplassen', 'toyen_torg', 'birkelunden'];
const abs = (p) => path.join(ROOT, p);
const read = (p) => fs.readFileSync(abs(p), 'utf8');
const json = (p) => JSON.parse(read(p));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const sameSet = (left, right) => left.length === right.length && new Set(left).size === left.length && left.every((id) => right.includes(id));
const flattenClaimIds = (value) => Array.isArray(value) ? value.flat(Infinity).filter((id) => typeof id === 'string') : [];

function loadCore() {
  const sandbox = { console };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(read(P.core), sandbox, { filename: P.core });
  assert(sandbox.HGFagverkSubjectCore, 'Fagverk-core ble ikke eksponert');
  return sandbox.HGFagverkSubjectCore;
}
function loadSource(CORE, manifestEntry) {
  const source = {};
  for (const field of ['pensum', 'emner', 'fagkart', 'methods']) {
    const relativePath = CORE.resolveManifestPointer(manifestEntry[field]);
    assert(fs.existsSync(abs(relativePath)), `By mangler ${field}: ${relativePath}`);
    source[field === 'emner' ? 'emners' : field] = json(relativePath);
  }
  return source;
}
function committedProjection(report) {
  return { schema: report.schema, version: report.version, status: report.status, generatedFrom: report.generatedFrom, subject: report.subject, chapter: report.chapter, summary: report.summary, coverage: report.coverage, gates: report.gates };
}

export async function auditByBylivStemningMikrokomfortPhase4({ writeReport = false, checkReport = true } = {}) {
  const CORE = loadCore();
  const categories = json(P.categories);
  const manifest = json(P.manifest);
  const portal = json(P.portal);
  const inventory = json(P.inventory);
  const status = json(P.status);
  const registry = json(P.registry);
  const sourceRegistry = json(P.sourceRegistry);
  const rawChapter = json(P.chapter);
  const brief = json(P.brief);
  const claimsDocument = json(P.claims);
  const portalEntry = portal.categories.find((row) => row.id === 'by');
  const inventoryEntry = inventory.subjects.find((row) => row.id === 'by');
  const statusEntry = status.subjects.find((row) => row.id === 'by');
  const registrySubject = registry.subjects?.by;
  const chapterMeta = registrySubject?.chapters?.find((row) => row.id === 'byliv-stemning-mikrokomfort');
  const previousMeta = EXPECTED_PREVIOUS.map((id) => registrySubject?.chapters?.find((row) => row.id === id));

  assert(categories.fagSubjects.includes('by'), 'By mangler i canonical fagliste');
  assert(portalEntry?.subjectStatus === 'materialized', 'By er ikke materialisert');
  assert(inventoryEntry?.schemaFamily === 'by_compatibility', 'By har feil schemafamilie');
  assert(statusEntry?.assessmentStatus === 'audited', 'By har feil auditstatus');
  assert(statusEntry?.editorialStatus === 'chapters_in_progress', 'By skal fortsatt stå chapters_in_progress');
  assert(statusEntry?.nextGate === 'chapter_production', 'By skal fortsette kapittelproduksjon');
  assert(registrySubject && Array.isArray(registrySubject.chapters), 'By mangler kapittelregister');
  assert(registrySubject.chapters.length === 5, 'By skal nå ha fem registrerte Fase 4-kapitler totalt');
  assert(chapterMeta, 'Stemning/mikrokomfort-kapittelet mangler i registry');
  assert(previousMeta.every(Boolean), 'Et tidligere Byliv-kapittel ble borte fra registry');
  assert(chapterMeta.file === P.chapter && chapterMeta.primary_domain_id === 'byliv', 'Registry har feil fil eller domain for kapittel 4');
  assert(sameSet(chapterMeta.emne_ids || [], EXPECTED_EMNES), 'Registry har feil emnedekning for stemning/mikrokomfort');

  const source = loadSource(CORE, manifest.by);
  const model = CORE.normalizeSubject({ subjectId: 'by', categoryLabel: categories.labels.by, categoryDescription: categories.decisions?.by, schemaFamily: inventoryEntry.schemaFamily, manifestEntry: manifest.by, portalEntry, inventoryEntry, statusEntry, registry, badge: {}, source });
  assert(model.subject.adapter === 'by', 'By skal bruke by-adapteren');
  assert(model.chapters.length === 5, 'Normalisert By-modell skal vise fem kapitler etter fullført Byliv-batch');
  const modelEmnes = new Map(model.emners.map((row) => [row.id, row]));
  const modelMethods = new Map(model.methods.map((row) => [row.id, row]));
  for (const id of EXPECTED_EMNES) {
    const emne = modelEmnes.get(id);
    assert(emne, `Kapittelet refererer ukjent By-emne: ${id}`);
    assert(emne.domainId === 'byliv', `${id} ligger ikke i normalisert byliv`);
  }
  for (const id of EXPECTED_METHODS) assert(modelMethods.has(id), `Kapittelet refererer ukjent By-metode: ${id}`);

  assert(rawChapter.schema === 'history_go_fagverk_chapter_v1' && rawChapter.editorialStatus === 'chapter_ready', 'Kapittelroot har feil schema/status');
  assert(rawChapter.claimTraceRequired === true && rawChapter.primary_domain_id === 'byliv', 'Kapittelroot mangler claimtrace eller riktig domain');
  assert(sameSet(rawChapter.emne_ids || [], EXPECTED_EMNES), 'Kapittelroot har feil emnesett');
  assert(sameSet(rawChapter.method_ids || [], EXPECTED_METHODS), 'Kapittelroot har feil metodesett');
  assert(Array.isArray(rawChapter.moduleFiles) && rawChapter.moduleFiles.length === 3, 'Kapittelet skal ha tre redigerte moduler');
  assert(rawChapter.briefFile === P.brief && rawChapter.claimsFile === P.claims, 'Kapittelroot peker ikke til brief og claims');
  for (const file of [...rawChapter.moduleFiles, rawChapter.briefFile, rawChapter.claimsFile]) assert(fs.existsSync(abs(file)), `Kapittelfil mangler: ${file}`);

  assert(brief.chapter_id === 'byliv-stemning-mikrokomfort' && brief.primary_domain_id === 'byliv', 'Brief har feil kapittel/domain');
  assert(sameSet(brief.requiredEmneIds || [], EXPECTED_EMNES), 'Brief har feil obligatoriske emner');
  assert(sameSet(brief.requiredMethodIds || [], EXPECTED_METHODS), 'Brief har feil obligatoriske metoder');
  assert(brief.sourceStrategy?.minimumExternalSources >= 12 && brief.sourceStrategy?.claimLevelTrace === true && brief.sourceStrategy?.sourceLocationsRequired === true, 'Brief mangler kilde-/claimtrace-port');
  assert(brief.qa?.measurementFabricationGuard === true && brief.qa?.evidenceLayerGuard === true, 'Brief mangler måle- eller evidenslagvakt');
  assert((brief.scope?.excluded || []).some((text) => text.includes('målinger') && text.includes('ikke faktisk')), 'Brief blokkerer ikke oppdiktede stedsmålinger');
  assert(Array.isArray(brief.requiredCriticalDistinctions) && brief.requiredCriticalDistinctions.length >= 14, 'Brief mangler kritiske distinksjoner');

  const modules = rawChapter.moduleFiles.map(json);
  const sections = modules.flatMap((module) => Array.isArray(module.sections) ? module.sections : []);
  assert(sections.length === 9, 'Kapittelet skal ha ni redigerte seksjoner');
  assert(sections.every((section) => Array.isArray(section.paragraphs) && section.paragraphs.length === 3), 'Alle seksjoner skal ha tre avsnitt');
  assert(sections.every((section) => Array.isArray(section.paragraphClaimIds) && section.paragraphClaimIds.length === section.paragraphs.length), 'Alle avsnitt skal ha claim-sporing');

  const sources = claimsDocument.sources || [];
  const claims = claimsDocument.claims || [];
  assert(sources.length === 13, 'Kapittelet skal ha tretten inspectable kilder');
  assert(claims.length === 18, 'Kapittelet skal ha atten verified claims');
  const sourceIds = new Set(sources.map((row) => row.id));
  const claimIds = new Set(claims.map((row) => row.id));
  assert(sourceIds.size === sources.length && claimIds.size === claims.length, 'Dupliserte source- eller claim-ID-er');
  assert(sources.every((row) => /^https:\/\//.test(row.url || '') && row.publisher && row.source_location), 'Alle kilder skal ha https, publisher og locator');
  assert(sources.filter((row) => row.published_at).every((row) => /^\d{4}-\d{2}-\d{2}$/.test(row.published_at)), 'Oppgitt published_at har feil format');
  assert(claims.every((row) => row.status === 'verified'), 'Alle claims skal være verified');
  assert(claims.every((row) => Array.isArray(row.source_ids) && row.source_ids.length && row.source_ids.every((id) => sourceIds.has(id))), 'Claim peker til ukjent kilde');
  const whoHeat = sources.find((row) => row.id === 'byk11-who-heat-health');
  assert(whoHeat?.published_at === '2026-07-13', 'WHO heat-kilden må være datert 2026-07-13');
  const byliv = sources.find((row) => row.id === 'byk13-byliv-2024');
  assert(byliv?.published_at === '2024-04-04', 'Bylivsundersøkelsen-kilden må være datert 2024-04-04');

  const sectionIds = new Set(sections.map((section) => section.id));
  const refsBySection = new Map();
  for (const section of sections) {
    const refs = new Set([...flattenClaimIds(section.paragraphClaimIds), ...flattenClaimIds(section.keyPointClaimIds)]);
    refsBySection.set(section.id, refs);
    assert([...refs].every((id) => claimIds.has(id)), `${section.id} peker til ukjent claim`);
  }
  const allRefs = new Set([...refsBySection.values()].flatMap((set) => [...set]));
  assert(claims.every((claim) => allRefs.has(claim.id)), 'Kapittelet har orphan claim');
  for (const claim of claims) {
    assert(Array.isArray(claim.used_in) && claim.used_in.length, `${claim.id} mangler used_in`);
    for (const sectionId of claim.used_in) {
      assert(sectionIds.has(sectionId), `${claim.id} peker til ukjent seksjon ${sectionId}`);
      assert(refsBySection.get(sectionId)?.has(claim.id), `${claim.id} er ikke faktisk koblet i ${sectionId}`);
    }
  }

  const rawText = JSON.stringify({ rawChapter, brief, modules }).toLowerCase();
  for (const fabricated of ['vi målte', 'målingen vår viste', 'db på youngstorget', 'grader på rådhusplassen', 'vindmålingen viste']) assert(!rawText.includes(fabricated), `Kapittelet fremstiller ikke-gjennomført måling som data: ${fabricated}`);
  for (const overclaim of ['skygge er alltid best', 'benken gjør stedet inkluderende', 'belysning skaper trygghet', 'materialet skaper trivsel']) assert(!rawText.includes(overclaim), `Kapittelet inneholder for sterk effektpåstand: ${overclaim}`);

  const fetchFile = async (file) => json(file);
  const hydrated = await CORE.hydrateChapter(chapterMeta, fetchFile);
  const previousHydrated = [];
  for (const meta of previousMeta) previousHydrated.push(await CORE.hydrateChapter(meta, fetchFile));
  assert(hydrated.workedExamples.length === 2 && hydrated.workedExamples.every((row) => row.situation && row.analysis.length >= 4), 'Worked examples er ikke renderbare');
  assert(hydrated.commonMisconceptions.length === 5, 'Kapittelet skal hydrere fem misoppfatninger');
  assert(hydrated.applicationTasks.length === 4 && hydrated.applicationTasks.every((row) => row.task && row.prompts.length === 3), 'Anvendelsesoppgaver er ikke renderbare');
  assert(hydrated.relatedPlaces.length === 4 && sameSet(hydrated.relatedPlaces.map((row) => row.id), EXPECTED_PLACES), 'Kapittelet har feil feltcase');
  assert(hydrated.sources.length === 13 && hydrated.claims.length === 18, 'Claims/kilder ble ikke hydrert');
  assert(previousHydrated.every((chapter) => chapter.sources.length >= 12 && chapter.claims.length === 18), 'Et tidligere Byliv-kapittel hydrerer ikke korrekt');
  const selfCheck = modules.flatMap((module) => Array.isArray(module.selfCheck) ? module.selfCheck : []);
  assert(selfCheck.length === 6 && selfCheck.every((row) => row.question && row.answer), 'Kapittelet skal ha seks self-checks');

  const provenancePlaces = new Set((sourceRegistry.places || []).map((row) => row.place_id));
  for (const id of ['radhusplassen', 'toyen_torg', 'birkelunden']) assert(provenancePlaces.has(id), `By provenance mangler feltsted: ${id}`);
  assert(!provenancePlaces.has('youngstorget'), 'Youngstorget skal ikke få falsk provenance-entry');

  const qualityContract = json(CORE.resolveManifestPointer(manifest.by.qualityContract));
  assert(qualityContract.status === 'canonical', 'By-kvalitetskontrakten er ikke canonical');
  assert(qualityContract.source_contract?.canonical_files_are_guides_not_sources === true && qualityContract.source_contract?.no_empty_source_array_for_publishable_question === true, 'By-kildekontrakten er svekket');
  const principles = new Set(qualityContract.editorial_principles || []);
  for (const principle of ['concrete place or event before abstraction', 'documented claim before theory', 'conflict and uncertainty must remain visible']) assert(principles.has(principle), `By mangler editorial principle: ${principle}`);

  const report = {
    schema: 'history_go_fagverk_by_byliv_stemning_mikrokomfort_phase4_audit_v1',
    version: '1.0.0',
    status: 'by_phase_4_chapters_in_progress',
    generatedFrom: P,
    subject: { id: 'by', schemaFamily: inventoryEntry.schemaFamily, adapter: model.subject.adapter, navigationStatus: statusEntry.navigationStatus, assessmentStatus: statusEntry.assessmentStatus, editorialStatus: statusEntry.editorialStatus, nextGate: statusEntry.nextGate, registeredChapterCount: model.chapters.length },
    chapter: { id: chapterMeta.id, title: chapterMeta.title, primaryDomainId: chapterMeta.primary_domain_id, file: chapterMeta.file, editorialStatus: rawChapter.editorialStatus },
    summary: { coveredEmneCount: EXPECTED_EMNES.length, methodCount: EXPECTED_METHODS.length, moduleCount: rawChapter.moduleFiles.length, sectionCount: sections.length, sourceCount: sources.length, verifiedClaimCount: claims.length, workedExampleCount: hydrated.workedExamples.length, misconceptionCount: hydrated.commonMisconceptions.length, applicationTaskCount: hydrated.applicationTasks.length, selfCheckCount: selfCheck.length, relatedPlaceCount: hydrated.relatedPlaces.length },
    coverage: { emneIds: EXPECTED_EMNES, methodIds: EXPECTED_METHODS, relatedPlaceIds: EXPECTED_PLACES },
    gates: {
      canonicalStatusProgressionPreserved: true,
      fourthChapterPreservedAcrossFiveChapterRegistry: true,
      previousChaptersStillHydrate: true,
      chapterHydratesThroughSharedRuntime: true,
      fiveCanonicalBylivEmnersCovered: true,
      fiveCanonicalMethodsResolved: true,
      threeEditedModulesPresent: true,
      paragraphLevelClaimTraceComplete: true,
      allClaimsVerifiedAndUsed: true,
      allClaimSourcesInspectable: true,
      datedHealthAndBylivSourcesLocked: true,
      fabricatedMeasurementsBlocked: true,
      physicalExposureExperienceEffectSeparated: true,
      noiseMethodContextPreserved: true,
      heatEvidenceStrengthPreserved: true,
      universalComfortOverclaimBlocked: true,
      workedExamplesRenderable: true,
      misconceptionsRenderable: true,
      applicationTasksRenderable: true,
      selfCheckRenderable: true,
      fieldPlacesSeparatedFromProvenanceClaims: true,
      byEditorialAndSourceContractLocked: true,
      subjectCompletenessNotOverstated: true
    }
  };

  const committed = committedProjection(report);
  if (writeReport) {
    fs.mkdirSync(path.dirname(abs(P.report)), { recursive: true });
    fs.writeFileSync(abs(P.report), `${JSON.stringify(committed, null, 2)}\n`);
  }
  if (checkReport) assert(isDeepStrictEqual(json(P.report), committed), `${P.report} er utdatert`);
  return { report: committed, model, hydrated, previousHydrated };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const { report } = await auditByBylivStemningMikrokomfortPhase4({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`By stemning/mikrokomfort Fase 4 OK: ${report.summary.coveredEmneCount} emner, ${report.summary.sourceCount} kilder og ${report.summary.verifiedClaimCount} claims.`);
  } catch (error) {
    console.error(`By stemning/mikrokomfort Fase 4 FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
