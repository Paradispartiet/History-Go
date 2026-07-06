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
      #${SHEET_ID} .hg-social-meet-panel{width:min(620px,100%);max-height:min(86vh,760px);overflow:auto;margin:0 10px 10px;border:1px solid rgba(255,255,255,.18);border-radius:24px;background:#10110f;box-shadow:0 24px 70px rgba(0,0,0,.64)}
      #${SHEET_ID} .hg-social-meet-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:18px 18px 12px;border-bottom:1px solid rgba(255,255,255,.10)}
      #${SHEET_ID} h2{margin:0;font-size:22px;line-height:1.05}
      #${SHEET_ID} .hg-social-meet-context{margin:6px 0 0;color:rgba(255,255,255,.72);font-size:14px}
      #${SHEET_ID} .hg-social-meet-close{width:36px;height:36px;border-radius:999px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);color:#fff;font-size:20px;line-height:1;cursor:pointer}
      #${SHEET_ID} .hg-social-meet-body{display:grid;gap:12px;padding:15px 18px 18px}
      #${SHEET_ID} .profile-social-stack{display:grid;gap:12px}
      #${SHEET_ID} .section-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
      #${SHEET_ID} .section-head h2{font-size:20px}
      #${SHEET_ID} .section-meta,#${SHEET_ID} .muted{color:rgba(255,255,255,.66);font-size:13px;line-height:1.35}
      #${SHEET_ID} .social-mini-profile-anchor{padding:10px 12px;border-radius:14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.10);font-size:13px;color:rgba(255,255,255,.78)}
      #${SHEET_ID} .hg-social-block{display:grid;gap:7px;padding:10px 12px;border-radius:15px;border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.22)}
      #${SHEET_ID} .hg-social-block-title{font-weight:900;color:#fff;font-size:14px}
      #${SHEET_ID} .hg-social-card{display:grid;gap:4px;padding:9px 10px;border-radius:12px;background:rgba(255,255,255,.055)}
      #${SHEET_ID} .hg-social-card strong{font-size:14px}
      #${SHEET_ID} .hg-social-card p{margin:0;color:rgba(255,255,255,.68);font-size:12px;line-height:1.35}
      #${SHEET_ID} .hg-social-empty{margin:0;color:rgba(255,255,255,.60);font-size:13px;line-height:1.35}
      .pc-events-spotmeeting{display:none!important}
      .pc-events-social-meet{display:grid;gap:6px;padding:8px;border-radius:14px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.055)}
      .pc-events-social-meet-title{color:#fff;font-weight:900;font-size:13px;line-height:1.1}
      .pc-events-social-meet-sub{margin:0;color:rgba(255,255,255,.66);font-size:11px;line-height:1.25}
      .pc-events-social-meet-open{min-height:32px;border-radius:999px;border:1px solid rgba(247,226,163,.38);background:rgba(247,226,163,.14);color:#f7e2a3;font-size:12px;font-weight:900;cursor:pointer;text-align:center}
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

  function sourceForStatus(status, options){
    const inbox = getInbox();
    const source = status === 'declinedCancelled' ? getDeclinedCancelled(inbox) : inbox[status];
    return filterInvites(source, options);
  }

  function getPlaceSummary(placeId){
    const options = normalizeOptions({ filter: 'place', placeId });
    const pending = sourceForStatus('pending', options).length;
    const accepted = sourceForStatus('accepted', options).length;
    const active = pending + accepted;
    let label = 'Ingen aktive forslag her';
    if (pending === 1) label = '1 forslag venter her';
    else if (pending > 1) label = `${pending} forslag venter her`;
    else if (accepted === 1) label = '1 avtale her';
    else if (accepted > 1) label = `${accepted} avtaler her`;
    return { pending, accepted, active, label };
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
    return `<article class="hg-social-card"><strong>${escapeHTML(title)}</strong><p>${escapeHTML([person, preset].filter(Boolean).join(' · '))}</p><p>${escapeHTML(statusText(invite?.status))}</p></article>`;
  }

  function renderBlock(title, items, empty){
    return `<div class="hg-social-block"><div class="hg-social-block-title">${escapeHTML(title)}</div>${items.length ? items.map(inviteCard).join('') : `<p class="hg-social-empty">${escapeHTML(empty)}</p>`}</div>`;
  }

  function renderProfileSocialContent(options){
    const pending = sourceForStatus('pending', options);
    const accepted = sourceForStatus('accepted', options);
    const completed = sourceForStatus('completed', options);
    const closed = sourceForStatus('declinedCancelled', options);
    return `
      <section class="profile-section knowledge-match-section profile-social-stack" id="hgSocialMeetPopupLayer" aria-label="Social Meet">
        <div class="section-head">
          <h2>Social Meet</h2>
          <span class="section-meta">Kunnskapsmøter, læringssirkler og sosial læringshistorikk.</span>
        </div>
        <p class="muted">Personvern styres i ⚙️ Innstillinger.</p>
        <div class="social-mini-profile-anchor">MiniProfile</div>
        <div id="hg-meet-invite-inbox">${renderBlock('Møteforslag', pending, 'Ingen møteforslag akkurat nå.')}</div>
        <div id="hg-spotmeeting-inbox">${renderBlock('Kunnskapsmøter', pending, 'Ingen ventende kunnskapsmøter.')}</div>
        <div id="hg-confirmed-meets">${renderBlock('Avtalte møter', accepted, 'Ingen avtalte møter.')}</div>
        <div id="hg-social-progression">${renderBlock('Sosial progresjon', completed, 'Ingen gjennomførte møter ennå.')}</div>
        <div id="hg-learning-circles">${renderBlock('Læringssirkler', [], 'Ingen læringssirkler ennå.')}</div>
        <div id="hg-circle-activity">${renderBlock('Sirkelaktivitet', [], 'Ingen sirkelaktivitet ennå.')}</div>
        <div id="hg-social-history">${renderBlock('Sosial læringshistorikk', completed.concat(closed), 'Ingen sosial læringshistorikk ennå.')}</div>
        <div id="hg-social-smoke-panel"></div>
      </section>
    `;
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
    sheet.innerHTML = `<section class="hg-social-meet-panel"><header class="hg-social-meet-head"><div><h2>Social Meet</h2><p class="hg-social-meet-context">${escapeHTML(title)}</p></div><button class="hg-social-meet-close" type="button" data-hg-social-meet-close="1" aria-label="Lukk">×</button></header><div class="hg-social-meet-body">${renderProfileSocialContent(options)}</div></section>`;
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
    return `<section class="pc-events-social-meet" data-hg-social-meet-onsite="1" data-hg-social-meet-place="${escapeHTML(placeId || '')}"><span class="pc-events-social-meet-title">Social Meet</span><p class="pc-events-social-meet-sub">${escapeHTML(summary.label)}</p><button class="pc-events-social-meet-open" type="button" data-hg-social-meet-open="place" data-hg-social-meet-place="${escapeHTML(placeId || '')}">Åpne Social Meet</button></section>`;
  }

  function getPlaceIdFromEventsBox(box){
    const card = root.document?.getElementById?.('placeCard');
    return String(card?.dataset?.currentPlaceId || box?.querySelector?.('[data-knowledge-spot-match]')?.getAttribute?.('data-knowledge-spot-match') || '').trim();
  }

  function cleanupWrongOnSiteContent(box){
    box?.querySelectorAll?.('.pc-events-spotmeeting,[data-hg-spotmeeting-onsite="1"]').forEach(node => node.remove());
  }

  function enhanceEventsBox(box){
    if (!box?.querySelector) return;
    cleanupWrongOnSiteContent(box);
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
    const target = event.target?.closest?.('[data-hg-social-meet-open], [data-hg-social-meet-close]');
    if (!target) return;
    event.preventDefault?.();
    event.stopPropagation?.();
    if (target.hasAttribute('data-hg-social-meet-close')) { close(); return; }
    const mode = String(target.getAttribute('data-hg-social-meet-open') || 'all');
    const placeId = String(target.getAttribute('data-hg-social-meet-place') || '').trim();
    const filter = mode === 'place' ? 'place' : 'all';
    open({ filter, placeId, sourceSurface: filter === 'place' ? 'placeCardOnSite' : 'globalMenu' });
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
    return { ok: true, ui: 'socialMeetProfilePopup', sheetMounted: Boolean(root.document?.getElementById?.(SHEET_ID)), onSiteLinks: root.document?.querySelectorAll?.('[data-hg-social-meet-onsite="1"]')?.length || 0, hasRuntime: Boolean(root.HG_Spotmeeting) };
  }

  root.HG_SocialMeetUI = { open, close, render, renderPlaceSummary, getPlaceSummary, enhanceOnSiteLinks, bind, health };
  bind();
}());
