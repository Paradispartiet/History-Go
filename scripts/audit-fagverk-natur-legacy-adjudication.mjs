import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const ADJUDICATION = 'data/fag/natur/legacy_theory_adjudication_v1.json';
const REGISTRY = 'data/fagverk/fagverk_registry.json';
const PORTAL = 'data/fagverk/fagverk_portal.json';
const CATEGORY_CONTRACT = 'data/categories/category_contract.json';
const LEGACY_BADGE = 'data/fag/natur/merke_natur (1).html';
const BADGE = 'data/badges/natur.json';
const SUBJECT_MODEL = 'js/fagverk-subject-model.js';
const BADGE_PROGRESS = 'js/fagverk-ia-v3-badge-progress.js';
const FAGVERK_HTML = 'fagverk.html';
const TARGET = 'fagverk.html?subject=natur#fagverkIaProgresjon';
const KNOWLEDGE_DISPOSITION = 'canonical_supersedes';
const PRODUCT_SUMMARY_DISPOSITION = 'retire_legacy_product_summary';
const BOUNDARY_ID = 'nature_assignment_requires_scientific_entry';
const BOUNDARY_DISPOSITION = 'migrated_to_canonical_product_contract';

const EXPECTED_PRODUCT_MECHANICS = new Map([
  ['badge_activity_progress', {
    disposition: 'canonical_product_state',
    ownerFiles: [BADGE, SUBJECT_MODEL, BADGE_PROGRESS]
  }],
  ['subject_completion_snapshot', {
    disposition: 'retire_legacy_snapshot',
    ownerFiles: []
  }],
  ['integrated_progression_route', {
    disposition: 'canonical_progression_route',
    ownerFiles: [FAGVERK_HTML, BADGE_PROGRESS]
  }],
  ['subject_inventory_snapshot', {
    disposition: 'retire_legacy_snapshot',
    ownerFiles: []
  }]
]);

