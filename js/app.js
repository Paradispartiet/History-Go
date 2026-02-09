document.addEventListener("DOMContentLoaded", () => {
  safeRun("boot", boot);

  safeRun("civicationPulse", async () => {
    await window.HG_CiviEngine?.onAppOpen?.();
    window.renderCivicationInbox?.();
    window.dispatchEvent(new Event("updateProfile"));
  });

  safeRun("initMiniProfile", initMiniProfile);
  safeRun("wireMiniProfileLinks", wireMiniProfileLinks);
  safeRun("initLeftPanel", initLeftPanel);
  safeRun("initPlaceCardCollapse", initPlaceCardCollapse);
});

function safeRun(label, fn) {
  try {
    const out = fn();
    if (out && typeof out.then === "function") {
      out.catch((e) => {
        console.error(`[${label}]`, e);
        if (DEBUG) {
          window.__HG_LAST_ERROR__ = {
            label,
            message: String(e),
            stack: e?.stack
          };
        }
      });
    }
  } catch (e) {
    console.error(`[${label}]`, e);
    if (DEBUG) {
      window.__HG_LAST_ERROR__ = {
        label,
        message: String(e),
        stack: e?.stack
      };
    }
  }
}








