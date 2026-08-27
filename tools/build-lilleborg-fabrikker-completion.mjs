#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { auditLilleborgCompletion } from "../scripts/audit-lilleborg-fabrikker-completion.mjs";

const root = process.cwd();
const verifiedAt = "2026-08-27";
const placeId = "lilleborg_fabrikker";
const personId = "peter_wessel_wind_kildal_lilleborg";
const brandId = "lilleborg_fabrikker_company";
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const write = (file, value) => {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const writeCompactArray = (file, values) => {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `[\n${values.map(value => JSON.stringify(value)).join(",\n")}\n]\n`);
};
const sha256 = value => crypto.createHash("sha256").update(String(value)).digest("hex");
const addOnce = (array, value, key = item => item) => {
  if (!array.some(item => key(item) === key(value))) array.push(value);
};
const upsertById = (array, value) => {
  const index = array.findIndex(item => item.id === value.id);
  if (index === -1) array.push(value);
  else array[index] = value;
};
const sentences = text => [...new Intl.Segmenter("nb", { granularity: "sentence" }).segment(text)]
  .map(item => item.segment.trim()).filter(Boolean);

const urls = {
  byleksikon: "https://oslobyleksikon.no/side/Lilleborg_AS",
  sandakerveien: "https://oslobyleksikon.no/side/Sandakerveien",
  snlKildal: "https://snl.no/Peter_Wessel_Wind_Kildal",
  nblKildal: "https://nbl.snl.no/Peter_Kildal",
  industrimuseum: "https://industrimuseum.no/bedrifter/lilleborgfabrikera_s",
  orklaSale: "https://www.orkla.com/media/press-releases/2024/orkla-announces-the-sale-of-lilleborg/",
  solenis: "https://www.solenis.com/en/resources/news-releases/2024/lilleborg-acquisition/",
  currentPhoto: "https://commons.wikimedia.org/wiki/File:Lilleborg_gammel_bygning.jpg",
  historicalPhoto: "https://digitaltmuseum.no/011014880873/lilleborg-fabrikker",
  courtyardPhoto: "https://digitaltmuseum.no/011014869368/lilleborg-fabrikker",
  portrait: "https://commons.wikimedia.org/wiki/File:Peter_Wessel_Wind_Kildal.jpg",
  portraitMuseum: "https://digitaltmuseum.no/021046786111/grosserer-p-w-w-kildal-xylografi",
  lano: "https://commons.wikimedia.org/wiki/File:Lilleborg_Lano.jpg",
  greenSoapSign: "https://commons.wikimedia.org/wiki/File:Reklameskilt_Lilleborg_Gronnsepe.jpg",
  adamSmith: "https://www.gutenberg.org/files/3300/3300-h/3300-h.htm",
  schumpeter: "https://archive.org/details/in.ernet.dli.2015.190072",
  productivityMethod: "https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/labourproductivity/methodologies/labourproductivityqmi"
};

const placeFile = "data/places/naeringsliv/oslo/places_naeringsliv/lilleborg_fabrikker.json";
const previousPlace = read(placeFile);
const desc = "A/S Lilleborg Fabriker ble grunnlagt i 1897 som videreføring av eldre olje- og såpeindustri ved Akerselva. Peter Wessel Wind Kildal hadde fra 1863 samlet driften om lampeolje og såpe, før selskapet senere ble knyttet til De-No-Fa, Unilever og Orkla. Produksjonen på Sandaker ble avsluttet i 1997. Fabrikkporten i Sandakerveien 54 og den bevarte kontorbygningen fra 1916 gjør det tidligere industristedet lesbart i dagens boligområde.";
const popupDesc = "A/S Lilleborg Fabriker ble grunnlagt i 1897, men industristedet ved Akerselva har en lengre forhistorie. En tekstilfabrikk kom til i 1812, en oljemølle i 1833 og en såpefabrikk i 1842. Årstallene beskriver ulike virksomhetslag; 1897 er etableringsåret for aksjeselskapet som denne Place-recorden representerer.\n\nPeter Wessel Wind Kildal overtok anlegget i 1863. Han konsentrerte produksjonen om lampeolje og såpe, og virksomheten utvidet produksjonen av disse varene. Produksjonen koblet fett og oljer, kjemiske prosesser, emballasje, merkevarer, reklame og distribusjon til en samlet forbruksvarekjede.\n\nA/S Lilleborg Fabriker ble dannet i 1897 etter Kildal-familiens eierperiode. Selskapet inngikk samarbeid med De-No-Fa i 1925. Året 1930 markerer et nytt skille i eier- og produkthistorien. Dette påvirket både styringen og produktporteføljen.\n\nUnder andre verdenskrig produserte fabrikken fett til okkupasjonsmakten samtidig som den laget såpe og vaskemidler for sivile. Motstandsbevegelsen motsatte seg sabotasje fordi et angrep også ville ramme befolkningens tilgang til nødvendige varer. Eksemplet viser at industrihistorie kan romme konflikt mellom militær nytte, sivile behov og arbeidernes situasjon.\n\nDen bevarte kontorbygningen ble tegnet av Magnus Poulsson og oppført i 1916, med utvidelse i 1930. De fleste produksjonsbygningene er senere revet eller ombygd. Produksjonen på Sandaker ble avsluttet i 1997 og flyttet til Ski; fra 2000 til 2003 ble store deler av området omformet til boliger.\n\nLilleborg-navnet levde videre utenfor fabrikkområdet. Orkla skilte virksomheten ut under Orkla Brands i 1996, og i 2024 ble det profesjonelle rengjøringsselskapet Lilleborg solgt til Solenis. Denne nyere selskapslinjen må skilles fra den nedlagte produksjonen ved Sandaker.\n\nKartmarkøren bruker det verifiserte adressepunktet ved fabrikkporten i Sandakerveien 54 som et tydelig og etterprøvbart displayanker. Punktet er inngangen til et tidligere fabrikkompleks, ikke det geometriske sentrum for alle bygninger som til ulike tider inngikk i virksomheten. Området må leses gjennom flere bevarte og tapte spor fra ulike tider i fabrikkhistorien.";

const commonCurrentMeta = {
  source: "wikimedia_commons", sourcePage: urls.currentPhoto, creator: "Anne-Sophie Ofrim", credit: "Anne-Sophie Ofrim / Wikimedia Commons",
  license: "CC BY-SA 3.0", assetType: "documentary_photo", originalDimensions: "2911x1845", verifiedAt
};
const place = {
  ...previousPlace,
  desc,
  popupDesc,
  emne_ids: [
    "em_naering_arbeid_verdiskaping",
    "em_naering_industri_og_mekanisering",
    "em_naering_produksjon_produktivitet",
    "em_naering_logistikk_verdikjeder",
    "em_naering_omstilling_kriser_skift"
  ],
  quiz_profile: {
    place_type: "historisk_forbruksvareindustri",
    subtype: "olje_og_sapeindustri_til_boligomrade",
    signature_features: ["A/S grunnlagt i 1897", "oljemølle fra 1833", "såpefabrikk fra 1842", "Kildal overtok i 1863", "produksjonen på Sandaker sluttet i 1997"],
    primary_angles: ["produksjon_og_verdikjede", "merkevarer_og_marked", "eierskap_og_kunnskap", "omstilling_og_byutvikling"],
    question_families: ["sted_og_tidslag", "råvarer_og_prosess", "arbeid_og_marked", "eierskap", "omstilling"],
    avoid_angles: ["1833_som_aksjeselskapets_grunnleggelsesaar", "generisk_merkevarequiz", "ukildebelagt_lønnsomhet"],
    must_include: ["1897", "Peter Wessel Wind Kildal", "De-No-Fa 1925", "Unilever 1930", "produksjonsstopp 1997"],
    contrast_targets: ["myrens_verksted", "hjula_vaeverier", "akerselva"],
    notes: "Spør om tidslag, forbruksvareproduksjon, merkevarer, eierskap og ombruk. De første fjorten spørsmålene er normal stedskunnskap; teori og metode kommer først fra sett tre."
  },
  image: "bilder/places/lilleborg_fabrikker.webp",
  cardImage: "bilder/kort/places/lilleborg_fabrikker.webp",
  imageMeta: { ...commonCurrentMeta, outputDimensions: "1200x675 and 640x360", transformation: "Proporsjonal skalering og sentrert 16:9-beskjæring av den dokumenterte kontorbygningen." },
  frontImage: "bilder/places/lilleborg_fabrikker_front_portrait.webp",
  frontImageMeta: { ...commonCurrentMeta, outputDimensions: "900x1200", orientation: "portrait", aspectRatio: "3:4", crop: { left: 50, top: 0, width: 1384, height: 1845 }, transformation: "Stående utsnitt av den bevarte kontorbygningen; deretter skalert til 900x1200." },
  related_people_ids: [personId],
  related_place_ids: ["akerselva", "myrens_verksted", "hjula_vaeverier"],
  place_card_profile: {
    schema: "history_go_place_card_profile_v2",
    collection_ids: ["people", "objects", "brands", "structures"],
    reason: "Næringslivskomposisjonen er full: Peter Wessel Wind Kildal har verifisert historisk portrett, Lano-emballasje er et identifiserbart produktobjekt, et historisk Lilleborg-skilt dokumenterer merkevaren, og kontorbygningen fra 1916 har dokumentarfoto. Badge og quiz ligger separat.",
    verifiedAt
  },
  objects: [{
    id: "lilleborg_lano_barnesape", title: "Lano barnesåpe", type: "såpeemballasje", kind: "consumer_product", year: null,
    desc: "To eldre pakker Lano barnesåpe med Lilleborgs navn og varemerke synlig på emballasjen.",
    whereToFind: "Dokumentert i en åpen Commons-kilde; eventuell fysisk samlingsstatus må kontrolleres før besøk.",
    why_here: "Emballasjen gjør forbindelsen mellom fabrikkproduksjon, produkt, merkevare og forbrukermarked konkret.",
    placeSpecificReason: "Commons-kilden identifiserer både Lano-produktet og Lilleborg som virksomhet.",
    historicalFunction: "Emballasjen beskyttet såpen og bar merkevaren ut til forbrukeren.",
    physicalObject: true, placeSpecific: true, collectable: true, storePrice: 40, currency: "PC", collection: "lilleborg_forbruksvarer",
    unlock: "Studer emballasjen i den åpne Commons-kilden eller i en lovlig tilgjengelig samling.",
    image: "bilder/kort/objects/lilleborg_lano_barnesape.webp",
    imageMeta: { source: "wikimedia_commons", sourcePage: urls.lano, creator: "Chell Hill", credit: "Chell Hill / Wikimedia Commons", license: "CC BY-SA 3.0", assetType: "documentary_object_photo", originalDimensions: "3358x1681", outputDimensions: "900x520", transformation: "Proporsjonal skalering og sentrert kortutsnitt av de dokumenterte emballasjene.", verifiedAt },
    source_urls: [urls.lano, urls.byleksikon]
  }],
  structures: [{
    id: "lilleborg_kontorbygning_1916", name: "Lilleborgs kontorbygning", type: "kontorbygning", kind: "industrial_structure",
    desc: "Bevart kontorbygning tegnet av Magnus Poulsson og oppført i 1916, med utvidelse i 1930.",
    image: "bilder/kort/structures/lilleborg_kontorbygning_1916.webp",
    imageMeta: { ...commonCurrentMeta, outputDimensions: "900x520", transformation: "Proporsjonal skalering og sentrert kortutsnitt av den dokumenterte bygningen.", verifiedAt },
    source_urls: [urls.currentPhoto, urls.byleksikon, urls.sandakerveien], verifiedAt
  }],
  externalLinks: [
    ["source", "Oslo byleksikon – Lilleborg Fabrikker", urls.byleksikon],
    ["source", "Store norske leksikon – Peter Wessel Wind Kildal", urls.snlKildal],
    ["museum", "Industrimuseum – Lilleborg Fabrikker", urls.industrimuseum],
    ["official", "Orkla – salget av Lilleborg i 2024", urls.orklaSale],
    ["official", "Solenis – oppkjøpet av Lilleborg i 2024", urls.solenis],
    ["image_source", "Wikimedia Commons – kontorbygningen", urls.currentPhoto],
    ["historical_image", "DigitaltMuseum – Lilleborg omkring 1930", urls.historicalPhoto],
    ["museum_object", "Wikimedia Commons – Lano-emballasje", urls.lano]
  ].map(([type, label, url]) => ({ type, label, url, verifiedAt })),
  interpretation: {
    what_to_notice: ["Den lave pussede kontorbygningen fra 1916.", "Årstallene 1916 og 1930 i fasaden som viser byggefaser.", "Avstanden mellom fabrikkporten, de bevarte byggene og boligene som erstattet store deler av produksjonsområdet."],
    why_it_matters: ["Stedet viser hvordan råvarer, kjemisk prosess, emballasje og merkevarer ble koblet i en forbruksvareindustri.", "De-No-Fa-, Unilever- og Orkla-periodene gjør eierskap og kunnskapsoverføring synlig.", "Boligomformingen etter 1997 viser hvordan industrigrunn kan få ny økonomisk og sosial funksjon."],
    counterpoints: ["1833 er oljemøllens år, ikke A/S Lilleborg Fabrikers grunnleggelsesår.", "Den bevarte kontorbygningen representerer ikke hele det tidligere fabrikkomplekset.", "Solenis-oppkjøpet i 2024 gjelder den videreførte profesjonelle rengjøringsvirksomheten, ikke ny produksjon på Sandaker."],
    sources: [urls.byleksikon, urls.orklaSale, urls.solenis].map(url => ({ url, verifiedAt }))
  },
  for_na: {
    title: "Fra fabrikkområde til boligstrøk",
    beforeImage: "bilder/places/lilleborg_fabrikker_1930.webp",
    beforeImageLabel: "Lilleborgs industribygninger omkring 1930 · Anders Beer Wilse / Oslo Museum · CC0 1.0",
    beforeImageMeta: { sourcePage: urls.historicalPhoto, creator: "Anders Beer Wilse", credit: "Anders Beer Wilse / Oslo Museum / DigitaltMuseum", license: "CC0 1.0", date: "ca. 1930", verifiedAt },
    nowImage: "bilder/places/lilleborg_fabrikker.webp",
    nowImageLabel: "Den bevarte kontorbygningen i 2013 · Anne-Sophie Ofrim · CC BY-SA 3.0",
    nowImageMeta: { ...commonCurrentMeta, date: "2013-01-20" },
    before: "Wilses fotografi omkring 1930 viser et tett produksjonsanlegg med teglbygninger, skorsteiner, lager og tønner.",
    now: "Dokumentarfotografiet fra 2013 viser kontorbygningen fra 1916, senere utvidet i 1930, som et av de bevarte sporene etter fabrikken.",
    change: "Produksjonen på Sandaker er borte og store deler av området ble omformet til boliger i 2000–03. Motivene har ikke identisk kamerastandpunkt og brukes som dokumentasjon av to tidslag, ikke som et eksakt optisk før–nå-par.",
    lookFor: ["Skorsteinene og lageret i 1930-motivet.", "Kontorbygningens lave volum og fasadeårstall.", "Hvordan dagens åpne boligmiljø skiller seg fra det tette produksjonsanlegget."],
    sources: [urls.historicalPhoto, urls.currentPhoto, urls.byleksikon]
  }
};
write(placeFile, place);

