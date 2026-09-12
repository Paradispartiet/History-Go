(() => {
  // js/ui/place-sheet/sections/about.ts
  var runtime = window;
  function text(value) {
    return String(value == null ? "" : value).trim();
  }
  function localize(place) {
    var _a, _b;
    try {
      return ((_b = (_a = runtime.HG_I18N) == null ? void 0 : _a.localizePlace) == null ? void 0 : _b.call(_a, place)) || place;
    } catch {
      return place;
    }
  }
  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function normalized(value) {
    return text(value).replace(/\s+/g, " ");
  }
  function canonicalAboutText(inputPlace) {
    const place = localize(inputPlace || {});
    for (const value of [place.popupDesc, place.popupdesc, place.description, place.desc]) {
      const candidate = text(value);
      if (candidate) return candidate;
    }
    return "";
  }
  function renderParagraphs(value) {
    return text(value).split(/\n\s*\n+/).map((paragraph) => text(paragraph)).filter(Boolean).map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`).join("");
  }
  function renderCanonicalAboutHtml(inputPlace, options = {}) {
    const place = localize(inputPlace || {});
    const fullText = canonicalAboutText(place);
    if (!fullText) return "";
    if (options.suppressIfSameAsDesc && normalized(fullText) === normalized(place.desc)) return "";
    return `
    <section class="hg-section hg-place-section hg-place-about-section" data-hg-place-sheet-owner="about">
      <h3>Om stedet</h3>
      <div class="hg-place-longread">${renderParagraphs(fullText)}</div>
    </section>
  `;
  }
  function mountCanonicalAbout(container, place, options = {}) {
    const html = renderCanonicalAboutHtml(place, options);
    container.replaceChildren();
    if (!html) {
      container.hidden = true;
      return null;
    }
    container.hidden = false;
    container.insertAdjacentHTML("beforeend", html);
    return container.querySelector('[data-hg-place-sheet-owner="about"]');
  }
  var aboutApi = {
    text: canonicalAboutText,
    renderHtml: renderCanonicalAboutHtml,
    mount: mountCanonicalAbout
  };
  runtime.HGPlaceSheetSections = {
    ...runtime.HGPlaceSheetSections || {},
    about: aboutApi
  };

  // js/ui/place-sheet/sections/history.ts
  var runtime2 = window;
  function text2(value) {
    return String(value == null ? "" : value).trim();
  }
  function localize2(place) {
    var _a, _b;
    try {
      return ((_b = (_a = runtime2.HG_I18N) == null ? void 0 : _a.localizePlace) == null ? void 0 : _b.call(_a, place)) || place;
    } catch {
      return place;
    }
  }
  function escapeHtml2(value) {
    return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function timelineOrder(item, index) {
    var _a;
    const explicit = Number((_a = item == null ? void 0 : item.sort_order) != null ? _a : item == null ? void 0 : item.sortOrder);
    return Number.isFinite(explicit) ? explicit : index + 1;
  }
  function canonicalHistoryLayers(inputPlace) {
    const place = localize2(inputPlace || {});
    const layers = Array.isArray(place.history_layers) ? place.history_layers : [];
    return layers.map((item, index) => ({ item, index })).filter(({ item }) => Boolean(item && typeof item === "object" && !Array.isArray(item))).sort((a, b) => timelineOrder(a.item, a.index) - timelineOrder(b.item, b.index)).map(({ item }) => item);
  }
  function renderCanonicalHistoryHtml(inputPlace) {
    const layers = canonicalHistoryLayers(inputPlace);
    if (!layers.length) return "";
    return `
    <section class="hg-section hg-place-section hg-place-history-section" data-hg-place-sheet-owner="history">
      <h3>Historiske lag</h3>
      <div class="hg-place-timeline">
        ${layers.map((item) => {
      const period = text2((item == null ? void 0 : item.period) || (item == null ? void 0 : item.year) || (item == null ? void 0 : item.date));
      const title = text2((item == null ? void 0 : item.title) || (item == null ? void 0 : item.name) || (item == null ? void 0 : item.id));
      const summary = text2((item == null ? void 0 : item.summary) || (item == null ? void 0 : item.desc) || (item == null ? void 0 : item.description));
      return `
            <article class="hg-place-timeline-item">
              <span class="hg-place-timeline-marker" aria-hidden="true"></span>
              <div class="hg-place-timeline-copy">
                ${period ? `<span class="hg-place-timeline-period">${escapeHtml2(period)}</span>` : ""}
                <strong>${escapeHtml2(title)}</strong>
                ${summary ? `<p>${escapeHtml2(summary)}</p>` : ""}
              </div>
            </article>
          `;
    }).join("")}
      </div>
    </section>
  `;
  }
  function mountCanonicalHistory(container, place) {
    const html = renderCanonicalHistoryHtml(place);
    container.replaceChildren();
    if (!html) {
      container.hidden = true;
      return null;
    }
    container.hidden = false;
    container.insertAdjacentHTML("beforeend", html);
    return container.querySelector('[data-hg-place-sheet-owner="history"]');
  }
  var historyApi = {
    layers: canonicalHistoryLayers,
    renderHtml: renderCanonicalHistoryHtml,
    mount: mountCanonicalHistory
  };
  runtime2.HGPlaceSheetSections = {
    ...runtime2.HGPlaceSheetSections || {},
    history: historyApi
  };

  // js/ui/place-sheet/sections/stories.ts
  var runtime3 = window;
  function text3(value) {
    return String(value == null ? "" : value).trim();
  }
  function escapeHtml3(value) {
    return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function safeHttpUrl(value) {
    const candidate = text3(value);
    return /^https?:\/\/[^\s]+$/i.test(candidate) ? candidate : "";
  }
  function people() {
    return Array.isArray(runtime3.PEOPLE) ? runtime3.PEOPLE : [];
  }
  function places() {
    return Array.isArray(runtime3.PLACES) ? runtime3.PLACES : [];
  }
  function personLabel(id) {
    const key = text3(id);
    const person = people().find((row) => text3(row == null ? void 0 : row.id) === key);
    return text3(person == null ? void 0 : person.name) || key;
  }
  function placeLabel(id) {
    const key = text3(id);
    const place = places().find((row) => text3(row == null ? void 0 : row.id) === key);
    return text3((place == null ? void 0 : place.name) || (place == null ? void 0 : place.title)) || key;
  }
  function relatedChip(kind, id) {
    const key = text3(id);
    if (!key) return "";
    const label = kind === "person" ? personLabel(key) : placeLabel(key);
    return `<button type="button" class="pc-story-chip" data-${kind}="${escapeHtml3(key)}">${escapeHtml3(label)}</button>`;
  }
  function canonicalStoriesForPlace(place) {
    var _a;
    const id = text3(place == null ? void 0 : place.id);
    if (!id || typeof ((_a = runtime3.HGStories) == null ? void 0 : _a.getByPlace) !== "function") return [];
    try {
      const rows2 = runtime3.HGStories.getByPlace(id);
      return Array.isArray(rows2) ? rows2.filter((row) => Boolean(row && typeof row === "object" && !Array.isArray(row))) : [];
    } catch {
      return [];
    }
  }
  function renderCanonicalStoriesHtml(stories) {
    const rows2 = Array.isArray(stories) ? stories : [];
    if (!rows2.length) return "";
    const items = rows2.map((story) => {
      const fullStory = text3(story == null ? void 0 : story.story);
      const summary = text3(story == null ? void 0 : story.summary);
      const hasBoth = Boolean(fullStory && summary && summary !== fullStory);
      const bodyText = fullStory || summary;
      const year = text3(story == null ? void 0 : story.year);
      const related = [
        ...Array.isArray(story == null ? void 0 : story.related_people) ? story.related_people.map((id) => relatedChip("person", id)) : [],
        ...Array.isArray(story == null ? void 0 : story.related_places) ? story.related_places.map((id) => relatedChip("place", id)) : []
      ].filter(Boolean);
      const tags = Array.isArray(story == null ? void 0 : story.tags) ? story.tags.map(text3).filter(Boolean) : [];
      const sources = Array.isArray(story == null ? void 0 : story.sources) ? story.sources.slice(0, 3) : [];
      const sourceLinks = sources.map((source) => {
        const url = safeHttpUrl(source == null ? void 0 : source.url);
        const title = text3((source == null ? void 0 : source.title) || (source == null ? void 0 : source.author) || (source == null ? void 0 : source.url));
        if (!title && !url) return "";
        return url ? `<a href="${escapeHtml3(url)}" target="_blank" rel="noopener" class="pc-story-source">${escapeHtml3(title || url)}</a>` : `<span class="pc-story-source">${escapeHtml3(title)}</span>`;
      }).filter(Boolean).join(" \xB7 ");
      return `
      <article class="pc-story" data-story-id="${escapeHtml3(story == null ? void 0 : story.id)}">
        <header class="pc-story-header">
          ${year ? `<div class="pc-story-year-badge">${escapeHtml3(year)}</div>` : ""}
          <h4 class="pc-story-title">${escapeHtml3(story == null ? void 0 : story.title)}</h4>
        </header>
        ${hasBoth ? `<p class="pc-story-lede">${escapeHtml3(summary)}</p>` : ""}
        <div class="pc-story-body">${escapeHtml3(bodyText)}</div>
        ${related.length ? `<div class="pc-story-related">${related.join("")}</div>` : ""}
        ${tags.length ? `<div class="pc-story-tags">${tags.map((tag) => `<span class="pc-story-tag">#${escapeHtml3(tag)}</span>`).join("")}</div>` : ""}
        ${sourceLinks ? `<footer class="pc-story-sources">${sourceLinks}</footer>` : ""}
      </article>
    `;
    }).join("");
    return `
    <section class="hg-section hg-section-stories" data-hg-place-sheet-owner="stories">
      <h3>Fortellinger</h3>
      <div class="pc-stories-list">${items}</div>
    </section>
  `;
  }
  function renderPlaceStoriesHtml(place) {
    return renderCanonicalStoriesHtml(canonicalStoriesForPlace(place));
  }
  function bindRelatedTargets(container) {
    container.querySelectorAll("[data-person]").forEach((button) => {
      button.onclick = () => {
        const id = text3(button.dataset.person);
        const person = people().find((row) => text3(row == null ? void 0 : row.id) === id);
        if (person && typeof runtime3.showPersonPopup === "function") runtime3.showPersonPopup(person);
      };
    });
    container.querySelectorAll("[data-place]").forEach((button) => {
      button.onclick = () => {
        const id = text3(button.dataset.place);
        const place = places().find((row) => text3(row == null ? void 0 : row.id) === id);
        if (place && typeof runtime3.showPlacePopup === "function") runtime3.showPlacePopup(place);
      };
    });
  }
  function mountCanonicalStories(container, place) {
    const html = renderPlaceStoriesHtml(place);
    container.replaceChildren();
    if (!html) {
      container.hidden = true;
      return null;
    }
    container.hidden = false;
    container.insertAdjacentHTML("beforeend", html);
    bindRelatedTargets(container);
    return container.querySelector('[data-hg-place-sheet-owner="stories"]');
  }
  var storiesApi = {
    forPlace: canonicalStoriesForPlace,
    renderHtml: renderCanonicalStoriesHtml,
    renderPlaceHtml: renderPlaceStoriesHtml,
    mount: mountCanonicalStories
  };
  runtime3.HGPlaceSheetSections = {
    ...runtime3.HGPlaceSheetSections || {},
    stories: storiesApi
  };

  // js/ui/place-sheet/sections/before-after.ts
  var runtime4 = window;
  function text4(value) {
    return String(value == null ? "" : value).trim();
  }
  function localize3(place) {
    var _a, _b;
    try {
      return ((_b = (_a = runtime4.HG_I18N) == null ? void 0 : _a.localizePlace) == null ? void 0 : _b.call(_a, place)) || place;
    } catch {
      return place;
    }
  }
  function escapeHtml4(value) {
    return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function safeHttpsUrl(value) {
    var _a;
    const raw = text4(value);
    if (!raw) return "";
    try {
      const parsed = new URL(raw, ((_a = runtime4.location) == null ? void 0 : _a.origin) || void 0);
      return parsed.protocol === "https:" ? parsed.href : "";
    } catch {
      return "";
    }
  }
  function safeImageUrl(value) {
    const raw = text4(value);
    if (!raw) return "";
    if (raw.startsWith("bilder/") || raw.startsWith("assets/")) return raw;
    return safeHttpsUrl(raw);
  }
  function strings(value) {
    return Array.isArray(value) ? value.map(text4).filter(Boolean) : [];
  }
  function detailSection(title, body2) {
    return body2 ? `<section class="hg-section hg-place-section hg-place-tab-section"><h3>${escapeHtml4(title)}</h3>${body2}</section>` : "";
  }
  function canonicalBeforeAfterData(inputPlace) {
    const place = localize3(inputPlace || {});
    const data = place == null ? void 0 : place.for_na;
    return data && typeof data === "object" && !Array.isArray(data) ? data : null;
  }
  function renderBeforeAfterContentHtml(inputPlace) {
    const place = localize3(inputPlace || {});
    const data = canonicalBeforeAfterData(place);
    if (!data) return "";
    const images = [
      {
        label: text4(data.beforeImageLabel || data.before_image_label || "F\xF8r"),
        url: safeImageUrl(data.beforeImage || data.before_image || data.imageBefore),
        meta: data.beforeImageMeta || data.before_image_meta
      },
      {
        label: text4(data.nowImageLabel || data.now_image_label || "N\xE5"),
        url: safeImageUrl(data.nowImage || data.now_image || data.imageNow),
        meta: data.nowImageMeta || data.now_image_meta
      }
    ].filter((item) => item.url);
    const imageHtml = images.length ? `<div class="hg-place-before-after-media">${images.map((item) => {
      var _a, _b, _c, _d, _e;
      const credit = text4(((_a = item.meta) == null ? void 0 : _a.credit) || ((_b = item.meta) == null ? void 0 : _b.author));
      const license = text4((_c = item.meta) == null ? void 0 : _c.license);
      const sourcePage = safeHttpsUrl(((_d = item.meta) == null ? void 0 : _d.sourcePage) || ((_e = item.meta) == null ? void 0 : _e.sourceUrl));
      const attribution = [credit, license].filter(Boolean).join(" \xB7 ");
      return `<figure><img src="${escapeHtml4(item.url)}" alt="${escapeHtml4(item.label)}: ${escapeHtml4((place == null ? void 0 : place.name) || "stedet")}" loading="lazy"><figcaption><strong>${escapeHtml4(item.label)}</strong>${attribution ? `<span>${escapeHtml4(attribution)}</span>` : ""}${sourcePage ? `<a href="${escapeHtml4(sourcePage)}" target="_blank" rel="noopener noreferrer">Bildekilde \u2197</a>` : ""}</figcaption></figure>`;
    }).join("")}</div>` : "";
    const lookFor = strings(data.lookFor || data.look_for || data.observe || data.observer);
    return imageHtml + [
      text4(data.before) ? detailSection("F\xF8r", `<p>${escapeHtml4(data.before)}</p>`) : "",
      text4(data.now) ? detailSection("N\xE5", `<p>${escapeHtml4(data.now)}</p>`) : "",
      text4(data.change) ? detailSection("Endring", `<p>${escapeHtml4(data.change)}</p>`) : "",
      lookFor.length ? detailSection("Se etter i dag", `<ul>${lookFor.map((item) => `<li>${escapeHtml4(item)}</li>`).join("")}</ul>`) : ""
    ].join("");
  }
  function renderCanonicalBeforeAfterHtml(place) {
    const content = renderBeforeAfterContentHtml(place);
    if (!content) return "";
    return `
    <section class="hg-section hg-place-before-after-section" data-hg-place-sheet-owner="before-after">
      <h3>F\xF8r/etter</h3>
      ${content}
    </section>
  `;
  }
  function mountCanonicalBeforeAfter(container, place) {
    const html = renderCanonicalBeforeAfterHtml(place);
    container.replaceChildren();
    if (!html) {
      container.hidden = true;
      return null;
    }
    container.hidden = false;
    container.insertAdjacentHTML("beforeend", html);
    return container.querySelector('[data-hg-place-sheet-owner="before-after"]');
  }
  var beforeAfterApi = {
    data: canonicalBeforeAfterData,
    renderContentHtml: renderBeforeAfterContentHtml,
    renderHtml: renderCanonicalBeforeAfterHtml,
    mount: mountCanonicalBeforeAfter
  };
  runtime4.HGPlaceSheetSections = {
    ...runtime4.HGPlaceSheetSections || {},
    beforeAfter: beforeAfterApi
  };

  // js/ui/place-sheet/place-section-context.ts
  var runtime5 = window;
  var cache = /* @__PURE__ */ new Map();
  function text5(value) {
    return String(value == null ? "" : value).trim();
  }
  function list(value) {
    return Array.isArray(value) ? value.filter(Boolean) : [];
  }
  function strings2(value) {
    return list(value).map(text5).filter(Boolean);
  }
  function mainArticle(articles, place) {
    const rows2 = list(articles);
    const placeName = text5(place == null ? void 0 : place.name).toLowerCase();
    return rows2.find((article) => text5((article == null ? void 0 : article.title) || (article == null ? void 0 : article.name)).toLowerCase() === placeName) || rows2.find((article) => /hoved|main|primary/.test([article == null ? void 0 : article.id, article == null ? void 0 : article.type, article == null ? void 0 : article.kind].map((value) => text5(value).toLowerCase()).join(" "))) || rows2[0] || null;
  }
  function visibleArticlesForPlace(articles, main) {
    const rows2 = list(articles);
    if ((main == null ? void 0 : main.suppress_untitled_legacy_articles) !== true) return rows2;
    return rows2.filter((article) => article === main || Boolean(text5((article == null ? void 0 : article.title) || (article == null ? void 0 : article.name) || (article == null ? void 0 : article.label))));
  }
  function classifyArticle(article) {
    var _a, _b;
    const signals = [
      article == null ? void 0 : article.id,
      article == null ? void 0 : article.title,
      article == null ? void 0 : article.name,
      article == null ? void 0 : article.type,
      article == null ? void 0 : article.kind,
      article == null ? void 0 : article.category,
      article == null ? void 0 : article.popupDesc,
      (_a = article == null ? void 0 : article.summary) == null ? void 0 : _a.one_liner,
      ...strings2(article == null ? void 0 : article.tags),
      ...strings2((_b = article == null ? void 0 : article.summary) == null ? void 0 : _b.themes)
    ].map((value) => text5(value).toLowerCase()).join(" ");
    const has = (terms) => terms.some((term) => signals.includes(term));
    if (has(["historical_news", "gamle_nyheter", "gamle nyheter", "avisnotis", "newspaper", "moralpanikk", "old_news"])) return "historical_news";
    if (has(["news_note", "nyere_notis", "nyere notis", "incident", "brann", "politi", "drap"])) return "news_notes";
    if (has(["arrangement", "event", "competition", "sports_event", "stevne", "rekord", "resultat", "statistikk"])) return "events";
    if (has(["object", "objekt", "artifact", "anlegg", "facility", "installation", "infrastructure", "dekke"])) return "objects";
    return "history";
  }
  async function loadArticles(placeId2) {
    var _a, _b, _c, _d;
    if (Object.prototype.hasOwnProperty.call(runtime5.LEKSIKON_BY_PLACE || {}, placeId2)) {
      return list((_a = runtime5.LEKSIKON_BY_PLACE) == null ? void 0 : _a[placeId2]);
    }
    try {
      await ((_c = (_b = runtime5.HGLeksikon) == null ? void 0 : _b.init) == null ? void 0 : _c.call(_b));
    } catch {
    }
    return list((_d = runtime5.LEKSIKON_BY_PLACE) == null ? void 0 : _d[placeId2]);
  }
  function recordReads(place, context) {
    var _a;
    if (!context.visibleArticles.length || typeof ((_a = runtime5.HGLeksikon) == null ? void 0 : _a.leksikonReadRecordsForPlace) !== "function") return;
    try {
      runtime5.HGLeksikon.leksikonReadRecordsForPlace(place, context.placeId).forEach((record) => {
        var _a2, _b;
        return (_b = (_a2 = runtime5.HGReads) == null ? void 0 : _a2.recordLeksikon) == null ? void 0 : _b.call(_a2, record);
      });
    } catch {
    }
  }
  function resolvePlaceKnowledgeContext(place) {
    const placeId2 = text5(place == null ? void 0 : place.id);
    if (!placeId2) return Promise.resolve({
      placeId: "",
      articles: [],
      main: null,
      visibleArticles: [],
      buckets: { history: [], events: [], historical_news: [], news_notes: [], objects: [] }
    });
    const existing = cache.get(placeId2);
    if (existing) return existing;
    const pending = (async () => {
      const articles = await loadArticles(placeId2);
      const main = mainArticle(articles, place);
      const visibleArticles = visibleArticlesForPlace(articles, main);
      const buckets = { history: [], events: [], historical_news: [], news_notes: [], objects: [] };
      visibleArticles.filter((article) => article !== main).forEach((article) => {
        buckets[classifyArticle(article)].push(article);
      });
      const context = { placeId: placeId2, articles, main, visibleArticles, buckets };
      recordReads(place, context);
      return context;
    })();
    cache.set(placeId2, pending);
    return pending;
  }

  // js/ui/place-sheet/sections/news.ts
  var runtime6 = window;
  var hydrationGeneration = 0;
  function text6(value) {
    return String(value == null ? "" : value).trim();
  }
  function rows(value) {
    return Array.isArray(value) ? value.filter((item) => Boolean(item && typeof item === "object" && !Array.isArray(item))) : [];
  }
  function escapeHtml5(value) {
    return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function safeHttpsUrl2(value) {
    var _a;
    const raw = text6(value);
    if (!raw) return "";
    try {
      const parsed = new URL(raw, ((_a = runtime6.location) == null ? void 0 : _a.origin) || void 0);
      return parsed.protocol === "https:" ? parsed.href : "";
    } catch {
      return "";
    }
  }
  function newsCards(items) {
    const values = rows(items);
    if (!values.length) return "";
    return `<div class="hg-place-tab-card-list pc-sheet-news-list">${values.map((item) => {
      var _a;
      const title = text6((item == null ? void 0 : item.title) || (item == null ? void 0 : item.name) || (item == null ? void 0 : item.id) || "Notis");
      const meta = [(item == null ? void 0 : item.date) || (item == null ? void 0 : item.year) || (item == null ? void 0 : item.period), (item == null ? void 0 : item.category) || (item == null ? void 0 : item.type)].map(text6).filter(Boolean).join(" \xB7 ");
      const summary = text6(((_a = item == null ? void 0 : item.summary) == null ? void 0 : _a.one_liner) || (item == null ? void 0 : item.popupDesc) || (item == null ? void 0 : item.desc) || (item == null ? void 0 : item.description));
      const rawSource = Array.isArray(item == null ? void 0 : item.sources) ? item.sources[0] : null;
      const sourceUrl = safeHttpsUrl2(typeof rawSource === "string" ? rawSource : rawSource == null ? void 0 : rawSource.url);
      const sourceLabel = text6(typeof rawSource === "string" ? "Offisiell kilde" : (rawSource == null ? void 0 : rawSource.label) || (rawSource == null ? void 0 : rawSource.title) || "Offisiell kilde");
      return `<article class="hg-place-tab-card pc-sheet-news-card"><strong>${escapeHtml5(title)}</strong>${meta ? `<span>${escapeHtml5(meta)}</span>` : ""}${summary ? `<p>${escapeHtml5(summary)}</p>` : ""}${sourceUrl ? `<a class="hg-place-news-source" href="${escapeHtml5(sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml5(sourceLabel)} \u2197</a>` : ""}</article>`;
    }).join("")}</div>`;
  }
  function detailSection2(title, body2) {
    return body2 ? `<section class="hg-section hg-place-section hg-place-tab-section"><h3>${escapeHtml5(title)}</h3>${body2}</section>` : "";
  }
  function renderNewsContentHtml(historicalNews, newsNotes) {
    const oldRows = rows(historicalNews);
    const newRows = rows(newsNotes);
    return [
      oldRows.length ? detailSection2("Gamle nyheter", newsCards(oldRows)) : "",
      newRows.length ? detailSection2("Nyere notiser", newsCards(newRows)) : ""
    ].join("");
  }
  function renderCanonicalNewsHtml(historicalNews, newsNotes) {
    const content = renderNewsContentHtml(historicalNews, newsNotes);
    if (!content) return "";
    return `
    <section class="hg-section hg-place-news-section" data-hg-place-sheet-owner="news">
      <h3>Nyheter</h3>
      ${content}
    </section>
  `;
  }
  function mountCanonicalNews(container, historicalNews, newsNotes) {
    const html = renderCanonicalNewsHtml(historicalNews, newsNotes);
    container.replaceChildren();
    delete container.dataset.placeId;
    if (!html) {
      container.hidden = true;
      return null;
    }
    container.hidden = false;
    container.insertAdjacentHTML("beforeend", html);
    return container.querySelector('[data-hg-place-sheet-owner="news"]');
  }
  function placeFor(placeId2) {
    var _a, _b;
    const id = text6(placeId2);
    if (!id) return null;
    try {
      const resolved = (_b = (_a = runtime6.HGPlaceOpen) == null ? void 0 : _a.getPlace) == null ? void 0 : _b.call(_a, id);
      if (resolved && typeof resolved === "object") return resolved;
    } catch {
    }
    return (Array.isArray(runtime6.PLACES) ? runtime6.PLACES : []).find((place) => text6(place == null ? void 0 : place.id) === id) || null;
  }
  function slot() {
    return document.querySelector('#placeCard [data-hg-place-sheet-section="news"]');
  }
  function invalidate(target) {
    target.replaceChildren();
    target.hidden = true;
    delete target.dataset.placeId;
  }
  async function hydrate(placeId2) {
    var _a;
    const id = text6(placeId2);
    const place = placeFor(id);
    const target = slot();
    if (!id || !place || !(target instanceof HTMLElement)) return;
    const generation = ++hydrationGeneration;
    invalidate(target);
    const context = await resolvePlaceKnowledgeContext(place);
    if (generation !== hydrationGeneration || !target.isConnected) return;
    const shellId = text6((_a = target.closest('[data-hg-place-sheet-shell="1"]')) == null ? void 0 : _a.dataset.placeId);
    if (shellId && shellId !== id) return;
    const mounted = mountCanonicalNews(target, context.buckets.historical_news, context.buckets.news_notes);
    if (mounted) target.dataset.placeId = id;
  }
  function adoptCanonicalNews(placeId2) {
    const id = text6(placeId2);
    const target = slot();
    if (!id || !(target instanceof HTMLElement)) return null;
    const owner = target.querySelector('[data-hg-place-sheet-owner="news"]');
    if (!target.hidden && text6(target.dataset.placeId) === id && owner instanceof HTMLElement) return target;
    void hydrate(id);
    return null;
  }
  function onUnifiedReady(event) {
    var _a;
    const id = text6((_a = event.detail) == null ? void 0 : _a.placeId);
    if (id) adoptCanonicalNews(id);
  }
  runtime6.addEventListener("hg:place-unified-ready", onUnifiedReady);
  var newsApi = {
    renderContentHtml: renderNewsContentHtml,
    renderHtml: renderCanonicalNewsHtml,
    mount: mountCanonicalNews,
    adopt: adoptCanonicalNews
  };
  runtime6.HGPlaceSheetSections = {
    ...runtime6.HGPlaceSheetSections || {},
    news: newsApi
  };

  // js/ui/place-sheet/sections/reading.ts
  var runtime7 = window;
  var PAYWALL_TERMS = [
    "paywall",
    "subscription",
    "subscriber",
    "abonnement",
    "betalingsmur",
    "krever abonnement"
  ];
  function text7(value) {
    return String(value == null ? "" : value).trim();
  }
  function list2(value) {
    return Array.isArray(value) ? value : [];
  }
  function escapeHtml6(value) {
    return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function safeHttpsUrl3(value) {
    var _a;
    const raw = text7(value);
    if (!raw) return "";
    try {
      const parsed = new URL(raw, ((_a = runtime7.location) == null ? void 0 : _a.origin) || void 0);
      return parsed.protocol === "https:" ? parsed.href : "";
    } catch {
      return "";
    }
  }
  function uniqueBy(items) {
    const seen = /* @__PURE__ */ new Set();
    return items.filter((item) => {
      const key = text7(item == null ? void 0 : item.id) || [item == null ? void 0 : item.title, item == null ? void 0 : item.author, item == null ? void 0 : item.publication, (item == null ? void 0 : item.year) || (item == null ? void 0 : item.date)].map(text7).join("|");
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  function sortYear(item) {
    return Number((item == null ? void 0 : item.year) || String((item == null ? void 0 : item.date) || "").slice(0, 4)) || 0;
  }
  function isOpenReading(item) {
    const access = [item == null ? void 0 : item.access, item == null ? void 0 : item.access_note, item == null ? void 0 : item.note].map((value) => text7(value).toLowerCase()).join(" ");
    return !PAYWALL_TERMS.some((term) => access.includes(term));
  }
  function filterReadingForPlace(items, placeId2) {
    const id = text7(placeId2);
    if (!id) return [];
    return uniqueBy(list2(items).filter((item) => list2(item == null ? void 0 : item.place_ids).map(text7).includes(id) && isOpenReading(item))).sort((a, b) => sortYear(b) - sortYear(a));
  }
  function readingCards(rows2) {
    return `<div class="hg-place-reading-list pc-sheet-reading-list">${rows2.map((item) => {
      const url = safeHttpsUrl3(item == null ? void 0 : item.url);
      const meta = [item == null ? void 0 : item.author, item == null ? void 0 : item.publication, (item == null ? void 0 : item.year) || (item == null ? void 0 : item.date), item == null ? void 0 : item.type].map(text7).filter(Boolean).join(" \xB7 ");
      const relevance = text7(item == null ? void 0 : item.relevance);
      return `<article class="hg-place-reading-card pc-sheet-reading-card"><strong>${escapeHtml6((item == null ? void 0 : item.title) || "Uten tittel")}</strong>${meta ? `<span>${escapeHtml6(meta)}</span>` : ""}${relevance ? `<p>${escapeHtml6(relevance)}</p>` : ""}${url ? `<a href="${escapeHtml6(url)}" target="_blank" rel="noopener noreferrer">Les teksten \u2197</a>` : ""}</article>`;
    }).join("")}</div>`;
  }
  function renderReadingContentHtml(items, placeId2) {
    const rows2 = filterReadingForPlace(items, placeId2);
    return rows2.length ? readingCards(rows2) : "";
  }
  function renderCanonicalReadingHtml(items, placeId2) {
    const content = renderReadingContentHtml(items, placeId2);
    if (!content) return "";
    return `
    <section class="hg-section hg-place-reading-section pc-sheet-canonical-reading" data-hg-place-sheet-owner="reading">
      <h3>Lesespor</h3>
      ${content}
    </section>
  `;
  }
  function mountCanonicalReading(container, items, placeId2) {
    const html = renderCanonicalReadingHtml(items, placeId2);
    container.replaceChildren();
    delete container.dataset.placeId;
    if (!html) {
      container.hidden = true;
      return null;
    }
    container.hidden = false;
    container.insertAdjacentHTML("beforeend", html);
    return container.querySelector('[data-hg-place-sheet-owner="reading"]');
  }
  function canonicalReading(placeId2) {
    var _a, _b, _c;
    return list2((_c = (_b = (_a = runtime7.HGPlaceOpen) == null ? void 0 : _a.get) == null ? void 0 : _b.call(_a, placeId2)) == null ? void 0 : _c.lesespor);
  }
  async function resolveReading(placeId2) {
    var _a, _b;
    const id = text7(placeId2);
    if (!id) return [];
    const canonical = canonicalReading(id);
    if (canonical.length) return canonical;
    try {
      const value = await ((_b = (_a = runtime7.DataHub) == null ? void 0 : _a.loadLesespor) == null ? void 0 : _b.call(_a, { cache: "default" }));
      const aggregate = Array.isArray(value == null ? void 0 : value.items) ? value.items : list2(value);
      return uniqueBy([...aggregate, ...canonicalReading(id)]);
    } catch {
      return canonicalReading(id);
    }
  }
  function ensureStylesheet() {
    if (document.querySelector('link[data-hg-place-sheet-reading-style="1"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "css/place-sheet-reading.css";
    link.setAttribute("data-hg-place-sheet-reading-style", "1");
    document.head.appendChild(link);
  }
  function ensureReadingSlot() {
    const shell4 = document.querySelector('#placeCard [data-hg-place-sheet-shell="1"]');
    if (!(shell4 instanceof HTMLElement)) return null;
    let slot2 = shell4.querySelector("[data-hg-place-sheet-reading]");
    if (!(slot2 instanceof HTMLElement)) {
      slot2 = document.createElement("section");
      slot2.className = "pc-sheet-reading";
      slot2.setAttribute("data-hg-place-sheet-reading", "1");
      slot2.setAttribute("data-hg-place-sheet-section", "reading");
      slot2.setAttribute("data-place-panel", "reading");
      slot2.hidden = true;
      const news = shell4.querySelector("[data-hg-place-sheet-news]");
      if (news == null ? void 0 : news.nextSibling) shell4.insertBefore(slot2, news.nextSibling);
      else shell4.appendChild(slot2);
    }
    return slot2;
  }
  var hydrationGeneration2 = 0;
  function invalidate2(slot2) {
    slot2.replaceChildren();
    slot2.hidden = true;
    delete slot2.dataset.placeId;
  }
  async function hydrateUnifiedReading(placeId2) {
    var _a;
    const id = text7(placeId2);
    if (!id) return;
    const generation = ++hydrationGeneration2;
    const slot2 = ensureReadingSlot();
    if (!(slot2 instanceof HTMLElement)) return;
    invalidate2(slot2);
    const items = await resolveReading(id);
    if (generation !== hydrationGeneration2 || !slot2.isConnected) return;
    const shellId = text7((_a = slot2.closest('[data-hg-place-sheet-shell="1"]')) == null ? void 0 : _a.dataset.placeId);
    if (shellId && shellId !== id) return;
    const mounted = mountCanonicalReading(slot2, items, id);
    if (mounted) slot2.dataset.placeId = id;
  }
  function adoptCanonicalReading(placeId2) {
    const id = text7(placeId2);
    const slot2 = ensureReadingSlot();
    if (!id || !(slot2 instanceof HTMLElement)) return null;
    const owner = slot2.querySelector('[data-hg-place-sheet-owner="reading"]');
    if (!slot2.hidden && text7(slot2.dataset.placeId) === id && owner instanceof HTMLElement) return slot2;
    void hydrateUnifiedReading(id);
    return null;
  }
  function onUnifiedReady2(event) {
    var _a;
    const id = text7((_a = event.detail) == null ? void 0 : _a.placeId);
    if (id) adoptCanonicalReading(id);
  }
  ensureStylesheet();
  runtime7.addEventListener("hg:place-unified-ready", onUnifiedReady2);
  var readingApi = {
    filterForPlace: filterReadingForPlace,
    renderContentHtml: renderReadingContentHtml,
    renderHtml: renderCanonicalReadingHtml,
    mount: mountCanonicalReading,
    resolve: resolveReading,
    adopt: adoptCanonicalReading
  };
  runtime7.HGPlaceSheetSections = {
    ...runtime7.HGPlaceSheetSections || {},
    reading: readingApi
  };

  // js/ui/place-sheet/sections/language.ts
  var runtime8 = window;
  var hydrationGeneration3 = 0;
  function text8(value) {
    return String(value == null ? "" : value).trim();
  }
  function ensureStylesheet2() {
    if (document.querySelector('link[data-hg-place-sheet-language-style="1"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "css/place-sheet-language.css";
    link.setAttribute("data-hg-place-sheet-language-style", "1");
    document.head.appendChild(link);
  }
  function placeSheetShell() {
    return document.querySelector('#placeCard [data-hg-place-sheet-shell="1"]');
  }
  function ensureLanguageSlot() {
    const shell4 = placeSheetShell();
    if (!(shell4 instanceof HTMLElement)) return null;
    let slot2 = shell4.querySelector('[data-hg-place-sheet-language="1"]');
    if (!(slot2 instanceof HTMLElement)) {
      slot2 = document.createElement("section");
      slot2.className = "pc-sheet-language";
      slot2.setAttribute("data-hg-place-sheet-language", "1");
      slot2.setAttribute("data-hg-place-sheet-section", "language");
      slot2.setAttribute("data-place-panel", "language");
      slot2.hidden = true;
      const reading = shell4.querySelector('[data-hg-place-sheet-section="reading"]');
      const news = shell4.querySelector('[data-hg-place-sheet-section="news"]');
      const anchor = reading || news;
      if (anchor == null ? void 0 : anchor.nextSibling) shell4.insertBefore(slot2, anchor.nextSibling);
      else shell4.appendChild(slot2);
    }
    return slot2;
  }
  function placeFor2(placeId2) {
    var _a, _b;
    const id = text8(placeId2);
    if (!id) return null;
    try {
      const resolved = (_b = (_a = runtime8.HGPlaceOpen) == null ? void 0 : _a.getPlace) == null ? void 0 : _b.call(_a, id);
      if (resolved && typeof resolved === "object") return resolved;
    } catch {
    }
    return (Array.isArray(runtime8.PLACES) ? runtime8.PLACES : []).find((place) => text8(place == null ? void 0 : place.id) === id) || null;
  }
  function directScaffold() {
    const compat = document.createElement("div");
    compat.className = "pc-sheet-language-compat hg-place-popup-v2";
    compat.setAttribute("data-hg-place-sheet-language-compat", "1");
    compat.setAttribute("data-hg-language-layer", "1");
    compat.innerHTML = `
    <div class="hg-popup place-popup-v2" data-hg-place-sheet-language-scaffold="1">
      <article class="hg-place-popup-v2" data-hg-place-tabs="1">
        <nav class="hg-place-tabs" role="tablist" aria-label="Spr\xE5k"></nav>
        <div class="hg-place-tab-panels">
          <section class="hg-place-tab-panel" data-place-panel="more" hidden></section>
        </div>
      </article>
    </div>
  `;
    return compat;
  }
  async function hydrate2(placeId2) {
    var _a, _b;
    const id = text8(placeId2);
    const place = placeFor2(id);
    const slot2 = ensureLanguageSlot();
    const decorate = (_a = runtime8.HGLanguageLayer) == null ? void 0 : _a.decoratePopup;
    if (!id || !place || !(slot2 instanceof HTMLElement) || typeof decorate !== "function") return;
    const generation = ++hydrationGeneration3;
    slot2.hidden = true;
    delete slot2.dataset.placeId;
    const compat = directScaffold();
    slot2.replaceChildren(compat);
    const popup = compat.querySelector('[data-hg-place-sheet-language-scaffold="1"]');
    if (!(popup instanceof HTMLElement)) return;
    try {
      const result = decorate(place, popup);
      if (result && typeof result.then === "function") await result;
    } catch {
    }
    if (generation !== hydrationGeneration3 || !slot2.isConnected) return;
    const shellId = text8((_b = slot2.closest('[data-hg-place-sheet-shell="1"]')) == null ? void 0 : _b.dataset.placeId);
    if (shellId && shellId !== id) return;
    const panel = compat.querySelector('.hg-place-language-panel[data-place-panel="language"]');
    if (!(panel instanceof HTMLElement)) {
      slot2.replaceChildren();
      slot2.hidden = true;
      delete slot2.dataset.placeId;
      return;
    }
    panel.hidden = false;
    panel.removeAttribute("aria-hidden");
    panel.removeAttribute("aria-labelledby");
    panel.setAttribute("role", "region");
    panel.setAttribute("data-hg-place-sheet-owner", "language");
    panel.style.scrollMarginTop = "76px";
    compat.replaceChildren(panel);
    slot2.dataset.placeId = id;
    slot2.hidden = false;
  }
  function adoptCanonicalLanguage(placeId2) {
    const id = text8(placeId2);
    if (!id) return null;
    const slot2 = ensureLanguageSlot();
    if (!(slot2 instanceof HTMLElement)) return null;
    const owner = slot2.querySelector('[data-hg-place-sheet-owner="language"]');
    if (!slot2.hidden && text8(slot2.dataset.placeId) === id && owner instanceof HTMLElement) return slot2;
    void hydrate2(id);
    return null;
  }
  function onUnifiedReady3(event) {
    var _a;
    const id = text8((_a = event.detail) == null ? void 0 : _a.placeId);
    if (id) adoptCanonicalLanguage(id);
  }
  ensureStylesheet2();
  runtime8.addEventListener("hg:place-unified-ready", onUnifiedReady3);
  runtime8.HGPlaceSheetSections = {
    ...runtime8.HGPlaceSheetSections || {},
    language: { adopt: adoptCanonicalLanguage }
  };

  // js/ui/place-sheet/sections/sources.ts
  var runtime9 = window;
  var hydrationGeneration4 = 0;
  function text9(value) {
    return String(value == null ? "" : value).trim();
  }
  function list3(value) {
    return Array.isArray(value) ? value.filter(Boolean) : [];
  }
  function strings3(value) {
    return list3(value).map(text9).filter(Boolean);
  }
  function escapeHtml7(value) {
    return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function safeHttpsUrl4(value) {
    var _a;
    const raw = text9(value);
    if (!raw) return "";
    try {
      const parsed = new URL(raw, ((_a = runtime9.location) == null ? void 0 : _a.origin) || void 0);
      return parsed.protocol === "https:" ? parsed.href : "";
    } catch {
      return "";
    }
  }
  function uniqueBy2(values, key) {
    const seen = /* @__PURE__ */ new Set();
    return values.filter((value) => {
      const id = key(value);
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }
  function humanize(value) {
    const raw = text9(value).replace(/_/g, " ").replace(/\s+/g, " ");
    return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : "";
  }
  function renderCanonicalSourcesHtml(place, articles = []) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
    const sourceProfile = (place == null ? void 0 : place.source_summary) && typeof place.source_summary === "object" ? place.source_summary : (place == null ? void 0 : place.sourceSummary) || {};
    const labels = uniqueBy2(strings3((sourceProfile == null ? void 0 : sourceProfile.safe_sources) || (sourceProfile == null ? void 0 : sourceProfile.sources)), (value) => value);
    const configuredLinks = [place, ...list3(articles)].flatMap((value) => list3(value == null ? void 0 : value.externalLinks)).map((link) => ({
      type: text9((link == null ? void 0 : link.type) || "source"),
      label: text9((link == null ? void 0 : link.label) || (link == null ? void 0 : link.title)),
      url: safeHttpsUrl4(link == null ? void 0 : link.url)
    }));
    const beforeAfterLinks = [
      ...strings3(((_a = place == null ? void 0 : place.for_na) == null ? void 0 : _a.sources) || ((_b = place == null ? void 0 : place.for_na) == null ? void 0 : _b.kilder) || ((_c = place == null ? void 0 : place.for_na) == null ? void 0 : _c.source)),
      text9(((_e = (_d = place == null ? void 0 : place.for_na) == null ? void 0 : _d.beforeImageMeta) == null ? void 0 : _e.sourcePage) || ((_g = (_f = place == null ? void 0 : place.for_na) == null ? void 0 : _f.before_image_meta) == null ? void 0 : _g.sourcePage)),
      text9(((_i = (_h = place == null ? void 0 : place.for_na) == null ? void 0 : _h.nowImageMeta) == null ? void 0 : _i.sourcePage) || ((_k = (_j = place == null ? void 0 : place.for_na) == null ? void 0 : _j.now_image_meta) == null ? void 0 : _k.sourcePage))
    ].map((url) => ({ type: "image_source", label: "Bilde- og sammenligningskilde", url: safeHttpsUrl4(url) }));
    const links = uniqueBy2([...configuredLinks, ...beforeAfterLinks].filter((link) => link.url), (link) => link.url);
    return `
    <section class="hg-section hg-place-sources-section pc-sheet-canonical-sources" data-hg-place-sheet-owner="sources">
      <h3>Kilder</h3>
      ${labels.length ? `<section class="hg-section hg-place-section hg-place-tab-section"><h4>Kilder i stedprofilen</h4><ul class="hg-place-source-list">${labels.map((label) => `<li>${escapeHtml7(label)}</li>`).join("")}</ul></section>` : ""}
      ${links.length ? `<section class="hg-section hg-place-section hg-place-tab-section"><h4>Kilder og eksterne oppslag</h4><div class="hg-place-source-link-list">${links.map((link) => `<a href="${escapeHtml7(link.url)}" target="_blank" rel="noopener noreferrer"><strong>${escapeHtml7(link.label || link.url)}</strong><span>${escapeHtml7(humanize(link.type))} \u2197</span></a>`).join("")}</div></section>` : ""}
      ${!labels.length && !links.length ? '<div class="hg-place-tab-empty">Ingen brukerrettede kilder er registrert for dette stedet enn\xE5.</div>' : ""}
    </section>
  `;
  }
  function shell() {
    return document.querySelector('#placeCard [data-hg-place-sheet-shell="1"]');
  }
  function ensureStylesheet3() {
    if (document.querySelector('link[data-hg-place-sheet-sources-style="1"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "css/place-sheet-sources.css";
    link.setAttribute("data-hg-place-sheet-sources-style", "1");
    document.head.appendChild(link);
  }
  function ensureSlot() {
    const root2 = shell();
    if (!(root2 instanceof HTMLElement)) return null;
    let slot2 = root2.querySelector('[data-hg-place-sheet-sources="1"]');
    if (!(slot2 instanceof HTMLElement)) {
      slot2 = document.createElement("section");
      slot2.className = "pc-sheet-sources";
      slot2.setAttribute("data-hg-place-sheet-sources", "1");
      slot2.setAttribute("data-hg-place-sheet-section", "sources");
      slot2.hidden = true;
      const learning = root2.querySelector('[data-hg-place-sheet-section="learning"]');
      const language = root2.querySelector('[data-hg-place-sheet-section="language"]');
      const reading = root2.querySelector('[data-hg-place-sheet-section="reading"]');
      const news = root2.querySelector('[data-hg-place-sheet-section="news"]');
      const anchor = learning || language || reading || news;
      if (anchor == null ? void 0 : anchor.nextSibling) root2.insertBefore(slot2, anchor.nextSibling);
      else root2.appendChild(slot2);
    }
    return slot2;
  }
  function placeFor3(placeId2) {
    var _a, _b;
    const id = text9(placeId2);
    if (!id) return null;
    try {
      const resolved = (_b = (_a = runtime9.HGPlaceOpen) == null ? void 0 : _a.getPlace) == null ? void 0 : _b.call(_a, id);
      if (resolved && typeof resolved === "object") return resolved;
    } catch {
    }
    return (Array.isArray(runtime9.PLACES) ? runtime9.PLACES : []).find((place) => text9(place == null ? void 0 : place.id) === id) || null;
  }
  function invalidate3(slot2) {
    slot2.replaceChildren();
    slot2.hidden = true;
    delete slot2.dataset.placeId;
  }
  async function hydrate3(placeId2) {
    var _a;
    const id = text9(placeId2);
    const place = placeFor3(id);
    const slot2 = ensureSlot();
    if (!id || !place || !(slot2 instanceof HTMLElement)) return;
    const generation = ++hydrationGeneration4;
    invalidate3(slot2);
    const context = await resolvePlaceKnowledgeContext(place);
    if (generation !== hydrationGeneration4 || !slot2.isConnected) return;
    const shellId = text9((_a = slot2.closest('[data-hg-place-sheet-shell="1"]')) == null ? void 0 : _a.dataset.placeId);
    if (shellId && shellId !== id) return;
    slot2.innerHTML = renderCanonicalSourcesHtml(place, context.visibleArticles);
    slot2.dataset.placeId = id;
    slot2.hidden = false;
  }
  function adoptCanonicalSources(placeId2) {
    const id = text9(placeId2);
    const slot2 = ensureSlot();
    if (!id || !(slot2 instanceof HTMLElement)) return null;
    const owner = slot2.querySelector('[data-hg-place-sheet-owner="sources"]');
    if (!slot2.hidden && text9(slot2.dataset.placeId) === id && owner instanceof HTMLElement) return slot2;
    void hydrate3(id);
    return null;
  }
  function onUnifiedReady4(event) {
    var _a;
    const id = text9((_a = event.detail) == null ? void 0 : _a.placeId);
    if (id) adoptCanonicalSources(id);
  }
  ensureStylesheet3();
  runtime9.addEventListener("hg:place-unified-ready", onUnifiedReady4);
  runtime9.HGPlaceSheetSections = {
    ...runtime9.HGPlaceSheetSections || {},
    sources: { renderHtml: renderCanonicalSourcesHtml, adopt: adoptCanonicalSources }
  };

  // js/ui/place-sheet/sections/learning.ts
  var runtime10 = window;
  var hydrationGeneration5 = 0;
  function text10(value) {
    return String(value == null ? "" : value).trim();
  }
  function ensureStylesheet4() {
    if (document.querySelector('link[data-hg-place-sheet-learning-style="1"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "css/place-sheet-learning.css";
    link.setAttribute("data-hg-place-sheet-learning-style", "1");
    document.head.appendChild(link);
  }
  function shell2() {
    return document.querySelector('#placeCard [data-hg-place-sheet-shell="1"]');
  }
  function ensureSlot2() {
    const root2 = shell2();
    if (!(root2 instanceof HTMLElement)) return null;
    let slot2 = root2.querySelector('[data-hg-place-sheet-learning="1"], [data-hg-place-sheet-section="learning"]');
    if (!(slot2 instanceof HTMLElement)) {
      slot2 = document.createElement("section");
      slot2.hidden = true;
      const language = root2.querySelector('[data-hg-place-sheet-section="language"]');
      const reading = root2.querySelector('[data-hg-place-sheet-section="reading"]');
      const news = root2.querySelector('[data-hg-place-sheet-section="news"]');
      const anchor = language || reading || news;
      if (anchor == null ? void 0 : anchor.nextSibling) root2.insertBefore(slot2, anchor.nextSibling);
      else root2.appendChild(slot2);
    }
    slot2.classList.add("pc-sheet-learning");
    slot2.setAttribute("data-hg-place-sheet-learning", "1");
    slot2.setAttribute("data-hg-place-sheet-section", "learning");
    return slot2;
  }
  function placeFor4(placeId2) {
    var _a, _b;
    const id = text10(placeId2);
    if (!id) return null;
    try {
      const resolved = (_b = (_a = runtime10.HGPlaceOpen) == null ? void 0 : _a.getPlace) == null ? void 0 : _b.call(_a, id);
      if (resolved && typeof resolved === "object") return resolved;
    } catch {
    }
    return (Array.isArray(runtime10.PLACES) ? runtime10.PLACES : []).find((place) => text10(place == null ? void 0 : place.id) === id) || null;
  }
  function invalidate4(slot2) {
    slot2.replaceChildren();
    slot2.hidden = true;
    delete slot2.dataset.placeId;
  }
  async function hydrate4(placeId2) {
    var _a;
    const id = text10(placeId2);
    const place = placeFor4(id);
    const slot2 = ensureSlot2();
    const api = runtime10.HGPlaceLearningSurface;
    if (!id || !place || !(slot2 instanceof HTMLElement) || typeof (api == null ? void 0 : api.loadRegistry) !== "function" || typeof (api == null ? void 0 : api.renderLearningSection) !== "function") return;
    const generation = ++hydrationGeneration5;
    invalidate4(slot2);
    let registry = null;
    try {
      registry = await api.loadRegistry();
    } catch {
    }
    if (generation !== hydrationGeneration5 || !slot2.isConnected || !registry) return;
    const shellId = text10((_a = slot2.closest('[data-hg-place-sheet-shell="1"]')) == null ? void 0 : _a.dataset.placeId);
    if (shellId && shellId !== id) return;
    let rendered = "";
    try {
      rendered = text10(api.renderLearningSection(registry, place));
    } catch {
    }
    if (!rendered) return;
    const compat = document.createElement("div");
    compat.className = "pc-sheet-learning-compat hg-place-popup-v2";
    compat.setAttribute("data-hg-place-sheet-learning-compat", "1");
    compat.innerHTML = `<section data-hg-place-sheet-owner="learning" data-place-id="${id.replace(/"/g, "&quot;")}">${rendered}</section>`;
    slot2.replaceChildren(compat);
    slot2.dataset.placeId = id;
    slot2.hidden = false;
  }
  function adoptCanonicalLearning(placeId2) {
    const id = text10(placeId2);
    const slot2 = ensureSlot2();
    if (!id || !(slot2 instanceof HTMLElement)) return null;
    const owner = slot2.querySelector('[data-hg-place-sheet-owner="learning"]');
    if (!slot2.hidden && text10(slot2.dataset.placeId) === id && owner instanceof HTMLElement) return slot2;
    void hydrate4(id);
    return null;
  }
  function onUnifiedReady5(event) {
    var _a;
    const id = text10((_a = event.detail) == null ? void 0 : _a.placeId);
    if (id) adoptCanonicalLearning(id);
  }
  ensureStylesheet4();
  runtime10.addEventListener("hg:place-unified-ready", onUnifiedReady5);
  runtime10.HGPlaceSheetSections = {
    ...runtime10.HGPlaceSheetSections || {},
    learning: { adopt: adoptCanonicalLearning }
  };

  // js/ui/place-sheet/sections/special-sections.ts
  var runtime11 = window;
  function text11(value) {
    return String(value == null ? "" : value).trim();
  }
  function list4(value) {
    return Array.isArray(value) ? value : [];
  }
  function object(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }
  function escapeHtml8(value) {
    return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function humanize2(value) {
    const raw = text11(value).replace(/_/g, " ").replace(/\s+/g, " ");
    return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : "";
  }
  function unique(values) {
    return [...new Set(values.map(text11).filter(Boolean))];
  }
  function chips(values, maxItems = 18) {
    const items = unique(list4(values)).slice(0, maxItems);
    if (!items.length) return "";
    return `<div class="hg-place-chip-list">${items.map((item) => `<span class="hg-place-chip">${escapeHtml8(humanize2(item))}</span>`).join("")}</div>`;
  }
  function renderNature(place) {
    const profile = object((place == null ? void 0 : place.nature_profile) || (place == null ? void 0 : place.natureProfile));
    if (!Object.keys(profile).length) return "";
    const birding = object(profile.birding);
    const terrain = list4(profile.terrain);
    const habitats = list4(profile.habitats || profile.habitat_types || profile.nature_types);
    const species = list4(birding.notable_species || profile.notable_species || profile.species);
    const seasons = list4(birding.seasonal_focus || profile.seasonal_focus);
    const summary = text11(profile.summary || profile.description);
    if (!terrain.length && !habitats.length && !species.length && !seasons.length && !summary) return "";
    return `
    <section class="hg-section hg-place-section hg-place-nature-section" data-hg-place-sheet-special-owner="nature-landscape">
      <h3>Natur og landskap</h3>
      ${summary ? `<p class="hg-place-nature-summary">${escapeHtml8(summary)}</p>` : ""}
      <div class="hg-place-nature-grid">
        ${terrain.length || habitats.length ? `<div class="hg-place-nature-block"><h4>Terreng og naturtyper</h4>${chips([...terrain, ...habitats])}</div>` : ""}
        ${species.length ? `<div class="hg-place-nature-block"><h4>Artsliv <span>${species.length}</span></h4>${chips(species)}</div>` : ""}
        ${seasons.length ? `<div class="hg-place-nature-block"><h4>Beste observasjonstid</h4>${chips(seasons, 8)}</div>` : ""}
      </div>
    </section>
  `;
  }
  function hasTrainingContent(place) {
    var _a;
    if (!place) return false;
    const profile = object(place == null ? void 0 : place.training_profile);
    if (!Object.keys(profile).length) return false;
    const hasContent = Boolean(text11(profile.summary) || text11(profile.safety) || list4(profile.exercises).filter(Boolean).length);
    if (!hasContent) return false;
    try {
      if (typeof ((_a = runtime11.HGPlacePopupSportTraining) == null ? void 0 : _a.isSportsPlace) === "function") {
        return runtime11.HGPlacePopupSportTraining.isSportsPlace(place) === true;
      }
    } catch {
    }
    const category = text11((place == null ? void 0 : place.category) || (place == null ? void 0 : place.categoryId)).toLowerCase();
    return category === "sport" || Boolean(Object.keys(object(place == null ? void 0 : place.sport_profile)).length);
  }
  function renderTraining(place) {
    var _a, _b;
    if (!hasTrainingContent(place)) return "";
    try {
      const html = text11((_b = (_a = runtime11.HGPlacePopupSportTraining) == null ? void 0 : _a.render) == null ? void 0 : _b.call(_a, place));
      if (html) return html.replace('data-hg-sport-training="1"', 'data-hg-sport-training="1" data-hg-place-sheet-special-owner="sport-training"');
    } catch {
    }
    return "";
  }
  function shell3() {
    return document.querySelector('#placeCard [data-hg-place-sheet-shell="1"]');
  }
  function placeFor5(placeId2) {
    var _a, _b;
    const id = text11(placeId2);
    if (!id) return null;
    try {
      const resolved = (_b = (_a = runtime11.HGPlaceOpen) == null ? void 0 : _a.getPlace) == null ? void 0 : _b.call(_a, id);
      if (resolved && typeof resolved === "object") return resolved;
    } catch {
    }
    return list4(runtime11.PLACES).find((place) => text11(place == null ? void 0 : place.id) === id) || null;
  }
  function ensureStylesheet5() {
    if (document.querySelector('link[data-hg-place-sheet-special-style="1"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "css/place-sheet-special.css";
    link.setAttribute("data-hg-place-sheet-special-style", "1");
    document.head.appendChild(link);
  }
  function ensureSlot3(placeId2) {
    const root2 = shell3();
    if (!(root2 instanceof HTMLElement)) return null;
    let slot2 = root2.querySelector('[data-hg-place-sheet-special="1"]');
    if (!(slot2 instanceof HTMLElement)) {
      slot2 = document.createElement("section");
      slot2.className = "pc-sheet-special";
      slot2.setAttribute("data-hg-place-sheet-special", "1");
      slot2.setAttribute("data-hg-place-sheet-section", "special");
      slot2.hidden = true;
      const sources = root2.querySelector('[data-hg-place-sheet-section="sources"]');
      if (sources == null ? void 0 : sources.nextSibling) root2.insertBefore(slot2, sources.nextSibling);
      else root2.appendChild(slot2);
    }
    slot2.dataset.placeId = text11(placeId2);
    return slot2;
  }
  function specialSectionsApply(placeId2) {
    const place = placeFor5(placeId2);
    if (!place) return false;
    return Boolean(renderNature(place) || hasTrainingContent(place));
  }
  function adoptCanonicalSpecialSections(placeId2) {
    const id = text11(placeId2);
    const place = placeFor5(id);
    const slot2 = ensureSlot3(id);
    if (!id || !place || !(slot2 instanceof HTMLElement)) return null;
    const html = [renderNature(place), renderTraining(place)].filter(Boolean).join("");
    slot2.innerHTML = html;
    slot2.hidden = !html;
    return html ? slot2 : null;
  }
  function onUnifiedReady6(event) {
    var _a;
    const id = text11((_a = event.detail) == null ? void 0 : _a.placeId);
    if (id && specialSectionsApply(id)) adoptCanonicalSpecialSections(id);
  }
  ensureStylesheet5();
  runtime11.addEventListener("hg:place-unified-ready", onUnifiedReady6);
  runtime11.HGPlaceSheetSections = {
    ...runtime11.HGPlaceSheetSections || {},
    special: {
      applies: specialSectionsApply,
      adopt: adoptCanonicalSpecialSections
    }
  };

  // js/ui/place-sheet/place-section-registry.ts
  var PLACE_SHEET_SECTION_IDS = [
    "about",
    "history",
    "stories",
    "before-after",
    "news",
    "reading",
    "language",
    "learning",
    "sources",
    "special"
  ];
  var PLACE_SHEET_IMMEDIATE_SECTION_IDS = [
    "about",
    "history",
    "stories",
    "before-after"
  ];
  var PLACE_SHEET_COMPAT_SECTION_BATCHES = [
    ["special"],
    ["news", "reading"],
    ["language", "learning"],
    ["sources"]
  ];
  var runtime12 = window;
  function text12(value) {
    return String(value == null ? "" : value).trim();
  }
  function placeSheetSectionNode(id) {
    const root2 = document.getElementById("placeCard");
    if (!(root2 instanceof HTMLElement)) return null;
    const direct = root2.querySelector(`[data-hg-place-sheet-section="${id}"]`);
    if (direct instanceof HTMLElement) return direct;
    const compatibility = root2.querySelector(`[data-hg-unified-section="${id}"], [data-place-panel="${id}"]`);
    return compatibility instanceof HTMLElement ? compatibility : null;
  }
  function hasRenderedPlaceSheetSection(id) {
    const node = placeSheetSectionNode(id);
    if (!(node instanceof HTMLElement) || node.hidden) return false;
    if (text12(node.dataset.placeId)) return true;
    if (node.querySelector("[data-hg-place-sheet-owner], [data-hg-place-sheet-special-owner], .hg-place-learning-section, [data-language-place], .hg-place-tab-generated")) return true;
    return text12(node.textContent).length > 0;
  }
  function placeSheetSectionApplies(id, placeId2) {
    var _a;
    const api = (_a = runtime12.HGPlaceSheetSections) == null ? void 0 : _a[id];
    if (!api || typeof api.applies !== "function") return true;
    try {
      return api.applies(placeId2) === true;
    } catch {
      return false;
    }
  }
  function nudgePlaceSheetSection(id, placeId2) {
    var _a;
    const api = (_a = runtime12.HGPlaceSheetSections) == null ? void 0 : _a[id];
    if (!api || typeof api.adopt !== "function") return;
    try {
      api.adopt(placeId2);
    } catch {
    }
  }

  // js/ui/place-sheet/place-sheet-state.ts
  var runtime13 = window;
  var generationCounter = 0;
  var active = null;
  function cloneSnapshot(value) {
    return {
      generation: value.generation,
      placeId: value.placeId,
      phase: value.phase,
      sections: { ...value.sections }
    };
  }
  function root() {
    return document.getElementById("placeCard");
  }
  function emit(name, value) {
    try {
      runtime13.dispatchEvent(new CustomEvent(name, { detail: cloneSnapshot(value) }));
    } catch {
    }
  }
  function syncRoot(value) {
    const card2 = root();
    if (!(card2 instanceof HTMLElement)) return;
    card2.dataset.hgPlaceSheetRenderGeneration = String(value.generation);
    card2.dataset.hgPlaceSheetRenderPlaceId = value.placeId;
    card2.dataset.hgPlaceSheetRenderState = value.phase;
  }
  function beginPlaceSheetGeneration(placeId2) {
    cancelPlaceSheetGeneration();
    const controller = new AbortController();
    const sections = Object.fromEntries(
      PLACE_SHEET_SECTION_IDS.map((id) => [id, "pending"])
    );
    active = {
      generation: ++generationCounter,
      placeId: placeId2,
      phase: "opening",
      sections,
      controller
    };
    syncRoot(active);
    emit("hg:place-sheet-state", active);
    return { generation: active.generation, placeId: placeId2, signal: controller.signal };
  }
  function isActivePlaceSheetGeneration(generation, placeId2) {
    return Boolean(active && !active.controller.signal.aborted && active.generation === generation && active.placeId === placeId2);
  }
  function markPlaceSheetPhase(generation, placeId2, phase) {
    if (!isActivePlaceSheetGeneration(generation, placeId2) || !active) return false;
    active.phase = phase;
    syncRoot(active);
    emit("hg:place-sheet-state", active);
    if (phase === "full-ready") emit("hg:place-sheet-full-ready", active);
    return true;
  }
  function markPlaceSheetSection(generation, placeId2, id, status) {
    if (!isActivePlaceSheetGeneration(generation, placeId2) || !active) return false;
    active.sections[id] = status;
    const node = document.querySelector(`#placeCard [data-hg-place-sheet-section="${id}"]`);
    if (node instanceof HTMLElement) node.dataset.hgPlaceSheetRenderState = status;
    emit("hg:place-sheet-state", active);
    return true;
  }
  function currentPlaceSheetSnapshot() {
    return active ? cloneSnapshot(active) : null;
  }
  function cancelPlaceSheetGeneration() {
    if (active && !active.controller.signal.aborted) active.controller.abort();
    active = null;
    const card2 = root();
    if (card2 instanceof HTMLElement) {
      delete card2.dataset.hgPlaceSheetRenderGeneration;
      delete card2.dataset.hgPlaceSheetRenderPlaceId;
      delete card2.dataset.hgPlaceSheetRenderState;
    }
  }
  runtime13.HGPlaceSheetState = {
    snapshot: currentPlaceSheetSnapshot,
    cancel: cancelPlaceSheetGeneration
  };

  // js/ui/place-sheet/place-sheet-render-queue.ts
  var runtime14 = window;
  var compatibilityReady = /* @__PURE__ */ new Set();
  var compatibilityWaiters = /* @__PURE__ */ new Map();
  var promotedSections = /* @__PURE__ */ new Map();
  var pendingPromotions = /* @__PURE__ */ new Map();
  var COMPATIBILITY_SECTION_IDS = new Set(PLACE_SHEET_COMPAT_SECTION_BATCHES.flat());
  var activeHandle = null;
  function text13(value) {
    return String(value == null ? "" : value).trim();
  }
  function canonicalSectionId(value) {
    const id = text13(value);
    return PLACE_SHEET_SECTION_IDS.includes(id) ? id : null;
  }
  function isTerminalStatus(value) {
    return value === "rendered" || value === "omitted" || value === "failed";
  }
  function sectionStatus(generation, placeId2, id) {
    const snapshot = currentPlaceSheetSnapshot();
    if (!snapshot || snapshot.generation !== generation || snapshot.placeId !== placeId2) return "";
    return snapshot.sections[id] || "";
  }
  async function yieldToBrowser(signal) {
    if (signal.aborted) return;
    const scheduler = runtime14.scheduler;
    if (scheduler && typeof scheduler.postTask === "function") {
      try {
        await scheduler.postTask(() => void 0, { priority: "background", signal });
        return;
      } catch {
        if (signal.aborted) return;
      }
    }
    await new Promise((resolve) => {
      const finish = () => runtime14.setTimeout(resolve, 0);
      if (typeof runtime14.requestAnimationFrame === "function") runtime14.requestAnimationFrame(finish);
      else finish();
    });
  }
  function onCompatibilityReady(event) {
    var _a, _b;
    const placeId2 = text13((_a = event.detail) == null ? void 0 : _a.placeId);
    const snapshot = currentPlaceSheetSnapshot();
    if (!snapshot || snapshot.placeId !== placeId2) return;
    compatibilityReady.add(snapshot.generation);
    (_b = compatibilityWaiters.get(snapshot.generation)) == null ? void 0 : _b();
  }
  runtime14.addEventListener("hg:place-unified-ready", onCompatibilityReady);
  function waitForCompatibility(generation, placeId2, signal, timeoutMs = 2600) {
    if (compatibilityReady.has(generation)) return Promise.resolve(true);
    return new Promise((resolve) => {
      let settled = false;
      const finish = (value) => {
        if (settled) return;
        settled = true;
        runtime14.clearTimeout(timer);
        compatibilityWaiters.delete(generation);
        signal.removeEventListener("abort", onAbort);
        resolve(value);
      };
      const onAbort = () => finish(false);
      const timer = runtime14.setTimeout(() => finish(false), timeoutMs);
      compatibilityWaiters.set(generation, () => {
        if (!isActivePlaceSheetGeneration(generation, placeId2)) finish(false);
        else finish(true);
      });
      signal.addEventListener("abort", onAbort, { once: true });
    });
  }
  async function waitForRenderedSection(generation, placeId2, id, signal, timeoutMs = 1800) {
    const started = Date.now();
    while (!signal.aborted && isActivePlaceSheetGeneration(generation, placeId2)) {
      if (hasRenderedPlaceSheetSection(id)) return true;
      if (Date.now() - started >= timeoutMs) return false;
      await new Promise((resolve) => runtime14.setTimeout(resolve, 30));
    }
    return false;
  }
  async function settleImmediateBatch(generation, placeId2, ids, signal) {
    const unsettled = ids.filter((id) => !isTerminalStatus(sectionStatus(generation, placeId2, id)));
    if (!unsettled.length) return;
    unsettled.forEach((id) => markPlaceSheetSection(generation, placeId2, id, "loading"));
    await yieldToBrowser(signal);
    if (signal.aborted) return;
    unsettled.forEach((id) => {
      markPlaceSheetSection(
        generation,
        placeId2,
        id,
        hasRenderedPlaceSheetSection(id) ? "rendered" : "omitted"
      );
    });
  }
  async function settleCompatibilityBatch(generation, placeId2, ids, signal) {
    const unsettled = ids.filter((id) => !isTerminalStatus(sectionStatus(generation, placeId2, id)));
    if (!unsettled.length) return;
    const applicable = [];
    unsettled.forEach((id) => {
      if (!placeSheetSectionApplies(id, placeId2)) {
        markPlaceSheetSection(generation, placeId2, id, "omitted");
        return;
      }
      applicable.push(id);
      markPlaceSheetSection(generation, placeId2, id, "loading");
      nudgePlaceSheetSection(id, placeId2);
    });
    if (!applicable.length) return;
    await yieldToBrowser(signal);
    if (signal.aborted) return;
    const results = await Promise.all(applicable.map((id) => waitForRenderedSection(generation, placeId2, id, signal)));
    if (signal.aborted) return;
    applicable.forEach((id, index) => {
      const rendered = results[index] === true;
      const requiredWhenApplicable = id === "sources" || id === "special";
      const status = rendered ? "rendered" : requiredWhenApplicable ? "failed" : "omitted";
      markPlaceSheetSection(generation, placeId2, id, status);
    });
  }
  function registerPromotion(generation, id) {
    let set = promotedSections.get(generation);
    if (!set) {
      set = /* @__PURE__ */ new Set();
      promotedSections.set(generation, set);
    }
    set.add(id);
  }
  async function drainPromotedCompatibilitySections(generation, placeId2, signal) {
    const set = promotedSections.get(generation);
    if (!(set == null ? void 0 : set.size)) return;
    while (!signal.aborted && set.size) {
      const id = [...set].find((candidate) => COMPATIBILITY_SECTION_IDS.has(candidate)) || null;
      if (!id) break;
      set.delete(id);
      if (isTerminalStatus(sectionStatus(generation, placeId2, id))) continue;
      await settleCompatibilityBatch(generation, placeId2, [id], signal);
    }
  }
  async function runAutomaticQueue(handle) {
    const { generation, placeId: placeId2, signal } = handle;
    if (!isActivePlaceSheetGeneration(generation, placeId2)) return;
    markPlaceSheetPhase(generation, placeId2, "interactive");
    markPlaceSheetPhase(generation, placeId2, "rendering-full");
    const immediateBatches = [
      PLACE_SHEET_IMMEDIATE_SECTION_IDS.slice(0, 2),
      PLACE_SHEET_IMMEDIATE_SECTION_IDS.slice(2)
    ];
    for (const batch of immediateBatches) {
      if (signal.aborted) return;
      await settleImmediateBatch(generation, placeId2, batch, signal);
    }
    const ready = await waitForCompatibility(generation, placeId2, signal);
    if (signal.aborted || !isActivePlaceSheetGeneration(generation, placeId2)) return;
    if (!ready) {
      PLACE_SHEET_COMPAT_SECTION_BATCHES.flat().forEach((id) => {
        markPlaceSheetSection(generation, placeId2, id, "failed");
      });
      markPlaceSheetPhase(generation, placeId2, "full-ready");
      return;
    }
    await drainPromotedCompatibilitySections(generation, placeId2, signal);
    for (const batch of PLACE_SHEET_COMPAT_SECTION_BATCHES) {
      if (signal.aborted) return;
      await settleCompatibilityBatch(generation, placeId2, batch, signal);
      await drainPromotedCompatibilitySections(generation, placeId2, signal);
    }
    if (!signal.aborted && isActivePlaceSheetGeneration(generation, placeId2)) {
      markPlaceSheetPhase(generation, placeId2, "full-ready");
    }
  }
  function startAutomaticPlaceSheetRender(placeIdValue) {
    const placeId2 = text13(placeIdValue);
    if (!placeId2) return null;
    if (activeHandle && !activeHandle.signal.aborted && activeHandle.placeId === placeId2) return activeHandle;
    if (activeHandle) promotedSections.delete(activeHandle.generation);
    const generation = beginPlaceSheetGeneration(placeId2);
    const pending = pendingPromotions.get(placeId2);
    if (pending == null ? void 0 : pending.size) {
      promotedSections.set(generation.generation, new Set(pending));
      pendingPromotions.delete(placeId2);
    }
    const base = {
      generation: generation.generation,
      placeId: placeId2,
      signal: generation.signal
    };
    const done = runAutomaticQueue(base).finally(() => {
      compatibilityReady.delete(base.generation);
      compatibilityWaiters.delete(base.generation);
      promotedSections.delete(base.generation);
    });
    activeHandle = { ...base, done };
    return activeHandle;
  }
  async function promoteAutomaticPlaceSheetSection(placeIdValue, sectionIdValue) {
    var _a;
    const placeId2 = text13(placeIdValue);
    const id = canonicalSectionId(sectionIdValue);
    if (!placeId2 || !id) return false;
    const initial = currentPlaceSheetSnapshot();
    if ((initial == null ? void 0 : initial.placeId) === placeId2 && isTerminalStatus(initial.sections[id])) {
      return initial.sections[id] === "rendered";
    }
    if (activeHandle && !activeHandle.signal.aborted && activeHandle.placeId === placeId2) {
      registerPromotion(activeHandle.generation, id);
      if (compatibilityReady.has(activeHandle.generation)) nudgePlaceSheetSection(id, placeId2);
    } else {
      let pending = pendingPromotions.get(placeId2);
      if (!pending) {
        pending = /* @__PURE__ */ new Set();
        pendingPromotions.set(placeId2, pending);
      }
      pending.add(id);
    }
    const started = Date.now();
    while (Date.now() - started < 5e3) {
      const snapshot = currentPlaceSheetSnapshot();
      if ((snapshot == null ? void 0 : snapshot.placeId) === placeId2) {
        if (isTerminalStatus(snapshot.sections[id])) return snapshot.sections[id] === "rendered";
        registerPromotion(snapshot.generation, id);
        if (compatibilityReady.has(snapshot.generation)) nudgePlaceSheetSection(id, placeId2);
      }
      await new Promise((resolve) => runtime14.setTimeout(resolve, 20));
    }
    (_a = pendingPromotions.get(placeId2)) == null ? void 0 : _a.delete(id);
    return hasRenderedPlaceSheetSection(id);
  }
  function cancelAutomaticPlaceSheetRender() {
    cancelPlaceSheetGeneration();
    if (activeHandle) {
      compatibilityReady.delete(activeHandle.generation);
      compatibilityWaiters.delete(activeHandle.generation);
      promotedSections.delete(activeHandle.generation);
    }
    pendingPromotions.clear();
    activeHandle = null;
  }
  runtime14.HGPlaceSheetRenderQueue = {
    start: startAutomaticPlaceSheetRender,
    promote: promoteAutomaticPlaceSheetSection,
    cancel: cancelAutomaticPlaceSheetRender,
    current: currentPlaceSheetSnapshot
  };

  // js/ui/place-sheet/place-sheet-direct-routing.ts
  var runtime15 = window;
  var INSTALL_FLAG = "__HG_PLACE_SHEET_DIRECT_ROUTING_INSTALLED__";
  var WRAPPED_FLAG = "__hgPlaceSheetDirectRouting";
  function text14(value) {
    return String(value == null ? "" : value).trim();
  }
  function resolvedPlace(place) {
    if (place && typeof place === "object") return place;
    const id = text14(place);
    return (Array.isArray(runtime15.PLACES) ? runtime15.PLACES : []).find((row) => text14(row == null ? void 0 : row.id) === id) || place;
  }
  function placeId(place) {
    const value = resolvedPlace(place);
    return text14((value == null ? void 0 : value.id) || (typeof value === "string" ? value : ""));
  }
  function isMicro(place) {
    const value = resolvedPlace(place);
    return text14(value == null ? void 0 : value.placeTier).toLowerCase() === "micro";
  }
  function canonicalSection(target) {
    var _a;
    const canonical = (_a = runtime15.HGPlaceUnifiedSurface) == null ? void 0 : _a.canonicalSection;
    return typeof canonical === "function" ? canonical(target || "about") : text14(target || "about");
  }
  async function finishPromotedRoute(value, promotion, sectionId) {
    var _a, _b;
    try {
      await promotion;
    } catch {
    }
    try {
      (_b = (_a = runtime15.HGPlaceUnifiedSurface) == null ? void 0 : _a.scrollToSection) == null ? void 0 : _b.call(_a, sectionId);
    } catch {
    }
    return value;
  }
  function wrapShowPlacePopup() {
    const current = runtime15.showPlacePopup;
    if (typeof current !== "function" || current[WRAPPED_FLAG] === true) return false;
    if (current.__hgUnifiedPlaceSurface !== true) return false;
    const wrapped = function showPromotedPlaceSheetSection(place, target) {
      if (isMicro(place)) return current.apply(this, [place, target]);
      const id = canonicalSection(target || "about");
      const promotion = promoteAutomaticPlaceSheetSection(placeId(place), id);
      const result = current.apply(this, [place, target]);
      return Promise.resolve(result).then((value) => finishPromotedRoute(value, promotion, id));
    };
    Object.keys(current).forEach((key) => {
      try {
        wrapped[key] = current[key];
      } catch {
      }
    });
    wrapped[WRAPPED_FLAG] = true;
    wrapped.__previous = current;
    runtime15.showPlacePopup = wrapped;
    return true;
  }
  function wrapPopupTabBridge() {
    const tabs = runtime15.HGPlacePopupTabs;
    const current = tabs == null ? void 0 : tabs.openTab;
    if (!tabs || typeof current !== "function" || current[WRAPPED_FLAG] === true) return false;
    const wrapped = function openPromotedPlaceSheetSection(place, tabId) {
      if (isMicro(place)) return current.apply(this, [place, tabId]);
      const id = canonicalSection(tabId);
      const promotion = promoteAutomaticPlaceSheetSection(placeId(place), id);
      const result = current.apply(this, [place, tabId]);
      return Promise.resolve(result).then((value) => finishPromotedRoute(value, promotion, id));
    };
    wrapped[WRAPPED_FLAG] = true;
    wrapped.__previous = current;
    tabs.openTab = wrapped;
    return true;
  }
  function install() {
    if (runtime15[INSTALL_FLAG]) return true;
    if (runtime15.__HG_PLACE_UNIFIED_SURFACE_INSTALLED__ !== true) return false;
    if (!runtime15.HGPlaceUnifiedSurface || typeof runtime15.showPlacePopup !== "function") return false;
    if (runtime15.showPlacePopup.__hgUnifiedPlaceSurface !== true) return false;
    wrapShowPlacePopup();
    wrapPopupTabBridge();
    runtime15[INSTALL_FLAG] = true;
    return true;
  }
  if (!install()) {
    let attempts = 0;
    const timer = runtime15.setInterval(() => {
      attempts += 1;
      if (install() || attempts > 400) runtime15.clearInterval(timer);
    }, 25);
  }

  // js/ui/place-sheet/place-sheet-shell.ts
  var runtime16 = window;
  var SHELL_ATTR = "data-hg-place-sheet-shell";
  var SHELL_SECTION_ATTR = "data-hg-place-sheet-section";
  var NAV_ITEMS = [
    ["about", "Om"],
    ["history", "Historie"],
    ["stories", "Fortellinger"],
    ["before-after", "F\xF8r/etter"],
    ["news", "Nyheter"],
    ["reading", "Lesespor"],
    ["language", "Spr\xE5k"],
    ["learning", "Fagverk"],
    ["sources", "Kilder"]
  ];
  function text15(value) {
    return String(value == null ? "" : value).trim();
  }
  function card() {
    return document.getElementById("placeCard");
  }
  function body() {
    var _a;
    return ((_a = card()) == null ? void 0 : _a.querySelector(":scope > .pc-body")) || null;
  }
  function isMicro2(place) {
    return text15(place == null ? void 0 : place.placeTier).toLowerCase() === "micro";
  }
  function ensureSectionNav(shell4, place) {
    let nav = shell4.querySelector('[data-hg-place-sheet-nav="1"]');
    if (!(nav instanceof HTMLElement)) {
      nav = document.createElement("nav");
      nav.className = "pc-sheet-section-nav";
      nav.setAttribute("data-hg-place-sheet-nav", "1");
      nav.setAttribute("aria-label", "Hopp til del av stedet");
      nav.innerHTML = NAV_ITEMS.map(([id, label]) => `<button type="button" data-hg-place-sheet-jump="${id}">${label}</button>`).join("");
      const hero = shell4.querySelector("[data-hg-place-sheet-hero]");
      if (hero == null ? void 0 : hero.nextSibling) shell4.insertBefore(nav, hero.nextSibling);
      else shell4.appendChild(nav);
      nav.addEventListener("click", (event) => {
        var _a, _b, _c;
        const button = event.target instanceof Element ? event.target.closest("[data-hg-place-sheet-jump]") : null;
        if (!(button instanceof HTMLElement) || !(nav == null ? void 0 : nav.contains(button))) return;
        const target = text15(button.dataset.hgPlaceSheetJump);
        const placeId2 = text15(shell4.dataset.placeId);
        if (!target || !placeId2) return;
        event.preventDefault();
        const open = (_a = runtime16.HGPlaceUnifiedSurface) == null ? void 0 : _a.open;
        if (typeof open === "function") {
          void Promise.resolve(open(placeId2, target));
        } else {
          (_c = (_b = runtime16.HGPlaceUnifiedSurface) == null ? void 0 : _b.scrollToSection) == null ? void 0 : _c.call(_b, target);
        }
      });
    }
    nav.dataset.placeId = text15(place.id);
    return nav;
  }
  function ensureShell(place) {
    if (isMicro2(place)) return null;
    const root2 = card();
    const rootBody = body();
    if (!(root2 instanceof HTMLElement) || !(rootBody instanceof HTMLElement)) return null;
    let shell4 = rootBody.querySelector(`[${SHELL_ATTR}="1"]`);
    if (!(shell4 instanceof HTMLElement)) {
      shell4 = document.createElement("section");
      shell4.className = "pc-sheet-shell";
      shell4.setAttribute(SHELL_ATTR, "1");
      shell4.innerHTML = `
      <div class="pc-sheet-hero" data-hg-place-sheet-hero>
        <div class="pc-sheet-hero-media" data-hg-place-sheet-media>
          <section class="pc-sheet-explore" aria-label="Utforsk stedet">
            <div class="pc-sheet-section-head">
              <span class="pc-sheet-section-eyebrow">Utforsk</span>
              <h2>Fire samlinger</h2>
            </div>
            <div class="pc-sheet-explore-grid" data-hg-place-sheet-collections></div>
          </section>
          <section class="pc-sheet-onsite" data-hg-place-sheet-onsite aria-label="Events og m\xF8ter"></section>
        </div>
        <div class="pc-sheet-hero-copy" data-hg-place-sheet-copy></div>
      </div>
      <section class="pc-sheet-history" data-hg-place-sheet-history hidden></section>
      <section class="pc-sheet-stories" data-hg-place-sheet-stories hidden></section>
      <section class="pc-sheet-before-after" data-hg-place-sheet-before-after hidden></section>
      <section class="pc-sheet-news" data-hg-place-sheet-news data-hg-place-sheet-section="news" hidden></section>
    `;
      rootBody.prepend(shell4);
    }
    shell4.dataset.placeId = text15(place.id);
    ensureSectionNav(shell4, place);
    root2.dataset.hgPlaceSheetPhase = "6";
    root2.classList.add("is-place-sheet-phase1", "is-place-sheet-direct");
    return shell4;
  }
  function movePrimaryNodes(shell4) {
    const root2 = card();
    if (!(root2 instanceof HTMLElement)) return;
    const media = shell4.querySelector("[data-hg-place-sheet-media]");
    const copy = shell4.querySelector("[data-hg-place-sheet-copy]");
    const collections = shell4.querySelector("[data-hg-place-sheet-collections]");
    const onsite = shell4.querySelector("[data-hg-place-sheet-onsite]");
    const front = root2.querySelector(".pc-frontcard");
    const textBlock = root2.querySelector(".pc-text");
    const sideStack = root2.querySelector(".pc-side-stack");
    const events = document.getElementById("pcEventsBox");
    if (front && media && front.parentElement !== media) media.prepend(front);
    if (textBlock && copy && textBlock.parentElement !== copy) copy.prepend(textBlock);
    if (sideStack && collections && sideStack.parentElement !== collections) collections.appendChild(sideStack);
    if (events instanceof HTMLElement && onsite && events.parentElement !== onsite) onsite.appendChild(events);
    const legacyGrid = root2.querySelector(".pc-grid");
    if (legacyGrid && !legacyGrid.children.length) legacyGrid.hidden = true;
  }
  function ensureAboutSlot(shell4) {
    const copy = shell4.querySelector("[data-hg-place-sheet-copy]");
    if (!(copy instanceof HTMLElement)) return null;
    let aboutSlot = copy.querySelector("[data-hg-place-sheet-about]");
    if (!(aboutSlot instanceof HTMLElement)) {
      aboutSlot = document.createElement("div");
      aboutSlot.className = "pc-sheet-about";
      aboutSlot.setAttribute("data-hg-place-sheet-about", "1");
      aboutSlot.setAttribute(SHELL_SECTION_ATTR, "about");
      copy.appendChild(aboutSlot);
    }
    return aboutSlot;
  }
  function ensureHistorySlot(shell4) {
    let historySlot = shell4.querySelector("[data-hg-place-sheet-history]");
    if (!(historySlot instanceof HTMLElement)) {
      historySlot = document.createElement("section");
      historySlot.className = "pc-sheet-history";
      historySlot.setAttribute("data-hg-place-sheet-history", "1");
      shell4.appendChild(historySlot);
    }
    historySlot.setAttribute(SHELL_SECTION_ATTR, "history");
    return historySlot;
  }
  function ensureStoriesSlot(shell4) {
    let storiesSlot = shell4.querySelector("[data-hg-place-sheet-stories]");
    if (!(storiesSlot instanceof HTMLElement)) {
      storiesSlot = document.createElement("section");
      storiesSlot.className = "pc-sheet-stories";
      storiesSlot.setAttribute("data-hg-place-sheet-stories", "1");
      shell4.appendChild(storiesSlot);
    }
    storiesSlot.setAttribute(SHELL_SECTION_ATTR, "stories");
    return storiesSlot;
  }
  function ensureBeforeAfterSlot(shell4) {
    let slot2 = shell4.querySelector("[data-hg-place-sheet-before-after]");
    if (!(slot2 instanceof HTMLElement)) {
      slot2 = document.createElement("section");
      slot2.className = "pc-sheet-before-after";
      slot2.setAttribute("data-hg-place-sheet-before-after", "1");
      shell4.appendChild(slot2);
    }
    slot2.setAttribute(SHELL_SECTION_ATTR, "before-after");
    return slot2;
  }
  function mountPlaceSheetPhase1(place) {
    var _a, _b, _c, _d;
    if (!place || isMicro2(place)) return null;
    const shell4 = ensureShell(place);
    if (!(shell4 instanceof HTMLElement)) return null;
    movePrimaryNodes(shell4);
    const aboutSlot = ensureAboutSlot(shell4);
    if (aboutSlot) (_a = mountCanonicalAbout(aboutSlot, place, { suppressIfSameAsDesc: true })) == null ? void 0 : _a.classList.add("pc-sheet-canonical-about");
    const historySlot = ensureHistorySlot(shell4);
    if (historySlot) (_b = mountCanonicalHistory(historySlot, place)) == null ? void 0 : _b.classList.add("pc-sheet-canonical-history");
    const storiesSlot = ensureStoriesSlot(shell4);
    if (storiesSlot) (_c = mountCanonicalStories(storiesSlot, place)) == null ? void 0 : _c.classList.add("pc-sheet-canonical-stories");
    const beforeAfterSlot = ensureBeforeAfterSlot(shell4);
    if (beforeAfterSlot) (_d = mountCanonicalBeforeAfter(beforeAfterSlot, place)) == null ? void 0 : _d.classList.add("pc-sheet-canonical-before-after");
    startAutomaticPlaceSheetRender(text15(place.id));
    return shell4;
  }
  function restoreLegacyPlaceCardStructure() {
    cancelAutomaticPlaceSheetRender();
    const root2 = card();
    const rootBody = body();
    if (!(root2 instanceof HTMLElement) || !(rootBody instanceof HTMLElement)) return;
    const shell4 = rootBody.querySelector(`[${SHELL_ATTR}="1"]`);
    const textBlock = (shell4 == null ? void 0 : shell4.querySelector(".pc-text")) || root2.querySelector(".pc-text");
    const front = (shell4 == null ? void 0 : shell4.querySelector(".pc-frontcard")) || root2.querySelector(".pc-frontcard");
    const sideStack = (shell4 == null ? void 0 : shell4.querySelector(".pc-side-stack")) || root2.querySelector(".pc-side-stack");
    const events = (shell4 == null ? void 0 : shell4.querySelector("#pcEventsBox")) || document.getElementById("pcEventsBox");
    let legacyGrid = rootBody.querySelector(":scope > .pc-grid");
    if (!(legacyGrid instanceof HTMLElement)) {
      legacyGrid = document.createElement("div");
      legacyGrid.className = "pc-grid";
    }
    legacyGrid.hidden = false;
    if (textBlock instanceof HTMLElement) rootBody.prepend(textBlock);
    if (legacyGrid.parentElement !== rootBody) {
      if (textBlock == null ? void 0 : textBlock.nextSibling) rootBody.insertBefore(legacyGrid, textBlock.nextSibling);
      else rootBody.prepend(legacyGrid);
    }
    if (front instanceof HTMLElement) legacyGrid.appendChild(front);
    if (sideStack instanceof HTMLElement) legacyGrid.appendChild(sideStack);
    if (events instanceof HTMLElement) legacyGrid.appendChild(events);
    shell4 == null ? void 0 : shell4.remove();
    root2.classList.remove("is-place-sheet-phase1", "is-place-sheet-direct");
    delete root2.dataset.hgPlaceSheetPhase;
  }
  function placeSheetSectionTarget(id) {
    var _a;
    const normalized2 = text15(id);
    if (!normalized2) return null;
    const target = ((_a = card()) == null ? void 0 : _a.querySelector(`[${SHELL_SECTION_ATTR}="${normalized2}"]`)) || null;
    return target instanceof HTMLElement && !target.hidden ? target : null;
  }

  // js/ui/place-unified-surface.ts
  (function installPlaceUnifiedSurface(global) {
    "use strict";
    const INSTALL_FLAG2 = "__HG_PLACE_UNIFIED_SURFACE_INSTALLED__";
    const STYLE_FLAG = "data-hg-place-unified-style";
    const SHEET_STYLE_FLAG = "data-hg-place-sheet-style";
    const PHASE6_STYLE_FLAG = "data-hg-place-sheet-phase6-style";
    const CARD_CLASS = "is-unified-place";
    const SECTION_ORDER = Object.freeze([
      ["about", "Om"],
      ["history", "Historie"],
      ["stories", "Fortellinger"],
      ["before-after", "F\xF8r/etter"],
      ["news", "Nyheter"],
      ["reading", "Lesespor"],
      ["language", "Spr\xE5k"],
      ["learning", "Fagverk"],
      ["sources", "Kilder"]
    ]);
    const SECTION_ALIASES = Object.freeze({
      about: "about",
      om: "about",
      info: "about",
      more: "about",
      history: "history",
      historie: "history",
      chronology: "history",
      kronologi: "history",
      stories: "stories",
      story: "stories",
      fortellinger: "stories",
      fortelling: "stories",
      "before-after": "before-after",
      beforeafter: "before-after",
      for_na: "before-after",
      forna: "before-after",
      news: "news",
      nyheter: "news",
      reading: "reading",
      lesespor: "reading",
      language: "language",
      sprak: "language",
      "spr\xE5k": "language",
      learning: "learning",
      fagverk: "learning",
      fag: "learning",
      sources: "sources",
      kilder: "sources"
    });
    const text16 = (value) => String(value == null ? "" : value).trim();
    let legacyOpenPlaceCard = null;
    let legacyShowPlacePopup = null;
    let readyGeneration = 0;
    let activeMount = Promise.resolve(null);
    let compatibilityTimer = null;
    function isMicro3(place) {
      return text16(place == null ? void 0 : place.placeTier).toLowerCase() === "micro";
    }
    function placeId2(place) {
      return text16(place == null ? void 0 : place.id);
    }
    function card2() {
      return document.getElementById("placeCard");
    }
    function resolvedPlace2(place) {
      var _a, _b, _c, _d;
      if (place && typeof place === "object") return ((_b = (_a = global.HGPlaceOpen) == null ? void 0 : _a.getPlace) == null ? void 0 : _b.call(_a, place)) || place;
      const id = text16(place);
      if (!id) return null;
      try {
        const enriched = (_d = (_c = global.HGPlaceOpen) == null ? void 0 : _c.getPlace) == null ? void 0 : _d.call(_c, id);
        if (enriched) return enriched;
      } catch {
      }
      return (Array.isArray(global.PLACES) ? global.PLACES : []).find((row) => placeId2(row) === id) || null;
    }
    function currentPlace() {
      var _a, _b, _c, _d;
      const id = text16(((_b = (_a = card2()) == null ? void 0 : _a.dataset) == null ? void 0 : _b.currentPlaceId) || ((_d = (_c = card2()) == null ? void 0 : _c.dataset) == null ? void 0 : _d.hgUnifiedPlaceId));
      return resolvedPlace2(id);
    }
    function canonicalSection2(value) {
      const key = text16(value).toLowerCase().replace(/\s+/g, "-");
      return SECTION_ALIASES[key] || (SECTION_ORDER.some(([id]) => id === key) ? key : "about");
    }
    function ensureStylesheet6() {
      const styles = [
        [STYLE_FLAG, "css/place-unified-surface.css"],
        [SHEET_STYLE_FLAG, "css/place-sheet.css?v=20260912-onsite-under-explore1"],
        [PHASE6_STYLE_FLAG, "css/place-sheet-phase6.css"]
      ];
      for (const [flag, href] of styles) {
        if (document.querySelector(`link[${flag}="1"]`)) continue;
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        link.setAttribute(flag, "1");
        document.head.appendChild(link);
      }
    }
    function clearUnifiedState() {
      ++readyGeneration;
      restoreLegacyPlaceCardStructure();
      const root2 = card2();
      root2 == null ? void 0 : root2.classList.remove(CARD_CLASS, "is-place-sheet-direct");
      if (root2) {
        delete root2.dataset.hgUnifiedPlaceId;
        delete root2.dataset.hgUnifiedGeneration;
      }
    }
    function dispatchDirectReady(place, generation) {
      global.setTimeout(() => {
        var _a;
        if (generation !== readyGeneration) return;
        const root2 = card2();
        if (!(root2 instanceof HTMLElement) || text16(root2.dataset.hgUnifiedPlaceId) !== placeId2(place)) return;
        (_a = global.dispatchEvent) == null ? void 0 : _a.call(global, new CustomEvent("hg:place-unified-ready", {
          detail: { placeId: placeId2(place), direct: true, phase: 7 }
        }));
      }, 0);
    }
    async function materialize(placeInput, _options = {}) {
      const place = resolvedPlace2(placeInput) || placeInput;
      const id = placeId2(place);
      if (!id || isMicro3(place)) {
        clearUnifiedState();
        return null;
      }
      const root2 = card2();
      if (!(root2 instanceof HTMLElement)) return null;
      const shell4 = mountPlaceSheetPhase1(place);
      if (!(shell4 instanceof HTMLElement)) return null;
      root2.classList.add(CARD_CLASS, "is-place-sheet-direct");
      root2.dataset.hgUnifiedPlaceId = id;
      const generation = ++readyGeneration;
      root2.dataset.hgUnifiedGeneration = String(generation);
      dispatchDirectReady(place, generation);
      return shell4;
    }
    function scrollToSection(target, options = {}) {
      var _a, _b;
      const id = canonicalSection2(target);
      const section = placeSheetSectionTarget(id);
      if (!(section instanceof HTMLElement)) return false;
      try {
        section.scrollIntoView({ behavior: options.instant ? "auto" : "smooth", block: "start" });
      } catch {
        (_a = section.scrollIntoView) == null ? void 0 : _a.call(section);
      }
      if (options.focus) {
        if (!section.hasAttribute("tabindex")) section.setAttribute("tabindex", "-1");
        try {
          section.focus({ preventScroll: true });
        } catch {
          (_b = section.focus) == null ? void 0 : _b.call(section);
        }
      }
      return true;
    }
    async function openSection(placeInput, target = "about") {
      var _a, _b;
      const place = resolvedPlace2(placeInput);
      if (!place) return false;
      if (isMicro3(place)) {
        if (typeof legacyShowPlacePopup === "function") legacyShowPlacePopup(place, target);
        return true;
      }
      const id = canonicalSection2(target);
      const promotion = promoteAutomaticPlaceSheetSection(placeId2(place), id);
      const root2 = card2();
      const samePlace = text16(((_a = root2 == null ? void 0 : root2.dataset) == null ? void 0 : _a.currentPlaceId) || ((_b = root2 == null ? void 0 : root2.dataset) == null ? void 0 : _b.hgUnifiedPlaceId)) === placeId2(place);
      if (!samePlace && typeof global.openPlaceCard === "function") await global.openPlaceCard(place);
      else await materialize(place, { refresh: false });
      try {
        await promotion;
      } catch {
      }
      if (scrollToSection(id)) return true;
      await new Promise((resolve) => global.setTimeout(resolve, 20));
      return scrollToSection(id);
    }
    function patchOpenPlaceCard() {
      const current = global.openPlaceCard;
      if (typeof current !== "function" || current.__hgUnifiedPlaceSurface === true) return false;
      legacyOpenPlaceCard = current;
      const wrapped = async function openUnifiedPlaceCard(place, ...args) {
        const result = current.call(this, place, ...args);
        const resolved = result && typeof result.then === "function" ? await result : result;
        const canonical = resolvedPlace2(place) || place;
        if (isMicro3(canonical)) clearUnifiedState();
        else {
          activeMount = materialize(canonical, { refresh: true });
          await activeMount;
        }
        return resolved;
      };
      Object.keys(current).forEach((key) => {
        try {
          wrapped[key] = current[key];
        } catch {
        }
      });
      wrapped.__hgUnifiedPlaceSurface = true;
      wrapped.__previous = current;
      global.openPlaceCard = wrapped;
      return true;
    }
    function patchShowPlacePopup() {
      const current = global.showPlacePopup;
      if (typeof current !== "function" || current.__hgUnifiedPlaceSurface === true) return false;
      legacyShowPlacePopup = current;
      const wrapped = function showUnifiedPlaceSurface(place, target) {
        const canonical = resolvedPlace2(place) || place;
        if (isMicro3(canonical)) return current.apply(this, [canonical, target]);
        return openSection(canonical, target || "about");
      };
      Object.keys(current).forEach((key) => {
        try {
          wrapped[key] = current[key];
        } catch {
        }
      });
      wrapped.__hgUnifiedPlaceSurface = true;
      wrapped.__hgPlacePopupV2 = current.__hgPlacePopupV2 === true;
      wrapped.__hgPlacePopupTabs = current.__hgPlacePopupTabs === true;
      wrapped.__hgPlacePopupDirectTabs = current.__hgPlacePopupDirectTabs === true;
      wrapped.__previous = current;
      global.showPlacePopup = wrapped;
      return true;
    }
    function installPopupTabBridge() {
      if (!global.HGPlacePopupTabs) return false;
      global.HGPlacePopupTabs.openTab = function openUnifiedPopupTab(place, tabId) {
        return openSection(place, tabId);
      };
      return true;
    }
    function compatibilityReady2() {
      const popupReady = typeof global.showPlacePopup === "function" && global.showPlacePopup.__hgUnifiedPlaceSurface === true;
      const tabsReady = !!global.HGPlacePopupTabs && typeof global.HGPlacePopupTabs.openTab === "function";
      return popupReady && tabsReady;
    }
    function installCompatibilityRoutes() {
      patchShowPlacePopup();
      installPopupTabBridge();
      return compatibilityReady2();
    }
    function armCompatibilityRetry() {
      if (compatibilityReady2() || compatibilityTimer != null) return;
      let attempts = 0;
      compatibilityTimer = global.setInterval(() => {
        attempts += 1;
        if (installCompatibilityRoutes() || attempts > 400) {
          if (compatibilityTimer != null) global.clearInterval(compatibilityTimer);
          compatibilityTimer = null;
        }
      }, 50);
    }
    function install2() {
      ensureStylesheet6();
      if (global[INSTALL_FLAG2]) {
        installCompatibilityRoutes();
        armCompatibilityRetry();
        return true;
      }
      if (typeof global.openPlaceCard !== "function") return false;
      patchOpenPlaceCard();
      global[INSTALL_FLAG2] = true;
      global.HGPlaceUnifiedSurface = {
        ensure: (place2, options = {}) => materialize(place2, options),
        open: openSection,
        scrollToSection,
        clear: clearUnifiedState,
        currentPlace,
        canonicalSection: canonicalSection2,
        sectionIds: SECTION_ORDER.map(([id]) => id),
        phase: 7,
        directStandardPlaces: true,
        get legacyOpenPlaceCard() {
          return legacyOpenPlaceCard;
        },
        get legacyShowPlacePopup() {
          return legacyShowPlacePopup;
        }
      };
      installCompatibilityRoutes();
      armCompatibilityRetry();
      const place = currentPlace();
      if (place && !isMicro3(place)) void materialize(place, { refresh: true });
      return true;
    }
    if (!install2()) {
      let attempts = 0;
      const timer = global.setInterval(() => {
        attempts += 1;
        if (install2() || attempts > 400) global.clearInterval(timer);
      }, 50);
    }
  })(window);
})();
//# sourceMappingURL=place-unified-surface.js.map
