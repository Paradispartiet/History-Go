import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import {
  STANDARD_VERSION,
  VALIDATOR_VERSION,
  auditRepository,
  validatePeopleClaimsDocument,
} from '../tools/audit-people-profile-canonical.mjs';

const root = path.join(import.meta.dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const readJson = (relativePath) => JSON.parse(read(relativePath));

function claim(id, text, overrides = {}) {
  return {
    id,
    claim: text,
    status: 'verified',
    source_url: `https://example.org/${id}`,
    source_location: `avsnitt ${id}`,
    source_type: 'institutional',
    temporal_status: 'historical',
    verified_at: '2026-07-27',
    evidence_level: 'direct',
    ...overrides,
  };
}

function fixture() {
  const claimsPath = 'data/people/claims/litteratur/oslo/test_person.claims.json';
  const profile = {
    id: 'test_person',
    name: 'Test Person',
    kindLabel: 'Skuespiller',
    birth_date: '1900-01-01',
    placeId: 'test_teater',
    places: ['test_teater'],
    education: [],
    works: [
      {
        id: 'test_role',
        title: 'Testrollen',
        year: 1930,
        material: 'skuespillerarbeid',
        place: 'Testteatret',
        summary: 'Spilte tittelrollen.',
      },
    ],
    desc: 'Test Person ble født i 1900.',
    popupDesc: 'Test Person ble født i 1900. Personen spilte tittelrollen i 1930.',
    profileStandard: STANDARD_VERSION,
    profileStatus: 'ready_people_v1',
    claimsFile: claimsPath,
  };

  const claims = [
    claim('name', 'Personens navn var Test Person.'),
    claim('role', 'Personen var skuespiller.'),
    claim('birth_date', 'Personen ble født 1. januar 1900.'),
    claim('place', 'Personen var knyttet til Testteatret.'),
    claim('work_title', 'Produksjonen het Testrollen.'),
    claim('work_year', 'Produksjonen hadde premiere i 1930.'),
    claim('work_material', 'Personen medvirket som skuespiller.'),
    claim('work_place', 'Produksjonen ble spilt ved Testteatret.'),
    claim('work_summary', 'Personen spilte tittelrollen.'),
  ];

  const document = {
    schema: 'history_go_people_claims_v1',
    version: '1.0.0',
    person_id: 'test_person',
    profile_file: 'data/people/litteratur/oslo/test_person.json',
    identity: {
      canonical_identity: 'Skuespilleren Test Person, født 1. januar 1900.',
      name_variants: ['Test Person'],
      not: ['rollefigurer'],
      identity_status: 'verified',
    },
    claims,
    field_claim_map: {
      name: ['name'],
      kindLabel: ['role'],
      birth_date: ['birth_date'],
      placeId: ['place'],
      'places[test_teater]': ['place'],
      'works[id=test_role].title': ['work_title'],
      'works[id=test_role].year': ['work_year'],
      'works[id=test_role].material': ['work_material'],
      'works[id=test_role].place': ['work_place'],
      'works[id=test_role].summary': ['work_summary'],
    },
    sentence_claim_map: {
      desc: [
        { sentence: 1, claim_ids: ['name', 'birth_date'] },
      ],
      popupDesc: [
        { sentence: 1, claim_ids: ['name', 'birth_date'] },
        { sentence: 2, claim_ids: ['work_summary', 'work_year'] },
      ],
    },
    completion: {
      completed_under: STANDARD_VERSION,
      claims_verified: `${claims.length}/${claims.length}`,
      fact_review: 'passed',
      editorial_review: 'passed',
      source_verified_at: '2026-07-27',
      validator_version: VALIDATOR_VERSION,
      current_status: 'ready_people_v1',
    },
  };

  return { profile, document, claimsPath };
}

test('canonical People production files are registered and machine-readable', () => {
  const docs = read('docs/PEOPLE_PROFILE_CANONICAL.md');
  const templates = readJson('data/people/regler/people_profile_templates_v1.json');
  const schema = readJson('data/people/regler/people_claims_schema_v1.json');
  const registry = readJson('docs/documentation_registry.json');
  const packageJson = readJson('package.json');

  assert.match(docs, /Status: \*\*canonical og bindende\*\*/);
  assert.match(docs, /Obligatorisk påstandsregister/);
  assert.match(docs, /Setning–claim-paritet/);
  assert.match(docs, /Tom `education` er en gyldig/);
  assert.match(docs, /Ingen faste fyldekrav/);
  assert.match(docs, /Faktareview/);
  assert.match(docs, /Redaksjonell review/);
  assert.match(docs, /legacy_unreviewed/);

  assert.equal(templates.version, '1.0.0');
  assert.equal(templates.fieldSemantics.education.allowEmpty, true);
  assert.equal(templates.readinessPolicy.countBasedRewardsForbidden, true);
  assert.equal(schema.properties.schema.const, 'history_go_people_claims_v1');

  assert.ok(registry.priority_order.includes('docs/PEOPLE_PROFILE_CANONICAL.md'));
  const entry = registry.documents.find((item) => item.path === 'docs/PEOPLE_PROFILE_CANONICAL.md');
  assert.ok(entry);
  assert.equal(entry.status, 'canonical');
  assert.ok(entry.owns.includes('person_profile_production_contract'));

  assert.equal(
    packageJson.scripts['audit:people-profile-canonical'],
    'node tools/audit-people-profile-canonical.mjs',
  );
  assert.equal(
    packageJson.scripts['test:people-profile-canonical'],
    'node --test tests/people-profile-canonical.test.mjs',
  );
});

test('a complete claim-mapped profile may have empty education and one work', () => {
  const { profile, document, claimsPath } = fixture();
  assert.deepEqual(
    validatePeopleClaimsDocument(document, profile, {
      claimsPath,
      now: new Date('2026-07-27T12:00:00Z'),
    }),
    [],
  );
});

test('strong claims require an explicit evidence claim', () => {
  const { profile, document, claimsPath } = fixture();
  profile.popupDesc = 'Test Person var en ledende skuespiller. Personen spilte tittelrollen i 1930.';
  document.sentence_claim_map.popupDesc[0] = { sentence: 1, claim_ids: ['role'] };
  const errors = validatePeopleClaimsDocument(document, profile, {
    claimsPath,
    now: new Date('2026-07-27T12:00:00Z'),
  });
  assert.ok(errors.some((error) => /sterk påstand/.test(error)));
});

test('current claims expire according to their freshness window', () => {
  const { profile, document, claimsPath } = fixture();
  profile.popupDesc = 'Test Person er ansatt ved Testteatret. Personen spilte tittelrollen i 1930.';
  document.claims.push(claim('current_employment', 'Personen er ansatt ved Testteatret.', {
    temporal_status: 'current',
    verified_at: '2025-01-01',
    freshness_required_days: 180,
  }));
  document.sentence_claim_map.popupDesc[0] = { sentence: 1, claim_ids: ['current_employment'] };
  document.completion.claims_verified = `${document.claims.length}/${document.claims.length}`;
  const errors = validatePeopleClaimsDocument(document, profile, {
    claimsPath,
    now: new Date('2026-07-27T12:00:00Z'),
  });
  assert.ok(errors.some((error) => /foreldet/.test(error)));
});

test('ready profiles require complete sentence and field mappings', () => {
  const { profile, document, claimsPath } = fixture();
  delete document.field_claim_map['works[id=test_role].summary'];
  document.sentence_claim_map.popupDesc.pop();
  const errors = validatePeopleClaimsDocument(document, profile, {
    claimsPath,
    now: new Date('2026-07-27T12:00:00Z'),
  });
  assert.ok(errors.some((error) => /publisert felt mangler claim-mapping/.test(error)));
  assert.ok(errors.some((error) => /setninger, men/.test(error)));
});

test('readiness no longer rewards field counts or treats missing education as an error', () => {
  const source = read('tools/audit-people-popup-readiness.mts');
  assert.doesNotMatch(source, /function educationScore/);
  assert.doesNotMatch(source, /function contributionScore/);
  assert.doesNotMatch(source, /function practiceScore/);
  assert.doesNotMatch(source, /function sourceScore/);
  assert.doesNotMatch(source, /missing_education_or_training/);
  assert.doesNotMatch(source, /thin_practice_profile/);
  assert.match(source, /legacy_unreviewed/);
  assert.match(source, /profileStatus/);
});

test('repository audit validates the canonical framework without requiring pilot claims yet', () => {
  const result = auditRepository(root, { now: new Date('2026-07-27T12:00:00Z') });
  assert.deepEqual(result.errors, []);
});
