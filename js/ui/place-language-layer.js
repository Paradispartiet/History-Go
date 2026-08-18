// js/ui/place-language-layer.js
// Fremhever det eksisterende Språkleksikonet som et stedbundet kunnskaps- og samlelag.
// Datakilden forblir data/leksikon/sprak/**. Ingen ny PlaceCard-runding introduseres.
(function installPlaceLanguageLayer(global) {
  "use strict";

  const INSTALL_FLAG = "__HG_PLACE_LANGUAGE_LAYER_INSTALLED__";
  const TAB_ID = "language";
  const MANIFEST_PATH = "data/leksikon/sprak/manifest.json";
  const ATLAS_PATH = "data/leksikon/sprak/norge_atlas_v1.json";
  const KNOWLEDGE_KEY = "hg_knowledge_entries_v2";
  const KNOWLEDGE_SCHEMA = "history_go_knowledge_entry_v2";
  const KNOWLEDGE_VERSION = 2;
  const SOURCE_TYPE = "language_lexicon";
  const COLLECTION_KIND = "language";
  const articleCache = new Map();
  let manifestPromise = null;
  let atlasPromise = null;

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

  function normalizeSubjectId(value) {
    const raw = text(value);
    if (!raw) return "";
    try {
      if (typeof global.DomainRegistry?.toRuntimeCategoryId === "function") {
        return text(global.DomainRegistry.toRuntimeCategoryId(raw));
      }
      if (typeof global.DomainRegistry?.resolve === "function") {
        return text(global.DomainRegistry.resolve(raw));
      }
    } catch {}
    return raw === "popkultur" ? "populaerkultur" : raw;
  }

  function resolveSubjectId(entry, context = {}) {
    const candidates = [
      entry?.subject_id,
      entry?.fagkart_category_id,
      context.article?.subject_id,
      context.article?.fagkart_category_id,
      context.subjectId,
      context.categoryId,
      context.place?.categoryId,
      context.place?.category,
      context.place?.domain
    ];
    for (const candidate of candidates) {
      const resolved = normalizeSubjectId(candidate);
      if (resolved && resolved !== "sprak") return resolved;
    }
    return "";
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

  const BLOCKED_LANGUAGE_TYPES = new Set([
    "arrangement",
    "event",
    "competition",
    "sports_event",
    "record",
    "result",
    "stat",
    "statistikk",
    "stevne"
  ]);

  function isLanguageEntry(entry) {
    const raw = slug(entry?.type || entry?.kind || "");
    if (!raw || BLOCKED_LANGUAGE_TYPES.has(raw)) return false;
    if (TYPE_ALIASES[raw]) return true;
    const signals = [raw, ...list(entry?.tags).map(slug)].join(" ");
    return ["ord", "uttrykk", "begrep", "term", "navn", "sprak", "dialekt", "uttale"]
      .some(signal => signals.includes(signal));
  }

  function canonicalType(entry) {
    const raw = slug(entry?.type || entry?.kind || "term");
    return TYPE_ALIASES[raw] || "term";
  }

  function languageLayer(entry, article = null) {
    const explicit = slug(entry?.layer);
    if (explicit === "dialect") return "dialect";
    if (canonicalType(entry) === "dialect_feature") return "dialect";
    if (text(entry?.dialect_area || article?.dialect_area)) return "dialect";
    return "language";
  }

  function isDialectEntry(entry, article = null) {
    return languageLayer(entry, article) === "dialect";
  }

  function isAllowedLanguageEntry(entry, article, place) {
    if (!isLanguageEntry(entry)) return false;
    return !isDialectEntry(entry, article) || slug(place?.placeScope) === "area";
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


  async function loadAtlas() {
    if (atlasPromise) return atlasPromise;
    atlasPromise = fetch(ATLAS_PATH, { cache: "default" })
      .then(response => response.ok ? response.json() : null)
      .catch(() => null);
    return atlasPromise;
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
    return text(entry?.knowledge_unit_id) || `ku_sprak_${slug(entry?.id || entry?.term || "entry") || "entry"}`;
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
    const subjectId = resolveSubjectId(entry, context);
    if (!subjectId) return null;
    const layer = languageLayer(entry, context.article);
    if (layer === "dialect" && slug(context.place?.placeScope) !== "area") return null;

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
    const explicitConceptIds = unique(entry?.concept_ids);
    const explicitConcepts = unique(entry?.concepts);
    const explicitTermIds = unique([entry?.term_id, ...(list(entry?.term_ids))]);
    const termIds = explicitTermIds.length
      ? explicitTermIds
      : [`term_${slug(subjectId) || "subject"}_sprak_${slug(entry?.id || term) || "entry"}`];
    const tags = unique([...(list(entry?.tags)), "språkleksikon", canonical, layer, dialectArea]);

    return {
      schema: KNOWLEDGE_SCHEMA,
      version: KNOWLEDGE_VERSION,
      id,
      knowledge_unit_id: id,
      subject_id: subjectId,
      fagkart_category_id: subjectId,
      emne_ids: emneIds,
      concept_ids: explicitConceptIds,
      term_ids: termIds,
      story_ids: unique(entry?.story_ids),
      concepts: explicitConcepts,
      terms: [term],
      tags,
      kind: COLLECTION_KIND,
      collection_kind: COLLECTION_KIND,
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
        canonical_capture: Boolean(entry?.knowledge_unit_id),
        source_bound: true,
        language_entry_id: text(entry?.id) || null,
        language_layer: layer
      },
      link_status: emneIds.length ? "linked" : "language_source_bound_unresolved"
    };
  }

  function captureLanguageKnowledge(entry, context = {}) {
    if (!entry || !text(entry.id || entry.term) || !isLanguageEntry(entry)) return null;
    const incoming = knowledgeEntryForLanguage(entry, context);
    if (!incoming) return null;
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
        detail: { source: SOURCE_TYPE, collection_kind: COLLECTION_KIND, entry: incoming }
      }));
      global.dispatchEvent?.(new CustomEvent("updateProfile"));
    } catch {}
    return incoming;
  }

  function collectedLanguageEntries() {
    return readKnowledgeEntries().filter(row => text(row?.source?.type) === SOURCE_TYPE || text(row?.collection_kind) === COLLECTION_KIND);
  }

  function installKnowledgeBridge() {
    const api = global.HGKnowledgeV2;
    if (!api || api.__hgLanguageBridge) return Boolean(api);
    api.captureLanguageKnowledge = captureLanguageKnowledge;
    api.getCollectedLanguageEntries = collectedLanguageEntries;
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

  function entryCard(entry, article = null) {
    const canonical = canonicalType(entry);
    const layer = languageLayer(entry, article);
    const dialect = layer === "dialect";
    const dialectArea = text(entry?.dialect_area || article?.dialect_area);
    const term = text(entry?.term || entry?.title || entry?.id || "Språkoppføring");
    const meaning = text(entry?.meaning || entry?.description || entry?.desc);
    const status = STATUS_LABELS[slug(entry?.status)] || text(entry?.status);
    const relatedPlaces = relatedValues(entry?.related_places);
    const relatedEntries = relatedValues(entry?.related_entries);
    const collected = isCollected(entry);

    return `
      <article class="hg-language-entry${dialect ? " is-dialect" : ""}" data-language-entry data-language-type="${esc(canonical)}" data-language-layer="${esc(layer)}" data-language-entry-id="${esc(entry?.id || term)}">
        <header>
          <div>
            <div class="hg-language-entry-labels">
              <span class="hg-language-entry-type">${esc(typeLabel(entry))}</span>
              ${dialect ? `<span class="hg-language-layer-badge">Dialekt${dialectArea ? ` · ${esc(dialectArea)}` : ""}</span>` : ""}
            </div>
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


  function atlasIds(article, field) {
    return unique(article?.[field]);
  }

  function renderAtlasMacroCard(macro, atlas, activeIds) {
    const macroId = text(macro?.id);
    const regions = list(atlas?.dialect_regions).filter(region => text(region?.macro_region_id) === macroId);
    const activeMacro = activeIds.has(macroId) || regions.some(region => activeIds.has(text(region?.id)));
    return `
      <article class="hg-language-atlas-macro${activeMacro ? " is-active" : ""}" data-atlas-macro="${esc(macroId)}" id="hg-language-atlas-macro-${esc(slug(macroId))}">
        <header><strong>${esc(macro?.name)}</strong><span>${regions.length} soner</span></header>
        <p>${esc(macro?.summary)}</p>
        ${list(macro?.feature_labels).length ? `<div class="hg-language-atlas-features">${list(macro.feature_labels).map(label => `<span>${esc(label)}</span>`).join("")}</div>` : ""}
        <div class="hg-language-atlas-regions">${regions.map(region => `<button type="button" class="${activeIds.has(text(region?.id)) ? "is-active" : ""}" data-atlas-region="${esc(region?.id)}" data-atlas-macro-id="${esc(macroId)}" aria-pressed="false">${esc(region?.name)}</button>`).join("")}</div>
        ${sourceLinks({ sources: macro?.sources })}
      </article>
    `;
  }

  function renderLanguageAtlas(article, atlas) {
    const macros = list(atlas?.macro_regions);
    if (!macros.length) return "";
    const activeIds = new Set([
      ...atlasIds(article, "atlas_region_ids"),
      ...atlasIds(article, "atlas_overlay_ids")
    ]);
    const regions = list(atlas?.dialect_regions);
    const overlays = list(atlas?.urban_overlays);
    const languageLayers = list(atlas?.language_status_layers);
    const activeNames = [
      ...macros.filter(row => activeIds.has(text(row?.id))),
      ...regions.filter(row => activeIds.has(text(row?.id))),
      ...overlays.filter(row => activeIds.has(text(row?.id)))
    ].map(row => text(row?.name)).filter(Boolean);
    const isMacroActive = id => activeIds.has(id) || regions.some(region => text(region?.macro_region_id) === id && activeIds.has(text(region?.id)));
    const mapBlock = (id, label, className) => `<button type="button" class="hg-language-atlas-map-region ${className}${isMacroActive(id) ? " is-active" : ""}" data-atlas-map-region="${esc(id)}" data-atlas-focus="${esc(id)}" aria-pressed="false" aria-label="Utforsk ${esc(label)}"><strong>${esc(label)}</strong></button>`;
    return `
      <section class="hg-language-atlas" data-language-atlas>
        <header class="hg-language-atlas-head">
          <div class="hg-language-kicker">Språkatlas Norge</div>
          <strong>Fra lokale språkspor til hele dialektlandskapet</strong>
          <p>Skjematisk oversikt. Dialektgrenser er glidende, og et områdeanker beskriver aldri alle som bor der.</p>
        </header>
        <div class="hg-language-atlas-map" role="group" aria-label="Utforsk de fire norske hovedgruppene">
          ${mapBlock("nordnorsk", "Nordnorsk", "is-north")}
          ${mapBlock("trondersk", "Trøndersk", "is-trondelag")}
          ${mapBlock("vestlandsk", "Vestlandsk", "is-west")}
          ${mapBlock("austlandsk", "Østlandsk", "is-east")}
        </div>
        ${activeNames.length ? `<p class="hg-language-atlas-current"><strong>Koblet til dette stedet:</strong> ${esc(unique(activeNames).join(" · "))}</p>` : ""}
        <div class="hg-language-atlas-selection" data-atlas-selection hidden aria-live="polite">
          <span>Utforsker</span>
          <strong data-atlas-selection-title></strong>
          <p data-atlas-selection-summary></p>
          <div data-atlas-selection-features></div>
        </div>
        <details class="hg-language-atlas-details">
          <summary>Utforsk hele Norge</summary>
          <div class="hg-language-atlas-grid">${macros.map(macro => renderAtlasMacroCard(macro, atlas, activeIds)).join("")}</div>
          ${overlays.length ? `<section class="hg-language-atlas-overlays"><h3>Bymål og sosiale språkoverlegg</h3><div>${overlays.map(row => `<article class="${activeIds.has(text(row?.id)) ? "is-active" : ""}"><strong>${esc(row?.name)}</strong><p>${esc(row?.summary)}</p>${sourceLinks({ sources: row?.sources })}</article>`).join("")}</div></section>` : ""}
          ${languageLayers.length ? `<section class="hg-language-atlas-languages"><h3>Egne språk – ikke norske dialekter</h3><p>Urfolksspråk og nasjonale minoritetsspråk vises separat slik at atlaset ikke gjør dem til undergrupper av norsk.</p><div>${languageLayers.map(row => `<span><strong>${esc(row?.name)}</strong>${row?.status ? ` · ${esc(row.status)}` : ""}</span>`).join("")}</div></section>` : ""}
        </details>
      </section>
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

  function renderLanguagePanel(place, article, atlas = null) {
    const entries = list(article?.entries).filter(entry => isAllowedLanguageEntry(entry, article, place));
    const dialectEntries = entries.filter(entry => isDialectEntry(entry, article));
    const counts = countByType(entries);
    const dialectArea = text(article?.dialect_area || dialectEntries.map(entry => entry?.dialect_area).find(Boolean));
    const typeFilters = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => `<button type="button" data-language-filter="${esc(type)}" aria-pressed="false">${esc(TYPE_LABELS[type] || "Begrep")} <span>${count}</span></button>`)
      .join("");
    const dialectFilter = dialectEntries.length
      ? `<button type="button" data-language-filter="dialect" aria-pressed="false">Dialekt <span>${dialectEntries.length}</span></button>`
      : "";
    const filters = `${dialectFilter}${typeFilters}`;

    return `
      <div class="hg-language-layer" data-language-place="${esc(place?.id || article?.place_id)}">
        <header class="hg-language-hero">
          <div class="hg-language-kicker">Språk på stedet</div>
          <h2>${esc(place?.name || article?.title || "Språkleksikon")}</h2>
          <p>${entries.length} ${entries.length === 1 ? "språkoppføring" : "språkoppføringer"}${dialectArea ? ` · ${esc(dialectArea)}` : ""}. Ord, uttrykk, navn og dialekttrekk samles som dokumentert stedskunnskap.</p>
          <div class="hg-language-summary">
            ${dialectEntries.length ? `<span class="is-dialect"><strong>${dialectEntries.length}</strong> dialektspor</span>` : ""}
            ${[...counts.entries()].map(([type, count]) => `<span><strong>${count}</strong> ${esc((TYPE_LABELS[type] || "begrep").toLowerCase())}</span>`).join("")}
          </div>
        </header>
        ${dialectEntries.length ? `
          <section class="hg-language-dialect-intro" aria-label="Dialektlag">
            <div class="hg-language-kicker">Dialektlag</div>
            <strong>${esc(dialectArea || place?.name || "Lokalt talemål")}</strong>
            <p>Disse språksporene er kildebelagt som del av talemålet i området. Et ord kan også finnes i andre dialektområder; lokal attestasjon betyr ikke at formen er unik her.</p>
          </section>
        ` : ""}
        ${renderLanguageAtlas(article, atlas)}
        ${filters ? `<nav class="hg-language-filters" aria-label="Filtrer Språkleksikon"><button type="button" data-language-filter="all" aria-pressed="true">Alle <span>${entries.length}</span></button>${filters}</nav>` : ""}
        <div class="hg-language-list">${entries.map(entry => entryCard(entry, article)).join("")}</div>
      </div>
    `;
  }

  function activateTab(tablist, panelWrap, id, focus = false) {
    const selected = /** @type {HTMLElement | null} */ (tablist.querySelector(`[data-place-tab="${CSS.escape(id)}"]`));
    if (!selected) return;
    tablist.querySelectorAll("[role=tab]").forEach(button => {
      const active = button === selected;
      button.setAttribute("aria-selected", active ? "true" : "false");
      if (button instanceof HTMLElement) button.tabIndex = active ? 0 : -1;
    });
    panelWrap.querySelectorAll(":scope > [data-place-panel]").forEach(panel => {
      if (panel instanceof HTMLElement) panel.hidden = panel.dataset.placePanel !== id;
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
      const nextButton = buttons[next];
      if (!(nextButton instanceof HTMLElement)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      activateTab(tablist, panelWrap, nextButton.dataset.placeTab, true);
    }, true);
  }

  function removeLegacyLanguageSection(morePanel) {
    if (!morePanel) return;
    morePanel.querySelectorAll("h3").forEach(heading => {
      if (text(heading.textContent).toLowerCase() === "språkleksikon") heading.closest("section")?.remove();
    });
  }

  function addLanguageTeaser(tabsArticle, entries, tablist, panelWrap, article) {
    const about = tabsArticle.querySelector('[data-place-panel="about"]');
    if (!about || about.querySelector("[data-language-teaser]")) return;
    const terms = entries.slice(0, 3).map(entry => text(entry?.term || entry?.title || entry?.id)).filter(Boolean);
    const dialectCount = entries.filter(entry => isDialectEntry(entry, article)).length;
    const teaser = document.createElement("section");
    teaser.className = "hg-language-teaser";
    teaser.dataset.languageTeaser = "1";
    teaser.innerHTML = `
      <div><span>Språk på stedet${dialectCount ? " · Dialektlag" : ""}</span><strong>${entries.length} ${entries.length === 1 ? "oppføring" : "oppføringer"}</strong></div>
      ${terms.length ? `<p>${terms.map(term => `<span>${esc(term)}</span>`).join("")}</p>` : ""}
      <button type="button" data-open-language-tab>Åpne språkleksikon</button>
    `;
    teaser.querySelector("[data-open-language-tab]")?.addEventListener("click", () => activateTab(tablist, panelWrap, TAB_ID, true));
    about.prepend(teaser);
  }

  function activateAtlasSelection(panel, atlas, itemId, macroHint = "") {
    const id = text(itemId);
    if (!id || !atlas) return;

    const regions = list(atlas?.dialect_regions);
    const macros = list(atlas?.macro_regions);
    const region = regions.find(row => text(row?.id) === id) || null;
    const macroId = text(macroHint || region?.macro_region_id || id);
    const macro = macros.find(row => text(row?.id) === macroId) || null;
    const item = region || macro;
    if (!item || !macro) return;

    const details = panel.querySelector(".hg-language-atlas-details");
    if (details) details.open = true;

    panel.querySelectorAll("[data-atlas-focus],[data-atlas-region]").forEach(button => {
      const buttonId = text(button.getAttribute("data-atlas-region") || button.getAttribute("data-atlas-focus"));
      const macroButtonSelected = Boolean(region) && button.hasAttribute("data-atlas-focus") && buttonId === macroId;
      button.setAttribute("aria-pressed", buttonId === id || macroButtonSelected ? "true" : "false");
    });

    panel.querySelectorAll(".hg-language-atlas-macro.is-user-focused, [data-atlas-region].is-user-focused").forEach(node => node.classList.remove("is-user-focused"));
    const macroCard = panel.querySelector(`[data-atlas-macro="${CSS.escape(macroId)}"]`);
    macroCard?.classList.add("is-user-focused");
    if (region) panel.querySelector(`[data-atlas-region="${CSS.escape(id)}"]`)?.classList.add("is-user-focused");

    const selection = panel.querySelector("[data-atlas-selection]");
    if (selection instanceof HTMLElement) {
      const title = selection.querySelector("[data-atlas-selection-title]");
      const summary = selection.querySelector("[data-atlas-selection-summary]");
      const features = selection.querySelector("[data-atlas-selection-features]");
      if (title) title.textContent = text(item?.name || macro?.name);
      if (summary) summary.textContent = text(region?.area_summary || item?.summary || macro?.summary);
      if (features) features.innerHTML = list(item?.feature_labels).map(label => `<span>${esc(label)}</span>`).join("");
      selection.hidden = false;
    }

    macroCard?.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
  }

  function bindLanguagePanel(panel, place, article, sourceFile, atlas = null) {
    if (panel.dataset.hgLanguageBound === "1") return;
    panel.dataset.hgLanguageBound = "1";

    panel.addEventListener("click", event => {
      const target = event.target instanceof Element ? event.target : null;
      const atlasFocus = target?.closest("[data-atlas-focus]");
      if (atlasFocus && atlas) {
        activateAtlasSelection(panel, atlas, atlasFocus.getAttribute("data-atlas-focus"));
        return;
      }

      const atlasRegion = target?.closest("[data-atlas-region]");
      if (atlasRegion && atlas) {
        activateAtlasSelection(
          panel,
          atlas,
          atlasRegion.getAttribute("data-atlas-region"),
          atlasRegion.getAttribute("data-atlas-macro-id")
        );
        return;
      }

      const filterButton = target?.closest("[data-language-filter]");
      if (filterButton) {
        const filter = text(filterButton.getAttribute("data-language-filter")) || "all";
        panel.querySelectorAll("[data-language-filter]").forEach(button => button.setAttribute("aria-pressed", button === filterButton ? "true" : "false"));
        panel.querySelectorAll("[data-language-entry]").forEach(card => {
          if (!(card instanceof HTMLElement)) return;
          const matches = filter === "all"
            || (filter === "dialect" ? card.getAttribute("data-language-layer") === "dialect" : card.getAttribute("data-language-type") === filter);
          card.hidden = !matches;
        });
        return;
      }

      const collectButton = target?.closest("[data-language-collect]");
      if (!collectButton || collectButton.hasAttribute("disabled")) return;
      const entryId = text(collectButton.getAttribute("data-language-collect"));
      const entry = list(article?.entries).find(row => text(row?.id || row?.term) === entryId && isAllowedLanguageEntry(row, article, place));
      if (!entry) return;
      installKnowledgeBridge();
      const captured = captureLanguageKnowledge(entry, {
        place,
        placeId: text(place?.id || article?.place_id),
        placeName: text(place?.name),
        categoryId: text(place?.categoryId || place?.category || place?.domain),
        article,
        sourceFile
      });
      if (!captured) {
        global.showToast?.("Språkoppføringen mangler en sikker fagkobling og ble ikke samlet.");
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
    if (!loaded) return;
    const entries = list(loaded.article?.entries).filter(entry => isAllowedLanguageEntry(entry, loaded.article, place));
    if (!entries.length) return;
    const atlas = await loadAtlas();

    const popup = document.querySelector(".hg-popup.place-popup-v2");
    const tabsArticle = popup?.querySelector('.hg-place-popup-v2[data-hg-place-tabs="1"]');
    const tablist = /** @type {HTMLElement | null} */ (tabsArticle?.querySelector(".hg-place-tabs") || null);
    const panelWrap = /** @type {HTMLElement | null} */ (tabsArticle?.querySelector(".hg-place-tab-panels") || null);
    if (!popup?.isConnected || !tabsArticle || !tablist || !panelWrap) return;

    installGenericTabBridge(tablist, panelWrap);

    let tab = /** @type {HTMLButtonElement | null} */ (tablist.querySelector(`[data-place-tab="${TAB_ID}"]`));
    let panel = /** @type {HTMLElement | null} */ (panelWrap.querySelector(`[data-place-panel="${TAB_ID}"]`));
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

    panel.innerHTML = renderLanguagePanel(place, loaded.article, atlas);
    bindLanguagePanel(panel, place, loaded.article, loaded.sourceFile, atlas);
    addLanguageTeaser(tabsArticle, entries, tablist, panelWrap, loaded.article);
    tabsArticle.dataset.hgLanguageLayer = "1";

    const morePanel = panelWrap.querySelector('[data-place-panel="more"]');
    removeLegacyLanguageSection(morePanel);
    if (morePanel && morePanel.dataset.hgLanguageDeduper !== "1") {
      morePanel.dataset.hgLanguageDeduper = "1";
      const observer = new MutationObserver(() => removeLegacyLanguageSection(morePanel));
      observer.observe(morePanel, { childList: true, subtree: true });
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
    loadAtlas,
    canonicalType,
    isLanguageEntry,
    isDialectEntry,
    isAllowedLanguageEntry,
    resolveSubjectId,
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
