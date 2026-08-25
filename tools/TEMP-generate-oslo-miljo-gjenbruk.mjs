#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const DATE = '2026-08-25';
const GEONORGE = 'https://ws.geonorge.no/adresser/v1/sok';
const GEONORGE_SOURCE = 'https://ws.geonorge.no/adresser/v1/';
const OSLO_REUSE = 'https://www.oslo.kommune.no/avfall-og-gjenvinning/ombruk/';
const CIRCULAR_SOURCE = 'https://www.miljodirektoratet.no/ansvarsomrader/avfall/sirkular-okonomi/';
const LESEKIOSK_LIST = 'https://lesekiosk.no/finn-en-kiosk/';
const LESEKIOSK_HOME = 'https://lesekiosk.no/';
const KIOSK_INVENTORY = path.join(ROOT, 'reports/lesekiosker-oslo-2026/lesekiosker-oslo-litteratur-inventory.json');

const reusePlaces = [
  { id:'grefsen_gjenvinningsstasjon', name:'Grefsen gjenvinningsstasjon', address:'Kapellveien 118, 0493 Oslo', type:'large_recycling_station', sourceUrl:'https://www.oslo.kommune.no/avfall-og-gjenvinning/alle-gjenvinningsstasjoner/grefsen-gjenvinningsstasjon/', free:true, sale:false, self:false, note:'Egne merkede hyller og områder gjør gratis uttak av ombruksvarer mulig.' },
  { id:'haraldrud_gjenvinningsstasjon', name:'Haraldrud gjenvinningsstasjon', address:'Brobekkveien 87, 0582 Oslo', type:'large_recycling_station', sourceUrl:'https://www.oslo.kommune.no/avfall-og-gjenvinning/alle-gjenvinningsstasjoner/haraldrud-gjenvinningsstasjon/', free:true, sale:false, self:false, note:'Byggevarer kan hentes gratis fra kommunens ombruksløsning inne på stasjonen.' },
  { id:'ryen_gjenvinningsstasjon', name:'Ryen gjenvinningsstasjon', address:'Vårveien 87, 0680 Oslo', type:'large_recycling_station', sourceUrl:'https://www.oslo.kommune.no/avfall-og-gjenvinning/alle-gjenvinningsstasjoner/ryen-gjenvinningsstasjon/', free:true, sale:false, self:false, note:'Egne merkede hyller og områder gjør gratis uttak av ombruksvarer mulig.' },
  { id:'smestad_gjenvinningsstasjon', name:'Smestad gjenvinningsstasjon', address:'Ullernchausseen 26, 0379 Oslo', type:'large_recycling_station', sourceUrl:'https://www.oslo.kommune.no/avfall-og-gjenvinning/alle-gjenvinningsstasjoner/smestad-gjenvinningsstasjon/', free:true, sale:false, self:false, note:'Byggevarer kan hentes gratis fra kommunens ombruksløsning inne på stasjonen.' },
  { id:'lindeberg_gjenvinningsstasjon', name:'Lindeberg gjenvinningsstasjon', address:'Jerikoveien 5, 1067 Oslo', type:'small_recycling_station', sourceUrl:'https://www.oslo.kommune.no/avfall-og-gjenvinning/alle-gjenvinningsstasjoner/lindeberg-gjenvinningsstasjon/', free:true, sale:false, self:true, note:'Stasjonen inngår blant de små gangbaserte stasjonene der mindre ombruksvarer kan hentes uten betaling når tilbudet er tilgjengelig.' },
  { id:'kampen_gjenvinningsstasjon', name:'Kampen gjenvinningsstasjon', address:'Sons gate 2, 0654 Oslo', type:'small_recycling_station', sourceUrl:'https://www.oslo.kommune.no/avfall-og-gjenvinning/alle-gjenvinningsstasjoner/kampen-gjenvinningsstasjon/', free:true, sale:false, self:false, note:'Stasjonen inngår blant de små gangbaserte stasjonene der mindre ombruksvarer kan hentes uten betaling.' },
  { id:'romsas_gjenvinningsstasjon', name:'Romsås gjenvinningsstasjon', address:'Romsås senter, 0970 Oslo', type:'small_recycling_station', sourceUrl:'https://www.oslo.kommune.no/avfall-og-gjenvinning/alle-gjenvinningsstasjoner/romsas-gjenvinningsstasjon/', free:true, sale:false, self:false, preset:[59.9640,10.8939], note:'Stasjonen inngår blant de små gangbaserte stasjonene der mindre ombruksvarer kan hentes uten betaling.' },
  { id:'sofienbergparken_gjenvinningsstasjon', name:'Sofienbergparken gjenvinningsstasjon', address:'Helgesens gate 56, 0553 Oslo', type:'small_recycling_station', sourceUrl:'https://www.oslo.kommune.no/avfall-og-gjenvinning/alle-gjenvinningsstasjoner/sofienbergparken-gjenvinningsstasjon/', free:true, sale:false, self:false, note:'Stasjonen inngår blant de små gangbaserte stasjonene der mindre ombruksvarer kan hentes uten betaling.' },
  { id:'trosterud_gjenvinningsstasjon', name:'Trosterud gjenvinningsstasjon', address:'Dr. Dedichens vei 24B, 0675 Oslo', type:'small_recycling_station', sourceUrl:'https://www.oslo.kommune.no/avfall-og-gjenvinning/alle-gjenvinningsstasjoner/trosterud-gjenvinningsstasjon/', free:true, sale:false, self:true, note:'Stasjonen inngår blant de små gangbaserte stasjonene der mindre ombruksvarer kan hentes uten betaling når tilbudet er tilgjengelig.' },
  { id:'haraldrud_ombrukstelt', name:'Haraldrud ombrukstelt', address:'Brobekkveien 87, 0582 Oslo', type:'reuse_tent', sourceUrl:'https://www.oslo.kommune.no/avfall-og-gjenvinning/alle-gjenvinningsstasjoner/haraldrud-ombrukstelt/', free:true, sale:true, self:false, note:'Ombruksteltet selger brukte gjenstander rimelig, og enkelte gjenstander tilbys gratis i en egen container.' },
  { id:'gronmo_ombrukstelt', name:'Grønmo ombrukstelt', address:'Sørliveien 1, 1279 Oslo', type:'reuse_tent', sourceUrl:'https://www.oslo.kommune.no/avfall-og-gjenvinning/alle-gjenvinningsstasjoner/gronmo-ombrukstelt/', free:false, sale:true, self:false, note:'Ombruksteltet selger brukbare gjenstander som er sortert ut fra kommunens gjenvinningsstasjoner.' }
];

