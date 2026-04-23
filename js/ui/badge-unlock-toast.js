// js/ui/badge-unlock-toast.js
// HGBadgeUnlockToast — lytter på "hg:badge-tier-unlock" og viser
// feirende popup når brukeren krysser nytt tier-nivå i en kategori
// (Amatør → Student → Doktor → Professor osv.).
//
// Kontrakt (fra merits-and-jobs.updateMeritLevel):
//   detail = { categoryId, categoryName, badgeImage,
//              prevTierIndex, nextTierIndex, newTierLabel, points }
//
// Deler DOM-stack med natur- og person/place-toastene.

(function () {
  "use strict";

  const STACK_ID = "natureUnlockStack";
  const AUTO_DISMISS_MS = 5500; // litt lenger enn andre — dette er en stor milepæl

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

  function showBadgeUnlock(detail) {
    const stack = ensureStack();

    const categoryName = String(detail?.categoryName || detail?.categoryId || "Kategori").trim();
    const tierLabel = String(detail?.newTierLabel || "").trim() || "Nytt nivå";
    const badgeImage = String(detail?.badgeImage || "").trim();

    const card = document.createElement("div");
    card.className = "nature-unlock-card is-badge";

    const thumb = badgeImage
      ? `<img class="nature-unlock-thumb nature-unlock-thumb-badge" src="${badgeImage}" alt=""
              onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'nature-unlock-thumb nature-unlock-thumb-icon',textContent:'🏅'}))">`
      : `<div class="nature-unlock-thumb nature-unlock-thumb-icon">🏅</div>`;

    card.innerHTML = `
      ${thumb}
      <div class="nature-unlock-body">
        <div class="nature-unlock-kicker"></div>
        <div class="nature-unlock-title"></div>
        <div class="nature-unlock-latin"></div>
      </div>
      <button class="nature-unlock-close" type="button" aria-label="Lukk">✕</button>
    `;
    card.querySelector(".nature-unlock-kicker").textContent = "🎓 Nytt nivå oppnådd";
    card.querySelector(".nature-unlock-title").textContent = tierLabel;
    card.querySelector(".nature-unlock-latin").textContent = categoryName;

    stack.appendChild(card);
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
      // Åpne badge-modalen hvis tilgjengelig
      const catId = String(detail?.categoryId || "").trim();
      if (catId && typeof window.handleBadgeClick === "function") {
        try { window.handleBadgeClick(catId); } catch {}
      }
      dismiss();
    });

    setTimeout(dismiss, AUTO_DISMISS_MS);
  }

  window.addEventListener("hg:badge-tier-unlock", (e) => {
    try { showBadgeUnlock(e?.detail); } catch (err) {
      if (window.DEBUG) console.warn("[BadgeUnlockToast]", err);
    }
  });
})();
