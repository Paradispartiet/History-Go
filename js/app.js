document.addEventListener("DOMContentLoaded", async () => {
  await safeRun("boot", window.boot);

  await safeRun("initMiniProfile", window.initMiniProfile);
  await safeRun("wireMiniProfileLinks", window.wireMiniProfileLinks);
  await safeRun("initLeftPanel", window.initLeftPanel);

  if (window.HGPos?.request) {
    await safeRun("HGPos.request", window.HGPos.request);
  }
});

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
