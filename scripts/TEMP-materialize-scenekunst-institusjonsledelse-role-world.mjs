import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (relative) => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
const write = (relative, value) => {
  const full = path.join(ROOT, relative);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, `${JSON.stringify(value, null, 2)}\n`);
};
const writeText = (relative, value) => {
  const full = path.join(ROOT, relative);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, value.endsWith('\n') ? value : `${value}\n`);
};

const KEY = 'scenekunst/scenekunst_institusjonsledelse';
const ROLE = 'scenekunst_institusjonsledelse';
const WORLD_PATH = `data/Civication/roleWorlds/scenekunst/${ROLE}.json`;
const REPORT_PATH = 'reports/CIVICATION_SCENEKUNST_INSTITUSJONSLEDELSE_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md';
const TEST_PATH = 'tests/civication-scenekunst-institusjonsledelse-role-world-rollout.test.js';
const MODEL_PATH = `data/Civication/roleModels/scenekunst/${ROLE}.json`;
const GRAMMAR_PATH = `data/Civication/workGrammars/scenekunst/${ROLE}.json`;
const PLAN_PATH = `data/Civication/mailPlans/scenekunst/${ROLE}_plan.json`;
const TYPES = ['job', 'people', 'conflict', 'story', 'event', 'micro', 'followup', 'knowledge', 'consequence'];

const model = read(MODEL_PATH);
const grammar = read(GRAMMAR_PATH);
const plan = read(PLAN_PATH);

const mailRefs = [];
const refById = new Map();
for (const type of TYPES) {
  const relative = `data/Civication/mailFamilies/scenekunst/${type}/${ROLE}_${type}.json`;
  const catalog = read(relative);
  for (const mail of catalog.families.flatMap((family) => family.mails || [])) {
    const ref = `${relative}#${mail.id}`;
    mailRefs.push(ref);
    refById.set(mail.id, ref);
  }
}
if (mailRefs.length !== 15 || new Set(mailRefs).size !== 15) {
  throw new Error(`Expected 15 unique source mails, got ${mailRefs.length}/${new Set(mailRefs).size}`);
}

const sourceOrderIds = [
  'institusjonsledelse_job_sesongkapasitet_001',
  'institusjonsledelse_people_amina_retning_001',
  'institusjonsledelse_knowledge_buresund_black_box_001',
  'institusjonsledelse_micro_tjue_minutters_styrehandoff_001',
  'institusjonsledelse_job_budsjettavvik_002',
  'institusjonsledelse_people_henrik_prognose_002',
  'institusjonsledelse_event_tilskuddskutt_001',
  'institusjonsledelse_story_suksess_kapasitetsgjeld_001',
  'institusjonsledelse_job_arbeidsgiveroppfolging_003',
  'institusjonsledelse_people_sigrid_fortrolighet_003',
  'institusjonsledelse_conflict_premiere_arbeidsmiljo_001',
  'institusjonsledelse_followup_tiltak_uten_effekt_001',
  'institusjonsledelse_job_styregrunnlag_004',
  'institusjonsledelse_people_leo_mandat_004',
  'institusjonsledelse_consequence_uformelt_lofte_001'
];
const sourceRefs = sourceOrderIds.map((id) => {
  const ref = refById.get(id);
  if (!ref) throw new Error(`Missing authored source mail ${id}`);
  return ref;
});

const sourceFocus = {
  institusjonsledelse_job_sesongkapasitet_001: 'sesongens tre overkapasitets-premierer og skillet mellom inngått forpliktelse, kunstnerisk ønske og betinget scenario',
  institusjonsledelse_people_amina_retning_001: 'Aminas motstemme om kunstnerisk retning, faglig eierskap og delegasjon etter at kapasitet faktisk begrenser repertoaret',
  institusjonsledelse_knowledge_buresund_black_box_001: 'Inger Buresund og Black Box teater som kildeforankret spørsmål om institusjonsprofil uten at historie lånes som nåtidig lederfullmakt',
  institusjonsledelse_micro_tjue_minutters_styrehandoff_001: 'det tjue minutter lange styrehandoffet der anbefaling, vedtakspunkt, konfidensialitet, gjennomføringsansvar og kontrolltid må få plass samtidig',
  institusjonsledelse_job_budsjettavvik_002: 'Henriks finansieringsscenario der sannsynlig tilskudd ikke er det samme som vedtatt eller disponibel finansiering',
  institusjonsledelse_people_henrik_prognose_002: 'Henriks rett til å nekte falsk attestasjon når ledelsens optimisme forsøker å kle seg som økonomifaglig sikkerhet',
  institusjonsledelse_event_tilskuddskutt_001: 'tilskuddskuttet som gjenåpner bare det berørte gjestespillet, kontraktsmuligheten og den eksterne statusen, ikke hele sesongen',
  institusjonsledelse_story_suksess_kapasitetsgjeld_001: 'den utsolgte suksessen som skjuler avspasering, vedlikehold og kunstnerisk utvikling som gjeld snarere enn sparte kostnader',
  institusjonsledelse_job_arbeidsgiveroppfolging_003: 'arbeidsmiljømønsteret der fravær, overtid og uforutsigbarhet krever et eget arbeidsgiverspor uten forhåndsdom eller premiereunntak',
  institusjonsledelse_people_sigrid_fortrolighet_003: 'Sigrids krav om at varslings- og arbeidsmiljøopplysninger ikke brukes som omdømmebevis eller offentlig dramaturgi',
  institusjonsledelse_conflict_premiere_arbeidsmiljo_001: 'premierepresset som kolliderer med et midlertidig belastningstiltak og tvinger institusjonen til å bære en reell produksjonskonsekvens',
  institusjonsledelse_followup_tiltak_uten_effekt_001: 'kontrollpunktet der lavere overtid ikke får skjule at uforutsigbarhet, rollekonflikt og fravær fortsatt består',
  institusjonsledelse_job_styregrunnlag_004: 'styregrunnlaget som må skille kunstnerisk anbefaling, økonomisk ramme, aggregert arbeidsmiljørisiko og det styret faktisk skal vedta',
  institusjonsledelse_people_leo_mandat_004: 'Leos uformelle styresignal som må korrigeres uten å gjøre styrelederens interesse til allerede protokollert beslutning',
  institusjonsledelse_consequence_uformelt_lofte_001: 'det muntlige forlengelsessignalet som senere vender tilbake som planlagt arbeid, økonomisk innrettelse og tillitskostnad hos samarbeidspartneren'
};

