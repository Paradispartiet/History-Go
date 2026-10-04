#!/usr/bin/env node
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const root = path.join(__dirname, "..");
const pack = JSON.parse(fs.readFileSync(path.join(root, "data/Civication/lifeMails/arbeidsledig/arbeidsledig_life.json"), "utf8"));
let state = {};
const manifest = { packs: [{ id: "arbeidsledig", path: "arbeidsledig.json", when: { no_active_job: true } }] };
const window = {
  CivicationState: { getState: () => state, setState: (patch) => (state = { ...state, ...patch }), getActivePosition: () => null },
  CivicationJsonStore: { fetchJson: async (p) => p.endsWith("life_manifest.json") ? manifest : pack },
  addEventListener() {}, dispatchEvent() {}
};
vm.runInNewContext(fs.readFileSync(path.join(root, "js/Civication/systems/civicationLifeMailRuntime.js"), "utf8"), { window, document: { readyState: "complete" }, console, Event: class {} });
(async () => {
  const runtime = window.CivicationLifeMailRuntime;
  assert.equal(pack.cycle_policy, "once");
  let count = 0;
  for (;;) {
    const mail = await runtime.makeNextLifeMail();
    if (!mail) break;
    runtime.markLifeMailAnswered(mail, mail.choices[0].id);
    assert.ok(++count < 20);
  }
  assert.equal(count, 5, "de fem eksisterende mailene bevares, men spilles én gang");
  const saved = JSON.stringify(state);
  for (let i = 0; i < 4; i++) assert.equal((await runtime.makeCandidateLifeMails()).length, 0, "NAV/søknad/rytme skal ikke starte en ny syklus");
  assert.equal(JSON.stringify(state), saved, "lesing nullstiller ikke tidligere svar");
  assert.equal(state.life_mail_runtime_v1.cycle_count, 0);
  assert.equal(state.life_mail_runtime_v1.history.length, 5);
  console.log("arbeidsledig life mail once ok (5 opprinnelige mailer, ingen reset eller reprise)");
})().catch((e) => { console.error(e); process.exitCode = 1; });
