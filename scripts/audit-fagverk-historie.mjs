#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PATHS = Object.freeze({
  core: 'js/fagverk-subject-core.js',
  categories: 'data/categories/category_contract.json',
  manifest: 'data/fag/fag_manifest.json',
  portal: 'data/fagverk/fagverk_portal.json',
  inventory: 'data/fagverk/subject_inventory.json',
  status: 'data/fagverk/subject_status.json',
  registry: 'data/fagverk/fagverk_registry.json',
  badgePage: 'data/fag/historie/merke_historie (1).html',
  theoryEvidence: 'data/fag/historie/theory_evidence_historie_canonical_v1.json',
  universalCoverage: 'reports/historie-universal-coverage/historie-universal-coverage.json',
  report: 'reports/fagverk/historie-subject-audit.json'
});
const abs = (p) => path.join(ROOT, p);
const read = (p) => fs.readFileSync(abs(p), 'utf8');
const json = (p) => JSON.parse(read(p));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function loadCore() {
  const sandbox = { console };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(read(PATHS.core), sandbox, { filename: PATHS.core });
  assert(sandbox.HGFagverkSubjectCore, 'Fagverk-core ble ikke eksponert');
  return sandbox.HGFagverkSubjectCore;
}

function assertChapter(chapterRow, model, evidenceRegistries) {
  assert(fs.existsSync(abs(chapterRow.file)), `Registrert kapittelfil mangler: ${chapterRow.file}`);
  assert(model.domainsById.has(chapterRow.primary_domain_id), `Kapittelet peker til ukjent fagområde ${chapterRow.primary_domain_id}`);
  for (const emneId of chapterRow.emne_ids || []) assert(model.emnersById.has(emneId), `Kapittelet peker til ukjent emne ${emneId}`);
  const chapter = json(chapterRow.file);
  assert(chapter.schema === 'history_go_fagverk_chapter_v1', `Kapittelet ${chapterRow.id} har feil schema`);
  assert(chapter.subject === 'historie' && chapter.id === chapterRow.id, `Kapittelet ${chapterRow.id} har feil identitet`);
  assert(chapter.title && chapter.subtitle && chapter.lead, `Kapittelet ${chapterRow.id} mangler tittel, undertittel eller ingress`);
  assert(chapter.learningObjectives?.length >= 5, `Kapittelet ${chapterRow.id} mangler konkrete læringsmål`);
  assert(chapter.diagnosticQuestions?.length >= 3, `Kapittelet ${chapterRow.id} mangler forkunnskapsspørsmål`);
  assert(chapter.moduleFiles?.length >= 3, `Kapittelet ${chapterRow.id} mangler modulstruktur`);

  let sectionCount = 0;
  let workedExampleCount = 0;
  let misconceptionCount = 0;
  let taskCount = 0;
  let selfCheckCount = 0;
  let sourceCount = 0;
  const claimIds = [];
  const sourceIds = [];
  const theoryEvidenceIds = [];

  for (const modulePath of chapter.moduleFiles) {
    assert(fs.existsSync(abs(modulePath)), `Kapittelmodul mangler: ${modulePath}`);
    const module = json(modulePath);
    sectionCount += module.sections?.length || 0;
    workedExampleCount += module.workedExamples?.length || 0;
    misconceptionCount += module.commonMisconceptions?.length || 0;
    taskCount += module.applicationTasks?.length || 0;
    selfCheckCount += module.selfCheck?.length || 0;
    sourceCount += module.sources?.length || 0;
    claimIds.push(...(module.claimIds || []));
    theoryEvidenceIds.push(...(module.theoryEvidenceIds || []));
    sourceIds.push(...(module.sources || []).map((source) => source.id).filter(Boolean));
  }

  assert(sectionCount >= 8, `Kapittelet ${chapterRow.id} har for få redigerte seksjoner`);
  assert(workedExampleCount >= 2, `Kapittelet ${chapterRow.id} mangler arbeidseksempler`);
  assert(misconceptionCount >= 4, `Kapittelet ${chapterRow.id} mangler reelle misoppfatninger`);
  assert(taskCount >= 3, `Kapittelet ${chapterRow.id} mangler anvendelsesoppgaver`);
  assert(selfCheckCount >= 5, `Kapittelet ${chapterRow.id} mangler selvtest`);
  assert(sourceCount >= 4, `Kapittelet ${chapterRow.id} mangler inspectable kilder`);
  assert(claimIds.length > 0, `Kapittelet ${chapterRow.id} mangler canonical claim-koblinger`);
  assert(theoryEvidenceIds.length > 0, `Kapittelet ${chapterRow.id} mangler canonical theory-evidence-koblinger`);

  for (const claimId of claimIds) assert(evidenceRegistries.claimIds.has(claimId), `Kapittelet ${chapterRow.id} peker til ukjent claim ${claimId}`);
  for (const sourceId of sourceIds) assert(evidenceRegistries.sourceIds.has(sourceId), `Kapittelet ${chapterRow.id} peker til ukjent kilde ${sourceId}`);
  for (const theoryId of theoryEvidenceIds) assert(evidenceRegistries.theoryEvidenceIds.has(theoryId), `Kapittelet ${chapterRow.id} peker til ukjent theory-evidence ${theoryId}`);

  return {
    id: chapterRow.id,
    domainId: chapterRow.primary_domain_id,
    sectionCount,
    workedExampleCount,
    misconceptionCount,
    taskCount,
    selfCheckCount,
    sourceCount,
    claimReferenceCount: claimIds.length,
    sourceReferenceCount: sourceIds.length,
    theoryEvidenceReferenceCount: theoryEvidenceIds.length
  };
}

