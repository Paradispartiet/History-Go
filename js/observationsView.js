// js/observationsView.js — HGObsView (vis observasjoner fra hg_learning_log_v1)
// Leser: data/observations/observations_<subjectId>.json for å få label på lens/options
// STRICT: ingen normalisering (kun trim). window.DEBUG styrer warnings.

(function () {
  "use strict";

  function dlog(...a) { if (window.DEBUG) console.log("[HGObsView]", ...a); }
  function dwarn(...a) { if (window.DEBUG) console.warn("[HGObsView]", ...a); }

  function s(x) { return String(x ?? "").trim(); }
  function arr(x) { return Array.isArray(x) ? x : []; }

  // ---------------------------
  // Storage
  // ---------------------------
  const LEARNING_KEY = "hg_learning_log_v1";

  function safeParse(key, fallback) {
    try {
      const v = JSON.parse(localStorage.getItem(key) || "null");
      return v == null ? fallback : v;
    } catch (e) {
      dwarn("bad json in", key, e);
      return fallback;
    }
  }

  function getLearningLog() {
    const v = safeParse(LEARNING_KEY, []);
    return Array.isArray(v) ? v : [];
  }

  // ---------------------------
  // Fetch lenses
  // ---------------------------
  const _lensCache = new Map(); // subjectId -> { lensById, optionLabelByLensId }

  function absUrl(path) {
    return new URL(String(path || ""), document.baseURI).toString();
  }

  async function fetchJson(path) {
    const url = absUrl(path);
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error(`${r.status} ${url}`);
    return await r.json();
  }

  function lensesPath(subjectId) {
    const sid = s(subjectId);
    return `data/observations/observations_${sid}.json`;
  }

  async function loadLensIndex(subjectId) {
    const sid = s(subjectId);
    if (!sid) throw new Error("subjectId missing");

    if (_lensCache.has(sid)) return _lensCache.get(sid);

    const data = await fetchJson(lensesPath(sid));
    const lenses = Array.isArray(data?.lenses) ? data.lenses : (Array.isArray(data) ? data : []);

    const lensById = new Map();
    const optionLabelByLensId = new Map(); // lens_id -> Map(optId -> label)

    for (const l of arr(lenses)) {
      const lid = s(l?.lens_id);
      if (!lid) continue;

      lensById.set(lid, l);

      const m = new Map();
      for (const o of arr(l?.options)) {
        const oid = s(o?.id);
        const lab = s(o?.label) || oid;
        if (oid) m.set(oid, lab);
      }
      optionLabelByLensId.set(lid, m);
    }

    const idx = { lensById, optionLabelByLensId };
    _lensCache.set(sid, idx);
    return idx;
  }

  // ---------------------------
  // Render helpers
  // ---------------------------
  function fmtDate(ts) {
    const n = Number(ts);
    if (!Number.isFinite(n) || n <= 0) return "";
    try {
      return new Date(n).toLocaleString("no-NO", { hour12: false });
    } catch {
      return "";
    }
  }

  function escapeHtml(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // ---------------------------
  // Public API
  // ---------------------------
  const HGObsView = {};

  // Returner rå events for target
  HGObsView.getForTarget = function ({ targetId, targetType } = {}) {
    const tid = s(targetId);
    const ttype = s(targetType);
    if (!tid || !ttype) return [];

    const log = getLearningLog();
    return arr(log).filter(e =>
      s(e?.type) === "observation" &&
      s(e?.targetId) === tid &&
      s(e?.targetType) === ttype
    );
  };

  // Render inline HTML for popup (place/person)
  HGObsView.renderInline = async function ({ subjectId, targetId, targetType, title } = {}) {
    const sid = s(subjectId);
    const tid = s(targetId);
    const ttype = s(targetType);
    if (!sid || !tid || !ttype) return "";

    const events = HGObsView.getForTarget({ targetId: tid, targetType: ttype })
      .slice()
      .sort((a, b) => (Number(b?.ts) || 0) - (Number(a?.ts) || 0));

    if (!events.length) {
      return `<div class="hg-muted">Ingen observasjoner lagret ennå.</div>`;
    }

    let idx;
    try {
      idx = await loadLensIndex(sid);
    } catch (e) {
      dwarn("could not load lens index:", sid, e);
      // fallback: vis likevel (uten labels)
      idx = { lensById: new Map(), optionLabelByLensId: new Map() };
    }

    const blocks = events.map(evt => {
      const lid = s(evt?.lens_id);
      const lens = idx.lensById.get(lid) || null;

      const lensTitle = s(lens?.title) || lid || "Observasjon";
      const prompt = s(lens?.prompt);

      const optMap = idx.optionLabelByLensId.get(lid) || new Map();
      const selected = arr(evt?.selected).map(x => s(x)).filter(Boolean);

      const chips = selected.map(id => {
        const lab = optMap.get(id) || id;
        return `<span class="chip chip-on" style="display:inline-block;border-radius:999px;padding:6px 10px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.12);margin:4px 6px 0 0;">${escapeHtml(lab)}</span>`;
      }).join("");

      const note = s(evt?.note);
      const when = fmtDate(evt?.ts);

      return `
        <div class="hg-section" style="margin-top:10px;">
          <h3 style="margin-bottom:6px;">${escapeHtml(lensTitle)}</h3>
          ${prompt ? `<div class="hg-muted" style="margin-bottom:6px;">${escapeHtml(prompt)}</div>` : ""}
          <div>${chips}</div>
          ${note ? `<div style="margin-top:8px;"><strong>Notat:</strong> ${escapeHtml(note)}</div>` : ""}
          ${when ? `<div class="hg-muted" style="margin-top:6px;font-size:12px;">${escapeHtml(when)}</div>` : ""}
        </div>
      `;
    });

    return blocks.join("");
  };

  window.HGObsView = HGObsView;
})();
