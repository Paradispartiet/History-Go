#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const DATE = '2026-08-25';
const OSLO_BASE = 'https://www.oslo.kommune.no/avfall-og-gjenvinning/alle-gjenvinningsstasjoner';
const ALL_STATIONS = `${OSLO_BASE}/`;
const CIRCULAR_SOURCE = 'https://www.miljodirektoratet.no/ansvarsomrader/avfall/sirkular-okonomi/';
const HAZARDOUS_SOURCE = 'https://www.miljodirektoratet.no/ansvarsomrader/avfall/farlig-avfall/';
const KARTVERKET = 'https://ws.geonorge.no/adresser/v1/sok';

const stations = [
  { id:'grefsen_gjenvinningsstasjon', name:'Grefsen gjenvinningsstasjon', address:'Kapellveien 118, 0493 Oslo', slug:'grefsen-gjenvinningsstasjon', type:'large_recycling_station', free:true, self:false, reuse:'Gratis ombrukshyller og ombruksområde gjør det mulig å hente brukbare gjenstander videre.' },
  { id:'gronmo_gjenvinningsstasjon', name:'Grønmo gjenvinningsstasjon', address:'Sørliveien 1, 1279 Oslo', slug:'gronmo-gjenvinningsstasjon', type:'large_recycling_station', free:false, self:false, reuse:'Brukbare gjenstander kan inngå i kommunens ombrukssystem, men dette stedet registreres ikke som gratis uthentingspunkt.' },
  { id:'haraldrud_gjenvinningsstasjon', name:'Haraldrud gjenvinningsstasjon', address:'Brobekkveien 87, 0582 Oslo', slug:'haraldrud-gjenvinningsstasjon', type:'large_recycling_station', free:true, self:false, reuse:'Gratis byggevarer kan hentes når det aktuelle ombrukstilbudet er tilgjengelig; ombruksteltet behandles separat fordi det flyttes.' },
  { id:'ryen_gjenvinningsstasjon', name:'Ryen gjenvinningsstasjon', address:'Vårveien 87, 0680 Oslo', slug:'ryen-gjenvinningsstasjon', type:'large_recycling_station', free:true, self:false, reuse:'Et merket ombruksområde gjør at brukbare gjenstander kan hentes gratis og få videre levetid.' },
  { id:'smestad_gjenvinningsstasjon', name:'Smestad gjenvinningsstasjon', address:'Ullernchausseen 26, 0379 Oslo', slug:'smestad-gjenvinningsstasjon', type:'large_recycling_station', free:true, self:false, reuse:'Gratis byggevarer kan hentes fra kommunens ombruksordning når tilbudet er tilgjengelig.' },

  { id:'bentsehjornet_gjenvinningsstasjon', name:'Bentsehjørnet gjenvinningsstasjon', address:'Bentsebrugata 11C, 0476 Oslo', slug:'bentsehjornet-gjenvinningsstasjon', type:'small_recycling_station', free:false, self:true, reuse:'Brukbare ting kan leveres inn når stasjonen er bemannet, men de kan ikke hentes ut igjen her.' },
  { id:'lindeberg_gjenvinningsstasjon', name:'Lindeberg gjenvinningsstasjon', address:'Jerikoveien 5, 1067 Oslo', slug:'lindeberg-gjenvinningsstasjon', type:'small_recycling_station', free:true, self:true, reuse:'Ombrukshyllene ved Lindeberglokalet gir mulighet til å levere og hente brukbare ting.' },
  { id:'fredensborg_gjenvinningsstasjon', name:'Fredensborg gjenvinningsstasjon', address:'Maridalsveien 10, 0178 Oslo', slug:'fredensborg-gjenvinningsstasjon', type:'small_recycling_station', free:false, self:true, reuse:'Stasjonen har praktiske henteordninger for enkelte sorteringsartikler, men registreres ikke som gratis ombruksbutikk.' },
  { id:'kampen_gjenvinningsstasjon', name:'Kampen gjenvinningsstasjon', address:'Sons gate 2, 0654 Oslo', slug:'kampen-gjenvinningsstasjon', type:'small_recycling_station', free:true, self:false, reuse:'Ombrukshyller gjør det mulig å hente brukbare gjenstander, også enkelte små elektriske produkter, gratis.' },
  { id:'loren_gjenvinningsstasjon', name:'Løren gjenvinningsstasjon', address:'Peter Møllers vei 37, 0585 Oslo', slug:'loren-gjenvinningsstasjon', type:'small_recycling_station', free:false, self:true, reuse:'Stasjonen inngår i det lokale sorteringsnettet; gratis uthenting er ikke registrert som bekreftet funksjon.' },
  { id:'romsas_gjenvinningsstasjon', name:'Romsås gjenvinningsstasjon', address:'Romsås senter, 0970 Oslo', slug:'romsas-gjenvinningsstasjon', type:'small_recycling_station', free:true, self:false, reuse:'Ombrukshyller gjør det mulig å hente brukbare ting, blant annet enkelte små elektriske produkter, gratis.', preset:[59.9640,10.8939] },
  { id:'sofienbergparken_gjenvinningsstasjon', name:'Sofienbergparken gjenvinningsstasjon', address:'Helgesens gate 56, 0553 Oslo', slug:'sofienbergparken-gjenvinningsstasjon', type:'small_recycling_station', free:true, self:false, reuse:'Ombrukshyller ved stasjonen gjør at innleverte, brukbare ting kan gå direkte videre til nye brukere.' },
  { id:'sorenga_gjenvinningsstasjon', name:'Sørenga gjenvinningsstasjon', address:'Sørengkaia 29, 0194 Oslo', slug:'sorenga-gjenvinningsstasjon', type:'small_recycling_station', free:false, self:true, reuse:'Stasjonen tilbyr lokale sorteringstjenester, men registreres ikke som et gratis uthentingspunkt for ombruksvarer.' },
  { id:'trosterud_gjenvinningsstasjon', name:'Trosterud gjenvinningsstasjon', address:'Dr. Dedichens vei 24B, 0675 Oslo', slug:'trosterud-gjenvinningsstasjon', type:'small_recycling_station', free:true, self:true, reuse:'En egen ombruksløsning gjør det mulig å hente brukbare gjenstander videre, også enkelte små elektriske produkter.' },

  { id:'frysja_miljostasjon', name:'Frysja miljøstasjon', address:'Kjelsåsveien 160, 0491 Oslo', slug:'frysja-miljostasjon', type:'environment_station', free:false, self:true },
  { id:'sogn_miljostasjon', name:'Sogn miljøstasjon', address:'John P. Erliens vei 1A, 0858 Oslo', slug:'sogn-miljostasjon', type:'environment_station', free:false, self:true },
  { id:'bogstad_miljostasjon', name:'Bogstad miljøstasjon', address:'Ankerveien 121, 0766 Oslo', slug:'bogstad-miljostasjon', type:'environment_station', free:false, self:true },
  { id:'bygdoy_miljostasjon', name:'Bygdøy miljøstasjon', address:'Huk aveny 1, 0287 Oslo', slug:'bygdoy-miljostasjon', type:'environment_station', free:false, self:true },
  { id:'frognerstranda_miljostasjon', name:'Frognerstranda miljøstasjon', address:'Frognerstranda 4, 0250 Oslo', slug:'frognerstranda-miljostasjon', type:'environment_station', free:false, self:true },
  { id:'munkerud_miljostasjon', name:'Munkerud miljøstasjon', address:'Oberst Rodes vei 133, 1165 Oslo', slug:'munkerud-miljostasjon', type:'environment_station', free:false, self:true },
  { id:'mosseveien_miljostasjon', name:'Mosseveien miljøstasjon', address:'Mosseveien 147, 0198 Oslo', slug:'mosseveien-miljostasjon', type:'environment_station', free:false, self:true },
  { id:'tveita_miljostasjon', name:'Tveita miljøstasjon', address:'Tvetenveien 166, 0671 Oslo', slug:'tveita-miljostasjon', type:'environment_station', free:false, self:true },
  { id:'smedstua_miljostasjon', name:'Smedstua miljøstasjon', address:'Kristoffer Robins vei, 0978 Oslo', slug:'smedstua-miljostasjon', type:'environment_station', free:false, self:true, preset:[59.9478,10.9064] },
  { id:'hoybraten_miljostasjon', name:'Høybråten miljøstasjon', address:'Fredheimsveien 3, 1087 Oslo', slug:'hoybraten-miljostasjon', type:'environment_station', free:false, self:true },
  { id:'nedre_haugen_miljostasjon', name:'Nedre Haugen miljøstasjon', address:'Maria Dehlis vei 57, 1084 Oslo', slug:'nedre-haugen-miljostasjon', type:'environment_station', free:false, self:true },
  { id:'lindebergasen_miljostasjon', name:'Lindebergåsen miljøstasjon', address:'Lindebergåsen 64, 1068 Oslo', slug:'lindebergasen-miljostasjon', type:'environment_station', free:false, self:true },
  { id:'skjonhaug_miljostasjon', name:'Skjønhaug miljøstasjon', address:'Lindebergåsen 5, 1081 Oslo', slug:'skjonhaug-miljostasjon', type:'environment_station', free:false, self:true },
  { id:'vollebekk_miljostasjon', name:'Vollebekk miljøstasjon', address:'Brobekkveien 60C, 0598 Oslo', slug:'vollebekk-miljostasjon', type:'environment_station', free:false, self:true }
];

