const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "data/people/manifest.json"), "utf8"));
const people = [];
for (const rel of manifest.files) {
  const doc = JSON.parse(fs.readFileSync(path.join(root, "data", rel), "utf8"));
  people.push(...(Array.isArray(doc) ? doc : [doc]));
}
const expected = {
  "knut_knutsen_arkitekt": "folkets_hus_oslo",
  "henrik_bull": "regjeringskvartalet",
  "kong_karl_johan": "slottet",
  "oscar_i": "slottet",
  "heinrich_ernst_schirmer": "slottet",
  "wilhelm_von_hanno": "victoria_terrasse",
  "henrik_ibsen": "victoria_terrasse",
  "johan_nygaardsvold": "victoria_terrasse",
  "bengt_espen_knudsen": "folkets_hus_oslo",
  "torstein_ramberg": "regjeringskvartalet",
  "johan_henrik_nebelong": "slottet",
  "peter_fredrik_wergmann": "slottet",
  "johannes_flintoe": "slottet",
  "peter_petersen_victoria_terrasse": "victoria_terrasse",
  "henrik_thrap_meyer": "victoria_terrasse",
  "paul_due": "victoria_terrasse",
  "bernhard_steckmest": "victoria_terrasse",
  "curt_brauer": "victoria_terrasse",
  "christian_mohr": "victoria_terrasse",
  "christian_p_reusch": "victoria_terrasse"
};
for (const [id, placeId] of Object.entries(expected)) {
  const matches = people.filter((person) => person.id === id);
  if (matches.length !== 1) throw new Error(`${id}: expected one identity, got ${matches.length}`);
  const person = matches[0];
  const places = new Set([...(person.places || []), person.placeId].filter(Boolean));
  if (!places.has(placeId)) throw new Error(`${id}: missing ${placeId}`);
  if (!Array.isArray(person.source_urls) || person.source_urls.length === 0) throw new Error(`${id}: missing source_urls`);
}
const minimums = { folkets_hus_oslo: 4, regjeringskvartalet: 11, slottet: 11, victoria_terrasse: 13 };
for (const [placeId, minimum] of Object.entries(minimums)) {
  const count = people.filter((person) => new Set([...(person.places || []), person.placeId].filter(Boolean)).has(placeId)).length;
  if (count < minimum) throw new Error(`${placeId}: ${count} < ${minimum}`);
  console.log(`${placeId}: ${count}`);
}
console.log(`Final politics People batch OK: ${Object.keys(expected).length} identities`);
