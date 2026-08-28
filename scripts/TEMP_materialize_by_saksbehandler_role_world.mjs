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

const ROLE = 'by_saksbehandler';
const KEY = 'by/by_saksbehandler';
const WORLD_PATH = 'data/Civication/roleWorlds/by/by_saksbehandler.json';
const THREAD = 'by_saksbehandler.case.hoyde_nabovirkning_og_klage';
const refs = {
  job:'data/Civication/mailFamilies/by/job/by_saksbehandler_job.json#by_saks_job_dok_001',
  people:'data/Civication/mailFamilies/by/people/by_saksbehandler_people.json#by_saksbehandler_people_anne_001',
  conflict:'data/Civication/mailFamilies/by/conflict/by_saksbehandler_conflict.json#by_saksbehandler_conflict_likebehandling_001',
  event:'data/Civication/mailFamilies/by/event/by_saksbehandler_event.json#by_saksbehandler_event_befaring_001',
  micro:'data/Civication/mailFamilies/by/micro/by_saksbehandler_micro.json#by_saksbehandler_micro_kildespor_001',
  story:'data/Civication/mailFamilies/by/story/by_saksbehandler_story.json#by_saksbehandler_story_vedtaksgrunnlag_001',
  knowledge:'data/Civication/mailFamilies/by/knowledge/by_saksbehandler_knowledge.json#by_saksbehandler_knowledge_likebehandling_001',
  followup:'data/Civication/mailFamilies/by/followup/by_saksbehandler_followup.json#by_saksbehandler_followup_hoyde_001',
  consequence:'data/Civication/mailFamilies/by/consequence/by_saksbehandler_consequence.json#by_saksbehandler_consequence_klage_001'
};
const refCycle = Object.values(refs);
const phases = ['morning','lunch','afternoon','evening'];
const phaseTypes = {morning:'info',lunch:'conversation',afternoon:'task',evening:'private_consequence'};
const phaseThreads = {
  morning:'faktum_hjemmel_og_saksgrunnlag',
  lunch:'likebehandling_og_situert_tillit',
  afternoon:'stedlig_evidens_journal_og_revisjon',
  evening:'klagerobusthet_og_privataftermath'
};
const dayThemes = [
  'En søknad ser administrativt komplett ut, men den manglende høydeangivelsen treffer selve vurderingspunktet. Saksbehandleren må skille vedleggsfullstendighet fra reell vurderbarhet før tempo og produksjonsmål gjør mangelen usynlig.',
  'Anne ber om et tydelig svar på om saken kan realitetsbehandles. Å be om presisering forsinker søkerens framdrift, men standing hos søker, kolleger og senere kontroll kan ikke bygges på at et avgjørende faktum bare antas.',
  'En følelsesladet nabomerknad beskriver tap av lys og innsyn i en trang bakgård. Saksbehandleren må trekke ut relevante faktiske virkninger uten å gjøre naboens tone til verken diskvalifikasjon eller beslutningsmyndighet.',
  'Erik sammenligner saken med en tidligere tillatelse som har samme mål og hjemmel, men ligger et annet sted. Likebehandling krever synlige relevante likheter og forskjeller, ikke mekanisk kopiering av tidligere resultat.',
  'Tre merknader om støy, trygghet og varelevering ser forskjellige ut på papir, men kan beskrive samme smale passasje. En avgrenset befaring kan gjøre mønsteret vurderbart uten å gjøre antall merknader til en avstemning om utfallet.',
  'Fristen nærmer seg mens hjemmel, faktum og stedlig virkning fortsatt må holdes fra hverandre. Saksbehandlerens standing kan lide når saken tar tid, men fristpress kan aldri gjøre en uopplyst sak til et lovlig eller robust beslutningsgrunnlag.',
  'Vurderingsnotatet viser riktig høyde, men ikke hvilken tegningsversjon tallet kommer fra. Et lite kildespor nå avgjør om senere kolleger og klageinstans kan se hvilket faktum skjønnet faktisk bygde på.',
  'Det manglende snittet kommer inn og viser at nabovirkningen er større enn første tegningspakke antydet. Saksbehandleren må revidere faktum- og skjønnssporet åpent i stedet for å beskytte den første vurderingens stabilitet.',
  'Søker opplever at kriteriene flytter seg når nytt faktum endrer vurderingen, mens naboen opplever at merknaden endelig blir tatt på alvor. Situated standing divergerer nettopp fordi samme faglige korreksjon har ulik sosial kostnad for ulike parter.',
  'Vedtaksgrunnlaget må nå gjøre hjemmel, faktum, stedlig virkning, merknader og skjønn lesbare som én begrunnelseskjede. Kort tekst kan holde frist, men den må ikke skjule hva som faktisk bar anbefalingen til riktig beslutningseier.',
  'En formell beslutningseier trenger et grunnlag som ikke allerede lover utfallet. Saksbehandlerens faglige anbefaling kan være tydelig, men standing hos ledelse eller søker kan aldri gjøre anbefalingen til tillatelse, dispensasjon eller vedtak.',
  'Vedtaket blir utfordret, og Erik ber om journalsporet fra opprinnelig mangel via nytt snitt til endelig begrunnelse. Klagerobusthet viser hvorfor tidligere dokumentasjon og revisjon var faglig arbeid, ikke bare administrativt ekstraarbeid.',
  'Klagen løfter både ulik behandling og nabovirkning. Saksbehandleren må skille hva som faktisk ble vurdert da vedtaket ble tatt fra argumenter som først blir formulert i ettertid, slik at senere kontroll kan etterprøve den virkelige beslutningen.',
  'Perioden avsluttes med et sammenhengende spor mellom søknad, mangler, stedlig evidens, hjemmel, skjønn, vedtak og klage. Standing hos ulike publikum kan fortsatt være ulik, men rettssikkerheten avhenger av at prosess og begrunnelse ikke omskrives etter popularitet.'
];
const phaseTail = {
  morning:'Morgenen oppdaterer det faktiske og rettslige grunnlaget, dokumentasjonsmangler og hva som fortsatt må opplyses før saken kan gå videre, slik at saksflyt aldri blir en erstatning for vurderbarhet.',
  lunch:'Lunsjflaten gjør audience-spesifikk standing synlig mellom seksjonsledelse, juridisk kontroll, søker, naboer, formell beslutningseier, klageinstans, kolleger og private relasjoner uten global score.',
  afternoon:'Ettermiddagen bruker eksisterende saksbehandlings- og kvalitetssløyfer til befaring, sammenligning, kildespor, revisjon eller vedtaksgrunnlag uten å authorere ny persistent- eller rhythm-runtime.',
  evening:'Kvelden viser forsinket klagerisiko og privat belastning når kritikk, frist og offentlig ansvar følger med hjem, samtidig som profesjonell standing holdes adskilt fra personlig verdi og formell myndighet.'
};

