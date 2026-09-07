import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CATEGORY = 'natur';
const ROLE = 'natur_politisk_myndighet';
const KEY = `${CATEGORY}/${ROLE}`;
const WORLD = `data/Civication/roleWorlds/${CATEGORY}/${ROLE}.json`;
const MODEL = `data/Civication/roleModels/${CATEGORY}/${ROLE}.json`;
const GRAMMAR = `data/Civication/workGrammars/${CATEGORY}/${ROLE}.json`;
const PLAN = `data/Civication/mailPlans/${CATEGORY}/${ROLE}_plan.json`;
const SOURCE = 'reports/CIVICATION_NATUR_POLITISK_MYNDIGHET_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md';
const TYPES = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const THEMES = [
  'professional_culture','bureaucratic_power','loyalty_up_down','shame_reputation','public_attention',
  'status_anxiety','public_private_leakage','class_power','local_knowledge_vs_system'
];
const PERSISTENT = 'utnevnelse_mandat_faggrunnlag_avveiing_hjemmel_beslutning_ansvar_og_oppfolgingslogg';
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const write = (rel, value) => {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, `${JSON.stringify(value, null, 2)}\n`);
};
const writeText = (rel, value) => {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, value.endsWith('\n') ? value : `${value}\n`);
};
const catalogPath = (type) => `data/Civication/mailFamilies/${CATEGORY}/${type}/${ROLE}_${type}.json`;
const canonicalRefs = TYPES.flatMap((type) => {
  const doc = read(catalogPath(type));
  return (doc.families || []).flatMap((family) => (family.mails || []).map((mail) => `${catalogPath(type)}#${mail.id}`));
});
if (canonicalRefs.length !== 15 || new Set(canonicalRefs).size !== 15) {
  throw new Error(`Expected 15 unique canonical mail refs, got ${canonicalRefs.length}`);
}

const model = read(MODEL);
const grammar = read(GRAMMAR);
const plan = read(PLAN);
if (plan.sequence.length !== 16) throw new Error('Politisk myndighet prerequisite plan drifted from 16 steps');
if (grammar.persistent_work_object_contract?.id !== PERSISTENT) throw new Error('Politisk myndighet persistent work object drift');
if (grammar.day_one_contract?.entry_policy_by_title?.['Statsråd (klima og miljø)']?.qualification_ids?.[0] !== 'public_office_appointment') {
  throw new Error('Statsråd public_office_appointment gate drift');
}

const audiences = [
  {
    id: 'embetsverk_og_departementsledelse',
    axis: 'mandatklarhet_og_forvaltningsintegritet_standing',
    cares: ['at politisk styring starter med dokumentert utnevnelse, riktig beslutningseier og forsvarlig saksgrunnlag','at embetsverkets faglige og rettslige plikter kan stå synlige også når statsråden ønsker raskere framdrift'],
    cannot: 'Standing hos embetsverk og departementsledelse kan ikke gi public_office_appointment, utvide konstitusjonell eller delegert myndighet, skape hjemmel, budsjettvedtak eller en annen beslutningseier enn den som følger av faktisk regelverk og organisering. Den kan ikke gjøre History Go eller Natur-badge til saksbehandlet evidens, faglig råd, juridisk vurdering eller offentlig utnevnelse. Høy tillit kan gjøre vanskelige styringssignaler lettere å gjennomføre, men kan ikke gjøre en politisk preferanse til forvaltningsfakta, hoppe over nødvendig utredning eller gjøre en muntlig forventning til gyldig beslutning.'
  },
  {
    id: 'fagmiljo_og_kunnskapsgrunnlag',
    axis: 'faglig_uavhengighet_og_usikkerhetsstanding',
    cares: ['at klima- og naturfaglige funn, metodegrenser og vesentlig usikkerhet blir bevart gjennom politisk press','at politisk avveiing navngis som politisk når den avviker fra faglig anbefaling eller innebærer dokumentert naturkostnad'],
    cannot: 'Standing hos fagmiljø og kunnskapsgrunnlag kan ikke gi public_office_appointment, juridisk hjemmel, budsjettmyndighet, regjeringsbeslutning eller rett til å overta den politiske beslutningseieren. Den kan ikke gjøre History Go eller Natur-badge til feltdata, konsekvensutredning, overvåkingsserie eller annen saksbehandlet evidens. Høy faglig tillit kan forbedre kvaliteten på spørsmål og dialog, men kan ikke gjøre statsrådens omdømme til naturvitenskapelig sannhet, fjerne usikkerhet eller legitimere at et politisk kompromiss omtales som faglig nødvendig.'
  },
  {
    id: 'regjeringssamordning_og_politiske_partnere',
    axis: 'samordningsredelighet_og_kompromissstanding',
    cares: ['at målkonflikter mellom natur, klima, energi, økonomi, distrikt og fordeling blir eksplisitte før kompromiss','at kompromisset viser hvem som vinner, hvem som bærer kostnad, og hvilket organ som faktisk eier neste beslutning'],
    cannot: 'Standing hos regjeringssamordning og politiske partnere kan ikke gi public_office_appointment, ny hjemmel, budsjettfullmakt eller myndighet som ligger hos regjeringen samlet, Stortinget eller et annet organ. Den kan ikke gjøre History Go eller Natur-badge til evidens for at en naturkostnad er liten, at en rettslig grense er oppfylt eller at en regjeringsbeslutning allerede foreligger. Politisk tillit kan åpne for forhandling, men kan ikke skjule faggrunnlag, omskrive usikkerhet eller gjøre partienes enighet til korrekt beslutningseier.'
  },
  {
    id: 'juridisk_parlamentarisk_og_kontroll',
    axis: 'hjemmel_etterprovbarhet_og_stortingsstanding',
    cares: ['at hjemmel, budsjettpremiss, parlamentarisk ansvar og tidsriktig begrunnelse kan etterprøves senere','at spørsmål fra Stortinget og kontrollfunksjoner besvares med synlig skille mellom fakta, usikkerhet og politisk vurdering'],
    cannot: 'Standing hos juridisk, parlamentarisk eller annen kontroll kan ikke gi public_office_appointment, fabrikere hjemmel, flytte beslutningseier eller gjøre et politisk ønske til et gyldig vedtak. Den kan ikke gjøre History Go eller Natur-badge til juridisk evidens, budsjettvedtak, stortingsfullmakt eller dokumentasjon på at korrekt prosess er gjennomført. God standing kan øke tilliten til at statsråden korrigerer feil og dokumenterer premisser, men kan ikke skjerme beslutningen mot kontroll, erstatte lovgrunnlag eller gjøre etterpåforklaringer til den begrunnelsen som faktisk forelå.'
  },
  {
    id: 'offentlighet_berorte_og_medier',
    axis: 'offentlig_redelighet_og_berort_tillit_standing',
    cares: ['at offentlig kommunikasjon skiller sikkert faktum, usikkerhet, politisk valg og dokumentert natur- eller fordelingskostnad','at berørte grupper kan forstå hva som er besluttet, av hvem, på hvilket grunnlag og hva som fortsatt er åpent'],
    cannot: 'Standing hos offentlighet, berørte grupper og medier kan ikke gi public_office_appointment, juridisk hjemmel, budsjettmyndighet eller rett til å flytte den formelle beslutningseieren. Den kan ikke gjøre popularitet, medietrykk, History Go eller Natur-badge til saksbehandlet evidens eller naturfaglig dokumentasjon. Høy offentlig tillit kan gjøre en vanskelig beslutning mer forståelig, men kan ikke gjøre flertallsstemning til lov, fjerne rettigheter for mindretall eller berørte, eller gjøre en kommunikasjonspakke til en regjerings- eller stortingsbeslutning.'
  },
  {
    id: 'forvaltning_og_implementeringslinje',
    axis: 'styringssignal_implementering_og_etterkontroll_standing',
    cares: ['at styringssignal, implementeringsansvar, frist, indikator og etterkontroll henger sammen med faktisk vedtak','at nye data og implementeringsfunn kan gjenåpne berørte premisser uten at tidligere begrunnelse slettes'],
    cannot: 'Standing hos forvaltning og implementeringslinje kan ikke gi public_office_appointment, skape hjemmel, endre budsjettvedtak eller gjøre et politisk signal til en beslutning som et annet organ eier. Den kan ikke gjøre History Go eller Natur-badge til implementeringsevidens, feltdata, effektmåling eller kontrollbevis. Høy styringstillit kan redusere friksjon, men kan ikke legitimere uklare ansvar, usynlige restanser eller at resultatindikatorer omskrives for å få et ønsket politisk utfall til å se oppnådd ut.'
  },
  {
    id: 'private_relations',
    axis: 'privat_rolleavgrensning_og_maktfri_naervaer_standing',
    cares: ['at statsrådsrollen, medietrykket og beslutningsansvaret kan legges bort uten at personen mister verdi eller nærvær','at privatlivet ikke blir en uformell rådgivnings- eller lekkasjeflate for konfidensielt arbeid'],
    cannot: 'Standing i private relasjoner kan ikke gi public_office_appointment, politisk eller juridisk myndighet, hjemmel, budsjettvedtak eller noen offentlig beslutningseier. Den kan ikke gjøre History Go eller Natur-badge til evidens for at en sak er løst, og privat støtte kan ikke erstatte embetsverk, faggrunnlag, regjering eller Storting. En nær relasjon kan utfordre stress, kontrollspråk og fravær, men kan ikke motta fortrolig saksinformasjon som ikke skal deles eller gjøre emosjonell støtte til grunnlag for offentlig beslutning.'
  }
];

