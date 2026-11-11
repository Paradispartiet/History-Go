import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import sharp from 'sharp';
import crypto from 'node:crypto';

const place=JSON.parse(fs.readFileSync('data/places/naeringsliv/oslo/places_naeringsliv_oslo_kultureiendommer_batch_04/toyen_trafo.json','utf8'));
const workcard=JSON.parse(fs.readFileSync('reports/place-production/toyen-trafo-workcard-current.json','utf8'));
test('Production and services: real Oslo teatersenter rehearsal-space rental member',async()=>{
 assert.deepEqual(place.place_card_profile.collection_ids,['people','objects','brands','productions']);
 assert.equal(place.productions.length,1);
 const p=place.productions[0];
 assert.equal(p.id,'toyen_trafo_oslo_teatersenter_provelokaler');
 assert.equal(p.ownerBrandId,'oslo_teatersenter');
 assert.equal(p.kind,'service');
 assert.match(p.description,/Tårnrom/);
 assert.ok(p.source_urls.includes('https://osloteatersenter.no/booking/'));
 assert.equal(p.imageKind,'illustration');
 assert.match(p.imageAlt,/ikke et fotografi/);
 assert.match(p.imageMeta.disclosure,/ikke fotografi/);
 const bytes=fs.readFileSync(p.image);
 const m=await sharp(bytes).metadata();
 assert.equal(m.format,'webp');assert.equal(m.width,900);assert.equal(m.height,520);
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),p.imageMeta.sha256);
 const source=fs.readFileSync(p.imageMeta.schematicSourceFile,'utf8');
 for(const name of ['SCENESAL','SPEILROM','TVILLINGROM 1','TVILLINGROM 2','TÅRNROM']) assert.ok(source.includes(name));
 assert.match(workcard.collection_status.category_expression,/^PASS/);
 assert.match(workcard.editorial_status,/not_vferdig/);
});
