function tUI(key, fallback = "") {
  try {
    return window.HG_I18N?.t?.(key, fallback) || fallback;
  } catch {
    return fallback;
  }
}

function tfUI(key, fallback = "", vars = {}) {
  const template = tUI(key, fallback);
  return String(template).replace(/\{(\w+)\}/g, (_, name) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : `{${name}}`
  );
}

function handlePersonChat(person) {
  // Enkel V1: ett åpent spørsmål + lagring
  const userText = window.prompt(
    tfUI("ui.interactions.talkPrompt", "Du snakker med {name}. Skriv én setning eller tanke du vil ta vare på:", { name: person.name })
  );
  if (!userText) return;

  personDialogs.push({
    id: "dlg_" + Date.now(),
    personId: person.id,
    categoryId: (person.tags && person.tags[0]) || null,
    role: "user",
    text: userText,
    createdAt: new Date().toISOString()
  });
  savePersonDialogs();

  showToast(tfUI("ui.interactions.conversationSaved", "Samtale med {name} lagret 💬", { name: person.name }));
}

function handlePersonNote(person) {
  const noteText = window.prompt(
    `${tfUI("ui.notes.noteAbout", "Notat om {name}", { name: person.name })}.\n\n` +
    tUI("ui.notes.promptOneSentence", "Skriv én setning eller tanke du vil ta vare på:")
  );
  if (!noteText) return;

  userNotes.push({
    id: "note_" + Date.now(),
    userId: "local",              // senere: ekte bruker-id
    source: "historygo",
    type: "person",
    personId: person.id,
    placeId: null,
    categoryId: (person.tags && person.tags[0]) || null,
    title: tfUI("ui.notes.noteAboutPerson", "Notat om {person}", { person: person.name }),
    text: noteText,
    feeling: null,                // plass til følelser/valens senere
    createdAt: new Date().toISOString(),
    visibility: "private"
  });
  saveUserNotes();

  showToast(tfUI("ui.notes.noteSaved", "Notat om {name} lagret 📝", { name: person.name }));
}

