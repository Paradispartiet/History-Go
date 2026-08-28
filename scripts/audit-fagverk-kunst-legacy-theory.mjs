import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LEGACY_BADGE = 'data/fag/kunst/merke_kunst (2).html';
const MANIFEST = 'data/fag/fag_manifest.json';
const REGISTRY = 'data/fagverk/fagverk_registry.json';
const CATEGORY_CONTRACT = 'data/categories/category_contract.json';
const REPORT = 'reports/fagverk/kunst-legacy-theory-audit.json';
const SUBJECT_ROOTS = Object.freeze(['data/fag/kunst/', 'data/fagverk/kunst/']);
const MANIFEST_KEYS = Object.freeze(['pensum', 'emner', 'fagkart', 'methods', 'emneMappings']);

const SECTION_POLICY = Object.freeze({
  felt: { role: 'knowledge', anchors: [
    ['maleri'], ['skulptur'], ['tegning'], ['grafikk'], ['fotografi'],
    ['samtidskunst'], ['design'], ['gatekunst'], ['installasjon'], ['offentlig kunst']
  ] },
  verk: { role: 'knowledge', anchors: [
    ['form'], ['komposisjon'], ['motiv'], ['materiale', 'materialitet'], ['teknikk'],
    ['målestokk', 'skala'], ['farge'], ['rom'], ['presentasjon']
  ] },
  metode: { role: 'knowledge', anchors: [
    ['formanalyse', 'formal analyse'], ['materialitetsanalyse', 'materialitet'],
    ['ikonografi'], ['symbolanalyse', 'symbol'], ['kontekstanalyse', 'kontekst'],
    ['institusjonsanalyse', 'institusjon'], ['resepsjonsanalyse', 'resepsjon']
  ] },
  institusjoner: { role: 'knowledge', anchors: [
    ['museum'], ['galleri'], ['kunsthall'], ['akademi'], ['atelier'], ['samling'],
    ['offentlig bestilling', 'bestillingsordning', 'oppdrag'], ['kuratering', 'kurator']
  ] },
  'offentlig-rom': { role: 'knowledge', anchors: [
    ['offentlig kunst'], ['monument'], ['veggmaleri', 'murmaleri'], ['gatekunst'],
    ['plassering', 'stedsspesifikk'], ['eierskap'], ['tilgjengelighet'], ['konflikt', 'omstridt']
  ] },
  historie: { role: 'knowledge', anchors: [
    ['kunsthistorie'], ['periode'], ['bevegelse', 'kunstbevegelse'], ['teknologi'], ['brudd'],
    ['verk'], ['kunstner'], ['samling']
  ] },
  arbeid: { role: 'knowledge', anchors: [
    ['praksis'], ['utdanning'], ['atelier', 'studio'], ['samarbeid'], ['produksjon'],
    ['økonomi'], ['distribusjon'], ['kurator'], ['konservator', 'konservering'], ['tekniker'], ['formidler'], ['produsent']
  ] },
  makt: { role: 'knowledge', anchors: [
    ['kanon'], ['innkjøp'], ['utstilling'], ['kritikk'], ['marked'], ['utdanning'],
    ['offentlig støtte', 'finansiering'], ['inkludering', 'ekskludering', 'utelatt'], ['portvokter']
  ] },
  begreper: { role: 'knowledge', anchors: [
    ['form'], ['komposisjon'], ['materialitet'], ['teknikk'], ['motiv'], ['representasjon'],
    ['ikonografi'], ['symbol'], ['stil'], ['periode'], ['brudd'], ['kuratering'], ['samling'],
    ['kunstinstitusjon', 'institusjon'], ['kanon'], ['resepsjon'], ['offentlighet']
  ] },
  avgrensning: { role: 'product_boundary', owner: CATEGORY_CONTRACT, anchors: [
    ['kunst'], ['scenekunst'], ['teater'], ['dans'], ['billedkunst', 'visuell kunst'], ['sceneinstitusjoner']
  ] }
});

const text = (value) => String(value == null ? '' : value).trim();
const abs = (file) => path.join(ROOT, file);
const read = (file) => fs.readFileSync(abs(file), 'utf8');
const exists = (file) => fs.existsSync(abs(file));
const readJson = (file) => JSON.parse(read(file));

