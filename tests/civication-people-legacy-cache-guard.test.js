const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "../js/Civication/systems/civicationPeopleEngine.js"), "utf8");
function boot(saved) {
  let writes = 0;
  const window = { addEventListener() {} };
  const sandbox = vm.createContext({
    window,
    document: { addEventListener() {} },
    localStorage: {
      getItem(key) { return key === "hg_civi_people_v1" ? saved : null; },
      setItem() { writes += 1; }
    }
  });
  vm.runInContext(source, sandbox);
  return { api: window.CivicationPeopleEngine, writes: () => writes };
}
const legacy = {
  updated_at: "2026-10-01",
  role_scope: "kurator",
  career_id: "kunst",
  available_people: [
    {
      id: "person_artist_001", source: "access_map",
      name: "Edvard Munch", description: "Maler.",
      archetype_name: "Kunstneren i omløp", score: 7,
      hg_categories: ["kunst"],
      hg_person: { id: "edvard_munch", name: "Edvard Munch", category: "kunst", desc: "Maler.", placeId: "ekely" }
    },
    {
      id: "person_artist_002", source: "access_map",
      name: "Camilla Collett", description: "Forfatter.",
      hg_person: { id: "camilla_collett", name: "Camilla Collett", category: "litteratur" }
    },
    { id: "role_based_friend", name: "Fiktiv kollega", source: "role_base", score: 3 }
  ]
};

test("Old serialized historical People names are removed from social NPC read model without mutating saves", () => {
  const raw = JSON.stringify(legacy);
  const h = boot(raw);
  const entries = h.api.getAvailablePeople();
  assert.equal(entries.length, 3);
  const artist = entries[0];
  assert.equal(artist.id, "person_artist_001");
  assert.equal(artist.name, "Kunstneren i omløp");
  assert.equal(artist.description, "");
  assert.equal(artist.hg_person, undefined);
  assert.equal(artist.score, 7);
  assert.equal(artist.history_go_learning_reference.id, "edvard_munch");
  assert.equal(artist.history_go_learning_reference.kind, "historical_knowledge_only");
  assert.equal(entries[1].name, "Fiktiv miljøfigur");
  assert.equal(entries[1].hg_person, undefined);
  assert.equal(entries[2].name, "Fiktiv kollega");
  assert.equal(h.api.getPeopleState().role_scope, "kurator");
  assert.equal(h.writes(), 0);
  assert.equal(raw, JSON.stringify(legacy));
});

test("Malformed historical People cache reads as empty, not as a guessed identity", () => {
  const h = boot("{not-json");
  assert.equal(h.api.getAvailablePeople().length, 0);
  assert.equal(h.writes(), 0);
});

test("New correctly separated learning references remain unchanged", () => {
  const saved = JSON.stringify({
    career_id: "kunst",
    available_people: [{
      id: "person_artist_001", source: "access_map", name: "Kunstneren i omløp",
      description: "Fiktiv person.", history_go_learning_reference: {
        id: "edvard_munch", name: "Edvard Munch", kind: "historical_knowledge_only"
      }
    }]
  });
  const h = boot(saved);
  assert.equal(h.api.getAvailablePeople()[0].name, "Kunstneren i omløp");
  assert.equal(h.api.getAvailablePeople()[0].description, "Fiktiv person.");
  assert.equal(h.writes(), 0);
});
