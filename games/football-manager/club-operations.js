(function () {
  const staff = [
    ["assistant", "Assistenttrener", "Maja Lund", "Lokalt klubbspor", "Ukens viktigste råd: defensiv organisering før neste kamp. Varsler også om mangler i elleveren."],
    ["coach", "Trener", "Jonas Berg", "History Go-trener", "Foreslår mer relasjonell trening mellom back og kant."],
    ["coach", "Trener", "Elias Nouri", "Klubbtilknyttet person", "Mener laget bør øve gjenvinning etter balltap."],
    ["coach locked", "Trener", "Ikke funnet i History Go ennå", "Mangler klubbtilknytning", "Finn en klubbtilknyttet trener i History Go for å styrke treningsarbeidet."],
    ["physio", "Fysio", "Sara Haugen", "Medisinsk rom", "Fysio melder høy belastning på to spillere."],
    ["gk", "Keepertrener", "Omar Solheim", "Keepermiljø", "Keepertreneren mener førstekeeperen passer bedre i en sweeper-rolle."]
  ];

  const panels = {
    board: { title: "Styret", copy: "Styret forventer øvre halvdel. Klubbens prioritet akkurat nå er å gi unge spillere sjansen uten å miste lokal forankring.", bullets: ["Sesongmål: øvre halvdel", "Supporterne reagerer positivt på seier i lokaloppgjøret", "Ukevurdering: trygg retning"], action: "Gå til neste uke" },
    facilities: { title: "Fasiliteter", copy: "Fasiliteter er forenklet i v0.1 og påvirker foreløpig råd og forklaring, ikke motor direkte.", bullets: ["Treningsfelt: stabil hverdag", "Medisinsk rom: belastningsråd", "Akademi: egne spillere", "Analyse-/taktikkrom: kampplan", "Stadion / hjemmebane: identitet og kampdag"], action: "Forbered kamp" },
    admin: { title: "Klubbdrift", copy: "Markedsavdelingen vil bruke neste hjemmekamp til å løfte klubbhistorien. Dette er klubbfølelse, ikke business-simulator.", bullets: ["Publikum: lokal interesse øker etter seier", "Omdømme: tydeligere profil trengs før sesongen", "Arrangement: klubbhistorie på hjemmekamp"], action: "Se klubbidentitet" },
    scouting: { title: "Speiding / rekruttering", copy: "Speiding leser History Go-unlocks: spillere, klubbtilknyttede personer, steder og mulige staff-unlocks. Ingen transfermarked er bygget.", bullets: ["Ny spiller funnet: midtbanespiller fra samlingen din", "Låst spiller: ikke funnet i History Go ennå", "Mulig staff-unlock: trener fra klubbspor", "Finn flere klubbspor i History Go for å utvide troppen"], action: "Finn flere spillere" },
    identity: { title: "Klubbidentitet", copy: "Klubben bygger på lokal historie og spillere funnet gjennom History Go.", bullets: ["Klubbnavn: History Go FC", "Hjemmebane: stadion fra samlingen", "Stil: utvikle egne spillere, sterk lokal forankring, taktisk fleksibilitet", "Historisk profil: steder, personer og klubbspor", "Nøkkelpersoner: assistent, kaptein og lokale unlocks"], action: "Til kontoret" }
  };

  function esc(v) { return String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[c])); }

  function renderStaff() {
    document.getElementById("staffGrid").innerHTML = staff.map(([kind, role, name, tie, advice]) => `
      <article class="person-card ${esc(kind)}">
        <p class="role">${esc(role)}</p><h3>${esc(name)}</h3><p>${esc(tie)}</p><p class="advice">${esc(advice)}</p>
        <a href="${kind.includes("locked") ? "#club" : "#tactics"}" data-action="${kind.includes("locked") ? "club" : "tactics"}">${kind.includes("locked") ? "Finn i History Go" : "Bruk rådet"}</a>
      </article>`).join("");
  }

  function renderPanels() {
    document.getElementById("clubPanels").innerHTML = Object.entries(panels).map(([id, panel], idx) => `
      <article id="${id}" class="club-panel ${idx === 0 ? "active" : ""}">
        <h3>${esc(panel.title)}</h3><p>${esc(panel.copy)}</p>
        <ul>${panel.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
        <button data-next-week>${esc(panel.action)}</button>
      </article>`).join("");
  }

  function showView(id) {
    document.querySelectorAll(".view").forEach((el) => el.classList.toggle("active", el.id === id));
    document.querySelectorAll(".fm-nav button").forEach((btn) => btn.classList.toggle("active", btn.dataset.target === id));
  }

  function showClubPanel(id) {
    showView("club");
    document.querySelectorAll(".club-panel").forEach((el) => el.classList.toggle("active", el.id === id));
    document.querySelectorAll(".club-tabs button").forEach((btn) => btn.classList.toggle("active", btn.dataset.clubPanel === id));
  }

  renderStaff();
  renderPanels();
  document.addEventListener("click", (event) => {
    const nav = event.target.closest("[data-target], [data-action], [data-club-tab], [data-club-panel]");
    if (!nav) return;
    event.preventDefault();
    if (nav.dataset.clubTab) showClubPanel(nav.dataset.clubTab);
    else if (nav.dataset.clubPanel) showClubPanel(nav.dataset.clubPanel);
    else showView(nav.dataset.target || nav.dataset.action);
  });
  window.HGFMClubOperations = { staff, panels, showView, showClubPanel };
}());
