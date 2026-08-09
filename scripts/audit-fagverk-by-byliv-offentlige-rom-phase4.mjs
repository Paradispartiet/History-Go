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
  chapter: 'data/fagverk/by/byliv-offentlige-rom.json',
  brief: 'data/fagverk/by/byliv-offentlige-rom/brief.json',
  claims: 'data/fagverk/by/byliv-offentlige-rom/claims.json',
  report: 'reports/fagverk/by-byliv-offentlige-rom-phase4-audit.json'
});
const EXPECTED_EMNES = [
  'em_by_offentlige_rom_motesteder',
  'em_by_torg_plasser_som_scene',
  'em_by_parker_som_sosial_infrastruktur',
  'em_by_lek_trening_uformell_aktivitet',
  'em_by_stillhet_vs_aktivitet_i_grontrom',
  'em_by_opphold_vs_gjennomgang',
  'em_by_gangstrommer_snarveier'
];
const EXPECTED_METHODS = ['met_feltobservasjon', 'met_gaanalyse', 'met_gis_romlig_analyse'];
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
  return {
    schema: report.schema,
    version: report.version,
    status: report.status,
    generatedFrom: report.generatedFrom,
    subject: report.subject,
    chapter: report.chapter,
    summary: report.summary,
    coverage: report.coverage,
    gates: report.gates
  };
}

