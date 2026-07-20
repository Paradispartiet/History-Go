// One-shot Oslo attraction coordinate production: batch 53 / EKT.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const P = (rel) => path.join(ROOT, rel);
const read = (rel) => JSON.parse(fs.readFileSync(P(rel), 'utf8'));
const write = (rel, value) => {
  fs.mkdirSync(path.dirname(P(rel)), { recursive: true });
  fs.writeFileSync(P(rel), `${JSON.stringify(value, null, 2)}\n`);
};
const rows = (data) => Array.isArray(data) ? data : Array.isArray(data?.places) ? data.places : Array.isArray(data?.items) ? data.items : typeof data?.id === 'string' ? [data] : [];

const PLACE_ID = 'ekt_rideskole_husdyrpark';
const PLACE_FILE = 'data/places/sport/europa/norway/oslo_sport/ekt_rideskole_husdyrpark.json';
const PLACE_ENTRY = 'places/sport/europa/norway/oslo_sport/ekt_rideskole_husdyrpark.json';
const EVIDENCE_FILE = 'data/coordinate-evidence/oslo/sport/ekt_rideskole_husdyrpark.json';
const EVIDENCE_ENTRY = 'oslo/sport/ekt_rideskole_husdyrpark.json';
const PLACE_MANIFEST = 'data/places/manifest.json';
const EVIDENCE_MANIFEST = 'data/coordinate-evidence/manifest.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const INTAKE_FILE = 'reports/oslo-attractions-completeness-20260720/ekt-rideskole-husdyrpark/decision.json';
const TAXONOMY_REPORT = 'reports/oslo-attractions-completeness-20260720/ekt-rideskole-husdyrpark/taxonomy-decision.md';
const VERIFIED_AT = '2026-07-20';

const activeHits = [];
for (const entry of read(PLACE_MANIFEST).files || []) {
  const rel = `data/${entry}`;
  if (!fs.existsSync(P(rel))) continue;
  if (rows(read(rel)).some((place) => place?.id === PLACE_ID)) activeHits.push(rel);
}
if (activeHits.length) throw new Error(`${PLACE_ID}: already active in ${activeHits.join(', ')}`);
if (fs.existsSync(P(PLACE_FILE)) || fs.existsSync(P(EVIDENCE_FILE))) throw new Error(`${PLACE_ID}: target file already exists`);

const intake = read(INTAKE_FILE);
if (!intake.ok || intake.finderStatus !== 'verified_candidate') throw new Error('EKT intake is not verified_candidate');
if (intake.sourceProvider !== 'official_address' || intake.sourceObjectId !== 'geonorge-adresser-v1:0301:11462:99') throw new Error('Unexpected EKT source identity');
const c = intake.coordinate;
if (c?.address?.street !== 'Ekebergveien' || String(c?.address?.number) !== '99') throw new Error('Unexpected EKT address identity');

fs.writeFileSync(P(TAXONOMY_REPORT), `# EKT Rideskole og Husdyrpark — canonical taxonomy decision\n\nDate: 2026-07-20\n\n## Decision\n\n**Primary category: sport**\n\nEKT is one canonical physical place at Ekebergveien 99. The riding school and petting zoo are integrated uses of the same site and must not become overlapping markers.\n\n## Rationale\n\n- EKT was founded as a riding school in 1954 and the present complex was developed from the 1964 municipal lease.\n- Organized riding instruction and recruitment to equestrian sport are continuous core functions.\n- History Go already models equestrian activity in the sport taxonomy through \`sport_type: equestrian\` and the \`ridning\` underbadge.\n- The petting farm is an important educational and visitor layer, but it is physically integrated with the riding site.\n- \`nature\` is not the primary fit because managed domestic animals are not a natural habitat.\n\n## Representation rule\n\nUse one sport place for the integrated EKT complex. Keep animal care, domestic breeds and public education as secondary content. Do not split the riding school and petting zoo into duplicate places.\n`);
intake.candidateCategory = 'sport';
intake.taxonomyDecision = 'canonical_sport_primary_integrated_petting_farm_layer';
intake.productionGate = 'coordinate_and_taxonomy_ready';
intake.taxonomyRationale = [
  'Riding school is the continuous institutional core from 1954.',
  'Canonical sport taxonomy supports equestrian places and the ridning underbadge.',
  'The petting zoo is an integrated use of the same physical site, not a separate marker.',
  'Managed domestic animals do not make nature the correct primary category.'
];
write(INTAKE_FILE, intake);

