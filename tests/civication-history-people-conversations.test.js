#!/usr/bin/env node
// Regresjon for riktig Civication-kontrakt:
// History Go-personer er IKKE en fri kontaktliste. De kan bare bli
// samtalepartnere når en aktiv rollemail selv eksponerer dem gjennom
// role_model_meta.history_people, og samtalen skal utdype akkurat den
// rollen/oppgaven samtidig som den forblir en personlig melding.

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const bridgePath = path.join(root, "js/Civication/systems/civicationHistoryPeopleBridge.js");
const peopleEnginePath = path.join(root, "js/Civication/systems/civicationPeopleEngine.js");
const peopleUiPath = path.join(root, "js/Civication/ui/CivicationPeopleUI.js");
const roleMailUiPath = path.join(root, "js/Civication/ui/CivicationRoleMailPeopleUI.js");

function source(pathname) {
  return fs.readFileSync(pathname, "utf8");
}

function setupGlobals() {
  global.window = global;
  global.Event = function Event(type) { this.type = type; };
  global.addEventListener = function () {};
  global.requestAnimationFrame = function (fn) { fn(); return 1; };
  global.setTimeout = function (fn) { fn(); return 1; };

  global.document = {
    addEventListener() {},
    getElementById() { return null; }
  };

  const roleEvent = {
    id: "mail_kunst_formidler_01",
    subject: "Formidle et vanskelig verk",
    phase: "work",
    situation: ["Du skal forklare et krevende verk for et publikum som har kort tid."],
    task_payload: {
      expected_output: "Lag en kort formidling som gjør verkets konflikt forståelig."
    },
    role_model_meta: {
      category: "kunst",
      role_scope: "formidler",
      role_id: "kunst_formidler",
      title: "Formidler",
      professional_description: ["Formidleren må koble faglig presisjon til et språk publikum faktisk kan bruke."],
      selected_competence_axes: [
        { id: "publikumsforstaelse", title: "Publikumsforståelse", description: "Tilpass dybde uten å gjøre innholdet flatt." }
      ],
      selected_ideal_type_problems: [
        { id: "forenkling", title: "Forenkling mot presisjon", description: "Hvor mye kan forenkles før meningen forsvinner?" }
      ],
      history_people: [
        { id: "edvard_munch", name: "Edvard Munch" }
      ]
    }
  };

  global.CivicationState = {
    getActivePosition() {
      return { career_id: "kunst", role_scope: "formidler", title: "Formidler" };
    },
    getInbox() { return [{ status: "pending", event: roleEvent }]; }
  };
  global.CivicationCareerRoleResolver = {
    resolveCareerRoleScope() { return "formidler"; }
  };
  global.CivicationMailEngine = {
    getInbox() { return [{ status: "pending", event: roleEvent }]; }
  };
  global.CivicationHistoryPeopleBridge = {
    getCollectedByCategory(category) {
      assert.strictEqual(category, "kunst");
      return [
        {
          id: "edvard_munch",
          name: "Edvard Munch",
          category: "kunst",
          desc: "Munch arbeidet gjentatte ganger med angst, tap og spenningen mellom personlig erfaring og offentlig uttrykk."
        },
        {
          id: "annen_person",
          name: "Annen Person",
          category: "kunst",
          desc: "Finnes i samlingen, men er ikke koblet til denne rollemailen."
        }
      ];
    }
  };

  let registered = null;
  let opened = null;
  let conversationArgs = null;

  global.CivicationFriendMessages = {
    resolvePrivateThreadForFriend(friendId) { return "friend_" + friendId; },
    registerPrivateMessage(message) {
      registered = message;
      return { registered: true, event: { channel: "private", mail_class: "private_message" } };
    },
    dispatchPrivateMessageOpen(friendId, context) {
      opened = { friendId, context };
      return context;
    }
  };
  global.CivicationSocialConversationEngine = {
    createSocialConversationFromResponse(response, context) {
      conversationArgs = { response, context };
      return {
        conversationId: "conv_" + response.friendId + "_001",
        friendId: response.friendId,
        friendName: response.friendName,
        phase: response.phase,
        status: "open"
      };
    }
  };
  global.CivicationFriendsEngine = { getCurrentPhase: () => "work" };
  global.CivicationNextActionUI = {
    open() { return true; },
    render() { return true; },
    refresh() { return true; },
    getCurrent() { return { id: roleEvent.id, subject: roleEvent.subject }; }
  };

  return {
    roleEvent,
    getRegistered: () => registered,
    getOpened: () => opened,
    getConversationArgs: () => conversationArgs
  };
}

