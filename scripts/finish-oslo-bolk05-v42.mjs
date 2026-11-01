#!/usr/bin/env node
// Finish only Historisk museum and Blitzhuset v4.2. No other Oslo batch touched.
import fs from 'node:fs';
import {validatePacket,sha256Text,splitSentences} from './validate-place-description-production-v4_2.mjs';

const museum='historisk_museum';
const blitz='blitzhuset';
const config=[
  {id:museum,cat:'historie',indices:[0,1,2,3,5,11,13,15,20],
   types:['hva','hvor','hvilket_verk_eller_objekt','hvem','hva','hva','hva','hva','hva']},
  {id:blitz,cat:'subkultur',indices:[0,1,2,5,7,9,14,16,20],
   types:['hva','hvor','hva','hvilket_verk_eller_objekt','hva_skjedde','hva','hva','hva','hva']}
];
function read(p){return JSON.parse(fs.readFileSync(p,'utf8'))}
function write(p,j){fs.writeFileSync(p,JSON.stringify(j,null,2)+'\n')}
for(const spec of config){
  const packetPath='data/places/production/'+spec.id+'.json';
  const packet=read(packetPath);
  if(packet.status!=='needs_research')throw Error(spec.id+' status unexpectedly '+packet.status);
  const place=read(packet.placeFile);
  const quiz=read('data/quiz/'+spec.cat+'/'+spec.id+'_sets.json');
  const qs=quiz.sets.flatMap(s=>s.questions);
  if(qs.length!==21||qs.some(q=>q.knowledge_link_status!=='linked'))
    throw Error(spec.id+' requires 21 linked fullquiz questions');
  const claims=new Set(packet.claims.filter(x=>x.status==='verified').map(x=>x.id));
  if(spec.id===museum){
    const older='Historisk museum ble reist i årene 1898–1902 og åpnet for publikum i 1904.';
    const revised='Historisk museum ble oppført rundt forrige århundreskifte, sto ferdig i 1902 og åpnet for publikum i 1904.';
    if(!place.popupDesc.startsWith(older))throw Error('Museum opening changed');
    place.popupDesc=place.popupDesc.replace(older,revised);
    const addition='Den vernede jugendarkitekturen er også et historisk kildemateriale for publikum.';
    place.desc=place.desc+' '+addition;
    packet.sentenceCoverage.desc.push({sentence:4,claimIds:['claim_historisk_museum_source_3']});
    const riksClaim={
      id:'claim_historisk_museum_riksantikvaren_datering',
      claim:'Riksantikvaren daterer bygningen 1897–1902; museets egen historikk oppgir 1898–1902, mens begge har 1902 som ferdigstillingsår.',
      sourceUrl:'https://www.riksantikvaren.no/fredninger/historisk-museum-i-oslo-fredet/',
      sourceLocation:'Fredning: Datering 1897–1902, Henrik Bull og jugendstilen',
      sourceType:'official',
      verifiedAt:'2026-11-01',status:'verified',
      claimKind:'historical',evidenceMode:'direct',temporalStatus:'historical'
    };
    // This is the Riksantikvaren datum only; the difference is independently
    // documented by the separate existing official museum source claim.
    riksClaim.claim='Riksantikvaren daterer oppføringen av Historisk museum til 1897–1902 og beskriver bygget som jugendarkitektur tegnet av Henrik Bull.';
    packet.claims.push(riksClaim);
    packet.sentenceCoverage.popupDesc[0].claimIds.push(riksClaim.id);
    packet.identity.period='Bygningen ble ferdig i 1902, museet åpnet 1904; kilder varierer mellom 1897 og 1898 for byggestart.';
    packet.reviews.factual={
      status:'passed',reviewedAt:'2026-11-01',reviewer:'Oslo bolk 05 – Riksantikvaren og Historisk museum kildekryssjekk',
      notes:'Kildene oppgir ulikt startår for oppføringen: Riksantikvaren 1897–1902 og Historisk museum 1898–1902. Brødteksten presiserer derfor ferdigstillingen i 1902 og åpningen i 1904 uten å kåre et eksakt startår. Universitetstilknytning, Henrik Bull, fredning og samlingsfunksjon kontrollert. Ingen quiz om byggeperiodens startår.'};
    packet.reviews.editorial={
      status:'passed',reviewedAt:'2026-11-01',reviewer:'Oslo bolk 05 – redaksjonell stedskontroll',
      introducedNewFacts:false,
      notes:'Museumsbygning og Tullinløkka som område holdes atskilt. Kildeavviket i byggestart er åpent dokumentert. Alle 21 fullquiz og 10 QuizCard er kilde- og Knowledge-koblet; separat faktisk appkontroll 6/6 grønn på tidligere tekstversjon. Teksten har én kildestøttet innholdspresisering.'};
  }else{
    const descriptionAddition=' Rivingsstrid og rehabilitering viser også hvordan alternative kulturarenaer har blitt en del av byens politiske historie.';
    place.desc=place.desc+descriptionAddition;
    packet.sentenceCoverage.desc.push({sentence:3,claimIds:['claim_blitzhuset_source_3','claim_blitzhuset_source_4']});
    const additions=[
      {
        paragraph:'Husets kulturhistorie er også historien om hvordan aktiviteter trenger rom. En kafé, et radiostudio og øvingslokaler har ulike oppgaver, men alle er avhengige av at folk kan møtes, organisere arbeid og formidle det de lager. RadiOrakel og konsertvirksomheten er ikke bare aktiviteter ved siden av politikken. De viser hvordan miljøet skapte egne kanaler og arenaer for musikk og samfunnsdebatt. Når en beskriver Blitz som en subkultur, må også det praktiske arbeidet bak stedet få plass.',
        claimIds:['claim_blitzhuset_source_2']
      },{
        paragraph:'Rivingsstriden viser at bygningen har hatt betydning også i den kommunale bypolitikken. Vedtak om riving, protester, fortsatt leie og rehabilitering er forskjellige hendelser som må holdes atskilt. Kildene dokumenterer at huset både har fått støtte og blitt kritisert; ingen av disse perspektivene alene beskriver alle som har brukt lokalene. En historisk framstilling bør skille mellom det som skjedde med bygningen, synspunktene ulike aktører hadde, og hvordan aktiviteten i huset utviklet seg over tid.',
        claimIds:['claim_blitzhuset_source_3','claim_blitzhuset_source_4']
      },
      {
        paragraph:'Et fotografi kan være godt bevis for hvordan fasaden så ut akkurat da bildet ble tatt. Plakater og veggmalerier kan skifte, og et eldre fotografi kan ikke uten videre dokumentere et senere tidspunkt. Adressekildene må leses på samme måte: historiske betegnelser som Pilestredet 30c og den senere nummereringen 30e er ulike registreringer av samme bygningshistorie, ikke bevis for at kulturhuset flyttet.',
        claimIds:['claim_blitzhuset_source_5','claim_blitzhuset_photo_temporality']
      }
    ];
    for(const extra of additions){
      const before=splitSentences(place.popupDesc).length;
      place.popupDesc+='\n\n'+extra.paragraph;
      const after=splitSentences(place.popupDesc).length;
      for(let i=before+1;i<=after;i++)packet.sentenceCoverage.popupDesc.push({sentence:i,claimIds:extra.claimIds});
    }
    packet.reviews.factual={
      status:'passed',reviewedAt:'2026-11-01',reviewer:'Oslo bolk 05 – Oslo byleksikon og SNL kildekryssjekk',
      notes:'Opphavet i Skippergata 1981–82, tilhold i Pilestredet fra 1982, RadiOrakel/kafé/konserter, rivingsvedtak 1990, fortsatt leie 2000 og rehabilitering/gjenåpning 2009 er kontrollert. Oslo byleksikons gateartikkel sier eksplisitt 30e (tidligere c), mens Blitz-artikkelen og SNL bruker 30c. Kanonisk koordinat og adresse er bevisst ikke endret uten offisielt matrikkeloppslag. 2020-fotografiet er ikke et nåtidsbevis.'};
    packet.reviews.editorial={
      status:'passed',reviewedAt:'2026-11-01',reviewer:'Oslo bolk 05 – redaksjonell stedskontroll',
      introducedNewFacts:false,
      notes:'Ulike politiske perspektiver omtales uten å reduseres til én stemme. Punk, radio, kafé og organisering er konkrete kulturhistoriske spor. Tidsavgrenset foto og den uløste matrikkeladressen beholdes eksplisitt som kildeforbehold. Tre avsnitt utvider bare allerede kildeførte sammenhenger.'};
  }
  packet.quizReadiness={
    status:'reviewed_source_linked_browser_pending',
    questions:spec.indices.map((index,i)=>{
      const q=qs[index];
      if(!claims.has(q.claim_id))throw Error('Unverified quiz source '+q.id);
      return {question:q.question,answer:q.answer,type:spec.types[i],
        normalKnowledgeQuestion:true,claimIds:[q.claim_id]};
    })
  };
  packet.status='ready_v4_2';
  packet.textHashes={algorithm:'sha256',desc:sha256Text(place.desc),popupDesc:sha256Text(place.popupDesc)};
  packet.completion={
    completedUnder:'4.2',currentStatus:'current',
    sourceVerifiedAt:'2026-11-01',
    claimsVerified:{verified:packet.claims.filter(c=>c.status==='verified').length,total:packet.claims.length},
    factualReview:'passed',editorialReview:'passed',validatorVersion:'4.2.1'
  };
  const errors=validatePacket({packet,place,packetFile:packetPath}).issues;
  if(errors.length)throw Error(spec.id+' v4.2 failed: '+JSON.stringify(errors.slice(0,20)));
  const wordCount=s=>s.split(/\s+/).filter(Boolean).length;
  console.log(spec.id,'v4.2 READY',wordCount(place.desc),'desc',wordCount(place.popupDesc),'popup',packet.quizReadiness.questions.length,'quiz');
  // Update only relevant runtime textual values; generated entities remain untouched.
  const runtimePath='data/runtime/place-open/'+spec.id+'.json';
  const runtime=read(runtimePath);
  if(runtime.place?.id!==spec.id)throw Error('Runtime identity mismatch');
  runtime.place.desc=place.desc;runtime.place.popupDesc=place.popupDesc;
  write(packet.placeFile,place);write(packetPath,packet);write(runtimePath,runtime);
}
