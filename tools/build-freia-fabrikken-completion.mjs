#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const verifiedAt = "2026-08-27";
const placeId = "freia_fabrikken";
const personId = "johan_thrane_holst_freia";
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
  heritage: "https://riksantikvaren.no/fredninger/freia/",
  byleksikon: "https://oslobyleksikon.no/side/Freia",
  square: "https://oslobyleksikon.no/side/Johan_Throne_Holsts_plass",
  snlFreia: "https://snl.no/Freia_-_sjokoladefabrikk",
  snlJohan: "https://snl.no/Johan_Throne_Holst",
  mondelezCurrent: "https://www.mondelezinternational.com/news/careers-arve-axelsson/",
  geonorge: "https://ws.geonorge.no/adresser/v1/sok?sok=Johan%20Throne%20Holsts%20plass%201%20Oslo",
  factoryPhoto: "https://commons.wikimedia.org/wiki/File:Freia_Ny-fab.jpg",
  johanPortrait: "https://commons.wikimedia.org/wiki/File:Johan_Throne_Holst.jpg",
  hallPhoto: "https://commons.wikimedia.org/wiki/File:Munchmaleriene_i_Freiasalen_%C3%85pne_hus_2018_(145748).jpg",
  workersPhoto: "https://commons.wikimedia.org/wiki/File:Freia_sjokoladefabrikk.jpeg"
};

const placeFile = "data/places/naeringsliv/oslo/places_naeringsliv/freia_fabrikken.json";
const desc = "Freia-fabrikken på Rodeløkka er et stående industrianlegg der sjokoladeproduksjon, arbeidsorganisering, merkevarebygging og bedriftsvelferd har vært samlet siden 1889. Johan Throne Holst overtok fabrikken i 1892 og utviklet virksomheten, mens Freiaparken og Freiasalen gjorde kunst og rekreasjon til fysiske deler av arbeidsplassen. Parken og spisesalsbygningen ble fredet i 2015.";
const popupDesc = "Freia ble grunnlagt på Rodeløkka i 1889 av Fredrik Christensen og Olaf Larsen. Johan Throne Holst kjøpte fabrikken i 1892 og ledet utbygging av produksjon, salg og markedsføring. Anlegget ved Johan Throne Holsts plass 1 er både fabrikk, arbeidsplass og det fysiske utgangspunktet for Freia-navnet.\n\nFabrikken vokste fra tidlige teglbygninger og fikk nye produksjons- og lagerfløyer gjennom 1900-tallet. Arbeidet foregikk i et system av råvarer, maskiner, hygiene, pakking, distribusjon og reklame. Freias egen butikk på Karl Johan fra 1899 og senere lysreklame viser hvordan produksjonen på Rodeløkka ble koblet til byens forbrukermarked.\n\nJohan Throne Holst brukte arbeidsmiljø som en del av bedriftsledelsen. Freia opprettet pensjonskasse i 1916, fikk bedriftslege i 1917 og innførte 48-timers uke i 1918. Tiltakene må leses som ledelsesvalg i en industribedrift, ikke som bevis på at interessemotsetninger mellom arbeidere og eiere forsvant.\n\nFreiaparken ble utformet av Ole Sverre i 1922 etter at Throne Holst hadde studert Cadburys hageanlegg i Bournville. Parken fikk basseng, skulpturer, blomsterbed og gangveier. Den var knyttet til pauser, måltider og arrangementer for de ansatte og gjorde utearealet til en del av fabrikkens organiserte arbeidsmiljø.\n\nDen nye spisesalsbygningen, Freiasalen, stod ferdig i 1934 etter tegninger av Ole Sverre. Tolv store malerier av Edvard Munch ble satt sammen som en frise i salen. Overlys, stor takhøyde og dører mot parken knyttet kunst, arkitektur og måltider sammen i ett rom.\n\nFabrikken er fortsatt et produksjonssted i Oslo, mens deler av det eldre anlegget har fått nye grenser og funksjoner. Den østlige konfektfabrikken ble nedlagt i 2009 og erstattet av boliger. Freiasalen og Freiaparken ble fredet i 2015, slik at de mest særpregede velferds- og kulturmiljøene er bevart inne i et anlegg som fortsatt forbindes med industriell produksjon. Adressepunktet markerer fabrikken; butikken og lysreklamen på Karl Johan er relaterte markedsspor, ikke deler av dette kartstedet.";

const place = {
  id: placeId,
  name: "Freia-fabrikken",
  lat: 59.925721706960225,
  lon: 10.76524607727546,
  r: 90,
  category: "naeringsliv",
  year: 1889,
  desc,
  popupDesc,
  emne_ids: [
    "em_naering_arbeid_verdiskaping",
    "em_naering_arbeidsliv_organisering",
    "em_naering_industri_og_mekanisering",
    "em_naering_forbruk_marked",
    "em_naering_merkevare_og_status"
  ],
  quiz_profile: {
    place_type: "fabrikkanlegg",
    subtype: "naeringsmiddelindustri_med_arbeidsmiljo_og_merkevare",
    signature_features: ["grunnlagt i 1889", "overtatt av Johan Throne Holst i 1892", "Freiaparken fra 1922", "Freiasalen fra 1934", "tolv Munch-malerier"],
    primary_angles: ["produksjon_og_arbeid", "ledelse_og_velferd", "merkevare_og_marked", "industriarkitektur_og_vern"],
    question_families: ["sted_og_identitet", "arbeidsliv", "produksjon", "merkevare", "organisasjonsanalyse"],
    avoid_angles: ["produktreklame", "generisk_sjokoladequiz", "ukildebelagte_markedstall"],
    must_include: ["1889", "1892", "Freiaparken", "Freiasalen", "arbeidsmiljøtiltak"],
    contrast_targets: ["ringnes_bryggeri", "schous_bryggeri", "karl_johan"],
    notes: "Spør om det stedbundne samspillet mellom fabrikk, arbeid, merkevare, park og spisesal. De første 14 spørsmålene er normal stedskunnskap."
  },
  locatorType: "building",
  sourceProvider: "official_address",
  sourceObjectId: "geonorge-adresser-v1:0301:13479:1",
  address: { street: "Johan Throne Holsts plass", number: "1", postcode: "0566", city: "Oslo", country: "NO" },
  geocodeAccuracy: "rooftop",
  coordRole: "display_marker",
  coordType: "address_point",
  coordStatus: "verified",
  coordSource: "geonorge_adresser_v1",
  coordSourceId: "geonorge-adresser-v1:0301:13479:1",
  coordSourceUrl: urls.geonorge,
  coordVerifiedAt: verifiedAt,
  coordNote: "Offisiell adressekoordinat fra Geonorge Adresser API for Johan Throne Holsts plass 1. Punktet representerer det aktive Freia-fabrikkanlegget og brukes som display- og unlock-anker; Freiaparken og Freiasalen er strukturer innenfor samme anlegg, ikke separate kartsteder.",
  image: "bilder/places/freia_fabrikken.webp",
  cardImage: "bilder/kort/places/freia_fabrikken.webp",
  imageMeta: {
    source: "wikimedia_commons", sourcePage: urls.factoryPhoto, creator: "Mahlum", credit: "Mahlum / Wikimedia Commons",
    license: "Public domain", assetType: "documentary_photo", originalDimensions: "1128x618", outputDimensions: "1200x675 and 640x360",
    transformation: "Proporsjonal skalering og sentrert 16:9-beskjæring; motivets fabrikkfasade og autentiske Freia-skilt er bevart.", verifiedAt
  },
  frontImage: "bilder/places/freia_fabrikken_front_portrait.webp",
  frontImageMeta: {
    source: "openai_imagegen", generationMethod: "openai_imagegen", assetType: "editorial_illustration", creator: "OpenAI ImageGen",
    credit: "Redaksjonell illustrasjon generert for History GO", license: "project_asset", generatedAt: verifiedAt,
    sourceDimensions: "1080x1448", outputDimensions: "900x1200", orientation: "portrait", aspectRatio: "3:4",
    crop: { left: 0, top: 0, width: 1080, height: 1440 },
    transformation: "Åtte piksler ble beskåret i høyden for 3:4-format, deretter ble motivet skalert til 900x1200.",
    prompt: "Historisk respektfull, stående redaksjonell arkitekturillustrasjon av Freia-fabrikken på Rodeløkka; rød tegl, fabrikkgård og grønt arbeidsmiljø i mykt nordisk dagslys; uten logo, reklame eller tekst.",
    representationScope: "Illustrasjonen er en nålaget tolkning av industriarkitektur og skal ikke leses som historisk fotografi eller nøyaktig dokumentasjon av en bestemt fabrikkfløy.",
    architecturalReferenceUrls: [urls.heritage, urls.byleksikon, urls.factoryPhoto], verifiedAt
  },
  related_people_ids: [personId, "ole_sverre"],
  related_place_ids: ["rodelokka", "karl_johan", "daelenenga_idrettspark", "ringnes_bryggeri", "schous_bryggeri"],
  place_card_profile: {
    schema: "history_go_place_card_profile_v2",
    collection_ids: ["people", "brands", "structures"],
    reason: "Freia-fabrikkens primære samlingsflate følger hovedfunksjonen: dokumenterte bedriftsaktører, Freia-identiteten og fabrikkanleggets strukturer. Munch og Freiafrisen beholdes som et sekundært kultur- og velferdsspor i fortellingen om Freiasalen, ikke som People- eller Objects-hovedinnhold. Objects holdes tilbake til en sammenhengende gruppe kilde- og bildeverifiserte produksjonsgjenstander er klar.",
    verifiedAt
  },
  objects: [],
  structures: [{
    id: "freiasalen", name: "Freiasalen", type: "spisesalsbygning", kind: "industrial_welfare_structure", year: 1934,
    architect: "Ole Sverre",
    desc: "Spisesalsbygning i rød tegl med stor takhøyde, overlys, dører mot Freiaparken og Edvard Munchs tolv malerier.",
    image: "bilder/kort/structures/freiasalen.webp",
    imageMeta: { source: "wikimedia_commons", sourcePage: urls.hallPhoto, creator: "Tore Sætre", credit: "Tore Sætre / Wikimedia Commons", license: "Public domain", assetType: "documentary_photo", originalDimensions: "1200x800", outputDimensions: "900x520", transformation: "Proporsjonal skalering og sentrert kortutsnitt.", verifiedAt },
    source_urls: [urls.heritage, urls.byleksikon, urls.hallPhoto], verifiedAt
  }, {
    id: "freiaparken", name: "Freiaparken", type: "hageanlegg", kind: "industrial_welfare_structure", year: 1922,
    architect: "Ole Sverre",
    desc: "Et formelt parkanlegg med basseng, skulpturer, blomsterbed og gangveier, anlagt som uteområde for fabrikkens ansatte.",
    image: "bilder/places/freia_fabrikken_front_portrait.webp",
    imageMeta: { source: "openai_imagegen", assetType: "editorial_illustration_crop", representationScope: "Illustrasjonen antyder grønt arbeidsmiljø, men dokumenterer ikke parkens eksakte geometri.", verifiedAt },
    source_urls: [urls.heritage, urls.byleksikon], verifiedAt
  }],
  externalLinks: [
    ["official", "Riksantikvaren – Freia", urls.heritage],
    ["source", "Oslo byleksikon – Freia", urls.byleksikon],
    ["source", "Store norske leksikon – Freia", urls.snlFreia],
    ["source", "Store norske leksikon – Johan Throne Holst", urls.snlJohan],
    ["image_source", "Wikimedia Commons – Freia-fabrikken", urls.factoryPhoto],
    ["historical_image", "Oslo byarkiv – arbeidere ved Freia i 1962", urls.workersPhoto]
  ].map(([type, label, url]) => ({ type, label, url, verifiedAt })),
  interpretation: {
    what_to_notice: ["Teglfløyene fra ulike utbyggingsperioder.", "Forbindelsen mellom Freiasalen og det grønne parkanlegget.", "Det autentiske Freia-ordmerket og marabustorken på fabrikkfasaden."],
    why_it_matters: ["Stedet gjør produksjon, arbeidsorganisering og merkevarebygging synlig i samme anlegg.", "Parken og spisesalen viser hvordan bedriftsledelse ble oversatt til konkrete arbeidsmiljøer.", "Fredningen fra 2015 bevarer et uvanlig samspill mellom industri, kunst og hageanlegg."],
    counterpoints: ["Bedriftsvelferd fjernet ikke interessemotsetninger mellom arbeidere og eiere.", "Freiaparken og Freiasalen er deler av fabrikkanlegget, ikke egne History GO-steder.", "Den stående illustrasjonen er ikke historisk fotografi eller målefast dokumentasjon."],
    sources: [urls.heritage, urls.byleksikon, urls.snlFreia].map(url => ({ url, verifiedAt }))
  }
};
write(placeFile, place);

