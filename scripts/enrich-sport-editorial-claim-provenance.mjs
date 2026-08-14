#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REGISTRY_PATH = 'data/fagverk/sport/sport_article_registry_v1.json';
const FAGVERK_REGISTRY = 'data/fagverk/fagverk_registry.json';
const SCI_PATH = 'data/fagverk/sport/sport_scientific_quality_v1.json';
const readJson = async (p) => JSON.parse(await fs.readFile(path.join(ROOT, p), 'utf8'));
const writeJson = async (p, value) => fs.writeFile(path.join(ROOT, p), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const uniq = (xs) => [...new Set((xs || []).filter(Boolean))];
const normalize = (value) => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9æøå]+/g, ' ').trim();
const tokens = (value) => new Set(normalize(value).split(/\s+/).filter((x) => x.length >= 4));
const score = (left, right) => {
  const a = tokens(left), b = tokens(right);
  let n = 0;
  for (const token of a) if (b.has(token)) n += token.length >= 8 ? 3 : 1;
  return n;
};

const registry = await readJson(REGISTRY_PATH);
const fagverk = await readJson(FAGVERK_REGISTRY);
const sci = await readJson(SCI_PATH);
const chapterRows = new Map((fagverk.subjects.sport.chapters || []).map((c) => [c.id, c]));
const sciSources = (sci.chapters || []).flatMap((c) => c.sources || []);
const academicByClaim = new Map();
for (const source of sciSources) for (const claimId of source.supported_claim_ids || []) {
  const list = academicByClaim.get(claimId) || [];
  list.push(source.id);
  academicByClaim.set(claimId, list);
}
const cache = new Map();
async function chapterEvidence(chapterId) {
  if (cache.has(chapterId)) return cache.get(chapterId);
  const row = chapterRows.get(chapterId);
  if (!row) throw new Error(`Ukjent Sport-kapittel ${chapterId}`);
  const chapter = await readJson(row.file);
  const claimsDoc = await readJson(chapter.claimsFile);
  const sourcesDoc = chapter.sourcesFile ? await readJson(chapter.sourcesFile) : claimsDoc;
  const value = { claims: claimsDoc.claims || [], sources: sourcesDoc.sources || [] };
  cache.set(chapterId, value);
  return value;
}

let fallbackCount = 0;
for (const row of registry.articles) {
  const article = await readJson(row.file);
  const evidence = await chapterEvidence(article.chapter_id);
  let claimIds = uniq(article.claim_ids || []);
  let mappingBasis = claimIds.length ? 'section_explicit' : 'chapter_semantic_fallback';
  if (!claimIds.length) {
    const articleText = [article.title, article.lead, ...(article.concept_explanations || []).map((c) => `${c.label} ${c.explanation}`)].join(' ');
    const ranked = evidence.claims
      .map((claim) => ({ claim, score: score(articleText, claim.text) }))
      .sort((a, b) => b.score - a.score || a.claim.id.localeCompare(b.claim.id));
    const positive = ranked.filter((x) => x.score > 0);
    const chosen = (positive.length ? positive : ranked).slice(0, 3);
    if (!chosen.length) throw new Error(`${article.emne_id}: kapittelet har ingen claims`);
    claimIds = chosen.map((x) => x.claim.id);
    fallbackCount += 1;
  }
  const claimMap = new Map(evidence.claims.map((c) => [c.id, c]));
  const sourceIds = uniq(claimIds.flatMap((id) => claimMap.get(id)?.sourceIds || []));
  const academicIds = uniq(claimIds.flatMap((id) => academicByClaim.get(id) || []));
  article.claim_ids = claimIds;
  article.chapter_source_ids = sourceIds;
  article.academic_source_ids = academicIds;
  article.claim_mapping_basis = mappingBasis;
  article.quality.claim_provenance_preserved = true;
  article.quality.claim_mapping_is_explicit = mappingBasis === 'section_explicit';
  article.quality.claim_mapping_fallback_disclosed = mappingBasis === 'chapter_semantic_fallback';
  await writeJson(row.file, article);
  row.claim_ids = claimIds;
  row.academic_source_ids = academicIds;
  row.claim_mapping_basis = mappingBasis;
}
registry.claim_provenance = {
  status: 'complete_with_disclosed_fallbacks',
  section_explicit_article_count: registry.articles.length - fallbackCount,
  semantic_fallback_article_count: fallbackCount,
  fallback_rule: 'Only used when the legacy overview chapter did not assign paragraph claims directly to the emne; claims are selected from the same canonical chapter by deterministic semantic overlap and marked as fallback.'
};
await writeJson(REGISTRY_PATH, registry);
console.log(`Sport claim provenance enriched: ${registry.articles.length} articles, ${fallbackCount} disclosed fallbacks.`);
