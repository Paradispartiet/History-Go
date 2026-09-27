#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const write = (rel, value) => {
  const target = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(value, null, 2) + '\n');
};

const streamPath = 'data/Civication/narratives/leisure/scenekunst_scenekunstkurator.json';
const worldPath = 'data/Civication/roleWorlds/scenekunst/scenekunst_scenekunstkurator.json';
const lifeKey = 'scenekunst/scenekunstkurator';
const lifeScope = 'scenekunst_scenekunstkurator';
const nextQueue = 'scenekunst/skuespiller_danser';
const expectedTotal = 243;
const expectedCareer = 85;
const expectedLife = 158;

const storyData = [
  ['programmet_som_blir_personlig_smak', 'Kuratorfaglig kollega', 'Et program trenger mer enn personlig smak', ['Du setter sammen tre verk du selv opplever som sterke, men kan ikke ennå forklare hvorfor de skal stå sammen i samme program.', 'Kuratering av scenekunst krever en eksplisitt programlogikk som skiller smak, hypotese, kontekst og praktiske begrensninger.', 'En kurator kan ta kunstneriske valg uten å late som egen preferanse er nøytral eller selvforklarende kvalitet.'], 'Skriv en kort programhypotese, noter hvilke observasjoner som støtter den, og marker hva som fortsatt bare er preferanse.', 'Presenter den personlige smaken som en tilstrekkelig kvalitetsbegrunnelse fordi kuratorrollen nettopp handler om å velge.', ['program_rationale', 'curatorial_transparency'], 'Programmet får en prøvbar begrunnelse uten at smak skjules som objektiv sannhet.', 'Smak blir kamuflert som kvalitetsmål og gjør senere korreksjon vanskeligere.'],
  ['utlysningen_med_det_skjulte_nettverket', 'Den uavhengige kunstneren', 'En åpen utlysning kan fortsatt være sosialt lukket', ['En åpen utlysning får mange søknader, men de sterkeste interne anbefalingene kommer fra miljøer du allerede kjenner godt.', 'Formell åpenhet garanterer ikke lik tilgang når språk, nettverk, tidsfrister og uformelle anbefalinger fordeler oppmerksomheten skjevt.', 'Kuratorisk vurdering må kunne dokumentere kriterier og håndtere nettverksnærhet uten å late som relasjoner ikke finnes.'], 'Frys kriteriene før siste utvalg, registrer nære relasjoner og gjør en ekstra gjennomgang av kandidater uten intern forkjemper.', 'Bruk nettverksanbefalingene som kvalitetssignal fordi personer du stoler på allerede har gjort en første sortering.', ['selection_fairness', 'network_bias'], 'Utvalget blir mer etterprøvbart uten å late som alle kandidater startet fra samme posisjon.', 'Uformell tilgang får større vekt enn den annonserte åpne prosessen.'],
  ['verket_som_kommer_med_en_rider', 'Teknisk produsent', 'Det inviterte verket finnes også som tid, rom og rider', ['Et internasjonalt gjestespill passer programmet kunstnerisk, men den tekniske rideren krever mer riggetid, kompetanse og sceneplass enn første plan forutsatte.', 'Live scenekunst materialiseres gjennom konkrete forhold som reise, rigg, sikkerhet, prøvetid og lokal bemanning.', 'Kuratoren må skille kunstnerisk begrunnelse fra produksjonsløfte og gjøre konsekvensene synlige før invitasjonen blir irreversibel.'], 'Kartlegg hva i rideren som er kunstnerisk ufravikelig, hva som kan forhandles, og hvem som faktisk kan godkjenne ressursbruken.', 'Send endelig invitasjon først og la produksjonen finne en løsning fordi verket allerede er kuratorisk riktig.', ['production_reality', 'commitment_reversibility'], 'Invitasjonen får et realistisk produksjonsgrunnlag uten at kunstnerisk verdi reduseres til logistikk.', 'Kuratorisk entusiasme blir et skjult produksjonsvedtak for andre.'],
  ['representasjon_uten_tokenisering', 'Kunstneren', 'Representasjon kan bli et krav om å bære en kategori', ['Du ønsker et mer representativt program og merker at én kunstner stadig omtales internt som den som skal dekke et bestemt perspektiv.', 'Representasjon er et reelt fordelingsspørsmål, men kunstnere blir redusert når identitet brukes som programfunksjon uten hensyn til verkets egenart.', 'Kuratorisk kontekst må kunne synliggjøre strukturell skjevhet uten å gjøre en enkelt kunstner til symbolsk pliktbærer.'], 'Beskriv hvilket strukturelt hull programmet faktisk har, vurder flere mulige verk, og la den valgte kunstnerens arbeid beholde sin egen kompleksitet.', 'Behold kunstneren som representativ løsning og bygg formidlingen rundt kategorien publikum lettest vil forstå.', ['representation_integrity', 'artist_autonomy'], 'Programmet kan ta representasjon på alvor uten å gjøre kunstneren til en funksjonell markør.', 'Strukturell ambisjon blir lagt som identitetsarbeid på én kunstner.'],
  ['kontekstteksten_som_eier_verket', 'Kunstneren', 'Kuratorens konteksttekst begynner å eie verket', ['Du skriver en tydelig rammetekst som forklarer hvordan et verk bør forstås i programmet.', 'Kontekst kan åpne historiske, politiske og estetiske forbindelser, men blir overstyrende når tolkningen presenteres som verkets egentlige mening.', 'Scenekunstkuratering må skille kuratorisk hypotese fra kunstnerens opphav og publikums rett til å møte et flertydig verk.'], 'Marker teksten som en kuratorisk lesning, fjern påstander du ikke kan forankre, og la kunstneren korrigere feil om verkets premisser.', 'Spiss teksten ytterligere slik at publikum får én korrekt inngang til hva verket egentlig handler om.', ['context_integrity', 'interpretive_humility'], 'Formidlingen gir retning uten å absorbere verkets betydning.', 'Kuratorisk språk blir behandlet som autoritativ fasit over kunstnerens verk.'],
  ['vennen_i_programmet', 'Kuratorfaglig kollega', 'En nær relasjon gjør et godt verk vanskeligere å vurdere', ['En nær venn sender et prosjekt som passer svært godt inn i programmet du utvikler.', 'Habilitet handler ikke bare om korrupsjon; nærhet kan påvirke tilgang, tolkningsvilje og hvor mye usikkerhet du tåler i en søknad.', 'Kuratorrollen må kunne håndtere interessekonflikt eksplisitt uten å automatisk ekskludere gode verk eller skjule relasjonen.'], 'Opplys om relasjonen, trekk inn en uavhengig vurdering og dokumenter hvem som tar den endelige beslutningen.', 'Vurder søknaden alene og unngå å nevne relasjonen fordi du kjenner din egen integritet.', ['conflict_disclosure', 'selection_fairness'], 'Relasjonen blir håndtert som en synlig vurderingsrisiko i stedet for en hemmelig premiss.', 'Selvtillit blir brukt som erstatning for habilitetsprosedyre.'],
  ['lokalscenen_som_blir_bakgrunn', 'Lokal arrangør', 'Den lokale scenen blir kulisse for et importert program', ['Et gjesteprogram markedsføres som et møte med byen, men lokale miljøer kommer først inn når programmet allerede er låst.', 'Lokalkunnskap er ikke dekor; den kan endre timing, samarbeid, publikumsforståelse og hvilke kunstneriske relasjoner som faktisk finnes.', 'Kuratering på et sted krever at lokal medvirkning får påvirke programlogikken hvis den skal omtales som samarbeid.'], 'Åpne ett reelt beslutningspunkt på nytt, betal for lokal kompetanse og beskriv tydelig hva lokale partnere faktisk kan påvirke.', 'Be lokale aktører bidra med introduksjoner og synlighet uten å endre det allerede ferdige programmet.', ['local_knowledge', 'reciprocity'], 'Stedet får faktisk innflytelse i stedet for å fungere som autentiserende bakgrunn.', 'Samarbeidsretorikk skjuler at beslutningsmakten allerede er brukt opp.'],
  ['publikumstallet_som_blir_kvalitet', 'Publikumsrådgiver', 'Et fullt hus er ikke det samme som et godt program', ['Én forestilling selger ut raskt mens et annet verk får lavere belegg og sterkere faglig respons fra et mindre publikum.', 'Publikumstall måler etterspørsel under bestemte forhold, ikke kunstnerisk kvalitet, relevans eller langsiktig verdi alene.', 'Kuratoren trenger flere mål og må kunne forklare hva hvert mål faktisk sier før neste program justeres.'], 'Skill salg, rekkevidde, publikumsutvikling og kunstnerisk læring, og bruk hvert datapunkt bare til beslutninger det kan støtte.', 'Prioriter utsolgte formater neste sesong fordi markedet allerede har vist hva publikum vil ha.', ['audience_evidence', 'metric_humility'], 'Publikumsdata blir beslutningsgrunnlag uten å bli gjort til total dom over kunstnerisk verdi.', 'Ett lett mål får definere både kvalitet og framtidig programrom.'],
  ['risikoen_som_blir_sensur', 'Institusjonsleder', 'Omdømmerisiko blir formulert som kunstnerisk kvalitet', ['Et politisk krevende verk skaper uro hos ledelsen før kontrakten er endelig signert.', 'Institusjoner kan ha reelle juridiske, sikkerhetsmessige og økonomiske grenser, men disse må navngis som grenser i stedet for å omskrives til påstander om svak kunst.', 'Kuratorisk integritet krever å skille saklig risikoanalyse fra opportunistisk kvalitetsargumentasjon.'], 'List de konkrete risikoene, hvem som eier dem, hvilke tiltak som finnes, og hold kunstnerisk vurdering separat fra institusjonens toleranse.', 'Beskriv verket som kunstnerisk umodent slik at programendringen kan forsvares uten offentlig konflikt.', ['risk_separation', 'artist_autonomy'], 'Reell risiko kan behandles uten at institusjonell frykt blir maskert som estetisk dom.', 'Kvalitetsspråk brukes til å skjule et annet beslutningsgrunnlag.'],
  ['tilgjengeligheten_som_blir_forenkling', 'Tilgjengelighetsrådgiver', 'Tilgjengelighet er mer enn å gjøre verket enklere', ['Du får beskjed om at et komplekst verk bør forklares mer for å bli tilgjengelig for flere publikummere.', 'Tilgjengelighet kan handle om språk, teksting, sensoriske forhold, informasjon, pris og fysisk adgang uten at verkets kompleksitet må reduseres.', 'Kuratoren må skille barrierer rundt møtet fra den kunstneriske formen selv.'], 'Kartlegg konkrete barrierer med rådgiveren og kunstneren, og velg tiltak som øker adgang uten å late som kompleksitet er feilen.', 'Be kunstneren forenkle strukturen fordi et mer direkte verk automatisk vil være mer inkluderende.', ['access_design', 'artistic_complexity'], 'Tilgjengeligheten forbedres gjennom konkrete adgangstiltak mens verkets egen form forblir et kunstnerisk spørsmål.', 'Inkludering blir brukt som argument for å standardisere kunstnerisk uttrykk.'],
  ['tidsplanen_som_lager_kunstnerisk_logikk', 'Teknisk produsent', 'Tidsplanen begynner å late som den er dramaturgi', ['To verk plasseres etter hverandre fordi samme tekniske rigg kan gjenbrukes, og programteksten begynner senere å beskrive rekkefølgen som en bevisst kunstnerisk dialog.', 'Produksjonseffektivitet kan være en legitim begrensning, men etterrasjonalisering gjør praktiske valg om til falsk kuratorisk intensjon.', 'Programmet blir sterkere når kunstnerisk og operativ begrunnelse kan eksistere samtidig og være sporbar.'], 'Behold rekkefølgen hvis den fungerer, men dokumenter den tekniske årsaken og test om den påståtte kunstneriske forbindelsen faktisk holder.', 'Skriv en overbevisende tematisk kobling slik at publikum slipper å se den praktiske årsaken.', ['constraint_traceability', 'program_rationale'], 'Programmet kan romme praktiske kompromisser uten å forfalske sin egen historie.', 'Et logistisk valg får konstruert kunstnerisk nødvendighet i ettertid.'],
  ['pressemeldingen_som_gjor_kuratoren_til_opphav', 'Kommunikasjonsansvarlig', 'Pressemeldingen gjør kuratoren til verkets hovedopphav', ['Utkastet til pressemelding omtaler sesongen som din visjon og bruker kunstnerne primært som eksempler på programideen.', 'Kuratering skaper reelle forbindelser og rammer, men kunstneriske verk har egne opphav, samarbeid og rettigheter som ikke bør absorberes av programfortellingen.', 'Offentlig kreditering må kunne gjøre kuratorarbeidet synlig uten å gjøre kunstnerne til råmateriale for kuratorens profil.'], 'Omskriv teksten slik at kuratorisk programlogikk er tydelig samtidig som kunstnernes verk, opphav og samarbeid beholder selvstendig kreditering.', 'Behold én sterk kuratorfortelling fordi pressearbeid fungerer best når sesongen har én tydelig avsender.', ['public_credit', 'attribution_trace'], 'Kuratorarbeidet blir synlig uten å flytte opphav fra kunstnerne til programmet.', 'Kommunikativ enkelhet gjør kunstnerisk opphav underordnet kuratorprofilen.'],
  ['avslagene_som_folger_hjem', 'Nærpersonen', 'Avslagene fortsetter privat etter at kontoret er stengt', ['Du har lest mange personlige prosjektbeskrivelser og sendt avslag til kunstnere du kjenner og respekterer.', 'Kuratorarbeid innebærer asymmetrisk tilgang til sårbart materiale og kan skape skyld, grubling og privat beredskap lenge etter beslutningen.', 'Fortrolighet og restitusjon må beskyttes slik at privatlivet ikke blir et uformelt klagekontor eller en ny vurderingsrunde.'], 'Beskriv belastningen uten å dele søknadsdetaljer, noter eventuelle prosessfeil til arbeidstid og avslutt vurderingsarbeidet for kvelden.', 'Gå gjennom de avslåtte søknadene hjemme en gang til og del detaljer med en nærperson for å få bekreftet at valgene var riktige.', ['private_containment', 'confidentiality'], 'Belastningen blir anerkjent uten at fortrolighet og arbeidstid lekker videre.', 'Privat støtte kjøpes ved å åpne materiale som ikke tilhører privatlivet.'],
  ['sesongslutt_hva_er_en_scenekunstkurator', 'Kuratorfaglig kollega', 'Hva slags myndighet følger egentlig Scenekunstkurator-identiteten?', ['Etter to uker har du formulert programhypoteser, vurdert utvalg, kontekst, representasjon, produksjonsvilkår, publikumsdata, kreditering og institusjonell risiko.', 'Scenekunstkurator er her en employment-independent curatorial_programming_practice_or_livelihood: Badge-identiteten kan romme selvstendig program- og kuratorpraksis uten arbeidsgiveransettelse eller institusjonelt mandat.', 'Formell Scenekunstkurator-jobb krever fortsatt appointment_required; livsposisjonen gjør deg ikke automatisk til Kunstnerisk leder, Produsent, Dramaturg, Regissør, Koreograf eller Skuespiller / danser.'], 'Oppsummer praksisen som sporbar programlogikk, rettferdig utvalg, kunstnerautonomi, kontekstintegritet og tydelig mandatgrense, og la formell myndighet følge faktisk avtale.', 'Bruk Badge-identiteten som bevis på at du kan disponere programbudsjett, inngå avtaler og definere institusjonens kunstneriske linje uten særskilt mandat.', ['role_boundary', 'employment_independence'], 'Rollen blir tydelig som kuratorisk praksis og mulig levevei uten å late som den gir institusjonell fullmakt.', 'Identitet glir over i ubegrunnet budsjett-, avtale- og institusjonsmyndighet.']
];

