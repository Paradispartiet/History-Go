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
 ["emne_flora_markjordbaer","Fragaria vesca"],
 ["emne_flora_tveskjeggveronika","Veronica chamaedrys"],
 ["emne_flora_skogfiol","Viola riviniana"],
 ["emne_flora_prikkperikum","Hypericum perforatum"],
 ["emne_flora_reinfann","Tanacetum vulgare"],
 ["emne_flora_rodtvetann","Lamium purpureum"],
 ["emne_flora_smalkjempe","Plantago lanceolata"],
 ["emne_flora_gulmaure","Galium verum"],
 ["emne_flora_penstorkenebb","Geranium robertianum"],
 ["emne_flora_vassarve","Stellaria media"],
 ["emne_flora_krypsoleie","Ranunculus repens"],
 ["emne_flora_snoklokke","Galanthus nivalis"],
 ["emne_flora_humleblom","Geum urbanum"],
 ["emne_flora_jordreve","Glechoma hederacea"],
 ["emne_flora_gjetertaske","Capsella bursa-pastoris"],
 ["emne_flora_rodknapp","Knautia arvensis"],
 ["emne_flora_smaengkall","Rhinanthus minor"],
 ["emne_flora_rosslyng","Calluna vulgaris"],
 ["emne_flora_prikktvetann","Lamium maculatum"],
 ["emne_flora_kattefot","Antennaria dioica"],
 ["emne_flora_firkantperikum","Hypericum maculatum"],
 ["emne_flora_varkaal","Ficaria verna"],
 ["emne_flora_russblaastjerne","Scilla siberica"],
 ["emne_flora_varerteknapp","Lathyrus vernus"]
];
assert.equal(photos.count,53);
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
assert(explorer.indexOf('if(art&&kind==="flora")return')<explorer.indexOf('if(documented)return'),"approved flora illustrations must take priority over photos");
assert.match(explorer,/fallbackInfo:documented\|\|null/,"illustrations must fall back to documented photos");
assert(explorer.includes('window.HG_NATURE_FLORA_APPROVED'), 'flora publication requires explicit approved-image registry');
assert(explorer.includes('kind==="flora" ? approvedFloraIllustrations?.get(id)?.src : drawings?.resolve(id)'), 'flora never falls through to an unapproved drawing');
assert.match(explorer,/kind==="flora"\?"Bilde utilgjengelig":icon/,"unavailable flora media must show a neutral placeholder");
assert.match(explorer,/photoCredit\(source\.fallbackInfo,true\)/,"fallback photo must preserve attribution");
assert.match(explorer,/classList\.add\("ne-transparent-art"\)/,"accepted flora art needs transparent treatment");
assert.match(explorer,/classList\.remove\("ne-transparent-art"\)/,"photo fallback must restore normal image styling");
assert.match(explorer,/else if\(kind==="flora"\) image\.appendChild/,"missing photos must not display generic species drawings");
assert.match(explorer,/if\(!usingFallback&&source\.fallback\)/,"approved illustration failures must support photo fallback");
assert.match(explorer,/info\.creator/,"photo credit missing");
assert.match(explorer,/photoCredit\(imageInfo\)/,"photo credit must be used for primary photographs");
assert.match(explorer,/info\.licenseUrl/,"license link missing");
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

// Batch 4: Commons file names and 640px thumbnail directory must agree.
// Source pages, photographer and chosen license have also been checked
// against Wikimedia Commons file-description pages.
const batch4Ids=["emne_flora_tveskjeggveronika","emne_flora_skogfiol","emne_flora_prikkperikum","emne_flora_reinfann","emne_flora_rodtvetann","emne_flora_smalkjempe","emne_flora_gulmaure","emne_flora_penstorkenebb","emne_flora_vassarve","emne_flora_krypsoleie"];
for (const id of batch4Ids) {
 const photo=photos.get(id);
 const name=decodeURIComponent(photo.source.split("/wiki/File:")[1]).replace(/ /g,"_");
 const hash=createHash("md5").update(name).digest("hex");
 const encoded=encodeURIComponent(name);
 assert.equal(photo.src,
  `https://upload.wikimedia.org/wikipedia/commons/thumb/${hash[0]}/${hash.slice(0,2)}/${encoded}/640px-${encoded}`,
  "bad Wikimedia thumbnail URL: "+id);
}

// Batch 5 – 13 Commons-verified source photos, with matching art names and
// licensing metadata. Check source-file hash as well as 640px path.
const batch5Ids=["emne_flora_snoklokke","emne_flora_humleblom","emne_flora_jordreve","emne_flora_gjetertaske","emne_flora_rodknapp","emne_flora_smaengkall","emne_flora_rosslyng","emne_flora_prikktvetann","emne_flora_kattefot","emne_flora_firkantperikum","emne_flora_varkaal","emne_flora_russblaastjerne","emne_flora_varerteknapp"];
for (const id of batch5Ids) {
 const photo=photos.get(id);
 const file=decodeURIComponent(photo.source.split("/wiki/File:")[1]).replace(/ /g,"_");
 const digest=createHash("md5").update(file).digest("hex");
 const encoded=encodeURIComponent(file);
 assert.equal(photo.src,
  `https://upload.wikimedia.org/wikipedia/commons/thumb/${digest[0]}/${digest.slice(0,2)}/${encoded}/640px-${encoded}`,
  "invalid Commons image path: "+id);
 assert.ok(photo.creator && photo.license && photo.licenseUrl);
}
console.log("Flora photos: 53 sourced species, credits/licenses, SVG fallback and read-only UI OK.");
