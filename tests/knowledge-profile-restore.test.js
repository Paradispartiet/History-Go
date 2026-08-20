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

test("canonical Knowledge page preserves V2 while the old URL redirects", () => {
  const knowledge = read("knowledge.html");
  const compatibilityRedirect = read("knowledge-profile.html");
  const runtime = read("js/knowledgePage.js");

  assert.match(knowledge, /<title>Kunnskapen min \| History Go<\/title>/);
  assert.match(knowledge, /id="knowledgeSummary"/);
  assert.match(knowledge, /id="knowledgeSearch"/);
  assert.match(knowledge, /id="knowledgeSubjectNav"/);
  assert.match(knowledge, /id="knowledgeContent"/);
  assert.match(knowledge, /js\/knowledgePage\.js/);
  assert.match(knowledge, /js\/knowledgeBadgeLogos\.js/);

  assert.match(runtime, /Kursstatus/);
  assert.match(runtime, /kv2-empty-emners/);
  assert.match(runtime, /unresolvedEntries/);
  assert.match(runtime, /collectionHref\(LANGUAGE_COLLECTION_ID\)/);

  assert.match(compatibilityRedirect, /new URL\("knowledge\.html", location\.href\)/);
  assert.match(compatibilityRedirect, /target\.search = location\.search/);
  assert.match(compatibilityRedirect, /target\.hash = location\.hash/);
  assert.match(compatibilityRedirect, /location\.replace\(target\.href\)/);
  assert.doesNotMatch(compatibilityRedirect, /js\/knowledgeProfileClassic\.js/);
});
