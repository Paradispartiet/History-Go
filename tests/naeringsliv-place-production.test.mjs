import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  auditNaeringslivPlaceProduction,
  requiredReportsForChanges,
  validateNaeringslivPlaceReport
} from '../scripts/audit-naeringsliv-place-production.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const emneId = 'em_naering_arbeid_verdiskaping';
const methodId = 'met_naering_arbeidslivsanalyse';
const place = {
  id: 'test_produksjonssted',
  category: 'naeringsliv',
  emne_ids: [emneId]
};

function statement(statementText, sourceIds = ['source_registry']) {
  return { statement: statementText, sourceIds };
}

function validReport() {
  return {
    schemaVersion: 'naeringsliv_place_production_v1',
    validatorVersion: '1.0.0',
    placeId: 'test_produksjonssted',
    placeFile: 'data/places/naeringsliv/test/test_produksjonssted.json',
    status: 'ready',
    economicIdentity: {
      statement: 'Stedet er et dokumentert produksjons- og arbeidssted for industrivirksomheten.',
      anchorType: 'factory',
      placeObjectDistinction: 'Rapporten skiller fabrikkbygningen, virksomheten, merkevaren og dagens bruk.',
      temporalScope: {
        start: '1952',
        end: '2026',
        precision: 'year',
        rationale: 'Startåret og dagens status følger register- og forskningskildene.'
      },
      sourceIds: ['source_registry', 'source_research']
    },
    businessTopics: [
      {
        emneId,
        siteSpecificRationale: 'Kildene dokumenterer arbeid, produksjon og verdiskaping ved dette stedet.',
        caseIds: ['case_factory_work']
      }
    ],
    sources: [
      {
        id: 'source_registry',
        url: 'https://example.org/registry/factory',
        sourceLocation: 'registrert virksomhet og status',
        sourceType: 'registry',
        verifiedAt: '2026-07-31',
        temporalCoverage: 'current',
        provenance: 'Offentlig virksomhetsregister med identitets- og statusopplysninger.',
        limitations: 'Registeret dokumenterer ikke arbeidernes erfaringer eller hele verdikjeden.'
      },
      {
        id: 'source_research',
        url: 'https://example.org/research/factory-work',
        sourceLocation: 'kapittel 4, side 71–93',
        sourceType: 'scholarly',
        verifiedAt: '2026-07-31',
        temporalCoverage: 'mixed',
        provenance: 'Fagfellevurdert studie av produksjon, arbeid og lokal verdiskaping.',
        limitations: 'Studien bruker utvalgte år og kan ikke måle alle uformelle bidrag.'
      }
    ],
    economicCases: [
      {
        id: 'case_factory_work',
        claim: 'Fabrikken organiserte arbeid og innsatsfaktorer til dokumentert produksjon og lokal inntekt.',
        unitOfAnalysis: {
          unit: 'Fabrikkvirksomheten ved det canonicale stedet',
          boundary: 'Analysen omfatter virksomheten på stedet og ikke hele konsernets aktivitet.',
          scale: 'firm',
          temporalScope: {
            start: '1952',
            end: '1980',
            precision: 'period',
            rationale: 'Perioden følger de sammenlignbare produksjons- og sysselsettingsdataene.'
          },
          sourceIds: ['source_registry', 'source_research']
        },
        actors: [
          {
            name: 'Virksomhetens eiere og ledelse',
            roleOrInterest: 'Organiserte kapital, produksjon og markedsadgang.',
            economicPosition: 'Kontrollerte investeringer og produksjonsbeslutninger.',
            sourceIds: ['source_registry', 'source_research']
          },
          {
            name: 'Arbeiderne ved fabrikken',
            roleOrInterest: 'Utførte produksjonsarbeidet og mottok lønnsinntekt.',
            economicPosition: 'Bidro med arbeid uten å kontrollere kapitalen.',
            sourceIds: ['source_research']
          }
        ],
        valueCreation: {
          inputs: [statement('Arbeid, maskiner og råvarer var dokumenterte innsatsfaktorer.', ['source_research'])],
          activity: statement('Innsatsfaktorene ble organisert i en stedbundet produksjonsprosess.', ['source_research']),
          outputs: [statement('Produksjonen ga varer og registrert sysselsetting.', ['source_registry', 'source_research'])],
          valueCreationAssessment: statement('Verdiskapingen vurderes gjennom produksjon og arbeidsinntekt, ikke omsetning alene.', ['source_registry', 'source_research'])
        },
        measurement: {
          methodId,
          evidenceType: 'mixed',
          indicatorOrObservation: 'Registrert sysselsetting kombineres med dokumentert arbeidsdeling.',
          unit: 'ansatte og arbeidsfunksjoner',
          period: '1952–1980',
          comparability: 'Tallene sammenlignes bare mellom år med samme virksomhetsavgrensning.',
          dataLimitations: 'Kildene fanger ikke ubetalt arbeid eller alle underleverandører.',
          sourceIds: ['source_registry', 'source_research']
        },
        distributionAndPower: {
          ownershipOrControl: 'Ledelsen kontrollerte kapital og investeringer, mens arbeidet var lønnsbasert.',
          laborPosition: 'Arbeiderne bar arbeidsbelastning og deler av omstillingsrisikoen.',
          beneficiaries: ['Eiere mottok avkastning, og arbeidere mottok lønn.'],
          costRiskBearers: ['Arbeiderne bar risiko ved nedbemanning og omstilling.'],
          sourceIds: ['source_registry', 'source_research']
        },
        riskAndExternalities: {
          riskAssessment: statement('Etterspørselsendringer og teknologisk omstilling påvirket arbeidsplassene.', ['source_research']),
          externalityAssessment: {
            status: 'not_applicable',
            rationale: 'De gjennomgåtte kildene gir ikke sikkert grunnlag for en stedsspesifikk eksternalitetspåstand.'
          }
        },
        comparisonAndCausality: {
          comparisonBasis: 'Registeret dokumenterer status og sysselsetting, mens studien forklarer arbeidsprosessen.',
          causalStatus: 'associational',
          causalAssessment: 'Tidsserien viser samvariasjon, men dokumenterer ikke én isolert årsak til endringen.',
          alternativeExplanations: ['Markedsendringer kan ha virket sammen med teknologisk omstilling.'],
          uncertainty: 'Datagrunnlaget dekker ikke alle leverandører eller uformelle arbeidsbidrag.',
          sourceIds: ['source_registry', 'source_research']
        }
      }
    ],
    presentOperation: {
      operationalStatus: 'former',
      statement: 'Den opprinnelige industrivirksomheten er avsluttet, og bygningen har fått ny bruk.',
      originalEconomicRoleRelationship: 'Dagens bruk foregår i samme bygg, men viderefører ikke den opprinnelige produksjonen.',
      checkedAt: '2026-07-31',
      sourceIds: ['source_registry']
    },
    quizOpening: {
      status: 'N/A',
      rationale: 'Ingen stedquiz produseres eller revideres i denne rapporten.'
    },
    chronologyStories: {
      status: 'N/A',
      chronologyReviewed: true,
      storiesReviewed: true,
      rationale: 'Materialet krever ingen ny chronology-post eller selvstendig Story.'
    },
    gates: {
      A: { status: 'PASS', evidenceRefs: ['economicIdentity'] },
      B: { status: 'PASS', evidenceRefs: ['businessTopics[0]'] },
      C: { status: 'PASS', evidenceRefs: ['case_factory_work.valueCreation'] },
      D: { status: 'PASS', evidenceRefs: ['case_factory_work.actors', 'case_factory_work.distributionAndPower'] },
      E: { status: 'PASS', evidenceRefs: ['case_factory_work.measurement'] },
      F: { status: 'PASS', evidenceRefs: ['case_factory_work.riskAndExternalities', 'case_factory_work.comparisonAndCausality', 'presentOperation'] },
      G: { status: 'N/A', rationale: 'Ingen stedquiz produseres eller revideres i denne rapporten.' },
      H: { status: 'N/A', rationale: 'Ingen chronology eller Story produseres eller revideres.' }
    },
    review: {
      reviewer: 'test-reviewer',
      reviewedAt: '2026-07-31',
      notes: 'Identitet, verdikjede, måling, fordeling, risiko og inferensgrenser er kontrollert.'
    }
  };
}

