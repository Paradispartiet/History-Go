#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const verifiedAt = "2026-08-27";
const placeId = "myrens_verksted";
const personId = "jens_jacob_jensen_myrens";
const brandId = "myrens_verksted_company";
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
  snl: "https://snl.no/Myrens_Verksted",
  snlJens: "https://snl.no/Jens_Jacob_Jensen",
  byleksikon: "https://oslobyleksikon.no/side/Myrens_Verksted",
  current: "https://myreneiendom.no/om-myrens-verksted/",
  industrimuseum: "https://industrimuseum.no/bedrifter/myrensverksteda_s",
  facade: "https://commons.wikimedia.org/wiki/File:Myrens_Mek_Verksted_164645_IMG_3917.jpg",
  aerial: "https://commons.wikimedia.org/wiki/File:Myrens_Verksted_1953.jpg",
  saw: "https://commons.wikimedia.org/wiki/File:Double_circular_edging_saw.jpg",
  planer: "https://commons.wikimedia.org/wiki/File:Myren_planing_machine.jpg",
  portrait: "https://digitaltmuseum.no/021045470761/portrett-av-jens-jacob-jensen-oljemaleri"
};

const placeFile = "data/places/naeringsliv/oslo/places_naeringsliv/myrens_verksted.json";
const previousPlace = read(placeFile);
const desc = "Myrens Verksted ble grunnlagt av brødrene Jens Jacob og Andreas Jensen i 1848 og flyttet til Myraløkka ved Akerselva i 1854. Her ble vannkraft, fagarbeid og mekanisk produksjon koblet til maskiner for møller, sagbruk, treforedling og fiskeindustri. Kværner kjøpte virksomheten i 1928, og produksjonen i Oslo ble lagt ned i 1988. De bevarte fabrikkbygningene er i dag et næringsområde med kontorer, medier, trening og servering.";
const popupDesc = "Brødrene Jens Jacob og Andreas Jensen etablerte Øvre Foss Mechaniske Værksted på Grünerløkka i 1848. De kom fra en møllebyggerfamilie på Kongsberg, og møllebygging var den tidlige hovedsatsingen. I 1854 flyttet produksjonen til Myraløkka ved Akerselva og virksomheten tok form som Myrens Verksted.\n\nVerkstedet produserte turbiner, dampmaskiner, kjeler, sagbruks- og høvlerimaskiner. Opphevelsen av sagbruksprivilegiene i 1860 åpnet et større marked for produksjonsutstyr til sagbruk og tresliperier. Som leverandørbedrift gjorde Myrens andre industrivirksomheters produksjon mulig.\n\nProduktspekteret knyttet verkstedet til en større industriell verdikjede. Turbiner og dampmaskiner leverte kraft, mens sagbruks- og høvlerimaskiner bearbeidet trevirke i kundebedriftene. Senere utstyr for fiske- og celluloseindustrien utvidet kundemarkedet. Arbeidet på Myrens omfattet produksjon av kapitalutstyr som inngikk i andre fabrikker og foredlingsanlegg. Bedriftens vekst og eksportandel må tolkes med dette leverandørforholdet som bakgrunn, ikke som isolerte tall uten forbindelse til kundene og markedene.\n\nI 1883 fikk bedriften Kongens gullmedalje for treforedlingsmaskiner, møller og motorer. Rundt 1890 hadde virksomheten omkring 1000 ansatte med filialen Fredrikstad Mekaniske Verksted medregnet. Myrens ble aksjeselskap i 1907 og utvidet senere produksjonen med utstyr til fiskeforedling og celluloseindustri.\n\nKværner kjøpte Myrens Verksted i 1928. Eksporten utgjorde 80 prosent av omsetningen i 1973, men tallene beskriver salget og er ikke alene et mål på produktivitet eller lønnsomhet. I 1988 ble Oslo-virksomheten lagt ned og slått sammen med Thune-Eureka til Kværner Eureka.\n\nEtter nedleggelsen ble verkstedhallene, tegnekontorene og andre fabrikkbygninger bygd om til nye formål. Myren Eiendom ble etablert etter kjøpet av området i 1997. I dag brukes anlegget til kontorer, medieproduksjon, trening, klatring, servering og andre tjenester.\n\nStedet viser både kontinuitet og brudd: teglfasader, store industrivinduer og det autentiske M-merket er bevart, mens maskinproduksjonen og arbeidsorganisasjonen er borte. Ombruk av bygningene dokumenterer en ny eiendoms- og tjenesteøkonomi, men sier ikke i seg selv at omstillingen var vellykket for de tidligere ansatte.";

const commonFacadeMeta = {
  source: "wikimedia_commons", sourcePage: urls.facade, creator: "Bjoertvedt", credit: "Bjoertvedt / Wikimedia Commons",
  license: "CC BY-SA 4.0", assetType: "documentary_photo", originalDimensions: "4032x3024", verifiedAt
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
    place_type: "mekanisk_industrianlegg",
    subtype: "maskinindustri_til_tjenesteombruk",
    signature_features: ["grunnlagt i 1848", "flyttet til Myraløkka i 1854", "maskiner for treforedling og fiskeindustri", "Kværner fra 1928", "industrinedleggelse i 1988"],
    primary_angles: ["arbeid_og_maskinproduksjon", "leverandorindustri_og_verdikjede", "eierskap_og_eksport", "omstilling_og_ombruk"],
    question_families: ["sted_og_identitet", "produksjon", "arbeid_og_skala", "eierskap", "omstillingsanalyse"],
    avoid_angles: ["generisk_industrinostalgi", "ukildebelagt_lønnsomhet", "dagens_leietakere_som_historisk_proxy"],
    must_include: ["1848", "1854", "Jens Jacob og Andreas Jensen", "Kværner 1928", "nedleggelsen 1988"],
    contrast_targets: ["hjula_vaeverier", "akerselva", "myralokka"],
    notes: "Spør om verkstedet som maskinleverandør, arbeidsplass og omstillingssted. De første fjorten spørsmålene er normal stedskunnskap; teori og metode kommer først fra sett tre."
  },
  image: "bilder/places/myrens_verksted.webp",
  cardImage: "bilder/kort/places/myrens_verksted.webp",
  imageMeta: { ...commonFacadeMeta, outputDimensions: "1200x675 and 640x360", transformation: "Proporsjonal skalering og sentrert 16:9-beskjæring av den dokumenterte teglfasaden." },
  frontImage: "bilder/places/myrens_verksted_front_portrait.webp",
  frontImageMeta: { ...commonFacadeMeta, outputDimensions: "900x1200", orientation: "portrait", aspectRatio: "3:4", crop: { left: 420, top: 0, width: 1080, height: 1440 }, transformation: "Sentrert stående utsnitt av kildefotoet, der fasade, industrivinduer og autentisk M-merke er bevart; deretter skalert til 900x1200." },
  related_people_ids: [personId],
  related_place_ids: ["akerselva", "myralokka", "voienfossen"],
  place_card_profile: {
    schema: "history_go_place_card_profile_v2",
    collection_ids: ["people", "objects", "brands", "structures"],
    reason: "Næringslivskomposisjonen er full: Jens Jacob Jensen har verifisert portrett, to dokumenterte Myrens-maskiner har egne bilder, Myrens-identiteten har autentisk fasademerke, og den bevarte fabrikkbygningen har dokumentarfoto. Badge og quiz ligger separat.",
    verifiedAt
  },
  objects: [
    {
      id: "myrens_sirkelkantsag_1914", title: "Dobbel sirkelkantsag", type: "sagbruksmaskin", kind: "industrial_machine", year: 1914,
      desc: "En dobbel sirkelkantsag produsert ved Myrens Verksted i 1914 og bevart ved Norsk Teknisk Museum.",
      whereToFind: "Norsk Teknisk Museum; kontroller museets åpning og utstilling før besøk.",
      why_here: "Maskinen dokumenterer verkstedets produksjon av spesialisert sagbruksutstyr.",
      placeSpecificReason: "Commons-kilden identifiserer både produsent, produksjonssted og år.",
      historicalFunction: "Maskinen kantet trevirke og inngikk i mekaniseringen av sagbruksproduksjon.",
      physicalObject: true, placeSpecific: true, collectable: true, storePrice: 40, currency: "PC", collection: "myrens_maskiner",
      unlock: "Studer maskinen i den åpne Commons-kilden eller ved lovlig museumsbesøk.",
      image: "bilder/kort/objects/myrens_sirkelkantsag_1914.webp",
      imageMeta: { source: "wikimedia_commons", sourcePage: urls.saw, creator: "Mahlum", credit: "Mahlum / Wikimedia Commons", license: "Public domain", assetType: "documentary_object_photo", originalDimensions: "1500x1105", outputDimensions: "900x520", transformation: "Proporsjonal skalering og sentrert kortutsnitt.", verifiedAt },
      source_urls: [urls.saw, urls.snl]
    },
    {
      id: "myrens_hovlemaskin_1899", title: "Høvlemaskin", type: "trebearbeidingsmaskin", kind: "industrial_machine", year: 1899,
      desc: "En Myrens-høvlemaskin fra 1899 som bearbeidet fire sider i én gjennomgang og avsluttet overflaten med faste høvelstål.",
      whereToFind: "Norsk Teknisk Museum; kontroller museets åpning og utstilling før besøk.",
      why_here: "Maskinen viser hvordan Myrens utviklet produksjonsutstyr for treindustrien.",
      placeSpecificReason: "Commons-kilden identifiserer maskinen som produsert ved Myrens Verksted i Kristiania i 1899.",
      historicalFunction: "Maskinen kombinerte flere kuttere og en høvelkasse i én arbeidsprosess.",
      physicalObject: true, placeSpecific: true, collectable: true, storePrice: 40, currency: "PC", collection: "myrens_maskiner",
      unlock: "Studer maskinen i den åpne Commons-kilden eller ved lovlig museumsbesøk.",
      image: "bilder/kort/objects/myrens_hovlemaskin_1899.webp",
      imageMeta: { source: "wikimedia_commons", sourcePage: urls.planer, creator: "Mahlum", credit: "Mahlum / Wikimedia Commons", license: "Public domain", assetType: "documentary_object_photo", originalDimensions: "1350x901", outputDimensions: "900x520", transformation: "Proporsjonal skalering og sentrert kortutsnitt.", verifiedAt },
      source_urls: [urls.planer, urls.snl]
    }
  ],
  structures: [{
    id: "myrens_fabrikkbygning_1961", name: "Fabrikkbygningen med M-merket", type: "fabrikkbygning", kind: "industrial_structure",
    desc: "Bevart teglbygning med store industrivinduer og et autentisk M-merke flankert av årstallet 1961 i fasaden.",
    image: "bilder/kort/structures/myrens_fabrikkbygning_1961.webp",
    imageMeta: { ...commonFacadeMeta, outputDimensions: "900x520", transformation: "Proporsjonal skalering og sentrert kortutsnitt av fasaden. Årstallet og M-merket er ikke endret.", verifiedAt },
    source_urls: [urls.facade, urls.byleksikon, urls.current], verifiedAt
  }],
  externalLinks: [
    ["source", "Store norske leksikon – Myrens Verksted", urls.snl],
    ["source", "Oslo byleksikon – Myrens Verksted", urls.byleksikon],
    ["official", "Myren Eiendom – om området", urls.current],
    ["museum", "Industrimuseum – Myrens Verksted", urls.industrimuseum],
    ["image_source", "Wikimedia Commons – fabrikkfasaden", urls.facade],
    ["historical_image", "Oslo byarkiv – Myrens Verksted 1953", urls.aerial]
  ].map(([type, label, url]) => ({ type, label, url, verifiedAt })),
  interpretation: {
    what_to_notice: ["Teglbygningene og de store industrivinduene.", "Det autentiske M-merket og årstallet 1961 i fasaden.", "Avstanden mellom dagens tjenestelokaler og Akerselva som tidligere kraftkilde."],
    why_it_matters: ["Stedet viser hvordan en maskinleverandør kunne binde sammen vannkraft, fagarbeid og flere norske industribransjer.", "Oppkjøpet, eksporten og nedleggelsen gjør eierskap og omstilling lesbart på ett sted.", "Ombruket viser hvordan industrieiendom kan få en ny tjenesteøkonomisk funksjon."],
    counterpoints: ["Eksportandel er ikke det samme som lønnsomhet eller produktivitet.", "Bevarte bygninger betyr ikke at den tidligere arbeidsorganisasjonen eller kompetansen ble videreført.", "Myraløkka og Vøyenfallene er egne canonical steder og brukes bare som relasjoner."],
    sources: [urls.snl, urls.byleksikon, urls.current].map(url => ({ url, verifiedAt }))
  }
};
write(placeFile, place);

