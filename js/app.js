const app = (() => {

  function initApp(){
    // Mini-knapp for rask test
    document.getElementById("btnStartQuiz")?.addEventListener("click", ()=> {
      quiz?.startQuiz?.("observatoriet");
    });

    // Redigerbart navn → lagre
    const nameEl = document.querySelector(".mini-profile .name");
    if (nameEl){
      const saved = localStorage.getItem("playerName");
      if (saved) nameEl.textContent = saved;
      nameEl.addEventListener("blur", ()=> {
        const v = nameEl.textContent.trim();
        if(v){ localStorage.setItem("playerName", v); window.dispatchEvent(new Event("updateProfile")); }
      });
      nameEl.addEventListener("keydown", (e)=>{ if(e.key==="Enter"){ e.preventDefault(); nameEl.blur(); }});
    }
  }

  // *** NØKKEL: kobling fra quiz til progresjon ***
  document.addEventListener("quizCompleted", (e) => handleQuizCompletion(e.detail));

  function handleQuizCompletion(result){
    addCompletedQuiz(result);
    addVisitedPlace(result.placeId);
    updateCategoryMerit(result.categoryId, result.points||0);
    unlockPeopleAtPlace(result.placeId);
    window.dispatchEvent(new Event("updateProfile"));
    ui.showToast?.(`+${result.points||0} poeng i ${result.categoryId}`);
  }

  function addCompletedQuiz(result){
    const progress = load("quiz_progress", {});
    progress[result.quizId] = result;
    save("quiz_progress", progress);
  }

  function addVisitedPlace(placeId){
    const visited = load("visited_places", []);
    if (visited.find(v=>v.id===placeId)) return;
    const pl = (HG.data?.places||[]).find(p=>p.id===placeId);
    if (!pl) return;
    visited.push({ id:pl.id, name:pl.name, year:pl.year, desc:pl.desc, lat:pl.lat, lon:pl.lon, image:pl.image });
    save("visited_places", visited);
  }

  function unlockPeopleAtPlace(placeId){
    const all = HG.data?.people||[];
    const got = load("people_collected", []);
    const adds = all.filter(p=>p.placeId===placeId && !got.find(g=>g.id===p.id))
                    .map(p=>({ id:p.id, name:p.name, year:p.year, placeId:p.placeId, image:p.image }));
    if (adds.length){ save("people_collected", got.concat(adds)); }
  }

  function updateCategoryMerit(categoryId, pts){
    const merits = load("merits_by_category", {});
    if (!merits[categoryId]) merits[categoryId] = { points:0, valør:"Bronse" };
    merits[categoryId].points += pts;
    merits[categoryId].valør = merits[categoryId].points >= 100 ? "Gull" : merits[categoryId].points >= 50 ? "Sølv" : "Bronse";
    save("merits_by_category", merits);
  }

  // LS helpers
  function load(k, def){ try{ return JSON.parse(localStorage.getItem(k)) ?? def; }catch{ return def; } }
  function save(k, v){ localStorage.setItem(k, JSON.stringify(v)); }

  return { initApp };
})();

// ÉN oppstart (ikke dobbelt-boot)
document.addEventListener("DOMContentLoaded", ()=> app.initApp());
