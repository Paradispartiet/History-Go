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
    historie_arkiv_og_dokumentasjon: 'historie_arkiv_og_dokumentasjon',
    historie_forvaltning_og_radgivning: 'historie_forvaltning_og_radgivning',
    historie_museum_og_samling: 'historie_museum_og_samling',
    historie_forskning_og_akademia: 'historie_forskning_og_akademia',
    historie_fagledelse: 'historie_fagledelse',
    historie_institusjonsledelse: 'historie_institusjonsledelse',
    kunst_publikum_og_formidling: 'kunst_publikum_og_formidling',
    kunst_utstillingsproduksjon: 'kunst_utstillingsproduksjon',
    kunst_kuratering_og_program: 'kunst_kuratering_og_program',
    kunst_konservering_og_samling: 'kunst_konservering_og_samling',
    kunst_kunstnerisk_ledelse: 'kunst_kunstnerisk_ledelse',
    kunst_museumsledelse: 'kunst_museumsledelse',
    natur_felt_og_formidling: 'natur_felt_og_formidling',
    natur_forvaltning_og_radgivning: 'natur_forvaltning_og_radgivning',
    natur_biologi_og_forskning: 'natur_biologi_og_forskning',
    natur_miljoledelse: 'natur_miljoledelse',
    natur_politisk_myndighet: 'natur_politisk_myndighet',
    politikk_organisasjonsarbeid: 'politikk_organisasjonsarbeid',
    politikk_politisk_radgivning: 'politikk_politisk_radgivning',
    politikk_kommunal_ledelse: 'politikk_kommunal_ledelse',
    politikk_parlamentarisk_arbeid: 'politikk_parlamentarisk_arbeid',
    politikk_regjeringsledelse: 'politikk_regjeringsledelse',
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
    konserndirektor: 'mellomleder',
    konsernsjef: 'mellomleder',
    kapitalforvalter: 'mellomleder'
  };

  const NAERINGSLIV_NON_JOB_TITLES = new Set([
    'grunder','bedriftseier','investor','industribygger','industrieier'
  ]);

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
    mosjonist: 'sport_utover', aktiv_utover: 'sport_utover', konkurranseutover: 'sport_utover',
    klubbspiller: 'sport_utover', eliteseriespiller: 'sport_utover', profesjonell_utover: 'sport_utover',
    landslagsutover: 'sport_utover', kaptein: 'sport_kaptein', trener: 'sport_trener',
    hovedtrener: 'sport_trener', sportssjef: 'sport_sportsledelse', olympisk_mester: 'sport_legende',
    idrettsstjerne: 'sport_legende', idrettslegende: 'sport_legende'
  };

  const MEDIA_ROLE_SCOPE_BY_TITLE = {
    journalist: 'media_redaksjon', reporter: 'media_redaksjon', redaksjonsmedarbeider: 'media_redaksjon',
    redaktor: 'media_redaksjonell_ledelse', sjefredaktor: 'media_redaksjonell_ledelse', nyhetsleder: 'media_redaksjonell_ledelse'
  };

  const RELIGION_ROLE_SCOPE_BY_TITLE = {
    religionsformidler: 'religion_formidling_og_kulturarv', kurator: 'religion_formidling_og_kulturarv',
    fagkonsulent: 'religion_utredning_og_radgivning', seniorradgiver: 'religion_utredning_og_radgivning',
    religionshistoriker: 'religion_forskning', religionsviter: 'religion_forskning', forsker: 'religion_forskning',
    seniorforsker: 'religion_forskning', fagansvarlig: 'religion_fagledelse', seksjonsleder: 'religion_fagledelse',
    avdelingsleder: 'religion_fagledelse', avdelingsdirektor: 'religion_fagledelse', direktor: 'religion_fagledelse'
  };

  const FILOSOFI_ROLE_SCOPE_BY_TITLE = {
    idehistoriker: 'filosofi_forskning_og_formidling', filosof: 'filosofi_forskning_og_formidling',
    foreleser: 'filosofi_undervisning_og_akademia', professor: 'filosofi_undervisning_og_akademia'
  };

  const MUSIKK_ROLE_SCOPE_BY_TITLE = {
    sceneassistent: 'musikk_scene_og_produksjon', produksjonsassistent: 'musikk_scene_og_produksjon',
    tekniker_lys_lyd: 'musikk_scene_og_produksjon', produksjonskoordinator: 'musikk_scene_og_produksjon',
    utovende_musiker: 'musikk_utoving_og_ensemble', fast_musiker_band_ensemble: 'musikk_utoving_og_ensemble'
  };

  const HISTORIE_ROLE_SCOPE_BY_TITLE = {
    doktorgradsstudent: 'historie_forskning_og_akademia', arkivmedarbeider: 'historie_arkiv_og_dokumentasjon',
    saksbehandler: 'historie_forvaltning_og_radgivning', forstekonsulent: 'historie_forvaltning_og_radgivning',
    radgiver: 'historie_forvaltning_og_radgivning', seniorradgiver: 'historie_forvaltning_og_radgivning',
    arkivar: 'historie_arkiv_og_dokumentasjon', spesialradgiver: 'historie_forvaltning_og_radgivning',
    konservator: 'historie_museum_og_samling', kurator: 'historie_museum_og_samling',
    senior_konservator: 'historie_museum_og_samling', senior_kurator: 'historie_museum_og_samling',
    forsker: 'historie_forskning_og_akademia', seniorforsker: 'historie_forskning_og_akademia',
    seksjonsleder: 'historie_fagledelse', avdelingsleder: 'historie_fagledelse',
    avdelingsdirektor: 'historie_institusjonsledelse', direktor: 'historie_institusjonsledelse'
  };
  const HISTORIE_NON_JOB_TITLES = new Set(['student', 'masterstuden']);

  const KUNST_ROLE_SCOPE_BY_TITLE = {
    vertskap_museum_galleri: 'kunst_publikum_og_formidling',
    gallerimedarbeider: 'kunst_publikum_og_formidling',
    formidler: 'kunst_publikum_og_formidling',
    produksjonsassistent: 'kunst_utstillingsproduksjon',
    utstillingskoordinator: 'kunst_utstillingsproduksjon',
    utstillingsprodusent: 'kunst_utstillingsproduksjon',
    kuratorassistent: 'kunst_kuratering_og_program',
    kurator: 'kunst_kuratering_og_program',
    senior_kurator: 'kunst_kuratering_og_program',
    konservator: 'kunst_konservering_og_samling',
    senior_konservator: 'kunst_konservering_og_samling',
    kunstnerisk_leder: 'kunst_kunstnerisk_ledelse',
    museumsdirektor: 'kunst_museumsledelse'
  };
  const KUNST_NON_JOB_TITLES = new Set(['gallerist']);

  const NATUR_ROLE_SCOPE_BY_TITLE = {
    feltassistent: 'natur_felt_og_formidling', naturveileder: 'natur_felt_og_formidling',
    naturforvalter: 'natur_forvaltning_og_radgivning', radgiver_miljo_natur: 'natur_forvaltning_og_radgivning',
    seniorradgiver_miljo_natur: 'natur_forvaltning_og_radgivning', biolog: 'natur_biologi_og_forskning',
    okolog: 'natur_biologi_og_forskning', forsker_miljo_natur: 'natur_biologi_og_forskning',
    seniorforsker_miljo_natur: 'natur_biologi_og_forskning', naturvernleder: 'natur_miljoledelse',
    miljosjef: 'natur_miljoledelse', miljodirektor: 'natur_miljoledelse', statsrad_klima_og_miljo: 'natur_politisk_myndighet'
  };

  const POLITIKK_ROLE_SCOPE_BY_TITLE = {
    organisasjonssekretaer: 'politikk_organisasjonsarbeid', politisk_radgiver: 'politikk_politisk_radgivning',
    ordforer: 'politikk_kommunal_ledelse', stortingsrepresentant: 'politikk_parlamentarisk_arbeid',
    statssekretaer: 'politikk_regjeringsledelse', statsrad_minister: 'politikk_regjeringsledelse',
    statsminister: 'politikk_regjeringsledelse'
  };

  const SUBKULTUR_ROLE_SCOPE_BY_TITLE = {
    kulturhusvert: 'subkultur_arrangementsdrift', arrangementscrew: 'subkultur_arrangementsdrift',
    produksjonsassistent: 'subkultur_arrangementsdrift', kulturmedarbeider: 'subkultur_arrangementsdrift',
    arrangementsplanlegger: 'subkultur_program_og_koordinering', kulturkonsulent: 'subkultur_program_og_koordinering',
    booking_og_innholdskoordinator: 'subkultur_program_og_koordinering', produsent: 'subkultur_produksjon_og_prosjekt',
    prosjektleder_kulturarrangement: 'subkultur_produksjon_og_prosjekt', produksjonsleder: 'subkultur_produksjonsledelse',
    daglig_leder_kulturarena: 'subkultur_kulturarena_ledelse', observor: 'subkultur_arrangementsdrift',
    deltaker: 'subkultur_arrangementsdrift', hakkekylling: 'subkultur_arrangementsdrift', gatesmart: 'subkultur_arrangementsdrift',
    crew: 'subkultur_program_og_koordinering', gangster: 'subkultur_program_og_koordinering', dandy: 'subkultur_program_og_koordinering',
    kultfigur: 'subkultur_produksjon_og_prosjekt', trendsetter: 'subkultur_produksjon_og_prosjekt',
    undergrunnsikon: 'subkultur_produksjonsledelse', legend: 'subkultur_kulturarena_ledelse'
  };

  const PSYKOLOGI_ROLE_SCOPE_BY_TITLE = {
    miljoassistent: 'psykologi_miljoarbeid', sosialassistent: 'psykologi_miljoarbeid',
    aktivitetsleder_omsorgsarbeid: 'psykologi_miljoarbeid', miljoarbeider: 'psykologi_miljoarbeid',
    veileder: 'psykologi_arbeids_og_karriereveiledning', radgiver: 'psykologi_arbeids_og_karriereveiledning',
    seniorradgiver: 'psykologi_arbeids_og_karriereveiledning', jobbveileder: 'psykologi_arbeids_og_karriereveiledning',
    karriereveileder: 'psykologi_arbeids_og_karriereveiledning', karriereradgiver: 'psykologi_arbeids_og_karriereveiledning',
    psykolog: 'psykolog', spesialistpsykolog: 'spesialistpsykolog', fagansvarlig: 'fagansvarlig',
    klinikkleder: 'klinikkleder', forsker_psykologi: 'forsker_psykologi', professor_psykologi: 'professor_psykologi'
  };

  function mapped(map, roleKey, titleKey) {
    return map[roleKey] || map[titleKey] || null;
  }

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
      const hit = mapped(PSYKOLOGI_ROLE_SCOPE_BY_TITLE, roleKey, titleKey);
      if (hit) return hit;
      if (ROLE_ID_BY_SCOPE[roleKey] && (roleKey.startsWith('psykologi_') || roleKey.endsWith('_psykologi'))) return roleKey;
    }

    if (careerId === 'subkultur') {
      const hit = mapped(SUBKULTUR_ROLE_SCOPE_BY_TITLE, roleKey, titleKey);
      if (hit) return hit;
      if (ROLE_ID_BY_SCOPE[roleKey] && roleKey.startsWith('subkultur_')) return roleKey;
    }

    if (careerId === 'sport') {
      const hit = mapped(SPORT_ROLE_SCOPE_BY_TITLE, roleKey, titleKey);
      if (hit) return hit;
      if (ROLE_ID_BY_SCOPE[roleKey] && roleKey.startsWith('sport_')) return roleKey;
      if (titleKey.includes('utover') || titleKey.includes('klubbspiller')) return 'sport_utover';
      if (titleKey.includes('kaptein')) return 'sport_kaptein';
      if (titleKey.includes('trener')) return 'sport_trener';
      if (titleKey.includes('sportssjef')) return 'sport_sportsledelse';
    }

    if (careerId === 'media') {
      const hit = mapped(MEDIA_ROLE_SCOPE_BY_TITLE, roleKey, titleKey);
      if (hit) return hit;
      if (ROLE_ID_BY_SCOPE[roleKey] && roleKey.startsWith('media_')) return roleKey;
    }

    if (careerId === 'religion') {
      const hit = mapped(RELIGION_ROLE_SCOPE_BY_TITLE, roleKey, titleKey);
      if (hit) return hit;
      if (ROLE_ID_BY_SCOPE[roleKey] && roleKey.startsWith('religion_')) return roleKey;
    }

    if (careerId === 'filosofi') {
      const hit = mapped(FILOSOFI_ROLE_SCOPE_BY_TITLE, roleKey, titleKey);
      if (hit) return hit;
      if (ROLE_ID_BY_SCOPE[roleKey] && roleKey.startsWith('filosofi_')) return roleKey;
    }

    if (careerId === 'musikk') {
      const hit = mapped(MUSIKK_ROLE_SCOPE_BY_TITLE, roleKey, titleKey);
      if (hit) return hit;
      if (ROLE_ID_BY_SCOPE[roleKey] && roleKey.startsWith('musikk_')) return roleKey;
    }

    if (careerId === 'historie') {
      if (HISTORIE_NON_JOB_TITLES.has(titleKey) || HISTORIE_NON_JOB_TITLES.has(roleKey)) return 'unknown';
      const hit = mapped(HISTORIE_ROLE_SCOPE_BY_TITLE, roleKey, titleKey);
      if (hit) return hit;
      if (ROLE_ID_BY_SCOPE[roleKey] && roleKey.startsWith('historie_')) return roleKey;
    }

    if (careerId === 'kunst') {
      if (KUNST_NON_JOB_TITLES.has(titleKey) || KUNST_NON_JOB_TITLES.has(roleKey)) return 'unknown';
      const hit = mapped(KUNST_ROLE_SCOPE_BY_TITLE, roleKey, titleKey);
      if (hit) return hit;
      if (ROLE_ID_BY_SCOPE[roleKey] && roleKey.startsWith('kunst_')) return roleKey;
    }

    if (careerId === 'natur') {
      const hit = mapped(NATUR_ROLE_SCOPE_BY_TITLE, roleKey, titleKey);
      if (hit) return hit;
      if (ROLE_ID_BY_SCOPE[roleKey] && roleKey.startsWith('natur_')) return roleKey;
    }

    if (careerId === 'politikk') {
      const hit = mapped(POLITIKK_ROLE_SCOPE_BY_TITLE, roleKey, titleKey);
      if (hit) return hit;
      if (ROLE_ID_BY_SCOPE[roleKey] && roleKey.startsWith('politikk_')) return roleKey;
    }

    if (careerId === 'by') {
      const hit = mapped(BY_ROLE_SCOPE_BY_TITLE, roleKey, titleKey);
      if (hit) return hit;
      if (ROLE_ID_BY_SCOPE[roleKey] && roleKey.startsWith('by_')) return roleKey;
      if (titleKey.includes('studentassistent') || titleKey.includes('praktikant') || titleKey.includes('prosjektmedarbeider')) return 'by_assistent';
      if (titleKey.includes('saksbehandler') || titleKey.includes('forstekonsulent')) return 'by_saksbehandler';
      if (titleKey.includes('radgiver') || titleKey.includes('arealplanlegger') || titleKey.includes('byplanlegger')) return 'by_radgiver_plan';
      if (titleKey.includes('prosjektleder') || titleKey.includes('seksjonsleder') || titleKey.includes('fagsjef') || titleKey.includes('direktor')) return 'by_prosjektleder';
      if (titleKey.includes('arkitekt')) return 'by_arkitekt';
    }

    if (careerId === 'sosial_laering') {
      const hit = mapped(SOSIAL_LAERING_ROLE_SCOPE_BY_TITLE, roleKey, titleKey);
      if (hit) return hit;
      if (roleKey.includes('barnehageassistent') || titleKey.includes('barnehageassistent') || titleKey.includes('pedagogisk_medarbeider')) return 'barnehageassistent';
    }

    if (careerId === 'naeringsliv') {
      if (NAERINGSLIV_NON_JOB_TITLES.has(titleKey) || NAERINGSLIV_NON_JOB_TITLES.has(roleKey)) return 'unknown';
      const hit = mapped(NAERINGSLIV_ROLE_SCOPE_BY_TITLE, roleKey, titleKey);
      if (hit) return hit;
      const key = roleKey || titleKey;
      if (key.includes('ekspedit') || key.includes('butikk')) return 'ekspeditor';
      if (key.includes('lager_og_driftsmedarbeider')) return 'lager_og_driftsmedarbeider';
      if (key.includes('renholder') || key.includes('renhold')) return 'renholder';
      if (key === 'arbeider' || key.includes('lager')) return 'arbeider';
      if (key.includes('administrasjon')) return 'administrasjonsmedarbeider';
      if (key.includes('fagarbeider')) return 'fagarbeider';
      if (key.includes('formann') || key.includes('arbeidsleder') || key.includes('skiftleder')) return 'formann';
      if (key.includes('controller') || key.includes('finansanalytiker') || key.includes('finanssjef') || key.includes('finansdirektor')) return 'controller';
      if (key.includes('avdelingsleder') || key.includes('driftsleder') || key.includes('produksjonsleder') || key.includes('butikksjef') || key.includes('enhetsleder') || key.includes('daglig_leder')) return 'avdelingsleder';
      if (key.includes('konsern') || key.includes('kapitalforvalter')) return 'mellomleder';
    }

    const genericScopes = [
      'religion_formidling_og_kulturarv','religion_utredning_og_radgivning','religion_forskning','religion_fagledelse',
      'filosofi_forskning_og_formidling','filosofi_undervisning_og_akademia','musikk_scene_og_produksjon','musikk_utoving_og_ensemble',
      'historie_arkiv_og_dokumentasjon','historie_forvaltning_og_radgivning','historie_museum_og_samling','historie_forskning_og_akademia','historie_fagledelse','historie_institusjonsledelse',
      'kunst_publikum_og_formidling','kunst_utstillingsproduksjon','kunst_kuratering_og_program','kunst_konservering_og_samling','kunst_kunstnerisk_ledelse','kunst_museumsledelse',
      'natur_felt_og_formidling','natur_forvaltning_og_radgivning','natur_biologi_og_forskning','natur_miljoledelse','natur_politisk_myndighet',
      'politikk_organisasjonsarbeid','politikk_politisk_radgivning','politikk_kommunal_ledelse','politikk_parlamentarisk_arbeid','politikk_regjeringsledelse',
      'subkultur_arrangementsdrift','subkultur_program_og_koordinering','subkultur_produksjon_og_prosjekt','subkultur_produksjonsledelse','subkultur_kulturarena_ledelse',
      'psykologi_arbeids_og_karriereveiledning','psykologi_miljoarbeid','forsker_psykologi','professor_psykologi',
      'sport_utover','sport_kaptein','sport_trener','sport_sportsledelse','sport_legende','media_redaksjonell_ledelse','media_redaksjon',
      'by_assistent','by_saksbehandler','by_radgiver_plan','by_prosjektleder','by_arkitekt'
    ];

    for (const scope of genericScopes) {
      if (roleKey.includes(scope)) return scope;
    }

    if (roleKey.includes('psykolog') && !roleKey.includes('spesialist')) return 'psykolog';
    if (roleKey.includes('spesialistpsykolog')) return 'spesialistpsykolog';
    if (roleKey.includes('fagansvarlig')) return 'fagansvarlig';
    if (roleKey.includes('klinikkleder')) return 'klinikkleder';
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