export async function auditByBylivOffentligeRomPhase4({ writeReport = false, checkReport = true } = {}) {
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
  const chapterMeta = registrySubject?.chapters?.find((row) => row.id === 'byliv-offentlige-rom');

  assert(categories.fagSubjects.includes('by'), 'By mangler i canonical fagliste');
  assert(portalEntry?.subjectStatus === 'materialized', 'By er ikke materialisert');
  assert(portalEntry?.subjectPage === 'fagverk.html?subject=by', 'By har feil fagsiderute');
  assert(inventoryEntry?.schemaFamily === 'by_compatibility', 'By har feil schemafamilie');
  assert(statusEntry?.assessmentStatus === 'audited', 'By har feil auditstatus');
  assert(statusEntry?.editorialStatus === 'chapters_in_progress', 'By skal stå chapters_in_progress etter første redigerte kapittel');
  assert(statusEntry?.nextGate === 'chapter_production', 'By skal fortsette sammenhengende kapittelproduksjon');
  assert(registrySubject && Array.isArray(registrySubject.chapters), 'By mangler kapittelregister');
  assert(registrySubject.chapters.length === 3, 'By skal nå ha tre registrerte Fase 4-kapitler');
  assert(chapterMeta, 'Byliv-kapittelet mangler i registry');
  assert(chapterMeta.file === P.chapter, 'Registry peker ikke til canonical Byliv-kapittel');
  assert(chapterMeta.primary_domain_id === 'byliv', 'Byliv-kapittelet har feil primary domain');
  assert(sameSet(chapterMeta.emne_ids || [], EXPECTED_EMNES), 'Registry har feil emnedekning for Byliv-kapittelet');

  const source = loadSource(CORE, manifest.by);
  const model = CORE.normalizeSubject({
    subjectId: 'by',
    categoryLabel: categories.labels.by,
    categoryDescription: categories.decisions?.by,
    schemaFamily: inventoryEntry.schemaFamily,
    manifestEntry: manifest.by,
    portalEntry,
    inventoryEntry,
    statusEntry,
    registry,
    badge: {},
    source
  });
  assert(model.subject.adapter === 'by', 'By skal bruke by-adapteren');
  assert(model.chapters.length === 3, 'Normalisert By-modell skal vise tre kapitler etter tredje Byliv-batch');
  const modelEmnes = new Map(model.emners.map((row) => [row.id, row]));
  const modelMethods = new Map(model.methods.map((row) => [row.id, row]));
  for (const id of EXPECTED_EMNES) {
    const emne = modelEmnes.get(id);
    assert(emne, `Kapittelet refererer ukjent By-emne: ${id}`);
    assert(emne.domainId === 'byliv', `${id} ligger ikke i byliv`);
  }
  for (const id of EXPECTED_METHODS) assert(modelMethods.has(id), `Kapittelet refererer ukjent By-metode: ${id}`);

  assert(rawChapter.schema === 'history_go_fagverk_chapter_v1', 'Kapittelroot har feil schema');
  assert(rawChapter.editorialStatus === 'chapter_ready', 'Kapittelroot er ikke chapter_ready');
  assert(rawChapter.claimTraceRequired === true, 'Kapittelroot mangler bindende claim-sporing');
  assert(rawChapter.primary_domain_id === 'byliv', 'Kapittelroot har feil domain');
  assert(sameSet(rawChapter.emne_ids || [], EXPECTED_EMNES), 'Kapittelroot har feil emnesett');
  assert(sameSet(rawChapter.method_ids || [], EXPECTED_METHODS), 'Kapittelroot har feil metodesett');
  assert(Array.isArray(rawChapter.moduleFiles) && rawChapter.moduleFiles.length === 3, 'Kapittelet skal ha tre redigerte moduler');
  assert(rawChapter.briefFile === P.brief && rawChapter.claimsFile === P.claims, 'Kapittelroot peker ikke til brief og claims');
  for (const file of [...rawChapter.moduleFiles, rawChapter.briefFile, rawChapter.claimsFile]) assert(fs.existsSync(abs(file)), `Kapittelfil mangler: ${file}`);

  assert(brief.chapter_id === 'byliv-offentlige-rom', 'Brief har feil kapittel-ID');
  assert(brief.primary_domain_id === 'byliv', 'Brief har feil domain');
  assert(sameSet(brief.requiredEmneIds || [], EXPECTED_EMNES), 'Brief har feil obligatoriske emner');
  assert(sameSet(brief.requiredMethodIds || [], EXPECTED_METHODS), 'Brief har feil obligatoriske metoder');
  assert(brief.sourceStrategy?.minimumExternalSources === 10, 'Brief har feil minimumskrav til eksterne kilder');
  assert(brief.sourceStrategy?.claimLevelTrace === true && brief.sourceStrategy?.sourceLocationsRequired === true, 'Brief mangler claim-/locator-port');
  assert(Array.isArray(brief.requiredCriticalDistinctions) && brief.requiredCriticalDistinctions.length >= 10, 'Brief mangler kritiske distinksjoner');
  assert(brief.qa?.permanentAudit === true && brief.qa?.paragraphLevelClaims === true, 'Brief mangler permanent audit/paragraph claims');

  const modules = rawChapter.moduleFiles.map(json);
  const sections = modules.flatMap((module) => Array.isArray(module.sections) ? module.sections : []);
  assert(sections.length === 9, 'Kapittelet skal ha ni redigerte seksjoner');
  assert(sections.every((section) => Array.isArray(section.paragraphs) && section.paragraphs.length >= 3), 'Alle seksjoner skal ha minst tre redigerte avsnitt');
  assert(sections.every((section) => Array.isArray(section.paragraphClaimIds) && section.paragraphClaimIds.length === section.paragraphs.length), 'Alle avsnitt skal ha eksplisitt claim-sporing');

  const claims = claimsDocument.claims || [];
  const sources = claimsDocument.sources || [];
  assert(sources.length === 12, 'Kapittelet skal ha tolv inspectable kilder');
  assert(claims.length === 18, 'Kapittelet skal ha atten verifiserte claims');
  const sourceIds = new Set(sources.map((sourceRow) => sourceRow.id));
  const claimIds = new Set(claims.map((claim) => claim.id));
  assert(sourceIds.size === sources.length, 'Kilderegisteret har dupliserte source-ID-er');
  assert(claimIds.size === claims.length, 'Claims-registeret har dupliserte claim-ID-er');
  assert(sources.every((sourceRow) => /^https:\/\//.test(sourceRow.url || '') && sourceRow.publisher && sourceRow.source_location), 'Alle kilder skal ha https-URL, publisher og inspectable source_location');
  assert(claims.every((claim) => claim.status === 'verified'), 'Alle kapittelclaims skal være verified');
  assert(claims.every((claim) => Array.isArray(claim.source_ids) && claim.source_ids.length && claim.source_ids.every((id) => sourceIds.has(id))), 'Claim peker til ukjent eller manglende kilde');
  const claim16 = claims.find((claim) => claim.id === 'byl-16');
  assert(claim16?.claim.includes('ser ut til å være mest effektive'), 'WHO-claim byl-16 må beholde korrekt evidensstyrke');
  assert(!claim16?.claim.includes('virker best når'), 'WHO-claim byl-16 er formulert for kausalt/absolutt');

  const sectionIds = new Set(sections.map((section) => section.id));
  const refsBySection = new Map();
  for (const section of sections) {
    const refs = new Set([
      ...flattenClaimIds(section.paragraphClaimIds),
      ...flattenClaimIds(section.keyPointClaimIds)
    ]);
    refsBySection.set(section.id, refs);
    assert([...refs].every((id) => claimIds.has(id)), `${section.id} peker til ukjent claim`);
  }
  const allSectionRefs = new Set([...refsBySection.values()].flatMap((set) => [...set]));
  assert(claims.every((claim) => allSectionRefs.has(claim.id)), 'Kapittelet har orphan claim som aldri brukes i redigert seksjon');
  for (const claim of claims) {
    assert(Array.isArray(claim.used_in) && claim.used_in.length, `${claim.id} mangler used_in`);
    for (const sectionId of claim.used_in) {
      assert(sectionIds.has(sectionId), `${claim.id} peker til ukjent seksjon ${sectionId}`);
      assert(refsBySection.get(sectionId)?.has(claim.id), `${claim.id} er ikke faktisk koblet i ${sectionId}`);
    }
  }

  const fetchFile = async (file) => json(file);
  const hydrated = await CORE.hydrateChapter(chapterMeta, fetchFile);
  assert(hydrated.workedExamples.length === 2, 'Kapittelet skal hydrere to worked examples');
  assert(hydrated.workedExamples.every((example) => example.situation && example.analysis.length >= 4), 'Worked examples er ikke renderbare');
  assert(hydrated.commonMisconceptions.length === 5, 'Kapittelet skal hydrere fem misoppfatninger');
  assert(hydrated.applicationTasks.length === 4, 'Kapittelet skal hydrere fire anvendelsesoppgaver');
  assert(hydrated.applicationTasks.every((task) => task.task && task.prompts.length === 3), 'Anvendelsesoppgave er ikke renderbar');
  assert(hydrated.relatedPlaces.length === 4, 'Kapittelet skal hydrere fire felt-/stedscase');
  assert(hydrated.relatedPlaces.every((place) => place.id && place.name && place.role), 'Stedscase er ikke renderbart');
  assert(sameSet(hydrated.relatedPlaces.map((place) => place.id), EXPECTED_PLACES), 'Kapittelet har feil stedscase-sett');
  assert(hydrated.sources.length === 12 && hydrated.claims.length === 18, 'Claims og kilder ble ikke hydrert gjennom felles runtime');
  const selfCheck = modules.flatMap((module) => Array.isArray(module.selfCheck) ? module.selfCheck : []);
  assert(selfCheck.length === 6 && selfCheck.every((item) => item.question && item.answer), 'Kapittelet skal ha seks renderbare self-check-spørsmål');

  const provenancePlaces = new Set((sourceRegistry.places || []).map((row) => row.place_id));
  for (const id of ['radhusplassen', 'toyen_torg', 'birkelunden']) assert(provenancePlaces.has(id), `By provenance-registeret mangler feltsted: ${id}`);
  assert(!provenancePlaces.has('youngstorget'), 'Youngstorget skal ikke få falsk provenance-entry uten separat registry-migrasjon');
  assert(sources.some((sourceRow) => sourceRow.id === 'byl05-youngstorget' && sourceRow.publisher === 'Oslo kommune'), 'Youngstorget-caset mangler offisiell kapittelkilde');

  const fagkartPrinciples = source.fagkart.principles || {};
  assert(fagkartPrinciples.locked_categories === true && fagkartPrinciples.no_new_main_categories === true, 'By-fagkartets strukturprinsipper er ikke låst');
  const qualityContractPath = CORE.resolveManifestPointer(manifest.by.qualityContract);
  const qualityContract = json(qualityContractPath);
  assert(qualityContract.status === 'canonical', 'By-kvalitetskontrakten er ikke canonical');
  const editorialPrinciples = new Set(qualityContract.editorial_principles || []);
  for (const principle of ['concrete place or event before abstraction', 'documented claim before theory', 'conflict and uncertainty must remain visible']) {
    assert(editorialPrinciples.has(principle), `By mangler bindende editorial principle: ${principle}`);
  }
  assert(qualityContract.source_contract?.canonical_files_are_guides_not_sources === true, 'By tillater feilaktig canonicalfiler som faktakilde');
  assert(qualityContract.source_contract?.no_empty_source_array_for_publishable_question === true, 'By mangler kildekrav for publiserbart innhold');
  assert((qualityContract.source_contract?.required_chain || []).join('>') === 'external_or_observed_source>claim>story_unit>question', 'By har feil source→claim→story→question-kjede');

  const report = {
    schema: 'history_go_fagverk_by_byliv_offentlige_rom_phase4_audit_v1',
    version: '1.0.0',
    status: 'by_phase_4_chapters_in_progress',
    generatedFrom: P,
    subject: {
      id: 'by',
      schemaFamily: inventoryEntry.schemaFamily,
      adapter: model.subject.adapter,
      navigationStatus: statusEntry.navigationStatus,
      assessmentStatus: statusEntry.assessmentStatus,
      editorialStatus: statusEntry.editorialStatus,
      nextGate: statusEntry.nextGate,
      registeredChapterCount: model.chapters.length
    },
    chapter: {
      id: chapterMeta.id,
      title: chapterMeta.title,
      primaryDomainId: chapterMeta.primary_domain_id,
      file: chapterMeta.file,
      editorialStatus: rawChapter.editorialStatus
    },
    summary: {
      coveredEmneCount: EXPECTED_EMNES.length,
      methodCount: EXPECTED_METHODS.length,
      moduleCount: rawChapter.moduleFiles.length,
      sectionCount: sections.length,
      sourceCount: sources.length,
      verifiedClaimCount: claims.length,
      workedExampleCount: hydrated.workedExamples.length,
      misconceptionCount: hydrated.commonMisconceptions.length,
      applicationTaskCount: hydrated.applicationTasks.length,
      selfCheckCount: selfCheck.length,
      relatedPlaceCount: hydrated.relatedPlaces.length
    },
    coverage: {
      emneIds: EXPECTED_EMNES,
      methodIds: EXPECTED_METHODS,
      relatedPlaceIds: EXPECTED_PLACES
    },
    gates: {
      canonicalStatusProgressionPreserved: true,
      firstChapterPreservedAcrossThreeChapterRegistry: true,
      chapterHydratesThroughSharedRuntime: true,
      sevenCanonicalBylivEmnersCovered: true,
      threeCanonicalMethodsResolved: true,
      threeEditedModulesPresent: true,
      paragraphLevelClaimTraceComplete: true,
      allClaimsVerifiedAndUsed: true,
      allClaimSourcesInspectable: true,
      evidenceStrengthPreserved: true,
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
  return { report: committed, model, hydrated };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const { report } = await auditByBylivOffentligeRomPhase4({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`By Byliv Fase 4 OK: ${report.summary.coveredEmneCount} emner, ${report.summary.sourceCount} kilder og ${report.summary.verifiedClaimCount} claims.`);
  } catch (error) {
    console.error(`By Byliv Fase 4 FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
