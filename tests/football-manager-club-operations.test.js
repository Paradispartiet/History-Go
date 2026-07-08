#!/usr/bin/env node
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "games/football-manager/index.html"), "utf8");
const js = fs.readFileSync(path.join(root, "games/football-manager/club-operations.js"), "utf8");
const readme = fs.readFileSync(path.join(root, "games/football-manager/README.md"), "utf8");

for (const label of ["Kontor", "Lag", "Taktikk", "Kampdag", "Stab", "Klubb"]) {
  assert.match(html, new RegExp(`>${label}<`), `main navigation includes ${label}`);
}
for (const label of ["Styret", "Fasiliteter", "Administrasjon", "Speiding", "Identitet"]) {
  assert.match(html, new RegExp(`>${label}<`), `club navigation includes ${label}`);
}
for (const role of ["Assistenttrener", "Trener", "Fysio", "Keepertrener"]) {
  assert.match(js, new RegExp(role), `staff surface includes ${role}`);
}
assert.match(js, /Finn en klubbtilknyttet trener i History Go/, "locked staff explains History Go unlock path");
assert.match(js, /Speiding leser History Go-unlocks/, "scouting is connected to History Go unlocks");
assert.match(js, /Ingen transfermarked er bygget/, "scouting avoids transfer market");
assert.match(js, /forenklet i v0\.1/i, "facilities state v0.1 simplification");
assert.match(js, /ikke motor direkte/, "facilities do not claim direct engine effects");
assert.match(js, /data-next-week|data-action|data-club-tab/, "surfaces expose actions instead of dead ends");
assert.match(readme, /Ingen tung økonomimotor/, "audit note documents no economy engine");
assert.match(readme, /Ingen endring i History Go unlock-dataflyt/, "audit note documents unchanged unlock flow");
console.log("Football Manager club operations surface passes content audit.");
