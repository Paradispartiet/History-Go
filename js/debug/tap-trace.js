/* Opt-in device evidence for the Stortinget/input incident. No persistence or network. */
(() => {
  "use strict";
  if (new URLSearchParams(location.search).get("hgTapTrace") !== "1") return;
  if (window.HGDeviceTapTrace) return;
  const started = performance.now();
  const state = { opens: [], events: [], errors: [], ticks: 0 };
  const push = (list, row) => { list.push(row); if (list.length > 8) list.shift(); };
  const name = node => node instanceof Element
    ? (node.id ? "#" + node.id : node.tagName.toLowerCase() + "." + String(node.className).slice(0, 65)) : "?";
  let panel = null;
  let depth = 0;
  let opener;
  const proxies = new WeakMap();

  function wrap(fn) {
    if (typeof fn !== "function") return fn;
    if (proxies.has(fn)) return proxies.get(fn);
    const proxy = new Proxy(fn, {
      apply(target, receiver, args) {
        if (depth === 0) {
          const place = args[0];
          push(state.opens, {
            place: String(typeof place === "object" ? place?.id || "" : place || "").slice(0, 100),
            at: Math.round(performance.now() - started),
            from: String(new Error().stack || "").split("\n")
              .filter(line => /\.js[:?]|\.ts:/.test(line) && !line.includes("tap-trace.js"))
              .slice(0, 4).map(line => line.replace(location.origin, ""))
          });
        }
        depth += 1;
        try { return Reflect.apply(target, receiver, args); }
        finally { depth -= 1; }
      }
    });
    proxies.set(fn, proxy);
    proxies.set(proxy, proxy);
    return proxy;
  }

  // Preserve calls, receiver, return values, thrown errors and patch flags.
  // Each later compatibility wrapper can still read/write its function properties.
  const descriptor = Object.getOwnPropertyDescriptor(window, "openPlaceCard");
  if (!descriptor || (descriptor.configurable && "value" in descriptor)) {
    opener = wrap(window.openPlaceCard);
    Object.defineProperty(window, "openPlaceCard", {
      configurable: true, enumerable: true,
      get: () => opener,
      set: fn => { opener = wrap(fn); }
    });
  }

  function snapshot() {
    const card = document.getElementById("placeCard");
    const style = card ? getComputedStyle(card) : null;
    return {
      version: "tap-trace-20261111-1",
      ticks: state.ticks,
      route: location.hash,
      ready: window.__HG_APP_READY__ === true,
      router: window.__HG_ROUTER_STARTED__ === true,
      body: document.body?.className || "",
      card: { id: card?.dataset.currentPlaceId || "", display: style?.display, pointer: style?.pointerEvents },
      opens: state.opens.slice(), events: state.events.slice(), errors: state.errors.slice()
    };
  }

  function render() {
    if (!panel && document.body) {
      panel = document.createElement("pre");
      panel.id = "hgDeviceTapTrace";
      panel.setAttribute("aria-live", "off");
      panel.style.cssText = "position:fixed!important;left:4px!important;bottom:4px!important;z-index:2147483647!important;pointer-events:none!important;user-select:none!important;margin:0!important;padding:7px!important;max-width:calc(100vw - 8px)!important;max-height:38vh!important;overflow:hidden!important;white-space:pre-wrap!important;overflow-wrap:anywhere!important;background:#101820ed!important;color:#fff!important;font:11px/1.25 monospace!important;border:1px solid #9cf!important;box-sizing:border-box!important";
      document.body.appendChild(panel);
    }
    if (!panel) return;
    const s = snapshot();
    const open = s.opens[s.opens.length - 1];
    panel.textContent = [
      s.version + " · puls " + s.ticks,
      "rute " + s.route + " · klar " + s.ready + "/" + s.router,
      "kort " + s.card.id + " · " + s.card.display + "/" + s.card.pointer,
      "åpninger " + s.opens.length + (open ? " · sist " + open.place + " @ " + open.at + "ms" : ""),
      ...(open?.from || []),
      ...s.events.slice(-5).map(e => e.type + " " + e.phase + " " + e.target + (e.top ? " · topp " + e.top : "")),
      ...s.errors.slice(-2)
    ].join("\n");
  }

  for (const type of ["pointerdown", "touchend", "click"]) {
    window.addEventListener(type, event => {
      const pointer = /** @type {MouseEvent & TouchEvent} */ (event);
      const point = pointer.changedTouches?.[0] || pointer;
      const top = Number.isFinite(point.clientX) && Number.isFinite(point.clientY)
        ? document.elementFromPoint(point.clientX, point.clientY) : null;
      push(state.events, { type, phase: "capture", target: name(event.target), top: name(top) });
      render();
    }, { capture: true, passive: true });
  }
  window.addEventListener("click", event => {
    push(state.events, { type: "click", phase: event.defaultPrevented ? "bubble/cancelled" : "bubble", target: name(event.target) });
    render();
  }, { passive: true });
  window.addEventListener("error", event => {
    push(state.errors, String(event.message || "Script error").slice(0, 180));
  });
  window.HGDeviceTapTrace = Object.freeze({ snapshot });
  window.setInterval(() => { state.ticks += 1; render(); }, 500);
  document.addEventListener("DOMContentLoaded", render, { once: true });
})();
