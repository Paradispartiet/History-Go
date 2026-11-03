#!/usr/bin/env node
'use strict';
// External film evidence may guide original scenes. It does not constitute
// watched-film analysis, role authority, or proof of a playable full arc.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = p => JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
const rel = 'data/Civication/lifestory/editorial/inspiration/filmThemeSourceNotesWave01V1.json';
const notes = read(rel);
const inventory = read(notes.inventory_path);
const byType = new Map(inventory.types.map(x=>[x.type_id,x]));
assert.equal(notes.status,'source_grounded_themes_not_close_reading');
assert.deepEqual(notes.entries.map(x=>x.type_id), ['C01','C06','C17']);
const seen = new Set();
for (const row of notes.entries) {
  assert.ok(!seen.has(row.type_id), 'one source note per story type');
  seen.add(row.type_id);
  const official = byType.get(row.type_id);
  assert.ok(official, row.type_id+' in canonical 24-type inventory');
  assert.equal(row.film_imdb_id,official.film_imdb_id);
  assert.equal(row.film_analysis,'not_reviewed');
  assert.equal(official.film_analysis,'not_reviewed',
    'do not auto-approve a film as close-read because the metadata matches');
  assert.equal(row.editorial_status,'theme_source_supported_only');
  assert.ok(official.role_adaptations.some(x=>
    x.role_id===row.role_id && x.applicability.startsWith('runtime')),
    'role-specific application must be grounded in existing runtime');
  assert.ok(fs.existsSync(path.join(__dirname,'..',official.runtime_path)),
    'role story scene source must exist');
  assert.ok(row.source_urls.length>=1);
  assert.ok(row.source_urls.every(url=>url.startsWith('https://')&&
    !url.includes('wikipedia.org')&&url.length<220));
  for(const field of ['source_claims','legitimate_choices','avoid']){
    assert.ok(Array.isArray(row[field])&&row[field].length>=2,row.type_id+'/'+field);
  }
  assert.ok(row.original_civication_conflict.length>60);
  assert.ok(row.persistent_consequence.length>50);
  assert.ok(!row.persistent_consequence.match(/always (injured|ill|sick)/i),
    'no deterministic invented health consequences');
}
assert.equal(inventory.types.length,24,
  'source notes do not replace the full registered story universe');
console.log('Civication film inspirations: 3 sourced thematic lenses, 0 fabricated close-read approvals');
