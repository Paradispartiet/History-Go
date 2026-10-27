/* History Go: common contextual back link for document-level navigation. */
(() => {
  "use strict";

  const SCRIPT_URL = new URL(document.currentScript.src);
  const APP_ROOT = new URL("../../", SCRIPT_URL);
  const INTENT_KEY = "hg-header-nav-intent-v1";
  const PAGE_NAMES = Object.freeze({
    "index.html": "Kartet",
    "profile.html": "Min samling",
    "Civication.html": "Civication",
    "knowledge.html": "Kunnskap",
    "fagverk-forside.html": "Fagverket",
    "emner.html": "Min læring",
    "notater.html": "Mine notater",
    "sprakatlas.html": "Språkatlas"
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
  function humanLabel(url) {
    return PAGE_NAMES[fileName(url)]
      || (fileName(url).replace(/\.html?$/i, "").replace(/[-_]+/g, " ").trim() || "forrige side");
  }
  function readIntent() {
    try {
      const value = JSON.parse(sessionStorage.getItem(INTENT_KEY) || "null");
      if (value && Date.now() - value.time < 120000) return value;
    } catch { /* storage may be disabled */ }
    return null;
  }

  // Capture the full URL (including map/place state in the hash) before leaving.
  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest?.("a[href]");
    if (!link || link.matches("[data-hg-nav-back]") || link.hasAttribute("download")
        || (link.target && link.target !== "_self")) return;
    const destination = parsed(link.href);
    if (!inApp(destination) || documentKey(destination) === documentKey(location)) return;
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
  const usableReferrer = inApp(referrer) && documentKey(referrer) !== documentKey(current);
  const intent = readIntent();
  let previous = usableReferrer ? referrer : null;

  // The browser drops fragments from document.referrer. Restore them only for
  // a matching, very recent navigation intent from this tab.
  if (previous && intent && inApp(parsed(intent.from)) && inApp(parsed(intent.to))
      && documentKey(parsed(intent.from)) === documentKey(previous)
      && documentKey(parsed(intent.to)) === documentKey(current)) {
    previous = parsed(intent.from);
  }

  // Direct links must have a predictable in-app destination.
  const fallbackPage = ["knowledge.html", "notater.html", "emner.html"].includes(fileName(current))
    ? "profile.html" : "index.html";
  const fallback = new URL(fallbackPage, APP_ROOT);
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
    // Internal hash routes are screens, not separate documents. The persistent
    // index header must provide a back link for place, quiz, and debate too.
    if (isMapRoot && route !== "map") {
      if (previous && !changedIndexRoute) return { url: previous, label: humanLabel(previous), browserBack: true };
      if (["quiz", "debate"].includes(route) && lastPlaceUrl) {
        return { url: lastPlaceUrl, label: "Stedet", browserBack: false };
      }
      return { url: new URL("#/map", current), label: "Kartet", browserBack: false };
    }
    if (previous) return { url: previous, label: humanLabel(previous), browserBack: true };
    if (isMapRoot) return null;
    return { url: fallback, label: humanLabel(fallback), browserBack: false };
  }

  // Preserve existing controls; existing left/back links must not duplicate.
  const existing = document.querySelector(
    ".profile-header-left > .back-link, .topbar-right > .back-link, " +
    ".emner-header-nav > .back-link:first-child, main.main > header > a[href='profile.html'], " +
    ".sprakatlas-topbar > .sprakatlas-back"
  );
  const host = document.querySelector(
    "body.hg-app > .site-header, .profile-header-left, .topbar-left, " +
    ".kv2-appbar, .fagverk-topbar, .sprakatlas-topbar, " +
    ".emner-header-nav, main.main > header"
  );
  if (!host) return;
  const link = existing || document.createElement("a");
  if (existing && existing.parentElement !== host) existing.remove();
  link.classList.remove("back-link");
  link.classList.add("hg-universal-back");
  link.setAttribute("data-hg-nav-back", "");

  function update() {
    const choice = getDestination();
    if (!choice) {
      link.hidden = true;
      link.removeAttribute("href");
      if (link.parentElement) link.remove();
      return;
    }
    const label = choice.label;
    const readableLabel = label === "Civication" ? label : label.toLocaleLowerCase("nb");
    link.hidden = false;
    link.href = choice.url.href;
    link.title = "Tilbake til " + readableLabel;
    link.setAttribute("aria-label", link.title);
    link.replaceChildren();
    const arrow = document.createElement("span");
    arrow.className = "hg-universal-back-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "←";
    const text = document.createElement("span");
    text.className = "hg-universal-back-text";
    text.textContent = "Til " + readableLabel;
    link.append(arrow, text);
    if (link.parentElement !== host || host.firstElementChild !== link) host.prepend(link);
  }

  link.addEventListener("click", (event) => {
    const choice = getDestination();
    if (!choice || event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (choice.browserBack && usableReferrer && history.length > 1) {
      event.preventDefault();
      history.back();
    }
    // A route-local link uses its ordinary href, so AppRouter observes the hashchange.
    // A direct deep link uses its safe fallback href if browser history is absent.
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
    get destination() { return getDestination()?.url?.href || null; }
  });
})();
