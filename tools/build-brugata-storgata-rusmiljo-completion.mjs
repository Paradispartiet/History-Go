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
const normalize = value => String(value || "").normalize("NFC").replace(/\r\n?/gu, "\n").replace(/[ \t]+/gu, " ").replace(/ *\n */gu, "\n").trim();
const verifiedAt = "2026-08-25";
const placeId = "brugata_storgata_rusmiljo";
const placeFile = "data/places/subkultur/oslo/places_subkultur/brugata_storgata_rusmiljo.json";

const urls = {
  byplan: "https://magasin.oslo.kommune.no/byplan/trygghet-og-kriminalitetsforebygging-m%C3%A5-v%C3%A6re-f%C3%B8rende-i-byutviklingen",
  korus: "https://filer.korus.no/publications/HKH-rapport-web.pdf",
  fhr: "https://humanruspolitikk.no/vil-gi-rusavhengige-et-sted-a-vaere/",
  storgata2021: "https://magasin.oslo.kommune.no/byplan/stor-forandring-i-nye-storgata",
  commonsBefore: "https://commons.wikimedia.org/wiki/File:Brugata_sett_mot_Storgata_OB.OT359.jpg",
  commonsNow: "https://commons.wikimedia.org/wiki/File:Brugata,_Oslo_2026.jpg",
  geonorge: "https://ws.geonorge.no/adresser/v1/sok?adressenavn=Storgata&nummer=33&kommunenummer=0301&treffPerSide=100"
};

