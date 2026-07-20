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

const abs = rel => path.join(ROOT, rel);
const readJson = rel => JSON.parse(fs.readFileSync(abs(rel), 'utf8'));
function writeJson(rel, value) {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}
function run(command, args) {
  const result = spawnSync(command, args, { cwd: ROOT, stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with ${result.status}`);
}

const audit = readJson(AUDIT_REL);
const artskartUrl = audit.meta.artskartRequestUrl;
const species = [
  {
    id: 'emne_fauna_skjaerpiplerke', title: 'Skjærpiplerke', latin: 'Anthus petrosus', taxonId: 4232,
    order: 'Passeriformes', family: 'Motacillidae',
    biotop: ['fjæresone', 'bergkyst', 'holmer og skjær'],
    traits: ['mørk brungrå piplerke', 'kraftig bryststreking', 'mørke bein', 'vipper med halen på strandberg'],
    roles: ['insekt- og smådyrspiser', 'kystfugl'],
    strategy: 'Kystbundet spurvefugl som søker smådyr langs tangvoller, berg og strandkant.',
    tips: ['Se etter en mørk piplerke på strandberg og tangvoll.', 'Observer fra båt eller fastland; ikke gå i land.']
  },
  {
    id: 'emne_fauna_kanadagaas', title: 'Kanadagås', latin: 'Branta canadensis', taxonId: 3457,
    order: 'Anseriformes', family: 'Anatidae',
    biotop: ['kyst', 'fjæresone', 'våtmark', 'åpen grasmark'],
    traits: ['svart hode og hals', 'hvit kinnflekk', 'stor brun kropp', 'lang svart hals'],
    roles: ['planteeter', 'stor vannfugl', 'fremmed art i norsk natur'],
    strategy: 'Innført gås som beiter på planteføde og bruker både kyst, innsjøer og åpne grasarealer.',
    tips: ['Se etter den hvite kinnflekken.', 'Ikke mat fuglene eller gå i land for å komme nærmere.']
  },
  {
    id: 'emne_fauna_roedstilk', title: 'Rødstilk', latin: 'Tringa totanus', taxonId: 3736,
    order: 'Charadriiformes', family: 'Scolopacidae',
    biotop: ['strandeng', 'våtmark', 'fjæresone', 'åpen kystmark'],
    traits: ['røde bein', 'rødlig nebbrot', 'hvit vingebakkant', 'klare varselsrop'],
    roles: ['vadefugl', 'smådyrspiser', 'hekkefugl i våtmark'],
    strategy: 'Vadefugl som hekker i åpen, fuktig mark og søker smådyr i grunt vann og mudder.',
    tips: ['Se etter røde bein og hvit vingebakkant.', 'Trekk deg unna dersom fuglen varsler.']
  },
  {
    id: 'emne_fauna_havoern', title: 'Havørn', latin: 'Haliaeetus albicilla', taxonId: 3815,
    order: 'Accipitriformes', family: 'Accipitridae',
    biotop: ['kyst', 'fjord', 'holmer og skjær', 'skog nær sjø'],
    traits: ['svært stor rovfugl', 'brede vinger', 'kort kileformet hale', 'voksen med hvit hale'],
    roles: ['toppredator', 'åtseleter', 'kystrovfugl'],
    strategy: 'Stor rovfugl som patruljerer kyst og fjord og hekker i store trær eller bergområder.',
    tips: ['Se etter brede vinger og kort hale.', 'Ikke følg fuglen mot reirplass eller bruk drone.']
  },
  {
    id: 'emne_fauna_vipe', title: 'Vipe', latin: 'Vanellus vanellus', taxonId: 3604,
    order: 'Charadriiformes', family: 'Charadriidae',
    biotop: ['åpen grasmark', 'strandeng', 'våtmark', 'semi-naturlig mark'],
    traits: ['lang fjærtopp', 'grønnlig mørk overside', 'svart-hvitt bryst', 'akrobatisk flukt'],
    roles: ['vadefugl', 'bakkehekker', 'smådyrspiser'],
    strategy: 'Bakkehekkende vadefugl som trenger åpen, kortvokst mark og fuktige partier.',
    tips: ['Se etter fjærtoppen og vinglende flukt.', 'Gå aldri mot en varslende vipe; reiret ligger på bakken.']
  }
];

const cards = species.map(item => ({
  id: item.id,
  title: item.title,
  latin: item.latin,
  taxonomy: {
    norsk_navn: item.title,
    latin_navn: item.latin,
    klasse: 'Aves',
    orden: item.order,
    familie: item.family,
    artskart_taxon_id: item.taxonId
  },
  habitat: {
    biotop: item.biotop,
    jord: ['berg, strandeng, mudder eller kort kystvegetasjon etter art'],
    lys: ['åpent'],
    fukt: ['marint, brakt eller våtmarksnært miljø']
  },
  fenologi: { aktiv: ['vår', 'sommer', 'høst', 'vinter etter art'], strategi: item.strategy },
  kjennetegn: item.traits,
  økologi: { rolle: item.roles, samspill: ['kystlandskap', 'næringsdyr', 'våtmark eller sjø', 'hekkefred'] },
  bykontekst: {
    typiske_steder: ['Skåno naturreservat', ...item.biotop.slice(0, 2)],
    oslo_observert_typisk: 'Kortet er opprettet fra presise Artskart-funn innenfor Skåno naturreservat i Etne.'
  },
  observasjonstips: item.tips,
  source_urls: [`https://artsdatabanken.no/arter/takson/${item.taxonId}`, artskartUrl, LOVDATA_URL]
}));
writeJson(FAUNA_REL, cards);

