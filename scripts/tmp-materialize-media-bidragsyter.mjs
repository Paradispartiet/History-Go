#!/usr/bin/env node
'use strict';

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const write = (p, v) => fs.writeFileSync(path.join(ROOT, p), JSON.stringify(v, null, 2) + '\n');
const readText = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const writeText = (p, v) => fs.writeFileSync(path.join(ROOT, p), v);

const sourcePath = 'data/Civication/narratives/leisure/media_bidragsyter.json';
const worldPath = 'data/Civication/roleWorlds/media/media_bidragsyter.json';
const source = read(sourcePath);

if (source.storylets.length !== 14) {
  throw new Error(`Bidragsyter source must contain 14 storylets, got ${source.storylets.length}`);
}
const ids = new Set(source.storylets.map((x) => x.id));
if (ids.size !== 14) throw new Error('Bidragsyter storylet ids must be unique');

const axes = [
  { id: 'scope_invitation', meaning: 'invitasjon, scope og rolleavklaring', story_id: 'invitasjonen_uten_stilling' },
  { id: 'pitch_fit', meaning: 'pitch, format og redaksjonell relevans', story_id: 'pitchen_for_arbeidet' },
  { id: 'source_provenance', meaning: 'kildegrunnlag, sporbarhet og påstand', story_id: 'kilden_bak_detaljen' },
  { id: 'consent_rights', meaning: 'samtykke, personvern og bruksrett', story_id: 'personen_i_materialet' },
  { id: 'editorial_revision', meaning: 'redigering, mening og redaksjonelt samarbeid', story_id: 'redigeringen_av_ditt_bidrag' },
  { id: 'credit', meaning: 'kreditering, attribusjon og rolleklarhet', story_id: 'kreditten_som_mangler' },
  { id: 'conflict_disclosure', meaning: 'interessekonflikt, nærhet og opplysning', story_id: 'interessekonflikten' },
  { id: 'deadline_scope', meaning: 'frist, omfang og leveransedisiplin', story_id: 'fristen_og_omfanget' },
  { id: 'rejection', meaning: 'avslag, redaksjonell vurdering og publiseringsgrense', story_id: 'avslaget_uten_dom' },
  { id: 'audience_response', meaning: 'publikumsrespons, ansvar og talspersonsgrense', story_id: 'reaksjonene_etter_publisering' },
  { id: 'correction', meaning: 'retting, ansvar og etterprøvbarhet', story_id: 'feilen_du_finner_selv' },
  { id: 'reuse_rights', meaning: 'gjenbruk, rettigheter og arkiv', story_id: 'gjenbruk_av_materialet' },
  { id: 'collaboration', meaning: 'samarbeid, arbeidsdeling og kreditering', story_id: 'samarbeidet_med_en_annen' },
  { id: 'continuity_boundary', meaning: 'gjentatte bidrag, relasjon og grensen mot fast rolle', story_id: 'neste_bidrag_uten_automatikk' }
];
for (const axis of axes) {
  if (!ids.has(axis.story_id)) throw new Error(`Missing Bidragsyter storylet ${axis.story_id}`);
}

const socialEnvironments = [
  'små redaksjoner, publikasjoner og kanaler der et konkret bidrag må avgrenses uten at deltakelsen blir en stilling',
  'pitch- og innsendingsoverflater der relevans, format, dokumentasjon og forventninger vurderes før publisering',
  'redigeringsprosesser der bidragsyterens ansvar møter redaksjonell beslutningsmyndighet uten å bli identisk med den',
  'kilde- og samtykkesituasjoner der tilgang til opplysninger eller materiale ikke automatisk gir rett til offentlig bruk',
  'publiseringsflater der kreditering, respons, rettelser og omdømme gjør ansvarsgrensene synlige',
  'samarbeid mellom bidragsytere der arbeidsdeling, kreditt, versjoner og gjenbruk må avklares eksplisitt'
];

