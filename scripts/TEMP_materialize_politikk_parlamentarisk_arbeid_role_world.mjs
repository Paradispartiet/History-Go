import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CATEGORY = 'politikk';
const ROLE = 'politikk_parlamentarisk_arbeid';
const KEY = `${CATEGORY}/${ROLE}`;
const WORLD = `data/Civication/roleWorlds/${CATEGORY}/${ROLE}.json`;
const MODEL = `data/Civication/roleModels/${CATEGORY}/${ROLE}.json`;
const GRAMMAR = `data/Civication/workGrammars/${CATEGORY}/${ROLE}.json`;
const PLAN = `data/Civication/mailPlans/${CATEGORY}/${ROLE}_plan.json`;
const SOURCE = 'reports/CIVICATION_POLITIKK_PARLAMENTARISK_ARBEID_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md';
const TEST = 'tests/civication-politikk-parlamentarisk-arbeid-role-world-rollout.test.js';
const TYPES = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const THEMES = [
  'professional_culture','bureaucratic_power','loyalty_up_down','shame_reputation','public_attention',
  'status_anxiety','public_private_leakage','class_power','local_knowledge_vs_system'
];
const AUDIENCES = [
  'komiteledelse_medlemmer_og_parlamentarisk_sekretariat',
  'partigruppe_og_parlamentariske_forhandlingsmotparter',
  'horing_velgere_og_berorte_samfunnsaktorer',
  'lov_budsjett_kilder_og_faglig_kontroll',
  'plenum_presidium_og_kollegialt_storting',
  'presse_offentlighet_og_demokratisk_etterprovbarhet',
  'private_relations_partilojalitet_og_rollegrenser'
];

const read = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const writeJson = (rel, value) => {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, JSON.stringify(value, null, 2) + '\n');
};
const writeText = (rel, value) => {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, value.endsWith('\n') ? value : value + '\n');
};
const catalogPath = type => `data/Civication/mailFamilies/${CATEGORY}/${type}/${ROLE}_${type}.json`;
const refs = TYPES.flatMap(type => {
  const doc = read(catalogPath(type));
  return (doc.families || []).flatMap(f => (f.mails || []).map(m => `${catalogPath(type)}#${m.id}`));
});
if (refs.length !== 15 || new Set(refs).size !== 15) throw new Error(`Expected 15 unique canonical source mails, got ${refs.length}`);

const model = read(MODEL);
const grammar = read(GRAMMAR);
const plan = read(PLAN);
if (model.related_people?.length !== 4) throw new Error('Parliamentary foundation must preserve exactly 4 fictional actors');
if (plan.sequence?.length !== 16) throw new Error('Parliamentary foundation must preserve 16-step plan');
const policy = grammar.day_one_contract?.entry_policy_by_title?.['Stortingsrepresentant'];
if (policy?.policy !== 'appointment_required' || JSON.stringify(policy.qualification_ids) !== JSON.stringify(['election_or_mandate'])) {
  throw new Error('Stortingsrepresentant gate changed: expected appointment_required + election_or_mandate');
}

const socialEnvironments = [
  'komite_saksmappe_moter_og_innstillingsarbeid_der_flertall_mindretall_og_prosedyre_ma_overleve_tidspress',
  'horing_og_innspillsflate_der_erfaring_interesse_kildegrunnlag_og_fravaerende_stemmer_ma_holdes_samtidig',
  'partigruppe_og_forhandlingsrom_der_lojalitet_uenighet_kompromiss_og_forelopig_posisjon_ma_skillles_fra_stortingsvedtak',
  'lov_og_budsjettanalyse_der_populaere_mal_ma_proves_mot_mekanisme_rettsvirkning_kostnad_og_usikkerhet',
  'plenum_med_debatt_forslag_votering_og_kollegial_vedtaksmyndighet_under_offentlig_oppmerksomhet',
  'presse_og_velgerkontakt_der_forklaring_ma_skille_egen_stemme_partiets_posisjon_komiteinnstilling_og_faktisk_vedtak',
  'fortrolig_eller_begrenset_informasjonsflate_der_kontrollbehov_ma_sameksistere_med_tilgang_formal_og_prosedyre',
  'oppfolgings_og_kontrollspor_der_nye_fakta_kan_gjenapne_vurdering_uten_a_omskrive_tidligere_dokumenter_eller_votering',
  'privat_og_partiintern_kultur_der_naerhet_status_og_lojalitet_kan_presse_habilitet_kildebruk_og_rollegrenser'
];

