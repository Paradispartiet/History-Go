// @ts-nocheck
(function(){
  'use strict';

  const root = typeof window !== 'undefined' ? window : globalThis;
  const SHEET_ID = 'hgSocialMeetSheet';
  const STYLE_ID = 'hg-social-meet-ui-style';
  const TABS = Object.freeze([
    ['pending', 'Venter'],
    ['accepted', 'Avtalt'],
    ['completed', 'Gjennomført'],
    ['declinedCancelled', 'Avslått']
  ]);

  let currentOptions = { filter: 'all', placeId: '', sourceSurface: 'unknown' };
  let currentTab = 'pending';

  function escapeHTML(value){
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function injectStyles(){
    if (!root.document || root.document.getElementById(STYLE_ID)) return;
    const style = root.document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${SHEET_ID}[hidden]{display:none!important}
      #${SHEET_ID}{position:fixed;inset:0;z-index:3010;display:flex;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.56);color:#fff;font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}
      #${SHEET_ID} .hg-social-meet-panel{width:min(560px,100%);max-height:min(84vh,740px);overflow:auto;margin:0 10px 10px;border:1px solid rgba(255,255,255,.18);border-radius:24px;background:#10110f;box-shadow:0 24px 70px rgba(0,0,0,.64)}
      #${SHEET_ID} .hg-social-meet-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:18px 18px 12px;border-bottom:1px solid rgba(255,255,255,.10)}
      #${SHEET_ID} h2{margin:0;font-size:22px;line-height:1.05}
      #${SHEET_ID} .hg-social-meet-context{margin:6px 0 0;color:rgba(255,255,255,.72);font-size:14px}
      #${SHEET_ID} .hg-social-meet-close{width:36px;height:36px;border-radius:999px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);color:#fff;font-size:20px;line-height:1;cursor:pointer}
      #${SHEET_ID} .hg-social-meet-body{display:grid;gap:13px;padding:15px 18px 18px}
      #${SHEET_ID} .hg-social-meet-note{margin:0;padding:10px 12px;border-radius:14px;background:rgba(255,255,255,.07);color:rgba(255,255,255,.82);font-size:14px;line-height:1.35}
      #${SHEET_ID} .hg-social-meet-tabs{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
      #${SHEET_ID} .hg-social-meet-tab{min-height:34px;border-radius:999px;border:1px solid rgba(255,255,255,.13);background:rgba(255,255,255,.07);color:#fff;font-size:12px;font-weight:800;cursor:pointer}
      #${SHEET_ID} .hg-social-meet-tab[aria-selected="true"]{border-color:rgba(247,226,163,.68);background:rgba(247,226,163,.14);color:#f7e2a3}
      #${SHEET_ID} .hg-social-meet-list{display:grid;gap:9px}
      #${SHEET_ID} .hg-social-meet-card{display:grid;gap:6px;padding:11px 12px;border-radius:15px;border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.24)}
      #${SHEET_ID} .hg-social-meet-card strong{display:block;font-size:15px}
      #${SHEET_ID} .hg-social-meet-card p{margin:0;color:rgba(255,255,255,.68);font-size:13px;line-height:1.35}
      #${SHEET_ID} .hg-social-meet-empty{margin:0;color:rgba(255,255,255,.72);font-size:14px;line-height:1.35}
      .pc-events-social-meet{display:grid;gap:6px;padding:7px 8px 8px;border-radius:14px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.055)}
      .pc-events-social-meet-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
      .pc-events-social-meet-title{color:#fff;font-weight:900;font-size:13px;line-height:1.1}
      .pc-events-social-meet-count{color:#f7e2a3;font-size:11px;font-weight:900;white-space:nowrap}
      .pc-events-social-meet-sub{margin:0;color:rgba(255,255,255,.66);font-size:11px;line-height:1.25}
      .pc-events-social-meet-open{min-height:30px;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:rgba(0,0,0,.22);color:#fff;font-size:11px;font-weight:850;cursor:pointer}
    `;
    root.document.head?.appendChild(style);
  }

  function list(value){ return Array.isArray(value) ? value : []; }

  function getInbox(){
    return root.HG_Spotmeeting?.getSpotmeetingInbox?.() || {
      pending: [], accepted: [], completed: [], declined: [], cancelled: [], declinedCancelled: []
    };
  }

  function normalizeOptions(options = {}){
    const filter = String(options.filter || 'all') === 'place' ? 'place' : 'all';
    const placeId = String(options.placeId || options.contextId || '').trim();
    return { filter, placeId: filter === 'place' ? placeId : '', sourceSurface: String(options.sourceSurface || 'unknown') };
  }

  function getPlaceTitle(placeId){
    const id = String(placeId || '').trim();
    const place = (Array.isArray(root.PLACES) ? root.PLACES : []).find(candidate => String(candidate?.id || '') === id);
    return String(place?.name || place?.title || id || 'Alle møter');
  }

  function getDeclinedCancelled(inbox){
    return list(inbox.declinedCancelled || []).concat(list(inbox.declined), list(inbox.cancelled));
  }

  function filterInvites(invites, options){
    const items = list(invites);
    if (options.filter !== 'place' || !options.placeId) return items;
    return items.filter(invite => String(invite?.context?.contextId || '') === String(options.placeId));
  }

  function sourceForTab(tab){
    const inbox = getInbox();
    return tab === 'declinedCancelled' ? getDeclinedCancelled(inbox) : inbox[tab];
  }

  function getPlaceSummary(placeId){
    const options = normalizeOptions({ filter: 'place', placeId });
    const pending = filterInvites(sourceForTab('pending'), options).length;
    const accepted = filterInvites(sourceForTab('accepted'), options).length;
    const active = pending + accepted;
    let label = 'Ingen aktive forslag her';
    if (pending === 1) label = '1 forslag venter her';
    else if (pending > 1) label = `${pending} forslag venter her`;
    else if (accepted === 1) label = '1 avtale her';
    else if (accepted > 1) label = `${accepted} avtaler her`;
    return { pending, accepted, active, label };
  }

  function tabButton(tab, label, options){
    const count = filterInvites(sourceForTab(tab), options).length;
    return `<button class="hg-social-meet-tab" type="button" data-hg-social-meet-tab="${escapeHTML(tab)}" aria-selected="${currentTab === tab ? 'true' : 'false'}">${escapeHTML(label)}${count ? ` ${count}` : ''}</button>`;
  }

  function statusText(status){
    if (status === 'pending') return 'Venter på svar.';
    if (status === 'accepted') return 'Avtalt.';
    if (status === 'completed') return 'Gjennomført.';
    if (status === 'declined') return 'Avslått.';
    if (status === 'cancelled') return 'Avbrutt.';
    return 'Status ukjent.';
  }

  function inviteCard(invite){
    const title = invite?.context?.title || invite?.context?.contextId || 'Sted';
    const person = invite?.targetDisplayName || invite?.targetUserId || 'Person';
    const preset = invite?.presetLabel || invite?.presetMessageId || 'Kunnskapsmøte';
    return `<article class="hg-social-meet-card"><strong>${escapeHTML(title)}</strong><p>${escapeHTML([person, preset].filter(Boolean).join(' · '))}</p><p>${escapeHTML(statusText(invite?.status))}</p></article>`;
  }

  function renderList(options){
    const items = filterInvites(sourceForTab(currentTab), options);
    if (!items.length) {
      const scope = options.filter === 'place' ? 'for dette stedet' : 'akkurat nå';
      return `<p class="hg-social-meet-empty">Ingen møter ${escapeHTML(scope)}.</p>`;
    }
    return `<div class="hg-social-meet-list">${items.map(inviteCard).join('')}</div>`;
  }

  function ensureSheet(){
    injectStyles();
    let sheet = root.document?.getElementById?.(SHEET_ID);
    if (!sheet) {
      sheet = root.document.createElement('div');
      sheet.id = SHEET_ID;
      sheet.hidden = true;
      sheet.setAttribute('role', 'dialog');
      sheet.setAttribute('aria-modal', 'true');
      root.document.body?.appendChild(sheet);
    }
    return sheet;
  }

  function render(options = currentOptions){
    const sheet = ensureSheet();
    const title = options.filter === 'place' ? getPlaceTitle(options.placeId) : 'Alle møter';
    sheet.innerHTML = `<section class="hg-social-meet-panel"><header class="hg-social-meet-head"><div><h2>Social Meet</h2><p class="hg-social-meet-context">${escapeHTML(title)}</p></div><button class="hg-social-meet-close" type="button" data-hg-social-meet-close="1" aria-label="Lukk">×</button></header><div class="hg-social-meet-body"><p class="hg-social-meet-note">Oppfølging av kunnskapsmøter. Kun forhåndsvalg og status — ikke live-posisjon.</p><div class="hg-social-meet-tabs" role="tablist" aria-label="Social Meet status">${TABS.map(([tab, label]) => tabButton(tab, label, options)).join('')}</div>${renderList(options)}</div></section>`;
  }

  function open(options = {}){
    currentOptions = normalizeOptions(options);
    const sheet = ensureSheet();
    render(currentOptions);
    sheet.hidden = false;
    const closeButton = sheet.querySelector('[data-hg-social-meet-close]');
    if (closeButton instanceof HTMLElement) closeButton.focus();
    return { ok: true, options: currentOptions };
  }

  function close(){
    const sheet = root.document?.getElementById?.(SHEET_ID);
    if (sheet) sheet.hidden = true;
  }

  function renderPlaceSummary(placeId){
    const summary = getPlaceSummary(placeId);
    return `<section class="pc-events-social-meet" data-hg-social-meet-onsite="1" data-hg-social-meet-place="${escapeHTML(placeId || '')}"><div class="pc-events-social-meet-head"><span class="pc-events-social-meet-title">Social Meet</span><span class="pc-events-social-meet-count">${escapeHTML(summary.active ? `${summary.active} aktiv` : '0 aktiv')}</span></div><p class="pc-events-social-meet-sub">${escapeHTML(summary.label)}</p><button class="pc-events-social-meet-open" type="button" data-hg-social-meet-open="place" data-hg-social-meet-place="${escapeHTML(placeId || '')}">Åpne Social Meet</button></section>`;
  }

  function getPlaceIdFromEventsBox(box){
    const card = root.document?.getElementById?.('placeCard');
    const currentPlaceId = String(card?.dataset?.currentPlaceId || '').trim();
    const panelPlaceId = String(box?.querySelector?.('[data-hg-spotmeeting-onsite]')?.getAttribute?.('data-hg-spotmeeting-place') || '').trim();
    return currentPlaceId || panelPlaceId || '';
  }

  function enhanceEventsBox(box){
    if (!box?.querySelector) return;
    const placeId = getPlaceIdFromEventsBox(box);
    if (!placeId) return;
    const existing = box.querySelector('[data-hg-social-meet-onsite="1"]');
    const html = renderPlaceSummary(placeId);
    if (existing) {
      if (existing.outerHTML !== html) existing.outerHTML = html;
    } else {
      box.insertAdjacentHTML('beforeend', html);
    }
  }

  function enhanceOnSiteLinks(scope = root.document){
    const boxes = [];
    if (scope?.id === 'pcEventsBox') boxes.push(scope);
    if (scope?.querySelectorAll) boxes.push(...scope.querySelectorAll('#pcEventsBox'));
    boxes.forEach(enhanceEventsBox);
  }

  function handleClick(event){
    const target = event.target?.closest?.('[data-hg-social-meet-open], [data-hg-social-meet-close], [data-hg-social-meet-tab]');
    if (!target) return;
    event.preventDefault?.();
    event.stopPropagation?.();
    if (target.hasAttribute('data-hg-social-meet-close')) { close(); return; }
    if (target.hasAttribute('data-hg-social-meet-tab')) { currentTab = String(target.getAttribute('data-hg-social-meet-tab') || 'pending'); render(currentOptions); return; }
    const mode = String(target.getAttribute('data-hg-social-meet-open') || 'all');
    const placeId = String(target.getAttribute('data-hg-social-meet-place') || '').trim();
    const explicitSource = String(target.getAttribute('data-hg-social-meet-source') || '').trim();
    const filter = mode === 'place' ? 'place' : 'all';
    const sourceSurface = explicitSource || (filter === 'place' ? 'placeCardOnSite' : 'globalMenu');
    open({ filter, placeId, sourceSurface });
  }

  function bind(){
    if (root.__HG_SOCIAL_MEET_UI_BOUND__) return;
    root.__HG_SOCIAL_MEET_UI_BOUND__ = true;
    injectStyles();
    root.document?.addEventListener?.('click', handleClick, true);
    root.addEventListener?.('hg:spotmeetingChanged', () => enhanceOnSiteLinks());
    enhanceOnSiteLinks();
  }

  function health(){
    return { ok: true, ui: 'socialMeetSheet', sheetMounted: Boolean(root.document?.getElementById?.(SHEET_ID)), onSiteLinks: root.document?.querySelectorAll?.('[data-hg-social-meet-onsite="1"]')?.length || 0, hasRuntime: Boolean(root.HG_Spotmeeting) };
  }

  root.HG_SocialMeetUI = { open, close, render, renderPlaceSummary, getPlaceSummary, enhanceOnSiteLinks, bind, health };
  bind();
}());
