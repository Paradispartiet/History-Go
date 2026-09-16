#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..'),read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
const audit=read('data/Civication/lifePositionRoleWorldReadiness.json');
const streamPath='data/Civication/narratives/leisure/psykologi_relasjonsbygger.json';
const stream=read(streamPath),row=audit.positions.find(x=>x.key==='psykologi/relasjonsbygger');
assert.ok(row);assert.equal(row.kind,'community_identity');assert.equal(row.semantic_mode,'lived_identity_or_practice');assert.equal(row.runtime_source,'catalog');
assert.equal(stream.storylets.length,14);assert.equal(new Set(stream.storylets.map(x=>x.id)).size,14);assert.equal(stream.applies_when.any_tags[0],'psykologi:relasjonsbygger');
assert.equal(row.classification,'ready');assert.equal(row.role_world_status,'role_world_complete');assert.equal(row.role_world_path,'data/Civication/roleWorlds/psykologi/psykologi_relasjonsbygger.json');assert.equal(row.priority_score,405);
assert.equal(row.authored_depth.exact_source_ref_count,1);assert.equal(row.authored_depth.max_narrative_depth,14);assert.deepEqual(row.evidence.exact_source_refs,[streamPath]);assert.ok(!audit.queue.some(x=>x.key===row.key));assert.equal(audit.first_ready,null);assert.equal(audit.summary.pending_ready_positions,0);
console.log('Relasjonsbygger readiness and lifecycle complete ok');
