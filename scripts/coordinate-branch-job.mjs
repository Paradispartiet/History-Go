import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const placeId = "christian_radich";
const name = "Christian Radich";
const placeManifestEntry = "places/historie/oslo/places_historie/christian_radich.json";
const placeFile = path.join("data", placeManifestEntry);
const evidenceManifestEntry = "oslo/historie/christian_radich.json";
const evidenceFile = path.join("data", "coordinate-evidence", evidenceManifestEntry);
const intakePath = "reports/oslo-attractions-completeness-20260720/christian-radich-home-berth/result.json";
const decisionPath = "reports/oslo-attractions-completeness-20260720/christian-radich-home-berth/decision.json";
const taxonomyPath = "reports/oslo-attractions-completeness-20260720/christian-radich-home-berth/taxonomy.md";

if (existsSync(placeFile) || existsSync(evidenceFile)) {
  throw new Error("Christian Radich canonical production already exists; refusing duplicate write.");
}
if (!existsSync(intakePath) || !existsSync(decisionPath) || !existsSync(taxonomyPath)) {
  throw new Error("Merged Christian Radich intake/taxonomy inputs are missing.");
}

const intake = JSON.parse(readFileSync(intakePath, "utf8"));
const decision = JSON.parse(readFileSync(decisionPath, "utf8"));
if (
  intake?.status !== "verified_candidate" ||
  intake?.sourceObjectId !== "geonorge-adresser-v1:0301:10077:9" ||
  Number(intake?.coordinate?.lat) !== 59.90805979135746 ||
  Number(intake?.coordinate?.lon) !== 10.733834060566368 ||
  decision?.productionGate !== "coordinate_ready_taxonomy_pending"
) {
  throw new Error("Merged Christian Radich production inputs do not match the locked home-berth decision.");
}

const c = intake.coordinate;
const coordNote =
  "Offisiell adressekoordinat fra Geonorge Adresser API for Skur 32, Akershusstranda 9, OSLO. Punktet brukes som stabil display- og unlock-marker for Christian Radichs dokumenterte hjemmebase ved Akershusutstikkeren. Oslo Havn identifiserer Akershusutstikkeren som skipets hjemmehavn, og VisitOSLO opplyser at skuta ligger der når den ikke er på oppdrag. Punktet er ikke live-sporing og innebærer ikke at fartøyet alltid fysisk ligger ved kaia.";

