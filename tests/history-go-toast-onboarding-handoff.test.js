#!/usr/bin/env node
// Browser-free regression for the ordinary toast queue and Civication guidance.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const src = fs.readFileSync(path.join(__dirname, "..", "js/ui/toast.js"), "utf8");
const welcome = fs.readFileSync(path.join(__dirname, "..", "js/ui/onboarding-welcome.js"), "utf8");
const styles = fs.readFileSync(path.join(__dirname, "..", "css/onboarding.css"), "utf8");

function harness({ ready = true, greeted = true } = {}) {
  const timers = new Map(), listeners = new Map(), elements = new Map(), storage = new Map();
  let clock = 0, nextId = 1;
  const style = () => ({ display: "", removeProperty(key) { delete this[key]; } });
  function element(tag = "div") {
    return {
      tagName: tag, style: style(), children: [], attributes: {},
      setAttribute(k,v) { this.attributes[k] = v; },
      getAttribute(k) { return this.attributes[k] ?? null; },
      appendChild(e) { this.children.push(e); if(e.id) elements.set(e.id,e); return e; },
      addEventListener(name, handler) { this["on_" + name] = handler; },
      set innerHTML(value) { this.children = []; this._html = value; },
      get innerHTML() { return this._html || ""; }
    };
  }
  const body = element("body");
  body.classList = { contains(k) { return k === "hg-app" || (ready && k === "hg-loaded"); } };
  const toast = element();
  toast.id = "toast";
  body.appendChild(toast);
  if (greeted) storage.set("hg_onboarding_shown_v1", "1");
  const context = {
    window: null,
    document: {
      body, readyState: "loading",
      createElement: element,
      getElementById(id) { return elements.get(id) || null; },
      addEventListener() {}
    },
    localStorage: {
      getItem(k) { return storage.has(k) ? storage.get(k) : null; },
      setItem(k,v) { storage.set(k,String(v)); },
      removeItem(k) { storage.delete(k); }
    },
    __HG_APP_READY__: ready,
    addEventListener(name, fn) { (listeners.get(name) || (listeners.set(name, []), listeners.get(name))).push(fn); },
    dispatchEvent(event) { for (const fn of (listeners.get(event.type) || [])) fn(event); },
    setTimeout(fn, delay) { const id = nextId++; timers.set(id,{at:clock + Number(delay || 0), fn}); return id; },
    clearTimeout(id) { timers.delete(id); },
    console, Date, Number, String, Math, Object, Array, JSON,
    location: { hash: "" }
  };
  context.window = context;
  vm.runInNewContext(src, context, { filename: "js/ui/toast.js" });
  function tick(delta) {
    const stop = clock + delta;
    for(let i=0;i<1000;i++) {
      const tasks = [...timers].filter(([,t])=>t.at<=stop).sort((a,b)=>a[1].at-b[1].at||a[0]-b[0]);
      if(!tasks.length) break;
      const [id,t] = tasks[0];
      timers.delete(id);
      clock = t.at;
      t.fn();
      if(i===999) throw new Error("runaway timer loop");
    }
    clock = stop;
  }
  const toastText = () => toast.children.find(x=>x.className==="toast-body")?.textContent;
  return { context, storage, toast, tick, toastText, fire: (type) => context.dispatchEvent({type}) };
}

// Two messages must be shown in full sequence, never overwritten after 350 ms.
{
  const t = harness();
  t.context.showToast("Første melding", 2000);
  t.context.showToast("Andre melding", 2000);
  assert.equal(t.context.HGToastRuntime.getPendingCount(), 2);
  t.tick(260);
  assert.equal(t.toastText(), "Første melding");
  t.tick(500);
  assert.equal(t.toastText(), "Første melding");
  t.tick(1500);
  assert.equal(t.context.HGToastRuntime.isShowing(), false);
  t.tick(120);
  assert.equal(t.toastText(), "Andre melding");
  assert.equal(t.context.HGToastRuntime.getPendingCount(), 0);
  t.tick(2000);
  assert.equal(t.context.HGToastRuntime.isShowing(), false);
}

// Early boot messages must survive until app-ready.
{
  const t = harness({ready:false});
  t.context.showToast("Oppstart", 1800);
  t.tick(5000);
  assert.equal(t.context.HGToastRuntime.getPendingCount(), 1);
  t.context.__HG_APP_READY__ = true;
  t.fire("hg:appReady");
  t.tick(260);
  assert.equal(t.toastText(), "Oppstart");
}

// A first-visit modal must not consume toasts behind the dialog.
{
  const t = harness({greeted:false});
  t.context.HGOnboarding = { FLAG_KEY:"hg_onboarding_shown_v1" };
  t.context.showToast("Etter velkomst", 2000);
  t.tick(600);
  assert.equal(t.context.HGToastRuntime.getPendingCount(), 1);
  t.storage.set("hg_onboarding_shown_v1", "1");
  t.fire("hg:onboardingClosed");
  t.tick(260);
  assert.equal(t.toastText(), "Etter velkomst");
}

// An incoming Civication task must not be hidden behind onboarding's welcome flag.
{
  const t = harness({greeted:false});
  t.context.HGOnboarding = { FLAG_KEY:"hg_onboarding_shown_v1" };
  t.storage.set("hg_civication_mode_v1", JSON.stringify({active:true,title:"Civication-oppdrag"}));
  t.context.showToast("Synlig med aktivt oppdrag", 2000);
  t.tick(260);
  assert.equal(t.toastText(), "Synlig med aktivt oppdrag");
}

