import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const P = (x) => path.join(ROOT, x);
const read = (x) => JSON.parse(fs.readFileSync(P(x), 'utf8'));
const write = (x, v) => { fs.mkdirSync(path.dirname(P(x)), { recursive: true }); fs.writeFileSync(P(x), `${JSON.stringify(v, null, 2)}\n`); };
const rows = (v) => Array.isArray(v) ? v : Array.isArray(v?.places) ? v.places : Array.isArray(v?.items) ? v.items : v?.id ? [v] : [];
const canon = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ø/g, 'o').replace(/å/g, 'a').replace(/æ/g, 'ae');

const INPUT = 'reports/oslo-attractions-completeness-20260720/oslo-west-churches/input.json';
const REPORT = 'reports/oslo-attractions-completeness-20260720/oslo-west-churches/decision.md';
const PM = 'data/places/manifest.json';
const EM = 'data/coordinate-evidence/manifest.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const input = read(INPUT);
const specs = input.places;
const verifiedAt = input.verifiedAt;

const active = read(PM).files || [];
for (const s of specs) for (const entry of active) {
  const rel = `data/${entry}`;
  if (fs.existsSync(P(rel)) && rows(read(rel)).some((x) => x?.id === s.id)) throw new Error(`${s.id} already active in ${rel}`);
}

execFileSync('npm', ['run', 'build:tools'], { stdio: 'inherit' });
const found = specs.map((s) => {
  const raw = execFileSync('node', ['dist/tools/address-first-coordinate-finder.mjs', '--address', s.addressQuery], { encoding: 'utf8' });
  const finder = JSON.parse(raw);
  const c = finder.coordinate;
  if (!finder.ok || finder.status !== 'verified_candidate' || finder.sourceProvider !== 'official_address') throw new Error(`${s.id}: ${raw}`);
  if (String(c?.address?.number) !== s.expectedNumber || canon(c?.address?.street) !== canon(s.expectedStreet)) throw new Error(`${s.id}: unexpected address result ${raw}`);
  return { s, finder, c };
});

const pm = read(PM);
const em = read(EM);
const report = ['# VisitOSLO Oslo West — church completeness decision', '', `Date: ${verifiedAt}`, '', 'All three candidates passed the active canonical duplicate gate and use the existing Oslo `by` church model.', ''];

for (const { s, finder, c } of found) {
  const placeFile = `data/places/by/oslo/places/${s.id}.json`;
  const placeEntry = `places/by/oslo/places/${s.id}.json`;
  const evidenceFile = `data/coordinate-evidence/oslo/by/${s.id}.json`;
  const evidenceEntry = `oslo/by/${s.id}.json`;
  if (fs.existsSync(P(placeFile)) || fs.existsSync(P(evidenceFile))) throw new Error(`${s.id}: target already exists`);
  const coordNote = `Offisiell adressekoordinat fra Geonorge Adresser API for ${c.address.street} ${c.address.number}, OSLO. Punktet brukes som display- og unlock-marker for ${s.name}-bygningen.`;
  const externalLinks = s.externalLinks.map((x) => ({ ...x, verifiedAt }));
  const place = {
    id: s.id, name: s.name, visual: { designCode: 'church_miniature' }, category: 'by', year: s.year,
    emne_ids: ['em_by_historiske_lag_i_hverdagsrom', 'em_by_romlig_orden'], desc: s.desc, popupDesc: s.popupDesc,
    quiz_profile: {
      place_type: 'institusjonsbygg', subtype: s.subtype, signature_features: s.signatureFeatures, primary_angles: s.primaryAngles,
      question_families: ['gjenkjenning', 'romlig_lesning', 'historisk_endring', 'arkitektur', 'kontrast'],
      avoid_angles: ['generisk_kirke', 'generisk_landemerke', 'religionsquiz_uten_stedsforankring'], must_include: s.mustInclude,
      contrast_targets: s.contrastTargets,
      notes: 'Spør som konkret kirkebygg i Oslos byutvikling: arkitektur, plassering, historiske lag og faktisk lokal rolle må komme før generisk kirkehistorie.'
    },
    rounds_exclude: ['nature'], ...(s.relatedPlaceIds.length ? { related_place_ids: s.relatedPlaceIds } : {}),
    lat: c.lat, lon: c.lon, r: c.r || 60, locatorType: c.locatorType || 'building', sourceProvider: finder.sourceProvider,
    sourceObjectId: finder.sourceObjectId, address: c.address, geocodeAccuracy: c.geocodeAccuracy, coordRole: c.coordRole,
    coordStatus: c.coordStatus, coordSource: c.coordSource, coordSourceId: finder.sourceObjectId, coordSourceUrl: finder.sourceUrl,
    coordType: c.coordType, coordVerifiedAt: verifiedAt, coordNote, externalLinks
  };
  write(placeFile, place);
  write(evidenceFile, {
    placeId: s.id, placeFile, evidenceStatus: 'applied_to_place', coordinateDecision: 'do_not_change_coordinates_yet',
    currentCoordinate: { lat: place.lat, lon: place.lon, r: place.r, coordStatus: place.coordStatus, coordSource: place.coordSource, coordType: place.coordType, coordNote },
    identity: { currentName: s.name, resolvedIdentity: `${s.name} at ${c.address.street} ${c.address.number}, Oslo`, identityStatus: 'resolved', identityProblem: '', locatorTypeCandidate: place.locatorType, requiresSplit: false, splitReason: '' },
    requiredEvidence: ['active canonical duplicate audit', `normative Geonorge address-first result for ${s.addressQuery}`, 'external institution and local-history sources'],
    evidence: [{ sourceProvider: 'official_address', sourceName: 'geonorge_adresser_v1', sourceUrl: finder.sourceUrl, sourceObjectId: finder.sourceObjectId, sourceQuality: 'official_address_plus_institution_and_local_history_sources', finding: `Address-first lookup resolves the documented current church address for ${s.name}.`, canVerifyCoordinate: true, reason: coordNote }],
    addressCandidates: [{ address: s.addressQuery, sourceProvider: finder.sourceProvider, sourceObjectId: finder.sourceObjectId, canApplyToPlace: true }],
    sourceObjectCandidates: [{ sourceProvider: finder.sourceProvider, sourceObjectId: finder.sourceObjectId, canApplyToPlace: true }], geometryCandidates: [],
    coordinateCandidates: [{ lat: place.lat, lon: place.lon, coordRole: place.coordRole, canApplyToPlace: true }],
    decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Keep the verified building-address marker and treat the church as one distinct canonical by place.' }, notes: [coordNote]
  });
  if (pm.files.includes(placeEntry) || em.files.includes(evidenceEntry)) throw new Error(`${s.id}: manifest collision`);
  pm.files.push(placeEntry); em.files.push(evidenceEntry);
  report.push(`- ${s.name}: PASS — ${finder.sourceObjectId}; category \`by\`.`);
}
write(PM, pm); em.files.sort(); write(EM, em);
fs.writeFileSync(P(REPORT), `${report.join('\n')}\n`);

