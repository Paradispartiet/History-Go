import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  auditHistoriePlaceProduction,
  isCanonicalMicroPlace,
  requiredReportsForChanges,
  validateHistoriePlaceReport
} from '../scripts/audit-historie-place-production.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const place = {
  id: 'test_historisk_sted',
  category: 'historie',
  emne_ids: ['em_his_tid_periodisering_epoker']
};

function validReport() {
  return {
    schemaVersion: 'historie_place_production_v1',
    validatorVersion: '1.0.0',
    placeId: 'test_historisk_sted',
    placeFile: 'data/places/historie/test/test_historisk_sted.json',
    status: 'ready',
    historicalIdentity: {
      statement: 'Stedet dokumenterer et avgrenset lokalt historisk forløp.',
      placeRelationType: 'event_site',
      placeRelationStatement: 'Kildene knytter hendelsen direkte til dette fysiske stedet.',
      temporalScope: {
        start: '1814',
        end: '1833',
        precision: 'year',
        rationale: 'Årstallene følger de daterte protokollene som brukes i caset.'
      },
      sourceIds: ['source_archive', 'source_research', 'source_current']
    },
    historyTopics: [
      {
        emneId: 'em_his_tid_periodisering_epoker',
        siteSpecificRationale: 'Stedet viser hvordan ulike tidsgrenser endrer forståelsen av forløpet.',
        caseIds: ['case_local_change']
      }
    ],
    sources: [
      {
        id: 'source_archive',
        url: 'https://example.org/archive/protocol-1814',
        sourceLocation: 'protokoll 4, side 12–18',
        sourceType: 'archive',
        verifiedAt: '2026-07-31',
        temporalCoverage: 'contemporary_to_event',
        provenance: 'Original møteprotokoll bevart i offentlig arkiv.',
        limitations: 'Protokollen dokumenterer vedtak, men ikke alle deltakernes erfaringer.'
      },
      {
        id: 'source_research',
        url: 'https://example.org/research/local-change',
        sourceLocation: 'kapittel 3, side 44–61',
        sourceType: 'scholarly',
        verifiedAt: '2026-07-31',
        temporalCoverage: 'retrospective',
        provenance: 'Fagfellevurdert studie som sammenholder arkivserier.',
        limitations: 'Studien tolker materialet i ettertid og avgrenser seg til institusjoner.'
      },
      {
        id: 'source_current',
        url: 'https://example.org/heritage/site-status',
        sourceLocation: 'avsnittet Stedet i dag',
        sourceType: 'museum_or_heritage',
        verifiedAt: '2026-07-31',
        temporalCoverage: 'current',
        provenance: 'Dagens forvalter beskriver byggets bevarte og ombygde deler.',
        limitations: 'Kilden dokumenterer fysisk status, ikke hele det historiske forløpet.'
      }
    ],
    caseRealizations: [
      {
        id: 'case_local_change',
        claim: 'Forløpet viser både et institusjonelt brudd og sosial kontinuitet.',
        temporalSequence: {
          scope: {
            start: '1814',
            end: '1833',
            precision: 'year',
            rationale: 'Avgrensningen fanger vedtaket og den senere representasjonsendringen.'
          },
          startPoint: 'Den daterte protokollen etablerer forløpets første hendelse.',
          endPoint: 'Den senere representasjonsendringen avslutter analyseperioden.',
          breaks: ['Det formelle vedtaket endret den institusjonelle rammen.'],
          continuities: ['Sosiale maktforskjeller besto gjennom hele perioden.'],
          sourceIds: ['source_archive', 'source_research']
        },
        actors: [
          {
            name: 'Embetsmennene',
            roleOrInterest: 'Forsvarte sin institusjonelle posisjon.',
            powerPosition: 'Hadde sterk formell og sosial innflytelse.',
            sourceIds: ['source_archive', 'source_research']
          },
          {
            name: 'Bonderepresentantene',
            roleOrInterest: 'Søkte større representasjon og påvirkning.',
            powerPosition: 'Hadde svakere posisjon ved periodens start.',
            sourceIds: ['source_archive', 'source_research']
          }
        ],
        conflictOrNegotiation: {
          statement: 'Kildene dokumenterer ulike interesser i spørsmålet om representasjon.',
          sourceIds: ['source_archive', 'source_research']
        },
        sourceComparison: {
          sourceIds: ['source_archive', 'source_research'],
          comparison: 'Protokollen dokumenterer samtidens vedtak, mens studien analyserer utviklingen over tid.',
          contradictionsOrSilences: 'Protokollen sier lite om erfaringene utenfor den formelle arenaen.',
          conclusionLimits: 'Caset kan ikke representere alle sosiale gruppers erfaringer.'
        },
        comparativeScale: {
          localFinding: 'Det lokale forløpet viser endret representasjon i én institusjon.',
          widerContext: 'Utviklingen inngikk i en bredere nasjonal demokratiseringsprosess.',
          scale: 'national',
          sourceIds: ['source_archive', 'source_research']
        },
        causationAndUncertainty: {
          causalAssessment: 'Tidsrekkefølgen støtter en sammenheng, men beviser ikke én enkelt årsak.',
          alternativeExplanations: ['Endret sosial mobilisering kan også ha påvirket utfallet.'],
          uncertainty: 'Kildene dekker formelle arenaer bedre enn uformell mobilisering.',
          sourceIds: ['source_archive', 'source_research']
        }
      }
    ],
    presentTrace: {
      objectStatus: 'altered',
      statement: 'Bygningen står fortsatt, men er ombygd etter det historiske forløpet.',
      originalSiteRelationship: 'Dagens bygg omfatter det dokumenterte hendelsesstedet uten å være uendret.',
      sourceIds: ['source_current']
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
      A: { status: 'PASS', evidenceRefs: ['historicalIdentity'] },
      B: { status: 'PASS', evidenceRefs: ['historyTopics[0]'] },
      C: { status: 'PASS', evidenceRefs: ['case_local_change.temporalSequence'] },
      D: { status: 'PASS', evidenceRefs: ['case_local_change.actors', 'case_local_change.conflictOrNegotiation'] },
      E: { status: 'PASS', evidenceRefs: ['case_local_change.sourceComparison'] },
      F: { status: 'PASS', evidenceRefs: ['case_local_change.comparativeScale', 'case_local_change.causationAndUncertainty', 'presentTrace'] },
      G: { status: 'N/A', rationale: 'Ingen stedquiz produseres eller revideres i denne rapporten.' },
      H: { status: 'N/A', rationale: 'Ingen chronology eller Story produseres eller revideres.' }
    },
    review: {
      reviewer: 'test-reviewer',
      reviewedAt: '2026-07-31',
      notes: 'Tidsforløp, aktører, kildetyper, skala og inferensgrenser er kontrollert.'
    }
  };
}

