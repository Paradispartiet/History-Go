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
  const list = value => Array.isArray(value) ? value : value == null ? [] : [value];
  const unique = values => [...new Set(values.map(s).filter(Boolean))];

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

  function timestamp(value) {
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    if (typeof value === "string") return Date.parse(value) || Number(value) || 0;
    if (!value || typeof value !== "object") return 0;
    return timestamp(value.collected_at || value.collectedAt || value.visited_at || value.visitedAt || value.earned_at || value.earnedAt || value.unlocked_at || value.unlockedAt || value.last_seen_at || value.updated_at || value.updatedAt || value.timestamp || value.ts);
  }

  function progressRows(key) {
    const raw = readJson(key, {});
    if (Array.isArray(raw)) {
      return raw.map((value, index) => typeof value === "object" && value
        ? { id: s(value.id || value.place_id || value.placeId || value.person_id || value.personId), value, at: timestamp(value), index }
        : { id: s(value), value, at: 0, index }).filter(row => row.id);
    }
    if (!raw || typeof raw !== "object") return [];
    return Object.entries(raw).filter(([, value]) => Boolean(value)).map(([id, value], index) => ({ id: s(id), value, at: timestamp(value), index }));
  }

  function latest(rows) {
    return rows.slice().sort((a, b) => b.at - a.at || b.index - a.index)[0] || null;
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
      if (value && typeof value === "object") return sum + (Number(value.points || value.level || 0) > 0 ? 1 : 0);
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

  function humanize(value) {
    return s(value).replace(/^em_[a-z]+_/i, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  }

  function dataRows(name) {
    const rows = global[name];
    return Array.isArray(rows) ? rows : [];
  }

  function byId(name, id) {
    const key = s(id);
    return dataRows(name).find(row => s(row?.id) === key) || null;
  }

  function labelFor(name, id) {
    const row = byId(name, id);
    return s(row?.name || row?.title) || humanize(id);
  }

  function imageFor(name, id) {
    const row = byId(name, id);
    return s(row?.cardImage || row?.imageCard || row?.image || row?.frontImage || row?.icon);
  }

  function activatePanel(panelId) {
    const tab = document.querySelector(`.profile-tab[data-tab="${CSS.escape(s(panelId))}"]`);
    if (tab instanceof HTMLElement) tab.click();
  }

  function openCollectedObject(type, id) {
    const key = s(id);
    if (!key) return;
    if (type === "place") {
      global.location.href = `index.html?collectionPlace=${encodeURIComponent(key)}`;
      return;
    }
    const panel = type === "badge" ? "merker" : "samling";
    const selector = type === "badge" ? `[data-badge-id="${CSS.escape(key)}"]` : `[data-person="${CSS.escape(key)}"]`;
    activatePanel(panel);
    global.setTimeout(() => document.querySelector(selector)?.click(), 40);
  }

  function renderHomeHero() {
    const hero = document.querySelector("[data-personal-collection-hero]");
    if (!(hero instanceof HTMLElement)) return;
    const counts = collectionCounts();
    const visited = document.getElementById("statVisited");
    if (visited) visited.textContent = String(counts.places);
    hero.querySelector('[data-collection-count="knowledge"]')?.replaceChildren(String(counts.knowledge));
    hero.querySelector('[data-collection-count="people"]')?.replaceChildren(String(counts.people));
    hero.querySelector('[data-collection-count="badges"]')?.replaceChildren(String(counts.badges));
    if (hero.dataset.collectionBound === "1") return;
    hero.dataset.collectionBound = "1";
    hero.querySelector("[data-collection-map]")?.addEventListener("click", () => {
      const mapButton = document.getElementById("btnSeeMap");
      if (mapButton instanceof HTMLElement) mapButton.click();
      else global.location.href = "index.html";
    });
    hero.querySelector("[data-collection-aha-button]")?.addEventListener("click", () => void openAhaCollection());
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
        <button class="collection-overview-card" type="button" data-collection-target="people"><span>Personer</span><strong>${counts.people}</strong><small>Åpne personbiblioteket</small></button>
        <button class="collection-overview-card" type="button" data-collection-target="merker"><span>Merker</span><strong>${counts.badges}</strong><small>Åpne merkebiblioteket</small></button>
        <a class="collection-overview-card" href="notater.html"><span>Mine bidrag</span><strong>${counts.contributions}</strong><small>Egne notater og refleksjoner</small></a>
      </div>`;
    root.querySelector('[data-collection-target="people"]')?.addEventListener("click", () => document.getElementById("peopleLibrary")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    root.querySelector('[data-collection-target="merker"]')?.addEventListener("click", () => activatePanel("merker"));
  }

  function visitRows() {
    const rows = progressRows("visited_places");
    const stats = readJson("hg_groundhopper_stats_v1", {});
    const dates = stats?.last_visit_by_place || {};
    return rows.map(row => ({ ...row, at: Math.max(row.at, timestamp(dates[row.id])) }));
  }

  function knowledgeRow() {
    return latest(knowledgeEntries().map((entry, index) => ({
      id: s(entry?.id || entry?.knowledge_unit_id) || `knowledge-${index}`,
      value: entry,
      at: timestamp(entry?.last_seen_at || entry?.learned_at),
      index
    })));
  }

  function meritRows() {
    const merits = readJson("merits_by_category", {});
    return Object.entries(merits || {}).filter(([, value]) => value && (typeof value !== "object" || Number(value.points || value.level || 0) > 0)).map(([id, value], index) => ({ id, value, at: timestamp(value), index }));
  }

  function recentCard(type, row) {
    const labels = { place: "Sted", knowledge: "Kunnskap", person: "Person", badge: "Merke" };
    if (!row) return `<article class="collection-recent-card is-empty"><span>${labels[type]}</span><strong>Ikke samlet ennå</strong><small>Dette fylles fra den eksisterende samlingen.</small></article>`;
    let title = humanize(row.id);
    let meta = "Samlet i History Go";
    let image = "";
    let action = "";
    if (type === "place") {
      title = labelFor("PLACES", row.id);
      image = imageFor("PLACES", row.id);
      action = `<a href="index.html?collectionPlace=${encodeURIComponent(row.id)}">Åpne sted</a>`;
    } else if (type === "person") {
      title = labelFor("PEOPLE", row.id);
      image = imageFor("PEOPLE", row.id);
      action = `<button type="button" data-open-collected="person" data-collected-id="${esc(row.id)}">Åpne person</button>`;
    } else if (type === "badge") {
      title = labelFor("BADGES", row.id);
      image = imageFor("BADGES", row.id);
      action = `<button type="button" data-open-collected="badge" data-collected-id="${esc(row.id)}">Åpne merke</button>`;
    } else {
      const entry = row.value || {};
      const subject = s(entry.subject_id || entry.fagkart_category_id);
      title = s(entry.topic) || "Kunnskapsenhet";
      meta = s(entry.text) || "Canonical Knowledge V2";
      action = `<a href="knowledge.html${subject ? `?subject=${encodeURIComponent(subject)}&entry=${encodeURIComponent(row.id)}` : `?entry=${encodeURIComponent(row.id)}`}">Åpne kunnskap</a>`;
    }
    const date = row.at ? new Date(row.at).toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" }) : "";
    return `<article class="collection-recent-card" data-recent-type="${type}">${image ? `<img src="${esc(image)}" alt="">` : `<span class="collection-recent-symbol" aria-hidden="true">${type === "knowledge" ? "Aa" : type === "place" ? "⌖" : type === "person" ? "◎" : "◇"}</span>`}<div><span>${labels[type]}${date ? ` · ${esc(date)}` : ""}</span><strong>${esc(title)}</strong><small>${esc(meta)}</small>${action}</div></article>`;
  }

  function renderRecentlyCollected() {
    const overview = document.querySelector('[data-panel="oversikt"]');
    const grid = overview?.querySelector(".profile-dashboard-grid");
    if (!(overview instanceof HTMLElement) || !grid) return;
    let section = overview.querySelector("[data-recently-collected]");
    if (!section) {
      section = document.createElement("section");
      section.className = "collection-recent-section";
      section.setAttribute("data-recently-collected", "1");
      grid.insertAdjacentElement("beforebegin", section);
    }
    section.innerHTML = `<div class="section-head"><div><span class="collection-kicker">På tvers av samlingen</span><h2>Nylig samlet</h2></div><span class="section-meta">Siste canonical objekt i hver del</span></div><div class="collection-recent-grid">${recentCard("place", latest(visitRows()))}${recentCard("person", latest(progressRows("people_collected")))}${recentCard("knowledge", knowledgeRow())}${recentCard("badge", latest(meritRows()))}</div>`;
    section.querySelectorAll("[data-open-collected]").forEach(button => button.addEventListener("click", () => openCollectedObject(button.getAttribute("data-open-collected"), button.getAttribute("data-collected-id"))));
  }

  function explicitPlaceIds(entry) {
    const source = entry?.source || {};
    const atlasGeo = entry?.atlas_provenance?.geographic_scope || {};
    return unique([source.place_id, ...list(source.place_ids), ...list(source.related_place_ids), ...list(entry?.place_ids), ...list(entry?.related_place_ids), ...list(atlasGeo.place_ids), source.target_type === "place" ? source.target_id : ""]);
  }

  function explicitPersonIds(entry) {
    const source = entry?.source || {};
    return unique([source.person_id, ...list(source.person_ids), ...list(source.related_person_ids), ...list(entry?.person_ids), ...list(entry?.related_person_ids), source.target_type === "person" ? source.target_id : ""]);
  }

  function badgeForSubject(subjectId) {
    const subject = s(subjectId);
    if (!subject) return "";
    const merits = readJson("merits_by_category", {});
    if (Object.prototype.hasOwnProperty.call(merits || {}, subject)) return subject;
    const badge = dataRows("BADGES").find(row => [row?.id, row?.categoryId, row?.key].some(value => s(value) === subject));
    const id = s(badge?.id);
    return id && Object.prototype.hasOwnProperty.call(merits || {}, id) ? id : "";
  }

  function buildRelationshipPaths() {
    const requested = s(new URLSearchParams(global.location.search).get("collectionRelation"));
    return knowledgeEntries().map((entry, index) => {
      const id = s(entry?.id || entry?.knowledge_unit_id) || `knowledge-${index}`;
      if (requested && id !== requested) return null;
      const subjectId = s(entry?.subject_id || entry?.fagkart_category_id);
      const placeIds = explicitPlaceIds(entry);
      const personIds = explicitPersonIds(entry);
      return { id, title: s(entry?.topic) || "Kunnskapsenhet", subjectId, placeIds, personIds, badgeId: badgeForSubject(subjectId) };
    }).filter(row => row && (row.placeIds.length || row.personIds.length)).slice(0, requested ? 1 : 6);
  }

  function relationshipNode(label, href, kind) {
    return href ? `<a class="collection-relation-node" data-node-kind="${kind}" href="${href}">${esc(label)}</a>` : `<span class="collection-relation-node" data-node-kind="${kind}">${esc(label)}</span>`;
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
    const rows = buildRelationshipPaths();
    card.innerHTML = `<div class="section-head"><div><span class="collection-kicker">Canonical relasjoner</span><h2>Sammenhenger i samlingen din</h2></div><a class="collection-action" href="knowledge.html">Utforsk kunnskapen</a></div><p>Hver sti bruker bare eksplisitte sted-, person-, fag- og merkekoblinger som allerede finnes i samlingen.</p>${rows.length ? `<div class="collection-relation-paths">${rows.map(row => {
      const subjectHref = row.subjectId ? `knowledge.html?subject=${encodeURIComponent(row.subjectId)}&entry=${encodeURIComponent(row.id)}` : `knowledge.html?entry=${encodeURIComponent(row.id)}`;
      const anchors = [
        ...row.placeIds.slice(0, 2).map(id => relationshipNode(labelFor("PLACES", id), `index.html?collectionPlace=${encodeURIComponent(id)}`, "place")),
        ...row.personIds.slice(0, 2).map(id => relationshipNode(labelFor("PEOPLE", id), `profile.html?collectionPerson=${encodeURIComponent(id)}`, "person"))
      ];
      return anchors.map(anchor => {
        const nodes = [
          anchor,
          relationshipNode(row.title, subjectHref, "knowledge"),
          row.subjectId ? relationshipNode(humanize(row.subjectId), `knowledge.html?subject=${encodeURIComponent(row.subjectId)}`, "subject") : "",
          row.badgeId ? relationshipNode(labelFor("BADGES", row.badgeId), `profile.html?collectionBadge=${encodeURIComponent(row.badgeId)}`, "badge") : ""
        ].filter(Boolean);
        return `<article class="collection-relation-path" data-relation-entry="${esc(row.id)}">${nodes.join('<span class="collection-relation-arrow" aria-hidden="true">→</span>')}</article>`;
      }).join("");
    }).join("")}</div>` : `<p class="muted">Når kunnskapen har eksplisitte sted- eller personkoblinger, vises klikkbare relasjonsstier her.</p>`}`;
  }

  function renderGeography() {
    const root = document.getElementById("collectionGeography");
    if (!root) return;
    const ids = new Set(progressRows("visited_places").map(row => row.id));
    const groups = new Map();
    dataRows("PLACES").filter(place => ids.has(s(place?.id))).forEach(place => {
      const label = s(place?.address?.city || place?.city || place?.municipality || place?.region || place?.address?.country || place?.country) || "Uten områdemetadata";
      groups.set(label, (groups.get(label) || 0) + 1);
    });
    const rows = [...groups.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "nb"));
    root.innerHTML = rows.length ? `<span class="collection-geography-label">Geografisk fordelt</span>${rows.slice(0, 8).map(([label, count]) => `<span class="collection-geography-chip"><strong>${count}</strong> ${esc(label)}</span>`).join("")}` : "";
  }

  function installLibraryControls() {
    const bind = (inputSelector, cardSelector, metaSelector, countLabel) => {
      const input = document.querySelector(inputSelector);
      if (!(input instanceof HTMLInputElement) || input.dataset.collectionBound === "1") return;
      input.dataset.collectionBound = "1";
      const apply = () => {
        const query = s(input.value).toLocaleLowerCase("nb");
        const cards = [...document.querySelectorAll(cardSelector)];
        let visible = 0;
        cards.forEach(card => {
          const haystack = `${s(card.textContent)} ${s(card.querySelector("img")?.getAttribute("alt"))}`.toLocaleLowerCase("nb");
          const show = !query || haystack.includes(query);
          card.toggleAttribute("hidden", !show);
          if (show) visible += 1;
        });
        const meta = document.querySelector(metaSelector);
        if (meta) meta.textContent = `${visible} ${countLabel}${query ? " i søket" : " samlet"}`;
      };
      input.addEventListener("input", apply);
    };
    bind("[data-people-library-search]", "#peopleGrid .avatar-card", "[data-people-library-meta]", "personer");
    bind("[data-badge-library-search]", "#merits .badge-mini", "[data-badge-library-meta]", "merker");
  }

  function refreshLibraryMeta() {
    const people = document.querySelectorAll("#peopleGrid .avatar-card:not([hidden])").length;
    const badges = document.querySelectorAll("#merits .badge-mini:not([hidden])").length;
    const peopleMeta = document.querySelector("[data-people-library-meta]");
    const badgeMeta = document.querySelector("[data-badge-library-meta]");
    if (peopleMeta) peopleMeta.textContent = `${people} personer samlet · åpne et kort for objektvisning`;
    if (badgeMeta) badgeMeta.textContent = `${badges} merker samlet · åpne et kort for detaljer`;
  }

  async function openAhaCollection() {
    const auth = global.HistoryGoAHAAuth;
    let state = null;
    try { state = await auth?.refresh?.(); } catch {}
    if (!state?.signed_in) {
      if (typeof global.HGUserProfile?.openLoginPopup === "function") { global.HGUserProfile.openLoginPopup(); return; }
      if (typeof auth?.openAhaLogin === "function") { auth.openAhaLogin(); return; }
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
    card.innerHTML = `<div><h2>Se samlingen din på en ny måte</h2><p>AHA kan analysere mønstre mellom stedene, kunnskapen, menneskene og fagene du har samlet. Eksisterende private History Go → AHA-grense brukes; ingen egen samlings-eksport opprettes.</p></div><button class="collection-action primary" type="button" data-collection-aha-section-button>Utforsk samlingen min med AHA</button>`;
    card.querySelector("[data-collection-aha-section-button]")?.addEventListener("click", () => void openAhaCollection());
  }

  function renderCanonicalNextUpStatus() {
    const card = document.getElementById("nextUpProfileCard");
    if (!(card instanceof HTMLElement)) return;
    const path = readJson("hg_active_path_v1", {});
    const tri = readJson("hg_nextup_tri", {});
    const because = s(global.localStorage?.getItem("hg_nextup_because"));
    const summary = path?.summary || {};
    const hasState = Boolean(summary?.step_count || because || tri?.current_place_id || (tri?.suggestions || []).length);
    if (!hasState) { card.style.display = "none"; return; }
    const pathEl = document.getElementById("nextUpProfilePath");
    const titleEl = card.querySelector(".nextup-profile-title");
    if (titleEl) titleEl.textContent = s(summary?.title) || "Next Up er klar på kartet";
    if (pathEl) pathEl.innerHTML = `${Number(summary?.step_count || 0) ? `${Number(summary.step_count)} steg i pågående rute` : "Neste forslag velges i footer-popupen på hovedkartet."}<div class="profile-nextup-canonical-note"><span>➜ i footeren er den autoritative Next Up-flaten.</span><a class="collection-action" href="index.html?nextup=1">Åpne Next Up</a></div>`;
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
    wrap.querySelectorAll("[data-secondary-panel]").forEach(button => button.addEventListener("click", () => {
      activatePanel(button.getAttribute("data-secondary-panel"));
      wrap.classList.remove("is-open");
      trigger?.classList.add("is-active");
      trigger?.setAttribute("aria-expanded", "false");
    }));
    tabs.querySelectorAll('.profile-tab:not([data-tab="civication"]):not([data-tab="socialmeet"]):not([data-tab="profilvalg"])').forEach(tab => tab.addEventListener("click", () => trigger?.classList.remove("is-active")));
    document.addEventListener("click", event => {
      if (!(event.target instanceof Node) || !wrap.contains(event.target)) {
        wrap.classList.remove("is-open");
        trigger?.setAttribute("aria-expanded", "false");
      }
    });
  }

  function handleCollectionIntent() {
    if (document.body?.dataset.collectionIntentHandled === "1") return;
    const params = new URLSearchParams(global.location.search);
    const personId = s(params.get("collectionPerson"));
    const badgeId = s(params.get("collectionBadge"));
    const relationId = s(params.get("collectionRelation"));
    if (!personId && !badgeId && !relationId) return;
    document.body.dataset.collectionIntentHandled = "1";
    global.setTimeout(() => {
      if (personId) openCollectedObject("person", personId);
      else if (badgeId) openCollectedObject("badge", badgeId);
      else document.querySelector("[data-collection-relationships]")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 1250);
  }

  function renderAll() {
    if (!document.body?.classList.contains("profile-page")) return;
    document.title = "Min samling | History Go";
    document.querySelector(".profile-tabs")?.setAttribute("aria-label", "Min samling");
    installMoreMenu();
    renderHomeHero();
    renderCollectionOverview();
    renderRecentlyCollected();
    renderRelationships();
    renderGeography();
    renderAhaCard();
    renderCanonicalNextUpStatus();
    installLibraryControls();
    refreshLibraryMeta();
    handleCollectionIntent();
  }

  function boot() {
    renderAll();
    global.setTimeout(renderAll, 300);
    global.setTimeout(renderAll, 1200);
  }

  global.HGPersonalCollectionV1 = { collectionCounts, buildRelationshipPaths, renderAll, openAhaCollection };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
  global.addEventListener?.("updateProfile", () => global.setTimeout(renderAll, 0));
})(window);
