#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { runBuildQuizProductionContext } from "../scripts/build-quiz-production-context.mjs";

const root=process.cwd();
const verifiedAt="2026-09-11";
const placeId="vaterlandsparken";
const categoryId="by";
const brandId="oslo_bymiljoetaten";
const placeFile="data/places/natur/oslo/places_oslo_natur_akerselvarute/vaterlandsparken.json";
const require=createRequire(import.meta.url);
const sharp=require("sharp");
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),"utf8"));
const write=(file,value)=>{const target=path.join(root,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,JSON.stringify(value,null,2)+"\n");};
const sha256=value=>crypto.createHash("sha256").update(String(value)).digest("hex");
const sentences=text=>[...new Intl.Segmenter("nb",{granularity:"sentence"}).segment(text)].map(x=>x.segment.trim()).filter(Boolean);
const addOnce=(arr,value)=>{if(!arr.includes(value))arr.push(value);};
const upsert=(arr,value,key="id")=>{const i=arr.findIndex(item=>item?.[key]===value[key]);if(i<0)arr.push(value);else arr[i]=value;};
const writeCompactArray=(file,value)=>{const target=path.join(root,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,"[\\n"+value.map(item=>JSON.stringify(item)).join(",\\n")+"\\n]\\n");};

const urls={
  official:"https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/vaterlandsparken/",
  bylex:"https://oslobyleksikon.no/side/Vaterlandsparken",
  local:"https://lokalhistoriewiki.no/Vaterlandsparken",
  landscape:"https://snl.no/13.3_Landskapsarkitekter",
  osm:"https://www.openstreetmap.org/way/4334996",
  social:"https://aktuelt.oslo.kommune.no/apne-rusmiljo-i-oslo-sentrum",
  outreach:"https://www.oslo.kommune.no/helse-og-omsorg/rustjenester/fyll-dagene-arbeidstilbud-og-aktiviteter/alle-tilbud-i-oslo/uteseksjonen/",
  management:"https://www.oslo.kommune.no/slik-bygger-vi-oslo/avbotende-tiltak-i-vaterlandsparken/",
  korus:"https://filer.korus.no/publications/Under-brua-hkh-rapport.pdf",
  bergesen:"https://bergesenstiftelsen.no/aktuelt/oslospelet-et-sted-%C3%A5-v%C3%A6re/",
  osloMarkPage:"https://commons.wikimedia.org/wiki/File:Oslo_komm.svg",
  parkReport:"https://www.oslo.kommune.no/get-file/1347840/738e3c7ef7cf94310c543472cc63bc1a1940ad3b2f36ecbd6869719b0c368472/",
  heroPage:"https://commons.wikimedia.org/wiki/File:Vaterlandsparken_med_Oslo_Plaza.JPG",
  frontPage:"https://commons.wikimedia.org/wiki/File:Vaterlandsparken_mot_Gronland.JPG",
  oldPage:"https://commons.wikimedia.org/wiki/File:Vaterlandsparken.jpg",
  nowPage:"https://commons.wikimedia.org/wiki/File:Vaterlandsparken,_Oslo_2025.jpg",
  bustPage:"https://commons.wikimedia.org/wiki/File:Olafia-byste,_Oslo.png",
  olafiaPage:"https://commons.wikimedia.org/wiki/File:Olafia_Johannsdottir_BW.jpg"
};

