const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");

test("Knowledge V2 uses canonical badge presentation instead of a parallel image registry", () => {
  const html = read("knowledge.html");
  const runtime = read("js/knowledgeBadgePresentation.js");

  assert.match(html, /css\/knowledge-badges\.css/);
  assert.match(html, /js\/knowledgeBadgePresentation\.js/);
  assert.match(runtime, /DataHub\?\.loadBadges|DataHub\.loadBadges/);
  assert.match(runtime, /badge\?\.image|badge\.image/);
  assert.doesNotMatch(runtime, /SUBJECT_ICONS/);
});

test("every canonical badge with an image points to an existing repository asset", () => {
  const index = JSON.parse(read("data/badges/index.json"));
  assert.ok(Array.isArray(index.files) && index.files.length > 0);

  for (const file of index.files) {
    const badge = JSON.parse(read(file));
    if (!badge.image) continue;
    const assetPath = path.join(ROOT, badge.image);
    assert.equal(fs.existsSync(assetPath), true, `${badge.id}: missing ${badge.image}`);
  }
});

test("the pre-V2 detailed Knowledge profile is available as a separate page", () => {
  const overview = read("knowledge.html");
  const detailed = read("knowledge-profile.html");

  assert.match(overview, /knowledge-profile\.html/);
  assert.match(overview, /fromProfile/);
  assert.match(overview, /location\.replace\("knowledge-profile\.html"\)/);

  assert.match(detailed, /Din detaljerte kunnskapsprofil/);
  assert.match(detailed, /id="conceptCloud"/);
  assert.match(detailed, /id="emneDekningSection"/);
  assert.match(detailed, /id="filterCategory"/);
  assert.match(detailed, /id="knowledgeContainer"/);
  assert.match(detailed, /dist\/web\/emneDekning\.js/);
  assert.match(detailed, /js\/knowledgeProfileLegacy\.js/);
});
