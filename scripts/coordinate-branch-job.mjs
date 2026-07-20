import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const SOURCE_COMMIT = '67c8040146fbf5863c18f52787ccb61bad0e083a';
const RAW_ROOT = `https://raw.githubusercontent.com/Paradispartiet/History-Go/${SOURCE_COMMIT}`;
const PLACE_ID = 'jettegrytene_rullestad';
const MAP_REL = 'data/natur/nature_etne_place_map.json';
const AUDIT_REL = 'reports/etne-natur-batch-7-jettegrytene-artskart-candidates.json';
const REPORT_REL = 'reports/etne-natur-batch-7-jettegrytene.md';
const FLORA_FILE = 'karplanter_etne_jettegrytene.json';
const FAUNA_FILE = 'sommerfugler_etne_jettegrytene.json';
const FLORA_REL = `data/natur/flora/${FLORA_FILE}`;
const FAUNA_REL = `data/natur/fauna/${FAUNA_FILE}`;
const TEST_REL = 'tests/etne-jettegrytene-nature-rounds.test.js';

const abs = rel => path.join(ROOT, rel);
const readJson = rel => JSON.parse(fs.readFileSync(abs(rel), 'utf8'));
function writeJson(rel, value) {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}
function writeText(rel, value) {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), value.endsWith('\n') ? value : `${value}\n`, 'utf8');
}
async function fetchText(rel) {
  const url = `${RAW_ROOT}/${rel}`;
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { 'user-agent': 'History-Go-Jettegrytene-final/1.0' } });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise(resolve => setTimeout(resolve, attempt * 1000));
    }
  }
  throw new Error(`Fetch failed for ${url}: ${lastError?.message || lastError}`);
}
function run(command, args) {
  const result = spawnSync(command, args, { cwd: ROOT, stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with ${result.status}`);
}

writeText(AUDIT_REL, await fetchText(AUDIT_REL));
writeText(REPORT_REL, await fetchText(REPORT_REL));
const audit = readJson(AUDIT_REL);
const candidate = audit.places?.[PLACE_ID];
if (!candidate || candidate.diagnostic?.usefulObservationCount !== 6) {
  throw new Error('Jettegrytene audit no longer has exactly six accepted observations');
}
const requestUrl = candidate.diagnostic.requestUrl;
const floraIds = ['emne_ved_einer', 'emne_ved_furu', 'emne_urt_rome', 'emne_flora_rosslyng', 'emne_siv_bjorneskjegg'];
const faunaIds = ['emne_fauna_blagratt_kveldfly'];

writeJson(FLORA_REL, [{
  id: 'emne_siv_bjorneskjegg',
  title: 'Bjørneskjegg',
  latin: 'Trichophorum cespitosum',
  taxonomy: {
    norsk_navn: 'Bjørneskjegg', latin_navn: 'Trichophorum cespitosum', klasse: 'Liliopsida',
    orden: 'Poales', familie: 'Cyperaceae', artskart_taxon_id: 138441
  },
  habitat: {
    biotop: ['myr', 'fuktig hei', 'kystlynghei', 'næringsfattig våtmark'],
    jord: ['sur, våt og næringsfattig torv- eller mineraljord'], lys: ['åpent'], fukt: ['fuktig til vått']
  },
  fenologi: {
    aktiv: ['vår', 'sommer', 'høst'],
    strategi: 'Tuedannende halvgras som tåler sur, våt og næringsfattig mark og er vanlig i myr og fuktig hei.'
  },
  kjennetegn: ['smale, stive strå i tette tuer', 'ett lite aks nær stråtoppen', 'brune til mørke aks', 'eldre bladrester danner et bustete tuepreg'],
  økologi: {
    rolle: ['tuedannende våtmarksplante', 'strukturart i myr og fuktig hei'],
    samspill: ['torvmoser', 'rome', 'røsslyng', 'sur våtmark']
  },
  bykontekst: {
    typiske_steder: ['Jettegrytene på Rullestad lokale analyseflate', 'fuktig hei', 'myrkant'],
    oslo_observert_typisk: 'Kortet er opprettet fra et presist Artskart-funn i History GO-stedets lokale analyseflate ved Jettegrytene på Rullestad.'
  },
  observasjonstips: ['Se etter stive tuer med ett lite mørkt aks på hvert strå.', 'Observer fra fast og trygg grunn; ikke tråkk ned myr- eller sigvegetasjon.'],
  source_urls: ['https://artsdatabanken.no/arter/takson/138441', requestUrl]
}]);

writeJson(FAUNA_REL, [{
  id: 'emne_fauna_blagratt_kveldfly',
  title: 'Blågrått kveldfly',
  latin: 'Acronicta cinerea',
  taxonomy: {
    norsk_navn: 'Blågrått kveldfly', latin_navn: 'Acronicta cinerea', klasse: 'Insecta',
    orden: 'Lepidoptera', familie: 'Noctuidae', artskart_taxon_id: 78526
  },
  habitat: {
    biotop: ['åpne biotoper', 'hei', 'skogkanter', 'bjørkebelte i fjellet'],
    jord: ['vegetasjonsdekt fastmark og hei'], lys: ['åpent til halvåpent'], fukt: ['tørr til frisk mark']
  },
  fenologi: {
    aktiv: ['midten av mai', 'juni', 'juli'],
    strategi: 'Nattaktiv sommerfugl der larven lever på ulike urter og lave busker i åpne biotoper.'
  },
  kjennetegn: ['vingespenn omtrent 32–38 millimeter', 'blågrå grunnfarge', 'mørkere tegninger på framvingene', 'hviler ofte med vingene taklagt over kroppen'],
  økologi: {
    rolle: ['planteetende larve', 'nattaktiv pollinator og byttedyr'],
    samspill: ['urter', 'lave busker', 'nattaktive predatorer', 'åpne heier']
  },
  bykontekst: {
    typiske_steder: ['Jettegrytene på Rullestad lokale analyseflate', 'åpen hei', 'skogkant'],
    oslo_observert_typisk: 'Kortet er opprettet fra et presist Artskart-funn i History GO-stedets lokale analyseflate ved Jettegrytene på Rullestad.'
  },
  observasjonstips: ['Se etter voksne individer i skumring eller ved lys fra midten av mai til juli.', 'Ikke fang eller håndter møllen; dokumenter med foto dersom den sitter rolig.'],
  source_urls: ['https://artsdatabanken.no/arter/takson/78526/beskrivelse', requestUrl]
}]);

const floraManifest = readJson('data/natur/flora/manifest.json');
if (!floraManifest.files.includes(FLORA_FILE)) floraManifest.files.push(FLORA_FILE);
writeJson('data/natur/flora/manifest.json', floraManifest);
const faunaManifest = readJson('data/natur/fauna/manifest.json');
if (!faunaManifest.files.includes(FAUNA_FILE)) faunaManifest.files.push(FAUNA_FILE);
writeJson('data/natur/fauna/manifest.json', faunaManifest);

const map = readJson(MAP_REL);
map.meta.version = '0.10.0';
map.meta.updatedAt = '2026-07-21';
if (!map.meta.sources.includes(requestUrl)) map.meta.sources.push(requestUrl);
map.places[PLACE_ID] = {
  flora: floraIds,
  fauna: faunaIds,
  documentation: 'Artskart-revisjonen fant seks presise observasjoner i den lokale 240-meters analyseflaten: einer, furu, rome, røsslyng, bjørneskjegg og blågrått kveldfly. Analyseflaten representerer History GO-stedet og er ikke en offisiell naturgrense.',
  species_audit: AUDIT_REL,
  analysis_scope: 'square_240m_from_canonical_place_anchor',
  unmatched_taxa_count: 0
};
writeJson(MAP_REL, map);

audit.meta.status = 'curated_and_published';
audit.meta.curatedAt = new Date().toISOString();
audit.meta.scopeNote = 'History GO local 240 m analysis square; not an official protected-area boundary.';
audit.places[PLACE_ID].curation = {
  accepted: [
    ...candidate.flora.map(item => ({ id: item.id, title: item.title, latin: item.latin, kind: 'flora', observationCount: item.count })),
    { id: 'emne_siv_bjorneskjegg', title: 'Bjørneskjegg', latin: 'Trichophorum cespitosum', kind: 'flora', taxonId: 138441 },
    { id: 'emne_fauna_blagratt_kveldfly', title: 'Blågrått kveldfly', latin: 'Acronicta cinerea', kind: 'fauna', taxonId: 78526 }
  ],
  rejectedNameVariants: ['cespitosum', 'cinerea'],
  unmatchedTaxaCount: 0
};
writeJson(AUDIT_REL, audit);

let report = fs.readFileSync(abs(REPORT_REL), 'utf8');
report += `\n## Kuratert resultat\n\n- Einer – *Juniperus communis* (\`emne_ved_einer\`)\n- Furu – *Pinus sylvestris* (\`emne_ved_furu\`)\n- Rome – *Narthecium ossifragum* (\`emne_urt_rome\`)\n- Røsslyng – *Calluna vulgaris* (\`emne_flora_rosslyng\`)\n- Bjørneskjegg – *Trichophorum cespitosum* (\`emne_siv_bjorneskjegg\`)\n- Blågrått kveldfly – *Acronicta cinerea* (\`emne_fauna_blagratt_kveldfly\`)\n\nNavnene \`cespitosum\` og \`cinerea\` er artsnavneledd fra de samme to observasjonene, ikke egne taxa. Alle seks aksepterte observasjoner har dermed kanoniske artskort.\n`;
writeText(REPORT_REL, report);

writeText(TEST_REL, `const assert = require('assert');
const fs = require('fs');
const path = require('path');
const repo = path.resolve(__dirname, '..');
const readJson = rel => JSON.parse(fs.readFileSync(path.join(repo, rel), 'utf8'));
const map = readJson('${MAP_REL}');
const entry = map.places.${PLACE_ID};
assert.deepStrictEqual(entry.flora, ${JSON.stringify(floraIds)});
assert.deepStrictEqual(entry.fauna, ${JSON.stringify(faunaIds)});
assert.strictEqual(entry.unmatched_taxa_count, 0);
const audit = readJson('${AUDIT_REL}');
assert.strictEqual(audit.meta.status, 'curated_and_published');
assert.strictEqual(audit.places.${PLACE_ID}.curation.accepted.length, 6);
assert.strictEqual(audit.places.${PLACE_ID}.curation.unmatchedTaxaCount, 0);
const flora = readJson('${FLORA_REL}');
const fauna = readJson('${FAUNA_REL}');
assert.strictEqual(flora[0].taxonomy.artskart_taxon_id, 138441);
assert.strictEqual(fauna[0].taxonomy.artskart_taxon_id, 78526);
console.log('Etne Jettegrytene nature round mapping OK');
`);

run('npx', ['tsx', 'tools/validate_nature_maps.mts']);
run('node', [TEST_REL]);
run('node', ['tests/etne-langfoss-nature-rounds.test.js']);
run('node', ['tests/etne-skano-nature-rounds.test.js']);
run('node', ['tests/etne-brattholmen-nature-rounds.test.js']);
run('node', ['tests/etne-saevareidberget-nature-rounds.test.js']);
run('node', ['tests/etne-langebudalen-nature-rounds.test.js']);
run('node', ['tests/etne-fish-species-rounds.test.js']);
run('node', ['tests/etne-nature-round-content.test.js']);
console.log(`Jettegrytene final conflict-free rebuild from ${SOURCE_COMMIT}`);
