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

test("Knowledge subject badges expose canonical image references", () => {
  const index = JSON.parse(read("data/badges/index.json"));
  assert.ok(Array.isArray(index.files) && index.files.length > 0);

  const badges = new Map(index.files.map((file) => {
    const badge = JSON.parse(read(file));
    return [badge.id, badge];
  }));

  const knowledgeSubjects = [
    "historie",
    "vitenskap",
    "kunst",
    "natur",
    "musikk",
    "subkultur",
    "sport",
    "by",
    "politikk",
    "naeringsliv",
    "litteratur",
    "psykologi",
    "media",
    "film_tv",
    "religion"
  ];

  for (const subjectId of knowledgeSubjects) {
    const badge = badges.get(subjectId);
    assert.ok(badge, `missing badge metadata for ${subjectId}`);
    assert.equal(typeof badge.image, "string", `${subjectId}: badge.image must be a string`);
    assert.ok(badge.image.trim(), `${subjectId}: badge.image must not be empty`);
    assert.match(badge.image, /^bilder\//, `${subjectId}: badge.image must use a repository image path`);
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
