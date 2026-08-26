import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  auditPolitikkPlaceProduction,
  requiredReportsForChanges,
  validatePolitikkPlaceReport
} from '../scripts/audit-politikk-place-production.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const place = {
  id: 'test_tinghus',
  category: 'politikk',
  emne_ids: ['em_pol_lokaldemokrati']
};

function documented(statement) {
  return { status: 'documented', statement, sourceIds: ['source_archive'] };
}

function notApplicable(rationale) {
  return { status: 'not_applicable', rationale };
}

function validReport() {
  return {
    schemaVersion: 'politikk_place_production_v1',
    validatorVersion: '1.0.0',
    placeId: 'test_tinghus',
    placeFile: 'data/places/politikk/test/test_tinghus.json',
    status: 'ready',
    primaryFunction: {
      statement: 'Tinghuset var den dokumenterte lokale beslutningsarenaen.',
      placeObjectDistinction: 'Rapporten skiller institusjonen fra bygningen og den historiske funksjonen.',
      sourceIds: ['source_archive']
    },
    politicsTopics: [
      {
        emneId: 'em_pol_lokaldemokrati',
        siteSpecificRationale: 'Kilden dokumenterer lokale beslutninger som faktisk ble tatt i tinghuset.',
        evidenceChainIds: ['chain_local_rule']
      }
    ],
    sources: [
      {
        id: 'source_archive',
        url: 'https://example.org/archive/item-1',
        sourceLocation: 'protokoll 4, side 12',
        sourceType: 'archive',
        verifiedAt: '2026-07-31',
        temporalStatus: 'historical'
      }
    ],
    evidenceChains: [
      {
        id: 'chain_local_rule',
        claim: 'Den lokale institusjonen brukte tinghuset som dokumentert beslutningsarena.',
        stages: {
          institutionActor: documented('Kommunestyret er navngitt som institusjonell aktør.'),
          competenceRole: documented('Protokollen dokumenterer organets formelle beslutningsrolle.'),
          ruleDecision: documented('Det konkrete vedtaket står i den daterte møteprotokollen.'),
          resourceInstrument: notApplicable('Påstanden gjelder beslutningsarenaen, ikke ressursbruk.'),
          implementation: notApplicable('Påstanden hevder ikke at vedtaket ble gjennomført.'),
          output: documented('Den vedtatte protokollteksten er det dokumenterte outputet.'),
          outcomeEffect: notApplicable('Rapporten fremsetter ingen påstand om outcome eller effekt.')
        }
      }
    ],
    currentVerification: {
      status: 'N/A',
      rationale: 'Rapporten inneholder bare historiske funksjons- og beslutningspåstander.'
    },
    quizOpening: {
      status: 'N/A',
      rationale: 'Ingen stedquiz produseres eller revideres i denne rapporten.'
    },
    chronologyStories: {
      status: 'N/A',
      chronologyReviewed: true,
      storiesReviewed: true,
      rationale: 'Materialet krever verken ny chronology-post eller selvstendig Story.'
    },
    gates: {
      A: { status: 'PASS', evidenceRefs: ['primaryFunction'] },
      B: { status: 'PASS', evidenceRefs: ['politicsTopics[0]'] },
      C: { status: 'PASS', evidenceRefs: ['chain_local_rule'] },
      D: { status: 'PASS', evidenceRefs: ['source_archive', 'currentVerification'] },
      E: { status: 'PASS', evidenceRefs: ['chain_local_rule.stages'] },
      F: { status: 'N/A', rationale: 'Ingen stedquiz produseres eller revideres i denne rapporten.' },
      G: { status: 'N/A', rationale: 'Ingen chronology eller Story produseres eller revideres.' }
    },
    review: {
      reviewer: 'test-reviewer',
      reviewedAt: '2026-07-31',
      notes: 'Kjede, kilder og inferensgrenser er kontrollert.'
    }
  };
}

function validate(report) {
  return validatePolitikkPlaceReport({
    report,
    place,
    canonicalEmneIds: new Set(['em_pol_lokaldemokrati']),
    root,
    now: new Date('2026-08-01T12:00:00Z')
  });
}

test('en komplett Politikk-produksjonsrapport består A–G-kontrakten', () => {
  assert.deepEqual(validate(validReport()), []);
});

test('ready-rapport blokkeres når evidenskjeden har et manglende ledd', () => {
  const report = validReport();
  report.evidenceChains[0].stages.implementation = {
    status: 'missing',
    rationale: 'Gjennomføringen er ikke dokumentert i de gjennomgåtte kildene.'
  };
  assert.ok(validate(report).some((error) => error.includes('kan ikke være missing')));
});

