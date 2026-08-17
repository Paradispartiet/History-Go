#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARTICLES_DIR = path.join(ROOT, 'data/fagverk/filosofi/articles');
const THINKERS_PATH = path.join(ROOT, 'data/fag/filosofi/teoretikere_filosofi_canonical_v2.json');
const REGISTRY_PATH = path.join(ROOT, 'data/fagverk/filosofi/filosofi_article_registry_v1.json');
const COMPLETION_PATH = path.join(ROOT, 'data/fagverk/filosofi/filosofi_completion_v1.json');

const PRIMARY_WORK_OVERRIDES = {
  em_filosofi_afrikansk_filosofi_ubuntu: [
    { actor: 'Kwasi Wiredu', work: 'Philosophy and an African Culture' },
    { actor: 'Ifeanyi Menkiti', work: 'Person and Community in African Traditional Thought' }
  ],
  em_filosofi_intentionalitet_representasjon: [
    { actor: 'Franz Brentano', work: 'Psychology from an Empirical Standpoint' },
    { actor: 'Jerry Fodor', work: 'The Language of Thought' }
  ],
  em_filosofi_fenomenologi_livsverden_kropp: [
    { actor: 'Edmund Husserl', work: 'Ideas Pertaining to a Pure Phenomenology' },
    { actor: 'Martin Heidegger', work: 'Being and Time' },
    { actor: 'Maurice Merleau-Ponty', work: 'Phenomenology of Perception' }
  ],
  em_filosofi_klimarettferdighet_generasjoner: [
    { actor: 'Stephen Gardiner', work: 'A Perfect Moral Storm' },
    { actor: 'Henry Shue', work: 'Subsistence Emissions and Luxury Emissions' }
  ],
  em_filosofi_kunstverk_kunststatus_institusjon: [
    { actor: 'Arthur Danto', work: 'The Transfiguration of the Commonplace' },
    { actor: 'George Dickie', work: 'Art and the Aesthetic' },
    { actor: 'Morris Weitz', work: 'The Role of Theory in Aesthetics' }
  ],
  em_filosofi_omsorg_relasjon_sarbarhet: [
    { actor: 'Carol Gilligan', work: 'In a Different Voice' },
    { actor: 'Nel Noddings', work: 'Caring: A Feminine Approach to Ethics and Moral Education' },
    { actor: 'Eva Feder Kittay', work: "Love's Labor: Essays on Women, Equality, and Dependency" }
  ],
  em_filosofi_tid_endring_prosess: [
    { actor: 'J. M. E. McTaggart', work: 'The Unreality of Time' },
    { actor: 'Henri Bergson', work: 'Time and Free Will' },
    { actor: 'Alfred North Whitehead', work: 'Process and Reality' }
  ],
  em_filosofi_uformell_logikk_feilslutninger: [
    { actor: 'Charles Hamblin', work: 'Fallacies' },
    { actor: 'Douglas Walton', work: 'A Pragmatic Theory of Fallacy' }
  ],
  em_filosofi_verdier_objektivitet_vitenskap: [
    { actor: 'Max Weber', work: 'Science as a Vocation' },
    { actor: 'Helen Longino', work: 'Science as Social Knowledge' },
    { actor: 'Heather Douglas', work: 'Science, Policy, and the Value-Free Ideal' }
  ],
  em_filosofi_vitnesbyrd_ekspertise_tillit: [
    { actor: 'Elizabeth Fricker', work: 'Telling and Trusting: Reductionism and Anti-Reductionism in the Epistemology of Testimony' },
    { actor: 'Alvin Goldman', work: 'Knowledge in a Social World' }
  ]
};