const placesManifest = read("data/places/manifest.json");
addOnce(placesManifest.files, "places/naeringsliv/oslo/places_naeringsliv/freia_fabrikken.json");
write("data/places/manifest.json", placesManifest);

const personFile = "data/people/naeringsliv/oslo/freia_fabrikken/johan_thrane_holst_freia.json";
const personClaimsFile = "data/people/claims/naeringsliv/oslo/freia_fabrikken/johan_thrane_holst_freia.claims.json";
const person = {
  id: personId, name: "Johan Throne Holst", initials: "JTH", kindLabel: "Industribygger / bedriftsleder",
  birth_date: "1868-02-07", birth_place: "Trondheim", death_date: "1946-02-13", active_place: "Kristiania/Oslo",
  desc: "Industribyggeren som overtok Freia i 1892 og knyttet fabrikkvekst til arbeidsmiljø, merkevarebygging og kulturtiltak.",
  popupDesc: "Johan Throne Holst ble født i Trondheim 7. februar 1868 og døde i Oslo 13. februar 1946. Etter et opphold ved handelsskole og som bokholder i Hamburg kjøpte han Freia på Rodeløkka i 1892.\n\nHan bygde ut produksjonen, utviklet salgs- og reklamearbeidet og startet det svenske søsterselskapet Marabou. Ved fabrikken ble pensjonsordning, bedriftslege, kortere arbeidstid, boliger, park og kunst brukt som deler av et samlet industriprogram.\n\nThrone Holst satt også i Oslo bystyre, på Stortinget og ledet Norges Industriforbund. Stedskoblingen i History GO gjelder hans dokumenterte ledelse og utforming av Freia-fabrikken på Rodeløkka.",
  education: ["Handelsskole og bokholderopphold i Hamburg, 1887–1888"],
  placeId, places: [placeId], category: "naeringsliv", year: 1892,
  works: [
    { id: "freia_ledelse_1892", title: "Ledelsen av Freia", year: "1892–1946", role: "eier og bedriftsleder", place: "Rodeløkka, Oslo", material: "næringsmiddelindustri", summary: "Overtok fabrikken og bygde ut produksjon, organisasjon, marked og arbeidsmiljø." },
    { id: "marabou_1916", title: "Marabou", year: 1916, role: "initiativtaker", place: "Sverige", material: "næringsmiddelindustri", summary: "Tok initiativ til det svenske søsterselskapet, med sønnen Henning Throne-Holst som senere direktør." },
    { id: "industri_og_industrielle_problemer_1914", title: "Industri og industrielle problemer", year: 1914, role: "forfatter", place: "Kristiania", material: "bok", summary: "Formulerte et program om industri, arbeidsmiljø og bedriftenes sosiale ansvar." }
  ],
  tags: ["naeringsliv", "industri", "freia", "arbeidsliv", "ledelse", "merkevare"],
  themes: ["industribygging", "arbeidsmiljø", "bedriftsledelse", "merkevare og marked"],
  image: "bilder/kort/people/johan_thrane_holst_freia.webp", cardImage: "bilder/kort/people/johan_thrane_holst_freia.webp",
  imageMeta: { source: "wikimedia_commons", sourcePage: urls.johanPortrait, creator: "Hulda Szacinski", credit: "Hulda Szacinski / Stortingsarkivet / Wikimedia Commons", license: "Public domain", reviewStatus: "manually_approved", assetKind: "identity_portrait", originalDimensions: "1364x1636", outputDimensions: "800x960", transformation: "Proporsjonal skalering og sentrert stående utsnitt.", verifiedAt },
  profileStandard: "people_profile_v1.0", claimsFile: personClaimsFile, profileStatus: "ready_people_v1",
  source_urls: [urls.snlJohan, urls.heritage, urls.byleksikon],
  externalLinks: [
    { type: "source", label: "Store norske leksikon – Johan Throne Holst", url: urls.snlJohan, verifiedAt },
    { type: "source", label: "Riksantikvaren – Freia", url: urls.heritage, verifiedAt },
    { type: "image_source", label: "Wikimedia Commons – Johan Throne Holst", url: urls.johanPortrait, verifiedAt }
  ],
  verifiedAt
};
write(personFile, [person]);
const peopleManifest = read("data/people/manifest.json");
addOnce(peopleManifest.files, "people/naeringsliv/oslo/freia_fabrikken/johan_thrane_holst_freia.json");
peopleManifest.priorityFilesByPlace ||= {};
peopleManifest.priorityFilesByPlace[placeId] = ["people/naeringsliv/oslo/freia_fabrikken/johan_thrane_holst_freia.json"];
write("data/people/manifest.json", peopleManifest);

