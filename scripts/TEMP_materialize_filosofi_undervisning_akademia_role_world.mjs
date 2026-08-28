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

const ROLE = 'filosofi_undervisning_og_akademia';
const KEY = 'filosofi/filosofi_undervisning_og_akademia';
const WORLD_PATH = 'data/Civication/roleWorlds/filosofi/filosofi_undervisning_og_akademia.json';
const refs = {
  job:'data/Civication/mailFamilies/filosofi/job/filosofi_undervisning_og_akademia_job.json#filosofi_undervisning_job_laringsdesign_001',
  people:'data/Civication/mailFamilies/filosofi/people/filosofi_undervisning_og_akademia_people.json#filosofi_undervisning_people_studentuenighet_001',
  conflict:'data/Civication/mailFamilies/filosofi/conflict/filosofi_undervisning_og_akademia_conflict.json#filosofi_undervisning_conflict_sensorgrunnlag_001',
  story:'data/Civication/mailFamilies/filosofi/story/filosofi_undervisning_og_akademia_story.json#filosofi_undervisning_story_integritet_001',
  event:'data/Civication/mailFamilies/filosofi/event/filosofi_undervisning_og_akademia_event.json#filosofi_undervisning_event_tilrettelegging_001',
  micro:'data/Civication/mailFamilies/filosofi/micro/filosofi_undervisning_og_akademia_micro.json#filosofi_undervisning_micro_kriteriepresisering_001',
  knowledge:'data/Civication/mailFamilies/filosofi/knowledge/filosofi_undervisning_og_akademia_knowledge.json#filosofi_undervisning_knowledge_naess_001',
  followup:'data/Civication/mailFamilies/filosofi/followup/filosofi_undervisning_og_akademia_followup.json#filosofi_undervisning_followup_vurdering_001',
  consequence:'data/Civication/mailFamilies/filosofi/consequence/filosofi_undervisning_og_akademia_consequence.json#filosofi_undervisning_consequence_eksamen_001'
};
const refCycle = Object.values(refs);
const phases = ['morning','lunch','afternoon','evening'];
const phaseTypes = {morning:'info',lunch:'conversation',afternoon:'task',evening:'private_consequence'};
const phaseThreads = {
  morning:'laringsdesign_og_studentbevis',
  lunch:'uenighet_vurdering_og_standing',
  afternoon:'institusjonell_prosess_og_kriteriebruk',
  evening:'forsinket_konsekvens_og_privataftermath'
};
const dayThemes = [
  'Emneplanen viser at eksamen krever selvstendig argumentrekonstruksjon, mens undervisningen fortsatt bruker mest tid på gjenfortelling. Sigrid trenger et læringsdesign som gjør vurdert kompetanse trenbar uten å senke faglig standard eller skjule mismatchen.',
  'En student avviser foreleserens egen konklusjon, men rekonstruerer argumentet velvillig, bruker pensum presist og gir et reelt motargument. Underviserens profesjonelle standing testes av om uenighet møtes med samme faglige kriterier som enighet.',
  'Amal oppdager at «selvstendig syntese» virker som et sterkt kvalitetskjennetegn, men det står ikke i publiserte kriterier. Sensorstanding kan bygges gjennom konsistent kriteriebruk selv når et intuitivt nytt krav ville gjort toppkarakteren lettere å forklare.',
  'Nora peker på konkrete tekstlikheter som kan gi grunn til integritetskontroll, men bevisbildet avgjør ikke skyld. Rollen må skille observasjon, dokumentasjon og formell prosess slik at alvor håndteres uten at underviserstanding blir uformell sanksjonsmyndighet.',
  'En student ber om alternativ gjennomføring og begynner å dele helseopplysninger direkte. Hjelpevilje kan gi sosial tillit, men riktig standing krever at læringsmålet beskrives presist mens dataminimering og den formelle tilretteleggingsprosessen forblir hos riktig eier.',
  'Sensorene bruker «analytisk presisjon» ulikt i begrunnelsene. Et publisert kriterium må operasjonaliseres med konkrete tekstbevis uten å bli utvidet retrospektivt, og ulike aktører kan vurdere denne langsommere presiseringen forskjellig.',
  'History Go-profilen til Arne Næss kan gi idéhistorisk kontekst fra Mærradalen, men kan ikke brukes som nåtidig pedagogisk fasit. Faglig standing bygges ved å holde historisk relevans og dagens lærings- og vurderingsmyndighet tydelig atskilt.',
  'Studenten ber om begrunnelse og spør hvorfor selvstendig syntese ikke ga eget utslag. Den tidligere sensoravgrensningen kommer tilbake, og underviseren må forklare vurderingen med publiserte kriterier uten å love klageresultat eller rekonstruere en skjult standard i ettertid.',
  'Eksamensresultatene viser at studentene kan gjengi teorier, men strever systematisk med premisser, inferens og motargument. Studielederstanding og studenttillit kan styrkes av å erkjenne alignment-gjeld selv om det kortsiktig synliggjør svakhet i emnedesignet.',
  'Seminarteamet diskuterer om tydelig styring av diskusjonen ville gitt roligere undervisning. Rollen må skille pedagogisk ledelse fra standpunktkontroll og la saklig uenighet være en faglig ressurs uten at klassemiljøet blir grenseløst.',
  'Sensor- og administrasjonsmiljøet trenger et etterprøvbart spor mellom kriterier, tekststeder, begrunnelse og eventuell klage. Samme dokumentasjon kan gi høy standing hos prosesseiere selv når den oppleves byråkratisk eller lite fleksibel av andre.',
  'En formell integritets- eller tilretteleggingssak går videre utenfor underviserens beslutningsrom. Profesjonell tillit avhenger nå av om den tidligere eskaleringen var presis og dataminimal, ikke av at underviseren får eie utfallet.',
  'Studentene diskuterer rettferdigheten i vurderingen og legger ulik vekt på karakter, begrunnelse og opplevd åpenhet. Situated reputation kan divergere mellom studentgrupper, sensor, studieleder og fagfeller uten at noen samlet score erstatter de faktiske kriteriene.',
  'Perioden avsluttes med at alignment-, vurderings-, integritets-, tilretteleggings- og uenighetssporene fortsatt er de samme canonical work loops. Det nye laget er bare situert standing: hvem som stoler på hvilken del av arbeidet og hvorfor, uten ny runtime eller myndighet.'
];
const phaseTail = {
  morning:'Morgenen gjør siste bekreftede læringsmål, studentbevis, kriterium eller prosessgrense synlig før undervisnings- og vurderingsteamet bygger videre, uten å authorere et nytt persistent work-object.',
  lunch:'Lunsjflaten viser at studieleder, seminarteam, sensor, studieadministrasjon, studenter, formelle integritets- og klageprosesser, fagfeller og private relasjoner kan vurdere samme handling forskjellig uten en global reputation-score.',
  afternoon:'Ettermiddagen bruker de eksisterende undervisningsdesign- og vurderingssløyfene til kriteriebruk, veiledning, eskalering, kalibrering eller emnerevisjon; rhythm, handoff og rework forblir den allerede canonicale arbeidsstrukturen.',
  evening:'Kvelden viser forsinket sosial og privat aftermath når karakterpress, kritikk, klage eller kursrevisjon følger med hjem, samtidig som profesjonell standing holdes adskilt fra personlig verdi og fra formell akademisk myndighet.'
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
  new_runtime_state:false,
  work_loops:['undervisningsdesign_og_gjennomforing','vurdering_og_kvalitetssikring'],
  thread_keys:[
    'filosofi_undervisning_alignment_001',
    'filosofi_undervisning_vurdering_001',
    'filosofi_undervisning_integritet_001',
    'filosofi_undervisning_tilrettelegging_001',
    'filosofi_undervisning_uenighet_001'
  ],
  rule:'Eksisterende work grammar og mailtråder beviser allerede persistent undervisningsarbeid, vurderingsrytme, rework, klage- og integritetseskalering, tilretteleggingsgrense og faglig uenighet. Rollouten authorer bare situert standing over denne canonicale arbeidsstrukturen og oppretter ingen ny rhythm- eller runtime-state.'
};

