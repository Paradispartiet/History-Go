import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const read=path=>fs.readFileSync(new URL("../"+path,import.meta.url),"utf8");
const sandbox={window:{}};
vm.runInNewContext(read("js/ui/nature-flora-photographs.js"),sandbox);
const photos=sandbox.window.HG_NATURE_FLORA_PHOTOS;
const expected=[
 ["emne_flora_enghumleblom","Geum rivale"],
 ["emne_flora_engkarse","Cardamine pratensis"],
 ["emne_flora_engknoppurt","Centaurea jacea"],
 ["emne_flora_engsmelle","Silene vulgaris"],
 ["emne_flora_engsoleie","Ranunculus acris"],
 ["emne_flora_engtjaereblom","Viscaria vulgaris"],
 ["emne_flora_prestekrage","Leucanthemum vulgare"],
 ["emne_flora_balderbra","Tripleurospermum inodorum"]
];
assert.equal(photos.count,8);
const urls=new Set();
const illustrations=[
 "nature-illustrations.js","nature-illustrations-batch03.js",
 "nature-illustrations-batch04.js","nature-illustrations-batch05.js",
 "nature-illustrations-batch06.js"
].map(name=>read("js/ui/"+name)).join("\n");
for(const [id,taxon] of expected){
 const p=photos.get(id);
 assert.ok(p,"missing documented photo for "+id);
 assert.equal(p.scientificName,taxon);
 assert.ok(p.creator.length>2&&p.license.startsWith("CC BY-SA"));
 assert.match(p.source,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
 assert.match(p.src,/^https:\/\/commons\.wikimedia\.org\/wiki\/Special:FilePath\//);
 assert.match(p.licenseUrl,/^https:\/\/creativecommons\.org\/licenses\//);
 assert(!urls.has(p.source),"duplicate species file "+p.source);
 urls.add(p.source);
 assert(illustrations.includes(id),"photo species must have an existing drawing fallback: "+id);
}
assert.equal(photos.get("emne_flora_other"),null);
const explorer=read("js/ui/nature-explorer.js");
assert(explorer.indexOf("const documented = floraPhotos?.get")<explorer.indexOf('if(art)return {src:art,type:"illustration"}'),"documented photos must take priority");
assert.match(explorer,/if\(!usingFallback&&source\.fallback\)/,"photo failures must fall back to existing SVG");
assert.match(explorer,/imageInfo\.creator/,"photo credit missing");
assert.match(explorer,/imageInfo\.licenseUrl/,"license link missing");
assert(!explorer.includes("localStorage.setItem"),"photo display must not touch collection progress");
const flora=read("finn-flora.html"),fauna=read("finn-fauna.html");
assert(flora.includes('js/ui/nature-flora-photographs.js'),"photo registry not loaded");
assert(flora.indexOf("nature-flora-photographs.js")<flora.indexOf("nature-explorer.js"),"registry must load first");
assert(!fauna.includes("nature-flora-photographs.js"),"flora photo registry must not affect fauna");
console.log("Flora photo pilot: 8 sourced species, 8 credits/licenses, SVG fallback and read-only UI OK.");
