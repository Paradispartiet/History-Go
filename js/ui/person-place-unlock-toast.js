// js/ui/person-place-unlock-toast.js
// HGTargetUnlockToast — lytter på "hg:target-unlock" og viser feirende
// popup når quiz gir første samling av en person eller et sted.
// Kontrakt: detail = { kind: "person"|"place", id, name, image, quizId, categoryId }
//
// Gjenbruker nature-unlock-stacken og stil-klassene der det gir mening,
// men har egen farge og klikkhandler (åpner person/sted-popup).

(function () {
  "use strict";

  const STACK_ID = "natureUnlockStack"; // deler kø med natur-toasten
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

  function showTargetUnlock(detail) {
    const kind = detail?.kind === "place" ? "place" : "person";
    const name = String(detail?.name || "").trim() || (kind === "place" ? "Nytt sted" : "Ny person");
    const image = String(detail?.image || "").trim();
    const id = String(detail?.id || "").trim();
    const stack = ensureStack();

    const card = document.createElement("div");
    card.className = `nature-unlock-card is-target is-${kind}`;

    const fallbackIcon = kind === "place" ? "📍" : "👤";
    const kicker = kind === "place" ? "✨ Nytt sted samlet" : "✨ Ny person møtt";

    const thumb = image
      ? `<img class="nature-unlock-thumb" src="${image}" alt=""
              onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'nature-unlock-thumb nature-unlock-thumb-icon',textContent:'${fallbackIcon}'}))">`
      : `<div class="nature-unlock-thumb nature-unlock-thumb-icon">${fallbackIcon}</div>`;

    card.innerHTML = `
      ${thumb}
      <div class="nature-unlock-body">
        <div class="nature-unlock-kicker"></div>
        <div class="nature-unlock-title"></div>
      </div>
      <button class="nature-unlock-close" type="button" aria-label="Lukk">✕</button>
    `;
    card.querySelector(".nature-unlock-kicker").textContent = kicker;
    card.querySelector(".nature-unlock-title").textContent = name;

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
      if (!id) return dismiss();
      try {
        if (kind === "person") {
          const person = (window.PEOPLE || []).find(p => p && String(p.id || "").trim() === id);
          if (person && typeof window.showPersonPopup === "function") {
            window.showPersonPopup(person);
            dismiss();
            return;
          }
        } else {
          const place = (window.PLACES || []).find(p => p && String(p.id || "").trim() === id);
          if (place) {
            if (typeof window.flyToPlace === "function") window.flyToPlace(place);
            else if (typeof window.openPlaceCard === "function") window.openPlaceCard(place);
            dismiss();
            return;
          }
        }
      } catch {}
      dismiss();
    });

    setTimeout(dismiss, AUTO_DISMISS_MS);
  }

  window.addEventListener("hg:target-unlock", (e) => {
    try { showTargetUnlock(e?.detail); } catch (err) {
      if (window.DEBUG) console.warn("[TargetUnlockToast]", err);
    }
  });
})();
