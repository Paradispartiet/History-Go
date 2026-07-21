import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const verifiedAt = '2026-07-21';
const aggregatePath = 'data/places/natur/oslo/places_oslo_natur_ostensjovannet.json';
const splitDir = 'data/places/natur/oslo/places_oslo_natur_ostensjovannet';
const splitManifestPath = 'data/places/natur/oslo/places_oslo_natur_ostensjovannet_manifest.json';
const splitIndexPath = 'data/places/natur/oslo/places_oslo_natur_ostensjovannet_index.json';
const evidenceManifestPath = 'data/coordinate-evidence/manifest.json';
const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';
const reserveSourceUrl = 'https://faktaark.naturbase.no/?id=VV00000972';
const reserveSourceObjectId = 'miljodirektoratet-naturvern:VV00000972';

const run = (args) => execFileSync('git', args, { stdio: 'inherit' });
const selfPath = path.resolve('scripts/coordinate-branch-job.mjs');
const selfSource = fs.readFileSync(selfPath, 'utf8');
const branchName = execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim();
if (!branchName) throw new Error('Kunne ikke identifisere koordinatbranchen.');
run(['config', 'user.name', 'github-actions[bot]']);
run(['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
run(['fetch', 'origin', 'main']);
run(['reset', '--hard', 'origin/main']);
fs.writeFileSync(selfPath, selfSource);
run(['add', 'scripts/coordinate-branch-job.mjs']);
run(['commit', '-m', 'Rebase Østensjøvannet coordinate runner onto latest main']);
run(['push', '--force-with-lease', 'origin', `HEAD:${branchName}`]);

const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
const writeJson = (relativePath, value) => {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const sha256Text = (text) => crypto.createHash('sha256').update(text).digest('hex');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const normalize = (value) => String(value ?? '').toLowerCase().normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '').replace(/ø/g, 'o').replace(/æ/g, 'ae').replace(/å/g, 'a')
  .replace(/[^a-z0-9]+/g, ' ').trim();

const ringArea = (ring) => {
  let sum = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) sum += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
  return sum / 2;
};
const ringCentroid = (ring) => {
  let twiceArea = 0; let cx = 0; let cy = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const cross = ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
    twiceArea += cross; cx += (ring[j][0] + ring[i][0]) * cross; cy += (ring[j][1] + ring[i][1]) * cross;
  }
  return Math.abs(twiceArea) < 1e-12 ? ring[0] : [cx / (3 * twiceArea), cy / (3 * twiceArea)];
};
const lineLength = (line) => line.slice(1).reduce((sum, point, index) => sum + Math.hypot(point[0] - line[index][0], point[1] - line[index][1]), 0);
const lineMidpoint = (line) => {
  if (!Array.isArray(line) || line.length < 2) return line?.[0] ?? null;
  let remaining = lineLength(line) / 2;
  for (let i = 1; i < line.length; i += 1) {
    const a = line[i - 1]; const b = line[i];
    const segment = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (remaining <= segment || i === line.length - 1) {
      const ratio = segment ? remaining / segment : 0;
      return [a[0] + (b[0] - a[0]) * ratio, a[1] + (b[1] - a[1]) * ratio];
    }
    remaining -= segment;
  }
  return line[Math.floor(line.length / 2)];
};
const representativePoint = (geojson, fallbackLat, fallbackLon) => {
  if (geojson?.type === 'Point') return { lat: geojson.coordinates[1], lon: geojson.coordinates[0] };
  if (geojson?.type === 'LineString') { const [lon, lat] = lineMidpoint(geojson.coordinates); return { lat, lon }; }
  if (geojson?.type === 'MultiLineString') {
    const line = [...geojson.coordinates].sort((a, b) => lineLength(b) - lineLength(a))[0];
    const [lon, lat] = lineMidpoint(line); return { lat, lon };
  }
  if (geojson?.type === 'Polygon') { const [lon, lat] = ringCentroid(geojson.coordinates[0]); return { lat, lon }; }
  if (geojson?.type === 'MultiPolygon') {
    const polygon = [...geojson.coordinates].sort((a, b) => Math.abs(ringArea(b[0])) - Math.abs(ringArea(a[0])))[0];
    const [lon, lat] = ringCentroid(polygon[0]); return { lat, lon };
  }
  return { lat: Number(fallbackLat), lon: Number(fallbackLon) };
};

