import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const run = (command, args = []) => execFileSync(command, args, { stdio: 'inherit' });

const migrationPath = 'scripts/agent_sprakatlas_local_varieties_v2.py';
const oldNote = "'Atlaset er en faglig navigasjonsflate. De fire hovedområdene er svært grove dialektologiske '";
const newNote = "'Atlaset er en faglig navigasjonsflate, ikke et kart over faste språkgrenser. De fire hovedområdene er svært grove dialektologiske '";
let migration = fs.readFileSync(migrationPath, 'utf8');
if (!migration.includes(oldNote)) throw new Error('Fant ikke atlas-notatet som skal bevare grensegarantien');
migration = migration.replace(oldNote, newNote);
fs.writeFileSync(migrationPath, migration);

run('python3', [migrationPath]);
run('node', ['--check', 'js/ui/place-language-layer.js']);
run('node', ['--test', 'tests/place-language-dialect-scope.test.mjs']);
run('node', ['--test', 'tests/place-language-layer.test.mjs']);
run('python3', ['-m', 'json.tool', 'data/leksikon/sprak/norge_atlas_v1.json']);
run('python3', ['-m', 'json.tool', 'data/leksikon/sprak/atlas_schema_v1.json']);

for (const path of [
  '.github/workflows/agent-sprakatlas-local-varieties-v2.yml',
  'data/leksikon/sprak/norge_local_varieties_v1.json',
  'data/leksikon/sprak/local_varieties_schema_v1.json',
  migrationPath
]) {
  if (fs.existsSync(path)) fs.rmSync(path);
}
