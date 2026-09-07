import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const CATEGORY = 'politikk';
const ROLE = 'politikk_parlamentarisk_arbeid';
const KEY = `${CATEGORY}/${ROLE}`;
const MODEL = `data/Civication/roleModels/${CATEGORY}/${ROLE}.json`;
const GRAMMAR = `data/Civication/workGrammars/${CATEGORY}/${ROLE}.json`;
const PLAN = `data/Civication/mailPlans/${CATEGORY}/${ROLE}_plan.json`;
const SOURCE = 'reports/CIVICATION_POLITIKK_PARLAMENTARISK_ARBEID_PREREQUISITES_SOURCE_FIRST.md';
const TEST = 'tests/civication-politikk-parlamentarisk-arbeid-prerequisites.test.js';
const MANIFEST = 'data/Civication/roleModels/manifest.json';
const TYPES = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const PERSISTENT = 'parlamentarisk_sakslogg_dokument_horing_innstilling_plenum_og_oppfolging';

const read = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const writeJson = (rel, value) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), {recursive:true});
  fs.writeFileSync(full, `${JSON.stringify(value, null, 2)}\n`);
};
const writeText = (rel, value) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), {recursive:true});
  fs.writeFileSync(full, value.endsWith('\n') ? value : `${value}\n`);
};

const ACTORS = [
  {
    id:'sigrid_komitesekretaer_politikk_parlamentarisk_arbeid',
    name:'Sigrid',
    role:'komitésekretær og prosesskoordinator',
    workplace_ids:['komite_saksmappe_og_innstillingsspor_politikk_parlamentarisk_arbeid','plenum_sporsmal_vedtak_og_oppfolging_politikk_parlamentarisk_arbeid'],
    function:'Sigrid holder det parlamentariske komitéarbeidet lesbart fra dokumentmottak, frister og møteplan til forslag, merknader, innstilling og videre behandling i plenum. For Stortingsrepresentanten gjør hun det eksplisitt hva som er komiteens prosess, hva som er partipolitisk posisjon, hvilke dokumentversjoner som gjelder, og hvilke avklaringer som fortsatt må vente før en parlamentarisk konklusjon kan fremstilles som ferdig. Hun insisterer på at høring, mindretallsmerknader, frister og formelle beslutningspunkter bevares selv når politisk tempo øker.',
    authority_relation:'Sigrid kan koordinere komitéprosess, dokumentflyt, møtefrister og korrekt sporbarhet og kan peke på når en innstilling eller parlamentarisk handling mangler nødvendig prosessgrunnlag. Hun kan ikke gi spilleren election_or_mandate, bestemme representantens stemme, gjøre komitésekretariatets tekst til politisk vedtak, gi adgang til fortrolig materiale uten grunnlag eller la partigruppens ønske overstyre Stortingets faktiske prosedyrer.'
  },
  {
    id:'amir_lov_og_budsjettanalytiker_politikk_parlamentarisk_arbeid',
    name:'Amir',
    role:'lov- og budsjettanalytiker',
    workplace_ids:['komite_saksmappe_og_innstillingsspor_politikk_parlamentarisk_arbeid','horing_innspill_og_kildegrunnlag_politikk_parlamentarisk_arbeid'],
    function:'Amir støtter Stortingsrepresentantens parlamentariske arbeid ved å skille mål, virkemiddel, rettslig mekanisme, budsjettvirkning, usikkerhet og dokumentert konsekvens i lov- og budsjettsaker. Han gjør det synlig når et populært forslag bygger på en påstand som ikke følger av dokumentene, når tall ikke er sammenlignbare, eller når en høringsaktørs interesse må skilles fra selve evidensen. I komitéarbeid etterspør han derfor kilde, versjon, premiss og konsekvens før argumentasjonen låses.',
    authority_relation:'Amir kan analysere dokumenter, lovtekst, budsjettpremisser og konsekvenser og kan anbefale hvilke spørsmål en Stortingsrepresentant bør stille før komité eller plenum. Han kan ikke skape parlamentarisk mandat, avgjøre politisk prioritering, presentere egen analyse som gjeldende rett eller Stortingsvedtak, få adgang til fortrolig materiale uten korrekt grunnlag eller gjøre History Go-kunnskap til erstatning for aktuell lov-, budsjett- eller saksdokumentasjon.'
  },
  {
    id:'nora_partigruppekoordinator_politikk_parlamentarisk_arbeid',
    name:'Nora',
    role:'partigruppekoordinator og parlamentarisk rådgiver',
    workplace_ids:['partigruppe_forhandlings_og_mandatrom_politikk_parlamentarisk_arbeid','komite_saksmappe_og_innstillingsspor_politikk_parlamentarisk_arbeid'],
    function:'Nora kobler Stortingsrepresentantens komitéarbeid til partigruppens prioriteringer, forhandlinger, talepunkter og avklaringer uten å late som partigruppen er Stortinget. Hun synliggjør hvilke posisjoner som er foreløpige, hva gruppen ønsker å forhandle om, hvor det finnes legitim dissens, og hvilke parlamentariske steg som fortsatt krever komitébehandling, forslag eller avstemning. Når tidsfristen er knapp, gjør hun forskjellen mellom partibinding, personlig vurdering og formell parlamentarisk beslutning eksplisitt.',
    authority_relation:'Nora kan koordinere partigruppens arbeid, samle argumenter, forberede forhandling og gjøre politiske konsekvenser synlige innen partiets reelle organisatoriske rammer. Hun kan ikke gi election_or_mandate, gjøre gruppens standpunkt til lov eller Stortingsvedtak, omskrive komitégrunnlaget, dele fortrolig materiale uten grunnlag eller gjøre partilojalitet til rett til å sette parlamentarisk prosedyre og dokumentasjonskrav til side.'
  },
  {
    id:'leila_horings_og_velgerkontakt_politikk_parlamentarisk_arbeid',
    name:'Leila',
    role:'hørings- og velgerkontakt',
    workplace_ids:['horing_innspill_og_kildegrunnlag_politikk_parlamentarisk_arbeid','plenum_sporsmal_vedtak_og_oppfolging_politikk_parlamentarisk_arbeid'],
    function:'Leila organiserer kontakten mellom Stortingsrepresentanten, høringsinstanser, berørte grupper, velgere og samfunnsaktører slik at parlamentarisk representasjon ikke reduseres til hvem som roper høyest eller har best tilgang. Hun skiller erfaring, interesse, dokumentert faktapåstand og politisk krav, fører hvem som er hørt og hvem som mangler, og følger senere opp hva som faktisk ble fremmet, besluttet eller ikke fikk flertall. Dermed blir høring og velgerkontakt en sporbar del av komité- og plenumsarbeidet.',
    authority_relation:'Leila kan samle og strukturere innspill, gjøre skjev representasjon synlig, planlegge hørings- og velgerkontakt og følge opp offentlig informasjon om parlamentarisk behandling. Hun kan ikke love et bestemt vedtak, gi en gruppe særskilt beslutningsrett, gjøre støtte eller popularitet til election_or_mandate, fremstille partiets ønske som Stortingets beslutning eller dele fortrolig saksinformasjon fordi en berørt aktør ønsker raskere tilgang.'
  }
];

