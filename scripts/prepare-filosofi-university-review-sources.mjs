#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_PATH = path.join(ROOT, 'data/fagverk/filosofi/filosofi_sources_v1.json');
const ARTICLE_PATH = path.join(ROOT, 'data/fagverk/filosofi/articles/em_filosofi_kunstverk_kunststatus_institusjon.json');
const INDIAN_ARTICLE_PATH = path.join(ROOT, 'data/fagverk/filosofi/articles/em_filosofi_indisk_buddhistisk_filosofi.json');
const LATIN_AMERICAN_ARTICLE_PATH = path.join(ROOT, 'data/fagverk/filosofi/articles/em_filosofi_latinamerikansk_dekolonial_filosofi.json');
const REGISTRY_PATH = path.join(ROOT, 'data/fagverk/filosofi/filosofi_article_registry_v1.json');

const supplementalSources = [
  {
    id: 'sep-conceptual-art',
    title: 'Conceptual Art',
    publisher: 'Stanford Encyclopedia of Philosophy',
    kind: 'scholarly_reference',
    url: 'https://plato.stanford.edu/entries/conceptual-art/',
    access: 'open_web',
    use: 'Emnespesifikk sekundærkilde til moderne kunststatus, ikke-manifeste egenskaper, Dantos artworld-problem og institusjonelle/historiske definisjoner av kunst.'
  },
  {
    id: 'iep-aesthetics-art-definition',
    title: 'Aesthetics',
    publisher: 'Internet Encyclopedia of Philosophy',
    kind: 'scholarly_reference',
    url: 'https://iep.utm.edu/aesthetics/',
    access: 'open_web',
    use: 'Emnespesifikk sekundærkilde til moderne definisjoner av kunst og den kritiske litteraturen om Danto, Dickie og institusjonelle teorier.'
  },
  {
    id: 'sep-indian-epistemology',
    title: 'Epistemology in Classical Indian Philosophy',
    publisher: 'Stanford Encyclopedia of Philosophy',
    kind: 'scholarly_reference',
    url: 'https://plato.stanford.edu/entries/epistemology-india/',
    access: 'open_web',
    use: 'Emnespesifikk sekundærkilde til pramāṇa-tradisjoner, buddhistisk epistemologi og konkurrerende klassiske indiske teorier om kunnskap, persepsjon og inferens.'
  },
  {
    id: 'iep-nagarjuna',
    title: 'Nagarjuna',
    publisher: 'Internet Encyclopedia of Philosophy',
    kind: 'scholarly_reference',
    url: 'https://iep.utm.edu/nagarjun/',
    access: 'open_web',
    use: 'Emnespesifikk sekundærkilde til Nāgārjunas Madhyamaka-argumentasjon, śūnyatā, kritikk av substansmetafysikk og buddhistiske teorier om kunnskap.'
  },
  {
    id: 'sep-latin-american-philosophy',
    title: 'Latin American Philosophy',
    publisher: 'Stanford Encyclopedia of Philosophy',
    kind: 'scholarly_reference',
    url: 'https://plato.stanford.edu/entries/latin-american-philosophy/',
    access: 'open_web',
    use: 'Emnespesifikk sekundærkilde til latinamerikansk filosofihistorie og problemkonteksten for frigjørings- og dekoloniale tradisjoner; brukes sammen med de direkte kildene til kolonialitet og kjønn.'
  },
  {
    id: 'sep-philosophy-liberation',
    title: 'Philosophy of Liberation',
    publisher: 'Stanford Encyclopedia of Philosophy',
    kind: 'scholarly_reference',
    url: 'https://plato.stanford.edu/entries/liberation/',
    access: 'open_web',
    use: 'Emnespesifikk sekundærkilde til latinamerikansk frigjøringsfilosofi, Dussel, avhengighet, Eurocentrismekritikk og interne strømninger i frigjøringstradisjonen.'
  }
];

