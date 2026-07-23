import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const DATE = "2026-07-23";
const placeId = "fotogalleriet";
const scopePath = "reports/visitoslo-galleries-audit-20260723/priority-tranche/scope-resolution.json";
const scope = JSON.parse(readFileSync(scopePath, "utf8"));
const decision = scope.approvedInstitutionalCandidates?.find((row) => row.placeId === placeId);
if (!decision || decision.coordinateStatus !== "ready") throw new Error("Fotogalleriet is not coordinate-ready in merged gallery scope.");

const indexRaw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const places = Array.isArray(indexRaw) ? indexRaw : indexRaw.places ?? [];
if (places.some((place) => place.id === placeId || String(place.name ?? "").toLowerCase() === "fotogalleriet")) {
  throw new Error("Fotogalleriet already exists on current main; refusing duplicate production.");
}

const c = decision.coordinate;
if (
  c.sourceObjectId !== "geonorge-adresser-v1:0301:14943:34A" ||
  Number(c.lat) !== 59.917455556790614 ||
  Number(c.lon) !== 10.750260519179827
) throw new Error("Merged Fotogalleriet coordinate does not match the locked Møllergata 34A decision.");

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

const placeManifestEntry = "places/kunst/oslo/places_kunst/fotogalleriet.json";
const placeFile = path.join("data", placeManifestEntry);
const evidenceManifestEntry = "oslo/kunst/fotogalleriet.json";
const evidenceFile = path.join("data", "coordinate-evidence", evidenceManifestEntry);
if (existsSync(placeFile) || existsSync(evidenceFile)) throw new Error("Fotogalleriet output already exists.");

const coordNote = "Offisiell Geonorge-adressekoordinat for Møllergata 34A, valgt blant Møllergata 34A–D ved hjelp av Fotogalleriets egen besøksides konkrete kartlenke som disambigueringsbevis. Kartlenkens koordinat brukes ikke som canonical kilde; den identifiserer bare hvilket offisielt Geonorge-adresseobjekt institusjonens egen kartlenke peker klart nærmest på.";

