#!/usr/bin/env node
'use strict';

const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const read=(rel)=>JSON.parse(fs.readFileSync(path.join(ROOT,rel),'utf8'));
const write=(rel,value)=>fs.writeFileSync(path.join(ROOT,rel),JSON.stringify(value,null,2)+'\n');
const assert=(cond,msg)=>{ if(!cond) throw new Error(msg); };
const replaceExact=(rel,pairs)=>{
  const full=path.join(ROOT,rel);
  let text=fs.readFileSync(full,'utf8');
  for(const [before,after] of pairs){
    const count=text.split(before).length-1;
    if(count!==1) throw new Error(rel+': expected one exact occurrence, got '+count+' for '+before);
    text=text.replace(before,after);
  }
  fs.writeFileSync(full,text);
};

const sourcePath="data/Civication/narratives/leisure/media_kommentator_felt.json";
const worldPath="data/Civication/roleWorlds/media/media_kommentator_felt.json";
const storyIds=["tesen_forst","grunnlaget_under_pastanden","innvendingen_som_treffer","usikkerheten_i_setningen","faggrensen","publikummet_som_horer_noe_annet","nar_tall_blir_fortelling","rollen_og_egen_interesse","den_gode_formuleringen_som_er_for_stor","samme_tema_pa_nytt","rettelsen_som_ma_synes","plattformen_belonner_sikkerhet","uenighet_med_en_alliert","hva_slags_feltkommentator"];
const axisIds=["thesis_scope","evidence_inference","counterargument_revision","uncertainty_marking","field_boundary","audience_interpretation","numbers_context","disclosure_interest","rhetoric_overclaim","continuity_update","correction_visibility","platform_pressure","social_independence","practice_authority"];
const axisMeanings=["tese, avgrensing og hva analysen faktisk hevder","dokumentert grunnlag, observasjon og egen slutning","sterke innvendinger, revisjon og intellektuell friksjon","usikkerhet, vurdering og tydelig påstandsstatus","feltkunnskap, faggrense og lånt autoritet","språk, publikum og utilsiktet sterkere mening","tall, periode, sammenligning og kontekst","egenposisjon, bindinger og synliggjøring av interesser","slagkraft, generalisering og overpåstand","historikk, gamle teser og oppdatering mot nytt materiale","premissfeil, synlig rettelse og endret konklusjon","formatpress, rekkevidde og tap av nødvendige forbehold","sosial lojalitet, uenighet og selvstendig vurdering","gjenkjennelse, praksis og grensen mot institusjonell myndighet"];

const source=read(sourcePath);
assert(source.id==='media_kommentator_felt_stream','unexpected stream id');
assert(source.applies_when?.any_tags?.length===1 && source.applies_when.any_tags[0]==='media:kommentator_felt','unexpected applies_when binding');
assert(source.storylets?.length===14,'expected 14 authored storylets');
assert(JSON.stringify(source.storylets.map(x=>x.id))===JSON.stringify(storyIds),'storylet id/order drift');

const index=read('data/Civication/roleWorlds/index.json');
assert(index.roles.length===192,'expected 192 Role Worlds before Kommentator felt');
assert(index.career_role_world_count===85,'expected 85 career Role Worlds');
assert(index.life_position_role_world_count===107,'expected 107 life-position Role Worlds');
assert(!index.roles.some(x=>x.life_position_key==='media/kommentator_felt'),'Kommentator felt already indexed');
assert(!fs.existsSync(path.join(ROOT,worldPath)),'Kommentator felt world already exists');

const socialEnvironments=[
  'egne notater og analyseutkast der en tese må avgrenses før den blir et offentlig standpunkt',
  'åpne publiseringsflater der feltanalyse møter et publikum uten at spilleren automatisk får redaksjonell plass eller stilling',
  'samtaler med mennesker som kan feltet bedre på delområder og som kan utfordre premisser, tall eller historikk',
  'arkiv-, rapport- og datagrunnlag der eldre påstander kan sammenlignes med nye forhold i stedet for bare å gjentas',
  'publikumsflater der respons, sitater og gjenfortellinger kan gjøre et forbehold svakere eller en konklusjon sterkere enn den var',
  'sosiale og faglige nettverk der lojalitet, egenposisjon og gjenkjennelse kan presse analysen i retning av identitet eller gruppe'
];

