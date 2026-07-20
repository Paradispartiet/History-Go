import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const ID = 'holmlia_bad';
const QUERY = 'Holmlia senter vei 34 Oslo';
const PLACE = 'data/places/sport/europa/norway/oslo_sport/holmlia_bad.json';
const PLACE_ENTRY = 'places/sport/europa/norway/oslo_sport/holmlia_bad.json';
const EVIDENCE = 'data/coordinate-evidence/oslo/sport/holmlia_bad.json';
const EVIDENCE_ENTRY = 'oslo/sport/holmlia_bad.json';
const REPORT = 'reports/oslo-attractions-completeness-20260720/holmlia-bad/decision.json';
const PLACE_MANIFEST = 'data/places/manifest.json';
const EVIDENCE_MANIFEST = 'data/coordinate-evidence/manifest.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';

const abs = (p) => path.join(ROOT, p);
const read = (p) => JSON.parse(fs.readFileSync(abs(p), 'utf8'));
const write = (p, value) => {
  fs.mkdirSync(path.dirname(abs(p)), { recursive: true });
  fs.writeFileSync(abs(p), `${JSON.stringify(value, null, 2)}\n`);
};
const rows = (data) => Array.isArray(data) ? data : Array.isArray(data?.places) ? data.places : Array.isArray(data?.items) ? data.items : data?.id ? [data] : [];

for (const entry of read(PLACE_MANIFEST).files || []) {
  const file = `data/${entry}`;
  if (!fs.existsSync(abs(file))) continue;
  if (rows(read(file)).some((row) => row?.id === ID)) throw new Error(`${ID}: active place already exists in ${file}`);
}
if (fs.existsSync(abs(PLACE)) || fs.existsSync(abs(EVIDENCE))) throw new Error(`${ID}: target files already exist`);

const output = execFileSync('npm', ['run', 'places:coords:find:address', '--', '--address', QUERY], {
  cwd: ROOT,
  encoding: 'utf8',
  maxBuffer: 10 * 1024 * 1024
});
process.stdout.write(output);
const start = output.indexOf('{');
const end = output.lastIndexOf('}');
if (start < 0 || end < start) throw new Error('Address finder returned no JSON object');
const result = JSON.parse(output.slice(start, end + 1));
if (!result.ok || result.status !== 'verified_candidate' || !result.coordinate) throw new Error(`Unexpected finder result: ${result.status}`);
const c = result.coordinate;

