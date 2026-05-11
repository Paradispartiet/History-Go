// js/leksikon/leksikon_loader.js
// Minimal JSON-basert leksikonruntime for PlaceCard-rundingen.
// Leser data/leksikon/manifest.json og indekserer artikler på place_id.

(function () {
  "use strict";

  const MANIFEST_URL = "data/leksikon/manifest.json";
  const SPRAK_MANIFEST_URL = "data/leksikon/sprak/manifest.json";
  let initPromise = null;
  let sprakManifestPromise = null;
  let currentLeksikonContext = null;
  const sprakByPlace = Object.create(null);

  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function norm(value) {
    return String(value ?? "").trim();
  }

  function basePath() {
    const base = document.querySelector("base")?.getAttribute("href");
    if (base) return base.endsWith("/") ? base : `${base}/`;

    const isGitHubPages = location.hostname.includes("github.io");
    if (isGitHubPages) return "/History-Go/";

    return location.pathname.replace(/[^/]+$/, "") || "/";
  }

  function urlFor(path) {
    const clean = String(path || "").replace(/^\/+/, "");
    return `${basePath()}${clean}`.replace(/([^:]\/)\/+/g, "$1");
  }

  async function fetchJSON(path) {
    const res = await fetch(urlFor(path), { cache: "no-store" });
    if (!res.ok) throw new Error(`Fetch failed ${res.status} for ${path}`);
    return res.json();
  }

  function articleTitle(article) {
    const explicitTitle = norm(article?.title || article?.name || article?.label);
    if (explicitTitle) return explicitTitle;

    const place = (Array.isArray(window.PLACES) ? window.PLACES : [])
      .find(p => norm(p?.id) === norm(article?.place_id));

    return place?.name || article?.summary?.one_liner || article?.place_id || "Leksikon";
  }

  function listHtml(items, mapper) {
    if (!Array.isArray(items) || !items.length) return "";
    return items.map(mapper).filter(Boolean).join("");
  }

  function sanitizeExternalUrl(rawUrl) {
    const value = norm(rawUrl);
    if (!value) return "";
    try {
      const parsed = new URL(value, window.location.origin);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return "";
      return parsed.href;
    } catch (_) {
      return "";
    }
  }

  function normalizeExternalLinks(...containers) {
    const rawLinks = containers.flatMap((container) => (
      Array.isArray(container?.externalLinks) ? container.externalLinks : []
    ));

    return rawLinks
      .map((link) => {
        const type = norm(link?.type).toLowerCase();
        const url = sanitizeExternalUrl(link?.url);
        const label = norm(link?.label);
        if (!url) return null;
        return {
          type,
          url,
          label: label || url
        };
      })
      .filter(Boolean);
  }

  function renderExternalLinks(place, article) {
    const links = normalizeExternalLinks(place, article);
    if (!links.length) return `<section class="pc-leksikon-section"><p>Ingen kilder eller lenker ennå.</p></section>`;
    const typeLabels = {
      official: "Offisiell nettside",
      wikipedia: "Wikipedia",
      stats: "Statistikk",
      results: "Resultater",
      source: "Kilde",
      archive: "Arkiv",
      other: "Annen lenke"
    };

    return `
      <section class="pc-leksikon-section">
        <div class="pc-leksikon-list">
          ${links.map((link) => `
            <a class="pc-leksikon-entry" href="${esc(link.url)}" target="_blank" rel="noopener noreferrer">
              <span class="pc-leksikon-entry-title">${esc(link.label)}</span>
              <span class="pc-leksikon-entry-meta">${esc(typeLabels[link.type] || "Ekstern lenke")}</span>
            </a>
          `).join("")}
        </div>
      </section>
    `;
  }

  function tagListHtml(values) {
    if (!Array.isArray(values) || !values.length) return "";
    return `<div class="pc-leksikon-tags">${values.map(v => `<span>${esc(v)}</span>`).join("")}</div>`;
  }

  function section(title, body) {
    const html = norm(body);
    if (!html) return "";
    return `
      <section class="pc-leksikon-section">
        <h3>${esc(title)}</h3>
        ${html}
      </section>
    `;
  }

  function renderSprakEntries(article) {
    const entries = Array.isArray(article?.entries) ? article.entries : [];
    if (!entries.length) {
      return `<p>Ingen språkoppføringer ennå.</p>`;
    }

    return entries.map((entry) => `
      <article class="pc-leksikon-item">
        <strong>${esc(entry?.term || entry?.id || "Begrep")}</strong>
        ${entry?.type ? `<p><em>${esc(entry.type)}</em></p>` : ""}
        ${entry?.meaning ? `<p>${esc(entry.meaning)}</p>` : ""}
        ${entry?.context ? `<p>${esc(entry.context)}</p>` : ""}
      </article>
    `).join("");
  }

  function detailRow(label, value) {
    const text = norm(value);
    if (!text) return "";
    return `<p><strong>${esc(label)}:</strong> ${esc(text)}</p>`;
  }

  function normalizeSectionItems(article, place, sprakArticle) {
    const persons = Array.isArray(article?.persons) ? article.persons : (Array.isArray(article?.people) ? article.people : []);
    const objects = Array.isArray(article?.objects) ? article.objects : (Array.isArray(article?.artifacts) ? article.artifacts : []);
    const sourceLinks = normalizeExternalLinks(place, article);
    const sprakEntries = Array.isArray(sprakArticle?.entries) ? sprakArticle.entries : [];
    return { persons, objects, sourceLinks, sprakEntries };
  }

  function getTextSignals(entry) {
    const fields = [
      entry?.type,
      entry?.kind,
      entry?.category,
      entry?.id,
      entry?.title,
      entry?.name,
      entry?.label,
      entry?.popupDesc,
      entry?.summary?.one_liner,
      ...(Array.isArray(entry?.tags) ? entry.tags : []),
      ...(Array.isArray(entry?.summary?.themes) ? entry.summary.themes : [])
    ];
    return fields.map((v) => norm(v).toLowerCase()).filter(Boolean).join(" ");
  }

  function isLanguageEntry(entry) {
    const allowed = new Set([
      "fagord", "uttrykk", "kallenavn", "historisk_navn", "slang", "sitat", "lokal_vending", "betegnelse", "personord", "objektord", "ord", "historisk betegnelse"
    ]);
    const blocked = ["arrangement", "event", "competition", "sports_event", "record", "result", "stat", "statistikk", "stevne"];
    const type = norm(entry?.type).toLowerCase();
    const signals = getTextSignals(entry);
    if (allowed.has(type)) return true;
    if (blocked.some((k) => signals.includes(k))) return false;
    return type.includes("ord") || type.includes("uttrykk") || type.includes("begrep") || type.includes("term");
  }

  function classifyLeksikonEntry(entry) {
    const signals = getTextSignals(entry);
    const kind = norm(entry?.kind || entry?.type || entry?.category).toLowerCase();

    const isEvent = ["arrangement", "event", "competition", "sports_event", "stevne", "rekord", "record", "resultat", "result", "statistikk", "stats", "idrettshistorie"].some((k) => signals.includes(k) || kind.includes(k));
    if (isEvent) return "events";

    const isHistory = ["historie", "historisk", "bruksspor", "flerbruk", "kultur", "minne", "fotballspor", "skøyte", "vinteridrett", "tidligere bruk", "epoke", "løpekultur"].some((k) => signals.includes(k) || kind.includes(k));
    if (isHistory) return "history";

    const isObject = ["object", "objekt", "artifact", "anlegg", "facility", "arena", "installation", "infrastructure", "spor", "dekke"].some((k) => signals.includes(k) || kind.includes(k));
    if (isObject) return "objects";

    return "history";
  }

  function resolveMainLeksikonArticle(articles, place) {
    const rows = Array.isArray(articles) ? articles.filter(Boolean) : [];
    if (!rows.length) return null;
    const placeName = norm(place?.name).toLowerCase();

    const byPlaceName = rows.find((row) => {
      const title = norm(row?.title || row?.name || row?.label).toLowerCase();
      return placeName && title && title === placeName;
    });
    if (byPlaceName) return byPlaceName;

    const mainSignals = ["main", "primary", "hoved", "hovedartikkel"];
    const byMainKind = rows.find((row) => {
      const signals = [
        norm(row?.type),
        norm(row?.kind),
        norm(row?.category),
        norm(row?.id)
      ].map((v) => v.toLowerCase()).join(" ");
      return mainSignals.some((keyword) => signals.includes(keyword));
    });
    if (byMainKind) return byMainKind;

    return rows[0];
  }

  function groupLeksikonEntries(mainArticle, place, sprakArticle, allArticles) {
    const sections = normalizeSectionItems(mainArticle, place, sprakArticle);
    const placeId = norm(mainArticle?.place_id);
    const entries = (Array.isArray(allArticles) ? allArticles : []).filter((row) => norm(row?.place_id) === placeId && row !== mainArticle);

    const groups = {
      place: mainArticle ? [mainArticle] : [],
      persons: [...sections.persons],
      objects: [...sections.objects],
      events: [],
      history: [],
      sprak: [],
      links: sections.sourceLinks
    };

    for (const entry of entries) {
      const bucket = classifyLeksikonEntry(entry);
      groups[bucket].push(entry);
    }

    for (const entry of sections.sprakEntries) {
      if (isLanguageEntry(entry)) groups.sprak.push(entry);
      else {
        const eventLike = classifyLeksikonEntry(entry) === "events";
        groups[eventLike ? "events" : "history"].push(entry);
      }
    }

    return groups;
  }

  function renderHubCard(title, description, count, detailType, showCount = true, attrs = "") {
    const countHtml = showCount ? `<span class="pc-leksikon-entry-meta">${count} ${count === 1 ? "oppføring" : "oppføringer"}</span>` : "";
    return `
      <button class="pc-leksikon-entry" type="button" data-leksikon-detail="${esc(detailType)}" ${attrs}>
        <span class="pc-leksikon-entry-title">${esc(title)}</span>
        ${countHtml}
        ${description ? `<span class="pc-leksikon-entry-meta">${esc(description)}</span>` : ""}
      </button>
    `;
  }

  function renderOverview(mainArticle, place, sprakArticle, allArticles) {
    const groups = groupLeksikonEntries(mainArticle, place, sprakArticle, allArticles);
    return `
      <article class="pc-leksikon-article">
        <div class="pc-leksikon-kicker">Leksikon</div>
        <h2 class="hg-popup-name">${esc(articleTitle(mainArticle))}</h2>
        <section class="pc-leksikon-section">
          <div class="pc-leksikon-list">
            ${renderHubCard("Sted", "Hovedartikkel om stedet.", groups.place.length, "place", false)}
            ${groups.events.length ? renderHubCard("Arrangementer / idrettshistorie", "Stevner, rekorder, resultater og idrettshistoriske hendelser.", groups.events.length, "section", true, 'data-leksikon-section="events"') : ""}
            ${groups.history.length ? renderHubCard("Historie / bruksspor", "Tidligere bruk, kulturhistorie og flerbruksspor.", groups.history.length, "section", true, 'data-leksikon-section="history"') : ""}
            ${renderHubCard("Objekter / anlegg", "Fysiske spor, installasjoner og anleggsobjekter.", groups.objects.length, "section", true, 'data-leksikon-section="objects"')}
            ${renderHubCard("Personer", "Personer knyttet til stedet.", groups.persons.length, "section", true, 'data-leksikon-section="persons"')}
            ${renderHubCard("Språkleksikon", "Ord, fagtermer og uttrykk knyttet til stedet.", groups.sprak.length, "section", true, 'data-leksikon-section="sprak"')}
            ${renderHubCard("Kilder / lenker", "Kilder og relevante eksterne lenker.", groups.links.length, "links", true)}
          </div>
        </section>
      </article>
    `;
  }

  function renderBackHeader(target = "hub", label = "Leksikon") {
    return `<button class="pc-leksikon-back" type="button" data-leksikon-back="${esc(target)}">← ${esc(label)}</button>`;
  }

  function renderSectionList(mainArticle, sectionType, groups) {
    const map = {
      events: { title: "Arrangementer / idrettshistorie", items: groups.events, source: "article" },
      history: { title: "Historie / bruksspor", items: groups.history, source: "article" },
      objects: { title: "Objekter / anlegg", items: groups.objects, source: "object" },
      persons: { title: "Personer", items: groups.persons, source: "person" },
      sprak: { title: "Språkleksikon", items: groups.sprak, source: "sprak" }
    };
    const config = map[sectionType];
    if (!config) return `<div class="pc-empty">Ukjent seksjon.</div>`;
    const items = config.items || [];

    return `
      <article class="pc-leksikon-article">
        ${renderBackHeader("hub", "Leksikon")}
        <div class="pc-leksikon-kicker">${esc(config.title)}</div>
        <h2 class="hg-popup-name">${esc(articleTitle(mainArticle))}</h2>
        <section class="pc-leksikon-section">
          <div class="pc-leksikon-list">
            ${items.length ? items.map((item, idx) => `<button class="pc-leksikon-entry" type="button" data-leksikon-detail="entry" data-leksikon-item-index="${idx}" data-leksikon-item-source="${esc(config.source)}"><span class="pc-leksikon-entry-title">${esc(item?.title || item?.name || item?.label || item?.term || item?.id || "Oppføring")}</span>${(item?.type || item?.kind || item?.category) ? `<span class="pc-leksikon-entry-meta">${esc(item?.type || item?.kind || item?.category)}</span>` : ""}${item?.summary?.one_liner ? `<span class="pc-leksikon-entry-meta">${esc(item.summary.one_liner)}</span>` : ""}</button>`).join("") : `<div class="pc-leksikon-entry"><span class="pc-leksikon-entry-title">Ingen oppføringer ennå</span></div>`}
          </div>
        </section>
      </article>
    `;
  }

  async function renderDetailPopup(mainArticle, place, sprakArticle, detailType, itemIndex, sectionType, allArticles, itemSource) {
    const groups = groupLeksikonEntries(mainArticle, place, sprakArticle, allArticles);
    const idx = Number(itemIndex) || 0;

    if (detailType === "section") {
      return renderSectionList(mainArticle, sectionType, groups);
    }

    if (detailType === "entry") {
      const collection = sectionType ? (groups[sectionType] || []) : [];
      const entry = collection[idx];
      if (!entry) return `<div class="pc-empty">Fant ikke oppføringen.</div>`;

      if (itemSource === "person") detailType = "person";
      else if (itemSource === "object") detailType = "object";
      else if (itemSource === "sprak") detailType = "sprak";
      else detailType = "article";

      if (detailType === "article") {
        return renderArticle(entry, "section", "Til seksjon");
      }

      const backLabel = sectionType ? "Til seksjon" : "Leksikon";
      const backTarget = sectionType ? "section" : "hub";

      if (detailType === "person") {
        return `
          <article class="pc-leksikon-article">
            ${renderBackHeader(backTarget, backLabel)}
            <div class="pc-leksikon-kicker">Person</div>
            <h2 class="hg-popup-name">${esc(entry?.name || entry?.title || entry?.id || "Person")}</h2>
            ${entry?.type ? `<p class="hg-popup-desc">${esc(entry.type)}</p>` : ""}
            ${paragraphBlockHtml(entry?.desc || entry?.description || entry?.meaning)}
            ${detailRow("Kontekst", entry?.context)}
            ${tagListHtml(entry?.tags)}
          </article>
        `;
      }

      if (detailType === "object") {
        return `
          <article class="pc-leksikon-article">
            ${renderBackHeader(backTarget, backLabel)}
            <div class="pc-leksikon-kicker">Objekt</div>
            <h2 class="hg-popup-name">${esc(entry?.title || entry?.name || entry?.label || entry?.id || "Objekt")}</h2>
            ${entry?.type ? `<p class="hg-popup-desc">${esc(entry.type)}</p>` : ""}
            ${paragraphBlockHtml(entry?.desc || entry?.description || entry?.meaning)}
            ${detailRow("Hvor", entry?.where)}
            ${detailRow("Kontekst", entry?.context)}
            ${tagListHtml(entry?.tags)}
          </article>
        `;
      }

      if (detailType === "sprak") {
        return `
          <article class="pc-leksikon-article">
            ${renderBackHeader(backTarget, backLabel)}
            <div class="pc-leksikon-kicker">Språkleksikon</div>
            <h2 class="hg-popup-name">${esc(entry?.term || entry?.id || "Begrep")}</h2>
            ${entry?.type ? `<p class="hg-popup-desc">${esc(entry.type)}</p>` : ""}
            ${entry?.meaning ? `<p>${esc(entry.meaning)}</p>` : ""}
            ${detailRow("Kontekst", entry?.context)}
            ${entry?.linked_to ? detailRow("Tilknyttet", `${entry.linked_to.kind || "ukjent"}: ${entry.linked_to.id || "ukjent"}`) : ""}
            ${tagListHtml(entry?.tags)}
          </article>
        `;
      }
    }

    if (detailType === "place") {
      return renderArticle(mainArticle, "hub", "Leksikon");
    }

    if (detailType === "links") {
      return `
        <article class="pc-leksikon-article">
          ${renderBackHeader("hub", "Leksikon")}
          <div class="pc-leksikon-kicker">Kilder / lenker</div>
          <h2 class="hg-popup-name">${esc(articleTitle(mainArticle))}</h2>
          ${renderExternalLinks(place, mainArticle)}
        </article>
      `;
    }

    return renderArticle(mainArticle, "hub", "Leksikon");
  }

  async function loadSprakManifest() {
    if (sprakManifestPromise) return sprakManifestPromise;
    sprakManifestPromise = fetchJSON(SPRAK_MANIFEST_URL).catch(() => ({ place_files: {} }));
    return sprakManifestPromise;
  }

  async function loadSprakForPlace(placeId) {
    const id = norm(placeId);
    if (!id) return null;
    if (Object.prototype.hasOwnProperty.call(sprakByPlace, id)) {
      return sprakByPlace[id];
    }

    const manifest = await loadSprakManifest();
    const file = manifest?.place_files?.[id];
    if (!file) {
      sprakByPlace[id] = null;
      return null;
    }

    const article = await fetchJSON(file).catch(() => null);
    sprakByPlace[id] = article && norm(article.place_id) === id ? article : null;
    return sprakByPlace[id];
  }

  function paragraphBlockHtml(value, className = "") {
    const values = Array.isArray(value) ? value : [value];
    const paragraphs = values
      .map(v => norm(v))
      .filter(Boolean)
      .map(v => `<p${className ? ` class="${esc(className)}"` : ""}>${esc(v)}</p>`)
      .join("");

    return paragraphs;
  }

  async function resolvePlaceForArticle(article) {
    const articlePlaceId = norm(article?.place_id);
    if (!articlePlaceId) return null;

    const currentPlace = (Array.isArray(window.PLACES) ? window.PLACES : [])
      .find((p) => norm(p?.id) === articlePlaceId);

    if (typeof window.DataHub?.loadFullPlace !== "function") return currentPlace || null;

    try {
      const fullPlace = await window.DataHub.loadFullPlace(articlePlaceId, { cache: "no-store" });
      if (fullPlace && typeof fullPlace === "object") return fullPlace;
    } catch (err) {
      console.warn("[HGLeksikon] full place lookup feilet", articlePlaceId, err);
    }

    return currentPlace || null;
  }

  async function renderArticle(article, backTarget = "hub", backLabel = "Leksikon") {
    if (!article) return `<div class="pc-empty">Ingen leksikonartikkel funnet</div>`;

    const summary = article.summary || {};
    const built = article.built_environment || {};
    const interpretation = article.interpretation || {};
    const events = article.events || {};
    const classification = article.classification || {};
    const place = await resolvePlaceForArticle(article);
    const sprakArticle = await loadSprakForPlace(article.place_id);

    const factsHtml = listHtml(article.facts, fact => `
      <article class="pc-leksikon-item">
        <strong>${esc(fact.label || fact.id || "Fakta")}</strong>
        ${fact.desc ? `<p>${esc(fact.desc)}</p>` : ""}
      </article>
    `);

    const chronologyHtml = listHtml(article.chronology, row => `
      <article class="pc-leksikon-item">
        <strong>${esc(row.period || row.year || row.id || "Tidslag")}</strong>
        ${row.desc ? `<p>${esc(row.desc)}</p>` : ""}
      </article>
    `);

    const changesHtml = listHtml(built.changes, row => `
      <article class="pc-leksikon-item">
        <strong>${esc(row.label || row.year || "Endring")}</strong>
        ${row.desc ? `<p>${esc(row.desc)}</p>` : ""}
      </article>
    `);

    const storiesHtml = listHtml(article.stories, story => `
      <article class="pc-leksikon-item">
        <strong>${esc(story.title || story.id || "Historie")}</strong>
        ${story.one_liner ? `<p>${esc(story.one_liner)}</p>` : ""}
      </article>
    `);

    const artifactsHtml = listHtml(article.artifacts, item => `
      <article class="pc-leksikon-item">
        <strong>${esc(item.title || item.id || "Spor")}</strong>
        ${item.desc ? `<p>${esc(item.desc)}</p>` : ""}
        ${item.where ? `<small>${esc(item.where)}</small>` : ""}
      </article>
    `);

    const societyEventsHtml = listHtml(events.politics_society, evt => `
      <article class="pc-leksikon-item">
        <strong>${esc(evt.title || evt.year || "Hendelse")}</strong>
        ${evt.desc ? `<p>${esc(evt.desc)}</p>` : ""}
      </article>
    `);

    const noticeHtml = listHtml(interpretation.what_to_notice, v => `<li>${esc(v)}</li>`);
    const whyHtml = listHtml(interpretation.why_it_matters, v => `<li>${esc(v)}</li>`);
    const counterHtml = listHtml(interpretation.counterpoints, v => `<li>${esc(v)}</li>`);

    const functionHtml = [
      built.original_function ? `<p><strong>Opprinnelig:</strong> ${esc(built.original_function)}</p>` : "",
      built.current_function ? `<p><strong>I dag:</strong> ${esc(built.current_function)}</p>` : "",
      changesHtml
    ].filter(Boolean).join("");

    const interpretationHtml = [
      noticeHtml ? `<h4>Legg merke til</h4><ul>${noticeHtml}</ul>` : "",
      whyHtml ? `<h4>Hvorfor det betyr noe</h4><ul>${whyHtml}</ul>` : "",
      counterHtml ? `<h4>Motpunkter</h4><ul>${counterHtml}</ul>` : ""
    ].filter(Boolean).join("");

    return `
      <article class="pc-leksikon-article">
        ${renderBackHeader(backTarget, backLabel)}
        <div class="pc-leksikon-kicker">Sted</div>
        <h2 class="hg-popup-name">${esc(articleTitle(article))}</h2>
        ${summary.one_liner ? `<p class="pc-leksikon-one-liner">${esc(summary.one_liner)}</p>` : ""}
        ${tagListHtml(summary.themes)}
        ${article.popupDesc ? `<p class="hg-popup-desc">${esc(article.popupDesc)}</p>` : ""}
        ${section("Artikkel", paragraphBlockHtml(article.wikiText, "pc-leksikon-wiki-text"))}
        ${section("Fakta", factsHtml)}
        ${section("Tidslinje", chronologyHtml)}
        ${section("Bygd miljø og funksjon", functionHtml)}
        ${section("Hendelser og samfunn", societyEventsHtml)}
        ${section("Historier", storiesHtml)}
        ${section("Spor og objekter", artifactsHtml)}
        ${section("Tolkning", interpretationHtml)}
        ${section("Klassifikasjon", tagListHtml([...(classification.tags || []), ...(classification.knagger || [])]))}
      </article>
    `;
  }

  function renderPlaceList(placeId) {
    const articles = window.LEKSIKON_BY_PLACE?.[norm(placeId)] || [];
    if (!articles.length) return "";

    return `
      <div class="pc-leksikon-list">
        <button class="pc-leksikon-entry" type="button" data-leksikon-open-hub data-leksikon-place="${esc(norm(placeId))}">
          <span class="pc-leksikon-entry-title">Leksikon</span>
          <span class="pc-leksikon-entry-meta">Åpne leksikon for dette stedet</span>
        </button>
      </div>
    `;
  }

  async function openPlace(placeId, index = 0, detailType = "", itemIndex = 0, sectionType = "", itemSource = "") {
    const articles = window.LEKSIKON_BY_PLACE?.[norm(placeId)] || [];
    const article = articles[Number(index) || 0];
    const normalizedIndex = Number(index) || 0;
    currentLeksikonContext = { placeId: norm(placeId), index: normalizedIndex, detailType: detailType || "hub", sectionType: sectionType || "", itemIndex: Number(itemIndex) || 0, itemSource: itemSource || "" };

    const popupFn = window.makePopup || (typeof makePopup === "function" ? makePopup : null);
    if (typeof popupFn === "function") {
      const place = await resolvePlaceForArticle(article);
      const mainArticle = resolveMainLeksikonArticle(articles, place) || article;
      const sprakArticle = await loadSprakForPlace(article?.place_id);
      const html = detailType
        ? await renderDetailPopup(mainArticle, place, sprakArticle, detailType, itemIndex, sectionType, articles, itemSource)
        : renderOverview(mainArticle, place, sprakArticle, articles);
      popupFn(html, "leksikon-entry-popup");
      return;
    }

    window.showToast?.("Popup-systemet er ikke lastet");
  }

  function patchPlaceCard() {
    const originalOpenPlaceCard = window.openPlaceCard;
    if (typeof originalOpenPlaceCard !== "function" || originalOpenPlaceCard.__leksikonPatched) return;

    window.openPlaceCard = async function (...args) {
      const result = await originalOpenPlaceCard.apply(this, args);
      const place = args[0];
      try {
        await init();
        const listEl = document.getElementById("pcLeksikonList");
        const iconEl = document.getElementById("pcLeksikonIcon");
        const articles = window.LEKSIKON_BY_PLACE?.[norm(place?.id)] || [];
        if (listEl && articles.length) {
          listEl.innerHTML = renderPlaceList(place.id);
        }
        if (iconEl && articles.length) {
          iconEl.innerHTML = `
            <div class="pc-round-label">
              <span class="pc-round-emoji">📚</span>
              <span class="pc-round-count">${articles.length}</span>
            </div>
          `;
        }
      } catch (err) {
        console.warn("[HGLeksikon PlaceCard]", err);
      }
      return result;
    };

    window.openPlaceCard.__leksikonPatched = true;
  }

  async function init() {
    if (initPromise) return initPromise;

    initPromise = (async () => {
      const manifest = await fetchJSON(MANIFEST_URL).catch(() => ({ files: [] }));
      const files = Array.isArray(manifest.files) ? manifest.files : [];
      const byPlace = Object.create(null);
      const all = [];

      for (const file of files) {
        const data = await fetchJSON(file).catch(err => {
          console.warn("[HGLeksikon] hoppet over", file, err?.message || err);
          return null;
        });

        const rows = Array.isArray(data)
          ? data
          : Array.isArray(data?.places)
            ? data.places
            : data?.place_id
              ? [data]
              : [];

        for (const row of rows) {
          const id = norm(row?.place_id || row?.place);
          if (!id) continue;
          (byPlace[id] ||= []).push(row);
          all.push(row);
        }
      }

      window.LEKSIKON_BY_PLACE = byPlace;
      window.LEKSIKON_ARTICLES = all;
      return { byPlace, all };
    })();

    return initPromise;
  }

  document.addEventListener("click", (event) => {
    const openHubBtn = event.target.closest("[data-leksikon-open-hub]");
    if (openHubBtn) {
      event.preventDefault();
      event.stopPropagation();
      void openPlace(openHubBtn.dataset.leksikonPlace, 0);
      return;
    }

    const btn = event.target.closest("[data-leksikon-place]");
    if (!btn) return;
    event.preventDefault();
    event.stopPropagation();
    void openPlace(btn.dataset.leksikonPlace, btn.dataset.leksikonIndex);
  });

  document.addEventListener("click", (event) => {
    const detailBtn = event.target.closest("[data-leksikon-detail]");
    if (!detailBtn) return;
    if (!currentLeksikonContext?.placeId) return;
    event.preventDefault();
    event.stopPropagation();
    const detailType = detailBtn.dataset.leksikonDetail;
    const sectionType = detailBtn.dataset.leksikonSection || currentLeksikonContext.sectionType || "";
    const nextSection = detailType === "section" ? (detailBtn.dataset.leksikonSection || "") : sectionType;
    void openPlace(
      currentLeksikonContext.placeId,
      currentLeksikonContext.index,
      detailType,
      detailBtn.dataset.leksikonItemIndex,
      nextSection,
      detailBtn.dataset.leksikonItemSource
    );
  });

  document.addEventListener("click", (event) => {
    const backBtn = event.target.closest("[data-leksikon-back]");
    if (!backBtn) return;
    if (!currentLeksikonContext?.placeId) return;
    event.preventDefault();
    event.stopPropagation();
    const target = backBtn.dataset.leksikonBack || "hub";
    if (target === "section" && currentLeksikonContext.sectionType) {
      void openPlace(currentLeksikonContext.placeId, currentLeksikonContext.index, "section", 0, currentLeksikonContext.sectionType);
      return;
    }
    void openPlace(currentLeksikonContext.placeId, currentLeksikonContext.index);
  });

  window.HGLeksikon = {
    init,
    openPlace,
    renderPlaceList,
    renderArticle,
    patchPlaceCard
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", patchPlaceCard, { once: true });
  } else {
    patchPlaceCard();
  }
})();
