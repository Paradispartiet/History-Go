// @ts-nocheck
(function(){
  'use strict';

  const root = typeof window !== 'undefined' ? window : globalThis;
  const SHEET_ID = 'hgSpotmeetingSheet';
  const STYLE_ID = 'hg-spotmeeting-ui-style';

  const PRESET_BY_ACTION = Object.freeze({
    match: 'compare_place_learning',
    place: 'compare_place_learning',
    quiz: 'quiz_together',
    observation: 'shared_observation',
    route: 'route_one_day',
    topic: 'meet_topic',
    circle: 'meet_topic'
  });

  const CONTEXT_TYPE_BY_ACTION = Object.freeze({
    match: 'place',
    place: 'place',
    quiz: 'quiz',
    observation: 'observation',
    route: 'route',
    topic: 'topic',
    circle: 'circle'
  });

  const ACTION_LABELS = Object.freeze({
    match: 'Se kunnskapsmatcher',
    quiz: 'Inviter til quiz',
    observation: 'Inviter til observasjon',
    route: 'Inviter til rute',
    topic: 'Møtes rundt tema'
  });

  const ACTION_HELPERS = Object.freeze({
    match: 'Finn folk som matcher stedets tema og kunnskap.',
    quiz: 'Foreslå å ta en quiz sammen senere.',
    observation: 'Foreslå en felles observasjon knyttet til stedet.',
    route: 'Foreslå å gå en historisk rute en dag.',
    topic: 'Foreslå å møtes rundt et felles tema.'
  });

  const ACTIONS = Object.freeze(['match', 'quiz', 'observation', 'route']);
  let currentState = null;

  function isTestMode(){
    try { return root.localStorage?.getItem('HG_TEST_MODE') === '1'; }
    catch { return false; }
  }

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
      #${SHEET_ID}{position:fixed;inset:0;z-index:3000;display:flex;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.54);color:#fff;font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}
      #${SHEET_ID} .hg-spotmeeting-panel{width:min(560px,100%);max-height:min(82vh,720px);overflow:auto;margin:0 10px 10px;border:1px solid rgba(255,255,255,.18);border-radius:24px;background:#11100d;box-shadow:0 24px 70px rgba(0,0,0,.62)}
      #${SHEET_ID} .hg-spotmeeting-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:18px 18px 12px;border-bottom:1px solid rgba(255,255,255,.10)}
      #${SHEET_ID} h2{margin:0;font-size:22px;line-height:1.05}
      #${SHEET_ID} .hg-spotmeeting-context{margin:6px 0 0;color:rgba(255,255,255,.76);font-size:14px}
      #${SHEET_ID} .hg-spotmeeting-close{width:36px;height:36px;border-radius:999px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);color:#fff;font-size:20px;line-height:1;cursor:pointer}
      #${SHEET_ID} .hg-spotmeeting-body{display:grid;gap:14px;padding:16px 18px 18px}
      #${SHEET_ID} .hg-spotmeeting-note{margin:0;padding:10px 12px;border-radius:14px;background:rgba(255,255,255,.07);color:rgba(255,255,255,.82);font-size:14px;line-height:1.35}
      #${SHEET_ID} .hg-spotmeeting-actions{display:grid;gap:8px}
      #${SHEET_ID} .hg-spotmeeting-action{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 12px;border-radius:14px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.07);color:#fff;text-align:left;cursor:pointer}
      #${SHEET_ID} .hg-spotmeeting-action strong{display:block;font-size:15px}
      #${SHEET_ID} .hg-spotmeeting-action small{display:block;margin-top:2px;color:rgba(255,255,255,.66);font-size:12px}
      #${SHEET_ID} .hg-spotmeeting-action[aria-pressed="true"]{border-color:rgba(247,226,163,.68);background:rgba(247,226,163,.12)}
      #${SHEET_ID} .hg-spotmeeting-status{margin:0;color:rgba(255,255,255,.78);font-size:14px;line-height:1.35}
      #${SHEET_ID} .hg-spotmeeting-candidates{display:grid;gap:10px}
      #${SHEET_ID} .hg-spotmeeting-candidate{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;padding:11px 12px;border-radius:14px;border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.24)}
      #${SHEET_ID} .hg-spotmeeting-candidate strong{display:block}
      #${SHEET_ID} .hg-spotmeeting-candidate p{margin:3px 0 0;color:rgba(255,255,255,.66);font-size:13px;line-height:1.3}
      #${SHEET_ID} .hg-spotmeeting-candidate button,#${SHEET_ID} .hg-spotmeeting-link{min-height:36px;padding:0 12px;border-radius:999px;border:1px solid rgba(247,226,163,.42);background:#f7e2a3;color:#241a0d;font-weight:800;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}
      #${SHEET_ID} button:disabled{opacity:.55;cursor:default}
      .pc-people-spotmeeting-cta{width:100%;min-height:36px;border-radius:999px;border:1px solid rgba(247,226,163,.42);background:rgba(247,226,163,.12);color:#f7e2a3;font-weight:800;cursor:pointer}
      .pc-people-spotmeeting-note{margin:0;color:rgba(255,255,255,.66);font-size:12px;line-height:1.35}
      .pc-events-spotmeeting{display:grid;gap:7px;padding:7px 8px 8px;border-radius:14px;border:1px solid rgba(247,226,163,.22);background:rgba(247,226,163,.08)}
      .pc-events-spotmeeting-head{display:grid;gap:1px}
      .pc-events-spotmeeting-title{color:#f7e2a3;font-weight:900;font-size:13px;line-height:1.1}
      .pc-events-spotmeeting-sub{color:rgba(255,255,255,.66);font-size:11px;line-height:1.15}
      .pc-events-spotmeeting-actions{display:grid;grid-template-columns:1fr 1fr;gap:5px}
      .pc-events-spotmeeting-action{min-height:30px;padding:0 7px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:rgba(0,0,0,.24);color:#fff;font-size:11px;font-weight:800;line-height:1.1;cursor:pointer}
      .pc-events-spotmeeting-action[data-hg-spotmeeting-action="match"]{grid-column:1/-1;background:rgba(247,226,163,.16);color:#f7e2a3;border-color:rgba(247,226,163,.32)}
    `;
    root.document.head?.appendChild(style);
  }

  function getPlaceById(placeId){
    const id = String(placeId || '').trim();
    const places = Array.isArray(root.PLACES) ? root.PLACES : [];
    return places.find(place => String(place?.id || '').trim() === id) || null;
  }

  function getCurrentPlace(anchor){
    const card = anchor?.closest?.('#placeCard') || root.document?.getElementById?.('placeCard');
    const sectionPlaceId = anchor?.closest?.('[data-hg-spotmeeting-place]')?.getAttribute?.('data-hg-spotmeeting-place');
    const id = String(card?.dataset?.currentPlaceId || sectionPlaceId || '').trim();
    return getPlaceById(id) || { id: id || 'sted', name: id || 'Sted' };
  }

  function getActivePlaceIdFromOnSiteBox(box){
    const card = root.document?.getElementById?.('placeCard');
    const currentPlaceId = String(card?.dataset?.currentPlaceId || '').trim();
    const inlinePlaceId = String(box?.querySelector?.('[data-knowledge-spot-match]')?.getAttribute?.('data-knowledge-spot-match') || '').trim();
    return currentPlaceId || inlinePlaceId || 'sted';
  }

  function buildContext(placeOrOptions, options = {}){
    const raw = placeOrOptions && typeof placeOrOptions === 'object' ? placeOrOptions : {};
    if (raw.contextType || raw.contextId || raw.sourceSurface) {
      const preferredAction = String(raw.preferredAction || options.preferredAction || 'match');
      const contextType = String(raw.contextType || CONTEXT_TYPE_BY_ACTION[preferredAction] || 'place').trim();
      const contextId = String(raw.contextId || raw.id || raw.placeId || raw.name || 'sted').trim();
      const title = String(raw.title || raw.name || contextId || 'Sted').trim();
      return {
        contextType,
        contextId,
        title,
        reason: String(raw.reason || options.reason || 'Kunnskapsmøte rundt dette stedet').trim(),
        sourceSurface: String(raw.sourceSurface || options.sourceSurface || 'placeCardOnSite').trim(),
        preferredAction
      };
    }
    return buildPlaceContext(raw, options);
  }

  function buildPlaceContext(place, options = {}){
    const preferredAction = String(options.preferredAction || 'match');
    const placeId = String(place?.id || place?.placeId || place?.name || 'sted').trim();
    const title = String(place?.name || place?.title || placeId || 'Sted').trim();
    return {
      contextType: String(options.contextType || CONTEXT_TYPE_BY_ACTION[preferredAction] || 'place'),
      contextId: placeId,
      title,
      reason: String(options.reason || 'Kunnskapsmøte rundt dette stedet'),
      sourceSurface: String(options.sourceSurface || 'placeCardOnSite'),
      preferredAction
    };
  }

  function presetLabel(presetMessageId){
    const presets = root.HG_Spotmeeting?.getSpotmeetingConfig?.()?.presetMessages || [];
    const match = presets.find(preset => preset?.presetMessageId === presetMessageId);
    return String(match?.label || presetMessageId);
  }

  function getDuplicateInvite(targetUserId, context, presetMessageId){
    const inbox = root.HG_Spotmeeting?.getSpotmeetingInbox?.() || {};
    const invites = []
      .concat(Array.isArray(inbox.pending) ? inbox.pending : [])
      .concat(Array.isArray(inbox.accepted) ? inbox.accepted : [])
      .concat(Array.isArray(inbox.completed) ? inbox.completed : []);
    return invites.find(invite => (
      String(invite?.targetUserId || '') === String(targetUserId || '') &&
      String(invite?.presetMessageId || '') === String(presetMessageId || '') &&
      String(invite?.context?.contextType || '') === String(context?.contextType || '') &&
      String(invite?.context?.contextId || '') === String(context?.contextId || '')
    ));
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

  function actionButton(action, selectedAction){
    return `<button class="hg-spotmeeting-action" type="button" data-hg-spotmeeting-action="${escapeHTML(action)}" aria-pressed="${selectedAction === action ? 'true' : 'false'}"><span><strong>${escapeHTML(ACTION_LABELS[action] || action)}</strong><small>${escapeHTML(ACTION_HELPERS[action] || '')}</small></span><span aria-hidden="true">›</span></button>`;
  }

  function onSiteActionButton(action){
    return `<button class="pc-events-spotmeeting-action" type="button" data-hg-spotmeeting-action="${escapeHTML(action)}">${escapeHTML(ACTION_LABELS[action] || action)}</button>`;
  }

  function renderOnSitePanel(placeId){
    return `<section class="pc-events-spotmeeting" data-hg-spotmeeting-onsite="1" data-hg-spotmeeting-place="${escapeHTML(placeId || 'sted')}"><div class="pc-events-spotmeeting-head"><span class="pc-events-spotmeeting-title">Kunnskapsmøte</span><span class="pc-events-spotmeeting-sub">Basert på tema · ikke posisjon</span></div><div class="pc-events-spotmeeting-actions" aria-label="Kunnskapsmøte på stedet">${ACTIONS.map(onSiteActionButton).join('')}</div></section>`;
  }

  function renderStatus(message, kind = 'status'){
    return `<p class="hg-spotmeeting-status" data-hg-spotmeeting-state="${escapeHTML(kind)}">${escapeHTML(message)}</p>`;
  }

  function renderCandidates(context, action){
    const sheet = ensureSheet();
    const target = sheet.querySelector('[data-hg-spotmeeting-candidates]');
    if (!target) return;

    if (!root.HG_Spotmeeting) {
      target.innerHTML = renderStatus('Kunnskapsmøte er ikke lastet ennå.', 'error');
      return;
    }

    if (!isTestMode()) {
      target.innerHTML = `${renderStatus('Ekte Spotmeeting krever trygg backend. Demo kan testes i TEST_MODE.', 'backendDisabled')}<a class="hg-spotmeeting-link" href="profile.html#socialmeet">Åpne Social Meet</a>`;
      return;
    }

    const contextForAction = Object.assign({}, context, {
      contextType: CONTEXT_TYPE_BY_ACTION[action] || context.contextType || 'place'
    });
    const result = root.HG_Spotmeeting.getSpotmeetingSuggestions(contextForAction);
    const suggestions = Array.isArray(result?.suggestions) ? result.suggestions : [];
    const presetMessageId = PRESET_BY_ACTION[action] || PRESET_BY_ACTION.match;
    const label = presetLabel(presetMessageId);

    if (!result?.ok) {
      target.innerHTML = renderStatus(`Kunne ikke hente forslag: ${result?.reason || 'ukjent feil'}`, 'error');
      return;
    }

    if (!suggestions.length) {
      target.innerHTML = renderStatus('Ingen demo-kandidater akkurat nå. Seed HG Social demo først.', 'noCandidates');
      return;
    }

    target.innerHTML = `<p class="hg-spotmeeting-status" data-hg-spotmeeting-state="ready">${escapeHTML(label)}</p><div class="hg-spotmeeting-candidates">${suggestions.slice(0, 4).map(candidate => {
      const duplicate = getDuplicateInvite(candidate.targetUserId, contextForAction, presetMessageId);
      const disabled = duplicate ? ' disabled' : '';
      const status = duplicate ? 'Allerede sendt' : 'Send forslag';
      return `<article class="hg-spotmeeting-candidate"><div><strong>${escapeHTML(candidate.displayName || candidate.targetUserId || 'Demo-kandidat')}</strong><p>${escapeHTML(candidate.reason || 'Deler kunnskap, ruter eller begreper')}</p></div><button type="button" data-hg-spotmeeting-send="1" data-hg-spotmeeting-target="${escapeHTML(candidate.targetUserId)}" data-hg-spotmeeting-preset="${escapeHTML(presetMessageId)}"${disabled}>${status}</button></article>`;
    }).join('')}</div><p class="hg-spotmeeting-status">TEST_MODE: forhåndsmelding, lokalt og privat. Ingen fritekst.</p>`;
  }

  function render(context, selectedAction = 'match'){
    const sheet = ensureSheet();
    sheet.innerHTML = `<section class="hg-spotmeeting-panel"><header class="hg-spotmeeting-head"><div><h2>Kunnskapsmøte</h2><p class="hg-spotmeeting-context">${escapeHTML(context.title || 'Sted')}</p></div><button class="hg-spotmeeting-close" type="button" data-hg-spotmeeting-close="1" aria-label="Lukk">×</button></header><div class="hg-spotmeeting-body"><p class="hg-spotmeeting-note">Basert på tema og kunnskap, ikke live-posisjon. Kun forhåndsvalg.</p><div class="hg-spotmeeting-actions" aria-label="Velg inngang til kunnskapsmøte">${ACTIONS.map(action => actionButton(action, selectedAction)).join('')}</div><div data-hg-spotmeeting-candidates>${renderStatus('Velg hvordan du vil starte.', 'ready')}</div></div></section>`;
    renderCandidates(context, selectedAction);
  }

  function open(contextOrOptions = {}){
    const context = buildContext(contextOrOptions);
    const action = String(context.preferredAction || 'match');
    currentState = { context, action };
    const sheet = ensureSheet();
    render(context, action);
    sheet.hidden = false;
    const closeButton = sheet.querySelector('[data-hg-spotmeeting-close]');
    if (closeButton instanceof HTMLElement) closeButton.focus();
    return { ok: true, context, action };
  }

  function close(){
    const sheet = root.document?.getElementById?.(SHEET_ID);
    if (sheet) sheet.hidden = true;
  }

  function sendInvite(button){
    if (!button || !currentState || !root.HG_Spotmeeting) return { ok: false, reason: 'missing_runtime' };
    const presetMessageId = String(button.getAttribute('data-hg-spotmeeting-preset') || PRESET_BY_ACTION[currentState.action] || PRESET_BY_ACTION.match);
    const targetUserId = String(button.getAttribute('data-hg-spotmeeting-target') || '').trim();
    const context = Object.assign({}, currentState.context, {
      contextType: CONTEXT_TYPE_BY_ACTION[currentState.action] || currentState.context.contextType || 'place'
    });
    const duplicate = getDuplicateInvite(targetUserId, context, presetMessageId);
    if (duplicate) {
      root.showToast?.('Kunnskapsmøte er allerede foreslått.');
      button.textContent = 'Allerede sendt';
      button.disabled = true;
      return { ok: false, reason: 'duplicate', invite: duplicate };
    }
    const result = root.HG_Spotmeeting.createSpotmeetingInvite(targetUserId, context, presetMessageId);
    if (!result?.ok) {
      const target = ensureSheet().querySelector('[data-hg-spotmeeting-candidates]');
      if (target) target.innerHTML = renderStatus(`Kunne ikke sende: ${result?.reason || 'ukjent feil'}`, 'error');
      return result;
    }
    button.textContent = 'Sendt';
    button.disabled = true;
    root.showToast?.('Kunnskapsmøte sendt i TEST_MODE.');
    root.dispatchEvent?.(new CustomEvent('hg:spotmeetingChanged', { detail: { invite: result.invite } }));
    root.dispatchEvent?.(new CustomEvent('updateProfile', { detail: { source: 'spotmeeting' } }));
    const target = ensureSheet().querySelector('[data-hg-spotmeeting-candidates]');
    if (target) target.insertAdjacentHTML('beforeend', '<p class="hg-spotmeeting-status" data-hg-spotmeeting-state="sent">Forslag sendt. Følg opp i Social Meet.</p>');
    return result;
  }

  function renderPeopleCta(placeId){
    return `<button class="pc-people-spotmeeting-cta" type="button" data-hg-spotmeeting-open="people" data-hg-spotmeeting-place="${escapeHTML(placeId || 'sted')}">Foreslå kunnskapsmøte</button><p class="pc-people-spotmeeting-note">Basert på personer og relasjoner her.</p>`;
  }

  function enhanceOnSiteBox(box){
    if (!box?.querySelector || box.querySelector('[data-hg-spotmeeting-onsite="1"]')) return;
    const head = box.querySelector('.pc-events-head');
    const placeId = getActivePlaceIdFromOnSiteBox(box);
    Array.from(box.children || []).forEach(child => {
      if (child !== head) child.remove();
    });
    box.insertAdjacentHTML('beforeend', renderOnSitePanel(placeId));
  }

  function enhanceOnSiteBoxes(scope = root.document){
    const boxes = [];
    if (scope instanceof HTMLElement && scope.id === 'pcEventsBox') boxes.push(scope);
    if (scope?.querySelectorAll) boxes.push(...scope.querySelectorAll('#pcEventsBox'));
    boxes.forEach(enhanceOnSiteBox);
  }

  function canonicalizePlaceCardSections(scope = root.document){
    if (!scope?.querySelectorAll) return;
    scope.querySelectorAll('.pc-spotmeeting').forEach(section => {
      if (section.dataset.hgSpotmeetingCanonicalized === '1') return;
      const placeId = String(section.getAttribute('data-hg-spotmeeting-place') || section.closest?.('#placeCard')?.dataset?.currentPlaceId || 'sted');
      const wrapper = root.document.createElement('div');
      wrapper.className = 'pc-people-spotmeeting-cta-wrap';
      wrapper.dataset.hgSpotmeetingCanonicalized = '1';
      wrapper.innerHTML = renderPeopleCta(placeId);
      section.replaceWith(wrapper);
    });
    enhanceOnSiteBoxes(scope);
    root.document?.getElementById?.('pcExploreTogether')?.remove?.();
  }

  function openForElement(target, action, sourceSurface){
    const place = getCurrentPlace(target);
    open(buildPlaceContext(place, {
      preferredAction: action || 'match',
      sourceSurface,
      reason: sourceSurface === 'placeCardPeople'
        ? 'Kunnskapsmøte knyttet til personer og relasjoner på stedet'
        : 'Kunnskapsmøte rundt dette stedet'
    }));
  }

  function handleClick(event){
    const target = event.target?.closest?.('[data-hg-spotmeeting-send], [data-hg-spotmeeting-action], [data-hg-spotmeeting-open], [data-knowledge-spot-match], [data-hg-spotmeeting-close], #pcExploreTogether');
    if (!target) return;

    if (target.hasAttribute('data-hg-spotmeeting-close')) {
      event.preventDefault?.();
      event.stopPropagation?.();
      close();
      return;
    }

    if (target.id === 'pcExploreTogether') {
      event.preventDefault?.();
      event.stopPropagation?.();
      openForElement(target, 'match', 'placeCardFooterDeprecated');
      target.remove?.();
      return;
    }

    if (target.hasAttribute('data-hg-spotmeeting-send')) {
      event.preventDefault?.();
      event.stopPropagation?.();
      sendInvite(target);
      return;
    }

    if (target.hasAttribute('data-hg-spotmeeting-action')) {
      event.preventDefault?.();
      event.stopPropagation?.();
      const action = String(target.getAttribute('data-hg-spotmeeting-action') || 'match');
      const sheet = target.closest?.(`#${SHEET_ID}`);
      if (sheet && currentState) {
        currentState.action = action;
        render(currentState.context, action);
        return;
      }
      const inOnSite = Boolean(target.closest?.('[data-hg-spotmeeting-onsite="1"]'));
      openForElement(target, action, inOnSite ? 'placeCardOnSite' : 'placeCardPeople');
      return;
    }

    if (target.hasAttribute('data-knowledge-spot-match')) {
      event.preventDefault?.();
      event.stopPropagation?.();
      openForElement(target, 'match', 'placeCardOnSite');
      return;
    }

    if (target.hasAttribute('data-hg-spotmeeting-open')) {
      event.preventDefault?.();
      event.stopPropagation?.();
      const surface = String(target.getAttribute('data-hg-spotmeeting-open') || '') === 'people' ? 'placeCardPeople' : 'placeCardOnSite';
      openForElement(target, 'match', surface);
    }
  }

  function installMutationObserver(){
    if (!root.MutationObserver || root.__HG_SPOTMEETING_UI_OBSERVER__) return;
    root.__HG_SPOTMEETING_UI_OBSERVER__ = new root.MutationObserver(() => canonicalizePlaceCardSections());
    root.__HG_SPOTMEETING_UI_OBSERVER__.observe(root.document.body || root.document.documentElement, { childList: true, subtree: true });
  }

  function bind(){
    if (root.__HG_SPOTMEETING_UI_BOUND__) return;
    root.__HG_SPOTMEETING_UI_BOUND__ = true;
    injectStyles();
    root.document?.addEventListener?.('click', handleClick, true);
    canonicalizePlaceCardSections();
    installMutationObserver();
  }

  function health(){
    return {
      ok: true,
      ui: 'canonical',
      sheetMounted: Boolean(root.document?.getElementById?.(SHEET_ID)),
      onSitePanels: root.document?.querySelectorAll?.('[data-hg-spotmeeting-onsite="1"]')?.length || 0,
      testMode: isTestMode(),
      hasRuntime: Boolean(root.HG_Spotmeeting)
    };
  }

  root.HG_SpotmeetingUI = {
    open,
    close,
    buildContext,
    buildPlaceContext,
    render,
    renderCandidates,
    sendInvite,
    canonicalizePlaceCardSections,
    bind,
    health
  };

  root.openSpotMatchList = function openSpotMatchList(placeId){
    const place = getPlaceById(placeId) || { id: placeId || 'sted', name: placeId || 'Sted' };
    return open(buildPlaceContext(place, {
      preferredAction: 'match',
      sourceSurface: 'placeCardOnSite',
      reason: 'Kunnskapsmøte rundt dette stedet'
    }));
  };

  bind();
}());
