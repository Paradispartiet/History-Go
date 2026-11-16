#!/usr/bin/env node
// Exercise the production delegated day button; the clock is controlled only
// by the DayProgression stub, never by the UI under test.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('js/Civication/ui/CivicationNextActionUI.js', 'utf8');

async function check({ result = { advanced: true }, increment = true, error = false, switchPopup = false, map = false, ordinary = false } = {}) {
  let day = 1, calls = 0, closed = 0, navigated = 0, focused = 0;
  let owns = true, resolveTransition;
  const listeners = {};
  const classes = new Set(['is-open', 'civi-inbox-active-action']);
  const popup = { classList: { contains: () => true }, contains: () => owns };
  const button = { disabled: false, closest: s => s === '[data-civi-next-action-advance]' ? button : null };
  let bodyMarkup = '';
  const body = {
    isConnected: true,
    querySelector: s => s === '[data-civi-next-action-advance]:disabled' && button.disabled ? button : null,
    get innerHTML() { return bodyMarkup; },
    set innerHTML(value) { bodyMarkup = value; button.disabled = false; }
  };
  const modal = {
    isConnected: true,
    classList: { contains: c => classes.has(c), add: c => classes.add(c), remove: c => classes.delete(c) },
    closest: () => popup,
    contains: target => target === button,
    setAttribute() {},
    addEventListener: (type, fn) => { listeners[type] = fn; }
  };
  // ensureModal reuses mounted cards; bind delegation through its normal
  // creation path by returning no existing modal on the first lookup.
  let mounted = false;
  const inbox = { querySelector: () => ({ firstChild: null, insertBefore: () => { mounted = true; } }) };
  const document = {
    body: { classList: { contains: c => map && c === 'civi-mapmode' } },
    getElementById: id => id === 'civiInboxSection' ? inbox : id === 'civiNextActionModal' && mounted ? modal : id === 'civiNextActionModalBody' ? body : null,
    createElement: tag => tag === 'section' ? modal : body,
    querySelector: s => s.includes('civi-footer') ? { click() { navigated++; } } : s === '#civiLifestoryPanel h3' ? { setAttribute() {}, focus() { focused++; } } : null
  };
  modal.appendChild = () => {};
  const win = {
    addEventListener() {}, dispatchEvent() {},
    CivicationCalendar: { getClock: () => ({ dayIndex: day }) },
    CivicationNextActionSelector: { getCurrent: () => ({ id: 'new-day', canStartNewDay: !ordinary, canAdvancePhase: true }) },
    CivicationDayProgression: {
      inspect: () => ({ phase: 'day_end' }),
      advancePhaseIfReady() { calls++; return new Promise(resolve => { resolveTransition = resolve; }); }
    },
    CivicationMiniSectionsUI: { closePopup() { closed++; owns = false; } }
  };
  vm.runInNewContext(source, { window: win, document, console, Event: class {}, setTimeout: fn => { fn(); } });
  win.CivicationNextActionUI.render();
  const click = () => listeners.click({ target: button, preventDefault() {} });
  click();
  await new Promise(setImmediate);
  if (!ordinary) {
    assert.equal(calls, 1);
    // Even a replacement enabled button cannot acquire a second day change.
    button.disabled = false;
    click();
    await new Promise(setImmediate);
    assert.equal(calls, 1);
    if (switchPopup) owns = false;
    if (increment) day++;
    resolveTransition(error ? Promise.reject(new Error('storage unavailable')) : result);
  }
  await new Promise(setImmediate);
  await new Promise(setImmediate);
  const shouldReveal = !ordinary && !error && result?.advanced === true && increment && !switchPopup && !map;
  assert.equal(closed, shouldReveal ? 1 : 0, 'dismiss only the originating inbox after confirmed rollover');
  assert.equal(navigated, shouldReveal ? 1 : 0, 'navigate only after confirmed rollover');
  assert.equal(focused, shouldReveal ? 1 : 0, 'focus the new story only when revealing it');
  assert.equal(button.disabled, false, 'a refused or failed transition remains retryable');
  return calls;
}

(async () => {
  await check();
  await check({ result: { advanced: false }, increment: false });
  await check({ result: null, increment: false });
  await check({ result: { advanced: true }, increment: false });
  await check({ error: true, increment: false });
  await check({ switchPopup: true });
  await check({ map: true });
  await check({ ordinary: true });
  console.log('PASS: day rollover, refusal, no-op, exception, retry, duplicate activation and changed-surface handoff');
})().catch(error => { console.error(error); process.exitCode = 1; });
