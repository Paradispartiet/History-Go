import fs from 'node:fs';

const PLACE_PATH = 'data/places/by/oslo/places/torggata.json';
const AUDIT_PATH = 'reports/place-production/torggata-phase8d-structures-audit-v1.json';
const WORKCARD_PATH = 'reports/place-production/torggata-workcard-current.md';
const TEST_PATH = 'tests/torggata-phase8d-structures.test.mjs';

const place = JSON.parse(fs.readFileSync(PLACE_PATH, 'utf8'));
if (place.id !== 'torggata') throw new Error('Expected canonical Torggata place');

const structures = [
  {
    id: 'torggata_eldorado_torggata_9',
    title: 'Eldorado / Torggata 9',
    type: 'kulturbygg',
    kind: 'structure',
    address: 'Torggata 9',
    year: 1891,
    desc: 'Bygningen i Torggata 9 ble oppført etter tegninger av Harald Olsen og åpnet som Eldorado varietéteater i 1891.',
    historicalFunction: 'Varietéteater, Fahlstrøms Theater fra 1903 og senere kino; lydfilm ble innført i 1929.',
    laterUse: 'Kinodriften varte til 2012, og salene ble omgjort til bokhandel i 2013.',
    architects: [
      { name: 'Harald Olsen', role: 'opprinnelig bygning' },
      { name: 'Henrik Bull', role: 'ombygging til Fahlstrøms Theater i 1903' }
    ],
    placeSpecific: true,
    evidenceStatus: 'verified_historical',
    verifiedAt: '2026-08-11',
    source_urls: [
      'https://oslobyleksikon.no/index.php?title=Eldorado',
      'https://oslobyleksikon.no/index.php/Torggata'
    ]
  },
  {
    id: 'torggata_bad_torggata_16',
    title: 'Torggata bad / Torggata 16',
    type: 'badeanlegg_og_kulturbygg',
    kind: 'structure',
    address: 'Torggata 16',
    year: 1925,
    desc: 'Den nåværende nyklassisistiske Torggata bad-bygningen ble reist i etapper fra 1925 til 1932 etter tegninger av Morgenstierne og Eide.',
    historicalFunction: 'Kommunalt badeanlegg med 25-metersbasseng; badevirksomheten opphørte i 1980.',
    laterUse: 'Etter ombygging åpnet Rockefeller i det tidligere bassenget i 1986, og bygningen fikk senere videre konsert- og serveringsbruk.',
    architects: [
      { name: 'Christian Morgenstierne', role: 'arkitekt for dagens badeanlegg' },
      { name: 'Arne Eide', role: 'arkitekt for dagens badeanlegg' }
    ],
    placeSpecific: true,
    evidenceStatus: 'verified_historical_and_current_use_scope',
    verifiedAt: '2026-08-11',
    source_urls: [
      'https://oslobyleksikon.no/side/Torggata_bad',
      'https://www.rockefeller.no/booking-utleie',
      'https://www.rockefeller.no/kontakt'
    ]
  }
];

place.structures = structures;
fs.writeFileSync(PLACE_PATH, `${JSON.stringify(place, null, 2)}\n`);

