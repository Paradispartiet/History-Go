import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const p = (x) => path.join(root, x);
const read = (x) => JSON.parse(fs.readFileSync(p(x), 'utf8'));
const write = (x, v) => { fs.mkdirSync(path.dirname(p(x)), { recursive: true }); fs.writeFileSync(p(x), `${JSON.stringify(v, null, 2)}\n`); };
const rows = (v) => Array.isArray(v) ? v : Array.isArray(v?.places) ? v.places : Array.isArray(v?.items) ? v.items : v?.id ? [v] : [];

const id = 'dronning_sonja_kunststall';
const placeFile = 'data/places/kunst/oslo/places_kunst/dronning_sonja_kunststall.json';
const placeEntry = 'places/kunst/oslo/places_kunst/dronning_sonja_kunststall.json';
const evidenceFile = 'data/coordinate-evidence/oslo/kunst/dronning_sonja_kunststall.json';
const evidenceEntry = 'oslo/kunst/dronning_sonja_kunststall.json';
const placeManifestPath = 'data/places/manifest.json';
const evidenceManifestPath = 'data/coordinate-evidence/manifest.json';
const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';
const verifiedAt = '2026-07-20';

for (const entry of read(placeManifestPath).files || []) {
  const rel = `data/${entry}`;
  if (fs.existsSync(p(rel)) && rows(read(rel)).some((x) => x?.id === id)) throw new Error(`${id} already active in ${rel}`);
}
if (fs.existsSync(p(placeFile)) || fs.existsSync(p(evidenceFile))) throw new Error(`${id} target already exists`);

execFileSync('npm', ['run', 'build:tools'], { stdio: 'inherit' });
const raw = execFileSync('node', ['dist/tools/address-first-coordinate-finder.mjs', '--address', 'Parkveien 50 Oslo'], { encoding: 'utf8' });
const finder = JSON.parse(raw);
if (!finder.ok || finder.status !== 'verified_candidate' || finder.sourceProvider !== 'official_address') throw new Error(raw);
const c = finder.coordinate;
if (c?.address?.street !== 'Parkveien' || String(c?.address?.number) !== '50') throw new Error(`Wrong address result: ${raw}`);

