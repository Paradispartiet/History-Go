#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const writeJson = (p, value) => fs.writeFileSync(path.join(ROOT, p), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const registry = readJson('data/fagverk/filosofi/filosofi_article_registry_v1.json');
const repaired = [];

for (const row of registry.articles) {
  const article = readJson(row.file);
  const theory = article.sections.find((section) => section.id === 'teorihistorie');
  if (!theory) continue;

  let changed = false;
  theory.paragraphs = (theory.paragraphs || []).map((paragraph) => {
    let next = paragraph;
    for (const work of article.primary_work_refs || []) {
      const escapedWork = escapeRegExp(work);
      const malformedPrefix = new RegExp(`\\b(?:[A-ZÆØÅ]\\.\\s*)+(?=${escapedWork}\\s+brukes som primæranker for\\s{2,})`, 'gu');
      next = next.replace(malformedPrefix, '');
    }
    next = next.replace(/brukes som primæranker for\s{2,}/gu, 'brukes som primæranker for ');
    if (next !== paragraph) changed = true;
    return next;
  });

  const remaining = theory.paragraphs.join(' ');
  if (/brukes som primæranker for\s{2,}/u.test(remaining)) {
    throw new Error(`${article.id}: unresolved double-space primary-anchor join`);
  }

  if (changed) {
    writeJson(row.file, article);
    repaired.push(article.id);
  }
}

console.log(JSON.stringify({ repaired_theory_join_artifacts: repaired.length, articles: repaired }, null, 2));
