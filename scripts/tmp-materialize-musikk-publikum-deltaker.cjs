#!/usr/bin/env node
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const read=(rel)=>JSON.parse(fs.readFileSync(path.join(ROOT,rel),'utf8'));
const write=(rel,v)=>fs.writeFileSync(path.join(ROOT,rel),JSON.stringify(v,null,2)+'\n');
const assert=(c,m)=>{if(!c)throw new Error(m);};
const replaceExact=(rel,pairs)=>{
  const full=path.join(ROOT,rel); let t=fs.readFileSync(full,'utf8');
  for(const [a,b] of pairs){const n=t.split(a).length-1;if(n!==1)throw new Error(rel+': expected one exact occurrence, got '+n+' for '+a);t=t.replace(a,b);}
  fs.writeFileSync(full,t);
};
const sourcePath="data/Civication/narratives/leisure/musikk_publikum_deltaker.json";
const worldPath="data/Civication/roleWorlds/musikk/musikk_publikum_deltaker.json";
const storyIds=["formatet_forst","plassen_du_tar","applausen_som_kommer_pa_et_annet_tidspunkt","bevegelsen_i_rommet","invitasjonen_til_a_delta","det_ukjente_uttrykket","vennegjengens_dom","tilgjengeligheten_i_rommet","prisen_som_blir_status","samtalen_som_vokser","a_ga_for_det_er_slutt","responsen_uten_fasit","den_lille_felleshandlingen","hva_slags_publikum_deltaker"];
const axisIds=["format_reading","shared_space","audience_norms","movement_boundary","invited_participation","openness","taste_independence","accessibility","access_cost","attention_norm","exit_autonomy","audience_response","participation_scope","audience_identity"];
const axisMeanings=["formatforståelse, lokal kode og situasjonslesing","delt fysisk rom, siktlinjer og hensyn","publikumsnormer, usikkerhet og ikke-gatekeeping","kroppslig respons, bevegelse og andres grenser","invitasjon til deltakelse uten sosial tvang","ukjent uttrykk, nysgjerrighet og utsatt dom","smak, gruppetrykk og selvstendig respons","tilgjengelighet, barrierer og praktisk hensyn","pris, tilgang og statuspress","oppmerksomhet, samtale og formatets forventning","frivillig deltakelse, avgang og personlige grenser","publikumsrespons uten lånt fagautoritet","medvirkning innenfor tydelig invitasjon uten rolleovergrep","publikumsidentitet uten profesjonell fullmakt"];
const source=read(sourcePath);
assert(source.id==='musikk_publikum_deltaker_stream','unexpected stream id');
assert(source.applies_when?.any_tags?.length===1&&source.applies_when.any_tags[0]==='musikk:publikum_deltaker','unexpected binding');
assert(source.storylets?.length===14,'expected 14 storylets');
assert(JSON.stringify(source.storylets.map(x=>x.id))===JSON.stringify(storyIds),'storylet order drift');

const index=read('data/Civication/roleWorlds/index.json');
assert(index.roles.length===195,'expected 195 Role Worlds');
assert(index.career_role_world_count===85,'expected 85 career worlds');
assert(index.life_position_role_world_count===110,'expected 110 life-position worlds');
assert(!index.roles.some(x=>x.life_position_key==='musikk/publikum_deltaker'),'already indexed');
assert(!fs.existsSync(path.join(ROOT,worldPath)),'world already exists');

