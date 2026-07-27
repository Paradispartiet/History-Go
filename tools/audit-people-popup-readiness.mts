import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

type JsonRecord = Record<string, unknown>;
type ReadinessStatus = 'complete' | 'strong' | 'partial' | 'sparse';
type ProductionStatus =
  | 'ready_people_v1'
  | 'needs_research'
  | 'source_conflict'
  | 'identity_unresolved'
  | 'blocked_insufficient_sources'
  | 'metadata_correction_required'
  | 'current_status_stale'
  | 'legacy_unreviewed';
type ImageState = 'valid_image' | 'broken_image' | 'explicit_fallback' | 'implicit_fallback';

type PersonReadiness = {
  id: string;
  name: string;
  category: string;
  kindLabel: string;
  sourceFile: string;
  primaryPlace: string;
  places: string[];
  score: number;
  priority: number;
  status: ReadinessStatus;
  productionStatus: ProductionStatus;
  profileStandard: string;
  claimsFile: string;
  paragraphCount: number;
  popupLength: number;
  contributionCount: number;
  educationCount: number;
  practiceCount: number;
  sourceCount: number;
  imageState: ImageState;
  imagePath: string;
  coverage: Record<string, boolean>;
  issues: string[];
};

type CategorySummary = {
  category: string;
  total: number;
  complete: number;
  strong: number;
  partial: number;
  sparse: number;
  readyPeopleV1: number;
  legacyUnreviewed: number;
  averageScore: number;
};

type PlaceCluster = {
  placeId: string;
  totalIncomplete: number;
  sparse: number;
  partial: number;
  strong: number;
  averageScore: number;
  people: Array<{
    id: string;
    name: string;
    score: number;
    status: ReadinessStatus;
    productionStatus: ProductionStatus;
  }>;
};

const root = process.cwd();
const manifestPath = path.join(root, 'data/people/manifest.json');
const reportJsonPath = path.join(root, 'reports/people-popup-readiness.json');
const reportMdPath = path.join(root, 'reports/people-popup-readiness.md');
const checkOnly = process.argv.includes('--check');

const productionStatuses = new Set<ProductionStatus>([
  'ready_people_v1',
  'needs_research',
  'source_conflict',
  'identity_unresolved',
  'blocked_insufficient_sources',
  'metadata_correction_required',
  'current_status_stale',
  'legacy_unreviewed',
]);

function readText(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}

function readJson(filePath: string): unknown {
  return JSON.parse(readText(filePath));
}

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : {};
}

function text(value: unknown): string {
  return String(value ?? '').trim();
}

function firstText(...values: unknown[]): string {
  for (const value of values) {
    const candidate = text(value);
    if (candidate) return candidate;
  }
  return '';
}

function array(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function records(value: unknown): JsonRecord[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is JsonRecord => !!item && typeof item === 'object' && !Array.isArray(item));
  }
  if (value && typeof value === 'object') return [value as JsonRecord];
  return [];
}

function hasOwn(record: JsonRecord, field: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, field);
}

function uniqueStrings(values: unknown[]): string[] {
  return [...new Set(values.map(text).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'nb'));
}

function repoPath(filePath: string): string {
  return path.relative(root, filePath).replace(/\\/g, '/');
}