// Real place-bound note editor. Stored private notes remain in the existing
// hg_user_notes_v1 collection; never mix notes with physical visit progress.
function handlePlaceNote(place) {
  const placeId = String(place?.id || "").trim();
  if (!placeId) return window.showToast?.("Velg et sted først.");
  const name = String(place.name || place.title || placeId);
  document.getElementById("hg-place-note-editor")?.remove();

  const styleId = "hg-place-note-editor-style";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = [
      "#hg-place-note-editor{position:fixed;inset:0;z-index:1400;display:grid;place-items:center;padding:16px;background:rgba(0,0,0,.78);font-family:system-ui,sans-serif}",
      "#hg-place-note-editor .hg-note-sheet{box-sizing:border-box;width:min(520px,100%);max-height:min(85dvh,680px);overflow:auto;padding:20px;background:#111;color:#fff;border:1px solid rgba(246,200,0,.6);border-radius:18px;box-shadow:0 20px 60px #000a}",
      "#hg-place-note-editor .hg-note-head{display:flex;justify-content:space-between;align-items:center;gap:8px}",
      "#hg-place-note-editor h2{margin:0;color:#f6c800;font-size:19px}",
      "#hg-place-note-editor p{margin:9px 0;color:#d2d2d2;font-size:13px}",
      "#hg-place-note-editor textarea{box-sizing:border-box;width:100%;min-height:124px;padding:12px;border-radius:10px;background:#202020;border:1px solid #777;color:#fff;font:15px/1.5 system-ui;resize:vertical}",
      "#hg-place-note-editor button{padding:9px 12px;color:#fff;background:#202020;border:1px solid #777;border-radius:9px;font:600 13px system-ui;cursor:pointer}",
      "#hg-place-note-editor button:hover,#hg-place-note-editor button:focus-visible{border-color:#f6c800}",
      "#hg-place-note-editor .hg-note-submit{background:#f6c800;color:#111;border-color:#f6c800}",
      "#hg-place-note-editor .hg-note-controls{display:flex;gap:8px;align-items:center;justify-content:flex-end;margin-top:10px}",
      "#hg-place-note-editor .hg-note-history{margin-top:20px;border-top:1px solid #555;padding-top:12px}",
      "#hg-place-note-editor .hg-note-entry{border-bottom:1px solid #333;padding:12px 0}",
      "#hg-place-note-editor .hg-note-entry p{white-space:pre-wrap;overflow-wrap:anywhere;color:#fff;font-size:14px}",
      "#hg-place-note-editor .hg-note-entry small{color:#aaa}",
      "#hg-place-note-editor .hg-note-entry button{margin-right:7px;margin-top:7px}",
      "@media(max-width:520px){#hg-place-note-editor .hg-note-sheet{padding:14px;border-radius:14px}}"
    ].join("\n");
    document.head.appendChild(style);
  }

  const modal = document.createElement("div");
  modal.id = "hg-place-note-editor";
  modal.setAttribute("role", "presentation");
  modal.innerHTML = '<section class="hg-note-sheet" role="dialog" aria-modal="true" aria-labelledby="hg-place-note-title">' +
    '<div class="hg-note-head"><h2 id="hg-place-note-title">Notater</h2><button type="button" data-note-action="close" aria-label="Lukk notater">Lukk</button></div>' +
    '<p class="hg-note-place"></p><label for="hg-place-note-text">Ditt private notat</label>' +
    '<textarea id="hg-place-note-text" maxlength="5000" placeholder="Hva vil du huske om dette stedet?"></textarea>' +
    '<div class="hg-note-controls"><span class="hg-note-feedback" role="status" aria-live="polite"></span>' +
    '<button type="button" class="hg-note-submit" data-note-action="save">Lagre notat</button></div>' +
    '<div class="hg-note-history"><strong>Tidligere notater om stedet</strong><div class="hg-note-items"></div></div></section>';
  const sheet = modal.querySelector(".hg-note-sheet");
  const input = modal.querySelector("#hg-place-note-text");
  const feedback = modal.querySelector(".hg-note-feedback");
  const items = modal.querySelector(".hg-note-items");
  modal.querySelector(".hg-note-place").textContent = name;
  let editingId = null;
  const close = () => {
    document.removeEventListener("keydown", onKey);
    modal.remove();
  };
  const onKey = e => {
    if (e.key === "Escape") close();
    if (e.key === "Tab") {
      const controls = [...sheet.querySelectorAll('button,textarea')].filter(el => !el.disabled);
      const index = controls.indexOf(document.activeElement);
      if (e.shiftKey && index === 0) { e.preventDefault(); controls.at(-1)?.focus(); }
      if (!e.shiftKey && index === controls.length - 1) { e.preventDefault(); controls[0]?.focus(); }
    }
  };
  const store = () => {
    try { saveUserNotes(); }
    catch (error) {
      console.warn("[place notes] save failed", error);
      feedback.textContent = "Kunne ikke lagre notatet på denne enheten.";
      return false;
    }
    window.dispatchEvent(new Event("updateProfile"));
    return true;
  };
  const render = () => {
    items.replaceChildren();
    const notes = userNotes.filter(note => note.type === "place" && String(note.placeId) === placeId)
      .slice().sort((a,b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
    if (!notes.length) {
      const empty = document.createElement("p");
      empty.textContent = "Ingen notater lagret for dette stedet ennå.";
      items.appendChild(empty);
    }
    notes.forEach(note => {
      const article = document.createElement("article");
      article.className = "hg-note-entry";
      const when = document.createElement("small");
      when.textContent = note.createdAt ? new Date(note.createdAt).toLocaleString("nb-NO") : "";
      const body = document.createElement("p");
      body.textContent = String(note.text || "");
      const edit = document.createElement("button");
      edit.type = "button";
      edit.textContent = "Rediger";
      edit.addEventListener("click", () => {
        editingId = note.id;
        input.value = String(note.text || "");
        modal.querySelector(".hg-note-submit").textContent = "Lagre endring";
        feedback.textContent = "";
        input.focus();
      });
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "Slett";
      remove.addEventListener("click", () => {
        const index = userNotes.indexOf(note);
        if (index < 0) return;
        userNotes.splice(index, 1);
        if (!store()) { userNotes.splice(index, 0, note); return; }
        if (editingId === note.id) { editingId = null; input.value = ""; }
        feedback.textContent = "Notatet er slettet.";
        render();
      });
      article.append(when,body,edit,remove);
      items.appendChild(article);
    });
  };
  modal.addEventListener("click", e => {
    if (e.target === modal || e.target.closest('[data-note-action="close"]')) return close();
    if (!e.target.closest('[data-note-action="save"]')) return;
    const noteText = input.value.trim();
    if (!noteText) { feedback.textContent = "Skriv et notat før du lagrer."; return; }
    const existing = editingId && userNotes.find(note => note.id === editingId && String(note.placeId) === placeId);
    if (existing) {
      const before = existing.text;
      existing.text = noteText;
      if (!store()) { existing.text = before; return; }
    } else {
      const note = {
        id: "note_" + Date.now() + "_" + Math.random().toString(36).slice(2,8),
        userId: "local", source: "historygo", type: "place",
        personId: null, placeId,
        categoryId: place.categoryId || place.category || null,
        title: tfUI("ui.notes.noteAboutPlace", "Notat om {place}", {place: name}),
        text: noteText, feeling: null, createdAt: new Date().toISOString(),
        visibility: "private"
      };
      userNotes.push(note);
      if (!store()) { userNotes.pop(); return; }
    }
    editingId = null;
    input.value = "";
    modal.querySelector(".hg-note-submit").textContent = "Lagre notat";
    feedback.textContent = "Notatet er lagret.";
    window.showToast?.(tfUI("ui.notes.noteSaved", "Notat om {name} lagret 📝", { name }));
    render();
  });
  document.body.appendChild(modal);
  document.addEventListener("keydown", onKey);
  render();
  input.focus();
}

// ============================================================
// PLACE CARD: trykk på beskrivelsen åpner full stedsbeskrivelse
// ============================================================
function getActivePlaceFromPlaceCard() {
  const card = document.getElementById("placeCard");
  const placeId = String(card?.dataset?.currentPlaceId || "").trim();
  if (!placeId) return null;

  const places = Array.isArray(window.PLACES) ? window.PLACES : [];
  return places.find(p => String(p?.id || "").trim() === placeId) || null;
}

function openActivePlaceDescription(e) {
  e.preventDefault();
  e.stopPropagation();

  const place = getActivePlaceFromPlaceCard();
  if (!place) return;

  if (typeof window.showPlacePopup === "function") {
    window.showPlacePopup(place);
  } else {
    window.showToast?.(tUI("ui.place.descriptionNotLoaded", "Stedsbeskrivelse ikke lastet"));
  }
}

function bindPlaceDescriptionPopup() {
  const descEl = document.getElementById("pcDesc");
  if (!descEl || descEl.dataset.fullTextPopupBound === "1") return;

  descEl.dataset.fullTextPopupBound = "1";
  descEl.setAttribute("role", "button");
  descEl.setAttribute("tabindex", "0");
  descEl.setAttribute("title", tUI("ui.place.readFullTextHint", "Trykk for å lese hele teksten"));
  descEl.style.cursor = "pointer";

  descEl.addEventListener("click", openActivePlaceDescription);
  descEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      openActivePlaceDescription(e);
    }
  });
}

