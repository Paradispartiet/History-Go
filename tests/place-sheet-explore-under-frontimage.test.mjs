import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const shellSource = fs.readFileSync("js/ui/place-sheet/place-sheet-shell.ts", "utf8");
const css = fs.readFileSync("css/place-sheet.css", "utf8");
const phase6Css = fs.readFileSync("css/place-sheet-phase6.css", "utf8");

test("Place Sheet keeps title and popup description before the front image and collection rounds", () => {
  assert.match(
    shellSource,
    /<div class="pc-sheet-hero"[^>]*>[\s\S]*?<div class="pc-sheet-hero-copy"[^>]*><\/div>[\s\S]*?<div class="pc-sheet-hero-media"[^>]*>[\s\S]*?data-hg-place-sheet-collections/,
    "copy must precede the front image and collection host"
  );
  assert.match(shellSource, /media\.prepend\(front\)/, "frontImage remains owned by hero-media");
  assert.match(shellSource, /collections\.appendChild\(sideStack\)/, "visual collection rounds remain in PlaceCard media");
  assert.match(css, /\.pc-sheet-hero\{[\s\S]*?display:\s*block;/);
  assert.match(css, /\.pc-sheet-explore-grid\{[\s\S]*?margin-top:24px/);
});

test("Place Sheet header uses collection text links after Om while Events and Meet stay in the header", () => {
  assert.match(shellSource, /data-hg-place-sheet-collection-link/);
  assert.match(shellSource, /syncCollectionNav\(nav, place, sideStack\)/);
  assert.match(shellSource, /insertAfter\?\.after\(events\)/);
  assert.doesNotMatch(shellSource, /insertAfter\?\.after\(sideStack\)/);
});

test("Place Sheet header scrolls horizontally without moving collection images into it", () => {
  assert.match(shellSource, /if \(shell\.firstElementChild !== nav\) shell\.prepend\(nav\)/);
  assert.match(phase6Css, /\.pc-sheet-section-nav\{[\s\S]*?position:sticky;[\s\S]*?top:0;[\s\S]*?overflow-x:auto;/);
  assert.doesNotMatch(phase6Css, /> \.pc-side-stack/);
  assert.match(phase6Css, /> #pcEventsBox[\s\S]*?height:38px/);
  assert.match(phase6Css, /#pcEventsBox \.pc-onsite-actions\{[\s\S]*?display:flex/);
});
