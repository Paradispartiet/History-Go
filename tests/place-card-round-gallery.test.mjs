import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { JSDOM } from "jsdom";

const script = fs.readFileSync("js/ui/place-card-round-gallery.js", "utf8");
const stylesheet = fs.readFileSync("css/place-card-round-gallery.css", "utf8");

test("PlaceCard displays full, uncropped round images between relevant sections and Brands after About", async () => {
  const html = [
    '<!doctype html><html><body class="hg-app">',
    '<div id="placeCard" class="is-unified-place is-place-sheet-direct" data-current-place-id="test-place">',
    '<div class="pc-body"><section class="pc-sheet-shell" data-hg-place-sheet-shell="1" data-place-id="test-place">',
    '<section data-hg-place-sheet-section="about"><section class="pc-sheet-canonical-about" data-hg-place-sheet-owner="about">',
    '<h3>Om stedet</h3><p>En kort beskrivelse.</p><div class="hg-place-longread"><p>Hele fortellingen.</p></div>',
    '</section></section>',
    '<div class="pc-sheet-explore-grid"><div class="pc-side-stack"><div class="pc-icons-quad">',
    '<div id="pcPeopleIcon" class="pc-round pc-collection"><img src="/people-portrait.jpg" alt="Personer"></div>',
    '<div id="pcNatureIcon" class="pc-round pc-collection"><img src="/nature-landscape.jpg" alt="Natur"></div>',
    '<div id="pcWorksIcon" class="pc-round pc-collection"><img src="/works.jpg" alt="Verk"></div>',
    '<div id="pcFortellingerIcon" class="pc-round pc-collection"><img src="/stories.jpg" alt="Fortellinger"></div>',
    '<div id="pcForNaIcon" class="pc-round pc-collection"><img src="/before-after.jpg" alt="Før og nå"></div>',
    '<div id="pcBadgesIcon" class="pc-round pc-collection"><img src="/badge.jpg" alt="Badges"></div>',
    '<div id="pcBrandsIcon" class="pc-round pc-collection"><img src="/brand-logo.png" alt="Merke"></div>',
    '</div></div></div>',
    '<section data-hg-place-sheet-section="history"></section>',
    '<section data-hg-place-sheet-section="stories"></section>',
    '<section data-hg-place-sheet-section="before-after"></section>',
    '<section data-hg-place-sheet-section="language"></section>',
    '<section data-hg-place-sheet-section="learning"></section>',
    '</section></div>',
    '<div id="pcBrandsList"><button class="pc-brand-entry">Et merke</button></div>',
    '</div></body></html>'
  ].join("");

  const dom = new JSDOM(html, { url: "https://historygo.test/", runScripts: "outside-only", pretendToBeVisual: true });
  const { window } = dom;
  const { document } = window;
  const card = document.getElementById("placeCard");
  const shell = document.querySelector('[data-hg-place-sheet-shell="1"]');
  const clickCounts = { people: 0, brands: 0 };
  document.getElementById("pcPeopleIcon").addEventListener("click", () => clickCounts.people++);
  document.getElementById("pcBrandsIcon").addEventListener("click", () => clickCounts.brands++);

  window.eval(script);
  const flush = async () => {
    await new Promise(resolve => window.requestAnimationFrame(resolve));
    await new Promise(resolve => window.requestAnimationFrame(resolve));
  };
  await flush();

  const people = document.querySelector('[data-pc-round-gallery-item="pcPeopleIcon"]');
  const nature = document.querySelector('[data-pc-round-gallery-item="pcNatureIcon"]');
  const brands = document.querySelector('[data-pc-round-gallery-brand="1"]');
  const history = shell.querySelector('[data-hg-place-sheet-section="history"]');
  const explore = shell.querySelector(".pc-sheet-explore-grid");
  const about = shell.querySelector(".pc-sheet-canonical-about");

  assert.ok(people && nature && brands, "Each source appears in its editorial position");
  assert.equal(history.nextElementSibling, people.parentElement, "People artwork follows the history section");
  assert.equal(explore.nextElementSibling, nature.parentElement, "Nature follows the introduction and collection surface");
  assert.equal(about.lastElementChild, brands, "Brands appears at the end of the entire About text");
  assert.equal(brands.querySelector("img").getAttribute("src"), "/brand-logo.png");
  assert.equal(document.querySelectorAll('.pc-round-gallery-section [data-pc-round-gallery-item="pcBrandsIcon"]').length, 0,
    "Brands is never rendered as a full-size gallery image");

  assert.match(stylesheet, /\.pc-round-gallery-item\s*>\s*img\s*\{[^}]*object-fit:contain/s);
  assert.match(stylesheet, /#pcBrandsIcon\s*\{\s*display:none\s*!important/s);
  assert.equal(people.querySelector("img").getAttribute("src"), "/people-portrait.jpg");

  people.click();
  brands.querySelector("button").click();
  assert.deepEqual(clickCounts, { people: 1, brands: 1 }, "Existing popup handlers receive image clicks");

  document.getElementById("pcPeopleIcon").querySelector("img").src = "/new-people.jpg";
  await flush();
  assert.equal(document.querySelector('[data-pc-round-gallery-item="pcPeopleIcon"] img').getAttribute("src"),
    "/new-people.jpg", "Reused card refreshes the artwork without duplicating it");

  card.dataset.currentPlaceId = "next-place";
  shell.dataset.placeId = "next-place";
  document.getElementById("pcBrandsIcon").querySelector("img").src = "/new-brand.png";
  window.dispatchEvent(new window.CustomEvent("hg:place-unified-ready"));
  await flush();
  assert.equal(about.querySelectorAll('[data-pc-round-gallery-brand="1"]').length, 1);
  assert.equal(about.querySelector('[data-pc-round-gallery-brand="1"] img').getAttribute("src"),
    "/new-brand.png");

  document.getElementById("pcPeopleIcon").hidden = true;
  await flush();
  assert.equal(document.querySelector('[data-pc-round-gallery-item="pcPeopleIcon"]'), null,
    "Hidden collections do not leave an orphan gallery");

  dom.window.close();
});
