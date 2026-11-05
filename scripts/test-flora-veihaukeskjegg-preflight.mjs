import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const read=p=>fs.readFileSync(new URL("../"+p,import.meta.url),"utf8");
const q=JSON.parse(read("data/natur/flora/illustration-quality-veihaukeskjegg-20261103.json"));
const a=q.items[0];
assert.equal(q.baselineApproved,68);
assert.equal(q.approvedCountAfterRelease,69);
assert.equal(a.catalogId,"emne_flora_veihaukeskjegg");
assert.equal(a.scientificName,"Crepis tectorum");
assert.equal(a.existingQuizId,"quiz_nature_flora_veihaukeskjegg");
for(const records of ["data/natur/flora/blomster.json","data/runtime/nature-all/flora-001.json"]){
 const r=JSON.parse(read(records)).flatMap(x=>x.kind==="emne_pack"?x.items:[x]);
 const entry=r.find(x=>x.id===a.catalogId);
 assert(entry,"Missing canonical Veihaukeskjegg species in "+records);
 assert.equal(entry.latin,a.scientificName);
 assert.equal(entry.title,a.name);
 assert(entry.quiz_ids?.includes(a.existingQuizId));
}
const env={window:{}};
vm.runInNewContext(read("js/ui/nature-flora-approved.js"),env,{timeout:2000});
assert(env.window.HG_NATURE_FLORA_APPROVED.count>=68,"Existing approved flora images must remain unchanged");
assert(a.sourceReferences.length>=2);
console.log("Veihaukeskjegg #69: species, quiz identity and baseline preserved; image QA pending.");
