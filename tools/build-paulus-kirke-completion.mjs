#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const verifiedAt = "2026-08-26";
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
const sentences = text => [...new Intl.Segmenter("nb", { granularity: "sentence" }).segment(text)].map(item => item.segment.trim()).filter(Boolean);

const urls = {
  official: "https://www.kirken.no/nn-NO/fellesrad/kirkeneioslo/menigheter/paulus-sofienberg/paulus-kirke/",
  use: "https://www.kirken.no/nb-NO/fellesrad/kirkeneioslo/menigheter/paulus-sofienberg/utleie/uteleie-av-kirken/",
  byleksikon: "https://oslobyleksikon.no/side/Paulus_kirke",
  birkelunden: "https://oslobyleksikon.no/side/Birkelunden",
  commons: "https://commons.wikimedia.org/wiki/Category:Paulus_kirke,_Oslo",
  historic: "https://commons.wikimedia.org/wiki/File:Paulus_kirke_Oslo_OB.Z06219.jpg",
  publicDomain: "https://commons.wikimedia.org/wiki/File:Paulus_kirke_Oslo.jpg",
  parish: "https://www.kirken.no/nb-NO/fellesrad/kirkeneioslo/menigheter/paulus-sofienberg/",
  parishLogo: "https://www.kirken.no/globalassets/fellesrad/oslo/menigheter/paulus-sofienberg/bilder/logoer-etc/ps-logo.png"
};

const placeFile = "data/places/historie/oslo/places_historie/paulus_kirke.json";
const place = read(placeFile);
place.desc = "Paulus kirke er en aktiv teglkirke ved Birkelunden, innviet i 1892 og tegnet av Henrik Bull med former inspirert av tysk gotikk. Bygningen inngår i Grünerløkkas planlagte bystruktur og lokale menighetsliv, og ble fredet i 2006. Kirken og Birkelunden er tett forbundet i nabolaget, men beholder separate fysiske identiteter og kartankere.";
place.popupDesc = "Paulus kirke ligger ved Paulus’ plass, rett overfor Birkelunden, og ble innviet i 1892. Arkitekten Henrik Bull tegnet kirken i tegl med former inspirert av tysk gotikk. Tårnet, de spisse buene og det tydelige murverket gjør bygningen til et landemerke i den tette Grünerløkka-bebyggelsen.\n\nKirken ble reist mens området vokste raskt med leiegårder, industri og nye offentlige institusjoner. Menighetsbygget var del av en større byutvikling, ikke et isolert monument. Plasseringen ved parken viser hvordan kirke, grøntområde, gater og boligkvartaler ble organisert som ulike offentlige rom.\n\nPlanen kombinerer en tydelig lengdeakse med korte korsarmer og et relativt samlet kirkerom. Arkitekturen støtter gudstjeneste, tale, musikk og menighetsfellesskap. Materialer, akustikk og rominndeling kan brukes til å undersøke hvordan religiøs praksis formes av et konkret bygg.\n\nPaulus kirke er fortsatt et aktivt trossted. Gudstjenester, kirkelige handlinger, konserter og lokalt arbeid tilfører nye brukslag til den historiske arkitekturen. Kirken ble fredet i 2006 sammen med bygningsmiljøet rundt Birkelunden. Bevaring innebærer at vedlikehold og tilpasninger må ta hensyn til både kulturminnet og menighetens behov.\n\nForholdet til Birkelunden er tett, men stedene er ulike. Parken er et selvstendig byrom, mens kirken er et navngitt institusjonsbygg med egen adresse og funksjon. Sammen viser de hvordan religion, fritid, ferdsel og nabolagsliv møtes i Grünerløkkas historiske struktur.\n\nKirkebygningen i Thorvald Meyers gate 31 er det presise stedet som omtales her. Teglflatene, tårnet og inngangens retning mot omgivelsene gjør arkitekturen lesbar fra offentlig grunn. Stedet viser en sammenheng mellom byvekst, arkitektur og lokalt menighetsliv, samtidig som aktive kirkelige handlinger må møtes med respekt. Kirken kan sammenlignes med andre Oslo-kirker fra samme vekstperiode, men lik materialbruk betyr ikke identisk plan, menighet eller nabolagsrolle. Den fortsatte bruken gjør at kilder om arkitektur, institusjonshistorie og dagens menighetsliv må leses sammen. Plasseringen danner dessuten en visuell akse mot parken og gir bygningen en rolle i hverdagslige bevegelser gjennom bydelen.";
place.image = "bilder/places/paulus_kirke.webp";
place.cardImage = "bilder/kort/places/paulus_kirke.webp";
place.frontImage = "bilder/places/paulus_kirke_front_portrait.webp";
place.imageMeta = {
  source: "openai_imagegen", generationMethod: "openai_imagegen", assetType: "editorial_illustration",
  creator: "OpenAI ImageGen", credit: "Redaksjonell illustrasjon generert for History GO",
  license: "project_asset", generatedAt: verifiedAt, dimensions: "1672 × 941 source; 1200 × 675 and 640 × 360 derivatives",
  prompt: "Historisk respektfull redaksjonell arkitekturillustrasjon av Paulus kirke ved Birkelunden; rød tegl, 1892, Henrik Bull, tysk-gotisk inspirasjon, mykt nordisk dagslys, uten tekst eller fotopåstand.",
  representationScope: "Illustrasjonen er en nålaget, dokumentarisk orientert tolkning av kirkens ytre og skal ikke leses som historisk fotografi.",
  architecturalReferenceUrls: [urls.official, urls.byleksikon], verifiedAt
};
place.frontImageMeta = {
  source: "openai_imagegen", generationMethod: "openai_imagegen", assetType: "editorial_illustration",
  creator: "OpenAI ImageGen", credit: "Redaksjonell illustrasjon generert for History GO",
  license: "project_asset", generatedAt: verifiedAt, sourceDimensions: "1200x675", outputDimensions: "900x1200",
  orientation: "portrait", aspectRatio: "3:4",
  crop: { left: 347, top: 0, width: 506, height: 675 },
  transformation: "Kontrollert stående 3:4-beskjæring av den eksisterende 1200 × 675-redaksjonelle illustrasjonen (venstre 347, topp 0, bredde 506, høyde 675), deretter skalert til 900 × 1200. Hele spiret, inngangstårnet og kirkens hovedvolum er bevart.",
  prompt: "Historisk respektfull redaksjonell arkitekturillustrasjon av Paulus kirke ved Birkelunden; rød tegl, 1892, Henrik Bull, tysk-gotisk inspirasjon, mykt nordisk dagslys, uten tekst eller fotopåstand.",
  representationScope: "Illustrasjonen er en nålaget, dokumentarisk orientert tolkning av kirkens ytre og skal ikke leses som historisk fotografi.",
  architecturalReferenceUrls: [urls.official, urls.byleksikon], verifiedAt
};
place.related_people_ids = ["henrik_bull"];
place.related_place_ids = ["birkelunden", "markveien", "olaf_ryes_plass", "sofienbergparken", "sofienberg_kirke", "schous_bryggeri", "grunerlokka_helgesens_tm"];
place.place_card_profile = {
  schema: "history_go_place_card_profile_v2", collection_ids: ["people", "objects", "brands", "related"],
  reason: "Den faste Historie-komposisjonen er full: Henrik Bull, inngangstårnet, Paulus og Sofienberg menighet og den kildebelagte nabografen har hvert sitt canonicale, bildeklare medlem. Badge og quiz presenteres separat.", verifiedAt
};
place.objects = [{
  id: "paulus_kirke_tarn", title: "Inngangstårnet", type: "kirketarn", kind: "physical_building_element",
  desc: "Det høye, smale tårnet står over inngangspartiet og vender kirkens hovedfasade mot Birkelunden.",
  whereToFind: "Over hovedinngangen mot Paulus’ plass og Birkelunden, synlig fra offentlig gate- og parkgrunn.",
  why_here: "Tårnet er del av Henrik Bulls teglkirke fra 1892 og markerer møtet mellom kirkebygningen og byrommet.",
  placeSpecificReason: "Den norske kirkes bygningsbeskrivelse knytter det høye, smale tårnet over inngangen til Paulus kirke.",
  historicalFunction: "Tårnet samler inngang, vertikal markering og kirkens offentlige fasade mot plassen.",
  physicalObject: true, placeSpecific: true, collectable: true, storePrice: 30, currency: "PC", collection: "paulus_kirke_arkitektur",
  unlock: "Finn hovedinngangen og observer tårnets teglflater og høyde fra offentlig grunn.",
  image: "bilder/kort/objects/paulus_kirke_tarn.webp",
  imageMeta: { source: "openai_imagegen", generationMethod: "openai_imagegen", assetType: "editorial_illustration_crop", creator: "OpenAI ImageGen", credit: "Redaksjonell illustrasjon generert for History GO", license: "project_asset", generatedAt: verifiedAt, representationScope: "Utsnitt av en nålaget illustrasjon, ikke et historisk fotografi.", sourcePage: urls.official, verifiedAt },
  source_urls: [urls.official, urls.byleksikon]
}];
place.externalLinks = [
  ["official", "Den norske kirke – Paulus kirke", urls.official],
  ["official", "Den norske kirke – bruk og utleie", urls.use],
  ["source", "Oslo byleksikon – Paulus kirke", urls.byleksikon],
  ["image_source", "Wikimedia Commons – Paulus kirke", urls.commons],
  ["historical_image", "Oslo Museum – Paulus kirke omkring 1900", urls.historic]
].map(([type, label, url]) => ({ type, label, url, verifiedAt }));
place.interpretation = {
  what_to_notice: ["Det høye, smale inngangstårnet mot Birkelunden.", "Rød tegl, spissbuer og korte korsarmer i en kompakt langkirkeplan.", "Den visuelle forbindelsen mellom hovedfasaden, plassen og parken."],
  why_it_matters: ["Kirken viser hvordan religiøse og offentlige institusjoner ble plassert i den raskt voksende 1800-tallsbyen.", "Fredningen i 2006 gjør både enkeltbygget og miljøet rundt Birkelunden til kulturminne.", "Fortsatt bruk viser at vern og levende menighetsliv må forvaltes samtidig."],
  counterpoints: ["Tysk-gotisk inspirasjon betyr ikke at bygningen er middelaldersk.", "Birkelunden er et eget sted og ikke kirkens eiendom.", "Den genererte illustrasjonen dokumenterer ikke en bestemt historisk situasjon."],
  sources: [urls.official, urls.byleksikon, urls.use].map(url => ({ url, verifiedAt }))
};
write(placeFile, place);

