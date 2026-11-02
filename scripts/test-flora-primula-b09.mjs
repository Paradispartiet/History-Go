import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import vm from "node:vm";
const root=new URL("../",import.meta.url),read=p=>fs.readFileSync(new URL(p,root),"utf8");
const catalog=JSON.parse(read("data/natur/flora/blomster.json"));
const runtime=JSON.parse(read("data/runtime/nature-all/flora-001.json")).flatMap(x=>x.kind==="emne_pack"?x.items:[x]);
const env={window:{}};vm.runInNewContext(read("js/ui/nature-flora-approved.js"),env);
const approved=env.window.HG_NATURE_FLORA_APPROVED;
assert.equal(approved.count,44);
for(const [id,latin,stem] of [["emne_flora_kusymre_marianokleblom","Primula vulgaris","kusymre"],["emne_flora_marianokleblom","Primula veris","marianokleblom"]]){
 const a=catalog.find(x=>x.id===id),r=runtime.find(x=>x.id===id);
 assert(a&&r);assert.equal(a.latin,latin);assert.equal(r.latin,latin);
 const d=JSON.parse(read("data/natur/flora/illustration-quality-"+stem+"-20261102.json")).items[0];
 assert.equal(d.catalogId,id);assert.equal(approved.get(id).src,d.src);
 const b=fs.readFileSync(new URL(d.src,root));
 assert.equal(b.length,d.sizeBytes);assert.equal(crypto.createHash("sha256").update(b).digest("hex"),d.sha256);
 const header=Buffer.from("blob "+b.length);
 assert.equal(crypto.createHash("sha1").update(Buffer.concat([header,Buffer.from([0]),b])).digest("hex"),d.gitBlobSha);
 assert.equal(b.toString("ascii",0,4),"RIFF");assert.equal(b.toString("ascii",8,12),"WEBP");
 assert.equal(b.toString("ascii",12,16),"VP8X");assert((b[20]&0x10)!==0);
 assert.deepEqual([1+b.readUIntLE(24,3),1+b.readUIntLE(27,3)],[1024,1536]);
}
assert.equal(catalog.find(x=>x.id==="emne_flora_kusymre_marianokleblom").quiz_ids[0],"quiz_nature_flora_kusymre_marianokleblom");
assert.deepEqual(catalog.find(x=>x.id==="emne_flora_marianokleblom").quiz_ids,[]);
assert(approved.get("emne_flora_krypveronika"));
assert(read("finn-flora.html").includes("nature-flora-approved.js?v=20261102-22"));
console.log("Two species, source hashes, alpha and 44 illustrated cards OK.");