const archetypes = [
  {
    id:'sigrid_komitesekretaer_world',
    social_function:'Sigrid gjør prosedyre, dokumentversjoner og komitéens institusjonelle hukommelse synlig når politisk tempo presser representanten til å omtale et foreløpig spor som ferdig behandling.',
    class_position:'Parlamentarisk komitésekretær med sterk prosesskompetanse og kontroll over arbeidsflyt, men uten valgt mandat eller rett til å velge komitéens politiske konklusjon.',
    status:'Høy institusjonell troverdighet når dokument, frister, spørsmål, merknader og faktisk behandlingsstatus kan etterprøves av både flertall og mindretall.',
    power_over_player:'Kan returnere uklart underlag, kreve korrekt prosedyre og synliggjøre hva som mangler før innstilling, men kan ikke gi nytt election_or_mandate eller gjøre sekretariatsarbeid til politisk vedtak.',
    wants:'At komitéarbeidet er raskt nok til å fungere og presist nok til at ingen senere trenger å gjette hva som var dokument, forslag, merknad, flertall, mindretall eller formell innstilling.',
    conceals:'At også profesjonelle prosessmiljøer kan bli så vant til tidsfrister og etablerte aktører at alternative problemforståelser eller sene, relevante innspill får mindre rom enn de burde.',
    speech_style:'Nøktern og prosedyrenær; spør hvilken dokumentversjon som gjelder, hvilket organ som eier neste steg, hva som er foreløpig og hva som faktisk er besluttet.',
    teaches_player:'At parlamentarisk innflytelse blir mer legitim, ikke mindre politisk, når prosedyre og dokumentasjon hindrer at makt glir mellom nivåer.'
  },
  {
    id:'amir_lov_budsjett_world',
    social_function:'Amir tester om representanten klarer å skille politisk mål, rettslig mekanisme, budsjettvirkning, forutsetning og faktisk dokumentert konsekvens før et standpunkt blir offentlig.',
    class_position:'Lov- og budsjettanalytiker med høy faglig innflytelse over premissene, men uten rett til å velge partiposisjon, komitémerknad eller stemmegivning.',
    status:'Høy faglig standing når usikkerhet, motargumenter og kostnader synliggjøres før de blir politisk ubehagelige, ikke først når noen utenfra påpeker dem.',
    power_over_player:'Kan kreve kilde, avgrense hva analysen faktisk viser og returnere uholdbare premisser, men kan ikke konvertere faglig vurdering til Stortingsvedtak eller mandat.',
    wants:'At populære forslag blir analysert på samme måte som upopulære: mål, hjemmel, mekanisme, finansiering, fordelingsvirkning, risiko og hvilke premisser som fortsatt er usikre.',
    conceals:'At ekspertmiljøer også kan favorisere målbare og dokumenterbare virkninger og dermed undervurdere erfaringer eller konsekvenser som er reelle, men vanskeligere å kvantifisere.',
    speech_style:'Kilde- og mekanismeorientert; spør hva påstanden bygger på, hvilken regel eller budsjettpost som faktisk berøres, og hva som endrer konklusjonen.',
    teaches_player:'At sterk politisk argumentasjon tåler å vise hvor evidensen slutter og verdivurderingen begynner.'
  },
  {
    id:'nora_partigruppe_world',
    social_function:'Nora gjør partidisiplin, strategisk timing, intern uenighet og forhandlingsmakt konkret uten å la partigruppens posisjon bli forvekslet med komitéens eller Stortingets beslutning.',
    class_position:'Partigruppekoordinator og parlamentarisk rådgiver med betydelig tilgang til strategi og forhandling, men uten selvstendig election_or_mandate og uten rett til å avgi representantens stemme.',
    status:'Høy intern status når hun kan bygge handlingsrom og kompromiss uten å skjule hvilke forutsetninger, røde linjer og prosedyrer som fortsatt begrenser gruppen.',
    power_over_player:'Kan legge sterkt press på prioritering, budskap og timing og kan eskalere avvik fra gruppelinjen, men kan ikke erstatte mandat, formell votering eller representantens ansvar for egen parlamentarisk handling.',
    wants:'At gruppen framstår koordinert, forhandler effektivt og unngår unødvendige tap, samtidig som faktagrunnlaget og prosedyren er robuste nok til å tåle offentlig kontroll.',
    conceals:'At ønsket om taktisk klarhet kan gjøre tidlig binding fristende nettopp i de sakene der høring, lovanalyse eller komitéarbeid fortsatt kan endre hva som er forsvarlig.',
    speech_style:'Kort, strategisk og posisjonsbevisst; spør hva gruppen kan leve med, hva som kan sies nå, hva som må forhandles og hvilken risiko en avvikende stemme skaper.',
    teaches_player:'At lojalitet oppover og sideveis aldri fjerner forskjellen mellom partiposisjon, individuell representantvurdering og Stortingets kollegiale vedtak.'
  },
  {
    id:'leila_horing_velgerkontakt_world',
    social_function:'Leila gjør representasjon til et praktisk problem: hvem slipper til, hvilke erfaringer blir oversatt riktig, hvilke interesser står bak innspillene, og hvem mangler fortsatt i materialet.',
    class_position:'Hørings- og velgerkontakt med bred relasjonell tilgang til organisasjoner, berørte grupper og enkeltpersoner, men uten rett til å love dem et bestemt parlamentarisk utfall.',
    status:'Høy relasjonell legitimitet når mennesker opplever at innspill registreres presist, blir utfordret rettferdig og kan spores til hvordan de faktisk påvirket eller ikke påvirket saken.',
    power_over_player:'Kan synliggjøre representasjonsblinde flekker, eskalere brudd på lovnader om dialog og utfordre hvem komiteen faktisk har hørt, men kan ikke gi mandat eller gjøre et innspill til vedtak.',
    wants:'At høringer og velgerkontakt ikke bare belønner profesjonelle aktører med mest kapasitet, men gir et etterprøvbart bilde av berørte erfaringer, interesser og kunnskapsgrunnlag.',
    conceals:'At nære relasjoner til organiserte og medievante miljøer kan gjøre deres historier lettere å formidle enn erfaringene til grupper som mangler tid, språk eller institusjonell tilgang.',
    speech_style:'Erfaringsnær og sammenlignende; spør hvem som er hørt, hvem som ikke er hørt, hva som er erfaring, hva som er påstand, og hva representanten faktisk kan love.',
    teaches_player:'At representasjon krever både relasjonell lytting og institusjonell disiplin; ingen sterk historie er hele befolkningen.'
  },
  {
    id:'komiteleder_og_kollegial_makt_world',
    social_function:'Komitélederen viser hvordan dagsorden, taletid, forhandling og prosedyrekunnskap skaper reell makt samtidig som konklusjonen fortsatt må være kollegial og dokumentert.',
    class_position:'Valgt komitéleder med formell funksjon innen aktivt mandat og komiteens regler, men uten rett til å gjøre egen preferanse til flertall eller Stortingsvedtak.',
    status:'Høy formell og sosial autoritet i komiteen, men legitimiteten avhenger av at mindretall, prosedyre og faktisk votering ikke blir behandlet som dekorasjon rundt lederens ønskede resultat.',
    power_over_player:'Kan styre møteflyt innen reglene, prioritere prosess og påvirke forhandlingsrommet, men kan ikke gi representanten nytt election_or_mandate eller omskrive et manglende flertall.',
    wants:'At komiteen leverer en forståelig og rettidig innstilling som tydelig viser hva flertall og mindretall faktisk står for og hvilke dokumenter behandlingen bygger på.',
    conceals:'At lederansvar og medieforventning kan gjøre det fristende å presentere kompromiss som mer avklart enn det er, særlig når en vanskelig mindretallsmerknad skaper tidsrisiko.',
    speech_style:'Møteledende og avklarende; spør hva som kan landes nå, hva som må protokolleres som uenighet, og hvilken prosedyre som faktisk gjelder neste steg.',
    teaches_player:'At kollegial myndighet ikke er svakere fordi den er delt; den blir legitim nettopp gjennom synlig behandling, uenighet og faktisk flertall.'
  },
  {
    id:'mindretallsrepresentant_forhandlingsmotpart_world',
    social_function:'En mindretallsrepresentant gjør asymmetrisk makt og forhandling synlig ved å teste om flertallet behandler alternative premisser som reelle parlamentariske posisjoner eller bare som kommunikasjonshindre.',
    class_position:'Valgt representant med eget election_or_mandate og full parlamentarisk rett innen prosedyren, men uten kontroll over flertallets stemmer eller partiets interne beslutninger.',
    status:'Situert parlamentarisk standing som kan være høy på tvers av blokkene når argumenter gjengis redelig, avtaler holdes og uenighet ikke forfalskes til enighet.',
    power_over_player:'Kan fremme alternative forslag, skape offentlig kostnad ved svak begrunnelse og gjøre prosedyrefeil synlige, men kan ikke gi eller trekke spillerens mandat utenfor de faktiske demokratiske ordningene.',
    wants:'At forhandlinger bevarer hvilke premisser som endret seg, hva som faktisk ble tilbudt, og hvor uenigheten står dersom kompromiss ikke er mulig.',
    conceals:'At mindretallet også kan ha strategisk gevinst av å la en konflikt leve selv når et teknisk kompromiss er mulig, særlig når offentlig oppmerksomhet øker.',
    speech_style:'Skarp, presis og forhandlingsorientert; tester om motparten kan gjengi kritikken før den avvises, og hva som faktisk flytter posisjonen.',
    teaches_player:'At demokratisk kvalitet også måles i hvordan maktfulle flertall behandler legitim motstand når de kunne ha ignorert den.'
  },
  {
    id:'journalist_offentlig_kontroll_world',
    social_function:'Journalisten kobler parlamentarisk arbeid til offentlig etterprøvbarhet og tester om representanten kan skille faktum, egen vurdering, partiposisjon, komitéinnstilling og faktisk vedtak under tidspress.',
    class_position:'Uavhengig offentlig kontrollaktør uten parlamentarisk mandat, men med betydelig makt til å gjøre inkonsistens, feil eller uklare løfter synlige for velgerne.',
    status:'Høy offentlig troverdighet når spørsmål dokumenteres og korrigeringer håndteres åpent; relasjonen til representanten kan være profesjonell uten å bli lojal.',
    power_over_player:'Kan forsterke feil, stille spørsmål på tvers av partiets foretrukne ramme og holde tidligere utsagn opp mot nye dokumenter, men kan ikke gi Stortingsrepresentanten formell myndighet.',
    wants:'Et presist svar på hva representanten visste når, hva som er vurdering versus dokumentert faktum, hva partiet fremmer og hva Stortinget faktisk har besluttet.',
    conceals:'At nyhetslogikk og tidspress kan favorisere klar konflikt og korte ansvarslinjer selv når parlamentariske prosesser er kollegiale, betingede og dokumentmessig komplekse.',
    speech_style:'Direkte og tidslinjeorientert; spør hva som var kjent, hvilken kilde som støtter utsagnet, hvem som kunne beslutte, og hva som har endret seg siden forrige forklaring.',
    teaches_player:'At offentlig standing ikke kan erstatte mandat, men kan gjøre dårlig sporbarhet og falsk sikkerhet politisk dyrt.'
  },
  {
    id:'privat_relation_partikollega_world',
    social_function:'En nær privat relasjon eller partikollega viser hvordan arbeidspress, fortrolighet, lojalitet og status kan lekke ut av de formelle parlamentariske rommene og inn i hverdagen.',
    class_position:'Privat eller sosialt nær person uten automatisk tilgang til begrenset informasjon, komitémateriale eller beslutningsmakt bare fordi relasjonen er tett eller partipolitisk.',
    status:'Høy personlig betydning som kan divergere kraftig fra profesjonell standing og derfor må holdes adskilt fra tilgang, kildebruk, habilitet og parlamentarisk myndighet.',
    power_over_player:'Kan påvirke trivsel, skam, lojalitet og opplevelsen av støtte eller svik, men kan ikke gi election_or_mandate, gjøre fortrolig informasjon delbar eller endre en votering.',
    wants:'At representanten kan være et menneske uten at hjemmet eller vennskapet blir en uformell kanal for saker, sensitiv informasjon, pressekontakt eller intern partiforhandling.',
    conceals:'At nære relasjoner også kan ha egne politiske interesser og at ønsket om støtte kan gjøre små grenseoverskridelser lettere å rasjonalisere enn de ville vært overfor en fremmed.',
    speech_style:'Hverdagslig og emosjonelt direkte; spør hva som egentlig står på spill, hvorfor noe ikke kan deles, og om samme grense ville gjelde uten vennskap eller partinærhet.',
    teaches_player:'At privat tillit er viktig, men aldri et parlamentarisk credential; sterke relasjoner må tåle at enkelte grenser ikke forhandles.'
  }
];