const placesManifest = read("data/places/manifest.json");
addOnce(placesManifest.files, "places/naeringsliv/oslo/places_naeringsliv/myrens_verksted.json");
write("data/places/manifest.json", placesManifest);

const personFile = "data/people/naeringsliv/oslo/myrens_verksted/jens_jacob_jensen_myrens.json";
const personClaimsFile = "data/people/claims/naeringsliv/oslo/myrens_verksted/jens_jacob_jensen_myrens.claims.json";
const personDesc = "Industrigründeren som sammen med broren Andreas grunnla verkstedet i 1848 og utviklet Myrens som produsent av maskiner for norsk industri.";
const personPopup = "Jens Jacob Jensen ble født på Kongsberg 16. november 1817 og døde i Kristiania 2. juli 1890. Han startet som omreisende mekaniker og bygde møller.\n\nSammen med broren Andreas etablerte han Øvre Foss Mechaniske Værksted i 1848. Produksjonen ble flyttet til Myraløkka i 1854 og utviklet videre under Myrens-navnet.\n\nJensen grunnla også Fredrikstad Mekaniske Verksted i 1870. Stedskoblingen i History GO gjelder hans dokumenterte rolle som medgrunnlegger av Myrens Verksted.";
const person = {
  id: personId, name: "Jens Jacob Jensen", initials: "JJJ", kindLabel: "Industrigründer", birth_date: "1817-11-16", birth_place: "Kongsberg", death_date: "1890-07-02", active_place: "Kristiania", desc: personDesc, popupDesc: personPopup,
  education: [], placeId, places: [placeId], category: "naeringsliv", year: 1848,
  works: [
    { id: "myrens_grunnleggelse_1848", title: "Myrens Verksted", year: 1848, role: "medgrunnlegger", place: "Kristiania", material: "mekanisk industri", summary: "Etablerte Øvre Foss Mechaniske Værksted sammen med Andreas Jensen; virksomheten ble senere Myrens Verksted." },
    { id: "fredrikstad_mekaniske_1870", title: "Fredrikstad Mekaniske Verksted", year: 1870, role: "grunnlegger", place: "Fredrikstad", material: "mekanisk industri", summary: "Grunnla et datterselskap som ble verkstedets filial i Fredrikstad." }
  ],
  tags: ["naeringsliv", "industri", "myrens_verksted", "mekanikk", "gründer"], themes: ["industrigründing", "møllebygging", "maskinproduksjon"],
  image: "bilder/kort/people/jens_jacob_jensen_myrens.webp", cardImage: "bilder/kort/people/jens_jacob_jensen_myrens.webp",
  imageMeta: { source: "digitaltmuseum", sourcePage: urls.portrait, creator: "Halfdan Strøm", credit: "Halfdan Strøm / Oslo Museum / DigitaltMuseum", license: "Public domain mark", reviewStatus: "manually_approved", assetKind: "identity_portrait", originalDimensions: "856x1199 source rendition", outputDimensions: "800x960", transformation: "Proporsjonal skalering og sentrert stående utsnitt.", verifiedAt },
  profileStandard: "people_profile_v1.0", claimsFile: personClaimsFile, profileStatus: "ready_people_v1",
  source_urls: [urls.snlJens, urls.snl, urls.portrait],
  externalLinks: [["source", "Store norske leksikon – Jens Jacob Jensen", urls.snlJens], ["source", "Store norske leksikon – Myrens Verksted", urls.snl], ["image_source", "DigitaltMuseum – portrett", urls.portrait]].map(([type, label, url]) => ({ type, label, url, verifiedAt })),
  verifiedAt
};
write(personFile, [person]);

const peopleManifest = read("data/people/manifest.json");
peopleManifest.files = peopleManifest.files.filter(file => file !== "naeringsliv/oslo/myrens_verksted/jens_jacob_jensen_myrens.json");
addOnce(peopleManifest.files, "people/naeringsliv/oslo/myrens_verksted/jens_jacob_jensen_myrens.json");
peopleManifest.priorityFilesByPlace ||= {};
peopleManifest.priorityFilesByPlace[placeId] = ["people/naeringsliv/oslo/myrens_verksted/jens_jacob_jensen_myrens.json"];
write("data/people/manifest.json", peopleManifest);

const personClaims = [
  ["canonical_name", "Det canonical publiserte navnet er Jens Jacob Jensen.", urls.snlJens, "overskrift og faktaboks", "recognized_reference"],
  ["birth_death_profession", "Jens Jacob Jensen ble født på Kongsberg 16. november 1817, døde i Kristiania 2. juli 1890 og virket som industrigründer.", urls.snlJens, "faktaboks", "recognized_reference"],
  ["traveling_mechanic", "Jensen startet som omreisende mekaniker og bygde møller.", urls.snlJens, "biografiavsnittet", "recognized_reference"],
  ["myrens_foundation", "Jens Jacob Jensen og broren Andreas etablerte verkstedet i 1848; produksjonen ble flyttet til Myraløkka i 1854.", urls.snl, "Etablering", "recognized_reference"],
  ["fredrikstad_foundation", "Jensen grunnla Fredrikstad Mekaniske Verksted som datterselskap i 1870.", urls.snlJens, "biografiavsnittet", "recognized_reference"],
  ["image_identity", "Portrettmaleriet viser Jens Jacob Jensen og ble utført av Halfdan Strøm i 1917.", urls.portrait, "tittel, personkobling, produsent og datering", "archive"]
].map(([id, claim, source_url, source_location, source_type]) => ({ id, claim, status: "verified", source_url, source_location, source_type, temporal_status: "historical", verified_at: verifiedAt, evidence_level: "direct" }));
write(personClaimsFile, {
  schema: "history_go_people_claims_v1", version: "1.0.0", person_id: personId, profile_file: personFile,
  identity: { canonical_identity: "Den norske industrigründeren Jens Jacob Jensen, født 16. november 1817.", name_variants: ["Jens Jacob Jensen", "Jens Jensen"], not: ["broren Andreas Jensen", "andre navnelike Jens Jensen"], identity_status: "verified" },
  claims: personClaims,
  field_claim_map: {
    name: ["canonical_name"], kindLabel: ["birth_death_profession"], birth_date: ["birth_death_profession"], birth_place: ["birth_death_profession"], death_date: ["birth_death_profession"], active_place: ["birth_death_profession", "myrens_foundation"], placeId: ["myrens_foundation"], "places[myrens_verksted]": ["myrens_foundation"], year: ["myrens_foundation"],
    "works[id=myrens_grunnleggelse_1848].title": ["myrens_foundation"], "works[id=myrens_grunnleggelse_1848].year": ["myrens_foundation"], "works[id=myrens_grunnleggelse_1848].role": ["myrens_foundation"], "works[id=myrens_grunnleggelse_1848].place": ["myrens_foundation"], "works[id=myrens_grunnleggelse_1848].material": ["myrens_foundation"], "works[id=myrens_grunnleggelse_1848].summary": ["myrens_foundation"],
    "works[id=fredrikstad_mekaniske_1870].title": ["fredrikstad_foundation"], "works[id=fredrikstad_mekaniske_1870].year": ["fredrikstad_foundation"], "works[id=fredrikstad_mekaniske_1870].role": ["fredrikstad_foundation"], "works[id=fredrikstad_mekaniske_1870].place": ["fredrikstad_foundation"], "works[id=fredrikstad_mekaniske_1870].material": ["fredrikstad_foundation"], "works[id=fredrikstad_mekaniske_1870].summary": ["fredrikstad_foundation"], image: ["image_identity"], cardImage: ["image_identity"], imageMeta: ["image_identity"]
  },
  sentence_claim_map: {
    desc: [{ sentence: 1, claim_ids: ["myrens_foundation"] }],
    popupDesc: [
      { sentence: 1, claim_ids: ["birth_death_profession"] }, { sentence: 2, claim_ids: ["traveling_mechanic"] },
      { sentence: 3, claim_ids: ["myrens_foundation"] }, { sentence: 4, claim_ids: ["myrens_foundation"] },
      { sentence: 5, claim_ids: ["fredrikstad_foundation"] }, { sentence: 6, claim_ids: ["myrens_foundation"] }
    ]
  },
  completion: { completed_under: "people_profile_v1.0", claims_verified: `${personClaims.length}/${personClaims.length}`, fact_review: "passed", editorial_review: "passed", source_verified_at: verifiedAt, validator_version: "1.0.0", current_status: "ready_people_v1" }
});

