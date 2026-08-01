import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  auditHistoriePlaceProduction,
  requiredReportsForChanges,
  validateHistoriePlaceReport
} from '../scripts/audit-historie-place-production.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const place = {
  id: 'test_fabrikk',
  category: 'historie',
  emne_ids: ['em_his_industriarbeid']
};

function fixtureRegistries() {
  const historicalCase = {
    case_id: 'case_his_test_fabrikk',
    place_ids: ['test_fabrikk'],
    case_requirement_ids: [
      'case_req_his_temporal_sequence',
      'case_req_his_actor_conflict',
      'case_req_his_source_comparison',
      'case_req_his_comparative_scale'
    ]
  };
  return {
    canonicalEmneIds: new Set(['em_his_industriarbeid']),
    profiles: new Map([
      [
        'profile_historie_no_test',
        {
          entry: { profile_id: 'profile_historie_no_test' },
          profile: { cases: [historicalCase] },
          cases: new Map([[historicalCase.case_id, historicalCase]])
        }
      ]
    ]),
    claims: new Map([
      [
        'claim_his_test_fabrikk_arbeid',
        {
          claim_id: 'claim_his_test_fabrikk_arbeid',
          scope: {
            place_ids: ['test_fabrikk'],
            case_ids: ['case_his_test_fabrikk']
          },
          source_ids: ['src_his_test_archive', 'src_his_test_research'],
          alternative_interpretations: ['Kildene dokumenterer ulike aktørperspektiver og skal ikke slås sammen til én stemme.']
        }
      ]
    ]),
    sources: new Map([
      [
        'src_his_test_archive',
        {
          source_id: 'src_his_test_archive',
          source_type: 'archive_record',
          url: 'https://example.org/archive/test-fabrikk',
          provenance: { repository_source: 'fixture' },
          limitations: ['Arkivserien dokumenterer arbeidsgiverens perspektiv, ikke alle arbeidernes erfaringer.']
        }
      ],
      [
        'src_his_test_research',
        {
          source_id: 'src_his_test_research',
          source_type: 'scholarly_article',
          url: 'https://example.org/research/test-fabrikk',
          provenance: { repository_source: 'fixture' },
          limitations: ['Ettertidens forskningssyntese bygger på et ufullstendig lokalt kildemateriale.']
        }
      ]
    ]),
    evidenceLinks: new Map([
      [
        'evidence_his_test_fabrikk_archive',
        {
          evidence_id: 'evidence_his_test_fabrikk_archive',
          profile_id: 'profile_historie_no_test',
          place_id: 'test_fabrikk',
          case_id: 'case_his_test_fabrikk',
          claim_id: 'claim_his_test_fabrikk_arbeid',
          emne_ids: ['em_his_industriarbeid'],
          source_ids: ['src_his_test_archive'],
          validation_status: 'validated_case',
          limitations_inherited: true
        }
      ],
      [
        'evidence_his_test_fabrikk_research',
        {
          evidence_id: 'evidence_his_test_fabrikk_research',
          profile_id: 'profile_historie_no_test',
          place_id: 'test_fabrikk',
          case_id: 'case_his_test_fabrikk',
          claim_id: 'claim_his_test_fabrikk_arbeid',
          emne_ids: ['em_his_industriarbeid'],
          source_ids: ['src_his_test_research'],
          validation_status: 'validated_case',
          limitations_inherited: true
        }
      ]
    ])
  };
}

function refs() {
  return {
    claimIds: ['claim_his_test_fabrikk_arbeid'],
    evidenceLinkIds: ['evidence_his_test_fabrikk_archive', 'evidence_his_test_fabrikk_research'],
    sourceIds: ['src_his_test_archive', 'src_his_test_research']
  };
}

