import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const verifiedAt = '2026-07-21';
const aggregatePath = 'data/places/natur/oslo/places_oslo_natur_salamanderdammer.json';
const splitDir = 'data/places/natur/oslo/places_oslo_natur_salamanderdammer';
const splitManifestPath = 'data/places/natur/oslo/places_oslo_natur_salamanderdammer_manifest.json';
const splitIndexPath = 'data/places/natur/oslo/places_oslo_natur_salamanderdammer_index.json';
const evidenceManifestPath = 'data/coordinate-evidence/manifest.json';
const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';

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
run(['commit', '-m', 'Rebase salamander pond coordinate runner onto latest main']);
run(['push', '--force-with-lease', 'origin', `HEAD:${branchName}`]);

const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
const writeJson = (relativePath, value) => {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const sha256Text = (text) => crypto.createHash('sha256').update(text).digest('hex');

const aggregate = readJson(aggregatePath);
const splitManifest = readJson(splitManifestPath);
const byId = new Map(aggregate.map((place) => [place.id, place]));
const manifestIds = [...splitManifest.places].sort((a, b) => a.order - b.order).map((row) => row.id);
let protocol = fs.readFileSync(path.join(root, protocolPath), 'utf8');

const osloStart = protocol.indexOf('## Oslo');
const correctionsMarker = protocol.indexOf('\nRelevante korrigerende merger for de første Oslo-batchene:', osloStart);
if (osloStart < 0 || correctionsMarker < 0) throw new Error('Fant ikke Oslo-hovedseksjonen.');
const primarySection = protocol.slice(osloStart, correctionsMarker);
const primaryRows = [...primarySection.matchAll(/^\|\s*(\d+)\s*\|\s*`([^`]+)`\s*\|/gm)];
const verifiedIds = new Set(primaryRows.map((match) => match[2]));
const reviewStart = protocol.indexOf('### Dokumenterte Oslo-kontroller uten godkjent koordinat');
const reviewEnd = protocol.indexOf('\n## ', reviewStart + 4);
const reviewText = reviewStart >= 0 && reviewEnd > reviewStart ? protocol.slice(reviewStart, reviewEnd) : '';
const reviewedIds = new Set([...reviewText.matchAll(/^\| `([^`]+)`/gm)].map((match) => match[1]));
const pendingIds = manifestIds.filter((id) => !verifiedIds.has(id) && !reviewedIds.has(id));
if (!pendingIds.length) throw new Error('Salamanderdam-kilden har ingen ukontrollerte records.');

const nextWorkMatch = protocol.match(/Neste nye Oslo-kontroll er batch (\d+)\./);
if (!nextWorkMatch) throw new Error('Fant ikke neste batchnummer i protokollen.');
const newBatch = Number(nextWorkMatch[1]);
const totalMatch = protocol.match(/Oslo-tabellen inneholder nå (\d+) dokumenterte/);
if (!totalMatch) throw new Error('Fant ikke Oslo-totalen i protokollen.');
const currentTotal = Number(totalMatch[1]);

