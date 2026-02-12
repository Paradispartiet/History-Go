document.addEventListener("DOMContentLoaded", () => {
  safeRun("boot", boot);

  safeRun("civicationPulse", async () => {
    await window.HG_CiviEngine?.onAppOpen?.();
    window.renderCivicationInbox?.();
    window.dispatchEvent(new Event("updateProfile"));
  });

  safeRun("initMiniProfile", window.initMiniProfile);
  safeRun("wireMiniProfileLinks", window.wireMiniProfileLinks);
  safeRun("initLeftPanel", window.initLeftPanel);
  safeRun("initPlaceCardCollapse", window.initPlaceCardCollapse);
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




// =====================================================
// PLACE CARD – collapse/expand/toggle (global API)
// =====================================================
window.setPlaceCardCollapsed = function (collapsed) {
  const pc = document.getElementById("placeCard");
  if (!pc) return;

  pc.classList.toggle("is-collapsed", !!collapsed);
  document.body.classList.toggle("pc-collapsed", !!collapsed);
};

window.collapsePlaceCard = function () {
  window.setPlaceCardCollapsed(true);
};

window.expandPlaceCard = function () {
  window.setPlaceCardCollapsed(false);
};

window.togglePlaceCard = function () {
  window.setPlaceCardCollapsed(!document.body.classList.contains("pc-collapsed"));
};

// Klikk på “handle-stripen” (øverste ~26px av placeCard) toggler
document.addEventListener("click", (e) => {
  const pc = document.getElementById("placeCard");
  if (!pc) return;

  // bare hvis du faktisk klikker på placeCard
  const inside = e.target.closest?.("#placeCard");
  if (!inside) return;

  const r = pc.getBoundingClientRect();
  const y = e.clientY - r.top;

  // handle-område (juster ved behov)
  if (y >= 0 && y <= 26) {
    e.preventDefault();
    window.togglePlaceCard();
  }
});




