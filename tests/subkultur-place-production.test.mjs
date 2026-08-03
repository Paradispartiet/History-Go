import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  auditSubkulturPlaceProduction,
  requiredReportsForChanges,
  validateSubkulturPlaceReport
} from '../scripts/audit-subkultur-place-production.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const emneId = 'em_sub_scene_fellesskap';
const methodId = 'met_sub_sceneanalyse';
const place = {
  id: 'test_subkultursted',
  category: 'subkultur',
  emne_ids: [emneId]
};

function validReport() {
  return {
    schemaVersion: 'subkultur_place_production_v1',
    validatorVersion: '1.0.0',
    placeId: 'test_subkultursted',
    placeFile: 'data/places/subkultur/test/test_subkultursted.json',
    status: 'ready',
    subculturalIdentity: {
      statement: 'Stedet er en dokumentert egenorganisert scene og sosial møteplass for et undergrunnsmiljø.',
      anchorType: 'scene_or_venue',
      mainSocietyRelationship: 'Miljøet arbeider selvstendig, men forhandler med eier og kommune om bruk og regulering.',
      placeObjectDistinction: 'Rapporten skiller den fysiske adressen, organisasjonen, arrangementene og miljøet som bruker stedet.',
      temporalScope: {
        start: '1998',
        end: '2026',
        precision: 'year',
        rationale: 'Perioden følger miljøarkivet og den ferske driftskilden.'
      },
      sourceIds: ['source_milieu', 'source_research']
    },
    subcultureTopics: [
      {
        emneId,
        siteSpecificRationale: 'Kildene dokumenterer en varig scene, deltakelse og fellesskap ved akkurat dette stedet.',
        caseIds: ['case_scene']
      }
    ],
    sources: [
      {
        id: 'source_milieu',
        url: 'https://example.org/miljo/arkiv',
        sourceLocation: 'historikk og organisering',
        sourceType: 'community_primary',
        perspective: 'milieu',
        verifiedAt: '2026-07-31',
        temporalCoverage: 'mixed',
        provenance: 'Miljøets eget dokumenterte arkiv og nåværende informasjon.',
        limitations: 'Kilden uttrykker miljøets egen forståelse og må leses kritisk.'
      },
      {
        id: 'source_research',
        url: 'https://example.org/forskning/scene',
        sourceLocation: 'kapittel 3, side 45–69',
        sourceType: 'scholarly',
        perspective: 'research',
        verifiedAt: '2026-07-31',
        temporalCoverage: 'mixed',
        provenance: 'Fagfellevurdert studie av stedets scene og byforhandlinger.',
        limitations: 'Studien dekker utvalgte perioder og ikke alle deltakere.'
      }
    ],
    subcultureCases: [
      {
        id: 'case_scene',
        claim: 'Egenorganisering, praksis og forhandling om rommet gjorde stedet til en varig undergrunnsscene.',
        actors: [
          {
            name: 'Miljøets deltakere og arrangører',
            roleOrInterest: 'Skapte aktiviteter, regler og tilhørighet på stedet.',
            positionOrPower: 'Kontrollerte deler av programmet, men ikke eiendommen.',
            sourceIds: ['source_milieu', 'source_research']
          },
          {
            name: 'Eier og offentlige myndigheter',
            roleOrInterest: 'Regulerte adgang, bruk, sikkerhet og videre drift.',
            positionOrPower: 'Kontrollerte formelle tillatelser og eiendomsrammer.',
            sourceIds: ['source_research']
          }
        ],
        practicesAndCommunity: {
          practices: ['dugnadsdrevet arrangering', 'uformell læring og deltakelse'],
          belongingAndParticipation: 'Deltakelse over tid skapte tilhørighet og sosial læring, men miljøet hadde også interne terskler.',
          organizationOrGovernance: 'Program, drift og arbeidsdeling ble i stor grad organisert gjennom dugnad og miljøets egne fora.',
          codesOrExpressions: {
            status: 'documented',
            statement: 'Musikk, plakater, språk og rombruk markerte scenens identitet uten å være identiske for alle deltakere.',
            sourceIds: ['source_milieu', 'source_research']
          },
          sourceIds: ['source_milieu', 'source_research']
        },
        spaceAndPower: {
          accessAndTerritory: 'Miljøet gjorde lokalene til et gjenkjennelig sosialt territorium gjennom gjentatt bruk og vedlikehold.',
          controlOrRegulation: {
            status: 'documented',
            statement: 'Formelle krav til eiendom, sikkerhet og åpningstider satte grenser for egenorganiseringen.',
            sourceIds: ['source_milieu', 'source_research']
          },
          conflictOrNegotiation: {
            status: 'documented',
            statement: 'Brukerne forhandlet om drift og adgang med aktører som hadde større formell kontroll over stedet.',
            sourceIds: ['source_milieu', 'source_research']
          },
          displacementOrInstitutionalization: {
            status: 'documented',
            statement: 'Stabilisering ga bedre rammer, men kunne samtidig endre miljøets autonomi og adgangsformer.',
            sourceIds: ['source_milieu', 'source_research']
          },
          sourceIds: ['source_milieu', 'source_research']
        },
        representationAndEthics: {
          selfDefinition: {
            status: 'documented',
            statement: 'Miljøets egne kilder beskriver stedet som en åpen, egenorganisert scene og møteplass.',
            sourceIds: ['source_milieu']
          },
          externalLabels: {
            status: 'documented',
            statement: 'Forskningskilden beskriver både undergrunnsidentitet, institusjonalisering og interne grenser.',
            sourceIds: ['source_research']
          },
          stigmaOrRomanticizationRisk: 'En ren opprørsfortelling ville romantisert miljøet og skjult ulik tilgang, arbeid og konflikt.',
          editorialSafeguard: 'Teksten skiller dokumenterte praksiser fra tolkning og viser både miljøets og utenforståendes perspektiver.',
          privacySafeguard: 'Ingen nåværende sårbare enkeltpersoner identifiseres, og omtalen holdes på miljø- og gruppenivå.',
          sourceIds: ['source_milieu', 'source_research']
        },
        methodAndInference: {
          methodId,
          observationOrEvidence: 'Sceneanalysen kombinerer kontinuitet i aktivitet, organisering, uttrykk og bruk av rommet.',
          alternativeExplanations: ['Stabiliteten kan også forklares av rimelige lokaler og kommunal toleranse.'],
          inferenceStatus: 'associational',
          reflexivity: 'Analysen behandler ikke én synlig stil eller én arrangørgruppe som representativ for hele miljøet.',
          uncertainty: 'Kildene dekker ikke alle uformelle deltakere eller alle perioder like godt.',
          sourceIds: ['source_milieu', 'source_research']
        },
        changeOverTime: {
          scope: {
            start: '1998',
            end: '2026',
            precision: 'period',
            rationale: 'Avgrensningen følger dokumentert aktivitet og den nåværende driften.'
          },
          startingPoint: 'Miljøet etablerte faste aktiviteter og en egenorganisert møteplass fra slutten av 1990-årene.',
          changeOrTurningPoint: 'Nye avtaler og offentlige krav ga mer stabilitet, men endret også kontrollen over rommet.',
          currentOrEndPoint: 'Stedet er fortsatt aktivt, med både kontinuitet og mer formaliserte driftsrammer.',
          continuities: ['dugnad, møteplass og undergrunnsprogram'],
          sourceIds: ['source_milieu', 'source_research']
        }
      }
    ],
    presentFunction: {
      status: 'active',
      statement: 'Stedet er fortsatt en aktiv scene og møteplass med offentlig dokumentert program og drift.',
      historicalRelationship: 'Dagens drift viderefører miljøfunksjonen, men innenfor mer formaliserte rammer enn tidligere.',
      checkedAt: '2026-07-31',
      sourceIds: ['source_milieu']
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
      A: { status: 'PASS', evidenceRefs: ['subculturalIdentity'] },
      B: { status: 'PASS', evidenceRefs: ['subcultureTopics[0]', 'case_scene'] },
      C: { status: 'PASS', evidenceRefs: ['case_scene.actors', 'case_scene.practicesAndCommunity'] },
      D: { status: 'PASS', evidenceRefs: ['case_scene.spaceAndPower'] },
      E: { status: 'PASS', evidenceRefs: ['case_scene.representationAndEthics', 'sources'] },
      F: { status: 'PASS', evidenceRefs: ['case_scene.methodAndInference', 'case_scene.changeOverTime', 'presentFunction'] },
      G: { status: 'N/A', rationale: 'Ingen stedquiz produseres eller revideres i denne rapporten.' },
      H: { status: 'N/A', rationale: 'Ingen chronology eller Story produseres eller revideres.' }
    },
    review: {
      reviewer: 'test-reviewer',
      reviewedAt: '2026-07-31',
      notes: 'Identitet, stemmebalanse, praksis, rommakt, etikk og tidsendring er kontrollert.'
    }
  };
}