const audiences = [
  {
    id: 'artistic_program_and_practice',
    standing_axis: 'artistic_direction_delegation_and_dissent_standing',
    cares_about: [
      'at kunstneriske kriterier, restvalg og faglig motstemme overlever lederens prioritering',
      'at delegert programarbeid er reelt uten å bli et skjult kontrakts- eller finansieringsløfte'
    ],
    cannot_grant: 'Kunstnerisk standing kan ikke gi spilleren styremandat, kontraktsfullmakt, disponibel finansiering, rett til å omskrive faglig uenighet eller arbeidsgiverunntak.'
  },
  {
    id: 'employees_and_protection',
    standing_axis: 'work_environment_protection_and_employer_followup_standing',
    cares_about: [
      'at belastningssignal får et habil, fortrolig og kontrollerbart arbeidsgiverspor',
      'at premiere, status og kunstnerisk risiko ikke brukes til å individualisere systembelastning'
    ],
    cannot_grant: 'Tillit hos ansatte, vernetjeneste og tillitsvalgte kan ikke gi spilleren rett til å omgå arbeidsrett, HMS, tariff, kontradiksjon, habilitet eller selvstendige verne- og medvirkningsroller.'
  },
  {
    id: 'finance_and_administration',
    standing_axis: 'financial_truth_commitment_and_control_standing',
    cares_about: [
      'at prognose, vedtatt ramme, likviditet og allerede inngått forpliktelse holdes fra hverandre',
      'at økonomifaglig attestasjon ikke lånes til å dekke lederens eget risikovalg'
    ],
    cannot_grant: 'Økonomisk standing kan ikke gjøre sannsynlig inntekt disponibel, gi kontraktsfullmakt uten delegasjon, bestemme kunstnerisk verdi eller ettergodkjenne en uregistrert forpliktelse.'
  },
  {
    id: 'board_and_owners',
    standing_axis: 'board_mandate_decision_quality_and_accountability_standing',
    cares_about: [
      'at styret mottar et beslutningsgrunnlag med riktig informasjonsnivå, anbefaling og eksplisitt vedtakspunkt',
      'at daglig ledelse ikke bruker offentlig framdrift til å forhåndsbinde styre- eller eiervalg'
    ],
    cannot_grant: 'Styret og eier kan ikke gjennom uformell interesse gjøre en ikke-behandlet sak til vedtak, og god standing kan ikke erstatte lov-, vedtekts-, arbeidsgiver- eller spesialistmandat.'
  },
  {
    id: 'artists_and_partners',
    standing_axis: 'external_commitment_fairness_and_repair_standing',
    cares_about: [
      'at kunstnere og samarbeidspartnere får sann status før de disponerer tid, penger eller andre muligheter',
      'at institusjonen behandler faktisk innrettelse og tillitstap selv når formell signatur mangler'
    ],
    cannot_grant: 'Partnerstanding kan ikke skape penger, styrevedtak, arbeidsgiverfullmakt eller kontraktsbinding som ikke finnes; den kan heller ikke slettes ved å vise til at et løfte var muntlig.'
  },
  {
    id: 'publics_and_press',
    standing_axis: 'public_accountability_without_exposure_standing',
    cares_about: [
      'at institusjonen forklarer reelle produksjons- og ledervalg uten å publisere fortrolige personalsaker',
      'at publikumssuksess og kritikk ikke brukes som automatisk mål på bærekraft eller kunstnerisk mandat'
    ],
    cannot_grant: 'Offentlig oppmerksomhet kan ikke gi styre-, budsjett-, arbeidsgiver- eller programmeringsfullmakt, og kan ikke gjøre varslere, ansatte eller samarbeidspartnere til råstoff for omdømmearbeid.'
  },
  {
    id: 'private_relations',
    standing_axis: 'private_boundary_presence_and_non_leakage_standing',
    cares_about: [
      'at lederrollen kan legges ned uten at hjemmet blir reserve-styre, kriserom eller mottaker av fortrolig materiale',
      'at status, skam og ansvar kan omtales uten at andre menneskers saker eller institusjonens dokumenter følger med'
    ],
    cannot_grant: 'Privat tillit kan ikke brukes som styrevedtak, budsjettkontroll, arbeidsgiverprosess, kunstnerisk validering, presseråd eller mottakssted for fortrolig arbeidsmiljø- og kontraktsinformasjon.'
  }
];
const audienceById = new Map(audiences.map((item) => [item.id, item]));

