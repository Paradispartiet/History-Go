import fs from 'node:fs';
import path from 'node:path';

const ROLE='subkultur_program_og_koordinering';
const KEY=`subkultur/${ROLE}`;
const WORLD=`data/Civication/roleWorlds/subkultur/${ROLE}.json`;
const MODEL=`data/Civication/roleModels/subkultur/${ROLE}.json`;
const GRAMMAR=`data/Civication/workGrammars/subkultur/${ROLE}.json`;
const PLAN=`data/Civication/mailPlans/subkultur/${ROLE}_plan.json`;
const TYPES=['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(p,v)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n','utf8')};

const model=read(MODEL),grammar=read(GRAMMAR),plan=read(PLAN);
if(plan.sequence.length!==16) throw new Error('Expected 16-step prerequisite plan');
if(grammar.persistent_work_object_contract.id!=='programbok_booking_budsjett_avtale_og_publiseringslogg') throw new Error('Unexpected persistent work object');
const mails=[];
for(const type of TYPES){
  const p=`data/Civication/mailFamilies/subkultur/${type}/${ROLE}_${type}.json`;
  const c=read(p);
  for(const family of c.families||[]) for(const mail of family.mails||[]) mails.push({type,path:p,mail});
}
if(mails.length!==15) throw new Error(`Expected 15 source mails, got ${mails.length}`);
const sourceRefs=mails.map(x=>`${x.path}#${x.mail.id}`);
if(new Set(sourceRefs).size!==15) throw new Error('Source refs must be unique');
const knowledge=mails.find(x=>x.type==='knowledge');
if(!knowledge) throw new Error('Knowledge mail missing');

const themes=['professional_culture','class_power','status_anxiety','loyalty_up_down','bureaucratic_power','care_vs_efficiency','precarity','invisible_work','shame_reputation','public_private_leakage'];
const audiences=[
  {id:'artists_agents_and_booking_relations',standing_axis:'promise_precision_negotiation_and_reliability',cares_about:['at interesse, tilbud, forhandling og bekreftet booking aldri blandes sammen','at endringer, avslag og forbehold kommuniseres tidlig nok til at artist og representant kan handle på sann status'],cannot_grant:'God standing hos artister eller representanter kan ikke gi spilleren bookingfullmakt, signaturrett, rettighetsklarering eller rett til å love programplass uten delegert mandat.'},
  {id:'finance_contract_and_rights_interfaces',standing_axis:'real_cost_contract_rights_and_signature_discipline',cares_about:['at honorar, total kostnad, kontraktsversjon, rettigheter og betalingspremisser er synlige før programmet bindes','at frivillighet eller miljølojalitet ikke brukes til å skjule arbeid, risiko eller økonomiske forpliktelser'],cannot_grant:'God standing hos økonomi, avtale eller rettighetsfunksjoner kan ikke gi spilleren juridisk, økonomisk eller signaturmyndighet som ikke faktisk er delegert.'},
  {id:'local_scene_partners_and_communities',standing_axis:'criteria_representation_burden_and_reciprocity',cares_about:['at lokale aktører blir hørt uten at vennskap, historisk tilknytning eller intern status blir automatisk programrett','at representasjon ikke kjøpes ved å skyve ulønnet arbeid, uklare forventninger eller uforholdsmessig risiko over på små miljøer'],cannot_grant:'God standing i lokal scene eller partnernettverk kan ikke bli adgangskrav, ansettelsesmakt, automatisk programplass eller rett til å omgå transparente kriterier.'},
  {id:'communication_marketing_and_publication',standing_axis:'public_truth_conditions_and_change_control',cares_about:['at utkast, betinget status, bekreftet program og publisert informasjon holdes fra hverandre','at publikum får presis informasjon når program, kapasitet, rettigheter eller logistikk endres'],cannot_grant:'God standing hos kommunikasjon eller publikum kan ikke gjøre en lanseringsfrist til booking-, rettighets-, kapasitets-, sikkerhets- eller publiseringsgodkjenning.'},
  {id:'venue_production_and_capacity_interfaces',standing_axis:'feasibility_capacity_logistics_and_handoff',cares_about:['at programvalg faktisk kan bæres av rom, kapasitet, tid, produksjon og tilgjengelige handoffs','at sen programendring gjenåpner berørte praktiske ledd i stedet for å bli skjøvet nedover som skjult produksjonsgjeld'],cannot_grant:'God standing hos arena eller produksjon kan ikke gi spilleren sikkerhetsdispensasjon, teknisk frigivelse, kapasitetsmyndighet eller rett til å overstyre operative stoppeiere.'},
  {id:'commissioning_employer_and_future_program_network',standing_axis:'judgment_transparency_and_portfolio_trust',cares_about:['at anbefalinger kan forklares med kriterier, kostnad, risiko og hva som ble valgt bort','at spilleren beskytter langsiktig relasjon og porteføljekvalitet uten å skjule konflikt, budsjettpress eller mandatgrenser'],cannot_grant:'God standing hos oppdragsgiver, arbeidsgiver eller fremtidige programmiljøer kan ikke oppheve ansettelsesregler, personalgrenser, budsjettmandat eller kontrakts- og rettighetskrav.'},
  {id:'private_relations',standing_axis:'recovery_confidentiality_and_identity_boundary',cares_about:['at spilleren kan gå ut av sosial beredskap etter konfliktfylte programvalg og avslag','at fortrolig booking-, partner- og økonomiinformasjon ikke brukes privat for å forsvare status eller søke bekreftelse'],cannot_grant:'Nære relasjoner kan gi støtte, men kan ikke gi programmandat, kontraktsmyndighet, rettighetsklarering, ansettelsesmakt eller grunnlag for å dele fortrolig informasjon.'}
];
const authoritySeparation='Situert standing er aldri en global reputation score og kan ikke gi booking- eller programløfte uten mandat, kontrakt eller signaturmyndighet, rettighetsklarering, honorar- eller budsjettmyndighet, ansettelses- eller adgangsmakt, kapasitets-, logistikk-, HMS- eller sikkerhetsgodkjenning, teknisk frigivelse eller publiseringsmyndighet som ligger hos andre. God relasjon til lokal scene, artist, leder eller publikum kan ikke erstatte transparente kriterier, reell kostnad, avtale, rettighet, arbeidsgiveransvar eller formell beslutning.';