const definitions = {
  bygdoy_kongsgard_salamanderdam: {
    locatorType: 'thematic_locality',
    identity: 'Salamanderlokalitet i kulturlandskapet ved Bygdøy Kongsgård',
    sourceProvider: 'norsk_naturarv', sourceName: 'Norsk Naturarv – Bygdøy Kongsgård',
    sourceUrl: 'https://www.naturarv.no/bygdoey-kongsgaard.371995-72064.html', sourceObjectId: 'norsk-naturarv:bygdoey-kongsgaard',
    reason: 'Kilderecorden dokumenterer salamanderforekomst i dam ved Bygdøy Kongsgård, men dagens koordinat er uttrykkelig et offentlig områdeanker og ikke en dokumentert koordinat for selve dammen. Å bruke Kongsgårdens områdepunkt som verified salamanderdam ville gjøre et pedagogisk proxy-anker til et falskt fysisk sted og overlappe den bredere Kongsgård-identiteten.',
    nextAction: 'Dokumenter en offentlig og ikke-sensitiv damgeometri dersom lokaliteten skal være et eget place; ellers modeller salamanderforekomsten som tematisk naturrelation til Bygdøy Kongsgård uten separat koordinatmarkør.'
  },
  bantjern_salamanderlokalitet: {
    locatorType: 'thematic_locality',
    identity: 'Dokumentert salamanderlokalitet ved privat dammiljø i Bånntjernveien',
    sourceProvider: 'norsk_naturarv', sourceName: 'Norsk Naturarv – Bånntjernveien 5',
    sourceUrl: 'https://www.naturarv.no/baantjernveien-5.371982-72064.html', sourceObjectId: 'norsk-naturarv:baantjernveien-5',
    reason: 'Kilden gjelder et dammiljø ved Bånntjernveien 5, mens canonical record bevisst bruker et offentlig Båntjern-næranker for å unngå å sende brukere til privat tomt. Båntjern-området er derfor ikke det samme fysiske objektet som salamanderlokaliteten, og nærankeret kan ikke godkjennes som verified koordinat for dammen.',
    nextAction: 'Behold lokaliteten som ikke-publisert eller tematisk arts-/habitatrelation, eller dokumenter et separat offentlig besøksanker som eksplisitt modelleres som formidlingspunkt og ikke som selve salamanderdammen.'
  },
  tjernsmyr_salamanderlokalitet: {
    locatorType: 'natural_area',
    identity: 'Tjernsmyr salamanderlokalitet ved Lysaker',
    sourceProvider: 'statens_vegvesen', sourceName: 'Statens vegvesen – salamanderliv ved Tjernsmyr',
    sourceUrl: 'https://www.vegvesen.no/vegprosjekter/europaveg/e18vestkorridoren/nyhetsarkiv/undersokte-salamanderliv-ved-tjernsmyr/', sourceObjectId: 'vegvesen:e18-vestkorridoren:tjernsmyr-salamander',
    reason: 'Recorden dokumenterer selv at Tjernsmyr ligger i Bærum, men er lagret i Oslo-kilden. En koordinat kan ikke canonical-verifiseres i Oslo-køen før geografisk eierskap og kildefamilie er rettet; dagens generiske wetland-reference mangler dessuten et stabilt eksplisitt kildeobjekt.',
    nextAction: 'Flytt recorden til Akershus/Bærum-kontekst og dokumenter deretter ett stabilt Tjernsmyr-områdeobjekt eller offisiell våtmarksgeometri før koordinaten godkjennes.'
  },
  blindern_forskningsparken_salamanderdam: {
    locatorType: 'thematic_locality',
    identity: 'Salamanderdam ved Forskningsparken/Blindern omtalt i kommunal amfibiekartlegging',
    sourceProvider: 'oslo_kommune', sourceName: 'Oslo kommune – Oslos ukjente amfibiedammer kartlegges',
    sourceUrl: 'https://aktuelt.oslo.kommune.no/oslos-ukjente-amfibiedammer-kartlegges', sourceObjectId: 'oslo-kommune:amfibiedammer:forskningsparken',
    reason: 'Oslo kommune dokumenterer salamandere i dam ved Forskningsparken, men dagens koordinat er uttrykkelig et campus-/Forskningsparken-næranker og ikke et dokumentert fysisk damobjekt. Et generelt campuspunkt kan derfor ikke promoteres til verified salamanderdam.',
    nextAction: 'Dokumenter en offentlig og ikke-sensitiv damgeometri eller modeller lokaliteten som tematisk resultat av kommunal amfibiekartlegging uten separat presis place-markør.'
  }
};

const before = {}; const after = {}; const unresolved = {}; const evidenceDefs = {};
for (const id of pendingIds) {
  const definition = definitions[id];
  if (!definition) throw new Error(`Mangler definisjon for ${id}`);
  const place = byId.get(id);
  before[id] = { lat: place.lat, lon: place.lon, coordStatus: place.coordStatus ?? null, coordSource: place.coordSource ?? null, coordType: place.coordType ?? null };
  Object.assign(place, {
    locatorType: definition.locatorType,
    coordStatus: 'needs_source',
    coordType: 'legacy_unverified',
    coordSource: `${id}_canonical_geometry_unresolved`,
    coordVerifiedAt: verifiedAt,
    coordNote: definition.reason
  });
  for (const field of ['sourceProvider', 'sourceObjectId', 'coordSourceId', 'coordSourceUrl', 'geocodeAccuracy', 'coordPrecisionM', 'coordRole']) delete place[field];
  unresolved[id] = { reason: definition.reason, nextAction: definition.nextAction, locatorType: definition.locatorType };
  after[id] = { lat: place.lat, lon: place.lon, coordStatus: place.coordStatus, coordSource: place.coordSource, coordType: place.coordType, sourceObjectId: null };
  evidenceDefs[id] = definition;
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
  const place = byId.get(id); const definition = evidenceDefs[id];
  writeJson(`data/coordinate-evidence/oslo/natur/${id}.json`, {
    schemaVersion: '1.0', placeId: id, placeFile: aggregatePath,
    evidenceStatus: 'needs_research', coordinateDecision: 'needs_geometry',
    currentCoordinate: { lat: place.lat, lon: place.lon, r: place.r, coordStatus: place.coordStatus, coordSource: place.coordSource, coordType: place.coordType, coordNote: place.coordNote },
    identity: { currentName: place.name, resolvedIdentity: definition.identity, identityStatus: 'resolved', identityProblem: definition.reason, locatorTypeCandidate: definition.locatorType, requiresSplit: false, splitReason: '' },
    requiredEvidence: [definition.nextAction],
    evidence: [{
      sourceProvider: definition.sourceProvider, sourceName: definition.sourceName, sourceUrl: definition.sourceUrl,
      sourceObjectId: definition.sourceObjectId, sourceQuality: id === 'tjernsmyr_salamanderlokalitet' ? 'identity_source_with_wrong_municipality_scope' : 'locality_identity_without_verifiable_public_coordinate',
      finding: definition.reason, canVerifyCoordinate: false, reason: definition.reason
    }],
    addressCandidates: [],
    sourceObjectCandidates: [{ sourceProvider: definition.sourceProvider, sourceObjectId: definition.sourceObjectId, canApplyToPlace: false }],
    geometryCandidates: [], coordinateCandidates: [],
    decision: { canBecomeVerified: false, blockedReason: definition.reason, nextAction: definition.nextAction },
    notes: [definition.reason]
  });
}
const evidenceManifest = readJson(evidenceManifestPath);
for (const id of pendingIds) {
  const relative = `oslo/natur/${id}.json`;
  if (!evidenceManifest.files.includes(relative)) evidenceManifest.files.push(relative);
}
writeJson(evidenceManifestPath, evidenceManifest);