const people=[
  {
    id:'den_faglig_skarpe_motleseren',
    social_function:'tester premisser og gjør sterke innvendinger konkrete før analyse blir identitet',
    class_position:'person med relevant kunnskap på deler av feltet uten myndighet over spillerens rolle',
    status:'respektert motleser eller samtalepartner',
    power_over_player:'kan avdekke svake premisser og gjøre en offentlig feil vanskeligere å ignorere',
    wants:'at påstander avgrenses til det grunnlaget faktisk bærer',
    conceals:'at egen faglig sikkerhet også kan være preget av skole, miljø eller tidligere standpunkt',
    speech_style:'presis, kort og premissorientert',
    teaches_player:'å bruke sterk motstand som informasjon fremfor som sosial trussel'
  },
  {
    id:'den_tro_folgeren',
    social_function:'gjør gjenkjennelse, forventning og publikumslojalitet synlig',
    class_position:'publikummer som følger spillerens vurderinger over tid',
    status:'positiv og gjenkjennende uten profesjonell autoritet',
    power_over_player:'kan belønne konsistens og skarphet selv når nyanser burde endres',
    wants:'tydelige analyser som føles sammenhengende over tid',
    conceals:'at ønsket om konsistens kan gjøre reell revisjon mindre populær',
    speech_style:'støttende, refererende og rask til å sitere tidligere poenger',
    teaches_player:'å skille troverdig kontinuitet fra press om å mene det samme som før'
  },
  {
    id:'den_kritiske_leseren',
    social_function:'gjør misforståelse, språk og publikumsfortolkning konkret',
    class_position:'oppmerksom leser uten binding til spillerens miljø',
    status:'ingen formell makt, men høy offentlig friksjonsverdi når formuleringer er uklare',
    power_over_player:'kan vise hvordan et utsagn faktisk leses utenfra og spre en tolkning videre',
    wants:'at premisser, usikkerhet og konklusjon kan skilles fra hverandre',
    conceals:'at også kritisk lesning kan plukke ut den skarpeste formuleringen fremfor helheten',
    speech_style:'spørrende, direkte og tekstnær',
    teaches_player:'å behandle mottakelse som data uten å gjøre publikum til endelig dommer'
  },
  {
    id:'den_sosiale_allierte',
    social_function:'gjør lojalitet og gruppetilhørighet synlig når analysen skifter retning',
    class_position:'venn, kollega eller miljøkontakt som ofte deler spillerens utgangspunkt',
    status:'nær relasjon uten mandat over hva spilleren skal mene',
    power_over_player:'kan gjøre faglig uenighet til et sosialt kostnadsspørsmål',
    wants:'forutsigbar tilhørighet og en tydelig felles front',
    conceals:'at gruppelojalitet kan påvirke hvilke innvendinger som oppleves legitime',
    speech_style:'fortrolig, forventningsfull og noen ganger skuffet',
    teaches_player:'å holde sosial tilhørighet adskilt fra argumentets styrke'
  },
  {
    id:'den_som_inviterer_til_et_nytt_felt',
    social_function:'gjør faggrense og lånt autoritet synlig når synlighet åpner nye temaer',
    class_position:'arrangør, kanal eller bekjent som ønsker en tydelig stemme på et nærliggende område',
    status:'kan tilby oppmerksomhet, ikke kompetanse eller institusjonell myndighet',
    power_over_player:'kan friste spilleren til å uttale seg bredere enn grunnlaget tilsier',
    wants:'en rask, tydelig og gjenkjennelig vurdering',
    conceals:'at formatbehovet ofte belønner sikkerhet mer enn presis avgrensing',
    speech_style:'inviterende, tempoorientert og lite opptatt av nyanser i mandatet',
    teaches_player:'at synlighet i ett felt ikke automatisk kan overføres til et annet'
  },
  {
    id:'arkivstemmen',
    social_function:'gjør gamle analyser og tidligere premisser til noe spilleren må møte igjen',
    class_position:'egne tidligere tekster, notater og publiserte spor representert som vedvarende offentlig hukommelse',
    status:'ingen levende autoritet, men sterk dokumentarisk makt over påstander om kontinuitet',
    power_over_player:'kan avsløre at premisser, tall eller sikkerhet har endret seg siden sist',
    wants:'at historikken leses som faktisk spor fremfor som en fortelling spilleren omskriver fritt',
    conceals:'at eldre materiale mangler dagens kontekst og derfor ikke kan brukes mekanisk',
    speech_style:'ordrett, tidsstemplet og lite tilgivende for etterrasjonalisering',
    teaches_player:'å oppdatere analyse uten å late som tidligere standpunkt aldri fantes'
  }
];

