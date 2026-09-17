#!/usr/bin/env node
'use strict';

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const write = (p, v) => fs.writeFileSync(path.join(ROOT, p), JSON.stringify(v, null, 2) + '\n');
const readText = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const writeText = (p, v) => fs.writeFileSync(path.join(ROOT, p), v);

const sourcePath = 'data/Civication/narratives/leisure/media_folger.json';
const worldPath = 'data/Civication/roleWorlds/media/media_folger.json';
const source = read(sourcePath);

if (source.storylets.length !== 14) throw new Error(`Følger source must contain 14 storylets, got ${source.storylets.length}`);
const ids = new Set(source.storylets.map((x) => x.id));
if (ids.size !== 14) throw new Error('Følger storylet ids must be unique');

const axes = [
  { id: 'curation', meaning: 'bevisst følgerliste, oppmerksomhet og valgbar kuratering', story_id: 'hvem_du_velger_a_folge' },
  { id: 'notification_boundary', meaning: 'varsler, tilgjengelighet og oppmerksomhetsgrense', story_id: 'varslet_som_blir_en_plikt' },
  { id: 'continuity_context', meaning: 'langtidsfølging, tidslinje og kontekst', story_id: 'den_lange_historien' },
  { id: 'parasocial_boundary', meaning: 'offentlig familiaritet, antatt nærhet og privat grense', story_id: 'personen_du_har_fulgt_lenge' },
  { id: 'algorithmic_selection', meaning: 'eksplisitt følging, anbefaling og algoritmisk seleksjon', story_id: 'algoritmen_som_folger_med' },
  { id: 'source_drift', meaning: 'kildeendring, gammel tillit og ny vurdering', story_id: 'nar_en_kilde_endrer_seg' },
  { id: 'correction_memory', meaning: 'rettelser, førsteinntrykk og oppdatert kunnskap', story_id: 'rettelsen_du_nesten_ikke_ser' },
  { id: 'plural_streams', meaning: 'parallelle strømmer, utvalg og falsk balanse', story_id: 'to_strommer_samme_tema' },
  { id: 'identity_loyalty', meaning: 'publikumsidentitet, lojalitet og sosialt press', story_id: 'nar_folging_blir_identitet' },
  { id: 'archive_comparison', meaning: 'arkiv, mønstergjenkjenning og historisk sammenligning', story_id: 'arkivet_bak_feedens_nyhet' },
  { id: 'distribution_visibility', meaning: 'feed-rangering, synlighet og distribusjonsmakt', story_id: 'plattformen_endrer_rekkefolgen' },
  { id: 'trust_sharing', meaning: 'generell tillit, konkret påstand og delingsansvar', story_id: 'nar_du_deler_fra_noen_du_folger' },
  { id: 'exit_autonomy', meaning: 'avfølging, skyld og frivillig publikumsrelasjon', story_id: 'avfolgingen_som_kjennes_personlig' },
  { id: 'sponsorship_trust', meaning: 'sponsing, familiaritet og kommersiell tillit', story_id: 'sponsingen_i_den_faste_strommen' }
];
for (const axis of axes) if (!ids.has(axis.story_id)) throw new Error(`Missing Følger storylet ${axis.story_id}`);

const socialEnvironments = [
  'personlige følgerlister og feeds der gjentatt eksponering formes av både eksplisitte valg og plattformens rangering',
  'nyhets-, podkast-, video- og sosiale strømmer der kontinuitet kan gi kontekst samtidig som tempo og varsler konkurrerer om oppmerksomheten',
  'venne- og samtalemiljøer der det å følge bestemte kilder eller personer blir en synlig sosial identitet',
  'arkiver og eldre dekning der langtidsfølging kan kontrolleres mot dokumenterte tidligere versjoner fremfor bare hukommelse',
  'plattformflater der anbefaling, sponsing og distribusjon påvirker hva som oppleves som relevant eller troverdig',
  'publikumsrelasjoner til kjente stemmer der familiaritet, avfølging og parasosial nærhet må holdes adskilt fra faktisk personlig relasjon'
];

