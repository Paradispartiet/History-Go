import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import vm from "node:vm";

const read = p => fs.readFileSync(new URL("../" + p, import.meta.url), "utf8");
const review = JSON.parse(read("data/natur/flora/illustration-quality-review-20261028.json"));
const env = {window:{}};
vm.runInNewContext(read("js/ui/nature-flora-approved.js"), env, {timeout:2000});
const approved = env.window.HG_NATURE_FLORA_APPROVED;
assert.equal(approved.count,1,"only one species is released in this first pilot");
assert.equal(approved.has("emne_flora_hestehov"),true);
assert.equal(approved.has("emne_flora_engkarse"),false);
assert.equal(approved.has("emne_flora_ballblom"),false);

const src = approved.get("emne_flora_hestehov");
const item = review.species.find(p=>p.catalogId==="emne_flora_hestehov");
assert(src && item && item.approvedForPublication && item.botanicalReview==="passed" && item.visualReview==="passed");
assert.equal(src.scientificName,item.scientificName);
assert.equal(src.src,item.candidate);
assert.equal(src.gitBlobSha,item.candidateGitBlobSha);
assert(item.references.length>=2);
assert(item.visualChecks.alpha && item.visualChecks.blackBackground && item.visualChecks.morphology);
assert(!item.visualChecks.interactiveBrowserQa,"do not imply browser QA happened when it has not");
for(const id of ["emne_flora_engkarse","emne_flora_ballblom"]){
  const decision=review.species.find(x=>x.catalogId===id);
  assert(decision && !decision.approvedForPublication && decision.botanicalReview==="needs_redraw");
}
const bin=fs.readFileSync(new URL("../"+src.src,import.meta.url));
assert.equal(bin.toString("ascii",0,4),"RIFF");
assert.equal(bin.toString("ascii",8,12),"WEBP");
assert.equal(bin.toString("ascii",12,16),"VP8X");
assert((bin[20]&0x10)!==0,"missing true alpha channel");
assert.equal(crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob "+bin.length+"\\0"),bin])).digest("hex"),src.gitBlobSha);

const catalog=JSON.parse(read("data/runtime/nature-all/flora-001.json")).flatMap(x=>x.kind==="emne_pack"?x.items:[x]);
assert.equal(catalog.find(x=>x.id==="emne_flora_hestehov")?.latin,src.scientificName);
const html=read("finn-flora.html"),js=read("js/ui/nature-explorer.js"),css=read("css/nature-explorer.css");
assert(html.includes('src="js/ui/nature-flora-approved.js?v=20261028-1"'));
assert(html.indexOf("nature-flora-photographs.js")<html.indexOf("nature-flora-approved.js"));
assert(html.indexOf("nature-flora-approved.js")<html.indexOf("nature-explorer.js"));
assert(js.includes('const art=kind==="flora" ? approvedFloraIllustrations?.get(id)?.src : drawings?.resolve(id)'));
assert(js.includes('fallback:documented?.src||""'));
assert(js.includes('photoCredit(source.fallbackInfo,true)'));
assert(js.includes('wrap.firstChild.classList.add("ne-dialog-image")'));
assert(css.includes('.ne-art-transparent-stage{background:#080908!important}'));
assert(css.includes('.ne-transparent-art{object-fit:contain!important;background:transparent!important}'));
assert(css.includes('@media(max-width:520px)') && css.includes('.ne-dialog'));
assert(!js.includes("localStorage.setItem"),"atlas remains read-only");
console.log("Flora first release: Hestehov approved, SHA/alpha verified, two redraws blocked, photo fallback and mobile/desktop CSS intact.");
