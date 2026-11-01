#!/usr/bin/env node
// Materialize the source-reviewed Grini collection package. Run explicitly from repo root.
// This builder records candidate content, never final UI approval or vFerdig.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
const day='2026-11-01';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(p,v)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');};
const snl='https://snl.no/Grini_-_tysk_fangeleir';
const reg='https://www.nasjonalarkivet.no/nordmenn-i-fangenskap-under-andre-verdenskrig/';
const ark='https://www.nasjonalarkivet.no/5-000-dokumenter-fra-andre-verdenskrig/';
const baker='https://www.bakerhansen.no/om-oss/historien/';
const logoUrl='https://www.bakerhansen.no/wp-content/themes/bakerhansen/assets/img/images/bh_logo.png';
const people=[
 {id:'einar_gerhardsen',file:'data/people/politikk/oslo/people_politikk_oslo.json',claims:'data/people/claims/politikk/oslo/regjeringskvartalet/einar_gerhardsen.claims.json',sentence:'Da han kom tilbake til Grini fra Sachsenhausen i september 1944, deltok han i politiske samtaler blant fangene om Norge etter krigen.',claim:'Einar Gerhardsen kom tilbake fra Sachsenhausen til Grini i september 1944 og deltok i politiske samtaler blant fangene om etterkrigstiden.',location:'Politiske diskusjoner og studievirksomhet'},
 {id:'frode_rinnan',file:'data/people/by/oslo/hammersborg_torg/people_hammersborg_torg.json',claims:'data/people/claims/by/oslo/hammersborg_torg/frode_rinnan.claims.json',sentence:'Som fange på Grini arbeidet han sammen med Odd Nansen med planleggingen av leirens utvidelse, før begge ble deportert til Sachsenhausen i september 1943.',claim:'Frode Rinnan og Odd Nansen fikk en stor del av planarbeidet for Grinis utvidelse før begge ble deportert til Sachsenhausen i september 1943.',location:'Fra fengsel til fangeleir'}
];
const logoFile='bilder/brands/baker_hansen.png';
if(!fs.existsSync(logoFile)){
 const response=await fetch(logoUrl);if(!response.ok)throw Error('Official logo download: '+response.status);
 fs.mkdirSync(path.dirname(logoFile),{recursive:true});fs.writeFileSync(logoFile,Buffer.from(await response.arrayBuffer()));
}
if(createHash('sha256').update(fs.readFileSync(logoFile)).digest('hex')!=='4c089c58786362cd08cb6e4449a9028af70baa3fe6e9d8db6acaecbcf07ef802')throw Error('Official logo differs from the source-reviewed asset; review before replacing.');
for(const item of people){
 const rows=read(item.file),person=rows.find(x=>x.id===item.id),claims=read(item.claims);
 if(!person)throw Error('Missing canonical person '+item.id);
 if(!claims.claims.some(x=>x.id==='grini_documented_role')){
  if(item.id==='frode_rinnan'){
   person.popupDesc=person.popupDesc.replace(' Personkortet gjelder denne dokumenterte arkitektrollen, ikke alle beslutningene bak saneringen.','');
   claims.sentence_claim_map.popupDesc=claims.sentence_claim_map.popupDesc.slice(0,3);
   claims.sentence_claim_map.popupDesc[0].claim_ids=['identity','education'];
  }
  person.popupDesc+=' '+item.sentence;
  person.places=[...new Set([...person.places,'grini_fangeleir'])];
  person.source_urls=[...new Set([...person.source_urls,snl])];person.verifiedAt=day;
  claims.claims.push({id:'grini_documented_role',claim:item.claim,status:'verified',source_url:snl,source_location:item.location,source_type:'encyclopedia',temporal_status:'historical',verified_at:day,evidence_level:'explicit'});
  claims.field_claim_map['places[grini_fangeleir]']=['grini_documented_role'];
  claims.sentence_claim_map.popupDesc.push({sentence:claims.sentence_claim_map.popupDesc.length+1,claim_ids:['grini_documented_role']});
  claims.completion.claims_verified=claims.claims.length+'/'+claims.claims.length;
  claims.completion.source_verified_at=day;
  write(item.file,rows);write(item.claims,claims);
 }
}
{
 const p='data/people/historie/oslo/people_historie_oslo.json',rows=read(p);
 for(const person of rows){
  if(['viggo_hansteen','rolf_wickstrom'].includes(person.id))person.places=person.places.filter(x=>x!=='grini_fangeleir');
  if(['trygve_bratteli','arnulf_overland'].includes(person.id))person.roundHoldbacks=[...new Set([...(person.roundHoldbacks||[]),'grini_fangeleir'])];
 }
 write(p,rows);
 const mp='data/people/manifest.json',m=read(mp);
 m.priorityFilesByPlace.grini_fangeleir=people.map(x=>x.file.replace(/^data\//,''));write(mp,m);
}
function diagram(file,title,subtitle,register){
 const lines=Array.from({length:7},(_,i)=>'<path d="M265 '+(325+i*45)+'h260 M675 '+(325+i*45)+'h260" stroke="#a5a39b" stroke-width="4" opacity=".48"/>').join('');
 const grid=register?'<path d="M350 295v345 M760 295v345" stroke="#727a7e" stroke-width="3" opacity=".6"/>':'';
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900" role="img" aria-labelledby="title desc"><title id="title">'+title+' — Illustrasjon – ikke fotografi</title><desc id="desc">Skjematisk bokform. Ingen side, håndskrift, farge eller innbinding er rekonstruert.</desc><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#26343b"/><stop offset="1" stop-color="#111a20"/></linearGradient></defs><rect width="1200" height="900" rx="38" fill="url(#bg)"/><path d="M90 205h1020" stroke="#caa96a" stroke-width="2"/><text x="90" y="100" font-family="sans-serif" font-size="24" letter-spacing="5" fill="#caa96a">ARKIVSPOR FRA GRINI</text><text x="90" y="154" font-family="sans-serif" font-size="37" fill="#f4ede0">'+title+'</text><path d="M220 280q180-35 380 10 200-45 380-10v385q-180-35-380 10-200-45-380-10z" fill="#e1ded3" stroke="#b8b4a9" stroke-width="7"/><path d="M600 290v385" stroke="#767a78" stroke-width="7"/>'+lines+grid+'<text x="600" y="742" text-anchor="middle" font-family="sans-serif" font-size="27" fill="#f4ede0">'+subtitle+'</text><text x="600" y="800" text-anchor="middle" font-family="sans-serif" font-size="27" fill="#e0bf7e">Illustrasjon – ikke fotografi</text><text x="600" y="845" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#adb9be">Skjematisk bokform · ikke en rekonstruksjon av originalen</text></svg>';
 fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,svg);
}
const objects=[
 {id:'grini_fangeprotokoll_11_2600',name:'Fangeprotokoll for nummer 11–2600',period:'1941–1942',file:'grini_fangeprotokoll_1941_1942.svg',title:'Fangeprotokollen 1941–1942',subtitle:'Fangenummer 11–2600 · leiradministrasjonens register',url:'https://www.digitalarkivet.no/db50002332000003',source:reg,desc:'Denne bevarte protokollen registrerer Grini-fanger i 1941–1942. Registerrekken inneholder blant annet navn, fangenummer og datoer for innsetting eller overføring. Protokollen er en kilde til leiradministrasjonen, ikke en fullstendig fortelling om den enkelte fanges erfaringer.'},
 {id:'grini_molvig_minnebok_1941',name:'Magne Molvigs minnebok fra Grini',period:'Høsten 1941',file:'grini_molvig_minnebok_1941.svg',title:'Magne Molvigs minnebok',subtitle:'1941 · fangekameratenes nedtegnelser',url:'https://media.digitalarkivet.no/view/33964/1',source:ark,desc:'Magne Molvig samlet nedtegnelser fra fangekameratene i en minnebok under oppholdet på Grini høsten 1941. Boken inneholder dikt, sanger, tegninger og andre bidrag. Nasjonalarkivet nevner blant bidragsyterne Arnulf Øverland, Johan Borgen, Francis Bull og Didrik Arup Seip.'}
];
const pp='data/places/historie/akershus/grini_fangeleir.json',place=read(pp);
place.place_card_profile={schema:'history_go_place_card_profile_v2',collection_ids:['people','objects','brands','historical_events'],reason:'To kildekontrollerte fanger, to identifiserte fysiske arkivbøker, den dokumenterte brødleverandøren og den bildebelagte løslatelsen forklarer forskjellige sider ved leiren. Arkivillustrasjonene er eksplisitt merket og rekonstruerer ikke originalens utseende.',verifiedAt:day};
place.objects=objects.map((o,i)=>{
 const image='bilder/kort/objects/'+o.file;diagram(image,o.title,o.subtitle,i===0);
 return {id:o.id,name:o.name,title:o.name,type:'arkivgjenstand',kind:'physical_archive_volume',desc:o.desc,physicalObject:true,placeSpecific:true,collectable:true,period:o.period,placeSpecificReason:'Den identifiserte boken ble brukt i eller til under Grini-fangenskapet; bevaringsstedet er i dag arkivet.',why_here:'Leirens kontrollsystem og fangenes egne stemmer kan undersøkes gjennom to forskjellige fysiske bøker.',whereToFind:'Nasjonalarkivet / Digitalarkivet – digitalisert. Ingen gjenstand skal oppsøkes inne i dagens fengsel.',image,imageKind:'illustration',imageAlt:o.name+' — Illustrasjon – ikke fotografi. Skjematisk bokform, ikke rekonstruert innbinding eller innhold.',imageMeta:{source:'Originalt History Go-diagram basert på Nasjonalarkivets objektbeskrivelse',sourcePage:o.source,creator:'Codex / History Go',credit:'History Go – skjematisk illustrasjon, ikke fotografi',license:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',assetType:'illustration',imageKind:'illustration',date:day,transformation:'Original SVG; ingen kopi av arkivside, håndskrift, kunstverk eller fotografi.',verifiedAt:day,note:'Form og nøytrale farger er skjematiske; bildet beviser ikke originalens faktiske utseende.'},source_urls:[o.source,o.url]};
});write(pp,place);
const logo='bilder/brands/baker_hansen.svg';
fs.writeFileSync(logo,'<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720"><title>Baker Hansen – autentisk nåværende logo</title><rect width="1200" height="720" rx="30" fill="#fff"/><image x="120" y="315" width="960" height="90" href="data:image/png;base64,'+fs.readFileSync(logoFile).toString('base64')+'"/></svg>');
{
 const p='data/brands/brands_master.json',rows=read(p);
 const brand={id:'baker_hansen',name:'Baker Hansen',brand_group:'oslo_origin_brand',brand_type:'historic_company',sector:'bakery',state:'catalog',verification:'verified',verified_at:day,founded:1861,logo,image:logo,desc:'Bakeriet som leverte brød til Grini-fangene under okkupasjonen.',popupdesc:'Baker Hansen leverte brød til fangene på Grini under andre verdenskrig. Virksomhetens egen historikk beskriver at brødkassene også ble brukt til å smugle brev inn i leiren. Koblingen gjelder krigstidens leveranser, ikke dagens bakeri i Grini Næringspark. Logoen er virksomhetens nåværende merke og dokumenterer ikke logoens utseende i 1941–1945.',aliases:[],tags:['historisk leverandør','brød','fangenskap'],source_urls:[baker,'https://www.forskning.no/andre-verdenskrig-historie-museumsfavoritten/krigsfange-roar-antonsen-smuglet-brev-og-sko-ut-av-grini-fangeleir/2038256'],imageMeta:{source:'Baker Hansens offisielle nettsted',sourcePage:baker,sourceUrl:logoUrl,creator:'Baker Hansen; designer ikke oppgitt',credit:'Baker Hansen',rightsBasis:'Autentisk offisielt varemerke brukt til begrenset, informasjonsmessig identifikasjon av den dokumenterte historiske leverandøren. Ingen generell fri lisens hevdes.',reviewStatus:'verified_official_identity',assetKind:'logo',usageContext:'referential_identification',noEndorsement:true,temporalScope:'Nåværende logo; historisk stedskobling gjelder andre verdenskrig.',transformation:'Uendret offisiell PNG innpasset proporsjonalt i en hvit SVG-flate; selve merket er ikke endret.',verifiedAt:day}};
 const i=rows.findIndex(x=>x.id===brand.id);if(i<0)rows.push(brand);else rows[i]=brand;write(p,rows);
 const mp='data/brands/brands_by_place.json',m=read(mp);m.grini_fangeleir=['baker_hansen'];write(mp,m);
}
{
 const p='data/leksikon/places/akershus/historie/leksikon_grini_fangeleir.json',rows=read(p),id='grini_fangeleir_news_kommandantur_2026';
 for(const item of rows[0].chronology||[])if(item.period&&!item.title){item.title=item.period;delete item.period;}
 const note={id,place_id:'grini_fangeleir',title:'Det gamle kommandanturet restaureres',type:'news_note',period:'Planstatus kontrollert 1. november 2026; kildene er udaterte',popupDesc:'MiA beskriver rehabilitering av det gamle kommandanturet, der fangene ble innregistrert, for bruk i Grinimuseets formidling. Institusjonens sider oppgir ulike planlagte ferdigtidspunkter i 2026. Sidene bekrefter ikke at arbeidet er ferdig; planlagt åpning må derfor ikke leses som en gjennomført hendelse.',sources:[{title:'MiA – Vi pusser opp',url:'https://mia.no/grinimuseet/vi-pusser-opp-'},{title:'MiA – rehabilitering av Rødhuset',url:'https://mia.no/rehabilitering-av-rodhuset-ved-grinimuseet'}],verifiedAt:day};
 const i=rows.findIndex(x=>x.id===id);if(i<0)rows.push(note);else rows[i]=note;write(p,rows);
}
const reading={schema:'history_go_lesespor_v1',generated_at:'2026-11-01T09:00:00+01:00',city:'baerum',category:'historie',description:'Åpne arkivspor til Grini-fangenes egne tekster.',rights_policy:{default:'link_only',fulltext_allowed_only_if:'public_domain_or_open_license_or_explicit_permission_or_own_text',display_rule:'Metadata og lenke; ingen kopiert fulltekst.'},items:[
 {id:'grini_molvig_minnebok',title:'Magne Molvigs minnebok fra Grini',author:'Magne Molvig og medfanger',publication:'Nasjonalarkivet / Digitalarkivet',date:null,year:1941,type:'arkiv',subjects:['Grini','fangenskap','personlige beretninger'],place_ids:['grini_fangeleir'],person_ids:[],category_hints:['historie'],url:'https://media.digitalarkivet.no/view/33964/1',access:'open',rights:'link_only',source_quality:'institutional',curation_status:'approved',relevance:'Les fangenes dikt, sanger og andre nedtegnelser i den digitaliserte minneboken. Dette er et enkelt fangemiljøs uttrykk, ikke alle Grini-fangers erfaringer.'},
 {id:'grini_molvig_dagbok',title:'Magne Molvigs dagboknotater fra Grini',author:'Magne Molvig',publication:'Nasjonalarkivet / Digitalarkivet',date:null,year:1941,type:'arkiv',subjects:['Grini','fangenskap','personlige beretninger'],place_ids:['grini_fangeleir'],person_ids:[],category_hints:['historie'],url:'https://media.digitalarkivet.no/view/33997/1',access:'open',rights:'link_only',source_quality:'institutional',curation_status:'approved',relevance:'Nasjonalarkivet beskriver notater skrevet i skjul på toalettpapir og senere overført til en bevart bok. Sammenhold den personlige skildringen med leirens administrative kilder.'}
]};
write('data/lesespor/baerum/lesespor_baerum_historie.json',reading);
const mp='data/lesespor/manifest.json',manifest=read(mp);manifest.files=[...new Set([...manifest.files,'baerum/lesespor_baerum_historie.json'])];write(mp,manifest);
console.log('Grini source-reviewed collection candidate materialized; actual UI and full closeout approval still required.');