bindPlaceDescriptionPopup();

// ============================================================
// PLACE POPUP: større og mer lesbar tekst i steds-popupen
// ============================================================
function ensurePlacePopupReadableCss() {
  if (document.getElementById("hg-place-popup-readable-css")) return;

  const style = document.createElement("style");
  style.id = "hg-place-popup-readable-css";
  style.textContent = `
    .hg-popup.place-popup .hg-popup-name,
    .hg-popup.place-popup .hg-popup-title{
      font-size: 28px;
      line-height: 1.15;
    }

    .hg-popup.place-popup .hg-popupdesc{
      font-size: 20px;
      line-height: 1.65;
    }

    .hg-popup.place-popup .hg-wiki{
      font-size: 18px;
      line-height: 1.6;
    }

    .hg-popup.place-popup .hg-section h3{
      font-size: 19px;
      line-height: 1.25;
    }
  `;

  document.head.appendChild(style);
}

ensurePlacePopupReadableCss();

// ============================================================
// PLACE POPUP: bruk popupDesc som fulltekst når den finnes
// ============================================================
(function patchPlacePopupDescriptionSource() {
  const originalShowPlacePopup = window.showPlacePopup;
  if (typeof originalShowPlacePopup !== "function") return;
  if (originalShowPlacePopup.__usesPopupDesc === true) return;

  function getPlacePopupDesc(place) {
    return String(
      place?.popupDesc ??
      place?.popupdesc ??
      place?.description ??
      ""
    ).trim();
  }

  window.showPlacePopup = function showPlacePopupWithPopupDesc(place, ...args) {
    const popupDesc = getPlacePopupDesc(place);

    if (place && typeof place === "object" && popupDesc) {
      return originalShowPlacePopup.call(this, {
        ...place,
        desc: popupDesc,
        popupDesc
      }, ...args);
    }

    return originalShowPlacePopup.call(this, place, ...args);
  };

  window.showPlacePopup.__usesPopupDesc = true;
})();



