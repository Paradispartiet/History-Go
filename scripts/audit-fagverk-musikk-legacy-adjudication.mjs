import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const ADJUDICATION = 'data/fag/musikk/legacy_theory_adjudication_v1.json';
const SUBJECT_REPORT = 'reports/fagverk/musikk-subject-audit.json';
const PORTAL = 'data/fagverk/fagverk_portal.json';
const CATEGORY_CONTRACT = 'data/categories/category_contract.json';
const LEGACY_BADGE = 'data/fag/musikk/merke_musikk (1).html';
const EXPECTED_TARGET = 'fagverk.html?subject=musikk#fagverkIaProgresjon';
const KNOWLEDGE_DISPOSITION = 'canonical_supersedes';
const EXPECTED_PRODUCT_MECHANICS = new Map([
  ['felt', []],
  ['musikalsk_form', []],
  ['utovelse', ['musikk_scenekunst_boundary']],
  ['produksjon_teknologi', []],
  ['sjangere_miljoer', []],
  ['scener_infrastruktur', []],
  ['musikk_samfunn', ['secondary_badge_routing']],
  ['kjernebegreper', []]
]);

const abs = file => path.join(ROOT, file);
const read = file => fs.readFileSync(abs(file), 'utf8');
const readJson = file => JSON.parse(read(file));
const exists = file => fs.existsSync(abs(file));
const text = value => String(value == null ? '' : value).trim();

function runAnchorAudit() {
  const result = spawnSync(process.execPath, ['scripts/audit-fagverk-musikk-legacy-theory.mjs', '--no-check-report'], {
    cwd: ROOT,
    encoding: 'utf8'
  });
  if (result.status !== 0) throw new Error(`Musikk legacy anchor audit feilet:\n${result.stderr || result.stdout}`);
  return JSON.parse(result.stdout);
}

for (const file of [ADJUDICATION, SUBJECT_REPORT, PORTAL, CATEGORY_CONTRACT, LEGACY_BADGE]) {
  if (!exists(file)) throw new Error(`Mangler nødvendig Musikk-adjudiseringsfil: ${file}`);
}

const anchorAudit = runAnchorAudit();
const adjudication = readJson(ADJUDICATION);
const subjectReport = readJson(SUBJECT_REPORT);
const portal = readJson(PORTAL);
const categoryContract = readJson(CATEGORY_CONTRACT);
const legacyHtml = read(LEGACY_BADGE);

if (adjudication.schema !== 'history_go_fagverk_legacy_theory_adjudication_v1') throw new Error(`Ukjent Musikk-adjudiseringsschema: ${adjudication.schema}`);
if (adjudication.subject_id !== 'musikk') throw new Error('Musikk-adjudiseringen må eie subject_id=musikk.');
if (adjudication.policy?.canonical_content_wins !== true) throw new Error('Canonical Musikk-innhold må vinne over legacy-prosa.');
if (adjudication.policy?.copy_legacy_prose !== false) throw new Error('Legacy Musikk-prosa kan ikke kopieres som standard.');
if (adjudication.policy?.redirect_target !== EXPECTED_TARGET) throw new Error('Uventet Musikk redirect-target.');
if (adjudication.policy?.redirect_only_after_gate !== true) throw new Error('Musikk redirect må være blokkert til adjudiseringsgaten er grønn.');
if (adjudication.policy?.product_boundaries_are_not_knowledge !== true) throw new Error('Musikk-produktgrenser må holdes utenfor kunnskapseierskap.');

if (anchorAudit.subject !== 'musikk') throw new Error('Musikk-adjudiseringen mottok feil anchor-audit.');
if (anchorAudit.summary?.knowledgeSectionCount !== 8 || anchorAudit.summary?.anchorCompleteCount !== 8 || anchorAudit.summary?.manualReviewCount !== 0) {
  throw new Error('Musikk kan ikke adjudiseres før anchor-auditen beviser 8/8 dekning og 0 manuelle gap.');
}
if (anchorAudit.summary?.redirectReady !== false) throw new Error('Musikk anchor-auditen alene skal aldri godkjenne redirect.');
if (anchorAudit.legacy?.productMechanicCount !== 1) throw new Error('Musikk anchor-auditen skal isolere secondary_badge_routing som legacy-produktmekanikk.');

