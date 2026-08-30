import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LEGACY_BADGE = 'data/fag/subkultur/merke_subkultur.html';
const ORIGINAL_LEGACY_BLOB = '562ac143c3f26fd7fb6bc817dc320f3b088246bb';
const MANIFEST = 'data/fag/fag_manifest.json';
const REGISTRY = 'data/fagverk/fagverk_registry.json';
const PORTAL = 'data/fagverk/fagverk_portal.json';
const TARGET = 'fagverk.html?subject=subkultur#fagverkIaProgresjon';
const OWNED_ROOTS = ['data/fag/subkultur/', 'data/fagverk/subkultur/'];
const MIN_CANONICAL_CORPUS_CHARS = 150000;

const POLICY = Object.freeze({
  felt: [
    ['subkultur'], ['identitet'], ['fellesskap', 'scene'], ['stil'], ['kode', 'symbol'],
    ['ritual'], ['undergrunn'], ['ungdomskultur'], ['motkultur'], ['fandom']
  ],
  normativ: [
    ['autonomi'], ['autentisitet'], ['tilhørighet'], ['stil'], ['motstand'],
    ['mainstream'], ['grensearbeid'], ['norm', 'avvik']
  ],
  doxa: [
    ['sosial organisering'], ['kulturell', 'kultur'], ['klasse'], ['kjønn', 'skeiv'],
    ['estetikk'], ['kontroll'], ['kulturarv'], ['kommersialisering'], ['marginalisering']
  ],
  metode: [
    ['subkulturteori', 'subkulturanalyse'], ['scene'], ['stil'], ['etnografi'],
    ['sted', 'romlig'], ['grensearbeid'], ['autentisitet'], ['kriminalisering'],
    ['kommersialisering']
  ],
  materiell: [
    ['klær', 'kropp'], ['objekt'], ['klubb'], ['øvingsrom'], ['skate'], ['graffiti'],
    ['fanzine'], ['plakat'], ['gaming'], ['cosplay']
  ],
  sosial: [
    ['scene'], ['portvokter'], ['ritual'], ['tilhørighet'], ['autentisitet'],
    ['trygghet'], ['eksklusjon'], ['marginalisering'], ['fellesskap'], ['deltakelse']
  ],
  geografisk: [
    ['sted'], ['territorium'], ['okkupert', 'okkupasjon'], ['skate'], ['klubb'],
    ['uformelle møteplasser', 'møteplass'], ['gentrifisering'], ['byutvikling'], ['regulering']
  ],
  temporal: [
    ['ungdomskultur'], ['undergrunn'], ['mainstream'], ['kommersialisering'],
    ['historisering'], ['revival'], ['institusjonalisering'], ['kulturarv'], ['tapte steder']
  ],
  blindsoner: [
    ['dokumentasjon', 'arkiv'], ['historiemakt'], ['skeiv'], ['klasse'], ['marginalisering'],
    ['kommersialisering'], ['politi'], ['regulering'], ['eiendom'], ['synlighet']
  ],
  begreper: [
    ['subkultur'], ['scene'], ['stil'], ['motkultur'], ['autentisitet'], ['grensearbeid'],
    ['tilhørighet'], ['avvik'], ['ritual'], ['kommersialisering'], ['undergrunn'], ['motstand']
  ]
});

