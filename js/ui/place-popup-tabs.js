// @ts-nocheck
// js/ui/place-popup-tabs.js
// Samler stedets kunnskapsflater i én fanebasert popup uten å flytte source-data.
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

  const text = value => String(value == null ? "" : value).trim();
  const list = value => Array.isArray(value) ? value : [];
  const esc = value => String(value == null ? "" : value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  function uniqueBy(values, keyFn) {
    const seen = new Set();
    return values.filter(value => {
      const key = keyFn(value);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function strings(values) {
    return list(values).map(text).filter(Boolean);
  }

  function humanize(value) {
    const cleaned = text(value).replaceAll("_", " ").replace(/\s+/g, " ");
    return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : "";
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

  function section(title, body, extraClass = "") {
    if (!text(body)) return "";
    return `<section class="hg-section hg-place-section hg-place-tab-section ${esc(extraClass)}"><h3>${esc(title)}</h3>${body}</section>`;
  }

  function cards(items, compact = false) {
    const rows = list(items).filter(Boolean);
    if (!rows.length) return "";
    return `<div class="hg-place-tab-card-list">${rows.map(item => {
      const title = text(item?.title || item?.name || item?.label || item?.term || item?.id || "Oppføring");
      const meta = [item?.period || item?.year || item?.date, item?.type || item?.kind || item?.category]
        .map(text).filter(Boolean).join(" · ");
      const summary = text(item?.summary?.one_liner || item?.popupDesc || item?.desc || item?.description || item?.meaning);
      return `<article class="hg-place-tab-card${compact ? " is-compact" : ""}"><strong>${esc(title)}</strong>${meta ? `<span>${esc(meta)}</span>` : ""}${summary ? `<p>${esc(summary)}</p>` : ""}</article>`;
    }).join("")}</div>`;
  }

  async function loadLeksikon(placeId) {
    if (Object.prototype.hasOwnProperty.call(global.LEKSIKON_BY_PLACE || {}, placeId)) {
      return list(global.LEKSIKON_BY_PLACE[placeId]);
    }
    try { await global.HGLeksikon?.init?.(); } catch (error) {
      if (global.DEBUG) console.warn("[place-popup-tabs] Leksikon", error);
    }
    return list(global.LEKSIKON_BY_PLACE?.[placeId]);
  }

  async function loadStories(placeId) {
    if (Object.prototype.hasOwnProperty.call(global.HGStories?.byPlace || {}, placeId)) {
      return list(global.HGStories.byPlace[placeId]);
    }
    try { await global.HGStories?.init?.(); } catch {}
    try { return list(global.HGStories?.getByPlace?.(placeId)); } catch { return []; }
  }

  async function loadLesespor() {
    if (Array.isArray(global.LESESPOR)) return global.LESESPOR;
    try {
      const value = await global.DataHub?.loadLesespor?.({ cache: "default" });
      return Array.isArray(value?.items) ? value.items : list(value);
    } catch {
      return list(global.LESESPOR);
    }
  }

  async function loadLanguage(placeId) {
    if (Object.prototype.hasOwnProperty.call(global.HG_PLACE_OPEN_LANGUAGE || {}, placeId)) {
      return global.HG_PLACE_OPEN_LANGUAGE[placeId];
    }
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

  function mainArticle(articles, place) {
    const rows = list(articles).filter(Boolean);
    const placeName = text(place?.name).toLowerCase();
    return rows.find(article => text(article?.title || article?.name).toLowerCase() === placeName)
      || rows.find(article => /hoved|main|primary/.test([article?.id, article?.type, article?.kind].map(value => text(value).toLowerCase()).join(" ")))
      || rows[0]
      || null;
  }

  function visibleArticlesForPopup(articles, main) {
    const rows = list(articles).filter(Boolean);
    if (main?.suppress_untitled_legacy_articles !== true) return rows;
    return rows.filter(article => (
      article === main || Boolean(text(article?.title || article?.name || article?.label))
    ));
  }

  function classifyArticle(article) {
    const signals = [
      article?.id, article?.title, article?.name, article?.type, article?.kind,
      article?.category, article?.popupDesc, article?.summary?.one_liner,
      ...strings(article?.tags), ...strings(article?.summary?.themes)
    ].map(value => text(value).toLowerCase()).join(" ");
    const has = terms => terms.some(term => signals.includes(term));
    if (has(["historical_news", "gamle_nyheter", "gamle nyheter", "avisnotis", "newspaper", "moralpanikk", "old_news"])) return "historical_news";
    if (has(["news_note", "nyere_notis", "nyere notis", "incident", "brann", "politi", "drap"])) return "news_notes";
    if (has(["arrangement", "event", "competition", "sports_event", "stevne", "rekord", "resultat", "statistikk"])) return "events";
    if (has(["object", "objekt", "artifact", "anlegg", "facility", "installation", "infrastructure", "dekke"])) return "objects";
    return "history";
  }

  function renderAbout(article, currentPopupText) {
    if (!article) return "";
    const current = text(currentPopupText).replace(/\s+/g, " ");
    const wiki = (Array.isArray(article?.wikiText) ? article.wikiText : [article?.wikiText])
      .map(text).filter(value => value && value.replace(/\s+/g, " ") !== current);
    const facts = list(article?.facts);
    const built = article?.built_environment && typeof article.built_environment === "object" ? article.built_environment : {};
    const builtRows = [
      built.original_function ? `<p><strong>Opprinnelig funksjon:</strong> ${esc(built.original_function)}</p>` : "",
      built.current_function ? `<p><strong>Funksjon i dag:</strong> ${esc(built.current_function)}</p>` : "",
      ...list(built.changes).map(change => `<p><strong>${esc(change?.label || change?.year || "Endring")}:</strong> ${esc(change?.desc || "")}</p>`)
    ].filter(Boolean).join("");
    const factHtml = facts.length ? `<div class="hg-place-tab-facts">${facts.map(fact => `<div><strong>${esc(fact?.label || fact?.id || "Fakta")}</strong><p>${esc(fact?.desc || "")}</p></div>`).join("")}</div>` : "";
    return [
      wiki.length ? section("Leksikonartikkel", wiki.map(value => `<p>${esc(value)}</p>`).join("")) : "",
      factHtml ? section("Fakta", factHtml) : "",
      builtRows ? section("Bygd miljø og funksjon", builtRows) : ""
    ].join("");
  }

  function renderTimeline(rows) {
    const normalized = uniqueBy(list(rows).filter(Boolean), row => [row?.date, row?.year, row?.period, row?.desc].map(text).join("|"))
      .sort((a, b) => (Number(a?.year || String(a?.date || "").slice(0, 4)) || 0) - (Number(b?.year || String(b?.date || "").slice(0, 4)) || 0));
    if (!normalized.length) return "";
    return `<div class="hg-place-tab-timeline">${normalized.map(row => {
      const when = text(row?.date || row?.year || row?.period || "Tidslag");
      const title = text(row?.title || row?.label || (row?.period !== when ? row?.period : ""));
      const desc = text(row?.desc || row?.summary || row?.description);
      return `<article class="hg-place-tab-timeline-item"><span>${esc(when)}</span><div>${title ? `<strong>${esc(title)}</strong>` : ""}${desc ? `<p>${esc(desc)}</p>` : ""}</div></article>`;
    }).join("")}</div>`;
  }

  function renderStories(stories, legacyStories) {
    const canonical = list(stories);
    const canonicalTitles = new Set(canonical.map(story => text(story?.title || story?.name).toLowerCase()).filter(Boolean));
    const legacy = list(legacyStories).filter(story => !canonicalTitles.has(text(story?.title || story?.name).toLowerCase()));
    const canonicalHtml = canonical.length ? `<div class="hg-place-story-list">${canonical.map(story => {
      const meta = [story?.type, story?.year].map(text).filter(Boolean).join(" · ");
      const summary = text(story?.summary || story?.story);
      return `<article class="hg-place-story-card"><strong>${esc(story?.title || story?.name || story?.id || "Fortelling")}</strong>${meta ? `<span>${esc(meta)}</span>` : ""}${summary ? `<p>${esc(summary)}</p>` : ""}</article>`;
    }).join("")}</div>` : "";
    return canonicalHtml + (legacy.length ? section("Eldre leksikonspor", cards(legacy, true)) : "")
      || `<div class="hg-place-tab-empty">Ingen fortellinger for dette stedet ennå.</div>`;
  }

  function renderBeforeAfter(place) {
    const data = place?.for_na && typeof place.for_na === "object" ? place.for_na : null;
    if (!data) return `<div class="hg-place-tab-empty">Ingen før/etter-innhold for dette stedet ennå.</div>`;
    const images = [
      {
        label: text(data.beforeImageLabel || data.before_image_label || "Før"),
        url: data.beforeImage || data.before_image || data.imageBefore,
        meta: data.beforeImageMeta || data.before_image_meta
      },
      {
        label: text(data.nowImageLabel || data.now_image_label || "Nå"),
        url: data.nowImage || data.now_image || data.imageNow,
        meta: data.nowImageMeta || data.now_image_meta
      }
    ].filter(item => safeHttpsUrl(item.url) || text(item.url).startsWith("bilder/") || text(item.url).startsWith("assets/"));
    const imageHtml = images.length ? `<div class="hg-place-before-after-media">${images.map(item => {
      const credit = text(item.meta?.credit || item.meta?.author);
      const license = text(item.meta?.license);
      const sourcePage = safeHttpsUrl(item.meta?.sourcePage || item.meta?.sourceUrl);
      const attribution = [credit, license].filter(Boolean).join(" · ");
      return `<figure><img src="${esc(item.url)}" alt="${esc(item.label)}: ${esc(place?.name || "stedet")}" loading="lazy"><figcaption><strong>${esc(item.label)}</strong>${attribution ? `<span>${esc(attribution)}</span>` : ""}${sourcePage ? `<a href="${esc(sourcePage)}" target="_blank" rel="noopener noreferrer">Bildekilde ↗</a>` : ""}</figcaption></figure>`;
    }).join("")}</div>` : "";
    const lookFor = strings(data.lookFor || data.look_for || data.observe || data.observer);
    return imageHtml + [
      text(data.before) ? section("Før", `<p>${esc(data.before)}</p>`) : "",
      text(data.now) ? section("Nå", `<p>${esc(data.now)}</p>`) : "",
      text(data.change) ? section("Endring", `<p>${esc(data.change)}</p>`) : "",
      lookFor.length ? section("Se etter i dag", `<ul>${lookFor.map(item => `<li>${esc(item)}</li>`).join("")}</ul>`) : ""
    ].join("");
  }

  function newsCards(items) {
    const rows = list(items).filter(Boolean);
    if (!rows.length) return "";
    return `<div class="hg-place-tab-card-list">${rows.map(item => {
      const title = text(item?.title || item?.name || item?.id || "Notis");
      const meta = [item?.date || item?.year || item?.period, item?.category || item?.type]
        .map(text).filter(Boolean).join(" · ");
      const summary = text(item?.summary?.one_liner || item?.popupDesc || item?.desc || item?.description);
      const rawSource = list(item?.sources)[0];
      const sourceUrl = safeHttpsUrl(typeof rawSource === "string" ? rawSource : rawSource?.url);
      const sourceLabel = text(typeof rawSource === "string" ? "Offisiell kilde" : rawSource?.label || rawSource?.title || "Offisiell kilde");
      return `<article class="hg-place-tab-card"><strong>${esc(title)}</strong>${meta ? `<span>${esc(meta)}</span>` : ""}${summary ? `<p>${esc(summary)}</p>` : ""}${sourceUrl ? `<a class="hg-place-news-source" href="${esc(sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(sourceLabel)} ↗</a>` : ""}</article>`;
    }).join("")}</div>`;
  }

  function renderNews(oldNews, newNews) {
    return (list(oldNews).length ? section("Gamle nyheter", newsCards(oldNews)) : "")
      + (list(newNews).length ? section("Nyere notiser", newsCards(newNews)) : "")
      || `<div class="hg-place-tab-empty">Ingen nyheter eller notiser knyttet til stedet ennå.</div>`;
  }

  function renderLesespor(items, placeId) {
    const rows = uniqueBy(list(items).filter(item => {
      if (!list(item?.place_ids).map(text).includes(placeId)) return false;
      const access = [item?.access, item?.access_note, item?.note].map(value => text(value).toLowerCase()).join(" ");
      return !["paywall", "subscription", "subscriber", "abonnement", "betalingsmur", "krever abonnement"].some(term => access.includes(term));
    }), item => text(item?.id) || [item?.title, item?.author, item?.publication, item?.year || item?.date].map(text).join("|"));
    if (!rows.length) return `<div class="hg-place-tab-empty">Ingen åpne Lesespor for dette stedet ennå.</div>`;
    rows.sort((a, b) => (Number(b?.year || String(b?.date || "").slice(0, 4)) || 0) - (Number(a?.year || String(a?.date || "").slice(0, 4)) || 0));
    return `<div class="hg-place-reading-list">${rows.map(item => {
      const url = safeHttpsUrl(item?.url);
      const meta = [item?.author, item?.publication, item?.year || item?.date, item?.type].map(text).filter(Boolean).join(" · ");
      return `<article class="hg-place-reading-card"><strong>${esc(item?.title || "Uten tittel")}</strong>${meta ? `<span>${esc(meta)}</span>` : ""}${item?.relevance ? `<p>${esc(item.relevance)}</p>` : ""}${url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Les teksten ↗</a>` : ""}</article>`;
    }).join("")}</div>`;
  }

  function renderSources(place, articles, includeProfileLabels = true) {
    const sourceProfile = place?.source_summary && typeof place.source_summary === "object" ? place.source_summary : (place?.sourceSummary || {});
    const labels = includeProfileLabels ? uniqueBy(strings(sourceProfile?.safe_sources || sourceProfile?.sources), value => value) : [];
    const configuredLinks = [place, ...list(articles)].flatMap(value => list(value?.externalLinks)).map(link => ({
      type: text(link?.type || "source"),
      label: text(link?.label || link?.title),
      url: safeHttpsUrl(link?.url)
    }));
    const beforeAfterLinks = [
      ...strings(place?.for_na?.sources || place?.for_na?.kilder || place?.for_na?.source),
      text(place?.for_na?.beforeImageMeta?.sourcePage || place?.for_na?.before_image_meta?.sourcePage),
      text(place?.for_na?.nowImageMeta?.sourcePage || place?.for_na?.now_image_meta?.sourcePage)
    ].map(url => ({ type: "image_source", label: "Bilde- og sammenligningskilde", url: safeHttpsUrl(url) }));
    const links = uniqueBy([...configuredLinks, ...beforeAfterLinks].filter(link => link.url), link => link.url);
    return (labels.length ? section("Kilder i stedprofilen", `<ul>${labels.map(label => `<li>${esc(label)}</li>`).join("")}</ul>`) : "")
      + (links.length ? section("Kilder og eksterne oppslag", `<div class="hg-place-source-link-list">${links.map(link => `<a href="${esc(link.url)}" target="_blank" rel="noopener noreferrer"><strong>${esc(link.label || link.url)}</strong><span>${esc(humanize(link.type))} ↗</span></a>`).join("")}</div>`) : "")
      || `<div class="hg-place-tab-empty">Ingen brukerrettede kilder er registrert for dette stedet ennå.</div>`;
  }

  function languageCards(items) {
    const rows = list(items).filter(Boolean);
    if (!rows.length) return "";
    return `<div class="hg-place-tab-card-list">${rows.map(item => {
      const title = text(item?.term || item?.title || item?.id || "Oppslag");
      const type = humanize(item?.type || "språkoppføring");
      const meaning = text(item?.meaning || item?.desc || item?.description);
      const context = text(item?.context);
      const rawSource = list(item?.sources)[0];
      const sourceUrl = safeHttpsUrl(typeof rawSource === "string" ? rawSource : rawSource?.url);
      const sourceLabel = text(typeof rawSource === "string" ? "Kilde" : rawSource?.label || rawSource?.title || "Kilde");
      return `<article class="hg-place-tab-card hg-place-language-card"><strong>${esc(title)}</strong>${type ? `<span>${esc(type)}</span>` : ""}${meaning ? `<p>${esc(meaning)}</p>` : ""}${context ? `<p class="hg-place-language-context">${esc(context)}</p>` : ""}${sourceUrl ? `<a class="hg-place-more-source" href="${esc(sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(sourceLabel)} ↗</a>` : ""}</article>`;
    }).join("")}</div>`;
  }

  function renderMore(article, objectArticles, languageArticle) {
    const interpretation = article?.interpretation && typeof article.interpretation === "object" ? article.interpretation : {};
    const artifacts = [...list(article?.artifacts), ...list(article?.objects), ...list(objectArticles)];
    const languageEntries = list(languageArticle?.entries);
    return [
      artifacts.length ? section("Spor og objekter", cards(artifacts, true)) : "",
      strings(interpretation.what_to_notice).length ? section("Legg merke til", `<ul>${strings(interpretation.what_to_notice).map(value => `<li>${esc(value)}</li>`).join("")}</ul>`) : "",
      strings(interpretation.why_it_matters).length ? section("Hvorfor det betyr noe", `<ul>${strings(interpretation.why_it_matters).map(value => `<li>${esc(value)}</li>`).join("")}</ul>`) : "",
      strings(interpretation.counterpoints).length ? section("Motpunkter", `<ul>${strings(interpretation.counterpoints).map(value => `<li>${esc(value)}</li>`).join("")}</ul>`) : "",
      languageEntries.length ? section("Språkleksikon", languageCards(languageEntries)) : ""
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
      button.dataset.placeTab = id;
      button.textContent = label;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-controls", `hg-place-panel-${id}`);
      button.setAttribute("aria-selected", index === 0 ? "true" : "false");
      button.tabIndex = index === 0 ? 0 : -1;
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
      const target = event.target instanceof Element ? event.target.closest("[data-place-tab]") : null;
      if (target) activate(target.dataset.placeTab, false);
    });
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
      activate(buttons[next].dataset.placeTab, true);
    });

    return { hero, tablist, panelWrap, panels };
  }

  function isWonderkammerNode(node) {
    if (!(node instanceof Element)) return false;
    const classes = text(node.className).toLowerCase();
    const heading = text(node.querySelector?.("h2,h3,h4")?.textContent).toLowerCase();
    return classes.includes("wonderkammer") || /(^|\s)wk[-_]/.test(classes) || heading.includes("wonderkammer");
  }

  function distributeExisting(body, tabs) {
    [...body.children].filter(node => node !== tabs.hero && node !== tabs.tablist && node !== tabs.panelWrap).forEach(node => {
      if (!(node instanceof Element)) return;
      if (isWonderkammerNode(node) || node.classList.contains("hg-place-people-section")) return node.remove();
      if (node.classList.contains("hg-place-history-section") || node.classList.contains("hg-section-events")) tabs.panels.history.appendChild(node);
      else if (node.classList.contains("hg-section-stories")) tabs.panels.stories.appendChild(node);
      else if (node.classList.contains("hg-place-sources-section")) tabs.panels.sources.appendChild(node);
      else if (node.classList.contains("hg-place-relations-section") || node.classList.contains("hg-place-knowledge-section") || node.classList.contains("hg-place-observations-section")) tabs.panels.more.appendChild(node);
      else tabs.panels.about.appendChild(node);
    });
  }

  function append(panel, html, marker) {
    if (!panel || !text(html)) return;
    const holder = document.createElement("div");
    holder.className = "hg-place-tab-generated";
    if (marker) holder.dataset.generated = marker;
    holder.innerHTML = html;
    panel.appendChild(holder);
  }

  async function hydrate(place, tabs, popup) {
    const placeId = text(place?.id);
    if (!placeId || !popup?.isConnected) return;
    const [articles, stories, lesespor, language] = await Promise.all([
      loadLeksikon(placeId), loadStories(placeId), loadLesespor(), loadLanguage(placeId)
    ]);
    if (!popup.isConnected) return;

    const main = mainArticle(articles, place);
    const visibleArticles = visibleArticlesForPopup(articles, main);
    const extras = visibleArticles.filter(article => article !== main);
    const buckets = { history: [], events: [], historical_news: [], news_notes: [], objects: [] };
    extras.forEach(article => {
      const key = classifyArticle(article);
      (buckets[key] || buckets.history).push(article);
    });

    append(tabs.panels.about, renderAbout(main, place?.popupDesc || place?.description || place?.desc), "leksikon-about");
    const timeline = renderTimeline([...list(main?.chronology), ...extras.flatMap(article => list(article?.chronology))]);
    if (timeline) append(tabs.panels.history, section("Tidslinje", timeline), "chronology");
    if (buckets.history.length) append(tabs.panels.history, section("Historie og bruksspor", cards(buckets.history)), "history-articles");
    const events = [...list(main?.events?.politics_society), ...buckets.events];
    if (events.length) append(tabs.panels.history, section("Hendelser og samfunn", cards(events)), "events");

    const existingStories = tabs.panels.stories.querySelector(".hg-section-stories");
    const legacyStories = list(main?.stories);
    if (!existingStories || legacyStories.length) append(tabs.panels.stories, renderStories(existingStories ? [] : stories, legacyStories), "stories");
    if (!tabs.panels.stories.children.length) append(tabs.panels.stories, renderStories(stories, legacyStories), "stories-empty");

    append(tabs.panels["before-after"], renderBeforeAfter(place), "before-after");
    append(tabs.panels.news, renderNews(buckets.historical_news, buckets.news_notes), "news");
    append(tabs.panels.reading, renderLesespor(lesespor, placeId), "reading");
    const hasExistingSourceProfile = Boolean(tabs.panels.sources.querySelector(".hg-place-sources-section"));
    append(tabs.panels.sources, renderSources(place, visibleArticles, !hasExistingSourceProfile), "sources");
    append(tabs.panels.more, renderMore(main, buckets.objects, language), "more");

    if (visibleArticles.length && typeof global.HGLeksikon?.leksikonReadRecordsForPlace === "function") {
      try {
        global.HGLeksikon.leksikonReadRecordsForPlace(place, placeId)
          .forEach(record => global.HGReads?.recordLeksikon?.(record));
      } catch {}
    }
  }

  function decorate(place) {
    const popup = document.querySelector(".hg-popup.place-popup-v2");
    const article = popup?.querySelector(".hg-place-popup-v2");
    const body = article?.querySelector(":scope > .hg-place-popup-body");
    if (!popup || !article || !body || article.hasAttribute(DECORATED_ATTR)) return;
    article.setAttribute(DECORATED_ATTR, "1");
    const tabs = createTabs(body, place);
    distributeExisting(body, tabs);
    void hydrate(place, tabs, popup);
  }

  function install() {
    if (global[INSTALL_FLAG]) return true;
    const current = global.showPlacePopup;
    if (typeof current !== "function" || current.__hgPlacePopupTabs || current.__hgPlacePopupV2 !== true) return false;
    const wrapped = function showTabbedPlacePopup(place) {
      const result = current.apply(this, arguments);
      if (result && typeof result.then === "function") {
        void result.then(() => decorate(global.HGPlaceOpen?.getPlace?.(place) || place))
          .catch(error => console.warn("[place-popup-tabs]", error));
      } else {
        try { decorate(place); } catch (error) { console.warn("[place-popup-tabs]", error); }
      }
      return result;
    };
    wrapped.__hgPlacePopupTabs = true;
    wrapped.__hgPlacePopupV2 = true;
    wrapped.__previous = current;
    global.showPlacePopup = wrapped;
    global.HGPlacePopupTabs = { decoratePopup: decorate, tabs: TAB_DEFS.map(([id, label]) => ({ id, label })) };
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
