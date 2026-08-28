import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LEGACY_BADGE = 'data/fag/litteratur/archive/merke_litteratur_full_teori_legacy_20260828.html';
const MANIFEST = 'data/fag/fag_manifest.json';
const REGISTRY = 'data/fagverk/fagverk_registry.json';
const REPORT = 'reports/fagverk/litteratur-legacy-theory-audit.json';
const SUBJECT_ROOTS = Object.freeze(['data/fag/litteratur/', 'data/fagverk/litteratur/']);
const MANIFEST_KEYS = Object.freeze([
  'pensum', 'emner', 'fagkart', 'methods', 'emneMappings',
  'scientificPackage', 'coverageContract', 'topicFoundations'
]);

const SECTION_POLICY = Object.freeze({
  felt: { role: 'knowledge', anchors: [
    ['fortelling', 'narrativ'], ['perspektiv', 'synsvinkel'], ['sjanger', 'roman', 'lyrikk', 'drama'],
    ['oversettelse'], ['muntlig tradisjon', 'oral tradisjon'], ['digital litteratur', 'digitale uttrykk']
  ] },
  normativ: { role: 'knowledge', anchors: [
    ['estetikk', 'estetisk'], ['originalitet', 'nyskaping', 'nyskapning'], ['tolkning', 'fortolkning'],
    ['kanon', 'kulturell verdi'], ['ytringsfrihet', 'ytringsmangfold', 'frie stemmer']
  ] },
  doxa: { role: 'knowledge', anchors: [
    ['tekst'], ['identitet'], ['makt', 'symbolsk makt'], ['klasse'], ['kjønn'], ['kanon']
  ] },
  metode: { role: 'knowledge', anchors: [
    ['nærlesning', 'tekstanalyse'], ['narratologi', 'fortellerteori'], ['sjangerstudier', 'sjangeranalyse', 'sjanger'],
    ['diskursanalyse', 'diskursstudier', 'diskurs'], ['språkpolitikk', 'språknormering', 'normering'], ['kanonstudier', 'kanon']
  ] },
  materiell: { role: 'knowledge', anchors: [
    ['bok', 'bøker'], ['trykk', 'trykkekultur', 'trykketeknikk'], ['manuskript'], ['forlag'], ['bibliotek'], ['bokhandel'], ['digital']
  ] },
  sosial: { role: 'knowledge', anchors: [
    ['forfatter'], ['kritiker', 'kritikk'], ['redaktør', 'redaksjon'], ['oversetter', 'oversettelse'],
    ['leser', 'resepsjon'], ['tidsskrift', 'forlag'], ['kulturpolitikk', 'institusjon']
  ] },
  geografisk: { role: 'knowledge', anchors: [
    ['sted'], ['rom', 'romlig'], ['by', 'urban'], ['bibliotek'], ['forlag', 'redaksjon'], ['litterært miljø', 'litterære miljøer']
  ] },
  temporal: { role: 'knowledge', anchors: [
    ['epoke', 'periode'], ['stil', 'stilhistorie'], ['kanon', 'tradisjon'], ['forfatterskap'],
    ['publikasjonshistorie', 'publiseringshistorie'],
    ['språkendring', 'språkhistorie', 'historiske og institusjonelle skriftspråk', 'målreisning', 'normering']
  ] },
  blindsoner: { role: 'knowledge', anchors: [
    ['marginaliser'], ['muntlig tradisjon', 'oral tradisjon'], ['dagbok', 'dagbøker', 'brev'],
    ['klasse'], ['kjønn'], ['arkiv', 'fravær', 'eksklusjon']
  ] },
  begreper: { role: 'knowledge', anchors: [
    ['fortelling', 'narrativ'], ['språk'], ['symbolsk makt', 'makt'], ['perspektiv', 'synsvinkel'],
    ['estetikk'], ['ambivalens'], ['tolkning', 'fortolkning'], ['kanon']
  ] },
  bidrag: { role: 'legacy_product_copy', anchors: [] }
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
  const litteratur = manifest.litteratur || {};
  const manifestFiles = MANIFEST_KEYS.map((key) => resolveManifestPointer(litteratur[key])).filter(Boolean);
  for (const required of ['pensum', 'emner', 'fagkart', 'methods', 'scientificPackage', 'coverageContract', 'topicFoundations']) {
    if (!resolveManifestPointer(litteratur[required])) throw new Error(`Litteratur-manifestet mangler gyldig ${required}-peker.`);
  }
  const graph = gatherOwnedJsonGraph(manifestFiles);
  return { manifestFiles: [...new Set(manifestFiles)].sort(), graphFiles: graph.files, strings: graph.strings };
}

function registryCorpus() {
  const registry = readJson(REGISTRY);
  if (registry.schema !== 'history_go_fagverk_registry_v1' || !registry.subjects || typeof registry.subjects !== 'object') {
    throw new Error('Fagverk-registeret har ukjent struktur; Litteratur-audit kan ikke tolke registry-eierskap sikkert.');
  }
  const litteratur = registry.subjects.litteratur || null;
  if (!litteratur) return { subjectPresent: false, chapterCount: 0, strings: [], files: [] };

  const registryStrings = flattenStrings(litteratur);
  const seeds = registryStrings.map((value) => resolveOwnedJsonReference(REGISTRY, value)).filter(Boolean);
  const graph = gatherOwnedJsonGraph(seeds);
  return {
    subjectPresent: true,
    chapterCount: Array.isArray(litteratur.chapters) ? litteratur.chapters.length : 0,
    strings: [...registryStrings, ...graph.strings],
    files: graph.files
  };
}

function anchorResult(corpus, alternatives) {
  const found = alternatives.find((candidate) => corpus.includes(normalize(candidate)));
  return { alternatives, found: found || null };
}

export function auditLitteraturLegacyTheory() {
  for (const required of [LEGACY_BADGE, MANIFEST, REGISTRY]) {
    if (!exists(required)) throw new Error(`Mangler nødvendig Litteratur-auditfil: ${required}`);
  }

  const sections = extractSections(read(LEGACY_BADGE));
  const expectedIds = Object.keys(SECTION_POLICY);
  const foundIds = sections.map((section) => section.id);
  const missingSections = expectedIds.filter((id) => !foundIds.includes(id));
  const unknownSections = foundIds.filter((id) => !SECTION_POLICY[id]);
  if (missingSections.length) throw new Error(`Litteratur-merkesiden mangler forventede legacy-seksjoner: ${missingSections.join(', ')}`);
  if (unknownSections.length) throw new Error(`Litteratur-merkesiden har ukjente legacy-seksjoner: ${unknownSections.join(', ')}`);

  const manifest = manifestCorpus();
  const registry = registryCorpus();
  const canonicalCorpus = normalize([...manifest.strings, ...registry.strings].join(' '));
  if (canonicalCorpus.length < 50000) throw new Error('Canonical Litteratur-korpus er uventet lite; audit kan ikke kjøres sikkert.');

  const rows = sections.map((section) => {
    const policy = SECTION_POLICY[section.id];
    const anchors = policy.anchors.map((alternatives) => anchorResult(canonicalCorpus, alternatives));
    const foundCount = anchors.filter((row) => row.found).length;
    const anchorCoverage = anchors.length ? Number((foundCount / anchors.length).toFixed(3)) : 1;
    const missingAnchors = anchors.filter((row) => !row.found).map((row) => row.alternatives);
    return {
      id: section.id,
      heading: section.heading,
      role: policy.role,
      legacyCharacterCount: section.text.length,
      anchorCoverage,
      anchors,
      missingAnchors,
      contentStatus: policy.role === 'legacy_product_copy'
        ? 'legacy_product_copy_no_canonical_migration_required'
        : anchorCoverage === 1
          ? 'canonical_anchor_coverage_complete_claim_review_pending'
          : 'canonical_anchor_gaps_manual_review_required'
    };
  });

  const knowledgeRows = rows.filter((row) => row.role === 'knowledge');
  const manualReview = knowledgeRows.filter((row) => row.anchorCoverage < 1).map((row) => row.id);
  return {
    schema: 'history_go_fagverk_litteratur_legacy_theory_audit_v1',
    subject: 'litteratur',
    legacy: { badgePage: LEGACY_BADGE, sectionCount: rows.length, knowledgeSectionCount: knowledgeRows.length },
    canonical: {
      manifestFiles: manifest.manifestFiles,
      manifestGraphFiles: manifest.graphFiles,
      registrySubjectPresent: registry.subjectPresent,
      registryChapterCount: registry.chapterCount,
      registryFiles: registry.files,
      corpusCharacterCount: canonicalCorpus.length
    },
    summary: {
      knowledgeSectionCount: knowledgeRows.length,
      anchorCompleteCount: knowledgeRows.filter((row) => row.anchorCoverage === 1).length,
      manualReviewCount: manualReview.length,
      manualReview,
      redirectReady: false,
      redirectBlockReason: 'Anchor coverage establishes only candidate canonical ownership. Litteratur redirect remains blocked until every knowledge section has explicit editorial adjudication and any semantic gaps are migrated or rejected with evidence.'
    },
    rows
  };
}

const args = new Set(process.argv.slice(2));
const report = auditLitteraturLegacyTheory();
if (args.has('--write-report')) {
  fs.mkdirSync(path.dirname(abs(REPORT)), { recursive: true });
  fs.writeFileSync(abs(REPORT), `${JSON.stringify(report, null, 2)}\n`);
} else if (!args.has('--no-check-report') && exists(REPORT)) {
  const committed = readJson(REPORT);
  if (!isDeepStrictEqual(committed, report)) {
    throw new Error(`${REPORT} er utdatert. Kjør node scripts/audit-fagverk-litteratur-legacy-theory.mjs --write-report`);
  }
}
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