const slowAxes = [
  ['komiteprosess_og_innstillingsstanding','Om komitémiljøet kan stole på at dokumentversjon, spørsmål, merknader, flertall, mindretall og innstilling holdes adskilt og etterprøvbart.'],
  ['kilde_lov_og_budsjettdokumentasjon_standing','Om fag- og kontrollmiljø kan stole på at påstand, rettsvirkning, budsjettpremiss, usikkerhet og politisk vurdering ikke blandes sammen.'],
  ['horing_og_representasjonsstanding','Om berørte og høringsaktører kan se at tilgang, erfaring, interesse og manglende stemmer håndteres eksplisitt fremfor å reduseres til volum eller nærhet.'],
  ['partigruppe_forhandling_og_dissensstanding','Om partigruppe og forhandlingsmotparter kan stole på at foreløpig posisjon, kompromiss, uenighet og bindende parlamentarisk handling skilles.'],
  ['plenum_forslag_og_voteringsstanding','Om kolleger og offentlighet kan følge forskjellen mellom tale, forslag, stemme, votering og Stortingets faktiske vedtak.'],
  ['fortrolighet_tilgang_og_habilitetsstanding','Om begrenset materiale, tilgang, formål, rollegrenser og mulige interessekonflikter behandles før politisk gevinst.'],
  ['offentlig_begrunnelse_og_korrigerbarhetsstanding','Om presse og velgere får presise begrunnelser som kan korrigeres når dokumenterte premisser endres uten at historikken omskrives.'],
  ['vedtak_oppfolging_og_kontrollstanding','Om senere kontroll kan koble faktisk Stortingsvedtak til gjennomføring, nye fakta, spørsmål og bounded rework uten å forfalske tidligere beslutninger.'],
  ['privat_parti_og_rollegrensestanding','Om privat nærhet, partistatus og intern lojalitet holdes adskilt fra fortrolighet, evidens, habilitet og formell parlamentarisk myndighet.']
].map(([id,meaning]) => ({id,meaning,runtime_binding:'editorial_only_until_governed'}));

const cannotGrantBase = (audience) =>
  `Standing hos ${audience} kan påvirke tone, samarbeid, tilgang til frivillig dialog og hvor lett Stortingsrepresentanten får gehør, men kan ikke gi eller forlenge election_or_mandate, kan ikke erstatte appointment_required, kan ikke gjøre partigruppens standpunkt, en komitémerknad, en høringsfortelling eller representantens egen stemme til Stortingsvedtak, og kan ikke oppheve prosedyre, fortrolighet, tilgang, kildekrav, lov- eller budsjettgrunnlag. History Go og Politikk-badge kan skjerpe spørsmål og historisk forståelse, men er ikke evidens for dagens faktum, gjeldende rett, vedtatt budsjett eller parlamentarisk myndighet. Selv høy sosial tillit kan derfor aldri konverteres til formell makt; demokratisk og juridisk myndighet må fortsatt komme fra det aktive mandatet og korrekt kollegial behandling.`;

const audienceDefs = [
  [AUDIENCES[0],slowAxes[0].id,['korrekt komitéprosess og dokumentversjon','rettferdig behandling av flertall og mindretall']],
  [AUDIENCES[1],slowAxes[3].id,['sporbare forhandlingspremisser','redelig skille mellom lojalitet og faktisk beslutning']],
  [AUDIENCES[2],slowAxes[2].id,['representativ tilgang og presis gjengivelse','synlighet for både erfaring, interesse og manglende stemmer']],
  [AUDIENCES[3],slowAxes[1].id,['kilde, mekanisme og eksplisitt usikkerhet','skille mellom analyse, politikk og vedtatt rett eller budsjett']],
  [AUDIENCES[4],slowAxes[4].id,['korrekt forslag, votering og vedtaksstatus','kollegial myndighet fremfor personlig resultatfortelling']],
  [AUDIENCES[5],slowAxes[6].id,['presise offentlige forklaringer og korrigeringer','sporbar tidslinje mellom utsagn, dokumenter og vedtak']],
  [AUDIENCES[6],slowAxes[8].id,['grenser mellom privat nærhet og parlamentarisk rolle','fravær av uformell tilgang gjennom vennskap eller partistatus']]
];
const audiences = audienceDefs.map(([id,standing_axis,cares_about]) => ({id,standing_axis,cares_about,cannot_grant:cannotGrantBase(id)}));