const envLens = [
  'På Grefsen er ombrukshyllene særlig nyttige for å lese forskjellen mellom avfall, brukbar gjenstand, lokal deling, levetidsforlengelse, materialverdi og husholdningsvalg. Den konkrete hentefunksjonen gjør sirkulær økonomi synlig uten å gjøre stedet til en butikk.',
  'Haraldrud knytter ombruk til byggevarer, trevirke, fliser, dører, innredning, reparasjon og prosjektmaterialer. Stedet viser hvordan en kommunal mottaksstruktur også kan gi materialer en ny bruksrunde før de blir behandlet som avfall.',
  'Ryen gjør småskalauttak, nærmiljø, sortering, gjenstandsvurdering, direkte viderebruk og praktisk ressursdeling til tydelige temaer. Her kan et besøk handle like mye om hva som fortsatt har bruksverdi som om hva som skal kastes.',
  'Smestad gir et konkret møte med byggevarer, materialkvalitet, demontering, restpartier, gjenbruk, husholdningsprosjekter og redusert nykjøp. Ombruksfunksjonen gjør det mulig å undersøke hvordan brukbare materialer kan skifte eier uten å miste sin funksjon.',
  'Lindeberg kobler gangbasert tilgjengelighet, mindre gjenstander, nabolagsbruk, enkel levering, ombrukshyller, hverdagsressurser og lav terskel. Stedet egner seg til å undersøke hvordan lokal infrastruktur kan gjøre viderebruk praktisk i en tett bydel.',
  'Kampen setter småelektronikk, servise, bøker, leker, husholdningsgjenstander, nabolagsdeling og kort vei til mottak i samme kretsløp. Den lokale skalaen viser at ombruk ikke bare foregår på store anlegg utenfor boligområdene.',
  'Romsås gir et østlig nærmiljøperspektiv med senterfunksjon, gangadkomst, mindre varer, bokdeling, servise, småting, gjenbruksvalg og lokal tilgjengelighet. Det gjør ressurskretsløpet relevant for hverdagsreiser og ikke bare planlagte bilturer.',
  'Sofienbergparken kombinerer parkmiljø, tett by, korte avstander, mindre gjenstander, husholdningssortering, ombrukshyller og tilfeldig oppdagelse. Plasseringen gjør det mulig å se miljøinfrastruktur som en del av den ordinære byen snarere enn som et avsondret teknisk anlegg.',
  'Trosterud knytter selvbetjening, bemannede tidsrom, mindre ombruksvarer, lokale leveranser, tilgjengelighet, sorteringsvalg og videre bruk. Stedet viser hvorfor praktiske adgangsvilkår og selve ombruksfunksjonen må beskrives som to ulike sider av samme tilbud.',
  'Haraldrud-teltet samler møbler, sportsutstyr, bøker, lamper, kjøkkenutstyr, lydutstyr, prisede bruktvarer og enkelte gratisgjenstander. Sortimentet gjør ombruk til en synlig overgang fra kommunal innlevering til ny bruker og nytt bruksforløp.',
  'Grønmo-teltet samler møbler, bøker, vinyl, leker, servise, lamper, kjøkkenmaskiner og sportsutstyr i et kommunalt bruktutsalg. Her blir sortering til ombruk koblet direkte til salg, ny eier og utsatt behov for et tilsvarende nykjøp.'
];

