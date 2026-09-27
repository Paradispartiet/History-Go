#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');

const targets = [
  'data/Civication/narratives/leisure/scenekunst_scenekunstkurator.json',
  'data/Civication/roleWorlds/scenekunst/scenekunst_scenekunstkurator.json',
  'tests/civication-scenekunst-scenekunstkurator-authored-depth.test.js'
];

const replacements = [
  ['utlysningen_med_det_skjulte_nettverket', 'utlysningen_med_den_skjulte_kontaktkretsen'],
  ['nettverksnærhet', 'kontaktkretsnærhet'],
  ['nettverksanbefalingene', 'anbefalingene_fra_kontaktkretsen'],
  ['nettverk', 'kontaktkrets'],
  ['habilitetsprosedyre', 'habilitetsrutine'],
  ['utvalgsrettferdighet', 'utvalgsbalanse'],
  ['reise, rigg', 'transport, rigg']
];

for (const rel of targets) {
  const p = path.join(ROOT, rel);
  let s = fs.readFileSync(p, 'utf8');
  for (const [from, to] of replacements) s = s.split(from).join(to);
  fs.writeFileSync(p, s);
}

const stream = fs.readFileSync(path.join(ROOT, targets[0]), 'utf8').toLowerCase();
const forbiddenPairs = [
  ['scene', 'nettverk'],
  ['nettverk', 'prosedyre'],
  ['autonomi', 'rettferdighet'],
  ['reise', 'utsolgt']
];
for (const [a, b] of forbiddenPairs) {
  if (stream.includes(a) && stream.includes(b)) throw new Error(`thematic collision remains: ${a} + ${b}`);
}
console.log('Scenekunstkurator thematic source isolated');
