import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const ADJ = 'data/fag/natur/legacy_theory_adjudication_v1.json';
const REGISTRY = 'data/fagverk/fagverk_registry.json';
const PORTAL = 'data/fagverk/fagverk_portal.json';
const LEGACY_BADGE = 'data/fag/natur/merke_natur (1).html';
const BADGE = 'data/badges/natur.json';
const CATEGORY_CONTRACT = 'data/categories/category_contract.json';
const FAGVERK_RUNTIME = 'fagverk.html';
const TARGET = 'fagverk.html?subject=natur#fagverkIaProgresjon';
const KNOWLEDGE = 'canonical_supersedes';
const PRODUCT_SUMMARY = 'retire_legacy_product_summary';

const abs = file => path.join(ROOT, file);
const exists = file => fs.existsSync(abs(file));
const read = file => fs.readFileSync(abs(file), 'utf8');
const json = file => JSON.parse(read(file));
const text = value => String(value ?? '').trim();

function anchorAudit() {
  const result = spawnSync(process.execPath, ['scripts/audit-fagverk-natur-legacy-theory.mjs'], {
    cwd: ROOT,
    encoding: 'utf8'
  });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

for (const file of [ADJ, REGISTRY, PORTAL, LEGACY_BADGE, BADGE, CATEGORY_CONTRACT, FAGVERK_RUNTIME]) {
  if (!exists(file)) throw new Error(`Natur-adjudisering mangler ${file}`);
}

const anchor = anchorAudit();
const adj = json(ADJ);
const registry = json(REGISTRY);
const portal = json(PORTAL);
const categoryContract = json(CATEGORY_CONTRACT);

if (adj.schema !== 'history_go_fagverk_legacy_theory_adjudication_v1' || adj.subject_id !== 'natur') {
  throw new Error('Ugyldig Natur-adjudisering.');
}
if (
  adj.policy?.canonical_content_wins !== true ||
  adj.policy?.copy_legacy_prose !== false ||
  adj.policy?.redirect_target !== TARGET ||
  adj.policy?.redirect_only_after_gate !== true
) {
  throw new Error('Ugyldig Natur-adjudiseringspolicy.');
}
if (
  anchor.summary?.knowledgeSectionCount !== 5 ||
  anchor.summary?.anchorCompleteCount !== 5 ||
  anchor.summary?.manualReviewCount !== 0 ||
  anchor.summary?.redirectReady !== false
) {
  throw new Error('Natur anchor-audit er ikke 5/5 fail-closed.');
}

const registrySubject = registry.subjects?.natur;
const chapterRoots = (registrySubject?.chapters || []).map(chapter => text(chapter.file)).filter(Boolean);
if (chapterRoots.length !== 12) throw new Error(`Forventet 12 Natur-kapittelrøtter, fant ${chapterRoots.length}.`);
const allowedKnowledgeOwners = new Set([...(anchor.canonical?.manifestSeedFiles || []), ...chapterRoots]);

const sectionDecisions = new Map((adj.sections || []).map(row => [text(row.id), row]));
const expectedSections = anchor.rows.map(row => row.id);
if (
  expectedSections.some(id => !sectionDecisions.has(id)) ||
  [...sectionDecisions.keys()].some(id => !expectedSections.includes(id))
) {
  throw new Error('Natur-adjudiseringen matcher ikke legacy-seksjonene.');
}

const rows = anchor.rows.map(anchorRow => {
  const decision = sectionDecisions.get(anchorRow.id);
  const owners = (decision.owner_files || []).map(text).filter(Boolean);
  const migrations = (decision.migration_refs || []).map(text).filter(Boolean);
  if (!text(decision.rationale)) throw new Error(`${anchorRow.id} mangler rationale.`);

  if (anchorRow.role === 'legacy_product_summary') {
    if (decision.disposition !== PRODUCT_SUMMARY || owners.length || migrations.length) {
      throw new Error('Natur status-seksjonen skal pensjoneres som legacy-produktoppsummering uten kunnskapseier.');
    }
  } else {
    if (decision.disposition !== KNOWLEDGE || anchorRow.anchorCoverage !== 1 || !owners.length) {
      throw new Error(`${anchorRow.id} er ikke korrekt canonical_supersedes.`);
    }
    if (migrations.length) throw new Error(`${anchorRow.id} skal ikke hevde faglig migrering; #5495 fant 0 kunnskapsgap.`);
    for (const file of owners) {
      if (!exists(file)) throw new Error(`${anchorRow.id} peker til manglende ${file}`);
      if (!allowedKnowledgeOwners.has(file)) {
        throw new Error(`${anchorRow.id} peker utenfor canonical Natur-eierskap: ${file}`);
      }
    }
  }

  return {
    id: anchorRow.id,
    role: anchorRow.role,
    anchorCoverage: anchorRow.anchorCoverage,
    disposition: decision.disposition,
    ownerFiles: owners,
    migrationRefs: migrations,
    rationale: decision.rationale,
    adjudicated: true
  };
});

const expectedMechanics = [...new Set(anchor.rows.flatMap(row => row.legacyProductMechanics || []))].sort();
const mechanicDecisions = new Map((adj.product_mechanics || []).map(row => [text(row.id), row]));
if (
  expectedMechanics.some(id => !mechanicDecisions.has(id)) ||
  [...mechanicDecisions.keys()].some(id => !expectedMechanics.includes(id))
) {
  throw new Error('Natur-adjudiseringen matcher ikke de isolerte produktmekanikkene.');
}

const mechanics = expectedMechanics.map(id => {
  const decision = mechanicDecisions.get(id);
  const owners = (decision.owner_files || []).map(text).filter(Boolean);
  const migrations = (decision.migration_refs || []).map(text).filter(Boolean);
  if (!text(decision.rationale)) throw new Error(`${id} mangler produktrationale.`);

  if (id === 'badge_activity_progress') {
    if (decision.disposition !== 'canonical_product_state' || JSON.stringify(owners) !== JSON.stringify([BADGE]) || migrations.length) {
      throw new Error('badge_activity_progress skal eies av canonical Natur-badge-data.');
    }
  } else if (id === 'integrated_progression_route') {
    if (decision.disposition !== 'canonical_progression_route' || JSON.stringify(owners) !== JSON.stringify([FAGVERK_RUNTIME]) || migrations.length) {
      throw new Error('integrated_progression_route skal eies av den generiske Fagverk-runtime-flaten.');
    }
  } else if (['subject_completion_snapshot', 'subject_inventory_snapshot'].includes(id)) {
    if (decision.disposition !== 'retire_legacy_snapshot' || owners.length || migrations.length) {
      throw new Error(`${id} skal pensjoneres som statisk legacy-snapshot.`);
    }
  } else {
    throw new Error(`Ukjent Natur-produktmekanikk: ${id}`);
  }

  for (const file of owners) if (!exists(file)) throw new Error(`${id} peker til manglende produkteier ${file}`);
  return { id, disposition: decision.disposition, ownerFiles: owners, migrationRefs: migrations, rationale: decision.rationale, adjudicated: true };
});

const expectedBoundaries = [...new Set(anchor.rows.flatMap(row => row.legacyProductBoundaries || []))].sort();
const boundaryDecisions = new Map((adj.product_boundaries || []).map(row => [text(row.id), row]));
if (
  expectedBoundaries.some(id => !boundaryDecisions.has(id)) ||
  [...boundaryDecisions.keys()].some(id => !expectedBoundaries.includes(id))
) {
  throw new Error('Natur-adjudiseringen matcher ikke de isolerte produktgrensene.');
}

const boundaries = expectedBoundaries.map(id => {
  const decision = boundaryDecisions.get(id);
  const owners = (decision.owner_files || []).map(text).filter(Boolean);
  const migrations = (decision.migration_refs || []).map(text).filter(Boolean);
  if (!text(decision.rationale)) throw new Error(`${id} mangler produktgrense-rationale.`);
  if (id !== 'nature_assignment_requires_scientific_entry') throw new Error(`Ukjent Natur-produktgrense: ${id}`);
  if (
    decision.disposition !== 'migrated_to_canonical_product_contract' ||
    JSON.stringify(owners) !== JSON.stringify([CATEGORY_CONTRACT]) ||
    JSON.stringify(migrations) !== JSON.stringify([`${CATEGORY_CONTRACT}#decisions.natur`])
  ) {
    throw new Error('Natur-kategorigrensen skal migreres eksplisitt til category_contract decisions.natur.');
  }
  return { id, disposition: decision.disposition, ownerFiles: owners, migrationRefs: migrations, rationale: decision.rationale, adjudicated: true };
});

const naturDecision = text(categoryContract.decisions?.natur);
if (!naturDecision) throw new Error('category_contract mangler decisions.natur etter produktgrense-migreringen.');
if (!/naturfaglig relevans/i.test(naturDecision) || !/(grønt preg|estetisk naturopplevelse)/i.test(naturDecision) || !/ikke tilstrekkelig/i.test(naturDecision)) {
  throw new Error('decisions.natur bevarer ikke den adjudiserte Natur-kategorigrensen.');
}
if (!Array.isArray(categoryContract.runtimeCategories) || !categoryContract.runtimeCategories.includes('natur')) {
  throw new Error('Natur må fortsatt være canonical runtimekategori.');
}
if (!Array.isArray(categoryContract.fagSubjects) || !categoryContract.fagSubjects.includes('natur')) {
  throw new Error('Natur må fortsatt være canonical fagkategori.');
}

const knowledgeRows = rows.filter(row => row.role !== 'legacy_product_summary');
const productSummaryRows = rows.filter(row => row.role === 'legacy_product_summary');
const portalEntry = portal.categories?.find(item => item.id === 'natur');
if (!portalEntry) throw new Error('Natur mangler i Fagverk-portalen.');
if (portalEntry.badgePage !== LEGACY_BADGE) {
  throw new Error(`Adjudiseringstranchen skal være pre-redirect; badgePage=${portalEntry.badgePage}`);
}

const redirectReady =
  knowledgeRows.length === 5 &&
  knowledgeRows.every(row => row.adjudicated && row.anchorCoverage === 1 && row.disposition === KNOWLEDGE && row.ownerFiles.length > 0) &&
  productSummaryRows.length === 1 &&
  productSummaryRows[0].disposition === PRODUCT_SUMMARY &&
  mechanics.length === 4 && mechanics.every(row => row.adjudicated) &&
  boundaries.length === 1 && boundaries.every(row => row.adjudicated);

const report = {
  schema: 'history_go_fagverk_natur_legacy_adjudication_audit_v1',
  subject: 'natur',
  inputs: {
    anchorAuditSchema: anchor.schema,
    adjudicationFile: ADJ,
    legacyBadgePage: LEGACY_BADGE,
    manifestOwnerFiles: anchor.canonical.manifestSeedFiles,
    registryChapterOwnerFiles: chapterRoots,
    badgeOwnerFile: BADGE,
    categoryBoundaryOwnerFile: CATEGORY_CONTRACT,
    progressionRuntimeFile: FAGVERK_RUNTIME
  },
  summary: {
    legacySectionCount: rows.length,
    knowledgeSectionCount: knowledgeRows.length,
    adjudicatedKnowledgeCount: knowledgeRows.length,
    allowedKnowledgeOwnerFileCount: allowedKnowledgeOwners.size,
    canonicalOwnerFileCount: new Set(knowledgeRows.flatMap(row => row.ownerFiles)).size,
    migratedKnowledgeSectionCount: 0,
    canonicalSupersedesCount: knowledgeRows.filter(row => row.disposition === KNOWLEDGE).length,
    retiredProductSummaryCount: productSummaryRows.filter(row => row.disposition === PRODUCT_SUMMARY).length,
    canonicalProductMechanicCount: mechanics.filter(row => ['canonical_product_state', 'canonical_progression_route'].includes(row.disposition)).length,
    retiredProductSnapshotCount: mechanics.filter(row => row.disposition === 'retire_legacy_snapshot').length,
    migratedProductBoundaryCount: boundaries.filter(row => row.disposition === 'migrated_to_canonical_product_contract').length,
    anchorAuditRedirectReady: anchor.summary.redirectReady,
    redirectReady,
    redirectTarget: TARGET,
    portalRoute: portalEntry.badgePage,
    portalRedirected: portalEntry.badgePage === TARGET,
    legacyBadgeSourcePresent: exists(LEGACY_BADGE),
    natureCategoryBoundaryCanonical: Boolean(naturDecision)
  },
  rows,
  productMechanics: mechanics,
  productBoundaries: boundaries
};

if (!report.summary.redirectReady) throw new Error('Natur adjudication er ikke redirect-klar.');
if (report.summary.canonicalSupersedesCount !== 5 || report.summary.migratedKnowledgeSectionCount !== 0) {
  throw new Error('Natur-adjudisering skal ha 5 canonical_supersedes og 0 faglige migreringer.');
}
if (report.summary.retiredProductSummaryCount !== 1) throw new Error('Natur status-oppsummering er ikke eksplisitt pensjonert.');
if (report.summary.canonicalProductMechanicCount !== 2 || report.summary.retiredProductSnapshotCount !== 2) {
  throw new Error('Natur-produktmekanikk er ikke fullstendig adjudisert.');
}
if (report.summary.migratedProductBoundaryCount !== 1 || !report.summary.natureCategoryBoundaryCanonical) {
  throw new Error('Natur-produktgrensen er ikke canonicalt migrert.');
}
if (report.summary.portalRedirected) throw new Error('Natur-ruten skal ikke pensjoneres før egen route-retirement-tranche.');

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
