import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LEGACY_BADGE = 'data/fag/natur/archive/merke_natur_full_teori_legacy_20260829.html';
const COMPATIBILITY = 'data/fag/natur/merke_natur (1).html';
const MANIFEST = 'data/fag/fag_manifest.json';
const REGISTRY = 'data/fagverk/fagverk_registry.json';
const PORTAL = 'data/fagverk/fagverk_portal.json';
const BADGE = 'data/badges/natur.json';
const CATEGORY_CONTRACT = 'data/categories/category_contract.json';
const TARGET = 'fagverk.html?subject=natur#fagverkIaProgresjon';
const RELATIVE_TARGET = '../../../fagverk.html?subject=natur#fagverkIaProgresjon';
const OWNED_ROOTS = ['data/fag/natur/', 'data/fagverk/natur/'];
const NATUR_ASSIGNMENT_BOUNDARY_TERMS = Object.freeze([
  'grønt', 'vakkert', 'naturfaglig inngang', 'organisme', 'habitat', 'vassdrag', 'geologisk', 'klimavirkning', 'naturforvaltning', 'dokumenterbar'
]);

const SECTION_POLICY = Object.freeze({
  'merke-og-fag': {
    role: 'knowledge_with_product_boundary',
    anchors: [
      ['organisme'], ['kjennetegn'], ['habitat'], ['fysiologisk', 'fysiologi'],
      ['vassdrag', 'hydrologi'], ['geologisk', 'geologi'], ['klimavirkning', 'klima'], ['forvaltning']
    ],
    legacyProductMechanics: ['badge_activity_progress'],
    legacyProductBoundaries: ['nature_assignment_requires_scientific_entry']
  },
  status: {
    role: 'legacy_product_summary',
    anchors: [],
    legacyProductMechanics: ['subject_completion_snapshot'],
    legacyProductBoundaries: []
  },
  fagomrader: {
    role: 'knowledge',
    anchors: [
      ['økologi', 'økosystem'], ['artskunnskap', 'systematikk'], ['evolusjon', 'biologisk mangfold'],
      ['botanikk', 'vegetasjon'], ['zoologi', 'dyreliv'], ['sopp', 'lav', 'mikroorganismer'],
      ['organismebiologi', 'fysiologi'], ['hydrologi', 'vann'], ['klima', 'atmosfære'],
      ['geologi', 'naturhistorie'], ['urban økologi', 'urbannatur'], ['miljøpåvirkning', 'naturforvaltning', 'forvaltning']
    ],
    legacyProductMechanics: [],
    legacyProductBoundaries: []
  },
  arbeidsmate: {
    role: 'knowledge',
    anchors: [
      ['observasjon', 'observere'], ['forklaringsnivå', 'nivå'], ['bestemmelsesnøkkel'],
      ['feltkartlegging', 'feltarbeid'], ['mikroskopi'], ['fysiologisk måling', 'fysiologi'],
      ['hydrologi'], ['geologisk analyse', 'geologi'], ['tidsserie'], ['usikkerhet'], ['mekanisme']
    ],
    legacyProductMechanics: [],
    legacyProductBoundaries: []
  },
  kilder: {
    role: 'knowledge',
    anchors: [
      ['artsfunn'], ['herbarium'], ['museumssamling', 'museum'], ['genetiske data', 'genetisk'],
      ['feltmåling'], ['laboratoriedata', 'laboratorie'], ['geologisk'], ['hydrologisk', 'hydrologi'],
      ['klimatisk', 'klima'], ['forvaltningsplan', 'forvaltning'], ['konsekvensutredning'],
      ['forskningskilde', 'forskning'], ['usikkerhet']
    ],
    legacyProductMechanics: [],
    legacyProductBoundaries: []
  },
  progresjon: {
    role: 'knowledge_with_product_boundary',
    anchors: [
      ['kjennetegn'], ['organismegruppe', 'organisme'], ['materiale'], ['vannvei', 'vann'], ['måling'],
      ['funksjon'], ['livssyklus'], ['slektskap', 'fylogeni'], ['miljøkrav', 'habitat'],
      ['evolusjon'], ['systemeffekt', 'økosystem'], ['forvaltning'], ['tidsskala', 'dyp tid']
    ],
    legacyProductMechanics: ['integrated_progression_route', 'subject_inventory_snapshot'],
    legacyProductBoundaries: []
  }
});

