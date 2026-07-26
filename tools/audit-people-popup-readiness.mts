import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

type JsonRecord = Record<string, unknown>;
type ReadinessStatus = 'complete' | 'strong' | 'partial' | 'sparse';
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
  averageScore: number;
};

type PlaceCluster = {
  placeId: string;
  totalIncomplete: number;
  sparse: number;
  partial: number;
  strong: number;
  averageScore: number;
  people: Array<{ id: string; name: string; score: number; status: ReadinessStatus }>;
};

const root = process.cwd();
const manifestPath = path.join(root, 'data/people/manifest.json');
const reportJsonPath = path.join(root, 'reports/people-popup-readiness.json');
const reportMdPath = path.join(root, 'reports/people-popup-readiness.md');
const checkOnly = process.argv.includes('--check');

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
  if (Array.isArray(value)) return value.filter((item): item is JsonRecord => !!item && typeof item === 'object' && !Array.isArray(item));
  if (value && typeof value === 'object') return [value as JsonRecord];
  return [];
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
    const record = asRecord(item);
    return firstText(record.title, record.name, record.label, record.role, record.field, record.id);
  }));
}

function contributionValues(person: JsonRecord): string[] {
  return stringValues(person.works, person.notable_works, person.notableWorks, person.achievements, person.contributions, person.publications);
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
    const record = asRecord(value);
    const url = firstText(record.url, record.href);
    const label = firstText(record.label, record.title, record.name, url);
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
  const hasExplicitField = ['image', 'portrait', 'portraitImage', 'imageCard', 'cardImage', 'photo', 'frontImage']
    .some((field) => Object.prototype.hasOwnProperty.call(person, field));
  return { state: hasExplicitField ? 'explicit_fallback' : 'implicit_fallback', imagePath: '' };
}

function statusFor(score: number): ReadinessStatus {
  if (score >= 85) return 'complete';
  if (score >= 65) return 'strong';
  if (score >= 40) return 'partial';
  return 'sparse';
}

function narrativeScore(value: string, paragraphs: number): number {
  if (!value) return 0;
  if (value.length >= 350 && paragraphs >= 3) return 25;
  if (value.length >= 220 && paragraphs >= 2) return 20;
  if (value.length >= 140) return 15;
  if (value.length >= 70) return 9;
  return 4;
}

function contributionScore(count: number): number {
  if (count >= 5) return 20;
  if (count >= 3) return 16;
  if (count >= 1) return 9;
  return 0;
}

function educationScore(count: number): number {
  if (count >= 3) return 10;
  if (count >= 2) return 8;
  if (count >= 1) return 5;
  return 0;
}

function practiceScore(count: number): number {
  if (count >= 8) return 10;
  if (count >= 5) return 8;
  if (count >= 3) return 6;
  if (count >= 1) return 3;
  return 0;
}

function sourceScore(count: number): number {
  if (count >= 4) return 15;
  if (count >= 2) return 10;
  if (count >= 1) return 5;
  return 0;
}

