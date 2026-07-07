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
  let currentData = makeEmptyInbox();
  let currentWarning = '';
  let currentRequestId = 0;

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
      #${SHEET_ID} .hg-social-meet-actions{display:flex;flex-wrap:wrap;gap:7px;margin-top:6px}
      #${SHEET_ID} .hg-social-meet-action{min-height:32px;border-radius:999px;border:1px solid rgba(247,226,163,.38);background:rgba(247,226,163,.14);color:#f7e2a3;font-size:12px;font-weight:900;cursor:pointer;padding:0 12px}
      #${SHEET_ID} .hg-social-meet-action[data-hg-social-meet-action=decline],#${SHEET_ID} .hg-social-meet-action[data-hg-social-meet-action=cancel]{border-color:rgba(255,255,255,.20);background:rgba(255,255,255,.08);color:rgba(255,255,255,.82)}
      #${SHEET_ID} .hg-social-meet-action:disabled{opacity:.55;cursor:wait}
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

  function makeEmptyInbox(){
    return { pending: [], accepted: [], completed: [], declined: [], cancelled: [], declinedCancelled: [] };
  }

  function normalizeInbox(inbox){
    const base = makeEmptyInbox();
    const source = inbox && typeof inbox === 'object' ? inbox : {};
    base.pending = list(source.pending);
    base.accepted = list(source.accepted);
    base.completed = list(source.completed);
    base.declined = list(source.declined);
    base.cancelled = list(source.cancelled);
    base.declinedCancelled = list(source.declinedCancelled).concat(base.declined, base.cancelled);
    return base;
  }

  function localInbox(){
    try {
      return normalizeInbox(root.HG_Spotmeeting?.getSpotmeetingInbox?.());
    } catch (_err) {
      return makeEmptyInbox();
    }
  }

  function bucketInvites(invites){
    const inbox = makeEmptyInbox();
    list(invites).forEach(invite => {
      const status = String(invite?.status || 'pending');
      if (status === 'accepted') inbox.accepted.push(invite);
      else if (status === 'completed') inbox.completed.push(invite);
      else if (status === 'declined') inbox.declined.push(invite);
      else if (status === 'cancelled') inbox.cancelled.push(invite);
      else inbox.pending.push(invite);
    });
    inbox.declinedCancelled = inbox.declined.concat(inbox.cancelled);
    return inbox;
  }

  async function loadInbox(options){
    const requestOptions = normalizeOptions(options);
    const backend = root.HG_SocialMeetBackend;
    if (backend?.listInvites) {
      try {
        const result = await backend.listInvites({ filter: requestOptions.filter, placeId: requestOptions.placeId, sourceSurface: requestOptions.sourceSurface });
        if (result?.ok === false) throw new Error(result.reason || 'social_meet_backend_error');
        if (result && Array.isArray(result.invites)) return { inbox: bucketInvites(result.invites), warning: '', mode: backend.health?.()?.mode || backend.health?.()?.backend || 'backend' };
        return { inbox: normalizeInbox(result), warning: '', mode: backend.health?.()?.mode || backend.health?.()?.backend || 'backend' };
      } catch (_err) {
        return { inbox: localInbox(), warning: 'Kunne ikke laste Social Meet. Viser lokal demo hvis tilgjengelig.', mode: 'fallback' };
      }
    }
    return { inbox: localInbox(), warning: '', mode: 'local' };
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
    const inbox = currentData;
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

  function inviteId(invite){
    return String(invite?.inviteId || invite?.id || '').trim();
  }

  function statusValue(invite){
    return String(invite?.status || 'pending').toLowerCase();
  }

  function statusText(status){
    if (status === 'pending') return 'Venter på svar.';
    if (status === 'accepted') return 'Avtalt.';
    if (status === 'completed') return 'Gjennomført.';
    if (status === 'declined') return 'Avslått.';
    if (status === 'cancelled') return 'Avbrutt.';
    return 'Status ukjent.';
  }

  function actionButton(action, label, id){
    return `<button class="hg-social-meet-action" type="button" data-hg-social-meet-action="${escapeHTML(action)}" data-hg-social-meet-invite-id="${escapeHTML(id)}">${escapeHTML(label)}</button>`;
  }

  function inviteActions(invite){
    const id = inviteId(invite);
    if (!id) return '';
    const status = statusValue(invite);
    if (status === 'pending') return `<div class="hg-social-meet-actions">${actionButton('accept', 'Godta', id)}${actionButton('decline', 'Avslå', id)}</div>`;
    if (status === 'accepted') return `<div class="hg-social-meet-actions">${actionButton('complete', 'Marker gjennomført', id)}${actionButton('cancel', 'Avbryt', id)}</div>`;
    return '';
  }

  function inviteCard(invite){
    const title = invite?.context?.title || invite?.context?.contextId || 'Sted';
    const person = invite?.targetDisplayName || invite?.targetUserId || 'Person';
    const preset = invite?.presetLabel || invite?.presetMessageId || 'Kunnskapsmøte';
    const status = statusValue(invite);
    return `<article class="hg-social-card"><strong>${escapeHTML(title)}</strong><p>${escapeHTML([person, preset].filter(Boolean).join(' · '))}</p><p>${escapeHTML(statusText(status))}</p>${inviteActions(invite)}</article>`;
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
        ${currentWarning ? `<p class="muted" role="status">${escapeHTML(currentWarning)}</p>` : ''}
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

  function renderLoading(options = currentOptions){
    const sheet = ensureSheet();
    const title = options.filter === 'place' ? getPlaceTitle(options.placeId) : 'Alle møter';
    sheet.innerHTML = `<section class="hg-social-meet-panel"><header class="hg-social-meet-head"><div><h2>Social Meet</h2><p class="hg-social-meet-context">${escapeHTML(title)}</p></div><button class="hg-social-meet-close" type="button" data-hg-social-meet-close="1" aria-label="Lukk">×</button></header><div class="hg-social-meet-body"><p class="muted" role="status">Laster Social Meet …</p></div></section>`;
  }

  function render(options = currentOptions){
    const sheet = ensureSheet();
    const title = options.filter === 'place' ? getPlaceTitle(options.placeId) : 'Alle møter';
    sheet.innerHTML = `<section class="hg-social-meet-panel"><header class="hg-social-meet-head"><div><h2>Social Meet</h2><p class="hg-social-meet-context">${escapeHTML(title)}</p></div><button class="hg-social-meet-close" type="button" data-hg-social-meet-close="1" aria-label="Lukk">×</button></header><div class="hg-social-meet-body">${renderProfileSocialContent(options)}</div></section>`;
  }

  async function open(options = {}){
    currentOptions = normalizeOptions(options);
    const sheet = ensureSheet();
    const requestId = ++currentRequestId;
    renderLoading(currentOptions);
    sheet.hidden = false;
    const closeButton = sheet.querySelector('[data-hg-social-meet-close]');
    if (closeButton instanceof HTMLElement) closeButton.focus();
    const loaded = await loadInbox(currentOptions);
    if (requestId !== currentRequestId) return { ok: true, options: currentOptions, stale: true };
    currentData = loaded.inbox;
    currentWarning = loaded.warning || '';
    render(currentOptions);
    return { ok: true, options: currentOptions, mode: loaded.mode };
  }

  function close(){
    const sheet = root.document?.getElementById?.(SHEET_ID);
    if (sheet) sheet.hidden = true;
  }

  async function refreshPlaceSummaryElement(element, placeId){
    const loaded = await loadInbox({ filter: 'place', placeId, sourceSurface: 'placeCardOnSite' });
    currentData = loaded.inbox;
    const html = renderPlaceSummary(placeId);
    if (element?.outerHTML !== html) element.outerHTML = html;
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
      refreshPlaceSummaryElement(box.querySelector('[data-hg-social-meet-onsite="1"]'), placeId);
    } else {
      box.insertAdjacentHTML('beforeend', html);
      refreshPlaceSummaryElement(box.querySelector('[data-hg-social-meet-onsite="1"]'), placeId);
    }
  }

  function enhanceOnSiteLinks(scope = root.document){
    const boxes = [];
    if (scope?.id === 'pcEventsBox') boxes.push(scope);
    if (scope?.querySelectorAll) boxes.push(...scope.querySelectorAll('#pcEventsBox'));
    boxes.forEach(enhanceEventsBox);
  }


  function statusForAction(action){
    if (action === 'accept') return 'accepted';
    if (action === 'decline') return 'declined';
    if (action === 'cancel') return 'cancelled';
    if (action === 'complete') return 'completed';
    return '';
  }

  function methodForAction(action){
    if (action === 'accept') return 'acceptInvite';
    if (action === 'decline') return 'declineInvite';
    if (action === 'cancel') return 'cancelInvite';
    if (action === 'complete') return 'completeInvite';
    return '';
  }

  function localMethodForAction(action){
    if (action === 'accept') return 'acceptSpotmeetingInvite';
    if (action === 'decline') return 'declineSpotmeetingInvite';
    if (action === 'cancel') return 'cancelSpotmeetingInvite';
    if (action === 'complete') return 'confirmSpotmeetingCompleted';
    return '';
  }

  async function callStatusAction(action, id){
    const backendMethod = methodForAction(action);
    const localMethod = localMethodForAction(action);
    const adapters = [root.HG_SocialMeetBackend, root.HG_SocialMeetAdapter].filter(Boolean);
    for (const adapter of adapters) {
      if (typeof adapter?.[backendMethod] !== 'function') continue;
      try {
        const result = await adapter[backendMethod](id);
        if (result?.ok === false) throw new Error(result.reason || 'social_meet_status_error');
        return { ok: true, mode: 'backend', result };
      } catch (_err) {
        break;
      }
    }
    if (typeof root.HG_Spotmeeting?.[localMethod] === 'function') {
      try {
        const result = await root.HG_Spotmeeting[localMethod](id);
        if (result?.ok === false) throw new Error(result.reason || 'spotmeeting_status_error');
        return { ok: true, mode: 'local', result };
      } catch (_err) {
        return { ok: false };
      }
    }
    return { ok: false };
  }

  async function refreshAfterStatusAction(inviteId, status){
    const loaded = await loadInbox(currentOptions);
    currentData = loaded.inbox;
    currentWarning = loaded.warning || '';
    render(currentOptions);
    root.dispatchEvent?.(new root.CustomEvent('hg:spotmeetingChanged', { detail: { source: 'socialMeetStatusAction', inviteId, status } }));
    root.dispatchEvent?.(new root.CustomEvent('updateProfile', { detail: { source: 'socialMeetStatusAction' } }));
  }

  async function handleStatusClick(target){
    const action = String(target.getAttribute('data-hg-social-meet-action') || '').trim();
    const inviteId = String(target.getAttribute('data-hg-social-meet-invite-id') || '').trim();
    const status = statusForAction(action);
    if (!inviteId || !status) return;
    target.disabled = true;
    currentWarning = '';
    const result = await callStatusAction(action, inviteId);
    if (!result.ok) {
      currentWarning = 'Kunne ikke oppdatere møteforslaget akkurat nå.';
      render(currentOptions);
      return;
    }
    await refreshAfterStatusAction(inviteId, status);
  }

  function handleClick(event){
    const target = event.target?.closest?.('[data-hg-social-meet-open], [data-hg-social-meet-close], [data-hg-social-meet-action]');
    if (!target) return;
    event.preventDefault?.();
    event.stopPropagation?.();
    if (target.hasAttribute('data-hg-social-meet-close')) { close(); return; }
    if (target.hasAttribute('data-hg-social-meet-action')) { handleStatusClick(target); return; }
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
    root.addEventListener?.('hg:spotmeetingChanged', () => { enhanceOnSiteLinks(); const sheet = root.document?.getElementById?.(SHEET_ID); if (sheet && !sheet.hidden) open(currentOptions); });
    enhanceOnSiteLinks();
  }

  function health(){
    return { ok: true, ui: 'socialMeetProfilePopup', sheetMounted: Boolean(root.document?.getElementById?.(SHEET_ID)), onSiteLinks: root.document?.querySelectorAll?.('[data-hg-social-meet-onsite="1"]')?.length || 0, hasRuntime: Boolean(root.HG_Spotmeeting) };
  }

  root.HG_SocialMeetUI = { open, close, render, renderPlaceSummary, getPlaceSummary, enhanceOnSiteLinks, bind, health };
  bind();
}());
