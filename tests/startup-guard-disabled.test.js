#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const config = fs.readFileSync(path.join(root, "js", "config.js"), "utf8");
const guard = fs.readFileSync(path.join(root, "js", "startup-guard.js"), "utf8");

assert.doesNotMatch(config, /startup-guard\.js/, "config must not load the legacy startup guard");
assert.doesNotMatch(guard, /window\.fetch\s*=/, "legacy shim must not replace window.fetch");
assert.doesNotMatch(guard, /Node\.prototype\.appendChild\s*=/, "legacy shim must not replace Node.prototype.appendChild");
assert.match(guard, /legacyGuardDisabled:\s*true/, "legacy shim should remain diagnosable for stale cached config clients");

console.log("startup guard remains disabled and non-invasive");
