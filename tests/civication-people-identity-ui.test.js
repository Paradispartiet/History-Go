const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const uiSource = fs.readFileSync(path.join(__dirname, "../js/Civication/ui/CivicationPeopleUI.js"), "utf8");

test("Civication's social panel keeps the fictional identity and only cites collected People as learning", () => {
  const host = { innerHTML: "" };
  const sandbox = {
    document: {
      getElementById(id) { return id === "civiPeoplePanel" ? host : null; },
      addEventListener() {}
    },
    window: {
      CivicationState: { getActivePosition() { return { career_id: "kunst", role_scope: "kurator" }; } },
      CivicationPeopleEngine: {
        getAvailablePeople() {
          return [{
            id: "person_artist_001",
            name: "Kunstneren i omløp",
            description: "Fiktiv kulturperson.",
            type: "artist", social_style: "cultural", score: 5,
            history_go_learning_reference: {
              id: "edvard_munch", name: "Edvard Munch", place_id: "ekely",
              kind: "historical_knowledge_only"
            }
          }];
        }
      },
      addEventListener() {}
    }
  };
  vm.runInNewContext(uiSource, sandbox);
  sandbox.window.CivicationPeopleUI.render();
  assert.match(host.innerHTML, /Kunstneren i omløp/);
  assert.match(host.innerHTML, /Fiktiv kulturperson/);
  assert.match(host.innerHTML, /Historisk fagreferanse fra History Go: Edvard Munch/);
  assert.doesNotMatch(host.innerHTML, /Fra History Go-samlingen din/);
  assert.doesNotMatch(host.innerHTML, /<img /);
});
