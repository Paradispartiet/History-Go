import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=(path)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
test("fauna and flora are linked from welcome and shared header",()=>{
 const welcome=read("js/ui/onboarding-welcome.js"),menu=read("js/ui/header-menu.js");
 for(const kind of ["fauna","flora"]){
  assert.match(welcome,new RegExp('href="finn-'+kind+'\\.html"'));
  assert.match(menu,new RegExp('href: "finn-'+kind+'\\.html"'));
  assert.match(read("finn-"+kind+".html"),new RegExp('data-nature-kind="'+kind+'"'));
 }
});
test("explorers use canonical nature shards and only read quiz unlock state",()=>{
 const source=read("js/ui/nature-explorer.js");
 assert.match(source,/data\/runtime\/nature-all\.json/);
 assert.match(source,/hg_nature_unlocks_v2/);
 assert.match(source,/localStorage\.getItem/);
 assert.doesNotMatch(source,/localStorage\.setItem|recordFromQuiz\(/);
 assert.match(source,/new Set/);
});
test("each explorer provides back navigation, search, menu and collection filter",()=>{
 for(const kind of ["fauna","flora"]){
  const html=read("finn-"+kind+".html");
  for(const id of ["natureBack","natureMenuToggle","natureSearch","natureGrid","natureDialog","natureMore"])
   assert.match(html,new RegExp('id="'+id+'"'));
  assert.match(html,/data-filter="collected"/);
 }
});
