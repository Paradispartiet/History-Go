#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const at = (p) => path.join(ROOT, p);
const chapter = JSON.parse(fs.readFileSync(at('data/fagverk/by/byliv-hendelser-midlertidighet.json'), 'utf8'));
const claimsPath = 'data/fagverk/by/byliv-hendelser-midlertidighet/claims.json';
const claimsDoc = JSON.parse(fs.readFileSync(at(claimsPath), 'utf8'));
const refs = new Map((claimsDoc.claims || []).map((claim) => [claim.id, []]));

for (const moduleFile of chapter.moduleFiles || []) {
  const module = JSON.parse(fs.readFileSync(at(moduleFile), 'utf8'));
  for (const section of module.sections || []) {
    const ids = new Set([
      ...(section.paragraphClaimIds || []).flat(Infinity),
      ...(section.keyPointClaimIds || []).flat(Infinity)
    ].filter((id) => typeof id === 'string'));
    for (const id of ids) {
      if (!refs.has(id)) throw new Error(`${section.id} peker til ukjent claim ${id}`);
      refs.get(id).push(section.id);
    }
  }
}

for (const claim of claimsDoc.claims || []) {
  const used = refs.get(claim.id) || [];
  if (!used.length) throw new Error(`${claim.id} er orphan claim uten faktisk seksjonsbruk`);
  claim.used_in = used;
}

fs.writeFileSync(at(claimsPath), `${JSON.stringify(claimsDoc, null, 2)}\n`);
console.log(`By hendelser/midlertidighet: synkroniserte used_in for ${claimsDoc.claims.length} claims fra faktiske seksjonsreferanser.`);
