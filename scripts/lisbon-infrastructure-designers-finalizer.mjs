#!/usr/bin/env node
import fs from 'node:fs';

const file = 'data/people/naeringsliv/europe/portugal/lisbon/people_naeringsliv_lisbon.json';
const rows = JSON.parse(fs.readFileSync(file, 'utf8'));
const person = rows.find((row) => row?.id === 'santiago_calatrava');
if (!person) throw new Error('santiago_calatrava not found');
person.popupDesc = 'Santiago Calatrava er et presist personanker for Parque das Nações gjennom Gare do Oriente, den store intermodale stasjonen som koblet Expo ’98-området til tog, metro, buss og byens regionale transportsystem. Calatravas eget prosjektarkiv beskriver Oriente som Expoens primære transportforbindelse og som et sentralt grep i omformingen av Olivais-området. Parque das Nações beholdes derfor som primæranker, mens Estação do Oriente legges til som den mer presise fysiske arkitektur- og infrastrukturlokasjonen.';
fs.writeFileSync(file, `${JSON.stringify(rows, null, 2)}\n`, 'utf8');
fs.rmSync('scripts/lisbon-infrastructure-designers-finalizer.mjs');
console.log('Cleaned Calatrava popup formatting.');
