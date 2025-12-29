// knowledge_component.js — Knowledge page component (stable)
// ------------------------------------------------------------
// Mounts:
//  - #hgChipsMount (chips navigation/filter)
//  - #hgEmnerMount (emner list in <details> cards with data-* for chips filtering)
//
// Requires (optional but supported):
//  - window.DataHub.loadEmner(categoryId)  -> emner array (recommended)
//  - window.HGChips.init({categoryId, fagkartUrl})
(function () {
  "use strict";

  function norm(s) { return String(s || "").trim(); }
  function esc(s) {
    return String(s || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function guessCategoryId() {
    const b = document.body;
    const fromData = b ? norm(b.getAttribute("data-category")) : "";
    if (fromData) return fromData;

    const fn = (location.pathname.split("/").pop() || "").toLowerCase();
    const m = fn.match(/knowledge[_-]([a-z0-9_]+)\.html$/);
    if (m && m[1]) return m[1];

    return norm(window.SUBJECT_ID || window.categoryId || "");
  }

  function guessFagkartUrl(categoryId) {
    const b = document.body;
    const fromData = b ? norm(b.getAttribute("data-fagkart")) : "";
    if (fromData) return fromData;

    if (norm(window.FAGKART_URL)) return norm(window.FAGKART_URL);

    if (categoryId === "by") return "data/fagkart_by_oslo_FIXED.json";
    return `data/fagkart_${categoryId}.json`;
  }

  function splitList(v) {
    if (Array.isArray(v)) return v.map(norm).filter(Boolean);
    if (typeof v === "string") return v.split(",").map(norm).filter(Boolean);
    return [];
  }

  function emneToDom(emne) {
    const id = norm(emne.id || emne.emne_id || emne.slug);
    const title = norm(emne.title || emne.name || id);

    const hookId = norm(emne.hook_id || emne.topic_hook_id || emne.hookId);

    const concepts = [
      ...splitList(emne.concepts),
      ...splitList(emne.core_concepts),
      ...splitList(emne.keywords),
    ].filter(Boolean);

    const thinkers =
      (emne.canon && Array.isArray(emne.canon.thinkers) ? emne.canon.thinkers : [])
        .map(t => norm(t.id || t.name))
        .filter(Boolean);

    const short = norm(emne.short || emne.ingress || emne.summary);
    const long = norm(emne.description || emne.text || emne.body);

    return { id, title, hookId, concepts, thinkers, short, long };
  }

  function renderEmner(emner) {
    const mount = document.getElementById("hgEmnerMount");
    if (!mount) return;

    const list = (Array.isArray(emner) ? emner : (emner && Array.isArray(emner.emner) ? emner.emner : []))
      .map(emneToDom)
      .filter(e => e.id && e.title);

    mount.innerHTML = list.map(e => `
      <details class="hg-emne"
        data-emne="${esc(e.id)}"
        data-hook="${esc(e.hookId)}"
        data-concepts="${esc(e.concepts.join(", "))}"
        data-thinkers="${esc(e.thinkers.join(", "))}">
        <summary class="hg-emne-summary">
          <span class="hg-emne-title">${esc(e.title)}</span>
          ${e.hookId ? `<span class="hg-emne-hook">${esc(e.hookId)}</span>` : ""}
        </summary>
        ${e.short ? `<div class="hg-emne-ingress">${esc(e.short)}</div>` : ""}
        ${e.long ? `<div class="hg-emne-body">${esc(e.long)}</div>` : ""}
      </details>
    `).join("\n");
  }

  async function loadEmner(categoryId) {
    if (window.DataHub && typeof window.DataHub.loadEmner === "function") {
      return await window.DataHub.loadEmner(categoryId);
    }

    const url = `data/emner/emner_${categoryId}.json`;
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error(r.status + " " + url);
    return await r.json();
  }

  async function boot() {
    const categoryId = guessCategoryId();
    if (!categoryId) return;

    let emner = [];
    try { emner = await loadEmner(categoryId); } catch (e) {
      if (window.DEBUG) console.warn("[knowledge_component] emner load failed", e);
    }
    renderEmner(emner);

    if (window.HGChips && typeof window.HGChips.init === "function") {
      const fagkartUrl = guessFagkartUrl(categoryId);
      try { await window.HGChips.init({ categoryId, fagkartUrl, mountId: "hgChipsMount" }); }
      catch (e) {
        if (window.DEBUG) console.warn("[knowledge_component] chips init failed", e);
      }
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    try { boot(); } catch (e) { console.error("[knowledge_component] boot", e); }
  });
})();
