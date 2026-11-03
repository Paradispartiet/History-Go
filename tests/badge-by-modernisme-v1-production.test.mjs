import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const read = path => JSON.parse(readFileSync(new URL("../" + path, import.meta.url), "utf8"));
const imagePath = "bilder/merker/by/undermerker/modernisme-brodert-v1.webp";
const sha = "39d0403eb18789c1526c1f1825fa0caccca199958784c479039fb3cf152aaa5e";
test("By Modernisme badge has exact 1024px gray embroidered image, correct routing and intact previous art", () => {
  const by = read("data/badges/by.json");
  const plan = read("data/badges/underbadge_batch01_production.json");
  const oslo = read("data/cities/oslo/badge.json");
  const asset = plan.families.by.assets.find(a=>a.id==="modernisme");
  const img = readFileSync(new URL("../" + imagePath, import.meta.url));
  assert.equal(by.color,"#808080");
  assert.equal(by.secondaryColor,"#404040");
  assert.equal(by.image,"bilder/merker/by-brodert-v6.webp");
  assert.equal(oslo.scope,"city_only");
  assert.equal(oslo.image,"bilder/merker/by/oslo-brodert-v1.webp");
  assert.deepEqual(by.subBadgeImages,{
    klassisk_arkitektur:"bilder/merker/by/undermerker/klassisk_arkitektur-brodert-v2.webp",
    modernisme:imagePath
  });
  assert.equal(by.sub.length,10);
  assert.equal(asset.status,"integrated");
  assert.equal(asset.selectedImage,imagePath);
  assert.deepEqual(asset.quality,{visualApproved:true,technicalApproved:true});
  assert.equal(asset.bytes,540416);
  assert.equal(img.length,540416);
  assert.equal(img.toString("ascii",0,4),"RIFF");
  assert.equal(img.toString("ascii",8,12),"WEBP");
  assert.equal(img.toString("ascii",12,16),"VP8X");
  assert.equal(img.readUIntLE(24,3)+1,1024);
  assert.equal(img.readUIntLE(27,3)+1,1024);
  assert.ok(img[20]&0x10,"image must retain alpha");
  assert.equal(createHash("sha256").update(img).digest("hex"),sha);
});
test("other By candidates are inactive and 12 Film & TV plus 7 Scenekunst remain active",()=>{
  const by=read("data/badges/by.json"),film=read("data/badges/film_tv.json"),scene=read("data/badges/scenekunst.json");
  assert.equal(Object.keys(by.subBadgeImages).length,2);
  assert.equal(Object.keys(film.subBadgeImages).length,12);
  assert.equal(Object.keys(scene.subBadgeImages).length,7);
  for(const id of by.sub.slice(2))assert.equal(by.subBadgeImages[id],undefined);
});