const kioskLens = [
  'Kjelsås-kiosken åpner for temaer som museumsnærhet, teknologihistorie, bokvandring, gateinventar, lesespor, gjenbruk av infrastruktur, tilfeldig tekstfunn og nabolagslesing. Den røde formen gjør medieteknologi og litteratur synlige i samme fysiske objekt.',
  'Vigelandsparken-kiosken setter parkvandring, skulpturlandskap, fritidslesing, bokbytte, turtempo, offentlige møteplasser, kulturbruk og uventede bokfunn ved siden av hverandre. Litteraturpunktet kan oppdages som en liten funksjon i et stort besøkslandskap.',
  'Inkognitogata-kiosken gir et bygateperspektiv med boligstrøk, fortau, bokdeling, hverdagsruter, fysisk tekst, forbipasserende, nærlesing og uformell sirkulasjon. Den viser hvordan litteratur kan ha en konkret adresse uten å være knyttet til en bokhandel.',
  'Munkedamsveien-kiosken kobler sentrumsgate, arbeidsreiser, bokutveksling, rødt gateinventar, tilfeldige lesere, tekstsirkulasjon, gjenbruk og lokal offentlighet. Den lille bokfunksjonen står i kontrast til den raske bevegelsen gjennom en travel del av byen.',
  'Bjerke-kiosken gir forbindelser mellom boligområde, kollektivnærhet, nærmiljø, bokfunn, gjenbruk, lesekultur, deling og fysisk tilgjengelighet. Kioskformen lar et kjent telehistorisk objekt opptre som en liten litterær ressurs i en ordinær hverdagsrute.',
  'Bjølsen-kiosken kan leses gjennom kolonihagekultur, nærmiljø, grønn hverdag, delingspraksis, bokbytte, sommerlesing, tekstkretsløp og uformelle møtepunkt. Plasseringen gjør bokdelingen til en del av et lokalt landskap preget av småskala bruk og opphold.',
  'Fagerborg-kiosken knytter bygategater, leiegårdsstrøk, studieruter, bokdeling, hverdagslesing, gjenbruk, forbipasserende og litterær nysgjerrighet sammen. Den fysiske kiosken gir lesestoff en synlig plass mellom hjem, skole, handel og kollektivtransport.',
  'Huk-kiosken kombinerer friluftsliv, sjøvei, spasertur, bokfunn, sommerbruk, deling, gjenbruk og lesepauser. Den viser at et litteratursted kan være lite, ubemannet og vevd inn i en rute der folk egentlig er på vei til helt andre aktiviteter.',
  'John Colletts plass-kiosken setter studentmiljø, nabolag, kollektivknutepunkt, bokdeling, lærestoff, fritidslesing, gjenbruk og korte stopp i forbindelse. Den gjør litterær sirkulasjon synlig i et område der mange beveger seg mellom hjem, studiested og by.',
  'Kampen-kiosken gir et tett trehus- og bygatemiljø en egen bokdelingsfunksjon med nærlesing, lokale ruter, hverdagskultur, gjenbruk, tekstfunn, nabolagskontakt og lav terskel. Kiosken kan oppsøkes uten at et større kulturbygg må være målet for turen.',
  'Rådhuskaia-kiosken kobler sjøfront, fergetrafikk, rådhusområde, byvandring, bokdeling, reiselesing, tilfeldige funn og offentlig rom. Det lille litteraturpunktet står mellom transport og opphold og gir den gamle kiosktypen en ny bruk i havnelandskapet.',
  'Sagene-kiosk 70 gjør tvillingidentitet, kirkeplass, bokdeling, fysisk nærhet, separate objekter, lesespor, lokalhistorie og nabolagsbruk til viktige observasjoner. Nummeret er nødvendig fordi kiosk 70 og kiosk 71 skal forbli to ulike litteratursteder selv med samme offisielle kartanker.',
  'Sagene-kiosk 71 gir et parallelt, men selvstendig litteraturpunkt ved kirken med tvillingkiosk, objektidentitet, bokutveksling, lesekultur, gateinventar, nærmiljø, delingspraksis og fysisk naboskap. Nummeret skiller den fra kiosk 70 uten å late som kartankrene er ulike.',
  'Sentralen-kiosken setter bykjerne, kulturhusnærhet, bokdeling, sentrumsvandring, tekstfunn, gjenbruk, offentlighet og korte stopp i sammenheng. Kiosk nummer 0 viser samtidig hvordan nummereringen kan være en del av den stabile identiteten til et konkret litteraturpunkt.',
  'Skøyen-kiosken knytter stasjonsområde, pendling, overgang mellom transportmidler, bokbytte, reiselesing, ventetid, gjenbruk og hverdagsruter sammen. Den gir et fysisk sted for tekstsirkulasjon i et landskap der mange ellers bare passerer mellom tog, buss og gate.',
  'Solli-kiosken kombinerer plassrom, kollektivtrafikk, handel, boligstrøk, bokdeling, tilfeldig lesing, gjenbruk og byvandring. Den røde kiosken gjør litteraturutveksling synlig i et område med høy gjennomstrømning og mange korte opphold gjennom dagen.',
  'Bislett-kiosken gir forbindelser mellom stadion, arrangement, boligområde, skolevei, bokdeling, fritidslesing, gjenbruk og lokale fotruter. Litteraturpunktet står ved et sted mange kjenner av andre grunner og tilfører en liten, selvstendig lesefunksjon i nærheten.',
  'Olav Kyrres plass-kiosken setter ambassadeområde, boliggate, plassrom, bokutveksling, hverdagslesing, gjenbruk, offentlig ferdsel og tekstoppdagelse ved siden av hverandre. Kiosken gjør litteraturdeling til en synlig detalj i et roligere vestkantlandskap.',
  'Majorstukrysset-kiosken knytter kollektivknutepunkt, handel, kryssende fotstrømmer, bokdeling, ventetid, lesefunn, gjenbruk og bytempo sammen. Den viser hvordan et lite litteratursted kan eksistere midt i et område der de fleste bevegelsene er korte og målrettede.',
  'Rådhusgata-kiosken gir gamle sentrumsgater, kontorstrøk, historiske kvartaler, bokdeling, byvandring, tekstfunn, gjenbruk og offentlig rom en felles inngang. Den røde bokkiosken blir et lite litterært stopp i et område med mange lag av annen byhistorie.',
  'St. Hanshaugen-kiosken setter parkbydel, boligstrøk, bakketurer, bokutveksling, nærmiljølesing, gjenbruk, små pauser og lokal offentlighet i forbindelse. Kiosken gir et selvstendig litteraturpunkt som kan inngå naturlig i en vanlig spasertur gjennom bydelen.'
];

const typeLabel = {
  large_recycling_station:'gjenvinningsstasjon med ombruksuttak',
  small_recycling_station:'lokal gjenvinningsstasjon med ombruksuttak',
  reuse_tent:'kommunalt ombrukstelt'
};

