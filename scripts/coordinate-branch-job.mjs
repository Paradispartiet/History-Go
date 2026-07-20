import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const run = (command, args, options = {}) => execFileSync(command, args, { encoding: 'utf8', ...options });

const peopleManifestPath = 'data/people/manifest.json';
const mainPeopleManifest = JSON.parse(run('git', ['show', 'origin/main:data/people/manifest.json']));
const newPeopleFile = 'people/by/oslo/akerselva/people_nybrua_vaterlandsparken.json';
mainPeopleManifest.files = [...mainPeopleManifest.files.filter(file => file !== newPeopleFile), newPeopleFile];
writeJson(peopleManifestPath, mainPeopleManifest);

const invalidEmne = 'em_by_byrom_og_bevegelse';
const splitPath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute/nybrua_vaterlandsparken.json';
const aggregatePath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute.json';
const nybrua = readJson(splitPath);
nybrua.emne_ids = (nybrua.emne_ids || []).filter(id => id !== invalidEmne);
writeJson(splitPath, nybrua);

const aggregate = readJson(aggregatePath);
const aggregateNybrua = aggregate.find(place => place?.id === 'nybrua_vaterlandsparken');
if (!aggregateNybrua) throw new Error('Nybrua missing from Akerselva aggregate');
aggregateNybrua.emne_ids = (aggregateNybrua.emne_ids || []).filter(id => id !== invalidEmne);
writeJson(aggregatePath, aggregate);

run('node', ['tests/nybrua-vaterlandsparken-split-rounds-batch1.test.js'], { stdio: 'inherit' });
run('bash', ['scripts/check-people.sh'], { stdio: 'inherit' });
run('bash', ['scripts/check-places.sh'], { stdio: 'inherit' });
run('git', ['diff', '--check'], { stdio: 'inherit' });
console.log('Nybrua People order and emne contract fixed.');
