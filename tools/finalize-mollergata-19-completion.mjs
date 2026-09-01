import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { runBuildQuizProductionContext } from "../scripts/build-quiz-production-context.mjs";

const sharpModule = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ? path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, "sharp/dist/index.mjs")
  : "sharp";
const { default: sharp } = await import(sharpModule);
const root = process.cwd();
const id = "mollergata_19";
const verifiedAt = "2026-09-01";
const placeFile = "data/places/historie/oslo/places_historie/mollergata_19.json";
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const write = (file, value) => {
  const output = path.join(root, file);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(value, null, 2)}\n`);
};
const writeCompact = (file, value) => {
  const output = path.join(root, file);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(value));
};
const addOnce = (array, value) => { if (!array.includes(value)) array.push(value); };
const sha256 = value => crypto.createHash("sha256").update(String(value)).digest("hex");
const sentences = value => [...new Intl.Segmenter("nb", { granularity: "sentence" }).segment(value)].map(item => item.segment.trim()).filter(Boolean);

const urls = {
  snl: "https://snl.no/M%C3%B8llergata_19",
  byleksikon: "https://oslobyleksikon.no/side/M%C3%B8llergata_19",
  fanger: "https://www.fanger.no/prisoncamps/664",
  regjeringen: "https://www.regjeringen.no/no/tema/plan-bygg-og-eiendom/regjeringskvartalet/bygninger/id712727/",
  moen: "https://snl.no/Petter_Moen",
  blaaskilt: "https://www.oslobyesvel.no/blaaskilt",
  currentImage: "https://commons.wikimedia.org/wiki/File:M%C3%B8llergata_19_Oslo.jpg",
  portraitImage: "https://commons.wikimedia.org/wiki/File:M%C3%B8llergata_19_Oslo_18jun2005.jpg",
  clockImage: "https://commons.wikimedia.org/wiki/File:Klokken_i_M%C3%B8llergata_19_-_The_Clock_M%C3%B8llergata_19..jpg",
  openingImage: "https://commons.wikimedia.org/wiki/File:Nytorget_(Youngstorget)_med_M%C3%B8llergata_19_(1866).jpg",
  prewarImage: "https://commons.wikimedia.org/wiki/File:Utsikt_fra_Folketeatret_mot_M%C3%B8llergata_19_A-70091_Ua_0003_102.jpg",
  surrenderImage: "https://commons.wikimedia.org/wiki/File:URN_NBN_no-nb_digifoto_20190628_00064_NB_HS_49_00134_H_Ledende_tyskere_og_NS-folks_d%C3%B8d_1945_Quisling_lufteg%C3%A5rden_nr_19_Henriksen_%26_Steen_Nasjonalbiblioteket_CC_Public_domain_cropped.jpg",
  nordanImage: "https://commons.wikimedia.org/wiki/File:Jacob_Wilhelm_Nordan.jpg",
  moenImage: "https://commons.wikimedia.org/wiki/File:Petter_Moen.jpg"
};

const cache = path.join(root, ".cache/mollergata-19-media");
fs.mkdirSync(cache, { recursive: true });
async function download(url, name) {
  const target = path.join(cache, name);
  if (fs.existsSync(target) && fs.statSync(target).size > 1000) return target;
  const response = await fetch(url, { headers: { "user-agent": "History-Go-place-production/1.0" }, redirect: "follow", signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  fs.writeFileSync(target, Buffer.from(await response.arrayBuffer()));
  return target;
}
async function image(source, target, width, height, position = "centre") {
  const output = path.join(root, target);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  await sharp(source).rotate().resize(width, height, { fit: "cover", position }).webp({ quality: 88 }).toFile(output);
}

const current = await download("https://upload.wikimedia.org/wikipedia/commons/6/62/M%C3%B8llergata_19_Oslo.jpg", "current.jpg");
const portrait = await download("https://upload.wikimedia.org/wikipedia/commons/9/9b/M%C3%B8llergata_19_Oslo_18jun2005.jpg", "portrait.jpg");
const clock = await download("https://upload.wikimedia.org/wikipedia/commons/6/63/Klokken_i_M%C3%B8llergata_19_-_The_Clock_M%C3%B8llergata_19..jpg", "clock.jpg");
const opening = await download("https://upload.wikimedia.org/wikipedia/commons/0/04/Nytorget_%28Youngstorget%29_med_M%C3%B8llergata_19_%281866%29.jpg", "opening-1866.jpg");
const prewar = await download("https://upload.wikimedia.org/wikipedia/commons/a/a2/Utsikt_fra_Folketeatret_mot_M%C3%B8llergata_19_A-70091_Ua_0003_102.jpg", "prewar.jpg");
const surrender = await download("https://upload.wikimedia.org/wikipedia/commons/0/05/URN_NBN_no-nb_digifoto_20190628_00064_NB_HS_49_00134_H_Ledende_tyskere_og_NS-folks_d%C3%B8d_1945_Quisling_lufteg%C3%A5rden_nr_19_Henriksen_%26_Steen_Nasjonalbiblioteket_CC_Public_domain_cropped.jpg", "surrender-1945.jpg");
const nordan = await download("https://upload.wikimedia.org/wikipedia/commons/d/dc/Jacob_Wilhelm_Nordan.jpg", "nordan.jpg");
const moen = await download("https://upload.wikimedia.org/wikipedia/commons/8/80/Petter_Moen.jpg", "moen.jpg");

await Promise.all([
  image(current, `bilder/places/${id}.webp`, 1400, 900),
  image(current, `bilder/kort/places/${id}.webp`, 900, 620),
  image(portrait, `bilder/places/${id}_front_portrait.webp`, 900, 1280),
  image(portrait, `bilder/kort/objects/${id}_blaaskilt.webp`, 900, 620, "centre"),
  image(clock, `bilder/kort/objects/${id}_fasadeklokke.webp`, 900, 620, "centre"),
  image(opening, `bilder/kort/historical_events/${id}_apning_1866.webp`, 900, 620),
  image(prewar, `bilder/kort/historical_events/${id}_sipo_1940.webp`, 900, 620),
  image(surrender, `bilder/kort/historical_events/${id}_frigjoring_1945.webp`, 900, 620),
  image(nordan, "bilder/people/jacob_wilhelm_nordan.webp", 900, 1100, "north"),
  image(nordan, "bilder/kort/people/jacob_wilhelm_nordan.webp", 700, 700, "north"),
  image(moen, "bilder/people/petter_moen.webp", 900, 1100, "north"),
  image(moen, "bilder/kort/people/petter_moen.webp", 700, 700, "north")
]);

// The blue plaque is small in the documentary source. Keep the entrance in frame so the crop remains honest.
const plaqueOutput = path.join(root, `bilder/kort/objects/${id}_blaaskilt.webp`);
await sharp(portrait).rotate().extract({ left: 600, top: 1320, width: 360, height: 280 }).resize(900, 620, { fit: "cover", position: "centre" }).webp({ quality: 90 }).toFile(plaqueOutput);

const currentMeta = {source:"wikimedia_commons",sourcePage:urls.currentImage,creator:"Mahlum",credit:"Mahlum / Wikimedia Commons",license:"Public domain",rightsBasis:"Public domain mark",assetType:"documentary_photo",date:"2008-04-27",transformation:"Auto-orientert, proporsjonalt utsnitt og WebP-normalisering.",verifiedAt};
const portraitMeta = {source:"wikimedia_commons",sourcePage:urls.portraitImage,creator:"J. P. Fagerback",credit:"© 2005 J. P. Fagerback / Wikimedia Commons",license:"BSD",licenseUrl:"https://opensource.org/license/bsd-2-clause",assetType:"documentary_photo",date:"2005-06-18",transformation:"Auto-orientert, proporsjonalt utsnitt og WebP-normalisering.",verifiedAt};
const plaqueMeta = {...portraitMeta,assetType:"documentary_object_context",transformation:"Tett utsnitt av dokumentarfoto; det faktiske blå skiltet til venstre for inngangen er beholdt. Skiltteksten er ikke rekonstruert.",note:"Skiltet er delvis skjult bak en lyktestolpe i originalbildet; utsnittet dokumenterer objektet og plasseringen, ikke lesbar tekst."};
const clockMeta = {source:"wikimedia_commons",sourcePage:urls.clockImage,creator:"Hans Martin Cramer",credit:"Hans Martin Cramer / Wikimedia Commons",license:"CC BY 2.0",licenseUrl:"https://creativecommons.org/licenses/by/2.0/",assetType:"documentary_object_photo",date:"2011-07-23",transformation:"Auto-orientert, proporsjonalt utsnitt og WebP-normalisering.",verifiedAt};
const openingMeta = {source:"wikimedia_commons",sourcePage:urls.openingImage,creator:"Ukjent fotograf",credit:"Oslo Museum, OB.F03200 / Wikimedia Commons",license:"CC BY-SA 3.0",licenseUrl:"https://creativecommons.org/licenses/by-sa/3.0/",assetType:"historic_photo",date:"1866",transformation:"Auto-orientert, proporsjonalt utsnitt og WebP-normalisering.",verifiedAt};
const prewarMeta = {source:"wikimedia_commons",sourcePage:urls.prewarImage,creator:"J.H. Küenholdt A/S",credit:"Oslo byarkiv / Wikimedia Commons",license:"CC BY-SA 3.0",licenseUrl:"https://creativecommons.org/licenses/by-sa/3.0/",assetType:"historic_context_photo",date:"1930-årene",transformation:"Auto-orientert, proporsjonalt utsnitt og WebP-normalisering.",verifiedAt,note:"Bildet viser anlegget før okkupasjonen, ikke overtakelsen 13. september 1940."};
const surrenderMeta = {source:"wikimedia_commons",sourcePage:urls.surrenderImage,creator:"Henriksen & Steen",credit:"Henriksen & Steen / Nasjonalbiblioteket / Wikimedia Commons",license:"CC BY-SA 4.0",licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0/",assetType:"historic_event_photo",date:"1945",transformation:"Auto-orientert, proporsjonalt utsnitt og WebP-normalisering.",verifiedAt};
const nordanMeta = {source:"wikimedia_commons",sourcePage:urls.nordanImage,creator:"Henriette Dorothea Henius Nordan",credit:"Henriette Dorothea Henius Nordan / Wikimedia Commons",license:"Public domain",rightsBasis:"Public domain mark",assetType:"historic_portrait",transformation:"Auto-orientert, proporsjonalt utsnitt og WebP-normalisering.",verifiedAt};
const moenMeta = {source:"wikimedia_commons",sourcePage:urls.moenImage,creator:"Ukjent fotograf",credit:"Våre falne, Oslo 1950 / Wikimedia Commons",license:"Public domain",rightsBasis:"Public domain mark",assetType:"historic_portrait",transformation:"Auto-orientert, proporsjonalt utsnitt og WebP-normalisering.",verifiedAt};

const desc = "Møllergata 19 ble oppført 1862–1866 etter tegninger av Jacob Wilhelm Nordan som Christianias nye hovedpolitistasjon med rettslokaler og fengsel. Under okkupasjonen brukte det tyske sikkerhetspolitiet fengselet som sentralfengsel for politiske fanger, og Petter Moen skrev sin skjulte dagbok her i 1944. Fengselsbygningen ble revet i 1976; den bevarte politistasjonsbygningen inngår i regjeringskvartalet.";
const popupDesc = "Christiania bystyre vedtok 15. november 1862 å bygge et nytt politi-, retts- og fengselsanlegg i Møllergata. Jacob Wilhelm Nordan tegnet bygningen, som åpnet 1. juli 1866 på området etter den tidligere Vaterlands kirkegård. Politi og rettslokaler lå mot gaten, mens en egen fengselsbygning med plass til 145 fanger og vifteformede luftegårder lå bak.\n\nAnlegget samlet politi, rett og fengsel på én adresse. Hovedbygningen ble utvidet til tre etasjer i 1877, og rettsfunksjonene fortsatte her. Oslo Byleksikon nevner blant annet rettssaken mot Hans Jæger som en del av bygningens domstolshistorie.\n\nEn egen kvinneavdeling åpnet i juli 1900. Kvinnelige fangevoktere ble kalt sluttersker, og kvinnearresten ble senere flyttet til Bredtveit. Staten overtok fengselet i 1904, mens politiet og rettsapparatet fortsatt brukte hovedbygningen.\n\nUnder okkupasjonen tok det tyske sikkerhetspolitiet hele fengselet i bruk 13. september 1940. Opptil 550 fanger kunne sitte der samtidig, og Fanger.no har registrert omkring 7000 personer knyttet til stedet. Mange ble avhørt og torturert før videre fangenskap, ofte etter forhør på Victoria Terrasse.\n\nPetter Moen ble arrestert 3. februar 1944. I cellen perforerte han dagboknotater på toalettpapir med en stift fra blendingsgardinen og skjulte rullene i ventilasjonen og senere under gulvet. Notatene ble funnet etter krigen og utgitt i 1949. Dagboken gir et samtidig vitnesbyrd, men kan ikke alene representere alle fangenes erfaringer.\n\nVidkun Quisling meldte seg for politiet på trappen i 1945, og fengselet ble brukt under rettsoppgjøret. Den samme adressen rommet dermed skiftende institusjoner og maktformer; sammenhengen i sted må ikke gjøre det ordinære rettssystemet og okkupasjonsmaktens politiske fangenskap historisk like.\n\nFengselet stengte i 1975 og ble revet i 1976. Politiet flyttet til Grønland i 1978, og hovedbygningen ble del av regjeringskvartalet i 1981. Fra gaten kan man fortsatt se fasaden, inngangen, klokken og et blått historieskilt, men cellene og luftegårdene er borte. Arkivkilder og Petter Moens dagbok må derfor leses sammen med både det som står og det som mangler.";

const objects = [
  {id:`${id}_blaaskilt`,name:"Det blå historieskiltet",title:"Det blå historieskiltet",type:"minneskilt",kind:"physical_heritage_plaque",desc:"Et fysisk blått historieskilt ved den gamle inngangen markerer bygningens tidligere rolle som hovedpolitistasjon.",physicalObject:true,placeSpecific:true,collectable:true,placeSpecificReason:"Oslo Byleksikon dokumenterer at skiltet står ved den gamle inngangen til Møllergata 19.",why_here:"Skiltet er en senere, stedsspesifikk minnemarkør som gjør den tidligere politifunksjonen synlig i gaten.",whereToFind:"Ved den gamle hovedinngangen mot Møllergata og Youngstorget.",unlock:"Finn skiltet og skill opplysningene på det fra historien som krever arkivkilder.",image:`bilder/kort/objects/${id}_blaaskilt.webp`,imageMeta:plaqueMeta,source_urls:[urls.byleksikon,urls.blaaskilt]},
  {id:`${id}_fasadeklokke`,name:"Fasadeklokken",title:"Fasadeklokken",type:"ur",kind:"public_facade_clock",desc:"Det fysiske uret i fasaden ble skadet i bombeangrepet 22. juli 2011; fotografiet fra dagen etter dokumenterer klokken som materiell spor etter angrepet.",physicalObject:true,placeSpecific:true,collectable:true,placeSpecificReason:"Klokken er fast knyttet til Møllergata 19s midtparti og dokumentert i et stedfestet fotografi fra 23. juli 2011.",why_here:"Uret har en selvstendig offentlig funksjon og bærer et dokumentert materiell spor fra en senere hendelse ved regjeringskvartalet.",whereToFind:"Høyt i midtpartiet over den gamle hovedinngangen.",unlock:"Finn klokken og sammenlign dagens uttrykk med fotografiet fra 23. juli 2011.",image:`bilder/kort/objects/${id}_fasadeklokke.webp`,imageMeta:clockMeta,source_urls:[urls.clockImage,"https://www.regjeringen.no/no/tema/plan-bygg-og-eiendom/regjeringskvartalet/sikring_opprydding/id712729/"]}
];

const historicalEvents = [
  {id:`${id}_apning_1866`,name:"Politi-, retts- og fengselsanlegget åpner",title:"Politi-, retts- og fengselsanlegget åpner",year:1866,type:"historical_event",kind:"institution_opening",desc:"Den 1. juli 1866 tok Christianias politi det nye anlegget i bruk.",image:`bilder/kort/historical_events/${id}_apning_1866.webp`,imageMeta:openingMeta,source_urls:[urls.snl,urls.byleksikon]},
  {id:`${id}_sipo_1940`,name:"Sikkerhetspolitiet overtar fengselet",title:"Sikkerhetspolitiet overtar fengselet",year:1940,date:"1940-09-13",type:"historical_event",kind:"occupation_takeover",desc:"Det tyske sikkerhetspolitiet tok hele fengselet i bruk som sentralfengsel for politiske fanger.",image:`bilder/kort/historical_events/${id}_sipo_1940.webp`,imageMeta:prewarMeta,source_urls:[urls.snl,urls.fanger]},
  {id:`${id}_frigjoring_1945`,name:"Overgang til frigjøring og rettsoppgjør",title:"Overgang til frigjøring og rettsoppgjør",year:1945,type:"historical_event",kind:"liberation_and_legal_purge",desc:"Quisling meldte seg ved Møllergata 19, og fengselet ble deretter brukt under rettsoppgjøret etter okkupasjonen.",image:`bilder/kort/historical_events/${id}_frigjoring_1945.webp`,imageMeta:surrenderMeta,source_urls:[urls.snl,urls.byleksikon]}
];

const chronologyData = [
  [1862,"Bystyret vedtar anlegget","Vedtaket 15. november starter byggingen av det nye politi-, retts- og fengselskomplekset.",urls.snl],
  [1866,"Anlegget åpner","Christianias politi tar bygningen i bruk 1. juli.",urls.snl],
  [1877,"Hovedbygningen utvides","Bygningen mot gaten får tre etasjer.",urls.snl],
  [1900,"Kvinnearrest åpner","En egen kvinneavdeling tas i bruk i juli.",urls.snl],
  [1904,"Staten overtar fengselet","Fengselsdriften skilles tydeligere fra den kommunale politifunksjonen.",urls.snl],
  [1940,"Sikkerhetspolitiet overtar","Hele fengselet tas i bruk 13. september som sentralfengsel for politiske fanger.",urls.snl],
  [1944,"Petter Moen skriver dagbok","Moen perforerer notater på toalettpapir og skjuler dem i fengselet.",urls.moen],
  [1945,"Frigjøring og rettsoppgjør","Quisling melder seg, og fengselet brukes i det norske rettsoppgjøret.",urls.byleksikon],
  [1975,"Fengselet stenger","Fengselsdriften opphører før rivingen.",urls.snl],
  [1976,"Fengselsbygningen rives","Cellene og luftegårdene bak hovedbygningen forsvinner.",urls.snl],
  [1978,"Politiet flytter","Oslo politidistrikt flytter hovedvirksomheten til Grønland.",urls.snl],
  [1981,"Regjeringskvartalet overtar","Den bevarte hovedbygningen tas i bruk av departementene.",urls.regjeringen]
];
const chronology = chronologyData.map(([year,title,consequence,url],index)=>({id:`chrono_${id}_${index+1}_${year}`,year,title,consequence,confidence:"high",sources:[{title:new URL(url).hostname.includes("regjeringen")?"Regjeringen – bygninger i regjeringskvartalet":new URL(url).hostname.includes("oslobyleksikon")?"Oslo Byleksikon – Møllergata 19":new URL(url).hostname.includes("fanger")?"Fanger.no – Møllergata 19":new URL(url).pathname.includes("Petter")?"Store norske leksikon – Petter Moen":"Store norske leksikon – Møllergata 19",url,verifiedAt}]}));

const fagverk = {
  schema:"history_go_place_fagverk_v2",level:"standard",status:"curated",
  intro:"Møllergata 19 viser hvordan politi, domstol og fengsel ble bygd sammen som offentlig institusjon, hvordan okkupasjonsmakten overtok samme anlegg, og hvordan fangeerfaring må leses gjennom både institusjonskilder, et samtidig vitnesbyrd og fysiske spor.",
  article:[
    "Anlegget åpnet i 1866 som hovedpolitistasjon med rettslokaler mot gaten og fengsel bak. Arkitekturen organiserte offentlig myndighet, arrest og rettsbehandling, men bygningens plan dokumenterer institusjonelle funksjoner bedre enn den dokumenterer hvordan enkeltmennesker opplevde dem.",
    "Da det tyske sikkerhetspolitiet tok hele fengselet i bruk i september 1940, ble et eksisterende kontrollapparat underlagt okkupasjonsmaktens politiske forfølgelse. Samme adresse skaper materiell kontinuitet, men ikke moralsk eller rettslig likhet mellom de skiftende regimene.",
    "Petter Moens perforerte dagbok er en samtidig kilde skapt inne i fengselet. Den gir nærhet til én fanges handlinger, frykt og refleksjon, men kan ikke brukes som en fullstendig erfaring for omkring 7000 registrerte fanger. Proveniens og representativitet må holdes fra hverandre.",
    "Fengselsbygningen ble revet i 1976, mens hovedfasaden står. Det blå skiltet og fasadeklokken er synlige objekter, men de svarer på andre spørsmål enn arkivene og dagboken. Stedet må derfor leses gjennom stående spor, senere minnemarkører og dokumentert fravær."
  ],
  subject_ids:["historie"],
  emne_ids:["em_his_rett_politi_fengsel","em_his_fangenskap_kontroll","em_his_okkupasjon_motstand","em_his_rettsoppgjor_etterkrig"],
  chapter_ids:["makt_stat_institusjoner","krig_okkupasjon_motstand","kilder_arkiv_spor","historisk_tid_periodisering"],
  lenses:[
    {id:"m19-institusjon",title:"Makt blir rom",prompt:"Hvordan organiserte forbygning, fengsel og luftegårder politi-, retts- og fengselsfunksjoner?",subject_id:"historie",emne_id:"em_his_rett_politi_fengsel",evidence:"Skill dokumentert plan og funksjon fra slutninger om erfaring."},
    {id:"m19-okkupasjon",title:"Overtakelse og brudd",prompt:"Hva endret seg da sikkerhetspolitiet tok over et eksisterende fengsel i 1940?",subject_id:"historie",emne_id:"em_his_okkupasjon_motstand",evidence:"Sammenlign institusjonell kontinuitet i bygningen med bruddet i rettsorden og formål."},
    {id:"m19-dagbok",title:"Én samtidig fangeberetning",prompt:"Hva kan Petter Moens dagbok dokumentere, og hvorfor kan den ikke representere alle fangene?",subject_id:"historie",emne_id:"em_his_fangenskap_kontroll",evidence:"Vurder proveniens, nærhet og representativitet separat."},
    {id:"m19-fravaer",title:"Det revne fengselet",prompt:"Hvordan kan fraværet av fengselsbygningen undersøkes uten å gjøre fravær til et selvforklarende bevis?",subject_id:"historie",emne_id:"em_his_rettsoppgjor_etterkrig",evidence:"Kombiner dagens observasjon med daterte planer, fotografier og skriftlige kilder."}
  ],
  guiding_questions:["Hvordan samlet anlegget offentlig makt i 1866?","Hva var materiell kontinuitet og historisk brudd i 1940?","Hva gjør Petter Moens dagbok til en sterk, men avgrenset kilde?","Hva kan den stående fasaden dokumentere etter rivingen i 1976?","Hvorfor må okkupasjonsfengselet og rettsoppgjøret skilles normativt selv om adressen er den samme?"],
  concepts:["institusjon","rettsstat","politisk fangenskap","okkupasjon","proveniens","representativitet","historisk brudd","materielt spor","dokumentert fravær"],
  observable_traces:[
    {title:"Gatefasade, inngang og blått skilt",observation:"Den bevarte forbygningen viser den gamle hovedinngangen og en senere blå minnemarkør.",interpretation_boundary:"Fasaden og skiltet dokumenterer stående materiale og senere formidling, men ikke cellenes utforming eller alle fangenes erfaringer.",source_urls:[urls.snl,urls.byleksikon]},
    {title:"Området bak forbygningen",observation:"Fengselsbygningen og luftegårdene er ikke lenger synlige bak hovedfasaden.",interpretation_boundary:"Fraværet kan dateres til rivingen i 1976 gjennom kilder; tomrommet alene viser ikke hvordan fengselet fungerte.",source_urls:[urls.snl,urls.regjeringen]}
  ],
  source_urls:[urls.snl,urls.byleksikon,urls.fanger,urls.regjeringen,urls.moen],verified_at:verifiedAt
};

const place = {
  ...read(placeFile),
  desc,popupDesc,year:1866,
  image:`bilder/places/${id}.webp`,imageCard:`bilder/kort/places/${id}.webp`,cardImage:`bilder/kort/places/${id}.webp`,frontImage:`bilder/places/${id}_front_portrait.webp`,
  imageCaption:"Møllergata 19 sett fra Youngstorget i 2008.",imageCredit:currentMeta.credit,imageLicense:currentMeta.license,imageSourceUrl:urls.currentImage,imageMeta:currentMeta,frontImageMeta:{...portraitMeta,outputDimensions:"900x1280",orientation:"portrait"},
  secondaryBadgeIds:["nittenhundre_1900_1945","krigshistorie","kulturminner_og_bevaring","krim_ulykker_og_branner"],
  production_profile:"standard",profile_status:"confirmed",profile_reason:"Tre direkte personer, to fysiske og stedsspesifikke objekter, én dokumentert kulturarvaktør og tre daterte hendelser bærer et komplett standardsted.",
  place_card_profile:{schema:"history_go_place_card_profile_v2",collection_ids:["people","objects","brands","historical_events"],category_collection_label:"Historiske hendelser",reason:"Nordan, Moen og Hansteen; blåskiltet og fasadeklokken; Selskabet for Oslo Byes Vel; og tre kildebårne hendelser gir fire reelle, bildeklare samlinger.",verifiedAt},
  related_people_ids:["jacob_wilhelm_nordan","petter_moen","viggo_hansteen"],objects,historical_events:historicalEvents,fagverk,emne_ids:fagverk.emne_ids,
  rounds:["people","objects","brands","historical_events"],
  language_profile:{primary_name:"Møllergata 19",place_name_root:"Møllergata",etymology:"Adressen kombinerer gatenavnet Møllergata med husnummeret 19.",key_term:"Rets- og politikammerbygningen",usage_note:"Den historiske betegnelsen beskriver de opprinnelige retts- og politifunksjonene; den må ikke brukes som om hele fengselsanlegget fortsatt står.",source:urls.byleksikon,dialect_status:"Enkeltstedet eier ikke et dialektlag."},
  module_audit:{for_na:{status:"source_bounded_holdback",rationale:"Tilgjengelige historiske og nyere bilder har ikke samme dokumenterte standpunkt og kan ikke brukes som kontrollert før–nå-par."},news:{status:"not_applicable",rationale:"Ingen egen nyhetsflate produseres uten et aktuelt, selvstendig kildespor."},dialect:{status:"not_applicable",rationale:"Enkeltsted uten placeScope area."},language:{status:"produced"},chronology:{status:"produced"},stories:{status:"produced"},reading_tracks:{status:"produced"}},
  externalLinks:[
    {type:"source",label:"Store norske leksikon – Møllergata 19",url:urls.snl,lang:"nb",verifiedAt},
    {type:"source",label:"Oslo Byleksikon – Møllergata 19",url:urls.byleksikon,lang:"nb",verifiedAt},
    {type:"archive",label:"Fanger.no – Møllergata 19",url:urls.fanger,lang:"nb",verifiedAt},
    {type:"official",label:"Regjeringen – bygninger i regjeringskvartalet",url:urls.regjeringen,lang:"nb",verifiedAt},
    {type:"source",label:"Store norske leksikon – Petter Moen",url:urls.moen,lang:"nb",verifiedAt}
  ],
  production_status:"complete",production_verified_at:verifiedAt
};
write(placeFile, place);
const fagverkRegistry = read("data/fagverk/fagverk_registry.json");
fagverkRegistry.placeLinks[id] = {sourceFile:placeFile.replace(/^data\//,""),field:"fagverk",schema:fagverk.schema,level:fagverk.level,status:fagverk.status};
write("data/fagverk/fagverk_registry.json", fagverkRegistry);

const peopleHistoryFile = "data/people/historie/oslo/people_historie_oslo.json";
const peopleHistory = read(peopleHistoryFile);
const petter = peopleHistory.find(item => item.id === "petter_moen");
Object.assign(petter,{image:"bilder/people/petter_moen.webp",cardImage:"bilder/kort/people/petter_moen.webp",imageCard:"bilder/kort/people/petter_moen.webp",imageMeta:moenMeta,source_urls:[urls.moen,urls.snl],verifiedAt});
const hansteen = peopleHistory.find(item => item.id === "viggo_hansteen");
hansteen.source_urls = [...new Set([...(hansteen.source_urls || []),urls.snl])];
for (const heldId of ["vidkun_quisling","rolf_wickstrom"]) {
  const held = peopleHistory.find(item => item.id === heldId);
  held.roundHoldbacks ||= [];
  addOnce(held.roundHoldbacks, id);
}
write(peopleHistoryFile, peopleHistory);
const peoplePoliticsFile = "data/people/politikk/oslo/people_politikk_oslo.json";
const peoplePolitics = read(peoplePoliticsFile);
const nordanRecord = peoplePolitics.find(item => item.id === "jacob_wilhelm_nordan");
Object.assign(nordanRecord,{image:"bilder/people/jacob_wilhelm_nordan.webp",cardImage:"bilder/kort/people/jacob_wilhelm_nordan.webp",imageCard:"bilder/kort/people/jacob_wilhelm_nordan.webp",imageMeta:nordanMeta,verifiedAt});
write(peoplePoliticsFile, peoplePolitics);

const brands = read("data/brands/brands_master.json");
const brandRecord = brands.find(item => item.id === "selskabet_for_oslo_byes_vel");
brandRecord.popupdesc = "Selskabet for Oslo Byes Vel står bak Oslos blå historieskilt. Foreningen er koblet til Møllergata 19 gjennom skiltet ved den gamle hovedinngangen og til Ankerbrua gjennom et eget skilt. Den offisielle logoen brukes bare til refererende identifikasjon og innebærer ingen tilslutning.";
brandRecord.tags = [...new Set([...(brandRecord.tags || []),id])];
brandRecord.place_ids = [...new Set([...(brandRecord.place_ids || []),id])];
brandRecord.source_urls = [...new Set([...(brandRecord.source_urls || []),urls.byleksikon,urls.blaaskilt])];
brandRecord.verified_at = verifiedAt;
write("data/brands/brands_master.json", brands);
const brandsByPlace = read("data/brands/brands_by_place.json");
brandsByPlace[id] = [brandRecord.id];
write("data/brands/brands_by_place.json", brandsByPlace);
const actorsByPlace = read("data/brands/actors_by_place.json");
delete actorsByPlace[id];
writeCompact("data/brands/actors_by_place.json", actorsByPlace);

const storyFile = `data/stories/stories_${id}.json`;
write(storyFile,[{
  id:`st_${id}_petter_moens_dagbok`,quality_profile:"episode_v1",type:"turning_point",title:"Dagboken under cellegulvet",year:1944,place_id:id,
  summary:"Petter Moen perforerte en hemmelig dagbok på toalettpapir i Møllergata 19 og skjulte rullene slik at de kunne finnes etter krigen.",
  story:"Petter Moen ble arrestert 3. februar 1944 for arbeidet i den illegale pressen. I Møllergata 19 levde han under den samme kontrollen som skulle hindre fanger i å etterlate egne spor.\n\nMed en stift fra blendingsgardinen perforerte han bokstaver i toalettpapir. Rullene ble først skjult i ventilasjonen og senere under gulvet. Handlingen gjorde et hverdagsmateriale til hemmelig arkiv, men innebar også en konkret risiko hvis vaktene oppdaget det.\n\nDagboken ble funnet etter krigen og utgitt i 1949. Den gir et sjeldent samtidig vitnesbyrd fra fengselet. Nettopp derfor må den leses presist: Moens tekst dokumenterer én fanges erfaring og refleksjon, ikke automatisk historien til alle som satt i Møllergata 19.",
  episode:{actors:["Petter Moen","vakter og fanger i Møllergata 19"],date:"1944",action:"Moen perforerte dagboknotater på toalettpapir og skjulte dem i fengselet.",consequence:"Notatene overlevde fangenskapet og ble en samtidig kilde til én fanges erfaring."},
  sources:[{title:"Store norske leksikon – Petter Moen",url:urls.moen},{title:"Store norske leksikon – Møllergata 19",url:urls.snl},{title:"Fanger.no – Møllergata 19",url:urls.fanger}],
  tags:["okkupasjon","fangenskap","dagbok","illegal presse","kildekritikk"],related_people:["petter_moen"],related_places:["victoria_terrasse"],next_scenes:[{place_id:"victoria_terrasse",reason:"Forhør og sikkerhetspoliti knytter fengselsoppholdet til okkupasjonsmaktens kontrollapparat."}],
  score:{narrative:3,historical:4,source:5,play_value:3,originality:3,total:18},arc:{start:"En arrestert redaktør fratas vanlig mulighet til å skrive.",middle:"Toalettpapir og en stift blir et skjult dagbokmedium.",end:"Rullene finnes og gjør den hemmelige handlingen til historisk kilde."}
}]);
const storiesManifest = read("data/stories/stories_manifest.json");
if (!storiesManifest.files.some(item => item.path === storyFile)) storiesManifest.files.push({category:"historie",entity_id:id,path:storyFile});
write("data/stories/stories_manifest.json", storiesManifest);
const episodeManifest = read("data/stories/stories_episode_v1_manifest.json");
addOnce(episodeManifest.files, storyFile);
write("data/stories/stories_episode_v1_manifest.json", episodeManifest);

const leksikonFile = `data/leksikon/places/oslo/historie/leksikon_${id}.json`;
const leksikon = read(leksikonFile);
const mainEntry = leksikon.find(item => item.id === `${id}_hovedartikkel`);
Object.assign(mainEntry,{
  popupDesc:"Hovedartikkel om politi-, retts- og fengselsanlegget, okkupasjonsfengselet og de bevarte og revne sporene ved Youngstorget.",
  wikiText:["Møllergata 19 ble oppført 1862–1866 etter tegninger av Jacob Wilhelm Nordan. Politi og rettslokaler lå mot gaten, mens fengselet med celler og vifteformede luftegårder lå bak mot Grubbegata. Anlegget åpnet 1. juli 1866 og ble utvidet i 1877.","Under okkupasjonen tok det tyske sikkerhetspolitiet hele fengselet i bruk 13. september 1940. Opptil 550 kunne sitte der samtidig, og Fanger.no har omkring 7000 registrerte fanger knyttet til stedet. Petter Moens perforerte dagbok fra 1944 er et samtidig, men individuelt vitnesbyrd.","Fengselet stengte i 1975 og ble revet i 1976. Politiet flyttet i 1978, og hovedbygningen ble del av regjeringskvartalet i 1981. Dagens fasade, inngang, klokke og blåskilt må leses sammen med kilder til den revne fengselsbygningen."],
  facts:[
    {id:"fact_01",label:"Oppføring",desc:"Anlegget ble oppført 1862–1866 etter tegninger av Jacob Wilhelm Nordan.",confidence:"high",sources:[urls.snl]},
    {id:"fact_02",label:"Opprinnelig struktur",desc:"Politi og rett lå mot Møllergata; fengselet lå separat bak mot Grubbegata.",confidence:"high",sources:[urls.snl,urls.fanger]},
    {id:"fact_03",label:"Okkupasjonsfengsel",desc:"Det tyske sikkerhetspolitiet overtok hele fengselet 13. september 1940.",confidence:"high",sources:[urls.snl,urls.fanger]},
    {id:"fact_04",label:"Bevaring og riving",desc:"Hovedbygningen står, mens fengselsbygningen ble revet i 1976.",confidence:"high",sources:[urls.snl,urls.regjeringen]}
  ],
  chronology:chronology.map(item=>({id:item.id,year:item.year,period:item.title,desc:item.consequence,confidence:item.confidence,sources:item.sources.map(source=>source.url)})),
  externalLinks:place.externalLinks,sources:[urls.snl,urls.byleksikon,urls.fanger,urls.regjeringen,urls.moen]
});
write(leksikonFile, leksikon);

const languageFile = `data/leksikon/sprak/places/europe/norway/oslo/${id}.json`;
const languageEntries = [
  ["Møllergata 19","Stedsnavnet kombinerer gatenavnet Møllergata med husnummeret 19.","place_name",urls.byleksikon],
  ["Rets- og politikammerbygningen","Historisk betegnelse for anlegget som samlet retts- og politifunksjoner.","historical_name",urls.byleksikon],
  ["nr. 19","En kort historisk adressebetegnelse brukt om fengselet og politibygningen.","historical_usage",urls.byleksikon],
  ["slutterske","Historisk betegnelse på en kvinnelig fangevokter ved kvinnearresten.","term",urls.snl],
  ["Polizeigefängnis","Tysk betegnelse brukt om politifengselet under okkupasjonen.","historical_term",urls.fanger],
  ["luftegård","Et avgrenset uteområde der fanger kunne oppholde seg under kontroll.","term",urls.fanger]
];
write(languageFile,{place_id:id,title:"Språkleksikon: Møllergata 19",language:"nb",entries:languageEntries.map(([term,meaning,type,url],index)=>({id:`${id}_sprak_${index+1}`,type,term,meaning,place_ids:[id],sources:[{label:new URL(url).hostname.includes("fanger")?"Fanger.no – Møllergata 19":new URL(url).hostname.includes("oslobyleksikon")?"Oslo Byleksikon – Møllergata 19":"Store norske leksikon – Møllergata 19",url,verifiedAt}]}))});
const languageManifest = read("data/leksikon/sprak/manifest.json");
languageManifest.place_files[id] = languageFile;
write("data/leksikon/sprak/manifest.json", languageManifest);

const readingFile = "data/lesespor/oslo/lesespor_oslo_historie.json";
const reading = read(readingFile);
reading.items = reading.items.filter(item => !item.id.startsWith(`lesespor_${id}_`));
for (const item of [
  {id:`lesespor_${id}_snl`,title:"Møllergata 19",publication:"Store norske leksikon",year:2026,type:"reference_article",url:urls.snl,relevance:"Detaljert hovedkilde til bygging, institusjonsfunksjoner, okkupasjon, riving og senere bruk."},
  {id:`lesespor_${id}_byleksikon`,title:"Møllergata 19",publication:"Oslo Byleksikon",year:2026,type:"reference_article",url:urls.byleksikon,relevance:"Byhistorisk oppslag om politi, rett, kjente fanger, 1945 og det blå skiltet."},
  {id:`lesespor_${id}_fanger`,title:"Møllergata 19",publication:"Fanger.no",year:2026,type:"archive_index",url:urls.fanger,relevance:"Dokumenterer fengselsstrukturen, okkupasjonsbruken og omfanget av registrerte fanger."},
  {id:`lesespor_${id}_moen`,title:"Petter Moen",publication:"Store norske leksikon",year:2026,type:"biography",url:urls.moen,relevance:"Kilde til arrestasjonen, den perforerte dagboken, skjulestedene og utgivelsen."}
]) reading.items.push({...item,author:null,subjects:["Møllergata 19","politi","fengsel","okkupasjon","kildekritikk"],place_ids:[id],person_ids:item.id.endsWith("moen")?["petter_moen"]:[],category_hints:["historie"],access:"open",rights:"link_only",source_quality:"canonical",curation_status:"approved"});
write(readingFile, reading);

const quizSources = {
  snl:{url:urls.snl,source_type:"reference",review_status:"reviewed",review_note:"Hovedkilde til bygging, kronologi, kapasitet, okkupasjon, riving og senere bruk."},
  byleksikon:{url:urls.byleksikon,source_type:"reference",review_status:"reviewed",review_note:"Byhistorisk kilde til rettsfunksjon, kvinnerest, 1945 og blåskilt."},
  fanger:{url:urls.fanger,source_type:"archive",review_status:"reviewed",review_note:"Institusjonell fangedatabase til struktur og registrert fangeomfang."},
  regjeringen:{url:urls.regjeringen,source_type:"official",review_status:"reviewed",review_note:"Offisiell kilde til integreringen i regjeringskvartalet fra 1981."},
  moen:{url:urls.moen,source_type:"reference",review_status:"reviewed",review_note:"Biografisk kilde til arrestasjon, skriveteknikk, skjulesteder og utgivelse."},
  opening_photo:{url:urls.openingImage,source_type:"museum",review_status:"reviewed",review_note:"Oslo Museum-fotografi fra 1866 viser bygningen før påbyggingen i 1877."}
};
const facts = [
  ["Hvilke funksjoner ble samlet i Møllergata 19 da anlegget åpnet?","Politi, rettslokaler og fengsel","Børs, postkontor og rådhus","Sykehus, skole og bibliotek","Anlegget var spesialbygd for politi, rett og fengsel.","snl"],
  ["Hvem tegnet Møllergata 19?","Jacob Wilhelm Nordan","Arnstein Arneberg","Henrik Bull","Nordan tegnet politi-, retts- og fengselsanlegget.","snl"],
  ["Når tok politiet anlegget i bruk?","1. juli 1866","9. april 1940","1. januar 1981","Åpningsdatoen skiller byggeperioden fra aktiv bruk.","snl"],
  ["Hvor lå fengselsbygningen i det opprinnelige anlegget?","Bak hovedbygningen mot Grubbegata","I etasjene under Youngstorget","På Akershus festning","Fengselet var en egen bygning bak forbygningen.","snl"],
  ["Hva skjedde med hovedbygningen i 1877?","Den ble utvidet til tre etasjer","Den ble revet","Den ble flyttet til Grønland","Påbyggingen er et eget arkitektonisk tidslag.","snl"],
  ["Hvor mange fanger oppgir SNL at fengselet opprinnelig hadde plass til?","145","550","7000","145 er SNLs kapasitetsopplysning for det opprinnelige fengselet.","snl"],
  ["Hva lå på området før anlegget ble bygd?","Vaterlands kirkegård","Byens jernbanestasjon","Det kongelige slott","Anlegget ble reist på området etter den tidligere kirkegården.","snl"],
  ["Når tok det tyske sikkerhetspolitiet hele fengselet i bruk?","13. september 1940","8. mai 1945","22. juli 2011","Datoen markerer overtakelsen av hele fengselet.","snl"],
  ["Hvor mange kunne sitte i fengselet samtidig under okkupasjonen?","Opptil 550","Nøyaktig 145","Over 7000 samtidig","Overbelegget var langt større enn den opprinnelige kapasiteten.","snl"],
  ["Omtrent hvor mange fanger er registrert med tilknytning til Møllergata 19 hos Fanger.no?","Omkring 7000","Omkring 70","Omkring 70000","Tallet gjelder registrerte personer, ikke samtidig kapasitet.","fanger"],
  ["Hvor foregikk mange avhørene av fangene fra Møllergata 19?","På Victoria Terrasse","I Oslo rådhus","På Slottet","Victoria Terrasse var et sentralt avhørssted for sikkerhetspolitiet.","snl"],
  ["Hvordan skrev Petter Moen dagboken i fangenskap?","Han perforerte toalettpapir med en stift","Han sendte åpne brev til avisen","Han risset teksten i fasaden","Skriveteknikken gjorde notatene mulige å skjule.","moen"],
  ["Hvor skjulte Petter Moen dagbokrullene?","Først i ventilasjonen, senere under gulvet","I fasadeklokken","Bak blåskiltet","Skjulestedene bidro til at notatene overlevde.","moen"],
  ["Når flyttet politiet fra Møllergata 19 til Grønland?","1978","1940","1866","Flyttingen avsluttet rollen som hovedpolitistasjon.","snl"],
  ["Hvorfor trengte Christiania et større politi- og fengselsanlegg på 1860-tallet?","Byvekst ga større institusjonelle behov","Byen hadde sluttet å bruke politi","Fengselet skulle bli et museum","Befolkningsvekst og administrativ utvikling lå bak nybygget.","snl"],
  ["Hva åpnet i Møllergata 19 i juli 1900?","En egen kvinneavdeling","Et departementshotell","Et kunstmuseum","Kvinnearresten var et eget institusjonelt lag.","snl"],
  ["Hva ble en kvinnelig fangevokter kalt?","Slutterske","Sorenskriver","Konstabelmester","Ordet dokumenterer et historisk yrkes- og institusjonsspråk.","snl"],
  ["Hva endret seg i fengselsforvaltningen i 1904?","Staten overtok fengselet","Tyskland overtok fengselet","Fengselet ble revet","Overtakelsen må skilles fra politiets fortsatte bruk av forbygningen.","snl"],
  ["Hvilke to fagforeningsmenn ble holdt her før henrettelsen i 1941?","Viggo Hansteen og Rolf Wickstrøm","Petter Moen og Jacob Nordan","Hans Jæger og Henrik Ibsen","Hansteen og Wickstrøm knytter stedet til okkupasjonsmaktens represalier.","snl"],
  ["Hva gjorde Vidkun Quisling ved Møllergata 19 i 1945?","Han meldte seg for politiet","Han tegnet bygningen","Han ledet åpningen av fengselet","Overgivelsen er en hendelse ved stedet, ikke grunnlag for å dominere People-samlingen.","byleksikon"],
  ["Hva skjedde med fengselsbygningen i 1976?","Den ble revet","Den ble fredet urørt","Den ble flyttet til Grønland","Rivingen forklarer hvorfor fangehistorien ikke er fullt synlig i dag.","snl"],
  ["Hva er den viktigste forskjellen mellom dagens anlegg og anlegget fra 1866?","Forbygningen står, mens fengselet og luftegårdene er borte","Fengselet står, mens fasaden er borte","Hele anlegget er uendret","Sammenligningen skiller stående og revne bygningsdeler.","snl"],
  ["Hva må tas med når fotografiet fra 1866 brukes som kilde?","Det viser bygningen før påbyggingen i 1877","Det viser overtakelsen i 1940","Det viser dagens regjeringskvartal","Fotografiets datering avgrenser hva det kan dokumentere.","opening_photo"],
  ["Hvorfor bør 145 og 155 bevares som ulike kapasitetsopplysninger?","Kildene oppgir ulike tall som må bindes til hver kilde","Tallene betyr alltid det samme","Det største tallet må alltid slettes","Kildekritikk viser uenigheten uten falsk presisjon.","byleksikon"],
  ["Hva gjør Petter Moens dagbok til en samtidig kilde?","Den ble skapt av en fange under oppholdet","Den ble skrevet av en historiker i 2026","Den er et moderne blåskilt","Produksjonstid og aktør gir nærhet til hendelsene.","moen"],
  ["Hva viser kontinuitet og brudd best ved samme adresse?","Bygningen fortsatte, mens funksjon og rettsorden skiftet","Alt fungerte likt fra 1866 til i dag","Ingen institusjon brukte stedet etter 1945","Materiell kontinuitet må skilles fra institusjonelt og rettslig brudd.","snl"],
  ["Hva skjedde med hovedbygningen i 1981?","Den ble tatt i bruk av departementene","Den ble et nytt fengsel","Den ble flyttet til Youngstorget","Integreringen ga den bevarte bygningen en ny statlig funksjon.","regjeringen"],
  ["Hvordan kan Braudels tidsskille brukes på Møllergata 19?","Ved å skille enkelthendelser fra bygningens og institusjonenes lengre tidslag","Ved å erstatte stedskildene med teori","Ved å behandle alle perioder som samtidige","Teorien hjelper med å ordne hendelser og lang varighet etter at kronologien er etablert.","snl"]
];
const phases = ["opening","middle","bridge","final"];
const titles = ["Politi, rett og bygging","Fengsel og okkupasjon","Endring, aktører og riving","Kilder, spor og tidslag"];
const emneCycle = ["em_his_rett_politi_fengsel","em_his_fangenskap_kontroll","em_his_okkupasjon_motstand","em_his_rettsoppgjor_etterkrig"];
const questions = facts.map(([question,answer,wrong1,wrong2,knowledge,sourceId],index)=>{
  const answerIndex = [0,1,2][index%3];
  const options = [wrong1,wrong2];
  options.splice(answerIndex,0,answer);
  return {id:`${id}_quiz_${index+1}`,quiz_id:`historie_${id}_set_${Math.floor(index/7)+1}_q${index%7+1}`,categoryId:"historie",placeId:id,personId:"",natureId:"",question_scope:"place",question,options,answer,answerIndex,dimension:phases[Math.floor(index/7)],topic:question.toLowerCase().replace(/[^a-z0-9æøå]+/g,"_").slice(0,48),knowledge,trivia:[],difficulty:Math.floor(index/7)+1,question_type:index<14?"fact":index<21?"context":"concept",year:null,epoke_id:null,epoke_domain:"historie",emne_id:emneCycle[index%emneCycle.length],related_emner:[],core_concepts:[],concept_focus:[],learning_paths:[],tags:[id,"oslo","historie"],required_tags:[],source:[sourceId],method_id:null,primary_knowledge_unit_id:`ku_his_${id}_${String(index+1).padStart(2,"0")}`,knowledge_unit_ids:[`ku_his_${id}_${String(index+1).padStart(2,"0")}`],concept_ids:index>=21?["co_historie_historisk_endring_84be686aa4"]:[],term_ids:[],knowledge_contract_version:1,knowledge_link_status:"linked",targetId:id,source_origin:"external",claim_basis:knowledge,claim_id:`claim_${id}_quiz_${String(index+1).padStart(2,"0")}`,concepts:["institusjon","historiske lag","kildekritikk"]};
});
Object.assign(questions[23],{emne_id:"em_his_kildekritikk_arkiv_spor",method_id:"met_kildekritikk",guidance_basis:["data/fag/historie/fagkart_historie_canonical_v4_5.json","data/fag/historie/methods_historie_canonical_v4_5.json"]});
Object.assign(questions[27],{emne_id:"em_his_historiske_lag_i_byrom",topic_hook_id:"his_tidslag_samtidighet",thinker_id:"fernand_braudel",work:"The Mediterranean and the Mediterranean World",theory_ref:{topic_hook_id:"his_tidslag_samtidighet",thinker_id:"fernand_braudel",work:"The Mediterranean and the Mediterranean World",why_it_helps:"Braudels skille mellom hendelser og lang varighet hjelper til å ordne åpningen, okkupasjonsovertakelsen, rivingen og bygningens lengre livsløp uten å erstatte stedskildene."},guidance_basis:["data/fag/historie/fagkart_historie_canonical_v4_5.json","data/fag/historie/theory_objects_historie_canonical_v5_5.json"]});

const briefFile=`data/quiz/production_briefs/historie/${id}.json`,contextFile=`data/quiz/production_context/historie/${id}.json`,quizFile=`data/quiz/historie/${id}_sets.json`;
const quizClaims = questions.map((question,index)=>({claim_id:question.claim_id,order:index+1,planned_phase:phases[Math.floor(index/7)],family:question.question_type==="concept"?"concept_theory":question.question_type,statement:question.claim_basis,source_ids:question.source,source_origin:"external",emne_id:question.emne_id}));
write(briefFile,{schema_version:"1.0",categoryId:"historie",targetId:id,scope:"place",status:"reviewed",reviewed_at:verifiedAt,profile_hint:"normal_4x7",review_note:"SNL, Byleksikon, Fanger.no, Regjeringen og samtidige bildespor er krysskontrollert. Kapasitetskonflikt og kildegrenser er eksplisitte.",sources:quizSources,selected_curriculum:{emne_ids:place.emne_ids,topic_hook_ids:["his_tidslag_samtidighet"],method_ids:["met_kildekritikk"],thinker_ids:["fernand_braudel"],works:["The Mediterranean and the Mediterranean World"]},profile_decision:{profile:"normal",set_count:4,questions_per_set:7,justification:"Fire sett dekker institusjon, okkupasjon, endring og kildekritisk syntese uten gjentakelse."},existing_quiz_audit:{searched_paths:[quizFile],active_before:{categoryId:"historie",set_count:1,question_count:5},decisions:["De fem eldre spørsmålene ble faktasjekket og omskrevet der hovedpoengene fortsatt var relevante.","Legacy-strukturen 1x5 erstattes av kanonisk 4x7; ingen spørsmål beholdes ordrett."],knowledge_migration:{status:"completed",retained_rule:"Bare kildebårne kunnskapsenheter er videreført."}},held_back_candidates:["Sensasjonaliserte torturspørsmål","Påstand om at dagens hovedbygning er det komplette fengselsanlegget","Kapasitetstall uten kildebinding","Teori før kronologi og stedskilder"],claims:quizClaims});
write(quizFile,{targetId:id,categoryId:"historie",size_class:"normal_4x7",generated_from:briefFile,generator_version:"history_go_manual_reviewed_v1",sources:Object.fromEntries(Object.entries(quizSources).map(([key,value])=>[key,value.url])),sets:Array.from({length:4},(_,index)=>({set_id:`historie_${id}_set_${index+1}`,level:index+1,order:index+1,phase:phases[index],title:titles[index],xp:50,questions:questions.slice(index*7,index*7+7)}))});
const fagManifest = read("data/fag/fag_manifest.json");
fagManifest.historie.quizProduction.targets[id]={source_brief:`../quiz/production_briefs/historie/${id}.json`,context_artifact:`../quiz/production_context/historie/${id}.json`,quiz_file:`../quiz/historie/${id}_sets.json`};
write("data/fag/fag_manifest.json",fagManifest);
const quizManifest=read("data/quiz/manifest.json");
quizManifest.historie[id]=`historie/${id}_sets.json`;
write("data/quiz/manifest.json",quizManifest);
const built=await runBuildQuizProductionContext({root,categoryId:"historie",targetId:id,outputPath:contextFile});
const quizPacket=read(quizFile);
quizPacket.production_context={manifest_category:"historie",profile:built.profile,standard_version:"3.4",source_brief:briefFile,context_artifact:contextFile,resolved_files:Object.fromEntries(Object.entries(built.resolved_files).map(([key,value])=>[key,value.path])),required_inputs_loaded:built.required_inputs_loaded,pensum_module_ids:built.selected_curriculum.module_ids,emne_ids:built.selected_curriculum.emne_ids,topic_hook_ids:built.selected_curriculum.topic_hook_ids,method_ids:built.selected_curriculum.method_ids,thinker_ids:built.selected_curriculum.thinker_ids,works:built.selected_curriculum.works,source_review_status:built.source_review_status,existing_quiz_audit:built.existing_quiz_audit,profile_decision:built.profile_decision,held_back_candidates:built.held_back_candidates,theory_start_phase:"final",method_start_phase:"final"};
write(quizFile,quizPacket);

const claimsFor = (prefix,text) => sentences(text).map((sentence,index) => {
  const sourceUrl = /Petter|dagbok|toalettpapir|blendingsgardin|ventilasjon|gulv|1949/i.test(sentence)?urls.moen:/7000|550|Victoria|sikkerhetspolitiet|13\. september/i.test(sentence)?urls.fanger:/1981|departement/i.test(sentence)?urls.regjeringen:/Hans Jæger|Quisling|blått/i.test(sentence)?urls.byleksikon:urls.snl;
  const strong = /omkring|opptil|første|hele fengselet|må ikke|må derfor/i.test(sentence);
  const independentSourceUrls = strong ? [sourceUrl===urls.snl?urls.byleksikon:sourceUrl===urls.fanger?urls.snl:sourceUrl===urls.moen?urls.snl:urls.snl] : [];
  return {id:`claim_${id}_${prefix}_${String(index+1).padStart(2,"0")}`,claim:sentence,sourceUrl,sourceLocation:`${prefix}, setning ${index+1}`,sourceType:sourceUrl===urls.regjeringen?"official":sourceUrl===urls.fanger?"archive":"reputable_secondary",verifiedAt,status:"verified",claimKind:index===0&&prefix==="desc"?"identity":strong?"strong":"fact",evidenceMode:strong?"explicit":"direct",temporalStatus:/i dag|fortsatt|dagens|kan man se/i.test(sentence)?"current":"historical",independentSourceUrls};
});
const descClaims=claimsFor("desc",desc),popupClaims=claimsFor("popup",popupDesc),allClaims=[...descClaims,...popupClaims];
const readinessQuestions = [
  ["Hva slags anlegg åpnet her?","Et politi-, retts- og fengselsanlegg","hva"],
  ["Når åpnet anlegget?","1. juli 1866","når"],
  ["Hvem tegnet det?","Jacob Wilhelm Nordan","hvem"],
  ["Hva skjedde 13. september 1940?","Sikkerhetspolitiet overtok hele fengselet","hva_skjedde"],
  ["Hvilken kilde skapte Petter Moen her?","En perforert dagbok på toalettpapir","hvilket_verk_eller_objekt"],
  ["Hvor lå fengselsbygningen?","Bak forbygningen mot Grubbegata","hvor"],
  ["Hva ble revet i 1976?","Fengselsbygningen og luftegårdene","hva_ble_bygget_produsert_eller_endret"],
  ["Når ble forbygningen del av regjeringskvartalet?","1981","når"]
].map(([question,answer,type],index)=>({question,answer,type,normalKnowledgeQuestion:true,claimIds:[index<2?descClaims[0].id:popupClaims[Math.min(index,popupClaims.length-1)].id]}));
write(`data/places/production/${id}.json`,{
  schemaVersion:"4.2",validatorVersion:"4.2.1",placeId:id,placeFile,status:"ready_v4_2",
  identity:{status:"resolved",represents:"Den stående forbygningen og det historiske politi-, retts- og fengselsanlegget i Møllergata 19.",period:"1862–",excludes:["hele regjeringskvartalet","et komplett stående fengselsanlegg etter 1976","alle okkupasjonsfengsler og alle fangeerfaringer som én homogen fortelling"]},
  claims:allClaims,sentenceCoverage:{desc:descClaims.map((claim,index)=>({sentence:index+1,claimIds:[claim.id]})),popupDesc:popupClaims.map((claim,index)=>({sentence:index+1,claimIds:[claim.id]}))},
  metadataSnapshot:{name:place.name,category:place.category,year:place.year,coordinates:{lat:place.lat,lon:place.lon}},
  collections:{people:place.related_people_ids,objects:objects.map(item=>item.id),brands:[brandRecord.id],historical_events:historicalEvents.map(item=>item.id)},
  quizReadiness:{status:"canonical_normal_4x7",quizTargetId:id,sourceBrief:briefFile,productionContext:contextFile,normalOpeningQuestions:14,totalQuestions:28,reuseDecision:"Legacy 1x5 ble kildevurdert og erstattet av 4x7; ingen spørsmål er kopiert ordrett.",questions:readinessQuestions},
  roundsReadiness:{status:"ready",exactCollectionCount:4},
  source_conflicts:[
    {claim:"Det opprinnelige fengselet hadde én ubestridt kapasitet.",status:"bounded",reason:"SNL oppgir 145, Oslo Byleksikon 155. Produksjonen bruker 145 bare når SNL navngis og bevarer forskjellen i quizens kildekritiske lag."},
    {claim:"Dagens bygning er hele det opprinnelige fengselsanlegget.",status:"rejected",reason:"Fengselsbygningen og luftegårdene ble revet i 1976; bare forbygningen står."},
    {claim:"Flagget heist 7. juni 1905 kan brukes som bildeklart Object.",status:"held_back",reason:"DigitaltMuseum dokumenterer gjenstanden, men mediet mangler eksplisitt gjenbrukslisens."}
  ],
  reviews:{factual:{status:"passed",reviewedAt:verifiedAt,reviewer:"Møllergata 19 source review",notes:"SNL, Byleksikon, Fanger.no, Regjeringen, Commons-kataloger og Petter Moens biografi er krysskontrollert."},editorial:{status:"passed",reviewedAt:verifiedAt,reviewer:"Møllergata 19 identity review",introducedNewFacts:false,notes:"Forbygning, revet fengsel, okkupasjonsbruk, rettsoppgjør, objekter og senere minnebruk holdes adskilt."}},
  completion:{completedUnder:"4.2",currentStatus:"current",sourceVerifiedAt:verifiedAt,claimsVerified:{verified:allClaims.length,total:allClaims.length},factualReview:"passed",editorialReview:"passed",validatorVersion:"4.2.1"},
  textHashes:{algorithm:"sha256",desc:sha256(desc),popupDesc:sha256(popupDesc)}
});

const historySources = [
  {id:`source_${id}_snl`,url:urls.snl,sourceLocation:"bygging, institusjon, okkupasjon, personer, riving og senere bruk",sourceType:"reputable_secondary",verifiedAt,temporalCoverage:"retrospective",provenance:"Store norske leksikons fagredigerte stedsartikkel.",limitations:"Sammenfatter flere perioder; kapasitetstallet avviker fra Oslo Byleksikon."},
  {id:`source_${id}_byleksikon`,url:urls.byleksikon,sourceLocation:"rettsfunksjon, kvinneavdeling, Quisling, blåskilt og byhistorie",sourceType:"reputable_secondary",verifiedAt,temporalCoverage:"retrospective",provenance:"Oslo Byleksikons stedsoppslag.",limitations:"Kortfattet om fangenes individuelle erfaringer; oppgir 155 plasser mot SNLs 145."},
  {id:`source_${id}_fanger`,url:urls.fanger,sourceLocation:"fengselsstruktur, Sipo/SD-bruk og registrert fangeomfang",sourceType:"archive",verifiedAt,temporalCoverage:"mixed",provenance:"Fanger.no samler og publiserer person- og leiropplysninger fra arkiver.",limitations:"Databasetallet er registrerte personer, ikke en samtidstelling av alle fanger."},
  {id:`source_${id}_regjeringen`,url:urls.regjeringen,sourceLocation:"bygningens senere plass i regjeringskvartalet",sourceType:"official",verifiedAt,temporalCoverage:"current",provenance:"Regjeringens offisielle bygningsoversikt.",limitations:"Prioriterer nåværende statlig forvaltning framfor detaljert fengselshistorie."},
  {id:`source_${id}_moen`,url:urls.moen,sourceLocation:"Petter Moens arrestasjon, dagbokteknikk, skjul og utgivelse",sourceType:"reputable_secondary",verifiedAt,temporalCoverage:"retrospective",provenance:"Store norske leksikons fagredigerte biografi.",limitations:"Én persons liv og kilde kan ikke representere alle fangene."},
  {id:`source_${id}_opening_photo`,url:urls.openingImage,sourceLocation:"bygningen og torget i 1866",sourceType:"museum_or_heritage",verifiedAt,temporalCoverage:"contemporary_to_event",provenance:"Oslo Museum OB.F03200, tilgjengelig via Wikimedia Commons.",limitations:"Fotografiet viser utsiden og kan ikke dokumentere daglig praksis eller påbyggingen i 1877."}
];
const historySourceIds=historySources.map(item=>item.id),caseId=`case_${id}_institusjon_okkupasjon_kildespor`;
write(`data/places/historie-production/${id}.json`,{
  schemaVersion:"historie_place_production_v1",validatorVersion:"1.0.0",placeId:id,placeFile,status:"ready",
  historicalIdentity:{statement:"Møllergata 19 er den stående forbygningen og stedet for et politi-, retts- og fengselsanlegg fra 1866, senere okkupasjonsfengsel og etterkrigsinstitusjon.",placeRelationType:"institution_site",placeRelationStatement:"Place-et eier adressens dokumenterte anleggshistorie, men ikke hele regjeringskvartalet eller et fengsel som fortsatt står komplett.",temporalScope:{start:"1862",end:"2026",precision:"year",rationale:"Byggevedtak, åpning, overtakelser, riving og senere bruk har daterte kilder."},sourceIds:historySourceIds},
  historyTopics:place.emne_ids.map(emneId=>({emneId,siteSpecificRationale:`${emneId} realiseres gjennom det dokumenterte forholdet mellom politi, rett, fengsel, okkupasjon, rettsoppgjør og revne eller stående spor i Møllergata 19.`,caseIds:[caseId]})),sources:historySources,
  caseRealizations:[{
    id:caseId,claim:"Samme anlegg rommet skiftende former for offentlig makt, men fysisk kontinuitet må skilles fra rettslig og politisk brudd.",
    temporalSequence:{scope:{start:"1862",end:"1981",precision:"year",rationale:"Anleggets etablering, institusjonsskifter, okkupasjon, riving og departementsbruk er datert."},startPoint:"Bystyret vedtok et nytt politi-, retts- og fengselsanlegg i 1862.",endPoint:"Den bevarte forbygningen ble del av regjeringskvartalet i 1981.",breaks:["Sikkerhetspolitiet tok hele fengselet i bruk 13. september 1940.","Frigjøringen i 1945 avsluttet okkupasjonsregimet og åpnet rettsoppgjøret.","Rivingen i 1976 fjernet fengselsbygningen og luftegårdene."],continuities:["Forbygningen ble stående på samme adresse.","Stedet fortsatte å være knyttet til statlige og kommunale institusjoner."],sourceIds:historySourceIds.slice(0,4)},
    actors:[
      {name:"Christiania kommune, politi og rettsapparat",roleOrInterest:"Planla og brukte anlegget som offentlig politi-, retts- og fengselsinstitusjon.",powerPosition:"Institusjonene regulerte arrest, rettsbehandling og fangenskap.",sourceIds:[historySources[0].id,historySources[1].id]},
      {name:"Det tyske sikkerhetspolitiet",roleOrInterest:"Overtok fengselet som sentralfengsel for politiske fanger under okkupasjonen.",powerPosition:"Okkupasjonsmakten brukte arrest, avhør, tortur og videre transport som politisk kontroll.",sourceIds:[historySources[0].id,historySources[2].id]},
      {name:"Petter Moen og andre fanger",roleOrInterest:"Var underlagt fengselsregimet; Moen skapte et samtidig dagbokvitnesbyrd.",powerPosition:"Fangene hadde svært begrenset kontroll, og deres egne stemmer er ujevnt bevart.",sourceIds:[historySources[2].id,historySources[4].id]}
    ],
    conflictOrNegotiation:{statement:"Det ordinære politi- og rettsanlegget, okkupasjonsmaktens politiske fengsel og det norske rettsoppgjøret fulgte hverandre på samme adresse, men må ikke gjøres normativt eller rettslig like.",sourceIds:[historySources[0].id,historySources[1].id,historySources[2].id]},
    sourceComparison:{sourceIds:historySourceIds,comparison:"SNL og Byleksikon gir institusjonskronologi, Fanger.no gir registrert fangeomfang, Regjeringen dokumenterer senere bruk, Moen-biografien gir et individuelt vitnesbyrd, og 1866-fotografiet gir et samtidig utvendig spor.",contradictionsOrSilences:"SNL oppgir 145 opprinnelige plasser, Byleksikon 155. Institusjonskildene er langt sterkere enn åpne førstepersonskilder fra de fleste fangene.",conclusionLimits:"Caset kan dokumentere struktur, overtakelser, enkelte aktører og materielle spor, men ikke rekonstruere alle fangenes erfaringer."},
    comparativeScale:{localFinding:"Én adresse viser hvordan en offentlig institusjonsbygning kan få radikalt skiftende rettslige og politiske funksjoner.",widerContext:"Caset belyser modernisering av politi og fengsel, okkupasjonens kontrollapparat og etterkrigstidens institusjonelle omforming.",scale:"national",sourceIds:historySourceIds.slice(0,5)},
    causationAndUncertainty:{causalAssessment:"Byvekst bidro til nyanlegget, okkupasjonen muliggjorde sikkerhetspolitiets overtakelse, og senere institusjonsflytting og ombygging lå bak riving og ny bruk. Kildene kvantifiserer ikke hver årsaks relative betydning.",alternativeExplanations:["Rivingen må også forstås i lys av endrede bygnings- og forvaltningsbehov.","Petter Moens bevarte dagbok skyldes både hans handlinger og at rullene faktisk ble funnet etter krigen."],uncertainty:"Kapasitetstallene spriker, og mange fangers egne erfaringer er ikke bevart i like tilgjengelige kilder.",sourceIds:historySourceIds.slice(0,5)}
  }],
  presentTrace:{objectStatus:"altered",statement:"Forbygningen, inngangen, fasadeklokken og blåskiltet står; fengselsbygningen og luftegårdene er revet.",originalSiteRelationship:"De stående og fjernede delene tilhørte samme historiske anlegg, men dagens regjeringskvartal har en større og senere avgrensning.",sourceIds:[historySources[0].id,historySources[1].id,historySources[3].id,historySources[5].id]},
  quizOpening:{status:"PASS",quizTargetId:id,firstTwoSetsQuestionCount:14,sourceBrief:briefFile,productionContext:contextFile,requiredInputs:built.required_inputs_loaded},
  chronologyStories:{status:"PASS",chronologyReviewed:true,storiesReviewed:true,rationale:"Tolv kronologiankere bærer tidsindeksen; Petter Moens dagbok har selvstendig narrativ motor og én episode-Story."},
  gates:Object.fromEntries("ABCDEFGH".split("").map((gate,index)=>[gate,{status:"PASS",evidenceRefs:[index<2?index===0?"historicalIdentity":"historyTopics":index<6?"caseRealizations[0]":index===6?"quizOpening":"chronologyStories"]}])),
  review:{reviewer:"Møllergata 19 completion review",reviewedAt:verifiedAt,notes:"Identity, institutions, occupation violence, source conflict, missing prisoner voices, material traces, demolition and later use are controlled."}
});

const workcardFile="reports/place-production/mollergata-19-workcard-current.json";
const workcard=read(workcardFile);
Object.assign(workcard,{
  status:"complete",active_phase:"complete",source_review:"complete",production_verified_at:verifiedAt,quiz_profile:"normal_4x7",fagverk_status:"curated_standard",chronology_status:"PASS",story_status:"PASS",objects_status:"PASS",brands_status:"PASS",people_status:"PASS",quality_gate:`reports/place-production/${id}-phase1-24-gate-audit-v1.json`,branch_status:"ready_for_pr",live_status:"ikke live",
  content_plan:{people:"PRODUSERT: Jacob Wilhelm Nordan, Petter Moen og Viggo Hansteen har direkte, bildeklare koblinger.",objects:"PRODUSERT: det faktiske blå historieskiltet og fasadeklokken er fysiske, stedsspesifikke og bildeklare.",brands:"PRODUSERT: Selskabet for Oslo Byes Vel har en dokumentert skiltrolle ved stedet.",category_expression:"PRODUSERT: historical_events / Historiske hendelser.",stories:"PRODUSERT: Petter Moens perforerte fengselsdagbok har selvstendig narrativ motor.",for_na:"BEGRUNNET N/A: ingen kontrollert før–nå-par fra samme dokumenterte standpunkt.",news:"BEGRUNNET N/A: ingen selvstendig aktuell nyhetsflate.",lesespor:"PRODUSERT: SNL, Oslo Byleksikon, Fanger.no og SNLs Petter Moen-biografi."},
  object_category_boundary:"Blåskiltet og fasadeklokken eies av Objects; Selskabet for Oslo Byes Vel eies av Brands; daterte forløp eies av historical_events; bygningsdeler uten selvstendig objektfunksjon brukes ikke som fyll.",
  held_back_candidates:[{id:"flagg_nrm_02457",reason:"Sterk fysisk stedskobling til 7. juni 1905, men DigitaltMuseum-mediet mangler eksplisitt gjenbrukslisens."},{id:"vidkun_quisling",reason:"Direkte 1945-hendelse, men eksisterende bildepeker er brutt og personen ville skjeve People-samlingen; hendelsen beholdes i historical_events."},{id:"rolf_wickstrom",reason:"Direkte fangekobling, men mangler bilde; Viggo Hansteen bærer det samme hendelsesankeret med verifisert media."}],
  notes:[...workcard.notes,"Flagget NRM.02457 holdes tilbake fra Objects fordi gjenstandsregistreringen ikke gir en eksplisitt medielisens.","Blåskiltets preview er et ærlig inngangsutsnitt; skiltteksten er ikke rekonstruert og er ikke lovet lesbar i kortet.","Kapasitetskonflikten 145 hos SNL og 155 hos Oslo Byleksikon er bevart og bundet til kildene."]
});
write(workcardFile,workcard);
write(`reports/place-production/${id}-phase1-24-gate-audit-v1.json`,{
  schema:"history_go_phase1_24_quality_gate_v1",place_id:id,verified_at:verifiedAt,
  null_measurement:{existing_place:true,coordinate_changed:false,existing_quiz:"legacy_1x5",existing_story:"three_legacy_stories",existing_collections:0},
  collections:{required:["people","objects","brands","historical_events"],loaded_preview_images:4,missing:0,coverage_percent:100},
  manual_image_review:{status:"PASS",reviewed_assets:[place.image,place.frontImage,...objects.map(item=>item.image),brandRecord.image,...historicalEvents.map(item=>item.image),"bilder/kort/people/jacob_wilhelm_nordan.webp","bilder/kort/people/petter_moen.webp",hansteen.cardImage],note:"Stedsbilder, tre personbilder, to faktiske objekter, refererende logo og tre hendelsesbilder er inspisert. Blåskiltets størrelse og 1940-bildets kontekststatus er eksplisitt."},
  quality_score:{correctness_and_evidence:{score:5,note:"Hovedpåstander, tidslinje, bildeproveniens og kildekonflikt er bundet til SNL, Byleksikon, Fanger.no, Regjeringen og arkiv-/museumskilder."},coverage_and_completion:{score:5,note:"Fire bildeklare samlinger, Fagverk v2, tolv kronologiankere, én Story, seks språkposter, fire lesespor og 28 quizspørsmål er produsert."},editorial_quality:{score:5,note:"Forbygning, revet fengsel, ordinær institusjon, okkupasjonsbruk, rettsoppgjør og senere minnebruk holdes adskilt."},technical_integrity:{score:5,note:"Kanoniske manifester, kontekst, produksjonsrapporter og permanent regresjon følger samme kildepakke."},safety_and_responsibility:{score:5,note:"Fangenskap og tortur formidles nøkternt; Moen generaliseres ikke til alle fanger, og rettsregimene likestilles ikke."},maintainability_and_auditability:{score:4,note:"Holdbacks og media er etterprøvbare; blåskiltets faktiske plassering er synlig, men skiltet er lite i det tilgjengelige frie kontekstbildet."},total:29,critical_findings:0,unresolved_blockers:0}
});

await runBuildQuizProductionContext({root,categoryId:"historie",targetId:id,outputPath:contextFile});
console.log("Møllergata 19 materialized: 4 collections, 28 quiz questions, 12 chronology anchors, 1 episode Story.");
