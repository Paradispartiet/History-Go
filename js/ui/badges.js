// ==============================
// UI – MERKER / BADGES
// ==============================

function pulseBadge(cat) {
  const cards = document.querySelectorAll(".badge-mini");
  cards.forEach(card => {
    const name =
      card.querySelector(".badge-mini-label")?.textContent || "";

    if (name.trim().toLowerCase() === cat.trim().toLowerCase()) {
      card.classList.add("badge-pulse");
      setTimeout(() => {
        card.classList.remove("badge-pulse");
      }, 1200);
    }
  });
}

async function ensureBadgesLoaded() {
  if (Array.isArray(window.BADGES) && window.BADGES.length)

  try {
    const data = await fetch("data/badges.json", { cache: "no-store" })
      .then(r => r.json());

    BADGES = Array.isArray(data?.badges) ? data.badges : [];
  } catch {
    BADGES = [];
  }
}

// global eksponering (samme mønster som resten)
window.pulseBadge = pulseBadge;
window.ensureBadgesLoaded = ensureBadgesLoaded;