const archetypes = [
  {
    id:'ingrid_departementsrad_world', social_function:'Ingrid gjør skillet mellom statsrådens politiske ansvar og embetsverkets forvaltningsplikt sosialt synlig, særlig når tempo, styringssignal og beslutningseier begynner å gli sammen.', class_position:'Departementsråd med høy institusjonell og administrativ status, men uten rett til å materialisere statsrådens public_office_appointment eller overta politiske valg.', status:'Høy formell og prosessuell standing i departementet.', power_over_player:'Kan kreve forsvarlig saksforberedelse, advare mot mandatglidning og sende grunnlag tilbake for rework, men kan ikke gi ny hjemmel eller politisk fullmakt.', wants:'At styringssignaler er gjennomførbare, lovlige og tydelig knyttet til riktig beslutningseier.', conceals:'At også embetsverket kan kjenne press for å gjøre politiske ønsker enklere å ekspedere enn sakens faktiske kompleksitet tilsier.', speech_style:'Nøktern, sekvensiell og mandatbevisst; spør hva som er besluttet, av hvem og på hvilket grunnlag.', teaches_player:'At embetsverkets tillit bygges når statsråden tåler å få beskjed om at politisk vilje ikke er det samme som gyldig beslutning.'
  },
  {
    id:'yusuf_faggrunnlag_world', social_function:'Yusuf bærer den sosiale kostnaden ved å la faglige råd, usikkerhet og naturkostnad stå urørt når politisk kommunikasjon ønsker en enklere fortelling.', class_position:'Ekspedisjonssjef med høy faglig og administrativ innflytelse over kunnskapsgrunnlaget, uten politisk beslutningsmyndighet.', status:'Høy situert faglig standing når metode og usikkerhet får være synlige.', power_over_player:'Kan nekte å kalle et politisk kompromiss faglig optimalt og kreve mer utredning, men kan ikke velge politisk alternativ på statsrådens vegne.', wants:'At faggrunnlaget er versjonert, etterprøvbart og tydelig skilt fra normativ prioritering.', conceals:'At omfattende faglige forbehold kan oppleves som tap av handlingskraft når den politiske tidslinjen er kort.', speech_style:'Presis og premissbevisst; skiller hva vi vet, hva vi antar og hva som er et verdivalg.', teaches_player:'At faglig standing ikke kommer av å være enig med fagmiljøet, men av å la rådet stå sant også når politikken velger noe annet.'
  },
  {
    id:'maria_regjeringssamordning_world', social_function:'Maria gjør politiske kompromisser lesbare som faktiske avveiinger mellom sektorer og koalisjonsbehov, ikke som skjult faglig nødvendighet.', class_position:'Regjeringsrådgiver og samordner med høy tilgang til politiske prosesser, men uten selvstendig konstitusjonell beslutningsmyndighet.', status:'Høy situert politisk koordinasjonsstanding.', power_over_player:'Kan synliggjøre hvilke kompromisser som er politisk mulige og hvilke saker som må løftes, men kan ikke skape hjemmel eller budsjettvedtak.', wants:'Et kompromiss der naturkostnad, fordeling, ansvar og beslutningsnivå er eksplisitt før offentlig kommunikasjon.', conceals:'At politisk samhold kan gjøre det fristende å tåkelegge hvem som faktisk presset fram kostnaden.', speech_style:'Konsis og koordinerende; spør hva som må løses bilateralt, i regjering og i Stortinget.', teaches_player:'At politisk standing bygges av redelig kompromiss, ikke av å late som alle hensyn peker samme vei.'
  },
  {
    id:'henrik_juridisk_storting_world', social_function:'Henrik gjør hjemmel, parlamentarisk ansvar, spørsmål og senere kontroll til et levende sosialt korrektiv mot hastverk og etterrasjonalisering.', class_position:'Juridisk rådgiver og stortingskontakt med høy kontroll- og prosessmakt, men uten statsrådens politiske mandat.', status:'Høy rettslig og parlamentarisk prosess-ståing når beslutningssporet tåler kontroll.', power_over_player:'Kan stoppe svak hjemmelsbruk, kreve korrigering og forberede parlamentarisk svar, men kan ikke materialisere public_office_appointment eller politisk beslutning.', wants:'At hjemmel, faktum, usikkerhet, politisk avveiing og tidsriktig begrunnelse kan gjenfinnes senere.', conceals:'At juridisk presisjon kan oppleves som et hinder når mediedøgnet krever svar før saken er moden.', speech_style:'Kort, dokumenterende og kontrollorientert; spør hva som faktisk kan sies, hva som må korrigeres og hvem som eier beslutningen.', teaches_player:'At kontrollstanding skapes før kontrollen kommer, gjennom et spor som ikke trenger å rekonstrueres etterpå.'
  },
  {
    id:'parlamentarisk_opposisjon_world', social_function:'En parlamentarisk motstemme tester om statsrådens forklaring tåler uenighet, alternative prioriteringer og krav om dokumentasjon uten at kritikk behandles som delegitimering.', class_position:'Folkevalgt aktør uten styringsrett over statsrådens departement, men med demokratisk kontroll- og dagsordenmakt.', status:'Varierende partipolitisk status og høy offentlig synlighet.', power_over_player:'Kan stille spørsmål, fremme forslag, mobilisere flertall og utløse kontroll, men kan ikke gjøre påstander til faglig evidens eller alene endre regjeringens mandat.', wants:'Klare svar på hva regjeringen visste, valgte, ofret og vil gjøre når premissene endres.', conceals:'At også opposisjonens insentiver kan belønne forenkling av reelle faglige og rettslige dilemmaer.', speech_style:'Spiss og etterprøvende; spør når statsråden visste hva, hvilken kostnad som ble akseptert og hvem som besluttet.', teaches_player:'At demokratisk standing ikke krever enighet, men at motparten kan se premissene og holde deg ansvarlig for dem.'
  },
  {
    id:'berort_offentlighet_world', social_function:'Berørte borgere, organisasjoner og lokalsamfunn gjør konsekvensene av politiske avveiinger sosialt konkrete og tester om lytting faktisk endrer forståelsen av kostnader.', class_position:'Ulik formell makt, men legitim situert erfaring og mulig offentlig mobiliseringskraft.', status:'Lav til høy offentlig synlighet avhengig av sak, uten automatisk beslutningsmyndighet.', power_over_player:'Kan dokumentere erfaringer, utfordre fordelingsvirkninger og mobilisere oppmerksomhet, men kan ikke skape hjemmel eller alene eie vedtaket.', wants:'At natur- og fordelingskostnader beskrives konkret, at usikkerhet ikke skjules og at medvirkning ikke reduseres til symbolikk.', conceals:'At sterke lokale interesser også kan gjøre andre berørte grupper eller langsiktige naturverdier mindre synlige.', speech_style:'Erfaringsnær og konsekvensorientert; spør hvem som bærer kostnaden, hva som skjer på stedet og hva som kan endres.', teaches_player:'At offentlig tillit kan divergere fra politisk støtte, og at å bli hørt ikke er det samme som å få viljen sin.'
  },
  {
    id:'implementeringsleder_world', social_function:'En leder i forvaltning eller underliggende organ tester om politiske styringssignaler faktisk kan oversettes til lovlig praksis, kapasitet, indikatorer og etterkontroll.', class_position:'Formell implementerings- og linjeleder innen eget mandat, uten rett til å utvide statsrådens eller egen myndighet.', status:'Høy operativ standing når premisser og ansvar er tydelige.', power_over_player:'Kan synliggjøre kapasitetsmangel, rettslige begrensninger og implementeringsrisiko og returnere uklare signaler, men kan ikke omskrive politiske beslutninger.', wants:'Et styringsspor som viser hva som er vedtatt, hva som er finansiert, hvem som eier gjennomføring og hvordan effekt skal måles.', conceals:'At implementeringspress kan belønne indikatorer som er lettere å rapportere enn de virkningene politikken egentlig lovet.', speech_style:'Operativ og avklarende; spør hva som skal gjøres, med hvilken hjemmel, kapasitet og kontroll.', teaches_player:'At implementeringsstanding følger av styrbar tydelighet og ærlig etterkontroll, ikke av å erklære politikk gjennomført.'
  },
  {
    id:'private_relation_statsrad_world', social_function:'En nær privat relasjon møter personen bak embetet når medietrykk, ansvar og sikkerhets- eller beredskapsrytme følger med hjem.', class_position:'Privat likemann uten politisk, juridisk eller administrativ myndighet.', status:'Høy emosjonell betydning uten offentlig rang.', power_over_player:'Kan sette grenser for fravær, kontrollspråk og arbeidets plass hjemme, men kan ikke gi råd som om privatlivet var en del av saksbehandlingen.', wants:'Nærvær, restitusjon og et rom der personen ikke trenger å forsvare hele regjeringens politikk.', conceals:'At langvarig offentlig eksponering kan gjøre også familien opptatt av omdømme på en måte som forsterker arbeidspresset.', speech_style:'Hverdagslig og direkte; spør hva som faktisk må løses i kveld og hva systemet eier til i morgen.', teaches_player:'At statsrådsstanding er situert og midlertidig, mens privat verdi ikke skal avhenge av dagsmåling eller politisk gjennomslag.'
  }
];