const PLACES = [
  {
    id:'komite_saksmappe_og_innstillingsspor_politikk_parlamentarisk_arbeid',
    name:'Komitéens saksmappe og innstillingsspor',
    function:'Her bindes sak, dokumentversjoner, lov- og budsjettgrunnlag, frister, komitémøter, spørsmål, forslag, merknader, flertall og mindretall, innstilling og neste formelle steg sammen. Arbeidsflaten gjør det synlig hva Stortingsrepresentanten faktisk har lest og vurdert, hva som fortsatt er uavklart, og hva som er komitétekst versus partiposisjon eller personlig standpunkt. Ingen merknad, forhandling eller tidsfrist kan registreres som Stortingsvedtak før korrekt parlamentarisk behandling har skjedd.'
  },
  {
    id:'horing_innspill_og_kildegrunnlag_politikk_parlamentarisk_arbeid',
    name:'Hørings-, innspills- og kildegrunnlaget',
    function:'Her registreres høringsaktør, interesse, erfaring, faktapåstand, dokumentasjon, kilde, usikkerhet, motstridende innspill, hvem som ikke er representert, oppfølgingsspørsmål og hvordan innspillet faktisk brukes i komitéarbeidet. Flaten hindrer at tilgang, emosjonelt trykk eller en enkelt sterk fortelling blir behandlet som hele kunnskapsgrunnlaget, samtidig som erfaringskunnskap bevares som relevant evidens der den faktisk belyser konsekvenser.'
  },
  {
    id:'partigruppe_forhandlings_og_mandatrom_politikk_parlamentarisk_arbeid',
    name:'Partigruppens forhandlings- og mandatrom',
    function:'Her skilles partiprogram, gruppestandpunkt, forhandlingsposisjon, foreløpige kompromisser, individuell representantvurdering, legitime interne uenigheter og det som faktisk må fremmes eller stemmes over parlamentarisk. Rommet gjør tydelig at partidisiplin og politisk strategi er reelle arbeidsbetingelser, men verken partileder, gruppemøte, meningsmåling eller sosial standing kan konverteres til Stortingsvedtak, lov, budsjettfullmakt eller nytt election_or_mandate.'
  },
  {
    id:'plenum_sporsmal_vedtak_og_oppfolging_politikk_parlamentarisk_arbeid',
    name:'Plenum-, spørsmåls-, vedtaks- og oppfølgingssporet',
    function:'Her kobles debattforberedelse, forslag, spørsmål, votering, vedtak, offentlig begrunnelse, kontrollspørsmål, velgerkommunikasjon og senere oppfølging til den samme parlamentariske saken. Flaten skiller hva representanten ønsket, hva partiet fremmet, hva komiteen innstilte og hva Stortinget faktisk besluttet. Nye fakta, rettslige avklaringer eller gjennomføringsfunn kan gjenåpne relevante vurderinger uten å omskrive tidligere dokumenter, stemmegivning eller offentlig begrunnelse.'
  }
];

const AUTHORITY = {
  may:[
    'utøve Stortingsrepresentantens parlamentariske funksjoner bare når election_or_mandate er dokumentert og aktivt',
    'delta i komitéarbeid, høringer, partigruppe, spørsmål, forslag, debatt og avstemning innen Stortingets prosedyrer',
    'be om dokumentasjon, stille kontrollspørsmål, fremme politiske alternativer og forklare egen stemme og partiets posisjon presist',
    'behandle fortrolig eller begrenset materiale bare innen faktisk tilgang, formål og parlamentarisk regelverk',
    'følge opp vedtak og konsekvenser gjennom korrekte parlamentariske og offentlige kanaler'
  ],
  may_not:[
    'materialisere Stortingsrepresentantens rolle eller myndighet uten election_or_mandate',
    'late som egen stemme, partigruppens standpunkt, komitémerknad eller forhandling er et vedtak fra Stortinget',
    'sette parlamentariske prosedyrer, habilitet, tilgangsgrenser eller fortrolighet til side på grunn av politisk hastverk',
    'presentere politisk argumentasjon, partistandpunkt eller uverifisert påstand som gjeldende rett, vedtatt budsjett eller offentlig faktum',
    'love velgere, organisasjoner eller lobbyaktører et resultat som representanten ikke kan beslutte alene',
    'bruke Politikk-badge, XP, History Go-kunnskap, situated reputation, popularitet eller partistatus som valgresultat, mandat, lovgrunnlag, evidens eller Stortingsvedtak'
  ]
};

