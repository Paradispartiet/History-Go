#!/usr/bin/env node
'use strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const writeJson = (rel, value) => fs.writeFileSync(path.join(ROOT, rel), JSON.stringify(value, null, 2) + '\n');
const readText = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const writeText = (rel, value) => fs.writeFileSync(path.join(ROOT, rel), value);
const replaceOnce = (text, from, to, label) => {
  if (!text.includes(from)) throw new Error(`Missing ${label}: ${from}`);
  return text.replace(from, to);
};
const uniquePush = (array, value, key = (x) => x) => {
  if (!array.some((entry) => key(entry) === key(value))) array.push(value);
};

const streamPath = 'data/Civication/narratives/leisure/litteratur_poet.json';
const worldPath = 'data/Civication/roleWorlds/litteratur/litteratur_poet.json';
const stream = readJson(streamPath);
if (stream.storylets.length !== 14) throw new Error('Poet stream must contain 14 storylets');

const axes = [
  ['image','bildet_for_forklaringen','bilde og konkret sansning'],
  ['precision','ordet_som_er_for_stort','presisjon og skala'],
  ['rhythm','rytmen_i_munnen','rytme, trykk og lyd'],
  ['line_break','linjebruddet_som_gjor_noe','linjebrudd og visuell form'],
  ['metaphor','metaforen_som_ma_holde','metaforisk sammenheng'],
  ['speaker','jeg_er_ikke_alltid_forfatteren','lyrisk jeg, persona og privatlivsgrense'],
  ['constraint','formen_som_motstand','formbegrensning som arbeidsmetode'],
  ['tradition','tradisjonen_i_linja','tradisjon, allusjon og kildebevissthet'],
  ['sequence','diktet_blant_diktene','sekvens og samlingskomposisjon'],
  ['cutting','kuttet_som_gjor_plass','revisjon og helhet framfor favorittlinjen'],
  ['feedback','tilbakemeldingen_som_ma_sorteres','respons, dømmekraft og egen løsning'],
  ['performance','siden_og_scenen','side, stemme og framføring'],
  ['livelihood','honoraret_er_ikke_identiteten','skillet mellom poetisk praksis og økonomisk avtale'],
  ['revision','diktet_som_kan_endres','reviserbarhet og utvikling over tid']
];
const storyletIds = new Set(stream.storylets.map((entry) => entry.id));
for (const [, storyletId] of axes) if (!storyletIds.has(storyletId)) throw new Error(`Missing Poet storylet ${storyletId}`);

