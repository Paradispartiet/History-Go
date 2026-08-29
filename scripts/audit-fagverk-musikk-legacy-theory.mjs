import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { auditRepository as auditMusikkRepository } from './audit-fagverk-musikk.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LEGACY_BADGE = 'data/fag/musikk/archive/merke_musikk_full_teori_legacy_20260829.html';
const COMPATIBILITY = 'data/fag/musikk/merke_musikk (1).html';
const MANIFEST = 'data/fag/fag_manifest.json';
const PORTAL = 'data/fagverk/fagverk_portal.json';
const CATEGORY_CONTRACT = 'data/categories/category_contract.json';
const BADGE = 'data/badges/musikk.json';
const REPORT = 'reports/fagverk/musikk-legacy-theory-audit.json';
const TARGET = 'fagverk.html?subject=musikk#fagverkIaProgresjon';
const RELATIVE_TARGET = '../../../fagverk.html?subject=musikk#fagverkIaProgresjon';
const MANIFEST_FIELDS = Object.freeze(['pensum', 'emner', 'fagkart', 'methods']);

const SECTION_POLICY = Object.freeze([
  {
    id: 'felt',
    heading: '1. Felt',
    anchors: [
      ['komponering', 'komposisjon'], ['improvisasjon'], ['fremføring', 'framføring'], ['lytting'],
      ['innspilling'], ['produksjon'], ['distribusjon'], ['verk'], ['artist', 'utøver'],
      ['instrument'], ['scene'], ['studio'], ['musikkmiljø', 'musikkliv']
    ]
  },
  {
    id: 'musikalsk_form',
    heading: '2. Musikalsk form',
    anchors: [
      ['rytme'], ['puls'], ['tempo'], ['melodi'], ['harmoni'], ['klang'], ['form'],
      ['arrangement'], ['improvisasjon'], ['stemme'], ['instrument'], ['ensemble']
    ]
  },
  {
    id: 'utovelse',
    heading: '3. Utøvelse',
    anchors: [
      ['kropp', 'kroppslig'], ['teknikk'], ['samspill'], ['fortolkning', 'tolkning'], ['nærvær'],
      ['konsert'], ['musikkscene', 'scene'], ['scenekunst']
    ]
  },
  {
    id: 'produksjon_teknologi',
    heading: '4. Produksjon og teknologi',
    anchors: [
      ['studio'], ['mikrofon'], ['instrument'], ['forsterker', 'lydsystem', 'lydforsterkning'], ['programvare', 'software'],
      ['miksing', 'mix'], ['mastering'], ['teknologi']
    ]
  },
  {
    id: 'sjangere_miljoer',
    heading: '5. Sjangere og miljøer',
    anchors: [
      ['sjanger'], ['identitet'], ['publikum'], ['jazz'], ['klassisk'], ['pop'], ['rock'],
      ['hiphop', 'hip hop'], ['elektronisk musikk', 'elektronika'], ['verk'], ['person', 'utøver'],
      ['sted'], ['historisk kilde', 'kilde']
    ]
  },
  {
    id: 'scener_infrastruktur',
    heading: '6. Scener og infrastruktur',
    anchors: [
      ['konsertsted', 'konsertscene'], ['klubb'], ['festival'], ['studio'], ['plateselskap'],
      ['radio'], ['strømmetjeneste', 'streaming'], ['distribusjon', 'sirkulasjon'], ['minne', 'arkiv']
    ]
  },
  {
    id: 'musikk_samfunn',
    heading: '7. Musikk og samfunn',
    anchors: [
      ['fellesskap'], ['identitet'], ['politisk', 'politikk'], ['økonomi'], ['subkultur'],
      ['motkultur', 'motkulturell', 'motstand']
    ],
    legacyProductMechanics: ['secondary_badge_routing']
  },
  {
    id: 'kjernebegreper',
    heading: '8. Kjernebegreper',
    anchors: [
      ['rytme'], ['melodi'], ['harmoni'], ['klang'], ['komposisjon'], ['improvisasjon'],
      ['arrangement'], ['fortolkning', 'tolkning'], ['ensemble'], ['samspill'], ['sjanger'],
      ['scene'], ['innspilling'], ['miks', 'miksing'], ['produksjon'], ['resepsjon'], ['publikum']
    ]
  }
]);

const abs = file => path.join(ROOT, file);
const read = file => fs.readFileSync(abs(file), 'utf8');
const readJson = file => JSON.parse(read(file));
const exists = file => fs.existsSync(abs(file));
const text = value => String(value == null ? '' : value).trim();

