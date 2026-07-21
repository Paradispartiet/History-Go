import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const intakePath = "reports/visitoslo-oslofjord-audit-20260721/coordinate-intake-final.json";
const intake = JSON.parse(readFileSync(intakePath, "utf8"));
const productionDate = "2026-07-21";
const ids = ["steilene", "langoyene", "ingierstrand_bad"];

const definitions = {
  steilene: {
    name: "Steilene",
    category: "historie",
    municipality: "Nesodden",
    year: 1837,
    r: 260,
    desc: "Øygruppe i Nesodden med Steilene fyr, sjømerkingshistorie og et kystkulturlandskap som i dag brukes til friluftsliv og formidling.",
    popupDesc: "Steilene er en liten øygruppe i indre Oslofjord, sammensatt av flere navngitte holmer og øyer. Kystverkets fyrhistorie gjør stedet til mer enn et rekreasjonsområde: Steilene fyrstasjon ble etablert i 1837 og var lenge en viktig del av navigasjonen inn mot Oslo. Fyret ble senere automatisert og avbemannet, mens selve anlegget fikk en ny rolle som kulturminne og kystledsted.\n\nI History Go skal Steilene behandles som én archipelago-level place-identitet, slik den også er representert i den eksakte OSM-relasjonen. Enkeltøyene skal ikke få nye markører bare fordi de finnes innenfor øygruppen uten en egen senere inclusion-case. Stedets kjerne er forbindelsen mellom sjøfart, fyrteknologi, endret drift og dagens bruk av et historisk kystmiljø.",
    emne_ids: ["em_his_spor_materialitet", "em_his_historiske_lag_i_byrom", "em_his_kulturminner_bevaring"],
    quiz_profile: {
      place_type: "historisk_oygruppe",
      subtype: "fyrstasjon_og_kystkultur",
      signature_features: ["Steilene fyrstasjon etablert i 1837", "øygruppe med flere separate holmer", "overgang fra bemannet fyrdrift til automatisering og kulturarvbruk"],
      primary_angles: ["fyrhistorie", "sjøfart", "teknologisk_endring", "kystkultur", "bevaring"],
      question_families: ["historisk_endring", "funksjon_og_ferdsel", "teknologi", "kulturminne", "kontrast"],
      avoid_angles: ["late_som_steilene_er_en_enkelt_oy", "udokumentert_petroleumshistorie_som_hovedfakta", "generisk_fyrquiz"],
      must_include: ["fyrstasjonen fra 1837", "øygruppen som fysisk skala", "endringen fra aktiv bemanning til kulturarvbruk"],
      contrast_targets: ["hovedoya", "heggholmen", "akershus_kaier"],
      notes: "Kystverket og andre eksterne kilder skal dominere synlig quizinnhold. Ikke skap enkeltøy-markører uten egen inclusion-case."
    },
    identitySource: {
      name: "Store norske leksikon – Steilene",
      url: "https://snl.no/Steilene",
      objectId: "snl:steilene"
    }
  },
  langoyene: {
    name: "Langøyene",
    category: "natur",
    municipality: "Nesodden",
    year: 1908,
    r: 260,
    desc: "Rekreasjonsøy i Nesodden der to tidligere øyer ble bundet sammen av Oslos avfallsfylling og senere gjennomgikk omfattende miljørehabilitering før gjenåpning.",
    popupDesc: "Langøyene er i dag ett sammenhengende frilufts- og badeområde, men dagens landform er resultatet av en dramatisk menneskeskapt historie. Nordre og Søndre Langøy ble knyttet sammen gjennom avfallsdeponering fra tidlig 1900-tall, da Oslo brukte området som fyllplass. Dermed ble selve øylandskapet formet av byens avfallsstrømmer.\n\nSenere ble forurensningen et stort miljøproblem. Området ble stengt for omfattende opprydding og rehabilitering, og ble åpnet igjen i 2022 etter store tiltak med rene masser, sikring og restaurering av friluftsområdet. History Go skal derfor behandle Langøyene primært som natur- og rekreasjonssted, men uten å skjule at naturen her er rekonstruert og forvaltet etter et langt kapittel med avfall og forurensning. Dette er et særlig tydelig eksempel på hvordan urban metabolisme kan sette fysisk form i landskapet.",
    emne_ids: ["em_natur_kyst_okosystemer", "em_his_historiske_lag_i_byrom", "em_his_spor_materialitet"],
    quiz_profile: {
      place_type: "rehabilitert_fjordoy",
      subtype: "tidligere_avfallsfylling_og_navaerende_friluftsomrade",
      signature_features: ["to tidligere øyer bundet sammen av avfallsfylling", "lang historie som kommunalt deponi", "omfattende miljørehabilitering før gjenåpning i 2022"],
      primary_angles: ["kystnatur", "miljohistorie", "avfall_og_byens_stoffstrommer", "rehabilitering", "friluftsliv"],
      question_families: ["historisk_endring", "menneske_og_natur", "miljotiltak", "materielle_spor", "kontrast"],
      avoid_angles: ["urort_natur-fortelling", "kun_badestrand", "late_som_dagens_oyform_er_naturlig"],
      must_include: ["de to opprinnelige øyene", "fyllplasshistorien", "miljørehabiliteringen og gjenåpningen"],
      contrast_targets: ["gressholmen", "rambergoya", "nakholmen"],
      notes: "Spør natur og friluftsliv gjennom dokumentert miljøhistorie. Dagens landskap må leses som et resultat av både inngrep og restaurering."
    },
    identitySource: {
      name: "Oslo byleksikon – Langøyene",
      url: "https://oslobyleksikon.no/side/Lang%C3%B8yene",
      objectId: "oslobyleksikon:langoyene"
    }
  },
  ingierstrand_bad: {
    name: "Ingierstrand bad",
    category: "historie",
    municipality: "Nordre Follo",
    year: 1934,
    r: 180,
    desc: "Funksjonalistisk badeanlegg fra 1934 ved Bunnefjorden, der landskap, stupetårn, restaurantarkitektur og offentlig rekreasjon ble planlagt som ett samlet moderne fritidsmiljø.",
    popupDesc: "Ingierstrand bad ble ferdigstilt i 1934 og er et av de tydeligste norske eksemplene på funksjonalismens møte med offentlig fritidskultur. Arkitektene Ole Lind Schistad og Eyvind Moestue formet et samlet badeanlegg der strand, terreng, stupetårn og restaurantarkitektur skulle virke sammen. Oslo kommune overtok stedet i 1936, selv om anlegget fysisk ligger i dagens Nordre Follo.\n\nEtter perioder med slitasje og endret bruk ble anlegget restaurert, og kulturminneverdiene ble formelt styrket gjennom vern. History Go-recorden representerer hele det navngitte badeanlegget, ikke bare restaurantbygningen. Derfor brukes Kartverkets eksakte SSR-objekt for `Ingierstrand bad` som områdeanker, mens den separate adressen Ingierstrandveien 30 bare er en fysisk kryssjekk for en av bygningene i komplekset.",
    emne_ids: ["em_his_spor_materialitet", "em_his_historiske_lag_i_byrom", "em_his_kulturminner_bevaring"],
    quiz_profile: {
      place_type: "historisk_badeanlegg",
      subtype: "funksjonalistisk_offentlig_rekreasjonskompleks",
      signature_features: ["ferdigstilt i 1934", "tegnet av Ole Lind Schistad og Eyvind Moestue", "samlet funksjonalistisk anlegg med strand, stupetårn og restaurant"],
      primary_angles: ["funksjonalisme", "offentlig_rekreasjon", "arkitektur_og_landskap", "bevaring", "kommunal_fritidshistorie"],
      question_families: ["arkitekturhistorie", "historisk_endring", "funksjon_og_bruk", "kulturminne", "kontrast"],
      avoid_angles: ["redusere_stedet_til_restauranten", "generisk_badeplassquiz", "forveksle_eierskap_med_fysisk_kommune"],
      must_include: ["1934-anlegget", "arkitektene", "samspillet mellom landskap og funksjonalistisk arkitektur"],
      contrast_targets: ["sorenga_sjobad", "bygdoy_huk", "langoyene"],
      notes: "Hele badeanlegget er canonical identitet. Restaurantadressen er ikke place-identiteten og skal ikke drive spørsmål alene."
    },
    identitySource: {
      name: "Oslo byleksikon – Ingierstrand bad",
      url: "https://oslobyleksikon.no/side/Ingierstrand_bad",
      objectId: "oslobyleksikon:ingierstrand-bad"
    }
  }
};

