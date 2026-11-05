import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
const read = path => JSON.parse(fs.readFileSync(path,"utf8"));

const dataPath="data/lesespor/oslo/lesespor_oslo_naeringsliv.json";
const manifest=read("data/lesespor/manifest.json");
const sources=read(dataPath);
const rows=sources.items.filter(x=>x.place_ids?.includes("toyen_trafo"));

test("Tøyen trafo has four distinct, directly linked and verified place reading tracks",()=>{
  assert.ok(manifest.files.includes("oslo/lesespor_oslo_naeringsliv.json"));
  assert.equal(sources.category,"naeringsliv");
  assert.equal(sources.city,"oslo");
  assert.equal(rows.length,4);
  assert.equal(new Set(rows.map(x=>x.id)).size,4);
  assert.equal(new Set(rows.map(x=>x.url)).size,4);
  assert.deepEqual(rows.map(x=>x.publication),["TRAFO kunstnerhus","Oslo byleksikon","Oslo kommune","Store norske leksikon"]);
  for(const row of rows){
    assert.equal(row.curation_status,"approved");
    assert.equal(row.access,"open");
    assert.equal(row.rights,"link_only");
    assert.ok(row.url.startsWith("https://"));
    assert.ok(row.relevance.length>80);
    assert.ok(row.subjects.length>=3);
    assert.deepEqual(row.person_ids,[],"Do not invent noncanonical person references");
  }
});
test("Tøyen trafo generated Place-open exposes exact four Lesespor and preserves Story/Language",()=>{
  const runtime=read("data/runtime/place-open/toyen_trafo.json");
  assert.equal(runtime.place.id,"toyen_trafo");
  assert.equal(runtime.lesespor.length,4);
  assert.deepEqual(runtime.lesespor.map(x=>x.id), rows.map(x=>x.id));
  assert.equal(runtime.stories.length,1);
  assert.equal(runtime.leksikon.length,1);
  assert.equal(runtime.language.entries.length,6);
});
