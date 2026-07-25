import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const root = process.cwd();
const legacyHook = 'his_historiebruk_minne';
const memorySiteHook = 'his_minnested_ritual_offentlig_sorg';
for (const relative of [
  'data/quiz/historie/grindheim_runestein_sets.json',
  'data/quiz/historie/grindheim_steinkross_sets.json',
  'data/quiz/historie/grindheimsveien_nord_gravfelt_sets.json'
]) {
  const file = path.join(root, relative);
  const before = fs.readFileSync(file, 'utf8');
  if (!before.includes(legacyHook)) throw new Error(`Expected legacy memory hook in ${relative}`);
  fs.writeFileSync(file, before.replaceAll(legacyHook, memorySiteHook));
}

const parts = [
  'scripts/.phase8-builder.gz.b64.00',
  'scripts/.phase8-builder.gz.b64.01'
];
const encoded = parts.map((file) => fs.readFileSync(path.join(root, file), 'utf8')).join('');
const source = zlib.gunzipSync(Buffer.from(encoded, 'base64')).toString('utf8');
const target = path.join('/tmp', 'history-phase8-builder.mjs');
fs.writeFileSync(target, source);
for (const file of parts) fs.rmSync(path.join(root, file));
await import(`file://${target}?v=${Date.now()}`);