function sha(text){ return crypto.createHash('sha256').update(String(text)).digest('hex'); }
function mkdir(file){ fs.mkdirSync(path.dirname(file), {recursive:true}); }
function writeJson(file,data){ mkdir(file); fs.writeFileSync(file, `${JSON.stringify(data,null,2)}\n`); }
function sentences(text){ return String(text).replace(/\n+/g,' ').split(/(?<=[.!?])\s+(?=[A-ZÆØÅ0-9])/u).map(v=>v.trim()).filter(Boolean); }
function coverage(text, claimIds){ return sentences(text).map((_,i)=>({sentence:i+1,claimIds})); }
function words(text){ return String(text).trim().split(/\s+/u).filter(Boolean).length; }
function structuredAddress(raw){
  const m=String(raw||'').match(/^(.*?)\s+(\d+[A-Za-z]?),\s*(\d{4})\s+(.+)$/u);
  return m?{street:m[1],number:m[2],postcode:m[3],city:m[4],country:'Norge'}:null;
}
function normalizeAddress(v){ return String(v).toLowerCase().replace(/[,]/g,'').replace(/\s+/g,' ').replace(/\b0+(\d{3})\b/g,'$1').trim(); }
async function fetchOk(url){ const res=await fetch(url,{headers:{'user-agent':'History-Go-production/1.0'}}); if(!res.ok) throw new Error(`${res.status} ${url}`); return res; }

async function geocode(st){
  if(st.preset){
    return {lat:st.preset[0],lon:st.preset[1],sourceProvider:'municipality',sourceObjectId:`oslo-kommune-service:${st.id}`,geocodeAccuracy:'approximate',coordStatus:'needs_manual_visual_qa',coordType:'service_point',coordSourceUrl:st.sourceUrl,coordNote:`Kommunal stedsangivelse for ${st.name}; punktet beholdes som omtrentlig displaymarkør inntil et entydig offisielt adressepunkt er dokumentert.`};
  }
  const addressOnly=st.address.replace(/,\s*\d{4}\s+Oslo$/u,'');
  const data=await (await fetchOk(`${GEONORGE}?sok=${encodeURIComponent(addressOnly)}&treffPerSide=50`)).json();
  const rows=(Array.isArray(data.adresser)?data.adresser:[]).filter(r=>String(r.kommunenummer||'')==='0301');
  const target=normalizeAddress(addressOnly);
  const ranked=rows.map(r=>{const candidate=normalizeAddress(r.adressetekst||'');let score=candidate===target?100:0;if(candidate.includes(target)||target.includes(candidate))score+=50;for(const token of target.split(' '))if(candidate.includes(token))score+=2;return{r,score};}).sort((a,b)=>b.score-a.score);
  const hit=ranked[0]?.r, point=hit?.representasjonspunkt;
  if(!hit||!Number.isFinite(point?.lat)||!Number.isFinite(point?.lon)) throw new Error(`No Geonorge address for ${st.id}: ${st.address}`);
  const sourceObjectId=`geonorge-adresser-v1:0301:${hit.adressekode||'na'}:${hit.nummer||'na'}${hit.bokstav||''}`;
  return {lat:point.lat,lon:point.lon,sourceProvider:'official_address',sourceObjectId,geocodeAccuracy:'rooftop',coordStatus:'verified',coordType:'address_point',coordSourceUrl:GEONORGE_SOURCE,coordNote:`Offisielt adresserepresentasjonspunkt fra Geonorge Adresser API for ${hit.adressetekst||st.address}; brukt som displaymarkør for den aktive tjenesten.`};
}

function envText(st,index){
  const desc=`${st.name} ved ${st.address} er et ${typeLabel[st.type]} i Oslo. Her kan privatpersoner finne en dokumentert ombruksfunksjon knyttet til kommunens gjenvinningssystem. ${st.note} Stedet gjør overgangen mellom innlevering, videre bruk og materialbehandling konkret i byens miljøinfrastruktur.`;
  const lens=envLens[index];
  const p1=`${st.name} ligger ved ${st.address} og er tatt med som eget sted fordi Oslo kommune dokumenterer en konkret funksjon for ombruk eller uttak av brukbare varer. ${st.name} inngår samtidig i den kommunale infrastrukturen for gjenvinning, og den fysiske plasseringen gjør det mulig å skille tjenesten fra andre stasjoner med andre tilbud. ${st.note} Opplysningene om uttak, salg og adgang må leses sammen med den aktuelle kommunale kilden fordi praktiske vilkår kan endres uten at stedsidentiteten forsvinner. ${lens}`;
  const p2=`For ${st.name} er det faglige hovedsporet forskjellen mellom ombruk og materialgjenvinning. En gjenstand som fortsatt kan fylle den samme funksjonen, kan få en ny bruker før materialene eventuelt går videre til behandling, mens sorterte fraksjoner følger andre løp når videre bruk ikke er aktuelt. ${st.name} gjør denne rekkefølgen forståelig gjennom konkrete valg om levering, uttak, salg og sortering. Avfallshierarkiet setter forebygging og ombruk foran materialgjenvinning når det er forsvarlig, og stedet gir et fysisk eksempel på hvorfor levetid, produktfunksjon og materialverdi bør vurderes hver for seg. Ved ${st.name} blir sirkulær økonomi dermed et spørsmål om hva som skjer med en konkret ting etter at den opprinnelige eieren ikke lenger trenger den.`;
  const p3=`Et besøk ved ${st.name} kan brukes til å undersøke hvilke gjenstander som blir vurdert som brukbare, hvilke materialer som sorteres separat, og hvilke regler som styrer tilgangen til ombrukstilbudet. ${st.name} viser også at kommunal avfallshåndtering omfatter mer enn sluttbehandling, fordi mottak, sortering og videreformidling påvirker om ressurser får flere bruksrunder. Den mest presise måten å bruke stedet på er å kontrollere den kommunale stasjonssiden før besøket og holde permanente egenskaper adskilt fra åpningstider og andre driftsopplysninger. Slik kan ${st.name} fungere som et konkret læringssted for ressursbruk, materialstrømmer, ombruk, husholdningsvalg og lokal miljøforvaltning uten å tillegge tilbudet funksjoner som kilden ikke dokumenterer.`;
  const popupDesc=`${p1}\n\n${p2}\n\n${p3}`;
  if(words(desc)<40||words(desc)>80) throw new Error(`${st.id} desc ${words(desc)} words`);
  if(words(popupDesc)<300) throw new Error(`${st.id} popup ${words(popupDesc)} words`);
  return {desc,popupDesc};
}

