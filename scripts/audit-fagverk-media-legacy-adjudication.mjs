import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const ADJUDICATION = 'data/fag/media/legacy_theory_adjudication_v1.json';
const REGISTRY = 'data/fagverk/fagverk_registry.json';
const PORTAL = 'data/fagverk/fagverk_portal.json';
const LEGACY_BADGE = 'data/fag/media/merke_media.html';
const EXPECTED_TARGET = 'fagverk.html?subject=media#fagverkIaProgresjon';
const KNOWLEDGE_DISPOSITIONS = new Set(['canonical_supersedes', 'migrated_to_canonical']);
const PRODUCT_DISPOSITIONS = new Set(['retire_legacy_product_copy']);

const readJson = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const exists = (file) => fs.existsSync(path.join(ROOT, file));
const text = (value) => String(value == null ? '' : value).trim();

function runAnchorAudit() {
  const result = spawnSync(process.execPath, ['scripts/audit-fagverk-media-legacy-theory.mjs'], {
    cwd: ROOT,
    encoding: 'utf8'
  });
  if (result.status !== 0) throw new Error(`Media legacy anchor audit feilet:\n${result.stderr || result.stdout}`);
  return JSON.parse(result.stdout);
}

for (const required of [ADJUDICATION, REGISTRY, PORTAL, LEGACY_BADGE]) {
  if (!exists(required)) throw new Error(`Mangler nødvendig Media-adjudiseringsfil: ${required}`);
}

const anchorAudit = runAnchorAudit();
const adjudication = readJson(ADJUDICATION);
const registry = readJson(REGISTRY);
const portal = readJson(PORTAL);

if (adjudication.schema !== 'history_go_fagverk_legacy_theory_adjudication_v1') throw new Error(`Ukjent adjudiseringsschema: ${adjudication.schema}`);
if (adjudication.subject_id !== 'media') throw new Error('Adjudiseringen må eie subject_id=media.');
if (adjudication.policy?.canonical_content_wins !== true) throw new Error('Canonical Media content must win over legacy prose.');
if (adjudication.policy?.copy_legacy_prose !== false) throw new Error('Legacy Media prose cannot be copied by default.');
if (adjudication.policy?.redirect_target !== EXPECTED_TARGET) throw new Error('Uventet Media redirect-target.');
if (adjudication.policy?.redirect_only_after_gate !== true) throw new Error('Media redirect må være eksplisitt blokkert til adjudiseringsgaten er grønn.');

if (anchorAudit.subject !== 'media') throw new Error('Media-adjudiseringen mottok feil anchor-audit.');
if (anchorAudit.summary?.anchorCompleteCount !== 10 || anchorAudit.summary?.manualReviewCount !== 0) {
  throw new Error('Media kan ikke adjudiseres før anchor-auditen beviser 10/10 dekning og 0 manuelle gap.');
}
if (anchorAudit.summary?.redirectReady !== false) throw new Error('Anchor-auditen alene skal aldri godkjenne Media-redirect.');

const mediaRegistry = registry.subjects?.media;
if (!mediaRegistry) throw new Error('Media mangler i Fagverk-registeret.');
const registryOwnerFiles = (Array.isArray(mediaRegistry.chapters) ? mediaRegistry.chapters : [])
  .map((chapter) => text(chapter?.file))
  .filter(Boolean);
if (registryOwnerFiles.length !== 6) throw new Error(`Media-registeret skal gi seks kapittelrot-eiere, fant ${registryOwnerFiles.length}.`);

const canonicalOwnerSet = new Set([
  ...(anchorAudit.canonical?.manifestFiles || []),
  ...registryOwnerFiles
]);
if (canonicalOwnerSet.size !== 11) throw new Error(`Media-adjudisering forventer 11 tillatte canonicale owner-filer, fant ${canonicalOwnerSet.size}.`);

const anchorRows = new Map(anchorAudit.rows.map((row) => [row.id, row]));
const decisions = Array.isArray(adjudication.sections) ? adjudication.sections : [];
const decisionById = new Map();
for (const decision of decisions) {
  const id = text(decision?.id);
  if (!id) throw new Error('Media-adjudiseringsrad mangler id.');
  if (decisionById.has(id)) throw new Error(`Duplikat Media-adjudisering for ${id}.`);
  decisionById.set(id, decision);
}

const expectedIds = anchorAudit.rows.map((row) => row.id);
const missingDecisions = expectedIds.filter((id) => !decisionById.has(id));
const unknownDecisions = [...decisionById.keys()].filter((id) => !anchorRows.has(id));
if (missingDecisions.length) throw new Error(`Mangler eksplisitt Media-adjudisering: ${missingDecisions.join(', ')}`);
if (unknownDecisions.length) throw new Error(`Ukjente Media-adjudiseringsseksjoner: ${unknownDecisions.join(', ')}`);