let protocol = fs.readFileSync(P(PROTOCOL), 'utf8');
for (const s of specs) if (protocol.includes(`\`${s.id}\``)) throw new Error(`${s.id} already in protocol`);
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((m) => Number(m[1]));
const firstBatch = (batches.length ? Math.max(...batches) : 0) + 1;
const assigned = found.map((x, i) => ({ ...x, batch: firstBatch + i }));
const tableEnd = protocol.indexOf('\n\nRelevante korrigerende merger');
if (tableEnd < 0) throw new Error('Protocol table end missing');
const protocolRows = assigned.map(({ s, finder, batch }) => `| ${batch} | \`${s.id}\` | ${s.name} | verified | \`${finder.sourceObjectId}\` |`).join('\n');
protocol = `${protocol.slice(0, tableEnd)}\n${protocolRows}${protocol.slice(tableEnd)}`;
const note = `Oslo West-kirkepakken (${verifiedAt}) legger til \`fagerborg_kirke\`, \`uranienborg_kirke\` og \`frogner_kirke\` som tre separate canonical \`by\`-steder etter aktiv duplikatkontroll og normative adresse-først-oppslag. De bruker eksisterende kirkemodell og ekskluderer \`nature\` for å beholde de åtte prioriterte PlaceCard-rundingene.`;
const migration = protocol.indexOf('\nDuplikatmigrering');
if (migration < 0) throw new Error('Protocol migration section missing');
protocol = `${protocol.slice(0, migration)}\n\n${note}${protocol.slice(migration)}`;
const oslo = protocol.indexOf('## Oslo');
const unresolved = protocol.indexOf('### Dokumenterte Oslo-kontroller uten godkjent koordinat');
const etne = protocol.indexOf('\n## Etne', unresolved);
const verifiedCount = (protocol.slice(oslo, unresolved).match(/^\|\s*\d+\s*\|/gm) || []).length;
const unresolvedCount = protocol.slice(unresolved, etne > unresolved ? etne : protocol.length).split('\n').filter((line) => line.startsWith('| ') && !line.startsWith('|---') && !line.startsWith('| kandidat')).length;
protocol = protocol.replace(/^Oslo-tabellen inneholder nå .*$/m, `Oslo-tabellen inneholder nå ${verifiedCount} verifiserte eller kildekontrollerte canonical steder. Oslo West-kirkepakken legger til Fagerborg kirke, Uranienborg kirke og Frogner kirke med normative bygningsadressepunkter. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${unresolvedCount}.`);
protocol = protocol.replace(/^Disse kontrollene er fullført, men teller ikke blant de \d+ verifiserte eller kildekontrollerte canonical Oslo-stedene\.$/m, `Disse kontrollene er fullført, men teller ikke blant de ${verifiedCount} verifiserte eller kildekontrollerte canonical Oslo-stedene.`);
fs.writeFileSync(P(PROTOCOL), protocol);
console.log(JSON.stringify({ ok: true, places: assigned.map(({ s, finder, c, batch }) => ({ id: s.id, batch, sourceObjectId: finder.sourceObjectId, lat: c.lat, lon: c.lon })), verifiedCount, unresolvedCount }, null, 2));