const days = [
  'En ny sak lander med flere dokumentversjoner og uklar forventning om hva representanten allerede skal mene før komitéfordelingen er helt avklart.',
  'Et populært forslag viser seg å ha uklare lov- og budsjettpremisser; analysen må skille mål, mekanisme, kostnad og faktisk rettsvirkning.',
  'En sterk høringsaktør leverer en overbevisende historie som får stor medieoppmerksomhet, men kildegrunnlaget og interesseposisjonen er ufullstendig.',
  'Høringskartet viser at en berørt gruppe knapt er representert, og fristen gjør det fristende å kalle eksisterende innspill representative nok.',
  'Partigruppen ønsker tidlig binding for å styrke en forhandling mens komitéspørsmål og faglige svar fortsatt står åpne.',
  'Begrenset eller fortrolig informasjon gir ny innsikt, men kan ikke brukes offentlig eller deles videre uten korrekt tilgang og formål.',
  'Sene svar fra fagmiljø eller departement endrer et viktig premiss og tvinger bounded rework uten at tidligere dokumentversjoner skal forsvinne.',
  'Flertall og mindretall forhandler merknader og forslag; en formulering kan skape kompromiss, men også skjule en reell uenighet dersom språket blir for glatt.',
  'Komitéinnstillingen skal ferdigstilles, og spilleren må holde partiets posisjon, egen vurdering, komitétekst og faktisk flertall tydelig adskilt.',
  'Plenum nærmer seg under høyt mediepress; talen skal være politisk tydelig uten å omtale forventet votering som et allerede eksisterende vedtak.',
  'En sen faktakorrigering kommer før votering og tester om offentlig budskap, partiforhandling og forslag kan justeres uten å skjule hva som tidligere ble sagt.',
  'Voteringen gir et resultat som ikke fullt ut samsvarer med spillerens preferanse; representanten må forklare egen stemme og Stortingets kollegiale vedtak separat.',
  'Velgere, høringsaktører og presse reagerer ulikt på resultatet, og stående relasjoner divergerer etter hvem som føler seg hørt, overkjørt eller korrekt informert.',
  'Nye gjennomføringsfakta eller et kontrollspørsmål gjenåpner deler av saken; oppfølging må bruke samme sakslogg uten å omskrive tidligere innstilling, votering eller begrunnelse.'
];
const phaseTypes={morning:'task',lunch:'relationship',afternoon:'decision',evening:'private_consequence'};
const phaseNarrative={
  morning:'Morgenen låser arbeidsobjektet: spilleren må registrere aktivt election_or_mandate, gjeldende dokumentversjon, kilde- og høringsgrunnlag, komitéstatus, partiposisjon, fortrolighetsgrense, ventepunkt og neste legitime handoff før politisk tempo blir behandlet som dokumentasjon.',
  lunch:'Lunsjen gjør den sosiale asymmetrien synlig: den samme handlingen kan styrke standing hos ett publikum og svekke den hos et annet, og spilleren må tåle at representasjon, partilojalitet, faglig kontroll og offentlig forventning ikke kan summeres til én omdømmescore.',
  afternoon:'Ettermiddagen krever et valg mellom handling, venting, forhandling eller eskalering. Spilleren må vise politisk dømmekraft uten å konvertere personlig påvirkning, partidisiplin, sosial tillit eller medietrykk til myndighet som bare korrekt prosedyre og kollegial votering kan gi.',
  evening:'Kvelden viser privat og forsinket kostnad: beslutninger følger representanten ut av møtene gjennom tvil, relasjoner, mediepress og lojalitet, samtidig som fortrolighet, kildegrenser og den dokumenterte saksloggen fortsatt gjelder når ingen formell arena er synlig.'
};
const threadIds=[
  'komite_innstilling_og_prosedyre',
  'kilde_lov_og_budsjett',
  'horing_representasjon_og_tilgang',
  'partigruppe_forhandling_og_dissens',
  'plenum_forslag_votering_og_vedtak',
  'offentlig_begrunnelse_og_tillit',
  'fortrolighet_privatrelation_og_rollegrense'
];
const threadRelationships={
  komite_innstilling_og_prosedyre:'Tråden følger hvordan komitéens dokumentversjoner, spørsmål, merknader, flertall og mindretall langsomt blir til en innstilling uten at prosesskompetanse eller tidsfrist får erstatte den faktiske kollegiale behandlingen. Relasjonen mellom representanten, sekretariatet og komitéledelsen blir stadig mer avhengig av sporbarhet: en effektiv aktør som hopper over statusforskjeller kan kortsiktig virke sterk, men gjør senere uenighet og ansvar vanskeligere å etterprøve.',
  kilde_lov_og_budsjett:'Tråden følger en konflikt mellom politisk ønsket retning og det mer krevende spørsmålet om hva lov, budsjett, kilder og usikkerhet faktisk tillater å hevde. Amir og andre faglige aktører kan styrke eller svekke representantens faglige standing uten å få politisk beslutningsrett. Over flere dager testes om spilleren korrigerer egne premisser når ny evidens kommer, eller bare bruker analyse som dekorasjon rundt en allerede låst konklusjon.',
  horing_representasjon_og_tilgang:'Tråden følger hvem som faktisk blir hørt, hvordan organiserte interesser og erfaringskunnskap blir lest, og hvilke stemmer som forsvinner når tid, språk og institusjonell kapasitet er ulikt fordelt. Leila gjør dette til mer enn et antall høringsinnspill: representasjonen vurderes etter presisjon, interesseforståelse, oppfølging og synlighet for fravær. Ingen gruppe kan gjennom nærhet eller standing kjøpe et bestemt parlamentarisk resultat.',
  partigruppe_forhandling_og_dissens:'Tråden følger hvordan lojalitet, strategi, partidisiplin og intern uenighet påvirker representanten før komité og plenum. Nora kan gjøre konsekvensene av et avvik svært konkrete, men partigruppens sosiale og organisatoriske makt må forbli forskjellig fra election_or_mandate og Stortingets vedtak. Spilleren må lære når tidlig binding er politisk nødvendig, og når den bare skjuler at premissene ennå ikke tåler en konklusjon.',
  plenum_forslag_votering_og_vedtak:'Tråden følger overgangen fra analyse og forhandling til offentlig tale, forslag, votering og et faktisk kollegialt resultat. Den dramaturgiske testen er om spilleren fortsetter å skille hva vedkommende ønsket, hva partiet fremmet, hva komiteen innstilte, hvordan representanten stemte og hva Stortinget til slutt besluttet. Nederlag eller kompromiss skal kunne bæres uten at tidligere posisjoner eller den formelle beslutningen omskrives.',
  offentlig_begrunnelse_og_tillit:'Tråden følger hvordan presse, velgere og berørte miljøer bygger forskjellige vurderinger av representanten. En presis korrigering kan koste ansikt hos ett publikum og styrke tillit hos et annet; en populær formulering kan gjøre det motsatte. Offentlig standing er derfor relasjonell og langsom, ikke en global score. Den kan påvirke fremtidig samtale og politisk troverdighet, men aldri gi mandat, lovgrunnlag eller rett til å love et kollektivt resultat.',
  fortrolighet_privatrelation_og_rollegrense:'Tråden følger hva som skjer når parlamentarisk arbeid beveger seg inn i fortrolige rom, partinære relasjoner og privatliv. Informasjon som ikke kan deles blir en sosial belastning, og vennskap eller lojalitet kan gjøre små grensebrudd fristende. Spilleren må håndtere at enkelte relasjoner svekkes når grenser holdes. Ingen privat støtte, status eller skam kan endre tilgangsregler, evidenskrav, habilitet eller det aktive election_or_mandate.'
};

