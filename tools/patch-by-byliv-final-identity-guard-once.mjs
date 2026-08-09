#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(ROOT, 'scripts/audit-fagverk-by-byliv-rytmer-miks-konflikt-phase4.mjs');
let text = fs.readFileSync(file, 'utf8');
const oldLine = "  for (const unsafeInference of ['så ut som muslim', 'så ut som innvandrer', 'så ut som rik', 'så ut som fattig', 'antatt etnisitet']) assert(!rawText.includes(unsafeInference), `Kapittelet inneholder sensitiv identitetsinferens: ${unsafeInference}`);";
const newLine = "  for (const unsafeInference of ['så ut som muslim', 'så ut som innvandrer', 'så ut som rik', 'så ut som fattig', 'vi registrerte etnisitet', 'vi klassifiserte etnisitet']) assert(!rawText.includes(unsafeInference), `Kapittelet inneholder sensitiv identitetsinferens: ${unsafeInference}`);";
if (!text.includes(oldLine)) throw new Error('Fant ikke overbred identitetsvakt');
text = text.replace(oldLine, newLine);
fs.writeFileSync(file, text);
console.log('Siste Byliv: identitetsvakten blokkerer faktiske inferenser uten å straffe eksplisitte forbudstekster.');
