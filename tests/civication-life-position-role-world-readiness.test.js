#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

const output = execFileSync(process.execPath, [
  path.join(ROOT, 'scripts/audit-civication-life-position-role-world-readiness.mjs'),
  '--check'
], { cwd: ROOT, encoding: 'utf8' });

assert.match(output, /PASS: 199 life positions audited/);

const audit = readJson('data/Civication/lifePositionRoleWorldReadiness.json');
const taxonomy = readJson('data/Civication/nonCareerRoleTaxonomy.json');
const policy = readJson('data/Civication/roleWorldPolicy.json');

assert.equal(audit.schema, 'civication_life_position_role_world_readiness_v2');
assert.equal(audit.version, 2);
assert.equal(audit.summary.selectable_life_positions, taxonomy.canonical_counts.selectable_life_positions_total);
assert.equal(audit.summary.selectable_life_positions, 199);
assert.deepEqual(audit.summary.classifications, {
  ready: 77,
  needs_authored_depth: 82,
  not_a_standalone_world: 40
});
assert.equal(audit.summary.completed_life_position_role_worlds, 77);
assert.equal(audit.summary.pending_ready_positions, 0);
assert.equal(audit.summary.livelihood_backed_positions, 14);
assert.equal(audit.summary.positions_with_exact_governed_sources, 77);
assert.equal(audit.summary.positions_with_multi_scene_narrative_foundation, 77);
assert.equal(audit.first_ready, null);
assert.equal(taxonomy.role_world_rollout_boundary.next_source_backed_candidate, null);
assert.equal(policy.noncareer_subject_boundary.life_position_readiness.first_source_backed_candidate, null);

assert.deepEqual(policy.noncareer_subject_boundary.life_position_readiness.classifications, [
  'ready',
  'needs_authored_depth',
  'not_a_standalone_world'
]);
assert.equal(policy.noncareer_subject_boundary.life_position_readiness.lifecycle_field, 'role_world_status');

const nabolagskjenner = audit.positions.find((row) => row.key === 'by/nabolagskjenner');
assert.ok(nabolagskjenner);
assert.equal(nabolagskjenner.classification, 'ready');
assert.equal(nabolagskjenner.role_world_status, 'role_world_complete');
assert.equal(nabolagskjenner.role_world_path, 'data/Civication/roleWorlds/by/by_nabolagskjenner.json');
assert.equal(nabolagskjenner.authored_depth.max_narrative_depth, 14);
assert.deepEqual(nabolagskjenner.evidence.exact_source_refs, [
  'data/Civication/narratives/leisure/nabolagskjenner.json'
]);

const filmklubbmenneske = audit.positions.find((row) => row.key === 'film_tv/filmklubbmenneske');
assert.ok(filmklubbmenneske);
assert.equal(filmklubbmenneske.classification, 'ready');
assert.equal(filmklubbmenneske.role_world_status, 'role_world_complete');
assert.equal(filmklubbmenneske.role_world_path, 'data/Civication/roleWorlds/film_tv/film_tv_filmklubbmenneske.json');
assert.equal(filmklubbmenneske.authored_depth.max_narrative_depth, 14);

const sofafilosof = audit.positions.find((row) => row.key === 'filosofi/sofafilosof');
assert.ok(sofafilosof);
assert.equal(sofafilosof.classification, 'ready');
assert.equal(sofafilosof.role_world_status, 'role_world_complete');
assert.equal(sofafilosof.role_world_path, 'data/Civication/roleWorlds/filosofi/filosofi_sofafilosof.json');
assert.equal(sofafilosof.authored_depth.max_narrative_depth, 14);
assert.deepEqual(sofafilosof.evidence.exact_source_refs, [
  'data/Civication/narratives/leisure/sofafilosof.json'
]);

const kinogjenger = audit.positions.find((row) => row.key === 'film_tv/kinogjenger');
assert.ok(kinogjenger);
assert.equal(kinogjenger.classification, 'ready');
assert.equal(kinogjenger.role_world_status, 'role_world_complete');
assert.equal(kinogjenger.role_world_path, 'data/Civication/roleWorlds/film_tv/film_tv_kinogjenger.json');
assert.equal(kinogjenger.authored_depth.max_narrative_depth, 14);
assert.deepEqual(kinogjenger.evidence.exact_source_refs, [
  'data/Civication/narratives/leisure/film_tv_kinogjenger.json'
]);
const kjenner = audit.positions.find((row) => row.key === 'film_tv/kjenner');
assert.ok(kjenner);
assert.equal(kjenner.classification, 'ready');
assert.equal(kjenner.role_world_status, 'role_world_complete');
assert.equal(kjenner.role_world_path, 'data/Civication/roleWorlds/film_tv/film_tv_kjenner.json');
assert.equal(kjenner.authored_depth.exact_source_ref_count, 1);
assert.equal(kjenner.authored_depth.max_narrative_depth, 14);
assert.deepEqual(kjenner.evidence.exact_source_refs, [
  'data/Civication/narratives/leisure/film_tv_kjenner.json'
]);

const supporter = audit.positions.find((row) => row.key === 'sport/supporter');
assert.ok(supporter);
assert.equal(supporter.classification, 'ready');
assert.equal(supporter.role_world_status, 'role_world_complete');
assert.equal(supporter.authored_depth.max_narrative_depth, 14);
assert.deepEqual(supporter.evidence.exact_source_refs, [
  'data/Civication/narratives/leisure/football_supporter.json'
]);

for (const row of audit.positions.filter((item) => item.authored_depth.livelihood_template_count > 0 && item.authored_depth.max_narrative_depth < 4)) {
  assert.notEqual(row.classification, 'ready',
    `${row.key}: livelihood opportunity alone must not certify Role World readiness`);
}

for (const row of audit.positions.filter((item) => item.classification === 'not_a_standalone_world')) {
  assert.equal(row.semantic_mode, 'overlay_or_outcome_status',
    `${row.key}: non-standalone classification must come from status/outcome semantics`);
}

