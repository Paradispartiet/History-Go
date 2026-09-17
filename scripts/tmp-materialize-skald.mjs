#!/usr/bin/env node
'use strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const write = (p, v) => fs.writeFileSync(path.join(ROOT, p), JSON.stringify(v, null, 2) + '\n');
const readText = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const writeText = (p, v) => fs.writeFileSync(path.join(ROOT, p), v);

const sourcePath = 'data/Civication/narratives/leisure/litteratur_skald.json';
const worldPath = 'data/Civication/roleWorlds/litteratur/litteratur_skald.json';
const source = read(sourcePath);
if (source.storylets.length !== 14) throw new Error(`Skald source must contain 14 storylets, got ${source.storylets.length}`);
const ids = new Set(source.storylets.map((x) => x.id));
if (ids.size !== 14) throw new Error('Skald storylet ids must be unique');

const axes = [
  {"id":"oral_memory","meaning":"muntlighet, lyd og hukommelse","story_id":"muntligheten_for_siden"},
  {"id":"alliteration","meaning":"allitterasjon og trykk","story_id":"allitterasjonen_som_baerer"},
  {"id":"meter","meaning":"metrisk kontroll og eksplisitt formvalg","story_id":"metret_som_ma_holde"},
  {"id":"kenning","meaning":"kenning, billedledd og semantisk presisjon","story_id":"kenningen_med_to_ledd"},
  {"id":"diction","meaning":"historisk diksjon uten språklig kostyme","story_id":"ordvalget_uten_kostyme"},
  {"id":"praise_truth","meaning":"lovprisning, patronasje og maktgrense","story_id":"lovprisning_uten_smiger"},
  {"id":"genealogy_memory","meaning":"genealogi, minne og kildekritikk","story_id":"minnet_og_slektsrekken"},
  {"id":"performance","meaning":"framføring, syntaks og lytterorientering","story_id":"framforingen_som_hukommelse"},
  {"id":"manuscript_transmission","meaning":"manuskript, overlevering og proveniens","story_id":"handskriftet_er_et_spor"},
  {"id":"historical_language","meaning":"gammelnorsk språkgrense og autentisitetskrav","story_id":"gammelnorsk_er_ikke_dekor"},
  {"id":"reconstruction","meaning":"rekonstruksjon, usikkerhet og kildegrense","story_id":"rekonstruksjon_eller_oppfinnelse"},
  {"id":"context_ethics","meaning":"ære, vold og historisk kontekst","story_id":"aeren_uten_romantisering"},
  {"id":"audience_memory","meaning":"publikum, formular og medhukommelse","story_id":"publikum_som_medhukommelse"},
  {"id":"modern_boundary","meaning":"moderne skaldisk identitet uten historisk embete eller automatisk inntekt","story_id":"skald_i_natid"}
];
for (const axis of axes) {
  if (!ids.has(axis.story_id)) throw new Error(`Missing Skald storylet ${axis.story_id}`);
}

