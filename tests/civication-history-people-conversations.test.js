#!/usr/bin/env node
// Verifiserer den korrigerte People-kontrakten:
// - History Go-personer er ikke en fri/rolleuavhengig kontaktliste.
// - RoleModelRuntime velger maks tre samlede personer fra rollens kategori og
//   legger dem på den konkrete rollemailen som role_model_meta.history_people.
// - NextAction kan bare bruke personer som faktisk finnes på den aktive mailen,
//   og perspektivet utdyper oppgave, rolle og dilemma.

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const bridgePath = path.join(root, "js/Civication/systems/civicationHistoryPeopleBridge.js");
const peopleEnginePath = path.join(root, "js/Civication/systems/civicationPeopleEngine.js");
const peopleUiPath = path.join(root, "js/Civication/ui/CivicationPeopleUI.js");
const roleRuntimePath = path.join(root, "js/Civication/systems/civicationRoleModelRuntime.js");
const nextActionPath = path.join(root, "js/Civication/ui/CivicationNextActionUI.js");

const kunstPeople = Array.from({ length: 5 }, (_, index) => {
  const n = String(index + 1).padStart(2, "0");
  return {
    id: `kunst_person_${n}`,
    name: `Kunstperson ${n}`,
    category: "kunst",
    desc: `Historisk kunstperson nummer ${n}.`,
    placeId: `kunst_place_${n}`,
    year: 1900 + index,
    image: `/bilder/people/kunst_${n}.jpg`
  };
});

const historiePerson = {
  id: "historie_person_01",
  name: "Historieperson 01",
  category: "historie",
  desc: "Relevant for historie, ikke for kunstrollen.",
  placeId: "historie_place_01",
  year: 1880
};

const FIXTURE_INDEX = {
  schema: "civication_history_people_index_v1",
  person_count: 7,
  categories: {
    kunst: [
      ...kunstPeople,
      {
        id: "kunst_usamlet",
        name: "Usamlet kunstperson",
        category: "kunst",
        desc: "Skal aldri følge mailen.",
        placeId: "kunst_place_x",
        year: 1920
      }
    ],
    historie: [historiePerson]
  }
};

const ROLE_MODEL = {
  schema: "civication_role_model_v1",
  category: "kunst",
  role_scope: "kurator",
  role_id: "kunst_kurator",
  title: "Kurator",
  education_basis: ["Kunsthistorie og kuratorisk praksis"],
  professional_description: [
    "Kuratoren vurderer kvalitet, kontekst og offentlig presentasjon.",
    "Arbeidet krever prioritering mellom verk, institusjon og publikum."
  ],
  competence_axes: [
    { id: "context_reading", label: "kontekstlesning" },
    { id: "public_judgement", label: "offentlig vurdering" }
  ],
  ideal_type_problems: [
    { id: "quality_vs_access", label: "kvalitet mot tilgjengelighet" }
  ],
  required_knowledge: {
    people_connections: ["kunstnere", "institusjoner"]
  }
};