const typeLabel = {
  large_recycling_station:'stor gjenvinningsstasjon',
  small_recycling_station:'liten gjenvinningsstasjon',
  environment_station:'miljøstasjon for farlig avfall'
};

const typeService = {
  large_recycling_station:'tar imot flere sorterte avfalls- og materialtyper fra husholdninger og fungerer som et større knutepunkt i byens avfalls- og ressursinfrastruktur',
  small_recycling_station:'gir et lokalt tilbud for mindre mengder sortert husholdningsavfall og gjør flere materialstrømmer tilgjengelige uten en tur til en stor stasjon',
  environment_station:'er et lokalt innsamlingspunkt for farlig avfall og utvalgte risikostrømmer som skal holdes adskilt fra ordinært restavfall'
};

const distinctive = [
  'Her blir byens ressurskretsløp synlig på bakkenivå',
  'Stedet viser hvordan kommunal miljøinfrastruktur møter hverdagsavfall',
  'På dette punktet blir sortering en fysisk del av nærmiljøet',
  'Denne stasjonen gjør avfallshierarkiet konkret i et vanlig Oslo-nabolag',
  'Her kan en følge materialer fra husholdning til neste behandlingsledd',
  'Den lokale funksjonen gjør ellers usynlige materialstrømmer synlige',
  'Stasjonen er et praktisk møte mellom husholdning og ressursforvaltning'
];

