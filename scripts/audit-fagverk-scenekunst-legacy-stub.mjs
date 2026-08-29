import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditRepository } from './audit-fagverk-general-engine.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARCHIVE = 'data/fag/scenekunst/archive/merke_scenekunst_legacy_20260829.html';
const COMPATIBILITY = 'data/fag/scenekunst/merke_scenekunst.html';
const BADGE = 'data/badges/scenekunst.json';
const CATEGORIES = 'data/categories/category_contract.json';
const MANIFEST = 'data/fag/fag_manifest.json';
const REGISTRY = 'data/fagverk/fagverk_registry.json';
const PORTAL = 'data/fagverk/fagverk_portal.json';
const TARGET = 'fagverk.html?subject=scenekunst#fagverkIaProgresjon';
const RELATIVE_TARGET = '../../../fagverk.html?subject=scenekunst#fagverkIaProgresjon';

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
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
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
  return file.startsWith('data/fag/scenekunst/') && exists(file) ? file : '';
}

export function auditScenekunstLegacyStub() {
  for (const file of [ARCHIVE, COMPATIBILITY, BADGE, CATEGORIES, MANIFEST, REGISTRY, PORTAL]) {
    if (!exists(file)) throw new Error(`Scenekunst stub-audit mangler ${file}`);
  }

  const archive = read(ARCHIVE);
  const compatibility = read(COMPATIBILITY);
  const badge = readJson(BADGE);
  const categories = readJson(CATEGORIES);
  const manifest = readJson(MANIFEST);
  const registry = readJson(REGISTRY);
  const portal = readJson(PORTAL);
  const manifestEntry = manifest.scenekunst || {};
  const subjectRegistry = registry.subjects?.scenekunst;
  if (!subjectRegistry) throw new Error('Scenekunst mangler i Fagverk-registeret.');

  const sourceFiles = ['pensum', 'emner', 'fagkart', 'methods']
    .map((field) => resolveManifestPointer(manifestEntry[field]))
    .filter(Boolean);
  if (sourceFiles.length !== 4) throw new Error(`Scenekunst-manifestet løste ${sourceFiles.length}/4 kjernefiler.`);

  const general = auditRepository({ checkReport: false });
  const generalRow = general.materializedRows.find((row) => row.id === 'scenekunst');
  if (!generalRow) throw new Error('Scenekunst mangler i general-engine-projeksjonen.');

  const canonicalCorpus = normalize(flattenStrings([
    badge,
    categories.decisions?.scenekunst,
    subjectRegistry,
    ...sourceFiles.map((file) => readJson(file))
  ]).join(' '));
  const anchors = [
    ['teater'],
    ['dans'],
    ['musikal', 'musikkteater'],
    ['revy'],
    ['standup', 'stand up'],
    ['improvisasjon', 'impro'],
    ['scenografi'],
    ['regi', 'regissør'],
    ['dramaturgi', 'dramaturg'],
    ['levende fremføring', 'live performance', 'performance', 'fremføring']
  ].map((alternatives) => anchor(canonicalCorpus, alternatives));
  const missingAnchors = anchors.filter((item) => !item.found).map((item) => item.alternatives);

  const archiveLinks = hrefs(archive);
  const expectedArchiveLinks = [
    '../../../fagverk.html?subject=scenekunst',
    '../../../fagverk-forside.html',
    '../../../merker/merker.html'
  ];
  const unknownArchiveLinks = archiveLinks.filter((href) => !expectedArchiveLinks.includes(href));
  const noIndependentRuntime = !/<script\b/i.test(archive)
    && !/<form\b/i.test(archive)
    && !/<button\b/i.test(archive)
    && !/class=["'][^"']*merke-blokk/i.test(archive);
  const compatibilityRedirectPresent = compatibility.includes('location.replace')
    && compatibility.includes(RELATIVE_TARGET)
    && !/Teater, dans, musikal, revy|scenografi, regi, dramaturgi/i.test(compatibility);
  const portalEntry = portal.categories?.find((item) => item.id === 'scenekunst');
  const portalRedirected = portalEntry?.badgePage === TARGET;

  const redirectReady = noIndependentRuntime
    && missingAnchors.length === 0
    && unknownArchiveLinks.length === 0
    && compatibilityRedirectPresent
    && portalRedirected;

  return {
    schema: 'history_go_fagverk_scenekunst_legacy_stub_audit_v1',
    subject: 'scenekunst',
    legacy: {
      archive: ARCHIVE,
      compatibilityPage: COMPATIBILITY,
      archiveCharacterCount: stripHtml(archive).length,
      archiveLinkCount: archiveLinks.length,
      noIndependentRuntime
    },
    canonical: {
      badge: BADGE,
      categoryContract: CATEGORIES,
      registry: REGISTRY,
      manifestSourceFiles: sourceFiles,
      runtimeCounts: {
        domainCount: generalRow.domainCount,
        emneCount: generalRow.emneCount,
        methodCount: generalRow.methodCount,
        chapterCount: generalRow.chapterCount
      },
      descriptiveAnchors: anchors,
      missingDescriptiveAnchors: missingAnchors
    },
    navigation: {
      archiveLinks,
      expectedArchiveLinks,
      unknownArchiveLinks,
      target: TARGET,
      portalRoute: portalEntry?.badgePage || null,
      portalRedirected,
      compatibilityRedirectPresent
    },
    summary: {
      uniqueKnowledgeMigrationRequired: false,
      uniqueRuntimeMigrationRequired: false,
      redirectReady
    }
  };
}

const report = auditScenekunstLegacyStub();
if (!report.summary.redirectReady) {
  console.error(JSON.stringify(report, null, 2));
  throw new Error('Scenekunst legacy stub er ikke redirect-klar.');
}
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
