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
  const URL_SCOPE_PARAM = "epoke_scope";
  const URL_COUNTRY_PARAM = "epoke_country";
  const URL_CITY_PARAM = "epoke_city";
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

  function locationIndex() {
    return window.HG_EPOKE_PLACE_INDEX?.locations || { places: {}, countries: [] };
  }

  function hasLocationIndex() {
    const locations = window.HG_EPOKE_PLACE_INDEX?.locations;
    return Boolean(
      locations?.contract === "canonical-place-geography-v1" &&
      locations?.places && typeof locations.places === "object" &&
      Array.isArray(locations?.countries)
    );
  }

  function placeLocation(place) {
    const id = txt(place?.id || place?.placeId);
    const indexed = id ? locationIndex()?.places?.[id] : null;
    if (indexed) return indexed;
    return {
      country_id: txt(place?.address?.country || place?.country || place?.country_id).toLowerCase(),
      country_label: txt(place?.address?.country || place?.country || place?.country_id),
      city_id: txt(place?.address?.city || place?.city || place?.cityId).toLowerCase(),
      city_label: txt(place?.address?.city || place?.cityLabel || place?.city)
    };
  }

  function defaultLocationScope(place) {
    if (!hasLocationIndex()) {
      return { scope: "global", countryId: "", countryLabel: "", cityId: "", cityLabel: "" };
    }
    const location = placeLocation(place);
    if (txt(location?.city_id)) {
      return {
        scope: "city",
        countryId: txt(location?.country_id),
        countryLabel: txt(location?.country_label),
        cityId: txt(location?.city_id),
        cityLabel: txt(location?.city_label)
      };
    }
    if (txt(location?.country_id)) {
      return {
        scope: "country",
        countryId: txt(location?.country_id),
        countryLabel: txt(location?.country_label),
        cityId: "",
        cityLabel: ""
      };
    }
    return { scope: "global", countryId: "", countryLabel: "", cityId: "", cityLabel: "" };
  }

  function locationScopeFromUrl(state) {
    const countries = Array.isArray(locationIndex()?.countries) ? locationIndex().countries : [];
    const country = countries.find((candidate) => txt(candidate?.id) === txt(state?.countryId));
    if (state?.scope === "city" && country) {
      const city = (Array.isArray(country?.cities) ? country.cities : [])
        .find((candidate) => txt(candidate?.id) === txt(state?.cityId));
      if (city) return { scope: "city", countryId: txt(country.id), countryLabel: txt(country.label), cityId: txt(city.id), cityLabel: txt(city.label) };
    }
    if (state?.scope === "country" && country) {
      return { scope: "country", countryId: txt(country.id), countryLabel: txt(country.label), cityId: "", cityLabel: "" };
    }
    return { scope: "global", countryId: "", countryLabel: "", cityId: "", cityLabel: "" };
  }

  function locationMatches(place, locationScope) {
    const scope = locationScope?.scope || "global";
    if (scope === "global") return true;
    const location = placeLocation(place);
    if (scope === "country") return Boolean(locationScope?.countryId && txt(location?.country_id) === txt(locationScope.countryId));
    return Boolean(
      locationScope?.countryId && locationScope?.cityId &&
      txt(location?.country_id) === txt(locationScope.countryId) &&
      txt(location?.city_id) === txt(locationScope.cityId)
    );
  }

  function scopeLabel(locationScope) {
    if (locationScope?.scope === "city") return txt(locationScope.cityLabel) || "Valgt by";
    if (locationScope?.scope === "country") return txt(locationScope.countryLabel) || "Valgt land";
    return "Alle steder";
  }

  function scopeValue(locationScope) {
    if (locationScope?.scope === "city") return `city:${txt(locationScope.countryId)}:${txt(locationScope.cityId)}`;
    if (locationScope?.scope === "country") return `country:${txt(locationScope.countryId)}`;
    return "global";
  }

  function locationOptionsHtml(locationScope, currentPlace) {
    const countries = Array.isArray(locationIndex()?.countries) ? locationIndex().countries : [];
    const currentLocation = placeLocation(currentPlace);
    const cityOptions = [];
    const addCity = (countryId, cityId) => {
      const country = countries.find((candidate) => txt(candidate?.id) === txt(countryId));
      const city = (Array.isArray(country?.cities) ? country.cities : []).find((candidate) => txt(candidate?.id) === txt(cityId));
      if (country && city && !cityOptions.some((candidate) => candidate.cityId === txt(city.id) && candidate.countryId === txt(country.id))) {
        cityOptions.push({ countryId: txt(country.id), cityId: txt(city.id), label: txt(city.label) });
      }
    };
    addCity(currentLocation?.country_id, currentLocation?.city_id);
    if (locationScope?.scope === "city") addCity(locationScope.countryId, locationScope.cityId);
    const selected = scopeValue(locationScope);
    const cities = cityOptions.length ? `<optgroup label="By">${cityOptions.map((city) => { const value = `city:${city.countryId}:${city.cityId}`; return `<option value="${esc(value)}"${value === selected ? " selected" : ""}>${esc(city.label)}</option>`; }).join("")}</optgroup>` : "";
    const countryOptions = countries.length ? `<optgroup label="Land">${countries.map((country) => { const value = `country:${txt(country?.id)}`; return `<option value="${esc(value)}"${value === selected ? " selected" : ""}>${esc(country?.label)}</option>`; }).join("")}</optgroup>` : "";
    return `${cities}${countryOptions}<option value="global"${selected === "global" ? " selected" : ""}>Alle steder</option>`;
  }

  function scopeFromValue(value) {
    const [kind, countryId = "", cityId = ""] = txt(value).split(":");
    return locationScopeFromUrl({ scope: kind, countryId, cityId });
  }

  function chronologicalList(domainIndex) {
    if (Array.isArray(domainIndex?.byStart)) return domainIndex.byStart;
    if (!Array.isArray(domainIndex?.list)) return [];
    return domainIndex.list.slice().sort(
      (a, b) => (num(a?.start_year) ?? 999999) - (num(b?.start_year) ?? 999999)
    );
  }

  function buildTimeline(domain, locationScope = { scope: "global" }) {
    const epochs = chronologicalList(window.EPOKER_INDEX?.byDomain?.[domain]);
    const parallelEpochs = chronologicalList(window.EPOKER_INDEX?.parallelByDomain?.[domain]);
    const epochIds = new Set(epochs.map((epoch) => txt(epoch?.id)).filter(Boolean));
    const allPlaces = Array.isArray(window.PLACES) ? window.PLACES : [];
    const rows = allPlaces
      .filter((place) => locationMatches(place, locationScope))
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
          if (!locationMatches(place, locationScope)) return null;
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
        }).filter(Boolean);
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
        generated: true,
        unknownLocationCount: [...indexedIds, ...unassigned.map((row) => txt(row?.place?.id))]
          .filter((id) => !txt(locationIndex()?.places?.[id]?.country_id)).length
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
      generated: false,
      unknownLocationCount: rows.filter((row) => !txt(placeLocation(row?.place)?.country_id)).length
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
    const scope = txt(url.searchParams.get(URL_SCOPE_PARAM));
    const countryId = txt(url.searchParams.get(URL_COUNTRY_PARAM));
    const cityId = txt(url.searchParams.get(URL_CITY_PARAM));
    const placeId = txt(url.searchParams.get("place"));
    return { epochId, domain, scope, countryId, cityId, placeId, active: Boolean(epochId || domain) };
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

  function writeUrlState(domain, epochId, locationScope, mode = "replace") {
    const url = new URL(window.location.href);
    if (domain) url.searchParams.set(URL_DOMAIN_PARAM, domain);
    else url.searchParams.delete(URL_DOMAIN_PARAM);
    if (epochId) url.searchParams.set(URL_EPOCH_PARAM, epochId);
    else url.searchParams.delete(URL_EPOCH_PARAM);
    const scope = locationScope?.scope || "global";
    url.searchParams.set(URL_SCOPE_PARAM, scope);
    if ((scope === "city" || scope === "country") && locationScope?.countryId) {
      url.searchParams.set(URL_COUNTRY_PARAM, txt(locationScope.countryId));
    } else {
      url.searchParams.delete(URL_COUNTRY_PARAM);
    }
    if (scope === "city" && locationScope?.cityId) url.searchParams.set(URL_CITY_PARAM, txt(locationScope.cityId));
    else url.searchParams.delete(URL_CITY_PARAM);
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
    url.searchParams.delete(URL_SCOPE_PARAM);
    url.searchParams.delete(URL_COUNTRY_PARAM);
    url.searchParams.delete(URL_CITY_PARAM);
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
      .hg-epoke-viewer__toolbar{display:flex;align-items:end;flex-wrap:wrap;gap:10px;padding:10px 20px;border-bottom:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.025)}
      .hg-epoke-viewer__field{display:grid;gap:4px;min-width:min(270px,70vw);flex:1}.hg-epoke-viewer__field label{font-size:12px;font-weight:750;color:rgba(255,255,255,.7)}
      .hg-epoke-viewer__select{width:100%;max-width:100%;padding:9px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.18);background:#171611;color:#fff;font:inherit}
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
      .hg-epoke-overview{margin-top:2px}.hg-epoke-overview__head{margin-bottom:10px}.hg-epoke-overview__head h4{margin:0 0 4px;font-size:18px}.hg-epoke-overview__head p{margin:0;font-size:12px;line-height:1.45;color:rgba(255,255,255,.62)}.hg-epoke-overview__head .hg-epoke-coverage-status{margin-top:8px;padding:8px 9px;border-left:3px solid rgba(255,203,107,.75);border-radius:7px;background:rgba(255,203,107,.07);color:rgba(255,255,255,.76)}
      .hg-epoke-oslo-coverage{margin:0 0 16px;padding:14px;border:1px solid rgba(255,203,107,.28);border-radius:16px;background:rgba(255,203,107,.065)}.hg-epoke-oslo-coverage h3{margin:0 0 5px;font-size:17px}.hg-epoke-oslo-coverage p{margin:0;font-size:12px;line-height:1.5;color:rgba(255,255,255,.74)}.hg-epoke-oslo-coverage__counts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:10px 0}.hg-epoke-oslo-coverage__count{padding:8px;border:1px solid rgba(255,255,255,.1);border-radius:10px;background:rgba(0,0,0,.16)}.hg-epoke-oslo-coverage__count strong{display:block;font-size:18px}.hg-epoke-oslo-coverage__count span{display:block;font-size:10px;line-height:1.3;color:rgba(255,255,255,.62)}.hg-epoke-oslo-coverage details{margin-top:9px}.hg-epoke-oslo-coverage summary{font-size:11px;font-weight:750;cursor:pointer}.hg-epoke-oslo-coverage__categories{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:5px;margin-top:8px}.hg-epoke-oslo-coverage__category{display:flex;justify-content:space-between;gap:8px;padding:6px 7px;border-radius:8px;background:rgba(255,255,255,.045);font-size:10px}.hg-epoke-oslo-coverage__category span:last-child{color:rgba(255,255,255,.6)}
      .hg-epoke-period{margin-top:9px;border:1px solid rgba(255,255,255,.13);border-radius:14px;background:rgba(255,255,255,.035);overflow:hidden}.hg-epoke-period>summary{padding:12px 14px;cursor:pointer;font-weight:800}.hg-epoke-period__body{padding:0 14px 14px}.hg-epoke-period__date{margin:-3px 0 9px;font-size:11px;color:rgba(255,255,255,.55)}.hg-epoke-period__intro{font-size:13px;line-height:1.55}.hg-epoke-period__section{margin-top:14px}.hg-epoke-period__section h5{margin:0 0 5px;font-size:13px}.hg-epoke-period__section p{margin:0;font-size:12px;line-height:1.55;color:rgba(255,255,255,.76)}.hg-epoke-period__section p+p{margin-top:7px}
      .hg-epoke-concepts{display:flex;flex-wrap:wrap;gap:5px;margin-top:12px}.hg-epoke-concept{padding:4px 7px;border-radius:999px;background:rgba(255,255,255,.09);font-size:10px}.hg-epoke-module{margin-top:13px;padding:12px;border-left:3px solid rgba(255,255,255,.45);background:rgba(0,0,0,.24)}.hg-epoke-module h5{margin:0 0 5px;font-size:13px}.hg-epoke-module p{margin:4px 0;font-size:12px;line-height:1.5}.hg-epoke-module__problem{color:rgba(255,255,255,.66)}.hg-epoke-module__units{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:7px;margin-top:9px}.hg-epoke-module__unit{padding:9px;border-radius:10px;background:rgba(255,255,255,.055)}.hg-epoke-module__unit strong{display:block;font-size:11px}.hg-epoke-module__unit span{display:block;margin-top:3px;font-size:11px;line-height:1.4;color:rgba(255,255,255,.67)}
      .hg-epoke-cases{display:grid;gap:7px;margin-top:10px}.hg-epoke-cases>h5{margin:0;font-size:12px}.hg-epoke-case{padding:8px;border:1px solid rgba(255,255,255,.1);border-radius:9px;background:rgba(255,255,255,.025)}.hg-epoke-case p{margin:0 0 6px;font-size:11px;line-height:1.45;color:rgba(255,255,255,.73)}.hg-epoke-overview-sources{margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,.1)}.hg-epoke-overview-sources strong{display:block;margin-bottom:6px;font-size:11px}.hg-epoke-overview-sources__links{display:flex;flex-wrap:wrap;gap:6px}
      .hg-epoke-evidence-kind{display:inline-block;margin-top:5px;font-size:9px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:rgba(255,255,255,.47)}.hg-epoke-limitation{margin-top:5px;font-size:10px;color:rgba(255,255,255,.58)}.hg-epoke-limitation summary{cursor:pointer}.hg-epoke-limitation p{font-size:10px}
      .hg-epoke-connections{display:grid;gap:7px;margin-top:10px;padding-top:9px;border-top:1px solid rgba(255,255,255,.09)}.hg-epoke-connection-group strong{display:block;margin-bottom:4px;font-size:10px;letter-spacing:.05em;text-transform:uppercase;color:rgba(255,255,255,.5)}.hg-epoke-connection-list{display:flex;flex-wrap:wrap;gap:5px}.hg-epoke-connection{display:inline-flex;align-items:center;gap:5px;padding:5px 7px;border:1px solid rgba(255,255,255,.13);border-radius:9px;background:rgba(255,255,255,.055);color:#fff;font:inherit;font-size:10px;cursor:pointer}.hg-epoke-connection img{width:22px;height:22px;border-radius:50%;object-fit:cover}.hg-epoke-connection:hover,.hg-epoke-connection:focus-visible{border-color:rgba(255,255,255,.45);outline:none;background:rgba(255,255,255,.11)}
      @media (max-width:640px){.hg-epoke-viewer{padding:0;place-items:stretch}.hg-epoke-viewer__panel{width:100%;height:100dvh;border-radius:0;border-left:0;border-right:0}.hg-epoke-viewer__head{padding:15px 14px 12px}.hg-epoke-viewer__toolbar{padding:9px 14px}.hg-epoke-viewer__field{min-width:calc(50% - 5px)}.hg-epoke-viewer__body{padding:16px 12px 26px}.hg-epoke-node{grid-template-columns:1fr;gap:6px}.hg-epoke-node__years{font-size:11px}.hg-epoke-analysis{grid-template-columns:1fr}.hg-epoke-place-cards{grid-template-columns:1fr}.hg-epoke-oslo-coverage__counts{grid-template-columns:1fr}.hg-epoke-oslo-coverage__count{display:flex;align-items:baseline;gap:8px}.hg-epoke-oslo-coverage__count span{font-size:11px}}
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

  function navigateToPerson(person) {
    if (!person) return;
    if (readUrlState().active) clearUrlState();
    closeDom();
    void window.showPersonPopup?.(person);
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
      const evidenceLabel = milestone?.evidence_type === "canonical_place_claim"
        ? "Canonical claim"
        : milestone?.evidence_type === "canonical_story" ? "Kildebelagt fortelling" : "Datert leksikonspor";
      const limitations = (Array.isArray(milestone?.limitations) ? milestone.limitations : []).map(txt).filter(Boolean);
      return `<article class="hg-epoke-milestone"${txt(milestone?.claim_id) ? ` data-claim-id="${esc(milestone.claim_id)}"` : ""}${txt(milestone?.story_id) ? ` data-story-id="${esc(milestone.story_id)}"` : ""}><div class="hg-epoke-milestone__year">${esc(milestone?.year)}</div><div><h5>${esc(milestone?.title || "Historisk hendelse")}</h5>${txt(milestone?.consequence) ? `<p>${esc(milestone.consequence)}</p>` : ""}<span class="hg-epoke-evidence-kind">${esc(evidenceLabel)}</span>${sources.length ? `<div class="hg-epoke-sources" aria-label="Kilder">${sources.map((source) => `<a class="hg-epoke-source" href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)} ↗</a>`).join("")}</div>` : ""}${limitations.length ? `<details class="hg-epoke-limitation"><summary>Usikkerhet og avgrensning</summary>${limitations.map((limitation) => `<p>${esc(limitation)}</p>`).join("")}</details>` : ""}</div></article>`;
    }).join("")}</div>`;
  }

  function connectionHtml(evidence, placeId) {
    const connections = evidence?.connections || {};
    const people = (Array.isArray(connections?.person_ids) ? connections.person_ids : [])
      .map((id) => (Array.isArray(window.PEOPLE) ? window.PEOPLE : []).find((person) => txt(person?.id) === txt(id)))
      .filter(Boolean);
    const works = Array.isArray(connections?.works) ? connections.works : [];
    const materializedStoryIds = new Set((Array.isArray(evidence?.milestones) ? evidence.milestones : []).map((milestone) => txt(milestone?.story_id)).filter(Boolean));
    const stories = (Array.isArray(connections?.stories) ? connections.stories : [])
      .filter((story) => !materializedStoryIds.has(txt(story?.id)));
    const group = (label, items) => items.length ? `<div class="hg-epoke-connection-group"><strong>${esc(label)}</strong><div class="hg-epoke-connection-list">${items.join("")}</div></div>` : "";
    const peopleHtml = group("Mennesker", people.map((person) => `<button type="button" class="hg-epoke-connection" data-epoke-person-id="${esc(txt(person?.id))}">${txt(person?.image || person?.cardImage) ? `<img src="${esc(person.image || person.cardImage)}" alt="">` : ""}<span>${esc(person?.name || person?.id)}</span></button>`));
    const worksHtml = group("Verk og objekter", works.slice(0, 5).map((work) => `<button type="button" class="hg-epoke-connection" data-epoke-place-id="${esc(placeId)}">${esc(work?.title || work?.id)}</button>`));
    const storiesHtml = group("Fortellinger", stories.slice(0, 5).map((story) => `<button type="button" class="hg-epoke-connection" data-epoke-place-id="${esc(placeId)}">${esc(story?.title || story?.id)}${Number.isFinite(story?.year) ? ` · ${esc(story.year)}` : ""}</button>`));
    return peopleHtml || worksHtml || storiesHtml ? `<div class="hg-epoke-connections">${peopleHtml}${worksHtml}${storiesHtml}</div>` : "";
  }

  function periodCasesHtml(periodCases) {
    const cases = Array.isArray(periodCases) ? periodCases : [];
    return cases.length ? `<section class="hg-epoke-cases"><h5>Dokumenterte stedscaser uten eksakt datering</h5>${cases.map((periodCase) => {
      const sources = (periodCase?.sources || []).filter((source) => /^https?:\/\//.test(txt(source?.url)));
      return `<article class="hg-epoke-case"><p>${esc(periodCase?.use)}</p>${sources.length ? `<div class="hg-epoke-sources" aria-label="Casekilder">${sources.map((source) => `<a class="hg-epoke-source" href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source?.title || source.url)} ↗</a>`).join("")}</div>` : ""}</article>`;
    }).join("")}</section>` : "";
  }

  function placeCardHtml(row, currentPlaceId) {
    const place = row?.place || {};
    const evidence = row?.evidence || {};
    const id = txt(place?.id || place?.placeId || evidence?.place_id);
    const current = Boolean(id && id === currentPlaceId);
    const roles = Array.isArray(evidence?.roles) ? evidence.roles : [];
    return `<article class="hg-epoke-place-card${current ? " is-current" : ""}"><div class="hg-epoke-place-card__head">${placeButtonHtml(row, currentPlaceId)}${txt(evidence?.category || place?.category) ? `<span class="hg-epoke-place-card__category">${esc(domainLabel(txt(evidence?.category || place?.category)))}</span>` : ""}</div>${roles.length ? `<div class="hg-epoke-role-list" aria-label="Historisk rolle">${roles.map((role) => `<span class="hg-epoke-role">${esc(role?.label)}</span>`).join("")}</div>` : ""}${milestonesHtml(evidence?.milestones)}${periodCasesHtml(evidence?.period_cases)}${connectionHtml(evidence, id)}</article>`;
  }

  function periodIdsForEpoch(epoch) {
    return [...new Set((epoch?.fagverk_links || []).flatMap((link) => Array.isArray(link?.period_ids) ? link.period_ids : []).map(txt).filter(Boolean))];
  }

  function historyOverviewHtml(epoch, locationScope = { scope: "global" }) {
    const coverage = window.HG_EPOKE_HISTORY_COVERAGE;
    if (coverage?.contract !== "canonical-history-period-coverage-v1") return "";
    const periodIds = periodIdsForEpoch(epoch);
    const guides = periodIds.map((periodId) => (coverage.guides || []).find((guide) => txt(guide?.period_id) === periodId)).filter(Boolean);
    if (!guides.length) return "";
    const coverageStats = window.HG_EPOKE_PLACE_INDEX?.stats || {};
    const indexedPlaceCount = num(coverageStats?.indexed_place_count);
    const canonicalPlaceCount = num(coverageStats?.canonical_place_count);
    const placeCoverage = Number.isFinite(indexedPlaceCount) && Number.isFinite(canonicalPlaceCount)
      ? ` Stedsindeksen har godkjent evidens eller dokumenterte caser for ${indexedPlaceCount} av ${canonicalPlaceCount} canonical steder.`
      : " Stedsindeksen viser bare steder med godkjent evidens eller dokumenterte caser.";
    const osloCoverage = window.HG_EPOKE_PLACE_INDEX?.domains?.historie?.oslo_coverage;
    const isOslo = locationScope?.scope === "city" && txt(locationScope?.countryId) === "no" && txt(locationScope?.cityId) === "oslo";
    const coverageStatus = isOslo && osloCoverage?.contract === "oslo-history-coverage-v1"
      ? `Fagverksoversikten dekker alle ${coverage.guides.length} canonical Historie-perioder. I Oslo har ${osloCoverage.dated_evidence_place_count} av ${osloCoverage.canonical_place_count} steder minst ett datert, kildebelagt spor; ${osloCoverage.documented_case_place_count} har bare dokumentert case, og ${osloCoverage.awaiting_source_backed_history_count} venter på kildebelagt stedshistorie. Fravær er et synlig dokumentasjonsgap, ikke bevis på at et sted mangler historie.`
      : `Fagverksoversikten dekker alle ${coverage.guides.length} canonical Historie-perioder.${placeCoverage} Fravær er et synlig dokumentasjonsgap, ikke bevis på at et sted mangler historie.`;
    const modules = periodIds.map((periodId) => (coverage.modules || []).find((module) => txt(module?.period_id) === periodId)).filter(Boolean);
    const sourceById = new Map((coverage.sources || []).map((source) => [txt(source?.source_id), source]));
    const relevantModuleSourceIds = new Set(modules.flatMap((module) => (module?.units || []).flatMap((unit) => unit?.source_ids || []).map(txt)));
    const sources = [
      ...(coverage.orientation_sources || []).map((source) => ({ title: source?.title, url: source?.url, role: source?.role })),
      ...[...relevantModuleSourceIds].map((id) => sourceById.get(id)).filter(Boolean)
    ];
    const uniqueSources = [...new Map(sources.filter((source) => /^https?:\/\//.test(txt(source?.url))).map((source) => [txt(source.url), source])).values()];
    const moduleFor = (periodId) => modules.find((module) => txt(module?.period_id) === txt(periodId));
    const guideHtml = guides.map((guide, index) => {
      const module = moduleFor(guide?.period_id);
      const concepts = [...(guide?.core_concepts || []), ...(guide?.connections || [])].map(txt).filter(Boolean);
      const moduleHtml = module ? `<section class="hg-epoke-module"><h5>${esc(module?.title || "Kildebasert fordypning")}</h5>${txt(module?.thesis) ? `<p>${esc(module.thesis)}</p>` : ""}${txt(module?.historiographical_problem) ? `<p class="hg-epoke-module__problem"><strong>Historisk problem:</strong> ${esc(module.historiographical_problem)}</p>` : ""}<div class="hg-epoke-module__units">${(module?.units || []).map((unit) => `<div class="hg-epoke-module__unit"><strong>${esc(unit?.title)}</strong><span>${esc(unit?.summary)}</span></div>`).join("")}</div></section>` : "";
      return `<details class="hg-epoke-period"${index === 0 ? " open" : ""} data-history-period-id="${esc(guide?.period_id)}"><summary>${esc(guide?.title || guide?.period_id)}</summary><div class="hg-epoke-period__body"><div class="hg-epoke-period__date">${esc(guide?.date_label)}</div><p class="hg-epoke-period__intro">${esc(guide?.introduction)}</p>${(guide?.sections || []).map((section) => `<section class="hg-epoke-period__section"><h5>${esc(section?.title)}</h5>${(section?.paragraphs || []).map((paragraph) => `<p>${esc(paragraph)}</p>`).join("")}</section>`).join("")}${concepts.length ? `<div class="hg-epoke-concepts" aria-label="Begreper og forbindelser">${concepts.map((concept) => `<span class="hg-epoke-concept">${esc(concept)}</span>`).join("")}</div>` : ""}${moduleHtml}</div></details>`;
    }).join("");
    const sourcesHtml = uniqueSources.length ? `<div class="hg-epoke-overview-sources"><strong>Oversiktskilder og modulgrunnlag</strong><div class="hg-epoke-overview-sources__links">${uniqueSources.map((source) => `<a class="hg-epoke-source" href="${esc(source.url)}" target="_blank" rel="noopener noreferrer"${txt(source?.role) ? ` title="${esc(source.role)}"` : ""}>${esc(source?.title || source.url)} ↗</a>`).join("")}</div></div>` : "";
    return `<section class="hg-epoke-overview" data-epoke-history-overview><div class="hg-epoke-overview__head"><h4>Historisk oversikt</h4><p>Canonical Historie-fagverk: globalt, nasjonalt og stedlig perspektiv, med eksplisitte begreper, forbindelser og kildegrunnlag.</p><p class="hg-epoke-coverage-status">${esc(coverageStatus)}</p></div>${guideHtml}${sourcesHtml}</section>`;
  }

  function osloCoverageHtml(domain, locationScope) {
    if (domain !== "historie" || locationScope?.scope !== "city" || txt(locationScope?.countryId) !== "no" || txt(locationScope?.cityId) !== "oslo") return "";
    const coverage = window.HG_EPOKE_PLACE_INDEX?.domains?.historie?.oslo_coverage;
    if (coverage?.contract !== "oslo-history-coverage-v1") return "";
    const categories = (Array.isArray(coverage?.categories) ? coverage.categories : []).filter((category) => Number(category?.awaiting_source_backed_history) > 0);
    return `<section class="hg-epoke-oslo-coverage" data-oslo-history-coverage><h3>Oslo: dokumentert historisk dekning</h3><p>Alle ${esc(coverage.canonical_place_count)} canonical Oslo-steder er klassifisert. Tidslinjen viser bare hendelser med eksplisitt år og inspiserbar nettkilde; manglende dekning fylles ikke med antatte årstall.</p><div class="hg-epoke-oslo-coverage__counts"><div class="hg-epoke-oslo-coverage__count"><strong>${esc(coverage.dated_evidence_place_count)}</strong><span>med datert evidens</span></div><div class="hg-epoke-oslo-coverage__count"><strong>${esc(coverage.documented_case_place_count)}</strong><span>kun dokumentert case</span></div><div class="hg-epoke-oslo-coverage__count"><strong>${esc(coverage.awaiting_source_backed_history_count)}</strong><span>venter på kildearbeid</span></div></div>${categories.length ? `<details><summary>Dokumentasjonsgap etter fagområde</summary><div class="hg-epoke-oslo-coverage__categories">${categories.map((category) => `<div class="hg-epoke-oslo-coverage__category"><span>${esc(domainLabel(category?.category))}</span><span>${esc(category?.awaiting_source_backed_history)} av ${esc(category?.total)} venter</span></div>`).join("")}</div></details>` : ""}</section>`;
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

  function depthHtml(epoch, places, currentPlaceId, generated, locationScope) {
    if (!generated) {
      const overview = historyOverviewHtml(epoch, locationScope);
      const placeList = places.length ? `<div class="hg-epoke-node__places">${places.map((row) => placeButtonHtml(row, currentPlaceId)).join("")}</div>` : '<div class="hg-epoke-node__empty">Ingen registrerte steder i denne epoken ennå.</div>';
      return overview ? `<div class="hg-epoke-depth">${overview}${placeList}</div>` : placeList;
    }
    return `<div class="hg-epoke-depth">${historyOverviewHtml(epoch, locationScope)}${analysisHtml(epoch)}<h4 class="hg-epoke-section-title">Steder og kildebelagte spor</h4><p class="hg-epoke-section-intro">Treffene kommer fra validerte place–claim–source-koblinger, daterte leksikonhendelser og canonical fortellinger med eksplisitt år og inspiserbare nettkilder. Udaterte Fagverk-caser vises separat uten konstruerte årstall. Kilder og registrerte avgrensninger kan undersøkes direkte.</p>${places.length ? `<div class="hg-epoke-node__places hg-epoke-place-cards">${places.map((row) => placeCardHtml(row, currentPlaceId)).join("")}</div>` : '<div class="hg-epoke-node__empty">Ingen daterte, kildebelagte stedsspor i denne epoken ennå.</div>'}</div>`;
  }

  function trackRows(track, locationScope) {
    return (Array.isArray(track?.evidence?.places) ? track.evidence.places : []).map((evidence) => {
      const place = (Array.isArray(window.PLACES) ? window.PLACES : []).find((candidate) => txt(candidate?.id) === txt(evidence?.place_id)) || {
        id: txt(evidence?.place_id), name: txt(evidence?.name), category: txt(evidence?.category)
      };
      if (!locationMatches(place, locationScope)) return null;
      return { place, evidence, resolution: { startYear: num(evidence?.milestones?.[0]?.year), sortKey: num(evidence?.milestones?.[0]?.year) } };
    }).filter(Boolean);
  }

  function parallelHtml(parallel, selectedTrackId, currentPlaceId, locationScope) {
    if (!parallel.length) return "";
    const selected = parallel.find((track) => txt(track?.id) === selectedTrackId) || null;
    const selectedRows = selected ? trackRows(selected, locationScope) : [];
    return `<section class="hg-epoke-parallel" aria-labelledby="hgEpokeParallelTitle">
      <h3 class="hg-epoke-parallel__title" id="hgEpokeParallelTitle">Gjennomgående historiske spor</h3>
      <p class="hg-epoke-parallel__intro">Velg et spor for å følge kildebelagte hendelser på tvers av periodene. Sporene er perspektiver, ikke egne trinn i kronologien.</p>
      <div class="hg-epoke-parallel__grid">${parallel.map((track) => { const selectedNow = txt(track?.id) === selectedTrackId; const count = trackRows(track, locationScope).reduce((sum, row) => sum + (row?.evidence?.milestones?.length || 0), 0); return `<button type="button" class="hg-epoke-parallel__card" data-parallel-epoke-id="${esc(txt(track?.id))}" aria-pressed="${selectedNow}"><span class="hg-epoke-node__years">${esc(yearRange(track))}</span><span class="hg-epoke-node__name">${esc(epochLabel(track))}</span>${epochDescription(track) ? `<span class="hg-epoke-node__desc">${esc(epochDescription(track))}</span>` : ""}<span class="hg-epoke-compact-count">${count} kildebelagte hendelser</span></button>`; }).join("")}</div>
      ${selected ? `<section class="hg-epoke-track-detail" data-parallel-detail="${esc(txt(selected?.id))}"><h4 class="hg-epoke-section-title">${esc(epochLabel(selected))}</h4><p class="hg-epoke-section-intro">Hendelser som matcher dette sporets canonical markører og emneord.</p>${selectedRows.length ? `<div class="hg-epoke-place-cards">${selectedRows.map((row) => placeCardHtml(row, currentPlaceId)).join("")}</div>` : '<div class="hg-epoke-node__empty">Ingen kildebelagte treff i dette sporet ennå.</div>'}</section>` : ""}
    </section>`;
  }

  function renderTimeline(root, domain, currentPlaceId, currentEpochId, selectedTrackId = "", locationScope = { scope: "global" }) {
    const body = /** @type {HTMLElement|null} */ (root.querySelector("[data-epoke-body]"));
    const summary = /** @type {HTMLElement|null} */ (root.querySelector("[data-epoke-summary]"));
    if (!body) return;
    root.dataset.epokeCurrentId = txt(currentEpochId);

    const timeline = buildTimeline(domain, locationScope);
    const epochsWithPlaces = timeline.epochs.filter((entry) => entry.places.length).length;
    const milestoneCount = timeline.epochs.reduce((sum, entry) => sum + entry.places.reduce((placeSum, row) => placeSum + (row?.evidence?.milestones?.length || 0), 0), 0);
    if (summary) {
      const parallelSummary = timeline.parallel.length ? ` · ${timeline.parallel.length} gjennomgående spor` : "";
      const unknownSummary = timeline.unknownLocationCount ? ` · ${timeline.unknownLocationCount} uten områdedata` : "";
      summary.textContent = `${scopeLabel(locationScope)} · ${timeline.epochs.length} epoker · ${timeline.placeCount} steder · ${milestoneCount} kildebelagte spor · ${epochsWithPlaces} epoker med steder${parallelSummary}${unknownSummary}`;
    }

    const nodes = timeline.epochs.map(({ epoch, places }) => {
      const id = txt(epoch?.id);
      const current = Boolean(id && id === currentEpochId);
      const description = epochDescription(epoch);
      return `<article class="hg-epoke-node${current ? " is-current" : ""}" data-epoke-id="${esc(id)}"${current ? ' aria-current="true"' : ""}>
        <div class="hg-epoke-node__years">${esc(yearRange(epoch))}</div>
        <div><button type="button" class="hg-epoke-node__select" data-select-epoke="${esc(id)}" aria-expanded="${current}"><h3 class="hg-epoke-node__name">${esc(epochLabel(epoch))}</h3>${description ? `<p class="hg-epoke-node__desc">${esc(description)}</p>` : ""}<span class="hg-epoke-compact-count">${places.length} steder · ${places.reduce((sum, row) => sum + (row?.evidence?.milestones?.length || 0), 0)} hendelser</span></button>${fagverkLinksHtml(epoch, currentPlaceId)}${!current && !timeline.generated ? depthHtml(epoch, places, currentPlaceId, false, locationScope) : ""}</div>${current ? depthHtml(epoch, places, currentPlaceId, timeline.generated, locationScope) : ""}
      </article>`;
    }).join("");

    const unassigned = timeline.unassigned.length ? `<section class="hg-epoke-unassigned"><h3>Steder uten registrert epoke</h3><p>Disse stedene tilhører fagområdet, men kan ikke plasseres sikkert i en canonical epoke ennå.</p><div class="hg-epoke-node__places">${timeline.unassigned.map((row) => placeButtonHtml(row, currentPlaceId)).join("")}</div></section>` : "";
    const empty = !timeline.epochs.length && !timeline.unassigned.length
      ? `<section class="hg-epoke-unassigned"><h3>Ingen epoker eller steder registrert ennå</h3><p>${esc(domainLabel(domain))} har foreløpig ingen canonical epoketidslinje.</p></section>`
      : "";

    body.innerHTML = `${osloCoverageHtml(domain, locationScope)}<div class="hg-epoke-timeline">${nodes}</div>${unassigned}${empty}${parallelHtml(timeline.parallel, selectedTrackId, currentPlaceId, locationScope)}`;
    body.querySelectorAll("[data-select-epoke]").forEach((node) => {
      node.addEventListener("click", () => {
        const epochId = txt(node.getAttribute("data-select-epoke"));
        writeUrlState(domain, epochId, locationScope, "replace");
        renderTimeline(root, domain, currentPlaceId, epochId, selectedTrackId, locationScope);
      });
    });
    body.querySelectorAll("[data-parallel-epoke-id]").forEach((node) => {
      node.addEventListener("click", () => {
        const trackId = txt(node.getAttribute("data-parallel-epoke-id"));
        renderTimeline(root, domain, currentPlaceId, currentEpochId, trackId === selectedTrackId ? "" : trackId, locationScope);
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
    body.querySelectorAll("[data-epoke-person-id]").forEach((node) => {
      const button = /** @type {HTMLElement} */ (node);
      button.addEventListener("click", () => {
        const personId = txt(button.getAttribute("data-epoke-person-id"));
        const person = (Array.isArray(window.PEOPLE) ? window.PEOPLE : []).find((candidate) => txt(candidate?.id) === personId);
        if (person) navigateToPerson(person);
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
    if (window.HGEpokerRuntime?.loadHistoryCoverage) await window.HGEpokerRuntime.loadHistoryCoverage();
    ensureStyles();
    closeDom();

    const urlState = readUrlState();
    const urlPlace = urlState.placeId
      ? (Array.isArray(window.PLACES) ? window.PLACES : []).find((candidate) => txt(candidate?.id) === urlState.placeId)
      : null;
    const place = options.place || urlPlace || null;
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
    const hasUrlScope = ["city", "country", "global"].includes(urlState.scope);
    let locationScope = options.locationScope || (historyMode === "none" && hasUrlScope
      ? locationScopeFromUrl(urlState)
      : defaultLocationScope(place));
    if (historyMode !== "none") writeUrlState(domain, currentEpochId, locationScope, historyMode === "push" ? "push" : "replace");

    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const root = document.createElement("div");
    root.id = ROOT_ID;
    root.className = "hg-epoke-viewer";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-labelledby", "hgEpokeViewerTitle");
    root.innerHTML = `<section class="hg-epoke-viewer__panel"><header class="hg-epoke-viewer__head"><div><div class="hg-epoke-viewer__kicker">History Go · Epoker</div><h2 class="hg-epoke-viewer__title" id="hgEpokeViewerTitle">Tidslinje</h2><div class="hg-epoke-viewer__summary" data-epoke-summary></div></div><button type="button" class="hg-epoke-viewer__close" aria-label="Lukk epokevisning">×</button></header><div class="hg-epoke-viewer__toolbar"><div class="hg-epoke-viewer__field"><label for="hgEpokeDomainSelect">Fagområde</label><select id="hgEpokeDomainSelect" class="hg-epoke-viewer__select" data-epoke-domain>${domains.map((candidate) => `<option value="${esc(candidate)}"${candidate === domain ? " selected" : ""}>${esc(domainLabel(candidate))}</option>`).join("")}</select></div><div class="hg-epoke-viewer__field"><label for="hgEpokeLocationSelect">Område</label><select id="hgEpokeLocationSelect" class="hg-epoke-viewer__select" data-epoke-location>${locationOptionsHtml(locationScope, place)}</select></div></div><div class="hg-epoke-viewer__body" data-epoke-body></div></section>`;

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
      const epochId = domain === txt(resolution?.domain) ? currentEpochId : "";
      writeUrlState(domain, epochId, locationScope, "replace");
      renderTimeline(root, domain, currentPlaceId, epochId, "", locationScope);
    });

    const locationSelect = /** @type {HTMLSelectElement|null} */ (root.querySelector("[data-epoke-location]"));
    locationSelect?.addEventListener("change", () => {
      locationScope = scopeFromValue(locationSelect.value);
      const epochId = txt(root.dataset.epokeCurrentId);
      writeUrlState(domain, epochId, locationScope, "replace");
      renderTimeline(root, domain, currentPlaceId, epochId, "", locationScope);
    });

    renderTimeline(root, domain, currentPlaceId, currentEpochId, "", locationScope);
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
    const place = state.placeId
      ? (Array.isArray(window.PLACES) ? window.PLACES : []).find((candidate) => txt(candidate?.id) === state.placeId)
      : null;
    const openOptions = /** @type {any} */ ({ place, resolution: { domain, epokeId: state.epochId }, historyMode: "none" });
    if (["city", "country", "global"].includes(state.scope)) openOptions.locationScope = locationScopeFromUrl(state);
    return open(openOptions);
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
