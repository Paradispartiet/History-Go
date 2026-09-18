#!/usr/bin/env node
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const read=(rel)=>JSON.parse(fs.readFileSync(path.join(ROOT,rel),'utf8'));
const write=(rel,value)=>fs.writeFileSync(path.join(ROOT,rel),JSON.stringify(value,null,2)+'\n');
const assert=(cond,msg)=>{if(!cond)throw new Error(msg);};
const replaceExact=(rel,pairs)=>{
  const full=path.join(ROOT,rel);
  let text=fs.readFileSync(full,'utf8');
  for(const [before,after] of pairs){
    const count=text.split(before).length-1;
    if(count!==1)throw new Error(rel+': expected one exact occurrence, got '+count+' for '+before);
    text=text.replace(before,after);
  }
  fs.writeFileSync(full,text);
};

const sourcePath="data/Civication/narratives/leisure/media_leser.json";
const worldPath="data/Civication/roleWorlds/media/media_leser.json";
const storyIds=["overskriften_for_brødteksten","hva_slags_tekst_er_dette","bylinen_og_avsenderen","lenken_til_grunnlaget","sitatet_rundt_setningen","bildet_og_bildeteksten","publisert_og_oppdatert","lenken_du_ikke_har_apnet","kommersielt_innhold_i_samme_design","utdraget_bak_betalingsmuren","rettelsen_nederst_pa_siden","det_som_er_lenket_men_ikke_sitert","dele_etter_a_ha_lest","hva_slags_medieleser"];
const axisIds=["headline_body","content_type","sender_byline","primary_material","quote_context","image_caption","version_time","link_opening","commercial_label","partial_access","correction_note","link_support","sharing_summary","reader_role_boundary"];
const axisMeanings=["overskrift mot brødtekst og faktisk konklusjon","sakstype, sjanger og hvilket utsagn leseren møter","byline, avsender og hvem som faktisk står for innholdet","primærgrunnlag, dokumentlenke og tilgjengelig proveniens","sitat, omkringliggende tekst og nødvendig kontekst","bilde, bildetekst, dato, sted og illustrasjonsstatus","publisert, oppdatert og hvilken versjon som brukes","mottatt lenke mot innhold leseren faktisk har åpnet","redaksjonell flate mot annonse, partnerinnhold og kommersiell avsender","utdrag, betalingsmur og grensen for hva leseren faktisk har tilgang til","rettelsesmerknad, egen hukommelse og oppdatert forståelse","lenket referanse og om den støtter den konkrete formuleringen","egen delingstekst mot det publiseringen faktisk dokumenterer","medielesekompetanse mot journalistisk, ekspertmessig eller redaksjonell myndighet"];

const source=read(sourcePath);
assert(source.id==='media_leser_stream','unexpected Media Leser stream id');
assert(source.applies_when?.any_tags?.length===1 && source.applies_when.any_tags[0]==='media:leser','unexpected badge-scoped binding');
assert(source.storylets?.length===14,'expected 14 authored storylets');
assert(JSON.stringify(source.storylets.map(x=>x.id))===JSON.stringify(storyIds),'storylet id/order drift');

const index=read('data/Civication/roleWorlds/index.json');
assert(index.roles.length===193,'expected 193 Role Worlds before Media Leser');
assert(index.career_role_world_count===85,'expected 85 career Role Worlds');
assert(index.life_position_role_world_count===108,'expected 108 life-position Role Worlds');
assert(!index.roles.some(x=>x.life_position_key==='media/leser'),'Media Leser already indexed');
assert(!fs.existsSync(path.join(ROOT,worldPath)),'Media Leser world already exists');

