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

const sourcePath="data/Civication/narratives/leisure/musikk_plateartist.json";
const worldPath="data/Civication/roleWorlds/musikk/musikk_plateartist.json";
const storyIds=["nar_en_innspilling_blir_en_utgivelse","taket_du_velger","produsentens_motforslag","navnene_som_skal_sta_der","mix_7_final_ny","masteren_som_er_litt_annerledes","rekkefolgen_som_forandrer_helheten","metadataen_som_ser_uviktig_ut","coveret_du_ikke_eier","elementet_du_lante","datoen_som_presser_prosjektet","filen_som_skal_ut_til_alle","feilen_etter_release","hva_som_gjor_deg_til_plateartist"];
const axisIds=["release_definition","take_selection","producer_feedback","credits","version_control","master_approval","sequencing","metadata","artwork_rights","borrowed_material","release_timing","delivery_package","post_release_correction","recording_identity"];
const axisMeanings=["ferdigdefinisjon, kunstnerisk sluttpunkt og utgivelsesversjon","take-valg, uttrykk og grensen mot teknisk perfeksjon","produsentinnspill, samarbeid og endelig kunstnerisk ansvar","medvirkende, credits og dokumentasjon av faktisk arbeid","mixversjoner, sannhetskilde og filkontroll","mastergodkjenning, referansebias og konkret tilbakemelding","spororden, helhet og dramaturgisk sekvensering","metadata, identitet og presis distribusjonsinformasjon","artwork, bruksrett og kreditering","lånt materiale, proveniens og rettighetsavklaring","releaseplan, offentlig dato og reelle blokkeringer","leveransepakke, godkjent versjon og distribusjonskontroll","feil etter release, dokumentert korrigering og katalogvedlikehold","innspillingskatalog, Plateartist-identitet og grensen mot jobb eller berømmelsesstatus"];

const source=read(sourcePath);
assert(source.id==='musikk_plateartist_stream','unexpected Plateartist stream id');
assert(source.applies_when?.any_tags?.length===1 && source.applies_when.any_tags[0]==='musikk:plateartist','unexpected applies_when binding');
assert(source.storylets?.length===14,'expected 14 authored storylets');
assert(JSON.stringify(source.storylets.map(x=>x.id))===JSON.stringify(storyIds),'storylet id/order drift');

const index=read('data/Civication/roleWorlds/index.json');
assert(index.roles.length===194,'expected 194 Role Worlds before Plateartist');
assert(index.career_role_world_count===85,'expected 85 career Role Worlds');
assert(index.life_position_role_world_count===109,'expected 109 life-position Role Worlds');
assert(!index.roles.some(x=>x.life_position_key==='musikk/plateartist'),'Plateartist already indexed');
assert(!fs.existsSync(path.join(ROOT,worldPath)),'Plateartist world already exists');

const socialEnvironments=[
  'innspillingsøkter der kunstnerisk uttrykk, take-valg og samarbeid må låses uten at nærhet til studioarbeid blir tekniker- eller produsentmyndighet',
  'prosjektmapper og versjonsløp der mix, master, filnavn og godkjente leveranser må ha en tydelig sannhetskilde',
  'samarbeid med medvirkende der credits, navn og bidrag må dokumenteres før utgivelsen blir offentlig',
  'utgivelsesforberedelser der artwork, metadata og rettigheter kobler kunstnerisk identitet til administrativ presisjon',
  'distribusjonsløp der én godkjent pakke skal fra prosjekt til publisert innspilling uten at Plateartist-status blir label- eller plattformmyndighet',
  'perioden etter release der publikum møter verket og feil, metadata eller versjoner kan kreve dokumentert katalogvedlikehold'
];