const themeIds = [
  'professional_culture','status_anxiety','shame_reputation','class_power',
  'public_private_leakage','social_mask','alienation','local_knowledge_vs_system'
];
const recurringPeople = [
  {
    id:'medpoeten', social_function:'gjør poetisk håndverk, kollegial uenighet og feltstatus konkret',
    class_position:'skrivende poet med varierende publiseringshistorikk', status:'situert litterær feltstatus',
    power_over_player:'kan gi motlesning, påvirke omdømme og normalisere bestemte estetiske vaner',
    wants:'at dikt diskuteres på konkret språklig grunnlag', conceals:'at egen estetikk også kan bli en statusnorm',
    speech_style:'presis, billedbevisst og direkte', teaches_player:'at kollegial respons er informasjon, ikke fasit'
  },
  {
    id:'redaktoren', social_function:'representerer utvalg, manusarbeid og publiseringsport uten å eie poetidentiteten',
    class_position:'redaksjonell yrkesrolle i tidsskrift eller forlag', status:'institusjonell publiseringsmakt',
    power_over_player:'kan velge, foreslå endringer og tilby publisering, men ikke skape poetisk autoritet automatisk',
    wants:'et konsistent manus med tydelige valg', conceals:'at format og profil påvirker hva som får plass',
    speech_style:'kort, konkret og kompositorisk', teaches_player:'at publisering er en separat institusjonell hendelse'
  },
  {
    id:'opplesningsverten', social_function:'gjør scenen, publikum og honorargrensen konkret',
    class_position:'arrangør eller programansvarlig', status:'lokal kuratorisk og organisatorisk makt',
    power_over_player:'kan invitere, tidsavgrense og avtale vilkår, men ikke definere poetens verdi',
    wants:'en tydelig framføring og klare praktiske vilkår', conceals:'at synlighet og økonomi ofte blandes i forventningene',
    speech_style:'praktisk, tidsbevisst og publikumsorientert', teaches_player:'at framføring og betaling er egne avtaler'
  },
  {
    id:'den_noye_leseren', social_function:'representerer lesererfaring uten profesjonelt embete',
    class_position:'engasjert leser', status:'ingen formell institusjonell myndighet',
    power_over_player:'kan avsløre uklarhet, rytmebrudd og utilsiktede betydninger',
    wants:'å møte et dikt som tåler oppmerksom lesning', conceals:'at også leseren bringer egne forventninger',
    speech_style:'konkret, nysgjerrig og uten fagspråk som skjold', teaches_player:'at leserrespons viser virkninger, ikke dikterer løsninger'
  },
  {
    id:'tradisjonsleseren', social_function:'holder eldre poesi, former og intertekstuelle forbindelser synlige',
    class_position:'bibliotekar, forsker eller erfaren litteraturleser', status:'kilde- og tradisjonskunnskap',
    power_over_player:'kan identifisere allusjoner, likheter og historiske former uten å eie dagens estetikk',
    wants:'bevisst forhold til tradisjon og proveniens', conceals:'at også kanon og tradisjon er selektive',
    speech_style:'kildebevisst, historisk og forbeholden', teaches_player:'at påvirkning blir sterkere når den er kjent og bearbeidet'
  },
  {
    id:'skrivegruppevennen', social_function:'gjør tillit, respons og privat-offentlig lekkasje konkret',
    class_position:'peer i skrivegruppe eller nær litterær krets', status:'relasjonell tillit uten formell myndighet',
    power_over_player:'kan se tidlige utkast og påvirke revisjon gjennom nærhet',
    wants:'at respons blir brukt med selvstendig dømmekraft', conceals:'at omsorg kan gli over i people-pleasing',
    speech_style:'åpen, konkret og utforskende', teaches_player:'å skille registrert problem fra foreslått løsning'
  }
];
const phases = ['morning','lunch','afternoon','evening'];
const coverage = [];
for (let day = 1; day <= 14; day += 1) {
  const [threadId, storyletId, meaning] = axes[day - 1];
  const previousOne = axes[(day + 12) % 14][0];
  const previousTwo = axes[(day + 11) % 14][0];
  for (const phase of phases) {
    let beatType;
    let threadIds;
    let sentence;
    if (phase === 'morning') {
      beatType = 'info'; threadIds = [threadId];
      sentence = 'Morgenen avgrenser håndverksproblemet og gjør det observerbart før et valg tas.';
    } else if (phase === 'lunch') {
      beatType = 'conversation'; threadIds = [threadId];
      sentence = 'Midt på dagen møter praksisen en leser, kollega eller institusjonell stemme som gjør premissene synlige.';
    } else if (phase === 'afternoon') {
      beatType = 'decision'; threadIds = [previousTwo, previousOne, threadId];
      sentence = 'Ettermiddagen krever et konkret poetisk valg om språk, form, relasjon eller myndighetsgrense.';
    } else {
      beatType = 'private_consequence'; threadIds = [previousTwo, previousOne, threadId];
      sentence = 'Kvelden viser hvordan valget endrer teksten, praksisen, relasjonen eller neste revisjon.';
    }
    coverage.push({
      day, phase, beat_type: beatType,
      summary: `Dag ${day}: ${meaning}. ${sentence}`,
      thread_ids: threadIds,
      materialization_refs: [`${streamPath}#${storyletId}`]
    });
  }
}
const primaryThreads = axes.map(([id,,meaning], index) => {
  const day = index + 1;
  const days = [day, day % 14 + 1, (day + 1) % 14 + 1];
  return { id, relationship: meaning, beat_refs: days.flatMap((value) => [`${value}/afternoon`, `${value}/evening`]) };
});
const privateAftermath = [
  ['konkret_bilde','Abstrakte følelser blir oftere prøvd mot konkrete, sansbare detaljer.','bildet_for_forklaringen'],
  ['lyttende_revisjon','Rytme og linjebrudd blir testet både med øyet og høytlesning.','rytmen_i_munnen'],
  ['bevisst_tradisjon','Allusjon og påvirkning blir behandlet som forhold som kan etterspores og bearbeides.','tradisjonen_i_linja'],
  ['selvstendig_respons','Tilbakemeldinger blir sortert som lesererfaring før poeten velger egen løsning.','tilbakemeldingen_som_ma_sorteres'],
  ['skilt_livelihood','Poetisk praksis holdes separat fra publisering, honorar, støtte og andre økonomiske hendelser.','honoraret_er_ikke_identiteten']
].map(([id,description,storyletId]) => ({ id, description, materialization_refs:[`${streamPath}#${storyletId}`] }));
const delayedConsequences = [
  {id:'bildet_returnerer',setup_ref:'1/afternoon',return_ref:'5/evening',domains:['psyche','narrative']},
  {id:'stemmen_returnerer',setup_ref:'3/afternoon',return_ref:'6/evening',domains:['narrative','relationship']},
  {id:'formen_returnerer',setup_ref:'4/afternoon',return_ref:'9/evening',domains:['psyche','narrative']},
  {id:'tradisjonen_returnerer',setup_ref:'8/afternoon',return_ref:'12/evening',domains:['reputation','narrative']},
  {id:'responsen_returnerer',setup_ref:'11/afternoon',return_ref:'14/evening',domains:['relationship','reputation']},
  {id:'avtalen_returnerer',setup_ref:'13/afternoon',return_ref:'14/afternoon',domains:['finance','reputation']}
];
const world = {
  schema:'civication_role_world_v1', version:1, category:'litteratur', role_scope:'litteratur_poet', subject_type:'life_position',
  life_position_ref:{badge_id:'litteratur',id:'poet',label:'Poet'},
  title:'Poet — bilde, rytme, form, revisjon og framføring', status:'role_world_complete',
  sociological_core:{
    main_problem:'å utvikle en vedvarende poetisk praksis der bilde, presisjon, rytme, linjebrudd, metafor, stemme, form, tradisjon, komposisjon og revisjon kan prøves konkret uten at mystikk, status, publisering eller inntekt blir erstatning for håndverket',
    description:'Poet er en employment-independent professional_practice for poetisk arbeid med bilde, konkret sansning, presisjon, rytme, linjebrudd, metafor, lyrisk jeg og persona, formbegrensning, tradisjon og allusjon, sekvens, revisjon, respons og framføring. Rollen er tydelig forskjellig fra Forfatter som bredere skrivepraksis og fra Skribent som sak-/tekstproduksjon: Poet avgrenser en lyrisk praksis og dens særlige arbeid med kondensert språk, lyd, linje og diktkomposisjon. Poetstatus gir ingen automatisk publisering, forlagsavtale, redaksjonell myndighet, royalty, honorar, stipend, direkte salg, jobb eller lønn; slike livelihood-hendelser krever separat proveniens og aksept. Rollen introduserer ingen ny runtime.'
  },
  theme_ids:themeIds,
  social_environments:[
    'skrivebord, notatbok og revisjonsøkter der språkvalg prøves over tid',
    'skrivegrupper der utkast møter motstridende lesererfaringer',
    'poesiopplesninger der side, stemme, publikum og praktiske vilkår møtes',
    'tidsskrift og forlag der manus kan vurderes uten at publisering definerer hele identiteten',
    'bibliotek, arkiv og bokhyller der tradisjon, form og allusjon kan etterspores',
    'poetiske offentligheter der estetikk, feltstatus, synlighet og økonomi lett blandes'
  ],
  recurring_people_archetypes:recurringPeople,
  slow_axes:axes.map(([id,,meaning]) => ({id,meaning,runtime_binding:'editorial_only_until_governed'})),
  season:{days:14,day_phases:phases,coverage},
  primary_threads:primaryThreads,
  private_aftermath:privateAftermath,
  delayed_consequences:delayedConsequences,
  materialization:{no_new_runtime:true,source_refs:axes.map(([,storyletId]) => `${streamPath}#${storyletId}`)}
};
writeJson(worldPath, world);

