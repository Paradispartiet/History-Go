#!/usr/bin/env node
// Verifiserer CivicationHistoryPeopleBridge (hybridmodellen):
// samlede History Go-personer legemliggjør access_map-arketyper deterministisk,
// ukjente/usamlede kategorier lar arketypen stå urørt, og RoleModelRuntime
// legger samlede personer som history_people på role_model_meta.

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const bridgePath = path.join(root, "js/Civication/systems/civicationHistoryPeopleBridge.js");
const roleModelRuntimePath = path.join(root, "js/Civication/systems/civicationRoleModelRuntime.js");

const FIXTURE_INDEX = {
  schema: "civication_history_people_index_v1",
  categories: {
    kunst: [
      { id: "edvard_munch", name: "Edvard Munch", category: "kunst", desc: "Maler.", placeId: "ekely" },
      { id: "gustav_vigeland", name: "Gustav Vigeland", category: "kunst", desc: "Billedhugger.", placeId: "vigelandsparken" }
    ],
    litteratur: [
      { id: "camilla_collett", name: "Camilla Collett", category: "litteratur", desc: "Forfatter.", placeId: "eidsvoll_plass" }
    ],
    sport: [
      { id: "sonja_henie", name: "Sonja Henie", category: "sport", desc: "Kunstløper.", placeId: "frogner_stadion" }
    ]
  }
};

function createLocalStorage() {
  const store = new Map();
  return {
    getItem(key) {
      key = String(key);
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(String(key), String(value));
    },
    removeItem(key) {
      store.delete(String(key));
    },
    clear() {
      store.clear();
    }
  };
}

function freshEnv(collectedIds) {
  global.window = global;
  global.CivicationHistoryPeopleBridge = undefined;
  global.CivicationRoleModelRuntime = undefined;
  global.CivicationJsonStore = undefined;
  global.CivicationEventEngine = undefined;
  global.localStorage = createLocalStorage();
  global.document = {
    readyState: "complete",
    addEventListener() {}
  };
  global.addEventListener = function () {};
  global.fetch = async function (url) {
    if (String(url).includes("historyPeople_index.json")) {
      return { ok: true, json: async () => FIXTURE_INDEX };
    }
    return { ok: false, json: async () => null };
  };

  const collected = {};
  (collectedIds || []).forEach((id) => { collected[id] = true; });
  global.localStorage.setItem("people_collected", JSON.stringify(collected));

  vm.runInThisContext(fs.readFileSync(bridgePath, "utf8"), { filename: bridgePath });
  return global.CivicationHistoryPeopleBridge;
}

function archetypeRow(overrides) {
  return {
    id: "person_artist_001",
    type: "artist",
    name: "Kunstneren i omløp",
    description: "Konstruert arketype.",
    source: "access_map",
    hg_categories: ["kunst"],
    score: 5,
    ...overrides
  };
}

