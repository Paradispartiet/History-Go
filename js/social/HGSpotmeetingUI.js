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
  let renderSequence = 0;

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
      .pc-events-spotmeeting{display:none!important}
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
      sourceSurface: String(options.sourceSurface || 'placeCardPeople'),
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

  function renderStatus(message, kind = 'status'){
    return `<p class="hg-spotmeeting-status" data-hg-spotmeeting-state="${escapeHTML(kind)}">${escapeHTML(message)}</p>`;
  }

  function socialMeetFollowUpButton(context, label){
    const placeId = String(context?.contextType === 'place' ? (context.contextId || '') : '').trim();
    const attrs = placeId ? `data-hg-social-meet-open="place" data-hg-social-meet-place="${escapeHTML(placeId)}"` : 'data-hg-social-meet-open="all"';
    return `<button class="hg-spotmeeting-link" type="button" ${attrs} data-hg-spotmeeting-social-followup="1">${escapeHTML(label || 'Åpne Social Meet')}</button>`;
  }

  function socialMeetOpenOptions(context){
    const placeId = String(context?.contextType === 'place' ? (context.contextId || '') : '').trim();
    return placeId
      ? { filter: 'place', placeId, sourceSurface: 'spotmeetingSent' }
      : { filter: 'all', sourceSurface: 'spotmeetingSent' };
  }

  function openSocialMeetFollowUp(context){
    return root.HG_SocialMeetUI?.open?.(socialMeetOpenOptions(context));
  }

  function inviteContextForBackend(context){
    return {
      contextType: String(context?.contextType || '').trim(),
      contextId: String(context?.contextId || '').trim(),
      title: String(context?.title || '').trim(),
      reason: String(context?.reason || 'Kunnskapsmøte rundt dette stedet').trim(),
      sourceSurface: String(context?.sourceSurface || '').trim()
    };
  }

  function backendMode(){
    const backend = root.HG_SocialMeetBackend;
    return typeof backend?.backendMode === 'function' ? String(backend.backendMode() || '').toLowerCase() : 'local';
  }

  function canTryBackendInvite(){
    return backendMode() === 'fastapi' && typeof root.HG_SocialMeetBackend?.createInvite === 'function';
  }

  function canTryBackendDiscovery(){
    return backendMode() === 'fastapi' && typeof root.HG_SocialMeetBackend?.discoverCandidates === 'function';
  }

  function shouldFallbackToLocal(result){
    if (!isTestMode() || !result || result.ok) return false;
    return !['invalid_preset_message', 'forbidden_privacy_field', 'missing_target_user', 'invalid_context_type', 'missing_context_id'].includes(String(result.reason || ''));
  }

  function createLocalInvite(targetUserId, context, presetMessageId){
    if (typeof root.HG_Spotmeeting?.createSpotmeetingInvite !== 'function') return { ok: false, reason: 'missing_runtime' };
    return root.HG_Spotmeeting.createSpotmeetingInvite(targetUserId, context, presetMessageId);
  }

  function createInviteWithBackendFallback(targetUserId, context, presetMessageId){
    const safeContext = inviteContextForBackend(context);
    if (canTryBackendInvite()) {
      try {
        return Promise.resolve(root.HG_SocialMeetBackend.createInvite(safeContext, targetUserId, presetMessageId))
          .then(backendResult => (backendResult?.ok || !shouldFallbackToLocal(backendResult)) ? backendResult : createLocalInvite(targetUserId, context, presetMessageId))
          .catch(() => isTestMode() ? createLocalInvite(targetUserId, context, presetMessageId) : ({ ok:false, reason:'backend_unavailable' }));
      } catch (error) {
        if (isTestMode()) return createLocalInvite(targetUserId, context, presetMessageId);
        return { ok:false, reason:'backend_unavailable' };
      }
    }
    return isTestMode()
      ? createLocalInvite(targetUserId, context, presetMessageId)
      : { ok:false, reason:'backend_not_enabled' };
  }

  function uniqueStrings(values){
    return [...new Set((Array.isArray(values) ? values : []).map(value => String(value || '').trim().toLowerCase()).filter(Boolean))];
  }

  function buildDiscoverySignals(context){
    const place = getPlaceById(context?.contextId) || {};
    const quizProfile = place?.quiz_profile || place?.quizProfile || {};
    const topicTags = []
      .concat(Array.isArray(place?.emne_ids) ? place.emne_ids : [])
      .concat(Array.isArray(place?.emneIds) ? place.emneIds : [])
      .concat(Array.isArray(place?.tags) ? place.tags : []);
    const learningGoals = []
      .concat(Array.isArray(quizProfile?.primary_angles) ? quizProfile.primary_angles : [])
      .concat(Array.isArray(quizProfile?.primaryAngles) ? quizProfile.primaryAngles : []);
    return {
      themeTags: uniqueStrings([place?.category, ...(Array.isArray(place?.categories) ? place.categories : [])]),
      eraTags: uniqueStrings([place?.epokeLabel, place?.era, place?.epoch]),
      topicTags: uniqueStrings(topicTags),
      routeCategoryTags: uniqueStrings(context?.contextType === 'route' ? [place?.category] : []),
      quizTopicTags: uniqueStrings([].concat(Array.isArray(quizProfile?.question_families) ? quizProfile.question_families : []).concat(Array.isArray(quizProfile?.questionFamilies) ? quizProfile.questionFamilies : [])),
      learningGoalTags: uniqueStrings(learningGoals)
    };
  }

  function renderSuggestionCards(suggestions, contextForAction, presetMessageId, label, { demoOnly = false } = {}){
    const note = demoOnly
      ? 'TEST_MODE: forhåndsmelding, lokalt og privat. Ingen fritekst.'
      : 'Forslagene er kun kunnskapsmatcher. Tilgjengelighet og sikkerhet revalideres når du sender.';
    return `<p class="hg-spotmeeting-status" data-hg-spotmeeting-state="ready">${escapeHTML(label)}</p><div class="hg-spotmeeting-candidates">${suggestions.slice(0, 4).map(candidate => {
      const duplicate = demoOnly ? getDuplicateInvite(candidate.targetUserId, contextForAction, presetMessageId) : null;
      const disabled = duplicate ? ' disabled' : '';
      const status = duplicate ? 'Allerede sendt' : 'Send forslag';
      return `<article class="hg-spotmeeting-candidate"><div><strong>${escapeHTML(candidate.displayName || candidate.targetUserId || 'Kandidat')}</strong><p>${escapeHTML(candidate.reason || 'Deler kunnskap, ruter eller begreper')}</p></div><button type="button" data-hg-spotmeeting-send="1" data-hg-spotmeeting-target="${escapeHTML(candidate.targetUserId)}" data-hg-spotmeeting-preset="${escapeHTML(presetMessageId)}"${disabled}>${status}</button></article>`;
    }).join('')}</div><p class="hg-spotmeeting-status">${escapeHTML(note)}</p>${socialMeetFollowUpButton(contextForAction, 'Åpne Social Meet')}`;
  }

  async function renderCandidates(context, action){
    const sheet = ensureSheet();
    const target = sheet.querySelector('[data-hg-spotmeeting-candidates]');
    if (!target) return;

    if (!root.HG_Spotmeeting) {
      target.innerHTML = renderStatus('Kunnskapsmøte er ikke lastet ennå.', 'error');
      return;
    }

    const contextForAction = Object.assign({}, context, { contextType: CONTEXT_TYPE_BY_ACTION[action] || context.contextType || 'place' });
    const presetMessageId = PRESET_BY_ACTION[action] || PRESET_BY_ACTION.match;
    const label = presetLabel(presetMessageId);

    if (isTestMode()) {
      const result = root.HG_Spotmeeting.getSpotmeetingSuggestions(contextForAction);
      const suggestions = Array.isArray(result?.suggestions) ? result.suggestions : [];
      if (!result?.ok) {
        target.innerHTML = renderStatus(`Kunne ikke hente forslag: ${result?.reason || 'ukjent feil'}`, 'error');
        return;
      }
      if (!suggestions.length) {
        target.innerHTML = `${renderStatus('Ingen demo-kandidater akkurat nå. Seed HG Social demo først.', 'noCandidates')}${socialMeetFollowUpButton(context, 'Åpne Social Meet')}`;
        return;
      }
      target.innerHTML = renderSuggestionCards(suggestions, contextForAction, presetMessageId, label, { demoOnly:true });
      return;
    }

    if (!canTryBackendDiscovery()) {
      target.innerHTML = `${renderStatus('Ekte Spotmeeting er ikke aktivert for denne klienten ennå.', 'backendDisabled')}${socialMeetFollowUpButton(context, 'Åpne Social Meet')}`;
      return;
    }

    const sequence = ++renderSequence;
    target.innerHTML = renderStatus('Henter trygge kunnskapsmatcher …', 'loading');
    let result;
    try {
      result = await root.HG_SocialMeetBackend.discoverCandidates(contextForAction, {
        signals: buildDiscoverySignals(contextForAction),
        limit: 8
      });
    } catch {
      result = { ok:false, reason:'backend_unavailable', suggestions:[] };
    }
    if (sequence !== renderSequence || !target.isConnected) return;

    const suggestions = Array.isArray(result?.suggestions) ? result.suggestions : [];
    if (!result?.ok) {
      const disabled = ['backend_not_enabled', 'profile_not_published', 'not_authenticated'].includes(String(result?.reason || ''));
      const message = disabled
        ? 'Kunnskapsmatcher er ikke tilgjengelige for profilen din ennå.'
        : 'Kunne ikke hente kunnskapsmatcher akkurat nå.';
      target.innerHTML = `${renderStatus(message, disabled ? 'backendDisabled' : 'error')}${socialMeetFollowUpButton(context, 'Åpne Social Meet')}`;
      return;
    }
    if (!suggestions.length) {
      target.innerHTML = `${renderStatus('Ingen trygge kunnskapsmatcher akkurat nå.', 'noCandidates')}${socialMeetFollowUpButton(context, 'Åpne Social Meet')}`;
      return;
    }
    target.innerHTML = renderSuggestionCards(suggestions, contextForAction, presetMessageId, label);
  }

  function render(context, selectedAction = 'match'){
    const sheet = ensureSheet();
    sheet.innerHTML = `<section class="hg-spotmeeting-panel"><header class="hg-spotmeeting-head"><div><h2>Kunnskapsmøte</h2><p class="hg-spotmeeting-context">${escapeHTML(context.title || 'Sted')}</p></div><button class="hg-spotmeeting-close" type="button" data-hg-spotmeeting-close="1" aria-label="Lukk">×</button></header><div class="hg-spotmeeting-body"><p class="hg-spotmeeting-note">Basert på tema og kunnskap, ikke live-posisjon. Kun forhåndsvalg.</p><div class="hg-spotmeeting-actions" aria-label="Velg inngang til kunnskapsmøte">${ACTIONS.map(action => actionButton(action, selectedAction)).join('')}</div><div data-hg-spotmeeting-candidates>${renderStatus('Velg hvordan du vil starte.', 'ready')}</div></div></section>`;
    void renderCandidates(context, selectedAction);
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
    renderSequence += 1;
    const sheet = root.document?.getElementById?.(SHEET_ID);
    if (sheet) sheet.hidden = true;
  }

  function finishSendInvite(button, context, presetMessageId, result){
    if (!result?.ok) {
      button.disabled = false;
      const target = ensureSheet().querySelector('[data-hg-spotmeeting-candidates]');
      if (target) target.innerHTML = renderStatus('Kunne ikke sende møteforslag akkurat nå.', 'error');
      return result;
    }
    button.textContent = 'Sendt';
    button.disabled = true;
    root.showToast?.('Kunnskapsmøte sendt.');
    const detail = { invite: result.invite, source: 'spotmeeting', context: inviteContextForBackend(context), presetMessageId };
    root.dispatchEvent?.(new CustomEvent('hg:spotmeetingChanged', { detail }));
    root.dispatchEvent?.(new CustomEvent('updateProfile', { detail }));
    if (currentState) currentState.lastSentContext = context;
    const target = ensureSheet().querySelector('[data-hg-spotmeeting-candidates]');
    if (target) target.insertAdjacentHTML('beforeend', `<p class="hg-spotmeeting-status" data-hg-spotmeeting-state="sent">Forslag sendt. Følg opp i Social Meet.</p>${socialMeetFollowUpButton(context, 'Åpne Social Meet')}`);
    return result;
  }

  function sendInvite(button){
    if (!button || !currentState) return { ok: false, reason: 'missing_runtime' };
    const presetMessageId = String(button.getAttribute('data-hg-spotmeeting-preset') || PRESET_BY_ACTION[currentState.action] || PRESET_BY_ACTION.match);
    const targetUserId = String(button.getAttribute('data-hg-spotmeeting-target') || '').trim();
    const context = Object.assign({}, currentState.context, { contextType: CONTEXT_TYPE_BY_ACTION[currentState.action] || currentState.context.contextType || 'place' });
    const duplicate = isTestMode() ? getDuplicateInvite(targetUserId, context, presetMessageId) : null;
    if (duplicate) {
      root.showToast?.('Kunnskapsmøte er allerede foreslått.');
      button.textContent = 'Allerede sendt';
      button.disabled = true;
      return { ok: false, reason: 'duplicate', invite: duplicate };
    }
    button.disabled = true;
    const result = createInviteWithBackendFallback(targetUserId, context, presetMessageId);
    if (result && typeof result.then === 'function') return result.then(finalResult => finishSendInvite(button, context, presetMessageId, finalResult));
    return finishSendInvite(button, context, presetMessageId, result);
  }

  function renderPeopleCta(placeId){
    return `<button class="pc-people-spotmeeting-cta" type="button" data-hg-spotmeeting-open="people" data-hg-spotmeeting-place="${escapeHTML(placeId || 'sted')}">Foreslå kunnskapsmøte</button><p class="pc-people-spotmeeting-note">Basert på personer og relasjoner her.</p>`;
  }

  function cleanupOnSiteBox(scope = root.document){
    scope?.querySelectorAll?.('.pc-events-spotmeeting,[data-hg-spotmeeting-onsite="1"]').forEach(node => node.remove());
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
    cleanupOnSiteBox(scope);
    root.document?.getElementById?.('pcExploreTogether')?.remove?.();
  }

  function openForElement(target, action, sourceSurface){
    const place = getCurrentPlace(target);
    open(buildPlaceContext(place, {
      preferredAction: action || 'match',
      sourceSurface,
      reason: sourceSurface === 'placeCardPeople' ? 'Kunnskapsmøte knyttet til personer og relasjoner på stedet' : 'Kunnskapsmøte rundt dette stedet'
    }));
  }

  function handleClick(event){
    const target = event.target?.closest?.('[data-hg-spotmeeting-send], [data-hg-spotmeeting-action], [data-hg-spotmeeting-open], [data-hg-spotmeeting-social-followup], [data-knowledge-spot-match], [data-hg-spotmeeting-close], #pcExploreTogether');
    if (!target) return;
    if (target.hasAttribute('data-hg-spotmeeting-close')) { event.preventDefault?.(); event.stopPropagation?.(); close(); return; }
    if (target.id === 'pcExploreTogether') { event.preventDefault?.(); event.stopPropagation?.(); openForElement(target, 'match', 'placeCardFooterDeprecated'); target.remove?.(); return; }
    if (target.hasAttribute('data-hg-spotmeeting-send')) { event.preventDefault?.(); event.stopPropagation?.(); sendInvite(target); return; }
    if (target.hasAttribute('data-hg-spotmeeting-social-followup')) { event.preventDefault?.(); event.stopPropagation?.(); openSocialMeetFollowUp(currentState?.lastSentContext || currentState?.context || {}); return; }
    if (target.hasAttribute('data-hg-spotmeeting-action')) {
      const sheet = target.closest?.(`#${SHEET_ID}`);
      if (!sheet) return;
      event.preventDefault?.();
      event.stopPropagation?.();
      const action = String(target.getAttribute('data-hg-spotmeeting-action') || 'match');
      if (currentState) {
        currentState.action = action;
        render(currentState.context, action);
      }
      return;
    }
    if (target.hasAttribute('data-knowledge-spot-match')) { event.preventDefault?.(); event.stopPropagation?.(); openForElement(target, 'match', 'placeCardOnSite'); return; }
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
    return { ok: true, ui: 'canonical', sheetMounted: Boolean(root.document?.getElementById?.(SHEET_ID)), onSitePanels: 0, testMode: isTestMode(), backendMode: backendMode(), hasRuntime: Boolean(root.HG_Spotmeeting) };
  }

  root.HG_SpotmeetingUI = { open, close, buildContext, buildPlaceContext, render, renderCandidates, sendInvite, canonicalizePlaceCardSections, bind, health };

  root.openSpotMatchList = function openSpotMatchList(placeId){
    const place = getPlaceById(placeId) || { id: placeId || 'sted', name: placeId || 'Sted' };
    return open(buildPlaceContext(place, { preferredAction: 'match', sourceSurface: 'placeCardPeople', reason: 'Kunnskapsmøte rundt dette stedet' }));
  };

  bind();
}());