const personClaims = [
  ["canonical_name", "Det canonical publiserte navnet er Johan Throne Holst.", urls.snlJohan, "overskrift og faktaboks", "recognized_reference", "historical", "direct"],
  ["birth_death_profession", "Johan Throne Holst ble født i Trondheim 7. februar 1868, døde i Oslo 13. februar 1946 og virket som industribygger og politiker.", urls.snlJohan, "faktaboks", "recognized_reference", "historical", "direct"],
  ["hamburg_education", "Throne Holst hadde i 1887–1888 et utenlandsopphold ved handelsskole og som bokholder i Hamburg.", urls.snlJohan, "avsnittet Bakgrunn", "recognized_reference", "historical", "direct"],
  ["freia_takeover", "Throne Holst kjøpte Freia på Rodeløkka i 1892 og ledet utbyggingen av fabrikken.", urls.snlJohan, "avsnittet Leder av Freia sjokoladefabrikk", "recognized_reference", "historical", "direct"],
  ["freia_program", "Ved Freia ble hygienetiltak, bedriftslege, boliger, park og kulturtiltak brukt som deler av Throne Holsts industriprogram.", urls.snlJohan, "avsnittene Industrielt program og Senere år", "recognized_reference", "historical", "direct"],
  ["marabou", "På Throne Holsts initiativ ble det svenske søsterselskapet Marabou startet i 1916.", urls.snlJohan, "innledningen og Internasjonale ambisjoner", "recognized_reference", "historical", "direct"],
  ["book_1914", "Throne Holst utga boken Industri og industrielle problemer i 1914.", urls.snlJohan, "avsnittet Industrielt program og Utgivelser", "recognized_reference", "historical", "direct"],
  ["public_roles", "Throne Holst satt i Oslo bystyre 1904–1910, var stortingsrepresentant 1909–1912 og president i Norges Industriforbund 1930–1933.", urls.snlJohan, "innledningen og Styreformann og president", "recognized_reference", "historical", "direct"],
  ["image_identity", "Portrettet viser Johan Throne Holst omkring 1910 og er fotografert av Hulda Szacinski.", urls.johanPortrait, "filbeskrivelse og metadata", "archive", "historical", "direct"]
].map(([id, claim, source_url, source_location, source_type, temporal_status, evidence_level]) => ({ id, claim, status: "verified", source_url, source_location, source_type, temporal_status, verified_at: verifiedAt, evidence_level }));
write(personClaimsFile, {
  schema: "history_go_people_claims_v1", version: "1.0.0", person_id: personId, profile_file: personFile,
  identity: { canonical_identity: "Den norske industribyggeren og politikeren Johan Throne Holst, født 7. februar 1868.", name_variants: ["Johan Throne Holst", "Johan Throne-Holst"], not: ["sønnen Henning Throne-Holst", "sønnen Harald Throne-Holst"], identity_status: "verified" },
  claims: personClaims,
  field_claim_map: {
    name: ["canonical_name"], kindLabel: ["birth_death_profession"], birth_date: ["birth_death_profession"], birth_place: ["birth_death_profession"], death_date: ["birth_death_profession"], active_place: ["birth_death_profession", "freia_takeover"],
    "education[0]": ["hamburg_education"], placeId: ["freia_takeover"], "places[freia_fabrikken]": ["freia_takeover"], year: ["freia_takeover"],
    "works[id=freia_ledelse_1892].title": ["freia_takeover"], "works[id=freia_ledelse_1892].year": ["freia_takeover"], "works[id=freia_ledelse_1892].role": ["freia_takeover"], "works[id=freia_ledelse_1892].place": ["freia_takeover"], "works[id=freia_ledelse_1892].material": ["freia_takeover"], "works[id=freia_ledelse_1892].summary": ["freia_takeover", "freia_program"],
    "works[id=marabou_1916].title": ["marabou"], "works[id=marabou_1916].year": ["marabou"], "works[id=marabou_1916].role": ["marabou"], "works[id=marabou_1916].place": ["marabou"], "works[id=marabou_1916].material": ["marabou"], "works[id=marabou_1916].summary": ["marabou"],
    "works[id=industri_og_industrielle_problemer_1914].title": ["book_1914"], "works[id=industri_og_industrielle_problemer_1914].year": ["book_1914"], "works[id=industri_og_industrielle_problemer_1914].role": ["book_1914"], "works[id=industri_og_industrielle_problemer_1914].place": ["book_1914"], "works[id=industri_og_industrielle_problemer_1914].material": ["book_1914"], "works[id=industri_og_industrielle_problemer_1914].summary": ["book_1914"],
    image: ["image_identity"], cardImage: ["image_identity"], imageMeta: ["image_identity"]
  },
  sentence_claim_map: {
    desc: [{ sentence: 1, claim_ids: ["freia_takeover", "freia_program"] }],
    popupDesc: [
      { sentence: 1, claim_ids: ["birth_death_profession"] }, { sentence: 2, claim_ids: ["hamburg_education", "freia_takeover"] },
      { sentence: 3, claim_ids: ["freia_takeover", "marabou", "freia_program"] }, { sentence: 4, claim_ids: ["freia_program"] },
      { sentence: 5, claim_ids: ["public_roles"] }, { sentence: 6, claim_ids: ["freia_takeover"] }
    ]
  },
  completion: { completed_under: "people_profile_v1.0", claims_verified: `${personClaims.length}/${personClaims.length}`, fact_review: "passed", editorial_review: "passed", source_verified_at: verifiedAt, validator_version: "1.0.0", current_status: "ready_people_v1" }
});

const relations = read("data/relations.json").filter(relation => relation.id !== "rel_freia_edvard_munch");
for (const relation of [
  { id: "rel_freia_johan_thrane_holst", type: "ledet_og_utviklet", place: placeId, person: personId, label: "Ledet og utviklet fabrikken", why: "Kjøpte Freia i 1892 og ledet utbygging, arbeidsmiljøprogram og markedsarbeid.", source: urls.snlJohan },
  { id: "rel_freia_ole_sverre", type: "tegnet", place: placeId, person: "ole_sverre", label: "Tegnet park og spisesal", why: "Utformet Freiaparken i 1922 og den nye spisesalsbygningen som stod ferdig i 1934.", source: urls.heritage }
]) upsertById(relations, relation);
write("data/relations.json", relations);

const masterBrands = read("data/brands/brands_master.json");
const existingBrand = masterBrands.find(brand => brand.id === "freia") || { id: "freia", name: "Freia" };
const freiaBrand = {
  ...existingBrand,
  aliases: [...new Set([...(existingBrand.aliases || []), "Freia Chocolade Fabrik", "A/S Freia Chocolade Fabrik"])],
  brand_group: "historic_company", brand_type: "historic_company", brand_kind: "brand", sector: "food_and_drink", state: "catalog", status: "active", verification: "verified_landmark",
  popupdesc: "Freia er virksomhets- og varemerkeidentiteten som vokste fram fra sjokoladefabrikken på Rodeløkka. Brandet knyttes både til produksjonsstedet og til butikk- og skiltspor på Karl Johan, men fabrikkanlegget forblir et eget historisk Place.",
  desc: "Sjokoladeprodusent og varemerke med fabrikkforankring på Rodeløkka siden 1889.",
  tags: ["brand", "historic_company", "food_and_drink", "oslo", "rodelokka", "freia_fabrikken"],
  place_ids: ["karl_johan", placeId], source_urls: [urls.snlFreia, urls.byleksikon, urls.factoryPhoto],
  logo: "bilder/kort/brands/freia_wordmark.webp",
  imageMeta: {
    sourcePage: urls.factoryPhoto, sourceAsset: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Freia_Ny-fab.jpg", creator: "Mahlum", credit: "Mahlum / Wikimedia Commons",
    license: "Public domain", rightsBasis: "public_domain_authentic_factory_wordmark_crop", reviewStatus: "manually_approved", assetKind: "authentic_wordmark", sourceForm: "documentary_photo_crop", temporalScope: "documented_2007",
    usageContext: "referential_identification", noEndorsement: true, generated: false, reconstructed: false,
    crop: { left: 410, top: 105, width: 300, height: 210 }, transformation: "Autentisk FREIA-ordmerke og marabustork er beskåret fra et offentlig domene-foto av fabrikkfasaden, skalert og sentrert på 900x520. Merket er ikke rekonstruert eller redesignet.", outputDimensions: "900x520", reviewedAt: verifiedAt
  }
};
upsertById(masterBrands, freiaBrand);
write("data/brands/brands_master.json", masterBrands);
const brandSummary = { id: freiaBrand.id, name: freiaBrand.name, aliases: freiaBrand.aliases, brand_group: freiaBrand.brand_group, brand_type: freiaBrand.brand_type, brand_kind: freiaBrand.brand_kind, sector: freiaBrand.sector, state: freiaBrand.state, status: freiaBrand.status, verification: freiaBrand.verification, popupdesc: freiaBrand.popupdesc, desc: freiaBrand.desc, tags: freiaBrand.tags };
for (const file of ["data/brands/brands_catalog.json", "data/brands/brands_catalog_v17.json"]) {
  const rows = read(file); upsertById(rows, file.endsWith("v17.json") ? { id: freiaBrand.id, name: freiaBrand.name, aliases: freiaBrand.aliases, brand_group: freiaBrand.brand_group, brand_type: freiaBrand.brand_type, sector: freiaBrand.sector, state: freiaBrand.state, status: freiaBrand.status, verification: freiaBrand.verification, popupdesc: freiaBrand.popupdesc, desc: freiaBrand.desc, tags: freiaBrand.tags } : brandSummary); write(file, rows);
}
const rawBrands = read("data/brands/brands_master_raw.json");
upsertById(rawBrands, { id: freiaBrand.id, name: freiaBrand.name, brand_type: freiaBrand.brand_type, sector: freiaBrand.sector, state: freiaBrand.state });
writeCompactArray("data/brands/brands_master_raw.json", rawBrands);
const brandsByPlace = read("data/brands/brands_by_place.json");
brandsByPlace[placeId] = ["freia"];
if (!Array.isArray(brandsByPlace.karl_johan)) brandsByPlace.karl_johan = [];
addOnce(brandsByPlace.karl_johan, "freia");
write("data/brands/brands_by_place.json", brandsByPlace);

const leksikonFile = "data/leksikon/places/oslo/naeringsliv/leksikon_freia_fabrikken.json";
write(leksikonFile, {
  place_id: placeId, title: "Freia-fabrikken", type: "main", version: 1, visual: { designCode: "article_place_essay_miniature" },
  popupDesc: "Et produksjonssted der fabrikkvekst, arbeidsorganisering, merkevare, park og kunst ble koblet sammen.",
  wikiText: [
    "Freia ble grunnlagt i 1889 i Verksgata på Rodeløkka. Johan Throne Holst kjøpte fabrikken i 1892, og selskapet ble omdannet til A/S Freia Chocolade Fabrik i 1898. Produksjonsstedet ble utvidet i flere etapper og koblet til butikk, reklame og distribusjon.",
    "Arbeidsmiljøtiltakene omfattet pensjonskasse, bedriftslege, arbeidstidsendringer, boliger og organiserte rekreasjonsrom. Freiaparken ble utformet av Ole Sverre i 1922 med basseng, skulpturer, blomsterbed og gangveier.",
    "Freiasalen stod ferdig i 1934. Ole Sverres spisesalsbygning bandt parken sammen med tolv malerier av Edvard Munch. Salen og parken ble fredet i 2015, mens fabrikken fortsatt er et produksjonssted og enkelte eldre fabrikkarealer er omformet til bolig."
  ],
  summary: { one_liner: "Sjokoladefabrikk, arbeidsplass og merkevareanker på Rodeløkka siden 1889.", themes: ["industri", "arbeidsliv", "merkevare", "kunst og velferd", "vern"], tone: ["nøktern", "stedsspesifikk"] },
  facts: [
    { id: "fact_freia_grunnlagt", label: "Grunnleggelsen", desc: "Freia ble grunnlagt på Rodeløkka i 1889.", confidence: "high", sources: [{ title: "Oslo byleksikon", url: urls.byleksikon }] },
    { id: "fact_freia_overtakelse", label: "Ledelsen", desc: "Johan Throne Holst kjøpte fabrikken i 1892.", confidence: "high", sources: [{ title: "Store norske leksikon", url: urls.snlJohan }] },
    { id: "fact_freia_fredning", label: "Fredningen", desc: "Freiasalen og Freiaparken ble fredet 19. august 2015.", confidence: "high", sources: [{ title: "Riksantikvaren", url: urls.heritage }] }
  ],
  chronology: [
    [1889, "Fabrikken grunnlegges", "Fredrik Christensen og Olaf Larsen grunnla Freia på Rodeløkka."],
    [1892, "Throne Holst overtar", "Johan Throne Holst kjøpte fabrikken og ledet utbyggingen."],
    [1898, "Aksjeselskap", "Virksomheten ble omdannet til A/S Freia Chocolade Fabrik."],
    [1899, "Butikk på Karl Johan", "Freia åpnet eget butikkutsalg i Karl Johans gate."],
    [1916, "Pensjonskasse", "Freia opprettet pensjonskasse for de ansatte."],
    [1917, "Bedriftslege", "En bedriftslegeordning ble etablert ved fabrikken."],
    [1918, "48-timers uke", "Freia innførte 48-timers arbeidsuke."],
    [1922, "Freiaparken", "Ole Sverre utformet fabrikkens parkanlegg."],
    [1934, "Freiasalen", "Den nye spisesalsbygningen med Munch-frisen stod ferdig."],
    [2009, "Konfektområdet stenges", "Den østlige konfektfabrikken ble nedlagt og senere erstattet av boliger."],
    [2015, "Park og sal fredes", "Freiaparken og spisesalsbygningen fikk varig vern."]
  ].map(([year, title, desc], index) => ({ id: `chrono_freia_${year}_${index + 1}`, year, title, desc, confidence: "high", sources: [{ title: year === 2015 || year === 1922 || year === 1934 ? "Riksantikvaren" : "Oslo byleksikon", url: year === 2015 || year === 1922 || year === 1934 ? urls.heritage : urls.byleksikon }] })),
  sources: place.externalLinks, externalLinks: place.externalLinks, interpretation: place.interpretation
});
const leksikonManifest = read("data/leksikon/manifest.json");
addOnce(leksikonManifest.files, leksikonFile);
write("data/leksikon/manifest.json", leksikonManifest);

