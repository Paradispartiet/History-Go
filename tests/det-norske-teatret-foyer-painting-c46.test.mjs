import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {validateRequest,validateCommons} from "../scripts/place-production/stage-dnt-foyer-painting-c46.mjs";

const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const q=read("reports/place-production/det-norske-teatret/20261021/painting-photo-intake-c46.json");
const research=read("reports/place-production/det-norske-teatret/20261021/foyer-paintings-c46-research.json");
const place=read("data/places/scenekunst/oslo/places_scenekunst/det_norske_teatret.json");
const card=read("reports/place-production/det-norske-teatret-workcard-current.json");
// Preserve strict C46 stage-only assumptions while verifying post-C50 publication separately.
const preC50Place={...place,objects:undefined};
const preC50Card={...card,collections:{...card.collections,objects:{...card.collections.objects,status:"BLOCKED"}}};

test("C46 identifies a new licensed photo candidate but publishes zero Objects",()=>{
 assert.doesNotThrow(()=>validateRequest(q,research,preC50Place,preC50Card));
 assert.equal(research.prior_distinct_candidates,4);
 assert.equal(research.distinct_candidate_physical_items_after_c46,5);
 assert.equal(research.canonical_objects_published,0);
 assert.equal(card.collections.objects.status,"PASS");
 assert.equal(card.status,"in_progress");
 assert.throws(()=>validateRequest(q,research,place,card),/Canonical object gate changed/);
 assert.equal(q.publication,"DRAFT_MEDIA_ONLY_OBJECTS_BLOCKED");
 const lead=research.evidence.find(x=>x.id==="dnt_aksel_waldemar_johannessen_kortspillere_foyer");
 assert.equal(lead.decision,"SOURCE_LEAD_ONLY_DO_NOT_COUNT_AS_CONFIRMED_FIFTH_OR_SIXTH_MEMBER");
});
test("C46 rejects swapped Commons title, rights, author and publication status",()=>{
 const page={title:q.title};
 const validWikitext="== Summary == {{Artwork |artist = {{Creator:Aksel Waldemar Johannessen}} |author = [[User:Wolfmann|Wolfmann]] }} {{self|cc-by-sa-4.0}}";
 const info={mime:"image/jpeg",width:2476,height:3635,size:1983705,url:"https://upload.wikimedia.org/wikipedia/commons/8/81/painting.jpg",
  extmetadata:{LicenseShortName:{value:"CC BY-SA 4.0"},Artist:{value:"<a>Wolfmann</a>"}}};
 assert.doesNotThrow(()=>validateCommons(page,info,q,validWikitext));
 assert.throws(()=>validateRequest({...q,photographer:"Unknown"},research,preC50Place,preC50Card));
 assert.throws(()=>validateRequest({...q,publication:"CANONICAL_OBJECT"},research,preC50Place,preC50Card));
 assert.throws(()=>validateCommons({...page,title:"File:Other.jpeg"},info,q,validWikitext));
 assert.throws(()=>validateCommons(page,{...info,size:1983704},q,validWikitext));
 assert.throws(()=>validateCommons(page,{...info,url:"https://images.example.org/x.jpg"},q,validWikitext));
 assert.throws(()=>validateCommons(page,{...info,extmetadata:{...info.extmetadata,LicenseShortName:{value:"All rights reserved"}}},q,validWikitext));
 // Artist is the painter, not the photographer; an Artist field containing Aksel must still pass.
 assert.doesNotThrow(()=>validateCommons(page,{...info,extmetadata:{...info.extmetadata,Artist:{value:"Aksel Waldemar Johannessen"}}},q,validWikitext));
 assert.throws(()=>validateCommons(page,info,q,validWikitext.replace("Wolfmann","WrongPhotographer")));
 assert.throws(()=>validateCommons(page,info,q,validWikitext.replace("cc-by-sa-4.0","cc-by-sa-3.0")));
 assert.throws(()=>validateCommons(page,info,q,validWikitext.replace("Creator:Aksel Waldemar Johannessen","Creator:Other Artist")));
 assert.throws(()=>validateCommons(page,info,q,undefined));
});