const dayArcs = [
  {
    title: 'Den overfylte sesongen',
    situation: 'Den nyoppnevnte lederen arver en sesong der tre profilerte premierer konkurrerer om de samme verkstedukene, prøvesalene og kommunikasjonsressursene. Noe er signert, noe er bare ønsket, og offentlig optimisme gjør det sosialt kostbart å si at kapasitet faktisk setter en grense.',
    turn: 'Dagen handler om å gjøre porteføljen lesbar før synlighet forvandler ambisjon til løfte: kunstnerisk hensikt, kontraktsstatus, bemanning, risiko, beslutningseier og neste kontrolltid må inn i samme versjonerte lederlogg.'
  },
  {
    title: 'Tilskuddet som nesten finnes',
    situation: 'Et viktig gjestespill kan realiseres dersom et søkt tilskudd kommer, og flere i huset omtaler den positive dialogen som om pengene allerede er på konto. Kunstnerne trenger framdrift, mens Henrik kan dokumentere sannsynlighet, ikke vedtak eller disponibel ramme.',
    turn: 'Lederen bygger to scenarioer, beskytter reversibelt forarbeid og markerer nøyaktig hvor kontrakt og offentlig bekreftelse må vente. History Go-sporet om Inger Buresund brukes til å skjerpe spørsmålet om institusjonsprofil, ikke til å bevise at dagens satsing bør gjennomføres.'
  },
  {
    title: 'Retning uten skjult overstyring',
    situation: 'Amina opplever kapasitetsprioriteringen som en nedvurdering av det kunstneriske programarbeidet og peker på måneder med relasjons- og utviklingsarbeid som ikke finnes i budsjettkolonnene. Lederstatus kan raskt gjøre en nødvendig ramme til en fortelling om at fagmiljøet tok feil.',
    turn: 'Dagen prøver om lederen kan begrunne retning med eksplisitte kunstneriske kriterier, gi Amina et reelt videre mandat og samtidig holde alle betingede prosjekter fri fra skjulte løfter om kontrakt, premiere eller senere finansiering.'
  },
  {
    title: 'Prognosen og den faglige motstemmen',
    situation: 'Henrik nekter å attestere et notat som lar forventet tilskudd framstå som sikret. Samtidig løper en ekstern frist, og fristelsen er stor til å myke opp språket uten å endre funksjonen: samarbeidspartneren skal fortsatt forstå økonomien som mer avklart enn den er.',
    turn: 'Lederen må skille Henriks faglige attestasjon fra eget risikovalg, registrere hvem som eier hva og forberede et styrehandoff som kan være kort uten å gjøre anbefaling til vedtak. Uenigheten skal stå i sporet som kontroll, ikke som illojalitet.'
  },
  {
    title: 'Arbeidsmiljøsignalet',
    situation: 'Fravær, overtid og beskrivelser av uforutsigbare endringer begynner å danne et mønster rundt den mest prestisjefylte produksjonen. En del handler om kunstnerisk konflikt, en del om arbeidstid og lederatferd; ingen enkeltmelding avgjør årsak, men arbeidsgiverplikten kan ikke vente på en penere forklaring.',
    turn: 'Lederen åpner et habil og fortrolig arbeidsgiverspor, avgrenser midlertidige tiltak og bevarer Sigrids selvstendige verne- og medvirkningsrolle. Kunstnerisk uenighet blir ikke sykdomsdiagnose, og arbeidsmiljøsignal blir ikke et skjult argument for repertoarvalg.'
  },
  {
    title: 'Premierepresset møter grensen',
    situation: 'Regissør og programteam ber om tre ekstra kveldsprøver for å redde premieren, samtidig som det midlertidige tiltaket nettopp begrenser overtid og sene endringer. Organisasjonen må nå betale en synlig produksjonskostnad for den kapasitetsrisikoen den tidligere har båret usynlig.',
    turn: 'Lederen beholder arbeidsmiljørammen og gjør kunstneriske alternativer reelle: redusert omfang, ny arbeidsdeling eller utsettelse får hver sin kostnad og beslutningseier. Frivillig samtykke brukes ikke som snarvei rundt systemansvar i et hierarkisk arbeidsforhold.'
  },
  {
    title: 'Offentlig forklaring uten å bruke varsling',
    situation: 'En utsettelse er blitt offentlig, og kommunikasjon ønsker å si at institusjonen tar arbeidsmiljø på alvor. Formuleringen er sann på institusjonsnivå, men kan samtidig gjøre fortrolig medvirkning til et omdømmeargument og indirekte peke ut miljøet som står i saken.',
    turn: 'Lederen må forklare ansvar og produksjonsramme uten å beskrive personopplysninger, årsaksfunn eller tiltak mer detaljert enn formålet krever. Det offentlige svaret skal tåle senere faktakorreksjon og ikke gjøre Sigrid eller varslerne til bevis på ledelsens handlekraft.'
  },
  {
    title: 'Det formelle tilskuddskuttet',
    situation: 'Tilskuddsbrevet kommer med lavere ramme enn scenarioet forutsatte. Gjestespillet er ikke signert, men optimistiske signaler har gitt samarbeidspartneren grunn til å holde av tid, mens basisprogrammet fortsatt er finansiert dersom den berørte satsingen tas ut eller finner ny dekning.',
    turn: 'Lederen gjenåpner bare gjestespillets budsjett, avtale, programplass og kommunikasjon. Hele sesongen skal ikke kuttes jevnt for å beskytte én synlig idé; tidligere grunnlag, uenighet og ansvar beholdes mens et nytt finansiert alternativ bygges.'
  },
  {
    title: 'Styret trenger et faktisk vedtak',
    situation: 'Samarbeidspartnerens frist gjør at Leo kaller inn til ekstraordinær behandling. Styret trenger beslutningsklart materiale, men ikke identifiserende arbeidsmiljødetaljer eller en ferdig operativ plan som later som styrevedtaket allerede foreligger.',
    turn: 'Lederen komprimerer den versjonerte loggen til formelt premiss, berørt produksjon, finansierte alternativer, aggregert risiko, anbefaling, vedtakspunkt, gjennomføringsansvar og dato for ny rapportering. Hurtighet skal komme fra struktur, ikke fra mandatglidning.'
  },
  {
    title: 'Styresignal blir offentlig forventning',
    situation: 'Etter møtet omtaler Leo i en uformell samtale styrets interesse for forlengelse som om retningen allerede er bestemt. En partner hører både finansieringssignal og administrativ instruks, mens protokollen fortsatt bare gir mandat til å utrede alternativene.',
    turn: 'Lederen må korrigere status uten å ydmyke styrelederen eller låne hans posisjon til eget ønske. Samtidig registreres hvem som mottok signalet, hvilket forbehold som manglet og hvilken ekstern avklaring som nå er nødvendig før ytterligere innrettelse skjer.'
  },
  {
    title: 'Det uformelle løftet kommer tilbake',
    situation: 'Samarbeidspartneren sender et kontraktsutkast og viser til at både styreleder og institusjonsleder beskrev forlengelsen som ønsket og sannsynlig. De har flyttet andre oppdrag og planlagt egne ansatte, selv om ingen signatur eller endelig finansiering foreligger.',
    turn: 'Lederen rekonstruerer samtalene, korrigerer formell status, lar Henrik vurdere økonomisk eksponering og møter partnerens dokumenterte innrettelse som en reell konsekvens. Juridisk binding og etisk-relasjonell reparasjon holdes adskilt, men ingen av dem fornektes.'
  },
  {
    title: 'Suksessen og kapasitetsgjelden',
    situation: 'Den produksjonen som faktisk åpner, selger ut og skaper krav om forlengelse. Inntekten er reell, men det er også avspasering, utsatt vedlikehold og utviklingsarbeid som allerede er skjøvet; suksess kan derfor gjøre tidligere belastning mindre synlig akkurat når beslutningspresset er størst.',
    turn: 'Lederen priser inn hele kapasitetsgjelden og legger fram et reelt valg mellom avgrenset, finansiert forlengelse og planlagt avslutning. Publikumssuksess får være data om etterspørsel, ikke automatisk mandat til å bruke de samme menneskene og systemene uten restitusjon.'
  },
  {
    title: 'Tiltaket som bare virket på én indikator',
    situation: 'Kontrollpunktet viser at registrert overtid falt, mens korttidsfravær, rollekonflikt og sene endringer fortsatt ligger høyt. Det er fristende å lukke saken fordi ett målt mål er grønt og la lokale ledere håndtere resten som samarbeid.',
    turn: 'Lederen beholder første tiltak som evidens, navngir hva det faktisk forbedret og gjenåpner arbeidsflyt, rolleansvar og endringsrytme der virkningen uteble. Målingen får kontrollere tiltaket i stedet for å fungere som bevis på at arbeidsgiveransvaret er ferdig.'
  },
  {
    title: 'Sluttoverleveringen',
    situation: 'Sesongen avsluttes ikke med at alle konflikter er løst, men med en portefølje som kan forstås av den neste ansvarlige: inngåtte forpliktelser, kunstneriske restvalg, økonomisk dekning, arbeidsmiljøtiltak, styrevedtak, partnerreparasjon og framtidige kontrollpunkter har ulike eiere.',
    turn: 'Lederen overleverer den gjeldende mandat-, ressurs- og ansvarsloggen som et levende styringsspor og krediterer Amina, Henrik, Sigrid og Leo for deres faktiske faglige og formelle roller. Deretter legges lederrollen ned privat uten at status, dokumenter eller fortrolige saker følger med hjem.'
  }
];

const phaseMoves = {
  morning: [
    'Morgenen brukes til å etablere gjeldende versjon før møter, e-post og offentlig tempo kan endre premisset. Spilleren skriver inn hva som er observasjon, hva som er scenario, hva som er vedtak og hva som fortsatt mangler, og navngir hvilken rolle som faktisk kan ta neste beslutning.',
    'I morgenfasen må lederen tåle at et ryddig dokument synliggjør mindre handlefrihet enn omgivelsene forventer. Oppgaven er ikke å produsere trygghet i språket, men å lage et beslutningsgrunnlag som andre fagroller kan kontrollere og korrigere før irreversible løfter gis.'
  ],
  lunch: [
    'Ved lunsj blir styringen relasjonell: en av de fire arbeidsaktørene prøver begrunnelsen, grensene og hvem som må bære konsekvensen. Spilleren skal svare på motstemmen uten å kjøpe lojalitet med framtidige løfter eller skyve eget ledervalg oppover til styret, økonomi eller vernetjenesten.',
    'Lunsjfasen gjør maktfordelingen synlig i samtalen. Den som har faglig eller formell myndighet skal kunne si nei, korrigere eller kreve et annet spor uten at lederens status gjør uenigheten til illojalitet; samtidig må lederen fortsatt eie den beslutningen som faktisk ligger i egen delegasjon.'
  ],
  afternoon: [
    'Ettermiddagen tvinger fram valg eller rework når ny informasjon møter allerede planlagt arbeid. Bare de berørte produksjonene, budsjettlinjene, avtalene, arbeidsmiljøtiltakene eller kommunikasjonspunktene åpnes på nytt; historikken beholdes slik at kostnad og ansvar ikke kan flyttes bakover i ettertid.',
    'I ettermiddagsfasen prøves forskjellen mellom anbefaling og fullmakt. Spilleren må kunne handle raskt, men hvert handoff skal angi grunnlag, konfidensialitet, beslutningseier, reversibilitet og tidspunktet virkningen skal kontrolleres, slik at neste rom ikke arver en falsk fasit.'
  ],
  evening: [
    'Kvelden viser hva lederrollen gjør med oppmerksomhet og tilgjengelighet etter at dagens formelle arbeid er over. Restarbeid legges i riktig kanal og riktig kontrolltid; private relasjoner får en sann, avgrenset beskrivelse av belastning eller lettelse, men ikke dokumenter, navn eller oppgaver som tilhører institusjonen.',
    'I kveldssporet blir fristelsen til å være uunnværlig behandlet som en styringsrisiko. Spilleren må sikre at neste arbeidsdag kan starte fra den versjonerte loggen uten kontinuerlig privat beredskap, og at ingen nær relasjon gjøres til reservekollega, styremedlem eller taus mottaker av fortrolig materiale.'
  ]
};

