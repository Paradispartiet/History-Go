#!/usr/bin/env node
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const config = fs.readFileSync(path.join(repoRoot, "js/config.js"), "utf8");

assert.match(config, /installStartupWatchdog/, "config installs an early startup watchdog");
assert.match(config, /WATCHDOG_MS\s*=\s*12000/, "watchdog has a bounded startup deadline");
assert.match(config, /window\.__HG_APP_READY__\s*===\s*true/, "watchdog leaves successful boots alone");
assert.match(config, /navigator\.serviceWorker\.getRegistrations/, "first recovery clears stale service-worker registrations");
assert.match(config, /String\(key\)\.startsWith\("hg-"\)/, "only History Go caches are cleared");
assert.match(config, /sessionStorage\.setItem\(RECOVERY_KEY, "1"\)/, "recovery reload is guarded against loops");
assert.match(config, /location\.replace\(/, "first timeout retries with a fresh navigation");
assert.match(config, /body\.classList\.add\("hg-loaded", "hg-load-failed", "hg-startup-timeout"\)/, "second timeout releases the permanent loader");
assert.match(config, /History Go brukte for lang tid på å starte/, "failed recovery gives the user an explicit retry surface");
assert.match(config, /window\.addEventListener\("hg:appReady"/, "successful appReady cancels recovery state");

console.log("Startup watchdog prevents an infinite History Go loading screen.");
