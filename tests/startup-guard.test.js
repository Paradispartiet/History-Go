#!/usr/bin/env node
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const config = fs.readFileSync(path.join(root, "js/config.js"), "utf8");
const guard = fs.readFileSync(path.join(root, "js/startup-guard.js"), "utf8");

assert.match(config, /startup-guard\.js/, "config loads the startup guard before app boot");
assert.match(guard, /SCRIPT_TIMEOUT_MS\s*=\s*8000/, "dynamic scripts have a bounded deadline");
assert.match(guard, /FETCH_TIMEOUT_MS\s*=\s*8000/, "same-origin fetches have a bounded deadline");
assert.match(guard, /\/js\/social\//, "social modules are outside critical startup");
assert.match(guard, /\/js\/caravan-/, "caravan modules are outside critical startup");
assert.match(guard, /window\.addEventListener\("hg:appReady"/, "deferred features flush after app ready");
assert.match(guard, /body\.classList\.add\("hg-loaded", "hg-load-failed", "hg-startup-timeout"\)/, "a final deadline breaks the infinite loading gate");

console.log("Startup guard keeps non-critical modules and hanging requests out of critical boot.");