const chapterRoots = (subjectReport.generatedFrom?.chapters || []).map(row => text(row?.chapter)).filter(Boolean);
if (chapterRoots.length !== 8) throw new Error(`Musikk subject-audit skal ha åtte registrerte kapittelrøtter, fant ${chapterRoots.length}.`);
const allowedKnowledgeOwners = new Set([...(anchorAudit.canonical?.manifestFiles || []), ...chapterRoots]);
if (allowedKnowledgeOwners.size !== 12) throw new Error(`Musikk-adjudisering forventer 12 tillatte canonicale kunnskapseiere, fant ${allowedKnowledgeOwners.size}.`);

if (!Array.isArray(categoryContract.runtimeCategories)
    || !['musikk', 'scenekunst', 'subkultur'].every(id => categoryContract.runtimeCategories.includes(id))) {
  throw new Error('Category-contracten må holde Musikk, Scenekunst og Subkultur som separate canonicale runtimekategorier.');
}
if (!text(categoryContract.decisions?.musikk) || !text(categoryContract.decisions?.scenekunst)) {
  throw new Error('Category-contracten mangler Musikk/Scenekunst-grensen.');
}
if (!text(categoryContract.labels?.subkultur)) throw new Error('Category-contracten mangler canonical Subkultur-label.');
if (!/tilhører Scenekunst/i.test(legacyHtml)) throw new Error('Legacy Musikk-siden mangler den forventede Scenekunst-grensen.');
if (!/sekundærbadge/i.test(legacyHtml)) throw new Error('Legacy Musikk-siden mangler den forventede secondary-badge-produktregelen.');

const decisions = Array.isArray(adjudication.sections) ? adjudication.sections : [];
const decisionById = new Map();
for (const decision of decisions) {
  const id = text(decision?.id);
  if (!id) throw new Error('Musikk-adjudiseringsrad mangler id.');
  if (decisionById.has(id)) throw new Error(`Duplikat Musikk-adjudisering for ${id}.`);
  decisionById.set(id, decision);
}

const expectedIds = anchorAudit.rows.map(row => row.id);
const missingDecisions = expectedIds.filter(id => !decisionById.has(id));
const unknownDecisions = [...decisionById.keys()].filter(id => !expectedIds.includes(id));
if (missingDecisions.length) throw new Error(`Mangler eksplisitt Musikk-adjudisering: ${missingDecisions.join(', ')}`);
if (unknownDecisions.length) throw new Error(`Ukjente Musikk-adjudiseringsseksjoner: ${unknownDecisions.join(', ')}`);

const rows = anchorAudit.rows.map(anchorRow => {
  const decision = decisionById.get(anchorRow.id);
  const ownerFiles = Array.isArray(decision.owner_files) ? decision.owner_files.map(text).filter(Boolean) : [];
  const boundaryFiles = Array.isArray(decision.boundary_files) ? decision.boundary_files.map(text).filter(Boolean) : [];
  const productMechanics = Array.isArray(decision.product_mechanics) ? decision.product_mechanics.map(text).filter(Boolean) : [];
  const migrationRefs = Array.isArray(decision.migration_refs) ? decision.migration_refs.map(text).filter(Boolean) : [];
  const rationale = text(decision.rationale);
  const expectedMechanics = EXPECTED_PRODUCT_MECHANICS.get(anchorRow.id);

  if (!rationale) throw new Error(`Musikk-adjudisering for ${anchorRow.id} mangler rationale.`);
  if (decision.disposition !== KNOWLEDGE_DISPOSITION) throw new Error(`${anchorRow.id} skal være canonical_supersedes, fant ${decision.disposition}.`);
  if (!ownerFiles.length) throw new Error(`${anchorRow.id} må ha minst én canonical kunnskapseier.`);
  if (anchorRow.anchorCoverage !== 1 || anchorRow.foundCount !== anchorRow.anchorCount || anchorRow.missingAnchors?.length) {
    throw new Error(`${anchorRow.id} har fortsatt canonical ankerhull.`);
  }
  if (migrationRefs.length) throw new Error(`${anchorRow.id} skal ikke hevde migrering; #5484 fant ingen semantiske gap.`);

  const missingOwnerFiles = ownerFiles.filter(file => !exists(file));
  const nonCanonicalOwnerFiles = ownerFiles.filter(file => !allowedKnowledgeOwners.has(file));
  if (missingOwnerFiles.length) throw new Error(`${anchorRow.id} peker til manglende owner-filer: ${missingOwnerFiles.join(', ')}`);
  if (nonCanonicalOwnerFiles.length) throw new Error(`${anchorRow.id} peker utenfor tillatt canonical Musikk-eierskap: ${nonCanonicalOwnerFiles.join(', ')}`);

  const invalidBoundaryFiles = boundaryFiles.filter(file => file !== CATEGORY_CONTRACT || !exists(file));
  if (invalidBoundaryFiles.length) throw new Error(`${anchorRow.id} har ugyldige produktgrense-eiere: ${invalidBoundaryFiles.join(', ')}`);
  if (JSON.stringify(productMechanics) !== JSON.stringify(expectedMechanics)) {
    throw new Error(`${anchorRow.id} har feil produktmekanikk: ${productMechanics.join(', ') || 'ingen'}.`);
  }
  if (expectedMechanics.length && JSON.stringify(boundaryFiles) !== JSON.stringify([CATEGORY_CONTRACT])) {
    throw new Error(`${anchorRow.id} har produktmekanikk og må eies eksplisitt av category-contracten.`);
  }
  if (!expectedMechanics.length && boundaryFiles.length) throw new Error(`${anchorRow.id} skal ikke ha produktgrense-eier.`);

  return {
    id: anchorRow.id,
    anchorCoverage: anchorRow.anchorCoverage,
    disposition: decision.disposition,
    ownerFiles,
    boundaryFiles,
    productMechanics,
    migrationRefs,
    rationale,
    adjudicated: true
  };
});