const people = [
  {
    id: 'den_ansvarlige_redaktoren',
    social_function: 'gjør redaksjonell vurdering, publisering, redigering og ansvarslinje konkret',
    class_position: 'formell redaksjonell rolle med beslutningsansvar for en publiseringsflate',
    status: 'institusjonell publiseringsmyndighet som bidragsyteren ikke automatisk deler',
    power_over_player: 'kan akseptere, redigere, utsette eller avvise bidraget, men kan ikke gjøre bidragsyteren til ansatt uten separat avtale',
    wants: 'et etterprøvbart bidrag som passer kanalens behov, format og ansvarskrav',
    conceals: 'at plass, timing, profil og kapasitet kan påvirke vurderingen like mye som isolert kvalitet',
    speech_style: 'kort, prioriterende og redaksjonelt avgrensende',
    teaches_player: 'å skille eget bidragsansvar fra redaksjonell myndighet'
  },
  {
    id: 'kilden',
    social_function: 'gjør proveniens, presisjon, attribusjon og faktagrense konkrete',
    class_position: 'person eller dokumentbærer med situert kunnskap om en del av bidraget',
    status: 'kunnskapsautoritet på et avgrenset område, ikke eier av hele publiseringen',
    power_over_player: 'kan korrigere opplysninger og utfordre hvordan utsagn er gjengitt',
    wants: 'at informasjon og forbehold brukes presist og i riktig kontekst',
    conceals: 'at egen interesse eller nærhet også kan forme hva som fortelles og utelates',
    speech_style: 'detaljert, korrigerende og kontekstsensitiv',
    teaches_player: 'at en påstand må ha tydeligere grunnlag enn at den virker plausibel'
  },
  {
    id: 'personen_i_materialet',
    social_function: 'gjør samtykke, privatliv og bruksrett til en relasjonell grense',
    class_position: 'person som omtales, siteres, fotograferes eller høres i materialet',
    status: 'part med egne interesser og rettigheter uten redaksjonell kontroll over hele verket',
    power_over_player: 'kan protestere mot bruk, kontekst eller manglende avklaring og dermed gjøre tillitsbrudd synlig',
    wants: 'forutsigbarhet om hvordan egen stemme, identitet eller framstilling brukes',
    conceals: 'at forventningene til privathet og offentlighet kan være annerledes enn bidragsyteren antar',
    speech_style: 'personlig, situert og grensesettende',
    teaches_player: 'å skille tilgang til materiale fra rett eller samtykke til publisering'
  },
  {
    id: 'medbidragsyteren',
    social_function: 'gjør arbeidsdeling, versjonsflyt, kreditering og felles ansvar konkret',
    class_position: 'annen deltaker uten nødvendig fast redaksjonell rolle',
    status: 'kollegial prosjektstatus som kan være synlig uten å gi hierarkisk myndighet',
    power_over_player: 'kan påvirke leveransen gjennom egen del, samtykke og krediteringskrav',
    wants: 'en tydelig arbeidsdeling og rettferdig attribusjon av det felles arbeidet',
    conceals: 'at ulike forventninger til innsats og synlighet kan bli konflikt først ved deadline',
    speech_style: 'kollegial, praktisk og forhandlende',
    teaches_player: 'å avklare samarbeid før uklarhet blir til kreditt- eller leveransekonflikt'
  },
  {
    id: 'den_erfarne_bidragyteren',
    social_function: 'viser hvordan gjentatt deltakelse kan gi rutine og relasjoner uten automatisk fast rolle',
    class_position: 'gjentakende ekstern eller frivillig bidragsyter med mer publiseringserfaring',
    status: 'uformell erfaringsstatus uten automatisk journalistisk eller redaksjonell myndighet',
    power_over_player: 'kan påvirke normer for pitch, levering, kreditering og håndtering av avslag',
    wants: 'at nye bidragsytere lærer praktiske grenser uten å overtolke synlighet som ansettelse',
    conceals: 'at egen vei inn i miljøet kan framstå mer universell enn den faktisk er',
    speech_style: 'erfaringsbasert, konkret og litt lakonisk',
    teaches_player: 'at kontinuitet må bygges gjennom nye avklaringer, ikke statusantakelser'
  },
  {
    id: 'den_kritiske_leseren',
    social_function: 'gjør offentlig respons, feil, uklarhet og tillit synlig etter publisering',
    class_position: 'publikummer uten formell kontroll over redaksjonen eller bidragsyteren',
    status: 'situert mottaker med mulighet til å utfordre påstander og framstilling offentlig',
    power_over_player: 'kan oppdage feil, stille spørsmål og påvirke omdømme, men kan ikke definere bidragsyterens formelle rolle',
    wants: 'forståelige, etterprøvbare bidrag og synlige rettelser når noe er feil',
    conceals: 'at én sterk reaksjon ikke nødvendigvis representerer hele publikum',
    speech_style: 'direkte, spørsmålsdrevet og detaljorientert',
    teaches_player: 'å svare for eget bidrag uten å opptre som talsperson for hele mediet'
  }
];