const socialEnvironments = [
  "arbeidsbord og høytlesningsøkter der lyd, metrum, kenninger og diksjon prøves konkret",
  "bibliotek, arkiv og digitale tekstutgaver der manuskript, datering, språk og proveniens kan kontrolleres",
  "litterære og historiske miljøer der moderne rekonstruksjon møter ulike krav til autentisitet",
  "opplesninger og arrangementer der kompleks form må fungere for et faktisk publikum",
  "samtaler med filologer, historikere og lesere som skiller kildebevis fra kunstnerisk frihet",
  "bestillingssituasjoner der lovprisning, betaling, omdømme og sannhetskrav kan trekke i ulike retninger"
];
const people = [
  {
    "id":"norrønfilologen",
    "social_function":"gjør språk, metrum og kildeusikkerhet etterprøvbart",
    "class_position":"fagperson med kompetanse i norrønt språk og middelaldertekster",
    "status":"kilde- og språkfaglig autoritet, ikke kunstnerisk fasit",
    "power_over_player":"kan avdekke feil i språkbruk, datering og formpåstander, men kan ikke tildele skaldidentitet",
    "wants":"at historiske påstander er mindre enn eller lik kildegrunnlaget",
    "conceals":"at faglig presisjon også kan bli et statusspråk som skremmer bort nye utøvere",
    "speech_style":"presis, kildebevisst og tydelig om usikkerhet",
    "teaches_player":"å skille dokumentert form, sannsynlig rekonstruksjon og moderne oppfinnelse"
  },
  {
    "id":"medskalden",
    "social_function":"gjør håndverk, konkurranse og moderne tradisjonsbruk sosialt konkret",
    "class_position":"moderne utøver som arbeider med skaldisk eller norrønt inspirert form",
    "status":"situert miljøstatus uten historisk embete",
    "power_over_player":"kan gi motlesning og påvirke miljøets normer for form og autentisitet",
    "wants":"at teknisk vanskelighet brukes til å skape mening, ikke bare status",
    "conceals":"at egen foretrukne rekonstruksjon lett kan presenteres som den eneste legitime",
    "speech_style":"teknisk, muntlig og konkurransepreget",
    "teaches_player":"at tradisjonspraksis krever både disiplin og eksplisitte grenser"
  },
  {
    "id":"arkivaren",
    "social_function":"holder manuskript, katalog, datering og tekstvitne adskilt fra forestillingen om en original framføring",
    "class_position":"arkiv- eller bibliotekfaglig forvalter",
    "status":"institusjonell tilgangs- og provenienskunnskap",
    "power_over_player":"kan gi tilgang til kilder og korrigere påstander om overlevering",
    "wants":"at sitat, tekstvitne og kildehistorie beskrives korrekt",
    "conceals":"at institusjonelle kataloger også er historiske produkter med egne begrensninger",
    "speech_style":"kort, dokumenterende og forbeholden",
    "teaches_player":"at et bevart manuskript er et vitne, ikke et lydopptak av opprinnelsen"
  },
  {
    "id":"opplesningsverten",
    "social_function":"gjør framføring, tid, publikum og praktiske vilkår konkrete",
    "class_position":"arrangør i litteratur- eller historiearena",
    "status":"lokal program- og scenemakt",
    "power_over_player":"kan invitere og sette rammer for framføring, men ikke gjøre moderne praksis historisk autentisk",
    "wants":"en framføring publikum kan følge og en tydelig presentasjon av hva som er historisk og moderne",
    "conceals":"at arrangementets behov for tydelig profil kan presse fram enklere autentisitetsfortellinger",
    "speech_style":"praktisk, tidsbevisst og publikumsorientert",
    "teaches_player":"at sceneformat og sannhetskrav må forhandles separat"
  },
  {
    "id":"historieleseren",
    "social_function":"representerer et interessert publikum som spør hva som faktisk er bevart",
    "class_position":"engasjert leser uten formell institusjonell myndighet",
    "status":"uformell tillit og nysgjerrighet",
    "power_over_player":"kan avsløre når teksten blander historie, myte og moderne rekonstruksjon",
    "wants":"å kunne nyte formen uten å bli villedet om kildestatus",
    "conceals":"at også publikum kan foretrekke den mest dramatiske versjonen",
    "speech_style":"direkte, konkret og spørsmålsdrevet",
    "teaches_player":"at forståelig kildegrense styrker snarere enn svekker fortellingen"
  },
  {
    "id":"bestilleren",
    "social_function":"gjør lovprisning, patronasje, omdømme og betaling til eksplisitte maktforhold",
    "class_position":"moderne oppdragsgiver eller institusjon som ønsker en historiserende tekst",
    "status":"økonomisk eller organisatorisk makt over et konkret oppdrag",
    "power_over_player":"kan tilby betaling og synlighet, men ikke eie den historiske sannheten eller skaldidentiteten",
    "wants":"en tekst som fungerer for anledning og publikum",
    "conceals":"at ønsket om glans kan skape press mot overdrivelse og falsk autentisitet",
    "speech_style":"målrettet, omdømmebevisst og resultatorientert",
    "teaches_player":"at betaling, lovprisning og kildeansvar er tre forskjellige spørsmål"
  }
];
const privateAftermath = [
  {"id":"stemmen_sitter","description":"Teksten blir oftere prøvd muntlig før den behandles som ferdig.","materialization_refs":["data/Civication/narratives/leisure/litteratur_skald.json#muntligheten_for_siden"]},
  {"id":"formen_kan_forklares","description":"Metriske og allitterative valg kan beskrives konkret i stedet for å forsvares med historisk aura.","materialization_refs":["data/Civication/narratives/leisure/litteratur_skald.json#metret_som_ma_holde"]},
  {"id":"kilden_er_synlig","description":"Genealogi, manuskript og rekonstruksjon merkes med tydeligere proveniens og usikkerhet.","materialization_refs":["data/Civication/narratives/leisure/litteratur_skald.json#rekonstruksjon_eller_oppfinnelse"]},
  {"id":"makt_i_lovstrofen","description":"Lovprisning og heroisk materiale leses sammen med patronasje, makt og menneskelige kostnader.","materialization_refs":["data/Civication/narratives/leisure/litteratur_skald.json#lovprisning_uten_smiger"]},
  {"id":"moderne_grense","description":"Skaldidentiteten forblir en moderne valgt historisk-stilistisk praksis og gir ingen automatisk jobb, lønn eller kildeautoritet.","materialization_refs":["data/Civication/narratives/leisure/litteratur_skald.json#skald_i_natid"]}
];
const delayedConsequences = [
  {"id":"muntligheten_returnerer","setup_ref":"1/afternoon","return_ref":"8/evening","domains":["narrative","reputation"]},
  {"id":"metret_returnerer","setup_ref":"3/afternoon","return_ref":"13/evening","domains":["narrative","psyche"]},
  {"id":"lovprisningen_returnerer","setup_ref":"6/afternoon","return_ref":"12/evening","domains":["reputation","relationship"]},
  {"id":"kilden_returnerer","setup_ref":"7/afternoon","return_ref":"11/evening","domains":["narrative","reputation"]},
  {"id":"manuskriptet_returnerer","setup_ref":"9/afternoon","return_ref":"14/evening","domains":["narrative","relationship"]},
  {"id":"bestillingen_returnerer","setup_ref":"14/afternoon","return_ref":"1/evening","domains":["finance","reputation"]}
];
const themeIds = ["professional_culture","status_anxiety","shame_reputation","class_power","public_private_leakage","social_mask","alienation","local_knowledge_vs_system"];