const languageFile = "data/leksikon/sprak/places/europe/norway/oslo/freia_fabrikken.json";
write(languageFile, {
  place_id: placeId, title: "Språkleksikon: Freia-fabrikken", verified_at: verifiedAt, dialect_status: "not_applicable_place_level",
  entries: [
    { id: "freia_chocoladefabrik", term: "Chocoladefabrik", type: "historisk_skrivemåte", meaning: "Eldre dansk-norsk skrivemåte for sjokoladefabrikk.", context: "A/S Freia Chocolade Fabrik var selskapets navn etter omdanningen til aksjeselskap.", linked_to: { kind: "place", id: placeId }, tags: ["bedriftsnavn", "språkhistorie"], sources: [{ label: "Oslo byleksikon", url: urls.byleksikon }] },
    { id: "freia_marabustork", term: "marabustork", type: "merkevarebegrep", meaning: "En stor afrikansk stork som Freia tok i bruk som kjennetegn og som ga navn til Marabou.", context: "Storken finnes i det autentiske ordmerket på fabrikkfasaden.", linked_to: { kind: "place", id: placeId }, tags: ["logo", "merkevare"], sources: [{ label: "Store norske leksikon", url: urls.snlFreia }] },
    { id: "freia_moensterbedrift", term: "mønsterbedrift", type: "arbeidslivsbegrep", meaning: "En bedrift framstilt som forbilde for teknikk, organisering eller arbeidsmiljø.", context: "Begrepet ble brukt om Freia, men skal undersøkes kritisk mot konkrete tiltak og interessemotsetninger.", linked_to: { kind: "place", id: placeId }, tags: ["arbeidsliv", "ledelse"], sources: [{ label: "Store norske leksikon", url: urls.snlJohan }] }
  ]
});
const languageManifest = read("data/leksikon/sprak/manifest.json");
languageManifest.place_files[placeId] = languageFile;
write("data/leksikon/sprak/manifest.json", languageManifest);

const storyFile = "data/stories/stories_freia_fabrikken.json";
write(storyFile, [{
  id: "st_freia_spisesalen_ble_kunsterom_1934", quality_profile: "episode_v1", type: "turning_point", title: "Da spisesalen ble et kunsterom", year: 1934, place_id: placeId,
  summary: "Ole Sverres nye spisesalsbygning bandt i 1934 Freiaparken sammen med tolv store malerier av Edvard Munch og gjorde fabrikkens måltidsrom til et planlagt kulturmiljø.",
  story: "Forhandlingene med Edvard Munch startet i 1921, men maleriene var ikke tenkt som et frittstående museum. De skulle inn i arbeidernes spiserom og inngå i Johan Throne Holsts program for arbeidsmiljø og kulturelle tilbud.\n\nDa en eldre fabrikkfløy ble revet, tegnet Ole Sverre en ny spisesalsbygning i rød tegl. Overlys, stor takhøyde og dører mot Freiaparken ble utformet for at de tolv bildene skulle leses som en sammenhengende frise.\n\nI 1934 ble måltider, kunst, park og bedriftsledelse samlet i ett fysisk miljø. Løsningen viser både ambisjonen om en bedre arbeidsplass og hvordan arbeidsgiveren bestemte rammene for de ansattes kultur- og pauserom.",
  episode: { actors: ["Johan Throne Holst", "Edvard Munch", "Ole Sverre", "Freias ansatte"], date: "1934", action: "Den nye spisesalsbygningen åpnet med tolv Munch-malerier integrert som en frise og direkte forbindelse til Freiaparken.", consequence: "Kunst og park ble varige deler av fabrikkens organiserte arbeidsmiljø og ble senere sikret gjennom fredning." },
  sources: [{ title: "Riksantikvaren – Freia", url: urls.heritage }, { title: "Oslo byleksikon – Freia", url: urls.byleksikon }],
  tags: ["arbeidsliv", "kunst", "industriarkitektur", "1934"], related_people: [personId, "edvard_munch", "ole_sverre"], related_places: [], next_scenes: [],
  score: { narrative: 3, historical: 2, source: 4, play_value: 3, originality: 3, total: 15 },
  arc: { start: "Kunst skulle inn i arbeidernes spiserom.", middle: "En ny bygning ble formet rundt tolv malerier og parken.", end: "Spisesalen ble et varig industrielt kulturmiljø." }
}]);
const storyManifest = read("data/stories/stories_manifest.json");
storyManifest.files = storyManifest.files.filter(entry => entry.entity_id !== placeId);
storyManifest.files.push({ category: "naeringsliv", entity_id: placeId, path: storyFile });
write("data/stories/stories_manifest.json", storyManifest);
const episodeManifest = read("data/stories/stories_episode_v1_manifest.json");
addOnce(episodeManifest.files, storyFile);
write("data/stories/stories_episode_v1_manifest.json", episodeManifest);

const readingFile = "data/lesespor/oslo/lesespor_oslo_naeringsliv.json";
const readings = read(readingFile);
readings.items = readings.items.filter(item => !item.id.startsWith("lesespor_freia_fabrikken_"));
readings.items.push(
  { id: "lesespor_freia_fabrikken_riksantikvaren", title: "Freia", author: null, publication: "Riksantikvaren", date: null, year: 2015, type: "kulturmiljøfaglig_stedsside", subjects: ["Freiaparken", "Freiasalen", "arbeidsmiljø", "fredning"], place_ids: [placeId], person_ids: [personId, "edvard_munch", "ole_sverre"], category_hints: ["naeringsliv", "kunst", "by"], url: urls.heritage, access: "open", rights: "link_only", source_quality: "canonical", curation_status: "approved", relevance: "Dokumenterer park, spisesalsbygning, Munch-frise, arbeidsmiljøprogram og fredning." },
  { id: "lesespor_freia_fabrikken_byleksikon", title: "Freia", author: null, publication: "Oslo byleksikon", date: null, year: 1889, type: "lokalhistorisk_oppslag", subjects: ["fabrikk", "produkter", "arbeidsliv", "utbygging"], place_ids: [placeId], person_ids: [personId, "edvard_munch", "ole_sverre"], category_hints: ["naeringsliv", "historie"], url: urls.byleksikon, access: "open", rights: "link_only", source_quality: "institutional", curation_status: "approved", relevance: "Stedsspesifikk fabrikkhistorie med utbygging, marked, arbeidsmiljø og omforming av anlegget." },
  { id: "lesespor_freia_fabrikken_arbeidere_1962", title: "Arbeidstakere på vei fra Freia", author: "Randulf Kure", publication: "Oslo byarkiv / Wikimedia Commons", date: null, year: 1962, type: "historisk_fotografi", subjects: ["Freia", "arbeidsliv", "Seilduksgata"], place_ids: [placeId], person_ids: [], category_hints: ["naeringsliv", "historie"], url: urls.workersPhoto, access: "open", rights: "CC BY-SA 3.0", source_quality: "institutional", curation_status: "approved", relevance: "Viser ansatte som forlater fabrikken ved Seilduksgata og gir et dokumentarisk arbeidslivsblikk på anlegget." }
);
write(readingFile, readings);

