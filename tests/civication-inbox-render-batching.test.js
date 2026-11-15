const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function fixture(embedded = false) {
  const listeners = new Map();
  const timers = new Map();
  let timerId = 0;
  let selectionReads = 0;
  let renders = 0;
  let current = 'mail-0';
  const inbox = Array.from({ length: 80 }, (_, index) => ({
    id: 'mail-' + index, status: 'open', event: { id: 'mail-' + index,
      subject: 'Sak ' + index, choices: [{ id: 'own-' + index, label: 'Eget valg ' + index }] }
  }));
  const host = { innerHTML: '', querySelector: () => null, querySelectorAll: () => [],
    addEventListener() {}, classList: { toggle() {} } };
  const document = { readyState: 'loading', activeElement: null,
    addEventListener() {}, getElementById: id => id === 'civiInbox' || (embedded && id === 'civiInboxSection') ? host : null };
  const window = {
    addEventListener(name, fn) { listeners.set(name, fn); },
    setTimeout(fn, delay) { const id = ++timerId; timers.set(id, { fn, delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
    CivicationMailEngine: { getInbox: () => inbox },
    CivicationMiniSectionsUI: { ownsTopAction: true },
    CivicationNextActionSelector: { getCurrent() { selectionReads++; return current ? { id: current } : null; } },
    CivicationNextActionUI: { render() { renders++; } }
  };
  const context = { window, document, console, localStorage: { getItem: () => null } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/Civication/ui/CivicationInboxTopActionUI.js'), 'utf8'), context);
  return { window, host, inbox, timers, listeners,
    setCurrent(id) { current = id; },
    stats: () => ({ selectionReads, renders }),
    flush(delay) {
      for (const [id, timer] of [...timers]) {
        if (timer.delay === delay) { timers.delete(id); timer.fn(); }
      }
    }
  };
}

{
  const f = fixture();
  f.window.CivicationInboxTopActionUI.renderSections();
  assert.equal(f.stats().selectionReads, 1, 'one 80-row render selects the active action once');
  assert.ok(f.host.innerHTML.includes('data-choice-id="own-0"'));
  assert.ok(!f.host.innerHTML.includes('data-choice-id="own-1"'), 'another message never borrows the active controls');
  f.setCurrent('mail-1');
  f.window.CivicationInboxTopActionUI.renderSections();
  assert.equal(f.stats().selectionReads, 2, 'next render re-reads current state');
  assert.ok(f.host.innerHTML.includes('data-choice-id="own-1"'));
  assert.ok(!f.host.innerHTML.includes('data-choice-id="own-0"'));
  f.setCurrent(null);
  f.window.CivicationInboxTopActionUI.renderSections();
  assert.ok(!f.host.innerHTML.includes('data-civi-inbox-answer'), 'empty selection retains no stale answer controls');
}
{
  const f = fixture(true);
  f.window.CivicationInboxTopActionUI.renderSections();
  assert.equal(f.stats().selectionReads, 1, 'embedded inbox uses the same single selection');
  assert.ok(f.host.innerHTML.includes('80 åpne'), 'embedded active mail remains included in the open count');
  assert.ok(!f.host.innerHTML.includes('data-civi-inbox-answer'), 'history never duplicates embedded answer controls');
}
{
  const f = fixture();
  for (let i = 0; i < 8; i++) {
    f.listeners.get('civi:inboxChanged')();
    f.listeners.get('updateProfile')();
  }
  f.flush(0);
  assert.equal(f.stats().renders, 1, 'same-turn notification burst performs one immediate inbox render');
  f.setCurrent('mail-2');
  f.flush(260);
  assert.equal(f.stats().renders, 2, 'one trailing readiness refresh is preserved');
  assert.ok(f.host.innerHTML.includes('data-choice-id="own-2"'), 'trailing render reads latest selection');
}
console.log('PASS: inbox render snapshot stays fresh and notification bursts are coalesced.');