test('A–E kan ikke settes N/A for et ferdig Politikk-sted', () => {
  const report = validReport();
  report.gates.C = { status: 'N/A', rationale: 'Kjeden ble ikke undersøkt i denne rapporten.' };
  assert.ok(validate(report).some((error) => error.includes('gate C må være PASS')));
});

test('schemaets additionalProperties-grense håndheves av validatoren', () => {
  const report = validReport();
  report.primaryFunction.assumption = 'Dette feltet finnes ikke i kontrakten.';
  assert.ok(validate(report).some((error) => error.includes('primaryFunction har ukjent felt')));
});

test('rapportens emner må dekke place-filens canonicale em_pol_* nøyaktig', () => {
  const report = validReport();
  report.politicsTopics = [];
  assert.ok(validate(report).some((error) => error.includes('må dekke nøyaktig')));
});

test('changed-mode krever rapport ved brukerrettet Politikk-stedsendring, men ikke koordinat alene', (t) => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'politikk-place-gate-'));
  t.after(() => fs.rmSync(fixtureRoot, { recursive: true, force: true }));
  const placePath = 'data/places/politikk/test_tinghus.json';
  fs.mkdirSync(path.join(fixtureRoot, 'data/places/politikk'), { recursive: true });
  fs.writeFileSync(path.join(fixtureRoot, 'data/places/manifest.json'), JSON.stringify({ files: ['places/politikk/test_tinghus.json'] }));
  const original = { ...place, desc: 'Opprinnelig brukerrettet tekst.', lat: 59.9, lon: 10.7 };
  fs.writeFileSync(path.join(fixtureRoot, placePath), JSON.stringify(original));
  execFileSync('git', ['init', '-q'], { cwd: fixtureRoot });
  execFileSync('git', ['config', 'user.email', 'test@history-go.invalid'], { cwd: fixtureRoot });
  execFileSync('git', ['config', 'user.name', 'History GO test'], { cwd: fixtureRoot });
  execFileSync('git', ['add', '.'], { cwd: fixtureRoot });
  execFileSync('git', ['commit', '-qm', 'fixture base'], { cwd: fixtureRoot });
  const base = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: fixtureRoot, encoding: 'utf8' }).trim();

  fs.writeFileSync(path.join(fixtureRoot, placePath), JSON.stringify({ ...original, desc: 'Revidert brukerrettet Politikk-tekst.' }));
  assert.equal(requiredReportsForChanges(fixtureRoot, [placePath], base).size, 1);

  fs.writeFileSync(path.join(fixtureRoot, placePath), JSON.stringify({ ...original, lat: 59.91 }));
  assert.equal(requiredReportsForChanges(fixtureRoot, [placePath], base).size, 0);

  const micro = {
    ...original,
    desc: 'Kort, kildebelagt Micro Place-tekst.',
    placeTier: 'micro',
    micro_place_profile: { schema: 'history_go_micro_place_profile_v1', kind: 'minneskilt', quizMode: 'none' }
  };
  fs.writeFileSync(path.join(fixtureRoot, placePath), JSON.stringify(micro));
  fs.mkdirSync(path.join(fixtureRoot, 'data/places/production'), { recursive: true });
  const packetPath = path.join(fixtureRoot, 'data/places/production/test_tinghus.json');
  const packet = {
    schemaVersion: '4.2',
    validatorVersion: '4.2.1',
    placeId: 'test_tinghus',
    placeFile: placePath,
    status: 'ready_v4_2',
    claims: [{ id: 'claim_identity' }],
    sentenceCoverage: { desc: [{ sentence: 1, claimIds: ['claim_identity'] }] },
    reviews: {
      factual: { status: 'passed', reviewer: 'independent source audit' },
      editorial: { status: 'passed', reviewer: 'independent editorial audit' }
    },
    completion: { factualReview: 'passed', editorialReview: 'passed' }
  };
  fs.writeFileSync(packetPath, JSON.stringify(packet));
  assert.equal(requiredReportsForChanges(fixtureRoot, [placePath], base).size, 0, 'approved Micro Places use the reduced contract');

  packet.reviews.factual.reviewer = 'materializer';
  fs.writeFileSync(packetPath, JSON.stringify(packet));
  assert.equal(requiredReportsForChanges(fixtureRoot, [placePath], base).size, 1, 'self-approved Micro packets remain blocked');
});

test('all-mode kan kjøres permanent selv før første produksjonsrapport er lagt inn', () => {
  const result = auditPolitikkPlaceProduction({ root, mode: 'all' });
  assert.equal(result.status, 'passed');
  assert.equal(result.summary.failures, 0);
});
