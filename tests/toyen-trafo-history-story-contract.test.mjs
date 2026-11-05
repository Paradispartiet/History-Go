import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = p => JSON.parse(fs.readFileSync(p, "utf8"));
const lexPath = "data/leksikon/places/oslo/naeringsliv/leksikon_toyen_trafo.json";
const storyPath = "data/stories/stories_toyen_trafo.json";
const lex = read(lexPath);
const stories = read(storyPath);
const lexManifest = read("data/leksikon/manifest.json");
const storyManifest = read("data/stories/stories_manifest.json");

test("Tøyen trafo main historical article is manifest-linked and factual", () => {
  assert.ok(lexManifest.files.includes(lexPath));
  assert.equal(lex.place_id,"toyen_trafo");
  assert.equal(lex.type,"main");
  assert.equal(lex.wikiText.length,4);
  assert.equal(lex.facts.length,7);
  assert.equal(lex.chronology.length,5);
  assert.deepEqual(lex.chronology.map(x=>x.year),[1915,1917,1972,1975,2010]);
  assert.ok(lex.facts.every(x=>x.sources.length && x.sources.every(s=>s.url.startsWith("https://"))));
  assert.ok(lex.chronology.every(x=>x.sources.length && x.sources.every(s=>s.url.startsWith("https://"))));
  assert.ok(lex.wikiText.join(" ").includes("ikke selv strøm"),"Transformatorstasjon må ikke forveksles med kraftproduksjon");
});

test("Tøyen trafo publishes one source-backed Story with its own historical episode", () => {
  assert.ok(storyManifest.files.some(x=>x.entity_id==="toyen_trafo" && x.path===storyPath && x.category==="naeringsliv"));
  assert.equal(stories.length,1);
  const s=stories[0];
  assert.equal(s.place_id,"toyen_trafo");
  assert.equal(s.year,1972);
  assert.equal(s.quality_profile,"episode_v1");
  assert.equal(s.type,"turning_point");
  assert.ok(s.story.length>1100);
  assert.ok(s.episode.actors.length>=3);
  assert.ok(s.sources.length>=3);
  assert.ok(s.sources.every(source=>source.url.startsWith("https://")));
  assert.equal(s.score.total, Object.entries(s.score).filter(([k])=>k!=="total").reduce((n,[,v])=>n+v,0));
});

test("Tøyen trafo Place-open exposes correct Leksikon and Story owner",()=>{
  const runtime=read("data/runtime/place-open/toyen_trafo.json");
  assert.equal(runtime.place.id,"toyen_trafo");
  assert.ok(runtime.leksikon.some(x=>x.id===lex.id));
  assert.ok(runtime.stories.some(x=>x.id===stories[0].id));
  assert.equal(runtime.language?.entries?.length,6,"Keep existing Språkleksikon");
});
