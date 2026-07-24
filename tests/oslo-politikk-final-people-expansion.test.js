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
  "yngve_hagensen": "folkets_hus_oslo",
  "gerd_liv_valla": "folkets_hus_oslo",
  "henrik_bull": "regjeringskvartalet",
  "per_borten": "regjeringskvartalet",
  "odvar_nordli": "regjeringskvartalet",
  "kong_karl_johan": "slottet",
  "oscar_i": "slottet",
  "heinrich_ernst_schirmer": "slottet",
  "olav_v": "slottet",
  "harald_v": "slottet",
  "peter_fredrik_wergmann": "slottet",
  "johannes_flintoe": "slottet",
  "wilhelm_von_hanno": "victoria_terrasse",
  "henrik_ibsen": "victoria_terrasse",
  "johan_nygaardsvold": "victoria_terrasse",
  "peter_petersen_victoria_terrasse": "victoria_terrasse",
  "henrik_thrap_meyer": "victoria_terrasse",
  "curt_brauer": "victoria_terrasse",
  "christian_mohr": "victoria_terrasse",
  "christian_p_reusch": "victoria_terrasse",
  "halvard_lange": "victoria_terrasse",
  "ulrik_olsen": "victoria_terrasse"
};

for (const [id, placeId] of Object.entries(expected)) {
  const matches = people.filter((person) => person.id === id);
  if (matches.length !== 1) throw new Error(`${id}: expected one identity, got ${matches.length}`);
  const person = matches[0];
  const places = new Set([...(person.places || []), person.placeId].filter(Boolean));
  if (!places.has(placeId)) throw new Error(`${id}: missing ${placeId}`);
  if (!Array.isArray(person.source_urls) || person.source_urls.length === 0) throw new Error(`${id}: missing source_urls`);
}

const minimums = {
  folkets_hus_oslo: 5,
  regjeringskvartalet: 12,
  slottet: 12,
  victoria_terrasse: 13
};

const architectureCaps = {
  folkets_hus_oslo: 2,
  regjeringskvartalet: 2,
  slottet: 2,
  victoria_terrasse: 2
};

function placesFor(person) {
  return new Set([...(person.places || []), person.placeId].filter(Boolean));
}

function isArchitect(person) {
  const tags = Array.isArray(person.tags) ? person.tags.map(String) : [];
  const text = `${person.desc || ""} ${person.popupDesc || ""}`.toLowerCase();
  return tags.includes("arkitektur") || /\barkitekt(?:en|er|ene|assistent)?\b/.test(text);
}

for (const [placeId, minimum] of Object.entries(minimums)) {
  const linked = people.filter((person) => placesFor(person).has(placeId));
  if (linked.length < minimum) throw new Error(`${placeId}: ${linked.length} < ${minimum}`);

  const architects = linked.filter(isArchitect);
  const cap = architectureCaps[placeId];
  if (architects.length > cap) {
    throw new Error(`${placeId}: ${architects.length} architects > ${cap}: ${architects.map((person) => person.id).join(", ")}`);
  }

  const nonArchitects = linked.length - architects.length;
  if (nonArchitects <= architects.length) {
    throw new Error(`${placeId}: political and human history must outweigh architecture (${nonArchitects} <= ${architects.length})`);
  }

  console.log(`${placeId}: ${linked.length} people, ${architects.length} architects, ${nonArchitects} other roles`);
}

console.log(`Final politics People balance OK: ${Object.keys(expected).length} identities`);
