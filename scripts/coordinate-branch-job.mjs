import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const placeId = "museumsleiligheten_grabein";
const placeManifestEntry = "places/historie/oslo/places_historie/museumsleiligheten_grabein.json";
const placeFile = path.join("data", placeManifestEntry);
const evidenceManifestEntry = "oslo/historie/museumsleiligheten_grabein.json";
const evidenceFile = path.join("data", "coordinate-evidence", evidenceManifestEntry);
const intakePath = "reports/visitoslo-oslo-east-audit-20260720/museumsleiligheten-grabein/result.json";
const decisionPath = "reports/visitoslo-oslo-east-audit-20260720/museumsleiligheten-grabein/decision.json";

if (existsSync(placeFile) || existsSync(evidenceFile)) {
  throw new Error("Museumsleiligheten Gråbein production already exists; refusing duplicate write.");
}

const intake = JSON.parse(readFileSync(intakePath, "utf8"));
const decision = JSON.parse(readFileSync(decisionPath, "utf8"));
if (
  intake?.status !== "verified_candidate" ||
  intake?.sourceObjectId !== "geonorge-adresser-v1:0301:17875:38B" ||
  Number(intake?.coordinate?.lat) !== 59.9149775365696 ||
  Number(intake?.coordinate?.lon) !== 10.769036218785557 ||
  decision?.productionGate !== "ready_for_canonical_production"
) {
  throw new Error("Merged Museumsleiligheten Gråbein inputs do not match the locked production decision.");
}

const c = intake.coordinate;
const coordNote = "Offisiell adressekoordinat fra Geonorge Adresser API for Tøyengata 38B, OSLO. Punktet brukes som display- og unlock-marker for Museumsleiligheten Gråbein, den bevarte museumsleiligheten inne i Gråbein-gården. Punktet representerer ikke hele Gråbein-komplekset eller Tøyen som byområde.";

