import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const placeId = "fotografiens_hus";
const name = "Fotografiens Hus";
const placeManifestEntry = "places/kunst/oslo/places_kunst/fotografiens_hus.json";
const placeFile = path.join("data", placeManifestEntry);
const evidenceManifestEntry = "oslo/kunst/fotografiens_hus.json";
const evidenceFile = path.join("data", "coordinate-evidence", evidenceManifestEntry);
const intakePath = "reports/oslo-attractions-completeness-20260720/fotografiens-hus/result.json";
const taxonomyPath = "reports/oslo-attractions-completeness-20260720/fotografiens-hus/taxonomy.md";

if (existsSync(placeFile) || existsSync(evidenceFile)) {
  throw new Error("Fotografiens Hus canonical production already exists; refusing duplicate write.");
}
if (!existsSync(taxonomyPath)) {
  throw new Error("Merged Fotografiens Hus taxonomy decision is missing.");
}

const intake = JSON.parse(readFileSync(intakePath, "utf8"));
if (
  intake?.status !== "verified_candidate" ||
  intake?.sourceObjectId !== "geonorge-adresser-v1:0301:16115:20" ||
  Number(intake?.coordinate?.lat) !== 59.90951628354778 ||
  Number(intake?.coordinate?.lon) !== 10.74209892031479
) {
  throw new Error("Coordinate intake does not match locked Fotografiens Hus production input.");
}

const c = intake.coordinate;
const coordNote = "Offisiell adressekoordinat fra Geonorge Adresser API for Rådhusgata 20, OSLO. Punktet brukes som display-marker for Fotografiens Hus som offentlig fotogalleri og visningssted for fotografi. Det representerer ikke Kvadraturen, Rådhusgata som gate eller nærliggende canonical bygninger.";