const people = [
  { id: 'den_faste_verten', social_function: 'gjør kontinuitet, familiaritet og parasosial nærhet konkret over tid', class_position: 'offentlig stemme eller programleder som publikum møter gjentatte ganger gjennom mediekanaler', status: 'synlig offentlig figur uten personlig relasjon til spilleren', power_over_player: 'kan få gjentatt tilgang til spillerens oppmerksomhet og tillit gjennom format, frekvens og familiaritet', wants: 'at publikum fortsetter å følge, forstå formatet og komme tilbake til nytt innhold', conceals: 'at publikums kjennskap til den offentlige stemmen ikke er gjensidig privat kjennskap', speech_style: 'gjenkjennelig, trygg og formatbevisst', teaches_player: 'å skille kjent offentlig stil fra faktisk personlig nærhet' },
  { id: 'den_kritiske_vennen', social_function: 'gjør sosial identitet og lojalitetspress synlig når spillerens følgerpraksis blir kommentert av andre', class_position: 'nær relasjon uten institusjonell rolle i mediet eller plattformen', status: 'sosial motstemme som kjenner spillerens vaner bedre enn innholdets produksjonsprosess', power_over_player: 'kan gjøre følgeridentitet pinlig, defensiv eller refleksiv i en sosial situasjon', wants: 'at spilleren begrunner hvorfor en kilde eller kanal fortsatt fortjener oppmerksomhet', conceals: 'at egen skepsis også kan bygge på smak, gruppeidentitet eller begrenset kjennskap', speech_style: 'direkte, ertende og utfordrende', teaches_player: 'å holde publikumsinteresse adskilt fra automatisk lojalitet' },
  { id: 'den_erfarne_folgeren', social_function: 'viser hvordan langtidsoppmerksomhet kan gi kontekst uten å bli privat ekspertmyndighet', class_position: 'annen publikummer med lang historikk i samme tema eller kanal', status: 'uformell erfaringsstatus uten journalistisk, redaksjonell eller personlig autoritet', power_over_player: 'kan sammenligne eldre hendelser, peker på arkiv og korrigere forenklede tidslinjer', wants: 'at tidligere dekning brukes presist og ikke bare som nostalgisk mønstergjenkjenning', conceals: 'at lang eksponering også kan gjøre gamle fortolkninger vanskelige å oppdatere', speech_style: 'refererende, tidslinjeorientert og detaljert', teaches_player: 'å gjøre langtidsminne etterprøvbart' },
  { id: 'plattformstemmen', social_function: 'gjør algoritmisk seleksjon, feed-rangering og varsler til en synlig strukturell aktør', class_position: 'plattform- eller distribusjonsmekanisme som former synlighet uten å være personlig relasjon', status: 'infrastrukturell kontroll over rekkefølge, anbefaling og avbrudd', power_over_player: 'kan øke eller redusere eksponering uten at følgerlisten formelt endres', wants: 'mest mulig fortsatt engasjement gjennom rangering, anbefaling og varsling', conceals: 'hvor mye synligheten skyldes rankinglogikk fremfor spillerens egne følgervalg', speech_style: 'kort, metrisk og anbefalingsdrevet', teaches_player: 'å skille eksplisitt abonnement fra faktisk distribusjon' },
  { id: 'den_kjente_kilden', social_function: 'gjør tillitskalibrering og delingsansvar konkret når en kjent kilde publiserer en ny påstand', class_position: 'medium, skribent eller kanal som spilleren har fulgt lenge', status: 'opparbeidet publikumsfamiliaritet uten garanti for at hver ny påstand er korrekt', power_over_player: 'kan få lavere terskel for tro og deling fordi historikken oppleves trygg', wants: 'fortsatt oppmerksomhet og tillit til nye publiseringer', conceals: 'at kvalitet og dokumentasjon kan variere fra sak til sak selv i en kjent kanal', speech_style: 'gjenkjennelig, selvsikker og konsistent med tidligere profil', teaches_player: 'å bruke tillit som startpunkt for vurdering, ikke som erstatning for den' },
  { id: 'sponsoren_i_strommen', social_function: 'gjør kommersiell påvirkning synlig inne i en ellers kjent og tillitsfull publikumsrelasjon', class_position: 'kommersiell aktør som kjøper tilgang til oppmerksomhet gjennom en kjent kanal eller vert', status: 'betalende avsender uten automatisk redaksjonell eller personlig troverdighet', power_over_player: 'kan låne familiaritet og tillit fra formatet rundt budskapet', wants: 'at publikums tillit til kanalen overføres til produkt, tjeneste eller påstand', conceals: 'hvor sterkt budskapets overbevisningskraft avhenger av den etablerte følgerrelasjonen', speech_style: 'glatt, anbefalende og integrert i vertens språk', teaches_player: 'å skille publikumsnærhet fra kommersiell evidens' }
];

