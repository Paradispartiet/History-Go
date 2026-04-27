document.addEventListener("DOMContentLoaded", async () => {
  await safeRun("boot", window.boot);

  // Globalt søk lå i repoet, men var ikke lastet inn av index.html.
  // Lastes etter boot slik at window.PLACES / window.PEOPLE / kategorier finnes.
  await safeRun("loadGlobalSearch", () => loadScriptOnce("js/ui/search.js"));

  await safeRun("initMiniProfile", window.initMiniProfile);
  await safeRun("wireMiniProfileLinks", window.wireMiniProfileLinks);
  await safeRun("initLeftPanel", window.initLeftPanel);
  await safeRun("HGRoutes.init", () => window.HGRoutes?.init?.());

  if (window.HGPos?.request) {
    await safeRun("HGPos.request", window.HGPos.request);
  }
});

function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    if (!src) return resolve();

    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "1") return resolve();
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.dataset.loaded = "0";
    script.onload = () => {
      script.dataset.loaded = "1";
      resolve();
    };
    script.onerror = () => reject(new Error(`Kunne ikke laste ${src}`));
    document.body.appendChild(script);
  });
}

async function safeRun(label, fn) {
  try {
    const out = fn?.();

    if (out && typeof out.then === "function") {
      return await out;
    }

    return out;
  } catch (e) {
    console.error(`[${label}]`, e);

    if (window.DEBUG) {
      window.__HG_LAST_ERROR__ = {
        label,
        message: String(e),
        stack: e?.stack || null
      };
    }

    throw e;
  }
}