const phases=['morning','lunch','afternoon','evening'];
const coverage=[];
for(let day=1;day<=14;day++){
  for(let pi=0;pi<phases.length;pi++){
    const phase=phases[pi];
    const idx=(day-1)*4+pi;
    const thread=threadIds[idx%threadIds.length];
    const audience=AUDIENCES[idx%AUDIENCES.length];
    const ref=refs[idx%refs.length];
    const summary=`Dag ${day}, ${phase}: ${days[day-1]} ${phaseNarrative[phase]} Saksloggen ${grammar.persistent_work_object_contract.id} må oppdateres uten å miste tidligere versjon, og waiting/handoff/bounded rework brukes bare der nye fakta faktisk berører saken. Spilleren må eksplisitt skille egen stemme fra partiposisjon, komitémerknad fra innstilling, høringsinnspill fra verifisert faktum og forventet utfall fra Stortingets faktiske vedtak. Dersom et politisk valg krever usikkerhet eller kompromiss, skal det merkes som nettopp det fremfor å låne sikkerhet fra History Go, Politikk-badge, popularitet eller situated reputation. Denne scenen gjør parlamentarisk arbeid til et spørsmål om makt, representasjon, kildeansvar og institusjonell hukommelse: tempo og påvirkning er reelle, men authority boundary forblir hard og korrigerbar.`;
    const standing_consequence=`Standing hos ${audience} kan endres på dag ${day}/${phase} fordi dette publikummet vurderer andre sider av den samme parlamentariske handlingen enn de øvrige. Reaksjonen kan påvirke senere tone, tillit, vilje til dialog og hvor hardt feil blir lest, men den kan aldri gi Stortingsrepresentanten election_or_mandate, erstatte appointment_required, gjøre en partiposisjon eller komitémerknad til Stortingsvedtak, oppheve fortrolighet eller fungere som evidens for lov, budsjett eller faktum.`;
    coverage.push({day,phase,beat_type:phaseTypes[phase],summary,thread_ids:[thread],materialization_refs:[ref],standing_audience:audience,standing_consequence});
  }
}
const primaryThreads=threadIds.map(id=>({
  id,
  relationship:threadRelationships[id],
  beat_refs:coverage.filter(b=>b.thread_ids.includes(id)).map(b=>`${b.day}/${b.phase}`)
}));

const privateAftermath = [
  ['mandat_og_identitet','Etter en synlig debatt merker representanten hvor lett personlig verdi kan blandes med rollen som valgt aktør. En god dag i offentligheten føles som bekreftelse, mens kritikk kan kjennes som tap av mandat selv om election_or_mandate er uendret. Etterspillet lærer spilleren å skille emosjonell standing fra formell demokratisk legitimitet og å bruke saksloggen fremfor selvtillit som bevis på hva som faktisk ble sagt, fremmet og besluttet.'],
  ['fortrolighet_hjemme','Et begrenset dokument følger representanten mentalt hjem, men kan ikke følge med inn i en privat samtale. En nær person opplever avstanden som mangel på tillit. Etterspillet gjør fortrolighet sosialt kostbart uten å gjøre brudd forståelig som en legitim løsning: privat nærhet kan få sin egen standingkonsekvens, mens tilgang og formål forblir bundet til parlamentarisk regelverk og dokumentert behov.'],
  ['partilojalitet_og_tvil','Et kompromiss i partigruppen har løst en taktisk konflikt, men spilleren er usikker på om premissene faktisk ble gode nok. Kvelden gjør partidisiplin til et ekte relasjonelt press snarere enn en enkel regel. Spilleren kan kjenne lojalitet, frykt for statusfall og ansvar overfor velgere samtidig, men må neste dag fortsatt møte dokumentene, komitéprosessen og egen stemme som separate kilder til ansvar.'],
  ['offentlig_korrigering','En faktakorrigering blir synlig i media og oppleves som et personlig nederlag selv om den faglig sett forbedrer saken. Etterspillet lar skam og omdømme få realitet uten global score: enkelte velgere kan miste tillit fordi utsagnet var feil, mens fagmiljø og journalister kan styrke sin vurdering fordi feilen faktisk ble rettet og tidligere versjon ikke ble skjult.'],
  ['horing_og_ansikt','En berørt gruppe mener den ble hørt for sent, mens andre mener representanten allerede har gitt den for mye plass. Spilleren kan ikke løse dette ved å maksimere én publikumsreaksjon. Etterspillet viser at representasjon innebærer ulige behov, ulike ressurser og motstridende erfaringer, og at legitim stående relasjon bygges gjennom sporbar behandling fremfor løfte om ønsket resultat.'],
  ['votering_og_nederlag','Stortingets faktiske vedtak går mot spillerens foretrukne løsning. Privat kan nederlaget friste til å fortelle saken som om prosedyren eller de andre aktørene var illegitime. Etterspillet krever i stedet at spilleren skiller egen stemme, partiets forslag, komitéinnstilling og kollektivt vedtak. Å tåle et legitimt nederlag blir en del av profesjonell kultur og demokratisk standing.'],
  ['rolle_og_vennskap','En partikollega eller venn ønsker en uformell forklaring på en sak som fortsatt har begrenset materiale. Å si nei kan svekke den private relasjonen, men å dele kan skade fortrolighet og institusjonell tillit. Etterspillet viser hvorfor samme menneske kan ha høy standing privat og lavere profesjonelt, eller omvendt, uten at noen av delene kan summeres til en rettighet eller et mandat.']
].map(([id,description],i)=>({id,description,materialization_refs:[refs[(i*2)%refs.length]]}));

const delayedConsequences = [
  ['tidlig_partibinding','1/afternoon','5/lunch',['partigruppe','komite']],
  ['manglende_horingsstemme','3/lunch','13/lunch',['representasjon','offentlighet']],
  ['budsjettpremiss','2/morning','7/afternoon',['budsjett','kildekritikk']],
  ['fortrolig_grense','6/evening','10/lunch',['fortrolighet','presse']],
  ['kompromissformulering','8/afternoon','12/morning',['forhandling','votering']],
  ['sen_faktakorrigering','10/evening','11/afternoon',['offentlighet','evidens']],
  ['voteringsresultat','12/afternoon','13/evening',['vedtak','velgertillit']],
  ['oppfolgingsfunn','9/evening','14/afternoon',['kontroll','institusjonell_hukommelse']]
].map(([id,setup_ref,return_ref,domains])=>({id,setup_ref,return_ref,domains}));

