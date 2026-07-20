import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const placeId = "toyen_hovedgard";
const placeManifestEntry = "places/historie/oslo/places_historie/toyen_hovedgard.json";
const placeFile = path.join("data", placeManifestEntry);
const evidenceManifestEntry = "oslo/historie/toyen_hovedgard.json";
const evidenceFile = path.join("data", "coordinate-evidence", evidenceManifestEntry);
const intakePath = "reports/visitoslo-oslo-east-audit-20260720/toyen-hovedgard/result.json";
const decisionPath = "reports/visitoslo-oslo-east-audit-20260720/toyen-hovedgard/decision.json";

if (existsSync(placeFile) || existsSync(evidenceFile)) {
  throw new Error("Tøyen hovedgård canonical production already exists; refusing duplicate write.");
}

const intake = JSON.parse(readFileSync(intakePath, "utf8"));
const decision = JSON.parse(readFileSync(decisionPath, "utf8"));
if (
  intake?.status !== "verified_candidate" ||
  intake?.sourceObjectId !== "geonorge-adresser-v1:0301:17749:23B" ||
  Number(intake?.coordinate?.lat) !== 59.917956019816764 ||
  Number(intake?.coordinate?.lon) !== 10.770625820146192 ||
  decision?.productionGate !== "ready_for_canonical_production"
) {
  throw new Error("Merged Tøyen hovedgård inputs do not match the locked production decision.");
}

const c = intake.coordinate;
const coordNote = "Offisiell adressekoordinat fra Geonorge Adresser API for Trondheimsveien 23B, OSLO. Punktet brukes som display- og unlock-marker for Tøyen hovedgårds historiske hovedanlegg. Det representerer ikke Botanisk hage, Naturhistorisk museum eller Tøyen som byområde.";