function validate(report) {
  return validateHistoriePlaceReport({
    report,
    place,
    canonicalEmneIds: new Set(['em_his_tid_periodisering_epoker']),
    root,
    now: new Date('2026-08-01T12:00:00Z')
  });
}

test('en komplett Historie-produksjonsrapport består A–H-kontrakten', () => {
  assert.deepEqual(validate(validReport()), []);
});

test('ready-rapport krever både brudd og kontinuitet', () => {
  const report = validReport();
  report.caseRealizations[0].temporalSequence.continuities = [];
  assert.ok(validate(report).some((error) => error.includes('minst én kontinuitet')));
});

test('kildesammenligning må bruke minst to kildetyper', () => {
  const report = validReport();
  report.sources[1].sourceType = 'archive';
  assert.ok(validate(report).some((error) => error.includes('minst to kildetyper')));
});

test('A–F kan ikke settes N/A for et ferdig Historie-sted', () => {
  const report = validReport();
  report.gates.E = { status: 'N/A', rationale: 'Kildene ble ikke sammenlignet i denne rapporten.' };
  assert.ok(validate(report).some((error) => error.includes('gate E må være PASS')));
});

test('rapportens emner må dekke place-filens canonicale em_his_* nøyaktig', () => {
  const report = validReport();
  report.historyTopics = [];
  assert.ok(validate(report).some((error) => error.includes('må dekke nøyaktig')));
});

test('senere minnested kan ikke forveksles med opprinnelig hendelsessted', () => {
  const report = validReport();
  report.historicalIdentity.placeRelationType = 'later_memory_site';
  report.historicalIdentity.placeRelationStatement = '';
  assert.ok(validate(report).some((error) => error.includes('placeRelationStatement')));
});

test('presentTrace krever fersk current-kilde', () => {
  const report = validReport();
  report.sources[2].temporalCoverage = 'retrospective';
  assert.ok(validate(report).some((error) => error.includes('current-kilde')));
});

test('changed-mode krever rapport ved brukerrettet Historie-stedsendring, men ikke koordinat alene', (t) => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'historie-place-gate-'));
  t.after(() => fs.rmSync(fixtureRoot, { recursive: true, force: true }));
  const placePath = 'data/places/historie/test_historisk_sted.json';
  fs.mkdirSync(path.join(fixtureRoot, 'data/places/historie'), { recursive: true });
  fs.writeFileSync(path.join(fixtureRoot, 'data/places/manifest.json'), JSON.stringify({ files: ['places/historie/test_historisk_sted.json'] }));
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

  const micro = {
    ...original,
    desc: 'Kort, kildeverifisert tekst for et canonical mikrosted.',
    placeTier: 'micro',
    micro_place_profile: {
      schema: 'history_go_micro_place_profile_v1',
      kind: 'snublestein',
      currentStatus: 'active',
      sourceUrl: 'https://example.org/snublestein',
      sourceLocation: 'individuell oppføring',
      verifiedAt: '2026-08-26',
      quizMode: 'none'
    }
  };
  fs.writeFileSync(path.join(fixtureRoot, placePath), JSON.stringify(micro));
  assert.equal(isCanonicalMicroPlace(micro), true);
  assert.equal(requiredReportsForChanges(fixtureRoot, [placePath], base).size, 0, 'canonical Micro Place skal følge redusert kontrakt, ikke full A–H-rapport');
});

