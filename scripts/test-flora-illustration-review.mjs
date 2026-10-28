import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const read = path => fs.readFileSync(new URL("../" + path, import.meta.url), "utf8");
const page=read("flora-illustration-review.html");
const script=read("js/ui/flora-illustration-review.js");
const explorer=read("js/ui/nature-explorer.js");
const css=read("css/nature-explorer.css");
const alphaImage=fs.readFileSync(new URL("../bilder/natur/flora/hvitveis-transparent.webp",import.meta.url));
assert.equal(alphaImage.toString("ascii",0,4),"RIFF","missing RIFF image header");
assert.equal(alphaImage.toString("ascii",8,12),"WEBP","not a WebP image");
assert.equal(alphaImage.toString("ascii",12,16),"VP8X","asset must use VP8X for alpha");
assert.equal(alphaImage[20]&0x10,0x10,"WebP must contain an alpha channel");
assert(alphaImage.length<400_000,"illustration too large for mobile");
assert.match(css,/body\[data-nature-kind="flora"\] \.ne-photo img\{background:transparent\}/,"flora drawings must not have a white background");
assert.match(css,/body\[data-nature-kind="flora"\] \.ne-dialog-image\{background:transparent\}/);
assert.match(script,/emne_flora_hvitveis: "bilder\/natur\/flora\/hvitveis-transparent\.webp"/);
assert.match(script,/transparency-preview/);

const workflow=read(".github/workflows/nature-illustrations.yml");
new vm.Script(script, {filename:"flora-illustration-review.js"});
assert(page.includes('src="js/ui/flora-illustration-review.js"'));
assert(page.includes('src="js/ui/nature-flora-photographs.js"'));
assert(page.indexOf("nature-flora-photographs.js") < page.indexOf("flora-illustration-review.js"));
for(const id of ["query","filter","summary","gallery","export","more"])assert(page.includes('id="'+id+'"'),"missing review control: "+id);
for(const value of ["pending","redraw","candidate"])assert(page.includes('value="'+value+'"'),"missing status: "+value);
for(const phrase of [
  "hg_flora_visual_review_v1",
  "illustrationApi.resolve(id)",
  "photoApi?.get(id)",
  "compare",
  "evidenceValid(r)",
  "const payload=",
  "localStorage.setItem(KEY",
  "JSON.stringify(payload,null,2)",
  "never a published approval list"
])assert(script.includes(phrase),"missing review behavior: "+phrase);
assert(!script.includes("hg_nature_unlocks_v2"),"visual review must never touch collection status");
assert(!script.includes("HG_NATURE_FLORA_APPROVED"),"review page must never publish approved art");
assert.match(explorer,/const approvedFloraIllustrations = new Set\(\);/,"production must still hide all unapproved art");
assert(workflow.includes("node scripts/test-flora-illustration-review.mjs"),"CI must validate review gallery");
const sandbox={window:{}};
const sources=[
 "nature-illustrations.js","nature-illustrations-batch03.js","nature-illustrations-batch04.js",
 "nature-illustrations-batch05.js","nature-illustrations-batch06.js","nature-illustrations-batch07.js",
 "nature-illustrations-batch08.js","nature-illustrations-batch09.js","nature-illustrations-batch10.js",
 "nature-illustrations-batch11.js","nature-botanical-studies.js","nature-flora-photographs.js"
];
for(const file of sources)vm.runInNewContext(read("js/ui/"+file),sandbox,{timeout:3000,filename:file});
const artist=sandbox.window.HG_NATURE_ILLUSTRATIONS;
const photos=sandbox.window.HG_NATURE_FLORA_PHOTOS;
const manifest=JSON.parse(read("data/runtime/nature-all.json"));
const flora=manifest.groups.flora.flatMap(file=>JSON.parse(read(file)))
.flatMap(item=>item.kind==="emne_pack"?item.items:[item]);
const illustrated=flora.filter(entry=>artist.has(entry.id));
assert.equal(illustrated.length,165,"gallery should show 165 originally illustrated flora taxa");
assert.equal(new Set(illustrated.map(x=>x.id)).size,165,"duplicate taxa in review");
assert.equal(photos.count,53,"review reference registry count has changed");
const photographed=illustrated.filter(x=>photos.get(x.id));
assert(photographed.length>=35,"too few artsphoto comparisons");
for(const entry of photographed){
 const p=photos.get(entry.id);
 assert(p.creator&&p.license&&p.source.startsWith("https://commons.wikimedia.org/wiki/File:"),
  "photo provenance missing: "+entry.id);
}
console.log("Flora review gallery: 165 taxa, source comparisons, local-only assessment, no release approvals.");
