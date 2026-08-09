#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(ROOT, 'scripts/audit-fagverk-by-byliv-hendelser-midlertidighet-phase4.mjs');
let text = fs.readFileSync(file, 'utf8');
const oldGate = "  assert(sources.filter((row) => row.type?.startsWith('datert-')).every((row) => /^\\d{4}-\\d{2}-\\d{2}$/.test(row.published_at || '')), 'Daterte kilder mangler published_at');";
const newGate = "  assert(sources.filter((row) => row.published_at).every((row) => /^\\d{4}-\\d{2}-\\d{2}$/.test(row.published_at)), 'Oppgitt published_at har ugyldig datoformat');\n  assert(/^\\d{4}-\\d{2}-\\d{2}$/.test(sources.find((row) => row.id === 'bym07-sommergater-2023')?.published_at || ''), '2023-pressemeldingen mangler eksplisitt publiseringsdato');";
if (!text.includes(oldGate)) throw new Error('Fant ikke den overstrenge temporal-gaten');
text = text.replace(oldGate, newGate);
fs.writeFileSync(file, text);
console.log('By hendelser/midlertidighet: temporal gate skiller publiseringsdato fra historisk prosjektperiode.');