function validReport() {
  return {
    schemaVersion: 'historie_place_production_v1',
    validatorVersion: '1.0.0',
    placeId: 'test_fabrikk',
    placeFile: 'data/places/historie/test/test_fabrikk.json',
    status: 'ready',
    historicalIdentity: {
      statement: 'Fabrikken er et dokumentert arbeids- og produksjonssted med et avgrenset historisk forløp.',
      placeObjectDistinction: 'Rapporten skiller den fysiske fabrikken fra selskapet, arbeiderne og industrien som større system.',
      placeRelation: 'event_and_process_site',
      temporalScope: {
        from: 1900,
        to: 1950,
        precision: 'year_range'
      },
      sourceIds: ['src_his_test_archive', 'src_his_test_research']
    },
    historyProfile: {
      profileId: 'profile_historie_no_test',
      caseIds: ['case_his_test_fabrikk'],
      claimIds: ['claim_his_test_fabrikk_arbeid'],
      evidenceLinkIds: ['evidence_his_test_fabrikk_archive', 'evidence_his_test_fabrikk_research']
    },
    historyTopics: [
      {
        emneId: 'em_his_industriarbeid',
        siteSpecificRationale: 'Stedets arkiv og materielle produksjonsspor dokumenterer arbeid, makt og endring over tid.',
        evidenceLinkIds: ['evidence_his_test_fabrikk_archive', 'evidence_his_test_fabrikk_research']
      }
    ],
    sourceReviews: [
      {
        sourceId: 'src_his_test_archive',
        sourceLocation: 'protokoll 4, side 12–18',
        use: 'Dokumenterer arbeidsgiverens beslutninger og den daterte produksjonsendringen.',
        limitation: 'Dokumenterer ikke arbeidernes erfaringer uten støtte fra andre kilder.',
        temporalRelation: 'contemporary',
        verifiedAt: '2026-08-01'
      },
      {
        sourceId: 'src_his_test_research',
        sourceLocation: 'kapittel 3, side 44–61',
        use: 'Sammenligner fabrikkforløpet med den bredere norske industrialiseringen.',
        limitation: 'Er en ettertidsanalyse og kan ikke erstatte samtidige aktørstemmer.',
        temporalRelation: 'modern_synthesis',
        verifiedAt: '2026-08-01'
      }
    ],
    caseRequirements: {
      temporalSequence: {
        statement: 'Det avgrensede forløpet viser både en dokumentert produksjonsendring og institusjonell kontinuitet.',
        start: 'Produksjonen startet i 1900.',
        end: 'Produksjonen ble lagt om i 1950.',
        change: 'Maskinbruk og arbeidsdeling ble dokumentert endret.',
        continuity: 'Arbeidsplassen og eierskapet fortsatte gjennom omleggingen.',
        ...refs()
      },
      actorConflict: {
        statement: 'Arbeidere og fabrikkeiere hadde ulike interesser og ulik kontroll over produksjonsbeslutningene.',
        actors: ['arbeidere', 'fabrikkeiere'],
        conflictOrNegotiation: 'Kildene viser forhandling om arbeidstid og produksjonskrav.',
        ...refs()
      },
      sourceComparison: {
        statement: 'Samtidig bedriftsarkiv og senere forskning belyser ulike deler av det samme forløpet.',
        comparison: 'Arkivet viser beslutningene innenfra, mens forskningen plasserer dem i en bredere utvikling.',
        limitations: 'Ingen av kildene alene dokumenterer hele arbeidsfellesskapets erfaring eller alle virkninger.',
        ...refs()
      },
      comparativeScale: {
        statement: 'Det lokale fabrikkforløpet sammenlignes med industrialisering uten å gjøre stedet representativt for alle fabrikker.',
        localScale: 'Den navngitte fabrikken og dens arbeidsmiljø.',
        widerScale: 'Norsk industrialisering i første halvdel av 1900-tallet.',
        comparison: 'Sammenligningen viser likheter og avvik uten å flytte den nasjonale prosessen fysisk til stedet.',
        ...refs()
      }
    },
    inferenceGuards: {
      contemporaneousVsRetrospective: 'Samtidige protokoller og ettertidens forskning identifiseres som ulike kunnskapsposisjoner.',
      actorVsStructure: 'Navngitte aktørvalg skilles fra langsiktige markeds-, teknologi- og eierskapsstrukturer.',
      causeVsCorrelation: 'Samtidighet brukes ikke som bevis for årsak uten en dokumentert mekanisme og tidsrekkefølge.',
      eventVsProcess: 'Den daterte omleggingen skilles fra den lengre prosessen med endret arbeid og produksjon.',
      localVsWiderScale: 'Det lokale caset kobles til større industrialisering uten å behandles som universelt bevis.'
    },
    quizOpening: {
      status: 'N/A',
      rationale: 'Ingen stedquiz produseres eller revideres i denne rapporten.'
    },
    chronologyStories: {
      status: 'N/A',
      chronologyReviewed: true,
      storiesReviewed: true,
      rationale: 'Chronology og Stories er vurdert, men ingen av delene endres i denne rapporten.'
    },
    gates: {
      A: { status: 'PASS', evidenceRefs: ['historicalIdentity'] },
      B: { status: 'PASS', evidenceRefs: ['historyProfile', 'historyTopics[0]'] },
      C: { status: 'PASS', evidenceRefs: ['caseRequirements.temporalSequence'] },
      D: { status: 'PASS', evidenceRefs: ['caseRequirements.actorConflict'] },
      E: { status: 'PASS', evidenceRefs: ['caseRequirements.sourceComparison'] },
      F: { status: 'PASS', evidenceRefs: ['caseRequirements.comparativeScale'] },
      G: { status: 'PASS', evidenceRefs: ['inferenceGuards'] },
      H: { status: 'N/A', rationale: 'Ingen stedquiz produseres eller revideres i denne rapporten.' },
      I: { status: 'N/A', rationale: 'Ingen chronology eller Story produseres eller revideres.' }
    },
    review: {
      reviewer: 'test-reviewer',
      reviewedAt: '2026-08-01',
      notes: 'Sted, profil, claims, kilder, evidenslenker og inferensgrenser er kontrollert.'
    }
  };
}