const model = read(MODEL);
Object.assign(model, {
  core_narrative:[
    'Stortingsrepresentanten fører saker fra dokumentgrunnlag og høring gjennom komité, partigruppe, innstilling, plenum, offentlig begrunnelse og oppfølging uten å gjøre personlig eller partipolitisk påvirkning til individuell vedtaksmyndighet.',
    'Rollen materialiseres bare når election_or_mandate er dokumentert. Politikk-badge og terskel 150 er læringsprogresjon, ikke valgresultat, representantplass, komitéplass, tilgang til fortrolig materiale eller rett til å tale på vegne av Stortinget.',
    'Arbeidet har en reell rytme av dokumentlesing, spørsmål, høring, venting på svar eller avklaringer, partiforhandling, komitétekst, plenum, handoff og bounded rework når nye fakta, rettslige premisser eller politiske kompromisser endrer saken.'
  ],
  work_life:{
    daily_work:[
      `oppdatere ${PERSISTENT} med sak, dokumentversjon, kildegrunnlag, høringsinnspill, komitéstatus, partiposisjon, forslag, innstilling, votering, vedtak, offentlig begrunnelse, ventepunkt og oppfølging`,
      'lese proposisjoner, representantforslag, budsjettdokumenter, lovtekst, faglige vurderinger og høringsinnspill før konklusjon eller debatt',
      'forberede komitémøter, spørsmål, merknader, forslag og innstilling med synlig skille mellom dokumentert premiss og politisk vurdering',
      'forhandle og avklare i partigruppen uten å gjøre partiposisjon til Stortingsvedtak eller skjule relevant dissens og usikkerhet',
      'delta i plenum og offentlig kommunikasjon og følge senere konsekvenser uten å love individuell kontroll over kollegiale beslutninger'
    ],
    responsibilities:['election_or_mandate_og_representasjonsgrense','komite_og_innstillingsarbeid','horing_og_interessebalanse','lov_og_budsjettgrunnlag','partigruppe_og_forhandling','plenum_forslag_og_votering','fortrolighet_og_tilgang','offentlig_begrunnelse_og_oppfolging'],
    work_environment:['Stortingets komiteer, høringer, partigrupper og plenum i tett samspill med sekretariat, faglige rådgivere, departementer, organisasjoner, velgere, medier og andre representanter.'],
    status_position:['Stortingsrepresentant er et appointment_required Civication-tilbud bak qualification `election_or_mandate`. Badge-terskel, kunnskap, popularitet og situated reputation kan aldri erstatte valgresultatet eller et aktivt parlamentarisk mandat.'],
    workplaces:PLACES.map(p=>p.id)
  },
  career_path:{
    entry_from:['Stortingsrepresentant bare etter dokumentert election_or_mandate; Politikk-badge, XP, nettverk, kunnskap, partistatus og omdømme kan ikke oppfylle denne gaten.'],
    progression_to:['Komitéansvar, parlamentarisk ledelse eller andre politiske verv bare gjennom reelle demokratiske og organisatoriske prosesser; spillstatus utvider ikke mandat, tilgang eller stemmerett.'],
    possible_promotions:['Komitéleder eller annet parlamentarisk ansvar gjennom Stortingets og partigruppens faktiske prosesser, ikke som automatisk Civication-forfremmelse.','Regjerings- eller partiledelsesroller bare gjennom separate valg-, utnevnelses- eller organisasjonsporter.'],
    possible_exits:['Tilbake til annet politisk, organisatorisk eller privat arbeid uten å beholde representantens tilgang, tittel eller parlamentariske myndighet når mandatet opphører.','Rådgivning, analyse eller organisasjonsarbeid der ny arbeidsgiverrolle og eventuelle kvalifikasjons- og habilitetsgrenser vurderes på nytt.'],
    career_risks:['Partipress og medielogikk kan belønne tidlig konklusjon før høring, dokumentasjon og komitébehandling er ferdig.','Nærhet til organisasjoner, lobbyaktører og velgere kan gjøre representasjon skjev hvis tilgang behandles som evidens eller løfte om resultat.']
  },
  required_knowledge:{
    education_basis:['Stortingsrepresentant følger election_or_mandate, ikke en automatisk utdanningsstige. Parlamentarisk prosedyre, konstitusjonell forståelse, lov- og budsjettlesing, kildekritikk og representasjon forbedrer beslutningskvalitet, men kan aldri erstatte demokratisk mandat.'],
    skills:['parlamentarisk_prosedyre','komitearbeid_og_innstilling','horing_og_interesseanalyse','lovtekst_og_rettslig_virkning','budsjett_og_okonomiske_premisser','dokument_og_versjonskontroll','kildekritikk_og_usikkerhet','partigruppe_og_forhandling','forslag_og_merknader','sporsmal_og_kontroll','debatt_og_offentlig_begrunnelse','fortrolighet_og_tilgang','velger_og_organisasjonskontakt','votering_vedtak_og_oppfolging'],
    category_knowledge:['Representativt demokrati, Stortingets organer og prosedyrer, komitébehandling, høringer, lov- og budsjettarbeid, parlamentarisk kontroll, partigruppers rolle og skillet mellom mandat, partistandpunkt, komitéinnstilling og Stortingsvedtak.'],
    history_go_badges:['politikk'],
    place_connections:PLACES.map(p=>p.id),
    people_connections:ACTORS.map(p=>p.id),
    boundary:'History Go kan gi historisk, institusjonell og stedlig kontekst om demokrati, Stortinget, representasjon og tidligere konflikter, men er ikke election_or_mandate, aktuell lovtekst, budsjettgrunnlag, komitédokument, fortrolighetsvurdering, votering eller Stortingsvedtak.'
  },
  authority_boundaries:{can:AUTHORITY.may,cannot:AUTHORITY.may_not},
  authority_boundary:AUTHORITY,
  competence_axes:['parlamentarisk_prosedyre','komite_og_innstillingsarbeid','lov_og_budsjettforstaelse','horing_og_representasjon','argumentasjon_og_forhandling','kildekritikk_og_dokumentasjon','fortrolighet_og_mandatgrenser','offentlig_begrunnelse'],
  ideal_type_problems:['partigruppen ønsker binding før komitégrunnlaget og høringen er ferdig','høringsaktører gir sterke og motstridende beskrivelser av samme konsekvens','et populært forslag har uklar rettslig eller budsjettmessig virkning','fortrolig informasjon kan gi politisk fordel dersom den brukes offentlig for tidlig','velgere krever et resultat som én representant ikke kan garantere eller vedta alene'],
  challenges:[{id:'parlamentarisk_sporbarhet_under_parti_og_tidspress',title:'Parlamentarisk sporbarhet under parti- og tidspress',description:'Representanten må holde dokumentasjon, høring, komitéprosess, partiforhandling, forslag og votering adskilt nok til at senere kontroll viser hva som var faktum, politisk vurdering og faktisk vedtak.',pressure:'partipress_medietempo_og_velgerforventning_vs_dokumentasjon_prosedyre_og_korrigerbarhet',affects:['quality','trust','risk']}],
  dilemmas:[{id:'partistandpunkt_blir_behandlet_som_ferdig_parlamentarisk_resultat',title:'Partistandpunkt blir behandlet som ferdig parlamentarisk resultat',setup:'En sak får stor oppmerksomhet før høringen og komitégrunnlaget er ferdig, og partigruppen ønsker at representanten lover både innhold og utfall offentlig.',choice_axis:'demokratisk_og_dokumentert_prosess_vs_tidlig_resultatbinding',consequence_axis:'etterprovbarhet_og_legitimitet_vs_overloving_kildefeil_og_mandatglidning',mail_hooks:TYPES}],
  related_people:ACTORS.map(p=>({...p,fictional:true,fictional_scenario_actor:true,canonical_person_ref:null})),
  related_places:PLACES
});
writeJson(MODEL, model);

