import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ADJUDICATION = 'data/fag/subkultur/legacy_theory_adjudication_v1.json';
const RAW_AUDIT = 'scripts/audit-fagverk-subkultur-legacy-theory.mjs';
const PORTAL = 'data/fagverk/fagverk_portal.json';
const LEGACY_BADGE = 'data/fag/subkultur/merke_subkultur.html';
const ORIGINAL_LEGACY_BLOB = '562ac143c3f26fd7fb6bc817dc320f3b088246bb';
const TARGET = 'fagverk.html?subject=subkultur#fagverkIaProgresjon';
const IDS = ['felt', 'normativ', 'doxa', 'metode', 'materiell', 'sosial', 'geografisk', 'temporal', 'blindsoner', 'begreper', 'bidrag'];
const KNOWLEDGE_IDS = IDS.filter((id) => id !== 'bidrag');
const ALLOWED_OWNER_FILES = new Set([
  'data/fag/subkultur/subkulturpensum_canonical_v4_5.json',
  'data/fag/subkultur/methods_subkultur_canonical_v4_5.json',
  'data/fagverk/subkultur/subkulturteori_feltgrenser.json',
  'data/fagverk/subkultur/fellesskap_scener_egenorganisering.json',
  'data/fagverk/subkultur/stil_symboler_koder_kropp.json',
  'data/fagverk/subkultur/steder_territorier_okkupering.json',
  'data/fagverk/subkultur/motstand_avvik_kontroll.json',
  'data/fagverk/subkultur/medier_objekter_praksiser.json',
  'data/fagverk/subkultur/sosiale_randsoner_omsorg_skadereduksjon.json',
  'data/fagverk/subkultur/kommersialisering_institusjonalisering_minne.json'
]);

