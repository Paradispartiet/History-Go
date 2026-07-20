import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const ID = 'skimore_oslo';
const QUERY = 'Tryvannsveien 64 Oslo';
const PLACE = 'data/places/sport/europa/norway/oslo_sport/skimore_oslo.json';
const PLACE_ENTRY = 'places/sport/europa/norway/oslo_sport/skimore_oslo.json';
const EVIDENCE = 'data/coordinate-evidence/oslo/sport/skimore_oslo.json';
const EVIDENCE_ENTRY = 'oslo/sport/skimore_oslo.json';
const REPORT = 'reports/oslo-attractions-completeness-20260720/skimore-oslo/decision.json';
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

const coordNote = 'Offisiell adressekoordinat fra Geonorge Adresser API for Tryvannsveien 64, OSLO. Punktet representerer hovedadressen og publikumsankeret for Skimore Oslo og brukes som display- og unlock-marker. Det skal ikke tolkes som geometrisk sentrum for alle alpinbakker, heiser eller klatreparkløyper i det større Tryvann-anlegget.';
const place = {
  id: ID,
  name: 'Skimore Oslo',
  lat: c.lat,
  lon: c.lon,
  r: c.r,
  category: 'sport',
  sport_type: 'alpine_and_climbing',
  place_type: 'year_round_activity_resort',
  year: 2012,
  desc: 'Året-rundt aktivitetsanlegg på Tryvann med alpin- og snowboardbakker om vinteren og en stor klatrepark om sommeren. Klatreparken ble bygget i 2012, mens dagens Skimore-organisering samler sommer- og vintertilbudet under én besøksidentitet.',
  popupDesc: 'Skimore Oslo på Tryvann er et stort aktivitetsanlegg som skifter karakter med årstidene. Om vinteren brukes området til alpint, snowboard, skiskole og terrengpark. Om sommeren er klatreparken hovedattraksjonen, med løyper og zipliner mellom trærne. Den offisielle besøksadressen er Tryvannsveien 64.\n\nKlatreparken ble bygget sammen med Høyt & Lavt i 2012. Dagens Skimore AS ble etablert i 2018, men vintersporten på Tryvann har eldre røtter enn både klatreparken og dagens selskapsnavn. History Go behandler derfor Skimore Oslo som ett fysisk og institusjonelt besøkssted med flere sesonglag, ikke som separate overlappende markører for Oslo Sommerpark og Oslo Vinterpark. Adressepunktet er publikumsankeret ved hovedanlegget; selve skiområdet og klatreparken dekker et større landskap rundt dette punktet.',
  emne_ids: ['em_sport_breddeidrett', 'em_sport_idrettsarena_sted', 'em_sport_idrettsgeografi'],
  quiz_profile: {
    place_type: 'helars_aktivitetsanlegg',
    subtype: 'alpinsenter_og_klatrepark_pa_samme_tryvannsanlegg',
    signature_features: ['alpin- og snowboardanlegg på Tryvann om vinteren', 'klatrepark bygget i 2012 og brukt som sommeranlegg', 'samme publikumsadresse og anleggsidentitet gjennom ulike sesonger'],
    primary_angles: ['alpint', 'snowboard', 'klatring', 'sesongbruk', 'idrettsgeografi'],
    question_families: ['bruk_og_sesong', 'idrettsanlegg', 'teknisk_fysisk', 'institusjonshistorie', 'kontrast'],
    avoid_angles: ['lage_separate_markorer_for_sommerpark_og_vinterpark', 'behandle_adressepunktet_som_senter_for_alle_bakker_og_loyper', 'generisk_kommersiell_aktivitetspark'],
    must_include: ['at sommer- og vintertilbudet er lag ved samme anlegg', 'klatreparken fra 2012', 'Tryvannsveien 64 som publikumsadresse og ikke full områdegeometri'],
    contrast_targets: ['holmenkollen_nasjonalanlegg', 'korketrekkeren', 'oslo_klatrepark'],
    notes: 'Spørsmål skal skille dagens Skimore-merkevare fra anleggets eldre vintersportshistorie og unngå å gjøre sommer- og vinterdriften til to fysiske steder.'
  },
  sport_profile: {
    place_type: 'year_round_activity_resort',
    sports: ['alpine_skiing', 'snowboarding', 'climbing'],
    clubs_or_teams: [],
    groundhopper_type: 'activity_resort',
    stats_focus: ['nedfarter', 'heiser', 'klatreloyper', 'sesongbruk', 'etableringsar_klatrepark'],
    collection_hooks: ['skianlegg_besokt', 'klatrepark_besokt', 'helars_idrettsanlegg_besokt'],
    venue_kind: 'year_round_activity_resort',
    groundhopper_relevant: false
  },
  rounds_exclude: ['nature'],
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
  coordNote,
  externalLinks: [
    { type: 'official', label: 'Skimore Oslo', url: 'https://oslo.skimore.no/', lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'official', label: 'Skimore Oslo – klatreparken', url: 'https://oslo.skimore.no/klatreparken', lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'VisitOSLO – Skimore Oslo Sommerpark', url: 'https://www.visitoslo.com/no/produkt/?name=Skimore-Oslo--Sommerpark&tlp=2996673', lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'VisitOSLO – Skimore Oslo', url: 'https://www.visitoslo.com/no/produkt/?name=Skimore-Oslo&tlp=2977763', lang: 'nb', verifiedAt: '2026-07-20' }
  ]
};
write(PLACE, place);