const place = {
  id: placeId,
  name: "Fotogalleriet",
  lat: c.lat,
  lon: c.lon,
  r: 55,
  category: "kunst",
  year: 1977,
  desc: "Ikke-kommersiell kunstinstitusjon etablert i 1977 med fotografi, kamerabasert kunst og visuell kultur som sitt sentrale felt, med offentlig visningssted i Møllergata 34 i Oslo.",
  popupDesc: "Fotogalleriet ble etablert i 1977 og har utviklet seg som en uavhengig, ikke-kommersiell institusjon for fotografi, kamerabasert kunst og bredere visuell kultur. Institusjonen har vært viktig i utviklingen av fotografiet som kunstfelt i Norge, samtidig som programmet over tid har utvidet perspektivet mot samtidens teknologiske, sosiale og politiske bildepraksiser.\n\nI History Go behandles Fotogalleriet som én varig kunstinstitusjon, ikke som en samling skiftende utstillinger. Det sentrale er hvordan institusjonen gjør fotografi og kamerabaserte medier til et sted for offentlig diskusjon, kuratering og kunstnerisk produksjon. Midlertidige utstillinger skal derfor brukes som kilder og innholdslag, ikke som egne place-markører.\n\nDen publiserte besøksadressen er Møllergata 34 uten bokstav. Geonorge har fire separate offisielle adresseobjekter 34A–D. Fotogalleriets egen kartlenke peker 0,4 meter fra Geonorge-punktet for 34A og 17,7 meter nærmere dette enn nest nærmeste adresseobjekt. Derfor brukes Møllergata 34A som stabil display-marker, mens institusjonens egen publiserte besøksadresse fortsatt omtales som Møllergata 34.",
  emne_ids: [
    "em_kunst_institusjonskritikk_og_representasjon",
    "em_kunst_kvalitet_kritikk_og_symbolsk_kapital"
  ],
  quiz_profile: {
    place_type: "kunstinstitusjon",
    subtype: "ikke_kommersiell_fotografi_og_kamerabasert_kunstinstitusjon",
    signature_features: [
      "etablert i 1977",
      "uavhengig og ikke-kommersiell kunstinstitusjon",
      "fotografi, kamerabasert kunst og visuell kultur som hovedfelt",
      "offentlig visningssted i Møllergata 34"
    ],
    primary_angles: [
      "institusjonshistorie",
      "fotografi_som_kunstfelt",
      "kamerabaserte_medier",
      "kuratering_og_representasjon",
      "kunstinstitusjon_og_offentlighet"
    ],
    question_families: [
      "institusjonshistorie",
      "medium_og_praksis",
      "representasjon",
      "historisk_endring",
      "kontrast"
    ],
    avoid_angles: [
      "generisk_fotografihistorie_uten_stedlig_forankring",
      "behandle_midlertidige_utstillinger_som_egne_places",
      "forveksle_fotogalleriet_med_fotografiens_hus",
      "bruke_google_maps_som_canonical_koordinatkilde"
    ],
    must_include: [
      "grunnleggelsen i 1977",
      "institusjonens ikke-kommersielle rolle",
      "fotografi og kamerabasert kunst som sentralt felt",
      "forskjellen fra Fotografiens Hus som egen institusjon"
    ],
    contrast_targets: [
      "fotografiens_hus",
      "kunstnerforbundet",
      "kunsthall_oslo"
    ],
    notes: "Spør Fotogalleriet som konkret kunstinstitusjon. Offisielle institusjons-, arkiv- og utstillingskilder skal dominere synlig quizinnhold; canonical emner brukes som faglig styring."
  },
  locatorType: "building",
  sourceProvider: "official_address",
  sourceObjectId: c.sourceObjectId,
  address: {
    street: "Møllergata",
    number: "34A",
    postcode: "0179",
    city: "Oslo",
    country: "NO"
  },
  geocodeAccuracy: "rooftop",
  coordRole: "display_marker",
  coordStatus: "verified",
  coordSource: "geonorge_adresser_v1",
  coordSourceId: c.sourceObjectId,
  coordSourceUrl: "https://ws.geonorge.no/adresser/v1/sok?sok=M%C3%B8llergata%2034%200179%20Oslo",
  coordType: "address_point",
  coordVerifiedAt: DATE,
  coordNote,
  externalLinks: [
    {
      type: "official",
      label: "Fotogalleriet – besøk",
      url: "https://fotogalleriet.no/visit/",
      lang: "en",
      verifiedAt: DATE
    },
    {
      type: "official",
      label: "Fotogalleriet – om institusjonen",
      url: "https://fotogalleriet.no/about/",
      lang: "en",
      verifiedAt: DATE
    }
  ]
};

const evidence = {
  schemaVersion: "1.0",
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
    currentName: "Fotogalleriet",
    resolvedIdentity: "Fotogalleriet som egen ikke-kommersiell kunstinstitusjon for fotografi, kamerabasert kunst og visuell kultur i Møllergata 34",
    identityStatus: "resolved",
    identityProblem: "",
    locatorTypeCandidate: "building",
    requiresSplit: false,
    splitReason: ""
  },
  requiredEvidence: [
    "nåværende institusjonsidentitet og besøksadresse",
    "offisiell Geonorge-adresseklynge for Møllergata 34A–D",
    "institusjonens egen kartlenke som disambigueringsbevis",
    "current-main duplicate gate immediately before production"
  ],
  evidence: [
    {
      sourceProvider: "official_address",
      sourceName: "Geonorge Adresser API v1 – Møllergata 34A",
      sourceUrl: "https://ws.geonorge.no/adresser/v1/sok?sok=M%C3%B8llergata%2034%200179%20Oslo",
      sourceObjectId: c.sourceObjectId,
      sourceQuality: "official_address_disambiguated_by_institution_map_link",
      finding: "Møllergata 34A er det offisielle Geonorge-adresseobjektet som Fotogalleriets egen kartlenke peker entydig nærmest på.",
      canVerifyCoordinate: true,
      reason: coordNote
    },
    {
      sourceProvider: "manual_research",
      sourceName: "Fotogalleriet – official visit and institution pages",
      sourceUrl: "https://fotogalleriet.no/visit/",
      sourceObjectId: "fotogalleriet:official",
      sourceQuality: "official_institution_identity_and_disambiguation",
      finding: "Institusjonen publiserer Møllergata 34 som besøksadresse og lenker til et konkret kartpunkt; kartpunktet brukes bare til å velge blant offisielle Geonorge 34A–D-objekter.",
      canVerifyCoordinate: false,
      reason: "Identitets- og adresse-disambigueringskryssjekk."
    }
  ],
  addressCandidates: [
    {
      address: "Møllergata 34A, 0179 Oslo",
      sourceProvider: "official_address",
      sourceObjectId: c.sourceObjectId,
      canApplyToPlace: true
    }
  ],
  sourceObjectCandidates: [
    { sourceProvider: "official_address", sourceObjectId: c.sourceObjectId, canApplyToPlace: true },
    { sourceProvider: "manual_research", sourceObjectId: "fotogalleriet:official", canApplyToPlace: false }
  ],
  geometryCandidates: [],
  coordinateCandidates: [
    { lat: c.lat, lon: c.lon, coordRole: "display_marker", sourceObjectId: c.sourceObjectId, canApplyToPlace: true }
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: "",
    nextAction: "Møllergata 34A Geonorge-punktet er anvendt som canonical display-marker."
  },
  notes: [
    coordNote,
    "Fotogalleriets egen kartlenke ble kun brukt til disambiguering; canonical koordinatkilde er Geonorge.",
    "Merged gallery scope records no canonical identity match and no canonical place within 35 m of the site address cluster."
  ]
};