const socialEnvironments=[
  'musikkrom der publikum først må lese format, lokale koder og graden av forventet stillhet eller aktivitet',
  'delte publikumsflater der kropp, plass, siktlinjer, lyd og bevegelse blir praktiske forhandlinger mellom mennesker',
  'situasjoner der vert eller utøver inviterer til avgrenset medvirkning uten at invitasjonen gir publikum profesjonell myndighet',
  'sosiale grupper der smak, status og kostnad kan presse deltakeren til å overdrive engasjement eller låne andres vurderinger',
  'arrangementer med konkrete tilgjengelighets- og oppmerksomhetsgrenser som påvirker hvem som faktisk kan delta',
  'etterprat og respons der egen erfaring er legitim uten å bli artist-, tekniker-, crew- eller arrangørfasit'
];
const people=[
  {id:'verten',social_function:'gjør format, invitasjon og praktiske rammer tydelige',class_position:'representant for arrangementets praktiske publikumskontakt',status:'kan formidle lokale regler og invitasjoner uten å definere publikums smak',power_over_player:'kan åpne eller avgrense deltakelse gjennom informasjon og rammer',wants:'at publikum forstår formatet og kan delta uten å forstyrre hverandre',conceals:'at tydelige husregler ikke alltid dekker alle kroppslige eller sosiale behov',speech_style:'rolig, konkret og situasjonsorientert',teaches_player:'å lese invitasjon og praktisk ramme som faktisk rollegrense'},
  {id:'den_erfarne_publikummeren',social_function:'gjør uskrevne normer synlige uten å gjøre dem til statusprøve',class_position:'gjentakende publikummer med lokal erfaring',status:'sosialt erfaren, men uten formell myndighet',power_over_player:'kan normalisere eller skambelaste handlinger gjennom små reaksjoner',wants:'et rom som flyter uten mye friksjon',conceals:'at egen vane kan forveksles med universell regel',speech_style:'lavmælt, normbevisst og ofte sikker',teaches_player:'å lære lokale koder uten å bruke dem til gatekeeping'},
  {id:'vennen_med_sterk_smak',social_function:'gjør gruppetrykk og identitet rundt smak konkret',class_position:'sosial nærperson i samme publikum',status:'har ingen faglig eller institusjonell autoritet',power_over_player:'kan påvirke hvordan spilleren omtaler og husker opplevelsen',wants:'en tydelig felles reaksjon som bekrefter gruppens smak',conceals:'at egen dom også formes av forventning og sosial posisjon',speech_style:'rask, kategorisk og entusiastisk eller avvisende',teaches_player:'å skille sosial tilhørighet fra egen publikumsrespons'},
  {id:'den_som_trenger_mer_plass',social_function:'gjør tilgjengelighet og delt rom konkret',class_position:'medpublikummer med et annet praktisk behov i rommet',status:'likeverdig deltaker uten særskilt arrangørmyndighet',power_over_player:'kan synliggjøre konsekvensen av spillerens bruk av plass eller lyd',wants:'å kunne være til stede uten unødige barrierer',conceals:'at behov ikke alltid er synlige før en situasjon oppstår',speech_style:'konkret, høflig og situasjonsnær',teaches_player:'at hensyn kan være del av publikumspraksis uten at man må kjenne hele livshistorien'},
  {id:'den_inviterende_utoveren',social_function:'gjør forskjellen mellom publikumsmedvirkning og profesjonell utøverrolle synlig',class_position:'utøver eller kunstner som leder en avgrenset publikumsrespons',status:'har kunstnerisk mandat i situasjonen, ikke mandat til å tvinge publikum',power_over_player:'kan åpne for felles handling gjennom en tydelig invitasjon',wants:'at medvirkningen støtter verket uten å bli kaotisk',conceals:'at scenens energi kan få en frivillig invitasjon til å oppleves som sosial plikt',speech_style:'åpen, rytmisk og inkluderende',teaches_player:'å delta aktivt uten å forveksle medvirkning med profesjonell rolle'},
  {id:'den_nysgjerrige_nybegynneren',social_function:'gjør usikkerhet og læring i publikum legitimt',class_position:'person med lite erfaring fra akkurat denne musikkformen',status:'fullverdig publikummer uten krav om forkunnskap',power_over_player:'kan speile hvordan miljøet behandler mennesker som ikke kjenner kodene',wants:'å forstå nok til å delta uten å bli ydmyket',conceals:'at usikkerhet ofte skjules for å unngå statusfall',speech_style:'spørrende, forsiktig og konkret',teaches_player:'at publikumsfellesskap kan utvides uten kunnskapstester'}
];
const slowAxes=axisIds.map((id,i)=>({id,meaning:axisMeanings[i],runtime_binding:'editorial_only_until_governed'}));
const phases=['morning','lunch','afternoon','evening'];
const phaseType={morning:'info',lunch:'conversation',afternoon:'decision',evening:'private_consequence'};
const phaseText={
 morning:'Morgenen gjør format, norm eller praktisk premiss synlig før deltakelsen får form.',
 lunch:'Midt på dagen møter spilleren andre deltakere eller vertskap som gjør rommets sosiale konsekvenser konkrete.',
 afternoon:'Ettermiddagen krever et konkret valg om plass, deltakelse, smak, hensyn eller rollegrense.',
 evening:'Kvelden viser hva valget gjør med tilhørighet, stress, tillit eller lysten til å delta igjen.'
};
const coverage=[];
for(let i=0;i<14;i++){const s=source.storylets[i];for(const phase of phases)coverage.push({day:i+1,phase,beat_type:phaseType[phase],summary:'Dag '+(i+1)+': '+s.subject+'. '+phaseText[phase],thread_ids:[axisIds[i]],materialization_refs:[sourcePath+'#'+s.id]});}
const beatRef=(d,p)=>d+'/'+p;
const primaryThreads=axisIds.map((id,i)=>{const d=i+1;const refs=d<14?[beatRef(d,'morning'),beatRef(d,'lunch'),beatRef(d,'afternoon'),beatRef(d,'evening'),beatRef(d+1,'morning'),beatRef(d+1,'lunch')]:[beatRef(13,'afternoon'),beatRef(13,'evening'),beatRef(14,'morning'),beatRef(14,'lunch'),beatRef(14,'afternoon'),beatRef(14,'evening')];return{id,relationship:axisMeanings[i],beat_refs:refs};});
const refs=storyIds.map(id=>sourcePath+'#'+id);
const world={
 schema:'civication_role_world_v1',version:1,category:'musikk',role_scope:'musikk_publikum_deltaker',subject_type:'life_position',
 life_position_ref:{badge_id:'musikk',id:'publikum_deltaker',label:'Publikum / deltaker'},title:'Publikum / deltaker',status:'role_world_complete',
 sociological_core:{
   main_problem:'å delta i musikkoffentligheten på tvers av ulike formater og rom uten at smak, status, sosialt press eller lang publikumserfaring blir forvekslet med artist-, crew-, arrangør- eller fagmyndighet',
   description:'Publikum / deltaker er en employment-independent audience_participation-praksis for formatlesing, delt rom, uskrevne normer, bevegelse, frivillig medvirkning, ukjent uttrykk, smakspress, tilgjengelighet, kostnad, oppmerksomhet, exit-autonomi, publikumsrespons og tydelige grenser for medvirkning. Rollen er bredere og enklere enn Konsertgjenger, som modellerer gjentatt live-konsertpraksis og konsertspesifikke situasjoner, og forskjellig fra Scenehenger, som modellerer sosial tilhørighet rundt scener og nettverk. Den gir ingen artiststatus, utøverrolle, crewansvar, arrangørmyndighet, bookingmakt, jobb eller lønn. Ingen ny runtime introduseres.'
 },
 theme_ids:['public_attention','social_mask','status_anxiety','shame_reputation','care_vs_efficiency','class_power','consumption','public_private_leakage'],
 social_environments:socialEnvironments,recurring_people_archetypes:people,slow_axes:slowAxes,
 season:{days:14,day_phases:phases,coverage},primary_threads:primaryThreads,
 private_aftermath:[
  {id:'rommet_blir_delt',description:'Spilleren lærer å lese format og plass som felles infrastruktur fremfor personlig rettighet.',materialization_refs:[refs[0],refs[1],refs[9]]},
  {id:'normen_blir_ikke_en_test',description:'Uskrevne koder kan læres uten at usikkerhet eller annerledes respons blir gjort til statusfall.',materialization_refs:[refs[2],refs[5]]},
  {id:'deltakelse_blir_frivillig',description:'Invitert medvirkning kan være aktiv og meningsfull uten sosial tvang eller profesjonell rolleoverføring.',materialization_refs:[refs[4],refs[12]]},
  {id:'tilgang_blir_del_av_praksisen',description:'Pris, kropp og praktisk tilgjengelighet behandles som reelle forhold for hvem som kan delta.',materialization_refs:[refs[7],refs[8],refs[10]]},
  {id:'respons_blir_egen_uten_a_bli_fasit',description:'Spilleren kan eie sin opplevelse og smak uten å låne faglig eller institusjonell autoritet.',materialization_refs:[refs[6],refs[11],refs[13]]}
 ],
 delayed_consequences:[
  {id:'formatet_moter_normen',setup_ref:'1/afternoon',return_ref:'3/evening',domains:['relationship','narrative']},
  {id:'plassen_moter_bevegelsen',setup_ref:'2/afternoon',return_ref:'4/evening',domains:['relationship','stress']},
  {id:'invitasjonen_moter_tilgjengeligheten',setup_ref:'5/afternoon',return_ref:'8/evening',domains:['relationship','narrative']},
  {id:'smaken_moter_prisen',setup_ref:'7/afternoon',return_ref:'9/evening',domains:['financial','reputation']},
  {id:'oppmerksomheten_moter_exit',setup_ref:'10/afternoon',return_ref:'11/evening',domains:['stress','relationship']},
  {id:'responsen_moter_rollegrensen',setup_ref:'12/afternoon',return_ref:'14/evening',domains:['reputation','narrative']}
 ],
 materialization:{no_new_runtime:true,source_refs:refs}
};
write(worldPath,world);