const coordNote = 'Offisiell adressekoordinat fra Geonorge Adresser API for Parkveien 50, OSLO. Punktet brukes som display- og unlock-marker for publikumsinngangen til Dronning Sonja KunstStall i de tidligere kongelige stallene. Stallbygningene skriver seg fra 1848, mens kunst- og kulturarenaen åpnet 4. juli 2017; koordinaten representerer dagens besøkssted og må ikke brukes som om KunstStallen eksisterte som institusjon siden 1848.';
const place = {
  id,
  name: 'Dronning Sonja KunstStall',
  lat: c.lat,
  lon: c.lon,
  r: c.r || 60,
  category: 'kunst',
  year: 2017,
  desc: 'Kunst- og kulturarena i Slottets tidligere staller, åpnet 4. juli 2017. KunstStallen viser skiftende utstillinger med kunst og gjenstander fra De kongelige samlinger, ofte i møte med samtidskunst.',
  popupDesc: 'Dronning Sonja KunstStall åpnet 4. juli 2017, på Dronning Sonjas 80-årsdag, etter at de tidligere kongelige stallene var bygget om til en offentlig arena for kunst, kultur og historie. Stallene dateres til 1848 og var opprinnelig en del av Slottets hestehold; de gamle stallrommene er fortsatt en synlig del av utstillingsarkitekturen.\n\nI dag presenteres permanente og skiftende utstillinger med materiale fra De kongelige samlinger, ofte i dialog med nyere kunst. I History Go behandles stedet som en selvstendig kunstinstitusjon med et tydelig dobbelt tidslag: den kongelige stallhistorien og transformasjonen til offentlig kunstarena i 2017. Stedet er fysisk og institusjonelt tydelig nok til å være separat fra både Slottet og Slottsparken.',
  emne_ids: ['em_kunst_institusjonskritikk_og_representasjon', 'em_kunst_kvalitet_kritikk_og_symbolsk_kapital'],
  quiz_profile: {
    place_type: 'kunstinstitusjon',
    subtype: 'kongelig_stall_transformert_til_offentlig_kunstarena',
    signature_features: ['de tidligere kongelige stallene dateres til 1848', 'åpnet som Dronning Sonja KunstStall 4. juli 2017', 'viser De kongelige samlinger og skiftende kunstutstillinger i bevarte stallrom'],
    primary_angles: ['institusjonshistorie', 'transformasjon_og_ombruk', 'kongelige_samlinger', 'utstillingsarkitektur', 'kunst_og_representasjon'],
    question_families: ['institusjonshistorie', 'arkitektur_og_ombruk', 'samling_og_utstilling', 'for_etter', 'kontrast'],
    avoid_angles: ['generisk_kunstgalleri', 'behandle_kunststallen_som_identisk_med_slottet_eller_slottsparken', 'anta_at_kunstinstitusjonen_har_eksistert_siden_1848', 'bruke_midlertidig_2026_utstilling_som_varig_stedsidentitet'],
    must_include: ['stallbygningenes historiske funksjon', 'åpningen som offentlig KunstStall i 2017', 'rollen som visningssted for De kongelige samlinger og skiftende kunst'],
    contrast_targets: ['kunstnernes_hus', 'nasjonalmuseet', 'vigelandmuseet'],
    notes: 'Spør stedet som offentlig kunstinstitusjon i et historisk kongelig stallanlegg. Skill 1848-bygningens stallhistorie fra KunstStallens institusjonshistorie fra 2017.'
  },
  rounds_exclude: ['nature'],
  related_place_ids: ['slottet', 'slottsparken'],
  locatorType: c.locatorType || 'building',
  sourceProvider: finder.sourceProvider,
  sourceObjectId: finder.sourceObjectId,
  address: c.address,
  geocodeAccuracy: c.geocodeAccuracy,
  coordRole: c.coordRole,
  coordStatus: c.coordStatus,
  coordSource: c.coordSource,
  coordSourceId: finder.sourceObjectId,
  coordSourceUrl: finder.sourceUrl,
  coordType: c.coordType,
  coordVerifiedAt: verifiedAt,
  coordNote,
  externalLinks: [
    { type: 'official', label: 'Kongehuset – Opplev Dronning Sonja KunstStall', url: 'https://www.kongehuset.no/besok-og-kulturtilbud/opplev-dronning-sonja-kunststall', lang: 'nb', verifiedAt },
    { type: 'official', label: 'Kongehuset – KunstStallen er åpen', url: 'https://www.kongehuset.no/nyheter/kunststallen-er-apen', lang: 'nb', verifiedAt },
    { type: 'official', label: 'The Royal Court – Visit Queen Sonja Art Stable', url: 'https://www.royalcourt.no/visits-and-cultural-activities/visit-queen-sonja-art-stable', lang: 'en', verifiedAt }
  ]
};
write(placeFile, place);

