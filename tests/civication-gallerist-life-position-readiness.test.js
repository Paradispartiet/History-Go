#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..'),read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
const audit=read('data/Civication/lifePositionRoleWorldReadiness.json');
const streamPath='data/Civication/narratives/leisure/kunst_gallerist.json';
const stream=read(streamPath),row=audit.positions.find(x=>x.key==='kunst/gallerist');
assert.ok(row);
assert.equal(row.kind,'gallery_operator_practice_or_business_role');
assert.equal(row.semantic_mode,'lived_identity_or_practice');
assert.equal(row.runtime_source,'badge_tier');
assert.equal(stream.storylets.length,14);
assert.equal(new Set(stream.storylets.map(x=>x.id)).size,14);
assert.equal(stream.applies_when.any_tags[0],'kunst:gallerist');
assert.equal(row.classification,'ready');
assert.equal(row.role_world_status,'role_world_complete');
assert.equal(row.role_world_path,'data/Civication/roleWorlds/kunst/kunst_gallerist.json');
assert.equal(row.priority_score,390);
assert.equal(row.authored_depth.exact_source_ref_count,1);
assert.equal(row.authored_depth.max_narrative_depth,14);
assert.deepEqual(row.evidence.exact_source_refs,[streamPath]);
assert.ok(!audit.queue.some(x=>x.key===row.key));
const unrelated=['naeringsliv/sideprosjektbygger'].map(key=>audit.positions.find(x=>x.key===key));
for(const candidate of unrelated){
  assert.ok(candidate);
  assert.equal(candidate.classification,'needs_authored_depth');
  assert.ok(!candidate.evidence.exact_source_refs.includes(streamPath));
}
assert.equal(audit.first_ready,null);
assert.equal(audit.summary.pending_ready_positions,0);
const text=JSON.stringify(stream);
assert.match(text,/program|provisjon|samler|proveniens|galleri/i);
assert.match(text,/takst|juridisk|finansiell|arbeidsgiver|selskapsstatus|rådgiv/i);
console.log('Gallerist readiness and lifecycle complete ok');