index.roles.push({category:'musikk',role_scope:'musikk_publikum_deltaker',subject_type:'life_position',life_position_ref:{badge_id:'musikk',id:'publikum_deltaker',label:'Publikum / deltaker'},status:'role_world_complete',path:worldPath,life_position_key:'musikk/publikum_deltaker'});
index.status='196_role_worlds_materialized';index.summary.role_worlds_total=196;index.summary.life_position_role_worlds=111;index.life_position_role_world_count=111;write('data/Civication/roleWorlds/index.json',index);

const checklist=read('data/Civication/roleWorldAuthoringChecklist.json');
assert(Array.isArray(checklist.reference_worlds)&&checklist.reference_worlds.length===195,'expected 195 checklist worlds');
assert(!checklist.reference_worlds.includes(worldPath),'already in checklist');checklist.reference_worlds.push(worldPath);write('data/Civication/roleWorldAuthoringChecklist.json',checklist);

const policy=read('data/Civication/roleWorldPolicy.json');
assert(policy.noncareer_subject_boundary?.life_position_readiness?.completed_life_position_role_worlds===110,'expected policy 110');
policy.noncareer_subject_boundary.life_position_readiness.completed_life_position_role_worlds=111;write('data/Civication/roleWorldPolicy.json',policy);

const taxonomy=read('data/Civication/nonCareerRoleTaxonomy.json');
assert(taxonomy.canonical_counts.unique_badge_scoped_life_positions===194,'selectable count must remain 194');
assert(taxonomy.canonical_counts.life_position_role_worlds===110&&taxonomy.canonical_counts.total_role_worlds===195,'unexpected taxonomy counts');
taxonomy.canonical_counts.life_position_role_worlds=111;taxonomy.canonical_counts.total_role_worlds=196;
assert(Array.isArray(taxonomy.role_world_rollout_boundary.completed_life_position_role_worlds),'missing completion list');
assert(!taxonomy.role_world_rollout_boundary.completed_life_position_role_worlds.includes('musikk/publikum_deltaker'),'already complete');
taxonomy.role_world_rollout_boundary.completed_life_position_role_worlds.push('musikk/publikum_deltaker');
taxonomy.role_world_rollout_boundary.next_source_backed_candidate=null;write('data/Civication/nonCareerRoleTaxonomy.json',taxonomy);

