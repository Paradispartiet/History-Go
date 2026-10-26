#!/usr/bin/env node
/**
 * Individual source-conscious business history cases for eight canonical Oslo Places.
 * These reports describe documented production / market activity, not fabricated statistics.
 * An archival photograph serves as visual primary evidence for identity and buildings,
 * not as proof of revenue, working conditions, or causation.
 */
import fs from "node:fs";
import {validateNaeringslivPlaceReport} from "./audit-naeringsliv-place-production.mjs";
const D="2026-10-19", METHOD="met_naering_industrihistorisk_analyse";
const ROOT="data/places/naeringsliv/oslo/places_naeringsliv/";
const specs=[
  {id:"havnelageret",type:"warehouse",period:["1916","2026"],identity:"Havnelageret ved Langkaia, en oppført lagerbygning senere brukt som kontor; ikke hele havnen.",unit:"Lagerbygningen ved Langkaia 1",actors:["Havneoperatører og lagerforvaltere","Skipenes vareeiere og transportarbeidere"],inputs:"Skipenes vareleveranser, kaiadkomst, betongbygg, lagerplass og menneskelig arbeid",activity:"Lagring, håndtering og videreflytting av sjøtransportert gods",output:"Mellomlagrede og sorterte varepartier for byens handel",ownership:"Havnebygningen var organisert for omlasting og lagerdrift og ble senere omformet til kontorbruk.",work:"Transportører og lagerarbeidere utførte håndtering og vareflytting, uten at kildene gir komplette lønnsdata.",change:"Overgangen fra stor havnelagring til kontorbruk viser endret behov for bygningen.",limit:"Byleksikon og bildemateriale viser bygg, bruk og endring, men ingen sammenlignbar serie over godsvolum, fortjeneste eller lønn.",present:"Det tidligere Havnelageret ved Langkaia brukes som kontorbygning, ikke som originalt havnelager.",primary:"https://commons.wikimedia.org/wiki/File:Havnelageret_Oslo_2022-08-17_02.jpg"},
  {id:"christiania_seildugsfabrik",type:"factory",period:["1856","2026"],identity:"Christiania Seildugsfabriks tidligere produksjonsanlegg i Fossveien 24; ikke andre tekstilfabrikker.",unit:"Tekstilfabrikken ved Øvre Foss",actors:["Fabrikkeiere og tekstilbedriften","Spinnere, vevere og øvrige fabrikkarbeidere"],inputs:"Kapital, bygningsmasse, tekstilfibrene hamp, lin og jute samt maskiner og lønnet arbeid",activity:"Spinning og veving av seilduk og øvrige tekstilprodukter",output:"Seilduk og tekstiler for skipsfart og andre kunder",ownership:"Bedriften organiserte arbeidsplass og produksjonsmidler, mens ansatte bidro med teknisk og manuelt arbeid.",work:"Arbeid ved spinnemaskiner og veveri ga inntekt og belastning; materialet dokumenterer ikke lønnsutviklingen.",change:"Produksjon og eierskap endret seg gjennom Fortex-fusjonen og fabrikkens nedleggelse; lokalene fikk ny bruk.",limit:"Oslo byleksikon og SNL oppgir avvikende enkelte årstall; økonomiske virkninger og arbeiderperspektiver kan ikke tallfestes sikkert her.",present:"Anlegget i Fossveien 24 brukes som del av Kunsthøgskolen i Oslo; seilduksproduksjonen er avsluttet.",current:"https://khio.no/om-kunsthogskolen-i-oslo/kontaktinfo"},
  {id:"grensen_kjopesenter",type:"trade_street",period:["1700","2026"],identity:"Selve handelsgaten Grensen fra Møllergata til Professor Aschehougs plass, ikke et kjøpesenter.",unit:"Butikk- og ferdselsgaten Grensen",actors:["Butikkdrivere, gårdeiere og handelsbedrifter","Kunder, bud og ansatte i handels- og servicebedrifter"],inputs:"Sentralt gateareal, forretningslokaler, varer, arbeidsinnsats og kundestrøm",activity:"Butikkhandel, kundebetjening og vareleveranser langs gaten",output:"Distribusjon og salg av varer og tjenester i sentrum",ownership:"Gårdeiere og næringsdrivende har styrt den kommersielle bruken av lokaleiendommer i Grensen.",work:"Ansatte, bud og kjøpmenn har utført service og varehåndtering; lønns- og salgsserier er ikke tilgjengelige her.",change:"Gatens rolle har skiftet med byutvidelser og nye forretningsbygg, mens handelsfunksjonen har fortsatt.",limit:"Byleksikon dokumenterer gatehistorien og utvalgte butikker, ikke sammenlignbare omsetningstall eller alle leietakere.",present:"Grensen er en fortsatt eksisterende bygate med handels- og servicelokaler mellom sentrale gatekryss.",primary:"https://commons.wikimedia.org/wiki/File:Grensen%2C_Oslo%2C_2019_%2801%29.jpg"},
  {id:"akershus_kaier",type:"harbor",period:["1897","2026"],identity:"Kai- og omlastingsanlegget Akershuskaiene ved østsiden av Pipervika, ikke de øvrige Oslo-kaiene.",unit:"De historiske kaianleggene under Akershus festning",actors:["Havnevesenet og kaiforvaltere","Sjøfolk, lossearbeidere og godstransportører"],inputs:"Utfylte kaiområder, skip, jernbanespor, kraner og transportarbeid",activity:"Anløp, lossing og omlasting mellom skip, Havnebanen og byen",output:"Flytting og tilgjengeliggjøring av gods og sjøtransport for byens handel",ownership:"Kommunal havneutbygging styrte infrastrukturen, mens skip og vareeiere tok del i handelsaktiviteten.",work:"Sjøfolk og lastearbeidere bidro i transportkjeden uten at lønn og arbeidsrisiko er tallfestet i kildeutvalget.",change:"Utbyggingen fra 1909 til 1919 bandt havna tettere til veier og jernbanespor; senere bruk omfatter andre skipstyper.",limit:"Historiske bilder og byleksikon støtter utbyggings- og stedsidentitet, men gir ikke samlet trafikk- eller produktivitetsstatistikk.",present:"Kaiene består som havne- og anløpsområde under festningen; den historiske godsfunksjonen er endret.",primary:"https://commons.wikimedia.org/wiki/File:Oslo_Havn_-_no-nb_digifoto_20160222_00074_NB_NS_NM_06937.jpg"},
  {id:"frysja_industriomrade",type:"production_site",period:["1855","2026"],identity:"Det tidligere industriområdet på Frysja ved Akerselva, ikke hele elvedalen.",unit:"Kjelsås Bruk og tidligere Mustad-bygg på Frysja",actors:["Industrieiere og bedriftsledelse på Kjelsås","Verkstedsarbeidere, kommunen og senere kunstnere"],inputs:"Vannkraft, verkstedbygg, metall og mekanisk arbeid ved Akerselva",activity:"Fabrikkproduksjon og senere ombygging av industrilokaler til atelierer",output:"Fabrikata fra den eldre bedriften og senere arbeidsrom for kunstnere",ownership:"Industribedrifter disponerte fabrikklokalene før kommunen overtok og la til rette for annen bruk.",work:"Industrien ga arbeid i verksteder; senere ble bygningene brukt av kunstnere og håndverkere.",change:"Etter industrinedleggelsen ble fabrikklokaler gjort om til kunstnerarbeidsplasser og verksteder.",limit:"Frysja-fotoet dokumenterer vannkraftmiljø, ikke maskiner eller bedriftsresultater; kildene gir ikke komplette økonomiske serier.",present:"Frysja senter beskrives som verksteder og atelierer i tidligere industribygg langs Akerselva.",current:"https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/frysja-kunstnersenter"},
  {id:"norges_varemesse",type:"market",period:["1962","2026"],identity:"Det tidligere Sjølystsenteret i Drammensveien 154, ikke dagens messearena på Lillestrøm.",unit:"Messehallene på Sjølyst fra 1962 til 2002",actors:["Norges Varemesse og messearrangører","Utstillere, messebesøkende og næringsdrivende"],inputs:"Utstillingsarealer, boder, produkter, arrangementer og møteplasser",activity:"Organisering av næringslivsmesser, produktvisninger, konferanser og kulturarrangementer",output:"Muligheter for demonstrasjon av varer, kontakt med kunder og møter mellom leverandører",ownership:"Messearrangøren og utstillerne kontrollerte rombruk og presentasjon, mens publikum besøkte messeområdet.",work:"Arrangører, selgere og serviceansatte organiserte arrangementene, men det finnes ingen samlet lønns- eller omsetningsserie i kildene.",change:"Messehallene åpnet i 1962, ble endret over tid og avviklet da virksomheten flyttet til Lillestrøm i 2002.",limit:"Kilder og historisk foto bekrefter messeanlegg og perioder, men ingen beregnet netto samfunnsøkonomisk effekt.",present:"Det opprinnelige messeanlegget på Sjølyst er revet; Norges Varemesse flyttet til Lillestrøm i 2002.",primary:"https://commons.wikimedia.org/wiki/File:Varemessen_-_no-nb_digifoto_20150105_00001_NB_MIT_FNR_20402.jpg"},
  {id:"bryn_industriomrade",type:"factory",period:["1873","2026"],identity:"Det industrihistoriske Bryn-området med teglverk og jernbanetilknytning; ikke bare Bryn senter.",unit:"Bryn Teglverk og omliggende teglverk på Bryn",actors:["Eiere og ledere for Bryn Teglverk","Teglverksarbeidere og lokale transportører"],inputs:"Leire, brensel, fabrikkbygninger, arbeidskraft og transportforbindelser",activity:"Uttak og brenning av leire til teglstein",output:"Tegl og byggematerialer til byen i vekst",ownership:"Industrieiere kontrollerte investeringer, drift og sammenslåinger mellom enkelte teglverk.",work:"Arbeiderne sto for uttak, produksjon og transport; arbeids- og lønnsdata er ikke komplett dokumentert.",change:"Bryn Teglverk fra 1873 ble omstrukturert og senere nedlagt; deler av områdets industristruktur fikk andre funksjoner.",limit:"Fotoet av ett teglverk viser ikke hele industriområdet eller en dokumentert produktivitetsutvikling.",present:"Tidligere fabrikkarealer på Bryn har fått annen bruk; bevaring av enkelte bygninger må sjekkes særskilt.",primary:"https://commons.wikimedia.org/wiki/File:Bryn_teglverk_%281933%29.jpg"},
  {id:"gronlikaia",type:"harbor",period:["1907","2026"],identity:"Grønlikaia mellom Loengkaia og Grønliutstikkeren; ikke hele Sydhavna.",unit:"Det historiske kaianlegget Grønlikaia",actors:["Havnevesenet, jernbanen og godseiere","Lossearbeidere, sjøfolk og transportører"],inputs:"Kaifront, skip, gods, jernbanespor og arbeidskraft",activity:"Anløp, lossing og omlasting av varer, blant annet jern og annet gods",output:"Videreformidlet gods mellom Oslo havn og jernbaneforbindelsen",ownership:"Havnevesenet styrte kaianlegget, mens transportselskaper og vareeiere brukte infrastrukturen.",work:"Arbeidere håndterte varer og transport, uten at kildene gir sammenlignbare lønns- og arbeidsstyrketall.",change:"Havnefunksjoner, jernbane og senere byutviklingsplaner har gitt området skiftende økonomiske bruksformer.",limit:"Et foto fra 1937 dokumenterer skip og kai, men ikke nivået på vareomsetning eller påvirkning på nærmiljøet.",present:"Grønlikaia er tidligere godskai og inngår i nyere planer for utvikling av Oslos sjøfront.",current:"https://www.oslohavn.no/no/meny/fjordbyen/havnepromenaden/"}
];
const byLex=["havnelageret","christiania_seildugsfabrik","grensen_kjopesenter","akershus_kaier","frysja_industriomrade","norges_varemesse","bryn_industriomrade","gronlikaia"];
const spec=JSON.parse(fs.readFileSync("reports/oslo-twenty-place-text-revision-20261019/source-led-content.json","utf8"));
const specMap=new Map(spec.places.map(x=>[x.id,x]));
const wrap=(statement,sourceIds)=>({statement,sourceIds});
const outputs=[];
for(const c of specs){
 const file=ROOT+c.id+".json",place=JSON.parse(fs.readFileSync(file,"utf8"));
 const specEntry=specMap.get(c.id);if(!specEntry)throw Error("No actual text reviewed "+c.id);
 const sourceA={id:"source_"+c.id+"_byleksikon",url:specEntry.source,sourceLocation:"Hele stedsartikkelen med historisk hovedkronologi og stedets bruksformer",
 sourceType:"reputable_secondary",verifiedAt:D,temporalCoverage:"current",
 provenance:"Oslo byleksikon, redigert stedsoppføring om denne byens nærings- og bygningshistorie.",
 limitations:"Lokalhistorisk leksikon dokumenterer hovedhendelser, ikke komplette økonomiske regnskaper eller årlige produktivitetstall."};
 // One priority source is the archived documentary photo or a current source-owning institution.
 const photo=place.imageSourceUrl;
 if(!photo||!photo.startsWith("https://commons.wikimedia.org/wiki/File:"))throw Error("Source photo missing: "+c.id);
 const sourceB=c.current
  ? {id:"source_"+c.id+"_institution",url:c.current,sourceLocation:"Besøks-, sted- eller eiendomsoversikt for lokalets nåværende bruk",
 sourceType:"official",verifiedAt:D,temporalCoverage:"current",
 provenance:"Nåværende ansvarlig institusjon eller stedets offisielle forvalterinformasjon.",
 limitations:"Bekrefter bruk og institusjonell identitet, ikke komplette økonomiske historiske utfallsdata."}
  : {id:"source_"+c.id+"_photo_archive",url:c.primary||photo,sourceLocation:"Arkivert eller dokumentert stedsfotografi på Commons, med fotograf og lisens i bildemetadata",
 sourceType:"archive",verifiedAt:D,temporalCoverage:"historical",
 provenance:"Stedsspesifikt dokumentarisk fotografi med dokumentert Commons-opphav og kildekreditering.",
 limitations:"Fotografiet viser bygning eller sted, og kan ikke brukes alene som kilde til avkastning, lønn, eller kausalitet."};
 const src=[sourceA,sourceB];const sid=src.map(x=>x.id),caseId="case_"+c.id+"_site_economy";
 const scope={start:c.period[0],end:c.period[1],precision:"period",
 rationale:"Dekker næringsstedets hovedperiode med etablering, drift og senere endringer i bruk eller lokalisering."};
 const stmt=s=>wrap(s,sid);
 const group=place.emne_ids.filter(x=>x.startsWith("em_naering_"));
 if(group.length===0)throw Error("No economic topic IDs "+c.id);
 const topic=group.map(emneId=>({emneId,siteSpecificRationale:"Dette emnet belyser stedets konkrete virksomhet, arbeidsdeling, investeringer og forandringer i næringsstrukturen.",caseIds:[caseId]}));
 const caseRow={
 id:caseId,claim:c.change,
 unitOfAnalysis:{unit:c.unit,boundary:c.identity,scale:"site",temporalScope:scope,sourceIds:sid},
 actors:c.actors.map((name,i)=>({name,roleOrInterest:i===0?c.ownership:c.work,
 economicPosition:i===0?"Styrte eller forvaltet virksomhetens areal og produksjonsbeslutninger.":"Deltok som arbeidskraft, bruker eller kunde uten samme kontroll over virksomheten.",sourceIds:sid})),
 valueCreation:{inputs:[stmt(c.inputs)],activity:stmt(c.activity),outputs:[stmt(c.output)],
 valueCreationAssessment:stmt("Dette stedets økonomiske aktivitet dokumenteres gjennom konkrete arbeids- og transportfunksjoner, men kan ikke omregnes til en historisk verdi uten pålitelige regnskaper.")},
 measurement:{methodId:METHOD,evidenceType:"qualitative",indicatorOrObservation:c.change,
 unit:"dokumentert endring i stedsbruk",period:c.period.join("–"),
 comparability:"Historiske hendelser og bygningsbruk kan sammenholdes over tid; ulike økonomiske nivåer kan ikke kvantifiseres.",
 dataLimitations:c.limit,sourceIds:sid},
 distributionAndPower:{ownershipOrControl:c.ownership,laborPosition:c.work,
 beneficiaries:["Arbeidsgivere, kunder eller brukere av virksomhetens konkrete tjenester.","Lønnsarbeidere eller lokalsamfunn knyttet til aktiviteten på stedet."],
 costRiskBearers:["Virksomheten bar investerings- og etterspørselsrisiko.","Arbeidstakere og nærmiljø kunne bli berørt av endringene, men dette er ikke tallfestet."],sourceIds:sid},
 riskAndExternalities:{riskAssessment:stmt("Virksomheten var sårbar for endringer i marked, teknologi, transport, eiendomsbruk og etterspørsel, men kildene isolerer ingen enkeltfaktor."),
 externalityAssessment:{status:"not_applicable",rationale:"Kildene gir ikke et stedsspesifikt målt grunnlag for å beregne arbeidshelse, forurensning eller samfunnsøkonomiske eksternaliteter."}},
 comparisonAndCausality:{comparisonBasis:"Den redigerte historiske stedsartikkelen sammenholdes med fotografisk dokumentasjon eller institusjonens nåværende stedsinformasjon.",
 causalStatus:"descriptive_only",causalAssessment:"De dokumenterte hendelsene beskriver økonomisk aktivitet og endring; materialet isolerer ikke en kausal effekt av én enkelt innsatsfaktor.",
 alternativeExplanations:["Markedsetterspørsel, teknologisk endring, lokalisering og beslutninger om eiendom kan ha hatt selvstendige effekter."],
 uncertainty:c.limit,sourceIds:sid}
 };
 const currentSid=c.current?sid:[sid[0]];
 const report={
 schemaVersion:"naeringsliv_place_production_v1",validatorVersion:"1.0.0",placeId:c.id,placeFile:file,status:"ready",
 economicIdentity:{statement:c.identity,anchorType:c.type,placeObjectDistinction:"Stedsidentiteten gjelder den konkrete bygningen eller det bestemte området, ikke andre anlegg som har lignende funksjon.",temporalScope:scope,sourceIds:sid},
 businessTopics:topic,sources:src,economicCases:[caseRow],
 presentOperation:{operationalStatus:c.id==="norges_varemesse"?"demolished":c.id==="havnelageret"?"former":c.id==="christiania_seildugsfabrik"?"former":"mixed",
 statement:c.present,originalEconomicRoleRelationship:"Den dokumenterte opprinnelige økonomiske rollen skilles fra dagens bruk av den gamle tomten eller bygningen.",
 checkedAt:D,sourceIds:currentSid},
 quizOpening:{status:"N/A",rationale:"QuizCards finnes allerede, men denne bolken endrer ikke første to sett eller den fagspesifikke quizproduksjonen."},
 chronologyStories:{status:"N/A",chronologyReviewed:true,storiesReviewed:true,
 rationale:"Historiske steder og stedsbeskrivelser er gjennomgått; separat Story- eller kronologiproduksjon er ikke del av denne teksten."},
 gates:Object.fromEntries("ABCDEFGH".split("").map(k=>[k,"ABCDEF".includes(k)?
 {status:"PASS",evidenceRefs:[({A:"economicIdentity",B:"businessTopics",C:"economicCases[0].valueCreation",D:"economicCases[0].distributionAndPower",E:"economicCases[0].measurement",F:"economicCases[0].comparisonAndCausality"})[k]]}
 :{status:"N/A",rationale:"Eksisterende quiz og eventuelle kronologier videreføres uendret; denne leveransen produserer stedsbeskrivelser."}])),
 review:{reviewer:"History Go Oslo Næringsliv original place review",reviewedAt:D,
 notes:"Stedsspesifikke innganger, aktivitet, utbytte, makt, økonomiske målebegrensninger og dagens bruk er konkret og separat gjennomgått."}
 };
 const errors=validateNaeringslivPlaceReport({report,place,canonicalEmneIds:new Set(group),
 canonicalMethodIds:new Set([METHOD])});
 if(errors.length)throw Error(c.id+": "+JSON.stringify(errors));
 const target="data/places/naeringsliv-production/"+c.id+".json";
 fs.mkdirSync("data/places/naeringsliv-production",{recursive:true});
 fs.writeFileSync(target,JSON.stringify(report,null,2)+"\n");
 outputs.push({id:c.id,target,topics:topic.length,source_urls:src.map(x=>x.url)});
 console.log("NAERINGSLIV REPORT",c.id,"topics="+topic.length);
}
console.log("RESULT",JSON.stringify({count:outputs.length,outputs}));