function validate(report) {
  return validateNaeringslivPlaceReport({
    report,
    place,
    canonicalEmneIds: new Set([emneId]),
    canonicalMethodIds: new Set([methodId]),
    root,
    now: new Date('2026-08-01T12:00:00Z')
  });
}

function initializeFixture(fixtureRoot, { includeReport = false } = {}) {
  const placePath = 'data/places/naeringsliv/test/test_produksjonssted.json';
  const reportPath = 'data/places/naeringsliv-production/test_produksjonssted.json';
  fs.mkdirSync(path.join(fixtureRoot, 'data/places/naeringsliv/test'), { recursive: true });
  fs.mkdirSync(path.join(fixtureRoot, 'data/places/naeringsliv-production'), { recursive: true });
  fs.mkdirSync(path.join(fixtureRoot, 'data/places/regler'), { recursive: true });
  fs.mkdirSync(path.join(fixtureRoot, 'data/fag/naeringsliv'), { recursive: true });
  fs.writeFileSync(path.join(fixtureRoot, 'data/places/manifest.json'), JSON.stringify({ files: ['places/naeringsliv/test/test_produksjonssted.json'] }));
  fs.writeFileSync(path.join(fixtureRoot, placePath), JSON.stringify(place));
  fs.writeFileSync(path.join(fixtureRoot, 'data/places/regler/naeringsliv_place_production_v1.schema.json'), JSON.stringify({ properties: { schemaVersion: { const: 'naeringsliv_place_production_v1' } } }));
  fs.writeFileSync(path.join(fixtureRoot, 'data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json'), JSON.stringify([{ emne_id: emneId }]));
  fs.writeFileSync(path.join(fixtureRoot, 'data/fag/naeringsliv/methods_naeringsliv_canonical_v4_5.json'), JSON.stringify({ methods: [{ method_id: methodId }] }));
  if (includeReport) fs.writeFileSync(path.join(fixtureRoot, reportPath), JSON.stringify(validReport()));
  return { placePath, reportPath };
}

