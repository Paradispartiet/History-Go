#!/usr/bin/env node
// People-portrait disclosure contract: metadata, visible UI, and unchanged
// production safety must all agree before any illustrated identity is activated.
import assert from "node:assert/strict";
import fs from "node:fs";
const read = p => fs.readFileSync(p,"utf8");
const parse = p => JSON.parse(read(p));
const card=read("js/ui/place-card.js");
const popup=read("js/ui/person-popup-v2.js");
const collections=read("js/ui/place-rounds-visual-collections.js");
assert.match(collections,/illustratedPerson/);
assert.match(collections,/pc-person-image-kind/);

const cardCss=read("css/placeCard.css");
const personCss=read("css/person-popup-v2.css");
assert.match(card,/imageMeta\?\.assetKind === "illustration"/);
assert.match(card,/pc-person-image-kind">Illustrasjon/);
assert.match(card,/Illustrasjon av \$\{p\.name/);
assert.match(popup,/imageMeta\?\.assetKind, person\?\.imageKind/);
assert.match(popup,/hg-person-portrait-kind">Illustrasjon/);
assert.match(popup,/Illustrasjon av \$\{name/);
assert.match(cardCss,/\.pc-person-image-kind/);
assert.match(personCss,/\.hg-person-portrait-kind/);
assert.match(read("index.html"),/person-popup-v2\.css\?v=20261113-people-illustration-label1/);
assert.match(read("index.html"),/placeCard\.css\?v=20261113-people-illustration-label1/);
assert.match(read("js/app.js"),/place-card\.js\?v=20261113-people-illustration-label1/);
assert.match(read("sw.js"),/people-illustration-label1/);
const runtime=parse("data/runtime/place-open/tjuvholmen.json");
const audit=parse("reports/place-production/tjuvholmen-people-portrait-rights-20261112.json");
const manifest=parse("reports/place-production/tjuvholmen-generated-people-illustration-candidates-20261112.json");
const visual=parse("reports/place-production/tjuvholmen-people-illustration-visual-qa-20261113.json");
assert.equal(runtime.people.length,5);
for (const id of ["stephen_butkus","hans_rasmus_astrup"]) {
 const person=runtime.people.find(p=>p.id===id);
 assert.ok(person,id);
 assert.equal(person.image,"");
 assert.equal(person.cardImage,"");
}
assert.equal(audit.approved.length,2);
assert.equal(manifest.new_published_portrait_count,0);
assert.equal(visual.publication_gates.place_card_illustrations_active,1);
const melgaard=runtime.people.find(p=>p.id==="bjarne_melgaard");
assert.equal(melgaard.image,"bilder/kort/people/bjarne_melgaard_illustrasjon_v3.webp");
assert.equal(melgaard.cardImage,melgaard.image);
assert.equal(melgaard.imageMeta.assetKind,"illustration");
assert.equal(melgaard.imageMeta.visibleDisclosure,"Illustrasjon");
assert.equal(melgaard.imageMeta.assetSha256,visual.entries[0].additional_candidate_v3.sha256);
assert.equal(visual.entries[0].additional_candidate_v3.status,"USER_APPROVED_EDITORIAL_ILLUSTRATION_ACTIVE_IN_PEOPLE");
assert.equal(fs.existsSync(melgaard.image),true);
assert.equal(visual.entries[0].additional_candidate_v3.status,"USER_APPROVED_EDITORIAL_ILLUSTRATION_ACTIVE_IN_PEOPLE");
const v3=visual.entries[0].additional_candidate_v3;
const v3Bytes=fs.readFileSync(v3.staged_path);
assert.equal(v3Bytes.length,189842);
assert.equal((await import("node:crypto")).createHash("sha256").update(v3Bytes).digest("hex"),v3.sha256);
assert.equal(v3Bytes.toString("ascii",0,4),"RIFF");
assert.equal(v3Bytes.toString("ascii",8,12),"WEBP");
assert.equal(v3Bytes.toString("ascii",12,16),"VP8 ");
assert.deepEqual([v3Bytes.readUInt16LE(26)&0x3fff,v3Bytes.readUInt16LE(28)&0x3fff],[900,1200]);
assert.equal(visual.entries[0].additional_candidate_v3.sha256,"e287e2b2db58b38a6187a24b2c74ebe7175316fea5ce1dbc9c5eba1e036b81b1");
assert.equal(parse("reports/place-production/tjuvholmen-workcard-current.json").vferdig.status,"BLOCKED");
console.log("TJUVHOLMEN_ILLUSTRATION_UI_DISCLOSURE_PASS: Melgaard v3 active and visibly disclosed; Butkus/Astrup held; 2 authentic photo rights approved");