for (const row of audit.positions.filter((item) => item.classification === 'ready')) {
  assert.ok(row.authored_depth.max_narrative_depth >= 4, `${row.key}: ready requires multi-scene depth`);
  assert.ok(row.authored_depth.exact_source_ref_count >= 1, `${row.key}: ready requires exact governed provenance`);
}


const seer = audit.positions.find((row) => row.key === 'film_tv/seer');
assert.ok(seer);
assert.equal(seer.classification, 'ready');
assert.equal(seer.role_world_status, 'role_world_complete');
assert.equal(seer.role_world_path, 'data/Civication/roleWorlds/film_tv/film_tv_seer.json');
assert.equal(seer.authored_depth.exact_source_ref_count, 1);
assert.equal(seer.authored_depth.max_narrative_depth, 14);
assert.deepEqual(seer.evidence.exact_source_refs, [
  'data/Civication/narratives/leisure/film_tv_seer.json'
]);

const seriesluker = audit.positions.find((row) => row.key === 'film_tv/seriesluker');
assert.ok(seriesluker);
assert.equal(seriesluker.classification, 'ready');
assert.equal(seriesluker.role_world_status, 'role_world_complete');
assert.equal(seriesluker.role_world_path, 'data/Civication/roleWorlds/film_tv/film_tv_seriesluker.json');
assert.equal(seriesluker.authored_depth.exact_source_ref_count, 1);
assert.equal(seriesluker.authored_depth.max_narrative_depth, 14);
assert.deepEqual(seriesluker.evidence.exact_source_refs, [
  'data/Civication/narratives/leisure/film_tv_seriesluker.json'
]);
assert.ok(!(audit.queue || []).some((row) => row.key === 'film_tv/seriesluker'));
const lesesirkelmenneske = audit.positions.find((row) => row.key === 'filosofi/lesesirkelmenneske');
assert.ok(lesesirkelmenneske);
assert.equal(lesesirkelmenneske.classification, 'ready');
assert.equal(lesesirkelmenneske.role_world_status, 'role_world_complete');
assert.equal(lesesirkelmenneske.role_world_path, 'data/Civication/roleWorlds/filosofi/filosofi_lesesirkelmenneske.json');
assert.equal(lesesirkelmenneske.authored_depth.exact_source_ref_count, 1);
assert.equal(lesesirkelmenneske.authored_depth.max_narrative_depth, 14);
assert.deepEqual(lesesirkelmenneske.evidence.exact_source_refs, [
  'data/Civication/narratives/leisure/filosofi_lesesirkelmenneske.json'
]);
assert.ok(!(audit.queue || []).some((row) => row.key === 'filosofi/lesesirkelmenneske'));
const livsgrubler = audit.positions.find((row) => row.key === 'filosofi/livsgrubler');
assert.ok(livsgrubler);
assert.equal(livsgrubler.classification, 'ready');
assert.equal(livsgrubler.role_world_status, 'role_world_complete');
assert.equal(livsgrubler.role_world_path, 'data/Civication/roleWorlds/filosofi/filosofi_livsgrubler.json');
assert.equal(livsgrubler.authored_depth.exact_source_ref_count, 1);
assert.equal(livsgrubler.authored_depth.max_narrative_depth, 14);
assert.deepEqual(livsgrubler.evidence.exact_source_refs, [
  'data/Civication/narratives/leisure/filosofi_livsgrubler.json'
]);
assert.ok(!(audit.queue || []).some((row) => row.key === 'filosofi/livsgrubler'));

const evidensleser = audit.positions.find((row) => row.key === 'helse/evidensleser');
assert.ok(evidensleser);
assert.equal(evidensleser.classification, 'ready');
assert.equal(evidensleser.role_world_status, 'role_world_complete');
assert.equal(evidensleser.role_world_path, 'data/Civication/roleWorlds/helse/helse_evidensleser.json');
assert.equal(evidensleser.authored_depth.exact_source_ref_count, 1);
assert.equal(evidensleser.authored_depth.max_narrative_depth, 14);
assert.deepEqual(evidensleser.evidence.exact_source_refs, [
  'data/Civication/narratives/leisure/helse_evidensleser.json'
]);
assert.ok(!(audit.queue || []).some((row) => row.key === 'helse/evidensleser'));

const folkehelseblikk = audit.positions.find((row) => row.key === 'helse/folkehelseblikk');
assert.ok(folkehelseblikk);
assert.equal(folkehelseblikk.classification, 'ready');
assert.equal(folkehelseblikk.role_world_status, 'role_world_complete');
assert.equal(folkehelseblikk.role_world_path, 'data/Civication/roleWorlds/helse/helse_folkehelseblikk.json');
assert.equal(folkehelseblikk.authored_depth.exact_source_ref_count, 1);
assert.equal(folkehelseblikk.authored_depth.max_narrative_depth, 14);
assert.deepEqual(folkehelseblikk.evidence.exact_source_refs, [
  'data/Civication/narratives/leisure/helse_folkehelseblikk.json'
]);
assert.ok(!(audit.queue || []).some((row) => row.key === 'helse/folkehelseblikk'));

const helseutforsker = audit.positions.find((row) => row.key === 'helse/helseutforsker');
assert.ok(helseutforsker);
assert.equal(helseutforsker.classification, 'ready');
assert.equal(helseutforsker.role_world_status, 'role_world_complete');
assert.equal(helseutforsker.role_world_path, 'data/Civication/roleWorlds/helse/helse_helseutforsker.json');
assert.equal(helseutforsker.authored_depth.exact_source_ref_count, 1);
assert.equal(helseutforsker.authored_depth.max_narrative_depth, 14);
assert.deepEqual(helseutforsker.evidence.exact_source_refs, [
  'data/Civication/narratives/leisure/helse_helseutforsker.json'
]);
assert.ok(!(audit.queue || []).some((row) => row.key === 'helse/helseutforsker'));

