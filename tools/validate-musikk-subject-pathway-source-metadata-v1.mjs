#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = 'data/quiz/musikk/musikk_subject_pathways_v1.json';
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, FILE), 'utf8'));
const list = (value) => Array.isArray(value) ? value : [];
const text = (value) => typeof value === 'string' ? value.trim() : '';

let pass = 0;
let fail = 0;
const errors = [];
const ok = (condition, message) => {
  if (condition) pass += 1;
  else { fail += 1; errors.push(message); }
};

const sets = list(pkg.sets);
const sourceById = new Map(list(pkg.sources).map((source) => [source.id, source]));
const questionIds = new Set();
for (const set of sets) {
  ok(list(set.questions).length === 5, `${set.set_id || set.emne_id || 'ukjent sett'}: forventet fem pathway-spørsmål`);
  for (const question of list(set.questions)) {
    ok(!questionIds.has(question.id), `${question.id}: duplikat question id`);
    questionIds.add(question.id);
    for (const source of list(question.source)) {
      const canonical = sourceById.get(source.source_id);
      ok(Boolean(canonical), `${question.id}: ukjent source_id ${source.source_id}`);
      if (!canonical) continue;
      ok(text(source.source_type) === text(canonical.type), `${question.id}/${source.source_id}: source_type er ikke canonical`);
      ok(text(source.title) === text(canonical.title), `${question.id}/${source.source_id}: title er ikke canonical`);
      if (text(canonical.publisher_or_author)) ok(text(source.publisher_or_author) === text(canonical.publisher_or_author), `${question.id}/${source.source_id}: publisher_or_author er ikke canonical`);
      if (text(canonical.date_or_version)) ok(text(source.date_or_version) === text(canonical.date_or_version), `${question.id}/${source.source_id}: date_or_version er ikke canonical`);
      if (text(canonical.url)) ok(text(source.url) === text(canonical.url), `${question.id}/${source.source_id}: url er ikke canonical`);
      if (text(canonical.use_mode)) ok(text(source.use_mode) === text(canonical.use_mode), `${question.id}/${source.source_id}: use_mode er ikke canonical`);
    }
  }
}

ok(sets.length >= 1, 'Musikk subject pathway må ha minst ett sett');
ok(questionIds.size === sets.length * 5, `forventet ${sets.length * 5} unike Musikk pathway-spørsmål`);

console.log(`Musikk pathway source metadata v1: ${pass} PASS, ${fail} FAIL`);
for (const error of errors) console.error(`FAIL: ${error}`);
if (fail) process.exitCode = 1;
