function initEditableName(){
  const el = document.querySelector(".profile-card .name");
  if(!el) return;
  const saved = localStorage.getItem("playerName");
  if (saved) el.textContent = saved;
  el.addEventListener("blur", ()=> {
    const v = el.textContent.trim();
    if(v){ localStorage.setItem("playerName", v); window.dispatchEvent(new Event("updateProfile")); }
  });
  el.addEventListener("keydown", e=>{ if(e.key==="Enter"){ e.preventDefault(); el.blur(); }});
}

function renderStats(){
  const stats = document.querySelector(".profile-stats"); if(!stats) return;
  const qp = JSON.parse(localStorage.getItem("quiz_progress")||"{}");
  const vp = JSON.parse(localStorage.getItem("visited_places")||"[]");
  const badges = JSON.parse(localStorage.getItem("unlockedBadges")||"[]");
  const merits = JSON.parse(localStorage.getItem("merits_by_category")||"{}");
  const points = Object.values(merits).reduce((s,m)=> s + (m.points||0), 0);
  const level = Math.floor(points/50)+1;
  stats.querySelector(".stat-quizzes").textContent = Object.keys(qp).length;
  stats.querySelector(".stat-places").textContent  = vp.length;
  stats.querySelector(".stat-badges").textContent  = badges.length;
  stats.querySelector(".stat-points").textContent  = points;
  stats.querySelector(".stat-level").textContent   = level;
}

function renderTimeline(){
  const el = document.getElementById("timeline"); if(!el) return;
  const vp = JSON.parse(localStorage.getItem("visited_places")||"[]").sort((a,b)=>(a.year||0)-(b.year||0));
  el.innerHTML = vp.length ? vp.map(p=>`
    <div class="timeline-item"><h3>${p.name} (${p.year||"ukjent"})</h3><p>${p.desc||""}</p></div>
  `).join("") : "<p>Ingen steder ennå.</p>";
}

function renderPeople(){
  const el = document.getElementById("peopleTimeline"); if(!el) return;
  const pp = JSON.parse(localStorage.getItem("people_collected")||"[]").sort((a,b)=>a.name.localeCompare(b.name));
  el.innerHTML = pp.length ? pp.map(p=>`
    <div class="timeline-item person"><h3>${p.name}</h3></div>
  `).join("") : "<p>Ingen personer ennå.</p>";
}

function refresh(){ renderStats(); renderTimeline(); renderPeople(); }
document.addEventListener("DOMContentLoaded", ()=>{ initEditableName(); refresh(); });
window.addEventListener("updateProfile", refresh);
