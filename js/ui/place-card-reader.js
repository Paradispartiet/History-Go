/* PlaceCard: sammenhengende opplesning fra toppen eller valgt tekst.
   Egen UI-komponent; ingen endring i stedets data eller navigasjon. */
(() => {
  "use strict";

  const card = document.getElementById("placeCard");
  const body = card?.querySelector(".pc-body");
  const titleRow = card?.querySelector(".pc-title-row");
  if (!card || !body || !titleRow || document.getElementById("pcReaderToggle")) return;

  const speech = window.speechSynthesis;
  const supported = Boolean(speech && typeof window.SpeechSynthesisUtterance === "function");
  // Place Sheet has prose in div/strong/span as well as ordinary paragraphs.
  const SEMANTIC = "h1,h2,h3,h4,h5,h6,p,li,blockquote,dt,dd,[data-pc-readable],.pc-relation-title,.pc-relation-meta";
  const READABLE = SEMANTIC + ",div,span,strong,em,small,article,section,time,a";
  const EDITORIAL_EXCLUDE = "button,input,textarea,select,summary,nav,[role='button'],[role='tab'],[contenteditable]";

  const ACTIONS = "button,a,input,textarea,select,summary,[role='button'],[role='link'],[role='tab'],[contenteditable],.pc-round,.pc-frontcard,.pc-events-quad,.pc-status-bar,.pc-sheet-section-nav";
  const IGNORE = "#pcStatusBar,#pcMeta,.pc-grid,.pc-icons-quad,.pc-frontcard,.pc-events-quad,.pc-empty,.pc-reader-controls,.pc-sheet-hero-media,.pc-sheet-explore-grid,.pc-sheet-section-nav,.pc-story-related,.pc-story-tags,.pc-category-meta";
  const SPEEDS = [0.8, 1, 1.2, 1.5];

  const toggle = document.createElement("button");
  toggle.id = "pcReaderToggle";
  toggle.type = "button";
  toggle.className = "pc-reader-toggle";
  toggle.innerHTML = '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
  titleRow.insertBefore(toggle, document.getElementById("pcFavorite"));

  // Panelet ligger utenfor .pc-body slik at det blir stående når stedsteksten rulles.
  const controls = document.createElement("div");
  controls.id = "pcReaderControls";
  controls.className = "pc-reader-controls";
  controls.hidden = true;
  controls.setAttribute("role", "group");
  controls.setAttribute("aria-label", "Opplesningskontroller");
  const playPause = document.createElement("button");
  playPause.type = "button";
  playPause.className = "pc-reader-playpause";
  const speed = document.createElement("button");
  speed.type = "button";
  speed.className = "pc-reader-speed";
  controls.appendChild(playPause);
  controls.appendChild(speed);
  card.appendChild(controls);

  let enabled = false;
  let paused = false;
  let inFlight = false;
  let generation = 0;
  let speedIndex = 1;
  let completed = new Map();
  let startAnchor = null;
  let finished = false;
  let highlighted = null;
  let readingPlaceId = "";

  const text = el => String(el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();

  function visible(node) {
    for (let el = node; el && el !== body; el = el.parentElement) {
      if (el.hidden || el.getAttribute?.("aria-hidden") === "true") return false;
      const style = window.getComputedStyle?.(el);
      if (style && (style.display === "none" || style.visibility === "hidden")) return false;
    }
    return true;
  }

  function readableBlocks() {
    // Standard Place Sheet owns the editorial content. Other PlaceCard widgets
    // (collections, badges, quiz and popups) must not enter the narration.
    const shell = body.querySelector('[data-hg-place-sheet-shell="1"]');
    const scope = shell || body;
    const blocks = Array.from(scope.querySelectorAll(READABLE));
    const opening = ["pcTitle", "pcDesc"]
      .map(id => document.getElementById(id))
      .filter(el => el && body.contains(el) && text(el));

    const remaining = blocks.filter(el => {
      if (opening.some(item => item === el)) return false;
      // Bibliographic link labels are source text; their click still opens
      // the external source and never triggers a tap-to-seek action.
      const sourceLink = el.matches("a") && !!el.closest('[data-hg-place-sheet-section="sources"]');
      if (!text(el) || !visible(el) || (el.closest(ACTIONS) && !sourceLink) ||
          el.closest(EDITORIAL_EXCLUDE) || el.closest(IGNORE)) return false;
      if (el.closest(SEMANTIC) && !el.matches(SEMANTIC)) return false;
      if (el.matches(SEMANTIC)) {
        const parent = el.parentElement?.closest(SEMANTIC);
        return !parent || !scope.contains(parent);
      }
      // Prefer a meaningful parent when it contains unwrapped prose; otherwise
      // prefer its smallest text-bearing children, avoiding duplicated speech.
      const ownText = Array.from(el.childNodes || []).some(node =>
        node.nodeType === 3 && String(node.textContent || "").trim()
      );
      if (ownText && !el.querySelector(ACTIONS)) return true;
      return !el.querySelector(READABLE + "," + ACTIONS);
    });
    const result = [];
    for (const el of [...opening, ...remaining]) {
      if (result.some(parent => parent !== el && parent.contains(el))) continue;
      result.push(el);
    }
    return result;
  }

  function readingPending() {
    const state = window.HGPlaceSheetState?.snapshot?.();
    if (state?.placeId === readingPlaceId) return state.phase !== "full-ready";
    return !!body.querySelector('[data-hg-place-sheet-shell="1"]')
      && String(card.dataset.hgPlaceSheetRenderPlaceId || "") === readingPlaceId
      && !["", "full-ready"].includes(String(card.dataset.hgPlaceSheetRenderState || ""));
  }

  function nextUnread() {
    for (const element of readableBlocks()) {
      if (startAnchor && startAnchor.isConnected !== false && element !== startAnchor && typeof element.compareDocumentPosition === "function" &&
          (element.compareDocumentPosition(startAnchor) & 4)) continue;
      const fullText = text(element);
      const parts = chunks(fullText);
      const previous = completed.get(element);
      const index = previous?.text === fullText ? previous.count : 0;
      if (index < parts.length) return { element, fullText, index, value: parts[index] };
    }
    return null;
  }

  function chunks(value) {
    const parts = [];
    let current = "";
    for (const word of value.split(/\s+/)) {
      if (!word) continue;
      if (current && current.length + word.length + 1 > 260) {
        parts.push(current);
        current = "";
      }
      current = current ? current + " " + word : word;
    }
    if (current) parts.push(current);
    return parts;
  }

  function voiceFor(lang) {
    const voices = typeof speech.getVoices === "function" ? speech.getVoices() : [];
    return voices.find(v => String(v.lang).toLowerCase() === lang.toLowerCase())
      || voices.find(v => String(v.lang).toLowerCase().split("-")[0] === lang.toLowerCase().split("-")[0])
      || null;
  }

  function language() {
    const lang = document.documentElement.lang || "nb";
    return /^(nb|nn|no)(-|$)/i.test(lang) ? "nb-NO" : lang;
  }

  function unmark() {
    if (highlighted) highlighted.classList.remove("pc-reader-speaking");
    highlighted = null;
  }

  function cancelVoice() {
    const hadVoice = inFlight || Boolean(speech?.speaking || speech?.pending || speech?.paused);
    generation++;
    inFlight = false;
    unmark();
    // Ikke send cancel() rett før første speak() på en ledig syntetisator.
    // Dette kan på Safari avbryte oppstarten av de første korte setningene.
    if (supported && hadVoice) {
      try { speech.cancel(); } catch (_) { /* synthesizer kan være utilgjengelig */ }
    }
  }

  function updateControls() {
    toggle.setAttribute("aria-pressed", String(enabled));
    toggle.setAttribute("aria-label", enabled ? "Stopp opplesning" : "Start opplesning fra toppen");
    toggle.title = enabled ? "Stopp opplesning" : "Les hele stedsteksten fra toppen";
    card.classList.toggle("pc-reader-enabled", enabled);
    controls.hidden = !enabled;
    playPause.textContent = paused ? "▶" : "⏸";
    playPause.setAttribute("aria-label", paused ? "Spill av opplesning" : "Pause opplesning");
    playPause.title = paused ? "Spill av" : "Pause";
    speed.textContent = SPEEDS[speedIndex].toLocaleString("nb-NO") + "×";
    speed.setAttribute("aria-label", "Stemmehastighet " + SPEEDS[speedIndex].toLocaleString("nb-NO") + " ganger. Trykk for å endre.");
    speed.title = "Endre stemmehastighet";
  }

  function usablePlace() {
    return card.getAttribute("aria-hidden") !== "true"
      && !card.classList.contains("is-collapsed")
      && !card.classList.contains("is-hidden")
      && (!readingPlaceId || readingPlaceId === String(card.dataset.currentPlaceId || ""));
  }

  function speakNext() {
    if (!enabled || paused || inFlight) return;
    if (!usablePlace()) { deactivate(); return; }
    const item = nextUnread();
    if (!item) {
      if (readingPending()) return; // Late Place Sheet sections will resume the narration.
      unmark();
      finished = true;
      paused = true;
      updateControls();
      return;
    }

    if (highlighted !== item.element) {
      unmark();
      highlighted = item.element;
      highlighted.classList.add("pc-reader-speaking");
    }
    const token = generation;
    const lang = language();
    const voice = voiceFor(lang);
    const utterance = new window.SpeechSynthesisUtterance(item.value);
    utterance.lang = voice?.lang || lang;
    if (voice) utterance.voice = voice;
    utterance.rate = SPEEDS[speedIndex];
    inFlight = true;
    utterance.onend = () => {
      if (token !== generation) return;
      inFlight = false;
      completed.set(item.element, { text: item.fullText, count: item.index + 1 });
      speakNext();
    };
    utterance.onerror = event => {
      if (token !== generation) return;
      cancelVoice();
      paused = true;
      updateControls();
    };
    try { speech.speak(utterance); } catch (_) { cancelVoice(); paused = true; updateControls(); }
  }

  function startFrom(node) {
    const blocks = readableBlocks();
    const index = node ? blocks.indexOf(node) : 0;
    if (!blocks.length || index < 0) return false;
    cancelVoice();
    completed = new Map();
    startAnchor = node || null;
    if (index > 0) {
      for (const element of blocks.slice(0, index)) {
        completed.set(element, { text: text(element), count: chunks(text(element)).length });
      }
    }
    readingPlaceId = String(card.dataset.currentPlaceId || "");
    finished = false;
    paused = false;
    enabled = true;
    updateControls();
    speakNext();
    return true;
  }

  function deactivate() {
    cancelVoice();
    completed.clear();
    startAnchor = null;
    finished = false;
    readingPlaceId = "";
    enabled = false;
    paused = false;
    updateControls();
  }

  toggle.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    if (!supported) {
      window.showToast?.("Opplesning støttes ikke av denne nettleseren.");
      return;
    }
    if (enabled) { deactivate(); return; }
    if (!startFrom(null)) window.showToast?.("Ingen stedstekst å lese opp.");
  });

  body.addEventListener("click", event => {
    if (!enabled || !supported || !(event.target instanceof Element)) return;
    if (event.target.closest(ACTIONS) || window.getSelection?.()?.toString().trim()) return;
    const blocks = readableBlocks();
    // Inline formatting (strong/span/em) often sits inside the actual prose
    // paragraph. Seek to the accepted block, not the innermost DOM element.
    let node = event.target;
    while (node && node !== body && !blocks.includes(node)) node = node.parentElement;
    if (!node || node === body) return;
    event.preventDefault();
    event.stopPropagation();
    startFrom(node); // Hopp hit og fortsett videre til slutten.
  }, true);

  playPause.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    if (!enabled) return;
    if (!paused) {
      paused = true;
      try { speech.pause(); } catch (_) { /* noop */ }
    } else {
      if (finished) {
        startFrom(null);
        return;
      }
      paused = false;
      try { speech.resume(); } catch (_) { /* noop */ }
      if (!inFlight) speakNext();
    }
    updateControls();
  });

  speed.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    speedIndex = (speedIndex + 1) % SPEEDS.length;
    if (enabled && !finished) {
      // An in-flight chunk is not marked complete until onend. Changing
      // speed therefore restarts that chunk without repeating earlier text.
      const wasPaused = paused;
      cancelVoice();
      paused = wasPaused;
      if (!paused) speakNext();
    }
    updateControls();
  });

  const observer = new MutationObserver(() => {
    if (enabled && !usablePlace()) deactivate();
  });
  observer.observe(card, { attributes: true, attributeFilter: ["class", "aria-hidden", "data-current-place-id"] });
  // Re-check the live DOM when async Place Sheet sections are hydrated. Do
  // not interrupt a speaking chunk; the next onend will see new content.
  function onEditorialUpdate() {
    if (!enabled || inFlight || !usablePlace()) return;
    // An async renderer may deliver its last section even after the
    // phase reports full-ready. Continue when new unread prose appears.
    if (finished && nextUnread()) {
      finished = false;
      paused = false;
      updateControls();
    }
    if (!paused) speakNext();
  }
  const contentObserver = new MutationObserver(onEditorialUpdate);
  contentObserver.observe(body, {
    childList: true, subtree: true, characterData: true,
    attributes: true, attributeFilter: ["hidden", "aria-hidden"]
  });
  window.addEventListener("hg:place-sheet-state", onEditorialUpdate);
  window.addEventListener("hg:place-sheet-full-ready", onEditorialUpdate);
  document.addEventListener("visibilitychange", () => { if (document.hidden && enabled) deactivate(); });
  window.addEventListener("pagehide", () => { if (enabled) deactivate(); });
  window.addEventListener("hg:langchange", () => { if (enabled) deactivate(); });

  if (!supported) {
    toggle.disabled = true;
    toggle.title = "Opplesning støttes ikke av denne nettleseren";
  }
  updateControls();
})();