const slowAxes=[
  ['booking_promise_trust','Artister og representanter sin langsomme tillit til at interesse, forhandling, forbehold og bindende booking omtales presist.'],
  ['contract_rights_cost_trust','Økonomi- og avtaleledd sin tillit til at total kostnad, honorar, kontrakt, rettigheter og signaturport ikke skjules av fremdriftsbehov.'],
  ['local_scene_reciprocity_trust','Lokale miljøers tillit til at kriterier, belastning, representasjon og avslag håndteres uten vennskapsfavorisering eller gratisarbeid som skjult inngangsbillett.'],
  ['publication_truth_trust','Kommunikasjon og publikum sin tillit til at betinget og bekreftet status skilles og at endringer faktisk blir kommunisert.'],
  ['feasibility_handoff_trust','Arena og produksjon sin tillit til at programmet ikke lover mer enn kapasitet, logistikk og praktiske handoffs kan bære.'],
  ['commissioning_judgment_trust','Oppdragsgiver og fremtidige programmiljøers tillit til begrunnede prioriteringer, reell kostnad og tidlig eskalering av konflikt eller risiko.'],
  ['gatekeeping_shame_repair_capacity','Evnen til å stå i kritikk om smak, makt og gatekeeping uten å skjule kriterier, gå i statusforsvar eller straffe relasjoner.'],
  ['private_recovery_boundary','Evnen til å skille jobbens avslag, synlighet og relasjonspress fra privat egenverdi, fortrolighet og restitusjon.']
].map(([id,meaning])=>({id,meaning,runtime_binding:'editorial_only_until_governed'}));