test('bare eksplisitt canonical Micro Place-profil kan fritas fra full Historie-rapport', () => {
  assert.equal(isCanonicalMicroPlace({ category: 'historie', placeTier: 'micro' }), false);
  assert.equal(isCanonicalMicroPlace({ category: 'historie', micro_place_profile: { schema: 'history_go_micro_place_profile_v1' } }), false);
  assert.equal(isCanonicalMicroPlace({ category: 'historie', placeTier: 'micro', micro_place_profile: { schema: 'history_go_micro_place_profile_v1' } }), true);
});

test('changed-mode blokkerer sletting av rapport når stedet fortsatt er Historie-sted', (t) => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'historie-report-delete-'));
  t.after(() => fs.rmSync(fixtureRoot, { recursive: true, force: true }));
  const placePath = 'data/places/historie/test/test_historisk_sted.json';
  const reportPath = 'data/places/historie-production/test_historisk_sted.json';
  fs.mkdirSync(path.join(fixtureRoot, 'data/places/historie/test'), { recursive: true });
  fs.mkdirSync(path.join(fixtureRoot, 'data/places/historie-production'), { recursive: true });
  fs.mkdirSync(path.join(fixtureRoot, 'data/places/regler'), { recursive: true });
  fs.mkdirSync(path.join(fixtureRoot, 'data/fag/historie'), { recursive: true });
  fs.writeFileSync(path.join(fixtureRoot, 'data/places/manifest.json'), JSON.stringify({ files: ['places/historie/test/test_historisk_sted.json'] }));
  fs.writeFileSync(path.join(fixtureRoot, placePath), JSON.stringify(place));
  fs.writeFileSync(path.join(fixtureRoot, 'data/places/regler/historie_place_production_v1.schema.json'), '{}');
  fs.writeFileSync(path.join(fixtureRoot, 'data/fag/historie/emner_historie_canonical_v4_5.json'), JSON.stringify([{ emne_id: 'em_his_tid_periodisering_epoker' }]));
  fs.writeFileSync(path.join(fixtureRoot, reportPath), JSON.stringify(validReport()));
  execFileSync('git', ['init', '-q'], { cwd: fixtureRoot });
  execFileSync('git', ['config', 'user.email', 'test@history-go.invalid'], { cwd: fixtureRoot });
  execFileSync('git', ['config', 'user.name', 'History GO test'], { cwd: fixtureRoot });
  execFileSync('git', ['add', '.'], { cwd: fixtureRoot });
  execFileSync('git', ['commit', '-qm', 'fixture base'], { cwd: fixtureRoot });
  const base = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: fixtureRoot, encoding: 'utf8' }).trim();

  fs.unlinkSync(path.join(fixtureRoot, reportPath));
  const result = auditHistoriePlaceProduction({
    root: fixtureRoot,
    mode: 'changed',
    base,
    paths: [reportPath],
    now: new Date('2026-08-01T12:00:00Z')
  });
  assert.equal(result.status, 'failed');
  assert.ok(result.failures.some((error) => error.includes('slettet mens stedet fortsatt er et Historie-sted')));
});

test('all-mode kan kjøres permanent før første produksjonsrapport er lagt inn', (t) => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'historie-place-all-'));
  t.after(() => fs.rmSync(fixtureRoot, { recursive: true, force: true }));
  fs.mkdirSync(path.join(fixtureRoot, 'data/places/historie-production'), { recursive: true });
  fs.mkdirSync(path.join(fixtureRoot, 'data/places/regler'), { recursive: true });
  fs.mkdirSync(path.join(fixtureRoot, 'data/fag/historie'), { recursive: true });
  fs.writeFileSync(path.join(fixtureRoot, 'data/places/manifest.json'), JSON.stringify({ files: [] }));
  fs.writeFileSync(path.join(fixtureRoot, 'data/places/regler/historie_place_production_v1.schema.json'), '{}');
  fs.writeFileSync(path.join(fixtureRoot, 'data/fag/historie/emner_historie_canonical_v4_5.json'), '[]');
  const result = auditHistoriePlaceProduction({ root: fixtureRoot, mode: 'all' });
  assert.equal(result.status, 'passed');
  assert.equal(result.summary.failures, 0);
});