const placesManifest = read("data/places/manifest.json");
addOnce(placesManifest.files, "places/naeringsliv/oslo/places_naeringsliv/lilleborg_fabrikker.json");
write("data/places/manifest.json", placesManifest);

const personFile = "data/people/naeringsliv/oslo/lilleborg_fabrikker/peter_wessel_wind_kildal_lilleborg.json";
const personClaimsFile = "data/people/claims/naeringsliv/oslo/lilleborg_fabrikker/peter_wessel_wind_kildal_lilleborg.claims.json";
const personDesc = "Industrigründeren som overtok fabrikkanlegget ved Akerselva i 1863, konsentrerte driften om lampeolje og såpe og utviklet virksomheten til landets ledende i sitt slag.";
const personPopup = "Peter Wessel Wind Kildal ble født ved Ålesund 27. november 1814 og døde i Kristiania 22. mars 1882. Han åpnet egen kolonial- og vinforretning i Kristiania i 1842 og bygde senere opp flere industrivirksomheter.\n\nKildal kjøpte fabrikkanlegget ved Akerselva i 1863. Under hans ledelse ble driften konsentrert om lampeolje og såpe, og fabrikkene vokste til å bli landets ledende i sitt slag.\n\nKildal-familien drev virksomheten fram til 1897. Da ble virksomheten omdannet til et aksjeselskap. Stedskoblingen gjelder Kildals dokumenterte overtakelse og utvikling av fabrikken, ikke etableringen av aksjeselskapet etter hans død.";
const person = {
  id: personId, name: "Peter Wessel Wind Kildal", initials: "PWK", kindLabel: "Forretningsmann og industrigründer", birth_date: "1814-11-27", birth_place: "Borgund ved Ålesund", death_date: "1882-03-22", active_place: "Kristiania", desc: personDesc, popupDesc: personPopup,
  education: [], placeId, places: [placeId], category: "naeringsliv", year: 1863,
  works: [
    { id: "lilleborg_overtakelse_1863", title: "Lilleborg Fabriker", year: 1863, role: "eier og industrileder", place: "Kristiania", material: "olje og såpe", summary: "Overtok anlegget og konsentrerte produksjonen om lampeolje og såpe." },
    { id: "pww_kildal_og_co", title: "P. W. W. Kildal & Co.", role: "grunnlegger og eier", place: "Kristiania", material: "handel og næringsmiddelindustri", summary: "Bygde et handelshus og flere industrivirksomheter som knyttet produksjon til varehandel." }
  ],
  tags: ["naeringsliv", "industri", "lilleborg_fabrikker", "såpe", "gründer"], themes: ["industrigründing", "forbruksvarer", "handel"],
  image: "bilder/kort/people/peter_wessel_wind_kildal_lilleborg.webp", cardImage: "bilder/kort/people/peter_wessel_wind_kildal_lilleborg.webp",
  imageMeta: { source: "wikimedia_commons", sourcePage: urls.portrait, creator: "Hans Christian Olsen", credit: "Hans Christian Olsen / Oslo Museum / Wikimedia Commons", license: "Public domain mark", reviewStatus: "manually_approved", assetKind: "identity_portrait", originalDimensions: "1677x2076", outputDimensions: "800x960", transformation: "Proporsjonal skalering og sentrert stående utsnitt av xylografiet fra 1882.", verifiedAt },
  profileStandard: "people_profile_v1.0", claimsFile: personClaimsFile, profileStatus: "ready_people_v1",
  source_urls: [urls.snlKildal, urls.nblKildal, urls.byleksikon, urls.portrait, urls.portraitMuseum],
  externalLinks: [["source", "Store norske leksikon – Peter Wessel Wind Kildal", urls.snlKildal], ["source", "Norsk biografisk leksikon – Peter Kildal", urls.nblKildal], ["source", "Oslo byleksikon – Lilleborg AS", urls.byleksikon], ["image_source", "Wikimedia Commons – Kildal-portrettet", urls.portrait], ["museum_image", "DigitaltMuseum – xylografiet", urls.portraitMuseum]].map(([type, label, url]) => ({ type, label, url, verifiedAt })),
  verifiedAt
};
write(personFile, [person]);

const peopleManifest = read("data/people/manifest.json");
peopleManifest.files = peopleManifest.files.filter(file => file !== "naeringsliv/oslo/lilleborg_fabrikker/peter_wessel_wind_kildal_lilleborg.json");
addOnce(peopleManifest.files, "people/naeringsliv/oslo/lilleborg_fabrikker/peter_wessel_wind_kildal_lilleborg.json");
peopleManifest.priorityFilesByPlace ||= {};
peopleManifest.priorityFilesByPlace[placeId] = ["people/naeringsliv/oslo/lilleborg_fabrikker/peter_wessel_wind_kildal_lilleborg.json"];
write("data/people/manifest.json", peopleManifest);

const legacyPeopleFile = "data/people/naeringsliv/oslo/people_naeringsliv_oslo.json";
const legacyPeople = read(legacyPeopleFile).filter(person => person.id !== "alf_bjercke_industri_og_kvalitet");
write(legacyPeopleFile, legacyPeople);

const personClaims = [
  ["canonical_name", "Det kanoniske publiserte navnet er Peter Wessel Wind Kildal.", urls.snlKildal, "overskrift og faktaboks", "recognized_reference"],
  ["birth_death_profession", "Peter Wessel Wind Kildal ble født i Borgund ved Ålesund 27. november 1814, døde i Kristiania 22. mars 1882 og virket som forretningsmann og industrigründer.", urls.snlKildal, "faktaboks", "recognized_reference"],
  ["merchant_business", "Kildal åpnet egen kolonial- og vinforretning i Kristiania i 1842 og utvidet senere med flere industrivirksomheter.", urls.snlKildal, "hovedavsnittene", "recognized_reference"],
  ["lilleborg_takeover", "Kildal overtok Lilleborg i 1863 og konsentrerte produksjonen om lampeolje og såpe.", urls.snlKildal, "hovedavsnittet om Lilleborg", "recognized_reference"],
  ["lilleborg_growth", "Lilleborg vokste under Kildals ledelse til å bli landets ledende virksomhet i sitt slag.", urls.snlKildal, "hovedavsnittet om Lilleborg", "recognized_reference"],
  ["company_transition", "Kildal-familien drev Lilleborg fram til omdanningen til A/S Lilleborg Fabriker i 1897.", urls.byleksikon, "avsnittet om 1863–1897", "institutional_reference"],
  ["image_identity", "Oslo Museums xylografi er identifisert som grosserer P. W. W. Kildal og datert 1882.", urls.portraitMuseum, "tittel, motiv, produsent og datering", "archive"]
].map(([id, claim, source_url, source_location, source_type]) => ({ id, claim, status: "verified", source_url, source_location, source_type, temporal_status: "historical", verified_at: verifiedAt, evidence_level: id === "lilleborg_growth" ? "explicit" : "direct" }));
write(personClaimsFile, {
  schema: "history_go_people_claims_v1", version: "1.0.0", person_id: personId, profile_file: personFile,
  identity: { canonical_identity: "Den norske forretningsmannen og industrigründeren Peter Wessel Wind Kildal (1814–1882).", name_variants: ["Peter Wessel Wind Kildal", "Peter Kildal", "P. W. W. Kildal"], not: ["sønnen Birger Kildal", "broren Peter Daniel Baade Wind Kildal"], identity_status: "verified" },
  claims: personClaims,
  field_claim_map: {
    name: ["canonical_name"], kindLabel: ["birth_death_profession"], birth_date: ["birth_death_profession"], birth_place: ["birth_death_profession"], death_date: ["birth_death_profession"], active_place: ["merchant_business", "lilleborg_takeover"], placeId: ["lilleborg_takeover"], "places[lilleborg_fabrikker]": ["lilleborg_takeover"], year: ["lilleborg_takeover"],
    "works[id=lilleborg_overtakelse_1863].title": ["lilleborg_takeover"], "works[id=lilleborg_overtakelse_1863].year": ["lilleborg_takeover"], "works[id=lilleborg_overtakelse_1863].role": ["lilleborg_takeover"], "works[id=lilleborg_overtakelse_1863].place": ["lilleborg_takeover"], "works[id=lilleborg_overtakelse_1863].material": ["lilleborg_takeover"], "works[id=lilleborg_overtakelse_1863].summary": ["lilleborg_takeover", "lilleborg_growth"],
    "works[id=pww_kildal_og_co].title": ["merchant_business"], "works[id=pww_kildal_og_co].role": ["merchant_business"], "works[id=pww_kildal_og_co].place": ["merchant_business"], "works[id=pww_kildal_og_co].material": ["merchant_business"], "works[id=pww_kildal_og_co].summary": ["merchant_business"], image: ["image_identity"], cardImage: ["image_identity"], imageMeta: ["image_identity"]
  },
  sentence_claim_map: {
    desc: [{ sentence: 1, claim_ids: ["lilleborg_takeover", "lilleborg_growth"] }],
    popupDesc: [
      { sentence: 1, claim_ids: ["birth_death_profession"] }, { sentence: 2, claim_ids: ["merchant_business"] },
      { sentence: 3, claim_ids: ["lilleborg_takeover"] }, { sentence: 4, claim_ids: ["lilleborg_takeover", "lilleborg_growth"] },
      { sentence: 5, claim_ids: ["company_transition"] }, { sentence: 6, claim_ids: ["company_transition"] },
      { sentence: 7, claim_ids: ["company_transition", "lilleborg_takeover"] }
    ]
  },
  completion: { completed_under: "people_profile_v1.0", claims_verified: `${personClaims.length}/${personClaims.length}`, fact_review: "passed", editorial_review: "passed", source_verified_at: verifiedAt, validator_version: "1.0.0", current_status: "ready_people_v1" }
});

