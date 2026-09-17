#!/usr/bin/env node
'use strict';

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const write = (p, v) => fs.writeFileSync(path.join(ROOT, p), JSON.stringify(v, null, 2) + '\n');
const readText = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const writeText = (p, v) => fs.writeFileSync(path.join(ROOT, p), v);

const sourcePath = 'data/Civication/narratives/leisure/litteratur_skribent.json';
const worldPath = 'data/Civication/roleWorlds/litteratur/litteratur_skribent.json';
const source = read(sourcePath);

if (source.storylets.length !== 14) {
  throw new Error(`Skribent source must contain 14 storylets, got ${source.storylets.length}`);
}
const ids = new Set(source.storylets.map((x) => x.id));
if (ids.size !== 14) throw new Error('Skribent storylet ids must be unique');

const axes = [
  { id: 'brief', meaning: 'brief, formål og scope', story_id: 'brief_for_setningen' },
  { id: 'audience', meaning: 'leser, register og forkunnskap', story_id: 'leseren_for_stilen' },
  { id: 'source_claim', meaning: 'kilde, påstand og dokumentasjonsstyrke', story_id: 'pastanden_med_kilde' },
  { id: 'genre', meaning: 'sjanger, kanal og forventningskontrakt', story_id: 'sjangerens_kontrakt' },
  { id: 'structure', meaning: 'struktur, prioritering og avsnittsfunksjon', story_id: 'strukturen_som_prioriterer' },
  { id: 'clarity', meaning: 'klarhet, presisjon og nødvendig nyanse', story_id: 'klart_uten_a_bli_flatt' },
  { id: 'voice_authority', meaning: 'stemme, rolle og autoritetsgrense', story_id: 'stemmen_uten_lant_autoritet' },
  { id: 'attribution', meaning: 'sitat, parafrase og proveniens', story_id: 'sitatet_og_parafrasen' },
  { id: 'revision', meaning: 'utkast, omskriving og faglig distanse', story_id: 'utkastet_som_ikke_er_dom' },
  { id: 'editorial_feedback', meaning: 'redigering, problemforståelse og selvstendig løsning', story_id: 'redaktorens_problem_ikke_losning' },
  { id: 'deadline', meaning: 'frist, omfang og sannhetskrav', story_id: 'fristen_og_sannheten' },
  { id: 'publication', meaning: 'publisering, omdømme og statusgrense', story_id: 'publisering_er_en_hendelse' },
  { id: 'commission', meaning: 'oppdrag, kontrakt og honorargrense', story_id: 'oppdraget_er_en_avtale' },
  { id: 'portfolio', meaning: 'portefølje, refleksjon og praksislæring', story_id: 'portefoljen_som_larer' }
];
for (const axis of axes) {
  if (!ids.has(axis.story_id)) throw new Error(`Missing Skribent storylet ${axis.story_id}`);
}

const socialEnvironments = [
  'arbeidsbord og notatmapper der brief, kilder, struktur og utkast må holdes adskilt nok til å kunne revideres',
  'redaksjonelle samtaler der tekstens problem kan identifiseres uten at redaktørens første løsning blir automatisk fasit',
  'oppdragsdialoger der formål, målgruppe, leveranse, rettigheter, frist og betaling må avklares eksplisitt',
  'publiseringsflater der kanal, sjanger, leserforventning og omdømme påvirker teksten uten å skape automatisk jobbstatus',
  'kilde- og faktasjekksituasjoner der sterke formuleringer må tåle dokumentasjon og attribusjon',
  'skribentmiljøer der stil, profesjonalitet, portefølje og status kan komme i konflikt med leserens faktiske behov'
];

