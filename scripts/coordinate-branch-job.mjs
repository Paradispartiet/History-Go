import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const DATE = "2026-07-23";
const lockPath = "reports/visitoslo-parks-nature-audit-20260721/remaining-production-lock-20260723.json";
const lock = JSON.parse(readFileSync(lockPath, "utf8"));
const lockedById = new Map((lock.productionReady ?? []).map((row) => [row.placeId, row]));

const defs = {
  lillomarka: {
    name: "Lillomarka", category: "natur", r: 600,
    desc: "Skogsområde nordøst i Oslo med turveier, vann, myrer og lange historiske ferdsels- og bruksspor, samtidig en viktig del av Oslomarka for friluftsliv og naturmangfold.",
    popupDesc: "Lillomarka er et stort skogområde mellom Groruddalen, Grefsen/Kjelsås, Maridalen og Nittedal. Området er også kjent som Grefsenmarka og binder tett bebyggelse direkte til et sammenhengende skoglandskap med vann, myrer, skogsveier og stier. Oslo kommune framhever Marka som viktig for både friluftsliv, folkehelse og naturmangfold.\n\nLillomarka har samtidig tydelige historiske lag. Ved Alunsjøen finnes rester etter kobbergruvedrift fra 1700-tallet, og eldre ferdselsårer mellom Oslo og Hadeland, Valdres og Bergen gikk gjennom marka. I dag møter disse sporene moderne bruk: turer, skiløyper, markastuer, bading og naturrestaurering.\n\nHistory Go behandler Lillomarka som ett bredt navngitt skogområde. Enkeltvann, markastuer, kulturminner og utfartssteder kan være egne steder der de har selvstendig identitet, men skal ikke erstatte hele marka med ett tilfeldig startpunkt.",
    emne_ids: ["em_natur_arter_habitat_mangfold", "em_his_historiske_lag_i_byrom"],
    profile: {
      place_type: "markaomrade", subtype: "bynart_skogomrade_med_friluftsliv_og_historiske_spor",
      signature_features: ["stort navngitt skogområde i Oslo og Nittedal", "direkte overgang mellom Groruddalen og Marka", "historiske gruve- og ferdselsspor", "aktivt friluftsliv og naturforvaltning"],
      primary_angles: ["skog_og_naturmangfold", "friluftsliv", "historiske_ferdselsarer", "gruvehistorie", "by_og_markagrense"],
      question_families: ["naturgrunnlag", "historisk_bruk", "friluftsliv", "forvaltning", "kontrast"],
      avoid_angles: ["redusere_lillomarka_til_ett_utfartssted", "generisk_skogquiz", "late_som_hele_omradet_ligger_i_oslo_kommune"],
      must_include: ["Lillomarka som bredt navngitt skogområde", "forholdet mellom byen og Marka", "minst ett dokumentert historisk bruksspor"],
      contrast_targets: ["sognsvann", "maridalsvannet", "romsas"]
    },
    links: [
      ["official", "Oslo kommune – Marka", "https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/marka/"],
      ["reference", "Store norske leksikon – Lillomarka", "https://snl.no/Lillomarka"]
    ]
  },
  grorudparken: {
    name: "Grorudparken", category: "by", r: 240,
    desc: "Sammenhengende parklandskap langs Alna fra Grorud sentrum mot Hølaløkka, med rekreasjonsområder og Groruddammen som del av en blågrønn forbindelse gjennom bydelen.",
    popupDesc: "Grorudparken følger Alnaelva fra Grorud sentrum mot Hølaløkka og fungerer som en sammenhengende grønn forbindelse gjennom et ellers tett utbygd område. Oslo kommune beskriver parken med rekreasjonsområder, piknikmuligheter og Groruddammen som en del av det større parklandskapet.\n\nStedet er derfor mer enn en enkelt plen eller dam. Parken kobler boligområder, sentrum, idrettsanlegg og turveier sammen og gir Alna en synlig rolle i hverdagsbyen. Den viser hvordan parker kan fungere som sosial infrastruktur samtidig som de organiserer bevegelse og blågrønne forbindelser.\n\nHistory Go behandler Grorudparken som den navngitte parkhelheten. `groruddammen` beholdes som et eget vann- og rekreasjonssted innenfor den bredere parken.",
    emne_ids: ["em_by_parker_som_sosial_infrastruktur", "em_by_offentlige_rom_motesteder", "em_by_historiske_lag_i_hverdagsrom"],
    profile: {
      place_type: "bypark", subtype: "lineaer_elvenar_park_og_moteplass",
      signature_features: ["park langs Alnaelva", "kobler Grorud sentrum og Hølaløkka", "Groruddammen ligger innenfor den bredere parkhelheten", "rekreasjon og møteplasser i et blågrønt byrom"],
      primary_angles: ["park_som_sosial_infrastruktur", "elv_og_byutvikling", "moteplasser", "gangforbindelser", "blagronn_struktur"],
      question_families: ["byrom_og_bruk", "forbindelser", "natur_i_byen", "stedlig_hierarki", "kontrast"],
      avoid_angles: ["slå_sammen_med_groruddammen", "generisk_parkquiz", "forveksle_med_hele_grorud_bydel"],
      must_include: ["Alnaelva", "parkens sammenhengende funksjon", "Groruddammen som delsted snarere enn synonym"],
      contrast_targets: ["groruddammen", "alnaelva", "frognerparken"]
    },
    links: [["official", "Oslo kommune – Grorudparken", "https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/grorudparken/"]]
  },
  aamot_bru: {
    name: "Åmot bru", category: "historie", year: 1851, r: 45,
    desc: "Historisk jernhengebro fra 1851, opprinnelig reist ved Åmotsund og senere flyttet til Akerselva, der den fortsatt viser tidlig norsk bro- og industrikonstruksjon.",
    popupDesc: "Åmot bru er en historisk jernhengebro fra 1851. Den ble opprinnelig reist ved Åmotsund i Modum og ble senere flyttet til Oslo og satt opp over Akerselva i 1957. Dermed har selve konstruksjonen fått to geografiske liv: først som transportinfrastruktur ved et industristed, senere som kulturminne langs Oslos viktigste industrivassdrag.\n\nBrua er interessant fordi materialet og konstruksjonen fortsatt kan leses direkte på stedet. Den viser en tidlig fase i bruken av jern i større norske brokonstruksjoner og er samtidig et eksempel på at kulturminner kan flyttes og få ny betydning i et annet landskap.\n\nHistory Go behandler selve brua som canonical identitet. Akerselva, nærliggende industristeder og turveier er egne steder og sammenhenger, ikke en erstatning for broobjektet.",
    emne_ids: ["em_his_spor_materialitet", "em_his_historiske_lag_i_byrom", "em_his_kulturminner_bevaring"],
    profile: {
      place_type: "historisk_bru", subtype: "flyttet_jernhengebro_fra_1800_tallet",
      signature_features: ["jernhengebro fra 1851", "opprinnelig reist ved Åmotsund", "flyttet til Akerselva i 1957", "konstruksjonen er et synlig teknologihistorisk spor"],
      primary_angles: ["brohistorie", "materialitet", "teknologihistorie", "flytting_av_kulturminner", "industri_og_ferdsel"],
      question_families: ["historisk_endring", "konstruksjon_og_materiale", "stedsskifte", "kulturminne", "kontrast"],
      avoid_angles: ["generisk_akerselvaquiz", "late_som_brua_alltid_har_statt_i_oslo", "forveksle_med_nyere_hengebruer"],
      must_include: ["1851", "flyttingen til Akerselva", "jernkonstruksjonen som synlig historisk spor"],
      contrast_targets: ["akerselva", "beierbrua", "frysja_33_brekke_kraftstasjon"]
    },
    links: [["reference", "Oslo byleksikon – Åmot bru", "https://oslobyleksikon.no/side/%C3%85mot_bru"]]
  },
  klosterenga_skulpturpark: {
    name: "Klosterenga skulpturpark", category: "kunst", year: 2023, r: 280,
    desc: "Skulpturpark i Gamle Oslo der offentlig kunst, stein, vann og den gjenåpnede Hovinbekken er formet som ett sammenhengende park- og byutviklingsprosjekt.",
    popupDesc: "Klosterenga er en skulpturpark der kunst, vann og grønt byrom er bygget sammen til én helhet. Kunstprosjektet startet på 1990-tallet med Bård Breiviks visjon og ble senere fullført av blant andre Kristian Blystad og Jørn Skaare. Sommeren 2023 ble Hovinbekken gjenåpnet gjennom parken, og bekken inngår i en om lag 700 meter lang kunstnerisk vannstruktur.\n\nOslo kommune beskriver satsingen som den største kommunale enkeltsatsingen på et kunstprosjekt siden Vigelandsparken. Samtidig er parken et hverdagsrom med turveier, sitteplasser og møteplasser. Historien om området går videre tilbake til middelalderbyen, jordbruk og senere tett byvekst.\n\nHistory Go behandler hele kunst-, vann- og parklandskapet som canonical sted. Enkeltverk og vannskulpturer kan være innholdslag eller egne public-art-objekter der det finnes en selvstendig inclusion-case, men skal ikke erstatte parkhelheten.",
    emne_ids: ["em_by_parker_som_sosial_infrastruktur", "em_by_materialitet_og_sanseerfaring", "em_kunst_institusjonskritikk_og_representasjon"],
    profile: {
      place_type: "skulpturpark", subtype: "offentlig_kunst_vann_og_bypark",
      signature_features: ["Bård Breiviks skulpturparkvisjon fra 1990-tallet", "Hovinbekken åpnet gjennom parken i 2023", "omfattende bruk av stein og vann som kunstnerisk landskap", "offentlig park og kunstverk i samme helhet"],
      primary_angles: ["kunst_i_offentlig_rom", "landskap_og_materialitet", "bekkeapning", "byutvikling", "moteplass"],
      question_families: ["kunst_og_sted", "materialitet", "historisk_endring", "naturbasert_byutvikling", "kontrast"],
      avoid_angles: ["redusere_parken_til_ett_kunstverk", "generisk_skulpturquiz", "late_som_hovinbekken_alltid_har_vaert_apen"],
      must_include: ["kunst og vann som integrert helhet", "prosjektets lange utviklingsløp", "gjenåpningen av Hovinbekken"],
      contrast_targets: ["vigelandsanlegget", "ekebergparken", "middelalderparken"]
    },
    links: [["official", "Oslo kommune – Klosterenga park", "https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/klosterenga-park"]]
  },
  peer_gynt_parken: {
    name: "Peer Gynt-parken", category: "kunst", r: 160,
    desc: "Skulpturpark på Løren der internasjonale kunstnere tolker Henrik Ibsens Peer Gynt i et åpent hverdagslandskap midt i et moderne boligområde.",
    popupDesc: "Peer Gynt-parken på Løren er en offentlig skulpturpark inspirert av Henrik Ibsens dramatiske dikt `Peer Gynt`. Kunstnere fra flere land har tolket figurer, scener og temaer fra verket, slik at besøkende kan bevege seg gjennom en litterær fortelling i fysisk form.\n\nParken er samtidig en del av et moderne boligområde. Den viser hvordan kunst kan bygges inn i hverdagsbyen utenfor museer og tradisjonelle gallerier, og hvordan et kanonisk litterært verk stadig kan tolkes på nytt av ulike kunstnere og publikum. Den tidligere militære Løren-leiren og den omfattende boligbyggingen rundt parken gir også stedet et tydelig byutviklingslag.\n\nHistory Go behandler den samlede skulpturparken som canonical identitet. Enkeltverkene er kunst- og quizlag og skal bare få egne place-markører dersom den separate public-art-modellen dokumenterer en selvstendig fysisk inclusion-case.",
    emne_ids: ["em_by_parker_som_sosial_infrastruktur", "em_by_materialitet_og_sanseerfaring", "em_kunst_institusjonskritikk_og_representasjon"],
    profile: {
      place_type: "skulpturpark", subtype: "litteraer_offentlig_kunstpark_i_boligomrade",
      signature_features: ["skulpturer inspirert av Peer Gynt", "internasjonale kunstneriske tolkninger", "åpen park midt i Løren boligområde", "kobler litteratur, skulptur og hverdagslandskap"],
      primary_angles: ["litteratur_og_billedkunst", "kunst_i_offentlig_rom", "tolkning_og_representasjon", "kunst_og_boligby", "hverdagskultur"],
      question_families: ["kunst_og_litteratur", "tolkning", "offentlig_rom", "byutvikling", "kontrast"],
      avoid_angles: ["redusere_parken_til_ett_peer_gynt-sitat", "late_som_alle_verk_har_samme_kunstner", "opprette_duplikatmarkorer_for_hvert_verk_uten_egen_gate"],
      must_include: ["Peer Gynt som felles litteraert utgangspunkt", "kunstnere fra flere land", "parken som del av hverdagsbyen på Løren"],
      contrast_targets: ["klosterenga_skulpturpark", "vigelandsanlegget", "ekebergparken"]
    },
    links: [["official", "Peer Gynt-parken", "https://www.peergyntparken.no/"]]
  }
};

