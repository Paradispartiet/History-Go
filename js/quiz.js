const quiz = (() => {
  let current = null, idx = 0, score = 0, questions = [];

  async function startQuiz(placeId){
    try{
      const place = (HG.data?.places||[]).find(p=>p.id===placeId);
      if(!place) return ui.showToast("Fant ikke sted");
      const category = (place.category||"ukjent").toLowerCase();
      const file = `data/quiz_${category}.json`;
      const data = await fetchJSON(file);
      questions = (data||[]).filter(q=>q.placeId===placeId);
      if(!questions.length) return ui.showToast("Ingen spørsmål for dette stedet enda");
      current = { placeId, category };
      idx = 0; score = 0; render();
    }catch(e){ console.error(e); ui.showToast("Kunne ikke starte quiz"); }
  }

  function render(){
    const q = questions[idx];
    const opts = q.options.map(o=>`<button class="quiz-option" data-a="${o}">${o}</button>`).join("");
    ui.openModal("Quiz", `
      <p class="quiz-question">${q.question}</p>
      <div class="quiz-options">${opts}</div>
      <p class="quiz-progress">${idx+1} / ${questions.length}</p>
    `);
    document.querySelectorAll(".quiz-option").forEach(b=>{
      b.addEventListener("click", ()=> answer(q, b.dataset.a, b));
    });
  }

  function answer(q, a, btn){
    const ok = q.answer.trim() === a.trim();
    if(ok){ btn.classList.add("correct"); score += 5; ui.showToast("✅ Riktig!"); }
    else  { btn.classList.add("wrong"); ui.showToast("❌ Feil svar"); }
    document.querySelectorAll(".quiz-option").forEach(b=> b.disabled = true);
    setTimeout(next, 600);
  }

  function next(){
    idx++;
    if(idx < questions.length) render();
    else finish();
  }

  function finish(){
    ui.closeModal();
    ui.showToast(`🎯 Du fikk ${score} poeng!`);
    const result = {
      quizId: `${current.placeId}_${Date.now()}`,
      placeId: current.placeId,
      categoryId: current.category,
      points: score,
      timestamp: new Date().toISOString()
    };
    document.dispatchEvent(new CustomEvent("quizCompleted", { detail: result }));
  }

  async function fetchJSON(p){ try{ const r=await fetch(p); if(!r.ok) throw 0; return r.json(); }catch{ return []; } }
  return { startQuiz };
})();