const people = [
  {
    id: 'oppdragsgiveren',
    social_function: 'gjør brief, leveranse, bruk, frist og betaling til eksplisitte makt- og avtaleforhold',
    class_position: 'kunde, organisasjon eller institusjon med et konkret tekstbehov',
    status: 'situert bestiller- og budsjettmakt over ett mulig oppdrag',
    power_over_player: 'kan definere behov, akseptere leveranse og tilby honorar, men kan ikke gjøre Skribent til fast jobb eller eie all faglig autoritet',
    wants: 'en tekst som løser et tydelig formål innen avtalte rammer',
    conceals: 'at ønsker om fart, profil og enkelhet kan presse mot overforenkling eller gratis merarbeid',
    speech_style: 'målrettet, praktisk og leveranseorientert',
    teaches_player: 'at identitet, oppdrag, kontrakt og inntekt er forskjellige lag'
  },
  {
    id: 'redaktoren',
    social_function: 'gjør lesbarhet, struktur, redigering og institusjonelle prioriteringer konkrete',
    class_position: 'redaksjonell yrkesrolle med ansvar for kvalitet, format eller publisering',
    status: 'institusjonell tekst- og publiseringsmakt i en konkret sammenheng',
    power_over_player: 'kan kreve omarbeiding eller avvise en tekst, men kan ikke eie alle faglige løsninger',
    wants: 'at teksten fungerer for leser, kanal og formål',
    conceals: 'at redaksjonelle preferanser også kan være vane, profil eller knapphet forklart som universell kvalitet',
    speech_style: 'kort, diagnostisk og prioriterende',
    teaches_player: 'å skille problemet en tilbakemelding peker på fra løsningsforslaget som følger med'
  },
  {
    id: 'fagkilden',
    social_function: 'gjør skillet mellom skribentstemme, ekspertise, sitat og attribusjon synlig',
    class_position: 'fagperson eller primærkilde med kunnskap skribenten trenger',
    status: 'kunnskapsautoritet på et avgrenset felt, ikke redaksjonell eier av hele teksten',
    power_over_player: 'kan korrigere fakta og nyanser og trekke tilbake støtte til feilaktig attribusjon',
    wants: 'at egne utsagn og faglige forbehold gjengis presist',
    conceals: 'at ekspertise på ett felt ikke nødvendigvis gir god vurdering av hele tekstens formål',
    speech_style: 'presis, korrigerende og forbeholdsbevisst',
    teaches_player: 'at tydelig tekst ikke krever at skribenten låner mer autoritet enn kilden gir'
  },
  {
    id: 'faktasjekkeren',
    social_function: 'gjør dokumentasjon, kildeproveniens og påstandsstyrke til konkret kvalitetsarbeid',
    class_position: 'redaksjonell eller kollegial kontrollfunksjon',
    status: 'prosessmakt over etterprøvbarhet, ikke over skribentidentiteten',
    power_over_player: 'kan stoppe eller svekke en formulering som ikke kan dokumenteres',
    wants: 'sporbare kilder og formuleringer som ikke er sterkere enn beviset',
    conceals: 'at også faktasjekk kan bli mekanisk hvis kontekst og språknyanse ignoreres',
    speech_style: 'spørrende, dokumenterende og konkret',
    teaches_player: 'å behandle flyt og sannsynlighet som noe annet enn dokumentasjon'
  },
  {
    id: 'den_faktiske_leseren',
    social_function: 'representerer mottakerens forkunnskap, tid, spørsmål og mulige misforståelser',
    class_position: 'leser uten formell makt over produksjonen',
    status: 'erfarings- og forståelsesautoritet som mottaker',
    power_over_player: 'kan avsløre at en teknisk korrekt tekst likevel er uklar, feilprioritert eller dårlig tilpasset',
    wants: 'å forstå hva som er viktig og hvorfor teksten angår situasjonen',
    conceals: 'at én leser ikke representerer hele målgruppen',
    speech_style: 'direkte, konkret og uten redaksjonelt fagspråk',
    teaches_player: 'at tilgjengelighet handler om å redusere unødvendig leserarbeid uten å flate ut innholdet'
  },
  {
    id: 'medskribenten',
    social_function: 'gjør håndverk, sammenligning, portefølje, status og kollegial støtte sosialt konkret',
    class_position: 'annen selvstendig eller institusjonelt tilknyttet tekstprodusent',
    status: 'situert profesjonsstatus med varierende publiserings- og oppdragserfaring',
    power_over_player: 'kan gi motlesning, dele arbeidsmetoder og påvirke normer for hva som teller som profesjonelt',
    wants: 'at teksten løser oppgaven uten å miste presisjon eller egen dømmekraft',
    conceals: 'at egen karrierebane og stil lett kan bli presentert som normalmodell',
    speech_style: 'kollegial, konkret og metodeorientert',
    teaches_player: 'at profesjonell praksis kan utvikles uten at én publisering, kunde eller arbeidsgiver definerer identiteten'
  }
];