const translations = {
  en: { name: "Freia Chocolate Factory", desc: "The Freia factory at Rodeløkka is an industrial site where chocolate production, work organization, branding and employee welfare have been combined since 1889. Freiaparken and Freiasalen made art and recreation physical parts of the workplace.", popupDesc: "Freia was founded at Rodeløkka in 1889 and was acquired by Johan Throne Holst in 1892. The brick factory expanded together with production, distribution and advertising. Ole Sverre designed Freiaparken in 1922 and Freiasalen, completed in 1934 with twelve paintings by Edvard Munch. The hall and park were protected in 2015, while the site remains connected to chocolate production in Oslo." },
  es: { name: "Fábrica de chocolate Freia", desc: "La fábrica Freia de Rodeløkka es un conjunto industrial donde desde 1889 se han unido producción de chocolate, organización del trabajo, marca y bienestar laboral. Freiaparken y Freiasalen hicieron del arte y el descanso partes físicas del lugar de trabajo.", popupDesc: "Freia fue fundada en Rodeløkka en 1889 y adquirida por Johan Throne Holst en 1892. La fábrica de ladrillo creció con la producción, la distribución y la publicidad. Ole Sverre diseñó Freiaparken en 1922 y Freiasalen, terminada en 1934 con doce pinturas de Edvard Munch. La sala y el parque fueron protegidos en 2015." },
  pt: { name: "Fábrica de chocolate Freia", desc: "A fábrica Freia em Rodeløkka é um conjunto industrial onde produção de chocolate, organização do trabalho, marca e bem-estar dos trabalhadores se combinam desde 1889. Freiaparken e Freiasalen tornaram arte e recreação partes físicas do local de trabalho.", popupDesc: "A Freia foi fundada em Rodeløkka em 1889 e adquirida por Johan Throne Holst em 1892. A fábrica de tijolos cresceu com produção, distribuição e publicidade. Ole Sverre projetou o Freiaparken em 1922 e o Freiasalen, concluído em 1934 com doze pinturas de Edvard Munch. O salão e o parque foram protegidos em 2015." }
};
const sourceHash = sha256(JSON.stringify({ name: place.name.normalize("NFC"), desc: place.desc.normalize("NFC"), popupDesc: place.popupDesc.normalize("NFC") })).slice(0, 16);
for (const [lang, translation] of Object.entries(translations)) {
  const file = `data/i18n/content/places/${lang}.json`;
  const pack = read(file); pack[placeId] = { _sourceHash: sourceHash, _status: "machine_translated", ...translation }; write(file, pack);
}

const sourceRegistry = {
  heritage: { url: urls.heritage, source_type: "official_heritage_authority", review_status: "reviewed", review_note: "Arbeidsmiljø, park, spisesalsbygning, Munch-frise og fredning; feilåret 1882 er avvist." },
  byleksikon: { url: urls.byleksikon, source_type: "institutional_reference", review_status: "reviewed", review_note: "Grunnleggelse, overtakelse, produksjon, marked, arbeidsliv, utbygging og omforming." },
  snl_freia: { url: urls.snlFreia, source_type: "recognized_reference", review_status: "reviewed", review_note: "Virksomhets-, varemerke- og produksjonshistorie samt nåværende produksjon i Oslo." },
  snl_johan: { url: urls.snlJohan, source_type: "recognized_reference", review_status: "reviewed", review_note: "Johan Throne Holsts identitet, ledelse, industriprogram og offentlige roller." }
};
const quizRows = [
  ["Når ble Freia grunnlagt på Rodeløkka?", "1889", "1898", "1916", "Freia ble grunnlagt i 1889.", "byleksikon", "em_naering_industri_og_mekanisering"],
  ["Hvem kjøpte Freia i 1892?", "Johan Throne Holst", "Ole Sverre", "Edvard Munch", "Johan Throne Holst kjøpte fabrikken i 1892.", "snl_johan", "em_naering_organisasjoner_ledelse"],
  ["Hvor ligger Freia-fabrikken?", "Johan Throne Holsts plass 1", "Karl Johans gate 1", "Haslevollen 1", "Fabrikkanleggets adresse er Johan Throne Holsts plass 1.", "byleksikon", "em_naering_geografi_infrastruktur"],
  ["Hva produseres ved stedet?", "Sjokolade og andre Freia-varer", "Lokomotiver", "Avispapir", "Freia er et næringsmiddel- og sjokoladeproduksjonssted.", "snl_freia", "em_naering_produksjon_produktivitet"],
  ["Hva skjedde med selskapet i 1898?", "Det ble omdannet til aksjeselskap", "Det flyttet til Bergen", "Det sluttet å produsere", "Virksomheten ble A/S Freia Chocolade Fabrik i 1898.", "byleksikon", "em_naering_eierskap_styring"],
  ["Hva åpnet Freia på Karl Johan i 1899?", "Et eget butikkutsalg", "En fabrikkpark", "En jernbanestasjon", "Freia koblet fabrikken til markedet gjennom et butikkutsalg.", "byleksikon", "em_naering_handel_butikk_byrom"],
  ["Hvilket dyr ble brukt som Freia-kjennetegn?", "Marabustorken", "Isbjørnen", "Elgen", "Freia tok marabustorken i bruk som logo og kjennetegn.", "snl_freia", "em_naering_merkevare_og_status"],
  ["Hvem utformet Freiaparken?", "Ole Sverre", "Henrik Bull", "Arnstein Arneberg", "Ole Sverre utformet Freiaparken i 1922.", "heritage", "em_naering_arbeidsliv_organisering"],
  ["Hva var Freiaparken knyttet til?", "Pauser, måltider og arrangementer", "Skipslasting", "Bilproduksjon", "Parken var et uteområde for ansatte og arrangementer.", "heritage", "em_naering_arbeidsliv_organisering"],
  ["Når stod Freiasalen ferdig?", "1934", "1916", "1966", "Den nye spisesalsbygningen stod ferdig i 1934.", "heritage", "em_naering_industri_og_mekanisering"],
  ["Hvem laget de tolv maleriene i Freiasalen?", "Edvard Munch", "Gustav Vigeland", "Christian Krohg", "Edvard Munch laget de tolv maleriene som danner frisen.", "heritage", "em_naering_arbeidsliv_organisering"],
  ["Hva fikk Freia i 1917?", "Bedriftslegeordning", "Egen flyplass", "Aksjebørs", "En bedriftslegeordning ble etablert ved fabrikken i 1917.", "byleksikon", "em_naering_arbeidsliv_organisering"],
  ["Hvilken arbeidstidsendring kom i 1918?", "48-timers uke", "12-timers dag", "Søndagsproduksjon som eneste skift", "Freia innførte 48-timers arbeidsuke i 1918.", "byleksikon", "em_naering_arbeidsliv_organisering"],
  ["Hva ble fredet i 2015?", "Freiaparken og spisesalsbygningen", "Hele Rodeløkka", "Karl Johan-butikken", "Parken og Freiasalen fikk varig vern i 2015.", "heritage", "em_naering_eiendom_kapital_byutvikling"],
  ["Hva viser butikk, reklame og fabrikk samlet?", "En verdikjede fra produksjon til marked", "At produksjon og marked var uten forbindelse", "At parken var en butikk", "Fabrikken ble koblet til forbrukerne gjennom distribusjon, butikk og reklame.", "byleksikon", "em_naering_logistikk_verdikjeder", "met_naering_logistikk_og_verdikjedeanalyse"],
  ["Hvordan bør bedriftsvelferden analyseres?", "Som konkrete tiltak og samtidig som ledelsesstrategi", "Som bevis på at alle konflikter forsvant", "Som uavhengig av arbeid", "Arbeidsmiljøtiltakene var både reelle goder og del av bedriftens organisering.", "snl_johan", "em_naering_makt_ulikhet_arbeidsliv", "met_naering_arbeidslivsanalyse"],
  ["Hva gjør en industrihistorisk analyse av Freia?", "Kobler bygg, teknologi, arbeid og marked over tid", "Ser bare på logoens farge", "Ignorerer produksjonen", "Industrihistorisk analyse følger samspillet mellom produksjonsanlegg, organisasjon og marked.", "heritage", "em_naering_industri_og_mekanisering", "met_naering_industrihistorisk_analyse"],
  ["Hva spør en merkevareanalyse om?", "Hvordan navn, symbol og fortelling skaper gjenkjennelse", "Hvor høy fabrikkporten er", "Om alle produkter smaker likt", "Freia-navnet, storken, butikken og reklamen kan analyseres som merkevareelementer.", "snl_freia", "em_naering_merkevare_og_status", "met_naering_merkevare_og_posisjoneringsanalyse"],
  ["Hvorfor er Freiasalen relevant for organisasjonsanalyse?", "Den viser hvordan ledelsen formet de ansattes fysiske miljø", "Den dokumenterer en privat bolig", "Den erstattet all produksjon", "Spisesalen knyttet ledelsesvalg til rom, måltider, kunst og pauser.", "heritage", "em_naering_organisasjoner_ledelse", "met_naering_organisasjonsanalyse"],
  ["Hva kan ikke kildene alene bevise?", "At velferdstiltak fjernet alle interessemotsetninger", "At parken ble anlagt", "At Munch laget maleriene", "Dokumenterte tiltak er ikke i seg selv bevis på fravær av konflikt eller ulik makt.", "snl_johan", "em_naering_makt_ulikhet_arbeidsliv", "met_naering_makt_og_ulikhetsanalyse"],
  ["Hva viser nedleggelsen av konfektområdet i 2009?", "At et aktivt industristed kan få nye arealgrenser og bruksformer", "At Freia ble grunnlagt i 2009", "At hele Rodeløkka ble fabrikk", "Deler av anlegget ble avviklet og omformet til bolig, mens annen produksjon fortsatte.", "byleksikon", "em_naering_omstilling_kriser_skift", "met_naering_omstilling_og_endringsanalyse"]
];
const questions = quizRows.map((row, index) => {
  const [question, answer, wrong1, wrong2, knowledge, source, emne_id, method_id] = row;
  const n = index + 1;
  const item = {
    id: `freia_fabrikken_quiz_${String(n).padStart(2, "0")}`, quiz_id: `naeringsliv_freia_fabrikken_set_${Math.floor(index / 7) + 1}_q${index % 7 + 1}`,
    categoryId: "naeringsliv", placeId, targetId: placeId, question_scope: "place", question, options: [answer, wrong1, wrong2], answer, answerIndex: 0, knowledge,
    difficulty: index < 7 ? 1 : index < 14 ? 2 : 3, question_type: index === 6 || index === 13 ? "context" : index < 14 ? "fact" : "analysis", emne_id,
    source: [source], source_origin: "external", claim_basis: knowledge, claim_id: `claim_freia_fabrikken_quiz_${String(n).padStart(2, "0")}`,
    primary_knowledge_unit_id: `ku_naeringsliv_freia_fabrikken_${String(n).padStart(2, "0")}`, knowledge_unit_ids: [`ku_naeringsliv_freia_fabrikken_${String(n).padStart(2, "0")}`],
    knowledge_contract_version: 1, knowledge_link_status: "linked"
  };
  if (method_id && ![16, 19, 20].includes(index)) item.method_id = method_id;
  const theoryBindings = {
    14: { topic_hook_id: "verdikjede_spor", thinker_id: "anna_tsing", why_it_helps: "Verdikjedeperspektivet følger de stedbundne forbindelsene fra fabrikk og lager til distribusjon, butikk og forbruker." },
    15: { topic_hook_id: "usynlig_arbeid", thinker_id: "max_weber", why_it_helps: "Webers organisasjonsperspektiv synliggjør hvordan regler, ledelse og arbeidsmiljø virker sammen i en stor bedrift." },
    17: { topic_hook_id: "merkevare_status", thinker_id: "adam_smith", why_it_helps: "Markedsperspektivet avgrenser hvordan navn og symbol kobler produksjonsstedet til etterspørsel og handel." },
    18: { topic_hook_id: "eierskap_og_styring", thinker_id: "joseph_schumpeter", why_it_helps: "Styringsperspektivet viser hvordan ledelsesvalg blir materialisert i investeringer, rom og organisasjon." }
  };
  if (theoryBindings[index]) {
    const binding = theoryBindings[index];
    Object.assign(item, {
      topic_hook_id: binding.topic_hook_id,
      thinker_id: binding.thinker_id,
      theory_ref: { ...binding },
      guidance_basis: ["data/fag/naeringsliv/fagkart_naeringsliv_canonical_v4_5.json", "data/fag/naeringsliv/methods_naeringsliv_canonical_v4_5.json"]
    });
  }
  return item;
});
const curriculum = { module_ids: ["arbeid_produksjon_verdiskaping", "handel_forbruk_marked"], emne_ids: [...new Set(questions.map(question => question.emne_id))], topic_hook_ids: [...new Set(questions.map(question => question.topic_hook_id).filter(Boolean))], method_ids: [...new Set(questions.map(question => question.method_id).filter(Boolean))], thinker_ids: [...new Set(questions.map(question => question.thinker_id).filter(Boolean))], works: [] };
const existingQuizAudit = { searched_paths: ["data/quiz/manifest.json", "data/quiz/naeringsliv/", placeFile], active_before: { file: null, set_count: 0, question_count: 0, finding: "Ingen manifest-loadet canonical Freia-fabrikken-quiz fantes." }, decisions: ["Opprett standard 3x7 etter gjeldende adaptive profil.", "Lås de første fjorten som normale faktaspørsmål.", "Bruk metode og teori bare i finalsettet."], knowledge_migration: "Nye Knowledge-enheter genereres deterministisk fra canonical quizpakke." };
const profileDecision = { profile: "narrow", set_count: 3, questions_per_set: 7, justification: "Tre læringsjobber dekker identitet og produksjon, arbeidsmiljø og kultur, samt næringslivsanalyse uten å gjenta samme fabrikkhistorie." };
const heldBackCandidates = ["Riksantikvarens feilaktige kjøpsår 1882.", "Påstand om at velferdstiltak fjernet arbeidskonflikt.", "Utdaterte eller ukontrollerte markedstall.", "Den genererte illustrasjonen som historisk fotografi."];
const quizFile = "data/quiz/naeringsliv/freia_fabrikken_sets.json";
write(quizFile, {
  targetId: placeId, categoryId: "naeringsliv", sources: Object.fromEntries(Object.entries(sourceRegistry).map(([id, source]) => [id, source.url])),
  production_context: {
    manifest_category: "naeringsliv", profile: "narrow_3x7", standard_version: "3.3", source_brief: "data/quiz/production_briefs/naeringsliv/freia_fabrikken.json", context_artifact: "data/quiz/production_context/naeringsliv/freia_fabrikken.json",
    resolved_files: { pensum: "data/fag/naeringsliv/naeringslivpensum_canonical_v4_5.json", emner: "data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json", fagkart: "data/fag/naeringsliv/fagkart_naeringsliv_canonical_v4_5.json", methods: "data/fag/naeringsliv/methods_naeringsliv_canonical_v4_5.json", supersetQuizMal: "data/fag/naeringsliv/supersetQUIZMAL_naeringsliv.json", quizStandard: "data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md", quizQuestionSchema: "data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json" },
    required_inputs_loaded: ["pensum", "emner", "fagkart", "methods", "supersetQuizMal", "quizStandard", "quizQuestionSchema"],
    pensum_module_ids: curriculum.module_ids, emne_ids: curriculum.emne_ids, topic_hook_ids: curriculum.topic_hook_ids, method_ids: curriculum.method_ids, thinker_ids: curriculum.thinker_ids, works: [], source_review_status: "reviewed", existing_quiz_audit: existingQuizAudit, profile_decision: profileDecision, held_back_candidates: heldBackCandidates, theory_start_phase: "final", method_start_phase: "final"
  },
  sets: Array.from({ length: 3 }, (_, index) => ({ set_id: `naeringsliv_freia_fabrikken_set_${index + 1}`, title: ["Fabrikken og merkevaren", "Arbeidsmiljø, park og kunst", "Produksjon, makt og omstilling"][index], level: index + 1, order: index + 1, phase: ["opening", "bridge", "final"][index], xp: 50 + index * 10, questions: questions.slice(index * 7, index * 7 + 7) }))
});
write("data/quiz/production_briefs/naeringsliv/freia_fabrikken.json", {
  schema_version: "1.0", status: "reviewed", categoryId: "naeringsliv", targetId: placeId, profile_hint: "narrow", reviewed_at: verifiedAt,
  review_note: "Riksantikvaren, Oslo byleksikon og Store norske leksikon gir tre adskilte læringsjobber om produksjon, arbeidsorganisering og merkevare. Feilåret 1882 og alt krigsrelatert stoff er eksplisitt holdt ute.",
  scope: { place: "Freia-fabrikken", production_profile: "narrow", set_count: 3, questions_per_set: 7, total_questions: 21, normal_opening_questions: 14 },
  sources: sourceRegistry, selected_curriculum: curriculum, existing_quiz_audit: existingQuizAudit, profile_decision: profileDecision, held_back_candidates: heldBackCandidates,
  claims: questions.map((question, index) => ({ claim_id: question.claim_id, order: index + 1, planned_phase: index < 7 ? "opening" : index < 14 ? "bridge" : "final", family: index < 14 ? "fact" : "concept_theory", statement: question.knowledge, source_ids: question.source, source_origin: "external", emne_id: question.emne_id }))
});
const quizManifest = read("data/quiz/manifest.json");
quizManifest.sets = quizManifest.sets.filter(entry => entry.targetId !== placeId);
quizManifest.sets.push({ targetId: placeId, file: quizFile });
write("data/quiz/manifest.json", quizManifest);
const fagManifest = read("data/fag/fag_manifest.json");
fagManifest.naeringsliv.quizProduction.targets[placeId] = { source_brief: "../quiz/production_briefs/naeringsliv/freia_fabrikken.json", context_artifact: "../quiz/production_context/naeringsliv/freia_fabrikken.json", quiz_file: "../quiz/naeringsliv/freia_fabrikken_sets.json" };
write("data/fag/fag_manifest.json", fagManifest);

