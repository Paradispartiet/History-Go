import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read=path=>JSON.parse(fs.readFileSync(path,"utf8"));
const report=read("reports/place-production/det-norske-teatret/20261021/objects-c49-illustration-fallback.json");
const c45=read("reports/place-production/det-norske-teatret/20261021/scene-curtain-c45-research.json");
const place=read("data/places/scenekunst/oslo/places_scenekunst/det_norske_teatret.json");
const card=read("reports/place-production/det-norske-teatret-workcard-current.json");
const policy=fs.readFileSync("docs/PLACE_OBJECTS_CANONICAL.md","utf8");
const asset=fs.readFileSync(report.candidate.image.path,"utf8");

test("C49 illustration is a locally present, visibly labeled, script-free SVG",()=>{
 assert.equal(report.candidate.image.kind,"illustration");
 assert.equal(report.candidate.image.visualLabel,"ILLUSTRASJON – IKKE FOTOGRAFI");
 assert.match(report.candidate.image.path,/\.svg$/);
 assert.match(asset,/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
 assert.match(asset,/ILLUSTRASJON – IKKE FOTOGRAFI/);
 assert.match(asset,/Jan Groths sceneteppe/);
 assert.match(asset,/skjematisk|ikke målfast/i);
 assert.doesNotMatch(asset.replace('xmlns="http://www.w3.org/2000/svg"',''),/<script\b|<foreignObject\b|\bonload\s*=|\bonerror\s*=|https?:\/\//i);
 assert.equal(report.candidate.image.externalPhotoCopied,false);
 assert.equal(report.candidate.image.fidelity,"CONCEPTUAL_NOT_PHOTO_NOT_MEASUREMENT");
});
test("C49 candidate remains the independently sourced 1985 physical stage curtain, not its 12 panels",()=>{
 assert.equal(report.place_id,"det_norske_teatret");
 assert.equal(report.candidate.id,c45.new_candidate.id);
 assert.equal(report.candidate.source,c45.new_candidate.primary_source);
 assert.equal(report.candidate.objectIdentityVerified,true);
 assert.ok(report.candidate.documented_features.some(x=>/Single 1985 stage curtain/.test(x)));
 assert.equal(report.candidate.image.sceneGeometryInvented,true);
 assert.equal(report.candidate.canonicalPublished,false);
});
test("C49 fallback policy allows illustrations but forbids documentary impersonation and unverified objects",()=>{
 assert.match(policy,/Illustrert representasjon når foto mangler/);
 assert.match(policy,/imageKind: "illustration"/);
 assert.match(policy,/«Illustrasjon – ikke fotografi»/);
 assert.match(policy,/Manglende autentisk foto er \*\*ikke i seg selv\*\*/);
 assert.match(policy,/uavhengig av illustrasjonen/);
 assert.equal(report.fallback_requirements.only_for_verified_physical_objects,true);
 assert.equal(report.fallback_requirements.visible_label_required_in_app,true);
 assert.equal(report.fallback_requirements.canonical_object_publication_requires_separate_ui_and_data_gates,true);
});
test("C49 creates a representative visual without prematurely releasing canonical Objects",()=>{
 assert.equal(card.status,"in_progress");
 assert.equal(card.collections.objects.status,"PASS");
 assert.deepEqual(card.placecard_collections_publishable_now,["objects"]);
 assert.equal(place.objects?.length??0,2);
 assert.equal(report.scope.public_objects,0);
 assert.equal(report.scope.previewPublished,false);
 assert.equal(place.externalLinks.filter(x=>x.type==="image_source"&&x.previewImage).length,2);
});
