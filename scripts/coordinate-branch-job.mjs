import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const placeId = "central_jam_e_mosque";
const placeManifestEntry = "places/historie/oslo/places_historie/central_jam_e_mosque.json";
const placeFile = path.join("data", placeManifestEntry);
const evidenceManifestEntry = "oslo/historie/central_jam_e_mosque.json";
const evidenceFile = path.join("data", "coordinate-evidence", evidenceManifestEntry);
const intakePath = "reports/visitoslo-oslo-east-audit-20260720/central-jam-e-mosque/result.json";
const decisionPath = "reports/visitoslo-oslo-east-audit-20260720/central-jam-e-mosque/decision.json";

if (existsSync(placeFile) || existsSync(evidenceFile)) {
  throw new Error("Central Jam-e-Mosque production already exists; refusing duplicate write.");
}

const intake = JSON.parse(readFileSync(intakePath, "utf8"));
const decision = JSON.parse(readFileSync(decisionPath, "utf8"));
if (
  intake?.status !== "verified_candidate" ||
  intake?.sourceObjectId !== "geonorge-adresser-v1:0301:18780:28B" ||
  Number(intake?.coordinate?.lat) !== 59.91054574923662 ||
  Number(intake?.coordinate?.lon) !== 10.77400472380195 ||
  decision?.productionGate !== "ready_for_canonical_production"
) {
  throw new Error("Merged Central Jam-e-Mosque production inputs do not match the locked decision.");
}

const c = intake.coordinate;
const coordNote = "Offisiell adressekoordinat fra Geonorge Adresser API for Åkebergveien 28B, OSLO. Punktet brukes som display- og unlock-marker for det formålsbygde moskébygget Central Jam-e-Mosque / World Islamic Mission. Det representerer ikke Åkebergveien som gate eller muslimsk trosliv i Oslo generelt.";