write(EVIDENCE, {
  placeId: ID,
  placeFile: PLACE,
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: { lat: c.lat, lon: c.lon, r: c.r, coordStatus: c.coordStatus, coordSource: c.coordSource, coordType: c.coordType, coordNote },
  identity: {
    currentName: 'Skimore Oslo',
    resolvedIdentity: 'The year-round Skimore Oslo visitor and activity complex anchored at Tryvannsveien 64, combining the winter alpine resort and summer climbing park under one physical visitor identity',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'building',
    requiresSplit: false,
    splitReason: 'The summer and winter products share the same official visitor address and current facility identity; separate canonical markers would overlap the same host site.'
  },
  requiredEvidence: ['entydig offisielt adressepunkt for hovedadressen', 'offisiell dokumentasjon av både sommer- og vinterdrift', 'eksplisitt representasjonsregel som skiller publikumsankeret fra hele ski- og klatreområdets geometri'],
  evidence: [{
    sourceProvider: 'official_address',
    sourceName: 'geonorge_adresser_v1',
    sourceUrl: result.sourceUrl,
    sourceObjectId: result.sourceObjectId,
    sourceQuality: 'official_address_plus_operator_and_visit_source_identity',
    finding: 'Geonorge gir det normative adressepunktet for Tryvannsveien 64. Skimore oppgir samme adresse for Oslo-anlegget og dokumenterer både vinterens ski- og snowboardtilbud og sommerens klatrepark. VisitOSLO fører sommer- og vinterproduktene separat, men de representerer sesongbruk av samme anlegg og skal ikke bli to overlappende canonical places.',
    canVerifyCoordinate: true,
    reason: coordNote
  }],
  addressCandidates: [{ address: QUERY, sourceProvider: 'official_address', sourceObjectId: result.sourceObjectId, canApplyToPlace: true }],
  sourceObjectCandidates: [{ sourceProvider: 'official_address', sourceObjectId: result.sourceObjectId, canApplyToPlace: true }],
  geometryCandidates: [],
  coordinateCandidates: [{ lat: c.lat, lon: c.lon, coordRole: c.coordRole, canApplyToPlace: true }],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Use the exact Tryvannsveien 64 address point as the canonical display/unlock anchor for one Skimore Oslo place. Preserve summer and winter as seasonal functional layers; do not infer full resort geometry from the address point.'
  },
  notes: [coordNote]
});

write(REPORT, {
  version: '2026-07-20',
  placeId: ID,
  duplicateGate: 'No active canonical Skimore Oslo, Oslo Sommerpark, Oslo Vinterpark or Tryvannsveien 64 place was found before production.',
  category: 'sport',
  representationDecision: 'One canonical Skimore Oslo place for the shared year-round Tryvann facility. Summer climbing park and winter alpine resort remain seasonal layers, not overlapping markers.',
  addressQuery: QUERY,
  finderStatus: result.status,
  sourceObjectId: result.sourceObjectId,
  coordinate: c,
  sourceFacts: ['Skimore lists Tryvannsveien 64 as the Oslo facility address and currently operates both a climbing park and winter ski resort.', 'Skimore states that the climbing park was built with Høyt & Lavt in 2012.', 'VisitOSLO separately markets Skimore Oslo and Skimore Oslo Sommerpark, but both use the same current facility identity and address.']
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
if (!batchNos.length) throw new Error('Could not parse Oslo batch numbers');
const batchNo = Math.max(...batchNos) + 1;
protocol = protocol.replace(summary[0], `Oslo-tabellen inneholder nå ${newCount} verifiserte eller kildekontrollerte canonical steder. Batch ${batchNo} legger til Skimore Oslo som ett helårs aktivitetsanlegg på Tryvann, med det verifiserte publikumsankeret i Tryvannsveien 64. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${unresolvedCount}.`);
protocol = protocol.slice(0, tableEnd) + `\n| ${batchNo} | \`${ID}\` | Skimore Oslo | verified | \`${result.sourceObjectId}\` |` + protocol.slice(tableEnd);
const duplicateIndex = protocol.indexOf('\nDuplikatmigrering (');
if (duplicateIndex < 0) throw new Error('Could not find duplicate-migration narrative boundary');
const narrative = `\n\nBatch ${batchNo} (2026-07-20) legger til \`${ID}\` som én canonical helårsrepresentasjon av Skimore-anlegget på Tryvann. Den normative adresse-first-kontrollen gir det entydige Geonorge-punktet \`${result.sourceObjectId}\` for Tryvannsveien 64 som publikums-, display- og unlock-anker. Skimore dokumenterer både vinterens alpin-/snowboardanlegg og sommerens klatrepark ved samme anlegg; klatreparken ble bygget i 2012. VisitOSLOs separate sommer- og vinteroppføringer skal derfor ikke bli overlappende place-markører. Adressepunktet representerer hovedankeret og skal ikke leses som full geometri for alle bakker, heiser og klatreparkløyper.`;
protocol = protocol.slice(0, duplicateIndex) + narrative + protocol.slice(duplicateIndex);
protocol = protocol.replace(/Disse kontrollene er fullført, men teller ikke blant de (\d+) verifiserte eller kildekontrollerte canonical Oslo-stedene\./, `Disse kontrollene er fullført, men teller ikke blant de ${newCount} verifiserte eller kildekontrollerte canonical Oslo-stedene.`);
fs.writeFileSync(abs(PROTOCOL), protocol);

console.log(JSON.stringify({ ok: true, placeId: ID, sourceObjectId: result.sourceObjectId, coordinate: { lat: c.lat, lon: c.lon }, verifiedCount: newCount, unresolvedCount, batchNo }, null, 2));