const slowAxes = [
  ['mandatklarhet_og_forvaltningsintegritet_standing','Om embetsverket kan stole på at utnevnelse, delegasjon, beslutningseier og saksgrunnlag holdes eksplisitt gjennom politisk press.'],
  ['faglig_uavhengighet_og_usikkerhetsstanding','Om fagmiljøet kan stole på at funn, metodegrenser, dissens og usikkerhet ikke omskrives for å passe ønsket politikk.'],
  ['samordningsredelighet_og_kompromissstanding','Om politiske partnere kan se målkonflikt, kostnad, vinner, taper og riktig beslutningsnivå i kompromisset.'],
  ['hjemmel_etterprovbarhet_og_stortingsstanding','Om juridisk og parlamentarisk kontroll kan gjenfinne hjemmel, faktum, avveiing og tidsriktig begrunnelse.'],
  ['offentlig_redelighet_og_berort_tillit_standing','Om offentligheten får et sant skille mellom fakta, usikkerhet, politisk valg, naturkostnad og fordelingsvirkning.'],
  ['styringssignal_implementering_og_etterkontroll_standing','Om forvaltningen får gjennomførbare signaler med tydelig ansvar, kapasitet, indikator og rework ved nye premisser.'],
  ['naturkostnad_og_langsiktighet_standing','Om langsiktige klima- og naturvirkninger forblir synlige når kortsiktig politisk gevinst eller krisehastighet belønnes.'],
  ['korrigering_og_laring_etter_nye_fakta_standing','Om nye data, rettslige avklaringer eller implementeringsfunn fører til åpen korrigering fremfor defensiv låsing.'],
  ['privat_rolleavgrensning_og_maktfri_naervaer_standing','Om embetsmakt, medietrykk og kontrollspråk kan legges bort uten å styre privatlivet eller gjøre omdømme til personlig verdi.']
].map(([id,meaning]) => ({ id, meaning, runtime_binding:'editorial_only_until_governed' }));