const aggregate = readJson(aggregatePath);
const splitManifest = readJson(splitManifestPath);
const byId = new Map(aggregate.map((place) => [place.id, place]));
const manifestIds = [...splitManifest.places].sort((a, b) => a.order - b.order).map((row) => row.id);
let protocol = fs.readFileSync(path.join(root, protocolPath), 'utf8');
const osloStart = protocol.indexOf('## Oslo');
const correctionsMarker = protocol.indexOf('\nRelevante korrigerende merger for de første Oslo-batchene:', osloStart);
if (osloStart < 0 || correctionsMarker < 0) throw new Error('Fant ikke Oslo-hovedtabellen i protokollen.');
const primarySection = protocol.slice(osloStart, correctionsMarker);
const primaryRows = [...primarySection.matchAll(/^\|\s*(\d+)\s*\|\s*`([^`]+)`\s*\|/gm)];
const verifiedIds = new Set(primaryRows.map((match) => match[2]));
const maxBatch = Math.max(...primaryRows.map((match) => Number(match[1])));
const reviewStart = protocol.indexOf('### Dokumenterte Oslo-kontroller uten godkjent koordinat');
const reviewEnd = protocol.indexOf('\n## ', reviewStart + 4);
const reviewText = reviewStart >= 0 && reviewEnd > reviewStart ? protocol.slice(reviewStart, reviewEnd) : '';
const reviewedIds = new Set([...reviewText.matchAll(/^\| `([^`]+)`/gm)].map((match) => match[1]));
const pendingIds = manifestIds.filter((id) => !verifiedIds.has(id) && !reviewedIds.has(id));
if (!pendingIds.length) throw new Error('Østensjøvannet-kilden har ingen ukontrollerte records.');

const definitions = {
  ostensjovannet_nord: {
    mode: 'unresolved', locatorType: 'natural_area', identity: 'Nordre del av Østensjøvannet naturreservat som lokal våtmarkssone',
    reason: 'Recorden beskriver en retningsbestemt del av det større Østensjøvannet naturreservat uten en egen eksplisitt navngitt eller avgrenset kildegeometri. Hele reservatpolygonet kan ikke brukes som proxy for ett lokalt nordpunkt.',
    nextAction: 'Dokumenter en eksplisitt lokal sonegeometri eller flere kildebelagte våtmarksankre som avgrenser nordsonen.'
  },
  ostensjovannet_fugletarn: {
    mode: 'named_object', queries: ['Østensjøvannet fugletårn', 'Fugletårnet Østensjøvannet', 'Fugletårnet'],
    aliases: ['Østensjøvannet fugletårn', 'Fugletårnet Østensjøvannet', 'Fugletårnet', 'Fugletårn'],
    locatorType: 'structure', coordRole: 'structure_anchor', coordType: 'bird_hide_anchor',
    preferences: [['leisure', 'bird_hide'], ['man_made', 'tower'], ['tourism', 'viewpoint']],
    viewbox: '10.821,59.895,10.839,59.880', identity: 'Det konkrete fugletårnet/observasjonspunktet ved Østensjøvannet'
  },
  ostensjovannet_sivbelte: {
    mode: 'unresolved', locatorType: 'natural_area', identity: 'Sivdominert kantvegetasjon ved Østensjøvannet',
    reason: 'Recorden beskriver et habitatbelte med skiftende utstrekning, ikke ett dokumentert navngitt fysisk objekt med stabil grense. Reservatets samlede polygon kan ikke verifisere ett vilkårlig sivbelte-midpunkt.',
    nextAction: 'Dokumenter eksplisitt kartlagt siv-/våtmarksgeometri eller flere kildebelagte habitatankre før et canonical punkt godkjennes.'
  },
  ostensjovannet_sor: {
    mode: 'unresolved', locatorType: 'natural_area', identity: 'Sørlige del av Østensjøvannet naturreservat som lokal vannkant- og våtmarkssone',
    reason: 'Recorden beskriver en retningsbestemt sørsone uten en egen eksplisitt navngitt eller avgrenset kildegeometri. Hele reservatpolygonet kan ikke brukes som proxy for ett lokalt sørpunkt.',
    nextAction: 'Dokumenter en eksplisitt lokal sonegeometri eller flere kildebelagte vannkant-/våtmarksankre som avgrenser sørsonen.'
  },
  bogerudmyra: {
    mode: 'named_object', queries: ['Bogerudmyra', 'Bølermyra', 'Bøler Bogerudmyra'],
    aliases: ['Bogerudmyra', 'Bølermyra', 'Bøler/Bogerudmyra'],
    locatorType: 'natural_area', coordRole: 'area_anchor', coordType: 'wetland_center',
    preferences: [['natural', 'wetland']],
    viewbox: '10.833,59.902,10.858,59.884', identity: 'Bogerudmyra/Bølermyra som konkret navngitt myr- eller våtmarksområde'
  }
};