const DEBATE_THINKER_REMOVALS = {
  em_filosofi_intensjon_grunner_arsaker_handling: new Set(['david hume'])
};

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const writeJson = (p, value) => fs.writeFileSync(p, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const normalize = (value) => String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const nameToken = (name) => normalize(name).split(/\s+/).filter((part) => part.length >= 3).at(-1) ?? normalize(name);
const containsActor = (text, name) => {
  const haystack = ` ${normalize(text)} `;
  return haystack.includes(` ${normalize(name)} `) || haystack.includes(` ${nameToken(name)} `);
};
const words = (text) => String(text ?? '').trim().split(/\s+/u).filter(Boolean).length;
const articleWords = (article) => words((article.sections ?? []).flatMap((s) => s.paragraphs ?? []).join(' '));

const thinkerRegistry = readJson(THINKERS_PATH);
const thinkers = thinkerRegistry.thinkers ?? [];
const thinkerById = new Map(thinkers.map((t) => [t.id, t]));
const thinkerByName = new Map(thinkers.map((t) => [normalize(t.name), t]));
const THINKER_ALIASES = new Map([
  [normalize('Averroes'), 'ibn_rushd'],
  [normalize('Kyle Whyte'), 'kyle_whyte']
]);
function resolveThinker(name) {
  const direct = thinkerByName.get(normalize(name));
  if (direct) return direct;
  const aliasId = THINKER_ALIASES.get(normalize(name));
  return aliasId ? thinkerById.get(aliasId) ?? null : null;
}

const hasWork = (anchors, work) => anchors.some((anchor) => normalize(anchor.work) === normalize(work));

function autoPrimaryAnchors(article, canonicalDebateActors) {
  const oldWorks = new Set((article.primary_work_refs ?? []).map(normalize));
  const anchors = [];
  for (const { actor, thinker } of canonicalDebateActors) {
    for (const work of thinker.works ?? []) {
      if (!oldWorks.has(normalize(work)) || hasWork(anchors, work)) continue;
      anchors.push({ actor, canonical_ref: thinker.id, work });
      break;
    }
  }
  for (const { actor, thinker } of canonicalDebateActors) {
    if (anchors.length >= 3) break;
    if (anchors.some((anchor) => anchor.canonical_ref === thinker.id)) continue;
    const work = (thinker.works ?? []).find((candidate) => !hasWork(anchors, candidate));
    if (work) anchors.push({ actor, canonical_ref: thinker.id, work });
  }
  if (anchors.length < 2) {
    for (const { actor, thinker } of canonicalDebateActors) {
      for (const work of thinker.works ?? []) {
        if (hasWork(anchors, work)) continue;
        anchors.push({ actor, canonical_ref: thinker.id, work });
        if (anchors.length >= 2) break;
      }
      if (anchors.length >= 2) break;
    }
  }
  return anchors.slice(0, 3);
}

function buildPrimaryAnchors(article, canonicalDebateActors) {
  const override = PRIMARY_WORK_OVERRIDES[article.id];
  if (!override) return autoPrimaryAnchors(article, canonicalDebateActors);
  const debateNames = new Set((article.university_quality?.debate_thinkers ?? []).map(normalize));
  return override.map((anchor) => {
    if (!debateNames.has(normalize(anchor.actor))) throw new Error(`${article.id}: override-aktør ${anchor.actor} finnes ikke i debate_thinkers`);
    const canonical = resolveThinker(anchor.actor);
    if (canonical && !(canonical.works ?? []).some((work) => normalize(work) === normalize(anchor.work))) {
      throw new Error(`${article.id}: ${anchor.work} er ikke registrert som verk av ${canonical.name}`);
    }
    return { ...anchor, canonical_ref: canonical?.id ?? null };
  });
}

function replacePrimaryGrounding(article, anchors, debateNames) {
  const theory = (article.sections ?? []).find((s) => s.id === 'teorihistorie');
  if (!theory) throw new Error(`${article.id}: mangler teorihistorie`);
  const sourceSection = (article.sections ?? []).find((s) => s.id === 'kilder');
  const citations = anchors.map((anchor) => `${anchor.work} (${anchor.actor})`);
  const workTitles = anchors.map((anchor) => anchor.work);
  const debate = article.university_quality?.debate ?? '';
  const grounding = `Primærverkankrene er ${citations.join('; ')}. De brukes til å kontrollere de navngitte debattaktørenes egne argumenter i artikkelens stridspunkt, ikke som en generell kanonliste. ${debate}`;
  const genericPrimaryPattern = /Primærverk(?:ene|ankrene)/iu;
  const individualPrimaryPattern = /brukes som primæranker for/iu;
  let replaced = false;
  theory.paragraphs = (theory.paragraphs ?? []).map((raw) => {
    const paragraph = String(raw).replace('Lon The Morality of Law', 'The Morality of Law');
    if (genericPrimaryPattern.test(paragraph)) {
      if (replaced) return null;
      replaced = true;
      return grounding;
    }
    if (individualPrimaryPattern.test(paragraph) && !debateNames.some((name) => containsActor(paragraph, name))) return null;
    return paragraph;
  }).filter(Boolean);
  if (!replaced) theory.paragraphs.push(grounding);

  if (sourceSection) {
    const boundary = `Primærverkankrene ${workTitles.join('; ')} brukes ved konkrete posisjons- og argumentrekonstruksjoner. De emnespesifikke sekundærkildene brukes til problemhistorie, rivaler, fortolkningskontroll og bibliografi; empiriske casepåstander krever egne casekilder.`;
    let sourceReplaced = false;
    sourceSection.paragraphs = (sourceSection.paragraphs ?? []).map((paragraph) => {
      if (!genericPrimaryPattern.test(paragraph)) return paragraph;
      if (sourceReplaced) return null;
      sourceReplaced = true;
      return boundary;
    }).filter(Boolean);
    if (!sourceReplaced) sourceSection.paragraphs.push(boundary);
  }
}

const files = fs.readdirSync(ARTICLES_DIR).filter((name) => name.endsWith('.json')).sort();
if (files.length !== 68) throw new Error(`Forventet 68 Filosofi-artikler, fikk ${files.length}`);

const plans = [];
for (const file of files) {
  const p = path.join(ARTICLES_DIR, file);
  const article = readJson(p);
  const removals = DEBATE_THINKER_REMOVALS[article.id] ?? new Set();
  if (removals.size) {
    article.university_quality.debate_thinkers = (article.university_quality?.debate_thinkers ?? []).filter((name) => !removals.has(normalize(name)));
  }
  const debateNames = article.university_quality?.debate_thinkers ?? [];
  if (debateNames.length < 2) throw new Error(`${article.id}: mangler minst to debate_thinkers`);
  const canonicalDebateActors = [];
  for (const actor of debateNames) {
    const thinker = resolveThinker(actor);
    if (!thinker || canonicalDebateActors.some((row) => row.thinker.id === thinker.id)) continue;
    canonicalDebateActors.push({ actor, thinker });
  }
  const anchors = buildPrimaryAnchors(article, canonicalDebateActors);
  if (anchors.length < 2) throw new Error(`${article.id}: mangler minst to debattspesifikke primærverkankre`);
  if (new Set(anchors.map((anchor) => normalize(anchor.work))).size !== anchors.length) throw new Error(`${article.id}: dupliserte primærverkankre`);
  plans.push({ p, article, debateNames, canonicalDebateActors, anchors });
}

const repaired = [];
for (const { p, article, debateNames, canonicalDebateActors, anchors } of plans) {
  const beforeThinkers = JSON.stringify(article.thinker_refs ?? []);
  const beforeWorks = JSON.stringify(article.primary_work_refs ?? []);
  article.thinker_refs = canonicalDebateActors.map(({ thinker }) => thinker.id);
  article.primary_work_refs = anchors.map((anchor) => anchor.work);
  article.university_quality.primary_work_count = anchors.length;
  article.quality = article.quality ?? {};
  article.quality.source_integrity = {
    state: 'reviewed',
    standard: 'debate_aligned_primary_works_v2',
    reviewed_at: '2026-08-17',
    debate_actors: debateNames,
    canonical_thinker_refs: article.thinker_refs,
    primary_work_anchors: anchors
  };
  replacePrimaryGrounding(article, anchors, debateNames);
  writeJson(p, article);
  if (beforeThinkers !== JSON.stringify(article.thinker_refs) || beforeWorks !== JSON.stringify(article.primary_work_refs)) repaired.push(article.id);
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
  schema: 'history_go_filosofi_source_integrity_repair_v2',
  article_count: files.length,
  repaired_metadata_articles: repaired.length,
  explicit_override_articles: Object.keys(PRIMARY_WORK_OVERRIDES).length,
  total_words: articleRegistry.counts.total_words,
  minimum_words_per_article: articleRegistry.counts.minimum_words_per_article,
  canonical_contract: '20/68/204/34/51/20'
}, null, 2));
