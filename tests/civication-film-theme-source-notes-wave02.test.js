#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const notes=read('data/Civication/lifestory/editorial/inspiration/filmThemeSourceNotesWave02V1.json');
const inventory=read(notes.inventory_path);
assert.equal(notes.schema,'civication_film_theme_source_notes_v1');
assert.equal(notes.status,'source_grounded_themes_not_close_reading');
assert.deepEqual(notes.entries.map(x=>x.type_id),['C02','C03','C04']);
assert.equal(inventory.types.length,24);
for(const note of notes.entries){
 const original=inventory.types.find(x=>x.type_id===note.type_id);
 assert.ok(original,note.type_id);
 assert.equal(original.film_imdb_id,note.film_imdb_id);
 assert.equal(note.film_analysis,'not_reviewed');
 assert.equal(original.film_analysis,'not_reviewed');
 assert.equal(note.editorial_status,'theme_source_supported_only');
 assert.ok(original.role_adaptations.some(x=>x.role_id===note.role_id),note.role_id);
 assert.ok(note.source_urls.length>=2);
 assert.ok(note.source_urls.every(x=>x.startsWith('https://')&&!x.includes('wikipedia.org')));
 assert.ok(note.source_claims.length>=2&&note.film_form_notes.length>=2);
 assert.ok(note.legitimate_choices.length>=3);
 assert.ok(note.original_civication_conflict.length>85);
 assert.ok(note.persistent_consequence.length>60);
 assert.ok(note.avoid.length>=2);
 if(original.runtime==='registered_first_installment'){
   assert.equal(note.existing_runtime_path,original.runtime_path);
   assert.ok(fs.existsSync(path.join(root,original.runtime_path)));
   const body=read(original.runtime_path);
   assert.ok(body.threads.some(t=>t.id==='wave_a_'+note.type_id.toLowerCase()),
      note.type_id+' must have actual authored story thread');
   assert.ok(body.scenes.length>0);
 }else{
   assert.equal(note.type_id,'C04','only C04 is intentionally not playable in this wave');
   assert.equal(original.runtime,'no_new_scenes');
   assert.equal(note.existing_runtime_path,null);
 }
}
console.log('Civication film wave02: C02/C03 anchored to actual scenes; C04 explicitly unplayed; no claimed close reading');
