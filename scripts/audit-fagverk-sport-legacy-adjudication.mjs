import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ADJUDICATION = 'data/fag/sport/legacy_theory_adjudication_v1.json';
const RAW_AUDIT = 'scripts/audit-fagverk-sport-legacy-theory.mjs';
const PORTAL = 'data/fagverk/fagverk_portal.json';
const LEGACY = 'data/fag/sport/merke_sport.html';
const TARGET = 'fagverk.html?subject=sport#fagverkIaProgresjon';
const IDS = ['felt', 'normativ', 'doxa', 'metode', 'materiell', 'sosial', 'geografisk', 'temporal', 'blindsoner', 'begreper', 'bidrag'];
const KNOWLEDGE_IDS = IDS.filter((id) => id !== 'bidrag');
const ALLOWED_OWNER_FILES = new Set([
  'data/fag/sport/sportpensum_canonical_v4_5.json',
  'data/fag/sport/methods_sport_canonical_v4_5.json',
  'data/fagverk/sport/arenaer-steder-groundhopper.json',
  'data/fagverk/sport/regler-spill-konkurranse.json',
  'data/fagverk/sport/kropp-trening-prestasjon.json',
  'data/fagverk/sport/klubber-lag-frivillighet.json',
  'data/fagverk/sport/supportere-publikum-kultur.json',
  'data/fagverk/sport/inkludering-helse-lek-samfunn.json'
]);

const abs = (file) => path.join(ROOT, file);
const readJson = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));

function rawAudit() {
  const result = spawnSync(process.execPath, [abs(RAW_AUDIT)], { cwd: ROOT, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || 'Sport raw audit failed.');
  return JSON.parse(result.stdout);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function auditSportLegacyAdjudication() {
  for (const file of [ADJUDICATION, PORTAL, LEGACY]) {
    assert(fs.existsSync(abs(file)), `Mangler ${file}`);
  }

  const raw = rawAudit();
  assert(raw.subject === 'sport', 'Raw audit har feil subject.');
  assert(raw.summary?.knowledgeSectionCount === 10, 'Raw audit skal ha 10 kunnskapsseksjoner.');
  assert(raw.summary?.anchorCompleteCount === 10, 'Sport må ha 10/10 canonical ankerdekning før adjudikering.');
  assert(raw.summary?.manualReviewCount === 0, 'Sport har fortsatt uavklarte raw audit-gap.');
  assert(raw.summary?.redirectReady === false, 'Raw audit får aldri autorisere redirect alene.');

  const adjudication = readJson(ADJUDICATION);
  assert(adjudication.schema === 'history_go_fagverk_sport_legacy_adjudication_v1', 'Uventet adjudication schema.');
  assert(adjudication.subject === 'sport', 'Adjudication subject må være sport.');
  assert(adjudication.legacyBadgePage === LEGACY, 'Legacy badgePage mismatch.');
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

    for (const owner of row.ownerFiles) {
      assert(ALLOWED_OWNER_FILES.has(owner), `${row.id}: ikke-tillatt canonical eier ${owner}.`);
      assert(fs.existsSync(abs(owner)), `${row.id}: canonical eier finnes ikke: ${owner}.`);
    }

    if (row.role === 'knowledge') {
      assert(rawRow.anchorCoverage === 1, `${row.id}: raw coverage er ikke 1.`);
      assert(row.ownerFiles.length > 0, `${row.id}: kunnskapsseksjon mangler canonical eier.`);
      assert(['canonical_supersedes', 'migrated_to_canonical'].includes(row.disposition), `${row.id}: ugyldig disposition.`);
    } else {
      assert(row.id === 'bidrag', 'Kun bidrag kan være legacy_product_copy.');
      assert(row.disposition === 'retire_legacy_product_copy', 'bidrag skal pensjoneres som produkttekst.');
      assert(row.ownerFiles.length === 0, 'bidrag skal ikke få kunstig canonical kunnskapseier.');
      assert(row.migrationRefs.length === 0, 'bidrag skal ikke ha migreringsreferanser.');
    }
  }

  const social = adjudication.sections.find((row) => row.id === 'sosial');
  assert(social.disposition === 'migrated_to_canonical', 'sosial skal være den eneste migrerte kunnskapsseksjonen.');
  assert(social.ownerFiles.includes('data/fagverk/sport/inkludering-helse-lek-samfunn.json'), 'sosial mangler inkluderingskapitlet som eier.');
  assert(social.migrationRefs.includes('data/fagverk/sport/inkludering-helse-lek-samfunn.json'), 'sosial mangler filreferanse til gapmigreringen.');
  assert(social.migrationRefs.includes('PR #5509'), 'sosial mangler PR #5509 som migreringsbevis.');

  const otherKnowledge = adjudication.sections.filter((row) => KNOWLEDGE_IDS.includes(row.id) && row.id !== 'sosial');
  assert(otherKnowledge.every((row) => row.disposition === 'canonical_supersedes'), 'Alle øvrige kunnskapsseksjoner skal være canonical_supersedes.');
  assert(otherKnowledge.every((row) => row.migrationRefs.length === 0), 'Kun sosial skal ha migreringsreferanser.');

  const portal = readJson(PORTAL);
  const portalSubject = portal.categories?.find((item) => item.id === 'sport');
  assert(portalSubject, 'Sport mangler i Fagverk-portalen.');
  assert(portalSubject.badgePage === LEGACY, 'Adjudication-PR skal ikke endre Sport-ruten før retirement.');

  const migrated = adjudication.sections.filter((row) => row.disposition === 'migrated_to_canonical');
  const superseded = adjudication.sections.filter((row) => row.disposition === 'canonical_supersedes');
  const retiredProduct = adjudication.sections.filter((row) => row.disposition === 'retire_legacy_product_copy');
  const ownerFiles = [...new Set(adjudication.sections.flatMap((row) => row.ownerFiles))].sort();

  return {
    schema: 'history_go_fagverk_sport_legacy_adjudication_audit_v1',
    subject: 'sport',
    inputs: {
      rawAuditSchema: raw.schema,
      adjudicationFile: ADJUDICATION,
      legacyBadgePage: LEGACY
    },
    summary: {
      legacySectionCount: adjudication.sections.length,
      knowledgeSectionCount: KNOWLEDGE_IDS.length,
      adjudicatedKnowledgeCount: adjudication.sections.filter((row) => row.role === 'knowledge').length,
      canonicalOwnerFileCount: ownerFiles.length,
      migratedSectionCount: migrated.length,
      canonicalSupersedesCount: superseded.length,
      retiredProductCopyCount: retiredProduct.length,
      rawAuditRedirectReady: raw.summary.redirectReady,
      redirectReady: true,
      redirectTarget: TARGET,
      portalRoute: portalSubject.badgePage,
      portalRedirected: false
    },
    rows: adjudication.sections.map((row) => ({
      ...row,
      anchorCoverage: rawById.get(row.id)?.anchorCoverage ?? null,
      adjudicated: true
    }))
  };
}

const report = auditSportLegacyAdjudication();
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