const socialEnvironments=[
  'forsider og artikkelsider der overskrift, ingress, brødtekst, byline og sakstype gir ulike lag av samme publisering',
  'lenkede dokumenter, rapporter og andre primærgrunnlag som gjør sentrale påstander etterprøvbare når detaljen betyr noe',
  'visuelle publiseringsflater der foto, arkivbilde, illustrasjon og bildetekst påvirker hvordan leseren forstår hendelsen',
  'delingssamtaler med venner og nettverk der en kort egen formulering kan bli mottakerens første møte med innholdet',
  'betalingsmurer, innlogging og utdrag der tilgangsgrensen bestemmer hvor mye leseren faktisk kan vite om hele publiseringen',
  'kommersielle og redaksjonelle flater i samme design der merking av avsender og finansiering må holdes synlig'
];

const people=[
  {
    id:'journalisten_i_bylinen',
    social_function:'gjør avsender, ansvar og forskjellen mellom enkelttekst og hele mediet konkret',
    class_position:'profesjonell innholdsprodusent i en redaksjonell kontekst',
    status:'navngitt avsender med ansvar for egen publisering, uten automatisk personlig relasjon til leseren',
    power_over_player:'kan forme hvilke opplysninger, sitater og forklaringer leseren møter i teksten',
    wants:'at publiseringen blir lest som den faktisk er skrevet og merket',
    conceals:'at bylinen alene ikke viser alle redaksjonelle valg eller arbeidsprosesser bak teksten',
    speech_style:'presis, tekstnær og publiseringsorientert',
    teaches_player:'å skille navngitt avsender fra antakelser om hele institusjonen'
  },
  {
    id:'den_hurtige_deleren',
    social_function:'gjør forskjellen mellom andres sammendrag og egen lesing synlig',
    class_position:'venn eller kontakt som sprer lenker raskt',
    status:'sosial avsender uten redaksjonell myndighet',
    power_over_player:'kan etablere et sterkt førsteinntrykk før spilleren åpner publiseringen',
    wants:'at spilleren raskt ser det samme poenget og reagerer',
    conceals:'at egen delingstekst kan være bredere eller sikrere enn teksten som lenkes',
    speech_style:'kort, konkluderende og delingsvennlig',
    teaches_player:'å skille lenken fra påstanden som følger med lenken'
  },
  {
    id:'primarkilden',
    social_function:'gjør forholdet mellom publisering og underliggende dokumentasjon konkret',
    class_position:'rapport, studie, dom, offentlig dokument eller annen originalkilde representert som dokumentarisk aktør',
    status:'førstehåndsgrunnlag for enkelte påstander, men ikke automatisk tolkning av egen betydning',
    power_over_player:'kan bekrefte, avgrense eller motsi hvordan et konkret poeng er gjengitt',
    wants:'å bli lest med riktig ordlyd, periode og avgrensing',
    conceals:'at teknisk eller institusjonelt språk kan kreve forklaring for å forstå betydningen',
    speech_style:'formell, dokumentarisk og avgrenset',
    teaches_player:'å bruke primærgrunnlag når den konkrete påstanden avhenger av det'
  },
  {
    id:'bildeteksten',
    social_function:'gjør visuell proveniens, sted, dato og illustrasjonsstatus synlig',
    class_position:'publiseringsmetadata under eller ved et bilde',
    status:'lavmælt kontekst med høy betydning for hva bildet faktisk dokumenterer',
    power_over_player:'kan endre førsteinntrykket av et sterkt visuelt element med få ord',
    wants:'at bildet forstås med korrekt tid, sted, fotograf og funksjon',
    conceals:'at mange lesere ser bildet før de ser metadataen',
    speech_style:'kort, konkret og metadataorientert',
    teaches_player:'at visuell evidens også har kilde- og kontekstgrenser'
  },
  {
    id:'den_kommersielle_avsenderen',
    social_function:'gjør finansiering og avsendergrense synlig i innhold som ligner redaksjonell publisering',
    class_position:'annonsør, partner eller oppdragsgiver for merket kommersielt innhold',
    status:'betalende avsender uten automatisk redaksjonell troverdighet',
    power_over_player:'kan låne design, format og distribusjon fra publiseringsflaten',
    wants:'at budskapet leses og oppleves relevant i samme miljø som annet innhold',
    conceals:'hvor mye valg av tema og framstilling styres av kommersielt formål',
    speech_style:'polert, forklarende og nytteorientert',
    teaches_player:'å ta merking og finansiering med i vurderingen av innholdets formål'
  },
  {
    id:'den_kritiske_lesevennen',
    social_function:'gjør presis deling, rettelser og begrenset tilgang til sosial praksis',
    class_position:'annen publikummer uten profesjonell rolle i mediet',
    status:'likestilt leser som kan spørre hva teksten faktisk sier',
    power_over_player:'kan avdekke at spilleren har delt overskrift, utdrag eller gammel versjon som om det var hele publiseringen',
    wants:'at samtalen bygger på det begge faktisk har lest',
    conceals:'at egen forståelse også kan være selektiv eller begrenset',
    speech_style:'spørrende, vennlig og konkret',
    teaches_player:'å gjøre lesebegrensninger eksplisitte uten å gjøre dem skamfulle'
  }
];

