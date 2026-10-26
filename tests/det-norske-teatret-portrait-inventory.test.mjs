import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const load=(path)=>JSON.parse(fs.readFileSync(path,"utf8"));
const card=load("reports/place-production/det-norske-teatret-workcard-current.json");
const people=load("data/runtime/place-open/det_norske_teatret.json").people;

test("DNT portrait inventory follows canonical local media and retains blocked completion",()=>{
  assert.equal(card.place_id,"det_norske_teatret");
  assert.equal(card.status,"in_progress");
  assert.equal(card.collections.people.status,"BLOCKED");
  assert.equal(people.length,87);
  assert.equal(new Set(people.map(p=>p.id)).size,87);
  const published=[],missing=[];
  for(const p of people){
    if(p.image||p.cardImage){
      assert.ok(p.image&&p.cardImage,`partial media binding: ${p.id}`);
      assert.ok(p.imageMeta?.reviewStatus==="manually_approved",`unreviewed portrait: ${p.id}`);
      assert.ok(p.imageMeta?.sourcePage&&p.imageMeta?.credit&&p.imageMeta?.license,`incomplete provenance: ${p.id}`);
      assert.ok(fs.existsSync(p.image),`missing local image: ${p.id}`);
      assert.ok(fs.existsSync(p.cardImage),`missing local card image: ${p.id}`);
      published.push(p.id);
    }else missing.push(p.id);
  }
  const publishedIds=published.sort(),missingIds=missing.sort();
  const current=card.collections.people;
  assert.equal(publishedIds.length,current.portraits_published_count);
  assert.equal(missingIds.length,current.portraits_remaining_count);
  assert.deepEqual(publishedIds,current.portraits_published_ids);
  assert.deepEqual(missingIds,current.portraits_missing_ids);
  assert.equal(publishedIds.length+missingIds.length,87);
  assert.ok(card.checkpoints.some(p=>p.id==="people_portrait_inventory_c29"));
});