function initializeGit(fixtureRoot) {
  execFileSync('git', ['init', '-q'], { cwd: fixtureRoot });
  execFileSync('git', ['config', 'user.email', 'test@history-go.invalid'], { cwd: fixtureRoot });
  execFileSync('git', ['config', 'user.name', 'History GO test'], { cwd: fixtureRoot });
  execFileSync('git', ['add', '.'], { cwd: fixtureRoot });
  execFileSync('git', ['commit', '-qm', 'fixture base'], { cwd: fixtureRoot });
  return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: fixtureRoot, encoding: 'utf8' }).trim();
}

test('en komplett Næringsliv-produksjonsrapport består A–H-kontrakten', () => {
  assert.deepEqual(validate(validReport()), []);
});

test('ready-rapport krever en komplett stedlig verdiskapingskjede', () => {
  const report = validReport();
  report.economicCases[0].valueCreation.outputs = [];
  assert.ok(validate(report).some((error) => error.includes('valueCreation.outputs')));
});

test('målingen må bruke en canonical Næringsliv-metode', () => {
  const report = validReport();
  report.economicCases[0].measurement.methodId = 'met_naering_oppdiktet';
  assert.ok(validate(report).some((error) => error.includes('ukjent canonical metode')));
});

test('A–F kan ikke settes N/A for et ferdig Næringsliv-sted', () => {
  const report = validReport();
  report.gates.D = { status: 'N/A', rationale: 'Fordeling og makt ble ikke analysert.' };
  assert.ok(validate(report).some((error) => error.includes('gate D må være PASS')));
});

test('rapportens emner må dekke place-filens canonicale em_naering_* nøyaktig', () => {
  const report = validReport();
  report.businessTopics = [];
  assert.ok(validate(report).some((error) => error.includes('må dekke nøyaktig')));
});

test('presentOperation krever en fersk current-kilde', () => {
  const report = validReport();
  report.sources[0].temporalCoverage = 'historical';
  assert.ok(validate(report).some((error) => error.includes('current-kilde')));
});

test('ugyldige kalenderdatoer avvises', () => {
  const report = validReport();
  report.sources[0].verifiedAt = '2026-02-30';
  assert.ok(validate(report).some((error) => error.includes('gyldig kalenderdato')));
});

test('changed-mode krever rapport ved brukerrettet Næringsliv-stedsendring, men ikke koordinat alene', (t) => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'naeringsliv-place-gate-'));
  t.after(() => fs.rmSync(fixtureRoot, { recursive: true, force: true }));
  const { placePath } = initializeFixture(fixtureRoot);
  const original = { ...place, desc: 'Opprinnelig brukerrettet tekst.', lat: 59.9, lon: 10.7 };
  fs.writeFileSync(path.join(fixtureRoot, placePath), JSON.stringify(original));
  const base = initializeGit(fixtureRoot);

  fs.writeFileSync(path.join(fixtureRoot, placePath), JSON.stringify({ ...original, desc: 'Revidert brukerrettet Næringsliv-tekst.' }));
  assert.equal(requiredReportsForChanges(fixtureRoot, [placePath], base).size, 1);

  fs.writeFileSync(path.join(fixtureRoot, placePath), JSON.stringify({ ...original, lat: 59.91 }));
  assert.equal(requiredReportsForChanges(fixtureRoot, [placePath], base).size, 0);
});

test('changed-mode blokkerer sletting av rapport når stedet fortsatt er Næringsliv-sted', (t) => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'naeringsliv-report-delete-'));
  t.after(() => fs.rmSync(fixtureRoot, { recursive: true, force: true }));
  const { reportPath } = initializeFixture(fixtureRoot, { includeReport: true });
  const base = initializeGit(fixtureRoot);
  fs.unlinkSync(path.join(fixtureRoot, reportPath));

  const result = auditNaeringslivPlaceProduction({
    root: fixtureRoot,
    mode: 'changed',
    base,
    paths: [reportPath],
    now: new Date('2026-08-01T12:00:00Z')
  });
  assert.equal(result.status, 'failed');
  assert.ok(result.failures.some((error) => error.includes('slettet mens stedet fortsatt er et Næringsliv-sted')));
});

test('all-mode kan kjøres permanent før første produksjonsrapport er lagt inn', (t) => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'naeringsliv-place-all-'));
  t.after(() => fs.rmSync(fixtureRoot, { recursive: true, force: true }));
  initializeFixture(fixtureRoot);
  const result = auditNaeringslivPlaceProduction({ root: fixtureRoot, mode: 'all' });
  assert.equal(result.status, 'passed');
  assert.equal(result.summary.failures, 0);
});
