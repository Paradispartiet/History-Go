#!/usr/bin/env node
// A deliberately ended job must not be restored by an older employment backup.
// Genuine missing-position recovery must continue to work.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const src = fs.readFileSync(path.join(__dirname, "../js/Civication/systems/civicationActivePositionRecovery.js"), "utf8");
const ACTIVE = "hg_active_position_v1";
const BACKUP = "hg_civi_last_active_position_v1";
const CLEARED = "hg_civi_active_position_explicitly_cleared_v1";
const oldJob = { role_key: "renholder", role_id: "naer_renholder", title: "Renholder", career_id: "naeringsliv" };

function boot(storage = new Map(), data = {}) {
  const state = { ...data };
  const localStorage = {
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(key, String(value)); },
    removeItem(key) { storage.delete(key); }
  };
  const api = {
    getActivePosition() { return JSON.parse(localStorage.getItem(ACTIVE) || "null"); },
    setActivePosition(pos) { localStorage.setItem(ACTIVE, JSON.stringify(pos)); },
    getState() { return { ...state }; },
    setState(patch) { Object.assign(state, patch); }
  };
  const window = { CivicationState: api, addEventListener() {} };
  const document = { readyState: "complete" };
  vm.runInNewContext(src, { window, document, localStorage, console }, { filename: "civicationActivePositionRecovery.js" });
  return { storage, state, api, recovery: window.CivicationActivePositionRecovery };
}

// An earned employment survives an accidental missing primary entry.
{
  const f = boot();
  f.api.setActivePosition(oldJob);
  assert.ok(f.storage.has(BACKUP), "employment was backed up");
  f.storage.delete(ACTIVE); // simulate a missing/corrupted primary entry, not a job ending
  const result = f.recovery.recoverActivePosition();
  assert.equal(result.role_key, "renholder");
  assert.equal(result.recovered_from_backup, true);
  assert.equal(f.api.getActivePosition().role_key, "renholder");
}

// An actual dismissal is authoritative even if an old job plan remains in state.
{
  const f = boot();
  f.api.setActivePosition(oldJob);
  f.api.setActivePosition(null);
  assert.equal(f.api.getActivePosition(), null);
  assert.equal(f.storage.has(BACKUP), false, "old job backup was invalidated");
  assert.equal(f.storage.get(CLEARED), "1");
  f.api.setState({active_role_key:"ekspeditor",mail_system:{role_plan_id:"ekspeditor_naeringsliv_v1"}});
  assert.equal(f.recovery.recoverActivePosition(), null, "stale role hints cannot rehire");
  assert.equal(f.api.getActivePosition(), null);

  // Simulate reload with an older backup reintroduced externally.
  f.storage.set(BACKUP, JSON.stringify({ ...oldJob, backed_up_at: new Date().toISOString() }));
  const reloaded = boot(f.storage, f.state);
  assert.equal(reloaded.api.getActivePosition(), null, "reload must respect the dismissal");
  assert.equal(reloaded.recovery.getBackupActivePosition(), null, "stale backup stays unusable");

  // A genuinely new hire clears the guard, restoring ordinary recovery behavior.
  reloaded.api.setActivePosition({ ...oldJob, role_key: "ekspeditor", title: "Ekspeditør" });
  assert.equal(reloaded.storage.has(CLEARED), false);
  assert.equal(reloaded.api.getActivePosition().title, "Ekspeditør");
}

// Recovering from state remains supported when no explicit dismissal happened.
{
  const f = boot(new Map(), {active_role_key:"ekspeditor"});
  assert.equal(f.api.getActivePosition().role_key, "ekspeditor");
  assert.equal(f.api.getActivePosition().recovered_from_state, true);
}
console.log("civication active-position recovery: earned backup, explicit layoff, reload, new hire and state hints OK");