test('Gamle Aker chronology er kildebelagt og holder usikker datering og Story adskilt', () => {
  const leksikon = JSON.parse(fs.readFileSync(path.join(root, 'data/leksikon/places/oslo/historie/leksikon_oslo_historie.json'), 'utf8'));
  const article = leksikon.find((entry) => entry.place_id === 'gamle_aker_kirke');
  assert.ok(article);
  assert.equal(article.version, 3);
  assert.equal(article.chronology.length, 11);
  assert.equal(new Set(article.chronology.map((entry) => entry.id)).size, 11);

  for (const entry of article.chronology) {
    assert.ok(entry.period);
    assert.ok(entry.desc);
    assert.ok(['high', 'medium'].includes(entry.confidence));
    assert.ok(entry.sources.length >= 1);
    assert.ok(entry.sources.every((source) => URL.canParse(source) && new URL(source).protocol === 'https:'));
  }

  const uncertainDating = article.chronology.find((entry) => entry.id === 'chrono_gak_c1080_1180');
  assert.equal(uncertainDating.year, null);
  assert.match(uncertainDating.period, /1080.*1180/);
  assert.match(uncertainDating.desc, /1080.*1100-tallet.*1130.*1180/);
  assert.deepEqual(
    article.chronology.filter((entry) => entry.year !== null).map((entry) => entry.year),
    [1186, 1592, 1703, 1852, 1856, 1940, 1950, 2023, 2025, 2026]
  );

  const historicalHosts = new Set(['snl.no', 'oslobyleksikon.no', 'riksantikvaren.no']);
  const historicalEntries = article.chronology.filter((entry) => entry.year !== null && entry.year < 2023);
  assert.ok(historicalEntries.every((entry) => entry.sources.some((source) => historicalHosts.has(new URL(source).hostname))));

  const plannedPhase = article.chronology.find((entry) => entry.id === 'chrono_gak_2026_2027');
  assert.match(`${plannedPhase.period} ${plannedPhase.desc}`, /planlagt/i);
  assert.equal(article.sources.length, 5);
  assert.ok(!Object.hasOwn(article, 'externalLinks'));

  const report = JSON.parse(fs.readFileSync(path.join(root, 'data/places/historie-production/gamle_aker_kirke.json'), 'utf8'));
  assert.equal(report.chronologyStories.status, 'PASS');
  assert.equal(report.gates.H.status, 'PASS');
  assert.match(report.chronologyStories.rationale, /narrativ akse utover tidslinjen/);
});

test('Gamle Aker Story er en manifestert episode og ikke en fossilforklaring', () => {
  const storyPath = 'data/stories/stories_gamle_aker_kirke.json';
  const stories = JSON.parse(fs.readFileSync(path.join(root, storyPath), 'utf8'));
  assert.equal(stories.length, 1);
  const story = stories[0];
  assert.equal(story.id, 'st_gamle_aker_kirke_dronning_maud_i_krypten');
  assert.equal(story.quality_profile, 'episode_v1');
  assert.equal(story.type, 'historical_event');
  assert.equal(story.year, 1940);
  assert.equal(story.place_id, 'gamle_aker_kirke');
  assert.equal(story.episode.date, '1940-04-19');
  assert.ok(story.episode.actors.some((actor) => actor.includes('Broch')));
  assert.ok(story.episode.actors.some((actor) => actor.includes('Berggrav')));
  assert.deepEqual(story.related_people, ['dronning_maud']);
  assert.deepEqual(story.related_places, ['akershus_festning']);
  assert.equal(story.next_scenes[0].place_id, 'akershus_festning');
  assert.equal(story.sources.length, 2);
  assert.ok(story.sources.every((source) => URL.canParse(source.url) && new URL(source.url).protocol === 'https:'));
  assert.match(story.story, /19\. april/);
  assert.match(story.story, /1948/);
  assert.doesNotMatch(JSON.stringify(story), /st_gamle_aker_kirke_fossiler/);

  const storyManifest = JSON.parse(fs.readFileSync(path.join(root, 'data/stories/stories_manifest.json'), 'utf8'));
  assert.equal(storyManifest.files.filter((entry) => entry.path === storyPath).length, 1);
  const episodeManifest = JSON.parse(fs.readFileSync(path.join(root, 'data/stories/stories_episode_v1_manifest.json'), 'utf8'));
  assert.equal(episodeManifest.files.filter((entry) => entry === storyPath).length, 1);

  const report = JSON.parse(fs.readFileSync(path.join(root, 'data/places/historie-production/gamle_aker_kirke.json'), 'utf8'));
  assert.equal(report.chronologyStories.status, 'PASS');
  assert.match(report.chronologyStories.rationale, /19\. april 1940/);
});