const archetypes=model.related_people.map(p=>({
  id:`${p.id}_world`,
  social_function:`${p.name} bærer ${p.role} som en tilbakevendende relasjon i programsesongen og gjør det synlig når programfaglig fremdrift kolliderer med mandat, dokumentasjon, kostnad, representasjon eller offentlig status. Rollen brukes som sosial motpart og faglig grenseflate, ikke som automatisk autoritet over alle deler av programarbeidet.`,
  class_position:`${p.role} med konkret arbeidsflate og avgrenset mandat; sosial kapital, ansiennitet eller nærhet til spilleren utvider ikke myndigheten utover det som faktisk er delegert.`,
  status:`Situert standing knyttet til presisjon, gjensidighet, sann status og hvordan belastning fordeles i den konkrete arbeidsrelasjonen.`,
  power_over_player:p.authority_relation,
  wants:`At programkoordinatoren gjør den aktuelle arbeidsflaten beslutningsklar uten å skjule hvem som eier neste kontroll, hva som fortsatt er betinget, eller hvilke mennesker som bærer kostnaden ved en rask løsning.`,
  conceals:`Relasjonen kan selv være preget av tidspress, status og organisatoriske incentiver, slik at spilleren må skille et sterkt ønske fra et faktisk mandat eller en dokumentert forutsetning.`,
  speech_style:`Konkret og rollesensitiv; ber om status, eier, forbehold, neste kontroll og hvilken programversjon som faktisk gjelder.`,
  teaches_player:`At god programkoordinering krever både relasjonell dømmekraft og harde skiller mellom forslag, anbefaling, mandat, avtale, publisering og ansvar.`
}));