const people=[
  {
    id:'produsenten',
    social_function:'gjør kunstnerisk motstand og samarbeid konkret uten å eie Plateartist-statusen',
    class_position:'profesjonell eller prosjektbasert samarbeidspartner i innspillingsprosessen',
    status:'har relevant produksjonskompetanse, men ikke automatisk siste ord over artistens utgivelsesidentitet',
    power_over_player:'kan påvirke arrangement, uttrykk og arbeidsflyt gjennom forslag og faglig tyngde',
    wants:'et sammenhengende opptak som tåler å bli låst som utgivelse',
    conceals:'at egne estetiske preferanser noen ganger kan presenteres som teknisk nødvendighet',
    speech_style:'konkret, referanseorientert og løsningsdrevet',
    teaches_player:'å ta inn sterke forslag uten å gi fra seg uavklart kunstnerisk ansvar'
  },
  {
    id:'innspillingsteknikeren',
    social_function:'gjør opptakskvalitet, filstruktur og tekniske grenser synlige uten å gjøre spilleren til tekniker',
    class_position:'teknisk fagperson rundt opptak og leveranser',
    status:'har teknisk ansvar innen avtalt rolle, ikke eierskap til kunstnerens katalog',
    power_over_player:'kan avdekke opptaksfeil, versjonsproblemer og praktiske begrensninger før de blir permanente',
    wants:'tydelige beslutninger, entydige filer og realistiske tekniske forventninger',
    conceals:'at teknisk ryddighet ikke alene avgjør hvilket take eller uttrykk som er kunstnerisk riktig',
    speech_style:'måleorientert, kort og filspesifikk',
    teaches_player:'å skille teknisk informasjon fra kunstnerisk beslutningsmyndighet'
  },
  {
    id:'medvirkende_musiker',
    social_function:'gjør credits, bidrag og relasjonell rettferdighet konkret',
    class_position:'utøver eller gjest som bidrar til en konkret innspilling',
    status:'medskaper av avgrensede deler uten automatisk kontroll over hele utgivelsen',
    power_over_player:'kan holde tilbake godkjenning av feilaktig kreditering og påvirke framtidig samarbeid',
    wants:'korrekt navn, korrekt rolle og respekt for det faktiske bidraget',
    conceals:'at forventninger om synlighet eller eierskap kan være uklare hvis de aldri ble avklart',
    speech_style:'direkte, relasjonell og opptatt av hva som faktisk ble spilt eller skapt',
    teaches_player:'at utgivelsen under ett artistnavn fortsatt kan inneholde mange dokumenterbare bidrag'
  },
  {
    id:'masteringpersonen',
    social_function:'gjør siste lydversjon og kontrollert sammenligning konkret',
    class_position:'spesialisert leverandør i sluttfasen før distribusjon',
    status:'har ansvar for sin leveranse, men ikke automatisk kunstnerisk eierskap til prosjektet',
    power_over_player:'kan endre det endelige lydlige uttrykket og avdekke problemer som først blir tydelige sent',
    wants:'presise referanser og konkret feedback som kan omsettes til en endelig master',
    conceals:'at profesjonell selvsikkerhet ikke eliminerer behovet for tydelig godkjenning fra oppdragsgiver',
    speech_style:'sammenlignende, teknisk presis og fokusert på konkrete avvik',
    teaches_player:'å godkjenne master gjennom observasjon fremfor vane eller autoritetsrefleks'
  },
  {
    id:'den_visuelle_samarbeidspartneren',
    social_function:'gjør artwork, rettigheter og visuell kreditering til en del av utgivelsespraksisen',
    class_position:'fotograf, illustratør eller designer med eget arbeid og egne rettigheter',
    status:'selvstendig bidragsyter til utgivelsens visuelle identitet',
    power_over_player:'kan sette grenser for bruk, kreditering og videre gjenbruk av visuelt materiale',
    wants:'at avtalt uttrykk, bruk og kreditering følger det som faktisk publiseres',
    conceals:'at et godt estetisk samarbeid ikke automatisk avklarer alle framtidige bruksformer',
    speech_style:'visuell, detaljorientert og bruksbevisst',
    teaches_player:'å skille tilgang til et bilde fra rett til å bruke det i en offentlig utgivelse'
  },
  {
    id:'distribusjonskontakten',
    social_function:'gjør metadata, leveransepakke og korrigeringsløp konkrete uten å bli label- eller plattformmyndighet',
    class_position:'kontaktledd i digital eller fysisk distribusjon',
    status:'kan håndtere innsending og rettelser innen sitt system, men skaper ikke Plateartistens status eller berømmelse',
    power_over_player:'kan avvise ufullstendige leveranser, synliggjøre formatkrav og føre korrigeringer videre',
    wants:'én entydig, komplett og dokumentert leveranse som kan behandles uten tolkning',
    conceals:'at plattformkrav og distribusjonslogikk ikke nødvendigvis samsvarer med artistens kunstneriske prioriteringer',
    speech_style:'skjemabasert, versjonsorientert og prosedyrenær',
    teaches_player:'å behandle distribusjon som et konkret leveranseløp, ikke som en garanti for rekkevidde'
  }
];