function readinessFor(person: JsonRecord, sourceFile: string): PersonReadiness {
  const id = text(person.id);
  const name = firstText(person.name, person.title, id);
  const category = inferCategory(person, sourceFile);
  const kind = firstText(person.kindLabel, person.occupation, person.profession, person.role, person.kind);
  const explicitPopup = firstText(person.popupDesc, person.popupdesc);
  const narrative = firstText(explicitPopup, person.wiki, person.description, person.desc, person.summary);
  const paragraphs = paragraphCount(narrative);
  const contributions = contributionValues(person);
  const education = educationValues(person);
  const practice = practiceValues(person);
  const places = placeValues(person);
  const anchor = primaryPlace(person);
  const sources = sourceEntries(person);
  const birth = firstText(person.birth_date, person.birthDate, asRecord(person.born).date, asRecord(person.born).year, person.birthYear, typeof person.born === 'string' || typeof person.born === 'number' ? person.born : '');
  const death = firstText(person.death_date, person.deathDate, asRecord(person.died).date, asRecord(person.died).year, person.deathYear, typeof person.died === 'string' || typeof person.died === 'number' ? person.died : '');
  const birthPlace = firstText(person.birth_place, person.birthPlace, asRecord(person.born).place);
  const activePlace = firstText(person.active_place, person.activePlace, person.virkested, person.base);
  const image = imageState(person);

  const identity = (id ? 4 : 0) + (name ? 4 : 0) + (category !== 'unknown' ? 1 : 0) + (kind ? 1 : 0);
  const life = (birth ? 4 : 0) + (birthPlace ? 3 : 0) + (activePlace || death ? 3 : 0);
  const grounding = (anchor ? 5 : 0) + (anchor && places.includes(anchor) ? 5 : places.length ? 3 : 0);
  let score = identity
    + narrativeScore(narrative, paragraphs)
    + life
    + contributionScore(contributions.length)
    + educationScore(education.length)
    + practiceScore(practice.length)
    + grounding
    + sourceScore(sources.length);
  if (image.state === 'broken_image') score = Math.max(0, score - 10);
  score = Math.min(100, score);

  const issues: string[] = [];
  if (!kind) issues.push('missing_role_label');
  if (!explicitPopup) issues.push('missing_popup_desc');
  else {
    if (explicitPopup.length < 220) issues.push('short_popup_desc');
    if (paragraphCount(explicitPopup) < 2) issues.push('single_paragraph_popup_desc');
  }
  if (!birth) issues.push('missing_birth_data');
  if (!contributions.length) issues.push('missing_contributions');
  if (!education.length) issues.push('missing_education_or_training');
  if (practice.length < 3) issues.push('thin_practice_profile');
  if (!anchor) issues.push('missing_primary_place');
  if (!places.length) issues.push('missing_places');
  else if (anchor && !places.includes(anchor)) issues.push('places_missing_primary_anchor');
  if (!sources.length) issues.push('missing_sources');
  else if (sources.length < 2) issues.push('single_source_only');
  if (image.state === 'broken_image') issues.push('broken_image_reference');
  if (image.state === 'implicit_fallback') issues.push('implicit_image_fallback');

  const priority = Math.min(200,
    (100 - score)
    + (issues.includes('missing_popup_desc') ? 18 : 0)
    + (issues.includes('missing_sources') ? 14 : 0)
    + (issues.includes('missing_contributions') ? 12 : 0)
    + (image.state === 'broken_image' ? 20 : 0));

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
    paragraphCount: paragraphs,
    popupLength: narrative.length,
    contributionCount: contributions.length,
    educationCount: education.length,
    practiceCount: practice.length,
    sourceCount: sources.length,
    imageState: image.state,
    imagePath: image.imagePath,
    coverage: {
      identity: identity === 10,
      popupDesc: !!explicitPopup && explicitPopup.length >= 220 && paragraphCount(explicitPopup) >= 2,
      lifeData: !!birth && !!(birthPlace || activePlace || death),
      contributions: contributions.length >= 3,
      education: education.length >= 1,
      practiceProfile: practice.length >= 3,
      placeGrounding: !!anchor && places.includes(anchor),
      sources: sources.length >= 2,
      imageContract: image.state !== 'broken_image',
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
    averageScore: round(rows.reduce((sum, row) => sum + row.score, 0) / Math.max(rows.length, 1)),
  })).sort((a, b) => b.total - a.total || a.category.localeCompare(b.category, 'nb'));
}