const omsorgsetiker = audit.positions.find((row) => row.key === 'helse/omsorgsetiker');
assert.ok(omsorgsetiker);
assert.equal(omsorgsetiker.classification, 'ready');
assert.equal(omsorgsetiker.role_world_status, 'role_world_complete');
assert.equal(omsorgsetiker.role_world_path, 'data/Civication/roleWorlds/helse/helse_omsorgsetiker.json');
assert.equal(omsorgsetiker.authored_depth.exact_source_ref_count, 1);
assert.equal(omsorgsetiker.authored_depth.max_narrative_depth, 14);
assert.deepEqual(omsorgsetiker.evidence.exact_source_refs, [
  'data/Civication/narratives/leisure/helse_omsorgsetiker.json'
]);
assert.ok(!(audit.queue || []).some((row) => row.key === 'helse/omsorgsetiker'));

const arkivrotte = audit.positions.find((row) => row.key === 'historie/arkivrotte');
assert.ok(arkivrotte);
assert.equal(arkivrotte.classification, 'ready');
assert.equal(arkivrotte.role_world_status, 'role_world_complete');
assert.equal(arkivrotte.role_world_path, 'data/Civication/roleWorlds/historie/historie_arkivrotte.json');
assert.equal(arkivrotte.priority_score, 405);
assert.equal(arkivrotte.authored_depth.exact_source_ref_count, 1);
assert.equal(arkivrotte.authored_depth.max_narrative_depth, 14);
assert.deepEqual(arkivrotte.evidence.exact_source_refs, [
  'data/Civication/narratives/leisure/historie_arkivrotte.json'
]);
assert.ok(!(audit.queue || []).some((row) => row.key === 'historie/arkivrotte'));

const lokalhistoriker = audit.positions.find((row) => row.key === 'historie/lokalhistoriker');
assert.ok(lokalhistoriker);
assert.equal(lokalhistoriker.classification, 'ready');
assert.equal(lokalhistoriker.role_world_status, 'role_world_complete');
assert.equal(lokalhistoriker.role_world_path, 'data/Civication/roleWorlds/historie/historie_lokalhistoriker.json');
assert.equal(lokalhistoriker.priority_score, 405);
assert.equal(lokalhistoriker.authored_depth.exact_source_ref_count, 1);
assert.equal(lokalhistoriker.authored_depth.max_narrative_depth, 14);
assert.deepEqual(lokalhistoriker.evidence.exact_source_refs, [
  'data/Civication/narratives/leisure/historie_lokalhistoriker.json'
]);
assert.ok(!(audit.queue || []).some((row) => row.key === 'historie/lokalhistoriker'));

const ateliermenneske = audit.positions.find((row) => row.key === 'kunst/ateliermenneske');
assert.ok(ateliermenneske);
assert.equal(ateliermenneske.classification, 'ready');
assert.equal(ateliermenneske.role_world_status, 'role_world_complete');
assert.equal(ateliermenneske.role_world_path, 'data/Civication/roleWorlds/kunst/kunst_ateliermenneske.json');
assert.equal(ateliermenneske.priority_score, 405);
assert.equal(ateliermenneske.authored_depth.exact_source_ref_count, 1);
assert.equal(ateliermenneske.authored_depth.max_narrative_depth, 14);
assert.deepEqual(ateliermenneske.evidence.exact_source_refs, [
  'data/Civication/narratives/leisure/kunst_ateliermenneske.json'
]);
assert.ok(!(audit.queue || []).some((row) => row.key === 'kunst/ateliermenneske'));

const gatekunstjeger = audit.positions.find((row) => row.key === 'kunst/gatekunstjeger');
assert.ok(gatekunstjeger);
assert.equal(gatekunstjeger.classification, 'ready');
assert.equal(gatekunstjeger.role_world_status, 'role_world_complete');
assert.equal(gatekunstjeger.role_world_path, 'data/Civication/roleWorlds/kunst/kunst_gatekunstjeger.json');
assert.equal(gatekunstjeger.priority_score, 405);
assert.equal(gatekunstjeger.authored_depth.exact_source_ref_count, 1);
assert.equal(gatekunstjeger.authored_depth.max_narrative_depth, 14);
assert.deepEqual(gatekunstjeger.evidence.exact_source_refs, [
  'data/Civication/narratives/leisure/kunst_gatekunstjeger.json'
]);
assert.ok(!(audit.queue || []).some((row) => row.key === 'kunst/gatekunstjeger'));

const vernissagegjenger = audit.positions.find((row) => row.key === 'kunst/vernissagegjenger');
assert.ok(vernissagegjenger);
assert.equal(vernissagegjenger.classification, 'ready');
assert.equal(vernissagegjenger.role_world_status, 'role_world_complete');
assert.equal(vernissagegjenger.role_world_path, 'data/Civication/roleWorlds/kunst/kunst_vernissagegjenger.json');
assert.equal(vernissagegjenger.priority_score, 405);
assert.equal(vernissagegjenger.authored_depth.exact_source_ref_count, 1);
assert.equal(vernissagegjenger.authored_depth.max_narrative_depth, 14);
assert.deepEqual(vernissagegjenger.evidence.exact_source_refs, ['data/Civication/narratives/leisure/kunst_vernissagegjenger.json']);
assert.ok(!(audit.queue || []).some((row) => row.key === 'kunst/vernissagegjenger'));

const biblioteksvanker = audit.positions.find((row) => row.key === 'litteratur/biblioteksvanker');
assert.ok(biblioteksvanker);
assert.equal(biblioteksvanker.classification, 'ready');
assert.equal(biblioteksvanker.role_world_status, 'role_world_complete');
assert.equal(biblioteksvanker.role_world_path, 'data/Civication/roleWorlds/litteratur/litteratur_biblioteksvanker.json');
assert.equal(biblioteksvanker.priority_score, 405);
assert.equal(biblioteksvanker.authored_depth.exact_source_ref_count, 1);
assert.equal(biblioteksvanker.authored_depth.max_narrative_depth, 14);
assert.deepEqual(biblioteksvanker.evidence.exact_source_refs, ['data/Civication/narratives/leisure/litteratur_biblioteksvanker.json']);
assert.ok(!(audit.queue || []).some((row) => row.key === 'litteratur/biblioteksvanker'));

