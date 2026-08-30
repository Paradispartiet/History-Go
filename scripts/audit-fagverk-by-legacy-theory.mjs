import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const LEGACY_BADGE = 'data/fag/by/archive/merke_by_full_teori_legacy_20260830.html';
const LEGACY_ROUTE = 'data/fag/by/merke_by.html';
const LEGACY_THEORY = 'data/fag/by/teori.html';
const MANIFEST = 'data/fag/fag_manifest.json';
const REGISTRY = 'data/fagverk/fagverk_registry.json';
const ORIGINAL_BLOB_SHA = 'bdc5ffef999db78ab2670571615f7fcf1327216f';
const REDIRECT_TARGET = '../../../fagverk.html?subject=by#fagverkIaProgresjon';

const SECTION_POLICY = Object.freeze({
  felt: {
    role: 'knowledge',
    anchors: [
      ['byrom'],
      ['infrastruktur'],
      ['mobilitet', 'bevegelse'],
      ['planlegging', 'planmakt'],
      ['eierskap', 'eiendom']
    ]
  },
  normativ: {
    role: 'knowledge',
    anchors: [
      ['tilgjengelig'],
      ['estet'],
      ['bærekraft', 'baerekraft'],
      ['funksjon'],
      ['orienter', 'lesbarhet']
    ]
  },
  doxa: {
    role: 'knowledge',
    anchors: [
      ['makt'],
      ['eksklud', 'inklud'],
      ['atferd', 'bruk'],
      ['hierarki', 'ulikhet'],
      ['grense', 'territori']
    ]
  },
  metode: {
    role: 'knowledge',
    anchors: [
      ['romlig analyse', 'gis'],
      ['mobilitet', 'gåanalyse'],
      ['feltobservasjon', 'etnografi'],
      ['material'],
      ['før/etter', 'historiske lag', 'tidssnitt']
    ]
  },
  materiell: {
    role: 'knowledge',
    anchors: [
      ['materialitet', 'materialbruk'],
      ['infrastruktur'],
      ['betong', 'tegl', 'stål', 'tre'],
      ['teknisk anlegg', 'ledningsnett', 'energi'],
      ['bygg', 'fasade']
    ]
  },
  sosial: {
    role: 'knowledge',
    anchors: [
      ['nabolag'],
      ['eierskap', 'eiendom'],
      ['offentlig rom', 'offentlighet'],
      ['klasse', 'ulikhet'],
      ['sosial kontroll', 'makt']
    ]
  },
  geografisk: {
    role: 'knowledge',
    anchors: [
      ['topografi'],
      ['grunnforhold'],
      ['landskap'],
      ['strandlinje', 'vannkant'],
      ['romlig', 'geografi']
    ]
  },
  temporal: {
    role: 'knowledge',
    anchors: [
      ['historiske lag', 'palimpsest'],
      ['bevaring', 'vern'],
      ['transformasjon', 'ombruk'],
      ['riving', 'rivning', 'sanering'],
      ['modernisme', 'arkitektonisk epoke', 'stilperiode']
    ]
  },
  blindsoner: {
    role: 'knowledge',
    anchors: [
      ['tilgang', 'tilgjengelig'],
      ['privatisering', 'privat rom'],
      ['vedlikehold', 'bydrift'],
      ['ulikhet', 'eksklud'],
      ['økonomi', 'eiendom']
    ]
  },
  begreper: {
    role: 'knowledge',
    anchors: [
      ['romlig orden'],
      ['infrastruktur'],
      ['bevegelseslinje', 'ganglinje'],
      ['sted'],
      ['territorium', 'territori'],
      ['materialitet'],
      ['sosioteknisk']
    ]
  },
  bidrag: {
    role: 'legacy_product_copy',
    anchors: []
  }
});

const text = (value) => String(value == null ? '' : value).trim();
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(ROOT, file));

function blobSha(buffer) {
  return crypto.createHash('sha1').update(Buffer.from(`blob ${buffer.length}\0`)).update(buffer).digest('hex');
}