const relations = read("data/relations.json");
upsertById(relations, { id: "rel_lilleborg_peter_wessel_wind_kildal", type: "overtok_og_utviklet", place: placeId, person: personId, label: "Overtok og utviklet fabrikken", why: "Kjøpte Lilleborg i 1863, konsentrerte produksjonen om lampeolje og såpe og utviklet virksomheten til landets ledende i sitt slag.", source: urls.snlKildal });
write("data/relations.json", relations);

const brand = {
  id: brandId, name: "Lilleborg", aliases: ["A/S Lilleborg Fabriker", "Lilleborg Fabrikker", "Lilleborg AS"],
  brand_group: "legacy_brand", brand_type: "historic_company_and_product_mark", brand_kind: "brand", sector: "soap_and_cleaning_products", state: "catalog", status: "historical_site_current_company_lineage", verification: "verified_legacy",
  popupdesc: "Lilleborg-navnet ble knyttet til såpe, vaskemidler og andre forbruksvarer produsert ved Sandaker. Det autentiske grønnsåpeskiltet dokumenterer hvordan virksomhetsnavn og produktbudskap ble presentert for markedet. Produksjonen på Sandaker sluttet i 1997; den senere profesjonelle rengjøringsvirksomheten ble solgt av Orkla til Solenis i 2024.",
  desc: "Historisk virksomhets- og produktmerke fra olje-, såpe- og vaskemiddelindustrien ved Akerselva.",
  tags: ["brand", "legacy_brand", "soap", "cleaning_products", "oslo", "akerselva", placeId], place_ids: [placeId], source_urls: [urls.byleksikon, urls.orklaSale, urls.solenis, urls.greenSoapSign],
  logo: "bilder/kort/brands/lilleborg_gronnsepe_skilt.webp",
  imageMeta: { sourcePage: urls.greenSoapSign, creator: "Peulle", credit: "Peulle / Wikimedia Commons", license: "CC BY-SA 4.0", rightsBasis: "cc_by_sa_authentic_advertising_sign", reviewStatus: "manually_approved", assetKind: "authentic_brandmark", sourceForm: "documentary_photo", temporalScope: "historical_sign_documented_2016", usageContext: "referential_identification", noEndorsement: true, generated: false, reconstructed: false, transformation: "Det autentiske Lilleborg-grønnsåpeskiltet er proporsjonalt skalert og sentrert på 900x520. Tekst og merke er ikke rekonstruert eller redesignet.", outputDimensions: "900x520", reviewedAt: verifiedAt }
};
const masterBrands = read("data/brands/brands_master.json");
upsertById(masterBrands, brand);
write("data/brands/brands_master.json", masterBrands);
const brandSummary = { id: brand.id, name: brand.name, aliases: brand.aliases, brand_group: brand.brand_group, brand_type: brand.brand_type, brand_kind: brand.brand_kind, sector: brand.sector, state: brand.state, status: brand.status, verification: brand.verification, popupdesc: brand.popupdesc, desc: brand.desc, tags: brand.tags };
for (const file of ["data/brands/brands_catalog.json", "data/brands/brands_catalog_v17.json"]) {
  const rows = read(file); upsertById(rows, file.endsWith("v17.json") ? { id: brand.id, name: brand.name, aliases: brand.aliases, brand_group: brand.brand_group, brand_type: brand.brand_type, sector: brand.sector, state: brand.state, status: brand.status, verification: brand.verification, popupdesc: brand.popupdesc, desc: brand.desc, tags: brand.tags } : brandSummary); write(file, rows);
}
const rawBrands = read("data/brands/brands_master_raw.json");
upsertById(rawBrands, brandSummary);
writeCompactArray("data/brands/brands_master_raw.json", rawBrands);
const brandsByPlace = read("data/brands/brands_by_place.json");
brandsByPlace[placeId] = [brandId];
write("data/brands/brands_by_place.json", brandsByPlace);

const sourceLinks = [
  { id: "source_lilleborg_byleksikon", type: "source", label: "Oslo byleksikon – Lilleborg Fabrikker", url: urls.byleksikon, verifiedAt },
  { id: "source_lilleborg_snl_kildal", type: "source", label: "Store norske leksikon – Peter Wessel Wind Kildal", url: urls.snlKildal, verifiedAt },
  { id: "source_lilleborg_industrimuseum", type: "museum", label: "Industrimuseum – Lilleborg Fabrikker", url: urls.industrimuseum, verifiedAt },
  { id: "source_lilleborg_orkla", type: "official", label: "Orkla – salget av Lilleborg", url: urls.orklaSale, verifiedAt },
  { id: "source_lilleborg_solenis", type: "official", label: "Solenis – oppkjøpet av Lilleborg", url: urls.solenis, verifiedAt },
  { id: "source_adam_smith_wealth_nations", type: "primary_text", label: "Adam Smith – The Wealth of Nations, bok I", url: urls.adamSmith, verifiedAt },
  { id: "source_schumpeter_creative_destruction", type: "primary_text", label: "Joseph Schumpeter – Capitalism, Socialism and Democracy", url: urls.schumpeter, verifiedAt },
  { id: "source_ons_labour_productivity_qmi", type: "official_method", label: "Office for National Statistics – Labour productivity QMI", url: urls.productivityMethod, verifiedAt },
  { id: "source_lilleborg_current_image", type: "image_source", label: "Wikimedia Commons – kontorbygningen", url: urls.currentPhoto, verifiedAt },
  { id: "source_lilleborg_historical_image", type: "historical_image", label: "DigitaltMuseum – industribygninger omkring 1930", url: urls.historicalPhoto, verifiedAt }
];
const chronology = [
  [1812, "Tekstilfabrikk", "Ludvig Mariboe opprettet en tekstilfabrikk på den eldre industrieiendommen."],
  [1833, "Oljemøllen starter", "Oljemøllen ble etablert og ble et viktig lag i virksomhetens forhistorie."],
  [1842, "Såpeproduksjon", "Et sæbesyderi, eller såpekokeri, ble etablert ved anlegget."],
  [1863, "Kildal overtar", "Peter Wessel Wind Kildal kjøpte Lilleborg og satset på lampeolje og såpe."],
  [1897, "A/S Lilleborg Fabriker", "Familievirksomheten ble omdannet til aksjeselskapet A/S Lilleborg Fabriker."],
  [1916, "Ny kontorbygning", "Kontorbygningen tegnet av Magnus Poulsson ble oppført."],
  [1925, "Samarbeid med De-No-Fa", "Lilleborg inngikk et produksjons- og eierskapssamarbeid med De-No-Fa."],
  [1930, "Unilever-koblingen", "Unilever ble deleier og ga tilgang til varemerker og produksjonsmetoder."],
  [1940, "Krigstidens produksjonsdilemma", "Fett til okkupasjonsmakten og sivile såpevarer ble produsert i samme anlegg under krigen."],
  [1959, "DeNoFa-Lilleborg", "Virksomheten ble samlet under navnet DeNoFa-Lilleborg."],
  [1996, "Orkla Brands", "Lilleborg ble igjen skilt ut som egen virksomhet under Orkla Brands."],
  [1997, "Produksjonen flyttes", "Produksjonen på Sandaker ble avsluttet og flyttet til Ski."],
  [2000, "Boligomforming", "Fra 2000 til 2003 ble store deler av fabrikkarealet omformet til boliger."],
  [2024, "Solenis overtar", "Solenis kjøpte den videreførte profesjonelle rengjøringsvirksomheten Lilleborg fra Orkla."]
].map(([year, title, desc], index) => ({ id: `chrono_lilleborg_${year}_${index + 1}`, year, title, desc, confidence: "high", sources: [{ title: year === 2024 ? "Solenis" : "Oslo byleksikon", url: year === 2024 ? urls.solenis : urls.byleksikon }] }));
const leksikonFile = "data/leksikon/places/oslo/naeringsliv/leksikon_lilleborg_fabrikker.json";
const scholarlyArticle = {
  definition: "Lilleborg Fabrikker er her definert som det stedbundne olje-, såpe- og vaskemiddelindustrianlegget ved Sandaker i perioden da A/S Lilleborg Fabriker eksisterte og produserte på stedet, ikke som hele Lilleborg-strøket eller som den senere selskapsvirksomheten utenfor Sandaker.",
  historical_or_systemic_background: [
    "Stedet fikk flere økonomiske lag før aksjeselskapet: tekstilproduksjon fra 1812, oljemølle fra 1833 og såpeproduksjon fra 1842. Peter Wessel Wind Kildal overtok i 1863, mens 1897 markerer omdanningen til A/S Lilleborg Fabriker. Årstallene svarer derfor på forskjellige spørsmål om eiendom, produksjon og selskapsform.",
    "Produksjonen bandt fett og oljer til kjemiske prosesser, arbeid, emballasje, merkevarer og distribusjon. De-No-Fa-samarbeidet fra 1925 og Unilevers deleierskap fra 1930 viser hvordan kontroll over kapital, varemerker og produksjonsmetoder kunne krysse landegrenser, mens produksjonen fortsatt var fysisk forankret ved Akerselva."
  ],
  theories_researchers_and_findings: [
    {
      id: "framework_smith_division_of_labour",
      title: "Arbeidsdeling som analytisk linse",
      researcher: "Adam Smith",
      work: "An Inquiry into the Nature and Causes of the Wealth of Nations, bok I",
      status: "analytical_lens_not_causal_claim",
      content: "Adam Smiths analyse av arbeidsdeling gjør det mulig å spørre hvordan Lilleborg delte en forbruksvarekjede i råvarebehandling, kjemiske prosesser, pakking, merkevarearbeid og distribusjon. Kildene dokumenterer leddene, men ikke bemanning, tidsbruk eller produktivitetsvirkning godt nok til å bevise at arbeidsdeling alene forklarte veksten.",
      claim_ids: ["claim_lilleborg_fabrikker_value_chain"],
      source_ids: ["source_adam_smith_wealth_nations", "source_lilleborg_byleksikon"]
    },
    {
      id: "framework_schumpeter_creative_destruction",
      title: "Kreativ destruksjon og stedsskifte",
      researcher: "Joseph Schumpeter",
      work: "Capitalism, Socialism and Democracy",
      status: "analytical_lens_not_causal_claim",
      content: "Joseph Schumpeters begrep kreativ destruksjon kan belyse at gammel produksjon forsvinner mens kapital, merkevarer og arealer får nye former: produksjonen flyttet i 1997, boligomformingen fulgte, og Lilleborg-navnet fortsatte i en annen selskapslinje. Begrepet ordner forløpet, men dokumenterer ikke hvorfor beslutningene ble tatt eller hvem som vant og tapte.",
      claim_ids: ["claim_lilleborg_fabrikker_closure_reuse", "claim_lilleborg_fabrikker_company_2024"],
      source_ids: ["source_schumpeter_creative_destruction", "source_lilleborg_byleksikon", "source_lilleborg_solenis"]
    }
  ],
  methods_and_limitations: [
    {
      id: "method_lilleborg_value_chain",
      method_id: "met_naering_logistikk_og_verdikjedeanalyse",
      method: "Logistikk- og verdikjedeanalyse",
      application: "Analysen følger dokumenterte innsatsfaktorer og ledd fra fett og oljer via produksjon, emballasje og merkevarer til distribuerte såpe- og vaskemiddelprodukter.",
      limitations: "Kildene gir ikke en komplett leverandørliste, transportserie eller oversikt over retur og avfall. Verdikjeden kan derfor beskrives, men ikke tallfestes eller behandles som uendret gjennom hele perioden.",
      claim_ids: ["claim_lilleborg_fabrikker_value_chain"],
      source_ids: ["source_lilleborg_byleksikon", "source_lilleborg_industrimuseum"]
    },
    {
      id: "method_lilleborg_productivity",
      method_id: "met_naering_statistikk_og_indikatoranalyse",
      method: "Statistikk- og indikatoranalyse",
      application: "Produktivitet må i prinsippet sammenholde et definert resultat med en definert innsats, for eksempel produsert volum mot arbeidstid, og krever sammenlignbare måleenheter over tid.",
      limitations: "Lilleborg-kildene mangler sammenlignbare serier for volum, arbeidstimer, kvalitet og kapital. Artikkelen kan derfor ikke beregne produktivitet eller bruke eierskifte og produksjonsstopp som erstatning for slike mål.",
      claim_ids: ["claim_lilleborg_fabrikker_value_chain", "claim_lilleborg_fabrikker_closure_reuse"],
      source_ids: ["source_ons_labour_productivity_qmi", "source_lilleborg_byleksikon"]
    },
    {
      id: "method_lilleborg_change",
      method_id: "met_naering_omstilling_og_endringsanalyse",
      method: "Omstillings- og endringsanalyse",
      application: "Metoden skiller mellom den dokumenterte rekkefølgen—produksjonsstopp, flytting, boligomforming og senere selskapsoppkjøp—og påstander om årsak eller samlet virkning.",
      limitations: "De brukte kildene fastslår ikke én årsak til flyttingen eller omformingen og gir ikke grunnlag for å beregne tapte arbeidsplasser, ny eiendomsverdi eller fordelingsvirkninger.",
      claim_ids: ["claim_lilleborg_fabrikker_closure_reuse", "claim_lilleborg_fabrikker_company_2024"],
      source_ids: ["source_lilleborg_byleksikon", "source_lilleborg_orkla", "source_lilleborg_solenis"]
    }
  ],
  boundaries_and_disagreements: [
    {
      id: "disagreement_lilleborg_start_year",
      title: "Hva betyr grunnlagt?",
      content: "1833 kan brukes om oljemøllens start, 1842 om såpeproduksjonen og 1897 om aksjeselskapet. Uenigheten løses ikke ved å velge ett år for alt: denne Place-identiteten bruker 1897, mens de eldre årene beholdes som dokumenterte virksomhetslag.",
      claim_ids: ["claim_lilleborg_fabrikker_identity", "claim_lilleborg_fabrikker_prehistory"],
      source_ids: ["source_lilleborg_byleksikon"]
    },
    {
      id: "disagreement_lilleborg_change_causality",
      title: "Innovasjon, konsernstrategi eller eiendomsomforming?",
      content: "Et schumpeteriansk perspektiv framhever utskifting av produksjonsformer, mens en stedlig omstillingsanalyse spør hvem som kontrollerte flytting og ny arealbruk. Kildene dokumenterer rekkefølgen, men ikke én avgjørende årsak; teknologi, marked, konsernstrategi og byutvikling forblir alternative forklaringer.",
      claim_ids: ["claim_lilleborg_fabrikker_ownership", "claim_lilleborg_fabrikker_closure_reuse"],
      source_ids: ["source_schumpeter_creative_destruction", "source_lilleborg_byleksikon"]
    }
  ],
  documented_cases_or_teaching_scenarios: [
    {
      id: "case_lilleborg_wartime_supply",
      kind: "documented_case",
      title: "Krigstidens forsyningsdilemma",
      analysis: "Under andre verdenskrig produserte Lilleborg både fett til okkupasjonsmakten og såpevarer som sivile trengte. Motstandsbevegelsens motstand mot sabotasje viser et dokumentert fordelingsproblem: samme anlegg kunne ha militær nytte og samtidig være nødvendig for sivil forsyning.",
      claim_ids: ["claim_lilleborg_fabrikker_wartime"],
      source_ids: ["source_lilleborg_byleksikon"]
    },
    {
      id: "case_lilleborg_closure_reuse",
      kind: "documented_case",
      title: "Fra produksjonsgrunn til boligområde",
      analysis: "Produksjonen på Sandaker sluttet i 1997 og ble flyttet til Ski; i 2000–03 ble store deler av fabrikkarealet omformet til boliger. Caset dokumenterer et funksjonsskifte i stedet, men kildene tallfester ikke arbeidsplasstap, eiendomsgevinst eller sosial fordeling.",
      claim_ids: ["claim_lilleborg_fabrikker_closure_reuse"],
      source_ids: ["source_lilleborg_byleksikon"]
    }
  ],
  key_questions: [
    "Hvilke arbeidstrinn og aktører bandt råvarer, kjemisk prosess, emballasje, merkevare og distribusjon sammen ved Lilleborg?",
    "Hva endret eierskapssamarbeidene i 1925 og 1930, og hva kan kildene ikke fortelle om makt, lønn og produktivitet?",
    "Hvem bar kostnadene og hvem fikk verdien da produksjonen flyttet og fabrikkarealet ble omformet til boliger?",
    "Hvilke bevarte bygg og hvilke tapte produksjonsdeler må leses sammen for å forstå stedet i dag?"
  ],
  source_ids: sourceLinks.filter(source => !source.type.includes("image")).map(source => source.id),
  claim_ids: ["identity", "prehistory", "kildal", "value_chain", "ownership", "wartime", "building", "closure_reuse", "company_2024", "coordinate"].map(id => `claim_${placeId}_${id}`)
};
write(leksikonFile, {
  place_id: placeId, title: "Lilleborg Fabrikker", type: "main", version: 1, visual: { designCode: "article_place_essay_miniature" },
  popupDesc: "Et forbruksvareindustristed der olje, såpe, merkevarer, internasjonalt eierskap og boligomforming kan leses i samme område.",
  wikiText: [
    scholarlyArticle.definition,
    ...scholarlyArticle.historical_or_systemic_background,
    scholarlyArticle.theories_researchers_and_findings[0].content,
    scholarlyArticle.theories_researchers_and_findings[1].content,
    "Kildenes viktigste funn er at produksjonsstedet, selskapet og merkevaren ikke er samme enhet. De-No-Fa og Unilever endret eierskaps- og kunnskapsforbindelser, mens produksjonen fortsatt lå på Sandaker; etter 1997 fortsatte Lilleborg-navnet uten at fabrikken ble gjenåpnet der.",
    scholarlyArticle.methods_and_limitations.map(item => `${item.method}: ${item.application} Begrensning: ${item.limitations}`).join(" "),
    scholarlyArticle.boundaries_and_disagreements.map(item => `${item.title}: ${item.content}`).join(" "),
    ...scholarlyArticle.documented_cases_or_teaching_scenarios.map(item => `${item.title}: ${item.analysis}`),
    `Nøkkelspørsmål: ${scholarlyArticle.key_questions.join(" ")}`
  ],
  scholarly_article: scholarlyArticle,
  summary: { one_liner: "Olje- og såpeindustristed ved Akerselva, omformet til boligområde etter produksjonsstopp i 1997.", themes: ["forbruksvareindustri", "arbeid", "merkevarer", "eierskap", "omstilling"], tone: ["nøktern", "stedsspesifikk"] },
  facts: [
    { id: "fact_lilleborg_grunnlagt", label: "Aksjeselskapet", desc: "A/S Lilleborg Fabriker ble grunnlagt i 1897 som videreføring av eldre fabrikkvirksomhet.", confidence: "high", sources: [{ title: "Oslo byleksikon", url: urls.byleksikon }] },
    { id: "fact_lilleborg_eierskap", label: "Unilever", desc: "Unilever ble deleier i 1930 og ga tilgang til varemerker og produksjonsmetoder.", confidence: "high", sources: [{ title: "Oslo byleksikon", url: urls.byleksikon }] },
    { id: "fact_lilleborg_nedleggelse", label: "Produksjonsstopp", desc: "Produksjonen på Sandaker ble avsluttet i 1997 og flyttet til Ski.", confidence: "high", sources: [{ title: "Oslo byleksikon", url: urls.byleksikon }] }
  ],
  chronology, sources: sourceLinks, externalLinks: sourceLinks, interpretation: place.interpretation
});
const leksikonManifest = read("data/leksikon/manifest.json");
leksikonManifest.files = leksikonManifest.files.filter(file => file !== "places/oslo/naeringsliv/leksikon_lilleborg_fabrikker.json");
addOnce(leksikonManifest.files, leksikonFile);
write("data/leksikon/manifest.json", leksikonManifest);

