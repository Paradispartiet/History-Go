#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const boot = fs.readFileSync(path.join(__dirname, "..", "js", "boot-fast.js"), "utf8");

assert.match(boot, /function waitForBackgroundIdle\(\)/);
assert.match(boot, /requestIdleCallback/);
assert.match(boot, /for \(const \[label, task\] of tasks\)/);
assert.match(boot, /await waitForBackgroundIdle\(\);\s*await runSafeAsync\(label, task\);/);
assert.doesNotMatch(boot, /Promise\.allSettled\(tasks\)/);

console.log("background boot is serialized across idle periods");