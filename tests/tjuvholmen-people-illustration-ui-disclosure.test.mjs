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
const cardCss=read("css/placeCard.css");
const personCss=read("css/person-popup-v2.css");
assert.match(card,/imageMeta\?\.assetKind === "illustration"/);
assert.match(card,/pc-person-image-kind">Illustrasjon/);
assert.match(card,/Illustrasjon av \$\{p\.name/);
assert.match(popup,/imageMeta\?\.assetKind, person\?\.imageKind/);
assert.match(popup,/hg-person-portrait-kind">Illustrasjon/);
assert.match(popup,/Illustrasjon av \$\{name/);
assert.match(collections,/item\.imageMeta\?\.assetKind/);
assert.match(collections,/pc-visual-people-image-kind/);
assert.match(cardCss,/\.pc-person-image-kind/);
assert.match(personCss,/\.hg-person-portrait-kind/);
const runtime=parse("data/runtime/place-open/tjuvholmen.json");
const audit=parse("reports/place-production/tjuvholmen-people-portrait-rights-20261112.json");
const manifest=parse("reports/place-production/tjuvholmen-generated-people-illustration-candidates-20261112.json");
const visual=parse("reports/place-production/tjuvholmen-people-illustration-visual-qa-20261113.json");
assert.equal(runtime.people.length,5);
for (const id of ["bjarne_melgaard","stephen_butkus","hans_rasmus_astrup"]) {
 const person=runtime.people.find(p=>p.id===id);
 assert.ok(person,id);
 assert.equal(person.image,"");
 assert.equal(person.cardImage,"");
}
assert.equal(audit.approved.length,2);
assert.equal(manifest.new_published_portrait_count,0);
assert.equal(visual.publication_gates.place_card_illustrations_active,0);
assert.equal(visual.entries[0].additional_candidate_v3.status,"NEW_LOCAL_V3_CANDIDATE_NOT_COMMITTED_NOT_IDENTITY_APPROVED");
assert.equal(visual.entries[0].additional_candidate_v3.sha256,"e287e2b2db58b38a6187a24b2c74ebe7175316fea5ce1dbc9c5eba1e036b81b1");
assert.equal(parse("reports/place-production/tjuvholmen-workcard-current.json").vferdig.status,"BLOCKED");
console.log("TJUVHOLMEN_ILLUSTRATION_UI_DISCLOSURE_PASS: assetKind supported; visual labels required; 0 People candidates activated");
