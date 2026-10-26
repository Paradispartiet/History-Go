import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { buildReleaseManifest, serializeReleaseManifest } from "../scripts/build-fagverk-release-manifest.mjs";

// One independent production batch: no new Objects, no duplicate per-Place workflow,
// and no v1/vFerdig claim before the complete image/quiz/app gates pass.
const ids=["havnelageret","tollbukaia","jernbaneverkstedet_lodalen"];
const read=filename=>JSON.parse(fs.readFileSync(filename,"utf8"));
const registry=read("data/fagverk/fagverk_registry.json");
const work=read("reports/place-production/det-norske-teatret-workcard-current.json");

test("three different Oslo Places have canonical, publicly routable Fagverk",()=>{
  for(const id of ids){
    const original=read("data/places/naeringsliv/oslo/places_naeringsliv/"+id+".json");
    const live=read("data/runtime/place-open/"+id+".json").place;
    const fag=original.fagverk;
    assert.equal(original.id,id);
    assert.equal(live.id,id);
    assert.deepEqual(live.fagverk,fag,"Place-open Fagverk must match canonical "+id);
    assert.equal(fag.schema,"history_go_place_fagverk_v2");
    assert.equal(fag.level,"standard");
    assert.equal(fag.status,"curated");
    assert.deepEqual(fag.subject_ids,["naeringsliv"]);
    assert.ok(fag.intro.length>150);
    assert.ok(fag.article.length>=3);
    assert.ok(fag.article.every(x=>x.length>=310),"Place article paragraphs need actual source-backed depth: "+id);
    assert.ok(fag.lenses.length>=3);
    assert.ok(fag.guiding_questions.length>=4);
    assert.ok(fag.observable_traces.length>=1);
    assert.ok(fag.source_urls.length>=2);
    assert.ok(fag.source_urls.every(url=>url.startsWith("https://")));
    assert.ok(fag.lenses.every(x=>x.subject_id==="naeringsliv"&&x.emne_id&&x.evidence.length>45));
    assert.ok(fag.observable_traces.every(x=>x.observation&&x.interpretation_boundary&&x.source_urls?.every(url=>url.startsWith("https://"))));
    assert.equal(registry.placeLinks[id]?.sourceFile,"places/naeringsliv/oslo/places_naeringsliv/"+id+".json");
    assert.equal(registry.placeLinks[id]?.level,"standard");
    assert.equal(registry.placeLinks[id]?.status,"curated");
    assert.ok(original.image&&original.frontImage,"Do not publish text-only pretending image readiness");
    assert.ok(original.imageMeta?.sourcePage&&original.frontImageMeta?.sourcePage,"Retain already verified photographic provenance");
    assert.equal(live.image,original.image);
    assert.equal(live.frontImage,original.frontImage);
    assert.deepEqual(live.imageMeta,original.imageMeta);
    assert.deepEqual(live.frontImageMeta,original.frontImageMeta);
    assert.ok(live.quiz_profile,"Never replace the Place quiz profile with Fagverk");
  }
});

test("Fagverk release and registry hashes are synchronized",()=>{
  const live=read("data/fagverk/fagverk_release.json");
  const rebuilt=buildReleaseManifest({root:process.cwd()});
  const changed=[];
  const diff=(expected,actual,at="release")=>{
    if(changed.length>=45)return;
    if(expected&&actual&&typeof expected==="object"&&typeof actual==="object"){
      for(const key of new Set([...Object.keys(expected),...Object.keys(actual)]))diff(expected[key],actual[key],at+"."+key);
    }else if(expected!==actual)changed.push({key:at,rebuilt:String(expected).slice(0,160),committed:String(actual).slice(0,160)});
  };
  diff(rebuilt,live);
  if(changed.length)console.error("FAGVERK_RELEASE_DIFFERENCES",JSON.stringify(changed));
  assert.deepEqual(live,rebuilt);
  assert.equal(live.registry.version,registry.version);
});

test("C51 theatre Objects stay at two, and the next stage is multi-Place throughput",()=>{
  const place=read("data/places/scenekunst/oslo/places_scenekunst/det_norske_teatret.json");
  assert.equal(place.objects.length,2);
  assert.deepEqual(place.place_card_profile.collection_ids,["objects"]);
  assert.equal(work.collections.objects.status,"PASS");
  assert.equal(work.collections.objects.published_member_count,2);
  assert.equal(work.production_throughput_handoff.objects_frozen,true);
  assert.equal(work.production_throughput_handoff.batch_size,20);
  assert.equal(work.status,"in_progress");
});
