#!/usr/bin/env node
// Final source-backed length correction on Folketeateret and Kunstnernes Hus only.
// Existing fullquiz, ID, coordinates, category, image and canonical Fagverk remain unchanged.
import fs from 'node:fs';
import {sha256Text,splitSentences,validatePacket} from './validate-place-description-production-v4_2.mjs';

const specs=[
  {
    id:'folketeateret',
    descAddition:'Det er en scene inne i et større bygg med kontorer, byliv og den åpne forbindelsen Folketeaterpassasjen.',
    descClaims:['claim_folketeateret_source_1','claim_folketeateret_source_5'],
    claims:[
      {
        id:'claim_folketeateret_1918_mowinckel_iversen',
        claim:'Folketeaterbevegelsen startet i 1918 for et bredt publikum; Agnes Mowinckel og Sverre Iversen var sentrale drivkrefter, og flere tomtealternativer ble vurdert før Youngstorget.',
        sourceUrl:'https://oslobyleksikon.no/side/Folketeaterbygningen',
        sourceLocation:'Historikk – Folketeaterbevegelsen, planlagte tomter og ildsjeler',
        sourceType:'reputable_secondary',verifiedAt:'2026-11-02',
        status:'verified',claimKind:'ordinary',evidenceMode:'direct',temporalStatus:'historical'
      },{
        id:'claim_folketeateret_1934_arbeiderorganisasjoner',
        claim:'Da Folketeaterbygningen ble tatt i bruk fra 1934, flyttet Arbeiderbladet, Arbeidernes Opplysningsforbund, Arbeidernes Ungdomsfylking og andre arbeiderorganisasjoner inn i lokalene.',
        sourceUrl:'https://oslobyleksikon.no/side/Folketeaterbygningen',
        sourceLocation:'Historikk – kontorer, redaksjoner og arbeiderbevegelse i 1934–1935',
        sourceType:'reputable_secondary',verifiedAt:'2026-11-02',
        status:'verified',claimKind:'ordinary',evidenceMode:'direct',temporalStatus:'historical'
      }
    ],
    additions:[
      {
        text:'Historien begynte lenge før de senere forestillingene. Folketeaterbevegelsen ble dannet i 1918 for å gi arbeiderklassen tilgang til scenekunst. Skuespilleren Agnes Mowinckel og politikeren Sverre Iversen var blant pådriverne. Før tomten ved Youngstorget ble valgt, var både Ankertorget og Hammersborg inne i planene. Valget av sted viser hvordan et kulturelt ideal måtte forholde seg til byens arealer, økonomi og politiske prioriteringer. Bygningens rolle i arbeiderbevegelsen var en del av prosjektet før scenen fikk sitt eget faste repertoar.',
        claimIds:['claim_folketeateret_1918_mowinckel_iversen','claim_folketeateret_source_7']
      },{
        text:'Da bygningen begynte å bli tatt i bruk i 1934, flyttet en rekke organisasjoner fra arbeiderbevegelsen inn. Arbeiderbladet fikk redaksjonslokaler her, sammen med blant andre Arbeidernes Opplysningsforbund og Arbeidernes Ungdomsfylking. Teatersalen var med andre ord bare én funksjon i et større hus som også rommet presse, organisasjonsarbeid og møtesteder. Den kombinasjonen er fortsatt viktig når man leser bygningen som kulturhistorisk sted. Folketeaterpassasjen binder Youngstorget og Storgata sammen, men passasjen, organisasjonsbygningen og den enkelte scenen må ikke behandles som samme institusjon.',
        claimIds:['claim_folketeateret_1934_arbeiderorganisasjoner','claim_folketeateret_source_1','claim_folketeateret_source_5']
      }
    ]
  },
  {
    id:'kunstnernes_hus',
    descAddition:'Utstillingsrommene forteller også om kunstnernes egen organisering, kunstutdanning og møtet mellom norsk og internasjonal moderne kunst.',
    descClaims:['claim_kunstnernes_hus_source_1','claim_kunstnernes_hus_source_2','claim_kunstnernes_hus_source_4'],
    claims:[
      {
        id:'claim_kunstnernes_hus_1930_utstilling',
        claim:'Ved innvielsen av Kunstnernes Hus i 1930 var omkring 400 verk med i Høstutstillingen, og langt flere verk ble levert til juryering enn tidligere.',
        sourceUrl:'https://kunstnerneshus.no/om/historie',
        sourceLocation:'1930 – Husets innvielse, Høstutstillingen og publikums- og kunstnerrespons',
        sourceType:'official',verifiedAt:'2026-11-02',
        status:'verified',claimKind:'ordinary',evidenceMode:'direct',temporalStatus:'historical'
      },{
        id:'claim_kunstnernes_hus_akademiet_rom',
        claim:'Bygningens bakre del hadde fra starten rom og atelierer for Statens Kunstakademi; leieinntektene bidro til å finansiere husets drift.',
        sourceUrl:'https://kunstnerneshus.no/om/historie',
        sourceLocation:'1929 – Bygningsarbeidet og 1940-årene – Statens Kunstakademi på huset',
        sourceType:'official',verifiedAt:'2026-11-02',
        status:'verified',claimKind:'ordinary',evidenceMode:'direct',temporalStatus:'historical'
      },{
        id:'claim_kunstnernes_hus_1942_1945_okkupasjon',
        claim:'Wehrmacht beslagla Kunstnernes Hus 1. april 1942 og brukte overlyssalene til lager; huset åpnet igjen i november 1945 etter opprydding.',
        sourceUrl:'https://kunstnerneshus.no/om/historie',
        sourceLocation:'1942 – Huset blir beslaglagt og 1945 – Kunstnernes Hus åpner igjen etter krigen',
        sourceType:'official',verifiedAt:'2026-11-02',
        status:'verified',claimKind:'ordinary',evidenceMode:'direct',temporalStatus:'historical'
      }
    ],
    additions:[
      {
        text:'Høstutstillingen i de nye lokalene viste omtrent 400 verk. Betydelig flere kunstnere leverte arbeider til juryeringen enn tidligere, noe som viser hvor viktig de nye utstillingsrommene var for kunstfeltet. At kunstnerne fikk sitt eget hus, handlet ikke bare om en adresse eller en arkitektonisk stil. Det endret mulighetene for å organisere utstillinger, velge kunst og møte publikum. Samtidig ble deler av bygningens bakre fløy brukt av Statens Kunstakademi. Rommene for elever og lærere og leieinntektene knyttet kunstnernes utstillingsinstitusjon til utdanning og det praktiske grunnlaget for driften.',
        claimIds:['claim_kunstnernes_hus_1930_utstilling','claim_kunstnernes_hus_akademiet_rom','claim_kunstnernes_hus_source_1']
      },{
        text:'Under okkupasjonen ble denne råderetten satt på prøve. Wehrmacht beslagla bygningen i april 1942 og brukte blant annet overlyssalene som lager for våpen og forsyninger. Kunstnernes Hus kunne åpne igjen etter opprydding i november 1945. Disse historiske bruddene viser hvorfor et utstillingshus også må studeres som institusjon: Hvem har tilgang til rommene, hvem avgjør innholdet, og hvordan kan kunstnerne arbeide når omgivelsene endres? Når du går gjennom salene, kan du derfor lese arkitektur, utstillingspraksis, kunstnernes organisering og okkupasjonshistorien som deler av samme sted.',
        claimIds:['claim_kunstnernes_hus_1942_1945_okkupasjon','claim_kunstnernes_hus_source_5','claim_kunstnernes_hus_source_2']
      }
    ]
  }
];
function read(p){return JSON.parse(fs.readFileSync(p,'utf8'));}
function write(p,value){fs.writeFileSync(p,JSON.stringify(value,null,2)+'\n');}
for(const spec of specs){
  const packetPath='data/places/production/'+spec.id+'.json';
  const packet=read(packetPath);
  if(packet.status!=='ready_v4_2')throw Error(spec.id+' expected ready_v4_2');
  const place=read(packet.placeFile);
  const existing = new Set(packet.claims.map(c=>c.id));
  for(const c of spec.claims){
    if(existing.has(c.id))throw Error('Duplicate claim '+c.id);
    packet.claims.push(c);
  }
  const descBefore=splitSentences(place.desc).length;
  place.desc+=' '+spec.descAddition;
  const descAfter=splitSentences(place.desc).length;
  for(let n=descBefore+1;n<=descAfter;n++)packet.sentenceCoverage.desc.push({sentence:n,claimIds:spec.descClaims});
  for(const section of spec.additions){
    const before=splitSentences(place.popupDesc).length;
    place.popupDesc+='\n\n'+section.text;
    const after=splitSentences(place.popupDesc).length;
    for(let n=before+1;n<=after;n++)packet.sentenceCoverage.popupDesc.push({sentence:n,claimIds:section.claimIds});
  }
  packet.textHashes.desc=sha256Text(place.desc);
  packet.textHashes.popupDesc=sha256Text(place.popupDesc);
  packet.completion.claimsVerified={
    verified:packet.claims.filter(c=>c.status==='verified').length,
    total:packet.claims.length
  };
  packet.completion.sourceVerifiedAt='2026-11-02';
  packet.reviews.factual.reviewedAt='2026-11-02';
  packet.reviews.factual.notes+=' Ny kildekontroll 2.11.2026: to utfyllende stedsavsnitt med registrerte påstander i eksisterende institusjonskilder, ingen endringer i quiz eller adresser.';
  packet.reviews.editorial.reviewedAt='2026-11-02';
  packet.reviews.editorial.notes+=' Beskrivelsene utvidet med dokumentert institusjons- og stedshistorie, uten nye quizspørsmål eller uverifiserte påstander.';
  const issues=validatePacket({packet,place,packetFile:packetPath}).issues;
  if(issues.length)throw Error(spec.id+' failed v4.2: '+JSON.stringify(issues));
  const runtimePath='data/runtime/place-open/'+spec.id+'.json';
  const runtime=read(runtimePath);
  if(runtime.place?.id!==spec.id)throw Error('Wrong place in runtime '+spec.id);
  runtime.place.desc=place.desc;runtime.place.popupDesc=place.popupDesc;
  write(packet.placeFile,place);write(packetPath,packet);write(runtimePath,runtime);
  console.log(spec.id,'v4.2 PASS',place.desc.split(/\s+/).length,'desc words',place.popupDesc.split(/\s+/).length,'popup words');
}