const abs = (file) => path.join(ROOT, file);
const readJson = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function rawAudit() {
  const result = spawnSync(process.execPath, [abs(RAW_AUDIT)], { cwd: ROOT, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || 'Subkultur raw audit failed.');
  return JSON.parse(result.stdout);
}

export function auditSubkulturLegacyAdjudication() {
  for (const file of [ADJUDICATION, PORTAL, LEGACY_BADGE]) {
    assert(fs.existsSync(abs(file)), `Mangler ${file}`);
  }

  const raw = rawAudit();
  assert(raw.subject === 'subkultur', 'Raw audit har feil subject.');
  assert(raw.summary?.knowledgeSectionCount === 10, 'Raw audit skal ha 10 kunnskapsseksjoner.');
  assert(raw.summary?.anchorCompleteCount === 10, 'Subkultur må ha 10/10 canonical ankerdekning før adjudikering.');
  assert(raw.summary?.manualReviewCount === 0, 'Subkultur har fortsatt uavklarte raw audit-gap.');
  assert(raw.summary?.redirectReady === false, 'Raw audit får aldri autorisere redirect alene.');
  assert(raw.legacy?.sourcePreserved === true, 'Subkultur legacy-kilden er ikke bevart før retirement.');
  assert(raw.legacy?.originalBlobSha === ORIGINAL_LEGACY_BLOB, 'Subkultur original legacy-blob mismatch.');
  assert(raw.legacy?.activeBlobSha === ORIGINAL_LEGACY_BLOB, 'Aktiv Subkultur-side matcher ikke original blob.');
  assert(raw.navigation?.legacyRouteActive === true && raw.navigation?.routeRetired === false, 'Råauditen må fortsatt stå på aktiv legacy-rute i adjudication-fasen.');

  const adjudication = readJson(ADJUDICATION);
  assert(adjudication.schema === 'history_go_fagverk_subkultur_legacy_adjudication_v1', 'Uventet adjudication schema.');
  assert(adjudication.subject === 'subkultur', 'Adjudication subject må være subkultur.');
  assert(adjudication.legacyBadgePage === LEGACY_BADGE, 'Legacy badgePage mismatch.');
  assert(adjudication.redirectTarget === TARGET, 'Redirect target mismatch.');
  assert(Array.isArray(adjudication.sections), 'Adjudication mangler sections.');
  assert(JSON.stringify(adjudication.sections.map((row) => row.id)) === JSON.stringify(IDS), 'Adjudication-seksjoner matcher ikke legacy-strukturen.');

  const rawById = new Map(raw.rows.map((row) => [row.id, row]));
  for (const row of adjudication.sections) {
    const rawRow = rawById.get(row.id);
    assert(rawRow, `Mangler raw row ${row.id}.`);
    assert(row.role === rawRow.role, `${row.id}: role mismatch.`);
    assert(typeof row.rationale === 'string' && row.rationale.trim().length >= 80, `${row.id}: rationale er for svak.`);
    assert(Array.isArray(row.ownerFiles), `${row.id}: ownerFiles mangler.`);
    assert(Array.isArray(row.migrationRefs), `${row.id}: migrationRefs mangler.`);
    assert(row.migrationRefs.length === 0, `${row.id}: Subkultur har ingen dokumenterte gapmigreringer og skal ikke ha migrationRefs.`);

    for (const owner of row.ownerFiles) {
      assert(ALLOWED_OWNER_FILES.has(owner), `${row.id}: ikke-tillatt canonical eier ${owner}.`);
      assert(fs.existsSync(abs(owner)), `${row.id}: canonical eier finnes ikke: ${owner}.`);
    }

    if (row.role === 'knowledge') {
      assert(rawRow.anchorCoverage === 1, `${row.id}: raw coverage er ikke 1.`);
      assert(row.ownerFiles.length > 0, `${row.id}: kunnskapsseksjon mangler canonical eier.`);
      assert(row.disposition === 'canonical_supersedes', `${row.id}: alle Subkultur-kunnskapsseksjoner skal være canonical_supersedes når råauditen har 10/10 uten gap.`);
    } else {
      assert(row.id === 'bidrag', 'Kun bidrag kan være legacy_product_copy.');
      assert(row.disposition === 'retire_legacy_product_copy', 'bidrag skal pensjoneres som produkttekst.');
      assert(row.ownerFiles.length === 0, 'bidrag skal ikke få kunstig canonical kunnskapseier.');
    }
  }

  const migrated = adjudication.sections.filter((row) => row.disposition === 'migrated_to_canonical');
  assert(migrated.length === 0, 'Subkultur skal ha 0 migrated_to_canonical-seksjoner.');
  const knowledge = adjudication.sections.filter((row) => KNOWLEDGE_IDS.includes(row.id));
  assert(knowledge.length === 10 && knowledge.every((row) => row.disposition === 'canonical_supersedes'), 'Alle 10 kunnskapsseksjoner skal være canonical_supersedes.');

  const portal = readJson(PORTAL);
  const portalSubject = portal.categories?.find((item) => item.id === 'subkultur');
  assert(portalSubject, 'Subkultur mangler i Fagverk-portalen.');
  assert(portalSubject.badgePage === LEGACY_BADGE, 'Adjudication-fasen skal ikke endre Subkultur-ruten ennå.');

  const ownerFiles = [...new Set(adjudication.sections.flatMap((row) => row.ownerFiles))].sort();
  return {
    schema: 'history_go_fagverk_subkultur_legacy_adjudication_audit_v1',
    subject: 'subkultur',
    inputs: {
      rawAuditSchema: raw.schema,
      adjudicationFile: ADJUDICATION,
      legacyBadgePage: LEGACY_BADGE
    },
    summary: {
      legacySectionCount: adjudication.sections.length,
      knowledgeSectionCount: KNOWLEDGE_IDS.length,
      adjudicatedKnowledgeCount: knowledge.length,
      canonicalOwnerFileCount: ownerFiles.length,
      migratedSectionCount: 0,
      canonicalSupersedesCount: knowledge.length,
      retiredProductCopyCount: 1,
      rawAuditRedirectReady: raw.summary.redirectReady,
      redirectReady: true,
      redirectTarget: TARGET,
      portalRoute: portalSubject.badgePage,
      portalRedirected: false,
      legacyBadgeSourcePreserved: raw.legacy.sourcePreserved
    },
    rows: adjudication.sections.map((row) => ({
      ...row,
      anchorCoverage: rawById.get(row.id)?.anchorCoverage ?? null,
      adjudicated: true
    }))
  };
}

const report = auditSubkulturLegacyAdjudication();
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
