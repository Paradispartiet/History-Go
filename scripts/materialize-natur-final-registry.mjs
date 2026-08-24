#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { composeNaturFinal } from './natur-final-phase-compose.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PATHS = {
  pensum: 'data/fag/natur/naturpensum_canonical_v4_5.json',
  emners: 'data/fag/natur/emner_natur_canonical_v4_5.json',
  methods: 'data/fag/natur/methods_natur_canonical_v4_5.json',
  fagkart: 'data/fag/natur/fagkart_natur_canonical_v4_5.json',
  mappings: 'data/fag/natur/emnemapping_natur_canonical_v4_5.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json'
};

const absolute = (relativePath) => path.join(ROOT, relativePath);
const readJson = (relativePath) => JSON.parse(fs.readFileSync(absolute(relativePath), 'utf8'));
const writeJson = (relativePath, value) => fs.writeFileSync(absolute(relativePath), `${JSON.stringify(value, null, 2)}\n`);

function main() {
  const registry = readJson(PATHS.registry);
  const status = readJson(PATHS.status);
  const statusIndex = (status.subjects || []).findIndex((entry) => entry.id === 'natur');
  if (statusIndex < 0) throw new Error('Natur mangler i subject_status.json.');

  const composed = composeNaturFinal({
    pensum: readJson(PATHS.pensum),
    emners: readJson(PATHS.emners),
    methodsDoc: readJson(PATHS.methods),
    fagkart: readJson(PATHS.fagkart),
    mappings: readJson(PATHS.mappings),
    registry,
    statusEntry: status.subjects[statusIndex]
  });

  const natur = composed.registry?.subjects?.natur;
  if (!natur) throw new Error('Natur mangler i komponert fagverkregister.');
  if (natur.chapters?.length !== 12) {
    throw new Error(`Forventet 12 materialiserte Natur-kapitler, fikk ${natur.chapters?.length ?? 0}.`);
  }
  if (!natur.chapters.some((chapter) => chapter.id === 'sopp_lav_mikroorganismer')) {
    throw new Error('Sopp, lav og mikroorganismer mangler i komponert Natur-register.');
  }

  status.subjects[statusIndex] = composed.statusEntry;
  writeJson(PATHS.registry, composed.registry);
  writeJson(PATHS.status, status);

  console.log(`Materialiserte Natur-sluttfasen statisk: ${natur.chapters.length}/12 kapitler, inkludert sopp/lav/mikroorganismer.`);
}

main();
