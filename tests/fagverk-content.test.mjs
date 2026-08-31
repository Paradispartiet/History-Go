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
test('stedskuratering lagrer bare canonicale id-er, klikkmål og stedsspesifikt innhold',()=>{const link=registry.placeLinks.regjeringskvartalet;assert.ok(link.emneIds.length>=6);assert.ok(link.lenses.length>=4);assert.ok(link.lenses.every((lens)=>lens.emneId&&link.emneIds.includes(lens.emneId)));assert.ok(link.guidingQuestions.length>=4);assert.equal(Object.hasOwn(link,'concepts'),false);assert.equal(Object.hasOwn(link,'chapters'),false);});
test('kapittelmoduler har pedagogiske lag og kilder',()=>{for(const meta of registry.subjects.politikk.chapters){const chapter=json(meta.file);const merged={...chapter};for(const file of chapter.moduleFiles){const module=json(file);for(const [key,value] of Object.entries(module)){if(Array.isArray(value))merged[key]=[...(merged[key]||[]),...value];else merged[key]=value;}}for(const key of ['sections','workedExamples','commonMisconceptions','concepts','applicationTasks','selfCheck','sources'])assert.ok(Array.isArray(merged[key])&&merged[key].length>0,`${meta.id}: ${key}`);}});