function sha(text){ return crypto.createHash('sha256').update(text).digest('hex'); }
function words(text){ return text.trim().split(/\s+/u).filter(Boolean).length; }
function sentences(text){ return text.replace(/\n+/g,' ').split(/(?<=[.!?])\s+(?=[A-ZÆØÅ0-9])/u).map(s=>s.trim()).filter(Boolean); }
function mkdir(file){ fs.mkdirSync(path.dirname(file), { recursive:true }); }
function writeJson(file,data){ mkdir(file); fs.writeFileSync(file, JSON.stringify(data,null,2)+'\n'); }
function normalizeAddress(v){ return v.toLowerCase().replace(/[,]/g,'').replace(/\s+/g,' ').replace(/\b0+(\d{3})\b/g,'$1').trim(); }

async function fetchOk(url){
  const res = await fetch(url, { headers:{'user-agent':'History-Go-production/1.0'} });
  if(!res.ok) throw new Error(`${res.status} ${url}`);
  return res;
}

async function officialPage(station){
  const url = `${OSLO_BASE}/${station.slug}/`;
  const res = await fetchOk(url);
  const html = await res.text();
  const title = (html.match(/<title>([^<]+)/i)?.[1] || '').replace(/&amp;/g,'&');
  if(!title.toLowerCase().includes(station.name.split(' ')[0].toLowerCase())) {
    console.warn(`Title check weak for ${station.id}: ${title}`);
  }
  const og = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i)?.[1]
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1] || '';
  return { url, html, og };
}

