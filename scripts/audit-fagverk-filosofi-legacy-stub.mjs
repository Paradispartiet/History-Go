import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditRepository } from './audit-fagverk-general-engine.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARCHIVE = 'data/fag/filosofi/archive/merke_filosofi_legacy_20260829.html';
const COMPATIBILITY = 'data/fag/filosofi/merke_filosofi.html';
const BADGE = 'data/badges/filosofi.json';
const CATEGORIES = 'data/categories/category_contract.json';
const MANIFEST = 'data/fag/fag_manifest.json';
const REGISTRY = 'data/fagverk/fagverk_registry.json';
const PORTAL = 'data/fagverk/fagverk_portal.json';
const CONCEPTS = 'data/fag/filosofi/begreper_filosofi_canonical_v2.json';
const THINKERS = 'data/fag/filosofi/teoretikere_filosofi_canonical_v2.json';
const TARGET = 'fagverk.html?subject=filosofi#fagverkIaProgresjon';
const RELATIVE_TARGET = '../../../fagverk.html?subject=filosofi#fagverkIaProgresjon';

const abs = (file) => path.join(ROOT, file);
const read = (file) => fs.readFileSync(abs(file), 'utf8');
const readJson = (file) => JSON.parse(read(file));
const exists = (file) => fs.existsSync(abs(file));
const text = (value) => String(value == null ? '' : value).trim();
function normalize(value) {
  return text(value).toLocaleLowerCase('nb-NO').normalize('NFKC')
    .replace(/[«»“”„"'’`´]/g, '')
    .replace(/[^a-zæøå0-9]+/gi, ' ')
    .replace(/\s+/g, ' ').trim();
}
function stripHtml(value) {
  return value.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ').trim();
}
function flattenStrings(value, out = []) {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach((item) => flattenStrings(item, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((item) => flattenStrings(item, out));
  return out;
}
function hrefs(html) {
  return [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)].map((match) => match[1]);
}
function anchor(corpus, alternatives) {
  const found = alternatives.find((candidate) => corpus.includes(normalize(candidate)));
  return { alternatives, found: found || null };
}
function resolveManifestPointer(pointer) {
  const value = text(pointer).replaceAll('\\', '/');
  if (!value || value.startsWith('/') || value.includes('..')) return '';
  const file = path.posix.join('data/fag', value);
  return file.startsWith('data/fag/filosofi/') && exists(file) ? file : '';
}

export function auditFilosofiLegacyStub() {
  for (const file of [ARCHIVE, COMPATIBILITY, BADGE, CATEGORIES, MANIFEST, REGISTRY, PORTAL, CONCEPTS, THINKERS]) {
    if (!exists(file)) throw new Error(`Filosofi stub-audit mangler ${file}`);
  }
  const archive = read(ARCHIVE);
  const compatibility = read(COMPATIBILITY);
  const badge = readJson(BADGE);
  const categories = readJson(CATEGORIES);
  const manifest = readJson(MANIFEST);
  const registry = readJson(REGISTRY);
  const portal = readJson(PORTAL);
  const manifestEntry = manifest.filosofi || {};
  const subjectRegistry = registry.subjects?.filosofi;
  if (!subjectRegistry) throw new Error('Filosofi mangler i Fagverk-registeret.');

  const sourceFiles = ['pensum', 'emner', 'fagkart', 'methods']
    .map((field) => resolveManifestPointer(manifestEntry[field])).filter(Boolean);
  if (sourceFiles.length !== 4) throw new Error(`Filosofi-manifestet løste ${sourceFiles.length}/4 kjernefiler.`);
  for (const field of ['pensum', 'emner', 'fagkart', 'methods', 'supersetQuizMal']) {
    if (!text(manifestEntry[field])) throw new Error(`Filosofi-manifestet mangler produktfelt ${field}.`);
  }

  const general = auditRepository({ checkReport: false });
  const generalRow = general.materializedRows.find((row) => row.id === 'filosofi');
  if (!generalRow) throw new Error('Filosofi mangler i general-engine-projeksjonen.');

  const canonicalCorpus = normalize(flattenStrings([
    badge,
    categories.decisions?.filosofi,
    subjectRegistry,
    readJson(CONCEPTS),
    readJson(THINKERS),
    ...sourceFiles.map((file) => readJson(file))
  ]).join(' '));

  const knowledgeAnchors = [
    ['begrep', 'begreper'], ['argument', 'argumentasjon'], ['verdier', 'verdi'],
    ['kunnskap', 'erkjennelse'], ['virkelighet', 'metafysikk'], ['språk', 'sprakfilosofi'],
    ['samfunn', 'sosial filosofi'], ['godt liv', 'det gode liv', 'liv'],
    ['logikk'], ['begrepsanalyse'], ['erkjennelsesteori', 'erkjennelse'], ['bevissthetsfilosofi', 'bevissthet'],
    ['etikk'], ['politisk filosofi'], ['offentlig fornuft', 'offentlighet'], ['estetikk'],
    ['fortolkning', 'hermeneutikk'], ['idehistorie', 'idéhistorie'], ['vitenskapsfilosofi'],
    ['teknologifilosofi', 'teknologi'], ['eksistensialisme'], ['fenomenologi'], ['miljøfilosofi', 'miljo dyr klima']
  ].map((alternatives) => anchor(canonicalCorpus, alternatives));
  const missingKnowledgeAnchors = knowledgeAnchors.filter((item) => !item.found).map((item) => item.alternatives);

  const archiveLinks = hrefs(archive);
  const expectedArchiveLinks = [
    '../../../merker/merker.html',
    '../../../fagverk.html?subject=filosofi',
    '../../../fagverk-forside.html'
  ];
  const unknownArchiveLinks = archiveLinks.filter((href) => !expectedArchiveLinks.includes(href));
  const noIndependentRuntime = !/<script\b/i.test(archive) && !/<form\b/i.test(archive) && !/<button\b/i.test(archive);
  const sectionCount = (archive.match(/class=["'][^"']*merke-blokk/g) || []).length;
  if (sectionCount !== 3) throw new Error(`Filosofi legacy-stub skal ha tre korte blokker, fant ${sectionCount}.`);

  const productSummary = {
    role: 'legacy_product_ownership_summary',
    separateSubjectIdentity: categories.fagSubjects?.includes('filosofi') && categories.fagSubjects?.includes('vitenskap'),
    requiredManifestFieldsPresent: ['pensum', 'emner', 'fagkart', 'methods', 'supersetQuizMal'].every((field) => Boolean(text(manifestEntry[field]))),
    migrateAsKnowledge: false
  };
  const compatibilityRedirectPresent = compatibility.includes('location.replace')
    && compatibility.includes(RELATIVE_TARGET)
    && !/Kjerneområder|Eget faggrunnlag|argumentasjon, logikk og begrepsanalyse/i.test(compatibility);
  const portalEntry = portal.categories?.find((item) => item.id === 'filosofi');
  const portalRedirected = portalEntry?.badgePage === TARGET;

  const redirectReady = noIndependentRuntime
    && missingKnowledgeAnchors.length === 0
    && unknownArchiveLinks.length === 0
    && productSummary.separateSubjectIdentity
    && productSummary.requiredManifestFieldsPresent
    && compatibilityRedirectPresent
    && portalRedirected;

  return {
    schema: 'history_go_fagverk_filosofi_legacy_stub_audit_v1',
    subject: 'filosofi',
    legacy: { archive: ARCHIVE, compatibilityPage: COMPATIBILITY, sectionCount, archiveCharacterCount: stripHtml(archive).length, archiveLinkCount: archiveLinks.length, noIndependentRuntime, productSummary },
    canonical: {
      badge: BADGE, categoryContract: CATEGORIES, registry: REGISTRY, concepts: CONCEPTS, thinkers: THINKERS,
      manifestSourceFiles: sourceFiles,
      runtimeCounts: { domainCount: generalRow.domainCount, emneCount: generalRow.emneCount, methodCount: generalRow.methodCount, chapterCount: generalRow.chapterCount },
      knowledgeAnchors, missingKnowledgeAnchors
    },
    navigation: { archiveLinks, expectedArchiveLinks, unknownArchiveLinks, target: TARGET, portalRoute: portalEntry?.badgePage || null, portalRedirected, compatibilityRedirectPresent },
    summary: { uniqueKnowledgeMigrationRequired: false, uniqueRuntimeMigrationRequired: false, legacyProductSummaryRetired: true, redirectReady }
  };
}

const report = auditFilosofiLegacyStub();
if (!report.summary.redirectReady) {
  console.error(JSON.stringify(report, null, 2));
  throw new Error('Filosofi legacy stub er ikke redirect-klar.');
}
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
