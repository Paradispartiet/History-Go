import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const ids=['mari_boine','joachim_nielsen','morten_harket'];
const source=read('data/people/musikk/oslo/people_musikk_oslo.json');
const peopleAll=read('data/runtime/people-all.json').files.flatMap(read);
test('Rockefeller People have concrete sources and stable identities',()=>{
 for(const id of ids){
  const row=source.find(p=>p.id===id);
  assert.ok(row,id);
  assert.ok(row.popupDesc.includes('Rockefeller'),id);
  assert.ok(Array.isArray(row.links)&&row.links.length>0,id);
  for(const link of row.links)assert.match(link.url,/^https:\/\//);
  assert.deepEqual(peopleAll.find(p=>p.id===id),row,'person shard mismatch: '+id);
 }
 assert.match(source.find(p=>p.id==='mari_boine').popupDesc,/2019.*2020/s);
 assert.match(source.find(p=>p.id==='joachim_nielsen').popupDesc,/1987.*1991/s);
 assert.match(source.find(p=>p.id==='morten_harket').popupDesc,/2008/);
});
test('All existing place People references use the same canonical profiles',()=>{
 for(const placeId of ['rockefeller','john_dee','sentrum_scene']){
  const place=read('data/runtime/place-open/'+placeId+'.json');
  for(const person of place.people.filter(p=>ids.includes(p.id))){
   assert.deepEqual(person,source.find(p=>p.id===person.id),placeId+': '+person.id);
  }
 }
 const rockefeller=read('data/runtime/place-open/rockefeller.json');
 assert.deepEqual(rockefeller.people.map(p=>p.id).sort(),ids.slice().sort());
});