const reportSeed = 'reports/oslo-coordinate-control-ostensjovannet-working';
const candidateName = (candidate) => candidate.namedetails?.name ?? candidate.name ?? String(candidate.display_name ?? '').split(',')[0];
const candidateKey = (candidate) => `${candidate.osm_type}:${candidate.osm_id}`;
const searchNominatim = async (id, definition) => {
  const queryRuns = [];
  const combined = new Map();
  for (const query of definition.queries) {
    const params = new URLSearchParams({
      format: 'jsonv2', q: `${query}, Oslo, Norway`, limit: '20', polygon_geojson: '1', addressdetails: '1', namedetails: '1',
      viewbox: definition.viewbox, bounded: '1'
    });
    const url = `https://nominatim.openstreetmap.org/search?${params}`;
    const response = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': 'History-Go-coordinate-audit/1.0' } });
    if (!response.ok) throw new Error(`Nominatim failed for ${id}: ${response.status} ${response.statusText}`);
    const results = await response.json();
    queryRuns.push({ query, queryUrl: url, results });
    for (const result of results) combined.set(candidateKey(result), result);
    await sleep(1100);
  }
  const results = [...combined.values()];
  writeJson(`${reportSeed}/nominatim-${id}.json`, { queryRuns, combinedResults: results });
  return results;
};
const chooseCandidate = (results, definition) => {
  const aliases = definition.aliases.map(normalize);
  const scored = results.map((candidate) => {
    if (!aliases.includes(normalize(candidateName(candidate)))) return { candidate, score: -Infinity };
    const category = candidate.class ?? candidate.category;
    const pref = definition.preferences.findIndex(([expectedCategory, type]) => category === expectedCategory && candidate.type === type);
    if (pref < 0) return { candidate, score: -Infinity };
    return { candidate, score: 1000 - pref * 100 + (candidate.geojson ? 10 : 0) };
  }).filter((entry) => Number.isFinite(entry.score)).sort((a, b) => b.score - a.score || Number(a.candidate.osm_id) - Number(b.candidate.osm_id));
  if (!scored.length) return { selected: null, reason: 'no_exact_semantic_candidate' };
  const top = scored.filter((entry) => entry.score === scored[0].score);
  return top.length === 1 ? { selected: top[0].candidate, reason: 'unique_exact_semantic_candidate' } : { selected: null, reason: `ambiguous_exact_semantic_candidates:${top.length}` };
};
const osmId = (candidate) => `osm-${candidate.osm_type}:${candidate.osm_id}`;
const osmUrl = (candidate) => `https://www.openstreetmap.org/${candidate.osm_type}/${candidate.osm_id}`;