const rows = anchorAudit.rows.map((anchorRow) => {
  const decision = decisionById.get(anchorRow.id);
  const ownerFiles = Array.isArray(decision.owner_files) ? decision.owner_files.map(text).filter(Boolean) : [];
  const missingOwnerFiles = ownerFiles.filter((file) => !exists(file));
  const nonCanonicalOwnerFiles = ownerFiles.filter((file) => !canonicalOwnerSet.has(file));
  const migrationRefs = Array.isArray(decision.migration_refs) ? decision.migration_refs.map(text).filter(Boolean) : [];
  const rationale = text(decision.rationale);

  if (!rationale) throw new Error(`Media-adjudisering for ${anchorRow.id} mangler rationale.`);
  if (missingOwnerFiles.length) throw new Error(`${anchorRow.id} peker til manglende owner-filer: ${missingOwnerFiles.join(', ')}`);
  if (nonCanonicalOwnerFiles.length) throw new Error(`${anchorRow.id} peker utenfor tillatt canonical Media-eierskap: ${nonCanonicalOwnerFiles.join(', ')}`);

  if (anchorRow.role === 'knowledge') {
    if (!KNOWLEDGE_DISPOSITIONS.has(decision.disposition)) throw new Error(`Ugyldig Media knowledge-disposition for ${anchorRow.id}: ${decision.disposition}`);
    if (!ownerFiles.length) throw new Error(`Media knowledge-seksjonen ${anchorRow.id} må ha minst én canonical eier.`);
    if (anchorRow.anchorCoverage !== 1 || anchorRow.foundCount !== anchorRow.anchorCount || anchorRow.missingAnchors?.length) {
      throw new Error(`Media knowledge-seksjonen ${anchorRow.id} har fortsatt canonical ankerhull.`);
    }
    if (decision.disposition === 'migrated_to_canonical' && !migrationRefs.length) throw new Error(`${anchorRow.id} er markert migrated_to_canonical uten migration_refs.`);
    if (decision.disposition === 'canonical_supersedes' && migrationRefs.length) throw new Error(`${anchorRow.id} er canonical_supersedes og skal ikke ha migration_refs.`);
  } else {
    if (!PRODUCT_DISPOSITIONS.has(decision.disposition)) throw new Error(`Ugyldig Media legacy-product disposition for ${anchorRow.id}: ${decision.disposition}`);
    if (ownerFiles.length) throw new Error(`Media legacy product-copy ${anchorRow.id} skal ikke få en kunstig canonical kunnskapseier.`);
    if (migrationRefs.length) throw new Error(`Media legacy product-copy ${anchorRow.id} skal ikke ha migration_refs.`);
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

const knowledgeRows = rows.filter((row) => row.role === 'knowledge');
const productRows = rows.filter((row) => row.role === 'legacy_product_copy');
const portalEntry = portal.categories?.find((item) => item.id === 'media');
if (!portalEntry) throw new Error('Media mangler i fagverk_portal.json.');
const portalRoute = text(portalEntry.badgePage);
const portalRedirected = portalRoute === EXPECTED_TARGET;

const redirectReady = knowledgeRows.length === anchorAudit.summary.knowledgeSectionCount
  && knowledgeRows.every((row) => row.adjudicated && row.anchorCoverage === 1 && KNOWLEDGE_DISPOSITIONS.has(row.disposition) && row.ownerFiles.length > 0)
  && productRows.every((row) => PRODUCT_DISPOSITIONS.has(row.disposition));

const report = {
  schema: 'history_go_fagverk_media_legacy_adjudication_audit_v1',
  subject: 'media',
  inputs: {
    anchorAuditSchema: anchorAudit.schema,
    adjudicationFile: ADJUDICATION,
    legacyBadgePage: LEGACY_BADGE,
    registryChapterOwnerFiles: registryOwnerFiles
  },
  summary: {
    legacySectionCount: rows.length,
    knowledgeSectionCount: knowledgeRows.length,
    adjudicatedKnowledgeCount: knowledgeRows.filter((row) => row.adjudicated).length,
    canonicalOwnerFileCount: new Set(knowledgeRows.flatMap((row) => row.ownerFiles)).size,
    migratedSectionCount: knowledgeRows.filter((row) => row.disposition === 'migrated_to_canonical').length,
    canonicalSupersedesCount: knowledgeRows.filter((row) => row.disposition === 'canonical_supersedes').length,
    retiredProductCopyCount: productRows.filter((row) => row.disposition === 'retire_legacy_product_copy').length,
    anchorAuditRedirectReady: anchorAudit.summary.redirectReady,
    redirectReady,
    redirectTarget: EXPECTED_TARGET,
    portalRoute,
    portalRedirected,
    legacyBadgeSourcePreserved: exists(LEGACY_BADGE)
  },
  rows
};

if (!report.summary.redirectReady) throw new Error('Media legacy adjudication er ikke redirect-klar.');
if (report.summary.migratedSectionCount !== 0) throw new Error('Media-auditen fant ingen gap; adjudiseringen skal ikke hevde nye migreringer.');
if (report.summary.canonicalSupersedesCount !== 10) throw new Error('Alle ti Media-kunnskapsseksjoner skal adjudiseres som canonical_supersedes.');
if (report.summary.portalRedirected) throw new Error('Media portalruten skal ikke endres i adjudiserings-PR-en; redirect skjer i egen tranche.');
if (!report.summary.legacyBadgeSourcePreserved) throw new Error('Media legacy-teori må bevares som auditkilde før redirect-tranchen.');

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