const coverage = [];
for (let i = 0; i < axes.length; i += 1) {
  const day = i + 1;
  const axis = axes[i];
  const prev1 = axes[(i + axes.length - 1) % axes.length].id;
  const prev2 = axes[(i + axes.length - 2) % axes.length].id;
  const sourceRef = `${sourcePath}#${axis.story_id}`;
  const phases = [
    ['morning', 'info', 'Morgenen avgrenser det historiske eller formelle problemet og skiller kilde, teknikk og moderne etterligning.'],
    ['lunch', 'conversation', 'Midt på dagen møter praksisen en leser, fagperson eller arrangør som gjør premissene og maktforholdet synlig.'],
    ['afternoon', 'decision', 'Ettermiddagen krever et konkret valg om form, kildebruk, framføring eller historisk påstand.'],
    ['evening', 'private_consequence', 'Kvelden viser hvordan valget endrer teksten, tilliten til kildene, relasjonen til publikum eller neste revisjon.']
  ];
  for (const [phase, beatType, phaseText] of phases) {
    coverage.push({
      day,
      phase,
      beat_type: beatType,
      summary: `Dag ${day}: ${axis.meaning}. ${phaseText}`,
      thread_ids: (phase === 'afternoon' || phase === 'evening') ? [prev2, prev1, axis.id] : [axis.id],
      materialization_refs: [sourceRef]
    });
  }
}

const primaryThreads = axes.map((axis, i) => {
  const d1 = i + 1;
  const d2 = ((i + 1) % axes.length) + 1;
  const d3 = ((i + 2) % axes.length) + 1;
  return {
    id: axis.id,
    relationship: axis.meaning,
    beat_refs: [
      `${d1}/afternoon`, `${d1}/evening`,
      `${d2}/afternoon`, `${d2}/evening`,
      `${d3}/afternoon`, `${d3}/evening`
    ]
  };
});

