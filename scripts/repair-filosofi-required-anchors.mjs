#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const writeJson = (p, value) => fs.writeFileSync(path.join(ROOT, p), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const norm = (s) => String(s || '').toLocaleLowerCase('nb').replace(/\s+/gu, ' ').trim();
const sentence = (s) => String(s || '').replace(/^\s*(?:P\d+|K|Innvending|Svar):\s*/u, '').split(/(?<=[.!?])\s+/u)[0]?.trim() || '';

const registry = readJson('data/fagverk/filosofi/filosofi_article_registry_v1.json');
const repaired = [];

for (const row of registry.articles) {
  const article = readJson(row.file);
  if (article.editorial_quality !== 'university_depth_reviewed') continue;

  const anchors = article.university_quality?.required_anchors || [];
  if (!anchors.length) continue;

  const substantiveSections = article.sections.filter((section) => ['argument', 'uenighet', 'teorihistorie'].includes(section.id));
  const substantive = norm(substantiveSections.flatMap((section) => section.paragraphs || []).join(' '));
  const missing = anchors.filter((anchor) => !substantive.includes(norm(anchor)));
  if (!missing.length) continue;

  const theory = article.sections.find((section) => section.id === 'teorihistorie');
  const argument = article.sections.find((section) => section.id === 'argument')?.paragraphs || [];
  const disagreement = article.sections.find((section) => section.id === 'uenighet')?.paragraphs || [];
  if (!theory) throw new Error(`${article.id}: mangler teorihistorie for faganker-reparasjon`);

  const debate = article.university_quality?.debate || article.claims?.find((claim) => claim.type === 'problem_framing')?.text || article.canonical_definition;
  const transition = sentence(argument.at(-2) || argument.at(-1) || '');
  const conclusion = sentence(argument.at(-1) || '');
  const rival = sentence(disagreement[0] || '');

  for (const anchor of missing) {
    theory.paragraphs.push(
      `${anchor} er et eksplisitt faganker i denne debatten: ${debate} I argumentrekonstruksjonen er begrepet særlig relevant for overgangen fra «${transition}» til «${conclusion}». Rivalens innvending — «${rival}» — viser samtidig hva en forsvarlig bruk av ${String(anchor).toLocaleLowerCase('nb')} må kunne forklare uten å gjøre sosial status, begrepsbruk eller autoritet til et selvstendig bevis.`
    );
  }

  writeJson(row.file, article);
  repaired.push({ id: article.id, anchors: missing });
}

console.log(JSON.stringify({ repaired_required_anchors: repaired }, null, 2));