const slowAxes=axisIds.map((id,i)=>({id,meaning:axisMeanings[i],runtime_binding:'editorial_only_until_governed'}));
const phases=['morning','lunch','afternoon','evening'];
const phaseType={morning:'info',lunch:'conversation',afternoon:'decision',evening:'private_consequence'};
const phaseText={
  morning:'Morgenen gjør publiseringens form, metadata eller tilgangsgrense synlig før førsteinntrykket blir en konklusjon.',
  lunch:'Midt på dagen møter lesingen en avsender, venn, referanse eller publiseringsdetalj som gjør konteksten konkret.',
  afternoon:'Ettermiddagen krever et valg om å åpne, avgrense, kontrollere eller gjengi innholdet presist.',
  evening:'Kvelden viser hva lesemåten gjør med forståelse, deling, tillit, omdømme eller egen rollegrense.'
};
const coverage=[];
for(let i=0;i<14;i++){
  const s=source.storylets[i];
  for(const phase of phases){
    coverage.push({
      day:i+1,phase,beat_type:phaseType[phase],
      summary:'Dag '+(i+1)+': '+s.subject+'. '+phaseText[phase],
      thread_ids:[axisIds[i]],
      materialization_refs:[sourcePath+'#'+s.id]
    });
  }
}
const beatRef=(d,p)=>d+'/'+p;
const primaryThreads=axisIds.map((id,i)=>{
  const d=i+1;
  const refs=d<14
    ? [beatRef(d,'morning'),beatRef(d,'lunch'),beatRef(d,'afternoon'),beatRef(d,'evening'),beatRef(d+1,'morning'),beatRef(d+1,'lunch')]
    : [beatRef(13,'afternoon'),beatRef(13,'evening'),beatRef(14,'morning'),beatRef(14,'lunch'),beatRef(14,'afternoon'),beatRef(14,'evening')];
  return {id,relationship:axisMeanings[i],beat_refs:refs};
});
const refs=storyIds.map(id=>sourcePath+'#'+id);

