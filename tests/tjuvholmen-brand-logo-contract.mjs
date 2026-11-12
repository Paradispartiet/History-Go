#!/usr/bin/env node
import fs from "node:fs";
import crypto from "node:crypto";
import assert from "node:assert/strict";
const brands=JSON.parse(fs.readFileSync("data/brands/brands_master.json","utf8"));
const payload=JSON.parse(fs.readFileSync("data/runtime/place-open/tjuvholmen.json","utf8"));
const ids=["bahr","galleri_brandstrup","the_thief"];
const sha=file=>crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
assert.equal(payload.place.id,"tjuvholmen");
assert.deepEqual(payload.brands.map(b=>b.id).sort(),[...ids].sort(),"The canonical three Brands must remain in Tjuvholmen");
for(const id of ids){
 const master=brands.find(b=>b.id===id),runtime=payload.brands.find(b=>b.id===id);
 const source=JSON.parse(fs.readFileSync("data/brands/"+id+"_logo_provenance.json","utf8"));
 assert(master&&runtime,`missing ${id} canonical/runtime`);
 assert.equal(master.verification,"verified",`${id} not verified`);
 assert.equal(master.imageMeta?.reviewStatus,"manually_approved",`${id} not visually approved`);
 assert.equal(source.reviewStatus,"manually_approved",`${id} provenance not approved`);
 assert.equal(source.brandId,id);
 assert.equal(master.logo,source.path);
 assert.equal(runtime.logo,master.logo,`${id} runtime not bound to official logo`);
 assert.equal(runtime.imageMeta?.assetSha256,source.assetSha256);
 assert.equal(sha(source.path),source.assetSha256,`${id} WebP changed`);
 const original=source.sourceLocalPath||source.sourceLocalAsset;
 assert(original&&fs.existsSync(original),`${id} official source binary missing`);
 assert.equal(sha(original),source.sourceSha256,`${id} original source changed`);
 assert.equal(source.assetKind,"logo");
 assert.equal(source.noEndorsement,true);
 assert.ok(source.rightsBasis?.includes("referential"),`${id} rights basis`);
 assert.ok(source.sourcePage.startsWith("https://"),`${id} official source page`);
 assert.ok(master.place_ids.includes("tjuvholmen"));
 console.log("BRAND_LOGO_PASS",id,source.path,source.assetSha256);
}
const gallery=brands.find(b=>b.id==="galleri_brandstrup");
assert.match(gallery.popupdesc,/Briskebyveien 72/, "Brandstrup must not be described as currently on Tjuvholmen");
console.log("TJUVHOLMEN_BRANDS_COMPLETE",ids.length,"/",ids.length);
