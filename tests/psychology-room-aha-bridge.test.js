const assert = require("node:assert/strict");
const fs = require("node:fs");
const room = fs.readFileSync("js/psychologyRoom.js", "utf8");
const entry = fs.readFileSync("js/ui/psychology-room-entry.js", "utf8");

// Private selections can still be composed and copied locally.
assert.match(room, /id="psychologyRoomAhaShareForm"/);
assert.match(room, /name="selected_insight"/);
assert.match(room, /data-psych-copy-aha="1"/);
assert.match(room, /navigator\.clipboard\.writeText\(selected\)/);
assert.match(room, /Ingen privat tekst sendes til AHA/);
assert.match(room, /automatisk overføring er deaktivert/);
assert.match(room, /Ingen overføring til AHA/);

// The former endpoint was neither verified nor owned by the connected
// Vercel team. Never open it and never postMessage private reflection text.
assert.doesNotMatch(room, /aha-echo-net\.vercel\.app|aha-echonet\.vercel\.app/);
assert.doesNotMatch(room, /ahaShareTarget|ahaTrustedOrigins|ahaShareConsent/);
assert.doesNotMatch(room, /window\.open\(ahaShareTarget|destination\.postMessage/);
assert.doesNotMatch(room, /name="aha_share_confirm"|Åpne AHA med valgt tekst/);

// Keep existing local backup and Psychology Room entry intact.
assert.match(entry, /20261120-psychology-backup-v1/);
assert.ok(fs.readFileSync("index.html", "utf8").includes(
  "js/ui/psychology-room-entry.js?v=20261120-psychology-backup-v1"));
assert.match(entry, /get\("room"\) === "psychology"/);
assert.doesNotMatch(room, /localStorage\.setItem\(["']aha_psychology_/);
console.log("psychology-room-aha-bridge.test.js: unverified remote share blocked, manual copy available PASS");
