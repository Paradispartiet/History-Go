const assert=require('assert'),crypto=require('crypto'),fs=require('fs'),path=require('path');
const repo=path.resolve(__dirname,'..'),read=f=>JSON.parse(fs.readFileSync(path.join(repo,f),'utf8'));
const dir='data/places/natur/oslo/places_oslo_natur_akerselvarute';
const np=`${dir}/nybrua_vaterlandsparken.json`,vp=`${dir}/vaterlandsparken.json`;
const n=read(np),v=read(vp);
assert.strictEqual(n.id,'nybrua_vaterlandsparken');assert.strictEqual(n.name,'Nybrua');
assert.strictEqual(v.id,'vaterlandsparken');assert.strictEqual(v.name,'Vaterlandsparken');
assert.deepStrictEqual([n.lat,n.lon,n.r],[59.9177872,10.7591639,120]);
assert.deepStrictEqual([v.lat,v.lon,v.r],[59.9130617,10.7570946,130]);
assert.strictEqual(n.sourceObjectId,'osm-way:315066295');assert.strictEqual(v.sourceObjectId,'osm-way:4334996');
assert.strictEqual(n.coordStatus,'verified_geometry');assert.strictEqual(v.coordStatus,'verified_geometry');
const rad=x=>x*Math.PI/180,dist=6371000*2*Math.asin(Math.sqrt(Math.sin(rad(v.lat-n.lat)/2)**2+Math.cos(rad(n.lat))*Math.cos(rad(v.lat))*Math.sin(rad(v.lon-n.lon)/2)**2));
assert(dist>500&&dist<580,`Unexpected split distance ${dist}`);
const runtime=fs.readFileSync(path.join(repo,'js/ui/place-card.js'),'utf8'),m=runtime.match(/by:\s*\[([^\]]+)\]/);assert(m);
const expected=['people','nature','badges','works','civication','brands','før_nå','fortellinger','leksikon'];
assert.deepStrictEqual(JSON.parse('['+m[1]+']'),expected);
const badges=new Set(read('data/badges/by.json').sub);
for(const p of [n,v]){
  assert.strictEqual(p.category,'by');assert(!('rounds' in p)&&!('rundinger' in p));
  assert(p.works.length>=4);assert(p.civication_store.length>=4&&p.civication_store.every(x=>x.physicalObject&&x.placeSpecific));
  assert(p.brands.length>=4);assert(p.for_na.look_for.length>=8);assert(p.nature_profile.summary.length>=600);
  assert(p.underbadge_ids.length>=3&&p.underbadge_ids.every(id=>badges.has(id)));
}
const peoplePath='data/people/by/oslo/akerselva/people_nybrua_vaterlandsparken.json',people=read(peoplePath);
for(const id of ['gunder_juel','olafia_johannsdottir','kristinn_pjetursson','ola_enstad'])assert(people.some(x=>x.id===id),`Missing ${id}`);
assert(read('data/people/manifest.json').files.includes('people/by/oslo/akerselva/people_nybrua_vaterlandsparken.json'));
for(const [id,qpath] of [['nybrua_vaterlandsparken','data/quiz/by/nybrua_vaterlandsparken_sets.json'],['vaterlandsparken','data/quiz/by/vaterlandsparken_sets.json']]){
 const q=read(qpath);assert.strictEqual(q.place_id,id);assert.strictEqual(q.sets.length,6);
 assert(q.sets.every(s=>s.questions.length===7&&s.questions.every(x=>Array.isArray(x.source)&&x.source.length&&x.claim_basis)));
}
const storyPath='data/stories/stories_nybrua_vaterlandsparken_split.json',stories=read(storyPath);
assert(stories.some(x=>x.place_id==='nybrua_vaterlandsparken'));assert(stories.some(x=>x.place_id==='vaterlandsparken'));
assert(read('data/stories/stories_manifest.json').files.some(x=>x.path===storyPath));
const lex=read('data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch4.json');
for(const id of ['nybrua_vaterlandsparken','vaterlandsparken']){const a=lex.find(x=>x.place_id===id);assert(a&&a.version===2&&a.facts.length>=10&&a.sources.length>=2);}
const index=read(`${dir}_index.json`),ni=index.find(x=>x.id===n.id),vi=index.find(x=>x.id===v.id);
assert(ni&&vi);assert.deepStrictEqual([ni.lat,ni.lon,ni.year],[n.lat,n.lon,n.year]);assert.deepStrictEqual([vi.lat,vi.lon,vi.year],[v.lat,v.lon,v.year]);
const man=read(`${dir}_manifest.json`);
for(const [p,file] of [[n,'nybrua_vaterlandsparken.json'],[v,'vaterlandsparken.json']]){
 const row=man.places.find(x=>x.id===p.id);assert(row);assert.strictEqual(row.sha256,crypto.createHash('sha256').update(fs.readFileSync(path.join(repo,dir,file))).digest('hex'));
}
const reg=read('data/natur/places_akerselva_profiles_register_ids.json');assert(reg.some(x=>x.id===n.id&&x.name==='Nybrua'));assert(reg.some(x=>x.id===v.id));
const ceN=read('data/coordinate-evidence/oslo/natur/nybrua_vaterlandsparken.json'),ceV=read('data/coordinate-evidence/oslo/natur/vaterlandsparken.json');
assert.strictEqual(ceN.identity.requiresSplit,false);assert.strictEqual(ceV.identity.requiresSplit,false);
assert.strictEqual(ceN.currentCoordinate.coordStatus,'verified_geometry');assert.strictEqual(ceV.currentCoordinate.coordStatus,'verified_geometry');
const cem=read('data/coordinate-evidence/manifest.json').files;assert(cem.includes('oslo/natur/nybrua_vaterlandsparken.json'));assert(cem.includes('oslo/natur/vaterlandsparken.json'));
console.log('Nybrua/Vaterlandsparken split rounds batch 1 OK');