const privateAftermath = [
  {
    id: 'briefet_sitter',
    description: 'Tekster starter oftere med eksplisitt formål, mottaker og scope før formuleringen får dominere.',
    materialization_refs: [`${sourcePath}#brief_for_setningen`]
  },
  {
    id: 'kildesporet_sitter',
    description: 'Påstander, sitater, parafraser og egne formuleringer får tydeligere proveniens gjennom arbeidsprosessen.',
    materialization_refs: [`${sourcePath}#sitatet_og_parafrasen`]
  },
  {
    id: 'revisjon_uten_dom',
    description: 'Omskriving blir behandlet som normalt håndverk fremfor dom over egen verdi.',
    materialization_refs: [`${sourcePath}#utkastet_som_ikke_er_dom`]
  },
  {
    id: 'leseren_er_synlig',
    description: 'Register, struktur og klarhet prøves oftere mot mottakerens faktiske behov og forkunnskap.',
    materialization_refs: [`${sourcePath}#leseren_for_stilen`]
  },
  {
    id: 'oppdraget_er_separat',
    description: 'Skribentidentitet holdes separat fra publisering, kontrakt, honorar, jobb og andre livelihood-hendelser.',
    materialization_refs: [`${sourcePath}#oppdraget_er_en_avtale`]
  }
];

const delayedConsequences = [
  { id: 'briefet_returnerer', setup_ref: '1/afternoon', return_ref: '5/evening', domains: ['narrative', 'reputation'] },
  { id: 'kilden_returnerer', setup_ref: '3/afternoon', return_ref: '8/evening', domains: ['narrative', 'reputation'] },
  { id: 'stemmen_returnerer', setup_ref: '7/afternoon', return_ref: '12/evening', domains: ['reputation', 'relationship'] },
  { id: 'revisjonen_returnerer', setup_ref: '9/afternoon', return_ref: '14/evening', domains: ['psyche', 'narrative'] },
  { id: 'fristen_returnerer', setup_ref: '11/afternoon', return_ref: '12/evening', domains: ['stress', 'reputation'] },
  { id: 'oppdraget_returnerer', setup_ref: '13/afternoon', return_ref: '14/afternoon', domains: ['finance', 'reputation'] }
];

const themeIds = [
  'professional_culture',
  'status_anxiety',
  'shame_reputation',
  'class_power',
  'public_private_leakage',
  'care_vs_efficiency'
];

