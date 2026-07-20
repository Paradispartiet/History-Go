import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const FAUNA_FILE = 'fugler_etne_brattholmen.json';
const FAUNA_REL = `data/natur/fauna/${FAUNA_FILE}`;
const AUDIT_REL = 'reports/etne-natur-batch-4-brattholmen-artskart.json';
const MAP_REL = 'data/natur/nature_etne_place_map.json';
const PLACE_REL = 'data/places/natur/vestland/brattholmen_naturreservat_etne.json';
const REPORT_REL = 'reports/etne-natur-batch-4-brattholmen.md';
const TEST_REL = 'tests/etne-brattholmen-nature-rounds.test.js';

function abs(rel) { return path.join(ROOT, rel); }
function readJson(rel) { return JSON.parse(fs.readFileSync(abs(rel), 'utf8')); }
function writeJson(rel, value) {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), JSON.stringify(value, null, 2) + '\n', 'utf8');
}
function run(command, args) {
  const result = spawnSync(command, args, { cwd: ROOT, stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with ${result.status}`);
}

const sourceUrls = {
  artskart: readJson(AUDIT_REL).meta.artskartRequestUrl,
  svartbak: 'https://artsdatabanken.no/arter/takson/3640',
  makrellterne: 'https://artsdatabanken.no/arter/takson/203561',
  lovdata: 'https://lovdata.no/dokument/LF/forskrift/1987-04-03-246'
};

const cards = [
  {
    id: 'emne_fauna_svartbak',
    title: 'Svartbak',
    latin: 'Larus marinus',
    taxonomy: {
      norsk_navn: 'Svartbak',
      latin_navn: 'Larus marinus',
      klasse: 'Aves',
      orden: 'Charadriiformes',
      familie: 'Laridae',
      artskart_taxon_id: 3640
    },
    habitat: {
      biotop: ['kyst', 'fjord', 'holmer og skjær', 'sjøfuglkolonier'],
      jord: ['berg, strand og grunt sjøareal'],
      lys: ['åpent'],
      fukt: ['marint miljø']
    },
    fenologi: {
      aktiv: ['hele året'],
      strategi: 'Stor, marint tilknyttet måke som bruker holmer, skjær og kystlinjer til hvile, næringssøk og hekking.'
    },
    kjennetegn: [
      'svært stor og kraftig måke',
      'svart rygg og svarte vingeoversider hos voksne',
      'blekt rosa bein',
      'kraftig gult nebb med rød flekk'
    ],
    økologi: {
      rolle: ['kystpredator', 'åtseleter', 'sjøfugl'],
      samspill: ['fisk', 'andre sjøfugler', 'strandsonen', 'marint næringsnett']
    },
    bykontekst: {
      typiske_steder: ['Brattholmen naturreservat', 'kystholmer', 'fjordmunninger'],
      oslo_observert_typisk: 'Kortet er opprettet fra presise Artskart-funn i Brattholmen naturreservat i Etne.'
    },
    observasjonstips: [
      'Observer på stor avstand og se etter den svarte oversiden og den kraftige kroppsbygningen.',
      'Ikke gå i land eller nærm deg holmen i hekkesesongen.'
    ],
    source_urls: [sourceUrls.svartbak, sourceUrls.artskart, sourceUrls.lovdata]
  },
  {
    id: 'emne_fauna_makrellterne',
    title: 'Makrellterne',
    latin: 'Sterna hirundo',
    taxonomy: {
      norsk_navn: 'Makrellterne',
      latin_navn: 'Sterna hirundo',
      klasse: 'Aves',
      orden: 'Charadriiformes',
      familie: 'Laridae',
      artskart_taxon_id: 203561
    },
    habitat: {
      biotop: ['kyst', 'holmer og skjær', 'fjord', 'grunt sjøareal'],
      jord: ['åpent berg, grus og strandflater ved reirplass'],
      lys: ['åpent'],
      fukt: ['marint og brakkvannsnært miljø']
    },
    fenologi: {
      aktiv: ['vår', 'sommer', 'tidlig høst'],
      strategi: 'Trekkfugl som hekker kolonivis ved kyst og ferskvann og fanger småfisk ved stupdykking.'
    },
    kjennetegn: [
      'slank terne med lange spisse vinger',
      'svart hette',
      'rødt nebb med mørk spiss',
      'dypt kløftet hale'
    ],
    økologi: {
      rolle: ['fiskespisende sjøfugl', 'koloniruger', 'indikator på kystens næringstilgang'],
      samspill: ['småfisk', 'sjøfuglkoloni', 'grunne fjordområder', 'hekkefred']
    },
    bykontekst: {
      typiske_steder: ['Brattholmen naturreservat', 'kystholmer', 'skjær og grunne viker'],
      oslo_observert_typisk: 'Kortet er opprettet fra presise Artskart-funn i Brattholmen naturreservat i Etne.'
    },
    observasjonstips: [
      'Observer jaktflukt og stupdykk fra stor avstand uten å følge fuglene mot reirplassen.',
      'Respekter ferdselsforbudet og unngå drone, båtstopp og ilandstigning nær kolonien.'
    ],
    source_urls: [sourceUrls.makrellterne, sourceUrls.artskart, sourceUrls.lovdata]
  }
];
writeJson(FAUNA_REL, cards);

const manifest = readJson('data/natur/fauna/manifest.json');
if (!manifest.files.includes(FAUNA_FILE)) manifest.files.push(FAUNA_FILE);
writeJson('data/natur/fauna/manifest.json', manifest);

const audit = readJson(AUDIT_REL);
const promotions = new Map([
  ['larus_marinus', { id: 'emne_fauna_svartbak', title: 'Svartbak', latin: 'Larus marinus' }],
  ['sterna_hirundo', { id: 'emne_fauna_makrellterne', title: 'Makrellterne', latin: 'Sterna hirundo' }]
]);
const promoted = [];
const remaining = [];
for (const item of audit.unmatched) {
  const key = String(item.names?.[0] || item.displayName || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  const target = promotions.get(key);
  if (!target) {
    remaining.push(item);
    continue;
  }
  promoted.push({
    ...target,
    kind: 'fauna',
    sourceFile: FAUNA_REL,
    observationCount: item.observationCount,
    latestYear: item.latestYear,
    precisionMin: item.precisionMin,
    examples: item.examples
  });
}
if (promoted.length !== 2) throw new Error(`Expected two promoted taxa, got ${promoted.length}`);
audit.matched = [...audit.matched, ...promoted].sort((a, b) => (b.observationCount - a.observationCount) || String(a.title).localeCompare(String(b.title), 'no'));
audit.unmatched = remaining;
audit.counts.matchedCanonicalSpecies = audit.matched.length;
audit.counts.unmatchedTaxa = audit.unmatched.length;
audit.meta.cardPromotion = {
  generatedAt: new Date().toISOString(),
  promotedIds: promoted.map(item => item.id),
  remainingUnmatchedNote: 'Remaining unmatched record is a higher taxonomic order, not a species card candidate.'
};
writeJson(AUDIT_REL, audit);

const map = readJson(MAP_REL);
const entry = map.places.brattholmen_naturreservat_etne;
entry.fauna = [...new Set([...entry.fauna, ...promoted.map(item => item.id)])];
entry.unmatched_taxa_count = audit.unmatched.length;
writeJson(MAP_REL, map);

const places = readJson(PLACE_REL);
places[0].data_quality.matched_fauna_count = entry.fauna.length;
places[0].data_quality.unmatched_taxa_count = audit.unmatched.length;
writeJson(PLACE_REL, places);

let report = fs.readFileSync(abs(REPORT_REL), 'utf8');
report = report.replace('## Observerte taxa uten kanonisk kort', '## Nye artskort opprettet\n\n- Svartbak – *Larus marinus* (`emne_fauna_svartbak`)\n- Makrellterne – *Sterna hirundo* (`emne_fauna_makrellterne`)\n\n## Gjenværende takson uten artskort');
fs.writeFileSync(abs(REPORT_REL), report, 'utf8');

let test = fs.readFileSync(abs(TEST_REL), 'utf8');
if (!test.includes("emne_fauna_svartbak")) {
  test = test.replace(
    "assert.strictEqual(map.places.brattholmen_naturreservat_etne.species_audit, 'reports/etne-natur-batch-4-brattholmen-artskart.json');",
    "assert.strictEqual(map.places.brattholmen_naturreservat_etne.species_audit, 'reports/etne-natur-batch-4-brattholmen-artskart.json');\nassert(map.places.brattholmen_naturreservat_etne.fauna.includes('emne_fauna_svartbak'));\nassert(map.places.brattholmen_naturreservat_etne.fauna.includes('emne_fauna_makrellterne'));\nassert.strictEqual(audit.unmatched.length, 1);\nassert.strictEqual(audit.unmatched[0].displayName, 'Charadriiformes');"
  );
}
fs.writeFileSync(abs(TEST_REL), test, 'utf8');

run('npx', ['tsx', 'tools/validate_nature_maps.mts']);
run('node', [TEST_REL]);
run('node', ['tests/etne-saevareidberget-nature-rounds.test.js']);
run('node', ['tests/etne-langebudalen-nature-rounds.test.js']);
run('node', ['tests/etne-fish-species-rounds.test.js']);
run('node', ['tests/etne-nature-round-content.test.js']);

console.log('Brattholmen species cards promoted: svartbak and makrellterne');
