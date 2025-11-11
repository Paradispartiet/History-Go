// ============================================================
// === HISTORY GO – PROFILE.JS (v3.5, popup + bakgrunnskart) ==
// ============================================================
//
//  • Leser data fra HG.data (core.js)
//  • Viser profil, merker, personer, steder og tidslinje
//  • Klikk åpner popup (modal) med detaljer og bilde
//  • Kart bakgrunn viser besøkte steder og personer
//  • Live-oppdateres ved updateProfile-event
// ============================================================

window.addEventListener("DOMContentLoaded", () => {
  const waitForData = setInterval(() => {
    if (window.HG?.data?.places?.length) {
      clearInterval(waitForData);
      Profile.initProfilePage();
    }
  }, 150);
});

const Profile = (() => {
  let DATA = { places: [], people: [], badges: [] };
  let map = null;

  // ----------------------------------------------------------
  // 1) INITIERING
  // ----------------------------------------------------------
  async function initProfilePage() {
    DATA = HG?.data || DATA;
    initMap();
    renderAll();
    setupButtons();
    setupModalClose();
    setupLiveUpdates();
    console.log("👤 Profilside (v3.5) initialisert");
  }

  // ----------------------------------------------------------
  // 2) KART
  // ----------------------------------------------------------
  function initMap() {
    map = L.map("map", { zoomControl: false }).setView([59.9139, 10.7522], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap"
    }).addTo(map);
    updateMapMarkers();
  }

  function updateMapMarkers() {
    if (!map) return;
    const visited = load("visited_places", []);
    const people = load("people_collected", []);
    map.eachLayer(l => {
      if (l instanceof L.CircleMarker || l instanceof L.Marker) map.removeLayer(l);
    });

    // Steder (gule sirkler)
    visited.forEach(p => {
      if (p.lat && p.lon) {
        const marker = L.circleMarker([p.lat, p.lon], {
          radius: 7,
          color: "#FFD600",
          fillColor: "#FFD600",
          fillOpacity: 0.9
        }).bindPopup(`<strong>${p.name}</strong><br>${p.desc || ""}`);
        marker.addTo(map);
      }
    });

    // Personer (runde bilder)
    people.forEach(per => {
      const pl = visited.find(v => v.id === per.placeId);
      if (pl?.lat && pl?.lon) {
        const icon = L.divIcon({
          className: "person-marker",
          html: `<div style="width:28px;height:28px;border-radius:50%;
            background:url('bilder/kort/people/${per.id}.PNG') center/cover no-repeat;
            border:2px solid #fff;box-shadow:0 0 4px #000;"></div>`,
          iconSize: [28,28]
        });
        L.marker([pl.lat, pl.lon], { icon })
          .bindPopup(`<strong>${per.name}</strong><br>${pl.name}`)
          .addTo(map);
      }
    });
  }

  // ----------------------------------------------------------
  // 3) RENDERING
  // ----------------------------------------------------------
  function renderAll() {
    renderProfileCard();
    renderMerits();
    renderPeople();
    renderPlaces();
    renderTimeline();
    updateMapMarkers();
  }

  function renderProfileCard() {
    const name = localStorage.getItem("user_name") || "Ukjent bruker";
    const color = localStorage.getItem("user_color") || "#FFD600";
    const merits = load("merits_by_category", {});
    const visited = load("visited_places", []);
    const people = load("people_collected", []);

    setText("profileName", name);
    setStyle("profileAvatar", "background", color);
    setText("placesCount", visited.length);
    setText("peopleCount", people.length);
    setText("badgesCount", Object.keys(merits).length);

    const totalPoints = Object.values(merits).reduce((a, b) => a + (b.points || 0), 0);
    const level = Math.floor(totalPoints / 50) + 1;
    setText("profileLevel", `Historiker · nivå ${level}`);
  }

  function renderMerits() {
    const container = byId("badgesGrid");
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
    const container = byId("peopleGrid");
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
    const container = byId("placesGrid");
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
    const container = byId("timelineList");
    if (!container) return;
    container.innerHTML = "";
    const visited = load("visited_places", []);
    const collected = load("people_collected", []);

    const allItems = [
      ...DATA.places.filter(p => visited.some(v => v.id === p.id)),
      ...DATA.people.filter(p => collected.some(c => c.id === p.id))
    ].sort((a, b) => (a.year || 0) - (b.year || 0));

    allItems.forEach(item => {
      const isPerson = !!DATA.people.find(p => p.id === item.id);
      const div = document.createElement("div");
      div.className = "timeline-item";
      div.innerHTML = `
        <strong>${item.year || "–"}</strong> ${item.name}
        <img src="bilder/kort/${isPerson ? "people" : "places"}/${item.id}.PNG"
             alt="${item.name}" class="timeline-thumb">`;
      div.onclick = () => {
        if (isPerson) openPersonModal(item.id);
        else openPlaceModal(item.id);
      };
      container.appendChild(div);
    });
  }

  // ----------------------------------------------------------
  // 4) MODALER
  // ----------------------------------------------------------
  function openBadgeModal(categoryId) {
    const modal = byId("badgeModal");
    const title = byId("badgeModalTitle");
    const content = byId("badgeModalContent");
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
    const modal = byId("personModal");
    byId("personModalName").textContent = p.name;
    byId("personModalContent").innerHTML = `
      <p>${p.desc || ""}</p>
      <img src="bilder/kort/people/${p.id}.PNG" alt="${p.name}">
      <p><small>År: ${p.year || "–"}</small></p>`;
    modal.setAttribute("aria-hidden", "false");
  }

  function openPlaceModal(id) {
    const pl = DATA.places.find(p => p.id === id);
    if (!pl) return;
    const modal = byId("placeModal");
    byId("placeModalName").textContent = pl.name;
    byId("placeModalContent").innerHTML = `
      <p>${pl.desc || ""}</p>
      <img src="bilder/kort/places/${pl.image || pl.id}.PNG" alt="${pl.name}">
      <p><small>År: ${pl.year || "–"}</small></p>`;
    modal.setAttribute("aria-hidden", "false");
  }

  function setupModalClose() {
    document.querySelectorAll(".close-modal").forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.close;
        const m = byId(id);
        if (m) m.setAttribute("aria-hidden", "true");
      };
    });
  }

  // ----------------------------------------------------------
  // 5) KNAPPER OG NULLSTILL
  // ----------------------------------------------------------
  function setupButtons() {
    const exp = byId("exportProfileBtn");
    const rst = byId("resetProfileBtn");
    if (exp) exp.onclick = exportProfile;
    if (rst) rst.onclick = resetProfileData;
  }

  function exportProfile() {
    html2canvas(byId("profileMain")).then(canvas => {
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
      updateMapMarkers();
    }
  }

  // ----------------------------------------------------------
  // 6) LIVE-OPPDATERING
  // ----------------------------------------------------------
  function setupLiveUpdates() {
    window.addEventListener("storage", e => {
      if (["visited_places", "people_collected", "merits_by_category", "quiz_progress"].includes(e.key)) {
        renderAll();
      }
    });
    window.addEventListener("updateProfile", renderAll);
  }

  // ----------------------------------------------------------
  // 7) HJELPERE
  // ----------------------------------------------------------
  const load = (k, f) => JSON.parse(localStorage.getItem(k) || JSON.stringify(f));
  const byId = (id) => document.getElementById(id);
  const setText = (id, text) => { const el = byId(id); if (el) el.textContent = text; };
  const setStyle = (id, prop, val) => { const el = byId(id); if (el) el.style[prop] = val; };

  // ----------------------------------------------------------
  // EKSPORT
  // ----------------------------------------------------------
  return {
    initProfilePage,
    openBadgeModal,
    openPersonModal,
    openPlaceModal
  };
})();