const slowAxes=axisIds.map((id,i)=>({id,meaning:axisMeanings[i],runtime_binding:'editorial_only_until_governed'}));
const phases=['morning','lunch','afternoon','evening'];
const phaseType={morning:'info',lunch:'conversation',afternoon:'decision',evening:'private_consequence'};
const phaseText={
  morning:'Morgenen synliggjør premiss, materiale eller usikkerhet før dagens vurdering får form.',
  lunch:'Midt på dagen møter analysen en leser, fagperson, alliert eller invitasjon som gjør forventninger og friksjon konkrete.',
  afternoon:'Ettermiddagen krever et konkret valg om avgrensing, belegg, språk, åpenhet eller revisjon.',
  evening:'Kvelden viser hva valget gjør med tillit, identitet, relasjon, omdømme eller neste analyse.'
};
const coverage=[];
for(let i=0;i<14;i++){
  const s=source.storylets[i];
  for(const phase of phases){
    coverage.push({
      day:i+1,
      phase,
      beat_type:phaseType[phase],
      summary:'Dag '+(i+1)+': '+s.subject+'. '+phaseText[phase],
      thread_ids:[axisIds[i]],
      materialization_refs:[sourcePath+'#'+s.id]
    });
  }
}
const beatRef=(d,p)=>d+'/'+p;
const primaryThreads=axisIds.map((id,i)=>{
  const day=i+1;
  const refs=day<14
    ? [beatRef(day,'morning'),beatRef(day,'lunch'),beatRef(day,'afternoon'),beatRef(day,'evening'),beatRef(day+1,'morning'),beatRef(day+1,'lunch')]
    : [beatRef(13,'afternoon'),beatRef(13,'evening'),beatRef(14,'morning'),beatRef(14,'lunch'),beatRef(14,'afternoon'),beatRef(14,'evening')];
  return {id,relationship:axisMeanings[i],beat_refs:refs};
});
const refs=storyIds.map(id=>sourcePath+'#'+id);
const world={
  schema:'civication_role_world_v1',
  version:1,
  category:'media',
  role_scope:'media_kommentator_felt',
  subject_type:'life_position',
  life_position_ref:{badge_id:'media',id:'kommentator_felt',label:'Kommentator (felt)'},
  title:'Kommentator (felt)',
  status:'role_world_complete',
  sociological_core:{
    main_problem:'å tolke og forklare et avgrenset felt offentlig over tid uten at gjenkjennelse, retorisk sikkerhet eller hyppig publisering blir forvekslet med ekspertstatus, journalistisk stilling eller institusjonell myndighet',
    description:'Kommentator (felt) er en employment-independent commentary_practice for teser, dokumentasjon, innvendinger, usikkerhet, faggrense, publikumstolkning, tallkontekst, egenposisjon, retorisk overdrivelse, historisk oppdatering, synlig rettelse, formatpress, sosial uavhengighet og praksisgrense. Rollen er tydelig forskjellig fra Kommentarfeltveteran, som modellerer deltakelse i offentlige kommentarfelt, fra Bidragsyter, som leverer avgrenset materiale til en publisering, fra Medievaktbikkje, som gransker medienes framing og kildebruk, og fra Debattant, som er et reputation/status-lag. Badge-statusen gir ingen jobb, lønn, spalteplass, ekspertakkreditering, redaksjonell myndighet eller moderatorrolle. Ingen ny runtime introduseres.'
  },
  theme_ids:['public_attention','professional_culture','status_anxiety','shame_reputation','social_mask','class_power','public_private_leakage','local_knowledge_vs_system'],
  social_environments:socialEnvironments,
  recurring_people_archetypes:people,
  slow_axes:slowAxes,
  season:{days:14,day_phases:phases,coverage},
  primary_threads:primaryThreads,
  private_aftermath:[
    {id:'tesen_blir_smalere_og_sterkere',description:'Spilleren lærer å avgrense påstanden før synlighet og identitet gjør den vanskelig å endre.',materialization_refs:[refs[0],refs[8]]},
    {id:'grunnlaget_blir_synlig',description:'Observasjon, tall og egen slutning skilles tydeligere slik at publikum kan se hvor vurderingen begynner.',materialization_refs:[refs[1],refs[6]]},
    {id:'uenighet_blir_revisjon',description:'Sterke innvendinger og sosial friksjon kan endre analysen uten å måtte bli et nederlag i identiteten.',materialization_refs:[refs[2],refs[12]]},
    {id:'rettelsen_blir_del_av_praksisen',description:'Feil og endrede premisser møtes med synlig oppdatering fremfor stille omskriving.',materialization_refs:[refs[9],refs[10]]},
    {id:'gjenkjennelse_blir_ikke_myndighet',description:'Et publikum og en tydelig stemme holdes adskilt fra jobb, akkreditering og institusjonell makt.',materialization_refs:[refs[4],refs[13]]}
  ],
  delayed_consequences:[
    {id:'tesen_moter_innvendingen',setup_ref:'1/afternoon',return_ref:'3/evening',domains:['narrative','reputation']},
    {id:'grunnlaget_moter_tallene',setup_ref:'2/afternoon',return_ref:'7/evening',domains:['narrative','reputation']},
    {id:'faggrensen_moter_invitasjonen',setup_ref:'5/afternoon',return_ref:'12/evening',domains:['reputation','relationship']},
    {id:'egenposisjonen_moter_publikum',setup_ref:'8/afternoon',return_ref:'9/evening',domains:['reputation','relationship']},
    {id:'gamle_teser_moter_rettelsen',setup_ref:'10/afternoon',return_ref:'11/evening',domains:['narrative','reputation']},
    {id:'lojaliteten_moter_rollegrensen',setup_ref:'13/afternoon',return_ref:'14/evening',domains:['relationship','narrative']}
  ],
  materialization:{no_new_runtime:true,source_refs:refs}
};
write(worldPath,world);

