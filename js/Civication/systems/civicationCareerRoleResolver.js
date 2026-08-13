(function initCareerRoleResolver(globalScope) {
  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function slugify(value) {
    return normalize(value)
      .replace(/æ/g, 'ae')
      .replace(/ø/g, 'o')
      .replace(/å/g, 'a')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 80);
  }

  const ROLE_ID_BY_SCOPE = {
    ekspeditor: 'naer_ekspeditor',
    arbeider: 'naer_arbeider',
    lager_og_driftsmedarbeider: 'naer_lager_og_driftsmedarbeider',
    renholder: 'naer_renholder',
    administrasjonsmedarbeider: 'naer_administrasjonsmedarbeider',
    fagarbeider: 'naer_fagarbeider',
    formann: 'naer_formann',
    controller: 'naer_controller',
    avdelingsleder: 'naer_avdelingsleder',
    mellomleder: 'naer_mellomleder',
    barnehageassistent: 'sosial_laering_barnehageassistent',
    by_assistent: 'by_assistent',
    by_saksbehandler: 'by_saksbehandler',
    by_radgiver_plan: 'by_radgiver_plan',
    by_prosjektleder: 'by_prosjektleder',
    by_arkitekt: 'by_arkitekt',
    sport_utover: 'sport_utover',
    sport_kaptein: 'sport_kaptein',
    sport_trener: 'sport_trener',
    sport_sportsledelse: 'sport_sportsledelse',
    sport_legende: 'sport_legende',
    psykologi_miljoarbeid: 'psykologi_miljoarbeider',
    psykologi_arbeids_og_karriereveiledning: 'psykologi_karriereveileder',
    psykolog: 'psykologi_psykolog',
    spesialistpsykolog: 'psykologi_spesialistpsykolog',
    fagansvarlig: 'psykologi_fagansvarlig',
    klinikkleder: 'psykologi_klinikkleder'
  };

  const ROLE_SCOPE_BY_ROLE_ID = Object.fromEntries(
    Object.entries(ROLE_ID_BY_SCOPE).map(([scope, roleId]) => [roleId, scope])
  );
  ROLE_SCOPE_BY_ROLE_ID.renholder = 'renholder';
  ROLE_SCOPE_BY_ROLE_ID.barnehageassistent = 'barnehageassistent';

  const NAERINGSLIV_ROLE_SCOPE_BY_TITLE = {
    arbeider: 'arbeider',
    ekspeditor: 'ekspeditor',
    butikkmedarbeider: 'ekspeditor',
    ekspeditor_butikkmedarbeider: 'ekspeditor',
    lager_og_driftsmedarbeider: 'lager_og_driftsmedarbeider',
    renholder: 'renholder',
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

  const SOSIAL_LAERING_ROLE_SCOPE_BY_TITLE = {
    barnehageassistent_pedagogisk_medarbeider: 'barnehageassistent'
  };

  const BY_ROLE_SCOPE_BY_TITLE = {
    studentassistent: 'by_assistent',
    praktikant_arkitektur_plan: 'by_assistent',
    prosjektmedarbeider: 'by_assistent',
    saksbehandler_plan_bygg: 'by_saksbehandler',
    forstekonsulent: 'by_saksbehandler',
    radgiver_byutvikling: 'by_radgiver_plan',
    seniorradgiver_byutvikling: 'by_radgiver_plan',
    arealplanlegger: 'by_radgiver_plan',
    byplanlegger: 'by_radgiver_plan',
    prosjektleder_byutvikling: 'by_prosjektleder',
    seksjonsleder: 'by_prosjektleder',
    fagsjef_plan_bygg: 'by_prosjektleder',
    direktor_byutvikling: 'by_prosjektleder',
    arkitekt: 'by_arkitekt',
    seniorarkitekt: 'by_arkitekt',
    byarkitekt: 'by_arkitekt'
  };

  const SPORT_ROLE_SCOPE_BY_TITLE = {
    mosjonist: 'sport_utover',
    aktiv_utover: 'sport_utover',
    konkurranseutover: 'sport_utover',
    klubbspiller: 'sport_utover',
    eliteseriespiller: 'sport_utover',
    profesjonell_utover: 'sport_utover',
    landslagsutover: 'sport_utover',
    kaptein: 'sport_kaptein',
    trener: 'sport_trener',
    hovedtrener: 'sport_trener',
    sportssjef: 'sport_sportsledelse',
    olympisk_mester: 'sport_legende',
    idrettsstjerne: 'sport_legende',
    idrettslegende: 'sport_legende'
  };

  const PSYKOLOGI_ROLE_SCOPE_BY_TITLE = {
    miljoassistent: 'psykologi_miljoarbeid',
    sosialassistent: 'psykologi_miljoarbeid',
    aktivitetsleder_omsorgsarbeid: 'psykologi_miljoarbeid',
    miljoarbeider: 'psykologi_miljoarbeid',
    veileder: 'psykologi_arbeids_og_karriereveiledning',
    radgiver: 'psykologi_arbeids_og_karriereveiledning',
    seniorradgiver: 'psykologi_arbeids_og_karriereveiledning',
    jobbveileder: 'psykologi_arbeids_og_karriereveiledning',
    karriereveileder: 'psykologi_arbeids_og_karriereveiledning',
    karriereradgiver: 'psykologi_arbeids_og_karriereveiledning',
    psykolog: 'psykolog',
    spesialistpsykolog: 'spesialistpsykolog',
    fagansvarlig: 'fagansvarlig',
    klinikkleder: 'klinikkleder'
  };

  function resolveCareerRoleScope(activePosition) {
    const careerId = normalize(activePosition?.career_id);
    const roleKey = slugify(activePosition?.role_key);
    const roleId = slugify(activePosition?.role_id);
    const titleKey = slugify(activePosition?.title);

    if (ROLE_SCOPE_BY_ROLE_ID[roleId]) return ROLE_SCOPE_BY_ROLE_ID[roleId];
    if (ROLE_SCOPE_BY_ROLE_ID[roleKey]) return ROLE_SCOPE_BY_ROLE_ID[roleKey];

    if (careerId === 'psykologi') {
      if (ROLE_ID_BY_SCOPE[roleKey] && roleKey.startsWith('psykologi_')) return roleKey;
      if (['psykolog', 'spesialistpsykolog', 'fagansvarlig', 'klinikkleder'].includes(roleKey)) return roleKey;
      if (PSYKOLOGI_ROLE_SCOPE_BY_TITLE[titleKey]) return PSYKOLOGI_ROLE_SCOPE_BY_TITLE[titleKey];
    }

    if (careerId === 'sport') {
      if (ROLE_ID_BY_SCOPE[roleKey] && roleKey.startsWith('sport_')) return roleKey;
      if (SPORT_ROLE_SCOPE_BY_TITLE[titleKey]) return SPORT_ROLE_SCOPE_BY_TITLE[titleKey];
      if (titleKey.includes('mosjonist') || titleKey.includes('utover') || titleKey.includes('konkurranseutover') || titleKey.includes('klubbspiller') || titleKey.includes('eliteseriespiller') || titleKey.includes('landslagsutover')) return 'sport_utover';
      if (titleKey.includes('kaptein')) return 'sport_kaptein';
      if (titleKey.includes('trener')) return 'sport_trener';
      if (titleKey.includes('sportssjef')) return 'sport_sportsledelse';
      if (titleKey.includes('olympisk_mester') || titleKey.includes('idrettsstjerne') || titleKey.includes('idrettslegende')) return 'sport_legende';
    }

    if (careerId === 'by') {
      if (ROLE_ID_BY_SCOPE[roleKey] && roleKey.startsWith('by_')) return roleKey;
      if (BY_ROLE_SCOPE_BY_TITLE[titleKey]) return BY_ROLE_SCOPE_BY_TITLE[titleKey];
      if (titleKey.includes('studentassistent') || titleKey.includes('praktikant') || titleKey.includes('prosjektmedarbeider')) return 'by_assistent';
      if (titleKey.includes('saksbehandler') || titleKey.includes('forstekonsulent')) return 'by_saksbehandler';
      if (titleKey.includes('radgiver') || titleKey.includes('arealplanlegger') || titleKey.includes('byplanlegger')) return 'by_radgiver_plan';
      if (titleKey.includes('prosjektleder') || titleKey.includes('seksjonsleder') || titleKey.includes('fagsjef') || titleKey.includes('direktor')) return 'by_prosjektleder';
      if (titleKey.includes('arkitekt')) return 'by_arkitekt';
    }

    if (careerId === 'sosial_laering') {
      if (roleKey === 'barnehageassistent' || roleKey.includes('barnehageassistent')) return 'barnehageassistent';
      if (SOSIAL_LAERING_ROLE_SCOPE_BY_TITLE[titleKey]) return SOSIAL_LAERING_ROLE_SCOPE_BY_TITLE[titleKey];
      if (titleKey.includes('barnehageassistent') || titleKey.includes('pedagogisk_medarbeider')) return 'barnehageassistent';
    }

    if (careerId === 'naeringsliv') {
      if (NAERINGSLIV_ROLE_SCOPE_BY_TITLE[roleKey]) return NAERINGSLIV_ROLE_SCOPE_BY_TITLE[roleKey];
      if (NAERINGSLIV_ROLE_SCOPE_BY_TITLE[titleKey]) return NAERINGSLIV_ROLE_SCOPE_BY_TITLE[titleKey];
      if (roleKey.includes('ekspedit') || roleKey.includes('butikk')) return 'ekspeditor';
      if (roleKey.includes('lager_og_driftsmedarbeider')) return 'lager_og_driftsmedarbeider';
      if (roleKey.includes('renholder')) return 'renholder';
      if (roleKey === 'arbeider') return 'arbeider';
      if (roleKey.includes('administrasjon')) return 'administrasjonsmedarbeider';
      if (roleKey.includes('fagarbeider')) return 'fagarbeider';
      if (roleKey.includes('formann') || roleKey.includes('arbeidsleder') || roleKey.includes('skiftleder')) return 'formann';
      if (roleKey.includes('controller')) return 'controller';
      if (roleKey.includes('avdelingsleder')) return 'avdelingsleder';
      if (roleKey.includes('mellomleder')) return 'mellomleder';
      if (titleKey.includes('ekspedit') || titleKey.includes('butikkmedarbeider')) return 'ekspeditor';
      if (titleKey.includes('renholder') || titleKey.includes('renhold')) return 'renholder';
      if (titleKey.includes('lager')) return 'arbeider';
      if (titleKey.includes('administrasjon')) return 'administrasjonsmedarbeider';
      if (titleKey.includes('fagarbeider')) return 'fagarbeider';
      if (titleKey.includes('formann') || titleKey.includes('arbeidsleder') || titleKey.includes('skiftleder')) return 'formann';
      if (titleKey.includes('controller') || titleKey.includes('finansanalytiker') || titleKey.includes('finanssjef') || titleKey.includes('finansdirektor') || titleKey.includes('okonomi_og_finanssjef')) return 'controller';
      if (titleKey.includes('avdelingsleder') || titleKey.includes('driftsleder') || titleKey.includes('produksjonsleder') || titleKey.includes('butikksjef') || titleKey.includes('enhetsleder') || titleKey.includes('daglig_leder')) return 'avdelingsleder';
      if (titleKey.includes('grunder') || titleKey.includes('bedriftseier') || titleKey.includes('konsern') || titleKey.includes('investor') || titleKey.includes('kapital') || titleKey.includes('industrieier') || titleKey.includes('industribygger')) return 'mellomleder';
    }

    if (roleKey.includes('psykologi_arbeids_og_karriereveiledning')) return 'psykologi_arbeids_og_karriereveiledning';
    if (roleKey.includes('psykologi_miljoarbeid')) return 'psykologi_miljoarbeid';
    if (roleKey.includes('psykolog') && !roleKey.includes('spesialist')) return 'psykolog';
    if (roleKey.includes('spesialistpsykolog')) return 'spesialistpsykolog';
    if (roleKey.includes('fagansvarlig')) return 'fagansvarlig';
    if (roleKey.includes('klinikkleder')) return 'klinikkleder';
    if (roleKey.includes('sport_utover')) return 'sport_utover';
    if (roleKey.includes('sport_kaptein')) return 'sport_kaptein';
    if (roleKey.includes('sport_trener')) return 'sport_trener';
    if (roleKey.includes('sport_sportsledelse')) return 'sport_sportsledelse';
    if (roleKey.includes('sport_legende')) return 'sport_legende';
    if (roleKey.includes('by_assistent')) return 'by_assistent';
    if (roleKey.includes('by_saksbehandler')) return 'by_saksbehandler';
    if (roleKey.includes('by_radgiver_plan')) return 'by_radgiver_plan';
    if (roleKey.includes('by_prosjektleder')) return 'by_prosjektleder';
    if (roleKey.includes('by_arkitekt')) return 'by_arkitekt';
    if (roleKey.includes('barnehageassistent')) return 'barnehageassistent';
    if (roleKey.includes('ekspeditor') || roleKey.includes('butikk')) return 'ekspeditor';
    if (roleKey.includes('lager_og_driftsmedarbeider')) return 'lager_og_driftsmedarbeider';
    if (roleKey.includes('renholder')) return 'renholder';
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
    return { role_scope, role_id, role_key };
  }

  const api = { resolveCareerRoleScope, resolveCareerRoleId, resolveCareerRole };
  globalScope.CivicationCareerRoleResolver = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
