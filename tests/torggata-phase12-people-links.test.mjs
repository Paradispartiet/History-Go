import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const ROOT=process.cwd();
const readJson=rel=>JSON.parse(fs.readFileSync(path.join(ROOT,rel),"utf8"));
const rows=data=>Array.isArray(data)?data:(Array.isArray(data?.people)?data.people:(data?.id?[data]:[]));
const manifest=readJson("data/people/manifest.json");
const people=manifest.files.flatMap(rel=>rows(readJson(path.join("data",rel))));
const relations=readJson("data/relations.json");
const expected=[
  "thorvald_meyer","henrik_bull","christian_morgenstierne","arne_eide","thoger_binneballe","harald_olsen","alma_fahlstrom","johan_fahlstrom",
  "ludvig_christian_jensen","adelsten_jensen","peter_marinius_jensen","karl_a_jensen","thorvald_jensen","nanna_broch","wulff_becker","martin_heinz_zilsel",
  "alexander_claes","therese_hurwitz","jenny_hurwitz","fredrik_hurwitz","moritz_glott"
];
const requiredVisible=["henrik_bull","harald_olsen","alma_fahlstrom","johan_fahlstrom"];
const requiredHoldbacks=["thorvald_meyer","christian_morgenstierne","arne_eide","blitz_miljoet","christopher_nielsen","don_martin","gateavisa_miljoet","hariton_pushwagner","hausmania_miljoet","kjetil_rolness","oslo_graffiti_miljoet","oslo_skateboardmiljoet","radi_orakel","tommy_tee","warlocks_oslo","thoger_binneballe","ludvig_christian_jensen","adelsten_jensen","peter_marinius_jensen","karl_a_jensen","thorvald_jensen","nanna_broch","wulff_becker","martin_heinz_zilsel","alexander_claes","therese_hurwitz","jenny_hurwitz","fredrik_hurwitz","moritz_glott"];

function runtimePeopleForTorggata(){
  const source=fs.readFileSync(path.join(ROOT,"js/ui/popup-utils.js"),"utf8");
  const context={console,window:{PEOPLE:people,PLACES:[{id:"torggata",category:"by"}],RELATIONS:[]},document:{addEventListener(){},createElement(){return{}},body:{appendChild(){}},getElementById(){return null}},requestAnimationFrame(){},setTimeout,clearTimeout};
  context.globalThis=context;
  vm.createContext(context);
  vm.runInContext(source,context,{filename:"popup-utils.js"});
  return Array.from(context.getPeopleForPlace("torggata"));
}

