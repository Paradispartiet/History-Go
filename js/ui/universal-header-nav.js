/* History Go: common contextual back link for document-level navigation. */
(() => {
  "use strict";

  const SCRIPT_URL = new URL((/** @type {HTMLScriptElement} */ (document.currentScript)).src);
  const APP_ROOT = new URL("../../", SCRIPT_URL);
  const INTENT_KEY = "hg-header-nav-intent-v1";
  const RETURN_KEY = "hg-header-nav-return-v1";
  const MAP_URL = new URL("index.html#/map", APP_ROOT);
  const PAGE_NAMES = Object.freeze({
    "index.html": "Kartet",
    "profile.html": "Min samling",
    "Civication.html": "Civication",
    "knowledge.html": "Kunnskap",
    "fagverk-forside.html": "Fagverket",
    "emner.html": "Min læring",
    "notater.html": "Mine notater",
    "sprakatlas.html": "Språkatlas",
    "finn-fauna.html": "Finn fauna",
    "finn-flora.html": "Finn flora"
  });

  function parsed(url) {
    if (!url) return null;
    try { return new URL(url, location.href); } catch { return null; }
  }
  function inApp(url) {
    return !!url && url.origin === APP_ROOT.origin
      && url.pathname.startsWith(APP_ROOT.pathname)
      && (url.protocol === "https:" || url.protocol === "http:");
  }
  function documentKey(url) {
    return url.origin + url.pathname + url.search;
  }
  function fileName(url) {
    return url.pathname.split("/").pop() || "index.html";
  }
  function safePage(url) {
    return inApp(url) && fileName(url) !== "login.html";
  }
  function humanLabel(url) {
    return PAGE_NAMES[fileName(url)]
      || (fileName(url).replace(/\.html?$/i, "").replace(/[-_]+/g, " ").trim() || "forrige side");
  }
  function readRecent(key) {
    try {
      const value = JSON.parse(sessionStorage.getItem(key) || "null");
      if (value && Date.now() - value.time < 120000) return value;
    } catch { /* storage may be disabled */ }
    return null;
  }

  // Capture the full URL (including map/place state in the hash) before leaving.
  document.addEventListener("click", (event) => {
    const mouse = /** @type {MouseEvent} */ (event);
    if (mouse.defaultPrevented || mouse.button !== 0 || mouse.metaKey || mouse.ctrlKey || mouse.shiftKey || mouse.altKey) return;
    const target = /** @type {Element | null} */ (mouse.target);
    const link = /** @type {HTMLAnchorElement | null} */ (target?.closest?.("a[href]"));
    if (!link || link.matches("[data-hg-nav-back], [data-hg-nav-home]") || link.hasAttribute("download")
        || (link.target && link.target !== "_self")) return;
    const destination = parsed(link.href);
    if (!safePage(destination) || documentKey(destination) === documentKey(location)) return;
    try {
      sessionStorage.setItem(INTENT_KEY, JSON.stringify({
        from: location.href,
        to: destination.href,
        label: humanLabel(location),
        time: Date.now()
      }));
    } catch { /* navigation still works without sessionStorage */ }
  }, true);

  const current = parsed(location.href);
  const referrer = parsed(document.referrer);
  const returned = readRecent(RETURN_KEY);
  const arrivedFromBack = safePage(parsed(returned?.to))
    && documentKey(parsed(returned.to)) === documentKey(current);
  if (arrivedFromBack) {
    try { sessionStorage.removeItem(RETURN_KEY); } catch { /* optional storage */ }
  }

  // Only a forward link clicked in this tab establishes a previous page.
  // A referrer alone can be login.html or a page we just returned from.
  const intent = readRecent(INTENT_KEY);
  const intendedFrom = parsed(intent?.from);
  const intendedTo = parsed(intent?.to);
  const trustedForward = !arrivedFromBack && safePage(referrer)
    && safePage(intendedFrom) && safePage(intendedTo)
    && documentKey(intendedFrom) === documentKey(referrer)
    && documentKey(intendedTo) === documentKey(current)
    && documentKey(intendedFrom) !== documentKey(current);
  let previous = trustedForward ? intendedFrom : null;

  // Direct links must have a predictable in-app destination.
  const fallbackPage = ["knowledge.html", "notater.html", "emner.html"].includes(fileName(current))
    ? "profile.html" : "index.html";
  const fallback = fallbackPage === "index.html" ? MAP_URL : new URL(fallbackPage, APP_ROOT);
  const isMapRoot = fileName(current) === "index.html";
  let lastPlaceUrl = null;
  let changedIndexRoute = false;

  function routeType(url) {
    if (!url || !isMapRoot) return "";
    const route = url.hash.match(/^#\/(map|place|quiz|debate)(?:\/|$)/);
    return route ? route[1] : "map";
  }
  function getDestination() {
    const route = routeType(parsed(location.href));
    // The map is the terminal return destination.
    if (isMapRoot && route === "map") return null;
    if (isMapRoot) {
      if (previous && !changedIndexRoute) return { url: previous, label: humanLabel(previous) };
      if (["quiz", "debate"].includes(route) && lastPlaceUrl) {
        return { url: lastPlaceUrl, label: "Stedet" };
      }
      return { url: MAP_URL, label: "Kartet" };
    }
    if (previous) return { url: previous, label: humanLabel(previous) };
    return { url: fallback, label: humanLabel(fallback) };
  }

  // Preserve existing controls; existing left/back links must not duplicate.
  const existing = document.querySelector(
    ".profile-header-left > .back-link, .topbar-right > .back-link, " +
    ".emner-header-nav > .back-link:first-child, main.main > header > a[href='profile.html'], " +
    ".sprakatlas-topbar > .sprakatlas-back, .ne-header > .ne-back"
  );
  const host = document.querySelector(
    "body.hg-app > .site-header, .profile-header-left, .topbar-left, " +
    ".kv2-appbar, .fagverk-topbar, .sprakatlas-topbar, .ne-header, " +
    ".emner-header-nav, main.main > header"
  );
  if (!host) return;
  const link = /** @type {HTMLAnchorElement} */ (existing || document.createElement("a"));
  if (existing && existing.parentElement !== host) existing.remove();
  link.classList.remove("back-link", "ne-back");
  link.classList.add("hg-universal-back");
  link.setAttribute("data-hg-nav-back", "");

  const home = document.createElement("a");
  home.className = "hg-universal-home";
  home.setAttribute("data-hg-nav-home", "");
  home.href = MAP_URL.href;
  home.title = "History GO – hjem til kartet";
  home.setAttribute("aria-label", "History GO – hjem til kartet");
  const logo = document.createElement("img");
  logo.src = new URL("bilder/logo_historygo.PNG", APP_ROOT).href;
  logo.alt = "";
  logo.setAttribute("aria-hidden", "true");
  logo.setAttribute("width", "30");
  logo.setAttribute("height", "30");
  home.append(logo);

  function mountControls() {
    // The main index already has the large History GO welcome logo. Only
    // subpages need this separate small logo as a direct return to the map.
    if (isMapRoot) {
      home.remove();
      if (!link.hidden && host.firstElementChild !== link) host.prepend(link);
      return;
    }
    // The small home logo precedes the back arrow in visual and keyboard order.
    if (home.parentElement !== host || host.firstElementChild !== home
        || (!link.hidden && host.children[1] !== link)) {
      link.remove();
      home.remove();
      if (!link.hidden) host.prepend(link);
      host.prepend(home);
    }
  }

  function update() {
    const choice = getDestination();
    if (!choice) {
      link.hidden = true;
      link.removeAttribute("href");
      link.remove();
      mountControls();
      return;
    }
    const readableLabel = choice.label === "Civication" ? choice.label : choice.label.toLocaleLowerCase("nb");
    link.hidden = false;
    link.href = choice.url.href;
    link.title = "Tilbake til " + readableLabel;
    link.setAttribute("aria-label", link.title);
    link.replaceChildren();
    const arrow = document.createElement("span");
    arrow.className = "hg-universal-back-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "←";
    link.append(arrow);
    mountControls();
  }

  function navigateSafely(url) {
    if (!safePage(url)) return;
    try {
      sessionStorage.setItem(RETURN_KEY, JSON.stringify({
        from: location.href, to: url.href, time: Date.now()
      }));
      sessionStorage.removeItem(INTENT_KEY);
    } catch { /* navigation works without storage */ }
    // Never history.back(): the browser may have login.html behind this page.
    location.replace(url.href);
  }
  function plainClick(event) {
    return !event.defaultPrevented && event.button === 0
      && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
  }
  link.addEventListener("click", event => {
    const choice = getDestination();
    if (!choice || !plainClick(event)) return;
    event.preventDefault();
    navigateSafely(choice.url);
  });
  home.addEventListener("click", event => {
    if (!plainClick(event)) return;
    event.preventDefault();
    if (location.href !== MAP_URL.href) navigateSafely(MAP_URL);
  });

  if (isMapRoot) {
    window.addEventListener("hashchange", (event) => {
      const from = parsed(event.oldURL);
      const to = parsed(event.newURL);
      if (inApp(from) && inApp(to) && documentKey(from) === documentKey(to)) {
        changedIndexRoute = true;
        if (routeType(from) === "place" && ["quiz", "debate"].includes(routeType(to))) {
          lastPlaceUrl = from;
        }
        if (routeType(to) === "map") lastPlaceUrl = null;
      }
      update();
    });
  }
  update();
  window.HGHeaderNavigation = Object.freeze({
    back: () => { if (!link.hidden) link.click(); },
    home: () => home.click(),
    get destination() { return getDestination()?.url?.href || null; },
    get homeDestination() { return MAP_URL.href; }
  });
})();
