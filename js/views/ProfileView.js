// js/views/ProfileView.js
// Tynt/skjelett view for #/profile i index-appen.
// Full profilside eies fortsatt av profile.html/js/profile.js.

(function () {
  "use strict";

  const VIEW_ID = "profileView";

  function closeQuizModals() {
    document.getElementById("quizModal")?.remove?.();
    document.getElementById("quizSummaryModal")?.remove?.();
  }

  function hidePlaceCard() {
    const card = document.getElementById("placeCard");
    if (!card) return;

    card.setAttribute("aria-hidden", "true");
    card.dataset.currentPlaceId = "";

    if (typeof window.collapsePlaceCard === "function") {
      window.collapsePlaceCard();
    } else {
      card.classList.add("is-collapsed");
    }

    window.bottomSheetController?.hide?.();
  }

  function getMountTarget() {
    return document.querySelector(".app-shell") || document.body || document.documentElement;
  }

  function ensureView() {
    let view = document.getElementById(VIEW_ID);
    if (view) return view;

    view = document.createElement("div");
    view.id = VIEW_ID;
    view.className = "hg-profile-view";
    view.hidden = true;
    view.setAttribute("role", "main");
    view.setAttribute("aria-labelledby", "profileViewTitle");
    view.innerHTML = `
      <section class="hg-profile-view__card" style="margin: 1rem; padding: 1rem; border-radius: 18px; background: rgba(255,255,255,0.94); box-shadow: 0 12px 30px rgba(0,0,0,0.16);">
        <h1 id="profileViewTitle" style="margin: 0 0 0.5rem;">Profil</h1>
        <p style="margin: 0 0 1rem;">Profilen er foreløpig egen side.</p>
        <a class="hg-profile-view__full-link" href="profile.html" style="display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 0 1rem; border-radius: 999px; background: #111827; color: #fff; font-weight: 700; text-decoration: none;">
          Åpne full profil
        </a>
      </section>
    `;

    const link = view.querySelector(".hg-profile-view__full-link");
    link?.addEventListener("click", (event) => {
      event.preventDefault();
      ProfileView.openFullProfile();
    });

    getMountTarget().appendChild(view);
    return view;
  }

  const ProfileView = {
    show() {
      document.body?.classList.remove("hg-view-map", "hg-view-quiz");
      document.body?.classList.add("hg-view-profile");

      hidePlaceCard();
      closeQuizModals();

      const view = ensureView();
      view.hidden = false;
      view.setAttribute("aria-hidden", "false");
    },

    hide() {
      const view = document.getElementById(VIEW_ID);
      if (!view) return;

      view.hidden = true;
      view.setAttribute("aria-hidden", "true");
    },

    openFullProfile() {
      window.location.href = "profile.html";
    }
  };

  window.HGProfileView = ProfileView;
})();