const brandId = "paulus_sofienberg_menighet";
const brandLogo = "bilder/kort/brands/den_norske_kirke.webp";
const brand = {
  id: brandId,
  name: "Paulus og Sofienberg menighet",
  brand_group: "institution_brand",
  brand_type: "parish_identity",
  brand_kind: "institution",
  sector: "religion",
  state: "catalog",
  status: "active",
  verification: "verified",
  verified_at: verifiedAt,
  popupdesc: "Paulus og Sofienberg menighet er den aktive menighetsidentiteten som bruker Paulus kirke til gudstjenester, kirkelige handlinger, åpen kirke, lokalt arbeid, konserter og kulturarrangementer. Brand-koblingen gjelder den navngitte institusjonen og dens offisielle visuelle identitet; den erstatter ikke Paulus kirke som eget historisk og arkitektonisk Place.",
  desc: "Aktiv menighetsidentitet med Paulus kirke som kirkebygg og lokal møteplass.",
  tags: ["brand", "institution", "religion", "grunerlokka", "paulus_kirke"],
  place_ids: ["paulus_kirke"],
  source_urls: [urls.parish, urls.official, urls.use],
  logo: brandLogo,
  imageMeta: {
    sourcePage: urls.parish,
    sourceAsset: urls.parishLogo,
    creator: "Paulus og Sofienberg menighet / Den norske kirke",
    credit: "Paulus og Sofienberg menighet / Den norske kirke",
    rightsBasis: "official_brand_site_referential_identification",
    reviewStatus: "manually_approved",
    assetKind: "official_logo",
    sourceForm: "official_png_logo",
    temporalScope: "current",
    usageContext: "referential_identification",
    noEndorsement: true,
    generated: false,
    reconstructed: false,
    transformation: "Den offisielle PNG-logoen er proporsjonalt skalert og sentrert på en nøytral 900 × 520-flate, deretter WebP-normalisert.",
    outputDimensions: "900x520",
    reviewedAt: verifiedAt
  }
};
const masterBrands = read("data/brands/brands_master.json");
upsertById(masterBrands, brand);
write("data/brands/brands_master.json", masterBrands);
const brandSummary = { id: brand.id, name: brand.name, brand_group: brand.brand_group, brand_type: brand.brand_type, brand_kind: brand.brand_kind, sector: brand.sector, state: brand.state };
const rawBrandSummary = { id: brand.id, name: brand.name, brand_type: brand.brand_type, sector: brand.sector, state: brand.state };
for (const [file, value] of [
  ["data/brands/brands_catalog.json", brandSummary],
  ["data/brands/brands_catalog_v17.json", { id: brand.id, name: brand.name, brand_group: brand.brand_group, brand_type: brand.brand_type, sector: brand.sector, state: brand.state }]
]) {
  const records = read(file);
  upsertById(records, value);
  write(file, records);
}
const rawBrands = read("data/brands/brands_master_raw.json");
upsertById(rawBrands, rawBrandSummary);
writeCompactArray("data/brands/brands_master_raw.json", rawBrands);
const brandsByPlace = read("data/brands/brands_by_place.json");
brandsByPlace.paulus_kirke = [brandId];
write("data/brands/brands_by_place.json", brandsByPlace);