const socialEnvironments = [
  'statsradens_beslutningsrom_med_embetsverket',
  'faggrunnlag_og_usikkerhetsbord_for_klima_og_natur',
  'regjeringssamordning_der_sektorinteresser_kolliderer',
  'juridisk_hjemmelsrom_og_budsjettavklaring',
  'stortingets_sporsmal_kontroll_og_offentlige_ansvar',
  'medieoffentlighet_og_berorte_lokalsamfunn',
  'underliggende_forvaltning_og_implementeringslinje',
  'etterkontroll_der_nye_data_kan_gjenapne_premisser',
  'privatliv_uten_offentlig_myndighet'
];

const cases = [
  ['ny_utnevnelse_og_mandat','Ny utnevnelse: skille embete, faktisk mandat og forventninger før første styringssignal.'],
  ['faglig_rad_med_politisk_kostnad','Et faglig råd anbefaler sterkere vern enn regjeringens politiske plattform opprinnelig la opp til.'],
  ['naturinngrep_og_fordelingskonflikt','Et naturinngrep gir målbar naturkostnad samtidig som arbeidsplasser og distriktsinteresser mobiliserer.'],
  ['regjeringskonflikt_om_virkemiddel','To departementer tolker handlingsrom og samfunnskostnad ulikt før regjeringssamordning.'],
  ['hjemmel_og_budsjettpremiss','Et ønsket tiltak er politisk attraktivt, men hjemmel og finansiering er ikke ferdig avklart.'],
  ['offentlig_kritikk_og_stortingssvar','Stortinget og mediene krever svar på hvorfor et dokumentert faglig råd ikke ble fulgt fullt ut.'],
  ['akutt_miljohendelse','En akutt miljøhendelse krever rask respons uten at hastighet får oppheve fakta-, hjemmels- eller ansvarsgrensen.'],
  ['implementeringsmotstand','Forvaltningen viser at styringssignalet er vanskeligere å implementere enn den politiske tidsplanen antok.'],
  ['nye_data_etter_beslutning','Nye målinger endrer usikkerheten og gjør at deler av den politiske begrunnelsen må gjenåpnes.'],
  ['kompromiss_med_synlig_naturkostnad','Et regjeringskompromiss kan samle flertall bare dersom statsråden aksepterer en dokumentert naturkostnad.'],
  ['parlamentarisk_kontroll','Kontrollspørsmål tester om beslutningssporet kan rekonstrueres uten etterpåforklaring.'],
  ['berort_tillit_og_lokal_kunnskap','Lokale aktører dokumenterer virkninger som ikke var tydelige i den første nasjonale modellen.'],
  ['resultatindikator_og_realitet','En grønn resultatindikator skjuler at den faktiske naturvirkningen fortsatt er usikker.'],
  ['sluttoppfolging_og_ansvar','To uker med beslutninger avsluttes med åpen etterkontroll, politisk ansvar og tydelig rest-usikkerhet.']
];

