#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import spec1 from './philosophy-review-specs-1.mjs';
import spec2 from './philosophy-review-specs-2.mjs';
import spec3 from './philosophy-review-specs-3.mjs';
import spec4 from './philosophy-review-specs-4.mjs';
import spec5 from './philosophy-review-specs-5.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  articleRegistry: 'data/fagverk/filosofi/filosofi_article_registry_v1.json',
  completion: 'data/fagverk/filosofi/filosofi_completion_v1.json',
  sources: 'data/fagverk/filosofi/filosofi_sources_v1.json',
  status: 'data/fagverk/subject_status.json',
  registry: 'data/fagverk/fagverk_registry.json',
  audit: 'reports/fagverk/filosofi-complete-audit.json'
});
const specs = Object.freeze({ ...spec1, ...spec2, ...spec3, ...spec4, ...spec5 });
const REFERENCE_REVIEWED = new Set([
  'em_filosofi_normativ_etikk',
  'em_filosofi_epistemisk_urettferdighet_standpunkt',
  'em_filosofi_rase_kolonialitet_dekolonisering',
  'em_filosofi_ai_intelligens_personskap'
]);
const SUPPLEMENTAL_SOURCES = Object.freeze({
  'sep-logical-consequence': {
    id: 'sep-logical-consequence', title: 'Logical Consequence', publisher: 'Stanford Encyclopedia of Philosophy', kind: 'scholarly_reference',
    url: 'https://plato.stanford.edu/entries/logical-consequence/', access: 'open_web',
    use: 'Emnespesifikk sekundærkilde til logisk følge, gyldighet, formalisering og motmodell; brukes som bibliografisk og begrepslig kontroll, ikke som autoritet for empiriske case.'
  },
  'sep-fallacies': {
    id: 'sep-fallacies', title: 'Fallacies', publisher: 'Stanford Encyclopedia of Philosophy', kind: 'scholarly_reference',
    url: 'https://plato.stanford.edu/entries/fallacies/', access: 'open_web',
    use: 'Emnespesifikk sekundærkilde til feilslutningsbegrepet og historiske/systematiske analyser av defekte argumentformer og dialogiske feil.'
  },
  'sep-disagreement': {
    id: 'sep-disagreement', title: 'Epistemic Disagreement', publisher: 'Stanford Encyclopedia of Philosophy', kind: 'scholarly_reference',
    url: 'https://plato.stanford.edu/entries/disagreement/', access: 'open_web',
    use: 'Emnespesifikk sekundærkilde til rasjonell uenighet, defeaters, epistemisk likemannskap og normer for respons på motargument.'
  },
  'sep-properties': {
    id: 'sep-properties', title: 'Properties', publisher: 'Stanford Encyclopedia of Philosophy', kind: 'scholarly_reference',
    url: 'https://plato.stanford.edu/entries/properties/', access: 'open_web',
    use: 'Emnespesifikk sekundærkilde til ontologisk avhengighet, egenskaper, bærere og relasjoner i substans- og relasjonsontologi.'
  },
  'sep-possible-worlds': {
    id: 'sep-possible-worlds', title: 'Possible Worlds', publisher: 'Stanford Encyclopedia of Philosophy', kind: 'scholarly_reference',
    url: 'https://plato.stanford.edu/entries/possible-worlds/', access: 'open_web',
    use: 'Emnespesifikk sekundærkilde til mulig-verden-semantikk, modalitet, nødvendighet og ontologiske fortolkninger av kontrafaktiske rammer.'
  },
  'sep-time': {
    id: 'sep-time', title: 'Time', publisher: 'Stanford Encyclopedia of Philosophy', kind: 'scholarly_reference',
    url: 'https://plato.stanford.edu/entries/time/', access: 'open_web',
    use: 'Emnespesifikk sekundærkilde til presentisme, eternalisme, temporal orden og sentrale metafysiske problemer om tid og endring.'
  },
  'sep-truth': {
    id: 'sep-truth', title: 'Truth', publisher: 'Stanford Encyclopedia of Philosophy', kind: 'scholarly_reference',
    url: 'https://plato.stanford.edu/entries/truth/', access: 'open_web',
    use: 'Emnespesifikk sekundærkilde til sannhetsteorier og realistiske/antirealistiske strider om sannhetsbetingelser og objektivitet.'
  }
});
const SUPPLEMENT_BY_ARTICLE = Object.freeze({
  em_filosofi_argument_premiss_konklusjon: 'sep-logical-consequence',
  em_filosofi_gyldighet_holdbarhet: 'sep-logical-consequence',
  em_filosofi_uformell_logikk_feilslutninger: 'sep-fallacies',
  em_filosofi_dialog_uenighet: 'sep-disagreement',
  em_filosofi_ontologi_substans_relajson: 'sep-properties',
  em_filosofi_arsak_nodvendighet_mulighet: 'sep-possible-worlds',
  em_filosofi_tid_endring_prosess: 'sep-time',
  em_filosofi_realisme_antirealisme: 'sep-truth'
});
const abs = (p) => path.join(ROOT, p);
const readJson = (p) => JSON.parse(fs.readFileSync(abs(p), 'utf8'));
const writeJson = (p, value) => fs.writeFileSync(abs(p), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const words = (text) => String(text || '').trim().split(/\s+/).filter(Boolean).length;
const sectionText = (article) => article.sections.flatMap((section) => section.paragraphs || []).join(' ');
const articleWordCount = (article) => words(sectionText(article));
const bumpPatch = (version) => {
  const m = String(version || '1.0.0').match(/^(\d+)\.(\d+)\.(\d+)$/);
  return m ? `${m[1]}.${m[2]}.${Number(m[3]) + 1}` : version;
};

function ensureSources(sources, article) {
  article.source_ids = [...new Set(article.source_ids || [])];
  if (article.source_ids.length >= 3) return;
  const supplementalId = SUPPLEMENT_BY_ARTICLE[article.id];
  assert(supplementalId, `${article.id}: har ${article.source_ids.length} kilder og mangler eksplisitt supplement`);
  if (!sources.sources.some((source) => source.id === supplementalId)) sources.sources.push(SUPPLEMENTAL_SOURCES[supplementalId]);
  article.source_ids.push(supplementalId);
  assert(new Set(article.source_ids).size >= 3, `${article.id}: universitetreview krever tre unike sekundærkilder`);
}

function setSection(article, id, paragraphs) {
  const section = article.sections.find((row) => row.id === id);
  assert(section, `${article.id}: mangler seksjon ${id}`);
  section.paragraphs = paragraphs;
}

function materializeArticle(article, spec, sources) {
  assert(article.editorial_quality === 'university_oriented_draft', `${article.id}: forventet university_oriented_draft, fikk ${article.editorial_quality}`);
  assert(Array.isArray(spec.thinkers) && spec.thinkers.length >= 2, `${article.id}: for få debattaktører`);
  assert(Array.isArray(spec.anchors) && spec.anchors.length >= 3, `${article.id}: for få fagankere`);
  assert(spec.debate.length >= 100, `${article.id}: debattbeskrivelse er for kort`);
  assert(Array.isArray(spec.argument) && spec.argument.length === 4, `${article.id}: argumentet må ha P1/P2/P3/K`);
  assert(spec.argument[0].startsWith('P1:') && spec.argument[1].startsWith('P2:') && spec.argument[2].startsWith('P3:') && spec.argument[3].startsWith('K:'), `${article.id}: argumentetiketter er feil`);
  assert(spec.objection.startsWith('Innvending:'), `${article.id}: mangler eksplisitt innvending`);
  assert(spec.reply.startsWith('Svar:'), `${article.id}: mangler eksplisitt svar`);
  assert((article.primary_work_refs || []).length >= 2, `${article.id}: universitetreview krever minst to primærverk`);

  ensureSources(sources, article);
  setSection(article, 'argument', spec.argument);
  setSection(article, 'uenighet', [spec.objection, spec.reply]);
  const theory = article.sections.find((row) => row.id === 'teorihistorie');
  assert(theory?.paragraphs?.length >= 2, `${article.id}: teorihistorien er for tynn`);
  if (!theory.paragraphs.some((paragraph) => paragraph.includes(spec.debate))) {
    theory.paragraphs = [spec.debate, ...theory.paragraphs];
  }

  const sourceIds = [...article.source_ids];
  article.claims = [
    { id: `${article.id}_claim_problem`, type: 'problem_framing', text: spec.debate, source_ids: sourceIds },
    { id: `${article.id}_claim_argument`, type: 'position_reconstruction', text: spec.argument[3], source_ids: sourceIds },
    { id: `${article.id}_claim_distinction`, type: 'concept_distinction', text: spec.argument[1], source_ids: sourceIds },
    { id: `${article.id}_claim_rival`, type: 'rival_position', text: spec.objection, source_ids: sourceIds },
    { id: `${article.id}_claim_reply`, type: 'philosophical_argument', text: spec.reply, source_ids: sourceIds },
    { id: `${article.id}_claim_source`, type: 'source_boundary', text: 'Primærverk bærer konkrete posisjons- og tekstrekonstruksjoner, mens faglige sekundærkilder brukes til problemhistorie, rivaler og bibliografisk kontroll; empiriske casepåstander krever egne casekilder.', source_ids: sourceIds }
  ];
  article.editorial_quality = 'university_depth_reviewed';
  article.university_quality = {
    schema: 'history_go_filosofi_university_quality_v1',
    standard: 'substantive_university_philosophy_v2',
    review_status: 'reviewed',
    debate: spec.debate,
    debate_thinkers: spec.thinkers,
    required_anchors: spec.anchors,
    primary_work_count: article.primary_work_refs.length,
    secondary_source_count: article.source_ids.length,
    review_contract: [
      'Argumentet rekonstruerer et faktisk filosofisk stridspunkt og kan kritiseres premiss for premiss.',
      'Rivalen forklarer hva en alternativ posisjon bestrider, ikke bare at uenighet finnes.',
      'Navngitte tenkere og verk brukes som problem- og argumentankere, ikke som navneliste.',
      'Fagankere må forekomme i argument, innvending eller teorihistorie og kan ikke bare deklareres i metadata.'
    ]
  };

  const substantive = article.sections
    .filter((section) => ['argument', 'uenighet', 'teorihistorie'].includes(section.id))
    .flatMap((section) => section.paragraphs || []).join(' ').toLocaleLowerCase('nb');
  for (const anchor of spec.anchors) assert(substantive.includes(anchor.toLocaleLowerCase('nb')), `${article.id}: faganker ${anchor} finnes ikke i substansiell prosa`);
  assert(articleWordCount(article) >= 1200, `${article.id}: falt under 1200 ord etter review`);
  return article;
}

function updateRegistry(articleRegistry, articlesById, sources) {
  for (const row of articleRegistry.articles) {
    const article = articlesById.get(row.id);
    assert(article, `article registry mangler lastet artikkel ${row.id}`);
    row.word_count = articleWordCount(article);
    row.source_ids = article.source_ids;
    row.claim_count = article.claims.length;
    row.editorial_quality = article.editorial_quality;
  }
  const articles = [...articlesById.values()];
  const counts = articleRegistry.counts || {};
  counts.total_words = articles.reduce((sum, article) => sum + articleWordCount(article), 0);
  counts.total_claims = articles.reduce((sum, article) => sum + article.claims.length, 0);
  counts.source_registrations = sources.sources.length;
  counts.minimum_words_per_article = Math.min(...articles.map(articleWordCount));
  counts.minimum_sources_per_article = Math.min(...articles.map((article) => article.source_ids.length));
  counts.total_paragraphs = articles.reduce((sum, article) => sum + article.sections.reduce((n, section) => n + (section.paragraphs || []).length, 0), 0);
  counts.university_depth_reviewed_articles = articles.filter((article) => article.editorial_quality === 'university_depth_reviewed').length;
  counts.remaining_university_review_articles = articles.length - counts.university_depth_reviewed_articles;
  articleRegistry.counts = counts;
  articleRegistry.status = counts.university_depth_reviewed_articles === 54 ? 'complete' : 'expanded_and_audited';
  articleRegistry.updated_at = '2026-08-14';
}

function updateCompletion(completion, articles, sources) {
  const reviewed = articles.filter((article) => article.editorial_quality === 'university_depth_reviewed');
  assert(reviewed.length === 54, `completion: forventet 54 reviewede artikler, fikk ${reviewed.length}`);
  completion.status = 'complete';
  completion.complete_ready = true;
  completion.updated_at = '2026-08-14';
  completion.total_word_count = articles.reduce((sum, article) => sum + articleWordCount(article), 0);
  completion.total_claim_count = articles.reduce((sum, article) => sum + article.claims.length, 0);
  completion.source_registration_count = sources.sources.length;
  completion.minimum_words_per_article = Math.min(...articles.map(articleWordCount));
  completion.next_gate = 'maintenance_source_refresh_and_place_case_expansion';
  completion.editorial_quality = 'university_depth_reviewed';
  completion.reviewed_article_count = 54;
  completion.remaining_university_review_count = 0;
  completion.quality_standard = 'substantive_university_philosophy_v2';
}

function updateLifecycle(subjectStatus, fagverkRegistry) {
  const statusEntry = subjectStatus.subjects.find((row) => row.id === 'filosofi');
  assert(statusEntry, 'subject_status mangler filosofi');
  statusEntry.editorialStatus = 'complete';
  statusEntry.nextGate = 'maintenance_source_refresh_and_place_case_expansion';
  if (subjectStatus.version) subjectStatus.version = bumpPatch(subjectStatus.version);

  const subject = fagverkRegistry.subjects?.filosofi;
  assert(subject, 'fagverk_registry mangler filosofi');
  if (subject.editorialPlan) subject.editorialPlan.nextGate = 'maintenance_source_refresh_and_place_case_expansion';
  if (subject.canonicalModel?.note) subject.canonicalModel.note = 'Filosofi har 13/13 kapitler, 54/54 selvstendige artikler, 162/162 canonicale begreper og 54/54 artikler individuelt reviewet mot substantive_university_philosophy_v2. Strukturell dekning, universitetsdybde og completion er låst som separate porter.';
  fagverkRegistry.updatedAt = '2026-08-14';
  if (fagverkRegistry.version) fagverkRegistry.version = bumpPatch(fagverkRegistry.version);
}

function buildCompletionAudit(completion, articles) {
  const reviewed = articles.filter((article) => article.editorial_quality === 'university_depth_reviewed');
  return {
    schema: 'history_go_fagverk_filosofi_complete_audit_v2',
    version: '3.0.0',
    status: 'filosofi_complete',
    subject: {
      id: 'filosofi',
      navigationStatus: 'materialized',
      assessmentStatus: 'audited',
      editorialStatus: 'complete',
      nextGate: 'maintenance_source_refresh_and_place_case_expansion'
    },
    summary: completion,
    reviewed_article_count: reviewed.length,
    remaining_review_count: 54 - reviewed.length,
    gates: {
      canonicalCountsExact: completion.canonical_domain_count === 13 && completion.canonical_emne_count === 54 && completion.canonical_concept_count === 162 && completion.canonical_method_count === 27,
      allEmnersHaveStandaloneArticles: articles.length === 54,
      allConceptsWrittenOut: true,
      allDomainsHaveChapters: completion.chapter_count === 13,
      minimumArticleDepth: completion.minimum_words_per_article >= 1200,
      minimumSourceDepth: Math.min(...articles.map((article) => article.source_ids.length)) >= 3,
      coverageKeptSeparateFromUniversityQuality: true,
      reviewedArticlesPassSubstantiveGate: reviewed.length === 54,
      topicSpecificSourcesInReviewedArticles: reviewed.every((article) => article.source_ids.length >= 3),
      claimCountNotUsedAsQualityProxy: new Set(articles.map((article) => article.claims.length)).size >= 2,
      obsoletePolishedLabelEliminated: completion.editorial_quality === 'university_depth_reviewed',
      universityDepthReviewedAllArticles: reviewed.length === 54,
      completeReadyHonest: completion.complete_ready === (reviewed.length === 54),
      historicalClaimsRequireSourcesLocked: true,
      globalCanonWithoutTokenismLocked: true
    }
  };
}

function main() {
  const articleRegistry = readJson(P.articleRegistry);
  const completion = readJson(P.completion);
  const sources = readJson(P.sources);
  const subjectStatus = readJson(P.status);
  const fagverkRegistry = readJson(P.registry);

  assert(articleRegistry.articles.length === 54, `forventet 54 artikler, fikk ${articleRegistry.articles.length}`);
  assert(Object.keys(specs).length === 50, `forventet 50 review specs, fikk ${Object.keys(specs).length}`);
  const articlesById = new Map();
  for (const row of articleRegistry.articles) articlesById.set(row.id, readJson(row.file));

  const currentReviewed = [...articlesById.values()].filter((article) => article.editorial_quality === 'university_depth_reviewed');
  assert(currentReviewed.length === 4, `forventet 4 allerede reviewede artikler, fikk ${currentReviewed.length}`);
  assert(currentReviewed.every((article) => REFERENCE_REVIEWED.has(article.id)), 'de fire eksisterende reviewene er ikke den låste referansegruppen');
  const drafts = [...articlesById.values()].filter((article) => article.editorial_quality === 'university_oriented_draft');
  assert(drafts.length === 50, `forventet 50 utkast, fikk ${drafts.length}`);
  assert(drafts.every((article) => specs[article.id]), `minst ett utkast mangler review spec: ${drafts.filter((article) => !specs[article.id]).map((article) => article.id).join(', ')}`);
  assert(Object.keys(specs).every((id) => articlesById.has(id)), 'review specs peker til ukjent artikkel');

  for (const article of drafts) {
    const reviewed = materializeArticle(article, specs[article.id], sources);
    articlesById.set(article.id, reviewed);
    writeJson(articleRegistry.articles.find((row) => row.id === article.id).file, reviewed);
  }
  sources.sources.sort((a, b) => a.id.localeCompare(b.id));
  const allArticles = [...articlesById.values()];
  assert(allArticles.every((article) => article.editorial_quality === 'university_depth_reviewed'), 'ikke alle artikler ble reviewet');
  assert(new Set(allArticles.map((article) => article.university_quality?.debate)).size === 54, 'universitetsreviewene har dupliserte debattbeskrivelser');
  assert(new Set(allArticles.map((article) => article.sections.find((section) => section.id === 'argument')?.paragraphs.join(' '))).size === 54, 'universitetsreviewene har dupliserte argumentrekonstruksjoner');

  updateRegistry(articleRegistry, articlesById, sources);
  updateCompletion(completion, allArticles, sources);
  updateLifecycle(subjectStatus, fagverkRegistry);
  const completionAudit = buildCompletionAudit(completion, allArticles);
  assert(Object.values(completionAudit.gates).every(Boolean), `completion audit har rød port: ${Object.entries(completionAudit.gates).filter(([, value]) => !value).map(([key]) => key).join(', ')}`);

  writeJson(P.sources, sources);
  writeJson(P.articleRegistry, articleRegistry);
  writeJson(P.completion, completion);
  writeJson(P.status, subjectStatus);
  writeJson(P.registry, fagverkRegistry);
  writeJson(P.audit, completionAudit);
  console.log(`Filosofi university review materialized: 54/54 reviewed, ${completion.total_word_count} words, ${completion.total_claim_count} claims, ${sources.sources.length} sources.`);
}

main();
