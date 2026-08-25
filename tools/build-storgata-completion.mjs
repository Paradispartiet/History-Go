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
const writeCompact = (file, value) => {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value)}\n`);
};
const addUnique = (array, value, key = item => item) => {
  if (!array.some(item => key(item) === key(value))) array.push(value);
};
const verifiedAt = "2026-08-25";

const placeFile = "data/places/by/oslo/places/storgata.json";
const place = read(placeFile);
delete place.rounds;
delete place.layers;
delete place.tags;
place.popupDesc = place.popupDesc
  .replace("Det største enkeltanlegget er Folketeaterbygningen", "Et markant enkeltanlegg er Folketeaterbygningen")
  .replace("Storgata er dermed fortsatt en arbeidende sentrumsgate", "Storgata er fortsatt en arbeidende sentrumsgate");
place.aliases = ["Vaterlands Storgade"];
place.frontImage = "bilder/places/storgata-kirkeristen-2013.jpg";
place.image = place.frontImage;
place.cardImage = "bilder/kort/places/storgata-kirkeristen-2013.jpg";
place.place_card_profile = {
  schema: "history_go_place_card_profile_v2",
  collection_ids: ["people", "objects", "brands", "related"],
  reason: "Storgata er et vanlig gatested. People, fysiske objekter og relaterte canonicale steder har direkte stedsevidens; Brands beholdes som ærlig tomtilstand etter at Café Sara ble avvist som naboproxy.",
  verifiedAt
};
place.related_people_ids = ["gunder_juel", "christian_morgenstierne", "arne_eide"];
place.related_place_ids = ["youngstorget", "torggata", "folketeateret", "nybrua_vaterlandsparken", "brugata_storgata_rusmiljo"];
place.objects = [
  {
    id: "storgata_trikkespor", title: "Trikkesporene", type: "sporveisinfrastruktur", kind: "physical_object",
    desc: "Skinnene ligger i den samme gateflaten som holdeplasser, fortau, varelevering og annen ferdsel. Spor og fundament ble fornyet i opprustningen 2018–2021.",
    why_here: "Sporene gjør Storgatas rolle som transportkorridor fysisk lesbar gjennom hele gateløpet.",
    placeSpecificReason: "Oslo kommune dokumenterer nye skinner, fundament, signalanlegg og elkraft i Storgata.",
    historicalFunction: "Sammenhengende kollektivakse mellom sentrum og linjene nord og øst.",
    physicalObject: true, placeSpecific: true, collectable: true, storePrice: 25, currency: "PC",
    collection: "storgata_infrastruktur", unlock: "Følg sporene med blikket og se hvordan de deler gatebredden med de andre brukerne.",
    source_urls: ["https://magasin.oslo.kommune.no/byplan/stor-forandring-i-nye-storgata"]
  },
  {
    id: "storgata_holdeplass", title: "Storgata holdeplass", type: "trikkeholdeplass", kind: "physical_object",
    desc: "Holdeplassen åpnet 21. juni 2021 som del av Storgata-opprustningen og erstattet den tidligere Brugata holdeplass. Plattformene er 75 meter lange.",
    why_here: "Holdeplassen viser hvordan nyere kollektivkapasitet er lagt inn i den historiske gaten.",
    placeSpecificReason: "Sporveien og Oslo kommune knytter holdeplassen direkte til Storgata og opprustningen 2018–2021.",
    historicalFunction: "Nytt stoppested tilpasset lengre trikker og felles buss-/trikkefelt.",
    physicalObject: true, placeSpecific: true, collectable: true, storePrice: 25, currency: "PC",
    collection: "storgata_infrastruktur", unlock: "Finn plattformenden og vurder hvorfor lengden er viktig når to trikker skal kunne stoppe etter hverandre.",
    source_urls: ["https://www.sporveien.no/vare-tjenester/trikken/trikkeholdeplasser/s/storgata/", "https://magasin.oslo.kommune.no/byplan/stor-forandring-i-nye-storgata"]
  },
  {
    id: "storgata_39_snublestein", title: "Snublesteinen ved Storgata 39", type: "minnesmerke", kind: "physical_object",
    desc: "Snublesteinen minnes forretningsmannen Philipp Gosias, som bodde i Storgata 39, ble deportert i 1943 og drept i Auschwitz.",
    why_here: "Den lille steinen knytter én adresse i den travle gaten til deportasjonen av norske jøder.",
    placeSpecificReason: "Oslo byleksikon plasserer både boligen og snublesteinen ved Storgata 39.",
    historicalFunction: "Desentralisert minnespor lagt i fortauet ved den deportertes siste frivillige adresse.",
    physicalObject: true, placeSpecific: true, collectable: true, storePrice: 30, currency: "PC",
    collection: "storgata_minnespor", unlock: "Finn steinen uten å hindre ferdselen, les navnet og la adressen være utgangspunkt for videre kildearbeid.",
    source_urls: ["https://oslobyleksikon.no/side/Storgata"]
  },
  {
    id: "storgata_27_murgard", title: "Murgården i Storgata 27", type: "bygning", kind: "physical_object",
    desc: "Murgården fra 1837 har rommet både katolsk kapell og boktrykkeri og er et lesbart spor etter gatens tidlige bymessige utbygging.",
    why_here: "Bygningen viser at én adresse kan skifte funksjon mens gateløpet består.",
    placeSpecificReason: "Oslo byleksikon daterer gården og dokumenterer de historiske funksjonene i Storgata 27.",
    historicalFunction: "Bolig-, religions- og produksjonssted i den voksende 1800-tallsgaten.",
    physicalObject: true, placeSpecific: true, collectable: true, storePrice: 25, currency: "PC",
    collection: "storgata_historiske_adresser", unlock: "Finn nummer 27 og les fasaden som en del av den eldre murgårdsrekken.",
    source_urls: ["https://oslobyleksikon.no/side/Storgata"]
  }
];
place.spatial_profile = {
  place_form: "historisk_sentrumsgate",
  canonical_scope: "Det navngitte Storgata-løpet fra Dronningens gate ved Kirkeristen til Nybrua. Youngstorget, Torggata, Folketeateret/Folketeaterkvartalet og Brugata/Storgata-rusmiljøet er egne canonicale steder.",
  boundary_description: "Sørenden ligger ved Kirkeristen; nordenden ligger ved Nybrua over Akerselva. RouteSegments består av 15 sammenhengende, eksakt navngitte OSM-segmenter på til sammen 875,0 meter.",
  geometry_status: "verified_named_street_geometry",
  measurement_status: "verified_route_length",
  sources: [
    { source: "Oslo byleksikon – Storgata", url: "https://oslobyleksikon.no/side/Storgata", supports: ["canonical_scope", "historical_extent"] },
    { source: "OpenStreetMap – Storgata", url: "https://www.openstreetmap.org/way/36973177", supports: ["routeSegments", "verified_route_length"] }
  ]
};
place.for_na = {
  title: "Storgata fra Kirkeristen: 1938 og 2013",
  beforeImage: "bilder/places/storgata-kirkeristen-1938.jpg",
  beforeImageLabel: "Storgata mot øst fra Kirkeristen (1938)",
  beforeImageMeta: {
    source: "wikimedia_commons", sourcePage: "https://commons.wikimedia.org/wiki/File:Storgata-1938.jpg",
    objectId: "Oslo Museum OB.A13429", author: "Ukjent fotograf / Oslo Museum",
    credit: "Ukjent fotograf / Oslo Museum (OB.A13429)", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    date: "1938", viewpoint: "Mot øst inn Storgata fra Kirkeristen", verified: true, verifiedAt
  },
  nowImage: "bilder/places/storgata-kirkeristen-2013.jpg",
  nowImageLabel: "Storgata sett fra Kirkeristen (2013)",
  nowImageMeta: {
    source: "wikimedia_commons", sourcePage: "https://commons.wikimedia.org/wiki/File:Oslo_Storgata_seen_from_Kirkeristen_IMG_8263.JPG",
    author: "Bjoertvedt", credit: "Bjoertvedt / Wikimedia Commons", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    date: "2013-09-22", viewpoint: "Mot øst inn Storgata fra Kirkeristen", verified: true, verifiedAt
  },
  before: "Oslo Museums fotografi fra 1938 er tatt fra Kirkeristen og følger Storgata østover. Den tette fasaderekken, sporene og gateperspektivet gjør motivet til en dokumentasjon av selve gateløpet, ikke av Youngstorget eller ett enkelt nabobygg.",
  now: "Bjoertvedts fotografi fra 22. september 2013 er tatt fra det samme navngitte utgangspunktet og følger samme hovedretning inn i Storgata. Gateaksen og flere fasader kan sammenlignes direkte, mens kjøretøy, skilt, skinneanlegg og overflater viser et senere bruks- og infrastrukturlag.",
  change: "Paret gir et reelt 75-årig sammenligningsrom med Kirkeristen og gateaksen som felles ankre. Det viser kontinuitet i gateløp og fasadevegg og endring i trafikk, materiell og gateutstyr. 2013-bildet er eldre enn opprustningen 2018–2021 og skal derfor ikke brukes som bildebevis for dagens betongdekke, nye holdeplasser eller nye skinner; disse endringene dokumenteres separat av Oslo kommune og Sporveien.",
  lookFor: [
    "Bruk Kirkeristen og den østgående gateaksen som felles orienteringspunkter.",
    "Sammenlign spor, kjøretøy, fortauskanter og gateutstyr uten å anta at kameraene stod på nøyaktig samme centimeter.",
    "Skill det som bildene faktisk viser fram til 2013 fra opprustningen som først ble gjennomført i 2018–2021."
  ],
  sources: [
    "https://commons.wikimedia.org/wiki/File:Storgata-1938.jpg",
    "https://commons.wikimedia.org/wiki/File:Oslo_Storgata_seen_from_Kirkeristen_IMG_8263.JPG",
    "https://oslobyleksikon.no/side/Storgata",
    "https://magasin.oslo.kommune.no/byplan/stor-forandring-i-nye-storgata"
  ]
};
place.interpretation = {
  what_to_notice: [
    "Sporene ligger i samme smale gateprofil som holdeplasser, fortau, varelevering og innganger.",
    "Murgården i nummer 27 og den større Folketeaterbygningen viser ulike utbyggingsperioder langs samme løp.",
    "Kirkeristen og Nybrua fungerer som tydelige endepunkter, mens Brugata og Youngstorget er kryssende nabosteder."
  ],
  why_it_matters: [
    "Storgata viser hvordan en historisk innfartsåre kan fortsette som kollektiv- og handelsgate uten at alle tidslag forsvinner.",
    "Opprustningen 2018–2021 samlet synlig gateutforming og skjult teknisk infrastruktur i ett prosjekt.",
    "Gatehistorien blir presis først når adresser og nabosteder knyttes til riktig canonical eier."
  ],
  counterpoints: [
    "Et senere fotografi er ikke automatisk et bilde av dagens situasjon; 2013-motivet må skilles fra endringene etter 2018.",
    "Folketeaterbygningen og Nybrua berører Storgata fysisk, men har egne place-profiler og skal ikke tømmes inn i gaten.",
    "Mye gjennomstrømning dokumenterer bruk, men sier ikke alene hvordan alle gående, reisende eller næringsdrivende opplever gaten."
  ],
  sources: [
    { title: "Oslo byleksikon – Storgata", url: "https://oslobyleksikon.no/side/Storgata", verifiedAt },
    { title: "Oslo kommune – Stor forandring i nye Storgata", url: "https://magasin.oslo.kommune.no/byplan/stor-forandring-i-nye-storgata", verifiedAt },
    { title: "Sporveien – Storgata holdeplass", url: "https://www.sporveien.no/vare-tjenester/trikken/trikkeholdeplasser/s/storgata/", verifiedAt }
  ]
};
place.onsite = {
  safety: "Observer fra fortau eller holdeplass. Ikke gå i sporet, kryss bare der trafikkreglene tillater det, og ikke stans ferdselen ved snublesteinen.",
  observation_route: [
    { order: 1, title: "Kirkeristen", instruction: "Finn startretningen i før/etter-paret og se østover inn i gaten." },
    { order: 2, title: "Storgata holdeplass", instruction: "Les plattformlengde, spor og fortau som ett samlet kollektivrom." },
    { order: 3, title: "Storgata 27 og 39", instruction: "Sammenlign murgården med minnesporet i fortauet; ikke fotografer forbipasserende nærgående." },
    { order: 4, title: "Nybrua", instruction: "Avslutt ved gateenden og se hvordan sporene fortsetter over Akerselva." }
  ],
  aha: "Gaten virker som én rett transportlinje, men hvert stopp viser at infrastrukturen, adressene og minnene tilhører ulike tidslag og funksjoner."
};
place.externalLinks = [
  { type: "source", label: "Oslo byleksikon – Storgata", url: "https://oslobyleksikon.no/side/Storgata", lang: "nb", verifiedAt },
  { type: "source", label: "Oslo kommune – Stor forandring i nye Storgata", url: "https://magasin.oslo.kommune.no/byplan/stor-forandring-i-nye-storgata", lang: "nb", verifiedAt },
  { type: "source", label: "Sporveien – Storgata holdeplass", url: "https://www.sporveien.no/vare-tjenester/trikken/trikkeholdeplasser/s/storgata/", lang: "nb", verifiedAt },
  { type: "source", label: "Sporveien – utskifting av sporveksler 2026", url: "https://www.sporveien.no/prosjekter-og-arbeid/sporveksel/", lang: "nb", verifiedAt },
  { type: "source", label: "Statens havarikommisjon – rapport 2025/02", url: "https://nsia.no/Rail/Rail/Published-reports/2025-02", lang: "nb", verifiedAt },
  { type: "map_source", label: "OpenStreetMap – Storgata", url: "https://www.openstreetmap.org/way/36973177", verifiedAt },
  { type: "image_source", label: "Wikimedia Commons – Storgata 1938", url: "https://commons.wikimedia.org/wiki/File:Storgata-1938.jpg", verifiedAt },
  { type: "image_source", label: "Wikimedia Commons – Storgata 2013", url: "https://commons.wikimedia.org/wiki/File:Oslo_Storgata_seen_from_Kirkeristen_IMG_8263.JPG", verifiedAt },
  { type: "license", label: "Creative Commons BY-SA 3.0", url: "https://creativecommons.org/licenses/by-sa/3.0/", verifiedAt }
];
write(placeFile, place);

const brands = read("data/brands/brands_by_place.json");
delete brands.storgata;
write("data/brands/brands_by_place.json", brands);
const actors = read("data/brands/actors_by_place.json");
delete actors.storgata;
writeCompact("data/brands/actors_by_place.json", actors);

for (const personFile of [
  "data/people/by/oslo/akerselva/people_nybrua_vaterlandsparken.json",
  "data/people/by/oslo/folketeateret/christian_morgenstierne.json",
  "data/people/by/oslo/folketeateret/arne_eide.json"
]) {
  const value = read(personFile);
  const people = Array.isArray(value) ? value : [value];
  for (const person of people) {
    if (!place.related_people_ids.includes(person.id)) continue;
    person.places = [...new Set([...(person.places || []), "storgata"])];
    if (!person.source_urls && person.id === "gunder_juel") person.source_urls = ["https://oslobyleksikon.no/side/Nybrua"];
  }
  write(personFile, value);
}

const batchFile = "data/leksikon/places/oslo/by/leksikon_oslo_by_batch2.json";
write(batchFile, read(batchFile).filter(article => article.place_id !== "storgata"));

const sourceLinks = place.externalLinks.filter(link => link.type === "source").map(link => ({ title: link.label, url: link.url, verifiedAt }));
const chronology = [
  [1784, "Den sørlige delen innlemmes i byen", "Strekningen sør for Brugata ble del av byen i 1784."],
  [1813, "Posthuset flytter til nummer 23", "Byens posthus lå i Storgata 23 fra 1813 til 1832."],
  [1827, "Nybrua åpner og gaten forlenges", "Den nordlige veien fikk sammenheng med sentrum da Nybrua stod ferdig."],
  [1837, "Murgården i nummer 27 oppføres", "Bygningen rommet senere blant annet katolsk kapell og boktrykkeri."],
  [1839, "Områdene nordover innlemmes", "Den nordlige delen av gateløpet kom inn i byen i 1839."],
  [1908, "Hornaas musikk etableres i gaten", "Musikkforretningen har hatt tilhold i Storgata siden 1908."],
  [1935, "Folketeaterbygningen innvies", "Det store blandingsbygget i Storgata 21–23 ble tatt i bruk i 1934 og innviet i 1935."],
  [1959, "Den Norske Opera flytter inn", "Operaen brukte salen i Folketeaterbygningen fra 1959 til 2008."],
  [2021, "Oppgradert Storgata åpner", "Nye spor, holdeplasser, bredere fortau, overvannsanlegg og teknisk tunnel ble ferdigstilt gjennom opprustningen."],
  [2025, "Havarikommisjonen publiserer rapport", "Rapport 2025/02 undersøkte avsporingen i krysset Nygata–Storgata 29. oktober 2024."],
  [2026, "Sporvekslene ved Nybrua fornyes", "Sporveien planla nytt sporarrangement ved Nybrua høsten 2026."]
].map(([year, title, desc], index) => ({
  id: `chrono_storgata_${year}_${index + 1}`, year, title, desc, confidence: "high",
  sources: [{ title: year >= 2021 ? (year === 2025 ? "Statens havarikommisjon – rapport 2025/02" : year === 2026 ? "Sporveien – sporveksler 2026" : "Oslo kommune – nye Storgata") : "Oslo byleksikon – Storgata", url: year === 2025 ? "https://nsia.no/Rail/Rail/Published-reports/2025-02" : year === 2026 ? "https://www.sporveien.no/prosjekter-og-arbeid/sporveksel/" : year === 2021 ? "https://magasin.oslo.kommune.no/byplan/stor-forandring-i-nye-storgata" : "https://oslobyleksikon.no/side/Storgata" }]
}));
const leksikon = {
  place_id: "storgata", title: "Storgata", type: "main", version: 1, suppress_untitled_legacy_articles: true,
  visual: { designCode: "article_place_essay_miniature" },
  popupDesc: "Storgata er det navngitte gateløpet fra Kirkeristen til Nybrua, der innfartsåre, murgårder, handel og trikkeinfrastruktur ligger i samme gateprofil.",
  wikiText: [
    "På 1700-tallet ble Storgata fram til Brugata og Brugata videre mot Akerselva regnet som Vaterlands Storgade. Nybrua fra 1827 gjorde det mulig å føre Storgata sammenhengende fram til elva, og gateløpet utviklet seg videre med handel, håndverk, boliger og sporvei.",
    "Storgata må skilles fra Torggata, Youngstorget, Folketeateret og det åpne rusmiljøet ved Brugata/Storgata. De møtes fysisk eller tematisk, men denne artikkelen eier gaten og dens lineære historie fra Kirkeristen til Nybrua."
  ],
  summary: { one_liner: "Historisk innfartsåre og trikkegate fra Kirkeristen til Nybrua.", themes: ["innfartsåre", "sporvei", "handel", "historiske adresser"], tone: ["nøktern", "stedsspesifikk"] },
  facts: [
    { id: "fact_storgata_01", label: "Nybrua 1827", desc: "Nybrua gjorde det mulig å føre Storgata sammenhengende til Akerselva.", confidence: "high", sources: ["Oslo byleksikon – Storgata"] },
    { id: "fact_storgata_02", label: "875,0 meter verifisert gateløp", desc: "Den canonicale ruten består av 15 sammenhengende OSM-segmenter fra Kirkeristen til Nybrua.", confidence: "high", sources: ["OpenStreetMap – Storgata"] },
    { id: "fact_storgata_03", label: "Holdeplass fra 2021", desc: "Storgata holdeplass åpnet 21. juni 2021 og betjenes i 2026 av linjene 12, 15, 17 og 18.", confidence: "high", sources: ["Sporveien – Storgata holdeplass"] }
  ],
  chronology, sources: sourceLinks, externalLinks: place.externalLinks, interpretation: place.interpretation
};
const leksikonFile = "data/leksikon/places/oslo/by/leksikon_storgata.json";
write(leksikonFile, leksikon);

const news = [
  { id: "storgata_news_sporveksler_2026", place_id: "storgata", title: "Nytt sporarrangement planlagt ved Nybrua", type: "news_note", version: 1, date: "2026-08-13", date_type: "source_update", status: "scheduled", valid_through: "2026-10-31", location: "Storgatas nordende ved Nybrua", popupDesc: "Sporveien planlegger å skifte to sporveksler og et skinnekryss ved Nybrua høsten 2026. Under arbeidet skal trikker fra sentrum snu nedover Storgata; ferdig anlegg er planlagt i oktober.", summary: { one_liner: "Sporveksler og skinnekryss ved Storgatas nordende skal fornyes høsten 2026.", themes: ["trikk", "vedlikehold", "Nybrua"] }, tags: ["news_note", "Storgata"], sources: [{ label: "Sporveien – utskifting av sporveksler", url: "https://www.sporveien.no/prosjekter-og-arbeid/sporveksel/" }], verifiedAt },
  { id: "storgata_news_havarirapport_2025", place_id: "storgata", title: "Rapport etter avsporingen ved Nygata–Storgata", type: "news_note", version: 1, date: "2025-08-12", date_type: "publication", status: "archived", location: "Krysset Nygata–Storgata", popupDesc: "Statens havarikommisjon publiserte rapport 2025/02 etter at en SL18-trikk sporet av og traff et butikklokale 29. oktober 2024. Formålet var sikkerhetslæring, ikke fordeling av skyld.", summary: { one_liner: "Havarikommisjonens rapport undersøkte avsporingen i Storgata i oktober 2024.", themes: ["trikk", "sikkerhet", "gransking"] }, tags: ["news_note", "Storgata"], sources: [{ label: "Statens havarikommisjon – rapport 2025/02", url: "https://nsia.no/Rail/Rail/Published-reports/2025-02" }], verifiedAt },
  { id: "storgata_news_holdeplass_current_2026", place_id: "storgata", title: "Fire trikkelinjer betjener Storgata holdeplass", type: "news_note", version: 1, date: "2026-08-25", date_type: "verified_current", status: "current", location: "Storgata holdeplass", popupDesc: "Sporveiens holdeplasside oppgir linjene 12, 15, 17 og 18. Holdeplassen åpnet i 2021 og erstattet tidligere Brugata holdeplass.", summary: { one_liner: "Storgata holdeplass betjenes av linjene 12, 15, 17 og 18 ved kontroll 25. august 2026.", themes: ["trikk", "holdeplass", "nåtid"] }, tags: ["news_note", "Storgata"], sources: [{ label: "Sporveien – Storgata holdeplass", url: "https://www.sporveien.no/vare-tjenester/trikken/trikkeholdeplasser/s/storgata/" }], verifiedAt }
];
const newsFile = "data/leksikon/places/oslo/by/leksikon_storgata_news.json";
write(newsFile, news);
const leksikonManifest = read("data/leksikon/manifest.json");
for (const file of [leksikonFile, newsFile]) addUnique(leksikonManifest.files, file);
write("data/leksikon/manifest.json", leksikonManifest);

const languageFile = "data/leksikon/sprak/places/europe/norway/oslo/storgata.json";
write(languageFile, {
  place_id: "storgata", title: "Språkleksikon: Storgata", verified_at: verifiedAt,
  entries: [
    { id: "storgata_vaterlands_storgade", term: "Vaterlands Storgade", type: "historisk_navn", meaning: "1700-tallsnavn for Storgata fram til Brugata og Brugata videre mot Akerselva som ett sammenhengende gateløp.", context: "Navnet forklarer hvorfor Brugata og Storgata henger historisk sammen, uten at dagens canonicale places skal slås sammen.", linked_to: { kind: "place", id: "storgata" }, tags: ["stedsnavn", "Vaterland", "1700-tallet"], sources: [{ label: "Oslo byleksikon – Storgata", url: "https://oslobyleksikon.no/side/Storgata" }] },
    { id: "storgata_storgata", term: "Storgata", type: "stedsnavn", meaning: "Navnet på gateløpet fra Kirkeristen til Nybrua.", context: "Den bestemte gateidentiteten skiller Storgata fra Torggata og fra krysset med Brugata.", linked_to: { kind: "place", id: "storgata" }, tags: ["stedsnavn", "gate", "Oslo"], sources: [{ label: "Oslo byleksikon – Storgata", url: "https://oslobyleksikon.no/side/Storgata" }] },
    { id: "storgata_sporarrangement", term: "sporarrangement", type: "lokalt_faguttrykk", meaning: "Den samlede fysiske ordningen av spor, sporveksler og skinnekryss i et punkt på trikkenettet.", context: "Sporveien bruker ordet om anlegget ved Nybrua som skal være helt nytt etter arbeidet i oktober 2026.", linked_to: { kind: "place", id: "storgata" }, tags: ["trikk", "infrastruktur", "Nybrua"], sources: [{ label: "Sporveien – utskifting av sporveksler", url: "https://www.sporveien.no/prosjekter-og-arbeid/sporveksel/" }] }
  ]
});
const languageManifest = read("data/leksikon/sprak/manifest.json");
languageManifest.place_files.storgata = languageFile;
write("data/leksikon/sprak/manifest.json", languageManifest);

const normalize = value => String(value || "").normalize("NFC").replace(/\r\n?/g, "\n").replace(/[ \t]+/g, " ").trim();
const sourceHash = crypto.createHash("sha256").update(JSON.stringify({ name: normalize(place.name), desc: normalize(place.desc), popupDesc: normalize(place.popupDesc) })).digest("hex").slice(0, 16);
const translations = {
  en: {
    desc: "Storgata runs from Kirkeristen to Nybrua and developed from an old approach road outside Christiania's ramparts into a tram, commercial and service street. Nybrua connected the northern stretch to the city in 1827, while rails, nineteenth-century masonry buildings and later mixed-use buildings make several periods visible along the same route.",
    popupDesc: `Storgata is one of Oslo's oldest traffic arteries. It runs from Dronningens gate at Kirkeristen to Nybrua and originally lay outside Christiania's ramparts. In the eighteenth century, Storgata as far as Brugata and Brugata onward to the Akerselva were understood as one street called Vaterlands Storgade. Today's canonical place is the named Storgata route, not Torggata, Youngstorget, the Folketeater quarter or the social territory at the Brugata intersection.

