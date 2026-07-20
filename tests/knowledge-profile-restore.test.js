const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");

test("Knowledge V2 loads canonical badge logos", () => {
  const html = read("knowledge.html");
  const runtime = read("js/knowledgeBadgeLogos.js");

  assert.match(html, /css\/knowledge-badge-logos\.css/);
  assert.match(html, /js\/knowledgeBadgeLogos\.js/);
  assert.match(runtime, /DataHub\?\.loadBadges|DataHub\.loadBadges/);
  assert.match(runtime, /badge\?\.image|badge\.image/);
});

test("canonical badge image references point to existing repository assets", () => {
  const index = JSON.parse(read("data/badges/index.json"));
  assert.ok(Array.isArray(index.files) && index.files.length > 0);

  for (const file of index.files) {
    const badge = JSON.parse(read(file));
    if (!badge.image) continue;
    assert.equal(
      fs.existsSync(path.join(ROOT, badge.image)),
      true,
      `${badge.id}: missing ${badge.image}`
    );
  }
});

test("classic Knowledge profile remains available alongside V2", () => {
  const overview = read("knowledge.html");
  const classic = read("knowledge-profile.html");

  assert.match(overview, /location\.replace\("knowledge-profile\.html"\)/);
  assert.match(overview, /params\.get\("view"\) === "v2"/);
  assert.match(overview, /js\/knowledgeBadgeLogos\.js/);

  assert.match(classic, /Din kunnskapsprofil/);
  assert.match(classic, /bilder\/logo_historygo\.PNG/);
  assert.doesNotMatch(classic, /bilder\/ui\/historygo_logo\.PNG/);
  assert.match(classic, /id="conceptCloud"/);
  assert.match(classic, /id="emneDekningSection"/);
  assert.match(classic, /id="filterCategory"/);
  assert.match(classic, /id="knowledgeContainer"/);
  assert.match(classic, /js\/knowledgeProfileClassic\.js/);
});
