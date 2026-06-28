(function(){
  'use strict';

  const root = typeof window !== 'undefined' ? window : globalThis;
  const PRESET_BY_ACTION = Object.freeze({
    quiz: 'quiz_together',
    route: 'route_one_day',
    observation: 'shared_observation',
    match: 'compare_place_learning'
  });

  function isTestMode(){
    try { return root.localStorage?.getItem('HG_TEST_MODE') === '1'; } catch { return false; }
  }

  function escapeHTML(value){
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getCurrentPlace(section){
    const card = section?.closest?.('#placeCard') || root.document?.getElementById?.('placeCard');
    const currentPlaceId = String(card?.dataset?.currentPlaceId || section?.getAttribute?.('data-hg-spotmeeting-place') || '').trim();
    const places = Array.isArray(root.PLACES) ? root.PLACES : [];
    return places.find(place => String(place?.id || '').trim() === currentPlaceId) || {
      id: currentPlaceId || 'sted',
      name: currentPlaceId || 'Sted'
    };
  }

  function contextFor(action, place){
    const placeId = String(place?.id || place?.name || 'sted');
    const title = String(place?.name || place?.title || 'Sted');
    const kind = action === 'quiz' ? 'quiz' : action === 'route' ? 'route' : action === 'observation' ? 'observation' : 'place';
    return {
      contextType: kind,
      contextId: placeId,
      title,
      reason: 'Manuelt kunnskapsmøte fra PlaceCard',
      sourceSurface: 'placeCard'
    };
  }

  function presetLabel(presetMessageId){
    const presets = root.HG_Spotmeeting?.getSpotmeetingConfig?.()?.presetMessages || [];
    const match = presets.find(preset => preset?.presetMessageId === presetMessageId);
    return String(match?.label || presetMessageId);
  }

  function getPanel(section){
    let panel = section.querySelector('.pc-spotmeeting-demo-panel');
    if (!panel) {
      panel = root.document.createElement('div');
      panel.className = 'pc-spotmeeting-demo-panel';
      section.appendChild(panel);
    }
    return panel;
  }

  function renderMessage(section, message){
    const panel = getPanel(section);
    panel.innerHTML = `<p class="pc-spotmeeting-demo-note">${escapeHTML(message)}</p>`;
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

  function renderCandidates(section, action){
    if (!root.HG_Spotmeeting) {
      renderMessage(section, 'Kunnskapsmøte er ikke lastet ennå.');
      return;
    }

    if (!isTestMode()) {
      renderMessage(section, 'Ekte spotmeeting krever backend. Demo kan testes i TEST_MODE.');
      root.showToast?.('Ekte spotmeeting krever backend. Demo kan testes i TEST_MODE.');
      return;
    }

    const place = getCurrentPlace(section);
    const context = contextFor(action, place);
    const result = root.HG_Spotmeeting.getSpotmeetingSuggestions(context);
    const suggestions = Array.isArray(result?.suggestions) ? result.suggestions : [];
    const presetMessageId = PRESET_BY_ACTION[action] || PRESET_BY_ACTION.match;
    const label = presetLabel(presetMessageId);
    const panel = getPanel(section);

    if (!result?.ok) {
      renderMessage(section, `Kunne ikke hente forslag: ${result?.reason || 'ukjent feil'}`);
      return;
    }

    if (!suggestions.length) {
      renderMessage(section, 'Ingen demo-kandidater akkurat nå. Seed HG Social demo først.');
      return;
    }

    panel.innerHTML = `
      <div class="pc-spotmeeting-demo-head">
        <strong>Velg demo-kandidat</strong>
        <span>${escapeHTML(label)}</span>
      </div>
      <div class="pc-spotmeeting-demo-list">
        ${suggestions.slice(0, 4).map(candidate => {
          const duplicate = getDuplicateInvite(candidate.targetUserId, context, presetMessageId);
          const disabled = duplicate ? ' disabled' : '';
          const status = duplicate ? 'Allerede sendt' : 'Send forslag';
          return `
            <article class="pc-spotmeeting-demo-candidate">
              <div>
                <strong>${escapeHTML(candidate.displayName || candidate.targetUserId || 'Demo-kandidat')}</strong>
                <p>${escapeHTML(candidate.reason || 'Deler kunnskap, ruter eller begreper')}</p>
              </div>
              <button type="button" data-hg-spotmeeting-send="1" data-hg-spotmeeting-target="${escapeHTML(candidate.targetUserId)}" data-hg-spotmeeting-preset="${escapeHTML(presetMessageId)}"${disabled}>${status}</button>
            </article>
          `;
        }).join('')}
      </div>
      <small>TEST_MODE: forhåndsmelding, lokalt og privat. Ingen fritekst eller backend.</small>
    `;
  }

  function sendInvite(button){
    const section = button.closest?.('.pc-spotmeeting');
    if (!section || !root.HG_Spotmeeting) return;
    const actionButton = section.querySelector('[data-hg-spotmeeting-action="quiz"], [data-hg-spotmeeting-action="route"], [data-hg-spotmeeting-action="observation"], [data-hg-spotmeeting-action="match"]');
    const fallbackAction = actionButton?.getAttribute?.('data-hg-spotmeeting-action') || 'match';
    const presetMessageId = String(button.getAttribute('data-hg-spotmeeting-preset') || PRESET_BY_ACTION[fallbackAction] || PRESET_BY_ACTION.match);
    const targetUserId = String(button.getAttribute('data-hg-spotmeeting-target') || '').trim();
    const place = getCurrentPlace(section);
    const action = Object.entries(PRESET_BY_ACTION).find(([, preset]) => preset === presetMessageId)?.[0] || fallbackAction;
    const context = contextFor(action, place);
    const duplicate = getDuplicateInvite(targetUserId, context, presetMessageId);

    if (duplicate) {
      root.showToast?.('Kunnskapsmøte er allerede foreslått.');
      button.textContent = 'Allerede sendt';
      button.disabled = true;
      return;
    }

    const result = root.HG_Spotmeeting.createSpotmeetingInvite(targetUserId, context, presetMessageId);
    if (!result?.ok) {
      renderMessage(section, `Kunne ikke sende: ${result?.reason || 'ukjent feil'}`);
      return;
    }

    button.textContent = 'Sendt';
    button.disabled = true;
    root.showToast?.('Kunnskapsmøte sendt i TEST_MODE.');
    root.dispatchEvent?.(new CustomEvent('hg:spotmeetingChanged', { detail: { invite: result.invite } }));
    root.dispatchEvent?.(new CustomEvent('updateProfile', { detail: { source: 'spotmeeting' } }));
  }

  function handleClick(event){
    const target = event.target?.closest?.('[data-hg-spotmeeting-send], [data-hg-spotmeeting-action]');
    if (!target) return;
    const section = target.closest?.('.pc-spotmeeting');
    if (!section) return;

    event.preventDefault?.();
    event.stopPropagation?.();

    if (target.hasAttribute('data-hg-spotmeeting-send')) {
      sendInvite(target);
      return;
    }

    const action = String(target.getAttribute('data-hg-spotmeeting-action') || 'match');
    renderCandidates(section, action);
  }

  function bind(){
    if (root.__HG_SPOTMEETING_PLACECARD_DEMO_BOUND__) return;
    root.__HG_SPOTMEETING_PLACECARD_DEMO_BOUND__ = true;
    root.document?.addEventListener?.('click', handleClick, true);
  }

  root.HG_SpotmeetingPlaceCardDemo = {
    bind,
    isTestMode,
    contextFor,
    renderCandidates,
    sendInvite
  };

  bind();
}());