const privateAftermath = [
  {
    id: 'scope_for_status',
    description: 'Nye bidrag starter oftere med avklart format, omfang, frist og beslutningslinje før synlighet eller status får dominere.',
    materialization_refs: [`${sourcePath}#invitasjonen_uten_stilling`]
  },
  {
    id: 'kildesporet_sitter',
    description: 'Fakta, erfaring og tolkning holdes tydeligere fra hverandre før innsending.',
    materialization_refs: [`${sourcePath}#kilden_bak_detaljen`]
  },
  {
    id: 'samtykke_for_bruk',
    description: 'Tilgang til bilde, lyd eller sitat blir ikke lenger behandlet som automatisk tillatelse til offentlig bruk.',
    materialization_refs: [`${sourcePath}#personen_i_materialet`]
  },
  {
    id: 'retting_uten_forsvar',
    description: 'Feil etter publisering håndteres raskere som korrigerbart ansvar fremfor som angrep på identiteten.',
    materialization_refs: [`${sourcePath}#feilen_du_finner_selv`]
  },
  {
    id: 'bidrag_uten_fastrolle',
    description: 'Gjentatt publisering og gode relasjoner holdes separat fra jobb, honorar, kontrakt og redaksjonell myndighet.',
    materialization_refs: [`${sourcePath}#neste_bidrag_uten_automatikk`]
  }
];

