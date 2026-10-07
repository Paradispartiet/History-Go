import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const shellSource = fs.readFileSync("js/ui/place-sheet/place-sheet-shell.ts", "utf8");
const css = fs.readFileSync("css/place-sheet.css", "utf8");
const phase6Css = fs.readFileSync("css/place-sheet-phase6.css", "utf8");

test("Place Sheet keeps title and popup description before the front image", () => {
  assert.match(
    shellSource,
    /<div class="pc-sheet-hero"[^>]*>[\s\S]*?<div class="pc-sheet-hero-copy"[^>]*><\/div>[\s\S]*?<div class="pc-sheet-hero-media"[^>]*><\/div>/,
    "copy must precede the front image host"
  );
  assert.match(shellSource, /media\.prepend\(front\)/, "frontImage remains owned by hero-media");
  assert.match(css, /\.pc-sheet-hero\{[\s\S]*?display:\s*block;/);
});

test("Place Sheet moves canonical rounds plus Events and Meet into the nav immediately after Om", () => {
  assert.match(shellSource, /querySelector<HTMLElement>\('\[data-hg-place-sheet-jump="about"\]'\)/);
  assert.match(shellSource, /insertAfter\?\.after\(sideStack\)/);
  assert.match(shellSource, /insertAfter = sideStack/);
  assert.match(shellSource, /insertAfter\?\.after\(events\)/);
  assert.doesNotMatch(shellSource, /data-hg-place-sheet-collections/);
  assert.doesNotMatch(shellSource, /data-hg-place-sheet-onsite/);
});

test("Place Sheet header scrolls horizontally and keeps canonical controls compact", () => {
  assert.match(shellSource, /if \(shell\.firstElementChild !== nav\) shell\.prepend\(nav\)/);
  assert.match(phase6Css, /\.pc-sheet-section-nav\{[\s\S]*?position:sticky;[\s\S]*?top:0;[\s\S]*?overflow-x:auto;/);
  assert.match(phase6Css, /> \.pc-side-stack[\s\S]*?height:38px/);
  assert.match(phase6Css, /> #pcEventsBox[\s\S]*?height:38px/);
  assert.match(phase6Css, /#pcEventsBox \.pc-onsite-actions\{[\s\S]*?display:flex/);
});
