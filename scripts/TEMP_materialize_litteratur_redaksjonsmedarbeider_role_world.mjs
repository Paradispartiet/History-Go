#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const write = (rel, value) => {
  const target = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(value, null, 2) + '\n');
};

const ROLE = 'redaksjonsmedarbeider';
const KEY = 'litteratur/redaksjonsmedarbeider';
const WORLD_PATH = 'data/Civication/roleWorlds/litteratur/redaksjonsmedarbeider.json';
const catalogPath = type => `data/Civication/mailFamilies/litteratur/${type}/redaksjonsmedarbeider_${type}.json`;
const refs = {
  job: `${catalogPath('job')}#litteratur_redaksjonsmedarbeider_job_versjon_001`,
  people: `${catalogPath('people')}#litteratur_redaksjonsmedarbeider_people_status_001`,
  conflict: `${catalogPath('conflict')}#litteratur_redaksjonsmedarbeider_conflict_endring_001`,
  story: `${catalogPath('story')}#litteratur_redaksjonsmedarbeider_story_arbeidsdag_001`,
  event: `${catalogPath('event')}#litteratur_redaksjonsmedarbeider_event_avvik_001`,
  micro: `${catalogPath('micro')}#litteratur_redaksjonsmedarbeider_micro_undertittel_001`,
  followup: `${catalogPath('followup')}#litteratur_redaksjonsmedarbeider_followup_versjon_001`,
  knowledge: `${catalogPath('knowledge')}#litteratur_redaksjonsmedarbeider_knowledge_rettighet_001`,
  consequence: `${catalogPath('consequence')}#litteratur_redaksjonsmedarbeider_consequence_versjon_001`
};
const TYPES = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const refCycle = TYPES.map(type => refs[type]);
const phases = ['morning','lunch','afternoon','evening'];
const phaseTypes = { morning:'info', lunch:'conversation', afternoon:'task', evening:'private_consequence' };
const phaseThread = {
  morning:'manuspakke_canonical_state',
  lunch:'beslutning_og_rettigheter',
  afternoon:'produksjonsavhengigheter',
  evening:'tilbakekalling_og_korrigering'
};
const dayThemes = [
  'Manuspakke versjon 12 låses som canonical arbeidsgrunnlag mens versjon 13 registreres som mottatt, men uavklart, slik at samme arbeidsobjekt får en eksplisitt starttilstand.',
  'Forfatterens spørsmål om den nye slutten oppdaterer manuspakken med mottatt endring, manglende redaktørbeslutning og en synlig blokkering for korrektur i stedet for et muntlig ja.',
  'Den sene kapittelflyttingen legges inn i samme manuspakke som foreslått endring med berørte sidereferanser, produksjonsavhengigheter og ansvarlig redaktør som beslutningseier.',
  'Det uavklarte tredjepartsmaterialet kobles til manuspakken som egen rettighetsstatus, slik at en sendt forespørsel aldri blir forvekslet med dokumentert tillatelse eller redaksjonell godkjenning.',
  'Når et avsnitt mangler i satsfilen, stoppes leveringen og manuspakken viser både canonical manus, avledet produksjonsfil, avvikets opphav og hvem som må bekrefte korrigeringen.',
  'To undertitler i samme leveranse gjør at manuspakken utvides fra bare manusversjon til også å holde omslag, metadata og eksplisitte godkjenningsreferanser konsistente.',
  'En eldre manusfil er sendt videre, og manuspakken blir grunnlaget for en full tilbakekalling med mottakerliste, avledede filer, erstatningsstatus og bekreftelse fra hvert berørt produksjonsledd.',
  'Etterkontrollen gjør tidligere feil til varig redaksjonell hukommelse ved å knytte årsak, korrigering og nytt kontrollpunkt til samme manuspakke før neste leveranse.',
  'Neste produksjonsrunde arver kontrollpunktet fra avviket og viser om arbeidsobjektet faktisk overlever sceneskiftet i stedet for å bli nullstilt når en ny mail åpnes.',
  'Redaktør, forfatter, korrektur og produksjon arbeider parallelt, men manuspakken beholder én canonical versjon, åpne beslutninger og tydelige eiere selv når lokale kopier og kommentarer oppstår.',
  'En komprimert frist frister teamet til å kalle uavklarte punkter ferdige, mens manuspakken beholder dem som eksplisitte blokkeringer med ansvar og konsekvens i stedet for skjult usikkerhet.',
  'Produksjonshandoff krever at canonical versjon, godkjenninger, rettighetsstatus, metadata, avledede filer og åpne avhengigheter følger sammen som ett kontrollert arbeidsobjekt.',
  'Før endelig levering brukes manuspakken til å sammenholde tekst, metadata, rettigheter og mottakerbekreftelser, slik at én rask lokal retting ikke kan overskrive det samlede beslutningssporet.',
  'Rollouten avsluttes med at den samme manuspakken kan arkiveres og gjenbrukes som sporbar historikk: hva som gjaldt, hva som endret seg, hvem som besluttet og hvilke downstream-flater som ble korrigert.'
];
const phaseTail = {
  morning:'Morgenen leser arbeidsobjektets canonical tilstand før nytt arbeid starter og navngir hva som er låst, hva som fortsatt er uavklart og hvem som eier neste beslutning.',
  lunch:'Lunsjen viser hvordan mennesker kan ha ulike behov uten at de får ulike sannheter; manuspakken bærer samme versjon, status og beslutningsspor mellom forfatter, redaktør, korrektur og produksjon.',
  afternoon:'Ettermiddagen oppdaterer konkrete avhengigheter, avledede filer, mottakere eller blokkeringer i arbeidsobjektet før noe sendes videre, slik at fremdrift ikke kan bety tap av sporbarhet.',
  evening:'Kvelden viser hva dagens endring etterlater i manuspakken og i arbeidsmåten: uløste punkter, bekreftelser og korreksjoner må fortsatt finnes neste dag i stedet for å forsvinne med scenen.'
};