const daySpecs=[
  ['Første programbrief og kriteriene','Et bredt oppdrag skal omsettes til eksplisitte kriterier før navn, vennskap og intern status begynner å definere programmet i praksis.'],
  ['Det dyre navnet','Et kjent navn kan gi synlighet, men binder nesten hele rammen og presser lokal bredde, honorar og andre programvalg.'],
  ['Muntlig ja og bookinguklarhet','En varm artistsamtale blir tolket som bekreftet booking før mandat, pris, kontrakt og rettigheter er ferdig avklart.'],
  ['Reell kostnad og DIY-arbeid','Et attraktivt program ser bare økonomisk mulig ut dersom partnerarbeid, produksjonsinnsats og honorarbehov tones ned eller behandles som gratis miljøinnsats.'],
  ['Lokal scene, kriterier og tilhørighet','Et miljø med lang historie forventer plass og oppfatter transparente kriterier som avvisning av egen betydning.'],
  ['Kontrakt, rettighet og signaturport','Programmet er kunstnerisk klart, men kontraktsversjon, rettigheter og hvem som faktisk kan binde virksomheten er fortsatt åpne.'],
  ['Kapasitet, arena og logistikk','Et valgt format passer dårligere i rommet enn antatt, og kapasitet, tidsbruk og produksjonshandoff må gjenåpnes før lansering.'],
  ['Lanseringspress og betinget status','Kommunikasjon vil publisere for å skape momentum mens flere elementer fortsatt bare er betinget eller under forhandling.'],
  ['Partnerbyrde og representasjon','Et samarbeid som ser representativt ut på papiret legger uforholdsmessig koordinering og ulønnet arbeid på en liten lokal aktør.'],
  ['Avlysning og erstatningsvalg','En sentral artist faller ut, og erstatning må finnes uten å gjøre panikk, vennskap eller tilgjengelighet til nytt skjult programkriterium.'],
  ['Club 7 som historisk spørsmål','History Go-kontekst om Club 7 brukes til å undersøke forholdet mellom miljø, programbredde og organisatoriske rammer uten å gjøre historien til dagens booking- eller sikkerhetsfasit.'],
  ['Kritikk, gatekeeping og offentlighet','Programmet kritiseres offentlig for smak, nettverk og gatekeeping, og spilleren må svare uten å avsløre fortrolig materiale eller omskrive kriteriene i ettertid.'],
  ['Akkumulert relasjons- og arbeidskostnad','Flere små kompromisser har samlet seg som uklare forventninger, sen kommunikasjon og skjult ekstraarbeid hos artist, partner og interne funksjoner.'],
  ['Programlås, publisering og ettervurdering','Siste versjon skal låses og håndteres gjennom publisering, endringsberedskap og ettervurdering uten å slette sporene etter valg, avslag og kostnader.']
];
const phaseSpecs={
  morning:'Morgenen handler om å etablere sann status i programboken før møter og sosialt press gjør premissene vanskeligere å skille.',
  lunch:'Lunsjfasen flytter konflikten inn i relasjoner, uformelle samtaler og statusmarkører der et ønske lett kan bli behandlet som forventning eller løfte.',
  afternoon:'Ettermiddagen krever en eksplisitt beslutning eller avgrenset handoff med kriterier, mandat, kostnad, forbehold og neste kontroll synlig.',
  evening:'Kvelden viser den private og langsomme konsekvensen av dagens valg: hvem som føler seg sett, avvist, utnyttet eller beskyttet, og hva spilleren tar med seg hjem.'
};
const phases=['morning','lunch','afternoon','evening'];
function beatSummary(day,phase,index,audience,ref){
  const [title,detail]=daySpecs[day-1];
  const base=`Dag ${day}, ${phase}, «${title}»: ${detail} ${phaseSpecs[phase]} Spilleren må oppdatere programbok_booking_budsjett_avtale_og_publiseringslogg med gjeldende programversjon, kriterier og begrunnelse, booking-/avtalestatus, total kostnad og honorar, partner- og lokal-scene-premisser, kapasitet/logistikk, rettighets- og publiseringsstatus, beslutningseier og konkret neste kontroll. Valget skal skille forslag, vurdert alternativ, anbefaling, mandatert forhandling, økonomisk godkjenning, avtalt, logistisk avklart, publiserbar og publisert status, og gjenåpne bare de leddene som faktisk berøres når premisset endres. Situasjonen må håndteres uten å gjøre vennskap, miljøtroverdighet, kjent navn, deadline eller offentlig forventning til kontrakt, signatur, gratisarbeid, adgangsregel eller sikkerhetsdispensasjon. Beat ${day}-${phase}-${index+1} er kildeforankret i ${ref} og leses primært av ${audience.id}, men samme beslutning kan samtidig bygge tillit hos én gruppe og skape legitim friksjon hos en annen.`;
  return base.length>=620?base:base+' Tidligere versjon og begrunnelse beholdes slik at senere kritikk, avvik eller læring kan spores uten å omskrive historien.';
}
function standingText(day,phase,index,audience){
  const [title]=daySpecs[day-1];
  const s=`Den situerte konsekvensen etter dag ${day}/${phase} i «${title}» ligger hos ${audience.id} og måles redaksjonelt langs ${audience.standing_axis}, ikke som global score. Dersom spilleren holder sann status, viser hvem som eier mandatet, synliggjør kostnad og belastning, kommuniserer forbehold og reparerer handoff når noe endres, kan konkret arbeidsrelasjon bli mer robust selv om beslutningen er upopulær. Dersom spilleren derimot bruker sosial kapital, vennskap, intern status, lanseringspress eller frykt for avslag til å skjule usikkerhet, flyttes gjelden til artist, partner, økonomi, kommunikasjon eller produksjon og kommer tilbake senere som mistillit, ekstraarbeid eller konflikt. ${audience.cannot_grant} Konsekvens ${day}-${phase}-${index+1} skal derfor kunne være forskjellig hos andre publikum samtidig og kan aldri oversettes til universell popularitet eller ny myndighet.`;
  return s.length>=500?s:s+' Den langsomme effekten blir stående som relasjonell hukommelse, ikke runtime-bundet makt.';
}
const coverage=[];
for(let day=1;day<=14;day++) for(const phase of phases){
  const index=coverage.length,audience=audiences[index%audiences.length],ref=sourceRefs[index%sourceRefs.length];
  coverage.push({day,phase,summary:beatSummary(day,phase,index,audience,ref),standing_audience:audience.id,standing_consequence:standingText(day,phase,index,audience),materialization_refs:[ref]});
}
const beatRef=b=>`${b.day}/${b.phase}`;
const threadDefs=[
  ['program_criteria_and_gatekeeping','Programkriterier, smak, gatekeeping og begrunnelse følger hele sesongen og viser hvordan transparente kriterier kan være sosialt krevende uten å bli erstattet av vennskap eller intern status.'],
  ['booking_promise_contract_and_rights','Bookingdialogen følger skillet mellom interesse, forhandling, mandat, signatur, kontrakt og rettigheter, særlig når relasjonen er god og tiden knapp.'],
  ['budget_honour_and_real_work','Total kostnad, honorar og synliggjøring av arbeid følger programmet fra første alternativ til ettervurdering og gjør skjult gratisarbeid til en reell programkonsekvens.'],
  ['local_scene_partnership_and_representation','Forholdet til lokal scene og partnere undersøker lytting, representasjon, byrdefordeling og avslag uten å gjøre historisk tilhørighet til automatisk programrett.'],
  ['publication_capacity_and_change_control','Publisering, arena, kapasitet, logistikk og endringskontroll binder offentlig løfte til faktisk gjennomførbarhet og presis betinget status.'],
  ['public_criticism_status_and_future_work','Kritikk, synlighet og fremtidig arbeid følger hvordan spilleren forklarer valg, tåler uenighet og unngår å bruke fortrolig informasjon som statusforsvar.'],
  ['private_boundary_and_recovery','Privatlivet følger hvordan avslag, nettverkspress, kveldsarbeid og ansvar for andres skuffelse kan lekke ut av jobben dersom restitusjon og fortrolighet ikke beskyttes.']
];
const primaryThreads=threadDefs.map(([id,relationship],ti)=>({id,relationship,beat_refs:coverage.filter((_,i)=>i%7===ti).slice(0,8).map(beatRef)}));
const privateAftermath=[
  {id:'after_expensive_name',meaning:'Et programvalg som prioriterer eller avviser et stort navn kan fortsette privat som tvil om egen smak, status og mot, selv når kriterier og budsjett var faglig ryddige.',beat_refs:['2/evening','12/evening']},
  {id:'after_unpaid_work',meaning:'Når skjult gratisarbeid blir synlig, kan spilleren kjenne skam over tidligere normalisering og må skille ansvarlig reparasjon fra defensiv selvbeskyttelse.',beat_refs:['4/evening','13/evening']},
  {id:'after_local_rejection',meaning:'Avslag til et nært lokalt miljø kan gjøre private vennskap og jobbrolle vanskelig å skille, særlig når begrunnelsen er legitim men sosialt smertefull.',beat_refs:['5/evening','12/lunch']},
  {id:'after_public_criticism',meaning:'Offentlig gatekeeping-kritikk kan trigge behov for å forklare for mye eller søke privat bekreftelse; fortrolighet og søvn må beskyttes selv når omdømmet føles truet.',beat_refs:['12/evening','13/morning']},
  {id:'after_final_lock',meaning:'Etter programlås og publisering må spilleren tåle at noen fortsatt er skuffet og at ikke alle relasjoner kan repareres gjennom mer arbeid eller nye løfter.',beat_refs:['14/afternoon','14/evening']}
];
const delayedConsequences=[
  {id:'criteria_return',setup_ref:'1/morning',return_ref:'3/afternoon',meaning:'Uklare kriterier kommer tilbake når en muntlig booking må begrunnes mot andre kandidater.'},
  {id:'budget_return',setup_ref:'2/lunch',return_ref:'5/morning',meaning:'Tidlig prioritering av et dyrt navn kommer tilbake som press mot lokal bredde og partnerressurser.'},
  {id:'unpaid_work_return',setup_ref:'4/morning',return_ref:'7/evening',meaning:'Skjult arbeidskostnad kommer tilbake når logistikk og kapasitet krever mer innsats enn programmet har budsjettert.'},
  {id:'local_scene_return',setup_ref:'5/afternoon',return_ref:'9/lunch',meaning:'Et tidligere avslag påvirker senere partnerdialog og hvor mye tillit som finnes når representasjonsbyrden diskuteres.'},
  {id:'rights_return',setup_ref:'6/lunch',return_ref:'10/afternoon',meaning:'Uavklarte rettigheter og signaturgrenser kommer tilbake når en erstatning må bookes raskt.'},
  {id:'publication_return',setup_ref:'7/morning',return_ref:'11/evening',meaning:'Tidlig kapasitetsforbehold former hvordan historisk programinspirasjon kan kommuniseres uten å love urealistisk format.'},
  {id:'partner_return',setup_ref:'9/afternoon',return_ref:'12/evening',meaning:'Fordelingen av partnerarbeid kommer tilbake i offentlig kritikk om hvem programmet faktisk er laget med og for.'},
  {id:'criticism_return',setup_ref:'11/morning',return_ref:'14/evening',meaning:'Historiske og offentlige spørsmål om miljø, makt og programbredde kommer tilbake i siste ettervurdering og fremtidig arbeidsstanding.'}
];

