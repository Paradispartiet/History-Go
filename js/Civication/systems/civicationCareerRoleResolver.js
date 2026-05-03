(function initCareerRoleResolver(globalScope) {
  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function slugify(value) {
    return normalize(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 80);
  }

  const ROLE_ID_BY_SCOPE = {
    ekspeditor: 'naer_ekspeditor',
    arbeider: 'naer_arbeider',
    fagarbeider: 'naer_fagarbeider',
    formann: 'naer_formann',
    controller: 'naer_controller',
    finansanalytiker: 'naer_finansanalytiker',
    okonomi_og_finanssjef: 'naer_okonomi_og_finanssjef',
    finansdirektor: 'naer_finansdirektor',
    mellomleder: 'naer_mellomleder'
  };

  const ROLE_SCOPE_BY_ROLE_ID = {
    naer_ekspeditor: 'ekspeditor',
    naer_arbeider: 'arbeider',
    naer_fagarbeider: 'fagarbeider',
    naer_formann: 'formann',
    naer_controller: 'controller',
    naer_finansanalytiker: 'finansanalytiker',
    naer_okonomi_og_finanssjef: 'okonomi_og_finanssjef',
    naer_finansdirektor: 'finansdirektor',
    naer_mellomleder: 'mellomleder'
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
    controller: 'controller',
    finansanalytiker: 'finansanalytiker',
    okonomi_og_finanssjef: 'okonomi_og_finanssjef',
    finansdirektor: 'finansdirektor',

    avdelingsleder: 'mellomleder',
    driftsleder: 'mellomleder',
    produksjonsleder: 'mellomleder',
    butikksjef_enhetsleder: 'mellomleder',
    daglig_leder: 'mellomleder',
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
    const roleId = slugify(activePosition?.role_id);
    const titleKey = slugify(activePosition?.title);

    if (ROLE_SCOPE_BY_ROLE_ID[roleId]) return ROLE_SCOPE_BY_ROLE_ID[roleId];
    if (ROLE_SCOPE_BY_ROLE_ID[roleKey]) return ROLE_SCOPE_BY_ROLE_ID[roleKey];

    if (careerId === 'naeringsliv') {
      if (roleKey === 'ekspeditor' || roleKey.includes('ekspedit') || roleKey.includes('butikk')) return 'ekspeditor';
      if (roleKey === 'arbeider' || roleKey.includes('lager') || roleKey.includes('drift')) return 'arbeider';
      if (roleKey === 'fagarbeider' || roleKey.includes('fagarbeider')) return 'fagarbeider';
      if (roleKey === 'formann' || roleKey.includes('formann') || roleKey.includes('arbeidsleder') || roleKey.includes('skiftleder')) return 'formann';
      if (roleKey === 'controller' || roleKey.includes('controller')) return 'controller';
      if (roleKey === 'finansanalytiker' || roleKey.includes('finansanalytiker')) return 'finansanalytiker';
      if (roleKey === 'okonomi_og_finanssjef' || roleKey.includes('finanssjef')) return 'okonomi_og_finanssjef';
      if (roleKey === 'finansdirektor' || roleKey.includes('finansdirektor')) return 'finansdirektor';
      if (roleKey === 'mellomleder' || roleKey.includes('mellomleder')) return 'mellomleder';

      if (NAERINGSLIV_ROLE_SCOPE_BY_TITLE[titleKey]) return NAERINGSLIV_ROLE_SCOPE_BY_TITLE[titleKey];

      if (titleKey.includes('ekspedit') || titleKey.includes('butikkmedarbeider')) return 'ekspeditor';
      if (titleKey.includes('lager') || titleKey.includes('drift')) return 'arbeider';
      if (titleKey.includes('fagarbeider')) return 'fagarbeider';
      if (titleKey.includes('formann') || titleKey.includes('arbeidsleder') || titleKey.includes('skiftleder')) return 'formann';
      if (titleKey.includes('controller')) return 'controller';
      if (titleKey.includes('finansanalytiker')) return 'finansanalytiker';
      if (titleKey.includes('finanssjef') || titleKey.includes('okonomi_og_finanssjef')) return 'okonomi_og_finanssjef';
      if (titleKey.includes('finansdirektor')) return 'finansdirektor';
      if (
        titleKey.includes('leder') ||
        titleKey.includes('sjef') ||
        titleKey.includes('direktor') ||
        titleKey.includes('finans') ||
        titleKey.includes('okonomi') ||
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
    if (roleKey.includes('controller')) return 'controller';
    if (roleKey.includes('finansanalytiker')) return 'finansanalytiker';
    if (roleKey.includes('finanssjef') || roleKey.includes('okonomi_og_finanssjef')) return 'okonomi_og_finanssjef';
    if (roleKey.includes('finansdirektor')) return 'finansdirektor';
    if (roleKey.includes('mellomleder')) return 'mellomleder';
    return 'unknown';
  }

  function resolveCareerRoleId(activePosition) {
    const roleScope = resolveCareerRoleScope(activePosition);
    if (ROLE_ID_BY_SCOPE[roleScope]) return ROLE_ID_BY_SCOPE[roleScope];

    const roleId = slugify(activePosition?.role_id);
    if (ROLE_SCOPE_BY_ROLE_ID[roleId]) return roleId;

    return null;
  }

  function resolveCareerRole(activePosition) {
    const role_scope = resolveCareerRoleScope(activePosition);
    const role_id = resolveCareerRoleId(activePosition);
    const role_key = role_scope && role_scope !== 'unknown'
      ? role_scope
      : slugify(activePosition?.role_key || activePosition?.title || '') || null;

    return {
      role_scope,
      role_id,
      role_key
    };
  }

  const api = { resolveCareerRoleScope, resolveCareerRoleId, resolveCareerRole };
  globalScope.CivicationCareerRoleResolver = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