writeJson(placeFile, place);
writeJson(evidenceFile, evidence);
appendManifest("data/places/manifest.json", placeManifestEntry);
appendManifest("data/coordinate-evidence/manifest.json", evidenceManifestEntry);

const protocolPath = "docs/coordinates/coordinate-control-protocol.md";
let protocol = readFileSync(protocolPath, "utf8");
if (protocol.includes(`\`${placeId}\``)) throw new Error(`${placeId} already exists in Oslo coordinate protocol.`);
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|\s*`[^`]+`/gm)].map((match) => Number(match[1]));
if (!batches.length) throw new Error("Could not parse current Oslo coordinate batches.");
const nextBatch = Math.max(...batches) + 1;

const currentHeader = /Oslo-protokollen dekker nå (\d+) aktive current `verified\*` canonical Oslo-steder\./;
const legacyHeader = /Oslo-tabellen inneholder nå (\d+) [^\n]*canonical steder\./;
const countMatch = protocol.match(currentHeader) ?? protocol.match(legacyHeader);
if (!countMatch) throw new Error("Could not parse current Oslo protocol place count.");
const newCount = Number(countMatch[1]) + 1;
if (currentHeader.test(protocol)) {
  protocol = protocol.replace(currentHeader, `Oslo-protokollen dekker nå ${newCount} aktive current \`verified*\` canonical Oslo-steder.`);
} else {
  protocol = protocol.replace(legacyHeader, `Oslo-tabellen inneholder nå ${newCount} dokumenterte verifiserte eller kildekontrollerte canonical steder.`);
}
protocol = `${protocol.trimEnd()}\n\n| ${nextBatch} | \`${placeId}\` | Fotogalleriet | verified | \`${c.sourceObjectId}\` |\n\nBatch ${nextBatch} (${DATE}) produserer \`${placeId}\` etter den lukkede VisitOSLO gallery-priority scope-auditen og den separate Møllergata 34A–D-disambigueringen. Institusjonens egen kartlenke velger 34A blant de offisielle adresseobjektene; Geonorge forblir canonical koordinatkilde.\n`;
writeFileSync(protocolPath, protocol, "utf8");

writeJson("reports/visitoslo-galleries-audit-20260723/priority-tranche/fotogalleriet-production.json", {
  version: DATE,
  placeId,
  batch: nextBatch,
  placeManifestEntry,
  evidenceManifestEntry,
  coordinateSourceObjectId: c.sourceObjectId,
  sourceScopeReport: scopePath,
  disambiguationSourcePr: 3455
});

console.log(`Produced ${placeId} as Oslo coordinate batch ${nextBatch}; count ${Number(countMatch[1])} -> ${newCount}.`);
console.log(`Place file: ${placeFile}`);
console.log(`Evidence file: ${evidenceFile}`);