function validate(report, testPlace = place) {
  return validateSubkulturPlaceReport({
    report,
    place: testPlace,
    canonicalEmneIds: new Set([emneId]),
    canonicalMethodIds: new Set([methodId]),
    root,
    now: new Date('2026-08-01T12:00:00Z')
  });
}

function initializeFixture(fixtureRoot, { fixturePlace = place, includeReport = false } = {}) {
  const placePath = 'data/places/subkultur/test/test_subkultursted.json';
  const reportPath = 'data/places/subkultur-production/test_subkultursted.json';
  fs.mkdirSync(path.join(fixtureRoot, 'data/places/subkultur/test'), { recursive: true });
  fs.mkdirSync(path.join(fixtureRoot, 'data/places/subkultur-production'), { recursive: true });
  fs.mkdirSync(path.join(fixtureRoot, 'data/places/regler'), { recursive: true });
  fs.mkdirSync(path.join(fixtureRoot, 'data/fag/subkultur'), { recursive: true });
  fs.writeFileSync(path.join(fixtureRoot, 'data/places/manifest.json'), JSON.stringify({ files: ['places/subkultur/test/test_subkultursted.json'] }));
  fs.writeFileSync(path.join(fixtureRoot, placePath), JSON.stringify(fixturePlace));
  fs.writeFileSync(path.join(fixtureRoot, 'data/places/regler/subkultur_place_production_v1.schema.json'), JSON.stringify({ properties: { schemaVersion: { const: 'subkultur_place_production_v1' } } }));
  fs.writeFileSync(path.join(fixtureRoot, 'data/fag/subkultur/emner_subkultur_canonical_v4_5.json'), JSON.stringify([{ emne_id: emneId }]));
  fs.writeFileSync(path.join(fixtureRoot, 'data/fag/subkultur/methods_subkultur_canonical_v4_5.json'), JSON.stringify({ methods: [{ method_id: methodId }] }));
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

test('en komplett Subkultur-produksjonsrapport består A–H-kontrakten', () => {
  assert.deepEqual(validate(validReport()), []);
});

test('kildegrunnlaget må balansere miljønær og uavhengig stemme', () => {
  const report = validReport();
  report.sources[0].perspective = 'secondary';
  assert.ok(validate(report).some((error) => error.includes('miljø- eller støttetjenestestemme')));
});

test('representasjon og etikk må bygge på begge perspektivsider', () => {
  const report = validReport();
  report.subcultureCases[0].representationAndEthics.sourceIds = ['source_milieu'];
  assert.ok(validate(report).some((error) => error.includes('mangler uavhengig kilde')));
});

test('metodeanalysen må bruke en canonical Subkultur-metode', () => {
  const report = validReport();
  report.subcultureCases[0].methodAndInference.methodId = 'met_sub_oppdiktet';
  assert.ok(validate(report).some((error) => error.includes('ukjent canonical metode')));
});

test('ikke-relevante konflikt- eller stilfelt kan markeres eksplisitt uten filler', () => {
  const report = validReport();
  report.subcultureCases[0].spaceAndPower.displacementOrInstitutionalization = {
    status: 'not_applicable',
    rationale: 'Stedet har ingen dokumentert flytting, fortrengning eller institusjonalisering i den avgrensede perioden.'
  };
  report.subcultureCases[0].practicesAndCommunity.codesOrExpressions = {
    status: 'not_documented',
    rationale: 'De gjennomgåtte kildene dokumenterer praksis og fellesskap, men ikke særskilte stil- eller språkkoder.',
    sourceIds: ['source_milieu', 'source_research']
  };
  assert.deepEqual(validate(report), []);
});

test('A–F kan ikke settes N/A for et ferdig Subkultur-sted', () => {
  const report = validReport();
  report.gates.E = { status: 'N/A', rationale: 'Representasjon ble ikke vurdert i denne runden.' };
  assert.ok(validate(report).some((error) => error.includes('gate E må være PASS')));
});

test('rapportens emner må dekke place-filens canonicale em_sub_* nøyaktig', () => {
  const report = validReport();
  report.subcultureTopics = [];
  assert.ok(validate(report).some((error) => error.includes('må dekke nøyaktig')));
});

test('aktiv nåtidsfunksjon krever fersk current eller mixed-kilde', () => {
  const report = validReport();
  report.sources[0].temporalCoverage = 'historical';
  assert.ok(validate(report).some((error) => error.includes('current/mixed-kilde')));
});

test('ugyldige kalenderdatoer avvises', () => {
  const report = validReport();
  report.sources[0].verifiedAt = '2026-02-30';
  assert.ok(validate(report).some((error) => error.includes('gyldig kalenderdato')));
});

test('changed-mode krever rapport ved brukerrettet Subkultur-endring, men ikke koordinat alene', (t) => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'subkultur-place-gate-'));
  t.after(() => fs.rmSync(fixtureRoot, { recursive: true, force: true }));
  const { placePath } = initializeFixture(fixtureRoot);
  const original = { ...place, desc: 'Opprinnelig brukerrettet tekst.', lat: 59.9, lon: 10.7 };
  fs.writeFileSync(path.join(fixtureRoot, placePath), JSON.stringify(original));
  const base = initializeGit(fixtureRoot);

  fs.writeFileSync(path.join(fixtureRoot, placePath), JSON.stringify({ ...original, lat: 59.91 }));
  assert.equal(requiredReportsForChanges(fixtureRoot, [placePath], base).size, 0);

  fs.writeFileSync(path.join(fixtureRoot, placePath), JSON.stringify({ ...original, desc: 'Ny brukerrettet Subkultur-tekst.' }));
  const required = requiredReportsForChanges(fixtureRoot, [placePath], base);
  assert.equal(required.size, 1);
  assert.equal(required.get(place.id)?.reportPath, `data/places/subkultur-production/${place.id}.json`);
});