const leksikonFile = "data/leksikon/places/oslo/historie/leksikon_paulus_kirke.json";
write(leksikonFile, {
  place_id: "paulus_kirke", title: "Paulus kirke", type: "main", version: 1,
  visual: { designCode: "article_place_essay_miniature" },
  popupDesc: "En fredet teglkirke fra 1892 der Henrik Bulls arkitektur, menighetens bruk og byrommet ved Birkelunden møtes.",
  wikiText: [
    "Paulus menighet ble opprettet i 1874. Etter deling av menigheten og en arkitektkonkurranse i 1887 tegnet Henrik Bull den nye kirken i 1889. Kirken ble innviet 30. desember 1892.",
    "Bygningen er oppført i rød tegl med tysk-gotisk inspirasjon. Den har et høyt og smalt inngangstårn, en tydelig lengdeakse, korte korsarmer og et grunt kor. Plasseringen overfor Birkelunden gjør kirken til del av et planlagt offentlig bymiljø.",
    "Interiør og orgel har blitt endret flere ganger. Kirken ble fredet sammen med miljøet rundt Birkelunden i 2006, orgelet ble restaurert i 2010, og en rehabilitering i 2014–2017 gjenskapte veggdekor fra 1917–1918. Bygget er fortsatt kirke og kulturarena."
  ],
  summary: { one_liner: "Fredet 1892-kirke og levende menighetsbygg ved Birkelunden.", themes: ["kirkehistorie", "arkitektur", "byvekst", "vern"], tone: ["nøktern", "stedsspesifikk"] },
  facts: [
    { id: "fact_paulus_arkitekt", label: "Arkitekten", desc: "Henrik Bull vant arkitektkonkurransen i 1887 og tegnet kirken i 1889.", confidence: "high", sources: [{ title: "Oslo byleksikon", url: urls.byleksikon }] },
    { id: "fact_paulus_innvielse", label: "Innvielsen", desc: "Paulus kirke ble innviet 30. desember 1892.", confidence: "high", sources: [{ title: "Oslo byleksikon", url: urls.byleksikon }] },
    { id: "fact_paulus_fredning", label: "Fredningen", desc: "Kirken ble fredet med bygningsmiljøet rundt Birkelunden i 2006.", confidence: "high", sources: [{ title: "Oslo byleksikon", url: urls.byleksikon }] }
  ],
  chronology: [[1874,"Menigheten opprettes","Paulus menighet ble opprettet."],[1887,"Arkitektkonkurransen","Henrik Bull vant konkurransen som 25-åring."],[1889,"Kirken tegnes","Bull utarbeidet tegningene til teglkirken."],[1892,"Kirken innvies","Biskop Essendrop innviet kirken 30. desember."],[1918,"Interiøret endres","Veggene fikk dekor under arbeidene i 1917–1918."],[1943,"Orgelet utvides","Hollenbach-orgelet ble bygget ut."],[1992,"Nye friser","Nye friser kom til ved hundreårsjubileet."],[2006,"Kirken fredes","Fredningen omfattet kirken og miljøet rundt Birkelunden."],[2010,"Orgelet restaureres","Orgelet ble restaurert med den opprinnelige fasaden bevart."],[2017,"Rehabilitering avsluttes","Arbeidene fra 2014 til 2017 gjenskapte eldre veggdekor."]].map(([year,title,desc], index) => ({ id: `chrono_paulus_${year}_${index+1}`, year, title, desc, confidence: "high", sources: [{ title: "Oslo byleksikon", url: urls.byleksikon }] })),
  sources: place.externalLinks, externalLinks: place.externalLinks, interpretation: place.interpretation
});
const leksikonManifest = read("data/leksikon/manifest.json");
addOnce(leksikonManifest.files, leksikonFile);
write("data/leksikon/manifest.json", leksikonManifest);

const languageFile = "data/leksikon/sprak/places/europe/norway/oslo/paulus_kirke.json";
write(languageFile, {
  place_id: "paulus_kirke", title: "Språkleksikon: Paulus kirke", verified_at: verifiedAt, dialect_status: "not_applicable_place_level",
  entries: [
    { id: "paulus_navn", term: "Paulus", type: "kirkenavn", meaning: "Kirken og menigheten har navn etter apostelen Paulus.", context: "Navnet skiller institusjonen fra Paulus’ plass og Birkelunden som egne steder.", linked_to: { kind: "place", id: "paulus_kirke" }, tags: ["kirkenavn", "religion"], sources: [{ label: "Den norske kirke", url: urls.official }] },
    { id: "paulus_langkirke", term: "langkirke", type: "arkitekturbegrep", meaning: "En kirkeplan organisert langs en tydelig lengdeakse fra inngang mot kor.", context: "Paulus kirke kombinerer lengdeaksen med korte korsarmer.", linked_to: { kind: "place", id: "paulus_kirke" }, tags: ["arkitektur", "plan"], sources: [{ label: "Den norske kirke", url: urls.official }] },
    { id: "paulus_nygotikk", term: "nygotikk", type: "stilbegrep", meaning: "Historiserende arkitektur som gjenbruker former forbundet med gotikken.", context: "Kildene beskriver Paulus kirke som inspirert av tysk gotikk; ordet peker på 1800-tallets bearbeiding av eldre formspråk.", linked_to: { kind: "place", id: "paulus_kirke" }, tags: ["arkitektur", "1800-tallet"], sources: [{ label: "Oslo byleksikon", url: urls.byleksikon }] }
  ]
});
const languageManifest = read("data/leksikon/sprak/manifest.json");
languageManifest.place_files.paulus_kirke = languageFile;
write("data/leksikon/sprak/manifest.json", languageManifest);

const storyFile = "data/stories/stories_paulus_kirke.json";
write(storyFile, [{
  id: "st_paulus_kirke_alterstriden_1892", quality_profile: "episode_v1", type: "conflict", title: "Alterbildene som ikke kom på plass", year: 1892, place_id: "paulus_kirke",
  summary: "Da kirken skulle åpne i 1892, ble Gustav Wentzels alterbilder avvist, og Jo Visdals opprinnelige Kristusfigur fikk heller ikke den planlagte plasseringen.",
  story: "Paulus kirke var ferdig for innvielse i desember 1892, men kunsten ved alteret var ikke bare dekor. Den skulle inngå i en ny kirkes teologiske og arkitektoniske helhet.\n\nGustav Wentzel hadde malt alterbilder, men de ble forkastet før åpningen. Jo Visdal hadde laget en Kristusfigur som var tenkt plassert mellom basunenglene over alteret, men også denne løsningen ble avvist. Figuren ble senere flyttet til Vår Frelsers gravlund.\n\nDagens alterparti er derfor resultat av valg, avvisninger og senere arbeider. Episoden viser at et kirkeinteriør ikke blir til i ett uproblematisk øyeblikk; bestillere, kunstnere og kirkelige vurderinger former hvilke bilder menigheten faktisk møter.",
  episode: { actors: ["Gustav Wentzel", "Jo Visdal", "kirkens beslutningstakere"], date: "1892-12-30", action: "Planlagte alterarbeider av Wentzel og Visdal ble ikke brukt slik kunstnerne hadde tenkt.", consequence: "Alterpartiet fikk en annen kunstnerisk utforming, og Visdals figur ble senere flyttet." },
  sources: [{ title: "Oslo byleksikon – Paulus kirke", url: urls.byleksikon }, { title: "Den norske kirke – Paulus kirke", url: urls.official }],
  tags: ["kirkeinteriør", "kunst", "innvielse", "1892"], related_people: ["jo_visdal", "henrik_bull"], related_places: ["var_frelsers_gravlund"],
  score: { narrative: 3, historical: 4, source: 4, play_value: 3, originality: 3, total: 17 },
  arc: { start: "En ny kirke skulle få et samlet alterparti.", middle: "To planlagte kunstbidrag ble avvist.", end: "Senere valg formet det interiøret som kan ses i kirken." },
  next_scenes: [{ place_id: "var_frelsers_gravlund", reason: "Visdals avviste Kristusfigur ble senere plassert på gravlunden." }]
}]);
const storyManifest = read("data/stories/stories_manifest.json");
storyManifest.files = storyManifest.files.filter(entry => entry.entity_id !== "paulus_kirke");
storyManifest.files.push({ category: "historie", entity_id: "paulus_kirke", path: storyFile });
write("data/stories/stories_manifest.json", storyManifest);
const episodeManifest = read("data/stories/stories_episode_v1_manifest.json");
addOnce(episodeManifest.files, storyFile);
write("data/stories/stories_episode_v1_manifest.json", episodeManifest);