const situated_reputation_model = {
  global_score_allowed:false,
  rule:'Standing er audience-spesifikk og kan divergere mellom studieleder, seminarteam, sensor, studieadministrasjon, studenter, formell integritets-/klageprosess, fagfeller og private relasjoner. Ingen global reputation-score materialiseres.',
  authority_separation:'Standing kan aldri gjøre personlig enighet til vurderingskriterium, innføre skjulte kriterier, avgjøre fusk eller sanksjon uten formell prosess, overstyre klage, habilitet, tilrettelegging eller personvern, autorisere unødvendige sensitive studentdata, gjøre Professor-tier til akademisk kvalifikasjon eller bruke Arne Næss som nåtidig pedagogisk autoritet.',
  audiences:[
    {id:'study_leadership',standing_axis:'study_leadership_standing',cares_about:['sammenheng mellom læringsmål, aktivitet og vurdering','dokumentert emnekvalitet og korrekt eskalering','at problemer brukes til forbedring uten uformell myndighetsglidning'],cannot_grant:'Studielederens tillit kan støtte emne- og undervisningsarbeid, men kan ikke gjøre badge-nivå til akademisk kvalifikasjon, oppheve formelle prosesser eller autorisere skjulte vurderingskrav.'},
    {id:'seminar_colleagues',standing_axis:'seminar_colleague_standing',cares_about:['saklig uenighetsledelse','studentenes faktiske misforståelser og læringsbehov','undervisningsopplegg som gir rom for argumentarbeid'],cannot_grant:'Seminarteamets tillit kan påvirke undervisningssamarbeid, men kan ikke gjøre lærerens standpunkt til fasit, erstatte publiserte kriterier eller gi formell sensur-, klage- eller sanksjonsmyndighet.'},
    {id:'assessment_sensor',standing_axis:'assessment_sensor_standing',cares_about:['publiserte kriterier og konsistent anvendelse','konkrete tekstbevis og etterprøvbar begrunnelse','kalibrering uten retroaktiv standardglidning'],cannot_grant:'Sensorstanding kan støtte faglig vurderingssamarbeid, men kan ikke autorisere nye skjulte kriterier etter innlevering, love klageutfall eller omgå habilitets- og klageprosess.'},
    {id:'study_administration',standing_axis:'study_administration_standing',cares_about:['korrekt tilretteleggings- og studentadministrativ prosess','dataminimering og fristspor','tydelig skille mellom faglig standard og administrativ beslutningsmyndighet'],cannot_grant:'Administrativ tillit kan gjøre samhandling lettere, men kan ikke flytte formell tilretteleggings-, personvern-, klage- eller sanksjonsmyndighet til underviseren eller legitimere unødvendig innsamling av sensitive data.'},
    {id:'students',standing_axis:'student_trust_standing',cares_about:['forhåndskjente kriterier og lik faglig standard','rett til saklig uenighet uten standpunktstraff','forståelig begrunnelse, personvern og reell læringsmulighet'],cannot_grant:'Studentenes støtte eller misnøye kan påvirke situert tillit, men kan ikke bestemme karakter, oppheve faglig standard, gi underviseren klagekompetanse eller gjøre popularitet til mål på argumentkvalitet.'},
    {id:'academic_integrity_and_appeal_process',standing_axis:'formal_process_standing',cares_about:['presist dokumenterte observasjoner','skille mellom mistanke og avgjørelse','uavhengig klage, habilitet og korrekt eskalering'],cannot_grant:'Høy standing i formelle prosesser kan ikke gi underviseren rett til å forhåndsdømme fusk, bestemme sanksjon alene, påvirke uavhengig klage eller utvide mandatet utover dokumentasjon og korrekt henvisning.'},
    {id:'academic_peers',standing_axis:'academic_peer_standing',cares_about:['argumentpedagogikk og reell uenighet','transparent vurderingspraksis','emnerevisjon som følger dokumentert lærings- og vurderingsbevis'],cannot_grant:'Fagfellers anerkjennelse kan styrke profesjonell standing, men kan ikke gjøre institusjonell konsensus til formell myndighet, skjult kriterium eller akademisk kvalifikasjon som badge-systemet ikke representerer.'},
    {id:'private_relations',standing_axis:'private_academic_status_mask',cares_about:['at karakterkonflikt og studentkritikk ikke blir personlig verdi','at formelle prosesser kan legges hos riktig eier','at Professor-status i spillet ikke blir identitet eller faktisk yrkeskvalifikasjon'],cannot_grant:'Private relasjoner kan gi støtte og perspektiv, men kan ikke gi undervisnings-, vurderings-, klage-, tilretteleggings- eller sanksjonsmyndighet og kan ikke gjøre personlig bekreftelse til faglig dokumentasjon.'}
  ],
  divergence_examples:[
    'Å holde seg til publiserte kriterier kan styrke sensor- og studenttillit selv når en kollega mener et nytt kvalitetskjennetegn burde brukes for å skille toppbesvarelser.',
    'Å belønne et sterkt argument som går mot foreleserens standpunkt kan styrke student- og fagfellestillit samtidig som det gjør seminarledelsen mindre kontrollert og mer krevende.',
    'Å eskalere mulig fusk uten å fastslå skyld kan oppleves langsomt for undervisningsteamet, men styrke standing i integritetsprosessen fordi observasjon og avgjørelse forblir adskilt.',
    'Å stoppe unødvendig helseinformasjon og sende til formell tilrettelegging kan frustrere en student som ønsker rask løsning, men styrke langsiktig tillit til personvern og prosess.',
    'Å revidere emnet etter et systematisk eksamensgap kan kortsiktig svekke status ved å synliggjøre alignment-problemet, men styrke studieleder-, student- og fagfellestillit til forbedringsarbeidet.'
  ]
};

