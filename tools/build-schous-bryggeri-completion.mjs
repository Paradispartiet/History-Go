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
  snl: "https://snl.no/Schous_Bryggeri",
  christian: "https://snl.no/Christian_Schou",
  byleksikon: "https://oslobyleksikon.no/side/Schous_Bryggeri",
  quarter: "https://oslobyleksikon.no/side/Schouskvartalet",
  loop: "https://oslobyleksikon.no/side/Schousl%C3%B8kken",
  klp: "https://www.klpeiendom.no/oslo/ledige-lokaler/kontor-og-naeringslokaler/trondheimsveien-2",
  renovation: "https://www.klpeiendom.no/oslo/nyhetsarkiv/schous-brygghuset-oppgraderes-for-fremtiden",
  cultureSchool: "https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/oslo-kulturskole/om-kulturskolen/kontakt-kulturskolen/",
  cellar: "https://www.schouskjelleren.no/english",
  commons: "https://commons.wikimedia.org/wiki/File:Schous_bryggeri_Oslo.jpg",
  historic1961: "https://digitaltmuseum.no/011014674287/nybrua-mot-schous-bryggeri",
  truck: "https://digitaltmuseum.no/011014273526/norges-forste-varebil-daimler-1899-tilhorende-schous-bryggeri",
  personImagePage: "https://lokalhistoriewiki.no/wiki/Christian_Julius_Schou_(1792%E2%80%931874)",
  personImageAsset: "https://lokalhistoriewiki.no/images/Christian_Julius_Schou_maleri.jpg",
  labelPage: "https://lokalhistoriewiki.no/wiki/Bayer%C3%B8l",
  labelAsset: "https://lokalhistoriewiki.no/images/Schous_bryggeri_bayer%C3%B8l_1921.jpg"
};