function author() {
  const storylets = storyData.map((x) => ({
    id: x[0], message_type: 'decision', time_slot: ['people', 'personal'], from: x[1], subject: x[2], situation: x[3],
    choices: [
      { id: 'A', label: x[4], effect: 1, tags: x[6], feedback: x[7] },
      { id: 'B', label: x[5], effect: -1, tags: x[6].map((t) => t + '_failure'), feedback: x[8] }
    ],
    opens_streams: [], adds_flags: ['scenekunstkurator_' + x[0]], risk_links: ['reputation_risk', 'relationship_risk'], links: []
  }));

  const stream = {
    schema: 'civication_narrative_stream_v1', id: 'scenekunst_scenekunstkurator_stream', type: 'leisure',
    title: 'Scenekunstkurator — sporbar programlogikk, kunstnerautonomi, utvalg og mandatgrense',
    sociological_theme: 'scenekunst_scenekunstkurator_programhypotese_utvalgsrettferdighet_habilitet_liveproduksjon_representasjonsintegritet_kontekstautonomi_lokalkunnskap_publikumsevidens_risikoseparasjon_tilgjengelighet_kreditering_fortrolighet_og_mandatseparasjon',
    applies_when: { any_tags: ['scenekunst:scenekunstkurator'] }, time_slots: ['personal', 'home', 'people', 'leisure'], storylets
  };
  write(streamPath, stream);

  const manifest = read('data/Civication/narratives/manifest.json');
  manifest.streams = manifest.streams.filter((x) => x.id !== stream.id && x.path !== streamPath);
  manifest.streams.push({ id: stream.id, path: streamPath });
  write('data/Civication/narratives/manifest.json', manifest);

  const themeIds = ['professional_culture', 'invisible_work', 'loyalty_up_down', 'public_attention', 'shame_reputation', 'public_private_leakage', 'local_knowledge_vs_system'];
  const people = [
    ['amira_kunstner', 'Scenekunstner som gjør kunstnerautonomi, opphav, kontekst og konsekvensene av kuratoriske rammer konkrete.', 'uavhengig kunstner', 'høy autoritet om eget verk uten programmyndighet', 'kan godta eller avvise avtaler og korrigere feil om eget verk, men kan ikke alene disponere hele programmet', 'at verket møtes som mer enn en illustrasjon av programideen', 'hvor ofte hun tilpasser språk til kuratorens forventede vokabular for å bli lest', 'presis om verk, opphav og hvilke rammer som faktisk endrer arbeidet', 'at kuratering må beskytte kunstnerautonomi samtidig som den tar ansvar for kontekst'],
    ['maja_teknisk_produsent', 'Teknisk produsent som gjør rider, rigg, sikkerhet, tid og lokal kapasitet synlig før kuratoriske løfter blir produksjonsgjeld.', 'produksjonsfaglig leder', 'sterk operativ autoritet over gjennomførbarhet', 'kan sette sikkerhets- og ressursgrenser, men kan ikke alene avgjøre kunstnerisk relevans', 'at invitasjoner bygger på reelle produksjonsforutsetninger', 'hvor mye restarbeid hun historisk har absorbert for å redde sene programvalg', 'kort, konkret og konsekvensorientert', 'at live programarbeid alltid materialiseres gjennom produksjon'],
    ['leila_kuratorkollega', 'Uavhengig kuratorkollega som utfordrer programhypoteser, habilitet, utvalg og etterrasjonalisering.', 'selvstendig kuratorisk fagfelle', 'kollegial status uten institusjonsmyndighet', 'kan levere motfunn og uavhengig vurdering, men kan ikke tildele spilleren formelt mandat', 'at kuratoriske argumenter tåler innsyn og uenighet', 'at hun selv liker å framstå som mindre nettverksstyrt enn hun faktisk er', 'analytisk og direkte om kriterier, skjevhet og begrunnelse', 'at kuratorisk dømmekraft blir sterkere når premissene kan etterprøves'],
    ['jon_lokal_arrangor', 'Lokal arrangør som synliggjør stedskunnskap, eksisterende relasjoner og hvem som faktisk får påvirke et gjesteprogram.', 'lokal kulturarbeider og arrangør', 'høy situert troverdighet i lokal økologi', 'kan åpne eller problematisere lokale relasjoner, men kan ikke alene definere programmet', 'at lokal medvirkning betyr reell påvirkning og rimelig betaling', 'hvor ofte lokale aktører tidligere har blitt invitert inn først etter at de viktige valgene var tatt', 'praktisk, stedsspesifikk og lite imponert av samarbeidsretorikk', 'at lokal kunnskap er en beslutningsressurs, ikke dekor'],
    ['sara_publikumsradgiver', 'Publikums- og tilgjengelighetsrådgiver som skiller salgstall, adgangsbarrierer, rekkevidde og læring fra kunstnerisk kvalitetsdom.', 'publikums- og tilgjengelighetsfaglig partner', 'sterk kunnskap om publikumsmøte uten kunstnerisk vetorett', 'kan dokumentere barrierer og respons, men kan ikke kreve at kunstneriske verk standardiseres', 'at tiltak bygger på spesifikke barrierer og tydelige mål', 'at hun noen ganger presses til å legitimere beslutninger som allerede er tatt', 'databevisst og konkret om hvem et mål faktisk beskriver', 'at publikumsdata er situert evidens og ikke en universell kvalitetsmåler'],
    ['erik_institusjonsleder', 'Institusjonsleder som gjør formelt mandat, budsjett, risiko og omdømmegrenser synlige når kuratoridentitet møter arbeidsgiverstyring.', 'institusjonsleder med delegert myndighet', 'høy formell makt over budsjett og institusjonell risiko', 'kan sette formelle rammer og utøve faktisk arbeidsgivermandat, men kan ikke gjøre disse rammene til nøytral kunstnerisk sannhet', 'at programmet er gjennomførbart og institusjonelt forsvarlig', 'hvor ofte omdømmehensyn først presenteres som kunstneriske innvendinger', 'rolig, beslutningsorientert og sensitiv for offentlig risiko', 'at Scenekunstkurator-identiteten må skilles fra faktisk institusjonsmyndighet']
  ].map((x) => ({ id: x[0], social_function: x[1], class_position: x[2], status: x[3], power_over_player: x[4], wants: x[5], conceals: x[6], speech_style: x[7], teaches_player: x[8] }));

  const slowAxes = [
    ['program_rationale', 'Hvor tydelig programvalg knyttes til eksplisitte hypoteser, evidens og synlige begrensninger.'],
    ['selection_fairness', 'Hvor etterprøvbart utvalg håndterer kriterier, nettverk, habilitet og ulik tilgang.'],
    ['artist_autonomy', 'Hvor godt kunstnernes verk, opphav og forhandlingsrom beskyttes mot å bli underordnet programfortellingen.'],
    ['context_integrity', 'Hvor tydelig kuratorisk kontekst skilles fra verkets egen mening og opphav.'],
    ['audience_evidence', 'Hvor presist publikumstall, respons og tilgjengelighetsdata brukes uten overgeneralisering.'],
    ['mandate_separation', 'Hvor tydelig kuratorisk praksis holdes atskilt fra budsjett-, avtale-, arbeidsgiver- og institusjonsmyndighet.']
  ].map((x) => ({ id: x[0], meaning: x[1], runtime_binding: 'editorial_only_until_governed' }));

  const phases = ['morning', 'lunch', 'afternoon', 'evening'];
  const phaseTypes = { morning: 'info', lunch: 'conversation', afternoon: 'decision', evening: 'private_consequence' };
  const phaseText = {
    morning: 'programtesen åpnes og premissene skilles',
    lunch: 'en berørt fagperson utfordrer utvalget eller konteksten',
    afternoon: 'spilleren må ta et sporbar kuratorisk valg og synliggjøre mandatet',
    evening: 'programarbeidet får privat etterklang uten at fortrolig materiale eller grenseløs beredskap følger med'
  };
  const coverage = [];
  for (let day = 1; day <= 14; day++) {
    const s = storylets[day - 1];
    for (const phase of phases) {
      coverage.push({
        day, phase, beat_type: phaseTypes[phase],
        summary: `Dag ${day} ${phase}: ${s.subject}. ${phaseText[phase]}; programhistorikken beholder sporbarhet mellom kriterium, utvalg, konsekvens, motfunn og restspørsmål.`,
        thread_ids: [`scenekunstkurator_thread_${String(day).padStart(2, '0')}`],
        materialization_refs: [`${streamPath}#${s.id}`]
      });
    }
  }
  const beat = (day, phase) => `${day}/${phase}`;
  const primaryThreads = [];
  for (let day = 1; day <= 14; day++) {
    const d2 = (day % 14) + 1, d3 = ((day + 1) % 14) + 1, d4 = ((day + 2) % 14) + 1;
    primaryThreads.push({
      id: `scenekunstkurator_thread_${String(day).padStart(2, '0')}`,
      relationship: `${storylets[day - 1].from}: ${storylets[day - 1].subject} utvikles fra programvalg til sosial reaksjon og senere korrigering uten at Scenekunstkurator-identiteten overtar kunstnernes opphav eller institusjonens formelle mandat.`,
      beat_refs: [beat(day, 'morning'), beat(day, 'lunch'), beat(d2, 'afternoon'), beat(d3, 'lunch'), beat(d4, 'morning')]
    });
  }
  const privateAftermath = [0, 3, 6, 9, 12].map((idx, n) => ({
    id: `private_aftermath_${n + 1}`,
    description: `Etter ${storylets[idx].subject.toLowerCase()} må spilleren skille kuratoransvar fra privat beredskap, beskytte fortrolighet og la hvile være en del av neste dags dømmekraft.`,
    materialization_refs: [`${streamPath}#${storylets[idx].id}`]
  }));
  const delayedPairs = [[1, 4, ['narrative', 'relationship']], [2, 6, ['relationship', 'reputation']], [3, 8, ['reputation', 'narrative']], [5, 10, ['reputation', 'economy']], [7, 12, ['relationship', 'psyche']], [9, 14, ['job', 'reputation']]];
  const delayedConsequences = delayedPairs.map((x, i) => ({ id: `scenekunstkurator_delayed_${i + 1}`, setup_ref: beat(x[0], 'afternoon'), return_ref: beat(x[1], 'afternoon'), domains: x[2] }));

  const world = {
    schema: 'civication_role_world_v1', version: 1, category: 'scenekunst', role_scope: lifeScope,
    title: 'Scenekunstkurator — sporbar programmering, rettferdig utvalg og tydelig mandat', status: 'role_world_complete', subject_type: 'life_position',
    life_position_ref: { badge_id: 'scenekunst', id: 'scenekunstkurator', label: 'Scenekunstkurator' },
    sociological_core: {
      main_problem: 'å forme et live program gjennom utvalg, kontekst, ressurser og institusjonelle grenser uten å gjøre kuratorens smak eller mandat større enn det faktisk er',
      description: 'Scenekunstkurator som employment-independent curatorial_programming_practice_or_livelihood handler om å formulere sporbar programlogikk, vurdere utvalg og habilitet, beskytte kunstnerautonomi og opphav, forhandle live produksjonsvilkår, bruke publikumsdata presist og skille kunstnerisk vurdering fra institusjonell risiko. Badge-identiteten kan romme selvstendig kuratorisk praksis eller levevei uten arbeidsgiveransettelse eller institusjonelt mandat, mens formell Scenekunstkurator-jobb fortsatt krever appointment_required. Rollen må skilles fra Kunstnerisk leder, Produsent, Dramaturg, Regissør, Koreograf og Skuespiller / danser, og ingen ny runtime opprettes.'
    },
    theme_ids: themeIds,
    social_environments: ['programutvikling_og_utvalg', 'kunstnermote_og_kontekst', 'liveproduksjon_rider_og_ressurs', 'lokalscene_representasjon_og_habilitet', 'publikumsdata_tilgjengelighet_og_risiko', 'offentlig_kreditering_og_privat_etterklang'],
    recurring_people_archetypes: people, slow_axes: slowAxes,
    season: { days: 14, day_phases: phases, coverage }, primary_threads: primaryThreads, private_aftermath: privateAftermath,
    delayed_consequences: delayedConsequences,
    materialization: { no_new_runtime: true, source_refs: storylets.map((s) => `${streamPath}#${s.id}`) }
  };
  write(worldPath, world);

  const index = read('data/Civication/roleWorlds/index.json');
  index.roles = index.roles.filter((x) => x.life_position_key !== lifeKey && x.path !== worldPath);
  index.roles.push({ category: 'scenekunst', role_scope: lifeScope, subject_type: 'life_position', life_position_key: lifeKey, life_position_ref: { badge_id: 'scenekunst', id: 'scenekunstkurator', label: 'Scenekunstkurator' }, status: 'role_world_complete', path: worldPath });
  const total = index.roles.length, career = index.roles.filter((r) => r.subject_type !== 'life_position').length, life = index.roles.filter((r) => r.subject_type === 'life_position').length;
  if (total !== expectedTotal || career !== expectedCareer || life !== expectedLife) throw new Error(`unexpected index ${total}/${career}/${life}`);
  index.status = `${total}_role_worlds_materialized`;
  index.summary = { role_worlds_total: total, career_role_worlds: career, life_position_role_worlds: life };
  if (index.canonical_counts) { index.canonical_counts.role_worlds_total = total; index.canonical_counts.career_role_worlds = career; index.canonical_counts.life_position_role_worlds = life; }
  index.career_role_world_count = career; index.life_position_role_world_count = life;
  write('data/Civication/roleWorlds/index.json', index);

  const checklist = read('data/Civication/roleWorldAuthoringChecklist.json');
  if (!checklist.reference_worlds.includes(worldPath)) checklist.reference_worlds.push(worldPath);
  write('data/Civication/roleWorldAuthoringChecklist.json', checklist);
  const themeBank = read('data/Civication/roleWorldThemeBank.json');
  themeBank.reference_profiles['scenekunst/scenekunst_scenekunstkurator'] = themeIds;
  write('data/Civication/roleWorldThemeBank.json', themeBank);
  const taxonomy = read('data/Civication/nonCareerRoleTaxonomy.json');
  taxonomy.canonical_counts.life_position_role_worlds = life; taxonomy.canonical_counts.total_role_worlds = total;
  if (!taxonomy.role_world_rollout_boundary.completed_life_position_role_worlds.includes(lifeKey)) taxonomy.role_world_rollout_boundary.completed_life_position_role_worlds.push(lifeKey);
  write('data/Civication/nonCareerRoleTaxonomy.json', taxonomy);
  const policy = read('data/Civication/roleWorldPolicy.json');
  policy.noncareer_subject_boundary.life_position_readiness.completed_life_position_role_worlds = life;
  write('data/Civication/roleWorldPolicy.json', policy);

  const test = `#!/usr/bin/env node\n'use strict';\nconst assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');const ROOT=path.resolve(__dirname,'..');const read=r=>JSON.parse(fs.readFileSync(path.join(ROOT,r),'utf8'));const audit=read('data/Civication/lifePositionRoleWorldReadiness.json'),index=read('data/Civication/roleWorlds/index.json'),taxonomy=read('data/Civication/nonCareerRoleTaxonomy.json'),checklist=read('data/Civication/roleWorldAuthoringChecklist.json'),themeBank=read('data/Civication/roleWorldThemeBank.json'),policy=read('data/Civication/roleWorldPolicy.json'),badge=read('data/badges/scenekunst.json');const lifeKey='scenekunst/scenekunstkurator',lifeScope='scenekunst_scenekunstkurator',streamPath='data/Civication/narratives/leisure/scenekunst_scenekunstkurator.json',worldPath='data/Civication/roleWorlds/scenekunst/scenekunst_scenekunstkurator.json';const tier=badge.tiers.find(x=>x.life_position?.id==='scenekunstkurator');assert.ok(tier);assert.equal(tier.label,'Scenekunstkurator');assert.equal(tier.life_position.kind,'curatorial_programming_practice_or_livelihood');assert.equal(tier.life_position.employment_independent,true);assert.equal(tier.career_unlock.title,'Scenekunstkurator');assert.equal(tier.career_unlock.policy,'appointment_required');assert.equal(tier.career_unlock.role_scope,'scenekunst_program_og_kuratering');const stream=read(streamPath);assert.equal(stream.schema,'civication_narrative_stream_v1');assert.equal(stream.id,'scenekunst_scenekunstkurator_stream');assert.deepEqual(stream.applies_when.any_tags,['scenekunst:scenekunstkurator']);assert.deepEqual(read('data/Civication/narratives/manifest.json').streams.filter(x=>x.id===stream.id),[{id:stream.id,path:streamPath}]);assert.equal(stream.storylets.length,14);assert.equal(new Set(stream.storylets.map(x=>x.id)).size,14);for(const s of stream.storylets){assert.ok(s.situation.length>=3);assert.equal(s.choices.length,2);assert.deepEqual(s.choices.map(c=>c.effect),[1,-1]);assert.ok(s.choices.every(c=>c.tags.length>=2));}const row=audit.positions.find(x=>x.key===lifeKey);assert.ok(row);assert.equal(row.runtime_source,'badge_tier');assert.equal(row.semantic_mode,'livelihood_or_ownership_identity');assert.equal(row.classification,'ready');assert.equal(row.authored_depth.exact_source_ref_count,1);assert.equal(row.authored_depth.thematic_source_ref_count,0);assert.equal(row.authored_depth.max_narrative_depth,14);assert.deepEqual(row.evidence.exact_source_refs,[streamPath]);assert.deepEqual(row.evidence.thematic_source_refs,[]);for(const other of audit.positions.filter(x=>x.key!==lifeKey)){assert.ok(!(other.evidence.exact_source_refs||[]).includes(streamPath),streamPath+' leaked exact into '+other.key);assert.ok(!(other.evidence.thematic_source_refs||[]).includes(streamPath),streamPath+' leaked thematic into '+other.key);}const indexed=index.roles.find(x=>x.life_position_key===lifeKey),world=read(worldPath);assert.ok(indexed);assert.equal(indexed.role_scope,lifeScope);assert.equal(indexed.status,'role_world_complete');assert.deepEqual(indexed.life_position_ref,{badge_id:'scenekunst',id:'scenekunstkurator',label:'Scenekunstkurator'});assert.equal(row.role_world_status,'role_world_complete');assert.equal(row.role_world_path,worldPath);assert.ok(!audit.queue.some(x=>x.key===lifeKey));assert.equal(audit.queue[0].key,'scenekunst/skuespiller_danser');assert.equal(world.schema,'civication_role_world_v1');assert.equal(world.subject_type,'life_position');assert.equal(world.status,'role_world_complete');assert.deepEqual(world.life_position_ref,{badge_id:'scenekunst',id:'scenekunstkurator',label:'Scenekunstkurator'});assert.equal(world.materialization.no_new_runtime,true);assert.match(world.sociological_core.description,/curatorial_programming_practice_or_livelihood|employment-independent/i);assert.match(world.sociological_core.description,/appointment_required/i);assert.match(world.sociological_core.description,/Kunstnerisk leder|Produsent|Dramaturg|Regissør|Koreograf|Skuespiller/i);assert.match(world.sociological_core.description,/ingen ny runtime/i);assert.equal(world.season.days,14);assert.deepEqual(world.season.day_phases,['morning','lunch','afternoon','evening']);assert.equal(world.season.coverage.length,56);assert.equal(new Set(world.season.coverage.map(x=>x.day+'/'+x.phase)).size,56);assert.equal(new Set(world.season.coverage.map(x=>x.summary)).size,56);assert.deepEqual([...new Set(world.season.coverage.filter(x=>x.phase==='evening').map(x=>x.beat_type))],['private_consequence']);assert.equal(world.primary_threads.length,14);assert.ok(world.primary_threads.every(x=>x.beat_refs.length===5));assert.ok(world.primary_threads.every(x=>new Set(x.beat_refs.map(ref=>Number(ref.split('/')[0]))).size>=3));assert.equal(world.recurring_people_archetypes.length,6);assert.equal(world.private_aftermath.length,5);assert.equal(world.delayed_consequences.length,6);assert.ok(world.delayed_consequences.every(x=>Number(x.return_ref.split('/')[0])>Number(x.setup_ref.split('/')[0])));assert.equal(world.materialization.source_refs.length,14);assert.equal(new Set(world.materialization.source_refs).size,14);for(const ref of world.materialization.source_refs)assert.ok(ref.startsWith(streamPath+'#'));assert.deepEqual(themeBank.reference_profiles['scenekunst/scenekunst_scenekunstkurator'],world.theme_ids);assert.ok(checklist.reference_worlds.includes(worldPath));assert.ok(taxonomy.role_world_rollout_boundary.completed_life_position_role_worlds.includes(lifeKey));assert.equal(taxonomy.canonical_counts.life_position_role_worlds,158);assert.equal(taxonomy.canonical_counts.total_role_worlds,243);assert.equal(policy.noncareer_subject_boundary.life_position_readiness.completed_life_position_role_worlds,158);assert.match(stream.storylets.find(x=>x.id==='utlysningen_med_det_skjulte_nettverket').situation.join(' '),/utlysning|nettverk|kriterier|tilgang/i);assert.match(stream.storylets.find(x=>x.id==='representasjon_uten_tokenisering').situation.join(' '),/representasjon|identitet|kunstner|program/i);assert.match(stream.storylets.find(x=>x.id==='verket_som_kommer_med_en_rider').situation.join(' '),/rider|rigg|sikkerhet|produksjon/i);assert.match(stream.storylets.find(x=>x.id==='sesongslutt_hva_er_en_scenekunstkurator').situation.join(' '),/appointment_required|Kunstnerisk leder|Produsent|Dramaturg|Regissør/i);assert.equal(new Set(stream.storylets.flatMap(s=>s.choices.map(c=>c.feedback))).size,28);const allowed=new Set(['job','relationship','psyche','livelihood','economy','housing','reputation','narrative']);assert.ok(world.delayed_consequences.every(c=>c.domains.every(d=>allowed.has(d))));console.log('Scenekunst Scenekunstkurator authored-depth and Role World gate ok');\n`;
  fs.writeFileSync(path.join(ROOT, 'tests/civication-scenekunst-scenekunstkurator-authored-depth.test.js'), test);
}

