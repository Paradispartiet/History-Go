import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const PLACE_ID = 'langfoss_etne';
const MAP_REL = 'data/natur/nature_etne_place_map.json';
const PLACE_REL = 'data/places/natur/vestland/langfoss_etne.json';
const AUDIT_REL = 'reports/etne-natur-batch-6-langfoss-artskart-candidates.json';
const REPORT_REL = 'reports/etne-natur-batch-6-langfoss.md';
const FAUNA_FILE = 'oyenstikkere_etne_langfoss.json';
const FLORA_FILE = 'karplanter_etne_langfoss.json';
const FAUNA_REL = `data/natur/fauna/${FAUNA_FILE}`;
const FLORA_REL = `data/natur/flora/${FLORA_FILE}`;
const TEST_REL = 'tests/etne-langfoss-nature-rounds.test.js';
const NVE_URL = 'https://www.nve.no/vann-og-vassdrag/vassdragsforvaltning/verneplan-for-vassdrag/vestland/042-1-vaulaelva-m-langfossen/';

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
function run(command, args) {
  const result = spawnSync(command, args, { cwd: ROOT, stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with ${result.status}`);
}
async function fetchJson(url) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { Accept: 'application/json', 'user-agent': 'History-Go-Langfoss/1.0' } });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise(resolve => setTimeout(resolve, attempt * 1000));
    }
  }
  throw new Error(`Fetch failed for ${url}: ${lastError?.message || lastError}`);
}
async function lookupTaxonId(scientificName) {
  const url = `https://artsdatabanken.no/Api/Taxon/ScientificName?ScientificName=${encodeURIComponent(scientificName)}`;
  const payload = await fetchJson(url);
  const queue = [payload];
  while (queue.length) {
    const value = queue.shift();
    if (Array.isArray(value)) queue.push(...value);
    else if (value && typeof value === 'object') {
      const id = value.TaxonId ?? value.taxonId ?? value.TaxonID ?? value.taxonID;
      if (Number.isInteger(id)) return id;
      queue.push(...Object.values(value));
    }
  }
  throw new Error(`No Artsdatabanken taxon id for ${scientificName}`);
}

const audit = readJson(AUDIT_REL);
const candidate = audit.places?.[PLACE_ID];
if (!candidate || candidate.diagnostic?.usefulObservationCount !== 2) {
  throw new Error('Langfoss audit no longer has exactly two accepted observations');
}
const requestUrl = candidate.diagnostic.requestUrl;
const smallWhitefaceId = await lookupTaxonId('Leucorrhinia dubia');
const butterwortId = await lookupTaxonId('Pinguicula vulgaris');
if (butterwortId !== 62356) throw new Error(`Unexpected tettegras taxon id: ${butterwortId}`);

const faunaId = 'emne_fauna_smaatorvlibelle';
const floraId = 'emne_urt_tettegras';
writeJson(FAUNA_REL, [{
  id: faunaId,
  title: 'Småtorvlibelle',
  latin: 'Leucorrhinia dubia',
  taxonomy: {
    norsk_navn: 'Småtorvlibelle', latin_navn: 'Leucorrhinia dubia', klasse: 'Insecta',
    orden: 'Odonata', familie: 'Libellulidae', artskart_taxon_id: smallWhitefaceId
  },
  habitat: {
    biotop: ['små sure myrtjern', 'næringsfattige dammer', 'torv- og sumpvegetasjon'],
    jord: ['torv og sur våtmark'], lys: ['åpent til solrikt'], fukt: ['vann og permanent våtmark']
  },
  fenologi: {
    aktiv: ['sen vår', 'sommer'],
    strategi: 'Liten torvlibelle med flerårig vannlevende nymfestadium og flygende voksenstadium ved myrtjern og næringsfattige småvann.'
  },
  kjennetegn: ['lite og mørkt libellepreg', 'hvitt ansikt', 'små gule til røde ryggflekker', 'svart trekantflekk ved bakvingens basis'],
  økologi: {
    rolle: ['rovinsekt både som nymfe og voksen', 'del av våtmarkens insektfauna'],
    samspill: ['små vannlevende dyr', 'flygende insekter', 'myrtjern', 'sumpvegetasjon']
  },
  bykontekst: {
    typiske_steder: ['Langfoss lokale analyseflate', 'myrtjern', 'næringsfattige småvann'],
    oslo_observert_typisk: 'Kortet er opprettet fra et presist Artskart-funn i History GO-stedets lokale analyseflate ved Langfoss.'
  },
  observasjonstips: ['Se etter et lite mørkt individ med hvitt ansikt ved stille småvann, ikke i selve fossestrømmen.', 'Observer uten å tråkke i myrkant eller vannvegetasjon.'],
  source_urls: [`https://artsdatabanken.no/arter/takson/${smallWhitefaceId}`, requestUrl, NVE_URL]
}]);
writeJson(FLORA_REL, [{
  id: floraId,
  title: 'Tettegras',
  latin: 'Pinguicula vulgaris',
  taxonomy: {
    norsk_navn: 'Tettegras', latin_navn: 'Pinguicula vulgaris', klasse: 'Magnoliopsida',
    orden: 'Lamiales', familie: 'Lentibulariaceae', artskart_taxon_id: butterwortId
  },
  habitat: {
    biotop: ['fuktige berg', 'kildesig', 'myr', 'næringsfattig våtmark'],
    jord: ['våt og mineralfattig jord eller bergsig'], lys: ['åpent til halvskygge'], fukt: ['fuktig til vått']
  },
  fenologi: {
    aktiv: ['vår', 'sommer', 'høst'],
    strategi: 'Flerårig insektetende plante som supplerer næringsopptaket ved å fange små insekter på klebrige blad.'
  },
  kjennetegn: ['lav rosett av gulgrønne klebrige blad', 'fiolett blomst på lang stilk', 'bladkantene bøyer seg rundt fanget', 'vokser ofte i fuktige sig'],
  økologi: {
    rolle: ['insektetende karplante', 'våtmarksplante'],
    samspill: ['små insekter', 'kildesig', 'næringsfattig jord', 'moser']
  },
  bykontekst: {
    typiske_steder: ['Langfoss lokale analyseflate', 'fuktige bergsig', 'myr og kildepåvirket mark'],
    oslo_observert_typisk: 'Kortet er opprettet fra et presist Artskart-funn i History GO-stedets lokale analyseflate ved Langfoss.'
  },
  observasjonstips: ['Se etter den flate klebrige bladrosetten før du leter etter blomsten.', 'Ikke løsne planten fra fuktig berg eller myrkant.'],
  source_urls: [`https://artsdatabanken.no/arter/takson/${butterwortId}`, requestUrl, NVE_URL]
}]);

const faunaManifest = readJson('data/natur/fauna/manifest.json');
if (!faunaManifest.files.includes(FAUNA_FILE)) faunaManifest.files.push(FAUNA_FILE);
writeJson('data/natur/fauna/manifest.json', faunaManifest);
const floraManifest = readJson('data/natur/flora/manifest.json');
if (!floraManifest.files.includes(FLORA_FILE)) floraManifest.files.push(FLORA_FILE);
writeJson('data/natur/flora/manifest.json', floraManifest);

const map = readJson(MAP_REL);
map.meta.version = '0.9.0';
map.meta.updatedAt = '2026-07-21';
for (const source of [requestUrl, NVE_URL]) if (!map.meta.sources.includes(source)) map.meta.sources.push(source);
map.places[PLACE_ID] = {
  fauna: [faunaId],
  flora: [floraId],
  documentation: 'Artskart-revisjonen fant tre observasjoner i den lokale 320-meters analyseflaten. To besto år- og presisjonsfiltrene: småtorvlibelle og tettegras. Analyseflaten er History GO-stedets lokale spillområde og ikke en offisiell naturgrense.',
  species_audit: AUDIT_REL,
  analysis_scope: 'square_320m_from_canonical_place_anchor',
  unmatched_taxa_count: 0
};
writeJson(MAP_REL, map);

const places = readJson(PLACE_REL);
places[0].data_quality = {
  speciesSource: 'Artskart public API',
  speciesAudit: AUDIT_REL,
  analysisScope: '320 meter local square around canonical History GO area anchor',
  rawObservationCount: 3,
  acceptedObservationCount: 2,
  matchedFloraCount: 1,
  matchedFaunaCount: 1,
  unmatchedTaxaCount: 0,
  note: 'Local analysis surface, not an official protected-area boundary.'
};
writeJson(PLACE_REL, places);

audit.meta.status = 'curated_and_published';
audit.meta.curatedAt = new Date().toISOString();
audit.meta.scopeNote = 'History GO local 320 m analysis square; not an official protected-area boundary.';
audit.places[PLACE_ID].curation = {
  accepted: [
    { id: faunaId, title: 'Småtorvlibelle', latin: 'Leucorrhinia dubia', kind: 'fauna', taxonId: smallWhitefaceId },
    { id: floraId, title: 'Tettegras', latin: 'Pinguicula vulgaris', kind: 'flora', taxonId: butterwortId }
  ],
  rejectedNameVariants: ['dubia', 'vulgaris'],
  unmatchedTaxaCount: 0
};
writeJson(AUDIT_REL, audit);

let report = fs.readFileSync(abs(REPORT_REL), 'utf8');
report += `\n## Kuratert resultat\n\n- Småtorvlibelle – *Leucorrhinia dubia* (\`${faunaId}\`)\n- Tettegras – *Pinguicula vulgaris* (\`${floraId}\`)\n\nNavnene \`dubia\` og \`vulgaris\` er artsnavneledd fra de samme to observasjonene, ikke egne taxa. Alle aksepterte observasjoner har dermed kanoniske artskort.\n`;
writeText(REPORT_REL, report);

writeText(TEST_REL, `const assert = require('assert');
const fs = require('fs');
const path = require('path');
const repo = path.resolve(__dirname, '..');
const readJson = rel => JSON.parse(fs.readFileSync(path.join(repo, rel), 'utf8'));
const map = readJson('${MAP_REL}');
const entry = map.places.${PLACE_ID};
assert.deepStrictEqual(entry.fauna, ['${faunaId}']);
assert.deepStrictEqual(entry.flora, ['${floraId}']);
assert.strictEqual(entry.unmatched_taxa_count, 0);
const audit = readJson('${AUDIT_REL}');
assert.strictEqual(audit.meta.status, 'curated_and_published');
assert.strictEqual(audit.places.${PLACE_ID}.curation.accepted.length, 2);
assert.strictEqual(audit.places.${PLACE_ID}.curation.unmatchedTaxaCount, 0);
const fauna = readJson('${FAUNA_REL}');
const flora = readJson('${FLORA_REL}');
assert.strictEqual(fauna[0].latin, 'Leucorrhinia dubia');
assert(Number.isInteger(fauna[0].taxonomy.artskart_taxon_id));
assert.strictEqual(flora[0].taxonomy.artskart_taxon_id, 62356);
console.log('Etne Langfoss nature round mapping OK');
`);

run('npx', ['tsx', 'tools/validate_nature_maps.mts']);
run('node', [TEST_REL]);
run('node', ['tests/etne-skano-nature-rounds.test.js']);
run('node', ['tests/etne-brattholmen-nature-rounds.test.js']);
run('node', ['tests/etne-saevareidberget-nature-rounds.test.js']);
run('node', ['tests/etne-langebudalen-nature-rounds.test.js']);
run('node', ['tests/etne-fish-species-rounds.test.js']);
run('node', ['tests/etne-nature-round-content.test.js']);
console.log(`Langfoss species published with taxon ids ${smallWhitefaceId} and ${butterwortId}`);
