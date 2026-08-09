#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const at = (p) => path.join(ROOT, p);
const OLD = 'em_by_sittekanter_trapper_uformelle_soner';
const NEXT = 'em_by_smaprat_blikk_sosial_koreografi';
const files = [
  'data/fagverk/by/byliv-sosial-offentlighet.json',
  'data/fagverk/by/byliv-sosial-offentlighet/brief.json',
  'scripts/audit-fagverk-by-byliv-sosial-offentlighet-phase4.mjs',
  'tools/materialize-by-byliv-sosial-offentlighet-phase4-once.mjs'
];

for (const file of files) {
  const full = at(file);
  let text = fs.readFileSync(full, 'utf8');
  if (!text.includes(OLD)) throw new Error(`${file} mangler forventet feilklassifisert emne-ID`);
  text = text.split(OLD).join(NEXT);
  fs.writeFileSync(full, text);
}

const rootPath = 'data/fagverk/by/byliv-sosial-offentlighet.json';
let root = fs.readFileSync(at(rootPath), 'utf8');
const oldObjective = 'analysere sittekanter, trapper og andre uformelle soner som bruksmuligheter uten å anta at de faktisk brukes';
const newObjective = 'analysere småprat, blikk og sosial koreografi som observerbar samhandling uten å anta relasjoner eller motiv';
if (!root.includes(oldObjective)) throw new Error('Kapittelroot mangler forventet læringsmål');
root = root.replace(oldObjective, newObjective);
fs.writeFileSync(at(rootPath), root);

const briefPath = 'data/fagverk/by/byliv-sosial-offentlighet/brief.json';
let brief = fs.readFileSync(at(briefPath), 'utf8');
const oldArc = 'skille folkemengde fra samtilstedeværelse og sosial interaksjon';
const newArc = 'skille folkemengde fra samtilstedeværelse og sosial interaksjon, inkludert småprat, blikk og sosial koreografi';
if (!brief.includes(oldArc)) throw new Error('Brief mangler forventet læringsbue');
brief = brief.replace(oldArc, newArc);
const oldInterviewBoundary = 'intervju- eller brukerperspektiv presentert som om datainnsamling faktisk er gjennomført når den bare undervises som metode';
const newInterviewBoundary = 'intervju- eller brukerperspektiv presentert som gjennomført datainnsamling når intervju ikke er gjennomført og metoden bare undervises';
if (!brief.includes(oldInterviewBoundary)) throw new Error('Brief mangler forventet intervjuavgrensning');
brief = brief.replace(oldInterviewBoundary, newInterviewBoundary);
fs.writeFileSync(at(briefPath), brief);

const modulePath = 'data/fagverk/by/byliv-sosial-offentlighet/01-grunnlag.json';
let module = fs.readFileSync(at(modulePath), 'utf8');
const oldSentence = 'I felt betyr det at du kan registrere nærhet, stopp, gjentatte mønstre og synlig samhandling, men ikke tilskrive relasjoner eller betydning uten mer direkte brukerdata.';
const newSentence = 'I felt betyr det at du kan registrere nærhet, stopp, gjentatte mønstre, småprat, blikk og annen synlig sosial koreografi, men ikke tilskrive relasjoner eller betydning uten mer direkte brukerdata.';
if (!module.includes(oldSentence)) throw new Error('Grunnlagsmodulen mangler forventet sosial-interaksjonssetning');
module = module.replace(oldSentence, newSentence);
fs.writeFileSync(at(modulePath), module);

console.log(`By sosial offentlighet: erstattet ${OLD} med canonicalt Byliv-emne ${NEXT}, synkronisert redaksjonell dekning og presisert intervjuporten.`);
