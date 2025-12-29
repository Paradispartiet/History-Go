// js/hg-chips.js — CHIPS (samling + filter) for Knowledge-sidene
(function () {
  "use strict";

  const STORE_KEY = "hg_collection_v1";

  function esc(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function safeParse(key, fallback) {
    try {
      const v = JSON.parse(localStorage.getItem(key));
      return v ?? fallback;
    } catch {
      return fallback;
    }
  }

  function save(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  function getCollection() {
    const c = safeParse(STORE_KEY, null);
    return c && typeof c === "object"
      ? c
      : { thinkers: [], concepts: [], hooks: [], emner: [], places: [], people: [] };
  }

  function addUnique(list, item) {
    const id = String(item?.id ?? item ?? "").trim();
    if (!id) return list;
    if (list.some(x => String(x?.id ?? x ?? "") === id)) return list;
    return [...list, item];
  }

  function addToCollection(type, item) {
    const c = getCollection();
    if (!c[type]) c[type] = [];
    c[type] = addUnique(c[type], item);
    save(STORE_KEY, c);
    window.showToast?.("Lagt til i samling ✅");
    window.dispatchEvent(new Event("hg_collection_updated"));
  }

  // ---- filters ----
  const state = {
    hookId: null,
    concept: null
  };

  function applyEmneFilters() {
    const root = document.getElementById("hgEmnerMount");
    if (!root) return;

    const items = root.querySelectorAll("[data-emne]");
    items.forEach(el => {
      const hook = el.getAttribute("data-hook") || "";
      const concepts = (el.getAttribute("data-concepts") || "").toLowerCase();

      let ok = true;
      if (state.hookId) ok = ok && hook === state.hookId;
      if (state.concept) ok = ok && concepts.includes(state.concept.toLowerCase());

      el.style.display = ok ? "" : "none";
    });
  }

  function clearFilters() {
    state.hookId = null;
    state.concept = null;
    applyEmneFilters();

    document.querySelectorAll(".hg-chip.is-on").forEach(x => x.classList.remove("is-on"));
  }

  // ---- data fetch ----
  async function fetchJson(url) {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error(`${r.status} ${url}`);
    return await r.json();
  }

  function extractThinkersFromFagkart(fagkart, categoryId) {
    const cats = Array.isArray(fagkart?.categories) ? fagkart.categories : [];
    const cat = cats.find(x => String(x?.id ?? "").trim() === String(categoryId ?? "").trim());
    const hooks = Array.isArray(cat?.topic_hooks) ? cat.topic_hooks : [];

    const out = [];
    for (const h of hooks) {
      const thinkers = Array.isArray(h?.canon?.thinkers) ? h.canon.thinkers : [];
      for (const t of thinkers) {
        if (!t?.id) continue;
        out.push({
          id: String(t.id).trim(),
          name: t.name || t.id,
          why: t.why || "",
          hook_id: String(h?.id ?? "").trim()
        });
      }
    }
    return out;
  }

  function buildConceptChipsFromEmner(emnerAll, limit = 32) {
    const counts = new Map();

    (Array.isArray(emnerAll) ? emnerAll : []).forEach(e => {
      const core = Array.isArray(e?.core_concepts) ? e.core_concepts : [];
      const keys = Array.isArray(e?.keywords) ? e.keywords : [];
      [...core, ...keys].forEach(x => {
        const k = String(x ?? "").trim();
        if (!k) return;
        counts.set(k, (counts.get(k) || 0) + 1);
      });
    });

    return Array.from(counts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  function renderChip(label, attrs = "") {
    return `<button type="button" class="hg-chip" ${attrs}>${esc(label)}</button>`;
  }

  function renderChipsUI({ hooks, thinkers, concepts }) {
    const hookRow = hooks.length
      ? hooks.map(h => renderChip(h.title, `data-chip-hook="${esc(h.id)}"`)).join("")
      : `<span class="muted">Ingen hooks.</span>`;

    const thinkerRow = thinkers.length
      ? thinkers.map(t => renderChip(t.name, `data-chip-thinker="${esc(t.id)}" title="${esc(t.why)}"`)).join("")
      : `<span class="muted">Ingen tenkere.</span>`;

    const conceptRow = concepts.length
      ? concepts.map(c => renderChip(`${c.label} (${c.count})`, `data-chip-concept="${esc(c.label)}"`)).join("")
      : `<span class="muted">Ingen begreper.</span>`;

    return `
      <div class="knowledge-block" id="hgChipsBox">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
          <h3 style="margin:0;">Chips</h3>
          <button type="button" class="hg-chip" data-chip-clear>Nullstill</button>
        </div>

        <div class="muted" style="margin-top:8px;">Topic hooks</div>
        <div class="hg-chiprow">${hookRow}</div>

        <div class="muted" style="margin-top:10px;">Tenkere</div>
        <div class="hg-chiprow">${thinkerRow}</div>

        <div class="muted" style="margin-top:10px;">Begreper</div>
        <div class="hg-chiprow">${conceptRow}</div>

        <div class="muted" style="margin-top:10px;">
          Klikk chips for å filtrere emner og/eller legge til i samling.
        </div>
      </div>
    `;
  }

  function wireChips({ hooksById, thinkersById }) {
    const box = document.getElementById("hgChipsBox");
    if (!box) return;

    box.querySelector("[data-chip-clear]")?.addEventListener("click", () => clearFilters());

    box.querySelectorAll("[data-chip-hook]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-chip-hook");
        const on = state.hookId === id;
        state.hookId = on ? null : id;

        btn.classList.toggle("is-on", !on);
        applyEmneFilters();

        const h = hooksById.get(id);
        if (h) addToCollection("hooks", { id: h.id, title: h.title });
      });
    });

    box.querySelectorAll("[data-chip-concept]").forEach(btn => {
      btn.addEventListener("click", () => {
        const label = btn.getAttribute("data-chip-concept");
        const on = state.concept === label;
        state.concept = on ? null : label;

        btn.classList.toggle("is-on", !on);
        applyEmneFilters();

        addToCollection("concepts", { id: label, title: label });
      });
    });

    box.querySelectorAll("[data-chip-thinker]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-chip-thinker");
        const t = thinkersById.get(id);
        if (t) addToCollection("thinkers", { id: t.id, name: t.name, why: t.why });
      });
    });
  }

  // Public API
  window.HGChips = {
    // categoryId: "byliv" etc
    // fagkartUrl: path til fagkart_by_oslo_FIXED.json (eller tilsvarende)
    async init({ categoryId, fagkartUrl }) {
      const cid = String(categoryId || "").trim();
      const mount = document.getElementById("hgChipsMount");
      if (!mount) return;

      // emner (for concepts + filtering)
      let emnerAll = [];
      try {
        if (window.DataHub && typeof window.DataHub.loadEmner === "function") {
          emnerAll = await window.DataHub.loadEmner(cid);
        }
      } catch {}

      // fagkart (for hooks + canon thinkers)
      let fagkart = null;
      if (fagkartUrl) {
        try { fagkart = await fetchJson(fagkartUrl); } catch {}
      }

      // hooks
      const cat = Array.isArray(fagkart?.categories)
        ? fagkart.categories.find(x => String(x?.id ?? "") === cid)
        : null;

      const hooks = Array.isArray(cat?.topic_hooks) ? cat.topic_hooks.map(h => ({
        id: String(h?.id ?? "").trim(),
        title: h?.title || h?.id
      })).filter(x => x.id) : [];

      // thinkers (dedup)
      const thinkersRaw = fagkart ? extractThinkersFromFagkart(fagkart, cid) : [];
      const thinkersMap = new Map();
      thinkersRaw.forEach(t => { if (t?.id && !thinkersMap.has(t.id)) thinkersMap.set(t.id, t); });

      const concepts = buildConceptChipsFromEmner(emnerAll, 36);

      // render
      mount.innerHTML = renderChipsUI({
        hooks,
        thinkers: Array.from(thinkersMap.values()),
        concepts
      });

      // wire
      const hooksById = new Map(hooks.map(h => [h.id, h]));
      wireChips({ hooksById, thinkersById: thinkersMap });
    }
  };
})();