test("phase 12 keeps all 21 canonical Torggata people unique, linked and sourced",()=>{
  const occurrences=new Map();
  for(const p of people){const id=String(p?.id||"").trim();if(!id)continue;const list=occurrences.get(id)||[];list.push(p);occurrences.set(id,list)}
  for(const id of expected){
    const list=occurrences.get(id)||[];
    assert.equal(list.length,1,`${id} must exist exactly once`);
    const p=list[0];
    const refs=[p.placeId,...(Array.isArray(p.places)?p.places:[])].map(String);
    assert.ok(refs.includes("torggata"),`${id} must remain Torggata-linked`);
    const urls=[...(Array.isArray(p.source_urls)?p.source_urls:[]),...(Array.isArray(p.externalLinks)?p.externalLinks.filter(x=>x?.type==="source"&&x?.url).map(x=>x.url):[])];
    assert.ok(urls.some(url=>/^https:\/\//.test(String(url))),`${id} must have an inspectable source`);
  }
});

test("every person visible in the finished Torggata People round is image-ready",()=>{
  const visible=runtimePeopleForTorggata();
  const ids=new Set(visible.map(p=>String(p?.id||"").trim()));
  for(const id of requiredVisible) assert.ok(ids.has(id),`${id} must remain visible`);
  for(const id of requiredHoldbacks) assert.equal(ids.has(id),false,`${id} must stay held back until image-ready`);
  for(const p of visible){
    assert.ok(String(p.image||"").trim(),`${p.id} visible without image`);
    assert.ok(String(p.cardImage||"").trim(),`${p.id} visible without cardImage`);
  }
});

test("all place-scoped People holdbacks preserve canonical linkage and explain the gate",()=>{
  const byId=new Map(people.map(p=>[String(p?.id||"").trim(),p]));
  for(const id of requiredHoldbacks){
    const p=byId.get(id); assert.ok(p,`${id} missing`);
    assert.ok(Array.isArray(p.roundHoldbacks)&&p.roundHoldbacks.map(String).includes("torggata"),`${id} must hold back Torggata round visibility`);
    assert.ok(String(p.roundHoldbackReason||"").length>=40,`${id} must explain the holdback`);
  }
});

test("Alexander Claes mismatch and Nanna Broch TIFF limitation are explicitly documented",()=>{
  const report=readJson("reports/place-production/torggata-phase12-people-links-audit-v1.json");
  assert.equal(report.image_review.rejected_identity.person_id,"alexander_claes");
  assert.equal(report.image_review.rejected_identity.reason,"WRONG_PERSON_MATCH");
  assert.equal(report.image_review.deferred_format.person_id,"nanna_broch");
  assert.equal(report.image_review.deferred_format.reason,"TIFF_NOT_BROWSER_READY_IN_CURRENT_APPLY_PIPELINE");
});

test("Torggata People teasers and popup texts have no exact duplicate boilerplate",()=>{
  const byId=new Map(people.map(p=>[String(p?.id||"").trim(),p]));
  for(const field of ["desc","popupDesc"]){
    const seen=new Map();
    for(const id of expected){const value=String(byId.get(id)?.[field]||"").trim().replace(/\s+/g," ");assert.ok(value,`${id} missing ${field}`);const prev=seen.get(value);assert.equal(prev,undefined,`${field} duplicated by ${prev} and ${id}`);seen.set(value,id)}
  }
});


test("Torggata People has canonical relations and excludes Torggata Bad proxies",()=>{
  const relIds=new Set(relations.filter(r=>String(r?.place||r?.placeId||r?.place_id)==="torggata").map(r=>String(r?.person||r?.personId||r?.person_id)));
  for(const id of requiredVisible) assert.ok(relIds.has(id),`${id} must have a canonical Torggata relation`);
  for(const id of ["thorvald_meyer","christian_morgenstierne","arne_eide"]) assert.equal(relIds.has(id),false,`${id} belongs to the separate Torggata Bad place`);
  assert.deepEqual(runtimePeopleForTorggata().map(p=>p.id).sort(),requiredVisible.slice().sort());
});

test("pending People revalidation keeps usable profiles visible",()=>{
  const popupSource=fs.readFileSync(path.join(ROOT,"js/ui/popup-utils.js"),"utf8");
  const placeCardRuntime=fs.readFileSync(path.join(ROOT,"js/ui/place-card-epoke.js"),"utf8");
  const events=[];

  class TestCustomEvent{
    constructor(type,options={}){this.type=type;this.detail=options.detail}
  }

  const context={
    console,
    PEOPLE:people,
    PLACES:[{id:"torggata",category:"by"}],
    RELATIONS:relations,
    HG_SHOULD_DEFER_PEOPLE_FOR_PLACE(){return true},
    dispatchEvent(event){events.push(event.type);return true},
    CustomEvent:TestCustomEvent,
    document:{
      addEventListener(){},
      createElement(){return{}},
      body:{appendChild(){}},
      getElementById(){return null}
    },
    requestAnimationFrame(){},
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    async openPlaceCard(){return true}
  };
  context.window=context;
  context.globalThis=context;
  vm.createContext(context);
  vm.runInContext(popupSource,context,{filename:"popup-utils.js"});
  vm.runInContext(placeCardRuntime,context,{filename:"place-card-epoke.js"});

  const visible=Array.from(context.getPeopleForPlace("torggata"));
  assert.deepEqual(visible.map(person=>person.id).sort(),requiredVisible.slice().sort());
  assert.ok(events.includes("hg:people-place-revalidation-needed"),"fresh data must still be requested");
  assert.equal(context.HGPeopleVisibilityPolicy?.mode,"stale-while-revalidate");
  assert.equal(context.HGPeopleVisibilityPolicy?.hidesUsableCache,false);
});