const audit = {
  schema: 'history_go_place_structures_audit_v1',
  version: '1.0.0',
  generated_at: '2026-08-11',
  place_id: 'torggata',
  phase: '8D',
  result: 'PASS',
  contract: 'data/places/README_place_rounds.md#9-structures',
  prior_work_gate: {
    search_status: 'completed_on_fresh_main',
    previous_canonical_collection: 'none',
    inherited_candidates: ['Eldorado / Torggata 9', 'Torggata bad / Torggata 16'],
    decision: 'materialize_only_source-grounded_named_physical_structures'
  },
  included: structures.map(item => ({
    id: item.id,
    title: item.title,
    address: item.address,
    reason: item.id === 'torggata_eldorado_torggata_9'
      ? 'Named physical culture building with independent documented history at Torggata 9.'
      : 'Named physical municipal bath complex with independent documented building history at Torggata 16.',
    source_urls: item.source_urls
  })),
  held_back: [
    { candidate: 'Rockefeller', reason: 'Venue/use identity inside the Torggata bad building; a separate structure record would duplicate the same physical complex.' },
    { candidate: 'John Dee', reason: 'Venue identity in the same Torggata 16 complex, not an independently documented building/anlegg for this round.' },
    { candidate: 'Strøget', reason: 'Documented pedestrian passage between Torggata and Storgata, but not established in the approved source package as a named building/anlegg that should be a Torggata structure record.' },
    { candidate: 'Torggata south/north subplaces', reason: 'Canonical subplaces are street segments; the Structures contract explicitly rejects arbitrary subpoints that are not buildings or facilities.' },
    { candidate: 'ordinary address buildings and shop premises', reason: 'No independent named structure identity was established by the approved Torggata source base; business identities stay in Brands rather than being duplicated as structures.' }
  ],
  duplicate_rule: 'One physical building/anlegg equals one structure record even when multiple venues or businesses have occupied it.',
  image_policy: 'No per-structure image is copied or reconstructed without a separately verified rights chain. The canonical round may use its structure icon/count fallback while retaining the real structure collection.',
  quota_policy: 'No numeric target. The collection contains exactly the source-grounded structures that passed the contract in this audit.',
  runtime_expectation: {
    category: 'by',
    preferred_fourth: 'structures',
    fallback_before_8d: 'images',
    expected_after_8d: 'structures'
  }
};
fs.writeFileSync(AUDIT_PATH, `${JSON.stringify(audit, null, 2)}\n`);

const testSource = `import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const place = JSON.parse(fs.readFileSync('data/places/by/oslo/places/torggata.json', 'utf8'));
const audit = JSON.parse(fs.readFileSync('reports/place-production/torggata-phase8d-structures-audit-v1.json', 'utf8'));
const roundsSource = fs.readFileSync('js/ui/place-rounds-visual-collections.js', 'utf8');
const workcard = fs.readFileSync('reports/place-production/torggata-workcard-current.md', 'utf8');
const expectedIds = ['torggata_eldorado_torggata_9', 'torggata_bad_torggata_16'];
const windows = new Set();
afterEach(() => { for (const w of windows) w.close(); windows.clear(); });

function runtime() {
  const dom = new JSDOM('<!doctype html><body><div id="placeCard" data-current-place-id="torggata"><div class="pc-body"><div class="pc-title-row"></div><div class="pc-icons-quad"></div></div></div></body>', { url: 'https://history-go.test/', runScripts: 'outside-only' });
  const w = dom.window;
  windows.add(w);
  w.PLACES = [place];
  w.eval(roundsSource);
  w.document.dispatchEvent(new w.Event('DOMContentLoaded', { bubbles: true }));
  return w;
}

test('8D materializes only the source-grounded Torggata structures', () => {
  assert.ok(Array.isArray(place.structures));
  assert.deepEqual(place.structures.map(item => item.id), expectedIds);
  for (const item of place.structures) {
    assert.equal(item.kind, 'structure');
    assert.equal(item.placeSpecific, true);
    assert.ok(item.address.startsWith('Torggata '));
    assert.ok(item.desc.length > 40);
    assert.ok(Array.isArray(item.source_urls) && item.source_urls.length >= 2);
    assert.ok(item.source_urls.every(url => url.startsWith('https://')));
  }
});

test('8D does not duplicate venue identities as separate physical structures', () => {
  const labels = place.structures.map(item => item.title.toLowerCase());
  assert.equal(labels.some(label => label === 'rockefeller'), false);
  assert.equal(labels.some(label => label === 'john dee'), false);
  for (const name of ['Rockefeller', 'John Dee', 'Strøget', 'Torggata south/north subplaces']) {
    assert.ok(audit.held_back.some(item => item.candidate === name), name);
  }
  assert.match(audit.duplicate_rule, /one physical building/i);
  assert.match(audit.quota_policy, /No numeric target/);
});

test('category-four runtime switches Torggata from Images fallback to Structures', () => {
  const w = runtime();
  assert.equal(w.HGPlaceRounds.getFourth(place), 'structures');
  const items = Array.from(w.HGPlaceRounds.getItems(place, 'structures'));
  assert.deepEqual(items.map(item => item.id), expectedIds);
  assert.ok(items.every(item => item.sourceKind === 'structures'));
  const rounds = Array.from(w.HGPlaceRounds.get(place)).map(item => item.id);
  assert.deepEqual(rounds, ['people', 'objects', 'brands', 'structures']);
});

test('street-segment subplaces do not leak into the Structures collection', () => {
  const w = runtime();
  const ids = new Set(Array.from(w.HGPlaceRounds.getItems(place, 'structures')).map(item => item.id));
  assert.equal(ids.has('torggata_sor_stortorvet_youngstorget'), false);
  assert.equal(ids.has('torggata_nord_youngstorget_ankertorget'), false);
});

test('8D audit passes and workcard advances to 8E', () => {
  assert.equal(audit.result, 'PASS');
  assert.match(workcard, /\\*\\*8D Bygg og anlegg = GODKJENT\\.\\*\\*/);
  assert.match(workcard, /PÅGÅR – 8E legacy rounds \\+ slutt-UI/);
  assert.match(workcard, /Neste fase-8-del: \\*\\*8E legacy rounds \\+ slutt-UI\\*\\*/);
});
`;
fs.writeFileSync(TEST_PATH, testSource);

