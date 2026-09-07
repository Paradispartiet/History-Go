import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const CATEGORY = 'natur';
const ROLE = 'natur_felt_og_formidling';
const KEY = `${CATEGORY}/${ROLE}`;
const WORLD = `data/Civication/roleWorlds/${CATEGORY}/${ROLE}.json`;
const MODEL = `data/Civication/roleModels/${CATEGORY}/${ROLE}.json`;
const GRAMMAR = `data/Civication/workGrammars/${CATEGORY}/${ROLE}.json`;
const PLAN = `data/Civication/mailPlans/${CATEGORY}/${ROLE}_plan.json`;
const SOURCE = 'reports/CIVICATION_NATUR_FELT_OG_FORMIDLING_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md';
const TYPES = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const THEMES = ['professional_culture','bureaucratic_power','status_anxiety','shame_reputation','precarity','care_vs_efficiency','invisible_work','public_private_leakage','class_power'];
const PERSISTENT = 'feltplan_observasjon_prove_metadata_hms_formidling_og_handofflogg';
const POLICY = {
  'Feltassistent': {policy:'direct'},
  'Naturveileder': {policy:'qualification_required',qualification_ids:['relevant_education_or_employer_qualification']}
};

const read = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const write = (rel, value) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), {recursive:true});
  fs.writeFileSync(full, `${JSON.stringify(value, null, 2)}\n`);
};

const model = read(MODEL);
const grammar = read(GRAMMAR);
const plan = read(PLAN);
if (grammar.persistent_work_object_contract.id !== PERSISTENT) throw new Error('Persistent work object changed');
if (plan.sequence.length !== 16) throw new Error('Expected 16-step prerequisite plan');
if (JSON.stringify(grammar.day_one_contract.entry_policy_by_title) !== JSON.stringify(POLICY)) throw new Error('Career gate drift');

const catalogPath = (type) => `data/Civication/mailFamilies/${CATEGORY}/${type}/${ROLE}_${type}.json`;
const canonicalRefs = TYPES.flatMap((type) => {
  const doc = read(catalogPath(type));
  return (doc.families || []).flatMap((family) => (family.mails || []).map((mail) => `${catalogPath(type)}#${mail.id}`));
});
if (canonicalRefs.length !== 15 || new Set(canonicalRefs).size !== 15) throw new Error(`Expected 15 canonical mails, got ${canonicalRefs.length}`);

const audiences = [
  ['field_leadership_and_hms','field_safety_judgment_standing','at stoppkriterier, vær, rute og HMS blir behandlet som reelle grenser','at feltarbeidet kan endres eller avbrytes uten at tempo blir skjult sikkerhetsargument'],
  ['species_quality_peers','species_evidence_caution_standing','at artsidentifikasjon skiller observasjon, indikasjon og bekreftelse','at nye foto, prøver eller ekspertvurderinger kan korrigere et tidligere artsanslag'],
  ['field_team_and_local_observers','field_team_traceability_standing','at praktiske observasjoner, lokal kunnskap og avvik faktisk følger loggen','at erfaring blir hørt uten å bli gjort om til automatisk evidens eller myndighet'],
  ['visitors_and_learning_groups','public_explanation_trust_standing','at forklaringen er forståelig uten å gjøre usikker naturkunnskap falskt sikker','at spørsmål og korrigering blir møtt åpent og at sårbar natur ikke ofres for nærhet eller opplevelse'],
  ['site_stewards_and_sensitive_nature_owners','site_sensitivity_standing','at lokalitetsgrenser, ferdselsregler og sårbarhet blir respektert','at formidling og feltaktivitet ikke gjør sensitive steder til publikums- eller datapressede ressurser'],
  ['metadata_and_handoff_peers','metadata_handoff_standing','at sted, tid, metode, foto/prøve-ID, usikkerhet og avvik kan rekonstrueres','at neste eier får sann status og kan gjenåpne bare berørt del uten å omskrive feltarbeidet'],
  ['employer_commissioners_and_program_leads','delivery_integrity_standing','at oppdrag, publikumsmål og leveranser blir gjennomført forutsigbart','at frist og synlighet ikke gjør faglige eller sikkerhetsmessige forbehold usynlige'],
  ['private_relations','private_role_containment_standing','at feltberedskap og formidlerrolle kan legges bort når arbeidsdagen er over','at personlig verdi og nærhet ikke rangeres etter hvor sikkert, spennende eller vellykket dagens funn var']
].map(([id,standing_axis,a,b]) => ({
  id,
  standing_axis,
  cares_about:[a,b],
  cannot_grant:`Denne målgruppen kan påvirke tilgang, samarbeid, informasjonsflyt, læringsrom, arbeidsflyt og hvor mye situert tillit spilleren får i akkurat denne relasjonen, men den kan ikke gjøre en observasjon, artsidentifikasjon, prøve, foto eller feltdata sannere enn dokumentasjonen. Standing kan ikke oppheve HMS, lokalitetsgrenser, sårbarhetskrav, arbeidsgiveransvar eller nødvendig faglig kvalitetssikring, og kan aldri summeres til én global reputation-score. Feltassistent forblir en direct Career-gate innen faktisk arbeidsgivermandat, mens Naturveileder fortsatt krever relevant_education_or_employer_qualification; popularitet, ros, senioritet, publikumstilfredshet eller Natur-Badge kan ikke oppfylle denne kvalifikasjonen. Målgruppen kan heller ikke fatte forvaltningsvedtak, utøve politisk myndighet, utstede forskningskonklusjoner uten faglig grunnlag, gi adgang eller tillatelse som andre myndigheter eier, eller gjøre History Go til feltbevis. History Go og Natur-Badge er læringsstøtte som kan gi arter, steder, økologisk kontekst og bedre spørsmål, men ikke yrkeskvalifikasjon, HMS-godkjenning, prøvevaliditet, artsbekreftelse eller offentlig myndighet.`
}));