const coordNote = 'Offisiell adressekoordinat fra Geonorge Adresser API for Ekebergveien 99, OSLO. Punktet representerer dagens samlede EKT-anlegg med rideskole, ridehall, staller og husdyrpark og brukes som display- og unlock-marker. EKT ble etablert i 1954 ved Jomfrubråtveien 40; dagens Ekebergveien 99-kompleks ble utviklet etter festeavtalen med Oslo kommune i 1964. Koordinaten skal derfor ikke leses som institusjonens opprinnelige 1954-lokasjon.';
const place = {
  id: PLACE_ID,
  name: 'EKT Rideskole og Husdyrpark',
  lat: c.lat,
  lon: c.lon,
  r: c.r || 60,
  category: 'sport',
  sport_type: 'equestrian',
  place_type: 'riding_school_and_petting_farm',
  groundhopper: false,
  year: 1954,
  desc: 'Rideskole og besøksgård på Ekeberg, etablert i 1954. Dagens anlegg i Ekebergveien 99 vokste fram etter en kommunal festeavtale i 1964 og kombinerer organisert rideundervisning, hestesport og nærkontakt med husdyr.',
  popupDesc: 'EKT Rideskole og Husdyrpark ble etablert i 1954 av Edvin Kjell Thorson, først ved hjemmet i Jomfrubråtveien 40. Etter en festeavtale med Oslo kommune i 1964 ble dagens anlegg i Ekebergveien 99 bygget ut med ridehus, staller og husdyrpark. Siden har stedet vært både rideskole, rekrutteringsarena for hestesport og et lavterskel besøkssted der bybarn kan møte husdyr på nært hold.\n\nI History Go behandles hele EKT-komplekset som ett fysisk sportsted. Rideundervisning og hestesport er den primære canonical identiteten, mens husdyrparken, dyreholdet og formidlingen er viktige sekundære lag. Stedet skal ikke splittes i separate markører for rideskole og husdyrpark, og dyrene skal ikke brukes som om de dokumenterer et naturlig habitat på Ekeberg.',
  emne_ids: ['em_sport_breddeidrett', 'em_sport_inkludering_idrett'],
  quiz_profile: {
    place_type: 'rideskole_og_besoksgard',
    subtype: 'urban_rideskole_med_integrert_husdyrpark',
    signature_features: ['rideskole etablert i 1954', 'dagens Ekebergveien 99-anlegg utviklet fra 1964', 'organisert rideundervisning kombinert med offentlig husdyrpark'],
    primary_angles: ['hestesport', 'rideundervisning', 'breddeidrett', 'dyrehold_og_husdyrraser', 'institusjonshistorie'],
    question_families: ['institusjonshistorie', 'hestesport', 'bruk', 'dyrehold', 'for_etter'],
    avoid_angles: ['generisk_dyrepark', 'presentere_husdyrene_som_vilt_habitat', 'splitte_rideskolen_og_husdyrparken_i_to_fysiske_steder', 'anta_at_dagens_adresse_er_opprinnelig_1954_lokasjon'],
    must_include: ['etableringen som rideskole i 1954', 'utbyggingen av dagens Ekebergveien 99-anlegg fra 1964', 'den doble rollen som hestesportsted og offentlig besøksgård'],
    contrast_targets: ['ekebergsletta', 'oslo_reptilpark', 'bogstad_gard'],
    notes: 'Spør som et fysisk rideskole- og hestesportsted med integrert husdyrformidling. Dyrene er husdyr under menneskelig drift, ikke naturlig fauna.'
  },
  sport_profile: {
    place_type: 'riding_school',
    sports: ['equestrian'],
    clubs_or_teams: [],
    groundhopper_type: 'riding_school',
    stats_focus: ['etableringsar', 'dagens_anlegg_fra_1964', 'rideelever', 'ridehall_og_anlegg', 'hestesport_rekruttering'],
    collection_hooks: ['rideskole_besokt', 'hestesportsted_besokt', 'besoksgard_besokt'],
    venue_kind: 'equestrian_training_and_visitor_site',
    groundhopper_relevant: false
  },
  rounds_exclude: ['nature', 'training'],
  underbadge_ids: ['ridning', 'idrettsarenaer'],
  locatorType: c.locatorType || 'building',
  sourceProvider: intake.sourceProvider,
  sourceObjectId: intake.sourceObjectId,
  address: c.address,
  geocodeAccuracy: c.geocodeAccuracy,
  coordRole: c.coordRole,
  coordStatus: c.coordStatus,
  coordSource: c.coordSource,
  coordSourceId: intake.sourceObjectId,
  coordSourceUrl: intake.sourceUrl,
  coordType: c.coordType,
  coordVerifiedAt: VERIFIED_AT,
  coordNote,
  externalLinks: [
    { type: 'official', label: 'EKT Rideskole og Husdyrpark – om oss', url: 'https://www.rideskole.no/om-oss/', lang: 'nb', verifiedAt: VERIFIED_AT },
    { type: 'official', label: 'EKT – prinsipper i rideundervisningen', url: 'https://www.rideskole.no/rideundervisningen-ved-ekt/', lang: 'nb', verifiedAt: VERIFIED_AT },
    { type: 'reference', label: 'VisitOSLO – attraksjoner i Oslo øst', url: 'https://www.visitoslo.com/en/activities-and-attractions/boroughs/oslo-east/attractions/', lang: 'en', verifiedAt: VERIFIED_AT }
  ]
};
write(PLACE_FILE, place);
write(EVIDENCE_FILE, {
  placeId: PLACE_ID,
  placeFile: PLACE_FILE,
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: { lat: place.lat, lon: place.lon, r: place.r, coordStatus: place.coordStatus, coordSource: place.coordSource, coordType: place.coordType, coordNote },
  identity: {
    currentName: place.name,
    resolvedIdentity: 'The integrated EKT Rideskole og Husdyrpark visitor and equestrian complex at Ekebergveien 99, with the original 1954 Jomfrubråtveien location retained as institutional history',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: place.locatorType,
    requiresSplit: false,
    splitReason: 'Riding school, riding hall, stables and petting zoo are integrated uses of the same current EKT complex.'
  },
  requiredEvidence: ['normative Geonorge address-first result for Ekebergveien 99', 'official EKT current visitor address', 'official 1954/1964 institutional history', 'taxonomy decision preventing duplicate riding-school and petting-zoo markers'],
  evidence: [{
    sourceProvider: 'official_address',
    sourceName: 'geonorge_adresser_v1',
    sourceUrl: intake.sourceUrl,
    sourceObjectId: intake.sourceObjectId,
    sourceQuality: 'official_address_plus_documented_institutional_identity_and_taxonomy_audit',
    finding: 'The saved normative address intake resolves Ekebergveien 99 to one exact Geonorge address point. EKT identifies the same address as its current visitor site and documents the institution from 1954 and the present complex from the 1964 municipal lease and construction phase.',
    canVerifyCoordinate: true,
    reason: coordNote
  }],
  addressCandidates: [{ address: intake.addressQuery, sourceProvider: intake.sourceProvider, sourceObjectId: intake.sourceObjectId, canApplyToPlace: true }],
  sourceObjectCandidates: [{ sourceProvider: intake.sourceProvider, sourceObjectId: intake.sourceObjectId, canApplyToPlace: true }],
  geometryCandidates: [],
  coordinateCandidates: [{ lat: place.lat, lon: place.lon, coordRole: place.coordRole, canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Apply the verified Ekebergveien 99 point to one canonical sport record for the integrated EKT complex; retain the 1954 origin as history and do not create a duplicate petting-zoo marker.' },
  notes: [coordNote]
});

const pm = read(PLACE_MANIFEST);
if (pm.files.includes(PLACE_ENTRY)) throw new Error(`${PLACE_ENTRY}: already registered`);
pm.files.push(PLACE_ENTRY);
write(PLACE_MANIFEST, pm);
const em = read(EVIDENCE_MANIFEST);
if (em.files.includes(EVIDENCE_ENTRY)) throw new Error(`${EVIDENCE_ENTRY}: already registered`);
em.files.push(EVIDENCE_ENTRY);
em.files.sort();
write(EVIDENCE_MANIFEST, em);

let protocol = fs.readFileSync(P(PROTOCOL), 'utf8');
if (protocol.includes('| 53 | `ekt_rideskole_husdyrpark` |')) throw new Error('EKT already recorded as batch 53');
const tableEnd = protocol.indexOf('\n\nRelevante korrigerende merger');
if (tableEnd < 0) throw new Error('Oslo coordinate table end not found');
protocol = `${protocol.slice(0, tableEnd)}\n| 53 | \`ekt_rideskole_husdyrpark\` | EKT Rideskole og Husdyrpark | verified | \`${intake.sourceObjectId}\` |${protocol.slice(tableEnd)}`;
const note = `Batch 53 (2026-07-20) produserer \`ekt_rideskole_husdyrpark\` etter separat koordinat- og taxonomy-gate. Det normative adresse-først-intaket ga det eksakte Geonorge-punktet \`${intake.sourceObjectId}\` for Ekebergveien 99. EKT ble etablert som rideskole i 1954 ved Jomfrubråtveien 40, mens dagens ridehus-, stall- og husdyrparkkompleks ble utviklet etter festeavtalen med Oslo kommune i 1964. Canonical primærkategori er sport fordi organisert rideundervisning og hestesport er den kontinuerlige institusjonskjernen; husdyrparken beholdes som et integrert formidlings- og besøkslag på samme fysiske sted, ikke som en overlappende markør.`;
const migration = protocol.indexOf('\nDuplikatmigrering');
if (migration < 0) throw new Error('Duplicate migration section not found');
protocol = `${protocol.slice(0, migration)}\n\n${note}${protocol.slice(migration)}`;
const osloStart = protocol.indexOf('## Oslo');
const unresolvedStart = protocol.indexOf('### Dokumenterte Oslo-kontroller uten godkjent koordinat');
const etneStart = protocol.indexOf('\n## Etne', unresolvedStart);
const verifiedCount = (protocol.slice(osloStart, unresolvedStart).match(/^\| \d+ \|/gm) || []).length;
const unresolvedCount = protocol.slice(unresolvedStart, etneStart > unresolvedStart ? etneStart : protocol.length).split('\n').filter((line) => line.startsWith('| ') && !line.startsWith('|---') && !line.startsWith('| kandidat')).length;
protocol = protocol.replace(/^Oslo-tabellen inneholder nå .*$/m, `Oslo-tabellen inneholder nå ${verifiedCount} verifiserte eller kildekontrollerte canonical steder. Batch 53 legger til EKT Rideskole og Husdyrpark som ett samlet sportsted på det verifiserte Ekebergveien 99-anlegget og beholder husdyrparken som integrert bruk i stedet for en duplikatmarkør. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${unresolvedCount}.`);
protocol = protocol.replace(/^Disse kontrollene er fullført, men teller ikke blant de \d+ verifiserte eller kildekontrollerte canonical Oslo-stedene\.$/m, `Disse kontrollene er fullført, men teller ikke blant de ${verifiedCount} verifiserte eller kildekontrollerte canonical Oslo-stedene.`);
fs.writeFileSync(P(PROTOCOL), protocol);

console.log(JSON.stringify({ ok: true, placeId: PLACE_ID, category: 'sport', sourceObjectId: intake.sourceObjectId, coordinate: { lat: place.lat, lon: place.lon }, verifiedCount, unresolvedCount }, null, 2));
