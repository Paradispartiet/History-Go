#!/usr/bin/env node
import fs from 'node:fs';

const pensumPath = 'data/fag/politikk/politikkpensum_canonical_v4_5.json';
const emnePath = 'data/fag/politikk/emner_politikk_canonical_v4_5.json';
const methodsPath = 'data/fag/politikk/methods_politikk_canonical_v4_5.json';
const auditPath = 'scripts/audit-politikk-subject-quality.mjs';
const pensum = JSON.parse(fs.readFileSync(pensumPath, 'utf8'));
const emner = JSON.parse(fs.readFileSync(emnePath, 'utf8'));
const methodsDoc = JSON.parse(fs.readFileSync(methodsPath, 'utf8'));
const labels = new Map((pensum.domains || []).map((domain) => [domain.domain_id, domain.label]));
const seenDistinctions = new Set();

for (const emne of emner) {
  emne.area_id = emne.domain;
  emne.logic_family = emne.domain;
  emne.area_label = labels.get(emne.domain) || emne.area_label;
  let key = JSON.stringify((emne.critical_distinctions || []).map((value) => String(value).trim().toLowerCase()));
  if (seenDistinctions.has(key)) {
    const label = String(emne.title || emne.short_label || emne.emne_id).trim().toLowerCase();
    emne.critical_distinctions = [...(emne.critical_distinctions || []), `${label} som formell ordning vs ${label} som observert praksis`];
    emne.analysis_axes = [...emne.critical_distinctions];
    key = JSON.stringify(emne.critical_distinctions.map((value) => String(value).trim().toLowerCase()));
  }
  seenDistinctions.add(key);
}

for (const method of methodsDoc.methods || []) {
  if (!String(method.description || '').toLowerCase().includes('metoden brukes når konkrete institusjoner')) continue;
  const title = String(method.title || method.label || method.method_id).trim();
  const question = String(method.analytical_question || '').trim();
  const data = (method.data_forms || []).slice(0, 3).join(', ');
  method.description = `${title} undersøker et avgrenset politisk problem gjennom ${data}. ${question || 'Metoden skiller dokumenterte mekanismer, institusjonelle regler og observerbare utfall fra alternative forklaringer.'}`;
}

fs.writeFileSync(emnePath, `${JSON.stringify(emner, null, 2)}\n`);
fs.writeFileSync(methodsPath, `${JSON.stringify(methodsDoc, null, 2)}\n`);
const audit = fs.readFileSync(auditPath, 'utf8').replaceAll('emners', 'emner');
fs.writeFileSync(auditPath, audit);
console.log('Politikk-etterkontroll fullført.');
