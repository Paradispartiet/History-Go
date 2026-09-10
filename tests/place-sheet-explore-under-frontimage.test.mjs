import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const shellSource = fs.readFileSync("js/ui/place-sheet/place-sheet-shell.ts", "utf8");
const css = fs.readFileSync("css/place-sheet.css", "utf8");

test("Place Sheet keeps Explore directly beneath frontImage in the left hero column", () => {
  assert.match(
    shellSource,
    /<div class="pc-sheet-hero-media" data-hg-place-sheet-media>[\s\S]*?<section class="pc-sheet-explore"[\s\S]*?data-hg-place-sheet-collections[\s\S]*?<\/section>[\s\S]*?<\/div>[\s\S]*?<div class="pc-sheet-hero-copy" data-hg-place-sheet-copy>/,
    "Explore must live inside hero-media while copy remains the separate right column"
  );
  assert.match(shellSource, /media\.prepend\(front\)/, "frontImage must be inserted before Explore in hero-media");
});

test("Place Sheet preserves two-column text layout and mobile image/explore/copy stacking", () => {
  assert.match(css, /\.pc-sheet-hero\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-columns:\s*minmax\(230px,\s*\.78fr\)\s+minmax\(0,\s*1\.42fr\)/);
  assert.match(css, /@media \(max-width:\s*520px\)[\s\S]*?\.pc-sheet-hero\{[\s\S]*?grid-template-columns:\s*1fr/);
  assert.match(css, /\.pc-sheet-explore-grid \.pc-icons-quad\{[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
});
