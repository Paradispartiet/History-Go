import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const DATE = "2026-07-21";
const intakePath = "reports/visitoslo-oslofjord-audit-20260721/coordinate-intake-final.json";
const intake = JSON.parse(readFileSync(intakePath, "utf8"));
const input = new Map((intake.candidates ?? []).map((row) => [row.placeId, row]));

const defs = {
  steilene: {
    name: "Steilene", category: "historie", municipality: "Nesodden", year: 1837, r: 260,
    desc: "Øygruppe i Nesodden med Steilene fyr, sjømerkingshistorie og et kystkulturlandskap som i dag brukes til friluftsliv og formidling.",
    popupDesc: "Steilene er en øygruppe med flere navngitte holmer og øyer. Fyrstasjonen ble etablert i 1837 og var lenge en viktig del av navigasjonen inn mot Oslo. Senere ble driften automatisert, mens anlegget fikk en ny rolle som kulturminne og kystledsted. History Go behandler Steilene som én archipelago-level identitet; enkeltøyene får ikke egne markører uten en senere selvstendig inclusion-case.",
    emne_ids: ["em_his_spor_materialitet", "em_his_historiske_lag_i_byrom", "em_his_kulturminner_bevaring"],
    type: "historisk_oygruppe", subtype: "fyrstasjon_og_kystkultur", signature: ["fyrstasjon fra 1837", "flere separate holmer", "overgang fra bemannet fyr til kulturarvbruk"], angles: ["fyrhistorie", "sjøfart", "teknologisk_endring", "bevaring"], avoid: ["late_som_steilene_er_en_enkelt_oy", "udokumentert_petroleumshistorie_som_hovedfakta"], must: ["fyrstasjonen", "øygruppen som fysisk skala", "endret fyrdrift"], contrasts: ["heggholmen", "hovedoya"], ref: "https://snl.no/Steilene"
  },
  langoyene: {
    name: "Langøyene", category: "natur", municipality: "Nesodden", year: 1908, r: 260,
    desc: "Rekreasjonsøy der to tidligere øyer ble bundet sammen av Oslos avfallsfylling og senere gjennomgikk omfattende miljørehabilitering.",
    popupDesc: "Langøyene er i dag ett sammenhengende frilufts- og badeområde, men landformen er menneskeskapt. Nordre og Søndre Langøy ble bundet sammen gjennom avfallsdeponering fra tidlig 1900-tall. Senere ble forurensningen et stort miljøproblem, og området ble stengt for omfattende opprydding før gjenåpning i 2022. History Go behandler stedet primært som natur og rekreasjon, men gjør fyllplasshistorien og miljørehabiliteringen uunnværlige for å forstå dagens landskap.",
    emne_ids: ["em_natur_kyst_okosystemer", "em_his_historiske_lag_i_byrom", "em_his_spor_materialitet"],
    type: "rehabilitert_fjordoy", subtype: "tidligere_avfallsfylling_og_friluftsomrade", signature: ["to øyer bundet sammen av avfallsfylling", "kommunal deponihistorie", "miljørehabilitering før gjenåpning i 2022"], angles: ["kystnatur", "miljohistorie", "avfall_og_stoffstrommer", "rehabilitering"], avoid: ["urort_natur-fortelling", "late_som_dagens_oyform_er_naturlig"], must: ["de to opprinnelige øyene", "fyllplasshistorien", "miljørehabiliteringen"], contrasts: ["rambergoya", "gressholmen"], ref: "https://oslobyleksikon.no/side/Lang%C3%B8yene"
  },
  ingierstrand_bad: {
    name: "Ingierstrand bad", category: "historie", municipality: "Nordre Follo", year: 1934, r: 180,
    desc: "Funksjonalistisk badeanlegg fra 1934 der landskap, stupetårn, restaurantarkitektur og offentlig rekreasjon ble planlagt som ett samlet moderne fritidsmiljø.",
    popupDesc: "Ingierstrand bad ble ferdigstilt i 1934 og er et sentralt eksempel på funksjonalismens møte med offentlig fritidskultur. Ole Lind Schistad og Eyvind Moestue formet strand, terreng, stupetårn og restaurantarkitektur som ett samlet anlegg. Oslo kommune overtok stedet i 1936, selv om anlegget fysisk ligger i dagens Nordre Follo. Recorden representerer hele badeanlegget; Kartverkets eksakte SSR-objekt brukes derfor som områdeanker, mens restaurantadressen bare er en separat fysisk kryssjekk.",
    emne_ids: ["em_his_spor_materialitet", "em_his_historiske_lag_i_byrom", "em_his_kulturminner_bevaring"],
    type: "historisk_badeanlegg", subtype: "funksjonalistisk_offentlig_rekreasjonskompleks", signature: ["ferdigstilt i 1934", "tegnet av Ole Lind Schistad og Eyvind Moestue", "strand, stupetårn og restaurant som samlet anlegg"], angles: ["funksjonalisme", "offentlig_rekreasjon", "arkitektur_og_landskap", "bevaring"], avoid: ["redusere_stedet_til_restauranten", "forveksle_eierskap_med_fysisk_kommune"], must: ["1934-anlegget", "arkitektene", "samspillet mellom landskap og arkitektur"], contrasts: ["sorenga_sjobad", "langoyene"], ref: "https://oslobyleksikon.no/side/Ingierstrand_bad"
  }
};

