import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const DATE = "2026-07-21";
const placeId = "holmenkollen_skimuseum";
const intakePath = "reports/visitoslo-holmenkollen-audit-20260721/skimuseum-coordinate-intake-final.json";
const intake = JSON.parse(readFileSync(intakePath, "utf8"));

if (intake?.placeId !== placeId || intake?.status !== "ready_for_canonical_production") {
  throw new Error("Merged Skimuseet coordinate intake is not production-ready.");
}

const indexRaw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const currentPlaces = Array.isArray(indexRaw) ? indexRaw : indexRaw.places ?? [];
const duplicate = currentPlaces.find((place) => place.id === placeId || ["skimuseet i holmenkollen", "holmenkollen ski museum", "skimuseet"].includes(String(place.name ?? "").toLowerCase()));
if (duplicate) throw new Error(`Canonical Ski Museum identity already exists: ${duplicate.id}`);
const parent = currentPlaces.find((place) => place.id === "holmenkollen_nasjonalanlegg");
if (!parent) throw new Error("Expected parent place holmenkollen_nasjonalanlegg is missing.");

const c = intake.coordinate;
if (
  c?.sourceObjectId !== "geonorge-adresser-v1:0301:13850:5" ||
  Number(c?.lat) !== 59.96263248232449 ||
  Number(c?.lon) !== 10.666289172703161
) {
  throw new Error("Merged Skimuseet coordinate does not match the locked Kongeveien 5 decision.");
}

const placeManifestEntry = "places/historie/oslo/places_historie/holmenkollen_skimuseum.json";
const placeFile = path.join("data", placeManifestEntry);
const evidenceManifestEntry = "oslo/historie/holmenkollen_skimuseum.json";
const evidenceFile = path.join("data", "coordinate-evidence", evidenceManifestEntry);
if (existsSync(placeFile) || existsSync(evidenceFile)) throw new Error("Skimuseet output already exists; refusing duplicate write.");

const coordNote = c.coordNote;
const place = {
  id: placeId,
  name: "Skimuseet i Holmenkollen",
  lat: c.lat,
  lon: c.lon,
  r: 55,
  category: "historie",
  year: 1923,
  desc: "Skihistorisk museum etablert i 1923 og lokalisert i Holmenkollen siden 1951, med samlinger som formidler flere tusen år med skihistorie, norsk vinterkultur og polarhistorie.",
  popupDesc: "Skimuseet ble etablert i 1923 som et spesialmuseum for ski og skihistorie. Siden 1951 har museet ligget i Holmenkollen, inne i det større ski- og arenaanlegget. Her blir ski behandlet som mer enn konkurranseutstyr: samlingene viser hvordan skien har vært transportmiddel, arbeidsredskap, fritidskultur og nasjonalt symbol, og museet knytter også skihistorien til norske polarekspedisjoner.\n\nMuseet er fysisk en del av Holmenkollen-komplekset, men har en egen institusjonell identitet, egne samlinger og et eget formidlingsoppdrag. Derfor er `holmenkollen_skimuseum` en egen History Go-place, mens `holmenkollen_nasjonalanlegg` fortsatt representerer den bredere hoppbakken, arenaen og sportsinfrastrukturen. VisitOSLO selger museum og hopptårn som ett besøksprodukt, men den kommersielle pakkingen skal ikke skape et ekstra hopptårn-place.\n\nMuseet og utstillingene ble omfattende fornyet før gjenåpningen i 2023. I History Go skal stedet brukes til å undersøke hvordan gjenstander, utstillinger og museumsinstitusjoner bygger fortellinger om sport, teknologi, nasjonal identitet og fortid. Spørsmål skal forankres i museets dokumenterte historie og samlinger, ikke i generisk skitrivia.",
  emne_ids: [
    "em_his_spor_materialitet",
    "em_his_samtid_ettertid_fortelling",
    "em_his_kulturminner_bevaring",
    "em_his_historiske_lag_i_byrom"
  ],
  quiz_profile: {
    place_type: "museum",
    subtype: "skihistorisk_museum_i_nasjonalanlegg",
    signature_features: [
      "etablert som skimuseum i 1923",
      "lokalisert i Holmenkollen siden 1951",
      "samlinger som kobler skihistorie, vinterkultur og polarhistorie",
      "egen museumsinstitusjon inne i et større nasjonalt skianlegg",
      "omfattende fornyede utstillinger åpnet igjen i 2023"
    ],
    primary_angles: [
      "sportshistorie",
      "museumshistorie",
      "materiell_kultur_og_utstyr",
      "ski_som_transport_arbeid_og_idrett",
      "nasjonal_vinterkultur",
      "polarhistorie_som_museumslag",
      "museum_og_historiefortelling"
    ],
    question_families: [
      "institusjonshistorie",
      "gjenstander_og_materialitet",
      "historisk_endring",
      "museum_og_fortelling",
      "sport_og_samfunn",
      "kontrast"
    ],
    avoid_angles: [
      "behandle_museet_og_hopptarnet_som_samme_canonical_identitet",
      "generisk_skitrivia_uten_museumsforankring",
      "hevde_at_alle_utstilte_gjenstander_horer_til_holmenkollen-konkurranser",
      "lage_egen_place_for_hopptarnet_fra_det_bundlete_visitoslo-produktet"
    ],
    must_include: [
      "grunnleggelsen i 1923",
      "plasseringen i Holmenkollen siden 1951",
      "museets egen institusjonelle identitet inne i nasjonalanlegget",
      "samlingene som materiell inngang til ski- og vinterhistorie"
    ],
    contrast_targets: [
      "holmenkollen_nasjonalanlegg",
      "norges_skiforbund",
      "frammuseet"
    ],
    notes: "Spør museet som historisk institusjon og samlingssted. Eksterne museums-, lokalhistoriske og institusjonelle kilder skal dominere synlig quizinnhold; canonical emner brukes som faglig styring."
  },
  locatorType: c.locatorType,
  sourceProvider: c.sourceProvider,
  sourceObjectId: c.sourceObjectId,
  address: c.address,
  geocodeAccuracy: c.geocodeAccuracy,
  coordRole: c.coordRole,
  coordStatus: c.coordStatus,
  coordSource: c.coordSource,
  coordSourceId: c.coordSourceId,
  coordSourceUrl: c.coordSourceUrl,
  coordType: c.coordType,
  coordVerifiedAt: DATE,
  coordNote,
  externalLinks: [
    {
      type: "official",
      label: "Holmenkollen – Skimuseet",
      url: "https://holmenkollen.com/en/",
      lang: "en",
      verifiedAt: DATE
    },
    {
      type: "reference",
      label: "VisitOSLO – Holmenkollen Ski Museum & Tower",
      url: "https://www.visitoslo.com/en/product/?tlp=2992333",
      lang: "en",
      verifiedAt: DATE
    },
    {
      type: "reference",
      label: "Store norske leksikon – Skimuseet i Holmenkollen",
      url: "https://snl.no/Skimuseet_i_Holmenkollen",
      lang: "nb",
      verifiedAt: DATE
    }
  ]
};

