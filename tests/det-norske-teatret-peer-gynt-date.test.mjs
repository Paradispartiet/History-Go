import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (file) => JSON.parse(fs.readFileSync(file,"utf8"));
const personId = "hans_jacob_nilsen";
const original = read("data/people/musikk/oslo/det_norske_teatret/hans_jacob_nilsen.json");

function allRuntimePeople() {
  return fs.readdirSync("data/runtime/people-all").filter((file) => /^part-\d+\.json$/.test(file))
    .flatMap((file) => read("data/runtime/people-all/" + file));
}

test("1948 premiere uses theatre archive date without changing canonical identity or approved portrait", () => {
  assert.equal(original.length, 1);
  const p=original[0];
  assert.equal(p.id, personId);
  assert.equal(p.year, 1933);
  assert.equal(p.image, "bilder/kort/people/hans_jacob_nilsen.jpg");
  assert.equal(p.cardImage,p.image);
  assert.match(p.popupDesc,/2\. mars 1948/u);
  assert.doesNotMatch(p.popupDesc,/2\. mai 1948/u);
  for (const url of ["https://arkiv.detnorsketeatret.no/produksjon/peer-gynt-19480302","https://sceneweb.no/nb/production/38041/Peer_Gynt"]) {
    assert.ok(p.source_urls.includes(url));
    assert.ok(p.externalLinks.some((row)=>row.url===url));
  }
});

test("derived People shard and Det Norske Teatret place-open exactly match canonical 1948 correction", () => {
  const source=original[0];
  const people=allRuntimePeople().filter((row)=>row.id===personId);
  assert.equal(people.length,1);
  const placePeople=read("data/runtime/place-open/det_norske_teatret.json").people.filter((row)=>row.id===personId);
  assert.equal(placePeople.length,1);
  for(const item of [...people,...placePeople]){
    assert.equal(item.popupDesc,source.popupDesc);
    assert.deepEqual(item.source_urls,source.source_urls);
    assert.equal(item.image,source.image);
  }
});
