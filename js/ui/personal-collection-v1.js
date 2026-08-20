// History Go — Personal Collection v1
// Presentation/orchestration only. Existing stores remain canonical.
(function installPersonalCollectionV1(global) {
  "use strict";

  const AHA_URL = "https://paradispartiet.github.io/AHA-EchoNet/?source=historygo&intent=collection";
  const SECONDARY_PANELS = [
    ["civication", "Spill"],
    ["socialmeet", "Social Meet"],
    ["profilvalg", "Profilvalg og personvern"]
  ];

  const s = value => String(value == null ? "" : value).trim();
  const esc = value => s(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  function readJson(key, fallback) {
    try {
      const raw = global.localStorage?.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed == null ? fallback : parsed;
    } catch {
      return fallback;
    }
  }

  function countProgress(value) {
    if (Array.isArray(value)) return value.length;
    if (!value || typeof value !== "object") return 0;
    return Object.values(value).filter(Boolean).length;
  }

  function knowledgeEntries() {
    try {
      const rows = global.HGKnowledgeV2?.getEntries?.();
      if (Array.isArray(rows)) return rows;
    } catch {}
    const rows = readJson("hg_knowledge_entries_v2", []);
    return Array.isArray(rows) ? rows : [];
  }

  function collectionCounts() {
    const knowledge = knowledgeEntries();
    const notes = readJson("hg_user_notes_v1", []);
    const merits = readJson("merits_by_category", {});
    const meritCount = Object.values(merits || {}).reduce((sum, value) => {
      if (Array.isArray(value)) return sum + value.length;
      if (value && typeof value === "object") return sum + Object.values(value).filter(Boolean).length;
      return sum + (Number(value) > 0 ? 1 : 0);
    }, 0);
    const domBadges = document.querySelectorAll("#merits .badge-mini, #merits [data-badge-id]").length;
    return {
      places: countProgress(readJson("visited_places", {})),
      knowledge: knowledge.length,
      people: countProgress(readJson("people_collected", {})),
      badges: Math.max(meritCount, domBadges),
      contributions: Array.isArray(notes) ? notes.length : 0
    };
  }

  function insertIdentityLabel() {
    const profileName = document.getElementById("profileName");
    if (!profileName || profileName.parentElement?.classList.contains("profile-collection-title-stack")) return;
    const stack = document.createElement("div");
    stack.className = "profile-collection-title-stack";
    stack.innerHTML = `<span class="profile-collection-eyebrow">Min samling</span><span class="profile-collection-subtitle">Din personlige History Go-samling</span>`;
    profileName.parentNode?.insertBefore(stack, profileName);
    stack.insertBefore(profileName, stack.children[1]);
  }

  function renderHomeHero() {
    const overview = document.querySelector('[data-panel="oversikt"]');
    if (!(overview instanceof HTMLElement)) return;
    const counts = collectionCounts();
    let hero = overview.querySelector("[data-personal-collection-hero]");
    if (!hero) {
      hero = document.createElement("section");
      hero.className = "collection-home-hero";
      hero.setAttribute("data-personal-collection-hero", "1");
      overview.prepend(hero);
    }
    hero.innerHTML = `
      <div class="collection-home-copy">
        <span class="collection-kicker">Min samling</span>
        <h1>Det du har oppdaget.<br>Samlet på ett sted.</h1>
        <p>Steder, kunnskap, mennesker og merker du har bygget opp i History Go. Samlingen viser hva du har funnet, hvor det kommer fra og hvilke sammenhenger som finnes mellom delene.</p>
        <div class="collection-home-actions">
          <a class="collection-action primary" href="index.html?nextup=1">Fortsett å utforske</a>
          <button class="collection-action" type="button" data-collection-map>Se samlingen på kartet</button>
          <a class="collection-action" href="knowledge.html">Kunnskapen min</a>
        </div>
      </div>
      <div class="collection-home-metrics" aria-label="Samlingen din">
        <div class="collection-metric"><strong>${counts.places}</strong><span>steder</span></div>
        <div class="collection-metric"><strong>${counts.knowledge}</strong><span>kunnskapsenheter</span></div>
        <div class="collection-metric"><strong>${counts.people}</strong><span>personer</span></div>
        <div class="collection-metric"><strong>${counts.badges}</strong><span>merker</span></div>
      </div>`;
    hero.querySelector("[data-collection-map]")?.addEventListener("click", () => {
      const mapButton = document.getElementById("btnSeeMap");
      if (mapButton instanceof HTMLElement) mapButton.click();
      else global.location.href = "index.html";
    });
  }

  function renderCollectionOverview() {
    const panel = document.querySelector('[data-panel="samling"]');
    if (!(panel instanceof HTMLElement)) return;
    const counts = collectionCounts();
    let root = panel.querySelector("[data-collection-overview]");
    if (!root) {
      root = document.createElement("section");
      root.setAttribute("data-collection-overview", "1");
      panel.prepend(root);
    }
    root.innerHTML = `
      <div class="collection-overview-grid" aria-label="Deler av samlingen">
        <a class="collection-overview-card" href="index.html"><span>Steder</span><strong>${counts.places}</strong><small>Besøkte og låste steder</small></a>
        <a class="collection-overview-card" href="knowledge.html"><span>Kunnskap</span><strong>${counts.knowledge}</strong><small>Canonical Knowledge V2</small></a>
        <div class="collection-overview-card"><span>Personer</span><strong>${counts.people}</strong><small>Mennesker du har oppdaget</small></div>
        <button class="collection-overview-card" type="button" data-open-main-panel="merker"><span>Merker</span><strong>${counts.badges}</strong><small>Det du har oppnådd</small></button>
        <a class="collection-overview-card" href="notater.html"><span>Mine bidrag</span><strong>${counts.contributions}</strong><small>Egne notater og refleksjoner</small></a>
      </div>`;
    root.querySelector("[data-open-main-panel='merker']")?.addEventListener("click", () => {
      document.querySelector('.profile-tab[data-tab="merker"]')?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
  }

  function humanize(value) {
    return s(value).replace(/^em_[a-z]+_/i, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  }

  function buildRelationships() {
    const entries = knowledgeEntries();
    const byPlace = new Map();
    entries.forEach(entry => {
      const placeId = s(entry?.source?.place_id);
      if (!placeId) return;
      const row = byPlace.get(placeId) || { placeId, total: 0, subjects: new Set(), kinds: new Set() };
      row.total += 1;
      const subject = s(entry?.subject_id || entry?.fagkart_category_id);
      const kind = s(entry?.collection_kind || entry?.kind);
      if (subject) row.subjects.add(subject);
      if (kind) row.kinds.add(kind);
      byPlace.set(placeId, row);
    });
    return [...byPlace.values()].sort((a, b) => b.total - a.total).slice(0, 4);
  }

  function renderRelationships() {
    const overview = document.querySelector('[data-panel="oversikt"]');
    const grid = overview?.querySelector(".profile-dashboard-grid");
    if (!(overview instanceof HTMLElement) || !grid) return;
    let card = overview.querySelector("[data-collection-relationships]");
    if (!card) {
      card = document.createElement("section");
      card.className = "collection-relationship-card";
      card.setAttribute("data-collection-relationships", "1");
      grid.insertAdjacentElement("beforebegin", card);
    }
    const rows = buildRelationships();
    card.innerHTML = `
      <h2>Sammenhenger i samlingen din</h2>
      <p>Disse koblingene kommer fra kunnskapen du faktisk har samlet og dens canonical sted- og fagproveniens.</p>
      ${rows.length ? `<div class="collection-relationship-list">${rows.map(row => `
        <div class="collection-relationship">
          <strong>${esc(humanize(row.placeId))}</strong>
          <span>${row.total} kunnskapsenhet${row.total === 1 ? "" : "er"} · ${esc([...row.subjects].map(humanize).slice(0, 3).join(" · ") || "kildebundet kunnskap")}</span>
        </div>`).join("")}</div>` : `<p class="muted">Når du samler kunnskap med stedskoblinger, vil sammenhengene vises her.</p>`}`;
  }

  async function openAhaCollection() {
    const auth = global.HistoryGoAHAAuth;
    let state = null;
    try { state = await auth?.refresh?.(); } catch {}
    if (!state?.signed_in) {
      if (typeof global.HGUserProfile?.openLoginPopup === "function") {
        global.HGUserProfile.openLoginPopup();
        return;
      }
      if (typeof auth?.openAhaLogin === "function") {
        auth.openAhaLogin();
        return;
      }
    }
    try { global.exportHistoryGoData?.(); } catch {}
    global.location.href = AHA_URL;
  }

  function renderAhaCard() {
    const overview = document.querySelector('[data-panel="oversikt"]');
    const grid = overview?.querySelector(".profile-dashboard-grid");
    if (!(overview instanceof HTMLElement) || !grid) return;
    let card = overview.querySelector("[data-collection-aha]");
    if (!card) {
      card = document.createElement("section");
      card.className = "collection-aha-card";
      card.setAttribute("data-collection-aha", "1");
      grid.insertAdjacentElement("beforebegin", card);
    }
    card.innerHTML = `
      <div><h2>Se samlingen din på en ny måte</h2><p>AHA kan analysere mønstre mellom stedene, kunnskapen, menneskene og fagene du har samlet. Eksisterende private History Go → AHA-grense brukes; ingen egen samlings-eksport opprettes.</p></div>
      <button class="collection-action primary" type="button" data-collection-aha-button>Utforsk samlingen min med AHA</button>`;
    card.querySelector("[data-collection-aha-button]")?.addEventListener("click", () => void openAhaCollection());
  }

  function renderCanonicalNextUpStatus() {
    const card = document.getElementById("nextUpProfileCard");
    if (!(card instanceof HTMLElement)) return;
    const path = readJson("hg_active_path_v1", {});
    const tri = readJson("hg_nextup_tri", {});
    const because = s(global.localStorage?.getItem("hg_nextup_because"));
    const summary = path?.summary || {};
    const hasState = Boolean(summary?.step_count || because || tri?.current_place_id || (tri?.suggestions || []).length);
    if (!hasState) {
      card.style.display = "none";
      return;
    }
    const title = s(summary?.title) || "Next Up er klar på kartet";
    const pathEl = document.getElementById("nextUpProfilePath");
    const titleEl = card.querySelector(".nextup-profile-title");
    if (titleEl) titleEl.textContent = title;
    if (pathEl) {
      pathEl.innerHTML = `${Number(summary?.step_count || 0) ? `${Number(summary.step_count)} steg i pågående rute` : "Neste forslag velges i footer-popupen på hovedkartet."}<div class="profile-nextup-canonical-note"><span>➜ i footeren er den autoritative Next Up-flaten.</span><a class="collection-action" href="index.html?nextup=1">Åpne Next Up</a></div>`;
    }
    card.style.display = "block";
  }

  function installMoreMenu() {
    const tabs = document.querySelector(".profile-tabs");
    if (!(tabs instanceof HTMLElement) || tabs.querySelector("[data-profile-more-wrap]")) return;
    const wrap = document.createElement("div");
    wrap.className = "profile-more-wrap";
    wrap.setAttribute("data-profile-more-wrap", "1");
    wrap.innerHTML = `<button class="profile-more-trigger" type="button" aria-expanded="false">Mer</button><div class="profile-more-menu">${SECONDARY_PANELS.map(([id, label]) => `<button type="button" data-secondary-panel="${esc(id)}">${esc(label)}</button>`).join("")}</div>`;
    tabs.appendChild(wrap);
    const trigger = wrap.querySelector(".profile-more-trigger");
    trigger?.addEventListener("click", event => {
      event.stopPropagation();
      const open = !wrap.classList.contains("is-open");
      wrap.classList.toggle("is-open", open);
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    wrap.querySelectorAll("[data-secondary-panel]").forEach(button => {
      button.addEventListener("click", () => {
        const id = button.getAttribute("data-secondary-panel");
        const original = document.querySelector(`.profile-tab[data-tab="${CSS.escape(id || "")}"]`);
        if (original instanceof HTMLElement) original.click();
        wrap.classList.remove("is-open");
        trigger?.classList.add("is-active");
        trigger?.setAttribute("aria-expanded", "false");
      });
    });
    tabs.querySelectorAll('.profile-tab:not([data-tab="civication"]):not([data-tab="socialmeet"]):not([data-tab="profilvalg"])').forEach(tab => {
      tab.addEventListener("click", () => trigger?.classList.remove("is-active"));
    });
    document.addEventListener("click", event => {
      if (!(event.target instanceof Node) || !wrap.contains(event.target)) {
        wrap.classList.remove("is-open");
        trigger?.setAttribute("aria-expanded", "false");
      }
    });
  }

  function renamePersonalArea() {
    document.title = "Min samling | History Go";
    document.querySelector(".profile-tabs")?.setAttribute("aria-label", "Min samling");
  }

  function renderAll() {
    if (!document.body?.classList.contains("profile-page")) return;
    insertIdentityLabel();
    renamePersonalArea();
    installMoreMenu();
    renderHomeHero();
    renderCollectionOverview();
    renderRelationships();
    renderAhaCard();
    renderCanonicalNextUpStatus();
  }

  function boot() {
    renderAll();
    global.setTimeout(renderAll, 300);
    global.setTimeout(renderAll, 1100);
  }

  global.HGPersonalCollectionV1 = { collectionCounts, renderAll, openAhaCollection };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
  global.addEventListener?.("updateProfile", () => global.setTimeout(renderAll, 0));
})(window);
