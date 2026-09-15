#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..'),read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
const audit=read('data/Civication/lifePositionRoleWorldReadiness.json'),streamPath='data/Civication/narratives/leisure/media_kommentarfeltveteran.json',stream=read(streamPath);
const row=audit.positions.find(x=>x.key==='media/kommentarfeltveteran');
assert.ok(row);assert.equal(row.runtime_source,'catalog');assert.equal(row.kind,'alternative_life_status');
assert.equal(stream.storylets.length,14);assert.equal(new Set(stream.storylets.map(x=>x.id)).size,14);assert.equal(stream.applies_when.any_tags[0],'media:kommentarfeltveteran');
assert.ok(stream.storylets.every(x=>x.situation.length>=3&&x.choices.length===2));
assert.equal(row.classification,'ready');assert.equal(row.role_world_status,'role_world_complete');assert.equal(row.role_world_path,'data/Civication/roleWorlds/media/media_kommentarfeltveteran.json');
assert.equal(row.priority_score,405);assert.equal(row.authored_depth.exact_source_ref_count,1);assert.equal(row.authored_depth.max_narrative_depth,14);
assert.deepEqual(row.evidence.exact_source_refs,[streamPath]);assert.ok(!audit.queue.some(x=>x.key===row.key));assert.equal(audit.first_ready,null);assert.equal(audit.summary.pending_ready_positions,0);
console.log('Kommentarfeltveteran readiness and lifecycle complete ok');