const coverage = [];
for (let day = 1; day <= 14; day += 1) {
  for (const [pi, phase] of phases.entries()) {
    coverage.push({
      day,
      phase,
      beat_type: phaseTypes[phase],
      summary: `Dag ${day}, ${phase}: ${dayThemes[day - 1]} ${phaseTail[phase]}`,
      thread_ids: [phaseThread[phase]],
      materialization_refs: [refCycle[((day - 1) * 4 + pi) % refCycle.length]]
    });
  }
}

const theme_ids = [
  'professional_culture',
  'status_anxiety',
  'shame_reputation',
  'loyalty_up_down',
  'social_mask',
  'bureaucratic_power',
  'precarity',
  'public_private_leakage'
];

const persistent_work_object = {
  id:'manuspakke_versjonsspor_001',
  object_type:'editorial_manuscript_package',
  label:'Manuspakke med versjon, beslutningsspor og produksjonsavhengigheter',
  identity_rule:'Det er samme arbeidsobjekt gjennom mail-, scene- og beat-skifter; en ny scene kan endre tilstanden, men kan ikke nullstille tidligere versjon, beslutning, rettighetsstatus, mottaker eller korreksjon uten et eksplisitt spor.',
  canonical_fields:[
    'canonical_version',
    'decision_owner',
    'open_decisions',
    'author_editorial_approval_state',
    'rights_status',
    'production_recipients',
    'derived_artifacts',
    'dependencies',
    'withdrawal_replacement_acknowledgements',
    'decision_and_correction_history'
  ],
  handoff_contract:{
    required_fields:['canonical_version','decision_owner','dependencies','recipient_acknowledgement'],
    rule:'Ingen downstream-handoff er komplett bare fordi en fil er sendt; mottaker må vite hvilken versjon som gjelder, hvem som eier åpne beslutninger, hvilke avhengigheter som fortsatt blokkerer og om erstatning er bekreftet.'
  },
  state_history:[
    {day:1,object_id:'manuspakke_versjonsspor_001',state:'v12_canonical_v13_pending',owner:'redaksjonsmedarbeider',decision_owner:'ansvarlig bokredaktør',change:'Versjon 12 låses; versjon 13 registreres uten godkjenning.'},
    {day:2,object_id:'manuspakke_versjonsspor_001',state:'new_ending_pending_editor_decision',owner:'redaksjonsmedarbeider',decision_owner:'ansvarlig bokredaktør',change:'Ny slutt er mottatt og loggført; korrektur står eksplisitt på vent.'},
    {day:3,object_id:'manuspakke_versjonsspor_001',state:'chapter_move_impact_mapped',owner:'redaksjonsmedarbeider',decision_owner:'ansvarlig bokredaktør',change:'Kapittelflytting får tekstlig begrunnelse, produksjonskostnad og berørte artefakter i samme spor.'},
    {day:4,object_id:'manuspakke_versjonsspor_001',state:'rights_status_unresolved',owner:'redaksjonsmedarbeider',decision_owner:'ansvarlig redaktør eller rettighetsansvarlig',change:'Sendt forespørsel registreres som forespørsel, ikke som tillatelse.'},
    {day:5,object_id:'manuspakke_versjonsspor_001',state:'delivery_blocked_typeset_mismatch',owner:'redaksjonsmedarbeider',decision_owner:'ansvarlig bokredaktør',change:'Manglende avsnitt kobles til konkret satsfil og levering stoppes til verifisert sammenligning.'},
    {day:6,object_id:'manuspakke_versjonsspor_001',state:'metadata_and_cover_alignment_pending',owner:'redaksjonsmedarbeider',decision_owner:'ansvarlig bokredaktør',change:'Undertittel behandles som del av samme pakke på tvers av omslag, metadata og beslutningslogg.'},
    {day:7,object_id:'manuspakke_versjonsspor_001',state:'wrong_version_recall_open',owner:'redaksjonsmedarbeider',decision_owner:'produksjonskoordinator for operativ tilbakekalling',change:'Mottakerliste og avledede filer kobles til tilbakekallingen; hovedfil alene er ikke nok.'},
    {day:8,object_id:'manuspakke_versjonsspor_001',state:'control_point_repaired',owner:'redaksjonsmedarbeider',decision_owner:'ansvarlig bokredaktør',change:'Årsaken logges og neste leveranse krever godkjenningsreferanse, ikke bare filnavn.'},
    {day:10,object_id:'manuspakke_versjonsspor_001',state:'parallel_work_same_canonical_basis',owner:'redaksjonsmedarbeider',decision_owner:'ansvarlig bokredaktør',change:'Lokale kommentarer kan finnes, men canonical tekst og åpne beslutninger forblir entydige.'},
    {day:12,object_id:'manuspakke_versjonsspor_001',state:'handoff_package_complete',owner:'redaksjonsmedarbeider',decision_owner:'ansvarlig bokredaktør',change:'Versjon, godkjenninger, rettigheter, metadata, avhengigheter og mottakere følger samlet.'},
    {day:14,object_id:'manuspakke_versjonsspor_001',state:'archived_with_auditable_history',owner:'redaksjonsmedarbeider',decision_owner:'ansvarlig bokredaktør',change:'Endelig pakke beholder historikken som grunnlag for neste manusløp.'}
  ],
  continuity_proof:{
    spans_all_14_days:true,
    reuses_existing_scene_pipeline:true,
    new_runtime_state:false,
    all_nine_mail_types_are_provenance_not_new_objects:true
  }
};

