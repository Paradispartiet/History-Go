#!/usr/bin/env node
'use strict';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
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

const sourcePath="data/Civication/narratives/leisure/media_frilansjournalist.json";
const worldPath="data/Civication/roleWorlds/media/media_frilansjournalist.json";
const storyIds=["pitch_uten_bestilling","briefen_som_flytter_seg","kilden_som_vil_se_sitatet","tilsvar_for_publisering","eksklusivitet_og_flere_kunder","faktasjekken_for_friksjon","byline_og_kreditering","honoraret_som_ikke_dekker_arbeidet","fristen_og_kvaliteten","redaktorens_endringer","rettelsen_etter_publisering","oppdrag_ved_siden_av_annen_job","nytt_medium_nytt_publikum","friheten_uten_fast_redaksjon"];
const axisIds=["pitch_assignment","scope_client_power","source_independence","reply_deadline","exclusivity_clients","fact_evidence","byline_reputation","honorarium_invisible_work","deadline_quality","editing_integrity","correction_accountability","role_separation","audience_format","professional_autonomy"];
const axisMeanings=["pitch, bestilling og hvem som bærer risiko før et oppdrag finnes","brief, endret omfang og kundemakt i bestilt arbeid","kildekontakt, faktakontroll og redaksjonell uavhengighet","tilsvar, berørte parter og presset fra deadline","flere kunder, eksklusivitet og ryddig gjenbruk","faktasjekk, plausibilitet og dokumentasjon","byline, portefølje og ansvar for publisert arbeid","honorar, usynlig arbeid og økonomisk bærekraft","frist, usikkerhet og kvalitetsgrense","redigering, kundens mandat og faglig integritet","rettelser, ansvarlighet og oppdatert offentlig informasjon","frilanspraksis ved siden av andre jobber eller aktiviteter","ny redaksjon, nytt publikum og formatsensitiv leveranse","profesjonell autonomi uten fast ansettelse eller redaksjonell myndighet"];

const source=read(sourcePath);
assert(source.id==='media_frilansjournalist_stream','unexpected Frilansjournalist stream id');
assert(source.applies_when?.any_tags?.length===1 && source.applies_when.any_tags[0]==='media:frilansjournalist','unexpected applies_when binding');
assert(source.storylets?.length===14,'expected exactly 14 authored storylets');
assert(JSON.stringify(source.storylets.map(x=>x.id))===JSON.stringify(storyIds),'storylet id/order drift');

const index=read('data/Civication/roleWorlds/index.json');
assert(index.roles.length===191,'expected 191 Role Worlds before Frilansjournalist');
assert(index.career_role_world_count===85,'expected 85 career Role Worlds');
assert(index.life_position_role_world_count===106,'expected 106 life-position Role Worlds');
assert(!index.roles.some(x=>x.life_position_key==='media/frilansjournalist'),'Frilansjournalist already indexed');
assert(!fs.existsSync(path.join(ROOT,worldPath)),'Frilansjournalist world already exists');

const socialEnvironments=[
  'frilansarbeidsflaten mellom egen idébank og redaksjoner som bestiller avgrensede journalistiske leveranser uten å ansette spilleren',
  'kildearbeid gjennom intervjuer, dokumenter, faktasjekk og tilsvar der profesjonell tillit må bygges uten å gi kilder kontroll over framstillingen',
  'redaksjonelle samarbeidsflater der brief, deadline, redigering og publiseringsvalg påvirker leveransen selv om spilleren ikke har intern redaksjonell myndighet',
  'nettverk av andre frilansere, redaktører og oppdragsgivere der anbefalinger, kapasitet og konkurrerende kunder former tilgang på oppdrag',
  'privatøkonomiske og administrative flater der honorar, ubetalt researchtid, reise, fakturering og tomrom mellom oppdrag påvirker bærekraften',
  'offentlig publisering med byline der feil, rettelser, omdømme og publikumsrespons følger spilleren videre mellom oppdrag'
];

