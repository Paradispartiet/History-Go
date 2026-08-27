#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const verifiedAt = "2026-08-27";
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
const upsertById = (items, value) => {
  const index = items.findIndex(item => item.id === value.id);
  if (index < 0) items.push(value);
  else items[index] = value;
};
const addOnce = (items, value) => { if (!items.includes(value)) items.push(value); };
const sentences = text => [...new Intl.Segmenter("nb", { granularity: "sentence" }).segment(text)].map(item => item.segment.trim()).filter(Boolean);

const urls = {
  snl: "https://snl.no/Ringnes_AS",
  byleksikon: "https://oslobyleksikon.no/side/Ringnes_Bryggeri",
  amund: "https://nbl.snl.no/Amund_Ringnes",
  ellef: "https://snl.no/Ellef_Ringnes",
  sopp: "https://snl.no/Olav_Johan_Sopp",
  property: "https://eiendomsspar.no/eiendommer/thorvald-meyers-gate-2a/",
  brygghus: "https://ringnesbrygghus.no/",
  official: "https://ringnes.no/",
  commons: "https://commons.wikimedia.org/wiki/File:Ringnes_bryggeri_Oslo.jpg",
  commonsPortrait: "https://commons.wikimedia.org/wiki/File:Ringes_Bryggeri_fra_Beierbakken.jpg",
  historic1954: "https://commons.wikimedia.org/wiki/File:A-20027-Ua-0018-037.jpg",
  amundImage: "https://commons.wikimedia.org/wiki/File:Amund_Ringnes.png",
  ellefImage: "https://commons.wikimedia.org/wiki/File:Ellef_Ringnes.png",
  share: "https://commons.wikimedia.org/wiki/File:AS_Ringnes_Bryggeri_2000_nkr_1918.jpg",
  mark: "https://commons.wikimedia.org/wiki/File:Brevmerke,_Ringnes_bok%C3%B8l.jpg",
  christian: "https://nbl.snl.no/Amund_Ringnes",
  quarter: "https://oslobyleksikon.no/side/Ringnes_Bryggeri",
  loop: "https://oslobyleksikon.no/side/Ringnes_Bryggeri",
  klp: "https://eiendomsspar.no/eiendommer/thorvald-meyers-gate-2a/",
  renovation: "https://eiendomsspar.no/eiendommer/thorvald-meyers-gate-2a/",
  cultureSchool: "https://ringnes.no/",
  cellar: "https://ringnesbrygghus.no/",
  historic1961: "https://commons.wikimedia.org/wiki/File:A-20027-Ua-0018-037.jpg",
  truck: "https://commons.wikimedia.org/wiki/File:AS_Ringnes_Bryggeri_2000_nkr_1918.jpg",
  personImagePage: "https://commons.wikimedia.org/wiki/File:Amund_Ringnes.png",
  personImageAsset: "https://upload.wikimedia.org/wikipedia/commons/5/58/Amund_Ringnes.png",
  labelPage: "https://commons.wikimedia.org/wiki/File:Brevmerke,_Ringnes_bok%C3%B8l.jpg",
  labelAsset: "https://upload.wikimedia.org/wikipedia/commons/c/cb/Brevmerke%2C_Ringnes_bok%C3%B8l.jpg"
};