const abs = file => path.join(ROOT, file);
const exists = file => fs.existsSync(abs(file));
const read = file => fs.readFileSync(abs(file), 'utf8');
const json = file => JSON.parse(read(file));
const text = value => String(value ?? '').trim();
const normalize = value => text(value).toLocaleLowerCase('nb-NO').normalize('NFKC')
  .replace(/[«»“”„"'’`´]/g, '')
  .replace(/[^a-zæøå0-9]+/gi, ' ')
  .replace(/\s+/g, ' ').trim();

function runAnchorAudit() {
  const result = spawnSync(process.execPath, ['scripts/audit-fagverk-natur-legacy-theory.mjs'], {
    cwd: ROOT,
    encoding: 'utf8'
  });
  if (result.status !== 0) throw new Error(`Natur legacy anchor audit feilet:\n${result.stderr || result.stdout}`);
  return JSON.parse(result.stdout);
}

for (const file of [
  ADJUDICATION, REGISTRY, PORTAL, CATEGORY_CONTRACT, LEGACY_BADGE,
  BADGE, SUBJECT_MODEL, BADGE_PROGRESS, FAGVERK_HTML
]) {
  if (!exists(file)) throw new Error(`Natur-adjudisering mangler ${file}`);
}

const anchorAudit = runAnchorAudit();
const adjudication = json(ADJUDICATION);
const registry = json(REGISTRY);
const portal = json(PORTAL);
const categoryContract = json(CATEGORY_CONTRACT);

if (adjudication.schema !== 'history_go_fagverk_legacy_theory_adjudication_v1') {
  throw new Error(`Ukjent Natur-adjudiseringsschema: ${adjudication.schema}`);
}
if (adjudication.subject_id !== 'natur') throw new Error('Natur-adjudiseringen må eie subject_id=natur.');
if (adjudication.policy?.canonical_content_wins !== true) throw new Error('Canonical Natur-innhold må vinne over legacy-prosa.');
if (adjudication.policy?.copy_legacy_prose !== false) throw new Error('Legacy Natur-prosa kan ikke kopieres som standard.');
if (adjudication.policy?.redirect_target !== TARGET) throw new Error('Uventet Natur redirect-target.');
if (adjudication.policy?.redirect_only_after_gate !== true) throw new Error('Natur redirect må være blokkert til adjudiseringsgaten er grønn.');
if (adjudication.policy?.product_mechanics_are_not_knowledge !== true) throw new Error('Natur-produktmekanikk må holdes utenfor kunnskapseierskap.');
if (adjudication.policy?.product_boundaries_are_not_knowledge !== true) throw new Error('Natur-produktgrenser må holdes utenfor kunnskapseierskap.');

if (anchorAudit.subject !== 'natur') throw new Error('Natur-adjudiseringen mottok feil anchor-audit.');
if (anchorAudit.summary?.knowledgeSectionCount !== 5
  || anchorAudit.summary?.anchorCompleteCount !== 5
  || anchorAudit.summary?.manualReviewCount !== 0) {
  throw new Error('Natur kan ikke adjudiseres før anchor-auditen beviser 5/5 dekning og 0 manuelle gap.');
}
if (anchorAudit.summary?.redirectReady !== false) throw new Error('Natur anchor-auditen alene skal aldri godkjenne redirect.');
if (anchorAudit.legacy?.sectionCount !== 6
  || anchorAudit.legacy?.productSummarySectionCount !== 1
  || anchorAudit.legacy?.productMechanicCount !== 4
  || anchorAudit.legacy?.productBoundaryCount !== 1) {
  throw new Error('Natur legacy-auditen har uventet kunnskaps-/produktstruktur.');
}
if (anchorAudit.canonical?.categoryContractHasNaturAssignmentBoundary !== true) {
  throw new Error('Natur-tildelingsgrensen er ikke canonicalisert i category-contracten.');
}

const registrySubject = registry.subjects?.natur;
const chapterRoots = (registrySubject?.chapters || []).map(row => text(row?.file)).filter(Boolean);
if (chapterRoots.length !== 12) throw new Error(`Forventet 12 Natur-kapittelrøtter, fant ${chapterRoots.length}.`);
const allowedKnowledgeOwners = new Set([...(anchorAudit.canonical?.manifestSeedFiles || []), ...chapterRoots]);

const sectionDecisions = Array.isArray(adjudication.sections) ? adjudication.sections : [];
const sectionById = new Map();
for (const decision of sectionDecisions) {
  const id = text(decision?.id);
  if (!id) throw new Error('Natur-adjudiseringsrad mangler id.');
  if (sectionById.has(id)) throw new Error(`Duplikat Natur-adjudisering for ${id}.`);
  sectionById.set(id, decision);
}
const expectedSectionIds = anchorAudit.rows.map(row => row.id);
const missingSectionIds = expectedSectionIds.filter(id => !sectionById.has(id));
const unknownSectionIds = [...sectionById.keys()].filter(id => !expectedSectionIds.includes(id));
if (missingSectionIds.length) throw new Error(`Mangler eksplisitt Natur-adjudisering: ${missingSectionIds.join(', ')}`);
if (unknownSectionIds.length) throw new Error(`Ukjente Natur-adjudiseringsseksjoner: ${unknownSectionIds.join(', ')}`);

const sectionRows = anchorAudit.rows.map(anchorRow => {
  const decision = sectionById.get(anchorRow.id);
  const ownerFiles = Array.isArray(decision.owner_files) ? decision.owner_files.map(text).filter(Boolean) : [];
  const migrationRefs = Array.isArray(decision.migration_refs) ? decision.migration_refs.map(text).filter(Boolean) : [];
  const rationale = text(decision.rationale);
  if (!rationale) throw new Error(`${anchorRow.id} mangler rationale.`);

  if (anchorRow.role === 'legacy_product_summary') {
    if (decision.disposition !== PRODUCT_SUMMARY_DISPOSITION || ownerFiles.length || migrationRefs.length) {
      throw new Error(`${anchorRow.id} skal pensjoneres som produktstatus uten kunnskapseier eller migrering.`);
    }
  } else {
    if (decision.disposition !== KNOWLEDGE_DISPOSITION) throw new Error(`${anchorRow.id} skal være canonical_supersedes.`);
    if (anchorRow.anchorCoverage !== 1 || anchorRow.missingAnchors?.length) throw new Error(`${anchorRow.id} har fortsatt canonical ankerhull.`);
    if (!ownerFiles.length) throw new Error(`${anchorRow.id} må ha minst én canonical kunnskapseier.`);
    if (migrationRefs.length) throw new Error(`${anchorRow.id} skal ikke hevde kunnskapsmigrering; #5495 fant 0 faglige gap.`);
    for (const file of ownerFiles) {
      if (!exists(file)) throw new Error(`${anchorRow.id} peker til manglende owner-fil: ${file}`);
      if (!allowedKnowledgeOwners.has(file)) throw new Error(`${anchorRow.id} peker utenfor canonical Natur-eierskap: ${file}`);
    }
  }

  return {
    id: anchorRow.id,
    role: anchorRow.role,
    anchorCoverage: anchorRow.anchorCoverage,
    disposition: decision.disposition,
    ownerFiles,
    migrationRefs,
    rationale,
    adjudicated: true
  };
});

const productDecisions = Array.isArray(adjudication.product_mechanics) ? adjudication.product_mechanics : [];
const productById = new Map(productDecisions.map(row => [text(row?.id), row]));
if (productById.size !== EXPECTED_PRODUCT_MECHANICS.size) throw new Error('Natur-adjudiseringen skal avgjøre nøyaktig fire produktmekanikker.');
const productRows = [];
for (const [id, expected] of EXPECTED_PRODUCT_MECHANICS) {
  const decision = productById.get(id);
  if (!decision) throw new Error(`Mangler Natur-produktmekanikk: ${id}`);
  const ownerFiles = Array.isArray(decision.owner_files) ? decision.owner_files.map(text).filter(Boolean) : [];
  const migrationRefs = Array.isArray(decision.migration_refs) ? decision.migration_refs.map(text).filter(Boolean) : [];
  if (decision.disposition !== expected.disposition) throw new Error(`${id} har feil disposisjon: ${decision.disposition}`);
  if (JSON.stringify(ownerFiles) !== JSON.stringify(expected.ownerFiles)) throw new Error(`${id} har feil canonicale produkteiere.`);
  if (migrationRefs.length) throw new Error(`${id} skal ikke hevde produktmigrering.`);
  if (!text(decision.rationale)) throw new Error(`${id} mangler rationale.`);
  for (const file of ownerFiles) if (!exists(file)) throw new Error(`${id} peker til manglende produkteier: ${file}`);
  productRows.push({ id, disposition: decision.disposition, ownerFiles, migrationRefs, rationale: decision.rationale, adjudicated: true });
}
for (const id of productById.keys()) if (!EXPECTED_PRODUCT_MECHANICS.has(id)) throw new Error(`Ukjent Natur-produktmekanikk: ${id}`);

const boundaryDecisions = Array.isArray(adjudication.product_boundaries) ? adjudication.product_boundaries : [];
if (boundaryDecisions.length !== 1) throw new Error('Natur-adjudiseringen skal ha nøyaktig én produktgrense.');
const boundary = boundaryDecisions[0];
const boundaryOwners = Array.isArray(boundary.owner_files) ? boundary.owner_files.map(text).filter(Boolean) : [];
const boundaryMigrations = Array.isArray(boundary.migration_refs) ? boundary.migration_refs.map(text).filter(Boolean) : [];
if (text(boundary.id) !== BOUNDARY_ID || boundary.disposition !== BOUNDARY_DISPOSITION) throw new Error('Natur-tildelingsgrensen har feil id eller disposisjon.');
if (JSON.stringify(boundaryOwners) !== JSON.stringify([CATEGORY_CONTRACT])) throw new Error('Natur-tildelingsgrensen må eies kun av category-contracten.');
if (!boundaryMigrations.includes('data/categories/category_contract.json#decisions.natur') || !boundaryMigrations.includes('PR #5496')) {
  throw new Error('Natur-tildelingsgrensen mangler eksplisitt #5496-migreringsbevis.');
}
if (!text(boundary.rationale)) throw new Error('Natur-tildelingsgrensen mangler rationale.');

const naturDecision = normalize(categoryContract.decisions?.natur);
for (const term of ['grønt', 'vakkert', 'naturfaglig inngang', 'organisme', 'habitat', 'vassdrag', 'geologisk', 'klimavirkning', 'naturforvaltning', 'dokumenterbar']) {
  if (!naturDecision.includes(normalize(term))) throw new Error(`Category-contracten mangler Natur-grensebegrep: ${term}`);
}

const progressUi = read(BADGE_PROGRESS);
if (!progressUi.includes('data/badges/${encodeURIComponent(model.subject.id)}.json')
  || !progressUi.includes('progress.points')
  || !progressUi.includes('progress.visited?.has')
  || !progressUi.includes('Nivåstige')
  || !progressUi.includes('Undermerker')) {
  throw new Error('Den integrerte badge-progress-runtime mangler forventet produkt-equivalence.');
}

const portalEntry = portal.categories?.find(item => item.id === 'natur');
if (!portalEntry) throw new Error('Natur mangler i fagverk_portal.json.');
const portalRoute = text(portalEntry.badgePage);
const portalRedirected = portalRoute === TARGET;
const knowledgeRows = sectionRows.filter(row => row.role !== 'legacy_product_summary');
const productSummaryRows = sectionRows.filter(row => row.role === 'legacy_product_summary');
const redirectReady = knowledgeRows.length === 5
  && knowledgeRows.every(row => row.adjudicated && row.anchorCoverage === 1 && row.disposition === KNOWLEDGE_DISPOSITION && row.ownerFiles.length > 0)
  && productSummaryRows.length === 1
  && productSummaryRows[0].disposition === PRODUCT_SUMMARY_DISPOSITION
  && productRows.length === 4
  && boundary.disposition === BOUNDARY_DISPOSITION;

const report = {
  schema: 'history_go_fagverk_natur_legacy_adjudication_audit_v1',
  subject: 'natur',
  inputs: {
    anchorAuditSchema: anchorAudit.schema,
    adjudicationFile: ADJUDICATION,
    legacyBadgePage: LEGACY_BADGE,
    manifestOwnerFiles: anchorAudit.canonical.manifestSeedFiles,
    registryChapterOwnerFiles: chapterRoots,
    boundaryOwnerFile: CATEGORY_CONTRACT,
    productOwnerFiles: [BADGE, SUBJECT_MODEL, BADGE_PROGRESS, FAGVERK_HTML]
  },
  summary: {
    legacySectionCount: sectionRows.length,
    knowledgeSectionCount: knowledgeRows.length,
    adjudicatedKnowledgeCount: knowledgeRows.filter(row => row.adjudicated).length,
    allowedKnowledgeOwnerFileCount: allowedKnowledgeOwners.size,
    canonicalOwnerFileCount: new Set(knowledgeRows.flatMap(row => row.ownerFiles)).size,
    migratedKnowledgeSectionCount: knowledgeRows.filter(row => row.migrationRefs.length > 0).length,
    canonicalSupersedesCount: knowledgeRows.filter(row => row.disposition === KNOWLEDGE_DISPOSITION).length,
    retiredProductSummaryCount: productSummaryRows.filter(row => row.disposition === PRODUCT_SUMMARY_DISPOSITION).length,
    productMechanicCount: productRows.length,
    canonicalProductMechanicCount: productRows.filter(row => row.ownerFiles.length > 0).length,
    retiredProductSnapshotCount: productRows.filter(row => row.disposition === 'retire_legacy_snapshot').length,
    productBoundaryCount: boundaryDecisions.length,
    migratedProductBoundaryCount: boundary.disposition === BOUNDARY_DISPOSITION ? 1 : 0,
    anchorAuditRedirectReady: anchorAudit.summary.redirectReady,
    redirectReady,
    redirectTarget: TARGET,
    portalRoute,
    portalRedirected,
    legacyBadgeSourcePreserved: exists(LEGACY_BADGE)
  },
  sections: sectionRows,
  productMechanics: productRows,
  productBoundaries: [{
    id: boundary.id,
    disposition: boundary.disposition,
    ownerFiles: boundaryOwners,
    migrationRefs: boundaryMigrations,
    rationale: boundary.rationale,
    adjudicated: true
  }]
};

if (!report.summary.redirectReady) throw new Error('Natur legacy adjudication er ikke redirect-klar.');
if (report.summary.migratedKnowledgeSectionCount !== 0 || report.summary.canonicalSupersedesCount !== 5) {
  throw new Error('Natur-auditen fant ingen faglige gap; alle fem kunnskapsseksjoner skal canonical_supersedes uten migrering.');
}
if (report.summary.retiredProductSummaryCount !== 1
  || report.summary.productMechanicCount !== 4
  || report.summary.canonicalProductMechanicCount !== 2
  || report.summary.retiredProductSnapshotCount !== 2
  || report.summary.migratedProductBoundaryCount !== 1) {
  throw new Error('Natur-produktadjudiseringen har uventet struktur.');
}
if (report.summary.portalRedirected) throw new Error('Adjudiserings-PR-en skal ikke redirecte Natur; route-retirement er separat tranche.');
if (!report.summary.legacyBadgeSourcePreserved) throw new Error('Natur legacy-kilden må bevares gjennom adjudiseringsfasen.');

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
