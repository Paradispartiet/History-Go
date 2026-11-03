import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { JSDOM } from "jsdom";

const script = fs.readFileSync("js/ui/place-card-round-gallery.js", "utf8");
const stylesheet = fs.readFileSync("css/place-card-round-gallery.css", "utf8");
const editorialStylesheet = fs.readFileSync("css/place-card-editorial-polish.css", "utf8");
const htmlEntry = fs.readFileSync("index.html", "utf8");

test("PlaceCard keeps People and Badges in the right-hand collection grid while other artwork expands and Brands follows About", async () => {
  const html = [
    '<!doctype html><html><body class="hg-app">',
    '<div id="placeCard" class="is-unified-place is-place-sheet-direct" data-current-place-id="test-place">',
    '<div class="pc-body"><section class="pc-sheet-shell" data-hg-place-sheet-shell="1" data-place-id="test-place">',
    '<section data-hg-place-sheet-section="about"><section class="pc-sheet-canonical-about" data-hg-place-sheet-owner="about">',
    '<h3>Om stedet</h3><p>En kort beskrivelse.</p><div class="hg-place-longread"><p>Hele fortellingen.</p></div>',
    '</section></section>',
    '<div class="pc-sheet-explore-grid"><div class="pc-side-stack"><div class="pc-icons-quad">',
    '<div id="pcPeopleIcon" class="pc-round pc-collection"><img src="/people-portrait.jpg" alt="Personer"></div>',
    '<div id="pcNatureIcon" class="pc-round pc-collection"><img src="/nature-landscape.jpg" alt="Naturfoto fra stedet" data-credit="Oslo byarkiv"></div>',
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
  const clickCounts = { people: 0, badges: 0, brands: 0 };
  document.getElementById("pcPeopleIcon").addEventListener("click", () => clickCounts.people++);
  document.getElementById("pcBadgesIcon").addEventListener("click", () => clickCounts.badges++);
  document.getElementById("pcBrandsIcon").addEventListener("click", () => clickCounts.brands++);

  window.eval(script);
  const flush = async () => {
    await new Promise(resolve => window.requestAnimationFrame(resolve));
    await new Promise(resolve => window.requestAnimationFrame(resolve));
  };
  await flush();

  const people = document.getElementById("pcPeopleIcon");
  const badges = document.getElementById("pcBadgesIcon");
  const works = document.querySelector('[data-pc-round-gallery-item="pcWorksIcon"]');
  const nature = document.querySelector('[data-pc-round-gallery-item="pcNatureIcon"]');
  const brands = document.querySelector('[data-pc-round-gallery-brand="1"]');
  const history = shell.querySelector('[data-hg-place-sheet-section="history"]');
  const explore = shell.querySelector(".pc-sheet-explore-grid");
  const about = shell.querySelector(".pc-sheet-canonical-about");

  const originalGrid = explore.querySelector(".pc-side-stack > .pc-icons-quad");
  assert.ok(people && badges && nature && works && brands, "Original controls and expanded artwork are present");
  assert.equal(people.parentElement, originalGrid, "People stays in the original top-right collection grid");
  assert.equal(badges.parentElement, originalGrid, "Badges stays in the original top-right collection grid");
  assert.equal(people.hidden, false, "People remains visible");
  assert.equal(badges.hidden, false, "Badges remains visible");
  assert.equal(people.hasAttribute("data-pc-round-gallery-source"), false, "People is never hidden as a gallery source");
  assert.equal(badges.hasAttribute("data-pc-round-gallery-source"), false, "Badges is never hidden as a gallery source");
  assert.equal(document.querySelector('[data-pc-round-gallery-item="pcPeopleIcon"]'), null, "No duplicate People artwork below History");
  assert.equal(document.querySelector('[data-pc-round-gallery-item="pcBadgesIcon"]'), null, "No duplicate Badges artwork below Learning");
  assert.equal(history.nextElementSibling, works.parentElement, "Works artwork still follows the history section");
  assert.equal(explore.nextElementSibling, nature.parentElement, "Nature follows the introduction and collection surface");
  assert.equal(about.lastElementChild, brands, "Brands appears at the end of the entire About text");
  assert.equal(nature.querySelector(".pc-round-gallery-caption")?.textContent, "Naturfoto fra stedet",
    "Existing alt description is presented as an editorial caption");
  assert.equal(nature.querySelector(".pc-round-gallery-credit")?.textContent, "Kilde: Oslo byarkiv",
    "Only explicit source metadata becomes a credit");
  assert.equal(works.querySelector(".pc-round-gallery-credit"), null,
    "Unknown photo credits are never invented");
  assert.equal(brands.querySelector("img").getAttribute("src"), "/brand-logo.png");
  assert.equal(document.querySelectorAll('.pc-round-gallery-section [data-pc-round-gallery-item="pcBrandsIcon"]').length, 0,
    "Brands is never rendered as a full-size gallery image");

  assert.match(stylesheet, /\.pc-round-gallery-item\s*>\s*img\s*\{[^}]*object-fit:contain/s);
  assert.match(stylesheet, /#pcBrandsIcon\s*\{\s*display:none\s*!important/s);
  assert.match(stylesheet, /\[data-pc-round-gallery-source="1"\]:not\(#pcPeopleIcon\):not\(#pcBadgesIcon\)/,
    "The gallery hide rule explicitly exempts People and Badges");
  assert.equal(people.querySelector("img").getAttribute("src"), "/people-portrait.jpg");
  assert.match(htmlEntry, /css\/place-card-editorial-polish\.css\?v=20261103-editorial1/,
    "The editorial stylesheet loads in the entrypoint");
  assert.match(htmlEntry, /js\/ui\/place-card-round-gallery\.js\?v=20261103-editorial1/,
    "The gallery script is cache-busted for updated captions");
  assert.doesNotMatch(editorialStylesheet, /#pcPeopleIcon|#pcBadgesIcon|\.pc-side-stack|\.pc-icons-quad/,
    "Editorial polish does not change the original People and Badges layout");
  assert.match(editorialStylesheet, /\.pc-heading-hero\.has-photo-source::after/,
    "Hero visual hierarchy gets a targeted gradient");
  assert.match(editorialStylesheet, /\.pc-sheet-canonical-about \.hg-place-longread/,
    "About copy has editorial measure and leading");
  assert.match(editorialStylesheet, /\.pc-sheet-canonical-history\{\s*padding:0;/,
    "History no longer has an extra box around the section");
  assert.match(editorialStylesheet, /\.pc-round-gallery-item > img\{[^}]*object-fit:contain/s,
    "Editorial gallery preserves original image framing");
  assert.match(editorialStylesheet, /\.pc-sheet-canonical-before-after figure img\{[^}]*object-fit:contain/s,
    "Before/after images remain uncropped");
  assert.match(editorialStylesheet, /@media \(max-width:520px\)/,
    "Editorial polish includes narrow-phone adjustments");

  people.click();
  badges.click();
  brands.querySelector("button").click();
  assert.deepEqual(clickCounts, { people: 1, badges: 1, brands: 1 }, "Existing People, Badges, and Brands popup handlers still work");

  const natureSourceImage = document.getElementById("pcNatureIcon").querySelector("img");
  natureSourceImage.dataset.credit = "Kulturhistorisk arkiv";
  natureSourceImage.setAttribute("alt", "Nytt naturmotiv");
  await flush();
  assert.equal(nature.querySelector(".pc-round-gallery-caption")?.textContent, "Nytt naturmotiv",
    "Editorial captions refresh with the reused PlaceCard");
  assert.equal(nature.querySelector(".pc-round-gallery-credit")?.textContent, "Kilde: Kulturhistorisk arkiv",
    "Credits refresh when metadata changes");
  natureSourceImage.removeAttribute("data-credit");
  natureSourceImage.setAttribute("alt", "Natur");
  await flush();
  assert.equal(nature.querySelector(".pc-round-gallery-credit"), null,
    "An absent credit disappears instead of lingering between places");
  assert.equal(nature.querySelector(".pc-round-gallery-caption"), null,
    "A generic alt identical to the category is not repeated as a caption");

  document.getElementById("pcPeopleIcon").querySelector("img").src = "/new-people.jpg";
  await flush();
  assert.equal(people.querySelector("img").getAttribute("src"),
    "/new-people.jpg", "People preview updates in its original right-side location");
  assert.equal(people.parentElement, originalGrid, "People remains in place after an image update");
  assert.equal(document.querySelector('[data-pc-round-gallery-item="pcPeopleIcon"]'), null, "People is not duplicated after an image update");

  card.dataset.currentPlaceId = "next-place";
  shell.dataset.placeId = "next-place";
  document.getElementById("pcBrandsIcon").querySelector("img").src = "/new-brand.png";
  window.dispatchEvent(new window.CustomEvent("hg:place-unified-ready"));
  await flush();
  assert.equal(about.querySelectorAll('[data-pc-round-gallery-brand="1"]').length, 1);
  assert.equal(about.querySelector('[data-pc-round-gallery-brand="1"] img').getAttribute("src"),
    "/new-brand.png");

  people.hidden = true;
  await flush();
  assert.equal(people.parentElement, originalGrid, "People stays in the original grid even when hidden by its owner");
  assert.equal(document.querySelector('[data-pc-round-gallery-item="pcPeopleIcon"]'), null,
    "Hiding People never creates a gallery copy");
  people.hidden = false;
  await flush();
  assert.equal(people.parentElement, originalGrid, "People returns to the same right-side position");
  assert.equal(badges.parentElement, originalGrid, "Badges stays in place when People visibility changes");

  dom.window.close();
});
