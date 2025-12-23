// js/observations.js — HGObservations (chips + valgfri tekst) → hg_learning_log_v1
// STRICT: ingen normalisering (kun trim). window.DEBUG styrer warnings.
// Data: data/observations/observations_<subjectId>.json
// Event:
// {
//   schema, type:"observation_done", ts, date,
//   subject_id, categoryId,
//   targetType, targetId,
//   moduleId?,
//   lens_id, field_id?,
//   selected[],
//   related_emner[], concepts[], tags[],
//   note?
// }

(function () {
  "use strict";

  // ============================================================
  // CONFIG
  // ============================================================
  const LEARNING_KEY = "hg_learning_log_v1";
  const LEARNING_SCHEMA = 1;

  function dlog(...a) { if (window.DEBUG) console.log("[HGObservations]", ...a); }
  function dwarn(...a) { if (window.DEBUG) console.warn("[HGObservations]", ...a); }

  function s(x) { return String(x ?? "").trim(); }
  function arr(x) { return Array.isArray(x) ? x : []; }

  // ============================================================
  // STORAGE (append-only)
  // ============================================================
  function safeParse(key, fallback) {
    try {
      const v = JSON.parse(localStorage.getItem(key) || "null");
      return v == null ? fallback : v;
    } catch (e) {
      dwarn("bad json in", key, e);
      return fallback;
    }
  }

  function safeWrite(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      dwarn("write failed", key, e);
      return false;
    }
  }

  function appendLearningEvent(evt) {
    const cur = safeParse(LEARNING_KEY, []);
    const list = Array.isArray(cur) ? cur : [];
    list.push(evt);
    safeWrite(LEARNING_KEY, list);
  }

  // ============================================================
  // FETCH JSON
  // ============================================================
  function absUrl(path) {
    return new URL(String(path || ""), document.baseURI).toString();
  }

  async function fetchJson(path) {
    const url = absUrl(path);
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error(`${r.status} ${url}`);
    return await r.json();
  }

  // ============================================================
  // LENSES (per subject)
  // ============================================================
  const _cache = new Map(); // subjectId -> lenses[]

  function lensesPath(subjectId) {
    const sid = s(subjectId);
    return `data/observations/observations_${sid}.json`;
  }

  async function loadLenses(subjectId) {
    const sid = s(subjectId);
    if (!sid) throw new Error("subjectId missing");

    if (_cache.has(sid)) return _cache.get(sid);

    const data = await fetchJson(lensesPath(sid));
    const lenses = Array.isArray(data?.lenses) ? data.lenses : (Array.isArray(data) ? data : []);
    _cache.set(sid, lenses);
    return lenses;
  }

  function findLens(lenses, lensId) {
    const id = s(lensId);
    return arr(lenses).find(x => s(x?.lens_id) === id) || null;
  }

  // ============================================================
  // UI (modal)
  // ============================================================
  let _escWired = false;

  function ensureUI() {
    if (document.getElementById("obsModal")) return;

    const m = document.createElement("div");
    m.id = "obsModal";
    m.className = "modal";
    m.innerHTML = `
      <div class="modal-body" style="max-width:720px;">
        <div class="modal-head">
          <strong id="obsTitle">Observasjon</strong>
          <button class="ghost" id="obsClose">Lukk</button>
        </div>

        <div class="sheet-body">
          <div id="obsPrompt" class="muted" style="margin:8px 0 10px;"></div>

          <div id="obsChips" style="display:flex;flex-wrap:wrap;gap:8px;"></div>

          <div id="obsNoteWrap" style="margin-top:12px;display:none;">
            <div class="muted" id="obsNoteLabel" style="margin-bottom:6px;"></div>
            <textarea id="obsNote" rows="3"
              style="width:100%;border-radius:10px;padding:10px;resize:vertical;background:rgba(0,0,0,.25);color:inherit;border:1px solid rgba(255,255,255,.08);"></textarea>
            <div class="muted" style="margin-top:6px;font-size:12px;">
              <span id="obsNoteCount">0</span>/<span id="obsNoteMax">0</span>
            </div>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;">
            <span id="obsFeedback" class="muted"></span>
            <div style="display:flex;gap:8px;">
              <button class="ghost" id="obsClear">Nullstill</button>
              <button id="obsSave">Lagre</button>
            </div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(m);

    const modal = document.getElementById("obsModal");
    modal.querySelector("#obsClose").onclick = close;
    modal.addEventListener("click", (e) => {
      if (e.target && e.target.id === "obsModal") close();
    });

    if (!_escWired) {
      _escWired = true;
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") close();
      });
    }
  }

  function open() {
    ensureUI();
    const modal = document.getElementById("obsModal");
    modal.style.display = "flex";
    modal.classList.remove("fade-out");
  }

  function close() {
    const modal = document.getElementById("obsModal");
    if (!modal) return;
    modal.classList.add("fade-out");
    setTimeout(() => modal.remove(), 450);
  }

  // ============================================================
  // ENGINE
  // ============================================================
  const HGObservations = {};

  // API injiseres fra app.js (samme stil som QuizEngine)
  let API = {
    showToast: (msg) => console.log(msg),
    dispatchProfileUpdate: () => window.dispatchEvent(new Event("updateProfile"))
  };

  function buildChip(opt, selectedSet) {
    const id = s(opt?.id);
    const label = s(opt?.label) || id || "valg";
    const active = selectedSet.has(id);

    return `
      <button class="chip ${active ? "chip-on" : ""}"
        data-opt="${id}"
        style="
          border-radius:999px;
          padding:8px 10px;
          border:1px solid rgba(255,255,255,.10);
          background:${active ? "rgba(255,255,255,.12)" : "rgba(255,255,255,.04)"};
          color:inherit;
          cursor:pointer;">
        ${label}
      </button>
    `;
  }

  function validateLens(lens) {
    if (!lens || typeof lens !== "object") return "lens missing";
    if (!s(lens.lens_id)) return "lens_id missing";
    if (!s(lens.title)) return "title missing";
    if (!s(lens.type)) return "type missing";
    if (!Array.isArray(lens.options) || !lens.options.length) return "options missing";
    return "";
  }

  function validateTarget(target) {
    if (!target || typeof target !== "object") return "target missing";
    if (!s(target.targetId)) return "targetId missing";
    if (!s(target.targetType)) return "targetType missing"; // "place" | "person" | "generic"
    if (!s(target.subject_id)) return "subject_id missing"; // "by", ...
    return "";
  }

  // target = { targetId, targetType, subject_id, categoryId?, title?, moduleId? }
  // lensId = string
  HGObservations.start = async function ({ target, lensId }) {
    try {
      const errT = validateTarget(target);
      if (errT) {
        dwarn("start rejected:", errT, target);
        API.showToast("Observasjon-feil: mangler target-data");
        return;
      }

      const subjectId = s(target.subject_id);
      const lenses = await loadLenses(subjectId);

      const lens = findLens(lenses, lensId);
      const errL = validateLens(lens);
      if (errL) {
        dwarn("lens invalid:", errL, lensId, lens);
        API.showToast("Fant ikke observasjon-linse");
        return;
      }

      // UI init
      open();

      const elTitle = document.getElementById("obsTitle");
      const elPrompt = document.getElementById("obsPrompt");
      const elChips = document.getElementById("obsChips");
      const elFeedback = document.getElementById("obsFeedback");
      const elClear = document.getElementById("obsClear");
      const elSave = document.getElementById("obsSave");

      const elNoteWrap = document.getElementById("obsNoteWrap");
      const elNoteLabel = document.getElementById("obsNoteLabel");
      const elNote = document.getElementById("obsNote");
      const elNoteCount = document.getElementById("obsNoteCount");
      const elNoteMax = document.getElementById("obsNoteMax");

      const mode = s(lens.type); // "multi_select" | "single_select"
      const allowNote = !!lens.allow_note;
      const noteMax = Number.isFinite(lens.note_max_len) ? lens.note_max_len : 280;

      const selected = new Set();

      elTitle.textContent =
        s(lens.title) ||
        (s(target.title) ? `Observasjon: ${s(target.title)}` : "Observasjon");

      elPrompt.textContent = s(lens.prompt) || "";

      // Note UI
      if (allowNote) {
        elNoteWrap.style.display = "block";
        elNoteLabel.textContent = s(lens.note_label) || "Kort observasjon (valgfritt)";
        elNote.value = "";
        elNoteMax.textContent = String(noteMax);
        elNoteCount.textContent = "0";

        elNote.oninput = () => {
          const v = String(elNote.value ?? "");
          if (v.length > noteMax) elNote.value = v.slice(0, noteMax);
          elNoteCount.textContent = String(elNote.value.length);
        };
      } else {
        elNoteWrap.style.display = "none";
      }

      function renderChips() {
        const opts = arr(lens.options)
          .map(o => ({ id: s(o?.id), label: s(o?.label) }))
          .filter(o => o.id);

        elChips.innerHTML = opts.map(o => buildChip(o, selected)).join("");

        elChips.querySelectorAll("button[data-opt]").forEach(btn => {
          btn.onclick = () => {
            const id = s(btn.dataset.opt);
            if (!id) return;

            if (mode === "single_select") {
              selected.clear();
              selected.add(id);
            } else {
              if (selected.has(id)) selected.delete(id);
              else selected.add(id);
            }
            renderChips();
          };
        });
      }

      function clearAll() {
        selected.clear();
        if (allowNote) {
          elNote.value = "";
          elNoteCount.textContent = "0";
        }
        elFeedback.textContent = "";
        renderChips();
      }

      elClear.onclick = clearAll;

      elSave.onclick = () => {
        const sel = Array.from(selected).map(s).filter(Boolean);

        // strict: må velge minst 1
        if (!sel.length) {
          elFeedback.textContent = "Velg minst ett ord før du lagrer.";
          return;
        }

        // Kurs/diplom-kompatible referanser (fra lens-json)
        const related_emner = arr(lens.related_emner).map(s).filter(Boolean);
        const concepts = arr(lens.concepts).map(s).filter(Boolean);
        const tags = arr(lens.tags).map(s).filter(Boolean);

        const evt = {
          schema: LEARNING_SCHEMA,
          type: "observation_done",
          ts: Date.now(),
          date: new Date().toISOString(),

          subject_id: s(target.subject_id),
          categoryId: s(target.categoryId || target.subject_id),

          targetType: s(target.targetType),
          targetId: s(target.targetId),

          moduleId: s(target.moduleId || ""),

          lens_id: s(lens.lens_id),
          field_id: s(lens.field_id || ""),

          selected: sel,

          related_emner,
          concepts,
          tags
        };

        if (allowNote) {
          const note = s(elNote.value);
          if (note) evt.note = note;
        }

        appendLearningEvent(evt);

        API.showToast("📝 Observasjon lagret");
        API.dispatchProfileUpdate();
        close();
      };

      renderChips();
      dlog("open lens", lens.lens_id, "target", target.targetId);

    } catch (e) {
      dwarn("start crashed:", e);
      API.showToast("Observasjon-feil: noe krasjet");
      close();
    }
  };

  HGObservations.init = function (opts = {}) {
    API = { ...API, ...(opts || {}) };
  };

  window.HGObservations = HGObservations;
})();
