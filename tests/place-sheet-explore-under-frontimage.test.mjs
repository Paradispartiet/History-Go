import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const shellSource = fs.readFileSync("js/ui/place-sheet/place-sheet-shell.ts", "utf8");
const css = fs.readFileSync("css/place-sheet.css", "utf8");
const phase6Css = fs.readFileSync("css/place-sheet-phase6.css", "utf8");
const onsiteRuntime = fs.readFileSync("js/ui/place-onsite-surface.js", "utf8");
const onsiteCss = fs.readFileSync("css/place-onsite-surface.css", "utf8");

test("Place Sheet keeps title and popup description above frontImage with collection rounds to its right", () => {
  assert.match(
    shellSource,
    /<div class="pc-sheet-hero"[^>]*>[\s\S]*?<div class="pc-sheet-hero-copy"[^>]*><\/div>[\s\S]*?<div class="pc-sheet-hero-media"[^>]*>[\s\S]*?data-hg-place-sheet-collections/,
    "copy must precede the front image and collection host"
  );
  assert.match(shellSource, /media\.prepend\(front\)/, "frontImage remains owned by hero-media");
  assert.match(shellSource, /collections\.appendChild\(sideStack\)/, "visual collection rounds remain in PlaceCard media");
  assert.match(css, /\.pc-sheet-hero-media\{[\s\S]*?display:grid;[\s\S]*?grid-template-columns:minmax\(0,330px\) minmax\(0,1fr\)/);
  assert.match(css, /\.pc-sheet-explore-grid\{[\s\S]*?margin:0;[\s\S]*?background:transparent/);
});

test("Place Sheet collection visuals have no dark background box", () => {
  assert.match(css, /\.pc-sheet-explore-grid \.pc-collection:not\(\[hidden\]\)\{[\s\S]*?border:0;[\s\S]*?background:transparent;[\s\S]*?box-shadow:none/);
  assert.match(css, /\.pc-sheet-explore-grid \.pc-collection\[data-collection-shape="rectangle"\]::before\{[\s\S]*?display:none/);
});

test("Place Sheet keeps collection text links, but restores Events and Møtes below the landscape", () => {
  assert.match(shellSource, /data-hg-place-sheet-collection-link/);
  assert.match(shellSource, /syncCollectionNav\(nav, place, sideStack\)/);
  assert.match(onsiteRuntime, /hero\.after\(box\)/);
  assert.match(onsiteRuntime, /ensureBelowLandscape\(\)/);
  assert.match(onsiteRuntime, /childList: true/);
  assert.doesNotMatch(shellSource, /insertAfter\?\.after\(sideStack\)/);
});

test("Place Sheet header scrolls horizontally without moving collection images into it", () => {
  assert.match(shellSource, /if \(shell\.firstElementChild !== nav\) shell\.prepend\(nav\)/);
  assert.match(phase6Css, /\.pc-sheet-section-nav\{[\s\S]*?position:sticky;[\s\S]*?top:0;[\s\S]*?overflow-x:auto;/);
  assert.doesNotMatch(phase6Css, /> \.pc-side-stack/);
  assert.doesNotMatch(phase6Css, /> #pcEventsBox/);
  assert.match(onsiteCss, /\.pc-text > #pcEventsBox\{/);
  assert.match(onsiteCss, /\.pc-text > #pcEventsBox \.pc-onsite-actions\{[\s\S]*?grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
});