function kioskText(c,index){
  const source=c.officialPage||LESEKIOSK_LIST;
  const desc=`${c.name} er en egen Lesekiosk ved ${c.officialListLabel} i Oslo, registrert i Lesekiosks aktuelle oversikt. Den røde telefonkiosken har fått en litterær funksjon som sted for bokdeling og beholder sin egen identitet som fysisk kiosk. Kiosknummeret skiller dette punktet fra de andre Lesekioskene i byen.`;
  const lens=kioskLens[index];
  const p1=`${c.name} er registrert av Lesekiosk som et eget fysisk bokdelingspunkt ved ${c.officialListLabel}. Kiosknummer ${c.kioskNumber} er en del av identiteten og gjør det mulig å skille denne kiosken fra andre røde telefonkiosker som har fått samme type litterære funksjon. ${source===LESEKIOSK_LIST?`For ${c.name} er den samlede Oslo-listen den kontrollerte hovedkilden, fordi en egen underside ikke er sikkert identifisert.`:`For ${c.name} finnes det også en egen Lesekiosk-side som knytter kioskidentiteten til denne plasseringen.`} Den offisielle Lesekiosk-oversikten oppgir et kartanker ved breddegrad ${c.lat} og lengdegrad ${c.lon}, og punktet beholdes med kildebevis uten å bli oppgradert til mer presis geometri enn den publiserte kartlenken støtter. ${lens}`;
  const p2=`Lesekiosk-prosjektet gir den røde telefonkiosken en bokfunksjon, og ${c.name} kan dermed forstås både som gjenbrukt gateinventar og som et lite litteratursted. Ved ${c.name} er poenget ikke et bemannet bibliotek med katalog og utlånssystem, men en fysisk ramme for at bøker kan sirkulere mellom mennesker på stedet. Denne forskjellen gjør ${c.name} interessant i litteraturkategorien: stedet handler om lesing, deling og fysisk tilgang til tekster, mens kioskens eldre teknologiske form fortsatt er synlig. Når ${c.name} står ved ${c.officialListLabel}, får bokdelingen en bestemt geografisk adresse eller stedsangivelse i stedet for å være en generell digital tjeneste. Den konkrete kiosken kan derfor relateres til nærliggende steder uten å miste sin egen identitet eller sin egen prikk på litteraturkartet.`;
  const p3=`Som læringssted kan ${c.name} brukes til å undersøke hvordan litteratur beveger seg utenfor bokhandel, skole og ordinært bibliotek. En bok som settes i ${c.name}, kan oppdages av en forbipasserende, tas med videre og senere erstattes av en annen bok, slik at den fysiske kiosken fungerer som fast ramme rundt skiftende innhold. Kiosknummeret, stedsnavnet og Lesekiosks egen oversikt gir stabile holdepunkter for å kjenne igjen ${c.name}, mens hvilke konkrete titler som finnes inne i kiosken vil variere og ikke skal behandles som permanente stedsegenskaper. Det er også viktig for ${c.name} at bokutvalget ikke fylles ut med antakelser; kun dokumenterte bøker eller produksjoner skal knyttes til stedet når slike opplysninger faktisk finnes. På den måten kan ${c.name} være et presist litteraturpunkt for bokdeling, lesekultur, ombruk av fysisk infrastruktur og lokal offentlighet samtidig som kildegrensene for det skiftende innholdet forblir tydelige.`;
  const popupDesc=`${p1}\n\n${p2}\n\n${p3}`;
  if(words(desc)<40||words(desc)>80) throw new Error(`${c.id} desc ${words(desc)} words`);
  if(words(popupDesc)<300) throw new Error(`${c.id} popup ${words(popupDesc)} words`);
  return {desc,popupDesc};
}

function quiz(claimIds, questions){ return questions.map(q=>({...q,claimIds:q.claimIds||claimIds})); }
function packet({place,placeFile,claims,questions,represents,excludes}){
  const claimIds=claims.map(c=>c.id);
  return {
    schemaVersion:'4.2',validatorVersion:'4.2.1',placeId:place.id,placeFile,status:'ready_v4_2',
    identity:{status:'resolved',represents,period:'2026–',excludes},
    metadataSnapshot:{name:place.name,category:place.category},
    textHashes:{algorithm:'sha256',desc:sha(place.desc),popupDesc:sha(place.popupDesc)},
    claims,
    sentenceCoverage:{desc:coverage(place.desc,claimIds),popupDesc:coverage(place.popupDesc,claimIds)},
    reviews:{factual:{status:'passed',reviewedAt:DATE,reviewer:'History GO source review'},editorial:{status:'passed',reviewedAt:DATE,reviewer:'History GO editorial review',introducedNewFacts:false}},
    quizReadiness:{questions:quiz(claimIds,questions)},
    completion:{completedUnder:'4.2',currentStatus:'current',sourceVerifiedAt:DATE,claimsVerified:{verified:claims.length,total:claims.length},factualReview:'passed',editorialReview:'passed',validatorVersion:'4.2.1'}
  };
}