const grammar = read(GRAMMAR);
Object.assign(grammar, {
  version:2,
  badge_binding:{badge_id:'politikk',badge_titles:['Stortingsrepresentant'],thresholds:[150]},
  work_world:'Parlamentarisk arbeid der election_or_mandate, dokumentgrunnlag, komité, høring, partigruppe, innstilling, plenum og oppfølging holdes sammen uten at personlig påvirkning eller partiposisjon blir til individuell Stortingsmyndighet.',
  task_families:['komitebehandling_og_innstilling','horing_og_interesseanalyse','lov_og_budsjettanalyse','partigruppe_og_forhandling','debatt_forslag_og_votering','representantkontakt_og_kontroll'],
  work_loops:['sak -> dokumenter -> komité -> høring -> analyse -> forhandling -> innstilling -> plenum -> vedtak -> oppfølging','påstand eller krav -> kilde og interesse -> konsekvens -> partivurdering -> parlamentarisk handling -> offentlig begrunnelse -> senere kontroll'],
  pressure_axes:['partipress_vs_ferdig_komitegrunnlag','medietempo_vs_kilde_og_prosedyre','sterk_tilgang_vs_representativ_horing','politisk_gevinst_vs_fortrolighet','velgerforventning_vs_kollegial_vedtaksmyndighet'],
  practice_stories:[
    {id:'horing_konflikt',setup:'En høring gir sterke, motstridende beskrivelser av samme forslag.',decision:'Sammenlign premisser, interesser og dokumentasjon før parlamentarisk konklusjon.',learning:'representasjon krever mer enn å telle de høyeste stemmene'},
    {id:'partipress',setup:'Partigruppen ønsker en konklusjon før komitégrunnlaget er ferdig.',decision:'Synliggjør hva som fortsatt er uavklart og hva tidlig binding vil gjøre med senere behandling.',learning:'partidisiplin opphever ikke behovet for beslutningsgrunnlag'},
    {id:'fortrolig_info',setup:'Representanten får informasjon som ikke kan brukes offentlig ennå.',decision:'Respekter tilgangsgrensen og finn lovlige parlamentariske måter å undersøke saken videre på.',learning:'parlamentarisk kontroll krever også informasjonsgrenser'},
    {id:'velgerkrav',setup:'En velgergruppe krever løfte om et konkret resultat.',decision:'Forklar mandat, prosess og hva representanten faktisk kan fremme, påvirke eller stemme for.',learning:'representanten har påvirkning, ikke individuell vedtaksmyndighet'},
    {id:'lovforslag',setup:'Et forslag har et populært mål, men uklar rettslig og budsjettmessig virkning.',decision:'Etterspør mekanisme, lovanalyse og konsekvens før virkemiddelet bindes.',learning:'god politikk vurderer både mål og mekanisme'}
  ],
  quality_axes:['parlamentarisk_prosedyre','komitearbeid','lov_og_budsjettforstaelse','argumentasjon','representasjon','kildekritikk','fortrolighet','sporbarhet'],
  authority_boundary:{may:AUTHORITY.may,may_not:AUTHORITY.may_not},
  actor_grammar:ACTORS.map(({id,name,role,workplace_ids})=>({id,name,role,workplace_ids})),
  place_grammar:PLACES,
  persistent_work_object_contract:{
    id:PERSISTENT,
    description:'Versjonert parlamentarisk sakslogg som bevarer election_or_mandate, sak og dokumentversjoner, kilde- og høringsgrunnlag, komitéspørsmål, forslag og merknader, partivurdering, innstilling, fortrolighet, plenumshandling, votering, faktisk vedtak, offentlig begrunnelse, ventepunkt, handoff og bounded rework gjennom samme saksforløp.',
    states:['election_or_mandate_bekreftet','sak_registrert','dokumentversjoner_laset','kildegrunnlag_kartlagt','horing_planlagt','innspill_og_interesser_registrert','motstridende_evidens_synlig','komitesporsmal_forberedt','venter_pa_svar_eller_nye_dokumenter','lov_og_budsjettvirkning_analysert','partigruppeposisjon_forelopig','forhandling_og_alternativer_registrert','komitemerknader_under_arbeid','innstilling_klar','fortrolighet_og_tilgang_kontrollert','plenum_forslag_og_debatt_forberedt','votering_gjennomfort','stortingsvedtak_registrert','offentlig_begrunnelse_publisert','oppfolging_og_kontroll','avvik_eller_nytt_premiss','bounded_rework_og_ny_handoff','lukket_med_sporbarhet'],
    handoff_rule:'Neste aktør mottar gjeldende sakslogg med aktivt election_or_mandate, dokumentversjon, kilde- og høringsgrunnlag, komitéstatus, partiposisjon, forslag, fortrolighetsgrense, hva som faktisk er besluttet, hva som venter og hva som må bekreftes. Handoff kan aldri skape mandat eller gjøre parti-, komité- eller personlig posisjon til Stortingsvedtak.'
  },
  rhythm_contract:{
    loop:'sak -> dokumentasjon -> høring -> waiting/venting på svar, lov- eller budsjettavklaring, komité eller partiforhandling -> innstilling -> plenum -> votering -> handoff -> offentlig begrunnelse -> oppfølging -> bounded rework',
    waiting_states:['horing_og_skriftlige_innspill','departement_eller_faglige_svar','lov_og_budsjettavklaring','komitemote_og_innstilling','partigruppe_og_forhandling','plenum_og_votering','oppfolging_nye_fakta_eller_kontroll'],
    rework_rule:'Nye dokumenter, korrigert faktagrunnlag, ny rettslig eller budsjettmessig avklaring, endret forhandlingsposisjon, komitémerknad, votering eller gjennomføringsfunn gjenåpner bare berørte ledd. Tidligere versjon, høringsgrunnlag, forslag, stemmegivning og offentlig begrunnelse beholdes.'
  },
  knowledge_dependencies:[{id:'history_go_politikk_parlamentarisk_historie_og_institusjoner',badge_id:'politikk',use:'History Go kan gi historisk og institusjonell kontekst om Stortinget, representasjon, lovgivning, demokratiske konflikter og tidligere politiske beslutninger og dermed forbedre hvilke spørsmål representanten stiller. Det kan ikke skape election_or_mandate, erstatte aktuell lovtekst, budsjettgrunnlag eller komitédokumenter, åpne fortrolig materiale eller gjøre en historisk analogi til evidens for dagens vedtak.'}],
  day_one_contract:{
    entry:'career_offer_policy_by_title',
    entry_policy_by_title:{'Stortingsrepresentant':{policy:'appointment_required',qualification_ids:['election_or_mandate']}},
    first_object:PERSISTENT,
    first_task:'Bekreft election_or_mandate før første parlamentariske handling. Registrer den første saken med dokumentversjon, beslutnings- og prosessnivå, kildegrunnlag, høringsbehov, komitéfrist, partigruppens foreløpige posisjon, fortrolighetsgrense, hva som må vente, og hva Politikk-badge eller History Go ikke gir myndighet eller evidens til.'
  },
  situated_reputation_contract:{global_score_allowed:false,audiences:['komite_og_parlamentariske_kolleger','partigruppe_og_politiske_medspillere','horingsaktorer_organisasjoner_og_velgere','faglige_og_juridiske_kilder','offentlighet_og_medier'],rule:'Standing følger konkret pålitelighet i prosedyre, kildebruk, representasjon, fortrolighet og offentlig begrunnelse hos den aktuelle gruppen. Den gir aldri election_or_mandate, stemmerett utover faktisk mandat, tilgang til fortrolig materiale, lovgrunnlag eller rett til å fremstille en partiposisjon som Stortingsvedtak.'},
  mail_generation_contract:{required_mail_types:TYPES,role_scope:ROLE,no_generic_fallback:true}
});
writeJson(GRAMMAR, grammar);

