import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LEGACY_BADGE = 'data/fag/historie/archive/merke_historie_full_teori_legacy_20260828.html';
const MANIFEST = 'data/fag/fag_manifest.json';
const REGISTRY = 'data/fagverk/fagverk_registry.json';
const REPORT = 'reports/fagverk/historie-legacy-theory-audit.json';

const SECTION_POLICY = Object.freeze({
  felt: {
    role: 'knowledge',
    anchors: [
      ['arkiv'],
      ['spor'],
      ['kilde'],
      ['tolkning', 'fortolkning'],
      ['historiografi', 'historiefortelling', 'historiefortolkning']
    ]
  },
  normativ: {
    role: 'knowledge',
    anchors: [
      ['mangfold', 'plural'],
      ['makt'],
      ['minne'],
      ['etikk', 'ansvar'],
      ['urett', 'rettferdighet']
    ]
  },
  doxa: {
    role: 'knowledge',
    anchors: [
      ['objektiv'],
      ['perspektiv'],
      ['kildekritikk'],
      ['tolkning', 'fortolkning'],
      ['makt']
    ]
  },
  metode: {
    role: 'knowledge',
    anchors: [
      ['arkiv'],
      ['kildekritikk'],
      ['periodisering'],
      ['narrativ'],
      ['kart'],
      ['statistikk'],
      ['foto', 'fotografi']
    ]
  },
  materiell: {
    role: 'knowledge',
    anchors: [
      ['materiell kultur', 'materialitet'],
      ['dokument'],
      ['bygning'],
      ['kart'],
      ['foto', 'fotografi'],
      ['gjenstand']
    ]
  },
  sosial: {
    role: 'knowledge',
    anchors: [
      ['museum'],
      ['arkiv'],
      ['universitet', 'forskning'],
      ['historielag', 'lokalhistorie'],
      ['offentlig historie', 'populærhistorie'],
      ['kulturminne']
    ]
  },
  geografisk: {
    role: 'knowledge',
    anchors: [
      ['sted'],
      ['rom'],
      ['landskap'],
      ['migrasjon'],
      ['lokalhistorie'],
      ['kulturminne']
    ]
  },
  temporal: {
    role: 'knowledge',
    anchors: [
      ['periodisering'],
      ['kontinuitet'],
      ['brudd', 'diskontinuitet'],
      ['samtid'],
      ['ettertid'],
      ['historiske lag', 'tidslag']
    ]
  },
  blindsoner: {
    role: 'knowledge',
    anchors: [
      ['taushet', 'stillhet'],
      ['marginaliser'],
      ['fravær'],
      ['kildehull', 'manglende kilder'],
      ['arkiv'],
      ['hverdagsliv']
    ]
  },
  begreper: {
    role: 'knowledge',
    anchors: [
      ['arkiv'],
      ['spor'],
      ['narrativ'],
      ['diskontinuitet', 'brudd'],
      ['lagdeling', 'tidslag'],
      ['kildekritikk'],
      ['materialitet'],
      ['minnepolitikk', 'minnets politikk']
    ]
  },
  bidrag: {
    role: 'legacy_product_copy',
    anchors: []
  }
});

const text = (value) => String(value == null ? '' : value).trim();
const abs = (file) => path.join(ROOT, file);
const read = (file) => fs.readFileSync(abs(file), 'utf8');
const exists = (file) => fs.existsSync(abs(file));
const readJson = (file) => JSON.parse(read(file));

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
  const manifest = readJson(MANIFEST);
  const historie = manifest.historie || {};
  const keys = [
    'pensum',
    'emner',
    'fagkart',
    'methods',
    'concepts',
    'curriculumArchitecture',
    'periodGuides',
    'periodModules',
    'coverageContract',
    'qualityContract',
    'caseRequirements',
    'claims',
    'sources',
    'placeEvidence',
    'profilesManifest'
  ];
  const files = keys
    .map((key) => resolveManifestPointer(historie[key]))
    .filter((file) => file && exists(file));
  return [...new Set(files)];
}

function registryHistorieCorpus() {
  if (!exists(REGISTRY)) return { strings: [], files: [] };
  const registry = readJson(REGISTRY);
  const historie = registry?.subjects?.historie || registry?.historie || null;
  if (!historie) return { strings: [], files: [] };
  const strings = flattenStrings(historie);
  const files = [...new Set(strings.filter((value) => value.endsWith('.json') && exists(value)))];
  for (const file of files) strings.push(...flattenStrings(readJson(file)));
  return { strings, files };
}