const before = {}; const after = {}; const verified = {}; const unresolved = {}; const evidenceDefs = {};
const applyVerified = (id, definition, candidate) => {
  const place = byId.get(id); const point = representativePoint(candidate.geojson, candidate.lat, candidate.lon);
  const sourceObjectId = osmId(candidate); const category = candidate.class ?? candidate.category;
  before[id] = { lat: place.lat, lon: place.lon, coordStatus: place.coordStatus ?? null, coordSource: place.coordSource ?? null, coordType: place.coordType ?? null };
  Object.assign(place, {
    lat: point.lat, lon: point.lon, locatorType: definition.locatorType,
    sourceProvider: 'osm', sourceObjectId,
    geocodeAccuracy: ['Polygon', 'MultiPolygon'].includes(candidate.geojson?.type) ? 'geometric_center' : 'semantic_anchor',
    coordRole: definition.coordRole, coordType: definition.coordType, coordStatus: 'verified_geometry',
    coordSource: `OpenStreetMap ${candidate.osm_type} ${candidate.osm_id} – ${candidateName(candidate)}`,
    coordSourceId: sourceObjectId, coordSourceUrl: osmUrl(candidate), coordVerifiedAt: verifiedAt,
    coordNote: `Eksakt navngitt OSM-objekt valgt innenfor en forhåndsdefinert lokal scope-boks og med riktig objekttype ${category}/${candidate.type}; ikke nearest/first-hit. Representasjonspunktet er beregnet fra selve kildegeometrien.`
  });
  delete place.coordPrecisionM;
  verified[id] = { sourceObjectId, sourceUrl: osmUrl(candidate), category, candidate, definition };
  after[id] = { lat: place.lat, lon: place.lon, coordStatus: place.coordStatus, coordSource: place.coordSource, coordType: place.coordType, sourceObjectId };
  evidenceDefs[id] = {
    identity: definition.identity, locatorType: definition.locatorType,
    requiredEvidence: ['ett unikt eksakt navngitt fysisk objekt i recordens forhåndsdefinerte lokale scope'],
    evidence: [{
      sourceProvider: 'osm', sourceName: `OpenStreetMap – ${candidateName(candidate)}`, sourceUrl: osmUrl(candidate), sourceObjectId,
      sourceQuality: 'exact_named_semantic_object_in_local_scope',
      finding: `Eksakt navnetreff med objekttype ${category}/${candidate.type} og geometri ${candidate.geojson?.type ?? 'Point'} innenfor den lokale scope-boksen.`,
      canVerifyCoordinate: true, reason: place.coordNote
    }]
  };
};
const applyUnresolved = (id, definition, reason, nextAction) => {
  const place = byId.get(id);
  before[id] = { lat: place.lat, lon: place.lon, coordStatus: place.coordStatus ?? null, coordSource: place.coordSource ?? null, coordType: place.coordType ?? null };
  Object.assign(place, {
    locatorType: definition.locatorType, coordStatus: 'needs_source', coordType: 'legacy_unverified',
    coordSource: `${id}_canonical_geometry_unresolved`, coordVerifiedAt: verifiedAt, coordNote: reason
  });
  for (const field of ['sourceProvider', 'sourceObjectId', 'coordSourceId', 'coordSourceUrl', 'geocodeAccuracy', 'coordPrecisionM']) delete place[field];
  unresolved[id] = { reason, nextAction, locatorType: definition.locatorType };
  after[id] = { lat: place.lat, lon: place.lon, coordStatus: place.coordStatus, coordSource: place.coordSource, coordType: place.coordType, sourceObjectId: null };
  evidenceDefs[id] = {
    identity: definition.identity, locatorType: definition.locatorType, requiredEvidence: [nextAction],
    evidence: [{
      sourceProvider: 'miljodirektoratet', sourceName: 'Naturbase – Østensjøvannet naturreservat', sourceUrl: reserveSourceUrl,
      sourceObjectId: reserveSourceObjectId, sourceQuality: 'official_parent_area_geometry_only',
      finding: reason, canVerifyCoordinate: false,
      reason: 'Den offisielle reservatgeometrien dokumenterer parent-området, men kan ikke alene verifisere denne lokale delsonen eller dette lokale objektet.'
    }]
  };
};

for (const id of pendingIds) {
  const definition = definitions[id];
  if (!definition) throw new Error(`Mangler definisjon for ${id}`);
  if (definition.mode === 'unresolved') {
    applyUnresolved(id, definition, definition.reason, definition.nextAction);
    continue;
  }
  const results = await searchNominatim(id, definition);
  const resolution = chooseCandidate(results, definition);
  if (!resolution.selected) {
    applyUnresolved(
      id, definition,
      `Kontrollen ga ikke ett unikt eksakt navngitt fysisk objekt med riktig objekttype innenfor den forhåndsdefinerte lokale scope-boksen (${resolution.reason}). Legacy-punktet beholdes kun som uverifisert kartanker.`,
      id === 'bogerudmyra'
        ? 'Dokumenter ett entydig navngitt myr-/våtmarksobjekt med eksplisitt geometri eller flere kildebelagte habitatankre.'
        : 'Dokumenter ett entydig eksakt fugletårn-/observasjonsobjekt med fysisk punkt eller geometri.'
    );
  } else {
    applyVerified(id, definition, resolution.selected);
  }
}

writeJson(aggregatePath, aggregate);
for (const id of pendingIds) {
  const childPath = `${splitDir}/${id}.json`; const child = readJson(childPath); const canonical = byId.get(id);
  for (const field of ['lat','lon','locatorType','sourceProvider','sourceObjectId','geocodeAccuracy','coordRole','coordType','coordStatus','coordSource','coordSourceId','coordSourceUrl','coordVerifiedAt','coordNote']) {
    if (Object.hasOwn(canonical, field)) child[field] = canonical[field]; else delete child[field];
  }
  delete child.coordPrecisionM; writeJson(childPath, child);
}