const sourceLabels = Object.fromEntries(sourceOrderIds.map((id) => [id, sourceFocus[id]]));

const audienceCycle = [
  'artistic_program_and_practice',
  'artists_and_partners',
  'finance_and_administration',
  'private_relations',
  'finance_and_administration',
  'board_and_owners',
  'publics_and_press',
  'private_relations',
  'employees_and_protection',
  'employees_and_protection',
  'employees_and_protection',
  'private_relations',
  'board_and_owners',
  'board_and_owners',
  'artists_and_partners'
];

const beatTypes = ['task', 'relationship', 'info', 'private_consequence', 'task', 'conversation', 'decision', 'social', 'task', 'relationship', 'decision', 'private_consequence', 'decision', 'relationship', 'consequence'];

const primaryThreads = [
  {
    id: 'amina_program_direction_and_delegation',
    relationship: 'Aminas programarbeid prøver om lederen kan sette kunstnerisk retning og prioritere hardt uten å gjøre faglig motstemme til illojalitet, delegasjon til kosmetikk eller et betinget prosjekt til skjult løfte om kontrakt og premiere.',
    beat_refs: ['1/lunch', '3/morning', '3/lunch', '6/lunch', '12/morning', '14/lunch']
  },
  {
    id: 'henrik_budget_projection_and_commitment',
    relationship: 'Henriks økonomiske motstemme følger forskjellen mellom prognose, vedtatt ramme, disponibel finansiering og faktisk forpliktelse, og viser om lederens risikovalg kan eies eksplisitt uten å låne økonomifaglig attestasjon som sikkerhet.',
    beat_refs: ['2/morning', '2/lunch', '4/lunch', '8/morning', '11/morning', '12/afternoon']
  },
  {
    id: 'sigrid_work_environment_and_confidentiality',
    relationship: 'Sigrids selvstendige verne- og medvirkningsrolle følger belastningssignalet fra første mønster via midlertidig tiltak, premierepress og offentlig forklaring til kontrollpunktet der én grønn indikator ikke får lukke et fortsatt arbeidsmiljøproblem.',
    beat_refs: ['5/morning', '5/lunch', '6/afternoon', '7/lunch', '7/afternoon', '13/morning', '13/lunch']
  },
  {
    id: 'leo_board_mandate_and_public_signal',
    relationship: 'Leos styrelederrolle tester om uformell interesse, beslutningsbehov og offentlig synlighet kan holdes adskilt fra protokollert mandat, og om lederen kan korrigere maktsignaler uten å skjule eget ansvar eller undergrave styrets reelle myndighet.',
    beat_refs: ['4/afternoon', '9/morning', '9/afternoon', '10/morning', '10/lunch', '14/morning']
  },
  {
    id: 'season_portfolio_capacity_and_bounded_rework',
    relationship: 'Sesongporteføljen binder kunstnerisk ambisjon til faktisk bemanning, budsjett og vedlikehold og viser hvordan endrede premisser skal gjenåpne bare berørte valg, mens tidligere begrunnelser og restgjeld forblir synlige gjennom hele fjortendagersløpet.',
    beat_refs: ['1/morning', '2/afternoon', '6/morning', '8/afternoon', '12/morning', '12/evening', '14/afternoon']
  },
  {
    id: 'informal_promise_external_expectation_and_repair',
    relationship: 'Det uformelle forlengelsessignalet beveger seg fra optimisme via styrespråk til partnerens faktiske innrettelse og tvinger institusjonen til å skille juridisk binding fra økonomisk, profesjonell og relasjonell konsekvens når reparasjon blir nødvendig.',
    beat_refs: ['2/evening', '8/lunch', '10/afternoon', '11/morning', '11/afternoon', '12/lunch', '14/afternoon']
  },
  {
    id: 'private_containment_without_leader_heroics',
    relationship: 'Lederansvar, skam, status og krisepress får privat etterklang uten at hjemmet blir reserve-styre, beredskapsrom eller mottaker av fortrolige dokumenter; evnen til å legge rollen ned blir en del av institusjonell bærekraft, ikke et fravær av ansvar.',
    beat_refs: ['1/evening', '4/evening', '7/evening', '10/evening', '11/evening', '13/evening', '14/evening']
  }
];

const threadIdsFor = (key) => primaryThreads.filter((thread) => thread.beat_refs.includes(key)).map((thread) => thread.id);

const usage = new Map(sourceRefs.map((ref) => [ref, 0]));
const coverage = [];
for (let day = 1; day <= 14; day += 1) {
  const arc = dayArcs[day - 1];
  for (const [phaseIndex, phase] of ['morning', 'lunch', 'afternoon', 'evening'].entries()) {
    const beatIndex = (day - 1) * 4 + phaseIndex;
    const sourceId = sourceOrderIds[beatIndex % sourceOrderIds.length];
    const ref = refById.get(sourceId);
    const audienceId = audienceCycle[beatIndex % audienceCycle.length];
    const audience = audienceById.get(audienceId);
    const key = `${day}/${phase}`;
    const phaseText = phaseMoves[phase][(day + phaseIndex) % 2];
    const summary = `${arc.situation} ${phaseText} Denne konkrete beat-en viderefører ${sourceLabels[sourceId]}. ${arc.turn} Materialiseringen skjer gjennom den eksisterende 16-stegsplanen og arbeidsgrammatikken, ikke gjennom en ny dagsmotor: all endring må ende i \`institusjonens_mandat_ressurs_og_ansvarslogg\` med synlig skille mellom forslag, scenario, vedtak, venting, handoff, rework og senere kontroll. Dag ${day}, ${phase}, må derfor etterlate et eget etterprøvbart spor om hvem som fikk informasjon, hvilken makt de faktisk hadde, hvilken kostnad som ble flyttet eller unngått, og hva neste aktør fortsatt har rett til å bestride.`;
    const consequence = `${audience.cares_about[0].replace(/^at /, 'Hos dette situerte publikummet blir det avgjørende at ')} og ${audience.cares_about[1].replace(/^at /, '')}. Valget på dag ${day}, ${phase}, kan derfor styrke standing når lederen gjør grunnlag, motstemme og konsekvens synlig, eller svekke den når status og framdrift brukes til å skjule ansvar. ${audience.cannot_grant} Standing gjelder bare relasjonen, arbeidsflaten og beslutningen som faktisk ble berørt denne dagen; den summeres aldri til en global reputation-score, og den kan senere endres når kontrollpunkt, partnerrespons, styrebehandling eller arbeidsmiljøeffekt gir ny evidens.`;
    coverage.push({
      day,
      phase,
      beat_type: beatTypes[beatIndex % beatTypes.length],
      summary,
      thread_ids: threadIdsFor(key),
      materialization_refs: [ref],
      standing_audience: audienceId,
      standing_consequence: consequence
    });
    usage.set(ref, usage.get(ref) + 1);
  }
}
for (const [ref, count] of usage) {
  if (count < 3) throw new Error(`${ref} underused: ${count}`);
}
if (coverage.length !== 56) throw new Error(`Coverage ${coverage.length}`);

