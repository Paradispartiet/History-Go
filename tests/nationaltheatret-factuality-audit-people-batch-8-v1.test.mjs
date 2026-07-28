import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { validatePeopleClaimsDocument } from '../tools/audit-people-profile-canonical.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERIFIED_AT = '2026-07-28';
const TARGETS = ['charles_marowitz', 'david_knudsen', 'edith_roger', 'einar_skavlan'];

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

test('batch 8 profiles satisfy People Profile Canonical v1', () => {
  for (const id of TARGETS) {
    const profile = readProfile(id);
    const claims = readJson(claimsPath(id));
    assert.equal(profile.id, id);
    assert.equal(profile.profileStandard, 'people_profile_v1.0');
    assert.equal(profile.profileStatus, 'ready_people_v1');
    assert.equal(profile.claimsFile, claimsPath(id));
    assert.equal(profile.verifiedAt, VERIFIED_AT);
    assert.equal(claims.completion.current_status, 'ready_people_v1');
    const errors = validatePeopleClaimsDocument(claims, profile, {
      now: new Date('2026-07-28T12:00:00Z'),
      claimsPath: claimsPath(id),
    });
    assert.deepEqual(errors, [], `${id}: ${errors.join('; ')}`);
  }
});

test('legacy anchor language and unsupported evaluation are removed', () => {
  const banned = /History GO-anker|Nationaltheatret-anker|Entryen|institusjonell vurderingsmakt|nasjonal scene, der|ledende instruktørkrefter/i;
  for (const id of TARGETS) {
    const profile = readProfile(id);
    assert.doesNotMatch(`${profile.desc}\n${profile.popupDesc}`, banned);
  }
});

test('Charles Marowitz birth-year conflict is explicit and blocks a birth date', () => {
  const profile = readProfile('charles_marowitz');
  const claims = readJson(claimsPath('charles_marowitz'));
  const conflict = claims.claims.find((claim) => claim.id === 'birth_year_conflict');
  assert.equal(Object.hasOwn(profile, 'birth_date'), false);
  assert.equal(conflict.status, 'source_conflict');
  assert.equal(conflict.publication_decision, 'publish_with_qualification');
  assert.deepEqual(conflict.sources.map((source) => source.value), [1934, 1932]);
  assert.match(profile.popupDesc, /Store norske leksikon oppgir 1934.*The Guardian oppgir 1932/s);
});

test('Einar Skavlan leadership conflict publishes only the secure start year', () => {
  const profile = readProfile('einar_skavlan');
  const claims = readJson(claimsPath('einar_skavlan'));
  const conflict = claims.claims.find((claim) => claim.id === 'nationaltheatret_period_conflict');
  assert.equal(profile.year, 1928);
  assert.equal(conflict.status, 'source_conflict');
  assert.equal(conflict.publication_decision, 'publish_with_qualification');
  assert.match(profile.popupDesc, /1928–1930.*1928–1929/s);
});

test('documented person background is distinct from career content', () => {
  assert.match(readProfile('charles_marowitz').popupDesc, /jiddischtalende innvandrerfamilie/);
  assert.match(readProfile('david_knudsen').popupDesc, /akademisk miljø/);
  assert.match(readProfile('edith_roger').popupDesc, /Faren drev bilverksted i Son/);
  assert.match(readProfile('einar_skavlan').popupDesc, /samlingspunkt for nasjonal og radikal venstrepolitikk/);
});

test('Wikipedia is further reading and never a source claim', () => {
  for (const id of TARGETS) {
    const profile = readProfile(id);
    const claims = readJson(claimsPath(id));
    const wikipedia = profile.externalLinks.filter((entry) => /wikipedia\.org/.test(entry.url));
    assert.equal(wikipedia.length, 1);
    assert.equal(wikipedia[0].type, 'further_reading');
    assert.equal(claims.claims.some((claim) => /wikipedia\.org/.test(claim.source_url || '')), false);
  }
});

test('selected contributions are concrete and source-mapped', () => {
  assert.deepEqual(readProfile('charles_marowitz').works.map((work) => work.id), [
    'en_folkefiende_1979_marowitz',
    'hedda_1978_marowitz',
    'like_for_like_1981_marowitz',
  ]);
  assert.deepEqual(readProfile('david_knudsen').works.map((work) => work.id), [
    'det_lykkelige_valg_1914_knudsen',
    'vildanden_1928_knudsen',
    'tante_ulrikke_1937_knudsen',
  ]);
  assert.equal(readProfile('edith_roger').works.length, 4);
  assert.deepEqual(readProfile('einar_skavlan').works.map((work) => work.id), [
    'nationaltheatret_skavlan_1928',
    'knut_hamsun_1929_skavlan',
    'gunnar_heiberg_1950_skavlan',
  ]);
});

test('batch 8 audit records scope and both source conflicts', () => {
  const report = fs.readFileSync(
    path.join(ROOT, 'reports/people-factuality-audit-nationaltheatret-batch-8-v1.md'),
    'utf8',
  );
  assert.match(report, /Ingen Places-, coordinate-, quiz- eller fagfiler skal endres/);
  assert.match(report, /birth_year_conflict/);
  assert.match(report, /nationaltheatret_period_conflict/);
  assert.match(report, /Wikipedia bare som `further_reading`/);
});