function validate(report, overrides = {}) {
  return validateHistoriePlaceReport({
    report,
    place: overrides.place ?? place,
    registries: overrides.registries ?? fixtureRegistries(),
    root,
    now: new Date('2026-08-01T12:00:00Z')
  });
}

test('en komplett Historie-produksjonsrapport består A–I-kontrakten', () => {
  assert.deepEqual(validate(validReport()), []);
});

test('ready-rapport blokkeres når tidsforløpet mangler kontinuitet', () => {
  const report = validReport();
  report.caseRequirements.temporalSequence.continuity = '';
  assert.ok(validate(report).some((error) => error.includes('temporalSequence.continuity')));
});

test('A–G kan ikke settes N/A for et ferdig Historie-sted', () => {
  const report = validReport();
  report.gates.E = { status: 'N/A', rationale: 'Kildesammenligningen ble ikke gjennomført.' };
  assert.ok(validate(report).some((error) => error.includes('gate E må være PASS')));
});

test('kildesammenligning krever to ulike canonicale kildetyper', () => {
  const report = validReport();
  const registries = fixtureRegistries();
  registries.sources.get('src_his_test_research').source_type = 'archive_record';
  assert.ok(validate(report, { registries }).some((error) => error.includes('to ulike canonicale kildetyper')));
});

test('emne-evidens må være stedsspesifikk og dekke place-filens em_his_* nøyaktig', () => {
  const report = validReport();
  const registries = fixtureRegistries();
  registries.evidenceLinks.get('evidence_his_test_fabrikk_archive').place_id = 'annet_sted';
  assert.ok(validate(report, { registries }).some((error) => error.includes('peker til feil place_id')));

  report.historyTopics = [];
  assert.ok(validate(report).some((error) => error.includes('må dekke nøyaktig')));
});

test('profilcaset må realisere alle fire canonicale casekrav', () => {
  const report = validReport();
  const registries = fixtureRegistries();
  registries.profiles.get('profile_historie_no_test').cases
    .get('case_his_test_fabrikk').case_requirement_ids = ['case_req_his_temporal_sequence'];
  const errors = validate(report, { registries });
  assert.ok(errors.some((error) => error.includes('case_req_his_actor_conflict')));
  assert.ok(errors.some((error) => error.includes('case_req_his_source_comparison')));
  assert.ok(errors.some((error) => error.includes('case_req_his_comparative_scale')));
});

test('schemaets additionalProperties-grense håndheves av validatoren', () => {
  const report = validReport();
  report.historicalIdentity.assumption = 'Dette feltet finnes ikke i kontrakten.';
  assert.ok(validate(report).some((error) => error.includes('historicalIdentity har ukjent felt')));
});

test('changed-mode krever rapport ved brukerrettet Historie-stedsendring, men ikke koordinat alene', (t) => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'historie-place-gate-'));
  t.after(() => fs.rmSync(fixtureRoot, { recursive: true, force: true }));
  const placePath = 'data/places/historie/test_fabrikk.json';
  fs.mkdirSync(path.join(fixtureRoot, 'data/places/historie'), { recursive: true });
  fs.writeFileSync(path.join(fixtureRoot, 'data/places/manifest.json'), JSON.stringify({ files: ['places/historie/test_fabrikk.json'] }));
  const original = { ...place, desc: 'Opprinnelig brukerrettet tekst.', lat: 59.9, lon: 10.7 };
  fs.writeFileSync(path.join(fixtureRoot, placePath), JSON.stringify(original));
  execFileSync('git', ['init', '-q'], { cwd: fixtureRoot });
  execFileSync('git', ['config', 'user.email', 'test@history-go.invalid'], { cwd: fixtureRoot });
  execFileSync('git', ['config', 'user.name', 'History GO test'], { cwd: fixtureRoot });
  execFileSync('git', ['add', '.'], { cwd: fixtureRoot });
  execFileSync('git', ['commit', '-qm', 'fixture base'], { cwd: fixtureRoot });
  const base = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: fixtureRoot, encoding: 'utf8' }).trim();

  fs.writeFileSync(path.join(fixtureRoot, placePath), JSON.stringify({ ...original, desc: 'Revidert brukerrettet Historie-tekst.' }));
  assert.equal(requiredReportsForChanges(fixtureRoot, [placePath], base).size, 1);

  fs.writeFileSync(path.join(fixtureRoot, placePath), JSON.stringify({ ...original, lat: 59.91 }));
  assert.equal(requiredReportsForChanges(fixtureRoot, [placePath], base).size, 0);
});

test('all-mode kan kjøres permanent før første Historie-produksjonsrapport er lagt inn', () => {
  const result = auditHistoriePlaceProduction({ root });
  assert.equal(result.status, 'passed');
  assert.equal(result.summary.failures, 0);
});