const bokklubbmenneske = audit.positions.find((row) => row.key === 'litteratur/bokklubbmenneske');
assert.ok(bokklubbmenneske);
assert.equal(bokklubbmenneske.classification, 'ready');
assert.equal(bokklubbmenneske.role_world_status, 'role_world_complete');
assert.equal(bokklubbmenneske.role_world_path, 'data/Civication/roleWorlds/litteratur/litteratur_bokklubbmenneske.json');
assert.equal(bokklubbmenneske.priority_score, 405);
assert.equal(bokklubbmenneske.authored_depth.exact_source_ref_count, 1);
assert.equal(bokklubbmenneske.authored_depth.max_narrative_depth, 14);
assert.deepEqual(bokklubbmenneske.evidence.exact_source_refs, ['data/Civication/narratives/leisure/litteratur_bokklubbmenneske.json']);
assert.ok(!(audit.queue || []).some((row) => row.key === 'litteratur/bokklubbmenneske'));

const bokorm = audit.positions.find((row) => row.key === 'litteratur/bokorm');
assert.ok(bokorm);
assert.equal(bokorm.classification, 'ready');
assert.equal(bokorm.role_world_status, 'role_world_complete');
assert.equal(bokorm.role_world_path, 'data/Civication/roleWorlds/litteratur/litteratur_bokorm.json');
assert.equal(bokorm.priority_score, 405);
assert.equal(bokorm.authored_depth.exact_source_ref_count, 1);
assert.equal(bokorm.authored_depth.max_narrative_depth, 14);
assert.deepEqual(bokorm.evidence.exact_source_refs, ['data/Civication/narratives/leisure/litteratur_bokorm.json']);
assert.ok(!(audit.queue || []).some((row) => row.key === 'litteratur/bokorm'));

const smaforlagsnerd = audit.positions.find((row) => row.key === 'litteratur/smaforlagsnerd');
assert.ok(smaforlagsnerd);
assert.equal(smaforlagsnerd.classification, 'ready');
assert.equal(smaforlagsnerd.role_world_status, 'role_world_complete');
assert.equal(smaforlagsnerd.role_world_path, 'data/Civication/roleWorlds/litteratur/litteratur_smaforlagsnerd.json');
assert.equal(smaforlagsnerd.priority_score, 405);
assert.equal(smaforlagsnerd.authored_depth.exact_source_ref_count, 1);
assert.equal(smaforlagsnerd.authored_depth.max_narrative_depth, 14);
assert.deepEqual(smaforlagsnerd.evidence.exact_source_refs, ['data/Civication/narratives/leisure/litteratur_smaforlagsnerd.json']);
assert.ok(!(audit.queue || []).some((row) => row.key === 'litteratur/smaforlagsnerd'));

const kommentarfeltveteran = audit.positions.find((row) => row.key === 'media/kommentarfeltveteran');
assert.ok(kommentarfeltveteran);
assert.equal(kommentarfeltveteran.classification, 'ready');
assert.equal(kommentarfeltveteran.role_world_status, 'role_world_complete');
assert.equal(kommentarfeltveteran.role_world_path, 'data/Civication/roleWorlds/media/media_kommentarfeltveteran.json');
assert.equal(kommentarfeltveteran.priority_score, 405);
assert.equal(kommentarfeltveteran.authored_depth.exact_source_ref_count, 1);
assert.equal(kommentarfeltveteran.authored_depth.max_narrative_depth, 14);
assert.deepEqual(kommentarfeltveteran.evidence.exact_source_refs, ['data/Civication/narratives/leisure/media_kommentarfeltveteran.json']);
assert.ok(!(audit.queue || []).some((row) => row.key === 'media/kommentarfeltveteran'));

const nyhetsjunkie = audit.positions.find((row) => row.key === 'media/nyhetsjunkie');
assert.ok(nyhetsjunkie);
assert.equal(nyhetsjunkie.classification, 'ready');
assert.equal(nyhetsjunkie.role_world_status, 'role_world_complete');
assert.equal(nyhetsjunkie.role_world_path, 'data/Civication/roleWorlds/media/media_nyhetsjunkie.json');
assert.equal(nyhetsjunkie.priority_score, 405);
assert.equal(nyhetsjunkie.authored_depth.exact_source_ref_count, 1);
assert.equal(nyhetsjunkie.authored_depth.max_narrative_depth, 14);
assert.deepEqual(nyhetsjunkie.evidence.exact_source_refs, ['data/Civication/narratives/leisure/media_nyhetsjunkie.json']);
assert.ok(!(audit.queue || []).some((row) => row.key === 'media/nyhetsjunkie'));

const podkastsluker = audit.positions.find((row) => row.key === 'media/podkastsluker');
assert.ok(podkastsluker);
assert.equal(podkastsluker.classification, 'ready');
assert.equal(podkastsluker.role_world_status, 'role_world_complete');
assert.equal(podkastsluker.role_world_path, 'data/Civication/roleWorlds/media/media_podkastsluker.json');
assert.equal(podkastsluker.priority_score, 405);
assert.equal(podkastsluker.authored_depth.exact_source_ref_count, 1);
assert.equal(podkastsluker.authored_depth.max_narrative_depth, 14);
assert.deepEqual(podkastsluker.evidence.exact_source_refs, ['data/Civication/narratives/leisure/media_podkastsluker.json']);
assert.ok(!(audit.queue || []).some((row) => row.key === 'media/podkastsluker'));

const konsertgjenger = audit.positions.find((row) => row.key === 'musikk/konsertgjenger');
assert.ok(konsertgjenger);
assert.equal(konsertgjenger.classification, 'ready');
assert.equal(konsertgjenger.role_world_status, 'role_world_complete');
assert.equal(konsertgjenger.role_world_path, 'data/Civication/roleWorlds/musikk/musikk_konsertgjenger.json');
assert.equal(konsertgjenger.priority_score, 405);
assert.equal(konsertgjenger.authored_depth.exact_source_ref_count, 1);
assert.equal(konsertgjenger.authored_depth.max_narrative_depth, 14);
assert.deepEqual(konsertgjenger.evidence.exact_source_refs, ['data/Civication/narratives/leisure/musikk_konsertgjenger.json']);
assert.ok(!(audit.queue || []).some((row) => row.key === 'musikk/konsertgjenger'));

