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
  const READABLE = "h1,h2,h3,h4,h5,h6,p,li,blockquote,dt,dd,[data-pc-readable],.pc-relation-title,.pc-relation-meta";
  const ACTIONS = "button,a,input,textarea,select,summary,[role='button'],[role='link'],[role='tab'],[contenteditable],.pc-round,.pc-frontcard,.pc-events-quad,.pc-status-bar,.pc-sheet-section-nav";
  const IGNORE = "#pcStatusBar,#pcMeta,.pc-grid,.pc-icons-quad,.pc-frontcard,.pc-events-quad,.pc-empty,[aria-live],.pc-reader-controls";
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
  let queue = [];
  let position = 0;
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
    const blocks = Array.from(body.querySelectorAll(READABLE));
    return blocks.filter((el, index) => {
      if (!text(el) || !visible(el) || el.closest(ACTIONS) || el.closest(IGNORE)) return false;
      // Ett tekstledd leses bare én gang selv når det inneholder underordnede tekstledd.
      return !blocks.slice(0, index).some(parent => parent.contains(el));
    });
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
    generation++;
    inFlight = false;
    unmark();
    if (supported) {
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
    if (position >= queue.length) {
      unmark();
      position = 0; // Play etter fullført lesing starter på nytt.
      paused = true;
      updateControls();
      return;
    }

    const item = queue[position];
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
      position++;
      speakNext();
    };
    utterance.onerror = event => {
      if (token !== generation) return;
      // Andre feil enn forventet avbrudd avslutter dette opplesningsforsøket.
      if (event?.error === "canceled" || event?.error === "interrupted") return;
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
    readingPlaceId = String(card.dataset.currentPlaceId || "");
    queue = blocks.slice(index).flatMap(element => chunks(text(element)).map(value => ({ element, value })));
    position = 0;
    paused = false;
    enabled = true;
    updateControls();
    speakNext();
    return true;
  }

  function deactivate() {
    cancelVoice();
    queue = [];
    position = 0;
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
    const node = event.target.closest(READABLE);
    if (!node || !readableBlocks().includes(node)) return;
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
    if (enabled && queue.length) {
      // Den nye hastigheten gjelder fra starten av det aktive tekstsegmentet.
      const wasPaused = paused;
      const current = position;
      cancelVoice();
      position = current;
      paused = wasPaused;
      if (!paused) speakNext();
    }
    updateControls();
  });

  const observer = new MutationObserver(() => {
    if (enabled && !usablePlace()) deactivate();
  });
  observer.observe(card, { attributes: true, attributeFilter: ["class", "aria-hidden", "data-current-place-id"] });
  document.addEventListener("visibilitychange", () => { if (document.hidden && enabled) deactivate(); });
  window.addEventListener("pagehide", () => { if (enabled) deactivate(); });
  window.addEventListener("hg:langchange", () => { if (enabled) deactivate(); });

  if (!supported) {
    toggle.disabled = true;
    toggle.title = "Opplesning støttes ikke av denne nettleseren";
  }
  updateControls();
})();