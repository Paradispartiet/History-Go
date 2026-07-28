import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { validatePeopleClaimsDocument } from '../tools/audit-people-profile-canonical.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERIFIED_AT = '2026-07-28';
const TARGETS = [
  'andrea_braein_hovig',
  'bjorn_skagestad',
  'bjorn_saether',
  'carl_fredrik_engelstad',
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

test('batch 7 profiles satisfy People Profile Canonical v1', () => {
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
  const banned = /History GO-anker|Nationaltheatret-anker|primæranker|binder stedet|stor betydning|grunnleggende|presist anker|institusjonell modernisering/i;
  for (const id of TARGETS) {
    const profile = readProfile(id);
    assert.doesNotMatch(`${profile.desc}\n${profile.popupDesc}`, banned);
  }
});

test('Bjørn Sæter has corrected canonical identity and year', () => {
  const profile = readProfile('bjorn_saether');
  const claims = readJson(claimsPath('bjorn_saether'));

  assert.equal(profile.name, 'Bjørn Sæter');
  assert.equal(profile.year, 1982);
  assert.equal(claims.identity.canonical_identity.includes('Bjørn Sæter'), true);
  assert.deepEqual(claims.identity.name_variants, ['Bjørn Sæter', 'Bjørn Sæther']);
  assert.match(profile.popupDesc, /alternativ navneform/);
  assert.doesNotMatch(profile.popupDesc, /bydelsscene fra 1977/);
});

test('personal background is explicit, relevant and claim-mapped', () => {
  const andrea = readProfile('andrea_braein_hovig');
  const skagestad = readProfile('bjorn_skagestad');
  const engelstad = readProfile('carl_fredrik_engelstad');

  assert.match(andrea.popupDesc, /barnebarn av komponisten Edvard Fliflet Bræin og arkitekten Jan Inge Hovig/);
  assert.match(skagestad.popupDesc, /sønn av teatersjef og dramatiker Tormod Skagestad og maler Karin Anna Jalm/);
  assert.match(engelstad.popupDesc, /Faren døde da Engelstad var ett år/);
  assert.match(engelstad.popupDesc, /ektefellen Vibeke Engelstad arbeidet som lege/);
});

test('Wikipedia is further reading and not the only source', () => {
  for (const id of TARGETS) {
    const profile = readProfile(id);
    const wikipedia = profile.externalLinks.filter((entry) => entry.type === 'further_reading');
    const sources = profile.externalLinks.filter((entry) => entry.type === 'source');

    assert.equal(wikipedia.length, 1, id);
    assert.match(wikipedia[0].label, /^Wikipedia – /);
    assert.match(wikipedia[0].url, /^https:\/\/no\.wikipedia\.org\/wiki\//);
    assert.ok(sources.length >= 2, id);
  }
});

test('profiles publish direct, dated contributions without count padding', () => {
  const expectedWorks = {
    andrea_braein_hovig: ['salome_2002_hovig', 'reisen_til_julestjernen_2004_hovig', 'hedda_gabler_2010_hovig', 'cyrano_2018_hovig'],
    bjorn_skagestad: ['gengangere_1988_skagestad', 'et_dukkehjem_1990_skagestad', 'faust_1999_skagestad', 'galileo_2010_skagestad'],
    bjorn_saether: ['promp_og_prakt_1982_saeter', 'trafford_tanzi_1985_saeter', 'american_buffalo_1986_saeter', 'en_mann_en_mann_1986_saeter'],
    carl_fredrik_engelstad: ['besok_av_en_gammel_dame_1957_engelstad', 'i_syden_1958_engelstad', 'nationaltheatret_1960_1961_engelstad', 'den_fjerde_nattevakt_1956_engelstad'],
  };

  for (const [id, workIds] of Object.entries(expectedWorks)) {
    assert.deepEqual(readProfile(id).works.map((work) => work.id), workIds);
  }
});

test('batch 7 audit records scope, identity correction and privacy discipline', () => {
  const report = fs.readFileSync(
    path.join(ROOT, 'reports/people-factuality-audit-nationaltheatret-batch-7-v1.md'),
    'utf8',
  );

  assert.match(report, /Ingen Places-, coordinate-, quiz- eller fagfiler skal endres/);
  assert.match(report, /Bjørn Sæter/);
  assert.match(report, /Profil-ID-en `bjorn_saether` beholdes/);
  assert.match(report, /Privat samlivsstatus er ikke publisert/);
  assert.match(report, /Wikipedia bare som `further_reading`/);
});
