// js/ui/place-language-layer.js
// Fremhever det eksisterende Språkleksikonet som et stedbundet kunnskaps- og samlelag.
// Datakilden forblir data/leksikon/sprak/**. Ingen ny PlaceCard-runding introduseres.
(function installPlaceLanguageLayer(global) {
  "use strict";

  const INSTALL_FLAG = "__HG_PLACE_LANGUAGE_LAYER_INSTALLED__";
  const TAB_ID = "language";
  const MANIFEST_PATH = "data/leksikon/sprak/manifest.json";
  const KNOWLEDGE_KEY = "hg_knowledge_entries_v2";
  const KNOWLEDGE_SCHEMA = "history_go_knowledge_entry_v2";
  const KNOWLEDGE_VERSION = 2;
  const SOURCE_TYPE = "language_lexicon";
  const articleCache = new Map();
  let manifestPromise = null;

  const text = value => String(value == null ? "" : value).trim();
  const list = value => Array.isArray(value) ? value : [];
  const esc = value => String(value == null ? "" : value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  function unique(values) {
    return [...new Set(list(values).map(text).filter(Boolean))];
  }

  function slug(value) {
    return text(value)
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9_-]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 100);
  }

  function ensureStyle() {
    if (document.querySelector('link[data-hg-place-language-style="1"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "css/place-language-layer.css";
    link.dataset.hgPlaceLanguageStyle = "1";
    document.head.appendChild(link);
  }

  function safeHttpsUrl(value) {
    const raw = text(value);
    if (!raw) return "";
    try {
      const parsed = new URL(raw, global.location?.origin || undefined);
      return parsed.protocol === "https:" ? parsed.href : "";
    } catch {
      return "";
    }
  }

  const TYPE_ALIASES = Object.freeze({
    ord: "word",
    word: "word",
    fagord: "word",
    objektord: "word",
    personord: "word",
    uttrykk: "expression",
    expression: "expression",
    lokal_vending: "expression",
    slang: "expression",
    dialekttrekk: "dialect_feature",
    dialect_feature: "dialect_feature",
    uttale: "pronunciation",
    pronunciation: "pronunciation",
    stedsnavn: "place_name",
    place_name: "place_name",
    historisk_navn: "place_name",
    kallenavn: "place_name",
    sprakhistorie: "language_history",
    language_history: "language_history"
  });

  const TYPE_LABELS = Object.freeze({
    word: "Ord",
    expression: "Uttrykk",
    dialect_feature: "Dialekttrekk",
    pronunciation: "Uttale",
    place_name: "Stedsnavn",
    language_history: "Språkhistorie",
    term: "Begrep"
  });

  const STATUS_LABELS = Object.freeze({
    current: "I bruk",
    common: "Vanlig",
    older: "Eldre",
    rare: "Sjeldent",
    historical: "Historisk",
    uncertain: "Usikkert dokumentert"
  });

  function canonicalType(entry) {
    const raw = slug(entry?.type || entry?.kind || "term");
    return TYPE_ALIASES[raw] || "term";
  }

  function typeLabel(entry) {
    const canonical = canonicalType(entry);
    if (canonical === "term") {
      const raw = text(entry?.type || entry?.kind);
      return raw ? raw.replaceAll("_", " ").replace(/^./, char => char.toUpperCase()) : TYPE_LABELS.term;
    }
    return TYPE_LABELS[canonical] || TYPE_LABELS.term;
  }

  async function loadManifest() {
    if (manifestPromise) return manifestPromise;
    manifestPromise = fetch(MANIFEST_PATH, { cache: "default" })
      .then(response => response.ok ? response.json() : { place_files: {} })
      .catch(() => ({ place_files: {} }));
    return manifestPromise;
  }

  async function loadForPlace(placeId) {
    const id = text(placeId);
    if (!id) return null;
    if (articleCache.has(id)) return articleCache.get(id);

    const manifest = await loadManifest();
    const sourceFile = text(manifest?.place_files?.[id]);
    if (!sourceFile) {
      articleCache.set(id, null);
      return null;
    }

    const article = await fetch(sourceFile, { cache: "default" })
      .then(response => response.ok ? response.json() : null)
      .catch(() => null);
    const result = article && text(article.place_id) === id
      ? { article, sourceFile }
      : null;
    articleCache.set(id, result);
    return result;
  }

  function knowledgeId(entry) {
    const entryId = slug(entry?.id || entry?.term || "entry") || "entry";
    return `ku_sprak_${entryId}`;
  }

  function readKnowledgeEntries() {
    try {
      const rows = JSON.parse(global.localStorage?.getItem(KNOWLEDGE_KEY) || "[]");
      return Array.isArray(rows) ? rows : [];
    } catch {
      return [];
    }
  }

  function isCollected(entry) {
    const id = knowledgeId(entry);
    try {
      if (typeof global.HGKnowledgeV2?.getEntries === "function") {
        return list(global.HGKnowledgeV2.getEntries()).some(row => text(row?.id) === id || text(row?.knowledge_unit_id) === id);
      }
    } catch {}
    return readKnowledgeEntries().some(row => text(row?.id) === id || text(row?.knowledge_unit_id) === id);
  }

  function knowledgeEntryForLanguage(entry, context = {}) {
    const now = new Date().toISOString();
    const id = knowledgeId(entry);
    const placeId = text(context.placeId);
    const placeName = text(context.placeName || placeId);
    const canonical = canonicalType(entry);
    const term = text(entry?.term || entry?.title || entry?.id || "Språkoppføring");
    const meaning = text(entry?.meaning || entry?.description || entry?.desc);
    const example = text(entry?.example);
    const dialectArea = text(entry?.dialect_area || context.article?.dialect_area);
    const emneIds = unique([...(list(context.article?.emne_ids)), ...(list(entry?.emne_ids))]);
    const tags = unique([...(list(entry?.tags)), "språkleksikon", canonical, dialectArea]);
    const concepts = unique([dialectArea, typeLabel(entry)]);
    const termId = `term_sprak_${slug(entry?.id || term) || "entry"}`;
    const conceptIds = concepts.map(value => `co_sprak_${slug(value)}`).filter(value => value !== "co_sprak_");

    return {
      schema: KNOWLEDGE_SCHEMA,
      version: KNOWLEDGE_VERSION,
      id,
      knowledge_unit_id: id,
      subject_id: "sprak",
      fagkart_category_id: "sprak",
      emne_ids: emneIds,
      concept_ids: conceptIds,
      term_ids: [termId],
      story_ids: [],
      concepts,
      terms: [term],
      tags,
      kind: "language",
      dimension: canonical,
      topic: placeName ? `Språk på ${placeName}` : "Stedbundet språk",
      text: [meaning, example ? `Eksempel: ${example}` : ""].filter(Boolean).join(" ") || term,
      source: {
        type: SOURCE_TYPE,
        quiz_id: null,
        target_id: placeId || null,
        place_id: placeId || null,
        person_id: null,
        source_file: text(context.sourceFile) || null,
        unit_id: text(entry?.id) || null
      },
      learned_at: now,
      last_seen_at: now,
      times_seen: 1,
      content_quality: {
        version: 2,
        precise_claim: Boolean(meaning),
        canonical_capture: true,
        source_bound: true
      },
      link_status: emneIds.length ? "linked" : "language_lexicon"
    };
  }

  function captureLanguageKnowledge(entry, context = {}) {
    if (!entry || !text(entry.id || entry.term)) return null;
    const incoming = knowledgeEntryForLanguage(entry, context);
    const rows = readKnowledgeEntries();
    const index = rows.findIndex(row => text(row?.id) === incoming.id || text(row?.knowledge_unit_id) === incoming.id);

    if (index >= 0) return rows[index];

    rows.push(incoming);
    try {
      global.localStorage?.setItem(KNOWLEDGE_KEY, JSON.stringify(rows));
    } catch {
      return null;
    }

    try {
      global.dispatchEvent?.(new CustomEvent("hg:knowledgeCollected", {
        detail: { source: SOURCE_TYPE, entry: incoming }
      }));
      global.dispatchEvent?.(new CustomEvent("updateProfile"));
    } catch {}
    return incoming;
  }

  function collectedLanguageEntries() {
    return readKnowledgeEntries().filter(row => text(row?.source?.type) === SOURCE_TYPE);
  }

  function installKnowledgeBridge() {
    const api = global.HGKnowledgeV2;
    if (!api || api.__hgLanguageBridge) return Boolean(api);

    api.captureLanguageKnowledge = captureLanguageKnowledge;
    api.getCollectedLanguageEntries = collectedLanguageEntries;

    if (typeof api.buildProfile === "function") {
      const originalBuildProfile = api.buildProfile.bind(api);
      api.buildProfile = async function buildProfileWithLanguageLabel(options) {
        const profile = await originalBuildProfile(options);
        if (profile?.subjects?.sprak) profile.subjects.sprak.label = "Språk";
        return profile;
      };
    }

    api.__hgLanguageBridge = true;
    return true;
  }

  function sourceLinks(entry) {
    const links = list(entry?.sources)
      .map(source => {
        const url = safeHttpsUrl(typeof source === "string" ? source : source?.url);
        if (!url) return null;
        return {
          url,
          label: text(typeof source === "string" ? "Kilde" : source?.label || source?.title || "Kilde") || "Kilde"
        };
      })
      .filter(Boolean);
    if (!links.length) return "";
    return `<div class="hg-language-sources">${links.map(link => `<a href="${esc(link.url)}" target="_blank" rel="noopener noreferrer">${esc(link.label)} ↗</a>`).join("")}</div>`;
  }

  function relatedValues(values) {
    return list(values).map(value => {
      if (typeof value === "string") return text(value);
      return text(value?.label || value?.name || value?.title || value?.id);
    }).filter(Boolean);
  }

  function metaRow(label, value) {
    const clean = text(value);
    return clean ? `<p class="hg-language-meta-row"><strong>${esc(label)}</strong><span>${esc(clean)}</span></p>` : "";
  }

  function entryCard(entry) {
    const canonical = canonicalType(entry);
    const term = text(entry?.term || entry?.title || entry?.id || "Språkoppføring");
    const meaning = text(entry?.meaning || entry?.description || entry?.desc);
    const status = STATUS_LABELS[slug(entry?.status)] || text(entry?.status);
    const relatedPlaces = relatedValues(entry?.related_places);
    const relatedEntries = relatedValues(entry?.related_entries);
    const collected = isCollected(entry);

    return `
      <article class="hg-language-entry" data-language-entry data-language-type="${esc(canonical)}" data-language-entry-id="${esc(entry?.id || term)}">
        <header>
          <div>
            <span class="hg-language-entry-type">${esc(typeLabel(entry))}</span>
            <h3>${esc(term)}</h3>
          </div>
          ${status ? `<span class="hg-language-status">${esc(status)}</span>` : ""}
        </header>
        ${meaning ? `<p class="hg-language-meaning">${esc(meaning)}</p>` : ""}
        ${entry?.example ? `<blockquote class="hg-language-example"><span>Eksempel</span>${esc(entry.example)}</blockquote>` : ""}
        <div class="hg-language-meta">
          ${metaRow("Uttale", entry?.pronunciation)}
          ${metaRow("Dialektområde", entry?.dialect_area)}
          ${metaRow("Bruk", entry?.usage)}
          ${metaRow("Periode", entry?.historical_period)}
          ${metaRow("Opphav", entry?.etymology)}
          ${metaRow("Språkfamilie", entry?.language_family)}
        </div>
        ${entry?.context ? `<p class="hg-language-context"><strong>Kontekst</strong>${esc(entry.context)}</p>` : ""}
        ${relatedPlaces.length ? `<p class="hg-language-related"><strong>Relaterte steder</strong>${esc(relatedPlaces.join(" · "))}</p>` : ""}
        ${relatedEntries.length ? `<p class="hg-language-related"><strong>Relaterte språkspor</strong>${esc(relatedEntries.join(" · "))}</p>` : ""}
        ${list(entry?.tags).length ? `<div class="hg-language-tags">${list(entry.tags).map(tag => `<span>${esc(tag)}</span>`).join("")}</div>` : ""}
        <footer>
          ${sourceLinks(entry)}
          <button type="button" class="hg-language-collect${collected ? " is-collected" : ""}" data-language-collect="${esc(entry?.id || term)}" ${collected ? "disabled" : ""}>${collected ? "Samlet" : "Samle kunnskapen"}</button>
        </footer>
      </article>
    `;
  }

  function countByType(entries) {
    const counts = new Map();
    entries.forEach(entry => {
      const type = canonicalType(entry);
      counts.set(type, (counts.get(type) || 0) + 1);
    });
    return counts;
  }

  function renderLanguagePanel(place, article) {
    const entries = list(article?.entries).filter(entry => text(entry?.id || entry?.term));
    const counts = countByType(entries);
    const filters = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => `<button type="button" data-language-filter="${esc(type)}" aria-pressed="false">${esc(TYPE_LABELS[type] || "Begrep")} <span>${count}</span></button>`)
      .join("");
    const dialectArea = text(article?.dialect_area);

    return `
      <div class="hg-language-layer" data-language-place="${esc(place?.id || article?.place_id)}">
        <header class="hg-language-hero">
          <div class="hg-language-kicker">Språk på stedet</div>
          <h2>${esc(place?.name || article?.title || "Språkleksikon")}</h2>
          <p>${entries.length} ${entries.length === 1 ? "språkoppføring" : "språkoppføringer"}${dialectArea ? ` · ${esc(dialectArea)}` : ""}. Ord, uttrykk, navn og dialekttrekk samles som dokumentert stedskunnskap.</p>
          <div class="hg-language-summary">
            ${[...counts.entries()].map(([type, count]) => `<span><strong>${count}</strong> ${esc((TYPE_LABELS[type] || "begrep").toLowerCase())}</span>`).join("")}
          </div>
        </header>
        ${filters ? `<nav class="hg-language-filters" aria-label="Filtrer Språkleksikon"><button type="button" data-language-filter="all" aria-pressed="true">Alle <span>${entries.length}</span></button>${filters}</nav>` : ""}
        <div class="hg-language-list">${entries.map(entryCard).join("")}</div>
      </div>
    `;
  }

  function activateTab(tablist, panelWrap, id, focus = false) {
    const selected = tablist.querySelector(`[data-place-tab="${CSS.escape(id)}"]`);
    if (!selected) return;
    tablist.querySelectorAll("[role=tab]").forEach(button => {
      const active = button === selected;
      button.setAttribute("aria-selected", active ? "true" : "false");
      button.tabIndex = active ? 0 : -1;
    });
    panelWrap.querySelectorAll(":scope > [data-place-panel]").forEach(panel => {
      panel.hidden = panel.dataset.placePanel !== id;
    });
    if (focus) selected.focus();
  }

  function installGenericTabBridge(tablist, panelWrap) {
    if (tablist.dataset.hgLanguageTabBridge === "1") return;
    tablist.dataset.hgLanguageTabBridge = "1";

    tablist.addEventListener("click", event => {
      const button = event.target instanceof Element ? event.target.closest("[data-place-tab]") : null;
      if (!button || !tablist.contains(button)) return;
      event.stopImmediatePropagation();
      activateTab(tablist, panelWrap, button.dataset.placeTab, false);
    }, true);

    tablist.addEventListener("keydown", event => {
      const buttons = [...tablist.querySelectorAll("[role=tab]")];
      const index = buttons.indexOf(document.activeElement);
      if (index < 0) return;
      let next = index;
      if (event.key === "ArrowRight") next = (index + 1) % buttons.length;
      else if (event.key === "ArrowLeft") next = (index - 1 + buttons.length) % buttons.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = buttons.length - 1;
      else return;
      event.preventDefault();
      event.stopImmediatePropagation();
      activateTab(tablist, panelWrap, buttons[next].dataset.placeTab, true);
    }, true);
  }

  function removeLegacyLanguageSection(morePanel) {
    if (!morePanel) return;
    morePanel.querySelectorAll("h3").forEach(heading => {
      if (text(heading.textContent).toLowerCase() === "språkleksikon") heading.closest("section")?.remove();
    });
  }

  function addLanguageTeaser(tabsArticle, place, entries, tablist, panelWrap) {
    const about = tabsArticle.querySelector('[data-place-panel="about"]');
    if (!about || about.querySelector("[data-language-teaser]")) return;
    const terms = entries.slice(0, 3).map(entry => text(entry?.term || entry?.title || entry?.id)).filter(Boolean);
    const teaser = document.createElement("section");
    teaser.className = "hg-language-teaser";
    teaser.dataset.languageTeaser = "1";
    teaser.innerHTML = `
      <div><span>Språk på stedet</span><strong>${entries.length} ${entries.length === 1 ? "oppføring" : "oppføringer"}</strong></div>
      ${terms.length ? `<p>${terms.map(term => `<span>${esc(term)}</span>`).join("")}</p>` : ""}
      <button type="button" data-open-language-tab>Åpne språkleksikon</button>
    `;
    teaser.querySelector("[data-open-language-tab]")?.addEventListener("click", () => activateTab(tablist, panelWrap, TAB_ID, true));
    about.prepend(teaser);
  }

  function bindLanguagePanel(panel, place, article, sourceFile) {
    if (panel.dataset.hgLanguageBound === "1") return;
    panel.dataset.hgLanguageBound = "1";

    panel.addEventListener("click", event => {
      const target = event.target instanceof Element ? event.target : null;
      const filterButton = target?.closest("[data-language-filter]");
      if (filterButton) {
        const filter = text(filterButton.getAttribute("data-language-filter")) || "all";
        panel.querySelectorAll("[data-language-filter]").forEach(button => button.setAttribute("aria-pressed", button === filterButton ? "true" : "false"));
        panel.querySelectorAll("[data-language-entry]").forEach(card => {
          card.hidden = filter !== "all" && card.getAttribute("data-language-type") !== filter;
        });
        return;
      }

      const collectButton = target?.closest("[data-language-collect]");
      if (!collectButton || collectButton.hasAttribute("disabled")) return;
      const entryId = text(collectButton.getAttribute("data-language-collect"));
      const entry = list(article?.entries).find(row => text(row?.id || row?.term) === entryId);
      if (!entry) return;
      installKnowledgeBridge();
      const captured = captureLanguageKnowledge(entry, {
        placeId: text(place?.id || article?.place_id),
        placeName: text(place?.name),
        article,
        sourceFile
      });
      if (!captured) {
        global.showToast?.("Kunne ikke samle språkoppføringen.");
        return;
      }
      panel.querySelectorAll(`[data-language-collect="${CSS.escape(entryId)}"]`).forEach(button => {
        button.textContent = "Samlet";
        button.classList.add("is-collected");
        button.setAttribute("disabled", "");
      });
      global.showToast?.(`Samlet i kunnskapen din: ${text(entry.term || entry.id)}`);
    });
  }

  async function decorateLanguage(place) {
    const placeId = text(place?.id);
    if (!placeId) return;
    const loaded = await loadForPlace(placeId);
    const entries = list(loaded?.article?.entries).filter(entry => text(entry?.id || entry?.term));
    if (!loaded || !entries.length) return;

    const popup = document.querySelector(".hg-popup.place-popup-v2");
    const tabsArticle = popup?.querySelector('.hg-place-popup-v2[data-hg-place-tabs="1"]');
    const tablist = tabsArticle?.querySelector(".hg-place-tabs");
    const panelWrap = tabsArticle?.querySelector(".hg-place-tab-panels");
    if (!popup?.isConnected || !tabsArticle || !tablist || !panelWrap) return;

    installGenericTabBridge(tablist, panelWrap);

    let tab = tablist.querySelector(`[data-place-tab="${TAB_ID}"]`);
    let panel = panelWrap.querySelector(`[data-place-panel="${TAB_ID}"]`);
    if (!tab) {
      tab = document.createElement("button");
      tab.type = "button";
      tab.className = "hg-place-tab hg-place-language-tab";
      tab.id = `hg-place-tab-${TAB_ID}`;
      tab.dataset.placeTab = TAB_ID;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", `hg-place-panel-${TAB_ID}`);
      tab.setAttribute("aria-selected", "false");
      tab.tabIndex = -1;
      tab.innerHTML = `Språk <span>${entries.length}</span>`;
      const moreTab = tablist.querySelector('[data-place-tab="more"]');
      tablist.insertBefore(tab, moreTab || null);
    }

    if (!panel) {
      panel = document.createElement("section");
      panel.className = "hg-place-tab-panel hg-place-language-panel";
      panel.id = `hg-place-panel-${TAB_ID}`;
      panel.dataset.placePanel = TAB_ID;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tab.id);
      panel.hidden = true;
      const morePanel = panelWrap.querySelector('[data-place-panel="more"]');
      panelWrap.insertBefore(panel, morePanel || null);
    }

    panel.innerHTML = renderLanguagePanel(place, loaded.article);
    bindLanguagePanel(panel, place, loaded.article, loaded.sourceFile);
    addLanguageTeaser(tabsArticle, place, entries, tablist, panelWrap);
    tabsArticle.dataset.hgLanguageLayer = "1";

    const morePanel = panelWrap.querySelector('[data-place-panel="more"]');
    removeLegacyLanguageSection(morePanel);
    if (morePanel && morePanel.dataset.hgLanguageDeduper !== "1") {
      morePanel.dataset.hgLanguageDeduper = "1";
      const observer = new MutationObserver(() => removeLegacyLanguageSection(morePanel));
      observer.observe(morePanel, { childList: true, subtree: true });
      popup.addEventListener("DOMNodeRemoved", () => observer.disconnect(), { once: true });
      setTimeout(() => observer.disconnect(), 10000);
    }
  }

  function install() {
    ensureStyle();
    installKnowledgeBridge();
    if (global[INSTALL_FLAG]) return true;
    const current = global.showPlacePopup;
    if (typeof current !== "function" || current.__hgPlacePopupTabs !== true) return false;

    const wrapped = function showPlacePopupWithLanguageLayer(place) {
      const result = current.apply(this, arguments);
      void decorateLanguage(place);
      return result;
    };
    wrapped.__hgPlaceLanguageLayer = true;
    wrapped.__hgPlacePopupTabs = true;
    wrapped.__hgPlacePopupV2 = current.__hgPlacePopupV2 === true;
    wrapped.__previous = current;
    global.showPlacePopup = wrapped;
    global[INSTALL_FLAG] = true;
    return true;
  }

  global.HGLanguageLayer = {
    loadForPlace,
    canonicalType,
    captureLanguageKnowledge,
    getCollected: collectedLanguageEntries,
    isCollected,
    decoratePopup: decorateLanguage
  };

  if (!install()) {
    let attempts = 0;
    const timer = global.setInterval(() => {
      attempts += 1;
      installKnowledgeBridge();
      if (install() || attempts > 400) global.clearInterval(timer);
    }, 50);
  }
})(window);
