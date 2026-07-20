import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const FAUNA_FILE = 'fugler_etne_skano.json';
const FAUNA_REL = `data/natur/fauna/${FAUNA_FILE}`;
const AUDIT_REL = 'reports/etne-natur-batch-5-skano-artskart.json';
const MAP_REL = 'data/natur/nature_etne_place_map.json';
const PLACE_REL = 'data/places/natur/vestland/skano_naturreservat_etne.json';
const REPORT_REL = 'reports/etne-natur-batch-5-skano.md';
const TEST_REL = 'tests/etne-skano-nature-rounds.test.js';
const LOVDATA_URL = 'https://lovdata.no/dokument/LF/forskrift/1987-04-03-245';

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

const audit = readJson(AUDIT_REL);
const artskartUrl = audit.meta.artskartRequestUrl;
const cards = [
  {
    id: 'emne_fauna_skjaerpiplerke',
    title: 'Skjærpiplerke',
    latin: 'Anthus petrosus',
    taxonomy: {
      norsk_navn: 'Skjærpiplerke', latin_navn: 'Anthus petrosus', klasse: 'Aves',
      orden: 'Passeriformes', familie: 'Motacillidae', artskart_taxon_id: 4232
    },
    habitat: {
      biotop: ['fjæresone', 'bergkyst', 'holmer og skjær', 'åpent kystlandskap'],
      jord: ['berg, stein og kort kystvegetasjon'], lys: ['åpent'], fukt: ['saltpåvirket kystmiljø']
    },
    fenologi: {
      aktiv: ['hele året, med lokale og trekkende bestander'],
      strategi: 'Kystbundet spurvefugl som søker smådyr langs tangvoller, berg og strandkant.'
    },
    kjennetegn: ['mørk brungrå piplerke', 'kraftig mørk streking på brystet', 'mørke bein', 'går og vipper med halen langs strandberg'],
    økologi: {
      rolle: ['insekt- og smådyrspiser i fjæresonen', 'kystfugl'],
      samspill: ['tangvoller', 'strandberg', 'små krepsdyr og insekter', 'sjøsprøytsonen']
    },
    bykontekst: {
      typiske_steder: ['Skåno naturreservat', 'bergkyst', 'holmer og skjær'],
      oslo_observert_typisk: 'Kortet er opprettet fra presise Artskart-funn innenfor Skåno naturreservat i Etne.'
    },
    observasjonstips: ['Se etter en mørk piplerke som går på strandberg og tangvoll.', 'Observer fra båt eller fastland på trygg avstand; ikke gå i land i reservatet.'],
    source_urls: ['https://artsdatabanken.no/arter/takson/4232', artskartUrl, LOVDATA_URL]
  },
  {
    id: 'emne_fauna_kanadagaas',
    title: 'Kanadagås',
    latin: 'Branta canadensis',
    taxonomy: {
      norsk_navn: 'Kanadagås', latin_navn: 'Branta canadensis', klasse: 'Aves',
      orden: 'Anseriformes', familie: 'Anatidae', artskart_taxon_id: 3457
    },
    habitat: {
      biotop: ['kyst', 'fjæresone', 'ferskvann', 'våtmark', 'åpen grasmark'],
      jord: ['strandeng og beitet grasmark'], lys: ['åpent'], fukt: ['ferskt, brakt og marint vann']
    },
    fenologi: {
      aktiv: ['hele året'],
      strategi: 'Innført gås som beiter på planteføde og bruker både kyst, innsjøer og åpne grasarealer.'
    },
    kjennetegn: ['svart hode og hals', 'tydelig hvit kinnflekk', 'stor brun kropp', 'lang svart hals'],
    økologi: {
      rolle: ['planteeter', 'stor vannfugl', 'fremmed art i norsk natur'],
      samspill: ['grasmark', 'strandeng', 'andre gjess', 'vann og beiteområder']
    },
    bykontekst: {
      typiske_steder: ['Skåno naturreservat', 'åpne kystbeiter', 'våtmark og fjord'],
      oslo_observert_typisk: 'Kortet er opprettet fra presise Artskart-funn innenfor Skåno naturreservat i Etne.'
    },
    observasjonstips: ['Se etter den hvite kinnflekken mot svart hode og hals.', 'Ikke mat fuglene eller gå i land for å komme nærmere.'],
    source_urls: ['https://artsdatabanken.no/arter/takson/3457', artskartUrl, LOVDATA_URL]
  },
  {
    id: 'emne_fauna_roedstilk',
    title: 'Rødstilk',
    latin: 'Tringa totanus',
    taxonomy: {
      norsk_navn: 'Rødstilk', latin_navn: 'Tringa totanus', klasse: 'Aves',
      orden: 'Charadriiformes', familie: 'Scolopacidae', artskart_taxon_id: 3736
    },
    habitat: {
      biotop: ['strandeng', 'våtmark', 'fjæresone', 'åpen kystmark'],
      jord: ['mudder, grunt vann og fuktig grasmark'], lys: ['åpent'], fukt: ['våt og tidevannspåvirket mark']
    },
    fenologi: {
      aktiv: ['vår', 'sommer', 'høst'],
      strategi: 'Vadefugl som hekker i åpen, fuktig mark og søker smådyr i grunt vann og mudder.'
    },
    kjennetegn: ['tydelig røde bein', 'rødlig nebbrot', 'hvit vingebakkant i flukt', 'varsler ofte med klare, gjentatte rop'],
    økologi: {
      rolle: ['vadefugl', 'smådyrspiser', 'hekkefugl i åpen våtmark'],
      samspill: ['strandeng', 'mudderflater', 'insekter og små krepsdyr', 'beitepåvirket mark']
    },
    bykontekst: {
      typiske_steder: ['Skåno naturreservat', 'strandeng', 'grunt kystvann'],
      oslo_observert_typisk: 'Kortet er opprettet fra presise Artskart-funn innenfor Skåno naturreservat i Etne.'
    },
    observasjonstips: ['Se etter røde bein og den hvite vingebakkanten når fuglen flyr.', 'Hold stor avstand dersom fuglen varsler; det kan være reir eller unger i nærheten.'],
    source_urls: ['https://artsdatabanken.no/arter/takson/3736', artskartUrl, LOVDATA_URL]
  },
  {
    id: 'emne_fauna_havoern',
    title: 'Havørn',
    latin: 'Haliaeetus albicilla',
    taxonomy: {
      norsk_navn: 'Havørn', latin_navn: 'Haliaeetus albicilla', klasse: 'Aves',
      orden: 'Accipitriformes', familie: 'Accipitridae', artskart_taxon_id: 3815
    },
    habitat: {
      biotop: ['kyst', 'fjord', 'holmer og skjær', 'skog nær sjø og ferskvann'],
      jord: ['marint landskap og store reirtrær'], lys: ['åpent jaktlandskap'], fukt: ['marint og ferskvannsnært miljø']
    },
    fenologi: {
      aktiv: ['hele året'],
      strategi: 'Stor rovfugl og åtseleter som patruljerer kyst og fjord og hekker i store trær eller bergområder.'
    },
    kjennetegn: ['svært stor rovfugl', 'brede plankelignende vinger', 'kort kileformet hale', 'voksne har hvit hale og lyst hode'],
    økologi: {
      rolle: ['toppredator', 'åtseleter', 'kystrovfugl'],
      samspill: ['fisk', 'sjøfugl', 'åtsler', 'store reirtrær og kystlandskap']
    },
    bykontekst: {
      typiske_steder: ['Skåno naturreservat', 'fjord og kyst', 'holmer og skjær'],
      oslo_observert_typisk: 'Kortet er opprettet fra et presist Artskart-funn innenfor Skåno naturreservat i Etne.'
    },
    observasjonstips: ['Se etter brede vinger og kort, kileformet hale høyt over fjorden.', 'Ikke følg fuglen mot reirplass eller bruk drone i verneområdet.'],
    source_urls: ['https://artsdatabanken.no/arter/takson/3815', artskartUrl, LOVDATA_URL]
  },
  {
    id: 'emne_fauna_vipe',
    title: 'Vipe',
    latin: 'Vanellus vanellus',
    taxonomy: {
      norsk_navn: 'Vipe', latin_navn: 'Vanellus vanellus', klasse: 'Aves',
      orden: 'Charadriiformes', familie: 'Charadriidae', artskart_taxon_id: 3604
    },
    habitat: {
      biotop: ['åpen grasmark', 'strandeng', 'våtmark', 'semi-naturlig mark', 'kyst'],
      jord: ['kortvokst, fuktig eller beitet mark'], lys: ['åpent'], fukt: ['frisk til våt mark']
    },
    fenologi: {
      aktiv: ['vår', 'sommer', 'høst'],
      strategi: 'Bakkehekkende vadefugl som trenger åpen, kortvokst mark og fuktige partier med rik tilgang på smådyr.'
    },
    kjennetegn: ['lang, tynn fjærtopp', 'mørk overside med grønnlig glans', 'svart og hvitt brystmønster', 'brede avrundede vinger og akrobatisk flukt'],
    økologi: {
      rolle: ['vadefugl', 'bakkehekker', 'smådyrspiser i kulturlandskap og våtmark'],
      samspill: ['beite', 'strandeng', 'insekter og meitemark', 'åpen kystmark']
    },
    bykontekst: {
      typiske_steder: ['Skåno naturreservat', 'beitet øylandskap', 'strandeng og våtmark'],
      oslo_observert_typisk: 'Kortet er opprettet fra et presist Artskart-funn innenfor Skåno naturreservat i Etne.'
    },
    observasjonstips: ['Se etter fjærtoppen og den karakteristiske, vinglende flukten over åpen mark.', 'Gå aldri mot en varslende vipe; reiret ligger på bakken og er svært sårbart.'],
    source_urls: ['https://artsdatabanken.no/arter/takson/3604', artskartUrl, LOVDATA_URL]
  }
];
writeJson(FAUNA_REL, cards);