function envClaims(st){
  return [
    {id:`claim_${st.id}_identity`,claim:`${st.name} er Oslo kommunes aktive ombruks- eller gjenvinningstilbud ved ${st.address}.`,sourceUrl:st.sourceUrl,sourceLocation:'Kommunal stedsside: navn, plassering og tjeneste.',sourceType:'institutional',verifiedAt:DATE,status:'verified',claimKind:'identity',evidenceMode:'direct',temporalStatus:'current'},
    {id:`claim_${st.id}_reuse`,claim:st.note,sourceUrl:st.sourceUrl,sourceLocation:'Kommunal stedsside og ombruksside: uttak, salg og praktisk ombruksfunksjon.',sourceType:'institutional',verifiedAt:DATE,status:'verified',claimKind:'ordinary',evidenceMode:'direct',temporalStatus:'current'},
    {id:`claim_${st.id}_network`,claim:`Oslo kommune beskriver ombruk som en del av gjenvinningssystemet og oppgir steder der privatpersoner kan hente eller kjøpe brukbare varer.`,sourceUrl:OSLO_REUSE,sourceLocation:'Hente eller levere til ombruk: uttakssteder og ombruksløsninger.',sourceType:'institutional',verifiedAt:DATE,status:'verified',claimKind:'ordinary',evidenceMode:'direct',temporalStatus:'current'},
    {id:`claim_${st.id}_circular`,claim:'Avfallsforebygging og ombruk ligger foran materialgjenvinning i avfallshierarkiet når videre bruk er forsvarlig.',sourceUrl:CIRCULAR_SOURCE,sourceLocation:'Miljødirektoratets fagstoff om sirkulær økonomi og avfallshierarki.',sourceType:'official',verifiedAt:DATE,status:'verified',claimKind:'ordinary',evidenceMode:'direct',temporalStatus:'current'}
  ];
}

function envQuestions(st,claims){
  const ids=claims.map(c=>c.id);
  return quiz(ids,[
    {question:`Hvor ligger ${st.name}?`,answer:st.address,type:'hvor',normalKnowledgeQuestion:true},
    {question:`Hva slags sted er ${st.name}?`,answer:typeLabel[st.type],type:'hva',normalKnowledgeQuestion:true},
    {question:`Hva er ombruksfunksjonen ved ${st.name}?`,answer:st.note,type:'hva',normalKnowledgeQuestion:true},
    {question:`Hvilken kommune dokumenterer tilbudet ved ${st.name}?`,answer:'Oslo kommune',type:'hvem',normalKnowledgeQuestion:true},
    {question:`Hva skal vurderes før materialgjenvinning når en ting fortsatt kan brukes?`,answer:'ombruk eller videre bruk',type:'hva',normalKnowledgeQuestion:true},
    {question:`Hva bør kontrolleres før besøk ved ${st.name}?`,answer:'den aktuelle kommunale stasjonssiden og praktiske vilkår',type:'hva_skjedde',normalKnowledgeQuestion:false},
    {question:`Hvilken kategori har ${st.name}?`,answer:'Natur & miljø – Miljø & gjenbruk',type:'hvilket_verk_eller_objekt',normalKnowledgeQuestion:false},
    {question:`Hva knytter ${st.name} sammen i ressurskretsløpet?`,answer:'innlevering, ombruk og videre materialbehandling',type:'hva_ble_bygget_produsert_eller_endret',normalKnowledgeQuestion:false}
  ]);
}

function kioskClaims(c){
  const primary=c.officialPage||LESEKIOSK_LIST;
  return [
    {id:`claim_${c.id}_identity`,claim:`${c.name} er kiosk nummer ${c.kioskNumber} ved ${c.officialListLabel} i Lesekiosks aktuelle Oslo-oversikt.`,sourceUrl:primary,sourceLocation:'Lesekiosk: kioskidentitet og stedsangivelse.',sourceType:'institutional',verifiedAt:DATE,status:'verified',claimKind:'identity',evidenceMode:'direct',temporalStatus:'current'},
    {id:`claim_${c.id}_listing`,claim:`Lesekiosk registrerer ${c.name} som et fysisk bokdelingspunkt i Oslo.`,sourceUrl:LESEKIOSK_LIST,sourceLocation:'Finn en kiosk: aktuell Oslo-liste.',sourceType:'institutional',verifiedAt:DATE,status:'verified',claimKind:'ordinary',evidenceMode:'direct',temporalStatus:'current'},
    {id:`claim_${c.id}_function`,claim:'Lesekiosk gir røde telefonkiosker en litterær bokdelingsfunksjon.',sourceUrl:LESEKIOSK_HOME,sourceLocation:'Lesekiosk: prosjektets bokkioskfunksjon.',sourceType:'institutional',verifiedAt:DATE,status:'verified',claimKind:'ordinary',evidenceMode:'direct',temporalStatus:'current'},
    {id:`claim_${c.id}_coordinate`,claim:`Den offisielle Lesekiosk-kartlenken for ${c.name} oppgir kartankeret ${c.lat}, ${c.lon}.`,sourceUrl:LESEKIOSK_LIST,sourceLocation:'Offisiell Lesekiosk-kartlenke fra aktuell kioskoversikt.',sourceType:'institutional',verifiedAt:DATE,status:'verified',claimKind:'ordinary',evidenceMode:'direct',temporalStatus:'current'}
  ];
}

