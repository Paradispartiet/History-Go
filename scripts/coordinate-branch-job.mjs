import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const run = (command, args = []) => execFileSync(command, args, { stdio: 'inherit' });
const generator = 'scripts/agent_sprakatlas_local_evidence_batch_2.py';

let source = fs.readFileSync(generator, 'utf8');
source = source.replace(
  "DOCS_PATH.write_text(docs + '\\n', encoding='utf-8')",
  "DOCS_PATH.write_text(docs.rstrip() + '\\n', encoding='utf-8')"
);
source = source.replace(
  "TEST_PATH.write_text(tests + '\\n', encoding='utf-8')",
  "TEST_PATH.write_text(tests.rstrip() + '\\n', encoding='utf-8')"
);
fs.writeFileSync(generator, source);

run('python3', [generator]);
run('python3', ['-m', 'json.tool', 'data/leksikon/sprak/norge_atlas_v1.json']);
run('python3', ['-m', 'json.tool', 'data/leksikon/sprak/atlas_schema_v1.json']);
run('node', ['--check', 'js/ui/place-language-layer.js']);
run('node', ['--test', 'tests/place-language-dialect-scope.test.mjs']);
run('node', ['--test', 'tests/place-language-layer.test.mjs']);

if (fs.existsSync(generator)) fs.rmSync(generator);