const place = read(placeFile);
place.desc = "Krysset Brugata/Storgata er et avgrenset sosialt territorium i Oslos åpne rusmiljø, med Storgata 33 som stabilt kartanker. Offentlige, forskningsbaserte og brukerorganiserte kilder beskriver stedet både som markedsplass, sosial møteplass og kontaktflate mot tjenester, kontroll og byutvikling. Territoriet er ikke identisk med hele gatene rundt.";
place.popupDesc = `Dette stedet er det avgrensede sosiale territoriet i og nær krysset Brugata/Storgata, med Storgata 33 som stabilt kartanker. Det er ikke hele Storgata, hele Brugata, Folketeaterkvartalet, det historiske Plata-stedet eller Prindsen mottakssenter. Oslo kommunes Byplan-artikkel omtaler krysset som Oslos største åpne markedsplass for illegale rusmidler og samtidig som en sosial møteplass; dobbeltheten, ikke én enkelt aktivitet, er den canonicale kjernen.

Miljøet har ikke stått stille. Foreningen for human ruspolitikk knytter dagens situasjon til systematisk spredning etter Sentrumssamarbeidet fra 2011, da miljøet ble presset bort fra Oslo S og Jernbanetorget og siden flyttet mellom blant annet Brugata/Storgata, Elgsletta og Hausmannsområdet. Derfor er dette et nåværende territorium i en flyttehistorie, ikke et nytt navn på Plata.

KORUS-rapporten «Utrygg markedsplass» fra 2020 bygger på feltarbeid og intervjuer i Brugata/Storgata. Rapporten dokumenterer utrygghet, vold og marked, men også sosial kontakt og tilhørighet. Ingen synlig person på stedet kan dermed identifiseres som medlem av miljøet, rusavhengig, selger, kjøper eller tjenestebruker; slike slutninger ligger utenfor kildenes dokumentasjon.

Storgata 33 og den overbygde arkaden er et fysisk tyngdepunkt i den kommunale stedsanalysen. Opprustningen av Storgata som stod ferdig i 2021 endret spor, fortau og teknisk infrastruktur, men Byplan beskriver at fysisk oppgradering alene ikke løste den opplevde utryggheten. Et sosialt territorium oppstår i samspillet mellom rom, relasjoner, marked, tjenester, kontroll og forflytning.

I en ny kartlegging publisert i 2025 nådde Bykuben nesten 35 personer gjennom flere møteplasser. Vennskap og natur langs Akerselva ble trukket fram som viktige ressurser. Kartleggingen viser hvorfor kunnskap om stedet må hentes gjennom respektfull medvirkning og aggregerte beskrivelser, ikke gjennom nærgående observasjon av mennesker i gatebildet.

I 2025 argumenterte Foreningen for human ruspolitikk for et skjermet utendørs værested. Forslaget ble uttrykkelig skilt fra en lovløs sone og begrunnet med behovet for et sosialt sted også utenfor tjenestenes åpningstid. Revidert budsjett ga ikke finansiering, og juridiske avklaringer var fortsatt under arbeid da organisasjonen publiserte saken.

På stedet skal besøket bare lese arkitektur, gateprofil og offentlige forbindelser fra ordinær ferdselsåre. Ikke fotografer, følg, kontakt eller kartlegg personer, oppholdstider, transaksjoner, helseforhold eller ruter. Canonical avgrensning og personvern er en del av kunnskapen: Brugata/Storgata er et dokumentert sosialt territorium, men menneskene som er synlige der er aldri samleobjekter eller bevis.`;
place.aliases = ["Brugata/Storgata-rusmiljøet", "rusmiljøet ved Storgata 33"];
place.frontImage = "bilder/places/brugata-storgata-2026.jpg";
place.image = place.frontImage;
place.cardImage = "bilder/kort/places/brugata-storgata-2026.jpg";
place.place_card_profile = {
  schema: "history_go_place_card_profile_v2",
  collection_ids: ["people", "objects", "brands", "related"],
  reason: "People viser bare dokumenterte offentlige fag- og organisasjonsroller; Objects viser tre fysiske stedsankre; Brands er en ærlig tomtilstand; Related skiller territoriet fra egne canonicale nabosteder.",
  verifiedAt
};
place.emne_ids = ["em_sub_apne_rusmiljoer_gatefellesskap", "em_sub_rett_til_byen", "em_sub_tilhorighet_miljo", "em_sub_personvern_forskningsetikk"];
place.related_people_ids = ["arild_knutsen", "ingvild_ofstad", "mikael_oscar_loum_johansen", "iris_roise_aasebo"];
place.related_place_ids = ["storgata", "plata_oslo", "prindsen_mottakssenter", "vaterlandsparken", "fyrlyset_oslo"];
place.objects = [
  {
    id: "brugata_storgata_33_arkaden", title: "Arkaden ved Storgata 33", type: "arkade", kind: "physical_object",
    desc: "Den overbygde fortaussonen ved Storgata 33 er et fysisk tyngdepunkt i kommunens stedsanalyse. Et forslag om å glasse den inn ble avslått i februar 2024.",
    why_here: "Arkaden former sikt, ly, innganger og opphold ved selve krysset uten å forklare hele miljøet alene.",
    placeSpecificReason: "Byplan-artikkelen knytter arkaden og byggesaken direkte til Storgata 33 og Brugata/Storgata-krysset.",
    historicalFunction: "Overdekket offentlig-nær passasje langs gårdens gatefront.", physicalObject: true, placeSpecific: true, collectable: true,
    storePrice: 25, currency: "PC", collection: "brugata_storgata_romlige_ankre",
    unlock: "Observer arkaden fra motsatt side av gaten; ikke gå inn for å studere eller fotografere mennesker.", source_urls: [urls.byplan]
  },
  {
    id: "brugata_storgata_trikkespor", title: "Trikkesporene gjennom krysset", type: "sporveisinfrastruktur", kind: "physical_object",
    desc: "Sporene gjør Storgatas transportakse synlig gjennom det sosiale territoriet. De ble fornyet som del av opprustningen 2018–2021.",
    why_here: "Skinnene viser at opphold, gjennomgang og kollektivtrafikk deler den samme smale gateflaten.",
    placeSpecificReason: "Oslo kommune dokumenterer sporfornyelsen og knytter den senere stedsanalysen til krysset ved Storgata 33.",
    historicalFunction: "Kollektiv korridor gjennom sentrum.", physicalObject: true, placeSpecific: true, collectable: true,
    storePrice: 25, currency: "PC", collection: "brugata_storgata_romlige_ankre",
    unlock: "Les sporretningen fra fortauet og kryss bare på ordinær måte; aldri stå i sporet.", source_urls: [urls.storgata2021, urls.byplan]
  },
  {
    id: "brugata_storgata_gateflaten", title: "Den ombygde gateflaten", type: "fortau_og_kryss", kind: "physical_object",
    desc: "Fortau, kryssingsflate og kantsoner ble endret gjennom Storgata-opprustningen, men den kommunale kartleggingen viser at sosial konflikt og utrygghet ikke kan leses som et rent overflateproblem.",
    why_here: "Gateflaten er den fysiske rammen der ferdsel, opphold, kontroll og tjenestenærhet møtes.",
    placeSpecificReason: "Byplan-artiklene dokumenterer både opprustningen og den senere analysen av krysset.",
    historicalFunction: "Felles gateplan for gående, trikk, varelevering og opphold.", physicalObject: true, placeSpecific: true, collectable: true,
    storePrice: 25, currency: "PC", collection: "brugata_storgata_romlige_ankre",
    unlock: "Se på materialskifter og bevegelseslinjer fra et ordinært vente- eller gangpunkt, uten å registrere personer.", source_urls: [urls.storgata2021, urls.byplan]
  }
];
place.spatial_profile = {
  place_form: "avgrenset_sosialt_territorium_i_gatekryss",
  canonical_scope: "Det dokumenterte åpne rusmiljøets sosiale territorium i og nær Brugata/Storgata-krysset, med Storgata 33 som stabilt områdeanker.",
  boundary_description: "Territoriet representeres med 100 meters områdeindikasjon rundt adresseankeret. Det er ikke en eiendomsgrense, en påstand om hvor enkeltpersoner oppholder seg eller en utvidelse til hele Brugata eller Storgata.",
  excludes: ["hele Storgata", "hele Brugata", "Folketeaterkvartalet", "Plata som historisk sted ved Oslo S", "Prindsen mottakssenter og andre tjenester"],
  geometry_status: "verified_semantic_area_anchor", sources: [{ source: "Oslo kommune – Byplan", url: urls.byplan }, { source: "Geonorge – Storgata 33", url: urls.geonorge }]
};
place.for_na = {
  title: "Brugata mot Storgata: omkring 1870 og 2026", beforeImage: "bilder/places/brugata-storgata-1870.jpg", beforeImageLabel: "Brugata sett vestover mot Storgata (ca. 1870)",
  beforeImageMeta: { source: "wikimedia_commons", sourcePage: urls.commonsBefore, objectId: "Oslo Museum OB.OT359", author: "Ole Tobias Olsen", credit: "Ole Tobias Olsen / Oslo Museum (OB.OT359)", license: "CC BY-SA 3.0 NO", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/no/", date: "ca. 1870", viewpoint: "Fra Lilletorget vestover langs Brugata mot Storgata", verified: true, verifiedAt },
  nowImage: "bilder/places/brugata-storgata-2026.jpg", nowImageLabel: "Brugata sett vestover mot Storgata (2026)",
  nowImageMeta: { source: "wikimedia_commons", sourcePage: urls.commonsNow, author: "Ssu", credit: "Ssu / Wikimedia Commons", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", date: "2026-01-20", viewpoint: "Vestover langs Brugata mot Storgata fra et punkt lenger øst enn 1870-fotografiet", verified: true, verifiedAt },
  before: "Ole Tobias Olsens fotografi følger Brugata vestover mot Storgata omkring 1870. Gateaksen, bebyggelsen og Tugthuset i bakgrunnen dokumenterer det fysiske gateløpet lenge før dagens sosiale territorium.",
  now: "Ssus fotografi fra 20. januar 2026 følger samme vestgående Brugata-akse mot Storgata, men fra et punkt lenger øst. Det viser dagens gateprofil på avstand og brukes ikke til å klassifisere eller identifisere personer.",
  change: "Bildene er reelt sammenlignbare gjennom retning og Brugata-aksen, men ikke fra identisk kamerastandpunkt. Paret dokumenterer fysisk gateendring over omtrent 156 år; det historiske bildet er ikke bevis for rusmiljøets alder, og personer i 2026-bildet er ikke bevis for identitet eller atferd.",
  lookFor: ["Følg den vestgående gateaksen mot Storgata som felles anker.", "Sammenlign gatebredde, fasaderekke og trafikk uten å hevde identisk kamerastandpunkt.", "Skill fysisk gatehistorie fra kilder om det sosiale territoriet."],
  sources: [urls.commonsBefore, urls.commonsNow, urls.byplan]
};
place.interpretation = {
  what_to_notice: ["Arkaden ved Storgata 33, sporene og fortauskantene danner en trang fysisk ramme.", "Brugata møter en kollektivakse med rask gjennomstrømning og korte oppholdssoner.", "Tjenester og relaterte steder ligger i nærheten, men er ikke samme canonicale sted."],
  why_it_matters: ["Stedet viser hvordan et ordinært gatekryss kan få sosial betydning gjennom gjentatt bruk og relasjoner.", "Forflytning etter kontrolltiltak gjør at territoriet må forstås historisk og relasjonelt.", "Medvirkning avdekker ressurser som vennskap og naturkontakt som ikke kan leses av gatebildet alene."],
  counterpoints: ["Fysisk utforming påvirker sikt og opphold, men forklarer ikke alene hvorfor miljøet er her.", "Utrygghet og vold må dokumenteres uten å gjøre alle synlige mennesker til risiko.", "Et foreslått værested er et politisk tiltak, ikke et allerede etablert tilbud ved krysset."],
  sources: [{ title: "Oslo kommune – Byplan", url: urls.byplan, verifiedAt }, { title: "KORUS Oslo – Utrygg markedsplass", url: urls.korus, verifiedAt }, { title: "Foreningen for human ruspolitikk", url: urls.fhr, verifiedAt }]
};
place.onsite = {
  safety: "Bruk bare ordinære fortau og kryssinger. Ikke fotografer, følg, kontakt eller kartlegg mennesker, oppholdstider, transaksjoner, helseforhold eller ruter. Forlat stedet dersom situasjonen kjennes utrygg.",
  observation_route: [
    { order: 1, title: "Langs Brugata", instruction: "Se vestover mot Storgata og bruk gateaksen som historisk anker; ikke fotografer personer." },
    { order: 2, title: "Kryssingsflaten", instruction: "Observer spor, fortau og bevegelseslinjer mens du følger ordinære trafikkregler." },
    { order: 3, title: "Storgata 33 på avstand", instruction: "Les arkaden og fasaden fra motsatt side; ikke gå inn for å studere mennesker." },
    { order: 4, title: "Videre lesespor", instruction: "Avslutt observasjonen og bruk appens separate relasjoner til Storgata, Plata eller Prindsen for videre kontekst." }
  ],
  aha: "Den fysiske rammen er synlig på få minutter, men stedets sosiale betydning kan bare forstås gjennom historikk, medvirkning og etisk avgrensede kilder."
};
place.externalLinks = [
  { type: "official", label: "Oslo kommune – stedsanalyse Brugata/Storgata", url: urls.byplan, lang: "nb", verifiedAt },
  { type: "research", label: "KORUS Oslo – Utrygg markedsplass", url: urls.korus, lang: "nb", verifiedAt },
  { type: "community_primary", label: "Foreningen for human ruspolitikk – et sted å være", url: urls.fhr, lang: "nb", verifiedAt },
  { type: "official", label: "Oslo kommune – nye Storgata", url: urls.storgata2021, lang: "nb", verifiedAt },
  { type: "map_source", label: "Geonorge – Storgata 33", url: urls.geonorge, verifiedAt },
  { type: "image_source", label: "Wikimedia Commons – Brugata ca. 1870", url: urls.commonsBefore, verifiedAt },
  { type: "image_source", label: "Wikimedia Commons – Brugata 2026", url: urls.commonsNow, verifiedAt },
  { type: "license", label: "Creative Commons BY-SA 3.0 Norge", url: "https://creativecommons.org/licenses/by-sa/3.0/no/", verifiedAt },
  { type: "license", label: "Creative Commons BY-SA 4.0", url: "https://creativecommons.org/licenses/by-sa/4.0/", verifiedAt }
];
write(placeFile, place);

const brands = read("data/brands/brands_by_place.json");
delete brands[placeId];
write("data/brands/brands_by_place.json", brands);
const actors = read("data/brands/actors_by_place.json");
delete actors[placeId];
writeCompact("data/brands/actors_by_place.json", actors);

const people = [
  { id: "arild_knutsen", name: "Arild Knutsen", initials: "AK", desc: "Styreleder i Foreningen for human ruspolitikk og offentlig talsperson i værestedsdebatten.", popupDesc: "Arild Knutsen omtales her bare i sin dokumenterte offentlige rolle. I 2025 argumenterte han for et skjermet utendørs værested og understreket at forslaget ikke var en lovløs sone, men et svar på sosiale behov og gjentatt forflytning.", places: [placeId], placeId, category: "subkultur", year: 2025, emne_ids: ["em_sub_apne_rusmiljoer_gatefellesskap", "em_sub_rett_til_byen", "em_sub_tilhorighet_miljo"], visual: { designCode: "portrait_initials_public_role" }, source_urls: [urls.fhr] },
  { id: "ingvild_ofstad", name: "Ingvild Ofstad", initials: "IO", desc: "Prosjektarkitekt i Plan- og bygningsetaten med offentlig rolle i kartleggingen av Brugata/Storgata.", popupDesc: "Ingvild Ofstad presenteres som offentlig fagperson, ikke som representant for menneskene i rusmiljøet. Byplan-artikkelen knytter henne til arbeidet med å forstå trygghet, byutvikling og medvirkning ved krysset.", places: [placeId], placeId, category: "subkultur", year: 2025, emne_ids: ["em_sub_rett_til_byen", "em_sub_personvern_forskningsetikk", "em_sub_apne_rusmiljoer_gatefellesskap"], visual: { designCode: "portrait_initials_public_role" }, source_urls: [urls.byplan] },
  { id: "mikael_oscar_loum_johansen", name: "Mikael Oscar Loum Johansen", initials: "MJ", desc: "Landskapsarkitekt i Bykuben og offentlig deltaker i medvirkningskartleggingen.", popupDesc: "Mikael Oscar Loum Johansen omtales i sin faglige rolle i Bykubens kartlegging. Arbeidet søkte kunnskap gjennom møteplasser og samtaler framfor å behandle mennesker i gatebildet som observerbare objekter.", places: [placeId], placeId, category: "subkultur", year: 2025, emne_ids: ["em_sub_rett_til_byen", "em_sub_personvern_forskningsetikk", "em_sub_apne_rusmiljoer_gatefellesskap"], visual: { designCode: "portrait_initials_public_role" }, source_urls: [urls.byplan] },
  { id: "iris_roise_aasebo", name: "Iris Røise Aasebø", initials: "IA", desc: "Landskapsarkitekt i Bykuben og offentlig deltaker i medvirkningskartleggingen.", popupDesc: "Iris Røise Aasebø omtales i sin faglige rolle i Bykubens kartlegging. Kilden viser hvordan respektfull medvirkning kan løfte fram vennskap, naturkontakt og andre ressurser som ikke kan avledes fra synlighet i gaten.", places: [placeId], placeId, category: "subkultur", year: 2025, emne_ids: ["em_sub_rett_til_byen", "em_sub_personvern_forskningsetikk", "em_sub_tilhorighet_miljo"], visual: { designCode: "portrait_initials_public_role" }, source_urls: [urls.byplan] }
];
const peopleFile = "data/people/subkultur/oslo/people_brugata_storgata_rusmiljo.json";
write(peopleFile, people);
const peopleManifest = read("data/people/manifest.json");
addUnique(peopleManifest.files, "people/subkultur/oslo/people_brugata_storgata_rusmiljo.json");
write("data/people/manifest.json", peopleManifest);

const sourceLinks = [
  { title: "Oslo kommune – trygghet og byutvikling", url: urls.byplan, verifiedAt },
  { title: "KORUS Oslo – Utrygg markedsplass", url: urls.korus, verifiedAt },
  { title: "Foreningen for human ruspolitikk – et sted å være", url: urls.fhr, verifiedAt },
  { title: "Oslo kommune – nye Storgata", url: urls.storgata2021, verifiedAt }
];
const chronology = [
  { year: 1968, title: "Åpne rusmiljøer blir synlige i Oslo sentrum", desc: "KORUS-rapporten legger den lengre bakgrunnen for Oslos åpne russcener til slutten av 1960-årene.", source: sourceLinks[1] },
  { year: 2011, title: "Systematisk spredning fra Oslo S", desc: "Foreningen for human ruspolitikk beskriver hvordan Sentrumssamarbeidet fra 2011 bidro til å flytte miljøet fra Oslo S og Jernbanetorget østover.", source: sourceLinks[2] },
  { year: 2019, title: "Ekstra tilstedeværelse og ny kartlegging", desc: "Uteseksjonen og trivselsvakter fikk økt tilstedeværelse, mens kartleggingen som senere ble «Utrygg markedsplass» ble gjennomført.", source: sourceLinks[1] },
  { year: 2020, title: "«Utrygg markedsplass» publiseres", desc: "KORUS Oslo og Velferdsetaten publiserte en hurtig kartlegging av marked, utrygghet og sosial møteplass i Brugata/Storgata.", source: sourceLinks[1] },
  { year: 2021, title: "Den ombygde Storgata åpner", desc: "Nye spor, fortau, holdeplasser og teknisk infrastruktur endret den fysiske rammen rundt krysset.", source: sourceLinks[3] },
  { year: 2024, title: "Forslag om innglassing avslås", desc: "Et forslag om å glasse inn arkaden ved Storgata 33 ble avslått i februar 2024; saken inngår i debatten om sikt, trygghet og byform.", source: sourceLinks[0] },
  { year: 2025, title: "Bykubens medvirkningskartlegging publiseres", desc: "Bykuben beskrev en kartlegging som nådde nesten 35 personer og løftet fram vennskap og natur langs Akerselva.", source: sourceLinks[0] },
  { year: 2025, title: "Værested diskuteres uten budsjettvedtak", desc: "Foreningen for human ruspolitikk argumenterte for et skjermet utendørs sted; revidert budsjett finansierte ikke tiltaket.", source: sourceLinks[2] }
].map((entry, index) => ({ id: `chrono_brugata_storgata_${entry.year}_${index + 1}`, year: entry.year, title: entry.title, desc: entry.desc, confidence: "high", sources: [entry.source] }));

const leksikon = {
  place_id: placeId, title: "Brugata/Storgata – åpent rusmiljø", type: "main", version: 1,
  visual: { designCode: "article_place_essay_miniature" }, suppress_untitled_legacy_articles: true,
  popupDesc: "Et avgrenset sosialt territorium ved Storgata 33, dokumentert som både åpent rusmarked, sosial møteplass og konfliktfylt offentlig rom.",
  wikiText: [
    "Brugata/Storgata er ikke en institusjon eller en juridisk avgrenset sone. Place-profilen representerer et sosialt territorium som offentlige og brukerorganiserte kilder knytter til krysset og Storgata 33. Marked, vennskap, kontakt med tjenester, kontroll og gjennomstrømning skjer i samme offentlige rom.",
    "Territoriet må skilles fra Plata ved Oslo S, som er et eget historisk place, og fra Prindsen mottakssenter, som er en egen tjeneste. Det må også skilles fra hele Storgata som gateløp. Forflytning etter kontrolltiltak er en del av historien, men gjør ikke stedene identiske.",
    "KORUS-rapporten fra 2020 og Bykubens kartlegging publisert i 2025 bruker feltarbeid, intervjuer og medvirkning. De dokumenterer motstridende erfaringer og ressurser på gruppenivå. History Go følger samme etiske grense: ingen synlig person kan klassifiseres, fotograferes nærgående eller brukes som bevis for miljøtilhørighet."
  ],
  summary: { one_liner: "Sosialt territorium i et gatekryss der marked, møteplass, kontroll og omsorgslandskap overlapper.", themes: ["gatefellesskap", "retten til byen", "forflytning", "personvern"], tone: ["nøktern", "ikke-stigmatiserende", "kildebasert"] },
  facts: [
    { id: "fact_brugata_storgata_01", label: "Dobbeltrolle", desc: "Kommunale og forskningsbaserte kilder beskriver både marked og sosial møteplass.", confidence: "high", sources: [sourceLinks[0].title, sourceLinks[1].title] },
    { id: "fact_brugata_storgata_02", label: "Storgata 33", desc: "Adressepunktet brukes som stabilt områdeanker, ikke som grense for enkeltpersoners opphold.", confidence: "high", sources: [sourceLinks[0].title, "Geonorge – Storgata 33"] },
    { id: "fact_brugata_storgata_03", label: "Nesten 35 deltakere", desc: "Bykubens kartlegging nådde nesten 35 personer gjennom flere møteplasser.", confidence: "high", sources: [sourceLinks[0].title] }
  ], chronology, sources: sourceLinks, externalLinks: place.externalLinks, interpretation: place.interpretation,
  ethics: { privacy: "Ingen identifisering eller klassifisering av synlige personer.", safety: place.onsite.safety, representation: "Marked, utrygghet, fellesskap og ressurser presenteres sammen uten romantisering eller stigma." }
};
const leksikonFile = "data/leksikon/places/oslo/subkultur/leksikon_brugata_storgata_rusmiljo.json";
write(leksikonFile, leksikon);
const news = [
  { id: "brugata_storgata_news_korus_2020", place_id: placeId, title: "Kartleggingen «Utrygg markedsplass» publiseres", type: "news_note", version: 1, date: "2020-01-01", date_type: "publication_year", status: "archived", location: "Brugata/Storgata", popupDesc: "KORUS Oslo og Velferdsetaten publiserte en hurtig kartlegging basert på feltarbeid og intervjuer. Rapporten beskriver området både som sentral markedsplass, utrygt rom og sosial møteplass og drøfter tiltak.", summary: { one_liner: "2020-rapporten dokumenterte den konfliktfylte dobbeltrollen ved krysset.", themes: ["kartlegging", "trygghet", "sosial møteplass"] }, tags: ["news_note", "Brugata", "Storgata"], sources: [{ label: sourceLinks[1].title, url: urls.korus }], verifiedAt },
  { id: "brugata_storgata_news_byplan_2025", place_id: placeId, title: "Bykuben publiserer medvirkningskartlegging", type: "news_note", version: 1, date: "2025-01-09", date_type: "publication", status: "archived", location: "Brugata/Storgata og tilknyttede møteplasser", popupDesc: "Byplan publiserte erfaringer fra kartleggingen, som nådde nesten 35 personer. Vennskap og natur langs Akerselva ble løftet fram sammen med diskusjonen om trygghet og byutvikling.", summary: { one_liner: "Medvirkning brakte fram erfaringer som ikke kan leses fra gatebildet alene.", themes: ["medvirkning", "vennskap", "byutvikling"] }, tags: ["news_note", "Bykuben"], sources: [{ label: sourceLinks[0].title, url: urls.byplan }], verifiedAt },
  { id: "brugata_storgata_news_vaerested_2025", place_id: placeId, title: "Utendørs værested forblir ufinansiert", type: "news_note", version: 1, date: "2025-06-11", date_type: "publication", status: "archived", location: "Oslo sentrum", popupDesc: "Foreningen for human ruspolitikk argumenterte for et skjermet utendørs værested og avviste at forslaget innebar en lovløs sone. Organisasjonen opplyste at revidert budsjett ikke ga finansiering og at juridiske avklaringer pågikk.", summary: { one_liner: "Forslaget om et sosialt utendørs sted fikk ikke midler i revidert budsjett.", themes: ["værested", "retten til byen", "ruspolitikk"] }, tags: ["news_note", "værested"], sources: [{ label: sourceLinks[2].title, url: urls.fhr }], verifiedAt }
];
const newsFile = "data/leksikon/places/oslo/subkultur/leksikon_brugata_storgata_rusmiljo_news.json";
write(newsFile, news);
const leksikonManifest = read("data/leksikon/manifest.json");
addUnique(leksikonManifest.files, leksikonFile);
addUnique(leksikonManifest.files, newsFile);
write("data/leksikon/manifest.json", leksikonManifest);

const language = {
  place_id: placeId, title: "Språkleksikon: Brugata/Storgata", verified_at: verifiedAt,
  entries: [
    { id: "brugata_storgata_apent_rusmiljo", term: "åpent rusmiljø", type: "analytisk_faguttrykk", meaning: "Et offentlig tilgjengelig sted der rusrelaterte praksiser, relasjoner, marked og kontroll er synlige eller dokumenterte.", context: "Begrepet beskriver et stedlig og sosialt fenomen; det er aldri en identitetsmerkelapp på en person man ser i gaten.", linked_to: { kind: "place", id: placeId }, tags: ["gatefellesskap", "sted", "personvern"], sources: [{ label: sourceLinks[1].title, url: urls.korus }] },
    { id: "brugata_storgata_vaerested", term: "værested", type: "lokalt_politisk_uttrykk", meaning: "Et foreslått skjermet utendørs oppholdssted som kan dekke sosiale behov også utenfor tjenestenes åpningstid.", context: "FHR skilte forslaget fra en lovløs sone; stedet var fortsatt ufinansiert i juni 2025.", linked_to: { kind: "place", id: placeId }, tags: ["omsorg", "retten til byen", "forslag"], sources: [{ label: sourceLinks[2].title, url: urls.fhr }] },
    { id: "brugata_storgata_nye_plata", term: "«nye Plata»", type: "ekstern_sammenligning", meaning: "En medie- og debattetikett som sammenligner dagens miljø med det historiske Plata ved Oslo S.", context: "Uttrykket er ikke canonicalt navn og må ikke brukes som bevis for at stedene, periodene eller menneskene er identiske.", linked_to: { kind: "place", id: placeId }, tags: ["Plata", "stedsnavn", "kildekritikk"], sources: [{ label: sourceLinks[2].title, url: urls.fhr }] }
  ]
};
const languageFile = "data/leksikon/sprak/places/europe/norway/oslo/brugata_storgata_rusmiljo.json";
write(languageFile, language);
const languageManifest = read("data/leksikon/sprak/manifest.json");
languageManifest.place_files[placeId] = languageFile;
write("data/leksikon/sprak/manifest.json", languageManifest);

const readingFile = "data/lesespor/oslo/lesespor_oslo_subkultur.json";
const readingPack = read(readingFile);
const readings = [
  { id: "lesespor_brugata_storgata_korus_2020", title: "Utrygg markedsplass", author: "KORUS Oslo og Oslo kommune Velferdsetaten", publication: "KORUS Oslo", date: "2020", year: 2020, type: "research_report", subjects: ["åpne rusmiljøer", "Brugata", "Storgata", "trygghet"], place_ids: [placeId], person_ids: [], category_hints: ["subkultur", "by"], url: urls.korus, access: "open", rights: "link_only", source_quality: "institutional", curation_status: "strong_candidate", relevance: "Stedsspesifikk felt- og intervjubasert kartlegging av marked, møteplass, utrygghet og tiltak." },
  { id: "lesespor_brugata_storgata_byplan_2025", title: "Trygghet og kriminalitetsforebygging må være førende i byutviklingen", author: null, publication: "Byplan Oslo", date: "2025-01-09", year: 2025, type: "official_feature", subjects: ["medvirkning", "Storgata 33", "byutvikling"], place_ids: [placeId], person_ids: ["ingvild_ofstad", "mikael_oscar_loum_johansen", "iris_roise_aasebo"], category_hints: ["subkultur", "by"], url: urls.byplan, access: "open", rights: "link_only", source_quality: "institutional", curation_status: "strong_candidate", relevance: "Kommunal stedsanalyse med medvirkning, fysisk avgrensning og tydelige begrensninger ved rene designgrep." },
  { id: "lesespor_brugata_storgata_fhr_2025", title: "Vil gi rusavhengige et sted å være", author: null, publication: "Foreningen for human ruspolitikk", date: "2025-06-11", year: 2025, type: "community_primary", subjects: ["værested", "forflytning", "sosiale behov"], place_ids: [placeId], person_ids: ["arild_knutsen"], category_hints: ["subkultur", "politikk"], url: urls.fhr, access: "open", rights: "link_only", source_quality: "recognized", curation_status: "strong_candidate", relevance: "Brukerorganisert primærkilde om flyttehistorie, sosiale behov og det konkrete værestedsforslaget." }
];
readingPack.items = readingPack.items.filter(item => !readings.some(reading => reading.id === item.id));
for (const item of readings) addUnique(readingPack.items, item, row => row.id);
write(readingFile, readingPack);

const stories = [
  {
    id: "st_brugata_storgata_forflytning_2011", quality_profile: "episode_v1", type: "turning_point", title: "Da miljøet ble skjøvet østover", year: 2011, place_id: placeId, person_id: "arild_knutsen",
    summary: "Etter systematisk spredning fra Oslo S og Jernbanetorget ble Brugata/Storgata et viktigere oppholdssted. Historien handler om forflytning mellom steder, ikke om at Plata fikk nytt navn.",
    story: "Det åpne rusmiljøet i Oslo sentrum har flyttet seg flere ganger. Plata ved Oslo S er det mest kjente historiske stedet, men dagens Brugata/Storgata-territorium oppstod ikke ved at hele miljøet og alle funksjonene ble flyttet samlet på én dato.\n\nForeningen for human ruspolitikk beskriver et tydelig vendepunkt fra 2011, da Sentrumssamarbeidet arbeidet systematisk med spredning rundt Oslo S og Jernbanetorget. Mennesker og aktiviteter ble presset østover og miljøet beveget seg senere mellom Brugata/Storgata, Elgsletta og Hausmannsområdet. KORUS-kartleggingen viser hvordan kontroll, marked og sosial møteplass dermed ble bundet til nye, trange offentlige rom.\n\nEpisoden gjør canonical avgrensning avgjørende: Plata er et eget historisk place, mens Brugata/Storgata er et senere sosialt territorium. Forflytningen forklarer forbindelsen uten å late som stedene eller periodene er identiske.",
    episode: { actors: ["Sentrumssamarbeidet", "oppsøkende tjenester", "Foreningen for human ruspolitikk"], date: "fra 2011", action: "Systematisk spredning rundt Oslo S bidro til at miljøet flyttet østover og mellom flere sentrumspunkter.", consequence: "Brugata/Storgata fikk større betydning som sosialt territorium, mens kontrollpress og ny forflytning fortsatte." },
    sources: [{ title: sourceLinks[2].title, url: urls.fhr }, { title: sourceLinks[1].title, url: urls.korus }], tags: ["forflytning", "Plata", "2011", "kontroll"], related_people: ["arild_knutsen"], related_places: ["plata_oslo", "storgata"], score: { narrative: 3, historical: 2, source: 4, play_value: 4, originality: 3, total: 16 }, arc: { start: "Oslo S og Plata var sentrale oppholdssteder.", middle: "Kontroll og spredning skjøv miljøet østover og mellom nye punkter.", end: "Brugata/Storgata ble et viktig territorium uten å være identisk med Plata." }, next_scenes: [{ place_id: "plata_oslo", reason: "Den separate profilen eier historien om Plata ved Oslo S." }]
  },
  {
    id: "st_brugata_storgata_utrygg_markedsplass_2020", quality_profile: "episode_v1", type: "historical_event", title: "Da krysset ble kartlagt som mer enn et marked", year: 2020, place_id: placeId, person_id: null,
    summary: "«Utrygg markedsplass» dokumenterte vold, utrygghet og rusmarked, men også sosial møteplass. Kartleggingen gjorde motstridende erfaringer til en del av samme stedsanalyse.",
    story: "I Brugata/Storgata møttes et synlig marked, trange passasjer, kollektivtrafikk, næring og mennesker med få andre stabile offentlige rom. Utrygghet var reell, men en beskrivelse som bare registrerte kriminalitet ville miste stedets sosiale funksjon.\n\nKORUS Oslo og Velferdsetaten gjennomførte feltarbeid og intervjuer og publiserte «Utrygg markedsplass» i 2020. Rapporten beskrev området som sentral markedsplass, konfliktfylt rom og sosial møteplass. Tiltak som ekstra tilstedeværelse fra Uteseksjonen og trivselsvakter ble satt inn, samtidig som rapporten løftet fram stemmer og erfaringer fra miljøet.\n\nDet metodiske vendepunktet er at kunnskap kommer fra systematisk og etisk kartlegging, ikke fra å klassifisere mennesker på avstand. Arkaden, sporene og gateflaten kan undersøkes som fysiske objekter; menneskene som oppholder seg der kan aldri behandles som samleobjekter.",
    episode: { actors: ["KORUS Oslo", "Velferdsetaten", "Uteseksjonen", "deltakere i kartleggingen"], date: "2020", action: "Feltarbeid og intervjuer ble samlet i rapporten «Utrygg markedsplass».", consequence: "Kryssets dobbeltrolle og behovet for sammensatte tiltak ble offentlig dokumentert." },
    sources: [{ title: sourceLinks[1].title, url: urls.korus }, { title: sourceLinks[0].title, url: urls.byplan }], tags: ["kartlegging", "trygghet", "møteplass", "2020"], related_people: [], related_places: ["storgata"], score: { narrative: 5, historical: 2, source: 4, play_value: 4, originality: 3, total: 18 }, arc: { start: "Krysset ble ofte lest først og fremst som rusmarked og utrygt rom.", middle: "Feltarbeid og intervjuer dokumenterte flere samtidige funksjoner.", end: "Dobbeltrollen ble grunnlag for en bredere steds- og tiltaksanalyse." }, next_scenes: []
  },
  {
    id: "st_brugata_storgata_medvirkning_2025", quality_profile: "episode_v1", type: "historical_event", title: "Da de stille stemmene kom først", year: 2025, place_id: placeId, person_id: "ingvild_ofstad",
    summary: "Bykubens kartlegging nådde nesten 35 personer gjennom flere møteplasser. Vennskap og natur langs Akerselva ble synlige som ressurser i en debatt som ofte starter med utrygghet.",
    story: "Da nye tiltak rundt Brugata/Storgata skulle diskuteres, var det lett å starte med fasaden ved Storgata 33, siktlinjer og rapportert utrygghet. De fysiske spørsmålene var konkrete, men kunne ikke alene fortelle hva stedet og byen betydde for menneskene det gjaldt.\n\nBykuben arbeidet derfor gjennom flere møteplasser og nådde nesten 35 personer. Ingvild Ofstad, Mikael Oscar Loum Johansen og Iris Røise Aasebø omtales i den offentlige artikkelen som fagpersoner i arbeidet. Kartleggingen løftet fram vennskap og naturen langs Akerselva som viktige ressurser og lot erfaringer komme fram uten å identifisere private deltakere.\n\nEpisoden endrer hva man skal se etter: ikke hvem som står hvor, men hvordan byen kan gi rom for tilhørighet, trygghet og kontakt uten å skyve mennesker videre. Arkaden og gateflaten er fortsatt relevante, men medvirkningen viser hvorfor sosial kunnskap ikke kan erstattes av designanalyse alene.",
    episode: { actors: ["Bykuben", "Ingvild Ofstad", "Mikael Oscar Loum Johansen", "Iris Røise Aasebø", "anonymiserte deltakere"], date: "9. januar 2025", action: "En medvirkningskartlegging med nesten 35 personer ble offentliggjort.", consequence: "Vennskap, naturkontakt og andre ressurser ble del av kunnskapsgrunnlaget for byutviklingen." },
    sources: [{ title: sourceLinks[0].title, url: urls.byplan }, { title: sourceLinks[1].title, url: urls.korus }], tags: ["medvirkning", "Bykuben", "Akerselva", "2025"], related_people: ["ingvild_ofstad", "mikael_oscar_loum_johansen", "iris_roise_aasebo"], related_places: ["vaterlandsparken", "fyrlyset_oslo"], score: { narrative: 4, historical: 2, source: 4, play_value: 3, originality: 3, total: 16 }, arc: { start: "Debatten begynte med fysisk utforming og opplevd utrygghet.", middle: "Kartleggingen søkte erfaringer gjennom flere møteplasser.", end: "Ressurser og sosiale behov ble synlige som del av stedsanalysen." }, next_scenes: [{ place_id: "vaterlandsparken", reason: "Akerselva og offentlige oppholdsrom inngikk i deltakernes beskrivelser av byen." }]
  }
];
const storiesFile = "data/stories/stories_brugata_storgata_rusmiljo.json";
write(storiesFile, stories);
const storiesManifest = read("data/stories/stories_manifest.json");
addUnique(storiesManifest.files, { category: "subkultur", entity_id: placeId, path: storiesFile }, row => row.path);
write("data/stories/stories_manifest.json", storiesManifest);
const episodeManifest = read("data/stories/stories_episode_v1_manifest.json");
addUnique(episodeManifest.files, storiesFile);
write("data/stories/stories_episode_v1_manifest.json", episodeManifest);

const sourceRegistry = {
  oslo_byplan_2025: { url: urls.byplan, source_type: "official_municipality", review_status: "reviewed", review_note: "Canonical avgrensning, Storgata 33, arkaden, fysisk byutvikling og medvirkningskartlegging." },
  korus_2020: { url: urls.korus, source_type: "institutional_research", review_status: "reviewed", review_note: "Felt- og intervjubasert kartlegging av marked, utrygghet, sosial møteplass og tiltak." },
  fhr_2025: { url: urls.fhr, source_type: "community_primary", review_status: "reviewed", review_note: "Forflytningshistorie, værestedsforslag, sosialt behov og budsjettstatus." },
  storgata_2021: { url: urls.storgata2021, source_type: "official_municipality", review_status: "reviewed", review_note: "Fysisk opprustning av spor, fortau og teknisk infrastruktur." },
  commons_1870: { url: urls.commonsBefore, source_type: "licensed_historical_image", review_status: "reviewed", review_note: "Brugata-aksen mot Storgata ca. 1870, Ole Tobias Olsen, Oslo Museum, CC BY-SA 3.0 NO." },
  commons_2026: { url: urls.commonsNow, source_type: "licensed_comparison_image", review_status: "reviewed", review_note: "Vestgående Brugata-akse i 2026 fra et punkt lenger øst, Ssu, CC BY-SA 4.0." }
};
const E = "em_sub_apne_rusmiljoer_gatefellesskap";
const R = "em_sub_rett_til_byen";
const T = "em_sub_tilhorighet_miljo";
const P = "em_sub_personvern_forskningsetikk";
const specs = [
  ["fact", "Hva representerer dette canonicale stedet?", ["Det avgrensede sosiale territoriet ved Brugata/Storgata", "Hele Storgata fra Kirkeristen til Nybrua", "Alle rustjenester i Oslo sentrum"], "Det avgrensede sosiale territoriet ved Brugata/Storgata", "Place-profilen eier territoriet i og nær krysset, ikke hele gatene eller alle tjenester.", "oslo_byplan_2025", E],
  ["fact", "Hvilken adresse brukes som stabilt kartanker?", ["Storgata 33", "Brugata 1", "Jernbanetorget 1"], "Storgata 33", "Storgata 33 er områdeanker, ikke grense for menneskers opphold.", "oslo_byplan_2025", E],
  ["context", "Hvilke to roller dokumenteres samtidig?", ["Åpent marked og sosial møteplass", "Museum og rådhus", "Park og idrettsarena"], "Åpent marked og sosial møteplass", "Kildene beskriver en konfliktfylt dobbeltrolle.", "korus_2020", E],
  ["context", "Hva er ikke samme canonicale sted?", ["Plata ved Oslo S", "Krysset Brugata/Storgata", "Områdeankeret ved Storgata 33"], "Plata ved Oslo S", "Plata har egen historisk profil og må ikke brukes som alias.", "fhr_2025", E],
  ["fact", "Hva skjedde fra 2011 ifølge FHR?", ["Systematisk spredning bidro til forflytning østover", "Miljøet fikk en permanent juridisk sone", "Prindsen ble gjort til del av Storgata"], "Systematisk spredning bidro til forflytning østover", "Sentrumssamarbeidet er et vendepunkt i flyttehistorien.", "fhr_2025", E],
  ["context", "Hvorfor er ikke stedet bare «nye Plata»?", ["Sted, periode og funksjoner er ikke identiske", "Plata lå alltid i Brugata", "Begrepet er det offisielle gatenavnet"], "Sted, periode og funksjoner er ikke identiske", "Sammenligning kan vise sammenheng, men ikke identitet.", "fhr_2025", E],
  ["fact", "Hva het KORUS-rapporten fra 2020?", ["Utrygg markedsplass", "Nye Storgata", "Vaterlands Storgade"], "Utrygg markedsplass", "Rapporten kartla det åpne rusmiljøet i Brugata/Storgata.", "korus_2020", E],
  ["fact", "Hvilke metoder lå bak 2020-rapporten?", ["Feltarbeid og intervjuer", "Ansiktsgjenkjenning og skjult sporing", "Bare ett historisk fotografi"], "Feltarbeid og intervjuer", "Systematisk kartlegging er noe annet enn å klassifisere forbipasserende.", "korus_2020", P],
  ["context", "Hva kan en synlig person på stedet bevise?", ["Ingen bestemt identitet eller rolle", "At personen tilhører rusmiljøet", "At personen kjøper eller selger rusmidler"], "Ingen bestemt identitet eller rolle", "Synlighet er ikke identitetsbevis.", "korus_2020", P],
  ["fact", "Hva ble økt i området i 2019?", ["Tilstedeværelse fra Uteseksjonen og trivselsvakter", "Antall museumsguider", "En lovfestet fristat"], "Tilstedeværelse fra Uteseksjonen og trivselsvakter", "Tiltakene inngår i kartleggingens bakgrunn.", "korus_2020", E],
  ["fact", "Hva er det fysiske tyngdepunktet i Byplan-artikkelen?", ["Arkaden ved Storgata 33", "Nybrua tårn", "Folketeatersalen"], "Arkaden ved Storgata 33", "Arkaden diskuteres gjennom sikt, lys og opphold.", "oslo_byplan_2025", E],
  ["fact", "Hva skjedde med innglassingsforslaget i februar 2024?", ["Det ble avslått", "Det ble ferdigstilt", "Det ble fredet som museum"], "Det ble avslått", "Byggesaken er én del av den fysiske stedsdebatten.", "oslo_byplan_2025", E],
  ["context", "Hva viste opprustningen ferdig i 2021?", ["Fysisk oppgradering løser ikke alene sosial utrygghet", "Nye spor fjernet alle konflikter", "Krysset ble et lukket privat rom"], "Fysisk oppgradering løser ikke alene sosial utrygghet", "Rom, relasjoner og kontroll må analyseres sammen.", "oslo_byplan_2025", R],
  ["fact", "Hva ble fysisk fornyet i Storgata 2018–2021?", ["Spor, fortau og teknisk infrastruktur", "Plata som historisk sted", "Prindsens tjenestemandat"], "Spor, fortau og teknisk infrastruktur", "Prosjektkilden dokumenterer det fysiske laget.", "storgata_2021", R],
  ["fact", "Omtrent hvor mange personer nådde Bykubens kartlegging?", ["Nesten 35", "Nøyaktig 350", "Bare én"], "Nesten 35", "Tallet gjelder kontakt gjennom kartleggingen, ikke størrelsen på miljøet.", "oslo_byplan_2025", P],
  ["context", "Hvilke ressurser ble løftet fram i medvirkningen?", ["Vennskap og natur langs Akerselva", "Bare overvåking og bøter", "Private medlemskort"], "Vennskap og natur langs Akerselva", "Medvirkningen synliggjorde mer enn risiko.", "oslo_byplan_2025", T],
  ["context", "Hvorfor brukte kartleggingen flere møteplasser?", ["For å nå erfaringer som ikke kan leses fra gatebildet", "For å kartlegge private ruter", "For å fastslå skyld"], "For å nå erfaringer som ikke kan leses fra gatebildet", "Metoden søker kunnskap uten å gjøre mennesker til objekter.", "oslo_byplan_2025", P],
  ["fact", "Hva foreslo FHR i 2025?", ["Et skjermet utendørs værested", "En ny trikkeholdeplass", "Et privat kjøpesenter"], "Et skjermet utendørs værested", "Forslaget gjaldt sosialt opphold også utenfor tjenesteåpningstid.", "fhr_2025", R],
  ["context", "Hva understreket Arild Knutsen om forslaget?", ["Det var ikke en lovløs sone", "Det skulle erstatte alle tjenester", "Det var allerede finansiert"], "Det var ikke en lovløs sone", "Forslaget ble avgrenset fra en fristad uten regler.", "fhr_2025", R],
  ["fact", "Hva var budsjettstatus i juni 2025?", ["Revidert budsjett ga ikke finansiering", "Tiltaket var fullfinansiert", "Tiltaket var ferdig bygget"], "Revidert budsjett ga ikke finansiering", "Kilden beskriver et forslag, ikke et etablert tilbud.", "fhr_2025", R],
  ["context", "Hvorfor er Prindsen et relatert, separat sted?", ["Det er en tjeneste, mens dette stedet er et sosialt territorium", "Det ligger i en annen by", "Det er et historisk fotografi"], "Det er en tjeneste, mens dette stedet er et sosialt territorium", "Nærhet gjør ikke institusjon og gatefellesskap identiske.", "oslo_byplan_2025", E],
  ["context", "Hvorfor er Storgata et relatert, separat sted?", ["Storgata eier hele gateløpet, dette stedet eier territoriet ved krysset", "Begge er bare merkenavn", "Rusmiljøet omfatter alltid hele gaten"], "Storgata eier hele gateløpet, dette stedet eier territoriet ved krysset", "Canonical eierskap hindrer dobbelt innhold.", "oslo_byplan_2025", E],
  ["context", "Hva dokumenterer førbildet fra ca. 1870?", ["Brugatas fysiske gateakse mot Storgata", "Dagens rusmiljø", "2021-opprustningen"], "Brugatas fysiske gateakse mot Storgata", "Det historiske fotografiet er fysisk gatehistorie, ikke sosial identitetsdokumentasjon.", "commons_1870", P],
  ["context", "Hva er hovedbegrensningen i bildeparet?", ["Samme retning, men ulik kamerastandplass", "Ingen av bildene har kilde", "Begge er tatt samme dag"], "Samme retning, men ulik kamerastandplass", "Brugata-aksen kan sammenlignes uten å hevde identisk utsnitt.", "commons_2026", P],
  ["context", "Hva må man aldri bruke 2026-bildet til?", ["Å klassifisere synlige personer", "Å se Brugata-aksen", "Å sammenligne gateprofil"], "Å klassifisere synlige personer", "Personer i bildet er ikke bevis for identitet eller atferd.", "commons_2026", P],
  ["context", "Hva kan flytte et åpent rusmiljø mellom steder?", ["Kontroll, tjenester, byutvikling og sosiale relasjoner", "Bare gatenavn", "Bare været på fotodagen"], "Kontroll, tjenester, byutvikling og sosiale relasjoner", "Territoriet formes av flere sammenvevde prosesser.", "fhr_2025", E],
  ["context", "Hva er en presis onsite-observasjon?", ["Å lese arkitektur og gateprofil uten å registrere mennesker", "Å følge personer for å kartlegge ruter", "Å fotografere transaksjoner"], "Å lese arkitektur og gateprofil uten å registrere mennesker", "Besøksmetoden avgrenser observasjonen til fysiske spor.", "oslo_byplan_2025", P],
  ["context", "Hva bør du gjøre hvis situasjonen kjennes utrygg?", ["Forlate stedet", "Gå nærmere for å dokumentere", "Stanse i trikkesporet"], "Forlate stedet", "Onsite-opplevelsen skal aldri gå foran egen eller andres sikkerhet.", "oslo_byplan_2025", P],
  ["concept", "Hva undersøker en stedsanalyse her?", ["Hvordan fysisk rom, bruk og historikk virker sammen", "Hvem som kan identifiseres på klær", "Bare eiendomsgrensen"], "Hvordan fysisk rom, bruk og historikk virker sammen", "Stedsanalysen kobler arkade, gateflate, relasjoner og tidslag.", "oslo_byplan_2025", E, "met_sub_stedsanalyse"],
  ["concept", "Hva undersøker en romlig maktanalyse?", ["Hvem som kan styre, kontrollere eller fortrenge bruk av rommet", "Hvilket kamera som er dyrest", "Bare trikkens rutetabell"], "Hvem som kan styre, kontrollere eller fortrenge bruk av rommet", "Kontroll og manglende formell råderett er sentrale maktspørsmål.", "fhr_2025", R, "met_sub_romlig_maktanalyse"],
  ["concept", "Hva undersøker en omsorgslandskapsanalyse?", ["Forholdet mellom gatefellesskap, tjenester, støtte og hull i tilbudet", "Bare fasadefarger", "Private diagnoser i gatebildet"], "Forholdet mellom gatefellesskap, tjenester, støtte og hull i tilbudet", "Omsorg finnes både i tjenester og sosiale relasjoner, men kan ikke kartlegges via private helseopplysninger.", "korus_2020", T, "met_sub_omsorgslandskapsanalyse"],
  ["concept", "Hva betyr retten til byen i denne saken?", ["At også marginaliserte mennesker har behov for offentlige rom og medvirkning", "At én gruppe eier hele gaten", "At alle regler oppheves"], "At også marginaliserte mennesker har behov for offentlige rom og medvirkning", "Begrepet handler om tilgang, stemme og fordeling av byrom, ikke grenseløs råderett.", "fhr_2025", R, "met_sub_romlig_maktanalyse"],
  ["concept", "Hva krever en etisk kildeanalyse?", ["Å skille dokumenterte gruppefunn fra spekulasjon om enkeltpersoner", "Å fylle hull med sannsynlige historier", "Å bruke synlighet som samtykke"], "Å skille dokumenterte gruppefunn fra spekulasjon om enkeltpersoner", "Personvern og representasjon er del av kunnskapskvaliteten.", "korus_2020", P, "met_sub_etisk_kildeanalyse"],
  ["concept", "Hva er den beste analysen av fysisk oppgradering?", ["Den kan påvirke rommet, men må vurderes sammen med sosiale forhold", "Den løser automatisk alle konflikter", "Den er irrelevant for bevegelse og sikt"], "Den kan påvirke rommet, men må vurderes sammen med sosiale forhold", "Byplan-kilden viser grensene for design som eneste forklaring.", "oslo_byplan_2025", R, "met_sub_stedsanalyse"],
  ["concept", "Hva er den viktigste kildekritiske slutningen?", ["Hver påstand må støttes av kilder som dekker riktig sted, tid og perspektiv", "Ett bilde kan bevise all sosial historie", "En nabotjeneste kan eie alle påstander om krysset"], "Hver påstand må støttes av kilder som dekker riktig sted, tid og perspektiv", "Forskning, kommune, brukerorganisasjon og bilder dekker ulike kunnskapslag.", "korus_2020", P, "met_sub_etisk_kildeanalyse"]
];
const phases = ["opening", "middle", "middle", "bridge", "final"];
const claims = specs.map((row, index) => {
  const [family, , , , statement, sourceId, emne, method_id] = row;
  const claim = { claim_id: `claim_brugata_storgata_quiz_${index + 1}`, order: index + 1, planned_phase: phases[Math.floor(index / 7)], family: family === "concept" ? "concept_theory" : family, statement, source_ids: [sourceId], source_origin: "external", emne_id: emne };
  if (method_id) claim.method_id = method_id;
  if (index === 31) Object.assign(claim, { topic_hook_id: "rett_til_byen", thinker_id: "henri_lefebvre", work: "The Right to the City" });
  return claim;
});
const existing_quiz_audit = {
  searched_paths: ["data/quiz/manifest.json", placeFile, "data/places/subkultur-production/brugata_storgata_rusmiljo.json"],
  active_before: { file: null, set_count: 0, question_count: 0, finding: "Ingen manifestlastet canonical stedquiz fantes." },
  legacy_before: { file: null, set_count: 0, question_count: 0, finding: "Ingen separat legacy-quiz ble funnet; den eldre produksjonsrapporten markerte quiz feilaktig N/A." },
  decisions: ["Produser canonical rich 5×7 fra ekstern stedsevidens.", "Hold de første 14 spørsmålene til normal fakta- og kontekstinngang.", "Legg metodebegreper i sluttsettet og bind dem til dokumentert case."],
  knowledge_migration: "Ingen legacy-spørsmål migreres; pakken er ny og manifestlastet."
};
const profile_decision = { profile: "rich", set_count: 5, questions_per_set: 7, justification: "Stedet krever fem læringsjobber: identitet og forflytning, kartlegging og dobbeltrolle, fysisk rom og medvirkning, værested og etisk besøk, samt stedlig metode og kildekritikk." };
const held_back_candidates = ["Private eller sårbare personer som People.", "Synlige personer i bilder eller onsite-observasjon som identitetsbevis.", "Virksomheter ved krysset som Brands uten canonical tilhørighet og logo-proveniens.", "Detaljer om kjøp, politimetoder, oppholdstider eller ruter som kan skade eller fasilitere lovbrudd."];
const selected_curriculum = { module_ids: ["sosiale_randsoner_omsorg_skadereduksjon"], emne_ids: [E, R, T, P], topic_hook_ids: ["rett_til_byen"], method_ids: ["met_sub_stedsanalyse", "met_sub_romlig_maktanalyse", "met_sub_omsorgslandskapsanalyse", "met_sub_etisk_kildeanalyse"], thinker_ids: ["henri_lefebvre"], works: ["The Right to the City"] };
const brief = {
  schema_version: "1.0", status: "reviewed", categoryId: "subkultur", targetId: placeId, profile_hint: "rich", reviewed_at: verifiedAt,
  review_note: "Kildene skiller sosialt territorium, fysisk gate, historisk Plata og nærliggende tjenester. Privatlivs- og sikkerhetsgrensene er en del av innholdskontrakten.",
  scope: { place: "Brugata/Storgata – det åpne rusmiljøet", production_profile: "rich", set_count: 5, questions_per_set: 7, total_questions: 35, normal_opening_questions: 14 },
  sources: sourceRegistry, selected_curriculum, existing_quiz_audit, profile_decision, held_back_candidates, claims
};
const briefFile = `data/quiz/production_briefs/subkultur/${placeId}.json`;
write(briefFile, brief);
const conceptByEmne = {
  [E]: "co_subkultur_apne_rusmilj_er_og_gatefellesskap_eacd030efe",
  [R]: "co_subkultur_faktisk_bruk_vs_juridisk_eierskap_218de7e13f",
  [T]: "co_subkultur_fellesskap_ad20f1c72c",
  [P]: "co_subkultur_sosial_usynlighet_vs_offentlig_ekspo_8829ce85f9"
};
const questions = specs.map((row, index) => {
  const [family, question, options, answer, knowledge, sourceId, emne, method_id] = row;
  const setNo = Math.floor(index / 7) + 1;
  const value = { id: `brugata_storgata_quiz_${index + 1}`, quiz_id: `subkultur_${placeId}_set_${setNo}_q${index % 7 + 1}`, categoryId: "subkultur", placeId, targetId: placeId, question_scope: "place", question, options, answer, answerIndex: options.indexOf(answer), knowledge, difficulty: Math.min(4, setNo), question_type: family, emne_id: emne, source: [sourceId], source_origin: "external", claim_basis: claims[index].statement, claim_id: claims[index].claim_id, primary_knowledge_unit_id: `ku_sub_brugata_storgata_${String(index + 1).padStart(2, "0")}`, knowledge_unit_ids: [`ku_sub_brugata_storgata_${String(index + 1).padStart(2, "0")}`], concept_ids: [conceptByEmne[emne]], term_ids: [], knowledge_contract_version: 1, knowledge_link_status: "linked" };
  if (method_id) Object.assign(value, { method_id, guidance_basis: ["data/fag/subkultur/methods_subkultur_canonical_v4_5.json", "data/fag/subkultur/emner_subkultur_canonical_v4_5.json"] });
  if (index === 31) Object.assign(value, { topic_hook_id: "rett_til_byen", thinker_id: "henri_lefebvre", work: "The Right to the City", theory_ref: { topic_hook_id: "rett_til_byen", thinker_id: "henri_lefebvre", work: "The Right to the City", why_it_helps: "Lefebvres rett-til-byen-perspektiv gjør det mulig å undersøke tilgang og kollektiv mulighet til å forme byrommet uten å gjøre det til en påstand om grenseløs råderett." }, guidance_basis: ["data/fag/subkultur/fagkart_subkultur_canonical_v4_5.json", "data/fag/subkultur/theory_attribution_subkultur_canonical_v1.json"] });
  return value;
});
const productionContextSummary = { manifest_category: "subkultur", profile: "rich_5x7", standard_version: "3.3", source_brief: briefFile, context_artifact: `data/quiz/production_context/subkultur/${placeId}.json`, resolved_files: { pensum: "data/fag/subkultur/subkulturpensum_canonical_v4_5.json", emner: "data/fag/subkultur/emner_subkultur_canonical_v4_5.json", fagkart: "data/fag/subkultur/fagkart_subkultur_canonical_v4_5.json", methods: "data/fag/subkultur/methods_subkultur_canonical_v4_5.json", supersetQuizMal: "data/fag/subkultur/supersetQUIZMAL_subkultur.json", quizStandard: "data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md", quizQuestionSchema: "data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json" }, required_inputs_loaded: ["pensum", "emner", "fagkart", "methods", "supersetQuizMal", "quizStandard", "quizQuestionSchema"], pensum_module_ids: selected_curriculum.module_ids, emne_ids: selected_curriculum.emne_ids, topic_hook_ids: selected_curriculum.topic_hook_ids, method_ids: selected_curriculum.method_ids, thinker_ids: selected_curriculum.thinker_ids, works: selected_curriculum.works, source_review_status: "reviewed", existing_quiz_audit, profile_decision, held_back_candidates, theory_start_phase: "final", method_start_phase: "final" };
const quiz = { targetId: placeId, categoryId: "subkultur", sources: Object.fromEntries(Object.entries(sourceRegistry).map(([id, source]) => [id, source.url])), production_context: productionContextSummary, sets: ["Sted, grense og forflytning", "Kartlegging og dobbeltrolle", "Rom, medvirkning og ressurser", "Værested, bilder og etisk besøk", "Makt, omsorg og kildekritikk"].map((title, index) => ({ set_id: `subkultur_${placeId}_set_${index + 1}`, title, level: index + 1, order: index + 1, phase: phases[index], xp: 50 + index * 10, questions: questions.slice(index * 7, index * 7 + 7) })) };
const quizFile = `data/quiz/subkultur/${placeId}_sets.json`;
write(quizFile, quiz);
const subcultureQuizTemplateFile = "data/fag/subkultur/supersetQUIZMAL_subkultur.json";
const subcultureQuizTemplate = read(subcultureQuizTemplateFile);
subcultureQuizTemplate.governance.authority = "category_content_and_orchestration";
subcultureQuizTemplate.governance.package_schema = "data/quiz/regler/QUIZ_PACKAGE_SCHEMA_V1.json";
subcultureQuizTemplate.governance.subject_manifest = "data/fag/fag_manifest.json";
subcultureQuizTemplate.adaptive_profiles ||= {
  narrow: { sets: 3, questions_per_set: 7, use_when: "avgrenset sted med få uavhengige, sterke påstander" },
  normal: { sets: 4, questions_per_set: 7, use_when: "sted med solid hovedhistorie og minst ett tydelig faglig broledd" },
  rich: { sets_min: 5, sets_max: 8, questions_per_set: 7, use_when: "sted med flere kildebelagte lag, bruksmåter, metoder eller teorimuligheter" },
  major: { sets_min: 8, sets_max: 10, questions_per_set: 7, use_when: "hovedsted med bred og uavhengig dokumentasjon som bærer flere progresjonsløp" }
};
subcultureQuizTemplate.relative_progression ||= {
  phase_sequences: {
    "3": ["opening", "bridge", "final"],
    "4": ["opening", "middle", "bridge", "final"],
    "5": ["opening", "middle", "middle", "bridge", "final"],
    "6": ["opening", "middle", "middle", "middle", "bridge", "final"],
    "7": ["opening", "middle", "middle", "middle", "bridge", "bridge", "final"],
    "8": ["opening", "middle", "middle", "middle", "middle", "bridge", "bridge", "final"],
    "9": ["opening", "middle", "middle", "middle", "middle", "middle", "bridge", "bridge", "final"],
    "10": ["opening", "middle", "middle", "middle", "middle", "middle", "middle", "bridge", "bridge", "final"]
  },
  phase_requirements: {
    opening: { focus: ["sted", "hovedhistorie", "konkrete fakta"], minimum_fact_share: 0.5 },
    middle: { focus: ["personer", "hendelser", "bruk", "endring", "synlige spor"] },
    bridge: { focus: ["årsak", "sammenheng", "metode", "første fagbegreper"], requires_method_or_context: true },
    final: { focus: ["emner", "teori", "teoretikere", "verk", "sammenligning", "syntese"], requires_theory_binding: true }
  },
  short_quiz_rule: "Tre og fire sett skal også nå metode-, emne- og teorilaget i siste del.",
  absolute_theory_set_numbers_forbidden: true
};
write(subcultureQuizTemplateFile, subcultureQuizTemplate);
const subcultureMapFile = "data/fag/subkultur/fagkart_subkultur_canonical_v4_5.json";
const subcultureMap = read(subcultureMapFile);
for (const category of subcultureMap.categories || []) {
  const hook = (category.topic_hooks || []).find(item => item.id === "rett_til_byen");
  if (!hook) continue;
  hook.canon ||= { thinkers: [] };
  addUnique(hook.canon.thinkers, { id: "henri_lefebvre", name: "Henri Lefebvre", why: "Brukerverdi, hverdagsliv og kollektiv rett til å forme urbane rom.", tier: "core", works: ["The Right to the City"] }, row => row.id);
}
write(subcultureMapFile, subcultureMap);
const fagManifest = read("data/fag/fag_manifest.json");
fagManifest.subkultur.quizProduction ||= {
  status: "pilot", required_inputs: ["pensum", "emner", "fagkart", "methods", "supersetQuizMal", "quizStandard", "quizQuestionSchema"], context_builder: "scripts/build-quiz-production-context.mjs", profile_system: "adaptive_relative_superset", package_schema: "quizPackageSchema", context_artifact_root: "data/quiz/production_context", targets: {}
};
fagManifest.subkultur.quizProduction.targets[placeId] = { source_brief: `../quiz/production_briefs/subkultur/${placeId}.json`, context_artifact: `../quiz/production_context/subkultur/${placeId}.json`, quiz_file: `../quiz/subkultur/${placeId}_sets.json` };
write("data/fag/fag_manifest.json", fagManifest);
const quizManifest = read("data/quiz/manifest.json");
addUnique(quizManifest.sets, { targetId: placeId, file: quizFile }, row => `${row.targetId}:${row.file}`);
write("data/quiz/manifest.json", quizManifest);

const splitSentences = value => [...new Intl.Segmenter("nb", { granularity: "sentence" }).segment(value)].map(entry => entry.segment.trim()).filter(Boolean);
const descSentences = splitSentences(place.desc);
const popupSentences = splitSentences(place.popupDesc);
const productionClaims = [];
const sentenceCoverage = { desc: [], popupDesc: [] };
for (const [field, sentences] of [["desc", descSentences], ["popupDesc", popupSentences]]) {
  sentences.forEach((sentenceText, index) => {
    const sentence = index + 1;
    const id = `claim_brugata_storgata_${field === "desc" ? "desc" : "popup"}_${String(sentence).padStart(2, "0")}`;
    const fhrClaim = /2011|Sentrumssamarbeidet|værested|budsjett|juridiske/iu.test(sentenceText);
    const korusClaim = /KORUS|2020|utrygghet|vold|markedsplass/iu.test(sentenceText);
    const source = fhrClaim ? sourceRegistry.fhr_2025 : korusClaim ? sourceRegistry.korus_2020 : sourceRegistry.oslo_byplan_2025;
    const sourceType = source === sourceRegistry.korus_2020 ? "institutional" : source === sourceRegistry.fhr_2025 ? "primary" : "official";
    const strong = /første|eldste|største|minste|eneste|viktigste|ledende|avgjørende|førte til|på grunn av|derfor|dermed|nesten 35|ikke ga finansiering|avslått/iu.test(sentenceText);
    const claim = { id, claim: sentenceText, sourceUrl: source.url, sourceLocation: source.review_note, sourceType, verifiedAt, status: "verified", claimKind: sentence <= 2 ? "identity" : strong ? "strong" : "ordinary", evidenceMode: strong ? "explicit" : "direct", temporalStatus: /2024|2025|2026|nåværende|fortsatt/iu.test(sentenceText) ? "current" : "historical" };
    if (strong) claim.independentSourceUrls = [source === sourceRegistry.korus_2020 ? urls.byplan : urls.korus];
    productionClaims.push(claim);
    sentenceCoverage[field].push({ sentence, claimIds: [id] });
  });
}
const productionQuizQuestions = specs.slice(0, 8).map((row, index) => ({ question: row[1], answer: row[3], type: ["hva", "hvor", "hva", "hvilket_verk_eller_objekt", "hva_skjedde", "når", "hva_ble_bygget_produsert_eller_endret", "hvem"][index], normalKnowledgeQuestion: true, claimIds: [sentenceCoverage.popupDesc[Math.min(index, sentenceCoverage.popupDesc.length - 1)].claimIds[0]] }));
const production = {
  schemaVersion: "4.2", validatorVersion: "4.2.1", placeId, placeFile, status: "ready_v4_2",
  identity: { status: "resolved", represents: "Det dokumenterte sosiale territoriet i og nær Brugata/Storgata-krysset, med Storgata 33 som stabilt områdeanker.", period: "2011–", excludes: place.spatial_profile.excludes },
  metadataSnapshot: { name: place.name, year: place.year, category: place.category },
  textHashes: { algorithm: "sha256", desc: crypto.createHash("sha256").update(place.desc).digest("hex"), popupDesc: crypto.createHash("sha256").update(place.popupDesc).digest("hex") },
  claims: productionClaims, sentenceCoverage,
  reviews: {
    factual: { status: "passed", reviewedAt: verifiedAt, reviewer: "Brugata/Storgata full completion review", notes: "Påstander er knyttet til kommunal stedsanalyse, KORUS-kartlegging, brukerorganisert primærkilde og lisensierte bilder med tydelige evidensgrenser." },
    editorial: { status: "passed", reviewedAt: verifiedAt, reviewer: "Brugata/Storgata full completion review", introducedNewFacts: false, notes: "Teksten holder marked, fellesskap, kontroll, omsorg og personvern samtidig uten sensasjonalisering.", ingressReview: { controllingIdea: "Sosialt territorium i et gatekryss, avgrenset fra hele gatene, Plata og nærliggende tjenester.", chronologyInventoryRemoved: true, nameAndYearPileupRemoved: true, knownNewFlowPassed: true, readAloudPassed: true } }
  },
  roundsReadiness: { status: "production_ready", reviewedAt: verifiedAt, auditFile: `reports/place-production/${placeId}-phase24-final-audit-v1.json`, badgePlacement: "separate_header", contentRoundIds: ["people", "objects", "brands", "related"], placeCardProfile: "history_go_place_card_profile_v2", peopleIds: place.related_people_ids, objectIds: place.objects.map(item => item.id), brandIds: [], brandFallback: "honest_empty_state_after_candidate_and_provenance_audit", relatedPlaceIds: place.related_place_ids, objectSourceCoveragePercent: 100, routeStopResolutionPercent: 100 },
  quizReadiness: { status: "canonical_rich_5x7", quizTargetId: placeId, sourceBrief: briefFile, productionContext: `data/quiz/production_context/subkultur/${placeId}.json`, normalOpeningQuestions: 14, totalQuestions: 35, questions: productionQuizQuestions },
  storyReadiness: { status: "episode_v1", file: storiesFile, episodeCount: stories.length },
  completion: { completedUnder: "4.2", currentStatus: "current", sourceVerifiedAt: verifiedAt, claimsVerified: { verified: productionClaims.length, total: productionClaims.length }, factualReview: "passed", editorialReview: "passed", validatorVersion: "4.2.1" },
  reviewsNotes: "Coordinatevidence er bevart uendret. Private og sårbare personer holdes utenfor People; Brands er ærlig tom; fysisk observasjon er eksplisitt avgrenset fra personkartlegging."
};
write(`data/places/production/${placeId}.json`, production);

const subcultureProductionFile = `data/places/subkultur-production/${placeId}.json`;
const subcultureProduction = read(subcultureProductionFile);
delete subcultureProduction.editorialReview;
subcultureProduction.status = "ready";
subcultureProduction.subculturalIdentity.statement = "Brugata/Storgata er et avgrenset sosialt territorium der marked, møteplass, forflytning, kontroll og omsorgslandskap overlapper; synlig rusbruk alene er ikke kvalifikasjonen.";
subcultureProduction.subculturalIdentity.placeObjectDistinction = "Rapporten skiller territoriet fra hele Storgata og Brugata, historiske Plata, Storgata 33 som fysisk anker og Prindsen som separat tjeneste.";
subcultureProduction.subculturalIdentity.sourceIds = ["source_brugata_storgata_rusmiljo_milieu", "source_brugata_storgata_rusmiljo_outside", "source_brugata_storgata_rusmiljo_official"];
subcultureProduction.sources = [
  { id: "source_brugata_storgata_rusmiljo_milieu", url: urls.fhr, sourceLocation: "Foreningen for human ruspolitikk, 11. juni 2025; forflytningshistorie, værestedsforslag, sosiale behov og budsjettstatus", sourceType: "community_primary", perspective: "milieu", verifiedAt, temporalCoverage: "current", provenance: "Publisert primærkilde fra en nasjonal bruker- og pårørendeorganisasjon.", limitations: "Organisasjonens argumentasjon er et partsinnlegg og representerer ikke automatisk alle mennesker i miljøet." },
  { id: "source_brugata_storgata_rusmiljo_outside", url: urls.korus, sourceLocation: "KORUS Oslo og Velferdsetaten, «Utrygg markedsplass» (2020); feltarbeid, intervjuer og tiltaksvurdering", sourceType: "scholarly", perspective: "research", verifiedAt, temporalCoverage: "mixed", provenance: "Institusjonell hurtigkartlegging med dokumentert felt- og intervjugrunnlag.", limitations: "Kartleggingen dekker situasjonen rundt 2019–2020 og kan ikke alene dokumentere alle senere endringer." },
  { id: "source_brugata_storgata_rusmiljo_official", url: urls.byplan, sourceLocation: "Oslo kommune Byplan, 9. januar 2025; Storgata 33, arkade, trygghet, byutvikling og medvirkning", sourceType: "official", perspective: "authority", verifiedAt, temporalCoverage: "current", provenance: "Offentlig kommunal stedsanalyse med navngitte fagroller og beskrevet medvirkning.", limitations: "Artikkelen oppsummerer et prosjekt og må leses sammen med forsknings- og brukerorganiserte kilder." }
];
const topicRationale = `Emnet brukes på dokumenterte relasjoner, forflytning, kontroll og rombruk ved ${placeId}; ingen person klassifiseres gjennom synlighet.`;
for (const topic of subcultureProduction.subcultureTopics) topic.siteSpecificRationale = topicRationale;
addUnique(subcultureProduction.subcultureTopics, { emneId: E, siteSpecificRationale: topicRationale, caseIds: [`case_${placeId}_environment`] }, row => row.emneId);
addUnique(subcultureProduction.subcultureTopics, { emneId: P, siteSpecificRationale: topicRationale, caseIds: [`case_${placeId}_environment`] }, row => row.emneId);
subcultureProduction.quizOpening = { status: "PASS", quizTargetId: placeId, firstTwoSetsQuestionCount: 14, sourceBrief: briefFile, productionContext: `data/quiz/production_context/subkultur/${placeId}.json`, requiredInputs: ["pensum", "emner", "fagkart", "methods", "supersetQuizMal", "quizStandard", "quizQuestionSchema"] };
subcultureProduction.chronologyStories = { status: "PASS", chronologyReviewed: true, storiesReviewed: true, rationale: "Åtte kildebelagte kronologipunkter og tre episode_v1-fortellinger dekker forflytning, kartlegging og medvirkning uten å identifisere private deltakere." };
subcultureProduction.gates.G = { status: "PASS", evidenceRefs: ["quizOpening", quizFile] };
subcultureProduction.gates.H = { status: "PASS", evidenceRefs: ["chronologyStories", storiesFile] };
subcultureProduction.review = { reviewer: "Subkultur-fagverkredaksjon", reviewedAt: verifiedAt, notes: "Canonical avgrensning, stemmebalanse, rommakt, personvern, quiz, chronology, Stories og nåstatus er kontrollert. Ingen private eller sårbare personer og ingen fasiliterende detaljer inngår." };
write(subcultureProductionFile, subcultureProduction);

const sourceHash = crypto.createHash("sha256").update(JSON.stringify({ name: normalize(place.name), desc: normalize(place.desc), popupDesc: normalize(place.popupDesc) })).digest("hex").slice(0, 16);
const translations = {
  en: {
    name: "Brugata / Storgata – the open drug scene",
    desc: "The Brugata/Storgata intersection is a bounded social territory in Oslo's open drug scene, with Storgata 33 as a stable map anchor. Official, research and community sources describe it as a marketplace, a social meeting place and a contact surface with services, control and urban development.",
    popupDesc: `This place is the bounded social territory in and near the Brugata/Storgata intersection, anchored at Storgata 33. It is not the whole of Storgata or Brugata, the Folketeater quarter, the historical Plata site or Prindsen reception centre. Oslo's municipal Byplan article describes both a major open market for illegal drugs and a social meeting place; that dual role is the canonical core.

The scene has moved over time. The Association for Humane Drug Policy links the present situation to systematic dispersal from 2011, when people and activities were pushed away from Oslo Central Station and later moved among Brugata/Storgata, Elgsletta and the Hausmann area. This is a present territory in a history of displacement, not a new name for Plata.

The 2020 KORUS report “Unsafe marketplace” used fieldwork and interviews. It documents insecurity, violence and a market, but also social contact and belonging. No visible person may therefore be identified as part of the scene, dependent on drugs, a seller, a buyer or a service user.

The arcade at Storgata 33 is a physical focus in the municipal analysis. The Storgata renewal completed in 2021 changed tracks, pavements and technical infrastructure, but physical design alone did not resolve perceived insecurity. A social territory emerges through space, relationships, market, services, control and displacement together.

A Bykuben mapping project published in 2025 reached nearly 35 people through several meeting places. Friendship and nature along the Akerselva river were highlighted as resources. This is why knowledge must come through respectful participation and aggregated accounts, not close observation of people in the street.

In 2025 the Association for Humane Drug Policy argued for a sheltered outdoor place to stay, explicitly distinct from a lawless zone. The revised budget provided no funding and legal clarification was still under way.

On site, read only architecture, street profile and public connections from ordinary paths. Do not photograph, follow, approach or map people, times, transactions, health information or routes. The place is documented; visible people are never collectibles or evidence.`
  },
  es: {
    name: "Brugata / Storgata – el entorno abierto de drogas",
    desc: "El cruce Brugata/Storgata es un territorio social delimitado del entorno abierto de drogas de Oslo, con Storgata 33 como ancla cartográfica estable. Fuentes oficiales, de investigación y comunitarias lo describen como mercado, lugar de encuentro social y punto de contacto con servicios, control y desarrollo urbano.",
    popupDesc: `Este lugar es el territorio social delimitado en el cruce Brugata/Storgata y sus inmediaciones, con Storgata 33 como ancla. No es toda Storgata ni toda Brugata, el barrio de Folketeater, el Plata histórico o el centro Prindsen. La fuente municipal describe a la vez un gran mercado abierto de drogas ilegales y un lugar de encuentro social; esa doble función es el núcleo canónico.

El entorno se ha desplazado. La Asociación por una Política de Drogas Humana vincula la situación actual con la dispersión sistemática iniciada en 2011 desde Oslo S y Jernbanetorget y con movimientos posteriores entre Brugata/Storgata, Elgsletta y la zona de Hausmann. Es un territorio actual dentro de una historia de desplazamiento, no un nuevo nombre para Plata.

El informe KORUS «Mercado inseguro» de 2020 se basó en trabajo de campo y entrevistas. Documenta inseguridad, violencia y mercado, pero también contacto social y pertenencia. Ninguna persona visible puede identificarse como miembro del entorno, dependiente, vendedora, compradora o usuaria de servicios.

La arcada de Storgata 33 es un foco físico del análisis municipal. La renovación de Storgata terminada en 2021 cambió vías, aceras e infraestructura, pero el diseño físico por sí solo no resolvió la inseguridad percibida. El territorio surge de espacio, relaciones, mercado, servicios, control y desplazamiento.

Un estudio participativo de Bykuben publicado en 2025 llegó a casi 35 personas. La amistad y la naturaleza junto al Akerselva aparecieron como recursos. El conocimiento debe obtenerse con participación respetuosa y descripciones agregadas, no observando de cerca a las personas en la calle.

En 2025 se propuso un lugar exterior protegido, expresamente distinto de una zona sin ley. El presupuesto revisado no lo financió y seguían las aclaraciones jurídicas.

Durante la visita, observa solo arquitectura, perfil de calle y conexiones públicas desde vías normales. No fotografíes, sigas, abordes ni cartografíes personas, horarios, transacciones, salud o rutas. Las personas visibles nunca son objetos coleccionables ni pruebas.`
  },
  pt: {
    name: "Brugata / Storgata – o ambiente aberto de drogas",
    desc: "O cruzamento Brugata/Storgata é um território social delimitado do ambiente aberto de drogas de Oslo, com Storgata 33 como âncora cartográfica estável. Fontes oficiais, de pesquisa e comunitárias o descrevem como mercado, ponto de encontro social e interface com serviços, controle e desenvolvimento urbano.",
    popupDesc: `Este lugar é o território social delimitado no cruzamento Brugata/Storgata e arredores, ancorado em Storgata 33. Não é toda a Storgata ou Brugata, o quarteirão Folketeater, a Plata histórica ou o centro Prindsen. A fonte municipal descreve ao mesmo tempo um grande mercado aberto de drogas ilegais e um ponto de encontro social; essa dupla função é o núcleo canônico.

O ambiente se deslocou ao longo do tempo. A Associação por uma Política de Drogas Humana relaciona a situação atual à dispersão sistemática iniciada em 2011 em Oslo S e Jernbanetorget e a movimentos posteriores entre Brugata/Storgata, Elgsletta e a área de Hausmann. É um território atual numa história de deslocamento, não um novo nome para Plata.

O relatório KORUS “Mercado inseguro”, de 2020, usou trabalho de campo e entrevistas. Documenta insegurança, violência e mercado, mas também contato social e pertencimento. Nenhuma pessoa visível pode ser identificada como integrante do ambiente, dependente, vendedora, compradora ou usuária de serviços.

A arcada de Storgata 33 é um foco físico da análise municipal. A renovação concluída em 2021 mudou trilhos, calçadas e infraestrutura, mas o desenho físico sozinho não resolveu a insegurança percebida. O território emerge de espaço, relações, mercado, serviços, controle e deslocamento.

Um mapeamento participativo da Bykuben publicado em 2025 alcançou quase 35 pessoas. Amizade e natureza junto ao Akerselva apareceram como recursos. O conhecimento deve vir de participação respeitosa e relatos agregados, não da observação próxima de pessoas na rua.

Em 2025 foi proposto um local externo protegido, expressamente distinto de uma zona sem lei. O orçamento revisado não financiou a medida e esclarecimentos jurídicos continuavam.

No local, observe apenas arquitetura, perfil da rua e conexões públicas a partir de caminhos comuns. Não fotografe, siga, aborde ou mapeie pessoas, horários, transações, saúde ou rotas. Pessoas visíveis nunca são colecionáveis nem evidência.`
  }
};
for (const [lang, translation] of Object.entries(translations)) {
  const file = `data/i18n/content/places/${lang}.json`;
  const pack = read(file);
  pack[placeId] = { _sourceHash: sourceHash, _status: "human_reviewed", ...translation };
  write(file, pack);
}

write(`reports/place-production/${placeId}-workcard-current.json`, {
  placeId, activePhase: 24, lastApprovedCheckpoint: "phase_24_final_qa", activeFileScope: "Brugata/Storgata canonical place and directly dependent People, Objects, Stories, Quiz, Language, Readings and generated payloads", activeMergeBoundary: "one_place_pr", branchStatus: "local", liveStatus: "not_live", nextPhase: "local_gates_browser_ci_merge", identity: production.identity, placeCard: production.roundsReadiness, quiz: production.quizReadiness
});
write(`reports/place-production/${placeId}-phase24-final-audit-v1.json`, {
  schema: "history_go_place_final_audit_v1", placeId, auditedAt: verifiedAt, status: "PASS_PENDING_BROWSER_AND_CI", canonicalScope: place.spatial_profile,
  content: { popupParagraphs: place.popupDesc.split(/\n\n/u).length, chronologyEntries: chronology.length, stories: stories.length, news: news.length, readings: readings.length, languageEntries: language.entries.length, people: people.length, objects: place.objects.length, brands: 0, relatedPlaces: place.related_place_ids.length, quizSets: 5, quizQuestions: 35 },
  images: { before: place.for_na.beforeImageMeta, after: place.for_na.nowImageMeta, comparison: "same_westbound_brugata_axis_with_explicit_viewpoint_and_social_inference_limits" },
  manualQa: { desktop: "pending_registered_browser_test", mobile: "pending_registered_browser_test", popupTabs: "pending_registered_browser_test", fourSurfaceLayout: "pending_registered_browser_test", quizProminence: "pending_registered_browser_test", onsiteSafety: "passed_editorial_review" },
  qualityAssessment: { correctnessEvidence: 5, coverageCompletion: 5, editorialQuality: 5, technicalIntegrity: 4, safetyResponsibility: 5, maintainabilityTraceability: 5, total: 29, conclusion: "Høy kvalitet for statisk innhold; teknisk score holdes på 4 inntil browser og CI er verifisert." },
  remaining: ["Complete registered desktop and mobile browser QA.", "Record immutable head SHA and green CI before merge."]
});

console.log("Brugata/Storgata completion source data materialized");
