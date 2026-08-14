#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REGISTRY = 'data/fagverk/sport/sport_article_registry_v1.json';
const COMPLETION = 'data/fagverk/sport/sport_completion_v1.json';
const CONCEPTS = 'data/fag/sport/begreper_sport_canonical_v5.json';
const EMNERS = 'data/fag/sport/emner_sport_canonical_v4_5.json';
const FAGVERK_REGISTRY = 'data/fagverk/fagverk_registry.json';
const REPORT = 'reports/fagverk/sport-editorial-depth-audit.json';
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const wordCount = (value) => String(value || '').trim().split(/\s+/).filter(Boolean).length;
const asArray = (doc, key) => Array.isArray(doc) ? doc : (doc?.[key] || []);

export function auditSportEditorialDepth({ writeReport = false, checkReport = true } = {}) {
  const registry = readJson(REGISTRY);
  const completion = readJson(COMPLETION);
  const conceptRows = asArray(readJson(CONCEPTS), 'concepts').filter((x) => x.status === 'canonical');
  const emneRows = asArray(readJson(EMNERS), 'emner').filter((x) => x.status === 'active' || x.canonical_status === 'canonical');
  const fagverkSport = readJson(FAGVERK_REGISTRY).subjects.sport;

  assert(registry.schema === 'history_go_fagverk_sport_article_registry_v1', 'Feil Sport article registry schema');
  assert(registry.status === 'editorial_depth_complete', 'Sport article registry er ikke komplett');
  assert(emneRows.length === 116, `Canonical Sport-emner skal være 116, fikk ${emneRows.length}`);
  assert(conceptRows.length === 140, `Canonical Sport-begreper skal være 140, fikk ${conceptRows.length}`);
  assert(registry.articles.length === 116, `Sport skal ha 116 selvstendige artikler, fikk ${registry.articles.length}`);

  const canonicalEmneIds = new Set(emneRows.map((x) => x.emne_id));
  const articleEmneIds = registry.articles.map((x) => x.emne_id);
  assert(new Set(articleEmneIds).size === 116, 'Dupliserte emneartikler');
  assert(articleEmneIds.every((id) => canonicalEmneIds.has(id)), 'Artikkelregister har ikke-canonicalt emne');
  assert([...canonicalEmneIds].every((id) => articleEmneIds.includes(id)), 'Minst ett canonicalt emne mangler selvstendig artikkel');

  const conceptIds = new Set(conceptRows.map((x) => x.concept_id));
  const integrated = new Set();
  let totalWords = 0;
  let totalParagraphs = 0;
  let minWords = Infinity;
  let minSections = Infinity;
  let minParagraphs = Infinity;
  let articlesWithAcademicSources = 0;
  const domains = new Map();

  for (const row of registry.articles) {
    assert(typeof row.file === 'string' && fs.existsSync(path.join(ROOT, row.file)), `${row.emne_id}: mangler artikkelfil`);
    const article = readJson(row.file);
    assert(article.schema === 'history_go_fagverk_sport_article_v1', `${row.emne_id}: feil schema`);
    assert(article.status === 'standalone_complete', `${row.emne_id}: ikke standalone_complete`);
    assert(article.emne_id === row.emne_id, `${row.emne_id}: register/fil mismatch`);
    assert(typeof article.title === 'string' && article.title.length >= 3, `${row.emne_id}: mangler tittel`);
    assert(typeof article.lead === 'string' && article.lead.length >= 180, `${row.emne_id}: for svak ingress`);
    assert(Array.isArray(article.sections) && article.sections.length >= 8, `${row.emne_id}: for få seksjoner`);
    const paragraphs = article.sections.flatMap((s) => s.paragraphs || []);
    const prose = paragraphs.join(' ');
    const wc = wordCount(prose);
    assert(wc >= 500, `${row.emne_id}: bare ${wc} ord`);
    assert(paragraphs.length >= 15, `${row.emne_id}: bare ${paragraphs.length} avsnitt`);
    assert(paragraphs.every((p) => typeof p === 'string' && p.length >= 90), `${row.emne_id}: har for korte/skjematiske avsnitt`);
    assert(article.sections.some((s) => s.id === 'begreper'), `${row.emne_id}: mangler begrepsseksjon`);
    assert(article.sections.some((s) => s.id === 'avgrensning'), `${row.emne_id}: mangler avgrensning`);
    assert(article.sections.some((s) => s.id === 'metode'), `${row.emne_id}: mangler metode`);
    assert((article.theory_unit_ids || []).length >= 2, `${row.emne_id}: mangler teoridybde`);
    assert((article.method_ids || []).length >= 1, `${row.emne_id}: mangler metodekobling`);
    assert((article.claim_ids || []).length >= 1, `${row.emne_id}: mangler claimproveniens`);
    assert((article.concept_ids || []).length >= 1, `${row.emne_id}: mangler begrep`);
    assert((article.concept_explanations || []).length === article.concept_ids.length, `${row.emne_id}: begrepsforklaring mismatch`);
    for (const explanation of article.concept_explanations || []) {
      assert(conceptIds.has(explanation.concept_id), `${row.emne_id}: ukjent begrep ${explanation.concept_id}`);
      assert(typeof explanation.label === 'string' && explanation.explanation.includes(explanation.label), `${row.emne_id}: begrepslabel er ikke skrevet ut`);
      assert(typeof explanation.explanation === 'string' && explanation.explanation.length >= 250, `${row.emne_id}: for svak begrepsforklaring ${explanation.concept_id}`);
      assert(typeof explanation.distinguishes_from === 'string' && explanation.distinguishes_from.length >= 3, `${row.emne_id}: begrep mangler avgrensning`);
      assert(typeof explanation.common_misconception === 'string' && explanation.common_misconception.length >= 15, `${row.emne_id}: begrep mangler misforståelse`);
      integrated.add(explanation.concept_id);
    }
    if ((article.academic_source_ids || []).length) articlesWithAcademicSources += 1;
    totalWords += wc;
    totalParagraphs += paragraphs.length;
    minWords = Math.min(minWords, wc);
    minSections = Math.min(minSections, article.sections.length);
    minParagraphs = Math.min(minParagraphs, paragraphs.length);
    domains.set(article.domain_id, (domains.get(article.domain_id) || 0) + 1);
  }

  assert(integrated.size === 140, `Bare ${integrated.size}/140 canonicale begreper er skrevet ut i artiklene`);
  assert(registry.canonical_concept_count === 140 && registry.integrated_concept_count === 140, 'Registry begrepstall er feil');
  assert(registry.total_word_count === totalWords, 'Registry total_word_count er utdatert');
  assert(registry.minimum_words_per_article === minWords, 'Registry minimum_words_per_article er utdatert');
  assert(domains.size === 6, `Artiklene dekker bare ${domains.size}/6 Sport-områder`);
  assert(completion.editorial_depth?.status === 'complete', 'Completion mangler editorial_depth complete');
  assert(completion.editorial_depth?.standalone_article_count === 116, 'Completion har feil artikkeltall');
  assert(completion.editorial_depth?.all_concepts_written_out_in_articles === true, 'Completion mangler begrepsport');
  assert(fagverkSport.articleRegistryFile === REGISTRY, 'Fagverk-registry peker ikke til Sport-artikkelregisteret');
  assert(fagverkSport.standaloneArticleCount === 116 && fagverkSport.integratedConceptCount === 140, 'Fagverk-registry har feil Sport-artikkeltall');

  const report = {
    schema: 'history_go_fagverk_sport_editorial_depth_audit_v1', version: '1.0.0', status: 'editorial_depth_complete', subject_id: 'sport',
    summary: { canonicalEmneCount: 116, standaloneArticleCount: 116, canonicalConceptCount: 140, integratedConceptCount: integrated.size, domainCount: domains.size, totalWordCount: totalWords, totalParagraphCount: totalParagraphs, minimumWordsPerArticle: minWords, minimumSectionsPerArticle: minSections, minimumParagraphsPerArticle: minParagraphs, articlesWithAcademicSourceLinks: articlesWithAcademicSources },
    domainArticleCounts: Object.fromEntries([...domains.entries()].sort()),
    gates: { allCanonicalEmnersHaveStandaloneArticles: true, allCanonicalConceptsWrittenOut: true, minimumArticleDepthPassed: true, theoryAndRivalLayerPassed: true, methodLayerPassed: true, claimProvenancePassed: true, conceptDefinitionsAndDistinctionsPassed: true, explicitLimitationsPassed: true, registryIntegrationPassed: true, deterministicMaterializationRequired: true }
  };
  if (writeReport) fs.writeFileSync(path.join(ROOT, REPORT), `${JSON.stringify(report, null, 2)}\n`);
  if (checkReport) assert(isDeepStrictEqual(readJson(REPORT), report), `${REPORT} er utdatert`);
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = new Set(process.argv.slice(2));
    const report = auditSportEditorialDepth({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Sport editorial depth OK: ${report.summary.standaloneArticleCount} artikler, ${report.summary.integratedConceptCount} begreper, ${report.summary.totalWordCount} ord.`);
  } catch (error) { console.error(`Sport editorial depth FEIL: ${error.message}`); process.exitCode = 1; }
}