const phaseFocus = {
  morning: 'Morgenen brukes til å kontrollere hva som faktisk foreligger før kalender, kommunikasjon og politisk tempo får definere saken. Spilleren må lese beslutningssporet som et institusjonelt objekt: public_office_appointment, mandat, beslutningseier, faggrunnlag, usikkerhet, alternativer, hjemmel, budsjettpremiss og hvilket nytt faktum som kan gjenåpne vurderingen.',
  lunch: 'I lunsj- og relasjonsfasen blir de sosiale kostnadene tydelige. En aktør med eget mandat eller egen erfaring utfordrer hvordan statsråden bruker språk, rang og tillit. Spillet viser at standing kan være høy hos én gruppe og lav hos en annen uten at noen av delene endrer lov, faggrunnlag eller hvem som har beslutningsmyndighet.',
  afternoon: 'Ettermiddagen krever en faktisk politisk avveiing eller et eksplisitt valg om å vente, løfte eller sende saken tilbake. Valget skal være lovlig og sporbar, og kan avvike fra faglig anbefaling, men naturkostnad, usikkerhet, hjemmel og beslutningseier må stå uendret. Politisk ansvar materialiseres i begrunnelsen, ikke ved å omskrive premissene.',
  evening: 'Kvelden viser ettervirkningen av offentlig ansvar. Medietrykk, konflikt, tvil eller behovet for kontroll følger personen hjem, men privat standing kan verken reparere saken eller fungere som uformell beslutningskanal. Spillet gjør embetsrollen situert: arbeidets makt skal kunne legges bort uten at ansvar, konfidensialitet eller menneskelig belastning fornektes.'
};
const standingByPhase = {
  morning:'Standing flytter seg hos embetsverk og fagmiljø etter hvor tydelig spilleren skiller dokumentert grunnlag fra politisk ønske. En ryddig kontroll kan øke intern tillit selv om den forsinker ønsket tempo; en snarvei kan gjøre spilleren populær i øyeblikket og samtidig svekke senere etterprøvbarhet.',
  lunch:'Standing divergerer mellom aktører fordi de vurderer ulike ting: faglig redelighet, politisk samordning, lokal rettferdighet eller offentlig forståelighet. Ingen av disse lokale vurderingene summeres til en global score, og ingen standing kan materialisere public_office_appointment, hjemmel eller ny beslutningseier.',
  afternoon:'Standing følger måten avveiingen bæres på, ikke bare utfallet. Et upopulært, men åpent og lovlig valg kan styrke kontroll- og embetsverkstillit; et populært valg med skjult usikkerhet kan svekke faglig og parlamentarisk standing. Politisk gjennomslag er derfor ikke det samme som autoritetsbevis.',
  evening:'Privat standing påvirkes av om spilleren klarer å legge fra seg rang, kontrollspråk og behovet for å vinne dagens fortelling. Nærvær hjemme kan bedres samtidig som offentlig kritikk øker. Denne divergensen er bevisst: privat relasjon gir menneskelig støtte, men aldri offentlig myndighet eller evidens.'
};
const audienceCycle = [
  'embetsverk_og_departementsledelse','fagmiljo_og_kunnskapsgrunnlag','regjeringssamordning_og_politiske_partnere',
  'juridisk_parlamentarisk_og_kontroll','offentlighet_berorte_og_medier','forvaltning_og_implementeringslinje','private_relations'
];
const phaseType = { morning:'task', lunch:'relationship', afternoon:'decision', evening:'private_consequence' };

const threadDefs = [
  ['fag_politikk_uten_faktaomskriving','Forholdet mellom statsråden og faggrunnlaget utvikler seg gjennom uenighet, usikkerhet og press. Tråden undersøker om spilleren kan velge politisk uten å gjøre ønsket utfall til faglig nødvendighet, og om Yusuf kan beholde faglig uavhengighet uten at uenighet tolkes som illojalitet. Standing blir derfor et mål på redelig omgang med uenighet, ikke på om fag og politikk ender med samme konklusjon.',['1/morning','1/afternoon','3/morning','3/afternoon','8/morning','8/afternoon']],
  ['mandat_hjemmel_og_embetsverk','Relasjonen til Ingrid handler om hvorvidt statsrådens reelle utnevnelse og politiske rang brukes innenfor riktig mandat. Tråden lar embetsverkets tillit vokse når spilleren skiller styringssignal fra vedtak, sender saker til riktig nivå og tåler rework, og svekkes når tempo eller prestisje brukes til å presse fram prosessuelle snarveier.',['2/morning','2/afternoon','5/morning','5/afternoon','10/morning','10/afternoon']],
  ['regjeringssamordning_og_kompromiss','Maria følger kompromisser på tvers av sektorer og gjør det synlig om naturkostnad, fordelingsvirkning og riktig beslutningsnivå forblir lesbart. Relasjonen kan bli politisk sterk selv når faglig standing svekkes, eller motsatt, og viser hvorfor én global omdømmescore ville ødelegge rollens sosiologiske logikk.',['4/lunch','4/afternoon','7/lunch','7/afternoon','11/lunch','11/afternoon']],
  ['storting_kontroll_og_korrigering','Henrik og parlamentariske motstemmer tester om statsråden kan svare presist når saken er politisk ubehagelig. Tråden gjør senere kontroll avhengig av tidligere sporbarhet: korrigering kan koste kortsiktig omdømme, men styrke demokratisk standing når feil, usikkerhet og beslutningseier blir tydelige.',['5/lunch','6/afternoon','9/lunch','9/afternoon','13/lunch','13/afternoon']],
  ['offentlighet_berorte_og_tillit','Berørte grupper og offentligheten møter både politisk kommunikasjon og reelle konsekvenser. Tråden skiller det å bli hørt fra det å få medhold, og lar offentlig tillit avhenge av om kostnader, alternativer og usikkerhet beskrives redelig. Medietrykk kan øke eller falle uten at det endrer hvem som har myndighet.',['3/lunch','6/lunch','6/evening','10/lunch','12/lunch','12/evening']],
  ['implementering_og_etterkontroll','Forvaltningens implementeringsleder følger styringssignalet fra vedtak til kapasitet, indikator og senere kontroll. Tråden undersøker om statsråden tåler at gjennomføringen viser nye begrensninger, og om nye data faktisk gjenåpner berørte premisser i stedet for å bli behandlet som kommunikasjonssvikt.',['7/morning','8/lunch','9/morning','11/morning','13/morning','14/morning']],
  ['privatliv_uten_embetsmakt','Den private relasjonen følger personen når offentlig kritikk, beredskap og maktspråk lekker hjem. Tråden belønner evnen til å være nærværende uten å dele fortrolig arbeid eller bruke privat støtte som beslutningsgrunnlag. Den viser også at politisk tap og privat verdi kan bevege seg i motsatt retning.',['1/evening','4/evening','7/evening','10/evening','12/evening','14/evening']]
];
const threadRefsByBeat = new Map();
for (const [id,,refs] of threadDefs) {
  for (const ref of refs) {
    const list = threadRefsByBeat.get(ref) || [];
    list.push(id);
    threadRefsByBeat.set(ref, list);
  }
}

