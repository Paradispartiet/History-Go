#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  inventory: 'data/fag/TV_og_Film/film_tv_variable_inventory_v1.json',
  emners: 'data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json',
  chapterAudit: 'reports/fagverk/film-tv-existing-chapter-reaudit-v1-audit.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  plan: 'data/fag/TV_og_Film/film_tv_learning_order_plan_v1.json',
  report: 'reports/fagverk/film-tv-learning-order-plan-v1-audit.json'
});
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const emne = (suffix) => `em_film_tv_${suffix}`;

const PHASES = Object.freeze([
  { id: 'analytisk_grunnlag', title: 'Analytisk grunnlag', purpose: 'Etablerer form-, fortellings- og formatbegreper som senere kapitler kan bruke uten å gjenta grunnanalysen.' },
  { id: 'historie_virkelighetskrav', title: 'Historie og virkelighetskrav', purpose: 'Plasserer verk og sendinger historisk før dokumentariske sannhets- og etikkspørsmål undersøkes.' },
  { id: 'representasjon_offentlighet_makt', title: 'Representasjon, offentlighet og makt', purpose: 'Flytter fra hva bilder gjør til hvem de gjør synlig, på hvilke premisser og i hvilke offentligheter.' },
  { id: 'produksjon_industri_styring', title: 'Produksjon, industri og styring', purpose: 'Bygger videre på det bevarte produksjonskapitlet med arbeidspraksis, teknologi, institusjoner, regulering og distribusjon.' },
  { id: 'publikum_sted_sirkulasjon', title: 'Publikum, sted og sirkulasjon', purpose: 'Kobler resepsjon og deltakelse til skjermgeografi, locations og stedlig produksjonsmakt.' },
  { id: 'arkiv_kulturarv_minne', title: 'Arkiv, kulturarv og minne', purpose: 'Avslutter forløpet med bevaring, tilgang, kanonisering og kulturell varighet.' }
]);

const COMMON_SOURCES = Object.freeze([
  'Minst ett konkret verk, program, sending, produksjonsforløp, visningssted eller arkivobjekt med inspectable kilde.',
  'Faglig sekundærkilde eller relevant institusjonskilde for hvert historisk, metodisk eller systemisk hovedpoeng.',
  'Påstandsspor fra hvert faktapunkt til brukt kilde; emne- og metodenavn er aldri tilstrekkelig evidens.'
]);

