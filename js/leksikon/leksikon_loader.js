// js/leksikon/leksikon_loader.js
// Minimal JSON-basert leksikonruntime for PlaceCard-rundingen.
// Leser data/leksikon/manifest.json og indekserer artikler på place_id.

(function () {
  "use strict";

  const MANIFEST_URL = "data/leksikon/manifest.json";
  let initPromise = null;

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

  function normalizeExternalLinks(place) {
    if (!Array.isArray(place?.externalLinks)) return [];
    return place.externalLinks
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

  function renderExternalLinks(place) {
    const links = normalizeExternalLinks(place);
    if (!links.length) return `<section class="pc-leksikon-section"><h3>Eksterne lenker</h3><p>Ingen eksterne lenker ennå</p></section>`;

    const groups = [
      { title: "Statistikk/resultater", types: ["stats"] },
      { title: "Offisiell nettside", types: ["official"] },
      { title: "Wikipedia", types: ["wikipedia"] },
      { title: "Andre kilder", types: ["source", "archive", "other"] }
    ];

    const parts = groups.map((group) => {
      const rows = links.filter(link => group.types.includes(link.type));
      if (!rows.length) return "";
      return `
        <article class="pc-leksikon-item">
          <strong>${esc(group.title)}</strong>
          <ul>
            ${rows.map((link) => `
              <li><a href="${esc(link.url)}" target="_blank" rel="noopener noreferrer">${esc(link.label)}</a></li>
            `).join("")}
          </ul>
        </article>
      `;
    }).filter(Boolean).join("");

    return section("Eksterne lenker", parts);
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

  function paragraphBlockHtml(value, className = "") {
    const values = Array.isArray(value) ? value : [value];
    const paragraphs = values
      .map(v => norm(v))
      .filter(Boolean)
      .map(v => `<p${className ? ` class="${esc(className)}"` : ""}>${esc(v)}</p>`)
      .join("");

    return paragraphs;
  }

  function renderArticle(article) {
    if (!article) return `<div class="pc-empty">Ingen leksikonartikkel funnet</div>`;

    const summary = article.summary || {};
    const built = article.built_environment || {};
    const interpretation = article.interpretation || {};
    const events = article.events || {};
    const classification = article.classification || {};
    const place = (Array.isArray(window.PLACES) ? window.PLACES : [])
      .find(p => norm(p?.id) === norm(article?.place_id));

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
        <div class="pc-leksikon-kicker">Leksikon</div>
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
        ${renderExternalLinks(place)}
        <button class="reward-ok" data-close-popup>Lukk</button>
      </article>
    `;
  }

  function renderPlaceList(placeId) {
    const articles = window.LEKSIKON_BY_PLACE?.[norm(placeId)] || [];
    if (!articles.length) return "";

    return `
      <div class="pc-leksikon-list">
        ${articles.map((article, index) => `
          <button class="pc-leksikon-entry" type="button" data-leksikon-place="${esc(article.place_id)}" data-leksikon-index="${index}">
            <span class="pc-leksikon-entry-title">${esc(articleTitle(article))}</span>
            ${article.summary?.one_liner ? `<span class="pc-leksikon-entry-meta">${esc(article.summary.one_liner)}</span>` : ""}
          </button>
        `).join("")}
      </div>
    `;
  }

  function openPlace(placeId, index = 0) {
    const articles = window.LEKSIKON_BY_PLACE?.[norm(placeId)] || [];
    const article = articles[Number(index) || 0];

    const popupFn = window.makePopup || (typeof makePopup === "function" ? makePopup : null);
    if (typeof popupFn === "function") {
      popupFn(renderArticle(article), "leksikon-entry-popup");
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
    const btn = event.target.closest("[data-leksikon-place]");
    if (!btn) return;
    event.preventDefault();
    event.stopPropagation();
    openPlace(btn.dataset.leksikonPlace, btn.dataset.leksikonIndex);
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