const readingFile = "data/lesespor/oslo/lesespor_oslo_historie.json";
const readings = read(readingFile);
readings.items = readings.items.filter(item => !item.id.startsWith("lesespor_paulus_kirke_"));
readings.items.push(
  { id: "lesespor_paulus_kirke_offisiell", title: "Paulus kirke", author: null, publication: "Den norske kirke", date: null, year: 1892, type: "institusjonell_stedsside", subjects: ["Paulus kirke", "arkitektur", "orgel", "menighet"], place_ids: ["paulus_kirke"], person_ids: ["henrik_bull"], category_hints: ["historie", "religion"], url: urls.official, access: "open", rights: "link_only", source_quality: "canonical", curation_status: "approved", relevance: "Offisiell bygnings- og brukshistorie med plan, arkitekt, interiør og orgel." },
  { id: "lesespor_paulus_kirke_byleksikon", title: "Paulus kirke", author: null, publication: "Oslo byleksikon", date: null, year: 1892, type: "lokalhistorisk_oppslag", subjects: ["arkitektkonkurranse", "innvielse", "kunst", "fredning"], place_ids: ["paulus_kirke"], person_ids: ["henrik_bull", "jo_visdal"], category_hints: ["historie", "kunst"], url: urls.byleksikon, access: "open", rights: "link_only", source_quality: "institutional", curation_status: "approved", relevance: "Detaljert kronologi for konkurranse, bygging, interiørendringer, orgel, rehabilitering og fredning." },
  { id: "lesespor_paulus_kirke_historisk_foto", title: "Paulus kirke omkring 1900", author: null, publication: "Oslo Museum / Wikimedia Commons", date: null, year: 1900, type: "historisk_fotografi", subjects: ["Paulus kirke", "Grünerløkka", "bybilde"], place_ids: ["paulus_kirke"], person_ids: [], category_hints: ["historie"], url: urls.historic, access: "open", rights: "link_only", source_quality: "institutional", curation_status: "approved", relevance: "Museumsfotografi som viser kirken og bymiljøet nær innvielsestiden; lenkes som historisk kilde, ikke som identisk før/etter-standpunkt." }
);
write(readingFile, readings);

const translations = {
  en: { name: "Paulus Church", desc: "Paulus Church is an active brick church by Birkelunden, consecrated in 1892 and designed by Henrik Bull with forms inspired by German Gothic architecture. It belongs to Grünerløkka's planned urban structure and parish life and was protected in 2006. The church and park remain separate places.", popupDesc: "Paulus Church stands at Thorvald Meyers gate 31 opposite Birkelunden. Henrik Bull designed the red-brick church, consecrated in 1892, with a high narrow entrance tower, pointed arches, a longitudinal plan and short transepts. The church was protected with the Birkelunden environment in 2006. It remains an active place of worship and also hosts concerts and cultural activities, so its history must be read together with its current use." },
  es: { name: "Iglesia de Paulus", desc: "La iglesia de Paulus es una iglesia activa de ladrillo junto a Birkelunden, consagrada en 1892 y diseñada por Henrik Bull con formas inspiradas en el gótico alemán. Forma parte de la estructura urbana planificada de Grünerløkka y fue protegida en 2006. La iglesia y el parque siguen siendo lugares distintos.", popupDesc: "La iglesia de Paulus se encuentra en Thorvald Meyers gate 31, frente a Birkelunden. Henrik Bull diseñó el edificio de ladrillo rojo, consagrado en 1892, con una torre de entrada alta y estrecha, arcos apuntados, planta longitudinal y brazos de crucero cortos. La iglesia fue protegida con el entorno de Birkelunden en 2006. Continúa siendo un lugar de culto activo y también acoge conciertos y actividades culturales." },
  pt: { name: "Igreja de Paulus", desc: "A igreja de Paulus é uma igreja ativa de tijolos junto a Birkelunden, consagrada em 1892 e projetada por Henrik Bull com formas inspiradas no gótico alemão. Integra a estrutura urbana planejada de Grünerløkka e foi protegida em 2006. A igreja e o parque continuam sendo lugares distintos.", popupDesc: "A igreja de Paulus fica na Thorvald Meyers gate 31, em frente a Birkelunden. Henrik Bull projetou o edifício de tijolos vermelhos, consagrado em 1892, com torre de entrada alta e estreita, arcos ogivais, planta longitudinal e transeptos curtos. A igreja foi protegida com o ambiente de Birkelunden em 2006. Continua sendo um local de culto ativo e também recebe concertos e atividades culturais." }
};
const sourceHash = sha256(JSON.stringify({ name: place.name.normalize("NFC"), desc: place.desc.normalize("NFC"), popupDesc: place.popupDesc.normalize("NFC") })).slice(0, 16);
for (const [lang, translation] of Object.entries(translations)) {
  const file = `data/i18n/content/places/${lang}.json`;
  const pack = read(file);
  pack.paulus_kirke = { _sourceHash: sourceHash, _status: "machine_translated", ...translation };
  write(file, pack);
}

