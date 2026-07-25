import fs from 'fs';
import path from 'path';
import { validateCoordinateSource } from './coordinate-source-contract.mjs';

const root = process.cwd();
const evidenceRoot = path.join(root, 'data/coordinate-evidence');
const evidenceManifestPath = path.join(evidenceRoot, 'manifest.json');
const placeManifestPath = path.join(root, 'data/places/manifest.json');
const cityRegistryPath = path.join(root, 'data/cities/manifest.json');
const reportPath = path.join(root, 'reports/coordinate-evidence-audit.md');

const allowedEvidenceStatuses = new Set([
  'needs_research',
  'candidate_sources_collected',
  'ready_for_coordinate_pr',
  'applied_to_place',
  'rejected'
]);

const allowedCoordinateDecisions = new Set([
  'do_not_change_coordinates_yet',
  'needs_address_source',
  'needs_poi_source',
  'needs_geometry',
  'needs_historical_source',
  'needs_identity_split'
]);

const rel = (p: string) => path.relative(root, p).replace(/\\/g, '/');
const readJson = (p: string) => JSON.parse(fs.readFileSync(p, 'utf8'));
const toPlaces = (payload: any): any[] => Array.isArray(payload)
  ? payload
  : Array.isArray(payload?.places)
    ? payload.places
    : Array.isArray(payload?.items)
      ? payload.items
      : [payload];

function sameJson(a: unknown, b: unknown) {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

function placeCoordSnapshot(place: any) {
  return {
    lat: place?.lat ?? null,
    lon: place?.lon ?? null,
    r: place?.r ?? null,
    coordStatus: place?.coordStatus ?? '',
    coordSource: place?.coordSource ?? '',
    coordType: place?.coordType ?? '',
    coordNote: place?.coordNote ?? ''
  };
}

function resolveRepoPath(value: unknown, baseDir = root) {
  const raw = String(value ?? '').trim().replace(/^\.?\//, '');
  if (!raw) return '';
  return path.isAbsolute(raw) ? raw : path.resolve(baseDir, raw);
}

function listJsonFilesRecursive(directory: string): string[] {
  if (!directory || !fs.existsSync(directory)) return [];
  const out: string[] = [];
  const stack = [directory];

  while (stack.length) {
    const current = stack.pop()!;
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile() && entry.name.endsWith('.json')) out.push(full);
    }
  }

  return out.sort((a, b) => rel(a).localeCompare(rel(b), 'en'));
}

type PlaceRecord = { place: any; file: string };
const activePlaces = new Map<string, PlaceRecord>();

function registerPlaceFile(file: string) {
  const abs = path.isAbsolute(file) ? file : path.join(root, file);
  if (!fs.existsSync(abs)) return;
  const relativeFile = rel(abs);
  for (const place of toPlaces(readJson(abs))) {
    if (place?.id) activePlaces.set(String(place.id), { place, file: relativeFile });
  }
}

if (fs.existsSync(placeManifestPath)) {
  const placeManifest = readJson(placeManifestPath);
  for (const entry of placeManifest.files || []) {
    registerPlaceFile(path.join(root, 'data', String(entry)));
  }
}

const evidenceFiles = new Set<string>();

if (fs.existsSync(cityRegistryPath)) {
  const registry = readJson(cityRegistryPath);
  const cityEntries = Array.isArray(registry?.cities) ? registry.cities : [];

  for (const cityEntry of cityEntries) {
    const cityManifestPath = resolveRepoPath(cityEntry?.manifest, path.join(root, 'data/cities'));
    if (!cityManifestPath || !fs.existsSync(cityManifestPath)) continue;

    const cityManifest = readJson(cityManifestPath);
    const placeFiles = Array.isArray(cityManifest?.places?.files) ? cityManifest.places.files : [];
    for (const placeFile of placeFiles) registerPlaceFile(resolveRepoPath(placeFile, root));

    const evidenceDirectory = resolveRepoPath(cityManifest?.coordinateEvidence?.directory, root);
    for (const evidenceFile of listJsonFilesRecursive(evidenceDirectory)) {
      evidenceFiles.add(rel(evidenceFile));
    }
  }
}

const rows: { placeId: string; evidenceFile: string; status: string; decision: string; problems: string[] }[] = [];

