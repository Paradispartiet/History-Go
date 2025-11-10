// ============================================================
// === HISTORY GO – PROFILE.JS (v2.4, struktur og kobling) ===
// ============================================================
//
// Håndterer profilsiden:
//  - Profilkort (navn, farge, nivå, statistikk)
//  - Merker (trykkbare, med modal for quiz-oversikt)
//  - Personer (samlede ansikter, wiki-info og kort)
//  - Steder (besøkte steder, stedskort)
//  - Tidslinje (alle kort sortert etter year)
//  - Eksport og nullstilling
//
// ============================================================

window.addEventListener("DOMContentLoaded", () => {
  Profile.initProfilePage();
});

// Global profilmodul
const Profile = (() => {

  // -----------------------------------------
  // 1) INITIERING
  // -----------------------------------------
  function initProfilePage() {
    renderProfileCard();
    renderMerits();
    renderPeople();
    renderPlaces();
    renderTimeline();
    setupButtons();
    setupModalClose();
  }

  // -----------------------------------------
  // 2) PROFILKORT
  // -----------------------------------------
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

    // Beregn nivå (enkelt placeholder)
    const totalPoints = Object.values(merits).reduce((a, b) => a + b.points, 0);
    const level = Math.floor(totalPoints / 50) + 1;
    document.getElementById("profileLevel").textContent = `Historiker · nivå ${level}`;
  }

  // -----------------------------------------
  // 3) MERKER (BADGES)
  // -----------------------------------------
  function renderMerits() {
    const container = document.getElementById("badgesGrid");
    container.innerHTML = "";
    const merits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");

    Object.entries(merits).forEach(([cat, data]) => {
      const div = document.createElement("div");
      div.className = "badge-item";
      div.innerHTML = `
        <img src="bilder/merker/${cat}.PNG" alt="${cat}">
        <span>${data.valør || "Bronse"}</span>`;
      div.onclick = () => openBadgeModal(cat);
      container.appendChild(div);
    });
  }

  function openBadgeModal(categoryId) {
    const modal = document.getElementById("badgeModal");
    const title = document.getElementById("badgeModalTitle");
    const content = document.getElementById("badgeModalContent");
    const progress = JSON.parse(localStorage.getItem("quiz_progress") || "{}");

    title.textContent = `Merke: ${categoryId}`;
    content.innerHTML = "";

    // List ut quizzer tatt i denne kategorien
    const list = document.createElement("ul");
    for (const [quizId, data] of Object.entries(progress)) {
      if (data.category === categoryId) {
        const li = document.createElement("li");
        li.textContent = `${data.question} – ditt svar: ${data.answer}`;
        list.appendChild(li);
      }
    }
    content.appendChild(list);
    modal.setAttribute("aria-hidden", "false");
  }

  // -----------------------------------------
  // 4) PERSONER
  // -----------------------------------------
  function renderPeople() {
    const container = document.getElementById("peopleGrid");
    container.innerHTML = "";
    const people = JSON.parse(localStorage.getItem("people_collected") || "[]");

    people.forEach(p => {
      const img = document.createElement("img");
      img.src = `bilder/kort/people/${p.id}.PNG`;
      img.alt = p.name;
      img.className = "person-avatar";
      img.onclick = () => openPersonModal(p.id);
      container.appendChild(img);
    });
  }

  function openPersonModal(personId) {
    const modal = document.getElementById("personModal");
    const nameEl = document.getElementById("personModalName");
    const content = document.getElementById("personModalContent");

    const peopleData = JSON.parse(localStorage.getItem("people_collected") || "[]");
    const person = peopleData.find(p => p.id === personId);
    if (!person) return;

    nameEl.textContent = person.name;
    content.innerHTML = `
      <p>${person.desc || ""}</p>
      <img src="bilder/kort/people/${person.id}.PNG" alt="${person.name}" class="person-card">
      <p><em>Kilde: Wikipedia / Google</em></p>`;
    modal.setAttribute("aria-hidden", "false");
  }

  // -----------------------------------------
  // 5) STEDER
  // -----------------------------------------
  function renderPlaces() {
    const container = document.getElementById("placesGrid");
    container.innerHTML = "";
    const visited = JSON.parse(localStorage.getItem("visited_places") || "[]");

    visited.forEach(pl => {
      const div = document.createElement("div");
      div.className = "place-thumb";
      div.innerHTML = `
        <img src="bilder/kort/people/${pl.image || 'placeholder'}.PNG" alt="${pl.name}">
        <span>${pl.name}</span>`;
      div.onclick = () => openPlaceModal(pl.id);
      container.appendChild(div);
    });
  }

  function openPlaceModal(placeId) {
    const modal = document.getElementById("placeModal");
    const title = document.getElementById("placeModalName");
    const content = document.getElementById("placeModalContent");

    const visited = JSON.parse(localStorage.getItem("visited_places") || "[]");
    const place = visited.find(p => p.id === placeId);
    if (!place) return;

    title.textContent = place.name;
    content.innerHTML = `
      <p>${place.desc || ""}</p>
      <img src="bilder/kort/people/${place.image || 'placeholder'}.PNG" alt="${place.name}" class="place-card">
      <p><small>År: ${place.year || "–"}</small></p>`;
    modal.setAttribute("aria-hidden", "false");
  }

  // -----------------------------------------
  // 6) TIDSLINJE
  // -----------------------------------------
  function renderTimeline() {
    const container = document.getElementById("timelineList");
    container.innerHTML = "";
    const places = JSON.parse(localStorage.getItem("visited_places") || "[]");
    const people = JSON.parse(localStorage.getItem("people_collected") || "[]");

    const allItems = [...places, ...people].sort((a, b) => (a.year || 0) - (b.year || 0));

    allItems.forEach(item => {
      const row = document.createElement("div");
      row.className = "timeline-item";
      row.innerHTML = `
        <strong>${item.year || "–"}</strong> ${item.name}
        <img src="bilder/kort/people/${item.id}.PNG" alt="${item.name}" class="timeline-thumb">`;
      row.onclick = () => {
        if (item.placeId) openPersonModal(item.id);
        else openPlaceModal(item.id);
      };
      container.appendChild(row);
    });
  }

  // -----------------------------------------
  // 7) EKSPORT & NULLSTILL
  // -----------------------------------------
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
      location.reload();
    }
  }

  // -----------------------------------------
  // 8) MODAL-KONTROLL
  // -----------------------------------------
  function setupModalClose() {
    document.querySelectorAll(".close-modal").forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.close;
        document.getElementById(id).setAttribute("aria-hidden", "true");
      };
    });
  }

  // -----------------------------------------
  // EKSPORTER FUNKSJONER (hvis nødvendig)
  // -----------------------------------------
  return {
    initProfilePage,
    renderProfileCard,
    renderMerits,
    renderPeople,
    renderPlaces,
    renderTimeline,
    openBadgeModal,
    openPersonModal,
    openPlaceModal,
    exportProfile,
    resetProfileData
  };
})();