const privateAftermath = [
  { id: 'folgerlisten_blir_bevisst', description: 'Spilleren rydder oftere i hvilke kilder, personer og temaer som faktisk fortjener gjentatt oppmerksomhet.', materialization_refs: [`${sourcePath}#hvem_du_velger_a_folge`] },
  { id: 'familiaritet_blir_ikke_narhet', description: 'Kjennskap til en offentlig stemme holdes tydeligere adskilt fra antatt privat relasjon eller motivkunnskap.', materialization_refs: [`${sourcePath}#personen_du_har_fulgt_lenge`] },
  { id: 'feed_er_ikke_feltet', description: 'Spilleren skiller oftere mellom egne følgervalg, algoritmisk distribusjon og hva som faktisk finnes i offentligheten.', materialization_refs: [`${sourcePath}#algoritmen_som_folger_med`] },
  { id: 'tillit_oppdateres', description: 'Gamle kilder, rettelser og nye påstander vurderes på nytt i stedet for å arve permanent tillit fra historikken.', materialization_refs: [`${sourcePath}#nar_en_kilde_endrer_seg`, `${sourcePath}#rettelsen_du_nesten_ikke_ser`] },
  { id: 'avfolging_er_tillatt', description: 'Publikumsrelasjonen behandles som frivillig: spilleren kan dempe eller avfølge uten å gjøre det til svik eller offentlig dom.', materialization_refs: [`${sourcePath}#avfolgingen_som_kjennes_personlig`] }
];

const delayedConsequences = [
  { id: 'varselet_returnerer', setup_ref: '2/afternoon', return_ref: '11/evening', domains: ['stress', 'narrative'] },
  { id: 'tidslinjen_returnerer', setup_ref: '3/afternoon', return_ref: '10/evening', domains: ['narrative', 'reputation'] },
  { id: 'parasosialiteten_returnerer', setup_ref: '4/afternoon', return_ref: '13/evening', domains: ['relationship', 'narrative'] },
  { id: 'algoritmen_returnerer', setup_ref: '5/afternoon', return_ref: '11/evening', domains: ['narrative', 'reputation'] },
  { id: 'tilliten_returnerer', setup_ref: '6/afternoon', return_ref: '12/evening', domains: ['reputation', 'responsibility'] },
  { id: 'sponsingen_returnerer', setup_ref: '14/afternoon', return_ref: '14/evening', domains: ['financial', 'reputation'] }
];

const themeIds = ['public_attention', 'status_anxiety', 'social_mask', 'shame_reputation', 'alienation', 'consumption'];
const coverage = [];
for (let i = 0; i < axes.length; i += 1) {
  const day = i + 1;
  const axis = axes[i];
  const prev1 = axes[(i + axes.length - 1) % axes.length].id;
  const prev2 = axes[(i + axes.length - 2) % axes.length].id;
  const sourceRef = `${sourcePath}#${axis.story_id}`;
  const phases = [
    ['morning', 'info', 'Morgenen viser hva som faktisk kommer inn gjennom følgerlisten, varslene eller feeden før spilleren tolker betydningen.'],
    ['lunch', 'conversation', 'Midt på dagen møter følgerpraksisen en venn, offentlig stemme, annen følger eller plattformmekanisme som gjør den sosiale relasjonen synlig.'],
    ['afternoon', 'decision', 'Ettermiddagen krever et konkret valg om kuratering, kontekst, tillit, deling, synlighet, avfølging eller kommersiell påvirkning.'],
    ['evening', 'private_consequence', 'Kvelden viser hvordan valget påvirker oppmerksomhet, identitet, tillit, relasjoner og hva spilleren tar med seg videre.']
  ];
  for (const [phase, beatType, phaseText] of phases) coverage.push({ day, phase, beat_type: beatType, summary: `Dag ${day}: ${axis.meaning}. ${phaseText}`, thread_ids: (phase === 'afternoon' || phase === 'evening') ? [prev2, prev1, axis.id] : [axis.id], materialization_refs: [sourceRef] });
}

