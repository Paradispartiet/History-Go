#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARTICLES_DIR = path.join(ROOT, 'data/fagverk/filosofi/articles');
const THINKERS_PATH = path.join(ROOT, 'data/fag/filosofi/teoretikere_filosofi_canonical_v2.json');
const REPORT_PATH = path.join(ROOT, 'reports/filosofi-source-integrity-repair-gaps.json');

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const normalize = (value) => String(value ?? '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const thinkerRegistry = readJson(THINKERS_PATH);
const thinkers = thinkerRegistry.thinkers ?? [];
const byName = new Map(thinkers.map((t) => [normalize(t.name), t]));
const byLast = new Map();
for (const thinker of thinkers) {
  const token = normalize(thinker.name).split(/\s+/).at(-1);
  if (!token) continue;
  const rows = byLast.get(token) ?? [];
  rows.push(thinker);
  byLast.set(token, rows);
}
const resolve = (name) => {
  const direct = byName.get(normalize(name));
  if (direct) return { thinker: direct, mode: 'exact' };
  const token = normalize(name).split(/\s+/).at(-1);
  const candidates = byLast.get(token) ?? [];
  if (candidates.length === 1) return { thinker: candidates[0], mode: 'unique_last_token' };
  return { thinker: null, mode: candidates.length ? 'ambiguous_last_token' : 'missing', candidates: candidates.map((x) => ({ id: x.id, name: x.name })) };
};

const files = fs.readdirSync(ARTICLES_DIR).filter((name) => name.endsWith('.json')).sort();
const articles = [];
const unresolved = [];
const underSupplied = [];
for (const file of files) {
  const article = readJson(path.join(ARTICLES_DIR, file));
  const debateNames = article.university_quality?.debate_thinkers ?? [];
  const rows = debateNames.map((name) => {
    const result = resolve(name);
    if (!result.thinker) {
      unresolved.push({ article_id: article.id, title: article.title, debate_thinker: name, mode: result.mode, candidates: result.candidates ?? [] });
      return { review_name: name, resolved: false, mode: result.mode, candidates: result.candidates ?? [] };
    }
    return {
      review_name: name,
      resolved: true,
      mode: result.mode,
      canonical_id: result.thinker.id,
      canonical_name: result.thinker.name,
      works: result.thinker.works ?? []
    };
  });
  const suppliedWorks = [...new Set(rows.filter((r) => r.resolved).flatMap((r) => r.works ?? []))];
  if (suppliedWorks.length < 2) {
    underSupplied.push({ article_id: article.id, title: article.title, debate_thinkers: rows, available_works: suppliedWorks });
  }
  articles.push({
    article_id: article.id,
    title: article.title,
    debate_thinkers: rows,
    existing_thinker_refs: article.thinker_refs ?? [],
    existing_primary_work_refs: article.primary_work_refs ?? [],
    available_debate_works: suppliedWorks
  });
}

const report = {
  schema: 'history_go_filosofi_source_integrity_repair_gaps_v1',
  generated_at: '2026-08-17',
  article_count: files.length,
  unresolved_count: unresolved.length,
  under_supplied_article_count: underSupplied.length,
  unresolved,
  under_supplied_articles: underSupplied,
  articles
};
fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({
  article_count: report.article_count,
  unresolved_count: report.unresolved_count,
  under_supplied_article_count: report.under_supplied_article_count,
  report: path.relative(ROOT, REPORT_PATH)
}, null, 2));
