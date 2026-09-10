import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM } from "jsdom";

const storiesSource = fs.readFileSync("js/ui/place-sheet/sections/stories.ts", "utf8");
const shellSource = fs.readFileSync("js/ui/place-sheet/place-sheet-shell.ts", "utf8");
const popupSource = fs.readFileSync("js/ui/place-popup-v2.js", "utf8");
const unifiedSource = fs.readFileSync("js/ui/place-unified-surface.ts", "utf8");
const popupUtilsSource = fs.readFileSync("js/ui/popup-utils.js", "utf8");
const runtimeSource = fs.readFileSync("dist/web/place-unified-surface.js", "utf8");
const css = fs.readFileSync("css/place-sheet.css", "utf8");

test("Stories renderer owns canonical place Stories while Person keeps its existing helper path", () => {
  assert.match(storiesSource, /HGStories\?\.getByPlace|HGStories\.getByPlace/);
  assert.match(storiesSource, /canonicalStoriesForPlace/);
  assert.match(storiesSource, /data-hg-place-sheet-owner="stories"/);
  assert.match(storiesSource, /related_people/);
  assert.match(storiesSource, /related_places/);
  assert.match(storiesSource, /sources\.slice\(0, 3\)/);
  assert.match(storiesSource, /bindRelatedTargets/);
  assert.match(popupUtilsSource, /renderStoriesSection\(window\.HGStories\?\.getByPerson\?\.\(person\.id\) \|\| \[\]\)/);
});

test("generated runtime preserves full Story prose, metadata, links and direct related-chip behavior", () => {
  const dom = new JSDOM("<!doctype html><html><head></head><body><div id='host'></div></body></html>", {
    url: "https://history-go.test/",
    runScripts: "outside-only"
  });
  const { window } = dom;
  const opened = [];
  window.PEOPLE = [{ id: "person-1", name: "Person <One>" }];
  window.PLACES = [{ id: "place-1", name: "Place & One" }, { id: "place-main", name: "Main" }];
  window.HGStories = {
    getByPlace(id) {
      assert.equal(id, "place-main");
      return [{
        id: "story-1",
        year: 1901,
        title: "Title <unsafe>",
        summary: "Short & distinct",
        story: "Full <prose> & more",
        related_people: ["person-1"],
        related_places: ["place-1"],
        tags: ["tag&one"],
        sources: [
          { title: "Source <1>", url: "https://example.com/1" },
          { author: "Author 2", url: "https://example.com/2" },
          { title: "Source 3", url: "https://example.com/3" },
          { title: "Source 4", url: "https://example.com/4" }
        ]
      }];
    }
  };
  window.showPersonPopup = person => opened.push(["person", person.id]);
  window.showPlacePopup = place => opened.push(["place", place.id]);
  window.eval(runtimeSource);

  const stories = window.HGPlaceSheetSections?.stories;
  assert.equal(typeof stories?.forPlace, "function");
  assert.equal(typeof stories?.renderHtml, "function");
  assert.equal(typeof stories?.mount, "function");

  const rows = stories.forPlace({ id: "place-main" });
  assert.equal(rows.length, 1);
  const html = stories.renderHtml(rows);
  assert.match(html, /1901/);
  assert.match(html, /Title &lt;unsafe&gt;/);
  assert.match(html, /Short &amp; distinct/);
  assert.match(html, /Full &lt;prose&gt; &amp; more/);
  assert.match(html, /Person &lt;One&gt;/);
  assert.match(html, /Place &amp; One/);
  assert.match(html, /#tag&amp;one/);
  assert.match(html, /https:\/\/example\.com\/1/);
  assert.match(html, /https:\/\/example\.com\/3/);
  assert.doesNotMatch(html, /https:\/\/example\.com\/4/);
  assert.doesNotMatch(html, /Title <unsafe>/);

  const host = window.document.getElementById("host");
  const mounted = stories.mount(host, { id: "place-main" });
  assert.ok(mounted);
  host.querySelector("[data-person='person-1']")?.click();
  host.querySelector("[data-place='place-1']")?.click();
  assert.deepEqual(opened, [["person", "person-1"], ["place", "place-1"]]);
  dom.window.close();
});

test("Phase 6 standard path owns Stories while standalone Place popup keeps shared fallback", () => {
  assert.match(shellSource, /mountCanonicalStories/);
  assert.match(shellSource, /pc-sheet-stories/);
  assert.match(shellSource, /SHELL_SECTION_ATTR[^\n]*stories|setAttribute\(SHELL_SECTION_ATTR, "stories"\)/);
  assert.match(unifiedSource, /\["stories", "Fortellinger"\]/);
  assert.match(unifiedSource, /mountPlaceSheetPhase1\(place\)/);
  assert.doesNotMatch(unifiedSource, /suppressPlaceStories/);
  assert.doesNotMatch(unifiedSource, /legacyShowPlacePopup\(place,\s*\{\s*unifiedHost:/);
  assert.match(popupSource, /HGPlaceSheetSections\?\.stories\?\.renderHtml/);
  assert.match(popupSource, /suppressPlaceStories/);
});

test("direct Place Sheet Stories keep popup-quality editorial styling", () => {
  assert.match(css, /pc-sheet-canonical-stories/);
  assert.match(css, /pc-sheet-canonical-stories[^\{]*\.pc-story/);
  assert.match(css, /linear-gradient\(135deg,\s*rgba\(246,200,0,0?\.115\)/);
  assert.match(css, /pc-story-year-badge/);
  assert.match(css, /pc-story-related/);
  assert.match(css, /pc-story-sources/);
});
