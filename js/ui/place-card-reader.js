/* PlaceCard: valgfri opplesning ved trykk på overskrifter og tekst.
   Holdes adskilt fra PlaceCard-åpning, quiz, kart og navigasjon. */
(() => {
  "use strict";

  const card = document.getElementById("placeCard");
  const body = card?.querySelector(".pc-body");
  const titleRow = card?.querySelector(".pc-title-row");
  if (!card || !body || !titleRow || document.getElementById("pcReaderToggle")) return;

  const speech = window.speechSynthesis;
  const supported = Boolean(speech && typeof window.SpeechSynthesisUtterance === "function");
  const button = document.createElement("button");
  button.id = "pcReaderToggle";
  button.type = "button";
  button.className = "pc-reader-toggle";
  button.setAttribute("aria-pressed", "false");
  button.setAttribute("aria-label", "Slå på opplesning i stedskortet");
  button.title = "Slå på opplesning: trykk på tekst for å høre den";
  button.innerHTML = '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
  titleRow.insertBefore(button, document.getElementById("pcFavorite"));

  let enabled = false;
  let runId = 0;
  let highlighted = null;
  let readingPlaceId = "";
  const TEXT_BLOCKS = "h1,h2,h3,h4,h5,h6,p,li,blockquote,dt,dd,[data-pc-readable],.pc-relation-title,.pc-relation-meta";
  const ACTIONS = "button,a,input,textarea,select,summary,[role='button'],[role='link'],[role='tab'],[contenteditable],.pc-round,.pc-frontcard,.pc-events-quad,.pc-status-bar,.pc-sheet-section-nav";

  const getText = (el) => String(el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();

  function stop() {
    runId += 1;
    if (highlighted) highlighted.classList.remove("pc-reader-speaking");
    highlighted = null;
    readingPlaceId = "";
    if (supported) {
      try { speech.cancel(); } catch (_) { /* nettleseren kan avvise avbrudd */ }
    }
  }

  function updateButton() {
    button.setAttribute("aria-pressed", String(enabled));
    button.setAttribute("aria-label", enabled ? "Slå av opplesning i stedskortet" : "Slå på opplesning i stedskortet");
    button.title = enabled ? "Opplesning på – trykk på en overskrift eller tekst" : "Slå på opplesning";
    card.classList.toggle("pc-reader-enabled", enabled);
  }

  function getVoice(language) {
    const voices = typeof speech.getVoices === "function" ? speech.getVoices() : [];
    const wanted = language.toLowerCase();
    const primary = wanted.split("-")[0];
    return voices.find((voice) => String(voice.lang).toLowerCase() === wanted)
      || voices.find((voice) => String(voice.lang).toLowerCase().split("-")[0] === primary)
      || null;
  }

  function chunks(text) {
    const result = [];
    let current = "";
    for (const word of text.split(/\s+/)) {
      if (!word) continue;
      if (current && (current.length + word.length + 1 > 260)) {
        result.push(current);
        current = "";
      }
      // Lange enkeltord må fremdeles leses, ikke kuttes bort.
      current = current ? current + " " + word : word;
    }
    if (current) result.push(current);
    return result;
  }

  function speak(el) {
    const text = getText(el);
    if (!text) return;
    stop();
    const id = runId;
    readingPlaceId = String(card.dataset.currentPlaceId || "");
    highlighted = el;
    el.classList.add("pc-reader-speaking");

    const documentLang = document.documentElement.lang || "nb";
    const lang = /^(nb|nn|no)(-|$)/i.test(documentLang) ? "nb-NO" : documentLang;
    const voice = getVoice(lang);
    const parts = chunks(text);
    let partIndex = 0;

    function next() {
      if (id !== runId || !enabled) return;
      if (card.getAttribute("aria-hidden") === "true" || card.classList.contains("is-collapsed") ||
          card.classList.contains("is-hidden") ||
          String(card.dataset.currentPlaceId || "") !== readingPlaceId) {
        stop();
        return;
      }
      if (partIndex >= parts.length) {
        if (highlighted === el) highlighted.classList.remove("pc-reader-speaking");
        highlighted = null;
        return;
      }
      const utterance = new window.SpeechSynthesisUtterance(parts[partIndex++]);
      utterance.lang = voice?.lang || lang;
      if (voice) utterance.voice = voice;
      utterance.rate = 0.95;
      utterance.onend = next;
      utterance.onerror = () => {
        if (id !== runId) return;
        stop();
      };
      try { speech.speak(utterance); } catch (_) { stop(); }
    }

    next();
  }

  function readableAt(target) {
    const semantic = target.closest(TEXT_BLOCKS);
    if (semantic && body.contains(semantic)) return semantic;

    // Noen eldre PlaceCard-seksjoner bruker div/span i stedet for p/h-elementer.
    for (let el = target; el && el !== body; el = el.parentElement) {
      if (!el.matches("span,div")) continue;
      if (el.querySelector(TEXT_BLOCKS + "," + ACTIONS)) continue;
      const text = getText(el);
      if (text && text.length <= 2000) return el;
    }
    return null;
  }

  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!supported) {
      window.showToast?.("Opplesning støttes ikke av denne nettleseren.");
      return;
    }
    enabled = !enabled;
    if (!enabled) stop();
    updateButton();
  });

  body.addEventListener("click", (event) => {
    if (!enabled || !supported || !(event.target instanceof Element)) return;
    const target = event.target;
    if (target.closest(ACTIONS)) return; // lenker, rundinger og spillknapper skal fungere som før
    if (card.getAttribute("aria-hidden") === "true" || card.classList.contains("is-collapsed") ||
        card.classList.contains("is-hidden")) return;
    if (window.getSelection?.()?.toString().trim()) return;

    const el = readableAt(target);
    if (!el) return;
    // Ikke start underliggende klikkhandling for et rent teksttrykk.
    event.preventDefault();
    event.stopPropagation();
    speak(el);
  }, true);

  const visibility = new MutationObserver(() => {
    if (card.getAttribute("aria-hidden") === "true" || card.classList.contains("is-collapsed") ||
        card.classList.contains("is-hidden") ||
        (readingPlaceId && readingPlaceId !== String(card.dataset.currentPlaceId || ""))) {
      stop();
    }
  });
  visibility.observe(card, { attributes: true, attributeFilter: ["aria-hidden", "class", "data-current-place-id"] });

  document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); });
  window.addEventListener("pagehide", stop);
  window.addEventListener("hg:langchange", stop);

  if (!supported) {
    button.disabled = true;
    button.title = "Opplesning støttes ikke av denne nettleseren";
    button.setAttribute("aria-label", button.title);
  }
})();