const abs = (file) => path.join(ROOT, file);
const exists = (file) => fs.existsSync(abs(file));
const read = (file) => fs.readFileSync(abs(file), 'utf8');
const json = (file) => JSON.parse(read(file));
const text = (value) => String(value ?? '').trim();
const norm = (value) => text(value)
  .toLocaleLowerCase('nb-NO')
  .normalize('NFKC')
  .replace(/[«»“”„\"'’`´]/g, '')
  .replace(/[^a-zæøå0-9]+/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim();

function gitBlobSha(buffer) {
  const header = Buffer.from(`blob ${buffer.length}\0`);
  return crypto.createHash('sha1').update(header).update(buffer).digest('hex');
}

function flatten(value, out = []) {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) for (const item of value) flatten(item, out);
  else if (value && typeof value === 'object') for (const item of Object.values(value)) flatten(item, out);
  return out;
}

function repoPath(candidate) {
  const relative = path.relative(ROOT, path.resolve(candidate)).replaceAll('\\', '/');
  if (!relative || relative.startsWith('../') || path.isAbsolute(relative)) return '';
  return relative;
}

function owned(file) {
  return file.endsWith('.json') && OWNED_ROOTS.some((root) => file.startsWith(root));
}

function resolveRef(fromFile, raw) {
  const value = text(raw).replaceAll('\\', '/').split(/[?#]/)[0];
  if (!value.endsWith('.json')) return '';
  const candidates = [];
  if (value.startsWith('data/')) candidates.push(path.join(ROOT, value));
  candidates.push(path.join(ROOT, path.dirname(fromFile), value));
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

function graph(seedFiles) {
  const queue = [...new Set(seedFiles.filter((file) => file && owned(file) && exists(file)))];
  const seen = new Set();
  const strings = [];
  while (queue.length) {
    const file = queue.shift();
    if (seen.has(file)) continue;
    seen.add(file);
    const value = json(file);
    const values = flatten(value);
    strings.push(...values);
    for (const raw of values) {
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
    const className = match[1].match(/class=[\"']([^\"']+)[\"']/i)?.[1] || '';
    if (!className.split(/\s+/).includes('merke-blokk')) continue;
    const id = match[1].match(/id=[\"']([^\"']+)[\"']/i)?.[1] || '';
    const heading = stripHtml(match[2].match(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/i)?.[1] || id);
    if (id) out.push({ id, heading, text: stripHtml(match[2]) });
  }
  return out;
}

export function auditSubkulturLegacyTheory() {
  for (const file of [LEGACY_BADGE, MANIFEST, REGISTRY, PORTAL]) {
    if (!exists(file)) throw new Error(`Mangler ${file}`);
  }

  const legacyBuffer = fs.readFileSync(abs(LEGACY_BADGE));
  const legacyBlobSha = gitBlobSha(legacyBuffer);
  if (legacyBlobSha !== ORIGINAL_LEGACY_BLOB) {
    throw new Error(`Aktiv Subkultur legacy-side er ikke original blob: ${legacyBlobSha} != ${ORIGINAL_LEGACY_BLOB}`);
  }

  const legacySections = sections(legacyBuffer.toString('utf8'));
  const expected = [...Object.keys(POLICY), 'bidrag'];
  if (JSON.stringify(legacySections.map((section) => section.id)) !== JSON.stringify(expected)) {
    throw new Error(`Uventet Subkultur-seksjonsstruktur: ${legacySections.map((section) => section.id).join(', ')}`);
  }

  const manifestSubject = json(MANIFEST).subkultur || {};
  const manifestSeed = [...new Set(flatten(manifestSubject)
    .map((value) => resolveRef(MANIFEST, value))
    .filter(Boolean))].sort();
  if (manifestSeed.length < 4) throw new Error(`For få manifesteide Subkultur-filer: ${manifestSeed.length}`);
  const manifestGraph = graph(manifestSeed);

  const registry = json(REGISTRY);
  const registrySubject = registry.subjects?.subkultur;
  if (!registrySubject) throw new Error('Subkultur mangler i Fagverk-registeret.');
  const chapterCount = Array.isArray(registrySubject.chapters) ? registrySubject.chapters.length : 0;
  if (chapterCount !== 8) throw new Error(`Subkultur-registry skal ha 8 kapitler, fant ${chapterCount}.`);
  const registrySeed = flatten(registrySubject)
    .map((value) => resolveRef(REGISTRY, value))
    .filter(Boolean);
  const registryGraph = graph(registrySeed);

  const corpus = norm([
    ...manifestGraph.strings,
    ...flatten(registrySubject),
    ...registryGraph.strings
  ].join(' '));
  if (corpus.length < MIN_CANONICAL_CORPUS_CHARS) {
    throw new Error(`Canonical Subkultur-korpus er under truncation-sentinel ${MIN_CANONICAL_CORPUS_CHARS}: ${corpus.length}.`);
  }

  const rows = legacySections.map((section) => {
    if (section.id === 'bidrag') {
      return {
        id: section.id,
        heading: section.heading,
        role: 'legacy_product_copy',
        legacyCharacterCount: section.text.length,
        anchorCount: 0,
        foundCount: 0,
        anchorCoverage: 1,
        missingAnchors: [],
        contentStatus: 'legacy_product_copy_no_canonical_migration_required'
      };
    }
    const anchors = POLICY[section.id].map((alternatives) => ({
      alternatives,
      found: alternatives.find((candidate) => corpus.includes(norm(candidate))) || null
    }));
    const foundCount = anchors.filter((anchor) => anchor.found).length;
    const missingAnchors = anchors.filter((anchor) => !anchor.found).map((anchor) => anchor.alternatives);
    const anchorCoverage = Number((foundCount / anchors.length).toFixed(3));
    return {
      id: section.id,
      heading: section.heading,
      role: 'knowledge',
      legacyCharacterCount: section.text.length,
      anchorCount: anchors.length,
      foundCount,
      anchorCoverage,
      anchors,
      missingAnchors,
      contentStatus: anchorCoverage === 1
        ? 'canonical_anchor_coverage_complete_claim_review_pending'
        : 'canonical_anchor_gaps_manual_review_required'
    };
  });

  const portal = json(PORTAL);
  const portalSubject = portal.categories?.find((item) => item.id === 'subkultur');
  if (!portalSubject) throw new Error('Subkultur mangler i portalen.');
  if (portalSubject.badgePage !== LEGACY_BADGE) {
    throw new Error(`Råauditen krever aktiv legacy-rute før adjudikering: ${portalSubject.badgePage}`);
  }

  const knowledge = rows.filter((row) => row.role === 'knowledge');
  const manualReview = knowledge.filter((row) => row.anchorCoverage < 1).map((row) => row.id);

  return {
    schema: 'history_go_fagverk_subkultur_legacy_theory_audit_v1',
    subject: 'subkultur',
    legacy: {
      badgePage: LEGACY_BADGE,
      originalBlobSha: ORIGINAL_LEGACY_BLOB,
      activeBlobSha: legacyBlobSha,
      sourcePreserved: legacyBlobSha === ORIGINAL_LEGACY_BLOB,
      sectionCount: rows.length,
      knowledgeSectionCount: knowledge.length
    },
    canonical: {
      manifestSeedFiles: manifestSeed,
      manifestGraphFileCount: manifestGraph.files.length,
      registryChapterCount: chapterCount,
      registryGraphFileCount: registryGraph.files.length,
      corpusCharacterCount: corpus.length,
      corpusTruncationFloor: MIN_CANONICAL_CORPUS_CHARS
    },
    navigation: {
      badgePage: portalSubject.badgePage,
      subjectPage: portalSubject.subjectPage,
      futureTarget: TARGET,
      legacyRouteActive: true,
      routeRetired: false
    },
    summary: {
      knowledgeSectionCount: knowledge.length,
      anchorCompleteCount: knowledge.filter((row) => row.anchorCoverage === 1).length,
      manualReviewCount: manualReview.length,
      manualReview,
      redirectReady: false,
      redirectBlockReason: 'Raw Subkultur anchor coverage never authorizes redirect by itself. Route readiness requires explicit section adjudication and any proven gap migration.'
    },
    rows
  };
}

const report = auditSubkulturLegacyTheory();
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