const musikknerd = audit.positions.find((row) => row.key === 'musikk/musikknerd');
assert.ok(musikknerd);
assert.equal(musikknerd.classification, 'ready');
assert.equal(musikknerd.role_world_status, 'role_world_complete');
assert.equal(musikknerd.role_world_path, 'data/Civication/roleWorlds/musikk/musikk_musikknerd.json');
assert.equal(musikknerd.priority_score, 405);
assert.equal(musikknerd.authored_depth.exact_source_ref_count, 1);
assert.equal(musikknerd.authored_depth.max_narrative_depth, 14);
assert.deepEqual(musikknerd.evidence.exact_source_refs, ['data/Civication/narratives/leisure/musikk_musikknerd.json']);
assert.ok(!(audit.queue || []).some((row) => row.key === 'musikk/musikknerd'));

const plategraver = audit.positions.find((row) => row.key === 'musikk/plategraver');
assert.ok(plategraver);
assert.equal(plategraver.classification, 'ready');
assert.equal(plategraver.role_world_status, 'role_world_complete');
assert.equal(plategraver.role_world_path, 'data/Civication/roleWorlds/musikk/musikk_plategraver.json');
assert.equal(plategraver.priority_score, 405);
assert.equal(plategraver.authored_depth.exact_source_ref_count, 1);
assert.equal(plategraver.authored_depth.max_narrative_depth, 14);
assert.deepEqual(plategraver.evidence.exact_source_refs, ['data/Civication/narratives/leisure/musikk_plategraver.json']);
assert.ok(!(audit.queue || []).some((row) => row.key === 'musikk/plategraver'));

const grunderdrommer = audit.positions.find((row) => row.key === 'naeringsliv/grunderdrommer');
assert.ok(grunderdrommer);
assert.equal(grunderdrommer.classification, 'ready');
assert.equal(grunderdrommer.role_world_status, 'role_world_complete');
assert.equal(grunderdrommer.role_world_path, 'data/Civication/roleWorlds/naeringsliv/naeringsliv_grunderdrommer.json');
assert.equal(grunderdrommer.priority_score, 405);
assert.equal(grunderdrommer.authored_depth.exact_source_ref_count, 1);
assert.equal(grunderdrommer.authored_depth.max_narrative_depth, 14);
assert.deepEqual(grunderdrommer.evidence.exact_source_refs, ['data/Civication/narratives/leisure/naeringsliv_grunderdrommer.json']);
assert.ok(!(audit.queue || []).some((row) => row.key === 'naeringsliv/grunderdrommer'));

const pendler = audit.positions.find((row) => row.key === 'naeringsliv/pendler');
assert.ok(pendler);
assert.equal(pendler.classification, 'ready');
assert.equal(pendler.role_world_status, 'role_world_complete');
assert.equal(pendler.role_world_path, 'data/Civication/roleWorlds/naeringsliv/naeringsliv_pendler.json');
assert.equal(pendler.priority_score, 405);
assert.equal(pendler.authored_depth.exact_source_ref_count, 1);
assert.equal(pendler.authored_depth.max_narrative_depth, 14);
assert.deepEqual(pendler.evidence.exact_source_refs, ['data/Civication/narratives/leisure/naeringsliv_pendler.json']);
assert.ok(!(audit.queue || []).some((row) => row.key === 'naeringsliv/pendler'));

const smasparer = audit.positions.find((row) => row.key === 'naeringsliv/smasparer');
assert.ok(smasparer);
assert.equal(smasparer.classification, 'ready');
assert.equal(smasparer.role_world_status, 'role_world_complete');
assert.equal(smasparer.role_world_path, 'data/Civication/roleWorlds/naeringsliv/naeringsliv_smasparer.json');
assert.equal(smasparer.priority_score, 405);
assert.equal(smasparer.authored_depth.exact_source_ref_count, 1);
assert.equal(smasparer.authored_depth.max_narrative_depth, 14);
assert.deepEqual(smasparer.evidence.exact_source_refs, ['data/Civication/narratives/leisure/naeringsliv_smasparer.json']);
assert.ok(!(audit.queue || []).some((row) => row.key === 'naeringsliv/smasparer'));

const fuglekikker = audit.positions.find((row) => row.key === 'natur/fuglekikker');
assert.ok(fuglekikker);
assert.equal(fuglekikker.classification, 'ready');
assert.equal(fuglekikker.role_world_status, 'role_world_complete');
assert.equal(fuglekikker.role_world_path, 'data/Civication/roleWorlds/natur/natur_fuglekikker.json');
assert.equal(fuglekikker.priority_score, 405);
assert.equal(fuglekikker.authored_depth.exact_source_ref_count, 1);
assert.equal(fuglekikker.authored_depth.max_narrative_depth, 14);
assert.deepEqual(fuglekikker.evidence.exact_source_refs, ['data/Civication/narratives/leisure/natur_fuglekikker.json']);
assert.ok(!(audit.queue || []).some((row) => row.key === 'natur/fuglekikker'));

const sanker = audit.positions.find((row) => row.key === 'natur/sanker');
assert.ok(sanker);
assert.equal(sanker.classification, 'ready');
assert.equal(sanker.role_world_status, 'role_world_complete');
assert.equal(sanker.role_world_path, 'data/Civication/roleWorlds/natur/natur_sanker.json');
assert.equal(sanker.priority_score, 405);
assert.equal(sanker.authored_depth.exact_source_ref_count, 1);
assert.equal(sanker.authored_depth.max_narrative_depth, 14);
assert.deepEqual(sanker.evidence.exact_source_refs, ['data/Civication/narratives/leisure/natur_sanker.json']);
assert.ok(!(audit.queue || []).some((row) => row.key === 'natur/sanker'));