const world = {
  schema:'civication_role_world_v1',
  version:1,
  category:'litteratur',
  role_scope:ROLE,
  title:'Redaksjonsmedarbeider — vedvarende manuspakke og redaksjonell hukommelse',
  status:'role_world_complete',
  sociological_core:{
    main_problem:'Å holde ett manus- og publiseringsløp sammenhengende gjennom skiftende mennesker, filer, frister og avklaringer uten at den redaksjonelle medarbeiderens koordineringsmakt blir forvekslet med endelig tekst-, rettighets-, kontrakts- eller publiseringsmyndighet.',
    description:'Role World-en lukker kun readiness-gjelden persistent_work_object. De eksisterende mailene og den eksisterende åtte-trinnsplanen beholdes; manuspakken gjør tidligere valg, versjoner, mottakere, rettighetsstatus og korreksjoner kumulative over 14 dager i den eksisterende Scene Pipeline.'
  },
  theme_ids,
  social_environments:[
    'Manusdesken der nye filer, endringer og muntlige avklaringer må oversettes til én canonical arbeidstilstand før oppgaver fordeles.',
    'Versjonsarkivet der tekst, godkjenning, rettighetsstatus, metadata, mottakere og korreksjoner må kunne leses som én sammenhengende historikk.',
    'Produksjonsmøtet der redaksjon, korrektur og produksjon trenger samme arbeidsgrunnlag selv om de eier ulike deler av beslutnings- og leveranseprosessen.',
    'Forfatterkontakten der presis status må beskytte både forfatterens tekstlige eierskap og redaksjonens reelle beslutningslinje.',
    'Den pressede sluttfasen der en liten lokal retting kan være raskere enn å oppdatere hele pakken, men samtidig skape parallelle sannheter og skjult restfeil.',
    'Etterkontrollen der usynlig koordineringsarbeid blir profesjonell hukommelse i stedet for å forsvinne når leveransen akkurat reddes.'
  ],
  recurring_people_archetypes:[
    {id:'solveig_ansvarlig_bokredaktor',social_function:'ansvarlig bokredaktør og beslutningseier for endelig redaksjonell vurdering innen prosjektets mandat',class_position:'redaksjonell fagledelse med formell beslutningsmakt over manusløpet',status:'høy formell redaksjonell status',power_over_player:'kan godkjenne eller avvise redaksjonelle endringer og prioritere åpne spørsmål, men må fortsatt respektere kontrakter, rettigheter og forfatterens rettslige posisjon',wants:'et manusløp der hver beslutning kan spores til riktig grunnlag og riktig versjon',conceals:'at tids- og produksjonspress kan gjøre det fristende å la medarbeideren absorbere beslutninger som egentlig burde være eksplisitte',speech_style:'kort og presis; spør hva som gjelder, hva som mangler og hvilken beslutning hun faktisk må ta',teaches_player:'at god koordinering gjør beslutningsmakt synlig uten å overta den'},
    {id:'emil_forfatter',social_function:'forfatter som eier det skapende tekstbidraget og leverer endringer som må møte et tydelig redaksjonelt spor',class_position:'ekstern eller kontraktsbundet opphavsperson med sterk tekstlig interesse, men ikke intern produksjonsmyndighet',status:'høy tekstlig legitimitet',power_over_player:'kan kreve at tekst og endringer behandles presist og kan utfordre en redaksjon som blander mottak med godkjenning',wants:'å vite hva som faktisk er mottatt, vurdert, godkjent og sendt videre',conceals:'at sen kreativ overbevisning kan undervurdere hvor mange downstream-flater en endring allerede berører',speech_style:'tekstnær og konkret; spør hva som er besluttet og hva som fortsatt kan endres',teaches_player:'at forfatterkontakt krever presis status, ikke beroligende overloving'},
    {id:'nora_produksjonskoordinator',social_function:'produksjonskoordinator som gjør redaksjonelle beslutninger til sats, korrektur, metadata, omslag og levering',class_position:'operativ produksjonsrolle med høy avhengighet av korrekt redaksjonelt grunnlag',status:'høy situert gjennomføringsstatus',power_over_player:'kan stoppe eller eskalere en leveranse når grunnlaget er inkonsistent og kan synliggjøre kostnaden av sen endring',wants:'én versjon, kjente avhengigheter og eksplisitte erstatninger når feil materiale er sendt',conceals:'at fristpress kan gjøre en rask lokal retting mer attraktiv enn full mottaker- og avhengighetskontroll',speech_style:'leveranseorientert; spør hvilken fil, hvilken frist, hvilke mottakere og hva som fortsatt blokkerer',teaches_player:'at et vedvarende arbeidsobjekt må omfatte downstream-konsekvenser, ikke bare manusfilen'},
    {id:'karim_korrekturleser',social_function:'korrekturleser som sammenholder produksjonsfil med godkjent manus og rapporterer avvik uten å overta tekstbeslutninger',class_position:'faglig kontrollrolle med begrenset formell myndighet, men stor evne til å avdekke systemfeil',status:'høy situert kvalitetsstatus',power_over_player:'kan stoppe falsk trygghet ved å vise at en avledet fil ikke matcher canonical manus',wants:'et tydelig sammenligningsgrunnlag og et synlig svar på hva som er avvik kontra godkjent endring',conceals:'at korrekturarbeidet blir sosialt belastende når andre vil at små avvik skal behandles som ufarlige for å holde fristen',speech_style:'detaljorientert og rolig; peker på konkret tekststed, fil og forskjell',teaches_player:'at et arbeidsobjekt må kunne knytte avvik tilbake til canonical kilde og beslutningshistorikk'},
    {id:'lea_rettighets_og_metadataressurs',social_function:'støtter rettighetsdokumentasjon og publiseringsmetadata når saken trenger spesialisert avklaring',class_position:'spesialist med avgrenset fagmyndighet innen dokumentasjon og metadata, ikke overordnet redaksjonell leder',status:'situert ekspertstatus',power_over_player:'kan avvise at manglende dokumentasjon behandles som avklart og kan kreve at publiseringsdata holdes tilbake til grunnlaget er tydelig',wants:'at manuspakken skiller forespørsel, tillatelse, redaksjonell beslutning og metadatafelter som egne spor',conceals:'at spesialistkrav kan oppfattes som administrativ treghet når fristen presser',speech_style:'nøktern og dokumentorientert; spør hva som faktisk finnes skriftlig og hvilken status feltet derfor kan ha',teaches_player:'at persistent work object må bevare ulike typer status uten å slå dem sammen til ett upresist godkjent-stempel'}
  ],
  slow_axes:[
    {id:'persistent_object_integrity',meaning:'om samme manuspakke beholder identitet og historikk gjennom alle sceneskift',runtime_binding:'editorial_only_until_governed'},
    {id:'version_traceability',meaning:'om canonical versjon og senere endringer kan spores til eksplisitt godkjenning',runtime_binding:'existing'},
    {id:'decision_owner_clarity',meaning:'om åpne beslutninger har navngitt eier uten at koordinatorrollen overtar myndigheten',runtime_binding:'existing'},
    {id:'rights_status_clarity',meaning:'om forespørsel, tillatelse og juridisk eller redaksjonell avklaring holdes adskilt',runtime_binding:'editorial_only_until_governed'},
    {id:'recipient_recall_completeness',meaning:'om feil materiale kan spores til alle mottakere og avledede filer før saken lukkes',runtime_binding:'editorial_only_until_governed'},
    {id:'derived_artifact_alignment',meaning:'om manus, sats, metadata og omslagsgrunnlag peker til samme godkjente beslutninger',runtime_binding:'editorial_only_until_governed'},
    {id:'deadline_exposure',meaning:'om fristpress gjør uavklarte forhold synlige eller skjuler dem bak lokale snarveier',runtime_binding:'editorial_only_until_governed'},
    {id:'single_point_of_failure_risk',meaning:'om systemet tåler at én medarbeider ikke husker eller reparerer alt alene fordi objektet bærer historikken',runtime_binding:'editorial_only_until_governed'}
  ],
  persistent_work_object,
  season:{days:14,day_phases:phases,coverage},
  primary_threads:[
    {id:'manuspakke_canonical_state',relationship:'Samme manuspakke må beholde canonical tekstgrunnlag og åpne beslutninger gjennom hele perioden.',beat_refs:['1/morning','2/morning','3/morning','4/morning','5/morning','6/morning','7/morning','8/morning']},
    {id:'beslutning_og_rettigheter',relationship:'Forfatterønsker, redaktørbeslutninger og rettighetsstatus må leve i samme objekt uten å bli samme type godkjenning.',beat_refs:['2/lunch','3/lunch','4/lunch','5/lunch','6/lunch','7/lunch']},
    {id:'produksjonsavhengigheter',relationship:'Sats, korrektur, metadata og levering skal arve versjon og blokkeringer fra manuspakken i stedet for lokale antakelser.',beat_refs:['5/afternoon','6/afternoon','7/afternoon','8/afternoon','9/afternoon','10/afternoon','11/afternoon','12/afternoon']},
    {id:'tilbakekalling_og_korrigering',relationship:'En feilversjon må kunne følges til alle mottakere, erstattes og komme tilbake som dokumentert læring.',beat_refs:['7/evening','8/evening','9/evening','10/evening','11/evening','12/evening']},
    {id:'ny_levering_med_hukommelse',relationship:'Neste leveranse skal bevise at det nye kontrollpunktet faktisk bæres videre av samme arbeidsobjekt.',beat_refs:['9/morning','10/morning','11/morning','12/morning','13/morning','14/morning']}
  ],
  private_aftermath:[
    {id:'after_version_lock',beat_ref:'1/evening',summary:'Medarbeideren ser at trygghet ikke kommer av å huske hvilken fil som var riktig, men av at manuspakken kan bevise det uten personavhengig hukommelse.'},
    {id:'after_author_status',beat_ref:'3/evening',summary:'Den sosiale fristelsen til å gi forfatteren et beroligende svar blir synlig som en systemrisiko når samme objekt må brukes av flere personer dagen etter.'},
    {id:'after_delivery_stop',beat_ref:'5/evening',summary:'En stoppet levering oppleves dyr der og da, men manuspakken gjør det mulig å skille reell kostnad fra den større risikoen ved en uverifisert lokal retting.'},
    {id:'after_recall',beat_ref:'8/evening',summary:'Tilbakekallingen viser hvor mye usynlig arbeid som finnes i mottakere og avledede filer, og hvorfor et vedvarende objekt må holde mer enn selve manusdokumentet.'},
    {id:'after_archive',beat_ref:'14/evening',summary:'Når prosjektet lukkes, kan medarbeideren forlate arbeidsdagen uten å være den eneste som bærer sannheten om hva som skjedde og hvorfor.'}
  ],
  delayed_consequences:[
    {id:'v13_returns',setup_ref:'1/morning',return_ref:'3/afternoon',summary:'Den uavklarte versjon 13 kommer tilbake som en konkret sen endring og beviser om statusen ble bevart.'},
    {id:'rights_returns',setup_ref:'4/lunch',return_ref:'12/afternoon',summary:'Rettighetsstatus må fortsatt følge produksjonshandoff og kan ikke forsvinne fordi teksten ellers er klar.'},
    {id:'typeset_mismatch_returns',setup_ref:'5/afternoon',return_ref:'7/evening',summary:'Avviket i satsfilen gjør mottaker- og erstatningssporet nødvendig når en feilversjon senere trekkes tilbake.'},
    {id:'metadata_returns',setup_ref:'6/afternoon',return_ref:'13/afternoon',summary:'Undertittelavviket kommer tilbake i siste leveransekontroll og viser om avledede artefakter faktisk følger samme beslutning.'},
    {id:'recall_learning_returns',setup_ref:'7/evening',return_ref:'10/morning',summary:'Tilbakekallingen påvirker neste produksjonsrunde gjennom et nytt kontrollpunkt i stedet for en muntlig påminnelse.'},
    {id:'control_point_survives',setup_ref:'8/morning',return_ref:'14/morning',summary:'Det reparerte kontrollpunktet må fortsatt være synlig når hele manuspakken arkiveres og neste løp skal kunne lære av den.'}
  ],
  materialization:{
    no_new_runtime:true,
    authored_dimensions:['persistent_work_object'],
    persistent_work_object_id:persistent_work_object.id,
    source_refs:Object.values(refs),
    note:'Alle beats gjenbruker eksisterende canonical mail-scener i Scene Pipeline; persistent work object er redaksjonell kontinuitet, ikke nytt runtime-state.'
  }
};