const people=[
  {
    id:'den_bestillende_redaktoren',
    social_function:'gjør oppdragsgrense, brief, deadline og redigering konkret uten å gjøre spilleren til ansatt',
    class_position:'redaksjonell beslutningstaker hos en kunde eller oppdragsgiver',
    status:'kan bestille, redigere og avvise enkeltleveranser, men er ikke spillerens faste arbeidsgiver gjennom Badge-statusen',
    power_over_player:'kan tilby honorar, endre brief og påvirke om nye oppdrag kommer senere',
    wants:'en etterrettelig leveranse som passer publikum, format og deadline',
    conceals:'hvor mye tid redaksjonen faktisk forventer at frilanseren skal absorbere uten nytt honorar',
    speech_style:'kort, prioriterende og deadline-bevisst',
    teaches_player:'å skille redaksjonell kundemakt fra ansettelse og fast styringsrett'
  },
  {
    id:'den_viktige_kilden',
    social_function:'gjør tillit, sitatpresisjon, faktakontroll og kildegrense synlig',
    class_position:'person med relevant informasjon eller erfaring som saken er avhengig av',
    status:'kan være avgjørende for dokumentasjon uten å eie journalistens konklusjon',
    power_over_player:'kan gi, holde tilbake eller korrigere informasjon og reagere på publisering',
    wants:'å bli framstilt presist og forstått i sin egen kontekst',
    conceals:'at eget perspektiv kan være strategisk, selektivt eller ufullstendig',
    speech_style:'detaljert, interessedrevet og opptatt av formuleringer',
    teaches_player:'å skille kildekontroll av fakta fra kontroll over journalistisk framstilling'
  },
  {
    id:'den_berorte_motstemmen',
    social_function:'gjør tilsvar, kritikk og asymmetri mellom påstand og svar praktisk',
    class_position:'person eller virksomhet som omtales kritisk i en sak',
    status:'berørt part med legitim rett til å få vesentlige påstander forelagt, uten krav på falsk balanse',
    power_over_player:'kan bestride fakta, true med klage eller tilføre dokumentasjon som endrer saken',
    wants:'at kritikk blir presis og at deres faktiske svar blir representert korrekt',
    conceals:'at ønsket om tilsvar også kan brukes til å forsinke eller flytte fokus',
    speech_style:'kontrollert, juridisk bevisst og korrigerende',
    teaches_player:'å gi reelt tilsvar uten å gjøre alle bevispåstander like sterke'
  },
  {
    id:'frilanskollegaen',
    social_function:'gjør nettverk, prisinformasjon, kapasitet og gjensidig støtte synlig',
    class_position:'selvstendig journalist med egne kunder, kostnader og profesjonell risiko',
    status:'kollega og mulig konkurrent uten personalansvar over spilleren',
    power_over_player:'kan dele tips, anbefale oppdrag eller etablere uformelle prisnormer',
    wants:'et frilansmiljø der oppdrag, grenser og erfaring deles uten at alt blir nullsum',
    conceals:'at egen usikkerhet kan påvirke rådene om pris, ja og nei',
    speech_style:'praktisk, kollegial og erfaringsbasert',
    teaches_player:'at profesjonell autonomi også bygges sosialt mellom frilansere'
  },
  {
    id:'den_nye_oppdragsgiveren',
    social_function:'gjør publikum, format og forventningsavklaring synlig når spilleren går inn i et nytt medium',
    class_position:'redaksjon eller prosjekt som ennå ikke kjenner spillerens arbeidsmåte',
    status:'potensiell kunde med begrenset historikk og uklare gjensidige forventninger',
    power_over_player:'kan åpne et nytt marked eller presse spilleren inn i en lite bærekraftig leveranseform',
    wants:'rask trygghet for at spilleren forstår målgruppe, format og dokumentasjonsnivå',
    conceals:'hvilke deler av briefen som er absolutte og hvilke som faktisk kan forhandles',
    speech_style:'vennlig, avklarende og resultatstyrt',
    teaches_player:'å gjøre ny kundekontekst eksplisitt før arbeid begynner'
  },
  {
    id:'publikumsreaksjonen',
    social_function:'gjør byline, omdømme, rettelser og offentlig ansvar synlig etter publisering',
    class_position:'lesere og berørte miljøer utenfor selve oppdragsavtalen',
    status:'kan evaluere og dele arbeidet uten å være kunde eller kilde',
    power_over_player:'kan forsterke feil, kritikk eller troverdighet langt utover det enkelte honoraret',
    wants:'forståelig, dokumentert og korrigerbar journalistikk',
    conceals:'at sterke reaksjoner ikke nødvendigvis er representative for hele publikummet',
    speech_style:'fragmentert, offentlig og ofte raskere enn redaksjonell oppfølging',
    teaches_player:'at publiseringens konsekvenser varer etter at oppdraget er levert'
  }
];