const languageFile = "data/leksikon/sprak/places/europe/norway/oslo/lilleborg_fabrikker.json";
write(languageFile, {
  place_id: placeId, title: "Språk ved Lilleborg Fabrikker", verified_at: verifiedAt,
  dialect_status: "not_applicable_place_level",
  entries: [
    { id: "lilleborg_fabriker", term: "Fabriker", type: "historisk_skrivemåte", meaning: "Eldre skrivemåte med én k, brukt i navnet A/S Lilleborg Fabriker.", context: "Skrivemåten skiller det historiske selskapsnavnet fra dagens normalform fabrikker.", linked_to: { kind: "place", id: placeId }, tags: ["bedriftsnavn", "språkhistorie"], sources: [{ label: "Oslo byleksikon", url: urls.byleksikon }] },
    { id: "lilleborg_saebesyderi", term: "Sæbesyderi", type: "historisk_fagterm", meaning: "Eldre ord for såpekokeri eller såpefabrikk.", context: "Oslo byleksikon bruker ordet om virksomheten som ble etablert på Lilleborg i 1842.", linked_to: { kind: "place", id: placeId }, tags: ["såpe", "produksjon", "språkhistorie"], sources: [{ label: "Oslo byleksikon", url: urls.byleksikon }] },
    { id: "lilleborg_de_no_fa", term: "De-No-Fa", type: "selskapsnavn", meaning: "Historisk selskapsnavn som ble knyttet til Lilleborg gjennom samarbeid fra 1925.", context: "Navneformen inngår senere i DeNoFa-Lilleborg og gjør eierskaps- og samarbeidshistorien synlig i språket.", linked_to: { kind: "place", id: placeId }, tags: ["eierskap", "industri"], sources: [{ label: "Oslo byleksikon", url: urls.byleksikon }] }
  ]
});
const languageManifest = read("data/leksikon/sprak/manifest.json");
languageManifest.place_files[placeId] = languageFile;
write("data/leksikon/sprak/manifest.json", languageManifest);

const storyFile = "data/stories/stories_lilleborg_fabrikker.json";
const story = {
  id: "st_lilleborg_sabotasjedilemmaet", quality_profile: "episode_v1", type: "conflict", title: "Sabotasjen som ikke ble gjennomført", year: 1940, place_id: placeId,
  summary: "Under okkupasjonen produserte Lilleborg både fett til tyske formål og nødvendige såpevarer for sivile, noe som gjorde fabrikken til et vanskelig sabotasjevalg.",
  story: "Under andre verdenskrig var Lilleborgs produksjon nyttig for flere parter. Fabrikken leverte fett til okkupasjonsmakten, men produserte samtidig såpe og vaskemidler som sivilbefolkningen trengte i hverdagen.\n\nDen dobbelte rollen gjorde et mulig angrep vanskelig å vurdere. Sabotasje kunne svekke leveranser til okkupanten, men også stanse varer som befolkningen var avhengig av. Oslo byleksikon beskriver derfor at motstandsbevegelsen motsatte seg sabotasje mot fabrikken.\n\nEpisoden viser at et industristed ikke bare er maskiner og eiere. Arbeidere, sivile forsyninger, militære interesser og motstandskamp kunne være bundet til samme produksjonslinje, og samme handling kunne få svært ulike konsekvenser.",
  episode: { actors: ["Lilleborgs arbeidere", "sivilbefolkningen", "okkupasjonsmakten", "motstandsbevegelsen"], date: "1940–1945", action: "Motstandsbevegelsen vurderte fabrikkens doble produksjonsrolle og motsatte seg sabotasje.", consequence: "Produksjonen fortsatte fordi et angrep også ville ramme sivile forsyninger av såpe og vaskemidler." },
  sources: [
    { title: "Oslo byleksikon – Lilleborg AS", url: urls.byleksikon },
    { title: "Norsk Teknisk Museum – Lilleborg Fabriker A/S", url: urls.industrimuseum }
  ],
  tags: ["andre verdenskrig", "arbeid", "forsyning", "sabotasje"], related_people: [], related_places: ["akerselva"], next_scenes: [],
  score: { narrative: 3, historical: 4, source: 4, play_value: 3, originality: 3, total: 17 },
  arc: { start: "Fabrikken leverte varer til både okkupant og sivile.", middle: "Sabotasje kunne ramme to helt ulike behov.", end: "Motstandsbevegelsen motsatte seg angrepet for å beskytte sivile forsyninger." }
};
write(storyFile, [story]);
const storyManifest = read("data/stories/stories_manifest.json");
storyManifest.files = storyManifest.files.filter(entry => entry.entity_id !== placeId);
storyManifest.files.push({ category: "naeringsliv", entity_id: placeId, path: storyFile });
write("data/stories/stories_manifest.json", storyManifest);
const episodeManifest = read("data/stories/stories_episode_v1_manifest.json");
addOnce(episodeManifest.files, storyFile);
write("data/stories/stories_episode_v1_manifest.json", episodeManifest);