const abs = file => path.join(ROOT, file);
const exists = file => fs.existsSync(abs(file));
const read = file => fs.readFileSync(abs(file), 'utf8');
const json = file => JSON.parse(read(file));
const text = value => String(value ?? '').trim();
const normalize = value => text(value).toLocaleLowerCase('nb-NO').normalize('NFKC')
  .replace(/[«»“”„"'’`´]/g, '')
  .replace(/[^a-zæøå0-9]+/gi, ' ')
  .replace(/\s+/g, ' ').trim();

function flatten(value, out = []) {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) for (const item of value) flatten(item, out);
  else if (value && typeof value === 'object') for (const item of Object.values(value)) flatten(item, out);
  return out;
}

function repoPath(candidate) {
  const relative = path.relative(ROOT, path.resolve(candidate)).replaceAll('\\', '/');
  return !relative || relative.startsWith('../') || path.isAbsolute(relative) ? '' : relative;
}

function owned(file) {
  return file.endsWith('.json') && OWNED_ROOTS.some(root => file.startsWith(root));
}

function resolveRef(from, raw) {
  const value = text(raw).replaceAll('\\', '/').split(/[?#]/)[0];
  if (!value.endsWith('.json')) return '';
  const candidates = [];
  if (value.startsWith('data/')) candidates.push(path.join(ROOT, value));
  candidates.push(path.join(ROOT, path.dirname(from), value));
  if (!value.startsWith('../')) {
    candidates.push(path.join(ROOT, 'data/fag', value));
    candidates.push(path.join(ROOT, 'data/fagverk', value));
  }
  for (const candidate of candidates) {
    const file = repoPath(candidate);
    if (file && owned(file) && exists(file)) return file;
  }
  return '';
}

function graph(seed) {
  const queue = [...new Set(seed.filter(file => file && owned(file) && exists(file)))];
  const seen = new Set();
  const strings = [];
  while (queue.length) {
    const file = queue.shift();
    if (seen.has(file)) continue;
    seen.add(file);
    const value = json(file);
    const fileStrings = flatten(value);
    strings.push(...fileStrings);
    for (const raw of fileStrings) {
      const resolved = resolveRef(file, raw);
      if (resolved && !seen.has(resolved)) queue.push(resolved);
    }
  }
  return { files: [...seen].sort(), strings };
}

function stripHtml(value) {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function sections(html) {
  const out = [];
  for (const match of html.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/gi)) {
    const classes = match[1].match(/class=["']([^"']+)["']/i)?.[1] || '';
    if (!classes.split(/\s+/).includes('merke-blokk')) continue;
    const id = match[1].match(/id=["']([^"']+)["']/i)?.[1] || '';
    const heading = stripHtml(match[2].match(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/i)?.[1] || id);
    if (id) out.push({ id, heading, text: stripHtml(match[2]) });
  }
  return out;
}

export function auditNaturLegacyTheory() {
  for (const file of [LEGACY_BADGE, COMPATIBILITY, MANIFEST, REGISTRY, PORTAL, BADGE, CATEGORY_CONTRACT]) {
    if (!exists(file)) throw new Error(`Natur legacy-audit mangler ${file}`);
  }

  const legacySections = sections(read(LEGACY_BADGE));
  const expectedIds = Object.keys(SECTION_POLICY);
  if (JSON.stringify(legacySections.map(row => row.id)) !== JSON.stringify(expectedIds)) {
    throw new Error(`Uventet Natur-seksjonsstruktur: ${legacySections.map(row => row.id).join(', ')}`);
  }

  const manifestSubject = json(MANIFEST).natur || {};
  const manifestSeed = [...new Set(flatten(manifestSubject).map(value => resolveRef(MANIFEST, value)).filter(Boolean))].sort();
  if (manifestSeed.length < 5) throw new Error(`For få manifesteide Natur-filer: ${manifestSeed.length}`);
  const manifestGraph = graph(manifestSeed);

  const registry = json(REGISTRY);
  const registrySubject = registry.subjects?.natur;
  if (!registrySubject) throw new Error('Natur mangler i Fagverk-registeret.');
  const chapterCount = Array.isArray(registrySubject.chapters) ? registrySubject.chapters.length : 0;
  if (chapterCount !== 12) throw new Error(`Natur-registry skal ha 12 kapitler, fant ${chapterCount}.`);
  const registrySeed = flatten(registrySubject).map(value => resolveRef(REGISTRY, value)).filter(Boolean);
  const registryGraph = graph(registrySeed);

  const corpus = normalize([...manifestGraph.strings, ...flatten(registrySubject), ...registryGraph.strings].join(' '));
  if (corpus.length < 100000) throw new Error('Canonical Natur-korpus er uventet lite.');

  const rows = legacySections.map(section => {
    const policy = SECTION_POLICY[section.id];
    const anchors = policy.anchors.map(alternatives => ({
      alternatives,
      found: alternatives.find(candidate => corpus.includes(normalize(candidate))) || null
    }));
    const foundCount = anchors.filter(anchor => anchor.found).length;
    const missingAnchors = anchors.filter(anchor => !anchor.found).map(anchor => anchor.alternatives);
    const anchorCoverage = anchors.length ? Number((foundCount / anchors.length).toFixed(3)) : 1;
    return {
      id: section.id,
      heading: section.heading,
      role: policy.role,
      legacyCharacterCount: section.text.length,
      anchorCount: anchors.length,
      foundCount,
      anchorCoverage,
      anchors,
      missingAnchors,
      legacyProductMechanics: policy.legacyProductMechanics,
      legacyProductBoundaries: policy.legacyProductBoundaries,
      contentStatus: policy.role === 'legacy_product_summary'
        ? 'legacy_product_summary_no_canonical_knowledge_migration_required'
        : anchorCoverage === 1
          ? 'canonical_anchor_coverage_complete_claim_review_pending'
          : 'canonical_anchor_gaps_manual_review_required'
    };
  });

  const portal = json(PORTAL);
  const portalEntry = portal.categories?.find(item => item.id === 'natur');
  if (!portalEntry) throw new Error('Natur mangler i Fagverk-portalen.');
  const compatibilityHtml = read(COMPATIBILITY);
  const compatibilityRedirectPresent = compatibilityHtml.includes('location.replace')
    && compatibilityHtml.includes(RELATIVE_TARGET)
    && !/merke-blokk|Alle tolv Natur-områder|Natur blir ikke tildelt/i.test(compatibilityHtml);
  const portalRedirected = portalEntry.badgePage === TARGET;
  if (!portalRedirected) throw new Error(`Natur badgePage må peke til ${TARGET} etter route-retirement.`);
  if (!compatibilityRedirectPresent) throw new Error('Legacy Natur-URL er ikke en ren compatibility-redirect til Progresjon.');

  const badge = json(BADGE);
  const categoryContract = json(CATEGORY_CONTRACT);
  const naturDecision = normalize(categoryContract.decisions?.natur);
  const categoryContractHasNaturAssignmentBoundary = NATUR_ASSIGNMENT_BOUNDARY_TERMS.every(term => naturDecision.includes(normalize(term)));
  if (!categoryContractHasNaturAssignmentBoundary) {
    throw new Error('Category-contracten mangler den canonicale Natur-tildelingsgrensen fra legacy-siden.');
  }
  const knowledgeRows = rows.filter(row => row.role !== 'legacy_product_summary');
  const manualReview = knowledgeRows.filter(row => row.anchorCoverage < 1).map(row => row.id);
  const productMechanicCount = rows.reduce((sum, row) => sum + row.legacyProductMechanics.length, 0);
  const productBoundaryCount = rows.reduce((sum, row) => sum + row.legacyProductBoundaries.length, 0);

  return {
    schema: 'history_go_fagverk_natur_legacy_theory_audit_v1',
    subject: 'natur',
    legacy: {
      badgePage: LEGACY_BADGE,
      compatibilityPage: COMPATIBILITY,
      sectionCount: rows.length,
      knowledgeSectionCount: knowledgeRows.length,
      productSummarySectionCount: rows.filter(row => row.role === 'legacy_product_summary').length,
      productMechanicCount,
      productBoundaryCount
    },
    canonical: {
      manifestSeedFiles: manifestSeed,
      manifestGraphFileCount: manifestGraph.files.length,
      registryChapterCount: chapterCount,
      registryGraphFileCount: registryGraph.files.length,
      corpusCharacterCount: corpus.length,
      badgeTierCount: Array.isArray(badge.tiers) ? badge.tiers.length : 0,
      underbadgeCount: Array.isArray(badge.sub) ? badge.sub.length : 0,
      categoryContractHasNatur: Array.isArray(categoryContract.runtimeCategories)
        ? categoryContract.runtimeCategories.includes('natur')
        : Boolean(categoryContract.decisions?.natur || categoryContract.labels?.natur),
      categoryContractHasNaturAssignmentBoundary
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
      knowledgeSectionCount: knowledgeRows.length,
      anchorCompleteCount: knowledgeRows.filter(row => row.anchorCoverage === 1).length,
      manualReviewCount: manualReview.length,
      manualReview,
      redirectReady: false,
      redirectBlockReason: 'Raw Natur anchor coverage never authorizes redirect by itself. Route readiness is owned by the explicit Natur legacy adjudication gate.'
    },
    rows
  };
}

const report = auditNaturLegacyTheory();
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
