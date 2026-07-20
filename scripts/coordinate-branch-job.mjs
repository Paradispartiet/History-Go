import fs from 'node:fs';
import zlib from 'node:zlib';

const paths = [
  'scripts/.vaterland-historisk-elvelop-payload-00',
  'scripts/.vaterland-historisk-elvelop-payload-01a',
  'scripts/.vaterland-historisk-elvelop-payload-01b',
  'scripts/.vaterland-historisk-elvelop-payload-01c',
  'scripts/.vaterland-historisk-elvelop-payload-01d',
  'scripts/.vaterland-historisk-elvelop-payload-02',
  'scripts/.vaterland-historisk-elvelop-payload-03',
];
const target = '/tmp/vaterland-historisk-elvelop-production.mjs';
fs.writeFileSync(target, zlib.gunzipSync(Buffer.from(paths.map(file => fs.readFileSync(file, 'utf8')).join(''), 'base64')));
await import(`file://${target}`);
console.log('Vaterland historical river course coordinate-runner job completed.');
