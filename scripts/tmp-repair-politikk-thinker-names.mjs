#!/usr/bin/env node
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const PATHS = Object.freeze({
  emner: 'data/fag/politikk/emner_politikk_canonical_v4_5.json',
  fagkart: 'data/fag/politikk/fagkart_politikk_canonical_v4_5.json',
  mappings: 'data/fag/politikk/emnemapping_politikk_canonical_v4_5.json',
  registry: 'data/fag/politikk/politikk_thinker_names.json'
});
const text = (value) => String(value ?? '').trim();
const properName = (value) => {
  const name = text(value);
  return Boolean(name && /[A-ZÆØÅ]/.test(name) && !name.includes('_'));
};
const readJson = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const writeJson = (path, value) => fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const readMainJson = (path) => JSON.parse(execFileSync('git', ['show', `origin/main:${path}`], { encoding: 'utf8' }));
const walk = (value, visit) => {
  if (Array.isArray(value)) return value.forEach((item) => walk(item, visit));
  if (!value || typeof value !== 'object') return;
  visit(value);
  for (const item of Object.values(value)) walk(item, visit);
};

const original = {
  emner: readMainJson(PATHS.emner),
  fagkart: readMainJson(PATHS.fagkart),
  mappings: readMainJson(PATHS.mappings)
};
const canonicalNames = new Map();
const add = (id, name) => {
  const key = text(id);
  const display = text(name);
  if (key && properName(display) && !canonicalNames.has(key)) canonicalNames.set(key, display);
};

walk(original.fagkart, (object) => {
  if (object.id && object.name) add(object.id, object.name);
  if (Array.isArray(object.thinker_ids) && Array.isArray(object.tenkere)) {
    object.thinker_ids.forEach((id, index) => add(id, object.tenkere[index]));
  }
  if (Array.isArray(object.norwegian_thinker_ids) && Array.isArray(object.norwegian_thinkers)) {
    object.norwegian_thinker_ids.forEach((id, index) => add(id, object.norwegian_thinkers[index]));
  }
});
for (const emne of original.emner) {
  (emne.canonical_thinker_ids || []).forEach((id, index) => add(id, emne.canonical_thinkers?.[index]));
  (emne.norwegian_thinker_ids || []).forEach((id, index) => add(id, emne.norwegian_thinkers?.[index]));
}
walk(original.mappings, (object) => {
  if (object.id && object.name) add(object.id, object.name);
  if (Array.isArray(object.thinker_ids) && Array.isArray(object.tenkere)) {
    object.thinker_ids.forEach((id, index) => add(id, object.tenkere[index]));
  }
  if (Array.isArray(object.norwegian_thinker_ids) && Array.isArray(object.norwegian_thinkers)) {
    object.norwegian_thinker_ids.forEach((id, index) => add(id, object.norwegian_thinkers[index]));
  }
});

const overrides = {
  alexis_de_tocqueville: 'Alexis de Tocqueville',
  amartya_sen: 'Amartya Sen',
  arend_lijphart: 'Arend Lijphart',
  charles_lindblom: 'Charles E. Lindblom',
  elinor_ostrom: 'Elinor Ostrom',
  fritz_scharpf: 'Fritz W. Scharpf',
  gosta_esping_andersen: 'Gøsta Esping-Andersen',
  gudmund_hernes: 'Gudmund Hernes',
  james_c_scott: 'James C. Scott',
  john_rawls: 'John Rawls',
  jurgen_habermas: 'Jürgen Habermas',
  kaare_strom: 'Kaare Strøm',
  kari_waerness: 'Kari Wærness',
  max_weber: 'Max Weber',
  michael_lipsky: 'Michael Lipsky',
  montesquieu: 'Montesquieu',
  nancy_fraser: 'Nancy Fraser',
  pierre_bourdieu: 'Pierre Bourdieu',
  robert_dahl: 'Robert Dahl',
  robert_keohane: 'Robert O. Keohane',
  sheila_jasanoff: 'Sheila Jasanoff',
  stein_rokkan: 'Stein Rokkan',
  theda_skocpol: 'Theda Skocpol'
};
for (const [id, name] of Object.entries(overrides)) canonicalNames.set(id, name);

const current = {
  emner: readJson(PATHS.emner),
  fagkart: readJson(PATHS.fagkart),
  mappings: readJson(PATHS.mappings)
};
const usedIds = new Set();
const resolve = (id) => {
  const key = text(id);
  if (!key) return '';
  usedIds.add(key);
  const name = canonicalNames.get(key);
  if (!name) throw new Error(`Mangler autoritativt visningsnavn for ${key}`);
  return name;
};

for (const emne of current.emner) {
  if (Array.isArray(emne.canonical_thinker_ids)) emne.canonical_thinkers = emne.canonical_thinker_ids.map(resolve);
  if (Array.isArray(emne.norwegian_thinker_ids)) emne.norwegian_thinkers = emne.norwegian_thinker_ids.map(resolve);
}
for (const document of [current.fagkart, current.mappings]) {
  walk(document, (object) => {
    if (object.id && Object.hasOwn(object, 'name')) object.name = resolve(object.id);
    if (Array.isArray(object.thinker_ids)) object.tenkere = object.thinker_ids.map(resolve);
    if (Array.isArray(object.norwegian_thinker_ids)) object.norwegian_thinkers = object.norwegian_thinker_ids.map(resolve);
  });
}

writeJson(PATHS.emner, current.emner);
writeJson(PATHS.fagkart, current.fagkart);
writeJson(PATHS.mappings, current.mappings);
writeJson(PATHS.registry, {
  schema: 'history_go_politikk_thinker_names_v1',
  version: '1.0.0',
  updatedAt: '2026-07-29',
  sourceRule: 'Visningsnavn følger opprinnelig canonical Politikk-fagkart og emnefiler på main; eksplisitte diakritiske rettelser overstyrer eldre råvarianter.',
  thinkers: Object.fromEntries([...usedIds].sort().map((id) => [id, resolve(id)]))
});
console.log(`Reparerte og låste ${usedIds.size} Politikk-tenkernavn.`);
