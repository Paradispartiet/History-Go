import {test} from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {createHash} from "node:crypto";
import sharp from "sharp";
const checksum = d => createHash("sha256").update(d).digest("hex");
test("Aker Brygge: two authentic inline SVG candidates cannot activate unfinished Brands",async()=>{
 const report=JSON.parse(await readFile("reports/place-production/aker-brygge-inline-svg-candidates-2026-11-19.json","utf8"));
 const knownBrandIds=JSON.parse(await readFile("data/brands/brands_master.json","utf8")).map(b=>b.id);
 assert.equal(report.productionAssetsActivated,0);
 assert.equal(report.placecardBrandsEnabled,false);
 assert.equal(report.publishable,false);
 assert.equal(report.candidates.length,2);
 assert.deepEqual(report.candidates.map(c=>c.brandId).sort(),["haavind","lund_hagem"]);
 for(const c of report.candidates){
  assert.ok(knownBrandIds.includes(c.brandId));
  assert.equal(c.sourceType,"original_inline_svg");
  assert.equal(c.visualApproval,false);
  assert.equal(c.publishable,false);
  assert.match(c.sourcePage,/^https:\/\//);
  const svg=await readFile(c.sourcePath);
  assert.match(svg.toString("utf8"),/^<svg[\s>]/i);
  assert.ok(!/<script[\s>]|<foreignObject[\s>]|onload\s*=/i.test(svg.toString("utf8")));
  const jpg=await readFile(c.candidatePath);
  assert.equal(checksum(svg),c.sourceSha256);
  assert.equal(checksum(jpg),c.candidateSha256);
  const m=await sharp(jpg).metadata();
  assert.deepEqual([m.width,m.height,m.format],[900,520,"webp"]);
 }
});