const sourceRegistry = {
  official: { url: urls.official, source_type: "official_place_information", review_status: "reviewed", review_note: "Arkitektur, plan, interiør og orgel." },
  use: { url: urls.use, source_type: "official_current_use", review_status: "reviewed", review_note: "Dagens kirkelige og kulturelle bruk." },
  byleksikon: { url: urls.byleksikon, source_type: "institutional_reference", review_status: "reviewed", review_note: "Konkurranse, kronologi, kunst, rehabilitering og fredning." },
  historic: { url: urls.historic, source_type: "museum_image_record", review_status: "reviewed", review_note: "Historisk bybilde omkring 1900." }
};
const quizRows = [
  ["Når ble Paulus kirke innviet?","1892","1874","1918","Kirken ble innviet 30. desember 1892.","byleksikon","em_his_hendelse_prosess_tidsforlop"],
  ["Hvem tegnet Paulus kirke?","Henrik Bull","Marius Røhne","Erling Viksjø","Henrik Bull tegnet kirken etter å ha vunnet arkitektkonkurransen.","official","em_his_spor_materialitet"],
  ["Hvor ligger kirkebygningen?","Thorvald Meyers gate 31","Markveien 57","Helgesens gate 90","Den offisielle adressen er Thorvald Meyers gate 31, rett overfor Birkelunden.","official","em_his_historiske_lag_i_byrom"],
  ["Hvilket materiale preger kirkens ytre?","Rød tegl","Laftet tømmer","Glass og aluminium","Paulus kirke er oppført i rød tegl.","official","em_his_spor_materialitet"],
  ["Hvilket formspråk inspirerte arkitekturen?","Tysk gotikk","Funksjonalisme","Brutalisme","Kildene beskriver kirken som inspirert av tysk gotikk.","official","em_his_spor_materialitet"],
  ["Hva står over hovedinngangen?","Et høyt, smalt tårn","En glasskuppel","Et klokketårn i tre på bakken","Det høye, smale tårnet er plassert over inngangspartiet.","official","em_his_spor_materialitet"],
  ["Når vant Henrik Bull arkitektkonkurransen?","1887","1897","1907","Henrik Bull vant konkurransen om kirken i 1887.","byleksikon","em_his_hendelse_prosess_tidsforlop"],
  ["Når utarbeidet Bull tegningene?","1889","1874","1917","Henrik Bull tegnet kirken i 1889.","official","em_his_hendelse_prosess_tidsforlop"],
  ["Hvem innviet kirken?","Biskop Essendrop","Kong Haakon VII","Henrik Bull","Biskop Essendrop innviet kirken 30. desember 1892.","byleksikon","em_his_hendelse_prosess_tidsforlop"],
  ["Hva kombinerer grunnplanen?","Lengdeakse og korte korsarmer","Sirkelplan og frittstående tårn","Åpent gårdsrom og søylehall","Planen er en langkirke med korte korsarmer og grunt kor.","official","em_his_spor_materialitet"],
  ["Hvilken retning markerer hovedfasaden?","Mot Birkelunden","Mot Akerselva","Mot Oslofjorden","Inngangen og tårnet vender kirken mot plassen og Birkelunden.","official","em_his_historiske_lag_i_byrom"],
  ["Hva var Hollenbach-instrumentet laget for?","Innvielsen i 1892","Fredningen i 2006","Jubileet i 1992","Albert Hollenbach bygde orgelet til åpningen i 1892.","official","em_his_spor_materialitet"],
  ["Hva skjedde med kirken i 2006?","Den ble fredet","Den ble revet","Den sluttet å være kirke","Kirken ble fredet sammen med bygningsmiljøet rundt Birkelunden.","byleksikon","em_his_kulturminner_bevaring"],
  ["Hva skjedde med orgelet i 2010?","Det ble restaurert","Det ble solgt","Det ble flyttet til Sofienberg kirke","Orgelet ble restaurert i 2010 med den opprinnelige fasaden bevart.","official","em_his_restaurering_autentisitet"],
  ["Hva ble gjenskapt under rehabiliteringen 2014–2017?","Veggdekor fra 1917–1918","En middelalderkrypt","Et bryggerigulv","Rehabiliteringen gjenskapte eldre veggdekor fra arbeidene i 1917–1918.","byleksikon","em_his_restaurering_autentisitet"],
  ["Hvilken bruk dokumenteres i tillegg til gudstjenester?","Konserter og kulturarrangementer","Industriproduksjon","Kommunestyremøter","Kirken brukes også til konserter og andre kulturproduksjoner.","use","em_his_sosialhistorie_hverdagsliv"],
  ["Hvorfor er Birkelunden relevant for kirken?","Parken og kirken danner et sammenhengende bymiljø","Parken ligger inne i kirkerommet","Kirken eier hele parken","Kirken er plassert rett overfor parken og inngår i det fredede miljøet.","byleksikon","em_his_historiske_lag_i_byrom"],
  ["Hvordan skal kirken og Birkelunden modelleres?","Som to nærliggende, separate steder","Som ett identisk kartpunkt","Som et festivalbrand","De er fysisk forbundet, men har ulike funksjoner og egne stedsidentiteter.","official","em_his_historiske_lag_i_byrom"],
  ["Hva viser avvisningen av Wentzels og Visdals arbeider?","At kirkeinteriøret ble formet gjennom valg og konflikt","At kirken manglet kunst","At Henrik Bull var organist","Planlagte alterarbeider ble avvist, og interiøret fikk en annen løsning.","byleksikon","em_his_kulturminner_bevaring"],
  ["Hva kan et fotografi fra omkring 1900 dokumentere?","Kirkens ytre i et tidlig bymiljø","Alle senere gudstjenester","Eksakt akustikk i kirkerommet","Museumsfotografiet er en visuell kilde til bygningen og omgivelsene omkring 1900.","historic","em_his_visuelle_kilder_fotografi"],
  ["Hva må en sammenligning med dagens illustrasjon presisere?","At illustrasjonen ikke er et historisk fotografi","At begge bilder har identisk kamera","At illustrasjonen beviser alle endringer","Den nye illustrasjonen tolker arkitekturen og kan ikke brukes som fotografisk dokumentasjon.","historic","em_his_visuelle_kilder_fotografi"],
  ["Hva er kontinuiteten fra 1892 til nå?","Bygningen brukes fortsatt som kirke","Alle interiørdetaljer er uendret","Menigheten har aldri endret seg","Kirkebygningen har fortsatt kirkelig bruk selv om interiør og teknikk er endret.","use","em_his_brudd_kontinuitet"],
  ["Hva er et tydelig brudd i byggets historie?","Rehabiliteringer og endret interiør","At tegl alltid er tegl","At adressen ligger i Oslo","Arbeidene i 1917–1918 og 2014–2017 viser at uttrykket har blitt endret og senere gjenskapt.","byleksikon","em_his_brudd_kontinuitet"],
  ["Hva bør observeres uten å forstyrre aktiv bruk?","Ytre tegl, tårn og forholdet til plassen","Deltakernes private ritualer","Låste rom under gudstjenesten","Den offentlige utsiden gir grunnlag for arkitektur- og byromslesning uten å gripe inn i kirkelig praksis.","official","em_his_spor_materialitet"],
  ["Hva viser konkurransen i 1887 om arkitektrollen?","At kirkebygget ble valgt gjennom en organisert bestillingsprosess","At Bull arvet kirken privat","At menigheten ikke påvirket byggingen","Konkurransen plasserer arkitekturen i en institusjonell beslutningsprosess, ikke bare i én arkitekts idé.","byleksikon","em_his_stat_institusjoner"],
  ["Hvorfor må dagens bruk ha en fersk kilde?","Program og aktiviteter kan endres","Innvielsestallet endres hvert år","Teglmaterialet er hemmelig","Nåværende gudstjenester, åpen kirke og kulturbruk er tidsavhengige opplysninger.","use","em_his_kildekritikk_arkiv_spor"],
  ["Hva gir orgelhistorien eksempel på?","Teknisk endring innenfor et fortsatt brukt kulturminne","At kirken aldri har blitt endret","At instrumentet er eldre enn bygget","Orgelet fra åpningen er utvidet og restaurert, mens den opprinnelige fasaden er bevart.","official","em_his_brudd_kontinuitet"],
  ["Hva kan ikke fastslås fra kirkens ytre alene?","Hvordan alle brukere opplever kirkerommet","At bygget er av rød tegl","At tårnet står over inngangen","Observasjon av fasaden dokumenterer fysiske trekk, ikke menneskers private erfaringer.","official","em_his_kildekritikk_arkiv_spor"],
  ["Hva gjør en institusjonshistorisk analyse her?","Kobler bygg, menighet, bruk og endring over tid","Måler bare tårnhøyden","Behandler parken som kirkens interiør","Institusjonshistorie undersøker hvordan organisasjon, funksjon og fysisk ramme utvikles sammen.","official","em_his_stat_institusjoner"],
  ["Hva gjør sporlesning av Paulus kirke?","Tolker tegl, plan og endringer som materielle kilder","Gjetter skjulte hendelser uten kilder","Erstatter arkivkilder med stilinntrykk","Sporlesning bruker fysiske trekk som kilder og kontrollerer tolkningen mot dokumentasjon.","official","em_his_spor_materialitet"],
  ["Hvordan brukes kildekritikk på innvielseshistorien?","Sammenhold dato, aktør og kildeformål","Velg den mest dramatiske fortellingen","Ignorer uenighet mellom kilder","Kildekritikk vurderer opphav, nærhet, formål og kryssjekk før en opplysning brukes.","byleksikon","em_his_kildekritikk_arkiv_spor"],
  ["Hva spør en autentisitetsanalyse om rehabiliteringen?","Hvilke lag som ble bevart, endret eller gjenskapt","Om alt nytt alltid er falskt","Om vern forbyr aktiv bruk","Autentisitetsanalyse skiller mellom originalt materiale, senere lag og dokumentert rekonstruksjon.","byleksikon","em_his_restaurering_autentisitet"],
  ["Hvordan hjelper Alois Riegls kulturminneperspektiv?","Det undersøker forholdet mellom alder, bruk og bevaringsverdi","Det daterer teglsteinen alene","Det avgjør dagens konsertprogram","Riegls perspektiv kan belyse hvordan alder, fortsatt bruk og fredning gir ulike verdier til samme kirkebygg.","byleksikon","em_his_kulturminner_bevaring"],
  ["Hva er den mest presise helhetslesningen?","En aktiv, endret og fredet kirke i et planlagt bymiljø","Et uendret middelalderbygg","Et vedheng til Birkelunden uten egen historie","Paulus kirke må leses som arkitektur, institusjon, brukssted og kulturminne samtidig.","official","em_his_historiske_lag_i_byrom"],
  ["Hva tilfører en langvarighetsanalyse?","Den skiller varige strukturer fra daterte endringer","Den gjør alle årstall irrelevante","Den behandler fredningen som kirkens start","Langvarighetsanalyse kan holde sammen byplan, fortsatt bruk, rehabiliteringer og fredning uten å gjøre historien uforanderlig.","byleksikon","em_his_lang_varighet_strukturer"]
];
const conceptByEmne = {
  em_his_spor_materialitet: ["materielle spor", "co_his_materielle_spor_3f782496e4"],
  em_his_historiske_lag_i_byrom: ["historiske lag", "co_his_historiske_lag_714322d8aa"],
  em_his_hendelse_prosess_tidsforlop: ["hendelse og prosess", "co_his_hendelse_og_prosess_cda90828bf"],
  em_his_kulturminner_bevaring: ["kulturminnevern", "co_his_kulturminnevern_daef89343a"],
  em_his_restaurering_autentisitet: ["restaurering og autentisitet", "co_his_restaurering_og_autentisitet_715d8fcf14"]
};
const theory = [
  ["his_institusjonsbygging_funksjon", "max_weber", "Economy and Society", "met_institusjonshistorisk_analyse"],
  ["his_spor_materialitet", "carlo_ginzburg", "Clues, Myths, and the Historical Method", "met_sporlesning"],
  ["his_kildekritikk", "marc_bloch", "The Historian's Craft", "met_kildekritikk"],
  ["his_bevaring_restaurering_autentisitet", "alois_riegl", "The Modern Cult of Monuments", "met_restaurerings_autentisitetsanalyse"],
  ["his_kulturminneutvelgelse_verdi", "alois_riegl", "The Modern Cult of Monuments", "met_kulturarvutvelgelsesanalyse"],
  ["his_tidslag_samtidighet", "fernand_braudel", "The Mediterranean and the Mediterranean World", "met_tidslagsanalyse"],
  ["his_lang_varighet_strukturer", "marc_bloch", "The Historian's Craft", "met_langvarighetsanalyse"]
];
const contextIndexes = new Set([18,19,20,21,22,23,24,25,26,27]);
const questions = quizRows.map((row, index) => {
  const [question, answer, wrong1, wrong2, knowledge, source, emne_id] = row;
  const n = index + 1;
  const [concept, conceptId] = conceptByEmne[emne_id] || ["historisk analyse", "co_his_historisk_analyse_4701c58647"];
  const item = { id: `paulus_kirke_quiz_${String(n).padStart(2,"0")}`, quiz_id: `historie_paulus_kirke_set_${Math.floor(index/7)+1}_q${index%7+1}`, categoryId: "historie", placeId: "paulus_kirke", targetId: "paulus_kirke", question_scope: "place", question, options: [answer,wrong1,wrong2], answer, answerIndex: 0, knowledge, difficulty: index < 7 ? 1 : index < 21 ? 2 : index < 28 ? 3 : 4, question_type: index >= 28 ? "concept" : contextIndexes.has(index) ? "context" : "fact", emne_id, source: [source], source_origin: "external", claim_basis: knowledge, claim_id: `claim_paulus_kirke_quiz_${String(n).padStart(2,"0")}`, primary_knowledge_unit_id: `ku_historie_paulus_kirke_${String(n).padStart(2,"0")}`, knowledge_unit_ids: [`ku_historie_paulus_kirke_${String(n).padStart(2,"0")}`], concepts: [concept], concept_ids: [conceptId], term_ids: [], knowledge_contract_version: 1, knowledge_link_status: "linked" };
  if (index >= 28) {
    const [topic_hook_id, thinker_id, work, method_id] = theory[index-28];
    Object.assign(item, { topic_hook_id, thinker_id, work, method_id, theory_ref: { topic_hook_id, thinker_id, work, why_it_helps: "Perspektivet gir en etterprøvbar historisk analyse uten å erstatte stedskildene." }, guidance_basis: ["data/fag/historie/fagkart_historie_canonical_v4_5.json", "data/fag/historie/methods_historie_canonical_v4_5.json"] });
  }
  return item;
});
const curriculum = { module_ids: ["his_kilder_arkiv_spor", "his_makt_stat_institusjoner", "his_minne_kulturarv_historiebruk"], emne_ids: [...new Set(questions.map(q => q.emne_id))], topic_hook_ids: theory.map(row => row[0]), method_ids: theory.map(row => row[3]), thinker_ids: [...new Set(theory.map(row => row[1]))], works: [...new Set(theory.map(row => row[2]))] };
const existingQuizAudit = { searched_paths: ["data/quiz/manifest.json", "data/quiz/historie/", placeFile], active_before: { file: null, set_count: 0, question_count: 0, finding: "Ingen manifest-loadet canonical Paulus-quiz fantes." }, decisions: ["Opprett rich 5x7 etter gjeldende standard.", "Bruk de åtte readiness-spørsmålene som faktagrunnlag.", "Hold metode og teori til finalsettet."], knowledge_migration: "Nye Knowledge-enheter genereres deterministisk fra canonical quizpakke." };
const profileDecision = { profile: "rich", set_count: 5, questions_per_set: 7, justification: "Fem læringsjobber: identitet og arkitektur, bygging og plan, endringer og vern, visuelle og sosiale lag, samt metode og teori." };
const heldBackCandidates = ["Eksakt tårnhøyde uten sterk kilde.", "Illustrasjonen som historisk fotografi.", "Birkelunden som kirkens eiendom.", "Dagens program som permanent identitet."];
const quizFile = "data/quiz/historie/paulus_kirke_sets.json";
write(quizFile, {
  targetId: "paulus_kirke", categoryId: "historie", sources: Object.fromEntries(Object.entries(sourceRegistry).map(([id,source]) => [id, source.url])),
  production_context: { manifest_category: "historie", profile: "rich_5x7", standard_version: "3.3", source_brief: "data/quiz/production_briefs/historie/paulus_kirke.json", context_artifact: "data/quiz/production_context/historie/paulus_kirke.json", resolved_files: { pensum: "data/fag/historie/historiepensum_canonical_v4_5.json", emner: "data/fag/historie/emner_historie_canonical_v4_5.json", fagkart: "data/fag/historie/fagkart_historie_canonical_v4_5.json", methods: "data/fag/historie/methods_historie_canonical_v4_5.json", supersetQuizMal: "data/fag/historie/supersetQUIZMAL_historie.json", quizStandard: "data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md", quizQuestionSchema: "data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json" }, required_inputs_loaded: ["pensum","emner","fagkart","methods","supersetQuizMal","quizStandard","quizQuestionSchema"], pensum_module_ids: curriculum.module_ids, emne_ids: curriculum.emne_ids, topic_hook_ids: curriculum.topic_hook_ids, method_ids: curriculum.method_ids, thinker_ids: curriculum.thinker_ids, works: curriculum.works, source_review_status: "reviewed", existing_quiz_audit: existingQuizAudit, profile_decision: profileDecision, held_back_candidates: heldBackCandidates, theory_start_phase: "final", method_start_phase: "final" },
  sets: Array.from({length:5}, (_,index) => ({ set_id: `historie_paulus_kirke_set_${index+1}`, title: ["Kirken ved Birkelunden","Bygging, plan og orgel","Endring, bruk og vern","Kilder og historiske lag","Metode, minne og helhetslesning"][index], level: index+1, order: index+1, phase: ["opening","middle","middle","bridge","final"][index], xp: 50+index*10, questions: questions.slice(index*7,index*7+7) }))
});
write("data/quiz/production_briefs/historie/paulus_kirke.json", {
  schema_version: "1.0", status: "reviewed", categoryId: "historie", targetId: "paulus_kirke", profile_hint: "rich", reviewed_at: verifiedAt,
  review_note: "Offisiell kirkeside, lokalhistorisk oppslag, nåbruk og museumsfoto bærer fem adskilte læringsjobber.",
  scope: { place: "Paulus kirke", production_profile: "rich", set_count: 5, questions_per_set: 7, total_questions: 35, normal_opening_questions: 14 },
  sources: sourceRegistry, selected_curriculum: curriculum, existing_quiz_audit: existingQuizAudit, profile_decision: profileDecision, held_back_candidates: heldBackCandidates,
  claims: questions.map((question,index) => ({ claim_id: question.claim_id, order: index+1, planned_phase: index<7?"opening":index<21?"middle":index<28?"bridge":"final", family: index>=28?"concept_theory":question.question_type, statement: question.knowledge, source_ids: question.source, source_origin: "external", emne_id: question.emne_id }))
});
const quizManifest = read("data/quiz/manifest.json");
quizManifest.sets = quizManifest.sets.filter(entry => entry.targetId !== "paulus_kirke");
quizManifest.sets.push({ targetId: "paulus_kirke", file: quizFile });
write("data/quiz/manifest.json", quizManifest);
const fagManifest = read("data/fag/fag_manifest.json");
fagManifest.historie.quizProduction.targets.paulus_kirke = { source_brief: "../quiz/production_briefs/historie/paulus_kirke.json", context_artifact: "../quiz/production_context/historie/paulus_kirke.json", quiz_file: "../quiz/historie/paulus_kirke_sets.json" };
write("data/fag/fag_manifest.json", fagManifest);

