import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const ADJUDICATION = 'data/fag/litteratur/legacy_theory_adjudication_v1.json';
const PORTAL = 'data/fagverk/fagverk_portal.json';
const LEGACY_BADGE = 'data/fag/litteratur/archive/merke_litteratur_full_teori_legacy_20260828.html';
const COMPAT_BADGE_PAGE = 'data/fag/litteratur/merke_litteratur (1).html';
const EXPECTED_TARGET = 'fagverk.html?subject=litteratur#fagverkIaProgresjon';
const KNOWLEDGE_DISPOSITIONS = new Set(['canonical_supersedes', 'migrated_to_canonical']);
const PRODUCT_DISPOSITIONS = new Set(['retire_legacy_product_copy']);

const readJson = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const exists = (file) => fs.existsSync(path.join(ROOT, file));
const text = (value) => String(value == null ? '' : value).trim();

function runAnchorAudit() {
  const result = spawnSync(process.execPath, ['scripts/audit-fagverk-litteratur-legacy-theory.mjs'], {
    cwd: ROOT,
    encoding: 'utf8'
  });
  if (result.status !== 0) throw new Error(`Litteratur legacy anchor audit feilet:\n${result.stderr || result.stdout}`);
  return JSON.parse(result.stdout);
}

for (const required of [ADJUDICATION, PORTAL, LEGACY_BADGE, COMPAT_BADGE_PAGE]) {
  if (!exists(required)) throw new Error(`Mangler nødvendig Litteratur-adjudiseringsfil: ${required}`);
}

const anchorAudit = runAnchorAudit();
const adjudication = readJson(ADJUDICATION);
const portal = readJson(PORTAL);

if (adjudication.schema !== 'history_go_fagverk_legacy_theory_adjudication_v1') throw new Error(`Ukjent adjudiseringsschema: ${adjudication.schema}`);
if (adjudication.subject_id !== 'litteratur') throw new Error('Adjudiseringen må eie subject_id=litteratur.');
if (adjudication.policy?.canonical_content_wins !== true) throw new Error('Canonical content must win over legacy prose.');
if (adjudication.policy?.copy_legacy_prose !== false) throw new Error('Legacy prose cannot be copied by default.');
if (adjudication.policy?.redirect_target !== EXPECTED_TARGET) throw new Error('Uventet Litteratur redirect-target.');

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
if (missingDecisions.length) throw new Error(`Mangler eksplisitt Litteratur-adjudisering: ${missingDecisions.join(', ')}`);
if (unknownDecisions.length) throw new Error(`Ukjente Litteratur-adjudiseringsseksjoner: ${unknownDecisions.join(', ')}`);

const canonicalOwnerSet = new Set([
  ...(anchorAudit.canonical.manifestFiles || []),
  ...(anchorAudit.canonical.manifestGraphFiles || []),
  ...(anchorAudit.canonical.registryFiles || [])
]);