const slowAxes=axisIds.map((id,i)=>({id,meaning:axisMeanings[i],runtime_binding:'editorial_only_until_governed'}));
const phases=['morning','lunch','afternoon','evening'];
const phaseType={morning:'info',lunch:'conversation',afternoon:'decision',evening:'private_consequence'};
const phaseText={
  morning:'Morgenen gjør faktagrunnlag, avtale eller usikkerhet synlig før dagens valg.',
  lunch:'Midt på dagen møter spilleren kilder, redaksjon, kolleger eller berørte parter som gjør makt og forventninger konkrete.',
  afternoon:'Ettermiddagen tvinger fram et konkret profesjonelt valg om dokumentasjon, omfang, pris, deadline eller grense.',
  evening:'Kvelden viser hva valget gjør med kapasitet, økonomi, tillit, omdømme eller privat handlingsrom.'
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
const beatRef=(day,phase)=>day+'/'+phase;
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
  role_scope:'media_frilansjournalist',
  subject_type:'life_position',
  life_position_ref:{badge_id:'media',id:'frilansjournalist',label:'Frilansjournalist'},
  title:'Frilansjournalist',
  status:'role_world_complete',
  sociological_core:{
    main_problem:'å utøve profesjonell journalistikk gjennom enkeltoppdrag der kildeansvar, redaksjonell uavhengighet, honorar og kundemakt må holdes sammen uten at gjentatte oppdrag blir forvekslet med fast ansettelse eller redaksjonell myndighet',
    description:'Frilansjournalist er en employment-independent freelance_professional_practice. Rollen dekker pitch og bestilling, brief og scope, kilder og tilsvar, faktasjekk, flere kunder og eksklusivitet, byline, honorar og usynlig arbeid, deadline og kvalitet, redigering, rettelser, rollekonflikt, publikum/format og bærekraftig profesjonell autonomi. Den er forskjellig fra Næringsliv/Frilanser, som modellerer generell kunde- og oppdragsøkonomi, fra Bidragsyter som modellerer bred bidragspraksis, og fra Journalist/Reporter som er eksplisitte career_offer-roller. Badge-statusen gir ingen fast jobb, fast lønn eller redaksjonell myndighet. Honorert arbeid oppstår bare gjennom eksplisitte livelihood-oppdrag. Ingen ny runtime introduseres.'
  },
  theme_ids:['professional_culture','public_attention','precarity','invisible_work','shame_reputation','class_power','loyalty_up_down','care_vs_efficiency'],
  social_environments:socialEnvironments,
  recurring_people_archetypes:people,
  slow_axes:slowAxes,
  season:{days:14,day_phases:phases,coverage},
  primary_threads:primaryThreads,
  private_aftermath:[
    {id:'pitchen_som_fikk_en_grense',description:'En idé blir behandlet som pitch fram til en faktisk bestilling gjør arbeid, leveranse og honorar eksplisitt.',materialization_refs:[refs[0],refs[1]]},
    {id:'kildearbeidet_som_holdt',description:'Sitatpresisjon, tilsvar og faktasjekk gir et mer robust forhold mellom kilder og publisering uten at kilden får redaksjonell kontroll.',materialization_refs:[refs[2],refs[3],refs[5]]},
    {id:'honoraret_som_ble_et_regnestykke',description:'Research, administrasjon og kapasitet blir synlige deler av hva et frilansoppdrag faktisk koster.',materialization_refs:[refs[7],refs[8]]},
    {id:'bylinen_som_fulgte_med',description:'Publisert arbeid blir portefølje og omdømme, og rettelser håndteres som en del av profesjonelt ansvar.',materialization_refs:[refs[6],refs[10]]},
    {id:'friheten_som_fikk_struktur',description:'Flere kunder, tydelige roller og evnen til å si nei gjør autonomien mer bærekraftig uten å bli en skjult ansettelse.',materialization_refs:[refs[4],refs[11],refs[13]]}
  ],
  delayed_consequences:[
    {id:'uklar_pitch_blir_gratisarbeid',setup_ref:'1/afternoon',return_ref:'4/evening',domains:['economy','narrative']},
    {id:'scope_blir_kapasitetspress',setup_ref:'2/afternoon',return_ref:'5/evening',domains:['economy','relationship']},
    {id:'kildegrense_blir_tillit',setup_ref:'3/afternoon',return_ref:'6/evening',domains:['reputation','relationship']},
    {id:'byline_blir_rettelsesansvar',setup_ref:'7/afternoon',return_ref:'11/evening',domains:['reputation','narrative']},
    {id:'honorar_blir_baerekraft',setup_ref:'8/afternoon',return_ref:'13/evening',domains:['economy','psyche']},
    {id:'rolleadskillelse_blir_autonomi',setup_ref:'12/afternoon',return_ref:'14/evening',domains:['relationship','narrative']}
  ],
  materialization:{no_new_runtime:true,source_refs:refs}
};
write(worldPath,world);

index.roles.push({
  category:'media',
  role_scope:'media_frilansjournalist',
  subject_type:'life_position',
  life_position_ref:{badge_id:'media',id:'frilansjournalist',label:'Frilansjournalist'},
  status:'role_world_complete',
  path:worldPath,
  life_position_key:'media/frilansjournalist'
});
index.status='192_role_worlds_materialized';
index.summary.role_worlds_total=192;
index.summary.life_position_role_worlds=107;
index.life_position_role_world_count=107;
write('data/Civication/roleWorlds/index.json',index);

