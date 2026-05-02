(function initCareerRoleResolver(globalScope) {
  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function slugify(value) {
    return normalize(value)
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 80);
  }

  const ROLE_ID_BY_SCOPE = {
    ekspeditor: 'naer_ekspeditor',
    arbeider: 'naer_arbeider',
    fagarbeider: 'naer_fagarbeider',
    formann: 'naer_formann',
    mellomleder: 'naer_mellomleder'
  };

  const NAERINGSLIV_ROLE_SCOPE_BY_TITLE = {
    arbeider: 'arbeider',
    ekspeditor: 'ekspeditor',
    butikkmedarbeider: 'ekspeditor',
    ekspeditor_butikkmedarbeider: 'ekspeditor',

    lager_og_driftsmedarbeider: 'arbeider',
    fagarbeider: 'fagarbeider',

    skiftleder: 'formann',
    formann: 'formann',
    arbeidsleder: 'formann',
    formann_arbeidsleder: 'formann',

    okonomi_og_administrasjonsmedarbeider: 'mellomleder',
    controller: 'mellomleder',
    avdelingsleder: 'mellomleder',
    driftsleder: 'mellomleder',
    finansanalytiker: 'mellomleder',
    produksjonsleder: 'mellomleder',
    butikksjef_enhetsleder: 'mellomleder',
    okonomi_og_finanssjef: 'mellomleder',
    daglig_leder: 'mellomleder',
    finansdirektor: 'mellomleder',
    grunder: 'mellomleder',
    bedriftseier: 'mellomleder',
    konserndirektor: 'mellomleder',
    konsernsjef: 'mellomleder',
    investor: 'mellomleder',
    kapitalforvalter: 'mellomleder',
    industribygger: 'mellomleder',
    industrieier: 'mellomleder'
  };

  function resolveCareerRoleScope(activePosition) {
    const careerId = normalize(activePosition?.career_id);
    const roleKey = slugify(activePosition?.role_key);
    const titleKey = slugify(activePosition?.title);

    if (careerId === 'naeringsliv') {
      if (roleKey === 'naer_ekspeditor' || roleKey === 'ekspeditor' || roleKey.includes('ekspedit') || roleKey.includes('butikk')) return 'ekspeditor';
      if (roleKey === 'naer_arbeider' || roleKey === 'arbeider' || roleKey.includes('lager') || roleKey.includes('drift')) return 'arbeider';
      if (roleKey === 'naer_fagarbeider' || roleKey.includes('fagarbeider')) return 'fagarbeider';
      if (roleKey === 'naer_formann' || roleKey.includes('formann') || roleKey.includes('arbeidsleder') || roleKey.includes('skiftleder')) return 'formann';
      if (roleKey === 'naer_mellomleder' || roleKey.includes('mellomleder')) return 'mellomleder';

      if (NAERINGSLIV_ROLE_SCOPE_BY_TITLE[titleKey]) return NAERINGSLIV_ROLE_SCOPE_BY_TITLE[titleKey];

      if (titleKey.includes('ekspedit') || titleKey.includes('butikkmedarbeider')) return 'ekspeditor';
      if (titleKey.includes('lager') || titleKey.includes('drift')) return 'arbeider';
      if (titleKey.includes('fagarbeider')) return 'fagarbeider';
      if (titleKey.includes('formann') || titleKey.includes('arbeidsleder') || titleKey.includes('skiftleder')) return 'formann';
      if (
        titleKey.includes('leder') ||
        titleKey.includes('sjef') ||
        titleKey.includes('direktor') ||
        titleKey.includes('finans') ||
        titleKey.includes('okonomi') ||
        titleKey.includes('controller') ||
        titleKey.includes('investor') ||
        titleKey.includes('eier') ||
        titleKey.includes('grunder') ||
        titleKey.includes('kapital') ||
        titleKey.includes('industri')
      ) return 'mellomleder';
    }

    if (roleKey.includes('ekspeditor') || roleKey.includes('butikk')) return 'ekspeditor';
    if (roleKey.includes('arbeider')) return 'arbeider';
    if (roleKey.includes('fagarbeider')) return 'fagarbeider';
    if (roleKey.includes('formann') || roleKey.includes('arbeidsleder') || roleKey.includes('skiftleder')) return 'formann';
    if (roleKey.includes('mellomleder')) return 'mellomleder';
    return 'unknown';
  }

  function resolveCareerRoleId(activePosition) {
    const roleScope = resolveCareerRoleScope(activePosition);
    if (ROLE_ID_BY_SCOPE[roleScope]) return ROLE_ID_BY_SCOPE[roleScope];

    const roleKey = slugify(activePosition?.role_key);
    if (roleKey && ROLE_ID_BY_SCOPE[roleKey]) return ROLE_ID_BY_SCOPE[roleKey];

    if (roleKey.startsWith('naer_')) return roleKey;

    return null;
  }

  function resolveCareerRole(activePosition) {
    const role_scope = resolveCareerRoleScope(activePosition);
    const role_id = resolveCareerRoleId(activePosition);

    let role_key = null;
    if (role_id) {
      role_key = role_id;
    } else if (role_scope && role_scope !== 'unknown') {
      role_key = role_scope;
    } else {
      role_key = slugify(activePosition?.role_key || activePosition?.title || '');
    }

    return {
      role_scope,
      role_id,
      role_key: role_key || null
    };
  }

  const api = { resolveCareerRoleScope, resolveCareerRoleId, resolveCareerRole };
  globalScope.CivicationCareerRoleResolver = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
