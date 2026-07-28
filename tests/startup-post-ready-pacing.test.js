#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const guard = fs.readFileSync(path.join(__dirname, "..", "js", "startup-guard.js"), "utf8");
const config = fs.readFileSync(path.join(__dirname, "..", "js", "config.js"), "utf8");

assert.match(guard, /function scheduleIdle\(task\)/);
assert.match(guard, /function flushDeferredScripts\(\)/);
assert.match(guard, /scheduleIdle\(\(\) => loadNext\(index \+ 1\)\)/);
assert.match(guard, /function flushPacedBodyScripts\(\)/);
assert.match(guard, /pacedBodyScripts\.push\(node\)/);
assert.match(guard, /POST_READY_BODY_SCRIPT_SUFFIXES/);
assert.match(guard, /url\.pathname\.endsWith\(suffix\)/);
assert.doesNotMatch(guard, /for \(const script of scripts\) \{[\s\S]{0,500}nativeAppendChild\.call\(document\.head, script\)/);
assert.match(config, /startup-guard\.js\?v=20260728-freezefix1/);

console.log("post-ready secondary scripts are paced instead of released in one burst");