export function auditHistorySubject({ writeReport = false, checkReport = true } = {}) {
  const CORE = loadCore();
  const categories = json(PATHS.categories);
  const manifest = json(PATHS.manifest);
  const portal = json(PATHS.portal);
  const inventory = json(PATHS.inventory);
  const status = json(PATHS.status);
  const registry = json(PATHS.registry);
  const universalCoverage = json(PATHS.universalCoverage);
  const portalEntry = portal.categories.find((row) => row.id === 'historie');
  const inventoryEntry = inventory.subjects.find((row) => row.id === 'historie');
  const statusEntry = status.subjects.find((row) => row.id === 'historie');
  const manifestEntry = manifest.historie;

  assert(categories.fagSubjects.includes('historie'), 'Historie mangler i kategorikontrakten');
  assert(manifestEntry && portalEntry && inventoryEntry && statusEntry, 'Historie mangler i manifest, portal, inventar eller status');
  assert(portalEntry.subjectStatus === 'materialized', 'Historie er ikke materialized');
  assert(portalEntry.subjectPage === 'fagverk.html?subject=historie', 'Historie har feil fagsiderute');
  assert(portalEntry.badgePage === PATHS.badgePage && fs.existsSync(abs(PATHS.badgePage)), 'Historie har ugyldig merkesiderute');
  assert(statusEntry.navigationStatus === 'materialized' && statusEntry.assessmentStatus === 'audited', 'Historie har usynkron strukturell status');
  assert(['structure_ready', 'chapters_in_progress'].includes(statusEntry.editorialStatus), 'Historie har ugyldig redaksjonell status før fullføring');
  assert(inventoryEntry.schemaFamily === 'standard_canonical', 'Historie bruker feil schemafamilie');

  const source = {};
  for (const field of ['pensum', 'emner', 'fagkart', 'methods']) {
    const resolved = CORE.resolveManifestPointer(manifestEntry[field]);
    assert(fs.existsSync(abs(resolved)), `Historie mangler required source: ${field}`);
    source[field === 'emner' ? 'emners' : field] = json(resolved);
  }
  for (const field of ['coverageContract', 'qualityContract', 'caseRequirements', 'claims', 'sources', 'placeEvidence', 'profilesManifest']) {
    const resolved = CORE.resolveManifestPointer(manifestEntry[field]);
    assert(fs.existsSync(abs(resolved)), `Historie mangler manifesttillegget ${field}`);
  }
  assert(fs.existsSync(abs(PATHS.theoryEvidence)), 'Historie mangler canonical theory-evidence-register');

  const claimRegistry = json(CORE.resolveManifestPointer(manifestEntry.claims));
  const sourceRegistry = json(CORE.resolveManifestPointer(manifestEntry.sources));
  const theoryEvidenceRegistry = json(PATHS.theoryEvidence);
  const evidenceRegistries = {
    claimIds: new Set((claimRegistry.claims || []).map((claim) => claim.claim_id)),
    sourceIds: new Set((sourceRegistry.sources || []).map((sourceItem) => sourceItem.source_id)),
    theoryEvidenceIds: new Set((theoryEvidenceRegistry.entries || []).filter((entry) => entry.status === 'evidence_ready').map((entry) => entry.theory_id))
  };

  const model = CORE.normalizeSubject({
    subjectId: 'historie', categoryLabel: categories.labels.historie, categoryDescription: categories.decisions?.historie,
    schemaFamily: inventoryEntry.schemaFamily, manifestEntry, portalEntry, inventoryEntry, statusEntry, registry,
    badge: fs.existsSync(abs('data/badges/historie.json')) ? json('data/badges/historie.json') : null, source
  });
  const expectedDomainOrder = source.pensum.domains.map((domain) => domain.domain_id);
  const actualDomainOrder = [...model.domains].map((domain) => domain.id);
  assert(isDeepStrictEqual(actualDomainOrder, expectedDomainOrder), 'Historie-fagområdene vises ikke i source-definert rekkefølge');
  assert(model.subject.id === 'historie' && model.subject.adapter === 'standard', 'Historie normaliseres ikke gjennom standard-adapteren');
  assert(model.summary.domainCount === 23 && model.summary.emneCount === 230 && model.summary.methodCount === 105, 'Historie har uventet kjerneinventar');
  assert(model.summary.mappingCount === 230 && model.summary.hookCount === 230, 'Historie har uventet mapping- eller hookinventar');

  for (const domain of model.domains) {
    assert(domain.label && domain.definition, `Fagområdet ${domain.id} mangler label eller definisjon`);
    assert(domain.emneIds.length === 10 && domain.hookIds.length === 10, `Fagområdet ${domain.id} har uventet dekning`);
    for (const emneId of domain.emneIds) assert(model.emnersById.has(emneId), `Fagområdet ${domain.id} peker til ukjent emne ${emneId}`);
    for (const methodId of domain.methodIds) assert(model.methodsById.has(methodId), `Fagområdet ${domain.id} peker til ukjent metode ${methodId}`);
  }
  for (const emne of model.emners) {
    assert(emne.subjectId === 'historie' && model.domainsById.has(emne.domainId), `Emnet ${emne.id} har ugyldig fagkobling`);
    assert(emne.title && emne.definition && emne.whyItMatters && emne.concepts.length && emne.keyQuestions.length, `Emnet ${emne.id} mangler faglig minimum`);
  }
  for (const method of model.methods) assert(method.title && method.description, `Metoden ${method.id} mangler navn eller forklaring`);

  const chapterRows = registry.subjects?.historie?.chapters || [];
  const chapterAudits = chapterRows.map((row) => assertChapter(row, model, evidenceRegistries));
  const coveredChapterDomains = [...new Set(chapterRows.map((row) => row.primary_domain_id))];
  if (chapterRows.length > 0) assert(statusEntry.editorialStatus === 'chapters_in_progress', 'Registrerte kapitler krever chapters_in_progress');

  assert(universalCoverage.subject_id === 'historie', 'Heldedekningsrapporten gjelder ikke Historie');
  assert(universalCoverage.inventory?.domains === 23 && universalCoverage.inventory?.emner === 230 && universalCoverage.inventory?.methods === 105, 'Heldedekningsrapporten er usynkronisert');
  const theoryEvidence = universalCoverage.production?.checks?.find((check) => check.id === 'theory_evidence_readiness');
  assert(theoryEvidence, 'Heldedekningsrapporten mangler theory-evidence-port');
  if (universalCoverage.status !== 'COMPLETE' || coveredChapterDomains.length < 23) assert(statusEntry.editorialStatus !== 'complete', 'Historie kan ikke settes complete før alle porter er oppfylt');
  assert(registry.placePage?.fallbackSubjectByCategory?.historie === 'historie', 'Historie-stedssider faller fortsatt tilbake til et annet fag');
  assert(!JSON.stringify(model.subject).toLocaleLowerCase('nb-NO').includes('politikk'), 'Historie-modellen inneholder politikkspesifikk resttekst');

  const report = {
    schema: 'history_go_fagverk_historie_subject_audit_v1', version: '1.2.0', status: 'phase_4_historie_chapters_in_progress', generatedFrom: PATHS,
    subject: { id: model.subject.id, title: model.subject.title, schemaFamily: inventoryEntry.schemaFamily, adapter: model.subject.adapter, badgePage: model.subject.routes.badge, subjectPage: model.subject.routes.subject, assessmentStatus: statusEntry.assessmentStatus, editorialStatus: statusEntry.editorialStatus },
    summary: { domainCount: 23, emneCount: 230, methodCount: 105, mappingCount: 230, hookCount: 230, chapterCount: chapterRows.length, chapterDomainCount: coveredChapterDomains.length, remainingChapterDomains: 23 - coveredChapterDomains.length, placeCount: model.places.length },
    chapters: chapterAudits,
    universalCoverage: { status: universalCoverage.status, coveredCells: universalCoverage.summary?.covered_cells ?? null, totalCells: universalCoverage.summary?.total_cells ?? null, productionGaps: universalCoverage.summary?.production_gaps ?? null, theoryEvidenceQualifying: theoryEvidence.measured?.qualifying ?? null, theoryEvidenceTotal: theoryEvidence.measured?.total ?? null, theoryEvidenceRatio: theoryEvidence.measured?.ratio ?? null },
    canonicalDomainOrder: actualDomainOrder,
    gates: { manifestFirst: true, normalizedModel: true, canonicalDomainOrder: true, emneReferencesResolved: true, methodReferencesResolved: true, mappingsResolved: true, historyExtensionPointersResolved: true, badgeAndSubjectRoutes: true, registeredChaptersValidated: true, chapterEvidenceReferencesResolved: true, honestCompletionBoundary: true, historyPlaceFallbackResolved: true, politicsResiduals: 0 }
  };
  if (writeReport) { fs.mkdirSync(path.dirname(abs(PATHS.report)), { recursive: true }); fs.writeFileSync(abs(PATHS.report), `${JSON.stringify(report, null, 2)}\n`); }
  if (checkReport) assert(isDeepStrictEqual(json(PATHS.report), report), `${PATHS.report} er utdatert`);
  return { report, model };
}

function main() {
  const args = new Set(process.argv.slice(2));
  try {
    const { report } = auditHistorySubject({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Historie-fagverk OK: ${report.summary.domainCount} fagområder, ${report.summary.chapterCount} kapitler og ${report.summary.remainingChapterDomains} gjenstående kapitteldomener.`);
  } catch (error) { console.error(`Historie-fagverk FEIL: ${error.message}`); process.exitCode = 1; }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
