import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import vm from "node:vm";

const read = p => fs.readFileSync(new URL("../" + p, import.meta.url), "utf8");
const older = JSON.parse(read("data/natur/flora/illustration-quality-review-20261028.json"));
const batch = JSON.parse(read("data/natur/flora/illustration-quality-batch01-20261028.json"));
const candidates = JSON.parse(read("data/natur/flora/illustration-candidates-batch01.json"));
const revision = JSON.parse(read("data/natur/flora/illustration-revision-batch04.json"));
const review06 = JSON.parse(read("data/natur/flora/illustration-quality-batch06-20261028.json"));
const review05 = JSON.parse(read("data/natur/flora/illustration-quality-batch05-20261028.json"));
const pending05 = JSON.parse(read("data/natur/flora/illustration-revision-batch05.json"));
const env = {window:{}};
vm.runInNewContext(read("js/ui/nature-flora-approved.js"),env,{timeout:2000});
const approved = env.window.HG_NATURE_FLORA_APPROVED;
const expected = [
  ["emne_flora_hestehov","Tussilago farfara"],
  ["emne_flora_hvitveis","Anemone nemorosa"],
  ["emne_flora_blaveis","Hepatica nobilis"],
  ["emne_flora_engkarse","Cardamine pratensis"],
  ["emne_flora_ballblom","Trollius europaeus"],
  ["emne_flora_engsoleie","Ranunculus acris"],
  ["emne_flora_lovetann","Taraxacum officinale agg."],
  ["emne_flora_rodjonsokblom","Silene dioica"],
  ["emne_flora_prestekrage","Leucanthemum vulgare"],
  ["emne_flora_geitrams","Chamerion angustifolium"],
  ["emne_flora_groblad","Plantago major"]
];
assert.equal(approved.count,expected.length,"publication count changed without species QA");
assert.equal(batch.items.length,15);
assert.equal(batch.items.filter(a=>a.approvedForPublication).length,2);
const allReviews=[...review06.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...review05.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...revision.items.map(a=>({
  ...a,catalogId:a.id,candidate:a.newSrc,candidateGitBlobSha:a.newGitBlobSha,
  approvedForPublication:a.productionApproval,reviewStatus:a.botanicalVisualDecision==="passed"?"approved":"pending",
  visualChecks:{transparent:true,blackBackgroundReviewed:true},evidence:a.sourceReferences
})),...older.species,...batch.items];
const catalog=JSON.parse(read("data/runtime/nature-all/flora-001.json"))
  .flatMap(a=>a.kind==="emne_pack"?a.items:[a]);
