#!/usr/bin/env node
// Verifies that fixed Civication map markers expose names to assistive
// technology and click-driven details without rendering labels on the map.

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const source = fs.readFileSync(
  path.join(repoRoot, "js/Civication/ui/CivicationCityLayer.js"),
  "utf8"
);
const css = fs.readFileSync(path.join(repoRoot, "css/civi-city-layer.css"), "utf8");

assert.match(
  source,
  /btn\.setAttribute\("aria-label", String\(loc\.label \|\| loc\.id \|\| "Sted"\)\)/,
  "place marker button should use the place name as its accessible label"
);
assert.match(
  source,
  /btn\.setAttribute\("aria-label", String\(friend\.name \|\| "Person"\)\)/,
  "friend marker button should use the person's name as its accessible label"
);
assert.match(
  source,
  /civi-city-place-icon" aria-hidden="true"/,
  "decorative place icon should be hidden from assistive technology"
);
assert.match(
  source,
  /civi-city-friend-figure" aria-hidden="true"/,
  "decorative friend figure should be hidden from assistive technology"
);
assert.doesNotMatch(source, /civi-city-place-label/, "place labels must not be rendered in the map layer");
assert.doesNotMatch(source, /civi-city-friend-tag/, "friend names/status must not be rendered in the map layer");
assert.doesNotMatch(source, /setAttribute\("title"/, "markers must not use native title tooltips");
assert.doesNotMatch(css, /\.civi-city-place-label\b/, "removed place labels should have no visual map style");
assert.doesNotMatch(css, /\.civi-city-friend-tag\b/, "removed friend labels should have no visual map style");
assert.match(source, /openPlaceDetail\(String\(loc\.id \|\| ""\)\)/, "place click should retain existing details");
assert.match(source, /openFriendDetail\(String\(friend\.id \|\| ""\)\)/, "friend click should retain existing details");

console.log("Civication city layer renders icon-only accessible map markers.");
