import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const root = new URL("../",import.meta.url);
const read=path=>JSON.parse(readFileSync(new URL(path,root),"utf8"));
const source=read("data/badges/by.json");
const manifest=read("data/badges/badge_locale_images_candidates.json");
const expected={
  en:"e1a17e4fac7d0d9e04967e45de4110f308bf93529251b2843e2493185c7251d1",
  es:"142e0070ff8f89886df0cc969240e7642081a385b881df36e524d7ffa24856fd",
  pt:"ed3ec9075d27db8b256f7b6eb494a3b5426b867d9e7c8487d0a410f352885292",
  fr:"f437b2ee30967338270916ff556e874cd8b56950cc591ea4039016a055b4113a"
};
test("Funksjonalisme has four localized review-only WebPs with original silhouette",()=>{
  assert.equal(manifest.status,"review_required_not_active");
  assert.equal(manifest.entries.length,48);
  assert.equal(Object.keys(source.subBadgeImages).length,5);
  assert.deepEqual(manifest.locales,["en","es","pt","fr"]);
  const matches=manifest.entries.filter(e=>e.category==="by"&&e.id==="funksjonalisme");
  assert.equal(matches.length,4);
  for(const [locale,sha] of Object.entries(expected)){
    const item=matches.find(x=>x.locale===locale);
    assert.ok(item);
    const relPath="bilder/merker/by/locales/"+locale+"/funksjonalisme.webp";
    assert.equal(item.path,relPath);
    assert.equal(item.sha256,sha);
    const bin=readFileSync(new URL(relPath,root));
    assert.equal(item.bytes,bin.length);
    assert.equal(bin.toString("ascii",0,4),"RIFF");
    assert.equal(bin.toString("ascii",8,12),"WEBP");
    const encoding=bin.toString("ascii",12,16);
    assert.ok(["VP8X","VP8L"].includes(encoding),"valid extended or lossless WebP");
    if(encoding==="VP8X"){
      assert.equal(bin.readUIntLE(24,3)+1,1024);
      assert.equal(bin.readUIntLE(27,3)+1,1024);
      assert.ok(bin[20]&0x10);
    }else{
      const bits=bin.readUInt32LE(21);
      assert.equal((bits&0x3fff)+1,1024);
      assert.equal(((bits>>>14)&0x3fff)+1,1024);
      assert.ok((bits>>>28)&1,"lossless alpha present");
    }
    assert.equal(createHash("sha256").update(bin).digest("hex"),sha);
  }
});