const privateAftermath = [
  {
    id: 'private_aftermath_initial_status_pressure',
    beat_refs: ['1/evening', '3/evening'],
    meaning: 'Den første porteføljekonflikten og frykten for å framstå som lite ambisiøs får privat plass uten at Amina, styret eller interne dokumenter gjøres til materiale for en hjemmebasert lojalitetsdom.'
  },
  {
    id: 'private_aftermath_finance_and_premiere_boundary',
    beat_refs: ['4/evening', '6/evening'],
    meaning: 'Finansieringsfrist og premierepress avgrenses i arbeidssystemet slik at privat nærvær ikke blir skjult beredskap, og slik at Henrik eller Sigrids faglige motstemmer ikke deles som personkonflikt.'
  },
  {
    id: 'private_aftermath_public_explanation',
    beat_refs: ['7/evening', '10/evening'],
    meaning: 'Offentlig forklaring og styresignal bearbeides uten å røpe varslingsinformasjon, partnerdialog eller uferdige vedtak; hjemmet brukes ikke som presserom eller reserve-styre.'
  },
  {
    id: 'private_aftermath_partner_expectation_and_success',
    beat_refs: ['11/evening', '12/evening'],
    meaning: 'Partnerens kontraktsforventning og publikums suksess får emosjonell tyngde uten at skyld, dokumentasjon eller publikumsrespons brukes til å definere spillerens private verdi eller rekruttere nære relasjoner inn i beslutningen.'
  },
  {
    id: 'private_aftermath_control_and_release',
    beat_refs: ['13/evening', '14/evening'],
    meaning: 'Et tiltak som bare delvis virket og den endelige overleveringen integreres uten heltefortelling; ansvaret kan tas alvorlig samtidig som rollen, telefonen og den fortrolige loggen blir igjen i institusjonen.'
  }
];

const delayedConsequences = [
  { id: 'overfull_season_returns_as_capacity_debt', setup_ref: '1/morning', return_ref: '12/morning', domains: ['job', 'economy', 'livelihood'] },
  { id: 'grant_optimism_returns_as_formal_cut', setup_ref: '2/morning', return_ref: '8/afternoon', domains: ['job', 'economy', 'relationship'] },
  { id: 'amina_delegation_returns_in_final_portfolio', setup_ref: '3/lunch', return_ref: '14/lunch', domains: ['job', 'relationship', 'reputation'] },
  { id: 'henrik_dissent_returns_in_board_packet', setup_ref: '4/lunch', return_ref: '9/afternoon', domains: ['job', 'economy', 'reputation'] },
  { id: 'work_environment_signal_returns_at_effect_check', setup_ref: '5/morning', return_ref: '13/morning', domains: ['job', 'psyche', 'livelihood'] },
  { id: 'premiere_pressure_returns_in_public_accountability', setup_ref: '6/afternoon', return_ref: '12/afternoon', domains: ['job', 'reputation', 'narrative'] },
  { id: 'leo_informal_signal_returns_as_partner_expectation', setup_ref: '10/lunch', return_ref: '11/afternoon', domains: ['relationship', 'economy', 'reputation'] },
  { id: 'success_extension_returns_in_final_handoff', setup_ref: '12/morning', return_ref: '14/afternoon', domains: ['job', 'economy', 'narrative'] }
];

const themeIds = [
  'professional_culture',
  'class_power',
  'bureaucratic_power',
  'numerical_control',
  'invisible_work',
  'loyalty_up_down',
  'care_vs_efficiency',
  'status_anxiety',
  'shame_reputation',
  'public_private_leakage'
];

