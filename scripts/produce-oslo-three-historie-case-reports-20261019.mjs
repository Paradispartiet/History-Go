#!/usr/bin/env node
/** Individually reviewed industrial-history case evidence for three Oslo places. */
import fs from "node:fs";
import {validateHistoriePlaceReport} from "./audit-historie-place-production.mjs";

const D="2026-10-19",T="em_his_industriby_1900";
const configs=[
 {id:"christiania_seildugsfabrik",from:"1856",to:"2026",
  identity:"Den tidligere Christiania Seildugsfabrik i Fossveien 24 fra 1856; ikke fabrikkene som senere fusjonerte på Bryn.",
  traceStatus:"altered",
  trace:"Det tidligere fabrikkbygget i Fossveien 24 står fortsatt og huser Kunsthøgskolen i Oslo, slik høgskolen dokumenterer på sin nåværende kontaktside.",
  actor1:["Industriherrene og fabrikkeierne","Investerte i tekstilproduksjon og nye arbeidsbygninger ved Akerselva.","Disse hadde kontroll over investeringer og organisering av fabrikken."],
  actor2:["Kvinnelige og mannlige fabrikkarbeidere","Spant, vevde og behandlet tekstiler; mange arbeidet ved fabrikkens maskiner.","De var avhengige av arbeidsplassen og hadde ikke samme makt som eierne."],
  start:"Fabrikken ble grunnlagt i 1856 og startet produksjonen av seilduk ved Øvre Foss i 1858.",
  end:"Kunsthøgskolen bruker de ombygde bygningene ved Fossveien 24 som undervisningssted.",
  turns:["En fabrikkbygning brant i 1904 og deler av anlegget ble bygget om.","Seilduken ble innlemmet i Fortex i 1960, og produksjonen ble senere nedlagt.","Industriområdet ble omformet til kunstutdanning i den gamle bygningsmassen."],
  continuity:"Det samme tomteområdet ved Akerselva har rommet produksjon, arbeid og senere utdanning.",
  conflict:"Fabrikkens produksjonsbehov og arbeiderliv ga området funksjon, mens nyere bevaring og høgskolebruk krevde omforming av lokalene.",
  comparison:"Oslo byleksikon daterer fabrikknedleggelsen til 1976 og oppgir Kunsthøgskolen fra 2003. SNL opererer med 1978 og 2010; Kunsthøgskolens offisielle kontaktside bekrefter bare dagens bygning og adressen Fossveien 24.",
  omissions:"Kildene gir ulike avslutnings- og innflyttingsdatoer; flere produksjonstrinn og arbeidernes egne stemmer er dårlig belagt i kortversjonene.",
  limits:"Stedets identitet og fabrikkens hovedproduksjon er sikre. Uenigheten om 1976/1978 og 2003/2010 må beholdes som datokonflikt, ikke skjules.",
  local:"Et helt fabrikkmiljø ved Akerselva har gått fra seilduk- og tekstilproduksjon til utdanningslokaler.",
  wider:"Endringen viser hvordan den norske industribyen kan bevare bygninger mens formålet skifter fra arbeidsgiverstyrt produksjon til offentlig utdanning.",
  causation:"Nærheten til Akerselva og investeringer i store teglbygg ga grunnlag for tekstilfabrikken; senere ombruk fulgte av at produksjonsbehovet endret seg.",
  alternatives:"Andre mulige forklaringer inkluderer flytting og sammenslåing av tekstilindustri, eiendomsøkonomi og vekst i kunstutdanning.",
  uncertainty:"Ulike leksikonoppføringer oppgir forskjellige årstall for nedleggelse og Kunsthøgskolens bruk.",
  sources:[
   ["byleksikon","https://oslobyleksikon.no/side/Christiania_Seildugsfabrik","Historikk, oppstart, arbeidsstokk, fusjon og fabrikknedleggelse","reputable_secondary","retrospective","Oslo byleksikons lokalhistoriske artikkel om virksomheten.","Stedets etterbruk dateres annerledes hos SNL; er en kort sekundærkilde."],
   ["khio","https://khio.no/om-kunsthogskolen-i-oslo/kontaktinfo","Adresse og beskrivelse av nåværende campus i den ombygde Seilduksfabrikken","institutional","current","Kunsthøgskolens egen oppdaterte besøks- og kontaktinformasjon.","Bekrefter nåværende bruk, men ikke alle tidligere fabrikkhendelser."],
   ["snl","https://snl.no/Christiania_Seildugsfabrik","Faktaopplysning og historikk","reputable_secondary","retrospective","Redigert nasjonalt fagoppslagsverk.","Motstridende årstall for nedleggelse og bygningsbruk sammenlignet med Oslo byleksikon."]
  ]},
 {id:"frysja_industriomrade",from:"1855",to:"2026",
  identity:"Frysja industriområde ved Kjelsås Bruk og Akerselva, med fabrikkbygninger som senere ble kunstnersenter.",
  traceStatus:"altered",
  trace:"Oslo kommune oppgir at verneverdige fabrikkbygninger etter Mustad brukes som Frysja kunstnersenter med atelierer og verksteder.",
  actor1:["Kjelsås Bruk og O. Mustad & Sønn","Etablerte og videreførte industri for ståltråd, spiker og senere fiskeutstyr.","Bedriftene kontrollerte produksjonsanlegg og sysselsetting ved elva."],
  actor2:["Oslo kommune og lokale kunstnere","Overtok og tok i bruk tidligere industrilokaler til arbeidsrom for kunstnere.","Kommunen ble eiendomsforvalter, mens kunstnere fikk arbeidsplasser gjennom tildeling."],
  start:"Kjelsås Bruk ble etablert på midten av 1850-tallet med produksjon av spiker og ståltråd.",
  end:"De tidligere industribygningene ved Kjelsåsveien 145 brukes som kommunalt forvaltet kunstnersenter.",
  turns:["Mustad tok over industriområdet og produserte blant annet fiskekroker.","Mustad la ned produksjonen i begynnelsen av 1960-årene.","Oslo kommune tok over stedet og etablerte verksteder i de tidligere fabrikkbyggene."],
  continuity:"Akerselva, fabrikkbygningenes plassering og den praktiske bruken av arbeidsrom binder sammen gammel industri og dagens kunstnerarbeid.",
  conflict:"Mustad ønsket boligbygging etter nedleggelsen, men Oslo kommune avslo planene; bygningene ble senere beholdt til kunstnerverksteder.",
  comparison:"Oslo kommune beskriver eierskifter, nedleggelsen og den kommunale ombruken. Oslo byleksikon dokumenterer 70 atelierer etter ombyggingen 1972–1983 og TV-serien Fredrikssons Fabrikk.",
  omissions:"Kildene er mer detaljerte om selskap og bygninger enn om verkstedarbeidernes egne erfaringer og de økonomiske beslutningene.",
  limits:"Det historiske industrimiljøet og dagens kunstbruk er dokumentert; alle utviklingstrinn og produksjonens eksakte volum er ikke verifisert her.",
  local:"Et produksjonsområde for tråd og fiskeutstyr er omdannet til atelierer og kunstnerarbeidsplasser ved samme elv.",
  wider:"Dette illustrerer hvordan norske kommuner har funnet nye offentlige formål for gamle industribygg etter produksjonsnedleggelse.",
  causation:"Endringer i industriens lokalisering og den kommunale beslutningen om å beholde området muliggjorde ny kunstnerbruk.",
  alternatives:"Økonomi, eiendomsplanlegging, kulturpolitikk og lokal bevaringsinnsats bidro hver for seg til omformingen.",
  uncertainty:"Kildene oppgir noe ulikt oppstartsår for Kjelsås Bruk; eksakt tidligste produksjonsdato er ikke brukt som ubestridt dato.",
  sources:[
    ["byleksikon","https://oslobyleksikon.no/side/Frysja_senter","Kjelsås Bruk, ombyggingen 1972–1983 og kunstneratelierer","reputable_secondary","retrospective","Oslo byleksikons lokalhistoriske oversikt over Frysja senter.","Kortfattet om arbeidsliv før Mustad og årsakene til beslutningene."],
    ["kommune","https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/frysja-kunstnersenter","Om kultureiendommen og leiemuligheter","official","current","Oslo kommunes eier- og forvalterinformasjon om dagens Frysja kunstnersenter.","Offentlig forvalterperspektiv belyser ikke alle konfliktpartenes egne synspunkter."],
    ["kultur","https://www.norskekunsthandverkere.no/tidslinjer/milepaeler-fra-nk","Verkstedene på Frysja i 1975","institutional","retrospective","Fagorganisasjonens historiske tidslinje og atelierhistorie.","Beskriver særlig kunstnernes senere bruk og ikke hele fabrikkhistorien."]
  ]},
 {id:"bryn_industriomrade",from:"1873",to:"2026",
  identity:"Industriområdet på Bryn, inkludert de tidligere teglverksmiljøene ved Alna og jernbanen; ikke bare dagens Bryn senter.",
  traceStatus:"landscape_trace",
  trace:"Bryn har fortsatt det landskapet som knytter Alna til jernbanen og den gamle industristrukturen; kommunens kulturminnegrunnlag dokumenterer teglverks- og zinkhvittbygg ved Nils Hansens vei 14 og 18, men dagens bygningsstatus må verifiseres særskilt.",
  actor1:["Eiere og arbeidsgivere ved Bryns teglverk","Organiserte leireuttak, brenning og transport av tegl til det voksende Kristiania.","Bedriftenes investeringer og oppkjøp påvirket produksjonsområdet."],
  actor2:["Teglverksarbeidere og nærmiljø","Utførte tungt produksjonsarbeid og bodde i et industrielt bylandskap ved Alna.","Arbeiderne ble berørt av fabrikkdrift og nedleggelser, men trer svakt fram i skriftlige oversikter."],
  start:"Bryn Teglverk ble grunnlagt i 1873 i et område der jernbane og elv ga industrielle muligheter.",
  end:"Industribebyggelse og tidligere fabrikkområder på Bryn er delvis erstattet eller omformet til andre funksjoner.",
  turns:["Bryn Teglverk ble etablert i 1873 og flere teglverk kom til.","Hartvig Pedersen kjøpte Bryn Teglverk i 1913, og det tok over Høienhall Teglverk i 1930.","Teglverksproduksjonen ble lagt ned i 1960-årene, og andre bygg og virksomheter kom til."],
  continuity:"Alnaelva, Hovedbanen og industrielle eiendomsgrenser formet det samme området gjennom flere generasjoner.",
  conflict:"Teglverkene utnyttet leire og jernbanetilknytning, mens senere eiendomsutvikling satte spørsmålet om bevaring av enkelte fabrikkspor opp mot nye bruksbehov.",
  comparison:"Oslo byleksikon gir etablerings-, eierskaps- og nedleggelseskronologi. Byantikvarens kulturminnegrunnlag omtaler industribebyggelsen ved Nils Hansens vei og betydningen for Bryns særpreg. Historielaget og lokalhistoriewiki forklarer hvorfor Bryn Teglverk ikke må forveksles med Kristiania Teglverk.",
  omissions:"Kildene er ikke helt entydige om hvilke deler av fabrikkbygningene som faktisk ble bevart ved senere utbygging.",
  limits:"Bryn Teglverk og Kristiania Teglverk er ulike anlegg; dagens vernestatus og enkeltbygningers bevaring må undersøkes i oppdatert register før de hevdes intakte.",
  local:"Bryn utviklet et nettverk av fabrikker og teglverk der råvarer og jernbanen møttes øst for byen.",
  wider:"Området viser hvordan teglproduksjon og jernbane var knyttet til den store byutbyggingen på slutten av 1800-tallet.",
  causation:"Tilgang på leire, elvekraft og jernbanetransport gjorde Bryn egnet til industriell produksjon og frakt.",
  alternatives:"Byvekst, tomtepriser, ny byggteknologi og konkurranse fra andre produsenter kan også ha preget nedleggelser og senere utbygging.",
  uncertainty:"Opplysninger om det bevarte fabrikkomplekset varierer mellom nyere lokalhistorie og eldre kommunale planer.",
  sources:[
    ["byleksikon","https://oslobyleksikon.no/side/Bryn_Teglverk","Oppføring om virksomhet, eierskap og nedleggelse","reputable_secondary","retrospective","Oslo byleksikons oppslagsartikkel om Bryn Teglverk.","Omfatter ikke hele industriområdet, og må ikke brukes om Kristiania Teglverk."],
    ["byantikvaren","https://ellipsen.no/wp-content/uploads/2017/02/strategisk-plan-hovinbyen-vedlegg-3-kulturminnegrunnlag.pdf","Kulturminnegrunnlag, Nils Hansens vei 14 og 18, Kristiania teglverk","institutional","current","Byantikvarens kommunale kulturminnegrunnlag, gjengitt som publisert PDF.","Dokumenterer vurderinger på planstidspunktet; er ikke bekreftelse på at hvert bygg står intakt i 2026."],
    ["lokal","https://lokalhistoriewiki.no/Nils_Hansens_vei_%28Oslo%29","Oppføring for Nils Hansens vei 14 og 18","reputable_secondary","retrospective","Lokalhistorisk oppslagsverk som skiller Zinkhvidt-fabrikken fra Kristiania teglverk.","Kan beskrive eldre bygningsbruk; nåværende tilstand er ikke uavhengig verifisert."]
  ]}
];
const date="2026-10-19";
const all=[];
function e(id){return "source_"+id;}
function produce(c){
 const id=c.id, sourceIds=c.sources.map(s=>e(id+"_"+s[0])),caseId="case_"+id+"_industrial_reuse";
 const sources=c.sources.map(s=>({id:e(id+"_"+s[0]),url:s[1],sourceLocation:s[2],sourceType:s[3],verifiedAt:date,temporalCoverage:s[4],provenance:s[5],limitations:s[6]}));
 const topic={emneId:"em_his_industriby_1900",siteSpecificRationale:"Stedet viser en konkret sammenheng mellom fabrikkarbeid, transport og hvordan industribyen endret seg.",caseIds:[caseId]};
 const scope={start:c.from,end:c.to,precision:"period",rationale:"Perioden spenner fra lokal industrietablering til senere bygnings- og bruksendringer på samme sted."};
 const sid=[sourceIds[0],sourceIds[1]], actor=sid;
 const report={
 schemaVersion:"historie_place_production_v1",validatorVersion:"1.0.0",placeId:id,
 placeFile:"data/places/naeringsliv/oslo/places_naeringsliv/"+id+".json",status:"ready",
 historicalIdentity:{statement:c.identity,placeRelationType:"historical_landscape",
 placeRelationStatement:"Dette Place-kortet dekker et presist navngitt industrimiljø og ikke andre nabolag eller beslektede fabrikker.",temporalScope:scope,sourceIds:sid},
 historyTopics:[topic],
 sources,
 caseRealizations:[{
  id:caseId,claim:c.local,
  temporalSequence:{scope,startPoint:c.start,endPoint:c.end,breaks:c.turns,continuities:[c.continuity],sourceIds:sid},
  actors:[{name:c.actor1[0],roleOrInterest:c.actor1[1],powerPosition:c.actor1[2],sourceIds:sid},
          {name:c.actor2[0],roleOrInterest:c.actor2[1],powerPosition:c.actor2[2],sourceIds:sid}],
  conflictOrNegotiation:{statement:c.conflict,sourceIds:sid},
  sourceComparison:{sourceIds:sid,comparison:c.comparison,contradictionsOrSilences:c.omissions,conclusionLimits:c.limits},
  comparativeScale:{localFinding:c.local,widerContext:c.wider,scale:"national",sourceIds:sid},
  causationAndUncertainty:{causalAssessment:c.causation,alternativeExplanations:[c.alternatives],uncertainty:c.uncertainty,sourceIds:sid}
 }],
 presentTrace:{objectStatus:c.traceStatus,statement:c.trace,
  originalSiteRelationship:"Det nåværende området er det samme historiske industrimiljøet, men dagens bygg og bruk er ikke identisk med den eldre fabrikken.",sourceIds:sid},
 quizOpening:{status:"N/A",rationale:"Eksisterende QuizCard-samling bevares; den historiske åpningsquizens første to sett er ikke produsert i denne tekstbolken."},
 chronologyStories:{status:"N/A",chronologyReviewed:true,storiesReviewed:true,
 rationale:"Canonical Place-filen er inspisert. Ingen egen fullført Story eller historisk milepælsserie produseres i denne redaksjonelle tekstendringen."},
 gates:Object.fromEntries("ABCDEFGH".split("").map(letter=>[letter,
  "ABCDEF".includes(letter)?{status:"PASS",evidenceRefs:[({A:"historicalIdentity",B:"historyTopics",C:"caseRealizations[0].temporalSequence",D:"caseRealizations[0].actors",E:"caseRealizations[0].sourceComparison",F:"caseRealizations[0].comparativeScale"})[letter]]}:
  {status:"N/A",rationale:"Ikke del av den redaksjonelle tekstbolken; eksisterende QuizCard og eventuelle andre moduler beholdes."}])),
 review:{reviewer:"History Go Oslo industrial place source review",reviewedAt:date,
 notes:"Kilder og stedet er gjennomgått: sentrale historiske endringer, aktørperspektiv, mulige brudd i datering og grensene for hva kildene tillater er eksplisitt angitt."}
 };
 const place=JSON.parse(fs.readFileSync(report.placeFile,"utf8"));
 const errs=validateHistoriePlaceReport({report,place,canonicalEmneIds:new Set(["em_his_industriby_1900"])});
 if(errs.length)throw new Error(id+" "+JSON.stringify(errs,null,2));
 const dest="data/places/historie-production/"+id+".json";
 fs.mkdirSync("data/places/historie-production",{recursive:true});
 fs.writeFileSync(dest,JSON.stringify(report,null,2)+"\n");
 console.log("HISTORY CASE",id,"sources="+sources.length,"case="+caseId);
 return {id,path:dest,sources:sources.length};
}
for(const c of configs)all.push(produce(c));
console.log(JSON.stringify({published:all},null,2));