const UNIT_SPECS = Object.freeze([
  {
    id: 'audiovisuell-form-og-sansing', phase_id: 'analytisk_grunnlag', title: 'Audiovisuell form og sansing',
    prerequisites: [], existing_chapter_prerequisites: ['produksjon-studio-og-filmarbeid'],
    boundary: 'Eier hvordan bilde, lyd, rytme, bevegelse og fremføring skaper mening; produksjonsroller og narrativ organisering brukes som kontekst, ikke dobbelte hovedtema.',
    source_focus: 'Nærlesbare sekvenser må dokumentere samspillet mellom minst to formnivåer.',
    topic_suffixes: ['animasjon_bevegelse_design_og_tidsdannelse','audiovisuell_atmosfare','audiovisuell_rytme','bildeformat_skjermflate_og_audiovisuell_materialitet','digitale_bilder_vfx_og_syntetisk_realisme','lydform_dialog_musikk_effekt_og_stillhet','mise_en_scene_og_bildekomposisjon','skuespillerprestasjon_kropp_stemme_og_blikk','suspense_som_audiovisuell_teknikk','utsnitt_linse_kamerabevegelse_og_blokkering']
  },
  {
    id: 'fortelling-synsvinkel-og-sjanger', phase_id: 'analytisk_grunnlag', title: 'Fortelling, synsvinkel og sjanger',
    prerequisites: ['audiovisuell-form-og-sansing'], existing_chapter_prerequisites: [],
    boundary: 'Eier grunnmekanismer i narrasjon, perspektiv, tid, karakter og sjangerkontrakt; serie- og formatlogikk behandles i neste enhet.',
    source_focus: 'Verksanalysen må skille observerbar organisering fra fortolkning og publikumsvirkning.',
    topic_suffixes: ['fiksjon_realisme_og_verdensbygging','fokalisering_synsvinkel_og_kunnskapsfordeling','fortellingstid_rekkefolge_varighet_og_frekvens','karakter_rollefigur_og_fortellingsfunksjon','sjanger_konvensjon_og_kontrakt']
  },
  {
    id: 'serialitet-format-og-adaptasjon', phase_id: 'analytisk_grunnlag', title: 'Serialitet, format og adaptasjon',
    prerequisites: ['fortelling-synsvinkel-og-sjanger'], existing_chapter_prerequisites: [],
    boundary: 'Eier fortelling på tvers av episoder, sesonger, medier og repeterbare formater; industriell lisensiering og distribusjon eies senere.',
    source_focus: 'Sammenlignbare versjoner, episoder eller formatdokumenter må vise hva som faktisk endres mellom uttrykk og markeder.',
    topic_suffixes: ['adaptasjon_remake_og_intermedialitet','cliffhanger_og_informasjonsstans','direkte_underholdning_konkurranse_og_formatlogikk','episodisk_dramaturgi_og_fremdrift','franchise_univers_og_transmedial_fortelling','krim_sjanger_og_spenningsstruktur','serieformat_og_serialitet','sesongstruktur_og_fortellingsbue','sitcom_humor_og_format','sjangerhistorie_hybridisering_og_revisjon']
  },
  {
    id: 'filmhistorie-bevegelser-og-historiografi', phase_id: 'historie_virkelighetskrav', title: 'Filmhistorie, bevegelser og historiografi',
    prerequisites: ['audiovisuell-form-og-sansing','fortelling-synsvinkel-og-sjanger'], existing_chapter_prerequisites: [],
    boundary: 'Eier historiske forløp, periodisering og kildekritikk i filmhistorien; arkivets bevaringspraksis og kulturarvseffekter eies i sluttfasen.',
    source_focus: 'Periodisering må underbygges med både historiske primærspor og faglig historiografi, inkludert alternative og dekoloniale forløp.',
    topic_suffixes: ['animasjonshistorier_teknikker_og_industrier','globale_transnasjonale_og_dekoloniale_skjermhistorier','historiografi_periodisering_og_kildekritikk','klassisk_film_studiosystem_og_sjangerindustri','modernisme_nye_bolger_og_alternative_filmbevegelser','nasjonale_film_tv_historier_og_sammenligning','nordisk_film_og_tv_historie','norsk_filmhistorie_produksjon_verk_og_offentlighet','stumfilm_lydovergang_og_modernitet','tidlig_film_attraksjoner_og_visningskultur']
  },
  {
    id: 'fjernsyn-plattformer-og-deltakerhistorier', phase_id: 'historie_virkelighetskrav', title: 'Fjernsyn, plattformer og deltakerhistorier',
    prerequisites: ['filmhistorie-bevegelser-og-historiografi'], existing_chapter_prerequisites: ['kinoer-visningssteder-og-publikum'],
    boundary: 'Eier historiske overganger i fjernsyn, hjemme- og deltakerbilder; nåtidig plattformmakt og publikumsbruk eies i senere enheter.',
    source_focus: 'Teknologiske skifter må knyttes til dokumenterte endringer i institusjon, programform, tilgang eller bruk.',
    topic_suffixes: ['amatorfilm_hjemmevideo_og_deltakerhistorie','direktesendt_samtidighet_som_tv_historie','dokumentarhistorier_og_sannhetsregimer','glemte_forlop_og_historiografisk_revisjon','kommersiell_tv_kabel_og_satellitt','kringkastingsfjernsynets_historie','stromming_og_fjernsynets_plattformovergang','video_hjemmemedier_og_digital_omveltning']
  },
  {
    id: 'dokumentar-evidens-og-etikk', phase_id: 'historie_virkelighetskrav', title: 'Dokumentar, evidens og etikk',
    prerequisites: ['filmhistorie-bevegelser-og-historiografi','fortelling-synsvinkel-og-sjanger'], existing_chapter_prerequisites: [],
    boundary: 'Eier audiovisuelle virkelighetskrav, dokumentarformer og deltakeransvar; generell representasjon og arkivforvaltning behandles i egne enheter.',
    source_focus: 'Hvert sannhetskrav må skille opptak, iscenesettelse, rekonstruksjon, tolkning og etisk vurdering.',
    topic_suffixes: ['arkivdokumentar_found_footage_og_ombruk','direktebilde_og_evidens','dokumentar_etikk_og_deltakeransvar','dokumentar_sannhet_og_evidens','dokumentarformer_tradisjoner_og_moduser','dokumentarisk_sted_og_evidens','essayfilm_subjektivitet_og_audiovisuelt_argument','hverdagsdokumentasjon_og_amatorkultur','iscenesettelse_og_virkelighetskrav','observasjon_deltakelse_refleksivitet_og_performance','reality_observasjon_og_formatmakt','rekonstruksjon_animasjon_og_syntetiske_dokumentarbilder','tv_nyhetsbilde_og_evidens','virkelighetsbilde_og_evidenspastand','vitnesbyrd_traume_og_dokumentarisk_ansvar']
  },
  {
    id: 'representasjon-posisjon-og-motbilder', phase_id: 'representasjon_offentlighet_makt', title: 'Representasjon, posisjon og motbilder',
    prerequisites: ['dokumentar-evidens-og-etikk','audiovisuell-form-og-sansing'], existing_chapter_prerequisites: [],
    boundary: 'Eier analytiske makt- og posisjonsakser i framstilling; nasjon, offentlighet og mediebruk behandles i neste enhet.',
    source_focus: 'Analyse av identitet og makt må forankres i verkets konkrete form og relevante historiske eller samfunnsmessige kilder uten identitetsinferens fra bilder alene.',
    topic_suffixes: ['funksjonsvariasjon_ableisme_og_tilgjengelighet','interseksjonalitet_posisjonalitet_og_metode','kjonn_feministisk_filmanalyse_og_skjermmakt','klasse_arbeid_ulikhet_og_sosial_mobilitet','koloniale_blikk_dekolonisering_og_motbilder','rasialisering_etnisitet_hvithet_og_stereotypi','representasjon_identitet_og_makt','seksualitet_queer_representasjon_og_normkritikk','synlighet_fravaer_og_frasortering','urfolk_samisk_skjermkultur_og_suverenitet']
  },
  {
    id: 'skjermoffentlighet-fellesskap-og-samfunn', phase_id: 'representasjon_offentlighet_makt', title: 'Skjermoffentlighet, fellesskap og samfunn',
    prerequisites: ['representasjon-posisjon-og-motbilder','fjernsyn-plattformer-og-deltakerhistorier'], existing_chapter_prerequisites: [],
    boundary: 'Eier forholdet mellom audiovisuelle fortellinger, forestilte fellesskap og demokratisk offentlighet; resepsjonsmetoder og publikumsfellesskap eies senere.',
    source_focus: 'Påstander om samfunnseffekt må skilles fra analyse av representasjon, institusjonell hensikt og dokumentert mottakelse.',
    topic_suffixes: ['alder_barn_ungdom_og_livslop','byrepresentasjon_og_makt','film_tv_offentlighet_og_debatt','klima_miljo_og_okokritisk_skjermanalyse','kringkastet_offentlighet','migrasjon_diaspora_og_transnasjonal_identitet','nasjon_fortelling_og_forestilt_fellesskap','religion_livssyn_og_audiovisuell_representasjon','tv_offentlighet_og_demokratisk_deltakelse']
  },
  {
    id: 'skapende-arbeid-teknologi-og-ansvar', phase_id: 'produksjon_industri_styring', title: 'Skapende arbeid, teknologi og ansvar',
    prerequisites: ['audiovisuell-form-og-sansing'], existing_chapter_prerequisites: ['produksjon-studio-og-filmarbeid'],
    boundary: 'Eier utvidede produksjonspraksiser, arbeidsvilkår, tilgjengelig design og teknologisk ansvar; finansiering, marked og regulering eies i neste enhet.',
    source_focus: 'Arbeidsflyt og teknologipåstander må dokumenteres med produksjonskilder, faglige standarder eller etterprøvbar praksis, ikke markedsføring alene.',
    topic_suffixes: ['animasjonsproduksjon_og_pipeline','baerekraftig_produksjon_og_klimaregnskap','casting_skuespillerarbeid_og_intimitetskoordinering','hms_arbeidstid_kreditering_og_fagorganisering','kunstig_intelligens_automatisering_og_skapende_ansvar','opptaksledelse_planlegging_budsjett_og_logistikk','produksjonsdesign_scenografi_kostyme_og_rekvisitt','regi_sceneledelse_og_kreative_beslutninger','teksting_synstolking_og_tilgjengelig_design','utvikling_pitch_research_og_preproduksjon','vfx_virtuell_produksjon_og_sanntidsarbeidsflyt']
  },
  {
    id: 'industri-regulering-og-distribusjon', phase_id: 'produksjon_industri_styring', title: 'Industri, regulering og distribusjon',
    prerequisites: ['skapende-arbeid-teknologi-og-ansvar','fjernsyn-plattformer-og-deltakerhistorier'], existing_chapter_prerequisites: ['produksjon-studio-og-filmarbeid'],
    boundary: 'Eier økonomiske, institusjonelle og rettslige systemer som former produksjon og tilgang; konkret publikumsbruk og resepsjon eies i neste fase.',
    source_focus: 'Markeds- og maktpåstander må støtte seg på regulering, bransjedata, avtaler eller uavhengig forskning med oppgitt tid og territorium.',
    topic_suffixes: ['aldersgrenser_klassifisering_og_makt','eierskap_konsentrasjon_og_vertikal_integrasjon','festivaler_priser_markeder_og_portvakt','filmstotte_og_kulturpolitikk','internasjonal_samproduksjon_insentiver_og_produksjonsflyt','kommersialisering_og_verdikjeder','plattformmakt_og_algoritmisk_portvakt','publikum_som_marked','rettigheter_vinduer_og_distribusjon','sensur_regulering_og_ytringsrom','tv_formathandel_lisensiering_og_lokal_tilpasning','uformell_distribusjon_piratkopiering_og_tilgang']
  },
  {
    id: 'resepsjon-deltakelse-og-publikumsmetoder', phase_id: 'publikum_sted_sirkulasjon', title: 'Resepsjon, deltakelse og publikumsmetoder',
    prerequisites: ['serialitet-format-og-adaptasjon','industri-regulering-og-distribusjon'], existing_chapter_prerequisites: ['kinoer-visningssteder-og-publikum'],
    boundary: 'Eier publikums fortolkning, kropp, identitetsarbeid, fellesskap og forskningsmetoder; visningsinstitusjoner og markedssegmenter er allerede eller tidligere eid.',
    source_focus: 'Påstander om publikum krever dokumentert resepsjonsmateriale eller transparens om intervju, etnografi, survey og datasett; verksanalyse alene kan ikke bevise mottakelse.',
    topic_suffixes: ['barn_ungdom_og_audiovisuelle_publikum','fans_deltakelse_og_fellesskap','forventningshorisont_og_resepsjon','gjentakelse_og_resepsjon','husholdning_mobil_skjerm_og_flerskjermsbruk','kultfilm_resepsjon_og_fellesskap','publikum_som_sosiale_brukere','publikums_identitetsarbeid','publikumsforskning_intervju_etnografi_og_sporreundersokelse','resepsjonshistorie_kritikk_og_anmeldelser','tilgjengelige_visninger_og_publikumshindringer','tilskuerteori_identifikasjon_affekt_og_kropp']
  },
  {
    id: 'skjermsteder-identitet-og-sirkulasjon', phase_id: 'publikum_sted_sirkulasjon', title: 'Skjermsteder, identitet og sirkulasjon',
    prerequisites: ['skjermoffentlighet-fellesskap-og-samfunn','resepsjon-deltakelse-og-publikumsmetoder'], existing_chapter_prerequisites: [],
    boundary: 'Eier hvordan steder blir representert, sirkulert, husket og gjort til identitetsbærere; produksjonsinngrep og samtykke eies i neste enhet.',
    source_focus: 'Stedspåstander må skille vist sted, opptakssted, fiktivt rom og dokumentert lokal virkning.',
    topic_suffixes: ['byen_som_audiovisuelt_bilde','film_tv_geografi_og_romlig_sirkulasjon','ikonisk_filmsted_og_sirkulasjon','interior_bolig_og_skjermrom','landskap_stemning_og_stedsetikk','mobilitet_grenser_eksil_og_skjermrom','rurale_perifere_og_arktiske_skjermgeografier','sted_identitet_og_tilhorighet','sted_som_audiovisuell_myte','stedlig_skjermminne','urban_skjermgeografi']
  },
  {
    id: 'location-produksjon-og-stedsetikk', phase_id: 'publikum_sted_sirkulasjon', title: 'Location, produksjon og stedsetikk',
    prerequisites: ['skjermsteder-identitet-og-sirkulasjon','skapende-arbeid-teknologi-og-ansvar'], existing_chapter_prerequisites: [],
    boundary: 'Eier produksjonens fysiske og sosiale inngrep i locations; skjermrepresentasjon og generell produksjonslogistikk brukes som forutsetning.',
    source_focus: 'Lokale virkninger, samtykke og miljøkonsekvens krever stedsspesifikke kilder og kan ikke utledes av skjermbildet alene.',
    topic_suffixes: ['filmturisme_og_lokale_virkninger','gate_kamera_og_offentlig_rom','innspillingsspor_og_stedlig_endring','location_valg_og_filmsted','locationokologi_inngrep_og_miljokonsekvens','lokalsamfunn_samtykke_og_stedlig_produksjonsmakt','studio_backlot_virtuelt_rom_og_stedserstatning','urfolkslandskap_stedskunnskap_og_bilderett']
  },
  {
    id: 'arkiv-bevaring-tilgang-og-autentisitet', phase_id: 'arkiv_kulturarv_minne', title: 'Arkiv, bevaring, tilgang og autentisitet',
    prerequisites: ['filmhistorie-bevegelser-og-historiografi','dokumentar-evidens-og-etikk','skapende-arbeid-teknologi-og-ansvar'], existing_chapter_prerequisites: [],
    boundary: 'Eier arkivobjektets proveniens, bevaring, tilgang, rettigheter og versjonshistorie; kanonisering og kollektiv erindring eies i siste enhet.',
    source_focus: 'Arkivpåstander må vise institusjon, proveniens, format, tilgangsvilkår og eventuell usikkerhet eller materialtap.',
    topic_suffixes: ['arkivbilder_kontekst_og_ombruk','arkivtilgang_personvern_saarbarhet_og_rettigheter','audiovisuell_bevaring_og_restaurering','dekolonisering_repatriering_og_fellesskapskontroll','digitalfodte_verk_formatforvitring_og_migrering','film_tv_arkiv_institusjoner_og_praksis','metadata_katalogisering_proveniens_og_finnbarhet','plattformkataloger_forsvinnende_verk_og_digital_tilgang','produksjonsarkiv_manus_kostyme_og_ephemera','restaureringsetikk_autentisitet_og_verkversjoner','tapte_bilder_fravaer_og_rekonstruksjon']
  },
  {
    id: 'kulturarv-kanon-stjerner-og-minne', phase_id: 'arkiv_kulturarv_minne', title: 'Kulturarv, kanon, stjerner og minne',
    prerequisites: ['arkiv-bevaring-tilgang-og-autentisitet','resepsjon-deltakelse-og-publikumsmetoder','representasjon-posisjon-og-motbilder'], existing_chapter_prerequisites: ['kinoer-visningssteder-og-publikum'],
    boundary: 'Eier prosessene som gir verk, personer, figurer og programmer kulturell varighet; teknisk bevaring og individuell resepsjon er forutsetninger, ikke parallelle hovedtema.',
    source_focus: 'Status, berømmelse og kollektivt minne må dokumenteres som historiske og institusjonelle prosesser, ikke antas fra popularitet alene.',
    topic_suffixes: ['familiefilm_lokale_samlinger_og_motarkiv','festivalminne_programhistorie_og_erindring','filmarv_kanon_og_verdivalg','filmstjerne_persona_rolle_og_myte','kanonisering_prosesser_og_makt','kollektiv_audiovisuell_referanse','kultstatus_og_kulturarv','nostalgi_og_historiebruk','reprise_ombruk_og_kulturell_varighet','rollefigur_sitat_og_sirkulasjon','stjerneproduksjon_og_industrielt_apparat','tv_minne_og_mediert_erindring']
  }
]);

