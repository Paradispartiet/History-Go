const assert = require("node:assert/strict");
const fs = require("node:fs");
const room = fs.readFileSync("js/psychologyRoom.js", "utf8");
const entry = fs.readFileSync("js/ui/psychology-room-entry.js", "utf8");

assert.match(room, /id="psychologyRoomAhaShareForm"/);
assert.match(room, /name="selected_insight"/);
assert.match(room, /name="aha_share_confirm" required/);
assert.match(room, /ahaShareConsent\?\.checked/);
assert.match(room, /type: "historygo\.psychology\.selection\.v1"/);
assert.match(room, /schema_version: "aha_psychology_selection_v1"/);
assert.ok(room.includes('const ahaShareTarget = "https://aha-echo-net.vercel.app/psykologi.html";'));
assert.ok(room.includes('const ahaTrustedOrigins = ["https://aha-echo-net.vercel.app"];'));
assert.equal(room.includes("https://aha-echonet.vercel.app"), false);
assert.match(room, /message\.source !== destination/);
assert.match(room, /!ahaTrustedOrigins\.includes\(message\.origin\)/);
assert.match(room, /destination\.postMessage\(\{/);
assert.doesNotMatch(room, /localStorage\.setItem\(["']aha_psychology_/);
assert.match(room, /Kopier valgt tekst/);
assert.match(entry, /20261120-psychology-groups-v1/);
assert.ok(fs.readFileSync("index.html", "utf8").includes("js/ui/psychology-room-entry.js?v=20261120-psychology-groups-v1"));
assert.match(entry, /get\("room"\) === "psychology"/);

const shareHandler = room.match(/ahaShareForm\?\.addEventListener\("submit",[\s\S]*?\n    \}\);/u)?.[0] || "";
assert.ok(shareHandler.length > 300);
assert.doesNotMatch(shareHandler, /STORAGE_KEYS|readJson\(|getWorkbenchEntries\(|getProfile\(/);
console.log("psychology-room-aha-bridge.test.js passed");