const ACTIVE = {
  career_id: "kunst",
  role_scope: "kurator",
  role_id: "kunst_kurator",
  title: "Kurator"
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

function resetGlobals() {
  global.window = global;
  global.CivicationHistoryPeopleBridge = undefined;
  global.CivicationPeopleEngine = undefined;
  global.CivicationPeopleUI = undefined;
  global.CivicationRoleModelRuntime = undefined;
  global.CivicationNextActionUI = undefined;
  global.CivicationJsonStore = undefined;
  global.CivicationEventEngine = undefined;
  global.CivicationPlaceAccessBridge = { getBucket: () => [] };
  global.HG_IdentityCore = { getProfile: () => ({ dominant: null, focus: {} }) };
  global.localStorage = createLocalStorage();
  global.Event = function Event(type) { this.type = type; };
  global.addEventListener = function () {};
  global.dispatchEvent = function () {};
  global.requestAnimationFrame = undefined;
  global.document = {
    readyState: "complete",
    body: null,
    addEventListener() {},
    getElementById() { return null; }
  };

  const collected = Object.fromEntries([
    ...kunstPeople.map((person) => [person.id, true]),
    [historiePerson.id, true]
  ]);
  global.localStorage.setItem("people_collected", JSON.stringify(collected));

  global.fetch = async function (url) {
    const target = String(url);
    if (target.includes("historyPeople_index.json")) {
      return { ok: true, json: async () => FIXTURE_INDEX };
    }
    return { ok: false, json: async () => null };
  };
}

async function run() {
  resetGlobals();

  // 1) Bridge eksponerer kategoribundet samling, men ikke #6121 sin frie
  //    conversation-people API.
  vm.runInThisContext(fs.readFileSync(bridgePath, "utf8"), { filename: bridgePath });
  const bridge = global.CivicationHistoryPeopleBridge;
  await bridge.load();
  assert.strictEqual(typeof bridge.getCollectedConversationPeople, "undefined");
  assert.strictEqual(typeof bridge.conversationFriendId, "undefined");
  assert.strictEqual(bridge.getCollectedByCategory("kunst").length, 5);
  assert.strictEqual(bridge.getCollectedByCategory("historie").length, 1);
  assert.strictEqual(bridge.getCollectedByCategory("kunst").some((p) => p.id === "kunst_usamlet"), false);

  // 2) PeopleEngine skal igjen være rolleavhengig. Uten aktiv rolle finnes det
  //    ingen fri liste over History Go-personer.
  global.CivicationState = { getActivePosition: () => null };
  vm.runInThisContext(fs.readFileSync(peopleEnginePath, "utf8"), { filename: peopleEnginePath });
  const noRoleState = await global.CivicationPeopleEngine.rebuildPeopleState();
  assert.strictEqual(noRoleState.role_scope, null);
  assert.strictEqual(noRoleState.career_id, null);
  assert.deepStrictEqual(noRoleState.available_people, []);

  // PeopleUI skal heller ikke ha en fri startHistoryConversation-inngang.
  vm.runInThisContext(fs.readFileSync(peopleUiPath, "utf8"), { filename: peopleUiPath });
  assert.strictEqual(typeof global.CivicationPeopleUI.startHistoryConversation, "undefined");

  // 3) RoleModelRuntime binder samlet People til den konkrete rollemailen.
  //    Fem relevante personer finnes i samlingen, men mailen får maks tre.
  global.CivicationState = { getActivePosition: () => ACTIVE };
  vm.runInThisContext(fs.readFileSync(roleRuntimePath, "utf8"), { filename: roleRuntimePath });

  const rawMail = {
    id: "mail_kurator_01",
    subject: "Velg verk til den nye utstillingen",
    situation: ["Du må prioritere mellom sterke verk med ulike publikumsbehov."],
    task_domain: "kuratorisk vurdering",
    task_payload: {
      expected_output: "Velg en begrunnet verkssammensetning"
    },
    role_model_refs: {
      competence_axes: ["context_reading", "public_judgement"],
      ideal_type_problems: ["quality_vs_access"]
    },
    choices: [
      { id: "A", label: "Prioriter helhet" },
      { id: "B", label: "Prioriter bredde" }
    ]
  };

  const decorated = await global.CivicationRoleModelRuntime.decorateMail(rawMail, ACTIVE, ROLE_MODEL);
  const linkedPeople = decorated.role_model_meta.history_people;
  assert.strictEqual(linkedPeople.length, 3, "rollemailen har maks tre relevante History Go-personer");
  assert.deepStrictEqual(linkedPeople.map((p) => p.id), ["kunst_person_01", "kunst_person_02", "kunst_person_03"]);
  assert.ok(linkedPeople.every((p) => p.category === "kunst"));
  assert.ok(linkedPeople.every((p) => p.description.startsWith("Historisk kunstperson")));
  assert.strictEqual(linkedPeople.some((p) => p.id === historiePerson.id), false, "person fra feil rollekategori følger ikke mailen");
  assert.strictEqual(linkedPeople.some((p) => p.id === "kunst_usamlet"), false, "usamlet person følger ikke mailen");
  assert.strictEqual(linkedPeople[0].year, 1900);
  assert.strictEqual(linkedPeople[0].place_id, "kunst_place_01");

  // 4) NextAction kan kun bruke personer som ligger på denne konkrete mailen.
  global.CivicationMailEngine = {
    getInbox() {
      return [{ id: decorated.id, status: "pending", event: decorated }];
    }
  };
  global.CivicationTaskEngine = {
    getTaskByMailId(mailId) {
      if (mailId !== decorated.id) return null;
      return {
        kind: "kuratorisk vurdering",
        task_payload: { expected_output: "Velg en begrunnet verkssammensetning" }
      };
    }
  };
  global.CivicationNextActionSelector = { getCurrent: () => decorated };
  global.CivicationCalendar = { getPhase: () => "work" };
  global.CivicationDayProgression = { inspect: () => null };

  vm.runInThisContext(fs.readFileSync(nextActionPath, "utf8"), { filename: nextActionPath });
  const next = global.CivicationNextActionUI;
  const mailPeople = next.getRoleMailHistoryPeople(decorated.id);
  assert.strictEqual(mailPeople.length, 3);
  assert.deepStrictEqual(mailPeople.map((p) => p.id), ["kunst_person_01", "kunst_person_02", "kunst_person_03"]);

  const taskAnswer = next.buildRoleMailHistoryPersonAnswer(decorated.id, "kunst_person_01", "task");
  assert.ok(taskAnswer);
  assert.strictEqual(taskAnswer.personName, "Kunstperson 01");
  assert.ok(taskAnswer.answer.includes("Velg verk til den nye utstillingen"));
  assert.ok(taskAnswer.answer.includes("Velg en begrunnet verkssammensetning"));
  assert.ok(taskAnswer.answer.includes("kontekstlesning"));

  const roleAnswer = next.buildRoleMailHistoryPersonAnswer(decorated.id, "kunst_person_01", "role");
  assert.ok(roleAnswer.answer.includes("Kurator"));
  assert.ok(roleAnswer.answer.includes("Kuratoren vurderer kvalitet"));
  assert.ok(roleAnswer.answer.includes("offentlig vurdering"));

  const dilemmaAnswer = next.buildRoleMailHistoryPersonAnswer(decorated.id, "kunst_person_01", "dilemma");
  assert.ok(dilemmaAnswer.answer.includes("kvalitet mot tilgjengelighet"));

  // Person 04 er samlet og i riktig kategori, men ligger ikke blant de tre som
  // denne mailen faktisk har fått. Derfor kan ingen samtale startes via mailen.
  assert.strictEqual(next.buildRoleMailHistoryPersonAnswer(decorated.id, "kunst_person_04", "task"), null);
  assert.strictEqual(next.buildRoleMailHistoryPersonAnswer(decorated.id, historiePerson.id, "task"), null);
  assert.deepStrictEqual(next.getRoleMailHistoryPeople("annen_mail"), []);

  console.log("civication-history-people-conversations.test.js: alle tester OK");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
