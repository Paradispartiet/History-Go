import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const page=fs.readFileSync('fagverk-sted.html','utf8');
const runtime=fs.readFileSync('js/fagverk-sted.js','utf8');
const canonical=fs.readFileSync('js/fagverk-place-canonical-integration.js','utf8');
const registry=JSON.parse(fs.readFileSync('data/fagverk/fagverk_registry.json','utf8'));

test('alle canonicale steder har én generisk fagverksrute',()=>{assert.equal(registry.placePage.genericForAllCanonicalPlaces,true);assert.equal(registry.placePage.route,'fagverk-sted.html?place={placeId}');assert.match(runtime,/DataHub\.loadFullPlace/);});
test('stedssiden viser artikkel, linser, spørsmål, fag, begreper og kilder',()=>{for(const id of ['fagverkPlaceArticle','fagverkPlaceLenses','fagverkPlaceQuestions','fagverkPlaceChapters','fagverkPlaceConcepts','fagverkPlaceEmner','fagverkPlaceSources'])assert.match(page,new RegExp(`id="${id}"`));});
test('stedssiden viser forbindelsen fra undermerke til canonicalt fag',()=>{assert.match(page,/fagverkPlaceBadgePath/);assert.match(page,/politikk-fag-model\.js/);assert.match(page,/fagverk-place-canonical-integration\.js/);assert.match(canonical,/HGPolitikkFagModel\.resolvePlace/);assert.match(canonical,/model\.underbadges/);assert.match(canonical,/model\.domains/);assert.match(canonical,/coverageById/);});
test('Regjeringskvartalet er kuratert som egen stedsside, ikke fagkapittel',()=>{const link=registry.placeLinks.regjeringskvartalet;assert.ok(link.lenses.length>=4);assert.ok(link.guidingQuestions.length>=4);assert.ok(link.emneIds.length>=6);assert.equal(Object.hasOwn(link,'chapters'),false);});