splitManifest.source_sha256 = sha256Text(fs.readFileSync(path.join(root, aggregatePath), 'utf8'));
splitManifest.generated_at = new Date().toISOString();
const splitIndex = [];
for (const row of splitManifest.places) {
  const childPath = `data/places/natur/oslo/${row.file}`; const childText = fs.readFileSync(path.join(root, childPath), 'utf8');
  row.sha256 = sha256Text(childText); const place = JSON.parse(childText);
  splitIndex.push({
    id: place.id, name: place.name ?? null, category: place.category ?? null, lat: place.lat ?? null, lon: place.lon ?? null,
    r: place.r ?? null, year: place.year ?? null, coordStatus: place.coordStatus ?? null, coordType: place.coordType ?? null,
    locatorType: place.locatorType ?? null, sourceProvider: place.sourceProvider ?? null, sourceObjectId: place.sourceObjectId ?? null,
    geocodeAccuracy: place.geocodeAccuracy ?? null, coordRole: place.coordRole ?? null, coordSource: place.coordSource ?? null,
    coordSourceId: place.coordSourceId ?? null, coordSourceUrl: place.coordSourceUrl ?? null, coordVerifiedAt: place.coordVerifiedAt ?? null,
    coordNote: place.coordNote ?? null, file: row.file
  });
}
writeJson(splitManifestPath, splitManifest); writeJson(splitIndexPath, splitIndex);

for (const id of pendingIds) {
  const place = byId.get(id); const definition = evidenceDefs[id]; const isVerified = Boolean(verified[id]);
  const sourceObjectId = isVerified ? verified[id].sourceObjectId : null;
  writeJson(`data/coordinate-evidence/oslo/natur/${id}.json`, {
    schemaVersion: '1.0', placeId: id, placeFile: aggregatePath,
    evidenceStatus: isVerified ? 'applied_to_place' : 'needs_research',
    coordinateDecision: isVerified ? 'do_not_change_coordinates_yet' : 'needs_geometry',
    currentCoordinate: { lat: place.lat, lon: place.lon, r: place.r, coordStatus: place.coordStatus, coordSource: place.coordSource, coordType: place.coordType, coordNote: place.coordNote },
    identity: { currentName: place.name, resolvedIdentity: definition.identity, identityStatus: 'resolved', identityProblem: isVerified ? '' : place.coordNote, locatorTypeCandidate: definition.locatorType, requiresSplit: false, splitReason: '' },
    requiredEvidence: definition.requiredEvidence, evidence: definition.evidence, addressCandidates: [],
    sourceObjectCandidates: definition.evidence.map((item) => ({ sourceProvider: item.sourceProvider, sourceObjectId: item.sourceObjectId, canApplyToPlace: Boolean(item.canVerifyCoordinate) })),
    geometryCandidates: isVerified ? [{ sourceProvider: 'osm', sourceObjectId, lat: place.lat, lon: place.lon, coordRole: place.coordRole, canApplyToPlace: true }] : [],
    coordinateCandidates: isVerified ? [{ lat: place.lat, lon: place.lon, coordRole: place.coordRole, sourceObjectId, canApplyToPlace: true }] : [],
    decision: { canBecomeVerified: isVerified, blockedReason: isVerified ? '' : place.coordNote, nextAction: isVerified ? 'Kildeobjekt og representasjonspunkt er anvendt på canonical place.' : unresolved[id].nextAction },
    notes: [place.coordNote]
  });
}
const evidenceManifest = readJson(evidenceManifestPath);
for (const id of pendingIds) {
  const relative = `oslo/natur/${id}.json`;
  if (!evidenceManifest.files.includes(relative)) evidenceManifest.files.push(relative);
}
writeJson(evidenceManifestPath, evidenceManifest);