const coverage = [];
let beatIndex = 0;
for (let day = 1; day <= 14; day += 1) {
  const [caseId, caseText] = cases[day - 1];
  for (const phase of ['morning','lunch','afternoon','evening']) {
    const ref = canonicalRefs[beatIndex % canonicalRefs.length];
    const key = `${day}/${phase}`;
    const audience = phase === 'evening' ? 'private_relations' : audienceCycle[(day + beatIndex) % 6];
    const summary = `Dag ${day}, ${phase}, ${caseId}. ${caseText} ${phaseFocus[phase]} I akkurat denne beaten må spilleren knytte handlingen til den eksisterende loggen «${PERSISTENT}» og bevare den tidligere versjonen dersom nye data, hjemmelsavklaring, budsjett, regjeringssamordning, stortingsbehandling eller implementeringsfunn endrer saken. History Go kan gi stedlig og naturhistorisk kontekst som skjerper spørsmålene, men kan ikke fungere som public_office_appointment, feltdata, konsekvensutredning, juridisk hjemmel, budsjettvedtak, regjeringsbeslutning eller Stortingets myndighet. Den dramaturgiske konflikten ligger derfor i hva statsråden tør å navngi som politisk valg, hva som må stå som faglig premiss, og hvem som faktisk eier neste formelle beslutning.`;
    const standing = `${standingByPhase[phase]} I ${caseId}-saken blir konsekvensen knyttet til publikummet ${audience}: det husker om spilleren gjorde premiss, kostnad, usikkerhet og ansvar lesbart. Senere tillit kan forbedres gjennom korrigering og etterkontroll, men kan aldri brukes retroaktivt som evidens for at den opprinnelige beslutningen var faglig eller juridisk riktig.`;
    coverage.push({
      day,
      phase,
      beat_type: phaseType[phase],
      summary,
      standing_audience: audience,
      standing_consequence: standing,
      thread_ids: threadRefsByBeat.get(key) || [],
      materialization_refs: [ref]
    });
    beatIndex += 1;
  }
}

const privateAftermath = [
  ['etter_kritisk_stortingssvar','Etter et hardt stortingssvar merker spilleren at kroppen fortsetter å formulere replikk selv etter at arbeidsdagen er slutt. Den private relasjonen utfordrer behovet for å vinne neste mediedøgn hjemmefra. Spillet lar personen legge bort telefonen uten å late som saken er uviktig, og minner om at konfidensielt materiale, embetsmakt og beslutningsspor skal bli igjen i de institusjonelle kanalene. Privat støtte kan gi restitusjon, men aldri public_office_appointment, evidens eller politisk hjemmel.'],
  ['etter_faglig_uenighet','Et faglig råd ble ikke fulgt fullt ut, og spilleren kjenner fristelsen til å søke bekreftelse hjemme på at valget likevel var riktig. Den private relasjonen kan møte tvilen uten å bli en uformell fagfelle. Det emosjonelle poenget er å tåle at et lovlig politisk valg fortsatt kan ha reell naturkostnad, og at faglig uenighet ikke trenger å løses ved å gjøre den privat eller personlig.'],
  ['etter_regjeringskompromiss','Et kompromiss har reddet politisk framdrift, men gjort naturkostnaden tydeligere. Hjemme finnes ingen gevinst ved å omtale dette som en seier. Den private scenen lar spilleren erkjenne at politisk ansvar kan innebære å eie et valg som fortsatt er ubehagelig, og at omdømme i regjeringen, offentligheten og privatlivet kan bevege seg i ulike retninger uten at én score summerer personen.'],
  ['etter_akutt_hendelse','Beredskapsrytmen fortsetter etter at den akutte fasen er over. Den private relasjonen setter en konkret grense for hvor lenge alle samtaler kan handle om ansvar, risiko og kontroll. Spilleren må skille mellom det som faktisk krever statsrådens tilstedeværelse, det embetsverket eller forvaltningen eier, og det som kan vente. Å legge bort arbeidet er ikke å frasi seg ansvar; det er å respektere rollefordelingen.'],
  ['etter_offentlig_korrigering','Spilleren har måttet korrigere en offentlig påstand. Kortvarig skam og statusangst gjør det fristende å forklare bort feilen privat. Scenen lar i stedet korrigeringen være ferdig: feil ble rettet i riktig kanal, beslutningssporet ble oppdatert, og hjemmet trenger ikke bli et ekstra kontrollrom. Privat standing styrkes av nærvær, ikke av å bevise at kritikerne tok feil.'],
  ['etter_sluttoppfolging','Ved slutten av to uker står enkelte rest-usikkerheter fortsatt åpne. Den private ettervirkningen motstår behovet for narrativ lukking. Noen politiske valg er gyldige og ansvarlige selv om effekten fortsatt må måles; noen feil må fortsatt korrigeres senere. Personen får være mer enn embetet, mens systemet beholder logg, frist, beslutningseier og etterkontroll.']
].map(([id,description],i) => ({ id, description, materialization_refs:[canonicalRefs[(i * 2) % canonicalRefs.length]] }));

const delayedConsequences = [
  ['faglig_forbehold_returnerer','1/morning','3/afternoon',['job','reputation']],
  ['mandatgrense_returnerer_i_hjemmel','2/morning','5/afternoon',['job','narrative']],
  ['lokal_naturkostnad_returnerer','3/lunch','12/lunch',['relationship','reputation']],
  ['regjeringskompromiss_returnerer_i_kontroll','4/afternoon','11/lunch',['job','reputation']],
  ['budsjettpremiss_returnerer_i_implementering','5/morning','8/lunch',['job','economy']],
  ['offentlig_formulering_returnerer_i_stortingssvar','6/lunch','13/afternoon',['reputation','narrative']],
  ['akutt_tiltak_returnerer_i_etterkontroll','7/afternoon','13/morning',['job','psyche']],
  ['nye_data_returnerer_i_sluttoppfolging','9/morning','14/afternoon',['job','narrative']]
].map(([id,setup_ref,return_ref,domains]) => ({ id, setup_ref, return_ref, domains }));