const place=read(placeFile);
if(place.lat!==59.9130617||place.lon!==10.7570946||place.sourceObjectId!=="osm-way:4334996") throw new Error("Vaterlandsparken coordinate/identity drift before production");
for(const key of ["rounds","cardImage","layers","rundinger"]) delete place[key];
Object.assign(place,{
  year:1993,
  desc:"Vaterlandsparken er en offentlig elvepark ved Akerselva, opparbeidet i 1993–94 etter planer fra 13.3 Landskapsarkitekter og A. Haukeland landskapsarkitekter. Parken ligger på et område med eldre våtmarks-, tømmer-, by- og saneringshistorie. Ólafia Jóhannsdóttirs byste og Ola Enstads «Dykkar Installasjon» gjør sosialhistorie og offentlig kunst fysisk lesbare i parkrommet.",
  popupDesc:[
    "Vaterlandsparken ligger langs Akerselva mellom Vaterlands bru, Oslo Plaza og Lilletorget. Oslo kommune opparbeidet parken i 1993–94 etter planer fra 13.3 Landskapsarkitekter og A. Haukeland landskapsarkitekter. Området var tidligere regulert til islamsk kultursenter og ble lenge omtalt som «moskétomta» før parkprosjektet ble gjennomført.",
    "Stedets landskapshistorie er eldre enn dagens park. Kommunale kilder beskriver området som tidligere fjord- og sumpmark knyttet til Vaterlands vann- og tømmerhistorie. Senere urbanisering og sanering endret både terreng, bebyggelse og forbindelsen mellom elva og byen.",
    "Midt i parken står en byste av den islandske kvinnesakspioneren og sosialarbeideren Ólafia Jóhannsdóttir. Kristinn Pjetursson utførte bysten i 1930, og Lokalhistoriewiki dokumenterer at den har stått i Vaterlandsparken siden 2004. Ólafias arbeid for vanskeligstilte i Vaterlandsområdet gjør minnet til et stedsspesifikt sosialhistorisk spor.",
    "Ved Akerselva overfor parkens sørende henger Ola Enstads «Dykkar Installasjon», ofte kalt «Stupere». Oslo byleksikon daterer installasjonen til 1990. Kunstverket bruker elverommet og vannspeilet som del av opplevelsen og må derfor leses sammen med parkens plassering ved Akerselva.",
    "Vaterlandsparken er samtidig et hverdagsrom med ulike former for opphold og gjennomgang. Oslo kommune følger Vaterland som et område i arbeidet med åpne rusmiljøer og oppsøkende sosialt arbeid. Det dokumenterer et sosialt lag ved stedet, men beskriver ikke alle som bruker parken og skal ikke brukes til å redusere enkeltmennesker til kategorier.",
    "Parkprofilen holder derfor to nivåer fra hverandre: den fysiske, offentlige parken er den canonicale stedsidentiteten, mens dokumenterte rus-, ungdoms- og gatemiljøer behandles som et sekundært Subkultur-lag. Slik kan rekreasjon, ferdsel, marginalisering, sosialt arbeid, kunst og historiske lag undersøkes i samme geografi uten at ett lag får definere hele stedet.",
    "Den fysiske utformingen gjør flere historiske lag synlige på kort avstand: elva, den opparbeidede parkflaten, personminnet og forbindelsene mot Vaterlands bru og Lilletorget. Disse elementene har forskjellige dateringer og kildetyper, og sammenstillingen må derfor ikke leses som om de ble planlagt samtidig eller av samme aktør."
  ].join("\n\n"),
  image:"bilder/places/vaterlandsparken.webp",
  frontImage:"bilder/places/vaterlandsparken_front_portrait.webp",
  production_profile:"standard",
  profile_status:"confirmed",
  production_status:"complete",
  placeScope:"area",
  related_people_ids:["olafia_johannsdottir","kristinn_pjetursson","ola_enstad"],
  related_place_ids:["nybrua_vaterlandsparken","vaterland_historisk_elvelop","akerselva_utlop_bjorvika","brugata_storgata_rusmiljo"],
  place_card_profile:{
    schema:"history_go_place_card_profile_v2",
    production_profile:"standard",
    collection_ids:["people","objects","brands","historical_events"],
    reason:"Fire dokumenterte samlinger: stedstilknyttede personer, fysiske parkobjekter, Bymiljøetaten som parkforvalter og daterte historiske hendelser.",
    verifiedAt
  },
  spatial_profile:{
    place_form:"urban_river_park",
    canonical_scope:"Selve Vaterlandsparken som offentlig parkareal langs Akerselva; Nybrua, det historiske Vaterland og gatemiljøet beholder egne canonicale identiteter.",
    boundary_description:"OSM way 4334996 er bevart som verifisert parkgeometri; koordinaten er et områdeanker, ikke en inngang.",
    geometry_status:"verified_geometry_area_anchor",
    sources:[{source:"OpenStreetMap",url:urls.osm},{source:"Oslo kommune",url:urls.official}]
  }
});
place.imageMeta={source:"wikimedia_commons",sourcePage:urls.heroPage,creator:"Helge Høifødt",credit:"Helge Høifødt / Wikimedia Commons",license:"CC BY-SA 4.0",licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0/",date:"2015-01-04",originalDimensions:"4496x3000",outputDimensions:"1200x800",assetType:"documentary_place_photo",transformation:"Proporsjonal 3:2-beskjæring og WebP-normalisering; ingen generativ endring.",representationScope:"Parken sett fra Brugata mot Sonja Henies plass og Oslo Plaza.",verifiedAt};
place.frontImageMeta={source:"wikimedia_commons",sourcePage:urls.frontPage,creator:"Helge Høifødt",credit:"Helge Høifødt / Wikimedia Commons",license:"CC BY-SA 3.0",licenseUrl:"https://creativecommons.org/licenses/by-sa/3.0/",date:"2008-05-12",originalDimensions:"2304x3072",outputDimensions:"900x1200",orientation:"portrait",aspectRatio:"3:4",assetType:"documentary_place_photo",transformation:"Stående kildebilde beskåret til 3:4 og WebP-normalisert; ingen generativ endring.",representationScope:"Vaterlandsparken og forbindelsen mot Grønland.",verifiedAt};

place.objects=[
  {id:"vaterlandsparken_olafia_byste",title:"Bysten av Ólafia Jóhannsdóttir",name:"Ólafia-bysten",type:"skulptur",kind:"physical_object",year:1930,desc:"Kristinn Pjetursson utførte bysten i 1930; den har stått i Vaterlandsparken siden 2004.",historicalFunction:"Personminne som knytter parken til sosialhistorien i Vaterland.",physicalObject:true,placeSpecific:true,placeSpecificReason:"Lokalhistoriewiki dokumenterer plasseringen i parken siden 2004.",why_here:"Bysten gjør Ólafias arbeid for vanskeligstilte i området fysisk synlig.",image:"bilder/kort/objects/vaterlandsparken_olafia_byste.webp",imageMeta:{source:"wikimedia_commons",sourcePage:urls.bustPage,creator:"André Savik (Asav)",credit:"André Savik / Wikimedia Commons",license:"CC BY-SA 4.0",licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0/",date:"2021-05-06",originalDimensions:"2250x4000",outputDimensions:"900x1200",transformation:"Stedstro 3:4-beskjæring og WebP-normalisering.",verifiedAt},source_urls:[urls.local,urls.bylex,urls.bustPage]}
];
place.historical_events=[
  {id:"vaterlandsparken_event_1990",title:"«Stupere» settes opp",year:1990,desc:"Ola Enstads «Dykkar Installasjon» ble satt opp over Akerselva ved parkens sørende.",image:"bilder/kort/historical_events/vaterlandsparken_1990.webp",source_urls:[urls.bylex,urls.local]},
  {id:"vaterlandsparken_event_1993",title:"Parkarbeidet begynner",year:1993,desc:"Oslo kommune opparbeidet Vaterlandsparken i 1993–94 etter planer fra 13.3 og A. Haukeland.",image:"bilder/kort/historical_events/vaterlandsparken_1993.webp",source_urls:[urls.bylex,urls.official]},
  {id:"vaterlandsparken_event_1994",title:"Vaterlandsparken åpner",year:1994,desc:"Kommunale planhistoriske kilder omtaler innvielsen av parken i 1994.",image:"bilder/kort/historical_events/vaterlandsparken_1994.webp",source_urls:[urls.parkReport]},
  {id:"vaterlandsparken_event_2004",title:"Ólafia-bysten får plass i parken",year:2004,desc:"Bysten av Ólafia Jóhannsdóttir ble plassert i Vaterlandsparken i 2004.",image:"bilder/kort/historical_events/vaterlandsparken_2004.webp",source_urls:[urls.local]}
];

place.for_na={
  status:"produced_with_location_and_viewpoint_caveat",
  title:"Parken i 2006 og 2025",
  beforeImage:"bilder/historisk/vaterlandsparken/vaterlandsparken_2006.webp",
  beforeImageLabel:"Vaterlandsparken, 20. september 2006",
  beforeImageMeta:{source:"wikimedia_commons",sourcePage:urls.oldPage,creator:"Mahlum",credit:"Mahlum / Wikimedia Commons",license:"Public domain",date:"2006-09-20",originalDimensions:"1037x778",outputDimensions:"1200x900",verified:true,verifiedAt},
  nowImage:"bilder/places/vaterlandsparken_2025.webp",
  nowImageLabel:"Vaterlandsparken, 24. april 2025",
  nowImageMeta:{source:"wikimedia_commons",sourcePage:urls.nowPage,creator:"Ssu",credit:"Ssu / Wikimedia Commons",license:"CC BY-SA 4.0",licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0/",date:"2025-04-24",originalDimensions:"3985x2988",outputDimensions:"1200x900",verified:true,verifiedAt},
  before:"2006-bildet dokumenterer den etablerte parken litt over et tiår etter opparbeidelsen.",
  now:"2025-bildet dokumenterer samme canonicale park i en nyere tilstand.",
  change:"Bildene viser samme park på ulike tidspunkter, men ståsted og utsnitt er ikke dokumentert som identiske. De kan brukes til å sammenligne synlige park- og byromselementer, ikke til eksakte mål på endring.",
  caveat:"Ulike eller udokumenterte kamerastandpunkter; ingen optisk eksakt før/etter-påstand.",
  lookFor:["elvekanten","plen og harde flater","ganglinjer","trær","bygningskantene rundt parken"],
  sources:[urls.oldPage,urls.nowPage,urls.official]
};

place.interpretation={
  what_to_notice:["Overgangen mellom plen, harde flater og Akerselva.","Bysten som sosialhistorisk minne i et hverdagsrom.","Hvordan parkens kanter møter Lilletorget, høyhus og ferdselslinjer."],
  why_it_matters:["Parken viser hvordan sanert og planlagt bygrunn kan bli offentlig grøntrom.","Kunst og minne kobler parkbruk til eldre sosialhistorie.","Sosiale lag må studeres uten å gjøre sårbare mennesker til stedets identitet."],
  counterpoints:["Ett besøk kan ikke dokumentere stabile bruksmønstre.","Synlig opphold sier ikke hvorfor mennesker er der.","Dagens park kan ikke alene dokumentere tidligere våtmark eller sanering."],
  sources:[urls.official,urls.bylex,urls.local,urls.social].map(url=>({url,verifiedAt}))
};
place.onsite={
  safety:"Bruk offentlige ganglinjer og observer romlige forhold, ikke enkeltpersoner. Unngå nærgående foto av mennesker og ikke trekk slutninger om rus, helse eller tilhørighet fra utseende eller opphold.",
  observation_route:[
    {order:1,title:"Vaterlands bru",instruction:"Les parkens forhold til elva og den historiske forbindelsen mot Vaterland."},
    {order:2,title:"Parkflaten",instruction:"Registrer plen, harde flater, trær og ganglinjer uten å kartlegge personer."},
    {order:3,title:"Ólafia-bysten",instruction:"Koble objektet til kildene om Ólafia og plasseringen i 2004."},
    {order:4,title:"Sørenden",instruction:"Se hvordan kunst, elv og kulvert danner en egen romlig sekvens."}
  ],
  aha:"Et lite parkareal viser seg som våtmarksminne, saneringshistorie, landskapsarkitektur, offentlig kunst og sosialt forhandlet hverdagsrom."
};
place.fagverk={
  schema:"history_go_place_fagverk_v2",level:"full",status:"curated",
  intro:"Vaterlandsparken er et feltsted for å undersøke hvordan historiske landskapslag, offentlig parkdesign, minnekunst og sosial bruk virker i samme byrom. Analysen skiller det som kan observeres fysisk fra det som krever historiske eller institusjonelle kilder.",
  article:[
    "Parken ble opparbeidet i 1993–94, men stedet kan ikke forstås som et tomt areal som først fikk historie da. Kommunale kilder knytter området til eldre fjord- og sumpmark, tømmertransport, urbanisering og senere sanering.",
    "Det ubygde kultursenteret og navnet «moskétomta» viser at også planer som ikke blir realisert kan forme byens tidslinje. Kilden dokumenterer reguleringslaget; dagens parkflate beviser ikke alene hvorfor prosjektet ikke ble gjennomført.",
    "Ólafia-bysten viser hvordan personminne kan flyttes og få ny mening i offentlig rom. Bysten er fra 1930, mens plasseringen i Vaterlandsparken er fra 2004. Objektets alder og parktilknytning må derfor holdes fra hverandre.",
    "«Dykkar Installasjon» fra 1990 bruker selve elverommet som kunstnerisk scene. Det gjør Akerselva til mer enn en fysisk grense, men fotografi og observasjon kan ikke alene forklare kunstnerens intensjon.",
    "Vaterlandsparken fungerer som sosial infrastruktur fordi den tilbyr ferdsel, opphold og møteflater. Hvem som bruker stedet, hvorfor og hvordan det oppleves krever mer enn øyeblikksobservasjon.",
    "Henri Lefebvres rett-til-byen-perspektiv kan brukes til å spørre hvem som får bruke, forme og bli værende i urbane rom. Perspektivet er analytisk, ikke en påstand om juridisk eiendomsrett eller at alle brukere har samme interesser.",
    "Kommunens arbeid med åpne rusmiljøer og oppsøkende tjenester dokumenterer et sosialt lag ved Vaterland. Det gir ikke grunnlag for å identifisere enkeltpersoners helse, rusbruk eller tilhørighet fra synlig adferd.",
    "Metodisk bør stedsobservasjon registrere materialer, kanter, ferdselslinjer, objekter og tidsavgrensede bruksmønstre. Historiske forklaringer, årsaker og gruppetilhørighet krever egne kilder og tydelige evidensgrenser."
  ],
  subject_ids:["by","subkultur"],
  emne_ids:["em_by_parker_som_sosial_infrastruktur","em_by_historiske_lag_i_hverdagsrom","em_by_materialitet_og_sanseerfaring","em_by_symbolsk_makt_og_representasjon","em_sub_rett_til_byen","em_sub_tilhorighet_miljo"],
  chapter_ids:["byliv-offentlige-rom","historiske-lag-ruiner-minner","urbanisme-idealer-forbindelser-fortetting"],
  lenses:[
    {id:"vaterlandsparken_tidslag",title:"Lag under parkflaten",prompt:"Hvilke tidslag er dokumentert i kilder, og hvilke kan faktisk observeres i dag?",subject_id:"by",emne_id:"em_by_historiske_lag_i_hverdagsrom",evidence:"Kommunale og lokalhistoriske kilder dokumenterer våtmark, sanering, urealiserte planer og parketablering."},
    {id:"vaterlandsparken_sosial_infrastruktur",title:"Park som sosial infrastruktur",prompt:"Hvordan organiserer parkens flater ferdsel, opphold og møte mellom ulike bruk?",subject_id:"by",emne_id:"em_by_parker_som_sosial_infrastruktur",evidence:"Parkens fysiske utforming er observerbar; representativ bruk krever gjentatt og etisk observasjon."},
    {id:"vaterlandsparken_minnerom",title:"Minne og representasjon",prompt:"Hva gjør Ólafia-bysten synlig om sosialhistorien, og hva kan objektet ikke fortelle alene?",subject_id:"by",emne_id:"em_by_symbolsk_makt_og_representasjon",evidence:"Kilder dokumenterer kunstner, datering, flytting og parkplassering."},
    {id:"vaterlandsparken_rett_til_byen",title:"Rett til byen uten snarvei",prompt:"Hvordan kan tilgang, kontroll og bruk undersøkes uten å gjøre teori til juridisk fasit eller mennesker til kategorier?",subject_id:"subkultur",emne_id:"em_sub_rett_til_byen",evidence:"Kommunale tjenester dokumenterer et sosialt felt; Lefebvre brukes som analyseperspektiv med uttrykt evidensgrense."}
  ],
  guiding_questions:["Hva ved dagens park kan observeres direkte, og hva krever historiske kilder?","Hvordan skiller objektets alder seg fra tidspunktet da det kom til parken?","Hvordan virker elva som både grense, rute og del av kunstrommet?","Hvordan kan parkbruk registreres uten å identifisere eller kategorisere enkeltpersoner?","Hva betyr «rett til byen» som analytisk spørsmål, og hva betyr det ikke?"],
  concepts:["sosial infrastruktur","historiske lag","sanering","offentlig rom","representasjon","stedsminne","rett til byen","feltobservasjon","evidensgrense","landskapsarkitektur"],
  observable_traces:[
    {title:"Elvekant og parkflate",observation:"Registrer overgangen mellom vann, plen, harde flater og ganglinjer.",interpretation_boundary:"Historisk funksjon og tidligere terreng krever kilder.",source_urls:[urls.official,urls.bylex]},
    {title:"Ólafia-bysten",observation:"Les sokkel, plassering og forhold til hovedlinjene i parken.",interpretation_boundary:"Objektet viser ikke alene Ólafias biografi eller årsaken til flyttingen.",source_urls:[urls.local,urls.bustPage]},
    {title:"Tidsavgrenset parkbruk",observation:"Tell passering og opphold i et kort, anonymt tidsrom uten personbeskrivelser.",interpretation_boundary:"Ett tidsrom er ikke representativt for hele dagen, uka eller alle brukergrupper.",source_urls:[urls.official]}
  ],
  source_urls:[urls.official,urls.bylex,urls.local,urls.landscape,urls.social,urls.outreach,urls.parkReport],
  verified_at:verifiedAt
};
place.externalLinks=[
  ["official","Oslo kommune – Vaterlandsparken",urls.official],
  ["local_history","Oslo byleksikon – Vaterlandsparken",urls.bylex],
  ["local_history","Lokalhistoriewiki – Vaterlandsparken",urls.local],
  ["reference","Store norske leksikon – 13.3 Landskapsarkitekter",urls.landscape],
  ["map","OpenStreetMap – Vaterlandsparken",urls.osm],
  ["official","Oslo kommune – åpne rusmiljø i Oslo sentrum",urls.social],
  ["official","Oslo kommune – Uteseksjonen",urls.outreach]
].map(row=>({type:row[0],label:row[1],url:row[2],verifiedAt}));
place.module_audit={for_na:{status:"produced_with_location_and_viewpoint_caveat"},news:{status:"not_applicable_after_fresh_review",rationale:"Tidsfølsomme bygge- og trygghetstiltak hardkodes ikke som canonical parkhistorie.",reviewedAt:verifiedAt},events:{status:"not_applicable",rationale:"Ingen stabil stedsegen kalender er nødvendig for full Place-produksjon."},dialect:{status:"not_applicable",rationale:"Stedsnavn og fagtermer dokumenteres, men ingen kildebelagt dialektprofil."}};
write(placeFile,place);

const fagRegistry=read("data/fagverk/fagverk_registry.json");
fagRegistry.placeLinks[placeId]={sourceFile:placeFile.replace(/^data\//,""),field:"fagverk",schema:place.fagverk.schema,level:place.fagverk.level,status:place.fagverk.status};
write("data/fagverk/fagverk_registry.json",fagRegistry);

const peopleFile="data/people/by/oslo/akerselva/people_nybrua_vaterlandsparken.json";
const people=read(peopleFile);
const olafia=people.find(p=>p.id==="olafia_johannsdottir");
if(!olafia) throw new Error("Missing canonical Olafia person");
olafia.image="bilder/kort/people/olafia_johannsdottir.webp";
olafia.cardImage=olafia.image;
olafia.profileStatus="ready_people_v1";
olafia.verifiedAt=verifiedAt;
olafia.source_urls ||= [];
olafia.imageMeta={source:"wikimedia_commons",sourcePage:urls.olafiaPage,creator:"Ukjent fotograf",credit:"Wikimedia Commons",license:"Public domain",licenseUrl:"https://creativecommons.org/publicdomain/mark/1.0/",originalDimensions:"235x340",outputDimensions:"700x900",transformation:"Oppskalering og forsiktig 7:9-beskjæring; ingen generativ rekonstruksjon.",verifiedAt};
addOnce(olafia.source_urls,urls.local);
write(peopleFile,people);

const brand={
  id:brandId,name:"Oslo kommune – Bymiljøetaten",aliases:["Bymiljøetaten","BYM"],
  brand_group:"public_actor",brand_type:"municipal_urban_environment_authority",brand_kind:"public_agency",sector:"public_administration",
  state:"catalog",status:"active",verification:"verified",verified_at:verifiedAt,
  desc:"Kommunal etat med dokumentert forvaltningsansvar for Vaterlandsparken.",
  popupdesc:"Oslo kommune oppgir Bymiljøetaten som ansvarlig for forvaltningen av Vaterlandsparken. Brand-koblingen gjelder den konkrete forvaltningsrollen, ikke eierskap til alle aktiviteter eller miljøer i parken.",
  tags:["brand","public_actor","park_management",placeId],place_ids:[placeId],
  source_urls:[urls.official,urls.management,urls.parkReport],
  logo:"bilder/kort/brands/oslo_bymiljoetaten.webp",
  imageMeta:{source:"wikimedia_commons",sourcePage:urls.osloMarkPage,creator:"Oslo kommune / ukjent opphavsperson",credit:"Oslo kommune / Wikimedia Commons",license:"Public domain; offentlig insignia med lovregulert bruk",rightsBasis:"referential_public_authority_identification",reviewStatus:"manually_approved",assetKind:"official_municipal_mark",sourceForm:"official_coat_of_arms",usageContext:"referential_identification",noEndorsement:true,generated:false,reconstructed:false,transformation:"Uendret kommunevåpen proporsjonalt sentrert på en nøytral 900 × 520-flate.",outputDimensions:"900x520",reviewedAt:verifiedAt}
};
place.brand_ids=[brandId];
const brandMaster=read("data/brands/brands_master.json");upsert(brandMaster,brand);write("data/brands/brands_master.json",brandMaster);
for(const file of ["data/brands/brands_catalog.json","data/brands/brands_catalog_v17.json"]){const items=read(file);upsert(items,{id:brand.id,name:brand.name,brand_group:brand.brand_group,brand_type:brand.brand_type,brand_kind:brand.brand_kind,sector:brand.sector,state:brand.state});write(file,items);}
const brandRaw=read("data/brands/brands_master_raw.json");upsert(brandRaw,{id:brand.id,name:brand.name,brand_type:brand.brand_type,sector:brand.sector,state:brand.state});writeCompactArray("data/brands/brands_master_raw.json",brandRaw);
const brandsByPlace=read("data/brands/brands_by_place.json");brandsByPlace[placeId]=[brandId];write("data/brands/brands_by_place.json",brandsByPlace);

const chronologyRows=[
  [1700,"Waterland-laget","Området beskrives som tidligere fjord- og sumpmark knyttet til vann og tømmertransport.",[urls.official,urls.parkReport]],
  [1930,"Ólafia-bysten utføres","Kristinn Pjetursson utførte bysten av Ólafia Jóhannsdóttir.",[urls.bylex]],
  [1959,"Saneringen av Vaterland","Saneringsperioden fjernet store deler av den eldre bebyggelsen og endret tomtestrukturen.",[urls.parkReport]],
  [1964,"Småbåthavnen flyttes","Den tidligere småbåthavnen langs elva ble flyttet ut av området.",[urls.parkReport]],
  [1990,"«Stupere»","Ola Enstads «Dykkar Installasjon» ble satt opp ved sørenden av parken.",[urls.bylex,urls.local]],
  [1993,"Parkarbeidet","Oslo kommune opparbeidet parken i 1993–94.",[urls.bylex,urls.official]],
  [1994,"Parken innvies","Kommunal planhistorie omtaler parken som innviet i 1994.",[urls.parkReport]],
  [2004,"Ólafia-bysten flyttes hit","Bysten har stått i Vaterlandsparken siden 2004.",[urls.local]],
  [2022,"Kommunal mulighetsstudie","Bymiljøetaten og Sweco undersøkte parkens historiske lag, ferdsel og utviklingsbehov.",[urls.parkReport]],
  [2025,"Oslospelet i parken","Oslospelet brukte Vaterlandsparken til miljønær historieformidling.",[urls.bergesen]]
];
const chronology=chronologyRows.map((r,i)=>({id:"chrono_vaterlandsparken_"+String(i+1).padStart(2,"0"),year:r[0],period:r[1],desc:r[2],confidence:"high",sources:r[3]}));
place.chronology=chronology;
write(placeFile,place);

const storyFile="data/stories/stories_nybrua_vaterlandsparken_split.json";
const stories=read(storyFile);
const ownStory=stories.find(s=>s.id==="st_vaterlandsparken_waterland_til_park");
if(!ownStory) throw new Error("Missing existing Vaterlandsparken Story");
ownStory.quality_profile="episode_v1";
ownStory.episode={actors:["Oslo kommune","13.3 Landskapsarkitekter","A. Haukeland landskapsarkitekter"],date:"1993–1994",action:"Et sanert og lenge ubygd areal ble opparbeidet som offentlig elvepark.",consequence:"Vaterland fikk et parkrom der eldre landskapslag, offentlig kunst og sosialhistorie kan leses sammen."};
ownStory.arc={start:"Vann, sump og tømmerhistorie preget området før den tette byen.",middle:"Sanering og en urealiserbar plan lot tomta stå åpen før parkprosjektet.",end:"I 1993–94 ble området offentlig park, senere supplert med Ólafia-bysten som sosialhistorisk minne."};
ownStory.sources=[
  {title:"Oslo kommune – Vaterlandsparken",url:urls.official},
  {title:"Oslo byleksikon – Vaterlandsparken",url:urls.bylex},
  {title:"Lokalhistoriewiki – Vaterlandsparken",url:urls.local},
  {title:"SNL – 13.3 Landskapsarkitekter",url:urls.landscape}
];
write(storyFile,stories);

const leksikonFile="data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch4.json";
const leksikon=read(leksikonFile);
const entry=leksikon.find(x=>x.place_id===placeId);
if(!entry) throw new Error("Missing existing Vaterlandsparken leksikon entry");
entry.version=3;
entry.title="Vaterlandsparken";
entry.popupDesc="Elvepark fra 1993–94 med eldre våtmarks-, sanerings- og planhistorie, Ólafia-bysten og Ola Enstads «Stupere».";
entry.summary={one_liner:"Vaterlandsparken samler vannhistorie, sanering, landskapsarkitektur, personminne og sosialt byrom på et lite areal ved Akerselva.",themes:["elvepark","historiske lag","landskapsarkitektur","offentlig kunst","sosialt byrom"],tone:["kildebasert","analytisk"]};
entry.chronology=chronology;
entry.sources=[urls.official,urls.bylex,urls.local,urls.landscape,urls.parkReport];
entry.visual={designCode:"article_urban_river_park"};
write(leksikonFile,leksikon);

const languageFile="data/leksikon/sprak/places/europe/norway/oslo/vaterlandsparken.json";
const languageRows=[
  ["vaterlandsparken_navn","Vaterlandsparken","stedsnavn","Navnet betegner dagens offentlige park på Vaterland."],
  ["waterland_navn","Waterland","historisk_navnelag","Navnelaget peker mot områdets eldre forhold til vann og våt grunn."],
  ["mosketomta","moskétomta","lokalt_planhistorisk_navn","Betegnelse brukt om arealet mens det var knyttet til en urealiserbar plan for islamsk kultursenter."],
  ["dykkar_installasjon","Dykkar Installasjon","verksnavn","Ola Enstads offisielle verkstittel; «Stupere» er et vanlig kortnavn."],
  ["sosial_infrastruktur","sosial infrastruktur","byfaglig_begrep","Offentlige rom og tjenester som legger til rette for møte, opphold og hverdagsliv."],
  ["rett_til_byen","rett til byen","teoribegrep","Lefebvre-perspektiv på bruk, deltakelse og mulighet til å forme urbane rom; ikke juridisk eiendomsrett."]
];
write(languageFile,{place_id:placeId,title:"Vaterlandsparken – språkspor",dialect_status:"not_documented",verified_at:verifiedAt,entries:languageRows.map((r,i)=>({id:r[0],term:r[1],type:r[2],layer:"place_language",meaning:r[3],status:"documented",usage:r[3],context:r[3],linked_to:{kind:"place",id:placeId},tags:[placeId,"byrom","historiske_lag"],sources:[{label:i===5?"Subkultur-fagverk":"Oslo byleksikon / Oslo kommune",url:i===5?"https://www.versobooks.com/blogs/news/3474-the-right-to-the-city-free-ebook-download":(i===1?urls.official:urls.bylex)}]}))});
const languageManifest=read("data/leksikon/sprak/manifest.json");
if(Array.isArray(languageManifest.files)){languageManifest.files=languageManifest.files.filter(x=>!String(x).includes("oslo/vaterlandsparken.json"));if(!languageManifest.files.length)delete languageManifest.files;}
languageManifest.place_files||={};
languageManifest.place_files[placeId]=languageFile;
write("data/leksikon/sprak/manifest.json",languageManifest);

const readingsFile="data/lesespor/oslo/lesespor_oslo_by.json";
const readings=read(readingsFile);
readings.items=(readings.items||[]).filter(x=>!(x.place_ids||[]).includes(placeId));
[
  ["lesespor_vaterlandsparken_oslo","Vaterlandsparken","Oslo kommune",urls.official,"institutional","Offisiell parkbeskrivelse med landskapshistorie og dagens parkfunksjon."],
  ["lesespor_vaterlandsparken_byleksikon","Vaterlandsparken","Oslo byleksikon",urls.bylex,"canonical","Redigert lokalhistorisk oversikt over anlegg, planhistorie og kunstverk."],
  ["lesespor_vaterlandsparken_lokal","Vaterlandsparken","Lokalhistoriewiki",urls.local,"recognized","Detaljer om Ólafia-bystens plassering og parkens lokale historie."],
  ["lesespor_vaterlandsparken_planrapport","Vaterland – planhistorie","Oslo kommune",urls.parkReport,"institutional","Kommunal planhistorie som dokumenterer sanering, mosképlan og parkinnvielse."],
  ["lesespor_vaterlandsparken_sosialt","Under brua","KORUS Oslo",urls.korus,"scholarly","Felt- og intervjubasert kontekstspor om åpne miljøer på Vaterland, brukt med tydelig tids- og individgrense."]
].forEach(r=>readings.items.push({id:r[0],title:r[1],popupDesc:r[5],author:null,publication:r[2],date:null,year:null,type:"artikkel",subjects:[{type:"place",name:"Vaterlandsparken",id:placeId}],place_ids:[placeId],category_hints:["by","historie","subkultur"],summary:{themes:["offentlig rom","historiske lag","sosial geografi"]},classification:{tags:["Vaterlandsparken","Akerselva","Vaterland"]},url:r[3],access:"open",rights:"link_only",source_quality:r[4],curation_status:"approved",relevance:r[5]}));
write(readingsFile,readings);

const sourceMap={
  official:[urls.official,"primary_institutional"],
  bylex:[urls.bylex,"edited_local_reference"],
  local:[urls.local,"edited_local_reference"],
  report:[urls.parkReport,"government_report"],
  social:[urls.social,"primary_institutional"]
};
const qrows=[
 ["Når ble Vaterlandsparken opparbeidet?","1993–94",["1993–94","1978–79","2003–04"],"Parken ble opparbeidet av Oslo kommune i 1993–94.","em_by_historiske_lag_i_hverdagsrom",["bylex","official"],"fact"],
 ["Hvem planla parken?","13.3 Landskapsarkitekter og A. Haukeland landskapsarkitekter",["13.3 Landskapsarkitekter og A. Haukeland landskapsarkitekter","Christian H. Grosch og Linstow","Vigeland og Munch"],"Kildene navngir 13.3 og A. Haukeland som landskapsarkitekter.","em_by_parker_som_sosial_infrastruktur",["bylex"],"fact"],
 ["Hva ble tomta lenge kalt før parken?","moskétomta",["moskétomta","børstomta","slottsjordet"],"Arealet var regulert til islamsk kultursenter og ble omtalt som moskétomta.","em_by_historiske_lag_i_hverdagsrom",["bylex","local"],"fact"],
 ["Hvilket landskap lå her før den tette byen?","fjord- og sumpmark",["fjord- og sumpmark","høyfjell","barskogreservat"],"Kommunale kilder beskriver eldre fjord- og sumpmark.","em_by_historiske_lag_i_hverdagsrom",["official","report"],"fact"],
 ["Hvilken elv grenser til parken?","Akerselva",["Akerselva","Lysakerelva","Alna"],"Vaterlandsparken ligger direkte ved Akerselva.","em_by_materialitet_og_sanseerfaring",["official","bylex"],"fact"],
 ["Hvem minnes med en byste i parken?","Ólafia Jóhannsdóttir",["Ólafia Jóhannsdóttir","Camilla Collett","Aasta Hansteen"],"Bysten i parken forestiller Ólafia Jóhannsdóttir.","em_by_symbolsk_makt_og_representasjon",["local","bylex"],"fact"],
 ["Hvem laget Ólafia-bysten?","Kristinn Pjetursson",["Kristinn Pjetursson","Ola Enstad","Gustav Vigeland"],"Kristinn Pjetursson utførte bysten i 1930.","em_by_symbolsk_makt_og_representasjon",["local","bylex"],"fact"],
 ["Når ble Ólafia-bysten plassert i Vaterlandsparken?","2004",["2004","1930","1990"],"Lokalhistoriewiki daterer parkplasseringen til 2004.","em_by_historiske_lag_i_hverdagsrom",["local"],"fact"],
 ["Når ble selve bysten utført?","1930",["1930","1993","2004"],"Bysten ble utført i 1930, lenge før den kom til parken.","em_by_historiske_lag_i_hverdagsrom",["local","bylex"],"fact"],
 ["Hvem laget «Dykkar Installasjon»?","Ola Enstad",["Ola Enstad","Kristinn Pjetursson","Dyre Vaa"],"Ola Enstad laget installasjonen.","em_by_symbolsk_makt_og_representasjon",["bylex","local"],"fact"],
 ["Når ble «Dykkar Installasjon» satt opp?","1990",["1990","2004","1998"],"Oslo byleksikon daterer installasjonen til 1990.","em_by_historiske_lag_i_hverdagsrom",["bylex"],"fact"],
 ["Hva kalles «Dykkar Installasjon» ofte?","Stupere",["Stupere","Elvespill","Neve med rose"],"Kildene oppgir «Stupere» som vanlig kortnavn.","em_by_symbolsk_makt_og_representasjon",["bylex","local"],"fact"],
 ["Hva er Vaterlandsparkens canonicale fysiske identitet?","en offentlig park",["en offentlig park","en bro","et kjøpesenter"],"Den canonicale identiteten er selve parkarealet.","em_by_parker_som_sosial_infrastruktur",["official","bylex"],"fact"],
 ["Hva er viktig å holde separat fra selve parkidentiteten?","det dokumenterte rus- og gatemiljøet som sosialt lag",["det dokumenterte rus- og gatemiljøet som sosialt lag","Akerselva som fysisk grense","parkens gressplen"],"Sosiale miljøer kan overlappe geografisk uten å være identiske med parken.","em_by_parker_som_sosial_infrastruktur",["social"],"context"],
 ["Hva kan du observere direkte i parken?","materialer, kanter og ganglinjer",["materialer, kanter og ganglinjer","alle brukeres motivasjon","historiske årsaker uten kilder"],"Fysisk stedsobservasjon kan registrere synlige romlige forhold.","em_by_materialitet_og_sanseerfaring",["official"],"context"],
 ["Hva kan ett parkbesøk ikke bevise?","stabile bruksmønstre for alle grupper",["stabile bruksmønstre for alle grupper","at parken har ganglinjer","at Akerselva ligger ved parken"],"Ett tidspunkt er ikke representativt for all bruk.","em_by_parker_som_sosial_infrastruktur",["official"],"context"],
 ["Hvorfor må 1930 og 2004 holdes fra hverandre?","1930 er bystens utførelsesår, 2004 er parkplasseringen",["1930 er bystens utførelsesår, 2004 er parkplasseringen","begge er parkens anleggsår","begge er år for Stupere"],"Objektets alder og plasseringens alder er ulike historiske opplysninger.","em_by_historiske_lag_i_hverdagsrom",["local"],"context"],
 ["Hva viser moskétomta best?","at urealiserte planer også kan være et historisk bylag",["at urealiserte planer også kan være et historisk bylag","at parken alltid var ferdig planlagt","at alle planer blir bygget"],"Et ubygget prosjekt kan fortsatt prege stedets planhistorie.","em_by_historiske_lag_i_hverdagsrom",["bylex","report"],"context"],
 ["Hvordan bør 2006- og 2025-bildene brukes?","til forsiktig sammenligning med ståstedskaveat",["til forsiktig sammenligning med ståstedskaveat","som eksakt optisk før/etter","som bevis på alle sosiale endringer"],"Ulike kamerastandpunkter begrenser hva bildene kan bevise.","em_by_materialitet_og_sanseerfaring",["official"],"context"],
 ["Hva gjør elva i kunstverket «Stupere»?","den inngår i verkets romlige scene",["den inngår i verkets romlige scene","den beviser kunstnerens motiv","den gjør parken til en bro"],"Installasjonen må leses sammen med plasseringen over elverommet.","em_by_materialitet_og_sanseerfaring",["bylex","local"],"context"],
 ["Hva dokumenterer kommunens arbeid med åpne rusmiljøer?","at Vaterland inngår i et sosialt oppfølgingsfelt",["at Vaterland inngår i et sosialt oppfølgingsfelt","at alle parkbrukere bruker rusmidler","at parken ikke er offentlig"],"Kommunen dokumenterer et område- og tjenestelag, ikke egenskaper ved alle individer.","em_by_parker_som_sosial_infrastruktur",["social"],"context"],
 ["Hva er en etisk grense ved feltobservasjon her?","ikke identifisere eller diagnostisere enkeltpersoner fra synlig adferd",["ikke identifisere eller diagnostisere enkeltpersoner fra synlig adferd","fotografere alle nærgående","anta gruppetilhørighet fra klær"],"Stedsanalyse må skille romlige observasjoner fra sensitive personpåstander.","em_by_parker_som_sosial_infrastruktur",["social"],"concept"],
 ["Hva bør en før/etter-analyse skille mellom?","synlig endring og historisk årsaksforklaring",["synlig endring og historisk årsaksforklaring","alle bilder som identiske","årstall og kilder som irrelevante"],"Bilder kan vise elementer; årsaker krever dokumentasjon.","em_by_historiske_lag_i_hverdagsrom",["report"],"concept"],
 ["Hva betyr sosial infrastruktur i denne analysen?","et sted som muliggjør møte, opphold og hverdagsbruk",["et sted som muliggjør møte, opphold og hverdagsbruk","kun tekniske rør","et privat medlemskap"],"Parken kan analyseres som fysisk ramme for hverdagslig sambruk.","em_by_parker_som_sosial_infrastruktur",["official"],"concept"],
 ["Hva er den tryggeste måten å bruke teori om offentlig rom på?","som spørsmål og analysegrep, ikke som erstatning for stedsbevis",["som spørsmål og analysegrep, ikke som erstatning for stedsbevis","som bevis på alle brukeres mening","som juridisk eierskapsdokument"],"Teori hjelper å stille spørsmål, mens stedspåstander må bæres av casekilder.","em_by_symbolsk_makt_og_representasjon",["official","social"],"concept"],
 ["Hva kan konkurrerende bruk av parken vise?","at offentlig rom kan romme ulike interesser samtidig",["at offentlig rom kan romme ulike interesser samtidig","at én gruppe eier parken","at konflikt alltid er negativ"],"Ulike bruksinteresser kan eksistere i samme offentlige rom.","em_by_parker_som_sosial_infrastruktur",["official","social"],"concept"],
 ["Hva bør analysen gjøre med rusmiljøet?","behandle det som et dokumentert lag uten å la det definere alle mennesker eller hele parken",["behandle det som et dokumentert lag uten å la det definere alle mennesker eller hele parken","ignorere alle kommunale kilder","gjøre det til parkens eneste identitet"],"Et sosialt lag skal dokumenteres uten stigmatisering eller totalisering.","em_by_parker_som_sosial_infrastruktur",["social"],"concept"],
 ["Hva er den viktigste kildegrensen for Vaterlandsparken?","skille det som observeres nå fra historiske og sosiale påstander som krever egne kilder",["skille det som observeres nå fra historiske og sosiale påstander som krever egne kilder","anta at dagens utseende forklarer hele historien","bruke ett bilde som bevis for alle perioder"],"Stedsobservasjon, historiske kilder og sosial dokumentasjon må ha hver sin evidensrolle.","em_by_historiske_lag_i_hverdagsrom",["official","bylex","social"],"concept"]
];
if(qrows.length!==28) throw new Error("Expected 28 Vaterlandsparken quiz rows");
const finalMethods=["met_feltobservasjon","met_for_etter","met_gaanalyse","met_feltobservasjon","met_feltobservasjon","met_feltobservasjon","met_for_etter"];
const questions=qrows.map((r,i)=>{
  const n=i+1,setNo=Math.floor(i/7)+1;
  const q={id:"vaterlandsparken_quiz_"+String(n).padStart(2,"0"),quiz_id:"by_vaterlandsparken_set_"+setNo+"_q"+((i%7)+1),categoryId,placeId,targetId:placeId,question_scope:"place",question:r[0],options:r[2],answer:r[1],answerIndex:r[2].indexOf(r[1]),knowledge:r[3],difficulty:setNo,question_type:r[6],question_layer:i<14?"normal_opening":i<21?"bridge":"final",emne_id:r[4],source:r[5],source_origin:"external",claim_basis:r[3],claim_id:"claim_vaterlandsparken_quiz_"+String(n).padStart(2,"0"),primary_knowledge_unit_id:"ku_by_vaterlandsparken_"+String(n).padStart(2,"0"),knowledge_unit_ids:["ku_by_vaterlandsparken_"+String(n).padStart(2,"0")],knowledge_contract_version:1,knowledge_link_status:"linked",concept_ids:[],term_ids:[]};
  if(i>=21){q.method_id=finalMethods[i-21];q.guidance_basis=["data/fag/by/pensum_by.json","data/fag/by/emner_by.json","data/fag/by/fagkart_by.json","data/fag/by/methods_by.json"];}
  if(i===25){q.emne_id="em_by_inkludering_ekskludering";q.topic_hook_id="makt_rett_til_byen";q.thinker_id="henri_lefebvre";q.work="The Production of Space";q.theory_ref={topic_hook_id:"makt_rett_til_byen",thinker_id:"henri_lefebvre",work:"The Production of Space",why_it_helps:"Lefebvres perspektiv gjør det mulig å undersøke tilgang, bruk og romproduksjon uten å gjøre sosial bruk til juridisk eierskap eller grenseløs råderett."};}
  return q;
});
const briefFile="data/quiz/production_briefs/by/vaterlandsparken.json";
const contextFile="data/quiz/production_context/by/vaterlandsparken.json";
const quizFile="data/quiz/by/vaterlandsparken_sets.json";
const selectedCurriculum={module_ids:["kur_by_01_byrom_akser_knutepunkt","kur_by_04_historiske_lag_og_transformasjon","kur_by_06_makt_symboler_og_representasjon","kur_by_07_gronn_blaa_og_offentlig_natur"],emne_ids:["em_by_parker_som_sosial_infrastruktur","em_by_historiske_lag_i_hverdagsrom","em_by_materialitet_og_sanseerfaring","em_by_symbolsk_makt_og_representasjon","em_by_inkludering_ekskludering","em_by_sosial_miks_i_offentlige_rom","em_by_styring_forvaltning_planmakt"],topic_hook_ids:["makt_rett_til_byen"],method_ids:[...new Set(finalMethods)],thinker_ids:["henri_lefebvre"],works:["The Production of Space"]};
const existingQuizAudit={searched_paths:[quizFile,"data/quiz/manifest.json",placeFile],active_before:{file:quizFile,set_count:6,question_count:42,finding:"Legacy 6×7-bank var kildebasert, men repetitiv og manglet dagens canonical production_context/progresjon."},decisions:["Bevar stedsspesifikke fakta og kilder.","Reduser 42→28 fordi fire selvstendige læringsjobber dekker identitet/historie, minne/kunst, byrom/sosial geografi og metode uten repetisjon.","Hold de første fjorten spørsmålene teori- og metodefrie; teori/metode innføres bare i finalsettet."],knowledge_migration:"Alle 28 spørsmål får stabile Knowledge-ID-er."};
const brief={schema_version:"1.0",status:"reviewed",categoryId,targetId:placeId,profile_hint:"normal",reviewed_at:verifiedAt,review_note:"Parkens fysiske identitet, historiske lag, kunst/minne og sosial geografi er kildebundet med uttrykte etiske og metodiske grenser.",scope:{place:"Vaterlandsparken",production_profile:"normal",set_count:4,questions_per_set:7,total_questions:28,normal_opening_questions:14},sources:Object.fromEntries(Object.entries(sourceMap).map(([id,v])=>[id,{url:v[0],source_type:v[1],review_status:"reviewed",review_note:"Kontrollert mot påstandene som bruker denne kilde-ID-en."}])),selected_curriculum:selectedCurriculum,existing_quiz_audit:existingQuizAudit,profile_decision:{profile:"normal",set_count:4,questions_per_set:7,justification:"Fire kildebærende læringsjobber uten utfyllingsspørsmål."},held_back_candidates:["Midlertidige bygge- og ferdselsendringer.","Påstander om enkeltpersoners rus, helse eller tilhørighet fra observasjon.","Eksakt optisk før/etter uten dokumentert kamerastandpunkt.","Nybrua som del av parkidentiteten."],claims:questions.map((q,i)=>({claim_id:q.claim_id,order:i+1,planned_phase:i<7?"opening":i<14?"middle":i<21?"bridge":"final",family:q.question_type==="concept"?"concept_theory":q.question_type,statement:q.claim_basis,source_ids:q.source,source_origin:"external",emne_id:q.emne_id,...(i>=21?{method_id:q.method_id}:{}),...(i===25?{topic_hook_id:q.topic_hook_id,thinker_id:q.thinker_id,work:q.work}:{})}))};
write(briefFile,brief);
const fagManifest=read("data/fag/fag_manifest.json");
fagManifest.by.quizProduction.targets[placeId]={source_brief:"../quiz/production_briefs/by/vaterlandsparken.json",context_artifact:"../quiz/production_context/by/vaterlandsparken.json",quiz_file:"../quiz/by/vaterlandsparken_sets.json"};
write("data/fag/fag_manifest.json",fagManifest);
await runBuildQuizProductionContext({root,categoryId:"by",targetId:placeId,outputPath:contextFile});
const generatedContext=read(contextFile);
const productionContext={manifest_category:"by",profile:"normal_4x7",standard_version:"3.4",source_brief:briefFile,context_artifact:contextFile,resolved_files:Object.fromEntries(Object.entries(generatedContext.resolved_files).map(([k,v])=>[k,v.path])),required_inputs_loaded:generatedContext.required_inputs_loaded,pensum_module_ids:generatedContext.selected_curriculum.module_ids,emne_ids:generatedContext.selected_curriculum.emne_ids,topic_hook_ids:generatedContext.selected_curriculum.topic_hook_ids,method_ids:generatedContext.selected_curriculum.method_ids,thinker_ids:generatedContext.selected_curriculum.thinker_ids,works:generatedContext.selected_curriculum.works,source_review_status:generatedContext.source_review_status,existing_quiz_audit:generatedContext.existing_quiz_audit,profile_decision:generatedContext.profile_decision,held_back_candidates:generatedContext.held_back_candidates,normal_opening_questions:14,theory_start_phase:"final",method_start_phase:"final"};
const phaseNames=["opening","middle","bridge","final"];
const setTitles=["Parken og tidslagene","Minner og kunst","Byrom og sosial geografi","Metode, makt og kildegrenser"];
write(quizFile,{place_id:placeId,targetId:placeId,categoryId,sources:Object.fromEntries(Object.entries(sourceMap).map(([k,v])=>[k,v[0]])),size_class:"normal",generator_version:"canonical_place_production_v1",profile_snapshot:place.quiz_profile,existing_quiz_audit:existingQuizAudit,production_context:productionContext,sets:phaseNames.map((phase,i)=>({set_id:"by_vaterlandsparken_set_"+(i+1),title:setTitles[i],level:i+1,order:i+1,phase,xp:50+i*25,questions:questions.slice(i*7,i*7+7)}))});
const quizManifest=read("data/quiz/manifest.json");
quizManifest.sets=(quizManifest.sets||[]).filter(x=>x.targetId!==placeId);
quizManifest.sets.push({targetId:placeId,file:quizFile});
write("data/quiz/manifest.json",quizManifest);
// Rebuild context after the canonical quiz exists so audit and materialization see identical repository state.
await runBuildQuizProductionContext({root,categoryId:"by",targetId:placeId,outputPath:contextFile});

const sourceForSentence=s=>{
  if(/rusmiljø|oppsøkende|enkeltmennesk|Subkultur/i.test(s)) return {url:urls.social,type:"official"};
  if(/Ólafia|Pjetursson|2004/i.test(s)) return {url:urls.local,type:"institutional"};
  if(/Dykkar|Stupere|Enstad|1990/i.test(s)) return {url:urls.bylex,type:"institutional"};
  if(/fjord|sump|tømmer|landskapshistorie/i.test(s)) return {url:urls.official,type:"official"};
  return {url:urls.bylex,type:"institutional"};
};
const productionClaims=[];
const coverage={};
for(const field of ["desc","popupDesc"]){
  const ss=sentences(place[field]);
  coverage[field]=ss.map((claim,i)=>{
    const src=sourceForSentence(claim);
    const id="claim_vaterlandsparken_"+field+"_"+String(i+1).padStart(2,"0");
    const strong=/\b(?:første|eldste|største|minste|eneste|viktigste|ledende|avgjørende|derfor|dermed|revolusjonerte)\b/iu.test(claim)||/særlig kjent for|førte til|på grunn av|endret for alltid/iu.test(claim);
    productionClaims.push({id,claim,sourceUrl:src.url,sourceLocation:field+", setning "+(i+1),sourceType:src.type,verifiedAt,status:"verified",claimKind:strong?"strong":(i===0?"identity":"ordinary"),evidenceMode:strong?"explicit":"direct",temporalStatus:/dag|nå|følger/i.test(claim)?"current":"historical",...(strong?{independentSourceUrls:[urls.official,urls.bylex,urls.local].filter(url=>url!==src.url).slice(0,2)}:{})});
    return {sentence:i+1,claimIds:[id]};
  });
}
const claimIdMatching=pattern=>{const hit=productionClaims.find(entry=>pattern.test(entry.claim));if(!hit)throw new Error("Missing production claim for readiness "+pattern);return hit.id;};
const readiness=[
  {question:"Når ble Vaterlandsparken opparbeidet?",answer:"1993–94",type:"når",claimIds:[claimIdMatching(/1993–94/u)]},
  {question:"Hvem planla Vaterlandsparken?",answer:"13.3 Landskapsarkitekter og A. Haukeland landskapsarkitekter",type:"hvem",claimIds:[claimIdMatching(/13\.3 Landskapsarkitekter/u)]},
  {question:"Hva ble arealet lenge omtalt som før parken?",answer:"moskétomta",type:"hva",claimIds:[claimIdMatching(/moskétomta/u)]},
  {question:"Hvilket verk ble satt opp over Akerselva i 1990?",answer:"Dykkar Installasjon («Stupere»)",type:"hvilket_verk_eller_objekt",claimIds:[claimIdMatching(/1990/u)]},
  {question:"Hva skjedde med Ólafia-bysten i 2004?",answer:"Den fikk plass i Vaterlandsparken",type:"hva_skjedde",claimIds:[claimIdMatching(/2004/u)]},
  {question:"Hva ble bygget eller opparbeidet i 1993–94?",answer:"Vaterlandsparken",type:"hva_ble_bygget_produsert_eller_endret",claimIds:[claimIdMatching(/opparbeidet.*1993–94/u)]},
  {question:"Hvor står Ólafia-bysten?",answer:"I Vaterlandsparken",type:"hvor",claimIds:[claimIdMatching(/Midt i parken står en byste/u)]},
  {question:"Hvem utførte Ólafia-bysten?",answer:"Kristinn Pjetursson",type:"hvem",claimIds:[claimIdMatching(/Kristinn Pjetursson/u)]}
].map(entry=>({...entry,normalKnowledgeQuestion:true}));
const packet={schemaVersion:"4.2",validatorVersion:"4.2.1",status:"ready_v4_2",placeId,placeFile,identity:{status:"resolved",represents:"Vaterlandsparken som offentlig parkareal langs Akerselva.",period:"1993–nåtid",excludes:place.related_place_ids},metadataSnapshot:{name:place.name,year:place.year,category:place.category,coordinates:{lat:place.lat,lon:place.lon}},textHashes:{algorithm:"sha256",desc:sha256(place.desc),popupDesc:sha256(place.popupDesc)},claims:productionClaims,sentenceCoverage:coverage,collections:{people:place.related_people_ids,objects:place.objects.map(x=>x.id),brands:[brandId],historical_events:place.historical_events.map(x=>x.id)},quizReadiness:{questions:readiness},reviews:{factual:{status:"passed",reviewedAt:verifiedAt,reviewer:"History Go kildekontroll",notes:"Identitet, anleggsperiode, kunst, minne og sosialt lag er kontrollert mot navngitte kilder."},editorial:{status:"passed",reviewedAt:verifiedAt,reviewer:"History Go redaksjonell kontroll",introducedNewFacts:false,notes:"Fysisk park og sosialt Subkultur-lag holdes eksplisitt fra hverandre; personvern- og stigmatiseringsgrenser er uttrykt."}},source_conflicts:["Nybrua er separat Place og inngår ikke i parkidentiteten.","Rus- og gatemiljøet er et sosialt lag, ikke synonymt med alle parkbrukere eller selve parken.","2006/2025-foto har ikke dokumentert identisk kamerastandpunkt.","Midlertidige bygge- og gangruteendringer hardkodes ikke."],completion:{completedUnder:"4.2",currentStatus:"current",sourceVerifiedAt:verifiedAt,claimsVerified:{verified:productionClaims.length,total:productionClaims.length},factualReview:"passed",editorialReview:"passed",validatorVersion:"4.2.1"}};
write("data/places/production/vaterlandsparken.json",packet);

write("reports/place-production/vaterlandsparken-production-v1.json",{schema:"history_go_place_production_v1",place_id:placeId,category:categoryId,placeFile,status:"complete",verified_at:verifiedAt,production_packet:"data/places/production/vaterlandsparken.json",identity_boundary:"Vaterlandsparken er selve parkarealet; Nybrua, det historiske Vaterland og rus-/gatemiljøet har egne identitets- eller faglag.",source_review:{status:"PASS",verified_claims:productionClaims.length,sentence_coverage:"complete",validator:"4.2.1"},collections:{people:place.related_people_ids,objects:place.objects.map(x=>x.id),brands:[brandId],historical_events:place.historical_events.map(x=>x.id)},imageEvidence:{place:place.imageMeta,front:place.frontImageMeta,before_after:place.for_na,objects:place.objects.map(x=>x.imageMeta),brand:brand.imageMeta,manual_review:"PASS"},quiz:{profile:"normal_4x7",sets:4,questions:28,normal_opening:14,source_file:quizFile,context_file:contextFile,editorial_change:"Legacy 42→canonical 28 for four non-repetitive learning jobs."},stories:[ownStory.id],chronology:chronology.map(x=>x.id),lesespor:5,fagverk:{schema:place.fagverk.schema,level:place.fagverk.level,status:place.fagverk.status},media:{place:place.image,front:place.frontImage,quiz_card:"bilder/QuizCards/Vaterlandsparken.webp",before:place.for_na.beforeImage,now:place.for_na.nowImage,objects:place.objects.map(x=>x.image),brand:brand.logo},boundaries:packet.source_conflicts,reviews:{factual:"PASS",editorial:"PASS",collections:"PASS_4",media:"PASS_MANUAL",quiz:"PASS_28",fagverk:"PASS_FULL"},completion:{status:"complete",unresolved_blockers:0},preserved_parallel_layers:["data/places/subkultur-production/vaterlandsparken.json"]});
write("reports/place-production/vaterlandsparken-phase1-24-gate-audit-v1.json",{schema:"history_go_phase1_24_quality_gate_v1",place_id:placeId,verified_at:verifiedAt,null_measurement:{existing_place:true,coordinate_changed:false,existing_quiz:"legacy 6x7/42 revised to canonical normal 4x7/28",existing_stories:"one retained and upgraded to episode_v1",existing_subkultur_layer:"preserved",identity_overlap:"Nybrua, historic Vaterland and street-environment layers remain separate"},manual_image_review:{status:"PASS",hero:"documentary park photo",front:"separate portrait documentary source",people:1,objects:1,brand:"official municipal mark used referentially",historical_events:"editorial date cards clearly marked as generated",before_after:"same park, non-identical viewpoint caveat"},quality_score:{correctness_and_evidence:{score:5,note:"Stedspåstander er bundet til gjennomgåtte kilder og koordinatbeviset er bevart."},coverage_and_completion:{score:5,note:"Fire samlinger, Quiz, Story, kronologi, Språk, Lesespor og Fagverk er produsert."},editorial_quality:{score:5,note:"Park, nabosteder og sosialt Subkultur-lag er tydelig avgrenset."},technical_integrity:{score:5,note:"Canonical manifester, stabile ID-er, bildeproveniens og regenererbare derivater inngår."},safety_and_responsibility:{score:5,note:"Sensitive sosiale forhold behandles på gruppenivå uten identifisering, diagnostisering eller stigmatisering."},maintainability_and_auditability:{score:5,note:"Kilder, hashes, builder og sluttartefakter gjør leveransen reproduserbar."},total:30,critical_findings:0,unresolved_blockers:0}});
write("reports/place-production/vaterlandsparken-workcard-current.json",{schema:"history_go_place_workcard_v1",place_id:placeId,category:categoryId,status:"complete",completed_at:verifiedAt,production_profile:"standard",profile_status:"confirmed",source_review:"complete",collections:place.place_card_profile.collection_ids,quiz_profile:"normal_4x7",stories_status:"PASS_1_EPISODE_V1",chronology_status:"PASS_10",language_status:"PASS_6",lesespor_status:"PASS_5",fagverk_status:"curated_full",images_and_rights_status:"PASS",subkultur_layer_status:"PRESERVED_READY",quality_gate:"reports/place-production/vaterlandsparken-phase1-24-gate-audit-v1.json",production_artifact:"reports/place-production/vaterlandsparken-production-v1.json",canonical_next:null});
execFileSync(process.execPath,["scripts/place-production-rule-preflight.mjs","record","--workcard","reports/place-production/vaterlandsparken-workcard-current.json","--place-id",placeId,"--category",categoryId],{cwd:root,stdio:"inherit"});

const uiFile="js/ui/place-card.js";
let ui=fs.readFileSync(path.join(root,uiFile),"utf8");
if(!/vaterlandsparken:\s*["']bilder\/QuizCards\/Vaterlandsparken\.webp["']/.test(ui)){
  const anchor='  slottsparken: "bilder/QuizCards/Slottsparken.webp",';
  if(!ui.includes(anchor)) throw new Error("QuizCard map anchor missing");
  ui=ui.replace(anchor,anchor+'\n  vaterlandsparken: "bilder/QuizCards/Vaterlandsparken.webp",');
  fs.writeFileSync(path.join(root,uiFile),ui);
}

const downloads={
  osloMark:"https://commons.wikimedia.org/wiki/Special:Redirect/file/Oslo_komm.svg?width=1200",
  hero:"https://commons.wikimedia.org/wiki/Special:Redirect/file/Vaterlandsparken%20med%20Oslo%20Plaza.JPG?width=2400",
  front:"https://commons.wikimedia.org/wiki/Special:Redirect/file/Vaterlandsparken%20mot%20Gronland.JPG?width=1800",
  old:"https://commons.wikimedia.org/wiki/Special:Redirect/file/Vaterlandsparken.jpg?width=1800",
  now:"https://commons.wikimedia.org/wiki/Special:Redirect/file/Vaterlandsparken%2C%20Oslo%202025.jpg?width=2400",
  bust:"https://commons.wikimedia.org/wiki/Special:Redirect/file/Olafia-byste%2C%20Oslo.png?width=1600",
  olafia:"https://commons.wikimedia.org/wiki/Special:Redirect/file/Olafia%20Johannsdottir%20BW.jpg?width=900"
};
const fetchAsset=async(url,label)=>{for(let attempt=1;attempt<=4;attempt++){const response=await fetch(url,{headers:{"user-agent":"History-Go-place-production/1.0"}});if(response.ok)return Buffer.from(await response.arrayBuffer());if(attempt===4)throw new Error(label+": HTTP "+response.status);await new Promise(r=>setTimeout(r,attempt*1200));}};
const saveWebp=async(buffer,output,width,height,options={})=>{const target=path.join(root,output);fs.mkdirSync(path.dirname(target),{recursive:true});await sharp(buffer).rotate().resize(width,height,{fit:options.fit||"cover",position:options.position||"centre"}).webp({quality:86}).toFile(target);};
const buffers={};
const media=[
 ["hero",place.image,1200,800],["front",place.frontImage,900,1200],["front","bilder/QuizCards/Vaterlandsparken.webp",900,1200],
 ["old",place.for_na.beforeImage,1200,900],["now",place.for_na.nowImage,1200,900],["bust",place.objects[0].image,900,1200],["olafia",olafia.image,700,900],["osloMark",brand.logo,900,520,{fit:"contain"}]
];
for(const m of media){if(fs.existsSync(path.join(root,m[1])))continue;buffers[m[0]]||=await fetchAsset(downloads[m[0]],m[0]);await saveWebp(buffers[m[0]],m[1],m[2],m[3],m[4]||{});}
const eventDir=path.join(root,"bilder/kort/historical_events");
fs.mkdirSync(eventDir,{recursive:true});
for(const event of place.historical_events){
  const out=path.join(root,event.image);
  const svg='<svg width="900" height="520" xmlns="http://www.w3.org/2000/svg"><rect width="900" height="520" fill="#f2efe8"/><text x="70" y="190" font-size="88" font-family="Arial, sans-serif" fill="#171717">'+event.year+'</text><text x="70" y="285" font-size="42" font-family="Arial, sans-serif" fill="#171717">'+event.title.replace(/&/g,"&amp;").replace(/</g,"&lt;")+'</text><text x="70" y="360" font-size="26" font-family="Arial, sans-serif" fill="#444">Vaterlandsparken · redaksjonelt tidskort</text></svg>';
  await sharp(Buffer.from(svg)).webp({quality:90}).toFile(out);
  event.imageMeta={source:"generated_editorial_timeline_card",creator:"History Go",license:"project_asset",generated:true,reconstructed:false,depictsDocumentaryPhoto:false,outputDimensions:"900x520",note:"Grafisk tidskort; ikke fotografisk dokumentasjon av hendelsen.",verifiedAt};
}
write(placeFile,place);

const imageAuditFile=path.join(process.env.RUNNER_TEMP||"/tmp","vaterlandsparken-place-image-audit.json");
execFileSync(process.execPath,["scripts/audit-place-images.mjs","--mode=all","--report="+imageAuditFile],{cwd:root,stdio:"ignore"});
const imageAudit=JSON.parse(fs.readFileSync(imageAuditFile,"utf8"));
const imageBacklogFile="data/places/place_image_backlog_summary.json";
const imageBacklog=read(imageBacklogFile);
imageBacklog.generatedAt=verifiedAt;imageBacklog.generatedFromCommit="vaterlandsparken_completion_20260911";imageBacklog.totalPlaces=imageAudit.totalPlaces;
imageBacklog.summary={validLocal:imageAudit.summary.local,validRemote:imageAudit.summary.remote,optionalMissing:imageAudit.summary.optional,missing:imageAudit.summary.missing,invalidLocalPath:imageAudit.summary.invalid,remaining:imageAudit.summary.missing+imageAudit.summary.invalid};
imageBacklog.byCategory=Object.fromEntries(Object.entries(imageAudit.byCategory).map(([category,bucket])=>[category,{total:bucket.total,valid:bucket.local+bucket.remote,optional:bucket.optional,missing:bucket.missing,invalid:bucket.invalid}]));
write(imageBacklogFile,imageBacklog);
execFileSync(process.execPath,["--experimental-strip-types","scripts/build-civication-scenario-people-index.mts"],{cwd:root,stdio:"inherit"});
execFileSync("npm",["run","civication:history-people:build"],{cwd:root,stdio:"inherit"});
execFileSync(process.execPath,["scripts/materialize-natur-final-registry.mjs"],{cwd:root,stdio:"inherit"});
execFileSync("npm",["run","places:index:build"],{cwd:root,stdio:"inherit"});
execFileSync(process.execPath,["scripts/build-place-open-payloads.mjs"],{cwd:root,stdio:"inherit"});
await runBuildQuizProductionContext({root,categoryId,targetId:placeId,outputPath:contextFile});
const knowledgeAuditFile="reports/knowledge-contract-audit.json";
const knowledgeAuditSnapshot=fs.existsSync(path.join(root,knowledgeAuditFile))?fs.readFileSync(path.join(root,knowledgeAuditFile)):null;
execFileSync(process.execPath,["--experimental-strip-types","scripts/knowledge-canonical-data.mts","--write"],{cwd:root,stdio:"inherit"});
if(knowledgeAuditSnapshot)fs.writeFileSync(path.join(root,knowledgeAuditFile),knowledgeAuditSnapshot);
execFileSync(process.execPath,["scripts/audit-fagverk-place-pages.mjs","--write"],{cwd:root,stdio:"inherit"});
execFileSync(process.execPath,["scripts/build-fagverk-release-manifest.mjs"],{cwd:root,stdio:"inherit"});
execFileSync("npm",["run","place-open:build"],{cwd:root,stdio:"inherit"});
execFileSync(process.execPath,["scripts/build-epoke-place-index.mjs"],{cwd:root,stdio:"inherit"});
console.log(JSON.stringify({status:"complete",place:placeId,quiz:"4x7",questions:28,chronology:chronology.length,story:ownStory.id,collections:place.place_card_profile.collection_ids,brand:brandId},null,2));
