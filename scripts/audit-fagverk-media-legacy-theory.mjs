import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LEGACY_BADGE = 'data/fag/media/merke_media.html';
const MANIFEST = 'data/fag/fag_manifest.json';
const REGISTRY = 'data/fagverk/fagverk_registry.json';
const PORTAL = 'data/fagverk/fagverk_portal.json';
const REPORT = 'reports/fagverk/media-legacy-theory-audit.json';
const SUBJECT_ROOTS = Object.freeze(['data/fag/media/', 'data/fagverk/media/']);
const MANIFEST_KEYS = Object.freeze(['pensum', 'emner', 'fagkart', 'methods', 'emneMappings']);

const SECTION_POLICY = Object.freeze({
  felt: { role: 'knowledge', anchors: [
    ['journalistikk'], ['redaksjon'], ['offentlighet'], ['nyhetsproduksjon', 'nyheter'],
    ['plattform'], ['kildekritikk'], ['propaganda'], ['algoritme']
  ] },
  normativ: { role: 'knowledge', anchors: [
    ['ytringsfrihet'], ['pressefrihet'], ['kildekritikk'], ['etterprøvbarhet', 'verifisering'],
    ['redaktøransvar', 'redaksjonell uavhengighet'], ['opplyst offentlighet'],
    ['publiseringsansvar', 'ansvarlig publisering'], ['dagsorden']
  ] },
  doxa: { role: 'knowledge', anchors: [
    ['framing', 'innramming'], ['redaksjonell prioritering', 'prioritering'], ['moderering'],
    ['medieøkonomi', 'eierskap'], ['plattformmakt', 'plattform'], ['algoritmisk synlighet', 'algoritmisk distribusjon']
  ] },
  metode: { role: 'knowledge', anchors: [
    ['pressehistorisk analyse', 'pressehistorie'], ['redaksjonsanalyse', 'redaksjon'],
    ['institusjonsanalyse', 'redaksjonell institusjon'], ['kildekritisk analyse', 'kildeanalyse'],
    ['diskursanalyse', 'diskurs'], ['framinganalyse', 'framing'], ['plattformanalyse', 'plattform'],
    ['algoritmeanalyse', 'algoritme'], ['offentlighetsanalyse', 'offentlighet'],
    ['propagandaanalyse', 'propaganda'], ['desinformasjonsanalyse', 'desinformasjon'],
    ['medieøkonomisk analyse', 'medieøkonomi']
  ] },
  materiell: { role: 'knowledge', anchors: [
    ['avishus'], ['redaksjon'], ['trykkeri', 'materialitet'], ['tv', 'radio', 'kringkasting'],
    ['server', 'datasystem', 'digital infrastruktur'], ['arkiv'], ['plattform'],
    ['pressekonferanse', 'nyhetssted']
  ] },
  sosial: { role: 'knowledge', anchors: [
    ['journalist'], ['redaktør'], ['kilde'], ['varsler', 'varsling'], ['kildevern'],
    ['pressekritikk'], ['medieetikk'], ['tillit'], ['eierskap', 'medieøkonomi'],
    ['feilinformasjon'], ['desinformasjon']
  ] },
  geografisk: { role: 'knowledge', anchors: [
    ['avishus'], ['redaksjon'], ['trykkeri'], ['presseklubb'], ['nyhetssted'],
    ['pressekonferanse'], ['offentlighet'], ['sted']
  ] },
  temporal: { role: 'knowledge', anchors: [
    ['pressehistorie'], ['mediehistorisk endring', 'mediehistorie'], ['trykk', 'trykkeri'],
    ['radio', 'tv'], ['plattform'], ['nyhetsstrøm', 'feed'], ['algoritmisk distribusjon', 'algoritmisk synlighet'],
    ['arkiv'], ['digital']
  ] },
  blindsoner: { role: 'knowledge', anchors: [
    ['minoritetsmedier'], ['lokalavis', 'lokal offentlighet'], ['kildeavhengighet', 'kildemakt', 'kilde'],
    ['plattformmakt', 'plattform'], ['algoritmisk synlighet', 'algoritmisk distribusjon'],
    ['eierskap', 'medieøkonomi'], ['rettelser'], ['pressekritikk']
  ] },
  begreper: { role: 'knowledge', anchors: [
    ['journalistikk'], ['redaksjon'], ['kilde'], ['kildekritikk'], ['offentlighet'], ['dagsorden'],
    ['framing'], ['nyhetsverdi'], ['pressefrihet'], ['medieetikk'], ['plattform'], ['algoritme'],
    ['propaganda'], ['desinformasjon'], ['arkiv'], ['tillit']
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

function listOwnedJsonUnder(root) {
  const repoRoot = text(root).replaceAll('\\', '/').replace(/\/$/, '');
  const start = abs(repoRoot);
  if (!fs.existsSync(start) || !fs.statSync(start).isDirectory()) return [];
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else {
        const file = toRepoPath(full);
        if (file && isOwnedJson(file)) files.push(file);
      }
    }
  };
  walk(start);
  return files.sort();
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
  const media = manifest.media || {};
  const manifestFiles = MANIFEST_KEYS.map((key) => resolveManifestPointer(media[key])).filter(Boolean);
  for (const required of MANIFEST_KEYS) {
    if (!resolveManifestPointer(media[required])) throw new Error(`Media-manifestet mangler gyldig ${required}-peker.`);
  }

  const supplementRoots = [];
  for (const supplement of Object.values(media.supplements || {})) {
    if (!supplement || supplement.status !== 'migrated_subfield') continue;
    const root = text(supplement.root);
    if (!root || root.includes('..')) throw new Error('Media-manifestet har ugyldig supplement-root.');
    supplementRoots.push(`data/fag/${root.replace(/^data\/fag\//, '')}`);
  }
  const supplementFiles = supplementRoots.flatMap(listOwnedJsonUnder);
  const graph = gatherOwnedJsonGraph([...manifestFiles, ...supplementFiles]);
  return {
    manifestFiles: [...new Set(manifestFiles)].sort(),
    supplementRoots: [...new Set(supplementRoots)].sort(),
    supplementFiles: [...new Set(supplementFiles)].sort(),
    graphFiles: graph.files,
    strings: graph.strings
  };
}

function registryCorpus() {
  const registry = readJson(REGISTRY);
  if (registry.schema !== 'history_go_fagverk_registry_v1' || !registry.subjects || typeof registry.subjects !== 'object') {
    throw new Error('Fagverk-registeret har ukjent struktur; Media-audit kan ikke tolke registry-eierskap sikkert.');
  }
  const media = registry.subjects.media;
  if (!media) throw new Error('Media mangler i Fagverk-registeret.');
  const registryStrings = flattenStrings(media);
  const seeds = registryStrings.map((value) => resolveOwnedJsonReference(REGISTRY, value)).filter(Boolean);
  const graph = gatherOwnedJsonGraph(seeds);
  return {
    subjectPresent: true,
    chapterCount: Array.isArray(media.chapters) ? media.chapters.length : 0,
    strings: [...registryStrings, ...graph.strings],
    files: graph.files
  };
}

function anchorResult(corpus, alternatives) {
  const found = alternatives.find((candidate) => corpus.includes(normalize(candidate)));
  return { alternatives, found: found || null };
}

export function auditMediaLegacyTheory() {
  for (const required of [LEGACY_BADGE, MANIFEST, REGISTRY, PORTAL]) {
    if (!exists(required)) throw new Error(`Mangler nødvendig Media-auditfil: ${required}`);
  }

  const sections = extractSections(read(LEGACY_BADGE));
  const expectedIds = Object.keys(SECTION_POLICY);
  const foundIds = sections.map((section) => section.id);
  const missingSections = expectedIds.filter((id) => !foundIds.includes(id));
  const unknownSections = foundIds.filter((id) => !SECTION_POLICY[id]);
  if (missingSections.length) throw new Error(`Media-merkesiden mangler forventede legacy-seksjoner: ${missingSections.join(', ')}`);
  if (unknownSections.length) throw new Error(`Media-merkesiden har ukjente legacy-seksjoner: ${unknownSections.join(', ')}`);

  const manifest = manifestCorpus();
  const registry = registryCorpus();
  if (registry.chapterCount !== 6) throw new Error(`Media-registry skal ha seks canonicale kapitler, fant ${registry.chapterCount}.`);
  const canonicalCorpus = normalize([...manifest.strings, ...registry.strings].join(' '));
  if (canonicalCorpus.length < 50000) throw new Error('Canonical Media-korpus er uventet lite; audit kan ikke kjøres sikkert.');

  const rows = sections.map((section) => {
    const policy = SECTION_POLICY[section.id];
    const anchors = policy.anchors.map((alternatives) => anchorResult(canonicalCorpus, alternatives));
    const foundCount = anchors.filter((row) => row.found).length;
    const anchorCoverage = anchors.length ? Number((foundCount / anchors.length).toFixed(3)) : 1;
    const missingAnchors = anchors.filter((row) => !row.found).map((row) => row.alternatives);
    return {
      id: section.id,
      role: policy.role,
      legacyCharacterCount: section.text.length,
      anchorCount: anchors.length,
      foundCount,
      anchorCoverage,
      missingAnchors,
      contentStatus: policy.role === 'legacy_product_copy'
        ? 'legacy_product_copy_no_canonical_migration_required'
        : anchorCoverage === 1
          ? 'canonical_anchor_coverage_complete_claim_review_pending'
          : 'canonical_anchor_gaps_manual_review_required'
    };
  });

  const portal = readJson(PORTAL);
  const portalEntry = portal.categories?.find((item) => item.id === 'media');
  if (!portalEntry) throw new Error('Media mangler i Fagverk-portalen.');
  if (portalEntry.badgePage !== LEGACY_BADGE) {
    throw new Error(`Media audit-tranchen skal være pre-redirect; badgePage er ${portalEntry.badgePage}.`);
  }

  const knowledgeRows = rows.filter((row) => row.role === 'knowledge');
  const manualReview = knowledgeRows.filter((row) => row.anchorCoverage < 1).map((row) => row.id);
  return {
    schema: 'history_go_fagverk_media_legacy_theory_audit_v1',
    subject: 'media',
    legacy: { badgePage: LEGACY_BADGE, sectionCount: rows.length, knowledgeSectionCount: knowledgeRows.length },
    canonical: {
      manifestFiles: manifest.manifestFiles,
      supplementRoots: manifest.supplementRoots,
      supplementFileCount: manifest.supplementFiles.length,
      manifestGraphFileCount: manifest.graphFiles.length,
      registrySubjectPresent: registry.subjectPresent,
      registryChapterCount: registry.chapterCount,
      registryFileCount: registry.files.length,
      corpusCharacterCount: canonicalCorpus.length
    },
    navigation: {
      badgePage: portalEntry.badgePage,
      subjectPage: portalEntry.subjectPage,
      preRedirectLocked: true
    },
    summary: {
      knowledgeSectionCount: knowledgeRows.length,
      anchorCompleteCount: knowledgeRows.filter((row) => row.anchorCoverage === 1).length,
      manualReviewCount: manualReview.length,
      manualReview,
      redirectReady: false,
      redirectBlockReason: 'Anchor coverage establishes only candidate canonical ownership. Media redirect remains blocked until every knowledge section has explicit editorial adjudication and any semantic gaps are migrated or rejected with evidence.'
    },
    rows
  };
}

const args = new Set(process.argv.slice(2));
const report = auditMediaLegacyTheory();
if (args.has('--write-report')) {
  fs.mkdirSync(path.dirname(abs(REPORT)), { recursive: true });
  fs.writeFileSync(abs(REPORT), `${JSON.stringify(report, null, 2)}\n`);
} else if (!args.has('--no-check-report') && exists(REPORT)) {
  const committed = readJson(REPORT);
  if (!isDeepStrictEqual(committed, report)) {
    throw new Error(`${REPORT} er utdatert. Kjør node scripts/audit-fagverk-media-legacy-theory.mjs --write-report`);
  }
}
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