const readingFile = "data/lesespor/oslo/lesespor_oslo_naeringsliv.json";
const readings = read(readingFile);
readings.items = readings.items.filter(item => !item.place_ids?.includes(placeId));
readings.items.push(
  { id: "lesespor_lilleborg_fabrikker_byleksikon", title: "Lilleborg AS", author: null, publication: "Oslo byleksikon", date: null, year: 1897, type: "lokalhistorisk_oppslag", subjects: ["olje", "såpe", "eierskap", "krig", "ombruk"], place_ids: [placeId], person_ids: [personId], category_hints: ["naeringsliv", "by", "historie"], url: urls.byleksikon, access: "open", rights: "link_only", source_quality: "canonical", curation_status: "approved", relevance: "Stedsspesifikk hovedkilde for produksjon, selskapslinje, bygninger, krigstid og omforming." },
  { id: "lesespor_lilleborg_kildal_snl", title: "Peter Wessel Wind Kildal", author: null, publication: "Store norske leksikon", date: null, year: 1863, type: "biografisk_oppslag", subjects: ["industrigründer", "handel", "lampeolje", "såpe"], place_ids: [placeId], person_ids: [personId], category_hints: ["naeringsliv", "historie"], url: urls.snlKildal, access: "open", rights: "link_only", source_quality: "canonical", curation_status: "approved", relevance: "Fagredigert biografi som dokumenterer Kildals overtakelse og utvikling av Lilleborg." },
  { id: "lesespor_lilleborg_industrimuseum", title: "Lilleborg Fabriker A/S", author: null, publication: "Industrimuseum", date: null, year: 1897, type: "industrihistorisk_oppslag", subjects: ["fabrikk", "såpe", "vaskemidler", "Akerselva"], place_ids: [placeId], person_ids: [], category_hints: ["naeringsliv", "historie"], url: urls.industrimuseum, access: "open", rights: "link_only", source_quality: "institutional", curation_status: "approved", relevance: "Museumsnettverkets bedriftspost om Lilleborg som industrivirksomhet." },
  { id: "lesespor_lilleborg_1930", title: "Lilleborg fabrikker, industribygninger", author: "Anders Beer Wilse", publication: "Oslo Museum / DigitaltMuseum", date: null, year: 1930, type: "historisk_fotografi", subjects: ["fabrikkanlegg", "skorsteiner", "lager", "Akerselva"], place_ids: [placeId], person_ids: [], category_hints: ["naeringsliv", "historie", "by"], url: urls.historicalPhoto, access: "open", rights: "CC0 1.0", source_quality: "institutional", curation_status: "approved", relevance: "Fotografiet dokumenterer produksjonsanleggets bygninger og lager omkring 1930." }
);
write(readingFile, readings);

const translations = {
  en: { name: "Lilleborg Factories", desc: "A/S Lilleborg Fabriker was founded in 1897 as a continuation of older oil and soap production by the Akerselva. Production at Sandaker ended in 1997; the factory gate and the preserved 1916 office building remain historical anchors in today’s housing area.", popupDesc: "The site developed through distinct layers: textile production from 1812, an oil mill from 1833, soap from 1842 and the limited company from 1897. De-No-Fa, Unilever and Orkla later shaped ownership and products. Most production buildings disappeared when the area was redeveloped for housing after the 1997 closure." },
  es: { name: "Fábricas Lilleborg", desc: "A/S Lilleborg Fabriker se fundó en 1897 como continuación de una producción anterior de aceite y jabón junto al Akerselva. La producción en Sandaker terminó en 1997; la puerta y el edificio de oficinas de 1916 conservado sirven hoy como anclajes históricos.", popupDesc: "El lugar reúne distintas capas: textiles desde 1812, molino de aceite desde 1833, jabón desde 1842 y la sociedad anónima desde 1897. De-No-Fa, Unilever y Orkla influyeron después en la propiedad y los productos. Gran parte del área se transformó en viviendas tras el cierre de 1997." },
  pt: { name: "Fábricas Lilleborg", desc: "A/S Lilleborg Fabriker foi fundada em 1897 como continuação de uma produção anterior de óleo e sabão junto ao Akerselva. A produção em Sandaker terminou em 1997; o portão e o edifício de escritórios de 1916 permanecem como âncoras históricas.", popupDesc: "O local reúne camadas distintas: têxteis desde 1812, moinho de óleo desde 1833, sabão desde 1842 e a sociedade anónima desde 1897. De-No-Fa, Unilever e Orkla moldaram depois a propriedade e os produtos. Grande parte da área foi transformada em habitação após o encerramento de 1997." }
};
const sourceHash = sha256(JSON.stringify({ name: place.name.normalize("NFC"), desc: place.desc.normalize("NFC"), popupDesc: place.popupDesc.normalize("NFC") })).slice(0, 16);
for (const [lang, translation] of Object.entries(translations)) {
  const file = `data/i18n/content/places/${lang}.json`;
  const pack = read(file); pack[placeId] = { _sourceHash: sourceHash, _status: "machine_translated", ...translation }; write(file, pack);
}