const portalEntry = portal.categories?.find(item => item.id === 'musikk');
if (!portalEntry) throw new Error('Musikk mangler i fagverk_portal.json.');
const portalRoute = text(portalEntry.badgePage);
const portalRedirected = portalRoute === EXPECTED_TARGET;
const redirectReady = rows.length === 8
  && rows.every(row => row.adjudicated && row.anchorCoverage === 1 && row.disposition === KNOWLEDGE_DISPOSITION && row.ownerFiles.length > 0);

const report = {
  schema: 'history_go_fagverk_musikk_legacy_adjudication_audit_v1',
  subject: 'musikk',
  inputs: {
    anchorAuditSchema: anchorAudit.schema,
    adjudicationFile: ADJUDICATION,
    legacyBadgePage: LEGACY_BADGE,
    manifestOwnerFiles: anchorAudit.canonical.manifestFiles,
    registryChapterOwnerFiles: chapterRoots,
    boundaryOwnerFile: CATEGORY_CONTRACT
  },
  summary: {
    legacySectionCount: rows.length,
    knowledgeSectionCount: rows.length,
    adjudicatedKnowledgeCount: rows.filter(row => row.adjudicated).length,
    allowedKnowledgeOwnerFileCount: allowedKnowledgeOwners.size,
    canonicalOwnerFileCount: new Set(rows.flatMap(row => row.ownerFiles)).size,
    migratedSectionCount: rows.filter(row => row.migrationRefs.length > 0).length,
    canonicalSupersedesCount: rows.filter(row => row.disposition === KNOWLEDGE_DISPOSITION).length,
    productBoundarySectionCount: rows.filter(row => row.productMechanics.length > 0).length,
    productMechanicCount: rows.reduce((count, row) => count + row.productMechanics.length, 0),
    anchorAuditRedirectReady: anchorAudit.summary.redirectReady,
    redirectReady,
    redirectTarget: EXPECTED_TARGET,
    portalRoute,
    portalRedirected,
    legacyBadgeSourcePreserved: exists(LEGACY_BADGE)
  },
  rows
};

if (!report.summary.redirectReady) throw new Error('Musikk legacy adjudication er ikke redirect-klar.');
if (report.summary.migratedSectionCount !== 0) throw new Error('Musikk-auditen fant ingen gap; adjudiseringen skal ikke hevde migreringer.');
if (report.summary.canonicalSupersedesCount !== 8) throw new Error('Alle åtte Musikk-kunnskapsseksjoner skal adjudiseres som canonical_supersedes.');
if (report.summary.productBoundarySectionCount !== 2 || report.summary.productMechanicCount !== 2) {
  throw new Error('Musikk-adjudiseringen skal skille ut nøyaktig to produktgrenser/-mekanikker.');
}
if (report.summary.portalRedirected) throw new Error('Musikk portalruten skal ikke endres i adjudiserings-PR-en; redirect skjer i egen tranche.');
if (!report.summary.legacyBadgeSourcePreserved) throw new Error('Musikk legacy-teori må bevares før route-retirement.');

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