const manifest = readJson('data/natur/fauna/manifest.json');
if (!manifest.files.includes(FAUNA_FILE)) manifest.files.push(FAUNA_FILE);
writeJson('data/natur/fauna/manifest.json', manifest);

const promotions = new Map([
  ['Anthus petrosus', { id: 'emne_fauna_skjaerpiplerke', title: 'Skjærpiplerke', latin: 'Anthus petrosus' }],
  ['Branta canadensis', { id: 'emne_fauna_kanadagaas', title: 'Kanadagås', latin: 'Branta canadensis' }],
  ['Tringa totanus', { id: 'emne_fauna_roedstilk', title: 'Rødstilk', latin: 'Tringa totanus' }],
  ['Haliaeetus albicilla', { id: 'emne_fauna_havoern', title: 'Havørn', latin: 'Haliaeetus albicilla' }],
  ['Vanellus vanellus', { id: 'emne_fauna_vipe', title: 'Vipe', latin: 'Vanellus vanellus' }]
]);
const promoted = [];
const remaining = [];
for (const item of audit.unmatched) {
  const target = promotions.get(item.displayName);
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
if (promoted.length !== 5) throw new Error(`Expected five promoted Skåno species, got ${promoted.length}`);
audit.matched = [...audit.matched, ...promoted].sort((a, b) => (b.observationCount - a.observationCount) || String(a.title).localeCompare(String(b.title), 'no'));
audit.unmatched = remaining;
audit.counts.matchedCanonicalSpecies = audit.matched.length;
audit.counts.unmatchedTaxa = audit.unmatched.length;
audit.meta.cardPromotion = {
  generatedAt: new Date().toISOString(),
  promotedIds: promoted.map(item => item.id),
  remainingUnmatchedNote: remaining.length ? 'Unmatched taxa remain for review.' : 'All accepted species-level taxa now have canonical cards.'
};
writeJson(AUDIT_REL, audit);

const map = readJson(MAP_REL);
const entry = map.places.skano_naturreservat_etne;
entry.fauna = [...new Set([...entry.fauna, ...promoted.map(item => item.id)])];
entry.unmatched_taxa_count = audit.unmatched.length;
writeJson(MAP_REL, map);

const places = readJson(PLACE_REL);
places[0].data_quality.matched_fauna_count = entry.fauna.length;
places[0].data_quality.unmatched_taxa_count = audit.unmatched.length;
writeJson(PLACE_REL, places);

let report = fs.readFileSync(abs(REPORT_REL), 'utf8');
report = report.replace('## Observerte taxa uten kanonisk kort', '## Nye artskort opprettet\n\n- Skjærpiplerke – *Anthus petrosus* (`emne_fauna_skjaerpiplerke`)\n- Kanadagås – *Branta canadensis* (`emne_fauna_kanadagaas`)\n- Rødstilk – *Tringa totanus* (`emne_fauna_roedstilk`)\n- Havørn – *Haliaeetus albicilla* (`emne_fauna_havoern`)\n- Vipe – *Vanellus vanellus* (`emne_fauna_vipe`)\n\n## Gjenværende taxa uten artskort');
fs.writeFileSync(abs(REPORT_REL), report, 'utf8');

let test = fs.readFileSync(abs(TEST_REL), 'utf8');
if (!test.includes("emne_fauna_skjaerpiplerke")) {
  const marker = "assert.strictEqual(entry.species_audit, 'reports/etne-natur-batch-5-skano-artskart.json');";
  const extra = `${marker}\nfor (const id of ['emne_fauna_skjaerpiplerke', 'emne_fauna_kanadagaas', 'emne_fauna_roedstilk', 'emne_fauna_havoern', 'emne_fauna_vipe']) assert(entry.fauna.includes(id), 'Skåno mangler ' + id);\nassert.strictEqual(audit.unmatched.length, 0);`;
  test = test.replace(marker, extra);
}
fs.writeFileSync(abs(TEST_REL), test, 'utf8');

run('npx', ['tsx', 'tools/validate_nature_maps.mts']);
run('node', [TEST_REL]);
run('node', ['tests/etne-brattholmen-nature-rounds.test.js']);
run('node', ['tests/etne-saevareidberget-nature-rounds.test.js']);
run('node', ['tests/etne-langebudalen-nature-rounds.test.js']);
run('node', ['tests/etne-fish-species-rounds.test.js']);
run('node', ['tests/etne-nature-round-content.test.js']);

console.log('Skåno species cards promoted: skjærpiplerke, kanadagås, rødstilk, havørn and vipe');
