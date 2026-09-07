import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const CATEGORY = 'natur';
const ROLE = 'natur_forvaltning_og_radgivning';
const KEY = `${CATEGORY}/${ROLE}`;
const WORLD = `data/Civication/roleWorlds/${CATEGORY}/${ROLE}.json`;
const MODEL = `data/Civication/roleModels/${CATEGORY}/${ROLE}.json`;
const GRAMMAR = `data/Civication/workGrammars/${CATEGORY}/${ROLE}.json`;
const PLAN = `data/Civication/mailPlans/${CATEGORY}/${ROLE}_plan.json`;
const SOURCE = 'reports/CIVICATION_NATUR_FORVALTNING_OG_RADGIVNING_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md';
const TYPES = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const THEMES = ['professional_culture','bureaucratic_power','status_anxiety','shame_reputation','precarity','care_vs_efficiency','invisible_work','public_private_leakage','class_power'];
const PERSISTENT = 'bestilling_kunnskapsgrunnlag_naturverdi_regelverk_alternativer_avboting_restusikkerhet_og_radlogg';
const POLICY = {
  'Naturforvalter': {policy:'qualification_required',qualification_ids:['relevant_education_or_employer_qualification']},
  'Rådgiver (miljø/natur)': {policy:'qualification_required',qualification_ids:['relevant_education_or_employer_qualification']},
  'Seniorrådgiver (miljø/natur)': {policy:'qualification_required',qualification_ids:['relevant_education_or_employer_qualification']}
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
if (model.related_people.length !== 4 || grammar.actor_grammar.length !== 4 || grammar.place_grammar.length !== 4) throw new Error('Prerequisite People/Places drift');

const catalogPath = (type) => `data/Civication/mailFamilies/${CATEGORY}/${type}/${ROLE}_${type}.json`;
const canonicalRefs = TYPES.flatMap((type) => {
  const doc = read(catalogPath(type));
  return (doc.families || []).flatMap((family) => (family.mails || []).map((mail) => `${catalogPath(type)}#${mail.id}`));
});
if (canonicalRefs.length !== 15 || new Set(canonicalRefs).size !== 15) throw new Error(`Expected 15 canonical mails, got ${canonicalRefs.length}`);

const audiences = [
  ['faglig_kvalitet_og_naturforvaltning','evidence_integrity_standing','at datagap, naturverdi, kildekvalitet og faglig uenighet forblir synlige','at en anbefaling kan endres med nye data uten at tidligere versjon eller usikkerhet skjules'],
  ['plan_regelverk_og_mandat','mandate_legibility_standing','at hjemmel, planstatus, delegasjon og saksrolle ikke blandes sammen','at rådgiveren skiller faglig vurdering fra den som faktisk eier vedtaket'],
  ['kart_data_og_metode','data_traceability_standing','at kartlag, feltdata, metode, kildeår og geografisk dekning kan etterprøves','at tomme eller skjeve datasett ikke tolkes som bevis for fravær av naturverdi'],
  ['prosjekt_kvalitet_og_bestiller','delivery_integrity_standing','at leveransen er brukbar, sporbar og fristbevisst uten å mildne funn for å tilfredsstille bestiller','at rework og kvalitetssikring avgrenser berørt del i stedet for å omskrive hele saken'],
  ['beslutningseier_og_forvaltningsledelse','decision_basis_trust_standing','at beslutningsgrunnlaget viser alternativer, avbøting, restkonsekvens og restusikkerhet tydelig','at anbefalingen kan brukes i en beslutning uten å late som rådgiveren selv har vedtaksmyndighet'],
  ['tiltakshaver_og_oppdragsgiver','commissioner_fairness_standing','at premisser, kostnader, alternativer og naturfaglige begrensninger blir forklart uten skjult agenda','at ønsket prosjektutfall ikke behandles som evidens og at realistiske alternativer faktisk sammenlignes'],
  ['tverrfaglige_kolleger_og_horingsmiljo','interdisciplinary_openness_standing','at uenighet mellom natur, plan, teknikk og gjennomføring blir eksplisitt og analyserbar','at innspill kan endre berørt premiss uten å bli sosial rang eller automatisk faglig fasit'],
  ['private_relations','private_role_containment_standing','at yrkesstatus, fristpress og vanskelige konsekvensvurderinger kan legges bort etter arbeidstid','at personlig verdi ikke følger om bestiller, leder eller beslutningseier likte dagens faglige råd']
].map(([id,standing_axis,a,b]) => ({
  id,
  standing_axis,
  cares_about:[a,b],
  cannot_grant:`Denne målgruppen kan påvirke samarbeid, tilgang til informasjon, hvor tidlig spilleren inviteres inn i en avklaring, hvor mye ekstra kontroll som kreves, og hvor stor situert tillit spilleren har i akkurat denne relasjonen. Den kan ikke gjøre et kartlag, feltdata, kilde, juridisk premiss, naturverdi eller faglig konklusjon sannere enn dokumentasjonen; sosial standing er aldri evidens. Den kan ikke skjule datagap, gjøre manglende registrering til bevis for fravær, oppheve relevant regelverk, endre delegasjon, gi juridisk hjemmel eller gjøre et faglig råd til et politisk eller administrativt vedtak. Naturforvalter, Rådgiver (miljø/natur) og Seniorrådgiver (miljø/natur) forblir alle qualification_required gjennom relevant_education_or_employer_qualification; ros, senioritet, kundetilfredshet, nettverk, History Go eller Natur-Badge kan aldri oppfylle denne porten. Målgruppen kan heller ikke gi spilleren generell forvaltningsmyndighet, utnevne spilleren til beslutningseier, overstyre lovverk, gjøre en bestillers ønskede utfall til faglig funn eller summeres sammen med andre målgrupper til én global reputation-score. History Go og Natur-Badge er læringsstøtte som kan gi arter, steder, økologisk og naturhistorisk kontekst og bedre kontrollspørsmål, men ikke feltdata, saksbevis, relevant_education_or_employer_qualification, delegasjon, hjemmel eller vedtaksmyndighet.`
}));

const recurringPeople = [
  {
    id:'ingrid_fagansvarlig_world',
    social_function:'Ingrid gjør faglig uavhengighet sosialt synlig når prosjektet ønsker framdrift, klare svar eller en mildere naturfaglig vurdering enn datagrunnlaget tåler.',
    class_position:'Fagansvarlig naturforvalter med høy situert kvalitetsmakt over problemavgrensning, naturverdi, datagap og faglig råd, men uten rett til å gjøre fagansvar til politisk eller administrativ vedtaksmyndighet.',
    status:'Høy faglig standing når premisser, datagap og uenighet tåler innsyn; standing svekkes dersom senioritet brukes som erstatning for evidens eller som skjult instruks om ønsket konklusjon.',
    power_over_player:'Kan kreve rework, tydeligere naturfaglig begrunnelse og avgrenset råd innen mandat, men kan ikke bestille et bestemt funn, oppheve kvalifikasjonskrav eller fatte vedtaket som en annen beslutningseier eier.',
    wants:'Et beslutningsgrunnlag som kan etterprøves og endres med nye data uten at rådgiverens integritet eller tidligere versjoner skjules.',
    conceals:'At hun selv kjenner statuspress når en faglig forsiktig konklusjon gjør leveransen mindre beslutningsklar enn ledelsen hadde håpet.',
    speech_style:'Nøktern og analytisk; spør hva datagrunnlaget faktisk støtter, hvilke premisser som er usikre og hva som må sies eksplisitt før anbefalingen kan stå.',
    teaches_player:'At faglig tillit bygges ved å vise begrensninger før andre tvinger dem fram, ikke ved å levere mest mulig sikkerhet.'
  },
  {
    id:'henrik_plan_regelverk_world',
    social_function:'Henrik gjør mandat, planstatus, delegasjon og regelverk til en sosial grense når faglig råd begynner å bli omtalt som om beslutningen allerede er tatt.',
    class_position:'Plan- og regelverksrådgiver med situert tolkningsmakt over prosess og mandatspor, men uten rett til å omskrive naturfaglige funn eller utvide sin egen offentlige myndighet.',
    status:'Høy standing når han gjør myndighetsgrenser lesbare og avklarer hva som faktisk må eskaleres; lavere tillit dersom juridisk språk brukes som rang eller tåkelegging.',
    power_over_player:'Kan kreve mandatavklaring, korrigere feil språk om hjemmel eller delegasjon og holde igjen handoff ved uklar saksrolle, men kan ikke gjøre rådgiveren til vedtaksmyndighet.',
    wants:'At faglig råd kan inngå i en lovlig og forståelig prosess uten mandatglidning eller retorisk forskuttering av utfallet.',
    conceals:'At prosessikkerhet kan bli et statusvern også når den reelle uklarheten burde forklares enklere og tidligere.',
    speech_style:'Presis og rolleorientert; spør hvem som eier beslutningen, hvilket premiss som faktisk er avklart og hvilket språk som må endres før saken går videre.',
    teaches_player:'At tydelig myndighetsgrense er en del av faglig kvalitet, ikke administrativ pynt.'
  },
  {
    id:'sara_kart_data_world',
    social_function:'Sara gjør datadekning, kartlag, metode, kildeår og geografisk avgrensning synlige når et pent kart frister prosjektet til å tro at kunnskapsgrunnlaget er mer komplett enn det er.',
    class_position:'Kart- og dataanalytiker med høy situert teknisk kunnskapsmakt, men uten rett til å gjøre datateknisk ekspertise til generell naturfaglig eller offentlig myndighet.',
    status:'Høy metodisk standing når datakilder, skjevheter og versjoner er sporbare; standing svekkes dersom visualiseringens autoritet brukes til å skjule datagap.',
    power_over_player:'Kan kreve kilde- og metodeangivelse, markere datagap og gjenåpne berørte analyser når data endres, men kan ikke velge prosjektutfall eller gjøre fravær i datasettet til bevis for fravær i naturen.',
    wants:'Et datagrunnlag der andre kan forstå hva kartet viser, hva det ikke viser og hvilke nye data som kan endre konklusjonen.',
    conceals:'At teknisk sikkerhet i kartproduktet kan gjøre det sosialt vanskelig å framheve hvor ujevnt rågrunnlaget faktisk er.',
    speech_style:'Metodisk og konkret; ber om lag, kildeår, oppløsning, metode, geografisk dekning, mangler og eksplisitt versjon.',
    teaches_player:'At et tomt kartfelt er et spørsmål om dekning før det er et svar om naturverdi.'
  },
  {
    id:'mona_prosjekt_kvalitet_world',
    social_function:'Mona gjør frist, bestillerbehov, kvalitetssikring og leveransepress til en reell profesjonell konflikt uten å la prosjektstyring overta faglig konklusjon.',
    class_position:'Prosjekt- og kvalitetssikringsansvarlig med situert makt over leveranseform, frister og rework, men uten rett til å mildne funn eller gjøre bestillerens preferanse til evidens.',
    status:'Høy driftsstanding når hun gjør forventninger, avvik og rework håndterbare; standing svekkes dersom leveransestatus brukes til å presse fram sterkere sikkerhet enn premissene tåler.',
    power_over_player:'Kan prioritere leveransearbeid, kreve kvalitetssikring og be om alternative formuleringer innen samme faglige sannhet, men kan ikke bestemme naturfaglig funn eller fatte vedtak.',
    wants:'En leveranse som er brukbar for beslutningseier, ferdig nok til fristen og ærlig om det som fortsatt er uavklart.',
    conceals:'At ansvar for tid og kunde kan gjøre det fristende å behandle en tydelig usikkerhet som et kommunikasjonproblem i stedet for et faglig premiss.',
    speech_style:'Praktisk og sekvenserende; spør hva som kan leveres nå, hva som må merkes uavklart, hva som gjenåpnes og hvem som eier neste kontroll.',
    teaches_player:'At god prosjektleveranse ikke betyr å fjerne ubehagelige premisser, men å gjøre dem handlingsbare.'
  },
  {
    id:'decision_owner_world',
    social_function:'Beslutningseieren representerer den administrative eller politiske rollen som faktisk skal velge mellom alternativer, og gjør det synlig at et godt faglig råd kan bli fulgt, delvis fulgt eller avvist uten at rådgiveren dermed overtar vedtaket.',
    class_position:'Formell beslutningseier med situert institusjonell makt innen faktisk hjemmel og delegasjon; kan ha høyere organisatorisk rang enn rådgiveren, men kan ikke endre hva naturdataene viser ved status alene.',
    status:'Høy institusjonell standing fordi rollen eier beslutningen, men faglig tillit avhenger av at premisser og usikkerhet kan etterprøves.',
    power_over_player:'Kan velge mellom lovlige alternativer og be om ytterligere utredning innen mandat, men kan ikke gjøre sin preferanse til naturfaglig evidens eller oppheve rådgiverens kvalifikasjons- og integritetskrav.',
    wants:'Et beslutningsgrunnlag der konsekvenser, alternativer, avbøting og restusikkerhet er tydelige nok til at ansvaret for valget ikke skjules bak rådgiveren.',
    conceals:'At beslutningspress kan skape et ønske om ett entydig faglig svar selv når reelle verdi- og prioriteringsvalg gjenstår.',
    speech_style:'Beslutningsorientert; spør hva som skiller alternativene, hvilke konsekvenser som er robuste og hvilke valg som fortsatt er normative eller politiske.',
    teaches_player:'At rådgiverens jobb er å gjøre valget bedre informert, ikke å gjøre beslutningseieren ansvarsfri.'
  },
  {
    id:'commissioner_world',
    social_function:'Tiltakshaver eller oppdragsgiver gjør økonomi, framdrift og ønsket prosjektutfall til et sosialt press som må møtes saklig uten å demonisere bestilleren eller bøye evidensen.',
    class_position:'Bestiller med kontrakts- og prosjektmakt, men uten automatisk faglig eller offentlig myndighet over rådgiverens naturfaglige vurdering.',
    status:'Høy situert innflytelse over bestilling, informasjon og prosjektets videre bruk av leveransen; faglig standing avhenger av å respektere sporbare premisser.',
    power_over_player:'Kan stille spørsmål, levere prosjektopplysninger og be om realistiske alternativer eller tydeligere konsekvensbeskrivelse, men kan ikke kjøpe et bestemt faglig funn eller oppheve regelverk.',
    wants:'Et råd som gir reelle handlingsalternativer og forklarer hva som må endres for å redusere naturkonsekvens eller usikkerhet.',
    conceals:'At økonomisk og tidsmessig risiko kan gjøre en mildere formulering følelsesmessig mer attraktiv enn en bedre begrunnet konklusjon.',
    speech_style:'Resultat- og gjennomføringsorientert; spør hva som faktisk må endres, hva som er krav, hva som er råd og hvilke alternativer som er realistiske.',
    teaches_player:'At faglig uavhengighet ikke krever sosial avstand fra bestiller, men sporbare grenser for hva bestiller kan påvirke.'
  },
  {
    id:'private_relation_world',
    social_function:'Den private relasjonen møter spilleren etter dager med bestillerpress, usikker naturverdi og beslutninger som kan få store konsekvenser, og gjør grensen mellom profesjonell ansvarsfølelse og privat identitet synlig.',
    class_position:'Privat likemann uten fag-, arbeidsgiver-, kontrakts- eller forvaltningsmyndighet, men med reell makt til å sette grenser for arbeidets plass i hjem og nærhet.',
    status:'Emosjonell nærhet uten yrkesrang; tillit handler om tilstedeværelse og ærlighet, ikke om hvor høyt rådgiverens anbefaling ble vurdert av systemet.',
    power_over_player:'Kan kreve privatliv, nærvær og at konfidensielle saksopplysninger ikke tas med hjem, men kan ikke avgjøre naturverdi, regelverk, kvalifikasjon eller vedtak.',
    wants:'At spilleren kan legge fra seg både seieren ved å bli hørt og skammen ved å bli overprøvd uten å gjøre hjemmet til et ekstra kvalitetssikringsmøte.',
    conceals:'At omsorg også kan ønske et enklere moralsk svar enn en sak med flere lovlige alternativer og reell restusikkerhet gir.',
    speech_style:'Varm og direkte; spør hva som faktisk er ditt ansvar, hva du må la beslutningseieren eie og om du klarer å være til stede uten å fortsette saken hjemme.',
    teaches_player:'At personlig verdi ikke måles i organisatorisk gjennomslag, kundetilfredshet eller hvor sikker en vanskelig konsekvensvurdering føltes.'
  }
];

const slowAxes = [
  ['evidence_traceability','Om data, kilde, metode, naturverdi og datagap forblir sporbare også når prosjektet trenger en rask konklusjon.'],
  ['mandate_clarity','Om faglig råd, administrativ prosess, delegasjon og faktisk vedtaksmyndighet holdes fra hverandre.'],
  ['uncertainty_integrity','Om restusikkerhet og uenighet blir synlige premisser i stedet for kommunikasjon som skal glattes over.'],
  ['alternative_realism','Om alternativene er reelt gjennomførbare og sammenlignes på samme premisser, ikke konstrueres for å legitimere et foretrukket utfall.'],
  ['mitigation_integrity','Om avbøting beskriver faktisk virkning og restkonsekvens uten å bli symbolsk grønnvasking.'],
  ['commissioner_independence','Om bestiller- og fristpress kan håndteres uten at ønsket utfall blir faglig funn.'],
  ['procedural_legibility','Om beslutningseier, handoff, ventepunkt og regelverk er forståelige nok til at ansvar ikke skjules i prosessen.'],
  ['invisible_quality_work','Om kildekontroll, versjonering, rework og kvalitetssikring behandles som faglig arbeid selv når de forsinker synlig levering.'],
  ['private_role_containment','Om rådgiverstatus, konflikt og beslutningspress kan legges bort uten å bli privat rang eller personlig verdi.']
].map(([id,meaning]) => ({id,meaning,runtime_binding:'editorial_only_until_governed'}));

const threadDefs = [
  ['ingrid_evidence_integrity','Ingrid følger hvordan spilleren beskytter faglig uavhengighet gjennom datagap, naturverdier, uenighet og nye premisser. Relasjonen utvikler seg når spilleren synliggjør begrensninger før de blir oppdaget av andre, og når nye data kan endre rådet uten defensiv omskriving. Ingrid kan kreve rework og faglig begrunnelse, men kan aldri gjøre fagansvar til politisk eller administrativ vedtaksmyndighet.',['1/morning','1/afternoon','4/morning','7/afternoon','10/morning','13/afternoon']],
  ['henrik_mandate_legibility','Henrik følger skillet mellom faglig råd, regelverk, delegasjon og faktisk beslutningseier gjennom hele saken. Tillit øker når spilleren bruker presist språk om hva som er funn, råd, krav og vedtak, og svekkes når organisatorisk rang eller hastverk får mandatet til å flyte. Henrik kan kreve prosessavklaring, men ikke overta naturfaglig evidens.',['2/morning','2/lunch','5/afternoon','8/morning','11/lunch','14/afternoon']],
  ['sara_data_traceability','Sara følger kart- og datagrunnlaget fra første avgrensning via skjev dekning og nye registreringer til senere revisjon. Relasjonen belønner at tomme felt behandles som datagap før de behandles som fravær av naturverdi, og at berørte analyser gjenåpnes når kildeår, metode eller geografi endres.',['3/morning','3/afternoon','6/morning','9/afternoon','12/morning','14/morning']],
  ['mona_delivery_integrity','Mona følger hvordan kvalitet, frist, bestillerbehov og rework kan sameksistere. Relasjonen styrkes når spilleren kan levere en tydelig avgrenset versjon med åpne premisser og navngitt neste kontroll, og svekkes når usikkerhet skjules for å gjøre leveransen penere. Mona kan styre prosjektflyt, men ikke faglig sannhet eller vedtak.',['1/lunch','4/afternoon','6/lunch','8/afternoon','10/lunch','12/afternoon']],
  ['decision_owner_accountability','Beslutningseieren følger hvordan rådet oversettes til reelle valg uten at rådgiveren tar over ansvaret for dem. Relasjonen viser at beslutningstillit kan øke når alternativer, restkonsekvens og normative valg er tydelige, selv om rådgiverens foretrukne alternativ ikke velges. Formell rang kan ikke omskrive naturdata.',['3/lunch','5/lunch','7/lunch','9/lunch','11/afternoon','13/lunch']],
  ['commissioner_independence','Bestilleren følger saken fra ønsket prosjektutfall via naturfaglige begrensninger til realistiske alternativer og avbøting. Tillit kan øke når spilleren forklarer hva som faktisk kan påvirkes uten å demonisere bestilleren, men svekkes når formuleringer kjøpes sosialt eller datagap skjules. Bestillermakt er ikke evidens eller myndighet.',['2/afternoon','5/morning','7/morning','10/afternoon','12/lunch','14/lunch']],
  ['private_role_containment','Den private relasjonen følger etterklangen av å bli presset, overprøvd, hørt eller ignorert i vanskelige saker. Tråden viser om spilleren kan beskytte konfidensialitet, legge organisatorisk status bort og skille egen verdi fra hvorvidt rådet ble fulgt. Privat støtte kan ikke endre evidens, kvalifikasjon, regelverk eller vedtaksansvar.',['1/evening','4/evening','6/evening','9/evening','11/evening','14/evening']]
];

const beatThreadIds = new Map();
for (const [id,,refs] of threadDefs) for (const ref of refs) beatThreadIds.set(ref,[...(beatThreadIds.get(ref)||[]),id]);

const dayFocus = [
  'bestilling, mandat og hvem som faktisk eier beslutningen',
  'første datagap og fristpress for en tidlig konklusjon',
  'kartlag som ser komplett ut men har skjev geografisk dekning',
  'naturverdi som bestiller ønsker formulert mildere',
  'regelverksavklaring som endrer hvilket alternativ som er realistisk',
  'tverrfaglig uenighet om metode og konsekvens',
  'avbøting som reduserer noe men etterlater betydelig restkonsekvens',
  'ny feltinformasjon som gjenåpner bare deler av analysen',
  'beslutningseier ber om tydeligere sammenligning mellom alternativer',
  'bestillerpresser før en synlig milepæl',
  'rådgiverens formulering blir omtalt som om vedtaket allerede er tatt',
  'kvalitetssikring avdekker at et sentralt premiss må versjoneres',
  'leveransefrist mens restusikkerhet fortsatt er materiell',
  'slutthandoff der beslutningseier må eie valget og rådgiveren læringen'
];
const phaseType = {morning:'task',lunch:'relationship',afternoon:'decision',evening:'private_consequence'};
const phases = ['morning','lunch','afternoon','evening'];

const commonBeat = (day,phase,focus,audience) => `Dag ${day}, ${phase}: ${focus}. Beatet følger det eksisterende arbeidsobjektet \`${PERSISTENT}\` og beholder bestilling, mandat, faktisk beslutningseier, kilde- og dataversjon, naturverdi, datagap, regelverkspremiss, realistiske alternativer, avbøting, restkonsekvens, restusikkerhet, interessekonflikt, habilitet, ventepunkt, handoff og neste eier som separate spor. Spilleren må skille det som er observerbart eller kildebelagt fra faglig tolkning, anbefaling og den senere administrative eller politiske beslutningen. Når arbeidet venter på feltdata eller kartlegging, regelverksavklaring, tiltakshaveropplysninger, tverrfaglig innspill, kvalitetssikring, beslutningseier eller nye data/premiss, skal ventingen ha navngitt grunn og eier og aldri behandles som godkjenning. Nye data, ny geografisk avgrensning, endret regelverkspremiss eller et nytt realistisk alternativ skal kunne gjenåpne bare berørt analyse med tidligere versjon bevart. Naturforvalter, Rådgiver (miljø/natur) og Seniorrådgiver (miljø/natur) forblir alle qualification_required med relevant_education_or_employer_qualification. Profesjonell standing, kundetilfredshet, lederros, senioritet, nettverk, History Go eller Natur-Badge kan ikke oppfylle denne kvalifikasjonen eller utvide rollefullmakten. Ingrid, Henrik, Sara og Mona representerer forskjellige situerte kontrollformer: faglig uavhengighet, mandat/regelverk, data/metode og prosjekt/kvalitet. Ingen av dem kan ved status alene gjøre et funn sant, oppheve lovverk, tildele seg selv delegasjon eller gjøre rådgiverens anbefaling til vedtak. Beslutningseier og bestiller kan påvirke behov, alternativer, informasjonsflyt og prioritering, men deres preferanse er ikke naturfaglig evidens. Et tomt kartfelt kan være et datagap, et avbøtende tiltak kan redusere konsekvens uten å eliminere den, og en lovlig beslutning kan innebære et annet verdivalg enn rådgiverens foretrukne faglige anbefaling. History Go og Natur-Badge kan gi arts-, steds-, økologi- og naturhistorisk kontekst og hjelpe spilleren å stille bedre kontrollspørsmål, men er ikke feltdata, juridisk hjemmel, saksbevis, relevant_education_or_employer_qualification, delegasjon eller vedtaksmyndighet. Dersom History Go peker mot en relevant art, lokalitet eller økologisk sammenheng, blir det et spørsmål til kunnskapsgrunnlaget, ikke et resultat som kopieres inn. Det sosiale problemet i beatet er at faglig redelighet kan koste tempo, kundetilfredshet, lederstøtte eller følelsen av å være beslutningsklar akkurat nå, mens en glatt snarvei kan få umiddelbar sosial belønning og senere skade tillit når kilde, kartlag, regelverk, kvalitetssikring eller ny data kommer tilbake. Hovedpublikummet her er \`${audience}\`, og standing skal bare påvirke relasjonen, tilgangen og informasjonsflyten i akkurat denne konteksten. Ingen global reputation-score, ny runtime-tilstand eller parallell sceneformat opprettes; beatet materialiseres gjennom én eksisterende canonical mail-kilde og Scene Pipeline. Den konkrete fasen krever også at spilleren formulerer hva som er funn, hva som er råd, hva som er uavklart, hvem som faktisk kan beslutte og hvilket premiss som kan gjenåpne saken senere. Dermed blir ${focus} et profesjonelt kontrollpunkt som kan komme tilbake uten at tidligere dokumentasjon eller ansvar omskrives.`;

const standingText = (day,phase,audience,focus) => `Situert konsekvens for \`${audience}\` på dag ${day}/${phase}: standing endres bare i denne relasjonen ut fra om spilleren håndterer ${focus} med sporbar evidens, eksplisitt usikkerhet, realistiske alternativer, korrekt mandat og en handoff som viser hvem som eier neste steg. Et godt valg kan gjøre at målgruppen deler mer relevant informasjon, inviterer spilleren tidligere inn i neste avklaring, godtar at et datagap krever venting eller får større tillit til at rådet tåler kontroll selv når konklusjonen er ubehagelig. Et dårlig valg kan føre til ekstra kvalitetssikring, mindre informasjonsdeling, svakere tillit til kart- og kildegrunnlaget eller større mistanke om at rådgiveren enten følger bestiller ukritisk eller bruker fagstatus til å overta beslutningen. Ingen slik standing kan gjøre feltdata, kart, naturverdi eller juridisk premiss gyldig, oppfylle relevant_education_or_employer_qualification, gi delegasjon, oppheve lovverk eller fatte politisk eller administrativt vedtak. Den kan heller ikke akkumuleres til ett globalt omdømmetall på tvers av fagmiljø, bestiller, beslutningseier, kolleger og privatliv. History Go og Natur-Badge kan påvirke hvilke spørsmål spilleren stiller, men aldri sannhetsverdien eller hjemmelen. Hvis senere data, kvalitetssikring, regelverksavklaring eller beslutningsbehov endrer premisset, skal både rådet og den sosiale vurderingen kunne korrigeres uten at tidligere standing brukes som forsvar mot ny evidens.`;

const coverage = [];
let slot = 0;
for (let day=1; day<=14; day+=1) {
  for (const phase of phases) {
    const ref = canonicalRefs[slot % canonicalRefs.length];
    const audience = audiences[slot % audiences.length].id;
    const focus = `${dayFocus[day-1]} — ${phase}`;
    coverage.push({
      day,
      phase,
      beat_type:phaseType[phase],
      summary:commonBeat(day,phase,focus,audience),
      materialization_refs:[ref],
      thread_ids:beatThreadIds.get(`${day}/${phase}`) || [],
      standing_audience:audience,
      standing_consequence:standingText(day,phase,audience,focus)
    });
    slot += 1;
  }
}

const primaryThreads = threadDefs.map(([id,relationship,beat_refs]) => ({id,relationship,beat_refs}));
const privateAftermath = [
  ['radet_ble_ikke_fulgt','Et faglig råd ble ikke fulgt av beslutningseieren, og spilleren tar med seg følelsen av å ha mislyktes selv om kunnskapsgrunnlaget var redelig og mandatet tydelig. Den private relasjonen undersøker om spilleren kan la beslutningsansvaret ligge hos den formelle rollen uten å bli likegyldig til konsekvensene. Konfidensielle saksopplysninger holdes ute av hjemmet, og privat støtte kan aldri endre evidens, delegasjon eller vedtak.',[canonicalRefs[0],canonicalRefs[8]]],
  ['bestillerpress_sitter_i_kroppen','En krevende bestillersamtale fortsetter mentalt etter arbeidstid. Spilleren kjenner både irritasjon og behov for å bevise sin uavhengighet. Etterklangen skiller faglig integritet fra identiteten som den som alltid må stå imot, og minner om at profesjonell grense kan holdes saklig uten at konflikten må videreføres privat.',[canonicalRefs[1],canonicalRefs[5]]],
  ['datagap_som_skam','Et datagap som burde vært oppdaget tidligere er nå synlig i kvalitetssikringen. Skammen kan friste spilleren til å bagatellisere feilen eller jobbe uten slutt. Privat etterklang handler om å tåle ansvarlig korreksjon, avgrense rework og avslutte dagen uten å gjøre personlig verdi avhengig av at alle premisser var perfekte fra første versjon.',[canonicalRefs[6],canonicalRefs[10]]],
  ['beslutningsnærhet_blir_status','Spilleren har vært tett på en synlig beslutningsprosess og merker hvor lett organisatorisk nærhet kan føles som personlig rang. Hjemme testes evnen til å legge seniorrådgiverstemmen bort, ikke dele konfidensielt materiale og huske at tilgang til beslutningseier ikke gir større menneskelig verdi eller ekstra myndighet.',[canonicalRefs[3],canonicalRefs[12]]],
  ['restkonsekvens_uten_enkelt_svar','Saken ender med reell restkonsekvens selv etter avbøting, og ingen løsning føles moralsk ren. Den private relasjonen gir plass til uro uten å gjøre hjemmet til en ny beslutningsarena. Spilleren kan erkjenne at faglig arbeid gjorde konsekvensene tydeligere samtidig som selve verdivalget fortsatt måtte eies av den formelle beslutningseieren.',[canonicalRefs[7],canonicalRefs[14]]]
].map(([id,description,materialization_refs]) => ({id,description,materialization_refs}));

const delayedConsequences = [
  ['mandate_drift_returns','1/morning','4/afternoon',['mandate','decision_accountability']],
  ['data_gap_returns','2/morning','5/afternoon',['data_quality','natural_value']],
  ['map_coverage_returns','3/afternoon','6/lunch',['traceability','interdisciplinary_work']],
  ['commissioner_pressure_returns','4/afternoon','8/morning',['professional_independence','delivery']],
  ['regulatory_premise_returns','5/morning','10/afternoon',['regulation','alternative_analysis']],
  ['disciplinary_disagreement_returns','6/lunch','11/afternoon',['quality_assurance','reputation']],
  ['mitigation_claim_returns','7/afternoon','13/afternoon',['mitigation','residual_effect']],
  ['final_decision_handoff_returns','8/morning','14/afternoon',['decision_basis','learning']]
].map(([id,setup_ref,return_ref,domains]) => ({id,setup_ref,return_ref,domains}));

const world = {
  schema:'civication_role_world_v1',
  version:1,
  category:CATEGORY,
  role_scope:ROLE,
  title:'Natur / Forvaltning og rådgivning — beslutningsgrunnlag, mandat og situert tillit',
  status:'role_world_complete',
  sociological_core:{
    main_problem:'Hvordan kan Naturforvalter og miljørådgiver bygge tillit hos fagmiljø, bestiller, beslutningseier og kolleger når profesjonell kvalitet ofte betyr å synliggjøre datagap, avvise et ønsket funn, holde alternativer åpne eller si at rådet ikke er selve vedtaket?',
    description:'Role World-en lukker bare situated_reputation. Den gjør rådgivningsarbeidets sosiale kostnader synlige uten å gjøre standing til evidens, kvalifikasjon, hjemmel eller myndighet. Eksisterende 16-stegs plan, persistent beslutningsgrunnlag, work loops, People/Places, Career-gater, authority boundary og Scene Pipeline beholdes.'
  },
  theme_ids:THEMES,
  social_environments:['mandat_og_kunnskapsgrunnlagsbord_natur','regelverk_plan_og_mandatspor_natur','kart_data_og_naturverdiflate_natur','alternativ_avboting_og_radverksted_natur','beslutningseier_og_forvaltningsledelse','tiltakshaver_og_oppdragsdialog','tverrfaglig_kvalitet_og_horing','privatliv'],
  recurring_people_archetypes:recurringPeople,
  slow_axes:slowAxes,
  situated_reputation_model:{
    global_score_allowed:false,
    audiences,
    divergence_examples:[
      'Fagansvarlig kan stole mer på spilleren etter at et datagap synliggjøres, samtidig som bestiller opplever leveransen som mindre beslutningsklar.',
      'Bestiller kan få lavere umiddelbar tilfredshet når et ønsket alternativ ikke fremstilles som faglig best, mens beslutningseier senere får større tillit til sporbarheten.',
      'Kart- og datamiljøet kan få høyere tillit når en pen visualisering merkes med svak dekning, selv om prosjektledelsen helst vil bruke kartet som entydig argument.',
      'Plan- og regelverksmiljøet kan stole mer på spilleren når mandatglidning korrigeres, samtidig som en leder opplever språket som mindre smidig.',
      'Beslutningseieren kan få større tillit når restusikkerhet står tydelig, selv om rådgiveren mister følelsen av å levere ett klart svar.',
      'Tverrfaglige kolleger kan stole mer på spilleren når metodeuenighet beskrives åpent, mens egen faggruppe opplever mindre kontroll over narrativet.',
      'Tiltakshaver kan få større langsiktig tillit når realistiske avbøtende alternativer forklares uten skjult agenda, selv om kortsiktig prosjektpress øker.',
      'Privat relasjon kan få høyere tillit når spilleren legger bort rådgiverrangen, selv om profesjonell standing samme dag er under press.'
    ],
    authority_separation:'Standing er alltid audience-spesifikk og kan aldri summeres til en global reputation-score eller behandles som evidens, feltdata, kartgrunnlag, juridisk hjemmel eller saksbevis. Naturforvalter, Rådgiver (miljø/natur) og Seniorrådgiver (miljø/natur) forblir qualification_required med relevant_education_or_employer_qualification; sosial tillit, kundetilfredshet, lederros, senioritet, History Go eller Natur-Badge kan aldri oppfylle denne kvalifikasjonen. Fagansvarlig, plan-/regelverksrådgiver, dataanalytiker, prosjekt-/kvalitetsansvarlig, beslutningseier, bestiller og private relasjoner kan påvirke informasjonsflyt og tillit i sin egen relasjon, men kan ikke gjøre datagap borte, endre naturverdi ved status, oppheve lovverk, gi delegasjon eller gjøre rådgiverens anbefaling til politisk eller administrativt vedtak. History Go og Natur-Badge er læringsstøtte; de kan aldri være yrkeskvalifikasjon, hjemmel, feltbevis, saksbevis eller myndighetsgrunnlag.'
  },
  history_go_affordance:{
    badge_id:'natur',
    source_ref:canonicalRefs.find((ref)=>ref.includes('/knowledge/')),
    better_question:'History Go kan brukes i naturforvaltning og miljørådgivning til å finne arts-, steds-, økologi- og naturhistorisk kontekst som gjør kontrollspørsmålene i beslutningsgrunnlaget bedre. Profesjonell bruk betyr å oversette konteksten til spørsmål som kan verifiseres i riktig kilde- eller datakanal: Hvilke naturverdier kan være relevante i dette området, og hvilke faktiske registreringer eller feltdata trenger vi før de kan legges til grunn? Er kartlaget komplett nok geografisk og tidsmessig til spørsmålet, eller er tomme felt egentlig datagap? Hvilke økologiske sammenhenger kan gjøre et avbøtende tiltak mindre effektivt enn det ser ut på prosjektnivå? Hvilke historiske endringer i lokaliteten bør få oss til å kontrollere kildeår, metode eller referansetilstand? Hvilke begreper i regelverk eller planprosess må avklares hos riktig juridisk eller administrativ kompetanse i stedet for å utledes fra læringsinnhold? Spilleren skal deretter føre kilde, metode, dataversjon, naturverdi, datagap, regelverkspremiss, alternativ, avbøting og restusikkerhet i det canonical arbeidsobjektet. Hvis History Go peker mot en mulig art eller sammenheng, er det et signal om å undersøke relevant datagrunnlag — aldri bevis for at naturverdien faktisk finnes i saken. Natur-Badge kan forbedre ordforråd og oppmerksomhet, men kan ikke oppfylle relevant_education_or_employer_qualification, erstatte feltdata eller kvalitetssikret kartlegging, gi juridisk hjemmel eller delegasjon, gjøre et avbøtende tiltak effektivt, eller gjøre rådgiverens faglige råd til vedtak. God History Go-bruk gjør skillet mellom læringskontekst, evidens, faglig råd og beslutningsmyndighet tydeligere.',
    authority_boundary:'History Go og Natur-Badge kan gi arts-, steds-, økologi- og naturhistorisk kontekst og bedre spørsmål, men kan ikke gi relevant_education_or_employer_qualification, feltdata, kvalitetssikret kartlegging, juridisk hjemmel, delegasjon eller saksbevis; kan ikke oppheve regelverk, gjøre bestillerønske til faglig funn eller gjøre Naturforvalter, Rådgiver eller Seniorrådgiver til politisk eller administrativ beslutningsmyndighet.'
  },
  cross_role_proof:{
    status:'not_required_for_rollout_no_shared_object',
    shared_work_object_found:false,
    required_for_rollout:false,
    new_runtime:false,
    candidate_when_shared_work_is_real:false,
    rule:'Canonical readiness sier not_required_for_rollout. Naturforvaltning kan i virkeligheten motta feltdata, planpremisser eller andre faglige leveranser fra flere roller, men denne rollout-evidensen trenger ikke og beviser ikke et nytt governert delt runtime-work-object. Role World fullføres derfor uten cross-role-link og uten ny runtime; en senere kobling krever eksplisitt felles objekt, eier, handoff og faktisk shared-work-bevis.'
  },
  editorial_uniqueness:{
    not_copy_of:['natur/natur_felt_og_formidling','natur/natur_biologi_og_forskning','historie/historie_institusjonsledelse'],
    rule:'Natur / Forvaltning og rådgivning er særskilt bundet til beslutningsgrunnlag, datagap, naturverdi, regelverk, delegasjon, realistiske alternativer, avbøting, restkonsekvens, restusikkerhet, bestillerpress og skillet mellom faglig råd og faktisk vedtak. Den er ikke en feltverden med HMS/artsobservasjon som sentrum, ikke en forskningsverden med replikasjon og publisering, og ikke generell institusjonsledelse. Privat etterklang er koblet til beslutningsnærhet, overprøving, bestillerpress og ansvar uten myndighetsglidning.'
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
fs.writeFileSync(path.join(root,SOURCE),`# Natur / Forvaltning og rådgivning — Role World rollout source-first\n\n## Scope lock\n\nCanonical role: \`${KEY}\`. Prerequisites are already complete. This rollout authors exactly **\`situated_reputation\`** and keeps the existing Career/work foundation intact. It creates **no global reputation score, no new runtime and no parallel scene format**.\n\n## Career and authority preserved\n\n- **Naturforvalter**, **Rådgiver (miljø/natur)** and **Seniorrådgiver (miljø/natur)** all remain \`qualification_required\` with \`relevant_education_or_employer_qualification\`.\n- History Go and the Natur badge are learning support only: not field evidence, quality-assured mapping, legal authority, delegation, employment qualification or decision authority.\n- The role may build decision bases, analyze alternatives, make mitigation and residual-effect assessments, give professional advice and escalate material uncertainty. It may not turn advice into a political or administrative decision, manufacture findings for a commissioner, override law or self-assign delegated authority.\n\n## Role World\n\nThe world contains 8 bounded audiences, 9 slow editorial-only axes, 14 × 4 = 56 dramaturgical beats, 7 multi-day relationship threads, 5 private aftermaths and 8 delayed consequences. All **15 canonical prerequisite mails** are reused at least three times through existing Scene Pipeline provenance.\n\nThe sociological center is specific to nature administration and environmental advice: a visible data gap can reduce short-term confidence while increasing long-term trust; a commissioner can dislike a finding without owning its truth; a decision owner can choose differently without turning the adviser into the decision maker; a neat map can conceal uneven coverage; mitigation can reduce rather than erase consequence; and invisible versioning and quality work can matter more than presentation polish. Standing remains audience-specific and never becomes evidence or a global score.\n\n## Cross-role\n\nReadiness is \`not_required_for_rollout\`. No governed shared persistent runtime object is required or proven here, so **no cross-role link is materialized**. A later link requires genuine shared-work ownership and handoff evidence.\n\n## Editorial uniqueness\n\nThis is not a copy of Felt/formidling, Biologi/forskning or generic institutional leadership. It is grounded in decision basis, data gaps, natural value, regulation, delegation, realistic alternatives, mitigation, residual effects, residual uncertainty, commissioner pressure and the boundary between professional advice and actual decision authority.\n\n## Verification target\n\nThe focused test must prove exact prerequisite continuity, all 15 provenance refs, bounded standing with divergent audiences, 56 unique beats, multi-day threads, private aftermath, delayed consequences, all three qualification gates, readiness completion, no factual-people contamination, no cross-role link and no new runtime.\n`);

console.log(JSON.stringify({role:ROLE,world:WORLD,source_refs:canonicalRefs.length,beats:coverage.length,threads:primaryThreads.length,aftermaths:privateAftermath.length,delayed:delayedConsequences.length},null,2));