const ids = Object.keys(defs);
const indexRaw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const currentPlaces = Array.isArray(indexRaw) ? indexRaw : indexRaw.places ?? [];
for (const id of ids) {
  if (currentPlaces.some((place) => place.id === id)) throw new Error(`${id} already exists on current main.`);
  if (!input.get(id)?.coordinate) throw new Error(`Missing locked coordinate intake for ${id}.`);
}

function writeJson(file, value) { mkdirSync(path.dirname(file), { recursive: true }); writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8"); }
function appendManifest(file, entry) { const manifest = JSON.parse(readFileSync(file, "utf8")); if (!Array.isArray(manifest.files)) throw new Error(`${file} has no files array.`); if (!manifest.files.includes(entry)) manifest.files.push(entry); writeJson(file, manifest); }

const produced = [];
for (const id of ids) {
  const d = defs[id];
  const locked = input.get(id);
  if (locked.productionCategory !== d.category) throw new Error(`Category mismatch for ${id}.`);
  const c = locked.coordinate;
  const entry = `places/${d.category}/akershus/${id}.json`;
  const file = path.join("data", entry);
  const evidenceEntry = `akershus/${d.category}/${id}.json`;
  const evidenceFile = path.join("data", "coordinate-evidence", evidenceEntry);
  if (existsSync(file) || existsSync(evidenceFile)) throw new Error(`Output already exists for ${id}.`);

  const place = {
    id, name: d.name, lat: c.lat, lon: c.lon, r: d.r, category: d.category, year: d.year, municipality: d.municipality,
    desc: d.desc, popupDesc: d.popupDesc, emne_ids: d.emne_ids,
    quiz_profile: { place_type: d.type, subtype: d.subtype, signature_features: d.signature, primary_angles: d.angles, question_families: ["historisk_endring", "sted_og_materialitet", "bruk_og_funksjon", "kontrast"], avoid_angles: d.avoid, must_include: d.must, contrast_targets: d.contrasts, notes: "Eksterne stedskilder skal dominere synlig quizinnhold; canonical emner brukes som faglig styring." },
    locatorType: c.locatorType, sourceProvider: c.sourceProvider, sourceObjectId: c.sourceObjectId, geocodeAccuracy: c.geocodeAccuracy, coordRole: c.coordRole, coordType: c.coordType, coordStatus: c.coordStatus, coordSource: c.coordSource, coordSourceId: c.coordSourceId, coordSourceUrl: c.coordSourceUrl, coordVerifiedAt: DATE, coordNote: c.coordNote,
    externalLinks: [{ type: "reference", label: `Referansekilde – ${d.name}`, url: d.ref, lang: "nb", verifiedAt: DATE }, { type: "coordinate_source", label: c.sourceProvider === "osm" ? `OpenStreetMap – ${d.name}` : `Kartverket SSR – ${d.name}`, url: c.coordSourceUrl, lang: "nb", verifiedAt: DATE }]
  };

  const evidence = {
    schemaVersion: "1.0", placeId: id, placeFile: file, evidenceStatus: "applied_to_place", coordinateDecision: "do_not_change_coordinates_yet",
    currentCoordinate: { lat: c.lat, lon: c.lon, r: d.r, coordStatus: c.coordStatus, coordSource: c.coordSource, coordType: c.coordType, coordNote: c.coordNote },
    identity: { currentName: d.name, resolvedIdentity: `${d.name} som egen fysisk stedsidentitet i ${d.municipality}, Akershus`, identityStatus: "resolved", identityProblem: "", locatorTypeCandidate: c.locatorType, requiresSplit: false, splitReason: "" },
    requiredEvidence: [c.sourceProvider === "osm" ? "eksakt navngitt fysisk OSM-objekt" : "eksakt aktiv Kartverket SSR-identitet", "uavhengig identitetskryssjekk", "canonical duplikatkontroll", "korrekt fysisk fylkesplassering"],
    evidence: [{ sourceProvider: c.sourceProvider, sourceName: c.coordSource, sourceUrl: c.coordSourceUrl, sourceObjectId: c.sourceObjectId, sourceQuality: c.sourceProvider === "osm" ? "exact_named_semantic_object" : "official_named_place_registry", finding: c.coordNote, canVerifyCoordinate: true, reason: "Godkjent i den lukkede Oslofjord-intaken uten nearest/first-hit." }, { sourceProvider: "manual_research", sourceName: `Referansekilde – ${d.name}`, sourceUrl: d.ref, sourceObjectId: `reference:${id}`, sourceQuality: "independent_identity_crosscheck", finding: `Kryssjekker ${d.name} som egen stedsidentitet og historisk/naturfaglig case.`, canVerifyCoordinate: false, reason: "Identitets- og innholdskryssjekk." }],
    addressCandidates: id === "ingierstrand_bad" ? [{ address: "Ingierstrandveien 30, 1420 Svartskog", sourceProvider: "official_address", sourceObjectId: "geonorge-adresser-v1:3207:24030:30", canApplyToPlace: false }] : [],
    sourceObjectCandidates: [{ sourceProvider: c.sourceProvider, sourceObjectId: c.sourceObjectId, canApplyToPlace: true }, { sourceProvider: "manual_research", sourceObjectId: `reference:${id}`, canApplyToPlace: false }],
    geometryCandidates: c.sourceProvider === "osm" ? [{ sourceProvider: "osm", sourceObjectId: c.sourceObjectId, lat: c.lat, lon: c.lon, coordRole: c.coordRole, canApplyToPlace: true }] : [],
    coordinateCandidates: [{ lat: c.lat, lon: c.lon, coordRole: c.coordRole, sourceObjectId: c.sourceObjectId, canApplyToPlace: true }],
    decision: { canBecomeVerified: true, blockedReason: "", nextAction: "Kildeobjekt og representasjonspunkt er anvendt på canonical place i korrekt fylkessti." },
    notes: [c.coordNote, `${d.name} produseres i Akershus-sti og legges ikke i Oslo-koordinatprotokollen.`]
  };

  writeJson(file, place); writeJson(evidenceFile, evidence); appendManifest("data/places/manifest.json", entry); appendManifest("data/coordinate-evidence/manifest.json", evidenceEntry);
  produced.push({ id, name: d.name, category: d.category, municipality: d.municipality, placeManifestEntry: entry, sourceObjectId: c.sourceObjectId });
}

writeJson("reports/visitoslo-oslofjord-audit-20260721/akershus-production.json", { version: DATE, producedCount: produced.length, produced, sourceCoordinateIntake: intakePath, protocolDecision: "No Oslo coordinate-protocol rows added because all three places are physically in Akershus." });
console.log(`Produced ${produced.length} county-correct Akershus places from the VisitOSLO Oslofjord audit.`);
