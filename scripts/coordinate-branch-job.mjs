import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const run = (command, args = []) => execFileSync(command, args, { stdio: 'inherit' });
const generatorPath = 'scripts/agent_sprakatlas_research_coverage_v1.py';
const atlasPath = 'data/leksikon/sprak/norge_atlas_v1.json';
const testPath = 'tests/place-language-dialect-scope.test.mjs';
const docsPath = 'docs/SPRAKLEKSIKON.md';

let generator = fs.readFileSync(generatorPath, 'utf8');
generator = generator.replace(
  'for (const source of row.sources) assert.match(String(source?.url || ""), /^https:\\\\/\\\\//, `${row.id}: kilden må være HTTPS`);',
  'for (const source of row.sources) assert.ok(String(source?.url || "").startsWith("https://"), `${row.id}: kilden må være HTTPS`);'
);
generator = generator.replace(
  'Profilen gjelder norsk talemål i et historisk flerspråklig område; samisk og kvensk/finsk hører hjemme i egne språklag.',
  'Profilen gjelder norsk talemål i et historisk flerspråklig område; samiske språk og kvensk/finsk er egne språk og skal ikke modelleres som norsk dialekt.'
);
fs.writeFileSync(generatorPath, generator);

run('python3', [generatorPath]);

const atlas = JSON.parse(fs.readFileSync(atlasPath, 'utf8'));
const secondarySources = {
  valdresmal: { label: 'Store norske leksikon – dialekter i Oppland', url: 'https://snl.no/dialekter_i_Oppland' },
  austfinnmarksmal: { label: 'Store norske leksikon – dialekter og språk i Finnmark', url: 'https://snl.no/dialekter_og_spr%C3%A5k_i_Finnmark' },
  indre_finnmarksmal: { label: 'Store norske leksikon – dialekter og språk i Finnmark', url: 'https://snl.no/dialekter_og_spr%C3%A5k_i_Finnmark' },
  vestfinnmarksmal: { label: 'Store norske leksikon – dialekter og språk i Finnmark', url: 'https://snl.no/dialekter_og_spr%C3%A5k_i_Finnmark' },
  nordtromsmal: { label: 'Store norske leksikon – dialekter og språk i Troms', url: 'https://snl.no/dialekter_og_spr%C3%A5k_i_Troms' },
  midttromsmal: { label: 'Store norske leksikon – dialekter og språk i Troms', url: 'https://snl.no/dialekter_og_spr%C3%A5k_i_Troms' },
  senjamal: { label: 'Store norske leksikon – dialekter og språk i Troms', url: 'https://snl.no/dialekter_og_spr%C3%A5k_i_Troms' },
  indre_tromsmal: { label: 'Store norske leksikon – dialekter og språk i Troms', url: 'https://snl.no/dialekter_og_spr%C3%A5k_i_Troms' },
  sor_troms_vesteralen_ofoten: { label: 'Store norske leksikon – nordnorsk', url: 'https://snl.no/nordnorsk' },
  lofotmal: { label: 'Store norske leksikon – dialekter i Nordland', url: 'https://snl.no/dialekter_i_Nordland' },
  saltenmal: { label: 'Store norske leksikon – dialekter i Nordland', url: 'https://snl.no/dialekter_i_Nordland' },
  ranamal: { label: 'Store norske leksikon – dialekter i Nordland', url: 'https://snl.no/dialekter_i_Nordland' },
  vefsnmal: { label: 'Store norske leksikon – dialekter i Nordland', url: 'https://snl.no/dialekter_i_Nordland' },
  bronnoymal: { label: 'Store norske leksikon – dialekter i Nordland', url: 'https://snl.no/dialekter_i_Nordland' }
};
for (const region of atlas.dialect_regions || []) {
  if ((region.sources || []).length >= 2) continue;
  const source = secondarySources[region.id];
  if (!source) throw new Error(`${region.id}: mangler eksplisitt sekundærkilde i research-runneren`);
  region.sources = [...(region.sources || []), source];
}
fs.writeFileSync(atlasPath, JSON.stringify(atlas, null, 2) + '\n');

let testSource = fs.readFileSync(testPath, 'utf8');
testSource = testSource.split('\n').map(line => {
  if (line.includes('Nordisk dialektkorpus-dekningen må være eksplisitt')) {
    return '  assert.ok(coverage.includes("ndc_v4") && coverage.includes("111"), "Nordisk dialektkorpus-dekningen må være eksplisitt");';
  }
  if (line.includes('LIA-dekningen må være eksplisitt')) {
    return '  assert.ok(coverage.includes("lia_norsk") && coverage.includes("227"), "LIA-dekningen må være eksplisitt");';
  }
  if (line.includes('UiTs nordnorske mellomnivå må være eksplisitt')) {
    return '  assert.ok(coverage.includes("uit_nordnorsk") && coverage.includes("13"), "UiTs nordnorske mellomnivå må være eksplisitt");';
  }
  return line;
}).join('\n');
fs.writeFileSync(testPath, testSource);

// Repoets diff-port krever nøyaktig én avsluttende newline, ikke en ekstra blanklinje.
fs.writeFileSync(docsPath, fs.readFileSync(docsPath, 'utf8').trimEnd() + '\n');

run('python3', ['-m', 'json.tool', atlasPath]);
run('python3', ['-m', 'json.tool', 'data/leksikon/sprak/atlas_schema_v1.json']);
run('node', ['--check', 'js/ui/place-language-layer.js']);
run('node', ['--test', testPath]);
run('node', ['--test', 'tests/place-language-layer.test.mjs']);

if (fs.existsSync(generatorPath)) fs.rmSync(generatorPath);