function decodeEntities(value) {
  return value
    .replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&#039;', "'").replaceAll('&nbsp;', ' ');
}
function stripHtml(value) {
  return decodeEntities(value)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
function normalize(value) {
  return text(value).toLocaleLowerCase('nb-NO').normalize('NFKC')
    .replace(/[«»“”„"'’`´]/g, '')
    .replace(/[^a-zæøå0-9]+/gi, ' ')
    .replace(/\s+/g, ' ').trim();
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
function toRepoPath(candidate) {
  const relative = path.relative(ROOT, path.resolve(candidate)).replaceAll('\\', '/');
  if (!relative || relative.startsWith('../') || path.isAbsolute(relative)) return '';
  return relative;
}
function isOwnedJson(file) {
  return file.endsWith('.json') && SUBJECT_ROOTS.some((root) => file.startsWith(root));
}
function resolveManifestPointer(pointer) {
  const value = text(pointer).replaceAll('\\', '/');
  if (!value || value.startsWith('/') || value.includes('..')) return '';
  const file = toRepoPath(path.join(ROOT, 'data/fag', value));
  return file && isOwnedJson(file) && exists(file) ? file : '';
}
function resolveOwnedJsonReference(fromFile, rawValue) {
  const value = text(rawValue).replaceAll('\\', '/').split(/[?#]/)[0];
  if (!value.endsWith('.json')) return '';
  const candidates = [];
  if (value.startsWith('data/')) candidates.push(path.join(ROOT, value));
  candidates.push(path.join(ROOT, path.dirname(fromFile), value));
  if (!value.startsWith('../')) {
    candidates.push(path.join(ROOT, 'data/fag', value));
    candidates.push(path.join(ROOT, 'data/fagverk', value));
  }
  for (const candidate of candidates) {
    const file = toRepoPath(candidate);
    if (file && isOwnedJson(file) && exists(file)) return file;
  }
  return '';
}
function gatherOwnedJsonGraph(seedFiles) {
  const queue = [...new Set(seedFiles.filter((file) => file && isOwnedJson(file) && exists(file)))];
  const seen = new Set();
  const strings = [];
  while (queue.length) {
    const file = queue.shift();
    if (seen.has(file)) continue;
    seen.add(file);
    const value = readJson(file);
    const fileStrings = flattenStrings(value);
    strings.push(...fileStrings);
    for (const item of fileStrings) {
      const ref = resolveOwnedJsonReference(file, item);
      if (ref && !seen.has(ref)) queue.push(ref);
    }
  }
  return { files: [...seen].sort(), strings };
}
function manifestCorpus() {
  const manifest = readJson(MANIFEST);
  const kunst = manifest.kunst || {};
  const manifestFiles = MANIFEST_KEYS.map((key) => resolveManifestPointer(kunst[key])).filter(Boolean);
  for (const required of MANIFEST_KEYS) {
    if (!resolveManifestPointer(kunst[required])) throw new Error(`Kunst-manifestet mangler gyldig ${required}-peker.`);
  }
  const graph = gatherOwnedJsonGraph(manifestFiles);
  return { manifestFiles: [...new Set(manifestFiles)].sort(), graphFiles: graph.files, strings: graph.strings };
}
function registryCorpus() {
  const registry = readJson(REGISTRY);
  if (registry.schema !== 'history_go_fagverk_registry_v1' || !registry.subjects || typeof registry.subjects !== 'object') {
    throw new Error('Fagverk-registeret har ukjent struktur; Kunst-audit kan ikke tolke registry-eierskap sikkert.');
  }
  const kunst = registry.subjects.kunst;
  if (!kunst) throw new Error('Fagverk-registeret mangler canonical Kunst-subject.');
  const chapterCount = Array.isArray(kunst.chapters) ? kunst.chapters.length : 0;
  if (chapterCount !== 6) throw new Error(`Kunst skal ha seks registry-kapitler, fant ${chapterCount}.`);
  const registryStrings = flattenStrings(kunst);
  const seeds = registryStrings.map((value) => resolveOwnedJsonReference(REGISTRY, value)).filter(Boolean);
  const graph = gatherOwnedJsonGraph(seeds);
  if (graph.files.length < 6) throw new Error('Kunst registry-grafen løste uventet få canonicale filer.');
  return { chapterCount, strings: [...registryStrings, ...graph.strings], files: graph.files };
}
function categoryBoundaryCorpus() {
  const contract = readJson(CATEGORY_CONTRACT);
  if (!Array.isArray(contract.runtimeCategories) || !contract.runtimeCategories.includes('kunst') || !contract.runtimeCategories.includes('scenekunst')) {
    throw new Error('Category-contract mangler Kunst/Scenekunst som canonicale runtimekategorier.');
  }
  if (!text(contract.decisions?.kunst) || !text(contract.decisions?.scenekunst)) {
    throw new Error('Category-contract mangler eksplisitt Kunst/Scenekunst-avgrensning.');
  }
  return normalize(['kunst', 'scenekunst', contract.decisions.kunst, contract.decisions.scenekunst].join(' '));
}
function anchorResult(corpus, alternatives) {
  const found = alternatives.find((candidate) => corpus.includes(normalize(candidate)));
  return { alternatives, found: found || null };
}

export function auditKunstLegacyTheory() {
  for (const required of [LEGACY_BADGE, MANIFEST, REGISTRY, CATEGORY_CONTRACT]) {
    if (!exists(required)) throw new Error(`Mangler nødvendig Kunst-auditfil: ${required}`);
  }
  const sections = extractSections(read(LEGACY_BADGE));
  const expectedIds = Object.keys(SECTION_POLICY);
  const foundIds = sections.map((section) => section.id);
  const missingSections = expectedIds.filter((id) => !foundIds.includes(id));
  const unknownSections = foundIds.filter((id) => !SECTION_POLICY[id]);
  if (missingSections.length) throw new Error(`Kunst-merkesiden mangler forventede legacy-seksjoner: ${missingSections.join(', ')}`);
  if (unknownSections.length) throw new Error(`Kunst-merkesiden har ukjente legacy-seksjoner: ${unknownSections.join(', ')}`);
  if (sections.length !== 10) throw new Error(`Kunst-merkesiden skal ha 10 legacy-seksjoner, fant ${sections.length}.`);

  const manifest = manifestCorpus();
  const registry = registryCorpus();
  const canonicalCorpus = normalize([...manifest.strings, ...registry.strings].join(' '));
  const boundaryCorpus = categoryBoundaryCorpus();
  if (canonicalCorpus.length < 100000) throw new Error('Canonical Kunst-korpus er uventet lite; audit kan ikke kjøres sikkert.');

  const rows = sections.map((section) => {
    const policy = SECTION_POLICY[section.id];
    const corpus = policy.role === 'product_boundary' ? boundaryCorpus : canonicalCorpus;
    const anchors = policy.anchors.map((alternatives) => anchorResult(corpus, alternatives));
    const foundCount = anchors.filter((row) => row.found).length;
    const anchorCoverage = Number((foundCount / anchors.length).toFixed(3));
    const missingAnchors = anchors.filter((row) => !row.found).map((row) => row.alternatives);
    return {
      id: section.id,
      heading: section.heading,
      role: policy.role,
      ownerFile: policy.owner || null,
      legacyCharacterCount: section.text.length,
      anchorCoverage,
      anchors,
      missingAnchors,
      contentStatus: policy.role === 'product_boundary'
        ? (anchorCoverage === 1 ? 'canonical_product_boundary_complete' : 'canonical_product_boundary_gap')
        : (anchorCoverage === 1
          ? 'canonical_anchor_coverage_complete_claim_review_pending'
          : 'canonical_anchor_gaps_manual_review_required')
    };
  });

  const knowledgeRows = rows.filter((row) => row.role === 'knowledge');
  const boundaryRows = rows.filter((row) => row.role === 'product_boundary');
  if (!boundaryRows.every((row) => row.anchorCoverage === 1)) {
    throw new Error('Kunst/Scenekunst-produktgrensen er ikke lenger dekket av category-contract.');
  }
  const manualReview = knowledgeRows.filter((row) => row.anchorCoverage < 1).map((row) => row.id);
  const uniqueMissingAnchorTerms = [...new Set(
    knowledgeRows.flatMap((row) => row.missingAnchors.map((group) => group[0])).filter(Boolean)
  )].sort();

  return {
    schema: 'history_go_fagverk_kunst_legacy_theory_audit_v1',
    subject: 'kunst',
    legacy: {
      badgePage: LEGACY_BADGE,
      sectionCount: rows.length,
      knowledgeSectionCount: knowledgeRows.length,
      productBoundarySectionCount: boundaryRows.length
    },
    canonical: {
      manifestFiles: manifest.manifestFiles,
      manifestGraphFiles: manifest.graphFiles,
      registryChapterCount: registry.chapterCount,
      registryFiles: registry.files,
      categoryBoundaryOwner: CATEGORY_CONTRACT,
      corpusCharacterCount: canonicalCorpus.length
    },
    summary: {
      knowledgeSectionCount: knowledgeRows.length,
      productBoundarySectionCount: boundaryRows.length,
      anchorCompleteCount: knowledgeRows.filter((row) => row.anchorCoverage === 1).length,
      productBoundaryCompleteCount: boundaryRows.filter((row) => row.anchorCoverage === 1).length,
      manualReviewCount: manualReview.length,
      manualReview,
      uniqueMissingAnchorTerms,
      redirectReady: false,
      redirectBlockReason: 'Anchor coverage establishes only candidate canonical ownership. Kunst redirect remains blocked until every knowledge section has explicit editorial adjudication and any semantic gaps are migrated or rejected with evidence.'
    },
    rows
  };
}

const args = new Set(process.argv.slice(2));
const report = auditKunstLegacyTheory();
if (args.has('--write-report')) {
  fs.mkdirSync(path.dirname(abs(REPORT)), { recursive: true });
  fs.writeFileSync(abs(REPORT), `${JSON.stringify(report, null, 2)}\n`);
} else if (!args.has('--no-check-report') && exists(REPORT)) {
  const committed = readJson(REPORT);
  if (!isDeepStrictEqual(committed, report)) {
    throw new Error(`${REPORT} er utdatert. Kjør node scripts/audit-fagverk-kunst-legacy-theory.mjs --write-report`);
  }
}
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
