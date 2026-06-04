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
    administrasjonsmedarbeider: 'naer_administrasjonsmedarbeider',
    fagarbeider: 'naer_fagarbeider',
    formann: 'naer_formann',
    controller: 'naer_controller',
    avdelingsleder: 'naer_avdelingsleder',
    mellomleder: 'naer_mellomleder',
    by_assistent: 'by_assistent'
  };

  const ROLE_SCOPE_BY_ROLE_ID = {
    naer_ekspeditor: 'ekspeditor',
    naer_arbeider: 'arbeider',
    naer_administrasjonsmedarbeider: 'administrasjonsmedarbeider',
    naer_fagarbeider: 'fagarbeider',
    naer_formann: 'formann',
    naer_controller: 'controller',
    naer_avdelingsleder: 'avdelingsleder',
    naer_mellomleder: 'mellomleder',
    by_assistent: 'by_assistent'
  };

  // Badges er progresjon/tittel. Role scope er spillbar jobbtype.
  // Flere badge-titler kan derfor dele samme role_scope når de bruker samme
  // type mailPlan, mailFamilies og jobLearningProfile.
  const NAERINGSLIV_ROLE_SCOPE_BY_TITLE = {
    arbeider: 'arbeider',
    ekspeditor: 'ekspeditor',
    butikkmedarbeider: 'ekspeditor',
    ekspeditor_butikkmedarbeider: 'ekspeditor',

    lager_og_driftsmedarbeider: 'arbeider',
    okonomi_og_administrasjonsmedarbeider: 'administrasjonsmedarbeider',
    administrasjonsmedarbeider: 'administrasjonsmedarbeider',
    fagarbeider: 'fagarbeider',

    skiftleder: 'formann',
    formann: 'formann',
    arbeidsleder: 'formann',
    formann_arbeidsleder: 'formann',

    controller: 'controller',
    finansanalytiker: 'controller',
    okonomi_og_finanssjef: 'controller',
    finansdirektor: 'controller',

    avdelingsleder: 'avdelingsleder',
    driftsleder: 'avdelingsleder',
    produksjonsleder: 'avdelingsleder',
    butikksjef_enhetsleder: 'avdelingsleder',
    daglig_leder: 'avdelingsleder',

    grunder: 'mellomleder',
    bedriftseier: 'mellomleder',
    konserndirektor: 'mellomleder',
    konsernsjef: 'mellomleder',
    investor: 'mellomleder',
    kapitalforvalter: 'mellomleder',
    industribygger: 'mellomleder',
    industrieier: 'mellomleder'
  };

  const BY_ROLE_SCOPE_BY_TITLE = {
    studentassistent: 'by_assistent',
    praktikant_arkitektur_plan: 'by_assistent',
    prosjektmedarbeider: 'by_assistent'
  };

  function resolveCareerRoleScope(activePosition) {
    const careerId = normalize(activePosition?.career_id);
    const roleKey = slugify(activePosition?.role_key);
    const roleId = slugify(activePosition?.role_id);
    const titleKey = slugify(activePosition?.title);

    if (ROLE_SCOPE_BY_ROLE_ID[roleId]) return ROLE_SCOPE_BY_ROLE_ID[roleId];
    if (ROLE_SCOPE_BY_ROLE_ID[roleKey]) return ROLE_SCOPE_BY_ROLE_ID[roleKey];

    if (careerId === 'by') {
      if (roleKey === 'by_assistent') return 'by_assistent';
      if (BY_ROLE_SCOPE_BY_TITLE[titleKey]) return BY_ROLE_SCOPE_BY_TITLE[titleKey];
      if (titleKey.includes('studentassistent') || titleKey.includes('praktikant') || titleKey.includes('prosjektmedarbeider')) return 'by_assistent';
    }

    if (careerId === 'naeringsliv') {
      if (roleKey === 'ekspeditor' || roleKey.includes('ekspedit') || roleKey.includes('butikk')) return 'ekspeditor';
      if (roleKey === 'arbeider' || roleKey.includes('lager') || roleKey.includes('drift')) return 'arbeider';
      if (roleKey === 'administrasjonsmedarbeider' || roleKey.includes('administrasjon')) return 'administrasjonsmedarbeider';
      if (roleKey === 'fagarbeider' || roleKey.includes('fagarbeider')) return 'fagarbeider';
      if (roleKey === 'formann' || roleKey.includes('formann') || roleKey.includes('arbeidsleder') || roleKey.includes('skiftleder')) return 'formann';
      if (roleKey === 'controller' || roleKey.includes('controller')) return 'controller';
      if (roleKey === 'avdelingsleder' || roleKey.includes('avdelingsleder')) return 'avdelingsleder';
      if (roleKey === 'mellomleder' || roleKey.includes('mellomleder')) return 'mellomleder';

      if (NAERINGSLIV_ROLE_SCOPE_BY_TITLE[titleKey]) return NAERINGSLIV_ROLE_SCOPE_BY_TITLE[titleKey];

      if (titleKey.includes('ekspedit') || titleKey.includes('butikkmedarbeider')) return 'ekspeditor';
      if (titleKey.includes('lager')) return 'arbeider';
      if (titleKey.includes('administrasjon') || titleKey.includes('administrasjonsmedarbeider')) return 'administrasjonsmedarbeider';
      if (titleKey.includes('fagarbeider')) return 'fagarbeider';
      if (titleKey.includes('formann') || titleKey.includes('arbeidsleder') || titleKey.includes('skiftleder')) return 'formann';
      if (
        titleKey.includes('controller') ||
        titleKey.includes('finansanalytiker') ||
        titleKey.includes('finanssjef') ||
        titleKey.includes('finansdirektor') ||
        titleKey.includes('okonomi_og_finanssjef')
      ) return 'controller';
      if (
        titleKey.includes('avdelingsleder') ||
        titleKey.includes('driftsleder') ||
        titleKey.includes('produksjonsleder') ||
        titleKey.includes('butikksjef') ||
        titleKey.includes('enhetsleder') ||
        titleKey.includes('daglig_leder')
      ) return 'avdelingsleder';
      if (
        titleKey.includes('grunder') ||
        titleKey.includes('bedriftseier') ||
        titleKey.includes('konsern') ||
        titleKey.includes('investor') ||
        titleKey.includes('kapital') ||
        titleKey.includes('industrieier') ||
        titleKey.includes('industribygger')
      ) return 'mellomleder';
    }

    if (roleKey.includes('by_assistent')) return 'by_assistent';
    if (roleKey.includes('ekspeditor') || roleKey.includes('butikk')) return 'ekspeditor';
    if (roleKey.includes('arbeider')) return 'arbeider';
    if (roleKey.includes('administrasjon')) return 'administrasjonsmedarbeider';
    if (roleKey.includes('fagarbeider')) return 'fagarbeider';
    if (roleKey.includes('formann') || roleKey.includes('arbeidsleder') || roleKey.includes('skiftleder')) return 'formann';
    if (roleKey.includes('controller')) return 'controller';
    if (roleKey.includes('avdelingsleder')) return 'avdelingsleder';
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