const world = {
  schema:'civication_role_world_v1',
  version:1,
  category:CATEGORY,
  role_scope:ROLE,
  title:'Politikk / Parlamentarisk arbeid — representasjon, kollegial myndighet og situert standing',
  status:'role_world_complete',
  sociological_core:{
    main_problem:'Hvordan kan en Stortingsrepresentant bruke reell politisk innflytelse gjennom komité, høring, partigruppe, forhandling, plenum og offentlighet uten at sosial standing, partipress eller personlig overbevisning blir forvekslet med election_or_mandate eller Stortingets kollegiale myndighet?',
    description:`Role World-en authorer bare situated_reputation rundt den allerede komplette parlamentariske prerequisite-grunnmuren. Stortingsrepresentant forblir appointment_required med election_or_mandate; 16-stegs plan, fire fiktive scenarioaktører, fire parlamentariske arbeidsflater, begge canonical work loops, ${grammar.persistent_work_object_contract.id}, waiting/handoff/rework og authority boundary beholdes uendret. Standing er publikums- og relasjonsspesifikk og kan aldri bli mandat, lov, budsjett, fortrolighetstilgang, evidens, komitéinnstilling eller Stortingsvedtak.`
  },
  theme_ids:THEMES,
  social_environments:socialEnvironments,
  recurring_people_archetypes:archetypes,
  slow_axes:slowAxes,
  situated_reputation_model:{
    global_score_allowed:false,
    audiences,
    divergence_examples:[
      'En presis utsettelse for å hente lov- og budsjettgrunnlag kan svekke standing i partigruppen som vil ha tempo, men styrke faglig og komitémessig tillit.',
      'Å gi en underrepresentert høringsaktør mer plass kan irritere etablerte lobbyaktører samtidig som berørte grupper opplever prosessen som mer legitim.',
      'En åpen korrigering av feil faktum kan koste kortsiktig medieautoritet og samtidig styrke standing hos journalister og fagmiljø fordi historikken ikke skjules.',
      'Et lojalt kompromiss i partigruppen kan styrke intern standing og svekke tillit hos velgere som forventet den opprinnelige posisjonen, uten at election_or_mandate endres.',
      'Å nekte å bruke fortrolig informasjon i offentlig argumentasjon kan gjøre en debatt mindre slagkraftig og samtidig styrke institusjonell tillit hos prosess- og kontrollmiljø.',
      'Å protokollere en reell mindretallsuenighet kan gjøre flertallets kommunikasjon mindre glatt og samtidig styrke parlamentarisk standing på tvers av blokkene.',
      'Et legitimt tap i votering kan svekke status hos aktivister som krevde resultat og styrke demokratisk troverdighet når representanten forklarer forskjellen mellom påvirkning og vedtak.',
      'Å si nei til en partikollegas uformelle tilgang kan skape privat friksjon og samtidig styrke profesjonell standing fordi samme fortrolighetsgrense gjelder uavhengig av nærhet.'
    ],
    authority_separation:'Det finnes ingen global reputation-score som kan skape parlamentarisk myndighet. Stortingsrepresentant er appointment_required, og election_or_mandate må være dokumentert og aktivt; høy standing hos komité, partigruppe, velgere, fagmiljø, presse, plenum eller private relasjoner kan ikke forlenge mandatet, gjøre en personlig stemme til kollegialt vedtak, gjøre partigruppens posisjon til komitéinnstilling, omgå fortrolighet eller erstatte evidens, lovtekst eller budsjettgrunnlag. History Go og Politikk-badge kan gjøre spørsmål og historisk forståelse bedre, men kan aldri materialisere election_or_mandate eller Stortingsvedtak. Sosial tillit kan derfor divergere mellom publikum og skal aldri summeres til én myndighetsscore.'
  },
  existing_work_continuity:{
    new_runtime_state:false,
    work_loops:grammar.work_loops,
    persistent_work_object:grammar.persistent_work_object_contract.id,
    waiting_states:grammar.rhythm_contract.waiting_states,
    handoff_rule:grammar.persistent_work_object_contract.handoff_rule,
    rework_rule:grammar.rhythm_contract.rework_rule
  },
  history_go_affordance:{
    badge_id:'politikk',
    source_ref:refs.find(r=>r.includes('/knowledge/')) || refs[0],
    better_question:'History Go skal gjøre spilleren bedre til å spørre hvordan parlamentarisk makt faktisk blir produsert, begrenset og etterprøvbar over tid: Hvem hadde election_or_mandate, hvilket organ kunne beslutte, hvilke dokumenter og versjoner lå på bordet, hvem ble hørt og hvem manglet, hvilke interesser og kilder bar påstandene, hvordan ble lov- og budsjettvirkning forstått, hva var partiposisjon eller forhandlingsrom, og hva ble til slutt komitéinnstilling, votering og faktisk Stortingsvedtak? Historisk kunnskap om representasjon, parlamentarisme, lovgivning, budsjettmakt, rettighetskamper og institusjonelle konflikter kan hjelpe representanten å se analogier, maktasymmetrier og spørsmål som ellers ville blitt oversett. Men læringskunnskap må alltid brukes til å stille bedre spørsmål til dagens autoritative kilder, ikke som snarvei forbi dem. En historisk parallell kan vise hva som bør undersøkes; den kan ikke fastslå dagens rett, finansiering, prosedyre, fortrolighet eller faktiske politiske flertall.',
    authority_boundary:'History Go og Politikk-badge kan ikke gi eller forlenge election_or_mandate, oppheve appointment_required, erstatte aktuell lovtekst, budsjettgrunnlag, komitédokumenter eller parlamentarisk saksutredning, omgå fortrolighet eller tilgang, gjøre partigruppens standpunkt til komitéinnstilling, eller gjøre representantens forslag, tale eller stemme til Stortingsvedtak. Dagens myndighet og evidens må komme fra aktive demokratiske og parlamentariske spor.'
  },
  cross_role_proof:{
    required_for_rollout:false,
    shared_work_object_found:false,
    new_runtime:false,
    status:'not_required_for_rollout',
    rule:'Ingen cross-role-link materialiseres fordi Parlamentarisk arbeid kan lukkes på sitt eget versjonerte parlamentariske saksobjekt. Tematisk nærhet til rådgivning, regjering eller kommunal ledelse er ikke bevis på et genuint shared work-object med canonical runtime-eierskap.'
  },
  season:{days:14,day_phases:phases,coverage},
  primary_threads:primaryThreads,
  private_aftermath:privateAftermath,
  delayed_consequences:delayedConsequences,
  materialization:{
    authored_dimensions:['situated_reputation'],
    no_new_runtime:true,
    existing_plan_preserved:true,
    existing_role_model_preserved:true,
    existing_people_foundation_preserved:true,
    existing_work_grammar_preserved:true,
    existing_persistent_work_preserved:true,
    existing_rhythm_preserved:true,
    career_title_gates_preserved:true,
    cross_role_link_materialized:false,
    source_refs:refs
  }
};
writeJson(WORLD, world);

const index=read('data/Civication/roleWorlds/index.json');
index.roles=(index.roles||[]).filter(r=>!(r.category===CATEGORY&&r.role_scope===ROLE));
index.roles.push({category:CATEGORY,role_scope:ROLE,status:'role_world_complete',path:WORLD});
index.status=`${index.roles.length}_role_worlds_materialized`;
index.effective_date='2026-09-07';
writeJson('data/Civication/roleWorlds/index.json',index);

const checklist=read('data/Civication/roleWorldAuthoringChecklist.json');
checklist.reference_worlds=[...(checklist.reference_worlds||[]).filter(p=>p!==WORLD),WORLD];
writeJson('data/Civication/roleWorldAuthoringChecklist.json',checklist);

const bank=read('data/Civication/roleWorldThemeBank.json');
bank.reference_profiles ||= {};
bank.reference_profiles[KEY]=THEMES;
writeJson('data/Civication/roleWorldThemeBank.json',bank);