const delayedConsequences = [
  { id: 'invitasjonen_returnerer', setup_ref: '1/afternoon', return_ref: '5/evening', domains: ['narrative', 'reputation'] },
  { id: 'kilden_returnerer', setup_ref: '3/afternoon', return_ref: '11/evening', domains: ['narrative', 'reputation'] },
  { id: 'samtykket_returnerer', setup_ref: '4/afternoon', return_ref: '12/evening', domains: ['relationship', 'reputation'] },
  { id: 'kreditten_returnerer', setup_ref: '6/afternoon', return_ref: '13/evening', domains: ['reputation', 'relationship'] },
  { id: 'fristen_returnerer', setup_ref: '8/afternoon', return_ref: '9/evening', domains: ['stress', 'reputation'] },
  { id: 'fastrollegrensen_returnerer', setup_ref: '14/afternoon', return_ref: '14/evening', domains: ['narrative', 'reputation'] }
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
    ['morning', 'info', 'Morgenen avgrenser bidraget og gjør format, kilde, rettighet eller ansvarsgrense observerbar før et valg tas.'],
    ['lunch', 'conversation', 'Midt på dagen møter praksisen en redaktør, kilde, medvirkende, medbidragsyter eller leser som gjør premisser og maktforhold konkrete.'],
    ['afternoon', 'decision', 'Ettermiddagen krever et konkret valg om pitch, dokumentasjon, samtykke, redigering, kreditering, frist eller publiseringsgrense.'],
    ['evening', 'private_consequence', 'Kvelden viser hvordan valget påvirker tillit, arbeidsmåte, omdømme, retting eller neste bidrag.']
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
  category: 'media',
  role_scope: 'media_bidragsyter',
  subject_type: 'life_position',
  life_position_ref: { badge_id: 'media', id: 'bidragsyter', label: 'Bidragsyter' },
  title: 'Bidragsyter — pitch, kilder, samtykke, redigering, kreditering og ansvar',
  status: 'role_world_complete',
  sociological_core: {
    main_problem: 'å levere avgrensede og etterprøvbare mediebidrag i relasjon til redaksjoner, kilder, medvirkende og publikum uten at synlighet, gjentatt deltakelse eller nærhet til et medium blir forvekslet med ansettelse eller redaksjonell myndighet',
    description: 'Bidragsyter er en employment-independent contributor_practice for pitch og innsending, kilde og proveniens, samtykke og bruksrett, redigering, kreditering, interessekonflikt, frist og omfang, avslag, publikumsrespons, retting, gjenbruk og samarbeid. Rollen er tydelig forskjellig fra Journalist og Reporter som egne profesjonelle eller redaksjonelt forankrede praksiser. Bidragsyterstatus gir ingen automatisk jobb, lønn, honorar, kontrakt, fast oppdrag eller redaksjonell myndighet; slike livelihood-, arbeids- og mandatforhold krever separat proveniens og eksplisitt aksept. Gjentatte bidrag kan bygge erfaring og relasjoner uten å gjøre spilleren til redaksjonsmedlem. Rollen introduserer ingen ny runtime.'
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
if (!index.roles.some((entry) => entry.life_position_key === 'media/bidragsyter')) {
  index.roles.push({
    category: 'media',
    role_scope: 'media_bidragsyter',
    subject_type: 'life_position',
    life_position_ref: { badge_id: 'media', id: 'bidragsyter', label: 'Bidragsyter' },
    status: 'role_world_complete',
    path: worldPath,
    life_position_key: 'media/bidragsyter'
  });
}
index.career_role_world_count = index.roles.filter((x) => x.subject_type !== 'life_position').length;
index.life_position_role_world_count = index.roles.filter((x) => x.subject_type === 'life_position').length;
index.summary.role_worlds_total = index.roles.length;
index.summary.career_role_worlds = index.career_role_world_count;
index.summary.life_position_role_worlds = index.life_position_role_world_count;
index.status = `${index.roles.length}_role_worlds_materialized`;
write(indexPath, index);

if (index.roles.length !== 190 || index.life_position_role_world_count !== 105 || index.career_role_world_count !== 85) {
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
const assignment = findObjectWithKey(themeBank, 'media/media_medievaktbikkje');
if (!assignment) throw new Error('Could not locate Media theme assignment');
assignment['media/media_bidragsyter'] = themeIds;
write(themePath, themeBank);

const checklistPath = 'data/Civication/roleWorldAuthoringChecklist.json';
const checklist = read(checklistPath);
if (!appendToArrayContaining(checklist, 'data/Civication/roleWorlds/litteratur/litteratur_skribent.json', worldPath)) {
  throw new Error('Could not locate completed world checklist array');
}
write(checklistPath, checklist);

const policyPath = 'data/Civication/roleWorldPolicy.json';
const policy = read(policyPath);
const completedPolicy = findObjectWithOwn(policy, 'completed_life_position_role_worlds');
if (!completedPolicy) throw new Error('Could not locate completed_life_position_role_worlds');
completedPolicy.completed_life_position_role_worlds = 105;
write(policyPath, policy);

const taxonomyPath = 'data/Civication/nonCareerRoleTaxonomy.json';
const taxonomy = read(taxonomyPath);
taxonomy.canonical_counts.life_position_role_worlds = 105;
taxonomy.canonical_counts.total_role_worlds = 190;
if (!appendToArrayContaining(taxonomy, 'litteratur/skribent', 'media/bidragsyter')) {
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
  [
    `ready: 104,\n  needs_authored_depth: 55,`,
    `ready: 105,\n  needs_authored_depth: 54,`
  ],
  [
    'assert.equal(audit.summary.completed_life_position_role_worlds, 104);',
    'assert.equal(audit.summary.completed_life_position_role_worlds, 105);'
  ],
  [
    'assert.equal(audit.summary.positions_with_exact_governed_sources, 104);',
    'assert.equal(audit.summary.positions_with_exact_governed_sources, 105);'
  ],
  [
    'assert.equal(audit.summary.positions_with_multi_scene_narrative_foundation, 104);',
    'assert.equal(audit.summary.positions_with_multi_scene_narrative_foundation, 105);'
  ]
]);

replaceExact('tests/civication-role-world-contract.test.js', [
  [
    'assert.equal(index.life_position_role_world_count, 104);',
    'assert.equal(index.life_position_role_world_count, 105);'
  ],
  [
    'assert.equal(index.roles.length, 189);',
    'assert.equal(index.roles.length, 190);'
  ]
]);

replaceExact('tests/civication-noncareer-role-taxonomy.test.js', [
  [
    "assert.equal(roleWorldIndex.roles.length, 189, 'Role World-indeksen skal ha 85 karriereverdener + 104 life-position worlds');",
    "assert.equal(roleWorldIndex.roles.length, 190, 'Role World-indeksen skal ha 85 karriereverdener + 105 life-position worlds');"
  ],
  [
    "assert.equal(lifePositionWorlds.length, 104, '104 canonical life-position worlds skal være materialisert, inkludert Poet, Skald og Skribent');",
    "assert.equal(lifePositionWorlds.length, 105, '105 canonical life-position worlds skal være materialisert, inkludert Poet, Skald, Skribent og Bidragsyter');"
  ],
  [
    'assert.deepEqual(roleWorldIndex.summary, { role_worlds_total: 189, career_role_worlds: 85, life_position_role_worlds: 104 });',
    'assert.deepEqual(roleWorldIndex.summary, { role_worlds_total: 190, career_role_worlds: 85, life_position_role_worlds: 105 });'
  ],
  [
    'life_position_role_worlds: 104,\n  total_role_worlds: 189,',
    'life_position_role_worlds: 105,\n  total_role_worlds: 190,'
  ],
  [
    '85 career Role Worlds + 104 life-position worlds',
    '85 career Role Worlds + 105 life-position worlds'
  ]
]);

replaceExact('tests/civication-naeringsliv-frilanser-life-position-readiness.test.js', [
  [
    "  'data/Civication/narratives/leisure/litteratur_skribent.json',\n  'data/Civication/narratives/leisure/subkultur_gangster.json'",
    "  'data/Civication/narratives/leisure/litteratur_skribent.json',\n  'data/Civication/narratives/leisure/media_bidragsyter.json',\n  'data/Civication/narratives/leisure/subkultur_gangster.json'"
  ]
]);

console.log('Temporary Bidragsyter materializer prepared canonical 190/105 state.');