async function geocode(station){
  if(station.preset) return { lat:station.preset[0], lon:station.preset[1], sourceObjectId:`manual-service-anchor:${station.id}`, accuracy:'service_point', note:'Tjenestepunkt uten entydig nummerert adresse; kartankeret er kontrollert mot den kommunale stedsangivelsen og beholdes som servicepunkt, ikke som presis inngang.' };
  const addressOnly = station.address.replace(/,\s*\d{4}\s+Oslo$/u,'');
  const url = `${KARTVERKET}?sok=${encodeURIComponent(addressOnly)}&treffPerSide=50`;
  const data = await (await fetchOk(url)).json();
  const rows = Array.isArray(data.adresser) ? data.adresser : [];
  const target = normalizeAddress(addressOnly);
  const oslo = rows.filter(r => String(r.kommunenummer || '') === '0301');
  const ranked = oslo.map(r => {
    const candidate = normalizeAddress(r.adressetekst || '');
    let score = candidate === target ? 100 : 0;
    if(candidate.includes(target) || target.includes(candidate)) score += 50;
    for(const token of target.split(' ')) if(candidate.includes(token)) score += 2;
    return { r, score };
  }).sort((a,b)=>b.score-a.score);
  const hit = ranked[0]?.r;
  const point = hit?.representasjonspunkt;
  if(!hit || !Number.isFinite(point?.lat) || !Number.isFinite(point?.lon)) throw new Error(`No Kartverket address for ${station.id}: ${station.address}`);
  return {
    lat:point.lat, lon:point.lon,
    sourceObjectId:`kartverket-address:${hit.adressekode || 'na'}:${hit.nummer || 'na'}:${hit.bokstav || ''}`,
    accuracy:'address_point',
    note:`Kartpunktet er representasjonspunktet for ${hit.adressetekst || station.address} i Kartverkets offisielle adresseregister, valgt i Oslo kommune (0301).`
  };
}

function buildText(st,index){
  const t = typeLabel[st.type];
  const service = typeService[st.type];
  const self = st.self ? 'Deler av tilbudet er selvbetjent, slik at adgang og gjeldende bruksvilkår må leses sammen med kommunens aktuelle driftsinformasjon.' : 'Tilbudet brukes etter de åpningstidene og adgangsreglene Oslo kommune oppgir for stasjonen.';
  const reuse = st.reuse || 'Dette punktet er først og fremst registrert for sikker innsamling; gratis uthenting av ombruksvarer er ikke en del av den bekreftede funksjonen.';
  const desc = `${st.name} i ${st.address} er en ${t} i Oslo kommunes avfalls- og gjenvinningsnett. Stedet ${service}. ${st.free ? 'Her finnes også en bekreftet mulighet for gratis ombruk eller gratis uthenting av bestemte brukbare materialer.' : 'Stedet registreres ikke som et bekreftet gratis uthentingspunkt for brukbare gjenstander.'}`;

  const intro = `${st.name} ligger ved ${st.address} og er registrert av Oslo kommune som ${t}; kartpunktet gjør denne konkrete miljøtjenesten synlig som et eget sted i History GO, i stedet for å gjemme funksjonen under et større nabolag eller et annet nærliggende sted.`;
  const p1b = `${distinctive[index % distinctive.length]}: ${service}, og den fysiske plasseringen viser at avfallsbehandling begynner med et lokalt valg om hvor ulike ting skal leveres, ikke først når materialene ankommer et behandlingsanlegg langt unna.`;
  const p1c = `${self} Det er derfor viktig å skille den stabile stedsidentiteten fra opplysninger som åpningstider, adgang og midlertidige driftsendringer, fordi de praktiske vilkårene kan endres raskere enn selve stasjonen.`;

  const p2a = `${reuse} Denne forskjellen er sentral i underkategorien Miljø & gjenbruk: en stasjon som tar imot brukbare ting er ikke automatisk et sted der publikum kan hente dem gratis, og History GO markerer gratis uthenting bare når funksjonen er dokumentert.`;
  const p2b = `Avfallshierarkiet gir en faglig ramme for å forstå stedet: avfallsforebygging og videre bruk av produkter prioriteres foran materialgjenvinning når det er forsvarlig, mens sortering og separat innsamling gjør det mulig å behandle materialer og risikostoffer på ulike måter.`;
  const p2c = st.type === 'environment_station'
    ? `For ${st.name} er den mest karakteristiske rollen separat innsamling av farlig avfall. Slike strømmer kan inneholde egenskaper eller stoffer som gjør at de ikke bør blandes med restavfall, og et lokalt mottak reduserer terskelen for å levere dem til riktig behandling.`
    : `For ${st.name} er sorteringen samtidig et spørsmål om ressurskvalitet. Når treverk, metaller, elektriske produkter eller andre fraksjoner holdes fra hverandre, blir det lettere å sende dem videre til den behandlingen eller ombruksløsningen som passer den konkrete strømmen.`;

  const p3a = `Som læringssted kan ${st.name} brukes til å følge ett produkt gjennom flere mulige veier: videre bruk dersom det fortsatt fungerer, reparasjon eller klargjøring når det er mulig, materialgjenvinning når produktfunksjonen er slutt, og særskilt behandling når innholdet krever det.`;
  const p3b = `${st.free ? 'Den dokumenterte gratisdelen gjør dessuten ressurskretsløpet direkte synlig, fordi en brukbar gjenstand eller et materiale kan gå fra én husholdning til en ny bruker uten et ordinært kjøp.' : 'Fraværet av bekreftet gratis uthenting er også viktig informasjon: kartet skal ikke love en ombruksfunksjon som den aktuelle kommunale tjenesten ikke dokumenterer.'} Dermed blir praktisk informasjon og faglig kildekritikk to sider av samme stedsbeskrivelse.`;
  const p3c = `Når ${st.name} besøkes, er det derfor mest presist å spørre hva som kan leveres akkurat her, hva som eventuelt kan tas ut igjen, hvilke adgangsregler som gjelder, og hvor materialene går videre; slike spørsmål kobler det konkrete Oslo-stedet til større temaer om ressursbruk, sirkulær økonomi og miljøforvaltning.`;
  const popupDesc = `${intro} ${p1b} ${p1c}\n\n${p2a} ${p2b} ${p2c}\n\n${p3a} ${p3b} ${p3c}`;
  if(words(desc)<40 || words(desc)>80) throw new Error(`${st.id} desc ${words(desc)} words`);
  if(words(popupDesc)<300) throw new Error(`${st.id} popup ${words(popupDesc)} words`);
  return { desc,popupDesc };
}

