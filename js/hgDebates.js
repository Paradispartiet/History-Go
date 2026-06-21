// js/hgDebates.js
// ------------------------------------------------------------
// HGDebates v1 — History Go-signal for debatt/konflikt-deltakelse.
// Mirrors HGUnlocks: en persistert logg som et debatt-/standpunkt-UI kaller når spilleren
// deltar i en debatt eller velger en posisjon. Civication leser denne via delt localStorage
// (completion-bridgen) for å fullføre history_go_debate-oppgaver.
// Skriver kun ved faktisk deltakelse; ingen ny "kilde", bare en logg.
// ------------------------------------------------------------

(function () {
  "use strict";

  const KEY = "hg_debate_log_v1";

  function dispatchProfileUpdate() {
    try { window.dispatchEvent(new Event("updateProfile")); } catch {}
  }

  function load() {
    try {
      const x = JSON.parse(localStorage.getItem(KEY) || "{}");
      if (!x || typeof x !== "object") return { byId: {} };
      x.byId = x.byId && typeof x.byId === "object" ? x.byId : {};
      return x;
    } catch {
      return { byId: {} };
    }
  }

  function save(x) {
    try {
      localStorage.setItem(KEY, JSON.stringify(x));
    } catch {}
  }

  function normId(s) {
    return String(s || "").trim();
  }

  // record({ debateId, conflictId, position })
  // debateId eller conflictId må finnes. position er valgfri (kun for standpunktsvalg).
  /** @param {{ debateId?: string, conflictId?: string, position?: string }} [opts] */
  function record({ debateId, conflictId, position } = {}) {
    const dId = normId(debateId);
    const cId = normId(conflictId);
    const id = dId || cId;
    if (!id) return null;

    const db = load();
    db.byId = db.byId || {};

    const now = Date.now();
    const wasNew = !db.byId[id];
    const row = db.byId[id] || {
      id,
      debateId: dId || null,
      conflictId: cId || null,
      participated: false,
      positions: [],
      position: null,
      ts_first: now,
      ts_last: now
    };

    let changed = wasNew;

    if (!row.participated) {
      row.participated = true;
      changed = true;
    }
    if (dId && !row.debateId) { row.debateId = dId; changed = true; }
    if (cId && !row.conflictId) { row.conflictId = cId; changed = true; }

    const pos = normId(position);
    if (pos) {
      row.positions = Array.isArray(row.positions) ? row.positions : [];
      if (row.positions.indexOf(pos) === -1) {
        row.positions.push(pos);
        changed = true;
      }
      if (row.position !== pos) {
        row.position = pos;
        changed = true;
      }
    }

    db.byId[id] = row;

    // Sekundærindeks: conflictId -> byId-nøkkel, slik at Civication-broen kan slå opp en
    // debatt på konflikt-aksen (task med conflict_id) selv når raden er nøklet på debateId.
    if (cId) {
      db.byConflict = db.byConflict || {};
      if (db.byConflict[cId] !== id) {
        db.byConflict[cId] = id;
        changed = true;
      }
    }

    if (changed) {
      row.ts_last = now;
      save(db);
      dispatchProfileUpdate();
    }

    try {
      window.dispatchEvent(new CustomEvent("hg:debate-participated", {
        detail: { id, debateId: row.debateId, conflictId: row.conflictId, position: row.position }
      }));
    } catch {}

    return row;
  }

  function getById(id) {
    const db = load();
    return db.byId?.[normId(id)] || null;
  }

  window.HGDebates = {
    key: KEY,
    load,
    record,
    getById
  };
})();