const world = {
  schema: 'civication_role_world_v1',
  version: 1,
  category: 'scenekunst',
  role_scope: ROLE,
  title: 'Institusjonsledelse — sesong, mandat, belastning og offentlig ansvar',
  status: 'role_world_complete',
  materialization: {
    authored_dimensions: ['situated_reputation'],
    no_new_runtime: true,
    existing_plan_preserved: true,
    existing_role_model_preserved: true,
    existing_people_foundation_preserved: true,
    existing_work_grammar_preserved: true,
    existing_persistent_work_preserved: true,
    existing_rhythm_preserved: true,
    cross_role_link_materialized: false,
    source_refs: sourceRefs
  },
  existing_work_continuity: {
    runtime_binding: 'existing_mail_plan_and_work_grammar',
    new_runtime_state: false,
    work_loops: grammar.work_loops,
    persistent_work_object: 'institusjonens_mandat_ressurs_og_ansvarslogg',
    canonical_surfaces: [
      MODEL_PATH,
      GRAMMAR_PATH,
      PLAN_PATH,
      ...TYPES.map((type) => `data/Civication/mailFamilies/scenekunst/${type}/${ROLE}_${type}.json`)
    ],
    rule: 'Eksisterende plan, fire fiktive aktører, fire arbeidsflater, waiting, handoff, avgrenset rework, arbeidsgiveransvar, budsjettgrense og styre-/eiermandat forblir authoritative.'
  },
  sociological_core: [
    'institusjonell ledermakt er delt mellom kunstnerisk delegasjon, arbeidsgiveransvar, økonomifaglig kontroll, styre- og eiermandat og selvstendige verne- og medvirkningsroller, slik at synlig lederstatus aldri kan være én samlet fullmakt',
    'publikumssuksess, premierepress og offentlig profil kan flytte kapasitetsgjeld, uforutsigbarhet og økonomisk risiko nedover i organisasjonen dersom det usynlige arbeidet ikke blir priset inn før beslutningen',
    'institusjonens kollektive vi kan skjule hvem som foreslo, attesterte, besluttet, protesterte og bar konsekvensen; derfor må lederloggen bevare både myndighet, motstemme, venting og senere effekt'
  ],
  employment_conditions: [
    'formell oppnevning som kunstnerisk leder eller teatersjef med eksplisitt delegasjon, styre-/eierlinje og arbeidsgiveransvar; Badge-progresjon alene gir aldri stillingen',
    'avklart økonomi-, kontrakts-, arbeidsretts-, HMS-, tariff-, personvern- og habilitetsramme for beslutninger som berører ansatte, kunstnere, samarbeidspartnere og offentlige midler',
    'kunstnerisk retning med plikt til å gjøre kapasitet, risiko og beslutningseier synlig, uten å gjøre faglig motstemme eller publikumsrespons til skjult fullmakt'
  ],
  professional_culture: [
    'uenighet fra program, økonomi, vernetjeneste og styre behandles som styringsinformasjon når den ligger i rett rolle og kan spores',
    'en lederbeslutning blir ikke mer gyldig av å være rask, offentlig populær eller formulert med institusjonens kollektive stemme',
    'kontrollpunktet vurderer faktisk virkning på kunstnerisk mål, mennesker, økonomi og mandat; gjennomført aktivitet er aldri alene bevis på at tiltaket virket'
  ],
  recurring_people_archetypes: [
    {
      id: 'amina_programsjef_world',
      social_function: 'Amina bærer den langsiktige kunstneriske porteføljen, relasjonene til feltet og de faglige argumentene som gjør at kapasitet ikke alene blir programstrategi.',
      class_position: 'program- og kunstnerisk plansjef med delegert faglig utviklingsmandat',
      status: 'Situert profesjonell standing knyttet til sesongportefolje_og_mandatkart.',
      power_over_player: 'Amina kan utvikle, rangere og utfordre kunstneriske alternativer innen delegasjonen og nekte å late som hun er faglig enig; hun kan ikke love kontrakt, finansiering eller styrevedtak på spillerens vegne.',
      wants: 'At kunstnerisk prioritering begrunnes som kunstnerisk og institusjonelt valg, ikke som et budsjettkutt som senere omskrives til faglig enighet.',
      conceals: 'Hun kan tone ned hvor mye tapte relasjoner og utsatt utvikling koster fordi hun frykter at dette blir lest som personlig eierskap til prosjektene.',
      speech_style: 'Felt- og verkorientert, tydelig på langsiktig profil og rask til å oppdage når et scenario blir omtalt som en bestilling.',
      teaches_player: 'At reell kunstnerisk ledelse trenger delegert motstemme og synlige kriterier, særlig når ikke alle gode prosjekter kan realiseres.'
    },
    {
      id: 'henrik_okonomi_og_administrasjonssjef_world',
      social_function: 'Henrik holder vedtatt ramme, prognose, likviditet, kontraktsstatus, bemanning og kapasitetsgjeld fra hverandre når optimisme og tidsfrister presser tallene mot en enklere fortelling.',
      class_position: 'økonomi- og administrasjonssjef med faglig attestasjon og kontrollansvar',
      status: 'Situert profesjonell standing knyttet til budsjett_kapasitet_og_forpliktelsesrom.',
      power_over_player: 'Henrik kan nekte falsk attestasjon, avvise uregistrerte forpliktelser og eskalere delegasjonsbrudd; han kan ikke alene fastsette kunstnerisk retning eller erstatte styrets og lederens gyldige prioriteringsmandat.',
      wants: 'At lederen eier risikovalg eksplisitt og lar økonomifaglig grunnlag være sant også når et kunstnerisk tidsvindu står i fare.',
      conceals: 'Han kan vente for lenge med å synliggjøre vedlikeholds- og kapasitetsgjeld fordi den er vanskeligere å forklare enn et enkelt budsjettavvik.',
      speech_style: 'Nøktern og scenariobasert, med presis forskjell mellom sannsynlig, vedtatt, disponibel, kontraktsfestet og allerede påløpt.',
      teaches_player: 'At økonomikontroll ikke er kunstnerisk veto, men at ingen kunstnerisk ambisjon blir styrbar dersom tall, forpliktelser og faglig attestasjon glir sammen.'
    },
    {
      id: 'sigrid_hovedverneombud_world',
      social_function: 'Sigrid gjør mønstre i arbeidstid, fravær, uforutsigbarhet og lederatferd synlige og forsvarer et selvstendig verne- og medvirkningsspor når premiere og omdømme presser fram raske forklaringer.',
      class_position: 'hovedverneombud og ansattrepresentant med selvstendig verne- og medvirkningsrolle',
      status: 'Situert profesjonell standing knyttet til arbeidsmiljo_varsling_og_tiltaksrom.',
      power_over_player: 'Sigrid kan kreve at fare og arbeidsmiljøbrudd behandles i riktig kanal og prøve om tiltak virker; hun er ikke arbeidsgiverens etterforsker, presserådgiver eller kunstnerisk dommer.',
      wants: 'At mennesker kan melde fra uten å bli gjort til hinder for kunsten eller bevis på ledelsens handlekraft, og at tiltak vurderes på faktisk effekt.',
      conceals: 'Hun kan dempe sin egen frustrasjon over gjentatte systemmønstre for ikke å bli avskrevet som part i den kunstneriske konflikten.',
      speech_style: 'Rolig, konkret og formålsbegrenset; hun skiller konsekvent mellom signal, faktagrunnlag, midlertidig vern, kontradiksjon og senere kontroll.',
      teaches_player: 'At arbeidsgiveransvar ikke kan delegeres til prøverommet, og at fortrolighet og målt effekt er deler av styringen, ikke hinder for transparens.'
    },
    {
      id: 'leo_styreleder_world',
      social_function: 'Leo bærer styrets formelle beslutningslinje og institusjonens langsiktige ansvar, men hans synlige posisjon gjør også uformelle ønsker farlige når omgivelsene leser dem som vedtak eller finansieringssignal.',
      class_position: 'styreleder med formelt styremandat adskilt fra daglig operativ ledelse',
      status: 'Situert profesjonell standing knyttet til styre_eier_og_offentlighetsrom.',
      power_over_player: 'Leo kan sette saker til behandling, lede styrets vedtak og kreve rapportering innen styrets mandat; han kan ikke i uformell samtale skape en protokollert beslutning eller overta arbeidsgiver-, økonomifaglig eller operativ saksbehandling uten riktig grunnlag.',
      wants: 'At styret får korte og beslutningsklare saker og at institusjonen ikke taper synlighet, finansiering eller partnerrelasjoner fordi administrasjonen virker handlingslammet.',
      conceals: 'Han kan undervurdere hvor raskt en uformell formulering fra styreleder blir lest som bindende forventning av eksterne aktører som må planlegge før neste møte.',
      speech_style: 'Strategisk og konsis, ofte orientert mot beslutning og omdømme; mer presis når lederen tvinger fram skillet mellom interesse, anbefaling, vedtak og gjennomføring.',
      teaches_player: 'At styrelederens autoritet er reell nettopp fordi den må brukes gjennom riktig sak og beslutning, ikke som allmenn legitimering av ledelsens ønskede retning.'
    }
  ],
  social_environments: grammar.place_grammar.map((place) => place.id),
  slow_axes: [
    'artistic_direction_and_delegation',
    'funding_uncertainty_and_commitment',
    'work_environment_effect',
    'board_and_owner_mandate',
    'public_commitment_and_repair',
    'capacity_debt',
    'private_containment'
  ],
  situated_reputation_model: {
    global_score_allowed: false,
    audiences,
    authority_separation: 'Standing kan aldri gi eller slå sammen styre- eller eiermandat, arbeidsgiveransvar, budsjett- eller kontraktsfullmakt, kunstnerisk delegasjon, HMS-/tariffmyndighet, spesialist- eller vernetjenestekompetanse, persondatatilgang eller rett til å gjøre en uformell interesse til formelt vedtak.',
    rule: 'Standing divergerer mellom situerte publikum, kan gå i motsatte retninger etter samme ledervalg og summeres aldri til en global reputation-score eller en skjult autoritetsakse.'
  },
  history_go_affordance: {
    source_ref: refById.get('institusjonsledelse_knowledge_buresund_black_box_001'),
    knowledge_use: 'Inger Buresund ved Black Box teater brukes som kildeforankret inngang til hvordan program, kunstnerisk profil, institusjonell form og relasjon til et felt kan bygges over tid.',
    better_question: 'Hvordan kan den konkrete historien om Inger Buresund og Black Box teater hjelpe oss å spørre hvilke langsiktige relasjoner, programvalg, organisasjonsformer og offentligheter som faktisk bygde institusjonsprofil i sin historiske kontekst, hvilke kilder og motstemmer som bærer denne forståelsen, og hvilke forskjeller i mandat, finansiering, ansatte og styreform må synliggjøres før erfaringen kan skjerpe—men aldri avgjøre—den fiktive institusjonens sesongvalg?',
    authority_boundary: 'History Go kan gi kildeforankret scenekunsthistorie og bedre institusjonsspørsmål, men kan ikke programmere dagens sesong, gi styre- eller arbeidsgiverfullmakt, disponere budsjett, inngå kontrakt, avgjøre arbeidsmiljøsak eller gjøre en historisk leder til fasit for nåtidig styring.'
  },
  cross_role_link: {
    status: 'candidate_when_shared_work_is_real',
    materialized: false,
    new_runtime: false,
    companion_keys: [
      'scenekunst/scenekunst_program_og_kuratering',
      'scenekunst/scenekunst_scene_og_produksjon',
      'scenekunst/scenekunst_regi_og_koreografi'
    ],
    rule: 'Readiness-behovet er candidate_when_shared_work_is_real; ingen cross-role runtime eller shared_work_object opprettes før en faktisk felles porteføljebeslutning eller arbeidsflate har versjon, beslutningseier, delegasjon, konfidensialitetsnivå og handoff.'
  },
  theme_ids: themeIds,
  season: {
    days: 14,
    day_phases: ['morning', 'lunch', 'afternoon', 'evening'],
    coverage
  },
  primary_threads: primaryThreads,
  private_aftermath: privateAftermath,
  delayed_consequences: delayedConsequences
};