const inputById = new Map((intake.candidates ?? []).map((row) => [row.placeId, row]));
const indexRaw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const currentPlaces = Array.isArray(indexRaw) ? indexRaw : indexRaw.places ?? [];
for (const id of ids) {
  if (currentPlaces.some((place) => place.id === id)) throw new Error(`Canonical id ${id} already exists on current main; refusing duplicate production.`);
  if (!inputById.has(id)) throw new Error(`Missing merged coordinate intake for ${id}.`);
}

function manifestEntryFor(id, category) {
  return `places/${category}/akershus/${id}.json`;
}
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

const produced = [];
for (const id of ids) {
  const definition = definitions[id];
  const intakeRow = inputById.get(id);
  if (definition.category !== intakeRow.productionCategory) throw new Error(`Category mismatch for ${id}.`);
  const c = intakeRow.coordinate;
  const placeManifestEntry = manifestEntryFor(id, definition.category);
  const placeFile = path.join("data", placeManifestEntry);
  const evidenceManifestEntry = `akershus/${definition.category}/${id}.json`;
  const evidenceFile = path.join("data", "coordinate-evidence", evidenceManifestEntry);
  if (existsSync(placeFile) || existsSync(evidenceFile)) throw new Error(`Output already exists for ${id}.`);

  const place = {
    id,
    name: definition.name,
    lat: c.lat,
    lon: c.lon,
    r: definition.r,
    category: definition.category,
    year: definition.year,
    municipality: definition.municipality,
    desc: definition.desc,
    popupDesc: definition.popupDesc,
    emne_ids: definition.emne_ids,
    quiz_profile: definition.quiz_profile,
    locatorType: c.locatorType,
    sourceProvider: c.sourceProvider,
    sourceObjectId: c.sourceObjectId,
    geocodeAccuracy: c.geocodeAccuracy,
    coordRole: c.coordRole,
    coordType: c.coordType,
    coordStatus: c.coordStatus,
    coordSource: c.coordSource,
    coordSourceId: c.coordSourceId,
    coordSourceUrl: c.coordSourceUrl,
    coordVerifiedAt: productionDate,
    coordNote: c.coordNote,
    externalLinks: [
      {
        type: "reference",
        label: definition.identitySource.name,
        url: definition.identitySource.url,
        lang: "nb",
        verifiedAt: productionDate
      },
      {
        type: "coordinate_source",
        label: c.sourceProvider === "osm" ? `OpenStreetMap – ${definition.name}` : `Kartverket SSR – ${definition.name}`,
        url: c.coordSourceUrl,
        lang: "nb",
        verifiedAt: productionDate
      }
    ]
  };

  const evidence = {
    schemaVersion: "1.0",
    placeId: id,
    placeFile,
    evidenceStatus: "applied_to_place",
    coordinateDecision: "do_not_change_coordinates_yet",
    currentCoordinate: {
      lat: c.lat,
      lon: c.lon,
      r: definition.r,
      coordStatus: c.coordStatus,
      coordSource: c.coordSource,
      coordType: c.coordType,
      coordNote: c.coordNote
    },
    identity: {
      currentName: definition.name,
      resolvedIdentity: `${definition.name} som egen fysisk stedsidentitet i ${definition.municipality}, Akershus`,
      identityStatus: "resolved",
      identityProblem: "",
      locatorTypeCandidate: c.locatorType,
      requiresSplit: false,
      splitReason: ""
    },
    requiredEvidence: [
      c.sourceProvider === "osm" ? "eksakt navngitt fysisk OSM-objekt/geometri" : "eksakt aktiv Kartverket SSR-identitet med riktig navneobjekttype",
      "uavhengig identitets- og historiekryssjekk",
      "canonical identitetskontroll mot current main",
      "fylkes- og kommuneplassering kontrollert uavhengig av VisitOSLO-kildens markedsområde"
    ],
    evidence: [
      {
        sourceProvider: c.sourceProvider,
        sourceName: c.coordSource,
        sourceUrl: c.coordSourceUrl,
        sourceObjectId: c.sourceObjectId,
        sourceQuality: c.sourceProvider === "osm" ? "exact_named_semantic_object" : "official_named_place_registry",
        finding: c.coordNote,
        canVerifyCoordinate: true,
        reason: "Den lukkede Oslofjord-intaken godkjente kildeobjektet uten nearest/first-hit og uten canonical identitetsduplikat."
      },
      {
        sourceProvider: "manual_research",
        sourceName: definition.identitySource.name,
        sourceUrl: definition.identitySource.url,
        sourceObjectId: definition.identitySource.objectId,
        sourceQuality: "independent_identity_crosscheck",
        finding: `Uavhengig referansekilde kryssjekker ${definition.name} og den historiske/fysiske place-identiteten som produseres.`,
        canVerifyCoordinate: false,
        reason: "Identitets- og innholdskryssjekk; koordinaten kommer fra det låste kartobjektet."
      }
    ],
    addressCandidates: id === "ingierstrand_bad" ? [
      {
        address: "Ingierstrandveien 30, 1420 Svartskog",
        sourceProvider: "official_address",
        sourceObjectId: "geonorge-adresser-v1:3207:24030:30",
        canApplyToPlace: false
      }
    ] : [],
    sourceObjectCandidates: [
      { sourceProvider: c.sourceProvider, sourceObjectId: c.sourceObjectId, canApplyToPlace: true },
      { sourceProvider: "manual_research", sourceObjectId: definition.identitySource.objectId, canApplyToPlace: false }
    ],
    geometryCandidates: c.sourceProvider === "osm" ? [
      { sourceProvider: "osm", sourceObjectId: c.sourceObjectId, lat: c.lat, lon: c.lon, coordRole: c.coordRole, canApplyToPlace: true }
    ] : [],
    coordinateCandidates: [
      { lat: c.lat, lon: c.lon, coordRole: c.coordRole, sourceObjectId: c.sourceObjectId, canApplyToPlace: true }
    ],
    decision: {
      canBecomeVerified: true,
      blockedReason: "",
      nextAction: "Kildeobjekt og representasjonspunkt er anvendt på canonical place i korrekt fylkessti."
    },
    notes: [
      c.coordNote,
      `${definition.name} ligger fysisk i ${definition.municipality}, Akershus, og produseres derfor ikke i Oslo-sti eller Oslo-koordinatprotokoll.`
    ]
  };

  writeJson(placeFile, place);
  writeJson(evidenceFile, evidence);
  appendManifest("data/places/manifest.json", placeManifestEntry);
  appendManifest("data/coordinate-evidence/manifest.json", evidenceManifestEntry);
  produced.push({ id, name: definition.name, category: definition.category, municipality: definition.municipality, placeManifestEntry, evidenceManifestEntry, sourceObjectId: c.sourceObjectId });
}

writeJson("reports/visitoslo-oslofjord-audit-20260721/akershus-production.json", {
  version: productionDate,
  producedCount: produced.length,
  produced,
  sourceCoordinateIntake: intakePath,
  protocolDecision: "No Oslo coordinate-protocol rows added because all three places are physically in Akershus."
});

console.log(`Produced ${produced.length} VisitOSLO Oslofjord candidates in county-correct Akershus paths.`);
for (const row of produced) console.log(`${row.id}: ${row.placeManifestEntry} | ${row.sourceObjectId}`);
