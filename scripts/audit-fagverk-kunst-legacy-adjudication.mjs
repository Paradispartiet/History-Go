import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const ADJUDICATION = 'data/fag/kunst/legacy_theory_adjudication_v1.json';
const PORTAL = 'data/fagverk/fagverk_portal.json';
const LEGACY_ARCHIVE = 'data/fag/kunst/archive/merke_kunst_legacy_20260828.html';
const COMPATIBILITY_PAGE = 'data/fag/kunst/merke_kunst (2).html';
const CATEGORY_CONTRACT = 'data/categories/category_contract.json';
const EXPECTED_TARGET = 'fagverk.html?subject=kunst#fagverkIaProgresjon';
const RELATIVE_TARGET = '../../../fagverk.html?subject=kunst#fagverkIaProgresjon';
const KNOWLEDGE_DISPOSITIONS = new Set(['canonical_supersedes', 'migrated_to_canonical']);
const BOUNDARY_DISPOSITIONS = new Set(['canonical_product_boundary_supersedes']);

const readJson = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(ROOT, file));
const text = (value) => String(value == null ? '' : value).trim();

function runAnchorAudit() {
  const result = spawnSync(process.execPath, ['scripts/audit-fagverk-kunst-legacy-theory.mjs'], {
    cwd: ROOT,
    encoding: 'utf8'
  });
  if (result.status !== 0) throw new Error(`Kunst legacy anchor audit feilet:\n${result.stderr || result.stdout}`);
  return JSON.parse(result.stdout);
}

for (const required of [ADJUDICATION, PORTAL, LEGACY_ARCHIVE, COMPATIBILITY_PAGE, CATEGORY_CONTRACT]) {
  if (!exists(required)) throw new Error(`Mangler nødvendig Kunst-adjudiseringsfil: ${required}`);
}

const anchorAudit = runAnchorAudit();
const adjudication = readJson(ADJUDICATION);
const portal = readJson(PORTAL);
const compatibilityHtml = read(COMPATIBILITY_PAGE);

if (adjudication.schema !== 'history_go_fagverk_legacy_theory_adjudication_v1') throw new Error(`Ukjent adjudiseringsschema: ${adjudication.schema}`);
if (adjudication.subject_id !== 'kunst') throw new Error('Adjudiseringen må eie subject_id=kunst.');
if (adjudication.policy?.canonical_content_wins !== true) throw new Error('Canonical content must win over legacy prose.');
if (adjudication.policy?.copy_legacy_prose !== false) throw new Error('Legacy prose cannot be copied by default.');
if (adjudication.redirect_target !== EXPECTED_TARGET) throw new Error('Uventet Kunst redirect-target.');
if (adjudication.policy?.product_boundary_owner !== CATEGORY_CONTRACT) throw new Error('Kunst/Scenekunst-grensen må eies av category-contract.');
if (anchorAudit.legacy.badgePage !== LEGACY_ARCHIVE) throw new Error('Kunst anchor-audit skal etter migrering lese arkivfilen, ikke compatibility-wrapperen.');

if (anchorAudit.summary.manualReviewCount !== 0 || anchorAudit.summary.anchorCompleteCount !== anchorAudit.summary.knowledgeSectionCount) {
  throw new Error('Kunst legacy anchor-audit har fortsatt kunnskapshull og kan ikke adjudiseres redirect-klar.');
}
if (anchorAudit.summary.productBoundaryCompleteCount !== anchorAudit.summary.productBoundarySectionCount) {
  throw new Error('Kunst legacy product boundary er ikke komplett.');
}

const anchorRows = new Map(anchorAudit.rows.map((row) => [row.id, row]));
const decisions = Array.isArray(adjudication.sections) ? adjudication.sections : [];
const decisionById = new Map();
for (const decision of decisions) {
  const id = text(decision?.id);
  if (!id) throw new Error('Adjudiseringsrad mangler id.');
  if (decisionById.has(id)) throw new Error(`Duplikat adjudisering for ${id}.`);
  decisionById.set(id, decision);
}

