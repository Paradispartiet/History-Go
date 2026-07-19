const assert = require('assert');
const fs = require('fs');
const path = require('path');
const repo = path.resolve(__dirname, '..');
const readJson = p => JSON.parse(fs.readFileSync(path.join(repo, p), 'utf8'));
const expectedRounds = ['tasks','nature','badges','training','civication','brands','før_nå','fortellinger','leksikon'];
const runtime = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'),'utf8');
const profileMatch = runtime.match(/natur:\s*\[([^\]]+)\]/);
assert(profileMatch, 'runtime mangler naturprofil');
assert.deepStrictEqual(JSON.parse(`[${profileMatch[1]}]`), expectedRounds);

const placePath='data/places/natur/oslo/places_oslo_natur_akerselvarute/myralokka.json';
const place=readJson(placePath);
const quiz=readJson('data/quiz/natur/myralokka_sets.json');
const storyPath='data/stories/stories_myralokka.json';
const story=readJson(storyPath)[0];
const storyManifest=readJson('data/stories/stories_manifest_natur_batch_01.json');
const articlePath='data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch3.json';
const article=readJson(articlePath).find(x=>x.place_id==='myralokka');
const validBadges=new Set(readJson('data/badges/natur.json').sub);
const index=readJson('data/places/natur/oslo/places_oslo_natur_akerselvarute_index.json').find(x=>x.id==='myralokka');
const manifest=readJson('data/places/natur/oslo/places_oslo_natur_akerselvarute_manifest.json').places.find(x=>x.id==='myralokka');

assert.strictEqual(place.id,'myralokka');
assert.strictEqual(place.name,'Myraløkka');
assert.strictEqual(place.category,'natur');
assert.deepStrictEqual([place.lat,place.lon,place.r,place.year],[59.935817,10.757414,180,1813]);
assert.strictEqual(place.coordStatus,'verified_point');
assert.strictEqual(place.coordType,'representative_center');
assert.strictEqual(place.sourceObjectId,'lokalhistoriewiki:Myraløkka');

function haversine(lat1,lon1,lat2,lon2){
  const R=6371000, toRad=x=>x*Math.PI/180;
  const dLat=toRad(lat2-lat1), dLon=toRad(lon2-lon1);
  const a=Math.sin(dLat/2)**2+Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(a));
}
const moved=haversine(59.9319,10.7504,place.lat,place.lon);
assert(moved>550 && moved<620,`uventet flytting ${moved}`);
for(const key of ['rounds','rundinger','routes','works','people','play_profile','flora','fauna']) assert(!Object.prototype.hasOwnProperty.call(place,key),`forbudt felt ${key}`);

assert(index&&manifest);
assert.deepStrictEqual([index.lat,index.lon,index.r,index.year],[place.lat,place.lon,place.r,place.year]);
assert.strictEqual(index.coordStatus,place.coordStatus);
assert.strictEqual(index.coordType,place.coordType);

const roundContent={
  tasks:place.tasks_profile,
  nature:place.nature_profile,
  badges:place.underbadge_ids,
  training:place.training_profile,
  civication:place.civication_store,
  brands:place.brands,
  før_nå:place.for_na,
  fortellinger:[story],
  leksikon:[article]
};
assert.deepStrictEqual(Object.keys(roundContent),expectedRounds);
for(const [id,v] of Object.entries(roundContent)){
  const filled=Array.isArray(v)?v.length>0:Boolean(v&&typeof v==='object');
  assert(filled,`mangler ${id}`);
}
assert(place.externalLinks.length>=9&&place.externalLinks.every(x=>/^https:\/\//.test(x.url)));
assert(place.underbadge_ids.length>=9&&place.underbadge_ids.every(x=>validBadges.has(x)));
assert(place.tasks_profile.tasks.length>=4);
assert(place.training_profile.exercises.length>=3&&/tørr offentlig sti|tørr.*gressflate/i.test(place.training_profile.safety));
assert(place.civication_store.length>=4&&place.civication_store.every(x=>x.physicalObject&&x.placeSpecific));
assert(place.brands.length>=10);
assert(typeof place.for_na.before==='string'&&typeof place.for_na.now==='string'&&place.for_na.look_for.length>=7);
assert(place.nature_profile.summary.length>=650&&place.nature_profile.themes.length>=8);
assert.deepStrictEqual(place.nature_profile.nearby_place_ids,['voien_gard_voienvolden','voienfossen','kuba_parken']);

const mapFiles=[
 'data/natur/nature_place_map.json',
 'data/natur/nature_bird_place_map.json',
 'data/natur/nature_oslo_expansion_place_map.json',
 'data/natur/nature_routes_place_map.json',
 'data/natur/nature_etne_place_map.json'
];
const merged={flora:[],fauna:[]};
for(const file of mapFiles){
 const raw=readJson(file); const entry=(raw.places||raw).myralokka;
 if(!entry) continue;
 merged.flora.push(...(entry.flora||[])); merged.fauna.push(...(entry.fauna||[]));
}
merged.flora=[...new Set(merged.flora)]; merged.fauna=[...new Set(merged.fauna)];
const expectedFlora=['emne_flora_gullstjerne'];
const expectedFauna=['emne_fauna_svarttrost','emne_fauna_kjottmeis','emne_fauna_blaameis','emne_fauna_fiskemaake','emne_fauna_graamaake','emne_fauna_graaspurv','emne_fauna_ringdue','emne_fauna_skjaere'];
assert.deepStrictEqual(merged.flora.sort(),expectedFlora.sort());
assert.deepStrictEqual(merged.fauna.sort(),expectedFauna.sort());
const inventory=place.nature_profile.species_inventory;
assert.strictEqual(inventory.total_species,9);
assert.deepStrictEqual(inventory.flora.map(x=>x.id).sort(),expectedFlora.sort());
assert.deepStrictEqual(inventory.fauna.map(x=>x.id).sort(),expectedFauna.sort());

const bridge=fs.readFileSync(path.join(repo,'js/nature_place_map_bridge.js'),'utf8');
for(const file of mapFiles) assert(bridge.includes(file),`bro mangler ${file}`);
assert(/renderNatureProfile\(place\)/.test(bridge));
assert(/profileHtml.*speciesHtml/s.test(bridge));

assert(storyManifest.files.some(x=>x.path===storyPath&&x.entity_id==='myralokka'));
assert(story&&story.place_id==='myralokka'&&story.person_id===null&&story.sources.length>=9);
assert(article&&article.version===2&&article.sources.length>=9&&article.facts.length>=10&&article.chronology.length>=8);
assert.strictEqual(quiz.sets.length,6);
assert(quiz.sets.every(x=>x.questions.length===7));
assert(quiz.sets.flatMap(x=>x.questions).every(q=>Array.isArray(q.source)&&q.source.length>0&&q.claim_basis));
const all=JSON.stringify({place,quiz,story,article});
for(const token of ['1813','1854','1900','1914','Bentse teglverk','Myrens Verksted','Myragården','Morgenstierne & Eide','fabrikkpipe','gullstjerne','svarttrost','kjøttmeis','blåmeis','fiskemåke','gråmåke','gråspurv','ringdue','skjære']) assert(all.includes(token),`mangler ${token}`);
assert(/leiruttak/i.test(all));
assert(/ikke en naturlig|ikke naturlig/i.test(all));
assert(/ikke grave|uten å grave/i.test(all));
console.log('Myraløkka nature rounds batch 1 OK');
