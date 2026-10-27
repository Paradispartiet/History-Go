#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = fs.readFileSync(path.join(__dirname, "..", "js", "ui", "onboarding-welcome.js"), "utf8");

assert.match(source, /const MODAL_Z_INDEX = "2147483646"/);
assert.match(source, /modal\.style\.zIndex = MODAL_Z_INDEX/);
assert.match(source, /modal\.style\.pointerEvents = "auto"/);
assert.match(source, /control\.addEventListener\("click", dismiss\)/);
assert.match(source, /control\.addEventListener\("pointerup", dismiss\)/);
assert.match(source, /control\.addEventListener\("touchend", dismiss, \{ passive: false \}\)/);
assert.match(source, /m\.style\.display = "flex"/);

assert.match(source, /History Go gjør virkelige steder til et historisk spillkart/);
assert.match(source, /Stedskort samles ved fysisk besøk/);
assert.match(source, /Spill videre i Civication/);
assert.match(source, /hg:onboardingClosed/);

console.log("onboarding modal remains tappable on touch devices");