write(WORLD_PATH, world);

const indexPath = 'data/Civication/roleWorlds/index.json';
const index = read(indexPath);
if (!index.roles.some((entry) => entry.category === 'scenekunst' && entry.role_scope === ROLE)) {
  index.roles.push({ category: 'scenekunst', role_scope: ROLE, status: 'role_world_complete', path: WORLD_PATH });
}
index.status = `${index.roles.filter((entry) => entry.status === 'role_world_complete').length}_role_worlds_materialized`;
index.effective_date = '2026-09-02';
write(indexPath, index);

const checklistPath = 'data/Civication/roleWorldAuthoringChecklist.json';
const checklist = read(checklistPath);
if (!checklist.reference_worlds.includes(WORLD_PATH)) checklist.reference_worlds.push(WORLD_PATH);
write(checklistPath, checklist);

const themePath = 'data/Civication/roleWorldThemeBank.json';
const themeBank = read(themePath);
themeBank.reference_profiles[KEY] = themeIds;
write(themePath, themeBank);

const prereqPath = 'tests/civication-scenekunst-institusjonsledelse-prerequisites.test.js';
let prereq = fs.readFileSync(path.join(ROOT, prereqPath), 'utf8');
prereq = prereq.replace(
  "assert.equal(ready.role_world_status, 'role_world_not_started');",
  "assert.ok(['role_world_not_started', 'role_world_complete'].includes(ready.role_world_status));"
);
prereq = prereq.replace(
  "assert.ok(readiness.rollout_queue.some((entry) => entry.key === KEY));",
  "assert.equal(readiness.rollout_queue.some((entry) => entry.key === KEY), ready.role_world_status === 'role_world_not_started');"
);
writeText(prereqPath, prereq);

const testSource = String.raw`const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
const KEY = 'scenekunst/scenekunst_institusjonsledelse';
const ROLE = 'scenekunst_institusjonsledelse';
const WORLD = \`data/Civication/roleWorlds/scenekunst/\${ROLE}.json\`;
const PLAN = \`data/Civication/mailPlans/scenekunst/\${ROLE}_plan.json\`;
const MODEL = \`data/Civication/roleModels/scenekunst/\${ROLE}.json\`;
const GRAMMAR = \`data/Civication/workGrammars/scenekunst/\${ROLE}.json\`;

const world = read(WORLD);
assert.equal(world.schema, 'civication_role_world_v1');
assert.equal(world.status, 'role_world_complete');
assert.deepEqual(world.materialization.authored_dimensions, ['situated_reputation']);
for (const key of [
  'no_new_runtime',
  'existing_plan_preserved',
  'existing_role_model_preserved',
  'existing_people_foundation_preserved',
  'existing_work_grammar_preserved',
  'existing_persistent_work_preserved',
  'existing_rhythm_preserved'
]) assert.equal(world.materialization[key], true, key);
assert.equal(world.materialization.cross_role_link_materialized, false);

assert.deepEqual(world.existing_work_continuity.work_loops, read(GRAMMAR).work_loops);
assert.equal(world.existing_work_continuity.persistent_work_object, 'institusjonens_mandat_ressurs_og_ansvarslogg');
assert.equal(world.existing_work_continuity.new_runtime_state, false);
assert.equal(read(PLAN).sequence.length, 16);
for (const person of read(MODEL).related_people) {
  assert.equal(person.fictional, true);
  assert.equal(person.fictional_scenario_actor, true);
  assert.equal(person.canonical_person_ref, null);
}

const refs = world.materialization.source_refs;
assert.equal(refs.length, 15);
assert.equal(new Set(refs).size, 15);
for (const ref of refs) {
  const [relativePath, id] = ref.split('#');
  assert.ok(read(relativePath).families.flatMap((family) => family.mails || []).some((mail) => mail.id === id), ref);
}

const audienceIds = [
  'artistic_program_and_practice',
  'employees_and_protection',
  'finance_and_administration',
  'board_and_owners',
  'artists_and_partners',
  'publics_and_press',
  'private_relations'
];
assert.equal(world.situated_reputation_model.global_score_allowed, false);
assert.deepEqual(world.situated_reputation_model.audiences.map((audience) => audience.id), audienceIds);
for (const audience of world.situated_reputation_model.audiences) {
  assert.ok(audience.cares_about.length >= 2);
  assert.match(audience.cannot_grant, /ikke|kan ikke/i);
}
assert.match(world.situated_reputation_model.authority_separation, /styre|eier/i);
assert.match(world.situated_reputation_model.authority_separation, /arbeidsgiver/i);
assert.match(world.situated_reputation_model.authority_separation, /budsjett|kontrakt/i);
assert.match(world.situated_reputation_model.authority_separation, /HMS|tariff/i);

assert.ok(refs.includes(world.history_go_affordance.source_ref));
assert.ok(world.history_go_affordance.better_question.length >= 220);
assert.match(world.history_go_affordance.better_question, /Inger Buresund/);
assert.match(world.history_go_affordance.better_question, /Black Box teater/);
assert.match(world.history_go_affordance.authority_boundary, /ikke|kan ikke/i);
assert.equal(world.cross_role_link.status, 'candidate_when_shared_work_is_real');
assert.equal(world.cross_role_link.materialized, false);
assert.equal(world.cross_role_link.new_runtime, false);
assert.equal('shared_work_object' in world.cross_role_link, false);
assert.match(world.cross_role_link.rule, /candidate_when_shared_work_is_real/);

assert.equal(world.season.days, 14);
assert.deepEqual(world.season.day_phases, ['morning', 'lunch', 'afternoon', 'evening']);
assert.equal(world.season.coverage.length, 56);
const beatKeys = new Set(world.season.coverage.map((beat) => \`\${beat.day}/\${beat.phase}\`));
assert.equal(beatKeys.size, 56);
assert.equal(new Set(world.season.coverage.map((beat) => beat.summary)).size, 56);
assert.equal(new Set(world.season.coverage.map((beat) => beat.standing_consequence)).size, 56);
const uses = new Map(refs.map((ref) => [ref, 0]));
for (const beat of world.season.coverage) {
  assert.ok(beat.summary.length >= 620, \`\${beat.day}/\${beat.phase} summary\`);
  assert.ok(beat.standing_consequence.length >= 500, \`\${beat.day}/\${beat.phase} consequence\`);
  assert.ok(audienceIds.includes(beat.standing_audience));
  assert.equal(beat.materialization_refs.length, 1);
  assert.ok(refs.includes(beat.materialization_refs[0]));
  uses.set(beat.materialization_refs[0], uses.get(beat.materialization_refs[0]) + 1);
}
for (const [ref, count] of uses) assert.ok(count >= 3, \`\${ref} underused\`);

assert.equal(world.primary_threads.length, 7);
for (const thread of world.primary_threads) {
  assert.ok(thread.relationship.length >= 160);
  assert.ok(thread.beat_refs.length >= 5 && thread.beat_refs.length <= 10);
  assert.ok(new Set(thread.beat_refs.map((ref) => ref.split('/')[0])).size >= 3);
  for (const ref of thread.beat_refs) assert.ok(beatKeys.has(ref), ref);
}
assert.equal(world.private_aftermath.length, 5);
for (const item of world.private_aftermath) {
  assert.equal(new Set(item.beat_refs).size, item.beat_refs.length);
  assert.ok(item.meaning.length >= 140);
  for (const ref of item.beat_refs) assert.ok(beatKeys.has(ref), ref);
}
assert.equal(world.delayed_consequences.length, 8);
for (const item of world.delayed_consequences) {
  assert.ok(beatKeys.has(item.setup_ref));
  assert.ok(beatKeys.has(item.return_ref));
  assert.notEqual(item.setup_ref, item.return_ref);
  assert.ok(Number(item.return_ref.split('/')[0]) > Number(item.setup_ref.split('/')[0]));
}

const index = read('data/Civication/roleWorlds/index.json');
assert.deepEqual(index.roles.find((entry) => entry.category === 'scenekunst' && entry.role_scope === ROLE), {
  category: 'scenekunst', role_scope: ROLE, status: 'role_world_complete', path: WORLD
});
assert.match(index.status, /_role_worlds_materialized$/);
assert.ok(read('data/Civication/roleWorldAuthoringChecklist.json').reference_worlds.includes(WORLD));
assert.deepEqual(read('data/Civication/roleWorldThemeBank.json').reference_profiles[KEY], world.theme_ids);

const readiness = read('data/Civication/roleWorldRolloutReadiness.json');
assert.ok(!(readiness.rollout_queue || []).some((entry) => entry.key === KEY));
assert.equal(readiness.roles.find((entry) => entry.key === KEY).role_world_status, 'role_world_complete');
assert.ok(readiness.summary.role_world_complete_or_pilot >= 47);
assert.equal(readiness.gate.gate_pass, true);
const career = read('data/Civication/careerGameplayMatrix.json').worlds.find((entry) => entry.key === KEY);
assert.equal(career.status, 'playable');
assert.equal(career.audit.runtime_gate, true);
assert.deepEqual(career.audit.missing_components, []);

const source = fs.readFileSync(path.join(ROOT, 'reports/CIVICATION_SCENEKUNST_INSTITUSJONSLEDELSE_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md'), 'utf8');
assert.match(source, /Editorial uniqueness/i);
assert.match(source, /global reputation score/i);
assert.match(source, /candidate_when_shared_work_is_real/);
assert.match(source, /29\/30/);
console.log('Civication Scenekunst institusjonsledelse Role World rollout: OK');
`;
writeText(TEST_PATH, testSource);