const source = `# Politikk / Parlamentarisk arbeid — Role World rollout source-first

## Scope lock

- Scope is exactly \`${KEY}\`.
- Stortingsrepresentant remains **appointment_required** with **election_or_mandate**. No badge, XP, situated reputation, History Go knowledge, party status or popularity can create or replace the mandate.
- This rollout authors **situated_reputation** only around the already complete prerequisite foundation.
- **No global reputation score** is introduced.
- **No new runtime** is introduced; the existing Scene Pipeline remains canonical.
- Cross-role status remains **not_required_for_rollout** and **no cross-role link** is materialized.

## Preserved prerequisite foundation

The rollout reuses the existing role model, four fictional scenario actors, four parliamentary work surfaces, two canonical work loops, the persistent parliamentary case log, seven waiting states, handoff rule, bounded rework rule and the 16-step workday plan without changing their authority semantics.

All **15 canonical** role-specific source mails across the nine mail types remain the provenance set for the season. Mail remains delivery/evidence for authored scenes, never a parallel gameplay runtime.

## Editorial uniqueness

This Role World is written specifically for parliamentary work: committee procedure, hearings and representational asymmetry, law and budget evidence, party-group discipline and negotiation, confidentiality and access, plenary proposals and voting, public justification, democratic defeat, delayed control and the distinction between personal influence and collective Storting authority. Reference-world structure is reused; reference-world content is not copied.

The season is **14 days × 4 phases = 56** unique beats. Each beat binds to one of the 15 canonical mail references, all source mails recur at least three times, and seven primary threads carry consequences across multiple days.

## Situated standing

Standing is audience-specific across committee/procedure, party-group negotiation, hearings and affected groups, law/budget evidence, plenary/collective authority, press/public accountability and private/party boundaries. These standings may diverge. A choice can improve trust with one audience and damage it with another.

Standing can shape tone, cooperation and social interpretation, but never election_or_mandate, appointment_required, law, budget, confidentiality access, evidentiary status, committee recommendation or Storting decision. No audience reaction is a credential.

## History Go boundary

History Go and the Politikk badge may improve historical/institutional questions about Parliament, representation, legislation, budget power and democratic conflict. They cannot replace current source documents, law, budget evidence, committee material, confidentiality controls, election_or_mandate, voting or the actual Storting decision.

## Closure contract

A valid closure must pass the dedicated Parliamentary Role World test, the global Role World contract, Career Gameplay Matrix, rollout readiness, full Civication suite, job learning/knowledge audits, Scene Registry, Scenario People, exact permanent scope and diff hygiene. The permanent package is exactly the Role World plus the canonical index/checklist/theme/readiness/career surfaces, one source-first report and one dedicated test.
`;
writeText(SOURCE,source);