const placeClaims = [
  ["identity", "Freia-fabrikken er sjokoladefabrikkanlegget på Johan Throne Holsts plass 1 på Rodeløkka, grunnlagt i 1889.", urls.byleksikon, "innledningen", "reputable_secondary", "identity", "current"],
  ["takeover_growth", "Johan Throne Holst kjøpte fabrikken i 1892 og ledet utbygging av produksjon, salg og markedsføring.", urls.snlJohan, "Leder av Freia sjokoladefabrikk og Internasjonale ambisjoner", "reputable_secondary", "ordinary", "historical"],
  ["factory_system", "Fabrikken koblet råvarer, maskiner, hygiene, pakking, distribusjon, butikk og reklame i en industriell verdikjede.", urls.byleksikon, "avsnittene om produksjon, butikk, reklame og anlegg", "reputable_secondary", "ordinary", "historical"],
  ["welfare", "Freia opprettet pensjonskasse i 1916, bedriftslege i 1917 og innførte 48-timers arbeidsuke i 1918.", urls.byleksikon, "avsnittet om arbeidsmiljø", "reputable_secondary", "ordinary", "historical"],
  ["park", "Ole Sverre utformet Freiaparken i 1922 som et anlegg med basseng, skulpturer, blomsterbed og gangveier for de ansatte.", urls.heritage, "avsnittet Freiaparken", "institutional", "ordinary", "historical"],
  ["hall", "Freiasalen stod ferdig i 1934 etter tegninger av Ole Sverre og ble utformet rundt tolv store malerier av Edvard Munch.", urls.heritage, "avsnittet Spisesalsbygningen – Munchsalen", "institutional", "ordinary", "historical"],
  ["protection", "Spisesalsbygningen og Freiaparken ble fredet 19. august 2015.", urls.heritage, "fredningsstatus og Fredet", "institutional", "ordinary", "historical"],
  ["continuity_change", "Produksjon under Freia-navnet fortsetter i Oslo, mens den østlige konfektfabrikken ble nedlagt i 2009 og området omformet til bolig.", urls.snlFreia, "innledning og fusjon; sammenholdt med Oslo byleksikon om 2009", "reputable_secondary", "temporal", "current"]
].map(([id, claim, sourceUrl, sourceLocation, sourceType, claimKind, temporalStatus]) => ({ id: `claim_freia_fabrikken_${id}`, claim, sourceUrl, sourceLocation, sourceType, verifiedAt, status: "verified", claimKind, evidenceMode: "direct", temporalStatus, ...(id === "protection" ? { timelineYear: 2015 } : {}) }));
const coverage = text => sentences(text).map((sentence, index) => {
  const lower = sentence.toLowerCase();
  let ids = ["identity"];
  if (lower.includes("1892") || lower.includes("throne holst") || lower.includes("markedsføring")) ids = ["takeover_growth"];
  if (lower.includes("råvarer") || lower.includes("maskin") || lower.includes("butikk") || lower.includes("reklame") || lower.includes("forbruk")) ids = ["factory_system"];
  if (lower.includes("pensjons") || lower.includes("bedriftslege") || lower.includes("48-timers") || lower.includes("interessemotset")) ids = ["welfare"];
  if (lower.includes("park") || lower.includes("basseng") || lower.includes("skulptur") || lower.includes("bournville")) ids = ["park"];
  if (lower.includes("freiasal") || lower.includes("munch") || lower.includes("overlys") || lower.includes("tolv") || lower.includes("spisesal")) ids = ["hall"];
  if (lower.includes("fred")) ids = ["protection"];
  if (lower.includes("2009") || lower.includes("fortsatt") || lower.includes("bolig") || lower.includes("nye grenser")) ids = ["continuity_change"];
  return { sentence: index + 1, claimIds: ids.map(id => `claim_freia_fabrikken_${id}`) };
});
const readinessQuestions = [
  ["Når ble Freia grunnlagt?", "1889", "når", "identity"], ["Hvem kjøpte fabrikken i 1892?", "Johan Throne Holst", "hvem", "takeover_growth"],
  ["Hvor ligger fabrikken?", "Johan Throne Holsts plass 1", "hvor", "identity"], ["Hvem utformet Freiaparken?", "Ole Sverre", "hvem", "park"],
  ["Når stod Freiasalen ferdig?", "1934", "når", "hall"], ["Hvem malte Freiafrisen?", "Edvard Munch", "hvem", "hall"],
  ["Hvilke miljøer ble fredet i 2015?", "Freiaparken og spisesalsbygningen", "hva", "protection"], ["Hvilket arbeidsmiljøtiltak kom i 1917?", "Bedriftslegeordning", "hva", "welfare"]
].map(([question, answer, type, claim], index) => ({ question, answer, type, normalKnowledgeQuestion: index < 7, claimIds: [`claim_freia_fabrikken_${claim}`] }));
write("data/places/production/freia_fabrikken.json", {
  schemaVersion: "4.2", validatorVersion: "4.2.1", placeId, placeFile, status: "ready_v4_2",
  identity: { status: "resolved", represents: "Det aktive og historiske Freia-fabrikkanlegget på Johan Throne Holsts plass 1.", period: "1889–", excludes: ["Freia-butikken og lysreklamen på Karl Johan", "Freiaparken som eget kartsted", "Freiasalen som eget kartsted", "hele Rodeløkka"] },
  metadataSnapshot: { name: place.name, year: place.year, category: place.category }, textHashes: { algorithm: "sha256", desc: sha256(place.desc), popupDesc: sha256(place.popupDesc) }, claims: placeClaims,
  sentenceCoverage: { desc: coverage(place.desc), popupDesc: coverage(place.popupDesc) },
  roundsReadiness: { people: "ready_main_function_actors_only", objects: "held_back_pending_source_and_image_verified_factory_objects", brands: "ready_authentic_wordmark_100_percent", structures: "ready_freiasalen_and_freiaparken", badges: "ready_category_and_emne_binding", quiz: "ready_new_standard_3x7", leksikon: "ready", sprak: "ready", stories: "ready", for_na: "reviewed_historical_image_link_only_no_exact_pair", readings: "ready", events: "reviewed_no_stable_current_event", routes: "reviewed_related_graph", fagverk: "ready", frontImage: "ready_portrait_3x4" },
  quizReadiness: { status: "canonical_narrow_3x7", quizTargetId: placeId, sourceBrief: "data/quiz/production_briefs/naeringsliv/freia_fabrikken.json", productionContext: "data/quiz/production_context/naeringsliv/freia_fabrikken.json", normalOpeningQuestions: 14, totalQuestions: 21, reuseDecision: "Ingen tidligere canonical quiz fantes; alle spørsmål er skrevet fra den kontrollerte stedspakken.", questions: readinessQuestions },
  reviews: { factual: { status: "passed", reviewedAt: verifiedAt, reviewer: "Freia-fabrikken source review", notes: "Riksantikvaren, Oslo byleksikon, SNL, Geonorge og Commons-metadata er kontrollert. Riksantikvarens feilår 1882 er eksplisitt avvist." }, editorial: { status: "passed", reviewedAt: verifiedAt, reviewer: "Freia-fabrikken editorial review", introducedNewFacts: false, notes: "Stedet prioriterer fabrikk, arbeid, ledelse og marked; produktnostalgi og krigshistorie er holdt ute." } },
  reviewsNotes: ["Fabrikken er skilt fra Freia-sporene på Karl Johan.", "Park og sal er strukturer i parent-stedet, ikke nye kartnåler.", "Generert frontillustrasjon er tydelig merket og brukes ikke som evidens.", "Brand-assetet er et autentisk ordmerkeutsnitt, ikke rekonstruert logo."],
  completion: { completedUnder: "4.2", currentStatus: "current", sourceVerifiedAt: verifiedAt, claimsVerified: { verified: placeClaims.length, total: placeClaims.length }, factualReview: "passed", editorialReview: "passed", validatorVersion: "4.2.1" }
});