const expectedIds = anchorAudit.rows.map((row) => row.id);
const missingDecisions = expectedIds.filter((id) => !decisionById.has(id));
const unknownDecisions = [...decisionById.keys()].filter((id) => !anchorRows.has(id));
if (missingDecisions.length) throw new Error(`Mangler eksplisitt Kunst-adjudisering: ${missingDecisions.join(', ')}`);
if (unknownDecisions.length) throw new Error(`Ukjente Kunst-adjudiseringsseksjoner: ${unknownDecisions.join(', ')}`);

const canonicalOwnerSet = new Set([
  ...(anchorAudit.canonical.manifestFiles || []),
  ...(anchorAudit.canonical.manifestGraphFiles || []),
  ...(anchorAudit.canonical.registryFiles || [])
]);
canonicalOwnerSet.add(CATEGORY_CONTRACT);

const rows = anchorAudit.rows.map((anchorRow) => {
  const decision = decisionById.get(anchorRow.id);
  const ownerFiles = Array.isArray(decision.owner_files) ? decision.owner_files.map(text).filter(Boolean) : [];
  const missingOwnerFiles = ownerFiles.filter((file) => !exists(file));
  const nonCanonicalOwnerFiles = ownerFiles.filter((file) => !canonicalOwnerSet.has(file));
  const migrationRefs = Array.isArray(decision.migration_refs) ? decision.migration_refs.map(text).filter(Boolean) : [];
  const rationale = text(decision.rationale);

  if (!rationale) throw new Error(`Adjudisering for ${anchorRow.id} mangler rationale.`);
  if (missingOwnerFiles.length) throw new Error(`${anchorRow.id} peker til manglende owner-filer: ${missingOwnerFiles.join(', ')}`);
  if (nonCanonicalOwnerFiles.length) throw new Error(`${anchorRow.id} peker utenfor canonical Kunst-korpus/product contract: ${nonCanonicalOwnerFiles.join(', ')}`);

  if (anchorRow.role === 'knowledge') {
    if (!KNOWLEDGE_DISPOSITIONS.has(decision.disposition)) throw new Error(`Ugyldig knowledge-disposition for ${anchorRow.id}: ${decision.disposition}`);
    if (!ownerFiles.length) throw new Error(`Knowledge-seksjonen ${anchorRow.id} må ha minst én canonical eier.`);
    if (anchorRow.anchorCoverage !== 1) throw new Error(`Knowledge-seksjonen ${anchorRow.id} har fortsatt canonical ankerhull.`);
    if (decision.disposition === 'migrated_to_canonical') {
      if (!migrationRefs.includes('pr:#5461')) throw new Error(`${anchorRow.id} er migrated_to_canonical uten eksplisitt #5461-bevis.`);
      const fileRefs = migrationRefs.filter((ref) => !ref.startsWith('pr:'));
      if (!fileRefs.length || fileRefs.some((ref) => !exists(ref))) throw new Error(`${anchorRow.id} har ugyldige migration_refs.`);
    } else if (migrationRefs.length) {
      throw new Error(`${anchorRow.id} er canonical_supersedes men har migration_refs.`);
    }
  } else if (anchorRow.role === 'product_boundary') {
    if (!BOUNDARY_DISPOSITIONS.has(decision.disposition)) throw new Error(`Ugyldig product-boundary disposition for ${anchorRow.id}: ${decision.disposition}`);
    if (ownerFiles.length !== 1 || ownerFiles[0] !== CATEGORY_CONTRACT) throw new Error(`${anchorRow.id} må eies kun av category-contract.`);
    if (migrationRefs.length) throw new Error(`${anchorRow.id} er en eksisterende produktgrense og skal ikke ha migration_refs.`);
    if (anchorRow.anchorCoverage !== 1) throw new Error(`${anchorRow.id} har ufullstendig product-boundary coverage.`);
  } else {
    throw new Error(`Ukjent legacy role for ${anchorRow.id}: ${anchorRow.role}`);
  }

  return {
    id: anchorRow.id,
    heading: anchorRow.heading,
    role: anchorRow.role,
    anchorCoverage: anchorRow.anchorCoverage,
    disposition: decision.disposition,
    ownerFiles,
    migrationRefs,
    rationale,
    adjudicated: true
  };
});