const recurringPeople = [
  {
    id:'solveig_feltleder_world',
    social_function:'Solveig gjør stoppkriterier, vær, rute og HMS sosialt synlige når feltlaget helst vil holde planen og et avbrudd kan oppleves som svakhet eller dårlig levering.',
    class_position:'Feltleder og metodeansvarlig med operativ stoppmakt innen dagens feltoppdrag, men uten rett til å gjøre sikkerhetsansvar til artsfaglig, forskningsmessig eller offentlig myndighet.',
    status:'Høy situert feltstatus når laget ser at hun beskytter både mennesker, natur og datakvalitet; standing svekkes dersom stoppmakt brukes som generell rang.',
    power_over_player:'Kan endre eller stoppe feltaktivitet innen brief og sikkerhetsmandat og kreve tydelig dokumentasjon før gjenstart, men kan ikke gjøre et usikkert artsfunn sikkert, gi Naturveileder-kvalifikasjon eller fatte forvaltningsvedtak.',
    wants:'Et feltlag som kan levere observasjoner uten å late som vær, terreng, sårbarhet eller tidspress er irrelevante for kvalitet og sikkerhet.',
    conceals:'At hun selv kjenner prestasjonspress når en avbrutt dag ser ut som mindre produksjon, selv når stopp er riktig faglig og sikkerhetsmessig handling.',
    speech_style:'Kort, konkret og situasjonsnær; spør hva som har endret seg, hvilket stoppkriterium som gjelder og hvem som eier neste avklaring.',
    teaches_player:'At profesjonell feltstanding bygges når sikkerhetsgrensen faktisk brukes, ikke når laget lykkes i å unngå å snakke om risiko.'
  },
  {
    id:'amir_artsfaglig_world',
    social_function:'Amir gjør artsusikkerhet til en legitim faglig tilstand når et spennende funn, et godt foto eller publikums forventning skaper press for en rask identifikasjon.',
    class_position:'Artsfaglig kvalitetssikrer med høy situert kunnskapsmakt over identifikasjon og kildegrunnlag, men uten generell personal-, forvaltnings- eller forskningsmyndighet.',
    status:'Høy faglig standing når usikkerhet, kjennetegn og alternative arter er synlige; standing kan svekkes dersom ekspertstatus brukes som ubegrunnet fasit.',
    power_over_player:'Kan kreve bedre dokumentasjon, markere et funn uavklart og anbefale ny observasjon eller ekspertkontroll, men kan ikke gjøre manglende feltdata gyldige eller tildele yrkeskvalifikasjon.',
    wants:'Et arts- og observasjonsspor der det går an å se hva som faktisk ble sett, hvilke kjennetegn som støtter vurderingen og hva som fortsatt mangler.',
    conceals:'At egen ekspertidentitet også kan gjøre det sosialt vanskelig å si «vet ikke» når andre forventer en sikker artsbestemmelse.',
    speech_style:'Nøktern og diagnostisk; ber om kjennetegn, foto, lokalitet, årstid, alternativ art og eksplisitt grad av sikkerhet.',
    teaches_player:'At ekspertise skal gjøre usikkerhet mer presis, ikke bare gjøre svar mer bastante.'
  },
  {
    id:'nora_naturveileder_world',
    social_function:'Nora gjør publikumsforståelse, tilgjengelighet og naturhensyn til en reell profesjonell balanse i stedet for å behandle formidling som pynt etter at feltarbeidet er ferdig.',
    class_position:'Naturveileder med arbeidsgiver- og kvalifikasjonsforankret formidlingsansvar, høy situert publikumsmakt og begrenset myndighet over feltfakta hun ikke selv kan validere.',
    status:'Høy stående hos publikum når hun gjør nyanser forståelige og setter grenser for sårbare steder; standing svekkes når enkelhet blir falsk sikkerhet.',
    power_over_player:'Kan tilpasse språk, rute, format og læringsaktivitet og stoppe uegnet publikumsatferd innen arenaens mandat, men kan ikke gjøre publikumsrespons til feltdata eller oppheve kvalifikasjonskrav.',
    wants:'At folk går derfra med både forståelse, nysgjerrighet og respekt for at naturkunnskap kan være ufullstendig og lokaliteter kan kreve avstand.',
    conceals:'At hun også kjenner press for å levere en tydelig opplevelse selv når det mest faglig redelige svaret er mindre dramatisk.',
    speech_style:'Tilgjengelig, konkret og inviterende; oversetter faglige forbehold til spørsmål og observasjoner publikum faktisk kan følge.',
    teaches_player:'At god formidling ikke er å fjerne usikkerhet, men å gjøre det mulig å forstå hva usikkerheten betyr.'
  },
  {
    id:'jonas_hms_logistikk_world',
    social_function:'Jonas gjør det usynlige arbeidet med utstyr, metadata, logistikk og handoff synlig når andre først legger merke til det dersom noe mangler.',
    class_position:'HMS- og logistikkansvarlig med operativ kontroll over utstyrs- og overleveringskvalitet, men lavere symbolsk prestisje enn det spennende artsfunnet eller den synlige formidlingen.',
    status:'Høy situert driftsstanding når feltsporet kan rekonstrueres og neste eier får sann status; lavere oppmerksomhetsverdi når alt fungerer.',
    power_over_player:'Kan holde igjen utstyr, handoff eller dataflyt når sikkerhets- eller metadatafelt mangler, men kan ikke selv konkludere artsfaglig eller gi offentlig tillatelse.',
    wants:'Et oppdrag der hvem, hva, hvor, når, metode, avvik, prøve/foto-ID, ventepunkt og neste eier følger arbeidsobjektet hele veien.',
    conceals:'At gjentatt usynlighet kan gjøre det fristende å bruke regelverket som statusmarkør i stedet for å forklare hvilke mangler som faktisk skaper risiko.',
    speech_style:'Operativ og sporbar; spør hvilket ID-felt som mangler, hvilken kontroll som ikke er gjort og hvem som signerer neste handoff.',
    teaches_player:'At profesjonell tillit ofte bæres av arbeid som ikke ser heroisk ut, men som gjør senere korreksjon mulig.'
  },
  {
    id:'eva_besoksgruppe_world',
    social_function:'Eva representerer en skole-, turist- eller frivilliggruppe som ønsker nærhet, klare svar og en god opplevelse, og gjør publikumsforventning til et sosialt press som må møtes uten å skade natur eller faglighet.',
    class_position:'Besøks- eller gruppeansvarlig uten faglig eller offentlig myndighet, men med reell påvirkning på tempo, spørsmål, gruppedynamikk og hvordan opplevelsen vurderes.',
    status:'Høy situert publikumspåvirkning fordi gruppens reaksjoner er umiddelbare, men ingen rett til å omdefinere faglige eller sikkerhetsmessige grenser.',
    power_over_player:'Kan be om forklaring, tilgjengelighet, pauser og alternative ruter og kan velge å avbryte deltakelse, men kan ikke kreve adgang til sårbar lokalitet eller gjøre en pedagogisk forklaring til evidens.',
    wants:'En opplevelse som føles nær, forståelig og relevant uten at gruppen opplever grenser som tilfeldige eller moraliserende.',
    conceals:'At press for «noe å se» kan få gruppens opplevelsesbehov til å konkurrere med naturhensyn og faglig usikkerhet.',
    speech_style:'Direkte og praktisk; spør hva gruppen faktisk får se, hvorfor en grense gjelder og hvordan man kan forstå det uten spesialkunnskap.',
    teaches_player:'At publikumstillit kan øke når en grense forklares godt, selv om publikum ikke får alt de ønsket.'
  },
  {
    id:'tariq_lokalitetsforvalter_world',
    social_function:'Tariq gjør sårbarhet, ferdsel, lokale regler og forvaltningsgrenser synlige når felt- eller formidlingsmålet ellers kan gjøre stedet til en ren ressurs for data eller opplevelse.',
    class_position:'Lokalitetsforvalter eller stedseierkontakt med situert adgangs- og verneansvar der mandat finnes, men uten rett til å omskrive artsfakta eller forskningskonklusjoner.',
    status:'Høy situert stedstillit når begrensninger er forutsigbare og begrunnede; kan møtes med lavere status i team som prioriterer datainnsamling eller publikumstall.',
    power_over_player:'Kan håndheve eller formidle faktiske lokalitetsgrenser og kreve at teamet følger avtalte vilkår, men kan ikke gjøre organisatoriske ønsker til naturfaglig evidens eller gi kvalifikasjon.',
    wants:'At felt- og publikumsaktivitet kan fortsette uten slitasje, eksponering eller praksis som gjør lokaliteten dårligere for neste besøk eller neste sesong.',
    conceals:'At institusjonell risikofrykt også kan gjøre det fristende å være mer restriktiv enn nødvendig dersom dialogen er svak.',
    speech_style:'Grenseorientert og stedsspesifikk; viser til faktisk sårbarhet, vilkår, tidspunkt og hva som må endres for at aktiviteten skal kunne fortsette.',
    teaches_player:'At forvaltning av et sted og fortolkning av et funn er forskjellige myndighetsdomener som må holdes adskilt.'
  },
  {
    id:'private_relation_world',
    social_function:'Den private relasjonen møter personen etter en dag der sikkerhet, publikum og faglig usikkerhet fortsatt sitter i kroppen og gjør grensen mellom profesjonell beredskap og privat nærvær synlig.',
    class_position:'Privat likemann uten felt-, fag-, arbeidsgiver- eller forvaltningsmyndighet, men med reell makt til å sette grenser for arbeidets plass i hjem og identitet.',
    status:'Emosjonell nærhet uten profesjonell rang; tilliten handler om ærlighet, nærvær og evnen til å legge rollen bort.',
    power_over_player:'Kan kreve privatliv, tilstedeværelse og at konfidensielle lokaliteter eller personsaker ikke tas med hjem, men kan ikke avgjøre artsfunn, HMS, kvalifikasjon eller forvaltning.',
    wants:'At spilleren kan være et helt menneske også når dagens funn er uavklart, gruppen var misfornøyd eller feltplanen måtte avbrytes.',
    conceals:'At omsorg også kan bli utålmodig med faglige forbehold og ønske et enkelt svar på hvorfor dagen ble så krevende.',
    speech_style:'Varm, direkte og hverdagslig; spør om du kan legge feltleder- eller formidlerstemmen bort og være til stede uten å løse alt.',
    teaches_player:'At yrkesstanding er situert og at personlig verdi ikke bør følge dagens funn, publikumsrespons eller oppdragsstatus.'
  }
];

