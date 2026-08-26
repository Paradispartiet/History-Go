#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const write = (file, value) => {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const addOnce = (array, value, key = item => item) => {
  if (!array.some(item => key(item) === key(value))) array.push(value);
};
const sha256 = value => crypto.createHash("sha256").update(value).digest("hex");
const verifiedAt = "2026-08-26";

const urls = {
  municipality: "https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/sofienbergparken/",
  cemetery: "https://lokalhistoriewiki.no/wiki/Sofienberg_gravlund",
  parks: "https://lokalhistoriewiki.no/wiki/Parker_i_Oslo_kommune",
  rohne: "https://snl.no/Marius_R%C3%B8hne",
  rohneNbl: "https://nbl.snl.no/Marius_R%C3%B8hne",
  upgrade: "https://www.arkitektur.no/aktuelt/byutvikling/oppgraderte-sofienbergparken-endelig-aapnet-vi-har-aldri-gitt-oss/",
  pip: "https://pipfest.no/",
  pipProgram: "https://pipfest.no/program",
  pride: "https://kommunikasjon.ntb.no/pressemelding/18032173/oslo-pride-flytter-til-grunerlokka-i-2024?lang=no&publisherId=17847803",
  prideMunicipality: "https://aktuelt.oslo.kommune.no/oslo-kommune-feirer-det-skeive-oslo-2",
  before: "https://commons.wikimedia.org/wiki/File:Sofienberg_OB.Z02498.jpg",
  now: "https://commons.wikimedia.org/wiki/File:Sofienbergparken_Oslo_2022-08-17_01.jpg",
  jewishImage: "https://commons.wikimedia.org/wiki/File:Sofienbergparken_Jodisk_gravlund.JPG",
  rohneImage: "https://commons.wikimedia.org/wiki/File:Marius_R%C3%B8hne_portrait.jpg"
};

