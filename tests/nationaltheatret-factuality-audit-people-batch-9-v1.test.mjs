import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { validatePeopleClaimsDocument } from '../tools/audit-people-profile-canonical.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERIFIED_AT = '2026-07-28';
const TARGETS = [
  'eindride_eidsvold',
  'eirik_stubo',
  'ella_hval',
  'ellen_horn',
];

function profilePath(id) {
  return `data/people/litteratur/oslo/nationaltheatret/${id}.json`;
}

function claimsPath(id) {
  return `data/people/claims/litteratur/oslo/nationaltheatret/${id}.claims.json`;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function readProfile(id) {
  const data = readJson(profilePath(id));
  assert.equal(Array.isArray(data), true);
  assert.equal(data.length, 1);
  return data[0];
}

test('batch 9 profiles satisfy People Profile Canonical v1', () => {
  for (const id of TARGETS) {
    const profile = readProfile(id);
    const claims = readJson(claimsPath(id));

    assert.equal(profile.id, id);
    assert.equal(profile.profileStandard, 'people_profile_v1.0');
    assert.equal(profile.profileStatus, 'ready_people_v1');
    assert.equal(profile.claimsFile, claimsPath(id));
    assert.equal(profile.verifiedAt, VERIFIED_AT);
    assert.equal(claims.person_id, id);
    assert.equal(claims.completion.current_status, 'ready_people_v1');
    assert.equal(claims.completion.fact_review, 'passed');
    assert.equal(claims.completion.editorial_review, 'passed');

    const errors = validatePeopleClaimsDocument(claims, profile, {
      now: new Date('2026-07-28T12:00:00Z'),
      claimsPath: claimsPath(id),
    });
    assert.deepEqual(errors, [], `${id}: ${errors.join('; ')}`);
  }
});

test('legacy anchor language and unsupported evaluation are removed', () => {
  const banned = /History GO-anker|Nationaltheatret-anker|entryen|grunnleggende|sterkt Nationaltheatret|godt Nationaltheatret|binder Nationaltheatret|profilerte roller/i;
  for (const id of TARGETS) {
    const profile = readProfile(id);
    assert.doesNotMatch(`${profile.desc}\n${profile.popupDesc}`, banned);
  }
});

test('personal background is distinct from career content', () => {
  assert.match(readProfile('eindride_eidsvold').popupDesc, /broren Gard Eidsvold/);
  assert.match(readProfile('eirik_stubo').popupDesc, /sønn av jazzmusikeren Thorgeir Stubø/);
  assert.match(readProfile('ella_hval').popupDesc, /vokste opp på Torshov i en arbeiderfamilie/);
  assert.match(readProfile('ellen_horn').popupDesc, /født i Montréal.*vokste opp på Tjøme/s);
});

test('Ella Hval legacy year is corrected to 1940', () => {
  const profile = readProfile('ella_hval');
  assert.equal(profile.year, 1940);
  assert.match(profile.desc, /fra 1940 til 1974/);
  assert.doesNotMatch(profile.desc, /fra 1945/);
});

test('Nationaltheatret leadership periods are exact', () => {
  const stubo = readProfile('eirik_stubo');
  assert.equal(stubo.year, 2000);
  assert.match(stubo.popupDesc, /Nationaltheatret fra 2000 til 2008/);

  const horn = readProfile('ellen_horn');
  assert.equal(horn.year, 1988);
  assert.match(horn.popupDesc, /kollegiet som ledet Nationaltheatret fra 1988 til 1990/);
  assert.match(horn.popupDesc, /teatersjef fra 1992 til 2000/);
});

test('selected contributions are concrete and source-mapped', () => {
  assert.deepEqual(readProfile('eindride_eidsvold').works.map((work) => work.id), [
    'erasmus_montanus_1996_eidsvold',
    'vildanden_2004_eidsvold',
    'rosmersholm_2008_eidsvold',
  ]);
  assert.deepEqual(readProfile('eirik_stubo').works.map((work) => work.id), [
    'mens_vi_venter_pa_godot_1993_stubo',
    'vildanden_2004_stubo',
    'rosmersholm_2008_stubo',
  ]);
  assert.deepEqual(readProfile('ella_hval').works.map((work) => work.id), [
    'brand_1942_hval',
    'karusell_1950_hval',
    'agnes_1973_hval',
  ]);
  assert.deepEqual(readProfile('ellen_horn').works.map((work) => work.id), [
    'kirsebaerhaven_1988_horn',
    'dyrene_hakkebakkeskogen_1992_horn',
    'maria_q_1994_horn',
  ]);
});

test('Wikipedia is further reading and never a claim source', () => {
  for (const id of TARGETS) {
    const profile = readProfile(id);
    const claims = readJson(claimsPath(id));
    const wikipedia = profile.externalLinks.filter((link) => /wikipedia\.org/.test(link.url));
    assert.equal(wikipedia.length, 1);
    assert.equal(wikipedia[0].type, 'further_reading');
    assert.equal(claims.claims.some((claim) => /wikipedia\.org/.test(claim.source_url || '')), false);
  }
});

test('current claims carry freshness requirements', () => {
  const eindride = readJson(claimsPath('eindride_eidsvold')).claims.find((claim) => claim.id === 'nationaltheatret_current');
  assert.equal(eindride.temporal_status, 'current');
  assert.equal(eindride.freshness_required_days, 180);

  const ellenClaims = readJson(claimsPath('ellen_horn')).claims;
  for (const id of ['birth_profession', 'family']) {
    const claim = ellenClaims.find((entry) => entry.id === id);
    assert.equal(claim.temporal_status, 'current');
    assert.equal(typeof claim.freshness_required_days, 'number');
  }
});

test('batch 9 audit records scope and corrections', () => {
  const report = fs.readFileSync(
    path.join(ROOT, 'reports/people-factuality-audit-nationaltheatret-batch-9-v1.md'),
    'utf8',
  );
  assert.match(report, /Ingen Places-, coordinate-, quiz- eller fagfiler skal endres/);
  assert.match(report, /Legacyåret 1945 er rettet/);
  assert.match(report, /nationaltheatret_current/);
  assert.match(report, /Wikipedia bare som `further_reading`/);
  assert.match(report, /Ingen profil er fylt ut/);
});