const place = {
  id: placeId,
  name: "Central Jam-e-Mosque",
  lat: c.lat,
  lon: c.lon,
  r: 60,
  category: "historie",
  year: 1995,
  desc: "Formålsbygd moské i Åkebergveien 28B, tatt i bruk i 1994/95 som World Islamic Missions faste menighetshjem og et tydelig fysisk spor etter institusjonaliseringen av muslimsk trosliv i Oslo.",
  popupDesc: "Central Jam-e-Mosque i Åkebergveien 28B er moskébygget til World Islamic Mission. Menigheten ble etablert i Oslo i 1984 og brukte først ulike midlertidige lokaler. Grunnsteinen til dagens bygg ble lagt i 1991, og moskeen var klar til innflytting i 1994/95. Store norske leksikon omtaler den som den første moskeen i Norge som ble bygget som moské fra grunnen av.\n\nBygningen er tegnet av Eigil Wæhle og skiller seg tydelig ut i bybildet med portal, kuppel og to minareter. World Islamic Mission beskriver et bygg på rundt 1260 kvadratmeter over flere nivåer, med plass til omtrent 700 personer. Utsmykningen knytter samtidig Oslo til bredere transnasjonale material- og håndverkstradisjoner gjennom keramiske fliser fra Iran og Spania, kalligrafi, iranske tepper og en lysekrone fra Tyrkia.\n\nI History Go skal stedet brukes som konkret religions-, migrasjons-, arkitektur- og institusjonshistorie. Det interessante er overgangen fra en menighet som brukte tilpassede lokaler til et synlig, formålsbygd religiøst bygg i byen. Recorden representerer denne konkrete moskeen og World Islamic Missions fysiske hjem i Åkebergveien, ikke islam eller muslimske miljøer i Oslo generelt.",
  emne_ids: [
    "em_his_tilhorighet_ekskludering",
    "em_his_historiske_lag_i_byrom",
    "em_his_spor_materialitet",
    "em_his_sosialhistorie_hverdagsliv"
  ],
  quiz_profile: {
    place_type: "religiost_institusjonsbygg",
    subtype: "formalbygget_moske_og_menighetshjem",
    signature_features: [
      "World Islamic Mission etablerte menigheten i Oslo i 1984",
      "grunnsteinen til dagens moské ble lagt i 1991",
      "bygget ble tatt i bruk i 1994/95",
      "formålsbygd moské med kuppel og to minareter",
      "utsmykning med fliser, kalligrafi, tepper og materialer med internasjonale forbindelser"
    ],
    primary_angles: [
      "religionshistorie",
      "migrasjon_og_institusjonsbygging",
      "arkitektur_og_synlighet_i_byrommet",
      "tilhorighet_og_representasjon",
      "materialitet_og_utsmykning"
    ],
    question_families: [
      "institusjonshistorie",
      "arkitekturhistorie",
      "historisk_endring",
      "materialitet",
      "tilhorighet",
      "kontrast"
    ],
    avoid_angles: [
      "generisk_islamquiz_uten_stedlig_kilde",
      "behandle_en_menighet_som_representant_for_alle_muslimer",
      "blande_world_islamic_mission_med_andre_moskeer",
      "dagsaktuelle_bonnetider_og_serviceinformasjon"
    ],
    must_include: [
      "overgangen fra midlertidige lokaler til formålsbygd moské",
      "byggets rolle som fysisk menighets- og institusjonshjem",
      "arkitektonisk synlighet i Åkebergveien",
      "stedsspesifikk avgrensning til Central Jam-e-Mosque"
    ],
    contrast_targets: [
      "st_hallvard_kirke_kloster",
      "gronland_kirke",
      "oslo_domkirke"
    ],
    notes: "Spør stedet som konkret religions-, migrasjons- og arkitekturhistorie. Unngå generaliseringer om islam eller muslimske miljøer som ikke er forankret i kilder om denne menigheten og bygningen."
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
      label: "World Islamic Mission – moskeen",
      url: "https://wim.no/en/about-wim/the-mosque/",
      lang: "en",
      verifiedAt: "2026-07-20"
    },
    {
      type: "official",
      label: "World Islamic Mission – kontakt og adresse",
      url: "https://wim.no/en/contact-us/",
      lang: "en",
      verifiedAt: "2026-07-20"
    },
    {
      type: "reference",
      label: "Store norske leksikon – Central Jam-e-Mosque",
      url: "https://snl.no/Central_Jam-e-Mosque",
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
    r: 60,
    coordStatus: "verified",
    coordSource: "geonorge_adresser_v1",
    coordType: "address_point",
    coordNote
  },
  identity: {
    currentName: "Central Jam-e-Mosque",
    resolvedIdentity: "Det formålsbygde Central Jam-e-Mosque / World Islamic Mission-moskébygget og menighetshjemmet i Åkebergveien 28B",
    identityStatus: "resolved",
    identityProblem: "",
    locatorTypeCandidate: "building",
    requiresSplit: false,
    splitReason: ""
  },
  requiredEvidence: [
    "entydig offisielt adressepunkt for Åkebergveien 28B",
    "offisiell institusjonsidentitet og adresse",
    "dokumentert formålsbygd moskéhistorie",
    "canonical identitets- og nærhetskontroll"
  ],
  evidence: [
    {
      sourceProvider: "official_address",
      sourceName: "geonorge_adresser_v1",
      sourceUrl: intake.sourceUrl,
      sourceObjectId: intake.sourceObjectId,
      sourceQuality: "official_address_plus_official_institution_identity_plus_reference_history",
      finding: "Geonorge gir ett tydelig offisielt adressepunkt for Åkebergveien 28B. World Islamic Mission dokumenterer samme adresse og den formålsbygde moskeens historie. Ingen eksisterende canonical place har samme identitet; nærmeste canonical sted er Botsfengselet 107,7 meter unna og representerer en annen bygning og institusjon.",
      canVerifyCoordinate: true,
      reason: coordNote
    }
  ],
  addressCandidates: [
    {
      address: "Åkebergveien 28B Oslo",
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
    nextAction: "Applied the exact Åkebergveien 28B Geonorge point to the canonical Central Jam-e-Mosque place after identity and overlap review."
  },
  notes: [
    coordNote,
    "Ingen canonical identitetsduplikat ble funnet i dagens runtime-indeks."
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
if (protocol.includes("`central_jam_e_mosque`")) {
  throw new Error("Central Jam-e-Mosque already exists in coordinate protocol.");
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
const intro = `Oslo-tabellen inneholder nå ${Number(countMatch[1]) + 1} verifiserte eller kildekontrollerte canonical steder. Batch ${nextBatch} legger til Central Jam-e-Mosque med det entydige Geonorge-adressepunktet for Åkebergveien 28B og dokumentert identitet som formålsbygd World Islamic Mission-moské. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${noCoordCount}.`;
protocol = protocol.replace(/Oslo-tabellen inneholder nå \d+ verifiserte eller kildekontrollerte canonical steder\.[^\n]*/, intro);
const row = `| ${nextBatch} | \`central_jam_e_mosque\` | Central Jam-e-Mosque | verified | \`${intake.sourceObjectId}\` |`;
const insertAt = protocol.indexOf(marker);
protocol = `${protocol.slice(0, insertAt)}\n${row}${protocol.slice(insertAt)}`;
protocol = `${protocol.trimEnd()}\n\nBatch ${nextBatch} (2026-07-20) produserer \`central_jam_e_mosque\` som eget historisk religions- og institusjonssted. Den låste address-first-kjøringen ga ett tydelig Geonorge-treff for Åkebergveien 28B. World Islamic Mission dokumenterer samme adresse og den formålsbygde moskeens historie; canonical overlap-audit fant ingen identitetsduplikat, og nærmeste canonical sted er en annen bygning mer enn 100 meter unna.\n`;
writeFileSync(protocolPath, protocol, "utf8");

console.log(`Produced ${placeId} as Oslo coordinate batch ${nextBatch}.`);
console.log(`Place file: ${placeFile}`);
console.log(`Evidence file: ${evidenceFile}`);