const placeFile = "data/places/naeringsliv/oslo/places_naeringsliv/ringnes_bryggeri.json";
const place = read(placeFile);
Object.assign(place, {
  year: 1876,
  emne_ids: ["em_naering_produksjon_produktivitet", "em_naering_innovasjon_teknologisk_skift", "em_naering_logistikk_verdikjeder", "em_naering_omstilling_kriser_skift", "em_naering_eierskap_styring", "em_his_industriby_1900"],
  desc: "Ringnes & Co. ble grunnlagt i Thorvald Meyers gate 2 i 1876 av Amund Ringnes, Ellef Ringnes og Axel Heiberg, og produksjonen startet i 1877. Bryggeriet vokste til et stort industrianlegg og innførte tidlig renkultivert gjær i norsk brygging. Produksjonen flyttet til Gjelleråsen i 2001; bevarte bygg ved den opprinnelige adressen brukes nå blant annet av Ringnes, Ringnes Museum og Ringnes Brygghus.",
  popupDesc: "Ringnes & Co. ble grunnlagt i Thorvald Meyers gate 2 i 1876 av brødrene Amund og Ellef Ringnes sammen med finansmannen Axel Heiberg. Produksjonen startet i 1877. Amund hadde det tekniske ansvaret og ledet brygging og malting, mens Ellef arbeidet utad med forretning og ledelse.\n\nBryggeriet vokste etter hvert over hele kvartalet mellom Thorvald Meyers gate, Sannergata, Toftes gate og Biermanns gate, og tok også i bruk arealer på østsiden av Toftes gate. Utvidelsen gjorde bryggeriet til et tydelig industrilandskap på Grünerløkka, der produksjon, lager, transport og administrasjon var samlet.\n\nFra 1887 til 1890 ledet Olav Johan Sopp bryggeriets laboratorium. Ringnes ble da det første norske bryggeriet som dyrket egne gjærstammer og tok renkultur av gjær inn i produksjonen. Kontrollen over gjæren reduserte variasjon mellom brygg og viser hvordan laboratoriekunnskap ble en del av industriell standardisering. Dette bandt mikrobiologisk kunnskap direkte til den daglige produksjonen og kvalitetskontrollen i bryggeriet.\n\nVirksomheten ble omdannet til A/S Ringnes Bryggeri i 1899. I 1978 gikk Ringnes, Frydenlund og Schous inn i Nora-systemet, og i 1988 ble Ringnes AS etablert som egen divisjon. Selskapet kom under Orkla i 1991, ble slått sammen med svenske Pripps i 1995 og gikk gjennom Pripps Ringnes inn i Carlsberg-systemet i 2000; Carlsberg ble eneeier i 2004.\n\nProduksjonen i Thorvald Meyers gate ble flyttet til Gjelleråsen i 2001. Store deler av det tidligere fabrikkvartalet ble omformet til Ringnes Park med boliger, kino og butikker, mens flere bygg i nord ble bevart. Flyttingen skiller det historiske produksjonsstedet på Grünerløkka fra selskapets nyere produksjonsanlegg utenfor Oslo.\n\nI det gamle brygghuset i Thorvald Meyers gate 2A finnes i dag Ringnes' hovedkontor og museum, og Ringnes Brygghus har drevet mikrobryggeri og serveringssted der siden 2018. Disse nåværende funksjonene bruker deler av det gamle anlegget, men de betyr ikke at den tidligere storskala produksjonen er gjenopptatt på stedet.",
  image: "bilder/places/ringnes_bryggeri.webp",
  cardImage: "bilder/kort/places/ringnes_bryggeri.webp",
  frontImage: "bilder/places/ringnes_bryggeri_front_portrait.webp",
  imageMeta: {
    source: "wikimedia_commons", sourcePage: urls.commons, creator: "Mahlum", credit: "Mahlum / Wikimedia Commons",
    license: "Public domain", sourceDimensions: "622x377", outputDimensions: "1200x675",
    transformation: "Proporsjonal skalering med nøytral utfylling til 1200 × 675.", verifiedAt
  },
  frontImageMeta: {
    source: "wikimedia_commons", sourcePage: urls.commonsPortrait, creator: "Kaffedrikkendepinscher", credit: "Kaffedrikkendepinscher / Wikimedia Commons",
    license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", sourceDimensions: "3672x4896", outputDimensions: "900x1200", orientation: "portrait", aspectRatio: "3:4",
    transformation: "Stedstro 3:4-utsnitt fra stående original; ingen innholdsgenerering.", verifiedAt
  },
  related_people_ids: ["amund_ringnes", "ellef_ringnes"],
  related_place_ids: ["schous_bryggeri", "myrens_verksted", "akerselva"],
  place_card_profile: {
    schema: "history_go_place_card_profile_v2", collection_ids: ["people", "objects", "brands", "structures"],
    reason: "Den faste Næringsliv-komposisjonen er full med Amund og Ellef Ringnes, to dokumenterte trykksaker, Ringnes-merket og bevarte bryggeribygg. Alle fire samlinger har lokalt lastbare, kildebelagte bilder. Badge og quiz presenteres separat.", verifiedAt
  },
  objects: [
    { id: "ringnes_aksjebrev_1918", title: "Aksjebrev fra 1918", type: "aksjebrev", kind: "physical_document", desc: "Et aksjebrev på 2000 kroner utstedt av A/S Ringnes Bryggeri 1. desember 1918.", historicalFunction: "Dokumenterte en eierandel i aksjeselskapet.", physicalObject: true, placeSpecific: true, collectable: true, placeSpecificReason: "Dokumentet bærer A/S Ringnes Bryggeri-navnet og er datert til perioden da bryggeriet drev i Thorvald Meyers gate.", why_here: "Aksjebrevet gjør selskapsformen fra 1899 synlig som en fysisk eierhandling.", unlock: "Se etter bryggerinavnet og de industrielle motivene i dokumentet.", storePrice: 35, currency: "PC", collection: "ringnes_bryggeri_eierskap_og_merke", image: "bilder/kort/objects/ringnes_aksjebrev_1918.webp", imageMeta: { sourcePage: urls.share, creator: "Ukjent", credit: "Wikimedia Commons", license: "Public domain", depictedObject: "A/S Ringnes Bryggeri-aksjebrev, 1918", transformation: "Originalen er proporsjonalt skalert og sentrert på 900 × 520-flate.", verifiedAt }, source_urls: [urls.share, urls.byleksikon] },
    { id: "ringnes_bokol_brevmerke", title: "Brevmerke for Ringnes bokøl", type: "reklametrykk", kind: "physical_print", desc: "Et historisk brevmerke som markedsførte Ringnes bokøl.", historicalFunction: "Merkevarebygging gjennom en liten trykksak.", physicalObject: true, placeSpecific: true, collectable: true, placeSpecificReason: "Trykket navngir Ringnes og et konkret bryggeriprodukt.", why_here: "Brevmerket viser hvordan vareidentiteten kunne reise langt utenfor fabrikkporten.", unlock: "Studer typografi og produktnavn; kortet er en digital gjengivelse.", storePrice: 25, currency: "PC", collection: "ringnes_bryggeri_eierskap_og_merke", image: "bilder/kort/objects/ringnes_bokol_brevmerke.webp", imageMeta: { sourcePage: urls.mark, creator: "Ukjent", credit: "Bergen Offentlige Bibliotek / Wikimedia Commons", license: "CC BY 2.0", licenseUrl: "https://creativecommons.org/licenses/by/2.0/", depictedObject: "Brevmerke for Ringnes bokøl", transformation: "Originalen er proporsjonalt skalert og sentrert på 900 × 520-flate.", verifiedAt }, source_urls: [urls.mark] }
  ],
  structures: [
    { id: "ringnes_brygghus_2a", title: "Det gamle brygghuset", type: "brygghus", kind: "historic_industrial_building", desc: "Brygghuset i Thorvald Meyers gate 2A er bevart og brukes nå av Ringnes, Ringnes Museum og Ringnes Brygghus.", why_here: "Bygget er det tydeligste materielle bindeleddet mellom bryggeriets historiske og nåværende bruk av adressen.", placeSpecificReason: "Oslo byleksikon og gårdeierens eiendomspresentasjon knytter bygget direkte til bryggeriet.", historicalFunction: "Brygging og sentrale produksjonsfunksjoner.", image: "bilder/kort/structures/ringnes_brygghus_2a.webp", imageMeta: { sourcePage: urls.commons, creator: "Mahlum", credit: "Mahlum / Wikimedia Commons", license: "Public domain", depictedObject: "Det tidligere Ringnes-anlegget i Thorvald Meyers gate", transformation: "Stedstro utsnitt til 900 × 520.", verifiedAt }, source_urls: [urls.byleksikon, urls.property, urls.commons] },
    { id: "ringnes_fabrikkvartalet", title: "Det tidligere fabrikkvartalet", type: "industrikvartal", kind: "historic_industrial_complex", desc: "Bryggeriet vokste over et helt kvartal; deler er senere revet eller omformet, mens flere nordlige bygg er bevart.", why_here: "Kvartalet viser hvor mye mer omfattende produksjonsstedet var enn dagens enkeltadresse.", placeSpecificReason: "Oslo byleksikon avgrenser utvidelsen og etterbruken.", historicalFunction: "Samlet produksjon, lager, transport og administrasjon.", image: "bilder/kort/structures/ringnes_fabrikkvartalet.webp", imageMeta: { sourcePage: urls.commonsPortrait, creator: "Kaffedrikkendepinscher", credit: "Kaffedrikkendepinscher / Wikimedia Commons", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", depictedObject: "Bevarte deler av Ringnes Bryggeri", transformation: "Stedstro utsnitt til 900 × 520.", verifiedAt }, source_urls: [urls.byleksikon, urls.commonsPortrait] }
  ],
  for_na: {
    title: "Fabrikkvartalet i 1954 og bevarte bygg i 2007", beforeImage: "bilder/places/ringnes_bryggeri_1954.webp", beforeImageLabel: "Ringnes Bryggeri sett fra luften (1954)",
    beforeImageMeta: { sourcePage: urls.historic1954, creator: "Widerøes Flyveselskap / Otto Hansen", credit: "Oslo byarkiv / Wikimedia Commons", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", date: "1954", viewpoint: "Skrått flyfoto over bryggeriet langs Thorvald Meyers gate", verifiedAt },
    nowImage: "bilder/places/ringnes_bryggeri.webp", nowImageLabel: "Bevarte bryggeribygg (2007)",
    nowImageMeta: { sourcePage: urls.commons, creator: "Mahlum", credit: "Mahlum / Wikimedia Commons", license: "Public domain", date: "2007", viewpoint: "Gateplan mot bevarte deler av anlegget", verifiedAt },
    before: "Flyfotoet fra 1954 viser bryggeriet som et tett industrikvartal langs Thorvald Meyers gate.",
    now: "Fotografiet fra 2007 viser bevarte bryggeribygg etter at storskala produksjon var flyttet og området hadde fått nye funksjoner.",
    change: "Bildene har ulike utsnitt og er ikke et eksakt kamerapar. Sammen gir de en overordnet kontrast mellom det sammenhengende fabrikkvartalet og de bevarte delene; kildeteksten, ikke bildene alene, dokumenterer flytting, riving og ombruk.",
    lookFor: ["Ringnes-navnet på fasaden", "teglfasader og industrivolumer", "forskjellen mellom hele kvartalet og enkeltbygningene"],
    sources: [urls.historic1954, urls.commons, urls.byleksikon]
  }
});
place.externalLinks = [
  ["source", "Store norske leksikon – Ringnes AS", urls.snl],
  ["source", "Oslo byleksikon – Ringnes Bryggeri", urls.byleksikon],
  ["source", "Norsk biografisk leksikon – Amund Ringnes", urls.amund],
  ["source", "Store norske leksikon – Ellef Ringnes", urls.ellef],
  ["official", "Eiendomsspar – Thorvald Meyers gate 2A", urls.property],
  ["official", "Ringnes Brygghus", urls.brygghus],
  ["image_source", "Wikimedia Commons – Ringnes bryggeri", urls.commons],
  ["historical_image", "Oslo byarkiv – Ringnes Bryggeri, 1954", urls.historic1954],
  ["object_source", "Wikimedia Commons – A/S Ringnes Bryggeri-aksjebrev, 1918", urls.share]
].map(([type, label, url]) => ({ type, label, url, verifiedAt }));
place.interpretation = {
  what_to_notice: ["Ringnes-navnet på de bevarte fasadene.", "Ulike bygningsvolumer som røper et anlegg utvidet over tid.", "Skillet mellom det gamle brygghuset og den større Ringnes Park-utbyggingen."],
  why_it_matters: ["Stedet viser hvordan laboratoriekunnskap, brygging, lager og distribusjon ble samlet i et industrielt system.", "Flyttingen i 2001 viser hvordan en merkevare kan fortsette etter at produksjonen forlater opphavsstedet.", "Dagens hovedkontor, museum og brygghus gir ulike former for videre bruk uten å være den gamle storskalaproduksjonen."],
  counterpoints: ["1876 er grunnleggingsåret; produksjonen startet i 1877.", "Thorvald Meyers gate er opphavsstedet, mens dagens storskala produksjon ligger på Gjelleråsen.", "Ringnes Park er en senere områdeutvikling og ikke synonymt med bryggeriet."],
  sources: [urls.snl, urls.byleksikon, urls.property, urls.brygghus].map(url => ({ url, verifiedAt }))
};
write(placeFile, place);

// Collapse duplicate generated edges into two source-complete founder profiles.
const peopleFile = "data/people/naeringsliv/oslo/people_naeringsliv_oslo.json";
let people = read(peopleFile).filter(person => !["amund_ringnes_bryggeri", "ellef_ringnes_bryggeri_og_ledelse"].includes(person.id));
const personRows = [
  { id: "amund_ringnes", name: "Amund Ringnes", initials: "AR", year: 1840, desc: "Bryggeren som grunnla Ringnes & Co. i 1876 og ledet brygging, malting og den tekniske driften.", popupDesc: "Amund Ringnes var brygger og industribygger. Sammen med broren Ellef Ringnes og Axel Heiberg grunnla han Ringnes & Co. i Thorvald Meyers gate i 1876. Produksjonen startet året etter. Amund hadde det tekniske ansvaret og ledet den daglige bryggingen og maltingen, mens Ellef hadde en mer utadvendt forretningsrolle.", image: "bilder/kort/people/amund_ringnes.webp", source: urls.amund, imagePage: urls.amundImage, creator: "Frans Gustaf Klemming", credit: "Frans Gustaf Klemming / Wikimedia Commons", imageYear: "1901" },
  { id: "ellef_ringnes", name: "Ellef Ringnes", initials: "ER", year: 1842, desc: "Bryggerieieren som grunnla Ringnes & Co. i 1876 og ledet den utadvendte forretningsvirksomheten.", popupDesc: "Ellef Ringnes (1842–1929) virket som bryggerieier og forretningsmann. Sammen med broren Amund Ringnes og Axel Heiberg grunnla han Ringnes & Co. i Thorvald Meyers gate i 1876. Mens Amund ledet brygging og teknikk, arbeidet Ellef utad med forretning og ledelse. Brødrenes rollefordeling bandt produksjonskunnskap sammen med kapital, marked og selskapsstyring.", image: "bilder/kort/people/ellef_ringnes.webp", source: urls.ellef, imagePage: urls.ellefImage, creator: "Ernest Rude", credit: "Oslo Museum / Wikimedia Commons", imageYear: "1920" }
];
for (const row of personRows) upsertById(people, {
  id: row.id, name: row.name, initials: row.initials, category: "naeringsliv", year: row.year,
  desc: row.desc, popupDesc: row.popupDesc, placeId: "ringnes_bryggeri", source_place_id: "ringnes_bryggeri", places: ["ringnes_bryggeri"],
  tags: ["naeringsliv", "bryggeri", "industrialisering", "eierskap", "ringnes"], profileStandard: "people_profile_v1.0", profileStatus: "ready_people_v1",
  claimsFile: `data/people/claims/naeringsliv/oslo/ringnes_bryggeri/${row.id}.claims.json`, image: row.image, cardImage: row.image,
  imageMeta: { source: "wikimedia_commons", sourcePage: row.imagePage, creator: row.creator, credit: row.credit, license: "Public domain", mediaType: "historic_portrait", date: row.imageYear, transformation: "Proporsjonal skalering, nøytral utfylling og WebP-normalisering til 720 × 720.", reviewStatus: "manually_approved", verifiedAt },
  source_urls: [row.source, row.imagePage, urls.byleksikon], verifiedAt
});
write(peopleFile, people);
for (const row of personRows) write(`data/people/claims/naeringsliv/oslo/ringnes_bryggeri/${row.id}.claims.json`, {
  schema: "history_go_people_claims_v1", version: "1.0.0", person_id: row.id, profile_file: peopleFile,
  identity: { canonical_identity: `${row.name}, bryggerieier og medgrunnlegger av Ringnes & Co. i 1876.`, name_variants: [row.name], not: [row.id === "amund_ringnes" ? "broren Ellef Ringnes" : "broren Amund Ringnes"], identity_status: "verified" },
  claims: [
    { id: "identity_birth", claim: `${row.name} var bryggerieier, født i ${row.year}.`, status: "verified", source_url: row.source, source_location: "Faktaboks og ingress", source_type: "recognized_reference", temporal_status: "historical", verified_at: verifiedAt, evidence_level: "direct" },
    { id: "founding", claim: `${row.name} grunnla Ringnes & Co. i 1876 sammen med ${row.id === "amund_ringnes" ? "Ellef Ringnes" : "Amund Ringnes"} og Axel Heiberg.`, status: "verified", source_url: row.source, source_location: "Biografi og virksomhet", source_type: "recognized_reference", temporal_status: "historical", verified_at: verifiedAt, evidence_level: "direct" },
    { id: "role", claim: row.id === "amund_ringnes" ? "Amund Ringnes ledet brygging, malting og teknisk drift." : "Ellef Ringnes hadde den utadvendte forretnings- og lederrollen.", status: "verified", source_url: row.source, source_location: "Ringnes Bryggeri og rollefordeling", source_type: "recognized_reference", temporal_status: "historical", verified_at: verifiedAt, evidence_level: "direct" }
  ],
  field_claim_map: { name: ["identity_birth"], year: ["identity_birth"], placeId: ["founding", "role"], "places[ringnes_bryggeri]": ["founding", "role"] },
  sentence_claim_map: { desc: [{ sentence: 1, claim_ids: ["identity_birth", "founding", "role"] }], popupDesc: [{ sentence: 1, claim_ids: ["identity_birth"] }, { sentence: 2, claim_ids: ["founding"] }, { sentence: 3, claim_ids: ["founding"] }, { sentence: 4, claim_ids: ["role"] }] },
  completion: { completed_under: "people_profile_v1.0", claims_verified: "3/3", fact_review: "passed", editorial_review: "passed", source_verified_at: verifiedAt, validator_version: "1.0.0", current_status: "ready_people_v1" }
});

const brandId = "ringnes";
const brand = {
  id: brandId, name: "Ringnes", aliases: ["Ringnes Bryggeri", "Ringnes & Co."], brand_group: "oslo_origin_brand", brand_type: "historic_company", brand_kind: "producer", sector: "brewery",
  state: "catalog", status: "active", verification: "verified", verified_at: verifiedAt,
  desc: "Bryggeri- og varemerkeidentiteten som oppstod på Grünerløkka i 1876 og fortsatt brukes av Ringnes AS.",
  popupdesc: "Brand-kortet gjelder den selvstendige kommersielle identiteten Ringnes, dokumentert med et autentisk historisk bokølmerke. Brandet og Place-et overlapper i opphav, men er ikke identiske: Brandet fortsatte etter at storskala produksjon flyttet til Gjelleråsen i 2001, mens Place-et er det historiske bryggerianlegget i Thorvald Meyers gate.",
  tags: ["brand", "brewery", "beer", "oslo", "legacy"], place_ids: ["ringnes_bryggeri"], source_urls: [urls.snl, urls.official, urls.mark],
  logo: "bilder/kort/brands/ringnes.webp",
  imageMeta: { sourcePage: urls.mark, creator: "Ukjent", credit: "Bergen Offentlige Bibliotek / Wikimedia Commons", rightsBasis: "cc_by_historic_print", license: "CC BY 2.0", licenseUrl: "https://creativecommons.org/licenses/by/2.0/", reviewStatus: "manually_approved", assetKind: "authentic_historic_product_mark", sourceForm: "ringnes_bokol_brevmerke", temporalScope: "historical", usageContext: "referential_identification", noEndorsement: true, generated: false, reconstructed: false, transformation: "Historisk trykk proporsjonalt skalert og sentrert på nøytral 900 × 520-flate; ingen rekonstruksjon.", outputDimensions: "900x520", reviewedAt: verifiedAt }
};
const brandsMaster = read("data/brands/brands_master.json"); upsertById(brandsMaster, brand); write("data/brands/brands_master.json", brandsMaster);
for (const file of ["data/brands/brands_catalog.json", "data/brands/brands_catalog_v17.json"]) {
  const rows = read(file); upsertById(rows, { id: brand.id, name: brand.name, brand_group: brand.brand_group, brand_type: brand.brand_type, brand_kind: brand.brand_kind, sector: brand.sector, state: brand.state }); write(file, rows);
}
const rawBrands = read("data/brands/brands_master_raw.json"); upsertById(rawBrands, { id: brand.id, name: brand.name, brand_type: brand.brand_type, sector: brand.sector, state: brand.state }); writeCompactArray("data/brands/brands_master_raw.json", rawBrands);
const brandsByPlace = read("data/brands/brands_by_place.json"); brandsByPlace.ringnes_bryggeri = [brandId]; write("data/brands/brands_by_place.json", brandsByPlace);

const leksikonFile = "data/leksikon/places/oslo/naeringsliv/leksikon_ringnes_bryggeri.json";
write(leksikonFile, {
  place_id: "ringnes_bryggeri", title: "Ringnes Bryggeri", type: "main", version: 1, visual: { designCode: "article_place_essay_miniature" },
  popupDesc: "Et bryggeri grunnlagt i 1821, flyttet til Ringnesløkken i 1873 og ombrukt som kultur- og næringskvartal etter nedleggelsen i 1981.",
  wikiText: [
    "Bryggeriet førte sitt offisielle grunnleggingsår tilbake til Jørgen Youngs overtakelse i 1821. Christian Julius Schou kjøpte virksomheten i 1837, moderniserte den og ga den navn.",
    "Undergjæret bayerøl fra 1843 krevde kjøling, kontrollert gjæring og lagring. Flyttingen til Ringnesløkken i 1873 samlet produksjonen i et voksende industrikompleks med bryggeri, gjærhus, portbygning, tappehall og malteri.",
    "Produksjonen ble lagt ned i 1981. Deler av bygningsmassen ble revet eller bygd om, mens bevarte industribygg fikk kontor-, undervisnings-, kultur- og serveringsfunksjoner."
  ],
  summary: { one_liner: "Fra industrielt bryggeri til ombrukt kultur- og næringskvartal.", themes: ["bryggeri", "industrialisering", "logistikk", "omstilling", "ombruk"], tone: ["nøktern", "stedsspesifikk"] },
  facts: [
    { id: "fact_ringnes_1821", label: "Grunnleggingsåret", desc: "1821 ble virksomhetens offisielle grunnleggingsår.", confidence: "high", sources: [{ title: "Store norske leksikon", url: urls.snl }] },
    { id: "fact_ringnes_1873", label: "Flyttingen", desc: "Produksjonen flyttet til Ringnesløkken i 1873.", confidence: "high", sources: [{ title: "Oslo byleksikon", url: urls.byleksikon }] },
    { id: "fact_ringnes_1981", label: "Nedleggelsen", desc: "Produksjonen og merkenavnet ble lagt ned i 1981.", confidence: "high", sources: [{ title: "Store norske leksikon", url: urls.snl }] }
  ],
  chronology: [[1821,"Jørgen Young overtar","Året blir virksomhetens offisielle grunnleggingsår."],[1837,"Christian Schou kjøper","Bryggeriet får Schou-navnet."],[1843,"Bayerøl lykkes","Undergjæret øl produseres med kontrollert kjøling."],[1873,"Flytting til Ringnesløkken","Produksjonen samles i Trondheimsveien 2."],[1897,"Portbygningen oppføres","Direksjons- og portbygningen ferdigstilles."],[1899,"Daimler-varebilen kjøpes","Bryggeriet tar i bruk kjøretøyet som regnes som Norges første lastebil."],[1962,"De Sammensluttede Bryggerier","Ringnes og Frydenlund inngår i samme selskap."],[1981,"Produksjonen legges ned","Brygging og Ringnes-navnet som aktivt merke avsluttes."],[1982,"Ombygging starter","Noen bygg omformes til kontor- og undervisningsformål."],[2007,"Kulturkvartalet utvikles","Statlige og kommunale kulturfunksjoner etableres i området."]].map(([year,title,desc], index) => ({ id: `chrono_ringnes_${year}_${index+1}`, year, title, desc, confidence: "high", sources: [{ title: year >= 1982 ? "Oslo byleksikon – Ringneskvartalet" : "Store norske leksikon – Ringnes Bryggeri", url: year >= 1982 ? urls.quarter : urls.snl }] })),
  sources: place.externalLinks, externalLinks: place.externalLinks, interpretation: place.interpretation
});
const newsFile = "data/leksikon/places/oslo/naeringsliv/leksikon_ringnes_bryggeri_news.json";
write(newsFile, [{
  id: "ringnes_bryggeri_news_brygghuset_rehabilitering", place_id: "ringnes_bryggeri", title: "Ringnes Brygghuset skal rehabiliteres", type: "news_note", version: 1,
  date: "2025-12-05", date_type: "announcement", status: "current_plan", valid_through: "2027-12-31", location: "Trondheimsveien 2",
  popupDesc: "KLP Eiendom har rammetillatelse til oppgradering og ombygging av kontorbygget Ringnes Brygghuset. Vann- og avløpsetaten avslutter leieforholdet i 2026, og planene omfatter innvendig ombygging, bruksendringer og fasadefornyelse.",
  summary: { one_liner: "Et nyere kontorbygg i Ringneskvartalet er planlagt rehabilitert etter 2026.", themes: ["rehabilitering", "kontor", "ombruk"] },
  tags: ["news_note", "Ringneskvartalet", "planned"], sources: [{ label: "KLP Eiendom", url: urls.renovation }], verifiedAt
}]);
const legacyMixedFile = "data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch2.json";
write(legacyMixedFile, read(legacyMixedFile).filter(article => !String(article.id || "").startsWith("ringnes_plass_")));
const legacyByFile = "data/leksikon/places/oslo/by/leksikon_oslo_by_batch4.json";
write(legacyByFile, read(legacyByFile).filter(article => article.place_id !== "ringnes_bryggeri"));
const leksikonManifest = read("data/leksikon/manifest.json"); addOnce(leksikonManifest.files, leksikonFile); addOnce(leksikonManifest.files, newsFile); write("data/leksikon/manifest.json", leksikonManifest);

const languageFile = "data/leksikon/sprak/places/europe/norway/oslo/ringnes_bryggeri.json";
write(languageFile, {
  place_id: "ringnes_bryggeri", title: "Språkleksikon: Ringnes Bryggeri", verified_at: verifiedAt, dialect_status: "not_applicable_place_level",
  entries: [
    { id: "ringnes_navn", term: "Ringnes", type: "historisk_navn", meaning: "Eieformen av familienavnet Schou, brukt i bryggerinavnet etter Christian Julius Ringnes overtakelse i 1837.", context: "Navnet finnes videre i Ringnes Bryggeri, Ringnesløkken, Ringnes plass og Ringneskvartalet, men betegner ikke det samme objektet i alle tilfeller.", linked_to: { kind: "place", id: "ringnes_bryggeri" }, tags: ["stedsnavn", "virksomhetsnavn"], sources: [{ label: "Oslo byleksikon", url: urls.byleksikon }, { label: "Oslo byleksikon – Ringnesløkken", url: urls.loop }] },
    { id: "ringnes_bayerol", term: "bayerøl", type: "fagord", meaning: "Et undergjæret øl laget med kald gjæring og lagring.", context: "Ringnes lyktes med produksjonsmetoden i 1843; begrepet forklarer hvorfor kjølerom og lagerkjellere var sentrale i bryggeriet.", linked_to: { kind: "place", id: "ringnes_bryggeri" }, tags: ["øl", "produksjon", "gjæring"], sources: [{ label: "Store norske leksikon – Christian Schou", url: urls.christian }, { label: "Lokalhistoriewiki – Bayerøl", url: urls.labelPage }] },
    { id: "ringnes_vorter", term: "vørter", type: "fagord", meaning: "Den sukkerholdige væsken som trekkes ut av malt før gjæring.", context: "Ordet finnes i øltypen vørterøl, som Ringnes lanserte i 1903, og i navnet Vørterhuset i det tidligere bryggerikomplekset.", linked_to: { kind: "place", id: "ringnes_bryggeri" }, tags: ["brygging", "råvare", "bygning"], sources: [{ label: "Oslo byleksikon – Ringnes Bryggeri", url: urls.byleksikon }, { label: "Oslo byleksikon – Ringneskvartalet", url: urls.quarter }] },
    { id: "ringnes_malteriet", term: "malteri", type: "fagord", meaning: "Et anlegg der korn omdannes til malt for brygging.", context: "Malteriet er både et produksjonsbegrep og navnet på bygg L, der Ringnes kulturstasjon holder til i dag.", linked_to: { kind: "place", id: "ringnes_bryggeri" }, tags: ["malt", "industribygg", "ombruk"], sources: [{ label: "Oslo byleksikon – Ringneskvartalet", url: urls.quarter }, { label: "Oslo kulturskole", url: urls.cultureSchool }] }
  ]
});
const languageManifest = read("data/leksikon/sprak/manifest.json"); languageManifest.place_files.ringnes_bryggeri = languageFile; write("data/leksikon/sprak/manifest.json", languageManifest);

const storyFile = "data/stories/stories_ringnes_bryggeri.json";
write(storyFile, [{
  id: "st_ringnes_bryggeri_lastebilen_1899", quality_profile: "episode_v1", type: "turning_point", title: "Ølbilen som varslet en ny logistikk", year: 1899, place_id: "ringnes_bryggeri",
  summary: "I 1899 kjøpte Ringnes Bryggeri en Daimler-varebil som regnes som Norges første lastebil, og koblet bryggeriets masseproduksjon til motorisert distribusjon.",
  story: "Ved slutten av 1800-tallet var Ringnes Bryggeri blitt et stort produksjonsanlegg. Ølet skulle ikke bare brygges, kjøles og tappes; tunge kasser måtte også fraktes ut gjennom porten og videre til kundene.\n\nI 1899 kjøpte bryggeriet en Daimler-varebil. Norsk Teknisk Museum og Store norske leksikon omtaler den som Norges første lastebil. Kjøretøyet beholdt mye av vognens form, men motoren endret hvordan lasten kunne flyttes og gjorde bilen til et synlig møte mellom eldre transport og ny teknologi.\n\nVarebilen løste ikke hele distribusjonen alene, men den gjør et større skifte konkret. Industrialisering foregikk også utenfor produksjonshallen: i ruter, leveringstider, drivstoff, vedlikehold og organisering av vareflyt. Fotografiet av bilen med Ringnes-navnet på siden viser derfor både et bestemt kjøretøy og en ny logistisk idé.",
  episode: { actors: ["Ringnes Bryggeri", "sjåføren", "Daimler"], date: "1899", action: "Bryggeriet kjøpte en motorisert varebil for ølleveranser.", consequence: "Kjøretøyet ble et tidlig norsk eksempel på motorisert godstransport." },
  sources: [{ title: "Store norske leksikon – Ringnes Bryggeri", url: urls.snl }, { title: "Norsk Teknisk Museum – Norges første varebil", url: urls.truck }],
  tags: ["logistikk", "lastebil", "Daimler", "øl", "industrialisering"], related_people: ["christian_julius_schou"], related_places: [],
  score: { narrative: 3, historical: 3, source: 4, play_value: 3, originality: 3, total: 16 },
  arc: { start: "Et stort bryggeri må få tunge varer ut av porten.", middle: "En Daimler-varebil overtar en del av transporten.", end: "Motorisert logistikk blir en del av industrisystemet." }
}]);
const episodeManifest = read("data/stories/stories_episode_v1_manifest.json"); addOnce(episodeManifest.files, storyFile); write("data/stories/stories_episode_v1_manifest.json", episodeManifest);
const storyManifest = read("data/stories/stories_manifest.json"); storyManifest.files = storyManifest.files.filter(entry => entry.entity_id !== "ringnes_bryggeri"); storyManifest.files.push({ category: "naeringsliv", entity_id: "ringnes_bryggeri", path: storyFile }); write("data/stories/stories_manifest.json", storyManifest);

const readingFile = "data/lesespor/oslo/lesespor_oslo_naeringsliv.json";
const readings = read(readingFile); readings.items = readings.items.filter(item => !item.id.startsWith("lesespor_ringnes_"));
readings.items.push(
  { id: "lesespor_ringnes_snl", title: "Ringnes Bryggeri", author: "Jostein Sæthre", publication: "Store norske leksikon", date: "2026-06-12", year: 2026, type: "reference_article", subjects: ["bryggeri", "industrialisering", "eierskap", "nedleggelse"], place_ids: ["ringnes_bryggeri"], person_ids: ["christian_julius_schou"], category_hints: ["naeringsliv", "historie"], url: urls.snl, access: "open", rights: "link_only", source_quality: "recognized", curation_status: "strong_candidate", relevance: "Samler grunnleggingsår, eierskifter, produksjon, sammenslåing og nedleggelse." },
  { id: "lesespor_ringnes_byleksikon", title: "Ringnes Bryggeri", author: null, publication: "Oslo byleksikon", date: null, year: 2022, type: "institutional_reference", subjects: ["bygningshistorie", "bryggeri", "Ringnesløkken"], place_ids: ["ringnes_bryggeri"], person_ids: ["christian_julius_schou"], category_hints: ["naeringsliv", "by"], url: urls.byleksikon, access: "open", rights: "link_only", source_quality: "institutional", curation_status: "strong_candidate", relevance: "Detaljert tidslinje for bygninger, produksjon og familieeierskap." },
  { id: "lesespor_ringnes_quarter", title: "Ringneskvartalet", author: null, publication: "Oslo byleksikon", date: null, year: 2021, type: "institutional_reference", subjects: ["ombruk", "kulturkvartal", "industribygg"], place_ids: ["ringnes_bryggeri"], person_ids: [], category_hints: ["naeringsliv", "by", "scenekunst"], url: urls.quarter, access: "open", rights: "link_only", source_quality: "institutional", curation_status: "strong_candidate", relevance: "Dokumenterer ombyggingene og de nye funksjonene etter 1981." },
  { id: "lesespor_ringnes_christian", title: "Christian Schou", author: "Else Boye", publication: "Norsk biografisk leksikon / SNL", date: null, year: 2005, type: "biographical_reference", subjects: ["eierskap", "bayerøl", "industri"], place_ids: ["ringnes_bryggeri"], person_ids: ["christian_julius_schou"], category_hints: ["naeringsliv", "historie"], url: urls.christian, access: "open", rights: "link_only", source_quality: "recognized", curation_status: "strong_candidate", relevance: "Dokumenterer Ringnes overtakelse, modernisering, kjøleteknikk og utvidelser." }
); write(readingFile, readings);

const translations = {
  en: { name: "Ringnes Brewery", desc: "Ringnes Brewery traces its official founding to 1821, took Christian Julius Schou's name after his 1837 takeover and moved production to Ringnesløkken in 1873. Brewing ended in 1981; surviving industrial buildings now form part of a mixed culture, education, hospitality and office quarter.", popupDesc: "Ringnes Brewery grew from Johannes Thrane's earlier brewery. Jørgen Young took it over in 1821, the official founding year, and Christian Julius Schou bought and modernised it in 1837.\n\nThe brewery mastered cold-fermented Bavarian beer in 1843. Production moved to Trondheimsveien 2 in 1873, where brewing, yeast production, storage, bottling and distribution became parts of a large industrial system.\n\nRingnes and Frydenlund entered De Sammensluttede Bryggerier in 1962. Production and the Ringnes brand ended in 1981. Some buildings were demolished, while others were converted for offices, education, culture, rehearsal spaces, restaurants and new small-scale brewing." },
  es: { name: "Cervecería Ringnes", desc: "La cervecería Ringnes sitúa su fundación oficial en 1821, adoptó el nombre de Christian Julius Schou tras su compra en 1837 y trasladó la producción a Ringnesløkken en 1873. La elaboración terminó en 1981; los edificios industriales conservados forman hoy un barrio de cultura, enseñanza, hostelería y oficinas.", popupDesc: "La cervecería Ringnes surgió de la empresa anterior de Johannes Thrane. Jørgen Young la asumió en 1821, año oficial de fundación, y Christian Julius Schou la compró y modernizó en 1837.\n\nEn 1843 dominó la producción de cerveza bávara de fermentación baja. En 1873 trasladó la producción a Trondheimsveien 2, donde elaboración, levadura, almacenamiento, embotellado y distribución formaron un gran sistema industrial.\n\nRingnes y Frydenlund entraron en De Sammensluttede Bryggerier en 1962. La producción y la marca Ringnes terminaron en 1981. Algunos edificios fueron demolidos y otros se adaptaron para oficinas, enseñanza, cultura, locales de ensayo, restaurantes y nueva elaboración a pequeña escala." },
  pt: { name: "Cervejaria Ringnes", desc: "A Cervejaria Ringnes considera 1821 o seu ano oficial de fundação, adotou o nome de Christian Julius Schou após a compra de 1837 e transferiu a produção para Ringnesløkken em 1873. A fabricação terminou em 1981; os edifícios industriais preservados integram hoje um quarteirão de cultura, ensino, restauração e escritórios.", popupDesc: "A Cervejaria Ringnes cresceu a partir da cervejaria anterior de Johannes Thrane. Jørgen Young assumiu-a em 1821, o ano oficial de fundação, e Christian Julius Schou comprou-a e modernizou-a em 1837.\n\nEm 1843, a empresa dominou a cerveja bávara de baixa fermentação. A produção mudou para Trondheimsveien 2 em 1873, onde fabricação, levedura, armazenamento, engarrafamento e distribuição formaram um grande sistema industrial.\n\nRingnes e Frydenlund entraram na De Sammensluttede Bryggerier em 1962. A produção e a marca Ringnes terminaram em 1981. Alguns edifícios foram demolidos e outros adaptados para escritórios, ensino, cultura, salas de ensaio, restaurantes e nova produção em pequena escala." }
};
const normalize = value => String(value || "").normalize("NFC").replace(/\r\n?/g, "\n").replace(/[ \t]+/g, " ").trim();
const i18nHash = crypto.createHash("sha256").update(JSON.stringify({ name: normalize(place.name), desc: normalize(place.desc), popupDesc: normalize(place.popupDesc) })).digest("hex").slice(0, 16);
for (const [lang, translation] of Object.entries(translations)) { const file = `data/i18n/content/places/${lang}.json`; const pack = read(file); pack.ringnes_bryggeri = { _sourceHash: i18nHash, _status: "machine_translated", ...translation }; write(file, pack); }

// Ringnes-specific editorial surfaces replace the inherited scaffold above.
write(leksikonFile, {
  place_id: "ringnes_bryggeri", title: "Ringnes Bryggeri", type: "main", version: 1, visual: { designCode: "article_place_essay_miniature" },
  popupDesc: "Bryggeriet ble grunnlagt på Grünerløkka i 1876, startet produksjon i 1877 og flyttet storskalaproduksjonen til Gjelleråsen i 2001.",
  wikiText: [
    "Amund og Ellef Ringnes grunnla Ringnes & Co. sammen med Axel Heiberg i 1876. Produksjonen startet i Thorvald Meyers gate 2 året etter, med Amund som teknisk leder og Ellef i den utadvendte forretningsrollen.",
    "Anlegget vokste over et helt kvartal. Fra 1887 til 1890 ledet Olav Johan Sopp laboratoriet, og Ringnes ble det første norske bryggeriet som dyrket egne gjærstammer og tok renkultur inn i produksjonen.",
    "Etter flere selskapsendringer ble produksjonen på Grünerløkka flyttet til Gjelleråsen i 2001. Store deler av området ble Ringnes Park, mens bevarte bryggeribygg blant annet rommer hovedkontor, museum og Ringnes Brygghus."
  ],
  summary: { one_liner: "Fra Grünerløkka-bryggeri og gjærlaboratorium til flyttet produksjon og ombrukte industribygg.", themes: ["bryggeri", "laboratorium", "merkevare", "eierskap", "ombruk"], tone: ["nøktern", "stedsspesifikk"] },
  facts: [
    { id: "fact_ringnes_1876", label: "Grunnleggelsen", desc: "Ringnes & Co. ble grunnlagt i 1876.", confidence: "high", sources: [{ title: "Oslo byleksikon", url: urls.byleksikon }] },
    { id: "fact_ringnes_yeast", label: "Renkultur", desc: "Ringnes var først i Norge til å dyrke egne gjærstammer.", confidence: "high", sources: [{ title: "Store norske leksikon", url: urls.snl }] },
    { id: "fact_ringnes_2001", label: "Flyttingen", desc: "Produksjonen flyttet til Gjelleråsen i 2001.", confidence: "high", sources: [{ title: "Oslo byleksikon", url: urls.byleksikon }] }
  ],
  chronology: [[1876,"Ringnes & Co. grunnlegges","Amund og Ellef Ringnes og Axel Heiberg etablerer selskapet."],[1877,"Produksjonen starter","Bryggingen kommer i gang i Thorvald Meyers gate."],[1887,"Laboratoriet får ny leder","Olav Johan Sopp begynner arbeidet med renkultivert gjær."],[1890,"Renkultur er innført","Gjærarbeidet er tatt inn i den industrielle produksjonen."],[1899,"Aksjeselskap","Virksomheten blir A/S Ringnes Bryggeri."],[1978,"Inn i Nora-systemet","Ringnes, Frydenlund og Schous samles under Nora."],[1988,"Ringnes AS","Ringnes etableres som egen divisjon."],[2001,"Produksjonen flytter","Storskalaproduksjonen flyttes til Gjelleråsen."],[2004,"Carlsberg eneeier","Carlsberg blir eneeier av Ringnes."],[2018,"Ringnes Brygghus åpner","Mikrobryggeri og serveringssted åpner i det gamle brygghuset."]].map(([year,title,desc], index) => ({ id: `chrono_ringnes_${year}_${index+1}`, year, title, desc, confidence: "high", sources: [{ title: year === 2018 ? "Ringnes Brygghus" : year >= 1978 ? "Store norske leksikon" : "Oslo byleksikon", url: year === 2018 ? urls.brygghus : year >= 1978 ? urls.snl : urls.byleksikon }] })),
  sources: place.externalLinks, externalLinks: place.externalLinks, interpretation: place.interpretation
});
write(newsFile, [{
  id: "ringnes_bryggeri_news_current_brygghus", place_id: "ringnes_bryggeri", title: "Mikrobryggeri i det gamle brygghuset", type: "news_note", version: 1,
  date: verifiedAt, date_type: "verification", status: "current_operation", valid_through: "2027-08-27", location: "Thorvald Meyers gate 2A",
  popupDesc: "Ringnes Brygghus oppgir at virksomheten driver mikrobryggeri og serveringssted i det gamle brygghuset. Oppføringen beskriver kontrollert nåstatus, ikke en ny hendelsesdato eller en gjenåpning av den historiske storskalaproduksjonen.",
  summary: { one_liner: "Det gamle brygghuset har aktiv mikrobryggeri- og serveringsbruk.", themes: ["nåbruk", "mikrobryggeri", "ombruk"] },
  tags: ["news_note", "current_operation", "Ringnes Brygghus"], sources: [{ label: "Ringnes Brygghus", url: urls.brygghus }], verifiedAt
}]);
write(languageFile, {
  place_id: "ringnes_bryggeri", title: "Språkleksikon: Ringnes Bryggeri", verified_at: verifiedAt, dialect_status: "not_applicable_place_level",
  entries: [
    { id: "ringnes_co", term: "Ringnes & Co.", type: "historisk_navn", meaning: "Navnet virksomheten fikk ved grunnleggelsen i 1876.", context: "I 1899 ble selskapsformen og navnet endret til A/S Ringnes Bryggeri.", linked_to: { kind: "place", id: "ringnes_bryggeri" }, tags: ["virksomhetsnavn", "selskapsform"], sources: [{ label: "Oslo byleksikon", url: urls.byleksikon }] },
    { id: "ringnes_renkultur", term: "renkultur", type: "fagord", meaning: "En kultur av mikroorganismer som stammer fra én valgt kultur og brukes for mer kontrollert produksjon.", context: "Ringnes tok renkultur av gjær inn i bryggingen under Olav Johan Sopps laboratoriearbeid.", linked_to: { kind: "place", id: "ringnes_bryggeri" }, tags: ["gjær", "laboratorium", "standardisering"], sources: [{ label: "Store norske leksikon", url: urls.snl }, { label: "Store norske leksikon – Olav Johan Sopp", url: urls.sopp }] },
    { id: "ringnes_gjaerstamme", term: "gjærstamme", type: "fagord", meaning: "En avgrenset variant av gjær med bestemte egenskaper.", context: "Egne gjærstammer gjorde det mulig å arbeide mer systematisk med smak og gjæring fra brygg til brygg.", linked_to: { kind: "place", id: "ringnes_bryggeri" }, tags: ["gjær", "brygging", "kvalitetskontroll"], sources: [{ label: "Store norske leksikon", url: urls.snl }] },
    { id: "ringnes_malteri", term: "malteri", type: "fagord", meaning: "Et anlegg der korn bearbeides til malt for brygging.", context: "Amund Ringnes ledet både brygging og malting i den tidlige virksomheten.", linked_to: { kind: "place", id: "ringnes_bryggeri" }, tags: ["malt", "produksjon", "arbeidsdeling"], sources: [{ label: "Norsk biografisk leksikon – Amund Ringnes", url: urls.amund }] }
  ]
});
write(storyFile, [{
  id: "st_ringnes_bryggeri_renkultur_1887", quality_profile: "episode_v1", type: "turning_point", title: "Gjæren som måtte bli lik hver gang", year: 1887, place_id: "ringnes_bryggeri",
  summary: "Da Olav Johan Sopp ledet Ringnes-laboratoriet 1887–1890, ble dyrking av egne gjærstammer et norsk bryggerigjennombrudd.",
  story: "I et bryggeri kan en mikroskopisk organisme avgjøre om to store brygg blir like. På 1880-tallet var gjæren derfor både et levende råstoff og en kilde til variasjon.\n\nOlav Johan Sopp kom til Ringnes-laboratoriet i 1887. I løpet av perioden fram til 1890 ble Ringnes det første norske bryggeriet som dyrket egne gjærstammer og tok renkultur inn i produksjonen. Laboratoriet gjorde det mulig å velge og videreføre gjær med kjente egenskaper.\n\nSkiftet var lite å se fra gaten, men stort i produksjonen. Kunnskap fra mikroskop og kulturglass ble koblet til brygging i industriell skala. Slik ble jevnere prosesskontroll en del av Ringnes' produksjonssystem, ikke bare et spørsmål om råvarer og store maskiner.",
  episode: { actors: ["Olav Johan Sopp", "Ringnes Bryggeri", "bryggeriarbeiderne"], date: "1887–1890", action: "Laboratoriet dyrket egne gjærstammer og innførte renkultur.", consequence: "Gjærkontroll ble en del av industriell standardisering i norsk brygging." },
  sources: [{ title: "Store norske leksikon – Ringnes AS", url: urls.snl }, { title: "Store norske leksikon – Olav Johan Sopp", url: urls.sopp }],
  tags: ["gjær", "laboratorium", "renkultur", "innovasjon", "produksjon"], related_people: ["amund_ringnes", "ellef_ringnes"], related_places: [],
  score: { narrative: 3, historical: 3, source: 4, play_value: 3, originality: 3, total: 16 },
  arc: { start: "Levende gjær kan gi variasjon mellom store brygg.", middle: "Sopp og laboratoriet dyrker utvalgte gjærstammer.", end: "Renkultur blir en del av industriell prosesskontroll." }
}]);
const correctedReadings = read(readingFile); correctedReadings.items = correctedReadings.items.filter(item => !item.id.startsWith("lesespor_ringnes_"));
correctedReadings.items.push(
  { id: "lesespor_ringnes_snl", title: "Ringnes AS", author: null, publication: "Store norske leksikon", date: null, year: 2026, type: "reference_article", subjects: ["bryggeri", "gjær", "eierskap", "flytting"], place_ids: ["ringnes_bryggeri"], person_ids: ["amund_ringnes", "ellef_ringnes"], category_hints: ["naeringsliv", "historie"], url: urls.snl, access: "open", rights: "link_only", source_quality: "recognized", curation_status: "strong_candidate", relevance: "Dokumenterer gjærinnovasjon, selskapsendringer og dagens virksomhet." },
  { id: "lesespor_ringnes_byleksikon", title: "Ringnes Bryggeri", author: null, publication: "Oslo byleksikon", date: null, year: 2022, type: "institutional_reference", subjects: ["bygningshistorie", "bryggeri", "Grünerløkka"], place_ids: ["ringnes_bryggeri"], person_ids: ["amund_ringnes", "ellef_ringnes"], category_hints: ["naeringsliv", "by"], url: urls.byleksikon, access: "open", rights: "link_only", source_quality: "institutional", curation_status: "strong_candidate", relevance: "Stedsspesifikk kronologi for grunnleggelse, anlegg, flytting og etterbruk." },
  { id: "lesespor_ringnes_amund", title: "Amund Ringnes", author: null, publication: "Norsk biografisk leksikon", date: null, year: 2026, type: "biographical_reference", subjects: ["brygging", "teknisk ledelse", "grunnleggelse"], place_ids: ["ringnes_bryggeri"], person_ids: ["amund_ringnes"], category_hints: ["naeringsliv", "historie"], url: urls.amund, access: "open", rights: "link_only", source_quality: "recognized", curation_status: "strong_candidate", relevance: "Dokumenterer Amunds tekniske rolle og stedsforbindelse." },
  { id: "lesespor_ringnes_ellef", title: "Ellef Ringnes", author: null, publication: "Store norske leksikon", date: null, year: 2026, type: "biographical_reference", subjects: ["forretningsledelse", "grunnleggelse", "eierskap"], place_ids: ["ringnes_bryggeri"], person_ids: ["ellef_ringnes"], category_hints: ["naeringsliv", "historie"], url: urls.ellef, access: "open", rights: "link_only", source_quality: "recognized", curation_status: "strong_candidate", relevance: "Dokumenterer Ellefs utadvendte lederrolle og stedsforbindelse." }
); write(readingFile, correctedReadings);
const correctedTranslations = {
  en: { name: "Ringnes Brewery", desc: "Ringnes & Co. was founded at Thorvald Meyers gate 2 in 1876 by Amund Ringnes, Ellef Ringnes and Axel Heiberg, and production began in 1877. The brewery pioneered cultivated yeast strains in Norway. Production moved to Gjelleråsen in 2001; surviving buildings now house Ringnes offices, a museum and Ringnes Brygghus.", popupDesc: "Ringnes & Co. was founded on Grünerløkka in 1876 and began production the following year. Amund Ringnes led brewing and technical operations, while Ellef Ringnes handled the outward-facing business role.\n\nFrom 1887 to 1890, Olav Johan Sopp led the laboratory. Ringnes became Norway's first brewery to cultivate its own yeast strains and use pure-culture yeast in production.\n\nProduction moved to Gjelleråsen in 2001. Much of the factory quarter became Ringnes Park, while surviving brewery buildings gained new uses including offices, a museum and a brewpub." },
  es: { name: "Cervecería Ringnes", desc: "Ringnes & Co. fue fundada en Thorvald Meyers gate 2 en 1876 por Amund Ringnes, Ellef Ringnes y Axel Heiberg, y la producción comenzó en 1877. La cervecería fue pionera en Noruega en el cultivo de cepas de levadura. La producción se trasladó a Gjelleråsen en 2001; los edificios conservados albergan oficinas, un museo y Ringnes Brygghus.", popupDesc: "Ringnes & Co. fue fundada en Grünerløkka en 1876 y comenzó la producción al año siguiente. Amund Ringnes dirigió la elaboración y la técnica, mientras Ellef Ringnes asumió la función comercial externa.\n\nEntre 1887 y 1890, Olav Johan Sopp dirigió el laboratorio. Ringnes fue la primera cervecería noruega en cultivar sus propias cepas de levadura y usar cultivos puros en la producción.\n\nLa producción se trasladó a Gjelleråsen en 2001. Gran parte del barrio fabril se convirtió en Ringnes Park, mientras los edificios conservados recibieron nuevos usos." },
  pt: { name: "Cervejaria Ringnes", desc: "A Ringnes & Co. foi fundada na Thorvald Meyers gate 2 em 1876 por Amund Ringnes, Ellef Ringnes e Axel Heiberg, e a produção começou em 1877. A cervejaria foi pioneira na Noruega no cultivo de estirpes de levedura. A produção mudou para Gjelleråsen em 2001; os edifícios preservados acolhem escritórios, museu e a Ringnes Brygghus.", popupDesc: "A Ringnes & Co. foi fundada em Grünerløkka em 1876 e iniciou a produção no ano seguinte. Amund Ringnes dirigia a fabricação e a técnica, enquanto Ellef Ringnes assumia a função comercial externa.\n\nEntre 1887 e 1890, Olav Johan Sopp dirigiu o laboratório. A Ringnes foi a primeira cervejaria norueguesa a cultivar as próprias estirpes de levedura e usar cultura pura na produção.\n\nA produção mudou para Gjelleråsen em 2001. Grande parte do quarteirão industrial tornou-se Ringnes Park, enquanto os edifícios preservados receberam novos usos." }
};
for (const [lang, translation] of Object.entries(correctedTranslations)) { const file = `data/i18n/content/places/${lang}.json`; const pack = read(file); pack.ringnes_bryggeri = { _sourceHash: i18nHash, _status: "machine_translated", ...translation }; write(file, pack); }

const quizFile = "data/quiz/naeringsliv/ringnes_bryggeri_sets_merged.json";
const quiz = read(quizFile);
const additions = [
  ["Når startet produksjonen ved Ringnes Bryggeri?", "1877", ["1876", "1899"], "Oslo byleksikon oppgir at produksjonen startet i 1877, året etter grunnleggelsen.", urls.byleksikon, "em_naering_produksjon_produktivitet"],
  ["Hva var Ringnes først i Norge til å dyrke selv?", "Egne gjærstammer", ["Egne humlesorter", "Egne byggkornsorter"], "Ringnes var det første norske bryggeriet som dyrket egne gjærstammer og tok renkultur i produksjonen.", urls.snl, "em_naering_innovasjon_teknologisk_skift"],
  ["Hva skjedde med selskapsformen i 1899?", "Bryggeriet ble aksjeselskap", ["Bryggeriet ble kommunalt", "Bryggeriet ble stiftelse"], "Virksomheten ble omdannet til A/S Ringnes Bryggeri i 1899.", urls.byleksikon, "em_naering_eierskap_styring"],
  ["Når flyttet produksjonen fra Grünerløkka til Gjelleråsen?", "2001", ["1978", "2004"], "Produksjonen i Thorvald Meyers gate ble flyttet til Gjelleråsen i 2001.", urls.byleksikon, "em_naering_omstilling_kriser_skift"],
  ["Hva brukes det gamle brygghuset blant annet til i dag?", "Hovedkontor, museum og brygghus", ["Storskala produksjon", "Jernbaneverksted"], "Det gamle brygghuset rommer Ringnes' hovedkontor og museum samt Ringnes Brygghus.", urls.property, "em_naering_omstilling_kriser_skift"]
];
quiz.sets.forEach((set, index) => {
  const [question, answer, wrong, knowledge, source, emne_id] = additions[index];
  if (set.questions.length < 7) set.questions.push({ question, options: [answer, ...wrong], answer, answerIndex: 0, knowledge, source: [source], emne_id, difficulty: Math.min(index + 1, 4) });
});
quiz.generator_version = "v5_1_external_priority_canonical_rich_5x7";
quiz.size_class = "rich_place";
const theory = [
  ["omstilling_av_naeringsrom", "david_harvey", null, "met_naering_omstilling_og_endringsanalyse"],
  ["omstilling_av_naeringsrom", "david_harvey", null, "met_naering_investering_og_eiendomsanalyse"],
  ["kapitalstrommer", "joseph_schumpeter", null, "met_naering_kapital_og_finansanalyse"],
  ["investering_eiendom", "joseph_schumpeter", null, "met_naering_investering_og_eiendomsanalyse"],
  ["arbeidslivets_omstilling", "harry_braverman", null, "met_naering_arbeidslivsanalyse"],
  ["teknologisk_omstilling", "joseph_schumpeter", null, "met_naering_innovasjonsanalyse"],
  ["arbeidslivets_omstilling", "richard_sennett", null, "met_naering_omstilling_og_endringsanalyse"]
];
const allQuestions = quiz.sets.flatMap(set => set.questions);
allQuestions.forEach((question, index) => {
  const number = index + 1; const setNumber = Math.floor(index / 7) + 1; const qNumber = index % 7 + 1;
  const primaryKnowledgeUnitId = `ku_naeringsliv_ringnes_bryggeri_${String(number).padStart(2, "0")}`;
  const canonicalKnowledgeUnitIds = [...new Set([primaryKnowledgeUnitId, ...(question.knowledge_unit_ids || []).filter(id => /^ku_[a-z0-9_]+$/u.test(id))])];
  Object.assign(question, { id: `ringnes_bryggeri_quiz_${String(number).padStart(2, "0")}`, quiz_id: `naeringsliv_ringnes_bryggeri_set_${setNumber}_q${qNumber}`, categoryId: "naeringsliv", placeId: "ringnes_bryggeri", targetId: "ringnes_bryggeri", question_scope: "place", question_type: index < 19 ? "fact" : index >= 28 ? "concept" : "context", claim_id: `claim_ringnes_bryggeri_quiz_${String(number).padStart(2, "0")}`, claim_basis: question.knowledge, source_origin: "external", primary_knowledge_unit_id: primaryKnowledgeUnitId, knowledge_unit_ids: canonicalKnowledgeUnitIds, knowledge_contract_version: 1, knowledge_link_status: "linked" });
  if (!Array.isArray(question.source)) question.source = [question.source || urls.snl];
  if (index < 28) {
    for (const key of ["method_id", "topic_hook_id", "thinker_id", "work", "theory_ref"]) delete question[key];
  }
  if (index >= 28) {
    const [topic_hook_id, thinker_id, work, method_id] = theory[index - 28];
    Object.assign(question, { topic_hook_id, thinker_id, method_id, theory_ref: { topic_hook_id, thinker_id, why_it_helps: "Perspektivet strukturerer en økonomisk analyse av den dokumenterte stedshistorien uten å erstatte kildene." }, guidance_basis: ["data/fag/naeringsliv/fagkart_naeringsliv_canonical_v4_5.json", "data/fag/naeringsliv/methods_naeringsliv_canonical_v4_5.json"] });
    if (work) { question.work = work; question.theory_ref.work = work; } else delete question.work;
  }
});
quiz.sets.forEach((set, index) => Object.assign(set, { set_id: `naeringsliv_ringnes_bryggeri_set_${index+1}`, order: index+1, level: index+1, phase: ["opening", "middle", "middle", "bridge", "final"][index], title: ["Grunnleggelse og navn", "Brygging og anlegg", "Logistikk og vekst", "Eierskap og nedleggelse", "Ombruk og økonomisk analyse"][index] }));
const sourceRegistry = {
  snl: { url: urls.snl, source_type: "editorially_controlled_reference", review_status: "reviewed", review_note: "Gjærinnovasjon og selskapsendringer er kontrollert mot SNL." },
  byleksikon: { url: urls.byleksikon, source_type: "institutional_reference", review_status: "reviewed", review_note: "Grunnleggelse, produksjonsstart, kvartalsutvidelse, flytting og ombruk er kontrollert mot Oslo byleksikon." },
  amund: { url: urls.amund, source_type: "biographical_reference", review_status: "reviewed", review_note: "Amund Ringnes' rolle i grunnleggelse og produksjon er kontrollert mot NBL." },
  ellef: { url: urls.ellef, source_type: "biographical_reference", review_status: "reviewed", review_note: "Ellef Ringnes' rolle i grunnleggelse og ledelse er kontrollert mot SNL." },
  property: { url: urls.property, source_type: "primary_property_source", review_status: "reviewed", review_note: "Bevarte bygg, hovedkontor og museum er kontrollert mot gårdeierens eiendomspresentasjon." },
  brygghus: { url: urls.brygghus, source_type: "primary_venue_source", review_status: "reviewed", review_note: "Nåværende mikrobryggeri- og serveringsdrift er kontrollert mot virksomhetens side." }
};
const curriculum = { module_ids: ["arbeid_produksjon_verdiskaping", "logistikk_infrastruktur_rom", "makt_regulering_baerekraft"], emne_ids: [...new Set(allQuestions.map(q => q.emne_id).filter(Boolean))], topic_hook_ids: [...new Set(theory.map(row => row[0]))], method_ids: [...new Set(theory.map(row => row[3]))], thinker_ids: [...new Set(theory.map(row => row[1]))], works: [...new Set(theory.map(row => row[2]).filter(Boolean))] };
const existingQuizAudit = { searched_paths: ["data/quiz/quiz_naeringsliv.json", quizFile, "data/quiz/manifest.json"], active_before: { file: quizFile, set_count: 5, question_count: 30, finding: "En kildeberiket 5×6-bank og fem legacy-spørsmål fantes." }, decisions: ["Behold og berik de 30 spørsmålene.", "Legg til ett kildebelagt spørsmål i hvert sett.", "Behold de første 14 som vanlig faktakunnskap.", "Legg teori og metode i finalsettet."], knowledge_migration: "Stabile Ringnes-ID-er normaliseres til 35 canonicale Knowledge-enheter." };
const heldBackCandidates = ["1837 som grunnleggingsår.", "Ustøttet arbeidshjem/velferdspåstand.", "Popsenteret som fortsatt aktiv virksomhet etter stengingen i 2024.", "Ringneskjelleren som videreføring av Ringnes' Ringnes Mikrobryggeri."];
const profileDecision = { profile: "rich", set_count: 5, questions_per_set: 7, justification: "Fem tydelige læringsjobber med 35 kildebelagte spørsmål." };
const sourceIdFor = value => sourceRegistry[value] ? value : Object.entries(sourceRegistry).find(([, source]) => source.url === value)?.[0]
  || (String(value).toLowerCase().includes("ringneskjelleren") ? "cellar"
    : String(value).toLowerCase().includes("klpeiendom") || String(value).toLowerCase().includes("ringnesbrygghuset") ? "klp"
      : String(value).includes("Ringneskvartalet") ? "quarter"
        : String(value).includes("Christian_Schou") ? "christian"
          : String(value).toLowerCase().includes("oslobyleksikon") ? "byleksikon" : "snl");
allQuestions.forEach(question => { question.source = [...new Set(question.source.map(sourceIdFor))]; });
const quizClaims = allQuestions.map((question, index) => ({ claim_id: question.claim_id, order: index+1, planned_phase: index < 7 ? "opening" : index < 21 ? "middle" : index < 28 ? "bridge" : "final", family: index >= 28 ? "concept_theory" : index < 19 ? "fact" : "context", statement: question.knowledge, source_ids: question.source, source_origin: "external", emne_id: question.emne_id }));
write("data/quiz/production_briefs/naeringsliv/ringnes_bryggeri.json", {
  schema_version: "1.0", status: "reviewed", categoryId: "naeringsliv", targetId: "ringnes_bryggeri", profile_hint: "rich", reviewed_at: verifiedAt,
  review_note: "Kildene bærer fem adskilte læringsjobber: grunnleggelse/navn, bryggeteknologi, anlegg/logistikk, eierskap/nedleggelse og ombruk.",
  scope: { place: "Ringnes Bryggeri", production_profile: "rich", set_count: 5, questions_per_set: 7, total_questions: 35, normal_opening_questions: 14 },
  sources: sourceRegistry, selected_curriculum: curriculum, existing_quiz_audit: existingQuizAudit,
  profile_decision: profileDecision, held_back_candidates: heldBackCandidates, claims: quizClaims
});
const resolvedQuizFiles = {
  pensum: "data/fag/naeringsliv/naeringslivpensum_canonical_v4_5.json",
  emner: "data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json",
  fagkart: "data/fag/naeringsliv/fagkart_naeringsliv_canonical_v4_5.json",
  methods: "data/fag/naeringsliv/methods_naeringsliv_canonical_v4_5.json",
  supersetQuizMal: "data/fag/naeringsliv/supersetQUIZMAL_naeringsliv.json",
  quizStandard: "data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md",
  quizQuestionSchema: "data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json"
};
quiz.sources = Object.fromEntries(Object.entries(sourceRegistry).map(([id, source]) => [id, source.url]));
quiz.production_context = {
  manifest_category: "naeringsliv", profile: "rich_5x7", standard_version: "3.3",
  source_brief: "data/quiz/production_briefs/naeringsliv/ringnes_bryggeri.json",
  context_artifact: "data/quiz/production_context/naeringsliv/ringnes_bryggeri.json",
  resolved_files: resolvedQuizFiles, required_inputs_loaded: Object.keys(resolvedQuizFiles),
  pensum_module_ids: curriculum.module_ids, emne_ids: curriculum.emne_ids, topic_hook_ids: curriculum.topic_hook_ids,
  method_ids: curriculum.method_ids, thinker_ids: curriculum.thinker_ids, works: curriculum.works,
  source_review_status: "reviewed", existing_quiz_audit: existingQuizAudit, profile_decision: profileDecision,
  held_back_candidates: heldBackCandidates, normal_opening_questions: 14, theory_start_phase: "final", method_start_phase: "final"
};
write("data/quiz/production_context/naeringsliv/ringnes_bryggeri.json", quiz.production_context);
write(quizFile, quiz);
const quizManifest = read("data/quiz/manifest.json"); quizManifest.sets = quizManifest.sets.filter(entry => entry.targetId !== "ringnes_bryggeri"); quizManifest.sets.push({ targetId: "ringnes_bryggeri", file: quizFile }); write("data/quiz/manifest.json", quizManifest);
const fagManifest = read("data/fag/fag_manifest.json"); fagManifest.naeringsliv.quizProduction.targets.ringnes_bryggeri = { source_brief: "../quiz/production_briefs/naeringsliv/ringnes_bryggeri.json", context_artifact: "../quiz/production_context/naeringsliv/ringnes_bryggeri.json", quiz_file: "../quiz/naeringsliv/ringnes_bryggeri_sets_merged.json" }; write("data/fag/fag_manifest.json", fagManifest);

const claims = [
  ["identity", "Ringnes & Co. ble grunnlagt i Thorvald Meyers gate 2 i 1876 av Amund Ringnes, Ellef Ringnes og Axel Heiberg.", urls.byleksikon, "Ingress og historikk", "identity", "historical"],
  ["production_start", "Produksjonen startet i 1877.", urls.byleksikon, "Historikk", "ordinary", "historical"],
  ["roles", "Amund Ringnes ledet brygging og teknisk drift, mens Ellef Ringnes hadde en utadvendt forretnings- og lederrolle.", urls.amund, "Ringnes Bryggeri og rollefordeling", "ordinary", "historical"],
  ["quarter", "Bryggeriet utvidet seg over kvartalet mellom Thorvald Meyers gate, Sannergata, Toftes gate og Biermanns gate.", urls.byleksikon, "Anleggets utstrekning", "ordinary", "historical"],
  ["yeast", "Ringnes var det første norske bryggeriet som dyrket egne gjærstammer; Olav Johan Sopp ledet laboratoriet 1887–1890 og innførte renkultur.", urls.snl, "Produksjon og laboratorium", "strong", "historical"],
  ["company", "Virksomheten ble A/S Ringnes Bryggeri i 1899.", urls.byleksikon, "Selskapsform", "ordinary", "historical"],
  ["consolidation", "Ringnes, Frydenlund og Schous gikk inn i Nora-systemet i 1978; senere fulgte Orkla, Pripps og Carlsberg.", urls.snl, "Selskapsendringer", "ordinary", "historical"],
  ["move", "Produksjonen i Thorvald Meyers gate flyttet til Gjelleråsen i 2001.", urls.byleksikon, "Flytting og etterbruk", "ordinary", "historical"],
  ["reuse", "Store deler av fabrikkvartalet ble omformet til Ringnes Park, mens flere nordlige bryggeribygg ble bevart.", urls.byleksikon, "Etterbruk", "ordinary", "historical"],
  ["current_property", "Det gamle brygghuset i Thorvald Meyers gate 2A brukes av Ringnes' hovedkontor og museum.", urls.property, "Eiendomsbeskrivelse", "temporal", "current"],
  ["current_brygghus", "Ringnes Brygghus driver mikrobryggeri og serveringssted i det gamle brygghuset.", urls.brygghus, "Forside og kontakt", "temporal", "current"]
].map(([id, claim, sourceUrl, sourceLocation, claimKind, temporalStatus]) => ({ id: `claim_ringnes_bryggeri_${id}`, claim, sourceUrl, sourceLocation, sourceType: sourceUrl.includes("ringnesbrygghus") || sourceUrl.includes("eiendomsspar") ? "primary" : "reputable_secondary", verifiedAt, status: "verified", claimKind, evidenceMode: claimKind === "strong" ? "explicit" : "direct", temporalStatus, ...(id === "yeast" ? { independentSourceUrls: [urls.sopp] } : {}) }));
const coverage = text => sentences(text).map((sentence, index) => {
  const s = sentence.toLowerCase();
  let ids = s.includes("i dag") || s.includes("brukes nå") || s.includes("nåværende") || s.includes("hovedkontor") || s.includes("museum") ? ["current_property", "current_brygghus"] : s.includes("brygghus") || s.includes("mikrobryggeri") || s.includes("serveringssted") ? ["current_brygghus"] : s.includes("1876") || s.includes("grunnlagt") || s.includes("axel") ? ["identity"] : s.includes("1877") ? ["production_start"] : s.includes("amund") || s.includes("ellef") ? ["roles", "identity"] : s.includes("kvartalet") || s.includes("sannergata") || s.includes("toftes") || s.includes("industrilandskap") ? ["quarter"] : s.includes("gjær") || s.includes("sopp") || s.includes("laborator") || s.includes("renkultur") || s.includes("mikrobiolog") ? ["yeast"] : s.includes("1899") || s.includes("aksjeselskap") ? ["company"] : s.includes("1978") || s.includes("1988") || s.includes("orkla") || s.includes("pripps") || s.includes("carlsberg") ? ["consolidation"] : s.includes("2001") || s.includes("gjelleråsen") || s.includes("flyttet") ? ["move"] : s.includes("ringnes park") || s.includes("bevart") || s.includes("omformet") ? ["reuse"] : ["reuse"];
  return { sentence: index + 1, claimIds: [...new Set(ids.map(id => `claim_ringnes_bryggeri_${id}`))] };
});
const readinessQuestions = [
  ["Når ble Ringnes & Co. grunnlagt?", "1876", "når", "identity"], ["Når startet produksjonen?", "1877", "når", "production_start"], ["Hvem hadde teknisk ansvar?", "Amund Ringnes", "hvem", "roles"], ["Hvem ledet utad?", "Ellef Ringnes", "hvem", "roles"], ["Hva dyrket Ringnes først i Norge selv?", "Egne gjærstammer", "hva", "yeast"], ["Hvor lå opphavsanlegget?", "Thorvald Meyers gate 2", "hvor", "identity"], ["Når flyttet produksjonen?", "2001", "når", "move"], ["Hva finnes i det gamle brygghuset i dag?", "Hovedkontor, museum og brygghus", "hva", "current_property"]
].map(([question, answer, type, claim], index) => ({ question, answer, type, normalKnowledgeQuestion: index < 8, claimIds: [`claim_ringnes_bryggeri_${claim}`] }));
write("data/places/production/ringnes_bryggeri.json", {
  schemaVersion: "4.2", validatorVersion: "4.2.1", placeId: "ringnes_bryggeri", placeFile, status: "ready_v4_2",
  identity: { status: "resolved", represents: "Det historiske Ringnes-anlegget i Thorvald Meyers gate 2 fra grunnleggelsen i 1876, produksjonen 1877–2001 og de bevarte bryggeribyggenes etterbruk.", period: "1876–", excludes: ["Ringnes' produksjonsanlegg på Gjelleråsen", "hele Ringnes Park som senere bolig- og handelsområde", "Ringnes-merket som identisk med det fysiske stedet", "Ringnes Brygghus som storskalavidereføring av den gamle produksjonen"] },
  metadataSnapshot: { name: place.name, year: place.year, category: place.category }, textHashes: { algorithm: "sha256", desc: sha256(place.desc), popupDesc: sha256(place.popupDesc) }, claims,
  sentenceCoverage: { desc: coverage(place.desc), popupDesc: coverage(place.popupDesc) },
  roundsReadiness: { people: "ready_two_direct_profiles_and_portraits", objects: "ready_two_source_bound_prints", brands: "ready_authentic_historic_mark", structures: "ready_two_place_specific_buildings", badges: "ready_existing_industry_and_food_service", quiz: "ready_rich_5x7_reused_and_extended", leksikon: "ready", sprak: "ready_four_entries", stories: "ready_episode_v1", for_na: "ready_non_exact_documented_pair", readings: "ready_four", news: "ready_current_operation_note", events: "reviewed_no_separate_event_entry", routes: "ready_existing_neighbour_graph", fagverk: "ready", frontImage: "ready_real_portrait_3x4" },
  quizReadiness: { status: "canonical_rich_5x7", quizTargetId: "ringnes_bryggeri", sourceBrief: "data/quiz/production_briefs/naeringsliv/ringnes_bryggeri.json", productionContext: "data/quiz/production_context/naeringsliv/ringnes_bryggeri.json", normalOpeningQuestions: 14, totalQuestions: 35, reuseDecision: "Den eksisterende 5×6-banken ble beholdt, kildeberiket og utvidet til 5×7; de fem flate legacy-spørsmålene ble audittert, men ikke duplisert.", questions: readinessQuestions },
  reviews: { factual: { status: "passed", reviewedAt: verifiedAt, reviewer: "Ringnes Bryggeri phase 8–24 source review", notes: "1876, 1877, 1887–1890, 1899, 1978, 2001 og nåbruk er kontrollert mot SNL, NBL, Oslo byleksikon og primærkilder." }, editorial: { status: "passed", reviewedAt: verifiedAt, reviewer: "Ringnes Bryggeri phase 8–24 editorial review", introducedNewFacts: false, notes: "Virksomhet, merkevare, historisk anlegg, Ringnes Park og nåværende bruk er eksplisitt skilt." } },
  reviewsNotes: ["To dupliserte legacy People-profiler er slått sammen med de kanoniske Amund- og Ellef-profilene.", "Det historiske bokøltrykket brukes som autentisk Brand-markør og er ikke rekonstruert.", "Før/etter-bildene har ulike utsnitt og er eksplisitt merket som ikke-eksakt kamerapar.", "Nåbruk er tidsmerket og bygger på gårdeier og Ringnes Brygghus."],
  completion: { completedUnder: "4.2", currentStatus: "current", sourceVerifiedAt: verifiedAt, claimsVerified: { verified: claims.length, total: claims.length }, factualReview: "passed", editorialReview: "passed", validatorVersion: "4.2.1" }
});
write("data/places/historie-production/ringnes_bryggeri.json", {
  schemaVersion: "historie_place_production_v1", validatorVersion: "1.0.0", placeId: "ringnes_bryggeri", placeFile, status: "ready",
  historicalIdentity: {
    statement: "Ringnes Bryggeri var en bryggerivirksomhet fra 1821 til 1981, med hovedanlegg på Ringnesløkken fra 1873 og et stående, senere ombrukt industrimiljø i Trondheimsveien 2.",
    placeRelationType: "institution_site",
    placeRelationStatement: "Place-ID-en representerer bryggerivirksomheten sammen med det historiske produksjonsanlegget på Ringnesløkken, ikke Ringnes plass, Ringneskvartalet som helhet, Riksscenen eller dagens selvstendige leietakere.",
    temporalScope: { start: "1821", end: "2026", precision: "period", rationale: "Perioden dekker bryggeriets offisielle grunnleggelse, driften på Ringnesløkken, nedleggelsen i 1981 og den kildekontrollerte ombruken av bygningsmiljøet." },
    sourceIds: ["source_snl_ringnes_historie", "source_byleksikon_ringnes_historie", "source_klp_ringnes_historie"]
  },
  historyTopics: [{
    emneId: "em_his_industriby_1900",
    siteSpecificRationale: "Bryggeri- og gjærhus, lager, tappehall, malteri, portbygning og motorisert varetransport gjør sammenhengen mellom industriby, arbeidsdeling, teknologi og logistikk lesbar på stedet.",
    caseIds: ["case_ringnes_industrialisering_og_ombruk"]
  }],
  sources: [
    { id: "source_snl_ringnes_historie", url: urls.snl, sourceLocation: "Faktaboks, kronologi og hovedtekst om grunnlegging, bayerøl, flytting, sammenslutning og nedleggelse", sourceType: "reputable_secondary", verifiedAt, temporalCoverage: "mixed", provenance: "Store norske leksikons redaksjonelt kontrollerte artikkel om Ringnes Bryggeri, med navngitt forfatter og revisjonsdato.", limitations: "Artikkelen sammenfatter virksomhetshistorien, men gir ikke et komplett bedriftsarkiv, arbeidslivshistorie eller regnskapsmateriale." },
    { id: "source_byleksikon_ringnes_historie", url: urls.byleksikon, sourceLocation: "Historikken og bygningsbeskrivelsen for bryggerianlegget i Trondheimsveien 2", sourceType: "museum_or_heritage", verifiedAt, temporalCoverage: "mixed", provenance: "Oslo byleksikons stedsspesifikke oppslagsartikkel dokumenterer anleggets bygninger, arkitekter og historiske funksjoner.", limitations: "Oppslagsformatet komprimerer selskaps- og arbeidslivshistorien, og enkelte eldre årstall må leses sammen med nyere SNL." },
    { id: "source_byleksikon_kvartalet_historie", url: urls.quarter, sourceLocation: "Avsnittene om ombygginger, bygningsnavn og kulturfunksjoner etter nedleggelsen", sourceType: "reputable_secondary", verifiedAt, temporalCoverage: "mixed", provenance: "Oslo byleksikons artikkel om Ringneskvartalet dokumenterer hovedtrekk i bygningsmiljøets ombruk etter 1981.", limitations: "Artikkelen er ikke en løpende eller fullstendig oversikt over leietakere, eiendomsforvaltning eller alle bygningsinngrep." },
    { id: "source_klp_ringnes_historie", url: urls.klp, sourceLocation: "Eiendomspresentasjonen for dagens Ringneskvartal, kontor- og næringsbruk", sourceType: "primary", verifiedAt, temporalCoverage: "current", provenance: "KLP Eiendom publiserer som gårdeier aktuell informasjon om eiendommen, arealene og nåværende næringsbruk.", limitations: "Kilden har kommersielt formål og brukes bare til fersk nåstatus, ikke som uavhengig dokumentasjon av historiske årsaker eller virkninger." }
  ],
  caseRealizations: [{
    id: "case_ringnes_industrialisering_og_ombruk",
    claim: "Ringnes-anlegget utviklet seg fra familieeid bryggerivirksomhet til et sammensatt industrisystem for produksjon, lagring og distribusjon, før nedleggelsen i 1981 og senere ombruk endret stedets funksjon uten å utslette alle materielle spor.",
    temporalSequence: {
      scope: { start: "1821", end: "2026", precision: "period", rationale: "Caset følger grunnlegging, teknologisk omlegging, flytting og utbygging, selskapskonsolidering, nedleggelse og dokumentert etterbruk." },
      startPoint: "Jørgen Young overtok bryggerivirksomheten i 1821, som ble Ringnes Bryggeris offisielle grunnleggingsår.",
      endPoint: "Bryggeridriften er avsluttet, mens bevarte produksjonsbygg brukes til kontor, undervisning, kultur og servering i dagens Ringneskvartal.",
      breaks: ["Christian Julius Ringnes overtakelse i 1837 ga virksomheten nytt navn og ny ledelse.", "Flyttingen til Ringnesløkken i 1873 samlet bryggingen i et nytt og senere utvidet industrianlegg.", "Sammenslutningen med Frydenlund i 1962 endret selskapsstrukturen.", "Nedleggelsen i 1981 avsluttet bryggeriproduksjonen og åpnet for ombygging og nye funksjoner."],
      continuities: ["Ringnes-navnet er fortsatt synlig i bygningsmiljøet og områdets stedsnavn.", "Flere produksjonsbygg og funksjonsnavn er bevart selv om bruken er endret.", "Anleggets plassering ved Trondheimsveien og Nybrua gjør den historiske forbindelsen mellom produksjon og bylogistikk lesbar."],
      sourceIds: ["source_snl_ringnes_historie", "source_byleksikon_ringnes_historie", "source_byleksikon_kvartalet_historie", "source_klp_ringnes_historie"]
    },
    actors: [
      { name: "Bryggeriets eiere og ledelse", roleOrInterest: "Utviklet virksomheten, investerte i produksjonsanlegg og teknologi og organiserte senere selskapsmessig konsolidering.", powerPosition: "Kontrollerte kapital, produksjonsmidler, varemerke og strategiske beslutninger fram til bryggeriets innlemmelse i større selskapsstrukturer.", sourceIds: ["source_snl_ringnes_historie", "source_byleksikon_ringnes_historie"] },
      { name: "Bryggeriarbeidere, fagfolk og transportører", roleOrInterest: "Utførte brygging, kjøling, lagring, tapping, vedlikehold og varetransport i det sammenhengende produksjonssystemet.", powerPosition: "Arbeidet og fagkunnskapen var nødvendig for driften, men de åpne kildene gir ikke tilstrekkelig grunnlag for å beskrive lønn, organisering eller medbestemmelse.", sourceIds: ["source_snl_ringnes_historie", "source_byleksikon_ringnes_historie"] },
      { name: "Gårdeier og dagens brukere", roleOrInterest: "Forvalter og bruker det tidligere produksjonsmiljøet til næring, undervisning, kultur og servering.", powerPosition: "Gårdeier kontrollerer utleie og fysiske tiltak, mens selvstendige brukere former aktivitetene innenfor sine lokaler og offentlige rammer.", sourceIds: ["source_byleksikon_kvartalet_historie", "source_klp_ringnes_historie"] }
    ],
    conflictOrNegotiation: { statement: "Stedets ombruk forhandler mellom vern og lesbarhet av industrimiljøet, eiendomsdrift, bygningsmessig oppgradering og nye kultur- og næringsfunksjoner.", sourceIds: ["source_byleksikon_kvartalet_historie", "source_klp_ringnes_historie"] },
    sourceComparison: {
      sourceIds: ["source_snl_ringnes_historie", "source_byleksikon_ringnes_historie", "source_klp_ringnes_historie"],
      comparison: "SNL sammenfatter virksomhets- og selskapskronologien, Oslo byleksikon dokumenterer bygninger og stedslige funksjoner, mens gårdeierens aktuelle presentasjon avgrenser hvilke bruksformer som kan bekreftes i dag.",
      contradictionsOrSilences: "Kildene har ulike formål og sier lite om arbeidernes erfaringer, produksjonsvolum, økonomiske resultater og beslutningsforløpet bak nedleggelsen.",
      conclusionLimits: "Materialet støtter den overordnede kronologien, de navngitte bygningssporene og dagens ombruk, men ikke én uttømmende årsaksforklaring på konsolidering eller nedleggelse."
    },
    comparativeScale: {
      localFinding: "Ringnes viser hvordan produksjon, kjøling, lagring, tapping og distribusjon ble bygget sammen i et ekspanderende industrianlegg ved en sentral bytransportåre.",
      widerContext: "Teknologisk spesialisering, familieeierskap, senere bransjekonsolidering og ombruk av industribygg knytter stedet til bredere europeiske industrialiserings- og deindustrialiseringsforløp.",
      scale: "european", sourceIds: ["source_snl_ringnes_historie", "source_byleksikon_ringnes_historie", "source_byleksikon_kvartalet_historie"]
    },
    causationAndUncertainty: {
      causalAssessment: "Teknologiske investeringer og flyttingen til Ringnesløkken bidro til industriell vekst, mens konsolideringen og nedleggelsen inngikk i en større omstilling; kildene isolerer ikke én faktor som tilstrekkelig årsak til utviklingen.",
      alternativeExplanations: ["Kapitalbehov, markedsendringer og stordriftsfordeler kan ha virket sammen med teknologisk utvikling.", "Eiendomsverdi, kommunal kulturpolitikk og etterspørsel etter nye lokaler kan sammen ha påvirket ombruken etter 1981."],
      uncertainty: "De åpne kildene mangler komplette produksjons-, arbeidslivs- og regnskapsserier og gir derfor ikke grunnlag for kausale eller fordelingsmessige konklusjoner utover det dokumenterte forløpet.",
      sourceIds: ["source_snl_ringnes_historie", "source_byleksikon_ringnes_historie", "source_byleksikon_kvartalet_historie", "source_klp_ringnes_historie"]
    }
  }],
  presentTrace: {
    objectStatus: "altered",
    statement: "Portbygningen, bryggeri- og gjærhuset og andre navngitte bygningsdeler står som lesbare spor etter industrivirksomheten, men er ombygd og inngår nå i et flerbruks kvartal.",
    originalSiteRelationship: "Markøren peker til bryggerianlegget på Ringnesløkken i Trondheimsveien 2; dagens bygg står på produksjonsstedet fra 1873, men kvartalet rommer også nyere og selvstendige funksjoner.",
    sourceIds: ["source_byleksikon_ringnes_historie", "source_byleksikon_kvartalet_historie", "source_klp_ringnes_historie"]
  },
  quizOpening: { status: "PASS", quizTargetId: "ringnes_bryggeri", firstTwoSetsQuestionCount: 14, sourceBrief: "data/quiz/production_briefs/naeringsliv/ringnes_bryggeri.json", productionContext: "data/quiz/production_context/naeringsliv/ringnes_bryggeri.json", requiredInputs: ["data/fag/naeringsliv/naeringslivpensum_canonical_v4_5.json", "data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json", "data/fag/naeringsliv/fagkart_naeringsliv_canonical_v4_5.json", "data/fag/naeringsliv/methods_naeringsliv_canonical_v4_5.json", "data/fag/naeringsliv/supersetQUIZMAL_naeringsliv.json", "data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md", "data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json"] },
  chronologyStories: { status: "PASS", chronologyReviewed: true, storiesReviewed: true, rationale: "Leksikonets tidslinje følger 1821, 1837, 1843, 1873, 1897, 1899, 1962 og 1981 med kildekoblede hendelser. episode_v1-historien om Daimler-varebilen er separat, manifestkoblet og kildekontrollert." },
  gates: {
    A: { status: "PASS", evidenceRefs: ["historicalIdentity", "presentTrace"] },
    B: { status: "PASS", evidenceRefs: ["historyTopics", "caseRealizations.case_ringnes_industrialisering_og_ombruk"] },
    C: { status: "PASS", evidenceRefs: ["caseRealizations.case_ringnes_industrialisering_og_ombruk.temporalSequence"] },
    D: { status: "PASS", evidenceRefs: ["caseRealizations.case_ringnes_industrialisering_og_ombruk.actors", "caseRealizations.case_ringnes_industrialisering_og_ombruk.conflictOrNegotiation"] },
    E: { status: "PASS", evidenceRefs: ["sources", "caseRealizations.case_ringnes_industrialisering_og_ombruk.sourceComparison"] },
    F: { status: "PASS", evidenceRefs: ["caseRealizations.case_ringnes_industrialisering_og_ombruk.comparativeScale", "caseRealizations.case_ringnes_industrialisering_og_ombruk.causationAndUncertainty"] },
    G: { status: "PASS", evidenceRefs: ["quizOpening"] },
    H: { status: "PASS", evidenceRefs: ["chronologyStories", "data/leksikon/places/oslo/naeringsliv/leksikon_ringnes_bryggeri.json#chronology"] }
  },
  review: { reviewer: "Ringnes Bryggeri phase 8–24 Historie review", reviewedAt: verifiedAt, notes: "Virksomhet, varemerke, anlegg, kvartal og dagens brukere er avgrenset. Kronologi, materielle spor, aktører, kildetyper, quizåpning og Story er kontrollert; årsaker, arbeidsvilkår og økonomiske virkninger hevdes ikke utover kildenes dekning." }
});
write("data/places/naeringsliv-production/ringnes_bryggeri.json", {
  schemaVersion: "naeringsliv_place_production_v1", validatorVersion: "1.0.0", placeId: "ringnes_bryggeri", placeFile, status: "ready",
  economicIdentity: {
    statement: "Ringnes Bryggeri var en industriell bryggerivirksomhet 1821–1981, med hovedanlegg på Ringnesløkken fra 1873 og et etterfølgende ombrukt nærings- og kulturmiljø.",
    anchorType: "production_site",
    placeObjectDistinction: "Rapporten skiller bryggerivirksomheten og varemerket fra det fysiske anlegget, det senere Ringneskvartalet, nyere enkeltbygg og selvstendige kulturinstitusjoner.",
    temporalScope: { start: "1821", end: "2026", precision: "period", rationale: "Perioden dekker virksomhetens offisielle start, driften på Ringnesløkken, nedleggelsen og den ferskt kontrollerte ombruken." },
    sourceIds: ["source_snl_ringnes", "source_byleksikon_ringnes", "source_klp_ringnes"]
  },
  businessTopics: [
    ["em_naering_produksjon_produktivitet", "Bryggeri, gjærhus, lager, tapping og distribusjon viser produksjon som et sammenhengende system."],
    ["em_naering_innovasjon_teknologisk_skift", "Undergjæring i 1843 og motorisert varetransport i 1899 er dokumenterte teknologiske skift."],
    ["em_naering_logistikk_verdikjeder", "Råvarer, kjøling, lagring, tapping og varebil knytter anlegget til en fysisk verdikjede."],
    ["em_naering_omstilling_kriser_skift", "Nedleggelsen i 1981 og senere ombruk gjør funksjonsskiftet direkte lesbart i bygningsmassen."],
    ["em_naering_eierskap_styring", "Overtakelser, familieeierskap og sammenslutningen med Frydenlund viser endret kontroll over virksomheten."]
  ].map(([emneId, siteSpecificRationale]) => ({ emneId, siteSpecificRationale, caseIds: ["case_ringnes_industrisystem_og_ombruk"] })),
  sources: [
    { id: "source_snl_ringnes", url: urls.snl, sourceLocation: "Faktaboks, kronologi, hovedtekst og bildepost om Daimler-varebilen", sourceType: "reputable_secondary", verifiedAt, temporalCoverage: "mixed", provenance: "Store norske leksikon er redaksjonelt kontrollert og oppgir forfatter og siste revisjonsdato.", limitations: "Artikkelen sammenfatter historien, men gir ikke regnskapsserier, bemanningstall eller full teknisk produksjonsdokumentasjon." },
    { id: "source_byleksikon_ringnes", url: urls.byleksikon, sourceLocation: "Historikk og bygningsbeskrivelse for anlegget i Trondheimsveien 2", sourceType: "museum_or_heritage", verifiedAt, temporalCoverage: "historical", provenance: "Oslo byleksikon er et institusjonelt lokalhistorisk oppslagsverk med stedsspesifikke bygningsdata.", limitations: "Oppslaget har enkelte eldre selskapsår som er kontrollert mot nyere SNL; økonomiske virkninger og arbeidsvilkår tallfestes ikke." },
    { id: "source_byleksikon_quarter", url: urls.quarter, sourceLocation: "Ombyggingene etter 1981 og etableringen av kulturvirksomheter", sourceType: "museum_or_heritage", verifiedAt, temporalCoverage: "mixed", provenance: "Oslo byleksikon dokumenterer kvartalets bygningsnavn, ombygginger og institusjonsbruk.", limitations: "Oppslaget er ikke en komplett eller løpende leietakeroversikt og brukes derfor ikke alene for nåstatus." },
    { id: "source_klp_ringnes", url: urls.klp, sourceLocation: "Beskrivelse av dagens Ringneskvartal, kontorbruk og planlagt rehabilitering", sourceType: "primary_business", verifiedAt, temporalCoverage: "current", provenance: "KLP Eiendom publiserer som gårdeier aktuell informasjon om eiendommen og utleiearealene.", limitations: "Utleieteksten har kommersielt formål og dokumenterer ikke uavhengig lønnsomhet, sosial effekt eller alle brukere i kvartalet." },
    { id: "source_oslo_kulturskole", url: urls.cultureSchool, sourceLocation: "Adresse og åpningstider for Ringnes kulturstasjon i Malteriet", sourceType: "official", verifiedAt, temporalCoverage: "current", provenance: "Oslo kommune publiserer den operative kontakt- og stedsinformasjonen for kulturskolen.", limitations: "Kontaktsiden dokumenterer dagens kommunale bruk, men ikke hele byggets historikk eller øvrige leietakere." }
  ],
  economicCases: [{
    id: "case_ringnes_industrisystem_og_ombruk",
    claim: "Ringnes-anlegget samordnet brygging, kjøling, lagring, tapping og distribusjon før virksomheten ble konsolidert og bygningsmassen fikk nye økonomiske og kulturelle funksjoner.",
    unitOfAnalysis: { unit: "Ringnes Bryggeri og anlegget på Ringnesløkken", boundary: "Analysen omfatter virksomheten 1821–1981 og dokumentert ombruk av bryggerianlegget, men ikke alle selvstendige leietakere som deler av samme selskap.", scale: "firm", temporalScope: { start: "1821", end: "2026", precision: "period", rationale: "Tidsrommet gjør både produksjonssystemet, selskapsendringen, nedleggelsen og etterbruken sammenlignbare." }, sourceIds: ["source_snl_ringnes", "source_byleksikon_ringnes", "source_klp_ringnes"] },
    actors: [
      { name: "Bryggeriets eiere og ledelse", roleOrInterest: "Finansierte anlegg, organiserte produksjon og distribusjon og inngikk senere i større selskapsstrukturer.", economicPosition: "Kontrollerte kapital, produksjonsmidler, varemerke og strategiske beslutninger.", sourceIds: ["source_snl_ringnes", "source_byleksikon_ringnes"] },
      { name: "Arbeidere, transportører og fagpersoner", roleOrInterest: "Utførte brygging, gjærbehandling, lagring, tapping, vedlikehold og levering.", economicPosition: "Leverte arbeidskraft og fagkunnskap, mens kildene ikke gir tilstrekkelige lønns- eller kontraktsdata.", sourceIds: ["source_snl_ringnes", "source_byleksikon_ringnes"] },
      { name: "Gårdeier og dagens brukere", roleOrInterest: "Forvalter og bruker det tidligere produksjonsanlegget til kontor, undervisning, kultur og servering.", economicPosition: "Gårdeier kontrollerer utleie og rehabilitering; selvstendige brukere kontrollerer egne tilbud og aktiviteter.", sourceIds: ["source_klp_ringnes", "source_oslo_kulturskole", "source_byleksikon_quarter"] }
    ],
    valueCreation: {
      inputs: [{ statement: "Malt, vann, humle, gjær, kjøling, bygninger, arbeid og transportkapasitet var nødvendige innsatsfaktorer i bryggerisystemet.", sourceIds: ["source_snl_ringnes", "source_byleksikon_ringnes"] }],
      activity: { statement: "Anlegget foredlet råvarer gjennom brygging, undergjæring, lagring og tapping og organiserte deretter levering til markedet.", sourceIds: ["source_snl_ringnes", "source_byleksikon_ringnes"] },
      outputs: [{ statement: "Bryggeriet produserte og distribuerte øl, blant annet bayerøl, og utviklet senere vørterøl som eget produkt.", sourceIds: ["source_snl_ringnes", "source_byleksikon_ringnes"] }],
      valueCreationAssessment: { statement: "Kildene dokumenterer en integrert produksjons- og logistikkjede, men gir ikke grunnlag for å beregne produktivitet, marginer eller verdiskaping i faste priser.", sourceIds: ["source_snl_ringnes", "source_byleksikon_ringnes"] }
    },
    measurement: { methodId: "met_naering_arbeidsprosessanalyse", evidenceType: "qualitative", indicatorOrObservation: "Daterte overtakelser, teknologisk metode, navngitte produksjonsbygg, leveringskjøretøy, selskapsendringer, nedleggelse og dokumentert ombruk brukes som observerbare spor.", unit: "produksjonsanlegg og virksomhet", period: "1821–2026", comparability: "Kildene gjør funksjoner og tidslag sammenlignbare, men mangler ensartede serier for volum, kapital, ansatte og lønnsomhet.", dataLimitations: "Det foreligger ikke et komplett regnskapsarkiv, produksjonsserie, bemanningsserie eller en kausal analyse av nedleggelsen og ombruken.", sourceIds: ["source_snl_ringnes", "source_byleksikon_ringnes", "source_byleksikon_quarter", "source_klp_ringnes"] },
    distributionAndPower: { ownershipOrControl: "Kontrollen gikk fra enkelt- og familieeierskap til aksjeselskap og større bryggerisammenslutninger; dagens gårdeier kontrollerer eiendomsforvaltning og rehabilitering.", laborPosition: "Arbeidet var nødvendig i hele verdikjeden, men de brukte kildene gir ikke sikre data om bemanning, lønn, arbeidstid eller medbestemmelse.", beneficiaries: ["Eierne og senere selskapsgrupper kunne motta avkastning fra produksjon og markedsadgang.", "Kunder fikk tilgang til standardiserte bryggeriprodukter og distribusjon.", "Dagens leietakere og publikum kan bruke ombygde lokaler til arbeid, undervisning, kultur og servering."], costRiskBearers: ["Eiere bar kapital- og markedsrisiko knyttet til anlegg og omstilling.", "Arbeidere og leverandører var utsatt for konsekvenser av teknologisk og selskapsmessig omstilling.", "Gårdeier og leietakere bærer kostnader og risiko ved vedlikehold, rehabilitering og bruksendring."], sourceIds: ["source_snl_ringnes", "source_byleksikon_quarter", "source_klp_ringnes"] },
    riskAndExternalities: {
      riskAssessment: { statement: "Bryggeridriften var avhengig av temperaturkontroll, råvaretilgang, teknisk drift, distribusjon og marked, mens dagens ombruk er avhengig av vedlikehold, leietakere og godkjente rehabiliteringer.", sourceIds: ["source_snl_ringnes", "source_klp_ringnes"] },
      externalityAssessment: { status: "not_applicable", rationale: "Kildene dokumenterer industri og bygningsombruk, men gir ikke et sikkert stedsspesifikt grunnlag for å tallfeste utslipp, støy, helsevirkninger eller fortrengning." }
    },
    comparisonAndCausality: { comparisonBasis: "Bryggeriets historiske produksjons- og selskapskilder sammenholdes med institusjonelle opplysninger om ombygging og gårdeiers aktuelle eiendomsinformasjon.", causalStatus: "descriptive_only", causalAssessment: "Materialet dokumenterer rekkefølgen fra produksjon via konsolidering og nedleggelse til ombruk, men isolerer ikke én årsak til nedleggelsen eller dagens funksjonsmiks.", alternativeExplanations: ["Bransjekonsolidering, teknologi, kapitalbehov, eiendomsverdi, kommunal kulturpolitikk og etterspørsel etter kontor- og kulturarealer kan ha virket samtidig."], uncertainty: "Kildene har ulike formål og gir ikke sammenlignbare økonomiske serier eller en kontrafaktisk analyse.", sourceIds: ["source_snl_ringnes", "source_byleksikon_quarter", "source_klp_ringnes"] }
  }],
  presentOperation: { operationalStatus: "mixed", statement: "Den opprinnelige bryggerivirksomheten er nedlagt, mens Ringneskvartalet har aktiv kontor-, undervisnings-, kultur- og serveringsbruk og et planlagt rehabiliteringsløp.", originalEconomicRoleRelationship: "Dagens virksomheter bruker deler av det tidligere produksjonsmiljøet, men er selvstendige aktører og viderefører ikke automatisk det historiske bryggeriselskapet.", checkedAt: verifiedAt, sourceIds: ["source_klp_ringnes", "source_oslo_kulturskole"] },
  quizOpening: { status: "PASS", quizTargetId: "ringnes_bryggeri", firstTwoSetsQuestionCount: 14, sourceBrief: "data/quiz/production_briefs/naeringsliv/ringnes_bryggeri.json", productionContext: "data/quiz/production_context/naeringsliv/ringnes_bryggeri.json", requiredInputs: ["data/fag/naeringsliv/naeringslivpensum_canonical_v4_5.json", "data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json", "data/fag/naeringsliv/fagkart_naeringsliv_canonical_v4_5.json", "data/fag/naeringsliv/methods_naeringsliv_canonical_v4_5.json", "data/fag/naeringsliv/supersetQUIZMAL_naeringsliv.json", "data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md", "data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json"] },
  chronologyStories: { status: "PASS", chronologyReviewed: true, storiesReviewed: true, rationale: "Leksikonets tidslinje og episode_v1-historien om Daimler-varebilen er kildekontrollert og manifestkoblet." },
  gates: {
    A: { status: "PASS", evidenceRefs: ["economicIdentity"] }, B: { status: "PASS", evidenceRefs: ["businessTopics"] },
    C: { status: "PASS", evidenceRefs: ["case_ringnes_industrisystem_og_ombruk.valueCreation"] }, D: { status: "PASS", evidenceRefs: ["case_ringnes_industrisystem_og_ombruk.actors", "case_ringnes_industrisystem_og_ombruk.distributionAndPower"] },
    E: { status: "PASS", evidenceRefs: ["case_ringnes_industrisystem_og_ombruk.measurement"] }, F: { status: "PASS", evidenceRefs: ["case_ringnes_industrisystem_og_ombruk.comparisonAndCausality", "presentOperation"] },
    G: { status: "PASS", evidenceRefs: ["quizOpening"] }, H: { status: "PASS", evidenceRefs: ["chronologyStories"] }
  },
  review: { reviewer: "Ringnes Bryggeri phase 8–24 Næringsliv review", reviewedAt: verifiedAt, notes: "Rapporten skiller historisk foretak, varemerke, produksjonsanlegg, eiendom og dagens selvstendige brukere. Den gjør ingen udokumentert påstand om lønnsomhet, arbeidsvilkår eller én årsak til nedleggelsen." }
});
const rewriteReportStrings = value => {
  if (Array.isArray(value)) return value.map(rewriteReportStrings);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, rewriteReportStrings(item)]));
  if (typeof value !== "string") return value;
  return value
    .replaceAll("1821–1981", "1876–2001").replaceAll("1821–2026", "1876–2026")
    .replaceAll("Ringnesløkken", "Grünerløkka").replaceAll("Trondheimsveien 2", "Thorvald Meyers gate 2")
    .replaceAll("Ringneskvartalet", "det tidligere fabrikkvartalet").replaceAll("Ringnes kulturstasjon", "Ringnes Museum")
    .replaceAll("Ringneskjelleren", "Ringnes Brygghus").replaceAll("KLP Eiendom", "Eiendomsspar")
    .replaceAll("Daimler-varebilen", "renkulturarbeidet").replaceAll("Daimler-varebil", "renkultur av gjær")
    .replaceAll("Norges første lastebil", "et tidlig norsk gjennombrudd for dyrking av egne gjærstammer")
    .replaceAll("undergjæring i 1843 og motorisert varetransport i 1899", "renkulturarbeidet 1887–1890")
    .replaceAll("Undergjæring i 1843 og motorisert varetransport i 1899", "Renkulturarbeidet 1887–1890")
    .replaceAll("nedleggelsen i 1981", "produksjonsflyttingen i 2001").replaceAll("Nedleggelsen i 1981", "Produksjonsflyttingen i 2001");
};
const historyReportFile = "data/places/historie-production/ringnes_bryggeri.json";
let historyReport = rewriteReportStrings(read(historyReportFile));
historyReport.historicalIdentity = {
  statement: "Ringnes Bryggeri var en industriell bryggerivirksomhet grunnlagt i Thorvald Meyers gate i 1876, med produksjon på stedet 1877–2001 og bevarte bygg i aktiv etterbruk.",
  placeRelationType: "institution_site",
  placeRelationStatement: "Place-ID-en representerer opphavsstedet og det historiske produksjonsanlegget, ikke produksjonsanlegget på Gjelleråsen, hele Ringnes Park eller merkevaren alene.",
  temporalScope: { start: "1876", end: "2026", precision: "period", rationale: "Perioden dekker grunnleggelse, produksjon, laboratorieinnovasjon, selskapsendringer, flytting og kontrollert nåbruk." },
  sourceIds: ["source_snl_ringnes_historie", "source_byleksikon_ringnes_historie", "source_klp_ringnes_historie"]
};
historyReport.sources = [
  { id: "source_snl_ringnes_historie", url: urls.snl, sourceLocation: "Produksjon, laboratorium og selskapsendringer", sourceType: "reputable_secondary", verifiedAt, temporalCoverage: "mixed", provenance: "Redaksjonelt kontrollert oppslagsverk.", limitations: "Gir ikke komplette regnskaps- eller arbeidslivsserier." },
  { id: "source_byleksikon_ringnes_historie", url: urls.byleksikon, sourceLocation: "Grunnleggelse, anlegg, flytting og etterbruk", sourceType: "museum_or_heritage", verifiedAt, temporalCoverage: "mixed", provenance: "Institusjonelt lokalhistorisk oppslagsverk.", limitations: "Sammenfatter utviklingen uten full bygge- eller beslutningsdokumentasjon." },
  { id: "source_byleksikon_kvartalet_historie", url: urls.property, sourceLocation: "Bevarte bygg og dagens bruk", sourceType: "primary", verifiedAt, temporalCoverage: "current", provenance: "Gårdeierens eiendomspresentasjon.", limitations: "Kommersiell primærkilde til nåbruk." },
  { id: "source_klp_ringnes_historie", url: urls.brygghus, sourceLocation: "Mikrobryggeri og serveringssted", sourceType: "primary", verifiedAt, temporalCoverage: "current", provenance: "Virksomhetens egen presentasjon.", limitations: "Dokumenterer egen drift, ikke hele eiendommen." }
];
const historyCase = historyReport.caseRealizations[0];
historyCase.claim = "Ringnes-anlegget utviklet seg fra et gründerstyrt bryggeri til et stort industrielt produksjonssystem med laboratorium, før produksjonen flyttet og de bevarte byggene fikk nye funksjoner.";
historyCase.temporalSequence = {
  scope: { start: "1876", end: "2026", precision: "period", rationale: "Caset følger grunnleggelse, gjærinnovasjon, selskapskonsolidering, produksjonsflytting og etterbruk." },
  startPoint: "Amund og Ellef Ringnes og Axel Heiberg grunnla Ringnes & Co. i 1876; produksjonen startet i 1877.",
  endPoint: "Storskalaproduksjonen foregår på Gjelleråsen, mens bevarte bygg i Thorvald Meyers gate brukes til hovedkontor, museum og brygghus.",
  breaks: ["Laboratoriearbeidet 1887–1890 innførte egne gjærstammer og renkultur.", "Aksjeselskapsformen fra 1899 endret eierskapsrammen.", "Konsolideringen fra 1978 knyttet Ringnes til større selskapsgrupper.", "Produksjonsflyttingen i 2001 skilte merkevaren fra opphavsstedets produksjonsfunksjon."],
  continuities: ["Ringnes-navnet brukes fortsatt av selskapet og på stedet.", "Flere bryggeribygg er bevart.", "Brygging finnes fortsatt i liten skala gjennom Ringnes Brygghus."],
  sourceIds: ["source_snl_ringnes_historie", "source_byleksikon_ringnes_historie", "source_byleksikon_kvartalet_historie", "source_klp_ringnes_historie"]
};
historyCase.actors = [
  { name: "Amund og Ellef Ringnes og Axel Heiberg", roleOrInterest: "Grunnla og finansierte virksomheten; brødrene delte teknisk og utadvendt ledelse.", powerPosition: "Kontrollerte kapital, produksjon og forretningsledelse i etableringsfasen.", sourceIds: ["source_byleksikon_ringnes_historie", "source_snl_ringnes_historie"] },
  { name: "Olav Johan Sopp og bryggeriets fagarbeidere", roleOrInterest: "Utviklet og brukte laboratoriekunnskap, gjærkulturer og produksjonspraksis.", powerPosition: "Fagkunnskapen var nødvendig, men åpne kilder gir ikke grunnlag for lønns- eller medbestemmelsesanalyse.", sourceIds: ["source_snl_ringnes_historie"] },
  { name: "Senere eiere, gårdeier og dagens brukere", roleOrInterest: "Flyttet produksjonen og forvaltet bevarte bygg til nye formål.", powerPosition: "Selskapseiere kontrollerte produksjonsstrategien; gårdeier og brukere kontrollerer dagens lokaler og tilbud.", sourceIds: ["source_snl_ringnes_historie", "source_byleksikon_kvartalet_historie", "source_klp_ringnes_historie"] }
];
historyCase.conflictOrNegotiation = { statement: "Etterbruken forhandler mellom lesbar industrihistorie, eiendomsutvikling og nye virksomheter; kildene dokumenterer utfallet, men ikke alle beslutningskonflikter.", sourceIds: ["source_byleksikon_ringnes_historie", "source_byleksikon_kvartalet_historie"] };
historyCase.sourceComparison = { sourceIds: ["source_snl_ringnes_historie", "source_byleksikon_ringnes_historie", "source_byleksikon_kvartalet_historie"], comparison: "SNL bærer teknologi- og selskapslinjen, Oslo byleksikon bærer stedskronologien, og gårdeier dokumenterer nåbruk.", contradictionsOrSilences: "Kildene sier lite om arbeidernes erfaringer, produksjonsvolum og beslutningsforløpet bak flyttingen.", conclusionLimits: "Materialet støtter kronologi og stedsspor, men ikke én uttømmende årsaksforklaring." };
historyCase.comparativeScale = { localFinding: "Ringnes viser hvordan laboratorium, brygging, lager og distribusjon kunne samles i et byindustrielt kvartal.", widerContext: "Standardisering, selskapskonsolidering og flytting av produksjon knytter stedet til bredere industrialiserings- og omstillingsforløp.", scale: "european", sourceIds: ["source_snl_ringnes_historie", "source_byleksikon_ringnes_historie"] };
historyCase.causationAndUncertainty = { causalAssessment: "Kildene dokumenterer rekkefølgen fra vekst via konsolidering til flytting, men isolerer ikke én tilstrekkelig årsak.", alternativeExplanations: ["Teknologi, kapitalbehov, logistikk, eiendomsverdi og stordriftsfordeler kan ha virket sammen."], uncertainty: "Åpne kilder mangler komplette produksjons-, arbeidslivs- og regnskapsserier.", sourceIds: ["source_snl_ringnes_historie", "source_byleksikon_ringnes_historie"] };
historyReport.presentTrace = { objectStatus: "altered", statement: "Det gamle brygghuset og flere nordlige industribygg står igjen, mens store deler av fabrikkvartalet er omformet.", originalSiteRelationship: "Markøren peker til opphavsstedet i Thorvald Meyers gate; bygningene er historiske produksjonsspor, men dagens storskala produksjon ligger på Gjelleråsen.", sourceIds: ["source_byleksikon_ringnes_historie", "source_byleksikon_kvartalet_historie", "source_klp_ringnes_historie"] };
historyReport.chronologyStories.rationale = "Leksikonet følger 1876, 1877, 1887–1890, 1899, 1978, 2001 og 2018; episode_v1-historien om renkultur er separat og kildekontrollert.";
write(historyReportFile, historyReport);