const manifest = read(MANIFEST);
if (!manifest.files.includes(MODEL)) {
  manifest.files.push(MODEL);
  manifest.files.sort((a,b)=>a.localeCompare(b,'nb'));
  writeJson(MANIFEST, manifest);
}

const FAMILY_IDS = {job:'parlamentarisk_arbeid_job',people:'parlamentarisk_arbeid_profesjonelle_relations',conflict:'parlamentarisk_arbeid_parti_prosedyre_og_fortrolighet',story:'parlamentarisk_arbeid_representasjon_og_tillit',event:'parlamentarisk_arbeid_hastetempo_og_nytt_dokument',micro:'parlamentarisk_arbeid_rask_kilde_og_mandatavklaring',followup:'parlamentarisk_arbeid_vedtak_kontroll_og_oppfolging',knowledge:'parlamentarisk_arbeid_history_go_demokratisk_kontekst',consequence:'parlamentarisk_arbeid_overloving_kilde_og_etterspill'};

const SPECS = [
  {type:'job',from:'Sigrid',person:ACTORS[0].id,place:PLACES[0].id,subject:'Avgrens den første komitésaken før du binder en konklusjon',focus:'bekreft election_or_mandate og skill dokumentgrunnlag, komitéprosess, partivurdering og faktisk beslutningsnivå før første politiske løfte'},
  {type:'job',from:'Amir',person:ACTORS[1].id,place:PLACES[0].id,subject:'Gjør lov- og budsjettvirkningen lesbar før merknaden skrives',focus:'skille politisk mål, rettslig mekanisme, budsjettpremiss, usikkerhet og dokumentert konsekvens før komitéteksten låses'},
  {type:'job',from:'Leila',person:ACTORS[3].id,place:PLACES[1].id,subject:'Bygg høringsgrunnlaget så sterke stemmer ikke blir hele evidensen',focus:'kartlegg aktører, interesser, erfaring, faktapåstander, dokumentasjon og manglende perspektiver før komitékonklusjonen trekkes'},
  {type:'job',from:'Sigrid',person:ACTORS[0].id,place:PLACES[3].id,subject:'Før innstillingen til plenum uten å omskrive hva komiteen faktisk sa',focus:'bevare flertall, mindretall, forslag, merknader, frister og neste formelle steg frem til plenum, votering og faktisk vedtak'},
  {type:'people',from:'Nora',person:ACTORS[2].id,place:PLACES[2].id,subject:'Nora trenger en status som skiller partibinding fra parlamentarisk resultat',focus:'forklare hva partigruppen ønsker, hva som fortsatt forhandles, og hva som først kan bli resultat etter komité eller votering'},
  {type:'people',from:'Amir',person:ACTORS[1].id,place:PLACES[1].id,subject:'Amir finner et tall som brukes politisk på en måte dokumentet ikke støtter',focus:'korrigere kildebruk og usikkerhet før talepunktet blir offentlig uten å late som faglig analyse bestemmer politisk konklusjon'},
  {type:'people',from:'Leila',person:ACTORS[3].id,place:PLACES[1].id,subject:'Leila melder at én organisasjon har fått langt mer tilgang enn berørte grupper',focus:'rebalansere hørings- og velgerkontakt og synliggjøre hvem som mangler uten å gjøre representativitet til mekanisk likevekt'},
  {type:'people',from:'Sigrid',person:ACTORS[0].id,place:PLACES[0].id,subject:'Sigrid stopper et dokument som fortsatt har uklar versjon og fortrolighet',focus:'kontrollere dokumentversjon, tilgang, komitéstatus og hva som kan brukes offentlig før parlamentarisk handling'},
  {type:'conflict',from:'Nora',person:ACTORS[2].id,place:PLACES[2].id,subject:'Partigruppen vil offentlig love utfallet før komiteen er ferdig',focus:'holde partiets reelle politiske press synlig samtidig som høring, komitébehandling, forslag og votering ikke fremstilles som avgjort'},
  {type:'story',from:'Leila',person:ACTORS[3].id,place:PLACES[1].id,subject:'En velgergruppe mener representanten bare lytter til profesjonelle lobbyaktører',focus:'bygge tillit med synlig høringsbredde, begrunnet kildebruk og ærlig forklaring av hva representanten kan påvirke men ikke love'},
  {type:'event',from:'Sigrid',person:ACTORS[0].id,place:PLACES[0].id,subject:'Et nytt dokument endrer saken timer før komitéfristen',focus:'gjenåpne bare berørte analyser og merknader, varsle partigruppe og komitéspor og bevare tidligere versjon og beslutningsgrunnlag'},
  {type:'micro',from:'Amir',person:ACTORS[1].id,place:PLACES[0].id,subject:'Tre minutter: Er dette faktum, politisk vurdering eller vedtak?',focus:'klassifisere en påstand og dens kilde før den brukes i komité, partigruppe eller offentlig debatt'},
  {type:'followup',from:'Sigrid',person:ACTORS[0].id,place:PLACES[3].id,subject:'Vedtaket er fattet, men kontroll- og oppfølgingssporet mangler eier',focus:'koble faktisk Stortingsvedtak til spørsmål, oppfølging, ny informasjon og tydelig ansvar uten å omskrive det opprinnelige vedtaket'},
  {type:'knowledge',from:'Leila',person:ACTORS[3].id,place:PLACES[3].id,subject:'Bruk History Go til å forstå parlamentarisk historie — ikke til å bevise dagens sak',focus:'bruke historisk og institusjonell kontekst til bedre spørsmål om representasjon, institusjoner og makt, men holde aktuell dokumentasjon, lov og mandat som egne porter'},
  {type:'consequence',from:'Nora',person:ACTORS[2].id,place:PLACES[2].id,subject:'Det tidlige løftet kommer tilbake etter at Stortinget vedtar noe annet',focus:'håndtere etterspillet etter overloving med korrigering, åpen prosessforklaring og avgrenset rework i stedet for å late som tidligere budskap var et vedtak'}
];