index.roles.push({
  category:'media',
  role_scope:'media_kommentator_felt',
  subject_type:'life_position',
  life_position_ref:{badge_id:'media',id:'kommentator_felt',label:'Kommentator (felt)'},
  status:'role_world_complete',
  path:worldPath,
  life_position_key:'media/kommentator_felt'
});
index.status='193_role_worlds_materialized';
index.summary.role_worlds_total=193;
index.summary.life_position_role_worlds=108;
index.life_position_role_world_count=108;
write('data/Civication/roleWorlds/index.json',index);

const checklist=read('data/Civication/roleWorldAuthoringChecklist.json');
assert(Array.isArray(checklist.reference_worlds) && checklist.reference_worlds.length===192,'expected 192 checklist reference worlds');
assert(!checklist.reference_worlds.includes(worldPath),'Kommentator felt already in checklist');
checklist.reference_worlds.push(worldPath);
write('data/Civication/roleWorldAuthoringChecklist.json',checklist);

const policy=read('data/Civication/roleWorldPolicy.json');
assert(policy.noncareer_subject_boundary?.life_position_readiness?.completed_life_position_role_worlds===107,'expected policy completion 107');
policy.noncareer_subject_boundary.life_position_readiness.completed_life_position_role_worlds=108;
write('data/Civication/roleWorldPolicy.json',policy);