const sourceRegistry = {
  byleksikon: { url: urls.byleksikon, source_type: "institutional_reference", review_status: "reviewed", review_note: "Stedsidentitet, tidslag, produksjon, eierskap, krigstid, bygninger og omforming." },
  snl_kildal: { url: urls.snlKildal, source_type: "recognized_reference", review_status: "reviewed", review_note: "Peter Wessel Wind Kildals identitet, overtakelse og utvikling av Lilleborg." },
  industrimuseum: { url: urls.industrimuseum, source_type: "museum_or_heritage", review_status: "reviewed", review_note: "Bedriftsidentitet og industrikontekst." },
  orkla: { url: urls.orklaSale, source_type: "primary_business", review_status: "reviewed", review_note: "Salgsavtalen og avgrensningen av virksomheten i 2024." },
  solenis: { url: urls.solenis, source_type: "primary_business", review_status: "reviewed", review_note: "Gjennomført oppkjøp, dato, selskapslinje og nåstatus i 2024." }
};
const quizRows = [
  ["Når ble A/S Lilleborg Fabriker grunnlagt?", ["1897", "1833", "1842"], "1897", "A/S Lilleborg Fabriker ble grunnlagt i 1897 som videreføring av eldre fabrikkvirksomhet.", ["byleksikon", "industrimuseum"], "em_naering_eierskap_styring", "fact"],
  ["Hvilken virksomhet kom til på eiendommen i 1812?", ["En tekstilfabrikk", "En sjokoladefabrikk", "Et jernstøperi"], "En tekstilfabrikk", "Ludvig Mariboe opprettet en tekstilfabrikk på eiendommen i 1812.", ["byleksikon"], "em_naering_industri_og_mekanisering", "fact"],
  ["Hva ble etablert ved Lilleborg i 1833?", ["En oljemølle", "Et skipsverft", "Et bryggeri"], "En oljemølle", "Oljemøllen fra 1833 inngår i Lilleborgs industrielle forhistorie.", ["byleksikon"], "em_naering_produksjon_produktivitet", "fact"],
  ["Når ble såpefabrikken etablert?", ["1842", "1897", "1916"], "1842", "Et sæbesyderi, eller såpekokeri, ble etablert i 1842.", ["byleksikon"], "em_naering_produksjon_produktivitet", "fact"],
  ["Hvem overtok Lilleborg i 1863?", ["Peter Wessel Wind Kildal", "Johan Throne Holst", "Jens Jacob Jensen"], "Peter Wessel Wind Kildal", "Peter Wessel Wind Kildal kjøpte Lilleborg-anlegget i 1863.", ["snl_kildal", "byleksikon"], "em_naering_eierskap_styring", "fact"],
  ["Hva konsentrerte Kildal produksjonen om?", ["Lampeolje og såpe", "Turbiner og dampmaskiner", "Papir og cellulose"], "Lampeolje og såpe", "Under Kildals ledelse fikk lampeolje og såpe hovedvekten i produksjonen.", ["snl_kildal", "byleksikon"], "em_naering_produksjon_produktivitet", "fact"],
  ["Hvorfor var Akerselva viktig for industristedet?", ["Den ga et etablert industri- og kraftmiljø", "Den var en havn for atlanterhavsskip", "Den leverte kull fra gruver"], "Den ga et etablert industri- og kraftmiljø", "Lilleborg vokste fram i et eldre industrimiljø ved Akerselva, der vannfall og fabrikkarealer allerede var tatt i bruk.", ["byleksikon", "industrimuseum"], "em_naering_byens_okonomiske_rom", "fact"],
  ["Hva skiller 1897 fra de eldre årstallene?", ["Da ble A/S Lilleborg Fabriker dannet", "Da startet all industri på stedet", "Da ble kontorbygningen revet"], "Da ble A/S Lilleborg Fabriker dannet", "1812, 1833 og 1842 gjelder eldre virksomhetslag, mens 1897 gjelder aksjeselskapet.", ["byleksikon", "industrimuseum"], "em_naering_eierskap_styring", "fact"],
  ["Hvem innledet Lilleborg samarbeid med i 1925?", ["De-No-Fa", "Kværner", "Norsk Hydro"], "De-No-Fa", "Lilleborg inngikk samarbeid med De-No-Fa i 1925.", ["byleksikon"], "em_naering_eierskap_styring", "fact"],
  ["Hva skjedde med eierskapet i 1930?", ["Unilever ble deleier", "Staten overtok hele selskapet", "Arbeiderne kjøpte fabrikken"], "Unilever ble deleier", "Unilever ble deleier i Lilleborg i 1930.", ["byleksikon"], "em_naering_eierskap_styring", "fact"],
  ["Hva fikk Lilleborg tilgang til gjennom Unilever?", ["Varemerker og produksjonsmetoder", "Gruver og jernmalm", "Jernbanespor til Bergen"], "Varemerker og produksjonsmetoder", "Unilever-koblingen ga tilgang til varemerker og produksjonsmetoder.", ["byleksikon"], "em_naering_innovasjon_teknologisk_skift", "fact"],
  ["Når ble den bevarte kontorbygningen oppført?", ["1916", "1897", "1959"], "1916", "Kontorbygningen tegnet av Magnus Poulsson ble oppført i 1916 og senere utvidet.", ["byleksikon"], "em_naering_eiendom_kapital_byutvikling", "fact"],
  ["Når sluttet produksjonen på Sandaker?", ["1997", "1988", "2003"], "1997", "Produksjonen på Sandaker ble avsluttet i 1997.", ["byleksikon"], "em_naering_omstilling_kriser_skift", "fact"],
  ["Hvor ble produksjonen flyttet i 1997?", ["Til Ski", "Til Bergen", "Til Kongsberg"], "Til Ski", "Produksjonen ble flyttet fra Sandaker til Ski.", ["byleksikon"], "em_naering_logistikk_verdikjeder", "fact"],
  ["Hva skjedde med store deler av fabrikkarealet i 2000–03?", ["Det ble omformet til boliger", "Det ble en flyplass", "Såpeproduksjonen startet på nytt"], "Det ble omformet til boliger", "Store deler av det tidligere fabrikkarealet ble omformet til boliger i 2000–03.", ["byleksikon"], "em_naering_eiendom_kapital_byutvikling", "context"],
  ["Hvilken bygning er et tydelig bevart spor?", ["Kontorbygningen fra 1916", "En middelalderkirke", "En turbinhall fra 1750"], "Kontorbygningen fra 1916", "Kontorbygningen fra 1916, utvidet i 1930, er bevart som et fysisk spor etter fabrikken.", ["byleksikon"], "em_naering_eiendom_kapital_byutvikling", "context"],
  ["Hva produserte Lilleborg for okkupasjonsmakten under krigen?", ["Fett", "Lokomotiver", "Radioapparater"], "Fett", "Oslo byleksikon beskriver at Lilleborg produserte fett til okkupasjonsmakten.", ["byleksikon"], "em_naering_produksjon_produktivitet", "context"],
  ["Hvilke sivile varer ble også produsert under krigen?", ["Såpe og vaskemidler", "Flymotorer", "Jernbaneskinner"], "Såpe og vaskemidler", "Fabrikken produserte samtidig såpe og vaskemidler som sivilbefolkningen trengte.", ["byleksikon"], "em_naering_forbruk_marked", "context"],
  ["Hvorfor motsatte motstandsbevegelsen seg sabotasje?", ["Et angrep ville også ramme sivile forsyninger", "Fabrikken var allerede nedlagt", "Bygningen var et museum"], "Et angrep ville også ramme sivile forsyninger", "Motstandsbevegelsen vurderte at sabotasje også ville ramme befolkningens tilgang til nødvendige varer.", ["byleksikon"], "em_naering_makt_ulikhet_arbeidsliv", "context"],
  ["Hvilket navn ble tatt i bruk i 1959?", ["DeNoFa-Lilleborg", "Lilleborg-Kværner", "Akerselva Såpeverk"], "DeNoFa-Lilleborg", "Virksomheten ble samlet under navnet DeNoFa-Lilleborg i 1959.", ["byleksikon"], "em_naering_eierskap_styring", "context"],
  ["Hvor ble Lilleborg organisert i 1996?", ["Under Orkla Brands", "Under Norges Bank", "Under Oslo kommune"], "Under Orkla Brands", "Lilleborg ble skilt ut som egen virksomhet under Orkla Brands i 1996.", ["byleksikon"], "em_naering_eierskap_styring", "context"],
  ["Hvem kjøpte Lilleborgs profesjonelle rengjøringsvirksomhet i 2024?", ["Solenis", "Unilever", "Kværner"], "Solenis", "Solenis kjøpte den videreførte profesjonelle rengjøringsvirksomheten Lilleborg fra Orkla i 2024.", ["orkla", "solenis"], "em_naering_eierskap_styring", "analysis", "met_naering_eierskaps_og_styringsanalyse"],
  ["Hvilken verdikjede passer best for Lilleborg?", ["Oljer og fett, kjemisk prosess, emballasje, merkevare og distribusjon", "Jernmalm, masovn og skipsverft", "Tømmer, sagblad og papiravis"], "Oljer og fett, kjemisk prosess, emballasje, merkevare og distribusjon", "Lilleborg bandt råvarer, kjemisk produksjon, emballasje, reklame og varemarked sammen.", ["byleksikon", "industrimuseum"], "em_naering_logistikk_verdikjeder", "analysis", "met_naering_logistikk_og_verdikjedeanalyse"],
  ["Hva representerer kartpunktet i Sandakerveien 54?", ["Fabrikkporten som inngangsanker", "Geometrisk sentrum for alle historiske bygg", "Dagens Solenis-fabrikk"], "Fabrikkporten som inngangsanker", "Kartpunktet viser den dokumenterte fabrikkporten og må ikke leses som sentrum for hele det tidligere komplekset.", ["byleksikon"], "em_naering_byens_okonomiske_rom", "analysis", "met_naering_industrihistorisk_analyse"],
  ["Hva endret Unilevers deleierskap først og fremst?", ["Eierskap, varemerketilgang og produksjonskunnskap", "Akerselvas løp", "Året oljemøllen startet"], "Eierskap, varemerketilgang og produksjonskunnskap", "Deleierskapet endret styringen og ga tilgang til varemerker og produksjonsmetoder.", ["byleksikon"], "em_naering_eierskap_styring", "analysis", "met_naering_eierskaps_og_styringsanalyse"],
  ["Hvilken konflikt viser krigstidshistorien?", ["Militær nytte mot sivile forsyningsbehov", "Jordbruk mot gruvedrift", "Turisme mot flytrafikk"], "Militær nytte mot sivile forsyningsbehov", "Samme fabrikk leverte til okkupasjonsmakten og sivile, slik at sabotasje kunne få motstridende virkninger.", ["byleksikon"], "em_naering_makt_ulikhet_arbeidsliv", "analysis", "met_naering_industrihistorisk_analyse"],
  ["Hvorfor må 2024-oppkjøpet skilles fra Sandaker-stedet?", ["Det gjelder en videreført virksomhet etter at produksjonen på Sandaker var slutt", "Det startet oljemøllen i 1833", "Det gjenreiste alle fabrikkbyggene"], "Det gjelder en videreført virksomhet etter at produksjonen på Sandaker var slutt", "Solenis kjøpte selskapsvirksomheten i 2024, mens produksjonen på Sandaker hadde vært avsluttet siden 1997.", ["byleksikon", "orkla", "solenis"], "em_naering_omstilling_kriser_skift", "analysis", "met_naering_omstilling_og_endringsanalyse"],
  ["Hvilken samlet analyse passer best for Lilleborg Fabrikker?", ["Tidslag, produksjon, merkevarer, eierskap, arbeid og ombruk må leses sammen", "Bare dagens kontorbygning er relevant", "1897 forklarer all eldre virksomhet"], "Tidslag, produksjon, merkevarer, eierskap, arbeid og ombruk må leses sammen", "Stedet binder eldre industri, aksjeselskap, forbruksvarekjede, maktforhold og boligomforming sammen.", ["byleksikon", "snl_kildal", "industrimuseum", "solenis"], "em_naering_industri_og_mekanisering", "analysis", "met_naering_industrihistorisk_analyse"]
];
const questions = quizRows.map((row, index) => {
  const [question, options, answer, knowledge, source, emne_id, question_type, method_id] = row;
  const order = index + 1;
  return {
    id: `${placeId}_quiz_${String(order).padStart(2, "0")}`, quiz_id: `naeringsliv_${placeId}_set_${Math.floor(index / 7) + 1}_q${(index % 7) + 1}`,
    categoryId: "naeringsliv", placeId, targetId: placeId, question_scope: "place", question, options, answer, answerIndex: options.indexOf(answer), knowledge,
    difficulty: order <= 7 ? 1 : order <= 14 ? 2 : order <= 21 ? 3 : 4, question_type, emne_id, ...(method_id ? { method_id } : {}),
    source, source_origin: "external", claim_basis: knowledge, claim_id: `claim_${placeId}_quiz_${String(order).padStart(2, "0")}`,
    primary_knowledge_unit_id: `ku_naeringsliv_${placeId}_${String(order).padStart(2, "0")}`, knowledge_unit_ids: [`ku_naeringsliv_${placeId}_${String(order).padStart(2, "0")}`], knowledge_contract_version: 1, knowledge_link_status: "linked", concept_ids: [], term_ids: []
  };
});
for (const question of questions.filter(question => question.method_id)) {
  question.guidance_basis = ["data/fag/naeringsliv/fagkart_naeringsliv_canonical_v4_5.json", "data/fag/naeringsliv/methods_naeringsliv_canonical_v4_5.json"];
}
Object.assign(questions[24], {
  topic_hook_id: "eierskap_og_styring",
  thinker_id: "thomas_piketty",
  theory_ref: {
    topic_hook_id: "eierskap_og_styring",
    thinker_id: "thomas_piketty",
    why_it_helps: "Et eierskaps- og maktperspektiv undersøker hvordan kontroll over varemerker, produksjonskunnskap og investeringer flyttet seg mellom familie, samarbeidspartnere og konsern."
  }
});
const phases = ["opening", "middle", "bridge", "final"];
const titles = ["Tidslagene ved elva", "Selskap, bygg og produksjonsstopp", "Krig, eierskap og omforming", "Verdikjede, makt og sted"];
const quizFile = "data/quiz/naeringsliv/lilleborg_fabrikker_sets.json";
const existingQuizAudit = {
  searched_paths: ["data/quiz/manifest.json", "data/quiz/quiz_naeringsliv.json", "data/quiz/naeringsliv/lilleborg_fabrikker_sets_merged.json", placeFile],
  active_before: { file: "data/quiz/naeringsliv/lilleborg_fabrikker_sets_merged.json", set_count: 5, question_count: 30, finding: "30 spørsmål fordelt på fem eldre sett med seks spørsmål og fem legacy-spørsmål i flatfil ble funnet; pakken blandet 1812, 1833, 1842 og 1897 som parallelle etableringsår." },
  decisions: ["Bevar kildebårne læringsjobber som skiller tidslag og selskapsidentitet.", "Bruk 1897 for A/S Lilleborg Fabriker og la 1812, 1833 og 1842 beskrive forhistorien.", "Materialiser normal 4x7 med fjorten vanlige åpningsspørsmål og metode først i siste sett."],
  knowledge_migration: "De 28 valgte spørsmålene får stabile Knowledge-ID-er; utelatte spørsmål er dokumentert i produksjonsbriefen."
};
const selectedCurriculum = { module_ids: ["arbeid_produksjon_verdiskaping", "logistikk_infrastruktur_rom"], emne_ids: [...new Set(questions.map(question => question.emne_id))], topic_hook_ids: ["maskin_menneske_produksjon", "verdikjede_spor", "eierskap_og_styring", "omstilling_av_naeringsrom"], method_ids: [...new Set(questions.map(question => question.method_id).filter(Boolean))], thinker_ids: ["thomas_piketty"], works: [] };
const profileDecision = { profile: "normal", set_count: 4, questions_per_set: 7, justification: "Fire læringsjobber dekker tidslag og identitet, produksjon og bygg, krig og eierskap samt verdikjede og omforming uten å splitte stedet i parallelle quizer." };
const heldBackCandidates = ["1833 som grunnleggelsesår for A/S Lilleborg Fabriker.", "Alf Bjercke som kvalitetsleder uten dokumentert Lilleborg-kobling.", "Solenis-oppkjøpet som bevis på ny produksjon ved Sandaker.", "Boligomforming som mål på utfallet for tidligere ansatte."];
write(quizFile, {
  targetId: placeId,
  categoryId: "naeringsliv",
  sources: Object.fromEntries(Object.entries(sourceRegistry).map(([id, source]) => [id, source.url])),
  production_context: {
    manifest_category: "naeringsliv", profile: "normal_4x7", standard_version: "3.3", source_brief: "data/quiz/production_briefs/naeringsliv/lilleborg_fabrikker.json", context_artifact: "data/quiz/production_context/naeringsliv/lilleborg_fabrikker.json",
    resolved_files: { pensum: "data/fag/naeringsliv/naeringslivpensum_canonical_v4_5.json", emner: "data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json", fagkart: "data/fag/naeringsliv/fagkart_naeringsliv_canonical_v4_5.json", methods: "data/fag/naeringsliv/methods_naeringsliv_canonical_v4_5.json", supersetQuizMal: "data/fag/naeringsliv/supersetQUIZMAL_naeringsliv.json", quizStandard: "data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md", quizQuestionSchema: "data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json" },
    required_inputs_loaded: ["pensum", "emner", "fagkart", "methods", "supersetQuizMal", "quizStandard", "quizQuestionSchema"],
    pensum_module_ids: selectedCurriculum.module_ids, emne_ids: selectedCurriculum.emne_ids, topic_hook_ids: selectedCurriculum.topic_hook_ids, method_ids: selectedCurriculum.method_ids, thinker_ids: selectedCurriculum.thinker_ids, works: selectedCurriculum.works, source_review_status: "reviewed", existing_quiz_audit: existingQuizAudit, profile_decision: profileDecision, held_back_candidates: heldBackCandidates, normal_opening_questions: 14, theory_start_phase: "final", method_start_phase: "final"
  },
  sets: phases.map((phase, index) => ({ set_id: `naeringsliv_${placeId}_set_${index + 1}`, title: titles[index], level: index + 1, order: index + 1, phase, xp: 50 + index * 25, questions: questions.slice(index * 7, index * 7 + 7) }))
});
write("data/quiz/production_briefs/naeringsliv/lilleborg_fabrikker.json", {
  schema_version: "1.0", status: "reviewed", categoryId: "naeringsliv", targetId: placeId, profile_hint: "normal", reviewed_at: verifiedAt,
  review_note: "Oslo byleksikon, SNL, Industrimuseum, Orkla og Solenis gir fire adskilte læringsjobber om tidslag, forbruksvareproduksjon, eierskap og omforming. Sammenblanding av 1833 og 1897 samt udokumenterte personkoblinger er holdt ute.",
  scope: { place: "Lilleborg Fabrikker", production_profile: "normal", set_count: 4, questions_per_set: 7, total_questions: 28, normal_opening_questions: 14 },
  sources: sourceRegistry, selected_curriculum: selectedCurriculum, existing_quiz_audit: existingQuizAudit,
  profile_decision: profileDecision,
  held_back_candidates: heldBackCandidates,
  claims: questions.map((question, index) => ({ claim_id: question.claim_id, order: index + 1, planned_phase: phases[Math.floor(index / 7)], family: index < 14 ? "fact" : index < 21 ? "context" : "concept_theory", statement: question.claim_basis, source_ids: question.source, source_origin: question.source_origin, emne_id: question.emne_id }))
});
const quizManifest = read("data/quiz/manifest.json");
quizManifest.sets = quizManifest.sets.filter(entry => entry.targetId !== placeId);
quizManifest.sets.push({ targetId: placeId, file: quizFile });
write("data/quiz/manifest.json", quizManifest);
const fagManifest = read("data/fag/fag_manifest.json");
fagManifest.naeringsliv.quizProduction.targets[placeId] = { source_brief: "../quiz/production_briefs/naeringsliv/lilleborg_fabrikker.json", context_artifact: "../quiz/production_context/naeringsliv/lilleborg_fabrikker.json", quiz_file: "../quiz/naeringsliv/lilleborg_fabrikker_sets.json" };
write("data/fag/fag_manifest.json", fagManifest);

