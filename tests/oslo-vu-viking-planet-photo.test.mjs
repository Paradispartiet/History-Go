import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const place=JSON.parse(fs.readFileSync('data/places/historie/oslo/places_historie/viking_planet_oslo.json','utf8'));
test('Viking Planet real entrance photo, local resource and provenance',()=>{
 const path='bilder/places/viking_planet_oslo_entrance_2020.jpg';
 assert.equal(place.id,'viking_planet_oslo');assert.equal(place.image,path);assert.equal(place.frontImage,path);assert.equal(place.cardImage,path);
 assert.ok(fs.existsSync(path));assert.ok(fs.statSync(path).size>30000);
 const header=fs.readFileSync(path).subarray(0,3);
 assert.deepEqual(Array.from(header),[255,216,255]);
 assert.equal(place.imageLicense,'CC BY-SA 4.0');assert.equal(place.imageMeta.creator,'Wolfmann');
 assert.match(place.imageMeta.sourcePage,/Viking_Planet/);assert.match(place.imageMeta.transformation,/Beskåret/);
 assert.equal(place.imageMeta.licenseUrl,'https://creativecommons.org/licenses/by-sa/4.0/');
 assert.equal(place.fagverk.article.length,3);
});
