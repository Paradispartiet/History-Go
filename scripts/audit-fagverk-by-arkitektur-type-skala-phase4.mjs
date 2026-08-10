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
  chapter: 'data/fagverk/by/arkitektur-type-skala-byform.json',
  brief: 'data/fagverk/by/arkitektur-type-skala-byform/brief.json',
  claims: 'data/fagverk/by/arkitektur-type-skala-byform/claims.json',
  report: 'reports/fagverk/by-arkitektur-type-skala-phase4-audit.json'
});
const BYLIV_CHAPTERS = [
  'byliv-offentlige-rom',
  'byliv-sosial-offentlighet',
  'byliv-hendelser-midlertidighet',
  'byliv-stemning-mikrokomfort',
  'byliv-rytmer-miks-konflikt'
];
const EXPECTED_EMNES = [
  'em_by_bygningstyper_og_typologier',
  'em_by_boligstruktur',
  'em_by_historiske_lag_i_hverdagsrom',
  'em_by_skala_hoyde_volum',
  'em_by_romlig_orden',
  'em_by_estetikk_vs_funksjon'
];
const EXPECTED_METHODS = [
  'met_feltobservasjon',
  'met_morfologisk_analyse',
  'met_gis_romlig_analyse',
  'met_komparativ_caseanalyse',
  'met_arkiv_minne_spor'
];
const EXPECTED_PLACES = ['ullevål_hageby', 'rodelokka', 'barcode', 'deichman_bjorvika'];
const PLACE_FILES = {
  'ullevål_hageby': 'data/places/by/oslo/places/ullevål_hageby.json',
  rodelokka: 'data/places/by/oslo/places/rodelokka.json',
  barcode: 'data/places/by/oslo/places/barcode.json',
  deichman_bjorvika: 'data/places/by/oslo/places/deichman_bjorvika.json'
};
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

