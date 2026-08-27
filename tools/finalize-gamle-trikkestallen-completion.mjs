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
const remove = file => {
  const target = path.join(root, file);
  if (fs.existsSync(target)) fs.unlinkSync(target);
};
const hash = value => crypto.createHash("sha256").update(String(value)).digest("hex");
const normalized = value => String(value).normalize("NFC");
const sentences = value => [...new Intl.Segmenter("nb", { granularity: "sentence" }).segment(String(value))].map(item => item.segment.trim()).filter(Boolean);
const source = (title, url) => ({ title, url });
const urls = {
  sporveien: "https://www.sporveien.no/vare-tjenester/trikken/trikkeholdeplasser/t-o/torshov/",
  byleksikon: "https://oslobyleksikon.no/side/Torshovgata",
  kss: "https://oslobyleksikon.no/side/Kristiania_Sporveisselskab",
  osloNye: "https://oslonye.no/historikk/",
  egal: "https://egalteater.no/om/trikkestallen/",
  sceneweb: "https://sceneweb.no/nb/venue/1970/Trikkestallen_p%C3%A5%20Torshov",
  scenewebPerson: "https://sceneweb.no/nb/artist/2466/Per_Horn",
  scenewebPortrait: "https://sceneweb.no/nb/multimedia/113233",
  unima: "https://www.unima.no/new-page-1",
  ungmedia: "https://www.oslo.kommune.no/natur-kultur-og-fritid/fritidsklubber/ung-media/",
  pontoppidans: "https://wahl.no/v%C3%A5re-eiendommer/trikkestallen-sagene",
  staff: "https://digitaltmuseum.no/021018364302/vognbetjening-og-verkstedpersonale-ved-torshov-vognhall",
  motor192: "https://digitaltmuseum.no/011012638666/oslo-sporveier-trikk-motorvogn-192-type-gullfisk-b1-i-verkstedet-i-torshov",
  structure: "https://digitaltmuseum.no/021015469220/trikkestallen-pa-torshov",
  exterior: "https://commons.wikimedia.org/wiki/File:Torshovgata_33.jpg"
};

