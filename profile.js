// ============================================================
// === HISTORY GO – PROFILE.JS (v2.6, live oppdatering) =======
// ============================================================
//
// Nytt i denne versjonen:
//  ✅ Automatisk oppdatering når localStorage endres (merker, steder, personer, quizer)
//  ✅ Registrerer eventlistener for "storage" og "updateProfile" (intern refresh)
//  ✅ Rask synkronisering mellom kart/app og profilsiden
//
// ============================================================

window.addEventListener("DOMContentLoaded", () => {
  Profile.initProfilePage();
});

const Profile = (() => {

  let DATA = { places: [], people: [], badges: [] };

  // ----------------------------------------------------------
  // 1) INITIERING
  // ----------------------------------------------------------
  async function initProfilePage() {
    await loadAllData();
    renderAll();
    setupButtons();
    setupModalClose();
    setupLiveUpdates();
  }

  // ----------------------------------------------------------
  // 2) LASTING AV DATA
  // ----------------------------------------------------------
  async function loadAllData() {
    try {
      const [places, people, badges] = await Promise.all([
        fetch("data/places.json").then(r => r.json()),
        fetch("data/people.json").then(r => r.json()),
        fetch("data/badges.json").then(r => r.json())
      ]);
      DATA = { places, people, badges };
    } catch (err) {
      console.error("Kunne ikke laste data:", err);
    }
  }

  // ----------------------------------------------------------
  // 3) RENDER-PAKKER
  // ----------------------------------------------------------
  function renderAll() {
    renderProfileCard();
    renderMerits();
    renderPeople();
    renderPlaces();
    renderTimeline();
  }

  function renderProfileCard() {
    const name = localStorage.getItem("user_name") || "Ukjent bruker";
    const color = localStorage.getItem("user_color") || "#FFD600";
    const merits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");
    const visited = JSON.parse(localStorage.getItem("visited_places") || "[]");
    const people = JSON.parse(localStorage.getItem("people_collected") || "[]");

    document.getElementById("profileName").textContent = name;
    document.getElementById("profileAvatar").style.background = color;
    document.getElementById("placesCount").textContent = visited.length;
    document.getElementById("peopleCount").textContent = people.length;
    document.getElementById("badgesCount").textContent = Object.keys(merits).length;

    const totalPoints = Object.values(merits).reduce((a, b) => a + (b.points || 0), 0);
    const level = Math.floor(totalPoints / 50) + 1;
    document.getElementById("profileLevel").textContent = `Historiker · nivå ${level}`;
  }

  function renderMerits() {
    const container = document.getElementById("badgesGrid");
    container.innerHTML = "";
    const merits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");

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
    container.innerHTML = "";
    const collected = JSON.parse(localStorage.getItem("people_collected") || "[]");
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
    container.innerHTML = "";
    const visited = JSON.parse(localStorage.getItem("visited_places") || "[]");
    const ids = new Set(visited.map(p => p.id));

    DATA.places.filter(pl => ids.has(pl.id)).forEach(pl => {
      const div = document.createElement("div");
      div.className = "place-thumb";
      div.innerHTML = `
        <img src="bilder/kort/people/${pl.image || pl.id}.PNG" alt="${pl.name}">
        <span>${pl.name}</span>`;
      div.onclick = () => openPlaceModal(pl.id);
      container.appendChild(div);
    });
  }

  function renderTimeline() {
    const container = document.getElementById("timelineList");
    container.innerHTML = "";
    const visited = JSON.parse(localStorage.getItem("visited_places") || "[]");
    const collected = JSON.parse(localStorage.getItem("people_collected") || "[]");

    const allItems = [
      ...DATA.places.filter(p => visited.some(v => v.id === p.id)),
      ...DATA.people.filter(p => collected.some(c => c.id === p.id))
    ].sort((a, b) => (a.year || 0) - (b.year || 0));

    allItems.forEach(item => {
      const div = document.createElement("div");
      div.className = "timeline-item";
      div.innerHTML = `
        <strong>${item.year || "–"}</strong> ${item.name}
        <img src="bilder/kort/people/${item.id}.PNG" alt="${item.name}" class="timeline-thumb">`;
      div.onclick = () => {
        if (DATA.people.find(p => p.id === item.id)) openPersonModal(item.id);
        else openPlaceModal(item.id);
      };
      container.appendChild(div);
    });
  }

  // ----------------------------------------------------------
  // 4) MODALER
  // ----------------------------------------------------------
  function openBadgeModal(categoryId) {
    const modal = document.getElementById("badgeModal");
    const title = document.getElementById("badgeModalTitle");
    const content = document.getElementById("badgeModalContent");
    const progress = JSON.parse(localStorage.getItem("quiz_progress") || "{}");
    const badgeData = DATA.badges.find(b => b.id === categoryId);

    title.textContent = `Merke: ${badgeData?.name || categoryId}`;
    content.innerHTML = "";

    const list = document.createElement("ul");
    Object.values(progress).forEach(q => {
      if (q.categoryId === categoryId) {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${q.placeName}</strong><br>Spørsmål: ${q.question}<br>Ditt svar: ${q.answer}`;
        list.appendChild(li);
      }
    });
    content.appendChild(list);
    modal.setAttribute("aria-hidden", "false");
  }

  function openPersonModal(personId) {
    const modal = document.getElementById("personModal");
    const nameEl = document.getElementById("personModalName");
    const content = document.getElementById("personModalContent");
    const p = DATA.people.find(x => x.id === personId);
    if (!p) return;
    nameEl.textContent = p.name;
    content.innerHTML = `
      <p>${p.desc || ""}</p>
      <img src="bilder/kort/people/${p.id}.PNG" alt="${p.name}" class="person-card">
      <p><em>Kilde: Wikipedia / Google</em></p>`;
    modal.setAttribute("aria-hidden", "false");
  }

  function openPlaceModal(placeId) {
    const modal = document.getElementById("placeModal");
    const title = document.getElementById("placeModalName");
    const content = document.getElementById("placeModalContent");
    const pl = DATA.places.find(p => p.id === placeId);
    if (!pl) return;
    title.textContent = pl.name;
    content.innerHTML = `
      <p>${pl.desc || ""}</p>
      <img src="bilder/kort/people/${pl.image || pl.id}.PNG" alt="${pl.name}" class="place-card">
      <p><small>År: ${pl.year || "–"}</small></p>`;
    modal.setAttribute("aria-hidden", "false");
  }

  // ----------------------------------------------------------
  // 5) EKSPORT & NULLSTILL
  // ----------------------------------------------------------
  function setupButtons() {
    document.getElementById("exportProfileBtn").onclick = exportProfile;
    document.getElementById("resetProfileBtn").onclick = resetProfileData;
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
  // 6) MODAL-KONTROLL
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
  // 7) LIVE OPPDATERING (NYTT)
  // ----------------------------------------------------------
  function setupLiveUpdates() {
    // a) Oppdater profil hvis noe endres i localStorage fra annet vindu
    window.addEventListener("storage", (e) => {
      if (e.key && [
        "visited_places",
        "people_collected",
        "merits_by_category",
        "quiz_progress"
      ].includes(e.key)) {
        renderAll();
      }
    });

    // b) Oppdater internt (når app.js eller quiz.js sender custom event)
    window.addEventListener("updateProfile", () => {
      renderAll();
    });
  }

  // Ekstern funksjon som app/quiz kan kalle direkte
  function refreshProfile() {
    renderAll();
  }

  // ----------------------------------------------------------
  // Eksporter offentlig API
  // ----------------------------------------------------------
  return {
    initProfilePage,
    openBadgeModal,
    openPersonModal,
    openPlaceModal,
    refreshProfile
  };
})();