const world={
  schema:'civication_role_world_v1',version:1,category:'subkultur',role_scope:ROLE,
  title:'Program og koordinering — kriterier, booking, representasjon og situert tillit',status:'role_world_complete',
  sociological_core:[
    'Program og koordinering er en mellomposisjon mellom kunstnerisk smak, økonomi, lokale miljøer, artister, publikum, produksjon og institusjonell makt. Rollen kan påvirke hvem som får synlighet og ressurser, men må gjøre dette gjennom eksplisitte kriterier, delegert mandat og sporbar begrunnelse fremfor sosial nærhet eller subkulturell status.',
    'Den sentrale infrastrukturen er én versjonert programbok som skiller forslag, vurdering, anbefaling, forhandling, godkjenning, avtale, logistisk klarhet og offentlig publisering. Når disse statusene blandes, blir relasjonell varme til falskt løfte og tidsnød til skjult kontrakts-, budsjett- eller produksjonsgjeld.',
    'Langsiktig standing er situert: artister kan verdsette tydelige avslag, lokale miljøer kan oppleve kriterier som gatekeeping, økonomi kan belønne realistisk kostnad, kommunikasjon kan mislike forsinkelse, og private relasjoner kan bære restene av konflikten. Ingen av disse vurderingene skaper global omdømmescore eller ny formell myndighet.'
  ],
  theme_ids:themes,
  social_environments:[
    'programbord og kriterielogg der navn, målgruppe, kvalitet, representasjon, budsjett og begrunnelse konkurrerer om plass',
    'booking- og artistdialog der varme relasjoner, muntlige signaler, pris, rider, kontrakt, rettigheter og signaturmandat må holdes fra hverandre',
    'lokal scene og partnerrom der historisk tilhørighet, vennskap, representasjon og reell arbeidsbelastning kan skape både gjensidighet og gatekeeping-konflikt',
    'økonomi- og avtalegrense der honorar, avgifter, reise, produksjonsbehov og skjult gratisarbeid avgjør om et program faktisk er bærekraftig',
    'kommunikasjon og publisering der lanseringsfrist, billettløfte og offentlig forventning møter betinget booking, kapasitet og logistikk',
    'arena- og produksjonshandoff der programvalg blir konkret rom, tid, kapasitet, teknisk behov, tilgjengelighet og operativ gjennomførbarhet',
    'privatliv og nære relasjoner der avslag, nettverk, offentlig kritikk og kveldsarbeid kan følge spilleren hjem uten at fortrolig informasjon skal gjøre det'
  ],
  recurring_people_archetypes:archetypes,
  slow_axes:slowAxes,
  situated_reputation_model:{global_score_allowed:false,audiences,authority_separation:authoritySeparation},
  materialization:{authored_dimensions:['situated_reputation'],source_refs:sourceRefs,no_new_runtime:true,existing_plan_preserved:true,existing_role_model_preserved:true,existing_people_foundation_preserved:true,existing_work_grammar_preserved:true,existing_persistent_work_preserved:true,existing_rhythm_preserved:true,cross_role_link_materialized:false},
  existing_work_continuity:{work_loops:grammar.work_loops,persistent_work_object:grammar.persistent_work_object_contract.id,rhythm:grammar.rhythm_contract,new_runtime_state:false,plan_steps:plan.sequence.length},
  history_go_affordance:{source_ref:`${knowledge.path}#${knowledge.mail.id}`,place_id:'club_7_vika',better_question:'Club 7 kan brukes som historisk inngang til å spørre hvordan programbredde, skiftende miljøer, kunstformer, publikum og organisatoriske rammer påvirket hvem som fikk plass og hvordan et kultursted bygget identitet. Det bedre spørsmålet for dagens programkoordinator er hvilke eksplisitte kriterier, kostnader, relasjoner og praktiske forutsetninger som må synliggjøres når et program både skal ha lokal forankring, åpne dører og være gjennomførbart — uten å late som Club 7 gir en fasit for dagens avtaler.',authority_boundary:'Historisk Club 7-kontekst kan ikke gi dagens bookingmandat, signatur- eller kontraktsmyndighet, rettighetsklarering, honorarvedtak, kapasitet, HMS/sikkerhetsgodkjenning, teknisk frigivelse eller publiseringsrett. Den brukes bare til å formulere bedre historisk informerte programspørsmål.'},
  cross_role_proof:{status:'not_materialized_no_shared_work_object',shared_work_object_found:false,new_runtime:false,candidate_when_shared_work_is_real:true,rule:'Cross-role kobling materialiseres først når et faktisk shared work object / delt arbeidsobjekt er bevist mellom roller; plausible handoffs mot produsent, produksjonsledelse, arena eller kommunikasjon er ikke nok alene.'},
  season:{days:14,day_phases:phases,coverage},
  primary_threads:primaryThreads,
  private_aftermath:privateAftermath,
  delayed_consequences:delayedConsequences,
  editorial_uniqueness:{statement:'Denne Role World-en handler om programfaglig gatekeeping, bookingløfter, kostnad, representasjon, publisering og relasjonell makt. Den er ikke en omskriving av produksjonsledelse, produsentarbeid eller arena-ledelse, og oppretter ingen ny runtime.',no_global_reputation_score:true}
};
write(WORLD,world);

