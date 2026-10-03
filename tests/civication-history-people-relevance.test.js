const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { pathToFileURL } = require("node:url");
const root = path.resolve(__dirname, "..");
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const clone = value => JSON.parse(JSON.stringify(value));
const relevancePath = "data/Civication/historyPeople_relevance_v1.json";
const registry = read(relevancePath);
const index = read("data/Civication/historyPeople_index.json");
const allIds = Object.values(index.categories).flat().map(person => person.id);
const personIds = [...new Set(registry.cases.map(item => item.person_id))];
const rawMails = new Map();
for (const binding of registry.bindings) {
  const catalog = read(binding.source_path);
  const mail = catalog.families.flatMap(family => family.mails).find(row => row.id === binding.mail_id);
  rawMails.set(mail.id, { ...mail, category: mail.category || catalog.category, role_scope: mail.role_scope || catalog.role_scope });
}
function modelFor(scope) { return read(`data/Civication/roleModels/kunst/${scope}.json`); }
function activeFor(scope) { return { career_id: "kunst", role_scope: scope, role_id: scope, brand_id: "relevance_test" }; }
function ids(mail) { return clone(mail.role_model_meta.history_people.map(person => person.id)); }

class Element {
  constructor() { this.children = []; this.parentElement = null; this.attrs = {}; this.listeners = {}; this.classes = new Set(); this.html = ""; }
  set innerHTML(value) { this.html = String(value); this.children = []; }
  get innerHTML() { return this.html; }
  appendChild(child) { child.parentElement = this; this.children.push(child); return child; }
  setAttribute(key, value) { this.attrs[key] = String(value); }
  getAttribute(key) { return this.attrs[key] ?? null; }
  addEventListener(type, fn) { this.listeners[type] = fn; }
  querySelectorAll() { return []; }
  contains(child) { return child === this || this.children.some(row => row.contains(child)); }
  closest(selector) { return this.attrs[selector.slice(1, -1)] != null ? this : null; }
  get classList() { return { add: key => this.classes.add(key), remove: key => this.classes.delete(key), contains: key => this.classes.has(key) }; }
}
function findElement(element, id) { return element.id === id ? element : element.children.map(child => findElement(child, id)).find(Boolean) || null; }

function environment(compiled, options = {}) {
  const storage = new Map([["people_collected", JSON.stringify(Object.fromEntries((options.collected || allIds).map(id => [id, true])))]]);
  const requests = [];
  const body = new Element();
  let dayIndex = 1, inbox = [], current = null;
  const document = { readyState: "complete", body, addEventListener() {}, createElement: () => new Element(), getElementById: id => findElement(body, id) };
  const window = {
    DEBUG: false, document, addEventListener() {}, dispatchEvent() {},
    localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, String(value)) },
    CivicationState: { getState: () => ({}), getActivePosition: () => current?.active || null },
    CivicationCalendar: { getPhaseModel: () => ({ dayIndex }), getDisplayModel: () => ({ dayIndex }), getPhase: () => "workday" },
    CivicationCareerRoleResolver: { resolveCareerRoleScope: active => active?.role_scope || "" },
    CivicationWorkdayRuntime: { getEmployerId: () => "relevance_test", getWorkdayDayIndex: () => dayIndex },
    CivicationCareerKnowledgeBridge: { decorateMail: async mail => mail },
    CivicationMailEngine: { getInbox: () => inbox },
    CivicationNextActionSelector: { getCurrent: () => current?.mail || null },
    CivicationMailRuntime: { makeCandidateMailsForActiveRole: async active => (await window.CivicationSceneCatalog.getRoleMails(active)).filter(mail => mail.mail_type === "job") }
  };
  window.CivicationEventEngine = function () {};
  window.CivicationEventEngine.prototype.buildMailPool = async () => ({ mails: [] });
  const fetchJson = async file => {
    requests.push(file);
    if (file === relevancePath) return options.unavailable ? null : clone(options.registry || registry);
    if (file === "data/Civication/compiledSceneRegistryV1.json") return clone(compiled);
    if (file.includes("/roleModels/") && options.missingModel) return null;
    const full = path.join(root, file);
    return fs.existsSync(full) ? read(file) : null;
  };
  window.CivicationJsonStore = { fetchJson };
  window.fetch = async file => { const data = await fetchJson(String(file)); return { ok: !!data, json: async () => data }; };
  window.window = window;
  const context = vm.createContext({ window, document, localStorage: window.localStorage, fetch: window.fetch, console, Date, Promise, Map, Set, Array, Object, String, Number, Math, JSON, setTimeout, Event: function (type) { this.type = type; } });
  function load(file) { vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file }); }
  load("js/Civication/systems/civicationHistoryPeopleBridge.js");
  if (options.runtimeLast) load("js/Civication/systems/civicationWorkdayMailBuilder.js");
  load("js/Civication/systems/civicationRoleModelRuntime.js");
  if (!options.runtimeLast) load("js/Civication/systems/civicationWorkdayMailBuilder.js");
  return {
    window, requests, storage, load, document,
    setDay: value => { dayIndex = value; },
    setCollected: values => storage.set("people_collected", JSON.stringify(Object.fromEntries(values.map(id => [id, true])))),
    show: (mail, active) => { current = { mail, active }; inbox = [{ id: mail.id, event: mail, status: "open" }]; },
    decorate: (mail, active = activeFor(mail.role_scope)) => window.CivicationRoleModelRuntime.decorateMail(clone(mail), active, modelFor(active.role_scope))
  };
}