const coverage = [];
for (let i = 0; i < axes.length; i += 1) {
  const day = i + 1;
  const axis = axes[i];
  const prev1 = axes[(i + axes.length - 1) % axes.length].id;
  const prev2 = axes[(i + axes.length - 2) % axes.length].id;
  const sourceRef = `${sourcePath}#${axis.story_id}`;
  const phases = [
    ['morning', 'info', 'Morgenen avgrenser tekstoppgaven og gjør formål, kilde eller mottakerbehov observerbart før et valg tas.'],
    ['lunch', 'conversation', 'Midt på dagen møter praksisen en leser, kilde, redaktør, bestiller eller kollega som gjør premisser og maktforhold synlige.'],
    ['afternoon', 'decision', 'Ettermiddagen krever et konkret valg om tekst, kilde, struktur, redigering, frist eller avtalegrense.'],
    ['evening', 'private_consequence', 'Kvelden viser hvordan valget endrer teksten, tilliten, arbeidsmåten, omdømmet eller neste revisjon.']
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
  role_scope: 'litteratur_skribent',
  subject_type: 'life_position',
  life_position_ref: { badge_id: 'litteratur', id: 'skribent', label: 'Skribent' },
  title: 'Skribent — brief, leser, kilde, struktur, redigering og leveranse',
  status: 'role_world_complete',
  sociological_core: {
    main_problem: 'å produsere formålsrettet og etterprøvbar tekst for ulike lesere og sjangre uten at stil, tidspress, publisering, bestillermakt eller profesjonell status blir erstatning for kildeansvar og selvstendig redaksjonelt skjønn',
    description: 'Skribent er en employment-independent professional_practice for formålsrettet tekstpraksis med brief, leser og register, kilde og påstand, sjanger, struktur, klarhet, stemme og autoritetsgrense, attribusjon, revisjon, redigering, frist, publisering, oppdrag og porteføljelæring. Skribent er tydelig forskjellig fra Forfatter som bredere litterær og skapende forfatterpraksis og fra Poet som lyrisk praksis med særlig arbeid i bilde, rytme, linje og diktkomposisjon. Skribentstatus gir ingen automatisk jobb, lønn, honorar, kontrakt, publiseringsplass eller oppdrag; slike livelihood- og arbeidsforhold krever separat proveniens og aksept. Rollen introduserer ingen ny runtime.'
  },
  theme_ids: themeIds,
  social_environments: socialEnvironments,
  recurring_people_archetypes: people,
  slow_axes: axes.map(({ id, meaning }) => ({
    id,
    meaning,
    runtime_binding: 'editorial_only_until_governed'
  })),
  season: {
    days: 14,
    day_phases: ['morning', 'lunch', 'afternoon', 'evening'],
    coverage
  },
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
if (!index.roles.some((entry) => entry.life_position_key === 'litteratur/skribent')) {
  index.roles.push({
    category: 'litteratur',
    role_scope: 'litteratur_skribent',
    subject_type: 'life_position',
    life_position_ref: { badge_id: 'litteratur', id: 'skribent', label: 'Skribent' },
    status: 'role_world_complete',
    path: worldPath,
    life_position_key: 'litteratur/skribent'
  });
}
index.career_role_world_count = index.roles.filter((x) => x.subject_type !== 'life_position').length;
index.life_position_role_world_count = index.roles.filter((x) => x.subject_type === 'life_position').length;
index.summary.role_worlds_total = index.roles.length;
index.summary.career_role_worlds = index.career_role_world_count;
index.summary.life_position_role_worlds = index.life_position_role_world_count;
index.status = `${index.roles.length}_role_worlds_materialized`;
write(indexPath, index);

if (index.roles.length !== 189 || index.life_position_role_world_count !== 104 || index.career_role_world_count !== 85) {
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
const assignment = findObjectWithKey(themeBank, 'litteratur/litteratur_skald');
if (!assignment) throw new Error('Could not locate Skald theme assignment');
assignment['litteratur/litteratur_skribent'] = themeIds;
write(themePath, themeBank);

const checklistPath = 'data/Civication/roleWorldAuthoringChecklist.json';
const checklist = read(checklistPath);
if (!appendToArrayContaining(checklist, 'data/Civication/roleWorlds/litteratur/litteratur_skald.json', worldPath)) {
  throw new Error('Could not locate completed world checklist array');
}
write(checklistPath, checklist);

const policyPath = 'data/Civication/roleWorldPolicy.json';
const policy = read(policyPath);
const completedPolicy = findObjectWithOwn(policy, 'completed_life_position_role_worlds');
if (!completedPolicy) throw new Error('Could not locate completed_life_position_role_worlds');
completedPolicy.completed_life_position_role_worlds = 104;
write(policyPath, policy);

const taxonomyPath = 'data/Civication/nonCareerRoleTaxonomy.json';
const taxonomy = read(taxonomyPath);
taxonomy.canonical_counts.life_position_role_worlds = 104;
taxonomy.canonical_counts.total_role_worlds = 189;
if (!appendToArrayContaining(taxonomy, 'litteratur/skald', 'litteratur/skribent')) {
  throw new Error('Could not locate taxonomy materialized life-position array');
}
write(taxonomyPath, taxonomy);

const replaceExact = (file, pairs) => {
  let text = readText(file);
  for (const [oldValue, newValue] of pairs) {
    if (!text.includes(oldValue)) {
      throw new Error(`Expected text not found in ${file}: ${oldValue}`);
    }
    text = text.replace(oldValue, newValue);
  }
  writeText(file, text);
};

replaceExact('tests/civication-life-position-role-world-readiness.test.js', [
  [
    `ready: 103,
  needs_authored_depth: 56,`,
    `ready: 104,
  needs_authored_depth: 55,`
  ],
  [
    'assert.equal(audit.summary.completed_life_position_role_worlds, 103);',
    'assert.equal(audit.summary.completed_life_position_role_worlds, 104);'
  ],
  [
    'assert.equal(audit.summary.positions_with_exact_governed_sources, 103);',
    'assert.equal(audit.summary.positions_with_exact_governed_sources, 104);'
  ],
  [
    'assert.equal(audit.summary.positions_with_multi_scene_narrative_foundation, 103);',
    'assert.equal(audit.summary.positions_with_multi_scene_narrative_foundation, 104);'
  ],
  [
    '103 ready / 56 authored-depth / 40 not-standalone; 103 complete / no pending-ready',
    '104 ready / 55 authored-depth / 40 not-standalone; 104 complete / no pending-ready'
  ]
]);

replaceExact('tests/civication-role-world-contract.test.js', [
  [
    'assert.equal(index.life_position_role_world_count, 103);',
    'assert.equal(index.life_position_role_world_count, 104);'
  ],
  [
    'assert.equal(index.roles.length, 188);',
    'assert.equal(index.roles.length, 189);'
  ]
]);

replaceExact('tests/civication-noncareer-role-taxonomy.test.js', [
  [
    "assert.equal(roleWorldIndex.roles.length, 188, 'Role World-indeksen skal ha 85 karriereverdener + 103 life-position worlds');",
    "assert.equal(roleWorldIndex.roles.length, 189, 'Role World-indeksen skal ha 85 karriereverdener + 104 life-position worlds');"
  ],
  [
    "assert.equal(lifePositionWorlds.length, 103, '103 canonical life-position worlds skal være materialisert, inkludert Poet og Skald');",
    "assert.equal(lifePositionWorlds.length, 104, '104 canonical life-position worlds skal være materialisert, inkludert Poet, Skald og Skribent');"
  ],
  [
    'life_position_role_worlds: 103,\n  total_role_worlds: 188,',
    'life_position_role_worlds: 104,\n  total_role_worlds: 189,'
  ],
  [
    '85 career Role Worlds + 103 life-position worlds',
    '85 career Role Worlds + 104 life-position worlds'
  ]
]);

replaceExact('tests/civication-naeringsliv-frilanser-life-position-readiness.test.js', [
  [
    "  'data/Civication/narratives/leisure/litteratur_skald.json',\n  'data/Civication/narratives/leisure/subkultur_gangster.json'",
    "  'data/Civication/narratives/leisure/litteratur_skald.json',\n  'data/Civication/narratives/leisure/litteratur_skribent.json',\n  'data/Civication/narratives/leisure/subkultur_gangster.json'"
  ]
]);

console.log('Temporary Skribent materializer prepared canonical 189/104 state.');