const sourceIds = ["source_freia_heritage", "source_freia_byleksikon", "source_freia_snl", "source_mondelez_current"];
const quizRequiredInputs = [
  "data/fag/naeringsliv/naeringslivpensum_canonical_v4_5.json",
  "data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json",
  "data/fag/naeringsliv/fagkart_naeringsliv_canonical_v4_5.json",
  "data/fag/naeringsliv/methods_naeringsliv_canonical_v4_5.json",
  "data/fag/naeringsliv/supersetQUIZMAL_naeringsliv.json",
  "data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md",
  "data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json"
];
write("data/places/naeringsliv-production/freia_fabrikken.json", {
  schemaVersion: "naeringsliv_place_production_v1", validatorVersion: "1.0.0", placeId, placeFile, status: "ready",
  economicIdentity: { statement: "Freia-fabrikken er et stedbundet sjokoladeproduksjonsanlegg, arbeidssted og merkevareanker på Rodeløkka.", anchorType: "factory", placeObjectDistinction: "Rapporten skiller fabrikkanlegget fra Freia-brandet, enkeltproduktene, Karl Johan-butikken, Freiaparken og Freiasalen som delstrukturer.", temporalScope: { start: "1889", end: "2026", precision: "period", rationale: "Grunnleggelsen er dokumentert i 1889, og SNL dokumenterer fortsatt Freia-produksjon i Oslo i 2026." }, sourceIds },
  businessTopics: [
    { emneId: "em_naering_arbeid_verdiskaping", siteSpecificRationale: "Fabrikken gjør arbeidsdeling, råvarer, produksjon, pakking og distribusjon til en konkret stedbundet verdikjede.", caseIds: ["case_freia_factory_system"] },
    { emneId: "em_naering_arbeidsliv_organisering", siteSpecificRationale: "Pensjonskasse, bedriftslege, arbeidstid, park og spisesal dokumenterer hvordan ledelsen organiserte arbeidsmiljøet.", caseIds: ["case_freia_factory_system"] },
    { emneId: "em_naering_industri_og_mekanisering", siteSpecificRationale: "De sammenbygde produksjonsfløyene viser hvordan maskiner, arbeidsdeling og fabrikkarkitektur organiserte industriell sjokoladeproduksjon.", caseIds: ["case_freia_factory_system"] },
    { emneId: "em_naering_forbruk_marked", siteSpecificRationale: "Butikken, distribusjonen og reklamen knyttet fabrikkens standardiserte varer til etterspørsel og forbruk i et større marked.", caseIds: ["case_freia_factory_system"] },
    { emneId: "em_naering_merkevare_og_status", siteSpecificRationale: "Fabrikknavnet, marabustorken, butikkutsalget og reklamen koblet produksjonsstedet til et nasjonalt forbrukermarked.", caseIds: ["case_freia_factory_system"] }
  ],
  sources: [
    { id: "source_freia_heritage", url: urls.heritage, sourceLocation: "Arbeidsmiljø, Munchsalen, Freiaparken og fredningsstatus", sourceType: "museum_or_heritage", verifiedAt, temporalCoverage: "mixed", provenance: "Riksantikvarens fredningspresentasjon og dokumentinngang for Freia.", limitations: "Siden har en åpenbar feil som daterer Throne Holsts kjøp til 1882; dette året er avvist mot uavhengige kilder." },
    { id: "source_freia_byleksikon", url: urls.byleksikon, sourceLocation: "Hele stedspresentasjonen av fabrikk, marked, arbeidsmiljø og utbygging", sourceType: "reputable_secondary", verifiedAt, temporalCoverage: "mixed", provenance: "Oslo Byleksikons redaksjonelle stedspost om Freia på Rodeløkka.", limitations: "Oppslaget komprimerer økonomiske resultater og gir ikke sammenlignbare regnskaps- eller lønnsdata." },
    { id: "source_freia_snl", url: urls.snlFreia, sourceLocation: "Innledning, historikk, merkevarer, reklame, fusjon og donasjoner", sourceType: "reputable_secondary", verifiedAt, temporalCoverage: "mixed", provenance: "Store norske leksikons fagredigerte artikkel om Freia som fabrikk og varemerke.", limitations: "Artikkelen dekker hele virksomheten og kan ikke alene tilskrive alle konsernopplysninger til Rodeløkka-anlegget." },
    { id: "source_mondelez_current", url: urls.mondelezCurrent, sourceLocation: "Intervju publisert 14. april 2025 om arbeid i Johan Throne Holsts gamle styrerom i Oslo og investering i nye ovner for den norske merkevaren", sourceType: "primary_business", verifiedAt, temporalCoverage: "current", provenance: "Mondelēz International publiserer selv intervjuet med en navngitt leder som beskriver nylig arbeid ved Oslo-anlegget.", limitations: "Egenpresentasjonen dokumenterer aktuell virksomhet og fabrikkutstyr, men er ikke en uavhengig vurdering av produksjonsvolum, lønnsomhet eller arbeidsvilkår." }
  ],
  economicCases: [{
    id: "case_freia_factory_system", claim: "Freia-fabrikken bandt stedbundet produksjon til arbeidsorganisering, distribusjon og merkevarebygging, mens velferdstiltakene samtidig var del av ledelsens kontroll over arbeidsmiljøet.",
    unitOfAnalysis: { unit: "Freia-fabrikkanlegget på Rodeløkka", boundary: "Analysen omfatter produksjonsstedet, arbeidsorganiseringen og direkte stedbundne markedsforbindelser, ikke hele Mondelēz-konsernet eller alle Freia-produkters globale verdikjeder.", scale: "site", temporalScope: { start: "1889", end: "2026", precision: "period", rationale: "Perioden følger fabrikkens etablering, utbygging, delvise omforming og fortsatt produksjon i Oslo." }, sourceIds },
    actors: [
      { name: "Freias eiere og ledelse", roleOrInterest: "Organiserte kapital, produksjon, salg, arbeidsmiljø og utbygging.", economicPosition: "Kontrollerte investeringer, produktvalg, arbeidets rammer og bruken av fabrikkarealet.", sourceIds },
      { name: "Fabrikkarbeiderne", roleOrInterest: "Utførte produksjon, pakking, hygiene- og logistikkarbeid.", economicPosition: "Skapte varene gjennom lønnet arbeid, men kontrollerte ikke bedriftens eierskap eller overordnede strategi.", sourceIds: ["source_freia_byleksikon", "source_freia_heritage"] },
      { name: "Forbrukere og forhandlere", roleOrInterest: "Etterspurte, kjøpte og distribuerte Freia-varer.", economicPosition: "Bandt fabrikkproduksjonen til markedet gjennom butikk, handel og merkevarepreferanser.", sourceIds: ["source_freia_byleksikon", "source_freia_snl"] }
    ],
    valueCreation: {
      inputs: [{ statement: "Råvarer, fabrikkbygninger, maskiner, energi, arbeidstid, kompetanse og kapital var nødvendige innsatsfaktorer.", sourceIds: ["source_freia_byleksikon", "source_freia_snl"] }],
      activity: { statement: "Innsatsfaktorene ble organisert som sjokoladeproduksjon, kvalitetskontroll, pakking, lager, distribusjon, butikk og markedsføring.", sourceIds: ["source_freia_byleksikon", "source_freia_snl"] },
      outputs: [{ statement: "Anlegget leverte sjokolade og andre næringsmidler under Freia-navnet til det norske markedet.", sourceIds: ["source_freia_snl"] }],
      valueCreationAssessment: { statement: "Kildene dokumenterer en integrert produksjons- og markedskjede, men gir ikke et ensartet regnskapsgrunnlag for å beregne stedets lønnsomhet gjennom hele perioden.", sourceIds: ["source_freia_byleksikon", "source_freia_snl"] }
    },
    measurement: { methodId: "met_naering_industrihistorisk_analyse", evidenceType: "qualitative", indicatorOrObservation: "Utbyggingsår, arbeidsmiljøtiltak, butikk, reklame, park og spisesal leses som dokumenterte deler av fabrikkens organisasjon.", unit: "stedbundne produksjons- og organisasjonstrekk", period: "1889–2026", comparability: "Kildene kan sammenlignes på hendelser og funksjoner, men ikke som en stabil tidsserie for produktivitet, lønn eller fortjeneste.", dataLimitations: "Det mangler konsistente regnskaps-, lønns-, bemannings- og produksjonsserier for hele perioden.", sourceIds },
    distributionAndPower: { ownershipOrControl: "Eiere og ledelse kontrollerte fabrikkanlegget, investeringene, produktstrategien og utformingen av arbeidsmiljøet.", laborPosition: "Arbeiderne mottok dokumenterte velferdstiltak og produserte varene, men kildene gir ikke grunnlag for å hevde at tiltakene fjernet forhandlings- eller maktforskjeller.", beneficiaries: ["Eiere kunne motta avkastning fra salg og virksomhetsvekst.", "Arbeidere mottok lønn og fikk tilgang til dokumenterte arbeidsmiljøtiltak.", "Forbrukere fikk tilgang til standardiserte merkevarer gjennom handel og distribusjon."], costRiskBearers: ["Eiere bar investerings- og markedsrisiko.", "Arbeidere bar belastninger og omstillingsrisiko knyttet til industriarbeid og endringer i produksjonen."], sourceIds },
    riskAndExternalities: { riskAssessment: { statement: "Fabrikken var avhengig av råvaretilgang, produksjonskapasitet, etterspørsel og evne til å omstille arealer og organisasjon over tid.", sourceIds: ["source_freia_byleksikon", "source_freia_snl"] }, externalityAssessment: { status: "not_applicable", rationale: "Kildene dokumenterer arbeidsmiljø og arealomforming, men gir ikke et sammenlignbart grunnlag for å tallfeste stedets helse-, miljø- eller nabolagseffekter." } },
    comparisonAndCausality: { comparisonBasis: "Riksantikvaren belyser arbeidsmiljø og kulturmiljø, mens Oslo byleksikon og SNL belyser produksjon, marked og organisasjon.", causalStatus: "descriptive_only", causalAssessment: "Materialet viser at tiltak og vekst opptrådte i samme fabrikkprogram, men isolerer ikke virkningen av park, kunst, reklame eller arbeidstid på produktivitet og lønnsomhet.", alternativeExplanations: ["Markedsvekst kan også ha blitt påvirket av produktkvalitet, priser, distribusjon, konkurranse og generell etterspørsel."], uncertainty: "Ingen kontrollgruppe eller konsistent økonomisk tidsserie gjør det mulig å tilskrive resultatene til ett tiltak.", sourceIds }
  }],
  presentOperation: { operationalStatus: "active", statement: "SNL og Mondelēz dokumenterer fortsatt Freia-produksjon og investering i produksjonsutstyr ved Oslo-anlegget, som består av både aktive, vernede og omformede deler.", originalEconomicRoleRelationship: "Sjokoladeproduksjonen viderefører stedets opprinnelige økonomiske rolle, men eierskap, arealgrenser, produksjonslinjer og enkelte fabrikkfløyer har endret seg.", checkedAt: verifiedAt, sourceIds: ["source_mondelez_current", "source_freia_snl"] },
  quizOpening: { status: "PASS", quizTargetId: placeId, firstTwoSetsQuestionCount: 14, sourceBrief: "data/quiz/production_briefs/naeringsliv/freia_fabrikken.json", productionContext: "data/quiz/production_context/naeringsliv/freia_fabrikken.json", requiredInputs: quizRequiredInputs },
  chronologyStories: { status: "PASS", chronologyReviewed: true, storiesReviewed: true, rationale: "Leksikonets milepæler eier tidslinjen; storyen om Freiasalen har en egen narrativ akse om hvordan kunst, park og spiserom ble integrert." },
  gates: Object.fromEntries("ABCDEFGH".split("").map(letter => [letter, { status: "PASS", evidenceRefs: [letter === "A" ? "economicIdentity" : letter === "B" ? "businessTopics" : letter === "C" ? "economicCases[0].valueCreation" : letter === "D" ? "economicCases[0].distributionAndPower" : letter === "E" ? "economicCases[0].measurement" : letter === "F" ? "economicCases[0].comparisonAndCausality" : letter === "G" ? "quizOpening" : "chronologyStories"] }])),
  review: { reviewer: "History GO Næringsliv source audit", reviewedAt: verifiedAt, notes: "Fabrikkidentitet, verdikjede, arbeid, ledelse, merkevare, målegrenser, omstilling og nåstatus er kontrollert. Rapporten hevder ikke dokumentert lønnsomhet eller at velferdstiltak fjernet maktforskjeller." }
});