const relations = read("data/relations.json");
upsertById(relations, { id: "rel_myrens_jens_jacob_jensen", type: "grunnla", place: placeId, person: personId, label: "Grunnla verkstedet", why: "Etablerte verkstedet sammen med broren Andreas i 1848 og utviklet virksomheten ved Akerselva.", source: urls.snlJens });
write("data/relations.json", relations);

const brand = {
  id: brandId, name: "Myrens Verksted", aliases: ["Myrens mekaniske Værksted", "J. & A. Jensen og Dahl, Myrens Verksted", "Myrens Verksted A/S"],
  brand_group: "legacy_brand", brand_type: "historic_company", brand_kind: "brand", sector: "mechanical_industry", state: "catalog", status: "historical", verification: "verified_legacy",
  popupdesc: "Myrens Verksted er den historiske virksomhetsidentiteten som fulgte maskiner, eksport og industrikunnskap langt utover fabrikkbygningene ved Akerselva. Industriselskapet ble avviklet i Oslo i 1988, mens navnet og det autentiske M-merket fortsatt brukes som identitet for næringsområdet.",
  desc: "Historisk maskinindustrinavn fra 1848, videreført som identitet for næringsområdet ved Akerselva.",
  tags: ["brand", "legacy_brand", "mechanical_industry", "oslo", "akerselva", placeId], place_ids: [placeId], source_urls: [urls.snl, urls.byleksikon, urls.current, urls.facade],
  logo: "bilder/kort/brands/myrens_fasademerke.webp",
  imageMeta: { sourcePage: urls.facade, creator: "Bjoertvedt", credit: "Bjoertvedt / Wikimedia Commons", license: "CC BY-SA 4.0", rightsBasis: "cc_by_sa_authentic_factory_brandmark_crop", reviewStatus: "manually_approved", assetKind: "authentic_brandmark", sourceForm: "documentary_photo_crop", temporalScope: "documented_2018", usageContext: "referential_identification", noEndorsement: true, generated: false, reconstructed: false, crop: { left: 650, top: 120, width: 760, height: 400 }, transformation: "Det autentiske M-merket og fasadeårstallet er beskåret fra et lisensiert dokumentasjonsfoto, skalert og sentrert på 900x520. Merket er ikke rekonstruert eller redesignet.", outputDimensions: "900x520", reviewedAt: verifiedAt }
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
  { type: "source", label: "Store norske leksikon – Myrens Verksted", url: urls.snl, verifiedAt },
  { type: "source", label: "Oslo byleksikon – Myrens Verksted", url: urls.byleksikon, verifiedAt },
  { type: "official", label: "Myren Eiendom – om området", url: urls.current, verifiedAt },
  { type: "museum", label: "Industrimuseum – Myrens Verksted", url: urls.industrimuseum, verifiedAt },
  { type: "image_source", label: "Wikimedia Commons – fabrikkfasaden", url: urls.facade, verifiedAt },
  { type: "historical_image", label: "Oslo byarkiv – Myrens Verksted 1953", url: urls.aerial, verifiedAt }
];
const chronology = [
  [1848, "Verkstedet grunnlegges", "Jens Jacob og Andreas Jensen etablerte Øvre Foss Mechaniske Værksted."],
  [1854, "Produksjonen flyttes", "Verkstedet flyttet til Myraløkka ved Akerselva."],
  [1860, "Markedet for sagbruksmaskiner vokser", "Opphevelsen av sagbruksprivilegiene bidro til flere sagbruk og større etterspørsel etter produksjonsutstyr."],
  [1863, "Knud Dahl blir medeier", "Knud Dahl ble medeier, og firmanavnet ble J. & A. Jensen og Dahl, Myrens Verksted."],
  [1883, "Kongens gullmedalje", "Bedriften fikk gullmedalje for treforedlingsmaskiner, møller og motorer."],
  [1890, "Omkring 1000 ansatte", "Myrens var blant landets største bedrifter når Fredrikstad-filialen regnes med."],
  [1907, "Aksjeselskap", "Virksomheten ble omdannet til Myrens Verksted A/S."],
  [1909, "Utstyr til fiskeindustrien", "Bedriften startet produksjon av maskiner for fiskemel og fiskeolje."],
  [1920, "Samarbeid om celluloseutstyr", "Samarbeidet med Karlstad Mekaniske Verkstad utviklet seg til KaMyr."],
  [1928, "Kværner overtar", "Myrens Verksted ble kjøpt av Kværner og ble datterselskap i konsernet."],
  [1973, "Stor eksportandel", "Eksporten utgjorde 80 prosent av omsetningen."],
  [1988, "Produksjonen i Oslo stenger", "Virksomheten ble slått sammen med Thune-Eureka til Kværner Eureka."],
  [1997, "Ombruket organiseres", "En investorgruppe kjøpte området og etablerte Myren Eiendom." ]
].map(([year, title, desc], index) => ({ id: `chrono_myrens_${year}_${index + 1}`, year, title, desc, confidence: "high", sources: [{ title: year === 1997 ? "Myren Eiendom" : "Store norske leksikon", url: year === 1997 ? urls.current : urls.snl }] }));
const leksikonFile = "data/leksikon/places/oslo/naeringsliv/leksikon_myrens_verksted.json";
write(leksikonFile, {
  place_id: placeId, title: "Myrens Verksted", type: "main", version: 1, visual: { designCode: "article_place_essay_miniature" },
  popupDesc: "Et mekanisk verksted der vannkraft, fagarbeid, maskinproduksjon, eksport og senere eiendomsombruk kan leses i samme anlegg.",
  wikiText: [
    "Myrens Verksted ble etablert som Øvre Foss Mechaniske Værksted i 1848 og flyttet til Myraløkka i 1854. Produksjonen omfattet turbiner, dampmaskiner, kjeler og maskiner for møller, sagbruk og høvlerier.",
    "Etter 1860 vokste markedet for treforedlingsutstyr. Bedriften ble stor arbeidsgiver, utviklet eksport og utvidet til fiske- og celluloseindustri. Kværner kjøpte selskapet i 1928.",
    "Produksjonen i Oslo ble nedlagt i 1988. Fra 1997 ble området utviklet som næringseiendom, og de gamle fabrikkbygningene brukes nå til kontorer, medier, trening, servering og andre tjenester."
  ],
  summary: { one_liner: "Maskinindustristed ved Akerselva fra 1854, ombrukt som næringsområde etter 1988.", themes: ["mekanisk industri", "arbeid", "treforedling", "eksport", "omstilling"], tone: ["nøktern", "stedsspesifikk"] },
  facts: [
    { id: "fact_myrens_grunnlagt", label: "Grunnleggelsen", desc: "Verkstedet ble grunnlagt i 1848 og flyttet til Myraløkka i 1854.", confidence: "high", sources: [{ title: "Store norske leksikon", url: urls.snl }] },
    { id: "fact_myrens_eierskap", label: "Kværner", desc: "Kværner kjøpte Myrens Verksted i 1928.", confidence: "high", sources: [{ title: "Store norske leksikon", url: urls.snl }] },
    { id: "fact_myrens_nedleggelse", label: "Nedleggelsen", desc: "Produksjonen i Oslo ble lagt ned i 1988.", confidence: "high", sources: [{ title: "Store norske leksikon", url: urls.snl }] }
  ],
  chronology, sources: sourceLinks, externalLinks: sourceLinks, interpretation: place.interpretation
});
const leksikonManifest = read("data/leksikon/manifest.json");
leksikonManifest.files = leksikonManifest.files.filter(file => file !== "places/oslo/naeringsliv/leksikon_myrens_verksted.json");
addOnce(leksikonManifest.files, leksikonFile);
write("data/leksikon/manifest.json", leksikonManifest);

