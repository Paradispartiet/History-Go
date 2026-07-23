import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const DATE = "2026-07-23";
const placeId = "kunstnerforbundet";
const scopePath = "reports/visitoslo-galleries-audit-20260723/priority-tranche/scope-resolution.json";
const scope = JSON.parse(readFileSync(scopePath, "utf8"));
const decision = scope.approvedInstitutionalCandidates?.find((row) => row.placeId === placeId);
if (!decision || decision.coordinateStatus !== "ready") throw new Error("Kunstnerforbundet is not coordinate-ready in merged gallery scope.");

const indexRaw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const places = Array.isArray(indexRaw) ? indexRaw : indexRaw.places ?? [];
if (places.some((place) => place.id === placeId || String(place.name ?? "").toLowerCase() === "kunstnerforbundet")) {
  throw new Error("Kunstnerforbundet already exists on current main; refusing duplicate production.");
}

const c = decision.coordinate;
if (
  c.sourceObjectId !== "geonorge-adresser-v1:0301:13743:3" ||
  Number(c.lat) !== 59.91286247033279 ||
  Number(c.lon) !== 10.735585135946035
) throw new Error("Merged Kunstnerforbundet coordinate does not match the locked scope decision.");

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

const placeManifestEntry = "places/kunst/oslo/places_kunst/kunstnerforbundet.json";
const placeFile = path.join("data", placeManifestEntry);
const evidenceManifestEntry = "oslo/kunst/kunstnerforbundet.json";
const evidenceFile = path.join("data", "coordinate-evidence", evidenceManifestEntry);
if (existsSync(placeFile) || existsSync(evidenceFile)) throw new Error("Kunstnerforbundet output already exists.");

const coordNote = "Offisiell adressekoordinat fra Geonorge Adresser API for Kjeld Stubs gate 3, 0160 Oslo. Punktet brukes som display-marker for Kunstnerforbundet som egen kunstnerstyrt, ikke-kommersiell visnings- og formidlingsinstitusjon. Institusjonen eier bygården og har holdt til på adressen siden 1917.";