const ids = Object.keys(defs);
const indexRaw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const current = Array.isArray(indexRaw) ? indexRaw : indexRaw.places ?? [];
for (const id of ids) {
  const locked = lockedById.get(id);
  if (!locked) throw new Error(`Missing clean production lock for ${id}.`);
  if (current.some((p) => p.id === id || String(p.name ?? "").toLowerCase() === String(defs[id].name).toLowerCase())) throw new Error(`${id} already exists on current main.`);
}

function placeEntry(id, category) {
  if (category === "by") return `places/by/oslo/${id}.json`;
  if (category === "natur") return `places/natur/oslo/${id}.json`;
  if (category === "kunst") return `places/kunst/oslo/places_kunst/${id}.json`;
  return `places/historie/oslo/places_historie/${id}.json`;
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
  const d = defs[id];
  const locked = lockedById.get(id);
  if (locked.primaryCategory !== d.category) throw new Error(`Category lock mismatch for ${id}.`);
  const c = locked.coordinate;
  const entry = placeEntry(id, d.category);
  const file = `data/${entry}`;
  const evidenceEntry = `oslo/${d.category}/${id}.json`;
  const evidenceFile = `data/coordinate-evidence/${evidenceEntry}`;
  if (existsSync(file) || existsSync(evidenceFile)) throw new Error(`Output already exists for ${id}.`);

  const externalLinks = d.links.map(([type,label,url]) => ({ type, label, url, lang: "nb", verifiedAt: DATE }));
  externalLinks.push({ type: "coordinate_source", label: `${d.name} – OpenStreetMap`, url: c.coordSourceUrl, lang: "nb", verifiedAt: DATE });

  writeJson(file, {
    id,
    name: d.name,
    lat: c.lat,
    lon: c.lon,
    r: d.r,
    category: d.category,
    ...(d.year ? { year: d.year } : {}),
    desc: d.desc,
    popupDesc: d.popupDesc,
    emne_ids: d.emne_ids,
    quiz_profile: d.profile,
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
    externalLinks
  });

  writeJson(evidenceFile, {
    schemaVersion: "1.0",
    placeId: id,
    placeFile: file,
    evidenceStatus: "applied_to_place",
    coordinateDecision: "do_not_change_coordinates_yet",
    currentCoordinate: { lat: c.lat, lon: c.lon, r: d.r, coordStatus: c.coordStatus, coordSource: c.coordSource, coordType: c.coordType, coordNote: c.coordNote },
    identity: { currentName: d.name, resolvedIdentity: locked.representationLock, identityStatus: "resolved", identityProblem: "", locatorTypeCandidate: c.locatorType, requiresSplit: false, splitReason: "" },
    requiredEvidence: ["eksakt navngitt OSM-objekt fra låst intake", "current-main canonical duplikatkontroll", "uavhengig stedlig eller institusjonell identitetskryssjekk"],
    evidence: [
      { sourceProvider: "osm", sourceName: c.coordSource, sourceUrl: c.coordSourceUrl, sourceObjectId: c.sourceObjectId, sourceQuality: "exact_named_semantic_object", finding: c.coordNote, canVerifyCoordinate: true, reason: "Eksakt objekt-ID fra intake PR #3146 ble revalidert i PR #3484 og låst i PR #3488." },
      { sourceProvider: "manual_research", sourceName: d.links[0][1], sourceUrl: d.links[0][2], sourceObjectId: `reference:${id}`, sourceQuality: "independent_identity_crosscheck", finding: locked.sourceBasis.join(" "), canVerifyCoordinate: false, reason: "Identitets-, historie- og scope-kryssjekk." }
    ],
    addressCandidates: [],
    sourceObjectCandidates: [{ sourceProvider: "osm", sourceObjectId: c.sourceObjectId, canApplyToPlace: true }, { sourceProvider: "manual_research", sourceObjectId: `reference:${id}`, canApplyToPlace: false }],
    geometryCandidates: [{ sourceProvider: "osm", sourceObjectId: c.sourceObjectId, lat: c.lat, lon: c.lon, coordRole: c.coordRole, canApplyToPlace: true }],
    coordinateCandidates: [{ lat: c.lat, lon: c.lon, coordRole: c.coordRole, sourceObjectId: c.sourceObjectId, canApplyToPlace: true }],
    decision: { canBecomeVerified: true, blockedReason: "", nextAction: "Det låste eksakte OSM-objektet er anvendt på canonical place." },
    notes: [c.coordNote, "Place-id og navn var fraværende i current runtime index umiddelbart før produksjon."]
  });

  appendManifest("data/places/manifest.json", entry);
  appendManifest("data/coordinate-evidence/manifest.json", evidenceEntry);
  produced.push({ id, name: d.name, category: d.category, sourceObjectId: c.sourceObjectId, coordStatus: c.coordStatus, placeManifestEntry: entry, evidenceManifestEntry: evidenceEntry });
}