const COMMON_SUMMARY = `Dette steget føres i ${PERSISTENT}. Aktivt election_or_mandate, sak og dokumentversjon, kilde- og høringsgrunnlag, komitéstatus, partigruppens posisjon, forslag og merknader, fortrolighetsgrense, innstilling, plenumshandling, votering, faktisk vedtak, offentlig begrunnelse, ventepunkt, handoff og oppfølging skal være separate og versjonerte felt. Stortingsrepresentant er appointment_required bak election_or_mandate: Politikk-badge, XP, History Go-kunnskap, situated reputation, partistatus, popularitet og medietrykk kan aldri materialisere mandatet, åpne fortrolig materiale, gjøre en partiposisjon til lov eller Stortingsvedtak eller gjøre en historisk analogi til evidens for dagens sak. En god løsning viser derfor hvilket beslutningsnivå man er på, hva som er dokumentert, hvem som fortsatt må høres eller svare, hva representanten faktisk kan gjøre nå, og hvilket nytt premiss som legitimt skal gjenåpne analysen.`;

function makeMail(spec, ordinal) {
  const phase = ordinal % 3 === 0 ? 'forenoon' : ordinal % 3 === 1 ? 'afternoon' : 'evening';
  const family = FAMILY_IDS[spec.type];
  const prefix = `parlamentarisk_arbeid_${spec.type}_${String(ordinal+1).padStart(3,'0')}`;
  return {
    id:prefix, mail_type:spec.type, mail_family:family, role_scope:ROLE, phase, priority:120+ordinal, from:spec.from, people_ref:spec.person, place_id:spec.place, subject:spec.subject,
    summary:`${spec.subject}. Målet er å ${spec.focus}. ${COMMON_SUMMARY}`,
    situation:[`Den parlamentariske saksloggen viser gjeldende dokumentversjon, kilde- og høringsgrunnlag, komitéstatus, partiposisjon, forslag, fortrolighet, frister og åpne ventepunkter knyttet til at du skal ${spec.focus}.`,'Presset er reelt: partigruppe, medier, velgere, høringsaktører, komitéfrist eller politisk gevinst kan gjøre det fristende å behandle en foreløpig posisjon som ferdig parlamentarisk resultat eller en sterk påstand som tilstrekkelig evidens.','Du må velge et grep som tåler senere kontroll, bevarer election_or_mandate og tilgangsgrenser, skiller politisk vurdering fra dokumentert premiss og gjør bounded rework mulig uten å slette tidligere dokumentversjon, forslag, stemme eller offentlig begrunnelse.'],
    task_domain:'parlamentarisk_arbeid', competency:'parlamentarisk_prosedyre_komite_horing_kildebruk_forhandling_og_mandat', pressure:'partigruppe_medier_velgere_horingsaktorer_tid_fortrolighet_og_kollegial_beslutning', choice_axis:'sporbar_mandatbundet_og_kildebevisst_parlamentarisk_prosess_vs_tidlig_resultat_og_mandatglidning', consequence_axis:'legitimitet_etterprovbarhet_og_korrigerbarhet_vs_overloving_kildefeil_og_tillitstap', narrative_arc:spec.type,
    choices:[
      {id:'A',label:`Før ${spec.subject.toLowerCase()} gjennom det sporbare parlamentariske saksforløpet`,reply:`Jeg fører dette gjennom ${PERSISTENT} i stedet for å løse det som et talepunkt eller en privat politisk snarvei. Først bekrefter jeg election_or_mandate og riktig prosessnivå. Deretter låser jeg dokumentversjon, skiller kilde, interesse og politisk vurdering, registrerer hørings- og komitéstatus, partigruppens foreløpige posisjon, fortrolighetsgrense, forslag, frister og hva vi faktisk venter på. Jeg handler bare innen representantens reelle mandat, sender komplett handoff til riktig parlamentarisk aktør og beholder tidligere versjon hvis nye fakta krever bounded rework. History Go brukes til kontekst og bedre spørsmål, aldri som valgresultat, lovgrunnlag eller evidens for dagens sak.`,effect:1,tags:['election_or_mandate','parlamentarisk_sporbarhet','kildekritikk','komite_og_horing'],feedback:'Grepet gjør det mulig for komitékolleger, partigruppe, høringsaktører, velgere og offentlighet å se hva som var dokumentert premiss, hva som var politisk vurdering, hvilken posisjon partiet hadde, hva komiteen innstilte og hva Stortinget faktisk vedtok. Representanten får handlingskraft gjennom spørsmål, forslag, forhandling og stemme uten å gjøre påvirkning til individuell vedtaksmyndighet. Når et nytt dokument eller premiss kommer, kan bare berørt analyse eller forslag gjenåpnes med tidligere versjon, høringsgrunnlag, merknad og offentlig forklaring bevart.',effects:{stats:{quality:2,trust:2,risk:-2,energy:-1}}},
      {id:'B',label:`Lukk ${spec.subject.toLowerCase()} gjennom tidlig politisk binding`,reply:'Jeg prioriterer tempo og budskap foran sakslogg og prosess. Jeg behandler partigruppens ønske eller en sterk høringsaktørs påstand som tilstrekkelig grunnlag, lar dokumentversjon og fortrolighet være uklare og kommuniserer utfallet før komité, innstilling eller votering faktisk er ferdig. Dersom nye fakta kommer, forsøker jeg å forsvare det tidligere løftet og justerer forklaringen etterpå i stedet for å gjenåpne den delen av analysen som faktisk endret seg.',effect:-1,tags:['tidlig_resultatbinding','kilde_og_prosessrisiko','mandatglidning'],feedback:'Løsningen kan gi kortsiktig politisk tydelighet, men den gjør det uklart hva som var kilde, partiposisjon, komitéarbeid og faktisk Stortingsbeslutning. Når høring, dokumentasjon, fortrolighet og votering blandes sammen, kan representanten både overdrive egen myndighet og svekke senere kontroll. Nye fakta blir da et omdømmeproblem som skal forklares bort i stedet for et avgrenset rework i en dokumentert parlamentarisk prosess, og velgere eller organisasjoner kan sitte igjen med et løfte som aldri lå innen én representants beslutningsrett.',effects:{stats:{status:1,quality:-2,trust:-2,risk:3}}}
    ]
  };
}

