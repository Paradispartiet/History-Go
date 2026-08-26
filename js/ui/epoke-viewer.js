// ============================================================
// HG Epoke Viewer – dedicated timeline for canonical epochs
// ------------------------------------------------------------
// Reads existing runtime data only. Canonical epochs remain the time resolver's
// timeline; optional parallel tracks are rendered separately as perspectives.
// ============================================================

(function () {
  "use strict";

  const ROOT_ID = "hgEpokeViewer";
  const STYLE_ID = "hgEpokeViewerStyles";
  const URL_EPOCH_PARAM = "epoke";
  const URL_DOMAIN_PARAM = "epoke_domain";
  let previousFocus = /** @type {HTMLElement|null} */ (null);
  let historyOwned = false;

  function txt(value) {
    return String(value ?? "").trim();
  }

  function esc(value) {
    return txt(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function num(value) {
    if (value == null || value === "") return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  function runtimeDomain(place) {
    const raw = txt(place?.domain || place?.category || place?.categoryId || place?.fag);
    if (!raw) return "";
    try {
      return txt(window.DomainRegistry?.toRuntimeCategoryId?.(raw)) || raw;
    } catch {
      return raw;
    }
  }

  function domainLabel(domain) {
    const labels = {
      by: "By & arkitektur",
      historie: "Historie",
      kunst: "Kunst",
      litteratur: "Litteratur",
      media: "Media",
      musikk: "Musikk",
      naeringsliv: "Næringsliv",
      natur: "Natur",
      politikk: "Politikk & samfunn",
      psykologi: "Psykologi",
      helse: "Helse",
      utdanning: "Utdanning",
      religion: "Religion",
      scenekunst: "Scenekunst",
      sport: "Sport",
      subkultur: "Subkultur",
      vitenskap: "Vitenskap",
      filosofi: "Filosofi",
      film_tv: "Film & TV",
      tv: "TV"
    };
    return labels[domain] || txt(domain).replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
  }

  function epochLabel(epoch) {
    return txt(epoch?.label || epoch?.name || epoch?.title || epoch?.id) || "Uten navn";
  }

  function epochDescription(epoch) {
    return txt(epoch?.description || epoch?.definition || epoch?.summary || epoch?.intro || epoch?.one_liner);
  }

  function yearRange(epoch) {
    const start = num(epoch?.start_year);
    const end = num(epoch?.end_year);
    if (start != null && end != null) return start === end ? String(start) : `${start}–${end}`;
    if (start != null) return `${start}–`;
    if (end != null) return `–${end}`;
    return "Udatert";
  }

  function placeYearLabel(place, resolution) {
    const start = num(resolution?.startYear);
    const end = num(resolution?.endYear);
    if (start != null && end != null) return start === end ? String(start) : `${start}–${end}`;
    if (start != null) return String(start);
    if (end != null) return String(end);
    return txt(place?.year);
  }

  function sortPlaces(rows) {
    return rows.slice().sort((a, b) => {
      const aKey = Number.isFinite(a?.resolution?.sortKey) ? a.resolution.sortKey : Number.MAX_SAFE_INTEGER;
      const bKey = Number.isFinite(b?.resolution?.sortKey) ? b.resolution.sortKey : Number.MAX_SAFE_INTEGER;
      if (aKey !== bKey) return aKey - bKey;
      return txt(a?.place?.name || a?.place?.id).localeCompare(txt(b?.place?.name || b?.place?.id), "nb");
    });
  }

  function resolvePlace(place) {
    const resolver = window.HGTimeResolver;
    if (!resolver?.resolvePlaceTime) return null;
    try {
      return resolver.resolvePlaceTime(place, { domain: runtimeDomain(place) });
    } catch (err) {
      console.warn("[HGEpokeViewer] resolvePlaceTime failed", place?.id, err);
      return null;
    }
  }

  function availableDomains() {
    const byDomain = window.EPOKER_INDEX?.byDomain || {};
    const canonical = window.DomainRegistry?.listRuntimeCategories?.() || [];
    const source = canonical.length ? canonical : Object.keys(byDomain);
    return source
      .filter((domain) => Array.isArray(byDomain?.[domain]?.list) && byDomain[domain].list.length)
      .sort((a, b) => domainLabel(a).localeCompare(domainLabel(b), "nb"));
  }

  function chronologicalList(domainIndex) {
    if (Array.isArray(domainIndex?.byStart)) return domainIndex.byStart;
    if (!Array.isArray(domainIndex?.list)) return [];
    return domainIndex.list.slice().sort(
      (a, b) => (num(a?.start_year) ?? 999999) - (num(b?.start_year) ?? 999999)
    );
  }

  function buildTimeline(domain) {
    const epochs = chronologicalList(window.EPOKER_INDEX?.byDomain?.[domain]);
    const parallel = chronologicalList(window.EPOKER_INDEX?.parallelByDomain?.[domain]);
    const epochIds = new Set(epochs.map((epoch) => txt(epoch?.id)).filter(Boolean));
    const rows = (Array.isArray(window.PLACES) ? window.PLACES : [])
      .filter((place) => runtimeDomain(place) === domain)
      .map((place) => ({ place, resolution: resolvePlace(place) }));

    const byEpoch = new Map(epochs.map((epoch) => [txt(epoch?.id), []]));
    const unassigned = [];
    for (const row of rows) {
      const epochId = txt(row?.resolution?.epokeId);
      if (epochId && epochIds.has(epochId)) byEpoch.get(epochId).push(row);
      else unassigned.push(row);
    }

    return {
      epochs: epochs.map((epoch) => ({ epoch, places: sortPlaces(byEpoch.get(txt(epoch?.id)) || []) })),
      parallel,
      unassigned: sortPlaces(unassigned),
      placeCount: rows.length
    };
  }

  function fagverkLinks(epoch) {
    return (Array.isArray(epoch?.fagverk_links) ? epoch.fagverk_links : [])
      .filter((link) => txt(link?.subject_id));
  }

  function fagverkHref(link, currentPlaceId) {
    const subjectId = txt(link?.subject_id);
    if (!subjectId) return "";
    const periodIds = (Array.isArray(link?.period_ids) ? link.period_ids : []).map(txt).filter(Boolean);
    const exactPeriodId = periodIds.length === 1 ? periodIds[0] : "";
    const params = [`subject=${encodeURIComponent(subjectId)}`];
    if (exactPeriodId) params.push(`period=${encodeURIComponent(exactPeriodId)}`);
    if (currentPlaceId) params.push(`place=${encodeURIComponent(currentPlaceId)}`);
    const anchor = exactPeriodId && subjectId === "historie"
      ? `historie-periode-${exactPeriodId}`
      : txt(link?.anchor);
    return `fagverk.html?${params.join("&")}${anchor ? `#${encodeURIComponent(anchor)}` : ""}`;
  }

  function fagverkLinksHtml(epoch, currentPlaceId) {
    const links = fagverkLinks(epoch);
    if (!links.length) return "";
    return `<div class="hg-epoke-node__fagverk"><span class="hg-epoke-node__fagverk-kicker">Faglig fordypning</span>${links.map((link) => {
      const subjectId = txt(link?.subject_id);
      const subjectLabel = domainLabel(subjectId);
      const label = txt(link?.label) || epochLabel(epoch);
      return `<a class="hg-epoke-fagverk-link" href="${esc(fagverkHref(link, currentPlaceId))}">${esc(subjectLabel)}-fagverket · ${esc(label)} →</a>`;
    }).join("")}</div>`;
  }

  function readUrlState() {
    const url = new URL(window.location.href);
    const epochId = txt(url.searchParams.get(URL_EPOCH_PARAM));
    const domain = txt(url.searchParams.get(URL_DOMAIN_PARAM));
    return { epochId, domain, active: Boolean(epochId || domain) };
  }

  function findEpochContext(epochId) {
    const id = txt(epochId);
    if (!id) return null;
    const byDomain = window.EPOKER_INDEX?.byDomain || {};
    for (const [domain, index] of Object.entries(byDomain)) {
      if (index?.byId?.[id]) return { domain, epoch: index.byId[id] };
    }
    return null;
  }

  function writeUrlState(domain, epochId, mode = "replace") {
    const url = new URL(window.location.href);
    if (domain) url.searchParams.set(URL_DOMAIN_PARAM, domain);
    else url.searchParams.delete(URL_DOMAIN_PARAM);
    if (epochId) url.searchParams.set(URL_EPOCH_PARAM, epochId);
    else url.searchParams.delete(URL_EPOCH_PARAM);
    const state = history.state && typeof history.state === "object" ? history.state : {};
    const nextState = { ...state, hgEpokeViewer: true };
    if (mode === "push") history.pushState(nextState, "", url);
    else history.replaceState(nextState, "", url);
    historyOwned = true;
  }

  function clearUrlState() {
    const url = new URL(window.location.href);
    url.searchParams.delete(URL_EPOCH_PARAM);
    url.searchParams.delete(URL_DOMAIN_PARAM);
    const state = history.state && typeof history.state === "object" ? { ...history.state } : {};
    delete state.hgEpokeViewer;
    history.replaceState(state, "", url);
    historyOwned = false;
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .hg-epoke-viewer{position:fixed;inset:0;z-index:var(--hg-z-modal,9000);display:grid;place-items:center;padding:clamp(8px,2vw,22px);background:rgba(0,0,0,.72);backdrop-filter:blur(8px)}
      .hg-epoke-viewer__panel{width:min(980px,100%);height:min(86dvh,900px);display:flex;flex-direction:column;overflow:hidden;border:1px solid rgba(255,255,255,.18);border-radius:24px;background:linear-gradient(180deg,#171611,#0c0b09);box-shadow:0 24px 70px rgba(0,0,0,.6);color:#fff}
      .hg-epoke-viewer__head{display:grid;grid-template-columns:1fr auto;gap:12px;padding:18px 20px 14px;border-bottom:1px solid rgba(255,255,255,.12)}
      .hg-epoke-viewer__kicker{font-size:12px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:rgba(255,255,255,.62)}
      .hg-epoke-viewer__title{margin:2px 0 3px;font-size:clamp(26px,4vw,42px);line-height:1;font-weight:850}
      .hg-epoke-viewer__summary{font-size:13px;color:rgba(255,255,255,.7)}
      .hg-epoke-viewer__close{align-self:start;width:42px;height:42px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#fff;font:inherit;font-size:24px;cursor:pointer}
      .hg-epoke-viewer__toolbar{display:flex;align-items:center;gap:10px;padding:10px 20px;border-bottom:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.025)}
      .hg-epoke-viewer__toolbar label{font-size:12px;font-weight:750;color:rgba(255,255,255,.7)}
      .hg-epoke-viewer__select{min-width:min(330px,70vw);max-width:100%;padding:9px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.18);background:#171611;color:#fff;font:inherit}
      .hg-epoke-viewer__body{overflow:auto;padding:20px 20px 30px;scroll-behavior:smooth}
      .hg-epoke-timeline{position:relative;display:flex;flex-direction:column;gap:14px;padding-left:24px}
      .hg-epoke-timeline::before{content:"";position:absolute;left:7px;top:13px;bottom:13px;width:2px;background:rgba(255,255,255,.18)}
      .hg-epoke-node{position:relative;display:grid;grid-template-columns:minmax(86px,120px) minmax(0,1fr);gap:14px;padding:14px;border:1px solid rgba(255,255,255,.12);border-radius:18px;background:rgba(255,255,255,.045)}
      .hg-epoke-node::before{content:"";position:absolute;left:-22px;top:23px;width:12px;height:12px;border-radius:50%;background:#fff;box-shadow:0 0 0 5px #0f0e0b,0 0 0 6px rgba(255,255,255,.18)}
      .hg-epoke-node.is-current{border-color:rgba(255,255,255,.48);background:rgba(255,255,255,.09)}
      .hg-epoke-node.is-current::before{width:15px;height:15px;left:-23.5px;top:21.5px}
      .hg-epoke-node__years{font-size:13px;font-weight:800;letter-spacing:.04em;color:rgba(255,255,255,.72)}
      .hg-epoke-node__name{margin:0;font-size:19px;line-height:1.15}
      .hg-epoke-node__desc{margin:6px 0 0;font-size:13px;line-height:1.4;color:rgba(255,255,255,.68)}
      .hg-epoke-node__fagverk{display:flex;flex-wrap:wrap;align-items:center;gap:7px;margin-top:10px}
      .hg-epoke-node__fagverk-kicker{font-size:10px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:rgba(255,255,255,.48)}
      .hg-epoke-fagverk-link{display:inline-flex;align-items:center;min-height:32px;padding:6px 10px;border:1px solid rgba(255,255,255,.2);border-radius:10px;background:rgba(255,255,255,.07);color:#fff;font-size:12px;font-weight:760;text-decoration:none}
      .hg-epoke-fagverk-link:hover,.hg-epoke-fagverk-link:focus-visible{background:rgba(255,255,255,.14);border-color:rgba(255,255,255,.42);outline:none}
      .hg-epoke-node__places{display:flex;flex-wrap:wrap;gap:7px;margin-top:11px}
      .hg-epoke-place{display:inline-flex;align-items:center;gap:6px;min-height:34px;padding:7px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:rgba(0,0,0,.26);color:#fff;font:inherit;font-size:12px;font-weight:750;cursor:pointer;text-align:left}
      .hg-epoke-place:hover,.hg-epoke-place:focus-visible{background:rgba(255,255,255,.12);outline:none;border-color:rgba(255,255,255,.42)}
      .hg-epoke-place.is-current{background:#fff;color:#111;border-color:#fff}
      .hg-epoke-place__year{font-weight:650;opacity:.62}
      .hg-epoke-node__empty{margin-top:9px;font-size:12px;color:rgba(255,255,255,.45)}
      .hg-epoke-unassigned{margin-top:18px;padding:14px;border:1px dashed rgba(255,255,255,.18);border-radius:16px}
      .hg-epoke-unassigned h3{margin:0 0 4px;font-size:15px}
      .hg-epoke-unassigned p{margin:0;font-size:12px;color:rgba(255,255,255,.58)}
      .hg-epoke-parallel{margin-top:24px;padding-top:18px;border-top:1px solid rgba(255,255,255,.12)}
      .hg-epoke-parallel__title{margin:0;font-size:18px}
      .hg-epoke-parallel__intro{margin:5px 0 12px;font-size:12px;line-height:1.45;color:rgba(255,255,255,.6)}
      .hg-epoke-parallel__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}
      .hg-epoke-parallel__card{padding:13px;border:1px solid rgba(255,255,255,.12);border-radius:16px;background:rgba(255,255,255,.035)}
      .hg-epoke-parallel__card .hg-epoke-node__years{margin-bottom:4px}
      @media (max-width:640px){.hg-epoke-viewer{padding:0;place-items:stretch}.hg-epoke-viewer__panel{width:100%;height:100dvh;border-radius:0;border-left:0;border-right:0}.hg-epoke-viewer__head{padding:15px 14px 12px}.hg-epoke-viewer__toolbar{padding:9px 14px}.hg-epoke-viewer__body{padding:16px 12px 26px}.hg-epoke-node{grid-template-columns:1fr;gap:6px}.hg-epoke-node__years{font-size:11px}.hg-epoke-viewer__select{min-width:0;flex:1}}
    `;
    document.head.appendChild(style);
  }

  function closeDom() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return;
    root.remove();
    document.removeEventListener("keydown", onKeyDown);
    previousFocus?.focus();
    previousFocus = null;
  }

  function close() {
    if (historyOwned && history.state?.hgEpokeViewer) {
      history.back();
      return;
    }
    if (readUrlState().active) clearUrlState();
    closeDom();
  }

  function onKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  }

  function navigateToPlace(place) {
    const id = txt(place?.id || place?.placeId);
    if (!id) return;
    if (readUrlState().active) clearUrlState();
    closeDom();
    if (window.HGMapView?.openPlace?.(id)) return;
    if (window.flyToPlace?.(place)) return;
    void window.openPlaceCard?.(place);
  }

  function placeButtonHtml(row, currentPlaceId) {
    const place = row?.place || {};
    const id = txt(place?.id || place?.placeId);
    const label = txt(place?.name || place?.title || id) || "Ukjent sted";
    const years = placeYearLabel(place, row?.resolution);
    const current = Boolean(id && id === currentPlaceId);
    return `<button type="button" class="hg-epoke-place${current ? " is-current" : ""}" data-epoke-place-id="${esc(id)}"${current ? ' aria-current="true"' : ""}><span>${esc(label)}</span>${years ? `<span class="hg-epoke-place__year">${esc(years)}</span>` : ""}</button>`;
  }

  function parallelHtml(parallel) {
    if (!parallel.length) return "";
    return `<section class="hg-epoke-parallel" aria-labelledby="hgEpokeParallelTitle">
      <h3 class="hg-epoke-parallel__title" id="hgEpokeParallelTitle">Gjennomgående historiske spor</h3>
      <p class="hg-epoke-parallel__intro">Disse sporene går på tvers av flere perioder. De er perspektiver å følge gjennom tidslinjen, ikke egne trinn i kronologien.</p>
      <div class="hg-epoke-parallel__grid">${parallel.map((track) => `<article class="hg-epoke-parallel__card" data-parallel-epoke-id="${esc(txt(track?.id))}"><div class="hg-epoke-node__years">${esc(yearRange(track))}</div><h4 class="hg-epoke-node__name">${esc(epochLabel(track))}</h4>${epochDescription(track) ? `<p class="hg-epoke-node__desc">${esc(epochDescription(track))}</p>` : ""}</article>`).join("")}</div>
    </section>`;
  }

  function renderTimeline(root, domain, currentPlaceId, currentEpochId) {
    const body = /** @type {HTMLElement|null} */ (root.querySelector("[data-epoke-body]"));
    const summary = /** @type {HTMLElement|null} */ (root.querySelector("[data-epoke-summary]"));
    if (!body) return;

    const timeline = buildTimeline(domain);
    const epochsWithPlaces = timeline.epochs.filter((entry) => entry.places.length).length;
    if (summary) {
      const parallelSummary = timeline.parallel.length ? ` · ${timeline.parallel.length} gjennomgående spor` : "";
      summary.textContent = `${timeline.epochs.length} epoker · ${timeline.placeCount} steder · ${epochsWithPlaces} epoker med steder${parallelSummary}`;
    }

    const nodes = timeline.epochs.map(({ epoch, places }) => {
      const id = txt(epoch?.id);
      const current = Boolean(id && id === currentEpochId);
      const description = epochDescription(epoch);
      return `<article class="hg-epoke-node${current ? " is-current" : ""}" data-epoke-id="${esc(id)}"${current ? ' aria-current="true"' : ""}>
        <div class="hg-epoke-node__years">${esc(yearRange(epoch))}</div>
        <div><h3 class="hg-epoke-node__name">${esc(epochLabel(epoch))}</h3>${description ? `<p class="hg-epoke-node__desc">${esc(description)}</p>` : ""}${fagverkLinksHtml(epoch, currentPlaceId)}${places.length ? `<div class="hg-epoke-node__places">${places.map((row) => placeButtonHtml(row, currentPlaceId)).join("")}</div>` : '<div class="hg-epoke-node__empty">Ingen registrerte steder i denne epoken ennå.</div>'}</div>
      </article>`;
    }).join("");

    const unassigned = timeline.unassigned.length ? `<section class="hg-epoke-unassigned"><h3>Steder uten registrert epoke</h3><p>Disse stedene tilhører fagområdet, men kan ikke plasseres sikkert i en canonical epoke ennå.</p><div class="hg-epoke-node__places">${timeline.unassigned.map((row) => placeButtonHtml(row, currentPlaceId)).join("")}</div></section>` : "";
    const empty = !timeline.epochs.length && !timeline.unassigned.length
      ? `<section class="hg-epoke-unassigned"><h3>Ingen epoker eller steder registrert ennå</h3><p>${esc(domainLabel(domain))} har foreløpig ingen canonical epoketidslinje.</p></section>`
      : "";

    body.innerHTML = `<div class="hg-epoke-timeline">${nodes}</div>${unassigned}${empty}${parallelHtml(timeline.parallel)}`;
    body.querySelectorAll("[data-epoke-place-id]").forEach((node) => {
      const button = /** @type {HTMLElement} */ (node);
      button.addEventListener("click", () => {
        const placeId = txt(button.getAttribute("data-epoke-place-id"));
        const place = (Array.isArray(window.PLACES) ? window.PLACES : []).find((candidate) => {
          const candidatePlace = /** @type {any} */ (candidate);
          return txt(candidatePlace?.id || candidatePlace?.placeId) === placeId;
        });
        if (place) navigateToPlace(place);
      });
    });

    requestAnimationFrame(() => {
      const currentNode = /** @type {HTMLElement|null} */ (body.querySelector(".hg-epoke-node.is-current"));
      currentNode?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  }

  /** @param {any} [options] */
  async function open(options = {}) {
    if (window.HGEpokerRuntime?.ready) await window.HGEpokerRuntime.ready;
    ensureStyles();
    closeDom();

    const place = options.place || null;
    const currentPlaceId = txt(place?.id || place?.placeId);
    const resolution = options.resolution || resolvePlace(place) || {};
    const requestedDomain = txt(resolution?.domain) || runtimeDomain(place);
    const available = availableDomains();
    const domains = requestedDomain && !available.includes(requestedDomain)
      ? [requestedDomain, ...available]
      : available;
    let domain = requestedDomain || domains[0] || "";
    const currentEpochId = txt(resolution?.epokeId);
    const historyMode = txt(options.historyMode) || (history.state?.hgEpokeViewer ? "replace" : "push");
    if (historyMode !== "none") writeUrlState(domain, currentEpochId, historyMode === "push" ? "push" : "replace");

    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const root = document.createElement("div");
    root.id = ROOT_ID;
    root.className = "hg-epoke-viewer";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-labelledby", "hgEpokeViewerTitle");
    root.innerHTML = `<section class="hg-epoke-viewer__panel"><header class="hg-epoke-viewer__head"><div><div class="hg-epoke-viewer__kicker">History Go · Epoker</div><h2 class="hg-epoke-viewer__title" id="hgEpokeViewerTitle">Tidslinje</h2><div class="hg-epoke-viewer__summary" data-epoke-summary></div></div><button type="button" class="hg-epoke-viewer__close" aria-label="Lukk epokevisning">×</button></header><div class="hg-epoke-viewer__toolbar"><label for="hgEpokeDomainSelect">Fagområde</label><select id="hgEpokeDomainSelect" class="hg-epoke-viewer__select" data-epoke-domain>${domains.map((candidate) => `<option value="${esc(candidate)}"${candidate === domain ? " selected" : ""}>${esc(domainLabel(candidate))}</option>`).join("")}</select></div><div class="hg-epoke-viewer__body" data-epoke-body></div></section>`;

    document.body.appendChild(root);
    const closeButton = /** @type {HTMLButtonElement|null} */ (root.querySelector(".hg-epoke-viewer__close"));
    closeButton?.addEventListener("click", close);
    root.addEventListener("click", (event) => {
      if (event.target === root) close();
    });
    document.addEventListener("keydown", onKeyDown);

    const select = /** @type {HTMLSelectElement|null} */ (root.querySelector("[data-epoke-domain]"));
    select?.addEventListener("change", () => {
      domain = txt(select.value);
      writeUrlState(domain, "", "replace");
      renderTimeline(root, domain, currentPlaceId, domain === txt(resolution?.domain) ? currentEpochId : "");
    });

    renderTimeline(root, domain, currentPlaceId, currentEpochId);
    closeButton?.focus();
    return root;
  }

  async function openFromUrl() {
    if (window.HGEpokerRuntime?.ready) await window.HGEpokerRuntime.ready;
    const state = readUrlState();
    if (!state.active) return null;
    const context = state.epochId ? findEpochContext(state.epochId) : null;
    const domain = txt(context?.domain) || state.domain;
    if (!domain) return null;
    historyOwned = Boolean(history.state?.hgEpokeViewer);
    return open({ resolution: { domain, epokeId: state.epochId }, historyMode: "none" });
  }

  window.addEventListener("popstate", () => {
    const state = readUrlState();
    historyOwned = Boolean(history.state?.hgEpokeViewer);
    if (state.active) void openFromUrl();
    else closeDom();
  });

  Object.assign(window, {
    HGEpokeViewer: { open, close, openFromUrl, buildTimeline, readUrlState }
  });
})();