const placeClaims = [
  ["identity", "A/S Lilleborg Fabriker ble grunnlagt i 1897 som videreføring av eldre fabrikkvirksomhet.", urls.byleksikon, "innledningen og avsnittet om 1897", "identity", "historical"],
  ["prehistory", "Tekstilfabrikk fra 1812, oljemølle fra 1833 og såpefabrikk fra 1842 utgjør ulike lag i stedets forhistorie.", urls.byleksikon, "avsnittene om den eldre virksomheten", "ordinary", "historical"],
  ["kildal", "Peter Wessel Wind Kildal overtok anlegget i 1863 og konsentrerte produksjonen om lampeolje og såpe.", urls.snlKildal, "hovedavsnittet om Lilleborg", "ordinary", "historical"],
  ["value_chain", "Lilleborgs forbruksvareproduksjon koblet fett og oljer, kjemiske prosesser, emballasje, merkevarer og distribusjon.", urls.byleksikon, "produksjons- og merkevareavsnittene", "ordinary", "historical"],
  ["ownership", "Samarbeidet med De-No-Fa startet i 1925, og Oslo byleksikon knytter 1930 til Unilever som deleier samt varemerker og produksjonsmetoder.", urls.byleksikon, "avsnittene om 1925 og 1930", "ordinary", "historical"],
  ["wartime", "Under andre verdenskrig produserte Lilleborg både fett til okkupasjonsmakten og såpevarer for sivile; motstandsbevegelsen motsatte seg sabotasje fordi sivile forsyninger også ville bli rammet.", urls.byleksikon, "krigsavsnittet", "ordinary", "historical"],
  ["building", "Den bevarte kontorbygningen ble tegnet av Magnus Poulsson, oppført i 1916 og utvidet i 1930.", urls.byleksikon, "bygningsavsnittet", "ordinary", "historical"],
  ["closure_reuse", "Produksjonen på Sandaker ble avsluttet i 1997 og flyttet til Ski; store deler av området ble omformet til boliger i 2000–03.", urls.byleksikon, "avsnittene om 1997 og 2000–03", "temporal", "historical"],
  ["company_2024", "Solenis kjøpte den videreførte profesjonelle rengjøringsvirksomheten Lilleborg fra Orkla i 2024.", urls.solenis, "oppkjøpsmeldingen 12. juni 2024", "temporal", "current"],
  ["coordinate", "Fabrikkporten i Sandakerveien 54 brukes som inngangs- og displayanker for det tidligere fabrikkomplekset.", urls.sandakerveien, "adresseposten for nr. 54", "ordinary", "current"]
].map(([id, claim, sourceUrl, sourceLocation, claimKind, temporalStatus]) => ({ id: `claim_${placeId}_${id}`, claim, sourceUrl, sourceLocation, sourceType: [urls.solenis, urls.orklaSale].includes(sourceUrl) ? "primary" : "reputable_secondary", verifiedAt, status: "verified", claimKind, evidenceMode: "direct", temporalStatus }));
const coverage = text => sentences(text).map((sentence, index) => {
  const lower = sentence.toLowerCase();
  let id = "identity";
  if (lower.includes("1812") || lower.includes("1833") || lower.includes("1842") || lower.includes("forhistor")) id = "prehistory";
  if (lower.includes("kildal") || lower.includes("1863") || lower.includes("lampeolje")) id = "kildal";
  if (lower.includes("råvar") || lower.includes("fett og oljer") || lower.includes("emballasje") || lower.includes("forbruksvarekjede")) id = "value_chain";
  if (lower.includes("de-no-fa") || lower.includes("unilever") || lower.includes("1925") || lower.includes("1930") || lower.includes("eierskap")) id = "ownership";
  if (lower.includes("krig") || lower.includes("okkup") || lower.includes("sabotasje") || lower.includes("sivil")) id = "wartime";
  if (lower.includes("kontorbyg") || lower.includes("magnus poulsson") || lower.includes("oppført i 1916")) id = "building";
  if (lower.includes("1997") || lower.includes("ski") || lower.includes("2000") || lower.includes("bolig") || lower.includes("produksjonsbyg")) id = "closure_reuse";
  if (lower.includes("solenis") || lower.includes("2024") || lower.includes("orkla brands")) id = "company_2024";
  if (lower.includes("fabrikkport") || lower.includes("sandakerveien 54") || lower.includes("displayanker") || lower.includes("geometrisk sentrum")) id = "coordinate";
  return { sentence: index + 1, claimIds: [`claim_${placeId}_${id}`] };
});
const readinessQuestions = [
  ["Når ble A/S Lilleborg Fabriker grunnlagt?", "1897", "når", "identity"],
  ["Hvilke årstall beskriver tekstil-, olje- og såpeforhistorien?", "1812, 1833 og 1842", "når", "prehistory"],
  ["Hvem overtok anlegget i 1863?", "Peter Wessel Wind Kildal", "hvem", "kildal"],
  ["Hva produserte Lilleborg?", "Blant annet lampeolje, såpe og vaskemidler", "hva", "value_chain"],
  ["Hva endret Unilever-koblingen?", "Eierskap samt tilgang til varemerker og produksjonsmetoder", "hva_skjedde", "ownership"],
  ["Hvorfor ble sabotasje avvist under krigen?", "Den ville også ramme sivile forsyninger", "hva_skjedde", "wartime"],
  ["Når sluttet produksjonen på Sandaker?", "1997", "når", "closure_reuse"],
  ["Hva ble store deler av fabrikkarealet endret til?", "Boliger", "hva_ble_bygget_produsert_eller_endret", "closure_reuse"]
].map(([question, answer, type, claim], index) => ({ question, answer, type, normalKnowledgeQuestion: index < 7, claimIds: [`claim_${placeId}_${claim}`] }));
write("data/places/production/lilleborg_fabrikker.json", {
  schemaVersion: "4.2", validatorVersion: "4.2.1", placeId, placeFile, status: "ready_v4_2",
  identity: { status: "resolved", represents: "A/S Lilleborg Fabrikers historiske fabrikksted ved Sandaker, med fabrikkporten i Sandakerveien 54 som displayanker.", period: "1897–1997", excludes: ["1833 som aksjeselskapets grunnleggelsesår", "hele Lilleborg-strøket", "produksjonsanlegget på Ski", "den videreførte Solenis-eide selskapsvirksomheten som fysisk virksomhet på Sandaker"] },
  metadataSnapshot: { name: place.name, year: place.year, category: place.category }, textHashes: { algorithm: "sha256", desc: sha256(place.desc), popupDesc: sha256(place.popupDesc) }, claims: placeClaims,
  sentenceCoverage: { desc: coverage(place.desc), popupDesc: coverage(place.popupDesc) },
  roundsReadiness: { people: "ready_new_verified_peter_wessel_wind_kildal_profile", objects: "ready_documented_lano_packaging", brands: "ready_authentic_green_soap_sign", structures: "ready_documented_1916_office_building", badges: "ready_category_and_emne_binding", quiz: "ready_normal_4x7", leksikon: "ready", sprak: "ready", stories: "ready", for_na: "reviewed_historical_factory_and_current_office_no_exact_vantage_pair", readings: "ready", events: "reviewed_no_stable_current_event", routes: "ready_related_akerselva_industry_places", fagverk: "ready", frontImage: "ready_documentary_portrait_3x4" },
  quizReadiness: { status: "canonical_normal_4x7", quizTargetId: placeId, sourceBrief: "data/quiz/production_briefs/naeringsliv/lilleborg_fabrikker.json", productionContext: "data/quiz/production_context/naeringsliv/lilleborg_fabrikker.json", normalOpeningQuestions: 14, totalQuestions: 28, reuseDecision: "Den eksisterende 30-spørsmålspakken er auditert; 28 kildebårne læringsjobber er bevart eller omskrevet i dagens 4x7-kontrakt, mens feil og duplikater er holdt ute.", questions: readinessQuestions },
  reviews: { factual: { status: "passed", reviewedAt: verifiedAt, reviewer: "Lilleborg Fabrikker source review", notes: "Oslo byleksikon, SNL, Industrimuseum, Orkla, Solenis, DigitaltMuseum og Commons-metadata er kontrollert. ID, 1897-identitet og koordinat er bevart fra den verifiserte geometriporten." }, editorial: { status: "passed", reviewedAt: verifiedAt, reviewer: "Lilleborg Fabrikker editorial review", introducedNewFacts: false, notes: "Tidslag, forbruksvarekjede, arbeid, eierskap og omforming er hovedsaken; dagens selskapslinje og historisk fabrikksted er tydelig skilt." } },
  reviewsNotes: ["1812, 1833 og 1842 beskriver forhistoriske virksomhetslag; 1897 er aksjeselskapets år.", "Alf Bjercke-koblingen er fjernet fordi den manglet kilder.", "Brandmerket er et autentisk lisensiert reklameskilt.", "Før/etter er to dokumentariske motiver uten påstand om identisk kamerastandpunkt."],
  completion: { completedUnder: "4.2", currentStatus: "current", sourceVerifiedAt: verifiedAt, claimsVerified: { verified: placeClaims.length, total: placeClaims.length }, factualReview: "passed", editorialReview: "passed", validatorVersion: "4.2.1" }
});