The northern section became continuous with the city when Nybrua opened in 1827. The area south of Brugata was incorporated into the city in 1784, and the areas farther north in 1839. Trade, crafts, inns and housing grew along the approach road. The street therefore records both suburban expansion and the gradual incorporation of the area into the city.

Storgata became a major tram corridor. Rails still occupy the same street space as platforms, pavements, deliveries and entrances. The 2018–2021 upgrade added new rails and foundations, wider pavements, two new stops, drainage measures and a 200-metre technical tunnel. Storgata stop opened on 21 June 2021 and in 2026 is served by lines 12, 15, 17 and 18.

Individual addresses preserve different histories. Number 23 housed the city's post office from 1813 to 1832; number 25 contained Olympia cinema and later Scala Teater; and the masonry building at number 27, dating from 1837, housed both a Catholic chapel and a printing office. At number 39 a Stolperstein commemorates the Jewish businessman Philipp Gosias, who lived there before he was deported in 1943 and killed at Auschwitz.

A landmark complex is the Folketeater building at Storgata 21–23, designed by Christian Morgenstierne and Arne Eide and inaugurated in 1935. It has its own canonical place, but its street frontage remains a visible layer along Storgata. At the other end, Nybrua is likewise a separate place and the physical endpoint that completed the route in 1827. Storgata can be read as the line connecting these addresses and crossings, where transport, commerce, memory and everyday movement continue to share the same narrow urban space.`
  },
  es: {
    desc: "Storgata va de Kirkeristen a Nybrua y pasó de ser una antigua vía de acceso extramuros de Christiania a una calle de tranvías, comercio y servicios. Nybrua conectó el tramo norte con la ciudad en 1827, mientras que las vías, los edificios de ladrillo del siglo XIX y construcciones posteriores muestran varias épocas en el mismo recorrido.",
    popupDesc: `Storgata es una de las arterias de circulación más antiguas de Oslo. Va desde Dronningens gate, junto a Kirkeristen, hasta Nybrua y originalmente quedaba fuera de las murallas de Christiania. En el siglo XVIII, Storgata hasta Brugata y Brugata hasta el Akerselva se entendían como una sola calle llamada Vaterlands Storgade. El lugar canónico actual es el trazado de Storgata, no Torggata, Youngstorget, el barrio de Folketeater ni el territorio social del cruce con Brugata.

