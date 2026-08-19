import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const VERIFIED_AT = "2026-08-19";
const LANGUAGE_MANIFEST = "data/leksikon/sprak/manifest.json";
const PLACES_MANIFEST = "data/places/manifest.json";
const DOC_PATH = "docs/SPRAKLEKSIKON.md";
const TEST_PATH = "tests/place-language-dialect-scope.test.mjs";

const targets = [
  {
    id: "kristiansand",
    name: "Kristiansand",
    fylke: "agder",
    kommune: "Kristiansand",
    macroRegionId: "vestlandsk",
    localProfileId: "kristiansand_local_speech",
    dialectArea: "Kristiansand bymål",
    anchorQuery: "Kristiansand, Agder, Norway",
    anchorTokens: ["kristiansand", "agder"],
    r: 900,
    sourceLabel: "Store norske leksikon – Kristiansand",
    sourceUrl: "https://snl.no/Kristiansand",
    languagePath: "data/leksikon/sprak/places/europe/norway/agder/kristiansand/kristiansand.json",
    placePath: "data/places/by/agder/kristiansand/kristiansand.json",
    facts: [
      { text: "Kristiansand er et tettsted og byområde i Kristiansand kommune i Agder, mens kommunen også omfatter andre tettsteder og store områder utenfor den sammenhengende bybebyggelsen.", location: "Faktaboks, ingress og avsnitt om bosetning", kind: "identity" },
      { text: "SSBs avgrensning for 2025 oppgir tettstedet Kristiansand til 24,4 kvadratkilometer og om lag 67 900 innbyggere.", url: "https://snl.no/Kristiansand_-_tettsted", location: "Faktaboks og ingress", temporalStatus: "current" },
      { text: "Bysenteret i Kristiansand ligger på vestsiden av munningen av Otra, med Kvadraturen og fjorden som sentrale deler av det urbane området.", location: "Ingress og kartbeskrivelse" },
      { text: "Kristiansand er administrasjonssenter i kommunen, som strekker seg langs kysten og inn i dalførene omkring Otra, Tovdalselva og Søgneelva.", location: "Faktaboks og ingress" },
      { text: "Kristiansand kommune rommer flere tettsteder, slik at den statistiske tettstedsgrensen og kommunegrensen beskriver forskjellige geografiske nivåer.", location: "Avsnitt om bosetning" }
    ]
  },
  {
    id: "stavanger",
    name: "Stavanger",
    fylke: "rogaland",
    kommune: "Stavanger",
    macroRegionId: "vestlandsk",
    localProfileId: "stavanger_local_speech",
    dialectArea: "Stavanger bymål",
    anchorQuery: "Stavanger, Rogaland, Norway",
    anchorTokens: ["stavanger", "rogaland"],
    r: 900,
    sourceLabel: "Store norske leksikon – Stavanger",
    sourceUrl: "https://snl.no/Stavanger",
    languagePath: "data/leksikon/sprak/places/europe/norway/rogaland/stavanger/stavanger.json",
    placePath: "data/places/by/rogaland/stavanger/stavanger.json",
    facts: [
      { text: "Stavanger er by- og administrasjonssenter i Stavanger kommune i Rogaland, mens den sammenhengende bybebyggelsen inngår i tettstedet Stavanger/Sandnes på tvers av flere kommuner.", location: "Faktaboks, ingress og avsnitt om bosetning", kind: "identity" },
      { text: "SSB oppgir Stavanger/Sandnes til 80 kvadratkilometer og om lag 242 000 innbyggere i 2025.", url: "https://snl.no/Stavanger/Sandnes_-_tettstad", location: "Faktaboks og ingress", temporalStatus: "current" },
      { text: "Det sentrale byområdet ligger rundt Vågen og Breiavatnet, med eldre trehusbebyggelse og domkirken som tydelige deler av sentrum.", location: "Avsnittet Bybeskrivelse" },
      { text: "Den sammenhengende tettstedsbebyggelsen fortsetter sørover mot Sandnes og omfatter også bymessig bebyggelse i Sola og Randaberg.", url: "https://snl.no/Stavanger/Sandnes_-_tettstad", location: "Ingress og avgrensning av tettstedet" },
      { text: "Stavanger kommune er geografisk større enn det sentrale byområdet og omfatter etter kommunereformen også øyer og områder i Boknafjorden.", location: "Avsnitt om administrativ historie og geografi" }
    ]
  },
  {
    id: "voss",
    name: "Voss",
    fylke: "vestland",
    kommune: "Voss",
    macroRegionId: "vestlandsk",
    localProfileId: "voss_local_speech",
    dialectArea: "Vossamål",
    anchorQuery: "Vossavangen, Voss, Vestland, Norway",
    anchorTokens: ["voss", "vestland"],
    r: 750,
    sourceLabel: "Store norske leksikon – Vossavangen",
    sourceUrl: "https://snl.no/Vossavangen",
    languagePath: "data/leksikon/sprak/places/europe/norway/vestland/voss/voss.json",
    placePath: "data/places/by/vestland/voss/voss.json",
    facts: [
      { text: "Vossavangen, også kalt Vangen og tidligere Vossevangen, er et tettsted og administrasjonssenter i Voss kommune i Vestland.", location: "Faktaboks og ingress", kind: "identity" },
      { text: "SSBs avgrensning for 2025 oppgir Vossavangen til 4 kvadratkilometer og 7 165 innbyggere.", location: "Faktaboks", temporalStatus: "current" },
      { text: "Tettstedet ligger omkring østenden av Vangsvatnet, der jernbanestasjonen og sentrum ligger tett ved vannet.", location: "Ingress og bildebeskrivelse" },
      { text: "Voss kommune er langt større enn tettstedet Vossavangen og omfatter fjell-, dal- og bygdeområder rundt den sentrale bebyggelsen.", url: "https://snl.no/Voss", location: "Faktaboks, natur og bosetning" },
      { text: "Vossavangen fungerer som kommunens administrative sentrum, mens kommunegrensen og tettstedsgrensen beskriver ulike geografiske nivåer.", url: "https://snl.no/Voss", location: "Faktaboks og bosetning" }
    ]
  },
  {
    id: "bodo",
    name: "Bodø",
    fylke: "nordland",
    kommune: "Bodø",
    macroRegionId: "nordnorsk",
    localProfileId: "bodo_local_speech",
    dialectArea: "Bodø bymål",
    anchorQuery: "Bodø, Nordland, Norway",
    anchorTokens: ["bodø", "nordland"],
    r: 850,
    sourceLabel: "Store norske leksikon – Bodø tettsted",
    sourceUrl: "https://snl.no/Bod%C3%B8_-_tettsted",
    languagePath: "data/leksikon/sprak/places/europe/norway/nordland/bodo/bodo.json",
    placePath: "data/places/by/nordland/bodo/bodo.json",
    facts: [
      { text: "Bodø er et tettsted i Bodø kommune i Nordland og administrasjonssenter i kommunen.", location: "Faktaboks og ingress", kind: "identity" },
      { text: "SSB oppgir tettstedet Bodø til 15,1 kvadratkilometer og om lag 43 500 innbyggere i 2025.", location: "Faktaboks og ingress", temporalStatus: "current" },
      { text: "Tettstedet har vokst fra det eldre sentrum langs akser mot øst og nord på halvøya.", url: "https://snl.no/Bod%C3%B8", location: "Avsnitt om bosetning" },
      { text: "Etter bombingen under andre verdenskrig ble Bodø sentrum gjenreist med et tilnærmet rettvinklet gatenett orientert mot havnen.", location: "Ingress" },
      { text: "Bodø kommune omfatter også andre tettsteder, grender, fjord- og fjellområder og øyer utenfor den sammenhengende byen.", url: "https://snl.no/Bod%C3%B8", location: "Ingress og avsnitt om bosetning" }
    ]
  },
  {
    id: "tromso",
    name: "Tromsø",
    fylke: "troms",
    kommune: "Tromsø",
    macroRegionId: "nordnorsk",
    localProfileId: "tromso_local_speech",
    dialectArea: "Tromsø bymål",
    anchorQuery: "Tromsø, Troms, Norway",
    anchorTokens: ["tromsø", "troms"],
    r: 850,
    sourceLabel: "Store norske leksikon – Tromsø tettsted",
    sourceUrl: "https://snl.no/Troms%C3%B8_-_tettsted",
    languagePath: "data/leksikon/sprak/places/europe/norway/troms/tromso/tromso.json",
    placePath: "data/places/by/troms/tromso/tromso.json",
    facts: [
      { text: "Tromsø er et tettsted i Tromsø kommune i Troms og administrasjonssenter i kommunen.", location: "Faktaboks og ingress", kind: "identity" },
      { text: "SSB oppgir tettstedet Tromsø til 13,8 kvadratkilometer og om lag 43 400 innbyggere i 2025.", location: "Faktaboks og ingress", temporalStatus: "current" },
      { text: "Tettstedet omfatter de tettbygde områdene på Tromsøya, mens Tromsdalen og Kvaløysletta er egne tettsteder i samme kommune.", location: "Ingress og avsnitt om andre tettsteder" },
      { text: "Bysenteret ligger på den sørøstlige delen av Tromsøya, mellom Kvaløya i vest og fastlandet i øst.", url: "https://snl.no/Troms%C3%B8ya", location: "Ingress" },
      { text: "Tromsø kommune omfatter langt større områder på øyer og fastland enn det sentrale tettstedet på Tromsøya.", url: "https://snl.no/Troms%C3%B8", location: "Ingress og geografibeskrivelse" }
    ]
  },
  {
    id: "hammerfest",
    name: "Hammerfest",
    fylke: "finnmark",
    kommune: "Hammerfest",
    macroRegionId: "nordnorsk",
    localProfileId: "hammerfest_local_speech",
    dialectArea: "Hammerfest talemål",
    anchorQuery: "Hammerfest, Finnmark, Norway",
    anchorTokens: ["hammerfest", "finnmark"],
    r: 750,
    sourceLabel: "Store norske leksikon – Hammerfest tettsted",
    sourceUrl: "https://snl.no/Hammerfest_-_tettsted",
    languagePath: "data/leksikon/sprak/places/europe/norway/finnmark/hammerfest/hammerfest.json",
    placePath: "data/places/by/finnmark/hammerfest/hammerfest.json",
    facts: [
      { text: "Hammerfest er et tettsted i Hammerfest kommune i Finnmark og administrasjonssenter i kommunen.", location: "Faktaboks og ingress", kind: "identity" },
      { text: "SSB oppgir tettstedet Hammerfest til 2,8 kvadratkilometer og 8 010 innbyggere i 2025.", location: "Faktaboks og ingress", temporalStatus: "current" },
      { text: "Tettstedet ligger rundt havnebassenget, med bratte fjellsider som avgrenser bebyggelsen nær sjøen.", url: "https://snl.no/Hammerfest", location: "Avsnitt om bosetning" },
      { text: "Bebyggelsen strekker seg mot Storvannsområdet i sørøst og Fuglenes i nord, mens Rypefjord er et eget tettsted sør for byen.", url: "https://snl.no/Hammerfest", location: "Avsnitt om bosetning" },
      { text: "Gatenettet i sentrum bærer preg av gjenreisningen etter andre verdenskrig, med gater langs bukta og tverrgater mot sjøen.", url: "https://snl.no/Hammerfest", location: "Avsnitt om bosetning" }
    ]
  },
  {
    id: "tana",
    name: "Tana",
    fylke: "finnmark",
    kommune: "Tana",
    macroRegionId: "nordnorsk",
    localProfileId: "tana_norwegian_local_speech",
    dialectArea: "Tana – norsk talemål",
    anchorQuery: "Tana bru, Tana, Finnmark, Norway",
    anchorTokens: ["tana", "finnmark"],
    r: 900,
    sourceLabel: "Store norske leksikon – Tana",
    sourceUrl: "https://snl.no/Tana",
    languagePath: "data/leksikon/sprak/places/europe/norway/finnmark/tana/tana.json",
    placePath: "data/places/by/finnmark/tana/tana.json",
    facts: [
      { text: "Tana er en kommune i Finnmark omkring Tanaelva og indre del av Tanafjorden, med Tana bru som administrasjonssenter.", location: "Faktaboks og ingress", kind: "identity" },
      { text: "Kommunen har ett SSB-definert tettsted, Tana bru, som i 2025 var 1,2 kvadratkilometer med 731 innbyggere.", location: "Avsnitt om bosetning", temporalStatus: "current" },
      { text: "Tana bru ligger ved E6 på vestsiden av Tanaelva og fungerer som et sentralt veiknutepunkt i kommunen.", url: "https://snl.no/Tana_bru_-_tettsted", location: "Ingress og avsnitt om samferdsel" },
      { text: "Bosetningen ellers er spredt langs Tanaelva og i mindre bygder, slik at kommunens geografiske område er langt større enn tettstedet.", location: "Avsnitt om bosetning" },
      { text: "Kommunen har nordsamisk navn Deatnu og kvensk navn Taana, og tettstedet Tana bru er også kjent under samiske og kvenske navn.", location: "Faktaboks og avsnitt om navn" }
    ],
    languageNote: "Område-Place-et peker bare til atlasets dokumenterte profil for norsk talemål i Tana. Samiske språk og kvensk er egne språk og skal ikke modelleres som norske dialekttrekk."
  },
  {
    id: "hattfjelldal",
    name: "Hattfjelldal",
    fylke: "nordland",
    kommune: "Hattfjelldal",
    macroRegionId: "nordnorsk",
    localProfileId: "hattfjelldal_local_speech",
    dialectArea: "Hattfjelldal – norsk talemål",
    anchorQuery: "Hattfjelldal, Nordland, Norway",
    anchorTokens: ["hattfjelldal", "nordland"],
    r: 700,
    sourceLabel: "Store norske leksikon – Hattfjelldal tettsted",
    sourceUrl: "https://snl.no/Hattfjelldal_-_tettsted",
    languagePath: "data/leksikon/sprak/places/europe/norway/nordland/hattfjelldal/hattfjelldal.json",
    placePath: "data/places/by/nordland/hattfjelldal/hattfjelldal.json",
    facts: [
      { text: "Hattfjelldal er et tettsted i Hattfjelldal kommune i Nordland og administrasjonssenter i kommunen.", location: "Faktaboks og ingress", kind: "identity" },
      { text: "SSB oppgir tettstedet Hattfjelldal til 0,9 kvadratkilometer og 529 innbyggere i 2025.", location: "Faktaboks og ingress", temporalStatus: "current" },
      { text: "Hattfjelldal kommune har det sørsamiske navnet Aarporten tjïelte.", url: "https://snl.no/Hattfjelldal", location: "Faktaboks" },
      { text: "I tettstedet finnes sørsamisk internatskole og det sørsamiske kultursenteret Sijti Jarnge.", location: "Ingress" },
      { text: "Kommunen omfatter et stort innlandsområde i Nordland, mens tettstedet er den konsentrerte bebyggelsen omkring administrasjonssenteret.", url: "https://snl.no/Hattfjelldal", location: "Faktaboks og avsnitt om bosetning" }
    ],
    languageNote: "Område-Place-et peker bare til atlasets dokumenterte profil for norsk talemål i Hattfjelldal. Sørsamisk er et eget språk og skal ikke modelleres som et norsk dialekttrekk."
  },
  {
    id: "soemna",
    name: "Sømna",
    fylke: "nordland",
    kommune: "Sømna",
    macroRegionId: "nordnorsk",
    localProfileId: "soemna_local_speech",
    dialectArea: "Sømna – lokalt talemål",
    anchorQuery: "Vik, Sømna, Nordland, Norway",
    anchorTokens: ["sømna", "nordland"],
    r: 900,
    sourceLabel: "Store norske leksikon – Sømna",
    sourceUrl: "https://snl.no/S%C3%B8mna",
    languagePath: "data/leksikon/sprak/places/europe/norway/nordland/soemna/soemna.json",
    placePath: "data/places/by/nordland/soemna/soemna.json",
    facts: [
      { text: "Sømna er en kommune i Nordland med Vik som administrasjonssenter, og kommunen ligger på Sør-Helgeland.", location: "Faktaboks og ingress", kind: "identity" },
      { text: "Vik er et tettsted i Sømna kommune; SSB oppgir 0,5 kvadratkilometer og 354 innbyggere i 2025.", url: "https://snl.no/Vik_-_tettsted_i_S%C3%B8mna", location: "Faktaboks og ingress", temporalStatus: "current" },
      { text: "Fylkesvei 17 går gjennom Vik og knytter tettstedet til kystveien nordover mot Brønnøysund og Bodø.", url: "https://snl.no/Vik_-_tettsted_i_S%C3%B8mna", location: "Ingress" },
      { text: "Sømna kommune har et landareal på 192 kvadratkilometer, slik at kommunen er langt større enn den konsentrerte bebyggelsen i Vik.", location: "Faktaboks" },
      { text: "Sømna kirke fra 1876 ligger i Vik, som fungerer som kommunens administrative sentrum.", url: "https://snl.no/Vik_-_tettsted_i_S%C3%B8mna", location: "Ingress" }
    ]
  }
];