const test = `const assert=require('node:assert/strict');
const fs=require('node:fs'); const path=require('node:path');
const ROOT=path.resolve(__dirname,'..'); const read=rel=>JSON.parse(fs.readFileSync(path.join(ROOT,rel),'utf8')); const text=rel=>fs.readFileSync(path.join(ROOT,rel),'utf8'); const exists=rel=>fs.existsSync(path.join(ROOT,rel));
const CATEGORY='politikk', ROLE='politikk_parlamentarisk_arbeid', KEY=CATEGORY+'/'+ROLE;
const WORLD='data/Civication/roleWorlds/politikk/politikk_parlamentarisk_arbeid.json', MODEL='data/Civication/roleModels/politikk/politikk_parlamentarisk_arbeid.json', GRAMMAR='data/Civication/workGrammars/politikk/politikk_parlamentarisk_arbeid.json', PLAN='data/Civication/mailPlans/politikk/politikk_parlamentarisk_arbeid_plan.json', SOURCE='reports/CIVICATION_POLITIKK_PARLAMENTARISK_ARBEID_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md';
const TYPES=['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const PERSISTENT='parlamentarisk_sakslogg_dokument_horing_innstilling_plenum_og_oppfolging';
const LOOPS=['sak -> dokumenter -> komité -> høring -> analyse -> forhandling -> innstilling -> plenum -> vedtak -> oppfølging','påstand eller krav -> kilde og interesse -> konsekvens -> partivurdering -> parlamentarisk handling -> offentlig begrunnelse -> senere kontroll'];
const WAITING=['horing_og_skriftlige_innspill','departement_eller_faglige_svar','lov_og_budsjettavklaring','komitemote_og_innstilling','partigruppe_og_forhandling','plenum_og_votering','oppfolging_nye_fakta_eller_kontroll'];
const POLICY={'Stortingsrepresentant':{policy:'appointment_required',qualification_ids:['election_or_mandate']}};
const THEMES=["professional_culture","bureaucratic_power","loyalty_up_down","shame_reputation","public_attention","status_anxiety","public_private_leakage","class_power","local_knowledge_vs_system"];
const AUDIENCES=["komiteledelse_medlemmer_og_parlamentarisk_sekretariat","partigruppe_og_parlamentariske_forhandlingsmotparter","horing_velgere_og_berorte_samfunnsaktorer","lov_budsjett_kilder_og_faglig_kontroll","plenum_presidium_og_kollegialt_storting","presse_offentlighet_og_demokratisk_etterprovbarhet","private_relations_partilojalitet_og_rollegrenser"];
const catalogPath=type=>'data/Civication/mailFamilies/'+CATEGORY+'/'+type+'/'+ROLE+'_'+type+'.json';
const refs=TYPES.flatMap(type=>{const d=read(catalogPath(type));return (d.families||[]).flatMap(f=>(f.mails||[]).map(m=>catalogPath(type)+'#'+m.id));});
for(const rel of [WORLD,MODEL,GRAMMAR,PLAN,SOURCE]) assert.ok(exists(rel),rel+' missing');
const world=read(WORLD),model=read(MODEL),grammar=read(GRAMMAR),plan=read(PLAN);
assert.equal(world.schema,'civication_role_world_v1'); assert.equal(world.version,1); assert.equal(world.category,CATEGORY); assert.equal(world.role_scope,ROLE); assert.equal(world.status,'role_world_complete'); assert.deepEqual(world.theme_ids,THEMES);
assert.equal(plan.sequence.length,16); assert.equal(grammar.schema,'civication_work_grammar_v2'); assert.equal(grammar.version,2); assert.deepEqual(grammar.work_loops,LOOPS); assert.equal(grammar.persistent_work_object_contract.id,PERSISTENT); assert.deepEqual(grammar.rhythm_contract.waiting_states,WAITING); assert.deepEqual(grammar.day_one_contract.entry_policy_by_title,POLICY);
assert.equal(model.related_people.length,4); for(const p of model.related_people){assert.equal(p.fictional,true);assert.equal(p.fictional_scenario_actor,true);assert.equal(p.canonical_person_ref,null);}
assert.equal(refs.length,15); assert.equal(new Set(refs).size,15);
assert.deepEqual(world.materialization.authored_dimensions,['situated_reputation']); for(const key of ['no_new_runtime','existing_plan_preserved','existing_role_model_preserved','existing_people_foundation_preserved','existing_work_grammar_preserved','existing_persistent_work_preserved','existing_rhythm_preserved','career_title_gates_preserved'])assert.equal(world.materialization[key],true,key); assert.equal(world.materialization.cross_role_link_materialized,false); assert.deepEqual(world.materialization.source_refs,refs);
assert.equal(world.existing_work_continuity.new_runtime_state,false); assert.deepEqual(world.existing_work_continuity.work_loops,LOOPS); assert.equal(world.existing_work_continuity.persistent_work_object,PERSISTENT); assert.deepEqual(world.existing_work_continuity.waiting_states,WAITING); assert.equal(world.existing_work_continuity.handoff_rule,grammar.persistent_work_object_contract.handoff_rule); assert.equal(world.existing_work_continuity.rework_rule,grammar.rhythm_contract.rework_rule);
const bank=read('data/Civication/roleWorldThemeBank.json'); const valid=new Set(bank.themes.map(x=>x.id)); for(const id of THEMES)assert.ok(valid.has(id),id); assert.deepEqual(bank.reference_profiles[KEY],THEMES);
assert.equal(world.situated_reputation_model.global_score_allowed,false); assert.deepEqual(world.situated_reputation_model.audiences.map(a=>a.id),AUDIENCES); assert.equal(new Set(world.situated_reputation_model.audiences.map(a=>a.standing_axis)).size,AUDIENCES.length);
for(const a of world.situated_reputation_model.audiences){assert.equal(a.cares_about.length,2,a.id);assert.ok(a.cannot_grant.length>=420,a.id+'/'+a.cannot_grant.length);for(const term of [/kan ikke/i,/Stortingsrepresentant/i,/election_or_mandate/i,/appointment_required/i,/History Go/i,/Politikk-badge/i,/evidens/i,/Stortingsvedtak|komité|myndighet/i])assert.match(a.cannot_grant,term,a.id+'/'+term);}
assert.ok(world.situated_reputation_model.divergence_examples.length>=8); for(const term of [/global/i,/Stortingsrepresentant/i,/appointment_required/i,/election_or_mandate/i,/komité/i,/kollegial/i,/History Go/i,/Politikk-badge/i])assert.match(world.situated_reputation_model.authority_separation,term);
assert.equal(world.slow_axes.length,9); assert.equal(new Set(world.slow_axes.map(a=>a.id)).size,9); for(const a of world.slow_axes)assert.equal(a.runtime_binding,'editorial_only_until_governed'); assert.ok(world.social_environments.length>=8); assert.equal(world.recurring_people_archetypes.length,8); for(const p of world.recurring_people_archetypes)for(const f of ['id','social_function','class_position','status','power_over_player','wants','conceals','speech_style','teaches_player'])assert.ok(String(p[f]||'').trim(),p.id+'/'+f);
assert.equal(world.history_go_affordance.badge_id,'politikk'); assert.ok(refs.includes(world.history_go_affordance.source_ref)); assert.ok(world.history_go_affordance.better_question.length>=700); for(const term of [/kan ikke/i,/election_or_mandate/i,/saksutredning/i,/lovtekst/i,/budsjettgrunnlag/i,/fortrolighet/i,/Stortingsvedtak/i])assert.match(world.history_go_affordance.authority_boundary,term);
assert.equal(world.cross_role_proof.required_for_rollout,false); assert.equal(world.cross_role_proof.shared_work_object_found,false); assert.equal(world.cross_role_proof.new_runtime,false); assert.equal(world.cross_role_proof.status,'not_required_for_rollout'); assert.match(world.cross_role_proof.rule,/Ingen cross-role-link/i);
assert.equal(world.season.days,14); assert.deepEqual(world.season.day_phases,['morning','lunch','afternoon','evening']); assert.equal(world.season.coverage.length,56); const beatKeys=new Set(world.season.coverage.map(b=>b.day+'/'+b.phase)); assert.equal(beatKeys.size,56); assert.equal(new Set(world.season.coverage.map(b=>b.summary)).size,56);
const phaseTypes={morning:'task',lunch:'relationship',afternoon:'decision',evening:'private_consequence'}; const use=new Map(refs.map(r=>[r,0])); for(let d=1;d<=14;d++)for(const p of world.season.day_phases)assert.ok(beatKeys.has(d+'/'+p));
for(const b of world.season.coverage){assert.equal(b.beat_type,phaseTypes[b.phase]);assert.ok(b.summary.length>=650,b.day+'/'+b.phase+' summary='+b.summary.length);assert.ok(AUDIENCES.includes(b.standing_audience));assert.ok(b.standing_consequence.length>=300,b.day+'/'+b.phase+' standing='+b.standing_consequence.length);assert.equal(b.materialization_refs.length,1);const r=b.materialization_refs[0];assert.ok(refs.includes(r));use.set(r,use.get(r)+1);} for(const [r,c]of use)assert.ok(c>=3,r+' underused='+c);
assert.equal(world.primary_threads.length,7); for(const th of world.primary_threads){assert.ok(th.relationship.length>=350,th.id);assert.ok(th.beat_refs.length>=5&&th.beat_refs.length<=10,th.id);assert.ok(new Set(th.beat_refs.map(r=>r.split('/')[0])).size>=2,th.id);for(const r of th.beat_refs){assert.ok(beatKeys.has(r),r);const b=world.season.coverage.find(x=>x.day+'/'+x.phase===r);assert.ok((b.thread_ids||[]).includes(th.id),th.id+'/'+r);}}
assert.ok(world.private_aftermath.length>=6); for(const a of world.private_aftermath){assert.ok(a.description.length>=350,a.id+'/'+a.description.length);for(const r of a.materialization_refs)assert.ok(refs.includes(r));} assert.ok(world.delayed_consequences.length>=8); const ord=r=>{const[d,p]=r.split('/');return Number(d)*10+({morning:1,lunch:2,afternoon:3,evening:4}[p]||0);}; for(const d of world.delayed_consequences){assert.ok(beatKeys.has(d.setup_ref));assert.ok(beatKeys.has(d.return_ref));assert.ok(ord(d.return_ref)>ord(d.setup_ref),d.id);assert.ok(d.domains.length>=2,d.id);}
const index=read('data/Civication/roleWorlds/index.json'); const rows=index.roles.filter(r=>r.category===CATEGORY&&r.role_scope===ROLE); assert.equal(rows.length,1); assert.deepEqual(rows[0],{category:CATEGORY,role_scope:ROLE,status:'role_world_complete',path:WORLD}); assert.match(index.status,/_role_worlds_materialized$/); const checklist=read('data/Civication/roleWorldAuthoringChecklist.json'); assert.equal(checklist.reference_worlds.filter(x=>x===WORLD).length,1);
const readiness=read('data/Civication/roleWorldRolloutReadiness.json'); const ready=readiness.roles.find(r=>r.key===KEY); assert.ok(ready); assert.equal(ready.classification,'rollout_ready'); assert.equal(ready.role_world_status,'role_world_complete'); assert.equal(ready.already_reference_or_pilot,true); assert.deepEqual(ready.authored_work_required,[]); assert.ok(!(readiness.rollout_queue||[]).some(r=>r.key===KEY)); assert.ok(readiness.summary.role_world_complete_or_pilot>=72); assert.ok(readiness.summary.rollout_queue_roles<=13); assert.equal(readiness.gate.gate_pass,true); assert.equal(readiness.gate.broad_rollout_allowed_now,true); assert.equal(ready.cross_role.need,'not_required_for_rollout');
const career=read('data/Civication/careerGameplayMatrix.json').worlds.find(r=>r.key===KEY); assert.equal(career.status,'playable'); assert.equal(career.audit.runtime_gate,true); assert.deepEqual(career.audit.missing_components,[]); const policies=Object.fromEntries(career.audit.salary.rows.map(r=>[r.title,r.offer_policy])); assert.equal(policies['Stortingsrepresentant'],'appointment_required');
const scenario=read('data/Civication/scenarioPeople/generated/politikk.json'); const factual=new Set(Object.values(scenario.people_pool||{}).flat().map(p=>p.person_id)); for(const p of model.related_people)assert.ok(!factual.has(p.id),p.id+' leaked into factual people pool');
const source=text(SOURCE); for(const term of [/Scope lock/i,/Stortingsrepresentant.*appointment_required/i,/election_or_mandate/i,/situated_reputation/i,/No global reputation score/i,/not_required_for_rollout/i,/no cross-role link/i,/History Go/i,/No new runtime/i,/Editorial uniqueness/i,/15 canonical/i,/14 days.*4 phases.*56/i])assert.match(source,term);
console.log('Civication Politikk Parlamentarisk arbeid Role World rollout: OK');
`;
writeText(TEST,test);

console.log(`Materialized ${ROLE} Role World: ${coverage.length} beats, ${refs.length} source refs, ${primaryThreads.length} primary threads.`);
