import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditRepository } from './audit-fagverk-general-engine.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARCHIVE = 'data/fag/psykologi/archive/merke_psykologi_legacy_20260829.html';
const COMPATIBILITY = 'data/fag/psykologi/merke_psykologi (1).html';
const ORIGINAL_BLOB_SHA = 'c27f90e7d197f8a410d90cb5d31926a7922224dd';
const BADGE = 'data/badges/psykologi.json';
const CATEGORIES = 'data/categories/category_contract.json';
const MANIFEST = 'data/fag/fag_manifest.json';
const REGISTRY = 'data/fagverk/fagverk_registry.json';
const PORTAL = 'data/fagverk/fagverk_portal.json';
const BADGE_INDEX = 'merker/merker.html';
const FAGVERK_PAGE = 'fagverk.html';
const BADGE_PROGRESS = 'js/fagverk-ia-v3-badge-progress.js';
const GLOBAL_PROGRESS = 'emner.html';
const KNOWLEDGE_PAGE = 'knowledge.html';
const TARGET = 'fagverk.html?subject=psykologi#fagverkIaProgresjon';
const RELATIVE_TARGET = '../../../fagverk.html?subject=psykologi#fagverkIaProgresjon';
const LEGACY_KNOWLEDGE_ROUTE = '../knowledge/knowledge_psykologi.html';
const CANONICAL_KNOWLEDGE_ROUTE = 'knowledge.html?subject=psykologi';
const LEGACY_KNOWLEDGE_REDIRECT = '../../../knowledge.html?subject=psykologi';

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
  return file.startsWith('data/fag/psykologi/') && exists(file) ? file : '';
}
function gitBlobSha(content) {
  const body = Buffer.from(content, 'utf8');
  return crypto.createHash('sha1')
    .update(Buffer.from(`blob ${body.length}\0`, 'utf8'))
    .update(body)
    .digest('hex');
}
function resolveLegacyRoute(href) {
  return path.posix.normalize(path.posix.join(path.posix.dirname(COMPATIBILITY), href));
}
function isLegacyNavigationChrome(href) {
  return href === '../../../index.html'
    || href === '../../../fagverk-forside.html'
    || href === '../../../fagverk.html?subject=psykologi'
    || /^\.\.\/[^/]+\/merke_[^/]+\.html$/.test(href);
}