const world = {
  schema: 'civication_role_world_v1',
  version: 1,
  category: CATEGORY,
  role_scope: ROLE,
  title: 'Natur / Politisk myndighet — demokratisk ansvar, fag–politikk-skille og situert standing',
  status: 'role_world_complete',
  sociological_core: {
    main_problem: 'Hvordan kan en klima- og miljøstatsråd utøve reell politisk myndighet og bygge legitim tillit hos embetsverk, fagmiljø, regjeringspartnere, Storting, offentlighet og implementeringslinje når lovlige politiske valg kan avvike fra faglige råd, ha synlig naturkostnad og samtidig måtte tåle senere kontroll?',
    description: 'Role World-en lukker bare situated_reputation rundt den allerede komplette Politisk myndighet-prerequisiten. public_office_appointment, 16-stegs mailplan, fire fiktive arbeidsaktører, fire beslutningsrom, to work loops, vedvarende beslutningslogg, waiting/handoff/rework og authority boundary beholdes uendret. Standing er audience-spesifikk og kan aldri fungere som offentlig utnevnelse, hjemmel, evidens eller beslutningsmyndighet.'
  },
  theme_ids: THEMES,
  social_environments: socialEnvironments,
  recurring_people_archetypes: archetypes,
  slow_axes: slowAxes,
  existing_work_continuity: {
    runtime_binding: 'existing_mail_and_work_grammar',
    new_runtime_state: false,
    work_loops: grammar.work_loops,
    persistent_work_object: PERSISTENT,
    waiting_states: grammar.rhythm_contract.waiting_states,
    handoff_rule: grammar.persistent_work_object_contract.handoff_rule,
    rework_rule: grammar.rhythm_contract.rework_rule,
    rule: 'Eksisterende work grammar, 16-stegs mailplan og vedvarende statsrådslogg forblir authoritative. Role World-en legger bare situert standing rundt eksisterende arbeid og skaper ingen ny scene-, beslutnings-, hjemmels-, plan- eller work-object-runtime.'
  },
  situated_reputation_model: {
    global_score_allowed: false,
    rule: 'Standing er audience-spesifikk og kan divergere mellom embetsverk, fagmiljø, regjeringssamordning, parlamentarisk kontroll, offentlighet, implementeringslinje og privatliv. Ingen global reputation-score kan materialisere statsrådsembete eller brukes som faglig, juridisk eller demokratisk bevis.',
    audiences: audiences.map((a) => ({ id:a.id, standing_axis:a.axis, cares_about:a.cares, cannot_grant:a.cannot })),
    divergence_examples: [
      'Å bevare et ubehagelig faglig forbehold kan styrke fagmiljøets og embetsverkets standing samtidig som politiske partnere opplever mindre handlekraft.',
      'Et tydelig politisk kompromiss kan styrke regjeringsstanding og samtidig svekke tillit hos berørte grupper som bærer den synlige naturkostnaden.',
      'Å korrigere en feil offentlig kan koste kortsiktig mediestanding og samtidig styrke parlamentarisk og juridisk etterprøvbarhet.',
      'Å vente på hjemmelsavklaring kan svekke inntrykket av tempo og samtidig styrke implementeringslinjens tillit til at signalet faktisk kan gjennomføres.',
      'Å løfte en sak til regjeringen eller Stortinget kan se mindre handlekraftig ut, men styrke embetsverkets tillit til mandatklarhet.',
      'Å erkjenne rest-usikkerhet kan gjøre kommunikasjonen mindre slagkraftig og samtidig styrke faglig og senere kontrollmessig standing.',
      'Å velge et lovlig alternativ som avviker fra faglig anbefaling kan opprettholde politisk legitimitet dersom rådet og naturkostnaden forblir synlige, men standing vil divergere mellom grupper.',
      'Å legge bort embetsrollen hjemme kan styrke privat standing uten å endre offentlig kritikk, faglig vurdering eller institusjonell myndighet.'
    ],
    authority_separation: 'Ingen global standing eller lokal standing hos embetsverk, fagmiljø, regjering, Storting, offentlighet, forvaltning eller private relasjoner kan gjøre spilleren til Statsråd (klima og miljø). Rollen forblir appointment_required og krever public_office_appointment. Standing kan ikke skape hjemmel, budsjettvedtak, regjeringsbeslutning, Stortingets myndighet, saksbehandlet evidens eller nytt faggrunnlag. History Go og Natur-badge kan forbedre spørsmål, men aldri materialisere embete, beslutningseier eller rettslig kompetanse.'
  },
  history_go_affordance: {
    badge_id: 'natur',
    source_ref: canonicalRefs.find((ref) => ref.includes('/knowledge/')) || canonicalRefs[0],
    better_question: 'History Go kan gi statsråden et rikere språk for sted, arter, økologiske sammenhenger, naturhistorie og tidligere arealbruk. I Role World-en brukes dette bare til å stille bedre spørsmål: Hvilken naturtype berøres? Hvilke sesong- eller artsdata mangler? Er lokal erfaring i konflikt med nasjonale modeller? Hvilken langsiktig verdi kan bli usynlig i et kortsiktig resultatmål? Hvilket fagmiljø må faktisk utrede spørsmålet? Spillet skal eksplisitt vise at slik kontekst kan gjøre politiske alternativer mer informerte, men ikke gi fasit i en konkret sak. Det er forskjell på å vite mer om et sted og å ha saksbehandlet evidens, og forskjell på å forstå et miljøproblem og å eie den offentlige beslutningen. History Go-kunnskap kan derfor utløse et bedre bestillingsspørsmål, ikke en snarvei rundt forvaltning, rett, budsjett, regjering eller Storting.',
    authority_boundary: 'History Go og Natur-badge kan ikke gi public_office_appointment, kan ikke erstatte feltdata, konsekvensutredning, forvaltningsutredning eller juridisk vurdering, kan ikke skape hjemmel eller budsjettvedtak, og kan ikke materialisere en regjeringsbeslutning eller Stortingets myndighet. Kunnskapen er læringsstøtte og spørsmålsforbedring, aldri saksbehandlet evidens eller offentlig fullmakt.'
  },
  cross_role_proof: {
    shared_work_object_found: false,
    required_for_rollout: false,
    new_runtime: false,
    status: 'not_required_for_rollout',
    rule: 'Readiness sier not_required_for_rollout. Ingen cross-role-link materialiseres uten et faktisk governert shared work object; regjeringssamordning og stortingskontakt i denne Role World-en er sosiale miljøer rundt statsrådens eksisterende arbeid, ikke ny cross-role-runtime.'
  },
  editorial_uniqueness: {
    not_copy_of: ['natur/natur_miljoledelse','by/by_saksbehandler','naeringsliv/controller'],
    rule: 'Denne verdenen er særskilt statsrådspolitisk: public_office_appointment, fag–politikk-skille, regjeringssamordning, parlamentarisk ansvar, offentlig begrunnelse, natur- og fordelingskostnad, implementering og senere kontroll er kjernen. Den er ikke en generisk leder-, saksbehandler- eller miljøledelsesverden.'
  },
  season: { days:14, day_phases:['morning','lunch','afternoon','evening'], coverage },
  primary_threads: threadDefs.map(([id,relationship,beat_refs]) => ({ id, relationship, beat_refs })),
  private_aftermath: privateAftermath,
  delayed_consequences: delayedConsequences,
  materialization: {
    no_new_runtime: true,
    authored_dimensions: ['situated_reputation'],
    existing_plan_preserved: true,
    existing_role_model_preserved: true,
    existing_people_foundation_preserved: true,
    existing_work_grammar_preserved: true,
    existing_persistent_work_preserved: true,
    existing_rhythm_preserved: true,
    career_title_gates_preserved: true,
    cross_role_link_materialized: false,
    source_refs: canonicalRefs
  }
};
write(WORLD, world);