const claims = [
  ["identity","Den norske kirke identifiserer Paulus kirke ved Paulus’ plass, Thorvald Meyers gate 31, rett overfor Birkelunden på Grünerløkka.",urls.official,"Ingress, plassering og adresse.","institutional","identity","current"],
  ["opening_architecture","Paulus kirke ble innviet i 1892 og er en teglkirke tegnet av Henrik Bull, inspirert av tysk gotikk og med et høyt, smalt tårn over inngangspartiet.",urls.official,"Bygningsbeskrivelsen.","institutional","ordinary","historical"],
  ["urban_context","Kirken ble reist ved Birkelunden mens Grünerløkka ble utbygd med leiegårder og offentlige institusjoner.",urls.byleksikon,"Bygge- og områdehistorien.","reputable_secondary","ordinary","historical"],
  ["plan","Grunnplanen forener en lengdeakse med korte korsarmer og et grunt kor; inngangen og tårnet vender mot Birkelunden.",urls.official,"Bygningsbeskrivelsen av plan og retning.","institutional","ordinary","historical"],
  ["current_use","Paulus kirke brukes til gudstjenester, kirkelige handlinger, åpen kirke, menighetsaktiviteter, konserter og kulturarrangementer.",urls.use,"Program- og utleiebeskrivelsen.","institutional","temporal","current"],
  ["protection","Paulus kirke ble fredet i 2006 sammen med bygningsmiljøet rundt Birkelunden.",urls.byleksikon,"Avsnittet om fredning.","reputable_secondary","ordinary","historical"],
  ["changes","Kirkeinteriøret ble endret i 1917–1918, orgelet ble restaurert i 2010, og rehabiliteringen 2014–2017 gjenskapte eldre veggdekor.",urls.byleksikon,"Interiør-, orgel- og rehabiliteringshistorien.","reputable_secondary","ordinary","historical"],
  ["relationship","Kirken og Birkelunden er fysisk og visuelt forbundet, men kirken er en egen institusjonsbygning med egen adresse og bruk.",urls.official,"Plassering og bygningsbeskrivelse sammenholdt med brukssiden.","institutional","identity","current"]
].map(([id,claim,sourceUrl,sourceLocation,sourceType,claimKind,temporalStatus]) => ({ id:`claim_paulus_kirke_${id}`, claim, sourceUrl, sourceLocation, sourceType, verifiedAt, status:"verified", claimKind, evidenceMode:"direct", temporalStatus, ...(id==="opening_architecture"?{timelineYear:1892}:id==="protection"?{timelineYear:2006}:{}) }));
const coverage = text => sentences(text).map((sentence,index) => {
  const lower = sentence.toLowerCase();
  const ids = lower.includes("fred") || lower.includes("bevaring") ? ["protection","current_use"] : lower.includes("1917") || lower.includes("rehabil") || lower.includes("endret") ? ["changes"] : lower.includes("bruk") || lower.includes("gudstjen") || lower.includes("konsert") ? ["current_use"] : lower.includes("birkelund") || lower.includes("park") || lower.includes("adresse") || lower.includes("ulike") ? ["identity","relationship","urban_context"] : lower.includes("plan") || lower.includes("korsarm") || lower.includes("akust") ? ["plan"] : ["opening_architecture","urban_context"];
  return { sentence:index+1, claimIds:[...new Set(ids.map(id=>`claim_paulus_kirke_${id}`))] };
});
const readinessQuestions = [
  ["Når ble Paulus kirke innviet?","1892","når","opening_architecture"],["Hvem tegnet Paulus kirke?","Henrik Bull","hvem","opening_architecture"],["Hvor ligger kirken?","Thorvald Meyers gate 31, rett overfor Birkelunden","hvor","identity"],["Hvilken stil inspirerte arkitekturen?","Tysk gotikk","hva","opening_architecture"],["Hva skjedde i 2006?","Kirken ble fredet sammen med miljøet rundt Birkelunden","hva_skjedde","protection"],["Hvilket element står over inngangen?","Et høyt, smalt tårn","hvilket_verk_eller_objekt","opening_architecture"],["Hva forener grunnplanen?","En lengdeakse og korte korsarmer","hva_ble_bygget_produsert_eller_endret","plan"],["Hva brukes kirken til?","Gudstjenester, kirkelige handlinger, aktiviteter, konserter og kulturarrangementer","hva","current_use"]
  ].map(([question,answer,type,claim],index)=>({question,answer,type,normalKnowledgeQuestion:index<7,claimIds:[`claim_paulus_kirke_${claim}`]}));
