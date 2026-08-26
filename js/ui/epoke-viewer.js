// ============================================================
// HG Epoke Viewer – dedicated timeline for canonical epochs
// ------------------------------------------------------------
// Canonical epochs remain the time resolver's timeline. A generated relation
// index adds dated, source-backed place evidence without changing place data;
// optional parallel tracks are rendered separately as perspectives.
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
    const parallelEpochs = chronologicalList(window.EPOKER_INDEX?.parallelByDomain?.[domain]);
    const epochIds = new Set(epochs.map((epoch) => txt(epoch?.id)).filter(Boolean));
    const allPlaces = Array.isArray(window.PLACES) ? window.PLACES : [];
    const rows = allPlaces
      .filter((place) => runtimeDomain(place) === domain)
      .map((place) => ({ place, resolution: resolvePlace(place) }));

    const generatedDomain = window.HG_EPOKE_PLACE_INDEX?.domains?.[domain];
    if (generatedDomain?.epochs && domain === "historie") {
      const placeById = new Map(allPlaces.map((place) => [txt(place?.id), place]));
      const indexedIds = new Set();
      const epochRows = epochs.map((epoch) => {
        const group = generatedDomain.epochs?.[txt(epoch?.id)] || { places: [] };
        const places = (Array.isArray(group.places) ? group.places : []).map((evidence) => {
          const place = placeById.get(txt(evidence?.place_id)) || {
            id: txt(evidence?.place_id),
            name: txt(evidence?.name),
            category: txt(evidence?.category)
          };
          indexedIds.add(txt(evidence?.place_id));
          const firstYear = num(evidence?.milestones?.[0]?.year);
          return {
            place,
            evidence,
            resolution: {
              domain,
              epokeId: txt(epoch?.id),
              startYear: firstYear,
              endYear: num(evidence?.milestones?.at?.(-1)?.year) ?? firstYear,
              sortKey: firstYear ?? Number.MAX_SAFE_INTEGER
            }
          };
        });
        return { epoch, places: sortPlaces(places), evidence: group };
      });
      const unassigned = rows.filter((row) => !indexedIds.has(txt(row?.place?.id)));
      const parallel = parallelEpochs.map((track) => ({
        ...track,
        evidence: generatedDomain.parallel_tracks?.[txt(track?.id)] || { places: [], placeCount: 0, milestoneCount: 0 }
      }));
      return {
        epochs: epochRows,
        parallel,
        unassigned: sortPlaces(unassigned),
        placeCount: new Set([...indexedIds, ...unassigned.map((row) => txt(row?.place?.id))]).size,
        generated: true
      };
    }

    const byEpoch = new Map(epochs.map((epoch) => [txt(epoch?.id), []]));
    const unassigned = [];
    for (const row of rows) {
      const epochId = txt(row?.resolution?.epokeId);
      if (epochId && epochIds.has(epochId)) byEpoch.get(epochId).push(row);
      else unassigned.push(row);
    }

    return {
      epochs: epochs.map((epoch) => ({ epoch, places: sortPlaces(byEpoch.get(txt(epoch?.id)) || []) })),
      parallel: parallelEpochs,
      unassigned: sortPlaces(unassigned),
      placeCount: rows.length,
      generated: false
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
      .hg-epoke-node__select{display:block;width:100%;padding:0;border:0;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}
      .hg-epoke-node__select:hover .hg-epoke-node__name,.hg-epoke-node__select:focus-visible .hg-epoke-node__name{text-decoration:underline;text-underline-offset:3px}.hg-epoke-node__select:focus-visible{outline:2px solid #fff;outline-offset:5px;border-radius:4px}
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
      .hg-epoke-parallel__card{width:100%;color:inherit;font:inherit;text-align:left;cursor:pointer}.hg-epoke-parallel__card[aria-pressed="true"]{border-color:rgba(255,255,255,.5);background:rgba(255,255,255,.11)}
      .hg-epoke-parallel__card .hg-epoke-node__years{margin-bottom:4px}
      .hg-epoke-depth{grid-column:1/-1;margin-top:4px;padding-top:14px;border-top:1px solid rgba(255,255,255,.12)}
      .hg-epoke-analysis{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:12px}
      .hg-epoke-analysis__item{padding:11px;border-radius:13px;background:rgba(0,0,0,.25)}.hg-epoke-analysis__item h4{margin:0 0 5px;font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:rgba(255,255,255,.58)}.hg-epoke-analysis__item p{margin:0;font-size:13px;line-height:1.45;color:rgba(255,255,255,.82)}
      .hg-epoke-questions{margin:12px 0 0;padding:11px 11px 11px 28px;border-left:3px solid rgba(255,255,255,.4);background:rgba(255,255,255,.04);font-size:13px;line-height:1.45}.hg-epoke-questions li+li{margin-top:5px}
      .hg-epoke-section-title{margin:18px 0 5px;font-size:16px}.hg-epoke-section-intro{margin:0 0 10px;font-size:12px;color:rgba(255,255,255,.57)}
      .hg-epoke-place-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:9px}
      .hg-epoke-place-card{position:relative;padding:12px;border:1px solid rgba(255,255,255,.13);border-radius:14px;background:rgba(0,0,0,.25)}.hg-epoke-place-card.is-current{border-color:#fff}.hg-epoke-place-card__head{display:flex;justify-content:space-between;gap:8px;align-items:start}.hg-epoke-place-card .hg-epoke-place{padding:0;border:0;border-radius:0;background:transparent;font-size:14px}.hg-epoke-place-card .hg-epoke-place:hover,.hg-epoke-place-card .hg-epoke-place:focus-visible{text-decoration:underline;background:transparent}.hg-epoke-place-card__category{font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:rgba(255,255,255,.48)}
      .hg-epoke-role-list{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}.hg-epoke-role{padding:3px 6px;border-radius:999px;background:rgba(255,255,255,.1);font-size:10px;font-weight:700}
      .hg-epoke-milestones{display:grid;gap:8px;margin-top:9px}.hg-epoke-milestone{display:grid;grid-template-columns:44px 1fr;gap:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,.09)}.hg-epoke-milestone__year{font-size:12px;font-weight:850}.hg-epoke-milestone h5{margin:0;font-size:12px}.hg-epoke-milestone p{margin:3px 0 0;font-size:11px;line-height:1.4;color:rgba(255,255,255,.66)}.hg-epoke-sources{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px}.hg-epoke-source{font-size:10px;color:#fff;text-underline-offset:2px}
      .hg-epoke-compact-count{margin-top:9px;font-size:12px;color:rgba(255,255,255,.56)}
      .hg-epoke-track-detail{margin-top:12px;padding:14px;border:1px solid rgba(255,255,255,.16);border-radius:16px;background:rgba(255,255,255,.045)}
      @media (max-width:640px){.hg-epoke-viewer{padding:0;place-items:stretch}.hg-epoke-viewer__panel{width:100%;height:100dvh;border-radius:0;border-left:0;border-right:0}.hg-epoke-viewer__head{padding:15px 14px 12px}.hg-epoke-viewer__toolbar{padding:9px 14px}.hg-epoke-viewer__body{padding:16px 12px 26px}.hg-epoke-node{grid-template-columns:1fr;gap:6px}.hg-epoke-node__years{font-size:11px}.hg-epoke-viewer__select{min-width:0;flex:1}.hg-epoke-analysis{grid-template-columns:1fr}.hg-epoke-place-cards{grid-template-columns:1fr}}
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

  function milestonesHtml(milestones) {
    const list = Array.isArray(milestones) ? milestones : [];
    return `<div class="hg-epoke-milestones">${list.map((milestone) => {
      const sources = (Array.isArray(milestone?.sources) ? milestone.sources : []).filter((source) => /^https?:\/\//.test(txt(source?.url)));
      return `<article class="hg-epoke-milestone"><div class="hg-epoke-milestone__year">${esc(milestone?.year)}</div><div><h5>${esc(milestone?.title || "Historisk hendelse")}</h5>${txt(milestone?.consequence) ? `<p>${esc(milestone.consequence)}</p>` : ""}${sources.length ? `<div class="hg-epoke-sources" aria-label="Kilder">${sources.map((source) => `<a class="hg-epoke-source" href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)} ↗</a>`).join("")}</div>` : ""}</div></article>`;
    }).join("")}</div>`;
  }

  function placeCardHtml(row, currentPlaceId) {
    const place = row?.place || {};
    const evidence = row?.evidence || {};
    const id = txt(place?.id || place?.placeId || evidence?.place_id);
    const current = Boolean(id && id === currentPlaceId);
    const roles = Array.isArray(evidence?.roles) ? evidence.roles : [];
    return `<article class="hg-epoke-place-card${current ? " is-current" : ""}"><div class="hg-epoke-place-card__head">${placeButtonHtml(row, currentPlaceId)}${txt(evidence?.category || place?.category) ? `<span class="hg-epoke-place-card__category">${esc(domainLabel(txt(evidence?.category || place?.category)))}</span>` : ""}</div>${roles.length ? `<div class="hg-epoke-role-list" aria-label="Historisk rolle">${roles.map((role) => `<span class="hg-epoke-role">${esc(role?.label)}</span>`).join("")}</div>` : ""}${milestonesHtml(evidence?.milestones)}</article>`;
  }

  function analysisHtml(epoch) {
    const analysis = epoch?.analysis;
    if (!analysis || typeof analysis !== "object") return "";
    const sections = [
      ["Hva endret seg?", analysis.what_changed],
      ["Hva fortsatte?", analysis.what_continued],
      ["Makt og konflikt", analysis.power_and_conflict],
      ["Synlige spor", analysis.visible_traces]
    ].filter(([, value]) => txt(value));
    const questions = (Array.isArray(analysis.guiding_questions) ? analysis.guiding_questions : []).map(txt).filter(Boolean);
    return `${sections.length ? `<div class="hg-epoke-analysis">${sections.map(([label, value]) => `<section class="hg-epoke-analysis__item"><h4>${esc(label)}</h4><p>${esc(value)}</p></section>`).join("")}</div>` : ""}${questions.length ? `<ol class="hg-epoke-questions" aria-label="Undersøkende spørsmål">${questions.map((question) => `<li>${esc(question)}</li>`).join("")}</ol>` : ""}`;
  }

  function depthHtml(epoch, places, currentPlaceId, generated) {
    if (!generated) {
      return places.length ? `<div class="hg-epoke-node__places">${places.map((row) => placeButtonHtml(row, currentPlaceId)).join("")}</div>` : '<div class="hg-epoke-node__empty">Ingen registrerte steder i denne epoken ennå.</div>';
    }
    return `<div class="hg-epoke-depth">${analysisHtml(epoch)}<h4 class="hg-epoke-section-title">Steder og daterte spor</h4><p class="hg-epoke-section-intro">Hvert treff kommer fra en datert kronologihendelse i stedets leksikon. Kildene under hendelsen kan åpnes direkte.</p>${places.length ? `<div class="hg-epoke-node__places hg-epoke-place-cards">${places.map((row) => placeCardHtml(row, currentPlaceId)).join("")}</div>` : '<div class="hg-epoke-node__empty">Ingen daterte, kildebelagte stedsspor i denne epoken ennå.</div>'}</div>`;
  }

  function trackRows(track) {
    return (Array.isArray(track?.evidence?.places) ? track.evidence.places : []).map((evidence) => {
      const place = (Array.isArray(window.PLACES) ? window.PLACES : []).find((candidate) => txt(candidate?.id) === txt(evidence?.place_id)) || {
        id: txt(evidence?.place_id), name: txt(evidence?.name), category: txt(evidence?.category)
      };
      return { place, evidence, resolution: { startYear: num(evidence?.milestones?.[0]?.year), sortKey: num(evidence?.milestones?.[0]?.year) } };
    });
  }

  function parallelHtml(parallel, selectedTrackId, currentPlaceId) {
    if (!parallel.length) return "";
    const selected = parallel.find((track) => txt(track?.id) === selectedTrackId) || null;
    const selectedRows = selected ? trackRows(selected) : [];
    return `<section class="hg-epoke-parallel" aria-labelledby="hgEpokeParallelTitle">
      <h3 class="hg-epoke-parallel__title" id="hgEpokeParallelTitle">Gjennomgående historiske spor</h3>
      <p class="hg-epoke-parallel__intro">Velg et spor for å følge kildebelagte hendelser på tvers av periodene. Sporene er perspektiver, ikke egne trinn i kronologien.</p>
      <div class="hg-epoke-parallel__grid">${parallel.map((track) => { const selectedNow = txt(track?.id) === selectedTrackId; const count = num(track?.evidence?.milestoneCount) || 0; return `<button type="button" class="hg-epoke-parallel__card" data-parallel-epoke-id="${esc(txt(track?.id))}" aria-pressed="${selectedNow}"><span class="hg-epoke-node__years">${esc(yearRange(track))}</span><span class="hg-epoke-node__name">${esc(epochLabel(track))}</span>${epochDescription(track) ? `<span class="hg-epoke-node__desc">${esc(epochDescription(track))}</span>` : ""}<span class="hg-epoke-compact-count">${count} kildebelagte hendelser</span></button>`; }).join("")}</div>
      ${selected ? `<section class="hg-epoke-track-detail" data-parallel-detail="${esc(txt(selected?.id))}"><h4 class="hg-epoke-section-title">${esc(epochLabel(selected))}</h4><p class="hg-epoke-section-intro">Hendelser som matcher dette sporets canonical markører og emneord.</p>${selectedRows.length ? `<div class="hg-epoke-place-cards">${selectedRows.map((row) => placeCardHtml(row, currentPlaceId)).join("")}</div>` : '<div class="hg-epoke-node__empty">Ingen kildebelagte treff i dette sporet ennå.</div>'}</section>` : ""}
    </section>`;
  }

  function renderTimeline(root, domain, currentPlaceId, currentEpochId, selectedTrackId = "") {
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
        <div><button type="button" class="hg-epoke-node__select" data-select-epoke="${esc(id)}" aria-expanded="${current}"><h3 class="hg-epoke-node__name">${esc(epochLabel(epoch))}</h3>${description ? `<p class="hg-epoke-node__desc">${esc(description)}</p>` : ""}<span class="hg-epoke-compact-count">${places.length} steder · ${places.reduce((sum, row) => sum + (row?.evidence?.milestones?.length || 0), 0)} hendelser</span></button>${fagverkLinksHtml(epoch, currentPlaceId)}${!current && !timeline.generated ? depthHtml(epoch, places, currentPlaceId, false) : ""}</div>${current ? depthHtml(epoch, places, currentPlaceId, timeline.generated) : ""}
      </article>`;
    }).join("");

    const unassigned = timeline.unassigned.length ? `<section class="hg-epoke-unassigned"><h3>Steder uten registrert epoke</h3><p>Disse stedene tilhører fagområdet, men kan ikke plasseres sikkert i en canonical epoke ennå.</p><div class="hg-epoke-node__places">${timeline.unassigned.map((row) => placeButtonHtml(row, currentPlaceId)).join("")}</div></section>` : "";
    const empty = !timeline.epochs.length && !timeline.unassigned.length
      ? `<section class="hg-epoke-unassigned"><h3>Ingen epoker eller steder registrert ennå</h3><p>${esc(domainLabel(domain))} har foreløpig ingen canonical epoketidslinje.</p></section>`
      : "";

    body.innerHTML = `<div class="hg-epoke-timeline">${nodes}</div>${unassigned}${empty}${parallelHtml(timeline.parallel, selectedTrackId, currentPlaceId)}`;
    body.querySelectorAll("[data-select-epoke]").forEach((node) => {
      node.addEventListener("click", () => {
        const epochId = txt(node.getAttribute("data-select-epoke"));
        writeUrlState(domain, epochId, "replace");
        renderTimeline(root, domain, currentPlaceId, epochId, selectedTrackId);
      });
    });
    body.querySelectorAll("[data-parallel-epoke-id]").forEach((node) => {
      node.addEventListener("click", () => {
        const trackId = txt(node.getAttribute("data-parallel-epoke-id"));
        renderTimeline(root, domain, currentPlaceId, currentEpochId, trackId === selectedTrackId ? "" : trackId);
      });
    });
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
      currentNode?.scrollIntoView?.({ block: "center", behavior: "smooth" });
    });
  }

  /** @param {any} [options] */
  async function open(options = {}) {
    if (window.HGEpokerRuntime?.ready) await window.HGEpokerRuntime.ready;
    if (window.HGEpokerRuntime?.loadPlaceIndex) await window.HGEpokerRuntime.loadPlaceIndex();
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
    if (window.HGEpokerRuntime?.loadPlaceIndex) await window.HGEpokerRuntime.loadPlaceIndex();
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
