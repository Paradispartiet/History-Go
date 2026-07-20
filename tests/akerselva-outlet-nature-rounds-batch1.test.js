const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const repo = path.resolve(__dirname, '..');
const readJson = p => JSON.parse(fs.readFileSync(path.join(repo, p), 'utf8'));
const expectedRounds = ['tasks','nature','badges','training','civication','brands','før_nå','fortellinger','leksikon'];
const runtime = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'),'utf8');
const profileMatch = runtime.match(/natur:\s*\[([^\]]+)\]/);
assert(profileMatch, 'runtime mangler naturprofil');
assert.deepStrictEqual(JSON.parse(`[${profileMatch[1]}]`), expectedRounds);

const placePath='data/places/natur/oslo/places_oslo_natur_akerselvarute/akerselva_utlop_bjorvika.json';
const articlePath='data/leksikon/places/oslo/natur/leksikon_akerselva_utlop_bjorvika.json';
const storyPath='data/stories/stories_akerselva_utlop_bjorvika.json';
const place=readJson(placePath);
const article=readJson(articlePath);
const story=readJson(storyPath)[0];
const quiz=readJson('data/quiz/natur/akerselva_utlop_bjorvika_sets.json');
const validBadges=new Set(readJson('data/badges/natur.json').sub);
const index=readJson('data/places/natur/oslo/places_oslo_natur_akerselvarute_index.json').find(x=>x.id===place.id);
const routeManifest=readJson('data/places/natur/oslo/places_oslo_natur_akerselvarute_manifest.json');
const manifestRow=routeManifest.places.find(x=>x.id===place.id);
const leksikonManifest=readJson('data/leksikon/manifest.json');
const storiesManifest=readJson('data/stories/stories_manifest.json');

assert.strictEqual(place.id,'akerselva_utlop_bjorvika');
assert.strictEqual(place.name,'Akerselvas utløp mot fjorden (Bjørvika)');
assert.strictEqual(place.category,'natur');
assert.deepStrictEqual([place.lat,place.lon,place.r,place.year],[59.9075303,10.7554479,220,2000]);
assert.strictEqual(place.coordStatus,'verified_geometry');
assert.strictEqual(place.coordType,'river_mouth_anchor');
assert.strictEqual(place.sourceObjectId,'osm-way:246047712');
for(const key of ['rounds','rundinger','routes','works','people','play_profile','flora','fauna']) assert(!Object.prototype.hasOwnProperty.call(place,key),`forbudt felt ${key}`);

assert(index&&manifestRow);
assert.deepStrictEqual([index.lat,index.lon,index.r,index.year],[place.lat,place.lon,place.r,place.year]);
const hash=crypto.createHash('sha256').update(fs.readFileSync(path.join(repo,placePath))).digest('hex');
assert.strictEqual(manifestRow.sha256,hash,'manifest-hash må følge stedfilen');
assert(leksikonManifest.files.includes(articlePath),'leksikonmanifestet mangler utløpsartikkelen');
assert(storiesManifest.files.some(x=>x.path===storyPath&&x.entity_id===place.id),'story-manifestet mangler utløpsfortellingen');

const roundContent={tasks:place.tasks_profile,nature:place.nature_profile,badges:place.underbadge_ids,training:place.training_profile,civication:place.civication_store,brands:place.brands,før_nå:place.for_na,fortellinger:[story],leksikon:[article]};
assert.deepStrictEqual(Object.keys(roundContent),expectedRounds);
for(const [id,v] of Object.entries(roundContent)){const filled=Array.isArray(v)?v.length>0:Boolean(v&&typeof v==='object');assert(filled,`mangler ${id}`);}
assert(place.externalLinks.length>=9&&place.externalLinks.every(x=>/^https:\/\//.test(x.url)));
assert(place.underbadge_ids.length>=12&&place.underbadge_ids.every(x=>validBadges.has(x)));
assert(place.tasks_profile.tasks.length>=4);
assert(place.training_profile.exercises.length>=3&&/offentlig promenade/i.test(place.training_profile.safety));
assert(place.civication_store.length>=4&&place.civication_store.every(x=>x.physicalObject&&x.placeSpecific));
assert(place.brands.length>=10);
assert(typeof place.for_na.before==='string'&&typeof place.for_na.now==='string'&&place.for_na.look_for.length>=8);
assert(place.nature_profile.summary.length>=900&&place.nature_profile.themes.length>=10);
assert.deepStrictEqual(place.nature_profile.nearby_place_ids,['vaterland_historisk_elvelop','bjorvika','alna_utlop_bjorvika']);

const mapFiles=['data/natur/nature_place_map.json','data/natur/nature_bird_place_map.json','data/natur/nature_oslo_expansion_place_map.json','data/natur/nature_routes_place_map.json','data/natur/nature_etne_place_map.json'];
const merged={flora:[],fauna:[]};
for(const file of mapFiles){const raw=readJson(file);const entry=(raw.places||raw).akerselva_utlop_bjorvika;if(!entry)continue;merged.flora.push(...(entry.flora||[]));merged.fauna.push(...(entry.fauna||[]));}
merged.flora=[...new Set(merged.flora)];merged.fauna=[...new Set(merged.fauna)];
const expectedFlora=['emne_flora_tiriltunge','emne_ved_hestekastanje'];
const expectedFauna=['emne_fauna_blaameis','emne_fauna_fiskemaake','emne_fauna_graamaake','emne_fauna_graaspurv','emne_fauna_graagas','emne_fauna_kjottmeis','emne_fauna_kraake','emne_fauna_ringdue','emne_fauna_sildemaake','emne_fauna_skjaere','emne_fauna_svarttrost'];
assert.deepStrictEqual(merged.flora.sort(),expectedFlora.sort());
assert.deepStrictEqual(merged.fauna.sort(),expectedFauna.sort());
const inventory=place.nature_profile.species_inventory;
assert.strictEqual(inventory.total_species,13);
assert.deepStrictEqual(inventory.flora.map(x=>x.id).sort(),expectedFlora.sort());
assert.deepStrictEqual(inventory.fauna.map(x=>x.id).sort(),expectedFauna.sort());

assert(story&&story.place_id===place.id&&story.sources.length>=9);
assert(article&&article.place_id===place.id&&article.title===place.name&&article.version===2&&article.sources.length>=9&&article.facts.length>=10&&article.chronology.length>=8);
assert.strictEqual(quiz.sets.length,6);
assert(quiz.sets.every(x=>x.questions.length===7));
assert(quiz.sets.flatMap(x=>x.questions).every(q=>Array.isArray(q.source)&&q.source.length>0&&q.claim_basis&&q.options[q.answerIndex]===q.answer));
const all=JSON.stringify({place,quiz,story,article});
for(const token of ['tiriltunge','hestekastanje','blåmeis','fiskemåke','gråmåke','gråspurv','grågås','kjøttmeis','kråke','ringdue','sildemåke','skjære','svarttrost','1964','1969','1990','2000','2008','2014','Midgardsormen','Havnepromenaden']) assert(all.includes(token),`mangler ${token}`);
assert(/ikke.*garanti|ingen garanti/i.test(all));
console.log('Akerselva outlet nature rounds batch 1 OK');