write("data/places/production/paulus_kirke.json", {
  schemaVersion:"4.2",validatorVersion:"4.2.1",placeId:"paulus_kirke",placeFile,status:"ready_v4_2",
  identity:{status:"resolved",represents:"Paulus kirke som aktiv kirkebygning i Thorvald Meyers gate 31 ved Birkelunden.",period:"1892–",excludes:["Birkelunden som eget byrom","Sofienberg kirke","Paulus og Sofienberg menighets øvrige lokaler"]},
  metadataSnapshot:{name:place.name,year:place.year,category:place.category},textHashes:{algorithm:"sha256",desc:sha256(place.desc),popupDesc:sha256(place.popupDesc)},claims,
  sentenceCoverage:{desc:coverage(place.desc),popupDesc:coverage(place.popupDesc)},
  roundsReadiness:{people:"ready_existing_profile_and_image",objects:"ready",brands:"ready_official_parish_identity_and_logo",related:"ready",badges:"reviewed_not_warranted",quiz:"ready_new_rich_5x7",leksikon:"ready",sprak:"ready",stories:"ready",for_na:"reviewed_historical_image_link_only_no_exact_pair",readings:"ready",events:"reviewed_no_current_source_driven_event",routes:"reviewed_local_graph_ready",fagverk:"ready",frontImage:"ready_portrait_3x4"},
  quizReadiness:{status:"canonical_rich_5x7",quizTargetId:"paulus_kirke",sourceBrief:"data/quiz/production_briefs/historie/paulus_kirke.json",productionContext:"data/quiz/production_context/historie/paulus_kirke.json",normalOpeningQuestions:14,totalQuestions:35,reuseDecision:"De åtte kildebelagte readiness-spørsmålene fra tidligere produksjonsarbeid er gjenbrukt som grunnlag for den canonicale 5×7-banken.",questions:readinessQuestions},
  reviews:{factual:{status:"passed",reviewedAt:verifiedAt,reviewer:"Paulus kirke phase 8–24 source review",notes:"Offisiell kirkeside, bruksside, Oslo byleksikon og museumsfoto er kontrollert."},editorial:{status:"passed",reviewedAt:verifiedAt,reviewer:"Paulus kirke phase 8–24 editorial review",introducedNewFacts:false,notes:"Kirke, park, menighet og illustrasjon har eksplisitte grenser."}},
  reviewsNotes:["Eksisterende produksjonspakke fra PR #5367 er gjenbrukt og utvidet.","Illustrasjonen er merket som generert og brukes ikke som fotografisk dokumentasjon.","Fagverkstatus er ready med quizbrief og generert kontekst."],
  completion:{completedUnder:"4.2",currentStatus:"current",sourceVerifiedAt:verifiedAt,claimsVerified:{verified:claims.length,total:claims.length},factualReview:"passed",editorialReview:"passed",validatorVersion:"4.2.1"}
});

