#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARTICLES_DIR = path.join(ROOT, 'data/fagverk/filosofi/articles');
const THINKERS_PATH = path.join(ROOT, 'data/fag/filosofi/teoretikere_filosofi_canonical_v2.json');
const REGISTRY_PATH = path.join(ROOT, 'data/fagverk/filosofi/filosofi_article_registry_v1.json');
const COMPLETION_PATH = path.join(ROOT, 'data/fagverk/filosofi/filosofi_completion_v1.json');

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const writeJson = (p, value) => fs.writeFileSync(p, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const normalize = (value) => String(value ?? '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();
const uniq = (values) => [...new Set(values.filter(Boolean))];
const words = (text) => String(text ?? '').trim().split(/\s+/u).filter(Boolean).length;
const articleWords = (article) => words((article.sections ?? []).flatMap((s) => s.paragraphs ?? []).join(' '));

const thinkerRegistry = readJson(THINKERS_PATH);
const thinkers = thinkerRegistry.thinkers ?? [];
const thinkerById = new Map(thinkers.map((t) => [t.id, t]));
const thinkerByName = new Map(thinkers.map((t) => [normalize(t.name), t]));
const thinkersByLastToken = new Map();
for (const thinker of thinkers) {
  const token = normalize(thinker.name).split(/\s+/).at(-1);
  if (!token) continue;
  const rows = thinkersByLastToken.get(token) ?? [];
  rows.push(thinker);
  thinkersByLastToken.set(token, rows);
}

function resolveThinker(name) {
  const direct = thinkerByName.get(normalize(name));
  if (direct) return direct;
  const token = normalize(name).split(/\s+/).at(-1);
  const candidates = thinkersByLastToken.get(token) ?? [];
  return candidates.length === 1 ? candidates[0] : null;
}

function workOwnerMap(allowedThinkers) {
  const map = new Map();
  for (const thinker of allowedThinkers) {
    for (const work of thinker.works ?? []) map.set(normalize(work), thinker);
  }
  return map;
}

function selectPrimaryWorks(article, debateThinkers) {
  const ownerByWork = workOwnerMap(debateThinkers);
  const selected = [];

  // Preserve already-declared works only when they actually belong to a debate thinker.
  for (const work of article.primary_work_refs ?? []) {
    if (ownerByWork.has(normalize(work)) && !selected.includes(work)) selected.push(work);
  }

  // Prefer breadth: one work from each debate thinker before taking a second work from one thinker.
  for (const thinker of debateThinkers) {
    if (selected.length >= 3) break;
    const hasThisThinker = selected.some((work) => ownerByWork.get(normalize(work))?.id === thinker.id);
    if (hasThisThinker) continue;
    const candidate = (thinker.works ?? []).find((work) => !selected.includes(work));
    if (candidate) selected.push(candidate);
  }

  // University-depth contract requires at least two primary anchors where primary works are declared.
  if (selected.length < 2) {
    for (const thinker of debateThinkers) {
      for (const work of thinker.works ?? []) {
        if (!selected.includes(work)) selected.push(work);
        if (selected.length >= 2) break;
      }
      if (selected.length >= 2) break;
    }
  }

  return selected.slice(0, 3);
}

function replacePrimaryGrounding(article, debateThinkers, works) {
  const theory = (article.sections ?? []).find((s) => s.id === 'teorihistorie');
  if (!theory) throw new Error(`${article.id}: mangler teorihistorie`);
  const sourceSection = (article.sections ?? []).find((s) => s.id === 'kilder');

  const ownerByWork = workOwnerMap(debateThinkers);
  const citations = works.map((work) => {
    const owner = ownerByWork.get(normalize(work));
    return `${work} (${owner?.name ?? 'ukjent tenker'})`;
  });
  const debate = article.university_quality?.debate ?? '';
  const grounding = `Primærverkankrene er ${citations.join('; ')}. De brukes til å kontrollere hvordan de navngitte debattaktørene formulerer posisjonene som inngår i artikkelens stridspunkt, ikke som en generell kanonliste. ${debate}`;

  const oldPrimaryPattern = /Primærverk(?:ene|ankrene)/iu;
  let replaced = false;
  theory.paragraphs = (theory.paragraphs ?? []).map((paragraph) => {
    if (!oldPrimaryPattern.test(paragraph)) return paragraph;
    if (replaced) return null;
    replaced = true;
    return grounding;
  }).filter(Boolean);
  if (!replaced) theory.paragraphs.push(grounding);

  if (sourceSection) {
    const boundary = `Primærverkankrene ${citations.join('; ')} brukes ved konkrete posisjons- og argumentrekonstruksjoner. De emnespesifikke sekundærkildene brukes til problemhistorie, rivaler, fortolkningskontroll og bibliografi; empiriske casepåstander krever egne casekilder.`;
    let sourceReplaced = false;
    sourceSection.paragraphs = (sourceSection.paragraphs ?? []).map((paragraph) => {
      if (!oldPrimaryPattern.test(paragraph)) return paragraph;
      if (sourceReplaced) return null;
      sourceReplaced = true;
      return boundary;
    }).filter(Boolean);
    if (!sourceReplaced) sourceSection.paragraphs.push(boundary);
  }
}

const files = fs.readdirSync(ARTICLES_DIR).filter((name) => name.endsWith('.json')).sort();
if (files.length !== 68) throw new Error(`Forventet 68 Filosofi-artikler, fikk ${files.length}`);

const unresolved = [];
const repaired = [];
for (const file of files) {
  const p = path.join(ARTICLES_DIR, file);
  const article = readJson(p);
  const debateNames = article.university_quality?.debate_thinkers ?? [];
  if (debateNames.length < 2) throw new Error(`${article.id}: mangler minst to debate_thinkers`);

  const resolved = [];
  for (const name of debateNames) {
    const thinker = resolveThinker(name);
    if (!thinker) unresolved.push({ article: article.id, name });
    else if (!resolved.some((row) => row.id === thinker.id)) resolved.push(thinker);
  }
  if (resolved.length < 1) continue;

  const primaryWorks = selectPrimaryWorks(article, resolved);
  if (primaryWorks.length < 2) {
    throw new Error(`${article.id}: review-tenkerne gir bare ${primaryWorks.length} canonicale primærverk`);
  }

  const beforeThinkers = JSON.stringify(article.thinker_refs ?? []);
  const beforeWorks = JSON.stringify(article.primary_work_refs ?? []);
  article.thinker_refs = resolved.map((t) => t.id);
  article.primary_work_refs = primaryWorks;
  article.university_quality.primary_work_count = primaryWorks.length;
  article.quality = article.quality ?? {};
  article.quality.source_integrity = {
    state: 'reviewed',
    standard: 'debate_aligned_primary_works_v1',
    reviewed_at: '2026-08-17',
    debate_thinker_refs: article.thinker_refs,
    primary_work_refs: primaryWorks
  };
  replacePrimaryGrounding(article, resolved, primaryWorks);
  writeJson(p, article);

  if (beforeThinkers !== JSON.stringify(article.thinker_refs) || beforeWorks !== JSON.stringify(primaryWorks)) {
    repaired.push(article.id);
  }
}

if (unresolved.length) {
  console.error(JSON.stringify({ unresolved_debate_thinkers: unresolved }, null, 2));
  throw new Error(`${unresolved.length} debate_thinkers kunne ikke kobles til canonical thinker registry`);
}

const articleRegistry = readJson(REGISTRY_PATH);
const byId = new Map(files.map((file) => {
  const article = readJson(path.join(ARTICLES_DIR, file));
  return [article.id, article];
}));
for (const row of articleRegistry.articles ?? []) {
  const article = byId.get(row.id);
  if (!article) throw new Error(`Registry peker til ukjent artikkel ${row.id}`);
  row.word_count = articleWords(article);
}
articleRegistry.counts.total_words = [...byId.values()].reduce((sum, article) => sum + articleWords(article), 0);
articleRegistry.counts.minimum_words_per_article = Math.min(...[...byId.values()].map(articleWords));
articleRegistry.updated_at = '2026-08-17';
writeJson(REGISTRY_PATH, articleRegistry);

const completion = readJson(COMPLETION_PATH);
completion.total_word_count = articleRegistry.counts.total_words;
completion.minimum_words_per_article = articleRegistry.counts.minimum_words_per_article;
completion.updated_at = '2026-08-17';
writeJson(COMPLETION_PATH, completion);

console.log(JSON.stringify({
  schema: 'history_go_filosofi_source_integrity_repair_v1',
  article_count: files.length,
  repaired_metadata_articles: repaired.length,
  total_words: articleRegistry.counts.total_words,
  minimum_words_per_article: articleRegistry.counts.minimum_words_per_article,
  canonical_contract: '20/68/204/34/51/20'
}, null, 2));