function addRow(placeId: string, evidenceFile: string, status: string, decision: string, problems: string[]) {
  rows.push({ placeId, evidenceFile, status, decision, problems });
}

if (!fs.existsSync(evidenceManifestPath)) {
  addRow('(manifest)', rel(evidenceManifestPath), '', '', ['Mangler data/coordinate-evidence/manifest.json']);
} else {
  const manifest = readJson(evidenceManifestPath);
  const files = Array.isArray(manifest.files) ? manifest.files : [];
  if (!files.length) addRow('(manifest)', rel(evidenceManifestPath), '', '', ['Manifest mangler files[]']);

  for (const entry of files) evidenceFiles.add(rel(path.join(evidenceRoot, String(entry))));
}

for (const evidenceFile of [...evidenceFiles].sort((a, b) => a.localeCompare(b, 'en'))) {
  const abs = path.join(root, evidenceFile);
  const problems: string[] = [];
  let evidence: any = null;

  if (!fs.existsSync(abs)) {
    addRow('(missing)', evidenceFile, '', '', ['Evidence-fil finnes ikke']);
    continue;
  }

  try {
    evidence = readJson(abs);
  } catch (error) {
    addRow('(json)', evidenceFile, '', '', [`Ugyldig JSON: ${String(error)}`]);
    continue;
  }

  const placeId = String(evidence?.placeId || '').trim();
  const status = String(evidence?.evidenceStatus || '').trim();
  const decision = String(evidence?.coordinateDecision || '').trim();

  if (!placeId) problems.push('Mangler placeId');
  if (!allowedEvidenceStatuses.has(status)) problems.push(`Ugyldig evidenceStatus=${status || '(tom)'}`);
  if (!allowedCoordinateDecisions.has(decision)) problems.push(`Ugyldig coordinateDecision=${decision || '(tom)'}`);
  if (!String(evidence?.placeFile || '').trim()) problems.push('Mangler placeFile');

  const active = placeId ? activePlaces.get(placeId) : null;
  if (!active) {
    problems.push('placeId finnes ikke i aktiv place-manifest eller registrert bypakke');
  } else {
    if (String(evidence?.placeFile || '').trim() !== active.file) {
      problems.push(`placeFile matcher ikke aktiv source (${active.file})`);
    }
    if (!sameJson(evidence?.currentCoordinate, placeCoordSnapshot(active.place))) {
      problems.push('currentCoordinate matcher ikke eksisterende place lat/lon/r/status/source/type/note');
    }
    if (status === 'applied_to_place') {
      const contract = validateCoordinateSource(active.place);
      if (contract.trust !== 'verified') {
        problems.push('applied_to_place er ikke lov når place fortsatt mangler verified v1 contract');
      }
    }
  }

  if (status === 'ready_for_coordinate_pr') {
    if (!Array.isArray(evidence?.evidence) || evidence.evidence.length === 0) {
      problems.push('ready_for_coordinate_pr krever minst én evidence-entry');
    }
    if (evidence?.decision?.canBecomeVerified !== true) {
      problems.push('ready_for_coordinate_pr krever decision.canBecomeVerified=true');
    }
  }

  addRow(placeId || '(missing)', evidenceFile, status, decision, problems);
}

const table = rows.map((row) => {
  const problems = row.problems.length ? row.problems.join('; ') : 'OK';
  return `| ${row.placeId} | ${row.evidenceFile} | ${row.status || '-'} | ${row.decision || '-'} | ${problems.replace(/\|/g, '\\|')} |`;
}).join('\n');

const report = `# Coordinate evidence audit\n\nGenerert: ${new Date().toISOString()}\n\nAktive steder: ${activePlaces.size}\n\n| placeId | evidence file | status | decision | problems |\n|---|---|---|---|---|\n${table || '| - | - | - | - | Ingen evidence files funnet |'}\n`;

fs.writeFileSync(reportPath, report);

const problemCount = rows.reduce((sum, row) => sum + row.problems.length, 0);
console.log(`Coordinate evidence audit: ${rows.length} files, ${problemCount} problems. Rapport: ${rel(reportPath)}`);
if (problemCount > 0) process.exit(1);
