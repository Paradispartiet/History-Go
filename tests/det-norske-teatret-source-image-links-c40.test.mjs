import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = p => JSON.parse(fs.readFileSync(p, "utf8"));
const place=read("data/places/scenekunst/oslo/places_scenekunst/det_norske_teatret.json");
const prod=read("data/places/production/det_norske_teatret.json");
const runtime=read("data/runtime/place-open/det_norske_teatret.json");
const report=read("reports/place-production/det-norske-teatret/20261020/objects-c40-source-image-links.json");
const workcard=read("reports/place-production/det-norske-teatret-workcard-current.json");

test("DNT C40 source-image links reach canonical, production snapshot and actual Place-open",()=>{
 assert.equal(report.place_id,"det_norske_teatret");
 assert.equal(report.photo_links.length,2);
 assert.equal(prod.placeId,place.id);
 assert.equal(runtime.place.id,place.id);
 const source=report.photo_links[0];
 assert.equal(source.photographer,"Ole Herman Andersen");
 assert.equal(new URL(source.url).hostname,"detnorsketeatret.imgix.net");
 assert.equal(new URL(source.context_url).hostname,"www.detnorsketeatret.no");
 assert.deepEqual(place.externalLinks,prod.metadataSnapshot.externalLinks);
 assert.deepEqual(place.externalLinks,runtime.place.externalLinks);
 for (const link of report.photo_links){
  assert.ok(place.externalLinks.some(e=>e.url===link.url),link.url);
  assert.equal(link.use,"direct_original_publisher_link");
  assert.equal(link.copied_to_repo,false);
  assert.equal(link.object_member,false);
 }
 assert.ok(place.externalLinks.some(e=>e.url===source.url && e.type==="image_source" && /Juleroser/.test(e.label)));
 assert.equal(new Set(place.externalLinks.map(e=>e.url)).size,place.externalLinks.length);
});

test("DNT C40 Place source tab makes source image URL clickable and safe",()=>{
 const js=fs.readFileSync("js/ui/place-popup-tabs.js","utf8");
 assert.match(js,/function renderSources\(place, articles, includeProfileLabels/);
 assert.ok(js.includes("list(value?.externalLinks)"));
 assert.ok(js.includes('target="_blank" rel="noopener noreferrer"'));
 assert.ok(js.includes('href="${esc(link.url)}"'));
 assert.ok(js.includes('safeHttpsUrl(link?.url)'));
 assert.equal(report.rendering.tab,"Kilder");
 assert.equal(report.rendering.browser_check,"PENDING");
});

test("DNT C40 links do not license redistribution or declare a complete Objects collection",()=>{
 assert.equal(report.boundary.no_external_contact_sent,true);
 assert.equal(report.boundary.third_party_images_stored_in_repository,false);
 assert.equal(report.boundary.published_canonical_objects,0);
 assert.equal(workcard.status,"in_progress");
 assert.equal(workcard.collections.objects.status,"PASS");
 assert.deepEqual(workcard.placecard_collections_publishable_now,["objects"]);
 assert.equal(place.frontImage,"bilder/places/det_norske_teatret_front_bjoertvedt_2013.webp");
 assert.ok(workcard.checkpoints.some(x=>x.id==="original_publisher_photo_links_c40"));
});
