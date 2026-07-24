import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = process.cwd();
const expected = [
  [3000, '92381ae48aeac483787a209e51dda8ead3cf818a729132acbd5e541c98fbe36f'],
  [3000, '8e2143d4160c51dd65b8f88f4eedf657c1ca22d6b552b81d04e8d83e3470344e'],
  [3000, 'f0b4f13460a16a012b2a4d4ada6f8149dc0fe1c4aa775e8809bfe17abc59f29b'],
  [3000, 'fea4be428285597572d5a31823c6ec0d6f3e17d958a3103e620485cc1c316b44'],
  [3000, '0759a3131d88efd605d0bf094d8eaa0c13350d35c9b7193070e5c0957867887d'],
  [3000, 'bb692fd07b7688d7e8fdfb009af9957d558e3c854bd1aa48a6fdc7c3c98c0d93'],
  [2800, 'f6e4afb06810a4bdf4cfca19a81fda9cb226e33c37a7631b2793fe8899c54845'],
];
let failed = false;
for (let index = 0; index < expected.length; index += 1) {
  const part = String(index + 1).padStart(2, '0');
  const file = path.resolve(root, `tools/.build-historie-industri-phase4.part${part}`);
  const content = fs.readFileSync(file, 'utf8').trim();
  const sha = createHash('sha256').update(content).digest('hex');
  const [expectedLength, expectedSha] = expected[index];
  const ok = content.length === expectedLength && sha === expectedSha;
  console.log(`part${part} | length ${content.length}/${expectedLength} | sha ${sha} | ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) failed = true;
}
if (failed) throw new Error('One or more phase 4 builder chunks differ from the compiled local source.');
