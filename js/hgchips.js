// hgchips.js — HGChips (chips for Knowledge pages)
// ------------------------------------------------------------
// Purpose: quick navigation + collecting through chips (hooks, concepts, thinkers)
// Sources (merged):
//  - Fagkart topic_hooks (+ canon thinkers)
//  - Emner (concepts / thinkers / hook ids)
//  - Local unlocked knowledge (knowledge_universe) + quiz_history (optional)
// No hard coupling to "courses" UI.
//
// Requires:
//  - A mount element: #hgChipsMount (or opts.mountId)
//  - Emne cards in DOM with: [data-emne], optional [data-hook], [data-concepts], [data-thinkers]
//
// Public API: window.HGChips.init({ categoryId, fagkartUrl?, emnerUrl?, mountId? })
(function () {
  "use strict";

  const DEFAULT_MOUNT_ID = "hgChipsMount";

  function norm(s) {
    return String(s || "").trim();
  }
  function normLc(s) {
    return norm(s).toLowerCase();
  }
  function uniqBy(arr, keyFn) {
    const seen = new Set();
    const out = [];
    for (const x of arr || []) {
      const k = keyFn(x);
      if (!k || seen.has(k)) continue;
      seen.add(k);
      out.push(x);
    }
    return out;
  }

  function safeJsonParse(raw, fallback) {
    try {
      const v = JSON.parse(raw);
      return v == null ? fallback : v;
    } catch {
      return fallback;
    }
  }

  function getUnlockedConceptIds(categoryId) {
    const unlocked = new Set();

    // knowledge_universe: { [categoryId]: { dimension: [{id, topic, text}] } }
    const uni = safeJsonParse(localStorage.getItem("knowledge_universe") || "null", null);
    const cat = uni && typeof uni === "object" ? uni[categoryId] : null;
    if (cat && typeof cat === "object") {
      for (const items of Object.values(cat)) {
        if (!Array.isArray(items)) continue;
        for (const k of items) {
          if (k && typeof k.id === "string") unlocked.add(k.id);
          if (k && typeof k.topic === "string") unlocked.add("topic:" + normLc(k.topic));
        }
      }
    }

    // quiz_history: accept optional fields if present (non-breaking)
    const hist = safeJsonParse(localStorage.getItem("quiz_history") || "[]", []);
    if (Array.isArray(hist)) {
      for (const h of hist) {
        if (!h) continue;
        const list = Array.isArray(h.unlocked_concepts)
          ? h.unlocked_concepts
          : (Array.isArray(h.concepts) ? h.concepts : []);
        for (const c of list) {
          const t = normLc(c);
          if (t) unlocked.add("topic:" + t);
        }
      }
    }

    return unlocked;
  }

  async function fetchJson(url) {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error(r.status + " " + url);
    return await r.json();
  }

  function splitCsv(str) {
    const s = norm(str);
    if (!s) return [];
    return s.split(",").map(x => norm(x)).filter(Boolean);
  }

  function collectFromEmner(emner) {
    const concepts = [];
    const thinkers = [];
    const hooks = [];

    for (const e of emner || []) {
      if (!e) continue;

      const hookId = norm(e.hook_id || e.topic_hook_id || e.hookId);
      if (hookId) hooks.push({ id: hookId, title: hookId });

      const c1 = Array.isArray(e.concepts) ? e.concepts : [];
      const c2 = Array.isArray(e.core_concepts) ? e.core_concepts : [];
      const c3 = Array.isArray(e.keywords) ? e.keywords : [];
      const cAll = [...c1, ...c2, ...c3].map(norm).filter(Boolean);
      for (const c of cAll) concepts.push({ id: "topic:" + normLc(c), title: c });

      const tList =
        (e.canon && Array.isArray(e.canon.thinkers) ? e.canon.thinkers : []) ||
        (Array.isArray(e.thinkers) ? e.thinkers : []);
      if (Array.isArray(tList)) {
        for (const t of tList) {
          if (!t) continue;
          const id = norm(t.id || t.slug || t.name);
          const name = norm(t.name || t.title || t.id);
          if (id || name) thinkers.push({ id: id || normLc(name), title: name });
        }
      }
    }

    return {
      concepts: uniqBy(concepts, x => x.id),
      thinkers: uniqBy(thinkers, x => x.id),
      hooks: uniqBy(hooks, x => x.id),
    };
  }

  function collectFromFagkart(fagkart, categoryId) {
    const cat = (fagkart?.categories || []).find(c => norm(c.id) === norm(categoryId));
    if (!cat) return { hooks: [], thinkersByHook: new Map(), thinkers: [] };

    const hooks = [];
    const thinkers = [];
    const thinkersByHook = new Map();

    for (const h of (cat.topic_hooks || [])) {
      if (!h) continue;
      const id = norm(h.id);
      const title = norm(h.title) || id;
      if (!id) continue;

      hooks.push({ id, title });

      const tList = h?.canon?.thinkers;
      if (Array.isArray(tList)) {
        const local = [];
        for (const t of tList) {
          if (!t) continue;
          const tid = norm(t.id || t.slug || t.name);
          const tname = norm(t.name || t.title || t.id);
          if (!tid && !tname) continue;
          const obj = { id: tid || normLc(tname), title: tname };
          local.push(obj);
          thinkers.push(obj);
        }
        thinkersByHook.set(id, uniqBy(local, x => x.id));
      }
    }

    return {
      hooks: uniqBy(hooks, x => x.id),
      thinkersByHook,
      thinkers: uniqBy(thinkers, x => x.id),
    };
  }

  function renderChip(chip, unlockedSet, activeKey) {
    const key = chip.kind + ":" + chip.id;
    const isActive = activeKey === key;
    const unlocked =
      unlockedSet && (unlockedSet.has(chip.id) || unlockedSet.has("topic:" + normLc(chip.title)));
    const cls = [
      "hg-chip",
      "hg-chip-" + chip.kind,
      unlocked ? "is-unlocked" : "",
      isActive ? "is-active" : ""
    ].filter(Boolean).join(" ");

    return `<button class="${cls}" type="button"
      data-chip-kind="${chip.kind}"
      data-chip-id="${chip.id}"
      data-chip-title="${chip.title.replaceAll('"', "&quot;")}">${chip.title}</button>`;
  }

  function applyEmneFilters(root, state) {
    if (!root) return;

    const emnes = root.querySelectorAll("[data-emne]");
    emnes.forEach(el => {
      const hook = normLc(el.getAttribute("data-hook"));
      const concepts = normLc(el.getAttribute("data-concepts"));
      const thinkers = normLc(el.getAttribute("data-thinkers"));

      let ok = true;

      if (state.hookId) {
        ok = ok && hook.split(",").map(s => normLc(s)).includes(normLc(state.hookId));
      }
      if (state.concept) {
        ok = ok && concepts.includes(normLc(state.concept));
      }
      if (state.thinkerId) {
        ok = ok && thinkers.split(",").map(s => normLc(s)).includes(normLc(state.thinkerId));
      }

      el.style.display = ok ? "" : "none";
    });
  }

  function renderUI(mount, data, unlockedSet, state) {
    if (!mount) return;

    const parts = [];

    const any = state.hookId || state.concept || state.thinkerId;
    parts.push(`
      <div class="hg-chips-bar">
        <div class="hg-chips-left">
          <span class="hg-chips-title">Chips</span>
          <span class="hg-chips-hint">Trykk for å filtrere emner</span>
        </div>
        <div class="hg-chips-right">
          <button class="hg-chip-clear" type="button" data-chip-clear ${any ? "" : "disabled"}>Nullstill</button>
        </div>
      </div>
    `);

    if (data.hooks?.length) {
      parts.push(`
        <div class="hg-chip-section">
          <div class="hg-chip-section-title">Topic hooks</div>
          <div class="hg-chip-row">
            ${data.hooks.map(h => renderChip({kind:"hook", id:h.id, title:h.title}, unlockedSet, state._activeKey)).join("")}
          </div>
        </div>
      `);
    }

    if (data.concepts?.length) {
      const list = data.concepts.slice(0, 60);
      parts.push(`
        <div class="hg-chip-section">
          <div class="hg-chip-section-title">Begreper</div>
          <div class="hg-chip-row">
            ${list.map(c => renderChip({kind:"concept", id:c.id, title:c.title}, unlockedSet, state._activeKey)).join("")}
          </div>
        </div>
      `);
    }

    if (data.thinkers?.length) {
      const list = data.thinkers.slice(0, 48);
      parts.push(`
        <div class="hg-chip-section">
          <div class="hg-chip-section-title">Tenkere</div>
          <div class="hg-chip-row">
            ${list.map(t => renderChip({kind:"thinker", id:t.id, title:t.title}, unlockedSet, state._activeKey)).join("")}
          </div>
        </div>
      `);
    }

    mount.innerHTML = parts.join("\n");
  }

  function wireUI(mount, root, data, unlockedSet, state) {
    if (!mount) return;

    mount.onclick = (e) => {
      const clearBtn = e.target.closest("[data-chip-clear]");
      if (clearBtn) {
        state.hookId = "";
        state.concept = "";
        state.thinkerId = "";
        state._activeKey = "";
        renderUI(mount, data, unlockedSet, state);
        applyEmneFilters(root, state);
        return;
      }

      const btn = e.target.closest("[data-chip-kind]");
      if (!btn) return;

      const kind = btn.getAttribute("data-chip-kind");
      const id = btn.getAttribute("data-chip-id");
      const title = btn.getAttribute("data-chip-title") || "";

      const key = kind + ":" + id;
      const isSame = state._activeKey === key;

      if (kind === "hook") {
        state.hookId = isSame ? "" : id;
        state.concept = "";
        state.thinkerId = "";
      } else if (kind === "concept") {
        state.concept = isSame ? "" : title;
        state.hookId = "";
        state.thinkerId = "";
      } else if (kind === "thinker") {
        state.thinkerId = isSame ? "" : id;
        state.hookId = "";
        state.concept = "";
      }

      state._activeKey = isSame ? "" : key;

      renderUI(mount, data, unlockedSet, state);
      applyEmneFilters(root, state);
    };
  }

  async function init(opts) {
    const categoryId = norm(opts?.categoryId);
    if (!categoryId) return;

    const mountId = norm(opts?.mountId) || DEFAULT_MOUNT_ID;
    const mount = document.getElementById(mountId);
    if (!mount) return;

    const root = document.getElementById("hgEmnerMount") || document;

    let fagkart = null;
    const fagkartUrl = norm(opts?.fagkartUrl) || norm(window.FAGKART_URL);
    if (fagkartUrl) {
      try { fagkart = await fetchJson(fagkartUrl); } catch (e) {
        if (window.DEBUG) console.warn("[HGChips] fagkart load failed", e);
      }
    }

    let emner = [];
    try {
      if (window.DataHub && typeof window.DataHub.loadEmner === "function") {
        emner = await window.DataHub.loadEmner(categoryId);
      } else if (opts?.emnerUrl) {
        emner = await fetchJson(opts.emnerUrl);
      }
    } catch (e) {
      if (window.DEBUG) console.warn("[HGChips] emner load failed", e);
    }

    const list = Array.isArray(emner) ? emner : (Array.isArray(emner?.emner) ? emner.emner : []);
    const fromEmner = collectFromEmner(list);
    const fromFagkart = collectFromFagkart(fagkart, categoryId);

    const hooks = uniqBy([...(fromFagkart.hooks || []), ...(fromEmner.hooks || [])], x => x.id);
    const concepts = fromEmner.concepts || [];
    const thinkers = uniqBy([...(fromFagkart.thinkers || []), ...(fromEmner.thinkers || [])], x => x.id);

    const unlockedSet = getUnlockedConceptIds(categoryId);

    const data = { hooks, concepts, thinkers };
    const state = { hookId: "", concept: "", thinkerId: "", _activeKey: "" };

    renderUI(mount, data, unlockedSet, state);
    wireUI(mount, root, data, unlockedSet, state);
  }

  window.HGChips = window.HGChips || {};
  window.HGChips.init = init;
})();