const themes=read('data/Civication/roleWorldThemeBank.json');
assert(!themes.reference_profiles['musikk/musikk_publikum_deltaker'],'theme profile already exists');
themes.reference_profiles['musikk/musikk_publikum_deltaker']=world.theme_ids;write('data/Civication/roleWorldThemeBank.json',themes);

replaceExact('tests/civication-life-position-role-world-readiness.test.js',[
 ['  ready: 110,\n  needs_authored_depth: 49,','  ready: 111,\n  needs_authored_depth: 48,'],
 ['assert.equal(audit.summary.completed_life_position_role_worlds, 110);','assert.equal(audit.summary.completed_life_position_role_worlds, 111);'],
 ['assert.equal(audit.summary.positions_with_exact_governed_sources, 110);','assert.equal(audit.summary.positions_with_exact_governed_sources, 111);'],
 ['assert.equal(audit.summary.positions_with_multi_scene_narrative_foundation, 110);','assert.equal(audit.summary.positions_with_multi_scene_narrative_foundation, 111);']
]);
replaceExact('tests/civication-role-world-contract.test.js',[
 ['assert.equal(index.life_position_role_world_count, 110);','assert.equal(index.life_position_role_world_count, 111);'],
 ['assert.equal(index.roles.length, 195);','assert.equal(index.roles.length, 196);']
]);
replaceExact('tests/civication-noncareer-role-taxonomy.test.js',[
 ["assert.equal(roleWorldIndex.roles.length, 195, 'Role World-indeksen skal ha 85 karriereverdener + 110 life-position worlds');","assert.equal(roleWorldIndex.roles.length, 196, 'Role World-indeksen skal ha 85 karriereverdener + 111 life-position worlds');"],
 ["assert.equal(lifePositionWorlds.length, 110, '110 canonical life-position worlds skal være materialisert, inkludert Poet, Skald, Skribent, Bidragsyter, Følger, Frilansjournalist, Kommentator (felt), Media/Leser og Plateartist');","assert.equal(lifePositionWorlds.length, 111, '111 canonical life-position worlds skal være materialisert, inkludert Poet, Skald, Skribent, Bidragsyter, Følger, Frilansjournalist, Kommentator (felt), Media/Leser, Plateartist og Publikum / deltaker');"],
 ["assert.deepEqual(roleWorldIndex.summary, { role_worlds_total: 195, career_role_worlds: 85, life_position_role_worlds: 110 });","assert.deepEqual(roleWorldIndex.summary, { role_worlds_total: 196, career_role_worlds: 85, life_position_role_worlds: 111 });"],
 ['  life_position_role_worlds: 110,\n  total_role_worlds: 195,','  life_position_role_worlds: 111,\n  total_role_worlds: 196,'],
 ['85 career Role Worlds + 110 life-position worlds','85 career Role Worlds + 111 life-position worlds']
]);
console.log('Temporary Publikum deltaker materializer prepared canonical 196/111 state.');
