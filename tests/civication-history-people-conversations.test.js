#!/usr/bin/env node
// Verifiserer at hele History Go-personsamlingen blir et separat sosialt lag i
// Civication: ingen 8-cap, ingen usamlende personer, ingen duplikater mot den
// eksisterende arketypelisten, tilgjengelig uten aktiv jobbrolle og koblet til
// den eksisterende private samtalemotoren.

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const bridgePath = path.join(root, "js/Civication/systems/civicationHistoryPeopleBridge.js");
const peopleEnginePath = path.join(root, "js/Civication/systems/civicationPeopleEngine.js");
const peopleUiPath = path.join(root, "js/Civication/ui/CivicationPeopleUI.js");

const collectedPeople = Array.from({ length: 10 }, (_, index) => {
  const n = String(index + 1).padStart(2, "0");
  return {
    id: `person_${n}`,
    name: `Historisk Person ${n}`,
    category: "kunst",
    desc: `Historisk person nummer ${n}.`,
    placeId: `place_${n}`,
    year: 1900 + index
  };
});

const FIXTURE_INDEX = {
  schema: "civication_history_people_index_v1",
  person_count: 11,
  categories: {
    kunst: [
      ...collectedPeople,
      {
        id: "person_11",
        name: "Ikke samlet person",
        category: "kunst",
        desc: "Skal ikke bli samtalepartner.",
        placeId: "place_11",
        year: 1911
      }
    ]
  }
};