const themeBank = read('data/Civication/roleWorldThemeBank.json');
themeBank.reference_profiles ||= {};
themeBank.reference_profiles[KEY] = THEMES;
write('data/Civication/roleWorldThemeBank.json', themeBank);

const checklist = read('data/Civication/roleWorldAuthoringChecklist.json');
checklist.reference_worlds ||= [];
checklist.reference_worlds = checklist.reference_worlds.filter((x) => x !== WORLD);
checklist.reference_worlds.push(WORLD);
write('data/Civication/roleWorldAuthoringChecklist.json', checklist);

const index = read('data/Civication/roleWorlds/index.json');
index.roles = (index.roles || []).filter((row) => !(row.category === CATEGORY && row.role_scope === ROLE));
index.roles.push({ category:CATEGORY, role_scope:ROLE, status:'role_world_complete', path:WORLD });
index.status = `${index.roles.length}_role_worlds_materialized`;
index.effective_date = '2026-09-07';
write('data/Civication/roleWorlds/index.json', index);

const sourceReport = `# Natur / Politisk myndighet — Role World rollout source-first\n\n## Scope lock\n\nDenne rollouten lukker bare **situated_reputation** for \`natur/natur_politisk_myndighet\`. Statsråd (klima og miljø) forblir **appointment_required** med \`public_office_appointment\` som eneste autoritative adgangsport. Eksisterende role model, 16-stegs mailplan, fire prerequisite-People, fire arbeids-/beslutningsrom, to work loops, persistent work object, waiting/handoff/rework og authority boundary gjenbrukes uten ny runtime.\n\n## Source inventory\n\n- role model: \`${MODEL}\`\n- work grammar: \`${GRAMMAR}\`\n- mail plan: \`${PLAN}\`\n- **15 canonical** mailkilder fordelt på alle ni mailtypene\n- History Go / Natur-kunnskap brukes bare som læringsstøtte og bedre spørsmål\n\n## Sociological design\n\nWorld-bibelen gjør standing situert hos syv publikum: embetsverk/departementsledelse, fagmiljø, regjeringssamordning/politiske partnere, juridisk/parlamentarisk kontroll, offentlighet/berørte/medier, forvaltning/implementeringslinje og private relasjoner. Det finnes **no global reputation score**. Standing kan divergere: en åpen korrigering kan koste mediemomentum og samtidig styrke kontrollstanding; et lovlig politisk kompromiss kan styrke regjeringsstanding og samtidig svekke tillit hos berørte.\n\n## Authority boundary\n\nStanding kan aldri materialisere embete, hjemmel, budsjettvedtak, regjeringsbeslutning, Stortingets myndighet eller saksbehandlet evidens. History Go og Natur-badge kan ikke erstatte feltdata, konsekvensutredning, juridisk vurdering eller \`public_office_appointment\`. Politiske valg kan avvike fra faglige råd, men rådet, vesentlig usikkerhet, naturkostnad, hjemmel og korrekt beslutningseier skal stå synlig.\n\n## Season and continuity\n\nSesongen er **14 days × 4 phases = 56** unike dramaturgiske beats. Hver canonical mailkilde brukes minst tre ganger. Syv fler-dagers relasjonstråder binder sammen fag–politikk, mandat/hjemmel, regjeringssamordning, Storting/kontroll, offentlighet/berørte, implementering/etterkontroll og privat rolleavgrensning. Åtte delayed consequences returnerer senere i job, relationship, reputation, economy, psyche og narrative-domener.\n\n## Cross-role\n\nReadiness sier \`not_required_for_rollout\`. Det materialiseres **no cross-role link** og ingen ny shared-work runtime. Sosiale møter med regjering, Storting og forvaltning er dramaturgiske relasjoner rundt statsrådens eksisterende work object.\n\n## Editorial uniqueness\n\nRole World-en er ikke en kopi av Miljøledelse, By-saksbehandler eller Controller. Den er særskilt bygget rundt statsrådsutnevnelse, demokratisk ansvar, fag–politikk-skille, regjeringssamordning, parlamentarisk kontroll, offentlig begrunnelse, natur-/fordelingskostnad og implementering.\n\n## No new runtime\n\nIngen ny runtime, sceneformat, global reputation-state eller parallell work-object-struktur introduseres. Eksisterende Scene Pipeline og prerequisite-artifacts forblir authoritative.\n`;
writeText(SOURCE, sourceReport);

console.log(`Materialized ${WORLD}`);
console.log(`Canonical source refs: ${canonicalRefs.length}`);
console.log(`Season beats: ${coverage.length}`);
console.log(`Index status: ${index.status}`);
