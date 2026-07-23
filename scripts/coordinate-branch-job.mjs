import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const DATE = "2026-07-23";
const PLACE_ID = "galleri_lnm";
const PLACE_NAME = "Galleri LNM";
const PLACE_FILE = `data/places/kunst/oslo/places_kunst/${PLACE_ID}.json`;
const EVIDENCE_FILE = `data/coordinate-evidence/oslo/kunst/${PLACE_ID}.json`;
const READINESS_FILE = "reports/visitoslo-galleries-audit-20260723/candidate-coordinate-intake/PRODUCTION_READINESS.json";
const REPORT_DIR = "reports/visitoslo-galleries-audit-20260723/production";
mkdirSync(REPORT_DIR, { recursive: true });

function readJson(path) { return JSON.parse(readFileSync(path, "utf8")); }
function writeJson(path, value) { writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8"); }
function parseFinderJson(stdout) { const text = String(stdout ?? "").trim(); const start = text.indexOf("{"); if (start < 0) return null; try { return JSON.parse(text.slice(start)); } catch { return null; } }
function extractPlaces(root) {
  const result = []; const seen = new Set();
  const visit = (value, depth = 0) => {
    if (depth > 6 || value == null) return;
    if (Array.isArray(value)) { for (const item of value) visit(item, depth + 1); return; }
    if (typeof value !== "object") return;
    if (typeof value.id === "string" && typeof value.name === "string" && Number.isFinite(value.lat) && Number.isFinite(value.lon)) { if (!seen.has(value.id)) { seen.add(value.id); result.push(value); } return; }
    for (const child of Object.values(value)) visit(child, depth + 1);
  };
  visit(root); return result;
}
function distanceMeters(lat1, lon1, lat2, lon2) { const rad = (d) => d * Math.PI / 180; const r = 6371000; const dLat = rad(lat2-lat1); const dLon = rad(lon2-lon1); const a = Math.sin(dLat/2)**2 + Math.cos(rad(lat1))*Math.cos(rad(lat2))*Math.sin(dLon/2)**2; return 2*r*Math.asin(Math.sqrt(a)); }
function appendManifest(path, item) { const manifest = readJson(path); if (!Array.isArray(manifest.files)) throw new Error(`${path} has no files array`); if (!manifest.files.includes(item)) manifest.files.push(item); writeJson(path, manifest); }

if (existsSync(PLACE_FILE) || existsSync(EVIDENCE_FILE)) throw new Error(`${PLACE_ID} already exists on branch`);
const readiness = readJson(READINESS_FILE);
const ready = readiness.coordinateReady?.find((row) => row.placeId === PLACE_ID);
if (!ready) throw new Error(`${PLACE_ID} missing from merged production readiness`);
if (ready.sourceObjectId !== "geonorge-adresser-v1:0301:16115:37") throw new Error(`Unexpected readiness source object ${ready.sourceObjectId}`);
const currentPlaces = extractPlaces(readJson("data/places/places_index.json"));
if (currentPlaces.some((place) => place.id === PLACE_ID)) throw new Error(`Duplicate id ${PLACE_ID}`);
if (currentPlaces.some((place) => [PLACE_NAME.toLowerCase(), "lnm", "landsforeningen norske malere"].includes(String(place.name).toLowerCase().trim()))) throw new Error(`Exact identity-name duplicate for ${PLACE_ID}`);

const build = spawnSync("npm", ["run", "build:tools"], { encoding: "utf8" });
writeFileSync(`${REPORT_DIR}/${PLACE_ID}-build-tools.log`, `${build.stdout ?? ""}${build.stderr ?? ""}`, "utf8");
if (build.status !== 0) throw new Error(`build:tools failed with status ${build.status}`);
const finder = spawnSync("node", ["dist/tools/address-first-coordinate-finder.mjs", "--address", "Rådhusgata 37 Oslo"], { encoding: "utf8" });
const finderRaw = `${finder.stdout ?? ""}${finder.stderr ?? ""}`;
writeFileSync(`${REPORT_DIR}/${PLACE_ID}-address-first.log`, finderRaw, "utf8");
const found = parseFinderJson(finder.stdout);
if (!found || found.status !== "verified_candidate") throw new Error(`Address-first did not verify: ${found?.status ?? "parse_error"}`);
if (found.sourceObjectId !== ready.sourceObjectId) throw new Error(`Geonorge object changed: ${found.sourceObjectId}`);
const lat = Number(found.coordinate?.lat); const lon = Number(found.coordinate?.lon);
if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error("Invalid address coordinate");
if (Math.abs(lat-ready.lat) > 1e-10 || Math.abs(lon-ready.lon) > 1e-10) throw new Error(`Coordinate changed since readiness audit: ${lat},${lon}`);
const nearby = currentPlaces.map((place) => ({ id: place.id, name: place.name, distanceMeters: Number(distanceMeters(lat,lon,place.lat,place.lon).toFixed(2)) })).sort((a,b)=>a.distanceMeters-b.distanceMeters).slice(0,10);
if (nearby[0]?.distanceMeters <= 3) throw new Error(`Canonical marker collision: ${nearby[0].id} at ${nearby[0].distanceMeters} m`);

const coordNote = "Offisiell adressekoordinat fra Geonorge Adresser API for Rådhusgata 37, 0158 Oslo. LNM dokumenterer samme adresse som dagens galleri og administrasjon; punktet brukes som canonical display-marker for Landsforeningen Norske Malere og Galleri LNM som én varig kunstinstitusjon.";
const place = {
  id: PLACE_ID,
  name: PLACE_NAME,
  lat, lon, r: 55, category: "kunst", year: 1968,
  desc: "Galleri og landsdekkende fagorganisasjon for profesjonelle malere, etablert i 1968 og med offentlig utstillingsprogram i Rådhusgata 37.",
  popupDesc: "Landsforeningen Norske Malere, LNM, ble etablert i 1968 for å fremme malernes interesser og er en av grunnorganisasjonene i Norske Billedkunstnere. Organisasjonen samler profesjonelle kunstnere med maleri som sentralt felt og kombinerer fagpolitisk arbeid med et offentlig galleri for norsk samtidsmaleri.\n\nGalleriet i Rådhusgata 37 viser normalt flere skiftende utstillinger i året, blant annet gjennom åpne søknadsrunder. LNM har flere hundre medlemmer og arbeider både med kunstnernes profesjonelle vilkår og med formidling og diskusjon av maleri som samtidskunst.\n\nI History Go behandles LNM og galleriet som én varig kunstinstitusjon. Skiftende utstillinger er innholdslag, ikke egne steder. Stedet er særlig relevant for hvordan et kunstmedium organiseres gjennom fagforening, juryering, utstillingsprogram og kunstpolitikk.",
  emne_ids: ["em_kunst_institusjonskritikk_og_representasjon","em_kunst_kvalitet_kritikk_og_symbolsk_kapital","em_kunst_okonomi_og_finansiering"],
  quiz_profile: {
    place_type: "kunstinstitusjon_og_kunstnerorganisasjon",
    subtype: "malerforening_og_samtidsmalerigalleri",
    signature_features: ["etablert i 1968","grunnorganisasjon i Norske Billedkunstnere","galleri i Rådhusgata 37","landsdekkende fagorganisasjon for profesjonelle malere"],
    primary_angles: ["maleri_som_samtidsfelt","kunstnerorganisering","juryering_og_utstillingsprogram","kunstpolitikk","fagfellesskap"],
    question_families: ["institusjonshistorie","organisering_og_makt","utstillingspraksis","kunstpolitikk","historisk_endring"],
    avoid_angles: ["behandle_LNM_som_en_enkeltutstilling","generisk_maleriquiz_uten_institusjonsforankring","forveksle_med_andre_gallerier_i_Raadhusgata"],
    must_include: ["etableringen i 1968","rollen som fagorganisasjon","Rådhusgata 37 som dagens galleri","samtidsmaleri som faglig fokus"],
    contrast_targets: ["kunstnerforbundet","tegnerforbundet","norske_grafikere"],
    notes: "Bruk LNMs egne organisasjons-, kontakt- og programkilder for stedsnære spørsmål."
  },
  locatorType: "building", sourceProvider: "official_address", sourceObjectId: found.sourceObjectId,
  address: { street: "Rådhusgata", number: "37", postcode: "0158", city: "Oslo", country: "NO" },
  geocodeAccuracy: "rooftop", coordRole: "display_marker", coordType: "address_point", coordStatus: "verified", coordSource: "geonorge_adresser_v1", coordSourceId: found.sourceObjectId, coordSourceUrl: found.sourceUrl, coordVerifiedAt: DATE, coordNote,
  externalLinks: [
    { type: "official", label: "LNM – om LNM", url: "https://lnm.no/om-lnm", lang: "nb", verifiedAt: DATE },
    { type: "official", label: "LNM – kontakt", url: "https://lnm.no/kontakt", lang: "nb", verifiedAt: DATE }
  ]
};
const evidence = {
  schemaVersion: "1.0", placeId: PLACE_ID, placeFile: PLACE_FILE, evidenceStatus: "applied_to_place", coordinateDecision: "do_not_change_coordinates_yet",
  currentCoordinate: { lat, lon, r: 55, coordStatus: "verified", coordSource: "geonorge_adresser_v1", coordType: "address_point", coordNote },
  identity: { currentName: PLACE_NAME, resolvedIdentity: "Landsforeningen Norske Malere og Galleri LNM som én kunstnerorganisasjon og visningsinstitusjon i Rådhusgata 37", identityStatus: "resolved", identityProblem: "", locatorTypeCandidate: "building", requiresSplit: false, splitReason: "" },
  requiredEvidence: ["eksakt nåværende besøksadresse","canonical identitets- og nærhetskontroll","dokumentert institusjonell kontinuitet"],
  evidence: [
    { sourceProvider: "official_address", sourceName: "Geonorge Adresser API v1 – Rådhusgata 37", sourceUrl: found.sourceUrl, sourceObjectId: found.sourceObjectId, sourceQuality: "official_address", finding: "Ett tydelig offisielt adressepunkt for Rådhusgata 37 i Oslo.", canVerifyCoordinate: true, reason: coordNote },
    { sourceProvider: "manual_research", sourceName: "LNM – Om LNM", sourceUrl: "https://lnm.no/om-lnm", sourceObjectId: "lnm:about", sourceQuality: "official_institution_identity", finding: "Dokumenterer etableringen i 1968, rollen som landsdekkende fagorganisasjon og galleriet i Rådhusgata 37.", canVerifyCoordinate: false, reason: "Identitets- og institusjonshistorisk kryssjekk." },
    { sourceProvider: "manual_research", sourceName: "LNM – Kontakt", sourceUrl: "https://lnm.no/kontakt", sourceObjectId: "lnm:contact", sourceQuality: "official_site_address", finding: "Dokumenterer Rådhusgata 37, 0158 Oslo som dagens adresse.", canVerifyCoordinate: false, reason: "Nåværende adressekryssjekk." }
  ],
  addressCandidates: [{ address: "Rådhusgata 37, 0158 Oslo", sourceProvider: "official_address", sourceObjectId: found.sourceObjectId, canApplyToPlace: true }],
  sourceObjectCandidates: [{ sourceProvider: "official_address", sourceObjectId: found.sourceObjectId, canApplyToPlace: true },{ sourceProvider: "manual_research", sourceObjectId: "lnm:about", canApplyToPlace: false },{ sourceProvider: "manual_research", sourceObjectId: "lnm:contact", canApplyToPlace: false }],
  geometryCandidates: [], coordinateCandidates: [{ lat, lon, coordRole: "display_marker", sourceObjectId: found.sourceObjectId, canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: "", nextAction: "Rådhusgata 37 er anvendt som canonical display-marker." },
  notes: [coordNote, `Nærmeste eksisterende canonical marker ved write-time var ${nearby[0]?.id ?? "ingen"} på ${nearby[0]?.distanceMeters ?? "n/a"} meter; ingen markør lå innen 3 meter.`]
};
writeJson(PLACE_FILE, place); writeJson(EVIDENCE_FILE, evidence);
appendManifest("data/places/manifest.json", `places/kunst/oslo/places_kunst/${PLACE_ID}.json`); appendManifest("data/coordinate-evidence/manifest.json", `oslo/kunst/${PLACE_ID}.json`);
let protocol = readFileSync("docs/coordinates/coordinate-control-protocol.md", "utf8");
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|\s*`/gm)].map((match)=>Number(match[1])); if (!batches.length) throw new Error("Could not determine current Oslo batch max"); const nextBatch = Math.max(...batches)+1;
const countPattern = /Oslo-protokollen dekker nå (\d+) aktive current `verified\*` canonical Oslo-steder\./; const countMatch = protocol.match(countPattern); if (!countMatch) throw new Error("Could not update protocol verified count");
protocol = protocol.replace(countPattern, `Oslo-protokollen dekker nå ${Number(countMatch[1])+1} aktive current \`verified*\` canonical Oslo-steder.`);
protocol = `${protocol.trimEnd()}\n\n| ${nextBatch} | \`${PLACE_ID}\` | ${PLACE_NAME} | verified | \`${found.sourceObjectId}\` |\n\nBatch ${nextBatch} (${DATE}) produserer \`${PLACE_ID}\` etter VisitOSLO Galleries scope- og readiness-auditene. Det eksakte Geonorge-adressepunktet for Rådhusgata 37 brukes som display-marker for LNM som egen fagorganisasjon og offentlig galleriinstitusjon.\n`;
writeFileSync("docs/coordinates/coordinate-control-protocol.md", protocol, "utf8");
writeJson(`${REPORT_DIR}/${PLACE_ID}-production.json`, { version: DATE, placeId: PLACE_ID, batch: nextBatch, status: "produced", sourceObjectId: found.sourceObjectId, coordinate: { lat, lon }, nearestCanonicalBeforeWrite: nearby[0] ?? null, writeTimeDuplicateChecks: { placeIdAbsent: true, exactNameAbsent: true, noCanonicalMarkerWithin3m: true }, sourceReadiness: READINESS_FILE });
console.log(JSON.stringify({ placeId: PLACE_ID, batch: nextBatch, sourceObjectId: found.sourceObjectId, lat, lon, nearestCanonicalBeforeWrite: nearby[0] ?? null }, null, 2));