const ACCESS_MAP = {
  people: Array.from({ length: 10 }, (_, index) => ({
    id: `archetype_${index + 1}`,
    type: "person",
    name: `Arketype ${index + 1}`,
    description: "Kontekstfigur.",
    social_style: "cultural",
    character_potential: "medium",
    hg_categories: index === 0 ? ["kunst"] : []
  }))
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

function createHost() {
  return {
    innerHTML: "",
    __civiHistoryConversationBound: false,
    addEventListener(type, handler) {
      if (type === "click") this._click = handler;
    }
  };
}

function setupGlobals() {
  global.window = global;
  global.CivicationHistoryPeopleBridge = undefined;
  global.CivicationPeopleEngine = undefined;
  global.CivicationPeopleUI = undefined;
  global.CivicationJsonStore = undefined;
  global.CivicationPlaceAccessBridge = { getBucket: () => [] };
  global.HG_IdentityCore = { getProfile: () => ({ dominant: null, focus: {} }) };
  global.localStorage = createLocalStorage();
  global.Event = function Event(type) { this.type = type; };
  global.addEventListener = function () {};
  global.dispatchEvent = function () {};

  const collected = Object.fromEntries(collectedPeople.map((person) => [person.id, true]));
  global.localStorage.setItem("people_collected", JSON.stringify(collected));

  global.fetch = async function (url) {
    const target = String(url);
    if (target.includes("historyPeople_index.json")) {
      return { ok: true, json: async () => FIXTURE_INDEX };
    }
    if (target.includes("people_access_map.json")) {
      return { ok: true, json: async () => ACCESS_MAP };
    }
    if (target.includes("data/people/people_kunst.json")) {
      return { ok: true, json: async () => [] };
    }
    if (target.includes("data/Civication/people/kunst/kunst_test_people_base.json")) {
      return { ok: true, json: async () => ({ people: [] }) };
    }
    return { ok: false, json: async () => null };
  };

  const host = createHost();
  global.document = {
    readyState: "complete",
    addEventListener() {},
    getElementById(id) {
      return id === "civiPeoplePanel" ? host : null;
    }
  };

  return host;
}

async function run() {
  const host = setupGlobals();

  vm.runInThisContext(fs.readFileSync(bridgePath, "utf8"), { filename: bridgePath });
  const bridge = global.CivicationHistoryPeopleBridge;

  // 1) Hele den faktiske samlingen blir samtalepartnere. Ikke-samlet indeksrad
  //    skal aldri lekke inn, og 8-grensen fra gammel kontekstliste gjelder ikke.
  const collectedRows = await bridge.getCollectedConversationPeople();
  assert.strictEqual(collectedRows.length, 10, "alle 10 samlede personer eksponeres");
  assert.strictEqual(collectedRows.some((row) => row.hg_person.id === "person_11"), false, "usamlet person eksponeres ikke");
  assert.strictEqual(new Set(collectedRows.map((row) => row.hg_person.id)).size, 10, "canonical person-id er unik");
  assert.ok(collectedRows.every((row) => row.source === "history_go_collection"), "samlingen har eget source-lag");
  assert.ok(collectedRows.every((row) => row.can_converse === true), "alle samlede personer kan samtale");
  assert.ok(
    collectedRows.every((row) => row.conversation_friend_id === `history_go_person_${row.hg_person.id}`),
    "samtale-ID namespacer History Go-personen stabilt"
  );

  // 2) PeopleEngine uten aktiv karriererolle skal fortsatt vise hele samlingen.
  global.CivicationState = { getActivePosition: () => null };
  vm.runInThisContext(fs.readFileSync(peopleEnginePath, "utf8"), { filename: peopleEnginePath });
  let state = await global.CivicationPeopleEngine.rebuildPeopleState();
  assert.strictEqual(state.role_scope, null);
  assert.strictEqual(state.career_id, null);
  assert.strictEqual(state.available_people.length, 10, "History Go-samtalepartnere er rolleuavhengige");
  assert.ok(state.available_people.every((row) => row.source === "history_go_collection"));

  // 3) Med aktiv rolle beholder den gamle Civication-kontekstlisten sin 8-cap,
  //    mens alle 10 samlede personer fortsatt finnes nøyaktig én gang. Den ene
  //    personen som legemliggjør en arketype skal derfor ikke også appendes.
  const active = { career_id: "kunst", role_scope: "kunst_test" };
  global.CivicationState = { getActivePosition: () => active };
  state = await global.CivicationPeopleEngine.rebuildPeopleState(active);
  const contextRows = state.available_people.filter((row) => row.source !== "history_go_collection");
  const historyRows = state.available_people.filter((row) => row.hg_person);
  assert.strictEqual(contextRows.length, 8, "gammel kontekstliste beholder 8-cap");
  assert.strictEqual(historyRows.length, 10, "alle 10 samlede History Go-personer er representert");
  assert.strictEqual(new Set(historyRows.map((row) => row.hg_person.id)).size, 10, "ingen dobbeltvisning mot dekorert arketype");
  assert.strictEqual(historyRows.some((row) => row.hg_person.id === "person_11"), false);

  // 4) PeopleUI viser en Samtale-knapp per samlet person og bruker eksisterende
  //    private SocialConversationEngine med stabil, namespacet friendId.
  let createArgs = null;
  let opened = null;
  global.CivicationFriendsEngine = { getCurrentPhase: () => "leisure" };
  global.CivicationSocialConversationEngine = {
    createSocialConversationFromResponse(response, context) {
      createArgs = { response, context };
      return {
        conversationId: `conv_${response.friendId}_leisure_001`,
        threadId: `friend_${response.friendId}`,
        friendId: response.friendId,
        friendName: response.friendName,
        phase: response.phase,
        status: "open"
      };
    }
  };
  global.CivicationFriendMessages = {
    dispatchPrivateMessageOpen(friendId, context) {
      opened = { friendId, context };
      return context;
    }
  };

  vm.runInThisContext(fs.readFileSync(peopleUiPath, "utf8"), { filename: peopleUiPath });
  global.CivicationPeopleUI.render();
  const buttonCount = (host.innerHTML.match(/data-civi-history-person=/g) || []).length;
  assert.strictEqual(buttonCount, 10, "én Samtale-knapp per samlet person");
  assert.ok(host.innerHTML.includes("Historisk Person 01"));
  assert.ok(!host.innerHTML.includes("Ikke samlet person"));

  const started = global.CivicationPeopleUI.startHistoryConversation("person_01");
  assert.strictEqual(started.ok, true);
  assert.strictEqual(createArgs.response.responseId, "reply");
  assert.strictEqual(createArgs.response.friendId, "history_go_person_person_01");
  assert.strictEqual(createArgs.response.friendName, "Historisk Person 01");
  assert.strictEqual(createArgs.response.phase, "leisure");
  assert.strictEqual(createArgs.response.messageId, "history_go_collection_person_01");
  assert.strictEqual(createArgs.context.source, "history_go_collection");
  assert.strictEqual(opened.friendId, "history_go_person_person_01");
  assert.strictEqual(started.conversationId, "conv_history_go_person_person_01_leisure_001");

  // 5) En indeks-person som ikke er samlet kan ikke startes via UI/API.
  createArgs = null;
  const blocked = global.CivicationPeopleUI.startHistoryConversation("person_11");
  assert.strictEqual(blocked.ok, false);
  assert.strictEqual(blocked.reason, "history_person_unavailable");
  assert.strictEqual(createArgs, null);

  // 6) Uten aktiv rolle viser UI fortsatt History Go-samtalepartnerne og ingen
  //    gammel jobb-/rollekontekst fra tidligere state.
  global.CivicationState = { getActivePosition: () => null };
  await global.CivicationPeopleEngine.rebuildPeopleState();
  global.CivicationPeopleUI.render();
  assert.ok(host.innerHTML.includes("Samtalepartnere fra History Go"));
  assert.strictEqual((host.innerHTML.match(/data-civi-history-person=/g) || []).length, 10);
  assert.ok(!host.innerHTML.includes("Arketype 2"));

  console.log("civication-history-people-conversations.test.js: alle tester OK");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});