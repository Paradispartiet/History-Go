import fs from 'node:fs';
import zlib from 'node:zlib';

const payloadPath = 'scripts/.vaterland-historisk-elvelop-payload';
if (!fs.existsSync(payloadPath)) throw new Error('Vaterland payload missing');
const target = '/tmp/vaterland-historisk-elvelop-production.mjs';
fs.writeFileSync(target, zlib.gunzipSync(Buffer.from(fs.readFileSync(payloadPath, 'utf8'), 'base64')));
await import(`file://${target}`);
console.log('Vaterland historical river course coordinate-runner job completed.');
// explicit production trigger
