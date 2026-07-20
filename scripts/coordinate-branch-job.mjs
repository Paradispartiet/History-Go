import fs from 'node:fs';
import zlib from 'node:zlib';

const parts = ['00','01','02','03'].map(part => fs.readFileSync(`scripts/.vaterland-historisk-elvelop-payload-${part}`, 'utf8'));
const target = '/tmp/vaterland-historisk-elvelop-production.mjs';
fs.writeFileSync(target, zlib.gunzipSync(Buffer.from(parts.join(''), 'base64')));
await import(`file://${target}`);
console.log('Vaterland historical river course coordinate-runner job completed.');
