import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const source=fs.readFileSync("js/ui/place-card.js","utf8");
const ids=["groruddammen","svartdalen","alnaparken","alna_bryn",
  "kvaernerbyen_alna","alna_utlop_bjorvika","voienfossen","myralokka",
  "vaterland_historisk_elvelop","vulkan_industriomrade","glads_molle","salt",
  "blaa","rockefeller","john_dee","sentrum_scene"];
const manifests=["natur","musikk","subkultur"];
const findCards=()=>manifests.flatMap(category=>{
 const manifest=JSON.parse(fs.readFileSync("data/quizcards/"+category+"/manifest.json","utf8"));
 assert.equal(manifest.categoryId,category);
 return manifest.collections.flatMap(name=>{
   const content=JSON.parse(fs.readFileSync(path.join("data/quizcards",category,name),"utf8"));
   return content.cards||[];
 });
});
test("Natur, Musikk and Subkultur card manifests are loaded through real PlaceCard resolver",()=>{
 for(const category of manifests)assert.ok(source.includes('"data/quizcards/'+category+'/manifest.json"'),"runtime resolver missing "+category);
 assert.match(source,/if \(typeof loader !== "function"\) \{\s*\/\/ Do not cache an empty collection forever/);
});
test("all sixteen picture-ready Oslo places have exactly ten fact questions linked by targetId",()=>{
 const cards=findCards();
 for(const id of ids){
   const match=cards.filter(card=>card.targetId===id);
   assert.equal(match.length,1,id+" must have exactly one canonical QuizCard");
   assert.equal(match[0].questions?.length,10,id+" must show ten quiz questions");
   assert.ok(match[0].questions.every(q=>String(q.question||"").trim()),id+" has an empty prompt");
   assert.ok(Array.isArray(match[0].answerKey)&&match[0].answerKey.length===10,id+" must preserve ten answers");
 }
});