const slowAxes = [
  ['safety_judgment','Om spilleren bruker HMS- og stoppkriterier også når avbrudd koster tempo, data eller sosial prestisje.'],
  ['species_uncertainty_integrity','Om artsusikkerhet og alternative identifikasjoner forblir synlige til relevant kontroll faktisk finnes.'],
  ['field_traceability','Om observasjon, foto/prøve, lokalitet, tid, metode og avvik kan rekonstrueres etterpå.'],
  ['public_explanation_trust','Om publikum får forståelig språk uten at nyanser, begrensninger eller sårbarhet forsvinner.'],
  ['sensitive_nature_stewardship','Om naturhensyn og stedlige grenser tåler press fra opplevelse, tempo og databehov.'],
  ['handoff_reliability','Om neste eier får sann status, åpne spørsmål og eksplisitte ventepunkter i stedet for en glatt overlevering.'],
  ['professional_boundary_clarity','Om Feltassistent, Naturveileder, fagperson og forvalter beholder forskjellige kompetanse- og myndighetsgrenser.'],
  ['invisible_work_recognition','Om logistikk, metadata, korrigering og forberedelse blir behandlet som kvalitetsarbeid selv når de ikke er publikumsnære.'],
  ['private_role_containment','Om profesjonell beredskap og status kan legges bort uten at arbeidets usikkerhet blir gjort til privat rang.']
].map(([id,meaning]) => ({id,meaning,runtime_binding:'editorial_only_until_governed'}));