const slowAxes=axisIds.map((id,i)=>({id,meaning:axisMeanings[i],runtime_binding:'editorial_only_until_governed'}));
const phases=['morning','lunch','afternoon','evening'];
const phaseType={morning:'info',lunch:'conversation',afternoon:'decision',evening:'private_consequence'};
const phaseText={
  morning:'Morgenen gjør versjon, rettighet, kreditering eller releasepremiss synlig før dagens valg.',
  lunch:'Midt på dagen møter prosjektet en samarbeidspartner som gjør ansvar, faggrense eller leveransekrav konkret.',
  afternoon:'Ettermiddagen krever et konkret valg om uttrykk, versjon, kreditering, rettighet, metadata eller release.',
  evening:'Kvelden viser hva valget gjør med tillit, stress, katalog, omdømme eller neste utgivelsessteg.'
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
  category:'musikk',
  role_scope:'musikk_plateartist',
  subject_type:'life_position',
  life_position_ref:{badge_id:'musikk',id:'plateartist',label:'Plateartist'},
  title:'Plateartist',
  status:'role_world_complete',
  sociological_core:{
    main_problem:'å bygge en dokumenterbar innspillings- og utgivelseskatalog der kunstneriske valg, versjoner, credits, rettigheter, metadata og distribusjon faktisk kan låses, uten at det å ha gitt ut musikk blir forvekslet med fast jobb, produsent- eller teknikerautoritet, bookingmakt eller berømmelse',
    description:'Plateartist er en employment-independent recording_artist_status med et selvstendig sosialt og praktisk liv rundt ferdigdefinisjon, take-valg, produsentsamarbeid, credits, mix- og masterversjoner, sekvensering, metadata, artwork, lånt materiale, releaseplan, distribusjonsleveranse, korrigering og katalogidentitet. Rollen er forskjellig fra Artist, som er en bredere artistic_identity_and_livelihood, fra Utøvende musiker som gjelder levende utøverpraksis og eventuelt separat arbeidsgiverforankret karriere, fra Plategraver som gjelder lytter-/samlerpraksis, og fra Headliner, Stjerneartist og Popstjerne som er booking-/fame-statuslag. Plateartiststatus gir ingen fast jobb, fast lønn, plateselskap, distribusjonsgaranti, bookingmakt, produsentmyndighet, teknikerrolle eller berømmelse. Ingen ny runtime introduseres.'
  },
  theme_ids:['professional_culture','invisible_work','status_anxiety','shame_reputation','public_attention','class_power','care_vs_efficiency','public_private_leakage'],
  social_environments:socialEnvironments,
  recurring_people_archetypes:people,
  slow_axes:slowAxes,
  season:{days:14,day_phases:phases,coverage},
  primary_threads:primaryThreads,
  private_aftermath:[
    {id:'ferdig_blir_en_beslutning',description:'Prosjektet får et tydelig sluttpunkt der godkjent utgivelsesversjon kan skilles fra endeløs forbedring.',materialization_refs:[refs[0],refs[4],refs[5]]},
    {id:'credits_blir_dokumentasjon',description:'Medvirkende og roller blir låst som faktiske bidrag fremfor uformelle minner etter release.',materialization_refs:[refs[2],refs[3]]},
    {id:'rettigheter_blir_del_av_verket',description:'Artwork og lånt materiale behandles som reelle publiseringsgrenser før estetisk momentum får overstyre dem.',materialization_refs:[refs[8],refs[9]]},
    {id:'release_blir_en_leveranse',description:'Dato, metadata, master og artwork bindes til én dokumentert pakke i stedet for flere samtidige final-versjoner.',materialization_refs:[refs[7],refs[10],refs[11]]},
    {id:'katalogen_blir_identitet_uten_fame',description:'Utgivelser kan bygge en reell Plateartist-identitet uten at katalogen automatisk gir jobb, booking eller berømmelse.',materialization_refs:[refs[12],refs[13]]}
  ],
  delayed_consequences:[
    {id:'ferdigvalget_moter_masteren',setup_ref:'1/afternoon',return_ref:'6/evening',domains:['narrative','reputation']},
    {id:'produsentvalget_moter_credits',setup_ref:'3/afternoon',return_ref:'4/evening',domains:['relationship','reputation']},
    {id:'versjonskontrollen_moter_leveransen',setup_ref:'5/afternoon',return_ref:'12/evening',domains:['stress','narrative']},
    {id:'artworkretten_moter_releaseplanen',setup_ref:'9/afternoon',return_ref:'11/evening',domains:['relationship','reputation']},
    {id:'lanematerialet_moter_korrigeringen',setup_ref:'10/afternoon',return_ref:'13/evening',domains:['financial','reputation']},
    {id:'katalogen_moter_statusgrensen',setup_ref:'12/afternoon',return_ref:'14/evening',domains:['reputation','narrative']}
  ],
  materialization:{no_new_runtime:true,source_refs:refs}
};
write(worldPath,world);

index.roles.push({
  category:'musikk',
  role_scope:'musikk_plateartist',
  subject_type:'life_position',
  life_position_ref:{badge_id:'musikk',id:'plateartist',label:'Plateartist'},
  status:'role_world_complete',
  path:worldPath,
  life_position_key:'musikk/plateartist'
});
index.status='195_role_worlds_materialized';
index.summary.role_worlds_total=195;
index.summary.life_position_role_worlds=110;
index.life_position_role_world_count=110;
write('data/Civication/roleWorlds/index.json',index);

