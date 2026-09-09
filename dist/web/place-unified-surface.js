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

  // js/ui/place-sheet/sections/news.ts
  var runtime5 = window;
  function text5(value) {
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
    const raw = text5(value);
    if (!raw) return "";
    try {
      const parsed = new URL(raw, ((_a = runtime5.location) == null ? void 0 : _a.origin) || void 0);
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
      const title = text5((item == null ? void 0 : item.title) || (item == null ? void 0 : item.name) || (item == null ? void 0 : item.id) || "Notis");
      const meta = [(item == null ? void 0 : item.date) || (item == null ? void 0 : item.year) || (item == null ? void 0 : item.period), (item == null ? void 0 : item.category) || (item == null ? void 0 : item.type)].map(text5).filter(Boolean).join(" \xB7 ");
      const summary = text5(((_a = item == null ? void 0 : item.summary) == null ? void 0 : _a.one_liner) || (item == null ? void 0 : item.popupDesc) || (item == null ? void 0 : item.desc) || (item == null ? void 0 : item.description));
      const rawSource = Array.isArray(item == null ? void 0 : item.sources) ? item.sources[0] : null;
      const sourceUrl = safeHttpsUrl2(typeof rawSource === "string" ? rawSource : rawSource == null ? void 0 : rawSource.url);
      const sourceLabel = text5(typeof rawSource === "string" ? "Offisiell kilde" : (rawSource == null ? void 0 : rawSource.label) || (rawSource == null ? void 0 : rawSource.title) || "Offisiell kilde");
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
    if (!html) {
      container.hidden = true;
      return null;
    }
    container.hidden = false;
    container.insertAdjacentHTML("beforeend", html);
    return container.querySelector('[data-hg-place-sheet-owner="news"]');
  }
  var newsApi = {
    renderContentHtml: renderNewsContentHtml,
    renderHtml: renderCanonicalNewsHtml,
    mount: mountCanonicalNews
  };
  runtime5.HGPlaceSheetSections = {
    ...runtime5.HGPlaceSheetSections || {},
    news: newsApi
  };

  // js/ui/place-sheet/sections/reading.ts
  var runtime6 = window;
  var PAYWALL_TERMS = [
    "paywall",
    "subscription",
    "subscriber",
    "abonnement",
    "betalingsmur",
    "krever abonnement"
  ];
  function text6(value) {
    return String(value == null ? "" : value).trim();
  }
  function list(value) {
    return Array.isArray(value) ? value : [];
  }
  function escapeHtml6(value) {
    return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function safeHttpsUrl3(value) {
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
  function uniqueBy(items) {
    const seen = /* @__PURE__ */ new Set();
    return items.filter((item) => {
      const key = text6(item == null ? void 0 : item.id) || [item == null ? void 0 : item.title, item == null ? void 0 : item.author, item == null ? void 0 : item.publication, (item == null ? void 0 : item.year) || (item == null ? void 0 : item.date)].map(text6).join("|");
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  function sortYear(item) {
    return Number((item == null ? void 0 : item.year) || String((item == null ? void 0 : item.date) || "").slice(0, 4)) || 0;
  }
  function isOpenReading(item) {
    const access = [item == null ? void 0 : item.access, item == null ? void 0 : item.access_note, item == null ? void 0 : item.note].map((value) => text6(value).toLowerCase()).join(" ");
    return !PAYWALL_TERMS.some((term) => access.includes(term));
  }
  function filterReadingForPlace(items, placeId2) {
    const id = text6(placeId2);
    if (!id) return [];
    return uniqueBy(list(items).filter((item) => list(item == null ? void 0 : item.place_ids).map(text6).includes(id) && isOpenReading(item))).sort((a, b) => sortYear(b) - sortYear(a));
  }
  function readingCards(rows2) {
    return `<div class="hg-place-reading-list pc-sheet-reading-list">${rows2.map((item) => {
      const url = safeHttpsUrl3(item == null ? void 0 : item.url);
      const meta = [item == null ? void 0 : item.author, item == null ? void 0 : item.publication, (item == null ? void 0 : item.year) || (item == null ? void 0 : item.date), item == null ? void 0 : item.type].map(text6).filter(Boolean).join(" \xB7 ");
      const relevance = text6(item == null ? void 0 : item.relevance);
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
    return list((_c = (_b = (_a = runtime6.HGPlaceOpen) == null ? void 0 : _a.get) == null ? void 0 : _b.call(_a, placeId2)) == null ? void 0 : _c.lesespor);
  }
  async function resolveReading(placeId2) {
    var _a, _b;
    const id = text6(placeId2);
    if (!id) return [];
    const canonical = canonicalReading(id);
    if (canonical.length) return canonical;
    try {
      const value = await ((_b = (_a = runtime6.DataHub) == null ? void 0 : _a.loadLesespor) == null ? void 0 : _b.call(_a, { cache: "default" }));
      const aggregate = Array.isArray(value == null ? void 0 : value.items) ? value.items : list(value);
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
    let slot = shell4.querySelector("[data-hg-place-sheet-reading]");
    if (!(slot instanceof HTMLElement)) {
      slot = document.createElement("section");
      slot.className = "pc-sheet-reading";
      slot.setAttribute("data-hg-place-sheet-reading", "1");
      slot.setAttribute("data-hg-place-sheet-section", "reading");
      slot.setAttribute("data-place-panel", "reading");
      slot.hidden = true;
      const news = shell4.querySelector("[data-hg-place-sheet-news]");
      if (news == null ? void 0 : news.nextSibling) shell4.insertBefore(slot, news.nextSibling);
      else shell4.appendChild(slot);
    }
    return slot;
  }
  function retireEmbeddedFallback() {
    const panel = document.querySelector('#pcUnifiedKnowledgeHost [data-place-panel="reading"]');
    panel == null ? void 0 : panel.remove();
  }
  var hydrationGeneration = 0;
  async function hydrateUnifiedReading(placeId2) {
    const id = text6(placeId2);
    if (!id) return;
    const generation = ++hydrationGeneration;
    const slot = ensureReadingSlot();
    if (!(slot instanceof HTMLElement)) return;
    const items = await resolveReading(id);
    if (generation !== hydrationGeneration || !slot.isConnected) return;
    const mounted = mountCanonicalReading(slot, items, id);
    if (mounted) retireEmbeddedFallback();
  }
  function onUnifiedReady(event) {
    var _a;
    const id = text6((_a = event.detail) == null ? void 0 : _a.placeId);
    if (id) void hydrateUnifiedReading(id);
  }
  ensureStylesheet();
  runtime6.addEventListener("hg:place-unified-ready", onUnifiedReady);
  var readingApi = {
    filterForPlace: filterReadingForPlace,
    renderContentHtml: renderReadingContentHtml,
    renderHtml: renderCanonicalReadingHtml,
    mount: mountCanonicalReading,
    resolve: resolveReading
  };
  runtime6.HGPlaceSheetSections = {
    ...runtime6.HGPlaceSheetSections || {},
    reading: readingApi
  };

  // js/ui/place-sheet/sections/language.ts
  var runtime7 = window;
  function text7(value) {
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
  function embeddedLanguagePanel() {
    return document.querySelector('#pcUnifiedKnowledgeHost .hg-place-language-panel[data-place-panel="language"]');
  }
  function ensureLanguageSlot() {
    const shell4 = placeSheetShell();
    if (!(shell4 instanceof HTMLElement)) return null;
    let slot = shell4.querySelector('[data-hg-place-sheet-language="1"]');
    if (!(slot instanceof HTMLElement)) {
      slot = document.createElement("section");
      slot.className = "pc-sheet-language";
      slot.setAttribute("data-hg-place-sheet-language", "1");
      slot.setAttribute("data-hg-place-sheet-section", "language");
      slot.setAttribute("data-place-panel", "language");
      slot.hidden = true;
      const reading = shell4.querySelector('[data-hg-place-sheet-section="reading"]');
      const news = shell4.querySelector('[data-hg-place-sheet-section="news"]');
      const anchor = reading || news;
      if (anchor == null ? void 0 : anchor.nextSibling) shell4.insertBefore(slot, anchor.nextSibling);
      else shell4.appendChild(slot);
    }
    return slot;
  }
  function removeEmbeddedLanguageTeaser() {
    document.querySelectorAll("#pcUnifiedKnowledgeHost [data-language-teaser]").forEach((node) => node.remove());
  }
  function adoptCanonicalLanguage(placeId2) {
    const id = text7(placeId2);
    if (!id) return null;
    const panel = embeddedLanguagePanel();
    if (!(panel instanceof HTMLElement)) return null;
    const languageRoot = panel.querySelector("[data-language-place]");
    const renderedPlaceId = text7(languageRoot == null ? void 0 : languageRoot.getAttribute("data-language-place"));
    if (renderedPlaceId && renderedPlaceId !== id) return null;
    const slot = ensureLanguageSlot();
    if (!(slot instanceof HTMLElement)) return null;
    let compat = slot.querySelector('[data-hg-place-sheet-language-compat="1"]');
    if (!(compat instanceof HTMLElement)) {
      compat = document.createElement("div");
      compat.className = "pc-sheet-language-compat hg-place-popup-v2";
      compat.setAttribute("data-hg-place-sheet-language-compat", "1");
      compat.setAttribute("data-hg-language-layer", "1");
    }
    panel.hidden = false;
    panel.removeAttribute("aria-hidden");
    panel.removeAttribute("aria-labelledby");
    panel.setAttribute("role", "region");
    panel.style.scrollMarginTop = "76px";
    compat.replaceChildren(panel);
    slot.replaceChildren(compat);
    slot.hidden = false;
    slot.dataset.placeId = id;
    removeEmbeddedLanguageTeaser();
    return slot;
  }
  function onUnifiedReady2(event) {
    var _a;
    const id = text7((_a = event.detail) == null ? void 0 : _a.placeId);
    if (id) adoptCanonicalLanguage(id);
  }
  ensureStylesheet2();
  runtime7.addEventListener("hg:place-unified-ready", onUnifiedReady2);
  runtime7.HGPlaceSheetSections = {
    ...runtime7.HGPlaceSheetSections || {},
    language: { adopt: adoptCanonicalLanguage }
  };

  // js/ui/place-sheet/sections/sources.ts
  var runtime8 = window;
  function text8(value) {
    return String(value == null ? "" : value).trim();
  }
  function ensureStylesheet3() {
    if (document.querySelector('link[data-hg-place-sheet-sources-style="1"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "css/place-sheet-sources.css";
    link.setAttribute("data-hg-place-sheet-sources-style", "1");
    document.head.appendChild(link);
  }
  function shell() {
    return document.querySelector('#placeCard [data-hg-place-sheet-shell="1"]');
  }
  function embeddedSourcesPanel() {
    return document.querySelector('#pcUnifiedKnowledgeHost [data-place-panel="sources"]');
  }
  function ensureSlot() {
    const root2 = shell();
    if (!(root2 instanceof HTMLElement)) return null;
    let slot = root2.querySelector('[data-hg-place-sheet-sources="1"]');
    if (!(slot instanceof HTMLElement)) {
      slot = document.createElement("section");
      slot.className = "pc-sheet-sources";
      slot.setAttribute("data-hg-place-sheet-sources", "1");
      slot.setAttribute("data-hg-place-sheet-section", "sources");
      slot.hidden = true;
      const learning = root2.querySelector('[data-hg-place-sheet-section="learning"]');
      const language = root2.querySelector('[data-hg-place-sheet-section="language"]');
      const reading = root2.querySelector('[data-hg-place-sheet-section="reading"]');
      const news = root2.querySelector('[data-hg-place-sheet-section="news"]');
      const anchor = learning || language || reading || news;
      if (anchor == null ? void 0 : anchor.nextSibling) root2.insertBefore(slot, anchor.nextSibling);
      else root2.appendChild(slot);
    }
    return slot;
  }
  function adoptCanonicalSources(placeId2) {
    const id = text8(placeId2);
    if (!id) return null;
    const panel = embeddedSourcesPanel();
    if (!(panel instanceof HTMLElement)) return null;
    const slot = ensureSlot();
    if (!(slot instanceof HTMLElement)) return null;
    panel.hidden = false;
    panel.removeAttribute("aria-hidden");
    panel.setAttribute("role", "region");
    panel.style.scrollMarginTop = "76px";
    panel.classList.add("pc-sheet-canonical-sources");
    slot.replaceChildren(panel);
    slot.hidden = false;
    slot.dataset.placeId = id;
    return slot;
  }
  function onUnifiedReady3(event) {
    var _a;
    const id = text8((_a = event.detail) == null ? void 0 : _a.placeId);
    if (id) adoptCanonicalSources(id);
  }
  ensureStylesheet3();
  runtime8.addEventListener("hg:place-unified-ready", onUnifiedReady3);
  runtime8.HGPlaceSheetSections = {
    ...runtime8.HGPlaceSheetSections || {},
    sources: { adopt: adoptCanonicalSources }
  };

  // js/ui/place-sheet/sections/learning.ts
  var runtime9 = window;
  function text9(value) {
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
  function embeddedLearning() {
    return document.querySelector('#pcUnifiedKnowledgeHost [data-hg-unified-section="learning"]');
  }
  function ensureSlot2() {
    const root2 = shell2();
    if (!(root2 instanceof HTMLElement)) return null;
    let slot = root2.querySelector('[data-hg-place-sheet-learning="1"]');
    if (!(slot instanceof HTMLElement)) {
      slot = document.createElement("section");
      slot.className = "pc-sheet-learning";
      slot.setAttribute("data-hg-place-sheet-learning", "1");
      slot.setAttribute("data-hg-place-sheet-section", "learning");
      slot.hidden = true;
      const language = root2.querySelector('[data-hg-place-sheet-section="language"]');
      const reading = root2.querySelector('[data-hg-place-sheet-section="reading"]');
      const news = root2.querySelector('[data-hg-place-sheet-section="news"]');
      const anchor = language || reading || news;
      if (anchor == null ? void 0 : anchor.nextSibling) root2.insertBefore(slot, anchor.nextSibling);
      else root2.appendChild(slot);
    }
    return slot;
  }
  function adoptCanonicalLearning(placeId2) {
    const id = text9(placeId2);
    if (!id) return null;
    const learning = embeddedLearning();
    if (!(learning instanceof HTMLElement)) return null;
    if (!learning.querySelector(".hg-place-learning-section")) return null;
    const slot = ensureSlot2();
    if (!(slot instanceof HTMLElement)) return null;
    let compat = slot.querySelector('[data-hg-place-sheet-learning-compat="1"]');
    if (!(compat instanceof HTMLElement)) {
      compat = document.createElement("div");
      compat.className = "pc-sheet-learning-compat hg-place-popup-v2";
      compat.setAttribute("data-hg-place-sheet-learning-compat", "1");
    }
    learning.hidden = false;
    learning.removeAttribute("aria-hidden");
    learning.setAttribute("role", "region");
    learning.style.scrollMarginTop = "76px";
    compat.replaceChildren(learning);
    slot.replaceChildren(compat);
    slot.hidden = false;
    slot.dataset.placeId = id;
    return slot;
  }
  function onUnifiedReady4(event) {
    var _a;
    const id = text9((_a = event.detail) == null ? void 0 : _a.placeId);
    if (id) adoptCanonicalLearning(id);
  }
  ensureStylesheet4();
  runtime9.addEventListener("hg:place-unified-ready", onUnifiedReady4);
  runtime9.HGPlaceSheetSections = {
    ...runtime9.HGPlaceSheetSections || {},
    learning: { adopt: adoptCanonicalLearning }
  };

  // js/ui/place-sheet/sections/special-sections.ts
  var runtime10 = window;
  var SPECIAL_SELECTOR = '.hg-place-nature-section, [data-hg-sport-training="1"]';
  var observer = null;
  var observerTimer = 0;
  var observedPlaceId = "";
  function text10(value) {
    return String(value == null ? "" : value).trim();
  }
  function list2(value) {
    return Array.isArray(value) ? value : [];
  }
  function shell3() {
    return document.querySelector('#placeCard [data-hg-place-sheet-shell="1"]');
  }
  function embeddedHost() {
    return document.getElementById("pcUnifiedKnowledgeHost");
  }
  function placeFor(placeId2) {
    var _a, _b;
    const id = text10(placeId2);
    if (!id) return null;
    try {
      const resolved = (_b = (_a = runtime10.HGPlaceOpen) == null ? void 0 : _a.getPlace) == null ? void 0 : _b.call(_a, id);
      if (resolved && typeof resolved === "object") return resolved;
    } catch {
    }
    return list2(runtime10.PLACES).find((place) => text10(place == null ? void 0 : place.id) === id) || null;
  }
  function hasTrainingContent(place) {
    var _a;
    if (!place) return false;
    const profile = place == null ? void 0 : place.training_profile;
    if (!profile || typeof profile !== "object" || Array.isArray(profile)) return false;
    const summary = text10(profile.summary);
    const safety = text10(profile.safety);
    const exercises = list2(profile.exercises).filter(Boolean);
    if (!summary && !safety && !exercises.length) return false;
    try {
      if (typeof ((_a = runtime10.HGPlacePopupSportTraining) == null ? void 0 : _a.isSportsPlace) === "function") {
        return runtime10.HGPlacePopupSportTraining.isSportsPlace(place) === true;
      }
    } catch {
    }
    const category = text10((place == null ? void 0 : place.category) || (place == null ? void 0 : place.categoryId)).toLowerCase();
    const sportProfile = place == null ? void 0 : place.sport_profile;
    return category === "sport" || Boolean(sportProfile && typeof sportProfile === "object" && Object.keys(sportProfile).length);
  }
  function currentSpecialNodes() {
    const host = embeddedHost();
    if (!(host instanceof HTMLElement)) return [];
    return [...host.querySelectorAll(SPECIAL_SELECTOR)];
  }
  function existingSpecialNodes(placeId2) {
    const id = text10(placeId2);
    const root2 = shell3();
    if (!(root2 instanceof HTMLElement)) return [];
    const slot = root2.querySelector('[data-hg-place-sheet-special="1"]');
    if (!(slot instanceof HTMLElement) || text10(slot.dataset.placeId) !== id) return [];
    return [...slot.querySelectorAll(SPECIAL_SELECTOR)];
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
    let slot = root2.querySelector('[data-hg-place-sheet-special="1"]');
    if (!(slot instanceof HTMLElement)) {
      slot = document.createElement("section");
      slot.className = "pc-sheet-special";
      slot.setAttribute("data-hg-place-sheet-special", "1");
      slot.setAttribute("data-hg-place-sheet-section", "special");
      slot.hidden = true;
      const sources = root2.querySelector('[data-hg-place-sheet-section="sources"]');
      if (sources == null ? void 0 : sources.nextSibling) root2.insertBefore(slot, sources.nextSibling);
      else root2.appendChild(slot);
    }
    slot.dataset.placeId = text10(placeId2);
    return slot;
  }
  function stopObserver() {
    observer == null ? void 0 : observer.disconnect();
    observer = null;
    if (observerTimer) runtime10.clearTimeout(observerTimer);
    observerTimer = 0;
    observedPlaceId = "";
  }
  function moveOwnedNodes(placeId2) {
    const id = text10(placeId2);
    if (!id) return null;
    const nodes = currentSpecialNodes();
    const slot = ensureSlot3(id);
    if (!(slot instanceof HTMLElement)) return null;
    nodes.forEach((node) => {
      node.hidden = false;
      node.removeAttribute("aria-hidden");
      node.setAttribute("role", "region");
      node.style.scrollMarginTop = "76px";
      node.dataset.hgPlaceSheetSpecialOwner = node.matches('[data-hg-sport-training="1"]') ? "sport-training" : "nature-landscape";
      slot.appendChild(node);
    });
    const hasContent = Boolean(slot.querySelector(SPECIAL_SELECTOR));
    slot.hidden = !hasContent;
    return hasContent ? slot : null;
  }
  function watchForLateTraining(placeId2) {
    const id = text10(placeId2);
    if (!id || !hasTrainingContent(placeFor(id))) return;
    if (existingSpecialNodes(id).some((node) => node.matches('[data-hg-sport-training="1"]'))) return;
    const host = embeddedHost();
    if (!(host instanceof HTMLElement)) return;
    if (observer && observedPlaceId === id) return;
    stopObserver();
    observedPlaceId = id;
    observer = new MutationObserver(() => {
      var _a;
      if (text10((_a = shell3()) == null ? void 0 : _a.dataset.placeId) !== id) {
        stopObserver();
        return;
      }
      moveOwnedNodes(id);
      if (existingSpecialNodes(id).some((node) => node.matches('[data-hg-sport-training="1"]'))) stopObserver();
    });
    observer.observe(host, { childList: true, subtree: true });
    observerTimer = runtime10.setTimeout(stopObserver, 2600);
  }
  function specialSectionsApply(placeId2) {
    const id = text10(placeId2);
    if (!id) return false;
    if (existingSpecialNodes(id).length || currentSpecialNodes().length) return true;
    return hasTrainingContent(placeFor(id));
  }
  function adoptCanonicalSpecialSections(placeId2) {
    const id = text10(placeId2);
    if (!id) return null;
    const slot = moveOwnedNodes(id);
    watchForLateTraining(id);
    return slot;
  }
  function onUnifiedReady5(event) {
    var _a;
    const id = text10((_a = event.detail) == null ? void 0 : _a.placeId);
    if (id && specialSectionsApply(id)) adoptCanonicalSpecialSections(id);
  }
  ensureStylesheet5();
  runtime10.addEventListener("hg:place-unified-ready", onUnifiedReady5);
  runtime10.HGPlaceSheetSections = {
    ...runtime10.HGPlaceSheetSections || {},
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
    ["news", "reading"],
    ["language", "learning"],
    ["sources"],
    ["special"]
  ];
  var runtime11 = window;
  function text11(value) {
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
    if (text11(node.dataset.placeId)) return true;
    if (node.querySelector("[data-hg-place-sheet-owner], [data-hg-place-sheet-special-owner], .hg-place-learning-section, [data-language-place], .hg-place-tab-generated")) return true;
    return text11(node.textContent).length > 0;
  }
  function placeSheetSectionApplies(id, placeId2) {
    var _a;
    const api = (_a = runtime11.HGPlaceSheetSections) == null ? void 0 : _a[id];
    if (!api || typeof api.applies !== "function") return true;
    try {
      return api.applies(placeId2) === true;
    } catch {
      return false;
    }
  }
  function nudgePlaceSheetSection(id, placeId2) {
    var _a;
    const api = (_a = runtime11.HGPlaceSheetSections) == null ? void 0 : _a[id];
    if (!api || typeof api.adopt !== "function") return;
    try {
      api.adopt(placeId2);
    } catch {
    }
  }

  // js/ui/place-sheet/place-sheet-state.ts
  var runtime12 = window;
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
      runtime12.dispatchEvent(new CustomEvent(name, { detail: cloneSnapshot(value) }));
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
  runtime12.HGPlaceSheetState = {
    snapshot: currentPlaceSheetSnapshot,
    cancel: cancelPlaceSheetGeneration
  };

  // js/ui/place-sheet/place-sheet-render-queue.ts
  var runtime13 = window;
  var compatibilityReady = /* @__PURE__ */ new Set();
  var compatibilityWaiters = /* @__PURE__ */ new Map();
  var promotedSections = /* @__PURE__ */ new Map();
  var pendingPromotions = /* @__PURE__ */ new Map();
  var COMPATIBILITY_SECTION_IDS = new Set(PLACE_SHEET_COMPAT_SECTION_BATCHES.flat());
  var activeHandle = null;
  function text12(value) {
    return String(value == null ? "" : value).trim();
  }
  function canonicalSectionId(value) {
    const id = text12(value);
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
    const scheduler = runtime13.scheduler;
    if (scheduler && typeof scheduler.postTask === "function") {
      try {
        await scheduler.postTask(() => void 0, { priority: "background", signal });
        return;
      } catch {
        if (signal.aborted) return;
      }
    }
    await new Promise((resolve) => {
      const finish = () => runtime13.setTimeout(resolve, 0);
      if (typeof runtime13.requestAnimationFrame === "function") runtime13.requestAnimationFrame(finish);
      else finish();
    });
  }
  function onCompatibilityReady(event) {
    var _a, _b;
    const placeId2 = text12((_a = event.detail) == null ? void 0 : _a.placeId);
    const snapshot = currentPlaceSheetSnapshot();
    if (!snapshot || snapshot.placeId !== placeId2) return;
    compatibilityReady.add(snapshot.generation);
    (_b = compatibilityWaiters.get(snapshot.generation)) == null ? void 0 : _b();
  }
  runtime13.addEventListener("hg:place-unified-ready", onCompatibilityReady);
  function waitForCompatibility(generation, placeId2, signal, timeoutMs = 2600) {
    if (compatibilityReady.has(generation)) return Promise.resolve(true);
    return new Promise((resolve) => {
      let settled = false;
      const finish = (value) => {
        if (settled) return;
        settled = true;
        runtime13.clearTimeout(timer);
        compatibilityWaiters.delete(generation);
        signal.removeEventListener("abort", onAbort);
        resolve(value);
      };
      const onAbort = () => finish(false);
      const timer = runtime13.setTimeout(() => finish(false), timeoutMs);
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
      await new Promise((resolve) => runtime13.setTimeout(resolve, 30));
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
    const placeId2 = text12(placeIdValue);
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
    const placeId2 = text12(placeIdValue);
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
      await new Promise((resolve) => runtime13.setTimeout(resolve, 20));
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
  runtime13.HGPlaceSheetRenderQueue = {
    start: startAutomaticPlaceSheetRender,
    promote: promoteAutomaticPlaceSheetSection,
    cancel: cancelAutomaticPlaceSheetRender,
    current: currentPlaceSheetSnapshot
  };

  // js/ui/place-sheet/place-sheet-direct-routing.ts
  var runtime14 = window;
  var INSTALL_FLAG = "__HG_PLACE_SHEET_DIRECT_ROUTING_INSTALLED__";
  var WRAPPED_FLAG = "__hgPlaceSheetDirectRouting";
  function text13(value) {
    return String(value == null ? "" : value).trim();
  }
  function resolvedPlace(place) {
    if (place && typeof place === "object") return place;
    const id = text13(place);
    return (Array.isArray(runtime14.PLACES) ? runtime14.PLACES : []).find((row) => text13(row == null ? void 0 : row.id) === id) || place;
  }
  function placeId(place) {
    const value = resolvedPlace(place);
    return text13((value == null ? void 0 : value.id) || (typeof value === "string" ? value : ""));
  }
  function isMicro(place) {
    const value = resolvedPlace(place);
    return text13(value == null ? void 0 : value.placeTier).toLowerCase() === "micro";
  }
  function canonicalSection(target) {
    var _a;
    const canonical = (_a = runtime14.HGPlaceUnifiedSurface) == null ? void 0 : _a.canonicalSection;
    return typeof canonical === "function" ? canonical(target || "about") : text13(target || "about");
  }
  async function finishPromotedRoute(value, promotion, sectionId) {
    var _a, _b;
    try {
      await promotion;
    } catch {
    }
    try {
      (_b = (_a = runtime14.HGPlaceUnifiedSurface) == null ? void 0 : _a.scrollToSection) == null ? void 0 : _b.call(_a, sectionId);
    } catch {
    }
    return value;
  }
  function wrapShowPlacePopup() {
    const current = runtime14.showPlacePopup;
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
    runtime14.showPlacePopup = wrapped;
    return true;
  }
  function wrapPopupTabBridge() {
    const tabs = runtime14.HGPlacePopupTabs;
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
    if (runtime14[INSTALL_FLAG]) return true;
    if (runtime14.__HG_PLACE_UNIFIED_SURFACE_INSTALLED__ !== true) return false;
    if (!runtime14.HGPlaceUnifiedSurface || typeof runtime14.showPlacePopup !== "function") return false;
    if (runtime14.showPlacePopup.__hgUnifiedPlaceSurface !== true) return false;
    wrapShowPlacePopup();
    wrapPopupTabBridge();
    runtime14[INSTALL_FLAG] = true;
    return true;
  }
  if (!install()) {
    let attempts = 0;
    const timer = runtime14.setInterval(() => {
      attempts += 1;
      if (install() || attempts > 400) runtime14.clearInterval(timer);
    }, 25);
  }

  // js/ui/place-sheet/place-sheet-shell.ts
  var SHELL_ATTR = "data-hg-place-sheet-shell";
  var SHELL_SECTION_ATTR = "data-hg-place-sheet-section";
  function text14(value) {
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
    return text14(place == null ? void 0 : place.placeTier).toLowerCase() === "micro";
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
        <div class="pc-sheet-hero-media" data-hg-place-sheet-media></div>
        <div class="pc-sheet-hero-copy" data-hg-place-sheet-copy></div>
      </div>
      <section class="pc-sheet-explore" aria-label="Utforsk stedet">
        <div class="pc-sheet-section-head">
          <span class="pc-sheet-section-eyebrow">Utforsk</span>
          <h2>Fire samlinger</h2>
        </div>
        <div class="pc-sheet-explore-grid" data-hg-place-sheet-collections></div>
      </section>
      <section class="pc-sheet-onsite" data-hg-place-sheet-onsite></section>
      <section class="pc-sheet-history" data-hg-place-sheet-history hidden></section>
      <section class="pc-sheet-stories" data-hg-place-sheet-stories hidden></section>
      <section class="pc-sheet-before-after" data-hg-place-sheet-before-after hidden></section>
      <section class="pc-sheet-news" data-hg-place-sheet-news data-hg-place-sheet-section="news" hidden></section>
    `;
      rootBody.prepend(shell4);
    }
    shell4.dataset.placeId = text14(place.id);
    root2.dataset.hgPlaceSheetPhase = "1";
    root2.classList.add("is-place-sheet-phase1");
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
    if (front && media && front.parentElement !== media) media.appendChild(front);
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
    let slot = shell4.querySelector("[data-hg-place-sheet-before-after]");
    if (!(slot instanceof HTMLElement)) {
      slot = document.createElement("section");
      slot.className = "pc-sheet-before-after";
      slot.setAttribute("data-hg-place-sheet-before-after", "1");
      shell4.appendChild(slot);
    }
    slot.setAttribute(SHELL_SECTION_ATTR, "before-after");
    return slot;
  }
  function mountPlaceSheetPhase1(place) {
    if (!place || isMicro2(place)) return null;
    const shell4 = ensureShell(place);
    if (!(shell4 instanceof HTMLElement)) return null;
    movePrimaryNodes(shell4);
    const aboutSlot = ensureAboutSlot(shell4);
    if (aboutSlot) {
      const about = mountCanonicalAbout(aboutSlot, place, { suppressIfSameAsDesc: true });
      about == null ? void 0 : about.classList.add("pc-sheet-canonical-about");
    }
    const historySlot = ensureHistorySlot(shell4);
    if (historySlot) {
      const history = mountCanonicalHistory(historySlot, place);
      history == null ? void 0 : history.classList.add("pc-sheet-canonical-history");
    }
    const storiesSlot = ensureStoriesSlot(shell4);
    if (storiesSlot) {
      const stories = mountCanonicalStories(storiesSlot, place);
      stories == null ? void 0 : stories.classList.add("pc-sheet-canonical-stories");
    }
    const beforeAfterSlot = ensureBeforeAfterSlot(shell4);
    if (beforeAfterSlot) {
      const beforeAfter = mountCanonicalBeforeAfter(beforeAfterSlot, place);
      beforeAfter == null ? void 0 : beforeAfter.classList.add("pc-sheet-canonical-before-after");
    }
    startAutomaticPlaceSheetRender(text14(place.id));
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
    root2.classList.remove("is-place-sheet-phase1");
    delete root2.dataset.hgPlaceSheetPhase;
  }
  function placeSheetSectionTarget(id) {
    var _a;
    const normalized2 = text14(id);
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
    const HOST_ID = "pcUnifiedKnowledgeHost";
    const EMBEDDED_CLASS = "hg-unified-renderer-embedded";
    const CARD_CLASS = "is-unified-place";
    const STAGING_CLASS = "hg-unified-place-staging";
    const GENERATION_ATTR = "hgUnifiedGeneration";
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
    const text15 = (value) => String(value == null ? "" : value).trim();
    const wait = (ms) => new Promise((resolve) => global.setTimeout(resolve, ms));
    let legacyOpenPlaceCard = null;
    let legacyShowPlacePopup = null;
    let generation = 0;
    let activeMount = Promise.resolve(null);
    function isMicro3(place) {
      return text15(place == null ? void 0 : place.placeTier).toLowerCase() === "micro";
    }
    function placeId2(place) {
      return text15(place == null ? void 0 : place.id);
    }
    function card2() {
      return document.getElementById("placeCard");
    }
    function currentPlace() {
      var _a, _b;
      const id = text15((_b = (_a = card2()) == null ? void 0 : _a.dataset) == null ? void 0 : _b.currentPlaceId);
      if (!id) return null;
      return (Array.isArray(global.PLACES) ? global.PLACES : []).find((place) => placeId2(place) === id) || null;
    }
    function canonicalSection2(value) {
      const key = text15(value).toLowerCase().replace(/\s+/g, "-");
      return SECTION_ALIASES[key] || (SECTION_ORDER.some(([id]) => id === key) ? key : "about");
    }
    function ensureStylesheet6() {
      const styles = [
        [STYLE_FLAG, "css/place-unified-surface.css"],
        [SHEET_STYLE_FLAG, "css/place-sheet.css"]
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
    function ensureHost(place) {
      const root2 = card2();
      const body2 = root2 == null ? void 0 : root2.querySelector(".pc-body");
      if (!(root2 instanceof HTMLElement) || !(body2 instanceof HTMLElement)) return null;
      let host = document.getElementById(HOST_ID);
      if (!(host instanceof HTMLElement)) {
        host = document.createElement("section");
        host.id = HOST_ID;
        host.className = "pc-unified-knowledge-host";
        host.setAttribute("aria-label", "Stedets kunnskap");
        host.innerHTML = '<div class="pc-unified-loading" data-hg-unified-loading aria-live="polite">Laster stedets innhold \u2026</div>';
        body2.appendChild(host);
      } else if (host.parentElement !== body2) {
        body2.appendChild(host);
      }
      root2.classList.add(CARD_CLASS);
      root2.dataset.hgUnifiedPlaceId = placeId2(place);
      return host;
    }
    function removeEmbeddedRenderer() {
      document.querySelectorAll(`.hg-popup.place-popup-v2.${EMBEDDED_CLASS}`).forEach((node) => node.remove());
    }
    function clearUnifiedState() {
      var _a, _b;
      restoreLegacyPlaceCardStructure();
      const root2 = card2();
      root2 == null ? void 0 : root2.classList.remove(CARD_CLASS);
      if (root2) {
        delete root2.dataset.hgUnifiedPlaceId;
        delete root2.dataset[GENERATION_ATTR];
      }
      removeEmbeddedRenderer();
      (_a = document.getElementById(HOST_ID)) == null ? void 0 : _a.remove();
      (_b = document.body) == null ? void 0 : _b.classList.remove(STAGING_CLASS);
    }
    async function waitForPopup(expectedGeneration, place, timeoutMs = 1800) {
      var _a, _b;
      const started = Date.now();
      const expectedName = text15((place == null ? void 0 : place.name) || (place == null ? void 0 : place.title));
      while (Date.now() - started < timeoutMs) {
        if (String(((_b = (_a = card2()) == null ? void 0 : _a.dataset) == null ? void 0 : _b[GENERATION_ATTR]) || "") !== String(expectedGeneration)) return null;
        const candidates = [...document.querySelectorAll(".hg-popup.place-popup-v2")].filter((node) => !node.classList.contains(EMBEDDED_CLASS));
        const popup = expectedName ? candidates.find((node) => {
          var _a2;
          return text15((_a2 = node.querySelector(".hg-modal-title")) == null ? void 0 : _a2.textContent) === expectedName;
        }) : candidates[0];
        if (popup instanceof HTMLElement) return popup;
        await wait(20);
      }
      return null;
    }
    async function waitForTabs(popup, expectedGeneration, timeoutMs = 1800) {
      var _a, _b;
      const started = Date.now();
      while (Date.now() - started < timeoutMs) {
        if (String(((_b = (_a = card2()) == null ? void 0 : _a.dataset) == null ? void 0 : _b[GENERATION_ATTR]) || "") !== String(expectedGeneration)) return null;
        const article = (popup == null ? void 0 : popup.querySelector('.hg-place-popup-v2[data-hg-place-tabs="1"]')) || (popup == null ? void 0 : popup.querySelector(".hg-place-popup-v2"));
        const panels = article == null ? void 0 : article.querySelector(".hg-place-tab-panels");
        if (article instanceof HTMLElement && panels instanceof HTMLElement) return article;
        await wait(20);
      }
      return null;
    }
    function sectionLabel(id) {
      var _a;
      if (id === "about" && placeSheetSectionTarget("about")) return "Mer om stedet";
      return ((_a = SECTION_ORDER.find(([key]) => key === id)) == null ? void 0 : _a[1]) || id;
    }
    function normalizePanels(article) {
      const panelWrap = article.querySelector(".hg-place-tab-panels");
      if (!(panelWrap instanceof HTMLElement)) return;
      [...panelWrap.querySelectorAll("[data-place-panel]")].forEach((panel) => {
        if (!(panel instanceof HTMLElement)) return;
        const id = text15(panel.dataset.placePanel);
        if (id === "more" || (id === "before-after" || id === "news") && placeSheetSectionTarget(id)) {
          panel.hidden = true;
          panel.setAttribute("aria-hidden", "true");
          panel.dataset.hgUnifiedSection = id;
          return;
        }
        panel.hidden = false;
        panel.removeAttribute("aria-hidden");
        panel.setAttribute("role", "region");
        panel.dataset.hgUnifiedSection = id;
        panel.style.scrollMarginTop = "76px";
        if (!panel.querySelector(":scope > .pc-unified-section-title")) {
          const heading = document.createElement("h2");
          heading.className = "pc-unified-section-title";
          heading.textContent = sectionLabel(id);
          panel.prepend(heading);
        }
      });
    }
    function bindUnifiedNavigation(popup, article) {
      const tablist = article.querySelector(".hg-place-tabs");
      const panelWrap = article.querySelector(".hg-place-tab-panels");
      if (!(tablist instanceof HTMLElement) || !(panelWrap instanceof HTMLElement)) return;
      tablist.classList.add("pc-unified-section-nav");
      tablist.setAttribute("aria-label", "Hopp til del av stedet");
      tablist.removeAttribute("role");
      [...tablist.querySelectorAll("[data-place-tab]")].forEach((button) => {
        if (!(button instanceof HTMLElement)) return;
        const id = canonicalSection2(button.dataset.placeTab);
        if (id === "about" && text15(button.dataset.placeTab) === "more") {
          button.remove();
          return;
        }
        button.removeAttribute("role");
        button.removeAttribute("aria-selected");
        button.removeAttribute("aria-controls");
        button.tabIndex = 0;
        button.dataset.hgUnifiedJump = id;
      });
      const intercept = (event) => {
        const target = event.target instanceof Element ? event.target.closest("[data-hg-unified-jump]") : null;
        if (!(target instanceof HTMLElement) || !popup.contains(target)) return;
        if (event.type === "keydown") {
          const keyboardEvent = event;
          if (!["Enter", " "].includes(keyboardEvent.key)) return;
        }
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        scrollToSection(target.dataset.hgUnifiedJump, { focus: event.type === "keydown" });
      };
      popup.addEventListener("click", intercept, true);
      popup.addEventListener("keydown", intercept, true);
      normalizePanels(article);
      const observer2 = new MutationObserver(() => normalizePanels(article));
      observer2.observe(panelWrap, { childList: true, subtree: false, attributes: true, attributeFilter: ["hidden", "aria-hidden"] });
      popup.__hgUnifiedPanelObserver = observer2;
    }
    async function ensureLearningSection(place, article) {
      const api = global.HGPlaceLearningSurface;
      if (!api || typeof api.loadRegistry !== "function" || typeof api.renderLearningSection !== "function") return null;
      let registry = null;
      try {
        registry = await api.loadRegistry();
      } catch {
      }
      if (!registry || !(article == null ? void 0 : article.isConnected)) return null;
      const body2 = article.querySelector(".hg-place-popup-body");
      if (!(body2 instanceof HTMLElement)) return null;
      let wrapper = body2.querySelector('[data-hg-unified-section="learning"]');
      const existingLearning = body2.querySelector(".hg-place-learning-section");
      if (!(wrapper instanceof HTMLElement)) {
        wrapper = document.createElement("section");
        wrapper.className = "hg-place-tab-panel pc-unified-learning-panel";
        wrapper.dataset.hgUnifiedSection = "learning";
        wrapper.setAttribute("role", "region");
        wrapper.style.scrollMarginTop = "76px";
        wrapper.innerHTML = '<h2 class="pc-unified-section-title">Fagverk</h2>';
        if (existingLearning instanceof HTMLElement) {
          wrapper.appendChild(existingLearning);
        } else {
          const rendered = text15(api.renderLearningSection(registry, place));
          if (!rendered) return null;
          wrapper.insertAdjacentHTML("beforeend", rendered);
        }
        const panels = body2.querySelector(".hg-place-tab-panels");
        panels == null ? void 0 : panels.insertAdjacentElement("afterend", wrapper);
      }
      const stableWrapper = wrapper;
      const reconcileLearning = () => {
        if (!stableWrapper.isConnected) return;
        const owned = stableWrapper.querySelector(".hg-place-learning-section");
        [...body2.querySelectorAll(".hg-place-learning-section")].forEach((section) => {
          if (!(section instanceof HTMLElement) || stableWrapper.contains(section)) return;
          if (owned) section.remove();
          else stableWrapper.appendChild(section);
        });
      };
      reconcileLearning();
      if (!stableWrapper.__hgUnifiedLearningObserver) {
        const observer2 = new MutationObserver(reconcileLearning);
        observer2.observe(body2, { childList: true, subtree: true });
        stableWrapper.__hgUnifiedLearningObserver = observer2;
        global.setTimeout(() => observer2.disconnect(), 1e4);
      }
      const nav = article.querySelector(".pc-unified-section-nav");
      if (nav instanceof HTMLElement && !nav.querySelector('[data-hg-unified-jump="learning"]')) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "hg-place-tab pc-unified-learning-jump";
        button.dataset.hgUnifiedJump = "learning";
        button.textContent = "Fagverk";
        const sourcesButton = nav.querySelector('[data-hg-unified-jump="sources"]');
        nav.insertBefore(button, sourcesButton || null);
      }
      return stableWrapper;
    }
    function prepareEmbeddedPopup(popup, article, place) {
      var _a, _b;
      const host = ensureHost(place);
      if (!(host instanceof HTMLElement)) return null;
      (_a = host.querySelector("[data-hg-unified-loading]")) == null ? void 0 : _a.remove();
      popup.classList.add(EMBEDDED_CLASS);
      popup.dataset.hgUnifiedPlaceId = placeId2(place);
      popup.setAttribute("aria-label", `Kunnskap om ${text15((place == null ? void 0 : place.name) || "stedet")}`);
      (_b = popup.querySelector(".hg-popup-close")) == null ? void 0 : _b.setAttribute("hidden", "");
      if (popup.parentElement !== host) host.replaceChildren(popup);
      bindUnifiedNavigation(popup, article);
      normalizePanels(article);
      return popup;
    }
    async function materialize(place, options = {}) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n;
      const id = placeId2(place);
      if (!id || isMicro3(place)) {
        clearUnifiedState();
        return null;
      }
      const root2 = card2();
      if (!(root2 instanceof HTMLElement)) return null;
      mountPlaceSheetPhase1(place);
      ensureHost(place);
      const currentEmbedded = document.querySelector(`.hg-popup.place-popup-v2.${EMBEDDED_CLASS}`);
      if (!options.refresh && currentEmbedded instanceof HTMLElement && currentEmbedded.dataset.hgUnifiedPlaceId === id) {
        return currentEmbedded;
      }
      const myGeneration = ++generation;
      root2.dataset[GENERATION_ATTR] = String(myGeneration);
      removeEmbeddedRenderer();
      const host = ensureHost(place);
      if (host instanceof HTMLElement) {
        host.innerHTML = '<div class="pc-unified-loading" data-hg-unified-loading aria-live="polite">Laster stedets innhold \u2026</div>';
      }
      if (typeof legacyShowPlacePopup !== "function") return null;
      (_a = document.body) == null ? void 0 : _a.classList.add(STAGING_CLASS);
      document.querySelectorAll(`.hg-popup.place-popup-v2:not(.${EMBEDDED_CLASS})`).forEach((node) => node.remove());
      try {
        const ownsHistory = placeSheetSectionTarget("history") instanceof HTMLElement;
        const ownsStories = placeSheetSectionTarget("stories") instanceof HTMLElement;
        const result = legacyShowPlacePopup(place, {
          unifiedHost: host instanceof HTMLElement ? host : null,
          suppressPlaceAbout: true,
          suppressPlaceHistory: ownsHistory,
          suppressPlaceStories: ownsStories
        });
        if (result && typeof result.then === "function") await result;
        const popup = await waitForPopup(myGeneration, place);
        if (!(popup instanceof HTMLElement)) return null;
        try {
          (_c = (_b = global.HGPlacePopupTabs) == null ? void 0 : _b.decoratePopup) == null ? void 0 : _c.call(_b, place, popup);
        } catch {
        }
        try {
          (_e = (_d = global.HGPlacePopupDirectTabs) == null ? void 0 : _d.decoratePopup) == null ? void 0 : _e.call(_d, place, popup);
        } catch {
        }
        try {
          const languageResult = (_g = (_f = global.HGLanguageLayer) == null ? void 0 : _f.decoratePopup) == null ? void 0 : _g.call(_f, place, popup);
          if (languageResult && typeof languageResult.then === "function") await languageResult;
        } catch {
        }
        const article = await waitForTabs(popup, myGeneration);
        if (!(article instanceof HTMLElement)) return null;
        if (String(root2.dataset[GENERATION_ATTR] || "") !== String(myGeneration)) return null;
        if (placeSheetSectionTarget("about")) (_h = popup.querySelector(".hg-place-about-section")) == null ? void 0 : _h.remove();
        if (placeSheetSectionTarget("history")) (_i = popup.querySelector(".hg-place-history-section")) == null ? void 0 : _i.remove();
        if (placeSheetSectionTarget("stories")) (_j = popup.querySelector(".hg-section-stories")) == null ? void 0 : _j.remove();
        if (placeSheetSectionTarget("before-after")) (_k = popup.querySelector('[data-generated="before-after"]')) == null ? void 0 : _k.remove();
        if (placeSheetSectionTarget("news")) (_l = popup.querySelector('[data-generated="news"]')) == null ? void 0 : _l.remove();
        const embedded = prepareEmbeddedPopup(popup, article, place);
        if (!(embedded instanceof HTMLElement)) return null;
        await ensureLearningSection(place, article);
        normalizePanels(article);
        (_m = global.dispatchEvent) == null ? void 0 : _m.call(global, new CustomEvent("hg:place-unified-ready", { detail: { placeId: id } }));
        return embedded;
      } catch (error) {
        if (global.DEBUG) console.warn("[place-unified-surface]", error);
        return null;
      } finally {
        if (String(root2.dataset[GENERATION_ATTR] || "") === String(myGeneration)) {
          (_n = document.body) == null ? void 0 : _n.classList.remove(STAGING_CLASS);
        }
      }
    }
    function scrollToSection(target, options = {}) {
      var _a, _b;
      const id = canonicalSection2(target);
      const root2 = card2();
      if (!(root2 instanceof HTMLElement)) return false;
      let section = ["about", "history", "stories", "before-after", "news"].includes(id) ? placeSheetSectionTarget(id) : null;
      if (!(section instanceof HTMLElement) && id === "learning") {
        section = root2.querySelector('[data-hg-unified-section="learning"]');
      } else if (!(section instanceof HTMLElement)) {
        section = [...root2.querySelectorAll("[data-place-panel]")].find((panel) => text15(panel.getAttribute("data-place-panel")) === id) || null;
      }
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
    async function openSection(place, target = "about") {
      var _a;
      const resolvedPlace2 = typeof place === "string" ? (Array.isArray(global.PLACES) ? global.PLACES : []).find((row) => placeId2(row) === text15(place)) : place;
      if (!resolvedPlace2) return false;
      if (isMicro3(resolvedPlace2)) {
        if (typeof legacyShowPlacePopup === "function") legacyShowPlacePopup(resolvedPlace2);
        return true;
      }
      const root2 = card2();
      const samePlace = text15((_a = root2 == null ? void 0 : root2.dataset) == null ? void 0 : _a.currentPlaceId) === placeId2(resolvedPlace2);
      if (!samePlace && typeof global.openPlaceCard === "function") await global.openPlaceCard(resolvedPlace2);
      else await materialize(resolvedPlace2, { refresh: false });
      const id = canonicalSection2(target);
      if (scrollToSection(id)) return true;
      await wait(30);
      return scrollToSection(id);
    }
    function patchOpenPlaceCard() {
      const current = global.openPlaceCard;
      if (typeof current !== "function" || current.__hgUnifiedPlaceSurface === true) return false;
      legacyOpenPlaceCard = current;
      const wrapped = async function openUnifiedPlaceCard(place, ...args) {
        var _a, _b;
        const result = current.call(this, place, ...args);
        const resolved = result && typeof result.then === "function" ? await result : result;
        if (isMicro3(place)) clearUnifiedState();
        else {
          activeMount = materialize(((_b = (_a = global.HGPlaceOpen) == null ? void 0 : _a.getPlace) == null ? void 0 : _b.call(_a, place)) || place, { refresh: true });
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
        if (isMicro3(place)) return current.apply(this, [place, target]);
        return openSection(place, target || "about");
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
    function install2() {
      ensureStylesheet6();
      if (global[INSTALL_FLAG2]) {
        installPopupTabBridge();
        return true;
      }
      if (typeof global.openPlaceCard !== "function" || typeof global.showPlacePopup !== "function") return false;
      if (global.showPlacePopup.__hgPlacePopupV2 !== true) return false;
      if (global.__HG_PLACE_POPUP_DIRECT_TABS_INSTALLED__ !== true) return false;
      patchOpenPlaceCard();
      patchShowPlacePopup();
      installPopupTabBridge();
      global[INSTALL_FLAG2] = true;
      global.HGPlaceUnifiedSurface = {
        ensure: (place2, options = {}) => materialize(place2, options),
        open: openSection,
        scrollToSection,
        clear: clearUnifiedState,
        currentPlace,
        canonicalSection: canonicalSection2,
        sectionIds: SECTION_ORDER.map(([id]) => id),
        get legacyOpenPlaceCard() {
          return legacyOpenPlaceCard;
        },
        get legacyShowPlacePopup() {
          return legacyShowPlacePopup;
        }
      };
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