const indexPath = 'data/Civication/roleWorlds/index.json';
const index = readJson(indexPath);
uniquePush(index.roles, {
  category:'litteratur', role_scope:'litteratur_poet', subject_type:'life_position',
  life_position_ref:{badge_id:'litteratur',id:'poet',label:'Poet'}, status:'role_world_complete',
  path:worldPath, life_position_key:'litteratur/poet'
}, (entry) => entry.life_position_key || entry.path);
index.career_role_world_count = index.roles.filter((entry) => entry.subject_type !== 'life_position').length;
index.life_position_role_world_count = index.roles.filter((entry) => entry.subject_type === 'life_position').length;
index.summary.role_worlds_total = index.roles.length;
index.summary.career_role_worlds = index.career_role_world_count;
index.summary.life_position_role_worlds = index.life_position_role_world_count;
index.status = `${index.roles.length}_role_worlds_materialized`;
writeJson(indexPath, index);
if (index.roles.length !== 187 || index.life_position_role_world_count !== 102 || index.career_role_world_count !== 85) throw new Error('Unexpected Poet index counts');

const taxonomyPath = 'data/Civication/nonCareerRoleTaxonomy.json';
const taxonomy = readJson(taxonomyPath);
taxonomy.canonical_counts.life_position_role_worlds = 102;
taxonomy.canonical_counts.total_role_worlds = 187;
uniquePush(taxonomy.role_world_rollout_boundary.completed_life_position_role_worlds, 'litteratur/poet');
writeJson(taxonomyPath, taxonomy);