const world = {
  schema:'civication_role_world_v1',version:1,category:'filosofi',role_scope:ROLE,
  title:'Filosofisk undervisning og akademia — situert tillit i undervisning, vurdering og prosess',status:'role_world_complete',
  sociological_core:{
    main_problem:'Å undervise, vurdere og veilede med tydelig faglig autoritet uten at personlig enighet, prestisje, studenttilfredshet eller uformell problemløsning glir over i skjulte kriterier eller myndighet rollen ikke eier.',
    description:'Role World-en lukker bare situated_reputation. Den gjenbruker eksisterende undervisningsdesign, vurderingssløyfer og canonicale alignment-, vurderings-, integritets-, tilretteleggings- og uenighetstråder uten å reauthorere persistent work eller rhythm.'
  },
  theme_ids,
  social_environments:[
    'Studieledermøtet der emnekvalitet, vurderingsordning og forbedringsbehov er synlige, men formelle beslutninger fortsatt har institusjonell eier.',
    'Seminarrommet der studentuenighet kan være tegn på høy argumentkvalitet og samtidig utfordre lærerens kontroll og status.',
    'Vurderingsrommet der sensorene må kalibrere publiserte kriterier uten å gjøre intuitive kvalitetsforskjeller til nye skjulte standarder.',
    'Studieadministrasjonen der frister, tilrettelegging, personvern og studentdata krever tydelig skille mellom faglig bidrag og formell myndighet.',
    'Integritetssporet der konkret kildeproblem kan være alvorlig uten at mistanke blir skyld før riktig prosess er gjennomført.',
    'Begrunnelses- og klageflaten der underviseren må forklare egen vurdering uten å etterrasjonalisere eller forsøke å eie uavhengig behandling.',
    'History Go-ankeret Mærradalen der Arne Næss er canonical filosofihistorisk kontekst og aldri fiktiv kollega eller pedagogisk fasit.',
    'Fagfellesskapet der emnedesign, argumentpedagogikk og vurderingspraksis får profesjonell standing gjennom etterprøvbarhet og forbedring.',
    'Privatlivet der kritikk, karakterkonflikt og Professor-status må holdes adskilt fra personlig verdi og faktisk akademisk kvalifikasjon.'
  ],
  recurring_people_archetypes:[
    {id:'teaching_study_lead_world',social_function:'studieleder som eier emneramme, vurderingsordning og institusjonell eskalering',class_position:'faglig leder med formell beslutningsmakt over emneramme og prosess',status:'høy organisatorisk og faglig status',power_over_player:'kan kreve emneforbedring, avklare mandat og sende formelle spørsmål til riktig prosess',wants:'sammenheng mellom mål, aktivitet og vurdering samt dokumentert forbedring',conceals:'at produksjonspress kan gjøre stabile resultater sosialt mer attraktive enn å synliggjøre et systematisk designproblem',speech_style:'strukturert og beslutningsnær; spør hva emnet lover, trener og faktisk måler',teaches_player:'at ledelsestillit bygges av sporbar forbedring uten at lederstatus erstatter kriterier eller prosess'},
    {id:'teaching_seminar_world',social_function:'seminarleder som observerer studentargumenter, uenighet og misforståelser i praksis',class_position:'faglig samarbeidspartner med delegert undervisningsansvar',status:'middels intern status med høy situert nærhet til studentenes læring',power_over_player:'kan gjøre læringsgap og standpunktbias synlig før vurderingen låser dem inn',wants:'reell filosofisk diskusjon der faglig kvalitet er tydeligere enn lærerens personlige konklusjon',conceals:'at mer åpen uenighet kan gjøre undervisningen vanskeligere å styre og mindre komfortabel for teamet',speech_style:'student- og argumentnær; spør hva studenten faktisk gjorde godt og hvor argumentet skiller lag',teaches_player:'at undervisningsstanding kan styrkes av kontrollert uenighet fremfor lydighet'},
    {id:'teaching_sensor_world',social_function:'sensorpartner som kalibrerer kriterier, tekstbevis og begrunnelser',class_position:'faglig likemann med formell vurderingsrolle i den aktuelle prosessen',status:'høy situert status i sensurarbeidet',power_over_player:'kan utfordre inkonsistent kriteriebruk og kreve etterprøvbar begrunnelse',wants:'samme publiserte standard anvendt på konkrete tekststeder og grenseeksempler',conceals:'at intuitiv faglig skjønn kan gjøre et nytt kvalitetskjennetegn fristende å bruke selv om studentene aldri fikk vite om det',speech_style:'kalibrerende og presis; spør hvilket kriterium, hvilket tekststed og hvilken forskjell karakteren uttrykker',teaches_player:'at sensorstanding følger transparent kriteriebruk, ikke bare sikker faglig magefølelse'},
    {id:'teaching_administration_world',social_function:'studiekonsulent som eier frister, tilretteleggingsprosess, studentadministrasjon og personverngrenser',class_position:'administrativ spesialist med avgrenset formell prosessmyndighet',status:'middels organisatorisk status og høy prosessrelevans',power_over_player:'kan stoppe uformell datainnsamling, rute saker riktig og avgrense underviserens rolle',wants:'minst mulig persondata, tydelig faglig standard og korrekt formell prosess',conceals:'at korrekt prosess kan oppleves treg når student og underviser begge ønsker en rask praktisk løsning',speech_style:'rolig og prosessnær; spør hva du faktisk trenger å vite og hvem som eier beslutningen',teaches_player:'at administrativ standing bygges ved å hjelpe uten å overta myndighet'},
    {id:'teaching_student_world',social_function:'student som møter undervisning, uenighet, vurdering og begrunnelse fra mottakersiden',class_position:'lærende part med lavere institusjonell makt men legitime rettigheter og situert kunnskap om læringsopplevelsen',status:'lav formell rang og høy relevans for undervisningens tillit',power_over_player:'kan synliggjøre skjulte kriterier, standpunktstraff, uklare læringsmål eller manglende personvern',wants:'forutsigbare kriterier, reell læringsmulighet, saklig uenighet og forståelig begrunnelse',conceals:'at karakterutfall og opplevd rettferdighet ikke alltid peker i samme retning og at misnøye kan bestå selv ved korrekt prosess',speech_style:'konkret og erfaringsnær; spør hva som faktisk ble forventet og hvorfor vurderingen ble som den ble',teaches_player:'at studenttillit må tåle uenighet og skuffelse uten at faglig standard blir popularitetsstyrt'},
    {id:'teaching_integrity_process_world',social_function:'formell prosessaktør som skiller observasjon, mistanke, bevis, habilitet og beslutning',class_position:'institusjonell beslutningsflate utenfor underviserens personlige mandat',status:'høy formell autoritet i avgrensede integritets- og klagesaker',power_over_player:'kan overta avgjørelser som underviseren ikke eier og kontrollere om dokumentasjonen er prosessriktig',wants:'presise observasjoner, dataminimering, uavhengighet og sporbare rollegrenser',conceals:'at formelle prosesser kan oppleves distanserte fra undervisningsrelasjonen selv når distansen er nødvendig for rettssikkerhet',speech_style:'formell og evidensnær; spør hva som er observert, hva som er antatt og hvem som har beslutningskompetanse',teaches_player:'at høy profesjonell standing noen ganger betyr å gi fra seg kontroll til riktig prosess'},
    {id:'teaching_peer_world',social_function:'akademisk fagfelle som vurderer argumentpedagogikk, emnedesign og vurderingspraksis',class_position:'profesjonell likemann uten direkte myndighet over den aktuelle studentbeslutningen',status:'høy epistemisk og kollegial innflytelse',power_over_player:'kan gjøre alignment-problemer, standpunktbias eller svake begrunnelser synlige i fagmiljøet',wants:'undervisning som trener vurdert kompetanse og dokumenterer endringer når evidensen viser systematiske gap',conceals:'at akademisk prestisje kan gjøre det vanskelig å erkjenne at et etablert emneopplegg bør revideres',speech_style:'analytisk og sammenlignende; spør hva studentene fikk øve på og hva sensuren faktisk viser',teaches_player:'at fagfellestanding styrkes av etterprøvbar forbedring mer enn av ufeilbarlig fasade'},
    {id:'teaching_private_world',social_function:'privat nær relasjon som møter personen etter karakterkonflikt, studentkritikk og institusjonelt press',class_position:'privat likemann uten akademisk mandat',status:'emosjonell nærhet uten profesjonell rang',power_over_player:'kan utfordre behovet for å lese enhver klage, kritikk eller Professor-status som dom over egen personlige verdi',wants:'at arbeidet kan legges bort og at formell prosess får være hos riktig eier',conceals:'at privatlivet tappes når alle undervisningskonflikter og prestisjesignaler følger med hjem',speech_style:'direkte og avdramatiserende; spør hva du faktisk eier nå og hva som allerede ligger hos andre',teaches_player:'at profesjonell standing og personlig verdi ikke er samme system'}
  ],
  slow_axes:[
    {id:'alignment_trace_quality',meaning:'om læringsmål, aktivitet, studentbevis og vurderingsform forblir koblet når emnet utvikles',runtime_binding:'editorial_only_until_governed'},
    {id:'assessment_trace_quality',meaning:'om kriterium, tekststed, sensoruenighet og begrunnelse forblir etterprøvbare gjennom vurderingssporet',runtime_binding:'editorial_only_until_governed'},
    {id:'study_leadership_standing',meaning:'situert tillit hos studieleder til emnekvalitet, forbedring og korrekt prosessgrense',runtime_binding:'editorial_only_until_governed'},
    {id:'seminar_colleague_standing',meaning:'situert tillit i undervisningsteamet til faglig uenighet, observasjon og læringsrespons',runtime_binding:'editorial_only_until_governed'},
    {id:'assessment_sensor_standing',meaning:'situert tillit hos sensor til konsistent publisert kriteriebruk og begrunnelse',runtime_binding:'editorial_only_until_governed'},
    {id:'student_trust_standing',meaning:'situert studenttillit til forhåndskjente kriterier, læringsmulighet, uenighet og personvern',runtime_binding:'editorial_only_until_governed'},
    {id:'formal_process_standing',meaning:'situert tillit i integritets-, klage- og tilretteleggingsprosesser til dokumentasjon og rollegrense',runtime_binding:'editorial_only_until_governed'},
    {id:'private_academic_status_mask',meaning:'hvor sterkt karakterkritikk, klage og akademisk prestisje smelter sammen med personlig verdi privat',runtime_binding:'editorial_only_until_governed'}
  ],
  existing_work_continuity,
  situated_reputation_model,
  season:{days:14,day_phases:phases,coverage},
  primary_threads:[
    {id:'alignment_and_exam_evidence',beat_refs:['1/morning','1/afternoon','5/lunch','9/morning','9/afternoon','11/lunch','14/morning']},
    {id:'assessment_criteria_and_appeal',beat_refs:['3/morning','3/afternoon','6/morning','6/afternoon','8/lunch','8/afternoon','11/afternoon','13/lunch']},
    {id:'disagreement_and_student_trust',beat_refs:['2/morning','2/lunch','4/lunch','7/lunch','10/morning','10/lunch','13/morning']},
    {id:'integrity_accommodation_and_process',beat_refs:['4/morning','4/afternoon','5/morning','5/afternoon','12/morning','12/afternoon','14/afternoon']},
    {id:'situated_standing',beat_refs:['1/lunch','3/lunch','6/lunch','8/lunch','9/lunch','11/lunch','12/lunch','13/lunch']},
    {id:'private_academic_aftermath',beat_refs:['2/evening','4/evening','6/evening','8/evening','10/evening','12/evening','14/evening']}
  ],
  private_aftermath:[
    {id:'after_student_disagreement',beat_ref:'2/evening',meaning:'En faglig sterk student som er tydelig uenig kan utfordre lærerstatus uten at uenigheten er et problem som skal korrigeres i karakter eller seminar.'},
    {id:'after_sensor_conflict',beat_ref:'3/evening',meaning:'Å avstå fra et intuitivt nytt toppkriterium kan kjennes som mindre faglig handlingsrom selv når vurderingssporet blir mer rettferdig og etterprøvbart.'},
    {id:'after_integrity_escalation',beat_ref:'4/evening',meaning:'Å sende en mulig fuskesak videre uten å eie skyldspørsmålet kan føles som tap av kontroll, men beskytter både studenten og underviserens rollegrense.'},
    {id:'after_accommodation_boundary',beat_ref:'5/evening',meaning:'En rask uformell løsning kan føles omsorgsfull, mens dataminimal henvisning kan kjennes kjøligere selv når den beskytter personvern og rett prosess.'},
    {id:'after_appeal_explanation',beat_ref:'8/evening',meaning:'Å forklare egen vurdering uten å love klageutfall krever at underviseren tåler at en uavhengig prosess senere kan lande annerledes.'},
    {id:'after_course_revision',beat_ref:'9/evening',meaning:'Å erkjenne alignment-gjeld etter eksamen kan koste kortsiktig prestisje, men skiller profesjonell forbedring fra behovet for å fremstå ufeilbarlig.'}
  ],
  delayed_consequences:[
    {id:'alignment_returns',setup_ref:'1/morning',return_ref:'9/afternoon',meaning:'Det tidlige læringsdesignvalget kommer tilbake i eksamensmønsteret og viser om studentene faktisk fikk trene den vurderte ferdigheten.'},
    {id:'disagreement_returns',setup_ref:'2/morning',return_ref:'10/lunch',meaning:'Måten studentuenighet ble møtt på påvirker senere standing i seminarteamet og blant studentene uten at standpunkt blir karakterkriterium.'},
    {id:'published_criteria_return',setup_ref:'3/afternoon',return_ref:'8/afternoon',meaning:'Avgrensningen til publiserte kriterier returnerer i begrunnelses- og klagesituasjonen og tester om vurderingssporet faktisk holder.'},
    {id:'integrity_escalation_returns',setup_ref:'4/afternoon',return_ref:'12/afternoon',meaning:'Den tidlige dokumentasjonen av mulig kildeproblem kommer tilbake når formell prosess trenger å skille observasjon, usikkerhet og beslutning.'},
    {id:'accommodation_boundary_returns',setup_ref:'5/afternoon',return_ref:'12/lunch',meaning:'Dataminimering og korrekt henvisning viser senere om tilretteleggingsprosessen kan arbeide uten unødvendig sensitiv informasjon eller uklare mandater.'},
    {id:'criterion_operationalization_returns',setup_ref:'6/afternoon',return_ref:'11/afternoon',meaning:'Måten analytisk presisjon ble operasjonalisert på viser senere om sensorbegrunnelser kan rekonstrueres med samme publiserte standard.'}
  ],
  cross_role_link:{status:'not_required_for_rollout',materialized:false,new_runtime:false,rule:'Cross-role er ikke nødvendig for denne rollouten. Eksisterende undervisnings-, sensor-, administrasjons- og prosessaktører gir nok canonical continuity, og nye shared runtime-objekter opprettes ikke.'},
  materialization:{
    authored_dimensions:['situated_reputation'],
    no_new_runtime:true,
    existing_plan_preserved:true,
    existing_role_model_preserved:true,
    existing_work_grammar_preserved:true,
    existing_persistent_work_preserved:true,
    existing_rhythm_preserved:true,
    cross_role_link_materialized:false,
    source_refs:refCycle
  }
};