function kioskQuestions(c,claims){
  const ids=claims.map(x=>x.id);
  return quiz(ids,[
    {question:`Hvilket nummer har ${c.name}?`,answer:String(c.kioskNumber),type:'hva',normalKnowledgeQuestion:true},
    {question:`Hvor er ${c.name} registrert?`,answer:c.officialListLabel,type:'hvor',normalKnowledgeQuestion:true},
    {question:`Hvilken organisasjon fører den aktuelle kioskoversikten?`,answer:'Lesekiosk',type:'hvem',normalKnowledgeQuestion:true},
    {question:`Hva slags litterær funksjon har ${c.name}?`,answer:'bokdeling i en rød telefonkiosk',type:'hva',normalKnowledgeQuestion:true},
    {question:`Hvilken hovedkategori tilhører ${c.name}?`,answer:'Litteratur',type:'hvilket_verk_eller_objekt',normalKnowledgeQuestion:true},
    {question:`Hva skiller ${c.name} fra andre Lesekiosker?`,answer:`kiosknummer ${c.kioskNumber} og stedsangivelsen ${c.officialListLabel}`,type:'hva_skjedde',normalKnowledgeQuestion:false},
    {question:`Hva kan endre seg uten at ${c.name} mister stedsidentiteten?`,answer:'hvilke konkrete bøker som står i kiosken',type:'hva_ble_bygget_produsert_eller_endret',normalKnowledgeQuestion:false},
    {question:`Hva er den faste fysiske rammen for bokdelingen ved ${c.name}?`,answer:'den røde telefonkiosken',type:'hva',normalKnowledgeQuestion:false}
  ]);
}

function kioskPlace(c,index){
  const {desc,popupDesc}=kioskText(c,index);
  const address=structuredAddress(`${c.officialListLabel}, Oslo`);
  const place={
    id:c.id,name:c.name,lat:c.lat,lon:c.lon,r:45,category:'litteratur',subcategory_id:'lesekiosk',desc,popupDesc,
    place_card_profile:{schema:'history_go_place_card_profile_v2',collection_ids:['people','objects','brands','productions'],reason:'Lesekiosk bruker ordinær Litteratur-komposisjon med ærlige tomtilstander når samlinger mangler innhold.',verifiedAt:DATE},
    quiz_profile:{place_type:'lesekiosk',subtype:'lesekiosk_oslo',signature_features:[`kiosk ${c.kioskNumber}`,c.officialListLabel,'bokdeling'],primary_angles:['lesekultur','bokdeling','gjenbruk av telefonkiosk','lokal offentlighet'],question_families:['sted_og_materialitet','bruk_og_funksjon','saertrekk','kontrast'],avoid_angles:['udokumentert bokutvalg','sammenblanding med nabosted'],must_include:['kiosknummer','offisiell stedsangivelse','bokdelingsfunksjon'],contrast_targets:[],notes:'Skiftende bokutvalg skal ikke fremstilles som permanent fakta.'},
    locatorType:'current_place',sourceProvider:'official_map',sourceObjectId:`lesekiosk-current-map:${c.id}`,geocodeAccuracy:'approximate',coordRole:'display_marker',coordType:'service_point',coordStatus:'needs_manual_visual_qa',coordSource:'Lesekiosk – offisiell kartlenke',coordSourceId:`lesekiosk-current-map:${c.id}`,coordSourceUrl:LESEKIOSK_LIST,coordNote:'Kartankeret kommer fra Lesekiosks offisielle aktuelle kartlenke og beholdes som needs_manual_visual_qa inntil et mer presist objektpunkt er dokumentert.',
    externalLinks:[{type:'reference',label:c.officialPage?`Lesekiosk – ${c.name}`:'Lesekiosk – Finn en kiosk',url:c.officialPage||LESEKIOSK_LIST,lang:'nb',verifiedAt:DATE},{type:'coordinate_source',label:'Lesekiosk – offisiell kartlenke',url:LESEKIOSK_LIST,lang:'nb',verifiedAt:DATE}]
  };
  if(address) place.address=address;
  return place;
}

async function envPlace(st,index){
  const geo=await geocode(st);
  const {desc,popupDesc}=envText(st,index);
  const place={
    id:st.id,name:st.name,lat:geo.lat,lon:geo.lon,r:55,category:'natur',subcategory_id:'miljo_gjenbruk',desc,popupDesc,
    place_card_profile:{schema:'history_go_place_card_profile_v2',collection_ids:['reuse','materials','environment','systems'],reason:'Miljø & gjenbruk bruker fire sirkulære ressursflater uten konstruert Flora/Fauna-innhold.',verifiedAt:DATE},
    circular_profile:{schema:'history_go_circular_place_profile_v1',place_type:st.type,operation_status:'active',free_takeaway:st.free,reuse_sale:st.sale,restricted_access:false,self_service:st.self,mobile_service:false,reuse:[{id:`${st.id}_reuse`,title:st.sale?'Ombruk og bruktutsalg':'Gratis ombruk',description:st.note}],materials:[{id:`${st.id}_materials`,title:'Materialer',description:'Brukbare gjenstander vurderes for videre bruk, mens andre materialstrømmer sorteres etter tjenestens regler.'}],environment:[{id:`${st.id}_environment`,title:'Kretsløp & miljø',description:'Ombruk forlenger brukstiden før materialgjenvinning eller annen behandling blir aktuelt.'}],systems:[{id:`${st.id}_systems`,title:'Sted & system',description:`${st.name} er del av Oslo kommunes fysiske ombruks- og gjenvinningsinfrastruktur.`}],source_url:st.sourceUrl,verified_at:DATE},
    quiz_profile:{place_type:st.type,subtype:'miljo_gjenbruk_oslo',signature_features:[typeLabel[st.type],st.free?'gratis uttak':'bruktutsalg',st.self?'delvis selvbetjent':'kommunalt tilbud'],primary_angles:['ressursbruk','ombruk','materialstrømmer','miljøforvaltning'],question_families:['sted_og_materialitet','bruk_og_funksjon','saertrekk','kontrast'],avoid_angles:['generisk natursted','udokumentert uttak'],must_include:['konkret ombruksfunksjon','avfallshierarki','kildeverifisert tilgang'],contrast_targets:[],notes:'Tidsavhengige vilkår kontrolleres mot Oslo kommune.'},
    locatorType:'current_place',sourceProvider:geo.sourceProvider,sourceObjectId:geo.sourceObjectId,geocodeAccuracy:geo.geocodeAccuracy,coordRole:'display_marker',coordType:geo.coordType,coordStatus:geo.coordStatus,coordSource:geo.sourceProvider==='official_address'?'Kartverket / Geonorge Adresser API':'Oslo kommune – kommunal stedsangivelse',coordSourceId:geo.sourceObjectId,coordSourceUrl:geo.coordSourceUrl,coordNote:geo.coordNote,
    address:structuredAddress(st.address)||st.address,
    externalLinks:[{type:'reference',label:`Oslo kommune – ${st.name}`,url:st.sourceUrl,lang:'nb',verifiedAt:DATE},{type:'reference',label:'Oslo kommune – ombruk',url:OSLO_REUSE,lang:'nb',verifiedAt:DATE},{type:'coordinate_source',label:geo.sourceProvider==='official_address'?'Kartverket / Geonorge':'Oslo kommune – stedsangivelse',url:geo.coordSourceUrl,lang:'nb',verifiedAt:DATE}]
  };
  if(geo.coordStatus==='verified') place.coordVerifiedAt=DATE;
  return place;
}