function anchorResult(corpus, alternatives) {
  const found = alternatives.find((candidate) => corpus.includes(normalize(candidate)));
  return { alternatives, found: found || null };
}

export function auditHistorieLegacyTheory() {
  for (const required of [LEGACY_BADGE, MANIFEST]) {
    if (!exists(required)) throw new Error(`Mangler nødvendig Historie-auditfil: ${required}`);
  }

  const sections = extractSections(read(LEGACY_BADGE));
  const expectedIds = Object.keys(SECTION_POLICY);
  const foundIds = sections.map((section) => section.id);
  const missingSections = expectedIds.filter((id) => !foundIds.includes(id));
  const unknownSections = foundIds.filter((id) => !SECTION_POLICY[id]);
  if (missingSections.length) throw new Error(`Historie-merkesiden mangler forventede legacy-seksjoner: ${missingSections.join(', ')}`);
  if (unknownSections.length) throw new Error(`Historie-merkesiden har ukjente legacy-seksjoner: ${unknownSections.join(', ')}`);

  const manifestFiles = canonicalFiles();
  const registry = registryHistorieCorpus();
  const canonicalStrings = [];
  for (const file of manifestFiles) canonicalStrings.push(...flattenStrings(readJson(file)));
  canonicalStrings.push(...registry.strings);
  const canonicalCorpus = normalize(canonicalStrings.join(' '));
  if (canonicalCorpus.length < 5000) throw new Error('Canonical Historie-korpus er uventet lite; audit kan ikke kjøres sikkert.');

  const rows = sections.map((section) => {
    const policy = SECTION_POLICY[section.id];
    const anchors = policy.anchors.map((alternatives) => anchorResult(canonicalCorpus, alternatives));
    const foundCount = anchors.filter((row) => row.found).length;
    const anchorCoverage = anchors.length ? Number((foundCount / anchors.length).toFixed(3)) : 1;
    const missingAnchors = anchors.filter((row) => !row.found).map((row) => row.alternatives);
    const contentStatus = policy.role === 'legacy_product_copy'
      ? 'legacy_product_copy_no_canonical_migration_required'
      : anchorCoverage === 1
        ? 'canonical_anchor_coverage_complete_claim_review_pending'
        : 'canonical_anchor_gaps_manual_review_required';
    return {
      id: section.id,
      heading: section.heading,
      role: policy.role,
      legacyCharacterCount: section.text.length,
      anchorCoverage,
      anchors,
      missingAnchors,
      contentStatus
    };
  });

  const knowledgeRows = rows.filter((row) => row.role === 'knowledge');
  const manualReview = knowledgeRows.filter((row) => row.anchorCoverage < 1).map((row) => row.id);

  return {
    schema: 'history_go_fagverk_historie_legacy_theory_audit_v1',
    subject: 'historie',
    legacy: {
      badgePage: LEGACY_BADGE,
      sectionCount: rows.length,
      knowledgeSectionCount: knowledgeRows.length
    },
    canonical: {
      manifestFiles,
      registryFiles: registry.files,
      corpusCharacterCount: canonicalCorpus.length
    },
    summary: {
      knowledgeSectionCount: knowledgeRows.length,
      anchorCompleteCount: knowledgeRows.filter((row) => row.anchorCoverage === 1).length,
      manualReviewCount: manualReview.length,
      manualReview,
      redirectReady: false,
      redirectBlockReason: 'Anchor coverage only establishes candidate canonical ownership. Historie redirect remains blocked until every knowledge section has explicit editorial adjudication and any semantic gaps are migrated.'
    },
    rows
  };
}

const args = new Set(process.argv.slice(2));
const report = auditHistorieLegacyTheory();
if (args.has('--write-report')) {
  fs.mkdirSync(path.dirname(abs(REPORT)), { recursive: true });
  fs.writeFileSync(abs(REPORT), `${JSON.stringify(report, null, 2)}\n`);
} else if (!args.has('--no-check-report') && exists(REPORT)) {
  const committed = readJson(REPORT);
  if (!isDeepStrictEqual(committed, report)) {
    throw new Error(`${REPORT} er utdatert. Kjør node scripts/audit-fagverk-historie-legacy-theory.mjs --write-report`);
  }
}

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