const sources = JSON.parse(fs.readFileSync(SOURCE_PATH, 'utf8'));
const article = JSON.parse(fs.readFileSync(ARTICLE_PATH, 'utf8'));
const indianArticle = JSON.parse(fs.readFileSync(INDIAN_ARTICLE_PATH, 'utf8'));
const latinAmericanArticle = JSON.parse(fs.readFileSync(LATIN_AMERICAN_ARTICLE_PATH, 'utf8'));

for (const source of supplementalSources) {
  const existing = sources.sources.find((row) => row.id === source.id);
  if (existing) Object.assign(existing, source);
  else sources.sources.push(source);
}

article.source_ids = [...new Set([
  ...(article.source_ids || []),
  'sep-conceptual-art',
  'iep-aesthetics-art-definition'
])];
indianArticle.source_ids = [...new Set([
  ...(indianArticle.source_ids || []),
  'sep-indian-epistemology',
  'iep-nagarjuna'
])];
latinAmericanArticle.source_ids = [...new Set([
  ...(latinAmericanArticle.source_ids || []),
  'sep-latin-american-philosophy',
  'sep-philosophy-liberation'
])];

const required = ['sep-art-definition', 'sep-conceptual-art', 'iep-aesthetics-art-definition'];
for (const sourceId of required) {
  if (!article.source_ids.includes(sourceId)) {
    throw new Error(`${article.id}: mangler emnespesifikk sekundærkilde ${sourceId}`);
  }
  if (!sources.sources.some((row) => row.id === sourceId)) {
    throw new Error(`${article.id}: ukjent sekundærkilde ${sourceId}`);
  }
}

for (const [target, requiredSourceIds] of [
  [indianArticle, ['sep-indian-epistemology', 'iep-nagarjuna']],
  [latinAmericanArticle, ['sep-latin-american-philosophy', 'sep-philosophy-liberation']]
]) {
  for (const sourceId of requiredSourceIds) {
    if (!target.source_ids.includes(sourceId)) throw new Error(`${target.id}: mangler emnespesifikk sekundærkilde ${sourceId}`);
    if (!sources.sources.some((row) => row.id === sourceId)) throw new Error(`${target.id}: ukjent sekundærkilde ${sourceId}`);
  }
  if (new Set(target.source_ids).size < 3) throw new Error(`${target.id}: har fortsatt færre enn tre unike sekundærkilder`);
}

fs.writeFileSync(SOURCE_PATH, `${JSON.stringify(sources, null, 2)}\n`, 'utf8');
fs.writeFileSync(ARTICLE_PATH, `${JSON.stringify(article, null, 2)}\n`, 'utf8');
fs.writeFileSync(INDIAN_ARTICLE_PATH, `${JSON.stringify(indianArticle, null, 2)}\n`, 'utf8');
fs.writeFileSync(LATIN_AMERICAN_ARTICLE_PATH, `${JSON.stringify(latinAmericanArticle, null, 2)}\n`, 'utf8');
console.log(`${article.id}: låst til tre direkte sekundærkilder om kunstdefinisjon/institusjon i tillegg til eksisterende estetikkilder.`);
console.log(`${indianArticle.id}: supplert med distinkte sekundærkilder om klassisk indisk epistemologi og Nāgārjuna.`);
console.log(`${latinAmericanArticle.id}: supplert med distinkte sekundærkilder om latinamerikansk filosofi og frigjøringsfilosofi.`);

const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
let sourceGapCount = 0;
for (const row of registry.articles || []) {
  const target = JSON.parse(fs.readFileSync(path.join(ROOT, row.file), 'utf8'));
  const count = new Set(target.source_ids || []).size;
  if (count < 3) {
    sourceGapCount += 1;
    console.log(`::notice title=Philosophy source gap::${target.id}: har ${count} unike sekundærkilder`);
  }
}
console.log(`Philosophy source-gap diagnostic: ${sourceGapCount} artikler har færre enn tre unike sekundærkilder før materialisering.`);
