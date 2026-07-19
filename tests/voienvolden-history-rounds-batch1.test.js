const assert = require('assert');
const fs = require('fs');
const path = require('path');
const repo = path.resolve(__dirname, '..');
const readJson = p => JSON.parse(fs.readFileSync(path.join(repo, p), 'utf8'));
const expectedRounds = ['people','works','badges','før_nå','civication','brands','nature','fortellinger','leksikon'];
const runtime = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'),'utf8');
const match = runtime.match(/historie:\s*\[([^\]]+)\]/);
assert(match);
assert.deepStrictEqual(JSON.parse(`[${match[1]}]`), expectedRounds);

const placePath='data/places/natur/oslo/places_oslo_natur_akerselvarute/voien_gard_voienvolden.json';
const place=readJson(placePath);
const peopleNatur=readJson('data/people/natur/oslo/people_natur_oslo.json');
const peopleBy=readJson('data/people/by/oslo/people_by_oslo.json');
const ids=['johan_petersen_bergmand_voienvolden','gabriel_johnsen_udnaes_voienvolden','sverre_udnaes_voienvolden','ingrid_udnaes_voienvolden'];
const persons=ids.map(id=>peopleNatur.find(x=>x.id===id));
const poulsson=peopleBy.find(x=>x.id==='magnus_poulsson');
const storyPath='data/stories/stories_voien_gard_voienvolden.json';
const story=readJson(storyPath)[0];
const storyManifest=readJson('data/stories/stories_manifest_natur_batch_01.json');
const article=readJson('data/leksikon/places/oslo/historie/leksikon_oslo_historie_batch2.json').find(x=>x.place_id===place.id);
const validBadges=new Set(readJson('data/badges/historie.json').sub);
const index=readJson('data/places/natur/oslo/places_oslo_natur_akerselvarute_index.json').find(x=>x.id===place.id);
const manifest=readJson('data/places/natur/oslo/places_oslo_natur_akerselvarute_manifest.json').places.find(x=>x.id===place.id);
const birdMap=readJson('data/natur/nature_bird_place_map.json').places[place.id].fauna;
const expansion=readJson('data/natur/nature_oslo_expansion_place_map.json').places[place.id];

assert.strictEqual(place.name,'Vøienvolden gård');
assert.deepStrictEqual([place.lat,place.lon,place.r,place.year],[59.9343665,10.7546405,140,1683]);
assert.strictEqual(place.coordStatus,'verified_geometry');
assert.strictEqual(place.coordType,'official_property_point');
assert.strictEqual(place.sourceObjectId,'kulturminnesok:86173');
assert.strictEqual(place.address.street,'Maridalsveien');
assert.strictEqual(place.address.number,'120');
for(const key of ['rounds','rundinger','routes','tasks','training','play','flora','fauna']) assert(!Object.prototype.hasOwnProperty.call(place,key),`forbudt felt ${key}`);

assert(persons.every(p=>p&&p.placeId===place.id&&p.places.includes(place.id)&&p.source_urls.length>=3));
assert(poulsson&&poulsson.places.includes(place.id)&&poulsson.source_urls.length>=4);
assert(storyManifest.files.some(x=>x.path===storyPath&&x.entity_id===place.id));
assert(story&&story.place_id===place.id&&story.person_id===ids[0]&&story.sources.length>=10);
assert(article&&article.sources.length>=10&&article.facts.length>=10&&article.chronology.length>=12);
assert(index&&manifest);
assert.deepStrictEqual([index.lat,index.lon,index.r,index.year],[place.lat,place.lon,place.r,place.year]);

const roundContent={people:[...persons,poulsson],works:place.works,badges:place.underbadge_ids,før_nå:place.for_na,civication:place.civication_store,brands:place.brands,nature:place.nature_profile,fortellinger:[story],leksikon:[article]};
assert.deepStrictEqual(Object.keys(roundContent),expectedRounds);
for(const [id,v] of Object.entries(roundContent)){const filled=Array.isArray(v)?v.length>0:Boolean(v&&typeof v==='object');assert(filled,`mangler ${id}`);}
assert(place.externalLinks.length>=10&&place.externalLinks.every(x=>/^https:\/\//.test(x.url)));
assert(place.underbadge_ids.length>=7&&place.underbadge_ids.every(x=>validBadges.has(x)));
assert(place.works.length>=15);
assert(place.civication_store.length>=4&&place.civication_store.every(x=>x.physicalObject&&x.placeSpecific));
assert(place.brands.length>=12);
assert(place.for_na.before&&place.for_na.now&&place.for_na.look_for.length>=8);
assert(place.nature_profile.summary.length>=900&&place.nature_profile.themes.length>=8);

const expectedSpecies=['emne_fauna_svarttrost','emne_fauna_graaspurv','emne_fauna_kjottmeis','emne_fauna_blaameis','emne_fauna_ringdue','emne_fauna_graamaake','emne_fauna_skjaere','emne_fauna_kraake'];
assert.deepStrictEqual(birdMap,expectedSpecies);
assert.deepStrictEqual(expansion.flora,[]);
assert.deepStrictEqual(expansion.fauna,expectedSpecies);
assert.deepStrictEqual(place.nature_profile.mapped_species_ids,expectedSpecies);
assert.deepStrictEqual(place.nature_profile.documented_species.map(x=>x.id),expectedSpecies);

const quiz=readJson('data/quiz/historie/voien_gard_voienvolden_sets.json');
assert.strictEqual(quiz.sets.length,6);
assert(quiz.sets.every(x=>x.questions.length===7));
assert(quiz.sets.flatMap(x=>x.questions).every(q=>q.claim_basis==='source_verified'&&q.source.length>=4));

const all=JSON.stringify({place,persons,poulsson,story,article,quiz});
for(const token of ['1629','1683','1829','1837','1915','1917','1941','1954','1960','117 mål','firkanttun','haugianer','Fortidsminneforeningen','Maridalsveien 120']) assert(all.includes(token),`mangler ${token}`);
for(const name of ['svarttrost','gråspurv','kjøttmeis','blåmeis','ringdue','gråmåke','skjære','kråke']) assert(all.includes(name),`mangler art ${name}`);
assert(/Vøyen gård|Vøyenfallene/.test(all));
assert(/åpningstider|adgang/.test(all));
console.log('Vøienvolden history rounds batch 1 OK');