const world = {
  schema: 'civication_role_world_v1',
  version: 1,
  category: 'litteratur',
  role_scope: 'litteratur_skald',
  subject_type: 'life_position',
  life_position_ref: { badge_id: 'litteratur', id: 'skald', label: 'Skald' },
  title: 'Skald — muntlighet, metrum, kenning, kilde og historisk rekonstruksjon',
  status: 'role_world_complete',
  sociological_core: {
    main_problem: 'å bruke en krevende historisk poetisk tradisjon som moderne praksis uten å gjøre teknisk vanskelighet, arkaisk språk, lovprisning eller selvvalgt identitet til falsk historisk autoritet',
    description: 'Skald er en employment-independent historical_stylistic_identity for moderne arbeid med skaldisk og norrønt inspirert form. Rollen undersøker muntlighet og hukommelse, allitterasjon, metrum og skandering, kenning og spesialisert diksjon, lovprisning og patronasje, genealogi og historisk minne, framføring, manuskripttransmisjon, gammelnorsk språkgrense, rekonstruksjon, ære/vold i kontekst og publikums medhukommelse. Skald er tydelig forskjellig fra Poet: Poet dekker bred moderne lyrisk praksis, mens Skald krever eksplisitt forhold til historiske former, kilder og rekonstruksjonsgrenser. Betegnelsen gir ingen middelaldersk rolle, historisk autentisitetsstempel, faglig kildeautoritet, ansettelse, oppdrag, inntekt, jobb eller lønn. Eventuell betaling eller bestilling må komme gjennom eksisterende livelihood-/økonomikjeder. Rollen introduserer ingen ny runtime.'
  },
  theme_ids: themeIds,
  social_environments: socialEnvironments,
  recurring_people_archetypes: people,
  slow_axes: axes.map((axis) => ({ id: axis.id, meaning: axis.meaning, runtime_binding: 'editorial_only_until_governed' })),
  season: { days: 14, day_phases: ['morning', 'lunch', 'afternoon', 'evening'], coverage },
  primary_threads: primaryThreads,
  private_aftermath: privateAftermath,
  delayed_consequences: delayedConsequences,
  materialization: {
    no_new_runtime: true,
    source_refs: axes.map((axis) => `${sourcePath}#${axis.story_id}`)
  }
};
write(worldPath, world);

const indexPath = 'data/Civication/roleWorlds/index.json';
const index = read(indexPath);
if (!index.roles.some((entry) => entry.life_position_key === 'litteratur/skald')) {
  index.roles.push({
    category: 'litteratur',
    role_scope: 'litteratur_skald',
    subject_type: 'life_position',
    life_position_ref: { badge_id: 'litteratur', id: 'skald', label: 'Skald' },
    status: 'role_world_complete',
    path: worldPath,
    life_position_key: 'litteratur/skald'
  });
}
index.career_role_world_count = index.roles.filter((x) => x.subject_type !== 'life_position').length;
index.life_position_role_world_count = index.roles.filter((x) => x.subject_type === 'life_position').length;
index.summary.role_worlds_total = index.roles.length;
index.summary.career_role_worlds = index.career_role_world_count;
index.summary.life_position_role_worlds = index.life_position_role_world_count;
index.status = `${index.roles.length}_role_worlds_materialized`;
write(indexPath, index);
if (index.roles.length !== 188 || index.life_position_role_world_count !== 103 || index.career_role_world_count !== 85) {
  throw new Error(`Unexpected Role World totals: ${index.roles.length} / ${index.career_role_world_count} / ${index.life_position_role_world_count}`);
}

const findObjectWithKey = (node, key) => {
  if (!node || typeof node !== 'object') return null;
  if (!Array.isArray(node) && Object.prototype.hasOwnProperty.call(node, key)) return node;
  for (const value of Object.values(node)) {
    const found = findObjectWithKey(value, key);
    if (found) return found;
  }
  return null;
};
const findObjectWithOwn = (node, key) => {
  if (!node || typeof node !== 'object') return null;
  if (!Array.isArray(node) && Object.prototype.hasOwnProperty.call(node, key)) return node;
  for (const value of Object.values(node)) {
    const found = findObjectWithOwn(value, key);
    if (found) return found;
  }
  return null;
};
const appendToArrayContaining = (node, needle, value) => {
  if (!node || typeof node !== 'object') return false;
  if (Array.isArray(node) && node.includes(needle)) {
    if (!node.includes(value)) node.push(value);
    return true;
  }
  for (const child of Object.values(node)) {
    if (appendToArrayContaining(child, needle, value)) return true;
  }
  return false;
};

