#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const config = fs.readFileSync(path.join(root, "js", "config.js"), "utf8");
const router = fs.readFileSync(path.join(root, "js", "router", "AppRouter.js"), "utf8");
const onboarding = fs.readFileSync(path.join(root, "js", "ui", "onboarding-welcome.js"), "utf8");

assert.match(config, /markExistingScriptsLoadedBeforeAppBoot/);
assert.match(config, /script\.dataset\.hgLoaded = "1"/);
assert.match(config, /DOMContentLoaded/);
assert.match(router, /window\.__HG_ROUTER_STARTED__ = true/);
assert.match(router, /hg:routerReady/);
assert.match(onboarding, /whenFullyInteractive/);
assert.match(onboarding, /window\.__HG_ROUTER_STARTED__ === true/);
assert.match(onboarding, /hg:routerReady/);

console.log("onboarding waits for a started router and stale script load events cannot stall app boot");