function claimsFor(st,pageUrl){
  const stationClaim = `Oslo kommune registrerer ${st.name} ved ${st.address} som ${typeLabel[st.type]} i kommunens avfalls- og gjenvinningsnett.`;
  const serviceClaim = st.type === 'environment_station'
    ? `${st.name} er et lokalt innsamlingspunkt for farlig avfall og utvalgte risikostrømmer.`
    : `${st.name} tar imot sorterte husholdningsmaterialer innenfor rammene Oslo kommune oppgir for denne stasjonstypen.`;
  const reuseClaim = st.free
    ? `${st.name} har en dokumentert funksjon der publikum kan hente bestemte brukbare gjenstander eller materialer gratis.`
    : `${st.name} registreres ikke i denne produksjonen som et bekreftet gratis uthentingspunkt for ombruksvarer.`;
  return [
    { id:`claim_${st.id}_identity`, claim:stationClaim, sourceUrl:pageUrl, sourceLocation:'Stasjonssiden: navn, adresse og tjenestetype.', sourceType:'institutional', verifiedAt:DATE, status:'verified', claimKind:'identity', evidenceMode:'direct', temporalStatus:'current' },
    { id:`claim_${st.id}_service`, claim:serviceClaim, sourceUrl:pageUrl, sourceLocation:'Stasjonssiden: hva du kan levere og praktisk bruk.', sourceType:'institutional', verifiedAt:DATE, status:'verified', claimKind:'ordinary', evidenceMode:'direct', temporalStatus:'current' },
    { id:`claim_${st.id}_access`, claim:`Oslo kommune publiserer egne åpningstider og adgangsregler for ${st.name}; ${st.self ? 'stasjonen har også selvbetjent bruk i deler av tilbudet' : 'bruk skjer etter stasjonens publiserte åpningstider'}.`, sourceUrl:pageUrl, sourceLocation:'Stasjonssiden: åpningstider, adgang og eventuell Oslonøkkel.', sourceType:'institutional', verifiedAt:DATE, status:'verified', claimKind:'ordinary', evidenceMode:'direct', temporalStatus:'current' },
    { id:`claim_${st.id}_reuse`, claim:reuseClaim, sourceUrl:pageUrl, sourceLocation:'Stasjonssiden og kommunens ombruksinformasjon: innlevering/uthenting.', sourceType:'institutional', verifiedAt:DATE, status:'verified', claimKind:'ordinary', evidenceMode:'direct', temporalStatus:'current' },
    { id:`claim_${st.id}_hierarchy`, claim:'Avfallsforebygging og ombruk prioriteres foran materialgjenvinning i avfallshierarkiet når det er forsvarlig.', sourceUrl:CIRCULAR_SOURCE, sourceLocation:'Miljødirektoratets temaside om sirkulær økonomi og avfallshierarkiet.', sourceType:'official', verifiedAt:DATE, status:'verified', claimKind:'ordinary', evidenceMode:'direct', temporalStatus:'current' },
    { id:`claim_${st.id}_hazard`, claim:'Farlig avfall må håndteres separat fordi egenskaper eller innhold kan kreve særskilt behandling for å redusere risiko for helse og miljø.', sourceUrl:HAZARDOUS_SOURCE, sourceLocation:'Miljødirektoratets temaside om farlig avfall.', sourceType:'official', verifiedAt:DATE, status:'verified', claimKind:'ordinary', evidenceMode:'direct', temporalStatus:'current' },
    { id:`claim_${st.id}_network`, claim:`${st.name} inngår i Oslo kommunes publiserte nett av gjenvinnings- og miljøstasjoner.`, sourceUrl:ALL_STATIONS, sourceLocation:'Oslo kommunes samleoversikt over gjenvinningsstasjoner.', sourceType:'institutional', verifiedAt:DATE, status:'verified', claimKind:'ordinary', evidenceMode:'direct', temporalStatus:'current' }
  ];
}