protocol = protocol.replace(
  /^Oslo-tabellen inneholder nå .*$/m,
  `Oslo-tabellen inneholder nå ${currentTotal} dokumenterte verifiserte eller kildekontrollerte canonical steder. Batch ${newBatch} kontrollerer de fire gjenværende salamanderdam-recordene etter identitet-, publiserings- og kommuneprinsippet. Pedagogiske nærankre for private eller sårbare lokaliteter promoteres ikke til verified fysiske dammer, og Tjernsmyr kan ikke canonical-godkjennes i Oslo-køen fordi recorden selv plasserer lokaliteten i Bærum.`
);
const batchNote = `Batch ${newBatch} (2026-07-21) avslutter \`places_oslo_natur_salamanderdammer.json\` uten å gjøre pedagogiske proxy-punkter til falskt presise natursteder. \`bygdoy_kongsgard_salamanderdam\` og \`blindern_forskningsparken_salamanderdam\` har dokumenterte lokalitetsidentiteter, men dagens koordinater er uttrykkelig brede offentlige nærankre; \`bantjern_salamanderlokalitet\` viser bevisst til et offentlig nærområde i stedet for den private damlokaliteten; og \`tjernsmyr_salamanderlokalitet\` ligger i Bærum og må flyttes ut av Oslo-kilden før eventuell geometri kan godkjennes. Alle fire avsluttes derfor som needs_review / needs_source i denne batchen.`;
protocol = protocol.replace('\nRelevante korrigerende merger for de første Oslo-batchene:', `\n${batchNote}\nRelevante korrigerende merger for de første Oslo-batchene:`);
const reviewRows = pendingIds.map((id) => `| \`${id}\` – ${byId.get(id).name} | needs_review | ${unresolved[id].reason} | ${unresolved[id].nextAction} |`);
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
  `## Neste arbeid\n\n- Neste nye Oslo-kontroll er batch ${nextBatch}.\n- \`places_oslo_natur_salamanderdammer.json\` er nå fullt kontrollert i manifestrekkefølge. De eksplisitt splittede Oslo-naturmanifestene er dermed gjennomgått; før batch ${nextBatch} starter skal resterende unsplit naturkilder auditeres mot \`reports/places-unsplit-manifest-audit.json\` og allerede kontrollerte placeId-er hoppes over.\n- Fortsett alltid med koordinatmetode etter fysisk objekttype; et manifest eller en biologisk lokalitetskilde er bare kø-/identitetskilde, ikke automatisk koordinatbevis.\n- Før alle fullførte \`needs_review\`-kontroller i den separate Oslo-tabellen samme dag som avgjørelsen tas.\n`
);
fs.writeFileSync(path.join(root, protocolPath), protocol);

const reportDir = `reports/oslo-coordinate-control-batch-${newBatch}-salamanderdammer`;
writeJson(`${reportDir}/results.json`, {
  generatedAt: new Date().toISOString(), batch: newBatch, sourceQueue: aggregatePath, pendingIds,
  verified: [], needsReview: pendingIds, before, after,
  method: 'identity/privacy/municipality first; pedagogical nearby anchors are not physical coordinate evidence'
});
fs.writeFileSync(path.join(root, reportDir, 'README.md'), `# Oslo coordinate control batch ${newBatch} – salamanderdammer\n\n## Verified\n- none\n\n## Completed without approved coordinate\n${pendingIds.map((id) => `- \`${id}\` → needs_review / needs_source`).join('\n')}\n\nThe source records are treated as biological/locality evidence, not automatic public coordinate evidence. Private, sensitive, pedagogical or wrong-municipality proxy anchors are not promoted to verified physical places.\n`);
console.log(JSON.stringify({ batch: newBatch, pendingIds, verified: [], needsReview: pendingIds, newTotal: currentTotal, nextBatch, reportDir }, null, 2));
