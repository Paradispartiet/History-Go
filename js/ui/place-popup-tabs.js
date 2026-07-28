// js/ui/place-popup-tabs.js
// Samler stedets kunnskapsflater i én fanebasert stedspopup uten å flytte source-data.
(function installPlacePopupTabs(global) {
  "use strict";

  const INSTALL_FLAG = "__HG_PLACE_POPUP_TABS_INSTALLED__";
  const DECORATED_ATTR = "data-hg-place-tabs";
  const TAB_DEFS = Object.freeze([
    ["about", "Om"],
    ["history", "Historie"],
    ["stories", "Fortellinger"],
    ["before-after", "Før/etter"],
    ["news", "Nyheter"],
    ["reading", "Lesespor"],
    ["sources", "Kilder"],
    ["more", "Mer"]
  ]);

  function text(value) {
    return String(value == null ? "" : value).trim();
  }

  function list(value) {
    return Array.isArray(value) ? value : [];
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function uniqueBy(values, keyFn) {
    const seen = new Set();
    const out = [];
    for (const value of values) {
      const key = keyFn(value);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(value);
    }
    return out;
  }

  function normalizedStrings(values) {
    return list(values).map(text).filter(Boolean);
  }

  function humanize(value) {
    const result = text(value).replaceAll("_", " ").replace(/\s+/g, " ");
    return result ? result.charAt(0).toUpperCase() + result.slice(1) : "";
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

  function articleTitle(article) {
    return text(article?.title || article?.name || article?.label || article?.id || "Oppføring");
  }

  function articleSignals(article) {
    return [
      article?.type,
      article?.kind,
      article?.category,
      article?.id,
      article?.title,
      article?.name,
      article?.label,
      article?.popupDesc,
      article?.summary?.one_liner,
      ...normalizedStrings(article?.tags),
      ...normalizedStrings(article?.summary?.themes),
      ...normalizedStrings(article?.classification?.tags)
    ].map(value => text(value).toLowerCase()).filter(Boolean).join(" ");
  }

  function classifyArticle(article) {
    const signals = articleSignals(article);
    const kind = text(article?.kind || article?.type || article?.category).toLowerCase();
    const has = (terms) => terms.some(term => signals.includes(term) || kind.includes(term));

    if (has(["historical_news", "gamle_nyheter", "gamle nyheter", "avisnotis", "newspaper", "moralpanikk", "old_news"])) return "historical_news";
    if (has(["news_note", "nyere_notis", "nyere notis", "nearby_crime_history", "incident", "brann", "politi", "drap"])) return "news_notes";
    if (has(["arrangement", "event", "competition", "sports_event", "stevne", "rekord", "record", "resultat", "result", "statistikk", "stats", "idrettshistorie"])) return "events";
    if (has(["object", "objekt", "artifact", "anlegg", "facility", "installation", "infrastructure", "spor", "dekke"])) return "objects";
    if (has(["fagord", "uttrykk", "språk", "sprak", "begrep", "term", "historisk_navn", "slang"])) return "language";
    return "history";
  }

  function resolveMainArticle(articles, place) {
    const rows = list(articles).filter(Boolean);
    if (!rows.length) return null;
    const placeName = text(place?.name).toLowerCase();
    const byName = rows.find(article => articleTitle(article).toLowerCase() === placeName);
    if (byName) return byName;
    const mainSignals = ["main", "primary", "hoved", "hovedartikkel"];
    return rows.find(article => {
      const signals = [article?.type, article?.kind, article?.category, article?.id]
        .map(value => text(value).toLowerCase()).join(" ");
      return mainSignals.some(term => signals.includes(term));
    }) || rows[0];
  }

  async function ensureLeksikon(placeId) {
    try {
      await global.HGLeksikon?.init?.();
    } catch (error) {
      if (global.DEBUG) console.warn("[place-popup-tabs] Leksikon kunne ikke lastes", error);
    }
    return list(global.LEKSIKON_BY_PLACE?.[placeId]);
  }

  async function ensureStories(placeId) {
    try {
      await global.HGStories?.init?.();
    } catch {}
    try {
      return list(global.HGStories?.getByPlace?.(placeId));
    } catch {
      return [];
    }
  }

  async function ensureLesespor() {
    if (Array.isArray(global.LESESPOR)) return global.LESESPOR;
    try {
      const result = await global.DataHub?.loadLesespor?.({ cache: "default" });
      if (Array.isArray(result?.items)) return result.items;
      if (Array.isArray(result)) return result;
    } catch (error) {
      if (global.DEBUG) console.warn("[place-popup-tabs] Lesespor kunne ikke lastes", error);
    }
    return list(global.LESESPOR);
  }

  function isOpenLesespor(item) {
    const access = text(item?.access).toLowerCase();
    const combined = [access, item?.access_note, item?.note].map(value => text(value).toLowerCase()).join(" ");
    return !["paywall", "subscription", "subscriber", "abonnement", "betalingsmur", "krever abonnement"].some(term => combined.includes(term));
  }

  async function loadLanguageArticle(placeId) {
    try {
      const manifestResponse = await fetch("data/leksikon/sprak/manifest.json", { cache: "default" });
      if (!manifestResponse.ok) return null;
      const manifest = await manifestResponse.json();
      const path = text(manifest?.place_files?.[placeId]);
      if (!path) return null;
      const response = await fetch(path, { cache: "default" });
      if (!response.ok) return null;
      const article = await response.json();
      return text(article?.place_id) === placeId ? article : null;
    } catch {
      return null;
    }
  }

  function paragraphHtml(value) {
    const values = Array.isArray(value) ? value : [value];
    return values.map(text).filter(Boolean).map(row => `<p>${esc(row)}</p>`).join("");
  }

  function sectionHtml(title, body, extraClass = "") {
    const content = text(body);
    if (!content) return "";
    return `<section class="hg-section hg-place-section hg-place-tab-section ${esc(extraClass)}"><h3>${esc(title)}</h3>${body}</section>`;
  }

  function listCards(items, options = {}) {
    const rows = list(items).filter(Boolean);
    if (!rows.length) return "";
    return `<div class="hg-place-tab-card-list">${rows.map(item => {
      const title = articleTitle(item);
      const meta = [item?.period || item?.year || item?.date, item?.type || item?.kind || item?.category]
        .map(text).filter(Boolean).join(" · ");
      const summary = text(item?.summary?.one_liner || item?.popupDesc || item?.desc || item?.description);
      return `<article class="hg-place-tab-card${options.compact ? " is-compact" : ""}"><strong>${esc(title)}</strong>${meta ? `<span>${esc(meta)}</span>` : ""}${summary ? `<p>${esc(summary)}</p>` : ""}</article>`;
    }).join("")}</div>`;
  }

  function chronologyHtml(rows) {
    const normalized = uniqueBy(list(rows).filter(Boolean), row => [row?.date, row?.year, row?.period, row?.desc].map(text).join("|")).sort((a, b) => {
      const ay = Number(a?.year || String(a?.date || "").slice(0, 4)) || 0;
      const by = Number(b?.year || String(b?.date || "").slice(0, 4)) || 0;
      return ay - by;
    });
    if (!normalized.length) return "";
    return `<div class="hg-place-tab-timeline">${normalized.map(row => {
      const when = text(row?.date || row?.year || row?.period || "Tidslag");
      const label = text(row?.period && row?.period !== when ? row.period : row?.title || row?.label);
      const desc = text(row?.desc || row?.summary || row?.description);
      return `<article class="hg-place-tab-timeline-item"><span>${esc(when)}</span><div>${label ? `<strong>${esc(label)}</strong>` : ""}${desc ? `<p>${esc(desc)}</p>` : ""}</div></article>`;
    }).join("")}</div>`;
  }

  function renderLeksikonAbout(mainArticle, currentPopupText) {
    if (!mainArticle) return "";
    const facts = list(mainArticle?.facts);
    const wikiValues = Array.isArray(mainArticle?.wikiText) ? mainArticle.wikiText : [mainArticle?.wikiText];
    const popupText = text(currentPopupText).replace(/\s+/g, " ");
    const wiki = wikiValues.map(text).filter(value => value && value.replace(/\s+/g, " ") !== popupText);
    const built = mainArticle?.built_environment && typeof mainArticle.built_environment === "object" ? mainArticle.built_environment : {};
    const builtRows = [
      built.original_function ? `<p><strong>Opprinnelig funksjon:</strong> ${esc(built.original_function)}</p>` : "",
      built.current_function ? `<p><strong>Funksjon i dag:</strong> ${esc(built.current_function)}</p>` : "",
      ...list(built.changes).map(change => `<p><strong>${esc(change?.label || change?.year || "Endring")}:</strong> ${esc(change?.desc || "")}</p>`)
    ].filter(Boolean).join("");
    const factsHtml = facts.length ? `<div class="hg-place-tab-facts">${facts.map(fact => `<div><strong>${esc(fact?.label || fact?.id || "Fakta")}</strong><p>${esc(fact?.desc || "")}</p></div>`).join("")}</div>` : "";
    return [
      wiki.length ? sectionHtml("Leksikonartikkel", paragraphHtml(wiki)) : "",
      factsHtml ? sectionHtml("Fakta", factsHtml) : "",
      builtRows ? sectionHtml("Bygd miljø og funksjon", builtRows) : ""
    ].join("");
  }

  function renderBeforeAfter(place) {
    const data = place?.for_na && typeof place.for_na === "object" ? place.for_na : null;
    if (!data) return `<div class="hg-place-tab-empty">Ingen før/etter-innhold for dette stedet ennå.</div>`;
    const before = text(data.before);
    const now = text(data.now);
    const change = text(data.change);
    const lookFor = normalizedStrings(data.lookFor || data.look_for || data.observe || data.observer);
    const images = [
      ["Før", data.beforeImage || data.before_image || data.imageBefore],
      ["Nå", data.nowImage || data.now_image || data.imageNow]
    ].filter(([, url]) => safeHttpsUrl(url) || text(url).startsWith("bilder/") || text(url).startsWith("assets/"));
    const imageHtml = images.length ? `<div class="hg-place-before-after-media">${images.map(([label, url]) => `<figure><img src="${esc(url)}" alt="${esc(label)}: ${esc(place?.name || "stedet")}" loading="lazy"><figcaption>${esc(label)}</figcaption></figure>`).join("")}</div>` : "";
    const textHtml = [
      before ? sectionHtml("Før", `<p>${esc(before)}</p>`) : "",
      now ? sectionHtml("Nå", `<p>${esc(now)}</p>`) : "",
      change ? sectionHtml("Endring", `<p>${esc(change)}</p>`) : "",
      lookFor.length ? sectionHtml("Se etter i dag", `<ul>${lookFor.map(item => `<li>${esc(item)}</li>`).join("")}</ul>`) : ""
    ].join("");
    return imageHtml + textHtml || `<div class="hg-place-tab-empty">Ingen før/etter-innhold for dette stedet ennå.</div>`;
  }

  function renderStories(stories, legacyStories) {
    const canonicalTitles = new Set(list(stories).map(story => text(story?.title || story?.name).toLowerCase()).filter(Boolean));
    const legacy = list(legacyStories).filter(story => !canonicalTitles.has(text(story?.title || story?.name).toLowerCase()));
    const canonicalHtml = list(stories).length ? `<div class="hg-place-story-list">${list(stories).map(story => {
      const meta = [story?.type, story?.year].map(text).filter(Boolean).join(" · ");
      const summary = text(story?.summary || story?.story);
      return `<article class="hg-place-story-card"><strong>${esc(story?.title || story?.name || story?.id || "Fortelling")}</strong>${meta ? `<span>${esc(meta)}</span>` : ""}${summary ? `<p>${esc(summary)}</p>` : ""}</article>`;
    }).join("")}</div>` : "";
    const legacyHtml = legacy.length ? sectionHtml("Eldre leksikonspor", listCards(legacy, { compact: true })) : "";
    return canonicalHtml + legacyHtml || `<div class="hg-place-tab-empty">Ingen fortellinger for dette stedet ennå.</div>`;
  }

  function renderNews(oldNews, newNews) {
    const oldHtml = list(oldNews).length ? sectionHtml("Gamle nyheter", listCards(oldNews)) : "";
    const newHtml = list(newNews).length ? sectionHtml("Nyere notiser", listCards(newNews)) : "";
    return oldHtml + newHtml || `<div class="hg-place-tab-empty">Ingen nyheter eller notiser knyttet til stedet ennå.</div>`;
  }

  function renderLesespor(items, placeId) {
    const rows = uniqueBy(list(items).filter(item => list(item?.place_ids).map(text).includes(placeId) && isOpenLesespor(item)), item => text(item?.id) || [item?.title, item?.author, item?.publication, item?.year || item?.date].map(text).join("|")).sort((a, b) => {
      const ay = Number(a?.year || String(a?.date || "").slice(0, 4)) || 0;
      const by = Number(b?.year || String(b?.date || "").slice(0, 4)) || 0;
      return by - ay;
    });
    if (!rows.length) return `<div class="hg-place-tab-empty">Ingen åpne Lesespor for dette stedet ennå.</div>`;
    return `<div class="hg-place-reading-list">${rows.map(item => {
      const url = safeHttpsUrl(item?.url);
      const meta = [item?.author, item?.publication, item?.year || item?.date, item?.type].map(text).filter(Boolean).join(" · ");
      const relevance = text(item?.relevance);
      return `<article class="hg-place-reading-card"><strong>${esc(item?.title || "Uten tittel")}</strong>${meta ? `<span>${esc(meta)}</span>` : ""}${relevance ? `<p>${esc(relevance)}</p>` : ""}${url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Les teksten ↗</a>` : ""}</article>`;
    }).join("")}</div>`;
  }

  function collectSourceLinks(place, articles) {
    const raw = [place, ...list(articles)].flatMap(container => list(container?.externalLinks));
    return uniqueBy(raw.map(link => ({
      type: text(link?.type || "source"),
      label: text(link?.label || link?.title),
      url: safeHttpsUrl(link?.url)
    })).filter(link => link.url), link => link.url);
  }

  function renderSources(place, articles) {
    const links = collectSourceLinks(place, articles);
    const sourceProfile = place?.source_summary && typeof place.source_summary === "object" ? place.source_summary : (place?.sourceSummary || {});
    const safeSources = normalizedStrings(sourceProfile?.safe_sources || sourceProfile?.sources);
    const beforeAfterSources = normalizedStrings(place?.for_na?.sources || place?.for_na?.kilder || place?.for_na?.source);
    const labels = uniqueBy([...safeSources, ...beforeAfterSources], value => value);
    const summaryHtml = labels.length ? sectionHtml("Kilder i stedprofilen", `<ul>${labels.map(source => `<li>${esc(source)}</li>`).join("")}</ul>`) : "";
    const linksHtml = links.length ? sectionHtml("Kilder og eksterne oppslag", `<div class="hg-place-source-link-list">${links.map(link => `<a href="${esc(link.url)}" target="_blank" rel="noopener noreferrer"><strong>${esc(link.label || link.url)}</strong><span>${esc(humanize(link.type))} ↗</span></a>`).join("")}</div>`) : "";
    return summaryHtml + linksHtml || `<div class="hg-place-tab-empty">Ingen brukerrettede kilder er registrert for dette stedet ennå.</div>`;
  }

  function renderLanguage(article) {
    const entries = list(article?.entries);
    if (!entries.length) return "";
    return sectionHtml("Språkleksikon", `<div class="hg-place-tab-card-list">${entries.map(entry => `<article class="hg-place-tab-card is-compact"><strong>${esc(entry?.term || entry?.title || entry?.id || "Begrep")}</strong>${entry?.type ? `<span>${esc(entry.type)}</span>` : ""}${entry?.meaning ? `<p>${esc(entry.meaning)}</p>` : ""}${entry?.context ? `<p><em>${esc(entry.context)}</em></p>` : ""}</article>`).join("")}</div>`);
  }

  function renderMainArticleExtras(mainArticle, objectArticles, languageArticle) {
    const artifacts = [...list(mainArticle?.artifacts), ...list(mainArticle?.objects), ...list(objectArticles)];
    const interpretation = mainArticle?.interpretation && typeof mainArticle.interpretation === "object" ? mainArticle.interpretation : {};
    const notice = normalizedStrings(interpretation.what_to_notice);
    const why = normalizedStrings(interpretation.why_it_matters);
    const counter = normalizedStrings(interpretation.counterpoints);
    const classification = [
      ...normalizedStrings(mainArticle?.classification?.tags),
      ...normalizedStrings(mainArticle?.classification?.knagger)
    ];
    return [
      artifacts.length ? sectionHtml("Spor og objekter", listCards(artifacts, { compact: true })) : "",
      notice.length ? sectionHtml("Legg merke til", `<ul>${notice.map(item => `<li>${esc(item)}</li>`).join("")}</ul>`) : "",
      why.length ? sectionHtml("Hvorfor det betyr noe", `<ul>${why.map(item => `<li>${esc(item)}</li>`).join("")}</ul>`) : "",
      counter.length ? sectionHtml("Motpunkter", `<ul>${counter.map(item => `<li>${esc(item)}</li>`).join("")}</ul>`) : "",
      classification.length ? sectionHtml("Klassifikasjon", `<div class="hg-place-tab-tags">${uniqueBy(classification, value => value).map(tag => `<span>${esc(tag)}</span>`).join("")}</div>`) : "",
      renderLanguage(languageArticle)
    ].join("");
  }

  function createTabs(body, place) {
    const hero = body.querySelector(":scope > .hg-place-hero");
    const tablist = document.createElement("nav");
    tablist.className = "hg-place-tabs";
    tablist.setAttribute("role", "tablist");
    tablist.setAttribute("aria-label", `Innhold for ${text(place?.name || "stedet")}`);

    const panelWrap = document.createElement("div");
    panelWrap.className = "hg-place-tab-panels";
    const panels = {};

    TAB_DEFS.forEach(([id, label], index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "hg-place-tab";
      button.id = `hg-place-tab-${id}`;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-controls", `hg-place-panel-${id}`);
      button.setAttribute("aria-selected", index === 0 ? "true" : "false");
      button.tabIndex = index === 0 ? 0 : -1;
      button.dataset.placeTab = id;
      button.textContent = label;
      tablist.appendChild(button);

      const panel = document.createElement("section");
      panel.className = "hg-place-tab-panel";
      panel.id = `hg-place-panel-${id}`;
      panel.dataset.placePanel = id;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", button.id);
      panel.hidden = index !== 0;
      panels[id] = panel;
      panelWrap.appendChild(panel);
    });

    if (hero) hero.insertAdjacentElement("afterend", tablist);
    else body.prepend(tablist);
    tablist.insertAdjacentElement("afterend", panelWrap);

    const activate = (id, focus = false) => {
      const selected = tablist.querySelector(`[data-place-tab="${CSS.escape(id)}"]`);
      if (!selected) return;
      tablist.querySelectorAll("[role=tab]").forEach(button => {
        const active = button === selected;
        button.setAttribute("aria-selected", active ? "true" : "false");
        button.tabIndex = active ? 0 : -1;
      });
      Object.entries(panels).forEach(([panelId, panel]) => { panel.hidden = panelId !== id; });
      if (focus) selected.focus();
    };

    tablist.addEventListener("click", event => {
      const button = event.target.closest?.("[data-place-tab]");
      if (button) activate(button.dataset.placeTab, false);
    });
    tablist.addEventListener("keydown", event => {
      const buttons = [...tablist.querySelectorAll("[role=tab]")];
      const current = document.activeElement;
      const index = buttons.indexOf(current);
      if (index < 0) return;
      let next = index;
      if (event.key === "ArrowRight") next = (index + 1) % buttons.length;
      else if (event.key === "ArrowLeft") next = (index - 1 + buttons.length) % buttons.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = buttons.length - 1;
      else return;
      event.preventDefault();
      activate(buttons[next].dataset.placeTab, true);
    });

    return { hero, tablist, panelWrap, panels, activate };
  }

  function isWonderkammerNode(node) {
    if (!(node instanceof Element)) return false;
    const classText = text(node.className).toLowerCase();
    if (classText.includes("wonderkammer") || /(^|\s)wk[-_]/.test(classText)) return true;
    const heading = node.querySelector?.("h2,h3,h4");
    return text(heading?.textContent).toLowerCase().includes("wonderkammer");
  }

  function distributeExistingContent(body, tabs) {
    const children = [...body.children].filter(node => node !== tabs.hero && node !== tabs.tablist && node !== tabs.panelWrap);
    for (const node of children) {
      if (!(node instanceof Element)) continue;
      if (isWonderkammerNode(node)) {
        node.remove();
        continue;
      }
      if (node.classList.contains("hg-place-people-section")) {
        node.remove(); // People eies av den visuelle People-rundingen.
        continue;
      }
      if (node.classList.contains("hg-place-history-section") || node.classList.contains("hg-section-events")) {
        tabs.panels.history.appendChild(node);
      } else if (node.classList.contains("hg-section-stories")) {
        tabs.panels.stories.appendChild(node);
      } else if (node.classList.contains("hg-place-sources-section")) {
        tabs.panels.sources.appendChild(node);
      } else if (node.classList.contains("hg-place-relations-section") || node.classList.contains("hg-place-knowledge-section") || node.classList.contains("hg-place-observations-section")) {
        tabs.panels.more.appendChild(node);
      } else {
        tabs.panels.about.appendChild(node);
      }
    }
  }

  function appendHtml(panel, html, marker) {
    if (!panel || !text(html)) return;
    const holder = document.createElement("div");
    holder.className = "hg-place-tab-generated";
    if (marker) holder.dataset.generated = marker;
    holder.innerHTML = html;
    panel.appendChild(holder);
  }

  async function hydrateTabs(place, tabs, popup) {
    const placeId = text(place?.id);
    if (!placeId || !popup?.isConnected) return;

    const [articles, stories, lesespor, languageArticle] = await Promise.all([
      ensureLeksikon(placeId),
      ensureStories(placeId),
      ensureLesespor(),
      loadLanguageArticle(placeId)
    ]);
    if (!popup.isConnected) return;

    const mainArticle = resolveMainArticle(articles, place);
    const extras = list(articles).filter(article => article !== mainArticle);
    const buckets = { history: [], events: [], historical_news: [], news_notes: [], objects: [], language: [] };
    for (const article of extras) {
      const bucket = classifyArticle(article);
      (buckets[bucket] || buckets.history).push(article);
    }

    const chronology = [
      ...list(mainArticle?.chronology),
      ...extras.flatMap(article => list(article?.chronology))
    ];
    const societyEvents = list(mainArticle?.events?.politics_society);

    appendHtml(tabs.panels.about, renderLeksikonAbout(mainArticle, place?.popupDesc || place?.description || place?.desc), "leksikon-about");

    const timeline = chronologyHtml(chronology);
    if (timeline) appendHtml(tabs.panels.history, sectionHtml("Tidslinje", timeline), "chronology");
    if (buckets.history.length) appendHtml(tabs.panels.history, sectionHtml("Historie og bruksspor", listCards(buckets.history)), "history-articles");
    if (buckets.events.length || societyEvents.length) appendHtml(tabs.panels.history, sectionHtml("Hendelser og samfunn", listCards([...societyEvents, ...buckets.events])), "events");

    // Base-popupens storyseksjon kan allerede ligge i fanen. Bruk den hvis den finnes;
    // ellers rendres canonical Stories her. Legacy leksikon-stories beholdes bare når de ikke dupliserer canonical titler.
    const hasBaseStories = tabs.panels.stories.querySelector(".hg-section-stories");
    const legacyStories = list(mainArticle?.stories);
    if (!hasBaseStories || legacyStories.length) appendHtml(tabs.panels.stories, renderStories(hasBaseStories ? [] : stories, legacyStories), "stories");
    if (!tabs.panels.stories.children.length) appendHtml(tabs.panels.stories, renderStories(stories, legacyStories), "stories-empty");

    appendHtml(tabs.panels["before-after"], renderBeforeAfter(place), "before-after");
    appendHtml(tabs.panels.news, renderNews(buckets.historical_news, buckets.news_notes), "news");
    appendHtml(tabs.panels.reading, renderLesespor(lesespor, placeId), "reading");
    appendHtml(tabs.panels.sources, renderSources(place, articles), "sources");
    appendHtml(tabs.panels.more, renderMainArticleExtras(mainArticle, buckets.objects, languageArticle), "more");

    // Åpning av stedspopupen er nå også inngangen til leksikoninnholdet. Behold read-signalet.
    if (articles.length && typeof global.HGLeksikon?.leksikonReadRecordsForPlace === "function") {
      try {
        global.HGLeksikon.leksikonReadRecordsForPlace(place, placeId).forEach(record => global.HGReads?.recordLeksikon?.(record));
      } catch {}
    }
  }

  function decoratePopup(place) {
    const popup = document.querySelector(".hg-popup.place-popup-v2");
    const article = popup?.querySelector(".hg-place-popup-v2");
    const body = article?.querySelector(":scope > .hg-place-popup-body");
    if (!popup || !article || !body || article.hasAttribute(DECORATED_ATTR)) return;
    article.setAttribute(DECORATED_ATTR, "1");
    const tabs = createTabs(body, place);
    distributeExistingContent(body, tabs);
    void hydrateTabs(place, tabs, popup);
  }

  function install() {
    if (global[INSTALL_FLAG]) return true;
    const current = global.showPlacePopup;
    if (typeof current !== "function" || current.__hgPlacePopupTabs) return false;
    if (current.__hgPlacePopupV2 !== true) return false;

    const wrapped = function showTabbedPlacePopup(place) {
      const result = current.apply(this, arguments);
      try { decoratePopup(place); } catch (error) {
        console.warn("[place-popup-tabs] Kunne ikke bygge faner", error);
      }
      return result;
    };
    wrapped.__hgPlacePopupTabs = true;
    wrapped.__hgPlacePopupV2 = true;
    wrapped.__previous = current;
    global.showPlacePopup = wrapped;
    global.HGPlacePopupTabs = { decoratePopup, tabs: TAB_DEFS.map(([id, label]) => ({ id, label })) };
    global[INSTALL_FLAG] = true;
    return true;
  }

  if (!install()) {
    let attempts = 0;
    const timer = global.setInterval(() => {
      attempts += 1;
      if (install() || attempts > 400) global.clearInterval(timer);
    }, 50);
  }
})(window);