const place = {
  id: placeId,
  name: "Museumsleiligheten Gråbein",
  lat: c.lat,
  lon: c.lon,
  r: 55,
  category: "historie",
  year: 1888,
  desc: "Bevart museumsleilighet i en av Gråbeingårdene i Tøyengata 38B, brukt til å formidle arbeiderbolig, trangboddhet, svensk arbeidsmigrasjon og hverdagsliv i Oslo rundt 1900.",
  popupDesc: "Museumsleiligheten Gråbein ligger i Tøyengata 38B, i en av de store leiegårdene som ble reist i det tettbygde østkantmiljøet på slutten av 1800-tallet. Oslo byleksikon daterer Gråbein-komplekset til 1888 og beskriver en utbygging med over 200 små leiligheter. Museumsleiligheten er ett konkret, bevart interiør inne i dette større boligkomplekset.\n\nOslo Museum knytter leiligheten til familien Bjørklund, sju personer som hadde flyttet fra Sverige for å arbeide og bodde her fra 1891. Leiligheten består av ett rom og kjøkken. Den gjør derfor store temaer som industrialisering, arbeidsmigrasjon, boligmarked og klasse lesbare gjennom en helt konkret målestokk: hvor mange mennesker som skulle sove, spise, arbeide og leve innenfor noen få rom.\n\nLeiligheten ble restaurert i 1987 og overtatt av Oslo Museum i 1990. I History Go skal stedet behandles som et bevart og formidlet historisk interiør, ikke som om alle møbler nødvendigvis er originale eiendeler fra én bestemt familie. `arbeidermuseet` i Sagveien er et bredere museum for industri- og arbeiderhistorie; Museumsleiligheten Gråbein er den stedfaste bolig- og hverdagshistorien i Tøyengata 38B.",
  emne_ids: [
    "em_his_sosialhistorie_hverdagsliv",
    "em_his_tilhorighet_ekskludering",
    "em_his_spor_materialitet",
    "em_his_samtid_ettertid_fortelling"
  ],
  quiz_profile: {
    place_type: "museumsleilighet",
    subtype: "bevart_arbeiderbolig_og_sosialhistorisk_interior",
    signature_features: [
      "ligger i Tøyengata 38B i Gråbein-komplekset",
      "leiligheten består av ett rom og kjøkken",
      "familien Bjørklund på sju personer bodde her fra 1891",
      "familien hadde flyttet fra Sverige for arbeid",
      "leiligheten ble restaurert i 1987 og overtatt av Oslo Museum i 1990"
    ],
    primary_angles: [
      "arbeiderbolig",
      "trangboddhet_og_boligstandard",
      "svensk_arbeidsmigrasjon",
      "hverdagsliv_og_klasse",
      "materiell_sosialhistorie",
      "museum_og_bevaring"
    ],
    question_families: [
      "hverdagsliv",
      "bolighistorie",
      "migrasjon",
      "materialitet",
      "historisk_endring",
      "kontrast"
    ],
    avoid_angles: [
      "generalisere_en_leilighet_til_alle_arbeiderfamilier",
      "hevde_at_alle_utstilte_gjenstander_var_bjorklundfamiliens",
      "behandle_hele_grabein-komplekset_som_museumsleiligheten",
      "blande_stedet_med_arbeidermuseet_i_sagveien"
    ],
    must_include: [
      "leilighetens konkrete ett_rom_og_kjokken-skala",
      "Bjørklund-familiens dokumenterte bosetting fra 1891",
      "svensk arbeidsmigrasjon som del av stedshistorien",
      "skillet mellom den bevarte leiligheten og det større Gråbein-komplekset"
    ],
    contrast_targets: [
      "arbeidermuseet",
      "toyen_hovedgard",
      "gronland_basarene"
    ],
    notes: "Spør stedet som konkret materiell sosialhistorie. Skill dokumenterte opplysninger om Bjørklund-familien og leiligheten fra museumsgrep og rekonstruert periodeinteriør."
  },
  locatorType: "building",
  sourceProvider: "official_address",
  sourceObjectId: intake.sourceObjectId,
  address: c.address,
  geocodeAccuracy: "rooftop",
  coordRole: "display_marker",
  coordStatus: "verified",
  coordSource: "geonorge_adresser_v1",
  coordSourceId: intake.sourceObjectId,
  coordSourceUrl: intake.sourceUrl,
  coordType: "address_point",
  coordVerifiedAt: "2026-07-20",
  coordNote,
  externalLinks: [
    {
      type: "official",
      label: "Oslo Museum – Museumsleiligheten Gråbein",
      url: "https://www.oslomuseum.no/besok-oss/museumsleiligheten-grabein/",
      lang: "nb",
      verifiedAt: "2026-07-20"
    },
    {
      type: "reference",
      label: "Oslo byleksikon – Tøyengata",
      url: "https://oslobyleksikon.no/side/T%C3%B8yengata",
      lang: "nb",
      verifiedAt: "2026-07-20"
    }
  ]
};

const evidence = {
  placeId,
  placeFile,
  evidenceStatus: "applied_to_place",
  coordinateDecision: "do_not_change_coordinates_yet",
  currentCoordinate: {
    lat: c.lat,
    lon: c.lon,
    r: 55,
    coordStatus: "verified",
    coordSource: "geonorge_adresser_v1",
    coordType: "address_point",
    coordNote
  },
  identity: {
    currentName: "Museumsleiligheten Gråbein",
    resolvedIdentity: "Den bevarte museumsleiligheten og sosialhistoriske besøksarenaen i Tøyengata 38B, inne i Gråbein-komplekset",
    identityStatus: "resolved",
    identityProblem: "",
    locatorTypeCandidate: "building",
    requiresSplit: false,
    splitReason: ""
  },
  requiredEvidence: [
    "presis offisiell adresse for Tøyengata 38B etter tvetydig 38-oppslag",
    "offisiell museumsidentitet",
    "historisk identitet som bevart leilighet inne i et større boligkompleks",
    "canonical identitets- og nærhetskontroll"
  ],
  evidence: [
    {
      sourceProvider: "official_address",
      sourceName: "geonorge_adresser_v1",
      sourceUrl: intake.sourceUrl,
      sourceObjectId: intake.sourceObjectId,
      sourceQuality: "official_address_plus_official_museum_identity_plus_reference_history",
      finding: "Det brede oppslaget Tøyengata 38 ga needs_review. Oslo Museum og Oslo byleksikon identifiserer museumsleiligheten spesifikt i Tøyengata 38B, og den presise Geonorge-kjøringen gir ett tydelig offisielt adressepunkt. Ingen canonical identitetsduplikat finnes.",
      canVerifyCoordinate: true,
      reason: coordNote
    }
  ],
  addressCandidates: [
    {
      address: "Tøyengata 38B Oslo",
      sourceProvider: "official_address",
      sourceObjectId: intake.sourceObjectId,
      canApplyToPlace: true
    }
  ],
  sourceObjectCandidates: [
    {
      sourceProvider: "official_address",
      sourceObjectId: intake.sourceObjectId,
      canApplyToPlace: true
    }
  ],
  geometryCandidates: [],
  coordinateCandidates: [
    {
      lat: c.lat,
      lon: c.lon,
      coordRole: "display_marker",
      canApplyToPlace: true
    }
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: "",
    nextAction: "Applied the exact Tøyengata 38B Geonorge point as the building/display marker for the preserved Museumsleiligheten Gråbein identity."
  },
  notes: [
    coordNote,
    "Stedsidentiteten er den bevarte museumsleiligheten, selv om koordinatankeret er bygningens offisielle adressepunkt."
  ]
};

