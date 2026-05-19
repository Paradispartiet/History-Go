function getToastDuration(msg) {
  const text = String(msg || "").trim();
  const len = text.length;

  if (len <= 20) return 1400;
  if (len <= 55) return 2300;
  if (len <= 110) return 3600;
  return 5200;
}

function showToast(msg, ms = null) {
  const tt = (key, fallback) => window.HG_I18N?.t?.(key, fallback) || fallback;
  const t = el.toast;
  if (!t) return;

  clearTimeout(t._hide);
  t._hide = null;

  t.innerHTML = "";

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "toast-close";
  closeBtn.setAttribute("aria-label", tt("ui.toast.closeMessage", "Lukk melding"));
  closeBtn.textContent = "×";
  closeBtn.addEventListener("click", () => {
    clearTimeout(t._hide);
    t._hide = null;
    t.style.display = "none";
  });

  const body = document.createElement("div");
  body.className = "toast-body";
  body.textContent = String(msg || "");

  t.appendChild(closeBtn);
  t.appendChild(body);
  t.style.display = "block";

  const duration = Number.isFinite(ms) ? Number(ms) : getToastDuration(msg);

  if (duration > 0) {
    t._hide = setTimeout(() => {
      t.style.display = "none";
    }, duration);
  }
}

(function () {
  const btnId = "pcPsychologyRoom";

  function activePlace() {
    const card = document.getElementById("placeCard");
    const id = String(card?.dataset?.currentPlaceId || "").trim();
    const places = Array.isArray(window.PLACES) ? window.PLACES : [];
    return places.find(p => String(p?.id || "").trim() === id) || null;
  }

  function ensureButton() {
    let btn = document.getElementById(btnId);
    if (btn) return btn;

    const actions = document.querySelector(".app-actions");
    if (!actions) return null;

    btn = document.createElement("button");
    btn.id = btnId;
    btn.type = "button";
    btn.className = "primary";
    btn.textContent = "Psykologrommet";
    btn.hidden = true;
    btn.style.display = "none";
    actions.appendChild(btn);

    btn.addEventListener("click", async e => {
      e.preventDefault();
      e.stopPropagation();

      if (!document.getElementById("psychology-room-css")) {
        const link = document.createElement("link");
        link.id = "psychology-room-css";
        link.rel = "stylesheet";
        link.href = "css/psychologyRoom.css";
        document.head.appendChild(link);
      }

      if (!window.PsychologyRoom?.open && !document.getElementById("psychology-room-script")) {
        const script = document.createElement("script");
        script.id = "psychology-room-script";
        script.src = "js/psychologyRoom.js";
        document.body.appendChild(script);
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }

      window.PsychologyRoom?.open?.();
    });

    return btn;
  }

  function sync() {
    const btn = ensureButton();
    if (!btn) return;
    const show = String(activePlace()?.category || "").trim() === "psykologi";
    btn.hidden = !show;
    btn.style.display = show ? "" : "none";
  }

  function init() {
    ensureButton();
    const card = document.getElementById("placeCard");
    if (card) {
      new MutationObserver(sync).observe(card, {
        attributes: true,
        attributeFilter: ["data-current-place-id"]
      });
    }
    sync();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