const knowledgeRows = rows.filter((row) => row.role === 'knowledge');
const boundaryRows = rows.filter((row) => row.role === 'product_boundary');
const portalEntry = portal.categories?.find((item) => item.id === 'kunst');
if (!portalEntry) throw new Error('Kunst mangler i fagverk_portal.json.');
const portalRoute = text(portalEntry.badgePage);
const portalRedirected = portalRoute === EXPECTED_TARGET;
const compatibilityRedirectPresent = compatibilityHtml.includes('location.replace')
  && compatibilityHtml.includes(RELATIVE_TARGET)
  && !compatibilityHtml.includes('id="felt"')
  && !compatibilityHtml.includes('id="offentlig-rom"');

const redirectReady = knowledgeRows.length === anchorAudit.summary.knowledgeSectionCount
  && knowledgeRows.every((row) => row.adjudicated && row.anchorCoverage === 1 && KNOWLEDGE_DISPOSITIONS.has(row.disposition) && row.ownerFiles.length > 0)
  && boundaryRows.length === anchorAudit.summary.productBoundarySectionCount
  && boundaryRows.every((row) => row.adjudicated && row.anchorCoverage === 1 && BOUNDARY_DISPOSITIONS.has(row.disposition));

const report = {
  schema: 'history_go_fagverk_kunst_legacy_adjudication_audit_v1',
  subject: 'kunst',
  inputs: {
    anchorAuditSchema: anchorAudit.schema,
    adjudicationFile: ADJUDICATION,
    legacyArchive: LEGACY_ARCHIVE,
    compatibilityPage: COMPATIBILITY_PAGE,
    productBoundaryOwner: CATEGORY_CONTRACT
  },
  summary: {
    legacySectionCount: rows.length,
    knowledgeSectionCount: knowledgeRows.length,
    productBoundarySectionCount: boundaryRows.length,
    adjudicatedKnowledgeCount: knowledgeRows.filter((row) => row.adjudicated).length,
    adjudicatedProductBoundaryCount: boundaryRows.filter((row) => row.adjudicated).length,
    canonicalOwnerFileCount: new Set(rows.flatMap((row) => row.ownerFiles)).size,
    migratedSectionCount: knowledgeRows.filter((row) => row.disposition === 'migrated_to_canonical').length,
    supersededKnowledgeCount: knowledgeRows.filter((row) => row.disposition === 'canonical_supersedes').length,
    redirectReady,
    redirectTarget: EXPECTED_TARGET,
    portalRoute,
    portalRedirected,
    legacyBadgeSourcePreserved: exists(LEGACY_ARCHIVE),
    compatibilityRedirectPresent
  },
  rows
};

if (!report.summary.redirectReady) throw new Error('Kunst legacy adjudication er ikke redirect-klar.');
if (report.summary.migratedSectionCount !== 2) throw new Error(`Kunst skal ha nøyaktig to migrated legacy-seksjoner etter #5461, fant ${report.summary.migratedSectionCount}.`);
if (report.summary.supersededKnowledgeCount !== 7) throw new Error(`Kunst skal ha syv canonical_supersedes knowledge-seksjoner, fant ${report.summary.supersededKnowledgeCount}.`);
if (!report.summary.portalRedirected) throw new Error('Kunst portalruten skal etter route-retirement peke til integrert Progresjon.');
if (!report.summary.legacyBadgeSourcePreserved) throw new Error('Kunst legacy-teori må bevares som arkiv etter redirect.');
if (!report.summary.compatibilityRedirectPresent) throw new Error('Kunst compatibility-URL mangler ren redirect til integrert Progresjon.');

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
