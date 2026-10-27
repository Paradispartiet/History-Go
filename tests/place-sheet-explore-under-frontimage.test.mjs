import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const shellSource = fs.readFileSync("js/ui/place-sheet/place-sheet-shell.ts", "utf8");
const css = fs.readFileSync("css/place-sheet.css", "utf8");
const phase6Css = fs.readFileSync("css/place-sheet-phase6.css", "utf8");
const onsiteRuntime = fs.readFileSync("js/ui/place-onsite-surface.js", "utf8");
const onsiteCss = fs.readFileSync("css/place-onsite-surface.css", "utf8");

test("Place Sheet orders photo, section navigation, description and collection visuals", () => {
  assert.match(
    shellSource,
    /<div class="pc-sheet-hero"[^>]*>[\s\S]*?<div class="pc-sheet-hero-copy"[^>]*><\/div>[\s\S]*?<div class="pc-sheet-hero-media"[^>]*><\/div>[\s\S]*?<div class="pc-sheet-explore-grid" data-hg-place-sheet-collections/,
    "the media and collection hosts follow the introductory copy"
  );
  assert.match(shellSource, /intro\.appendChild\(description\)/, "description follows the photo and navigation");
  assert.match(shellSource, /media\.prepend\(front\)/, "frontImage remains owned by hero-media");
  assert.match(shellSource, /collections\.appendChild\(sideStack\)/, "visual collection rounds remain in PlaceCard media");
  assert.match(css, /\.pc-sheet-hero-media\{[\s\S]*?display:flow-root;/);
  assert.match(css, /\.pc-sheet-hero-media \.pc-frontcard\{[\s\S]*?float:left;/);
  assert.match(css, /\.pc-sheet-explore-grid\{[\s\S]*?margin:24px 0 0;[\s\S]*?background:transparent/);
  assert.match(shellSource, /media\.appendChild\(aboutSlot\)/, "About text shares the image flow context");
  assert.match(shellSource, /heading\.insertAdjacentElement\("afterend", description\)/, "the live short text begins inside About");
  assert.match(shellSource, /aboutSlot\.replaceChildren\(aboutOwner\)/, "desc-only places still receive an About heading");
  assert.match(css, /\.pc-sheet-canonical-about #pcDesc\{[\s\S]*?-webkit-line-clamp:unset;[\s\S]*?overflow:visible;/);
  assert.match(shellSource, /<div class="pc-sheet-explore-grid" data-hg-place-sheet-collections/);
});

test("Place Sheet collection visuals have no dark background box", () => {
  assert.match(css, /\.pc-sheet-explore-grid \.pc-collection:not\(\[hidden\]\)\{[\s\S]*?border:0;[\s\S]*?background:transparent;[\s\S]*?box-shadow:none/);
  assert.match(css, /\.pc-sheet-explore-grid \.pc-collection\[data-collection-shape="rectangle"\]::before\{[\s\S]*?display:none/);
});

test("Place Sheet keeps only text-section links and puts Events/Møtes below collection rounds", () => {
  assert.doesNotMatch(shellSource, /data-hg-place-sheet-collection-link|syncCollectionNav/);
  assert.match(shellSource, /collections\.appendChild\(events\)/);
  assert.match(onsiteRuntime, /rounds\.after\(box\)/);
  assert.match(onsiteRuntime, /\.pc-sheet-shell > \.pc-sheet-explore-grid/);
  assert.match(onsiteRuntime, /ensureBelowCollections\(\)/);
  assert.match(onsiteRuntime, /childList: true/);
  assert.doesNotMatch(shellSource, /insertAfter\?\.after\(sideStack\)/);
});

test("Place Sheet header scrolls horizontally without moving collection images into it", () => {
  assert.match(shellSource, /hero\.insertAdjacentElement\("afterend", nav\)/, "text navigation sits below the place photo");
  assert.match(phase6Css, /\.pc-sheet-section-nav\{[\s\S]*?position:sticky;[\s\S]*?top:0;[\s\S]*?overflow-x:auto;/);
  assert.doesNotMatch(phase6Css, /> \.pc-side-stack/);
  assert.doesNotMatch(phase6Css, /> #pcEventsBox/);
  assert.match(onsiteCss, /\.pc-sheet-explore-grid > #pcEventsBox\{/);
  assert.match(onsiteCss, /\.pc-sheet-explore-grid > #pcEventsBox \.pc-onsite-actions\{[\s\S]*?grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.doesNotMatch(onsiteCss, /\.pc-text > #pcEventsBox\{/);
});