write(WORLD_PATH, world);

const index = read('data/Civication/roleWorlds/index.json');
if (!(index.roles || []).some(row => row.category === 'litteratur' && row.role_scope === ROLE)) {
  index.roles.push({category:'litteratur',role_scope:ROLE,status:'role_world_complete',path:WORLD_PATH});
}
index.status = 'seventeen_role_worlds_materialized';
index.effective_date = '2026-08-28';
index.note = 'Reference- og pilotbevisene består uendret. Litteratur Redaksjonsmedarbeider er materialisert som kontrollert Role World-rollout der samme manuspakke bærer versjon, beslutninger, rettighetsstatus, avhengigheter, mottakere og korreksjonshistorikk gjennom eksisterende Scene Pipeline.';
write('data/Civication/roleWorlds/index.json', index);

const checklist = read('data/Civication/roleWorldAuthoringChecklist.json');
checklist.reference_worlds = checklist.reference_worlds || [];
if (!checklist.reference_worlds.includes(WORLD_PATH)) checklist.reference_worlds.push(WORLD_PATH);
write('data/Civication/roleWorldAuthoringChecklist.json', checklist);

const themeBank = read('data/Civication/roleWorldThemeBank.json');
themeBank.reference_profiles = themeBank.reference_profiles || {};
themeBank.reference_profiles[KEY] = theme_ids;
write('data/Civication/roleWorldThemeBank.json', themeBank);

console.log(`Materialized ${KEY} as Role World with persistent object ${persistent_work_object.id}`);