const world={
  schema:'civication_role_world_v1',
  version:1,
  category:'media',
  role_scope:'media_leser',
  subject_type:'life_position',
  life_position_ref:{badge_id:'media',id:'leser',label:'Leser'},
  title:'Leser',
  status:'role_world_complete',
  sociological_core:{
    main_problem:'å forstå enkeltstående mediepubliseringer presist nok til at overskrift, sjanger, avsender, lenker, bilder, tilgangsgrenser og rettelser ikke blir forvekslet med hele innholdet eller med profesjonell redaksjonell myndighet',
    description:'Media/Leser er en employment-independent audience_practice for selve møtet med enkeltstående medieinnhold. Rollen dekker overskrift mot brødtekst, sakstype, byline og avsender, primærgrunnlag, sitatkontekst, bilde og bildetekst, publisert/oppdatert-versjoner, mottatte lenker, kommersiell merking, utdrag og betalingsmur, rettelser, lenket dokumentasjon, presis deling og leserrollens myndighetsgrense. Den er tydelig forskjellig fra Litteratur/Leser som handler om bøker og leseridentitet, Media/Følger som handler om vedvarende publikumsrelasjon over tid, og Media/Nyhetsjunkie som handler om intensiv oppdateringsstrøm og tempo. Media/Leser gir ingen jobb, lønn, journalist-, redaktør-, moderator-, ekspert- eller faktasjekkermyndighet og introduserer ingen ny runtime.'
  },
  theme_ids:['public_attention','professional_culture','consumption','class_power','shame_reputation','public_private_leakage','care_vs_efficiency'],
  social_environments:socialEnvironments,
  recurring_people_archetypes:people,
  slow_axes:slowAxes,
  season:{days:14,day_phases:phases,coverage},
  primary_threads:primaryThreads,
  private_aftermath:[
    {id:'overskriften_blir_inngang_ikke_fasit',description:'Spilleren lærer å åpne og avgrense publiseringen før overskriften blir behandlet som hele konklusjonen.',materialization_refs:[refs[0],refs[1]]},
    {id:'avsender_og_grunnlag_blir_synlige',description:'Byline, avsender, dokumentlenker og sitatkontekst blir konkrete deler av hva leseren faktisk bygger forståelsen på.',materialization_refs:[refs[2],refs[3],refs[4]]},
    {id:'det_visuelle_far_metadata',description:'Bilde, bildetekst og versjonstidspunkt hindrer at et sterkt førsteinntrykk løsriver seg fra tid og sted.',materialization_refs:[refs[5],refs[6]]},
    {id:'tilgangsgrensen_blir_erkjent',description:'Lenker, utdrag, betalingsmur og kommersiell merking gjør det tydelig hvor mye spilleren faktisk har lest og hvem som står bak.',materialization_refs:[refs[7],refs[8],refs[9]]},
    {id:'deling_blir_leseransvar_ikke_redaksjon',description:'Rettelser og egen delingstekst blir del av ansvarlig publikumspraksis uten å gjøre spilleren til profesjonell portvokter.',materialization_refs:[refs[10],refs[11],refs[12],refs[13]]}
  ],
  delayed_consequences:[
    {id:'overskrift_moter_sakstype',setup_ref:'1/afternoon',return_ref:'2/evening',domains:['narrative','reputation']},
    {id:'byline_moter_grunnlag',setup_ref:'3/afternoon',return_ref:'4/evening',domains:['narrative','responsibility']},
    {id:'sitat_moter_bildekontekst',setup_ref:'5/afternoon',return_ref:'6/evening',domains:['narrative','reputation']},
    {id:'versjon_moter_mottatt_lenke',setup_ref:'7/afternoon',return_ref:'8/evening',domains:['relationship','narrative']},
    {id:'merking_moter_tilgangsgrense',setup_ref:'9/afternoon',return_ref:'10/evening',domains:['economy','narrative']},
    {id:'rettelse_moter_deling',setup_ref:'11/afternoon',return_ref:'14/evening',domains:['reputation','relationship']}
  ],
  materialization:{no_new_runtime:true,source_refs:refs}
};
write(worldPath,world);

index.roles.push({
  category:'media',role_scope:'media_leser',subject_type:'life_position',
  life_position_ref:{badge_id:'media',id:'leser',label:'Leser'},
  status:'role_world_complete',path:worldPath,life_position_key:'media/leser'
});
index.status='194_role_worlds_materialized';
index.summary.role_worlds_total=194;
index.summary.life_position_role_worlds=109;
index.life_position_role_world_count=109;
write('data/Civication/roleWorlds/index.json',index);

const checklist=read('data/Civication/roleWorldAuthoringChecklist.json');
assert(Array.isArray(checklist.reference_worlds)&&checklist.reference_worlds.length===193,'expected 193 checklist reference worlds');
assert(!checklist.reference_worlds.includes(worldPath),'Media Leser already in checklist');
checklist.reference_worlds.push(worldPath);
write('data/Civication/roleWorldAuthoringChecklist.json',checklist);

