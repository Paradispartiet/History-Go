#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const FILE = path.join(ROOT, 'reports/oslo-blue-signs-phase2-2026/intake.json');
const intake = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const eyde = intake.candidates.find(row => row.id === 'bla_skilt_eyde_birkeland_boltedlokka_alle_10' || row.subject === 'Sam Eyde og Kristian Birkeland');
if (!eyde) throw new Error('Eyde/Birkeland candidate missing from phase 2 intake');
eyde.id = 'bla_skilt_eyde_birkeland_bolteloekka_alle_10';

const thekla = intake.candidates.find(row => row.id === 'bla_skilt_thekla_resvoll_bestum_tverrvei_1');
if (!thekla) throw new Error('Thekla Resvoll candidate missing from phase 2 intake');
thekla.sourceUrl = 'https://www.oslobyesvel.no/s/Arsberetning2024-nettside.pdf';
thekla.secondarySourceUrl = 'https://www.oslobyesvel.no/12kvinner';

fs.writeFileSync(FILE, `${JSON.stringify(intake, null, 2)}\n`);
console.log('Blue-sign phase 2 intake normalized: canonical Eyde/Birkeland slug and Thekla direct source locked.');
