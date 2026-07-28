import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { validatePeopleClaimsDocument } from '../tools/audit-people-profile-canonical.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERIFIED_AT = '2026-07-28';
const TARGETS = [
  'axel_otto_normann',
  'bab_christensen',
  'bente_borsum',
  'bjarte_hjelmeland',
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

test('batch 6 is the first ready People Profile v1 pilot', () => {
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
    assert.equal(claims.completion.source_verified_at, VERIFIED_AT);

    const errors = validatePeopleClaimsDocument(claims, profile, {
      now: new Date('2026-07-28T12:00:00Z'),
      claimsPath: claimsPath(id),
    });
    assert.deepEqual(errors, [], `${id}: ${errors.join('; ')}`);
  }
});

test('pilot profiles remove internal anchor language and unsupported evaluation', () => {
  const banned = /History GO-anker|sterkt Nationaltheatret-anker|tydelig Nationaltheatret-anker|binder stedet|offentlig legitimitet|gjennombruddet|lang moderne ensemblelinje/i;
  for (const id of TARGETS) {
    const profile = readProfile(id);
    assert.doesNotMatch(`${profile.desc}
${profile.popupDesc}`, banned);
  }
});

test('education contains only documented training and has no fullness minimum', () => {
  const expected = {
    axel_otto_normann: ['Filologistudier ved universitetet i Kristiania uten avsluttende eksamen'],
    bab_christensen: ['Elev ved Nationaltheatret i 1947'],
    bente_borsum: ['Skuespillerlinjen ved Statens Teaterhøgskole, 1958'],
    bjarte_hjelmeland: ['Statens Teaterhøgskole, 1988–1991'],
  };
  for (const id of TARGETS) {
    assert.deepEqual(readProfile(id).education, expected[id]);
  }
});

test('Bente Børsum preserves the 1958/1959 source conflict explicitly', () => {
  const profile = readProfile('bente_borsum');
  const claims = readJson(claimsPath('bente_borsum'));
  const conflict = claims.claims.find((claim) => claim.id === 'early_roles_year_conflict');

  assert.equal(conflict.status, 'source_conflict');
  assert.equal(conflict.publication_decision, 'prefer_primary_source');
  assert.equal(conflict.sources.length, 2);
  assert.match(profile.popupDesc, /Sceneweb daterer.*desember 1958.*Store norske leksikon.*1959/s);

  const tornerose = profile.works.find((work) => work.id === 'tornerose_1958_borsum');
  assert.equal(tornerose.year, 1958);
  assert.match(tornerose.summary, /26\. desember 1958/);
  assert.match(tornerose.summary, /debut som skuespiller/);
});

test('the four profiles publish only the selected direct contributions', () => {
  const axel = readProfile('axel_otto_normann');
  assert.deepEqual(axel.works.map((work) => work.year), ['1935–1941', '1945–1946']);

  const bab = readProfile('bab_christensen');
  assert.deepEqual(bab.works.map((work) => work.id), [
    'ung_rett_1947_christensen',
    'reisen_til_julestjernen_1947_christensen',
    'sosken_1952_christensen',
  ]);

  const bente = readProfile('bente_borsum');
  assert.deepEqual(bente.works.map((work) => work.id), [
    'finn_veien_engel_1958_borsum',
    'tornerose_1958_borsum',
    'don_juan_2017_borsum',
  ]);

  const bjarte = readProfile('bjarte_hjelmeland');
  assert.deepEqual(bjarte.works.map((work) => work.id), [
    'haermennene_1991_hjelmeland',
    'jeppe_2003_hjelmeland',
    'ungen_2014_hjelmeland',
  ]);
});


test('Bjarte Hjelmeland includes public personal context and Wikipedia further reading', () => {
  const profile = readProfile('bjarte_hjelmeland');
  assert.match(profile.popupDesc, /vokste opp i Sund på Sotra/);
  assert.match(profile.popupDesc, /homofil.*kristen tro/s);
  assert.match(profile.popupDesc, /forlovet med Lars-Erik Syversen/);
  assert.ok(profile.externalLinks.some((link) => link.label === 'Wikipedia – Bjarte Hjelmeland'));
});

test('batch 6 audit records scope, conflict and no-padding rule', () => {
  const report = fs.readFileSync(
    path.join(ROOT, 'reports/people-factuality-audit-nationaltheatret-batch-6-v1.md'),
    'utf8',
  );
  assert.match(report, /første profilpiloten under `docs\/PEOPLE_PROFILE_CANONICAL\.md`/);
  assert.match(report, /Ingen Places-, coordinate-, quiz- eller fagfiler skal endres/);
  assert.match(report, /early_roles_year_conflict/);
  assert.match(report, /prefer_primary_source/);
  assert.match(report, /Ingen profil er utvidet bare for å oppnå visuell fylde eller readiness-poeng/);
});
