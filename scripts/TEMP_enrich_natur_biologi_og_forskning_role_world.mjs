#!/usr/bin/env node
import fs from 'node:fs';

const WORLD = 'data/Civication/roleWorlds/natur/natur_biologi_og_forskning.json';
const world = JSON.parse(fs.readFileSync(WORLD, 'utf8'));
const rep = world?.situated_reputation_model;
if (!rep || typeof rep.authority_separation !== 'string') {
  throw new Error('situated_reputation_model.authority_separation missing');
}

if (!/feltdata/i.test(rep.authority_separation)) {
  rep.authority_separation += ' Feltdata er prosjekt-eid evidens med eget prøvespor og kan ikke valideres, erstattes eller gjøres sannere av standing, senioritet, bestillerpress eller sosial tillit.';
}

const required = [
  /global/i,
  /evidens/i,
  /qualification_required/i,
  /relevant_education_or_employer_qualification/i,
  /academic_qualification_and_employment/i,
  /feltdata/i,
  /laborator/i,
  /etikk/i,
  /publisering/i,
  /politiske vedtak/i,
  /forvaltningsmyndighet/i,
  /History Go/i,
  /Badge/i
];
for (const term of required) {
  if (!term.test(rep.authority_separation)) {
    throw new Error(`authority_separation still missing ${term}`);
  }
}

fs.writeFileSync(WORLD, `${JSON.stringify(world, null, 2)}\n`);
console.log('Enriched Natur Role World authority separation with explicit feltdata boundary.');