function decodeEntities(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&#039;', "'")
    .replaceAll('&nbsp;', ' ');
}

function stripHtml(value) {
  return decodeEntities(value)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalize(value) {
  return text(value)
    .toLocaleLowerCase('nb-NO')
    .normalize('NFKC')
    .replace(/[«»“”„"'’`´]/g, '')
    .replace(/[^a-zæøå0-9]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenSet(value) {
  const stop = new Set(['og','i','på','av','som','er','et','en','for','til','med','at','det','de','den','der','om','ikke','kan','fra','har','blir','også','eller','hva','hvordan','hvem','sine','sitt','sin']);
  return new Set(normalize(value).split(' ').filter((word) => word.length >= 4 && !stop.has(word)));
}

function jaccard(aText, bText) {
  const a = tokenSet(aText);
  const b = tokenSet(bText);
  if (!a.size && !b.size) return 1;
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const word of a) if (b.has(word)) intersection += 1;
  return Number((intersection / new Set([...a, ...b]).size).toFixed(3));
}

function extractSections(html) {
  const sections = [];
  const regex = /<section\b([^>]*)>([\s\S]*?)<\/section>/gi;
  for (const match of html.matchAll(regex)) {
    const attrs = match[1];
    const body = match[2];
    const className = attrs.match(/class=["']([^"']+)["']/i)?.[1] || '';
    if (!className.split(/\s+/).includes('merke-blokk')) continue;
    const id = attrs.match(/id=["']([^"']+)["']/i)?.[1] || '';
    if (!id) continue;
    const heading = stripHtml(body.match(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/i)?.[1] || id);
    sections.push({ id, heading, text: stripHtml(body) });
  }
  return sections;
}

function flattenStrings(value, out = []) {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) for (const item of value) flattenStrings(item, out);
  else if (value && typeof value === 'object') for (const item of Object.values(value)) flattenStrings(item, out);
  return out;
}

function resolveManifestPointer(pointer) {
  const value = text(pointer).replaceAll('\\', '/');
  if (!value || value.startsWith('/') || value.includes('..')) return '';
  return `data/fag/${value}`;
}

function canonicalFiles() {
  const manifest = JSON.parse(read(MANIFEST));
  const by = manifest.by || {};
  const keys = ['pensum','emner','fagkart','methods','qualityContract','curriculumArchitecture','sourceRegistry'];
  const files = keys.map((key) => resolveManifestPointer(by[key])).filter((file) => file && exists(file));
  return [...new Set(files)];
}

function registryByCorpus() {
  if (!exists(REGISTRY)) return { strings: [], files: [] };
  const registry = JSON.parse(read(REGISTRY));
  const by = registry?.subjects?.by || registry?.by || null;
  if (!by) return { strings: [], files: [] };
  const strings = flattenStrings(by);
  const files = [...new Set(strings.filter((value) => value.endsWith('.json') && exists(value)))];
  for (const file of files) strings.push(...flattenStrings(JSON.parse(read(file))));
  return { strings, files };
}

function anchorResult(corpus, alternatives) {
  const found = alternatives.find((candidate) => corpus.includes(normalize(candidate)));
  return { alternatives, found: found || null };
}

for (const required of [LEGACY_BADGE, LEGACY_ROUTE, LEGACY_THEORY, MANIFEST]) {
  if (!exists(required)) throw new Error(`Mangler nødvendig By-auditfil: ${required}`);
}

const archiveBuffer = fs.readFileSync(path.join(ROOT, LEGACY_BADGE));
const archiveBlobSha = blobSha(archiveBuffer);
if (archiveBlobSha !== ORIGINAL_BLOB_SHA) {
  throw new Error(`By-arkivet er ikke byte-identisk med originalen: ${archiveBlobSha}`);
}
const legacyRouteHtml = read(LEGACY_ROUTE);
if (!legacyRouteHtml.includes('location.replace') || !legacyRouteHtml.includes(REDIRECT_TARGET)) {
  throw new Error('By compatibility-ruten peker ikke fail-closed til Progresjon.');
}
if (/merke-blokk|<h2>1\. Felt<\/h2>|id=["']begreper["']/i.test(legacyRouteHtml)) {
  throw new Error('By compatibility-ruten inneholder fortsatt legacy-teori.');
}

const badgeSections = extractSections(read(LEGACY_BADGE));
const theorySections = extractSections(read(LEGACY_THEORY));
const theoryById = new Map(theorySections.map((section) => [section.id, section]));
const expectedIds = Object.keys(SECTION_POLICY);
const foundIds = badgeSections.map((section) => section.id);
const missingSections = expectedIds.filter((id) => !foundIds.includes(id));
if (missingSections.length) throw new Error(`By-merkesiden mangler forventede legacy-seksjoner: ${missingSections.join(', ')}`);

const sourceFiles = canonicalFiles();
const registry = registryByCorpus();
const canonicalStrings = [];
for (const file of sourceFiles) canonicalStrings.push(...flattenStrings(JSON.parse(read(file))));
canonicalStrings.push(...registry.strings);
const canonicalCorpus = normalize(canonicalStrings.join(' '));
if (canonicalCorpus.length < 1000) throw new Error('Canonical By-korpus er uventet lite; audit kan ikke kjøres sikkert.');

const rows = badgeSections
  .filter((section) => SECTION_POLICY[section.id])
  .map((section) => {
    const policy = SECTION_POLICY[section.id];
    const twin = theoryById.get(section.id);
    const duplicateScore = twin ? jaccard(section.text, twin.text) : 0;
    const anchors = policy.anchors.map((alternatives) => anchorResult(canonicalCorpus, alternatives));
    const foundCount = anchors.filter((row) => row.found).length;
    const anchorCoverage = anchors.length ? Number((foundCount / anchors.length).toFixed(3)) : 1;
    const missingAnchors = anchors.filter((row) => !row.found).map((row) => row.alternatives);
    const duplicateOfTheory = Boolean(twin && duplicateScore >= 0.85);
    const contentStatus = policy.role === 'legacy_product_copy'
      ? 'legacy_product_copy_no_canonical_migration_required'
      : anchorCoverage === 1
        ? 'canonical_anchor_coverage_complete_claim_review_pending'
        : 'canonical_anchor_gaps_manual_review_required';
    return {
      id: section.id,
      heading: section.heading,
      role: policy.role,
      duplicateOfTheory,
      duplicateScore,
      anchorCoverage,
      anchors,
      missingAnchors,
      contentStatus
    };
  });

const knowledgeRows = rows.filter((row) => row.role === 'knowledge');
const anchorCompleteCount = knowledgeRows.filter((row) => row.anchorCoverage === 1).length;
const duplicateCount = rows.filter((row) => row.duplicateOfTheory).length;
const manualReview = knowledgeRows.filter((row) => row.anchorCoverage < 1).map((row) => row.id);

const report = {
  schema: 'history_go_fagverk_by_legacy_theory_audit_v1',
  subject: 'by',
  legacy: {
    badgePage: LEGACY_BADGE,
    compatibilityPage: LEGACY_ROUTE,
    theoryPage: LEGACY_THEORY,
    sectionCount: rows.length,
    duplicateSectionCount: duplicateCount,
    sourcePreserved: true,
    originalBlobSha: ORIGINAL_BLOB_SHA,
    archiveBlobSha
  },
  navigation: {
    redirectTarget: REDIRECT_TARGET.replace(/^\.\.\/\.\.\/\.\.\//, ''),
    legacyRouteActive: false,
    routeRetired: true
  },
  canonical: {
    manifestFiles: sourceFiles,
    registryFiles: registry.files,
    corpusCharacterCount: canonicalCorpus.length
  },
  summary: {
    knowledgeSectionCount: knowledgeRows.length,
    anchorCompleteCount,
    manualReviewCount: manualReview.length,
    manualReview,
    redirectReady: false,
    redirectBlockReason: 'Section-level anchor coverage is evidence for ownership, not sentence-level factual/editorial equivalence. Redirect remains blocked until every knowledge section has an explicit adjudication.'
  },
  rows
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