const newBatch = maxBatch + 1;
const newTotal = verifiedIds.size + Object.keys(verified).filter((id) => !verifiedIds.has(id)).length;
const verifiedList = Object.keys(verified);
const unresolvedList = Object.keys(unresolved);
protocol = protocol.replace(
  /^Oslo-tabellen inneholder nå .*$/m,
  `Oslo-tabellen inneholder nå ${newTotal} dokumenterte verifiserte eller kildekontrollerte canonical steder. Batch ${newBatch} kontrollerer de gjenværende ukontrollerte recordene i \`places_oslo_natur_ostensjovannet.json\`. Narrative delsoner må ha egen eksplisitt lokal geometri og kan ikke arve hele reservatpolygonet; fugletårnet og Bogerudmyra krever ett unikt eksakt navngitt fysisk objekt med riktig objekttype.`
);
const rows = Object.entries(verified).map(([id, decision]) => `| ${newBatch} | \`${id}\` | ${byId.get(id).name} | verified_geometry | \`${decision.sourceObjectId}\` |`).join('\n');
const batchNote = `Batch ${newBatch} (2026-07-21) reviderer Østensjøvannet-kildens fem legacy \`OpenStreetMap/Mapcarta\`- og \`nearby_reference\`-punkter. \`ostensjovannet_nord\`, \`ostensjovannet_sivbelte\` og \`ostensjovannet_sor\` er lokale narrative delsoner og får ikke låne hele Naturbase-reservatpolygonet som falsk punktpresisjon. \`ostensjovannet_fugletarn\` og \`bogerudmyra\` kan bare verifiseres ved ett unikt eksakt navngitt fysisk objekt med riktig semantisk objekttype i forhåndsdefinert lokal scope; ingen nearest/first-hit-logikk brukes.`;
protocol = protocol.replace('\nRelevante korrigerende merger for de første Oslo-batchene:', `\n${rows}${rows ? '\n\n' : ''}${batchNote}\nRelevante korrigerende merger for de første Oslo-batchene:`);
const reviewRows = Object.keys(unresolved).map((id) => `| \`${id}\` – ${byId.get(id).name} | needs_review | ${unresolved[id].reason} | ${unresolved[id].nextAction} |`);
if (reviewRows.length) {
  const lines = protocol.split('\n');
  const sectionLine = lines.findIndex((line) => line.startsWith('### Dokumenterte Oslo-kontroller uten godkjent koordinat'));
  let started = false; let insertAt = -1;
  for (let i = sectionLine + 1; i < lines.length; i += 1) {
    if (lines[i].startsWith('| kandidat |')) started = true;
    if (started && lines[i] === '') { insertAt = i; break; }
  }
  if (insertAt < 0) throw new Error('Fant ikke slutten av needs_review-tabellen.');
  lines.splice(insertAt, 0, ...reviewRows); protocol = lines.join('\n');
}
const nextBatch = newBatch + 1;
protocol = protocol.replace(
  /## Neste arbeid\n\n(?:- .*\n){3,6}/,
  `## Neste arbeid\n\n- Neste nye Oslo-kontroll er batch ${nextBatch}.\n- \`places_oslo_natur_ostensjovannet.json\` er nå fullt kontrollert i manifestrekkefølge. Neste aktive naturkilde i køen er \`places_oslo_natur_salamanderdammer.json\`; tidligere kontrollerte placeId-er skal hoppes over.\n- Fortsett alltid med koordinatmetode etter fysisk objekttype; et manifest er bare køkilde, ikke metodevalg.\n- Før alle fullførte \`needs_review\`-kontroller i den separate Oslo-tabellen samme dag som avgjørelsen tas.\n`
);
fs.writeFileSync(path.join(root, protocolPath), protocol);

const reportDir = `reports/oslo-coordinate-control-batch-${newBatch}-ostensjovannet`;
fs.mkdirSync(path.join(root, reportDir), { recursive: true });
if (fs.existsSync(path.join(root, reportSeed))) {
  for (const file of fs.readdirSync(path.join(root, reportSeed))) fs.renameSync(path.join(root, reportSeed, file), path.join(root, reportDir, file));
  fs.rmSync(path.join(root, reportSeed), { recursive: true, force: true });
}
writeJson(`${reportDir}/results.json`, {
  generatedAt: new Date().toISOString(), batch: newBatch, sourceQueue: aggregatePath, pendingIds,
  verified: verifiedList, needsReview: unresolvedList, before, after,
  method: 'explicit subzone geometry required; bounded exact-name semantic object selection for physical named candidates; no nearest/first-hit'
});
fs.writeFileSync(path.join(root, reportDir, 'README.md'), `# Oslo coordinate control batch ${newBatch} – Østensjøvannet\n\n## Verified\n${Object.entries(verified).map(([id, decision]) => `- \`${id}\` → \`${decision.sourceObjectId}\``).join('\n') || '- none'}\n\n## Completed without approved coordinate\n${Object.keys(unresolved).map((id) => `- \`${id}\` → needs_review / needs_source`).join('\n') || '- none'}\n\nAll bounded Nominatim candidate sets are saved in this report directory. Narrative subzones do not inherit the parent reserve polygon. No nearest/first-hit selection is used.\n`);
console.log(JSON.stringify({ batch: newBatch, pendingIds, verified: verifiedList, needsReview: unresolvedList, newTotal, nextBatch, reportDir }, null, 2));