const place = {
  id: placeId,
  name: "Tøyen hovedgård",
  lat: c.lat,
  lon: c.lon,
  r: 70,
  category: "historie",
  year: 1721,
  desc: "Fredet hovedgårdsanlegg inne i Botanisk hage, dokumentert med hovedbygning fra tidlig 1700-tall og med en historie som binder sammen eldre storgård, universitetets overtakelse i 1812 og etableringen av Botanisk hage.",
  popupDesc: "Tøyen hovedgård er eldre enn både Botanisk hage og Naturhistorisk museum som institusjoner på stedet. Gården har røtter langt tilbake i Tøyens historie, mens den bevarte hovedbygningen er omtalt i 1721 og delvis står over en eldre kjeller. Gjennom ombygginger, blant annet i 1779, fikk anlegget i hovedtrekk den formen som fortsatt kan leses i dag.\n\nTøyen var en betydelig gårdseiendom før området fikk sin vitenskapelige og offentlige rolle. I 1812 ble eiendommen overført til universitetet, og i tiårene etter ble deler av gårdsjorda utviklet til Botanisk hage. Hovedgården ble dermed liggende igjen som et eldre fysisk historielag inne i et nytt landskap av forskning, samlinger og publikumsinstitusjoner.\n\nI History Go skal Tøyen hovedgård behandles som det konkrete, fredede gårdsanlegget. `botanisk_hage` representerer den større levende hagen, `naturhistorisk_museum` den bredere museumsinstitusjonen og `klimahuset` et separat moderne utstillingsbygg. Hovedgården viser hvordan ett sted kan skifte fra gårds- og eiendomslandskap til universitets- og museumsområde uten at de eldre bygningslagene forsvinner.",
  emne_ids: [
    "em_his_spor_materialitet",
    "em_his_historiske_lag_i_byrom",
    "em_his_kulturminner_bevaring",
    "em_his_samtid_ettertid_fortelling"
  ],
  quiz_profile: {
    place_type: "historisk_hovedgard",
    subtype: "fredet_gardsanlegg_inne_i_vitenskapelig_hage",
    signature_features: [
      "hovedbygningen er dokumentert i 1721 og har eldre bygningslag",
      "anlegget fikk mye av dagens form gjennom 1700-tallet",
      "eiendommen ble overført til universitetet i 1812",
      "Botanisk hage ble senere utviklet på deler av den tidligere gårdsgrunnen",
      "hovedgården er et eget fredet historisk anlegg inne i dagens museumshage"
    ],
    primary_angles: [
      "gardshistorie",
      "historiske_lag",
      "eiendom_og_institusjonsendring",
      "arkitektur_og_materialitet",
      "bevaring",
      "universitet_og_botanisk_hage"
    ],
    question_families: [
      "historisk_endring",
      "bygning_og_materialitet",
      "eier_og_institusjonshistorie",
      "sted_og_landskap",
      "bevaring",
      "kontrast"
    ],
    avoid_angles: [
      "behandle_hovedgarden_som_hele_botanisk_hage",
      "behandle_hovedgarden_som_hele_naturhistorisk_museum",
      "generisk_gardshistorie_uten_toyenforankring",
      "lage_separate_markorer_for_dagens_kafebruk"
    ],
    must_include: [
      "hovedbygningens tidlige 1700-tallslag",
      "universitetets overtakelse i 1812",
      "forholdet mellom den eldre gården og den senere Botaniske hagen",
      "at hovedgården er et eget fysisk historisk sted"
    ],
    contrast_targets: [
      "botanisk_hage",
      "naturhistorisk_museum",
      "klimahuset",
      "frogner_hovedgard"
    ],
    notes: "Spør Tøyen hovedgård som et eldre fysisk og institusjonelt lag inne i dagens vitenskaps- og museumsmiljø. Ikke la parent-stedene Botanisk hage eller Naturhistorisk museum overta hovedgårdens egen historie."
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
      type: "reference",
      label: "Oslo byleksikon – Tøyen gård",
      url: "https://oslobyleksikon.no/side/T%C3%B8yen_g%C3%A5rd",
      lang: "nb",
      verifiedAt: "2026-07-20"
    },
    {
      type: "official",
      label: "VisitOSLO – Tøyen hovedgård",
      url: "https://www.visitoslo.com/no/produkt/?name=Toyen-hovedgard&tlp=2982773",
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
    r: 70,
    coordStatus: "verified",
    coordSource: "geonorge_adresser_v1",
    coordType: "address_point",
    coordNote
  },
  identity: {
    currentName: "Tøyen hovedgård",
    resolvedIdentity: "Det fredede historiske hovedgårdsanlegget Tøyen hovedgård ved Trondheimsveien 23B, fysisk inne i dagens Botanisk hage men historisk eldre enn hagen",
    identityStatus: "resolved",
    identityProblem: "",
    locatorTypeCandidate: "building",
    requiresSplit: false,
    splitReason: ""
  },
  requiredEvidence: [
    "entydig offisielt adressepunkt for Trondheimsveien 23B",
    "dokumentert identitet som historisk hovedgårdsanlegg",
    "eksplisitt fysisk og institusjonelt skille fra Botanisk hage, Naturhistorisk museum og Klimahuset",
    "canonical identitets- og nærhetskontroll"
  ],
  evidence: [
    {
      sourceProvider: "official_address",
      sourceName: "geonorge_adresser_v1",
      sourceUrl: intake.sourceUrl,
      sourceObjectId: intake.sourceObjectId,
      sourceQuality: "official_address_plus_documented_historic_identity_plus_parent_place_overlap_audit",
      finding: "Geonorge gir ett tydelig adressepunkt for Trondheimsveien 23B. Oslo byleksikon dokumenterer Tøyen hovedgård som et eget fredet historisk gårdsanlegg. Ingen canonical identitetsmatch finnes; de nærliggende stedene Naturhistorisk museum, Klimahuset og Botanisk hage representerer bredere eller separate fysiske og institusjonelle skalaer.",
      canVerifyCoordinate: true,
      reason: coordNote
    }
  ],
  addressCandidates: [
    {
      address: "Trondheimsveien 23B Oslo",
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
    nextAction: "Applied the exact Trondheimsveien 23B Geonorge point to Tøyen hovedgård after identity and parent-place overlap review."
  },
  notes: [
    coordNote,
    "Geografisk plassering inne i Botanisk hage er ikke en duplikattilstand; hovedgården er et eget eldre fysisk anlegg."
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
if (protocol.includes("`toyen_hovedgard`")) throw new Error("Tøyen hovedgård already exists in coordinate protocol.");
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
const intro = `Oslo-tabellen inneholder nå ${Number(countMatch[1]) + 1} verifiserte eller kildekontrollerte canonical steder. Batch ${nextBatch} legger til Tøyen hovedgård med det entydige Geonorge-adressepunktet for Trondheimsveien 23B og eksplisitt avgrensning mot Botanisk hage, Naturhistorisk museum og Klimahuset. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${noCoordCount}.`;
protocol = protocol.replace(/Oslo-tabellen inneholder nå \d+ verifiserte eller kildekontrollerte canonical steder\.[^\n]*/, intro);
const row = `| ${nextBatch} | \`toyen_hovedgard\` | Tøyen hovedgård | verified | \`${intake.sourceObjectId}\` |`;
const insertAt = protocol.indexOf(marker);
protocol = `${protocol.slice(0, insertAt)}\n${row}${protocol.slice(insertAt)}`;
protocol = `${protocol.trimEnd()}\n\nBatch ${nextBatch} (2026-07-20) produserer \`toyen_hovedgard\` som eget historisk hovedgårdsanlegg. Den låste address-first-kjøringen ga ett tydelig Geonorge-treff for Trondheimsveien 23B. Hovedgården ligger fysisk inne i Botanisk hage, men er et eldre selvstendig bygg- og gårdsanlegg; \`botanisk_hage\`, \`naturhistorisk_museum\` og \`klimahuset\` beholdes som separate parent-/nabosteder med andre fysiske og institusjonelle skalaer.\n`;
writeFileSync(protocolPath, protocol, "utf8");

console.log(`Produced ${placeId} as Oslo coordinate batch ${nextBatch}.`);
console.log(`Place file: ${placeFile}`);
console.log(`Evidence file: ${evidenceFile}`);
