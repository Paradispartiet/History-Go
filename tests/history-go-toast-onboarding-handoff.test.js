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

// The Civication mission survives a reload even when older than 24 hours.
{
  const t = harness();
  assert.equal(t.context.HGCivicationMode.saveSession({
    active:true, started_ts: Date.now()-3*86400000,
    title:"Oppdrag fra Civication", target_type:"place", place_id:"akershus_festning"
  }), true);
  assert.equal(t.context.HGCivicationMode.getSession().title, "Oppdrag fra Civication");
  assert.equal(t.context.HGCivicationMode.getSession().place_id, "akershus_festning");
}

assert.match(welcome, /Besøk stedet og samle stedskortet/);
assert.match(welcome, /En perfekt quiz låser opp quizkortet/);
assert.match(welcome, /Civication/);
assert.match(welcome, /hg:onboardingClosed/);
assert.match(welcome, /mission && mission.active === true/);
assert.match(styles, /safe-area-inset-bottom/);
assert.match(styles, /has\(#hgCivicationModeToast\)/);
console.log("history go toast, welcome and Civication handoff contracts ok");
