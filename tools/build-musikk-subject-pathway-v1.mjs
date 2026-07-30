#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = 'data/quiz/musikk/musikk_subject_pathways_v1.json';
const WRITE = process.argv.includes('--write');
const CHECK = process.argv.includes('--check');
if (!WRITE && !CHECK) throw new Error('Bruk --write eller --check');

const clean = (value) => String(value ?? '').trim();
const list = (value) => Array.isArray(value) ? value : [];
const normalize = (value) => clean(value).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
const slug = (value, max = 48) => normalize(value).replace(/\s+/g, '_').replace(/^_+|_+$/g, '').slice(0, max);
const digest = (value, length = 10) => createHash('sha256').update(clean(value), 'utf8').digest('hex').slice(0, length);
const stableId = (prefix, subjectId, value) => `${prefix}_${slug(subjectId, 24) || 'unknown'}_${slug(value, prefix === 'ku' ? 24 : 36) || 'item'}_${digest(`${subjectId}\0${normalize(value)}`)}`;
const jsonText = (value) => `${JSON.stringify(value, null, 2)}\n`;

const absolute = path.join(ROOT, FILE);
const original = fs.readFileSync(absolute, 'utf8');
const pkg = JSON.parse(original);
if (pkg.categoryId !== 'musikk' || pkg.subject_id !== 'musikk') throw new Error('Uventet subject-pathway-pakke');

let questionCount = 0;
for (const set of list(pkg.sets)) {
  for (const question of list(set.questions)) {
    questionCount += 1;
    const concepts = list(question.core_concepts).map(clean).filter(Boolean);
    const terms = list(question.terms).map(clean).filter(Boolean);
    const summary = clean(question.knowledge_payload?.summary);
    if (!concepts.length || !terms.length || !summary) throw new Error(`${question.id || questionCount}: mangler concepts/terms/knowledge summary`);
    question.concept_ids = concepts.map((value) => stableId('co', 'musikk', value));
    question.term_ids = terms.map((value) => stableId('term', 'musikk', value));
    question.primary_knowledge_unit_id = stableId('ku', 'musikk', summary);
    question.knowledge_unit_ids = [question.primary_knowledge_unit_id];
  }
}
if (questionCount !== 5) throw new Error(`Forventet 5 pilotspørsmål, fikk ${questionCount}`);

const next = jsonText(pkg);
if (next !== original) {
  if (WRITE) {
    fs.writeFileSync(absolute, next, 'utf8');
    console.log(`Musikk pathway-ID-er skrevet for ${questionCount} spørsmål.`);
  } else {
    console.error('Musikk pathway-ID-er er utdatert. Kjør node tools/build-musikk-subject-pathway-v1.mjs --write');
    process.exitCode = 1;
  }
} else {
  console.log(`Musikk pathway-ID-er OK for ${questionCount} spørsmål.`);
}