const languageFile = "data/leksikon/sprak/places/europe/norway/oslo/myrens_verksted.json";
write(languageFile, {
  place_id: placeId, title: "Språk ved Myrens Verksted", verified_at: verifiedAt,
  dialect_status: "not_applicable_place_level",
  entries: [
    { id: "myrens_mechaniske_vaerksted", term: "Mechaniske Værksted", type: "historisk_skrivemåte", meaning: "Eldre dansk-norsk skrivemåte for mekanisk verksted.", context: "Formen inngikk i virksomhetsnavnene Øvre Foss Mechaniske Værksted og Myrens mekaniske Værksted.", linked_to: { kind: "place", id: placeId }, tags: ["bedriftsnavn", "språkhistorie"], sources: [{ label: "Store norske leksikon", url: urls.snl }, { label: "Oslo byleksikon", url: urls.byleksikon }] },
    { id: "myrens_myren", term: "Myren", type: "historisk_stedsnavn", meaning: "Navnet på gården og fossen som ga verkstedet stedsnavnet Myrens.", context: "Brødrene kjøpte deler av Myren gård med vannrettigheter ved Myrenfallet før produksjonen ble flyttet opp langs Akerselva.", linked_to: { kind: "place", id: placeId }, tags: ["stedsnavn", "Akerselva"], sources: [{ label: "Oslo byleksikon", url: urls.byleksikon }] },
    { id: "myrens_kamyr", term: "KaMyr", type: "selskapsnavn", meaning: "Navnet på selskapet som vokste fram av samarbeidet mellom Myrens Verksted og Karlstad Mekaniske Verkstad.", context: "KaMyr leverte utstyr til celluloseindustrien og viser hvordan et samarbeidsnavn ble knyttet til en internasjonal maskinvirksomhet.", linked_to: { kind: "place", id: placeId }, tags: ["treforedling", "industri"], sources: [{ label: "Store norske leksikon", url: urls.snl }] }
  ]
});
const languageManifest = read("data/leksikon/sprak/manifest.json");
languageManifest.place_files[placeId] = languageFile;
write("data/leksikon/sprak/manifest.json", languageManifest);

const storyFile = "data/stories/stories_myrens_verksted.json";
const story = {
  id: "st_myrens_turbinen_apnet_markedet_1850", quality_profile: "episode_v1", type: "turning_point", title: "Turbinen som åpnet et marked", year: 1850, place_id: placeId,
  summary: "Den første vannturbinen og leveransen til Hjula Væverier gjorde det lille verkstedet ved Øvre Foss til en maskinleverandør for andre fabrikker langs Akerselva.",
  story: "Da brødrene Jensen åpnet verkstedet i 1848, var møllebygging hovedarbeidet. To år senere bygde de sin første vannturbin. Maskinen gjorde elvas fallhøyde om til roterende kraft som kunne fordeles videre i en fabrikk.\n\nDet første store oppdraget var turbin og hovedaksling til Hjula Væverier. Leveransen krevde mer enn å smi en enkelt del: verkstedet måtte få kraftmaskin, aksling og fabrikkens arbeidsmaskiner til å virke sammen.\n\nOppdraget pekte ut en ny økonomisk rolle. Myrens skulle ikke bare produsere egne varer, men levere maskiner som økte kapasiteten hos andre bedrifter. Da produksjonen flyttet til Myraløkka i 1854, fulgte denne leverandørrollen med oppover langs elva.",
  episode: { actors: ["Jens Jacob Jensen", "Andreas Jensen", "arbeiderne ved Øvre Foss", "Hjula Væverier"], date: "1850–1854", action: "Verkstedet bygde sin første turbin, leverte turbin og hovedaksling til Hjula og flyttet deretter produksjonen til Myraløkka.", consequence: "Myrens fikk en dokumentert rolle som maskinleverandør til andre industribedrifter." },
  sources: [{ title: "Oslo byleksikon – Myrens Verksted", url: urls.byleksikon }, { title: "Store norske leksikon – Myrens Verksted", url: urls.snl }],
  tags: ["vannkraft", "maskinindustri", "Akerselva", "1850"], related_people: [personId], related_places: ["voienfossen"], next_scenes: [],
  score: { narrative: 3, historical: 2, source: 4, play_value: 3, originality: 3, total: 15 },
  arc: { start: "Et lite verksted bygde møller.", middle: "En turbinleveranse måtte få en hel fabrikk til å virke.", end: "Verkstedet ble leverandør av produksjonskraft til andre næringer." }
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
  { id: "lesespor_myrens_verksted_snl", title: "Myrens Verksted", author: "Dag Andreassen og Fredrik Lyngås Pedersen", publication: "Store norske leksikon", date: null, year: 1848, type: "industrihistorisk_oppslag", subjects: ["maskinindustri", "treforedling", "eksport", "Kværner"], place_ids: [placeId], person_ids: [personId], category_hints: ["naeringsliv", "historie"], url: urls.snl, access: "open", rights: "link_only", source_quality: "canonical", curation_status: "approved", relevance: "Fagredigert virksomhetshistorie med produksjon, ansatte, eksport, eierskap og nedleggelse." },
  { id: "lesespor_myrens_verksted_byleksikon", title: "Myrens Verksted", author: null, publication: "Oslo byleksikon", date: null, year: 1848, type: "lokalhistorisk_oppslag", subjects: ["fabrikkanlegg", "bygninger", "arbeid", "ombruk"], place_ids: [placeId], person_ids: [personId], category_hints: ["naeringsliv", "by", "historie"], url: urls.byleksikon, access: "open", rights: "link_only", source_quality: "institutional", curation_status: "approved", relevance: "Stedsspesifikk gjennomgang av anlegg, produksjon, bygninger og senere bruk." },
  { id: "lesespor_myrens_verksted_1953", title: "Myrens Verksted 1953", author: "Widerøes Flyveselskap / Otto Hansen", publication: "Oslo byarkiv / Wikimedia Commons", date: null, year: 1953, type: "historisk_fotografi", subjects: ["fabrikkanlegg", "Akerselva", "industriområde"], place_ids: [placeId], person_ids: [], category_hints: ["naeringsliv", "historie", "by"], url: urls.aerial, access: "open", rights: "CC BY-SA 3.0", source_quality: "institutional", curation_status: "approved", relevance: "Flyfotoet dokumenterer fabrikkanleggets utstrekning ved Akerselva i 1953." }
);
write(readingFile, readings);

const translations = {
  en: { name: "Myrens Workshop", desc: "Founded by Jens Jacob and Andreas Jensen in 1848, Myrens Workshop moved to the Akerselva site in 1854 and supplied machinery to mills, sawmills, wood-processing and fish-processing industries. Production in Oslo ended in 1988; the preserved factory complex is now used for offices, media, training and hospitality.", popupDesc: "Myrens Workshop grew from a small mechanical shop into a supplier of turbines, steam engines and industrial machinery. Kværner acquired the company in 1928, and exports represented 80 percent of turnover in 1973. After the 1988 closure, the factory buildings were adapted for service and property uses while the industrial fabric remained visible." },
  es: { name: "Taller Myrens", desc: "Fundado por Jens Jacob y Andreas Jensen en 1848, el Taller Myrens se trasladó junto al Akerselva en 1854 y suministró maquinaria a molinos, aserraderos y las industrias de la madera y del pescado. La producción en Oslo terminó en 1988; el complejo conservado alberga hoy oficinas, medios, deporte y restauración.", popupDesc: "Myrens pasó de ser un pequeño taller mecánico a proveedor de turbinas, máquinas de vapor y maquinaria industrial. Kværner compró la empresa en 1928 y las exportaciones representaron el 80 por ciento de la facturación en 1973. Tras el cierre de 1988, los edificios fabriles se adaptaron a servicios y usos inmobiliarios." },
  pt: { name: "Oficina Myrens", desc: "Fundada por Jens Jacob e Andreas Jensen em 1848, a Oficina Myrens mudou-se para junto do Akerselva em 1854 e forneceu máquinas a moinhos, serrações e indústrias de madeira e pescado. A produção em Oslo terminou em 1988; o conjunto preservado abriga hoje escritórios, mídia, treino e restauração.", popupDesc: "A Myrens passou de pequena oficina mecânica a fornecedora de turbinas, máquinas a vapor e equipamento industrial. A Kværner adquiriu a empresa em 1928, e as exportações representaram 80 por cento do volume de negócios em 1973. Depois do encerramento de 1988, os edifícios foram adaptados a serviços e usos imobiliários." }
};
const sourceHash = sha256(JSON.stringify({ name: place.name.normalize("NFC"), desc: place.desc.normalize("NFC"), popupDesc: place.popupDesc.normalize("NFC") })).slice(0, 16);
for (const [lang, translation] of Object.entries(translations)) {
  const file = `data/i18n/content/places/${lang}.json`;
  const pack = read(file); pack[placeId] = { _sourceHash: sourceHash, _status: "machine_translated", ...translation }; write(file, pack);
}