// Reward cards and ordinary messages must use the same display slot.
{
  const t = harness();
  const events = [];
  t.context.showToast("Før belønning", 1000);
  t.context.HGToastRuntime.enqueueReward((done) => {
    events.push("reward-shown");
    t.context.setTimeout(() => { events.push("reward-closed"); done(); }, 800);
  });
  t.context.showToast("Etter belønning", 1000);
  t.tick(260);
  assert.equal(t.toastText(), "Før belønning");
  t.tick(1000);
  assert.equal(events.length, 0, "reward cannot cover an active ordinary toast");
  t.tick(120);
  assert.equal(events[0], "reward-shown");
  assert.equal(t.context.HGToastRuntime.isShowing(), true);
  t.tick(800);
  assert.equal(events[1], "reward-closed");
  t.tick(120);
  assert.equal(t.toastText(), "Etter belønning");
  assert.equal(t.context.HGToastRuntime.getPendingCount(), 0);
}

// The Civication mission survives a reload even when older than 24 hours.
{
  const t = harness();
  assert.equal(t.context.HGCivicationMode.saveSession({
    active:true, started_ts: Date.now()-3*86400000,
    title:"Oppdrag fra Civication", target_type:"place", place_id:"akershus_festning"
  }), true);
  assert.equal(t.context.HGCivicationMode.getSession().title, "Oppdrag fra Civication");
  assert.equal(t.context.HGCivicationMode.getSession().place_id, "akershus_festning");
  // Returning to Civication must not destroy the ongoing mission.
  t.context.HGCivicationMode.returnToCivication();
  assert.equal(t.context.location.href, "Civication.html");
  assert.equal(t.context.HGCivicationMode.getSession().place_id, "akershus_festning");
  assert.equal(t.storage.has("hg_civication_mode_v1"), true);
  // An explicit end remains the only operation that discards the session.
  t.context.HGCivicationMode.endSession();
  assert.equal(t.storage.has("hg_civication_mode_v1"), false);
}

// Only evidence for the requested quiz may complete a correct-answer mission.
{
  const t = harness();
  const mission = { active:true, target_type:"knowledge", completion_mode:"correct_answer",
    quiz_id:"quiz_specific", category_id:"historie" };
  t.storage.set("merits_by_category", JSON.stringify({ historie:{ points:80 } }));
  assert.equal(t.context.HGCivicationMode.evaluateCompletion(mission).completed, false);
  t.storage.set("hg_unlocks_v1", JSON.stringify({ byQuiz:{ quiz_specific:{ quizId:"quiz_specific" } } }));
  assert.equal(t.context.HGCivicationMode.evaluateCompletion(mission).completed, true);
}

// Every reward producer must enqueue through the shared notification runtime.
for (const file of ["nature-unlock-toast.js", "badge-unlock-toast.js", "person-place-unlock-toast.js"]) {
  const source = fs.readFileSync(path.join(__dirname, "..", "js/ui", file), "utf8");
  assert.match(source, /HGToastRuntime\?\.enqueueReward/, file);
  assert.match(source, /onFinished\?\.\(\)/, file);
}

// Welcome copy reflects the main game, not the test-only mode or card system.
assert.match(welcome, /<ul class="hg-onb-steps">/);
assert.equal((welcome.match(/<li/g) || []).length, 10, "ten unnumbered onboarding panels including both nature explorers");
for (const heading of [
  "Utforsk kartet og besøk steder", "Finn fauna", "Finn flora", "Stories", "Lesespor", "Psykologirommet",
  "Ta quiz og samle merker", "Se hva du har samlet", "Min profil", "Opplev Civication"
]) assert.ok(welcome.includes(heading), heading);
assert.doesNotMatch(welcome, /stedskort|quizkort|testmodus/i);
assert.match(welcome, /steder du har besøkt/);
assert.match(welcome, /interaktivt læringsmiljø/);
assert.match(welcome, /simulert livsverden/);
assert.match(welcome, /forme din egen vei/);
// The onboarding surface is neutral black; yellow remains an accent, not a background wash.
assert.match(styles, /\.hg-onb-inner\s*\{[\s\S]*?background: #090a0b;/);
assert.match(styles, /\.hg-onb-steps li\s*\{[\s\S]*?background: #151718;/);
assert.doesNotMatch(styles, /rgba\(246, 216, 34, 0\.11\)|rgba\(71, 69, 27/);

// Existing navigation targets remain intact, now embedded in the visible headings.
const cards = welcome.match(/<li\b[^>]*>[\s\S]*?<\/li>/g) || [];
const linkedHeadings = cards.filter((card) => /<strong><(?:a|button)\b[^>]*class="hg-onb-card-link"/.test(card));
assert.equal(linkedHeadings.length, 9, "all nine actionable cards link from their heading");
for (const card of cards) {
  assert.doesNotMatch(card, /<\/p>\s*<(?:a|button)\b[^>]*class="hg-onb-card-link"/, "no duplicate CTA below text");
}
for (const target of ['href="knowledge.html"', 'href="profile.html"', 'href="Civication.html"', 'href="finn-fauna.html"', 'href="finn-flora.html"',
  'data-hg-welcome-action="nearby"', 'data-hg-welcome-action="stories"',
  'data-hg-welcome-action="lesespor"', 'data-hg-welcome-action="psychology"']) {
  assert.ok(linkedHeadings.some((card) => card.includes(target)), target);
}
assert.ok(styles.includes(".hg-onb-steps li strong .hg-onb-card-link"), "heading links have dedicated styling");
assert.ok(styles.includes("grid-template-columns: repeat(2, minmax(0, 1fr))"), "desktop card grid");
assert.ok(styles.includes("@media (max-width: 700px)"), "mobile layout");
assert.match(welcome, /hg:onboardingClosed/);
assert.match(welcome, /mission && mission.active === true/);
assert.match(styles, /safe-area-inset-bottom/);
assert.match(styles, /has\(#hgCivicationModeToast\)/);
console.log("history go toast, welcome and Civication handoff contracts ok");