function absolute(relative) {
  return path.join(ROOT, relative);
}

function readJson(relative) {
  return JSON.parse(fs.readFileSync(absolute(relative), "utf8"));
}

function writeJson(relative, value) {
  fs.mkdirSync(path.dirname(absolute(relative)), { recursive: true });
  fs.writeFileSync(absolute(relative), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function sha256(value) {
  return crypto.createHash("sha256").update(String(value ?? ""), "utf8").digest("hex");
}

function unique(values) {
  return [...new Set(values)];
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function resolveOsm(target) {
  const params = new URLSearchParams({
    q: target.anchorQuery,
    format: "jsonv2",
    limit: "10",
    countrycodes: "no",
    addressdetails: "1"
  });
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: {
      "User-Agent": "History-Go-Sprakatlas-Places-v2/1.0 (https://github.com/Paradispartiet/History-Go)",
      "Accept-Language": "nb,no,en"
    }
  });
  if (!response.ok) throw new Error(`${target.id}: Nominatim HTTP ${response.status}`);
  const rows = await response.json();
  const normalizedTokens = target.anchorTokens.map(value => value.toLocaleLowerCase("nb-NO"));
  const eligible = rows.filter(row => {
    const display = String(row?.display_name || "").toLocaleLowerCase("nb-NO");
    return normalizedTokens.every(token => display.includes(token));
  });
  const preferredTypes = new Set(["city", "town", "village", "municipality", "administrative"]);
  const row = eligible.find(item => item.osm_type === "node" && preferredTypes.has(String(item.type)))
    || eligible.find(item => item.osm_type === "node")
    || eligible.find(item => preferredTypes.has(String(item.type)))
    || eligible[0]
    || rows[0];
  if (!row?.osm_id || !row?.osm_type || !Number.isFinite(Number(row?.lat)) || !Number.isFinite(Number(row?.lon))) {
    throw new Error(`${target.id}: fant ikke et brukbart OSM-anker for ${target.anchorQuery}`);
  }
  return row;
}

function sourceObject(osm) {
  const type = String(osm.osm_type).toLowerCase();
  return {
    id: `osm-${type}:${osm.osm_id}`,
    url: `https://www.openstreetmap.org/${type}/${osm.osm_id}`,
    label: `${type} ${osm.osm_id}`
  };
}

function makePlace(target, osm) {
  const source = sourceObject(osm);
  const desc = target.facts.slice(0, 2).map(row => row.text).join(" ");
  const popupDesc = [
    target.facts.slice(0, 2).map(row => row.text).join(" "),
    target.facts.slice(2, 4).map(row => row.text).join(" "),
    target.facts.slice(4).map(row => row.text).join(" ")
  ].join("\n\n");
  const anchorName = String(osm.display_name || target.anchorQuery).split(",")[0].trim();
  return {
    id: target.id,
    name: target.name,
    placeScope: "area",
    lat: Number(osm.lat),
    lon: Number(osm.lon),
    r: target.r,
    locatorType: "linear_area",
    sourceProvider: "osm",
    sourceObjectId: source.id,
    geocodeAccuracy: "semantic_anchor",
    coordRole: "area_anchor",
    coordStatus: "verified_geometry",
    coordSource: `OpenStreetMap ${source.label} – ${anchorName}`,
    coordType: "settlement_anchor",
    coordSourceId: source.id,
    coordSourceUrl: source.url,
    coordVerifiedAt: VERIFIED_AT,
    coordNote: `${anchorName} brukes som representativt area-anchor for ${target.name}. Punktet er et navigasjonsanker og er ikke en geometrisk avgrensning av kommune, tettsted eller dialektområde.`,
    category: "by",
    fylke: target.fylke,
    kommune: target.kommune,
    year: null,
    period: "nåtid",
    tags: unique([
      target.id,
      target.name.toLocaleLowerCase("nb-NO"),
      target.fylke,
      "by",
      "område",
      "språkatlas"
    ]),
    desc,
    popupDesc,
    externalLinks: [
      { label: target.sourceLabel, url: target.sourceUrl, verifiedAt: VERIFIED_AT },
      { label: "OpenStreetMap – områdeanker", url: source.url, verifiedAt: VERIFIED_AT }
    ],
    emne_ids: [
      "em_by_styring_forvaltning_planmakt",
      "em_by_infrastruktur_mobilitet",
      "em_by_historiske_lag_i_hverdagsrom",
      "em_by_romlig_orden"
    ],
    underbadge_ids: [
      "byplanlegging",
      "infrastruktur",
      "bolig_og_bomiljo"
    ],
    quiz_profile: {
      topic: target.name,
      mode: "place",
      suggested_question_count: 8,
      source_bound: true
    }
  };
}

function makeLanguage(target) {
  const note = target.languageNote
    || "Område-Place-et peker til den canonical lokale talemålsprofilen i Språkatlas Norge. Konkrete målmerker og kildebelegg eies av atlasprofilen og dupliseres ikke i denne språkfilen.";
  return {
    place_id: target.id,
    title: `Språkleksikon: ${target.name}`,
    verified_at: VERIFIED_AT,
    dialect_area: target.dialectArea,
    notes: note,
    entries: [],
    atlas_region_ids: [target.macroRegionId],
    atlas_local_ids: [target.localProfileId]
  };
}

function makeProduction(target, place) {
  const claims = target.facts.map((fact, index) => ({
    id: `claim_${target.id}_${index + 1}`,
    claim: fact.text,
    sourceUrl: fact.url || target.sourceUrl,
    sourceLocation: fact.location,
    sourceType: "reputable_secondary",
    verifiedAt: VERIFIED_AT,
    status: "verified",
    claimKind: fact.kind || "ordinary",
    evidenceMode: "explicit",
    ...(fact.temporalStatus ? { temporalStatus: fact.temporalStatus } : {})
  }));
  const descClaimIds = claims.slice(0, 2).map(row => row.id);
  return {
    schemaVersion: "4.2",
    validatorVersion: "4.2.1",
    placeId: target.id,
    placeFile: target.placePath,
    status: "needs_research",
    identity: {
      status: "resolved",
      represents: `${target.name} som canonical område-Place for den dokumenterte lokale Språkatlas-profilen, avgrenset fra enkeltbygninger og fra en hard dialektgrense.`,
      period: "nåtid",
      excludes: [
        `hele ${target.kommune} kommune når den er geografisk større enn det valgte områdeankeret`,
        "enkeltbygninger, institusjoner og kulturminner med egne Place-identiteter",
        "dialektområdet som en hard geografisk grense"
      ]
    },
    metadataSnapshot: {
      name: place.name,
      category: place.category,
      period: place.period,
      coordinates: { lat: place.lat, lon: place.lon }
    },
    textHashes: {
      algorithm: "sha256",
      desc: sha256(place.desc),
      popupDesc: sha256(place.popupDesc)
    },
    claims,
    sentenceCoverage: {
      desc: descClaimIds.map((id, index) => ({ sentence: index + 1, claimIds: [id] })),
      popupDesc: claims.map((claim, index) => ({ sentence: index + 1, claimIds: [claim.id] }))
    },
    reviews: {
      factual: {
        status: "passed",
        reviewedAt: VERIFIED_AT,
        reviewer: "History Go kildekontroll – documented coverage"
      },
      editorial: {
        status: "passed",
        reviewedAt: VERIFIED_AT,
        reviewer: "History Go redaksjonell kontroll – documented coverage",
        introducedNewFacts: false
      }
    },
    quizReadiness: {
      questions: []
    },
    completion: {
      completedUnder: "4.2",
      currentStatus: "current",
      sourceVerifiedAt: VERIFIED_AT,
      claimsVerified: {
        verified: claims.length,
        total: claims.length
      },
      factualReview: "passed",
      editorialReview: "passed",
      validatorVersion: "4.2.1"
    },
    reviewsNotes: "Kort områdebeskrivelse og Språkatlas-kobling er kildekontrollert. Full ordinær Place Description v4.2-research er bevisst ikke påstått i denne produktdekningsrunden."
  };
}

function appendV2Docs() {
  let doc = fs.readFileSync(absolute(DOC_PATH), "utf8");
  if (doc.includes("<!-- SPRÅKATLAS_PLACES_V2_DOCUMENTED_COVERAGE_END -->")) return;
  doc = `${doc.trimEnd()}\n\n<!-- SPRÅKATLAS_PLACES_V2_DOCUMENTED_COVERAGE_START -->\n## Språkatlas → Steder v2 – documented coverage\n\nDenne produktfasen utvider Place-koblingen uten å starte en ny forskningsrunde. Regelen er evidensstyrt: en lokal profil får eksplisitt Place-spor når profilen allerede er \`evidence_materialized\`. \`documented_seed\` og \`local_research_required\` blir stående i forskningskø og skal ikke få konstruerte Place-koblinger bare for å øke dekningsgraden.\n\nEtter denne materialiseringen har alle de **15** evidensmaterialiserte lokale talemålsprofilene minst ett eksplisitt canonical Place-spor. De ni nye område-Places er **Kristiansand, Stavanger, Voss, Bodø, Tromsø, Hammerfest, Tana, Hattfjelldal og Sømna**. Sammen med v1 gir dette **18 canonical språk-Places med eksplisitt lokal atlaslenke**, fordelt på alle 15 ferdig evidensmaterialiserte profiler.\n\nKoblingen er fortsatt en navigasjonsrelasjon via \`atlas_local_ids\`. De konkrete talemålsbeleggene eies av \`local_varieties[].feature_evidence\` i Språkatlaset og kopieres ikke til Place-filene. Alle nye eiere er \`placeScope: \"area\"\`; geografisk area-anchor skal aldri tolkes som en hard dialektgrense.\n\nDe **7** profilene på \`documented_seed\` – Lom, Senja, Suldal, Surnadal, Trysil, Vang i Valdres og Åndalsnes/Rauma – er med hensikt ikke koblet i denne fasen. Først når detaljbelegget er materialisert, kan de gå inn i samme produktflyt.\n<!-- SPRÅKATLAS_PLACES_V2_DOCUMENTED_COVERAGE_END -->\n`;
  fs.writeFileSync(absolute(DOC_PATH), doc, "utf8");
}

function appendV2Test() {
  let test = fs.readFileSync(absolute(TEST_PATH), "utf8");
  if (test.includes("// SPRÅKATLAS → PLACES V2 DOCUMENTED COVERAGE")) return;
  const block = `\n\n// SPRÅKATLAS → PLACES V2 DOCUMENTED COVERAGE\ntest(\"Språkatlas → Places v2 gir alle evidence_materialized-profiler et eksplisitt area-Place-spor uten å kopiere evidensen\", () => {\n  const atlas = json(\"data/leksikon/sprak/norge_atlas_v1.json\");\n  const places = loadPlacesById();\n  const linksByLocalId = new Map();\n\n  for (const [placeId, relative] of Object.entries(languageManifest.place_files || {})) {\n    const article = json(relative);\n    for (const localId of article.atlas_local_ids || []) {\n      if (!linksByLocalId.has(localId)) linksByLocalId.set(localId, []);\n      linksByLocalId.get(localId).push({ placeId, article });\n    }\n  }\n\n  const materialized = (atlas.local_varieties || []).filter(row => row.profile_status === \"evidence_materialized\");\n  assert.equal(materialized.length, 15, \"v2-baselinen skal ha 15 evidensmaterialiserte lokale profiler\");\n\n  for (const profile of materialized) {\n    const links = linksByLocalId.get(profile.id) || [];\n    assert.ok(links.length >= 1, \`\${profile.id}: evidence_materialized-profil mangler eksplisitt Place-spor\`);\n    for (const { placeId } of links) {\n      const place = places.get(placeId);\n      assert.ok(place, \`\${profile.id}: lenket Place \${placeId} finnes ikke canonical\`);\n      assert.equal(place.placeScope, \"area\", \`\${profile.id}: lokalt talemål skal bare kobles til canonical area-Place\`);\n    }\n  }\n\n  const expectedV2 = new Map(${JSON.stringify(targets.map(target => [target.id, target.localProfileId]), null, 2)});\n  for (const [placeId, localId] of expectedV2) {\n    const relative = languageManifest.place_files?.[placeId];\n    assert.ok(relative, \`\${placeId}: v2 språkfil mangler i manifest\`);\n    const article = json(relative);\n    assert.deepEqual(article.atlas_local_ids, [localId], \`\${placeId}: feil lokal atlasprofil\`);\n    assert.equal((article.entries || []).length, 0, \`\${placeId}: atlasbelegg skal ikke dupliseres i Place-språkfilen\`);\n    assert.equal(places.get(placeId)?.placeScope, \"area\", \`\${placeId}: v2 Place må være områdeeid\`);\n  }\n\n  const immature = new Set((atlas.local_varieties || [])\n    .filter(row => row.profile_status !== \"evidence_materialized\")\n    .map(row => row.id));\n  for (const localId of linksByLocalId.keys()) {\n    assert.ok(!immature.has(localId), \`\${localId}: ikke-materialisert profil skal ikke få Place-spor i documented coverage\`);\n  }\n});\n// /SPRÅKATLAS → PLACES V2 DOCUMENTED COVERAGE\n`;
  fs.writeFileSync(absolute(TEST_PATH), `${test.trimEnd()}${block}\n`, "utf8");
}

async function main() {
  const placesManifest = readJson(PLACES_MANIFEST);
  const languageManifest = readJson(LANGUAGE_MANIFEST);
  const atlas = readJson("data/leksikon/sprak/norge_atlas_v1.json");
  const localById = new Map((atlas.local_varieties || []).map(row => [row.id, row]));

  for (const target of targets) {
    const profile = localById.get(target.localProfileId);
    if (!profile) throw new Error(`${target.id}: mangler atlasprofil ${target.localProfileId}`);
    if (profile.profile_status !== "evidence_materialized") {
      throw new Error(`${target.id}: ${target.localProfileId} er ${profile.profile_status}, ikke evidence_materialized`);
    }
    if (fs.existsSync(absolute(target.placePath))) {
      throw new Error(`${target.id}: Place finnes allerede på ${target.placePath}; generatoren skal ikke overskrive canonical data`);
    }

    const osm = await resolveOsm(target);
    const place = makePlace(target, osm);
    writeJson(target.placePath, place);
    writeJson(target.languagePath, makeLanguage(target));
    writeJson(`data/places/production/${target.id}.json`, makeProduction(target, place));

    const manifestRelative = target.placePath.replace(/^data\//, "");
    if (!placesManifest.files.includes(manifestRelative)) placesManifest.files.push(manifestRelative);
    languageManifest.place_files[target.id] = target.languagePath;

    console.log(`${target.id}: ${place.coordSourceId} @ ${place.lat},${place.lon}`);
    await sleep(1100);
  }

  writeJson(PLACES_MANIFEST, placesManifest);
  writeJson(LANGUAGE_MANIFEST, languageManifest);
  appendV2Docs();
  appendV2Test();
}

await main();