write(evidenceFile, {
  placeId: id,
  placeFile,
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: { lat: place.lat, lon: place.lon, r: place.r, coordStatus: place.coordStatus, coordSource: place.coordSource, coordType: place.coordType, coordNote },
  identity: { currentName: place.name, resolvedIdentity: 'Dronning Sonja KunstStall at the public entrance in Parkveien 50, distinct from the Palace and Palace Park while occupying the historic Royal Stables', identityStatus: 'resolved', identityProblem: '', locatorTypeCandidate: place.locatorType, requiresSplit: false, splitReason: 'Distinct public institution and entrance in a specific historic stable building.' },
  requiredEvidence: ['Geonorge address-first result for Parkveien 50', 'Royal Court current visitor address', 'official 4 July 2017 opening', 'distinction between 1848 stable building and 2017 art institution'],
  evidence: [{ sourceProvider: 'official_address', sourceName: 'geonorge_adresser_v1', sourceUrl: finder.sourceUrl, sourceObjectId: finder.sourceObjectId, sourceQuality: 'official_address_plus_royal_court_history', finding: 'Geonorge resolves Parkveien 50 exactly; the Royal Court gives the same public address and documents both the 1848 stables and the 2017 opening of the art venue.', canVerifyCoordinate: true, reason: coordNote }],
  addressCandidates: [{ address: 'Parkveien 50 Oslo', sourceProvider: finder.sourceProvider, sourceObjectId: finder.sourceObjectId, canApplyToPlace: true }],
  sourceObjectCandidates: [{ sourceProvider: finder.sourceProvider, sourceObjectId: finder.sourceObjectId, canApplyToPlace: true }],
  geometryCandidates: [],
  coordinateCandidates: [{ lat: place.lat, lon: place.lon, coordRole: place.coordRole, canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Use the verified Parkveien 50 point for one distinct canonical art venue; keep Slottet and Slottsparken as separate broader places.' },
  notes: [coordNote]
});

const pm = read(placeManifestPath);
if (pm.files.includes(placeEntry)) throw new Error(`${placeEntry} already registered`);
pm.files.push(placeEntry);
write(placeManifestPath, pm);
const em = read(evidenceManifestPath);
if (em.files.includes(evidenceEntry)) throw new Error(`${evidenceEntry} already registered`);
em.files.push(evidenceEntry); em.files.sort(); write(evidenceManifestPath, em);

let protocol = fs.readFileSync(p(protocolPath), 'utf8');
if (protocol.includes('`dronning_sonja_kunststall`')) throw new Error('KunstStall already in protocol');
const tableEnd = protocol.indexOf('\n\nRelevante korrigerende merger');
if (tableEnd < 0) throw new Error('Protocol table end missing');
protocol = `${protocol.slice(0, tableEnd)}\n| 54 | \`dronning_sonja_kunststall\` | Dronning Sonja KunstStall | verified | \`${finder.sourceObjectId}\` |${protocol.slice(tableEnd)}`;
const note = `Batch 54 (2026-07-20) legger til \`dronning_sonja_kunststall\` med det entydige Geonorge-punktet \`${finder.sourceObjectId}\` for Parkveien 50. De kongelige stallene dateres til 1848, mens KunstStallen åpnet som offentlig kunst- og kulturarena 4. juli 2017. Stedet er en egen kunstinstitusjon og ikke en duplikat av \`slottet\` eller \`slottsparken\`.`;
const migration = protocol.indexOf('\nDuplikatmigrering');
if (migration < 0) throw new Error('Protocol migration section missing');
protocol = `${protocol.slice(0, migration)}\n\n${note}${protocol.slice(migration)}`;
const oslo = protocol.indexOf('## Oslo');
const unresolved = protocol.indexOf('### Dokumenterte Oslo-kontroller uten godkjent koordinat');
const etne = protocol.indexOf('\n## Etne', unresolved);
const verifiedCount = (protocol.slice(oslo, unresolved).match(/^\| \d+ \|/gm) || []).length;
const unresolvedCount = protocol.slice(unresolved, etne > unresolved ? etne : protocol.length).split('\n').filter((line) => line.startsWith('| ') && !line.startsWith('|---') && !line.startsWith('| kandidat')).length;
protocol = protocol.replace(/^Oslo-tabellen inneholder nå .*$/m, `Oslo-tabellen inneholder nå ${verifiedCount} verifiserte eller kildekontrollerte canonical steder. Batch 54 legger til Dronning Sonja KunstStall som egen offentlig kunstinstitusjon i de historiske kongelige stallene, med verifisert publikumsadresse i Parkveien 50. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${unresolvedCount}.`);
protocol = protocol.replace(/^Disse kontrollene er fullført, men teller ikke blant de \d+ verifiserte eller kildekontrollerte canonical Oslo-stedene\.$/m, `Disse kontrollene er fullført, men teller ikke blant de ${verifiedCount} verifiserte eller kildekontrollerte canonical Oslo-stedene.`);
fs.writeFileSync(p(protocolPath), protocol);
console.log(JSON.stringify({ ok: true, placeId: id, sourceObjectId: finder.sourceObjectId, coordinate: { lat: place.lat, lon: place.lon }, verifiedCount, unresolvedCount }, null, 2));