function replaceAssert(s, expr, value) {
  const escaped = expr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return s.replace(new RegExp(`(assert\\.equal\\(\\s*${escaped}\\s*,\\s*)\\d+`, 'g'), `$1${value}`);
}

function sync() {
  const indexPath = 'data/Civication/roleWorlds/index.json';
  const index = read(indexPath);
  const total = index.roles.length, career = index.roles.filter((r) => r.subject_type !== 'life_position').length, life = index.roles.filter((r) => r.subject_type === 'life_position').length;
  if (total !== expectedTotal || career !== expectedCareer || life !== expectedLife) throw new Error(`unexpected index ${total}/${career}/${life}`);
  index.status = `${total}_role_worlds_materialized`;
  index.summary = { role_worlds_total: total, career_role_worlds: career, life_position_role_worlds: life };
  index.career_role_world_count = career; index.life_position_role_world_count = life;
  if (index.canonical_counts) { index.canonical_counts.role_worlds_total = total; index.canonical_counts.career_role_worlds = career; index.canonical_counts.life_position_role_worlds = life; }
  write(indexPath, index);

  const audit = read('data/Civication/lifePositionRoleWorldReadiness.json');
  if (audit.queue[0]?.key !== nextQueue) throw new Error(`unexpected queue ${audit.queue[0]?.key}`);
  const leaked = audit.positions.filter((x) => x.key !== lifeKey && [...(x.evidence?.exact_source_refs || []), ...(x.evidence?.thematic_source_refs || [])].includes(streamPath)).map((x) => x.key);
  if (leaked.length) throw new Error(`Scenekunstkurator source leaked into ${leaked.join(', ')}`);

  const changed = [];
  for (const name of fs.readdirSync(path.join(ROOT, 'tests')).filter((n) => /^civication-.*\.test\.js$/.test(n))) {
    const p = path.join(ROOT, 'tests', name);
    let s = fs.readFileSync(p, 'utf8');
    const before = s;
    for (const expr of ['index.roles.length', 'roleWorldIndex.roles.length', 'index.summary.role_worlds_total', 'taxonomy.canonical_counts.total_role_worlds']) s = replaceAssert(s, expr, total);
    for (const expr of ['index.life_position_role_world_count', 'index.summary.life_position_role_worlds', 'taxonomy.canonical_counts.life_position_role_worlds', 'policy.noncareer_subject_boundary.life_position_readiness.completed_life_position_role_worlds', 'lifePositionWorlds.length']) s = replaceAssert(s, expr, life);
    s = s.replace(/(assert\.equal\(\s*audit\.queue\[0\]\.key\s*,\s*)['"]scenekunst\/scenekunstkurator['"]/g, `$1'${nextQueue}'`)
      .replace(/const unrelated=\[['"]scenekunst\/scenekunstkurator['"]\]/g, `const unrelated=['${nextQueue}']`)
      .replace(/(assert\.deepEqual\(\s*roleWorldIndex\.summary\s*,\s*\{\s*role_worlds_total:\s*)\d+(,\s*career_role_worlds:\s*85,\s*life_position_role_worlds:\s*)\d+(\s*\}\s*\))/g, `$1${total}$2${life}$3`);
    if (name === 'civication-life-position-role-world-readiness.test.js') {
      const c = audit.summary.classifications;
      s = s.replace(/ready:\s*157,\s*\n\s*needs_authored_depth:\s*2,\s*\n\s*not_a_standalone_world:\s*40/g, `ready: ${c.ready},\n  needs_authored_depth: ${c.needs_authored_depth},\n  not_a_standalone_world: ${c.not_a_standalone_world}`);
      for (const f of ['completed_life_position_role_worlds', 'pending_ready_positions', 'livelihood_backed_positions', 'positions_with_exact_governed_sources', 'positions_with_multi_scene_narrative_foundation']) s = replaceAssert(s, `audit.summary.${f}`, audit.summary[f]);
    }
    if (name === 'civication-noncareer-role-taxonomy.test.js') {
      s = s.replace(/85 karriereverdener \+ 157 life-position worlds/g, `85 karriereverdener + ${life} life-position worlds`)
        .replace(/157 canonical life-position worlds skal være materialisert, nå også Scenekunst Regissør som egen employment-independent directing practice-posisjon/g, `${life} canonical life-position worlds skal være materialisert, nå også Scenekunst Scenekunstkurator som egen employment-independent curatorial programming practice-posisjon`)
        .replace(/(const expectedCounts = \{[\s\S]*?life_position_role_worlds:\s*)157(,\s*\n\s*total_role_worlds:\s*)242/g, `$1${life}$2${total}`)
        .replace(/85 career Role Worlds \+ 157 life-position worlds/g, `85 career Role Worlds + ${life} life-position worlds`);
    }
    if (s !== before) { fs.writeFileSync(p, s); changed.push(name); }
  }
  console.log(JSON.stringify({ total, career, life, nextQueue, readiness: audit.summary, changed_tests: changed.length }, null, 2));
}

const mode = process.argv[2] || 'author';
if (mode === 'author') author();
else if (mode === 'sync') sync();
else throw new Error(`unknown mode ${mode}`);