async function run() {
  // 1) Ingen samlede personer -> arketypen står urørt.
  {
    const bridge = freshEnv([]);
    const rows = await bridge.decorateAvailablePeople([archetypeRow()]);
    assert.strictEqual(rows[0].name, "Kunstneren i omløp");
    assert.strictEqual(rows[0].hg_person, undefined);
  }

  // 2) Samlet person i kategorien -> identitetsbytte, mekanikken beholdes.
  {
    const bridge = freshEnv(["edvard_munch"]);
    const rows = await bridge.decorateAvailablePeople([archetypeRow()]);
    assert.strictEqual(rows[0].name, "Edvard Munch");
    assert.strictEqual(rows[0].description, "Maler.");
    assert.strictEqual(rows[0].archetype_name, "Kunstneren i omløp");
    assert.strictEqual(rows[0].hg_person.id, "edvard_munch");
    assert.strictEqual(rows[0].hg_person.placeId, "ekely");
    // Mekanikk-feltene er urørt.
    assert.strictEqual(rows[0].id, "person_artist_001");
    assert.strictEqual(rows[0].source, "access_map");
    assert.strictEqual(rows[0].score, 5);
  }

  // 3) Deterministisk: samme samling gir samme person hver gang.
  {
    const bridge = freshEnv(["edvard_munch", "gustav_vigeland"]);
    const first = await bridge.decorateAvailablePeople([archetypeRow()]);
    const second = await bridge.decorateAvailablePeople([archetypeRow()]);
    assert.strictEqual(first[0].hg_person.id, second[0].hg_person.id);
  }

  // 4) To arketyper i samme kategori viser aldri samme person.
  {
    const bridge = freshEnv(["edvard_munch", "gustav_vigeland"]);
    const rows = await bridge.decorateAvailablePeople([
      archetypeRow(),
      archetypeRow({ id: "person_curator_001", name: "Kuratoren" })
    ]);
    assert.ok(rows[0].hg_person && rows[1].hg_person);
    assert.notStrictEqual(rows[0].hg_person.id, rows[1].hg_person.id);
  }

  // 5) Kun én samlet person og to arketyper -> den andre beholder arketypen.
  {
    const bridge = freshEnv(["edvard_munch"]);
    const rows = await bridge.decorateAvailablePeople([
      archetypeRow(),
      archetypeRow({ id: "person_curator_001", name: "Kuratoren" })
    ]);
    const decorated = rows.filter((r) => r.hg_person);
    assert.strictEqual(decorated.length, 1);
    const untouched = rows.find((r) => !r.hg_person);
    assert.ok(["Kunstneren i omløp", "Kuratoren"].includes(untouched.name));
  }

  // 6) Rader som ikke er access_map-arketyper røres aldri.
  {
    const bridge = freshEnv(["edvard_munch"]);
    const roleBase = { id: "npc_x", name: "Fiktiv kollega", source: "role_base", hg_categories: ["kunst"] };
    const rows = await bridge.decorateAvailablePeople([roleBase, archetypeRow()]);
    assert.strictEqual(rows[0].name, "Fiktiv kollega");
    assert.strictEqual(rows[0].hg_person, undefined);
  }

  // 7) Samlet person i annen kategori enn arketypens -> ingen bytte.
  {
    const bridge = freshEnv(["sonja_henie"]);
    const rows = await bridge.decorateAvailablePeople([archetypeRow()]);
    assert.strictEqual(rows[0].name, "Kunstneren i omløp");
  }

  // 8) RoleModelRuntime: samlede personer i rollemodellens kategori blir
  //    history_people på role_model_meta; people_connections speiles fra filen.
  {
    freshEnv(["edvard_munch", "camilla_collett"]);
    vm.runInThisContext(fs.readFileSync(roleModelRuntimePath, "utf8"), { filename: roleModelRuntimePath });
    const runtime = global.CivicationRoleModelRuntime;
    const model = {
      schema: "civication_role_model_v1",
      category: "kunst",
      role_id: "kunst_kurator",
      title: "Kurator",
      required_knowledge: { people_connections: ["gustav_vigeland"] }
    };
    const mail = { id: "mail_1", subject: "Test" };
    const decorated = await runtime.decorateMail(mail, null, model);
    assert.deepStrictEqual(
      decorated.role_model_meta.history_people,
      [{ id: "edvard_munch", name: "Edvard Munch" }]
    );
    assert.deepStrictEqual(decorated.role_model_meta.people_connections, ["gustav_vigeland"]);
  }

  // 9) NextActionUI viser forbilde-linjen når mailens event har
  //    role_model_meta.history_people (satt av RoleModelRuntime).
  //    Mini-DOM etter mønster fra civication-next-action-consolidation.test.js.
  {
    class FakeEl {
      constructor(tag) {
        this.tagName = String(tag || "div").toUpperCase();
        this.children = [];
        this.parentElement = null;
        this._id = "";
        this.className = "";
        this._innerHTML = "";
        this._attrs = {};
        this._classes = new Set();
      }
      set id(v) { this._id = String(v || ""); }
      get id() { return this._id; }
      set innerHTML(v) { this._innerHTML = String(v || ""); this.children = []; }
      get innerHTML() { return this._innerHTML; }
      appendChild(child) { child.parentElement = this; this.children.push(child); return child; }
      setAttribute(k, v) { this._attrs[k] = String(v); }
      getAttribute(k) { return k in this._attrs ? this._attrs[k] : null; }
      addEventListener() {}
      querySelector() { return null; }
      querySelectorAll() { return []; }
      get classList() {
        const set = this._classes;
        return {
          add: (c) => set.add(c),
          remove: (c) => set.delete(c),
          toggle: (c) => { set.has(c) ? set.delete(c) : set.add(c); },
          contains: (c) => set.has(c)
        };
      }
    }
    function findById(root, id) {
      if (!root) return null;
      if (root.id === id) return root;
      for (const c of root.children) {
        const hit = findById(c, id);
        if (hit) return hit;
      }
      return null;
    }

    global.window = global;
    global.Event = function Event(type) { this.type = type; };
    global.addEventListener = () => {};
    global.dispatchEvent = () => {};
    global.setTimeout = (fn) => { fn(); return 0; };
    global.localStorage = createLocalStorage();
    global.CivicationNextActionUI = undefined;
    const body = new FakeEl("body");
    global.document = {
      body,
      getElementById(id) { return findById(body, id); },
      createElement(tag) { return new FakeEl(tag); },
      addEventListener() {},
      readyState: "complete"
    };

    const action = {
      source: "day_phase", id: "mail-A", subject: "Fasesak A",
      body: "Hva gjør du?", situation: [], summary: "",
      phase: "morning", phaseLabel: "Morgen", mail_type: "job", slot: "morning", status: "delivered",
      choices: [{ id: "A1", label: "Ja" }], isTaskGate: false, taskId: ""
    };
    global.CivicationNextActionSelector = { getCurrent: () => action };
    global.CivicationMailEngine = {
      getInbox: () => [{
        id: "mail-A",
        status: "open",
        event: {
          id: "mail-A",
          subject: "Fasesak A",
          choices: [{ id: "A1", label: "Ja" }],
          role_model_meta: {
            history_people: [
              { id: "edvard_munch", name: "Edvard Munch" },
              { id: "camilla_collett", name: "Camilla Collett" }
            ]
          }
        }
      }]
    };

    const uiPath = path.join(root, "js/Civication/ui/CivicationNextActionUI.js");
    vm.runInThisContext(fs.readFileSync(uiPath, "utf8"), { filename: uiPath });
    assert.strictEqual(global.CivicationNextActionUI.open(), true, "NextAction åpner");
    const html = findById(body, "civiNextActionModalBody").innerHTML;
    assert.ok(html.includes("Forbilder fra samlingen din"), "forbilde-linjen rendres");
    assert.ok(html.includes("Edvard Munch, Camilla Collett"), "forbildene listes med navn");

    // Uten history_people rendres ingen forbilde-linje.
    global.CivicationMailEngine = {
      getInbox: () => [{ id: "mail-A", status: "open", event: { id: "mail-A", subject: "Fasesak A", choices: [] } }]
    };
    global.CivicationNextActionUI.refresh?.();
    const html2 = findById(body, "civiNextActionModalBody").innerHTML;
    assert.ok(!html2.includes("Forbilder fra samlingen din"), "ingen forbilde-linje uten history_people");
  }

  console.log("civication-history-people-bridge.test.js: alle tester OK");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