const threadDefs = [
  ['solveig_safety_judgment','Solveig følger hvordan spilleren bruker stoppkriterier og HMS gjennom skiftende vær, krevende rute og press for å levere. Relasjonen utvikler seg når spilleren gjør sikkerhetsgrunnlaget synlig før problemet oppstår, og den svekkes når stopp først brukes etter at risikoen er blitt sosialt umulig å ignorere. Solveig kan stoppe aktivitet innen mandat, men kan aldri gjøre sikkerhetsansvar til generell fag- eller forvaltningsmyndighet.',['1/morning','1/afternoon','4/morning','7/afternoon','10/morning','13/afternoon']],
  ['amir_species_uncertainty','Amir følger et usikkert artsfunn gjennom foto, alternative kjennetegn, ny observasjon og mulig ekspertkontroll. Relasjonen belønner presis usikkerhet fremfor rask sikkerhet: spilleren får mer faglig tillit når nye data kan endre vurderingen uten at tidligere logg skrives om. Amir kan kvalitetssikre identifikasjon, men kan ikke gjøre ekspertstatus til feltdata eller yrkeskvalifikasjon.',['2/morning','2/lunch','5/afternoon','8/morning','11/lunch','14/afternoon']],
  ['nora_public_explanation','Nora følger hvordan samme naturfaglige innhold må oversettes til ulike grupper uten at usikkerhet eller sårbarhetsgrenser forsvinner. Relasjonen utvikler seg gjennom spørsmål, misforståelser, korrigering og tilgjengelighet, og viser at publikum kan stole mer på en forklaring som innrømmer begrensninger enn på en glatt fasit. Naturveilederrollen krever fortsatt relevant arbeidsgiver-/utdanningskvalifikasjon.',['3/lunch','3/afternoon','6/lunch','9/afternoon','12/lunch','14/lunch']],
  ['jonas_metadata_handoff','Jonas følger det usynlige sporet fra brief og utstyr via foto/prøve-ID og avvik til handoff. Relasjonen blir sterkere når spilleren behandler metadata og neste eier som en del av selve kvaliteten, og svakere når mangler rekonstrueres for sent eller skjules i en pen rapport. Jonas kan stoppe en ufullstendig handoff, men ikke overta arts- eller forvaltningsmyndighet.',['1/lunch','4/afternoon','6/morning','8/afternoon','10/lunch','12/afternoon']],
  ['eva_visitor_trust','Eva gjør publikumsopplevelsen til et ekte sosialt press: gruppen vil ha nærhet, klare svar og framdrift, mens profesjonell formidling noen ganger må si «vi vet ikke ennå» eller velge en mindre nær rute. Relasjonen viser at situert publikumstillit kan øke når begrensninger forklares godt, men aldri kan gi adgang, artsbevis, kvalifikasjon eller forvaltningsmyndighet.',['3/morning','5/lunch','7/lunch','9/lunch','11/afternoon','13/lunch']],
  ['tariq_site_stewardship','Tariq følger hvordan felt- og formidlingsmål møter sårbar natur, ferdselsgrenser og lokalitetsvilkår. Relasjonen blir bedre når spilleren behandler stedet som en medgrense i arbeidet, ikke som en passiv scene, og når endringer i rute kan dokumenteres uten å late som datafangst eller publikumsopplevelse er viktigere enn vernegrunnlaget.',['2/afternoon','5/morning','7/morning','10/afternoon','12/morning','14/morning']],
  ['private_role_containment','Den private relasjonen følger etterklangen av avbrutte feltplaner, usikre funn og krevende publikumsdager. Tråden viser om spilleren kan legge profesjonell beredskap og status bort, beskytte konfidensiell lokalitetsinformasjon og være ærlig om at et uavklart funn eller en misfornøyd gruppe ikke er en dom over personlig verdi.',['1/evening','4/evening','6/evening','9/evening','11/evening','14/evening']]
];

const beatThreadIds = new Map();
for (const [id,,refs] of threadDefs) for (const ref of refs) beatThreadIds.set(ref,[...(beatThreadIds.get(ref)||[]),id]);