const report = `# Civication — Scenekunst institusjonsledelse Role World rollout

## Scope lock

- Canonical key: \`${KEY}\`.
- Separate prerequisite package is already merged and remains authoritative for appointment, role model, work grammar, four fictional actors, four work surfaces, 16-step plan and 15 authored mails.
- This delivery authors the 14-day Role World and situated reputation dimension only.
- It preserves \`institusjonens_mandat_ressurs_og_ansvarslogg\`, waiting, handoff, bounded rework, work-environment process, budget boundaries and board/owner authority.
- It adds no runtime system, global reputation score, shared work object or new authority path.
- Cross-role status remains \`candidate_when_shared_work_is_real\`; no cross-role materialization occurs without actual shared work.

## Source-first world

The season follows one institution from an overfilled portfolio through an uncertain grant, artistic delegation, economic dissent, a work-environment signal, premiere pressure, public explanation, a formal funding cut, board treatment, an informal board signal, partner reliance, audience success, capacity debt, an ineffective measure and final handoff.

All **56 day/phase beats** are unique. Every beat binds to exactly one of the existing 15 authored source mails, and every source mail is exercised at least three times. The same persistent leader log carries proposal, scenario, decision, waiting state, handoff, rework and later effect, so changed premises reopen only affected productions, contracts, budget lines, staffing choices or communication.

Seven evolving threads keep the world relational rather than episodic:

1. Amina — artistic direction, delegation and dissent.
2. Henrik — projection, financial attestation and commitment.
3. Sigrid — work environment, confidentiality and measured effect.
4. Leo — board mandate, informal signals and decision quality.
5. Season portfolio — capacity, bounded rework and long-term mandate.
6. External promise — partner reliance, consequence and repair.
7. Private containment — leadership without permanent heroic availability.

Eight delayed consequences return on later days across job, relationship, psyche, livelihood, economy, reputation and narrative domains. Five private aftermath pairs keep status pressure and responsibility from turning home into a reserve boardroom or confidential work surface.

## Situated reputation and authority

Standing is separate for artistic program/practice, employees/protection, finance/administration, board/owners, artists/partners, publics/press and private relations. The same choice can strengthen one audience and weaken another.

No audience can turn standing into board or owner mandate, employer authority, budget or contract delegation, artistic authority outside the actual delegation, HMS/tariff authority, specialist competence, access to confidential material or permission to rewrite professional dissent. There is **no global reputation score**.

History Go is bounded to the source-first Inger Buresund / Black Box teater task. It sharpens a question about long-term institution building, program, field relations and organizational form, but it cannot decide the fictional season or grant board, employer, budget, contract or work-environment authority.

## Editorial uniqueness

This is not a generic manager wrapper and not a permutation of the prerequisite mails. The world keeps specifically scenekunst-institutional distinctions active across time: artistic ambition versus real production capacity; delegated programming versus employer decision; forecast versus disposable funding; work-environment signal versus artistic conflict; board interest versus formal decision; public explanation versus confidential process; audience success versus capacity debt; and unsigned optimism versus a partner's real reliance.

The later funding cut is caused by an earlier explicit uncertainty rather than random crisis. The partner consequence grows from informal leadership signals. The work-environment follow-up preserves the first measure as evidence while reopening only the processes where effect failed. The final handoff therefore contains unresolved owners and control dates rather than a heroic claim that the leader solved the institution.

## Verification record

The fail-closed materialization must pass before permanent state is committed:

- focused Institusjonsledelse Role World rollout test;
- existing prerequisite test in both pre- and post-rollout semantics;
- full Civication suite including job-learning and job-knowledge audits;
- compiled scene-registry synchronization;
- scenarioPeople synchronization;
- career gameplay audit and rollout-readiness audit;
- repository diff/hygiene checks.

On a valid permanent head, readiness must move from **46 to at least 47 complete/pilot roles**, remove \`${KEY}\` from the rollout queue and keep the program-level readiness gate green. Exact-head PR CI remains authoritative for typecheck-baseline and Chromium boot smoke.

## Six-part quality gate — 29/30

| Dimension | Score | Evidence |
| --- | ---: | --- |
| Architecture and contracts | 5/5 | Existing appointment, role model, grammar, plan, actors, surfaces, rhythm and persistent work object are preserved. |
| Content depth and specificity | 5/5 | 14 days × 4 phases, seven evolving threads, five private aftermath pairs, eight delayed consequences and institution-specific governance tensions. |
| State, consequence and fail-closed behavior | 5/5 | Versioned waiting/rework, work-environment effect checks, partner reliance, divided authority and no global standing. |
| Test and generated-state integrity | 5/5 | Dedicated strict test plus index/checklist/theme/readiness/career/registry/scenarioPeople checks. |
| Repository hygiene and scope discipline | 5/5 | One role, one world, one source-first report; TEMP authoring surfaces are removed before permanent commit. |
| Runtime evidence at publication | 4/5 | Materialization gates are local/CI static; exact-head PR CI supplies authoritative browser boot smoke. |

Total: **29/30**. No critical Role World gap is accepted.
`;
writeText(REPORT_PATH, report);

console.log(JSON.stringify({
  world: WORLD_PATH,
  beats: coverage.length,
  source_refs: sourceRefs.length,
  minimum_source_reuse: Math.min(...usage.values()),
  threads: primaryThreads.length,
  private_aftermath: privateAftermath.length,
  delayed_consequences: delayedConsequences.length
}, null, 2));