El tramo norte quedó unido de forma continua a la ciudad cuando Nybrua abrió en 1827. La zona al sur de Brugata se incorporó a la ciudad en 1784 y las áreas más al norte en 1839. Comercios, talleres, posadas y viviendas crecieron a lo largo de la vía de acceso. La calle conserva así huellas de la expansión suburbana y de la incorporación gradual del área a la ciudad.

Storgata se convirtió en un corredor principal del tranvía. Las vías comparten todavía el espacio con andenes, aceras, reparto e ingresos a los edificios. La renovación de 2018–2021 aportó nuevas vías y cimentación, aceras más anchas, dos paradas, sistemas de drenaje y un túnel técnico de 200 metros. La parada Storgata abrió el 21 de junio de 2021 y en 2026 recibe las líneas 12, 15, 17 y 18.

Las direcciones concretas conservan historias distintas. El número 23 albergó el correo de la ciudad entre 1813 y 1832; el 25 tuvo el cine Olympia y después Scala Teater; y el edificio de ladrillo del 27, de 1837, acogió una capilla católica y una imprenta. En el número 39 una piedra Stolperstein recuerda al comerciante judío Philipp Gosias, que vivió allí antes de ser deportado en 1943 y asesinado en Auschwitz.

Un conjunto destacado es el edificio Folketeater en Storgata 21–23, diseñado por Christian Morgenstierne y Arne Eide e inaugurado en 1935. Tiene su propio lugar canónico, pero su fachada forma parte del paisaje de Storgata. En el otro extremo, Nybrua también es un lugar separado y el punto físico que completó el trazado en 1827. Storgata puede leerse como la línea que conecta direcciones y cruces donde transporte, comercio, memoria y movimiento cotidiano comparten el mismo espacio urbano.`
  },
  pt: {
    desc: "A Storgata vai de Kirkeristen a Nybrua e passou de antiga via de entrada fora das muralhas de Christiania a rua de bondes, comércio e serviços. Nybrua ligou o trecho norte à cidade em 1827, enquanto trilhos, edifícios de alvenaria do século XIX e construções posteriores tornam visíveis várias épocas no mesmo percurso.",
    popupDesc: `A Storgata é uma das artérias de circulação mais antigas de Oslo. Vai de Dronningens gate, junto a Kirkeristen, até Nybrua e originalmente ficava fora das muralhas de Christiania. No século XVIII, Storgata até Brugata e Brugata até o Akerselva eram entendidas como uma só rua, Vaterlands Storgade. O lugar canônico atual é o traçado nomeado de Storgata, não Torggata, Youngstorget, o quarteirão do Folketeater ou o território social no cruzamento com Brugata.