const dayFocus = [
  'feltbrief, vær og stoppkriterier',
  'usikkert artsfunn og dokumentasjonsgrad',
  'første publikumsgruppe og sårbar lokalitet',
  'metadatahull etter en travel feltdag',
  'ruteendring fordi naturhensyn kolliderer med observasjonsmål',
  'korrigering av en for enkel publikumsforklaring',
  'sikkerhetsavvik som krever gjenstart på nytt grunnlag',
  'nytt foto som svekker den første artsidentifikasjonen',
  'tilgjengelighetsbehov som krever annet formidlingsgrep',
  'prøve- og fotohandoff med åpent ventepunkt',
  'publikum deler en overdrevet versjon av det som ble sagt',
  'lokalitetsgrense og arbeidsgiverkrav peker i ulik retning',
  'fristpress før rapportering av feltoppdraget',
  'etterkontroll, korrigert artsvurdering og læring'
];
const phaseType = {morning:'task',lunch:'relationship',afternoon:'decision',evening:'private_consequence'};
const phases = ['morning','lunch','afternoon','evening'];

const commonBeat = (day,phase,focus,audience) => `Dag ${day}, ${phase}: ${focus}. Beatet følger det eksisterende arbeidsobjektet \`${PERSISTENT}\` og beholder feltbrief, rute, metode, direkte observasjon, prøve- og fotometadata, HMS, artsusikkerhet, sårbarhetsgrense, målgruppe, formidlingsbudskap, avvik, ventepunkt, handoff og neste eier som separate spor. Spilleren må skille det som faktisk ble observert fra mulig artsidentifikasjon og fra forklaringen som gis til publikum. Når arbeidet venter på værvindu, artsavklaring, prøve- eller fotometadata, HMS-avklaring, sårbarhetsvurdering, faglig kvalitetssjekk eller målgruppe/tilgjengelighet, skal ventingen ha navngitt grunn og eier og aldri behandles som godkjenning. Ny informasjon skal kunne gjenåpne bare den berørte observasjonen, prøven, ruten eller formidlingsforklaringen med tidligere versjon bevart. Feltassistent er fortsatt direct innen faktisk oppdrag og arbeidsgivermandat; Naturveileder er fortsatt qualification_required med relevant_education_or_employer_qualification. Profesjonell standing, publikumsglede, kollegaros eller Natur-Badge kan ikke gi denne kvalifikasjonen og kan ikke utvide rollefullmakten. Solveig, Amir, Nora og Jonas representerer ulike situerte kunnskapsformer: HMS og feltledelse, artsfaglig kvalitet, publikumsformidling og metadata/handoff. Ingen av dem kan ved status alene gjøre et funn sant, oppheve sikkerhetskrav, gi offentlig myndighet eller omdefinere hvem som eier en faglig eller forvaltningsmessig beslutning. Feltdata, foto og prøvegrunnlag forblir arbeidsobjekt-eid evidens med eget spor; sosial tillit kan påvirke hvem som deler informasjon og hvor mye kontroll som kreves, men aldri evidensens sannhetsverdi. History Go og Natur-Badge kan gi arts-, steds-, økologi- og naturhistorisk kontekst og hjelpe spilleren å stille bedre spørsmål, men er ikke feltobservasjon, artsbekreftelse, adgangstillatelse, HMS-godkjenning, relevant_education_or_employer_qualification eller forvaltningsmyndighet. Dersom History Go peker på en mulig art eller sammenheng, skal det bli et spørsmål som undersøkes i feltsporet, ikke et svar som kopieres inn som resultat. Det sosiale problemet i dette beatet er at riktig faglig og sikker handling kan koste tempo, publikumsbegeistring eller intern status akkurat nå, mens en glatt snarvei kan gi umiddelbar ros og senere skade tillit når foto, ny observasjon, værendring, lokalitetsgrense eller faglig kvalitetssjekk kommer tilbake. Hovedpublikummet her er \`${audience}\`, og deres standing skal bare påvirke relasjonen, tilgangen og informasjonsflyten i akkurat denne konteksten. Ingen global reputation-score, ny runtime-tilstand eller parallell sceneformat opprettes; beatet materialiseres gjennom én eksisterende canonical mail-kilde og Scene Pipeline. Den konkrete fasen krever dessuten at spilleren formulerer hva som er ferdig, hva som venter, hvilken usikkerhet som må sies høyt og hvem som faktisk eier neste steg. Dermed blir ${focus} et kontrollpunkt som kan komme tilbake senere uten at tidligere observasjon eller formidling omskrives.`;

const standingText = (day,phase,audience,focus) => `Situert konsekvens for \`${audience}\` på dag ${day}/${phase}: standing endres bare i denne relasjonen ut fra om spilleren håndterer ${focus} med sporbar observasjon, eksplisitt usikkerhet, riktig HMS-grense, korrekt handoff og respekt for forskjellen mellom Feltassistent, Naturveileder, artsfaglig kvalitetssikring og forvaltningsmyndighet. Et godt valg kan gjøre at denne målgruppen deler mer relevant lokal eller faglig informasjon, inviterer spilleren tidligere inn i neste avklaring, stoler mer på at et usikkert funn faktisk forblir usikkert, eller aksepterer en ruteendring fordi grunnen er forståelig. Et dårlig valg kan gjøre at de krever ekstra kontroll, begrenser tilgang, blir mer skeptiske til feltloggen eller slutter å stole på at publikum får samme forbehold som fagteamet. Ingen slik standing kan gjøre feltdata, foto, prøve eller artsidentifikasjon gyldig, oppfylle relevant_education_or_employer_qualification, gi HMS-godkjenning, oppheve sårbarhetsgrenser, fatte forvaltningsvedtak eller utøve politisk myndighet. Den kan heller ikke akkumuleres til ett globalt omdømmetall som følger spilleren på tvers av feltlag, publikum, lokalitetsforvaltning, arbeidsgiver og privatliv. History Go og Natur-Badge kan påvirke hvilke spørsmål spilleren stiller og hvilke forklaringer som blir mulig, men aldri sannhetsverdien i dagens observasjon. Hvis senere evidens, vær, artskontroll eller lokalitetsinformasjon endrer premisset, skal både arbeidskonklusjon og sosial vurdering kunne korrigeres uten at tidligere status brukes som forsvar.`;

