import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditRepository } from './audit-fagverk-general-engine.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LEGACY_ARCHIVE = 'data/fag/religion/archive/merke_religion_legacy_20260828.html';
const COMPATIBILITY_PAGE = 'data/fag/religion/merke_religion.html';
const BADGE = 'data/badges/religion.json';
const REGISTRY = 'data/fagverk/fagverk_registry.json';
const READINESS = 'data/fag/religion/religion_university_readiness_v1.json';
const PORTAL = 'data/fagverk/fagverk_portal.json';
const TARGET = 'fagverk.html?subject=religion#fagverkIaProgresjon';
const RELATIVE_TARGET = '../../../fagverk.html?subject=religion#fagverkIaProgresjon';

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

export function auditReligionLegacyStub() {
  for (const file of [LEGACY_ARCHIVE, COMPATIBILITY_PAGE, BADGE, REGISTRY, READINESS, PORTAL]) {
    if (!exists(file)) throw new Error(`Religion stub-audit mangler ${file}`);
  }

  const archive = read(LEGACY_ARCHIVE);
  const compatibility = read(COMPATIBILITY_PAGE);
  const badge = readJson(BADGE);
  const registry = readJson(REGISTRY);
  const readiness = readJson(READINESS);
  const portal = readJson(PORTAL);
  const religionRegistry = registry.subjects?.religion;
  if (!religionRegistry) throw new Error('Religion mangler i Fagverk-registeret.');
  const general = auditRepository({ checkReport: false });
  const generalRow = general.materializedRows.find((row) => row.id === 'religion');
  if (!generalRow) throw new Error('Religion mangler i general-engine-projeksjonen.');

  const archiveText = stripHtml(archive);
  const canonicalCorpus = normalize(flattenStrings([badge, religionRegistry, readiness]).join(' '));
  const anchors = [
    ['tro'],
    ['ritual', 'ritualer'],
    ['hellige rom'],
    ['religiøse tradisjoner', 'tradisjoner'],
    ['historie'],
    ['samfunn'],
    ['kildebasert'],
    ['respektfull'],
    ['dokumentert observasjon'],
    ['antakelser om tro'],
    ['internt mangfoldige']
  ].map((alternatives) => anchor(canonicalCorpus, alternatives));
  const missingAnchors = anchors.filter((item) => !item.found).map((item) => item.alternatives);

  const archiveLinks = hrefs(archive);
  const expectedArchiveLinks = [
    '../../../merker/merker.html',
    '../../../fagverk.html?subject=religion',
    '../../../fagverk-forside.html'
  ];
  const unknownArchiveLinks = archiveLinks.filter((href) => !expectedArchiveLinks.includes(href));

  const noIndependentRuntime = !/<script\b/i.test(archive)
    && !/<form\b/i.test(archive)
    && !/<button\b/i.test(archive)
    && !/class=["'][^"']*merke-blokk/i.test(archive);
  const structureSummaryPresent = /fire fagområder, åtte emner og åtte metoder/i.test(archiveText);
  const compatibilityRedirectPresent = compatibility.includes('location.replace')
    && compatibility.includes(RELATIVE_TARGET)
    && !/Religionsfaget samler|kildebasert og respektfullt studieløp/i.test(compatibility);
  const portalEntry = portal.categories?.find((item) => item.id === 'religion');
  const portalRedirected = portalEntry?.badgePage === TARGET;

  const redirectReady = noIndependentRuntime
    && missingAnchors.length === 0
    && unknownArchiveLinks.length === 0
    && structureSummaryPresent
    && compatibilityRedirectPresent
    && portalRedirected;

  return {
    schema: 'history_go_fagverk_religion_legacy_stub_audit_v1',
    subject: 'religion',
    legacy: {
      archive: LEGACY_ARCHIVE,
      compatibilityPage: COMPATIBILITY_PAGE,
      archiveCharacterCount: archiveText.length,
      archiveLinkCount: archiveLinks.length,
      noIndependentRuntime,
      structureSummary: {
        role: 'legacy_product_summary',
        present: structureSummaryPresent,
        migrateAsKnowledge: false,
        note: '4/8/8 is a compact legacy surface summary, not an independent knowledge unit. Current product counts are derived by the canonical Fagverk engine.'
      }
    },
    canonical: {
      badge: BADGE,
      registry: REGISTRY,
      universityReadiness: READINESS,
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
      legacyProductSummaryRetired: structureSummaryPresent,
      redirectReady
    }
  };
}

const report = auditReligionLegacyStub();
if (!report.summary.redirectReady) {
  console.error(JSON.stringify(report, null, 2));
  throw new Error('Religion legacy stub er ikke redirect-klar.');
}
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
