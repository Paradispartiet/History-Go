#!/usr/bin/env node
// Verifies the read_story producer: HGStories.openPlace records the place's stories into
// HGReads (which the Civication bridge later reads to complete read_story tasks).

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const storiesPath = path.join(root, "js/stories/stories_loader.js");

const recorded = [];
global.window = global;
global.console = { ...console, warn() {}, error() {} };
global.PLACES = [];
global.document = {
  createElement: () => ({ className: "", innerHTML: "" })
};
// Stub HGStoryUI so openPlace skips the fallback renderer; capture HGReads calls.
global.HGStoryUI = { renderPlaceStories() {} };
global.HGReads = { recordStory: (x) => recorded.push(x) };
global.showPlaceCardRoundPopup = function () {};

vm.runInThisContext(fs.readFileSync(storiesPath, "utf8"), { filename: storiesPath });

const HGStories = global.HGStories;
assert(HGStories && typeof HGStories.openPlace === "function", "HGStories.openPlace exists");

// Seed the in-memory index and skip network init.
HGStories.init = async () => {};
HGStories.byPlace = { akershus_festning: [{ id: "s1" }, { id: "s2" }] };

(async () => {
  await HGStories.openPlace("akershus_festning");

  assert.strictEqual(recorded.length, 2, "both stories recorded");
  assert.deepStrictEqual(
    recorded.map((r) => r.storyId).sort(),
    ["s1", "s2"],
    "story ids recorded"
  );
  assert.ok(recorded.every((r) => r.placeId === "akershus_festning"), "recorded with place id");

  // No stories -> no records, no crash
  recorded.length = 0;
  await HGStories.openPlace("empty_place");
  assert.strictEqual(recorded.length, 0, "no stories -> nothing recorded");

  console.log("hg story producer ok");
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
