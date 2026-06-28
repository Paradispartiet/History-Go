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
  const dom = new JSDOM(`<!doctype html><html><body>
    <main class="civi-panels">
      <section id="civiHomeStatus">
        <div id="homeStatusContent">
          <p>Du bor på Sagene.</p>
          <button type="button">Bytt nabolag</button>
          <button type="button">Betal husleie</button>
        </div>
      </section>
    </main>
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

  const section = document.getElementById("civiHomeStatus");
  const status = section.querySelector("[data-civi-mini-status]");

  assert.ok(status, "home mini status should be rendered");
  assert.notStrictEqual(status.textContent, "Krever tilbakemelding", "settled home with ordinary buttons should not require feedback");
  assert.ok(!section.classList.contains("needs-feedback"), "settled home section should not have needs-feedback class");
  assert.ok(section.textContent.includes("Bytt nabolag"), "ordinary change-district button should remain rendered");
  assert.ok(section.textContent.includes("Betal husleie"), "ordinary rent button should remain rendered");

  console.log("PASS: Civication mini home settled actions are not urgent.");
}

run();