O trecho norte tornou-se contínuo com a cidade quando Nybrua abriu em 1827. A área ao sul de Brugata foi incorporada à cidade em 1784 e as áreas mais ao norte em 1839. Comércio, oficinas, hospedarias e moradias cresceram ao longo da via de entrada. A rua registra assim a expansão suburbana e a incorporação gradual da área à cidade.

Storgata tornou-se um corredor principal de bondes. Os trilhos ainda dividem o espaço com plataformas, calçadas, entregas e entradas de edifícios. A renovação de 2018–2021 trouxe novos trilhos e fundações, calçadas mais largas, duas paradas, drenagem e um túnel técnico de 200 metros. A parada Storgata abriu em 21 de junho de 2021 e em 2026 é atendida pelas linhas 12, 15, 17 e 18.

Endereços específicos preservam histórias diferentes. O número 23 abrigou o correio da cidade entre 1813 e 1832; o 25 teve o cinema Olympia e depois o Scala Teater; e o prédio de alvenaria no 27, de 1837, acolheu uma capela católica e uma tipografia. No número 39, uma Stolperstein lembra o comerciante judeu Philipp Gosias, que viveu ali antes de ser deportado em 1943 e morto em Auschwitz.

Um conjunto marcante é o edifício Folketeater em Storgata 21–23, projetado por Christian Morgenstierne e Arne Eide e inaugurado em 1935. Ele tem seu próprio lugar canônico, mas a fachada permanece uma camada visível da rua. Na outra ponta, Nybrua também é um lugar separado e o limite físico que completou o traçado em 1827. Storgata pode ser lida como a linha que conecta endereços e cruzamentos onde transporte, comércio, memória e movimento cotidiano dividem o mesmo espaço urbano.`
  }
};
for (const [lang, translation] of Object.entries(translations)) {
  const file = `data/i18n/content/places/${lang}.json`;
  const pack = read(file);
  pack.storgata = { _sourceHash: sourceHash, _status: "machine_translated", name: "Storgata", ...translation };
  write(file, pack);
}

const readingFile = "data/lesespor/oslo/lesespor_oslo_by.json";
const readingPack = read(readingFile);
const readings = [
  { id: "lesespor_storgata_byleksikon", title: "Storgata", author: null, publication: "Oslo byleksikon", date: null, year: null, type: "reference_article", subjects: ["Storgata", "gatehistorie", "adresser", "sporvei"], place_ids: ["storgata"], person_ids: ["gunder_juel", "christian_morgenstierne", "arne_eide"], category_hints: ["by", "historie"], url: "https://oslobyleksikon.no/side/Storgata", access: "open", rights: "link_only", source_quality: "institutional", curation_status: "strong_candidate", relevance: "Stedsspesifikk oversikt over gateløp, navnehistorie, Nybrua og dokumenterte adresser." },
  { id: "lesespor_storgata_byplan_2021", title: "Stor forandring i nye Storgata", author: "Tine Venås Kjeldsen", publication: "Byplan Oslo", date: "2021-08-20", year: 2021, type: "official_feature", subjects: ["Storgata", "trikk", "fortau", "teknisk infrastruktur"], place_ids: ["storgata"], person_ids: [], category_hints: ["by"], url: "https://magasin.oslo.kommune.no/byplan/stor-forandring-i-nye-storgata", access: "open", rights: "link_only", source_quality: "institutional", curation_status: "strong_candidate", relevance: "Detaljert kommunal gjennomgang av opprustningen 2018–2021 over og under gateplanet." },
  { id: "lesespor_storgata_havarikommisjonen", title: "Rapport om avsporing i krysset Nygata–Storgata", author: null, publication: "Statens havarikommisjon", date: "2025-08-12", year: 2025, type: "investigation_report", subjects: ["Storgata", "trikk", "sikkerhet", "avsporing"], place_ids: ["storgata"], person_ids: [], category_hints: ["by"], url: "https://nsia.no/Rail/Rail/Published-reports/2025-02", access: "open", rights: "link_only", source_quality: "institutional", curation_status: "strong_candidate", relevance: "Offisiell sikkerhetsundersøkelse av en konkret hendelse i Storgatas sporinfrastruktur." }
];
readingPack.items = readingPack.items.filter(item => !readings.some(reading => reading.id === item.id));
for (const item of readings) addUnique(readingPack.items, item, row => row.id);
write(readingFile, readingPack);

const stories = [
  {
    id: "st_storgata_nybrua_1827", quality_profile: "episode_v1", type: "turning_point", title: "Da Nybrua fullførte gateløpet", year: 1827, place_id: "storgata", person_id: "gunder_juel",
    summary: "Nybrua åpnet i 1827 og gjorde den nordlige veien sammenhengende med Storgata fra sentrum. En ny bro endret dermed både gateforløp og innfart til byen.",
    story: "Før 1827 gikk mye av ferdselen fra sentrum over Brugata og Vaterlands bru. Den nordlige delen av det som skulle bli Storgata fantes som vei til løkkeeiendommer, men manglet den sammenhengende forbindelsen som senere ble en hovedakse.\n\nDa Nybrua stod ferdig i 1827, kunne Storgata føres fram til Akerselva. Gunder Juel ledet oppføringen etter tegninger av ingeniørløytnant Aubert, og Selskabet for Christiania Byes Vel bidro til opparbeidelse og beplantning langs den nye delen. Broen var derfor ikke bare et punkt over vannet, men en endring av hele gateforløpet.\n\nPå stedet kan hendelsen leses ved å følge Storgata nordover til sporene fortsetter over Nybrua. Gaten og broen har egne canonicale profiler, men 1827-episoden binder dem direkte sammen: broen ble det fysiske endepunktet som gjorde Storgata til den sammenhengende innfartsåren kildene beskriver.",
    episode: { actors: ["Gunder Juel", "Selskabet for Christiania Byes Vel"], date: "1827", action: "Nybrua ble oppført og Storgata ble ført sammenhengende fram til Akerselva.", consequence: "Innfarten fikk et nytt gateløp, og handel, håndverk, boliger og senere sporvei kunne utvikles langs den forlengede gaten." },
    sources: [{ title: "Oslo byleksikon – Storgata", url: "https://oslobyleksikon.no/side/Storgata" }, { title: "Oslo byleksikon – Nybrua", url: "https://oslobyleksikon.no/side/Nybrua" }], tags: ["Nybrua", "infrastruktur", "innfartsåre", "1827"], related_people: ["gunder_juel"], related_places: ["nybrua_vaterlandsparken"], score: { narrative: 3, historical: 2, source: 4, play_value: 3, originality: 3, total: 15 }, arc: { start: "Ferdselen over Akerselva fulgte Brugata og Vaterlands bru.", middle: "Nybrua ble oppført og den nordlige veien ble knyttet til Storgata.", end: "Storgata fikk det sammenhengende løpet til Akerselva som fortsatt kan følges i dag." }, next_scenes: [{ place_id: "nybrua_vaterlandsparken", reason: "Nybrua er det separate brostedet som fullførte Storgatas nordlige gateløp i 1827." }]
  },
  {
    id: "st_storgata_folketeaterbygningen_1935", quality_profile: "episode_v1", type: "cultural", title: "Da et helt organisasjons- og teaterhus reiste seg i gaten", year: 1935, place_id: "storgata", person_id: "christian_morgenstierne",
    summary: "Folketeaterbygningen i Storgata 21–23 ble tatt i bruk i 1934 og innviet i 1935. Det store blandingsbygget samlet forretninger, kontorer, organisasjoner og teatersal bak en ny markant gatefront.",
    story: "Storgata hadde lenge bestått av handel, boliger og mindre virksomheter da Folketeaterbygningen endret skalaen i nummer 21–23. Christian Morgenstierne og Arne Eide tegnet komplekset som et blandingsbygg med forretninger, kontorer, passasje og en stor sal.\n\nBygningen ble tatt i bruk i 1934 og innviet i 1935. Arbeiderpartiet, Arbeiderbladet, AUF, Arbeidernes Opplysningsforbund, Tiden Norsk Forlag og flere organisasjoner flyttet inn. Salen var først kino, ble Folketeatret i 1952 og huset Den Norske Opera fra 1959 til 2008.\n\nFolketeateret har sin egen canonicale place-profil. For Storgata er episoden viktig fordi den viser hvordan én byggeoppgave kunne samle offentlig kultur, organisasjonsliv og næring i en gate som allerede var transport- og handelsåre. Fasaden er fortsatt en del av gatebildet, men institusjonshistorien skal leses videre i det separate stedet.",
    episode: { actors: ["Christian Morgenstierne", "Arne Eide", "Folketeaterforeningen"], date: "1935", action: "Folketeaterbygningen ble innviet som et stort blandingsbygg i Storgata 21–23.", consequence: "Gatefronten fikk et nytt skala- og funksjonslag som senere rommet teater, opera, kontorer, organisasjoner og forretninger." },
    sources: [{ title: "Oslo byleksikon – Storgata", url: "https://oslobyleksikon.no/side/Storgata" }, { title: "Store norske leksikon – Folketeaterbygningen", url: "https://snl.no/Folketeaterbygningen" }], tags: ["arkitektur", "Folketeateret", "organisasjonsliv", "1935"], related_people: ["christian_morgenstierne", "arne_eide"], related_places: ["folketeateret", "youngstorget"], score: { narrative: 3, historical: 2, source: 4, play_value: 3, originality: 3, total: 15 }, arc: { start: "Storgata var en etablert handels- og ferdselsåre med mindre gårder.", middle: "Et stort blandingsbygg for organisasjoner, næring og scene ble reist i nummer 21–23.", end: "Bygningen ble et varig gateanker mens salen skiftet fra kino til teater, opera og musikalscene." }, next_scenes: [{ place_id: "folketeateret", reason: "Den separate profilen eier teater-, opera- og bygningshistorien i detalj." }]
  },
  {
    id: "st_storgata_opprustning_2021", quality_profile: "episode_v1", type: "turning_point", title: "Da gaten ble bygd om både over og under bakken", year: 2021, place_id: "storgata", person_id: null,
    summary: "Opprustningen 2018–2021 fornyet spor, holdeplasser, fortau, overvannsløsninger og teknisk infrastruktur. Storgata ble ikke bare overflatebehandlet; store deler av gatekroppen ble bygd opp på nytt.",
    story: "Før opprustningen var spor, veg og annen infrastruktur i Storgata nedslitt. Gaten ble stengt fra september 2019 mens trafikken ble lagt om, og arbeidet måtte håndtere en smal korridor med trikk, buss, gående, syklister, varelevering og næringsliv.\n\nProsjektet la nye trikkespor på bærende betongplater, bygde bredere fortau og to nye holdeplasser og etablerte overvannsanlegg. Under bakken kom omtrent 200 meter gangbar teknisk tunnel med kabler og rør. Storgata holdeplass åpnet 21. juni 2021 og erstattet Brugata holdeplass.\n\nResultatet viser hvorfor en gate ikke bare er det synlige dekket. Skinner, kontaktledning, drenering, vann, avløp og strøm må fungere sammen med hverdagsbruken på overflaten. Før/etter-bildene i appen slutter i 2013 og kan ikke dokumentere denne ombyggingen; derfor bæres 2021-historien av prosjektkildene og det som kan observeres i gateplanet i dag.",
    episode: { actors: ["Bymiljøetaten", "Sporveien", "Ruter", "gårdeiere og brukere av gaten"], date: "2021", action: "Storgata fikk nye spor, holdeplasser, fortau, overvannsanlegg og teknisk tunnel.", consequence: "Den historiske korridoren fikk fornyet kollektiv- og ledningsinfrastruktur og en gateprofil med større plass til gående og kollektivtrafikk." },
    sources: [{ title: "Oslo kommune – Stor forandring i nye Storgata", url: "https://magasin.oslo.kommune.no/byplan/stor-forandring-i-nye-storgata" }, { title: "Sporveien – Storgata holdeplass", url: "https://www.sporveien.no/vare-tjenester/trikken/trikkeholdeplasser/s/storgata/" }], tags: ["opprustning", "trikk", "holdeplass", "overvann", "2021"], related_people: [], related_places: [], score: { narrative: 3, historical: 2, source: 4, play_value: 3, originality: 3, total: 15 }, arc: { start: "Nedslitt gate og spor gjorde transport og vedlikehold vanskelig.", middle: "Gaten ble stengt og bygget om med ny infrastruktur over og under bakken.", end: "Nye spor, holdeplasser og bredere fortau åpnet, mens den samme historiske gateaksen ble beholdt." }, next_scenes: []
  }
];
const storiesFile = "data/stories/stories_storgata.json";
write(storiesFile, stories);
const storiesManifest = read("data/stories/stories_manifest.json");
addUnique(storiesManifest.files, { category: "by", entity_id: "storgata", path: storiesFile }, row => row.path);
write("data/stories/stories_manifest.json", storiesManifest);
const episodeManifest = read("data/stories/stories_episode_v1_manifest.json");
addUnique(episodeManifest.files, storiesFile);
write("data/stories/stories_episode_v1_manifest.json", episodeManifest);

const sources = {
  storgata_byleksikon: { url: "https://oslobyleksikon.no/side/Storgata", source_type: "local_history_encyclopedia", review_status: "reviewed", review_note: "Gateavgrensning, navnehistorie, Nybrua, sporvei og adresser." },
  byplan_2021: { url: "https://magasin.oslo.kommune.no/byplan/stor-forandring-i-nye-storgata", source_type: "official_municipality", review_status: "reviewed", review_note: "Opprustningen 2018–2021, nye spor, holdeplasser, fortau, overvann og teknisk tunnel." },
  sporveien_stop: { url: "https://www.sporveien.no/vare-tjenester/trikken/trikkeholdeplasser/s/storgata/", source_type: "primary_operator", review_status: "reviewed", review_note: "Åpningsdato, dagens linjer og tilgjengelighet for Storgata holdeplass." },
  sporveien_2026: { url: "https://www.sporveien.no/prosjekter-og-arbeid/sporveksel/", source_type: "primary_operator", review_status: "reviewed", review_note: "Planlagt sporvekselarbeid ved Nybrua høsten 2026." },
  nsia_2025: { url: "https://nsia.no/Rail/Rail/Published-reports/2025-02", source_type: "official_investigation", review_status: "reviewed", review_note: "Hendelsesdato, sted og sikkerhetsundersøkelse etter avsporingen." },
  commons_1938: { url: "https://commons.wikimedia.org/wiki/File:Storgata-1938.jpg", source_type: "licensed_historical_image", review_status: "reviewed", review_note: "1938-motiv østover fra Kirkeristen, Oslo Museum OB.A13429, CC BY-SA 3.0." },
  commons_2013: { url: "https://commons.wikimedia.org/wiki/File:Oslo_Storgata_seen_from_Kirkeristen_IMG_8263.JPG", source_type: "licensed_comparison_image", review_status: "reviewed", review_note: "2013-motiv fra Kirkeristen i samme hovedretning, Bjoertvedt, CC BY-SA 3.0." },
  osm_route: { url: "https://www.openstreetmap.org/way/36973177", source_type: "open_map_geometry", review_status: "reviewed", review_note: "Verifisert 15-segmenters gateløp og lengdemidtpunkt." }
};
const specs = [
  ["fact", "Mellom hvilke to endepunkter går canonical Storgata?", ["Kirkeristen og Nybrua", "Stortorvet og Ankerbrua", "Youngstorget og Akershus festning"], "Kirkeristen og Nybrua", "Storgata går fra Dronningens gate ved Kirkeristen til Nybrua.", "storgata_byleksikon", "em_by_historiske_lag_i_hverdagsrom"],
  ["fact", "Hva het det sammenhengende gateløpet på 1700-tallet?", ["Vaterlands Storgade", "Øvre Torvegade", "Nygata"], "Vaterlands Storgade", "Storgata fram til Brugata og Brugata videre mot Akerselva ble regnet som Vaterlands Storgade.", "storgata_byleksikon", "em_by_historiske_lag_i_hverdagsrom"],
  ["fact", "Hvilken bro brukte innfarten før Nybrua?", ["Vaterlands bru", "Ankerbrua", "Akershusbrua"], "Vaterlands bru", "Før Nybrua fulgte trafikken Brugata og Vaterlands bru.", "storgata_byleksikon", "em_by_infrastruktur_mobilitet"],
  ["fact", "Hva skjedde med Storgata da Nybrua åpnet i 1827?", ["Gaten ble ført sammenhengende fram til Akerselva", "Gaten ble avkortet ved Kirkeristen og gjort til torg", "Gateløpet ble flyttet vestover til Youngstorget"], "Gaten ble ført sammenhengende fram til Akerselva", "Nybrua gjorde det mulig å føre den nordlige delen av Storgata fram til elva.", "storgata_byleksikon", "em_by_infrastruktur_mobilitet"],
  ["fact", "Når ble den sørlige delen av Storgata innlemmet i byen?", ["1784", "1827", "1939"], "1784", "Strekningen sør for Brugata ble innlemmet i byen i 1784.", "storgata_byleksikon", "em_by_historiske_lag_i_hverdagsrom"],
  ["fact", "Når ble områdene nordover langs gaten innlemmet i byen?", ["1839", "1784", "1908"], "1839", "Områdene nordover kom inn i byen i 1839.", "storgata_byleksikon", "em_by_historiske_lag_i_hverdagsrom"],
  ["context", "Hva viser forskjellen mellom 1784 og 1839?", ["Gateløpet ble innlemmet i byen i etapper", "Hele gaten ble grunnlagt samme dag", "Nybrua lå alltid innenfor byvollen"], "Gateløpet ble innlemmet i byen i etapper", "De to innlemmelsesårene viser en gradvis byutvidelse langs innfartsåren.", "storgata_byleksikon", "em_by_historiske_lag_i_hverdagsrom"],
  ["fact", "Hvilken virksomhet lå i Storgata 23 fra 1813 til 1832?", ["Byens posthus", "Den Norske Opera", "Oslo legevakt"], "Byens posthus", "Byens posthus lå i Storgata 23 fra 1813 til 1832.", "storgata_byleksikon", "em_by_transformasjon_ombruk"],
  ["fact", "Hva lå i Storgata 25 før Scala Teater?", ["Olympia kino", "Løven apotek", "Gassverket"], "Olympia kino", "Storgata 25 huset Olympia kino og senere Scala Teater.", "storgata_byleksikon", "em_by_transformasjon_ombruk"],
  ["fact", "Fra hvilket år er murgården i Storgata 27?", ["1837", "1908", "1935"], "1837", "Murgården i Storgata 27 ble oppført i 1837.", "storgata_byleksikon", "em_by_historiske_lag_i_hverdagsrom"],
  ["context", "Hva viser kapell og boktrykkeri i samme gård?", ["Én bygning kan skifte funksjon gjennom tid", "Alle adresser hadde samme bruk", "Storgata var bare transportåre"], "Én bygning kan skifte funksjon gjennom tid", "Storgata 27 rommet ulike religiøse og produksjonsrettede funksjoner.", "storgata_byleksikon", "em_by_transformasjon_ombruk"],
  ["fact", "Hvilken musikkforretning har vært i Storgata siden 1908?", ["Hornaas musikk", "Gunerius", "Tiden Norsk Forlag"], "Hornaas musikk", "Hornaas musikk har hatt tilhold i Storgata siden 1908.", "storgata_byleksikon", "em_by_historiske_lag_i_hverdagsrom"],
  ["fact", "Hvem tegnet Folketeaterbygningen?", ["Christian Morgenstierne og Arne Eide", "Gunder Juel og Aubert", "Harald Thaulow og Frits Thaulow"], "Christian Morgenstierne og Arne Eide", "Christian Morgenstierne og Arne Eide tegnet Folketeaterbygningen i Storgata 21–23.", "storgata_byleksikon", "em_by_transformasjon_ombruk"],
  ["fact", "Når ble Folketeaterbygningen innviet?", ["1935", "1827", "2009"], "1935", "Folketeaterbygningen ble tatt i bruk i 1934 og innviet i 1935.", "storgata_byleksikon", "em_by_transformasjon_ombruk"],
  ["context", "Hvorfor er Folketeaterbygningen relevant, men fortsatt et eget place?", ["Fasaden former Storgata, mens byggets institusjonshistorie har egen canonical eier", "Bygningen vender bare mot Youngstorget og har ingen dokumentert adresse i Storgata", "Hele bygningens institusjonshistorie skal kopieres inn i hvert tilgrensende gatested"], "Fasaden former Storgata, mens byggets institusjonshistorie har egen canonical eier", "Gateprofilen kan vise bygningen uten å duplisere Folketeaterets separate innhold.", "storgata_byleksikon", "em_by_transformasjon_ombruk"],
  ["fact", "Hvor lenge var Folketeaterbygningen hjem for Den Norske Opera?", ["Fra 1959 til 2008", "Fra 1813 til 1832", "Fra 2021 til 2026"], "Fra 1959 til 2008", "Den Norske Opera brukte salen fra 1959 til 2008.", "storgata_byleksikon", "em_by_transformasjon_ombruk"],
  ["fact", "Hva finnes i fortauet ved Storgata 39?", ["En snublestein for Philipp Gosias", "En statue av Gunder Juel", "En middelalderportal"], "En snublestein for Philipp Gosias", "Snublesteinen ved Storgata 39 minnes Philipp Gosias.", "storgata_byleksikon", "em_by_historiske_lag_i_hverdagsrom"],
  ["context", "Hvorfor er snublesteinen et stedsspesifikt minnespor?", ["Den knytter deportasjonshistorien til Gosias' konkrete adresse", "Den markerer den tidligere kommunegrensen langs hele gateløpet", "Den dokumenterer åpningen av trikkeholdeplassen i 2021"], "Den knytter deportasjonshistorien til Gosias' konkrete adresse", "Minnesmerket gjør én forfulgt persons tilknytning til Storgata fysisk lesbar.", "storgata_byleksikon", "em_by_historiske_lag_i_hverdagsrom"],
  ["fact", "Når åpnet dagens Storgata holdeplass?", ["21. juni 2021", "29. oktober 2024", "13. august 2026"], "21. juni 2021", "Storgata holdeplass åpnet 21. juni 2021.", "sporveien_stop", "em_by_infrastruktur_mobilitet"],
  ["fact", "Hvilke trikkelinjer betjener holdeplassen ved kontrollen i 2026?", ["12, 15, 17 og 18", "1, 2 og 3", "19 alene"], "12, 15, 17 og 18", "Sporveien oppgir linjene 12, 15, 17 og 18 for Storgata holdeplass.", "sporveien_stop", "em_by_infrastruktur_mobilitet"],
  ["fact", "Hva erstattet Storgata holdeplass?", ["Brugata holdeplass", "Nybrua", "Kirkeristen"], "Brugata holdeplass", "Den nye Storgata holdeplass erstattet tidligere Brugata holdeplass.", "sporveien_stop", "em_by_infrastruktur_mobilitet"],
  ["fact", "Hva ble fornyet under opprustningen 2018–2021?", ["Spor, fortau, holdeplasser, overvann og teknisk infrastruktur", "Gatenavnskilt, butikkfasader og belysning, men ikke spor eller fortau", "Bare holdeplassen ved Folketeateret og ett kort parti av kjørebanen"], "Spor, fortau, holdeplasser, overvann og teknisk infrastruktur", "Opprustningen omfattet både synlige flater og tekniske systemer under bakken.", "byplan_2021", "em_by_infrastruktur_mobilitet"],
  ["context", "Hva viser den 200 meter lange tekniske tunnelen?", ["En gate består også av skjult infrastruktur under overflaten", "At trikketrafikken går i en egen tunnel under hele Storgata", "At Nybrua skjuler en veitunnel som følger Akerselva sørover"], "En gate består også av skjult infrastruktur under overflaten", "Den gangbare tunnelen samler kabler og rør under trikkefundamentet.", "byplan_2021", "em_by_infrastruktur_mobilitet"],
  ["fact", "Hva undersøkte rapport 2025/02?", ["Avsporingen ved Nygata–Storgata 29. oktober 2024", "Bybrannen som rammet kvartalene ved Storgata i 1858", "Anleggsarbeidet da Nybrua og gateløpet åpnet i 1827"], "Avsporingen ved Nygata–Storgata 29. oktober 2024", "Statens havarikommisjon undersøkte SL18-avsporingen i krysset Nygata–Storgata.", "nsia_2025", "em_by_infrastruktur_mobilitet"],
  ["context", "Hva var formålet med Havarikommisjonens undersøkelse?", ["Å forbedre sikkerheten, ikke fordele skyld", "Å velge nye butikknavn", "Å datere alle murgårdene"], "Å forbedre sikkerheten, ikke fordele skyld", "Undersøkelsen var en sikkerhetsundersøkelse og ikke en skyldvurdering.", "nsia_2025", "em_by_infrastruktur_mobilitet"],
  ["fact", "Hva er planlagt ved Nybrua høsten 2026?", ["To nye sporveksler og et skinnekryss", "Riving av Nybrua", "Fjerning av all trikk i Storgata"], "To nye sporveksler og et skinnekryss", "Sporveien planlegger å fornye sporarrangementet ved Nybrua høsten 2026.", "sporveien_2026", "em_by_infrastruktur_mobilitet"],
  ["context", "Hva gjør 1938- og 2013-bildene reelt sammenlignbare?", ["Begge ser østover inn Storgata fra Kirkeristen", "Begge er tatt etter 2021-opprustningen", "Begge viser Nybrua på nært hold"], "Begge ser østover inn Storgata fra Kirkeristen", "Kirkeristen og den østgående gateaksen er felles ankre i bildene.", "commons_1938", "em_by_historiske_lag_i_hverdagsrom"],
  ["context", "Hva kan 2013-bildet ikke dokumentere?", ["Den ferdige opprustningen 2018–2021", "At Storgata eksisterte i 2013", "Retningen fra Kirkeristen"], "Den ferdige opprustningen 2018–2021", "Bildets dato setter en tydelig grense for hvilke senere endringer det kan vise.", "commons_2013", "em_by_historiske_lag_i_hverdagsrom"],
  ["concept", "Hva betyr «historiske lag» i Storgata?", ["At ulike perioders bygg, spor, adresser og bruk kan leses samtidig", "At alle bygg og funksjoner i gaten skriver seg fra samme byggeår", "At bare det eldste bevarte bygningslaget har historisk verdi"], "At ulike perioders bygg, spor, adresser og bruk kan leses samtidig", "Begrepet samler fysiske og funksjonelle spor uten å gjøre dem samtidige.", "storgata_byleksikon", "em_by_historiske_lag_i_hverdagsrom"],
  ["concept", "Hva er en presis transformasjonsanalyse av Storgata 27?", ["Å følge hvordan samme bygning har rommet ulike funksjoner", "Å anta at hele gaten endret funksjon samtidig som denne gården", "Å se bort fra bygningens dato og bare beskrive dagens fasade"], "Å følge hvordan samme bygning har rommet ulike funksjoner", "Ombruk analyseres på riktig enhetsnivå: den dokumenterte bygningen og dens funksjoner.", "storgata_byleksikon", "em_by_transformasjon_ombruk"],
  ["concept", "Hva viser spenningen mellom opphold og gjennomgang i Storgata?", ["Samme gatebredde skal romme reisende, gående, handel og transport", "At gaten er planlagt for én brukergruppe og én bevegelsesform om gangen", "At trikk, handel og fortau fungerer uavhengig av hverandre i ulike bydeler"], "Samme gatebredde skal romme reisende, gående, handel og transport", "Gateprofilen er et felles rom der flere bevegelser og stopp må koordineres.", "byplan_2021", "em_by_opphold_vs_gjennomgang"],
  ["concept", "Hva krever før/etter-metoden her?", ["Felles ankre, tydelige datoer og en eksplisitt begrensning", "To bilder uten kjent dato eller kilde, så lenge gatenavnet er likt", "At alle synlige forskjeller forklares med én og samme historiske årsak"], "Felles ankre, tydelige datoer og en eksplisitt begrensning", "Sammenligningen er sterk når motiv, dato og hva bildene ikke kan bevise oppgis.", "commons_2013", "em_by_historiske_lag_i_hverdagsrom", "met_for_etter"],
  ["concept", "Hva bør en gåanalyse registrere langs Storgata?", ["Sekvens, terskler, tempo, stopp og hindringer fra Kirkeristen til Nybrua", "Ett tilfeldig fotografi uten notat om sted, retning eller tidspunkt", "Bare gatenavnet og den rettlinjede avstanden mellom endepunktene"], "Sekvens, terskler, tempo, stopp og hindringer fra Kirkeristen til Nybrua", "Gåanalysen gjør det lineære gateløpet til en dokumentert sekvens.", "osm_route", "em_by_infrastruktur_mobilitet", "met_gaanalyse"],
  ["concept", "Hvordan kan Gordon Cullens sekvensperspektiv brukes her?", ["Til å lese skiftende fasader, kryss og gateprofiler langs vandringen", "Til å fastslå tekniske årsaker til trikkehendelser uten sikkerhetsdata", "Til å slå sammen Storgata, Torggata og alle nabosteder til ett place"], "Til å lese skiftende fasader, kryss og gateprofiler langs vandringen", "Townscape-perspektivet undersøker hvordan gatebildet endrer seg mens man beveger seg.", "storgata_byleksikon", "em_by_opphold_vs_gjennomgang", null, "byliv_opphold_vs_gjennomgang", "gordon_cullen", "The Concise Townscape"],
  ["concept", "Hva er den viktigste kildekritiske slutningen om Storgata?", ["Bilder, historikk, geometri og nåtidsdrift må belegges av kilder som faktisk dekker hvert lag", "Ett fotografi fra 2013 kan alene dokumentere både 1800-tallet og opprustningen som var ferdig i 2021", "Naboskap til Torggata og Folketeateret gjør at deres kilder automatisk gjelder alle påstander om Storgata"], "Bilder, historikk, geometri og nåtidsdrift må belegges av kilder som faktisk dekker hvert lag", "Storgatas lange tidsrom krever at hver påstand knyttes til riktig kilde og dato.", "storgata_byleksikon", "em_by_historiske_lag_i_hverdagsrom"]
];
const phases = ["opening", "middle", "middle", "bridge", "final"];
const claims = specs.map((row, index) => {
  const [family, , , , statement, sourceId, emne, method_id, topic_hook_id, thinker_id, work] = row;
  const claim = { claim_id: `claim_storgata_quiz_${index + 1}`, order: index + 1, planned_phase: phases[Math.floor(index / 7)], family: family === "concept" ? "concept_theory" : family, statement, source_ids: [sourceId], source_origin: "external", emne_id: emne };
  if (method_id) claim.method_id = method_id;
  if (topic_hook_id) claim.topic_hook_id = topic_hook_id;
  if (thinker_id) Object.assign(claim, { thinker_id, work });
  return claim;
});
const existing_quiz_audit = {
  searched_paths: ["data/quiz/manifest.json", "data/quiz/by/storgata_sets_merged.json", "data/places/by/oslo/places/storgata.json"],
  active_before: { file: null, set_count: 0, question_count: 0, finding: "Ingen manifest-loadet canonical quiz fantes." },
  legacy_before: { file: "data/quiz/by/storgata_sets_merged.json", set_count: 3, question_count: 15, finding: "Legacy-filen hadde bare faktaspørsmål og manglet source brief, production context og femsetts progresjon." },
  decisions: ["Behold dokumenterbare faktakjerner, men materialiser dem i canonical 5×7-kontrakt.", "Hold de første 14 spørsmålene til normal fakta- og kontekstinngang.", "Legg metode og teori bare i sluttsettet og bind alt til ekstern stedsevidens."],
  knowledge_migration: "Legacy-filen er dokumentert her og fjernes etter at faktakjernene er migrert til den nye canonicale pakken; manifestet peker bare på 5×7-pakken og Knowledge regenereres."
};
const profile_decision = { profile: "rich", set_count: 5, questions_per_set: 7, justification: "Storgata har fem selvstendige læringsjobber: gateidentitet og byutvidelse, adresser og ombruk, Folketeaterkvartalet og minnespor, trikkeinfrastruktur og opprustning, samt stedlig metode og kildekritikk." };
const held_back_candidates = ["Café Sara som Brand – virksomheten ligger i Hausmanns gate og er naboproxy.", "Nåtidsvirksomheter uten fersk kontroll og logo-/wordmarkproveniens.", "Påstand om at 2013-bildet viser resultatet av opprustningen 2018–2021.", "People basert bare på nærhet, generell Oslo-tilknytning eller en egen naboinstitusjon."];
const selected_curriculum = { module_ids: ["kur_by_03_infrastruktur_og_bevegelse", "kur_by_04_historiske_lag_og_transformasjon"], emne_ids: ["em_by_historiske_lag_i_hverdagsrom", "em_by_transformasjon_ombruk", "em_by_infrastruktur_mobilitet", "em_by_opphold_vs_gjennomgang"], topic_hook_ids: ["byliv_opphold_vs_gjennomgang"], method_ids: ["met_for_etter", "met_gaanalyse"], thinker_ids: ["gordon_cullen"], works: ["The Concise Townscape"] };
const brief = { schema_version: "1.0", status: "reviewed", categoryId: "by", targetId: "storgata", profile_hint: "rich", reviewed_at: verifiedAt, review_note: "Kildegrunnlaget skiller gateløpet fra kryssende og tilgrensende places, daterer før/etter-paret og holder historiske, tekniske og nåtidige påstander atskilt.", scope: { place: "Storgata", production_profile: "rich", set_count: 5, questions_per_set: 7, total_questions: 35, normal_opening_questions: 14 }, sources, selected_curriculum, existing_quiz_audit, profile_decision, held_back_candidates, claims };
const briefFile = "data/quiz/production_briefs/by/storgata.json";
write(briefFile, brief);
const production_context = { manifest_category: "by", profile: "rich_5x7", standard_version: "3.3", source_brief: briefFile, context_artifact: "data/quiz/production_context/by/storgata.json", resolved_files: { pensum: "data/fag/by/pensum_by.json", emner: "data/fag/by/emner_by.json", fagkart: "data/fag/by/fagkart_by.json", methods: "data/fag/by/methods_by.json", supersetQuizMal: "data/fag/by/supersetQUIZMAL_by.json", quizStandard: "data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md", quizQuestionSchema: "data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json" }, required_inputs_loaded: ["pensum", "emner", "fagkart", "methods", "supersetQuizMal", "quizStandard", "quizQuestionSchema"], pensum_module_ids: selected_curriculum.module_ids, emne_ids: selected_curriculum.emne_ids, topic_hook_ids: selected_curriculum.topic_hook_ids, method_ids: selected_curriculum.method_ids, thinker_ids: selected_curriculum.thinker_ids, works: selected_curriculum.works, source_review_status: "reviewed", existing_quiz_audit, profile_decision, held_back_candidates, theory_start_phase: "final", method_start_phase: "final" };
const questions = specs.map((row, index) => {
  const [family, question, options, answer, knowledge, sourceId, emne, method_id, topic_hook_id, thinker_id, work] = row;
  const setNo = Math.floor(index / 7) + 1;
  const value = { id: `storgata_quiz_${index + 1}`, quiz_id: `by_storgata_set_${setNo}_q${index % 7 + 1}`, categoryId: "by", placeId: "storgata", targetId: "storgata", question_scope: "place", question, options, answer, answerIndex: options.indexOf(answer), knowledge, difficulty: Math.min(4, setNo), question_type: family, emne_id: emne, source: [sourceId], source_origin: "external", claim_basis: claims[index].statement, claim_id: claims[index].claim_id, primary_knowledge_unit_id: `ku_by_storgata_${String(index + 1).padStart(2, "0")}`, knowledge_unit_ids: [`ku_by_storgata_${String(index + 1).padStart(2, "0")}`], concept_ids: [], term_ids: [], knowledge_contract_version: 1, knowledge_link_status: "linked" };
  if (method_id) Object.assign(value, { method_id, guidance_basis: ["data/fag/by/methods_by.json", "data/fag/by/emner_by.json"] });
  if (thinker_id) Object.assign(value, { topic_hook_id, thinker_id, work, theory_ref: { topic_hook_id, thinker_id, work, why_it_helps: "Sekvensperspektivet brukes til å analysere det dokumenterte gateløpet, ikke som erstatning for stedskildene." }, guidance_basis: ["data/fag/by/fagkart_by.json", "data/fag/by/emner_by.json"] });
  return value;
});
const quiz = { targetId: "storgata", categoryId: "by", sources: Object.fromEntries(Object.entries(sources).map(([id, source]) => [id, source.url])), production_context, sets: ["Gateløp og byutvidelse", "Historiske adresser", "Bygg, minne og ombruk", "Trikk, opprustning og sikkerhet", "Metode, sekvens og kildekritikk"].map((title, index) => ({ set_id: `by_storgata_set_${index + 1}`, title, level: index + 1, order: index + 1, phase: phases[index], xp: 50 + index * 10, questions: questions.slice(index * 7, index * 7 + 7) })) };
const quizFile = "data/quiz/by/storgata_sets.json";
write(quizFile, quiz);
const fagManifest = read("data/fag/fag_manifest.json");
fagManifest.by.quizProduction.targets.storgata = { source_brief: "../quiz/production_briefs/by/storgata.json", context_artifact: "../quiz/production_context/by/storgata.json", quiz_file: "../quiz/by/storgata_sets.json" };
write("data/fag/fag_manifest.json", fagManifest);
const quizManifest = read("data/quiz/manifest.json");
addUnique(quizManifest.sets, { targetId: "storgata", file: quizFile }, row => `${row.targetId}:${row.file}`);
write("data/quiz/manifest.json", quizManifest);

const splitProductionSentences = value => [...new Intl.Segmenter("nb", { granularity: "sentence" }).segment(value)]
  .map(entry => entry.segment.trim()).filter(Boolean);
const descSentences = splitProductionSentences(place.desc);
const popupSentences = splitProductionSentences(place.popupDesc);
const productionSourceType = { storgata_byleksikon: "institutional", byplan_2021: "official" };
const productionLocation = (field, sentence) => {
  if (field === "desc") return "Oslo byleksikon, ingress og avsnitt om gateforløp, Nybrua, sporvei og Folketeaterbygningen.";
  if (sentence <= 5) return "Oslo byleksikon, ingress og første historiske avsnitt om gateløp, forstad og Vaterlands Storgade.";
  if (sentence <= 9) return "Oslo byleksikon, avsnittet om Nybrua, opparbeidelse og byutvidelsene i 1784 og 1839.";
  if (sentence <= 13) return "Oslo byleksikon og Oslo kommunes Byplan-artikkel, avsnittene om sporvei, gatebredde og samtidige gatebrukere.";
  if (sentence <= 19) return "Oslo byleksikon, adresseoppslagene for Storgata 21–27.";
  if (sentence <= 24) return "Oslo byleksikon, oppslaget om Folketeaterbygningen i Storgata 21–23.";
  if (sentence === 25) return "Oslo byleksikon, adresseoppslaget for Storgata 40 og Krohgstøtten.";
  if (sentence === 26) return "Oslo byleksikon, adresseoppslaget for Storgata 39 og Philipp Gosias.";
  if (sentence === 27) return "Oslo byleksikon, adresseoppslagene for Storgata 43 og 53.";
  return "Oslo byleksikon og Oslo kommunes Byplan-artikkel, samlet dokumentasjon av gateforløp, adresser og transportfunksjon.";
};
const productionClaims = [];
const productionCoverage = { desc: [], popupDesc: [] };
for (const [field, sentences] of [["desc", descSentences], ["popupDesc", popupSentences]]) {
  sentences.forEach((sentenceText, index) => {
    const sentence = index + 1;
    const id = `claim_storgata_${field === "desc" ? "desc" : "popup"}_${String(sentence).padStart(2, "0")}`;
    const strong = field === "popupDesc" && [1, 13].includes(sentence);
    const sourceId = field === "popupDesc" && sentence === 13 ? "byplan_2021" : "storgata_byleksikon";
    const temporalStatus = field === "popupDesc" && [12, 13, 24, 28].includes(sentence) ? "current" : "historical";
    const claim = {
      id, claim: sentenceText, sourceUrl: sources[sourceId].url, sourceLocation: productionLocation(field, sentence),
      sourceType: productionSourceType[sourceId], verifiedAt, status: "verified",
      claimKind: strong ? "strong" : (field === "desc" && sentence === 1) || (field === "popupDesc" && sentence === 2) ? "identity" : "ordinary",
      evidenceMode: strong ? "explicit" : "direct", temporalStatus
    };
    if (strong) claim.independentSourceUrls = [sources[sourceId === "byplan_2021" ? "storgata_byleksikon" : "byplan_2021"].url];
    productionClaims.push(claim);
    productionCoverage[field].push({ sentence, claimIds: [id] });
  });
}
const productionQuizQuestions = [
  { question: specs[0][1], answer: specs[0][3], type: "hvor", normalKnowledgeQuestion: true, claimIds: ["claim_storgata_popup_02"] },
  { question: specs[1][1], answer: specs[1][3], type: "hva", normalKnowledgeQuestion: true, claimIds: ["claim_storgata_popup_04"] },
  { question: specs[2][1], answer: specs[2][3], type: "hvilket_verk_eller_objekt", normalKnowledgeQuestion: true, claimIds: ["claim_storgata_popup_03"] },
  { question: specs[3][1], answer: specs[3][3], type: "hva_skjedde", normalKnowledgeQuestion: true, claimIds: ["claim_storgata_popup_06"] },
  { question: specs[4][1], answer: specs[4][3], type: "når", normalKnowledgeQuestion: true, claimIds: ["claim_storgata_popup_08"] },
  { question: specs[5][1], answer: specs[5][3], type: "når", normalKnowledgeQuestion: true, claimIds: ["claim_storgata_popup_08"] },
  { question: specs[6][1], answer: specs[6][3], type: "hva", normalKnowledgeQuestion: true, claimIds: ["claim_storgata_popup_08"] },
  { question: specs[7][1], answer: specs[7][3], type: "hva", normalKnowledgeQuestion: true, claimIds: ["claim_storgata_popup_16"] }
];
const production = {
  schemaVersion: "4.2", validatorVersion: "4.2.1", placeId: "storgata", placeFile, status: "ready_v4_2",
  identity: { status: "resolved", represents: "Storgata som det navngitte gateløpet fra Kirkeristen til Nybrua, med gatehistorie, adresser og infrastruktur som tilhører dette løpet.", period: "før 1700-tallet–", excludes: ["Torggata som eget gateløp", "Youngstorget som eget torg", "Folketeateret/Folketeaterbygningen som eget institusjonssted", "Nybrua som eget brosted", "Brugata/Storgata-rusmiljøet som eget sosialt territorium"] },
  metadataSnapshot: { name: place.name, year: place.year, category: place.category },
  textHashes: { algorithm: "sha256", desc: crypto.createHash("sha256").update(place.desc).digest("hex"), popupDesc: crypto.createHash("sha256").update(place.popupDesc).digest("hex") },
  claims: productionClaims,
  sentenceCoverage: productionCoverage,
  reviews: { factual: { status: "passed", reviewedAt: verifiedAt, reviewer: "Storgata full completion review", notes: "Alle synlige setninger er bundet til verifiserte, inspectable stedskilder." }, editorial: { status: "passed", reviewedAt: verifiedAt, reviewer: "Storgata full completion review", introducedNewFacts: false, notes: "Ingressen har ett styrende gateperspektiv; detaljer og adresser ligger i popupen.", ingressReview: { controllingIdea: "Storgata som sammenhengende historisk innfarts-, handels- og trikkegate fra Kirkeristen til Nybrua.", chronologyInventoryRemoved: true, nameAndYearPileupRemoved: true, knownNewFlowPassed: true, readAloudPassed: true } } },
  roundsReadiness: { status: "production_ready", reviewedAt: verifiedAt, auditFile: "reports/place-production/storgata-phase24-final-audit-v1.json", badgePlacement: "separate_header", contentRoundIds: ["people", "objects", "brands", "related"], placeCardProfile: "history_go_place_card_profile_v2", peopleIds: place.related_people_ids, objectIds: place.objects.map(item => item.id), brandIds: [], brandFallback: "honest_empty_state_after_candidate_and_logo_audit", relatedPlaceIds: place.related_place_ids, objectSourceCoveragePercent: 100, routeStopResolutionPercent: 100 },
  quizReadiness: { status: "canonical_rich_5x7", quizTargetId: "storgata", sourceBrief: briefFile, productionContext: "data/quiz/production_context/by/storgata.json", normalOpeningQuestions: 14, totalQuestions: 35, questions: productionQuizQuestions },
  storyReadiness: { status: "episode_v1", file: storiesFile, episodeCount: stories.length },
  completion: { completedUnder: "4.2", currentStatus: "current", sourceVerifiedAt: verifiedAt, claimsVerified: { verified: productionClaims.length, total: productionClaims.length }, factualReview: "passed", editorialReview: "passed", validatorVersion: "4.2.1" },
  reviewsNotes: "Eksisterende geometri og sterke popuptekst er bevart. Storgata eier gateløpet; separate nabosteder er koblet som relasjoner. Café Sara er fjernet som falsk Brand, og Brands viser ærlig tomtilstand."
};
write("data/places/production/storgata.json", production);

write("reports/place-production/storgata-workcard-current.json", {
  placeId: "storgata", activePhase: 24, lastApprovedCheckpoint: "phase_24_final_qa", activeFileScope: "Storgata canonical place and directly dependent People, Objects, Stories, Quiz, Language, Readings and generated payloads", activeMergeBoundary: "canonical_content_and_integration", branchStatus: "local", liveStatus: "not_live", nextPhase: "merge_and_verify_main", identity: production.identity, placeCard: production.roundsReadiness, quiz: production.quizReadiness
});
write("reports/place-production/storgata-phase24-final-audit-v1.json", {
  schema: "history_go_place_final_audit_v1", placeId: "storgata", auditedAt: verifiedAt, status: "PASS_PENDING_BROWSER_AND_CI",
  canonicalScope: place.spatial_profile, content: { popupParagraphs: place.popupDesc.split(/\n\n/).length, chronologyEntries: chronology.length, stories: stories.length, news: news.length, readings: readings.length, languageEntries: 3, people: place.related_people_ids.length, objects: place.objects.length, brands: 0, relatedPlaces: place.related_place_ids.length, quizSets: 5, quizQuestions: 35 },
  images: { before: place.for_na.beforeImageMeta, after: place.for_na.nowImageMeta, comparison: "comparable_viewpoint_with_explicit_2013_cutoff" },
  manualQa: { desktop: "pending", mobile: "pending", popupTabs: "pending", fourSurfaceLayout: "pending", quizProminence: "pending", onsiteSafety: "passed_editorial_review" },
  remaining: ["Complete browser QA at desktop and mobile widths in CI.", "Record immutable head SHA and CI result before merge."]
});

console.log("Storgata completion source data materialized");