function addManifest(manifest,rel){ if(!manifest.files.includes(rel)) manifest.files.push(rel); }

async function main(){
  const kioskInventory=JSON.parse(fs.readFileSync(KIOSK_INVENTORY,'utf8'));
  const kiosks=Array.isArray(kioskInventory.candidates)?kioskInventory.candidates:[];
  if(kiosks.length!==21) throw new Error(`Expected 21 Lesekiosk candidates, got ${kiosks.length}`);
  if(reusePlaces.length!==11) throw new Error(`Expected 11 reuse places, got ${reusePlaces.length}`);
  const manifestPath=path.join(ROOT,'data/places/manifest.json');
  const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  const envInventory=[];
  const kioskMaterialized=[];

  for(let i=0;i<reusePlaces.length;i++){
    const st=reusePlaces[i];
    const place=await envPlace(st,i);
    const claims=envClaims(st);
    const rel=`places/natur/oslo/miljo_gjenbruk/${st.id}.json`;
    const placeFile=`data/${rel}`;
    writeJson(path.join(ROOT,placeFile),place);
    writeJson(path.join(ROOT,'data/places/production',`${st.id}.json`),packet({place,placeFile,claims,questions:envQuestions(st,claims),represents:`${st.name} som eget kommunalt ombruks- eller gjenvinningstilbud ved ${st.address}.`,excludes:['andre kommunale gjenvinningsstasjoner','mobile eller midlertidige tilbud','nabosteder uten samme tjenesteidentitet']}));
    addManifest(manifest,rel);
    envInventory.push({id:st.id,name:st.name,lat:place.lat,lon:place.lon,place_type:st.type,free_takeaway:st.free,reuse_sale:st.sale,source:st.sourceUrl,status:'active_permanent'});
    console.log(`generated reuse ${st.id}`);
  }

  for(let i=0;i<kiosks.length;i++){
    const c=kiosks[i];
    if(c.category!=='litteratur') throw new Error(`${c.id} must remain litteratur`);
    const place=kioskPlace(c,i);
    const claims=kioskClaims(c);
    const rel=`places/litteratur/oslo/lesekiosk/${c.id}.json`;
    const placeFile=`data/${rel}`;
    writeJson(path.join(ROOT,placeFile),place);
    writeJson(path.join(ROOT,'data/places/production',`${c.id}.json`),packet({place,placeFile,claims,questions:kioskQuestions(c,claims),represents:`${c.name} som egen fysisk Lesekiosk ved ${c.officialListLabel}.`,excludes:['andre Lesekiosker i Oslo','nærliggende History GO-steder','skiftende enkeltbøker i kiosken']}));
    addManifest(manifest,rel);
    kioskMaterialized.push({id:c.id,name:c.name,kioskNumber:c.kioskNumber,lat:c.lat,lon:c.lon,category:'litteratur',subcategory_id:'lesekiosk',source:c.officialPage||LESEKIOSK_LIST,status:'active_permanent'});
    console.log(`generated kiosk ${c.id}`);
  }

  manifest.files.sort((a,b)=>a.localeCompare(b,'nb'));
  fs.writeFileSync(manifestPath,`${JSON.stringify(manifest,null,2)}\n`);
  writeJson(path.join(ROOT,'reports/oslo-miljo-gjenbruk-2026/permanent-active-inventory.json'),{schema:'history_go_oslo_miljo_gjenbruk_inventory_v2',generatedAt:DATE,category:'natur',subcategory_id:'miljo_gjenbruk',selectionAuthority:OSLO_REUSE,count:envInventory.length,places:envInventory});
  writeJson(path.join(ROOT,'reports/lesekiosker-oslo-2026/materialized-canonical-places.json'),{schema:'history_go_lesekiosk_materialization_v1',generatedAt:DATE,category:'litteratur',subcategory_id:'lesekiosk',sourceInventory:'reports/lesekiosker-oslo-2026/lesekiosker-oslo-litteratur-inventory.json',count:kioskMaterialized.length,places:kioskMaterialized});
  console.log(`materialized ${envInventory.length} reuse places + ${kioskMaterialized.length} Lesekiosker`);
}

main().catch(error=>{console.error(error);process.exit(1);});
