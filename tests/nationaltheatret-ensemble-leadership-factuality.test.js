import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.join(import.meta.dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
const readPerson = (filename, expectedId) => {
  const records = readJson(`data/people/litteratur/oslo/nationaltheatret/${filename}`);
  assert.equal(records.length, 1);
  assert.equal(records[0].id, expectedId);
  return records[0];
};
const workById = (person, id) => person.works.find((work) => work.id === id);

const reportPath = 'reports/people-factuality/nationaltheatret-ensemble-leadership-2026-07-27.json';

test('Anne Marit Jacobsen venue links follow the audited production records', () => {
  const person = readPerson('anne_marit_jacobsen.json', 'anne_marit_jacobsen');
  const centralteatretWork = workById(person, 'jacobsen_vaersagod_2018_jacobsen');
  const mainStageWork = workById(person, 'saa_inn_i_norden_1984_jacobsen');
  const lilli = workById(person, 'lilli_valentin_1989_jacobsen');

  assert.equal(centralteatretWork.place, 'Centralteatret');
  assert.match(centralteatretWork.summary, /urpremiere på Centralteatret/);
  assert.equal(mainStageWork.place, 'Oslo Nye Teater – Hovedscenen');
  assert.match(mainStageWork.summary, /flere roller/);
  assert.ok(person.places.includes('centralteatret'));
  assert.ok(person.places.includes('oslo_nye_teater_hovedscenen'));
  assert.match(lilli.summary, /omkring 300/);
  assert.doesNotMatch(lilli.summary, /over 300/);
  assert.ok(person.source_urls.includes('https://sceneweb.no/nb/production/22246/S%C3%A5_inn%20i%20Norden'));
});

test('Anneke von der Lippe conflict resolution keeps the direct-production role', () => {
  const person = readPerson('anneke_von_der_lippe.json', 'anneke_von_der_lippe');
  const uskyld = workById(person, 'uskyld_2011_von_der_lippe');
  assert.equal(uskyld.summary, 'Spilte Ella i Dea Lohers drama.');
  assert.doesNotMatch(JSON.stringify(uskyld), /Professoren/);
});

test('Anton Rønnebergs checked life data and institution periods remain stable', () => {
  const person = readPerson('anton_ronneberg.json', 'anton_ronneberg');
  assert.equal(person.birth_date, '1902-08-09');
  assert.equal(person.death_date, '1989-05-07');
  assert.match(workById(person, 'dramaturg_nationaltheatret_1930_ronneberg').summary, /1930–1933, 1934–1937 og 1945–1972/);
  assert.match(workById(person, 'teatersjef_nationaltheatret_1933_ronneberg').summary, /1933–1934/);
});

test('Arild Brinchmann production wording does not add unsupported contributions', () => {
  const person = readPerson('arild_brinchmann.json', 'arild_brinchmann');
  const natten = workById(person, 'natten_er_dagens_mor_1984_brinchmann');
  const hedda = workById(person, 'hedda_gabler_1971_brinchmann');
  const balansegang = workById(person, 'balansegang_1967_brinchmann');

  assert.equal(natten.material, 'sceneregi');
  assert.equal(natten.summary, 'Regisserte Lars Noréns drama på Nationaltheatrets Amfiscene.');
  assert.doesNotMatch(JSON.stringify(natten), /bearbeid/i);
  assert.match(hedda.summary, /filmet og sendt av NRK Fjernsynsteatret i 1975/);
  assert.doesNotMatch(hedda.summary, /omarbeidet/);
  assert.match(balansegang.summary, /første i hans sjefstid/);
});

test('retrospective report states scope, corrections, conflicts and limits honestly', () => {
  const report = readJson(reportPath);
  assert.equal(report.schemaVersion, 1);
  assert.equal(report.auditType, 'retrospective_claim_by_claim_factuality_audit');
  assert.equal(report.contract, 'docs/FACTUALITY_CONTRACT.md');
  assert.deepEqual(report.scope.profileIds, [
    'anne_marit_jacobsen',
    'anneke_von_der_lippe',
    'anton_ronneberg',
    'arild_brinchmann',
  ]);
  assert.equal(report.conclusion.auditedProfiles, 4);
  assert.equal(report.conclusion.profilesCorrected, 2);
  assert.equal(report.conclusion.sourceConflictsResolved, 1);
  assert.equal(report.conclusion.wholeAppVerified, false);
  assert.match(report.conclusion.note, /not evidence that every History GO object is factually audited/i);

  const statuses = Object.fromEntries(report.profiles.map((profile) => [profile.id, profile.status]));
  assert.equal(statuses.anne_marit_jacobsen, 'corrected');
  assert.equal(statuses.anneke_von_der_lippe, 'resolved_source_conflict');
  assert.equal(statuses.anton_ronneberg, 'verified');
  assert.equal(statuses.arild_brinchmann, 'corrected');
});