function normalizeManifestEntry(value: unknown): string {
  const raw = text(value).replace(/^\.?\//, '');
  if (!raw) return '';
  return raw.startsWith('data/') ? raw : `data/${raw}`;
}

function inferCategory(person: JsonRecord, sourceFile: string): string {
  const explicit = text(person.category);
  if (explicit) return explicit === 'popkultur' ? 'populaerkultur' : explicit;
  const parts = sourceFile.split('/');
  const guessed = parts[0] === 'data' && parts[1] === 'people' ? parts[2] : '';
  return guessed || text(person.collectionGroup) || 'unknown';
}

function stringValues(...values: unknown[]): string[] {
  const out: unknown[] = [];
  for (const value of values) {
    if (Array.isArray(value)) out.push(...value);
    else if (value !== null && value !== undefined && value !== '') out.push(value);
  }
  return uniqueStrings(out.map((item) => {
    if (typeof item === 'string' || typeof item === 'number') return item;
    const itemRecord = asRecord(item);
    return firstText(itemRecord.title, itemRecord.name, itemRecord.label, itemRecord.role, itemRecord.field, itemRecord.id);
  }));
}

function contributionValues(person: JsonRecord): string[] {
  return stringValues(
    person.works,
    person.notable_works,
    person.notableWorks,
    person.achievements,
    person.contributions,
    person.publications,
  );
}

function educationValues(person: JsonRecord): string[] {
  return stringValues(person.education, person.utdanning, person.training);
}

function practiceValues(person: JsonRecord): string[] {
  return stringValues(
    person.themes,
    person.topics,
    person.materials,
    person.materialer,
    person.media,
    person.material,
    person.fields,
    person.disciplines,
    person.genres,
    person.instruments,
    person.techniques,
    person.roles,
    person.tags,
  );
}

function placeValues(person: JsonRecord): string[] {
  return uniqueStrings([
    person.placeId,
    person.place_id,
    person.place,
    person.source_place_id,
    ...array(person.places),
    ...array(person.placeIds),
    ...array(person.place_ids),
  ]);
}

function primaryPlace(person: JsonRecord): string {
  return firstText(person.placeId, person.source_place_id, person.place_id, person.place);
}

function paragraphCount(value: string): number {
  return value ? value.split(/\n\s*\n+/).map((part) => part.trim()).filter(Boolean).length : 0;
}

function sourceEntries(person: JsonRecord): Array<{ label: string; url: string }> {
  const entries: Array<{ label: string; url: string }> = [];
  const push = (value: unknown): void => {
    if (typeof value === 'string') {
      const raw = text(value);
      entries.push({ label: raw, url: /^https?:\/\//i.test(raw) ? raw : '' });
      return;
    }
    const item = asRecord(value);
    const url = firstText(item.url, item.href);
    const label = firstText(item.label, item.title, item.name, url);
    if (label || url) entries.push({ label, url });
  };
  array(person.externalLinks).forEach(push);
  array(person.sources).forEach(push);
  array(person.source_urls).forEach(push);
  const seen = new Set<string>();
  return entries.filter((entry) => {
    const url = text(entry.url);
    if (!/^https?:\/\//i.test(url)) return false;
    const key = `${url}|${text(entry.label)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function imageCandidates(person: JsonRecord): string[] {
  return uniqueStrings([
    person.image,
    person.portrait,
    person.portraitImage,
    person.imageCard,
    person.cardImage,
    person.photo,
    person.frontImage,
  ]);
}

function imageExists(imagePath: string): boolean {
  if (!imagePath) return false;
  return [
    path.join(root, imagePath),
    path.join(root, 'public', imagePath),
    path.join(root, 'src', imagePath),
  ].some((candidate) => fs.existsSync(candidate));
}

function imageState(person: JsonRecord): { state: ImageState; imagePath: string } {
  const candidates = imageCandidates(person);
  const valid = candidates.find(imageExists);
  if (valid) return { state: 'valid_image', imagePath: valid };
  if (candidates.length) return { state: 'broken_image', imagePath: candidates[0] };
  const explicit = ['image', 'portrait', 'portraitImage', 'imageCard', 'cardImage', 'photo', 'frontImage']
    .some((field) => hasOwn(person, field));
  return { state: explicit ? 'explicit_fallback' : 'implicit_fallback', imagePath: '' };
}

function statusFor(score: number): ReadinessStatus {
  if (score >= 85) return 'complete';
  if (score >= 65) return 'strong';
  if (score >= 40) return 'partial';
  return 'sparse';
}

function productionStatusFor(person: JsonRecord): ProductionStatus {
  const candidate = text(person.profileStatus) as ProductionStatus;
  return productionStatuses.has(candidate) ? candidate : 'legacy_unreviewed';
}

function explicitField(person: JsonRecord, fields: string[]): boolean {
  return fields.some((field) => hasOwn(person, field));
}

function readinessFor(person: JsonRecord, sourceFile: string): PersonReadiness {
  const id = text(person.id);
  const name = firstText(person.name, person.title, id);
  const category = inferCategory(person, sourceFile);
  const kind = firstText(person.kindLabel, person.occupation, person.profession, person.role, person.kind);
  const desc = firstText(person.desc, person.summary);
  const popup = firstText(person.popupDesc, person.popupdesc);
  const narrative = popup || desc;
  const paragraphs = paragraphCount(narrative);
  const contributions = contributionValues(person);
  const education = educationValues(person);
  const practice = practiceValues(person);
  const places = placeValues(person);
  const anchor = primaryPlace(person);
  const sources = sourceEntries(person);
  const birth = firstText(
    person.birth_date,
    person.birthDate,
    asRecord(person.born).date,
    asRecord(person.born).year,
    person.birthYear,
    typeof person.born === 'string' || typeof person.born === 'number' ? person.born : '',
  );
  const death = firstText(
    person.death_date,
    person.deathDate,
    asRecord(person.died).date,
    asRecord(person.died).year,
    person.deathYear,
    typeof person.died === 'string' || typeof person.died === 'number' ? person.died : '',
  );
  const birthPlace = firstText(person.birth_place, person.birthPlace, asRecord(person.born).place);
  const activePlace = firstText(person.active_place, person.activePlace, person.virkested, person.base);
  const image = imageState(person);
  const productionStatus = productionStatusFor(person);
  const profileStandard = text(person.profileStandard);
  const claimsFile = text(person.claimsFile);

  const identityCovered = !!id && !!name && category !== 'unknown' && !!kind;
  const popupCovered = !!popup;
  const lifeCovered = !!birth && !!(birthPlace || activePlace || death);
  const contributionsDeclared = explicitField(person, [
    'works',
    'notable_works',
    'notableWorks',
    'achievements',
    'contributions',
    'publications',
  ]);
  const educationDeclared = explicitField(person, ['education', 'utdanning', 'training']);
  const practiceDeclared = explicitField(person, [
    'themes',
    'topics',
    'materials',
    'materialer',
    'media',
    'material',
    'fields',
    'disciplines',
    'genres',
    'instruments',
    'techniques',
    'roles',
    'tags',
  ]);
  const placeGrounded = !!anchor && places.includes(anchor);
  const sourcesCovered = sources.length > 0;
  const imageCovered = image.state !== 'broken_image';
  const standardized = profileStandard === 'people_profile_v1.0' && !!claimsFile;

  let score = 0;
  score += identityCovered ? 20 : (id && name ? 12 : id || name ? 6 : 0);
  score += desc ? 5 : 0;
  score += popupCovered ? 20 : 0;
  score += lifeCovered ? 10 : birth || birthPlace || activePlace || death ? 5 : 0;
  score += contributionsDeclared ? 10 : 0;
  score += educationDeclared ? 5 : 0;
  score += practiceDeclared ? 5 : 0;
  score += placeGrounded ? 15 : anchor || places.length ? 7 : 0;
  score += sourcesCovered ? 10 : 0;
  score += imageCovered ? 5 : 0;
  score = Math.min(100, score);

  const issues: string[] = [];
  if (!kind) issues.push('missing_role_label');
  if (!popup) issues.push('missing_popup_desc');
  if (!birth) issues.push('missing_birth_data');
  if (!contributionsDeclared) issues.push('missing_contributions_field');
  if (!anchor) issues.push('missing_primary_place');
  if (!places.length) issues.push('missing_places');
  else if (anchor && !places.includes(anchor)) issues.push('places_missing_primary_anchor');
  if (!sourcesCovered) issues.push('missing_sources');
  if (image.state === 'broken_image') issues.push('broken_image_reference');
  if (image.state === 'implicit_fallback') issues.push('implicit_image_fallback');
  if (!standardized) issues.push('legacy_unreviewed');

  const priority = Math.min(
    200,
    (100 - score)
      + (issues.includes('missing_popup_desc') ? 18 : 0)
      + (issues.includes('missing_sources') ? 14 : 0)
      + (issues.includes('missing_contributions_field') ? 10 : 0)
      + (image.state === 'broken_image' ? 20 : 0)
      + (productionStatus === 'legacy_unreviewed' ? 5 : 0),
  );

  return {
    id,
    name,
    category,
    kindLabel: kind,
    sourceFile,
    primaryPlace: anchor,
    places,
    score,
    priority,
    status: statusFor(score),
    productionStatus,
    profileStandard,
    claimsFile,
    paragraphCount: paragraphs,
    popupLength: narrative.length,
    contributionCount: contributions.length,
    educationCount: education.length,
    practiceCount: practice.length,
    sourceCount: sources.length,
    imageState: image.state,
    imagePath: image.imagePath,
    coverage: {
      identity: identityCovered,
      popupDesc: popupCovered,
      lifeData: lifeCovered,
      contributionsDeclared,
      educationDeclared,
      practiceDeclared,
      placeGrounding: placeGrounded,
      sources: sourcesCovered,
      imageContract: imageCovered,
      profileStandard: standardized,
    },
    issues,
  };
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function summarizeCategories(people: PersonReadiness[]): CategorySummary[] {
  const map = new Map<string, PersonReadiness[]>();
  for (const person of people) {
    if (!map.has(person.category)) map.set(person.category, []);
    map.get(person.category)?.push(person);
  }
  return [...map.entries()].map(([category, rows]) => ({
    category,
    total: rows.length,
    complete: rows.filter((row) => row.status === 'complete').length,
    strong: rows.filter((row) => row.status === 'strong').length,
    partial: rows.filter((row) => row.status === 'partial').length,
    sparse: rows.filter((row) => row.status === 'sparse').length,
    readyPeopleV1: rows.filter((row) => row.productionStatus === 'ready_people_v1').length,
    legacyUnreviewed: rows.filter((row) => row.productionStatus === 'legacy_unreviewed').length,
    averageScore: round(rows.reduce((sum, row) => sum + row.score, 0) / Math.max(rows.length, 1)),
  })).sort((a, b) => b.total - a.total || a.category.localeCompare(b.category, 'nb'));
}

function summarizePlaces(people: PersonReadiness[]): PlaceCluster[] {
  const map = new Map<string, PersonReadiness[]>();
  for (const person of people.filter((row) => row.status !== 'complete' || row.productionStatus !== 'ready_people_v1')) {
    const key = person.primaryPlace || '(uten primærsted)';
    if (!map.has(key)) map.set(key, []);
    map.get(key)?.push(person);
  }
  return [...map.entries()].map(([placeId, rows]) => ({
    placeId,
    totalIncomplete: rows.length,
    sparse: rows.filter((row) => row.status === 'sparse').length,
    partial: rows.filter((row) => row.status === 'partial').length,
    strong: rows.filter((row) => row.status === 'strong').length,
    averageScore: round(rows.reduce((sum, row) => sum + row.score, 0) / Math.max(rows.length, 1)),
    people: rows
      .slice()
      .sort((a, b) => b.priority - a.priority || a.name.localeCompare(b.name, 'nb'))
      .slice(0, 12)
      .map((row) => ({
        id: row.id,
        name: row.name,
        score: row.score,
        status: row.status,
        productionStatus: row.productionStatus,
      })),
  })).sort((a, b) =>
    b.totalIncomplete - a.totalIncomplete
      || a.averageScore - b.averageScore
      || a.placeId.localeCompare(b.placeId, 'nb'));
}

function markdownEscape(value: unknown): string {
  return text(value).replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function markdownReport(report: JsonRecord): string {
  const summary = asRecord(report.summary);
  const coverage = asRecord(report.fieldCoverage);
  const categories = report.categories as CategorySummary[];
  const clusters = report.placeClusters as PlaceCluster[];
  const priorities = report.people as PersonReadiness[];

  const lines: string[] = [];
  lines.push('# People-popup readiness');
  lines.push('');
  lines.push('Status: **generert presentasjonsrapport**');
  lines.push('');
  lines.push('Rapporten måler om runtime kan presentere tilgjengelige canonical People-felt. Den måler ikke faktaverifikasjon, historisk betydning eller hvor mange oppføringer en profil har.');
  lines.push('');
  lines.push('People-produksjon, claims og ferdigstatus eies av `docs/PEOPLE_PROFILE_CANONICAL.md`. Profiler uten v1-claims er `legacy_unreviewed`, selv når presentasjonsstatusen er `complete`.');
  lines.push('');
  lines.push(`Source fingerprint: \`${markdownEscape(report.sourceFingerprint)}\``);
  lines.push('');
  lines.push('## Sammendrag');
  lines.push('');
  lines.push('| Måling | Antall |');
  lines.push('|---|---:|');
  lines.push(`| Personer | ${summary.totalPeople ?? 0} |`);
  lines.push(`| Presentasjon complete | ${summary.complete ?? 0} |`);
  lines.push(`| Presentasjon strong | ${summary.strong ?? 0} |`);
  lines.push(`| Presentasjon partial | ${summary.partial ?? 0} |`);
  lines.push(`| Presentasjon sparse | ${summary.sparse ?? 0} |`);
  lines.push(`| People Profile v1 ready | ${summary.readyPeopleV1 ?? 0} |`);
  lines.push(`| Legacy uten v1-claims | ${summary.legacyUnreviewed ?? 0} |`);
  lines.push(`| Ødelagte bildereferanser | ${summary.brokenImages ?? 0} |`);
  lines.push(`| Eksplisitt initialfallback | ${summary.explicitFallbacks ?? 0} |`);
  lines.push(`| Implisitt initialfallback | ${summary.implicitFallbacks ?? 0} |`);
  lines.push(`| Gjennomsnittspoeng | ${summary.averageScore ?? 0} |`);
  lines.push('');
  lines.push('## Feltdekning');
  lines.push('');
  lines.push('| Presentasjonsdel | Dekket | Andel |');
  lines.push('|---|---:|---:|');
  for (const [key, raw] of Object.entries(coverage)) {
    const item = asRecord(raw);
    lines.push(`| ${markdownEscape(key)} | ${item.count ?? 0} | ${item.percent ?? 0} % |`);
  }
  lines.push('');
  lines.push('## Kategorier');
  lines.push('');
  lines.push('| Kategori | Totalt | Complete | Strong | Partial | Sparse | v1 ready | Legacy | Snitt |');
  lines.push('|---|---:|---:|---:|---:|---:|---:|---:|---:|');
  for (const row of categories) {
    lines.push(`| ${markdownEscape(row.category)} | ${row.total} | ${row.complete} | ${row.strong} | ${row.partial} | ${row.sparse} | ${row.readyPeopleV1} | ${row.legacyUnreviewed} | ${row.averageScore} |`);
  }
  lines.push('');
  lines.push('## Stedsklynger med mest gjenstående arbeid');
  lines.push('');
  lines.push('| Primærsted | Uferdige/legacy | Sparse | Partial | Strong | Snitt | Første profiler |');
  lines.push('|---|---:|---:|---:|---:|---:|---|');
  for (const cluster of clusters.slice(0, 50)) {
    const names = cluster.people.slice(0, 5)
      .map((person) => `${person.name} (${person.score}; ${person.productionStatus})`)
      .join(', ');
    lines.push(`| ${markdownEscape(cluster.placeId)} | ${cluster.totalIncomplete} | ${cluster.sparse} | ${cluster.partial} | ${cluster.strong} | ${cluster.averageScore} | ${markdownEscape(names)} |`);
  }
  lines.push('');
  lines.push('## Prioritert arbeidsliste');
  lines.push('');
  lines.push('| Prioritet | Person | Kategori | Primærsted | Score | Presentasjon | Produksjon | Mangler | Fil |');
  lines.push('|---:|---|---|---|---:|---|---|---|---|');
  for (const person of priorities.slice(0, 150)) {
    lines.push(`| ${person.priority} | ${markdownEscape(person.name || person.id)} | ${markdownEscape(person.category)} | ${markdownEscape(person.primaryPlace || '—')} | ${person.score} | ${person.status} | ${person.productionStatus} | ${markdownEscape(person.issues.join(', '))} | \`${markdownEscape(person.sourceFile)}\` |`);
  }
  lines.push('');
  lines.push('## Tolkning');
  lines.push('');
  lines.push('- `complete`, `strong`, `partial` og `sparse` beskriver bare presentasjonsdekning.');
  lines.push('- Poengsummen øker ikke med antall utdanningspunkter, verk, temaer eller kilder.');
  lines.push('- Tom `education` er en gyldig, ferdig tilstand når kildene ikke dokumenterer utdanning.');
  lines.push('- Tekstlengde alene gir ikke høyere score.');
  lines.push('- `ready_people_v1` krever separat claims-fil og bestått People Profile Canonical-validator.');
  lines.push('- Profiler uten v1-claims er `legacy_unreviewed`.');
  lines.push('- Bilde er ikke påkrevd. Initialfallback er gyldig; ødelagte bildereferanser er ikke gyldige.');
  lines.push('');
  lines.push('Regenerer med `npm run audit:people-popup-readiness`.');
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function writeOrCheck(filePath: string, content: string): void {
  if (checkOnly) {
    const existing = fs.existsSync(filePath) ? readText(filePath) : '';
    if (existing !== content) {
      console.error(`${repoPath(filePath)} er ute av sync. Kjør npm run audit:people-popup-readiness og commit rapporten.`);
      process.exitCode = 1;
    }
    return;
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

const manifestText = readText(manifestPath);
const manifest = asRecord(JSON.parse(manifestText));
const sourceFiles = uniqueStrings(array(manifest.files).map(normalizeManifestEntry)).filter(Boolean);
const fingerprint = crypto.createHash('sha256');
fingerprint.update(manifestText);

const people: PersonReadiness[] = [];
for (const sourceFile of sourceFiles) {
  const absolute = path.join(root, sourceFile);
  const sourceText = readText(absolute);
  fingerprint.update(sourceFile);
  fingerprint.update(sourceText);
  for (const person of records(JSON.parse(sourceText))) {
    people.push(readinessFor(person, sourceFile));
  }
}

people.sort((a, b) => b.priority - a.priority || a.score - b.score || a.name.localeCompare(b.name, 'nb'));
const categories = summarizeCategories(people);
const placeClusters = summarizePlaces(people);
const coverageKeys = [
  'identity',
  'popupDesc',
  'lifeData',
  'contributionsDeclared',
  'educationDeclared',
  'practiceDeclared',
  'placeGrounding',
  'sources',
  'imageContract',
  'profileStandard',
];
const fieldCoverage = Object.fromEntries(coverageKeys.map((key) => {
  const count = people.filter((person) => person.coverage[key] === true).length;
  return [key, { count, percent: round((count / Math.max(people.length, 1)) * 100) }];
}));

const summary = {
  totalPeople: people.length,
  complete: people.filter((person) => person.status === 'complete').length,
  strong: people.filter((person) => person.status === 'strong').length,
  partial: people.filter((person) => person.status === 'partial').length,
  sparse: people.filter((person) => person.status === 'sparse').length,
  readyPeopleV1: people.filter((person) => person.productionStatus === 'ready_people_v1').length,
  legacyUnreviewed: people.filter((person) => person.productionStatus === 'legacy_unreviewed').length,
  brokenImages: people.filter((person) => person.imageState === 'broken_image').length,
  explicitFallbacks: people.filter((person) => person.imageState === 'explicit_fallback').length,
  implicitFallbacks: people.filter((person) => person.imageState === 'implicit_fallback').length,
  averageScore: round(people.reduce((sum, person) => sum + person.score, 0) / Math.max(people.length, 1)),
};

const report: JsonRecord = {
  schemaVersion: 2,
  contract: 'docs/PEOPLE_POPUP_SYSTEM.md',
  productionContract: 'docs/PEOPLE_PROFILE_CANONICAL.md',
  generatedBy: 'tools/audit-people-popup-readiness.mts',
  sourceFingerprint: fingerprint.digest('hex'),
  thresholds: { complete: 85, strong: 65, partial: 40, sparse: 0 },
  policy: {
    countBasedRewards: false,
    missingEducationIsError: false,
    textLengthAloneProvesQuality: false,
    legacyWithoutClaimsStatus: 'legacy_unreviewed',
  },
  summary,
  fieldCoverage,
  categories,
  placeClusters,
  people,
};

const jsonContent = `${JSON.stringify(report, null, 2)}\n`;
const mdContent = markdownReport(report);
writeOrCheck(reportJsonPath, jsonContent);
writeOrCheck(reportMdPath, mdContent);

if (process.exitCode !== 1) {
  console.log(
    `People-popup readiness: ${summary.totalPeople} personer, ${summary.complete} complete, `
      + `${summary.strong} strong, ${summary.partial} partial, ${summary.sparse} sparse; `
      + `${summary.readyPeopleV1} ready_people_v1, ${summary.legacyUnreviewed} legacy_unreviewed.`,
  );
  console.log(`Rapporter: ${repoPath(reportJsonPath)}, ${repoPath(reportMdPath)}`);
}
