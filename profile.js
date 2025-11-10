// ============================================================
// === HISTORY GO – PROFILE.JS (v29, stabil + trygg fallback) ==
// ============================================================
//
// Bygger på v28, men legger til robust datalasting og trygg init.
//
// ✅ Venter på globale PLACES/PEOPLE/BADGES fra app.js
// ✅ Laster selv manglende data uten duplisering
// ✅ Viser bokser, merker, personer og tidslinje korrekt
// ✅ Full sanntidssynk via storage-event
// ============================================================


// -----------------------------------------------------------
// SIKRER AT PROFIL HAR DATA FRA app.js ELLER LASTER SELV
// -----------------------------------------------------------
async function ensureProfileData() {
  const needPlaces = !window.PLACES || !Array.isArray(window.PLACES) || !window.PLACES.length;
  const needPeople = !window.PEOPLE || !Array.isArray(window.PEOPLE) || !window.PEOPLE.length;
  const needBadges = !window.BADGES || !Array.isArray(window.BADGES) || !window.BADGES.length;

  if (needPlaces || needPeople || needBadges) {
    console.log("📦 Laster manglende data for profil...");
    const [places, people, badges] = await Promise.all([
      needPlaces ? fetch("places.json").then(r => r.json()) : window.PLACES,
      needPeople ? fetch("people.json").then(r => r.json()) : window.PEOPLE,
      needBadges ? fetch("badges.json").then(r => r.json()) : window.BADGES
    ]);
    window.PLACES = places;
    window.PEOPLE = people;
    window.BADGES = badges;
  }
}


// --------------------------------------
// HOVEDRENDERING
// --------------------------------------
function renderProfileCard() {
  const name = localStorage.getItem("user_name") || "Utforsker #182";
  const visited = JSON.parse(localStorage.getItem("visited_places") || "{}");
  const people = JSON.parse(localStorage.getItem("people_collected") || "{}");
  const merits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");

  const visitedCount = Object.keys(visited).length;
  const peopleCount = Object.keys(people).length;
  const favEntry = Object.entries(merits).sort((a,b)=> (b[1].points||0)-(a[1].points||0))[0];
  const favCat = favEntry ? favEntry[0] : "Ingen ennå";

  document.getElementById("profileName").textContent = name;
  document.getElementById("statPlaces").textContent = `${visitedCount} steder`;
  document.getElementById("statPeople").textContent = `${peopleCount} personer`;
  document.getElementById("statCategory").textContent = `Favoritt: ${favCat}`;
}


// --------------------------------------
// VIS BESØKTE STEDER SOM BOKSER
// --------------------------------------
function renderCollection() {
  const grid = document.getElementById("collectionGrid");
  if (!grid || !window.PLACES) return;

  const visited = JSON.parse(localStorage.getItem("visited_places") || "{}");
  const items = window.PLACES.filter(p => visited[p.id]);

  if (!items.length) {
    grid.innerHTML = `<div class="muted">Ingen steder besøkt ennå.</div>`;
    return;
  }

  grid.innerHTML = items.map(p => `
    <div class="visited-place" data-place="${p.id}">
      <img src="${p.image || `bilder/kort/places/${p.id}.PNG`}" alt="${p.name}" class="visited-thumb">
      <div class="visited-label">${p.name}</div>
    </div>`).join("");

  grid.querySelectorAll(".visited-place").forEach(el => {
    el.addEventListener("click", () => {
      const place = window.PLACES.find(x => x.id === el.dataset.place);
      if (place) showPlaceOverlay?.(place);
    });
  });
}


// --------------------------------------
// VIS PERSONER SOM ER SAMLET
// --------------------------------------
function renderGallery() {
  const gallery = document.getElementById("gallery");
  if (!gallery || !window.PEOPLE) return;

  const collected = JSON.parse(localStorage.getItem("people_collected") || "{}");
  const got = window.PEOPLE.filter(p => collected[p.id]);

  if (!got.length) {
    gallery.innerHTML = `<div class="muted">Samle personer ved å møte dem og klare quizen.</div>`;
    return;
  }

  gallery.innerHTML = got.map(p => `
    <div class="person-card" data-person="${p.id}" title="${p.name}">
      <img src="bilder/people/${p.id}_face.PNG" alt="${p.name}" class="person-face-thumb">
      <div class="person-label">${p.name}</div>
    </div>`).join("");

  gallery.querySelectorAll(".person-card").forEach(card => {
    card.addEventListener("click", () => {
      const person = window.PEOPLE.find(p => p.id === card.dataset.person);
      if (person) showPersonInfoModal(person);
    });
  });
}


