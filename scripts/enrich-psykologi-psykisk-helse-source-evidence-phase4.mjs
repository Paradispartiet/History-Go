#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CLAIMS_FILE = 'data/fagverk/psykologi/psykisk-helse-institusjoner-og-behandling/claims.json';
const STATUS_FILE = 'data/fagverk/subject_status.json';
const abs = (file) => path.join(ROOT, file);
const readJson = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
const assert = (ok, message) => { if (!ok) throw new Error(message); };

const sourceAdditions = [
  {
    id: 'src-helsenorge-hva-er',
    publisher: 'Helsenorge / Helsedirektoratet',
    title: 'Kva er psykisk helse?',
    url: 'https://www.helsenorge.no/psykisk-helse/hva-er-psykisk-helse/',
    source_location: 'innledningen og seksjonen Alle har ei psykisk helse',
    type: 'official_health',
    label: 'Helsenorge: hva psykisk helse er'
  },
  {
    id: 'src-helsedir-psykiatri',
    publisher: 'Helsedirektoratet',
    title: 'Psykiatri – kliniske læringsmål i spesialisthelsetjenesten',
    url: 'https://www.helsedirektoratet.no/autorisasjon-og-spesialistutdanning/spesialistutdanning-og-godkjenning-for-leger/lis1/lis1-laeringsmal/kliniske-laeringsmal-spesialisthelsetjenesten/psykiatri',
    source_location: 'læringsmålet om bipolaritet og unipolare depresjoner; utdypende tekst om samtalebehandling og biologisk behandling',
    type: 'official_professional_training',
    label: 'Helsedirektoratet: psykiatriens behandlingsformer'
  }
];

function upsertSource(sources, source) {
  const index = sources.findIndex((item) => item.id === source.id);
  if (index >= 0) sources[index] = source;
  else sources.push(source);
}

function replaceClaimSources(claims, id, sourceIds) {
  const claim = claims.find((item) => item.id === id);
  assert(claim, `Mangler claim ${id}`);
  claim.source_ids = sourceIds;
}

function main() {
  const claimsDoc = readJson(CLAIMS_FILE);
  assert(Array.isArray(claimsDoc.sources), 'Claims-dokumentet mangler sources');
  assert(Array.isArray(claimsDoc.claims), 'Claims-dokumentet mangler claims');
  for (const source of sourceAdditions) upsertSource(claimsDoc.sources, source);
  replaceClaimSources(claimsDoc.claims, 'phi-01', ['src-helsenorge-hva-er']);
  replaceClaimSources(claimsDoc.claims, 'phi-07', ['src-helsenorge-ebehandling', 'src-helsedir-psykiatri']);
  writeJson(CLAIMS_FILE, claimsDoc);

  const status = readJson(STATUS_FILE);
  const psykologi = status.subjects.find((item) => item.id === 'psykologi');
  assert(psykologi, 'Psykologi mangler i subject_status');
  psykologi.note = 'Psykologi har seks canonicale fagområder og 58 aktive emner. Første område, Psykisk helse, institusjoner og behandling, er nå materialisert som fulltekstkapittel med 12/12 emner, 18 canonicale metoder, 3 moduler, 9 seksjoner, 27 claimsporede fagavsnitt, 27 verifiserte claims og 23 inspiserbare kilderegistreringer. Diagnosevernet er bindende. Fem canonicale kapitler gjenstår.';
  writeJson(STATUS_FILE, status);

  assert(claimsDoc.sources.length === 23, `Forventet 23 kilderegistreringer etter evidensløft, fikk ${claimsDoc.sources.length}`);
  console.log('Strammet kildebevis for phi-01 og phi-07; 23 kilderegistreringer totalt.');
}

main();