let workcard = fs.readFileSync(WORKCARD_PATH, 'utf8');
const auditAnchor = '- Fase 8C-audit: `reports/place-production/torggata-phase8c-brands-audit-v1.json`\n';
if (!workcard.includes(auditAnchor)) throw new Error('8C audit anchor missing');
if (!workcard.includes('- Fase 8D-audit:')) {
  workcard = workcard.replace(auditAnchor, `${auditAnchor}- Fase 8D-audit: \`reports/place-production/torggata-phase8d-structures-audit-v1.json\`\n`);
}

const rowOld = '| 8. Rundinger | **PÅGÅR – 8D Bygg og anlegg** | audit PR #4829; **8A People GODKJENT**; **8B Objects GODKJENT**; **8C Brands GODKJENT** etter full re-audit; 8D er neste del |';
const rowNew = '| 8. Rundinger | **PÅGÅR – 8E legacy rounds + slutt-UI** | audit PR #4829; **8A People GODKJENT**; **8B Objects GODKJENT**; **8C Brands GODKJENT**; **8D Bygg og anlegg GODKJENT**; 8E er neste del |';
if (!workcard.includes(rowNew)) {
  if (!workcard.includes(rowOld)) throw new Error('8D status row missing');
  workcard = workcard.replace(rowOld, rowNew);
}

const tailOld = 'Neste fase-8-del: **8D Bygg og anlegg**.';
const tailNew = `## Fase 8D – Bygg og anlegg

8D materialiserer en canonical \`structures\`-samling med de navngitte fysiske anleggene som består den kildeledede rundingskontrakten: **Eldorado / Torggata 9** og **Torggata bad / Torggata 16**. Dette er et auditresultat, ikke en antallskvote. Begge har selvstendig fysisk identitet, dokumentert adresse, historikk og kildegrunnlag i den allerede godkjente Torggata-kildebasen.

Rockefeller og John Dee blir ikke egne Structures fordi de er venue-/bruksidentiteter i Torggata bad-anlegget; det samme fysiske bygget skal ikke dobles. Strøget er en dokumentert passasje, men er ikke etablert i kildepakken som et eget Torggata-bygg/anlegg. De to fase-6-subplace-postene er gatesegmenter og kvalifiserer eksplisitt ikke. Vanlige butikk-/adressebygg dupliseres heller ikke fra Brands uten uavhengig strukturidentitet.

Ingen strukturillustrasjon er kopiert eller rekonstruert uten egen verifisert rettighetskjede. Runtime bruker derfor navn/ikon/telling der et per-structure-bilde mangler. Etter materialisering velger category-four-runtime \`structures\` for Torggata i stedet for den tidligere \`images\`-fallbacken, og focused test låser at samlingen består av de auditerte strukturene uten at gatesegmenter lekker inn.

**8D Bygg og anlegg = GODKJENT.**

Neste fase-8-del: **8E legacy rounds + slutt-UI**.`;
if (!workcard.includes(tailNew)) {
  if (!workcard.includes(tailOld)) throw new Error('8D next-step anchor missing');
  workcard = workcard.replace(tailOld, tailNew);
}
fs.writeFileSync(WORKCARD_PATH, workcard);

console.log('Torggata phase 8D Structures materialized.');