const policy=read('data/Civication/roleWorldPolicy.json');
assert(policy.noncareer_subject_boundary?.life_position_readiness?.completed_life_position_role_worlds===108,'expected policy completion 108');
policy.noncareer_subject_boundary.life_position_readiness.completed_life_position_role_worlds=109;
write('data/Civication/roleWorldPolicy.json',policy);

const taxonomy=read('data/Civication/nonCareerRoleTaxonomy.json');
assert(taxonomy.canonical_counts.life_position_role_worlds===108&&taxonomy.canonical_counts.total_role_worlds===193,'unexpected taxonomy counts');
taxonomy.canonical_counts.life_position_role_worlds=109;
taxonomy.canonical_counts.total_role_worlds=194;
assert(!taxonomy.role_world_rollout_boundary.completed_life_position_role_worlds.includes('media/leser'),'Media Leser already completed');
taxonomy.role_world_rollout_boundary.completed_life_position_role_worlds.push('media/leser');
taxonomy.role_world_rollout_boundary.next_source_backed_candidate=null;
write('data/Civication/nonCareerRoleTaxonomy.json',taxonomy);

const themes=read('data/Civication/roleWorldThemeBank.json');
assert(!themes.reference_profiles['media/media_leser'],'Media Leser theme profile already exists');
themes.reference_profiles['media/media_leser']=world.theme_ids;
write('data/Civication/roleWorldThemeBank.json',themes);

replaceExact('tests/civication-life-position-role-world-readiness.test.js',[
  ['  ready: 108,\n  needs_authored_depth: 51,','  ready: 109,\n  needs_authored_depth: 50,'],
  ['assert.equal(audit.summary.completed_life_position_role_worlds, 108);','assert.equal(audit.summary.completed_life_position_role_worlds, 109);'],
  ['assert.equal(audit.summary.positions_with_exact_governed_sources, 108);','assert.equal(audit.summary.positions_with_exact_governed_sources, 109);'],
  ['assert.equal(audit.summary.positions_with_multi_scene_narrative_foundation, 108);','assert.equal(audit.summary.positions_with_multi_scene_narrative_foundation, 109);']
]);
replaceExact('tests/civication-role-world-contract.test.js',[
  ['assert.equal(index.life_position_role_world_count, 108);','assert.equal(index.life_position_role_world_count, 109);'],
  ['assert.equal(index.roles.length, 193);','assert.equal(index.roles.length, 194);']
]);
replaceExact('tests/civication-noncareer-role-taxonomy.test.js',[
  ["assert.equal(roleWorldIndex.roles.length, 193, 'Role World-indeksen skal ha 85 karriereverdener + 108 life-position worlds');","assert.equal(roleWorldIndex.roles.length, 194, 'Role World-indeksen skal ha 85 karriereverdener + 109 life-position worlds');"],
  ["assert.equal(lifePositionWorlds.length, 108, '108 canonical life-position worlds skal være materialisert, inkludert Poet, Skald, Skribent, Bidragsyter, Følger, Frilansjournalist og Kommentator (felt)');","assert.equal(lifePositionWorlds.length, 109, '109 canonical life-position worlds skal være materialisert, inkludert Poet, Skald, Skribent, Bidragsyter, Følger, Frilansjournalist, Kommentator (felt) og Media/Leser');"],
  ["assert.deepEqual(roleWorldIndex.summary, { role_worlds_total: 193, career_role_worlds: 85, life_position_role_worlds: 108 });","assert.deepEqual(roleWorldIndex.summary, { role_worlds_total: 194, career_role_worlds: 85, life_position_role_worlds: 109 });"],
  ['  life_position_role_worlds: 108,\n  total_role_worlds: 193,','  life_position_role_worlds: 109,\n  total_role_worlds: 194,'],
  ['85 career Role Worlds + 108 life-position worlds','85 career Role Worlds + 109 life-position worlds']
]);

console.log('Temporary Media Leser materializer prepared canonical 194/109 state.');
