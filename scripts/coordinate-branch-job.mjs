import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const run = (command, args = []) => execFileSync(command, args, { stdio: 'inherit' });

run('python3', ['scripts/agent_sprakatlas_local_varieties_v2.py']);
run('node', ['--check', 'js/ui/place-language-layer.js']);
run('node', ['--test', 'tests/place-language-dialect-scope.test.mjs']);
run('node', ['--test', 'tests/place-language-layer.test.mjs']);
run('python3', ['-m', 'json.tool', 'data/leksikon/sprak/norge_atlas_v1.json']);
run('python3', ['-m', 'json.tool', 'data/leksikon/sprak/atlas_schema_v1.json']);

for (const path of [
  'data/leksikon/sprak/norge_local_varieties_v1.json',
  'data/leksikon/sprak/local_varieties_schema_v1.json',
  'scripts/agent_sprakatlas_local_varieties_v2.py'
]) {
  if (fs.existsSync(path)) fs.rmSync(path);
}