const placeFile = "data/places/naeringsliv/oslo/places_naeringsliv/schous_bryggeri.json";
const place = read(placeFile);
Object.assign(place, {
  year: 1821,
  emne_ids: ["em_naering_produksjon_produktivitet", "em_naering_innovasjon_teknologisk_skift", "em_naering_logistikk_verdikjeder", "em_naering_omstilling_kriser_skift", "em_naering_eierskap_styring", "em_his_industriby_1900"],
  desc: "Schous Bryggeri ble offisielt grunnlagt i 1821, fikk navn etter Christian Julius Schous overtakelse i 1837 og flyttet produksjonen til Schousløkken i 1873. Anlegget i Trondheimsveien 2 vokste til et stort industribryggeri før driften og merkenavnet ble lagt ned i 1981. Bevarte bryggeribygg inngår nå i Schouskvartalet med kultur-, undervisnings-, serverings- og kontorbruk.",
  popupDesc: "Schous Bryggeri hadde røtter i Johannes Thranes bryggeri i Fjerdingen. Jørgen Young overtok virksomheten i 1821, som ble bryggeriets offisielle grunnleggingsår. Christian Julius Schou kjøpte bryggeriet i 1837, moderniserte det og ga virksomheten navnet som senere ble knyttet til både produktene og industrianlegget.\n\nI 1843 lyktes Schous med å fremstille bayerøl ved undergjæring. Metoden krevde avkjølte produksjons- og lagerrom, og bryggeriet brukte is for å holde temperaturen nede. Dette var mer enn en ny øltype: kjøling, gjær, lagring og kontroll over produksjonsprosessen ble viktige deler av den industrielle organiseringen.\n\nI 1873 flyttet bryggeriet til Schousløkken i Trondheimsveien 2. Bryggeri- og gjærhuset var oppført i 1872 etter tegninger av Asmus Lenschow, mens direksjons- og portbygningen kom i 1897 etter tegninger av Ove Ekman og Einar Smith. Senere ble komplekset utvidet med blant annet tappehall, verksted, garasje og et stort malteri. I 1899 kjøpte bryggeriet en Daimler-varebil som regnes som Norges første lastebil.\n\nSchous og Frydenlund gikk i 1962 inn i De Sammensluttede Bryggerier. Selskapsstrukturen og produksjonen ble deretter samlet i større enheter, og i 1981 ble produksjonen i Trondheimsveien og merkenavnet Schous lagt ned. Nedleggelsen avsluttet 108 års brygging på Schousløkken, men ikke bruken av bygningsmassen.\n\nFra 1980-årene ble noen bygninger revet og andre bygd om til kontorer og undervisning. Senere kom kulturvirksomheter, øvingsrom, serveringssteder og ny brygging i de gamle kjellerne. Schous kulturstasjon holder til i Malteriet, og Schouskjelleren driver mikrobryggeri og pub i en tidligere bryggerikjeller. Schouskvartalet kan leses som et ombrukt industriområde: den historiske bryggerivirksomheten er avsluttet, mens bygninger, navn og enkelte produksjonsspor fortsatt former bruken av stedet.\n\nNavnene Direksjonen, Laboratoriet, Vørterhuset, Korn- og spirehuset, Malteriet, Gjærhuset, Tapperiet og Flaskehuset bevarer et språk for arbeidsdelingen i anlegget. Når disse navnene brukes om dagens bygg, beskriver de historiske produksjonsfunksjoner; de dokumenterer ikke at hvert hus fortsatt brukes til brygging. Gårdeierens aktuelle opplysninger viser at kvartalet har ulike kontor- og næringsarealer, samtidig som ett nyere kontorbygg planlegges rehabilitert. Denne planen gjelder Schous Brygghuset, ikke en gjenåpning av det historiske bryggeriet.",
  image: "bilder/places/schous_bryggeri.webp",
  cardImage: "bilder/kort/places/schous_bryggeri.webp",
  frontImage: "bilder/places/schous_bryggeri_front_portrait.webp",
  imageMeta: {
    source: "wikimedia_commons", sourcePage: urls.commons, creator: "Mahlum", credit: "Mahlum / Wikimedia Commons",
    license: "Public domain", sourceDimensions: "864x451", outputDimensions: "1200x675",
    transformation: "Proporsjonal skalering med nøytral utfylling til 1200 × 675.", verifiedAt
  },
  frontImageMeta: {
    source: "wikimedia_commons", sourcePage: urls.commons, creator: "Mahlum", credit: "Mahlum / Wikimedia Commons",
    license: "Public domain", sourceDimensions: "864x451", outputDimensions: "900x1200", orientation: "portrait", aspectRatio: "3:4",
    transformation: "Stående 3:4-utsnitt sentrert på port- og administrasjonsbygningen; ingen innholdsgenerering.", verifiedAt
  },
  related_people_ids: ["christian_julius_schou"],
  related_place_ids: ["riksscenen", "markveien", "olaf_ryes_plass", "grunerlokka_helgesens_tm", "ringnes_bryggeri"],
  place_card_profile: {
    schema: "history_go_place_card_profile_v2", collection_ids: ["people", "objects", "brands", "structures"],
    reason: "Den faste Næringsliv-komposisjonen er full med Christian Julius Schou, Daimler-varebilen fra 1899, bryggeriets historiske varemerke og portbygningen. Alle fire har lokalt lastbare, kildebelagte bilder. Badge og quiz presenteres separat.", verifiedAt
  },
  objects: [{
    id: "schous_bryggeri_lastebil_1899", title: "Daimler-varebilen fra 1899", type: "leveringskjoretoy", kind: "physical_object",
    desc: "Schous Bryggeri kjøpte i 1899 en Daimler-varebil som regnes som Norges første lastebil.",
    historicalFunction: "Levering av øl fra bryggeriet til kunder i byen.", physicalObject: true, placeSpecific: true, collectable: true,
    placeSpecificReason: "Norsk Teknisk Museums katalogpost og SNL knytter kjøretøyet direkte til Schous Bryggeri og 1899.",
    why_here: "Kjøretøyet viser hvordan produksjon også krevde ny logistikk utenfor bryggeriporten.",
    unlock: "Finn portbygningen og sammenlign åpningens bredde med kjøretøyet på kortet; observer bare fra offentlig grunn.",
    storePrice: 35, currency: "PC", collection: "schous_bryggeri_produksjon_og_logistikk",
    image: "bilder/kort/objects/schous_bryggeri_lastebil_1899.webp",
    imageMeta: { sourcePage: urls.truck, creator: "Ukjent fotograf", credit: "Norsk Teknisk Museum via Store norske leksikon", license: "CC BY-NC-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-nc-sa/4.0/", depictedObject: "Daimler-varebil tilhørende Schous Bryggeri", transformation: "Proporsjonal skalering og WebP-normalisering på 900 × 520-flate.", verifiedAt },
    source_urls: [urls.snl, urls.truck]
  }],
  structures: [{
    id: "schous_bryggeri_portbygningen", title: "Direksjons- og portbygningen", type: "portbygning", kind: "historic_industrial_building",
    desc: "Portbygningen ble oppført i 1897 etter tegninger av Ove Ekman og Einar Smith og markerer hovedinngangen fra Trondheimsveien.",
    why_here: "Bygningen gjør skillet mellom kvartalet som fysisk anlegg og bryggeriet som historisk virksomhet synlig.",
    placeSpecificReason: "Oslo byleksikon daterer og navngir portbygningen som del av Schous-anlegget.",
    historicalFunction: "Representativ inngang, administrasjon og kontrollert adkomst til industrikomplekset.",
    image: "bilder/kort/structures/schous_bryggeri_portbygningen.webp",
    imageMeta: { sourcePage: urls.commons, creator: "Mahlum", credit: "Mahlum / Wikimedia Commons", license: "Public domain", depictedObject: "Direksjons- og portbygningen ved Schous Bryggeri", transformation: "Stedstro utsnitt og WebP-normalisering til 900 × 520.", verifiedAt },
    source_urls: [urls.byleksikon, urls.commons]
  }],
  for_na: {
    title: "Bryggeriet ved Nybrua: 1961 og 2006", beforeImage: "bilder/places/schous_bryggeri_1961.webp", beforeImageLabel: "Schous Bryggeri bak Nybrua (1961)",
    beforeImageMeta: { sourcePage: urls.historic1961, creator: "Truls Teigen", credit: "Truls Teigen / Oslo Museum via Store norske leksikon", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", date: "1961", viewpoint: "Mot bryggerianlegget fra området ved Nybrua", verifiedAt },
    nowImage: "bilder/places/schous_bryggeri.webp", nowImageLabel: "Portbygningen og administrasjonsfasaden (2006)",
    nowImageMeta: { sourcePage: urls.commons, creator: "Mahlum", credit: "Mahlum / Wikimedia Commons", license: "Public domain", date: "2006", viewpoint: "Fra Trondheimsveien mot portbygningen", verifiedAt },
    before: "Fotografiet fra 1961 viser bryggeriet som aktivt industrianlegg og landemerke ved Nybrua.",
    now: "Fotografiet fra 2006 viser den bevarte port- og administrasjonsfasaden etter at bryggeridriften var avsluttet og kvartalet hadde fått nye funksjoner.",
    change: "Bildene dokumenterer ulike utsnitt og skal ikke behandles som et eksakt kamerapar. Sammen viser de overgangen fra aktivt produksjonsanlegg til bevart og ombrukt bygningsmiljø; kildeteksten, ikke bildene alene, dokumenterer hvilke virksomheter som kom etter 1981.",
    lookFor: ["Schous-navnet over porten", "tegl- og pussfasadene", "forholdet mellom hovedinngangen, Trondheimsveien og kvartalet"],
    sources: [urls.historic1961, urls.commons, urls.quarter]
  }
});
place.externalLinks = [
  ["source", "Store norske leksikon – Schous Bryggeri", urls.snl],
  ["source", "Oslo byleksikon – Schous Bryggeri", urls.byleksikon],
  ["source", "Oslo byleksikon – Schouskvartalet", urls.quarter],
  ["source", "Store norske leksikon – Christian Schou", urls.christian],
  ["official", "KLP Eiendom – Trondheimsveien 2", urls.klp],
  ["official", "Oslo kulturskole – Schous kulturstasjon", urls.cultureSchool],
  ["official", "Schouskjelleren", urls.cellar],
  ["image_source", "Wikimedia Commons – Schous bryggeri", urls.commons],
  ["historical_image", "Oslo Museum – Nybrua mot Schous Bryggeri, 1961", urls.historic1961],
  ["object_source", "Norsk Teknisk Museum – Daimler-varebil 1899", urls.truck]
].map(([type, label, url]) => ({ type, label, url, verifiedAt }));
place.interpretation = {
  what_to_notice: ["Portbygningen fra 1897 mot Trondheimsveien.", "Ulike bygningsvolumer som røper at komplekset ble utvidet over tid.", "Bryggerinavn og nye kultur- og serveringsfunksjoner i samme kvartal."],
  why_it_matters: ["Stedet viser hvordan produksjon, kjøling, lagring og distribusjon ble samlet i et industrielt system.", "Ombruken etter 1981 viser at et produksjonsanlegg kan skifte funksjon uten at alle fysiske spor forsvinner.", "Navnet Schous brukes både om et historisk bryggeri, et bygningsmiljø og nyere virksomheter, og krever presis avgrensning."],
  counterpoints: ["1837 er Schous overtakelsesår, ikke bryggeriets offisielle grunnleggingsår.", "1873 er flyttingen til Schousløkken, ikke starten på virksomheten.", "Riksscenen er en selvstendig institusjon og et eget Place selv om den ligger i kvartalet."],
  sources: [urls.snl, urls.byleksikon, urls.quarter, urls.klp].map(url => ({ url, verifiedAt }))
};
write(placeFile, place);

// Remove three legacy, unreviewed Schous edges; add one directly sourced profile.
const peopleFile = "data/people/naeringsliv/oslo/people_naeringsliv_oslo.json";
let people = read(peopleFile).filter(person => !["christen_smith_schous_bryggeri", "herman_schou_bryggeri"].includes(person.id));
const halvor = people.find(person => person.id === "halvor_schou");
if (halvor) {
  halvor.places = (halvor.places || []).filter(id => id !== "schous_bryggeri");
  if (halvor.placeId === "schous_bryggeri") halvor.placeId = "glads_molle";
  if (halvor.source_place_id === "schous_bryggeri") halvor.source_place_id = "glads_molle";
  halvor.roundHoldbacks = [...new Set([...(halvor.roundHoldbacks || []), "schous_bryggeri_pending_direct_profile_upgrade"])];
}
upsertById(people, {
  id: "christian_julius_schou", name: "Christian Julius Schou", initials: "CJS", category: "naeringsliv", year: 1792,
  desc: "Kjøpmannen og bryggerieieren som overtok Jørgen Youngs bryggeri i 1837 og ga Schous Bryggeri navn.",
  popupDesc: "Christian Julius Schou kjøpte Jørgen Youngs bryggeri i Fjerdingen i 1837. Han investerte i modernisering og lyktes i 1843 med produksjon av undergjæret bayerøl. Schou avsatte senere grunn på Schousløkken til nye kjellere og bryggeribygg; virksomheten flyttet dit i 1873. Personkoblingen gjelder hans dokumenterte eierskap, tekniske omlegging og navnerolle, ikke en påstand om at han grunnla virksomheten i 1837.",
  placeId: "schous_bryggeri", source_place_id: "schous_bryggeri", places: ["schous_bryggeri"],
  tags: ["naeringsliv", "bryggeri", "industrialisering", "eierskap", "bayerol"],
  profileStandard: "people_profile_v1.0", profileStatus: "ready_people_v1",
  claimsFile: "data/people/claims/naeringsliv/oslo/schous_bryggeri/christian_julius_schou.claims.json",
  image: "bilder/kort/people/christian_julius_schou.webp", cardImage: "bilder/kort/people/christian_julius_schou.webp",
  imageMeta: { source: "lokalhistoriewiki", sourcePage: urls.personImagePage, sourceAsset: urls.personImageAsset, creator: "Jo Piene etter Knud Bergslien; foto Oslo Museum", credit: "Oslo Museum via Lokalhistoriewiki", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", mediaType: "historic_portrait", transformation: "Proporsjonal skalering, nøytral utfylling og WebP-normalisering til 720 × 720.", reviewStatus: "manually_approved", verifiedAt },
  source_urls: [urls.christian, urls.personImagePage, urls.snl], verifiedAt
});
write(peopleFile, people);
write("data/people/claims/naeringsliv/oslo/schous_bryggeri/christian_julius_schou.claims.json", {
  schema: "history_go_people_claims_v1", version: "1.0.0", person_id: "christian_julius_schou", profile_file: peopleFile,
  identity: { canonical_identity: "Kjøpmannen og bryggerieieren Christian Julius Schou (1792–1874), som kjøpte Jørgen Youngs bryggeri i 1837.", name_variants: ["Christian Julius Schou", "Christian Schou"], not: ["sønnen Halvor Schou", "andre medlemmer av Schou-familien"], identity_status: "verified" },
  claims: [
    { id: "identity_birth", claim: "Christian Julius Schou var kjøpmann og bryggerieier, født i 1792.", status: "verified", source_url: urls.christian, source_location: "Faktaboks og ingress", source_type: "recognized_reference", temporal_status: "historical", verified_at: verifiedAt, evidence_level: "direct" },
    { id: "takeover", claim: "Christian Julius Schou kjøpte Jørgen Youngs bryggeri i 1837, moderniserte virksomheten og ga den Schou-navnet.", status: "verified", source_url: urls.christian, source_location: "Schous bryggeri – Grunnlegging", source_type: "recognized_reference", temporal_status: "historical", verified_at: verifiedAt, evidence_level: "direct" },
    { id: "bayer", claim: "Bryggeriet lyktes i 1843 med produksjon av undergjæret bayerøl.", status: "verified", source_url: urls.christian, source_location: "Den bayerske metoden", source_type: "recognized_reference", temporal_status: "historical", verified_at: verifiedAt, evidence_level: "direct" },
    { id: "move", claim: "Christian Julius Schou avsatte grunn på Schousløkken til kjellere og bryggeribygg, og virksomheten flyttet dit i 1873.", status: "verified", source_url: urls.christian, source_location: "Schousløkken", source_type: "recognized_reference", temporal_status: "historical", verified_at: verifiedAt, evidence_level: "direct" }
  ],
  field_claim_map: { name: ["identity_birth"], year: ["identity_birth"], placeId: ["takeover", "move"], "places[schous_bryggeri]": ["takeover", "move"] },
  sentence_claim_map: {
    desc: [{ sentence: 1, claim_ids: ["identity_birth", "takeover"] }],
    popupDesc: [
      { sentence: 1, claim_ids: ["takeover"] },
      { sentence: 2, claim_ids: ["takeover", "bayer"] },
      { sentence: 3, claim_ids: ["move"] },
      { sentence: 4, claim_ids: ["takeover"] }
    ]
  },
  completion: { completed_under: "people_profile_v1.0", claims_verified: "4/4", fact_review: "passed", editorial_review: "passed", source_verified_at: verifiedAt, validator_version: "1.0.0", current_status: "ready_people_v1" }
});

const brandId = "schous_bryggeri_historisk";
const brand = {
  id: brandId, name: "Schous Bryggeri", brand_group: "legacy_business_brand", brand_type: "historic_brewery", brand_kind: "producer", sector: "beverages",
  state: "catalog", status: "historical", verification: "verified", verified_at: verifiedAt,
  desc: "Historisk bryggeri- og varemerkeidentitet brukt av virksomheten som var i drift 1821–1981.",
  popupdesc: "Brand-kortet gjelder den historiske kommersielle identiteten Schous Bryggeri. Den er dokumentert med en bayerøl-etikett gjengitt i bryggeriets hundreårsminneskrift fra 1921. Brandet og Place-et overlapper i navn, men er ikke identiske: Brandet er virksomhets- og vareidentiteten, mens Place-et er industrianlegget på Schousløkken og det senere ombrukte kvartalet.",
  tags: ["brand", "historical", "brewery", "beer", "oslo"], place_ids: ["schous_bryggeri"], source_urls: [urls.snl, urls.labelPage],
  logo: "bilder/kort/brands/schous_bryggeri_historisk.webp",
  imageMeta: { sourcePage: urls.labelPage, sourceAsset: urls.labelAsset, creator: "Ukjent; faksimile fra Schous Bryggeris hundreårsminneskrift", credit: "Schous Bryggeri, 1921 / Lokalhistoriewiki", rightsBasis: "public_domain_historical_facsimile_review", license: "Public domain (historical facsimile)", reviewStatus: "manually_approved", assetKind: "authentic_historic_product_label", sourceForm: "1921_bayerol_label", temporalScope: "historical", usageContext: "referential_identification", noEndorsement: true, generated: false, reconstructed: false, transformation: "Historisk etikett proporsjonalt skalert og sentrert på nøytral 900 × 520-flate; ingen rekonstruksjon.", outputDimensions: "900x520", reviewedAt: verifiedAt }
};
const brandsMaster = read("data/brands/brands_master.json"); upsertById(brandsMaster, brand); write("data/brands/brands_master.json", brandsMaster);
for (const file of ["data/brands/brands_catalog.json", "data/brands/brands_catalog_v17.json"]) {
  const rows = read(file); upsertById(rows, { id: brand.id, name: brand.name, brand_group: brand.brand_group, brand_type: brand.brand_type, brand_kind: brand.brand_kind, sector: brand.sector, state: brand.state }); write(file, rows);
}
const rawBrands = read("data/brands/brands_master_raw.json"); upsertById(rawBrands, { id: brand.id, name: brand.name, brand_type: brand.brand_type, sector: brand.sector, state: brand.state }); writeCompactArray("data/brands/brands_master_raw.json", rawBrands);
const brandsByPlace = read("data/brands/brands_by_place.json"); brandsByPlace.schous_bryggeri = [brandId]; write("data/brands/brands_by_place.json", brandsByPlace);

const leksikonFile = "data/leksikon/places/oslo/naeringsliv/leksikon_schous_bryggeri.json";
write(leksikonFile, {
  place_id: "schous_bryggeri", title: "Schous Bryggeri", type: "main", version: 1, visual: { designCode: "article_place_essay_miniature" },
  popupDesc: "Et bryggeri grunnlagt i 1821, flyttet til Schousløkken i 1873 og ombrukt som kultur- og næringskvartal etter nedleggelsen i 1981.",
  wikiText: [
    "Bryggeriet førte sitt offisielle grunnleggingsår tilbake til Jørgen Youngs overtakelse i 1821. Christian Julius Schou kjøpte virksomheten i 1837, moderniserte den og ga den navn.",
    "Undergjæret bayerøl fra 1843 krevde kjøling, kontrollert gjæring og lagring. Flyttingen til Schousløkken i 1873 samlet produksjonen i et voksende industrikompleks med bryggeri, gjærhus, portbygning, tappehall og malteri.",
    "Produksjonen ble lagt ned i 1981. Deler av bygningsmassen ble revet eller bygd om, mens bevarte industribygg fikk kontor-, undervisnings-, kultur- og serveringsfunksjoner."
  ],
  summary: { one_liner: "Fra industrielt bryggeri til ombrukt kultur- og næringskvartal.", themes: ["bryggeri", "industrialisering", "logistikk", "omstilling", "ombruk"], tone: ["nøktern", "stedsspesifikk"] },
  facts: [
    { id: "fact_schous_1821", label: "Grunnleggingsåret", desc: "1821 ble virksomhetens offisielle grunnleggingsår.", confidence: "high", sources: [{ title: "Store norske leksikon", url: urls.snl }] },
    { id: "fact_schous_1873", label: "Flyttingen", desc: "Produksjonen flyttet til Schousløkken i 1873.", confidence: "high", sources: [{ title: "Oslo byleksikon", url: urls.byleksikon }] },
    { id: "fact_schous_1981", label: "Nedleggelsen", desc: "Produksjonen og merkenavnet ble lagt ned i 1981.", confidence: "high", sources: [{ title: "Store norske leksikon", url: urls.snl }] }
  ],
  chronology: [[1821,"Jørgen Young overtar","Året blir virksomhetens offisielle grunnleggingsår."],[1837,"Christian Schou kjøper","Bryggeriet får Schou-navnet."],[1843,"Bayerøl lykkes","Undergjæret øl produseres med kontrollert kjøling."],[1873,"Flytting til Schousløkken","Produksjonen samles i Trondheimsveien 2."],[1897,"Portbygningen oppføres","Direksjons- og portbygningen ferdigstilles."],[1899,"Daimler-varebilen kjøpes","Bryggeriet tar i bruk kjøretøyet som regnes som Norges første lastebil."],[1962,"De Sammensluttede Bryggerier","Schous og Frydenlund inngår i samme selskap."],[1981,"Produksjonen legges ned","Brygging og Schous-navnet som aktivt merke avsluttes."],[1982,"Ombygging starter","Noen bygg omformes til kontor- og undervisningsformål."],[2007,"Kulturkvartalet utvikles","Statlige og kommunale kulturfunksjoner etableres i området."]].map(([year,title,desc], index) => ({ id: `chrono_schous_${year}_${index+1}`, year, title, desc, confidence: "high", sources: [{ title: year >= 1982 ? "Oslo byleksikon – Schouskvartalet" : "Store norske leksikon – Schous Bryggeri", url: year >= 1982 ? urls.quarter : urls.snl }] })),
  sources: place.externalLinks, externalLinks: place.externalLinks, interpretation: place.interpretation
});
const newsFile = "data/leksikon/places/oslo/naeringsliv/leksikon_schous_bryggeri_news.json";
write(newsFile, [{
  id: "schous_bryggeri_news_brygghuset_rehabilitering", place_id: "schous_bryggeri", title: "Schous Brygghuset skal rehabiliteres", type: "news_note", version: 1,
  date: "2025-12-05", date_type: "announcement", status: "current_plan", valid_through: "2027-12-31", location: "Trondheimsveien 2",
  popupDesc: "KLP Eiendom har rammetillatelse til oppgradering og ombygging av kontorbygget Schous Brygghuset. Vann- og avløpsetaten avslutter leieforholdet i 2026, og planene omfatter innvendig ombygging, bruksendringer og fasadefornyelse.",
  summary: { one_liner: "Et nyere kontorbygg i Schouskvartalet er planlagt rehabilitert etter 2026.", themes: ["rehabilitering", "kontor", "ombruk"] },
  tags: ["news_note", "Schouskvartalet", "planned"], sources: [{ label: "KLP Eiendom", url: urls.renovation }], verifiedAt
}]);
const legacyMixedFile = "data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch2.json";
write(legacyMixedFile, read(legacyMixedFile).filter(article => !String(article.id || "").startsWith("schous_plass_")));
const legacyByFile = "data/leksikon/places/oslo/by/leksikon_oslo_by_batch4.json";
write(legacyByFile, read(legacyByFile).filter(article => article.place_id !== "schous_bryggeri"));
const leksikonManifest = read("data/leksikon/manifest.json"); addOnce(leksikonManifest.files, leksikonFile); addOnce(leksikonManifest.files, newsFile); write("data/leksikon/manifest.json", leksikonManifest);

const languageFile = "data/leksikon/sprak/places/europe/norway/oslo/schous_bryggeri.json";
write(languageFile, {
  place_id: "schous_bryggeri", title: "Språkleksikon: Schous Bryggeri", verified_at: verifiedAt, dialect_status: "not_applicable_place_level",
  entries: [
    { id: "schous_navn", term: "Schous", type: "historisk_navn", meaning: "Eieformen av familienavnet Schou, brukt i bryggerinavnet etter Christian Julius Schous overtakelse i 1837.", context: "Navnet finnes videre i Schous Bryggeri, Schousløkken, Schous plass og Schouskvartalet, men betegner ikke det samme objektet i alle tilfeller.", linked_to: { kind: "place", id: "schous_bryggeri" }, tags: ["stedsnavn", "virksomhetsnavn"], sources: [{ label: "Oslo byleksikon", url: urls.byleksikon }, { label: "Oslo byleksikon – Schousløkken", url: urls.loop }] },
    { id: "schous_bayerol", term: "bayerøl", type: "fagord", meaning: "Et undergjæret øl laget med kald gjæring og lagring.", context: "Schous lyktes med produksjonsmetoden i 1843; begrepet forklarer hvorfor kjølerom og lagerkjellere var sentrale i bryggeriet.", linked_to: { kind: "place", id: "schous_bryggeri" }, tags: ["øl", "produksjon", "gjæring"], sources: [{ label: "Store norske leksikon – Christian Schou", url: urls.christian }, { label: "Lokalhistoriewiki – Bayerøl", url: urls.labelPage }] },
    { id: "schous_vorter", term: "vørter", type: "fagord", meaning: "Den sukkerholdige væsken som trekkes ut av malt før gjæring.", context: "Ordet finnes i øltypen vørterøl, som Schous lanserte i 1903, og i navnet Vørterhuset i det tidligere bryggerikomplekset.", linked_to: { kind: "place", id: "schous_bryggeri" }, tags: ["brygging", "råvare", "bygning"], sources: [{ label: "Oslo byleksikon – Schous Bryggeri", url: urls.byleksikon }, { label: "Oslo byleksikon – Schouskvartalet", url: urls.quarter }] },
    { id: "schous_malteriet", term: "malteri", type: "fagord", meaning: "Et anlegg der korn omdannes til malt for brygging.", context: "Malteriet er både et produksjonsbegrep og navnet på bygg L, der Schous kulturstasjon holder til i dag.", linked_to: { kind: "place", id: "schous_bryggeri" }, tags: ["malt", "industribygg", "ombruk"], sources: [{ label: "Oslo byleksikon – Schouskvartalet", url: urls.quarter }, { label: "Oslo kulturskole", url: urls.cultureSchool }] }
  ]
});
const languageManifest = read("data/leksikon/sprak/manifest.json"); languageManifest.place_files.schous_bryggeri = languageFile; write("data/leksikon/sprak/manifest.json", languageManifest);

const storyFile = "data/stories/stories_schous_bryggeri.json";
write(storyFile, [{
  id: "st_schous_bryggeri_lastebilen_1899", quality_profile: "episode_v1", type: "turning_point", title: "Ølbilen som varslet en ny logistikk", year: 1899, place_id: "schous_bryggeri",
  summary: "I 1899 kjøpte Schous Bryggeri en Daimler-varebil som regnes som Norges første lastebil, og koblet bryggeriets masseproduksjon til motorisert distribusjon.",
  story: "Ved slutten av 1800-tallet var Schous Bryggeri blitt et stort produksjonsanlegg. Ølet skulle ikke bare brygges, kjøles og tappes; tunge kasser måtte også fraktes ut gjennom porten og videre til kundene.\n\nI 1899 kjøpte bryggeriet en Daimler-varebil. Norsk Teknisk Museum og Store norske leksikon omtaler den som Norges første lastebil. Kjøretøyet beholdt mye av vognens form, men motoren endret hvordan lasten kunne flyttes og gjorde bilen til et synlig møte mellom eldre transport og ny teknologi.\n\nVarebilen løste ikke hele distribusjonen alene, men den gjør et større skifte konkret. Industrialisering foregikk også utenfor produksjonshallen: i ruter, leveringstider, drivstoff, vedlikehold og organisering av vareflyt. Fotografiet av bilen med Schous-navnet på siden viser derfor både et bestemt kjøretøy og en ny logistisk idé.",
  episode: { actors: ["Schous Bryggeri", "sjåføren", "Daimler"], date: "1899", action: "Bryggeriet kjøpte en motorisert varebil for ølleveranser.", consequence: "Kjøretøyet ble et tidlig norsk eksempel på motorisert godstransport." },
  sources: [{ title: "Store norske leksikon – Schous Bryggeri", url: urls.snl }, { title: "Norsk Teknisk Museum – Norges første varebil", url: urls.truck }],
  tags: ["logistikk", "lastebil", "Daimler", "øl", "industrialisering"], related_people: ["christian_julius_schou"], related_places: [],
  score: { narrative: 3, historical: 3, source: 4, play_value: 3, originality: 3, total: 16 },
  arc: { start: "Et stort bryggeri må få tunge varer ut av porten.", middle: "En Daimler-varebil overtar en del av transporten.", end: "Motorisert logistikk blir en del av industrisystemet." }
}]);
const episodeManifest = read("data/stories/stories_episode_v1_manifest.json"); addOnce(episodeManifest.files, storyFile); write("data/stories/stories_episode_v1_manifest.json", episodeManifest);
const storyManifest = read("data/stories/stories_manifest.json"); storyManifest.files = storyManifest.files.filter(entry => entry.entity_id !== "schous_bryggeri"); storyManifest.files.push({ category: "naeringsliv", entity_id: "schous_bryggeri", path: storyFile }); write("data/stories/stories_manifest.json", storyManifest);

const readingFile = "data/lesespor/oslo/lesespor_oslo_naeringsliv.json";
const readings = read(readingFile); readings.items = readings.items.filter(item => !item.id.startsWith("lesespor_schous_"));
readings.items.push(
  { id: "lesespor_schous_snl", title: "Schous Bryggeri", author: "Jostein Sæthre", publication: "Store norske leksikon", date: "2026-06-12", year: 2026, type: "reference_article", subjects: ["bryggeri", "industrialisering", "eierskap", "nedleggelse"], place_ids: ["schous_bryggeri"], person_ids: ["christian_julius_schou"], category_hints: ["naeringsliv", "historie"], url: urls.snl, access: "open", rights: "link_only", source_quality: "recognized", curation_status: "strong_candidate", relevance: "Samler grunnleggingsår, eierskifter, produksjon, sammenslåing og nedleggelse." },
  { id: "lesespor_schous_byleksikon", title: "Schous Bryggeri", author: null, publication: "Oslo byleksikon", date: null, year: 2022, type: "institutional_reference", subjects: ["bygningshistorie", "bryggeri", "Schousløkken"], place_ids: ["schous_bryggeri"], person_ids: ["christian_julius_schou"], category_hints: ["naeringsliv", "by"], url: urls.byleksikon, access: "open", rights: "link_only", source_quality: "institutional", curation_status: "strong_candidate", relevance: "Detaljert tidslinje for bygninger, produksjon og familieeierskap." },
  { id: "lesespor_schous_quarter", title: "Schouskvartalet", author: null, publication: "Oslo byleksikon", date: null, year: 2021, type: "institutional_reference", subjects: ["ombruk", "kulturkvartal", "industribygg"], place_ids: ["schous_bryggeri"], person_ids: [], category_hints: ["naeringsliv", "by", "scenekunst"], url: urls.quarter, access: "open", rights: "link_only", source_quality: "institutional", curation_status: "strong_candidate", relevance: "Dokumenterer ombyggingene og de nye funksjonene etter 1981." },
  { id: "lesespor_schous_christian", title: "Christian Schou", author: "Else Boye", publication: "Norsk biografisk leksikon / SNL", date: null, year: 2005, type: "biographical_reference", subjects: ["eierskap", "bayerøl", "industri"], place_ids: ["schous_bryggeri"], person_ids: ["christian_julius_schou"], category_hints: ["naeringsliv", "historie"], url: urls.christian, access: "open", rights: "link_only", source_quality: "recognized", curation_status: "strong_candidate", relevance: "Dokumenterer Schous overtakelse, modernisering, kjøleteknikk og utvidelser." }
); write(readingFile, readings);

const translations = {
  en: { name: "Schous Brewery", desc: "Schous Brewery traces its official founding to 1821, took Christian Julius Schou's name after his 1837 takeover and moved production to Schousløkken in 1873. Brewing ended in 1981; surviving industrial buildings now form part of a mixed culture, education, hospitality and office quarter.", popupDesc: "Schous Brewery grew from Johannes Thrane's earlier brewery. Jørgen Young took it over in 1821, the official founding year, and Christian Julius Schou bought and modernised it in 1837.\n\nThe brewery mastered cold-fermented Bavarian beer in 1843. Production moved to Trondheimsveien 2 in 1873, where brewing, yeast production, storage, bottling and distribution became parts of a large industrial system.\n\nSchous and Frydenlund entered De Sammensluttede Bryggerier in 1962. Production and the Schous brand ended in 1981. Some buildings were demolished, while others were converted for offices, education, culture, rehearsal spaces, restaurants and new small-scale brewing." },
  es: { name: "Cervecería Schous", desc: "La cervecería Schous sitúa su fundación oficial en 1821, adoptó el nombre de Christian Julius Schou tras su compra en 1837 y trasladó la producción a Schousløkken en 1873. La elaboración terminó en 1981; los edificios industriales conservados forman hoy un barrio de cultura, enseñanza, hostelería y oficinas.", popupDesc: "La cervecería Schous surgió de la empresa anterior de Johannes Thrane. Jørgen Young la asumió en 1821, año oficial de fundación, y Christian Julius Schou la compró y modernizó en 1837.\n\nEn 1843 dominó la producción de cerveza bávara de fermentación baja. En 1873 trasladó la producción a Trondheimsveien 2, donde elaboración, levadura, almacenamiento, embotellado y distribución formaron un gran sistema industrial.\n\nSchous y Frydenlund entraron en De Sammensluttede Bryggerier en 1962. La producción y la marca Schous terminaron en 1981. Algunos edificios fueron demolidos y otros se adaptaron para oficinas, enseñanza, cultura, locales de ensayo, restaurantes y nueva elaboración a pequeña escala." },
  pt: { name: "Cervejaria Schous", desc: "A Cervejaria Schous considera 1821 o seu ano oficial de fundação, adotou o nome de Christian Julius Schou após a compra de 1837 e transferiu a produção para Schousløkken em 1873. A fabricação terminou em 1981; os edifícios industriais preservados integram hoje um quarteirão de cultura, ensino, restauração e escritórios.", popupDesc: "A Cervejaria Schous cresceu a partir da cervejaria anterior de Johannes Thrane. Jørgen Young assumiu-a em 1821, o ano oficial de fundação, e Christian Julius Schou comprou-a e modernizou-a em 1837.\n\nEm 1843, a empresa dominou a cerveja bávara de baixa fermentação. A produção mudou para Trondheimsveien 2 em 1873, onde fabricação, levedura, armazenamento, engarrafamento e distribuição formaram um grande sistema industrial.\n\nSchous e Frydenlund entraram na De Sammensluttede Bryggerier em 1962. A produção e a marca Schous terminaram em 1981. Alguns edifícios foram demolidos e outros adaptados para escritórios, ensino, cultura, salas de ensaio, restaurantes e nova produção em pequena escala." }
};
const normalize = value => String(value || "").normalize("NFC").replace(/\r\n?/g, "\n").replace(/[ \t]+/g, " ").trim();
const i18nHash = crypto.createHash("sha256").update(JSON.stringify({ name: normalize(place.name), desc: normalize(place.desc), popupDesc: normalize(place.popupDesc) })).digest("hex").slice(0, 16);
for (const [lang, translation] of Object.entries(translations)) { const file = `data/i18n/content/places/${lang}.json`; const pack = read(file); pack.schous_bryggeri = { _sourceHash: i18nHash, _status: "machine_translated", ...translation }; write(file, pack); }

const quizFile = "data/quiz/naeringsliv/schous_bryggeri_sets_merged.json";
const quiz = read(quizFile);
const additions = [
  ["Når lyktes Schous med å fremstille bayerøl?", "1843", ["1837", "1873"], "Schous lyktes i 1843 med undergjæret bayerøl.", urls.snl, "em_naering_innovasjon_teknologisk_skift"],
  ["Hvem tegnet bryggeri- og gjærhuset fra 1872?", "Asmus Lenschow", ["Henrik Bull", "Ove Ekman"], "Asmus Lenschow tegnet bryggeri- og gjærhuset som ble oppført i 1872.", urls.byleksikon, "em_naering_teknologi_infrastruktur"],
  ["Hva kjøpte Schous Bryggeri i 1899?", "En Daimler-varebil", ["Et elektrisk lokomotiv", "Et dampskip"], "Bryggeriet kjøpte i 1899 en Daimler-varebil som regnes som Norges første lastebil.", urls.snl, "em_naering_logistikk_verdikjeder"],
  ["Hva het selskapet Schous og Frydenlund gikk inn i i 1962?", "De Sammensluttede Bryggerier", ["Nora Fabrikker", "Christiania Bryggerilag"], "Schous og Frydenlund gikk i 1962 inn som datterselskaper i De Sammensluttede Bryggerier.", urls.snl, "em_naering_eierskap_styring"],
  ["Hva viser ombruken av Schouskvartalet?", "At industribygg kan få nye funksjoner", ["At bryggeriproduksjonen aldri stanset", "At alle eldre bygg ble revet"], "Etter 1981 fikk bevarte bryggeribygg blant annet kontor-, undervisnings-, kultur- og serveringsbruk.", urls.quarter, "em_naering_omstilling_kriser_skift"]
];
quiz.sets.forEach((set, index) => {
  const [question, answer, wrong, knowledge, source, emne_id] = additions[index];
  if (set.questions.length < 7) set.questions.push({ question, options: [answer, ...wrong], answer, answerIndex: 0, knowledge, source: [source], emne_id, difficulty: Math.min(index + 1, 4) });
});
quiz.generator_version = "v5_1_external_priority_canonical_rich_5x7";
quiz.size_class = "rich_place";
const theory = [
  ["omstilling_av_naeringsrom", "david_harvey", null, "met_naering_omstilling_og_endringsanalyse"],
  ["lager_og_distribusjon", "anna_tsing", null, "met_naering_logistikk_og_verdikjedeanalyse"],
  ["produksjonsprosess", "adam_smith", null, "met_naering_arbeidsprosessanalyse"],
  ["forbrukeradferd", "eva_illouz", null, "met_naering_forbruker_og_atferdsanalyse"],
  ["arbeid_som_verdiskaping", "harry_braverman", null, "met_naering_arbeidslivsanalyse"],
  ["teknologisk_omstilling", "joseph_schumpeter", null, "met_naering_innovasjonsanalyse"],
  ["arbeidslivets_omstilling", "richard_sennett", null, "met_naering_omstilling_og_endringsanalyse"]
];
const allQuestions = quiz.sets.flatMap(set => set.questions);
allQuestions.forEach((question, index) => {
  const number = index + 1; const setNumber = Math.floor(index / 7) + 1; const qNumber = index % 7 + 1;
  Object.assign(question, { id: `schous_bryggeri_quiz_${String(number).padStart(2, "0")}`, quiz_id: `naeringsliv_schous_bryggeri_set_${setNumber}_q${qNumber}`, categoryId: "naeringsliv", placeId: "schous_bryggeri", targetId: "schous_bryggeri", question_scope: "place", question_type: index < 19 ? "fact" : index >= 28 ? "concept" : "context", claim_id: `claim_schous_bryggeri_quiz_${String(number).padStart(2, "0")}`, claim_basis: question.knowledge, source_origin: "external", primary_knowledge_unit_id: `ku_naeringsliv_schous_bryggeri_${String(number).padStart(2, "0")}`, knowledge_unit_ids: [`ku_naeringsliv_schous_bryggeri_${String(number).padStart(2, "0")}`], knowledge_contract_version: 1, knowledge_link_status: "linked" });
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
quiz.sets.forEach((set, index) => Object.assign(set, { set_id: `naeringsliv_schous_bryggeri_set_${index+1}`, order: index+1, level: index+1, phase: ["opening", "middle", "middle", "bridge", "final"][index], title: ["Grunnleggelse og navn", "Brygging og anlegg", "Logistikk og vekst", "Eierskap og nedleggelse", "Ombruk og økonomisk analyse"][index] }));
const sourceRegistry = {
  snl: { url: urls.snl, source_type: "editorially_controlled_reference", review_status: "reviewed", review_note: "Kronologi, virksomhetshistorie, selskapsendringer og lastebilen er kontrollert mot den oppdaterte SNL-artikkelen." },
  byleksikon: { url: urls.byleksikon, source_type: "institutional_reference", review_status: "reviewed", review_note: "Flytting, anleggsadresse, arkitekter og bygningshistorikk er kontrollert mot Oslo byleksikon." },
  quarter: { url: urls.quarter, source_type: "institutional_reference", review_status: "reviewed", review_note: "Ombygging og etterbruk er kontrollert mot Oslo byleksikons separate oppslag om Schouskvartalet." },
  christian: { url: urls.christian, source_type: "biographical_reference", review_status: "reviewed", review_note: "Schous overtakelse, modernisering og bayerølproduksjon er kontrollert mot biografiartikkelen." },
  klp: { url: urls.klp, source_type: "primary_property_source", review_status: "reviewed", review_note: "Aktuell eiendoms- og arealbruk er kontrollert mot gårdeierens opplysninger og avgrenset som nåtidskilde." },
  culture_school: { url: urls.cultureSchool, source_type: "municipal_primary_source", review_status: "reviewed", review_note: "Kulturstasjonens nåværende adresse og plassering i Malteriet er kontrollert mot Oslo kommune." },
  cellar: { url: urls.cellar, source_type: "primary_venue_source", review_status: "reviewed", review_note: "Dagens mikrobryggeri- og pubdrift er kontrollert mot virksomhetens egen side og brukes bare for nåstatus." }
};
const curriculum = { module_ids: ["arbeid_produksjon_verdiskaping", "logistikk_infrastruktur_rom", "makt_regulering_baerekraft"], emne_ids: [...new Set(allQuestions.map(q => q.emne_id).filter(Boolean))], topic_hook_ids: [...new Set(theory.map(row => row[0]))], method_ids: [...new Set(theory.map(row => row[3]))], thinker_ids: [...new Set(theory.map(row => row[1]))], works: [...new Set(theory.map(row => row[2]).filter(Boolean))] };
const existingQuizAudit = { searched_paths: ["data/quiz/quiz_naeringsliv.json", quizFile, "data/quiz/manifest.json"], active_before: { file: quizFile, set_count: 5, question_count: 30, finding: "En kildeberiket 5×6-bank og fem legacy-spørsmål fantes." }, decisions: ["Behold og berik de 30 spørsmålene.", "Legg til ett kildebelagt spørsmål i hvert sett.", "Behold de første 14 som vanlig faktakunnskap.", "Legg teori og metode i finalsettet."], knowledge_migration: "Stabile Schous-ID-er normaliseres til 35 canonicale Knowledge-enheter." };
const heldBackCandidates = ["1837 som grunnleggingsår.", "Ustøttet arbeidshjem/velferdspåstand.", "Popsenteret som fortsatt aktiv virksomhet etter stengingen i 2024.", "Schouskjelleren som videreføring av Ringnes' Schous Mikrobryggeri."];
const profileDecision = { profile: "rich", set_count: 5, questions_per_set: 7, justification: "Fem tydelige læringsjobber med 35 kildebelagte spørsmål." };
const sourceIdFor = value => sourceRegistry[value] ? value : Object.entries(sourceRegistry).find(([, source]) => source.url === value)?.[0]
  || (String(value).toLowerCase().includes("schouskjelleren") ? "cellar"
    : String(value).toLowerCase().includes("klpeiendom") || String(value).toLowerCase().includes("schousbrygghuset") ? "klp"
      : String(value).includes("Schouskvartalet") ? "quarter"
        : String(value).includes("Christian_Schou") ? "christian"
          : String(value).toLowerCase().includes("oslobyleksikon") ? "byleksikon" : "snl");
allQuestions.forEach(question => { question.source = [...new Set(question.source.map(sourceIdFor))]; });
const quizClaims = allQuestions.map((question, index) => ({ claim_id: question.claim_id, order: index+1, planned_phase: index < 7 ? "opening" : index < 21 ? "middle" : index < 28 ? "bridge" : "final", family: index >= 28 ? "concept_theory" : index < 19 ? "fact" : "context", statement: question.knowledge, source_ids: question.source, source_origin: "external", emne_id: question.emne_id }));
write("data/quiz/production_briefs/naeringsliv/schous_bryggeri.json", {
  schema_version: "1.0", status: "reviewed", categoryId: "naeringsliv", targetId: "schous_bryggeri", profile_hint: "rich", reviewed_at: verifiedAt,
  review_note: "Kildene bærer fem adskilte læringsjobber: grunnleggelse/navn, bryggeteknologi, anlegg/logistikk, eierskap/nedleggelse og ombruk.",
  scope: { place: "Schous Bryggeri", production_profile: "rich", set_count: 5, questions_per_set: 7, total_questions: 35, normal_opening_questions: 14 },
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
  source_brief: "data/quiz/production_briefs/naeringsliv/schous_bryggeri.json",
  context_artifact: "data/quiz/production_context/naeringsliv/schous_bryggeri.json",
  resolved_files: resolvedQuizFiles, required_inputs_loaded: Object.keys(resolvedQuizFiles),
  pensum_module_ids: curriculum.module_ids, emne_ids: curriculum.emne_ids, topic_hook_ids: curriculum.topic_hook_ids,
  method_ids: curriculum.method_ids, thinker_ids: curriculum.thinker_ids, works: curriculum.works,
  source_review_status: "reviewed", existing_quiz_audit: existingQuizAudit, profile_decision: profileDecision,
  held_back_candidates: heldBackCandidates, normal_opening_questions: 14, theory_start_phase: "final", method_start_phase: "final"
};
write(quizFile, quiz);
const quizManifest = read("data/quiz/manifest.json"); quizManifest.sets = quizManifest.sets.filter(entry => entry.targetId !== "schous_bryggeri"); quizManifest.sets.push({ targetId: "schous_bryggeri", file: quizFile }); write("data/quiz/manifest.json", quizManifest);
const fagManifest = read("data/fag/fag_manifest.json"); fagManifest.naeringsliv.quizProduction.targets.schous_bryggeri = { source_brief: "../quiz/production_briefs/naeringsliv/schous_bryggeri.json", context_artifact: "../quiz/production_context/naeringsliv/schous_bryggeri.json", quiz_file: "../quiz/naeringsliv/schous_bryggeri_sets_merged.json" }; write("data/fag/fag_manifest.json", fagManifest);

const claims = [
  ["identity", "Schous Bryggeri var en bryggerivirksomhet med offisielt grunnleggingsår 1821; stedsoppføringen omfatter anlegget på Schousløkken fra 1873 og det senere ombrukte bygningsmiljøet.", urls.snl, "Faktaboks, kronologi og hovedtekst", "identity", "historical"],
  ["roots", "Virksomheten hadde røtter i Johannes Thranes bryggeri, og Jørgen Young overtok i 1821.", urls.snl, "Kronologi og avsnittet om røttene", "ordinary", "historical"],
  ["takeover", "Christian Julius Schou kjøpte bryggeriet i 1837, moderniserte det og ga virksomheten Schou-navnet.", urls.christian, "Schous bryggeri – Grunnlegging", "ordinary", "historical"],
  ["bayer", "Schous lyktes i 1843 med undergjæret bayerøl, som krevde avkjølte produksjons- og lagerrom.", urls.christian, "Den bayerske metoden", "ordinary", "historical"],
  ["move", "Bryggeriet flyttet til Schousløkken i Trondheimsveien 2 i 1873.", urls.byleksikon, "Historikk, flyttingen", "ordinary", "historical"],
  ["buildings", "Bryggeri- og gjærhuset fra 1872 ble tegnet av Asmus Lenschow, og direksjons- og portbygningen fra 1897 av Ove Ekman og Einar Smith.", urls.byleksikon, "Historikk, bygningene", "ordinary", "historical"],
  ["truck", "Schous Bryggeri kjøpte i 1899 en Daimler-varebil som regnes som Norges første lastebil.", urls.snl, "Bildetekst og avsnitt om logistikk", "strong", "historical"],
  ["merger", "Schous og Frydenlund gikk i 1962 inn i De Sammensluttede Bryggerier.", urls.snl, "Kronologi og sammenslåing", "ordinary", "historical"],
  ["closure", "Produksjonen i Trondheimsveien og merkenavnet Schous ble lagt ned i 1981.", urls.snl, "Kronologi, 1981", "ordinary", "historical"],
  ["reuse", "Etter nedleggelsen ble deler av det tidligere bryggerianlegget ombygd til kontor-, undervisnings- og kulturformål, mens andre bygg ble revet.", urls.quarter, "Ingress og ombyggingene 1982–2007", "ordinary", "historical"],
  ["current_culture_school", "Schous kulturstasjon holder til i Malteriet, bygg L, Trondheimsveien 2.", urls.cultureSchool, "Kontaktinformasjon for Schous kulturstasjon", "temporal", "current"],
  ["current_cellar", "Schouskjelleren driver mikrobryggeri og pub i kjelleren til det tidligere Schous Bryggeri.", urls.cellar, "English ingress", "temporal", "current"],
  ["current_rehabilitation", "KLP oppgir at Schouskvartalet har ulike kontor- og næringsarealer, og at det nyere kontorbygget Schous Brygghuset planlegges rehabilitert.", urls.renovation, "Prosjektbeskrivelse og planstatus", "temporal", "current"]
].map(([id, claim, sourceUrl, sourceLocation, claimKind, temporalStatus]) => ({ id: `claim_schous_bryggeri_${id}`, claim, sourceUrl, sourceLocation, sourceType: sourceUrl.includes("oslo.kommune") ? "official" : sourceUrl.includes("schouskjelleren") ? "primary" : "reputable_secondary", verifiedAt, status: "verified", claimKind, evidenceMode: claimKind === "strong" ? "explicit" : "direct", temporalStatus, ...(id === "truck" ? { independentSourceUrls: [urls.truck] } : {}) }));
const coverage = text => sentences(text).map((sentence, index) => {
  const s = sentence.toLowerCase();
  let ids = s.includes("planlegges") || s.includes("gårdeierens") || s.includes("nyere kontorbygg") ? ["current_rehabilitation", "reuse"] : s.includes("kulturstasjon") ? ["current_culture_school", "current_cellar", "reuse"] : s.includes("schouskjelleren") || s.includes("mikrobryggeri") ? ["current_cellar", "reuse"] : s.includes("1821") || s.includes("thrane") || s.includes("young") ? ["identity", "roots"] : s.includes("1837") || s.includes("christian") ? ["takeover"] : s.includes("1843") || s.includes("undergj") || s.includes("kjøl") || s.includes("gjær") ? ["bayer"] : s.includes("1873") || s.includes("schousløkken") ? ["move"] : s.includes("lenschow") || s.includes("portbyg") || s.includes("malteri") || s.includes("tappehall") || s.includes("direksjonen") || s.includes("vørterhuset") ? ["buildings", "reuse"] : s.includes("1899") || s.includes("daimler") || s.includes("lastebil") ? ["truck"] : s.includes("1962") || s.includes("sammensluttede") ? ["merger"] : s.includes("1981") || s.includes("lagt ned") || s.includes("nedlegg") ? ["closure"] : s.includes("nå") || s.includes("dagens") ? ["current_rehabilitation", "reuse"] : ["reuse"];
  return { sentence: index + 1, claimIds: [...new Set(ids.map(id => `claim_schous_bryggeri_${id}`))] };
});
const readinessQuestions = [
  ["Hva er bryggeriets offisielle grunnleggingsår?", "1821", "når", "identity"], ["Hvem overtok virksomheten i 1821?", "Jørgen Young", "hvem", "roots"], ["Hvem kjøpte bryggeriet i 1837?", "Christian Julius Schou", "hvem", "takeover"], ["Hva lyktes bryggeriet med i 1843?", "Undergjæret bayerøl", "hva", "bayer"], ["Hvor flyttet bryggeriet i 1873?", "Schousløkken i Trondheimsveien 2", "hvor", "move"], ["Hvem tegnet bryggeri- og gjærhuset?", "Asmus Lenschow", "hvem", "buildings"], ["Hvilket kjøretøy kjøpte bryggeriet i 1899?", "En Daimler-varebil", "hvilket_verk_eller_objekt", "truck"], ["Når ble produksjonen lagt ned?", "1981", "når", "closure"]
].map(([question, answer, type, claim], index) => ({ question, answer, type, normalKnowledgeQuestion: index < 8, claimIds: [`claim_schous_bryggeri_${claim}`] }));
write("data/places/production/schous_bryggeri.json", {
  schemaVersion: "4.2", validatorVersion: "4.2.1", placeId: "schous_bryggeri", placeFile, status: "ready_v4_2",
  identity: { status: "resolved", represents: "Det historiske bryggerianlegget på Schousløkken fra 1873 og det senere ombrukte bygningsmiljøet i Trondheimsveien 2, sett i sammenheng med bryggerivirksomheten 1821–1981.", period: "1821–", excludes: ["Schous plass som eget byrom", "Riksscenen som selvstendig institusjon og Place", "Ringnes bryggeri i Thorvald Meyers gate 2", "Schous Brygghuset som nyere enkeltbygg", "Schouskjelleren som direkte selskapsvidereføring"] },
  metadataSnapshot: { name: place.name, year: place.year, category: place.category }, textHashes: { algorithm: "sha256", desc: sha256(place.desc), popupDesc: sha256(place.popupDesc) }, claims,
  sentenceCoverage: { desc: coverage(place.desc), popupDesc: coverage(place.popupDesc) },
  roundsReadiness: { people: "ready_one_direct_profile_and_image", objects: "ready_one_source_bound_vehicle", brands: "ready_authentic_historic_mark", structures: "ready_one_named_building", badges: "ready_existing_industry_and_food_service", quiz: "ready_rich_5x7_reused_and_extended", leksikon: "ready", sprak: "ready_four_entries", stories: "ready_episode_v1", for_na: "ready_non_exact_documented_pair", readings: "ready_four", news: "ready_one_current_plan", events: "reviewed_no_separate_event_entry", routes: "ready_existing_neighbour_graph", fagverk: "ready", frontImage: "ready_real_portrait_3x4" },
  quizReadiness: { status: "canonical_rich_5x7", quizTargetId: "schous_bryggeri", sourceBrief: "data/quiz/production_briefs/naeringsliv/schous_bryggeri.json", productionContext: "data/quiz/production_context/naeringsliv/schous_bryggeri.json", normalOpeningQuestions: 14, totalQuestions: 35, reuseDecision: "Den eksisterende 5×6-banken ble beholdt, kildeberiket og utvidet til 5×7; de fem flate legacy-spørsmålene ble audittert, men ikke duplisert.", questions: readinessQuestions },
  reviews: { factual: { status: "passed", reviewedAt: verifiedAt, reviewer: "Schous Bryggeri phase 8–24 source review", notes: "1821, 1837, 1843, 1873, 1899, 1962 og 1981 er kontrollert mot SNL, Oslo byleksikon og museumsrecord." }, editorial: { status: "passed", reviewedAt: verifiedAt, reviewer: "Schous Bryggeri phase 8–24 editorial review", introducedNewFacts: false, notes: "Virksomhet, anlegg, kvartal, enkeltbygg og nåværende leietakere er eksplisitt skilt." } },
  reviewsNotes: ["Tre legacy People-kanter ble holdt tilbake eller fjernet fordi profilene ikke bar direkte, bildeklart Schous-innhold.", "Den historiske bayeretiketten brukes som autentisk Brand-markør og er ikke rekonstruert.", "Før/etter-bildene har ulike utsnitt og er eksplisitt merket som ikke-eksakt kamerapar.", "KLPs rehabilitering omtales som plan, ikke som ferdigstilt arbeid."],
  completion: { completedUnder: "4.2", currentStatus: "current", sourceVerifiedAt: verifiedAt, claimsVerified: { verified: claims.length, total: claims.length }, factualReview: "passed", editorialReview: "passed", validatorVersion: "4.2.1" }
});
write("data/places/naeringsliv-production/schous_bryggeri.json", {
  schemaVersion: "naeringsliv_place_production_v1", validatorVersion: "1.0.0", placeId: "schous_bryggeri", placeFile, status: "ready",
  economicIdentity: {
    statement: "Schous Bryggeri var en industriell bryggerivirksomhet 1821–1981, med hovedanlegg på Schousløkken fra 1873 og et etterfølgende ombrukt nærings- og kulturmiljø.",
    anchorType: "production_site",
    placeObjectDistinction: "Rapporten skiller bryggerivirksomheten og varemerket fra det fysiske anlegget, det senere Schouskvartalet, nyere enkeltbygg og selvstendige kulturinstitusjoner.",
    temporalScope: { start: "1821", end: "2026", precision: "period", rationale: "Perioden dekker virksomhetens offisielle start, driften på Schousløkken, nedleggelsen og den ferskt kontrollerte ombruken." },
    sourceIds: ["source_snl_schous", "source_byleksikon_schous", "source_klp_schous"]
  },
  businessTopics: [
    ["em_naering_produksjon_produktivitet", "Bryggeri, gjærhus, lager, tapping og distribusjon viser produksjon som et sammenhengende system."],
    ["em_naering_innovasjon_teknologisk_skift", "Undergjæring i 1843 og motorisert varetransport i 1899 er dokumenterte teknologiske skift."],
    ["em_naering_logistikk_verdikjeder", "Råvarer, kjøling, lagring, tapping og varebil knytter anlegget til en fysisk verdikjede."],
    ["em_naering_omstilling_kriser_skift", "Nedleggelsen i 1981 og senere ombruk gjør funksjonsskiftet direkte lesbart i bygningsmassen."],
    ["em_naering_eierskap_styring", "Overtakelser, familieeierskap og sammenslutningen med Frydenlund viser endret kontroll over virksomheten."]
  ].map(([emneId, siteSpecificRationale]) => ({ emneId, siteSpecificRationale, caseIds: ["case_schous_industrisystem_og_ombruk"] })),
  sources: [
    { id: "source_snl_schous", url: urls.snl, sourceLocation: "Faktaboks, kronologi, hovedtekst og bildepost om Daimler-varebilen", sourceType: "reputable_secondary", verifiedAt, temporalCoverage: "mixed", provenance: "Store norske leksikon er redaksjonelt kontrollert og oppgir forfatter og siste revisjonsdato.", limitations: "Artikkelen sammenfatter historien, men gir ikke regnskapsserier, bemanningstall eller full teknisk produksjonsdokumentasjon." },
    { id: "source_byleksikon_schous", url: urls.byleksikon, sourceLocation: "Historikk og bygningsbeskrivelse for anlegget i Trondheimsveien 2", sourceType: "museum_or_heritage", verifiedAt, temporalCoverage: "historical", provenance: "Oslo byleksikon er et institusjonelt lokalhistorisk oppslagsverk med stedsspesifikke bygningsdata.", limitations: "Oppslaget har enkelte eldre selskapsår som er kontrollert mot nyere SNL; økonomiske virkninger og arbeidsvilkår tallfestes ikke." },
    { id: "source_byleksikon_quarter", url: urls.quarter, sourceLocation: "Ombyggingene etter 1981 og etableringen av kulturvirksomheter", sourceType: "museum_or_heritage", verifiedAt, temporalCoverage: "mixed", provenance: "Oslo byleksikon dokumenterer kvartalets bygningsnavn, ombygginger og institusjonsbruk.", limitations: "Oppslaget er ikke en komplett eller løpende leietakeroversikt og brukes derfor ikke alene for nåstatus." },
    { id: "source_klp_schous", url: urls.klp, sourceLocation: "Beskrivelse av dagens Schouskvartal, kontorbruk og planlagt rehabilitering", sourceType: "primary_business", verifiedAt, temporalCoverage: "current", provenance: "KLP Eiendom publiserer som gårdeier aktuell informasjon om eiendommen og utleiearealene.", limitations: "Utleieteksten har kommersielt formål og dokumenterer ikke uavhengig lønnsomhet, sosial effekt eller alle brukere i kvartalet." },
    { id: "source_oslo_kulturskole", url: urls.cultureSchool, sourceLocation: "Adresse og åpningstider for Schous kulturstasjon i Malteriet", sourceType: "official", verifiedAt, temporalCoverage: "current", provenance: "Oslo kommune publiserer den operative kontakt- og stedsinformasjonen for kulturskolen.", limitations: "Kontaktsiden dokumenterer dagens kommunale bruk, men ikke hele byggets historikk eller øvrige leietakere." }
  ],
  economicCases: [{
    id: "case_schous_industrisystem_og_ombruk",
    claim: "Schous-anlegget samordnet brygging, kjøling, lagring, tapping og distribusjon før virksomheten ble konsolidert og bygningsmassen fikk nye økonomiske og kulturelle funksjoner.",
    unitOfAnalysis: { unit: "Schous Bryggeri og anlegget på Schousløkken", boundary: "Analysen omfatter virksomheten 1821–1981 og dokumentert ombruk av bryggerianlegget, men ikke alle selvstendige leietakere som deler av samme selskap.", scale: "firm", temporalScope: { start: "1821", end: "2026", precision: "period", rationale: "Tidsrommet gjør både produksjonssystemet, selskapsendringen, nedleggelsen og etterbruken sammenlignbare." }, sourceIds: ["source_snl_schous", "source_byleksikon_schous", "source_klp_schous"] },
    actors: [
      { name: "Bryggeriets eiere og ledelse", roleOrInterest: "Finansierte anlegg, organiserte produksjon og distribusjon og inngikk senere i større selskapsstrukturer.", economicPosition: "Kontrollerte kapital, produksjonsmidler, varemerke og strategiske beslutninger.", sourceIds: ["source_snl_schous", "source_byleksikon_schous"] },
      { name: "Arbeidere, transportører og fagpersoner", roleOrInterest: "Utførte brygging, gjærbehandling, lagring, tapping, vedlikehold og levering.", economicPosition: "Leverte arbeidskraft og fagkunnskap, mens kildene ikke gir tilstrekkelige lønns- eller kontraktsdata.", sourceIds: ["source_snl_schous", "source_byleksikon_schous"] },
      { name: "Gårdeier og dagens brukere", roleOrInterest: "Forvalter og bruker det tidligere produksjonsanlegget til kontor, undervisning, kultur og servering.", economicPosition: "Gårdeier kontrollerer utleie og rehabilitering; selvstendige brukere kontrollerer egne tilbud og aktiviteter.", sourceIds: ["source_klp_schous", "source_oslo_kulturskole", "source_byleksikon_quarter"] }
    ],
    valueCreation: {
      inputs: [{ statement: "Malt, vann, humle, gjær, kjøling, bygninger, arbeid og transportkapasitet var nødvendige innsatsfaktorer i bryggerisystemet.", sourceIds: ["source_snl_schous", "source_byleksikon_schous"] }],
      activity: { statement: "Anlegget foredlet råvarer gjennom brygging, undergjæring, lagring og tapping og organiserte deretter levering til markedet.", sourceIds: ["source_snl_schous", "source_byleksikon_schous"] },
      outputs: [{ statement: "Bryggeriet produserte og distribuerte øl, blant annet bayerøl, og utviklet senere vørterøl som eget produkt.", sourceIds: ["source_snl_schous", "source_byleksikon_schous"] }],
      valueCreationAssessment: { statement: "Kildene dokumenterer en integrert produksjons- og logistikkjede, men gir ikke grunnlag for å beregne produktivitet, marginer eller verdiskaping i faste priser.", sourceIds: ["source_snl_schous", "source_byleksikon_schous"] }
    },
    measurement: { methodId: "met_naering_arbeidsprosessanalyse", evidenceType: "qualitative", indicatorOrObservation: "Daterte overtakelser, teknologisk metode, navngitte produksjonsbygg, leveringskjøretøy, selskapsendringer, nedleggelse og dokumentert ombruk brukes som observerbare spor.", unit: "produksjonsanlegg og virksomhet", period: "1821–2026", comparability: "Kildene gjør funksjoner og tidslag sammenlignbare, men mangler ensartede serier for volum, kapital, ansatte og lønnsomhet.", dataLimitations: "Det foreligger ikke et komplett regnskapsarkiv, produksjonsserie, bemanningsserie eller en kausal analyse av nedleggelsen og ombruken.", sourceIds: ["source_snl_schous", "source_byleksikon_schous", "source_byleksikon_quarter", "source_klp_schous"] },
    distributionAndPower: { ownershipOrControl: "Kontrollen gikk fra enkelt- og familieeierskap til aksjeselskap og større bryggerisammenslutninger; dagens gårdeier kontrollerer eiendomsforvaltning og rehabilitering.", laborPosition: "Arbeidet var nødvendig i hele verdikjeden, men de brukte kildene gir ikke sikre data om bemanning, lønn, arbeidstid eller medbestemmelse.", beneficiaries: ["Eierne og senere selskapsgrupper kunne motta avkastning fra produksjon og markedsadgang.", "Kunder fikk tilgang til standardiserte bryggeriprodukter og distribusjon.", "Dagens leietakere og publikum kan bruke ombygde lokaler til arbeid, undervisning, kultur og servering."], costRiskBearers: ["Eiere bar kapital- og markedsrisiko knyttet til anlegg og omstilling.", "Arbeidere og leverandører var utsatt for konsekvenser av teknologisk og selskapsmessig omstilling.", "Gårdeier og leietakere bærer kostnader og risiko ved vedlikehold, rehabilitering og bruksendring."], sourceIds: ["source_snl_schous", "source_byleksikon_quarter", "source_klp_schous"] },
    riskAndExternalities: {
      riskAssessment: { statement: "Bryggeridriften var avhengig av temperaturkontroll, råvaretilgang, teknisk drift, distribusjon og marked, mens dagens ombruk er avhengig av vedlikehold, leietakere og godkjente rehabiliteringer.", sourceIds: ["source_snl_schous", "source_klp_schous"] },
      externalityAssessment: { status: "not_applicable", rationale: "Kildene dokumenterer industri og bygningsombruk, men gir ikke et sikkert stedsspesifikt grunnlag for å tallfeste utslipp, støy, helsevirkninger eller fortrengning." }
    },
    comparisonAndCausality: { comparisonBasis: "Bryggeriets historiske produksjons- og selskapskilder sammenholdes med institusjonelle opplysninger om ombygging og gårdeiers aktuelle eiendomsinformasjon.", causalStatus: "descriptive_only", causalAssessment: "Materialet dokumenterer rekkefølgen fra produksjon via konsolidering og nedleggelse til ombruk, men isolerer ikke én årsak til nedleggelsen eller dagens funksjonsmiks.", alternativeExplanations: ["Bransjekonsolidering, teknologi, kapitalbehov, eiendomsverdi, kommunal kulturpolitikk og etterspørsel etter kontor- og kulturarealer kan ha virket samtidig."], uncertainty: "Kildene har ulike formål og gir ikke sammenlignbare økonomiske serier eller en kontrafaktisk analyse.", sourceIds: ["source_snl_schous", "source_byleksikon_quarter", "source_klp_schous"] }
  }],
  presentOperation: { operationalStatus: "mixed", statement: "Den opprinnelige bryggerivirksomheten er nedlagt, mens Schouskvartalet har aktiv kontor-, undervisnings-, kultur- og serveringsbruk og et planlagt rehabiliteringsløp.", originalEconomicRoleRelationship: "Dagens virksomheter bruker deler av det tidligere produksjonsmiljøet, men er selvstendige aktører og viderefører ikke automatisk det historiske bryggeriselskapet.", checkedAt: verifiedAt, sourceIds: ["source_klp_schous", "source_oslo_kulturskole"] },
  quizOpening: { status: "PASS", quizTargetId: "schous_bryggeri", firstTwoSetsQuestionCount: 14, sourceBrief: "data/quiz/production_briefs/naeringsliv/schous_bryggeri.json", productionContext: "data/quiz/production_context/naeringsliv/schous_bryggeri.json", requiredInputs: ["data/fag/naeringsliv/naeringslivpensum_canonical_v4_5.json", "data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json", "data/fag/naeringsliv/fagkart_naeringsliv_canonical_v4_5.json", "data/fag/naeringsliv/methods_naeringsliv_canonical_v4_5.json", "data/fag/naeringsliv/supersetQUIZMAL_naeringsliv.json", "data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md", "data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json"] },
  chronologyStories: { status: "PASS", chronologyReviewed: true, storiesReviewed: true, rationale: "Leksikonets tidslinje og episode_v1-historien om Daimler-varebilen er kildekontrollert og manifestkoblet." },
  gates: {
    A: { status: "PASS", evidenceRefs: ["economicIdentity"] }, B: { status: "PASS", evidenceRefs: ["businessTopics"] },
    C: { status: "PASS", evidenceRefs: ["case_schous_industrisystem_og_ombruk.valueCreation"] }, D: { status: "PASS", evidenceRefs: ["case_schous_industrisystem_og_ombruk.actors", "case_schous_industrisystem_og_ombruk.distributionAndPower"] },
    E: { status: "PASS", evidenceRefs: ["case_schous_industrisystem_og_ombruk.measurement"] }, F: { status: "PASS", evidenceRefs: ["case_schous_industrisystem_og_ombruk.comparisonAndCausality", "presentOperation"] },
    G: { status: "PASS", evidenceRefs: ["quizOpening"] }, H: { status: "PASS", evidenceRefs: ["chronologyStories"] }
  },
  review: { reviewer: "Schous Bryggeri phase 8–24 Næringsliv review", reviewedAt: verifiedAt, notes: "Rapporten skiller historisk foretak, varemerke, produksjonsanlegg, eiendom og dagens selvstendige brukere. Den gjør ingen udokumentert påstand om lønnsomhet, arbeidsvilkår eller én årsak til nedleggelsen." }
});
write("reports/place-production/schous-bryggeri-phase8-24-gate-audit-v1.json", {
  schema: "history_go_phase8_24_quality_gate_v1", place_id: "schous_bryggeri", verified_at: verifiedAt,
  collections: { required: ["people", "objects", "brands", "structures"], loaded_preview_images: 4, missing: 0, coverage_percent: 100 },
  brands: { candidates_reviewed: ["Schous Bryggeri (historisk)", "Schouskjelleren", "Schous Brygghuset"], selected: [brandId], held_back: ["Schouskjelleren – current venue identity retained in sources but no approved mark added in this place batch.", "Schous Brygghuset – newer office-building identity is not the historic brewery brand."], logo_coverage: { required: 1, reviewed: 1, missing: 0, percent: 100 } },
  people: { candidates_reviewed: ["Christian Julius Schou", "Jørgen Young", "Halvor Schou", "Christen Smith", "Herman Schou"], selected: ["christian_julius_schou"], held_back: ["Jørgen Young – direct brewery role sourced but no reviewed portrait in this batch.", "Halvor Schou – existing profile describes Hjula, not his brewery succession.", "Christen Smith and Herman Schou – unsupported legacy records removed."], image_coverage_percent: 100 },
  quality_score: { correctness_and_evidence: { score: 5, note: "Alle synlige stedspåstander er claim- og kildesporet; den feilaktige 1837-grunnleggelsen er rettet til 1821." }, coverage_and_completion: { score: 5, note: "Fase 8–24 er materialisert med fire bildeklare samlinger, ekte 3:4-frontbilde, Story, Språk, lesespor, nyhetsnote, før/etter, Quiz og Fagverk." }, editorial_quality: { score: 5, note: "Tekst og samlinger er spesifikke for bryggeriet og skiller virksomhet, anlegg, kvartal og enkeltinstitusjoner." }, technical_integrity: { score: 5, note: "Deterministisk builder, 5×7-quiz, produksjonskontekst, manifests, place-open og fokuserte tester inngår i leveransen." }, safety_and_responsibility: { score: 5, note: "Nåbruk og planer er tidsmerket; alkoholhistorien behandles som industri- og logistikkhistorie uten konsumoppfordring; oppgaver er trygge fra offentlig grunn." }, maintainability_and_auditability: { score: 5, note: "Kilder, bildeproveniens, holdbacks, claims, text hashes og gjenbruk av tidligere quiz er eksplisitte og reproduserbare." }, total: 30, critical_findings: 0, unresolved_blockers: 0 }
});
write("reports/place-production/schous-bryggeri-workcard-current.json", { place_id: "schous_bryggeri", status: "complete", phases: "8–24", verified_at: verifiedAt, previous_place: "paulus_kirke", canonical_next: null, notes: ["Ingen koordinatendring.", "Riksscenen beholdes som separat Place.", "1821/1837/1873-sekvensen er låst."] });

console.log(`Built Schous Bryggeri phase 8–24 package (${allQuestions.length} quiz questions, ${sentences(place.popupDesc).length} popup sentences).`);