function writeJson(file, value) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
function appendManifest(file, entry) {
  const manifest = JSON.parse(readFileSync(file, "utf8"));
  if (!Array.isArray(manifest.files)) throw new Error(`${file} has no files array.`);
  if (!manifest.files.includes(entry)) manifest.files.push(entry);
  writeJson(file, manifest);
}

writeJson(placeFile, place);
writeJson(evidenceFile, evidence);
appendManifest("data/places/manifest.json", placeManifestEntry);
appendManifest("data/coordinate-evidence/manifest.json", evidenceManifestEntry);

const protocolPath = "docs/coordinates/coordinate-control-protocol.md";
let protocol = readFileSync(protocolPath, "utf8");
if (protocol.includes("`museumsleiligheten_grabein`")) throw new Error("Museumsleiligheten Gråbein already exists in coordinate protocol.");
const marker = "\n\nRelevante korrigerende merger";
const markerIndex = protocol.indexOf(marker);
if (markerIndex < 0) throw new Error("Could not locate end of Oslo coordinate table.");
const tableSection = protocol.slice(0, markerIndex);
const batches = [...tableSection.matchAll(/^\|\s*(\d+)\s*\|\s*`[^`]+`/gm)].map((m) => Number(m[1]));
const nextBatch = Math.max(...batches) + 1;
const countMatch = protocol.match(/Oslo-tabellen inneholder nå (\d+) verifiserte eller kildekontrollerte canonical steder\./);
if (!countMatch) throw new Error("Could not parse Oslo protocol count.");
const noCoordMatch = protocol.match(/Antallet fullførte kontroller uten godkjent Oslo-koordinat er (\d+)\./);
const noCoordCount = noCoordMatch ? Number(noCoordMatch[1]) : 0;
const intro = `Oslo-tabellen inneholder nå ${Number(countMatch[1]) + 1} verifiserte eller kildekontrollerte canonical steder. Batch ${nextBatch} legger til Museumsleiligheten Gråbein med det entydige Geonorge-adressepunktet for Tøyengata 38B, etter at den bredere adressen Tøyengata 38 korrekt ble avvist som tvetydig. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${noCoordCount}.`;
protocol = protocol.replace(/Oslo-tabellen inneholder nå \d+ verifiserte eller kildekontrollerte canonical steder\.[^\n]*/, intro);
const row = `| ${nextBatch} | \`museumsleiligheten_grabein\` | Museumsleiligheten Gråbein | verified | \`${intake.sourceObjectId}\` |`;
const insertAt = protocol.indexOf(marker);
protocol = `${protocol.slice(0, insertAt)}\n${row}${protocol.slice(insertAt)}`;
protocol = `${protocol.trimEnd()}\n\nBatch ${nextBatch} (2026-07-20) produserer \`museumsleiligheten_grabein\` som eget sosialhistorisk museumssted. Den generelle adressen Tøyengata 38 ga flere uentydige Geonorge-treff, mens Oslo Museum og Oslo byleksikon identifiserer leiligheten i Tøyengata 38B; den presise address-first-kjøringen ga ett tydelig offisielt punkt. Recorden representerer den bevarte museumsleiligheten inne i Gråbein-komplekset, ikke hele leiegårdskomplekset eller Tøyen som område.\n`;
writeFileSync(protocolPath, protocol, "utf8");

console.log(`Produced ${placeId} as Oslo coordinate batch ${nextBatch}.`);
console.log(`Place file: ${placeFile}`);
console.log(`Evidence file: ${evidenceFile}`);