const coverage = [];
let slot = 0;
for (let day=1; day<=14; day+=1) {
  for (const phase of phases) {
    const ref = canonicalRefs[slot % canonicalRefs.length];
    const audience = audiences[(slot + day) % audiences.length].id;
    const focus = dayFocus[day-1];
    coverage.push({
      day,
      phase,
      beat_type:phaseType[phase],
      summary:commonBeat(day,phase,focus,audience),
      thread_ids:beatThreadIds.get(`${day}/${phase}`) || [],
      materialization_refs:[ref],
      standing_audience:audience,
      standing_consequence:standingText(day,phase,audience,focus)
    });
    slot += 1;
  }
}

const primaryThreads = threadDefs.map(([id,relationship,beat_refs]) => ({id,relationship,beat_refs}));
const privateAftermath = [
  ['stoppet_feltdag_folger_hjem','En avbrutt feltdag følger hjem som en kroppslig følelse av å ha levert mindre, selv om stoppet var riktig. Den private relasjonen tester om spilleren kan forklare forskjellen mellom produksjon og profesjonell dømmekraft uten å gjøre hjemmet til et nytt evalueringsmøte. Konfidensielle lokaliteter og personsaker holdes ute av samtalen, og ingen privat støtte kan endre HMS-grunnlag eller feltdata.',[canonicalRefs[0],canonicalRefs[8]]],
  ['usikkert_artsfunn_blir_identitet','Et usikkert artsfunn har fått mye oppmerksomhet, og spilleren merker hvor fristende det er å forsvare den første identifikasjonen fordi den nå føles som en personlig prestasjon. Privat etterklang handler om å tåle at Amir eller ny dokumentasjon kan endre vurderingen uten at egen verdi faller sammen med artsnavnet.',[canonicalRefs[1],canonicalRefs[5]]],
  ['publikums_misnoye_etter_grense','En gruppe var skuffet over at den ikke fikk gå nærmere en sårbar lokalitet. Hjemme sitter irritasjonen igjen, og etterklangen undersøker om spilleren kan skille et legitimt publikumsønske fra ansvar for å gjøre alle fornøyde. God formidling kan være sosialt krevende uten at grensen derfor var feil.',[canonicalRefs[6],canonicalRefs[10]]],
  ['usynlig_metadataarbeid_etter_tid','En sen kvalitetssjekk av foto-, prøve- og observasjonsmetadata føles mindre meningsfull enn selve feltopplevelsen, men er det som gjør morgendagens handoff mulig. Privatlivet viser kostnaden ved usynlig arbeid og behovet for å avslutte på et definert punkt i stedet for å bære hele arbeidsobjektet videre gjennom kvelden.',[canonicalRefs[3],canonicalRefs[12]]],
  ['korrigert_formidling_etter_offentlighet','Spilleren har måttet korrigere en for enkel forklaring som allerede ble gjentatt av andre. Etter arbeidstid kommer skammen og ønsket om å forklare bort feilen. Den private relasjonen gjør det mulig å skille ansvarlig korreksjon fra personlig ydmykelse og minner om at profesjonell standing ikke er et globalt mål på verdi.',[canonicalRefs[7],canonicalRefs[14]]]
].map(([id,description,materialization_refs]) => ({id,description,materialization_refs}));

const delayedConsequences = [
  ['weather_stop_returns','1/morning','4/afternoon',['hms','field_data']],
  ['species_guess_returns','2/morning','5/afternoon',['species_quality','public_communication']],
  ['visitor_boundary_returns','3/afternoon','6/lunch',['public_trust','sensitive_nature']],
  ['metadata_gap_returns','4/afternoon','8/morning',['traceability','species_quality']],
  ['route_change_returns','5/morning','10/afternoon',['site_stewardship','delivery']],
  ['public_correction_returns','6/lunch','11/afternoon',['communication','reputation']],
  ['hms_restart_returns','7/afternoon','13/afternoon',['hms','employer_delivery']],
  ['final_species_revision_returns','8/morning','14/afternoon',['field_data','learning']]
].map(([id,setup_ref,return_ref,domains]) => ({id,setup_ref,return_ref,domains}));