const coverage = [];
for (let day = 1; day <= 14; day += 1) {
  for (const [pi, phase] of phases.entries()) {
    coverage.push({
      day,
      phase,
      beat_type:phaseTypes[phase],
      summary:`Dag ${day}, ${phase}: ${dayThemes[day - 1]} ${phaseTail[phase]}`,
      thread_ids:[phaseThreads[phase]],
      materialization_refs:[refCycle[((day - 1) * 4 + pi) % refCycle.length]]
    });
  }
}

const theme_ids = ['professional_culture','bureaucratic_power','status_anxiety','shame_reputation','loyalty_up_down','social_mask','precarity','care_vs_efficiency'];

const existing_work_continuity = {
  runtime_binding:'existing_mail_and_work_grammar',
  thread_key:THREAD,
  new_runtime_state:false,
  work_loops:['saksbehandling','kvalitetssikring'],
  rule:'Eksisterende work grammar og canonical høyde/nabovirkning/klage-thread beviser allerede overgang fra faktum og hjemmel via begrunnet skjønn og journal til senere klage og etterprøving. Denne rollouten gjenbruker dette sporet og authorer ikke nytt persistent- eller rhythm-runtime.'
};

const situated_reputation_model = {
  global_score_allowed:false,
  rule:'Standing er audience-spesifikk og kan divergere mellom faglig ledelse, juridisk kontroll, søker, naboer, formell beslutningseier, klageinstans, kolleger og private relasjoner. Ingen global reputation-score materialiseres.',
  authority_separation:'Standing kan aldri gi saksbehandleren tillatelses- eller dispensasjonsmyndighet, rett til å forskjellsbehandle uten saklig grunn, rett til å hoppe over lovpålagt prosess, skjule vesentlige opplysninger eller forskuttere formelt vedtaksutfall.',
  audiences:[
    {id:'section_leadership',standing_axis:'section_leadership_standing',cares_about:['vurderbarhet, saksflyt og frist','tydelige mangler og faglig begrunnede revisjoner','at produksjonstall ikke skjuler kvalitetsgjeld'],cannot_grant:'Seksjonsledelsens tillit kan ikke gjøre en uopplyst sak vurderbar, oppheve lovpålagte prosesser eller gi saksbehandleren vedtaksmyndighet utover faktisk delegasjon.'},
    {id:'legal_quality_control',standing_axis:'legal_quality_standing',cares_about:['korrekt hjemmel og relevant faktum','saklig likebehandling og synlig skjønn','begrunnelse og journalspor som tåler kontroll'],cannot_grant:'Juridisk standing kan ikke gjøre en manglende hjemmel gyldig, love tillatelse eller dispensasjon, eller legitimere at vesentlige opplysninger holdes utenfor beslutningsgrunnlaget.'},
    {id:'applicant_developer',standing_axis:'applicant_process_trust',cares_about:['forutsigbar og forståelig prosess','presise dokumentasjonskrav og stabile kriterier','tidlig informasjon når nytt faktum endrer vurderingen'],cannot_grant:'Søkers tilfredshet, økonomiske press eller tillit kan ikke skape tillatelse, korte ned lovpålagt prosess eller gjøre et ønsket vedtaksutfall bindende før riktig avgjørelse.'},
    {id:'neighbors_affected_residents',standing_axis:'neighbor_fairness_trust',cares_about:['at relevante stedlige virkninger faktisk vurderes','at tone skilles fra saklig innhold','at lys, innsyn, trygghet og trafikk ikke forsvinner i formalia'],cannot_grant:'Naboers støtte eller motstand kan ikke avgjøre saken ved flertall, gi formell vedtaksmyndighet eller erstatte hjemmel, faktum og begrunnet skjønn.'},
    {id:'formal_decision_owner',standing_axis:'formal_decision_owner_standing',cares_about:['et avgrenset og tilstrekkelig opplyst beslutningsgrunnlag','tydelig skille mellom hjemmel, faktum og skjønn','at anbefalingen ikke forskutterer utfallet'],cannot_grant:'God standing hos beslutningseier overfører ikke beslutningseierens formelle myndighet til saksbehandleren og kan ikke gjøre faglig anbefaling til ferdig vedtak.'},
    {id:'appeal_review',standing_axis:'appeal_review_trust',cares_about:['journalført sammenheng mellom faktum, hjemmel og skjønn','at nytt faktum og revisjoner er synlige i tidsriktig spor','skille mellom opprinnelig begrunnelse og senere rekonstruksjon'],cannot_grant:'Klageinstansens tillit kan ikke retroaktivt legitimere manglende saksopplysning eller prosess og kan ikke gjøre en senere rekonstruert begrunnelse identisk med det opprinnelige vedtaksgrunnlaget.'},
    {id:'peer_caseworkers',standing_axis:'peer_caseworker_standing',cares_about:['kildespor og overtakbar journal','sammenlignbar praksis med dokumenterte relevante forskjeller','at taus kunnskap ikke er nødvendig for å forstå saken'],cannot_grant:'Kollegial standing kan ikke gjøre presedens til automatisk fasit, gi rett til usaklig forskjellsbehandling eller erstatte korrekt hjemmel og faktisk vurdering.'},
    {id:'private_relations',standing_axis:'private_public_service_mask',cares_about:['at frist og kritikk kan legges bort privat','at offentlig konflikt ikke blir personlig verdi','at profesjonelt ansvar ikke blir total identitet'],cannot_grant:'Private relasjoner kan ikke gi profesjonell myndighet, endre saksansvar eller gjøre personlig støtte til juridisk, faglig eller formell godkjenning.'}
  ],
  divergence_examples:[
    'Et presist mangelbrev kan svekke kortsiktig standing hos en utålmodig søker og hos et miljø som måler gjennomstrømning, samtidig som juridisk kontroll og senere klageinstans får større tillit til vurderingsgrunnlaget.',
    'En avgrenset befaring kan koste friststanding internt, men styrke tillit hos naboer og kolleger dersom den viser at flere løse merknader faktisk beskriver samme stedlige konflikt.',
    'Å endre vurderingen når nytt høydesnitt kommer inn kan oppleves som ustabilitet for søker eller ledelse, men styrker standing hos juridisk kontroll og klageinstans fordi bedre faktum faktisk får endre begrunnelsen.',
    'Å avvise mekanisk presedens kan svekke standing hos dem som ønsker et raskt likt resultat, mens dokumentert relevant forskjell styrker tilliten til reell likebehandling hos fagkontroll og senere lesere.'
  ]
};