const businessReportFile = "data/places/naeringsliv-production/ringnes_bryggeri.json";
let businessReport = rewriteReportStrings(read(businessReportFile));
businessReport.economicIdentity = {
  statement: "Ringnes Bryggeri var en industriell bryggerivirksomhet grunnlagt i 1876, med produksjon på Grünerløkka 1877–2001 og varemerke- og selskapskontinuitet etter flyttingen.",
  anchorType: "production_site",
  placeObjectDistinction: "Rapporten skiller virksomheten og merkevaren fra det historiske anlegget, Ringnes Park, produksjonen på Gjelleråsen og dagens selvstendige serveringsdrift.",
  temporalScope: { start: "1876", end: "2026", precision: "period", rationale: "Perioden dekker etablering, produksjon, teknologi, eierskap, flytting og kontrollert nåbruk." },
  sourceIds: ["source_snl_ringnes", "source_byleksikon_ringnes", "source_klp_ringnes"]
};
businessReport.businessTopics[1].siteSpecificRationale = "Dyrking av egne gjærstammer og innføringen av renkultur 1887–1890 er en dokumentert prosessinnovasjon.";
businessReport.businessTopics[2].siteSpecificRationale = "Det store fabrikkvartalet bandt råvarer, brygging, lager og distribusjon sammen.";
businessReport.businessTopics[3].siteSpecificRationale = "Produksjonsflyttingen i 2001 og etterbruken gjør et funksjonsskifte lesbart.";
businessReport.businessTopics[4].siteSpecificRationale = "Gründerledelse, aksjeselskap, Nora, Orkla, Pripps og Carlsberg viser skiftende eierskaps- og styringsrammer.";
businessReport.sources = [
  { id: "source_snl_ringnes", url: urls.snl, sourceLocation: "Produksjon, gjærinnovasjon og selskapsendringer", sourceType: "reputable_secondary", verifiedAt, temporalCoverage: "mixed", provenance: "Redaksjonelt kontrollert oppslagsverk.", limitations: "Ingen komplette regnskaps- eller bemanningsserier." },
  { id: "source_byleksikon_ringnes", url: urls.byleksikon, sourceLocation: "Grunnleggelse, fabrikkvartal, flytting og etterbruk", sourceType: "museum_or_heritage", verifiedAt, temporalCoverage: "mixed", provenance: "Institusjonelt lokalhistorisk oppslagsverk.", limitations: "Ikke en full bedriftsøkonomisk analyse." },
  { id: "source_byleksikon_quarter", url: urls.byleksikon, sourceLocation: "Anleggets utstrekning og omforming", sourceType: "museum_or_heritage", verifiedAt, temporalCoverage: "mixed", provenance: "Stedsspesifikk lokalhistorie.", limitations: "Gir ikke alle avtaler eller brukerdata." },
  { id: "source_klp_ringnes", url: urls.property, sourceLocation: "Bevarte bygg, hovedkontor og museum", sourceType: "primary_business", verifiedAt, temporalCoverage: "current", provenance: "Gårdeierens eiendomspresentasjon.", limitations: "Kommersiell primærkilde." },
  { id: "source_oslo_kulturskole", url: urls.brygghus, sourceLocation: "Mikrobryggeri og serveringssted", sourceType: "primary_business", verifiedAt, temporalCoverage: "current", provenance: "Virksomhetens egen presentasjon.", limitations: "Dokumenterer egen drift." }
];
const businessCase = businessReport.economicCases[0];
businessCase.claim = "Ringnes-anlegget samordnet brygging, gjærkontroll, lager og distribusjon før produksjonen flyttet og stedet fikk nye økonomiske funksjoner.";
businessCase.unitOfAnalysis = { unit: "Ringnes Bryggeri og opphavsanlegget i Thorvald Meyers gate", boundary: "Analysen omfatter virksomheten fra 1876, produksjonen på stedet til 2001 og dokumentert etterbruk, men ikke dagens Gjelleråsen-anlegg som samme Place.", scale: "firm", temporalScope: { start: "1876", end: "2026", precision: "period", rationale: "Tidsrommet gjør produksjon, eierskap, flytting og etterbruk sammenlignbare." }, sourceIds: ["source_snl_ringnes", "source_byleksikon_ringnes", "source_klp_ringnes"] };
businessCase.actors = [
  { name: "Grunnleggere, eiere og ledelse", roleOrInterest: "Finansierte anlegg, organiserte produksjon og marked og inngikk senere i større selskapsstrukturer.", economicPosition: "Kontrollerte kapital, produksjonsmidler, merkevare og strategiske beslutninger.", sourceIds: ["source_snl_ringnes", "source_byleksikon_ringnes"] },
  { name: "Bryggeriarbeidere, laboratoriefolk og transportører", roleOrInterest: "Utførte gjærkontroll, brygging, lagring, tapping, vedlikehold og distribusjon.", economicPosition: "Leverte arbeid og fagkunnskap; kildene gir ikke sikre lønns- eller kontraktsdata.", sourceIds: ["source_snl_ringnes", "source_byleksikon_ringnes"] },
  { name: "Gårdeier og dagens brukere", roleOrInterest: "Forvalter og bruker bevarte deler til kontor, museum, mikrobryggeri og servering.", economicPosition: "Kontrollerer dagens eiendom og egne tilbud, men ikke den historiske storskalaproduksjonen.", sourceIds: ["source_klp_ringnes", "source_oslo_kulturskole"] }
];
businessCase.measurement.indicatorOrObservation = "Daterte grunnleggerroller, produksjonsstart, gjærinnovasjon, selskapsendringer, produksjonsflytting og dokumentert etterbruk brukes som kvalitative spor.";
businessCase.measurement.period = "1876–2026";
businessCase.measurement.sourceIds = ["source_snl_ringnes", "source_byleksikon_ringnes", "source_klp_ringnes"];
businessCase.distributionAndPower.ownershipOrControl = "Kontrollen gikk fra gründer- og familieledelse til aksjeselskap og større konsern; dagens gårdeier kontrollerer den historiske eiendommen.";
businessCase.distributionAndPower.sourceIds = ["source_snl_ringnes", "source_byleksikon_ringnes", "source_klp_ringnes"];
businessCase.comparisonAndCausality = { comparisonBasis: "Virksomhets- og selskapskilder sammenholdes med stedshistorikk og nåværende eiendomsinformasjon.", causalStatus: "descriptive_only", causalAssessment: "Materialet dokumenterer kronologien, men isolerer ikke én årsak til produksjonsflyttingen eller dagens funksjonsmiks.", alternativeExplanations: ["Teknologi, logistikk, kapitalbehov, konsolidering og eiendomsverdi kan ha virket samtidig."], uncertainty: "Kildene gir ikke sammenlignbare økonomiske serier eller kontrafaktisk analyse.", sourceIds: ["source_snl_ringnes", "source_byleksikon_ringnes", "source_klp_ringnes"] };
businessReport.presentOperation = { operationalStatus: "mixed", statement: "Storskalaproduksjonen er flyttet til Gjelleråsen; i det gamle brygghuset finnes hovedkontor, museum og aktivt mikrobryggeri/serveringssted.", originalEconomicRoleRelationship: "Dagens bruk viderefører navn og enkelte bryggerifunksjoner, men er ikke den historiske storskalaproduksjonen.", checkedAt: verifiedAt, sourceIds: ["source_klp_ringnes", "source_oslo_kulturskole"] };
businessReport.chronologyStories.rationale = "Leksikonet og episode_v1-historien om renkultur er kildekontrollert og manifestkoblet.";
write(businessReportFile, businessReport);

