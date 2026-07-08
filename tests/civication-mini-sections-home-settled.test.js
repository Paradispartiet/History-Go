#!/usr/bin/env node
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { JSDOM } = require("jsdom");

const repoRoot = path.resolve(__dirname, "..");

function loadScript(relPath) {
  const code = fs.readFileSync(path.join(repoRoot, relPath), "utf8");
  vm.runInThisContext(code, { filename: relPath });
}

function run() {
  const miniCss = fs.readFileSync(path.join(repoRoot, "css/civi-mini.css"), "utf8");
  const dom = new JSDOM(`<!doctype html><html><body>
    <main class="civi-panels">
      <section id="civiLifestorySection">
        <h2>Min dag</h2>
        <div id="civiLifestoryPanel">
          <article class="civi-lifestory-scene">
            <h3>Nå</h3>
            <div class="civi-lifestory-choices">
              <button type="button" class="civi-lifestory-choice">Velg</button>
            </div>
          </article>
          <aside class="civi-lifestory-panels"><section><h4>Tråder</h4></section></aside>
        </div>
      </section>
      <section id="civiHomeStatus">
        <div id="homeStatusContent">
          <p>Du bor på Sagene.</p>
          <button type="button">Bytt nabolag</button>
          <button type="button">Betal husleie</button>
        </div>
      </section>
    </main>
    <div class="civi-footer">
      <button id="btnCiviMap" class="civi-btn civi-map-icon-btn" type="button" aria-label="Kart">🗺️</button>
      <button class="civi-btn civi-category-tab" type="button" data-category="minDag">Min dag</button>
      <button class="civi-btn civi-category-tab" type="button" data-category="personlig">Personlig</button>
      <button class="civi-btn civi-category-tab" type="button" data-category="karriere">Karriere</button>
      <button class="civi-btn civi-category-tab" type="button" data-category="fritid">Fritid</button>
      <button class="civi-btn civi-category-tab" type="button" data-category="kommers">Kommers</button>
      <button class="civi-btn civi-category-tab" type="button" data-category="kultur">Kultur</button>
    </div>
  </body></html>`, { url: "https://example.test/Civication.html" });

  global.window = dom.window;
  global.document = dom.window.document;
  global.Event = dom.window.Event;
  global.HTMLElement = dom.window.HTMLElement;
  global.localStorage = dom.window.localStorage;
  global.setTimeout = (fn) => { fn(); return 0; };
  global.clearTimeout = () => {};
  window.setTimeout = global.setTimeout;
  window.clearTimeout = global.clearTimeout;
  global.addEventListener = dom.window.addEventListener.bind(dom.window);
  global.dispatchEvent = dom.window.dispatchEvent.bind(dom.window);
  window.CivicationHome = {
    getState() {
      return { home: { status: "settled", district: "sagene" } };
    }
  };
  window.CivicationMailEngine = { getInbox() { return []; } };

  loadScript("js/Civication/ui/CivicationMiniSectionsUI.js");

  window.CivicationMiniSectionsUI.boot();
  window.CivicationMiniSectionsUI.refresh();

  const tabs = Array.from(document.querySelectorAll(".civi-footer .civi-category-tab"));
  assert.strictEqual(document.querySelectorAll(".civi-panels .civi-category-tab").length, 0, "category nav should not render above the panels");
  assert.deepStrictEqual(
    tabs.map((tab) => tab.textContent),
    ["Min dag", "Personlig", "Karriere", "Fritid", "Kommers", "Kultur"],
    "footer category nav should show Min dag first followed by life areas"
  );
  assert.strictEqual(tabs[0].dataset.category, "minDag", "Min dag tab should use minDag category key");
  assert.ok(tabs[0].classList.contains("is-active"), "Min dag should be the default active category");

  const section = document.getElementById("civiHomeStatus");
  const status = section.querySelector("[data-civi-mini-status]");

  assert.ok(status, "home mini status should be rendered");
  assert.notStrictEqual(status.textContent, "Krever tilbakemelding", "settled home with ordinary buttons should not require feedback");
  assert.ok(!section.classList.contains("needs-feedback"), "settled home section should not have needs-feedback class");
  assert.ok(section.textContent.includes("Bytt nabolag"), "ordinary change-district button should remain rendered");
  assert.ok(section.textContent.includes("Betal husleie"), "ordinary rent button should remain rendered");

  const lifestorySection = document.getElementById("civiLifestorySection");
  const lifestoryPanel = document.getElementById("civiLifestoryPanel");
  assert.ok(document.body.classList.contains("civi-mini-mode"), "mini-mode should be active");
  assert.ok(!lifestorySection.classList.contains("civi-hidden-by-category"), "Min dag section should be visible when minDag is active");
  assert.strictEqual(lifestorySection.dataset.civiLifeCategory, "minDag", "Min dag section should participate in category filtering");
  assert.ok(!lifestorySection.querySelector(":scope > .civi-mini-card"), "Min dag section should not get a mini card");
  assert.ok(lifestorySection.querySelector(":scope > h2"), "Min dag header should remain a direct visible header");
  assert.ok(lifestoryPanel.querySelector(".civi-lifestory-scene"), "Min dag panel should keep the scene after mini boot");
  assert.ok(lifestoryPanel.querySelector(".civi-lifestory-choices"), "Min dag panel should keep choices after mini boot");
  assert.ok(lifestoryPanel.querySelector(".civi-lifestory-panels"), "Min dag panel should keep overview panels after mini boot");
  assert.ok(!document.getElementById("civiDayPhasePanel"), "legacy day phase panel should not be created in normal mini boot");

  tabs.find((tab) => tab.dataset.category === "personlig").click();
  assert.ok(lifestorySection.classList.contains("civi-hidden-by-category"), "Min dag section should be hidden in Personlig tab");
  assert.ok(!section.classList.contains("civi-hidden-by-category"), "Personlig home section should be visible in Personlig tab");

  tabs.find((tab) => tab.dataset.category === "karriere").click();
  assert.ok(lifestorySection.classList.contains("civi-hidden-by-category"), "Min dag section should be hidden in Karriere tab");
  assert.ok(section.classList.contains("civi-hidden-by-category"), "Personlig home section should be hidden in Karriere tab");

  tabs[0].click();
  assert.ok(!lifestorySection.classList.contains("civi-hidden-by-category"), "Min dag section should be visible again when Min dag tab is selected");
  assert.ok(!lifestoryPanel.classList.contains("civi-hidden-by-category"), "Life Story panel itself should remain visible in Min dag tab");

  assert.ok(
    miniCss.includes(".civi-panels > section:not(#civiLifestorySection):not(#civiDashboardSection):not(#civiLifeHomeControls):not(#civiDayPhasePanel) > h2"),
    "mini CSS should exclude Min dag before hiding section h2 headings"
  );
  assert.ok(
    miniCss.includes(".civi-panels > section:not(#civiLifestorySection):not(#civiDashboardSection):not(#civiLifeHomeControls):not(#civiDayPhasePanel) > :not(.civi-mini-card):not(.civi-section-body)"),
    "mini CSS should exclude Min dag before hiding ordinary direct children"
  );
  assert.ok(
    miniCss.includes("body.civi-app.civi-mini-mode #civiLifestoryPanel"),
    "mini CSS should explicitly keep the Life Story panel visible"
  );
  assert.ok(
    miniCss.includes("#civiLifestorySection.civi-hidden-by-category"),
    "mini CSS should hide Life Story only through the category filter class"
  );

  console.log("PASS: Civication mini home settled actions are not urgent.");
}

run();