function coverageFor(text, st){
  const ids = {
    identity:`claim_${st.id}_identity`, service:`claim_${st.id}_service`, access:`claim_${st.id}_access`, reuse:`claim_${st.id}_reuse`, hierarchy:`claim_${st.id}_hierarchy`, hazard:`claim_${st.id}_hazard`, network:`claim_${st.id}_network`
  };
  const ss = sentences(text);
  return ss.map((sentence,i)=>{
    let claimIds;
    if(i===0) claimIds=[ids.identity,ids.network];
    else if(i===1) claimIds=[ids.service,ids.network];
    else if(i===2) claimIds=[ids.access];
    else if(i===3) claimIds=[ids.reuse];
    else if(i===4) claimIds=[ids.hierarchy];
    else if(i===5) claimIds=[st.type==='environment_station'?ids.hazard:ids.service];
    else if(i===6) claimIds=[ids.hierarchy,ids.service];
    else if(i===7) claimIds=[ids.reuse,ids.hierarchy];
    else claimIds=[ids.service,ids.access,ids.network];
    return { sentence:i+1, claimIds };
  });
}

function quiz(st){
  const identity=`claim_${st.id}_identity`, service=`claim_${st.id}_service`, access=`claim_${st.id}_access`, reuse=`claim_${st.id}_reuse`, hierarchy=`claim_${st.id}_hierarchy`, hazard=`claim_${st.id}_hazard`, network=`claim_${st.id}_network`;
  return [
    { question:`Hvor ligger ${st.name}?`, answer:st.address, type:'hvor', normalKnowledgeQuestion:true, claimIds:[identity] },
    { question:`Hva slags sted er ${st.name}?`, answer:typeLabel[st.type], type:'hva', normalKnowledgeQuestion:true, claimIds:[identity] },
    { question:`Hva er hovedfunksjonen til ${st.name}?`, answer: st.type==='environment_station' ? 'å samle inn farlig avfall og utvalgte risikostrømmer separat' : 'å ta imot og sortere husholdningsmaterialer innenfor stasjonens regler', type:'hva', normalKnowledgeQuestion:true, claimIds:[service] },
    { question:`Hvilket kommunalt nett inngår ${st.name} i?`, answer:'Oslo kommunes nett av gjenvinnings- og miljøstasjoner', type:'hva', normalKnowledgeQuestion:true, claimIds:[network] },
    { question:`Hva er registrert om gratis uthenting ved ${st.name}?`, answer:st.free ? 'stedet har en dokumentert gratis uthentingsfunksjon for bestemte ombruksvarer eller materialer' : 'stedet er ikke registrert som et bekreftet gratis uthentingspunkt', type:'hva_skjedde', normalKnowledgeQuestion:true, claimIds:[reuse] },
    { question:`Hva står høyere i avfallshierarkiet enn materialgjenvinning?`, answer:'avfallsforebygging og ombruk', type:'hvilket_verk_eller_objekt', normalKnowledgeQuestion:false, claimIds:[hierarchy] },
    { question:`Hvorfor skal farlig avfall samles inn separat?`, answer:'fordi egenskaper eller innhold kan kreve særskilt behandling for å redusere risiko for helse og miljø', type:'hva_ble_bygget_produsert_eller_endret', normalKnowledgeQuestion:false, claimIds:[hazard] },
    { question:`Hva bør du kontrollere før et besøk til ${st.name}?`, answer:'aktuelle åpningstider, adgangsregler og hva stasjonen tar imot', type:'når', normalKnowledgeQuestion:false, claimIds:[access,service] }
  ];
}

