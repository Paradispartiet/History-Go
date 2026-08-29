import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LEGACY_BADGE = 'data/fag/sport/merke_sport.html';
const MANIFEST = 'data/fag/fag_manifest.json';
const REGISTRY = 'data/fagverk/fagverk_registry.json';
const PORTAL = 'data/fagverk/fagverk_portal.json';
const OWNED_ROOTS = ['data/fag/sport/', 'data/fagverk/sport/'];

const POLICY = Object.freeze({
  felt: [
    ['idrett', 'sport'], ['lek'], ['kropp'], ['bevegelse'], ['regel'],
    ['konkurranse'], ['trening'], ['mestring'], ['arena', 'anlegg']
  ],
  normativ: [
    ['fair play', 'rettferdighet'], ['mestring'], ['inkludering', 'inkluder'], ['regel'],
    ['tilgang', 'tilgjengelig'], ['kjønn'], ['klasse', 'sosioøkonomisk'], ['funksjonsevne', 'paraidrett']
  ],
  doxa: [
    ['resultat'], ['rekord'], ['sosial'], ['kroppslig læring', 'motorisk læring'], ['helse'],
    ['frivillig'], ['kommersialisering'], ['supporter'], ['kjønn'], ['klasse', 'ulikhet']
  ],
  metode: [
    ['idrettshistorie', 'historie'], ['stedsanalyse', 'sted', 'arena'], ['organisasjon', 'klubb'],
    ['prestasjon'], ['trening'], ['regel'], ['supporter', 'publikum'], ['inkludering'], ['ulikhet']
  ],
  materiell: [
    ['anlegg', 'arena'], ['utstyr'], ['stadion'], ['hall'], ['park'], ['skate'],
    ['medalje', 'trofé'], ['data'], ['statistikk'], ['rekord']
  ],
  sosial: [
    ['lag'], ['klubb'], ['trener'], ['frivillig'], ['dommer'], ['supporter'],
    ['elite'], ['bredde'], ['uorganisert', 'egenorganisert'], ['seleksjon'], ['ekskludering']
  ],
  geografisk: [
    ['arena'], ['anlegg'], ['geografi', 'romlig'], ['byrom', 'sted'], ['stadion'],
    ['park'], ['stedsidentitet', 'sted'], ['tilgjengelighet', 'tilgang']
  ],
  temporal: [
    ['amatørisme'], ['profesjonalisering'], ['kommersialisering'], ['modernisering', 'historie'],
    ['rekord'], ['teknologi'], ['data'], ['arenaendring', 'anlegg']
  ],
  blindsoner: [
    ['breddeidrett', 'bredde'], ['frivillig'], ['barn'], ['kjønn', 'kvinner'],
    ['minoritet', 'mangfold'], ['ulikhet'], ['frafall'], ['funksjonsevne', 'paraidrett'],
    ['kommersialisering'], ['anlegg', 'tilgang']
  ],
  begreper: [
    ['idrett'], ['lek'], ['regel'], ['prestasjon'], ['trening'], ['mestring'], ['lag'],
    ['klubb'], ['arena'], ['supporter'], ['fair play', 'rettferdighet'], ['bredde'], ['elite'],
    ['motorisk læring', 'kroppslig læring'], ['rekord'], ['rivalisering', 'rival']
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

export function auditSportLegacyTheory() {
  for (const file of [LEGACY_BADGE, MANIFEST, REGISTRY, PORTAL]) {
    if (!exists(file)) throw new Error(`Mangler ${file}`);
  }

  const legacySections = sections(read(LEGACY_BADGE));
  const expected = [...Object.keys(POLICY), 'bidrag'];
  if (JSON.stringify(legacySections.map((section) => section.id)) !== JSON.stringify(expected)) {
    throw new Error(`Uventet Sport-seksjonsstruktur: ${legacySections.map((section) => section.id).join(', ')}`);
  }

  const manifestSubject = json(MANIFEST).sport || {};
  const manifestSeed = [...new Set(flatten(manifestSubject)
    .map((value) => resolveRef(MANIFEST, value))
    .filter(Boolean))].sort();
  if (manifestSeed.length < 4) throw new Error(`For få manifesteide Sport-filer: ${manifestSeed.length}`);
  const manifestGraph = graph(manifestSeed);

  const registry = json(REGISTRY);
  const registrySubject = registry.subjects?.sport;
  if (!registrySubject) throw new Error('Sport mangler i Fagverk-registeret.');
  const chapterCount = Array.isArray(registrySubject.chapters) ? registrySubject.chapters.length : 0;
  if (chapterCount !== 6) throw new Error(`Sport-registry skal ha 6 kapitler, fant ${chapterCount}.`);
  const registrySeed = flatten(registrySubject)
    .map((value) => resolveRef(REGISTRY, value))
    .filter(Boolean);
  const registryGraph = graph(registrySeed);

  const corpus = norm([
    ...manifestGraph.strings,
    ...flatten(registrySubject),
    ...registryGraph.strings
  ].join(' '));
  if (corpus.length < 250000) throw new Error(`Canonical Sport-korpus er uventet lite: ${corpus.length}.`);

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
  const portalSubject = portal.categories?.find((item) => item.id === 'sport');
  if (!portalSubject) throw new Error('Sport mangler i portalen.');
  const knowledge = rows.filter((row) => row.role === 'knowledge');
  const manualReview = knowledge.filter((row) => row.anchorCoverage < 1).map((row) => row.id);
  const preRedirectLocked = portalSubject.badgePage === LEGACY_BADGE;

  return {
    schema: 'history_go_fagverk_sport_legacy_theory_audit_v1',
    subject: 'sport',
    legacy: {
      badgePage: LEGACY_BADGE,
      sectionCount: rows.length,
      knowledgeSectionCount: knowledge.length
    },
    canonical: {
      manifestSeedFiles: manifestSeed,
      manifestGraphFileCount: manifestGraph.files.length,
      registryChapterCount: chapterCount,
      registryGraphFileCount: registryGraph.files.length,
      corpusCharacterCount: corpus.length
    },
    navigation: {
      badgePage: portalSubject.badgePage,
      subjectPage: portalSubject.subjectPage,
      preRedirectLocked
    },
    summary: {
      knowledgeSectionCount: knowledge.length,
      anchorCompleteCount: knowledge.filter((row) => row.anchorCoverage === 1).length,
      manualReviewCount: manualReview.length,
      manualReview,
      redirectReady: false,
      redirectBlockReason: 'Raw Sport anchor coverage never authorizes redirect by itself. Route readiness requires explicit editorial adjudication.'
    },
    rows
  };
}

const report = auditSportLegacyTheory();
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