write(WORLD_PATH, world);

const index = read('data/Civication/roleWorlds/index.json');
if (!(index.roles || []).some(row => row.path === WORLD_PATH)) {
  index.roles.push({category:'filosofi',role_scope:ROLE,status:'role_world_complete',path:WORLD_PATH});
}
index.status = 'thirty_two_role_worlds_materialized';
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

const report = `# Civication Filosofi undervisning og akademia Role World rollout\n\n- status: role_world_complete\n- authored dimension: situated_reputation only\n- coverage: 14 days / 56 beats\n- canonical source refs: 9\n- existing persistent work and rhythm preserved, not re-authored\n- existing work loops preserved: undervisningsdesign_og_gjennomforing + vurdering_og_kvalitetssikring\n- canonical alignment, assessment, integrity, accommodation and disagreement threads reused\n- canonical 9-step mail plan preserved\n- role model and work grammar preserved\n- Arne Næss remains a source-bounded History Go factual target only\n- Foreleser/Professor badge tiers remain separate from academic qualification and appointment\n- cross-role: not_required_for_rollout / not materialized\n- new runtime: false\n- global reputation score: forbidden\n\nAuthority remains fail-closed: standing cannot make personal agreement a grading criterion, add hidden criteria after submission, adjudicate misconduct or sanctions alone, override complaint/impartiality/accommodation/privacy processes, justify unnecessary sensitive student data, create academic qualification from badge progress or turn Arne Næss into a present-day pedagogical authority.\n`;
fs.writeFileSync(path.join(ROOT, 'reports/CIVICATION_FILOSOFI_UNDERVISNING_AKADEMIA_ROLE_WORLD_ROLLOUT.md'), report);

console.log(`Materialized ${WORLD_PATH}: ${coverage.length} beats / ${refCycle.length} canonical source refs`);