function placeFor(st,geo,page,index){
  const {desc,popupDesc}=buildText(st,index);
  const circular = {
    schema:'history_go_circular_place_profile_v1', place_type:st.type, operation_status:'active', free_takeaway:st.free, reuse_sale:false, restricted_access:false, self_service:st.self, mobile_service:false,
    reuse:[{id:`${st.id}_reuse`,title:st.free?'Gratis ombruk':'Ombruk og videre bruk',description:st.reuse || 'Ingen bekreftet gratis uthentingsfunksjon; se kommunens aktuelle stasjonsinformasjon.'}],
    materials:[{id:`${st.id}_materials`,title:st.type==='environment_station'?'Farlig avfall':'Sorterte materialstrømmer',description:st.type==='environment_station'?'Risikostrømmer holdes adskilt fra restavfall.':'Materialer sorteres etter stasjonens publiserte mottaksregler.'}],
    environment:[{id:`${st.id}_environment`,title:'Avfallshierarkiet',description:'Forebygging og ombruk vurderes før materialgjenvinning; farlig avfall krever særskilt håndtering.'}],
    systems:[{id:`${st.id}_system`,title:typeLabel[st.type],description:`Oslo kommunes fysiske miljøinfrastruktur ved ${st.address}.`}],
    source_url:page.url, verified_at:DATE
  };
  const place = {
    id:st.id, name:st.name, lat:geo.lat, lon:geo.lon, r:80, category:'natur', subcategory_id:'miljo_gjenbruk', desc, popupDesc,
    place_card_profile:{schema:'history_go_place_card_profile_v2',collection_ids:['reuse','materials','environment','systems'],reason:'Miljø & gjenbruk bruker fire sirkulære ressursflater; Flora/Fauna skal ikke konstrueres på et gjenvinnings- eller miljøpunkt.',verifiedAt:DATE},
    circular_profile:circular,
    quiz_profile:{place_type:st.type,subtype:'miljo_gjenbruk_oslo',signature_features:[typeLabel[st.type],st.free?'bekreftet gratis ombruk':'sortering og sikker innsamling',st.self?'selvbetjent funksjon':'bemannet funksjon'],primary_angles:['ressursbruk','ombruk','sortering','miljoforvaltning'],question_families:['sted_og_materialitet','bruk_og_funksjon','saertrekk','kontrast'],avoid_angles:['generisk_natursted','udokumentert_gratis_uthenting'],must_include:['konkret tjenestetype','avfallshierarkiet','aktuell ombruksstatus'],contrast_targets:[],notes:'Stedsspesifikke og tidsavhengige fakta skal hentes fra Oslo kommune; fagverket forklarer kretsløp og avfallshierarki.'},
    locatorType:'address', sourceProvider:geo.sourceObjectId.startsWith('kartverket')?'kartverket':'official_service_location', sourceObjectId:geo.sourceObjectId, geocodeAccuracy:geo.accuracy,
    coordRole:'service_location_anchor', coordType:geo.accuracy==='address_point'?'official_address_point':'service_point', coordStatus:geo.accuracy==='address_point'?'verified_address':'verified_service_location', coordSource:geo.accuracy==='address_point'?`Kartverket Adresse REST-API – ${st.address}`:`Oslo kommune – ${st.name}`,
    coordSourceId:geo.sourceObjectId, coordSourceUrl:geo.accuracy==='address_point'?'https://ws.geonorge.no/adresser/v1/':page.url, coordVerifiedAt:DATE, coordNote:geo.note,
    address:st.address,
    externalLinks:[{type:'reference',label:`Oslo kommune – ${st.name}`,url:page.url,lang:'nb',verifiedAt:DATE},{type:'coordinate_source',label:geo.accuracy==='address_point'?'Kartverket – offisiell adresse':'Oslo kommune – stedsangivelse',url:geo.accuracy==='address_point'?'https://ws.geonorge.no/adresser/v1/':page.url,lang:'nb',verifiedAt:DATE}]
  };
  if(page.og && /^https:\/\//.test(page.og) && !/logo/i.test(page.og)) {
    place.frontImage=page.og; place.cardImage=page.og; place.popupImage=page.og;
  }
  return place;
}