(async () => {
  const compiler = await import(pathToFileURL(path.join(root, "scripts/build-civication-scene-registry.mjs")).href);
  const audit = await import(pathToFileURL(path.join(root, "scripts/audit-civication-history-people-relevance.mjs")).href);
  assert.deepEqual(audit.auditHistoryPeopleRelevance(root), { roles: 6, mails: 90, linked: 26, empty: 64, persons: 8, cases: 11, sources: 10 });
  const compiled = await compiler.compileRegistryFromRepo(root);
  const env = environment(compiled);
  const storedBefore = env.storage.get("people_collected");
  let checked = 0;
  for (const scope of registry.scope) {
    const active = activeFor(scope.role_scope);
    const catalogMails = await env.window.CivicationSceneCatalog.getRoleMails(active);
    assert.equal(catalogMails.length, 15);
    for (const mail of catalogMails) {
      const binding = registry.bindings.find(row => row.mail_id === mail.id);
      const allowed = binding.people.map(person => person.person_id);
      assert.equal(ids(mail).length, Math.min(allowed.length, 3));
      assert(ids(mail).every(id => allowed.includes(id)), `${mail.id}: unrelated category person`);
      assert.equal(mail.role_model_meta.history_people_relevance.status, allowed.length ? "linked" : "no_supported_link");
      assert.equal(mail.people_ref, binding.people_ref, "fictional sender identity is preserved");
      const workday = env.window.CivicationWorkdayMailBuilder.toWorkdayMail(active, mail, "workday", checked, { date: "2026-10-03", runtimeInstanceKey: "__test" });
      assert.notEqual(workday.id, mail.id);
      assert.equal(workday.source_mail_id, mail.id);
      assert.equal(workday.daily_mail_meta.source_mail_id, mail.id);
      assert.deepEqual(ids(workday), ids(mail));
      assert.deepEqual(ids(await env.decorate(workday)), ids(mail), "instance ID must not change the selected window");
      env.load("js/Civication/ui/CivicationNextActionUI.js");
      env.show(workday, active);
      assert.deepEqual(clone(env.window.CivicationNextActionUI.getRoleMailHistoryPeople(workday.id).map(person => person.id)), ids(mail));
      checked++;
    }
  }
  assert.equal(checked, 90);
  assert.equal(env.requests.filter(file => file === relevancePath).length, 1, "concurrent decorators share one registry read");
  assert.equal(env.storage.get("people_collected"), storedBefore, "Civication never writes to the collection");

  const knowledge = rawMails.get("kunst_kuratering_og_program_knowledge_history_go_grense_001");
  const expectedIds = registry.bindings.find(row => row.mail_id === knowledge.id).people.map(person => person.person_id).sort();
  const day1 = await env.decorate(knowledge);
  env.setDay(2);
  const day2 = await env.decorate(knowledge);
  assert.notDeepEqual(ids(day1), ids(day2));
  assert.deepEqual([...new Set([...ids(day1), ...ids(day2)])].sort(), expectedIds, "rotation covers only the explicit four-person set");
  env.setDay(1);
  env.setCollected(["gustav_vigeland"]);
  const unrelatedOnly = await env.decorate(knowledge);
  assert.deepEqual(ids(unrelatedOnly), []);
  assert.equal(unrelatedOnly.role_model_meta.history_people_relevance.status, "no_collected_candidate");
  env.setCollected([expectedIds[0]]);
  assert.deepEqual(ids(await env.decorate(knowledge)), [expectedIds[0]], "collection changes are not cached");
  env.setCollected(personIds);
  const dailyOnly = { ...knowledge, id: "unparsed__instance", daily_mail_meta: { source_mail_id: knowledge.id } };
  assert.deepEqual(ids(await env.decorate(dailyOnly)), ids(day1));
  const invalidContexts = [
    [{ ...knowledge, source_mail_id: knowledge.id, daily_mail_meta: { source_mail_id: "other" } }, "conflicting_source_ids"],
    [{ ...knowledge, id: knowledge.id + "__workday_2026-10-03" }, "missing_or_duplicate_binding"],
    [{ ...knowledge, place_id: "wrong_workspace" }, "context_mismatch"],
    [{ ...knowledge, people_ref: "munch" }, "context_mismatch"],
    [{ ...knowledge, task_domain: "other_task" }, "context_mismatch"],
    [{ ...knowledge, role_scope: "kunst_museumsledelse" }, "missing_or_duplicate_binding"],
    [{ ...knowledge, scene_catalog_source_hash: "stale" }, "context_mismatch"]
  ];
  for (const [mail, status] of invalidContexts) {
    const result = await env.decorate(mail);
    assert.deepEqual(ids(result), []);
    assert.equal(result.role_model_meta.history_people_relevance.status, status);
  }
  const wrongActive = await env.window.CivicationRoleModelRuntime.decorateMail(knowledge, activeFor("kunst_museumsledelse"), modelFor(knowledge.role_scope));
  assert.deepEqual(ids(wrongActive), []);
  assert.equal(wrongActive.role_model_meta.history_people_relevance.status, "context_mismatch");

  for (const id of ["kunstnerisk_ledelse_followup_rework_etter_estimat_001", "kunstnerisk_ledelse_micro_kan_vi_kalle_det_besluttet_001", "utstillingsproduksjon_consequence_etter_apning_001"]) {
    const mail = rawMails.get(id), model = modelFor(mail.role_scope);
    assert(!model.related_people.find(row => row.id === mail.people_ref).workplace_ids.includes(mail.place_id));
    assert.equal((await env.decorate(mail)).role_model_meta.history_people_relevance.status, "no_supported_link", "mail workplace wins over the actor's fixed workplace");
  }

  const badCases = [
    [data => { data.bindings.find(row => row.mail_id === knowledge.id).people[0].person_id = "unknown_id"; }, "invalid_binding"],
    [data => { data.bindings.find(row => row.mail_id === knowledge.id).people[0].case_ids = ["unknown_case"]; }, "invalid_binding"],
    [data => { data.bindings.push(clone(data.bindings.find(row => row.mail_id === knowledge.id))); }, "missing_or_duplicate_binding"],
    [data => { data.schema = "wrong_schema"; }, "registry_unavailable"]
  ];
  for (const [mutate, status] of badCases) {
    const data = clone(registry); mutate(data);
    assert.throws(() => audit.auditHistoryPeopleRelevance(root, { registry: data }));
    const broken = environment(compiled, { registry: data });
    const result = await broken.decorate(knowledge);
    assert.deepEqual(ids(result), []);
    assert.equal(result.role_model_meta.history_people_relevance.status, status);
  }
  for (const key of ["source_hash", "task_domain"]) {
    const data = clone(registry); data.bindings[0][key] = "changed";
    assert.throws(() => audit.auditHistoryPeopleRelevance(root, { registry: data }), /changed; relevance must be reviewed/);
  }
  const missingBinding = clone(registry); missingBinding.bindings.pop();
  assert.throws(() => audit.auditHistoryPeopleRelevance(root, { registry: missingBinding }), /coverage/);
  assert.equal((await environment(compiled, { unavailable: true }).decorate(knowledge)).role_model_meta.history_people_relevance.status, "registry_unavailable");
  const missing = environment(compiled, { missingModel: true });
  const stale = { ...knowledge, role_model_meta: { ...modelFor(knowledge.role_scope), history_people: [{ id: "gustav_vigeland", name: "Gustav Vigeland" }] } };
  const noModel = await missing.window.CivicationRoleModelRuntime.decorateMail(stale, activeFor(knowledge.role_scope));
  assert.deepEqual(ids(noModel), []);
  assert.equal(noModel.role_model_meta.history_people_relevance.status, "role_model_unavailable");

  // Both boot orders reach the same reviewed metadata through the catalog.
  for (const runtimeLast of [false, true]) {
    const flow = environment(compiled, { runtimeLast });
    const active = activeFor(knowledge.role_scope);
    const pack = await new flow.window.CivicationEventEngine().buildMailPool(active, {}, active.role_scope);
    assert.equal(pack.mails.length, 4);
    assert(pack.mails.every(mail => mail.role_model_meta?.history_people_relevance));
    const daily = await flow.window.CivicationSceneDirector.populateDailyExtraSlots(active, {}, {
      date: "2026-10-03", role_scope: active.role_scope,
      items: ["people_ping", "knowledge", "conflict_or_event"].map(slot => ({ phase: "workday", slot, status: "queued", event: { id: slot, source_type: "daily_generated" } }))
    });
    assert.equal(daily.daily_extra_catalog_count, 3);
    for (const row of daily.items) {
      const binding = registry.bindings.find(item => item.mail_id === row.event.source_mail_id);
      assert(binding);
      assert.equal(row.event.role_model_meta.history_people_relevance.status, binding.people.length ? "linked" : "no_supported_link");
      assert(ids(row.event).every(id => binding.people.some(person => person.person_id === id)));
    }
  }

  // The historical case, editorial question and primary source survive into
  // the actual NextAction answer/render; no free collection lookup exists.
  const ui = environment(compiled);
  const mail = await ui.decorate(rawMails.get("kunst_kuratering_og_program_job_kunstneruenighet_tekst_003"));
  ui.show(mail, activeFor(mail.role_scope));
  ui.load("js/Civication/ui/CivicationNextActionUI.js");
  const answer = ui.window.CivicationNextActionUI.buildRoleMailHistoryPersonAnswer(mail.id, "munch", "task");
  assert(answer.answer.includes("Pola Gauguin"));
  assert(answer.answer.includes(mail.role_model_meta.history_people[0].relevance.question));
  assert.equal(answer.evidence[0].sources[0].url, "https://www.munch.no/en/our-collection/vampire-in-disgrace/");
  assert.equal(ui.window.CivicationNextActionUI.buildRoleMailHistoryPersonAnswer(mail.id, "gustav_vigeland", "task"), null);
  assert.equal(ui.window.CivicationNextActionUI.open(), true);
  const modal = ui.document.getElementById("civiNextActionModal");
  const button = new Element();
  for (const [key, value] of Object.entries({ "data-civi-role-person": "1", "data-mail-id": mail.id, "data-person-id": "munch" })) button.setAttribute(key, value);
  modal.appendChild(button);
  modal.listeners.click({ target: button, preventDefault() {} });
  const html = ui.document.getElementById("civiNextActionModalBody").innerHTML;
  assert(html.includes("Pola Gauguin") && html.includes("https://www.munch.no/en/our-collection/vampire-in-disgrace/"));
  assert(html.includes("et samtykke til ny bruk"));
  ui.setCollected([]);
  assert.deepEqual(clone(ui.window.CivicationNextActionUI.getRoleMailHistoryPeople(mail.id)), [], "a restored/reset collection cannot expose a formerly collected person");
  ui.show(stale, activeFor(stale.role_scope));
  assert.deepEqual(clone(ui.window.CivicationNextActionUI.getRoleMailHistoryPeople(stale.id)), [], "persisted category-only lists stay hidden after cutover");
  console.log("civication-history-people-relevance.test.js: 90 source/workday/UI mails, scope guards, collection, rotation, build audit and both boot orders OK");
})().catch(error => { console.error(error); process.exitCode = 1; });