function summarizePlaces(people: PersonReadiness[]): PlaceCluster[] {
  const map = new Map<string, PersonReadiness[]>();
  for (const person of people.filter((row) => row.status !== 'complete')) {
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
      .map((row) => ({ id: row.id, name: row.name, score: row.score, status: row.status })),
  })).sort((a, b) => b.totalIncomplete - a.totalIncomplete || a.averageScore - b.averageScore || a.placeId.localeCompare(b.placeId, 'nb'));
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
  lines.push('Status: **generert produksjonsrapport**');
  lines.push('');
  lines.push('Rapporten rangerer manifest-lastede canonical personer etter hvor mye av `docs/PEOPLE_POPUP_SYSTEM.md` de kan fylle. Den måler datakompletthet, ikke personens historiske betydning eller person–sted-relevans.');
  lines.push('');
  lines.push(`Source fingerprint: \`${markdownEscape(report.sourceFingerprint)}\``);
  lines.push('');
  lines.push('## Sammendrag');
  lines.push('');
  lines.push('| Måling | Antall |');
  lines.push('|---|---:|');
  lines.push(`| Personer | ${summary.totalPeople ?? 0} |`);
  lines.push(`| Complete | ${summary.complete ?? 0} |`);
  lines.push(`| Strong | ${summary.strong ?? 0} |`);
  lines.push(`| Partial | ${summary.partial ?? 0} |`);
  lines.push(`| Sparse | ${summary.sparse ?? 0} |`);
  lines.push(`| Ødelagte bildereferanser | ${summary.brokenImages ?? 0} |`);
  lines.push(`| Eksplisitt initialfallback | ${summary.explicitFallbacks ?? 0} |`);
  lines.push(`| Implisitt initialfallback | ${summary.implicitFallbacks ?? 0} |`);
  lines.push(`| Gjennomsnittspoeng | ${summary.averageScore ?? 0} |`);
  lines.push('');
  lines.push('## Feltdekning');
  lines.push('');
  lines.push('| Kontraktdel | Dekket | Andel |');
  lines.push('|---|---:|---:|');
  for (const [key, raw] of Object.entries(coverage)) {
    const item = asRecord(raw);
    lines.push(`| ${markdownEscape(key)} | ${item.count ?? 0} | ${item.percent ?? 0} % |`);
  }
  lines.push('');
  lines.push('## Kategorier');
  lines.push('');
  lines.push('| Kategori | Totalt | Complete | Strong | Partial | Sparse | Snitt |');
  lines.push('|---|---:|---:|---:|---:|---:|---:|');
  for (const row of categories) {
    lines.push(`| ${markdownEscape(row.category)} | ${row.total} | ${row.complete} | ${row.strong} | ${row.partial} | ${row.sparse} | ${row.averageScore} |`);
  }
  lines.push('');
  lines.push('## Stedsklynger med mest gjenstående arbeid');
  lines.push('');
  lines.push('| Primærsted | Ufullstendige | Sparse | Partial | Strong | Snitt | Første profiler |');
  lines.push('|---|---:|---:|---:|---:|---:|---|');
  for (const cluster of clusters.slice(0, 50)) {
    const names = cluster.people.slice(0, 5).map((person) => `${person.name} (${person.score})`).join(', ');
    lines.push(`| ${markdownEscape(cluster.placeId)} | ${cluster.totalIncomplete} | ${cluster.sparse} | ${cluster.partial} | ${cluster.strong} | ${cluster.averageScore} | ${markdownEscape(names)} |`);
  }
  lines.push('');
  lines.push('## Prioritert arbeidsliste');
  lines.push('');
  lines.push('| Prioritet | Person | Kategori | Primærsted | Score | Status | Mangler | Fil |');
  lines.push('|---:|---|---|---|---:|---|---|---|');
  for (const person of priorities.slice(0, 150)) {
    lines.push(`| ${person.priority} | ${markdownEscape(person.name || person.id)} | ${markdownEscape(person.category)} | ${markdownEscape(person.primaryPlace || '—')} | ${person.score} | ${person.status} | ${markdownEscape(person.issues.join(', '))} | \`${markdownEscape(person.sourceFile)}\` |`);
  }
  lines.push('');
  lines.push('## Tolkning');
  lines.push('');
  lines.push('- `complete` betyr 85–100 poeng.');
  lines.push('- `strong` betyr 65–84 poeng.');
  lines.push('- `partial` betyr 40–64 poeng.');
  lines.push('- `sparse` betyr 0–39 poeng.');
  lines.push('- Manglende formell utdanning er en produksjonsindikator, ikke automatisk en faktafeil. Feltet skal utelates når det ikke er relevant eller dokumentert.');
  lines.push('- Bilde er ikke påkrevd. Initialfallback er en gyldig sluttstatus; ødelagte bildereferanser er ikke gyldige.');
  lines.push('- Relevans og kildegate for person–sted-koblinger eies av `docs/people-of-places-method.md`.');
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
const coverageKeys = ['identity', 'popupDesc', 'lifeData', 'contributions', 'education', 'practiceProfile', 'placeGrounding', 'sources', 'imageContract'];
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
  brokenImages: people.filter((person) => person.imageState === 'broken_image').length,
  explicitFallbacks: people.filter((person) => person.imageState === 'explicit_fallback').length,
  implicitFallbacks: people.filter((person) => person.imageState === 'implicit_fallback').length,
  averageScore: round(people.reduce((sum, person) => sum + person.score, 0) / Math.max(people.length, 1)),
};

const report: JsonRecord = {
  schemaVersion: 1,
  contract: 'docs/PEOPLE_POPUP_SYSTEM.md',
  generatedBy: 'tools/audit-people-popup-readiness.mts',
  sourceFingerprint: fingerprint.digest('hex'),
  thresholds: { complete: 85, strong: 65, partial: 40, sparse: 0 },
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
  console.log(`People-popup readiness: ${summary.totalPeople} personer, ${summary.complete} complete, ${summary.strong} strong, ${summary.partial} partial, ${summary.sparse} sparse.`);
  console.log(`Rapporter: ${repoPath(reportJsonPath)}, ${repoPath(reportMdPath)}`);
}