const turgaer = audit.positions.find((row) => row.key === 'natur/turgaer');
assert.ok(turgaer);
assert.equal(turgaer.classification, 'ready');
assert.equal(turgaer.role_world_status, 'role_world_complete');
assert.equal(turgaer.role_world_path, 'data/Civication/roleWorlds/natur/natur_turgaer.json');
assert.equal(turgaer.priority_score, 405);
assert.equal(turgaer.authored_depth.exact_source_ref_count, 1);
assert.equal(turgaer.authored_depth.max_narrative_depth, 14);
assert.deepEqual(turgaer.evidence.exact_source_refs, ['data/Civication/narratives/leisure/natur_turgaer.json']);
assert.ok(!(audit.queue || []).some((row) => row.key === 'natur/turgaer'));

const grasrotbygger = audit.positions.find((row) => row.key === 'politikk/grasrotbygger');
assert.ok(grasrotbygger);
assert.equal(grasrotbygger.classification, 'ready');
assert.equal(grasrotbygger.role_world_status, 'role_world_complete');
assert.equal(grasrotbygger.role_world_path, 'data/Civication/roleWorlds/politikk/politikk_grasrotbygger.json');
assert.equal(grasrotbygger.priority_score, 405);
assert.equal(grasrotbygger.authored_depth.exact_source_ref_count, 1);
assert.equal(grasrotbygger.authored_depth.max_narrative_depth, 14);
assert.deepEqual(grasrotbygger.evidence.exact_source_refs, ['data/Civication/narratives/leisure/politikk_grasrotbygger.json']);
assert.ok(!(audit.queue || []).some((row) => row.key === 'politikk/grasrotbygger'));

const kampanjemenneske = audit.positions.find((row) => row.key === 'politikk/kampanjemenneske');
assert.ok(kampanjemenneske);
assert.equal(kampanjemenneske.classification, 'ready');
assert.equal(kampanjemenneske.role_world_status, 'role_world_complete');
assert.equal(kampanjemenneske.role_world_path, 'data/Civication/roleWorlds/politikk/politikk_kampanjemenneske.json');
assert.equal(kampanjemenneske.priority_score, 405);
assert.equal(kampanjemenneske.authored_depth.exact_source_ref_count, 1);
assert.equal(kampanjemenneske.authored_depth.max_narrative_depth, 14);
assert.deepEqual(kampanjemenneske.evidence.exact_source_refs, ['data/Civication/narratives/leisure/politikk_kampanjemenneske.json']);
assert.ok(!(audit.queue || []).some((row) => row.key === 'politikk/kampanjemenneske'));

const motesliter = audit.positions.find((row) => row.key === 'politikk/motesliter');
assert.ok(motesliter);
assert.equal(motesliter.classification, 'ready');
assert.equal(motesliter.role_world_status, 'role_world_complete');
assert.equal(motesliter.role_world_path, 'data/Civication/roleWorlds/politikk/politikk_motesliter.json');
assert.equal(motesliter.priority_score, 405);
assert.equal(motesliter.authored_depth.exact_source_ref_count, 1);
assert.equal(motesliter.authored_depth.max_narrative_depth, 14);
assert.deepEqual(motesliter.evidence.exact_source_refs, ['data/Civication/narratives/leisure/politikk_motesliter.json']);
assert.ok(!(audit.queue || []).some((row) => row.key === 'politikk/motesliter'));

const organisasjonsmenneske = audit.positions.find((row) => row.key === 'politikk/organisasjonsmenneske');
assert.ok(organisasjonsmenneske);
assert.equal(organisasjonsmenneske.classification, 'ready');
assert.equal(organisasjonsmenneske.role_world_status, 'role_world_complete');
assert.equal(organisasjonsmenneske.role_world_path, 'data/Civication/roleWorlds/politikk/politikk_organisasjonsmenneske.json');
assert.equal(organisasjonsmenneske.priority_score, 405);
assert.equal(organisasjonsmenneske.authored_depth.exact_source_ref_count, 1);
assert.equal(organisasjonsmenneske.authored_depth.max_narrative_depth, 14);
assert.deepEqual(organisasjonsmenneske.evidence.exact_source_refs, ['data/Civication/narratives/leisure/politikk_organisasjonsmenneske.json']);
assert.ok(!(audit.queue || []).some((row) => row.key === 'politikk/organisasjonsmenneske'));

const monsterjeger = audit.positions.find((row) => row.key === 'psykologi/monsterjeger');
assert.ok(monsterjeger);
assert.equal(monsterjeger.classification, 'ready');
assert.equal(monsterjeger.role_world_status, 'role_world_complete');
assert.equal(monsterjeger.role_world_path, 'data/Civication/roleWorlds/psykologi/psykologi_monsterjeger.json');
assert.equal(monsterjeger.priority_score, 405);
assert.equal(monsterjeger.authored_depth.exact_source_ref_count, 1);
assert.equal(monsterjeger.authored_depth.max_narrative_depth, 14);
assert.deepEqual(monsterjeger.evidence.exact_source_refs, ['data/Civication/narratives/leisure/psykologi_monsterjeger.json']);
assert.ok(!(audit.queue || []).some((row) => row.key === 'psykologi/monsterjeger'));

const psykologientusiast = audit.positions.find((row) => row.key === 'psykologi/psykologientusiast');
assert.ok(psykologientusiast);
assert.equal(psykologientusiast.classification, 'ready');
assert.equal(psykologientusiast.role_world_status, 'role_world_complete');
assert.equal(psykologientusiast.role_world_path, 'data/Civication/roleWorlds/psykologi/psykologi_psykologientusiast.json');
assert.equal(psykologientusiast.priority_score, 405);
assert.equal(psykologientusiast.authored_depth.exact_source_ref_count, 1);
assert.equal(psykologientusiast.authored_depth.max_narrative_depth, 14);
assert.deepEqual(psykologientusiast.evidence.exact_source_refs, ['data/Civication/narratives/leisure/psykologi_psykologientusiast.json']);
assert.ok(!(audit.queue || []).some((row) => row.key === 'psykologi/psykologientusiast'));