const manifest = readJson('data/natur/fauna/manifest.json');
if (!manifest.files.includes(FAUNA_FILE)) manifest.files.push(FAUNA_FILE);
writeJson('data/natur/fauna/manifest.json', manifest);

const byLatin = new Map(species.map(item => [item.latin, item]));
const promoted = [];
const remaining = [];
for (const item of audit.unmatched) {
  const target = byLatin.get(item.displayName);
  if (!target) {
    remaining.push(item);
    continue;
  }
  promoted.push({
    id: target.id,
    kind: 'fauna',
    title: target.title,
    latin: target.latin,
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
audit.counts.unmatchedTaxa = remaining.length;
audit.meta.cardPromotion = {
  generatedAt: new Date().toISOString(),
  promotedIds: promoted.map(item => item.id),
  remainingUnmatchedNote: remaining.length ? 'Unmatched taxa remain.' : 'All accepted species-level taxa now have canonical cards.'
};
writeJson(AUDIT_REL, audit);

const map = readJson(MAP_REL);
const entry = map.places.skano_naturreservat_etne;
entry.fauna = [...new Set([...entry.fauna, ...promoted.map(item => item.id)])];
entry.unmatched_taxa_count = remaining.length;
writeJson(MAP_REL, map);

const places = readJson(PLACE_REL);
places[0].data_quality.matched_fauna_count = entry.fauna.length;
places[0].data_quality.unmatched_taxa_count = remaining.length;
writeJson(PLACE_REL, places);

let report = fs.readFileSync(abs(REPORT_REL), 'utf8');
const reportInsert = `## Nye artskort opprettet\n\n${species.map(item => `- ${item.title} – *${item.latin}* (\`${item.id}\`)`).join('\n')}\n\n## Gjenværende taxa uten artskort`;
report = report.replace('## Observerte taxa uten kanonisk kort', reportInsert);
fs.writeFileSync(abs(REPORT_REL), report, 'utf8');

let test = fs.readFileSync(abs(TEST_REL), 'utf8');
const speciesAuditMarker = "assert.strictEqual(entry.species_audit, 'reports/etne-natur-batch-5-skano-artskart.json');";
if (!test.includes('emne_fauna_skjaerpiplerke')) {
  const idCheck = `\nfor (const id of ${JSON.stringify(species.map(item => item.id))}) assert(entry.fauna.includes(id), 'Skåno mangler ' + id);`;
  test = test.replace(speciesAuditMarker, speciesAuditMarker + idCheck);
}
const auditMarker = "const audit = readJson('reports/etne-natur-batch-5-skano-artskart.json');";
if (!test.includes('audit.unmatched.length')) test = test.replace(auditMarker, auditMarker + '\nassert.strictEqual(audit.unmatched.length, 0);');
fs.writeFileSync(abs(TEST_REL), test, 'utf8');

run('npx', ['tsx', 'tools/validate_nature_maps.mts']);
run('node', [TEST_REL]);
run('node', ['tests/etne-brattholmen-nature-rounds.test.js']);
run('node', ['tests/etne-saevareidberget-nature-rounds.test.js']);
run('node', ['tests/etne-langebudalen-nature-rounds.test.js']);
run('node', ['tests/etne-fish-species-rounds.test.js']);
run('node', ['tests/etne-nature-round-content.test.js']);

console.log('Skåno species cards promoted: skjærpiplerke, kanadagås, rødstilk, havørn and vipe');