for (const type of TYPES) {
  const typeSpecs = SPECS.filter(s=>s.type===type);
  writeJson(`data/Civication/mailFamilies/${CATEGORY}/${type}/${ROLE}_${type}.json`, {schema:'civication_mail_family_catalog_v1',version:1,category:CATEGORY,role_scope:ROLE,mail_type:type,families:[{id:FAMILY_IDS[type],purpose:`Trene ${type} som del av et versjonert parlamentarisk saksforløp der election_or_mandate, dokumentasjon, høring, komité, partigruppe, innstilling, plenum, vedtak og oppfølging forblir eksplisitte og korrigerbare.`,learning_focus:['parlamentarisk_prosedyre','komite_og_innstilling','horing_og_representasjon','kildekritikk','fortrolighet','election_or_mandate'],mails:typeSpecs.map(spec=>makeMail(spec,SPECS.indexOf(spec)))}]});
}

const sequenceTypes = ['job','people','knowledge','job','people','conflict','job','people','event','micro','job','people','followup','story','consequence','job'];
writeJson(PLAN, {schema:'civication_mail_plan_v1',version:1,id:'politikk_parlamentarisk_arbeid_foundation_v1',category:CATEGORY,role_scope:ROLE,title:'Parlamentarisk arbeid',description:'Seksten steg fra første komitésak og dokumentgrunnlag til høring, partigruppe, innstilling, plenum, faktisk vedtak, offentlig begrunnelse og parlamentarisk oppfølging i ett versjonert saksspor.',arc:{from:'Ny Stortingsrepresentant med dokumentert election_or_mandate som må lære at valgt mandat gir parlamentariske handlingsrettigheter, men ikke individuell rett til å gjøre partiposisjon, komitéarbeid eller personlig løfte til Stortingsvedtak.',to:'En pålitelig representant som kan holde dokumenter, kilder, høring, komité, forhandling, innstilling, plenum, votering og oppfølging sammen og forklare både påvirkning og myndighetsgrenser presist.',core_questions:['Hva er dokumentert premiss, hva er politisk vurdering, og hvilket parlamentarisk nivå er saken faktisk på?','Hvem er hørt, hvilke interesser og kilder ligger bak, og hva mangler fortsatt før komité eller plenum?','Hva kan jeg fremme, spørre om, forhandle eller stemme for, og hva kan jeg aldri love eller beslutte alene?']},outcome_rules:{promoted:{completion_ratio_gte:1,score_gte:2,strikes_lte:0},fired:{stability_values:['FIRED'],strikes_gte:3,score_lte:-3},stagnated:{autonomy_delta:-10,stability:'STAGNATED',add_branch_flags:['career_stagnated','parlamentarisk_sporbarhet_kilde_eller_mandatvikt']}},sequence:sequenceTypes.map((type,i)=>({step:i+1,type,phase:i<3?'intro':i<10?'advanced':'mastery',step_goal:`Før ${PERSISTENT} gjennom ${type} med aktivt election_or_mandate, dokumentversjon, kilde- og høringsgrunnlag, komitéstatus, partiposisjon, fortrolighetsgrense, forslag, ventepunkt, plenum og bounded rework.`,allowed_families:[FAMILY_IDS[type]],fallback_types:[]}))});

writeText(SOURCE, ['# Politikk / Parlamentarisk arbeid — prerequisite source-first closure','','## Scope','','- This package closes the runtime prerequisite gaps around day one, People, Places, mail, knowledge and workday-loop evidence for `politikk_parlamentarisk_arbeid`.','- It preserves `Stortingsrepresentant` as `appointment_required` with qualification `election_or_mandate`; it never converts the role to direct badge unlock.','- It is prerequisite completion, not Role World completion. The dedicated Role World remains a separate one-role rollout PR.','','## Canonical evidence and authority','','- `data/Civication/politikkCareerLifeEvidence.json` already cites Stortinget for the representative role and classifies it as a formal active Civication position behind the election gate.','- The representative may work through committee, hearing, party group, questions, proposals, debate and voting only inside the active mandate and Storting procedures.','- A personal vote, party position, committee remark, popularity, History Go knowledge or situated reputation is never a Storting decision, law, budget authority or new mandate.','','## Materialized foundation','','- Four fictional scenario actors and four parliamentary work surfaces.',`- Persistent work object: \`${PERSISTENT}\` with explicit waiting, handoff and bounded rework.`,'- Fifteen source mails across all nine canonical mail types: 4 job, 4 people and one each of conflict, story, event, micro, followup, knowledge and consequence.','- Sixteen-step mail plan with no generic fallback.','- History Go can improve historical and institutional questions about democracy and Parliament, but cannot replace current documents, law, budget evidence, confidentiality controls, election_or_mandate or voting.','','## Expected readiness effect','',`- ${KEY} should move from needs_role_authored_work to playable / rollout_ready after generated audits.`,'- No Role World file is authored in this prerequisite package.'].join('\n'));

