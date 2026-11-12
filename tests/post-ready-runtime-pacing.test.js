#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const config = fs.readFileSync(path.join(__dirname, "..", "js", "config.js"), "utf8");
const guard = fs.readFileSync(path.join(__dirname, "..", "js", "startup-guard.js"), "utf8");
const index = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

// Exact src matching is how the deferred placeholder prevents the legacy
// chain from executing this classic script (with global let bindings) twice.
const badgeSources = text => [...text.matchAll(/"(js\/ui\/badges\.js[^"\s]*)"/g)].map(match => match[1]);
assert.equal(badgeSources(config).length, 1);
assert.deepEqual(badgeSources(config), badgeSources(index), "Both post-ready loaders must share one badge script URL");

assert.match(config, /installPacedPostReadyRuntime/);
assert.match(config, /application\/x-history-go-deferred/);
assert.match(config, /data-hg-post-ready-placeholder|hgPostReadyPlaceholder/);
assert.match(config, /window\.addEventListener\("hg:appReady"/);
assert.match(config, /setTimeout\(\(\) => loadAt\(0\), 1400\)/);
assert.match(config, /requestIdleCallback/);
assert.match(config, /setTimeout\(\(\) => loadAt\(index \+ 1\), 40\)/);
assert.doesNotMatch(config, /startup-guard\.js/);
assert.doesNotMatch(guard, /Node\.prototype\.appendChild\s*=/);
assert.doesNotMatch(guard, /window\.fetch\s*=/);

console.log("post-ready runtime is paced without re-enabling the invasive startup guard");
