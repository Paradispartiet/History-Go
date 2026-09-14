#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..'),read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
const audit=read('data/Civication/lifePositionRoleWorldReadiness.json'),streamPath='data/Civication/narratives/leisure/film_tv_filmfantast.json',worldPath='data/Civication/roleWorlds/film_tv/film_tv_filmfantast.json',stream=read(streamPath),world=read(worldPath),index=read('data/Civication/roleWorlds/index.json'),row=audit.positions.find(x=>x.key==='film_tv/filmfantast');
assert.ok(row);assert.equal(row.id,'filmfantast');assert.equal(row.runtime_source,'badge_tier');assert.equal(row.kind,'enthusiast_identity');
assert.equal(stream.storylets.length,14);assert.equal(stream.applies_when.any_tags[0],'film_tv:filmfantast');
assert.equal(row.classification,'ready');assert.equal(row.role_world_status,'role_world_complete');assert.equal(row.role_world_path,worldPath);assert.equal(row.authored_depth.max_narrative_depth,14);
assert.deepEqual(row.evidence.exact_source_refs,[streamPath]);assert.deepEqual(row.evidence.thematic_source_refs,[]);assert.ok(!audit.queue.some(x=>x.key==='film_tv/filmfantast'));
assert.equal(audit.summary.,27);assert.equal(audit.summary.,132);assert.equal(audit.summary.,27);assert.equal(audit.summary.,27);assert.equal(audit.summary.,27);assert.equal(audit.summary.,27);assert.equal(audit.summary.pending_ready_positions,0);assert.equal(audit.first_ready,null);assert.equal(audit.queue[0].key,'film_tv/kinogjenger');
assert.equal(world.season.coverage.length,56);assert.equal(new Set(world.season.coverage.map(x=>x.day+'/'+x.phase)).size,56);assert.equal(world.materialization.source_refs.length,14);assert.equal(world.primary_threads.length,13);assert.equal(world.recurring_people_archetypes.length,6);assert.equal(world.private_aftermath.length,5);assert.equal(world.delayed_consequences.length,6);
assert.match(world.sociological_core.description,/Filminteressert/);assert.match(world.sociological_core.description,/Filmnerd/);assert.match(world.sociological_core.description,/Kinogjenger/);assert.match(world.sociological_core.description,/Seriesluker/);assert.match(world.sociological_core.description,/Filmklubbmennesk/);assert.match(world.sociological_core.description,/Festivalgjenger/);assert.match(world.sociological_core.description,/Ingen ny runtime/i);
assert.equal(index.,112);assert.equal(index.roles.filter(x=>x.subject_type==='life_position').length,27);assert.equal(index.status,'112_role_worlds_materialized');assert.deepEqual(index.summary,{role_worlds_total:112,career_role_worlds:85,life_position_role_worlds:27});
console.log('Filmfantast readiness + Role World ok');