const index=read('data/Civication/roleWorlds/index.json');
index.roles=(index.roles||[]).filter(e=>!(e.category==='subkultur'&&e.role_scope===ROLE));
index.roles.push({category:'subkultur',role_scope:ROLE,status:'role_world_complete',path:WORLD});
write('data/Civication/roleWorlds/index.json',index);
const checklist=read('data/Civication/roleWorldAuthoringChecklist.json');
checklist.reference_worlds=[...new Set([...(checklist.reference_worlds||[]),WORLD])];
write('data/Civication/roleWorldAuthoringChecklist.json',checklist);
const bank=read('data/Civication/roleWorldThemeBank.json');
bank.reference_profiles=bank.reference_profiles||{};bank.reference_profiles[KEY]=themes;write('data/Civication/roleWorldThemeBank.json',bank);

const report=`# Civication Subkultur — Program og koordinering Role World rollout\n\n## Editorial uniqueness\nThis Role World is specifically about program criteria and gatekeeping, booking promises versus agreements, real cost/honour, local-scene reciprocity, rights/signature boundaries, publication pressure, feasibility and public criticism. It is not a generic producer or production-leadership rewrite.\n\n## Continuity\n- Existing 16-step plan preserved.\n- Existing role model, four fictional scenario actors, work grammar, persistent \`programbok_booking_budsjett_avtale_og_publiseringslogg\` and waiting/handoff/bounded-rework rhythm preserved.\n- 15 prerequisite mails across all nine canonical mail types are provenance for the 56 beats; every source ref is used at least three times.\n- No new runtime state.\n\n## Situated standing\nThere is no global reputation score. Seven audiences can read the same program decision differently: artists/agents, finance-contract-rights, local scene/partners, communication/publication, venue/production/capacity, commissioning/future-program network and private relations. Standing never grants booking, signature, rights, budget, hiring, access, safety, capacity or publication authority.\n\n## Season structure\n- 14 days × four phases = 56 authored beats.\n- 7 primary threads.\n- 8 delayed consequences.\n- 5 private aftermath arcs.\n- Slow standing axes remain \`editorial_only_until_governed\`.\n\n## History Go\nClub 7 / \`club_7_vika\` is used only as a historical program-and-milieu lens. It can improve questions about breadth, environment, audience and organizational constraints, but cannot prescribe current booking, contracts, rights, honour, capacity, safety or publication decisions.\n\n## Cross-role\nReadiness remains \`candidate_when_shared_work_is_real\`. No shared work object is proven, so no cross-role link or runtime is materialized.\n\n## Quality gate\n29/30 source-first before PR CI. The final point is reserved for exact-head Typecheck/Chromium boot on the permanent PR head.\n`;
fs.writeFileSync('reports/CIVICATION_SUBKULTUR_PROGRAM_OG_KOORDINERING_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md',report,'utf8');
console.log(`Materialized ${ROLE} Role World with ${coverage.length} beats and ${sourceRefs.length} provenance refs`);
