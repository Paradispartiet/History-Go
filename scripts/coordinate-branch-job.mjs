import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const DATE = "2026-07-21";
const intakePath = "reports/visitoslo-oslofjord-audit-20260721/coordinate-intake-final.json";
const intake = JSON.parse(readFileSync(intakePath, "utf8"));
const input = new Map((intake.candidates ?? []).map((row) => [row.placeId, row]));

const defs = {
  heggholmen: {
    name: "Heggholmen", category: "historie", year: 1876, r: 90,
    desc: "Fjordøy med Heggholmen fyr, industrispor og bebyggelse som viser hvordan sjømerking, produksjon og vern har lagt seg som historiske lag i samme landskap.",
    popupDesc: "Heggholmen er i dag fysisk sammenvokst med Gressholmen og Rambergøya, men har en egen historisk identitet. Dagens fyrbygning fra 1876 er et viktig spor etter sjømerking og ferdsel i indre Oslofjord. På 1900-tallet fikk øya også industribruk, med fabrikkmiljø, brygge og boliger knyttet til virksomheten. History Go behandler Heggholmen som eget historisk sted, ikke som samlemarkør for hele øysystemet.",
    emne_ids: ["em_his_spor_materialitet", "em_his_historiske_lag_i_byrom", "em_his_kulturminner_bevaring"],
    type: "historisk_fjordoy", subtype: "fyr_og_industrimiljo", signature: ["Heggholmen fyr", "industrispor", "egen navngitt øyidentitet i et sammenvokst landskap"], angles: ["fyrhistorie", "industrihistorie", "materielle_spor", "vern"], avoid: ["slå_sammen_med_gressholmen", "generisk_fyrhistorie"], must: ["fyrbygningen fra 1876", "industrisporene", "den endrede fysiske øyformen"], contrasts: ["gressholmen", "rambergoya"]
  },
  rambergoya: {
    name: "Rambergøya", category: "natur", year: 2008, r: 100,
    desc: "Vernet fjordnatur der strand, vegetasjon og fugleliv møter spor etter lang bruk som skytebane og senere miljøforvaltning.",
    popupDesc: "Rambergøya er en egen navngitt del av det sammenvokste Gressholmen-systemet. Naturverdiene er i dag sentrale, men landskapet er ikke urørt: Gressholmen og Rambergøya ble brukt som skytebane fra 1800-tallet og langt inn på 1900-tallet. Senere forvaltning har måttet håndtere forurensning og andre spor etter denne bruken. Recorden skal derfor lese vern og natur gjennom stedets konkrete brukshistorie.",
    emne_ids: ["em_natur_kyst_okosystemer", "em_natur_arter_habitat_mangfold", "em_his_historiske_lag_i_byrom"],
    type: "vernet_fjordoy", subtype: "kystnatur_med_tidligere_skytebane", signature: ["vernet fjordnatur", "tidligere skytebane", "menneskepåvirket landskap"], angles: ["kystnatur", "naturvern", "menneskepavirkning", "miljoforvaltning"], avoid: ["urort_natur-fortelling", "forveksle_med_gressholmen"], must: ["skytebanehistorien", "naturvernet", "egen stedsidentitet"], contrasts: ["gressholmen", "heggholmen"]
  },
  ormoya: {
    name: "Ormøya", category: "by", year: 1875, period: "1870-årene – bro og boligvekst", r: 180,
    desc: "Bebodd fjordøy der broforbindelse, sommervillaer og senere helårsboliger gjorde et utfartssted til et særegent småskala boligmiljø.",
    popupDesc: "Ormøya gikk fra å være et attraktivt utfarts- og sommersted til å bli en tydeligere del av den vanlige byen. Broforbindelsen i 1870-årene gjorde boligbygging og helårsbruk lettere, og øya fikk et særpreget villamiljø. Ormøy kirke og senere forbindelsen mot Malmøya la nye institusjonelle og infrastrukturelle lag til stedet. History Go behandler Ormøya som egen boligøy og holder Malmøya separat.",
    emne_ids: ["em_by_boligstruktur", "em_by_historiske_lag_i_hverdagsrom", "em_by_byidealer_og_plantradisjoner"],
    type: "boligoy", subtype: "brokoblet_villaoy", signature: ["broforbindelse fra 1870-årene", "eldre villa- og sommerstedskarakter", "egen boligøyidentitet"], angles: ["boligstruktur", "infrastruktur", "villaarkitektur", "historisk_endring"], avoid: ["slå_sammen_med_malmoya", "generisk_villastrøk"], must: ["broens betydning", "overgangen fra sommersted til boligøy"], contrasts: ["malmoya", "ulvoya", "nakholmen"]
  },
  malmoya: {
    name: "Malmøya", category: "natur", year: 1965, r: 260,
    desc: "Fjordøy med kalkrik geologi og vernede naturområder, samtidig preget av tidligere kalk- og sementvirksomhet, sommerhus og senere helårs bosetting.",
    popupDesc: "Malmøya kombinerer særpreget kalkgrunn, vernede naturområder og en tydelig brukshistorie. Kalk- og sementrelatert virksomhet satte spor på 1800-tallet, og senere kom sommerhus og helårsboliger. Broforbindelsen fra 1965 knyttet Malmøya tettere til Ormøya og fastlandet. I History Go er natur og geologi hovedinngangen, mens industri og bosetting forklarer hvordan øya også er et menneskepåvirket landskap.",
    emne_ids: ["em_natur_kyst_okosystemer", "em_natur_arter_habitat_mangfold", "em_his_historiske_lag_i_byrom"],
    type: "fjordoy_med_verneomrader", subtype: "kalkrik_kystnatur_med_brukshistorie", signature: ["kalkrik geologi", "vernede naturområder", "spor etter industri og bosetting"], angles: ["geologi", "kystnatur", "naturvern", "industrihistorie"], avoid: ["slå_sammen_med_ormoya", "redusere_til_solvikbukta"], must: ["kalkgrunnlaget", "naturvernet", "menneskelig bruk"], contrasts: ["ormoya", "rambergoya", "bleikoya"]
  },
  nakholmen: {
    name: "Nakholmen", category: "by", year: 1920, period: "1920-årene – hyttekoloni", r: 180,
    desc: "Hytteøy der organisert sesongbosetting fra mellomkrigstiden skapte et tett, regulert og bynært boligmiljø uten vanlig helårsbebyggelse.",
    popupDesc: "Fra 1920-årene vokste det fram en organisert hyttekoloni på Nakholmen. Små fritidsboliger, felles regler, fergeforbindelse og en sterk sesongrytme gjorde øya til en særskilt form for bynært boligmiljø. Samtidig har deler av øya vernede naturverdier. History Go behandler Nakholmen primært som hytteøy og boligform, ikke som en vanlig helårsbydel eller en generisk naturøy.",
    emne_ids: ["em_by_boligstruktur", "em_by_historiske_lag_i_hverdagsrom", "em_by_byidealer_og_plantradisjoner"],
    type: "hytteoy", subtype: "organisert_sesongbosetting", signature: ["hyttekoloni fra 1920-årene", "sesongbasert boligmiljø", "fergekoblet øysamfunn"], angles: ["boligstruktur", "sesongbosetting", "fritidskultur", "regulering"], avoid: ["generisk_hytteidyll", "late_som_helars_boligomrade"], must: ["hyttekolonien", "sesongrytmen", "forholdet til Oslo som by"], contrasts: ["lindoya", "ormoya", "ulvoya"]
  },
  lindoya: {
    name: "Lindøya", category: "by", year: 1923, r: 220,
    desc: "Hytteøy med tett sommerbebyggelse, særpreget farge- og byggekontroll og et sesongbasert boligmiljø midt i indre Oslofjord.",
    popupDesc: "Lindøya fikk omfattende hyttebebyggelse fra 1920-årene. Små hytter, tydelige farger og regler for bebyggelsen skapte et planlagt og gjenkjennelig sommermiljø. Samtidig ligger hyttekolonien tett på vernede naturverdier. History Go behandler Lindøya som en særegen sesongbasert bolig- og byform, med naturvernet som et viktig side- og konfliktlag.",
    emne_ids: ["em_by_boligstruktur", "em_by_historiske_lag_i_hverdagsrom", "em_by_byidealer_og_plantradisjoner"],
    type: "hytteoy", subtype: "regulert_sommerkoloni", signature: ["stor hyttekoloni fra 1920-årene", "regulert farge- og byggeskikk", "sesongbasert øysamfunn"], angles: ["boligstruktur", "arkitektur_og_regulering", "sesongbosetting", "vern_og_bruk"], avoid: ["generisk_hytteoy", "bare_fargequiz"], must: ["hytteveksten", "den regulerte visuelle karakteren", "sesongbosettingen"], contrasts: ["nakholmen", "ormoya", "ulvoya"]
  },
  bleikoya: {
    name: "Bleikøya", category: "natur", year: 1885, r: 180,
    desc: "Liten fjordøy med vernet natur, strandenger og fugleliv, men også sterke historiske lag knyttet til barnesanatorium, gårdsdrift og hyttebebyggelse.",
    popupDesc: "Bleikøya har et sårbart øylandskap der naturvern er hovedinngangen. Samtidig bærer stedet tydelige historiske lag: fra 1885 lå det et kystsanatorium for barn her, og senere kom hyttebebyggelse. Den eldre gården er også en del av kulturhistorien. History Go skal vise hvordan et lite naturområde kan romme både institusjonshistorie, bosetting og vern uten å redusere øya til ett enkelt delområde.",
    emne_ids: ["em_natur_kyst_okosystemer", "em_natur_arter_habitat_mangfold", "em_his_historiske_lag_i_byrom"],
    type: "vernet_fjordoy", subtype: "kystnatur_med_sosialhistoriske_lag", signature: ["vernet øynatur", "tidligere barnesanatorium", "senere hyttebebyggelse"], angles: ["kystnatur", "naturvern", "sosialhistorie", "historiske_lag"], avoid: ["redusere_til_bleikoykalven", "kun_hyttehistorie"], must: ["naturvernet", "sanatoriumshistorien", "bosettingshistorien"], contrasts: ["malmoya", "rambergoya", "lindoya"]
  },
  ulvoya: {
    name: "Ulvøya", category: "by", year: 1935, r: 220,
    desc: "Helårsbebodd villaøy der broforbindelse og systematisk tomtedeling gjorde et fjordlandskap til et tydelig boligområde.",
    popupDesc: "Ulvøya ble knyttet til fastlandet med bro i 1928, og fra 1935 ble store deler av øya delt opp i villatomter. Dermed utviklet øya seg annerledes enn de klassiske hytteøyene: her vokste det fram et helårsbebodd boligområde med villaer og daglig forbindelse til resten av byen. Sydstranda og vernede naturverdier er viktige lag, men den primære History Go-lesningen er infrastrukturdrevet bolig- og byutvikling.",
    emne_ids: ["em_by_boligstruktur", "em_by_historiske_lag_i_hverdagsrom", "em_by_byidealer_og_plantradisjoner"],
    type: "boligoy", subtype: "brokoblet_villaomrade", signature: ["fastlandsbro fra 1928", "villautbygging fra 1930-årene", "helårsbebodd øy"], angles: ["boligstruktur", "infrastruktur", "eiendomsutvikling", "villaomrade"], avoid: ["generisk_villastrøk", "forveksle_med_hytteoyene"], must: ["broens betydning", "tomtedelingen", "forskjellen fra sesongbaserte hytteøyer"], contrasts: ["ormoya", "nakholmen", "lindoya"]
  }
};

