import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const read = path => fs.readFileSync(new URL(path, root), "utf8");
const sandbox = { window: {} };
vm.runInNewContext(read("js/ui/nature-illustrations.js"), sandbox, { timeout: 3000 });
vm.runInNewContext(read("js/ui/nature-illustrations-batch03.js"), sandbox, { timeout: 3000 });
vm.runInNewContext(read("js/ui/nature-illustrations-batch04.js"), sandbox, { timeout: 3000 });
vm.runInNewContext(read("js/ui/nature-illustrations-batch05.js"), sandbox, { timeout: 3000 });
vm.runInNewContext(read("js/ui/nature-illustrations-batch06.js"), sandbox, { timeout: 3000 });
vm.runInNewContext(read("js/ui/nature-illustrations-batch07.js"), sandbox, { timeout: 3000 });
vm.runInNewContext(read("js/ui/nature-illustrations-batch08.js"), sandbox, { timeout: 3000 });
vm.runInNewContext(read("js/ui/nature-illustrations-batch09.js"), sandbox, { timeout: 3000 });
vm.runInNewContext(read("js/ui/nature-illustrations-batch10.js"), sandbox, { timeout: 3000 });
const artist = sandbox.window.HG_NATURE_ILLUSTRATIONS;
assert.equal(artist.count, 300, "expected 300 illustrations across nine batches");
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
const source = read("js/ui/nature-illustrations.js") + "\n" + read("js/ui/nature-illustrations-batch03.js") + "\n" + read("js/ui/nature-illustrations-batch04.js") + "\n" + read("js/ui/nature-illustrations-batch05.js") + "\n" + read("js/ui/nature-illustrations-batch06.js") + "\n" + read("js/ui/nature-illustrations-batch07.js") + "\n" + read("js/ui/nature-illustrations-batch08.js") + "\n" + read("js/ui/nature-illustrations-batch09.js") + "\n" + read("js/ui/nature-illustrations-batch10.js");
const references = [...source.matchAll(/\bemne_(?:flora|ved|fauna|kratt|gress|siv|ror|urt|starr)_[\p{L}0-9_]+(?=\s*:)/gu)].map(m=>m[0]);
assert.equal(new Set(references).size, 300);
for (const id of references) {
 assert(ids.has(id), "illustration references unknown taxon: " + id);
 assert(artist.has(id), "missing art: " + id);
 const uri = artist.resolve(id);
 assert(uri.startsWith("data:image/svg+xml;charset=UTF-8,"), id + ": bad format");
 const svg = decodeURIComponent(uri.split(",")[1]);
 assert(svg.includes("<svg") && svg.includes("</svg>"), id + ": malformed SVG");
 assert(svg.includes("<path") || svg.includes("<ellipse"), id + ": empty illustration");
 assert(!svg.includes("<script"), id + ": executable image code");
}
const batch05Ids = [...read("js/ui/nature-illustrations-batch05.js").matchAll(/\bemne_(?:flora|fauna)_[a-z0-9_]+(?=\s*:)/g)].map(match => match[0]);
assert.equal(batch05Ids.length, 30, "expected exactly 30 new species in batch 05");
const batch06Ids = [...read("js/ui/nature-illustrations-batch06.js").matchAll(/\bemne_(?:flora|fauna)_[a-z0-9_]+(?=\s*:)/g)].map(match => match[0]);
assert.equal(batch06Ids.length, 30, "expected exactly 30 new motifs in batch 06");
assert.equal(batch06Ids.filter(id => id.startsWith("emne_fauna_")).length, 15);
assert.equal(batch06Ids.filter(id => id.startsWith("emne_flora_")).length, 15);
const batch07Ids = [...read("js/ui/nature-illustrations-batch07.js").matchAll(/\bemne_(?:flora|fauna)_[a-z0-9_]+(?=\s*:)/g)].map(match => match[0]);
assert.equal(batch07Ids.length, 30, "expected 30 new motifs in batch 07");
assert.equal(batch07Ids.filter(id => id.startsWith("emne_fauna_")).length, 15);
assert.equal(batch07Ids.filter(id => id.startsWith("emne_flora_")).length, 15);
for (const id of batch07Ids) assert(decodeURIComponent(artist.resolve(id).split(",")[1]).length < 100_000, id + ": oversized mobile SVG");
const batch08Ids = [...read("js/ui/nature-illustrations-batch08.js").matchAll(/\bemne_(?:flora|fauna)_[a-z0-9_]+(?=\s*:)/g)].map(match => match[0]);
assert.equal(batch08Ids.length, 30, "expected 30 new motifs in batch 08");
assert.equal(new Set(batch08Ids).size, 30, "batch 08 must not repeat an illustration ID");
assert.equal(batch08Ids.filter(id => id.startsWith("emne_fauna_")).length, 15);
assert.equal(batch08Ids.filter(id => id.startsWith("emne_flora_")).length, 15);
for (const id of batch08Ids) {
 const svg = decodeURIComponent(artist.resolve(id).split(",")[1]);
 assert(svg.length < 100_000, id + ": oversized mobile SVG");
 assert(svg.includes('width="600" height="420"'), id + ": unexpected SVG dimensions");
}
for (const id of batch05Ids) {
 const drawing = decodeURIComponent(artist.resolve(id).split(",")[1]);
 assert(drawing.length < 100_000, id + ": oversized mobile SVG");
}
assert.equal(artist.resolve("unknown"), "");
assert.equal(new Set(references.map(id=>artist.resolve(id) )).size, 300, "illustration assets must be unique");
assert.match(read("js/ui/nature-explorer.js"), /const art=drawings\?\.resolve/, "illustrations must take display priority");
assert.equal(references.filter(id => id.startsWith("emne_fauna_")).length, 150);
assert.equal(references.filter(id => !id.startsWith("emne_fauna_")).length, 150);
for (const kind of ["flora", "fauna"]) {
 const html=read("finn-" + kind + ".html");
 assert(html.includes("js/ui/nature-illustrations.js"));
 assert(html.includes("js/ui/nature-illustrations-batch03.js"));
 assert(html.includes("js/ui/nature-illustrations-batch04.js"));
 assert(html.includes("js/ui/nature-illustrations-batch05.js"));
 assert(html.includes("js/ui/nature-illustrations-batch06.js"));
 assert(html.includes("js/ui/nature-illustrations-batch07.js"));
 assert(html.includes("js/ui/nature-illustrations-batch08.js"));
 assert(html.includes("js/ui/nature-illustrations-batch09.js"));
 assert(html.includes("js/ui/nature-illustrations-batch10.js"));
 assert(html.includes("data-filter=\"illustrated\""));
 assert(html.indexOf("nature-illustrations.js") < html.indexOf("nature-illustrations-batch03.js"));
 assert(html.indexOf("nature-illustrations-batch03.js") < html.indexOf("nature-illustrations-batch04.js"));
 assert(html.indexOf("nature-illustrations-batch04.js") < html.indexOf("nature-illustrations-batch05.js"));
 assert(html.indexOf("nature-illustrations-batch05.js") < html.indexOf("nature-illustrations-batch06.js"));
 assert(html.indexOf("nature-illustrations-batch06.js") < html.indexOf("nature-illustrations-batch07.js"));
 assert(html.indexOf("nature-illustrations-batch07.js") < html.indexOf("nature-illustrations-batch08.js"));
 assert(html.indexOf("nature-illustrations-batch08.js") < html.indexOf("nature-illustrations-batch09.js"));
 assert(html.indexOf("nature-illustrations-batch09.js") < html.indexOf("nature-illustrations-batch10.js"));
 assert(html.indexOf("nature-illustrations-batch10.js") < html.indexOf("nature-explorer.js"));
}
const batch09Ids = [...read("js/ui/nature-illustrations-batch09.js").matchAll(/\bemne_(?:flora|fauna|kratt|gress|siv|ror|urt)_[\p{L}0-9_]+(?=\s*:)/gu)].map(m=>m[0]);
assert.equal(batch09Ids.length, 30, "expected exactly 30 new species in batch 09");
assert.equal(new Set(batch09Ids).size, 30, "batch 09 must not repeat an ID");
assert.equal(batch09Ids.filter(id => id.startsWith("emne_fauna_")).length, 15, "expected 15 fauna");
assert.equal(batch09Ids.filter(id => !id.startsWith("emne_fauna_")).length, 15, "expected 15 flora");
for (const id of batch09Ids) {
 assert(ids.has(id), "batch 09 references unknown catalogue entry: " + id);
 const svg = decodeURIComponent(artist.resolve(id).split(",")[1]);
 assert(svg.length < 100_000, id + ": oversized mobile SVG");
 assert(svg.includes('width="600" height="420"'), id + ": unexpected SVG dimensions");
 assert(!/<(?:script|foreignObject|image|use)\b/i.test(svg), id + ": unsafe embedded content");
}
const batch10Ids = [...read("js/ui/nature-illustrations-batch10.js").matchAll(/\bemne_(?:flora|fauna|kratt|gress|siv|ror|urt|starr)_[\p{L}0-9_]+(?=\s*:)/gu)].map(match=>match[0]);
assert.equal(batch10Ids.length,30,"expected exactly 30 illustrations in batch 10");
assert.equal(new Set(batch10Ids).size,30,"duplicate batch10 species ID");
assert.equal(batch10Ids.filter(id=>id.startsWith("emne_fauna_")).length,15,"expected 15 fauna");
assert.equal(batch10Ids.filter(id=>!id.startsWith("emne_fauna_")).length,15,"expected 15 flora");
for (const id of batch10Ids) {
 assert(ids.has(id), "batch10 species not in catalogue: "+id);
 const svg=decodeURIComponent(artist.resolve(id).split(",")[1]);
 assert(svg.length < 100_000, id+": oversized illustration");
 assert(svg.includes('width="600" height="420"'),id+": unexpected image dimensions");
 assert(!/<(?:script|foreignObject|image|use)\b/i.test(svg),id+": embedded unsafe element");
}
console.log("Nature atlas illustrations: 300/300 referenced and renderable; both pages wired.");