const world = {
  schema:'civication_role_world_v1',version:1,category:'by',role_scope:ROLE,
  title:'By-saksbehandler — rettssikkerhet, etterprøvbarhet og situert tillit',status:'role_world_complete',
  sociological_core:{
    main_problem:'Å gjøre offentlig saksbehandling både lovlig, forståelig og etterprøvbar under frist- og partsinteresser, uten å la tillit hos én gruppe bli en snarvei rundt relevant faktum, likebehandling, lovpålagt prosess eller riktig beslutningseier.',
    description:'Role World-en lukker bare situated_reputation-gjelden. Den gjenbruker eksisterende saksbehandlings- og kvalitetssløyfer og den canonicale høyde/nabovirkning/klage-tråden uten å reautorisere persistent work eller rhythm som nytt authored arbeid.'
  },
  theme_ids,
  social_environments:[
    'Saksinntaket der Anne tester om en komplett vedleggsliste faktisk er et vurderbart grunnlag.',
    'Regel- og skjønnsrommet der Erik skiller reell likebehandling fra mekanisk kopiering av tidligere saker.',
    'Nabomerknadsflaten der følelsesladet språk må oversettes til relevante stedlige virkninger uten at antall stemmer blir vedtak.',
    'Befaringen der kart, passasje, lys, innsyn og trafikk kan gjøre skriftlige påstander mer presise.',
    'Journal- og kildesporet der tegningsversjon, faktum, hjemmel og skjønn må kunne gjenfinnes av andre.',
    'Vedtaksgrunnlaget der faglig anbefaling må være tydelig uten å love eller forskuttere riktig beslutningseiers utfall.',
    'Den senere klagebehandlingen der Erik kontrollerer om saken kan etterprøves på det faktiske grunnlaget som forelå da avgjørelsen ble tatt.',
    'Søkerens møte med forvaltningen der forutsigbarhet avhenger av klare krav selv når bedre faktum senere endrer vurderingen.',
    'Privatlivet der fristpress, offentlig kritikk og ansvar må kunne legges bort uten at saksrollen blir hele identiteten.'
  ],
  recurring_people_archetypes:[
    {id:'caseworker_anne_world',social_function:'erfaren seksjonskollega som holder kompletthet, frist, flyt og vurderbarhet i samme bilde',class_position:'faglig erfaren offentlig ansatt med situert påvirkning over arbeidsstandard og saksgang',status:'middels organisatorisk status og høy intern faglig troverdighet',power_over_player:'kan gjøre skjult kvalitetsgjeld synlig og kreve at saken faktisk er opplyst før den går videre',wants:'tydelige mangler, realistisk flyt og begrunnelser som andre kan overta',conceals:'at produksjonspress gjør det sosialt fristende å kalle nesten komplett materiale godt nok',speech_style:'kort og praksisnær; spør hva som mangler, hvorfor det betyr noe og om saken faktisk er vurderbar',teaches_player:'at god intern standing kommer fra å gjøre saksflyt robust, ikke bare rask'},
    {id:'caseworker_erik_world',social_function:'juridisk rådgiver og fagkontroll som tester hjemmel, likebehandling, skjønn og klagerobusthet',class_position:'juridisk spesialist med høy situert innflytelse over rettslig kvalitet',status:'høy fagstatus uten å eie alle formelle vedtak',power_over_player:'kan vise at mekanisk presedens, svak hjemmel eller rekonstruert begrunnelse ikke tåler kontroll',wants:'synlige relevante forskjeller, korrekt hjemmel og et tidsriktig beslutningsspor',conceals:'at klar juridisk struktur kan virke tregere enn en enkel konklusjon når sakslisten er full',speech_style:'presis og kontrasterende; spør hva som er likt, hva som er forskjellig og hva som faktisk bar skjønnet',teaches_player:'at juridisk standing følger etterprøvbarhet, ikke evnen til å få saken raskt ut'},
    {id:'caseworker_maria_world',social_function:'medvirknings- og stedskollega som hjelper å skille merknadens tone fra relevant faktisk virkning',class_position:'faglig spesialist med situert kunnskap om brukere, naboer og stedlige konflikter',status:'middels formell status og høy relasjonell tillit',power_over_player:'kan gjøre det synlig når formell ryddighet skjuler at flere merknader peker mot samme konkrete sted',wants:'saklig representasjon av erfaring, avgrenset befaring og tydelig skille mellom å bli hørt og å avgjøre saken',conceals:'at stedlig opplysning bruker tid og derfor kan bli behandlet som mindre nødvendig enn dokumentkontroll',speech_style:'rolig og konkret; spør hva merknaden faktisk beskriver på stedet og hvordan det kan kontrolleres',teaches_player:'at nabo- og brukerstanding kan gi evidens uten å bli en stemmeseddel om vedtaket'},
    {id:'caseworker_applicant_world',social_function:'søker eller tiltakshaver som trenger forutsigbarhet, tydelige krav og forståelig saksflyt',class_position:'part med økonomiske og tidsmessige interesser men uten offentlig beslutningsmyndighet',status:'varierende ekstern status og presskraft',power_over_player:'kan gjøre forsinkelser sosialt og økonomisk kostbare og utfordre om kravene faktisk er stabile og relevante',wants:'presise mangler, klare kriterier og tidlig beskjed når nytt faktum endrer saken',conceals:'at ønsket om framdrift kan gjøre nesten komplett materiale fristende å framstille som tilstrekkelig',speech_style:'resultat- og tidsorientert; spør hva som mangler, når saken kan gå videre og hvorfor vurderingen eventuelt endres',teaches_player:'at søkerens prosess-tillit styrkes av forutsigbar ærlighet, ikke av løfter om tillatelse'},
    {id:'caseworker_neighbor_world',social_function:'nabo eller berørt innbygger som beskriver konkrete virkninger uten å eie hjemmel eller vedtak',class_position:'part eller berørt person med legitim situert erfaring og begrenset formell makt',status:'lav formell status og mulig høy offentlig synlighet',power_over_player:'kan synliggjøre lys, innsyn, trygghet og trafikk som dokumentene alene gjør svake',wants:'at relevant erfaring blir vurdert saklig og ikke avvist på grunn av tone eller manglende juridisk språk',conceals:'at personlig belastning kan gjøre enkelte virkninger større i opplevelsen enn det samlede rettslige grunnlaget bærer alene',speech_style:'erfaringsnær og konkret; beskriver hva tiltaket gjør med hverdagen og stedet',teaches_player:'at nabo-standing handler om rettferdig lytting og begrunnelse, ikke om flertall eller automatisk medhold'},
    {id:'caseworker_formal_owner_world',social_function:'formell beslutningseier som trenger et opplyst grunnlag uten at saksbehandleren allerede har gjort anbefalingen til vedtak',class_position:'institusjonell eier av avgjørelse innen delegert eller lovbestemt myndighet',status:'høy formell myndighetsstatus innen saken',power_over_player:'kan fatte, avvise eller sende saken tilbake dersom grunnlaget, hjemmelen eller prosessen ikke er tilstrekkelig',wants:'klart beslutningsspørsmål, sporbar begrunnelse og synlige relevante merknader',conceals:'at en ryddig anbefaling sosialt kan være enklere å følge enn å åpne et vanskelig skjønn på nytt',speech_style:'formell og avgrensende; spør hva som er hjemmel, hva som er faktum og hva som faktisk må besluttes',teaches_player:'at saksbehandlerens standing aldri kan erstatte den som eier det formelle vedtaket'},
    {id:'caseworker_appeal_world',social_function:'klage- eller kontrollinstans som leser saken senere og tester om avgjørelsen kan etterprøves',class_position:'senere kontrollnivå med myndighet til å prøve eller påvirke avgjørelsen etter gjeldende ordning',status:'høy kontrollstatus i etterkant',power_over_player:'kan avdekke forskjellen mellom tidsriktig begrunnelse og argumenter rekonstruert først etter klage',wants:'sammenheng mellom faktum, hjemmel, skjønn, journal og senere revisjoner',conceals:'at ettertidens oversikt kan gjøre en bedre begrunnelse fristende enn den saken faktisk hadde da vedtaket ble tatt',speech_style:'retrospektivt presis; spør hvilket grunnlag som forelå, hva som endret seg og hvor dette er dokumentert',teaches_player:'at senere standing bygges av sporbarhet før konflikten oppstår'},
    {id:'caseworker_private_world',social_function:'privat nær relasjon som møter personen når frist, partskonflikt og offentlig kritikk følger med hjem',class_position:'privat likemann uten profesjonell eller offentlig myndighet',status:'emosjonell nærhet uten faglig rang',power_over_player:'kan utfordre behovet for å gjøre enhver klage eller forsinkelse til personlig dom over egen verdi',wants:'at personen kan legge bort saken når arbeidsdagen er slutt og andre eier neste steg',conceals:'at privatlivet blir slitent når offentlig ansvar aldri får en tydelig grense',speech_style:'direkte og avdramatiserende; spør om saken trenger deg nå eller om den ligger i systemet til neste arbeidsdag',teaches_player:'at offentlig standing er situert og ikke identisk med personlig verdi'}
  ],
  slow_axes:[
    {id:'case_assessability',meaning:'om saken faktisk er tilstrekkelig opplyst til at hjemmel og skjønn kan brukes på relevant faktum',runtime_binding:'existing'},
    {id:'decision_trace_quality',meaning:'om tegningsversjon, faktum, hjemmel, merknad og skjønn forblir koblet gjennom journal og vedtak',runtime_binding:'existing'},
    {id:'equal_treatment_reasoning',meaning:'om relevante likheter og forskjeller er synlige når tidligere praksis brukes som sammenligning',runtime_binding:'existing'},
    {id:'section_leadership_standing',meaning:'situert tillit i seksjonen til robust saksflyt, vurderbarhet og faglig begrunnet revisjon',runtime_binding:'editorial_only_until_governed'},
    {id:'legal_quality_standing',meaning:'situert tillit hos juridisk kontroll til hjemmel, likebehandling, skjønn og etterprøvbarhet',runtime_binding:'editorial_only_until_governed'},
    {id:'applicant_process_trust',meaning:'situert tillit hos søker til forutsigbare krav, kommunikasjon og redelig prosess',runtime_binding:'editorial_only_until_governed'},
    {id:'neighbor_fairness_trust',meaning:'situert tillit hos naboer til at relevante stedlige virkninger faktisk blir lest og begrunnet',runtime_binding:'editorial_only_until_governed'},
    {id:'formal_decision_owner_standing',meaning:'situert tillit hos riktig beslutningseier til et opplyst og ikke-forskuttert vedtaksgrunnlag',runtime_binding:'editorial_only_until_governed'},
    {id:'appeal_review_trust',meaning:'situert tillit hos senere klagekontroll til journal, tidsriktig begrunnelse og faktumspor',runtime_binding:'editorial_only_until_governed'},
    {id:'peer_caseworker_standing',meaning:'situert kollegial tillit til kildespor, overtakbarhet og saklig presedensbruk',runtime_binding:'editorial_only_until_governed'},
    {id:'private_public_service_mask',meaning:'hvor sterkt frist, offentlig kritikk og saksansvar smelter sammen med personlig verdi privat',runtime_binding:'editorial_only_until_governed'}
  ],
  existing_work_continuity,
  situated_reputation_model,
  season:{days:14,day_phases:phases,coverage},
  primary_threads:[
    {id:'assessability_and_missing_fact',beat_refs:['1/morning','2/afternoon','6/morning','8/morning','10/morning']},
    {id:'equal_treatment_and_legal_reasoning',beat_refs:['3/lunch','4/afternoon','6/lunch','9/lunch','13/lunch']},
    {id:'place_evidence_and_neighbor_effect',beat_refs:['3/afternoon','5/afternoon','8/afternoon','9/afternoon','12/lunch']},
    {id:'journal_revision_and_appeal',beat_refs:['7/afternoon','8/morning','10/afternoon','12/afternoon','13/afternoon','14/morning']},
    {id:'situated_public_service_standing',beat_refs:['2/lunch','4/lunch','6/lunch','9/lunch','11/lunch','12/lunch','14/lunch']},
    {id:'private_pressure_and_identity',beat_refs:['2/evening','6/evening','9/evening','12/evening','14/evening']}
  ],
  private_aftermath:[
    {id:'after_missing_document',beat_ref:'2/evening',meaning:'Å be om mer dokumentasjon kan kjennes som å skape forsinkelsen selv om mangelen er det som gjør saken utrygg å vurdere.'},
    {id:'after_deadline_pressure',beat_ref:'6/evening',meaning:'Fristpress kan gjøre faglig forsiktighet sosialt lik treghet, men saken må kunne være uferdig uten at personen blir det.'},
    {id:'after_changed_assessment',beat_ref:'9/evening',meaning:'Når bedre faktum endrer vurderingen kan kritikk av ustabilitet følge hjem selv om korreksjonen er et tegn på faglig integritet.'},
    {id:'after_appeal',beat_ref:'12/evening',meaning:'En klage utfordrer et offentlig vedtak, men trenger ikke bli en privat dom over saksbehandlerens verdi eller identitet.'},
    {id:'after_equal_treatment_dispute',beat_ref:'13/evening',meaning:'Uenighet om likebehandling kan være legitim selv når saksbehandleren har dokumentert relevante forskjeller og riktig prosess.'},
    {id:'after_traceable_close',beat_ref:'14/evening',meaning:'Et etterprøvbart spor kan avslutte arbeidsperioden selv om søker, nabo og kontrollnivå fortsatt vurderer utfallet forskjellig.'}
  ],
  delayed_consequences:[
    {id:'missing_height_returns',setup_ref:'1/morning',return_ref:'8/morning',meaning:'Den opprinnelige høyde-mangelen kommer tilbake når nytt snitt faktisk endrer nabovirkningen og viser hvorfor vurderbarhetskontrollen var nødvendig.'},
    {id:'neighbor_effect_returns',setup_ref:'3/afternoon',return_ref:'9/afternoon',meaning:'Tidlig stedlig virkning kommer tilbake når søker og nabo tolker den reviderte vurderingen ulikt og situated standing divergerer.'},
    {id:'precedent_difference_returns',setup_ref:'4/afternoon',return_ref:'13/lunch',meaning:'Den relevante stedlige forskjellen i presedenssammenligningen kommer senere tilbake som spørsmål om ulik behandling i klagen.'},
    {id:'source_trace_returns',setup_ref:'7/afternoon',return_ref:'12/afternoon',meaning:'Kildesporet til korrekt tegningsversjon gjør det senere mulig å vise hvilket faktum som faktisk bar vurderingen før vedtaket.'},
    {id:'revised_fact_returns',setup_ref:'8/morning',return_ref:'13/afternoon',meaning:'Den åpne revisjonen etter nytt snitt kommer tilbake når klageinstansen skiller tidsriktig endring fra senere rekonstruksjon.'},
    {id:'decision_reasoning_returns',setup_ref:'10/afternoon',return_ref:'14/morning',meaning:'Den samlede begrunnelseskjeden gjør slutten av perioden etterprøvbar uten at vedtaket må bygges på nytt fra dagens oversikt.'}
  ],
  cross_role_link:{status:'candidate_when_shared_work_is_real',materialized:false,new_runtime:false,rule:'Cross-role materialiseres først når et genuint shared canonical work-object har eksplisitt runtime-eier; samarbeid med Anne, Maria, Erik eller en klageinstans er ikke alene nok.'},
  materialization:{authored_dimensions:['situated_reputation'],no_new_runtime:true,existing_plan_preserved:true,existing_role_model_preserved:true,existing_work_grammar_preserved:true,existing_persistent_work_preserved:true,existing_rhythm_preserved:true,cross_role_link_materialized:false,source_refs:refCycle}
};