const protocolPath = "docs/coordinates/coordinate-control-protocol.md";
let protocol = readFileSync(protocolPath, "utf8");
for (const id of ids) if (protocol.includes(`\`${id}\``)) throw new Error(`${id} already exists in coordinate protocol.`);
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|\s*`[^`]+`/gm)].map((m) => Number(m[1]));
if (!batches.length) throw new Error("Could not parse Oslo batches.");
const nextBatch = Math.max(...batches) + 1;
const countPattern = /Oslo-protokollen dekker nå (\d+) aktive current `verified\*` canonical Oslo-steder\./;
const countMatch = protocol.match(countPattern);
if (!countMatch) throw new Error("Could not parse current Oslo verified count.");
const newCount = Number(countMatch[1]) + produced.length;
protocol = protocol.replace(countPattern, `Oslo-protokollen dekker nå ${newCount} aktive current \`verified*\` canonical Oslo-steder.`);
const rows = produced.map((p) => `| ${nextBatch} | \`${p.id}\` | ${p.name} | ${p.coordStatus} | \`${p.sourceObjectId}\` |`).join("\n");
protocol = `${protocol.trimEnd()}\n\n${rows}\n\nBatch ${nextBatch} (${DATE}) produserer fem resterende, eksakt revaliderte steder fra den lukkede VisitOSLO parks/nature-scope-auditen: Lillomarka, Grorudparken, Åmot bru, Klosterenga skulpturpark og Peer Gynt-parken. Brekkedammen er ikke med og forblir coordinate-blocked i en separat backlogbeslutning.\n`;
writeFileSync(protocolPath, protocol, "utf8");

writeJson("reports/visitoslo-parks-nature-audit-20260721/five-place-production.json", { version: DATE, batch: nextBatch, producedCount: produced.length, produced, sourceLock: lockPath, excludedApprovedBacklog: ["brekkedammen"] });
console.log(`Produced ${produced.length} VisitOSLO parks/nature places as Oslo coordinate batch ${nextBatch}.`);