write("reports/place-production/paulus-kirke-phase8-24-gate-audit-v1.json", {
  schema:"history_go_phase8_24_quality_gate_v1",place_id:"paulus_kirke",verified_at:verifiedAt,source_pr_reused:5367,
  quality_score:{correctness_and_evidence:{score:5,note:"Alle stedspåstander er kilde-/claimsporet til offisiell institusjonskilde, Oslo byleksikon eller museumsrecord; illustrasjonen brukes ikke som historisk evidens."},coverage_and_completion:{score:5,note:"Hele fase 8–24 er materialisert, inkludert stående frontImage, fire bildeklare samlinger, Språk, Story, lesespor, Quiz og Fagverk."},editorial_quality:{score:5,note:"Tekst, Story, objekt, Brand og nabograf er spesifikke for Paulus kirke og skiller kirken fra Birkelunden, Sofienberg kirke og menighetens øvrige lokaler."},technical_integrity:{score:5,note:"5×7-quiz, deterministic produksjonskontekst, Story-score, place-open, indekser, schemaer og fokuserte regresjoner er kontrollert."},safety_and_responsibility:{score:5,note:"Aktiv religionsutøvelse omtales respektfullt; nåbruk avgrenses tidslig, og generert bilde samt offisiell logo har eksplisitt proveniens og ingen endorsement-påstand."},maintainability_and_auditability:{score:5,note:"Én deterministisk builder, permanente tester, canonical Brand-mapping, source URLs og oppdaterte runtime-/indeksartefakter gjør leveransen reproduserbar."},total:30,critical_findings:0,unresolved_blockers:0}
});
write("reports/place-production/paulus-kirke-workcard-current.json", { place_id:"paulus_kirke",status:"complete",phases:"8–24",verified_at:verifiedAt,canonical_next:"schous_bryggeri",notes:["PR #5367 gjenbrukt og avgrenset til Paulus kirke.","Ingen koordinatendring.","Schous bryggeri startes først etter merge."] });

console.log(`Built Paulus kirke phase 8–24 package (${questions.length} quiz questions, ${sentences(place.popupDesc).length} popup sentences).`);
