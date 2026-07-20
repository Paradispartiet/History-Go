import fs from 'node:fs';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';

const parts = fs.readdirSync('scripts')
  .filter(name => name.startsWith('.nybrua-split-payload-'))
  .sort()
  .map(name => fs.readFileSync(`scripts/${name}`, 'utf8'));
if (!parts.length) throw new Error('Nybrua/Vaterlandsparken payload missing');

const target = '/tmp/nybrua-vaterlandsparken-split.mjs';
fs.writeFileSync(target, zlib.gunzipSync(Buffer.from(parts.join(''), 'base64')));
await import(`file://${target}`);

const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const placeDir = 'data/places/natur/oslo/places_oslo_natur_akerselvarute';
const aggregatePath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute.json';
const nybrua = readJson(`${placeDir}/nybrua_vaterlandsparken.json`);
const vaterlandsparken = readJson(`${placeDir}/vaterlandsparken.json`);
const aggregate = readJson(aggregatePath);
const legacyIndex = aggregate.findIndex(place => place?.id === nybrua.id);
if (legacyIndex < 0) throw new Error('Nybrua legacy row missing from Akerselva aggregate');
const cleanedAggregate = aggregate.filter(
  place => place?.id !== nybrua.id && place?.id !== vaterlandsparken.id,
);
cleanedAggregate.splice(legacyIndex, 0, nybrua, vaterlandsparken);
writeJson(aggregatePath, cleanedAggregate);

const run = (command, args) => execFileSync(command, args, { stdio: 'inherit' });
run('node', ['tests/nybrua-vaterlandsparken-split-rounds-batch1.test.js']);
run('npm', ['run', 'audit:people-of-places']);
run('npm', ['run', 'leksikon:ids:check']);
run('npm', ['run', 'typecheck:tools']);
run('npm', ['run', 'typecheck:web']);
run('git', ['diff', '--check']);
console.log('Nybrua/Vaterlandsparken split production job completed.');
