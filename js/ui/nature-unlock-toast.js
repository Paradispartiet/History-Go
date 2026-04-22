// js/ui/nature-unlock-toast.js
// HGNatureUnlockToast — lytter på hg:nature og viser et kort, feirende
// popup for hver art brukeren låser opp via quiz.
//
// Event-kontrakt (fra HGNatureUnlocks.recordFromQuiz):
//   detail.added = { flora: [id, ...], fauna: [id, ...] }
//
// For hver id slår vi opp tittel/latin/bilde i window.FLORA/FAUNA,
// med fallback til emoji hvis ingenting finnes.

(function () {
  "use strict";

  const STACK_ID = "natureUnlockStack";
  const AUTO_DISMISS_MS = 4500;

  function ensureStack() {
    let stack = document.getElementById(STACK_ID);
    if (stack) return stack;
    stack = document.createElement("div");
    stack.id = STACK_ID;
    stack.className = "nature-unlock-stack";
    stack.setAttribute("aria-live", "polite");
    document.body.appendChild(stack);
    return stack;
  }

  function findEntry(id, kind) {
    const needle = String(id || "").trim();
    if (!needle) return null;

    const list = kind === "fauna" ? (window.FAUNA || []) : (window.FLORA || []);
    const altKey = kind === "fauna" ? "related_fauna_id" : "related_flora_id";

    for (const item of list) {
      if (!item || typeof item !== "object") continue;
      if (item.id === needle || item[altKey] === needle) return item;
      if (item.kind === "emne_pack" && Array.isArray(item.items)) {
        for (const sub of item.items) {
          if (sub && (sub.id === needle || sub[altKey] === needle)) return sub;
        }
      }
    }
    return null;
  }

  function showUnlock(obj, kind) {
    const stack = ensureStack();

    const card = document.createElement("div");
    card.className = `nature-unlock-card is-${kind}`;

    const title = obj?.title || obj?.id || "Ny art";
    const latin = obj?.latin || obj?.taxonomy?.latin_navn || "";
    const icon = kind === "fauna" ? "🐞" : "🌿";
    const imgSrc = (typeof window.resolveNatureImage === "function")
      ? window.resolveNatureImage(obj || {}, kind)
      : "";

    const thumb = imgSrc
      ? `<img class="nature-unlock-thumb" src="${imgSrc}" alt=""
              onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'nature-unlock-thumb nature-unlock-thumb-icon',textContent:'${icon}'}))">`
      : `<div class="nature-unlock-thumb nature-unlock-thumb-icon">${icon}</div>`;

    card.innerHTML = `
      ${thumb}
      <div class="nature-unlock-body">
        <div class="nature-unlock-kicker">✨ Ny ${kind === "fauna" ? "art" : "plante"} samlet</div>
        <div class="nature-unlock-title"></div>
        <div class="nature-unlock-latin"></div>
      </div>
      <button class="nature-unlock-close" type="button" aria-label="Lukk">✕</button>
    `;
    card.querySelector(".nature-unlock-title").textContent = title;
    card.querySelector(".nature-unlock-latin").textContent = latin;

    stack.appendChild(card);

    // Slide inn på neste frame
    requestAnimationFrame(() => card.classList.add("is-visible"));

    function dismiss() {
      if (!card.parentNode) return;
      card.classList.remove("is-visible");
      card.classList.add("is-leaving");
      setTimeout(() => card.remove(), 250);
    }

    card.querySelector(".nature-unlock-close").addEventListener("click", dismiss);
    card.addEventListener("click", (e) => {
      if (e.target.closest(".nature-unlock-close")) return;
      if (obj && typeof window.openNatureCard === "function") {
        window.openNatureCard({ ...obj, _kind: kind });
        dismiss();
      }
    });

    setTimeout(dismiss, AUTO_DISMISS_MS);
  }

  function handleUnlock(detail) {
    const added = detail?.added || {};
    const flora = Array.isArray(added.flora) ? added.flora : [];
    const fauna = Array.isArray(added.fauna) ? added.fauna : [];

    // Maks 3 synlige samtidig for ikke å spamme skjermen.
    const MAX = 3;
    let shown = 0;

    for (const id of flora) {
      if (shown >= MAX) break;
      const obj = findEntry(id, "flora") || { id, title: id };
      showUnlock(obj, "flora");
      shown++;
    }
    for (const id of fauna) {
      if (shown >= MAX) break;
      const obj = findEntry(id, "fauna") || { id, title: id };
      showUnlock(obj, "fauna");
      shown++;
    }

    const total = flora.length + fauna.length;
    if (total > MAX) {
      const stack = ensureStack();
      const more = document.createElement("div");
      more.className = "nature-unlock-card is-more";
      more.innerHTML = `<div class="nature-unlock-body"><div class="nature-unlock-title">+${total - MAX} til samlet</div></div>`;
      stack.appendChild(more);
      requestAnimationFrame(() => more.classList.add("is-visible"));
      setTimeout(() => {
        more.classList.remove("is-visible");
        setTimeout(() => more.remove(), 250);
      }, AUTO_DISMISS_MS);
    }
  }

  window.addEventListener("hg:nature", (e) => {
    try { handleUnlock(e?.detail); } catch (err) {
      if (window.DEBUG) console.warn("[NatureUnlockToast]", err);
    }
  });
})();
