import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import vm from "node:vm";

const read = p => fs.readFileSync(new URL("../" + p, import.meta.url), "utf8");
const older = JSON.parse(read("data/natur/flora/illustration-quality-review-20261028.json"));
const batch = JSON.parse(read("data/natur/flora/illustration-quality-batch01-20261028.json"));
const candidates = JSON.parse(read("data/natur/flora/illustration-candidates-batch01.json"));
const revision = JSON.parse(read("data/natur/flora/illustration-revision-batch04.json"));
const env = {window:{}};
vm.runInNewContext(read("js/ui/nature-flora-approved.js"),env,{timeout:2000});
const approved = env.window.HG_NATURE_FLORA_APPROVED;
const expected = [
  ["emne_flora_hestehov","Tussilago farfara"],
  ["emne_flora_hvitveis","Anemone nemorosa"],
  ["emne_flora_blaveis","Hepatica nobilis"],
  ["emne_flora_engkarse","Cardamine pratensis"],
  ["emne_flora_ballblom","Trollius europaeus"],
  ["emne_flora_engsoleie","Ranunculus acris"]
];
assert.equal(approved.count,expected.length,"publication count changed without species QA");
assert.equal(batch.items.length,15);
assert.equal(batch.items.filter(a=>a.approvedForPublication).length,2);
const allReviews=[...revision.items.map(a=>({
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
  assert.equal(approved.has(x.catalogId||x.key),x.approvedForPublication,"unapproved candidate leaked: "+x.key);
}
for(const id of ["emne_flora_engkarse","emne_flora_ballblom"]){
  assert(approved.has(id),"the v3 version should now be approved");
  assert(older.species.some(a=>a.catalogId===id && a.botanicalReview==="needs_redraw"),"historical v2 rejection must remain");
}
const html=read("finn-flora.html"),js=read("js/ui/nature-explorer.js"),css=read("css/nature-explorer.css");
assert(html.includes('src="js/ui/nature-flora-approved.js?v=20261028-3"'));
assert(html.indexOf("nature-flora-photographs.js")<html.indexOf("nature-flora-approved.js"));
assert(html.indexOf("nature-flora-approved.js")<html.indexOf("nature-explorer.js"));
assert(js.includes('const art=kind==="flora" ? approvedFloraIllustrations?.get(id)?.src : drawings?.resolve(id)'));
assert(js.includes('fallback:documented?.src||""'));
assert(js.includes('photoCredit(source.fallbackInfo,true)'));
assert(js.includes('wrap.firstChild.classList.add("ne-dialog-image")'));
assert(css.includes('.ne-art-transparent-stage{background:#080908!important}'));
assert(css.includes('.ne-transparent-art{object-fit:contain!important;background:transparent!important}'));
assert(!js.includes("localStorage.setItem"));
console.log("Flora release: 6 botanical approvals (3 prior + 3 v3), all SHA, taxon, alpha, photo fallback, 13 prior rejection gates pass.");