// --------------------------------------
// MERKER (nivå og poeng)
// --------------------------------------
function renderMerits() {
  const container = document.getElementById("merits");
  if (!container || !window.BADGES) return;

  const localMerits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");
  const cats = Object.keys(localMerits).length
    ? Object.keys(localMerits)
    : window.BADGES.map(b => b.name);

  const medalByIndex = i => (i<=0?"🥉":i===1?"🥈":i===2?"🥇":"🏆");

  container.innerHTML = cats.map(cat => {
    const merit = localMerits[cat] || { level: "Nybegynner" };
    const badge = window.BADGES.find(b =>
      cat.toLowerCase().includes(b.id) || b.name.toLowerCase().includes(cat.toLowerCase())
    );
    if (!badge) return "";
    const tierIndex = badge.tiers.findIndex(t => t.label === merit.level);
    const medal = medalByIndex(tierIndex);
    return `
      <div class="badge-mini" data-badge="${badge.id}">
        <div class="badge-wrapper">
          <img src="${badge.image}" alt="${badge.name}" class="badge-mini-icon">
          <span class="badge-medal">${medal}</span>
        </div>
      </div>`;
  }).join("");
}


// --------------------------------------
// TIDSLINJE (steder + personer)
// --------------------------------------
function renderTimelineProfile() {
  const body = document.getElementById("timelineBody");
  const bar = document.getElementById("timelineProgressBar");
  const txt = document.getElementById("timelineProgressText");
  if (!body || !window.PLACES || !window.PEOPLE) return;

  const visited = JSON.parse(localStorage.getItem("visited_places") || "{}");
  const people = JSON.parse(localStorage.getItem("people_collected") || "{}");

  const collectedPlaces = window.PLACES.filter(p => visited[p.id]).map(p => ({...p,type:"place",year:p.year||0}));
  const collectedPeople = window.PEOPLE.filter(p => people[p.id]).map(p => ({...p,type:"person",year:p.year||0}));

  const combined = [...collectedPlaces, ...collectedPeople].sort((a,b)=>{
    if((a.year||0)===(b.year||0)) return a.name.localeCompare(b.name);
    return (a.year||0)-(b.year||0);
  });

  const total = window.PLACES.length + window.PEOPLE.length;
  const count = combined.length;

  if (bar) bar.style.width = `${total?(count/total)*100:0}%`;
  if (txt) txt.textContent = `Du har samlet ${count} av ${total} historiekort`;

  if (!combined.length) {
    body.innerHTML = `<div class="muted">Du har ingen historiekort ennå.</div>`;
    return;
  }

  body.innerHTML = combined.map(item=>`
    <div class="timeline-card" data-type="${item.type}" data-id="${item.id}">
      <img src="${item.type==='person'
        ? `bilder/kort/people/${item.id}.PNG`
        : `bilder/kort/places/${item.id}.PNG`}" alt="${item.name}">
      <div class="timeline-name">${item.name}</div>
      <div class="timeline-year">${item.year||'–'}</div>
    </div>`).join("");

  body.querySelectorAll(".timeline-card").forEach(c=>{
    c.addEventListener("click",()=>{
      const id=c.dataset.id, type=c.dataset.type;
      if(type==="person"){
        const person=window.PEOPLE.find(p=>p.id===id);
        if(person) showPersonInfoModal(person);
      }else{
        const place=window.PLACES.find(p=>p.id===id);
        if(place) showPlaceOverlay?.(place);
      }
    });
  });
}