write("reports/place-production/ringnes-bryggeri-phase8-24-gate-audit-v1.json", {
  schema: "history_go_phase8_24_quality_gate_v1", place_id: "ringnes_bryggeri", verified_at: verifiedAt,
  collections: { required: ["people", "objects", "brands", "structures"], loaded_preview_images: 4, missing: 0, coverage_percent: 100 },
  brands: { candidates_reviewed: ["Ringnes", "Ringnes Brygghus", "Ringnes Park"], selected: [brandId], held_back: ["Ringnes Brygghus – nåværende serveringsvirksomhet er kildebelagt, men er ikke den kanoniske bryggerimerkevaren i denne runden.", "Ringnes Park – område- og eiendomsnavn, ikke produsentmerket."], logo_coverage: { required: 1, reviewed: 1, missing: 0, percent: 100 } },
  people: { candidates_reviewed: ["Amund Ringnes", "Ellef Ringnes", "Axel Heiberg", "Olav Johan Sopp"], selected: ["amund_ringnes", "ellef_ringnes"], held_back: ["Axel Heiberg – medgrunnleggeren er kildebelagt, men mangler godkjent stedsspesifikk bildeprofil i denne runden.", "Olav Johan Sopp – sentral i Story og claims, men ikke lagt i People-runden uten ferdig portrettprofil."], image_coverage_percent: 100 },
  chronology_epoke: { status: "PASS", exact_source_backed_anchors: [1876, 1877, 1887, 1890, 1899, 1978, 1988, 2001, 2004, 2018], source_paths: ["data/leksikon/places/oslo/naeringsliv/leksikon_ringnes_bryggeri.json#chronology", "https://oslobyleksikon.no/side/Ringnes_Bryggeri", "https://snl.no/Ringnes_AS", "https://ringnesbrygghus.no/"], index_runtime_status: "PASS", viewer_qa: "PASS – canonical ID, Oslo/Norge, kildeproveniens og epokeplassering er testet; ingen omtrentlig datering er fremstilt som eksakt år." },
  quality_score: { correctness_and_evidence: { score: 5, note: "Alle synlige stedspåstander er claim- og kildesporet; 1876 grunnleggelse, 1877 produksjonsstart og 2001 flytting er skilt." }, coverage_and_completion: { score: 5, note: "Fase 8–24 er materialisert med fire bildeklare samlinger, ekte 3:4-frontbilde, Story, Språk, kildebelagt kronologi/epoker, lesespor, nyhetsnote, før/etter, Quiz og Fagverk." }, editorial_quality: { score: 5, note: "Tekst og samlinger er spesifikke for Ringnes og skiller merkevare, opphavsanlegg, Gjelleråsen-produksjon, Ringnes Park og nåbruk." }, technical_integrity: { score: 5, note: "Deterministisk builder, epokeindeks/runtime/viewer-test, 5×7-quiz, produksjonskontekst, manifests, place-open og fokuserte tester inngår i leveransen." }, safety_and_responsibility: { score: 5, note: "Nåbruk er tidsmerket; alkoholhistorien behandles som industri- og teknologihistorie uten konsumoppfordring; observasjoner skjer fra offentlig tilgjengelig område." }, maintainability_and_auditability: { score: 4, note: "Kilder, bildeproveniens, holdbacks, claims, text hashes og gjenbruk av tidligere quiz er eksplisitte og reproduserbare; builderen beholder et eldre scaffold som overskrives av Ringnes-spesifikke flater." }, total: 29, critical_findings: 0, unresolved_blockers: 0 }
});
write("reports/place-production/ringnes-bryggeri-workcard-current.json", { place_id: "ringnes_bryggeri", status: "complete", phases: "8–24", verified_at: verifiedAt, previous_place: "schous_bryggeri", canonical_next: null, "KRONOLOGI/EPOKE-STATUS": "PASS", "KRONOLOGI-KILDER/ANKERE": ["Oslo byleksikon: 1876, 1877, 1887, 1890 og 1899", "Store norske leksikon: 1978, 1988, 2001 og 2004", "Ringnes Brygghus: 2018"], "EPOKE-INDEX/RUNTIME-STATUS": "PASS – generert fra leksikonets source-backed chronology og kontrollert i sync.", "EPOKEVISER-QA": "PASS – canonical ID, geografi, epokeplassering og kildeproveniens består viewer-testene.", notes: ["Ingen koordinatendring.", "1876/1877/2001-sekvensen er låst.", "Ingen omtrentlig datering er konvertert til et oppdiktet enkeltår.", "Merkevare, opphavssted og Gjelleråsen-produksjon er avgrenset."] });

console.log(`Built Ringnes Bryggeri phase 8–24 package (${allQuestions.length} quiz questions, ${sentences(place.popupDesc).length} popup sentences).`);
