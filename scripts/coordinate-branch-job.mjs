import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const floraPath = 'data/natur/flora/karplanter_etne_langebudalen.json';
const flora = JSON.parse(fs.readFileSync(floraPath, 'utf8'));

for (const item of flora) {
  if (item.id === 'emne_siv_heisiv' || item.id === 'emne_urt_rome') {
    item.taxonomy.klasse = 'Liliopsida';
  }
}

fs.writeFileSync(floraPath, `${JSON.stringify(flora, null, 2)}\n`, 'utf8');

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with ${result.status}`);
}

run('npx', ['tsx', 'tools/validate_nature_maps.mts']);
run('node', ['tests/etne-langebudalen-nature-rounds.test.js']);
run('node', ['tests/etne-fish-species-rounds.test.js']);
run('node', ['tests/etne-nature-round-content.test.js']);

console.log('Langebudalen taxonomy and nature map validation OK');
