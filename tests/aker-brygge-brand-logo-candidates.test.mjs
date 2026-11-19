import {test} from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {createHash} from "node:crypto";
import sharp from "sharp";

const reportPath = "reports/place-production/aker-brygge-brand-logo-binary-candidates.json";
const sha256 = data => createHash("sha256").update(data).digest("hex");

test("Aker Brygge — exact authentic-logo binary candidates only", async () => {
  const report = JSON.parse(await readFile(reportPath, "utf8"));
  const mapping = JSON.parse(await readFile("data/brands/brands_by_place.json", "utf8")).aker_brygge;
  assert.equal(mapping.length, 9);
  assert.equal(report.placeId, "aker_brygge");
  assert.equal(report.allBrandsRequired, 9);
  assert.equal(report.productionAssetsActivated, 0);
  assert.equal(report.placecardBrandsEnabled, false);
  assert.equal(report.candidates.length, 5);
  assert.deepEqual(report.candidates.map(c => c.brandId).sort(), ["cos", "olivia", "rorbua", "wiersholm", "wikborg_rein"]);
  for (const c of report.candidates) {
    assert.ok(mapping.includes(c.brandId));
    assert.equal(c.reviewStatus, "ORIGINAL_BINARY_CAPTURED_PENDING_REVIEW");
    assert.equal(c.visualApproval, false);
    assert.equal(c.publishable, false);
    assert.ok([ "commons.wikimedia.org", "www.rorbua.as", "oliviarestauranter.no", "wiersholm.no" ].includes(new URL(c.sourcePage).hostname), "Unapproved source host: " + c.sourcePage);
    assert.equal(c.usageContext, "referential_identification");
    assert.equal(c.noEndorsement, true);
    assert.ok(c.originalPath.startsWith("bilder/kort/brands/source/aker_brygge/"));
    assert.ok(c.candidatePath.startsWith("bilder/kort/brands/candidates/aker_brygge/"));
    assert.ok(!c.candidatePath.startsWith("bilder/kort/brands/" + c.brandId + ".webp"));
    const original = await readFile(c.originalPath);
    const output = await readFile(c.candidatePath);
    assert.equal(sha256(original), c.originalSha256);
    assert.equal(sha256(output), c.candidateSha256);
    assert.equal(output.length, c.outputBytes);
    const inputMeta = await sharp(original).metadata();
    const outputMeta = await sharp(output).metadata();
    assert.deepEqual([inputMeta.width, inputMeta.height], c.sourceDimensions);
    assert.deepEqual([outputMeta.width, outputMeta.height, outputMeta.format], [900, 520, "webp"]);
    assert.ok(original.length > 300 && output.length > 300);
    assert.equal(c.matteColor, c.brandId === "olivia" ? "#242422" : "#ffffff");
    const corner = await sharp(output).extract({left: 0, top: 0, width: 1, height: 1}).removeAlpha().raw().toBuffer();
    const expected = c.brandId === "olivia" ? [36, 36, 34] : [255, 255, 255];
    assert.ok(corner.subarray(0,3).every((v,i)=>Math.abs(v-expected[i])<=3),
      "Unexpected logo matte for " + c.brandId + ": " + [...corner.subarray(0,3)]);
    assert.equal(c.assetKind, "logo");
    assert.equal(c.transformation.includes("no crop or redraw"), true);
  }
});
