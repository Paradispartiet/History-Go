import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import test from "node:test";
import sharp from "sharp";

const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const workcard=read("reports/place-production/det-norske-teatret-workcard-current.json");
const place=read("data/places/scenekunst/oslo/places_scenekunst/det_norske_teatret.json");
const report=read("reports/place-production/det-norske-teatret/20261021/painting-photo-c46-visual-qa.json");
const provenance=read("reports/place-production/det-norske-teatret/20261021/painting-photo-c46-generated.json");
const sha256=bytes=>crypto.createHash("sha256").update(bytes).digest("hex");

test("C46 source photo bytes, credits and dimensions are correct",async()=>{
 const bytes=fs.readFileSync(report.asset_path);
 const info=await sharp(bytes).metadata();
 assert.equal(info.format,"webp");
 assert.equal(info.width,800);
 assert.equal(info.height,800);
 assert.equal(sha256(bytes),report.asset_sha256);
 assert.equal(report.asset_sha256,provenance.asset_sha256);
 assert.equal(provenance.source_sha256,report.source_sha256);
 assert.equal(provenance.asset_path,report.asset_path);
 assert.equal(report.credit,provenance.credit);
 assert.equal(report.license,"CC BY-SA 4.0");
 assert.equal(report.status,"PASSED_DRAFT_DOCUMENTARY_IMAGE_NOT_CANONICAL");
});
test("C46 is source-asset QA, not physical object or whole Place closeout",()=>{
 const c46=workcard.checkpoints.find(x=>x.id==="foyer_painting_image_research_c46");
 assert.equal(c46.asset,report.asset_path);
 assert.equal(c46.asset_sha256,report.asset_sha256);
 assert.equal(workcard.status,"in_progress");
 assert.equal(workcard.collections.objects.status,"PASS");
 assert.equal(report.canonical_members,0);
 assert.equal(report.canonical_objects_status,"BLOCKED");
 assert.equal(place.id,"det_norske_teatret");
 assert.equal(place.objects?.length??0,2);
 assert.equal(report.nonmember_status,"NO_CANONICAL_OBJECT_OR_COLLECTION_PREVIEW");
});