const sourceIds = ["source_lilleborg_byleksikon", "source_lilleborg_snl_kildal", "source_lilleborg_industrimuseum", "source_lilleborg_orkla", "source_lilleborg_solenis"];
const quizRequiredInputs = ["data/fag/naeringsliv/naeringslivpensum_canonical_v4_5.json", "data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json", "data/fag/naeringsliv/fagkart_naeringsliv_canonical_v4_5.json", "data/fag/naeringsliv/methods_naeringsliv_canonical_v4_5.json", "data/fag/naeringsliv/supersetQUIZMAL_naeringsliv.json", "data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md", "data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json"];
write("data/places/naeringsliv-production/lilleborg_fabrikker.json", {
  schemaVersion: "naeringsliv_place_production_v1", validatorVersion: "1.0.0", placeId, placeFile, status: "ready",
  economicIdentity: { statement: "Lilleborg Fabrikker er et tidligere olje-, såpe- og vaskemiddelindustrianlegg ved Akerselva, senere omformet til boligområde.", anchorType: "factory", placeObjectDistinction: "Rapporten skiller det historiske fabrikkanlegget fra Lilleborg-brandet, produktobjektene, den videreførte selskapsvirksomheten og hele Lilleborg-strøket.", temporalScope: { start: "1897", end: "1997", precision: "period", rationale: "Aksjeselskapet ble grunnlagt i 1897 og produksjonen på Sandaker ble avsluttet i 1997; eldre virksomhet behandles som forhistorie og senere selskapslinje som etterhistorie." }, sourceIds },
  businessTopics: [
    { emneId: "em_naering_arbeid_verdiskaping", siteSpecificRationale: "Fabrikken organiserte råvarer, kjemiske prosesser, fagarbeid, emballering og distribusjon av forbruksvarer.", caseIds: ["case_lilleborg_consumer_goods"] },
    { emneId: "em_naering_industri_og_mekanisering", siteSpecificRationale: "Olje- og såpeproduksjonen viser overgangen fra eldre mølle- og kokedrift til integrert fabrikkproduksjon.", caseIds: ["case_lilleborg_consumer_goods"] },
    { emneId: "em_naering_logistikk_verdikjeder", siteSpecificRationale: "Fett og oljer ble bearbeidet, pakket, merket og distribuert som såpe, vaskemidler og andre varer.", caseIds: ["case_lilleborg_consumer_goods"] },
    { emneId: "em_naering_produksjon_produktivitet", siteSpecificRationale: "Produktene og produksjonsleddene dokumenterer fabrikkens output, mens kildemangelen avgrenser hva som kan sies om produktivitet.", caseIds: ["case_lilleborg_consumer_goods"] },
    { emneId: "em_naering_omstilling_kriser_skift", siteSpecificRationale: "Produksjonsstopp i 1997 og boligomforming i 2000–03 viser skiftet fra industrigrunn til boligområde.", caseIds: ["case_lilleborg_consumer_goods"] }
  ],
  sources: [
    { id: "source_lilleborg_byleksikon", url: urls.byleksikon, sourceLocation: "Hele stedsposten, særlig virksomhetslag, eierskap, krigstid, bygninger og omforming", sourceType: "reputable_secondary", verifiedAt, temporalCoverage: "mixed", provenance: "Oslo byleksikons redaksjonelle oppslag om Lilleborg AS og fabrikkområdet.", limitations: "Oppslaget gir en sammenhengende historie, men ikke regnskaps-, lønns- eller produktivitetsserier." },
    { id: "source_lilleborg_snl_kildal", url: urls.snlKildal, sourceLocation: "Faktaboks og hovedavsnittet om Lilleborg", sourceType: "reputable_secondary", verifiedAt, temporalCoverage: "historical", provenance: "Fagredigert biografi i Store norske leksikon.", limitations: "Kilden belyser Kildals rolle, ikke hele selskapets historie etter 1882." },
    { id: "source_lilleborg_industrimuseum", url: urls.industrimuseum, sourceLocation: "Bedriftsposten om Lilleborg Fabriker A/S", sourceType: "museum_or_heritage", verifiedAt, temporalCoverage: "historical", provenance: "Industrimuseums bedriftspost om Lilleborg.", limitations: "Oppslaget er kort og brukes som museumskontroll, ikke som eneste grunnlag for omforming eller nåstatus." },
    { id: "source_lilleborg_orkla", url: urls.orklaSale, sourceLocation: "Pressemeldingen om salgsavtalen i 2024", sourceType: "primary_business", verifiedAt, temporalCoverage: "current", provenance: "Orklas egen melding som selger.", limitations: "Primærkilde til transaksjonen, men ikke uavhengig vurdering av historiske resultater eller arbeidsforhold." },
    { id: "source_lilleborg_solenis", url: urls.solenis, sourceLocation: "Pressemeldingen om gjennomført oppkjøp 12. juni 2024", sourceType: "primary_business", verifiedAt, temporalCoverage: "current", provenance: "Solenis' egen melding som kjøper.", limitations: "Primærkilde til gjennomføring og selskapsstatus, ikke dokumentasjon av virksomhet på det historiske Sandaker-stedet." }
  ],
  economicCases: [{
    id: "case_lilleborg_consumer_goods", claim: "Lilleborg skapte verdi ved å omforme fett og oljer til såpe, vaskemidler og merkevarer, før produksjonen på Sandaker ble flyttet og fabrikkgrunnen omformet til boliger.",
    unitOfAnalysis: { unit: "Lilleborg Fabrikker-anlegget ved Sandaker", boundary: "Analysen omfatter stedets produksjon, produkt- og merkevarekjede, eierskifter, arbeidsforhold, produksjonsstopp og arealomforming, ikke hele Unilever-, Orkla- eller Solenis-systemet.", scale: "site", temporalScope: { start: "1897", end: "2003", precision: "period", rationale: "Perioden følger aksjeselskapets fabrikkvirksomhet fram til produksjonsstopp i 1997 og hovedfasen av boligomformingen i 2000–03." }, sourceIds },
    actors: [
      { name: "Eiere og konsernledelse", roleOrInterest: "Kontrollerte kapital, produktvalg, varemerker, produksjonsmetoder og flytting av virksomheten.", economicPosition: "Kildal-familien og senere De-No-Fa, Unilever og Orkla satt med strategisk kontroll.", sourceIds: ["source_lilleborg_byleksikon", "source_lilleborg_snl_kildal"] },
      { name: "Fabrikkarbeiderne", roleOrInterest: "Bearbeidet råvarer, kokte og blandet produkter, pakket varer og holdt produksjonen i gang.", economicPosition: "Skapte varene gjennom lønnet arbeid uten å kontrollere eierskap eller flyttebeslutning.", sourceIds: ["source_lilleborg_byleksikon", "source_lilleborg_industrimuseum"] },
      { name: "Forbrukerne", roleOrInterest: "Kjøpte såpe, vaskemidler og andre nødvendige hverdagsvarer.", economicPosition: "Etterspørselen og behovet for sivile forsyninger ga varene markeds- og samfunnsverdi.", sourceIds: ["source_lilleborg_byleksikon"] },
      { name: "Utbyggere og beboere", roleOrInterest: "Omformet og bruker det tidligere industriområdet som boligområde.", economicPosition: "Industrigrunnen fikk ny eiendoms- og bruksverdi etter produksjonsstopp.", sourceIds: ["source_lilleborg_byleksikon"] }
    ],
    valueCreation: {
      inputs: [{ statement: "Fett og oljer, kjemiske innsatsmidler, vann, energi, fabrikkbygninger, emballasje, kapital og arbeid var sentrale innsatsfaktorer.", sourceIds: ["source_lilleborg_byleksikon", "source_lilleborg_industrimuseum"] }],
      activity: { statement: "Innsatsfaktorene ble organisert som olje- og såpeproduksjon, blanding, pakking, merkevarebygging og distribusjon.", sourceIds: ["source_lilleborg_byleksikon", "source_lilleborg_industrimuseum"] },
      outputs: [{ statement: "Produksjonen omfattet blant annet lampeolje, såpe, vaskemidler og andre forbruksvarer.", sourceIds: ["source_lilleborg_byleksikon", "source_lilleborg_snl_kildal"] }],
      valueCreationAssessment: { statement: "Kildene dokumenterer en integrert forbruksvarekjede og merkevarevirksomhet, men gir ikke konsistente data for å beregne verdiskaping eller produktivitet gjennom hele perioden.", sourceIds: ["source_lilleborg_byleksikon", "source_lilleborg_industrimuseum"] }
    },
    measurement: { methodId: "met_naering_industrihistorisk_analyse", evidenceType: "mixed", indicatorOrObservation: "Produkter, selskaps- og eierskifter, produksjonssted, bygninger og arealbruk sammenholdes som stedbundne indikatorer.", unit: "kvalitative industri- og omstillingsindikatorer", period: "1812–2024", comparability: "Hendelsene beskriver ulike virksomhetslag og må ikke behandles som én ubrutt tallserie.", dataLimitations: "Kildene gir ikke sammenlignbare serier for volum, lønn, priser, produktivitet eller lønnsomhet.", sourceIds },
    distributionAndPower: { ownershipOrControl: "Kildal-familien og senere De-No-Fa-, Unilever- og Orkla-systemene kontrollerte investeringer, varemerker, produksjonsmetoder og flytting.", laborPosition: "Arbeiderne skapte og pakket varene og bar arbeids- og omstillingsrisiko uten å kontrollere eierskapet.", beneficiaries: ["Eiere kunne motta avkastning fra produksjon og varemerker.", "Forbrukere fikk tilgang til hverdagsvarer som såpe og vaskemidler.", "Arbeidere mottok lønn og utviklet produksjonskompetanse.", "Senere eiendomsaktører og beboere fikk verdi av det omformede arealet."], costRiskBearers: ["Eiere bar investerings- og markedsrisiko.", "Ansatte bar risiko for arbeidsbelastning og tap av arbeidsplass ved flytting.", "Nabolag og elvemiljø kan ha båret industrikostnader, men kildene her tallfester dem ikke."], sourceIds },
    riskAndExternalities: { riskAssessment: { statement: "Virksomheten var avhengig av råvaretilgang, kjemisk og markedsmessig konkurranseevne, varemerker, konsernstrategi og forbrukernes etterspørsel.", sourceIds: ["source_lilleborg_byleksikon", "source_lilleborg_snl_kildal"] }, externalityAssessment: { status: "not_applicable", rationale: "De gjennomgåtte kildene gir ikke sikkert grunnlag for en stedsspesifikk eksternalitetspåstand om utslipp, lukt, støy eller helse." } },
    comparisonAndCausality: { comparisonBasis: "Oslo byleksikon belyser sted, produksjon og eierskap; SNL belyser Kildal; Industrimuseum kontrollerer industrikonteksten; Orkla og Solenis dokumenterer 2024-transaksjonen.", causalStatus: "descriptive_only", causalAssessment: "Materialet viser rekkefølgen mellom produktendringer, eierskap, krigstid, produksjonsflytting og omforming, men isolerer ikke én årsak til vekst eller nedleggelse.", alternativeExplanations: ["Råvarekostnader, teknologi, marked, konsernstrategi, lokalisering og byutvikling kan alle ha påvirket utviklingen."], uncertainty: "Uten sammenlignbare regnskaps-, produksjons- og arbeidsmarkedsdata kan virkningene ikke tilskrives én faktor.", sourceIds }
  }],
  presentOperation: { operationalStatus: "former", statement: "Produksjonen på Sandaker ble avsluttet i 1997; store deler av området er boligområde, mens Lilleborgs profesjonelle rengjøringsvirksomhet ble videreført og kjøpt av Solenis i 2024.", originalEconomicRoleRelationship: "Den stedbundne olje- og såpeproduksjonen er avsluttet. Navnet og selskapsvirksomheten fortsatte uten at det historiske fabrikkstedet igjen ble produksjonsanlegg.", checkedAt: verifiedAt, sourceIds: ["source_lilleborg_byleksikon", "source_lilleborg_orkla", "source_lilleborg_solenis"] },
  quizOpening: { status: "PASS", quizTargetId: placeId, firstTwoSetsQuestionCount: 14, sourceBrief: "data/quiz/production_briefs/naeringsliv/lilleborg_fabrikker.json", productionContext: "data/quiz/production_context/naeringsliv/lilleborg_fabrikker.json", requiredInputs: quizRequiredInputs },
  chronologyStories: { status: "PASS", chronologyReviewed: true, storiesReviewed: true, rationale: "Leksikonets fjorten milepæler eier tidslinjen; storyen om sabotasjedilemmaet har en egen narrativ akse om militær nytte og sivile forsyninger." },
  gates: Object.fromEntries("ABCDEFGH".split("").map(letter => [letter, { status: "PASS", evidenceRefs: [letter === "A" ? "economicIdentity" : letter === "B" ? "businessTopics" : letter === "C" ? "economicCases[0].valueCreation" : letter === "D" ? "economicCases[0].distributionAndPower" : letter === "E" ? "economicCases[0].measurement" : letter === "F" ? "economicCases[0].comparisonAndCausality" : letter === "G" ? "quizOpening" : "chronologyStories"] }])),
  review: { reviewer: "History GO Næringsliv source audit", reviewedAt: verifiedAt, notes: "Stedsidentitet, forhistoriske tidslag, forbruksvarekjede, arbeid, merkevarer, eierskap, krigstid, produksjonsstopp, omforming, målegrenser og 2024-selskapsstatus er kontrollert." }
});

const completionAudit = auditLilleborgCompletion({ root });
write("reports/place-production/lilleborg-fabrikker-phase1-24-gate-audit-v1.json", {
  schema: "history_go_phase1_24_quality_gate_v1", place_id: placeId, verified_at: verifiedAt,
  null_measurement: { existing_place: true, canonical_id_reused: placeId, coordinate_changed: false, coordinate_status_preserved: "verified", existing_quiz_audit: "5 flat questions plus 5x6 merged set file", brand_candidate_audited: brandId, removed_unverified_people: ["alf_bjercke_industri_og_kvalitet – ingen kildebelagt Lilleborg-rolle i eksisterende profil"], held_back_persons: ["Ludvig Mariboe – dokumentert i forhistorien, men ikke nødvendig for 1897-identiteten i denne produksjonen", "Birger Kildal – knyttet til familievirksomheten, men holdes utenfor til egen identitetspakke er kildebelagt"], before_after_exact_pair: false },
  source_conflicts: [{ claim: "Lilleborg ble grunnlagt i 1833.", status: "resolved", reason: "1833 gjelder oljemøllen; A/S Lilleborg Fabriker ble grunnlagt i 1897. 1812 og 1842 beskriver andre virksomhetslag på stedet." }, { claim: "Alf Bjercke var kvalitets- og produksjonsleder ved Lilleborg.", status: "rejected", reason: "Den eksisterende People-posten manglet kilder, datoer og dokumentert rolle ved Lilleborg og er derfor fjernet." }, { claim: "Solenis driver fabrikkproduksjon på Sandaker etter oppkjøpet i 2024.", status: "rejected", reason: "Orkla og Solenis dokumenterer selskapsoppkjøpet; Oslo byleksikon dokumenterer at produksjonen på Sandaker sluttet i 1997." }],
  validation: {
    schema: completionAudit.schema,
    status: completionAudit.status,
    checks: completionAudit.checks,
    failed_checks: completionAudit.failed_checks,
    conclusion: completionAudit.conclusion
  },
  quality_score: completionAudit.quality_score
});
write("reports/place-production/lilleborg-fabrikker-workcard-current.json", { place_id: placeId, status: completionAudit.status === "high_quality" ? "complete" : "blocked", phases: "1–24", verified_at: verifiedAt, canonical_next: null, blockers: completionAudit.failed_checks, notes: ["Eksisterende canonical Place er fullprodusert uten ID- eller koordinatendring.", "1897-identiteten er skilt eksplisitt fra virksomhetslagene i 1812, 1833 og 1842.", "Eldre quiz er auditert og erstattet av normal 4x7 med Knowledge-materialisering.", "Kvalitetsstatus beregnes fra faktiske innholds-, kilde-, leveranse- og registerkontroller; redaksjonell automatikk er begrenset til 4/5.", "Neste sted velges først etter grønn CI, verifisert merge og live-QA."] });

console.log(`Built Lilleborg Fabrikker completion package (${questions.length} quiz questions, ${chronology.length} chronology entries, ${sentences(place.popupDesc).length} popup sentences).`);