function unique(items) { return [...new Set(items)]; }

export function buildFilmTvLearningOrderPlanV1() {
  const inventory = read(P.inventory);
  const emners = read(P.emners);
  const chapterAudit = read(P.chapterAudit);
  const canonicalIds = new Set(emners.map((row) => row.emne_id));
  const domainByEmne = new Map(inventory.domains.flatMap((domain) => domain.emne_ids.map((id) => [id, domain.id])));
  const existingIds = unique(chapterAudit.chapters.flatMap((chapter) => chapter.canonical_emne_ids));
  const existingSet = new Set(existingIds);
  const remainingIds = [...canonicalIds].filter((id) => !existingSet.has(id));
  const units = UNIT_SPECS.map((spec, sequenceIndex) => {
    const emneIds = spec.topic_suffixes.map(emne);
    return {
      id: spec.id,
      sequence: sequenceIndex + 1,
      phase_id: spec.phase_id,
      title: spec.title,
      purpose: spec.boundary,
      prerequisite_planned_unit_ids: spec.prerequisites,
      prerequisite_existing_chapter_ids: spec.existing_chapter_prerequisites,
      primary_domain_ids: unique(emneIds.map((id) => domainByEmne.get(id))),
      emne_count: emneIds.length,
      emne_ids: emneIds,
      overlap_boundary: spec.boundary,
      source_requirements: [...COMMON_SOURCES, spec.source_focus]
    };
  });
  const plannedIds = units.flatMap((unit) => unit.emne_ids);
  const plan = {
    schema: 'history_go_film_tv_learning_order_plan_v1',
    version: '1.0.0',
    updated_at: '2026-08-11',
    status: 'learning_order_planned_chapter_source_brief_next',
    subject_id: 'film_tv',
    policy: {
      chapter_count_is_derived_not_target: true,
      emne_count_is_integrity_check_not_quota: true,
      later_evidence_may_add_merge_move_or_split_units: true,
      every_current_uncovered_emne_has_one_editorial_owner: true,
      production_follows_prerequisites_and_source_readiness: true,
      chapter_registration_waits_for_full_text_claims_and_inspectable_sources: true
    },
    baseline: {
      canonical_emne_count: canonicalIds.size,
      existing_chapter_count: chapterAudit.chapters.length,
      existing_covered_emne_count: existingIds.length,
      uncovered_emne_count: remainingIds.length,
      inventory_domain_count: inventory.domains.length
    },
    existing_chapter_anchors: chapterAudit.chapters.map((chapter) => ({
      chapter_id: chapter.chapter_id,
      primary_domain_id: chapter.primary_domain_id,
      canonical_emne_count: chapter.canonical_emne_count,
      role: 'preserved_prerequisite_anchor'
    })),
    phases: PHASES.map((phase, index) => ({ ...phase, sequence: index + 1, planned_unit_ids: units.filter((unit) => unit.phase_id === phase.id).map((unit) => unit.id) })),
    planned_units: units,
    production_sequence: units.map((unit) => unit.id),
    first_production_candidate: {
      planned_unit_id: units[0].id,
      required_next_artifact: 'source_and_claim_brief',
      registration_status: 'not_registered_until_full_chapter_gate_passes'
    }
  };

  const currentStatus = read(P.status);
  const laterSourceBriefGate = ['audiovisual_form_source_brief_complete_full_chapter_production', 'audiovisual_form_full_chapter_complete_next_unit_source_brief', 'narrative_viewpoint_genre_source_brief_complete_full_chapter_production', 'narrative_viewpoint_genre_full_chapter_complete_next_unit_source_brief'].includes(currentStatus.subjects.find((row) => row.id === 'film_tv')?.nextGate);
  const registry = structuredClone(read(P.registry));
  if (!laterSourceBriefGate) {
    registry.version = '2.74.0';
    registry.updatedAt = '2026-08-11';
    registry.subjects.film_tv.canonicalModel.note = 'Film & TVs variable canon har 192 emner. De to reauditerte fulltekstkapitlene eier 38 canonicale emner, og de 154 udekkede emnene har nå nøyaktig én redaksjonell eier i en faglig læringsrekkefølge med forkunnskaper, overlappsgrenser og kildekrav. De 15 planlagte enhetene er resultatet av dagens faglige avgrensninger, ikke en kvote eller et tak. Neste port er kilde- og claimbrief for første enhet, Audiovisuell form og sansing.';
  }
  registry.subjects.film_tv.canonicalModel.learningOrderPlan = P.plan;

  const status = structuredClone(currentStatus);
  const filmStatus = status.subjects.find((row) => row.id === 'film_tv');
  if (!laterSourceBriefGate) {
    status.version = '1.62.0';
    status.updatedAt = '2026-08-11';
    filmStatus.nextGate = 'learning_order_plan_complete_first_chapter_source_brief';
    filmStatus.note = 'Film & TVs læringsrekkefølge er planlagt fra full canonical gapdekning: 38 emner beholdes i to reauditerte kapitler, og alle 154 udekkede emner har nøyaktig én eier i 15 faglig avgrensede, variabelt store planenheter fordelt på seks progresjonsfaser. Antallet er et resultat av dagens problemgrenser, ikke en kvote. Neste port er kilde- og claimbrief for Audiovisuell form og sansing; kapitlet registreres først etter full tekst-, claim- og kildeport.';
  }

  const unitCounts = units.map((unit) => unit.emne_count);
  const report = {
    schema: 'history_go_film_tv_learning_order_plan_v1_audit',
    version: '1.0.0', updated_at: '2026-08-11', status: 'learning_order_plan_complete_first_source_brief_next', subject_id: 'film_tv',
    summary: {
      canonical_emne_count: canonicalIds.size,
      existing_chapter_count: chapterAudit.chapters.length,
      existing_covered_emne_count: existingIds.length,
      planned_uncovered_emne_count: plannedIds.length,
      planned_phase_count: PHASES.length,
      derived_planned_unit_count: units.length,
      smallest_unit_emne_count: Math.min(...unitCounts),
      largest_unit_emne_count: Math.max(...unitCounts)
    },
    coverage_by_domain: inventory.domains.map((domain) => ({
      domain_id: domain.id,
      canonical_emne_count: domain.emne_ids.length,
      existing_covered_emne_count: domain.emne_ids.filter((id) => existingSet.has(id)).length,
      planned_emne_count: domain.emne_ids.filter((id) => plannedIds.includes(id)).length
    })),
    first_production_candidate: plan.first_production_candidate,
    gates: {
      all_canonical_emner_accounted_for: unique([...existingIds, ...plannedIds]).length === canonicalIds.size,
      every_uncovered_emne_owned_exactly_once: plannedIds.length === remainingIds.length && unique(plannedIds).length === remainingIds.length,
      existing_and_planned_coverage_do_not_overlap: plannedIds.every((id) => !existingSet.has(id)),
      every_planned_emne_is_active_canonical: plannedIds.every((id) => canonicalIds.has(id)),
      every_inventory_domain_is_represented: inventory.domains.every((domain) => domain.emne_ids.some((id) => existingSet.has(id) || plannedIds.includes(id))),
      unit_sizes_follow_learning_need_not_equal_quota: new Set(unitCounts).size > 1,
      every_unit_has_explicit_overlap_boundary: units.every((unit) => unit.overlap_boundary.length > 40),
      every_unit_has_explicit_source_requirements: units.every((unit) => unit.source_requirements.length >= 4),
      prerequisites_only_point_backward: units.every((unit, index) => unit.prerequisite_planned_unit_ids.every((id) => units.findIndex((candidate) => candidate.id === id) < index)),
      existing_chapter_anchors_preserved: plan.existing_chapter_anchors.length === 2,
      no_fixed_target_or_quota_field: !('target_chapter_count' in plan) && !('target_emne_count' in plan),
      first_candidate_requires_source_brief_before_registration: plan.first_production_candidate.required_next_artifact === 'source_and_claim_brief' && plan.first_production_candidate.registration_status.startsWith('not_registered')
    },
    next_gate: 'produce_source_and_claim_brief_for_audiovisuell_form_og_sansing'
  };
  return { plan, report, registry, status, canonicalIds, existingIds, remainingIds, plannedIds, units };
}

export function auditFilmTvLearningOrderPlanV1({ writeFiles = false, checkFiles = true } = {}) {
  const built = buildFilmTvLearningOrderPlanV1();
  const outputs = { [P.plan]: built.plan, [P.report]: built.report, [P.registry]: built.registry, [P.status]: built.status };
  if (writeFiles) for (const [file, value] of Object.entries(outputs)) write(file, value);
  if (checkFiles) for (const [file, value] of Object.entries(outputs)) assert(isDeepStrictEqual(read(file), value), `${file} er utdatert`);
  assert(Object.values(built.report.gates).every(Boolean), 'Minst én læringsrekkefølgeport feiler');
  return built;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const result = auditFilmTvLearningOrderPlanV1({ writeFiles: args.has('--write'), checkFiles: !args.has('--write') && !args.has('--no-check') });
    console.log(`Film & TV læringsrekkefølge OK: ${result.existingIds.length} eksisterende + ${result.plannedIds.length} planlagte emner i ${result.units.length} faglig avgrensede enheter.`);
  } catch (error) {
    console.error(`Film & TV læringsrekkefølge FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
