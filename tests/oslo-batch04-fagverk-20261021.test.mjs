import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
const read = path => JSON.parse(fs.readFileSync(path,"utf8"));
const created = ["grunnlovsbygget_bankplassen","akershus_kaier","oslo_mek","grensen_kjopesenter","vippetangen_fisketorg","frysja_industriomrade","norges_varemesse","bryn_industriomrade","gronlikaia","christiania_seildugsfabrik","sagene_skole","stortorget"];
const retained = ["norges_bank_bankplassen_4","gamle_trikkestallen","gamle_radhus","grev_wedels_plass","sofienbergparken"];
const all = [...created,...retained];
const registry=read("data/fagverk/fagverk_registry.json");
const backlog=read("data/places/production-tiers/v1-oslo-place-media-text-review-20261019-batch04.json");
test("Oslo-bolk 04: 17 separate curated Fagverk Place pages, canonical/runtime/source parity",()=>{
 assert.equal(new Set(all).size,17);
 assert.equal(backlog.places.length,20);
 for (const id of all){
  const link=registry.placeLinks[id]; assert.ok(link,id+" missing registry link");
  const p=read("data/"+link.sourceFile);
  const live=read("data/runtime/place-open/"+id+".json").place;
  const f=p.fagverk;
  assert.equal(p.id,id);
  assert.equal(link.status,"curated",id);
  assert.equal(f?.status,"curated",id);
  assert.equal(f?.schema,"history_go_place_fagverk_v2");
  assert.deepEqual(live.fagverk,f,id+" runtime Fagverk");
  assert.ok(p.image&&p.frontImage,id+" photos");
  assert.equal(live.image,p.image);
  assert.equal(live.frontImage,p.frontImage);
  assert.ok(f.article.join(" ").trim().split(" ").length>=70,id+" article depth");
  assert.ok(f.lenses.length>=3&&f.guiding_questions.length>=4,id+" pedagogical content");
  assert.ok(f.source_urls.length>=2,id+" sources");
  for(const u of f.source_urls)assert.ok(p.externalLinks?.some(x=>x.url===u&&x.label),id+" operative source "+u);
  assert.equal(backlog.places.find(x=>x.place_id===id)?.current_level,"v1_candidate",id+" premature promotion");
 }
});
test("Oslo-bolk 04: 12 new pages reuse approved source packets and keep v1 gates open",()=>{
 for (const id of created){
  const place=read("data/runtime/place-open/"+id+".json").place;
  const packet=read("data/places/production/"+id+".json");
  assert.equal(packet.status,"ready_v4_2");
  assert.ok(place.fagverk?.article?.length>=3,id);
  assert.equal(place.fagverk?.verified_at,"2026-10-21");
 }
});
