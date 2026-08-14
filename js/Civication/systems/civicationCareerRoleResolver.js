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
    media_redaksjon: 'media_redaksjon',
    media_redaksjonell_ledelse: 'media_redaksjonell_ledelse',
    religion_formidling_og_kulturarv: 'religion_formidling_og_kulturarv',
    religion_utredning_og_radgivning: 'religion_utredning_og_radgivning',
    religion_forskning: 'religion_forskning',
    religion_fagledelse: 'religion_fagledelse',
    filosofi_forskning_og_formidling: 'filosofi_forskning_og_formidling',
    filosofi_undervisning_og_akademia: 'filosofi_undervisning_og_akademia',
    musikk_scene_og_produksjon: 'musikk_scene_og_produksjon',
    musikk_utoving_og_ensemble: 'musikk_utoving_og_ensemble',
    natur_felt_og_formidling: 'natur_felt_og_formidling',
    natur_forvaltning_og_radgivning: 'natur_forvaltning_og_radgivning',
    natur_biologi_og_forskning: 'natur_biologi_og_forskning',
    natur_miljoledelse: 'natur_miljoledelse',
    natur_politisk_myndighet: 'natur_politisk_myndighet',
    subkultur_arrangementsdrift: 'subkultur_kulturhusvert',
    subkultur_program_og_koordinering: 'subkultur_arrangementsplanlegger',
    subkultur_produksjon_og_prosjekt: 'subkultur_produsent',
    subkultur_produksjonsledelse: 'subkultur_produksjonsledelse',
    subkultur_kulturarena_ledelse: 'subkultur_kulturarena_ledelse',
    psykologi_miljoarbeid: 'psykologi_miljoarbeider',
    psykologi_arbeids_og_karriereveiledning: 'psykologi_karriereveileder',
    psykolog: 'psykologi_psykolog',
    spesialistpsykolog: 'psykologi_spesialistpsykolog',
    fagansvarlig: 'psykologi_fagansvarlig',
    klinikkleder: 'psykologi_klinikkleder',
    forsker_psykologi: 'psykologi_forsker_psykologi',
    professor_psykologi: 'psykologi_professor_psykologi'
  };

  const ROLE_SCOPE_BY_ROLE_ID = Object.fromEntries(
    Object.entries(ROLE_ID_BY_SCOPE).map(([scope, roleId]) => [roleId, scope])
  );
  ROLE_SCOPE_BY_ROLE_ID.renholder = 'renholder';
  ROLE_SCOPE_BY_ROLE_ID.barnehageassistent = 'barnehageassistent';

  const NAERINGSLIV_ROLE_SCOPE_BY_TITLE = {
    arbeider: 'arbeider', ekspeditor: 'ekspeditor', butikkmedarbeider: 'ekspeditor', ekspeditor_butikkmedarbeider: 'ekspeditor',
    lager_og_driftsmedarbeider: 'lager_og_driftsmedarbeider', renholder: 'renholder', okonomi_og_administrasjonsmedarbeider: 'administrasjonsmedarbeider', administrasjonsmedarbeider: 'administrasjonsmedarbeider',
    fagarbeider: 'fagarbeider', skiftleder: 'formann', formann: 'formann', arbeidsleder: 'formann', formann_arbeidsleder: 'formann', controller: 'controller', finansanalytiker: 'controller',
    okonomi_og_finanssjef: 'controller', finansdirektor: 'controller', avdelingsleder: 'avdelingsleder', driftsleder: 'avdelingsleder', produksjonsleder: 'avdelingsleder', butikksjef_enhetsleder: 'avdelingsleder',
    daglig_leder: 'avdelingsleder', grunder: 'mellomleder', bedriftseier: 'mellomleder', konserndirektor: 'mellomleder', konsernsjef: 'mellomleder', investor: 'mellomleder', kapitalforvalter: 'mellomleder',
    industribygger: 'mellomleder', industrieier: 'mellomleder'
  };

  const SOSIAL_LAERING_ROLE_SCOPE_BY_TITLE = { barnehageassistent_pedagogisk_medarbeider: 'barnehageassistent' };
  const BY_ROLE_SCOPE_BY_TITLE = {
    studentassistent: 'by_assistent', praktikant_arkitektur_plan: 'by_assistent', prosjektmedarbeider: 'by_assistent', saksbehandler_plan_bygg: 'by_saksbehandler', forstekonsulent: 'by_saksbehandler',
    radgiver_byutvikling: 'by_radgiver_plan', seniorradgiver_byutvikling: 'by_radgiver_plan', arealplanlegger: 'by_radgiver_plan', byplanlegger: 'by_radgiver_plan', prosjektleder_byutvikling: 'by_prosjektleder',
    seksjonsleder: 'by_prosjektleder', fagsjef_plan_bygg: 'by_prosjektleder', direktor_byutvikling: 'by_prosjektleder', arkitekt: 'by_arkitekt', seniorarkitekt: 'by_arkitekt', byarkitekt: 'by_arkitekt'
  };
  const SPORT_ROLE_SCOPE_BY_TITLE = {
    mosjonist: 'sport_utover', aktiv_utover: 'sport_utover', konkurranseutover: 'sport_utover', klubbspiller: 'sport_utover', eliteseriespiller: 'sport_utover', profesjonell_utover: 'sport_utover', landslagsutover: 'sport_utover',
    kaptein: 'sport_kaptein', trener: 'sport_trener', hovedtrener: 'sport_trener', sportssjef: 'sport_sportsledelse', olympisk_mester: 'sport_legende', idrettsstjerne: 'sport_legende', idrettslegende: 'sport_legende'
  };
  const MEDIA_ROLE_SCOPE_BY_TITLE = {
    journalist: 'media_redaksjon', reporter: 'media_redaksjon', redaksjonsmedarbeider: 'media_redaksjon', redaktor: 'media_redaksjonell_ledelse', sjefredaktor: 'media_redaksjonell_ledelse', nyhetsleder: 'media_redaksjonell_ledelse'
  };
  const RELIGION_ROLE_SCOPE_BY_TITLE = {
    religionsformidler: 'religion_formidling_og_kulturarv', kurator: 'religion_formidling_og_kulturarv',
    fagkonsulent: 'religion_utredning_og_radgivning', seniorradgiver: 'religion_utredning_og_radgivning',
    religionshistoriker: 'religion_forskning', religionsviter: 'religion_forskning', forsker: 'religion_forskning', seniorforsker: 'religion_forskning',
    fagansvarlig: 'religion_fagledelse', seksjonsleder: 'religion_fagledelse', avdelingsleder: 'religion_fagledelse', avdelingsdirektor: 'religion_fagledelse', direktor: 'religion_fagledelse'
  };
  const FILOSOFI_ROLE_SCOPE_BY_TITLE = {
    idehistoriker: 'filosofi_forskning_og_formidling', filosof: 'filosofi_forskning_og_formidling',
    foreleser: 'filosofi_undervisning_og_akademia', professor: 'filosofi_undervisning_og_akademia'
  };
  const MUSIKK_ROLE_SCOPE_BY_TITLE = {
    sceneassistent: 'musikk_scene_og_produksjon', produksjonsassistent: 'musikk_scene_og_produksjon', tekniker_lys_lyd: 'musikk_scene_og_produksjon', produksjonskoordinator: 'musikk_scene_og_produksjon',
    utovende_musiker: 'musikk_utoving_og_ensemble', fast_musiker_band_ensemble: 'musikk_utoving_og_ensemble'
  };
  const NATUR_ROLE_SCOPE_BY_TITLE = {
    feltassistent: 'natur_felt_og_formidling', naturveileder: 'natur_felt_og_formidling',
    naturforvalter: 'natur_forvaltning_og_radgivning', radgiver_miljo_natur: 'natur_forvaltning_og_radgivning', seniorradgiver_miljo_natur: 'natur_forvaltning_og_radgivning',
    biolog: 'natur_biologi_og_forskning', okolog: 'natur_biologi_og_forskning', forsker_miljo_natur: 'natur_biologi_og_forskning', seniorforsker_miljo_natur: 'natur_biologi_og_forskning',
    naturvernleder: 'natur_miljoledelse', miljosjef: 'natur_miljoledelse', miljodirektor: 'natur_miljoledelse',
    statsrad_klima_og_miljo: 'natur_politisk_myndighet'
  };
  const SUBKULTUR_ROLE_SCOPE_BY_TITLE = {
    kulturhusvert: 'subkultur_arrangementsdrift', arrangementscrew: 'subkultur_arrangementsdrift', produksjonsassistent: 'subkultur_arrangementsdrift', kulturmedarbeider: 'subkultur_arrangementsdrift',
    arrangementsplanlegger: 'subkultur_program_og_koordinering', kulturkonsulent: 'subkultur_program_og_koordinering', booking_og_innholdskoordinator: 'subkultur_program_og_koordinering',
    produsent: 'subkultur_produksjon_og_prosjekt', prosjektleder_kulturarrangement: 'subkultur_produksjon_og_prosjekt', produksjonsleder: 'subkultur_produksjonsledelse', daglig_leder_kulturarena: 'subkultur_kulturarena_ledelse',
    observor: 'subkultur_arrangementsdrift', deltaker: 'subkultur_arrangementsdrift', hakkekylling: 'subkultur_arrangementsdrift', gatesmart: 'subkultur_arrangementsdrift', crew: 'subkultur_program_og_koordinering', gangster: 'subkultur_program_og_koordinering',
    dandy: 'subkultur_program_og_koordinering', kultfigur: 'subkultur_produksjon_og_prosjekt', trendsetter: 'subkultur_produksjon_og_prosjekt', undergrunnsikon: 'subkultur_produksjonsledelse', legend: 'subkultur_kulturarena_ledelse'
  };
  const PSYKOLOGI_ROLE_SCOPE_BY_TITLE = {
    miljoassistent: 'psykologi_miljoarbeid', sosialassistent: 'psykologi_miljoarbeid', aktivitetsleder_omsorgsarbeid: 'psykologi_miljoarbeid', miljoarbeider: 'psykologi_miljoarbeid',
    veileder: 'psykologi_arbeids_og_karriereveiledning', radgiver: 'psykologi_arbeids_og_karriereveiledning', seniorradgiver: 'psykologi_arbeids_og_karriereveiledning', jobbveileder: 'psykologi_arbeids_og_karriereveiledning',
    karriereveileder: 'psykologi_arbeids_og_karriereveiledning', karriereradgiver: 'psykologi_arbeids_og_karriereveiledning', psykolog: 'psykolog', spesialistpsykolog: 'spesialistpsykolog', fagansvarlig: 'fagansvarlig', klinikkleder: 'klinikkleder',
    forsker_psykologi: 'forsker_psykologi', professor_psykologi: 'professor_psykologi'
  };

  function resolveCareerRoleScope(activePosition) {
    const careerId = normalize(activePosition?.career_id);
    const roleKey = slugify(activePosition?.role_key);
    const roleId = slugify(activePosition?.role_id);
    const titleKey = slugify(activePosition?.title);
    const explicitScope = slugify(activePosition?.role_scope);
    if (ROLE_ID_BY_SCOPE[explicitScope]) return explicitScope;
    if (ROLE_SCOPE_BY_ROLE_ID[roleId]) return ROLE_SCOPE_BY_ROLE_ID[roleId];
    if (ROLE_SCOPE_BY_ROLE_ID[roleKey]) return ROLE_SCOPE_BY_ROLE_ID[roleKey];

    if (careerId === 'psykologi') {
      if (ROLE_ID_BY_SCOPE[roleKey] && (roleKey.startsWith('psykologi_') || roleKey.endsWith('_psykologi'))) return roleKey;
      if (['psykolog', 'spesialistpsykolog', 'fagansvarlig', 'klinikkleder'].includes(roleKey)) return roleKey;
      if (PSYKOLOGI_ROLE_SCOPE_BY_TITLE[titleKey]) return PSYKOLOGI_ROLE_SCOPE_BY_TITLE[titleKey];
    }
    if (careerId === 'subkultur') {
      if (ROLE_ID_BY_SCOPE[roleKey] && roleKey.startsWith('subkultur_')) return roleKey;
      if (SUBKULTUR_ROLE_SCOPE_BY_TITLE[roleKey]) return SUBKULTUR_ROLE_SCOPE_BY_TITLE[roleKey];
      if (SUBKULTUR_ROLE_SCOPE_BY_TITLE[titleKey]) return SUBKULTUR_ROLE_SCOPE_BY_TITLE[titleKey];
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
    if (careerId === 'media') {
      if (ROLE_ID_BY_SCOPE[roleKey] && roleKey.startsWith('media_')) return roleKey;
      if (MEDIA_ROLE_SCOPE_BY_TITLE[roleKey]) return MEDIA_ROLE_SCOPE_BY_TITLE[roleKey];
      if (MEDIA_ROLE_SCOPE_BY_TITLE[titleKey]) return MEDIA_ROLE_SCOPE_BY_TITLE[titleKey];
    }
    if (careerId === 'religion') {
      if (ROLE_ID_BY_SCOPE[roleKey] && roleKey.startsWith('religion_')) return roleKey;
      if (RELIGION_ROLE_SCOPE_BY_TITLE[roleKey]) return RELIGION_ROLE_SCOPE_BY_TITLE[roleKey];
      if (RELIGION_ROLE_SCOPE_BY_TITLE[titleKey]) return RELIGION_ROLE_SCOPE_BY_TITLE[titleKey];
    }
    if (careerId === 'filosofi') {
      if (ROLE_ID_BY_SCOPE[roleKey] && roleKey.startsWith('filosofi_')) return roleKey;
      if (FILOSOFI_ROLE_SCOPE_BY_TITLE[roleKey]) return FILOSOFI_ROLE_SCOPE_BY_TITLE[roleKey];
      if (FILOSOFI_ROLE_SCOPE_BY_TITLE[titleKey]) return FILOSOFI_ROLE_SCOPE_BY_TITLE[titleKey];
    }
    if (careerId === 'musikk') {
      if (ROLE_ID_BY_SCOPE[roleKey] && roleKey.startsWith('musikk_')) return roleKey;
      if (MUSIKK_ROLE_SCOPE_BY_TITLE[roleKey]) return MUSIKK_ROLE_SCOPE_BY_TITLE[roleKey];
      if (MUSIKK_ROLE_SCOPE_BY_TITLE[titleKey]) return MUSIKK_ROLE_SCOPE_BY_TITLE[titleKey];
    }
    if (careerId === 'natur') {
      if (ROLE_ID_BY_SCOPE[roleKey] && roleKey.startsWith('natur_')) return roleKey;
      if (NATUR_ROLE_SCOPE_BY_TITLE[roleKey]) return NATUR_ROLE_SCOPE_BY_TITLE[roleKey];
      if (NATUR_ROLE_SCOPE_BY_TITLE[titleKey]) return NATUR_ROLE_SCOPE_BY_TITLE[titleKey];
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

    if (roleKey.includes('religion_formidling_og_kulturarv')) return 'religion_formidling_og_kulturarv';
    if (roleKey.includes('religion_utredning_og_radgivning')) return 'religion_utredning_og_radgivning';
    if (roleKey.includes('religion_forskning')) return 'religion_forskning';
    if (roleKey.includes('religion_fagledelse')) return 'religion_fagledelse';
    if (roleKey.includes('filosofi_forskning_og_formidling')) return 'filosofi_forskning_og_formidling';
    if (roleKey.includes('filosofi_undervisning_og_akademia')) return 'filosofi_undervisning_og_akademia';
    if (roleKey.includes('musikk_scene_og_produksjon')) return 'musikk_scene_og_produksjon';
    if (roleKey.includes('musikk_utoving_og_ensemble')) return 'musikk_utoving_og_ensemble';
    if (roleKey.includes('natur_felt_og_formidling')) return 'natur_felt_og_formidling';
    if (roleKey.includes('natur_forvaltning_og_radgivning')) return 'natur_forvaltning_og_radgivning';
    if (roleKey.includes('natur_biologi_og_forskning')) return 'natur_biologi_og_forskning';
    if (roleKey.includes('natur_miljoledelse')) return 'natur_miljoledelse';
    if (roleKey.includes('natur_politisk_myndighet')) return 'natur_politisk_myndighet';
    if (roleKey.includes('subkultur_arrangementsdrift')) return 'subkultur_arrangementsdrift';
    if (roleKey.includes('subkultur_program_og_koordinering')) return 'subkultur_program_og_koordinering';
    if (roleKey.includes('subkultur_produksjon_og_prosjekt')) return 'subkultur_produksjon_og_prosjekt';
    if (roleKey.includes('subkultur_produksjonsledelse')) return 'subkultur_produksjonsledelse';
    if (roleKey.includes('subkultur_kulturarena_ledelse')) return 'subkultur_kulturarena_ledelse';
    if (roleKey.includes('psykologi_arbeids_og_karriereveiledning')) return 'psykologi_arbeids_og_karriereveiledning';
    if (roleKey.includes('psykologi_miljoarbeid')) return 'psykologi_miljoarbeid';
    if (roleKey.includes('forsker_psykologi')) return 'forsker_psykologi';
    if (roleKey.includes('professor_psykologi')) return 'professor_psykologi';
    if (roleKey.includes('psykolog') && !roleKey.includes('spesialist')) return 'psykolog';
    if (roleKey.includes('spesialistpsykolog')) return 'spesialistpsykolog';
    if (roleKey.includes('fagansvarlig')) return 'fagansvarlig';
    if (roleKey.includes('klinikkleder')) return 'klinikkleder';
    if (roleKey.includes('sport_utover')) return 'sport_utover';
    if (roleKey.includes('sport_kaptein')) return 'sport_kaptein';
    if (roleKey.includes('sport_trener')) return 'sport_trener';
    if (roleKey.includes('sport_sportsledelse')) return 'sport_sportsledelse';
    if (roleKey.includes('sport_legende')) return 'sport_legende';
    if (roleKey.includes('media_redaksjonell_ledelse')) return 'media_redaksjonell_ledelse';
    if (roleKey.includes('media_redaksjon')) return 'media_redaksjon';
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
    const role_key = role_scope && role_scope !== 'unknown' ? role_scope : slugify(activePosition?.role_key || activePosition?.title || '') || null;
    return { role_scope, role_id, role_key };
  }

  const api = { resolveCareerRoleScope, resolveCareerRoleId, resolveCareerRole };
  globalScope.CivicationCareerRoleResolver = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);