const place = {
  id: placeId,
  name,
  lat: c.lat,
  lon: c.lon,
  r: 100,
  category: "historie",
  year: 1937,
  desc: "Fullrigger og skoleskip bygget i 1937, bevart gjennom aktiv drift og knyttet til Akershusutstikkeren som dokumentert hjemmehavn når skipet er i Oslo.",
  popupDesc:
    "Christian Radich ble bygget ved Framnæs Mekaniske Værksted i 1937 som det fjerde skoleskipet i en Oslo-basert tradisjon for praktisk sjømannsopplæring. Som tremastet fullrigger videreførte skuta en opplæringsform der sjømannskap, ansvar, samarbeid og disiplin ble lært gjennom faktisk liv og arbeid om bord.\n\nSkipet er ikke bevart som et statisk museumsobjekt. Stiftelsen Christian Radich har som formål å bevare fartøyet for framtidige generasjoner gjennom aktiv drift, først og fremst som skoleskip, men også gjennom seiltokt og andre maritime oppdrag. Dermed er selve bruken en del av kulturminnevernet: rigg, skrog, kunnskap og sjømannspraksis holdes levende fordi skipet fortsatt seiler.\n\nI Oslo er Akershusutstikkeren den dokumenterte hjemmehavna. Christian Radich har hatt fast plass der siden 1994, og ligger normalt der når skuta er i Oslo og ikke er ute på oppdrag. History Go-markøren ligger derfor ved Skur 32, Akershusstranda 9, som stabil hjemmebase. Markøren er ikke live-sporing: skipet kan være på tokt, charter, vedlikehold eller verftsopphold når spilleren besøker stedet. `akershus_kaier` fortsetter å representere det bredere kaianlegget; denne recorden representerer selve det historiske fartøyet og dets varige Oslo-tilknytning.",
  emne_ids: [
    "em_his_spor_materialitet",
    "em_his_kulturminner_bevaring",
    "em_his_samtid_ettertid_fortelling"
  ],
  quiz_profile: {
    place_type: "historisk_fartoy",
    subtype: "aktiv_fullrigger_skoleskip_med_dokumentert_hjemmehavn",
    signature_features: [
      "bygget ved Framnæs Mekaniske Værksted i 1937",
      "tremastet fullrigger bygget som skoleskip",
      "bevares gjennom fortsatt aktiv drift og opplæring",
      "Akershusutstikkeren er dokumentert Oslo-hjemmehavn",
      "fast plass ved hjemmehavna siden 1994"
    ],
    primary_angles: [
      "maritim_historie",
      "skoleskip_og_opplaering",
      "seilskipsteknologi_og_materialitet",
      "levende_kulturarv",
      "bevaring_gjennom_aktiv_drift",
      "oslo_havn_og_hjemmehavn"
    ],
    question_families: [
      "fartoyshistorie",
      "maritim_opplaering",
      "materialitet_og_teknologi",
      "kulturminnevern",
      "bruk_og_endring",
      "kontrast"
    ],
    avoid_angles: [
      "generisk_turistcruise",
      "late_som_skipet_alltid_ligger_ved_markoren",
      "bruke_markoren_som_live_ais_posisjon",
      "blande_skipet_med_det_bredere_akershuskaiene_stedet",
      "redusere_historien_til_dagens_chartertilbud"
    ],
    must_include: [
      "byggingen i 1937 og skoleskiptradisjonen",
      "bevaring gjennom aktiv drift",
      "Akershusutstikkeren som dokumentert hjemmehavn",
      "at hjemmebase-markoren ikke garanterer fysisk tilstedevaerelse"
    ],
    contrast_targets: [
      "norsk_maritimt_museum",
      "frammuseet",
      "akershus_kaier"
    ],
    notes:
      "Spør Christian Radich som levende maritim kulturarv og historisk fartøy. Hjemmebase-markøren er stabil stedsrepresentasjon, ikke live-sporing. Eksterne fartøys-, havne- og institusjonskilder skal drive synlig quizinnhold."
  },
  locatorType: "poi",
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
  mobility: {
    type: "mobile_vessel",
    anchorSemantics: "documented_home_berth",
    homeBerth: "Akershusutstikkeren",
    homeBaseAddress: "Skur 32, Akershusstranda 9, 0150 Oslo",
    livePosition: false,
    presenceGuaranteed: false,
    note:
      "Markøren viser Christian Radichs dokumenterte faste Oslo-base og normalfortøyning når fartøyet er i Oslo. Skipet kan være borte på seilas, oppdrag, vedlikehold eller verftsopphold."
  },
  externalLinks: [
    {
      type: "official",
      label: "Christian Radich – skutas historie",
      url: "https://www.radich.no/blogs/artikler/historien-om-christian-radich",
      lang: "nb",
      verifiedAt: "2026-07-20"
    },
    {
      type: "official",
      label: "Stiftelsen Christian Radich – om oss",
      url: "https://www.radich.no/pages/om-oss-christian-radich",
      lang: "nb",
      verifiedAt: "2026-07-20"
    },
    {
      type: "official",
      label: "Oslo Havn – Christian Radich er endelig hjemme",
      url: "https://www.oslohavn.no/no/aktuelt/christian-radich-har-kommet-hjem/",
      lang: "nb",
      verifiedAt: "2026-07-20"
    },
    {
      type: "official",
      label: "VisitOSLO – Christian Radich",
      url: "https://www.visitoslo.com/no/produkt/?name=Christian-Radich&tlp=2985083",
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
    r: 100,
    coordStatus: "verified",
    coordSource: "geonorge_adresser_v1",
    coordType: "address_point",
    coordNote
  },
  identity: {
    currentName: name,
    resolvedIdentity:
      "Fullriggeren og skoleskipet Christian Radich, representert ved den dokumenterte Oslo-hjemmebasen ved Akershusutstikkeren / Skur 32",
    identityStatus: "resolved",
    identityProblem: "",
    locatorTypeCandidate: "poi",
    requiresSplit: false,
    splitReason: ""
  },
  requiredEvidence: [
    "entydig offisielt adressepunkt for Skur 32, Akershusstranda 9",
    "offisiell dokumentasjon av Akershusutstikkeren som Christian Radichs hjemmehavn",
    "dokumentasjon av normalfortøyning når skipet er i Oslo",
    "eksplisitt skille mellom hjemmebase-markor og live fartoysposisjon",
    "canonical overlap-kontroll mot akershus_kaier"
  ],
  evidence: [
    {
      sourceProvider: "official_address",
      sourceName: "geonorge_adresser_v1",
      sourceUrl: intake.sourceUrl,
      sourceObjectId: intake.sourceObjectId,
      sourceQuality:
        "official_address_plus_official_harbour_home_berth_identity_plus_operator_and_destination_sources",
      finding:
        "Geonorge gir ett tydelig offisielt adressepunkt for Skur 32, Akershusstranda 9. Oslo Havn dokumenterer Akershusutstikkeren som Christian Radichs hjemmehavn og opplyser at skipet har hatt fast plass der siden 1994. VisitOSLO opplyser at skuta ligger ved Akershusutstikkeren når den ikke er på oppdrag. Punktet kan derfor brukes som stabil hjemmebase-markør uten å påstå live fysisk tilstedeværelse.",
      canVerifyCoordinate: true,
      reason: coordNote
    }
  ],
  addressCandidates: [
    {
      address: "Skur 32, Akershusstranda 9 Oslo",
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
    },
    {
      sourceProvider: "official_map",
      sourceObjectId: "oslohavn:omradekart-2026:akershusutstikkeren",
      canApplyToPlace: false,
      role: "home_berth_identity_and_visual_QA"
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
    nextAction:
      "Applied the verified Skur 32 address point as Christian Radich's stable Oslo home-base marker with explicit non-live vessel semantics."
  },
  notes: [
    coordNote,
    "`akershus_kaier` remains the broader linear harbour-infrastructure place and is not a duplicate of the vessel identity.",
    "Akershusutstikkeren is the documented home harbour; the vessel may be away from the marker at any given time."
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
if (protocol.includes("`christian_radich`")) {
  throw new Error("Christian Radich already exists in coordinate protocol.");
}
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
const intro = `Oslo-tabellen inneholder nå ${Number(countMatch[1]) + 1} verifiserte eller kildekontrollerte canonical steder. Batch ${nextBatch} legger til Christian Radich med det entydige Geonorge-adressepunktet for Skur 32, Akershusstranda 9, brukt som dokumentert hjemmebase-markør ved Akershusutstikkeren med eksplisitt ikke-live fartøyssemantikk. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${noCoordCount}.`;
protocol = protocol.replace(
  /Oslo-tabellen inneholder nå \d+ verifiserte eller kildekontrollerte canonical steder\.[^\n]*/,
  intro,
);
const row = `| ${nextBatch} | \`christian_radich\` | Christian Radich | verified | \`${intake.sourceObjectId}\` |`;
const insertAt = protocol.indexOf(marker);
protocol = `${protocol.slice(0, insertAt)}\n${row}${protocol.slice(insertAt)}`;
protocol = `${protocol.trimEnd()}\n\nBatch ${nextBatch} (2026-07-20) produserer \`christian_radich\` som historisk fartøy med dokumentert Oslo-hjemmebase. Den låste address-first-kjøringen ga ett tydelig Geonorge-treff for Skur 32, Akershusstranda 9. Oslo Havn dokumenterer Akershusutstikkeren som Christian Radichs hjemmehavn og fast plass siden 1994, mens VisitOSLO opplyser at skipet ligger der når det ikke er på oppdrag. Markøren bruker standard \`official_address\` / \`address_point\`-kontrakt, men place- og koordinatnotene presiserer at dette er et stabilt hjemmebaseanker og ikke live-sporing eller garanti for fysisk tilstedeværelse. \`akershus_kaier\` forblir det bredere lineære kaianlegget og er ikke en duplikatidentitet.\n`;
writeFileSync(protocolPath, protocol, "utf8");

console.log(`Produced ${placeId} as Oslo coordinate batch ${nextBatch}.`);
console.log(`Place file: ${placeFile}`);
console.log(`Evidence file: ${evidenceFile}`);