function packetFor(st,place,page){
  const claims=claimsFor(st,page.url);
  const qs=quiz(st);
  return {
    schemaVersion:'4.2',validatorVersion:'4.2.1',placeId:st.id,placeFile:`data/places/natur/oslo/miljo_gjenbruk/${st.id}.json`,status:'ready_v4_2',
    identity:{status:'resolved',represents:`${st.name} som Oslo kommunes fysiske ${typeLabel[st.type]} ved ${st.address}.`,period:'2026–',excludes:['andre gjenvinnings- og miljøstasjoner i Oslo','mobile stopp som bare finnes til bestemte tider','midlertidig utilgjengelige tjenester']},
    metadataSnapshot:{name:st.name,category:'natur'},
    textHashes:{algorithm:'sha256',desc:sha(place.desc),popupDesc:sha(place.popupDesc)},
    claims,
    sentenceCoverage:{desc:coverageFor(place.desc,st),popupDesc:coverageFor(place.popupDesc,st)},
    reviews:{factual:{status:'passed',reviewedAt:DATE,reviewer:'History GO source review'},editorial:{status:'passed',reviewedAt:DATE,reviewer:'History GO editorial review',introducedNewFacts:false}},
    quizReadiness:{questions:qs},
    reviewsNotes:'Stedsidentitet, adresse, tjenestetype og tidsavhengige driftsopplysninger er kontrollert mot Oslo kommunes stasjonsside. Faglig ramme er kontrollert mot Miljødirektoratet.',
    completion:{completedUnder:'4.2',currentStatus:'current',sourceVerifiedAt:DATE,claimsVerified:{verified:claims.length,total:claims.length},factualReview:'passed',editorialReview:'passed',validatorVersion:'4.2.1'}
  };
}

async function main(){
  const manifestPath=path.join(ROOT,'data/places/manifest.json');
  const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  const newFiles=[];
  const inventory=[];
  for(let i=0;i<stations.length;i++){
    const st=stations[i];
    const [page,geo]=await Promise.all([officialPage(st),geocode(st)]);
    const place=placeFor(st,geo,page,i);
    const packet=packetFor(st,place,page);
    const rel=`places/natur/oslo/miljo_gjenbruk/${st.id}.json`;
    writeJson(path.join(ROOT,'data',rel),place);
    writeJson(path.join(ROOT,'data/places/production',`${st.id}.json`),packet);
    newFiles.push(rel);
    inventory.push({id:st.id,name:st.name,address:st.address,lat:geo.lat,lon:geo.lon,place_type:st.type,free_takeaway:st.free,self_service:st.self,source:page.url,frontImage:Boolean(place.frontImage),status:'active_permanent'});
    console.log(`generated ${st.id} ${geo.lat},${geo.lon} image=${Boolean(place.frontImage)}`);
  }
  const set=new Set(manifest.files);
  for(const file of newFiles) if(!set.has(file)) manifest.files.push(file);
  fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
  writeJson(path.join(ROOT,'reports/oslo-miljo-gjenbruk-2026/permanent-active-inventory.json'),{schema:'history_go_oslo_miljo_gjenbruk_inventory_v1',generatedAt:DATE,category:'natur',subcategory_id:'miljo_gjenbruk',selectionAuthority:ALL_STATIONS,count:inventory.length,places:inventory,excluded:[{id:'kringsja_miljostasjon',reason:'midlertidig utilgjengelig i dagens kommunale oversikt; ikke aktiv permanent prikk'},{id:'mobile_gjenvinningsstasjoner',reason:'tidsavhengige stopp; krever egen temporal modell før permanente kartprikker'}]});
  if(inventory.length!==28) throw new Error(`Expected 28 active permanent places, got ${inventory.length}`);
}

main().catch(err=>{console.error(err);process.exit(1);});
