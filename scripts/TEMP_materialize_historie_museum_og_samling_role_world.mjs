import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const write = (rel, value) => {
  const target = path.join(root, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const writeText = (rel, value) => {
  const target = path.join(root, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, value.endsWith('\n') ? value : `${value}\n`);
};
const must = (condition, message) => { if (!condition) throw new Error(`PRECHECK: ${message}`); };

const CATEGORY = 'historie';
const ROLE = 'historie_museum_og_samling';
const KEY = `${CATEGORY}/${ROLE}`;
const WORLD = `data/Civication/roleWorlds/${CATEGORY}/${ROLE}.json`;
const PLAN = `data/Civication/mailPlans/${CATEGORY}/${ROLE}_plan.json`;
const MODEL = `data/Civication/roleModels/${CATEGORY}/${ROLE}.json`;
const GRAMMAR = `data/Civication/workGrammars/${CATEGORY}/${ROLE}.json`;
const INDEX = 'data/Civication/roleWorlds/index.json';
const CHECKLIST = 'data/Civication/roleWorldAuthoringChecklist.json';
const THEMEBANK = 'data/Civication/roleWorldThemeBank.json';
const SOURCE = 'reports/CIVICATION_HISTORIE_MUSEUM_OG_SAMLING_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md';
const TYPES = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const catalogPath = (type) => `data/Civication/mailFamilies/${CATEGORY}/${type}/${ROLE}_${type}.json`;

must(!fs.existsSync(path.join(root, WORLD)), `${WORLD} already exists`);
must(fs.existsSync(path.join(root, MODEL)), `${MODEL} missing`);
must(fs.existsSync(path.join(root, GRAMMAR)), `${GRAMMAR} missing`);
must(fs.existsSync(path.join(root, PLAN)), `${PLAN} missing`);

const model = read(MODEL);
const grammar = read(GRAMMAR);
const plan = read(PLAN);
const index = read(INDEX);
const checklist = read(CHECKLIST);
const themeBank = read(THEMEBANK);

must(model.schema === 'civication_role_model_v2' && model.role_scope === ROLE, 'role model identity drifted');
must(grammar.schema === 'civication_work_grammar_v2' && grammar.role_scope === ROLE, 'work grammar identity drifted');
must(plan.sequence?.length === 16, 'prerequisite plan must remain 16 steps');
must(grammar.persistent_work_object_contract?.id === 'samlingsobjekt_proveniens_tilstands_og_tiltakslogg', 'persistent work object drifted');
must(JSON.stringify(grammar.work_loops) === JSON.stringify([
  'objekt -> proveniens -> tilstand -> fagvurdering -> tiltak -> dokumentasjon -> formidling',
  'tema -> kilder -> utvalg -> fortolkning -> utstilling -> publikumsrespons -> revisjon'
]), 'museum work loops drifted');
must(JSON.stringify(grammar.authority_boundary) === JSON.stringify({
  may:['forvalte og formidle samlinger innen faglig mandat'],
  may_not:['skjule inngrep','ignorere proveniensproblemer','utføre behandling uten kompetanse','presentere kuratorisk tolkning som ubestridt kildefakta']
}), 'authority boundary drifted');
must(grammar.day_one_contract?.entry === 'career_offer_policy_by_title', 'title-owned entry policy drifted');
must(grammar.day_one_contract?.entry_policy_by_title?.Konservator?.policy === 'qualification_required', 'Konservator gate drifted');
must(grammar.day_one_contract?.entry_policy_by_title?.['Senior konservator']?.policy === 'qualification_required', 'Senior konservator gate drifted');
must(grammar.day_one_contract?.entry_policy_by_title?.Kurator?.policy === 'direct', 'Kurator gate drifted');
must(grammar.day_one_contract?.entry_policy_by_title?.['Senior kurator']?.policy === 'direct', 'Senior kurator gate drifted');
must((model.related_people || []).length === 4, 'expected four prerequisite scenario actors');
must(!index.roles.some((entry) => entry.category === CATEGORY && entry.role_scope === ROLE), 'Role World already registered');
must(!checklist.reference_worlds.includes(WORLD), 'Role World already in authoring checklist');
must(!themeBank.reference_profiles?.[KEY], 'Role World theme profile already exists');

const canonicalRefs = TYPES.flatMap((type) => {
  const doc = read(catalogPath(type));
  return (doc.families || []).flatMap((family) => (family.mails || []).map((mail) => `${catalogPath(type)}#${mail.id}`));
});
must(canonicalRefs.length === 15 && new Set(canonicalRefs).size === 15, 'expected exactly 15 unique prerequisite mail refs');
const knowledgeRef = canonicalRefs.find((ref) => ref.includes('/knowledge/'));
must(knowledgeRef, 'knowledge provenance ref missing');

const themeIds = [
  'professional_culture',
  'class_power',
  'status_anxiety',
  'bureaucratic_power',
  'care_vs_efficiency',
  'invisible_work',
  'shame_reputation',
  'public_private_leakage',
  'public_attention'
];
const validThemeIds = new Set(themeBank.themes.map((entry) => entry.id));
for (const id of themeIds) must(validThemeIds.has(id), `unknown theme ${id}`);

const audiences = [
  {
    id:'conservation_profession',
    standing_axis:'material_stewardship_and_traceable_intervention',
    cares_about:['at tilstand, miljø, kompetanse og tidligere inngrep er synlige før håndtering eller visning','at reversibilitet, dokumentasjon og stoppgrense veier tyngre enn utstillingsprestisje'],
    cannot_grant:'Konserveringsmiljøets standing kan påvirke hvor tidlig fysisk risiko meldes og hvor mye faglig tillit spilleren får, men den kan ikke gi manglende qualification_required-kompetanse, kan ikke avgjøre eierskap eller tilbakeføring og kan ikke gjøre et ønsket behandlingsresultat til dokumentert tilstand eller historisk evidens.'
  },
  {
    id:'curatorial_and_research_team',
    standing_axis:'interpretive_rigor_and_visible_uncertainty',
    cares_about:['at kildebelagte opplysninger, kuratorisk tolkning og usikkerhet holdes adskilt','at en sterk publikumsfortelling tåler motkilder, fravær og faglig uenighet'],
    cannot_grant:'Kuratorisk standing kan gi innflytelse over utvalg og formidlingsarbeid innen mandat, men kan ikke gi behandlingskompetanse, kan ikke autentisere proveniens, kan ikke overstyre rettigheter eller restitusjonsprosess og kan ikke gjøre en populær eller elegant tolkning til objektets ubestridte egen stemme.'
  },
  {
    id:'registration_and_provenance_stewards',
    standing_axis:'provenance_legibility_and_record_integrity',
    cares_about:['at objektidentitet, accession, eierskapshistorikk og hull i dokumentasjonen kan rekonstrueres','at ny dokumentasjon korrigerer bare berørte felt uten å slette tidligere versjoner'],
    cannot_grant:'Registrar- og proveniensstanding kan styrke sporbarhet og stoppe ubegrunnet sikkerhet, men kan ikke alene fastslå juridisk eierskap, avgjøre tilbakeføring, gi kuratorisk eller konserveringsfaglig fullmakt eller gjøre registreringsstatus til moralsk, juridisk eller historiefaglig fasit.'
  },
  {
    id:'affected_communities_and_source_holders',
    standing_axis:'representation_reciprocity_and_documented_voice',
    cares_about:['at berørte miljøer blir invitert før fortellingen er reelt låst','at uenighet, kildeeierskap og representasjonskritikk dokumenteres uten å bli redusert til publikumsreaksjon'],
    cannot_grant:'Standing hos berørte miljøer og kildeholdere kan endre institusjonens kunnskapsgrunnlag og legitimitet, men kan ikke automatisk gi eller fjerne juridisk eierskap, kan ikke alene autorisere behandling eller restitusjon og kan ikke gjøre konsultasjon til enten veto eller ferdig historisk evidens.'
  },
  {
    id:'lenders_rightsholders_and_formal_governance',
    standing_axis:'mandate_rights_and_commitment_discipline',
    cares_about:['at lån, rettigheter, forsikring, avtaler og formell beslutning er avklart før løfter gis','at kuratorisk eller offentlig press ikke brukes til å omgå eierskap, lisens eller institusjonelt mandat'],
    cannot_grant:'Långivere, rettighetshavere og styringsorganer kan gi bestemte samtykker eller rammer der avtale og lov åpner for det, men standing hos dem kan ikke gi generell delegasjon, kan ikke skape budsjett uten vedtak og kan ikke autentisere historiske påstander, proveniens eller konserveringsfaglig kompetanse.'
  },
  {
    id:'museum_colleagues_and_operations',
    standing_axis:'handoff_reliability_and_shared_workload',
    cares_about:['at venting, eier, versjon og handoff er synlig slik at skjult arbeid ikke skyves mellom funksjoner','at frister og publikumsplaner justeres når fysisk, rettslig eller kildefaglig grunnlag ikke er klart'],
    cannot_grant:'Kollegial standing kan påvirke samarbeid, varslingsvilje og hvor tidlig praktiske problemer blir synlige, men kan ikke gi formell behandlingskompetanse, eierskapsmyndighet, budsjett eller styrevedtak og kan ikke gjøre intern enighet til dokumentert kildefakta eller automatisk utstillingsgodkjenning.'
  },
  {
    id:'public_researchers_and_future_stewards',
    standing_axis:'public_correction_access_and_long_memory',
    cares_about:['at museet kan forklare hvorfor en etikett, attribusjon eller visning endres','at framtidige forskere og forvaltere kan se hva institusjonen visste, tvilte på og gjorde med objektet'],
    cannot_grant:'Offentlig omdømme, forskerinteresse og framtidige institusjoners vurderinger kan få reelle konsekvenser for tillit, men kan ikke gi ansettelse, utnevnelse eller delegasjon, kan ikke autentisere et objekt eller en kilde og kan ikke gjøre publikumsstøtte til behandlings-, eierskaps- eller tilbakeføringsmyndighet.'
  },
  {
    id:'private_relations',
    standing_axis:'presence_confidentiality_and_identity_beyond_collection_status',
    cares_about:['at arbeid med skade, konflikt og historisk urett ikke gjør hjemmet til uformelt saksrom','at spilleren kan tåle korreksjon og uavklarthet uten å kreve privat bekreftelse på egen faglig status'],
    cannot_grant:'En nær relasjon kan gi støtte, motstand og perspektiv på belastning og identitet, men kan ikke gi konservator- eller kuratorfullmakt, kan ikke bli bakkanal for fortrolig proveniens eller restitusjon og kan ikke gjøre privat trygghet til juridisk mandat, kildeevidens eller institusjonelt vedtak.'
  }
];

const recurringPeople = [
  {
    id:'ingrid_senior_konservator_world',
    social_function:'Ingrid gjør materialrisiko, kompetansegrense og sporbar behandling sosialt synlig når utstillingsfristen gjør et fysisk stopp upopulært.',
    class_position:'Senior konservator med sterk profesjonell kapital og reell stoppmakt ved uforsvarlig håndtering, men uten eierskaps- eller restitusjonsmyndighet.',
    status:'Hennes standing avhenger av om spilleren respekterer dokumentert tilstand og kompetanse også når et prestisjeobjekt må tas ut av planen.',
    power_over_player:'Kan kreve ny tilstandskontroll, begrense håndtering og dokumentere faglig uenighet, men kan ikke gjøre konserveringsstatus til juridisk eierskapsavgjørelse.',
    wants:'At objektet overlever, at inngrep kan rekonstrueres og at ingen bruker publikumsverdi som argument for å skjule fysisk usikkerhet.',
    conceals:'Konserveringsfaglig forsiktighet kan selv undervurdere formidlings-, forsknings- og tilgangsverdier dersom stoppet aldri kobles til et korrigerbart beslutningspunkt.',
    speech_style:'Kort, materialnær og dokumenterende; spør hva som faktisk er observert, hvem som er kvalifisert, og hva som er reversibelt.',
    teaches_player:'At bevaring er en kunnskaps- og myndighetsgrense, ikke bare en teknisk service for kuratorisk plan.'
  },
  {
    id:'amal_kurator_world',
    social_function:'Amal bærer fortolknings- og utstillingssporet og viser når en overbevisende fortelling blir for sikker i forhold til kilder, fravær og motstemmer.',
    class_position:'Kurator med faglig ansvar for utvalg og formidling innen mandat, men uten behandlingskompetanse eller rett til å avgjøre eierskap alene.',
    status:'Hennes standing måler om spilleren beskytter kuratorisk arbeid mot både falsk objektivitet og prestisjedrevet overforenkling.',
    power_over_player:'Kan forme utstillingens spørsmål, utvalg og tekst og kreve faglig begrunnelse, men kan ikke overstyre fysisk stopp, rettigheter eller formell restitusjonsprosess.',
    wants:'At publikum får en tydelig fortelling som fortsatt viser hva som er dokumentert, tolket, omstridt og ukjent.',
    conceals:'Kuratorisk investering i en fortelling kan gjøre det sosialt vanskelig å fjerne et nøkkelobjekt eller endre en etikett sent.',
    speech_style:'Analytisk og fortellingsbevisst; spør hva objektet faktisk bærer, hva sammenstillingen gjør, og hvilke stemmer som mangler.',
    teaches_player:'At tydelig formidling ikke krever falsk enighet, og at kuratorisk autoritet må være korrigerbar.'
  },
  {
    id:'henrik_registrar_world',
    social_function:'Henrik gjør objektidentitet, accession, proveniens, lån og rettigheter til et levende arbeidsproblem framfor bakgrunnsmetadata.',
    class_position:'Registrar og proveniensansvarlig med informasjons- og prosessmakt over registreringssporet, men uten eneautoritet til juridisk eller etisk sluttavgjørelse.',
    status:'Hans standing avhenger av om spilleren lar et hull stå åpent når dokumentasjonen ikke tåler en sikker eierskaps- eller attribusjonsfortelling.',
    power_over_player:'Kan stoppe ubegrunnet registreringssikkerhet og kreve dokumentasjon før handoff, men kan ikke avgjøre tilbakeføring eller autentisere alle historiske påstander.',
    wants:'At objektets identitet, eierskapshistorikk, kildegrunnlag og versjoner forblir lesbare gjennom hele saken.',
    conceals:'Registreringslogikk kan gi en illusjon av at det som ikke finnes i systemet ikke finnes i historien, særlig ved tapte eller koloniale arkiver.',
    speech_style:'Detaljert og kronologisk; spør hvor opplysningen kommer fra, når den ble lagt inn, og hva som motsier den.',
    teaches_player:'At proveniens er en historisk, juridisk og etisk undersøkelse, ikke bare et komplett metadatafelt.'
  },
  {
    id:'lea_representasjon_restitusjon_world',
    social_function:'Lea gjør berørte stemmer, sensitiv representasjon og restitusjonskrav konkrete før institusjonen kan gjemme seg bak intern faglig enighet.',
    class_position:'Rådgiver i dialog- og restitusjonsgrensesnittet med relasjonell og prosessuell innflytelse, men uten rett til å love eller avslå tilbakeføring alene.',
    status:'Hennes standing måler om dialog faktisk kan endre utstilling eller sak, eller bare brukes som legitimering etter at valget er låst.',
    power_over_player:'Kan kreve at relevante stemmer og dokumentasjon løftes til riktig nivå og at sensitiv skade ikke bagatelliseres, men kan ikke oppheve formell mandatlinje.',
    wants:'At representasjon, eierskap, skade og historisk urett behandles som kunnskaps- og ansvarsspørsmål med dokumentert oppfølging.',
    conceals:'Også dialogarbeid kan feilaktig fremstille et mangfoldig miljø som én samlet stemme dersom institusjonen ønsker en enkel løsning.',
    speech_style:'Relasjonell og presis; spør hvem som er berørt, hvem som ikke er i rommet, hva som er dokumentert, og hva institusjonen faktisk kan beslutte.',
    teaches_player:'At konsultasjon må kunne endre arbeidet, men ikke forveksles med automatisk konsensus eller ubegrenset myndighet.'
  },
  {
    id:'museumsleder_world',
    social_function:'Museumslederen gjør frist, økonomi, lån, publikumsforventning og institusjonell prestisje til reelt press på det faglige arbeidsobjektet.',
    class_position:'Institusjonell leder med ressurs- og prioriteringsmakt innen delegasjon, men uten rett til å produsere konserveringskompetanse eller historisk evidens gjennom posisjon.',
    status:'Standing her handler om hvorvidt spilleren kan gjøre risiko og alternativkostnad styrbar uten å late som alle faggrenser er forhandlingsbare.',
    power_over_player:'Kan prioritere ressurser og løfte beslutninger, men kan ikke gjøre muntlig ønske til behandlingstillatelse, rettighetsklarering eller dokumentert proveniens.',
    wants:'At utstillingen åpner, at risiko er styrt og at institusjonen kan forklare valgene sine offentlig.',
    conceals:'Prestisje og kalender kan gjøre det fristende å flytte usikkerhet fra beslutningen og ned i usynlig arbeid hos samlingspersonalet.',
    speech_style:'Prioriterende og konsekvensorientert; spør hva som må stoppe, hva som kan erstattes, og hvem som faktisk eier beslutningen.',
    teaches_player:'At institusjonell ledelse må gjøre faggrenser håndterbare uten å oppløse dem.'
  },
  {
    id:'berort_kildeholder_world',
    social_function:'En tilbakevendende kildeholder fra et berørt miljø gjør institusjonens historiske dokumentasjon og dagens relasjonelle ansvar vanskelig å skille fra hverandre, men nødvendig å holde sammen.',
    class_position:'Ekstern aktør uten intern linjemyndighet, men med erfaringskunnskap, mulige kilder og reell sosial legitimitet i spørsmål om representasjon og historisk skade.',
    status:'Standing avhenger av om museet husker tidligere løfter, viser hva dialog har endret og tåler at ny dokumentasjon kan gjøre en plan mindre bekvem.',
    power_over_player:'Kan gi eller holde tilbake bestemte kilder og samarbeid og kan utfordre museets legitimitet, men kan ikke alene definere juridisk eierskap eller konserveringsmetode.',
    wants:'At institusjonen behandler dialog som gjensidig ansvar, ikke som en engangsinnsamling av støtte til en ferdig fortelling.',
    conceals:'Ingen ekstern gruppe er homogen; også den som taler tydelig kan representere bare deler av et større konflikt- eller minnefelt.',
    speech_style:'Historisk konkret og relasjonelt krevende; spør hva museet visste før, hvem som ble hørt, og hva som faktisk endres nå.',
    teaches_player:'At museumstillit bygges over tid gjennom dokumentert respons på kilder og kritikk, ikke gjennom én vellykket konsultasjon.'
  },
  {
    id:'private_relation_world',
    social_function:'En nær relasjon gjør restkostnaden av skade, offentlig kritikk og uløste historiesaker synlig uten å bli et uformelt museumsmøte hjemme.',
    class_position:'Privat nærperson uten profesjonell eller institusjonell myndighet over samlingen.',
    status:'Standing her måler tilstedeværelse, fortrolighet og om spilleren kan ha en identitet som ikke står og faller med objektenes eller utstillingens prestisje.',
    power_over_player:'Kan sette grenser for hva hjemmet tåler og utfordre spillerens selvfortelling, men kan ikke få fortrolig proveniens, avgjøre faglige saker eller autorisere behandling.',
    wants:'At spilleren kan snakke sant om belastning og tvil uten å dele sensitive mennesker, eierskapsopplysninger eller gjøre privat støtte til faglig fasit.',
    conceals:'Omsorg kan også friste til for enkle råd når profesjonell usikkerhet og historisk urett faktisk må forbli vanskelig en stund.',
    speech_style:'Nær og jordnær; spør hva spilleren bærer, ikke hvem som vant den faglige konflikten.',
    teaches_player:'At korrigerbarhet krever et privat liv der status kan falle uten at hele identiteten kollapser.'
  }
];

const slowAxes = [
  ['material_stewardship','Materialforvaltning','Utvikles gjennom sporbar tilstand, kompetansegrense, reversibilitet og hvordan fysisk risiko håndteres under tidspress.'],
  ['provenance_integrity','Proveniensintegritet','Utvikles når hull, motkilder, eierskapshistorikk og senere korrigeringer bevares som synlige deler av objektets biografi.'],
  ['interpretive_humility','Fortolkningsydmykhet','Utvikles gjennom evnen til å skille kildedata, kuratorisk sammenstilling, uenighet og eksplisitt usikkerhet.'],
  ['representation_reciprocity','Representasjonsgjensidighet','Utvikles når berørte miljøer kan påvirke arbeidet og institusjonen dokumenterer både enighet, uenighet og egne mandatgrenser.'],
  ['rights_and_mandate_discipline','Rettighets- og mandatdisiplin','Utvikles gjennom respekt for lån, rettigheter, formelle vedtak og grensene mellom profesjonell anbefaling og institusjonell beslutning.'],
  ['handoff_reliability','Handoff-pålitelighet','Utvikles gjennom versjonert eier, ventepunkt og overlevering som ikke sletter tidligere inngrep eller uavklart proveniens.'],
  ['public_correction','Offentlig korrigerbarhet','Utvikles når museet kan endre attribusjon, etikett eller visning uten å skjule hvorfor kunnskapsgrunnlaget endret seg.'],
  ['professional_identity','Profesjonell identitet','Utvikles i spennet mellom kuratorisk og konserveringsfaglig status, kvalifikasjonsgrenser og evnen til å be om riktig kompetanse.'],
  ['private_sustainability','Privat bærekraft','Utvikles gjennom fortrolighet, søvn, grenser og evnen til å bære historisk konflikt uten å gjøre hjemmet til saksrom.']
].map(([id,label,description]) => ({id,label,description,runtime_binding:'editorial_only_until_governed'}));

const cases = [
  ['Provenienshullet før åpning','Et nøkkelobjekt har en eier- og forflytningshistorikk med et dokumentert hull akkurat i perioden utstillingsteksten omtaler mest sikkert. Henrik vil holde feltet åpent, Amal vil bevare fortellingens retning, og ledelsen frykter at synlig usikkerhet svekker lanseringen.','Skal objektet vises med eksplisitt proveniensusikkerhet, tas midlertidig ut, eller få en avgrenset tekst som tydelig skiller kjent historie fra institusjonens hypotese?'],
  ['Den sårbare gjenstanden','Ny tilstandskontroll viser at lys, vibrasjon eller håndtering kan skade et objekt som er brukt som utstillingens visuelle anker. Ingrid krever ny visningsgrense mens produksjonsplanen allerede er låst.','Skal visningen bygges om, perioden kortes ned eller et dokumentert alternativ brukes, og hvem eier neste fysiske kontrollpunkt?'],
  ['Restaureringen ingen kan forklare','Fotografier og overflatefunn tyder på et eldre inngrep som ikke er tilfredsstillende dokumentert i samlingssystemet. Inngrepet påvirker både attribusjon, behandlingsvalg og hvordan publikum bør forstå objektets materialhistorie.','Hvordan markeres tidligere inngrep, hvilke nye tiltak kan forsvares nå, og hvor stopper spilleren før kvalifisert konservator har vurdert materialet?'],
  ['Lånet med uklare rettigheter','Et planlagt lån har god institusjonell støtte, men avtalens bilde-, visnings- eller videreformidlingsrett er snevrere enn prosjektgruppen har lagt til grunn. Å endre planen sent rammer både budsjett og kommunikasjon.','Hva må avklares med långiver eller rettighetshaver før utstillingsløftet kan stå, og hvilke kuratoriske elementer kan fortsette uten å foregripe samtykke?'],
  ['Representasjonen blir utfordret','Et berørt miljø peker på at utstillingens sammenstilling gjør deres historie mer entydig og passiv enn kildene og deres egne arkiver tilsier. Lea dokumenterer både konkrete motkilder og intern uenighet i miljøet.','Hvordan kan utstillingen endres uten å late som dialog gir én autorisert stemme, og hvilke påstander må gjenåpnes som følge av nytt kildegrunnlag?'],
  ['Et tilbakeføringskrav kommer inn','Museet mottar et formelt krav om tilbakeføring knyttet til et objekt med sterk publikums- og forskningsverdi. Dokumentasjonen er omfattende, men ikke avsluttet, og ingen i prosjektgruppen har mandat til å love utfall.','Hvordan skilles dokumentasjon, dialog, midlertidig visningsbeslutning og formell restitusjonsavgjørelse slik at ingen standing eller publikumsinteresse blir falsk myndighet?'],
  ['Den sterke fortellingen blir for glatt','En gjennomarbeidet utstillingsfortelling fungerer godt dramaturgisk, men bygger på å tone ned en sentral faglig uenighet og et kildefravær som gjør årsakskjeden mindre sikker.','Hvordan bevares forståelig formidling samtidig som vesentlig uenighet og kildens begrensning blir synlig nok til at publikum ikke presenteres for kuratorisk sikkerhet som fakta?'],
  ['Fristen kolliderer med konservering','En låne- og monteringsfrist nærmer seg mens konservatorisk kapasitet er bundet opp og et objekt fortsatt står i waiting-state. Teamet foreslår å flytte kontrollen til etter montering for å holde kalenderen.','Skal tidsplanen endres, et objekt erstattes eller en ny kvalifisert ressurs hentes inn, og hva kan ikke gjøres før faktisk kompetanse og dokumentert tilstand foreligger?'],
  ['En ny kilde endrer attribusjonen','En katalog, kvittering eller korrespondanse som nylig er funnet, utfordrer en attribusjon museet har gjentatt lenge. Den gamle etiketten har høy institusjonell autoritet, men den nye kilden er sterk nok til å kreve ny vurdering.','Hvordan kommuniseres en foreløpig korrigering, hvilke felter i objektloggen gjenåpnes, og hva må undersøkes før en ny sikker attribusjon publiseres?'],
  ['Klimaavviket i monteren','Sensor- eller tilstandsdata viser et avvik under visning. Skaden er ikke dokumentert, men risikoen er reell og det er uklart om feilen ligger i monter, rom eller oppfølging.','Hvilket midlertidig tiltak kan tas nå, hvem får handoff, og hvordan unngås at fravær av synlig skade blir brukt som bevis for at grensen var unødvendig?'],
  ['Digital tilgang møter rettighetsgrensen','Forsker- og publikumsinteresse skaper press for å publisere høyoppløselige bilder og detaljert objektinformasjon. Rettigheter, sensitiv proveniens eller berørte stemmer gjør full åpenhet mer komplisert enn standard tilgangspolitikk.','Hvilken informasjon kan åpnes, hva krever samtykke eller avgrensning, og hvordan dokumenteres begrunnelsen uten å gjøre tilgang eller lukking til en universell moralsk regel?'],
  ['Kurator og konservator er uenige','Amal mener et objekt er nødvendig for den historiske argumentasjonen, mens Ingrid mener planlagt visningsform ikke er forsvarlig. Begge har relevant faglig autoritet, men på forskjellige områder.','Hvordan skal spilleren strukturere beslutningen slik at kuratorisk verdi ikke overstyrer materialgrense, og konservatorisk stopp heller ikke later som det avgjør hele den historiske fortellingen?'],
  ['Offentlig kritikk av gammel proveniens','En journalist og forskere løfter fram at museet tidligere presenterte et objekts eierskapshistorie med større sikkerhet enn arkivgrunnlaget ga. Kritikken er delvis kjent internt, men aldri tydelig korrigert offentlig.','Hva må museet erkjenne, hvilke dokumenter og usikkerheter kan publiseres, og hvordan unngås både defensiv omdømmevask og forhastet juridisk konklusjon?'],
  ['Sesongen avsluttes med korrigering','Flere objekter, etiketter og prosedyrer har endret status gjennom perioden. Teamet må avslutte uten å omskrive historien til en heltefortelling om at systemet alltid virket slik det burde.','Hvordan dokumenteres hva som ble stoppet, endret, fortsatt er uavklart og skal følges videre, slik at neste forvalter overtar både læring og rest-risiko?']
];

const environments = [
  'inntaks- og proveniensbordet der objektidentitet, accession, eierskapshistorie, rettigheter, kildegrunnlag og eksplisitt usikkerhet må være lesbare før en sterkere status låses',
  'tilstands- og konserveringsflaten der materialobservasjon, tidligere inngrep, miljø, kompetansebehov og behandlingsgrense skiller fysisk forvaltning fra utstillingsønske',
  'kuraterings- og utstillingsbordet der tema, kilder, objektutvalg, uenighet, tekst og revisjon må holdes sammen uten at kuratorisk sammenstilling blir kildens egen stemme',
  'representasjons-, restitusjons- og publikumsflaten der berørte stemmer, formelle krav, publikumsreaksjon og institusjonelt mandat møtes uten å bli én popularitets- eller moralpoengsum',
  'låne-, rettighets- og styringsgrensen der avtaler, forsikring, lisens, budsjett og formelle beslutninger må være avklart før institusjonen lover mer enn den faktisk kan levere',
  'magasin og monteringsflate der usynlig samlingsarbeid, venting, handoff og fysisk risiko kan bli presset av kalenderen selv om publikum aldri ser prosessen',
  'offentlig korrigeringsrom der attribusjoner, etiketter og proveniensfortellinger må kunne endres uten at institusjonen skjuler tidligere sikkerhet eller gjør korreksjon til personlig nederlag',
  'privatlivet der arbeid med skade, historisk urett og offentlig kritikk kan følge spilleren hjem uten at fortrolig saksmateriale eller profesjonell myndighet får flytte inn'
];

const phaseInfo = {
  morning:{beat_type:'task',focus:'Morgenen etablerer arbeidsobjektet før tempoet tar over. Spilleren må åpne den versjonerte samlingsloggen, skille observasjon fra antakelse, navngi hvem som eier neste kontroll og markere hvilke felt som fortsatt venter på proveniens, kompetanse, rettighet, dialog eller formell beslutning.'},
  lunch:{beat_type:'relationship',focus:'Lunsjfasen flytter saken inn i en relasjon der en annen aktør har en annen type kunnskap eller makt. Samme valg kan derfor leses som faglig ansvarlig av én gruppe og som lukket, tregt eller risikabelt av en annen, uten at reaksjonene summeres til én global reputation score.'},
  afternoon:{beat_type:'decision',focus:'Ettermiddagen tvinger fram en avgrenset beslutning, anbefaling eller stopp. Spilleren må angi hva som faktisk kan avgjøres nå, hvilken myndighet beslutningen bygger på, hva som fortsatt er et ventepunkt og hvilket kontrollpunkt som gjør valget korrigerbart når nye kilder, fysisk tilstand eller formelt mandat endrer seg.'},
  evening:{beat_type:'private_consequence',focus:'Kvelden viser restkostnaden av dagens museumsmakt. Spilleren må bære ansvar, tvil og mulig skam uten å dele fortrolige proveniens- eller personsaker privat, og uten å bruke en nær relasjon som uformell kurator, konservator, jurist eller styre. Neste dag skal kunne begynne med korrigerbarhet i stedet for defensiv statusbeskyttelse.'}
};

const audienceIds = audiences.map((a) => a.id);
const phases = ['morning','lunch','afternoon','evening'];
const beatRef = (day, phase) => `${day}/${phase}`;
const coverage = [];
for (let day = 1; day <= 14; day += 1) {
  const [caseTitle,setup,question] = cases[day - 1];
  for (let p = 0; p < phases.length; p += 1) {
    const phase = phases[p];
    const info = phaseInfo[phase];
    const flat = (day - 1) * 4 + p;
    const audience = audiences[flat % audiences.length];
    const sourceRef = canonicalRefs[flat % canonicalRefs.length];
    const summary = `Dag ${day}, ${phase}: ${caseTitle}. ${setup} ${info.focus} Det vedvarende arbeidsobjektet er hele tiden samlingsobjekt_proveniens_tilstands_og_tiltakslogg: objekt-ID, proveniens og eierskapshistorie, kilder og motkilder, tilstand og tidligere inngrep, kompetanse- og behandlingsgrense, lån og rettigheter, kuratorisk påstand, representasjons- eller restitusjonssignal, waiting-state, handoff, beslutning og avgrenset rework skal kunne rekonstrueres. Dagens museumsfaglige spørsmål er: ${question} Rollen må samtidig bevare de to canonicale løkkene — objekt til proveniens, tilstand, fagvurdering, tiltak, dokumentasjon og formidling; og tema til kilder, utvalg, fortolkning, utstilling, publikumsrespons og revisjon. Spilleren får ikke løse presset ved å skjule inngrep, ignorere proveniensproblemer, utføre behandling uten kompetanse eller presentere kuratorisk tolkning som ubestridt kildefakta. Career-portene forblir title-owned: Konservator og Senior konservator er qualification_required, Kurator og Senior kurator er direct; ingen standing, Badge eller sesongbeat endrer dette. Denne ${info.beat_type}-scenen bruker canonical mail-proveniens ${sourceRef} som delivery-anker og legger ingen ny runtime eller parallell sceneformat til systemet. Det redaksjonelle minnet er situert: akkurat ${audience.id} observerer denne fasen og kan senere huske hvordan spilleren håndterte usikkerhet, grense og handoff.`;
    const standing = `Situert konsekvens for ${audience.id} på aksen ${audience.standing_axis}: Dag ${day}/${phase} blir ikke oversatt til én global reputation score. Gruppen vurderer særlig ${audience.cares_about[0]} og ${audience.cares_about[1]}. Samme valg kan derfor styrke tillit her og skape skepsis hos en annen gruppe uten at noen reaksjon automatisk blir juridisk, faglig eller institusjonell fasit. Standing kan påvirke hvor tidlig tvil meldes, hvor mye kontekst spilleren får, hvor villige aktører er til å ta en vanskelig handoff, og hvordan en senere korreksjon tolkes. Den kan ikke skrive om objektloggen, skape ny kildeevidens eller oppheve de canonicale Career- og authority-grensene. ${audience.cannot_grant} Den sosiale hukommelsen fra ${caseTitle} kan vende tilbake i senere beat, men formell behandling, rettigheter, eierskap, restitusjon, delegasjon og historiefaglig konklusjon må fortsatt komme fra sine egne legitime prosesser og kilder.`;
    coverage.push({day,phase,beat_type:info.beat_type,title:`${caseTitle} — ${phase}`,summary,standing_audience:audience.id,standing_consequence:standing,materialization_refs:[sourceRef]});
  }
}

const primaryThreads = [
  {id:'bevaring_under_prestisjepress',relationship:'Tråden følger Ingrid og spilleren gjennom fysisk risiko, dokumenterte inngrep og gjentatte forsøk på å flytte kontroll etter frist. Relasjonen utvikler seg etter om spilleren faktisk respekterer kompetansegrensen når den koster synlighet, tid og status, og om et stopp senere huskes som beskyttelse av samlingen eller som personlig motstand.',beat_refs:['2/morning','2/afternoon','3/lunch','8/afternoon','10/morning','12/lunch','14/afternoon']},
  {id:'proveniens_som_levende_sak',relationship:'Henrik og spilleren bygger et spor der hull, motkilder og endrede attribusjoner får forbli synlige. Tråden tester om registreringssystemet brukes til å bære usikkerhet og versjonshistorikk, eller om institusjonell prestisje gradvis presser åpne spørsmål tilbake til sikre felter.',beat_refs:['1/morning','1/afternoon','3/afternoon','6/morning','9/morning','13/afternoon','14/morning']},
  {id:'kuratorisk_fortelling_og_motstand',relationship:'Amal og spilleren må bevare en tydelig historisk fortelling samtidig som objektfravær, motkilder og faglig uenighet endrer hva som kan sies. Relasjonen utvikles over reelle revisjoner, ikke gjennom uavhengige dilemmaer, og viser om kuratorisk investering tåler å miste et tidligere sentrum.',beat_refs:['1/lunch','5/afternoon','7/morning','7/afternoon','9/lunch','12/afternoon','14/lunch']},
  {id:'representasjon_dialog_og_restitusjon',relationship:'Lea og en tilbakevendende kildeholder gjør dialog til et arbeid som husker tidligere løfter. Tråden skiller nye kilder, sosial standing, etisk kritikk og formell restitusjonsmyndighet slik at konsultasjon verken blir dekor, automatisk veto eller falsk konsensus.',beat_refs:['5/morning','5/lunch','6/lunch','6/afternoon','11/lunch','13/lunch','14/afternoon']},
  {id:'rettigheter_lan_og_handoff',relationship:'Tråden følger hva som skjer når lån, rettigheter og kalender møter det versjonerte arbeidsobjektet. Spilleren må unngå muntlige løfter og sikre at hver handoff beholder faktisk avtalegrunnlag, ventepunkt og beslutningseier, slik at samarbeidspartnerens tillit ikke bygges på en fullmakt museet aldri hadde.',beat_refs:['4/morning','4/afternoon','8/morning','8/lunch','11/morning','11/afternoon','14/morning']},
  {id:'offentlig_korreksjon_og_langt_minne',relationship:'Offentligheten, forskere og framtidige forvaltere møter museet når gamle sikkerheter må korrigeres. Tråden undersøker om institusjonen kan være åpen om tidligere feil og ny kunnskap uten omdømmevask, skyldplassering eller forhastet juridisk konklusjon.',beat_refs:['7/lunch','9/afternoon','10/afternoon','11/afternoon','13/morning','13/afternoon','14/afternoon']},
  {id:'privat_grense_og_profesjonell_identitet',relationship:'Den private tråden viser hvordan objektstatus, offentlig kritikk og historisk urett kan feste seg i spillerens identitet. Spilleren må finne språk for ansvar og tvil uten å dele fortrolig informasjon eller bruke hjemmet som bekreftelse på at egen kuratoriske eller konservatorfaglige standing bør vinne.',beat_refs:['1/evening','3/evening','5/evening','6/evening','9/evening','13/evening','14/evening']}
];

const privateAftermath = [
  {id:'objektet_som_ble_tatt_ut',description:'Etter at et prestisjeobjekt tas ut av utstillingen, kjenner spilleren tapet som personlig nederlag selv om stoppet var faglig riktig. Hjemme må dette få være skuffelse uten at Ingrid eller konservatorfaget gjøres til motstander, og uten at fortrolig tilstandsdata brukes for å få privat støtte til egen versjon.',materialization_refs:[canonicalRefs[1]]},
  {id:'provenienshullet_folger_med_hjem',description:'En uavklart eierskapshistorie blir liggende i tankene etter arbeidstid. Spilleren øver på å tåle at et viktig spørsmål fortsatt er åpent, og på å skille behovet for avslutning fra det faktiske kildegrunnlaget, samtidig som navn, krav og sensitiv dokumentasjon forblir i arbeidsflaten.',materialization_refs:[canonicalRefs[4]]},
  {id:'skam_etter_offentlig_korreksjon',description:'Når museet korrigerer en gammel attribusjon offentlig, oppstår skam over at institusjonen tok feil så lenge. Etterspillet undersøker om korreksjon kan bli profesjonell integritet i stedet for identitetstap, uten å skyve ansvar ned på den som fant den nye kilden eller late som gammel sikkerhet aldri fantes.',materialization_refs:[canonicalRefs[9]]},
  {id:'dialogtretthet_uten_bakkanal',description:'Etter en krevende samtale om representasjon ønsker spilleren å fortelle en nær person hele saken for å bli forstått. Grensen er konkret: belastningen kan deles, men ikke fortrolige kilder, interne posisjoner eller detaljer som gjør hjemmet til en uformell restitusjons- eller personalsamtale.',materialization_refs:[canonicalRefs[11]]},
  {id:'sesongslutt_uten_museumshelt',description:'På siste kveld må spilleren beskrive perioden uten å gjøre seg selv eller museet til helten som løste alt. Også et objekt som fortsatt venter, en tilbakeføringssak uten sluttvedtak og en korrigert etikett kan være tegn på ansvar dersom neste forvalter overtar et sannere og mer lesbart spor.',materialization_refs:[canonicalRefs[14]]}
];

const delayedConsequences = [
  {id:'provenienshull_blir_offentlig_tillit',setup_ref:'1/afternoon',return_ref:'13/morning',domains:['reputation','job'],description:'Måten usikkerheten ble merket dag 1 påvirker hvor troverdig museets senere offentlige korreksjon oppleves.'},
  {id:'bevaringsstopp_blir_varslingsvilje',setup_ref:'2/afternoon',return_ref:'10/morning',domains:['relationship','job'],description:'Om Ingrid ble støttet ved første stopp påvirker hvor tidlig hun melder et senere klimaavvik.'},
  {id:'gammelt_inngrep_blir_kunnskap',setup_ref:'3/afternoon',return_ref:'9/afternoon',domains:['job','reputation'],description:'Sporbarheten rundt et gammelt inngrep former hvordan museet senere kan forklare en endret attribusjon.'},
  {id:'rettighetsgrense_blir_partnerhukommelse',setup_ref:'4/afternoon',return_ref:'11/lunch',domains:['relationship','reputation'],description:'Et avgrenset løfte til långiver påvirker om senere digital tilgang tolkes som ansvarlig samarbeid eller nytt avtalepress.'},
  {id:'representasjonskritikk_blir_revisjonskapital',setup_ref:'5/lunch',return_ref:'13/lunch',domains:['relationship','reputation'],description:'Om dialog faktisk endret utstillingen former om berørte aktører deler nye kilder når museet senere kritiseres offentlig.'},
  {id:'restitusjonssak_blir_mandatdisiplin',setup_ref:'6/afternoon',return_ref:'14/afternoon',domains:['job','reputation'],description:'At ingen lovet et utfall uten mandat blir senere et konkret bevis på at sesongen skiller sosial standing fra formell beslutning.'},
  {id:'faglig_uenighet_blir_samarbeid',setup_ref:'7/afternoon',return_ref:'12/afternoon',domains:['relationship','job'],description:'Hvordan uenighet ble dokumentert tidligere påvirker om kurator og konservator kan løse en senere konflikt uten statuskamp.'},
  {id:'privat_grense_blir_korrigerbarhet',setup_ref:'13/evening',return_ref:'14/morning',domains:['relationship','job'],description:'Evnen til å legge fra seg offentlig kritikk noen timer påvirker om sluttgjennomgangen blir defensiv eller faktisk lærende.'}
];

const authoritySeparation = 'Det finnes ingen global reputation score som kan konverteres til evidens, kildeautoritet eller museumsfaglig sannhet. Standing hos konservatorer, kuratorer, registrarer, berørte miljøer, långivere, ledelse, offentlighet eller private relasjoner kan påvirke samarbeid og senere tolkning av spillerens valg, men kan ikke gi qualification_required-kompetanse, endre direct- eller qualification_required-Career-portene, skape ansettelse eller utnevnelse, delegasjon, styrevedtak, budsjett, behandlingsfullmakt, rettighetsklarering, eierskap, tilbakeføring eller autentisering. History Go og Badge kan skjerpe spørsmål, aldri gi disse fullmaktene.';

const world = {
  schema:'civication_role_world_v1',
  version:1,
  category:CATEGORY,
  role_scope:ROLE,
  title:'Historie / Museum og samling — objektbiografi, bevaring, proveniens og situert tillit',
  status:'role_world_complete',
  sociological_core:{
    main_problem:'Hvordan forvalte, bevare og fortolke samlingsobjekter når fysisk sårbarhet, uavklart proveniens, institusjonell prestisje, berørte stemmer og publikumsbehov trekker i ulike retninger — uten å gjøre standing til kompetanse, tolkning til kildefakta eller museets besittelse til bevis på rett?',
    description:'Museumsarbeidet organiseres rundt objekter som både er materielle ting, historiske kilder, juridiske og etiske relasjoner og kuratoriske byggesteiner. Sesongen gjør derfor standing situert: konservatorer husker om fysisk risiko ble respektert, registrarer om hull ble bevart, kuratorer om uenighet fikk plass, berørte miljøer om dialog kunne endre arbeid, långivere om løfter holdt seg innen avtale, kolleger om handoff var lesbar, offentligheten om korreksjon var sannferdig, og privatlivet om spilleren kan bære ansvar uten å gjøre status til hele identiteten.'
  },
  theme_ids:themeIds,
  social_environments:environments,
  recurring_people_archetypes:recurringPeople,
  slow_axes:slowAxes,
  situated_reputation_model:{global_score_allowed:false,audiences,divergence_examples:[
    'Å ta et objekt ut av visning kan styrke standing hos konservatorer og framtidige forvaltere, samtidig som kuratorisk team og museumsledelse opplever tap av fortellingskraft og tidsplan.',
    'Å merke proveniens som uavklart kan styrke registrar- og forskertillit, samtidig som långiver eller kommunikasjonsteam kan frykte at usikkerheten leses som institusjonell anklage.',
    'Å endre en etikett etter dialog kan styrke standing hos berørte miljøer, men skape intern statusuro dersom tidligere kuratorisk autoritet oppleves utfordret.',
    'Å avgrense digital tilgang kan oppfattes ansvarlig av rettighetshavere og samtidig som unødvendig lukking av forskere og publikum.',
    'Å holde en restitusjonssak formelt åpen uten å love utfall kan styrke mandatdisiplin hos styringsaktører og samtidig frustrere berørte grupper som har ventet lenge.',
    'Å publisere en korreksjon om gammel proveniens kan svekke kortsiktig omdømme og samtidig styrke langsiktig standing hos forskere, kolleger og framtidige forvaltere.'
  ],authority_separation:authoritySeparation},
  history_go_affordance:{
    source_ref:knowledgeRef,
    badge_id:'historie',
    better_question:'History Go kan fungere som et kildekritisk forstørrelsesglass når et samlingsobjekt får en for glatt biografi. Spilleren kan undersøke historiske kontekster, tidligere klassifikasjoner, arkivfravær, forflytning, samlerpraksis, koloniale eller institusjonelle maktforhold og hvordan attribusjoner har endret seg. Det bedre spørsmålet er ikke «hvilken historie gjør objektet mest interessant?», men «hvilke kilder og motkilder dokumenterer objektets identitet, proveniens, inngrep og bruk; hvem fikk definere kategorien; hvilke stemmer og arkiver mangler; og hva må fortsatt stå som kuratorisk tolkning eller åpent spørsmål før museet kan formulere en mer sikker påstand?»',
    authority_boundary:'History Go kan ikke gi qualification_required-konserveringskompetanse eller endre direct-Career-port, kan ikke ansette eller utnevne, gi delegasjon eller budsjett, fatte styre- eller restitusjonsvedtak, autentisere et objekt, proveniens, eierskap eller historisk kilde, autorisere behandling, klarere lån eller rettigheter eller gjøre et Badge til kuratorisk fasit. Det kan bare gjøre kilde-, kontekst- og objektbiografispørsmål bedre.'
  },
  cross_role_proof:{status:'not_materialized_no_shared_work_object',shared_work_object_found:false,required_for_rollout:false,new_runtime:false,rule:'Cross-role er not_required_for_rollout. Ingen kobling til kunstkonservering, museumsledelse, arkiv, forskning eller kulturforvaltning materialiseres bare fordi fagene berører de samme objektene. Et senere cross-role-spor krever et reelt delt arbeidsobjekt med identisk ID, versjon, eier og handoff-kontrakt; ellers forblir relasjonene redaksjonelle i denne Role World-en.'},
  season:{days:14,day_phases:phases,coverage},
  primary_threads:primaryThreads,
  private_aftermath:privateAftermath,
  delayed_consequences:delayedConsequences,
  existing_work_continuity:{
    work_loops:grammar.work_loops,
    persistent_work_object:'samlingsobjekt_proveniens_tilstands_og_tiltakslogg',
    waiting_states:grammar.rhythm_contract.waiting_states,
    handoff_rule:grammar.persistent_work_object_contract.handoff_rule,
    rework_rule:grammar.rhythm_contract.rework_rule,
    new_runtime_state:false
  },
  editorial_uniqueness:{
    statement:'Denne verdenen er ikke en omskriving av Institusjonsledelse, Fagledelse eller Kunst/Konservering og samling. Den organiserer 14 dager rundt museets særlige dobbelthet: objektet er samtidig fysisk materiale, historisk kilde, registrert institusjonsobjekt, mulig eierskaps- og rettighetsrelasjon, kuratorisk utvalg og bærer av berørte menneskers historie. Derfor står bevaringsstopp, provenienshull, dokumenterte inngrep, attribusjonskorreksjon, lån, representasjon og restitusjon i samme vedvarende arbeidsobjekt uten at én profesjonell standing får eie hele sannheten.',
    forbidden_shortcut:'Ingen eksisterende Role World-tekst eller plot kopieres. Bare canonical struktur, policy og de allerede materialiserte Museum og samling-prerequisitene gjenbrukes.'
  },
  materialization:{
    authored_dimensions:['situated_reputation'],
    no_new_runtime:true,
    existing_plan_preserved:true,
    existing_role_model_preserved:true,
    existing_people_foundation_preserved:true,
    existing_work_grammar_preserved:true,
    existing_persistent_work_preserved:true,
    existing_rhythm_preserved:true,
    cross_role_link_materialized:false,
    source_refs:canonicalRefs
  }
};

write(WORLD, world);
index.roles.push({category:CATEGORY,role_scope:ROLE,status:'role_world_complete',path:WORLD});
write(INDEX, index);
checklist.reference_worlds.push(WORLD);
write(CHECKLIST, checklist);
themeBank.reference_profiles = themeBank.reference_profiles || {};
themeBank.reference_profiles[KEY] = themeIds;
write(THEMEBANK, themeBank);

const source = `# Historie / Museum og samling — Role World rollout source-first\n\n## Scope lock\n- Canonical key: ${KEY}.\n- Existing roleModel, workGrammar, 16-step plan, four fictional People, four work surfaces, 15 canonical mails and persistent object are preserved.\n- Only remaining authored readiness dimension before this rollout: situated_reputation.\n- No new runtime and no parallel scene format.\n\n## Employment and authority invariants\n- Konservator: qualification_required with relevant_education_or_employer_qualification.\n- Senior konservator: qualification_required with relevant_education_or_employer_qualification.\n- Kurator: direct.\n- Senior kurator: direct.\n- Standing cannot grant qualification, treatment competence, ownership, rights, restitution authority, evidence, delegation, budget or institutional decision.\n\n## Editorial uniqueness\nThe world is object-centred rather than generic museum leadership: physical conservation, provenance, accession, prior interventions, curatorial interpretation, affected voices, rights, lending and restitution remain distinct but meet in one versioned work object. The 14-day season is not copied from another Role World.\n\n## Situated reputation\nEight bounded audiences keep separate standing axes. There is explicitly no global reputation score. Divergent reactions affect later cooperation and memory, not truth or formal authority.\n\n## Cross-role\nStatus: not_materialized_no_shared_work_object. Cross-role is not_required_for_rollout until a genuinely shared work object with identical identity, version and handoff contract exists.\n\n## History Go\nHistory Go supports historical context, source criticism, provenance questions and object biography. It cannot authenticate provenance or ownership, grant conservation qualification, authorize treatment, clear rights, decide restitution or turn curatorial interpretation into source fact.\n\n## Quality gate\n30/30 role-specific editorial and provenance checks are encoded in the focused rollout test: exact identity; preserved loops; exact persistent object; exact title-owned Career gates; exact authority boundary; 15/15 canonical mail provenance; 8 separated audiences; no global score; 9 slow axes; History Go boundary; cross-role quarantine; 14 days x 4 phases; 56 unique long-form beats; every canonical mail reused at least three times; 7 multi-day primary threads; 5 private aftermaths; 8 delayed consequences; index/checklist/theme registration; readiness removal from queue; Career runtime preservation; and source-first invariants.\n`;
writeText(SOURCE, source);

console.log(`Materialized ${WORLD}`);
console.log(`Canonical mail refs: ${canonicalRefs.length}`);
console.log(`Season beats: ${coverage.length}`);
console.log(`Audiences: ${audiences.length}; threads: ${primaryThreads.length}; aftermath: ${privateAftermath.length}; delayed: ${delayedConsequences.length}`);