function normalize(value) {
  return text(value).toLocaleLowerCase('nb-NO').normalize('NFKC')
    .replace(/[«»“”„"'’`´]/g, '')
    .replace(/[^a-zæøå0-9]+/gi, ' ')
    .replace(/\s+/g, ' ').trim();
}

function decodeEntities(value) {
  return value.replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&nbsp;', ' ');
}

function stripHtml(value) {
  return decodeEntities(value)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractSections(html) {
  const sections = [];
  for (const match of html.matchAll(/<section\b[^>]*class=["'][^"']*merke-blokk[^"']*["'][^>]*>([\s\S]*?)<\/section>/gi)) {
    const body = match[1];
    const heading = stripHtml(body.match(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/i)?.[1] || '');
    sections.push({ heading, content: stripHtml(body) });
  }
  return sections;
}

function flattenStrings(value, out = []) {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) for (const item of value) flattenStrings(item, out);
  else if (value && typeof value === 'object') for (const item of Object.values(value)) flattenStrings(item, out);
  return out;
}

function fileJson(file) {
  if (!exists(file)) throw new Error(`Musikk legacy-audit mangler canonical fil: ${file}`);
  return readJson(file);
}

function manifestOwnedCore() {
  const manifest = fileJson(MANIFEST);
  const subject = manifest.musikk || {};
  const files = MANIFEST_FIELDS.map(field => {
    const pointer = text(subject[field]).replaceAll('\\', '/');
    if (!pointer || pointer.startsWith('/') || pointer.includes('..')) throw new Error(`Musikk-manifestet mangler gyldig ${field}-peker.`);
    const file = `data/fag/${pointer}`;
    if (!file.startsWith('data/fag/musikk/') || !exists(file)) throw new Error(`Musikk-manifestets ${field}-peker er ugyldig: ${pointer}`);
    return file;
  });
  if (text(subject.scientificPackage) !== 'musikk/scientific_package.json') throw new Error('Musikk-manifestet peker ikke til forventet scientificPackage.');
  return [...new Set(files)].sort();
}

function canonicalCorpus(audit) {
  const values = [];
  const manifestFiles = manifestOwnedCore();
  for (const file of manifestFiles) values.push(fileJson(file));
  values.push(audit.source.index, audit.source.domainCatalog, audit.source.methods, ...audit.source.modules);
  const chapterFiles = [];
  for (const chapter of audit.chapterAudits) {
    const owned = [chapter.chapterFile, chapter.briefFile, chapter.claimsFile, ...chapter.moduleFiles, ...chapter.evidenceFiles];
    chapterFiles.push(...owned);
    for (const file of owned) values.push(fileJson(file));
  }
  const categories = fileJson(CATEGORY_CONTRACT);
  const badge = fileJson(BADGE);
  values.push(categories.decisions?.musikk || {}, categories.decisions?.scenekunst || {}, categories.decisions?.subkultur || {}, badge);
  const corpus = normalize(flattenStrings(values).join(' '));
  return { corpus, manifestFiles, chapterFiles: [...new Set(chapterFiles)].sort() };
}

function anchorResult(corpus, alternatives) {
  const found = alternatives.find(candidate => corpus.includes(normalize(candidate)));
  return { alternatives, found: found || null };
}

export function auditMusikkLegacyTheory() {
  for (const file of [LEGACY_BADGE, COMPATIBILITY, MANIFEST, PORTAL, CATEGORY_CONTRACT, BADGE]) {
    if (!exists(file)) throw new Error(`Musikk legacy-audit mangler ${file}`);
  }

  const subjectAudit = auditMusikkRepository({ writeReport: false, checkReport: true });
  if (subjectAudit.report.summary.domainCount !== 8 || subjectAudit.report.summary.emneCount !== 48 || subjectAudit.report.summary.methodCount !== 18 || subjectAudit.report.summary.chapterCount !== 8) {
    throw new Error('Musikk canonical subject-audit har uventet inventar; legacy-equivalence kan ikke kjøres sikkert.');
  }
  if (subjectAudit.report.authorityBoundary?.scientificAuthority !== 'this_package') {
    throw new Error('Musikk scientific package er ikke canonical authority.');
  }
  if (subjectAudit.report.authorityBoundary?.scenekunstSeparateTopLevelSubject !== true || subjectAudit.report.authorityBoundary?.performanceStudyInScope !== true) {
    throw new Error('Musikk/Scenekunst-grensen er ikke canonicalt låst.');
  }

  const sections = extractSections(read(LEGACY_BADGE));
  if (sections.length !== SECTION_POLICY.length) throw new Error(`Musikk legacy-side skal ha ${SECTION_POLICY.length} fagseksjoner, fant ${sections.length}.`);
  for (let i = 0; i < SECTION_POLICY.length; i += 1) {
    if (sections[i].heading !== SECTION_POLICY[i].heading) throw new Error(`Musikk legacy-seksjon ${i + 1} har uventet heading: ${sections[i].heading}`);
  }

  const { corpus, manifestFiles, chapterFiles } = canonicalCorpus(subjectAudit);
  if (corpus.length < 100000) throw new Error('Canonical Musikk-korpus er uventet lite; audit kan ikke kjøres sikkert.');

  const rows = SECTION_POLICY.map((policy, index) => {
    const anchors = policy.anchors.map(alternatives => anchorResult(corpus, alternatives));
    const foundCount = anchors.filter(anchor => anchor.found).length;
    const missingAnchors = anchors.filter(anchor => !anchor.found).map(anchor => anchor.alternatives);
    const anchorCoverage = Number((foundCount / anchors.length).toFixed(3));
    return {
      id: policy.id,
      heading: policy.heading,
      role: 'knowledge',
      legacyCharacterCount: sections[index].content.length,
      anchorCount: anchors.length,
      foundCount,
      anchorCoverage,
      anchors,
      missingAnchors,
      legacyProductMechanics: policy.legacyProductMechanics || [],
      contentStatus: anchorCoverage === 1
        ? 'canonical_anchor_coverage_complete_claim_review_pending'
        : 'canonical_anchor_gaps_manual_review_required'
    };
  });

  const portal = readJson(PORTAL);
  const portalEntry = portal.categories?.find(item => item.id === 'musikk');
  if (!portalEntry) throw new Error('Musikk mangler i Fagverk-portalen.');
  const compatibilityHtml = read(COMPATIBILITY);
  const compatibilityRedirectPresent = compatibilityHtml.includes('location.replace')
    && compatibilityHtml.includes(RELATIVE_TARGET)
    && !/merke-blokk|<h2>1\. Felt<\/h2>|sekundærbadge/i.test(compatibilityHtml);
  const portalRedirected = portalEntry.badgePage === TARGET;

  const manualReview = rows.filter(row => row.anchorCoverage < 1).map(row => row.id);
  return {
    schema: 'history_go_fagverk_musikk_legacy_theory_audit_v1',
    subject: 'musikk',
    legacy: {
      badgePage: LEGACY_BADGE,
      compatibilityPage: COMPATIBILITY,
      sectionCount: rows.length,
      knowledgeSectionCount: rows.length,
      productMechanicCount: rows.reduce((count, row) => count + row.legacyProductMechanics.length, 0)
    },
    canonical: {
      authority: subjectAudit.report.authorityBoundary.scientificAuthority,
      manifestFiles,
      domainCount: subjectAudit.report.summary.domainCount,
      emneCount: subjectAudit.report.summary.emneCount,
      methodCount: subjectAudit.report.summary.methodCount,
      chapterCount: subjectAudit.report.summary.chapterCount,
      chapterOwnedFileCount: chapterFiles.length,
      corpusCharacterCount: corpus.length,
      scenekunstSeparateTopLevelSubject: subjectAudit.report.authorityBoundary.scenekunstSeparateTopLevelSubject,
      performanceStudyInScope: subjectAudit.report.authorityBoundary.performanceStudyInScope
    },
    navigation: {
      badgePage: portalEntry.badgePage,
      subjectPage: portalEntry.subjectPage,
      target: TARGET,
      portalRedirected,
      compatibilityRedirectPresent,
      routeRetired: portalRedirected && compatibilityRedirectPresent
    },
    summary: {
      knowledgeSectionCount: rows.length,
      anchorCompleteCount: rows.filter(row => row.anchorCoverage === 1).length,
      manualReviewCount: manualReview.length,
      manualReview,
      redirectReady: false,
      redirectBlockReason: 'Raw Musikk anchor coverage never authorizes redirect by itself. Route readiness is owned by the explicit Musikk legacy adjudication gate.'
    },
    rows
  };
}

const args = new Set(process.argv.slice(2));
const report = auditMusikkLegacyTheory();
if (args.has('--write-report')) {
  fs.mkdirSync(path.dirname(abs(REPORT)), { recursive: true });
  fs.writeFileSync(abs(REPORT), `${JSON.stringify(report, null, 2)}\n`);
} else if (!args.has('--no-check-report') && exists(REPORT)) {
  const committed = readJson(REPORT);
  if (!isDeepStrictEqual(committed, report)) throw new Error(`${REPORT} er utdatert. Kjør node scripts/audit-fagverk-musikk-legacy-theory.mjs --write-report`);
}
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
