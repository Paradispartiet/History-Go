#!/usr/bin/env node
'use strict';
// A film synopsis is not an attended film analysis and cannot upgrade gameplay status.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const notes=read('data/Civication/lifestory/editorial/inspiration/filmThemeSourceNotesWave03V1.json');
const original=read(notes.inventory_path);
assert.equal(notes.schema,'civication_film_theme_source_notes_v1');
assert.equal(notes.status,'source_grounded_themes_not_close_reading');
assert.equal(original.types.length,24);
assert.deepEqual(notes.entries.map(e=>e.type_id),['C05','C07','C08']);
for(const n of notes.entries){
 const ref=original.types.find(x=>x.type_id===n.type_id);
 assert.ok(ref);
 assert.equal(ref.film_imdb_id,n.film_imdb_id);
 assert.equal(ref.film_analysis,'not_reviewed');
 assert.equal(n.film_analysis,'not_reviewed');
 assert.equal(n.editorial_status,'theme_source_supported_only');
 assert.ok(ref.role_adaptations.some(x=>x.role_id===n.role_id),n.role_id);
 assert.ok(n.source_urls.length>=2 && n.source_urls.every(s=>s.startsWith('https://')));
 assert.ok(n.source_claims.length>=2 && n.film_form_notes.length>=2);
 assert.ok(n.legitimate_choices.length>=3 && n.avoid.length>=2);
 assert.ok(n.original_civication_conflict.length>70 && n.persistent_consequence.length>60);
 if(n.type_id!=='C08'){
  assert.equal(ref.runtime,'registered_first_installment');
  assert.equal(ref.runtime_path,n.existing_runtime_path);
  const runtime=read(n.existing_runtime_path);
  const scenes=Array.isArray(runtime)?runtime:runtime.scenes||[];
  assert.ok(scenes.some(s=>s.threadId==='wave_a_'+n.type_id.toLowerCase()),n.type_id+' needs authored scenes');
 }else{
  assert.equal(ref.runtime,'no_new_scenes');
  assert.equal(ref.runtime_path,null);
  assert.equal(n.existing_runtime_path,null);
 }
}
console.log('Civication film themes wave03: C05/C07 grounded in playable scenes; C08 explicitly not playable; 0 false close-reading approvals');