const place = {
  id: ID,
  name: 'Holmlia bad',
  lat: c.lat,
  lon: c.lon,
  r: c.r,
  category: 'sport',
  sport_type: 'swimming',
  place_type: 'public_swimming_pool',
  year: 1983,
  desc: 'Kommunal svømmehall på Holmlia, ferdigstilt i 1983 som del av et fjellanlegg der idrettsfunksjoner ble kombinert med tilfluktsrom. Badet har et 25-metersbasseng og fungerer som lokalt anlegg for svømming, opplæring og hverdagsaktivitet i Oslo sør.',
  popupDesc: 'Holmlia bad stod klart i 1983, i en periode da utbyggingen av Holmlia også omfattet store offentlige idrettsanlegg. Svømmehallen ble sprengt inn i fjellet som del av et anlegg der idrettshall, svømmehall og tilfluktsrom kunne kombineres. Denne kalde krig-konstruksjonen gir stedet en uvanlig fysisk identitet sammenlignet med Oslos mer tradisjonelle folkebad.\n\nI dag drives Holmlia bad av Oslo kommune og har et 25-meters hovedbasseng, plaskebasseng, badstue og tilrettelegging for personer med funksjonsnedsettelser. I History Go behandles stedet som et lokalt offentlig idretts- og svømmeanlegg. Midlertidige sommerstenginger er driftsinformasjon og skal ikke tolkes som permanent nedleggelse.',
  emne_ids: ['em_sport_arena_samling', 'em_sport_idrettsarena_sted', 'em_sport_breddeidrett'],
  quiz_profile: {
    place_type: 'svommehall_i_fjellanlegg',
    subtype: 'kommunalt_lokalbad_med_tilfluktsromshistorie',
    signature_features: ['svømmehall ferdigstilt i 1983', 'sprengt inn i fjellet som del av kombinert idretts- og tilfluktsromanlegg', '25-metersbasseng som lokalt offentlig bad for Oslo sør'],
    primary_angles: ['svomming', 'breddeidrett', 'svommeopplaring', 'offentlig_idrettsinfrastruktur', 'kald_krig_og_bygging'],
    question_families: ['historisk_endring', 'idrettsanlegg', 'bruk', 'teknisk_fysisk', 'kontrast'],
    avoid_angles: ['generisk_svommehall', 'behandle_sommerstenging_som_permanent_nedleggelse', 'anta_at_fjellanlegget_bare_er_et_tilfluktsrom'],
    must_include: ['1983 som ferdigstillelsesår', 'kombinasjonen av svømmehall og tilfluktsrom i fjellet', 'rollen som lokalt offentlig svømme- og opplæringsanlegg'],
    contrast_targets: ['toyenbadet', 'manglerudhallen', 'frognerbadet'],
    notes: 'Skill mellom varig stedsidentitet og sesongbaserte åpningstider.'
  },
  sport_profile: {
    place_type: 'public_swimming_pool',
    sports: ['swimming'],
    clubs_or_teams: [],
    groundhopper_type: 'public_swimming_pool',
    stats_focus: ['apningsar', 'bassenglengde', 'svommeopplaring', 'tilgjengelighet', 'fjellanlegg'],
    collection_hooks: ['svommehall_besokt', 'offentlig_idrettsanlegg_besokt'],
    venue_kind: 'public_swimming_pool',
    groundhopper_relevant: false
  },
  rounds_exclude: ['nature', 'training'],
  locatorType: c.locatorType,
  sourceProvider: c.sourceProvider,
  sourceObjectId: c.sourceObjectId,
  address: c.address,
  geocodeAccuracy: c.geocodeAccuracy,
  coordRole: c.coordRole,
  coordStatus: c.coordStatus,
  coordSource: c.coordSource,
  coordSourceId: c.sourceObjectId,
  coordSourceUrl: result.sourceUrl,
  coordType: c.coordType,
  coordVerifiedAt: '2026-07-20',
  coordNote: 'Offisiell adressekoordinat fra Geonorge Adresser API for Holmlia Senter vei 34, OSLO. Punktet representerer dagens offentlige svømmehall og brukes som display- og unlock-marker. Fjell- og tilfluktsromshistorien er et fysisk og historisk lag ved samme sted, ikke en separat markør.',
  externalLinks: [
    { type: 'official', label: 'Oslo kommune – Holmlia bad', url: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/svommehaller-i-oslo/holmlia-bad/', lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'Dagsavisen – Holmlia bad og fjellanleggets historie', url: 'https://www.dagsavisen.no/oslo/nyheter/2020/01/07/apnet-holmlia-bad-etter-sju-maneders-rehabilitering/', lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'VisitOSLO – bad og svømmehaller i Oslo', url: 'https://www.visitoslo.com/no/aktiviteter-og-attraksjoner/aktiviteter/bad/', lang: 'nb', verifiedAt: '2026-07-20' }
  ]
};
write(PLACE, place);

write(EVIDENCE, {
  placeId: ID,
  placeFile: PLACE,
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: { lat: c.lat, lon: c.lon, r: c.r, coordStatus: c.coordStatus, coordSource: c.coordSource, coordType: c.coordType, coordNote: place.coordNote },
  identity: { currentName: 'Holmlia bad', resolvedIdentity: 'The municipal public swimming pool at Holmlia Senter vei 34, physically integrated into the Holmlia rock/civil-defence complex but represented as the public bath rather than the whole underground facility', identityStatus: 'resolved', identityProblem: '', locatorTypeCandidate: 'building', requiresSplit: false, splitReason: '' },
  requiredEvidence: ['entydig offisielt adressepunkt for dagens svømmehall', 'kommunal dokumentasjon av besøksadressen og aktiv badfunksjon', 'historisk kilde for 1983 og fjellanleggets kombinerte funksjon'],
  evidence: [{ sourceProvider: 'official_address', sourceName: 'geonorge_adresser_v1', sourceUrl: result.sourceUrl, sourceObjectId: result.sourceObjectId, sourceQuality: 'official_address_plus_municipal_visitor_identity', finding: 'Geonorge gir et eksakt adressetreff for Holmlia Senter vei 34. Oslo kommune oppgir samme adresse for Holmlia bad; historisk kilde dokumenterer at svømmehallen stod klar i 1983 som del av et fjellanlegg med idretts- og tilfluktsromsfunksjon.', canVerifyCoordinate: true, reason: place.coordNote }],
  addressCandidates: [{ address: QUERY, sourceProvider: 'official_address', sourceObjectId: result.sourceObjectId, canApplyToPlace: true }],
  sourceObjectCandidates: [{ sourceProvider: 'official_address', sourceObjectId: result.sourceObjectId, canApplyToPlace: true }],
  geometryCandidates: [],
  coordinateCandidates: [{ lat: c.lat, lon: c.lon, coordRole: c.coordRole, canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Use the exact Holmlia Senter vei 34 address point as the canonical display marker; keep the wider underground complex as contextual history.' },
  notes: [place.coordNote]
});

write(REPORT, {
  version: '2026-07-20',
  placeId: ID,
  duplicateGate: 'no active canonical Holmlia bad place or address match found before production',
  category: 'sport',
  representationDecision: 'One canonical public-swimming-pool marker at Holmlia Senter vei 34; the underground civil-defence complex remains physical and historical context.',
  addressQuery: QUERY,
  finderStatus: result.status,
  sourceObjectId: result.sourceObjectId,
  coordinate: c
});

const pm = read(PLACE_MANIFEST);
if (pm.files.includes(PLACE_ENTRY)) throw new Error(`${PLACE_ENTRY}: already in place manifest`);
pm.files.push(PLACE_ENTRY);
write(PLACE_MANIFEST, pm);
const em = read(EVIDENCE_MANIFEST);
if (em.files.includes(EVIDENCE_ENTRY)) throw new Error(`${EVIDENCE_ENTRY}: already in evidence manifest`);
em.files.push(EVIDENCE_ENTRY);
em.files.sort();
write(EVIDENCE_MANIFEST, em);

let protocol = fs.readFileSync(abs(PROTOCOL), 'utf8');
const summary = protocol.match(/Oslo-tabellen inneholder nå (\d+) verifiserte eller kildekontrollerte canonical steder\.[^\n]*/);
if (!summary) throw new Error('Could not find Oslo controlled-place summary');
const oldCount = Number(summary[1]);
const newCount = oldCount + 1;
const unresolved = protocol.match(/Antallet fullførte kontroller uten godkjent Oslo-koordinat er (\d+)\./);
if (!unresolved) throw new Error('Could not parse unresolved count');
const unresolvedCount = Number(unresolved[1]);
const tableMarker = '\n\nRelevante korrigerende merger for de første Oslo-batchene:';
const tableEnd = protocol.indexOf(tableMarker);
if (tableEnd < 0) throw new Error('Could not find Oslo table end');
const batchNos = [...protocol.slice(0, tableEnd).matchAll(/^\| (\d+) \|/gm)].map((m) => Number(m[1]));
const batchNo = Math.max(...batchNos) + 1;
protocol = protocol.replace(summary[0], `Oslo-tabellen inneholder nå ${newCount} verifiserte eller kildekontrollerte canonical steder. Batch ${batchNo} legger til Holmlia bad som et eget kommunalt svømme- og idrettsanlegg på det verifiserte Holmlia Senter vei 34-punktet. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${unresolvedCount}.`);
protocol = protocol.slice(0, tableEnd) + `\n| ${batchNo} | \`${ID}\` | Holmlia bad | verified | \`${result.sourceObjectId}\` |` + protocol.slice(tableEnd);
const duplicateIndex = protocol.indexOf('\nDuplikatmigrering (');
if (duplicateIndex < 0) throw new Error('Could not find duplicate-migration narrative boundary');
const narrative = `\n\nBatch ${batchNo} (2026-07-20) legger til \`${ID}\` som et eget kommunalt svømme- og idrettsanlegg. Den normative adresse-first-kontrollen gir det entydige Geonorge-punktet \`${result.sourceObjectId}\` for Holmlia Senter vei 34 som dagens bygnings-, display- og unlock-anker. Holmlia bad stod klart i 1983 som del av et fjellanlegg der idrettshall, svømmehall og tilfluktsrom ble kombinert. Den bredere underjordiske infrastrukturen er fysisk og historisk kontekst, ikke en ekstra overlappende markør. Midlertidige sommerstenginger gjelder drift og endrer ikke canonical stedsstatus.`;
protocol = protocol.slice(0, duplicateIndex) + narrative + protocol.slice(duplicateIndex);
protocol = protocol.replace(/Disse kontrollene er fullført, men teller ikke blant de (\d+) verifiserte eller kildekontrollerte canonical Oslo-stedene\./, `Disse kontrollene er fullført, men teller ikke blant de ${newCount} verifiserte eller kildekontrollerte canonical Oslo-stedene.`);
fs.writeFileSync(abs(PROTOCOL), protocol);

console.log(JSON.stringify({ ok: true, placeId: ID, category: place.category, sourceObjectId: result.sourceObjectId, coordinate: { lat: c.lat, lon: c.lon }, verifiedCount: newCount, unresolvedCount, batchNo }, null, 2));