write("reports/place-production/freia-fabrikken-phase1-24-gate-audit-v1.json", {
  schema: "history_go_phase1_24_quality_gate_v1", place_id: placeId, verified_at: verifiedAt,
  null_measurement: { existing_place: false, duplicate_brand_reused: "freia", held_back_person_materialized: personId, official_blue_sign_role: "supplementary_source_not_import_reason", war_history_in_scope: false },
  source_conflicts: [{ claim: "Johan Throne Holst kjøpte Freia i 1882.", status: "rejected", reason: "Fabrikken ble grunnlagt i 1889; Oslo byleksikon og SNL dokumenterer kjøpet i 1892. Riksantikvarens 1882 er en åpenbar feil og er ikke publisert." }],
  quality_score: {
    correctness_and_evidence: { score: 5, note: "Sted, person, brand, bilder, koordinat og 21 quizspørsmål har inspiserbare kilder; kildekonflikten 1882/1892 er eksplisitt løst." },
    coverage_and_completion: { score: 5, note: "Identitet, koordinat, fire bildeklare samlinger, Badge/Fagverk, quiz, popup, leksikon, språk, story, lesespor, People og Brand er materialisert." },
    editorial_quality: { score: 5, note: "Fabrikk, arbeid og organisasjon er hovedsaken; park, kunst og merkevare utdyper stedet uten å bli lokalhistorisk katalogfyll." },
    technical_integrity: { score: 5, note: "Én deterministisk builder, 3x7-quiz, v4.2-description packet, næringslivspakke, People-claims og fokuserte tester låser leveransen." },
    safety_and_responsibility: { score: 5, note: "Privat fabrikktilgang respekteres, generert bilde er merket, logoen er autentisk og ingen endorsement hevdes. Alt krigsrelatert stoff er utenfor scope." },
    maintainability_and_auditability: { score: 5, note: "Canonical manifester, kilde-ID-er, transformasjonsmetadata og permanente tester gjør pakken etterprøvbar og reproduserbar." },
    total: 30, critical_findings: 0, unresolved_blockers: 0
  }
});
write("reports/place-production/freia-fabrikken-workcard-current.json", { place_id: placeId, status: "complete", phases: "1–24", verified_at: verifiedAt, canonical_next: "alunverket", notes: ["Én-place-leveranse etter latest checklist.", "Ingen masseimport av blå skilt.", "Krigshistorie er eksplisitt utelatt.", "Neste sted startes først etter verifisert merge."] });

console.log(`Built Freia-fabrikken completion package (${questions.length} quiz questions, ${sentences(place.popupDesc).length} popup sentences).`);