// --------------------------------------
// WIKI-POPUP FOR PERSONER
// --------------------------------------
async function showPersonInfoModal(person){
  try{
    const wikiUrl=`https://no.wikipedia.org/w/api.php?action=query&origin=*&format=json&prop=extracts&exintro=true&titles=${encodeURIComponent(person.name)}`;
    const res=await fetch(wikiUrl);
    const data=await res.json();
    const page=Object.values(data.query.pages)[0];
    const extract=page?.extract||"Ingen informasjon funnet.";

    const face=`bilder/people/${person.id}_face.PNG`;
    const card=`bilder/kort/people/${person.id}.PNG`;

    const modal=document.createElement("div");
    modal.className="person-info-modal";
    modal.innerHTML=`
      <div class="person-info-body">
        <button class="close-btn">✕</button>
        <div class="person-header">
          <img src="${face}" alt="${person.name}" class="person-face">
          <div><h2>${person.name}</h2>${person.year?`<p class="muted">${person.year}</p>`:""}</div>
        </div>
        <div class="person-info-text">${extract}</div>
        <div class="person-card-mini">
          <img src="${card}" class="mini-card" alt="Kort">
          <p class="muted">Trykk for å åpne History Go-kortet</p>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector(".close-btn").onclick=()=>modal.remove();
    modal.addEventListener("click",e=>{if(e.target===modal)modal.remove();});
    modal.querySelector(".mini-card").onclick=()=>openPlaceCardByPerson?.(person);
  }catch(e){
    console.warn("Wiki-feil:",e);
    showToast?.("Kunne ikke hente info 📚");
  }
}


// --------------------------------------
// INIT OG OPPDATERING
// --------------------------------------
async function initProfile(){
  await ensureProfileData(); // ✅ viktig: vent på data
  renderProfileCard();
  renderMerits();
  renderCollection();
  renderGallery();
  renderTimelineProfile();
  console.log("✅ Profil lastet med alle data.");
}

document.addEventListener("DOMContentLoaded",initProfile);


// --------------------------------------
// SANNTIDSOPPDATERING (storage-event)
// --------------------------------------
window.addEventListener("storage",event=>{
  const keys=["visited_places","people_collected","merits_by_category","quiz_refresh"];
  if(!keys.includes(event.key)) return;
  console.log("🔄 Oppdaterer profil etter endring:",event.key);
  try{initProfile();}catch(e){console.warn("⚠️ Oppdateringsfeil:",e);}
});


// --------------------------------------
// DEL PROFIL SOM BILDE
// --------------------------------------
document.addEventListener("DOMContentLoaded",()=>{
  const btn=document.getElementById("shareProfileBtn");
  if(btn && window.html2canvas){
    btn.addEventListener("click",()=>{
      const node=document.getElementById("profileCard");
      if(!node) return;
      html2canvas(node).then(canvas=>{
        const link=document.createElement("a");
        link.download="min_profil.png";
        link.href=canvas.toDataURL("image/png");
        link.click();
        showToast?.("Profil lagret som bilde 📸");
      });
    });
  }
});

// ============================================================
// === KLIKK PÅ MERKER (åpne quiz-boks) + visuell effekt ======
// ============================================================
document.addEventListener("click", e => {
  const badge = e.target.closest(".badge-mini");
  if (!badge) return;
  const catId = badge.dataset.badge;
  if (!catId) return;

  // 🔹 Åpner boksen via showBadgeModal fra app.js
  if (typeof showBadgeModal === "function") {
    showBadgeModal(catId);

    // ✨ Legg til fade-inn bakgrunn for modalen
    const modal = document.getElementById("badgeModal");
    if (modal) {
      modal.style.background = "rgba(0,0,0,0.65)";
      modal.style.backdropFilter = "blur(2px)";
      modal.style.display = "flex";
      modal.classList.add("fadeInBadge");
    }
  }
});

// --- Enkel fade-inn-animasjon for merkemodalen ---
const style = document.createElement("style");
style.textContent = `
#badgeModal {
  opacity: 0;
  transition: opacity .35s ease;
}
#badgeModal.fadeInBadge {
  opacity: 1;
}
`;
document.head.appendChild(style);