const rows = anchorAudit.rows.map((anchorRow) => {
  const decision = decisionById.get(anchorRow.id);
  const ownerFiles = Array.isArray(decision.owner_files) ? decision.owner_files.map(text).filter(Boolean) : [];
  const missingOwnerFiles = ownerFiles.filter((file) => !exists(file));
  const nonCanonicalOwnerFiles = ownerFiles.filter((file) => !canonicalOwnerSet.has(file));
  const migrationRefs = Array.isArray(decision.migration_refs) ? decision.migration_refs.map(text).filter(Boolean) : [];
  const rationale = text(decision.rationale);

  if (!rationale) throw new Error(`Adjudisering for ${anchorRow.id} mangler rationale.`);
  if (missingOwnerFiles.length) throw new Error(`${anchorRow.id} peker til manglende owner-filer: ${missingOwnerFiles.join(', ')}`);
  if (nonCanonicalOwnerFiles.length) throw new Error(`${anchorRow.id} peker utenfor canonical Litteratur-korpus: ${nonCanonicalOwnerFiles.join(', ')}`);

  if (anchorRow.role === 'knowledge') {
    if (!KNOWLEDGE_DISPOSITIONS.has(decision.disposition)) throw new Error(`Ugyldig knowledge-disposition for ${anchorRow.id}: ${decision.disposition}`);
    if (!ownerFiles.length) throw new Error(`Knowledge-seksjonen ${anchorRow.id} må ha minst én canonical eier.`);
    if (anchorRow.anchorCoverage !== 1) throw new Error(`Knowledge-seksjonen ${anchorRow.id} har fortsatt canonical ankerhull.`);
    if (decision.disposition === 'migrated_to_canonical' && !migrationRefs.length) throw new Error(`${anchorRow.id} er markert migrated_to_canonical uten migration_refs.`);
  } else {
    if (!PRODUCT_DISPOSITIONS.has(decision.disposition)) throw new Error(`Ugyldig legacy-product disposition for ${anchorRow.id}: ${decision.disposition}`);
    if (ownerFiles.length) throw new Error(`Legacy product-copy ${anchorRow.id} skal ikke få en kunstig canonical kunnskapseier.`);
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
const productRows = rows.filter((row) => row.role === 'legacy_product_copy');
const portalEntry = portal.categories?.find((item) => item.id === 'litteratur');
if (!portalEntry) throw new Error('Litteratur mangler i fagverk_portal.json.');
const portalRoute = text(portalEntry.badgePage);
const portalRedirected = portalRoute === EXPECTED_TARGET;
const legacyBadgeSourcePreserved = exists(LEGACY_BADGE);
const compatibilityRedirectHtml = fs.readFileSync(path.join(ROOT, COMPAT_BADGE_PAGE), 'utf8');
const compatibilityRedirectPresent = compatibilityRedirectHtml.includes('location.replace')
  && compatibilityRedirectHtml.includes('subject=litteratur#fagverkIaProgresjon');

const redirectReady = knowledgeRows.length === anchorAudit.summary.knowledgeSectionCount
  && knowledgeRows.every((row) => row.adjudicated && row.anchorCoverage === 1 && KNOWLEDGE_DISPOSITIONS.has(row.disposition) && row.ownerFiles.length > 0)
  && productRows.every((row) => PRODUCT_DISPOSITIONS.has(row.disposition));

const report = {
  schema: 'history_go_fagverk_litteratur_legacy_adjudication_audit_v1',
  subject: 'litteratur',
  inputs: {
    anchorAuditSchema: anchorAudit.schema,
    adjudicationFile: ADJUDICATION,
    legacyBadgePage: LEGACY_BADGE,
    compatibilityBadgePage: COMPAT_BADGE_PAGE
  },
  summary: {
    legacySectionCount: rows.length,
    knowledgeSectionCount: knowledgeRows.length,
    adjudicatedKnowledgeCount: knowledgeRows.filter((row) => row.adjudicated).length,
    canonicalOwnerFileCount: new Set(knowledgeRows.flatMap((row) => row.ownerFiles)).size,
    migratedSectionCount: knowledgeRows.filter((row) => row.disposition === 'migrated_to_canonical').length,
    retiredProductCopyCount: productRows.filter((row) => row.disposition === 'retire_legacy_product_copy').length,
    anchorAuditRedirectReady: anchorAudit.summary.redirectReady,
    redirectReady,
    redirectTarget: EXPECTED_TARGET,
    portalRoute,
    portalRedirected,
    legacyBadgeSourcePreserved,
    compatibilityRedirectPresent
  },
  rows
};

if (!report.summary.redirectReady) throw new Error('Litteratur legacy adjudication er ikke redirect-klar.');
if (!report.summary.portalRedirected) throw new Error(`Litteratur badgePage må peke til ${EXPECTED_TARGET} etter grønn adjudisering.`);
if (!report.summary.legacyBadgeSourcePreserved) throw new Error('Arkivert Litteratur-teori må bevares som auditkilde.');
if (!report.summary.compatibilityRedirectPresent) throw new Error('Legacy Litteratur-URL må være en compatibility-redirect til Progresjon.');

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