const place = {
  id: placeId,
  name,
  lat: c.lat,
  lon: c.lon,
  r: 60,
  category: "kunst",
  year: 1999,
  desc: "Offentlig fotogalleri og felleshus for fotografer i Rådhusgata 20, brukt som fast visningssted for fotografi siden 1999 og viet fotografi som kunstnerisk uttrykk, fag og offentlig samtale.",
  popupDesc: "Fotografiens Hus har siden 1999 vært et fast visningssted for fotografi i Rådhusgata 20 i Kvadraturen. Galleriet er åpent for allmennheten og arbeider for å øke kunnskap om og engasjement for fotografi som både kunstnerisk uttrykk og fag. Et løpende, kuratert utstillingsprogram viser etablerte og nyere fotografer og kunstnere på tvers av fotografiske sjangre og praksiser.\n\nStedet er særlig egnet til å undersøke hvordan fotografi blir valgt ut, stilt ut og gitt offentlig betydning. I et galleri inngår fotografier i kuratering, sekvenser, rom, tekst, teknikk og institusjonelle valg som påvirker hvordan publikum leser dem. Fotografiens Hus fungerer samtidig som et faglig møtested for fotografer og et publikumsrom for samtaler om representasjon, kvalitet og fotografiets skiftende rolle.\n\nI History Go behandles Fotografiens Hus som én varig kunstinstitusjon med fotografi som medium. Midlertidige enkeltutstillinger brukes som kilder og innholdslag når de er relevante, men skal ikke opprettes som egne overlappende steder.",
  emne_ids: [
    "em_kunst_institusjonskritikk_og_representasjon",
    "em_kunst_kvalitet_kritikk_og_symbolsk_kapital"
  ],
  quiz_profile: {
    place_type: "kunstinstitusjon",
    subtype: "offentlig_fotogalleri_og_felleshus_for_fotografi",
    signature_features: [
      "fast visningssted for fotografi i Rådhusgata 20 siden 1999",
      "offentlig galleri viet fotografi som kunstnerisk uttrykk og fag",
      "kuratert program med skiftende fotografiske utstillinger",
      "møtepunkt mellom fotografer, kunstnere, fagfelt og publikum"
    ],
    primary_angles: [
      "fotografi_som_kunst_og_fag",
      "kunstinstitusjon_og_kuratering",
      "visuell_kultur_og_fortelling",
      "representasjon_og_utvalg",
      "fotografisk_praksis"
    ],
    question_families: [
      "institusjonshistorie",
      "medium_og_praksis",
      "kuratering_og_utstillingsrom",
      "representasjon",
      "kontrast"
    ],
    avoid_angles: [
      "generisk_fotografiquiz_uten_stedlig_kilde",
      "redusere_stedet_til_en_aktuell_midlertidig_utstilling",
      "behandle_galleriet_som_museum_med_permanent_historisk_samling",
      "opprette_separate_place_records_for_enkeltutstillinger"
    ],
    must_include: [
      "rollen som dedikert offentlig visningssted for fotografi",
      "tilstedeværelsen i Rådhusgata 20 siden 1999",
      "fotografi som både kunstnerisk uttrykk og fag",
      "kuratert utstillingspraksis når institusjonen analyseres"
    ],
    contrast_targets: ["kunstnernes_hus", "nasjonalmuseet", "nobels_fredssenter"],
    notes: "Spør stedet som fotografispesifikk kunstinstitusjon og offentlig visningsrom. Eksterne institusjons- og utstillingskilder skal drive synlig quizinnhold; canonical emner brukes som analytisk veiledning, ikke som faktakilde."
  },
  locatorType: "building",
  sourceProvider: "official_address",
  sourceObjectId: intake.sourceObjectId,
  address: c.address,
  geocodeAccuracy: c.geocodeAccuracy,
  coordRole: "display_marker",
  coordStatus: "verified",
  coordSource: "geonorge_adresser_v1",
  coordSourceId: intake.sourceObjectId,
  coordSourceUrl: intake.sourceUrl,
  coordType: "address_point",
  coordVerifiedAt: "2026-07-20",
  coordNote,
  externalLinks: [
    { type: "official", label: "Fotografiens Hus – om oss", url: "https://fotografiens-hus.no/om-oss/", lang: "nb", verifiedAt: "2026-07-20" },
    { type: "official", label: "Fotografiens Hus – utstillingsplass og galleri", url: "https://fotografiens-hus.no/om-oss/sok-utstillingsplass/", lang: "nb", verifiedAt: "2026-07-20" }
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
    currentName: name,
    resolvedIdentity: "Fotografiens Hus, det offentlige fotogalleriet og visningsstedet for fotografi i Rådhusgata 20 i Oslo",
    identityStatus: "resolved",
    identityProblem: "",
    locatorTypeCandidate: "building",
    requiresSplit: false,
    splitReason: ""
  },
  requiredEvidence: [
    "entydig offisielt adressepunkt for Rådhusgata 20",
    "offisiell institusjonsidentitet og dokumentert besøksadresse",
    "canonical identitets- og nærhetssøk mot eksisterende steder"
  ],
  evidence: [
    {
      sourceProvider: "official_address",
      sourceName: "geonorge_adresser_v1",
      sourceUrl: intake.sourceUrl,
      sourceObjectId: intake.sourceObjectId,
      sourceQuality: "official_address_plus_official_institution_identity_plus_canonical_overlap_audit",
      finding: "Geonorge gir ett tydelig offisielt adressepunkt for Rådhusgata 20 Oslo. Fotografiens Hus dokumenterer samme besøksadresse og at stedet har vært fast visningssted for fotografi der siden 1999. Aktiv runtime-indeks har ingen identitetsmatch; nærmeste canonical steder representerer andre navngitte adresser og fysiske identiteter.",
      canVerifyCoordinate: true,
      reason: coordNote
    }
  ],
  addressCandidates: [
    { address: "Rådhusgata 20 Oslo", sourceProvider: "official_address", sourceObjectId: intake.sourceObjectId, canApplyToPlace: true }
  ],
  sourceObjectCandidates: [
    { sourceProvider: "official_address", sourceObjectId: intake.sourceObjectId, canApplyToPlace: true }
  ],
  geometryCandidates: [],
  coordinateCandidates: [
    { lat: c.lat, lon: c.lon, coordRole: "display_marker", canApplyToPlace: true }
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: "",
    nextAction: "Applied Rådhusgata 20 as the canonical building/display marker for Fotografiens Hus after exact address-first verification, official institution identity confirmation and canonical overlap review."
  },
  notes: [
    coordNote,
    "Ingen eksisterende canonical place har samme Fotografiens Hus-identitet. Det nærmeste registrerte stedet, Kirkegata 5, ligger 36,8 meter unna og representerer en annen adresse og identitet."
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
if (protocol.includes("`fotografiens_hus`")) throw new Error("Fotografiens Hus already exists in coordinate protocol.");
const marker = "\n\nRelevante korrigerende merger";
const markerIndex = protocol.indexOf(marker);
if (markerIndex < 0) throw new Error("Could not locate end of Oslo coordinate table.");
const beforeTableEnd = protocol.slice(0, markerIndex);
const batches = [...beforeTableEnd.matchAll(/^\|\s*(\d+)\s*\|\s*`[^`]+`/gm)].map((m) => Number(m[1]));
const nextBatch = Math.max(...batches) + 1;
const countMatch = protocol.match(/Oslo-tabellen inneholder nå (\d+) verifiserte eller kildekontrollerte canonical steder\./);
if (!countMatch) throw new Error("Could not parse Oslo protocol count.");
const noCoordMatch = protocol.match(/Antallet fullførte kontroller uten godkjent Oslo-koordinat er (\d+)\./);
const noCoordCount = noCoordMatch ? Number(noCoordMatch[1]) : 0;
const intro = `Oslo-tabellen inneholder nå ${Number(countMatch[1]) + 1} verifiserte eller kildekontrollerte canonical steder. Batch ${nextBatch} legger til Fotografiens Hus med det entydige Geonorge-adressepunktet for Rådhusgata 20 og dokumentert institusjonsidentitet som offentlig fotogalleri siden 1999. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${noCoordCount}.`;
protocol = protocol.replace(/Oslo-tabellen inneholder nå \d+ verifiserte eller kildekontrollerte canonical steder\.[^\n]*/, intro);
const row = `| ${nextBatch} | \`fotografiens_hus\` | Fotografiens Hus | verified | \`${intake.sourceObjectId}\` |`;
const insertAt = protocol.indexOf(marker);
protocol = `${protocol.slice(0, insertAt)}\n${row}${protocol.slice(insertAt)}`;
protocol = `${protocol.trimEnd()}\n\nBatch ${nextBatch} (2026-07-20) produserer \`fotografiens_hus\` som eget offentlig fotogalleri og fotografispesifikt kunststed. Den låste address-first-kjøringen ga ett tydelig Geonorge-treff for Rådhusgata 20. Offisiell institusjonsinformasjon dokumenterer samme adresse og kontinuerlig bruk som visningssted siden 1999; canonical overlap-audit fant ingen identitetsduplikat. Midlertidige enkeltutstillinger forblir innholdslag og skal ikke splittes til egne overlappende place-markører.\n`;
writeFileSync(protocolPath, protocol, "utf8");

console.log(`Produced ${placeId} as Oslo coordinate batch ${nextBatch}.`);
console.log(`Place file: ${placeFile}`);
console.log(`Evidence file: ${evidenceFile}`);
