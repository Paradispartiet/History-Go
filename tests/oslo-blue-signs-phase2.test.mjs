import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const exists = rel => fs.existsSync(path.join(ROOT, rel));
const intake = read('reports/oslo-blue-signs-phase2-2026/intake.json');
const manifest = read('data/places/manifest.json');

const EXISTING_BASELINE = new Set([
  'bla_skilt_aud_schonemann_vetlandsveien_69d',
  'bla_skilt_stein_mehren_ullevalsveien_60',
  'bla_skilt_christopher_hornsrud_mogens_thorsens_gate_5',
  'bla_skilt_helverschous_lokke_munkedamsveien_35',
  'bla_skilt_enerhaugen_samfund_smedgata_34',
  'bla_skilt_gartnerlokka_urtegata_50',
  'bla_skilt_sulpen_keysers_gate_5',
  'bla_skilt_kjeglebanen_briskebyveien_21',
  'bla_skilt_fredrikke_qvam_pilestredet_81',
  'bla_skilt_vebjorn_tandberg_kongens_gate_15',
  'bla_skilt_cathinka_guldberg_lovisenberggata_15a',
  'bla_skilt_sophie_borchgrevink_cort_adelers_gate_33'
]);

const expectedEydeId = 'bla_skilt_eyde_birkeland_bolteloekka_alle_10';

function placePath(candidate) {
  return `data/places/${candidate.category}/oslo/bla_skilt/${candidate.id}.json`;
}

function packetPath(candidate) {
  return `data/places/production/${candidate.id}.json`;
}

test('phase 2 is a curated 15-place expansion, not a mass import', () => {
  assert.equal(intake.policy.massImport, false);
  assert.equal(intake.policy.newBatchSize, 15);
  assert.equal(intake.policy.existingBlueSignBaseline, 12);
  assert.equal(intake.policy.legacyMicroMigrations, 5);
  assert.equal(intake.candidates.length, 15);
  assert.equal(intake.legacyMigrations.length, 5);
  assert.equal(new Set(intake.candidates.map(row => row.id)).size, 15);
  assert.equal(new Set(intake.candidates.map(row => row.address)).size, 15);
  assert.ok(intake.candidates.some(row => row.id === expectedEydeId), 'Eyde/Birkeland must use the canonical bolteloekka slug');
  assert.ok(new Set(intake.candidates.map(row => row.category)).size >= 8, 'batch must stay cross-category');
});

test('phase 2 contains no duplicate of the 12-place blue-sign baseline and no new Stolperstein batch', () => {
  for (const candidate of intake.candidates) {
    assert.equal(EXISTING_BASELINE.has(candidate.id), false, candidate.id);
    assert.doesNotMatch(candidate.id, /snublestein/i);
  }
  assert.equal(intake.candidates.some(row => row.group === 'snublestein'), false);
});

test('all 15 new plaques materialize as separate canonical Micro Places with verified address markers', () => {
  for (const candidate of intake.candidates) {
    const rel = placePath(candidate);
    assert.equal(exists(rel), true, rel);
    const place = read(rel);
    assert.equal(place.id, candidate.id);
    assert.equal(place.name, candidate.name);
    assert.equal(place.category, candidate.category);
    assert.equal(place.subcategory_id, 'bla_skilt');
    assert.equal(place.placeTier, 'micro');
    assert.equal(place.r, 35);
    assert.equal(place.micro_place_profile?.schema, 'history_go_micro_place_profile_v1');
    assert.equal(place.micro_place_profile?.kind, 'minneskilt');
    assert.equal(place.micro_place_profile?.currentStatus, 'active');
    assert.equal(place.micro_place_profile?.quizMode, 'none');
    assert.equal(place.coordStatus, 'verified');
    assert.equal(place.coordType, 'address_point');
    assert.match(String(place.coordSource || ''), /Geonorge/i);
    assert.match(String(place.coordSourceId || ''), /^geonorge-adresser-v1:0301:/);
    assert.ok(Number.isFinite(place.lat));
    assert.ok(Number.isFinite(place.lon));
    assert.ok(place.address?.street);
    assert.ok(place.address?.number);
    assert.ok(place.externalLinks?.some(link => /oslobyesvel\.no/i.test(link?.url || '')));
    assert.ok(manifest.files.includes(`places/${candidate.category}/oslo/bla_skilt/${candidate.id}.json`), `${candidate.id} missing from manifest`);
  }
});

test('all five legacy 2026 blue plaques are migrated to Micro Place without changing canonical IDs', () => {
  for (const entry of intake.legacyMigrations) {
    const place = read(entry.path);
    assert.equal(place.id, entry.id);
    assert.equal(place.placeTier, 'micro');
    assert.equal(place.subcategory_id, 'bla_skilt');
    assert.equal(place.micro_place_profile?.schema, 'history_go_micro_place_profile_v1');
    assert.equal(place.micro_place_profile?.kind, 'minneskilt');
    assert.equal(place.micro_place_profile?.quizMode, 'none');
    assert.ok(place.popupDesc, `${entry.id} must retain historical long-form copy`);
  }
});

test('plaque photos are governed and fail closed at the data layer', () => {
  let governed = 0;
  for (const candidate of intake.candidates) {
    const place = read(placePath(candidate));
    const mediaFields = [place.image, place.imageCredit, place.imageLicense, place.imageSourceUrl];
    const hasAny = mediaFields.some(Boolean);
    const hasAll = mediaFields.every(Boolean);
    assert.equal(hasAny, hasAll, `${candidate.id} has partial media provenance`);
    if (!hasAll) continue;
    governed += 1;
    assert.match(place.imageSourceUrl, /^https:\/\/commons\.wikimedia\.org\//);
    assert.match(place.imageLicense, /^CC BY-SA 4\.0$/);
    assert.ok(place.imageCredit.includes('Wikimedia Commons'));
  }
  assert.equal(governed, 2);
});

test('every new plaque has a ready v4.2 production packet with four verified claims and no full-place quiz requirement', () => {
  for (const candidate of intake.candidates) {
    const rel = packetPath(candidate);
    assert.equal(exists(rel), true, rel);
    const packet = read(rel);
    assert.equal(packet.placeId, candidate.id);
    assert.equal(packet.status, 'ready_v4_2');
    assert.equal(packet.identity?.status, 'resolved');
    assert.equal(packet.claims?.length, 4);
    assert.ok(packet.claims.every(claim => claim.status === 'verified'));
    assert.equal(packet.sentenceCoverage?.desc?.length, 3);
    assert.equal(packet.sentenceCoverage?.popupDesc?.length, 4);
    assert.deepEqual(packet.quizReadiness?.questions, []);
    assert.equal(packet.completion?.factualReview, 'passed');
    assert.equal(packet.completion?.editorialReview, 'passed');
  }
});

test('phase 2 materialization report locks counts and separate marker identity', () => {
  const report = read('reports/oslo-blue-signs-phase2-2026/materialized.json');
  assert.equal(report.counts?.new, 15);
  assert.equal(report.counts?.migrated, 5);
  assert.equal(report.counts?.governedPlaqueImages, 2);
  assert.equal(report.noNewStolpersteinBatch, true);
  assert.equal(new Set(report.materialized.map(row => row.id)).size, 15);
  assert.equal(new Set(report.materialized.map(row => row.sourceObjectId)).size, 15);
});