const relasjonsbygger = audit.positions.find((row) => row.key === 'psykologi/relasjonsbygger');
assert.ok(relasjonsbygger);
assert.equal(relasjonsbygger.classification, 'ready');
assert.equal(relasjonsbygger.role_world_status, 'role_world_complete');
assert.equal(relasjonsbygger.role_world_path, 'data/Civication/roleWorlds/psykologi/psykologi_relasjonsbygger.json');
assert.equal(relasjonsbygger.priority_score, 405);
assert.equal(relasjonsbygger.authored_depth.exact_source_ref_count, 1);
assert.equal(relasjonsbygger.authored_depth.max_narrative_depth, 14);
assert.deepEqual(relasjonsbygger.evidence.exact_source_refs, ['data/Civication/narratives/leisure/psykologi_relasjonsbygger.json']);
assert.ok(!(audit.queue || []).some((row) => row.key === 'psykologi/relasjonsbygger'));

const selvgransker = audit.positions.find((row) => row.key === 'psykologi/selvgransker');
assert.ok(selvgransker);
assert.equal(selvgransker.classification, 'ready');
assert.equal(selvgransker.role_world_status, 'role_world_complete');
assert.equal(selvgransker.role_world_path, 'data/Civication/roleWorlds/psykologi/psykologi_selvgransker.json');
assert.equal(selvgransker.priority_score, 405);
assert.equal(selvgransker.authored_depth.exact_source_ref_count, 1);
assert.equal(selvgransker.authored_depth.max_narrative_depth, 14);
assert.deepEqual(selvgransker.evidence.exact_source_refs, ['data/Civication/narratives/leisure/psykologi_selvgransker.json']);
assert.ok(!(audit.queue || []).some((row) => row.key === 'psykologi/selvgransker'));

const vaneeksperimentor = audit.positions.find((row) => row.key === 'psykologi/vaneeksperimentor');
assert.ok(vaneeksperimentor);
assert.equal(vaneeksperimentor.classification, 'ready');
assert.equal(vaneeksperimentor.role_world_status, 'role_world_complete');
assert.equal(vaneeksperimentor.role_world_path, 'data/Civication/roleWorlds/psykologi/psykologi_vaneeksperimentor.json');
assert.equal(vaneeksperimentor.priority_score, 405);
assert.equal(vaneeksperimentor.authored_depth.exact_source_ref_count, 1);
assert.equal(vaneeksperimentor.authored_depth.max_narrative_depth, 14);
assert.deepEqual(vaneeksperimentor.evidence.exact_source_refs, ['data/Civication/narratives/leisure/psykologi_vaneeksperimentor.json']);
assert.ok(!(audit.queue || []).some((row) => row.key === 'psykologi/vaneeksperimentor'));

const dialogbygger = audit.positions.find((row) => row.key === 'religion/dialogbygger');
assert.ok(dialogbygger);
assert.equal(dialogbygger.classification, 'ready');
assert.equal(dialogbygger.role_world_status, 'role_world_complete');
assert.equal(dialogbygger.role_world_path, 'data/Civication/roleWorlds/religion/religion_dialogbygger.json');
assert.equal(dialogbygger.priority_score, 405);
assert.equal(dialogbygger.authored_depth.exact_source_ref_count, 1);
assert.equal(dialogbygger.authored_depth.max_narrative_depth, 14);
assert.deepEqual(dialogbygger.evidence.exact_source_refs, ['data/Civication/narratives/leisure/religion_dialogbygger.json']);
assert.ok(!(audit.queue || []).some((row) => row.key === 'religion/dialogbygger'));

const livssynsutforsker = audit.positions.find((row) => row.key === 'religion/livssynsutforsker');
assert.ok(livssynsutforsker);
assert.equal(livssynsutforsker.classification, 'ready');
assert.equal(livssynsutforsker.role_world_status, 'role_world_complete');
assert.equal(livssynsutforsker.role_world_path, 'data/Civication/roleWorlds/religion/religion_livssynsutforsker.json');
assert.equal(livssynsutforsker.priority_score, 405);
assert.equal(livssynsutforsker.authored_depth.exact_source_ref_count, 1);
assert.equal(livssynsutforsker.authored_depth.max_narrative_depth, 14);
assert.deepEqual(livssynsutforsker.evidence.exact_source_refs, ['data/Civication/narratives/leisure/religion_livssynsutforsker.json']);
assert.ok(!(audit.queue || []).some((row) => row.key === 'religion/livssynsutforsker'));

const pilegrim = audit.positions.find((row) => row.key === 'religion/pilegrim');
assert.ok(pilegrim);
assert.equal(pilegrim.classification, 'ready');
assert.equal(pilegrim.role_world_status, 'role_world_complete');
assert.equal(pilegrim.role_world_path, 'data/Civication/roleWorlds/religion/religion_pilegrim.json');
assert.equal(pilegrim.priority_score, 405);
assert.equal(pilegrim.authored_depth.exact_source_ref_count, 1);
assert.equal(pilegrim.authored_depth.max_narrative_depth, 14);
assert.deepEqual(pilegrim.evidence.exact_source_refs, ['data/Civication/narratives/leisure/religion_pilegrim.json']);
assert.ok(!(audit.queue || []).some((row) => row.key === 'religion/pilegrim'));

const trosstedsvandrer = audit.positions.find((row) => row.key === 'religion/trosstedsvandrer');
assert.ok(trosstedsvandrer);
assert.equal(trosstedsvandrer.classification, 'ready');
assert.equal(trosstedsvandrer.role_world_status, 'role_world_complete');
assert.equal(trosstedsvandrer.role_world_path, 'data/Civication/roleWorlds/religion/religion_trosstedsvandrer.json');
assert.equal(trosstedsvandrer.priority_score, 405);
assert.equal(trosstedsvandrer.authored_depth.exact_source_ref_count, 1);
assert.equal(trosstedsvandrer.authored_depth.max_narrative_depth, 14);
assert.deepEqual(trosstedsvandrer.evidence.exact_source_refs, ['data/Civication/narratives/leisure/religion_trosstedsvandrer.json']);
assert.ok(!(audit.queue || []).some((row) => row.key === 'religion/trosstedsvandrer'));