const alternate = intake.alternateAddressCrosscheck;
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
    coordStatus: c.coordStatus,
    coordSource: c.coordSource,
    coordType: c.coordType,
    coordNote
  },
  identity: {
    currentName: "Skimuseet i Holmenkollen",
    resolvedIdentity: "Skimuseet som egen persistent museumsinstitusjon og besøksidentitet inne i Holmenkollen nasjonalanlegg",
    identityStatus: "resolved",
    identityProblem: "",
    locatorTypeCandidate: "building",
    requiresSplit: false,
    splitReason: ""
  },
  requiredEvidence: [
    "nåværende besøksadresse for museet",
    "uavhengig adressekonfliktkontroll mellom Kongeveien 5 og Kongeveien 40",
    "dokumentert museumsidentitet og institusjonshistorie",
    "eksplisitt parent-overlap-audit mot holmenkollen_nasjonalanlegg",
    "canonical identitetskontroll mot current main"
  ],
  evidence: [
    {
      sourceProvider: "official_address",
      sourceName: "Geonorge Adresser API v1 – Kongeveien 5",
      sourceUrl: c.coordSourceUrl,
      sourceObjectId: c.sourceObjectId,
      sourceQuality: "official_address_selected_from_current_visitor_sources",
      finding: "Kongeveien 5 er valgt som canonical museumsmarkør etter at dagens visitor-facing VisitOSLO- og Holmenkollen/Skiforeningen-kilder ble veid mot en motstridende Kongeveien 40-henvisning.",
      canVerifyCoordinate: true,
      reason: coordNote
    },
    {
      sourceProvider: "official_address",
      sourceName: "Geonorge Adresser API v1 – Kongeveien 40",
      sourceUrl: "https://ws.geonorge.no/adresser/v1/sok?sok=Kongeveien%2040%20Oslo",
      sourceObjectId: alternate.sourceObjectId,
      sourceQuality: "official_address_alternate_access_crosscheck",
      finding: `Kongeveien 40 er dokumentert i en Skiforeningen-veibeskrivelse, men ligger ${alternate.distanceFromSelectedM} meter fra valgt museumsanker og brukes ikke som canonical coordinate.`,
      canVerifyCoordinate: false,
      reason: "Dokumentert alternativ adkomst-/anleggsadresse; beholdes som kryssjekk uten å overstyre den nåværende visitor-facing museumsadressen."
    },
    {
      sourceProvider: "manual_research",
      sourceName: "VisitOSLO / Holmenkollen / Skiforeningen – current museum identity",
      sourceUrl: "https://www.visitoslo.com/en/product/?tlp=2992333",
      sourceObjectId: "visitoslo:2992333",
      sourceQuality: "current_institution_identity_and_visitor_location",
      finding: "Skimuseet er en vedvarende museumsinstitusjon med egen samling og besøksidentitet inne i Holmenkollen-komplekset; den kombinerte museum-og-tårn-billetten skaper ikke en ny hopptårn-identitet.",
      canVerifyCoordinate: false,
      reason: "Identitets-, scope- og visitor-location-kryssjekk."
    }
  ],
  addressCandidates: [
    {
      address: "Kongeveien 5, 0787 Oslo",
      sourceProvider: "official_address",
      sourceObjectId: c.sourceObjectId,
      canApplyToPlace: true
    },
    {
      address: "Kongeveien 40, 0787 Oslo",
      sourceProvider: "official_address",
      sourceObjectId: alternate.sourceObjectId,
      canApplyToPlace: false
    }
  ],
  sourceObjectCandidates: [
    { sourceProvider: "official_address", sourceObjectId: c.sourceObjectId, canApplyToPlace: true },
    { sourceProvider: "official_address", sourceObjectId: alternate.sourceObjectId, canApplyToPlace: false },
    { sourceProvider: "manual_research", sourceObjectId: "visitoslo:2992333", canApplyToPlace: false }
  ],
  geometryCandidates: [],
  coordinateCandidates: [
    { lat: c.lat, lon: c.lon, coordRole: "display_marker", sourceObjectId: c.sourceObjectId, canApplyToPlace: true },
    { lat: alternate.lat, lon: alternate.lon, coordRole: "alternate_access_crosscheck", sourceObjectId: alternate.sourceObjectId, canApplyToPlace: false }
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: "",
    nextAction: "Kongeveien 5 Geonorge-punktet er anvendt på canonical museum-place; Kongeveien 40 beholdes som ikke-anvendt alternativ adressekryssjekk."
  },
  notes: [
    coordNote,
    `Parent-overlap mot holmenkollen_nasjonalanlegg er eksplisitt vurdert som forventet parent/child-overlap. Selected point distance to current parent anchor: ${intake.parentOverlapAudit.selectedAddressDistanceToParentM} m.`,
    "Place-id og museumsidentitet var fraværende i current runtime index umiddelbart før produksjon."
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
if (protocol.includes(`\`${placeId}\``)) throw new Error(`${placeId} already exists in coordinate protocol.`);
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|\s*`[^`]+`/gm)].map((match) => Number(match[1]));
if (!batches.length) throw new Error("Could not parse existing Oslo coordinate batches.");
const nextBatch = Math.max(...batches) + 1;
const countMatch = protocol.match(/Oslo-tabellen inneholder nå (\d+) [^\n]*canonical steder\./);
if (!countMatch) throw new Error("Could not parse Oslo protocol place count.");
const newCount = Number(countMatch[1]) + 1;
protocol = protocol.replace(
  /Oslo-tabellen inneholder nå \d+ [^\n]*canonical steder\./,
  `Oslo-tabellen inneholder nå ${newCount} dokumenterte verifiserte eller kildekontrollerte canonical steder. Batch ${nextBatch} legger til Skimuseet i Holmenkollen som egen museumsinstitusjon inne i det bredere Holmenkollen nasjonalanlegg, med Kongeveien 5 som låst visitor-facing museumsanker.`
);
protocol = `${protocol.trimEnd()}\n\n| ${nextBatch} | \`${placeId}\` | Skimuseet i Holmenkollen | verified | \`${c.sourceObjectId}\` |\n\nBatch ${nextBatch} (${DATE}) produserer \`${placeId}\` som egen museumsidentitet. Kongeveien 5 er valgt etter den lukkede adressekonflikt-auditen; Kongeveien 40 ligger 231,8 meter unna og beholdes som alternativ adkomst-/anleggsadresse i coordinate evidence. Fysisk nærhet til \`holmenkollen_nasjonalanlegg\` er forventet parent/child-overlap og skaper ikke et nytt hopptårn-place.\n`;
writeFileSync(protocolPath, protocol, "utf8");

writeJson("reports/visitoslo-holmenkollen-audit-20260721/skimuseum-production.json", {
  version: DATE,
  batch: nextBatch,
  placeId,
  placeManifestEntry,
  evidenceManifestEntry,
  coordinateSourceObjectId: c.sourceObjectId,
  alternateAddressSourceObjectId: alternate.sourceObjectId,
  parentPlaceId: "holmenkollen_nasjonalanlegg",
  sourceCoordinateIntake: intakePath
});

console.log(`Produced ${placeId} as Oslo coordinate batch ${nextBatch}.`);
console.log(`Place file: ${placeFile}`);
console.log(`Evidence file: ${evidenceFile}`);