// ==============================
// 12. KARTMODUS
// ==============================
function enterMapMode() {
  document.body.classList.add("map-only"); // kan beholdes hvis du bruker den visuelt

  if (el.btnSeeMap)  el.btnSeeMap.style.display = "none";
  if (el.btnExitMap) el.btnExitMap.style.display = "block";

   // ✅ bare minimer (ingen hide av hele UI)
  window.setPlaceCardCollapsed?.(true);

   // ✅ kartmodus: kollaps Nearby
  window.setNearbyCollapsed?.(true);

  window.HGMap?.resize?.();
  window.MAP?.resize?.();

  showToast(tUI("ui.map.mode", "Kartmodus"));
}

function exitMapMode() {
  document.body.classList.remove("map-only");

  if (el.btnSeeMap)  el.btnSeeMap.style.display = "block";
  if (el.btnExitMap) el.btnExitMap.style.display = "none";
  
  window.setPlaceCardCollapsed?.(false);
  // Nearby skal alltid være synlig i explore
  window.setNearbyCollapsed?.(false);
  
  window.HGMap?.resize?.();
  window.MAP?.resize?.();

  showToast(tUI("ui.map.backToOverview", "Tilbake til oversikt"));
}

el.btnSeeMap?.addEventListener("click", enterMapMode);
el.btnExitMap?.addEventListener("click", exitMapMode);

// Eksponer på window så routes.js og andre subsystemer kan bytte til
// kart-modus før de tegner overlays/ruter.
window.enterMapMode = enterMapMode;
window.exitMapMode = exitMapMode;

window.addEventListener("resize", () => {
  window.MAP?.resize?.();
});

// ============================================================
// PERSON-POPUP ANCHOR
// Person-popup må ligge i samme skalerte app-shell som Nearby.
// Hvis den blir appendet direkte på body, vil hardkodede top-verdier
// bruke viewport-piksler og gi synlig mellomrom på iPad.
// ============================================================

function anchorPersonPopupToAppShell(node) {
  if (!node || !node.classList?.contains("person-popup")) return;

  const shell = document.querySelector(".app-shell");
  if (!shell || node.parentElement === shell) return;

  shell.appendChild(node);
}

const personPopupObserver = new MutationObserver(records => {
  records.forEach(record => {
    record.addedNodes.forEach(node => {
      anchorPersonPopupToAppShell(node);
    });
  });
});

personPopupObserver.observe(document.body, {
  childList: true
});