const world = {
  schema:'civication_role_world_v1',
  version:1,
  category:CATEGORY,
  role_scope:ROLE,
  title:'Natur / Felt og formidling — sporbar observasjon, sårbar natur og situert tillit',
  status:'role_world_complete',
  sociological_core:{
    main_problem:'Hvordan kan Feltassistent og Naturveileder bygge tillit hos feltlag, fagpersoner, publikum, lokalitetsforvaltning og privatliv når profesjonell kvalitet ofte betyr å stoppe, si «usikkert», velge større avstand eller korrigere en forklaring som først ga mer begeistring?',
    description:'Role World-en lukker bare situated_reputation. Den gjør feltarbeidets og naturformidlingens sosiale kostnader synlige uten å gjøre standing til evidens, kvalifikasjon eller myndighet. Eksisterende 16-stegs plan, felt-/formidlingsobjekt, work loops, People/Places, Career-gater, authority boundary og Scene Pipeline beholdes.'
  },
  theme_ids:THEMES,
  social_environments:['feltbrief_og_utstyrsbase_natur','observasjonsflate_og_provetakingspunkt_natur','besokssenter_og_formidlingspunkt_natur','kvalitetssjekk_og_handoffbord_natur','saarbar_natur_og_lokalitetsforvaltning','gruppe_og_publikumssituasjon','arbeidsgiver_og_oppdragsdialog','privatliv'],
  recurring_people_archetypes:recurringPeople,
  slow_axes:slowAxes,
  situated_reputation_model:{
    global_score_allowed:false,
    audiences,
    divergence_examples:[
      'Feltleder kan stole mer på spilleren etter et tidlig værstopp, samtidig som arbeidsgiver opplever lavere leveransetempo.',
      'Artsfaglig kvalitet kan få høyere tillit når et spennende funn markeres usikkert, mens publikum blir mindre begeistret over at svaret ikke er endelig.',
      'Publikum kan få høyere tillit etter en ærlig korrigering, samtidig som spilleren kjenner mer skam fordi den første forklaringen allerede var delt.',
      'Lokalitetsforvalter kan få høyere tillit når gruppen holdes på avstand, selv om besøksgruppen vurderer opplevelsen som mindre nær.',
      'Metadata- og handoffmiljøet kan stole mer på en langsom overlevering med åpne felt, mens feltlaget helst vil avslutte dagen raskt.',
      'Arbeidsgiver kan mislike en endret rute, men senere få større tillit fordi feltloggen viste nøyaktig hvorfor sikkerhet og sårbarhet krevde den.',
      'Naturveilederkolleger kan stole mer på at spilleren bevarer forbehold, mens en populær formidlerstil mister noe av sin umiddelbare effekt.',
      'Privat relasjon kan få høyere tillit når spilleren legger bort jobbrangen, selv om profesjonell standing samme dag er under press.'
    ],
    authority_separation:'Standing er alltid audience-spesifikk og kan aldri summeres til en global reputation-score eller behandles som evidens, feltdata, artsbekreftelse eller HMS-godkjenning. Feltassistent forblir direct innen faktisk arbeidsgivermandat. Naturveileder forblir qualification_required med relevant_education_or_employer_qualification, og sosial tillit, publikumsglede, ekspertros, History Go eller Natur-Badge kan aldri oppfylle denne kvalifikasjonen. Feltleder, artsfaglig kvalitetssikrer, naturveileder, logistikk/HMS, besøksgrupper, lokalitetsforvalter og private relasjoner kan påvirke tilgang, informasjonsflyt og tillit i sin egen relasjon, men kan ikke gjøre observasjon, foto eller prøve sannere, skjule usikkerhet, oppheve HMS, gi forvaltningsmyndighet, fatte forvaltningsvedtak eller utøve politisk myndighet. History Go og Natur-Badge er læringsstøtte; de kan aldri være yrkeskvalifikasjon, feltbevis, adgangstillatelse eller myndighetsgrunnlag.'
  },
  history_go_affordance:{
    badge_id:'natur',
    source_ref:canonicalRefs.find((ref)=>ref.includes('/knowledge/')),
    better_question:'History Go kan brukes før og under feltarbeid til å oppdage arter, habitater, steder, økologiske relasjoner, naturhistoriske endringer og begreper som gjør observasjon og formidling bedre. En profesjonell bruk er å gjøre slik kontekst om til konkrete spørsmål i feltloggen: Hvilke kjennetegn må faktisk observeres før vi kan snevre inn artsidentifikasjonen? Hvilket vær, tidspunkt eller habitat kan gjøre dagens observasjon atypisk? Hvilken lokalitetsinformasjon må beskyttes fordi nærhet eller publisering kan øke belastningen? Hvilke deler av forklaringen til publikum er etablert naturkunnskap, og hvilke deler er foreløpig tolkning av dagens funn? Hvilken målgruppe trenger et annet eksempel eller en annen rute for å forstå det samme uten å presse sårbar natur? Spilleren skal deretter registrere direkte observasjon, foto eller prøve, metode, metadata, HMS, artsusikkerhet, lokalitetsgrense og faglig avklaring i det canonical arbeidsobjektet. Hvis History Go peker mot en interessant art eller sammenheng, er det en grunn til å se etter bestemte kjennetegn eller stille et bedre spørsmål — aldri et bevis for at arten faktisk ble observert i dag. Natur-Badge kan forbedre ordforråd, oppmerksomhet og spørsmål, men kan ikke gjøre Feltassistentens arbeid til forvaltningsvedtak, kan ikke oppfylle Naturveileders relevant_education_or_employer_qualification, kan ikke gi adgang til en sårbar lokalitet, kan ikke erstatte HMS-avklaring og kan ikke gjøre et usikkert artsfunn sikkert. God History Go-bruk gjør derfor skillet mellom læringskontekst og feltbevis tydeligere, ikke svakere.',
    authority_boundary:'History Go og Natur-Badge kan gi arts-, steds-, økologi- og naturhistorisk kontekst og bedre spørsmål, men kan ikke gi relevant_education_or_employer_qualification, arbeidsgivermandat, adgangstillatelse eller HMS-godkjenning; kan ikke fungere som feltdata, artsbekreftelse, prøvevaliditet eller forvaltningsvedtak; kan ikke oppheve sårbarhetsgrenser eller gjøre Feltassistent eller Naturveileder til politisk eller offentlig myndighet.'
  },
  cross_role_proof:{
    status:'candidate_when_shared_work_is_real_no_shared_object',
    shared_work_object_found:false,
    required_for_rollout:false,
    new_runtime:false,
    candidate_when_shared_work_is_real:true,
    rule:'Canonical readiness sier candidate_when_shared_work_is_real. Feltarbeidet kan senere dele et genuint persistent objekt med biolog/forsker, naturforvaltning eller andre roller, men denne rollout-evidensen beviser ikke et allerede governert delt runtime-work-object med eksplisitt eier og handoff. Role World fullføres derfor uten cross-role-link eller ny runtime; en senere kobling krever faktisk shared-work-bevis, ikke bare samme art, sted eller prosjekt.'
  },
  editorial_uniqueness:{
    not_copy_of:['natur/natur_biologi_og_forskning','kunst/kunst_publikum_og_formidling','subkultur/subkultur_program_og_koordinering'],
    rule:'Natur / Felt og formidling er særskilt bundet til direkte observasjon, prøve/foto-metadata, HMS, vær, sårbar natur, artsusikkerhet, besøksveiledning og offentlig korreksjon i felt. Den er ikke en forskningsverden med laboratorie/replikasjonsfokus, ikke en kunstpublikumsverden og ikke generell programkoordinering. Privat etterklang er koblet til feltberedskap, usikre funn og publikumspress.'
  },
  existing_work_continuity:{
    runtime_binding:'existing_mail_and_work_grammar',
    work_loops:grammar.work_loops,
    persistent_work_object:PERSISTENT,
    waiting_states:grammar.rhythm_contract.waiting_states,
    handoff_rule:grammar.persistent_work_object_contract.handoff_rule,
    rework_rule:grammar.rhythm_contract.rework_rule,
    new_runtime_state:false
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
    source_refs:canonicalRefs
  }
};