const checklist=read('data/Civication/roleWorldAuthoringChecklist.json');
assert(Array.isArray(checklist.reference_worlds) && checklist.reference_worlds.length===191,'expected 191 checklist reference worlds');
assert(!checklist.reference_worlds.includes(worldPath),'Frilansjournalist already in checklist');
checklist.reference_worlds.push(worldPath);
write('data/Civication/roleWorldAuthoringChecklist.json',checklist);

const policy=read('data/Civication/roleWorldPolicy.json');
assert(policy.noncareer_subject_boundary?.life_position_readiness?.completed_life_position_role_worlds===106,'expected policy completion 106');
policy.noncareer_subject_boundary.life_position_readiness.completed_life_position_role_worlds=107;
write('data/Civication/roleWorldPolicy.json',policy);

const taxonomy=read('data/Civication/nonCareerRoleTaxonomy.json');
assert(taxonomy.canonical_counts.life_position_role_worlds===106 && taxonomy.canonical_counts.total_role_worlds===191,'unexpected taxonomy counts');
taxonomy.canonical_counts.life_position_role_worlds=107;
taxonomy.canonical_counts.total_role_worlds=192;
assert(Array.isArray(taxonomy.role_world_rollout_boundary.completed_life_position_role_worlds),'missing completed list');
assert(!taxonomy.role_world_rollout_boundary.completed_life_position_role_worlds.includes('media/frilansjournalist'),'Frilansjournalist already in completed list');
taxonomy.role_world_rollout_boundary.completed_life_position_role_worlds.push('media/frilansjournalist');
taxonomy.role_world_rollout_boundary.next_source_backed_candidate=null;
write('data/Civication/nonCareerRoleTaxonomy.json',taxonomy);

const themes=read('data/Civication/roleWorldThemeBank.json');
assert(!themes.reference_profiles['media/media_frilansjournalist'],'theme profile already exists');
themes.reference_profiles['media/media_frilansjournalist']=world.theme_ids;
write('data/Civication/roleWorldThemeBank.json',themes);

replaceExact('tests/civication-life-position-role-world-readiness.test.js',[
  ['  ready: 106,\n  needs_authored_depth: 53,','  ready: 107,\n  needs_authored_depth: 52,'],
  ['assert.equal(audit.summary.completed_life_position_role_worlds, 106);','assert.equal(audit.summary.completed_life_position_role_worlds, 107);'],
  ['assert.equal(audit.summary.livelihood_backed_positions, 14);','assert.equal(audit.summary.livelihood_backed_positions, 15);'],
  ['assert.equal(audit.summary.positions_with_exact_governed_sources, 106);','assert.equal(audit.summary.positions_with_exact_governed_sources, 107);'],
  ['assert.equal(audit.summary.positions_with_multi_scene_narrative_foundation, 106);','assert.equal(audit.summary.positions_with_multi_scene_narrative_foundation, 107);']
]);
replaceExact('tests/civication-role-world-contract.test.js',[
  ['assert.equal(index.life_position_role_world_count, 106);','assert.equal(index.life_position_role_world_count, 107);'],
  ['assert.equal(index.roles.length, 191);','assert.equal(index.roles.length, 192);']
]);
replaceExact('tests/civication-noncareer-role-taxonomy.test.js',[
  ["assert.equal(roleWorldIndex.roles.length, 191, 'Role World-indeksen skal ha 85 karriereverdener + 106 life-position worlds');","assert.equal(roleWorldIndex.roles.length, 192, 'Role World-indeksen skal ha 85 karriereverdener + 107 life-position worlds');"],
  ["assert.equal(lifePositionWorlds.length, 106, '106 canonical life-position worlds skal være materialisert, inkludert Poet, Skald, Skribent, Bidragsyter og Følger');","assert.equal(lifePositionWorlds.length, 107, '107 canonical life-position worlds skal være materialisert, inkludert Poet, Skald, Skribent, Bidragsyter, Følger og Frilansjournalist');"],
  ["assert.deepEqual(roleWorldIndex.summary, { role_worlds_total: 191, career_role_worlds: 85, life_position_role_worlds: 106 });","assert.deepEqual(roleWorldIndex.summary, { role_worlds_total: 192, career_role_worlds: 85, life_position_role_worlds: 107 });"],
  ['  life_position_role_worlds: 106,\n  total_role_worlds: 191,','  life_position_role_worlds: 107,\n  total_role_worlds: 192,'],
  ['85 career Role Worlds + 106 life-position worlds','85 career Role Worlds + 107 life-position worlds']
]);

console.log('Temporary Frilansjournalist materializer prepared canonical 192/107 state.');
