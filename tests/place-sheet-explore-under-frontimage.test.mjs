import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const shellSource = fs.readFileSync("js/ui/place-sheet/place-sheet-shell.ts", "utf8");
const css = fs.readFileSync("css/place-sheet.css", "utf8");
const phase6Css = fs.readFileSync("css/place-sheet-phase6.css", "utf8");

test("Place Sheet keeps title and popup description before all visual PlaceCard content", () => {
  assert.match(
    shellSource,
    /<div class="pc-sheet-hero"[^>]*>[\s\S]*?<div class="pc-sheet-hero-copy"[^>]*><\/div>[\s\S]*?<div class="pc-sheet-hero-media"[^>]*>[\s\S]*?<section class="pc-sheet-explore"/,
    "copy must precede the front image, collections, events and meetings"
  );
  assert.match(shellSource, /media\.prepend\(front\)/, "frontImage remains owned by hero-media");
  assert.match(shellSource, /collections\.appendChild\(sideStack\)/, "collection rounds remain owned by the canonical side stack");
  assert.match(shellSource, /onsite\.appendChild\(events\)/, "events and meetings remain in the canonical onsite surface");
});

test("Place Sheet removes the left hero column and lays collections out below the intro", () => {
  assert.match(css, /\.pc-sheet-hero\{[\s\S]*?display:\s*block;/);
  assert.doesNotMatch(css, /\.pc-sheet-hero\{[\s\S]*?grid-template-columns:\s*minmax\(230px,/);
  assert.match(css, /\.pc-sheet-explore-grid \.pc-icons-quad\{[\s\S]*?grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /@media \(max-width:\s*720px\)[\s\S]*?\.pc-sheet-explore-grid \.pc-icons-quad\{[\s\S]*?repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
});

test("Place Sheet section navigation is the first shell element and scrollable sticky header", () => {
  assert.match(shellSource, /if \(shell\.firstElementChild !== nav\) shell\.prepend\(nav\)/);
  assert.match(phase6Css, /\.pc-sheet-section-nav\{[\s\S]*?position:sticky;[\s\S]*?top:0;[\s\S]*?overflow-x:auto;/);
  assert.match(phase6Css, /\.pc-sheet-section-nav::-webkit-scrollbar\{display:none;\}/);
});