write(WORLD, world);

const indexPath = 'data/Civication/roleWorlds/index.json';
const index = read(indexPath);
index.roles = (index.roles || []).filter((entry)=>!(entry.category===CATEGORY && entry.role_scope===ROLE));
index.roles.push({category:CATEGORY,role_scope:ROLE,status:'role_world_complete',path:WORLD});
write(indexPath,index);

const checklistPath = 'data/Civication/roleWorldAuthoringChecklist.json';
const checklist = read(checklistPath);
checklist.reference_worlds = [...new Set([...(checklist.reference_worlds || []),WORLD])];
write(checklistPath,checklist);

const themePath = 'data/Civication/roleWorldThemeBank.json';
const themeBank = read(themePath);
themeBank.reference_profiles = themeBank.reference_profiles || {};
themeBank.reference_profiles[KEY] = THEMES;
write(themePath,themeBank);

fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,SOURCE),`# Natur / Felt og formidling — Role World rollout source-first\n\n## Scope lock\n\nCanonical role: \`${KEY}\`. Prerequisites are already complete. This rollout authors exactly **\`situated_reputation\`** and keeps the existing Career/work foundation intact. It creates **no global reputation score, no new runtime and no parallel scene format**.\n\n## Career and authority preserved\n\n- **Feltassistent** remains \`direct\` within real employer scope.\n- **Naturveileder** remains \`qualification_required\` with \`relevant_education_or_employer_qualification\`.\n- History Go and the Natur badge are learning support only: not field evidence, species confirmation, access permission, HMS approval, employment qualification or public authority.\n- The role may register documented observations, collect samples within method/safety limits, communicate quality-assured nature knowledge and escalate uncertainty or safety issues. It may not make management decisions, manufacture scientific conclusions, exercise political authority or hide uncertainty.\n\n## Role World\n\nThe world contains 8 bounded audiences, 9 slow editorial-only axes, 14 × 4 = 56 dramaturgical beats, 7 multi-day relationship threads, 5 private aftermaths and 8 delayed consequences. All **15 canonical prerequisite mails** are reused at least three times through existing Scene Pipeline provenance.\n\nThe sociological center is specific to field work and nature interpretation: a safe stop can look like low productivity; an uncertain species call can disappoint an audience; a sensitive site can force greater distance; invisible metadata and handoff work can matter more than the exciting observation; and a public correction can improve long-term trust while feeling personally costly. Standing remains audience-specific and never becomes evidence or a global score.\n\n## Cross-role\n\nReadiness is \`candidate_when_shared_work_is_real\`. No governed shared persistent runtime object is proven in this rollout, so **no cross-role link is materialized**. A later link requires genuine shared-work ownership and handoff evidence.\n\n## Editorial uniqueness\n\nThis is not a copy of Biologi/forskning, Kunst/Pubikum og formidling or a generic coordination world. It is grounded in direct observation, sample/photo metadata, HMS, weather, species uncertainty, sensitive nature, visitor guidance, correction and field-to-handoff continuity.\n\n## Verification target\n\nThe focused test must prove exact prerequisite continuity, all 15 provenance refs, bounded standing with divergent audiences, 56 unique beats, multi-day threads, private aftermath, delayed consequences, Career gate preservation, readiness completion, no factual-people contamination and no new runtime.\n`);

console.log(JSON.stringify({role:ROLE,world:WORLD,source_refs:canonicalRefs.length,beats:coverage.length,threads:primaryThreads.length,aftermaths:privateAftermath.length,delayed:delayedConsequences.length},null,2));