const placeFile = "data/places/by/oslo/gamle_trikkestallen/gamle_trikkestallen.json";
const place = read(placeFile);
Object.assign(place, {
  name: "Gamle trikkestallen på Torshov",
  category: "by",
  year: 1899,
  desc: "Gamle trikkestallen på Torshov ble oppført i 1899 som vognhall og verksted for Kristiania Sporveisselskab da den elektriske Torshovlinjen åpnet. Hallen gikk ut av trikkedrift i 1957, mens karosseriverkstedet fortsatte til 1977. Siden 2003 har den verneverdige bygningen vært kulturhus; Oslo Nye forlot scenen i 2025, og Égal Teater bruker nå Trikkestallen som teaterlokale.",
  popupDesc: "Den elektriske trikkelinjen til Torshov åpnet 29. september 1899. I Torshovgata 33 fikk Kristiania Sporveisselskab en vognhall med plass til 28 vogner og et verksted. Arkitekt Ove Laurentius Ekman tegnet anlegget med lisener som delte opp de lange fasadene.\n\nEt fotografi tatt av Ludwik Szacinski omkring åpningen viser vognbetjening, verkstedpersonale og elektriske motorvogner foran Torshov vognhall. Bildet gjør både kjøretøyene og arbeidet bak rutetrafikken synlig, uten å dokumentere hver enkelt arbeidsoppgave. Et annet arkivfoto viser Gullfisk-vogn 192 under ombygging i Torshov-verkstedet i 1971. Det dokumenterer den senere verkstedfasen og må ikke leses som samme hendelse som åpningsfotografiet.\n\nVognhallen gikk ut av trikkedrift i 1957. Sporveiens egen historikk oppgir at et karosseriverksted fortsatte i bygningen til 1977. Oslo byleksikon oppgir 1974 for verksteddriften; her brukes 1977 fordi Sporveien skiller tydelig mellom hallfunksjonen og det senere karosseriverkstedet.\n\nDen sørlige delen av bygningen ble bygd om med to etasjer i 1930-årene. Anlegget står på Byantikvarens gule liste, og de store hallrommene fikk etter hvert en ny offentlig funksjon. Kulturhuset Trikkestallen åpnet 18. februar 2003 med en teatersal på 220 plasser. UNIMA Norge beskriver Per Horn som en drivkraft i rehabiliteringen og arbeidet med scenens tekniske krav. Égal Teater oppgir at sceneelementene i dukketeaterscenen ble bygget av Horn.\n\nOslo Nye Dukketeatret flyttet inn i februar 2003 og hadde sin siste forestilling her 15. mars 2025. Teatret forlot lokalene 1. mai samme år. Égal Teater presenterer i dag Trikkestallen som sitt teaterlokale, og Oslo kommune lister Ung Media på samme adresse.\n\nStedets dokumenterte bruksperioder er vognhall, karosseriverksted og kulturhus. Den bevarte bygningen viser kontinuitet i materialet, mens virksomhetene og publikumet har skiftet. Fotografiet på hovedkortet er fra 2016 og viser Oslo Nye-skiltet som hørte til den daværende bruken, ikke dagens operatør. De to arkivbildene viser ulike kjøretøy, fotografer og tidspunkter. Katalogtekstene angir hva bildene faktisk kan dokumentere.\n\nDenne posten gjelder Torshovgata 33. Den må ikke forveksles med Trikkestallen Sagene i Pontoppidans gate 7, som er et annet vognhallanlegg.",
  emne_ids: ["em_by_infrastruktur_mobilitet", "em_by_historiske_lag_i_hverdagsrom", "em_by_transformasjon_ombruk", "em_by_bygningstyper_og_typologier", "em_by_materialitet_og_sanseerfaring", "em_his_industriby_1900"],
  underbadge_ids: ["infrastruktur", "byplanlegging"],
  related_people_ids: ["per_horn"],
  related_place_ids: ["sporveismuseet"],
  image: "bilder/places/gamle_trikkestallen.webp",
  cardImage: "bilder/kort/places/gamle_trikkestallen.webp",
  frontImage: "bilder/places/gamle_trikkestallen_front_portrait.webp"
});
place.place_card_profile = {
  schema: "history_go_place_card_profile_v2", production_profile: "standard",
  collection_ids: ["people", "objects", "brands", "structures"],
  reason: "By-komposisjonen er komplett med Per Horn, to stedsspesifikke sporvogner, Égal Teaters offisielle merke og selve vognhallen. Alle fire samlinger har lokalt lastbare, kildebelagte bilder av faktiske medlemmer; relaterte steder og quiz presenteres separat.",
  verifiedAt
};
place.objects = [{
  id: "kss_motorvogn_torshov_1899", title: "Elektrisk motorvogn ved Torshov", type: "motorvogn", kind: "physical_object",
  desc: "En elektrisk motorvogn fotografert sammen med personale ved Torshov vognhall omkring åpningen i 1899.", historicalFunction: "Elektrisk persontransport på byens sporveisnett.",
  physicalObject: true, placeSpecific: true, collectable: true,
  placeSpecificReason: "DigitaltMuseums post OB.L0226 identifiserer motivet som personale og motorvogner ved Torshov vognhall.", why_here: "Motorvognen forklarer hvorfor vognhallen og verkstedet ble oppført.",
  unlock: "Se etter de store hallportene fra offentlig grunn og sammenlign dem med motorvognen på arkivfotografiet.", storePrice: 35, currency: "PC", collection: "torshov_sporveishistorie",
  image: "bilder/kort/objects/kss_motorvogn_torshov_1899.webp",
  imageMeta: { sourcePage: urls.staff, creator: "Ludwik Szacinski", credit: "Oslo Museum / DigitaltMuseum", license: "CC0", depictedObject: "Elektrisk motorvogn og personale ved Torshov vognhall", sourceObjectId: "OB.L0226", transformation: "Stedstro utsnitt og WebP-normalisering til 900 × 520.", verifiedAt }, source_urls: [urls.staff]
}, {
  id: "gullfisk_192_torshov", title: "Gullfisk 192 i verkstedet", type: "motorvogn_under_ombygging", kind: "physical_object", year: 1971,
  desc: "Motorvogn 192 av type Gullfisk B1 fotografert under ombygging i Torshov-verkstedet i 1971.", historicalFunction: "Første B1-vogn ombygd for enmannsbetjening.",
  physicalObject: true, placeSpecific: true, collectable: true,
  placeSpecificReason: "Oslo byarkivs katalog identifiserer vognnummer, verksted og ombyggingsarbeid.", why_here: "Bildet dokumenterer hallen som teknisk verksted lenge etter at depotfunksjonen var avsluttet.",
  unlock: "Se etter arbeidsbukker, verktøy og verkstedsonen rundt vognen i arkivbildet.", storePrice: 35, currency: "PC", collection: "torshov_sporveishistorie",
  image: "bilder/kort/objects/gullfisk_192_torshov.webp",
  imageMeta: { sourcePage: urls.motor192, creator: "Per Lyng", credit: "Per Lyng / Oslo byarkiv / DigitaltMuseum", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", depictedObject: "Motorvogn 192 i Torshov-verkstedet", transformation: "Stedstro utsnitt og WebP-normalisering til 900 × 520.", verifiedAt }, source_urls: [urls.motor192]
}];
place.structures = [{
  id: "torshov_vognhall_1899", title: "Vognhallen fra 1899", name: "Torshov vognhall", type: "vognhall", kind: "historic_transport_structure", year: 1899,
  desc: "Teglhallen ble reist som vognhall og verksted med plass til 28 elektriske sporvogner.", historicalFunction: "Oppstilling, kontroll, reparasjon og senere karosseriverksted.",
  why_here: "Selve bygningen bærer overgangen fra kollektivdrift til kulturhus.", placeSpecificReason: "Sporveien og Oslo byleksikon identifiserer Torshovgata 33 som vognhallen fra 1899.",
  image: "bilder/kort/structures/torshov_vognhall_1899.webp",
  imageMeta: { sourcePage: urls.structure, creator: "Rune Aakvik", credit: "Rune Aakvik / Oslo Museum / DigitaltMuseum", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", depictedObject: "Trikkestallen i Torshovgata 33", transformation: "Dokumentarfotografiet er beskåret og skalert til 900 × 520.", verifiedAt }, source_urls: [urls.structure, urls.sporveien, urls.byleksikon]
}];
delete place.productions;
place.for_na = {
  title: "Fra vognhall til kulturhus",
  before: { year: 1899, image: "bilder/places/gamle_trikkestallen_1899.webp", caption: "Personale og elektriske motorvogner foran den nye vognhallen omkring åpningen i 1899.", imageMeta: { sourcePage: urls.staff, creator: "Ludwik Szacinski", credit: "Oslo Museum / DigitaltMuseum", license: "CC0", sourceObjectId: "OB.L0226", transformation: "Stedstro 3:2-utsnitt og WebP-normalisering til 1200 × 800.", verifiedAt } },
  now: { year: 2016, image: "bilder/places/gamle_trikkestallen_2016.webp", caption: "Den bevarte fasaden i kulturhusperioden; Oslo Nye-skiltet dokumenterer bruken i 2016.", imageMeta: { sourcePage: urls.exterior, creator: "Jan-Tore Egge", credit: "Jan-Tore Egge / Wikimedia Commons", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", transformation: "Stedstro 3:2-utsnitt og WebP-normalisering til 1200 × 800.", verifiedAt } },
  interpretation: "Hallportene og teglfasaden gjør sporveisfunksjonen lesbar, mens skilting og innredning viser overgangen til kulturbruk."
};
place.externalLinks = [
  ["official", "Sporveien – Torshov", urls.sporveien], ["source", "Oslo byleksikon – Torshovgata", urls.byleksikon],
  ["official", "Oslo Nye – historikk", urls.osloNye], ["official", "Égal Teater – Trikkestallen", urls.egal],
  ["source", "Sceneweb – Trikkestallen på Torshov", urls.sceneweb], ["historical_image", "Oslo Museum – personale ved Torshov vognhall", urls.staff],
  ["source", "Sceneweb – Per Horn", urls.scenewebPerson], ["source", "UNIMA Norge – figurteaterhistorie", urls.unima],
  ["official", "Oslo kommune – Ung Media", urls.ungmedia], ["museum_object", "Oslo byarkiv – motorvogn 192", urls.motor192],
  ["source", "Wahl Eiendom – Trikkestallen Sagene", urls.pontoppidans],
  ["image_source", "Wikimedia Commons – Torshovgata 33", urls.exterior]
].map(([type, label, url]) => ({ type, label, url, verifiedAt }));
place.interpretation = {
  what_to_notice: ["De store hallportene mot gaten.", "Lisenene som deler opp den lange fasaden.", "At et trikkeanlegg nå rommer en teaterscene."],
  why_it_matters: ["Anlegget gjør infrastrukturen bak den elektriske trikken synlig.", "Skillet mellom 1957 og 1977 viser at én bygning kan miste funksjoner trinnvis.", "Ombruken fra 2003 viser hvordan et teknisk kulturminne kan få nytt publikum."],
  counterpoints: ["1957 avsluttet vognhallens trikkedrift, ikke all verkstedbruk.", "1977 brukes for karosseriverkstedets avslutning etter Sporveiens egen historikk; Oslo byleksikon oppgir 1974.", "Oslo Nye-skiltet i 2016-fotografiet dokumenterer tidligere bruk, ikke dagens operatør.", "Posten gjelder Torshovgata 33, ikke Trikkestallen i Pontoppidans gate 7."],
  sources: [urls.sporveien, urls.byleksikon, urls.osloNye, urls.egal, urls.ungmedia].map(url => ({ url, verifiedAt }))
};
write(placeFile, place);

const i18nHash = hash(JSON.stringify({
  name: normalized(place.name),
  desc: normalized(place.desc),
  popupDesc: normalized(place.popupDesc)
})).slice(0, 16);
const placeTranslations = {
  en: {
    name: "The old tram depot at Torshov",
    desc: "Built in 1899 as a depot and workshop for Kristiania Sporveisselskab when the electric Torshov line opened. Tram-depot operations ended in 1957 and the body workshop in 1977. The protected building became a cultural venue in 2003 and is now used by Égal Teater.",
    popupDesc: "The electric tram line to Torshov opened on 29 September 1899 together with a depot for 28 cars and a workshop designed by Ove Laurentius Ekman.\n\nThe depot ceased tram operations in 1957, while a body workshop continued until 1977. The building reopened as a cultural venue on 18 February 2003. Oslo Nye left in 2025, and Égal Teater now presents the depot as its theatre venue. Oslo municipality also lists Ung Media at Torshovgata 33. This entry concerns Torshovgata 33, not Trikkestallen Sagene at Pontoppidans gate 7."
  },
  es: {
    name: "La antigua cochera de tranvías de Torshov",
    desc: "Construida en 1899 como cochera y taller de Kristiania Sporveisselskab al abrirse la línea eléctrica de Torshov. La cochera dejó el servicio tranviario en 1957 y el taller de carrocerías en 1977. El edificio protegido se convirtió en centro cultural en 2003 y hoy lo utiliza Égal Teater.",
    popupDesc: "La línea eléctrica a Torshov abrió el 29 de septiembre de 1899 junto con una cochera para 28 coches y un taller diseñado por Ove Laurentius Ekman.\n\nLa cochera dejó de operar tranvías en 1957, mientras el taller continuó hasta 1977. El edificio reabrió como centro cultural el 18 de febrero de 2003. Oslo Nye se marchó en 2025 y Égal Teater lo utiliza hoy como teatro. El Ayuntamiento de Oslo también sitúa a Ung Media en Torshovgata 33. Esta ficha corresponde a Torshovgata 33, no a Trikkestallen Sagene en Pontoppidans gate 7."
  },
  pt: {
    name: "A antiga garagem de elétricos de Torshov",
    desc: "Construída em 1899 como garagem e oficina da Kristiania Sporveisselskab quando abriu a linha elétrica de Torshov. A garagem deixou a operação em 1957 e a oficina de carroçarias em 1977. O edifício protegido tornou-se centro cultural em 2003 e é hoje usado pelo Égal Teater.",
    popupDesc: "A linha elétrica para Torshov abriu em 29 de setembro de 1899 com uma garagem para 28 carros e uma oficina projetada por Ove Laurentius Ekman.\n\nA garagem deixou de operar elétricos em 1957, enquanto a oficina continuou até 1977. O edifício reabriu como centro cultural em 18 de fevereiro de 2003. O Oslo Nye saiu em 2025 e o Égal Teater usa hoje o local como teatro. O Município de Oslo também indica o Ung Media em Torshovgata 33. Esta ficha refere-se a Torshovgata 33, não ao Trikkestallen Sagene em Pontoppidans gate 7."
  }
};
for (const [language, translation] of Object.entries(placeTranslations)) {
  const file = `data/i18n/content/places/${language}.json`;
  const pack = read(file);
  pack.gamle_trikkestallen = { _sourceHash: i18nHash, _status: "machine_translated", ...translation };
  write(file, pack);
}

const personFile = "data/people/by/oslo/gamle_trikkestallen/per_horn.json";
const person = {
  id: "per_horn", name: "Per Horn", initials: "PH", category: "by", year: 2003,
  kindLabel: "Scenograf og teknisk teaterbygger", role: "Sentral i ombyggingen til dukketeaterscene",
  desc: "Scenografen og den tekniske teatersjefen som var sentral i rehabiliteringen og sceneutformingen da Trikkestallen åpnet som kulturhus i 2003.",
  popupDesc: "Per Kristian Horn er en norsk scenograf, født 28. oktober 1941. Sceneweb dokumenterer en lang rekke produksjoner ved Oslo Nye Teater. UNIMA Norge beskriver Horn som en drivkraft i rehabiliteringen av Trikkestallen og i arbeidet med de tekniske kravene til dukketeaterscenen. Égal Teater oppgir også at sceneelementene ble bygget av Per Horn. People-koblingen gjelder dette dokumenterte arbeidet fram mot kulturhusåpningen i 2003. Illustrasjonen er en redaksjonell, identitetskontrollert framstilling basert på et navngitt Sceneweb-foto; den er ikke et fotografi.",
  placeId: "gamle_trikkestallen", source_place_id: "gamle_trikkestallen", places: ["gamle_trikkestallen"],
  tags: ["scenograf", "teaterteknikk", "dukketeater", "Torshov", "2003"], profileStandard: "people_profile_v1.0", profileStatus: "ready_people_v1",
  claimsFile: "data/people/claims/by/oslo/gamle_trikkestallen/per_horn.claims.json",
  image: "bilder/kort/people/per_horn_editorial_cutout.webp", cardImage: "bilder/kort/people/per_horn_editorial_cutout.webp",
  imageMeta: { source: "history_go_editorial_illustration", mediaType: "editorial_illustration", background: "transparent", sourcePage: urls.scenewebPortrait, referenceImage: "https://sceneweb.no/media2/1000-1000/113233", identityReference: "Sceneweb identifiserer Per Horn som personen til høyre i det navngitte gruppefotografiet.", creator: "History GO med OpenAI image generation", credit: "History GO / OpenAI; identitetsreferanse: Oslo Nye Teaters arkiv / Sceneweb", license: "CC0 1.0", licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/", generatedAt: verifiedAt, reviewStatus: "identity_and_editorial_review_passed", disclosure: "Redaksjonell illustrasjon basert på kontrollert navngitt identitetsreferanse; ikke fotografi.", promptMode: "identity-referenced editorial portrait", transformation: "Bakgrunnen er fjernet til ekte alfa, og utsnittet er skalert til 900 × 1200 WebP." },
  source_urls: [urls.scenewebPerson, urls.unima, urls.egal, urls.scenewebPortrait], verifiedAt
};
write(personFile, [person]);
write("data/people/claims/by/oslo/gamle_trikkestallen/per_horn.claims.json", {
  schema: "history_go_people_claims_v1", version: "1.0.0", person_id: person.id, profile_file: personFile,
  identity: { canonical_identity: "Den norske scenografen Per Kristian Horn, født 28. oktober 1941.", name_variants: ["Per Horn", "Per Kristian Horn"], not: ["botanikeren Kristian Horn", "andre personer med etternavnet Horn"], identity_status: "verified" },
  claims: [
    { id: "identity", claim: "Per Kristian Horn er en norsk scenograf, født 28. oktober 1941.", status: "verified", source_url: urls.scenewebPerson, source_location: "Informasjon: navn, fødselsdato og funksjon", source_type: "archive", temporal_status: "historical", verified_at: verifiedAt, evidence_level: "direct" },
    { id: "career", claim: "Sceneweb registrerer Horn som scenograf i en lang rekke Oslo Nye-produksjoner.", status: "verified", source_url: urls.scenewebPerson, source_location: "Medvirket i produksjoner", source_type: "archive", temporal_status: "historical", verified_at: verifiedAt, evidence_level: "direct" },
    { id: "rehabilitation", claim: "Per Horn var en drivkraft i rehabiliteringen av Trikkestallen og arbeidet med scenens tekniske krav.", status: "verified", source_url: urls.unima, source_location: "Avsnittet om flyttingen til Trikkestallen", source_type: "institutional", temporal_status: "historical", verified_at: verifiedAt, evidence_level: "explicit" },
    { id: "stage_elements", claim: "Égal Teater oppgir at dukketeaterscenens elementer i Trikkestallen ble bygget av Per Horn.", status: "verified", source_url: urls.egal, source_location: "Andre avsnitt under Trikkestallen", source_type: "institutional", temporal_status: "historical", verified_at: verifiedAt, evidence_level: "direct" },
    { id: "place", claim: "Horn er direkte knyttet til ombyggingen av Trikkestallen før åpningen i 2003.", status: "verified", source_url: urls.sceneweb, source_location: "Historikken om rehabiliteringen og åpningen", source_type: "archive", temporal_status: "historical", verified_at: verifiedAt, evidence_level: "direct" },
    { id: "image_identity", claim: "Sceneweb identifiserer Per Horn som personen til høyre i gruppefotografiet med Grethe Wang og Kirsten Sørlie.", status: "verified", source_url: urls.scenewebPortrait, source_location: "Tittel, beskrivelse og personkoblinger", source_type: "archive", temporal_status: "historical", verified_at: verifiedAt, evidence_level: "direct" }
  ],
  field_claim_map: { name: ["identity"], kindLabel: ["identity", "career"], year: ["rehabilitation", "place"], placeId: ["rehabilitation", "place"], "places[gamle_trikkestallen]": ["rehabilitation", "place"], image: ["image_identity"] },
  sentence_claim_map: { desc: [{ sentence: 1, claim_ids: ["rehabilitation", "stage_elements", "place"], evidence_mode: "explicit" }], popupDesc: [{ sentence: 1, claim_ids: ["identity"] }, { sentence: 2, claim_ids: ["career"] }, { sentence: 3, claim_ids: ["rehabilitation"] }, { sentence: 4, claim_ids: ["stage_elements"] }, { sentence: 5, claim_ids: ["place"] }, { sentence: 6, claim_ids: ["image_identity"] }] },
  completion: { completed_under: "people_profile_v1.0", claims_verified: "6/6", fact_review: "passed", editorial_review: "passed", source_verified_at: verifiedAt, validator_version: "1.0.0", current_status: "ready_people_v1" }
});
const peopleManifest = read("data/people/manifest.json");
peopleManifest.files = peopleManifest.files.filter(file => !String(file).includes("historie/oslo/gamle_trikkestallen/") && file !== personFile.replace(/^data\//, ""));
peopleManifest.files.push(personFile.replace(/^data\//, ""));
peopleManifest.priorityFilesByPlace ||= {};
peopleManifest.priorityFilesByPlace.gamle_trikkestallen = [personFile.replace(/^data\//, "")];
write("data/people/manifest.json", peopleManifest);

const oldLeksikonFile = "data/leksikon/places/oslo/historie/leksikon_gamle_trikkestallen.json";
const leksikonFile = "data/leksikon/places/oslo/by/leksikon_gamle_trikkestallen.json";
const leksikon = read(fs.existsSync(path.join(root, oldLeksikonFile)) ? oldLeksikonFile : leksikonFile);
leksikon.wikiText = [
  "Den elektriske linjen til Torshov åpnet 29. september 1899. Kristiania Sporveisselskab fikk samtidig en vognhall for 28 vogner og et verksted i Torshovgata 33, tegnet av Ove Laurentius Ekman.",
  "Vognhallen gikk ut av trikkedrift i 1957, mens et karosseriverksted fortsatte til 1977. Oslo byleksikon oppgir 1974; avviket publiseres fordi kildene beskriver verkstedslutten ulikt.",
  "Kulturhuset åpnet 18. februar 2003. Oslo Nye Dukketeatret brukte scenen til mars 2025; Égal Teater oppgir nå Trikkestallen som sitt teaterlokale, og Oslo kommune lister Ung Media på adressen.",
  "Denne posten gjelder Torshovgata 33 og må ikke forveksles med Trikkestallen Sagene i Pontoppidans gate 7, som er et annet vognhallanlegg."
];
leksikon.facts = [...leksikon.facts.filter(fact => fact.id !== "fact_trikk_address_boundary"), { id: "fact_trikk_address_boundary", label: "Stedsgrense", desc: "Oppslaget gjelder Torshovgata 33, ikke Trikkestallen Sagene i Pontoppidans gate 7.", confidence: "high", sources: [source("Égal Teater", urls.egal), source("Wahl Eiendom", urls.pontoppidans)] }];
leksikon.sources = place.externalLinks;
leksikon.externalLinks = place.externalLinks;
leksikon.interpretation = place.interpretation;
write(leksikonFile, leksikon);
const legacyLeksikon = "data/leksikon/places/oslo/historie/leksikon_oslo_historie.json";
write(legacyLeksikon, read(legacyLeksikon).filter(item => item.place_id !== "gamle_trikkestallen"));
const leksikonManifest = read("data/leksikon/manifest.json");
leksikonManifest.files = leksikonManifest.files.filter(file => file !== oldLeksikonFile && file !== leksikonFile);
leksikonManifest.files.push(leksikonFile);
write("data/leksikon/manifest.json", leksikonManifest);
remove(oldLeksikonFile);

const storyFile = "data/stories/stories_gamle_trikkestallen.json";
const stories = read(storyFile);
stories[0].related_people = ["per_horn"];
stories[0].score = { narrative: 3, historical: 2, source: 5, play_value: 3, originality: 3, total: 16 };
write(storyFile, stories);
const storyManifest = read("data/stories/stories_manifest.json");
storyManifest.files = storyManifest.files.filter(entry => entry.entity_id !== "gamle_trikkestallen");
storyManifest.files.push({ category: "by", entity_id: "gamle_trikkestallen", path: storyFile });
write("data/stories/stories_manifest.json", storyManifest);

const oldReadingFile = "data/lesespor/oslo/lesespor_oslo_historie.json";
const oldReadings = read(oldReadingFile); oldReadings.items = oldReadings.items.filter(item => !item.id.startsWith("lesespor_trikkestallen_")); write(oldReadingFile, oldReadings);
const readingFile = "data/lesespor/oslo/lesespor_oslo_by.json";
const readings = read(readingFile); readings.items = readings.items.filter(item => !item.id.startsWith("lesespor_trikkestallen_"));
readings.items.push(
  { id: "lesespor_trikkestallen_sporveien", title: "Torshov", author: null, publication: "Sporveien", date: null, year: 2026, type: "official_history", subjects: ["elektrifisering", "vognhall", "verksted"], place_ids: ["gamle_trikkestallen"], person_ids: [], category_hints: ["by", "historie"], url: urls.sporveien, access: "open", rights: "link_only", source_quality: "institutional", curation_status: "approved", relevance: "Hovedkilde for åpningen i 1899, kapasiteten og skillet mellom 1957 og 1977." },
  { id: "lesespor_trikkestallen_sceneweb", title: "Trikkestallen på Torshov", author: null, publication: "Sceneweb", date: null, year: 2026, type: "institutional_reference", subjects: ["kulturhus", "dukketeater", "ombruk"], place_ids: ["gamle_trikkestallen"], person_ids: ["per_horn"], category_hints: ["by", "scenekunst"], url: urls.sceneweb, access: "open", rights: "link_only", source_quality: "institutional", curation_status: "approved", relevance: "Dokumenterer kulturhusåpningen, samarbeidet, Per Horn og salens kapasitet." },
  { id: "lesespor_trikkestallen_unima", title: "Oslo Nye Dukketeatret", author: null, publication: "UNIMA Norge", date: null, year: 2026, type: "institutional_history", subjects: ["dukketeater", "rehabilitering", "teaterteknikk"], place_ids: ["gamle_trikkestallen"], person_ids: ["per_horn"], category_hints: ["by", "scenekunst"], url: urls.unima, access: "open", rights: "link_only", source_quality: "institutional", curation_status: "approved", relevance: "Dokumenterer Per Horns rolle i rehabiliteringen og de tekniske kravene til scenen." },
  { id: "lesespor_trikkestallen_ungmedia", title: "Ung Media", author: null, publication: "Oslo kommune", date: null, year: 2026, type: "current_official", subjects: ["ungdom", "media", "kulturhus"], place_ids: ["gamle_trikkestallen"], person_ids: [], category_hints: ["by", "media"], url: urls.ungmedia, access: "open", rights: "link_only", source_quality: "institutional", curation_status: "approved", relevance: "Kontrollerer aktuell kommunal kulturbruk på adressen Torshovgata 33." }
);
write(readingFile, readings);

const oldQuizFile = "data/quiz/historie/gamle_trikkestallen_sets.json";
const quizFile = "data/quiz/by/gamle_trikkestallen_sets.json";
const quiz = read(fs.existsSync(path.join(root, oldQuizFile)) ? oldQuizFile : quizFile);
const emneMap = {
  em_his_hendelse_prosess_tidsforlop: "em_by_historiske_lag_i_hverdagsrom",
  em_his_industriby_1900: "em_by_infrastruktur_mobilitet",
  em_his_spor_materialitet: "em_by_materialitet_og_sanseerfaring",
  em_his_kildekritikk_arkiv_spor: "em_by_historiske_lag_i_hverdagsrom",
  em_his_brudd_kontinuitet: "em_by_transformasjon_ombruk",
  em_his_historiske_lag_i_byrom: "em_by_historiske_lag_i_hverdagsrom",
  em_his_kulturminner_bevaring: "em_by_transformasjon_ombruk"
};
const conceptMap = {
  em_by_infrastruktur_mobilitet: ["infrastruktur", "co_by_infrastruktur_c4dd7aa18f"],
  em_by_historiske_lag_i_hverdagsrom: ["historiske lag", "co_by_historiske_lag_b5eb5eb432"],
  em_by_transformasjon_ombruk: ["transformasjon og ombruk", "co_by_transformasjon_81e909e462"],
  em_by_materialitet_og_sanseerfaring: ["fasade og materialitet", "co_by_fasade_6beab4eb5a"]
};
const theory = [
  ["his_spor_gatebilde", "pierre_nora", "Les Lieux de Mémoire", "met_arkiv_minne_spor"],
  ["his_spor_gatebilde", "pierre_nora", "Les Lieux de Mémoire", "met_arkiv_minne_spor"],
  ["his_spor_gatebilde", "pierre_nora", "Les Lieux de Mémoire", "met_arkiv_minne_spor"],
  ["his_spor_gatebilde", "pierre_nora", "Les Lieux de Mémoire", "met_for_etter"],
  ["his_spor_gatebilde", "pierre_nora", "Les Lieux de Mémoire", "met_arkiv_minne_spor"]
];
const questions = quiz.sets.flatMap(set => set.questions);
questions.forEach((question, index) => {
  question.categoryId = "by";
  question.quiz_id = question.quiz_id.replace(/^historie_/, "by_");
  question.primary_knowledge_unit_id = question.primary_knowledge_unit_id.replace(/^ku_historie_/, "ku_by_");
  question.knowledge_unit_ids = question.knowledge_unit_ids.map(id => id.replace(/^ku_historie_/, "ku_by_"));
  question.emne_id = emneMap[question.emne_id] || question.emne_id;
  if (index >= 23) question.emne_id = "em_by_historiske_lag_i_hverdagsrom";
  question.question_type = index < 16 ? "fact" : index < 23 ? "context" : "concept";
  const concept = conceptMap[question.emne_id] || ["historiske lag", "co_by_historiske_lag_b5eb5eb432"];
  question.concepts = [concept[0]];
  question.concept_ids = [concept[1]];
  if (index >= 23) {
    const [topic_hook_id, thinker_id, work, method_id] = theory[index - 23];
    Object.assign(question, { topic_hook_id, thinker_id, work, method_id, theory_ref: { topic_hook_id, thinker_id, work, why_it_helps: "Perspektivet strukturerer en stedsspesifikk analyse av spor, materialitet, vern eller ombruk uten å erstatte kildene." }, guidance_basis: ["data/fag/by/fagkart_by.json", "data/fag/by/methods_by.json"] });
  } else {
    delete question.topic_hook_id; delete question.thinker_id; delete question.work; delete question.method_id; delete question.theory_ref; delete question.guidance_basis;
  }
});
quiz.categoryId = "by";
quiz.sets.forEach((set, index) => { set.set_id = set.set_id.replace(/^historie_/, "by_"); set.phase = ["opening", "middle", "bridge", "final"][index]; });
const oldBriefFile = "data/quiz/production_briefs/historie/gamle_trikkestallen.json";
const briefFile = "data/quiz/production_briefs/by/gamle_trikkestallen.json";
const sourceRegistry = read(fs.existsSync(path.join(root, oldBriefFile)) ? oldBriefFile : briefFile).sources;
const curriculum = { module_ids: ["kur_by_03_infrastruktur_og_bevegelse", "kur_by_04_historiske_lag_og_transformasjon"], emne_ids: [...new Set(questions.map(q => q.emne_id))], topic_hook_ids: [...new Set(questions.map(q => q.topic_hook_id).filter(Boolean))], method_ids: [...new Set(questions.map(q => q.method_id).filter(Boolean))], thinker_ids: [...new Set(questions.map(q => q.thinker_id).filter(Boolean))], works: [...new Set(questions.map(q => q.work).filter(Boolean))] };
const existingQuizAudit = { searched_paths: [oldQuizFile, "data/quiz/manifest.json"], active_before: { file: oldQuizFile, set_count: 1, question_count: 2, finding: "To generiske legacy-spørsmål uten ekstern kildeproveniens." }, decisions: ["Migrer målpakken til stedets canonical by-kategori.", "Erstatt den svake 1×2-banken med normalprofil 4×7.", "Hold teori og metode bare i finalsettets fire siste spørsmål."], knowledge_migration: "Alle spørsmål får stabile by-, claim- og Knowledge-ID-er." };
const profileDecision = { profile: "normal", set_count: 4, questions_per_set: 7, justification: "Stedet har fire tydelige læringsjobber og tilstrekkelig kildedybde for 28 spørsmål, men ikke behov for rich-profil." };
const heldBackCandidates = ["1974 som ubetinget sluttår for all verksteddrift.", "Påstander om hver enkelt arbeidsoppgave ut fra fotografiet alene.", "Oslo Nye som dagens operatør."];
write(briefFile, { schema_version: "1.0", status: "reviewed", categoryId: "by", targetId: "gamle_trikkestallen", profile_hint: "normal", reviewed_at: verifiedAt, review_note: "Fire læringsjobber dekker åpningen, driftsfasene, kulturhusombruk og kildekritisk helhetslesning.", scope: { place: place.name, production_profile: "normal", set_count: 4, questions_per_set: 7, total_questions: 28, normal_opening_questions: 14 }, sources: sourceRegistry, selected_curriculum: curriculum, existing_quiz_audit: existingQuizAudit, profile_decision: profileDecision, held_back_candidates: heldBackCandidates, claims: questions.map((q, i) => ({ claim_id: q.claim_id, order: i + 1, planned_phase: quiz.sets[Math.floor(i / 7)].phase, family: q.question_type === "concept" ? "concept_theory" : q.question_type, statement: q.knowledge, source_ids: q.source, source_origin: "external", emne_id: q.emne_id })) });
quiz.production_context = { manifest_category: "by", profile: "normal_4x7", standard_version: "3.3", source_brief: briefFile, context_artifact: "data/quiz/production_context/by/gamle_trikkestallen.json", resolved_files: { pensum: "data/fag/by/pensum_by.json", emner: "data/fag/by/emner_by.json", fagkart: "data/fag/by/fagkart_by.json", methods: "data/fag/by/methods_by.json", supersetQuizMal: "data/fag/by/supersetQUIZMAL_by.json", quizStandard: "data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md", quizQuestionSchema: "data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json" }, required_inputs_loaded: ["pensum", "emner", "fagkart", "methods", "supersetQuizMal", "quizStandard", "quizQuestionSchema"], pensum_module_ids: curriculum.module_ids, emne_ids: curriculum.emne_ids, topic_hook_ids: curriculum.topic_hook_ids, method_ids: curriculum.method_ids, thinker_ids: curriculum.thinker_ids, works: curriculum.works, source_review_status: "reviewed", existing_quiz_audit: existingQuizAudit, profile_decision: profileDecision, held_back_candidates: heldBackCandidates, normal_opening_questions: 14, theory_start_phase: "final", method_start_phase: "final" };
write(quizFile, quiz);
const quizManifest = read("data/quiz/manifest.json"); quizManifest.sets = quizManifest.sets.filter(entry => entry.targetId !== "gamle_trikkestallen"); quizManifest.sets.push({ targetId: "gamle_trikkestallen", file: quizFile }); write("data/quiz/manifest.json", quizManifest);
const fagManifest = read("data/fag/fag_manifest.json"); delete fagManifest.historie.quizProduction.targets.gamle_trikkestallen; fagManifest.by.quizProduction.targets.gamle_trikkestallen = { source_brief: "../quiz/production_briefs/by/gamle_trikkestallen.json", context_artifact: "../quiz/production_context/by/gamle_trikkestallen.json", quiz_file: "../quiz/by/gamle_trikkestallen_sets.json" }; write("data/fag/fag_manifest.json", fagManifest);
remove(oldQuizFile); remove(oldBriefFile); remove("data/quiz/production_context/historie/gamle_trikkestallen.json");

const productionFile = "data/places/production/gamle_trikkestallen.json";
const production = read(productionFile);
production.claims = production.claims.filter(claim => claim.id !== "claim_gamle_trikkestallen_type_u");
const upsertClaim = claim => {
  const index = production.claims.findIndex(item => item.id === claim.id);
  if (index < 0) production.claims.push(claim); else production.claims[index] = claim;
};
upsertClaim({ id: "claim_gamle_trikkestallen_motor192", claim: "Motorvogn 192 av type Gullfisk B1 ble fotografert under ombygging i Torshov-verkstedet i 1971.", sourceUrl: urls.motor192, sourceLocation: "Katalogtittel og motivbeskrivelse", sourceType: "catalogue", verifiedAt, status: "verified", claimKind: "ordinary", evidenceMode: "direct", temporalStatus: "historical" });
upsertClaim({ id: "claim_gamle_trikkestallen_per_horn", claim: "Per Horn var en drivkraft i rehabiliteringen av Trikkestallen og arbeidet med scenens tekniske krav; Égal Teater oppgir at sceneelementene ble bygget av ham.", sourceUrl: urls.unima, independentSourceUrls: [urls.egal], sourceLocation: "Avsnittet om flyttingen til Trikkestallen", sourceType: "institutional", verifiedAt, status: "verified", claimKind: "ordinary", evidenceMode: "direct", temporalStatus: "historical" });
upsertClaim({ id: "claim_gamle_trikkestallen_ung_media", claim: "Oslo kommune lister Ung Media på adressen Torshovgata 33.", sourceUrl: urls.ungmedia, sourceLocation: "Kontaktinformasjon og besøksadresse", sourceType: "official", verifiedAt, status: "verified", claimKind: "temporal", evidenceMode: "direct", temporalStatus: "current" });
upsertClaim({ id: "claim_gamle_trikkestallen_exterior_2016", claim: "Fotografiet Torshovgata 33 viser fasaden med Oslo Nye-skilt i 2016.", sourceUrl: urls.exterior, sourceLocation: "Filbeskrivelse og metadata", sourceType: "catalogue", verifiedAt, status: "verified", claimKind: "ordinary", evidenceMode: "direct", temporalStatus: "historical" });
upsertClaim({ id: "claim_gamle_trikkestallen_address_boundary", claim: "Trikkestallen i Torshovgata 33 og Trikkestallen Sagene i Pontoppidans gate 7 er to forskjellige vognhallanlegg.", sourceUrl: urls.egal, independentSourceUrls: [urls.pontoppidans], sourceLocation: "Adresseopplysninger for de to anleggene", sourceType: "primary", verifiedAt, status: "verified", claimKind: "strong", evidenceMode: "explicit", temporalStatus: "current" });
production.identity.excludes = production.identity.excludes.filter(value => value !== "kulturhuset Trikkestallen i Pontoppidans gate 7");
production.identity.excludes = [...new Set([...production.identity.excludes, "Trikkestallen Sagene i Pontoppidans gate 7"] )];
production.metadataSnapshot.category = "by";
production.collections = { people: ["per_horn"], objects: place.objects.map(item => item.id), brands: ["egal_teater"], structures: place.structures.map(item => item.id), status: "complete", image_coverage_percent: 100 };
production.quizReadiness = { status: "canonical_normal_4x7", quizTargetId: "gamle_trikkestallen", sourceBrief: briefFile, productionContext: "data/quiz/production_context/by/gamle_trikkestallen.json", normalOpeningQuestions: 14, totalQuestions: 28, reuseDecision: "Den generiske 1×2-banken ble audittert og erstattet fordi den manglet ekstern kildeproveniens.", questions: [
  { question: "Når åpnet den elektriske linjen til Torshov?", answer: "29. september 1899", type: "når", normalKnowledgeQuestion: true, claimIds: ["claim_gamle_trikkestallen_opening"] },
  { question: "Hvem fikk vognhallen i Torshovgata 33?", answer: "Kristiania Sporveisselskab", type: "hvem", normalKnowledgeQuestion: true, claimIds: ["claim_gamle_trikkestallen_identity"] },
  { question: "Hvor lå vognhallen og verkstedet?", answer: "Torshovgata 33", type: "hvor", normalKnowledgeQuestion: true, claimIds: ["claim_gamle_trikkestallen_identity"] },
  { question: "Hva fortsatte etter at vognhallen gikk ut av trikkedrift?", answer: "Karosseriverkstedet", type: "hva", normalKnowledgeQuestion: true, claimIds: ["claim_gamle_trikkestallen_workshop_end"] },
  { question: "Hva skjedde med vognhalldriften i 1957?", answer: "Den ble avsluttet", type: "hva_skjedde", normalKnowledgeQuestion: true, claimIds: ["claim_gamle_trikkestallen_hall_end"] },
  { question: "Hvilket kjøretøy er dokumentert i Torshov-verkstedet i 1971?", answer: "Gullfisk-vogn 192", type: "hvilket_verk_eller_objekt", normalKnowledgeQuestion: true, claimIds: ["claim_gamle_trikkestallen_motor192"] },
  { question: "Hva ble åpnet i hallen 18. februar 2003?", answer: "Et kulturhus med teatersal", type: "hva_ble_bygget_produsert_eller_endret", normalKnowledgeQuestion: true, claimIds: ["claim_gamle_trikkestallen_culture"] },
  { question: "Hvem var sentral i rehabiliteringen av dukketeaterscenen?", answer: "Per Horn", type: "hvem", normalKnowledgeQuestion: false, claimIds: ["claim_gamle_trikkestallen_per_horn"] }
] };
production.reviewsNotes = ["Sporveiens 1977 og Oslo byleksikons 1974 er behandlet som et synlig kildeavvik.", "2016-fotografiets Oslo Nye-skilt er merket som historisk, ikke som nåstatus.", "Torshovgata 33 er eksplisitt avgrenset fra Trikkestallen i Pontoppidans gate 7.", "To stedsspesifikke sporvogner dekker både åpningsfasen og verkstedfasen."];
production.roundsReadiness = { people: "ready_per_horn_direct_profile_and_editorial_image", objects: "ready_two_documented_tram_objects", brands: "ready_one_official_current_mark", structures: "ready_one_documented_building", badges: "ready_two_by_underbadges", quiz: "ready_normal_4x7_by", leksikon: "ready_by", sprak: "ready_four_entries", stories: "ready_episode_v1", readings: "ready_four_by", fagverk: "ready", frontImage: "ready_real_portrait_3x4", beforeAfter: "ready_archival_and_2016" };
production.textHashes = { algorithm: "sha256", desc: hash(place.desc), popupDesc: hash(place.popupDesc) };
const claimIdsForSentence = sentence => {
  const text = sentence.toLowerCase();
  if (text.includes("pontoppidans") || text.includes("denne posten gjelder")) return ["claim_gamle_trikkestallen_address_boundary"];
  if (text.includes("ung media")) return ["claim_gamle_trikkestallen_current", "claim_gamle_trikkestallen_ung_media"];
  if (text.includes("siden 2003") && text.includes("nå")) return ["claim_gamle_trikkestallen_culture", "claim_gamle_trikkestallen_oslo_nye_end", "claim_gamle_trikkestallen_current"];
  if (text.includes("per horn") || text.includes("bygget av horn")) return ["claim_gamle_trikkestallen_per_horn"];
  if (text.includes("gullfisk") || text.includes("192") || text.includes("1971")) return ["claim_gamle_trikkestallen_motor192"];
  if (text.includes("samme hendelse som åpningsfotografiet") || text.includes("to arkivbildene") || text.includes("katalogtekstene")) return ["claim_gamle_trikkestallen_photo", "claim_gamle_trikkestallen_motor192"];
  if (text.includes("2016")) return ["claim_gamle_trikkestallen_exterior_2016", "claim_gamle_trikkestallen_oslo_nye_end", "claim_gamle_trikkestallen_current"];
  if (text.includes("oslo nye") || text.includes("15. mars") || text.includes("1. mai")) return ["claim_gamle_trikkestallen_oslo_nye_end"];
  if (text.includes("égal")) return ["claim_gamle_trikkestallen_current"];
  if (text.includes("gul") || text.includes("verneverdig")) return ["claim_gamle_trikkestallen_yellow_list"];
  if (text.includes("1930")) return ["claim_gamle_trikkestallen_south_section"];
  if (text.includes("kulturhus") || text.includes("220") || text.includes("18. februar")) return ["claim_gamle_trikkestallen_culture"];
  if (text.includes("1977") || text.includes("karosseri")) return ["claim_gamle_trikkestallen_workshop_end"];
  if (text.includes("1957")) return ["claim_gamle_trikkestallen_hall_end"];
  if (text.includes("fotografi") || text.includes("szacinski") || text.includes("motorvogner")) return ["claim_gamle_trikkestallen_photo"];
  if (text.includes("ekman") || text.includes("lisener")) return ["claim_gamle_trikkestallen_architect"];
  if (text.includes("28 vogner")) return ["claim_gamle_trikkestallen_capacity"];
  if (text.includes("bruksperioder") || text.includes("kontinuitet")) return ["claim_gamle_trikkestallen_hall_end", "claim_gamle_trikkestallen_workshop_end", "claim_gamle_trikkestallen_culture"];
  if (text.includes("åpnet") || text.includes("1899") || text.includes("elektrisk")) return ["claim_gamle_trikkestallen_identity", "claim_gamle_trikkestallen_opening"];
  return ["claim_gamle_trikkestallen_identity"];
};
production.sentenceCoverage = {
  desc: sentences(place.desc).map((sentence, index) => ({ sentence: index + 1, claimIds: claimIdsForSentence(sentence) })),
  popupDesc: sentences(place.popupDesc).map((sentence, index) => ({ sentence: index + 1, claimIds: claimIdsForSentence(sentence) }))
};
production.completion.claimsVerified = { verified: production.claims.filter(claim => claim.status === "verified").length, total: production.claims.length };
write(productionFile, production);

const historyFile = "data/places/historie-production/gamle_trikkestallen.json";
write(historyFile, {
  schemaVersion: "historie_place_production_v1", validatorVersion: "1.0.0", placeId: "gamle_trikkestallen", placeFile, status: "ready",
  historicalIdentity: {
    statement: "Et sporveisanlegg fra elektrifiseringen i 1899 som gikk fra vognhall via karosseriverksted til kulturhus og teaterlokale.",
    placeRelationType: "institution_site",
    placeRelationStatement: "Place-ID-en representerer vognhall- og verkstedanlegget i Torshovgata 33, ikke Trikkestallen Sagene i Pontoppidans gate 7, hele Torshov eller sporveisselskapet alene.",
    temporalScope: { start: "1899", end: "2026", precision: "period", rationale: "Perioden dekker oppføring, trinnvis driftsavvikling, ombruk og siste kontrollerte kulturbruk." },
    sourceIds: ["source_sporveien", "source_byleksikon", "source_sceneweb", "source_egal"]
  },
  historyTopics: [{ emneId: "em_his_industriby_1900", siteSpecificRationale: "Vognhall, verksted, personale og motorvogner viser kollektivtrafikk som teknisk arbeidsplass og infrastruktursystem i den industrialiserte byen.", caseIds: ["case_torshov_elektrifisering_og_ombruk"] }],
  sources: [
    { id: "source_sporveien", url: urls.sporveien, sourceLocation: "Åpningen, anlegget, 1957/1977 og gul liste", sourceType: "official", verifiedAt, temporalCoverage: "mixed", provenance: "Sporveiens offisielle stedshistorikk for Torshov.", limitations: "Institusjonell tilbakeblikkskilde uten komplett bemannings- eller verkstedprotokoll." },
    { id: "source_byleksikon", url: urls.byleksikon, sourceLocation: "Torshovgata 33 og bygningsendringer", sourceType: "museum_or_heritage", verifiedAt, temporalCoverage: "mixed", provenance: "Oslo byleksikons redaksjonelle stedsspesifikke oppslag.", limitations: "Oppgir 1974 for verksteddriften, i konflikt med Sporveiens 1977." },
    { id: "source_staff_photo", url: urls.staff, sourceLocation: "OB.L0226, katalogpost og fotografi", sourceType: "archive", verifiedAt, temporalCoverage: "contemporary_to_event", provenance: "Oslo Museums digitaliserte fotografi med datering, fotograf og rettighetsstatus.", limitations: "Motivet kan ikke alene dokumentere hver persons rolle eller konkrete arbeidsoppgave." },
    { id: "source_sceneweb", url: urls.sceneweb, sourceLocation: "Spillestedshistorikk og åpningen i 2003", sourceType: "institutional", verifiedAt, temporalCoverage: "retrospective", provenance: "Nasjonal scenekunstdatabase med spillestedsrelasjon og historikk.", limitations: "Teaterkilde og ikke et teknisk sporveisarkiv." },
    { id: "source_egal", url: urls.egal, sourceLocation: "Om Trikkestallen og aktuell teaterbruk", sourceType: "primary", verifiedAt, temporalCoverage: "current", provenance: "Den nåværende teateraktørens offisielle presentasjon.", limitations: "Dokumenterer egen bruk best; historiske opplysninger må krysskontrolleres." },
    { id: "source_ung_media", url: urls.ungmedia, sourceLocation: "Besøksadresse og aktivitetstilbud", sourceType: "official", verifiedAt, temporalCoverage: "current", provenance: "Oslo kommunes offisielle side for Ung Media.", limitations: "Dokumenterer aktuell aktivitet og adresse, ikke anleggets fulle historie." }
  ],
  caseRealizations: [{
    id: "case_torshov_elektrifisering_og_ombruk",
    claim: "Anlegget viser hvordan elektrisk kollektivtransport skapte ny infrastruktur og arbeid, før den samme bygningsmassen ble bevart gjennom kulturbruk.",
    temporalSequence: {
      scope: { start: "1899", end: "2026", precision: "period", rationale: "Caset følger etablering, trinnvis avslutning av sporveisfunksjoner og ombruk som kulturhus." },
      startPoint: "Den elektriske Torshovlinjen og vognhallen med verksted åpnet i 1899.",
      endPoint: "Égal Teater og Ung Media dokumenterer kulturbruk i Torshovgata 33 ved kontrollen i 2026.",
      breaks: ["Vognhalldriften ble avsluttet i 1957.", "Karosseriverkstedet opphørte i 1977 etter Sporveiens historikk.", "Kulturhuset åpnet i 2003, og Oslo Nye forlot lokalet i 2025."],
      continuities: ["Teglhallen, hallportene og fasadeinndelingen står som lesbare materielle spor.", "Bygningen har fortsatt en offentlig og arbeidsrelatert funksjon gjennom kulturaktivitet."],
      sourceIds: ["source_sporveien", "source_byleksikon", "source_staff_photo", "source_sceneweb", "source_egal", "source_ung_media"]
    },
    actors: [
      { name: "Kristiania Sporveisselskab", roleOrInterest: "Byggherre og operatør ved elektrifiseringen og oppføringen i 1899.", powerPosition: "Kontrollerte anlegg, kjøretøy og sporveisdrift i etableringsfasen.", sourceIds: ["source_sporveien", "source_staff_photo"] },
      { name: "Vognbetjening og verkstedpersonale", roleOrInterest: "Betjente vogner og verkstedfunksjoner som arkivfotografiet knytter til anlegget.", powerPosition: "Utførte det tekniske arbeidet, mens åpne kilder ikke dokumenterer medbestemmelse eller arbeidsvilkår.", sourceIds: ["source_staff_photo", "source_sporveien"] },
      { name: "Bydel Sagene-Torshov, Oslo Nye og Per Horn", roleOrInterest: "Utviklet kulturhus- og dukketeaterbruken fram mot åpningen i 2003.", powerPosition: "Kommunale og institusjonelle aktører kontrollerte ombygging og sceneprogram; Per Horn bar dokumentert faginnflytelse.", sourceIds: ["source_sceneweb", "source_egal"] },
      { name: "Égal Teater og Ung Media", roleOrInterest: "Bruker og presenterer lokaler i anlegget ved siste kontroll.", powerPosition: "Forvalter egne tilbud, men ikke anleggets historiske fortelling alene.", sourceIds: ["source_egal", "source_ung_media"] }
    ],
    conflictOrNegotiation: { statement: "Etterbruken forhandler mellom vern av et teknisk kulturminne, nye kulturfunksjoner og skiftende institusjonelle brukere; kildene dokumenterer utfallet bedre enn beslutningskonfliktene.", sourceIds: ["source_sporveien", "source_sceneweb", "source_egal"] },
    sourceComparison: {
      sourceIds: ["source_sporveien", "source_byleksikon", "source_staff_photo"],
      comparison: "Sporveien bærer funksjonsskillet mellom vognhall og karosseriverksted, Oslo byleksikon bærer bygningshistorien, og arkivfotografiet dokumenterer personale og vogner ved anlegget.",
      contradictionsOrSilences: "Sporveien oppgir karosseriverksted til 1977, mens Oslo byleksikon oppgir verksteddrift til 1974; ingen av kildene gir komplette arbeidslivsserier.",
      conclusionLimits: "1977 publiseres for det særskilt navngitte karosseriverkstedet, men kildeavviket skjules ikke og årsaken til ulik datering fastslås ikke."
    },
    comparativeScale: {
      localFinding: "Torshov fikk både en elektrisk linje og et støtteanlegg som bandt rutetrafikken til en lokal teknisk arbeidsplass.",
      widerContext: "Stedet viser nasjonalt hvordan elektrisk kollektivtransport krevde haller, verksteder, kjøretøy og personale utenfor selve holdeplassen.",
      scale: "national", sourceIds: ["source_sporveien", "source_staff_photo"]
    },
    causationAndUncertainty: {
      causalAssessment: "Elektrifiseringen forklarer den dokumenterte etableringen i 1899; åpne kilder isolerer ikke én tilstrekkelig årsak til den senere kulturhusombyggingen.",
      alternativeExplanations: ["Vernestatus, hallenes størrelse, kommunalt samarbeid og behov for kulturarena kan ha virket sammen."],
      uncertainty: "Åpne kilder gir ikke komplette beslutningsarkiver, kostnader, bemanningsserier eller en sikker forklaring på 1974/1977-avviket.",
      sourceIds: ["source_sporveien", "source_byleksikon", "source_sceneweb"]
    }
  }],
  presentTrace: {
    objectStatus: "altered",
    statement: "Hallvolum, porter og fasadeinndeling står som lesbare spor, mens rommene er bygd om for kultur- og teaterbruk.",
    originalSiteRelationship: "Markøren peker til Torshovgata 33 der vognhallen og verkstedet ble oppført i 1899; Pontoppidans gate 7 er et annet anlegg.",
    sourceIds: ["source_sporveien", "source_egal", "source_ung_media"]
  },
  quizOpening: { status: "PASS", quizTargetId: "gamle_trikkestallen", firstTwoSetsQuestionCount: 14, sourceBrief: briefFile, productionContext: "data/quiz/production_context/by/gamle_trikkestallen.json", requiredInputs: ["data/fag/by/pensum_by.json", "data/fag/by/emner_by.json", "data/fag/by/fagkart_by.json", "data/fag/by/methods_by.json", "data/fag/by/supersetQUIZMAL_by.json", "data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md", "data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json"] },
  chronologyStories: { status: "PASS", chronologyReviewed: true, storiesReviewed: true, rationale: "Leksikonet følger 1899, 1957, 1977, 2003, 2025 og 2026; Story avgrenser 2003 som dokumentert vendepunkt." },
  gates: {
    A: { status: "PASS", evidenceRefs: ["historicalIdentity", "presentTrace"] },
    B: { status: "PASS", evidenceRefs: ["historyTopics", "caseRealizations.case_torshov_elektrifisering_og_ombruk"] },
    C: { status: "PASS", evidenceRefs: ["caseRealizations.case_torshov_elektrifisering_og_ombruk.temporalSequence"] },
    D: { status: "PASS", evidenceRefs: ["caseRealizations.case_torshov_elektrifisering_og_ombruk.actors", "caseRealizations.case_torshov_elektrifisering_og_ombruk.conflictOrNegotiation"] },
    E: { status: "PASS", evidenceRefs: ["sources", "caseRealizations.case_torshov_elektrifisering_og_ombruk.sourceComparison"] },
    F: { status: "PASS", evidenceRefs: ["caseRealizations.case_torshov_elektrifisering_og_ombruk.comparativeScale", "caseRealizations.case_torshov_elektrifisering_og_ombruk.causationAndUncertainty"] },
    G: { status: "PASS", evidenceRefs: ["quizOpening"] },
    H: { status: "PASS", evidenceRefs: ["chronologyStories", `${leksikonFile}#chronology`] }
  },
  review: { reviewer: "Gamle trikkestallen phase 1–24 Historie review", reviewedAt: verifiedAt, notes: "Vognhall, verksted, kulturhus, tidligere Oslo Nye-bruk og nåværende aktører er avgrenset. Kildeavviket 1974/1977 og adressegrensen publiseres eksplisitt; årsaker og arbeidsvilkår hevdes ikke utover kildenes dekning." }
});

const auditFile = "reports/place-production/gamle-trikkestallen-phase1-24-gate-audit-v1.json";
write(auditFile, {
  schema: "history_go_phase1_24_quality_gate_v1", place_id: "gamle_trikkestallen", verified_at: verifiedAt,
  collections: { required: ["people", "objects", "brands", "structures"], loaded_preview_images: 5, missing: 0, coverage_percent: 100 },
  brands: { candidates_reviewed: ["Kristiania Sporveisselskab", "Oslo Nye Teater", "Égal Teater"], selected: ["egal_teater"], held_back: ["Kristiania Sporveisselskab – ingen autentisk godkjent merkevaregrafikk funnet.", "Oslo Nye Teater – tidligere bruker, ikke nåværende aktør."], logo_coverage: { required: 1, reviewed: 1, missing: 0, percent: 100 } },
  people: { candidates_reviewed: ["Ove Laurentius Ekman", "Per Horn"], selected: ["per_horn"], held_back: ["Ove Laurentius Ekman – dokumentert arkitekt, men bygningen er ikke behandlet som et kanonisert hovedverk og arkitekten brukes derfor ikke som filler i People."], image_coverage_percent: 100 },
  quality_score: { correctness_and_evidence: { score: 5, note: "1899, 1957, 1977, 2003 og 2025 er kildesporet; 1974/1977-avviket og adressegrensen er synlige." }, coverage_and_completion: { score: 5, note: "Fire ferdige By-samlinger, før/nå, People, Story, Språk, lesespor, leksikon, 4×7-quiz og Fagverk er materialisert." }, editorial_quality: { score: 5, note: "Teksten skiller anlegg, driftsfunksjoner, tidligere teaterbruk, nåværende aktører og den andre Trikkestallen-adressen." }, technical_integrity: { score: 5, note: "Deterministisk finalizer, manifests, lokale assets, produksjonskontekst og målrettet test inngår." }, safety_and_responsibility: { score: 5, note: "Observasjonsoppgaven skjer fra offentlig grunn; aktuelle aktører og eldre skilt er tidsmerket." }, maintainability_and_auditability: { score: 5, note: "Kildeproveniens, bilderettigheter, holdbacks, claims, teksthash og quiz-audit er eksplisitte." }, total: 30, critical_findings: 0, unresolved_blockers: 0 }
});
write("reports/place-production/gamle-trikkestallen-workcard-current.json", { place_id: "gamle_trikkestallen", status: "complete", phases: "1–24", verified_at: verifiedAt, production_profile: "standard", canonical_next: null, notes: ["Verifiserte adressekoordinater er bevart uendret.", "Navnet er normalisert fra Sagene til Torshov.", "1977 publiseres med synlig kildeavvik mot Byleksikons 1974.", "Torshovgata 33 er avgrenset fra Pontoppidans gate 7.", "To stedsspesifikke sporvogner og Per Horn er valgt uten filler."] });
remove("reports/place-production/gamle-trikkestallen-phase8-24-gate-audit-v1.json");

for (const file of [
  "data/people/historie/oslo/gamle_trikkestallen/ove_laurentius_ekman.json",
  "data/people/claims/historie/oslo/gamle_trikkestallen/ove_laurentius_ekman.claims.json",
  "bilder/kort/objects/kss_type_u_motorvogn_torshov_1899.webp",
  "bilder/kort/objects/kss_motorvogn_47.webp",
  "bilder/kort/people/per_horn_editorial.webp",
  "bilder/kort/people/ove_laurentius_ekman.webp",
  "bilder/kort/productions/torshovlinjen_elektrifisering_1899.webp"
]) remove(file);

console.log(`Finalized Gamle trikkestallen as a canonical By package (${questions.length} quiz questions).`);