const primaryThreads = axes.map((axis, i) => {
  const d1 = i + 1;
  const d2 = ((i + 1) % axes.length) + 1;
  const d3 = ((i + 2) % axes.length) + 1;
  return { id: axis.id, relationship: axis.meaning, beat_refs: [`${d1}/afternoon`, `${d1}/evening`, `${d2}/afternoon`, `${d2}/evening`, `${d3}/afternoon`, `${d3}/evening`] };
});

const world = {
  schema: 'civication_role_world_v1', version: 1, category: 'media', role_scope: 'media_folger', subject_type: 'life_position',
  life_position_ref: { badge_id: 'media', id: 'folger', label: 'Følger' },
  title: 'Følger — kuratering, kontinuitet, algoritmer, tillit og parasosiale grenser', status: 'role_world_complete',
  sociological_core: {
    main_problem: 'å leve med vedvarende medieoppmerksomhet der følgerlister, varsler, algoritmer, kjenthet og sosial identitet former hva som blir sett og trodd, uten at langvarig eksponering blir forvekslet med journalistisk myndighet, personlig nærhet eller automatisk sannhet',
    description: 'Følger er en employment-independent audience_practice for gjentatt publikumsrelasjon over tid. Rollen dekker bevisst kuratering, varsler, langtidskontekst, parasosial familiaritet, algoritmisk seleksjon, kildeendring, rettelser, parallelle strømmer, publikumsidentitet, arkivbruk, feed-rangering, delingsansvar, avfølging og sponsing. Den er tydelig forskjellig fra Nyhetsjunkie som primært handler om tempo og overmetning, Kommentarfeltveteran som handler om offentlig deltakelse og konflikt, Medievaktbikkje som handler om framing og mediekritikk, og Bidragsyter som produserer materiale for publisering. Følgerstatus gir ingen jobb, lønn, journalistisk rolle, redaksjonell myndighet eller personlig relasjon til den man følger. Rollen introduserer ingen ny runtime.'
  },
  theme_ids: themeIds, social_environments: socialEnvironments, recurring_people_archetypes: people,
  slow_axes: axes.map(({ id, meaning }) => ({ id, meaning, runtime_binding: 'editorial_only_until_governed' })),
  season: { days: 14, day_phases: ['morning', 'lunch', 'afternoon', 'evening'], coverage },
  primary_threads: primaryThreads, private_aftermath: privateAftermath, delayed_consequences: delayedConsequences,
  materialization: { no_new_runtime: true, source_refs: axes.map((axis) => `${sourcePath}#${axis.story_id}`) }
};
write(worldPath, world);

const indexPath = 'data/Civication/roleWorlds/index.json';
const index = read(indexPath);
if (!index.roles.some((entry) => entry.life_position_key === 'media/folger')) index.roles.push({ category: 'media', role_scope: 'media_folger', subject_type: 'life_position', life_position_ref: { badge_id: 'media', id: 'folger', label: 'Følger' }, status: 'role_world_complete', path: worldPath, life_position_key: 'media/folger' });
index.career_role_world_count = index.roles.filter((x) => x.subject_type !== 'life_position').length;
index.life_position_role_world_count = index.roles.filter((x) => x.subject_type === 'life_position').length;
index.summary.role_worlds_total = index.roles.length;
index.summary.career_role_worlds = index.career_role_world_count;
index.summary.life_position_role_worlds = index.life_position_role_world_count;
index.status = `${index.roles.length}_role_worlds_materialized`;
write(indexPath, index);
if (index.roles.length !== 191 || index.life_position_role_world_count !== 106 || index.career_role_world_count !== 85) throw new Error(`Unexpected Role World totals: ${index.roles.length} / ${index.career_role_world_count} / ${index.life_position_role_world_count}`);

const findObjectWithKey = (node, key) => { if (!node || typeof node !== 'object') return null; if (!Array.isArray(node) && Object.prototype.hasOwnProperty.call(node, key)) return node; for (const value of Object.values(node)) { const found = findObjectWithKey(value, key); if (found) return found; } return null; };
const findObjectWithOwn = (node, key) => { if (!node || typeof node !== 'object') return null; if (!Array.isArray(node) && Object.prototype.hasOwnProperty.call(node, key)) return node; for (const value of Object.values(node)) { const found = findObjectWithOwn(value, key); if (found) return found; } return null; };
const appendToArrayContaining = (node, needle, value) => { if (!node || typeof node !== 'object') return false; if (Array.isArray(node) && node.includes(needle)) { if (!node.includes(value)) node.push(value); return true; } for (const child of Object.values(node)) if (appendToArrayContaining(child, needle, value)) return true; return false; };