const improentusiast = audit.positions.find((row) => row.key === 'scenekunst/improentusiast');
assert.ok(improentusiast);
assert.equal(improentusiast.classification, 'ready');
assert.equal(improentusiast.role_world_status, 'role_world_complete');
assert.equal(improentusiast.role_world_path, 'data/Civication/roleWorlds/scenekunst/scenekunst_improentusiast.json');
assert.equal(improentusiast.priority_score, 405);
assert.equal(improentusiast.authored_depth.exact_source_ref_count, 1);
assert.equal(improentusiast.authored_depth.max_narrative_depth, 14);
assert.deepEqual(improentusiast.evidence.exact_source_refs, ['data/Civication/narratives/leisure/scenekunst_improentusiast.json']);
assert.ok(!(audit.queue || []).some((row) => row.key === 'scenekunst/improentusiast'));

const premieregjenger = audit.positions.find((row) => row.key === 'scenekunst/premieregjenger');
assert.ok(premieregjenger);
assert.equal(premieregjenger.classification, 'ready');
assert.equal(premieregjenger.role_world_status, 'role_world_complete');
assert.equal(premieregjenger.role_world_path, 'data/Civication/roleWorlds/scenekunst/scenekunst_premieregjenger.json');
assert.equal(premieregjenger.priority_score, 405);
assert.equal(premieregjenger.authored_depth.exact_source_ref_count, 1);
assert.equal(premieregjenger.authored_depth.max_narrative_depth, 14);
assert.deepEqual(premieregjenger.evidence.exact_source_refs, ['data/Civication/narratives/leisure/scenekunst_premieregjenger.json']);
assert.ok(!(audit.queue || []).some((row) => row.key === 'scenekunst/premieregjenger'));
const teatergjenganger = audit.positions.find((row) => row.key === 'scenekunst/teatergjenganger');
assert.ok(teatergjenganger);
assert.equal(teatergjenganger.classification, 'ready');
assert.equal(teatergjenganger.role_world_status, 'role_world_complete');
assert.equal(teatergjenganger.role_world_path, 'data/Civication/roleWorlds/scenekunst/scenekunst_teatergjenganger.json');
assert.equal(teatergjenganger.priority_score, 405);
assert.equal(teatergjenganger.authored_depth.exact_source_ref_count, 1);
assert.equal(teatergjenganger.authored_depth.max_narrative_depth, 14);
assert.deepEqual(teatergjenganger.evidence.exact_source_refs, ['data/Civication/narratives/leisure/scenekunst_teatergjenganger.json']);
assert.ok(!(audit.queue || []).some((row) => row.key === 'scenekunst/teatergjenganger'));
const sondagsutover = audit.positions.find((row) => row.key === 'sport/sondagsutover');
assert.ok(sondagsutover);
assert.equal(sondagsutover.classification, 'ready');
assert.equal(sondagsutover.role_world_status, 'role_world_complete');
assert.equal(sondagsutover.role_world_path, 'data/Civication/roleWorlds/sport/sport_sondagsutover.json');
assert.equal(sondagsutover.priority_score, 405);
assert.equal(sondagsutover.authored_depth.exact_source_ref_count, 1);
assert.equal(sondagsutover.authored_depth.max_narrative_depth, 14);
assert.deepEqual(sondagsutover.evidence.exact_source_refs, ['data/Civication/narratives/leisure/sport_sondagsutover.json']);
assert.ok(!(audit.queue || []).some((row) => row.key === 'sport/sondagsutover'));
const tribunesliter = audit.positions.find((row) => row.key === 'sport/tribunesliter');
assert.ok(tribunesliter);
assert.equal(tribunesliter.classification, 'ready');
assert.equal(tribunesliter.role_world_status, 'role_world_complete');
assert.equal(tribunesliter.role_world_path, 'data/Civication/roleWorlds/sport/sport_tribunesliter.json');
assert.equal(tribunesliter.priority_score, 405);
assert.equal(tribunesliter.authored_depth.exact_source_ref_count, 1);
assert.equal(tribunesliter.authored_depth.max_narrative_depth, 14);
assert.deepEqual(tribunesliter.evidence.exact_source_refs, ['data/Civication/narratives/leisure/sport_tribunesliter.json']);
assert.ok(!(audit.queue || []).some((row) => row.key === 'sport/tribunesliter'));
const didaktiskTenker = audit.positions.find((row) => row.key === 'utdanning/didaktisk_tenker');
assert.ok(didaktiskTenker);
assert.equal(didaktiskTenker.classification, 'ready');
assert.equal(didaktiskTenker.role_world_status, 'role_world_complete');
assert.equal(didaktiskTenker.role_world_path, 'data/Civication/roleWorlds/utdanning/utdanning_didaktisk_tenker.json');
assert.equal(didaktiskTenker.priority_score, 405);
assert.equal(didaktiskTenker.authored_depth.exact_source_ref_count, 1);
assert.equal(didaktiskTenker.authored_depth.max_narrative_depth, 14);
assert.deepEqual(didaktiskTenker.evidence.exact_source_refs, ['data/Civication/narratives/leisure/utdanning_didaktisk_tenker.json']);
assert.ok(!(audit.queue || []).some((row) => row.key === 'utdanning/didaktisk_tenker'));

assert.ok(!(audit.queue || []).some((row) => ['sport/supporter','by/nabolagskjenner','film_tv/filmklubbmenneske'].includes(row.key)),
  'completed life-position worlds must leave the readiness queue');
assert.ok((audit.queue || []).every((row) => row.classification !== 'not_a_standalone_world'));
assert.equal(new Set(audit.positions.map((row) => row.key)).size, 199);
assert.deepEqual(new Set(audit.positions.map((row) => row.classification)),
  new Set(['ready', 'needs_authored_depth', 'not_a_standalone_world']));
assert.ok(audit.semantics.audit_only_no_new_runtime);
assert.ok(audit.semantics.readiness_classification_is_independent_of_role_world_lifecycle);
assert.ok(audit.semantics.one_life_position_per_role_world_pr);
assert.ok(audit.semantics.livelihood_opportunity_alone_is_not_role_world_depth);

console.log('civication life-position Role World readiness v2 ok: 77 ready / 82 authored-depth / 40 not-standalone; 77 complete / no pending-ready');
