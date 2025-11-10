// ============================================================
// === HISTORY GO – PROFILE.JS (v2.8, stabil live-sync) =======
// ============================================================
//
//  • Leser data direkte fra HG.data (core.js)
//  • Viser profil, merker, personer, steder og tidslinje
//  • Oppdateres automatisk ved quiz/fullføring (updateProfile)
// ============================================================

window.addEventListener("DOMContentLoaded", () => {
  // Vent til data er ferdig lastet fra core.js
  const waitForData = setInterval(() => {
    if (window.HG?.data?.places?.length) {
      clearInterval(waitForData);
      Profile.initProfilePage();
    }
  }, 150);
});

const Profile = (() => {
  let DATA = { places: [], people: [], badges: [] };

  // ----------------------------------------------------------
  // 1) INITIERING
  // ----------------------------------------------------------
  async function initProfilePage() {
    DATA = HG?.data || DATA;
    renderAll();
    setupButtons();
    setupModalClose();
    setupLiveUpdates();
    console.log("👤 Profilside initialisert");
  }

  // ----------------------------------------------------------
  // 2) RENDER
  // ----------------------------------------------------------
  function renderAll() {
    if (!DATA.places.length) DATA = HG?.data || DATA;
    renderProfileCard();
    renderMerits();
    renderPeople();
    renderPlaces();
    renderTimeline();
  }

  function renderProfileCard() {
    const name = localStorage.getItem("user_name") || "Ukjent bruker";
    const color = localStorage.getItem("user_color") || "#FFD600";
    const merits = load("merits_by_category", {});
    const visited = load("visited_places", []);
    const people = load("people_collected", []);

    const elName   = document.getElementById("profileName");
    const elAvatar = document.getElementById("profileAvatar");
    const elPlaces = document.getElementById("placesCount");
    const elPeople = document.getElementById("peopleCount");
    const elBadges = document.getElementById("badgesCount");
    const elLevel  = document.getElementById("profileLevel");
    if (!elName) return;

    elName.textContent = name;
    elAvatar.style.background = color;
    elPlaces.textContent = visited.length;
    elPeople.textContent = people.length;
    elBadges.textContent = Object.keys(merits).length;

    const totalPoints = Object.values(merits).reduce((a, b) => a + (b.points || 0), 0);
    const level = Math.floor(totalPoints / 50) + 1;
    elLevel.textContent = `Historiker · nivå ${level}`;
  }

  function renderMerits() {
    const container = document.getElementById("badgesGrid");
    if (!container) return;
    container.innerHTML = "";
    const merits = load("merits_by_category", {});

    DATA.badges.forEach(b => {
      const valør = (merits[b.id]?.valør) || "Ingen";
      const div = document.createElement("div");
      div.className = "badge-item";
      div.innerHTML = `
        <img src="bilder/merker/${b.id}.PNG" alt="${b.name}">
        <span>${b.name}</span>
        <small>${valør}</small>`;
      div.onclick = () => openBadgeModal(b.id);
      container.appendChild(div);
    });
  }

  function renderPeople() {
    const container = document.getElementById("peopleGrid");
    if (!container) return;
    container.innerHTML = "";
    const collected = load("people_collected", []);
    const ids = new Set(collected.map(p => p.id));

    DATA.people.filter(p => ids.has(p.id)).forEach(p => {
      const img = document.createElement("img");
      img.src = `bilder/kort/people/${p.id}.PNG`;
      img.alt = p.name;
      img.className = "person-avatar";
      img.onclick = () => openPersonModal(p.id);
      container.appendChild(img);
    });
  }

  function renderPlaces() {
    const container = document.getElementById("placesGrid");
    if (!container) return;
    container.innerHTML = "";
    const visited = load("visited_places", []);
    const ids = new Set(visited.map(p => p.id));

    DATA.places.filter(pl => ids.has(pl.id)).forEach(pl => {
      const div = document.createElement("div");
      div.className = "place-thumb";
      div.innerHTML = `
        <img src="bilder/kort/places/${pl.image || pl.id}.PNG" alt="${pl.name}">
        <span>${pl.name}</span>`;
      div.onclick = () => openPlaceModal(pl.id);
      container.appendChild(div);
    });
  }

  function renderTimeline() {
    const container = document.getElementById("timelineList");
    if (!container) return;
    container.innerHTML = "";
    const visited = load("visited_places", []);
    const collected = load("people_collected", []);

    const allItems = [
      ...DATA.places.filter(p => visited.some(v => v.id === p.id)),
      ...DATA.people.filter(p => collected.some(c => c.id === p.id))
    ].sort((a, b) => (a.year || 0) - (b.year || 0));

    allItems.forEach(item => {
      const div = document.createElement("div");
      div.className = "timeline-item";
      div.innerHTML = `
        <strong>${item.year || "–"}</strong> ${item.name}
        <img src="bilder/kort/${DATA.people.find(p => p.id === item.id) ? "people" : "places"}/${item.id}.PNG"
             alt="${item.name}" class="timeline-thumb">`;
      div.onclick = () => {
        if (DATA.people.find(p => p.id === item.id)) openPersonModal(item.id);
        else openPlaceModal(item.id);
      };
      container.appendChild(div);
    });
  }

  // ----------------------------------------------------------
  // 3) MODALER
  // ----------------------------------------------------------
  function openBadgeModal(categoryId) {
    const modal = document.getElementById("badgeModal");
    if (!modal) return;
    const title = document.getElementById("badgeModalTitle");
    const content = document.getElementById("badgeModalContent");
    const progress = load("quiz_progress", {});
    const badgeData = DATA.badges.find(b => b.id === categoryId);

    title.textContent = `Merke: ${badgeData?.name || categoryId}`;
    content.innerHTML = "";

    const list = document.createElement("ul");
    Object.values(progress).forEach(q => {
      if (q.categoryId === categoryId) {
        const li = document.createElement("li");
        li.textContent = `${q.placeId || "Sted"} – ${q.points} poeng`;
        list.appendChild(li);
      }
    });
    content.appendChild(list);
    modal.setAttribute("aria-hidden", "false");
  }

  function openPersonModal(id) {
    const p = DATA.people.find(x => x.id === id);
    if (!p) return;
    const modal = document.getElementById("personModal");
    document.getElementById("personModalName").textContent = p.name;
    document.getElementById("personModalContent").innerHTML = `
      <p>${p.desc || ""}</p>
      <img src="bilder/kort/people/${p.id}.PNG" alt="${p.name}" class="person-card">`;
    modal.setAttribute("aria-hidden", "false");
  }

  function openPlaceModal(id) {
    const pl = DATA.places.find(p => p.id === id);
    if (!pl) return;
    const modal = document.getElementById("placeModal");
    document.getElementById("placeModalName").textContent = pl.name;
    document.getElementById("placeModalContent").innerHTML = `
      <p>${pl.desc || ""}</p>
      <img src="bilder/kort/places/${pl.image || pl.id}.PNG" alt="${pl.name}" class="place-card">
      <p><small>År: ${pl.year || "–"}</small></p>`;
    modal.setAttribute("aria-hidden", "false");
  }

  // ----------------------------------------------------------
  // 4) KNAPPER OG NULLSTILL
  // ----------------------------------------------------------
  function setupButtons() {
    const exp = document.getElementById("exportProfileBtn");
    const rst = document.getElementById("resetProfileBtn");
    if (exp) exp.onclick = exportProfile;
    if (rst) rst.onclick = resetProfileData;
  }

  function exportProfile() {
    html2canvas(document.getElementById("profileMain")).then(canvas => {
      const link = document.createElement("a");
      link.download = "HistoryGo_Profil.png";
      link.href = canvas.toDataURL();
      link.click();
    });
  }

  function resetProfileData() {
    if (confirm("Vil du slette all progresjon?")) {
      localStorage.clear();
      renderAll();
    }
  }

  // ----------------------------------------------------------
  // 5) MODAL-KONTROLL
  // ----------------------------------------------------------
  function setupModalClose() {
    document.querySelectorAll(".close-modal").forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.close;
        document.getElementById(id).setAttribute("aria-hidden", "true");
      };
    });
  }

  // ----------------------------------------------------------
  // 6) LIVE-OPPDATERING
  // ----------------------------------------------------------
  function setupLiveUpdates() {
    window.addEventListener("storage", (e) => {
      if (["visited_places", "people_collected", "merits_by_category", "quiz_progress"].includes(e.key)) {
        renderAll();
      }
    });
    window.addEventListener("updateProfile", renderAll);
  }

  const load = (k, f) => JSON.parse(localStorage.getItem(k) || JSON.stringify(f));

  // ----------------------------------------------------------
  // EKSPORT
  // ----------------------------------------------------------
  return {
    initProfilePage,
    openBadgeModal,
    openPersonModal,
    openPlaceModal,
    refreshProfile: renderAll
  };
})();