const taxonomy=read('data/Civication/nonCareerRoleTaxonomy.json');
assert(taxonomy.canonical_counts.life_position_role_worlds===107 && taxonomy.canonical_counts.total_role_worlds===192,'unexpected taxonomy counts');
taxonomy.canonical_counts.life_position_role_worlds=108;
taxonomy.canonical_counts.total_role_worlds=193;
assert(Array.isArray(taxonomy.role_world_rollout_boundary.completed_life_position_role_worlds),'missing completed list');
assert(!taxonomy.role_world_rollout_boundary.completed_life_position_role_worlds.includes('media/kommentator_felt'),'Kommentator felt already completed');
taxonomy.role_world_rollout_boundary.completed_life_position_role_worlds.push('media/kommentator_felt');
taxonomy.role_world_rollout_boundary.next_source_backed_candidate=null;
write('data/Civication/nonCareerRoleTaxonomy.json',taxonomy);

const themes=read('data/Civication/roleWorldThemeBank.json');
assert(!themes.reference_profiles['media/media_kommentator_felt'],'theme profile already exists');
themes.reference_profiles['media/media_kommentator_felt']=world.theme_ids;
write('data/Civication/roleWorldThemeBank.json',themes);

replaceExact('tests/civication-life-position-role-world-readiness.test.js',[
  ['  ready: 107,\n  needs_authored_depth: 52,','  ready: 108,\n  needs_authored_depth: 51,'],
  ['assert.equal(audit.summary.completed_life_position_role_worlds, 107);','assert.equal(audit.summary.completed_life_position_role_worlds, 108);'],
  ['assert.equal(audit.summary.positions_with_exact_governed_sources, 107);','assert.equal(audit.summary.positions_with_exact_governed_sources, 108);'],
  ['assert.equal(audit.summary.positions_with_multi_scene_narrative_foundation, 107);','assert.equal(audit.summary.positions_with_multi_scene_narrative_foundation, 108);']
]);
replaceExact('tests/civication-role-world-contract.test.js',[
  ['assert.equal(index.life_position_role_world_count, 107);','assert.equal(index.life_position_role_world_count, 108);'],
  ['assert.equal(index.roles.length, 192);','assert.equal(index.roles.length, 193);']
]);
replaceExact('tests/civication-noncareer-role-taxonomy.test.js',[
  ["assert.equal(roleWorldIndex.roles.length, 192, 'Role World-indeksen skal ha 85 karriereverdener + 107 life-position worlds');","assert.equal(roleWorldIndex.roles.length, 193, 'Role World-indeksen skal ha 85 karriereverdener + 108 life-position worlds');"],
  ["assert.equal(lifePositionWorlds.length, 107, '107 canonical life-position worlds skal være materialisert, inkludert Poet, Skald, Skribent, Bidragsyter, Følger og Frilansjournalist');","assert.equal(lifePositionWorlds.length, 108, '108 canonical life-position worlds skal være materialisert, inkludert Poet, Skald, Skribent, Bidragsyter, Følger, Frilansjournalist og Kommentator (felt)');"],
  ["assert.deepEqual(roleWorldIndex.summary, { role_worlds_total: 192, career_role_worlds: 85, life_position_role_worlds: 107 });","assert.deepEqual(roleWorldIndex.summary, { role_worlds_total: 193, career_role_worlds: 85, life_position_role_worlds: 108 });"],
  ['  life_position_role_worlds: 107,\n  total_role_worlds: 192,','  life_position_role_worlds: 108,\n  total_role_worlds: 193,'],
  ['85 career Role Worlds + 107 life-position worlds','85 career Role Worlds + 108 life-position worlds']
]);

console.log('Temporary Kommentator felt materializer prepared canonical 193/108 state.');