const photographed={window:{}};
vm.runInNewContext(read("js/ui/nature-flora-photographs.js"),photographed,{timeout:2000});
for(const [id,latin] of expected){
  const asset=approved.get(id);
  const entry=allReviews.find(a=>a.catalogId===id);
  assert(asset && entry && entry.approvedForPublication,"missing approved evidence: "+id);
  assert.equal(asset.scientificName,latin);
  assert.equal(entry.scientificName,latin);
  assert.equal(asset.src,entry.candidate);
  assert.equal(asset.gitBlobSha,entry.candidateGitBlobSha||entry.gitBlobSha);
  if(id==="emne_flora_hestehov"){
    assert.equal(entry.botanicalReview,"passed");
    assert.equal(entry.visualReview,"passed");
    assert(entry.visualChecks.alpha && entry.visualChecks.blackBackground);
  }else{
    assert.equal(entry.reviewStatus,"approved");
    assert(entry.visualChecks.transparent && entry.visualChecks.blackBackgroundReviewed);
  }
  assert((entry.references||entry.evidence).length>=2,"missing botanical evidence");
  assert.equal(catalog.find(x=>x.id===id)?.latin,latin,"catalog mismatch: "+id);
  assert(photographed.window.HG_NATURE_FLORA_PHOTOS.get(id),"approved illustration must have licensed photo fallback");
  const bin=fs.readFileSync(new URL("../"+asset.src,import.meta.url));
  assert(bin.length>15000,"empty image");
  assert.equal(bin.toString("ascii",0,4),"RIFF");
  assert.equal(bin.toString("ascii",8,12),"WEBP");
  assert.equal(bin.toString("ascii",12,16),"VP8X");
  assert((bin[20]&0x10)!==0,"missing alpha channel: "+id);
  const hash=crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob "+bin.length+"\0"),bin])).digest("hex");
  assert.equal(hash,asset.gitBlobSha,"approved image changed: "+id);
}
for(const x of batch.items){
  const source=candidates.items.find(a=>a.key===x.key);
  assert(source && source.gitBlobSha===x.gitBlobSha);
  assert.equal(approved.get(x.catalogId||x.key)?.src===x.candidate,x.approvedForPublication,"unapproved historical image leaked: "+x.key);
}
for(const id of ["emne_flora_engkarse","emne_flora_ballblom"]){
  assert(approved.has(id),"the v3 version should now be approved");
  assert(older.species.some(a=>a.catalogId===id && a.botanicalReview==="needs_redraw"),"historical v2 rejection must remain");
}
const html=read("finn-flora.html"),js=read("js/ui/nature-explorer.js"),css=read("css/nature-explorer.css");
assert(html.includes('src="js/ui/nature-flora-approved.js?v=20261028-5"'));
assert(html.indexOf("nature-flora-photographs.js")<html.indexOf("nature-flora-approved.js"));
assert(html.indexOf("nature-flora-approved.js")<html.indexOf("nature-explorer.js"));
assert(js.includes('const art=kind==="flora" ? approvedFloraIllustrations?.get(id)?.src : drawings?.resolve(id)'));
assert(js.includes('fallback:documented?.src||""'));
assert(js.includes('photoCredit(source.fallbackInfo,true)'));
assert(js.includes('wrap.firstChild.classList.add("ne-dialog-image")'));
assert(css.includes('.ne-art-transparent-stage{background:#080908!important}'));
assert(css.includes('.ne-transparent-art{object-fit:contain!important;background:transparent!important}'));
assert(!js.includes("localStorage.setItem"));
// Batch 05 documents rejected artwork only; it must never make images live.
assert.equal(pending05.batch,"05");
assert.equal(pending05.approvedForPublication,false);
assert.equal(pending05.originalApprovedSpeciesCount,6);
assert.equal(pending05.items.length,4);
for(const x of pending05.items){
  const previous=batch.items.find(a=>a.key===x.key);
  const manifest=candidates.items.find(a=>a.key===x.key);
  assert(previous && manifest,"missing historical candidate: "+x.key);
  assert.equal(previous.reviewStatus,"needs_redraw","historical rejection changed: "+x.key);
  assert.equal(x.releaseStatus,"needs_redraw");
  assert.equal(x.visualReview,"failed_morphology");
  assert.equal(x.newAssetSrc,null);
  assert.equal(x.src,previous.candidate);
  assert.equal(x.gitBlobSha,manifest.gitBlobSha);
  assert(x.requiredRedraw.length>=3 && x.sourceReferences.length>=1);
  assert.notEqual(approved.get(x.catalogId)?.src,x.src,"historical rejected batch 05 image leaked: "+x.catalogId);
  const bin=fs.readFileSync(new URL("../"+x.src,import.meta.url));
  const hash=crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob "+bin.length),Buffer.from([0]),bin])).digest("hex");
  assert.equal(hash,x.gitBlobSha,"reviewed original image changed: "+x.key);
}
const preview05=read("flora-illustrasjoner-bolk05.html");
for(const x of pending05.items)assert(preview05.includes(x.src),"review page missing: "+x.key);
assert(read("flora-illustration-review.html").includes('href="flora-illustrasjoner-bolk05.html"'));
console.log("Flora release: 11 botanical approvals (9 prior + 2 batch 06), all SHA, taxon, alpha, photo fallback, 13 prior rejection gates pass.");

assert(!approved.has("emne_flora_rodkløver"),"rejected red clover must not be published");
for(const x of review05.items){
 const b=fs.readFileSync(new URL("../"+x.src,import.meta.url));
 assert.equal(crypto.createHash("sha256").update(b).digest("hex"),x.sha256);
 assert.equal(b.length,x.sizeBytes);
 assert.deepEqual(x.dimensions,[1024,1536]);
 assert((b[20]&0x10)!==0);
 const w=1+b.readUIntLE(24,3),h=1+b.readUIntLE(27,3);
 assert.deepEqual([w,h],x.dimensions,"WebP dimensions differ");
 assert.equal(approved.get(x.catalogId)?.src===x.src,x.approvedForPublication);
 assert(x.observations.length>100 && x.sourceReferences.length>=2);
 assert(preview05.includes(x.src));
}