export function auditPsykologiLegacyStub() {
  for (const file of [ARCHIVE, COMPATIBILITY, BADGE, CATEGORIES, MANIFEST, REGISTRY, PORTAL, BADGE_INDEX, FAGVERK_PAGE, BADGE_PROGRESS, GLOBAL_PROGRESS, KNOWLEDGE_PAGE]) {
    if (!exists(file)) throw new Error(`Psykologi stub-audit mangler ${file}`);
  }

  const archive = read(ARCHIVE);
  const compatibility = read(COMPATIBILITY);
  const badge = readJson(BADGE);
  const categories = readJson(CATEGORIES);
  const manifest = readJson(MANIFEST);
  const registry = readJson(REGISTRY);
  const portal = readJson(PORTAL);
  const badgeIndex = read(BADGE_INDEX);
  const fagverkPage = read(FAGVERK_PAGE);
  const badgeProgress = read(BADGE_PROGRESS);
  const manifestEntry = manifest.psykologi || {};
  const subjectRegistry = registry.subjects?.psykologi;
  if (!subjectRegistry) throw new Error('Psykologi mangler i Fagverk-registeret.');

  const sourceFiles = ['pensum', 'emner', 'fagkart', 'methods']
    .map((field) => resolveManifestPointer(manifestEntry[field]))
    .filter(Boolean);
  if (sourceFiles.length !== 4) throw new Error(`Psykologi-manifestet løste ${sourceFiles.length}/4 kjernefiler.`);

  const general = auditRepository({ checkReport: false });
  const generalRow = general.materializedRows.find((row) => row.id === 'psykologi');
  if (!generalRow) throw new Error('Psykologi mangler i general-engine-projeksjonen.');

  const canonicalCorpus = normalize(flattenStrings([
    badge,
    categories.decisions?.psykologi,
    subjectRegistry,
    ...sourceFiles.map((file) => readJson(file))
  ]).join(' '));

  const knowledgeAnchors = [
    ['psykisk helse'],
    ['fagtradisjoner', 'fagtradisjon'],
    ['institusjoner', 'institusjon'],
    ['behandlingsformer', 'behandling'],
    ['opplevelse', 'opplever'],
    ['følelser', 'følelse', 'affekt'],
    ['tenkning', 'kognisjon'],
    ['handling', 'atferd'],
    ['klinikk', 'klinikker'],
    ['normalitet'],
    ['stigma'],
    ['psykoanalyse'],
    ['kognitiv psykologi'],
    ['diagnose', 'diagnoser'],
    ['makt'],
    ['omsorg'],
    ['sosialpsykologi', 'sosial prosess'],
    ['psykologihistorie', 'vitenskapshistorisk']
  ].map((alternatives) => anchor(canonicalCorpus, alternatives));
  const missingKnowledgeAnchors = knowledgeAnchors.filter((item) => !item.found).map((item) => item.alternatives);

  const archiveLinks = hrefs(archive);
  const legacyKnowledgeRoutePresent = archiveLinks.includes(LEGACY_KNOWLEDGE_ROUTE);
  const legacyKnowledgeTarget = resolveLegacyRoute(LEGACY_KNOWLEDGE_ROUTE);
  const legacyKnowledgeTargetExists = exists(legacyKnowledgeTarget);
  const legacyKnowledgeTargetSource = legacyKnowledgeTargetExists ? read(legacyKnowledgeTarget) : '';
  const legacyKnowledgeTargetCanonical = legacyKnowledgeTargetExists
    && legacyKnowledgeTargetSource.includes(`rel="canonical" href="${LEGACY_KNOWLEDGE_REDIRECT}"`)
    && legacyKnowledgeTargetSource.includes(`location.replace("${LEGACY_KNOWLEDGE_REDIRECT}"`);
  const legacyNavigationLinks = archiveLinks.filter(isLegacyNavigationChrome);
  const unknownArchiveLinks = archiveLinks.filter((href) => href !== LEGACY_KNOWLEDGE_ROUTE && !isLegacyNavigationChrome(href));

  const sectionCount = (archive.match(/class=["'][^"']*merke-blokk/g) || []).length;
  if (sectionCount !== 3) throw new Error(`Psykologi legacy-stub skal ha tre korte blokker, fant ${sectionCount}.`);

  const archiveBlobSha = gitBlobSha(archive);
  const archiveBlobMatchesOriginal = archiveBlobSha === ORIGINAL_BLOB_SHA;
  const noIndependentRuntime = !/<script\b/i.test(archive)
    && !/<form\b/i.test(archive)
    && !/\bonclick\s*=|\bonchange\s*=|\baddEventListener\s*\(/i.test(archive);

  const portalEntry = portal.categories?.find((item) => item.id === 'psykologi');
  const portalRedirected = portalEntry?.badgePage === TARGET;
  const compatibilityRedirectPresent = compatibility.includes('location.replace')
    && compatibility.includes(RELATIVE_TARGET)
    && !/Hva er dette feltet\?|Kobling til din kunnskap|psykoanalyse til kognitiv psykologi/i.test(compatibility);
  const badgeIndexRedirected = badgeIndex.includes(`href="../${TARGET}"`)
    && !badgeIndex.includes('href="../data/fag/psykologi/merke_psykologi (1).html"');
  const globalProgressLinked = /href="emner\.html"[^>]*>\s*Min læring\s*</i.test(fagverkPage);
  const globalProgressExists = exists(GLOBAL_PROGRESS);
  const subjectKnowledgeActionPresent = badgeProgress.includes('knowledge.html?subject=${encodeURIComponent(model.subject.id)}')
    && badgeProgress.includes('Åpne fagets kunnskapsprofil →');

  const productSummary = {
    role: 'legacy_subject_knowledge_navigation',
    legacyKnowledgeRoute: LEGACY_KNOWLEDGE_ROUTE,
    legacyKnowledgeTarget,
    legacyKnowledgeRoutePresent,
    legacyKnowledgeTargetExists,
    legacyKnowledgeTargetCanonical,
    canonicalKnowledgeRoute: CANONICAL_KNOWLEDGE_ROUTE,
    subjectKnowledgeActionPresent,
    currentProgressEquivalent: portalRedirected && globalProgressExists && globalProgressLinked && subjectKnowledgeActionPresent,
    migrateAsKnowledge: false
  };

  const redirectReady = archiveBlobMatchesOriginal
    && noIndependentRuntime
    && missingKnowledgeAnchors.length === 0
    && unknownArchiveLinks.length === 0
    && productSummary.legacyKnowledgeRoutePresent
    && productSummary.legacyKnowledgeTargetExists
    && productSummary.legacyKnowledgeTargetCanonical
    && productSummary.currentProgressEquivalent
    && compatibilityRedirectPresent
    && portalRedirected
    && badgeIndexRedirected;

  return {
    schema: 'history_go_fagverk_psykologi_legacy_stub_audit_v1',
    subject: 'psykologi',
    legacy: {
      archive: ARCHIVE,
      compatibilityPage: COMPATIBILITY,
      originalBlobSha: ORIGINAL_BLOB_SHA,
      archiveBlobSha,
      archiveBlobMatchesOriginal,
      sectionCount,
      archiveCharacterCount: stripHtml(archive).length,
      archiveLinkCount: archiveLinks.length,
      noIndependentRuntime,
      productSummary
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
      knowledgeAnchors,
      missingKnowledgeAnchors
    },
    navigation: {
      archiveLinks,
      legacyNavigationLinks,
      unknownArchiveLinks,
      target: TARGET,
      portalRoute: portalEntry?.badgePage || null,
      portalRedirected,
      badgeIndexRedirected,
      compatibilityRedirectPresent,
      globalProgressPage: GLOBAL_PROGRESS,
      globalProgressExists,
      globalProgressLinked,
      canonicalKnowledgePage: KNOWLEDGE_PAGE,
      canonicalKnowledgeRoute: CANONICAL_KNOWLEDGE_ROUTE,
      subjectKnowledgeActionPresent
    },
    summary: {
      uniqueKnowledgeMigrationRequired: false,
      uniqueRuntimeMigrationRequired: false,
      legacyKnowledgeNavigationMigrated: legacyKnowledgeRoutePresent && legacyKnowledgeTargetCanonical && subjectKnowledgeActionPresent,
      redirectReady
    }
  };
}

const report = auditPsykologiLegacyStub();
if (!report.summary.redirectReady) {
  console.error(JSON.stringify(report, null, 2));
  throw new Error('Psykologi legacy stub er ikke redirect-klar.');
}
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