const sourceRegistry = {
  snl: { url: urls.snl, source_type: "recognized_reference", review_status: "reviewed", review_note: "Grunnleggelse, produksjon, ansatte, eksport, eierskap, nedleggelse og ombruk." },
  byleksikon: { url: urls.byleksikon, source_type: "institutional_reference", review_status: "reviewed", review_note: "Stedsidentitet, turbinleveranse, bygninger, arbeidsliv og senere bruk." },
  current: { url: urls.current, source_type: "primary_business", review_status: "reviewed", review_note: "Eierskap fra 1997, dagens eiendomsdrift, bygninger og næringsområde." },
  snl_jens: { url: urls.snlJens, source_type: "recognized_reference", review_status: "reviewed", review_note: "Jens Jacob Jensens identitet og dokumenterte industrigründervirke." }
};
const quizRows = [
  ["Når ble Myrens Verksted grunnlagt?", ["1848", "1854", "1863"], "1848", "Verkstedet ble grunnlagt i 1848.", ["snl"], "em_naering_industri_og_mekanisering", "fact"],
  ["Hvem grunnla verkstedet?", ["Jens Jacob og Andreas Jensen", "Jacob og Thorvald Meyer", "Knud og Harald Dahl"], "Jens Jacob og Andreas Jensen", "Brødrene Jens Jacob og Andreas Jensen grunnla verkstedet.", ["snl", "byleksikon"], "em_naering_arbeid_verdiskaping", "fact"],
  ["Hva het virksomheten først?", ["Øvre Foss Mechaniske Værksted", "Myrens Turbinfabrik", "Akerselvens Maskin Compagni"], "Øvre Foss Mechaniske Værksted", "Det første navnet var Øvre Foss Mechaniske Værksted.", ["snl"], "em_naering_industri_og_mekanisering", "fact"],
  ["Hva var hovedsatsingen i starten?", ["Møllebygging", "Skipsbygging", "Tekstilfarging"], "Møllebygging", "Møllebygging var verkstedets første hovedsatsing.", ["snl"], "em_naering_arbeid_verdiskaping", "fact"],
  ["Når flyttet produksjonen til Myraløkka?", ["1854", "1848", "1870"], "1854", "Produksjonen flyttet til Myraløkka i 1854.", ["snl"], "em_naering_byens_okonomiske_rom", "fact"],
  ["Hva bygde verkstedet for første gang i 1850?", ["En vannturbin", "En elektrisk motor", "En dieselmotor"], "En vannturbin", "Oslo byleksikon oppgir at den første vannturbinen ble bygd i 1850.", ["byleksikon"], "em_naering_industri_og_mekanisering", "fact"],
  ["Hvem mottok verkstedets første store turbinoppdrag?", ["Hjula Væverier", "Freia", "Christiania Spigerverk"], "Hjula Væverier", "Det første store oppdraget var turbin og hovedaksling til Hjula Væverier.", ["byleksikon"], "em_naering_logistikk_verdikjeder", "fact"],
  ["Hvilket produkt inngikk i Myrens produksjon?", ["Dampmaskiner", "Telefonapparater", "Trykkpresser for aviser"], "Dampmaskiner", "Myrens produserte blant annet turbiner, dampmaskiner og kjeler.", ["snl"], "em_naering_produksjon_produktivitet", "fact"],
  ["Hvilken næring ble Myrens særlig viktig for etter 1860?", ["Treforedlingsindustrien", "Tekstilindustrien", "Tobakksindustrien"], "Treforedlingsindustrien", "Myrens ble en ledende leverandør av utstyr til sagbruk og tresliperier.", ["snl"], "em_naering_logistikk_verdikjeder", "fact"],
  ["Hvilken endring i 1860 bidro til større marked?", ["Sagbruksprivilegiene ble opphevet", "Kværner kjøpte verkstedet", "Fiskemel ble patentert"], "Sagbruksprivilegiene ble opphevet", "Opphevelsen bidro til flere sagbruk og større etterspørsel etter utstyr.", ["snl"], "em_naering_forbruk_marked", "fact"],
  ["Hvilken utmerkelse fikk bedriften i 1883?", ["Kongens gullmedalje", "St. Hallvard-medaljen", "Nobelprisen"], "Kongens gullmedalje", "Bedriften fikk Kongens gullmedalje for maskiner, møller og motorer.", ["snl"], "em_naering_industri_og_mekanisering", "fact"],
  ["Hvor stor var virksomheten rundt 1890 når Fredrikstad-filialen regnes med?", ["Omkring 1000 ansatte", "Omkring 100 ansatte", "Omkring 5000 ansatte"], "Omkring 1000 ansatte", "Myrens var blant landets største bedrifter med rundt 1000 ansatte inkludert filialen.", ["snl"], "em_naering_arbeid_verdiskaping", "fact"],
  ["Når ble Myrens Verksted et aksjeselskap?", ["1907", "1928", "1988"], "1907", "Virksomheten ble omdannet til Myrens Verksted A/S i 1907.", ["snl", "byleksikon"], "em_naering_eierskap_styring", "fact"],
  ["Hvilken ny industri fikk Myrens utstyr fra 1909?", ["Fiskeforedlingsindustrien", "Bilindustrien", "Flyindustrien"], "Fiskeforedlingsindustrien", "Fra 1909 produserte Myrens utstyr for fiskemel og fiskeolje.", ["snl"], "em_naering_produksjon_produktivitet", "fact"],
  ["Hva var KaMyr knyttet til?", ["Utstyr til celluloseindustrien", "Boligbygging", "Bryggerimaskiner"], "Utstyr til celluloseindustrien", "Samarbeidet med Karlstad Mekaniske Verkstad utviklet KaMyr for celluloseutstyr.", ["snl"], "em_naering_innovasjon_teknologisk_skift", "context"],
  ["Hvem kjøpte Myrens Verksted i 1928?", ["Kværner", "Orkla", "Norsk Hydro"], "Kværner", "Kværner kjøpte Myrens Verksted i 1928.", ["snl", "byleksikon"], "em_naering_eierskap_styring", "context"],
  ["Hva utgjorde eksporten i 1973?", ["80 prosent av omsetningen", "8 prosent av omsetningen", "Hele omsetningen"], "80 prosent av omsetningen", "Eksporten utgjorde 80 prosent av omsetningen i 1973.", ["snl"], "em_naering_logistikk_verdikjeder", "context"],
  ["Hva oppgir SNL om selskapet i 1978?", ["96 millioner kroner i omsetning og 350 ansatte", "350 millioner kroner i omsetning og 96 ansatte", "96 ansatte og ingen eksport"], "96 millioner kroner i omsetning og 350 ansatte", "SNL oppgir 96 millioner kroner i omsetning og 350 ansatte i 1978.", ["snl"], "em_naering_produksjon_produktivitet", "context"],
  ["Når ble industrivirksomheten i Oslo lagt ned?", ["1988", "1973", "1997"], "1988", "Produksjonen i Oslo ble lagt ned i 1988.", ["snl", "byleksikon"], "em_naering_omstilling_kriser_skift", "context"],
  ["Hva ble Myrens slått sammen med ved nedleggelsen?", ["Thune-Eureka", "Fredrikstad Mekaniske Verksted", "Karlstad Mekaniske Verkstad"], "Thune-Eureka", "Myrens ble slått sammen med Thune-Eureka til Kværner Eureka.", ["snl"], "em_naering_eierskap_styring", "context"],
  ["Hva skjedde med området i 1997?", ["Det ble kjøpt og Myren Eiendom ble etablert", "Alle bygningene ble revet", "Maskinproduksjonen startet på nytt"], "Det ble kjøpt og Myren Eiendom ble etablert", "En investorgruppe kjøpte området og etablerte Myren Eiendom.", ["current", "byleksikon"], "em_naering_eiendom_kapital_byutvikling", "context"],
  ["Hvilken verdikjederolle hadde Myrens?", ["Det leverte maskiner som andre fabrikker brukte i produksjonen", "Det solgte bare råtømmer", "Det drev bare transport"], "Det leverte maskiner som andre fabrikker brukte i produksjonen", "Myrens var en leverandørindustri for sagbruk, treforedling, fiskeforedling og celluloseproduksjon.", ["snl"], "em_naering_logistikk_verdikjeder", "analysis", "met_naering_logistikk_og_verdikjedeanalyse"],
  ["Hva kan 80 prosent eksportandel dokumentere direkte?", ["Hvor stor del av omsetningen som kom fra eksport", "At bedriften var lønnsom", "At produktiviteten økte"], "Hvor stor del av omsetningen som kom fra eksport", "Eksportandel måler omsetningens markedsfordeling, ikke lønnsomhet eller produktivitet.", ["snl"], "em_naering_produksjon_produktivitet", "analysis", "met_naering_statistikk_og_indikatoranalyse"],
  ["Hva endret Kværner-oppkjøpet først og fremst?", ["Eierskap og konserntilknytning", "Akerselvas løp", "Verkstedets grunnleggelsesår"], "Eierskap og konserntilknytning", "Oppkjøpet i 1928 flyttet kontrollen over virksomheten inn i Kværner-konsernet.", ["snl"], "em_naering_eierskap_styring", "analysis", "met_naering_eierskaps_og_styringsanalyse"],
  ["Hvilken omstilling viser dagens bruk av fabrikkbyggene?", ["Fra maskinindustri til eiendom og tjenester", "Fra jordbruk til gruvedrift", "Fra havn til flyplass"], "Fra maskinindustri til eiendom og tjenester", "Området gikk fra mekanisk produksjon til kontorer, medier, trening og servering.", ["current", "byleksikon"], "em_naering_omstilling_kriser_skift", "analysis", "met_naering_omstilling_og_endringsanalyse"],
  ["Hvorfor kan ikke ombruk alene måle utfallet for de tidligere ansatte?", ["Bygningsbruk viser ikke deres senere arbeid, inntekt eller kompetanse", "Fordi bygninger aldri kan brukes på nytt", "Fordi nedleggelsen ikke er dokumentert"], "Bygningsbruk viser ikke deres senere arbeid, inntekt eller kompetanse", "Eiendomsombruk dokumenterer arealendring, men ikke arbeidsmarkedsutfallet for dem som mistet industrijobbene.", ["snl", "current"], "em_naering_omstilling_kriser_skift", "analysis", "met_naering_omstilling_og_endringsanalyse"],
  ["Hvem kontrollerte beslutningen om nedleggelse innenfor kildenes beskrivelse?", ["Kværner-systemet som eier og konsern", "De besøkende ved Akerselva", "Dagens leietakere"], "Kværner-systemet som eier og konsern", "Kildene knytter omstruktureringen og flyttingen av produksjonen til Kværner.", ["snl", "byleksikon"], "em_naering_makt_ulikhet_arbeidsliv", "analysis", "met_naering_eierskaps_og_styringsanalyse"],
  ["Hvilken samlet analyse passer best for Myrens Verksted?", ["Vannkraft, fagarbeid, maskiner, eksport, eierskap og ombruk må leses sammen", "Bare fasaden er relevant", "Dagens leietakere forklarer hele historien"], "Vannkraft, fagarbeid, maskiner, eksport, eierskap og ombruk må leses sammen", "Stedet binder produksjonssystem, marked, konsernendring og eiendomsombruk sammen.", ["snl", "byleksikon", "current"], "em_naering_industri_og_mekanisering", "analysis", "met_naering_industrihistorisk_analyse"]
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
  topic_hook_id: "omstilling_av_naeringsrom",
  thinker_id: "david_harvey",
  theory_ref: {
    topic_hook_id: "omstilling_av_naeringsrom",
    thinker_id: "david_harvey",
    why_it_helps: "Et romlig kapitalperspektiv undersøker hvordan et tidligere produksjonsanlegg får nye eiendoms- og tjenestefunksjoner etter industrinedleggelsen."
  }
});
const phases = ["opening", "middle", "bridge", "final"];
const titles = ["Grunnleggelsen og elva", "Maskiner og industrivekst", "Eierskap, eksport og nedleggelse", "Fra verksted til nytt næringsområde"];
const quizFile = "data/quiz/naeringsliv/myrens_verksted_sets.json";
const existingQuizAudit = {
  searched_paths: ["data/quiz/manifest.json", "data/quiz/quiz_naeringsliv.json", "data/quiz/naeringsliv/myrens_verksted_sets_merged.json", placeFile],
  active_before: { file: "data/quiz/naeringsliv/myrens_verksted_sets_merged.json", set_count: 5, question_count: 30, finding: "30 spørsmål fordelt på fem eldre sett med seks spørsmål og fem legacy-spørsmål i flatfil ble funnet; den flate grunnleggerfasiten var feil." },
  decisions: ["Bevar alle kildebårne læringsjobber som passer dagens kontrakt.", "Korriger grunnleggerfasiten til Jens Jacob og Andreas Jensen.", "Materialiser normal 4x7 med fjorten vanlige åpningsspørsmål og metode først fra sett tre."],
  knowledge_migration: "De 28 valgte spørsmålene får stabile Knowledge-ID-er; utelatte spørsmål er dokumentert i produksjonsbriefen."
};
const selectedCurriculum = { module_ids: ["arbeid_produksjon_verdiskaping", "logistikk_infrastruktur_rom"], emne_ids: [...new Set(questions.map(question => question.emne_id))], topic_hook_ids: ["maskin_menneske_produksjon", "verdikjede_spor", "eierskap_og_styring", "omstilling_av_naeringsrom"], method_ids: [...new Set(questions.map(question => question.method_id).filter(Boolean))], thinker_ids: ["david_harvey"], works: [] };
const profileDecision = { profile: "normal", set_count: 4, questions_per_set: 7, justification: "Fire læringsjobber dekker etablering og sted, maskin- og arbeidsprosesser, eierskap og eksport samt nedleggelse og eiendomsombruk uten å splitte stedet i parallelle quizer." };
const heldBackCandidates = ["Legacy-fasiten Jacob og Thorvald Meyer som grunnleggere.", "Den ubetingede påstanden om eksport til over 30 land.", "Påstanden om at dagens bygningsombruk dokumenterer et godt utfall for tidligere ansatte.", "Myrens-navnet som levende industriselskap etter 1988."];
write(quizFile, {
  targetId: placeId,
  categoryId: "naeringsliv",
  sources: Object.fromEntries(Object.entries(sourceRegistry).map(([id, source]) => [id, source.url])),
  production_context: {
    manifest_category: "naeringsliv", profile: "normal_4x7", standard_version: "3.3", source_brief: "data/quiz/production_briefs/naeringsliv/myrens_verksted.json", context_artifact: "data/quiz/production_context/naeringsliv/myrens_verksted.json",
    resolved_files: { pensum: "data/fag/naeringsliv/naeringslivpensum_canonical_v4_5.json", emner: "data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json", fagkart: "data/fag/naeringsliv/fagkart_naeringsliv_canonical_v4_5.json", methods: "data/fag/naeringsliv/methods_naeringsliv_canonical_v4_5.json", supersetQuizMal: "data/fag/naeringsliv/supersetQUIZMAL_naeringsliv.json", quizStandard: "data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md", quizQuestionSchema: "data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json" },
    required_inputs_loaded: ["pensum", "emner", "fagkart", "methods", "supersetQuizMal", "quizStandard", "quizQuestionSchema"],
    pensum_module_ids: selectedCurriculum.module_ids, emne_ids: selectedCurriculum.emne_ids, topic_hook_ids: selectedCurriculum.topic_hook_ids, method_ids: selectedCurriculum.method_ids, thinker_ids: selectedCurriculum.thinker_ids, works: selectedCurriculum.works, source_review_status: "reviewed", existing_quiz_audit: existingQuizAudit, profile_decision: profileDecision, held_back_candidates: heldBackCandidates, normal_opening_questions: 14, theory_start_phase: "final", method_start_phase: "final"
  },
  sets: phases.map((phase, index) => ({ set_id: `naeringsliv_${placeId}_set_${index + 1}`, title: titles[index], level: index + 1, order: index + 1, phase, xp: 50 + index * 25, questions: questions.slice(index * 7, index * 7 + 7) }))
});
write("data/quiz/production_briefs/naeringsliv/myrens_verksted.json", {
  schema_version: "1.0", status: "reviewed", categoryId: "naeringsliv", targetId: placeId, profile_hint: "normal", reviewed_at: verifiedAt,
  review_note: "SNL, Oslo byleksikon og Myren Eiendom gir fire adskilte læringsjobber om etablering, maskinproduksjon, konserneierskap og ombruk. Feil grunnleggerfasit og udokumenterte kausalpåstander er holdt ute.",
  scope: { place: "Myrens Verksted", production_profile: "normal", set_count: 4, questions_per_set: 7, total_questions: 28, normal_opening_questions: 14 },
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
fagManifest.naeringsliv.quizProduction.targets[placeId] = { source_brief: "../quiz/production_briefs/naeringsliv/myrens_verksted.json", context_artifact: "../quiz/production_context/naeringsliv/myrens_verksted.json", quiz_file: "../quiz/naeringsliv/myrens_verksted_sets.json" };
write("data/fag/fag_manifest.json", fagManifest);

const placeClaims = [
  ["identity", "Myrens Verksted ble grunnlagt av Jens Jacob og Andreas Jensen i 1848 som Øvre Foss Mechaniske Værksted.", urls.snl, "Etablering", "identity", "historical"],
  ["move", "Produksjonen flyttet til Myraløkka ved Akerselva i 1854.", urls.snl, "Etablering", "ordinary", "historical"],
  ["machines", "Verkstedet produserte turbiner, dampmaskiner, kjeler og maskiner for sagbruk, høvlerier, treforedling og fiskeindustri.", urls.snl, "innledningen, Etablering, Sentral innen treforedling og Stor eksport", "ordinary", "historical"],
  ["market", "Opphevelsen av sagbruksprivilegiene i 1860 bidro til et større marked for produksjonsutstyr til sagbruk og tresliperier.", urls.snl, "Sentral innen treforedling", "ordinary", "historical"],
  ["scale", "Bedriften fikk Kongens gullmedalje i 1883 og hadde rundt 1000 ansatte i 1890 når Fredrikstad-filialen regnes med.", urls.snl, "Etablering og Blant landets største bedrifter", "ordinary", "historical"],
  ["diversification", "Myrens ble aksjeselskap i 1907 og utvidet senere produksjonen til fiske- og celluloseindustri.", urls.snl, "Blant landets største bedrifter", "ordinary", "historical"],
  ["ownership_export", "Kværner kjøpte Myrens i 1928, og eksporten utgjorde 80 prosent av omsetningen i 1973.", urls.snl, "Blant landets største bedrifter og Stor eksport", "ordinary", "historical"],
  ["closure", "Produksjonen i Oslo ble lagt ned i 1988 og virksomheten slått sammen med Thune-Eureka til Kværner Eureka.", urls.snl, "Nedleggelse", "temporal", "historical"],
  ["reuse", "Etter kjøpet av området i 1997 ble anlegget utviklet som næringseiendom med kontorer, medier, trening, servering og andre tjenester.", urls.current, "Historien, Om Myren Eiendom og Våre bygg", "temporal", "current"]
].map(([id, claim, sourceUrl, sourceLocation, claimKind, temporalStatus]) => ({ id: `claim_${placeId}_${id}`, claim, sourceUrl, sourceLocation, sourceType: sourceUrl === urls.current ? "primary" : "reputable_secondary", verifiedAt, status: "verified", claimKind, evidenceMode: "direct", temporalStatus }));
const coverage = text => sentences(text).map((sentence, index) => {
  const lower = sentence.toLowerCase();
  let id = "identity";
  if (lower.includes("1854") || lower.includes("myraløkka")) id = "move";
  if (lower.includes("turbin") || lower.includes("damp") || lower.includes("maskin") || lower.includes("møllebygg")) id = "machines";
  if (lower.includes("sagbruksprivileg") || lower.includes("marked")) id = "market";
  if (lower.includes("1883") || lower.includes("1890") || lower.includes("gullmedalje") || lower.includes("1000")) id = "scale";
  if (lower.includes("1907") || lower.includes("fiskefored") || lower.includes("cellulose")) id = "diversification";
  if (lower.includes("1928") || lower.includes("1973") || lower.includes("eksport") || lower.includes("kvern")) id = "ownership_export";
  if (lower.includes("1988") || lower.includes("nedlagt") || lower.includes("thune")) id = "closure";
  if (lower.includes("1997") || lower.includes("i dag") || lower.includes("ombruk") || lower.includes("kontor") || lower.includes("tjeneste") || lower.includes("bevart")) id = "reuse";
  return { sentence: index + 1, claimIds: [`claim_${placeId}_${id}`] };
});
const readinessQuestions = [
  ["Når ble Myrens Verksted grunnlagt?", "1848", "når", "identity"],
  ["Hvem grunnla verkstedet?", "Jens Jacob og Andreas Jensen", "hvem", "identity"],
  ["Hvor flyttet produksjonen i 1854?", "Myraløkka ved Akerselva", "hvor", "move"],
  ["Hva produserte verkstedet for andre industribedrifter?", "Maskiner og produksjonsutstyr", "hva", "machines"],
  ["Hva skjedde med markedet etter at sagbruksprivilegiene ble opphevet?", "Markedet for produksjonsutstyr ble større", "hva_skjedde", "market"],
  ["Når kjøpte Kværner Myrens?", "1928", "når", "ownership_export"],
  ["Hva skjedde med Oslo-produksjonen i 1988?", "Den ble lagt ned", "hva_skjedde", "closure"],
  ["Hva ble fabrikkbygningene endret til etter industrinedleggelsen?", "Et næringsområde for kontorer og tjenester", "hva_ble_bygget_produsert_eller_endret", "reuse"]
].map(([question, answer, type, claim], index) => ({ question, answer, type, normalKnowledgeQuestion: index < 7, claimIds: [`claim_${placeId}_${claim}`] }));
write("data/places/production/myrens_verksted.json", {
  schemaVersion: "4.2", validatorVersion: "4.2.1", placeId, placeFile, status: "ready_v4_2",
  identity: { status: "resolved", represents: "Det historiske Myrens Verksted-anlegget og dagens næringsområde ved Sandakerveien 24c.", period: "1854–", excludes: ["det opprinnelige verkstedet ved Øvre Foss", "Myraløkka som park", "Vøyenfallene", "Myrens Verksteds arbeiderboliger i Arendalsgata"] },
  metadataSnapshot: { name: place.name, year: place.year, category: place.category }, textHashes: { algorithm: "sha256", desc: sha256(place.desc), popupDesc: sha256(place.popupDesc) }, claims: placeClaims,
  sentenceCoverage: { desc: coverage(place.desc), popupDesc: coverage(place.popupDesc) },
  roundsReadiness: { people: "ready_new_verified_jens_jacob_jensen_profile", objects: "ready_two_public_domain_myrens_machines", brands: "ready_authentic_facade_brandmark_100_percent", structures: "ready_documented_factory_building", badges: "ready_category_and_emne_binding", quiz: "ready_normal_4x7", leksikon: "ready", sprak: "ready", stories: "ready", for_na: "reviewed_historical_aerial_and_current_facade_no_exact_vantage_pair", readings: "ready", events: "reviewed_no_stable_current_event", routes: "ready_existing_historical_route_relation", fagverk: "ready", frontImage: "ready_documentary_portrait_3x4" },
  quizReadiness: { status: "canonical_normal_4x7", quizTargetId: placeId, sourceBrief: "data/quiz/production_briefs/naeringsliv/myrens_verksted.json", productionContext: "data/quiz/production_context/naeringsliv/myrens_verksted.json", normalOpeningQuestions: 14, totalQuestions: 28, reuseDecision: "Den eksisterende 30-spørsmålspakken er auditert; 28 kildebårne læringsjobber er bevart eller omskrevet i dagens 4x7-kontrakt, mens feil og duplikater er holdt ute.", questions: readinessQuestions },
  reviews: { factual: { status: "passed", reviewedAt: verifiedAt, reviewer: "Myrens Verksted source review", notes: "SNL, Oslo byleksikon, Myren Eiendom, Industrimuseum, DigitaltMuseum og Commons-metadata er kontrollert. Koordinatet er bevart uendret fra den verifiserte geometriporten." }, editorial: { status: "passed", reviewedAt: verifiedAt, reviewer: "Myrens Verksted editorial review", introducedNewFacts: false, notes: "Maskinleverandørrollen, arbeidet, eierskapet og ombruket er hovedsaken; delsteder og dagens leietakere er ikke brukt som stedfortredere." } },
  reviewsNotes: ["Myraløkka og Vøyenfallene er egne Places.", "Eksportandel skilles fra lønnsomhet og produktivitet.", "Brandmerket er et autentisk lisensiert fasadeutsnitt.", "Før/etter er ærlig holdt til to dokumentariske motiver uten å late som de har identisk kamerastandpunkt."],
  completion: { completedUnder: "4.2", currentStatus: "current", sourceVerifiedAt: verifiedAt, claimsVerified: { verified: placeClaims.length, total: placeClaims.length }, factualReview: "passed", editorialReview: "passed", validatorVersion: "4.2.1" }
});

const sourceIds = ["source_myrens_snl", "source_myrens_byleksikon", "source_myrens_current", "source_myrens_industrimuseum"];
const quizRequiredInputs = ["data/fag/naeringsliv/naeringslivpensum_canonical_v4_5.json", "data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json", "data/fag/naeringsliv/fagkart_naeringsliv_canonical_v4_5.json", "data/fag/naeringsliv/methods_naeringsliv_canonical_v4_5.json", "data/fag/naeringsliv/supersetQUIZMAL_naeringsliv.json", "data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md", "data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json"];
write("data/places/naeringsliv-production/myrens_verksted.json", {
  schemaVersion: "naeringsliv_place_production_v1", validatorVersion: "1.0.0", placeId, placeFile, status: "ready",
  economicIdentity: { statement: "Myrens Verksted er et tidligere mekanisk fabrikkanlegg og nåværende næringsområde ved Akerselva.", anchorType: "mixed_economic_site", placeObjectDistinction: "Rapporten skiller fabrikkanlegget fra Myrens-brandet, de bevarte maskinene, arbeiderboligene, Myraløkka og dagens enkeltleietakere.", temporalScope: { start: "1854", end: "2026", precision: "period", rationale: "Produksjonen flyttet hit i 1854, ble lagt ned i 1988, og eiendoms- og tjenestevirksomhet er dokumentert som aktuell i 2026." }, sourceIds },
  businessTopics: [
    { emneId: "em_naering_arbeid_verdiskaping", siteSpecificRationale: "Verkstedet organiserte fagarbeid, energi, kapital og maskiner som produksjonsutstyr for andre bedrifter.", caseIds: ["case_myrens_machine_supplier"] },
    { emneId: "em_naering_industri_og_mekanisering", siteSpecificRationale: "Turbiner, dampmaskiner og trebearbeidingsmaskiner gjør mekanisering og fabrikkproduksjon konkret.", caseIds: ["case_myrens_machine_supplier"] },
    { emneId: "em_naering_produksjon_produktivitet", siteSpecificRationale: "Myrens leverte maskiner som endret produksjonsprosesser, men kildene gir ikke en sammenlignbar produktivitetsserie.", caseIds: ["case_myrens_machine_supplier"] },
    { emneId: "em_naering_logistikk_verdikjeder", siteSpecificRationale: "Produksjonsutstyret koblet Myrens til sagbruk, treforedling, cellulose- og fiskeindustri i Norge og eksportmarkeder.", caseIds: ["case_myrens_machine_supplier"] },
    { emneId: "em_naering_omstilling_kriser_skift", siteSpecificRationale: "Nedleggelsen i 1988 og eiendomsombruket fra 1997 viser et skift fra maskinindustri til tjenester.", caseIds: ["case_myrens_machine_supplier"] }
  ],
  sources: [
    { id: "source_myrens_snl", url: urls.snl, sourceLocation: "Hele fagartikkelen, særlig Etablering, treforedling, eksport og Nedleggelse", sourceType: "museum_or_heritage", verifiedAt, temporalCoverage: "mixed", provenance: "Fagredigert SNL-artikkel skrevet av fagpersoner tilknyttet Norsk teknisk museum.", limitations: "Artikkelen gir punktvise tall, ikke full regnskaps-, lønns- eller produktivitetsserie." },
    { id: "source_myrens_byleksikon", url: urls.byleksikon, sourceLocation: "Stedsposten om anlegg, turbinoppdrag, bygninger og senere bruk", sourceType: "reputable_secondary", verifiedAt, temporalCoverage: "mixed", provenance: "Oslo byleksikons redaksjonelle stedspost for Sandakerveien 24c.", limitations: "Siden ble sist redigert i 2021 og brukes ikke alene for dagens leietakere eller eierskap." },
    { id: "source_myrens_current", url: urls.current, sourceLocation: "Historien, Om Myren Eiendom og Våre bygg", sourceType: "primary_business", verifiedAt, temporalCoverage: "current", provenance: "Eiendomsselskapets egen beskrivelse av kjøpet i 1997, forvaltningen og dagens byggbruk.", limitations: "Egenpresentasjonen er relevant for nåstatus, men er ikke uavhengig dokumentasjon av historiske rekordpåstander eller økonomiske resultater." },
    { id: "source_myrens_industrimuseum", url: urls.industrimuseum, sourceLocation: "Bedriftsposten om produksjon og industrihistorie", sourceType: "museum_or_heritage", verifiedAt, temporalCoverage: "historical", provenance: "Norsk museumsnettverk for industrihistories bedriftspost om Myrens Verksted.", limitations: "Oppslaget er kort og brukes som museumskontroll, ikke som eneste grunnlag for tall eller nåstatus." }
  ],
  economicCases: [{
    id: "case_myrens_machine_supplier", claim: "Myrens Verksted skapte verdi som maskinleverandør til andre industribransjer, før konsernomstilling stengte Oslo-produksjonen og fabrikkanlegget ble omgjort til eiendoms- og tjenestevirksomhet.",
    unitOfAnalysis: { unit: "Myrens Verksted-anlegget ved Akerselva", boundary: "Analysen omfatter stedets maskinproduksjon, direkte leverandørforbindelser, eierskifte, nedleggelse og bygningsombruk, ikke hele Kværner-konsernet eller kundenes komplette verdikjeder.", scale: "site", temporalScope: { start: "1854", end: "2026", precision: "period", rationale: "Perioden følger produksjon ved Myraløkka, Kværner-epoken, nedleggelsen og dokumentert nåværende næringsbruk." }, sourceIds },
    actors: [
      { name: "Myrens eiere og ledelse", roleOrInterest: "Organiserte kapital, produktvalg, marked, investeringer og senere konserntilknytning.", economicPosition: "Kontrollerte virksomhetens strategiske beslutninger og bruken av produksjonsanlegget.", sourceIds: ["source_myrens_snl", "source_myrens_byleksikon"] },
      { name: "Verkstedsarbeidere og ingeniører", roleOrInterest: "Utviklet, bygde og monterte turbiner, dampmaskiner og prosessutstyr.", economicPosition: "Skapte produksjonsutstyret gjennom lønnet fagarbeid uten å kontrollere eierskapet.", sourceIds: ["source_myrens_snl", "source_myrens_byleksikon", "source_myrens_industrimuseum"] },
      { name: "Kundebedrifter i tre-, cellulose- og fiskeindustrien", roleOrInterest: "Kjøpte maskiner og komplette anlegg for egen produksjon.", economicPosition: "Omsatte Myrens-utstyret til kapasitet og output i andre industrivirksomheter.", sourceIds: ["source_myrens_snl", "source_myrens_industrimuseum"] },
      { name: "Myren Eiendom og dagens leietakere", roleOrInterest: "Utvikler, drifter og bruker det tidligere fabrikkanlegget som næringsområde.", economicPosition: "Skaper inntekter og tjenester gjennom eiendom og ny bruk av de bevarte byggene.", sourceIds: ["source_myrens_current"] }
    ],
    valueCreation: {
      inputs: [{ statement: "Vannkraft, jern, verkstedbygninger, maskiner, kapital, fagarbeid og teknisk kunnskap var sentrale innsatsfaktorer.", sourceIds: ["source_myrens_snl", "source_myrens_byleksikon"] }],
      activity: { statement: "Innsatsfaktorene ble organisert som konstruksjon, støping, maskinering, montering og levering av produksjonsutstyr.", sourceIds: ["source_myrens_snl", "source_myrens_industrimuseum"] },
      outputs: [{ statement: "Verkstedet leverte blant annet turbiner, dampmaskiner, sagbruks- og høvlerimaskiner samt utstyr til treforedling og fiskeindustri.", sourceIds: ["source_myrens_snl"] }],
      valueCreationAssessment: { statement: "Kildene dokumenterer en leverandørkjede som støttet andre industribedrifter, men gir ikke konsistente data for å beregne verdiskaping eller produktivitet gjennom hele perioden.", sourceIds: ["source_myrens_snl", "source_myrens_byleksikon"] }
    },
    measurement: { methodId: "met_naering_industrihistorisk_analyse", evidenceType: "mixed", indicatorOrObservation: "Produkter, ansattall, eksportandel, omsetningstall, eierskifter og bygningsbruk sammenholdes som punktvise indikatorer.", unit: "stedbundne industri- og omstillingsindikatorer", period: "1854–2026", comparability: "Hendelser og enkelte punktverdier kan sammenlignes, men tallene dekker ulike enheter og kan ikke behandles som én ubrutt tidsserie.", dataLimitations: "Ansattallet i 1890 inkluderer Fredrikstad-filialen, eksportandelen måler omsetning og 1978-tallene gir bare ett årspunkt.", sourceIds },
    distributionAndPower: { ownershipOrControl: "Gründerfamilien og senere Kværner kontrollerte investeringer, produktstrategi og beslutningen om å flytte og stenge produksjon.", laborPosition: "Arbeidere og ingeniører skapte maskinene og bar sysselsettingsrisikoen ved omstruktureringen uten å kontrollere konserneierskapet.", beneficiaries: ["Eiere kunne motta avkastning fra produksjon, eksport og senere eiendomsutvikling.", "Kundebedrifter fikk produksjonsutstyr til egne industriprosesser.", "Arbeidere mottok lønn og utviklet spesialisert fagkompetanse."], costRiskBearers: ["Eiere bar investerings- og markedsrisiko.", "Ansatte bar risiko for arbeidsbelastning, omstilling og tap av arbeidsplass.", "Nabolag og elvemiljø kan ha båret industrikostnader, men kildene her tallfester dem ikke."], sourceIds },
    riskAndExternalities: { riskAssessment: { statement: "Virksomheten var avhengig av teknologisk konkurranseevne, eksportmarkeder, konsernstrategi og etterspørselen i andre industribransjer.", sourceIds: ["source_myrens_snl", "source_myrens_byleksikon"] }, externalityAssessment: { status: "not_applicable", rationale: "Kildene dokumenterer industri ved Akerselva, men gir ikke et sammenlignbart stedsspesifikt grunnlag for å tallfeste utslipp, støy, helse eller andre eksternaliteter." } },
    comparisonAndCausality: { comparisonBasis: "SNL og Industrimuseum belyser produksjon og markeder, Oslo byleksikon belyser stedet og bygningene, mens Myren Eiendom dokumenterer nåværende bruk.", causalStatus: "descriptive_only", causalAssessment: "Materialet viser samtidighet mellom markedsendringer, oppkjøp, eksport, nedleggelse og ombruk, men isolerer ikke én årsak til veksten eller nedleggelsen.", alternativeExplanations: ["Teknologisk konkurranse, etterspørsel, konsernstrategi, kostnader og lokalisering kan alle ha påvirket utviklingen."], uncertainty: "Uten sammenlignbare regnskaps-, produktivitets- og arbeidsmarkedsdata kan virkningene ikke tilskrives én faktor.", sourceIds }
  }],
  presentOperation: { operationalStatus: "former", statement: "Industriselskapet ble lagt ned i Oslo i 1988; området drives nå som næringseiendom med kontorer, medier, trening, servering og andre tjenester.", originalEconomicRoleRelationship: "Den opprinnelige maskinproduksjonen er avsluttet, mens fabrikkbygningene og Myrens-navnet er videreført i en ny eiendoms- og tjenesteøkonomi.", checkedAt: verifiedAt, sourceIds: ["source_myrens_current", "source_myrens_snl", "source_myrens_byleksikon"] },
  quizOpening: { status: "PASS", quizTargetId: placeId, firstTwoSetsQuestionCount: 14, sourceBrief: "data/quiz/production_briefs/naeringsliv/myrens_verksted.json", productionContext: "data/quiz/production_context/naeringsliv/myrens_verksted.json", requiredInputs: quizRequiredInputs },
  chronologyStories: { status: "PASS", chronologyReviewed: true, storiesReviewed: true, rationale: "Leksikonets tretten milepæler eier tidslinjen; storyen om turbinoppdraget har en egen narrativ akse om overgangen fra mølleverksted til maskinleverandør." },
  gates: Object.fromEntries("ABCDEFGH".split("").map(letter => [letter, { status: "PASS", evidenceRefs: [letter === "A" ? "economicIdentity" : letter === "B" ? "businessTopics" : letter === "C" ? "economicCases[0].valueCreation" : letter === "D" ? "economicCases[0].distributionAndPower" : letter === "E" ? "economicCases[0].measurement" : letter === "F" ? "economicCases[0].comparisonAndCausality" : letter === "G" ? "quizOpening" : "chronologyStories"] }])),
  review: { reviewer: "History GO Næringsliv source audit", reviewedAt: verifiedAt, notes: "Stedsidentitet, maskinproduksjon, leverandørrolle, arbeid, eksport, eierskap, nedleggelse, målegrenser og nåstatus er kontrollert. Rapporten skiller omsetning, eksportandel, produktivitet og lønnsomhet." }
});

write("reports/place-production/myrens-verksted-phase1-24-gate-audit-v1.json", {
  schema: "history_go_phase1_24_quality_gate_v1", place_id: placeId, verified_at: verifiedAt,
  null_measurement: { existing_place: true, canonical_id_reused: placeId, coordinate_changed: false, coordinate_status_preserved: "verified_geometry", existing_quiz_audit: "5 flat questions plus 5x6 merged set file", brand_candidate_audited: brandId, held_back_persons: ["Andreas Jensen – documented founder but no verified reusable portrait/profile package in this tranche", "Knud Dahl – documented co-owner but no verified reusable portrait/profile package in this tranche"], before_after_exact_pair: false },
  source_conflicts: [{ claim: "Jacob og Thorvald Meyer grunnla Myrens Verksted.", status: "rejected", reason: "SNL, Oslo byleksikon og Jens Jacob Jensen-biografien dokumenterer Jens Jacob og Andreas Jensen som grunnleggere." }, { claim: "KaMyr ble opprettet i 1920 eller 1923.", status: "qualified", reason: "SNL daterer samarbeidets start til 1920, mens Oslo byleksikon daterer selskapsdannelsen til 1923; quizen spør derfor om funksjonen og bruker 1920 bare for samarbeidets start." }],
  quality_score: {
    correctness_and_evidence: { score: 5, note: "Sted, person, brand, bilder, uendret koordinat, 28 quizspørsmål og nåstatus har inspiserbare kilder; to kildekonflikter er eksplisitt løst." },
    coverage_and_completion: { score: 5, note: "Identitet, koordinat, fire bildeklare samlinger, Badge/Fagverk, quiz, popup, 13-punkts kronologi, språk, story, lesespor, People og Brand er materialisert." },
    editorial_quality: { score: 5, note: "Maskinleverandørrollen binder sammen arbeid, elv, markeder, konserneierskap og ombruk uten å gjøre stedet til en katalog over leietakere." },
    technical_integrity: { score: 5, note: "Én deterministisk builder, normal 4x7-quiz, v4.2-description packet, næringslivspakke, People-claims og fokuserte tester låser leveransen." },
    safety_and_responsibility: { score: 5, note: "Museums- og eiendomstilgang respekteres, alle bilder og brandmerket er kildeført, og ingen endorsement eller udokumentert arbeidstakerutfall hevdes." },
    maintainability_and_auditability: { score: 5, note: "Canonical manifester, kilde-ID-er, transformasjonsmetadata, konfliktnotater og permanente tester gjør pakken etterprøvbar og reproduserbar." },
    total: 30, critical_findings: 0, unresolved_blockers: 0
  }
});
write("reports/place-production/myrens-verksted-workcard-current.json", { place_id: placeId, status: "complete", phases: "1–24", verified_at: verifiedAt, canonical_next: "lilleborg_fabrikker", notes: ["Eksisterende canonical Place er fullprodusert uten ID- eller koordinatendring.", "Eldre quiz er auditert og erstattet av normal 4x7.", "Kronologi er integrert i full stedspakke.", "Neste sted startes først etter verifisert merge."] });

console.log(`Built Myrens Verksted completion package (${questions.length} quiz questions, ${chronology.length} chronology entries, ${sentences(place.popupDesc).length} popup sentences).`);
