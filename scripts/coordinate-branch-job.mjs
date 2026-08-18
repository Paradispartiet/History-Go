import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const run = (command, args = []) => execFileSync(command, args, { stdio: 'inherit' });
const generator = 'scripts/agent_sprakatlas_local_evidence_batch_2.py';

run('python3', [generator]);
run('python3', ['-m', 'json.tool', 'data/leksikon/sprak/norge_atlas_v1.json']);
run('python3', ['-m', 'json.tool', 'data/leksikon/sprak/atlas_schema_v1.json']);
run('node', ['--check', 'js/ui/place-language-layer.js']);
run('node', ['--test', 'tests/place-language-dialect-scope.test.mjs']);
run('node', ['--test', 'tests/place-language-layer.test.mjs']);

if (fs.existsSync(generator)) fs.rmSync(generator);
