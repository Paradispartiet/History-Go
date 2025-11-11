// ==================================================
// REDIGERBART NAVN
// ==================================================
function initEditableProfileName() {
  const nameEl = document.querySelector(".profile-card .name");
  if (!nameEl) return;
  const savedName = localStorage.getItem("playerName");
  if (savedName) nameEl.textContent = savedName;

  nameEl.addEventListener("blur", saveName);
  nameEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); nameEl.blur(); }
  });

  function saveName() {
    const newName = nameEl.textContent.trim();
    if (newName.length > 0) {
      localStorage.setItem("playerName", newName);
      window.dispatchEvent(new Event("updateProfile"));
    }
  }
}

// ==================================================
// AUTO-OPPDATERING AV PROFILSTATISTIKK
// ==================================================
function initAutoProfileSync() {
  function renderUpdatedProfile() {
    const statsEl = document.querySelector(".profile-stats");
    if (!statsEl) return;
    const completedQuizzes = JSON.parse(localStorage.getItem("quiz_progress") || "{}");
    const visitedPlaces = JSON.parse(localStorage.getItem("visited_places") || "[]");
    const unlockedBadges = JSON.parse(localStorage.getItem("unlockedBadges") || "[]");
    const merits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");

    const totalPoints = Object.values(merits).reduce((sum, m) => sum + (m.points || 0), 0);
    const level = Math.floor(totalPoints / 50) + 1;

    statsEl.querySelector(".stat-quizzes").textContent = Object.keys(completedQuizzes).length;
    statsEl.querySelector(".stat-places").textContent = visitedPlaces.length;
    statsEl.querySelector(".stat-badges").textContent = unlockedBadges.length;
    statsEl.querySelector(".stat-points").textContent = totalPoints;
    statsEl.querySelector(".stat-level").textContent = level;
  }

  window.addEventListener("updateProfile", renderUpdatedProfile);
  renderUpdatedProfile();
}

// ==================================================
// TIDSLINJE – STEDER
// ==================================================
function renderTimeline() {
  const el = document.getElementById("timeline");
  if (!el) return;
  const visited = JSON.parse(localStorage.getItem("visited_places") || "[]");
  visited.sort((a,b)=>(a.year||0)-(b.year||0));
  el.innerHTML = visited.length
    ? visited.map(p=>`
      <div class="timeline-item place">
        <h3>${p.name} (${p.year||"ukjent"})</h3>
        <p>${p.desc||""}</p>
        ${p.image?`<img src="${p.image}" alt="${p.name}">`:""}
      </div>`).join("")
    : "<p>Ingen steder besøkt ennå.</p>";
}

// ==================================================
// TIDSLINJE – PERSONER
// ==================================================
function renderPeopleTimeline() {
  const el = document.getElementById("peopleTimeline");
  if (!el) return;
  const people = JSON.parse(localStorage.getItem("people_collected") || "[]");
  people.sort((a,b)=>a.name.localeCompare(b.name));
  el.innerHTML = people.length
    ? people.map(p=>`
      <div class="timeline-item person">
        <h3>${p.name}</h3>
        ${p.image?`<img src="${p.image}" alt="${p.name}">`:""}
      </div>`).join("")
    : "<p>Ingen personer møtt ennå.</p>";
}

// ==================================================
// TIDSLINJE – MERKER
// ==================================================
function renderBadgeTimeline() {
  const el = document.getElementById("badgeTimeline");
  if (!el) return;
  const badges = JSON.parse(localStorage.getItem("unlockedBadges") || "[]");
  badges.sort((a,b)=>a.name.localeCompare(b.name));
  el.innerHTML = badges.length
    ? badges.map(b=>`
      <div class="timeline-item badge">
        <img src="${b.image || `bilder/merker/${b.id}.PNG`}" alt="${b.name}">
        <h3>${b.name}</h3>
      </div>`).join("")
    : "<p>Ingen merker låst opp ennå.</p>";

  setupBadgeModalListeners();
}

// ==================================================
// MODAL – "SE ALT" FOR MERKER
// ==================================================
function setupBadgeModalListeners() {
  document.querySelectorAll("#badgeTimeline .timeline-item.badge").forEach(item=>{
    item.addEventListener("click",()=>{
      const badgeName=item.querySelector("h3").textContent.trim();
      openBadgeModal(badgeName);
    });
  });
}

function openBadgeModal(badgeName){
  const modal=document.getElementById("badgeModal");
  const title=document.getElementById("badgeModalTitle");
  const body=document.getElementById("badgeModalContent");
  const badges=JSON.parse(localStorage.getItem("unlockedBadges")||"[]");
  const merits=JSON.parse(localStorage.getItem("merits_by_category")||"{}");
  const found=badges.find(b=>b.name===badgeName);
  const cat=found?.id||badgeName.toLowerCase();
  const m=merits[cat]||{points:0,valør:"Bronse"};

  title.textContent=found?.name||badgeName;
  body.innerHTML=`
    <div style="text-align:center">
      <img src="${found?.image || `bilder/merker/${found?.id}.PNG`}" alt="${badgeName}">
      <p>${found?.desc || "Ingen beskrivelse tilgjengelig."}</p>
      <p><strong>Nivå:</strong> ${m.valør} (${m.points} poeng)</p>
    </div>`;
  modal.setAttribute("aria-hidden","false");
}

function closeBadgeModal(){
  const m=document.getElementById("badgeModal");
  if(m) m.setAttribute("aria-hidden","true");
}

// ==================================================
// INIT
// ==================================================
function updateTimelines(){
  renderTimeline();
  renderPeopleTimeline();
  renderBadgeTimeline();
}

document.addEventListener("DOMContentLoaded", ()=>{
  initEditableProfileName();
  initAutoProfileSync();
  updateTimelines();
});
window.addEventListener("updateProfile", updateTimelines);