const test = `const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const read = rel => JSON.parse(fs.readFileSync(path.join(ROOT,rel),'utf8'));
const exists = rel => fs.existsSync(path.join(ROOT,rel));
const ROLE='politikk_parlamentarisk_arbeid';
const KEY='politikk/'+ROLE;
const MODEL='data/Civication/roleModels/politikk/'+ROLE+'.json';
const GRAMMAR='data/Civication/workGrammars/politikk/'+ROLE+'.json';
const PLAN='data/Civication/mailPlans/politikk/'+ROLE+'_plan.json';
const WORLD='data/Civication/roleWorlds/politikk/'+ROLE+'.json';
const TYPES=['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const ACTORS=${JSON.stringify(ACTORS.map(a=>a.id))};
const PLACES=${JSON.stringify(PLACES.map(p=>p.id))};
const PERSISTENT='${PERSISTENT}';
assert.ok(exists(MODEL)&&exists(GRAMMAR)&&exists(PLAN));
const model=read(MODEL), grammar=read(GRAMMAR), plan=read(PLAN);
assert.equal(model.schema,'civication_role_model_v2'); assert.equal(model.version,2); assert.equal(model.role_scope,ROLE); assert.equal(model.role_id,ROLE);
assert.deepEqual(model.work_life.workplaces,PLACES); assert.deepEqual(model.related_people.map(p=>p.id),ACTORS);
assert.ok(model.required_knowledge.skills.length>=12); assert.deepEqual(model.required_knowledge.history_go_badges,['politikk']);
for(const p of model.related_people){assert.equal(p.fictional,true);assert.equal(p.fictional_scenario_actor,true);assert.equal(p.canonical_person_ref,null);assert.ok(p.function.length>=250);assert.ok(p.authority_relation.length>=250);}
for(const p of model.related_places) assert.ok(p.function.length>=250);
assert.equal(grammar.version,2); assert.deepEqual(grammar.actor_grammar.map(a=>a.id),ACTORS); assert.deepEqual(grammar.place_grammar.map(p=>p.id),PLACES);
assert.equal(grammar.persistent_work_object_contract.id,PERSISTENT); assert.ok(grammar.persistent_work_object_contract.states.length>=20);
assert.match(grammar.rhythm_contract.loop,/waiting|venting/i); assert.equal(grammar.rhythm_contract.waiting_states.length,7);
assert.equal(grammar.day_one_contract.entry,'career_offer_policy_by_title');
assert.deepEqual(grammar.day_one_contract.entry_policy_by_title['Stortingsrepresentant'],{policy:'appointment_required',qualification_ids:['election_or_mandate']});
assert.deepEqual(grammar.mail_generation_contract.required_mail_types,TYPES); assert.equal(grammar.mail_generation_contract.no_generic_fallback,true);
const badge=read('data/badges/politikk.json'); const offer=badge.tiers.find(t=>t.career_offer?.role_scope===ROLE).career_offer;
assert.equal(offer.policy,'appointment_required'); assert.deepEqual(offer.qualification_ids||[],['election_or_mandate']);
const evidence=read('data/Civication/politikkCareerLifeEvidence.json'); assert.ok(evidence.canonical_decision.formal_job_tiers.includes('Stortingsrepresentant'));
assert.equal(plan.id,'politikk_parlamentarisk_arbeid_foundation_v1'); assert.equal(plan.sequence.length,16);
assert.deepEqual(plan.sequence.map(s=>s.type),['job','people','knowledge','job','people','conflict','job','people','event','micro','job','people','followup','story','consequence','job']);
let total=0; const counts={}; for(const type of TYPES){const cat=read('data/Civication/mailFamilies/politikk/'+type+'/'+ROLE+'_'+type+'.json'); const mails=cat.families.flatMap(f=>f.mails||[]); counts[type]=mails.length; total+=mails.length; assert.ok(mails.length>=1); for(const m of mails){assert.equal(m.role_scope,ROLE);assert.equal(m.mail_type,type);assert.ok(ACTORS.includes(m.people_ref));assert.ok(PLACES.includes(m.place_id));assert.ok(m.summary.length>=700);assert.equal(m.choices.length,2);assert.deepEqual(m.choices.map(c=>c.id),['A','B']);for(const c of m.choices){assert.ok(c.reply.length>=380);assert.ok(c.feedback.length>=430);}}}
assert.deepEqual(counts,{job:4,people:4,conflict:1,story:1,event:1,micro:1,followup:1,knowledge:1,consequence:1}); assert.equal(total,15);
const manifest=read('data/Civication/roleModels/manifest.json'); assert.ok(manifest.files.includes(MODEL));
const pack=read('data/Civication/rolePackIndex.json').roles.find(r=>r.category==='politikk'&&r.role_scope===ROLE); assert.ok(pack); assert.equal(pack.status,'complete_reference_v2');
const career=read('data/Civication/careerGameplayMatrix.json').worlds.find(r=>r.key===KEY); assert.ok(career); assert.equal(career.status,'playable'); assert.equal(career.audit.runtime_gate,true); assert.deepEqual(career.audit.missing_components,[]);
for(const name of ['entry','day_one','workday_loop','people','places','mail','knowledge','authority','consequences','performance','economy','progression','exit']) assert.equal(career.audit.components[name].level,'complete',name);
const readiness=read('data/Civication/roleWorldRolloutReadiness.json'); const ready=readiness.roles.find(r=>r.key===KEY); assert.ok(ready); assert.equal(ready.classification,'rollout_ready');
for(const dim of ['people_places_integrity','persistent_work_object','rhythm_waiting_handoff_rework','history_go_affordance','situated_reputation']) assert.ok(['foundation_ready','proven'].includes(ready.dimensions[dim].status),dim);
assert.equal(readiness.rollout_queue.some(r=>r.key===KEY&&r.classification==='rollout_ready'),!exists(WORLD));
const scenarioPeople=read('data/Civication/scenarioPeople/generated/politikk.json'); const factual=new Set(Object.values(scenarioPeople.people_pool||{}).flat().map(p=>p.person_id)); for(const id of ACTORS) assert.ok(!factual.has(id));
const boundary=JSON.stringify({model,grammar}).toLowerCase(); for(const term of ['election_or_mandate','history go','politikk-badge','komité','høring','fortrolig','stortingsvedtak','situated reputation']) assert.ok(boundary.includes(term),term);
const source=fs.readFileSync(path.join(ROOT,'${SOURCE}'),'utf8'); assert.match(source,/Fifteen source mails/i); assert.match(source,/not Role World completion/i); assert.match(source,/election_or_mandate/);
console.log('PASS: Politikk Parlamentarisk arbeid foundation is playable and rollout-ready while election_or_mandate, committee, source, confidentiality and Storting decision boundaries remain intact.');
`;
writeText(TEST, test);

console.log(`Materialized ${ROLE} prerequisites with ${ACTORS.length} actors, ${PLACES.length} places, ${SPECS.length} source mails and one 16-step plan.`);