test('sekundær Subkultur-badge utløser samme rapportkrav som primærkategori', (t) => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'subkultur-secondary-gate-'));
  t.after(() => fs.rmSync(fixtureRoot, { recursive: true, force: true }));
  const secondaryPlace = { ...place, category: 'by', secondaryBadgeIds: ['subkultur'], desc: 'Før.' };
  const { placePath } = initializeFixture(fixtureRoot, { fixturePlace: secondaryPlace });
  const base = initializeGit(fixtureRoot);
  fs.writeFileSync(path.join(fixtureRoot, placePath), JSON.stringify({ ...secondaryPlace, desc: 'Et dokumentert subkulturelt lag i parken.' }));
  assert.equal(requiredReportsForChanges(fixtureRoot, [placePath], base).size, 1);
});

test('all-mode validerer registrerte rapporter og godtar tom rapportmappe', (t) => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'subkultur-all-gate-'));
  t.after(() => fs.rmSync(fixtureRoot, { recursive: true, force: true }));
  initializeFixture(fixtureRoot);
  const result = auditSubkulturPlaceProduction({ root: fixtureRoot, mode: 'all', now: new Date('2026-08-01T12:00:00Z') });
  assert.deepEqual(result.summary, { checked: 0, failures: 0 });
  assert.equal(result.status, 'passed');
});