write(WORLD_PATH, world);
const index = read('data/Civication/roleWorlds/index.json');
if (!(index.roles || []).some(row => row.path === WORLD_PATH)) index.roles.push({category:'by',role_scope:ROLE,status:'role_world_complete',path:WORLD_PATH});
index.status = 'thirty_role_worlds_materialized';
index.effective_date = '2026-08-28';
write('data/Civication/roleWorlds/index.json', index);
const checklist = read('data/Civication/roleWorldAuthoringChecklist.json');
checklist.reference_worlds ||= [];
if (!checklist.reference_worlds.includes(WORLD_PATH)) checklist.reference_worlds.push(WORLD_PATH);
write('data/Civication/roleWorldAuthoringChecklist.json', checklist);
const themeBank = read('data/Civication/roleWorldThemeBank.json');
themeBank.reference_profiles ||= {};
themeBank.reference_profiles[KEY] = theme_ids;
write('data/Civication/roleWorldThemeBank.json', themeBank);
const report = `# Civication By Saksbehandler Role World rollout\n\n- status: role_world_complete\n- authored dimension: situated_reputation only\n- coverage: 14 days / 56 beats\n- canonical source refs: 9\n- existing continuity reused: ${THREAD}\n- existing persistent work and rhythm preserved, not re-authored\n- canonical role model preserved: data/Civication/roleModels/by/saksbehandler_plan_bygg.json\n- compatibility/shared model preserved: data/Civication/roleModels/by/by_saksbehandler.json\n- existing 8-step mail plan and work grammar preserved\n- cross-role: candidate_when_shared_work_is_real / not materialized\n- new runtime: false\n- global reputation score: forbidden\n\nStanding cannot create permission, dispensation or formal decision authority, waive statutory process, justify unequal treatment without objective grounds, or hide material facts from the decision record.\n`;
fs.writeFileSync(path.join(ROOT, 'reports/CIVICATION_BY_SAKSBEHANDLER_ROLE_WORLD_ROLLOUT.md'), report);
console.log(`Materialized ${WORLD_PATH}: ${coverage.length} beats / ${refCycle.length} canonical source refs`);
