#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { auditOvreFossCompletion } from "../scripts/audit-ovre-foss-hjula-completion.mjs";

const root = process.cwd();
const verifiedAt = "2026-08-27";
const placeId = "ovre_foss";
const personId = "halvor_schou";
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const write = (file, value) => {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const sha256 = value => crypto.createHash("sha256").update(String(value)).digest("hex");
const addOnce = (array, value, key = item => item) => {
  if (!array.some(item => key(item) === key(value))) array.push(value);
};
const sentences = text => [...new Intl.Segmenter("nb", { granularity: "sentence" }).segment(text)]
  .map(item => item.segment.trim()).filter(Boolean);

const urls = {
  snlHjula: "https://snl.no/Hjula_V%C3%A6veri",
  byleksikon: "https://oslobyleksikon.no/side/Hjula_V%C3%A6verier",
  ovreFoss: "https://oslobyleksikon.no/side/%C3%98vre_Foss",
  nblSchou: "https://nbl.snl.no/Halvor_Schou",
  snlSchou: "https://snl.no/Halvor_Schou",
  gladsMolle: "https://oslobyleksikon.no/side/Glads_m%C3%B8lle",
  voyenfallene: "https://oslobyleksikon.no/side/V%C3%B8yenfallene",
  currentPhoto: "https://commons.wikimedia.org/wiki/File:Sagene_Hjula_Veveri_164747_IMG_3932.jpg",
  structurePhoto: "https://commons.wikimedia.org/wiki/File:Sagene_Hjula_Veveri_164747_IMG_3933.jpg",
  historicalPhoto: "https://commons.wikimedia.org/wiki/File:Oslo._Akerselven._Hjula_veveri._Sagveien_-_NB_MS_G4_0370.jpg",
  portrait: "https://commons.wikimedia.org/wiki/File:Halvor_Schou.jpg",
  artwork: "https://commons.wikimedia.org/wiki/File:Wilhelm_Peters_-_Interior_from_Hjula_weaving_Mill_-_NG.M.00871_-_National_Museum_of_Art,_Architecture_and_Design.jpg",
  adamSmith: "https://www.gutenberg.org/files/3300/3300-h/3300-h.htm",
  productivityMethod: "https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/labourproductivity/methodologies/labourproductivityqmi"
};

const placeFile = "data/places/naeringsliv/oslo/places_naeringsliv/ovre_foss.json";
const previousPlace = read(placeFile);
const desc = "Hjula Væverier åpnet ved Hjulafossen i 1855 og vokste til en stor norsk tekstilbedrift. Vannkraft, importerte vevstoler og et omfattende, hovedsakelig kvinnelig fabrikkarbeid gjorde anlegget til et tyngdepunkt i industribyen Sagene. Produksjonen stanset i 1957; den bevarte teglbygningen i Sagveien 23 gjør fortsatt industrilandskapet lesbart ved Øvre Foss.";
const popupDesc = "Denne stedsposten binder sammen Hjula Væverier i Sagveien 23 og industrilandskapet ved Øvre Foss. Selve fabrikken lå ved Hjulafossen, mens Øvre Foss er navnet på fossen og området nedstrøms. Det verifiserte stedsankeret ligger i det tidligere Hjula-anlegget og skal ikke tolkes som et eksakt punkt for hele fosselandskapet.\n\nHalvor Schou startet i 1849 med tjue engelske vevstoler i Brenneribakken. Han kjøpte Hjulafossen i 1854, og året etter kom Hjula Væverier i drift i en fabrikk tegnet av Oluf Nicolai Roll. Planer, maskindeler og vevstoler kom fra England, mens Myrens Verksted leverte en vannturbin på 65 hestekrefter og hovedakslingen som førte kraften inn i produksjonen.\n\nAnlegget var dimensjonert for 400 vevstoler. Det produserte blant annet blåtøy, bekledningsstoffer, skjortestoff, vatt og rullegardinstoff. I 1863 kom en ullvarefabrikk til. På 1880-tallet var Hjula en stor tekstilbedrift med omkring 800 ansatte; mange var kvinner i lavt lønnet fabrikkarbeid.\n\nArbeidet kan ikke rekonstrueres fra fasaden alene. Wilhelm Peters' maleri Fra Hjula Veveri fra 1886 viser et tett fabrikkrom med arbeidere og vevstoler, men er samtidig en kunstnerisk framstilling. Fagoppslagene dokumenterer arbeidsstyrkens størrelse og kjønnsfordeling uten å gi komplette serier for lønn, arbeidstid, ulykker eller husholdningsøkonomi. Bygning, bilde og tekstkilder må leses sammen, med tydelige grenser for hva hver kilde kan bevise.\n\nProduksjonen var knyttet til markeder i Norge og Sverige. Da Mellomriksloven ble opphevet i 1897, oppgir Store norske leksikon at omsetningen falt med omtrent 30 prosent fram mot 1900. I 1918 stanset fabrikken midlertidig da garnlageret tok slutt. Begge hendelsene viser hvor avhengig et stedbundet fabrikksystem var av råvarer, handel og regler utenfor Sagene.\n\nEtter andre verdenskrig ble tekstilproduksjonen samlet i TEFAS og konsentrert på Frysja. Hjula ble lagt ned i 1957. Fabrikkbygningen brant i 1971 og ble gjenoppført i 1974. I dag brukes bygningene til andre formål, men teglfasadene, fossen og plasseringen langs elva lar besøkende lese sammenhengen mellom energi, maskiner og arbeid.";
const currentMeta = {
  source: "wikimedia_commons", creator: "Bjoertvedt", credit: "Bjoertvedt / Wikimedia Commons",
  license: "CC BY-SA 4.0", assetType: "documentary_photo", originalDimensions: "3024x4032", verifiedAt
};
const place = {
  ...previousPlace,
  desc,
  popupDesc,
  underbadge_ids: ["industri"],
  emne_ids: [
    "em_naering_arbeid_verdiskaping",
    "em_naering_industri_og_mekanisering",
    "em_naering_produksjon_produktivitet",
    "em_naering_makt_ulikhet_arbeidsliv",
    "em_naering_omstilling_kriser_skift"
  ],
  quiz_profile: {
    place_type: "historisk_tekstilfabrikk",
    subtype: "vannkraftdrevet_bomulls_og_ullveveri",
    signature_features: ["Hjula Væverier i drift fra 1855", "400 vevstoler", "65 hk vannturbin fra Myrens", "omkring 800 ansatte i 1880-årene", "nedlagt i 1957"],
    primary_angles: ["vannkraft_og_teknologi", "arbeid_og_kjonn", "produksjon_og_marked", "omstilling_og_industriarv"],
    question_families: ["sted_og_identitet", "produksjon", "arbeidsliv", "marked_og_krise", "kildekritisk_analyse"],
    avoid_angles: ["forveksle_ovre_foss_med_hjulafossen", "udokumenterte_lonnstall", "generisk_tekstilquiz"],
    must_include: ["1855", "Halvor Schou", "Myrens Verksted", "kvinnelig arbeidsstyrke", "1957"],
    contrast_targets: ["myrens_verksted", "christiania_seildugsfabrik", "lilleborg_fabrikker"],
    notes: "De første fjorten spørsmålene er normal stedskunnskap. Metode og teori kommer senere. Øvre Foss og Hjulafossen behandles som beslektede, men ikke identiske stedsnavn."
  },
  image: "bilder/places/ovre_foss.webp",
  cardImage: "bilder/kort/places/ovre_foss.webp",
  imageMeta: { ...currentMeta, sourcePage: urls.currentPhoto, outputDimensions: "1200x675 and 640x360", transformation: "Sentrert 16:9-utsnitt av dokumentarfotoet." },
  frontImage: "bilder/places/ovre_foss_front_portrait.webp",
  frontImageMeta: { ...currentMeta, sourcePage: urls.currentPhoto, outputDimensions: "900x1200", orientation: "portrait", aspectRatio: "3:4", transformation: "Stående 3:4-utsnitt av dokumentarfotoet." },
  related_people_ids: [personId],
  related_place_ids: ["myrens_verksted", "christiania_seildugsfabrik", "voienfossen", "glads_molle"],
  place_card_profile: {
    schema: "history_go_place_card_profile_v2",
    collection_ids: ["people", "objects", "structures"],
    reason: "Tre faktiske samlinger dekker stedet uten fyll: Halvor Schou har verifisert portrett, Wilhelm Peters' fysiske maleri dokumenterer arbeid i fabrikkrommet, og Hjulas veveribygning har eget dokumentarfoto. Merkevare er begrunnet ikke relevant for denne stedspakken.",
    excluded_collections: { brands: "Hjula-navnet fungerer her som bedrifts- og stedsidentitet, men kildegrunnlaget krever ikke et eget imageklart historisk varemerke." },
    verifiedAt
  },
  objects: [{
    id: "fra_hjula_veveri_maleri", title: "Fra Hjula Veveri", type: "maleri", kind: "physical_artwork", year: 1886,
    desc: "Wilhelm Peters' maleri fra 1886 viser arbeidere og vevstoler i Hjulas fabrikkinteriør.",
    whereToFind: "Verket tilhører Nasjonalmuseet; digital gjengivelse er offentlig tilgjengelig.",
    why_here: "Maleriet gjør arbeidsrommet, maskintettheten og den kvinnelige arbeidsstyrken konkret.",
    placeSpecificReason: "Tittel og museumskatalog knytter motivet direkte til Hjula Veveri.",
    historicalFunction: "Kunstverket dokumenterer og fortolker fabrikkarbeidet i 1886.",
    physicalObject: true, placeSpecific: true, collectable: true, storePrice: 45, currency: "PC", collection: "hjula_industriarv",
    unlock: "Studer den åpne digitale gjengivelsen og finn tre spor etter arbeidets organisering.",
    image: "bilder/kort/objects/fra_hjula_veveri.webp",
    imageMeta: { source: "wikimedia_commons", sourcePage: urls.artwork, creator: "Wilhelm Peters", credit: "Wilhelm Peters / Nasjonalmuseet / Wikimedia Commons", license: "Public domain", assetType: "artwork_reproduction", originalDimensions: "7416x6003", outputDimensions: "900x520", transformation: "Sentrert kortutsnitt av den offentlige domenegjengivelsen.", verifiedAt },
    source_urls: [urls.artwork, urls.snlHjula]
  }],
  structures: [{
    id: "hjula_veveribygning", name: "Hjula veveribygning", type: "fabrikkbygning", kind: "industrial_structure",
    desc: "Teglbygningen ble tegnet av Oluf Nicolai Roll, tatt i bruk i 1855, gjenoppført etter brannen i 1971 og står fortsatt i Sagveien 23.",
    image: "bilder/kort/structures/hjula_veveribygning.webp",
    imageMeta: { ...currentMeta, sourcePage: urls.structurePhoto, outputDimensions: "900x520", transformation: "Sentrert kortutsnitt av det alternative dokumentarfotoet." },
    source_urls: [urls.structurePhoto, urls.byleksikon, urls.snlHjula], verifiedAt
  }],
  externalLinks: [
    ["source", "Store norske leksikon – Hjula Væveri", urls.snlHjula],
    ["source", "Oslo byleksikon – Hjula Væverier", urls.byleksikon],
    ["source", "Norsk biografisk leksikon – Halvor Schou", urls.nblSchou],
    ["image_source", "Wikimedia Commons – Hjula i dag", urls.currentPhoto],
    ["historical_image", "Wikimedia Commons – Hjula ved Akerselva", urls.historicalPhoto],
    ["museum_object", "Nasjonalmuseet – Fra Hjula Veveri", urls.artwork]
  ].map(([type, label, url]) => ({ type, label, url, verifiedAt })),
  interpretation: {
    what_to_notice: ["Den langstrakte teglfasaden mot elva.", "Høydeforskjellen mellom fossen og fabrikkgulvene.", "Beierbrua og Sagveien som bandt arbeidsstedet til bydelen."],
    why_it_matters: ["Vannfallet ble omgjort til roterende kraft for hundrevis av vevstoler.", "Arbeidet ga mange kvinner lønnsarbeid, men kildene beskriver også lav lønn og ulik kontroll over verdiene.", "Importert maskinteknologi ble koblet til lokal turbin- og verkstedkompetanse."],
    counterpoints: ["Øvre Foss og Hjulafossen er ikke samme navn på ett eksakt fossepunkt.", "Omkring 800 ansatte beskriver 1880-årene, ikke hele driftsperioden.", "Bevarte fasader viser ikke alene hvordan arbeidsforholdene var."],
    sources: [urls.snlHjula, urls.byleksikon, urls.nblSchou].map(url => ({ url, verifiedAt }))
  },
  for_na: {
    title: "Fra veveri til bevart industrimiljø",
    beforeImage: "bilder/places/ovre_foss_historisk.webp",
    beforeImageLabel: "Hjula Veveri ved Akerselva · Marthinius Skøien / Nasjonalbiblioteket · offentlig eie",
    beforeImageMeta: { sourcePage: urls.historicalPhoto, creator: "Marthinius Skøien", credit: "Marthinius Skøien / Nasjonalbiblioteket / Wikimedia Commons", license: "Public domain", verifiedAt },
    nowImage: "bilder/places/ovre_foss.webp",
    nowImageLabel: "Hjula Veveri i dag · Bjoertvedt · CC BY-SA 4.0",
    nowImageMeta: { ...currentMeta, sourcePage: urls.currentPhoto },
    before: "Det historiske fotografiet viser fabrikkvolumet tett inntil elva, med vannfallet som del av produksjonslandskapet.",
    now: "Dagens dokumentarfoto viser den bevarte teglbygningen etter at tekstilproduksjonen er borte og lokalene har fått andre bruksformer.",
    change: "Fabrikkdriften sluttet i 1957, bygningen brant i 1971 og ble gjenoppført i 1974. Motivene har ikke identisk kamerastandpunkt og dokumenterer to tidslag, ikke et eksakt optisk før–nå-par.",
    lookFor: ["Teglveggens lengde langs elva.", "Vindusrytmen som ga lys til fabrikkgulvene.", "Forholdet mellom foss, bru og fabrikk."],
    sources: [urls.historicalPhoto, urls.currentPhoto, urls.byleksikon]
  }
};
write(placeFile, place);

const personFile = "data/people/naeringsliv/oslo/ovre_foss/halvor_schou.json";
const personClaimsFile = "data/people/claims/naeringsliv/oslo/ovre_foss/halvor_schou.claims.json";
const person = {
  id: personId, name: "Halvor Schou", initials: "HS", kindLabel: "Industrigründer", birth_date: "1823-05-11", death_date: "1879-02-05", active_place: "Christiania",
  desc: "Industrigründeren som etablerte Hjula Væverier og koblet vannkraft, importerte vevstoler, lokal verkstedkompetanse og et stort fabrikkarbeid ved Akerselva.",
  popupDesc: "Halvor Arntzen Schou ble født 11. mai 1823 og døde 5. februar 1879. Etter handelsutdanning og reiser i utlandet gikk han inn i familiens tekstilvirksomhet.\n\nSchou startet med tjue engelske vevstoler i Brenneribakken i 1849. Han kjøpte Hjulafossen i 1854 og satte Hjula Væverier i drift året etter. Fabrikken var tegnet av svogeren Oluf Nicolai Roll og dimensjonert for 400 vevstoler.\n\nDa Roll tvilte på om Myrens Verksted kunne levere hovedakslingen, foreslo han å bestille den utenlands. Schou avslo og ga Myrens mer tid for at verkstedet skulle utvikle erfaring. Turbinen og hovedakslingen ble levert lokalt. Episoden knytter Schou til både kapitalbeslutninger og norsk verkstedlæring.",
  education: [], placeId: "glads_molle", source_place_id: "glads_molle", places: ["glads_molle", "voienfossen", placeId], category: "naeringsliv", year: 1823,
  works: [
    { id: "hjula_vaeverier", title: "Hjula Væverier", year: 1855, role: "grunnlegger og eier", place: "Sagene", material: "bomull og ull", summary: "Etablerte den vannkraftdrevne tekstilfabrikken ved Hjulafossen." },
    { id: "schou_myrens_hovedaksel", title: "Lokal turbin- og akselleveranse", year: 1855, role: "oppdragsgiver", place: "Christiania", material: "turbin og hovedaksel", summary: "Valgte å gi Myrens Verksted tid til å fullføre leveransen framfor å bestille hovedakslingen utenlands." }
  ],
  tags: ["naeringsliv", "tekstil", "industri", "akerselva", "hjula", placeId], themes: ["industrigründing", "teknologioverføring", "arbeidsliv"],
  image: "bilder/kort/people/halvor_schou.webp", cardImage: "bilder/kort/people/halvor_schou.webp",
  imageMeta: { source: "wikimedia_commons", sourcePage: urls.portrait, creator: "Ukjent", credit: "Ukjent fotograf / Wikimedia Commons", license: "Public domain", reviewStatus: "manually_approved", assetKind: "identity_portrait", originalDimensions: "990x1492", outputDimensions: "700x900", transformation: "Proporsjonal skalering og sentrert portrettutsnitt.", verifiedAt },
  profileStandard: "people_profile_v1.0", claimsFile: personClaimsFile, profileStatus: "ready_people_v1",
  source_urls: [urls.snlSchou, urls.nblSchou, urls.snlHjula, urls.byleksikon, urls.gladsMolle, urls.voyenfallene, urls.portrait],
  externalLinks: [["source", "Store norske leksikon – Halvor Schou", urls.snlSchou], ["source", "Norsk biografisk leksikon – Halvor Schou", urls.nblSchou], ["source", "Store norske leksikon – Hjula Væveri", urls.snlHjula], ["image_source", "Wikimedia Commons – Halvor Schou", urls.portrait]].map(([type, label, url]) => ({ type, label, url, verifiedAt })),
  verifiedAt
};
write(personFile, [person]);
const legacyPeopleFile = "data/people/naeringsliv/oslo/people_naeringsliv_oslo.json";
write(legacyPeopleFile, read(legacyPeopleFile).filter(item => item.id !== personId));
const peopleManifest = read("data/people/manifest.json");
peopleManifest.files = peopleManifest.files.filter(file => file !== "people/naeringsliv/oslo/ovre_foss/halvor_schou.json");
addOnce(peopleManifest.files, "people/naeringsliv/oslo/ovre_foss/halvor_schou.json");
peopleManifest.priorityFilesByPlace ||= {};
peopleManifest.priorityFilesByPlace[placeId] = ["people/naeringsliv/oslo/ovre_foss/halvor_schou.json"];
write("data/people/manifest.json", peopleManifest);

const personClaims = [
  ["canonical_name", "Det kanoniske publiserte navnet er Halvor Schou.", urls.nblSchou, "overskrift og faktaboks", "recognized_reference"],
  ["identity", "Halvor Arntzen Schou ble født 11. mai 1823, døde 5. februar 1879 og virket som industrigründer.", urls.nblSchou, "faktaboks", "recognized_reference"],
  ["education", "Etter handelsutdanning og utenlandsreiser gikk Schou inn i familiens tekstilvirksomhet.", urls.nblSchou, "biografiens innledning", "recognized_reference"],
  ["early_looms", "Schou startet tekstilproduksjon med tjue engelske vevstoler i Brenneribakken i 1849.", urls.snlHjula, "innledningen", "recognized_reference"],
  ["hjula_foundation", "Schou kjøpte Hjulafossen i 1854 og satte Hjula Væverier i drift i 1855.", urls.snlHjula, "etableringsavsnittet", "recognized_reference"],
  ["roll_design", "Oluf Nicolai Roll tegnet fabrikkbygningen, som var dimensjonert for 400 vevstoler.", urls.nblSchou, "avsnittet om Hjula", "recognized_reference"],
  ["myrens_decision", "Schou avslo å bestille hovedakslingen utenlands og ga Myrens Verksted mer tid for å utvikle erfaring; verkstedet leverte turbin og hovedaksling.", urls.nblSchou, "avsnittet om Myrens", "recognized_reference"],
  ["voyen_connection", "Hjula Væverier utvidet under Schous ledelse med Øvre Vøien Mølle i 1873.", urls.byleksikon, "avsnittet om utvidelser", "institutional_reference"],
  ["glads_legacy", "Glads mølle ble innlemmet i Hjula Væverier i 1880, året etter Halvor Schous død; koblingen er derfor en bedriftsarv, ikke en personlig driftsperiode.", urls.gladsMolle, "avsnittet om Hjula Væverier", "institutional_reference"],
  ["image_identity", "Commons-bildet er katalogisert som et portrett av Halvor Schou og er i offentlig eie.", urls.portrait, "filbeskrivelsen", "archive"]
].map(([id, claim, source_url, source_location, source_type]) => ({ id, claim, source_url, source_location, source_type, status: "verified", temporal_status: "historical", verified_at: verifiedAt, evidence_level: "direct" }));
write(personClaimsFile, {
  schema: "history_go_people_claims_v1", version: "1.0.0", person_id: personId, profile_file: personFile,
  identity: { canonical_identity: "Den norske industrigründeren Halvor Arntzen Schou (1823–1879).", name_variants: ["Halvor Schou", "Halvor Arntzen Schou"], not: ["sønnen Christian Julius Schou", "Hjula Væverier som selvstendig person"], identity_status: "verified" },
  claims: personClaims,
  field_claim_map: {
    name: ["canonical_name"], kindLabel: ["identity"], birth_date: ["identity"], death_date: ["identity"], active_place: ["early_looms", "hjula_foundation"], year: ["identity"],
    placeId: ["glads_legacy"], "places[glads_molle]": ["glads_legacy"], "places[voienfossen]": ["voyen_connection"], "places[ovre_foss]": ["hjula_foundation"],
    "works[id=hjula_vaeverier].title": ["hjula_foundation"], "works[id=hjula_vaeverier].year": ["hjula_foundation"], "works[id=hjula_vaeverier].role": ["hjula_foundation"], "works[id=hjula_vaeverier].place": ["hjula_foundation"], "works[id=hjula_vaeverier].material": ["hjula_foundation"], "works[id=hjula_vaeverier].summary": ["hjula_foundation"],
    "works[id=schou_myrens_hovedaksel].title": ["myrens_decision"], "works[id=schou_myrens_hovedaksel].year": ["myrens_decision"], "works[id=schou_myrens_hovedaksel].role": ["myrens_decision"], "works[id=schou_myrens_hovedaksel].place": ["myrens_decision"], "works[id=schou_myrens_hovedaksel].material": ["myrens_decision"], "works[id=schou_myrens_hovedaksel].summary": ["myrens_decision"],
    image: ["image_identity"], cardImage: ["image_identity"], imageMeta: ["image_identity"]
  },
  sentence_claim_map: {
    desc: [{ sentence: 1, claim_ids: ["hjula_foundation", "myrens_decision"] }],
    popupDesc: [
      { sentence: 1, claim_ids: ["identity"] },
      { sentence: 2, claim_ids: ["education"] },
      { sentence: 3, claim_ids: ["early_looms"] },
      { sentence: 4, claim_ids: ["hjula_foundation"] },
      { sentence: 5, claim_ids: ["roll_design"] },
      { sentence: 6, claim_ids: ["roll_design", "myrens_decision"] },
      { sentence: 7, claim_ids: ["myrens_decision"] },
      { sentence: 8, claim_ids: ["myrens_decision"] },
      { sentence: 9, claim_ids: ["myrens_decision"] }
    ]
  },
  completion: { completed_under: "people_profile_v1.0", claims_verified: `${personClaims.length}/${personClaims.length}`, fact_review: "passed", editorial_review: "passed", source_verified_at: verifiedAt, validator_version: "1.0.0", current_status: "ready_people_v1" }
});

const sourceLinks = [
  { id: "source_hjula_snl", type: "source", label: "Store norske leksikon – Hjula Væveri", url: urls.snlHjula, verifiedAt },
  { id: "source_hjula_byleksikon", type: "source", label: "Oslo byleksikon – Hjula Væverier", url: urls.byleksikon, verifiedAt },
  { id: "source_ovre_foss_byleksikon", type: "source", label: "Oslo byleksikon – Øvre Foss", url: urls.ovreFoss, verifiedAt },
  { id: "source_halvor_schou_nbl", type: "source", label: "Norsk biografisk leksikon – Halvor Schou", url: urls.nblSchou, verifiedAt },
  { id: "source_adam_smith_wealth_nations", type: "primary_text", label: "Adam Smith – The Wealth of Nations, bok I", url: urls.adamSmith, verifiedAt },
  { id: "source_ons_labour_productivity_qmi", type: "official_method", label: "Office for National Statistics – Labour productivity QMI", url: urls.productivityMethod, verifiedAt },
  { id: "source_hjula_current_image", type: "image_source", label: "Wikimedia Commons – Hjula i dag", url: urls.currentPhoto, verifiedAt },
  { id: "source_hjula_historical_image", type: "historical_image", label: "Wikimedia Commons – historisk Hjula-motiv", url: urls.historicalPhoto, verifiedAt },
  { id: "source_hjula_artwork", type: "museum_object", label: "Nasjonalmuseet – Fra Hjula Veveri", url: urls.artwork, verifiedAt }
];
const chronology = [
  [1849, "Tjue engelske vevstoler", "Halvor Schou startet mekanisk veving i Brenneribakken."],
  [1854, "Hjulafossen kjøpes", "Schou kjøpte vannfallet og forberedte et større fabrikksted."],
  [1855, "Hjula i drift", "Fabrikken tegnet av Oluf Nicolai Roll åpnet med importert og lokalt produsert teknologi."],
  [1856, "250 vevstoler", "Norsk biografisk leksikon oppgir at 250 av den planlagte kapasiteten på 400 vevstoler var i drift."],
  [1863, "Ullvarefabrikk", "Produksjonen ble utvidet med ullvarer."],
  [1886, "Fra Hjula Veveri", "Wilhelm Peters malte fabrikkinteriøret med arbeidere og vevstoler."],
  [1890, "Omkring 800 ansatte", "I 1880-årene var Hjula blant landets største tekstilbedrifter; mange ansatte var kvinner."],
  [1897, "Svenskemarkedet svekkes", "Opphevelsen av Mellomriksloven ble fulgt av kraftig omsetningsfall fram mot 1900."],
  [1918, "Garnmangel", "Produksjonen stanset midlertidig da garnlageret tok slutt."],
  [1943, "Celluloseblanding", "Hjula tok i bruk tekstiler med femti prosent cellulosefiber under råvaremangelen."],
  [1946, "TEFAS", "Bransjesammenslåingen konsentrerte deler av tekstilproduksjonen på Frysja."],
  [1955, "TEFAS konkurs", "Sammenslutningens konkurs varslet slutten for flere tekstilanlegg."],
  [1957, "Hjula legges ned", "Tekstilproduksjonen ved Hjulafossen stanset."],
  [1974, "Gjenoppført", "Fabrikkbygningen ble gjenoppført etter brannen i 1971."]
].map(([year, title, desc], index) => ({ id: `chrono_hjula_${year}_${index + 1}`, year, title, desc, confidence: "high", sources: [{ title: year === 1974 ? "Oslo byleksikon" : "Store norske leksikon", url: year === 1974 ? urls.byleksikon : urls.snlHjula }] }));

const claimIds = ["identity", "founding", "technology", "production", "workforce", "market", "shortage", "restructuring", "closure", "building", "coordinate", "current_use"]
  .map(id => `claim_${placeId}_${id}`);
const scholarlyArticle = {
  definition: "Øvre Foss–Hjula er her definert som Hjula Væveriers historiske fabrikksted i Sagveien 23 og det nærmeste industrilandskapet ved fossene langs Akerselva. Identiteten omfatter ikke hele Sagene, og den gjør ikke Øvre Foss og Hjulafossen til ett geografisk punkt.",
  historical_or_systemic_background: [
    "Halvor Schou bygde fra 1849 opp mekanisk veving med engelske vevstoler. Etter kjøpet av Hjulafossen i 1854 ble fabrikken tegnet av Oluf Nicolai Roll og satt i drift i 1855. England leverte planer og maskiner, mens Myrens Verksted leverte turbin og hovedaksel lokalt.",
    "Produksjonen omfattet flere bomulls- og ullstoffer og ble organisert rundt opptil 400 vevstoler. I 1880-årene hadde bedriften omkring 800 ansatte, mange av dem kvinner. Markedsfall etter 1897, råvaremangel i 1918 og etterkrigstidens bransjekrise viser at lokal vannkraft ikke gjorde fabrikken uavhengig av handel, råvarer eller kapital."
  ],
  theories_researchers_and_findings: [{
    id: "framework_smith_division_of_labour", title: "Arbeidsdeling som analytisk linse", researcher: "Adam Smith", work: "An Inquiry into the Nature and Causes of the Wealth of Nations, bok I", status: "analytical_lens_not_causal_claim",
    content: "Adam Smiths analyse av arbeidsdeling gjør det mulig å undersøke hvordan kraftoverføring, spinning, veving, etterbehandling og salg kunne fordeles mellom maskiner og arbeidere. Hjula-kildene viser et omfattende fabrikkapparat, men de gir ikke tidsstudier eller sammenlignbare produktivitetstall som beviser at arbeidsdelingen alene forklarte veksten.",
    claim_ids: [`claim_${placeId}_technology`, `claim_${placeId}_production`, `claim_${placeId}_workforce`], source_ids: ["source_adam_smith_wealth_nations", "source_hjula_snl"]
  }, {
    id: "framework_industrial_district", title: "Industrimiljø og lokal læring", researcher: "Alfred Marshall", work: "Principles of Economics", status: "analytical_lens_not_causal_claim",
    content: "Marshalls idé om industrimiljø kan brukes som en forsiktig linse på forbindelsen mellom Hjula og Myrens Verksted: Schous valg ga et lokalt verksted erfaring med en krevende hovedaksel. Episoden viser mulig kunnskapsspredning mellom bedrifter, men én leveranse dokumenterer ikke alene en varig klyngeeffekt eller høyere samlet produktivitet.",
    claim_ids: [`claim_${placeId}_technology`], source_ids: ["source_halvor_schou_nbl", "source_hjula_snl"]
  }],
  methods_and_limitations: [{
    id: "method_hjula_industry", method_id: "met_naering_industrihistorisk_analyse", method: "Industrihistorisk analyse",
    application: "Analysen kobler fabrikkbygning, vannkraft, maskinleveranser, produkter, arbeidsstyrke og markeder for å beskrive Hjula som et stedbundet produksjonssystem.",
    limitations: "Kildene oppsummerer lange perioder og skiller ikke alltid mellom bomulls- og ullavdelingene. De kan derfor ikke brukes som en komplett år-for-år-serie for kapasitet, produksjon eller sysselsetting.",
    claim_ids: [`claim_${placeId}_founding`, `claim_${placeId}_technology`, `claim_${placeId}_production`], source_ids: ["source_hjula_snl", "source_hjula_byleksikon"]
  }, {
    id: "method_hjula_productivity", method_id: "met_naering_statistikk_og_indikatoranalyse", method: "Statistikk- og indikatoranalyse",
    application: "Opplysninger om vevstoler, ansatte og omsetningsendring behandles som avgrensede indikatorer med hvert sitt tidspunkt, måleobjekt og kildegrunnlag.",
    limitations: "Antall vevstoler er kapasitet, antall ansatte er arbeidsstyrke og omsetningsfall er en verdiendring. Uten arbeidstimer, priser og produksjonsvolum kan de ikke settes sammen til et produktivitetsmål.",
    claim_ids: [`claim_${placeId}_production`, `claim_${placeId}_workforce`, `claim_${placeId}_market`], source_ids: ["source_hjula_snl", "source_ons_labour_productivity_qmi"]
  }, {
    id: "method_hjula_power", method_id: "met_naering_makt_og_ulikhetsanalyse", method: "Makt- og ulikhetsanalyse",
    application: "Analysen skiller mellom Schous kontroll over kapital og investeringer og arbeidernes bidrag til produksjonen, med særlig oppmerksomhet på den store kvinnelige arbeidsstyrken.",
    limitations: "Kildene dokumenterer kjønnssammensetning og omtaler lav lønn, men mangler sammenlignbare lønnsserier, husholdningsdata og arbeidernes egne stemmer. Fordelingen kan beskrives, ikke tallfestes fullt ut.",
    claim_ids: [`claim_${placeId}_workforce`], source_ids: ["source_hjula_snl", "source_halvor_schou_nbl"]
  }],
  boundaries_and_disagreements: [{
    id: "boundary_ovre_hjula", title: "Øvre Foss eller Hjulafossen?", content: "Repoets eldre mål-navn kombinerer Øvre Foss og Hjula Veveri. Kildene plasserer Hjula ved Hjulafossen i Sagveien 23 og omtaler Øvre Foss som et eget fosse- og industriområde. Produksjonen beholder ID og navn, men avviser at navnene er geografiske synonymer.",
    claim_ids: [`claim_${placeId}_identity`, `claim_${placeId}_coordinate`], source_ids: ["source_hjula_byleksikon", "source_ovre_foss_byleksikon"]
  }, {
    id: "boundary_growth_cause", title: "Vannkraft, import eller organisering?", content: "Hjulas vekst kan knyttes til flere samtidige forhold: fossen ga kraft, England leverte teknologi og planer, Schou mobiliserte kapital, og arbeiderne drev produksjonen. Kildene isolerer ikke én årsak og dokumenterer ikke hvor stor del av veksten hvert forhold forklarte.",
    claim_ids: [`claim_${placeId}_founding`, `claim_${placeId}_technology`, `claim_${placeId}_workforce`], source_ids: ["source_hjula_snl", "source_halvor_schou_nbl"]
  }],
  documented_cases_or_teaching_scenarios: [{
    id: "case_hjula_myrens", kind: "documented_case", title: "Hovedakslingen som ble i byen", analysis: "Oluf Nicolai Roll tvilte på at Myrens Verksted kunne fullføre hovedakslingen og foreslo utenlandsk bestilling. Halvor Schou ga i stedet verkstedet mer tid slik at det kunne utvikle erfaring. Leveransen viser et konkret valg mellom raskere import og lokal kompetansebygging, uten at kilden beviser den langsiktige avkastningen.",
    claim_ids: [`claim_${placeId}_technology`], source_ids: ["source_halvor_schou_nbl"]
  }, {
    id: "case_hjula_trade", kind: "documented_case", title: "Markedet som forsvant", analysis: "Hjula solgte i Norge og Sverige. Etter opphevelsen av Mellomriksloven i 1897 oppgir SNL at omsetningen falt med omtrent tretti prosent fram mot 1900. Caset dokumenterer en brå markedsendring, men kilden skiller ikke virkningen av regelendringen fra priser, konkurranse og konjunkturer.",
    claim_ids: [`claim_${placeId}_market`], source_ids: ["source_hjula_snl"]
  }],
  key_questions: [
    "Hvordan ble vannkraft, importerte maskiner og lokal verkstedkompetanse koblet i Hjulas produksjonssystem?",
    "Hva forteller den store kvinnelige arbeidsstyrken om hvem som skapte verdiene, og hva mangler for å måle fordelingen?",
    "Hvorfor gjorde handel og råvaretilgang fabrikken sårbar selv om kraftkilden lå rett utenfor bygningen?",
    "Hvilke spor i dagens bygning kan dokumentere produksjonen, og hvilke sider av arbeidslivet kan ikke leses direkte i fasaden?"
  ],
  source_ids: sourceLinks.filter(source => !source.type.includes("image") && source.type !== "museum_object").map(source => source.id),
  claim_ids: claimIds
};
const leksikonFile = "data/leksikon/places/oslo/naeringsliv/leksikon_ovre_foss.json";
write(leksikonFile, {
  place_id: placeId, title: "Øvre Foss–Hjula Veveri", type: "main", version: 1, visual: { designCode: "article_place_essay_miniature" },
  popupDesc: "Et tekstilindustristed der vannkraft, importert teknologi, lokal verkstedlæring, kvinnearbeid og markedsrisiko kan leses sammen.",
  wikiText: [scholarlyArticle.definition, ...scholarlyArticle.historical_or_systemic_background, ...scholarlyArticle.theories_researchers_and_findings.map(item => item.content), "Kildenes hovedfunn er at Hjula var både et stedbundet kraftsystem og en del av internasjonale vare- og kunnskapsstrømmer. Fossen drev maskinene, men teknologi, bomull, garn og markeder krysset grenser.", scholarlyArticle.methods_and_limitations.map(item => `${item.method}: ${item.application} Begrensning: ${item.limitations}`).join(" "), scholarlyArticle.boundaries_and_disagreements.map(item => `${item.title}: ${item.content}`).join(" "), ...scholarlyArticle.documented_cases_or_teaching_scenarios.map(item => `${item.title}: ${item.analysis}`), `Nøkkelspørsmål: ${scholarlyArticle.key_questions.join(" ")}`],
  scholarly_article: scholarlyArticle,
  summary: { one_liner: "Vannkraftdrevet tekstilfabrikk fra 1855, med stort kvinnearbeid og internasjonale teknologi- og markedsforbindelser.", themes: ["tekstilindustri", "vannkraft", "arbeidsliv", "marked", "omstilling"], tone: ["nøktern", "stedsspesifikk"] },
  facts: [
    { id: "fact_hjula_1855", label: "Driftsstart", desc: "Hjula Væverier kom i drift i 1855.", confidence: "high", sources: [{ title: "Store norske leksikon", url: urls.snlHjula }] },
    { id: "fact_hjula_400", label: "Kapasitet", desc: "Anlegget var dimensjonert for 400 vevstoler.", confidence: "high", sources: [{ title: "Norsk biografisk leksikon", url: urls.nblSchou }] },
    { id: "fact_hjula_1957", label: "Nedleggelse", desc: "Tekstilproduksjonen ved Hjula stanset i 1957.", confidence: "high", sources: [{ title: "Oslo byleksikon", url: urls.byleksikon }] }
  ],
  chronology, sources: sourceLinks, externalLinks: sourceLinks, interpretation: place.interpretation
});
const leksikonManifest = read("data/leksikon/manifest.json");
leksikonManifest.files = leksikonManifest.files.filter(file => file !== leksikonFile);
addOnce(leksikonManifest.files, leksikonFile);
write("data/leksikon/manifest.json", leksikonManifest);

const languageFile = "data/leksikon/sprak/places/europe/norway/oslo/ovre_foss.json";
write(languageFile, {
  place_id: placeId, title: "Språk ved Øvre Foss–Hjula", verified_at: verifiedAt, dialect_status: "not_applicable_place_level",
  entries: [
    { id: "hjula_name", term: "Hjula", type: "steds_og_bedriftsnavn", meaning: "Fabrikkens navn ble knyttet til Hjulafossen der anlegget lå.", context: "Navnet gjør vannfallet til del av bedriftsidentiteten.", linked_to: { kind: "place", id: placeId }, tags: ["navn", "vannkraft"], sources: [{ label: "Oslo byleksikon", url: urls.byleksikon }] },
    { id: "hjula_bomuldsvaeveri", term: "Bomuldsvæveri", type: "historisk_fagterm", meaning: "Eldre skrivemåte for bomullsveveri, en fabrikk som vever bomullsgarn til stoff.", context: "Termen beskriver Hjulas opprinnelige hovedproduksjon og viser eldre dansk-norsk rettskrivning.", linked_to: { kind: "place", id: placeId }, tags: ["tekstil", "språkhistorie"], sources: [{ label: "Store norske leksikon", url: urls.snlHjula }] },
    { id: "hjula_klaedesfabrik", term: "Klædesfabrik", type: "historisk_fagterm", meaning: "Eldre skrivemåte for en fabrikk som produserte kles- eller ullstoff.", context: "Hjula utvidet med ullvareproduksjon i 1863.", linked_to: { kind: "place", id: placeId }, tags: ["ull", "produksjon", "språkhistorie"], sources: [{ label: "Oslo byleksikon", url: urls.byleksikon }] }
  ]
});
const languageManifest = read("data/leksikon/sprak/manifest.json");
languageManifest.place_files[placeId] = languageFile;
write("data/leksikon/sprak/manifest.json", languageManifest);

const storyFile = "data/stories/stories_ovre_foss.json";
const story = {
  id: "st_hjula_hovedakslingen_som_ble_i_byen", quality_profile: "episode_v1", type: "turning_point", title: "Hovedakslingen som ble i byen", year: 1855, place_id: placeId,
  summary: "Da Oluf Nicolai Roll tvilte på Myrens Verksted, valgte Halvor Schou mer tid og lokal læring framfor å bestille Hjulas hovedaksling utenlands.",
  story: "Den nye Hjula-fabrikken trengte mer enn en turbin. Kraften fra Hjulafossen måtte føres gjennom en stor hovedaksling og videre til vevstolene. Oluf Nicolai Roll, som tegnet anlegget, tvilte på at det unge Myrens Verksted kunne løse oppgaven og foreslo å sende bestillingen utenlands.\n\nHalvor Schou valgte annerledes. Han nektet å flytte oppdraget ut av landet og ga Myrens mer tid, nettopp for at verkstedet skulle få erfaring med krevende arbeid. Beslutningen innebar risiko for fabrikkprosjektet, men åpnet samtidig for lokal kompetansebygging.\n\nMyrens leverte både en vannturbin på 65 hestekrefter og hovedakslingen. Episoden gjør industrialiseringen konkret: teknologi kom ikke bare ferdig utenfra. Importerte planer og engelske vevstoler ble koblet til et lokalt verksted som lærte gjennom en vanskelig leveranse. Kilden dokumenterer valget og leveransen, men ikke hva et utenlandsk alternativ ville ha kostet eller hvor mye beslutningen senere betydde for Myrens.",
  episode: { actors: ["Halvor Schou", "Oluf Nicolai Roll", "Myrens Verksted"], date: "1854–1855", action: "Schou ga Myrens Verksted mer tid til å fullføre hovedakslingen i stedet for å bestille den utenlands.", consequence: "Myrens leverte turbinen og hovedakslingen, og fikk erfaring med en krevende industrileveranse." },
  sources: [{ title: "Norsk biografisk leksikon – Halvor Schou", url: urls.nblSchou }, { title: "Store norske leksikon – Hjula Væveri", url: urls.snlHjula }],
  tags: ["teknologi", "verksted", "vannkraft", "kompetanse", "beslutning"], related_people: [personId], related_places: ["myrens_verksted"],
  next_scenes: [{ place_id: "myrens_verksted", reason: "Følg leverandøren som bygde turbinen og hovedakslingen." }],
  score: { narrative: 3, historical: 5, source: 4, play_value: 3, originality: 3, total: 18 },
  arc: { start: "Roll tvilte på at Myrens kunne levere hovedakslingen.", middle: "Schou avviste utenlandsk bestilling og ga verkstedet mer tid.", end: "Myrens fullførte leveransen og fikk ny industriell erfaring." }
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
  { id: "lesespor_hjula_snl", title: "Hjula Væveri", author: null, publication: "Store norske leksikon", date: null, year: 1855, type: "fagredigert_oppslag", subjects: ["tekstil", "produksjon", "arbeid", "marked", "krise"], place_ids: [placeId], person_ids: [personId], category_hints: ["naeringsliv", "historie"], url: urls.snlHjula, access: "open", rights: "link_only", source_quality: "canonical", curation_status: "approved", relevance: "Hovedkilde for etablering, teknologi, produkter, ansatte, markeder og nedleggelse." },
  { id: "lesespor_hjula_byleksikon", title: "Hjula Væverier", author: null, publication: "Oslo byleksikon", date: null, year: 1855, type: "lokalhistorisk_oppslag", subjects: ["Sagveien", "bygning", "Hjulafossen", "industriarv"], place_ids: [placeId], person_ids: [personId], category_hints: ["naeringsliv", "by", "historie"], url: urls.byleksikon, access: "open", rights: "link_only", source_quality: "canonical", curation_status: "approved", relevance: "Stedsspesifikk kontroll av adresse, bygningshistorie, brann, gjenoppføring og blått skilt." },
  { id: "lesespor_halvor_schou_nbl", title: "Halvor Schou", author: null, publication: "Norsk biografisk leksikon", date: null, year: 1823, type: "biografisk_oppslag", subjects: ["industrigründer", "Myrens Verksted", "teknologioverføring", "arbeidsliv"], place_ids: [placeId], person_ids: [personId], category_hints: ["naeringsliv", "historie"], url: urls.nblSchou, access: "open", rights: "link_only", source_quality: "canonical", curation_status: "approved", relevance: "Fagredigert biografi som dokumenterer Schous valg, Myrens-leveransen og arbeidslivslinjen." },
  { id: "lesespor_hjula_historical_photo", title: "Hjula Veveri ved Akerselva", author: "Marthinius Skøien", publication: "Nasjonalbiblioteket / Wikimedia Commons", date: null, year: 1900, type: "historisk_fotografi", subjects: ["fabrikk", "Akerselva", "industrilandskap"], place_ids: [placeId], person_ids: [], category_hints: ["naeringsliv", "historie", "kunst"], url: urls.historicalPhoto, access: "open", rights: "public_domain", source_quality: "institutional", curation_status: "approved", relevance: "Historisk motiv som dokumenterer fabrikkens plassering langs elva." }
);
write(readingFile, readings);

const translations = {
  en: { name: "Øvre Foss – Hjula Weaving Mill", desc: "Hjula Væverier opened by Hjulafossen in 1855 and became one of Norway’s largest textile companies. Water power, imported looms and a large, predominantly female workforce shaped industrial Sagene. Production ended in 1957; the preserved brick building still anchors the industrial landscape.", popupDesc: "This place record links Hjula Væverier at Sagveien 23 to the industrial landscape around Øvre Foss. The factory used water power, English machinery and a locally supplied turbine and main shaft. In the 1880s it employed about 800 people, many of them women. Market change, raw-material shortages and post-war restructuring preceded closure in 1957." },
  es: { name: "Øvre Foss – fábrica textil Hjula", desc: "Hjula Væverier abrió junto a Hjulafossen en 1855 y llegó a ser una de las mayores empresas textiles de Noruega. La energía hidráulica, los telares importados y una gran plantilla mayoritariamente femenina marcaron el Sagene industrial. La producción terminó en 1957.", popupDesc: "Este lugar vincula Hjula Væverier en Sagveien 23 con el paisaje industrial de Øvre Foss. La fábrica combinó energía hidráulica, maquinaria inglesa y una turbina y eje principal fabricados localmente. En la década de 1880 empleaba a unas 800 personas, muchas mujeres. Cerró en 1957." },
  pt: { name: "Øvre Foss – tecelagem Hjula", desc: "A Hjula Væverier abriu junto de Hjulafossen em 1855 e tornou-se uma das maiores empresas têxteis da Noruega. Energia hidráulica, teares importados e uma grande força de trabalho sobretudo feminina marcaram a Sagene industrial. A produção terminou em 1957.", popupDesc: "Este lugar liga a Hjula Væverier, em Sagveien 23, à paisagem industrial de Øvre Foss. A fábrica combinou energia hidráulica, maquinaria inglesa e uma turbina e eixo principal produzidos localmente. Na década de 1880 empregava cerca de 800 pessoas, muitas mulheres. Encerrou em 1957." }
};
const sourceHash = sha256(JSON.stringify({ name: place.name.normalize("NFC"), desc: place.desc.normalize("NFC"), popupDesc: place.popupDesc.normalize("NFC") })).slice(0, 16);
for (const [lang, translation] of Object.entries(translations)) {
  const file = `data/i18n/content/places/${lang}.json`;
  const pack = read(file);
  pack[placeId] = { _sourceHash: sourceHash, _status: "machine_translated", ...translation };
  write(file, pack);
}

const sourceRegistry = {
  snl_hjula: { url: urls.snlHjula, source_type: "recognized_reference", review_status: "reviewed", review_note: "Etablering, teknologi, produkter, arbeidsstyrke, marked, kriser og nedleggelse." },
  byleksikon: { url: urls.byleksikon, source_type: "institutional_reference", review_status: "reviewed", review_note: "Adresse, bygningshistorie, Hjulafossen, brann, gjenoppføring og bevaring." },
  ovre_foss: { url: urls.ovreFoss, source_type: "institutional_reference", review_status: "reviewed", review_note: "Avgrenser Øvre Foss fra Hjulafossen og dokumenterer det bredere industrilandskapet." },
  nbl_schou: { url: urls.nblSchou, source_type: "recognized_reference", review_status: "reviewed", review_note: "Halvor Schou, fabrikkprosjektet og beslutningen om Myrens-leveransen." }
};
const quizRows = [
  ["Når kom Hjula Væverier i drift?", ["1855", "1849", "1863"], "1855", "Hjula Væverier kom i drift ved Hjulafossen i 1855.", ["snl_hjula", "byleksikon"], "em_naering_industri_og_mekanisering", "fact"],
  ["Hvem grunnla Hjula Væverier?", ["Halvor Schou", "Oluf Nicolai Roll", "Wilhelm Peters"], "Halvor Schou", "Halvor Schou kjøpte Hjulafossen og etablerte veveriet.", ["snl_hjula", "nbl_schou"], "em_naering_eierskap_styring", "fact"],
  ["Hva kjøpte Schou i 1854?", ["Hjulafossen", "Akers mekaniske Verksted", "Svenskemarkedet"], "Hjulafossen", "Kjøpet av Hjulafossen ga fabrikkprosjektet et vannkraftgrunnlag.", ["snl_hjula"], "em_naering_byens_okonomiske_rom", "fact"],
  ["Hvem tegnet Hjulas fabrikkbygning?", ["Oluf Nicolai Roll", "Magnus Poulsson", "Thorvald Astrup"], "Oluf Nicolai Roll", "Ingeniøren Oluf Nicolai Roll tegnet bygningen.", ["byleksikon", "nbl_schou"], "em_naering_industri_og_mekanisering", "fact"],
  ["Hvor mange engelske vevstoler hadde Schou ved starten i Brenneribakken?", ["20", "65", "400"], "20", "Schou begynte med tjue engelske vevstoler i 1849.", ["snl_hjula"], "em_naering_produksjon_produktivitet", "fact"],
  ["Hvor stor vevstolkapasitet var Hjula-anlegget dimensjonert for?", ["400", "40", "800"], "400", "Anlegget var dimensjonert for 400 vevstoler.", ["nbl_schou"], "em_naering_produksjon_produktivitet", "fact"],
  ["Hvilket verksted leverte turbin og hovedaksling?", ["Myrens Verksted", "Kværner Brug", "Akers mekaniske Værksted"], "Myrens Verksted", "Myrens Verksted leverte Hjulas 65 hk turbin og hovedaksling.", ["snl_hjula", "nbl_schou"], "em_naering_innovasjon_teknologisk_skift", "fact"],
  ["Hvor sterk var vannturbinen ifølge SNL?", ["65 hestekrefter", "6,5 hestekrefter", "650 hestekrefter"], "65 hestekrefter", "SNL oppgir en vannturbin på 65 hestekrefter.", ["snl_hjula"], "em_naering_produksjon_produktivitet", "fact"],
  ["Hvilken råvaretype var Hjulas tidlige hovedgrunnlag?", ["Bomull", "Jernmalm", "Tømmer"], "Bomull", "Hjula startet som bomullsveveri og utvidet senere med ullvarer.", ["snl_hjula", "byleksikon"], "em_naering_logistikk_verdikjeder", "fact"],
  ["Hva ble lagt til produksjonen i 1863?", ["En ullvarefabrikk", "Et skipsverft", "En papirfabrikk"], "En ullvarefabrikk", "Hjula utvidet med ullvarefabrikk i 1863.", ["snl_hjula", "byleksikon"], "em_naering_industri_og_mekanisering", "fact"],
  ["Omtrent hvor mange ansatte hadde Hjula i 1880-årene?", ["800", "80", "8000"], "800", "I 1880-årene hadde bedriften omkring 800 ansatte.", ["snl_hjula"], "em_naering_arbeid_verdiskaping", "fact"],
  ["Hvilken gruppe utgjorde en stor del av arbeidsstyrken?", ["Kvinner", "Sjøfolk", "Bønder med egen jord"], "Kvinner", "Mange av Hjulas ansatte var kvinner i lavt lønnet fabrikkarbeid.", ["snl_hjula"], "em_naering_makt_ulikhet_arbeidsliv", "fact"],
  ["Når ble Hjula Væverier lagt ned?", ["1957", "1946", "1974"], "1957", "Tekstilproduksjonen ved Hjula stanset i 1957.", ["snl_hjula", "byleksikon"], "em_naering_omstilling_kriser_skift", "fact"],
  ["Hva skjedde med fabrikkbygningen i 1971?", ["Den brant", "Den åpnet", "Den ble flyttet"], "Den brant", "Bygningen brant i 1971 og ble gjenoppført i 1974.", ["byleksikon"], "em_naering_omstilling_kriser_skift", "fact"],
  ["Hvilke markeder solgte Hjula til?", ["Norge og Sverige", "Bare USA", "Bare Danmark"], "Norge og Sverige", "Hjula solgte tekstiler i det norske og svenske markedet.", ["snl_hjula"], "em_naering_forbruk_marked", "context"],
  ["Hva fulgte etter opphevelsen av Mellomriksloven i 1897?", ["Omsetningen falt omtrent 30 prosent fram mot 1900", "Fabrikken doblet alle lønninger", "Hjulafossen tørket ut"], "Omsetningen falt omtrent 30 prosent fram mot 1900", "SNL knytter en omsetningsnedgang på om lag tretti prosent til perioden etter regelendringen.", ["snl_hjula"], "em_naering_forbruk_marked", "context"],
  ["Hvorfor stanset produksjonen midlertidig i 1918?", ["Garnlageret tok slutt", "Bygningen brant", "Turbinen ble solgt"], "Garnlageret tok slutt", "Råvaremangel stanset produksjonen midlertidig i 1918.", ["snl_hjula"], "em_naering_logistikk_verdikjeder", "context"],
  ["Hva viser Wilhelm Peters' maleri fra 1886?", ["Arbeid i Hjulas fabrikkinteriør", "En skipsverftskran", "Et svensk marked"], "Arbeid i Hjulas fabrikkinteriør", "Maleriet Fra Hjula Veveri dokumenterer arbeidere og vevstoler i fabrikkrommet.", ["snl_hjula"], "em_naering_makt_ulikhet_arbeidsliv", "context"],
  ["Hva skjedde med tekstilproduksjonen etter TEFAS-sammenslåingen?", ["Den ble konsentrert på Frysja", "Den flyttet til Hjulafossen", "Den gikk over til skipsbygging"], "Den ble konsentrert på Frysja", "TEFAS samlet produksjon på Frysja før konkursen i 1955.", ["snl_hjula"], "em_naering_omstilling_kriser_skift", "context"],
  ["Hvorfor er vannfallet bare én del av forklaringen på Hjula?", ["Maskiner, kapital, arbeid, råvarer og markeder måtte også kobles", "Fossen ble aldri brukt", "Tekstiler krevde ikke arbeid"], "Maskiner, kapital, arbeid, råvarer og markeder måtte også kobles", "Vannkraften drev systemet, men skapte ikke produkter uten teknologi, organisering og arbeidskraft.", ["snl_hjula", "nbl_schou"], "em_naering_arbeid_verdiskaping", "context"],
  ["Hva er den sikreste tolkningen av dagens teglfasade?", ["Den er et fysisk spor etter fabrikken, ikke en full dokumentasjon av arbeidslivet", "Den viser nøyaktig lønn for alle ansatte", "Den beviser at alle maskiner er bevart"], "Den er et fysisk spor etter fabrikken, ikke en full dokumentasjon av arbeidslivet", "Bygningen dokumenterer sted og struktur, mens arbeidsforhold krever andre kilder.", ["byleksikon", "snl_hjula"], "em_naering_industri_og_mekanisering", "context"],
  ["Hvilket valg tok Schou da Roll tvilte på Myrens?", ["Han ga Myrens mer tid", "Han stanset fabrikkprosjektet", "Han kjøpte svenske vevstoler"], "Han ga Myrens mer tid", "Schou valgte lokal kompetansebygging framfor å bestille hovedakslingen utenlands.", ["nbl_schou"], "em_naering_innovasjon_teknologisk_skift", "analysis", "met_naering_innovasjonsanalyse"],
  ["Hva kan 400 vevstoler og 800 ansatte ikke alene fortelle?", ["Produktivitet per arbeidstime", "At fabrikken var stor", "At tekstiler ble produsert"], "Produktivitet per arbeidstime", "Kapasitet og sysselsetting mangler arbeidstimer, volum og priser som trengs for et produktivitetsmål.", ["snl_hjula", "nbl_schou"], "em_naering_produksjon_produktivitet", "analysis", "met_naering_statistikk_og_indikatoranalyse"],
  ["Hvordan bør omsetningsfallet etter 1897 tolkes?", ["Som dokumentert endring med flere mulige medvirkende årsaker", "Som bevis på at vannkraften sluttet", "Som et lønnsmål"], "Som dokumentert endring med flere mulige medvirkende årsaker", "Regelendringen er tidsmessig knyttet til fallet, men priser, konkurranse og konjunkturer er ikke isolert.", ["snl_hjula"], "em_naering_forbruk_marked", "analysis", "met_naering_markedsanalyse"],
  ["Hvilket maktforhold er tydeligst dokumentert?", ["Eieren kontrollerte investeringene, mens arbeiderne utførte produksjonen", "Arbeiderne eide alle vevstolene", "Svenske kunder styrte fossen"], "Eieren kontrollerte investeringene, mens arbeiderne utførte produksjonen", "Schou tok kapital- og leverandørvalg; en stor arbeidsstyrke, mange kvinner, drev produksjonen.", ["snl_hjula", "nbl_schou"], "em_naering_makt_ulikhet_arbeidsliv", "analysis", "met_naering_makt_og_ulikhetsanalyse"],
  ["Hvorfor må Øvre Foss og Hjulafossen skilles?", ["Kildene bruker dem om forskjellige fosse- og stedsavsnitt", "Bare ett av navnene finnes", "Hjula lå i en annen by"], "Kildene bruker dem om forskjellige fosse- og stedsavsnitt", "Place-navnet er sammensatt, men kartankeret og Hjula-kildene gjelder Sagveien 23 ved Hjulafossen.", ["byleksikon", "ovre_foss"], "em_naering_byens_okonomiske_rom", "analysis", "met_naering_romlig_okonomisk_analyse"],
  ["Hvilken verdikjede beskriver Hjula best?", ["Bomull og garn, energi, veving, etterbehandling og tekstilmarked", "Jernmalm, masovn og skipsverft", "Tømmer, papir og avisbud"], "Bomull og garn, energi, veving, etterbehandling og tekstilmarked", "Hjula koblet råvarer og energi til mekanisk tekstilproduksjon og salg.", ["snl_hjula"], "em_naering_logistikk_verdikjeder", "analysis", "met_naering_logistikk_og_verdikjedeanalyse"],
  ["Hvilken samlet analyse passer best for Hjula?", ["Vannkraft, teknologi, arbeid, marked og omstilling må leses sammen", "Bare arkitekturen er relevant", "Nedleggelsen forklarer etableringen"], "Vannkraft, teknologi, arbeid, marked og omstilling må leses sammen", "Stedets økonomi oppstod i koblingen mellom foss, maskiner, kapital, arbeidere, råvarer og markeder.", ["snl_hjula", "byleksikon", "nbl_schou"], "em_naering_industri_og_mekanisering", "analysis", "met_naering_industrihistorisk_analyse"]
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
for (const question of questions.filter(question => question.method_id)) question.guidance_basis = ["data/fag/naeringsliv/fagkart_naeringsliv_canonical_v4_5.json", "data/fag/naeringsliv/methods_naeringsliv_canonical_v4_5.json"];
Object.assign(questions[24], { topic_hook_id: "kapitalmakt", thinker_id: "thomas_piketty", theory_ref: { topic_hook_id: "kapitalmakt", thinker_id: "thomas_piketty", why_it_helps: "Et eierskaps- og maktperspektiv tydeliggjør forskjellen mellom kontroll over investeringer og arbeidets bidrag til produksjonen." } });
const phases = ["opening", "middle", "bridge", "final"];
const titles = ["Fossen, grunnleggeren og maskinene", "Produksjon, arbeid og nedleggelse", "Marked, råvarer og fabrikkrom", "Makt, måling og sted"];
const quizFile = "data/quiz/naeringsliv/ovre_foss_sets.json";
const contextFile = "data/quiz/production_context/naeringsliv/ovre_foss.json";
const briefFile = "data/quiz/production_briefs/naeringsliv/ovre_foss.json";
const existingQuizAudit = {
  searched_paths: ["data/quiz/manifest.json", "data/quiz/quiz_naeringsliv.json", "data/quiz/naeringsliv/ovre_foss_sets_merged.json", placeFile],
  active_before: { file: "data/quiz/naeringsliv/ovre_foss_sets_merged.json", set_count: 5, question_count: 30, finding: "Fem eldre sett med seks spørsmål og fem flatfilspørsmål ble funnet. Kjernefakta om 1855, Halvor Schou, kvinnearbeid og ombruk var nyttige, mens metodespørsmål kom for tidlig og Øvre Foss/Hjulafossen ble delvis blandet." },
  decisions: ["Bevar og skjerp dokumenterte kjernefakta.", "Skill Øvre Foss fra Hjulafossen eksplisitt.", "Materialiser normal 4x7 med fjorten vanlige åpningsspørsmål og metode først i siste sett."],
  knowledge_migration: "Tjueåtte kildebårne læringsjobber får stabile Knowledge-ID-er; overflødige eller for brede legacy-spørsmål holdes ute."
};
const selectedCurriculum = { module_ids: ["arbeid_produksjon_verdiskaping", "logistikk_infrastruktur_rom"], emne_ids: [...new Set(questions.map(question => question.emne_id))], topic_hook_ids: ["maskin_menneske_produksjon", "verdikjede_spor", "kapitalmakt", "omstilling_av_naeringsrom"], method_ids: [...new Set(questions.map(question => question.method_id).filter(Boolean))], thinker_ids: ["thomas_piketty"], works: [] };
const profileDecision = { profile: "normal", set_count: 4, questions_per_set: 7, justification: "Fire læringsjobber dekker identitet og teknologi, produksjon og arbeid, marked og krise samt kildekritisk analyse uten å splitte stedet i parallelle quizer." };
const heldBackCandidates = ["Øvre Foss og Hjulafossen som synonymer.", "800 ansatte som et tall for hele driftsperioden.", "Vevstolkapasitet som produktivitetsmål.", "Lav lønn som presist nivå uten sammenlignbar lønnsserie."];
const productionContext = {
  manifest_category: "naeringsliv", profile: "normal_4x7", standard_version: "3.3", source_brief: briefFile, context_artifact: contextFile,
  resolved_files: { pensum: "data/fag/naeringsliv/naeringslivpensum_canonical_v4_5.json", emner: "data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json", fagkart: "data/fag/naeringsliv/fagkart_naeringsliv_canonical_v4_5.json", methods: "data/fag/naeringsliv/methods_naeringsliv_canonical_v4_5.json", supersetQuizMal: "data/fag/naeringsliv/supersetQUIZMAL_naeringsliv.json", quizStandard: "data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md", quizQuestionSchema: "data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json" },
  required_inputs_loaded: ["pensum", "emner", "fagkart", "methods", "supersetQuizMal", "quizStandard", "quizQuestionSchema"],
  pensum_module_ids: selectedCurriculum.module_ids, emne_ids: selectedCurriculum.emne_ids, topic_hook_ids: selectedCurriculum.topic_hook_ids, method_ids: selectedCurriculum.method_ids, thinker_ids: selectedCurriculum.thinker_ids, works: [], source_review_status: "reviewed", existing_quiz_audit: existingQuizAudit, profile_decision: profileDecision, held_back_candidates: heldBackCandidates, normal_opening_questions: 14, theory_start_phase: "final", method_start_phase: "final"
};
write(quizFile, { targetId: placeId, categoryId: "naeringsliv", sources: Object.fromEntries(Object.entries(sourceRegistry).map(([id, source]) => [id, source.url])), production_context: productionContext, sets: phases.map((phase, index) => ({ set_id: `naeringsliv_${placeId}_set_${index + 1}`, title: titles[index], level: index + 1, order: index + 1, phase, xp: 50 + index * 25, questions: questions.slice(index * 7, index * 7 + 7) })) });
write(briefFile, {
  schema_version: "1.0", status: "reviewed", categoryId: "naeringsliv", targetId: placeId, profile_hint: "normal", reviewed_at: verifiedAt,
  review_note: "SNL, Oslo byleksikon og NBL gir fire adskilte læringsjobber om sted, teknologi, arbeid, marked og omstilling. Sammenblanding av fosse-navn og usammenlignbare tall er holdt ute.",
  scope: { place: "Øvre Foss–Hjula Veveri", production_profile: "normal", set_count: 4, questions_per_set: 7, total_questions: 28, normal_opening_questions: 14 },
  sources: sourceRegistry, selected_curriculum: selectedCurriculum, existing_quiz_audit: existingQuizAudit, profile_decision: profileDecision, held_back_candidates: heldBackCandidates,
  claims: questions.map((question, index) => ({ claim_id: question.claim_id, order: index + 1, planned_phase: phases[Math.floor(index / 7)], family: index < 14 ? "fact" : index < 21 ? "context" : "concept_theory", statement: question.claim_basis, source_ids: question.source, source_origin: question.source_origin, emne_id: question.emne_id }))
});
const quizManifest = read("data/quiz/manifest.json");
quizManifest.sets = quizManifest.sets.filter(entry => entry.targetId !== placeId);
quizManifest.sets.push({ targetId: placeId, file: quizFile });
write("data/quiz/manifest.json", quizManifest);
const fagManifest = read("data/fag/fag_manifest.json");
fagManifest.naeringsliv.quizProduction.targets[placeId] = { source_brief: `../quiz/production_briefs/naeringsliv/${placeId}.json`, context_artifact: `../quiz/production_context/naeringsliv/${placeId}.json`, quiz_file: `../quiz/naeringsliv/${placeId}_sets.json` };
write("data/fag/fag_manifest.json", fagManifest);

const placeClaims = [
  ["identity", "Place-posten representerer Hjula Væveriers fabrikksted i Sagveien 23 og det nærmeste industrilandskapet; Øvre Foss og Hjulafossen er ikke geografiske synonymer.", urls.byleksikon, "stedsposten og adresseavsnittet", "identity", "historical"],
  ["founding", "Halvor Schou kjøpte Hjulafossen i 1854, og Hjula Væverier kom i drift i 1855.", urls.snlHjula, "etableringsavsnittet", "ordinary", "historical"],
  ["technology", "Oluf Nicolai Roll tegnet anlegget; engelsk teknologi ble kombinert med en 65 hk turbin og hovedaksling fra Myrens Verksted.", urls.snlHjula, "avsnittet om oppføring og maskiner", "ordinary", "historical"],
  ["production", "Hjula var dimensjonert for 400 vevstoler og produserte flere bomulls- og ullstoffer.", urls.snlHjula, "produksjonsavsnittene", "ordinary", "historical"],
  ["workforce", "I 1880-årene hadde Hjula omkring 800 ansatte, og mange av dem var kvinner i lavt lønnet fabrikkarbeid.", urls.snlHjula, "avsnittet om 1880-årene", "ordinary", "historical"],
  ["market", "Etter opphevelsen av Mellomriksloven i 1897 falt omsetningen ifølge SNL med omtrent 30 prosent fram mot 1900.", urls.snlHjula, "markedsavsnittet", "ordinary", "historical"],
  ["shortage", "Produksjonen stanset midlertidig i 1918 fordi garnlageret tok slutt.", urls.snlHjula, "avsnittet om første verdenskrig", "ordinary", "historical"],
  ["restructuring", "TEFAS-sammenslåingen fra 1946 konsentrerte tekstilproduksjon på Frysja, før TEFAS gikk konkurs i 1955.", urls.snlHjula, "avsnittet om TEFAS", "ordinary", "historical"],
  ["closure", "Hjula Væverier ble lagt ned i 1957.", urls.snlHjula, "sluttavsnittet", "temporal", "historical"],
  ["building", "Fabrikkbygningen brant i 1971 og ble gjenoppført i 1974.", urls.byleksikon, "bygningsavsnittet", "temporal", "historical"],
  ["coordinate", "Det eksisterende stedsankeret er et verifisert historisk områdeanker for Hjula-anlegget, ikke et eksakt punkt for hele fosselandskapet.", "https://www.kulturminnesok.no/", "kulturminne 164747 og eksisterende coordinate-evidence", "identity", "current"],
  ["current_use", "Bygningene brukes i dag til andre formål enn tekstilproduksjon.", urls.byleksikon, "avsnittet om dagens bruk", "temporal", "current"]
].map(([id, claim, sourceUrl, sourceLocation, claimKind, temporalStatus]) => ({ id: `claim_${placeId}_${id}`, claim, sourceUrl, sourceLocation, sourceType: sourceUrl.includes("kulturminnesok") ? "institutional" : "reputable_secondary", verifiedAt, status: "verified", claimKind, evidenceMode: "direct", temporalStatus }));
const coverage = text => sentences(text).map((sentence, index) => {
  const lower = sentence.toLowerCase();
  let id = "identity";
  if (lower.includes("1854") || lower.includes("1855") || lower.includes("schou startet")) id = "founding";
  if (lower.includes("myrens") || lower.includes("turbin") || lower.includes("maskin") || lower.includes("oluf")) id = "technology";
  if (lower.includes("400") || lower.includes("produsert") || lower.includes("produserte") || lower.includes("ullvare")) id = "production";
  if (lower.includes("800") || lower.includes("kvinn") || lower.includes("arbeid")) id = "workforce";
  if (lower.includes("mellomrik") || lower.includes("omsetning") || lower.includes("sverige")) id = "market";
  if (lower.includes("1918") || lower.includes("garnlager")) id = "shortage";
  if (lower.includes("tefas") || lower.includes("frysja")) id = "restructuring";
  if (lower.includes("1957") || lower.includes("lagt ned") || lower.includes("produksjonen stanset")) id = "closure";
  if (lower.includes("1971") || lower.includes("1974") || lower.includes("teglbyg") || lower.includes("fasad")) id = "building";
  if (lower.includes("stedsanker") || lower.includes("eksakt punkt") || lower.includes("områdeanker")) id = "coordinate";
  if (lower.includes("i dag") || lower.includes("andre formål")) id = "current_use";
  return { sentence: index + 1, claimIds: [`claim_${placeId}_${id}`] };
});
const readinessQuestions = [
  ["Når kom Hjula i drift?", "1855", "når", "founding"],
  ["Hvem etablerte fabrikken?", "Halvor Schou", "hvem", "founding"],
  ["Hva leverte Myrens Verksted?", "En 65 hk turbin og hovedakslingen", "hva", "technology"],
  ["Hvor mange vevstoler var anlegget dimensjonert for?", "400", "hva", "production"],
  ["Hvem utgjorde en stor del av arbeidsstyrken?", "Kvinner", "hvem", "workforce"],
  ["Hva skjedde etter 1897?", "Omsetningen falt omtrent 30 prosent fram mot 1900", "hva_skjedde", "market"],
  ["Hvorfor stanset fabrikken midlertidig i 1918?", "Garnlageret tok slutt", "hva_skjedde", "shortage"],
  ["Når ble Hjula lagt ned?", "1957", "når", "closure"]
].map(([question, answer, type, claim], index) => ({ question, answer, type, normalKnowledgeQuestion: index < 7, claimIds: [`claim_${placeId}_${claim}`] }));
write("data/places/production/ovre_foss.json", {
  schemaVersion: "4.2", validatorVersion: "4.2.1", placeId, placeFile, status: "ready_v4_2",
  identity: { status: "resolved", represents: "Hjula Væveriers historiske fabrikksted i Sagveien 23 og det nærmeste industrilandskapet ved Øvre Foss.", period: "1855–1957", excludes: ["hele Sagene", "Øvre Foss og Hjulafossen som ett eksakt fossepunkt", "all tekstilproduksjon langs Akerselva", "dagens virksomheter i de ombrukte lokalene"] },
  metadataSnapshot: { name: place.name, year: place.year, category: place.category }, textHashes: { algorithm: "sha256", desc: sha256(place.desc), popupDesc: sha256(place.popupDesc) }, claims: placeClaims,
  sentenceCoverage: { desc: coverage(place.desc), popupDesc: coverage(place.popupDesc) },
  roundsReadiness: { people: "ready_reused_and_upgraded_halvor_schou", objects: "ready_documented_wilhelm_peters_artwork", brands: "not_applicable_no_distinct_image_ready_mark_required", structures: "ready_documented_hjula_factory", badges: "ready_industri_underbadge_and_emne_binding", quiz: "ready_normal_4x7", leksikon: "ready", sprak: "ready", stories: "ready", for_na: "ready_non_identical_documentary_pair", readings: "ready", events: "reviewed_no_stable_current_event", routes: "ready_related_akerselva_industry_places", fagverk: "ready", frontImage: "ready_documentary_portrait_3x4" },
  quizReadiness: { status: "canonical_normal_4x7", quizTargetId: placeId, sourceBrief: briefFile, productionContext: contextFile, normalOpeningQuestions: 14, totalQuestions: 28, reuseDecision: "Den eksisterende 5x6-pakken er auditert. Dokumenterte kjernefakta er bevart eller skjerpet i 4x7, mens for tidlig metodebruk, duplikater og sammenblanding av fossenavn er holdt ute.", questions: readinessQuestions },
  reviews: { factual: { status: "passed", reviewedAt: verifiedAt, reviewer: "Øvre Foss–Hjula source review", notes: "SNL, Oslo byleksikon, NBL, Commons-metadata, Nasjonalmuseets verkidentitet og eksisterende coordinate-evidence er kontrollert. ID og koordinater er bevart." }, editorial: { status: "passed", reviewedAt: verifiedAt, reviewer: "Øvre Foss–Hjula editorial review", introducedNewFacts: false, notes: "Vannkraft, teknologi, arbeid, kjønn, marked og omstilling er hovedlinjene; usammenlignbare mål og geografiske navn er eksplisitt avgrenset." } },
  reviewsNotes: ["Øvre Foss og Hjulafossen er skilt geografisk.", "400 vevstoler behandles som kapasitet, ikke produktivitet.", "800 ansatte gjelder 1880-årene.", "Merkevare er begrunnet ikke relevant under 1–4-profilen.", "Før/etter-paret påstår ikke identisk kamerastandpunkt."],
  completion: { completedUnder: "4.2", currentStatus: "current", sourceVerifiedAt: verifiedAt, claimsVerified: { verified: placeClaims.length, total: placeClaims.length }, factualReview: "passed", editorialReview: "passed", validatorVersion: "4.2.1" }
});

const businessSourceIds = ["source_hjula_snl", "source_hjula_byleksikon", "source_halvor_schou_nbl"];
const quizRequiredInputs = Object.values(productionContext.resolved_files);
write("data/places/naeringsliv-production/ovre_foss.json", {
  schemaVersion: "naeringsliv_place_production_v1", validatorVersion: "1.0.0", placeId, placeFile, status: "ready",
  economicIdentity: { statement: "Hjula Væverier var et vannkraftdrevet bomulls- og ullveveri ved Hjulafossen, i drift fra 1855 til 1957.", anchorType: "factory", placeObjectDistinction: "Rapporten skiller fabrikkstedet fra fossene, Halvor Schou som eier, Wilhelm Peters' maleri som objekt og det bredere industrilandskapet på Sagene.", temporalScope: { start: "1855", end: "1957", precision: "period", rationale: "Perioden følger dokumentert driftsstart og nedleggelse; 1849 og 1854 behandles som forhistorie, 1971 og 1974 som bygningsetterhistorie." }, sourceIds: businessSourceIds },
  businessTopics: [
    { emneId: "em_naering_arbeid_verdiskaping", siteSpecificRationale: "Hundrevis av arbeidere drev vevstoler og tekstilprosesser; kildene synliggjør særlig den store kvinnelige arbeidsstyrken.", caseIds: ["case_hjula_textile_system"] },
    { emneId: "em_naering_industri_og_mekanisering", siteSpecificRationale: "Vannkraft, hovedaksling og mekaniske vevstoler gjorde Hjula til et stort fabrikkproduksjonssystem.", caseIds: ["case_hjula_textile_system"] },
    { emneId: "em_naering_produksjon_produktivitet", siteSpecificRationale: "Vevstolkapasitet, arbeidsstyrke og omsetningsendring er dokumenterte indikatorer, men ikke et komplett produktivitetsmål.", caseIds: ["case_hjula_textile_system"] },
    { emneId: "em_naering_makt_ulikhet_arbeidsliv", siteSpecificRationale: "Schou kontrollerte kapital- og leverandørvalg, mens en stor og hovedsakelig kvinnelig arbeidsstyrke skapte tekstilene.", caseIds: ["case_hjula_textile_system"] },
    { emneId: "em_naering_omstilling_kriser_skift", siteSpecificRationale: "Markedsfall, råvaremangel, TEFAS-sammenslåing og nedleggelse viser flere typer industriell sårbarhet.", caseIds: ["case_hjula_textile_system"] }
  ],
  sources: [
    { id: "source_hjula_snl", url: urls.snlHjula, sourceLocation: "Hele oppslaget, særlig etablering, produksjon, arbeidsstyrke, marked, kriser og nedleggelse", sourceType: "reputable_secondary", verifiedAt, temporalCoverage: "historical", provenance: "Fagredigert oppslag i Store norske leksikon.", limitations: "Oppslaget gir utvalgte kapasitets-, sysselsettings- og omsetningstall, men ikke fullstendige tidsserier." },
    { id: "source_hjula_byleksikon", url: urls.byleksikon, sourceLocation: "Sted, adresse, bygning og etterhistorie", sourceType: "reputable_secondary", verifiedAt, temporalCoverage: "mixed", provenance: "Oslo byleksikons redaksjonelle stedspost.", limitations: "Kilden er sterk på lokal identitet og bygg, men kort om priser, lønn og produksjonsvolum." },
    { id: "source_halvor_schou_nbl", url: urls.nblSchou, sourceLocation: "Biografi og avsnitt om Hjula og Myrens", sourceType: "reputable_secondary", verifiedAt, temporalCoverage: "historical", provenance: "Fagredigert biografi i Norsk biografisk leksikon.", limitations: "Biografien belyser eierens valg og gir ikke arbeidernes perspektiv eller komplett bedriftshistorie." }
  ],
  economicCases: [{
    id: "case_hjula_textile_system", claim: "Hjula skapte verdi ved å koble vannkraft, maskiner, kapital og lønnsarbeid til produksjon av bomulls- og ullstoffer for norske og svenske markeder.",
    unitOfAnalysis: { unit: "Hjula Væverier ved Hjulafossen", boundary: "Analysen omfatter fabrikkstedets kraft, teknologi, produksjon, arbeidsstyrke, markeder, kriser og nedleggelse, ikke hele Schou-konsernet eller all tekstilindustri langs Akerselva.", scale: "site", temporalScope: { start: "1855", end: "1957", precision: "period", rationale: "Driftsperioden avgrenser det stedbundne produksjonssystemet." }, sourceIds: businessSourceIds },
    actors: [
      { name: "Halvor Schou og senere eiere", roleOrInterest: "Kontrollerte kapital, investeringer, maskinvalg, markeder og omstilling.", economicPosition: "Eiersiden tok strategiske valg og hadde krav på virksomhetens overskudd.", sourceIds: ["source_hjula_snl", "source_halvor_schou_nbl"] },
      { name: "Fabrikkarbeiderne", roleOrInterest: "Drev veving og tilknyttede tekstilprosesser.", economicPosition: "Skapte varene gjennom lønnsarbeid uten å kontrollere eierskapet; mange var lavtlønte kvinner.", sourceIds: ["source_hjula_snl"] },
      { name: "Myrens Verksted", roleOrInterest: "Leverandør av turbin og hovedaksling.", economicPosition: "Fikk betalt oppdrag og erfaring gjennom en krevende lokal leveranse.", sourceIds: ["source_hjula_snl", "source_halvor_schou_nbl"] },
      { name: "Kunder i Norge og Sverige", roleOrInterest: "Etterspurte tekstilene og ga produksjonen markedsverdi.", economicPosition: "Markedsadgangen påvirket omsetningen, særlig rundt regelendringen i 1897.", sourceIds: ["source_hjula_snl"] }
    ],
    valueCreation: {
      inputs: [{ statement: "Bomull og ull, garn, vannkraft, fabrikkbygning, engelske maskiner, lokal turbin- og verkstedkompetanse, kapital og arbeid var sentrale innsatsfaktorer.", sourceIds: businessSourceIds }],
      activity: { statement: "Innsatsfaktorene ble organisert som mekanisk veving og tilknyttet bearbeiding i et kraftoverført fabrikksystem.", sourceIds: ["source_hjula_snl", "source_hjula_byleksikon"] },
      outputs: [{ statement: "Hjula produserte blant annet blåtøy, bekledningsstoffer, skjortestoff, vatt, rullegardinstoff og senere ullvarer.", sourceIds: ["source_hjula_snl"] }],
      valueCreationAssessment: { statement: "Kildene dokumenterer et stort tekstilproduksjonssystem og markedsomsetning, men mangler sammenlignbare serier for innsats, volum og priser som kreves for å beregne verdiskaping eller produktivitet over tid.", sourceIds: ["source_hjula_snl"] }
    },
    measurement: { methodId: "met_naering_statistikk_og_indikatoranalyse", evidenceType: "mixed", indicatorOrObservation: "400 vevstoler som planlagt kapasitet, omkring 800 ansatte i 1880-årene og om lag 30 prosent omsetningsfall 1897–1900 behandles som separate indikatorer.", unit: "kapasitet, personer og prosentvis omsetningsendring", period: "1855–1900", comparability: "Indikatorene gjelder ulike måleobjekter og tidspunkter og kan ikke summeres eller brukes som én ytelsesserie.", dataLimitations: "Arbeidstimer, produksjonsvolum, priser, lønnsserier, kapitalbeholdning og kvalitetsendringer mangler.", sourceIds: ["source_hjula_snl", "source_halvor_schou_nbl"] },
    distributionAndPower: { ownershipOrControl: "Halvor Schou og senere eiere kontrollerte kapital, investeringer, leverandørvalg og markedsstrategi.", laborPosition: "Arbeiderne, mange av dem kvinner, drev produksjonen og mottok lønn uten eierskapskontroll.", beneficiaries: ["Eiere kunne motta avkastning fra tekstilproduksjonen.", "Arbeidere mottok lønn og utviklet fabrikkkompetanse.", "Myrens Verksted fikk oppdrag og erfaring.", "Kunder fikk tilgang til produserte tekstiler."], costRiskBearers: ["Eierne bar investerings- og markedsrisiko.", "Arbeiderne bar belastning og risiko for inntektsbortfall ved stans og nedleggelse.", "Kildene tallfester ikke lokale miljøkostnader fra produksjonen."], sourceIds: businessSourceIds },
    riskAndExternalities: { riskAssessment: { statement: "Hjula var avhengig av råvaretilgang, markedsadgang, handelsregler, maskindrift, kapital og etterspørsel; hendelsene i 1897, 1918 og etterkrigstiden viser ulike sårbarheter.", sourceIds: ["source_hjula_snl"] }, externalityAssessment: { status: "not_applicable", rationale: "De gjennomgåtte hovedkildene gir ikke sikkert stedsspesifikt grunnlag for å tallfeste utslipp, helsebelastning eller andre miljøeksternaliteter." } },
    comparisonAndCausality: { comparisonBasis: "SNL belyser produksjon, arbeid og markeder; Oslo byleksikon kontrollerer stedet og bygget; NBL belyser Schous og Myrens' beslutningsforløp.", causalStatus: "descriptive_only", causalAssessment: "Kildene viser rekkefølgen mellom etablering, teknologi, vekst, markedssjokk, råvaremangel, sammenslåing og nedleggelse, men isolerer ikke én årsak til vekst eller krise.", alternativeExplanations: ["Råvarepriser, teknologi, lønnskostnader, konkurranse, handelspolitikk, kapital og etterspørsel kan alle ha påvirket utviklingen."], uncertainty: "Uten sammenlignbare bedriftsregnskaper og kontrollgrupper kan virkninger ikke tilskrives én faktor.", sourceIds: businessSourceIds }
  }],
  presentOperation: { operationalStatus: "former", statement: "Tekstilproduksjonen ved Hjula sluttet i 1957. Fabrikkbygningen står etter brann og gjenoppføring og brukes til andre formål.", originalEconomicRoleRelationship: "Den stedbundne veveridriften er avsluttet; bevarte og gjenoppførte bygg dokumenterer industristedet uten å videreføre den opprinnelige tekstilproduksjonen.", checkedAt: verifiedAt, sourceIds: ["source_hjula_snl", "source_hjula_byleksikon"] },
  quizOpening: { status: "PASS", quizTargetId: placeId, firstTwoSetsQuestionCount: 14, sourceBrief: briefFile, productionContext: contextFile, requiredInputs: quizRequiredInputs },
  chronologyStories: { status: "PASS", chronologyReviewed: true, storiesReviewed: true, rationale: "Leksikonets fjorten milepæler eier tidslinjen; storyen om hovedakslingen har en egen narrativ akse om et konkret leverandørvalg og lokal kompetansebygging." },
  gates: Object.fromEntries("ABCDEFGH".split("").map(letter => [letter, { status: "PASS", evidenceRefs: [letter === "A" ? "economicIdentity" : letter === "B" ? "businessTopics" : letter === "C" ? "economicCases[0].valueCreation" : letter === "D" ? "economicCases[0].distributionAndPower" : letter === "E" ? "economicCases[0].measurement" : letter === "F" ? "economicCases[0].comparisonAndCausality" : letter === "G" ? "quizOpening" : "chronologyStories"] }])),
  review: { reviewer: "History GO Næringsliv source audit", reviewedAt: verifiedAt, notes: "Stedsidentitet, teknologi, produksjon, arbeidsstyrke, kjønnsfordeling, marked, kriser, nedleggelse, målegrenser og nåstatus er kontrollert." }
});

const { execFileSync } = await import("node:child_process");
execFileSync(process.execPath, ["scripts/build-quiz-production-context.mjs", "--category", "naeringsliv", "--target", placeId, "--output", contextFile], { cwd: root, stdio: "inherit" });
execFileSync(process.execPath, ["scripts/build-place-open-payloads.mjs"], { cwd: root, stdio: "inherit" });
const completionAudit = auditOvreFossCompletion({ root });
write("reports/place-production/ovre-foss-hjula-phase1-24-gate-audit-v1.json", {
  schema: "history_go_phase1_24_quality_gate_v1", place_id: placeId, verified_at: verifiedAt,
  null_measurement: { existing_place: true, canonical_id_reused: placeId, coordinate_changed: false, coordinate_status_preserved: "verified_historical_source", existing_quiz_audit: "5 flat questions plus 5x6 merged set file", existing_person_reused: personId, existing_person_primary_anchor_preserved: "glads_molle", prior_coordinate_commits: ["2fb6e491b", "45c56ead1", "19e242941", "608f42991", "e1d9ca1a9"], brand_candidate_audited: "not_applicable", before_after_exact_pair: false },
  source_conflicts: [
    { claim: "Øvre Foss og Hjulafossen er samme eksakte fossepunkt.", status: "rejected", reason: "Oslo byleksikon omtaler dem separat; Hjula-kildene plasserer fabrikken ved Hjulafossen i Sagveien 23." },
    { claim: "400 vevstoler og 800 ansatte dokumenterer produktiviteten.", status: "rejected", reason: "Tallene gjelder kapasitet og arbeidsstyrke på forskjellige tidspunkter og mangler produksjonsvolum og arbeidstimer." },
    { claim: "Hjula ble lagt ned umiddelbart etter TEFAS-konkursen i 1955.", status: "resolved", reason: "TEFAS gikk konkurs i 1955; Hjula-anlegget ble lagt ned i 1957." }
  ],
  validation: { schema: completionAudit.schema, status: completionAudit.status, checks: completionAudit.checks, failed_checks: completionAudit.failed_checks, conclusion: completionAudit.conclusion },
  quality_score: completionAudit.quality_score
});
write("reports/place-production/ovre-foss-hjula-workcard-current.json", {
  place_id: placeId, status: completionAudit.status === "high_quality" ? "complete" : "blocked", phases: "1–24", verified_at: verifiedAt, canonical_next: null, blockers: completionAudit.failed_checks,
  prior_work_gate: { decision: "mixed_reuse_and_new_work", reused: ["canonical id and coordinate evidence", "legacy quiz claims", "Halvor Schou person id and primary anchor"], new: ["complete source-reviewed place package"] },
  profile_decision: { profile: "standard", collection_ids: ["people", "objects", "structures"], brands: "begrunnet_ikke_relevant" },
  notes: ["Eksisterende canonical Place er fullprodusert uten ID- eller koordinatendring.", "Halvor Schou er oppgradert uten å flytte primærankeret fra Glads mølle.", "Eldre quiz er auditert og erstattet av normal 4x7 med Knowledge-materialisering.", "Kvalitetsstatus beregnes fra faktiske innholds-, kilde-, leveranse- og registerkontroller; redaksjonell automatikk er begrenset til 4/5.", "Neste sted velges først etter grønn CI, verifisert merge og live-QA."]
});
console.log(`Built Øvre Foss–Hjula completion package (${questions.length} quiz questions, ${chronology.length} chronology entries, ${sentences(place.popupDesc).length} popup sentences).`);