function run() {
  // 1) #6121 sin globale kontaktliste skal være borte.
  const bridgeSource = source(bridgePath);
  const peopleEngineSource = source(peopleEnginePath);
  const peopleUiSource = source(peopleUiPath);

  assert.ok(!bridgeSource.includes("getCollectedConversationPeople"), "bridge skal ikke eksponere hele samlingen som samtalepartnere");
  assert.ok(!peopleEngineSource.includes("getCollectedHistoryPeople"), "PeopleEngine skal ikke appendere hele History Go-samlingen");
  assert.ok(!peopleUiSource.includes("data-civi-history-person"), "People-panelet skal ikke ha fri samtaleknapp for History Go-samlingen");
  assert.ok(peopleEngineSource.includes("available_people: []"), "uten aktiv rolle skal PeopleEngine ha tom tilgjengelig-liste");

  // 2) Rollemail-People-laget bruker kun personer som mailen selv har koblet inn.
  const state = setupGlobals();
  vm.runInThisContext(source(roleMailUiPath), { filename: roleMailUiPath });
  const ui = global.CivicationRoleMailPeopleUI;

  const ctx = ui.getRoleMailContext("mail_kunst_formidler_01");
  assert.ok(ctx, "aktiv rollemail skal gi People-kontekst");
  assert.deepStrictEqual(ctx.people.map((p) => p.id), ["edvard_munch"]);

  const html = ui.buildPeopleHtml("mail_kunst_formidler_01");
  assert.ok(html.includes("Snakk med Edvard Munch om oppgaven"));
  assert.ok(!html.includes("Annen Person"), "samlet, men ikke mail-koblet person skal ikke vises");

  // 3) Samtalen utdyper rollemailens liv/oppgave og forblir privat.
  const started = ui.startRoleMailConversation("mail_kunst_formidler_01", "edvard_munch");
  assert.strictEqual(started.ok, true);
  assert.strictEqual(started.friendId, "history_go_person_edvard_munch");

  const registered = state.getRegistered();
  assert.ok(registered, "personlig melding skal registreres");
  assert.strictEqual(registered.channel, "private");
  assert.strictEqual(registered.type, "private");
  assert.strictEqual(registered.source, "civication_role_mail_person");
  assert.ok(!Object.prototype.hasOwnProperty.call(registered, "career_id"));
  assert.ok(!Object.prototype.hasOwnProperty.call(registered, "role_scope"));
  assert.ok(registered.body.includes("Edvard Munch"));
  assert.ok(registered.body.includes("Formidler-rollen"));
  assert.ok(registered.body.includes("Formidle et vanskelig verk"));
  assert.ok(registered.body.includes("Munch arbeidet gjentatte ganger"));
  assert.ok(registered.body.includes("Lag en kort formidling"));
  assert.ok(registered.body.includes("Formidleren må koble faglig presisjon"));
  assert.ok(registered.body.includes("Publikumsforståelse"));
  assert.ok(registered.body.includes("Forenkling mot presisjon"));

  const conversationArgs = state.getConversationArgs();
  assert.strictEqual(conversationArgs.response.friendId, "history_go_person_edvard_munch");
  assert.strictEqual(conversationArgs.context.source, "civication_role_mail_person");
  assert.strictEqual(state.getOpened().friendId, "history_go_person_edvard_munch");

  // 4) En person som finnes i History Go-samlingen, men ikke på akkurat denne
  //    rollemailen, kan ikke startes som samtalepartner.
  const unrelated = ui.startRoleMailConversation("mail_kunst_formidler_01", "annen_person");
  assert.strictEqual(unrelated.ok, false);
  assert.strictEqual(unrelated.reason, "person_not_linked_to_role_mail");

  // 5) Samme mail kan ikke brukes når aktiv rolle ikke lenger matcher mailens rolle.
  global.CivicationCareerRoleResolver.resolveCareerRoleScope = () => "gallerist";
  const wrongRole = ui.startRoleMailConversation("mail_kunst_formidler_01", "edvard_munch");
  assert.strictEqual(wrongRole.ok, false);
  assert.strictEqual(wrongRole.reason, "role_mail_people_unavailable");

  console.log("civication-history-people-conversations.test.js: alle tester OK");
}

run();