const checklistPath = 'data/Civication/roleWorldAuthoringChecklist.json';
const checklist = readJson(checklistPath);
uniquePush(checklist.reference_worlds, worldPath);
writeJson(checklistPath, checklist);

const policyPath = 'data/Civication/roleWorldPolicy.json';
const policy = readJson(policyPath);
policy.noncareer_subject_boundary.life_position_readiness.completed_life_position_role_worlds = 102;
writeJson(policyPath, policy);

const themePath = 'data/Civication/roleWorldThemeBank.json';
const themeBank = readJson(themePath);
themeBank.reference_profiles['litteratur/litteratur_poet'] = themeIds;
writeJson(themePath, themeBank);

let globalTest = readText('tests/civication-life-position-role-world-readiness.test.js');
globalTest = replaceOnce(globalTest, 'assert.equal(audit.summary.completed_life_position_role_worlds, 101);', 'assert.equal(audit.summary.completed_life_position_role_worlds, 102);', 'global completed count');
globalTest = replaceOnce(globalTest, 'assert.equal(audit.summary.pending_ready_positions, 1);', 'assert.equal(audit.summary.pending_ready_positions, 0);', 'global pending count');
globalTest = replaceOnce(globalTest, "assert.equal(audit.first_ready?.key, 'litteratur/poet');", 'assert.equal(audit.first_ready, null);', 'global first ready');
globalTest = replaceOnce(globalTest, "console.log('civication life-position Role World readiness v2 ok: 102 ready / 57 authored-depth / 40 not-standalone; 101 complete / 1 pending-ready');", "console.log('civication life-position Role World readiness v2 ok: 102 ready / 57 authored-depth / 40 not-standalone; 102 complete / no pending-ready');", 'global log');
writeText('tests/civication-life-position-role-world-readiness.test.js', globalTest);

let taxonomyTest = readText('tests/civication-noncareer-role-taxonomy.test.js');
taxonomyTest = replaceOnce(taxonomyTest, "assert.equal(roleWorldIndex.roles.length, 186, 'Role World-indeksen skal ha 85 karriereverdener + 101 life-position worlds');", "assert.equal(roleWorldIndex.roles.length, 187, 'Role World-indeksen skal ha 85 karriereverdener + 102 life-position worlds');", 'taxonomy total count');
taxonomyTest = replaceOnce(taxonomyTest, "assert.equal(lifePositionWorlds.length, 101, '101 canonical life-position worlds skal være materialisert, inkludert Litteraturkritiker');", "assert.equal(lifePositionWorlds.length, 102, '102 canonical life-position worlds skal være materialisert, inkludert Poet');", 'taxonomy life count');
const criticAssertions = "assert.deepEqual(lifeWorldByKey.get('litteratur/litteraturkritiker').life_position_ref, { badge_id: 'litteratur', id: 'litteraturkritiker', label: 'Litteraturkritiker' });\nassert.equal(lifeWorldByKey.get('litteratur/litteraturkritiker').role_scope, 'litteratur_litteraturkritiker');";
const poetAssertions = `${criticAssertions}\nassert.deepEqual(lifeWorldByKey.get('litteratur/poet').life_position_ref, { badge_id: 'litteratur', id: 'poet', label: 'Poet' });\nassert.equal(lifeWorldByKey.get('litteratur/poet').role_scope, 'litteratur_poet');`;
taxonomyTest = replaceOnce(taxonomyTest, criticAssertions, poetAssertions, 'Poet taxonomy assertions');
writeText('tests/civication-noncareer-role-taxonomy.test.js', taxonomyTest);

let contractTest = readText('tests/civication-role-world-contract.test.js');
contractTest = replaceOnce(contractTest, 'assert.equal(index.life_position_role_world_count, 101);', 'assert.equal(index.life_position_role_world_count, 102);', 'contract life count');
contractTest = replaceOnce(contractTest, 'assert.equal(index.roles.length, 186);', 'assert.equal(index.roles.length, 187);', 'contract total count');
writeText('tests/civication-role-world-contract.test.js', contractTest);

console.log('Poet materialization staged: 187 total / 102 life-position Role Worlds. Run readiness --write next.');