const place = {
  id: placeId,
  name: "Kunstnerforbundet",
  lat: c.lat,
  lon: c.lon,
  r: 65,
  category: "kunst",
  year: 1910,
  desc: "Kunstnerstyrt og ikke-kommersiell visnings- og formidlingsinstitusjon etablert i 1910, med fast tilhold i egen bygård i Kjeld Stubs gate 3 siden 1917.",
  popupDesc: "Kunstnerforbundet ble opprettet i 1910 av en gruppe yngre kunstnere og er blant Skandinavias eldste kunstnerstyrte gallerier. Siden 1917 har institusjonen holdt til i Kjeld Stubs gate 3, og den eier selv bygården. Dette gir stedet en uvanlig sterk kobling mellom kunstnerorganisering, institusjon og fysisk rom: huset rommer utstillingssaler, formidlingsrom, kunstlager, kontorer og atelierer.\n\nInstitusjonen er ikke-kommersiell i organisasjons- og formidlingsprofilen, men har samtidig en lang historie med å legge til rette for salg, offentlig innkjøp og økonomiske muligheter for kunstnere. Det gjør Kunstnerforbundet særlig egnet til å undersøke hvordan kunstfeltet organiserer kvalitet, adgang, profesjonsmakt og økonomi uten å være et vanlig privat markedsdrevet galleri.\n\nI History Go skal stedet behandles som én varig kunstinstitusjon med over hundre års kontinuitet i samme bygning. Skiftende enkeltutstillinger er innholdslag og kilder, ikke egne steder. Synlige quizspørsmål skal forankres i institusjonens dokumenterte historie, kunstnerstyring, bygning, utstillingspraksis og rolle i kunstfeltet — ikke i generisk samtidskunsttrivia.",
  emne_ids: [
    "em_kunst_institusjonskritikk_og_representasjon",
    "em_kunst_kvalitet_kritikk_og_symbolsk_kapital",
    "em_kunst_okonomi_og_finansiering"
  ],
  quiz_profile: {
    place_type: "kunstinstitusjon",
    subtype: "kunstnerstyrt_ikke_kommersiell_visningsinstitusjon",
    signature_features: [
      "etablert i 1910 av kunstnere",
      "har holdt til i Kjeld Stubs gate 3 siden 1917",
      "eier bygården med utstillingsrom, formidling, lager og atelierer",
      "kunstnerstyrt og ikke-kommersiell institusjonsmodell"
    ],
    primary_angles: [
      "kunstnerstyring",
      "institusjonshistorie",
      "kunstfelt_og_profesjonsmakt",
      "utstillingspraksis",
      "kunst_og_okonomi",
      "bygning_og_institusjonell_kontinuitet"
    ],
    question_families: [
      "institusjonshistorie",
      "organisering_og_makt",
      "kunstfelt_og_okonomi",
      "bygg_og_funksjon",
      "historisk_endring",
      "kontrast"
    ],
    avoid_angles: [
      "behandle_stedet_som_et_vanlig_privatsalgs-galleri",
      "generisk_samtidskunstquiz_uten_stedlig_kilde",
      "opprette_separate_place_records_for_midlertidige_utstillinger",
      "hevde_at_ikke_kommersiell_betyr_at_institusjonen_aldri_formidler_salg"
    ],
    must_include: [
      "grunnleggelsen i 1910",
      "tilstedeværelsen i Kjeld Stubs gate 3 siden 1917",
      "kunstnerstyringen og den ikke-kommersielle institusjonsmodellen",
      "bygningen som fysisk ramme for visning, formidling og kunstnerisk arbeid"
    ],
    contrast_targets: ["kunstnernes_hus", "vi_vii_gallery", "fotografiens_hus"],
    notes: "Spør Kunstnerforbundet som konkret kunstnerstyrt institusjon og historisk kunstfeltaktør. Offisielle institusjons-, arkiv- og utstillingskilder skal dominere synlig quizinnhold."
  },
  locatorType: "building",
  sourceProvider: "official_address",
  sourceObjectId: c.sourceObjectId,
  address: { street: "Kjeld Stubs gate", number: "3", postcode: "0160", city: "Oslo", country: "NO" },
  geocodeAccuracy: "rooftop",
  coordRole: "display_marker",
  coordType: "address_point",
  coordStatus: "verified",
  coordSource: "geonorge_adresser_v1",
  coordSourceId: c.sourceObjectId,
  coordSourceUrl: "https://ws.geonorge.no/adresser/v1/sok?sok=Kjeld%20Stubs%20gate%203%200160%20Oslo",
  coordVerifiedAt: DATE,
  coordNote,
  externalLinks: [
    { type: "official", label: "Kunstnerforbundet – om institusjonen", url: "https://kunstnerforbundet.no/om-kunstnerforbundet", lang: "nb", verifiedAt: DATE },
    { type: "official", label: "Kunstnerforbundet – besøk", url: "https://kunstnerforbundet.no/besok", lang: "nb", verifiedAt: DATE }
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
    r: 65,
    coordStatus: "verified",
    coordSource: "geonorge_adresser_v1",
    coordType: "address_point",
    coordNote
  },
  identity: {
    currentName: "Kunstnerforbundet",
    resolvedIdentity: "Kunstnerforbundet som egen kunstnerstyrt visnings- og formidlingsinstitusjon i egen bygård i Kjeld Stubs gate 3",
    identityStatus: "resolved",
    identityProblem: "",
    locatorTypeCandidate: "building",
    requiresSplit: false,
    splitReason: ""
  },
  requiredEvidence: [
    "eksakt nåværende besøksadresse",
    "uavhengig canonical identitets- og nærhetskontroll",
    "institusjonell kontinuitet og fysisk stedstilknytning",
    "current-main duplicate gate immediately before production"
  ],
  evidence: [
    {
      sourceProvider: "official_address",
      sourceName: "Geonorge Adresser API v1 – Kjeld Stubs gate 3",
      sourceUrl: "https://ws.geonorge.no/adresser/v1/sok?sok=Kjeld%20Stubs%20gate%203%200160%20Oslo",
      sourceObjectId: c.sourceObjectId,
      sourceQuality: "official_address",
      finding: "Eksakt adressepunkt for Kunstnerforbundets nåværende og langvarige bygård.",
      canVerifyCoordinate: true,
      reason: coordNote
    },
    {
      sourceProvider: "manual_research",
      sourceName: "Kunstnerforbundet – om institusjonen",
      sourceUrl: "https://kunstnerforbundet.no/om-kunstnerforbundet",
      sourceObjectId: "kunstnerforbundet:about",
      sourceQuality: "official_institution_identity",
      finding: "Institusjonen er kunstnerstyrt og ikke-kommersiell, etablert i 1910, har holdt til i Kjeld Stubs gate 3 siden 1917 og eier bygården.",
      canVerifyCoordinate: false,
      reason: "Identitets-, historie- og scope-kryssjekk."
    }
  ],
  addressCandidates: [
    { address: "Kjeld Stubs gate 3, 0160 Oslo", sourceProvider: "official_address", sourceObjectId: c.sourceObjectId, canApplyToPlace: true }
  ],
  sourceObjectCandidates: [
    { sourceProvider: "official_address", sourceObjectId: c.sourceObjectId, canApplyToPlace: true },
    { sourceProvider: "manual_research", sourceObjectId: "kunstnerforbundet:about", canApplyToPlace: false }
  ],
  geometryCandidates: [],
  coordinateCandidates: [
    { lat: c.lat, lon: c.lon, coordRole: "display_marker", sourceObjectId: c.sourceObjectId, canApplyToPlace: true }
  ],
  decision: { canBecomeVerified: true, blockedReason: "", nextAction: "Kjeld Stubs gate 3 er anvendt som canonical display-marker." },
  notes: [
    coordNote,
    "Ingen canonical Kunstnerforbundet-identitet og ingen eksisterende canonical markør innen 35 meter ble funnet i den lukkede gallery-priority scope-auditen."
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
protocol = `${protocol.trimEnd()}\n\n| ${nextBatch} | \`${placeId}\` | Kunstnerforbundet | verified | \`${c.sourceObjectId}\` |\n\nBatch ${nextBatch} (${DATE}) produserer \`${placeId}\` etter den lukkede VisitOSLO gallery-priority scope-auditen. Institusjonen har ingen canonical identitetsduplikat eller markør innen 35 meter, og bruker det eksakte Geonorge-adressepunktet for Kjeld Stubs gate 3.\n`;
writeFileSync(protocolPath, protocol, "utf8");

writeJson("reports/visitoslo-galleries-audit-20260723/priority-tranche/kunstnerforbundet-production.json", {
  version: DATE,
  placeId,
  batch: nextBatch,
  placeManifestEntry,
  evidenceManifestEntry,
  coordinateSourceObjectId: c.sourceObjectId,
  sourceScopeReport: scopePath
});

console.log(`Produced ${placeId} as Oslo coordinate batch ${nextBatch}.`);
console.log(`Place file: ${placeFile}`);
console.log(`Evidence file: ${evidenceFile}`);
