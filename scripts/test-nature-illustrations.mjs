import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const read = path => fs.readFileSync(new URL(path, root), "utf8");
const sandbox = { window: {} };
vm.runInNewContext(read("js/ui/nature-illustrations.js"), sandbox, { timeout: 3000 });
const artist = sandbox.window.HG_NATURE_ILLUSTRATIONS;
assert.equal(artist.count, 30, "expected 30 first-batch original illustrations");
const index = JSON.parse(read("data/runtime/nature-all.json"));
const ids = new Set();
for (const files of Object.values(index.groups)) {
 for (const file of files) {
  const batch = JSON.parse(read(file));
  for (const entry of batch) {
   const items = entry.kind === "emne_pack" && Array.isArray(entry.items) ? entry.items : [entry];
   for (const item of items) if (item.id) ids.add(item.id);
  }
 }
}
const source = read("js/ui/nature-illustrations.js");
const references = [...source.matchAll(/\bemne_(?:flora|ved|fauna)_[a-zA-Z0-9_]+(?=\s*:)/g)].map(m=>m[0]);
assert.equal(new Set(references).size, 30);
for (const id of references) {
 assert(ids.has(id), "illustration references unknown taxon: " + id);
 assert(artist.has(id), "missing art: " + id);
 const uri = artist.resolve(id);
 assert(uri.startsWith("data:image/svg+xml;charset=UTF-8,"), id + ": bad format");
 const svg = decodeURIComponent(uri.split(",")[1]);
 assert(svg.includes("<svg") && svg.includes("</svg>"), id + ": malformed SVG");
 assert(!svg.includes("<script"), id + ": executable image code");
}
assert.equal(artist.resolve("unknown"), "");
assert.equal(references.filter(id => id.startsWith("emne_fauna_")).length, 15);
assert.equal(references.filter(id => !id.startsWith("emne_fauna_")).length, 15);
for (const kind of ["flora", "fauna"]) {
 const html=read("finn-" + kind + ".html");
 assert(html.includes("js/ui/nature-illustrations.js"));
 assert(html.includes("data-filter=\"illustrated\""));
 assert(html.indexOf("nature-illustrations.js") < html.indexOf("nature-explorer.js"));
}
console.log("Nature atlas illustrations: 30/30 referenced and renderable; both pages wired.");
