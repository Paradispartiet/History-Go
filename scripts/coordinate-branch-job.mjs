import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const run = (command, args = []) => execFileSync(command, args, { stdio: 'inherit' });
const generatorPath = 'scripts/agent_sprakatlas_research_coverage_v1.py';

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
run('python3', ['-m', 'json.tool', 'data/leksikon/sprak/norge_atlas_v1.json']);
run('python3', ['-m', 'json.tool', 'data/leksikon/sprak/atlas_schema_v1.json']);
run('node', ['--check', 'js/ui/place-language-layer.js']);
run('node', ['--test', 'tests/place-language-dialect-scope.test.mjs']);
run('node', ['--test', 'tests/place-language-layer.test.mjs']);

if (fs.existsSync(generatorPath)) fs.rmSync(generatorPath);
