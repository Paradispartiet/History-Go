#!/usr/bin/env node
// Two source-bounded 3x7 *review proposals*, never register quizzes or Place data.
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildOsloSixCardReview } from './build-oslo-six-card-review.mjs';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const GATE=JSON.parse(readFileSync(resolve(ROOT,'reports/place-production/oslo-six-places-integration-gates-20261022.json'),'utf8'));
const SOURCE = Object.freeze({
  saeterhytten_bygdoy: [
    'https://www.regjeringen.no/contentassets/c90f250c1e6b4645acc9b8be40e9a2ea/bygning_3710_seterhytten.pdf',
    'https://oslobyleksikon.no/side/S%C3%A6terhytten'
  ],
  kristiania_teglverk_bryn: [
    'https://teglverk.no/kristiania-teglverk/',
    'https://oslobyleksikon.no/side/Kristiania_Teglverk'
  ]
});
// question, correct answer, three distractors, explanation, primary URL index (0/1)
const EXTRAS = Object.freeze({
  saeterhytten_bygdoy: [
    ['Hvem står oppført som arkitekt for Sæterhytten i Statsbyggs bygningsdokumentasjon?', 'Jacob Wilhelm Nordan', ['Lars Backer','Holm Munthe','Herman Major Schirmer'], 'Statsbyggs bygningsregistrering oppgir Jacob Wilhelm Nordan som arkitekt for Sæterhytten på Dronningberget.',0],
    ['Hva skjedde på Dronningberget i 1824, før Sæterhytten sto der?', 'Området ble parkmessig opparbeidet', ['Sæterhytten ble innviet','Glassverandaen sto ferdig','Den første musikkpaviljongen ble revet'], 'Statsbyggs bygningshistorikk oppgir at Dronningberget ble parkmessig opparbeidet i 1824, flere tiår før den ombygde hytten ble innviet.',0],
    ['Hvilken tillatelse ble første gang gitt på Dronningberget i 1837?', 'Tillatelse til servering', ['Tillatelse til teglproduksjon','Tillatelse til jernbanedrift','Tillatelse til badehus på pram'], 'Statsbygg fører opp 1837 som året for den første tillatelsen til servering på Dronningberget; dette er før kafédriften i Sæterhytten fra 1866.',0],
    ['Hva ble tilført Sæterhytten i 1881 for å kunne drive full restaurant?', 'Kjeller og kjøkken', ['Fabrikkovn og skorstein','Badstue og svømmebasseng','Teglkjeller og vaskeri'], 'Oslo byleksikon beskriver at kjeller og kjøkken ble innredet i nordenden i 1881, slik at Sæterhytten kunne drives som restaurant.',1],
    ['Hvilken senere bygningsdel kom trolig til i 1890-årene?', 'Glassverandaen', ['Badehusets flytepram','Ringovnen','Den første paviljongen på Dronningberget'], 'Ifølge Oslo byleksikon ble et tidligere serveringstelt antakelig erstattet av dagens glassveranda i 1890-årene; dateringen er omtrentlig.',1],
    ['Hvilket materiale bærer bygningens grunnmur ifølge Statsbygg?', 'Gråstein', ['Armert betong','Granittblokker med stålkjerne','Støpejern'], 'Statsbygg beskriver grunnmuren som oppført i gråstein. Den eldste delen har bindingsverksvegger.',0],
    ['Når ble peisen i Sæterhytten satt inn?', 'Etter at bygningen ble flyttet til Dronningberget', ['Mens badehuset lå på prammen','Før badehuset ble tatt i bruk ved Oscarshall','Under restaureringen i 2011'], 'Bygningsbeskrivelsen skiller badehusets eldre konstruksjon fra peisen, som ble bygget etter flyttingen til Dronningberget.',0],
    ['Hvilken type tømmerkonstruksjon skal panelet innvendig fra 1860-årene etterligne?', 'Laft', ['Bindingsverk i tegl','Betonghvelv','Skipsplank med jernnagler'], 'Statsbygg beskriver innvendig liggende panel fra 1860-årene som illuderer laft, altså gir inntrykk av en laftet tømmerkonstruksjon.',0],
    ['Hvilken type virksomhet drev billedkunstneren Svein Arne Tjernsbekk i Sæterhytten fra 1995?', 'Galleri og enkel servering', ['Skipsbyggeri og verft','Industrimuseum for tegl','Jernbanekafé med togdrift'], 'Statsbyggs bygningshistorikk oppgir at billedkunstneren Svein Arne Tjernsbekk leide huset fra 1995 og drev galleri med enkel servering.',0],
    ['Hvilken fredningsbeslutning omfatter Sæterhytten og miljøet på Dronningberget?', 'Fredningen av Bygdøy kulturmiljø i 2012', ['Fredningen av Ekebergrestauranten i 2001','Riksantikvarens fredning av Akershus festning i 1897','Vern av Nøklevann som drikkevannskilde i 1923'], 'Bygdøy kulturmiljø ble fredet 17. februar 2012. Statsbygg oppgir at fredningen omfatter både eksteriør og interiør i Sæterhytten.',0],
    ['Hva er spesielt med Sæterhyttens interiører etter restaureringen som var ferdig i 2011?', 'De er tilbakeført til badehustiden', ['De er bygget som et moderne teglverk','De er helt uendret fra 1862','Alle innvendige rom er fjernet'], 'Statsbygg oppgir at interiørene er tilbakeført til badehustiden. Det er en restaurering av eldre uttrykk, ikke dokumentasjon på at alle detaljer er opprinnelige.',0]
  ],
  kristiania_teglverk_bryn: [
    ['Hvem ledet gjenstarten av Kristiania Teglverk i 1912?', 'Helge Nielsen', ['Einar Stange','Elling Jonassen','Wilhelm Stenersen'], 'Teglverk.no oppgir at verket kom i gang igjen i 1912 ved disponent Helge Nielsen, etter byggekrakkets driftsstans.',0],
    ['Hvilket selskap overtok Kristiania Teglverk i 1918?', 'A/S Einar Stange', ['Bryn Teglverk A/S','A/S Høyenhall Teglverk','Nygaard Teglverk'], 'A/S Einar Stange overtok teglverket i 1918, ifølge teglverk.no. Overtakelsen må ikke forveksles med stiftelsesåret 1897.',0],
    ['Hvilken type presse fikk Kristiania Teglverk omkring 1920?', 'Strengpresse for murstein', ['Hydraulisk taksteinspresse','Manuell teglformemaskin','Presse for drensrør'], 'Omkring 1920 ble en strengpresse for murstein tatt i bruk, som del av moderniseringen av leirbearbeidingen.',0],
    ['Hva ble brukt til å bearbeide og klargjøre leiren i moderniseringen rundt 1920?', 'Forelter og valseverk', ['Siktemaskin og mørtelblander','Kjedegraver og tørkevifte','Håndformer og tørkekasser'], 'Ved moderniseringen fikk verket blant annet liggende forelter og valseverk for å bearbeide leiren.',0],
    ['Omtrent hvor mange teglprodukter kunne verket produsere i året etter modernisering?', 'Fire millioner', ['Omtrent fire hundre tusen','Omtrent én million','Omtrent ti millioner'], 'Teglverk.no anslår en produksjonskapasitet på rundt fire millioner enheter årlig etter moderniseringen av anlegget.',0],
    ['Hva ble montert i overbygningen over ringovnen etter brannen i 1936?', 'Tørkereoler etter svensk mønster', ['En ny rekke kammerovner','Åpne tørkeskur ved leirfeltet','Dampoppvarmede tørketromler'], 'Etter brannen i 1936 kom en større overbygning med tørkereoler etter svensk mønster, som kunne utnytte spillvarmen fra ringovnen.',0],
    ['Hvilken gravemaskin ble installert i leirfeltet ved Kristiania Teglverk?', 'Kjedegravemaskin', ['Gravemaskin med wiregrabb','Sporvogn med graveskuffe','Sugegravemaskin for leire'], 'Teglverk.no dokumenterer en kjedegravemaskin i leirfeltet som del av verkets mekaniserte produksjon.',0],
    ['Hvordan ble leiren transportert fra leirfeltet mot fabrikken etter modernisering?', 'Med kabelbane', ['Med smalsporede tippevogner','Med hestekjerrer','Med lastebiler'], 'Kabelbane ble tatt i bruk for å transportere leire fra leirfeltet inn i produksjonsanlegget.',0],
    ['Hvilken spesialstein nevner teglverk.no som et av verkets produkter?', 'Sterk&Lett-stein', ['Kalksandstein','Ildfast sjamottstein','Betongtakstein'], 'Kristiania Teglverk produserte blant annet Sterk&Lett-stein, murstein, takstein og drensrør.',0],
    ['I hvilke etasjer lå tørkerommene i den bevarte teglverksbygningen?', 'Andre og tredje etasje', ['På grunnplanet sammen med ringovnen','Bare i tredje etasje','I en egen tørkelåve utenfor bygningen'], 'Ringovnen lå på grunnplanet, mens andre og tredje etasje hadde tørkerom for teglstein. Dette er dokumentert av teglverk.no.',0],
    ['Hvilken del av teglverksbygningen er knyttet til administrasjon rundt år 1900?', 'Teglfløyen mot nord', ['Tørkerommene i andre og tredje etasje','Ringovnen på grunnplanet','Kabelbanestasjonen ved leiruttaket'], 'Teglverk.no beskriver administrasjonsfløyen mot nord som en teglfløy fra omkring 1900, adskilt fra den eldre trekonstruksjonen over ringovnen.',0]
  ]
});
const norm=v=>String(v).normalize('NFKC').trim().toLowerCase();
const fail=s=>{throw new Error('Remaining Oslo quiz review: '+s);};
export function buildOsloSixRemainingFullquizReview() {
  const cardPack=buildOsloSixCardReview();
  const places=Object.entries(EXTRAS).map(([place_id, extras],index)=>{
    const base=cardPack.places.find(p=>p.place_id===place_id);
    const gate=GATE.places.find(p=>p.place_id===place_id);
    if(!base||!gate||gate.release_status!=='BLOCKED'||gate.geographical_anchor.status!=='HOLD')fail(place_id+' must be blocked');
    if(base.draft_cards.length!==10||extras.length!==11)fail(place_id+' needs 10+11');
    const initial=base.draft_cards.map((c,i)=>({
      id:place_id+'_review_quiz_'+String(i+1).padStart(2,'0'),targetId:place_id,categoryId:c.categoryId,
      question:c.question,answer:c.answer,answerIndex:c.answerIndex,options:c.options,knowledge:c.knowledge,
      source_trace:c.source_trace,source_url:(place_id==='saeterhytten_bygdoy' && i===7 ? SOURCE[place_id][1] : SOURCE[place_id][0]),quizcard_candidate_id:c.id,
      source_review:'pending_per_question_original_source_review',runtime_registered:false
    }));
    const additions=extras.map(([question,answer,others,knowledge,urlIndex],i)=>{
      if(!question||knowledge.length<70||others.length!==3||new Set([answer,...others].map(norm)).size!==4)
        fail(place_id+': invalid question '+(i+11));
      const answerIndex=(i+index+1)%4,options=others.slice();
      options.splice(answerIndex,0,answer);
      return {id:place_id+'_review_quiz_'+String(i+11).padStart(2,'0'),targetId:place_id,
        categoryId:place_id==='kristiania_teglverk_bryn'?'naeringsliv':'historie',
        question,answer,answerIndex,options,knowledge,source_trace:urlIndex===0?'primary_industry_or_heritage_source':'Oslo byleksikon',
        source_url:SOURCE[place_id][urlIndex],quizcard_candidate_id:null,
        source_review:'article_inspected_pending_independent_claim_signoff',runtime_registered:false};
    });
    const questions=initial.concat(additions);
    if(new Set(questions.map(q=>norm(q.question))).size!==21)fail(place_id+' repeated questions');
    const sets=[0,1,2].map(i=>({set_id:(place_id==='kristiania_teglverk_bryn'?'naeringsliv':'historie')+'_'+place_id+'_review_set_'+(i+1),
      order:i+1,level:i+1,questions:questions.slice(i*7,(i+1)*7)}));
    return {place_id,name:base.name,status:'EDITORIAL_SOURCE_REVIEW_NOT_V1',
      proposed_quiz_profile:'narrow_3x7_unconfirmed',sets,source_urls:SOURCE[place_id],
      quizcard_question_ids:questions.slice(0,10).map(q=>q.id),
      important_hold:place_id==='kristiania_teglverk_bryn'
       ? 'Do not create pin or radius: Nils Hansens vei 14/18 remains unresolved; do not imply interior access.'
       : 'Geographic public-access point not yet inspected',
      canonical_place_created:false,quiz_manifest_registered:false,knowledge_synced:false,browser_qa_passed:false};
  });
  return {schema:'history_go_oslo_six_remaining_fullquiz_review_v1',
    publication_status:'NOT_REGISTERED_NOT_PLAYABLE',places,
    caveat:'Not in runtime. 21 questions per place; editorial external claim review, source approval and entire Place release checklist remain required.'};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{
    const pack=buildOsloSixRemainingFullquizReview();
    if(process.argv.includes('--json'))process.stdout.write(JSON.stringify(pack,null,2)+'\n');
    else console.log('Oslo six remaining: 2 staged narrow 3x7 fullquizzes, no registration');
  }catch(e){console.error(e);process.exitCode=1;}
}
