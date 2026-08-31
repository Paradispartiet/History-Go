import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const json=(p)=>JSON.parse(fs.readFileSync(p,'utf8'));
const registry=json('data/fagverk/fagverk_registry.json');
const manifest=json('data/fag/politikk/politikk_runtime_manifest.json');
const pensum=json(manifest.sourceOfTruth.pensum);
const emners=json(manifest.sourceOfTruth.emner);

test('politikkfagverket har canonical modell og ferdigskrevne kapitler',()=>{const subject=registry.subjects.politikk;assert.equal(subject.canonicalModel.sourceOfTruth,true);assert.equal(subject.canonicalModel.runtimeManifest,'data/fag/politikk/politikk_runtime_manifest.json');assert.ok(subject.chapters.length>=2);for(const chapter of subject.chapters){const data=json(chapter.file);assert.ok(data.title);assert.ok(data.lead);assert.ok(Array.isArray(data.learningObjectives)&&data.learningObjectives.length>=4);assert.ok(Array.isArray(data.moduleFiles)&&data.moduleFiles.length>=1);}});
test('canonical data eier alle emner og fagområder',()=>{assert.equal(pensum.domains.length,13);assert.equal(emners.length,123);assert.equal(Object.hasOwn(registry,'emner'),false);});
test('stedskuratering eies av Place mens registryet bare indekserer',()=>{const place=json('data/places/politikk/oslo/places_politikk/regjeringskvartalet.json'),f=place.fagverk,link=registry.placeLinks.regjeringskvartalet;assert.equal(f.schema,'history_go_place_fagverk_v2');assert.ok(f.emne_ids.length>=6);assert.ok(f.lenses.length>=4);assert.ok(f.lenses.every((lens)=>lens.subject_id&&lens.emne_id&&f.emne_ids.includes(lens.emne_id)));assert.ok(f.guiding_questions.length>=4);assert.ok(f.chapter_ids.length>=1);assert.ok(f.observable_traces.length>=2);assert.deepEqual(Object.keys(link).sort(),['field','level','schema','sourceFile','status']);});
test('kapittelmoduler har pedagogiske lag og kilder',()=>{for(const meta of registry.subjects.politikk.chapters){const chapter=json(meta.file);const merged={...chapter};for(const file of chapter.moduleFiles){const module=json(file);for(const [key,value] of Object.entries(module)){if(Array.isArray(value))merged[key]=[...(merged[key]||[]),...value];else merged[key]=value;}}for(const key of ['sections','workedExamples','commonMisconceptions','concepts','applicationTasks','selfCheck','sources'])assert.ok(Array.isArray(merged[key])&&merged[key].length>0,`${meta.id}: ${key}`);}});
