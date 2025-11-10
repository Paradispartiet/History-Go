// ============================================================
// === HISTORY GO – QUIZ.JS (v2.6 ADDON: Live profil-sync) ===
// ============================================================
//
// Formål:
//  - Utløse sanntidsoppdatering av profilsiden når:
//      1. Quiz fullføres (poeng tildeles)
//      2. Sted legges til som besøkt
//      3. Personer på stedet låses opp
//      4. Bruker får nytt merke eller valør
//
// Krever: profile.js v2.6 eller nyere
//
// ============================================================


// Kalles etter at brukeren har svart på siste spørsmål i en quiz
function finalizeQuizResult(currentQuiz, correctAnswers) {
  const categoryId = currentQuiz.categoryId;
  const placeId = currentQuiz.placeId;
  const pointsGained = correctAnswers * 3; // eksempel

  // Oppdater localStorage.progress
  const progress = JSON.parse(localStorage.getItem("quiz_progress") || "{}");
  progress[currentQuiz.id] = {
    categoryId,
    placeId,
    questionCount: currentQuiz.questions.length,
    correctAnswers,
    points: pointsGained,
    timestamp: Date.now(),
    placeName: currentQuiz.placeName
  };
  localStorage.setItem("quiz_progress", JSON.stringify(progress));

  // Oppdater poeng / merker
  updateMeritLevel(categoryId, pointsGained);

  // Legg til sted som besøkt
  addVisitedPlace(placeId);

  // Lås opp personer på stedet
  unlockPeopleAtPlace(placeId);

  // VISUELL TILBAKEMELDING
  ui.showToast(`Quiz fullført! +${pointsGained} poeng`);

  // 🔄  SEND LIVE-EVENT TIL PROFILSIDE
  window.dispatchEvent(new Event("updateProfile"));
}


// ------------------------------------------------------------
// Oppdater poeng og valør basert på badges.json
// ------------------------------------------------------------
function updateMeritLevel(categoryId, newPoints) {
  const merits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");
  const badges = JSON.parse(localStorage.getItem("cached_badges") || "[]"); // kan hentes fra fetch eller core
  const badgeInfo = badges.find(b => b.id === categoryId);

  if (!merits[categoryId]) merits[categoryId] = { points: 0, valør: "Bronse" };
  merits[categoryId].points += newPoints;

  // Hent poenggrenser fra badges.json (f.eks. {bronse:0, sølv:50, gull:100})
  if (badgeInfo && badgeInfo.thresholds) {
    const pts = merits[categoryId].points;
    if (pts >= badgeInfo.thresholds.gull) merits[categoryId].valør = "Gull";
    else if (pts >= badgeInfo.thresholds.sølv) merits[categoryId].valør = "Sølv";
    else merits[categoryId].valør = "Bronse";
  }

  localStorage.setItem("merits_by_category", JSON.stringify(merits));
  ui.showToast(`Nytt ${merits[categoryId].valør}merke i ${categoryId}!`);
}


// ------------------------------------------------------------
// Legg til sted som besøkt
// ------------------------------------------------------------
function addVisitedPlace(placeId) {
  const places = JSON.parse(localStorage.getItem("visited_places") || "[]");
  if (!places.find(p => p.id === placeId)) {
    const placeData = HG?.data?.places?.find(p => p.id === placeId);
    if (placeData) {
      places.push({
        id: placeData.id,
        name: placeData.name,
        year: placeData.year,
        desc: placeData.desc
      });
      localStorage.setItem("visited_places", JSON.stringify(places));
      ui.showToast(`📍 Du har besøkt ${placeData.name}`);
    }
  }
}


// ------------------------------------------------------------
// Lås opp personer knyttet til stedet
// ------------------------------------------------------------
function unlockPeopleAtPlace(placeId) {
  const peopleAll = HG?.data?.people || [];
  const peopleUnlocked = JSON.parse(localStorage.getItem("people_collected") || "[]");
  const placePeople = peopleAll.filter(p => p.placeId === placeId);

  placePeople.forEach(p => {
    if (!peopleUnlocked.find(x => x.id === p.id)) {
      peopleUnlocked.push({ id: p.id, name: p.name, year: p.year, desc: p.desc });
      ui.showToast(`👤 Ny person: ${p.name}`);
    }
  });

  localStorage.setItem("people_collected", JSON.stringify(peopleUnlocked));
}


// ------------------------------------------------------------
// Eventhook: når quiz fullføres, kall finalizeQuizResult()
// ------------------------------------------------------------
// Eksempel:
// quiz.finishButton.onclick = () => finalizeQuizResult(currentQuiz, correctCount);