export async function auditByArkitekturTypeSkalaPhase4({ writeReport = false, checkReport = true } = {}) {
  const CORE = loadCore();
  const categories = json(P.categories);
  const manifest = json(P.manifest);
  const portal = json(P.portal);
  const inventory = json(P.inventory);
  const status = json(P.status);
  const registry = json(P.registry);
  const rawChapter = json(P.chapter);
  const brief = json(P.brief);
  const claimsDocument = json(P.claims);
  const portalEntry = portal.categories.find((row) => row.id === 'by');
  const inventoryEntry = inventory.subjects.find((row) => row.id === 'by');
  const statusEntry = status.subjects.find((row) => row.id === 'by');
  const registrySubject = registry.subjects?.by;
  const chapterMeta = registrySubject?.chapters?.find((row) => row.id === 'arkitektur-type-skala-byform');
  const bylivMeta = BYLIV_CHAPTERS.map((id) => registrySubject?.chapters?.find((row) => row.id === id));

  assert(categories.fagSubjects.includes('by'), 'By mangler i canonical fagliste');
  assert(portalEntry?.subjectStatus === 'materialized', 'By er ikke materialisert');
  assert(inventoryEntry?.schemaFamily === 'by_compatibility', 'By har feil schemafamilie');
  assert(statusEntry?.assessmentStatus === 'audited', 'By har feil auditstatus');
  assert(statusEntry?.editorialStatus === 'chapters_in_progress', 'By skal fortsatt stå chapters_in_progress');
  assert(statusEntry?.nextGate === 'chapter_production', 'By skal fortsette kapittelproduksjon');
  assert(registrySubject && Array.isArray(registrySubject.chapters), 'By mangler kapittelregister');
  assert(registrySubject.chapters.length === 15, 'Første Arkitektur-batch skal gi nøyaktig ni registrerte By-kapitler totalt');
  assert(chapterMeta && bylivMeta.every(Boolean), 'Arkitektur-kapittelet eller et Byliv-kapittel mangler i registry');
  assert(chapterMeta.file === P.chapter && chapterMeta.primary_domain_id === 'arkitektur', 'Registry har feil fil/domain for Arkitektur-kapittelet');
  assert(sameSet(chapterMeta.emne_ids || [], EXPECTED_EMNES), 'Registry har feil Arkitektur-emnedekning');

  const source = loadSource(CORE, manifest.by);
  const model = CORE.normalizeSubject({ subjectId: 'by', categoryLabel: categories.labels.by, categoryDescription: categories.decisions?.by, schemaFamily: inventoryEntry.schemaFamily, manifestEntry: manifest.by, portalEntry, inventoryEntry, statusEntry, registry, badge: {}, source });
  assert(model.subject.adapter === 'by', 'By skal bruke by-adapteren');
  assert(model.chapters.length === 15, 'Normalisert By-modell skal vise ni kapitler');
  const modelEmnes = new Map(model.emners.map((row) => [row.id, row]));
  const modelMethods = new Map(model.methods.map((row) => [row.id, row]));
  for (const id of EXPECTED_EMNES) {
    const emne = modelEmnes.get(id);
    assert(emne, `Kapittelet refererer ukjent By-emne: ${id}`);
    assert(emne.domainId === 'arkitektur', `${id} ligger ikke i normalisert arkitektur`);
  }
  for (const id of EXPECTED_METHODS) assert(modelMethods.has(id), `Kapittelet refererer ukjent By-metode: ${id}`);

  const canonicalBylivIds = model.emners.filter((row) => row.domainId === 'byliv').map((row) => row.id).sort();
  const coveredBylivRefs = bylivMeta.flatMap((row) => row.emne_ids || []);
  assert(canonicalBylivIds.length === 30, `Canonical Byliv skal ha 30 emner, fikk ${canonicalBylivIds.length}`);
  assert(coveredBylivRefs.length === 30 && new Set(coveredBylivRefs).size === 30, 'Byliv-kapitlene har mistet eller duplisert 30/30-dekning');
  assert(isDeepStrictEqual([...new Set(coveredBylivRefs)].sort(), canonicalBylivIds), 'Byliv 30/30 matcher ikke lenger canonical Byliv');
  assert(EXPECTED_EMNES.every((id) => !canonicalBylivIds.includes(id)), 'Arkitektur-kapittelet har tatt inn et Byliv-eid emne');

  const canonicalArchitectureIds = model.emners.filter((row) => row.domainId === 'arkitektur').map((row) => row.id).sort();
  assert(canonicalArchitectureIds.length === 12, `Canonical Arkitektur skal ha 12 emner, fikk ${canonicalArchitectureIds.length}`);
  assert(EXPECTED_EMNES.every((id) => canonicalArchitectureIds.includes(id)), 'Kapittel 1 dekker emne utenfor canonical Arkitektur');
  assert(new Set(EXPECTED_EMNES).size === 6, 'Kapittel 1 har dupliserte emner');

  assert(rawChapter.schema === 'history_go_fagverk_chapter_v1' && rawChapter.editorialStatus === 'chapter_ready', 'Kapittelroot har feil schema/status');
  assert(rawChapter.claimTraceRequired === true && rawChapter.primary_domain_id === 'arkitektur', 'Kapittelroot mangler claimtrace eller riktig domain');
  assert(sameSet(rawChapter.emne_ids || [], EXPECTED_EMNES), 'Kapittelroot har feil emnesett');
  assert(sameSet(rawChapter.method_ids || [], EXPECTED_METHODS), 'Kapittelroot har feil metodesett');
  assert(Array.isArray(rawChapter.moduleFiles) && rawChapter.moduleFiles.length === 3, 'Kapittelet skal ha tre redigerte moduler');
  assert(rawChapter.briefFile === P.brief && rawChapter.claimsFile === P.claims, 'Kapittelroot peker ikke til brief/claims');
  for (const file of [...rawChapter.moduleFiles, rawChapter.briefFile, rawChapter.claimsFile]) assert(fs.existsSync(abs(file)), `Kapittelfil mangler: ${file}`);

  assert(brief.chapter_id === 'arkitektur-type-skala-byform' && brief.primary_domain_id === 'arkitektur', 'Brief har feil kapittel/domain');
  assert(sameSet(brief.requiredEmneIds || [], EXPECTED_EMNES), 'Brief har feil obligatoriske emner');
  assert(sameSet(brief.requiredMethodIds || [], EXPECTED_METHODS), 'Brief har feil obligatoriske metoder');
  assert(brief.sourceStrategy?.minimumExternalSources >= 12 && brief.sourceStrategy?.claimLevelTrace === true && brief.sourceStrategy?.sourceLocationsRequired === true, 'Brief mangler kilde-/claimtrace-port');
  assert(brief.qa?.ownerDomainGate === true && brief.qa?.heritageStatusGuard === true && brief.qa?.highRiseEntitlementGuard === true && brief.qa?.aestheticCriteriaGuard === true && brief.qa?.bylivThirtyOfThirtyPreserved === true, 'Brief mangler en bindende Arkitektur-gate');
  assert((brief.scope?.excluded || []).some((text) => text.includes('automatisk byggerett')), 'Brief blokkerer ikke høyhusstrategi=byggerett');
  assert((brief.scope?.excluded || []).some((text) => text.includes('vernestatus') && text.includes('utseende')), 'Brief blokkerer ikke utseende=vernestatus');
  assert((brief.scope?.excluded || []).some((text) => text.includes('2018') && text.includes('juridiske status')), 'Brief avgrenser ikke historisk Småhusplan-kilde');
  assert(Array.isArray(brief.requiredCriticalDistinctions) && brief.requiredCriticalDistinctions.length >= 15, 'Brief mangler kritiske distinksjoner');

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
  const citedSourceIds = new Set(claims.flatMap((row) => row.source_ids || []));
  assert(sources.every((row) => citedSourceIds.has(row.id)), 'Kapittelet har dekorativ kilde som ingen claim bruker');
  assert(claims.find((row) => row.id === 'arkt-08')?.claim.includes('27. september 2023'), 'Høyhusstrategiens vedtaksdato er ikke låst');
  assert(claims.find((row) => row.id === 'arkt-09')?.claim.includes('ikke automatisk byggerett'), 'Høyhusclaim mangler byggerett-grense');
  assert(claims.find((row) => row.id === 'arkt-13')?.claim.includes('ikke gjettes fra utseende'), 'Vernestatusclaim mangler registergrense');

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
  for (const overclaim of ['høyhusstrategien gir byggerett', 'står på gul liste fordi', 'ser verneverdig ut og er derfor vernet', 'småhusplanen gjelder i dag fordi']) assert(!rawText.includes(overclaim), `Kapittelet inneholder for sterk statuspåstand: ${overclaim}`);
  for (const aestheticShortcut of ['objektivt stygg', 'objektivt vakker', 'estetisk fasit']) assert(!rawText.includes(aestheticShortcut), `Kapittelet inneholder estetisk snarvei: ${aestheticShortcut}`);

  const fetchFile = async (file) => json(file);
  const hydrated = await CORE.hydrateChapter(chapterMeta, fetchFile);
  const bylivHydrated = [];
  for (const meta of bylivMeta) bylivHydrated.push(await CORE.hydrateChapter(meta, fetchFile));
  assert(hydrated.workedExamples.length === 2 && hydrated.workedExamples.every((row) => row.situation && row.analysis.length >= 4), 'Worked examples er ikke renderbare');
  assert(hydrated.commonMisconceptions.length === 5, 'Kapittelet skal hydrere fem misoppfatninger');
  assert(hydrated.applicationTasks.length === 4 && hydrated.applicationTasks.every((row) => row.task && row.prompts.length === 3), 'Anvendelsesoppgaver er ikke renderbare');
  assert(hydrated.relatedPlaces.length === 4 && sameSet(hydrated.relatedPlaces.map((row) => row.id), EXPECTED_PLACES), 'Kapittelet har feil feltcase');
  for (const id of EXPECTED_PLACES) {
    const file = PLACE_FILES[id];
    assert(file && fs.existsSync(abs(file)), `Canonical feltsted mangler: ${id}`);
    assert(json(file).id === id, `Feltsted har feil canonical id: ${id}`);
  }
  assert(hydrated.sources.length === 13 && hydrated.claims.length === 18, 'Claims/kilder ble ikke hydrert');
  assert(bylivHydrated.length === 5 && bylivHydrated.every((chapter) => chapter.claims.length === 18), 'Et Byliv-kapittel hydrerer ikke korrekt etter Arkitektur-start');
  const selfCheck = modules.flatMap((module) => Array.isArray(module.selfCheck) ? module.selfCheck : []);
  assert(selfCheck.length === 6 && selfCheck.every((row) => row.question && row.answer), 'Kapittelet skal ha seks self-checks');

  const qualityContract = json(CORE.resolveManifestPointer(manifest.by.qualityContract));
  assert(qualityContract.status === 'canonical', 'By-kvalitetskontrakten er ikke canonical');
  assert(qualityContract.source_contract?.canonical_files_are_guides_not_sources === true && qualityContract.source_contract?.no_empty_source_array_for_publishable_question === true, 'By-kildekontrakten er svekket');
  const principles = new Set(qualityContract.editorial_principles || []);
  for (const principle of ['concrete place or event before abstraction', 'documented claim before theory', 'conflict and uncertainty must remain visible']) assert(principles.has(principle), `By mangler editorial principle: ${principle}`);

  const report = {
    schema: 'history_go_fagverk_by_arkitektur_type_skala_phase4_audit_v1',
    version: '1.0.0',
    status: 'by_phase_4_arkitektur_chapters_in_progress',
    generatedFrom: P,
    subject: { id: 'by', schemaFamily: inventoryEntry.schemaFamily, adapter: model.subject.adapter, navigationStatus: statusEntry.navigationStatus, assessmentStatus: statusEntry.assessmentStatus, editorialStatus: statusEntry.editorialStatus, nextGate: statusEntry.nextGate, registeredChapterCount: model.chapters.length },
    chapter: { id: chapterMeta.id, title: chapterMeta.title, primaryDomainId: chapterMeta.primary_domain_id, file: chapterMeta.file, editorialStatus: rawChapter.editorialStatus },
    summary: { coveredEmneCount: EXPECTED_EMNES.length, methodCount: EXPECTED_METHODS.length, moduleCount: rawChapter.moduleFiles.length, sectionCount: sections.length, sourceCount: sources.length, verifiedClaimCount: claims.length, workedExampleCount: hydrated.workedExamples.length, misconceptionCount: hydrated.commonMisconceptions.length, applicationTaskCount: hydrated.applicationTasks.length, selfCheckCount: selfCheck.length, relatedPlaceCount: hydrated.relatedPlaces.length, canonicalBylivEmneCount: canonicalBylivIds.length, coveredBylivEmneCount: new Set(coveredBylivRefs).size, canonicalArchitectureEmneCount: canonicalArchitectureIds.length, coveredArchitectureEmneCount: EXPECTED_EMNES.length },
    coverage: { emneIds: EXPECTED_EMNES, methodIds: EXPECTED_METHODS, relatedPlaceIds: EXPECTED_PLACES, canonicalArchitectureEmneIds: canonicalArchitectureIds },
    gates: {
      canonicalStatusProgressionPreserved: true,
      firstArchitectureChapterPreservedAcrossTwelveChapterRegistry: true,
      allFiveBylivChaptersStillHydrate: true,
      bylivThirtyOfThirtyPreserved: true,
      chapterHydratesThroughSharedRuntime: true,
      sixCanonicalArchitectureEmnersCovered: true,
      architectureOwnershipDerivedFromNormalizedModel: true,
      noBylivOwnedCrossReferenceClaimedAsArchitecture: true,
      architectureDomainTwelveCanonicalEmnersConfirmed: true,
      fiveCanonicalMethodsResolved: true,
      threeEditedModulesPresent: true,
      paragraphLevelClaimTraceComplete: true,
      allClaimsVerifiedAndUsed: true,
      everySourceUsedByClaim: true,
      allClaimSourcesInspectable: true,
      highRiseStrategyDateAndEntitlementGuarded: true,
      heritageStatusRequiresRegisterEvidence: true,
      historicalSmåhusSourceNotPromotedToCurrentLaw: true,
      aestheticsUsesExplicitCriteria: true,
      observationStatusAndEvaluationSeparated: true,
      workedExamplesRenderable: true,
      misconceptionsRenderable: true,
      applicationTasksRenderable: true,
      selfCheckRenderable: true,
      canonicalFieldPlacesResolved: true,
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
  return { report: committed, model, hydrated, bylivHydrated };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const { report } = await auditByArkitekturTypeSkalaPhase4({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`By Arkitektur type/skala Fase 4 OK: ${report.summary.coveredArchitectureEmneCount}/${report.summary.canonicalArchitectureEmneCount} Arkitektur-emner, Byliv ${report.summary.coveredBylivEmneCount}/${report.summary.canonicalBylivEmneCount}, ${report.summary.sourceCount} kilder og ${report.summary.verifiedClaimCount} claims.`);
  } catch (error) {
    console.error(`By Arkitektur type/skala Fase 4 FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