const themePath = 'data/Civication/roleWorldThemeBank.json';
const themeBank = read(themePath);
const assignment = findObjectWithKey(themeBank, 'litteratur/litteratur_poet');
if (!assignment) throw new Error('Could not locate Poet theme assignment');
assignment['litteratur/litteratur_skald'] = themeIds;
write(themePath, themeBank);

const checklistPath = 'data/Civication/roleWorldAuthoringChecklist.json';
const checklist = read(checklistPath);
if (!appendToArrayContaining(checklist, 'data/Civication/roleWorlds/litteratur/litteratur_poet.json', worldPath)) {
  throw new Error('Could not locate completed world checklist array');
}
write(checklistPath, checklist);

const policyPath = 'data/Civication/roleWorldPolicy.json';
const policy = read(policyPath);
const completedPolicy = findObjectWithOwn(policy, 'completed_life_position_role_worlds');
if (!completedPolicy) throw new Error('Could not locate completed_life_position_role_worlds');
completedPolicy.completed_life_position_role_worlds = 103;
write(policyPath, policy);

const taxonomyPath = 'data/Civication/nonCareerRoleTaxonomy.json';
const taxonomy = read(taxonomyPath);
taxonomy.canonical_counts.life_position_role_worlds = 103;
taxonomy.canonical_counts.total_role_worlds = 188;
if (!appendToArrayContaining(taxonomy, 'litteratur/poet', 'litteratur/skald')) {
  throw new Error('Could not locate taxonomy materialized life-position array');
}
write(taxonomyPath, taxonomy);

const replaceExact = (file, pairs) => {
  let text = readText(file);
  for (const [oldValue, newValue] of pairs) {
    if (!text.includes(oldValue)) throw new Error(`Expected text not found in ${file}: ${oldValue}`);
    text = text.replace(oldValue, newValue);
  }
  writeText(file, text);
};

replaceExact('tests/civication-life-position-role-world-readiness.test.js', [
  ['ready: 102,\n  needs_authored_depth: 57,', 'ready: 103,\n  needs_authored_depth: 56,'],
  ['assert.equal(audit.summary.completed_life_position_role_worlds, 102);', 'assert.equal(audit.summary.completed_life_position_role_worlds, 103);'],
  ['assert.equal(audit.summary.positions_with_exact_governed_sources, 102);', 'assert.equal(audit.summary.positions_with_exact_governed_sources, 103);'],
  ['assert.equal(audit.summary.positions_with_multi_scene_narrative_foundation, 102);', 'assert.equal(audit.summary.positions_with_multi_scene_narrative_foundation, 103);'],
  ['102 ready / 57 authored-depth / 40 not-standalone; 102 complete / no pending-ready', '103 ready / 56 authored-depth / 40 not-standalone; 103 complete / no pending-ready']
]);

replaceExact('tests/civication-role-world-contract.test.js', [
  ['assert.equal(index.life_position_role_world_count, 102);', 'assert.equal(index.life_position_role_world_count, 103);'],
  ['assert.equal(index.roles.length, 187);', 'assert.equal(index.roles.length, 188);']
]);

replaceExact('tests/civication-noncareer-role-taxonomy.test.js', [
  ['life_position_role_worlds: 102,\n  total_role_worlds: 187,', 'life_position_role_worlds: 103,\n  total_role_worlds: 188,'],
  ['assert.deepEqual(roleWorldIndex.summary, { role_worlds_total: 187, career_role_worlds: 85, life_position_role_worlds: 102 });',
   'assert.deepEqual(roleWorldIndex.summary, { role_worlds_total: 188, career_role_worlds: 85, life_position_role_worlds: 103 });'],
  ['85 career Role Worlds + 102 life-position worlds', '85 career Role Worlds + 103 life-position worlds']
]);

console.log(JSON.stringify({
  source_storylets: source.storylets.length,
  role_worlds_total: index.roles.length,
  career_role_worlds: index.career_role_world_count,
  life_position_role_worlds: index.life_position_role_world_count,
  skald_world: worldPath
}, null, 2));
