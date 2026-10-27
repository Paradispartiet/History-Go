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
 ["emne_flora_balderbra","Tripleurospermum inodorum"],
 ["emne_flora_ballblom","Trollius europaeus"],
 ["emne_flora_bekkeblom","Caltha palustris"],
 ["emne_flora_bergmynte","Origanum vulgare"],
 ["emne_flora_bitterbergknapp","Sedum acre"],
 ["emne_flora_blaknapp","Succisa pratensis"],
 ["emne_flora_blaveis","Hepatica nobilis"],
 ["emne_flora_blodstorkenebb","Geranium sanguineum"],
 ["emne_flora_burot","Artemisia vulgaris"],
 ["emne_flora_geitrams","Chamerion angustifolium"],
 ["emne_flora_hestehov","Tussilago farfara"],
 ["emne_flora_hvitveis","Anemone nemorosa"],
 ["emne_flora_rodkløver","Trifolium pratense"],
 ["emne_flora_tiriltunge","Lotus corniculatus"],
 ["emne_flora_hvitklover","Trifolium repens"],
 ["emne_flora_hvittvetann","Lamium album"],
 ["emne_flora_rodjonsokblom","Silene dioica"],
 ["emne_flora_hvitbergknapp","Sedum album"],
 ["emne_flora_groblad","Plantago major"],
 ["emne_flora_ormehode","Echium vulgare"],
 ["emne_flora_skogstorkenebb","Geranium sylvaticum"],
 ["emne_flora_gullstjerne","Gagea lutea"],
 ["emne_flora_markjordbaer","Fragaria vesca"]
];
assert.equal(photos.count,30);
const urls=new Set();
const illustrations=[
 "nature-illustrations.js","nature-illustrations-batch03.js",
 "nature-illustrations-batch04.js","nature-illustrations-batch05.js",
 "nature-illustrations-batch06.js",
 "nature-illustrations-batch07.js","nature-illustrations-batch08.js",
 "nature-illustrations-batch09.js","nature-illustrations-batch10.js",
 "nature-illustrations-batch11.js"
].map(name=>read("js/ui/"+name)).join("\n");
for(const [id,taxon] of expected){
 const p=photos.get(id);
 assert.ok(p,"missing documented photo for "+id);
 assert.equal(p.scientificName,taxon);
 assert.ok(p.creator.length>2&&/^CC BY(?:-SA)? /.test(p.license));
 assert.match(p.source,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
 assert.match(p.src,/^https:\/\/(?:upload|thumb)\.wikimedia\.org\/wikipedia\/commons\//);
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

// Batch 3: Verify that each recorded media URL is in the MediaWiki file's
// content-addressed directory. Existing pilot entries retain their prior contract.
import { createHash } from "node:crypto";
const batch3Ids=["emne_flora_hvitveis","emne_flora_rodkløver","emne_flora_tiriltunge","emne_flora_hvitklover","emne_flora_hvittvetann","emne_flora_rodjonsokblom","emne_flora_hvitbergknapp","emne_flora_groblad","emne_flora_ormehode","emne_flora_skogstorkenebb","emne_flora_gullstjerne","emne_flora_markjordbaer"];
for (const id of batch3Ids) {
 const photo=photos.get(id);
 const filename=decodeURIComponent(photo.source.split("/wiki/File:")[1]);
 const normalized=filename.replace(/ /g,"_");
 const hash=createHash("md5").update(normalized).digest("hex");
 const encoded=encodeURIComponent(normalized);
 assert.equal(
  photo.src,
  `https://upload.wikimedia.org/wikipedia/commons/thumb/${hash[0]}/${hash.slice(0,2)}/${encoded}/960px-${encoded}`,
  "invalid source hash or filename for "+id
 );
}

console.log("Flora photos: 30 sourced species, 30 credits/licenses, SVG fallback and read-only UI OK.");