const checklist=read('data/Civication/roleWorldAuthoringChecklist.json');
assert(Array.isArray(checklist.reference_worlds)&&checklist.reference_worlds.length===194,'expected 194 checklist reference worlds');
assert(!checklist.reference_worlds.includes(worldPath),'Plateartist already in checklist');
checklist.reference_worlds.push(worldPath);
write('data/Civication/roleWorldAuthoringChecklist.json',checklist);

const policy=read('data/Civication/roleWorldPolicy.json');
assert(policy.noncareer_subject_boundary?.life_position_readiness?.completed_life_position_role_worlds===109,'expected policy completion 109');
policy.noncareer_subject_boundary.life_position_readiness.completed_life_position_role_worlds=110;
write('data/Civication/roleWorldPolicy.json',policy);

const taxonomy=read('data/Civication/nonCareerRoleTaxonomy.json');
assert(taxonomy.canonical_counts.unique_badge_scoped_life_positions===194,'selectable badge-scoped count must remain 194');
assert(taxonomy.canonical_counts.life_position_role_worlds===109&&taxonomy.canonical_counts.total_role_worlds===194,'unexpected taxonomy Role World counts');
taxonomy.canonical_counts.life_position_role_worlds=110;
taxonomy.canonical_counts.total_role_worlds=195;
assert(Array.isArray(taxonomy.role_world_rollout_boundary.completed_life_position_role_worlds),'missing completed list');
assert(!taxonomy.role_world_rollout_boundary.completed_life_position_role_worlds.includes('musikk/plateartist'),'Plateartist already complete');
taxonomy.role_world_rollout_boundary.completed_life_position_role_worlds.push('musikk/plateartist');
taxonomy.role_world_rollout_boundary.next_source_backed_candidate=null;
write('data/Civication/nonCareerRoleTaxonomy.json',taxonomy);

const themes=read('data/Civication/roleWorldThemeBank.json');
assert(!themes.reference_profiles['musikk/musikk_plateartist'],'Plateartist theme profile already exists');
themes.reference_profiles['musikk/musikk_plateartist']=world.theme_ids;
write('data/Civication/roleWorldThemeBank.json',themes);

replaceExact('tests/civication-life-position-role-world-readiness.test.js',[
  ['  ready: 109,\n  needs_authored_depth: 50,','  ready: 110,\n  needs_authored_depth: 49,'],
  ['assert.equal(audit.summary.completed_life_position_role_worlds, 109);','assert.equal(audit.summary.completed_life_position_role_worlds, 110);'],
  ['assert.equal(audit.summary.positions_with_exact_governed_sources, 109);','assert.equal(audit.summary.positions_with_exact_governed_sources, 110);'],
  ['assert.equal(audit.summary.positions_with_multi_scene_narrative_foundation, 109);','assert.equal(audit.summary.positions_with_multi_scene_narrative_foundation, 110);']
]);
replaceExact('tests/civication-role-world-contract.test.js',[
  ['assert.equal(index.life_position_role_world_count, 109);','assert.equal(index.life_position_role_world_count, 110);'],
  ['assert.equal(index.roles.length, 194);','assert.equal(index.roles.length, 195);']
]);
replaceExact('tests/civication-noncareer-role-taxonomy.test.js',[
  ["assert.equal(roleWorldIndex.roles.length, 194, 'Role World-indeksen skal ha 85 karriereverdener + 109 life-position worlds');","assert.equal(roleWorldIndex.roles.length, 195, 'Role World-indeksen skal ha 85 karriereverdener + 110 life-position worlds');"],
  ["assert.equal(lifePositionWorlds.length, 109, '109 canonical life-position worlds skal være materialisert, inkludert Poet, Skald, Skribent, Bidragsyter, Følger, Frilansjournalist, Kommentator (felt) og Media/Leser');","assert.equal(lifePositionWorlds.length, 110, '110 canonical life-position worlds skal være materialisert, inkludert Poet, Skald, Skribent, Bidragsyter, Følger, Frilansjournalist, Kommentator (felt), Media/Leser og Plateartist');"],
  ["assert.deepEqual(roleWorldIndex.summary, { role_worlds_total: 194, career_role_worlds: 85, life_position_role_worlds: 109 });","assert.deepEqual(roleWorldIndex.summary, { role_worlds_total: 195, career_role_worlds: 85, life_position_role_worlds: 110 });"],
  ['  life_position_role_worlds: 109,\n  total_role_worlds: 194,','  life_position_role_worlds: 110,\n  total_role_worlds: 195,'],
  ['85 career Role Worlds + 109 life-position worlds','85 career Role Worlds + 110 life-position worlds']
]);

console.log('Temporary Plateartist materializer prepared canonical 195/110 state.');
