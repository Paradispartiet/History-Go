const assert = require("assert");
const fs = require("fs");
const path = require("path");

const source = fs.readFileSync(
  path.resolve(__dirname, "../js/ui/place-popup-sport-training.js"),
  "utf8"
);

assert(source.includes("wrapped.__hgPlacePopupV2"));
assert(source.includes("wrapped.__previous = previous"));
assert(source.includes("global.showPlacePopup = wrapped"));

console.log("Place popup wrapper contract OK");
