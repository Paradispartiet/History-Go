#!/usr/bin/env node
import { promises as fs } from 'node:fs';

const path = 'data/quiz/by/majorstua_sets.json';
const doc = JSON.parse(await fs.readFile(path, 'utf8'));
const questions = doc.sets.flatMap((set) => set.questions);
const question = questions.find((item) => item.quiz_id === 'by_majorstua_set_1_q5');

if (!question) throw new Error('Fant ikke by_majorstua_set_1_q5');
if (question.question !== 'Hva gjør Majorstua til mer enn bare et stasjonsområde?') {
  throw new Error(`Uventet utgangspunkt for q1_5: ${question.question}`);
}

question.question = 'Hvilke funksjoner samles på Majorstua i dag?';
await fs.writeFile(path, `${JSON.stringify(doc, null, 2)}\n`, 'utf8');
console.log('Normaliserte siste Majorstua-spørsmål uten å endre faginnhold eller fasit.');
