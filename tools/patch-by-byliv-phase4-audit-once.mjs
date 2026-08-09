#!/usr/bin/env node
import fs from 'node:fs';
const p='scripts/audit-fagverk-by-byliv-offentlige-rom-phase4.mjs';
let s=fs.readFileSync(p,'utf8');
const old=`  const principles = source.fagkart.principles || {};
  for (const key of ['context_before_theory', 'place_first', 'source_first', 'observable_first', 'no_generic_city_questions', 'accessibility_is_core', 'social_reading_is_core', 'no_invention_without_source']) {
    assert(principles[key] === true, \`By mangler bindende prinsipp: \${key}\`);
  }
`;
const replacement=`  const fagkartPrinciples = source.fagkart.principles || {};
  assert(fagkartPrinciples.locked_categories === true && fagkartPrinciples.no_new_main_categories === true, 'By-fagkartets strukturprinsipper er ikke låst');
  const qualityContractPath = CORE.resolveManifestPointer(manifest.by.qualityContract);
  const qualityContract = json(qualityContractPath);
  assert(qualityContract.status === 'canonical', 'By-kvalitetskontrakten er ikke canonical');
  const editorialPrinciples = new Set(qualityContract.editorial_principles || []);
  for (const principle of ['concrete place or event before abstraction', 'documented claim before theory', 'conflict and uncertainty must remain visible']) {
    assert(editorialPrinciples.has(principle), \`By mangler bindende editorial principle: \${principle}\`);
  }
  assert(qualityContract.source_contract?.canonical_files_are_guides_not_sources === true, 'By tillater feilaktig canonicalfiler som faktakilde');
  assert(qualityContract.source_contract?.no_empty_source_array_for_publishable_question === true, 'By mangler kildekrav for publiserbart innhold');
  assert((qualityContract.source_contract?.required_chain || []).join('>') === 'external_or_observed_source>claim>story_unit>question', 'By har feil source→claim→story→question-kjede');
`;
if(!s.includes(old)) throw new Error('Fant ikke gammel principle-gate i By Fase 4-audit');
s=s.replace(old,replacement);
s=s.replace('bySourceFirstAndObservableFirstLocked: true,','byEditorialAndSourceContractLocked: true,');
fs.writeFileSync(p,s);
console.log('By Fase 4-audit peker nå til canonical kvalitetskontrakt.');