const themePath = 'data/Civication/roleWorldThemeBank.json';
const themeBank = read(themePath);
const assignment = findObjectWithKey(themeBank, 'media/media_bidragsyter');
if (!assignment) throw new Error('Could not locate Media theme assignment');
assignment['media/media_folger'] = themeIds;
write(themePath, themeBank);

const checklistPath = 'data/Civication/roleWorldAuthoringChecklist.json';
const checklist = read(checklistPath);
if (!appendToArrayContaining(checklist, 'data/Civication/roleWorlds/media/media_bidragsyter.json', worldPath)) throw new Error('Could not locate completed world checklist array');
write(checklistPath, checklist);

const policyPath = 'data/Civication/roleWorldPolicy.json';
const policy = read(policyPath);
const completedPolicy = findObjectWithOwn(policy, 'completed_life_position_role_worlds');
if (!completedPolicy) throw new Error('Could not locate completed_life_position_role_worlds');
completedPolicy.completed_life_position_role_worlds = 106;
write(policyPath, policy);

const taxonomyPath = 'data/Civication/nonCareerRoleTaxonomy.json';
const taxonomy = read(taxonomyPath);
taxonomy.canonical_counts.life_position_role_worlds = 106;
taxonomy.canonical_counts.total_role_worlds = 191;
if (!appendToArrayContaining(taxonomy, 'media/bidragsyter', 'media/folger')) throw new Error('Could not locate taxonomy materialized life-position array');
write(taxonomyPath, taxonomy);

const replaceExact = (file, pairs) => { let text = readText(file); for (const [oldValue, newValue] of pairs) { if (!text.includes(oldValue)) throw new Error(`Expected text not found in ${file}: ${oldValue}`); text = text.replace(oldValue, newValue); } writeText(file, text); };
replaceExact('tests/civication-life-position-role-world-readiness.test.js', [[`ready: 105,\n  needs_authored_depth: 54,`, `ready: 106,\n  needs_authored_depth: 53,`], ['assert.equal(audit.summary.completed_life_position_role_worlds, 105);', 'assert.equal(audit.summary.completed_life_position_role_worlds, 106);'], ['assert.equal(audit.summary.positions_with_exact_governed_sources, 105);', 'assert.equal(audit.summary.positions_with_exact_governed_sources, 106);'], ['assert.equal(audit.summary.positions_with_multi_scene_narrative_foundation, 105);', 'assert.equal(audit.summary.positions_with_multi_scene_narrative_foundation, 106);']]);
replaceExact('tests/civication-role-world-contract.test.js', [['assert.equal(index.life_position_role_world_count, 105);', 'assert.equal(index.life_position_role_world_count, 106);'], ['assert.equal(index.roles.length, 190);', 'assert.equal(index.roles.length, 191);']]);
replaceExact('tests/civication-noncareer-role-taxonomy.test.js', [["assert.equal(roleWorldIndex.roles.length, 190, 'Role World-indeksen skal ha 85 karriereverdener + 105 life-position worlds');", "assert.equal(roleWorldIndex.roles.length, 191, 'Role World-indeksen skal ha 85 karriereverdener + 106 life-position worlds');"], ["assert.equal(lifePositionWorlds.length, 105, '105 canonical life-position worlds skal være materialisert, inkludert Poet, Skald, Skribent og Bidragsyter');", "assert.equal(lifePositionWorlds.length, 106, '106 canonical life-position worlds skal være materialisert, inkludert Poet, Skald, Skribent, Bidragsyter og Følger');"], ["assert.deepEqual(roleWorldIndex.summary, { role_worlds_total: 190, career_role_worlds: 85, life_position_role_worlds: 105 });", "assert.deepEqual(roleWorldIndex.summary, { role_worlds_total: 191, career_role_worlds: 85, life_position_role_worlds: 106 });"], ['life_position_role_worlds: 105,\n  total_role_worlds: 190,', 'life_position_role_worlds: 106,\n  total_role_worlds: 191,'], ['85 career Role Worlds + 105 life-position worlds', '85 career Role Worlds + 106 life-position worlds']]);
console.log('Temporary Følger materializer prepared canonical 191/106 state.');