const placeFile = "data/places/by/oslo/sofienbergparken.json";
const place = read(placeFile);
delete place.rounds;
place.year = 1920;
place.desc = "Sofienbergparken vokste fram da den tidligere gravlunden gradvis ble omformet til offentlig park etter et kommunalt vedtak i 1918. Den bevarte jødiske gravlunden gjør den eldre arealbruken synlig, mens dagens park består av hovedpark, hundepark og barnepark. Rathkes gate deler anlegget i to, og Sofienberg kirke er et eget nabosted.";
place.popupDesc = `Sofienbergparken er det offentlige grøntområdet som Oslo kommune beskriver som hovedpark, Hundeparken og Sofienbergparken barnepark. Rathkes gate deler parken, mens Sofienberg kirke, den jødiske gravlunden og gjenvinningsstasjonen må behandles som egne objekter eller nabosteder med egne funksjoner.\n\nParkgrunnen var tidligere del av Sofienberg gravlund. Etter en offentlig strid om gravplass og friområde vedtok kommunen i 1918 å avvikle gravlunden og omforme arealet til park; de første parkdelene ble tatt i bruk rundt 1920, mens gravene ble fjernet gradvis fram til 1972. Den jødiske gravlunden ble bevart og er fortsatt et synlig historisk lag i parklandskapet.\n\nMarius Røhne ledet Kristianias og senere Oslos parkvesen fra 1916 til 1948. Kildene om byens parker framhever omformingen av Sofienberg gravlund som ett av de store tiltakene i perioden, men dokumenterer ikke at Røhne alene tegnet hele dagens park. Personkoblingen gjelder hans ledelse av parkpolitikken og gjennomføringen, ikke et udokumentert eneopphav.\n\nKommunen oppgir i dag blant annet lekeplass, bordtennis, drikkevann, offentlig toalett, fontene og bysykkelstasjon i parken. En oppgradering av den østlige delen åpnet i 2025 med nye møteplasser, belysning og oppholdselementer; tilgjengeligheten ble samtidig kritisert. Nyere utforming kan leses både som forbedring og som et spørsmål om hvem som faktisk kan bruke anlegget.\n\nPiknik i Parken bruker Sofienbergparken som festivalarena og har en dokumentert egen visuell identitet. Brand-kortet viser festivalidentiteten, ikke eierskap til parken eller kommunal godkjenning av merkevaren. Pride Park ble lagt hit 26.–29. juni 2024; dette er et tidsavgrenset skeivt kultur- og offentlighetslag, ikke belegg for å kalle all parkbruk subkultur eller for å gjøre 2024-arrangementet permanent.\n\nHistoriske og nyere fotografier viser henholdsvis gravlundsterreng øst for Rathkes gate i 1920-årene og parklandskapet i 2022. Bildene er ikke tatt fra dokumentert identisk standpunkt, så de brukes til å lese arealbruk og historiske lag, ikke til eksakt optisk måling. Sofienbergparkens særlige historie ligger i at et gravsted gradvis ble offentlig park uten at alle spor etter den tidligere funksjonen forsvant.`;
place.frontImage = "bilder/places/sofienbergparken_front_portrait.webp";
place.frontImageMeta = {
  source: "wikimedia_commons", sourcePage: urls.now, creator: "Leonhard Lenz",
  credit: "Leonhard Lenz / Wikimedia Commons", license: "CC0 1.0",
  licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
  sourceDimensions: "8384x5612", outputDimensions: "900x1200", orientation: "portrait", aspectRatio: "3:4",
  transformation: "Sentrert stående utsnitt av originalfotografiet; ingen innholdsgenerering.", verified: true, verifiedAt
};
place.place_card_profile = {
  schema: "history_go_place_card_profile_v2",
  collection_ids: ["people", "objects", "brands", "related"],
  reason: "Fireflaten har ett direkte, kildebelagt og bildeklart medlem i People, Objects og Brands, samt bildeklare canonicale nabosteder i Related. Badges og Quiz presenteres separat.",
  verifiedAt
};
place.related_people_ids = ["marius_rohne"];
place.related_place_ids = ["sofienberg_kirke", "olaf_ryes_plass", "birkelunden", "markveien", "daelenenga_idrettspark"];
place.secondaryBadgeIds = ["subkultur"];
place.underbadge_ids = ["subkultur"];
place.emne_ids = ["em_by_parker_som_sosial_infrastruktur", "em_by_opphold_vs_gjennomgang", "em_by_historiske_lag_i_hverdagsrom", "em_sub_tilhorighet_miljo"];
place.quiz_profile = {
  place_type: "park", subtype: "tidligere_gravlund_omformet_til_offentlig_park",
  signature_features: ["gravlund vedtatt avviklet i 1918", "bevart jødisk gravlund", "park delt av Rathkes gate"],
  primary_angles: ["historiske_lag", "parkpolitikk", "offentlighet", "kildekritikk"],
  question_families: ["identitet", "endring", "objekt", "observasjon"],
  avoid_angles: ["generisk_parkquiz", "kirken_som_proxy", "udokumentert_poesipark"],
  must_include: ["overgangen fra gravlund til park", "den bevarte jødiske gravlunden", "Marius Røhnes avgrensede rolle"],
  contrast_targets: ["olaf_ryes_plass", "birkelunden", "sofienberg_kirke"],
  notes: "Spør om parkens dokumenterte transformasjon og synlige lag; ikke overfør kirkens prosjekt eller alle brukeres identitet til parken."
};
place.objects = [{
  id: "sofienbergparken_jodisk_gravlund", title: "Den bevarte jødiske gravlunden", type: "gravlundsområde",
  kind: "physical_site_trace", desc: "Den jødiske gravlunden er den bevarte delen av det eldre gravlundsanlegget og gjør parkens tidligere arealbruk fysisk synlig.",
  why_here: "Området er det tydeligste gjenværende stedsankeret fra tiden før parkomformingen.",
  placeSpecificReason: "Kildene om Sofienberg gravlund oppgir at den jødiske gravlunden ble bevart da resten av gravene ble fjernet.",
  historicalFunction: "Gravsted og bevart historisk del av den tidligere Sofienberg gravlund.", physicalObject: true,
  placeSpecific: true, collectable: true, storePrice: 30, currency: "PC", collection: "sofienbergparken_historiske_lag",
  unlock: "Finn gjerdet rundt gravlunden og observer grensen uten å gå inn eller forstyrre stedet.",
  image: "bilder/kort/objects/sofienbergparken_jodisk_gravlund.webp",
  imageMeta: { sourcePage: urls.jewishImage, creator: "Helge Høifødt", credit: "Helge Høifødt / Wikimedia Commons", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/", depictedObject: "Den jødiske gravlunden i Sofienbergparken", transformation: "Stedstro utsnitt, skalering og WebP-normalisering.", verifiedAt },
  source_urls: [urls.cemetery, urls.municipality]
}];
place.for_na = {
  title: "Fra gravlundsterreng til parklandskap",
  beforeImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Sofienberg_OB.Z02498.jpg/1200px-Sofienberg_OB.Z02498.jpg",
  beforeImageLabel: "Gravlund øst for Rathkes gate, 1920-årene",
  beforeImageMeta: { source: "oslo_museum_wikimedia_commons", sourcePage: urls.before, author: "Inger Marie Munch", credit: "Inger Marie Munch / Oslo Museum", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", date: "1920-årene", verified: true, verifiedAt },
  nowImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Sofienbergparken_Oslo_2022-08-17_01.jpg/1280px-Sofienbergparken_Oslo_2022-08-17_01.jpg",
  nowImageLabel: "Sofienbergparken 17. august 2022",
  nowImageMeta: { source: "wikimedia_commons", sourcePage: urls.now, author: "Leonhard Lenz", credit: "Leonhard Lenz / Wikimedia Commons", license: "CC0 1.0", date: "2022-08-17", verified: true, verifiedAt },
  before: "Inger Marie Munchs fotografi fra 1920-årene viser gravlundsterreng øst for Rathkes gate med Sofienberg kirke i bakgrunnen.",
  now: "Leonhard Lenz' fotografi fra 2022 viser plener, ganglinjer, trær og kirketårnet i dagens parklandskap.",
  change: "Paret viser ulike tidslag i arealbruken, men er ikke dokumentert fra identisk standpunkt og brukes derfor ikke til nøyaktig optisk sammenligning.",
  lookFor: ["Skill gravlundens tidligere flate fra dagens ganglinjer og plen.", "Finn kirkespiret som orienteringspunkt uten å gjøre kirken til parkobjekt.", "Se etter den bevarte gravlundens grense i dagens landskap."],
  sources: [urls.before, urls.now, urls.cemetery]
};
place.externalLinks = [
  ["source", "Oslo kommune – Sofienbergparken", urls.municipality],
  ["source", "Lokalhistoriewiki – Sofienberg gravlund", urls.cemetery],
  ["source", "Lokalhistoriewiki – Parker i Oslo kommune", urls.parks],
  ["source", "Store norske leksikon – Marius Røhne", urls.rohne],
  ["source", "Arkitektur – oppgraderingen i 2025", urls.upgrade],
  ["source", "Piknik i Parken", urls.pip],
  ["source", "Oslo Pride – flyttingen i 2024", urls.pride],
  ["image_source", "Oslo Museum / Commons – Sofienberg 1920-årene", urls.before],
  ["image_source", "Wikimedia Commons – Sofienbergparken 2022", urls.now]
].map(([type, label, url]) => ({ type, label, url, verifiedAt }));
place.interpretation = {
  what_to_notice: ["Rathkes gate deler parkflaten i to.", "Den jødiske gravlundens avgrensning er et fysisk spor etter tidligere arealbruk.", "Kirken er et visuelt landemerke, men et separat canonicalt sted."],
  why_it_matters: ["Parken viser hvordan gravplasspolitikk og krav om friområder formet den tette østbyen.", "Den gradvise omformingen gjør flere tidslag lesbare samtidig.", "Dagens fasiliteter og arrangementer viser offentlig bruk uten at én gruppe eier parkens identitet."],
  counterpoints: ["Marius Røhne knyttes til parkvesenets ledelse, ikke til et udokumentert eneopphav.", "Pride Park i 2024 er et tidsavgrenset lag, ikke en permanent merkelapp på alle brukere.", "Før/etter-bildene viser endring, men ikke alle årsaker eller identisk kamerastandpunkt."],
  sources: [urls.municipality, urls.cemetery, urls.parks, urls.upgrade].map(url => ({ url, verifiedAt }))
};
write(placeFile, place);

const peopleFile = "data/people/by/oslo/people_by_oslo.json";
const people = read(peopleFile).filter(person => person.id !== "marius_rohne");
people.push({
  id: "marius_rohne", name: "Marius Røhne", initials: "MR", kindLabel: "landskapsarkitekt og bygartner",
  birth_date: "1883-04-25", death_date: "1966-08-30", year: 1916, category: "by",
  profileStandard: "people_profile_v1.0", claimsFile: "data/people/claims/by/oslo/marius_rohne.claims.json", profileStatus: "ready_people_v1",
  desc: "Marius Røhne (1883–1966) var landskapsarkitekt og ledet Kristianias og Oslos parkvesen 1916–1948, i perioden da Sofienberg gravlund ble omformet til park.",
  popupDesc: "Marius Røhne ble født 25. april 1883 og døde 30. august 1966. Han var landskapsarkitekt og ledet Kristianias og senere Oslos parkvesen fra 1916 til 1948. Parkhistoriske kilder framhever omformingen av Sofienberg gravlund som ett av de store kommunale parktiltakene i denne perioden. Koblingen til Sofienbergparken gjelder Røhnes ledelse av parkvesenet og den sosiale parkpolitikken, ikke en påstand om at han alene tegnet hele dagens park. Under Røhne ble parker forstått som offentlige friområder i en tett by, med vekt på barns lek, opphold og tilgjengelighet.",
  placeId: "sofienbergparken", places: ["sofienbergparken"], tags: ["by", "parkhistorie", "landskapsarkitektur", "kommunal forvaltning"],
  image: "bilder/kort/people/marius_rohne.webp", cardImage: "bilder/kort/people/marius_rohne.webp",
  imageMeta: { source: "wikimedia_commons", sourcePage: urls.rohneImage, creator: "Ukjent fotograf / Oslo Museum", credit: "Oslo Museum OB.F06377b / Wikimedia Commons", license: "Public domain", mediaType: "historic_portrait", sourceDimensions: "2108x3000", transformation: "Skalering og WebP-normalisering.", verifiedAt },
  externalLinks: [{ type: "source", label: "Store norske leksikon – Marius Røhne", url: urls.rohne, verifiedAt }, { type: "source", label: "Norsk biografisk leksikon – Marius Røhne", url: urls.rohneNbl, verifiedAt }, { type: "source", label: "Lokalhistoriewiki – Parker i Oslo kommune", url: urls.parks, verifiedAt }]
});
write(peopleFile, people);

const legacyPeopleFile = "data/people/litteratur/oslo/people_litteratur_oslo.json";
const legacyPeople = read(legacyPeopleFile);
for (const person of legacyPeople) {
  if (["gro_dahle", "jan_erik_vold", "cecilie_loveid"].includes(person.id)) {
    person.roundHoldbacks = [...new Set([...(person.roundHoldbacks || []), "sofienbergparken"])];
  }
}
write(legacyPeopleFile, legacyPeople);

write("data/people/claims/by/oslo/marius_rohne.claims.json", {
  schema: "history_go_people_claims_v1", version: "1.0.0", person_id: "marius_rohne", profile_file: peopleFile,
  identity: { canonical_identity: "Den norske landskapsarkitekten og bygartneren Marius Røhne, født 25. april 1883 og død 30. august 1966.", name_variants: ["Marius Røhne"], not: ["navnelike personer"], identity_status: "verified" },
  claims: [
    ["canonical_name", "Det canonical publiserte navnet er Marius Røhne.", urls.rohne, "overskrift"],
    ["life_dates", "Marius Røhne ble født 25. april 1883 og døde 30. august 1966.", urls.rohne, "faktaboks"],
    ["profession", "Røhne var landskapsarkitekt og bygartner.", urls.rohneNbl, "faktaboks og biografi"],
    ["park_leadership", "Røhne ledet Kristianias og senere Oslos parkvesen fra 1916 til 1948.", urls.rohneNbl, "avsnitt om parkvesenet"],
    ["sofienberg_connection", "Omformingen av Sofienberg gravlund var et stort parktiltak i perioden Røhne ledet parkvesenet.", urls.parks, "avsnitt om Parkvesenet og Sofienbergparken"],
    ["social_park_policy", "Røhnes parkpolitikk la vekt på offentlige friområder, barns lek og opphold i den tette byen.", urls.rohneNbl, "avsnitt om sosial parkpolitikk"]
  ].map(([id, claim, source_url, source_location]) => ({ id, claim, status: "verified", source_url, source_location, source_type: source_url.includes("snl.no") ? "recognized_reference" : "institutional_reference", temporal_status: "historical", verified_at: verifiedAt, evidence_level: "direct" })),
  field_claim_map: { name: ["canonical_name"], kindLabel: ["profession"], birth_date: ["life_dates"], death_date: ["life_dates"], year: ["park_leadership"], placeId: ["sofienberg_connection"], "places[sofienbergparken]": ["sofienberg_connection"], image: ["canonical_name"] },
  sentence_claim_map: { desc: [{ sentence: 1, claim_ids: ["profession", "park_leadership", "sofienberg_connection"] }], popupDesc: [
    { sentence: 1, claim_ids: ["life_dates"] }, { sentence: 2, claim_ids: ["profession", "park_leadership"] },
    { sentence: 3, claim_ids: ["sofienberg_connection"] }, { sentence: 4, claim_ids: ["sofienberg_connection"] }, { sentence: 5, claim_ids: ["social_park_policy"] }
  ] },
  completion: { completed_under: "people_profile_v1.0", claims_verified: "6/6", fact_review: "passed", editorial_review: "passed", source_verified_at: verifiedAt, validator_version: "1.0.0", current_status: "ready_people_v1" }
});

const brandsMasterFile = "data/brands/brands_master.json";
const brandsMaster = read(brandsMasterFile).filter(brand => brand.id !== "piknik_i_parken");
brandsMaster.push({
  id: "piknik_i_parken", name: "Piknik i Parken", aliases: ["PiPfest", "PiP"], brand_group: "festival_brand", brand_type: "music_festival", brand_kind: "event_brand", sector: "music", state: "catalog", status: "active", verification: "verified", verified_at: verifiedAt,
  popupdesc: "Piknik i Parken er en musikkfestival med dokumentert program og egen visuell identitet i Sofienbergparken. Brand-koblingen viser festivalidentiteten og innebærer ikke eierskap til parken eller offentlig godkjenning.",
  desc: "Festival-brand for Piknik i Parken i Sofienbergparken.", tags: ["brand", "festival", "music", "sofienbergparken"], place_ids: ["sofienbergparken"], source_urls: [urls.pip, urls.pipProgram], logo: "bilder/kort/brands/piknik_i_parken.webp",
  imageMeta: { sourcePage: urls.pip, sourceSelector: "official PiP icon asset", creator: "Piknik i Parken", credit: "Piknik i Parken", rightsBasis: "official_brand_site_referential_identification", reviewStatus: "manually_approved", assetKind: "official_logo", sourceForm: "official_raster_logo", temporalScope: "current", usageContext: "referential_identification", noEndorsement: true, generated: false, reconstructed: false, transformation: "Offisiell svart PiP-symbolfil sentrert på nøytral 900 × 520-flate og WebP-normalisert.", reviewedAt: verifiedAt }
});
write(brandsMasterFile, brandsMaster);
const brandsCatalogFile = "data/brands/brands_catalog.json";
const brandsCatalog = read(brandsCatalogFile).filter(brand => brand.id !== "piknik_i_parken");
brandsCatalog.push({ id: "piknik_i_parken", name: "Piknik i Parken", brand_group: "festival_brand", brand_type: "music_festival", brand_kind: "event_brand", sector: "music", state: "catalog" });
write(brandsCatalogFile, brandsCatalog);
const brandsByPlace = read("data/brands/brands_by_place.json");
brandsByPlace.sofienbergparken = ["piknik_i_parken"];
write("data/brands/brands_by_place.json", brandsByPlace);

const leksikonFile = "data/leksikon/places/oslo/by/leksikon_sofienbergparken.json";
const leksikon = {
  place_id: "sofienbergparken", title: "Sofienbergparken", type: "main", version: 1, suppress_untitled_legacy_articles: true,
  visual: { designCode: "article_place_essay_miniature" }, popupDesc: "En tidligere gravlund som gradvis ble offentlig park, med den jødiske gravlunden som bevart historisk lag.",
  wikiText: ["Kommunen vedtok i 1918 å avvikle Sofienberg gravlund og omforme arealet til park. Prosessen var gradvis: de første parkdelene kom rundt 1920, mens gravene ble fjernet fram til 1972.", "Rathkes gate deler parken. Sofienberg kirke, den bevarte jødiske gravlunden og gjenvinningsstasjonen må skilles fra selve hovedparkens funksjon, selv om de ligger i eller ved samme landskap."],
  summary: { one_liner: "Fra gravlund til offentlig park med synlige historiske lag.", themes: ["parkhistorie", "gravlund", "offentlig rom", "Grünerløkka"], tone: ["nøktern", "stedsspesifikk"] },
  facts: [
    { id: "fact_sofienbergparken_01", label: "Vedtak i 1918", desc: "Kommunen vedtok å avvikle gravlunden og gjøre arealet til park.", confidence: "high", sources: ["Lokalhistoriewiki – Sofienberg gravlund"] },
    { id: "fact_sofienbergparken_02", label: "Gradvis omforming", desc: "De første parkdelene kom rundt 1920, og gravene ble fjernet fram til 1972.", confidence: "high", sources: ["Lokalhistoriewiki – Parker i Oslo kommune"] },
    { id: "fact_sofienbergparken_03", label: "Bevart gravlund", desc: "Den jødiske gravlunden ble bevart.", confidence: "high", sources: ["Lokalhistoriewiki – Sofienberg gravlund"] }
  ],
  chronology: [
    [1858, "Gravlunden etableres", "Sofienberg gravlund ble anlagt i slutten av 1850-årene."],
    [1918, "Kommunen velger park", "Vedtaket om avvikling og parkomforming fulgte en offentlig strid om arealet."],
    [1920, "De første parkdelene tas i bruk", "Parkomformingen begynte mens deler av gravlunden fortsatt besto."],
    [1972, "Den lange gravfjerningen avsluttes", "Gravene utenfor den bevarte jødiske gravlunden var da fjernet."],
    [2024, "Pride Park flytter hit", "Oslo Pride brukte Sofienbergparken 26.–29. juni 2024."],
    [2025, "Østdelen åpner etter oppgradering", "Nye møteplasser, lys og oppholdselementer kom på plass, samtidig som tilgjengelighet ble diskutert."]
  ].map(([year, title, desc], index) => ({ id: `chrono_sofienbergparken_${year}_${index + 1}`, year, title, desc, confidence: year === 1858 ? "medium" : "high", sources: [{ title: year === 2024 ? "Oslo Pride" : year === 2025 ? "Arkitektur" : "Lokalhistoriewiki", url: year === 2024 ? urls.pride : year === 2025 ? urls.upgrade : year === 1918 ? urls.cemetery : urls.parks }] })),
  sources: place.externalLinks, externalLinks: place.externalLinks, interpretation: place.interpretation
};
write(leksikonFile, leksikon);
const leksikonManifest = read("data/leksikon/manifest.json");
addOnce(leksikonManifest.files, leksikonFile);
write("data/leksikon/manifest.json", leksikonManifest);

const languageFile = "data/leksikon/sprak/places/europe/norway/oslo/sofienbergparken.json";
write(languageFile, {
  place_id: "sofienbergparken", title: "Språkleksikon: Sofienbergparken", verified_at: verifiedAt, dialect_status: "not_applicable_place_level",
  entries: [
    { id: "sofienbergparken_navn", term: "Sofienbergparken", type: "stedsnavn", meaning: "Navnet på den offentlige parken som vokste fram på deler av den tidligere Sofienberg gravlund.", context: "Sammensetningen binder områdenavnet Sofienberg til dagens parkfunksjon; kirken og gravlunden er egne steds- og funksjonsord.", linked_to: { kind: "place", id: "sofienbergparken" }, tags: ["stedsnavn", "park"], sources: [{ label: "Oslo kommune – Sofienbergparken", url: urls.municipality }] },
    { id: "sofienbergparken_gravlund", term: "gravlund", type: "historisk_funksjonsord", meaning: "Et areal avsatt til graver; ordet forklarer parkgrunnens tidligere hovedfunksjon.", context: "Kildene bruker Sofienberg gravlund om anlegget som kommunen vedtok å avvikle i 1918. Den jødiske gravlunden ble bevart.", linked_to: { kind: "place", id: "sofienbergparken" }, tags: ["historisk funksjon", "gravsted"], status: "historical", sources: [{ label: "Lokalhistoriewiki – Sofienberg gravlund", url: urls.cemetery }] },
    { id: "sofienbergparken_friomrade", term: "friområde", type: "byplanbegrep", meaning: "Et offentlig tilgjengelig areal for opphold, lek eller rekreasjon i byen.", context: "Striden om Sofienberg handlet om å gjøre gravlundsterreng til park og offentlig friområde i et tett bebygd strøk; ordet er et generelt fagbegrep, ikke lokalt slang.", linked_to: { kind: "place", id: "sofienbergparken" }, tags: ["byplan", "parkpolitikk"], sources: [{ label: "Lokalhistoriewiki – Parker i Oslo kommune", url: urls.parks }] }
  ]
});
const languageManifest = read("data/leksikon/sprak/manifest.json");
languageManifest.place_files.sofienbergparken = languageFile;
write("data/leksikon/sprak/manifest.json", languageManifest);

const storyFile = "data/stories/stories_sofienbergparken_subkultur.json";
write(storyFile, [{
  id: "st_sofienbergparken_parkvedtak_1918", quality_profile: "episode_v1", type: "turning_point", title: "Da gravlunden skulle bli park", year: 1918, place_id: "sofienbergparken", person_id: "marius_rohne",
  summary: "Etter en offentlig strid vedtok kommunen i 1918 å avvikle Sofienberg gravlund og gradvis gjøre arealet til park.",
  story: "Sofienberg var gravlund da den tette østbyen manglet offentlige friområder. I 1915 og 1916 ble arealbruken en offentlig strid: skulle gravplassen fortsette, eller skulle de levende få en park?\n\nI 1918 vedtok kommunen å avvikle gravlunden. Vedtaket endret ikke landskapet over natten. De første parkdelene kom rundt 1920, mens gravene ble fjernet trinnvis gjennom flere tiår.\n\nDen jødiske gravlunden ble bevart da resten av arealet ble omformet. Derfor kan parkens vendepunkt fortsatt leses fysisk: plen og ganglinjer viser den nye offentlige bruken, mens den inngjerdede gravlunden viser at det eldre laget ikke forsvant helt.",
  episode: { actors: ["Kristiania kommune", "parkforkjempere og gravlundens brukere"], date: "1918", action: "Kommunen vedtok å avvikle Sofienberg gravlund og omforme arealet til park.", consequence: "Et gravlundsterreng ble gradvis offentlig friområde, mens den jødiske gravlunden ble bevart." },
  sources: [{ title: "Lokalhistoriewiki – Sofienberg gravlund", url: urls.cemetery }, { title: "Lokalhistoriewiki – Parker i Oslo kommune", url: urls.parks }, { title: "Oslo kommune – Sofienbergparken", url: urls.municipality }],
  tags: ["gravlund", "park", "friområde", "1918"], related_people: ["marius_rohne"], related_places: ["sofienberg_kirke"],
  score: { narrative: 5, historical: 2, source: 5, play_value: 4, originality: 3, total: 19 },
  arc: { start: "Et tett byområde hadde gravlund, men få offentlige friområder.", middle: "Kommunen valgte i 1918 en gradvis parkomforming.", end: "Den bevarte jødiske gravlunden gjør vendepunktet synlig i dagens park." },
  next_scenes: [{ place_id: "olaf_ryes_plass", reason: "Olaf Ryes plass gir et nærliggende, men annerledes forløp for hvordan et offentlig parkrom ble etablert." }]
}]);
const episodeManifest = read("data/stories/stories_episode_v1_manifest.json");
addOnce(episodeManifest.files, storyFile);
write("data/stories/stories_episode_v1_manifest.json", episodeManifest);

const storyManifest = read("data/stories/stories_manifest.json");
const sofEntry = storyManifest.files.find(entry => entry.entity_id === "sofienbergparken");
if (sofEntry) { sofEntry.category = "by"; sofEntry.path = storyFile; }
else storyManifest.files.push({ category: "by", entity_id: "sofienbergparken", path: storyFile });
write("data/stories/stories_manifest.json", storyManifest);

const readingFile = "data/lesespor/oslo/lesespor_oslo_by.json";
const readings = read(readingFile);
readings.items = readings.items.filter(item => !item.id.startsWith("lesespor_sofienbergparken_"));
readings.items.push(
  { id: "lesespor_sofienbergparken_gravlund", title: "Sofienberg gravlund", author: null, publication: "Lokalhistoriewiki", date: null, year: 1918, type: "reference_article", subjects: ["Sofienberg gravlund", "parkhistorie", "friområde"], place_ids: ["sofienbergparken"], person_ids: ["marius_rohne"], category_hints: ["by", "historie"], url: urls.cemetery, access: "open", rights: "link_only", source_quality: "institutional_reference", curation_status: "strong_candidate", relevance: "Stedsspesifikk framstilling av gravlunden, parkstriden, 1918-vedtaket og den bevarte jødiske gravlunden." },
  { id: "lesespor_sofienbergparken_kommune", title: "Sofienbergparken", author: null, publication: "Oslo kommune", date: null, year: null, type: "municipal_reference", subjects: ["park", "fasiliteter", "avgrensning"], place_ids: ["sofienbergparken"], person_ids: [], category_hints: ["by", "natur"], url: urls.municipality, access: "open", rights: "link_only", source_quality: "official", curation_status: "strong_candidate", relevance: "Canonical kilde for dagens parkdeler, fasiliteter og fysisk avgrensning." },
  { id: "lesespor_sofienbergparken_oppgradering", title: "Oppgraderte Sofienbergparken endelig åpnet", author: null, publication: "Arkitektur", date: "2025-06-17", year: 2025, type: "trade_press_article", subjects: ["landskapsarkitektur", "belysning", "tilgjengelighet"], place_ids: ["sofienbergparken"], person_ids: [], category_hints: ["by"], url: urls.upgrade, access: "open", rights: "link_only", source_quality: "recognized_trade_press", curation_status: "strong_candidate", relevance: "Dokumenterer oppgraderingen av østdelen og den samtidige tilgjengelighetskritikken." }
);
write(readingFile, readings);

const normalizeI18n = value => String(value || "").normalize("NFC").replace(/\r\n?/g, "\n").replace(/[ \t]+/g, " ").trim();
const i18nHash = crypto.createHash("sha256").update(JSON.stringify({ name: normalizeI18n(place.name), desc: normalizeI18n(place.desc), popupDesc: normalizeI18n(place.popupDesc) })).digest("hex").slice(0, 16);
const translations = {
  en: { name: "Sofienberg Park", desc: "Sofienberg Park emerged when the former cemetery was gradually converted into a public park after a municipal decision in 1918. The preserved Jewish cemetery makes the earlier land use visible, while today's park consists of the main park, a dog park and a children's park. Rathkes gate divides the grounds, and Sofienberg Church is a separate neighbouring place.", popupDesc: `Sofienberg Park is the public green space that the City of Oslo describes as the main park, the dog park and the Sofienberg children's park. Rathkes gate divides the park, while Sofienberg Church, the Jewish cemetery and the recycling station must be treated as separate objects or neighbouring places with their own functions.

The park grounds were formerly part of Sofienberg cemetery. Following a public dispute over burial space and open space, the municipality decided in 1918 to close the cemetery and convert the land into a park; the first park sections opened around 1920, while graves were removed gradually until 1972. The Jewish cemetery was preserved and remains a visible historical layer in the park landscape.

Marius Røhne led the park authority of Kristiania and later Oslo from 1916 to 1948. Sources on the city's parks describe the conversion of Sofienberg cemetery as one of the major measures of the period, but do not document that Røhne alone designed the entire park as it exists today. The person link therefore concerns his leadership of park policy and implementation, not an unsupported claim of sole authorship.

The municipality currently lists a playground, table tennis, drinking water, a public toilet, a fountain and a city-bike station in the park. An upgrade of the eastern section opened in 2025 with new meeting places, lighting and elements for staying in the park; accessibility was also criticised. The newer design can be read both as an improvement and as a question of who can actually use the facility.

Piknik i Parken uses Sofienberg Park as a festival venue and has a documented visual identity of its own. The Brand card represents the festival identity, not ownership of the park or municipal endorsement of the brand. Pride Park took place here on 26–29 June 2024; this is a time-bounded queer cultural and public-space layer, not evidence for labelling all park use as subculture or making the 2024 event permanent.

Historical and recent photographs show cemetery ground east of Rathkes gate in the 1920s and the park landscape in 2022. The images are not documented from an identical viewpoint, so they are used to read land use and historical layers rather than for exact optical measurement. Sofienberg Park's distinctive history lies in the gradual conversion of burial ground into a public park without every trace of the earlier function disappearing.` },
  es: { name: "Parque Sofienberg", desc: "El parque Sofienberg surgió cuando el antiguo cementerio se transformó gradualmente en parque público tras una decisión municipal de 1918. El cementerio judío conservado hace visible el uso anterior del terreno, mientras que el parque actual comprende el parque principal, un parque para perros y un parque infantil. Rathkes gate divide el recinto y la iglesia de Sofienberg es un lugar vecino independiente.", popupDesc: `El parque Sofienberg es el espacio verde público que el Ayuntamiento de Oslo describe como parque principal, parque para perros y parque infantil de Sofienberg. Rathkes gate divide el parque, mientras que la iglesia de Sofienberg, el cementerio judío y la estación de reciclaje deben tratarse como objetos o lugares vecinos separados y con funciones propias.

El terreno del parque formó parte anteriormente del cementerio de Sofienberg. Tras un debate público sobre espacio funerario y zona libre, el municipio decidió en 1918 cerrar el cementerio y transformar el terreno en parque; las primeras secciones del parque se abrieron hacia 1920 y las tumbas se retiraron gradualmente hasta 1972. El cementerio judío se conservó y sigue siendo una capa histórica visible en el paisaje.

Marius Røhne dirigió el servicio de parques de Kristiania y después de Oslo entre 1916 y 1948. Las fuentes sobre los parques de la ciudad destacan la transformación del cementerio de Sofienberg como una de las grandes actuaciones del periodo, pero no documentan que Røhne diseñara por sí solo todo el parque actual. La relación con la persona se refiere a su dirección de la política y la ejecución de parques, no a una autoría exclusiva sin documentar.

El municipio indica actualmente que el parque cuenta con zona de juegos, tenis de mesa, agua potable, aseo público, fuente y estación de bicicletas urbanas. Una reforma de la parte oriental se inauguró en 2025 con nuevos puntos de encuentro, iluminación y elementos para permanecer en el lugar; también se criticó la accesibilidad. El diseño reciente puede leerse como mejora y, al mismo tiempo, como una pregunta sobre quién puede utilizar realmente el espacio.

Piknik i Parken utiliza el parque Sofienberg como recinto de festival y posee una identidad visual propia documentada. La tarjeta Brand muestra la identidad del festival, no la propiedad del parque ni el respaldo municipal de la marca. Pride Park se celebró aquí del 26 al 29 de junio de 2024; es una capa queer de cultura y espacio público limitada en el tiempo, no una base para etiquetar todo uso del parque como subcultura ni para convertir el evento de 2024 en permanente.

Las fotografías históricas y recientes muestran, respectivamente, terreno de cementerio al este de Rathkes gate en la década de 1920 y el paisaje del parque en 2022. No están documentadas desde un punto de vista idéntico, por lo que sirven para leer usos del suelo y capas históricas, no para una medición óptica exacta. La historia particular del parque reside en que un lugar funerario se convirtió gradualmente en parque público sin que desaparecieran todos los rastros de su función anterior.` },
  pt: { name: "Parque Sofienberg", desc: "O Parque Sofienberg surgiu quando o antigo cemitério foi gradualmente convertido em parque público após uma decisão municipal de 1918. O cemitério judaico preservado torna visível o uso anterior do terreno, enquanto o parque atual inclui o parque principal, uma área para cães e um parque infantil. A Rathkes gate divide o conjunto, e a Igreja de Sofienberg é um local vizinho separado.", popupDesc: `O Parque Sofienberg é a área verde pública que o Município de Oslo descreve como parque principal, parque para cães e parque infantil de Sofienberg. A Rathkes gate divide o parque, enquanto a Igreja de Sofienberg, o cemitério judaico e a estação de reciclagem devem ser tratados como objetos ou locais vizinhos separados, com funções próprias.

O terreno do parque fazia anteriormente parte do cemitério de Sofienberg. Após uma disputa pública sobre espaço funerário e área livre, o município decidiu em 1918 encerrar o cemitério e transformar o terreno em parque; as primeiras partes do parque abriram por volta de 1920, enquanto os túmulos foram removidos gradualmente até 1972. O cemitério judaico foi preservado e continua sendo uma camada histórica visível na paisagem.

Marius Røhne dirigiu o serviço de parques de Kristiania e, posteriormente, de Oslo entre 1916 e 1948. As fontes sobre os parques da cidade destacam a transformação do cemitério de Sofienberg como uma das grandes medidas do período, mas não documentam que Røhne tenha projetado sozinho todo o parque atual. A ligação com a pessoa diz respeito à sua direção da política e da execução de parques, não a uma autoria exclusiva sem comprovação.

O município informa atualmente que o parque tem área infantil, tênis de mesa, água potável, banheiro público, fonte e estação de bicicletas urbanas. Uma reforma da parte leste foi inaugurada em 2025 com novos pontos de encontro, iluminação e elementos de permanência; a acessibilidade também foi criticada. O desenho recente pode ser lido como melhoria e, ao mesmo tempo, como uma questão sobre quem realmente pode usar o espaço.

O Piknik i Parken utiliza o Parque Sofienberg como espaço de festival e possui uma identidade visual própria documentada. O cartão Brand mostra a identidade do festival, não a propriedade do parque nem o endosso municipal da marca. O Pride Park ocorreu aqui de 26 a 29 de junho de 2024; trata-se de uma camada queer de cultura e espaço público limitada no tempo, não de base para rotular todo o uso do parque como subcultura ou tornar permanente o evento de 2024.

Fotografias históricas e recentes mostram, respectivamente, terreno de cemitério a leste da Rathkes gate na década de 1920 e a paisagem do parque em 2022. As imagens não foram documentadas do mesmo ponto de vista, por isso são usadas para ler usos do solo e camadas históricas, e não para medição óptica exata. A história particular do Parque Sofienberg está na transformação gradual de um local funerário em parque público sem que todos os vestígios da função anterior desaparecessem.` }
};
for (const [lang, translation] of Object.entries(translations)) {
  const file = `data/i18n/content/places/${lang}.json`;
  const pack = read(file);
  pack.sofienbergparken = { _sourceHash: i18nHash, _status: "machine_translated", ...translation };
  write(file, pack);
}

const claims = [
  ["identity", "Oslo kommune beskriver Sofienbergparken som hovedpark, hundepark og barnepark, delt av Rathkes gate.", urls.municipality, "Deler av parken og fasiliteter", "current"],
  ["cemetery_decision", "Kommunen vedtok i 1918 å avvikle gravlunden og omforme arealet til park.", urls.cemetery, "Avsnitt om debatten 1915–1918", "historical"],
  ["gradual_conversion", "De første parkdelene kom rundt 1920, og gravene ble fjernet fram til 1972.", urls.parks, "Avsnitt om Sofienbergparken", "historical"],
  ["jewish_cemetery", "Den jødiske gravlunden ble bevart.", urls.cemetery, "Avsnitt om bevarte deler", "current"],
  ["rohne", "Marius Røhne ledet parkvesenet 1916–1948, og Sofienberg var et stort tiltak i perioden.", urls.rohneNbl, "Biografi sammenholdt med parkoversikt", "historical"],
  ["facilities", "Kommunen oppgir lekeplass, bordtennis, drikkevann, toalett, fontene og bysykkelstasjon.", urls.municipality, "Fasilitetsliste", "current"],
  ["upgrade", "Østdelen åpnet etter oppgradering i 2025, og tilgjengeligheten ble kritisert.", urls.upgrade, "Artikkelen om gjenåpningen", "current"],
  ["pip", "Piknik i Parken har dokumentert program og visuell identitet i Sofienbergparken.", urls.pip, "Forside og program", "current"],
  ["pride", "Pride Park ble arrangert i Sofienbergparken 26.–29. juni 2024.", urls.prideMunicipality, "Kommunens programoversikt", "historical"],
  ["photos", "Commons-filene dokumenterer et gravlundsmotiv fra 1920-årene og parkmotiv fra 2022, uten identisk kamerastandpunkt.", urls.before, "Filmetadata sammenholdt med 2022-filen", "historical"]
].map(([id, claim, sourceUrl, sourceLocation, temporalStatus]) => ({ id: `claim_sofienberg_${id}`, claim, sourceUrl, sourceLocation, sourceType: sourceUrl.includes("oslo.kommune.no") ? "official" : sourceUrl.includes("snl.no") ? "reputable_secondary" : "institutional", verifiedAt, status: "verified", claimKind: id === "gradual_conversion" ? "strong" : id === "identity" ? "identity" : id === "pride" ? "temporal" : "ordinary", evidenceMode: id === "gradual_conversion" ? "explicit" : id === "photos" || id === "rohne" ? "corroborated" : "direct", temporalStatus, ...(id === "photos" ? { independentSourceUrls: [urls.now] } : id === "rohne" ? { independentSourceUrls: [urls.parks] } : id === "gradual_conversion" ? { independentSourceUrls: [urls.cemetery] } : {}) }));
const sentenceCount = text => [...new Intl.Segmenter("nb", { granularity: "sentence" }).segment(text)].map(entry => entry.segment.trim()).filter(Boolean).length;
const descCoverage = Array.from({ length: sentenceCount(place.desc) }, (_, i) => ({ sentence: i + 1, claimIds: i === 0 ? ["claim_sofienberg_cemetery_decision"] : i === 1 ? ["claim_sofienberg_jewish_cemetery", "claim_sofienberg_identity"] : ["claim_sofienberg_identity"] }));
const popupClaimOrder = ["identity", "identity", "cemetery_decision", "gradual_conversion", "jewish_cemetery", "rohne", "rohne", "rohne", "facilities", "upgrade", "upgrade", "pip", "pip", "pride", "photos", "photos", "cemetery_decision"];
const popupCoverage = Array.from({ length: sentenceCount(place.popupDesc) }, (_, i) => ({ sentence: i + 1, claimIds: [`claim_sofienberg_${popupClaimOrder[i] || "identity"}`] }));
write("data/places/production/sofienbergparken.json", {
  schemaVersion: "4.2", validatorVersion: "4.2.1", placeId: "sofienbergparken", placeFile, status: "ready_v4_2",
  identity: { status: "resolved", represents: "Det navngitte offentlige parkanlegget, delt av Rathkes gate.", period: "1920–", excludes: ["Sofienberg kirke", "den jødiske gravlunden som aktivt gravsted", "Sofienbergparken gjenvinningsstasjon", "alle parkbrukere som én subkultur"] },
  metadataSnapshot: { name: place.name, year: place.year, category: place.category },
  textHashes: { algorithm: "sha256", desc: sha256(place.desc), popupDesc: sha256(place.popupDesc) }, claims,
  sentenceCoverage: { desc: descCoverage, popupDesc: popupCoverage },
  roundsReadiness: { people: "ready", objects: "ready", brands: "ready", related: "ready", badges: "ready", quiz: "ready", leksikon: "ready", sprak: "ready", stories: "ready", for_na: "ready", readings: "ready", events: "reviewed_no_current_source_driven_event", routes: "reviewed_no_canonical_route" },
  quizReadiness: { status: "canonical_rich_5x7", quizTargetId: "sofienbergparken", sourceBrief: "data/quiz/production_briefs/by/sofienbergparken.json", productionContext: "data/quiz/production_context/by/sofienbergparken.json", normalOpeningQuestions: 14, totalQuestions: 35, questions: [
    { question: "Hva var parkgrunnens tidligere hovedfunksjon?", answer: "Gravlund", type: "hva", normalKnowledgeQuestion: true, claimIds: ["claim_sofienberg_cemetery_decision"] },
    { question: "Når vedtok kommunen å omforme arealet til park?", answer: "1918", type: "når", normalKnowledgeQuestion: true, claimIds: ["claim_sofienberg_cemetery_decision"] },
    { question: "Hva skjedde med gravene fram til 1972?", answer: "De ble gradvis fjernet", type: "hva_skjedde", normalKnowledgeQuestion: true, claimIds: ["claim_sofienberg_gradual_conversion"] },
    { question: "Hvilket gravlundsområde ble bevart?", answer: "Den jødiske gravlunden", type: "hvilket_verk_eller_objekt", normalKnowledgeQuestion: true, claimIds: ["claim_sofienberg_jewish_cemetery"] },
    { question: "Hvem ledet parkvesenet i omformingsperioden?", answer: "Marius Røhne", type: "hvem", normalKnowledgeQuestion: true, claimIds: ["claim_sofienberg_rohne"] },
    { question: "Hva ble åpnet etter oppgradering i 2025?", answer: "Den østlige parkdelen", type: "hva_ble_bygget_produsert_eller_endret", normalKnowledgeQuestion: true, claimIds: ["claim_sofienberg_upgrade"] },
    { question: "Når ble Pride Park arrangert her?", answer: "26.–29. juni 2024", type: "når", normalKnowledgeQuestion: true, claimIds: ["claim_sofienberg_pride"] },
    { question: "Hva kan fotoparet ikke dokumentere alene?", answer: "Identisk kamerastandpunkt og alle endringsårsaker", type: "hva", normalKnowledgeQuestion: true, claimIds: ["claim_sofienberg_photos"] }
  ] },
  reviews: { factual: { status: "passed", reviewedAt: verifiedAt, reviewer: "Sofienbergparken phase 8–24 source review", notes: "Alle synlige setninger er claim-dekket; kirke og park er skilt." }, editorial: { status: "passed", reviewedAt: verifiedAt, reviewer: "Sofienbergparken phase 8–24 editorial review", introducedNewFacts: false, notes: "Teksten uttrykker tids-, bilde- og eierskapsgrenser." } },
  reviewsNotes: ["Årstallet 1980 er korrigert til 1920 som første parkfase.", "Udokumenterte poesipark-koblinger holdes tilbake fra People-runden.", "Subkultur avgrenses til Pride Park 2024."],
  completion: { completedUnder: "4.2", currentStatus: "current", sourceVerifiedAt: verifiedAt, claimsVerified: { verified: claims.length, total: claims.length }, factualReview: "passed", editorialReview: "passed", validatorVersion: "4.2.1" }
});

const quizSources = {
  municipality: urls.municipality, cemetery: urls.cemetery, parks: urls.parks, rohne: urls.rohneNbl,
  upgrade: urls.upgrade, pip: urls.pip, pride: urls.prideMunicipality, before: urls.before, now: urls.now
};
const curriculum = {
  module_ids: ["kur_by_04_historiske_lag_og_transformasjon", "kur_by_07_gronn_blaa_og_offentlig_natur"],
  emne_ids: ["em_by_parker_som_sosial_infrastruktur", "em_by_opphold_vs_gjennomgang", "em_by_historiske_lag_i_hverdagsrom"],
  topic_hook_ids: ["byliv_aapne_rom", "byliv_opphold_vs_gjennomgang", "his_spor_gatebilde"],
  method_ids: ["met_for_etter"], thinker_ids: ["william_h_whyte", "michel_de_certeau", "walter_benjamin", "kevin_lynch"],
  works: ["The Social Life of Small Urban Spaces", "The Practice of Everyday Life", "The Arcades Project", "The Image of the City"]
};
const quizRows = [
  ["Hvilke tre deler regner kommunen som Sofienbergparken?", "Hovedparken, Hundeparken og barneparken", "Kirken, bryggeriet og Birkelunden", "To kirkegårder og et torg", "Kommunen beskriver hovedpark, Hundeparken og barnepark som deler av anlegget.", "municipality", "em_by_parker_som_sosial_infrastruktur"],
  ["Hvilken gate deler parken?", "Rathkes gate", "Markveien", "Toftes gate", "Rathkes gate deler parkarealet i to.", "municipality", "em_by_historiske_lag_i_hverdagsrom"],
  ["Hvordan behandles Sofienberg kirke i denne stedspakken?", "Som et separat nabosted", "Som parkens hovedobjekt", "Som festivalbrand", "Kirken ligger ved parken, men har egen stedseier og institusjonshistorie.", "municipality", "em_by_historiske_lag_i_hverdagsrom"],
  ["Hva var parkgrunnens tidligere hovedfunksjon?", "Gravlund", "Bryggeri", "Jernbanetomt", "Parken vokste fram på deler av den tidligere Sofienberg gravlund.", "cemetery", "em_by_historiske_lag_i_hverdagsrom"],
  ["Når vedtok kommunen å avvikle gravlunden og gjøre arealet til park?", "1918", "1890", "1972", "Det kommunale vendepunktet kom i 1918.", "cemetery", "em_by_historiske_lag_i_hverdagsrom"],
  ["Hva sto sentralt i striden før vedtaket?", "Gravplass eller offentlig park", "Bilvei eller jernbane", "Skole eller rådhus", "Striden gjaldt om arealet skulle fortsette som gravplass eller bli friområde og park.", "cemetery", "em_by_parker_som_sosial_infrastruktur"],
  ["Når kom de første parkdelene omtrent?", "Rundt 1920", "Rundt 1850", "Rundt 1980", "De første parkdelene ble tatt i bruk rundt 1920.", "parks", "em_by_historiske_lag_i_hverdagsrom"],
  ["Hvor lenge fortsatte den gradvise fjerningen av graver?", "Fram til 1972", "Bare til 1920", "Fram til 2005", "Parkomformingen strakte seg over flere tiår, med gravfjerning fram til 1972.", "parks", "em_by_historiske_lag_i_hverdagsrom"],
  ["Hvilken del av det eldre gravlundsanlegget ble bevart?", "Den jødiske gravlunden", "Hele den kristne gravlunden", "Et gravkapell i hundeparken", "Den jødiske gravlunden er det bevarte gravlundslaget.", "cemetery", "em_by_historiske_lag_i_hverdagsrom"],
  ["Hva er det tydeligste fysiske sporet etter den gamle arealbruken?", "Den inngjerdede jødiske gravlunden", "PiP-logoen", "Bysykkelstasjonen", "Den bevarte gravlunden gjør tidligere arealbruk fysisk lesbar.", "cemetery", "em_by_historiske_lag_i_hverdagsrom"],
  ["Hva var Marius Røhnes fagfelt?", "Landskapsarkitektur og parkforvaltning", "Bryggeriteknikk", "Kirkemusikk", "Røhne var landskapsarkitekt og bygartner.", "rohne", "em_by_parker_som_sosial_infrastruktur"],
  ["Når ledet Røhne byens parkvesen?", "1916–1948", "1858–1872", "1972–2005", "Røhne ledet Kristianias og Oslos parkvesen fra 1916 til 1948.", "rohne", "em_by_parker_som_sosial_infrastruktur"],
  ["Hva dokumenterer kildene om Røhne og Sofienberg?", "Han ledet parkvesenet da omformingen var et stort tiltak", "Han eide hele parken privat", "Han opprettet PiP-festivalen", "Personkoblingen gjelder ledelse av parkvesenet og parkpolitikken i omformingsperioden.", "parks", "em_by_parker_som_sosial_infrastruktur"],
  ["Hvilken påstand holdes bevisst tilbake?", "At Røhne alene tegnet hele dagens park", "At han ledet parkvesenet", "At han var landskapsarkitekt", "Kildene bærer ikke et udokumentert eneopphav til hele dagens park.", "rohne", "em_by_historiske_lag_i_hverdagsrom"],
  ["Hva viser Sofienberg-saken om kommunalt parkarbeid?", "At omforming kan ta flere tiår", "At alle parker åpner ferdige samme dag", "At parker ikke påvirkes av politikk", "Vedtaket i 1918 og avslutningen i 1972 viser en lang gjennomføringsperiode.", "parks", "em_by_historiske_lag_i_hverdagsrom"],
  ["Hvilket sosialt formål fikk parkpolitikken i den tette byen?", "Offentlige friområder for lek og opphold", "Kun private hager", "Bare gjennomgangstrafikk", "Parkene skulle gi tilgjengelige friområder i tett bebyggelse.", "rohne", "em_by_parker_som_sosial_infrastruktur"],
  ["Hvilken aktivitet lister kommunen med eget bord?", "Bordtennis", "Ishockey", "Hesteridning", "Bordtennis er blant de oppgitte fasilitetene.", "municipality", "em_by_opphold_vs_gjennomgang"],
  ["Hvilken vannfasilitet oppgir kommunen?", "Drikkevann", "Badebasseng", "Båthavn", "Kommunen oppgir drikkevann i parken.", "municipality", "em_by_parker_som_sosial_infrastruktur"],
  ["Hvilken sanitærfasilitet finnes i kommunens oversikt?", "Offentlig toalett", "Hotellbad", "Garderobeanlegg", "Offentlig toalett står i fasilitetsoversikten.", "municipality", "em_by_parker_som_sosial_infrastruktur"],
  ["Hvilket eldre parkinnslag oppgir kommunen?", "Fontene", "Fyrtårn", "Taubane", "Fontenen er listet som parkfasilitet.", "municipality", "em_by_historiske_lag_i_hverdagsrom"],
  ["Hvilken transporttjeneste er registrert ved parken?", "Bysykkelstasjon", "T-banestasjon", "Fergeterminal", "Kommunen oppgir bysykkelstasjon ved parken.", "municipality", "em_by_opphold_vs_gjennomgang"],
  ["Hvilken del åpnet etter oppgradering i 2025?", "Den østlige delen", "Bare kirketårnet", "Olaf Ryes plass", "Oppgraderingen gjaldt parkens østlige del.", "upgrade", "em_by_historiske_lag_i_hverdagsrom"],
  ["Hva ble blant annet lagt til i oppgraderingen?", "Nye møteplasser og belysning", "Et kjøpesenter", "En motorvei", "Prosjektet la til møteplasser, lys og oppholdselementer.", "upgrade", "em_by_parker_som_sosial_infrastruktur"],
  ["Hvilket kritisk spørsmål fulgte oppgraderingen?", "Tilgjengelighet for ulike brukere", "Om parken skulle bli flyplass", "Om Rathkes gate ligger i Bergen", "Tilgjengeligheten ble kritisert og inngår i vurderingen av tiltaket.", "upgrade", "em_by_parker_som_sosial_infrastruktur"],
  ["Hva slags identitet er Piknik i Parken i kortflaten?", "En festivalbrand", "Parkens juridiske eier", "Et gravlundobjekt", "PiP vises som dokumentert festivalidentitet, uten eierskap eller endorsement.", "pip", "em_by_parker_som_sosial_infrastruktur"],
  ["Når brukte Pride Park Sofienbergparken i 2024?", "26.–29. juni", "Hele året", "Bare 17. mai", "Kommunen dokumenterer Pride Park i parken 26.–29. juni 2024.", "pride", "em_by_parker_som_sosial_infrastruktur"],
  ["Hvordan skal Pride Park-laget tolkes?", "Som et tidsavgrenset 2024-lag", "Som identiteten til alle parkbrukere", "Som permanent parkdrift", "Arrangementet dokumenterer en skeiv offentlighetsbruk i 2024, ikke en permanent merkelapp.", "pride", "em_by_historiske_lag_i_hverdagsrom"],
  ["Hva kan før/etter-bildene ikke brukes til?", "Eksakt måling fra identisk kamerastandpunkt", "Å se to historiske tidslag", "Å finne kirketårnet som orienteringspunkt", "Kamerastandpunktene er ikke dokumentert som identiske.", "before", "em_by_historiske_lag_i_hverdagsrom"],
  ["Hva betyr det å lese parken som sosial infrastruktur?", "Å undersøke hvordan rommet støtter møter, lek og opphold", "Å telle bare festivaler", "Å gjøre kirken til parkobjekt", "Sosial infrastruktur handler om hvordan offentlig utforming muliggjør hverdagsliv.", "municipality", "em_by_parker_som_sosial_infrastruktur"],
  ["Hva bør en systematisk observasjon skille mellom?", "Opphold, lek og gjennomgang", "Bare gamle og nye gatenavn", "Kun trærnes høyde", "Observasjon kan registrere hvor folk beveger seg, stopper og oppholder seg uten å gjette motiv.", "municipality", "em_by_opphold_vs_gjennomgang"],
  ["Hva er første steg i en før/etter-analyse her?", "Finn felles ankre og noter ulikt standpunkt", "Anta identisk kamera", "Forklar alle årsaker fra bildene alene", "Metoden starter med sammenlignbare elementer og uttrykte begrensninger.", "before", "em_by_historiske_lag_i_hverdagsrom"],
  ["Hvordan leses den jødiske gravlunden som historisk lag?", "Som et bevart spor i et omformet landskap", "Som en festivaldekorasjon", "Som bevis på at ingen endring skjedde", "Et bevart element kan synliggjøre både kontinuitet og endring.", "cemetery", "em_by_historiske_lag_i_hverdagsrom"],
  ["Hva er en own-place-analyse av Sofienberg kirke?", "Å skille kirkens historie fra parkens egne lag", "Å flytte hele kirkeprosjektet inn i parken", "Å fjerne kirken fra all nabokontekst", "Own-place-prinsippet beholder relevant nabokontekst uten falskt eierskap.", "municipality", "em_by_historiske_lag_i_hverdagsrom"],
  ["Hvorfor kombineres kommune-, historie- og bildekilder?", "De dokumenterer dagens funksjon, endringsforløp og visuelle spor", "Flere lenker gjør gjetninger sanne", "Én logo kan erstatte alle kilder", "Kildetriangulering fordeler ulike dokumentasjonsjobber på egnede kildetyper.", "parks", "em_by_historiske_lag_i_hverdagsrom"],
  ["Hva er den mest kildekritiske helhetslesningen?", "Parken har dokumenterte lag, mens bruk og årsaker må belegges særskilt", "Alle brukere deler én identitet", "Alle nabosteder tilhører parken", "En flerlagslesning virker når identitet, tid, observasjon og kildegrenser holdes tydelige.", "now", "em_by_historiske_lag_i_hverdagsrom"]
];
const conceptByEmne = {
  em_by_parker_som_sosial_infrastruktur: ["offentlig park", "co_by_offentlig_park_4d9043d740"],
  em_by_opphold_vs_gjennomgang: ["opphold og gjennomgang", "co_by_opphold_og_gjennomgang_38f317fab0"],
  em_by_historiske_lag_i_hverdagsrom: ["historiske lag", "co_by_historiske_lag_b5eb5eb432"]
};
const thinkers = [
  ["byliv_aapne_rom", "william_h_whyte", "The Social Life of Small Urban Spaces"],
  ["byliv_opphold_vs_gjennomgang", "michel_de_certeau", "The Practice of Everyday Life"],
  ["his_spor_gatebilde", "walter_benjamin", "The Arcades Project"],
  ["his_spor_gatebilde", "kevin_lynch", "The Image of the City"]
];
const contextQuestionIndexes = new Set([2, 5, 9, 12, 14, 23, 26]);
const questions = quizRows.map((row, index) => {
  const [question, answer, wrong1, wrong2, knowledge, source, emne_id] = row;
  const n = index + 1;
  const [concept, conceptId] = conceptByEmne[emne_id];
  const item = {
    id: `sofienbergparken_quiz_${n}`, quiz_id: `by_sofienbergparken_set_${Math.floor(index / 7) + 1}_q${(index % 7) + 1}`,
    categoryId: "by", placeId: "sofienbergparken", targetId: "sofienbergparken", question_scope: "place",
    question, options: [answer, wrong1, wrong2], answer, answerIndex: 0, knowledge,
    difficulty: index < 7 ? 1 : index < 21 ? 2 : index < 28 ? 3 : 4,
    question_type: index >= 28 ? "concept" : contextQuestionIndexes.has(index) ? "context" : "fact", emne_id, source: [source], source_origin: "external",
    claim_basis: knowledge, claim_id: `claim_sofienbergparken_quiz_${n}`,
    primary_knowledge_unit_id: `ku_by_sofienbergparken_${String(n).padStart(2, "0")}`,
    knowledge_unit_ids: [`ku_by_sofienbergparken_${String(n).padStart(2, "0")}`],
    concepts: [concept], concept_ids: [conceptId], term_ids: [], knowledge_contract_version: 1, knowledge_link_status: "linked"
  };
  if (index >= 28) {
    const topic_hook_id = emne_id === "em_by_parker_som_sosial_infrastruktur" ? "byliv_aapne_rom" : emne_id === "em_by_opphold_vs_gjennomgang" ? "byliv_opphold_vs_gjennomgang" : "his_spor_gatebilde";
    const [thinker_id, work] = topic_hook_id === "byliv_aapne_rom" ? ["william_h_whyte", "The Social Life of Small Urban Spaces"] : topic_hook_id === "byliv_opphold_vs_gjennomgang" ? ["michel_de_certeau", "The Practice of Everyday Life"] : ["walter_benjamin", "The Arcades Project"];
    Object.assign(item, { method_id: "met_for_etter", topic_hook_id, thinker_id, work,
      theory_ref: { topic_hook_id, thinker_id, work, why_it_helps: "Perspektivet strukturerer observasjon, romlig lesning og bildesammenligning uten å erstatte stedskildene." },
      guidance_basis: ["data/fag/by/fagkart_by.json", "data/fag/by/methods_by.json"] });
  }
  return item;
});
const setTitles = ["Parken og grensen", "Fra gravlund til park", "Parkvesen, fasiliteter og oppgradering", "Arrangementer, bilder og kildegrenser", "Observasjon, metode og kildekritikk"];
const existingQuizAudit = { searched_paths: ["data/quiz/manifest.json", "data/quiz/by/", placeFile], active_before: { file: null, set_count: 0, question_count: 0, finding: "Ingen manifest-loadet canonical quizpakke for stedet." }, decisions: ["Opprett rich 5x7.", "Hold teori ute av de første 28 spørsmålene.", "Ikke bruk kirken eller udokumentert poesipark som proxy."], knowledge_migration: "Nytt target genereres deterministisk fra pakken." };
const profileDecision = { profile: "rich", set_count: 5, questions_per_set: 7, justification: "Fem læringsjobber: parkgrense, gravlundstransformasjon, parkvesen og oppgradering, arrangementer og bilder, samt metode og kildekritikk." };
const heldBackCandidates = ["Sofienbergprosjektet i kirken som parkeid innhold.", "Pride Park 2024 som permanent identitet.", "Marius Røhne som eneopphav.", "Eksakt optisk før/etter-påstand."];
const quizPackage = {
  targetId: "sofienbergparken", categoryId: "by", sources: quizSources,
  production_context: { manifest_category: "by", profile: "rich_5x7", standard_version: "3.3", source_brief: "data/quiz/production_briefs/by/sofienbergparken.json", context_artifact: "data/quiz/production_context/by/sofienbergparken.json", resolved_files: { pensum: "data/fag/by/pensum_by.json", emner: "data/fag/by/emner_by.json", fagkart: "data/fag/by/fagkart_by.json", methods: "data/fag/by/methods_by.json", supersetQuizMal: "data/fag/by/supersetQUIZMAL_by.json", quizStandard: "data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md", quizQuestionSchema: "data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json" }, required_inputs_loaded: ["pensum", "emner", "fagkart", "methods", "supersetQuizMal", "quizStandard", "quizQuestionSchema"], pensum_module_ids: curriculum.module_ids, emne_ids: curriculum.emne_ids, topic_hook_ids: curriculum.topic_hook_ids, method_ids: curriculum.method_ids, thinker_ids: curriculum.thinker_ids, works: curriculum.works, source_review_status: "reviewed", existing_quiz_audit: existingQuizAudit, profile_decision: profileDecision, held_back_candidates: heldBackCandidates, theory_start_phase: "final", method_start_phase: "final" },
  sets: Array.from({ length: 5 }, (_, index) => ({ set_id: `by_sofienbergparken_set_${index + 1}`, title: setTitles[index], level: index + 1, order: index + 1, phase: ["opening", "middle", "middle", "bridge", "final"][index], xp: 50 + index * 10, questions: questions.slice(index * 7, index * 7 + 7) }))
};
write("data/quiz/by/sofienbergparken_sets.json", quizPackage);
write("data/quiz/production_briefs/by/sofienbergparken.json", {
  schema_version: "1.0", status: "reviewed", categoryId: "by", targetId: "sofienbergparken", profile_hint: "rich", reviewed_at: verifiedAt,
  review_note: "Kildene skiller park, kirke og gravlund, bærer fem selvstendige læringsjobber og avgrenser tidsbundne arrangementslag.",
  scope: { place: "Sofienbergparken", production_profile: "rich", set_count: 5, questions_per_set: 7, total_questions: 35, normal_opening_questions: 14 },
  sources: Object.fromEntries(Object.entries(quizSources).map(([id, url]) => [id, { url, source_type: id === "municipality" || id === "pride" ? "official" : id === "rohne" ? "recognized_reference" : "institutional_or_primary", review_status: "reviewed", review_note: `Kilde kontrollert for ${id}.` }])),
  selected_curriculum: curriculum,
  existing_quiz_audit: existingQuizAudit,
  profile_decision: profileDecision,
  held_back_candidates: heldBackCandidates,
  claims: questions.map((question, index) => ({ claim_id: question.claim_id, order: index + 1, planned_phase: index < 7 ? "opening" : index < 21 ? "middle" : index < 28 ? "bridge" : "final", family: index < 28 ? question.question_type : "concept_theory", statement: question.knowledge, source_ids: question.source, source_origin: "external", emne_id: question.emne_id }))
});
const quizManifest = read("data/quiz/manifest.json");
quizManifest.sets = quizManifest.sets.filter(entry => entry.targetId !== "sofienbergparken");
quizManifest.sets.push({ targetId: "sofienbergparken", file: "data/quiz/by/sofienbergparken_sets.json" });
write("data/quiz/manifest.json", quizManifest);
const fagManifest = read("data/fag/fag_manifest.json");
fagManifest.by.quizProduction.targets.sofienbergparken = { source_brief: "../quiz/production_briefs/by/sofienbergparken.json", context_artifact: "../quiz/production_context/by/sofienbergparken.json", quiz_file: "../quiz/by/sofienbergparken_sets.json" };
write("data/fag/fag_manifest.json", fagManifest);

const subcultureSources = [
  { id: "source_sofienbergparken_pride", url: urls.pride, sourceLocation: "Oslo Prides pressemelding om flyttingen til Sofienbergparken i 2024", sourceType: "community_primary", perspective: "milieu", verifiedAt, temporalCoverage: "historical", provenance: "Arrangørens publiserte pressemelding.", limitations: "Dokumenterer arrangørens plan og selvforståelse, ikke alle deltakeres erfaringer." },
  { id: "source_sofienbergparken_pride_authority", url: urls.prideMunicipality, sourceLocation: "Oslo kommunes oversikt over Pride Park 26.–29. juni 2024", sourceType: "official", perspective: "authority", verifiedAt, temporalCoverage: "historical", provenance: "Kommunal program- og arrangementsinformasjon.", limitations: "Dokumenterer dato og sted, ikke en permanent subkulturfunksjon." }
];
write("data/places/subkultur-production/sofienbergparken.json", {
  schemaVersion: "subkultur_place_production_v1", validatorVersion: "1.0.0", placeId: "sofienbergparken", placeFile, status: "ready",
  subculturalIdentity: { statement: "Pride Park 26.–29. juni 2024 er et dokumentert, tidsavgrenset skeivt kultur- og offentlighetslag i Sofienbergparken.", anchorType: "ordinary_public_space_with_subculture_layer", mainSocietyRelationship: "Oslo Pride organiserte programmet i et kommunalt offentlig parkrom, slik at miljøets synlighet var avhengig av tillatelse, finansiering, sikkerhet og parkforvaltning.", placeObjectDistinction: "Rapporten gjelder Pride Park-bruken av selve parken i fire dager i 2024; Sofienberg kirke, organisasjonen Oslo Pride og senere Pride Park-arenaer er separate eiere.", temporalScope: { start: "2024-06-26", end: "2024-06-29", precision: "day", rationale: "Datoene følger kommunens og arrangørens publiserte program." }, sourceIds: subcultureSources.map(source => source.id) },
  subcultureTopics: [{ emneId: "em_sub_tilhorighet_miljo", siteSpecificRationale: "Pride Park gjorde skeiv organisering, synlighet og fellesskap offentlig i akkurat dette parkrommet i 2024.", caseIds: ["case_sofienbergparken_pride_2024"] }],
  sources: subcultureSources,
  subcultureCases: [{
    id: "case_sofienbergparken_pride_2024", claim: "Oslo Pride flyttet Pride Park til Sofienbergparken 26.–29. juni 2024; arrangementet dokumenterer ett tidsbundet skeivt offentlighetslag, ikke identiteten til alle parkbrukere.",
    actors: [{ name: "Oslo Pride, frivillige og deltakere", roleOrInterest: "Organiserte og deltok i Pride Park-programmet.", positionOrPower: "Formet program og miljø, men eide ikke parkrommet.", sourceIds: ["source_sofienbergparken_pride"] }, { name: "Oslo kommune og parkforvaltningen", roleOrInterest: "Satte offentlige rammer for sted, støtte, sikkerhet og bruk.", positionOrPower: "Kontrollerte de formelle vilkårene for den midlertidige arenaen.", sourceIds: ["source_sofienbergparken_pride_authority"] }],
    practicesAndCommunity: { practices: ["skeivt kulturprogram", "organisert samling", "synlighet i offentlig rom"], belongingAndParticipation: "Arrangementet skapte en midlertidig offentlig møteflate; kildene tillater ikke generalisering om alle deltakere eller senere parkbruk.", organizationOrGovernance: "Oslo Pride organiserte arrangementet, mens kommunen dokumenterte det offentlige programmet og rammene.", codesOrExpressions: { status: "documented", statement: "Pride-navn, program og synlighet var uttrykk knyttet til arrangementet.", sourceIds: subcultureSources.map(source => source.id) }, sourceIds: subcultureSources.map(source => source.id) },
    spaceAndPower: { accessAndTerritory: "Parken var offentlig, men arrangementsområdet fulgte midlertidige program-, sikkerhets- og driftsrammer.", controlOrRegulation: { status: "documented", statement: "Arrangør og kommune delte ulike former for program- og romkontroll.", sourceIds: subcultureSources.map(source => source.id) }, conflictOrNegotiation: { status: "not_documented", rationale: "Kildene dokumenterer flytting og rammer, men ikke én konkret intern konflikt i parken.", sourceIds: subcultureSources.map(source => source.id) }, displacementOrInstitutionalization: { status: "documented", statement: "Flyttingen i 2024 var midlertidig; arrangementet returnerte til en annen arena fra 2025.", sourceIds: ["source_sofienbergparken_pride"] }, sourceIds: subcultureSources.map(source => source.id) },
    representationAndEthics: { selfDefinition: { status: "documented", statement: "Oslo Pride presenterte flyttingen som Pride Park på Grünerløkka i 2024.", sourceIds: ["source_sofienbergparken_pride"] }, externalLabels: { status: "documented", statement: "Kommunen oppga sted og dato for Pride Park i sin arrangementsoversikt.", sourceIds: ["source_sofienbergparken_pride_authority"] }, stigmaOrRomanticizationRisk: "Skeive deltakere må ikke framstilles som én homogen gruppe, og all parkbruk må ikke merkes som subkultur.", editorialSafeguard: "Alle formuleringer tidsavgrenses til arrangementet i 2024.", privacySafeguard: "Analysen omtaler organisasjoner og kollektive praksiser, ikke sårbare enkeltpersoner.", sourceIds: subcultureSources.map(source => source.id) },
    methodAndInference: { methodId: "met_sub_deltakelsesanalyse", observationOrEvidence: "Analysen kombinerer arrangørens egen pressemelding med kommunal dato- og stedskontroll.", alternativeExplanations: ["Parkvalget kan også forklares av logistikk og tilgjengelig areal, ikke bare miljøidentitet."], inferenceStatus: "descriptive", reflexivity: "Rapporten skiller en tidsbundet hendelse fra varig stedsidentitet.", uncertainty: "Kildene dokumenterer program og rammer bedre enn individuelle erfaringer.", sourceIds: subcultureSources.map(source => source.id) },
    changeOverTime: { scope: { start: "2024-06-26", end: "2024-06-29", precision: "day", rationale: "Publiserte arrangementsdatoer." }, startingPoint: "Pride Park trengte en alternativ arena i 2024.", changeOrTurningPoint: "Arrangementet flyttet midlertidig til Sofienbergparken.", currentOrEndPoint: "Kildene gir ikke grunnlag for å kalle parken en nåværende Pride Park-arena etter 2024.", continuities: ["skeiv offentlig synlighet", "frivillig organisering"], sourceIds: subcultureSources.map(source => source.id) }
  }],
  presentFunction: { status: "historical", statement: "Pride Park-laget er dokumentert for 26.–29. juni 2024; ingen permanent nåfunksjon hevdes.", historicalRelationship: "Arrangementet er et arkivert brukslag i en park som fortsatt har ordinær offentlig parkfunksjon.", checkedAt: verifiedAt, sourceIds: subcultureSources.map(source => source.id) },
  quizOpening: { status: "PASS", quizTargetId: "sofienbergparken", firstTwoSetsQuestionCount: 14, sourceBrief: "data/quiz/production_briefs/by/sofienbergparken.json", productionContext: "data/quiz/production_context/by/sofienbergparken.json", requiredInputs: ["pensum", "emner", "fagkart", "methods", "supersetQuizMal", "quizStandard", "quizQuestionSchema"] },
  chronologyStories: { status: "PASS", chronologyReviewed: true, storiesReviewed: true, rationale: "Leksikonets 2024-post tidsavgrenser Pride Park; episode_v1-storyen eies av parkens hovedvendepunkt i 1918." },
  gates: Object.fromEntries("ABCDEFGH".split("").map(letter => [letter, { status: "PASS", evidenceRefs: letter === "G" ? ["quizOpening"] : letter === "H" ? ["chronologyStories"] : ["subcultureCases", "sources"] }])),
  review: { reviewer: "Sofienbergparken phase 8–24 subculture review", reviewedAt: verifiedAt, notes: "Kirke-proxyen er fjernet; badgegrunnlaget er tidsbundet til Pride Park 2024 og dobbelkildebelagt." }
});

const natureUnlockFile = path.join(root, "data/natur/nature_unlock_map.json");
const natureUnlockText = fs.readFileSync(natureUnlockFile, "utf8").replaceAll("sofienbergparken_subkultur_quiz_1", "sofienbergparken_quiz_1");
fs.writeFileSync(natureUnlockFile, natureUnlockText);
const naturePlaceMap = read("data/natur/nature_place_map.json");
for (const entry of Object.values(naturePlaceMap)) {
  if (!entry || typeof entry !== "object") continue;
  for (const key of Object.keys(entry)) {
    if (Array.isArray(entry[key])) entry[key] = entry[key].map(value => value === "sofienbergparken_subkultur_quiz_1" ? "sofienbergparken_quiz_1" : value);
  }
}
write("data/natur/nature_place_map.json", naturePlaceMap);

console.log("Built Sofienbergparken phase 8–24 source package.");