const ids = Object.keys(defs);
const indexRaw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const currentPlaces = Array.isArray(indexRaw) ? indexRaw : indexRaw.places ?? [];
for (const id of ids) {
  if (currentPlaces.some((place) => place.id === id)) throw new Error(`${id} already exists on current main.`);
  if (!input.get(id)?.coordinate) throw new Error(`Missing locked coordinate intake for ${id}.`);
}

function placeEntry(id, category) {
  if (category === "by") return `places/by/oslo/places/${id}.json`;
  if (category === "historie") return `places/historie/oslo/places_historie/${id}.json`;
  return `places/natur/oslo/${id}.json`;
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
function refUrl(id) {
  return `https://oslobyleksikon.no/side/${encodeURIComponent(defs[id].name)}`;
}

const produced = [];
for (const id of ids) {
  const d = defs[id];
  const locked = input.get(id);
  if (locked.productionCategory !== d.category) throw new Error(`Category mismatch for ${id}.`);
  const c = locked.coordinate;
  const entry = placeEntry(id, d.category);
  const file = path.join("data", entry);
  const evidenceEntry = `oslo/${d.category}/${id}.json`;
  const evidenceFile = path.join("data", "coordinate-evidence", evidenceEntry);
  if (existsSync(file) || existsSync(evidenceFile)) throw new Error(`Output already exists for ${id}.`);

  const place = {
    id, name: d.name, lat: c.lat, lon: c.lon, r: d.r, category: d.category, year: d.year,
    ...(d.period ? { period: d.period } : {}),
    desc: d.desc, popupDesc: d.popupDesc, emne_ids: d.emne_ids,
    quiz_profile: {
      place_type: d.type,
      subtype: d.subtype,
      signature_features: d.signature,
      primary_angles: d.angles,
      question_families: ["historisk_endring", "sted_og_materialitet", "bruk_og_funksjon", "kontrast"],
      avoid_angles: d.avoid,
      must_include: d.must,
      contrast_targets: d.contrasts,
      notes: "Eksterne stedskilder skal dominere synlig quizinnhold; canonical emner brukes som faglig styring, ikke som erstatning for kildebelegg."
    },
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
    coordVerifiedAt: DATE,
    coordNote: c.coordNote,
    externalLinks: [
      { type: "reference", label: `Oslo byleksikon – ${d.name}`, url: refUrl(id), lang: "nb", verifiedAt: DATE },
      { type: "coordinate_source", label: c.sourceProvider === "osm" ? `OpenStreetMap – ${d.name}` : `Kartverket SSR – ${d.name}`, url: c.coordSourceUrl, lang: "nb", verifiedAt: DATE }
    ]
  };

  const evidence = {
    schemaVersion: "1.0",
    placeId: id,
    placeFile: file,
    evidenceStatus: "applied_to_place",
    coordinateDecision: "do_not_change_coordinates_yet",
    currentCoordinate: { lat: c.lat, lon: c.lon, r: d.r, coordStatus: c.coordStatus, coordSource: c.coordSource, coordType: c.coordType, coordNote: c.coordNote },
    identity: { currentName: d.name, resolvedIdentity: `${d.name} som egen navngitt fysisk stedsidentitet`, identityStatus: "resolved", identityProblem: "", locatorTypeCandidate: c.locatorType, requiresSplit: false, splitReason: "" },
    requiredEvidence: [c.sourceProvider === "osm" ? "eksakt navngitt fysisk OSM-objekt" : "eksakt aktiv Kartverket SSR-identitet", "uavhengig identitetskryssjekk", "canonical duplikatkontroll mot current main"],
    evidence: [
      { sourceProvider: c.sourceProvider, sourceName: c.coordSource, sourceUrl: c.coordSourceUrl, sourceObjectId: c.sourceObjectId, sourceQuality: c.sourceProvider === "osm" ? "exact_named_semantic_object" : "official_named_place_registry", finding: c.coordNote, canVerifyCoordinate: true, reason: "Kildeobjektet ble godkjent i den lukkede Oslofjord-intaken uten nearest/first-hit." },
      { sourceProvider: "manual_research", sourceName: `Oslo byleksikon – ${d.name}`, sourceUrl: refUrl(id), sourceObjectId: `oslobyleksikon:${id}`, sourceQuality: "independent_identity_crosscheck", finding: `Uavhengig lokalhistorisk kilde kryssjekker ${d.name} som egen stedsidentitet.`, canVerifyCoordinate: false, reason: "Identitetskryssjekk; primærkoordinaten kommer fra det låste kartobjektet." }
    ],
    addressCandidates: [],
    sourceObjectCandidates: [{ sourceProvider: c.sourceProvider, sourceObjectId: c.sourceObjectId, canApplyToPlace: true }, { sourceProvider: "manual_research", sourceObjectId: `oslobyleksikon:${id}`, canApplyToPlace: false }],
    geometryCandidates: c.sourceProvider === "osm" ? [{ sourceProvider: "osm", sourceObjectId: c.sourceObjectId, lat: c.lat, lon: c.lon, coordRole: c.coordRole, canApplyToPlace: true }] : [],
    coordinateCandidates: [{ lat: c.lat, lon: c.lon, coordRole: c.coordRole, sourceObjectId: c.sourceObjectId, canApplyToPlace: true }],
    decision: { canBecomeVerified: true, blockedReason: "", nextAction: "Kildeobjekt og representasjonspunkt er anvendt på canonical place." },
    notes: [c.coordNote, "Place-id var fraværende i current runtime index umiddelbart før produksjon."]
  };

  writeJson(file, place);
  writeJson(evidenceFile, evidence);
  appendManifest("data/places/manifest.json", entry);
  appendManifest("data/coordinate-evidence/manifest.json", evidenceEntry);
  produced.push({ id, name: d.name, category: d.category, sourceObjectId: c.sourceObjectId, coordStatus: c.coordStatus, placeManifestEntry: entry });
}

const protocolPath = "docs/coordinates/coordinate-control-protocol.md";
let protocol = readFileSync(protocolPath, "utf8");
for (const id of ids) if (protocol.includes(`\`${id}\``)) throw new Error(`${id} already exists in coordinate protocol.`);
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|\s*`[^`]+`/gm)].map((m) => Number(m[1]));
const nextBatch = Math.max(...batches) + 1;
const countMatch = protocol.match(/Oslo-tabellen inneholder nå (\d+) [^\n]*canonical steder\./);
if (!countMatch) throw new Error("Could not parse Oslo protocol count.");
const newCount = Number(countMatch[1]) + produced.length;
protocol = protocol.replace(/Oslo-tabellen inneholder nå \d+ [^\n]*canonical steder\./, `Oslo-tabellen inneholder nå ${newCount} dokumenterte verifiserte eller kildekontrollerte canonical steder. Batch ${nextBatch} legger til åtte separate Oslofjord-steder fra den lukkede VisitOSLO Oslofjorden-auditen.`);
const rows = produced.map((row) => `| ${nextBatch} | \`${row.id}\` | ${row.name} | ${row.coordStatus} | \`${row.sourceObjectId}\` |`).join("\n");
protocol = `${protocol.trimEnd()}\n\n${rows}\n\nBatch ${nextBatch} (${DATE}) produserer åtte separate Oslofjord-identiteter. Kombinerte VisitOSLO-rader er ikke kopiert som syntetiske steder: Heggholmen og Rambergøya beholdes ved siden av eksisterende \`gressholmen\`, og Ormøya og Malmøya beholdes som separate øyer. Eksakte OSM-øygeometrier brukes der de finnes; Heggholmen og Rambergøya bruker eksakte aktive Kartverket SSR-objekter med objekttype Øy i sjø. Alle åtte place-id-er ble kontrollert mot current runtime index umiddelbart før produksjon.\n`;
writeFileSync(protocolPath, protocol, "utf8");

writeJson("reports/visitoslo-oslofjord-audit-20260721/oslo-production-batch.json", { version: DATE, batch: nextBatch, producedCount: produced.length, produced, sourceCoordinateIntake: intakePath });
console.log(`Produced ${produced.length} VisitOSLO Oslofjord places as Oslo coordinate batch ${nextBatch}.`);
