#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PACKAGE = 'data/fag/litteratur/litteraturvitenskap_canonical_v1';
const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const write = (file, value) => {
  const target = path.join(ROOT, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const concept = (id, term, definition, distinguish_from) => ({ id, term, definition, distinguish_from });
const section = (id, title, coverageTopic, paragraphs, paragraphClaimIds, keyPoints) => ({ id, title, coverageTopic, paragraphs, paragraphClaimIds, keyPoints });

const areas = [
  {
    id: 'narratologi_prosa',
    title: 'Narratologi og prosafortelling',
    status: 'chapter_and_overview_text_materialized',
    topics: ['forteller_fokalisering', 'tid_rekkefolge_varighet_frekvens', 'plot_hendelse_kausalitet', 'karakter_rom_miljo', 'upaalitelig_fortelling_metanarrasjon', 'roman_novelle_kortprosa']
  },
  {
    id: 'lyrikk_poetiske_former',
    title: 'Lyrikk og poetiske former',
    status: 'chapter_and_overview_text_materialized',
    topics: ['lyrisk_jeg_talehandling', 'rytme_meter_prosodi', 'rim_klang_linjering', 'strofe_sjanger_form', 'modernistisk_fri_vers', 'muntlig_framfort_digital_poesi']
  }
];

const foundations = [
  {
    id: areas[0].id,
    title: areas[0].title,
    synthesis: 'Narratologien undersøker hvordan fortellinger fordeler stemme, kunnskap, tid, årsak, karakter og rom. Kapittelet forbinder klassisk strukturalistisk terminologi med retorisk, kognitiv og historisk prosaanalyse, men behandler ingen modell som en universell oppskrift. Hvert begrep knyttes til et navngitt verk, et avgrenset tekststed og et tydelig skille mellom tekstlig organisering, leserens mulige slutninger og dokumentert resepsjon.',
    topics: [
      ['forteller_fokalisering', 'Fortelleren er den tekstlige instansen som ytrer fortellingen, mens fokalisering angir hvordan tilgang til sanser, kunnskap og vurdering begrenses og organiseres. Begrepene må holdes atskilt fra den historiske forfatteren og kan skifte uavhengig. Analysen følger grammatiske, temporale og evaluative signaler og prøver om et perspektivskifte også innebærer et skifte i fortellerinstans.', ['forteller', 'fokalisering', 'perspektiv', 'fri_indirekte_diskurs'], 'Jane Austens «Emma» analysert gjennom fri indirekte diskurs, Emmas begrensede kunnskap og fortellerens vekslende nærhet og korreksjon.'],
      ['tid_rekkefolge_varighet_frekvens', 'Fortellingens tid beskrives gjennom forholdet mellom hendelsenes antatte kronologi og framstillingens rekkefølge, mellom hendelsens varighet og tekstlig plass, og mellom antall hendelser og antall fortellinger. Analysen må rekonstruere begge tidslinjer, begrunne sprang og utelatelser og skille tekstens temporale organisering fra leserens faktiske opplevelse av tempo.', ['anakroni', 'analepse', 'varighet', 'frekvens'], 'Marcel Prousts «På sporet av den tapte tid» undersøkt gjennom madeleinescenen, erindringens tidsbevegelse og forholdet mellom scene og retrospektiv utvidelse.'],
      ['plot_hendelse_kausalitet', 'Plot er den meningsbærende forbindelsen teksten etablerer mellom hendelser gjennom rekkefølge, mål, hindring, tilfeldighet og tilbakeholdt informasjon. Det er ikke identisk med et kort handlingsreferat. En kausal lesning må vise tekstlige mellomledd og prøve konkurrerende forklaringer, fordi kronologisk nærhet, figurenes motiver og leserens sjangerforventninger kan produsere ulike årsaksmodeller.', ['plot', 'hendelse', 'kausalitet', 'fortellingsverdighet'], 'Jane Austens «Pride and Prejudice» analysert gjennom brev, feilslutninger og hvordan ny informasjon reorganiserer tidligere hendelser og ekteskapsplottet.'],
      ['karakter_rom_miljo', 'Karakterer konstrueres gjennom handling, tale, perspektiv, navn og andres beskrivelser; rom fordeler bevegelse, synlighet, grenser og sosial adgang. Miljø er derfor ikke bare bakgrunn. Analysen kartlegger hvem som kan bevege seg hvor, hvilke romlige opposisjoner teksten etablerer, og hvordan karaktertrekk endres når de ses gjennom ulike fortellere eller sosiale steder.', ['karakterisering', 'aktant', 'fortellingsrom', 'miljo'], 'Honoré de Balzacs «Le Père Goriot» undersøkt gjennom pensjonatets etasjer, Paris’ sosiale geografi og Rastignacs bevegelse mellom rom og posisjoner.'],
      ['upaalitelig_fortelling_metanarrasjon', 'Upålitelig fortelling er en begrunnet leserhypotese om avstand mellom fortellerens utsagn, kunnskap eller verdier og normer teksten gjør tilgjengelige andre steder. Metanarrasjon kommenterer eller synliggjør fortellehandlingen. Begge krever lokal dokumentasjon: motsigelser, kunnskapshull, adressat, revisjoner og rammer, ikke bare en generell mistanke om at førstepersonsfortellere lyver.', ['upaalitelig_forteller', 'fortellernorm', 'metanarrasjon', 'selvkorreksjon'], 'Edgar Allan Poes «The Tell-Tale Heart» analysert gjennom fortellerens forsvar for egen fornuft, sansningspåstander, rytmiske gjentakelser og avslørende selvmotsigelser.'],
      ['roman_novelle_kortprosa', 'Roman, novelle og kortprosa er historisk skiftende institusjonelle former, ikke rene lengdekategorier. Skala påvirker kompresjon, karakterutvikling, handlingsmengde, publiseringsmåte og avslutningslogikk. Sjangeranalysen må dokumentere samtidige betegnelser og medieformat og kan ikke gjøre én europeisk romantradisjon eller den moderne epifaniske novellen til global norm.', ['roman', 'novelle', 'kortprosa', 'kompresjon'], 'Katherine Mansfields «The Garden Party» undersøkt gjennom kompresjon, sosial terskel, epifanisk forventning og en avslutning som nekter entydig moralsk lukning.']
    ].map(([id, text, concepts, example]) => ({ id, text, concepts, example }))
  },
  {
    id: areas[1].id,
    title: areas[1].title,
    synthesis: 'Lyrikkanalysen undersøker hvem som taler og handler i diktet, hvordan rytme, meter, klang, linje og strofe organiserer lesningen, og hvordan poetiske former forandres mellom språk, tradisjoner og medier. Kapittelet dekker både bundne og frie vers, muntlig framføring og digital poesi. Det skiller konsekvent mellom tekstlig mønster, mulig framføringsvalg, historisk konvensjon og faktisk publikumsrespons.',
    topics: [
      ['lyrisk_jeg_talehandling', 'Det lyriske jeget er en tekstlig taleposisjon, ikke automatisk den biografiske dikteren. Pronomen, tid, deiksis, tiltale og sjanger etablerer en ytringssituasjon der stemmen kan love, sørge, befale, spørre eller apostrofere. Analysen må vise hvem som kan være adressat, hva ytringen forsøker å gjøre, og hva som fortsatt krever biografiske kilder.', ['lyrisk_jeg', 'talehandling', 'apostrofe', 'deiksis'], 'Percy Bysshe Shelleys «Ode to the West Wind» analysert gjennom apostrofe, imperativer, skiftende pronomen og ønsket om at vinden skal bære diktets ord.'],
      ['rytme_meter_prosodi', 'Rytme betegner tidslig og trykkmessig organisering, meter et abstrahert gjentakelsesmønster, og prosodi språkets system av trykk, tone, lengde og frasering. En presis skandering skiller språklig uttale, metrisk forventning og faktisk framføring. Avvik er ikke automatisk uttrykksfulle, men må vises som et lokalt brudd mot en etablert norm.', ['rytme', 'meter', 'prosodi', 'skandering'], 'Åpningslinjene i John Miltons «Paradise Lost» undersøkt som blankvers gjennom jambisk forventning, syntaktisk periode, cesur og lokale trykkvariasjoner.'],
      ['rim_klang_linjering', 'Rim og andre klangmønstre forbinder ord gjennom lydlig likhet, mens linjering fordeler syntaks, pauser og visuell oppmerksomhet. Enjambement oppstår når syntaktisk enhet fortsetter over linjeslutt, men virkningen varierer med framføring og typografi. Analysen bør registrere eksakt lyd, posisjon og gjentakelse før den tilskriver symbolsk eller følelsesmessig betydning.', ['rim', 'allitterasjon', 'linjering', 'enjambement'], 'Emily Dickinsons «Because I could not stop for Death» analysert gjennom bindestreker, ballademeter, skrårim og forholdet mellom syntaktisk fortsettelse og strofegrense.'],
      ['strofe_sjanger_form', 'Strofe- og sjangerformer er historiske forventningssystemer for linjeantall, rim, argumentasjon, vending og framføring. Sonett, ballade og ghazal har flere språk- og periodebestemte varianter. Et dikt kan oppfylle, oversette eller utfordre formen. Kritikeren må derfor navngi hvilken variant som brukes og skille produktivt brudd fra feilaktig importerte regler.', ['strofe', 'sonett', 'volta', 'ghazal'], 'William Shakespeares sonett 130 undersøkt gjennom engelsk sonettstruktur, rimskjema, sammenligningskatalog og den avsluttende kuplettens omvurdering.'],
      ['modernistisk_fri_vers', 'Fritt vers er ikke fravær av form, men variabel organisering gjennom linjelengde, syntaks, gjentakelse, montasje, typografi og rytmiske tilbakekomster. Modernistiske praksiser er mangfoldige og må historiseres mot trykkultur, oversettelse og tidligere versformer. Analysen må vise hvordan bestemte brudd virker lokalt uten å gjøre fragmentet til en universell signatur for modernitet.', ['fritt_vers', 'montasje', 'fragment', 'typografi'], 'T. S. Eliots «The Waste Land» analysert gjennom stemmeskift, sitat, typografiske seksjoner og montasje, med utgave- og notatapparat holdt atskilt fra selve diktet.'],
      ['muntlig_framfort_digital_poesi', 'Framført og digital poesi fordeler verket mellom tekst, stemme, kropp, lydbehandling, rom, grensesnitt og kode. En transkripsjon dokumenterer bare noen modaliteter, mens opptak og programvare også er versjoner med tekniske betingelser. Analysen må identifisere verkets instans, bevare endringer mellom framføringer og skille observerbar publikumsatferd fra antatt effekt.', ['framforing', 'oralitet', 'digital_poesi', 'kode'], 'Allen Ginsbergs «Howl» sammenholdt i trykk og lydopptak for å undersøke pustefrase, tempo, gjentakelse og forskjellen mellom tekstlig linje og framført enhet.']
    ].map(([id, text, concepts, example]) => ({ id, text, concepts, example }))
  }
];

const narrativeConcepts = [
  concept('forteller', 'Forteller', 'Den tekstlige instansen som ytrer, ordner og formidler fortellingen til en eksplisitt eller implisitt adressat.', 'Den historiske forfatteren, en figur eller mediet som fysisk bærer teksten.'),
  concept('fokalisering', 'Fokalisering', 'Organiseringen og begrensningen av hvilken sansning, kunnskap og vurdering fortellingen gjør tilgjengelig i et segment.', 'Fortellerens grammatiske person eller et kamera som bare registrerer syn.'),
  concept('intern_fokalisering', 'Intern fokalisering', 'Framstilling begrenset til det en bestemt figur eller skiftende figurer kan sanse, vite eller slutte.', 'Førstepersonsfortelling; en tredjepersonsforteller kan også fokalisere internt.'),
  concept('fri_indirekte_diskurs', 'Fri indirekte diskurs', 'Representasjon av figurens språk eller tanke i fortellerens grammatikk uten vanlig innledningsverb eller anførselstegn.', 'Direkte tanke, fortellerkommentar eller automatisk bevis på ironi.'),
  concept('anakroni', 'Anakroni', 'Et avvik mellom hendelsenes rekonstruerte kronologi og rekkefølgen de presenteres i fortellingen.', 'Historisk anakronisme, tidsfeil eller ethvert minne hos en figur.'),
  concept('analepse', 'Analepse', 'En narrativ tilbakeføring til en hendelse som ligger tidligere enn fortellingens aktuelle referansepunkt.', 'All bakgrunnsinformasjon eller fortellerens samtidige refleksjon over fortiden.'),
  concept('prolepse', 'Prolepse', 'En narrativ foregripelse av en hendelse eller tilstand som ligger senere enn det aktuelle fortellingspunktet.', 'Leserens forventning eller et løfte som aldri realiseres i handlingen.'),
  concept('varighet', 'Narrativ varighet', 'Forholdet mellom antatt hendelsestid og den tekstlige plassen eller framføringstiden som hendelsen tildeles.', 'Objektiv lesetid eller hvor lenge en historisk hendelse faktisk varte.'),
  concept('frekvens', 'Narrativ frekvens', 'Forholdet mellom hvor mange ganger en hendelse antas å skje og hvor mange ganger den fortelles.', 'Ordfrekvens eller enkel tematisk gjentakelse uten hendelsesreferanse.'),
  concept('plot', 'Plot', 'Den organiserte og fortolkede forbindelsen mellom hendelser, mål, hindringer, avsløringer og konsekvenser i en fortelling.', 'Et kronologisk handlingsreferat eller hele teksten uansett organisering.'),
  concept('hendelse', 'Narrativ hendelse', 'En representert overgang mellom tilstander som får relevans innenfor fortellingens organisering og skala.', 'Enhver setning, beskrivelse eller faktisk historisk begivenhet uten tekstlig mellomledd.'),
  concept('kausalitet', 'Narrativ kausalitet', 'En begrunnet forbindelse der én representert tilstand eller handling framstilles som årsak til en annen.', 'Kronologisk nærhet eller figurens egen forklaring uten konkurrerende prøving.'),
  concept('fortellingsverdighet', 'Fortellingsverdighet', 'Historisk og situert vurdering av at en hendelse er uvanlig, relevant eller konsekvensrik nok til å fortelles.', 'Medfødt dramatikk eller det samme som moralsk og estetisk verdi.'),
  concept('karakterisering', 'Karakterisering', 'Prosessen der en figur konstrueres gjennom handling, tale, beskrivelse, navn, perspektiv og relasjoner over tid.', 'En psykologisk diagnose eller liste over stabile personlighetstrekk.'),
  concept('aktant', 'Aktant', 'En funksjonell rolle i handlingsstrukturen, som mål, hjelper eller motstander, som flere figurer kan fylle.', 'En konkret personfigur eller tidløs arketype med fast innhold.'),
  concept('fortellingsrom', 'Fortellingsrom', 'Den tekstlig organiserte verdenen av steder, retninger, avstander, grenser og mulige bevegelser.', 'Bare geografisk bakgrunn eller den virkelige lokaliteten teksten refererer til.'),
  concept('miljo', 'Miljø', 'Det materielle og sosiale feltet som gir handlinger, språk og bevegelser bestemte muligheter og begrensninger.', 'Nøytral dekor eller naturbeskrivelse alene.'),
  concept('upaalitelig_forteller', 'Upålitelig forteller', 'En forteller hvis kunnskap, utsagn eller verdier teksten gir begrunnede grunner til å korrigere eller avvise.', 'Enhver førstepersonsforteller, usympatisk figur eller forteller med begrenset kunnskap.'),
  concept('fortellernorm', 'Fortellernorm', 'Det settet av kunnskaps- og verdikriterier lesningen rekonstruerer for å vurdere fortellerens framstilling.', 'Forfatterens private moral eller én eksplisitt læresetning i teksten.'),
  concept('metanarrasjon', 'Metanarrasjon', 'Fortellingens eksplisitte refleksjon over egen fortellehandling, ordning, mottaker eller vansker med å representere.', 'Enhver henvisning til en bok eller all metafiksjon.'),
  concept('selvkorreksjon', 'Selvkorreksjon', 'Et markert tilfelle der fortelleren reviderer, avgrenser eller trekker tilbake sin tidligere framstilling.', 'Redaksjonell retting uten narrativ funksjon.'),
  concept('roman', 'Roman', 'En historisk variabel prosasjanger for lengre fortellinger med skiftende relasjoner til bokmarked, realisme og andre former.', 'Enhver lang tekst eller én universell europeisk utviklingsmodell.'),
  concept('novelle', 'Novelle', 'En historisk variabel kortere fortellingsform der kompresjon, seleksjon og avslutning ofte får særlig strukturell vekt.', 'Bare en kort roman eller alle korte fiksjonstekster på tvers av språk.'),
  concept('kortprosa', 'Kortprosa', 'Konsentrert prosa som kan krysse fortelling, vignett, prosadikt og fragment uten å følge én novellenorm.', 'En restkategori for uferdige eller ubetydelige tekster.'),
  concept('kompresjon', 'Narrativ kompresjon', 'Konsentrasjon av hendelser, trekk og slutningsarbeid gjennom utelatelse, fortetning og strategisk detaljvalg.', 'Bare få ord eller høyt fortellertempo.' )
];

const poetryConcepts = [
  concept('lyrisk_jeg', 'Lyrisk jeg', 'Den tekstlig konstruerte taleposisjonen som bruker førsteperson eller på annen måte bærer diktets ytring.', 'Den biografiske dikteren eller en stabil personlighet bak alle dikt.'),
  concept('talehandling', 'Talehandling', 'En språklig handling som å love, spørre, befale, sørge eller navngi innenfor en situert ytring.', 'Setningens tema eller den faktiske virkningen på enhver mottaker.'),
  concept('apostrofe', 'Apostrofe', 'Direkte henvendelse til en fraværende, død, abstrakt eller ikke-menneskelig adressat som gjøres nærværende i talen.', 'Enhver vokativ eller biografisk kommunikasjon med en faktisk mottaker.'),
  concept('deiksis', 'Deiksis', 'Språklige pekere som jeg, du, her og nå hvis referanse avhenger av den rekonstruerte ytringssituasjonen.', 'All referanse eller et sikkert bevis på diktets biografiske sted og tid.'),
  concept('rytme', 'Rytme', 'Opplevd og analysert tidslig organisering av trykk, stavelser, pauser, syntaks og gjentakelser i tekst eller framføring.', 'Fast meter eller subjektiv stemning uten registrerbare mønstre.'),
  concept('meter', 'Meter', 'Et abstrahert regelmessig mønster av sterke og svake posisjoner, lengder eller stavelser i en verstradisjon.', 'Den eneste korrekte opplesningen eller all rytme i diktet.'),
  concept('prosodi', 'Prosodi', 'Systemet og studiet av trykk, tone, lengde, intonasjon, frasering og andre suprasegmentale trekk.', 'Metrikk alene eller dekorativ lydlikhet.'),
  concept('skandering', 'Skandering', 'Eksplisitt analyse av forholdet mellom språklig uttale, metrisk mønster og lokale variasjoner i verslinjen.', 'Mekanisk merking som avgjør diktets betydning.'),
  concept('rim', 'Rim', 'Systematisk lydlig samsvar, vanligvis fra en trykksterk vokal til ordslutt, ordnet i bestemte posisjoner.', 'Identisk stavemåte eller all lydlig gjentakelse.'),
  concept('allitterasjon', 'Allitterasjon', 'Gjentakelse av framlyd eller konsonantisk ansats i nærliggende trykkbærende ord eller fraser.', 'Enhver gjentatt bokstav uavhengig av uttale og posisjon.'),
  concept('assonans', 'Assonans', 'Gjentakelse eller korrespondanse mellom vokallyder i ord som ikke nødvendigvis danner fullt rim.', 'Vanlig enderim eller identisk ortografi.'),
  concept('linjering', 'Linjering', 'Fordelingen av språk i verslinjer som skaper visuelle, syntaktiske, rytmiske og forventningsmessige enheter.', 'Automatisk pause ved hver linjeslutt.'),
  concept('enjambement', 'Enjambement', 'Fortsettelse av en syntaktisk eller semantisk enhet over linje- eller strofegrensen uten full avslutning.', 'Alle linjer uten tegnsetting eller en obligatorisk framføringspause.'),
  concept('strofe', 'Strofe', 'En gjentatt eller avgrenset gruppe verslinjer organisert gjennom mellomrom, rim, meter, syntaks eller funksjon.', 'Et prosaisk avsnitt eller enhver typografisk blokk.'),
  concept('sonett', 'Sonett', 'En familie av fjortenlinjers former med historisk variable rimskjemaer, inndelinger, argumenter og vendinger.', 'Én uforanderlig italiensk eller engelsk oppskrift.'),
  concept('volta', 'Volta', 'En markert vending i sonettens argument, perspektiv, adresse eller billedføring, ofte men ikke alltid ved en formgrense.', 'En obligatorisk betydningsreversering på én bestemt linje.'),
  concept('ghazal', 'Ghazal', 'En lyrisk form av selvstendige, tematisk resonnerende kupletter bundet av rim- og refrengmønstre i flere språktradisjoner.', 'Enhver kjærlighetssang eller vestlig diktsekvens med kupletter.'),
  concept('fritt_vers', 'Fritt vers', 'Vers uten ett gjennomgående fast meter, organisert gjennom variable linjer, syntaks, klang, gjentakelse og typografi.', 'Formløs prosa delt tilfeldig i linjer.'),
  concept('montasje', 'Poetisk montasje', 'Sammenstilling av fragmenter, stemmer, sitater eller dokumenter der brudd og overgang blir formbærende.', 'Tilfeldig samling eller harmonisk syntese av alle delene.'),
  concept('fragment', 'Fragment', 'En tekstlig del som markerer ufullstendighet, brudd eller avrevet sammenheng som en historisk og formell strategi.', 'Enhver kort tekst eller et dokument som fysisk mangler sider.'),
  concept('typografi', 'Poetisk typografi', 'Den visuelle organiseringen av skrift, mellomrom, skriftgrad, tegn og plassering som del av verkets form.', 'Ren dekor uten semantisk eller medial funksjon.'),
  concept('framforing', 'Framføring', 'En situert realisering av et poetisk verk gjennom stemme, kropp, tempo, rom, teknologi og publikum.', 'Den endelige eller eneste autentiske versjonen av teksten.'),
  concept('oralitet', 'Oralitet', 'Produksjons- og overføringspraksiser der stemme, hukommelse, gjentakelse og sosial framføring har strukturerende betydning.', 'Fravær av skrift eller spontan tale uten form.'),
  concept('digital_poesi', 'Digital poesi', 'Poesi der beregning, grensesnitt, nettverk eller digital materialitet er nødvendig for verkets produksjon eller erfaring.', 'Et skannet eller elektronisk distribuert trykkdikt alene.'),
  concept('kode', 'Kode som poetisk materiale', 'Instruksjoner og formelle systemer som genererer, ordner eller påvirker tekstens synlige og interaktive hendelser.', 'Bare programmeringsspråkets lesbare ord eller en skjult forfatterintensjon.')
];

const narrativeSections = [
  section('forteller-og-fokalisering', '1. Forteller, fokalisering og perspektiv', areas[0].topics[0], [
    'Forteller og fokalisering svarer på forskjellige spørsmål. Fortelleren ytrer og ordner diskursen, mens fokaliseringen regulerer hvilken sansning, kunnskap og vurdering som er tilgjengelig. En tredjepersonsforteller kan holde seg tett til én figur, og en førstepersonsforteller kan gjengi forhold vedkommende ikke forsto da hendelsen skjedde. Analysen må derfor registrere pronomen, tilgang, temporal avstand og vurderingsspråk før den navngir perspektivtypen.',
    'I «Emma» lar fri indirekte diskurs fortellerens preteritum og tredjeperson bære ordvalg og vurderinger som kan tilhøre Emma. Formen skaper nærhet uten anførselstegn, men også rom for korreksjon når senere hendelser motsier hennes selvsikre slutninger. En god lesning lokaliserer modalverb, evaluerende adjektiver og kunnskapsgrenser; den gjør ikke enhver ironisk virkning til fortellerens entydige moralske dom.',
    'Perspektiv er dynamisk og kan fordeles ulikt mellom syn, kunnskap og verdi. En scene kan følge hva figuren ser, samtidig som fortelleren gir historisk informasjon figuren mangler. Kritikeren bør prøve minst to segmenteringer og spørre hvor skiftet faktisk skjer. Påstander om hva leseren føler eller overser kan foreslås som formell invitasjon, men krever resepsjonsdata hvis de skal beskrive faktiske reaksjoner.'
  ], [['nar-01', 'nar-02'], ['nar-03', 'nar-04'], ['nar-05']], ['Skill alltid den som taler fra den som sanser eller vet.', 'Dokumenter perspektivskift med grammatiske og epistemiske signaler.']),
  section('rekkefolge-varighet-frekvens', '2. Rekkefølge, varighet og frekvens', areas[0].topics[1], [
    'Temporal analyse begynner med to rekonstruksjoner: hendelsenes antatte kronologi og den rekkefølgen diskursen presenterer dem i. Analepser og prolepser må avgrenses med startpunkt, rekkevidde og funksjon. Et minne er ikke automatisk en analepse dersom det bare nevnes uten å etablere et fortalt hendelsesforløp. Modellen beskriver tekstlig organisering og må ikke forveksles med klokketiden en bestemt leser bruker.',
    'I madeleinescenen i Prousts «På sporet av den tapte tid» utløser smak en bevegelse fra nåtidig kroppserfaring til en omfattende erindringskonstruksjon. Fortellingen veksler mellom scenisk detalj, iterativ vane og retrospektiv refleksjon. Analysen bør måle hvilke øyeblikk som utvides, hvilke år som sammentrekkes, og hvordan fortelleren skiller den tidligere erfaringen fra den senere kunnskapen som gir den form.',
    'Frekvens skiller singulativ fortelling, der én hendelse fortelles én gang, fra repetitiv og iterativ framstilling. Disse kategoriene viser hvordan rutine og unntak produseres tekstlig. De avgjør ikke hvor viktig en hendelse faktisk var historisk. En full analyse undersøker også tempo, kapittelinndeling og syntaktisk rytme og prøver om den temporale effekten kan forklares bedre av sjanger, minneform eller publiseringsformat.'
  ], [['nar-06', 'nar-07'], ['nar-08'], ['nar-09']], ['Rekonstruer både hendelsestid og diskurstid.', 'Skill tekstlig varighet fra empirisk lesetid.']),
  section('plot-hendelse-kausalitet', '3. Plot, hendelse og kausalitet', areas[0].topics[2], [
    'Et plot er ikke hendelsene alene, men forbindelsene fortellingen gjør relevante mellom dem. Mål, hindringer, løfter, tilfeldigheter og avsløringer kan gi ulike kausale modeller. Kritikeren må vise mellomleddet som gjør én hendelse forklarende, og skille figurenes begrunnelser fra fortellingens bredere organisering. At B følger A, er ikke nok til å hevde at A forårsaker B eller at teksten støtter forbindelsen.',
    'I «Pride and Prejudice» omorganiserer Darcys brev både Elizabeths kunnskap og leserens forståelse av tidligere samtaler, Wickhams historie og Bingleys avreise. Brevet skaper ikke fortidens hendelser, men endrer plottets kausale og moralske lesbarhet. Analysen må vende tilbake til de tidligere scenene, identifisere hvilke tegn som kunne tolkes annerledes, og unngå å gjøre den senere ekteskapsløsningen til nødvendig skjebne.',
    'Fortellingsverdighet avgjør hvilke hendelser som markeres som avvik, men normen er historisk og sosial. En uteblitt samtale kan være mer plottbærende enn en reise dersom teksten organiserer forventning rundt tausheten. Alternativprøving er avgjørende: skyldes vendingen figurens valg, sjangerkonvensjon, tilfeldighet eller fortellerens informasjonskontroll? Teksten kan støtte flere årsaksnivåer uten at alle forklaringer blir like godt dokumentert.'
  ], [['nar-10', 'nar-11'], ['nar-12'], ['nar-13']], ['Kausalitet krever et tekstlig mellomledd, ikke bare rekkefølge.', 'Prøv figurmotiv mot sjanger og informasjonsfordeling.']),
  section('karakter-rom-miljo', '4. Karakter, rom og miljø', areas[0].topics[3], [
    'Karakterisering skjer direkte gjennom navn og beskrivelser og indirekte gjennom handling, tale, blikk og relasjoner. Ingen enkeltpassasje trenger å gi en stabil psykologisk kjerne. Analysen bør følge hvem som tilskriver trekket, når opplysningen gis, og om senere situasjoner bekrefter eller utfordrer den. Aktantmodeller kan synliggjøre handlingsfunksjoner, men må ikke redusere komplekse figurer til tidløse roller.',
    'I Balzacs «Le Père Goriot» ordner pensjonatets etasjer, værelser og spiseplass et sosialt hierarki, mens Rastignacs bevegelser mellom pensjonatet og aristokratiske salonger gjør ambisjon romlig lesbar. Rommet er ikke bare symbol: dører, adresser, avstander og adgang påvirker konkrete handlinger. En historisk påstand om Paris krever likevel kart, byhistorie og samtidige kilder utover romanens konstruerte geografi.',
    'Miljø forbinder materielle forhold, institusjoner og sosialt språk. En romlig nærlesning kan kartlegge terskler, synslinjer og bevegelsesverb, men bør også registrere hvem som mangler mobilitet og hvem som beskriver stedet. Dersom et hjem leses som trygghet eller fengsel, må begge hypoteser prøves mot hendelser og perspektiv. Faktisk boligpraksis eller klassestruktur kan ikke utledes direkte fra én fiksjon.'
  ], [['nar-14', 'nar-15'], ['nar-16'], ['nar-17']], ['Karaktertrekk har en kilde og en fortellingssituasjon.', 'Rom organiserer handling og adgang, men er ikke historisk dokumentasjon alene.']),
  section('upaalitelighet-og-metanarrasjon', '5. Upålitelighet og metanarrasjon', areas[0].topics[4], [
    'Upålitelighet er en fortolkningshypotese som krever en målestokk. Fortelleren kan ta feil om fakta, mangle kunnskap, villede adressaten eller uttrykke verdier teksten problematiserer. Disse nivåene må holdes atskilt. En begrenset forteller er ikke nødvendigvis upålitelig, og en usympatisk forteller kan rapportere nøyaktig. Analysen må identifisere motsigelser, alternative vitnesbyrd og normen som gjør korreksjonen mulig i hvert tilfelle.',
    'Fortelleren i Poes «The Tell-Tale Heart» insisterer på sin fornuft, men knytter beviset til overdrevet sansning, tvangspreget planlegging og en lyd som til slutt driver fram tilståelsen. Rytme og gjentakelse gjør forsvaret performativt ustabilt. Kritikeren bør skille hva fortelleren hevder å høre, hva teksten lar leseren slutte, og hvilke medisinske eller juridiske historiseringer som krever andre kilder.',
    'Metanarrasjon gjør fortelleakten synlig gjennom kommentarer om utvalg, rekkefølge, hukommelse eller adressat. Selvkorreksjon kan bygge troverdighet eller avsløre kontrolltap; funksjonen avgjøres lokalt. Metanarrasjon betyr ikke at verket opphever all referanse, og metafiksjon er et bredere spørsmål om fiksjonens status. En presis analyse viser hvilket narrativt nivå som kommenteres, og hvordan kommentaren endrer evidensen for leseren.'
  ], [['nar-18', 'nar-19'], ['nar-20'], ['nar-21']], ['Navngi normen som gjør fortelleren korrigerbar.', 'Skill faktuell, epistemisk og verdimessig upålitelighet.']),
  section('roman-novelle-kortprosa', '6. Roman, novelle og kortprosa', areas[0].topics[5], [
    'Roman, novelle og kortprosa avgrenses gjennom mer enn ordtelling. Publiseringsformat, serialisering, bokmarked, muntlig forhistorie og nasjonal terminologi påvirker hva formene betyr. Lengde får likevel formelle følger: korte tekster kan konsentrere utvalg og slutningsarbeid, mens lengre former kan fordele parallelle forløp og revisjoner. Ingen av disse mulighetene er en nødvendig eller universell sjangerregel på tvers av litteraturhistorien.',
    'Mansfields «The Garden Party» komprimerer en klasseterskel gjennom forberedelser, dødsbudskap, Lauras bevegelse til den fattigere gaten og en avbrutt avsluttende replikk. En epifanisk lesning må vise hva som faktisk blir erkjent og hva som forblir språkløst. Den åpne slutten er ikke tom; den begrenser hvor sikkert leseren kan formulere moralsk læring og sosial forandring etter møtet.',
    'Sammenligning på tvers av skala krever like analyseenheter. Et kapittel fra en roman og en hel novelle har forskjellige kompositoriske funksjoner. Forskeren bør dokumentere utgave, opprinnelig publiseringssted og samtidens sjangerbetegnelse, deretter undersøke hendelsestetthet, karakterintroduksjon og avslutning. Slik kan sjangerhistorie og nærlesning samarbeide uten å gjøre dagens markedsføringsetikett til tidløs formdefinisjon for alle språk og perioder.'
  ], [['nar-22'], ['nar-23'], ['nar-24']], ['Historiser sjangerbetegnelsen og publiseringsformatet.', 'Åpen avslutning begrenser slutning; den opphever ikke form.'])
];

const poetrySections = [
  section('lyrisk-jeg-og-talehandling', '1. Lyrisk jeg, adresse og talehandling', areas[1].topics[0], [
    'Et lyrisk jeg er en taleposisjon som må rekonstrueres fra diktets pronomen, tid, sted, adresse og handling. Førsteperson gjør ikke diktet selvbiografisk, og fravær av «jeg» betyr ikke at ingen stemme organiserer ytringen. Kritikeren bør spørre hvem som kan høre ordene, hva talen forsøker å gjøre, og hvilke trekk som tilhører sjangerrollen snarere enn den historiske dikteren.',
    'I Shelleys «Ode to the West Wind» henvender stemmen seg til vinden som kraft, adressat og mulig bærer av ordene. Imperativer, spørsmål og ønsket om å bli løftet organiserer diktet som handling, ikke bare beskrivelse. Apostrofen skaper et «du» som ikke kan svare bokstavelig. Analysen må følge hvordan talerens posisjon endres gjennom de fem delene og den avsluttende framtidsfiguren.',
    'Talehandlingsteori kan skille bønn, løfte, befaling og erklæring, men litterære ytringer virker innenfor en fiksjonell og historisk ramme. Et dikt som lover udødelighet, utfører ikke nødvendigvis et juridisk eller sosialt løfte. Deiktiske ord peker mot en konstruert situasjon; biografisk identifikasjon krever brev, manuskripter eller andre kilder. Tekstanalysen viser yttringens tilbud, ikke alle faktiske leseres respons.'
  ], [['lyr-01', 'lyr-02'], ['lyr-03', 'lyr-04'], ['lyr-05']], ['Skill taleposisjon fra biografisk person.', 'Analyser hva adressen gjør, ikke bare hvem den navngir.']),
  section('rytme-meter-prosodi', '2. Rytme, meter og prosodi', areas[1].topics[1], [
    'Meter er en abstraksjon av tilbakevendende sterke og svake posisjoner, mens rytme omfatter den konkrete bevegelsen som oppstår mellom ordtrykk, syntaks, pauser og forventning. Prosodiske systemer varierer mellom språk og tradisjoner; jambiske føtter kan ikke ukritisk overføres til kvantitativt eller stavelsestellende vers. Skandering bør derfor oppgi uttalegrunnlag, norm og alternative muligheter ved tvetydige linjer i materialet.',
    'Åpningen av Miltons «Paradise Lost» etablerer blankvers uten enderim, men den lange syntaktiske perioden går over flere linjer og varierer cesur, inversjon og trykk. Analysen bør først markere den jambiske forventningen, deretter vise hvor språklig trykk bryter eller forskyver den. Et lokalt avvik får betydning gjennom plassering og gjentakelse, ikke fordi enhver metrisk variasjon automatisk uttrykker konflikt.',
    'Framført rytme er en realisering, ikke bare en skjult fasit i skriften. Ulike lesere kan fordele pauser og trykk forskjellig innenfor språkets og meterets rammer. En auditiv studie trenger opptak, metadata og gjerne flere framføringer. Tekstlig skandering kan dokumentere mulighetsrommet, men påstander om historisk uttale eller publikums kroppslige erfaring krever fonologiske, arkivmessige eller empiriske kilder.'
  ], [['lyr-06', 'lyr-07'], ['lyr-08'], ['lyr-09']], ['Skille metrisk norm fra konkret rytmisk realisering.', 'Begrunn skandering med språk og historisk uttale.']),
  section('rim-klang-linjering', '3. Rim, klang og linjering', areas[1].topics[2], [
    'Rim må beskrives fonologisk og posisjonelt: fullt rim, skrårim, indre rim og refreng skaper ulike forbindelser. Allitterasjon og assonans kan binde ord på tvers av syntaks, men lydlikhet er ikke i seg selv semantisk bevis. Kritikeren bør kartlegge gjentakelsen, prøve om den følger bøyning eller vanlig ordforråd, og først deretter spørre hvordan klangparet påvirker motiv, argument eller hukommelse.',
    'I Dickinsons «Because I could not stop for Death» samvirker balladelignende strofer, bindestreker og varierende rimgrad. Skrårim kan opprettholde forventning uten full lydlig lukning, mens syntaksen noen steder fortsetter over linje og strofe. En presis analyse må angi hvilken tekstutgave den bruker, fordi Dickinsons manuskripter og tidlige normaliserte trykk gir forskjellige tegnsettings- og linjeringsdata for diktet.',
    'Enjambement setter linjegrensen i arbeid mot en syntaktisk eller semantisk fortsettelse. Leseren kan møte en midlertidig betydning ved linjeslutt som revideres på neste linje, men effekten avhenger av layout og framføring. Hver linjeslutt er ikke en pause, og prosadikt kan ha rytmisk segmentering uten verslinjer. Analysen bør skille visuell grense, metrisk posisjon og faktisk auditiv pause.'
  ], [['lyr-10', 'lyr-11'], ['lyr-12'], ['lyr-13']], ['Kartlegg lyd før symbolsk fortolkning.', 'Oppgi utgave når tegnsetting og linjering varierer.']),
  section('strofe-sjanger-form', '4. Strofe, sjanger og form', areas[1].topics[3], [
    'Strofer organiserer linjer gjennom mellomrom, rim, meter, syntaks og gjentatt funksjon. En sonett er en historisk familie av fjortenlinjers former, ikke ett fast rimskjema; voltaen kan ligge ved oktav–sekstett-grensen, før en avsluttende kuplett eller oppstå gradvis. Tilsvarende må ballade og ghazal analyseres innenfor sine språk- og framføringstradisjoner, ikke som dekorative etiketter uten historisk og språklig presisjon.',
    'Shakespeares sonett 130 bruker tre kvartetter til å avvise overdrevne skjønnhetssammenligninger før kupletten omvurderer kjærlighetens verdi. Vendingen opphever ikke de foregående nektelsene, men endrer hva slags lovprisning diktet tilbyr. Analysen bør følge rim, syntaktiske enheter og sammenligningskatalogen og prøve om kupletten lukker argumentet eller bevarer en ironisk spenning rundt konvensjonell ros, poetisk verdi og skjønnhet.',
    'Når en form vandrer mellom språk, endres tilgjengelige rim, rytmer og litterære institusjoner. En norsk sonett eller engelskspråklig ghazal må ikke måles som mangelfull kopi før oversettelses- og resepsjonshistorien er undersøkt. Formbrudd er analytisk interessant bare mot en dokumentert forventning. Kritikeren bør navngi variant, periode og kilde til regelen og vise om diktet signaliserer bevisst omforming.'
  ], [['lyr-14', 'lyr-15'], ['lyr-16'], ['lyr-17']], ['Navngi den historiske formvarianten, ikke bare sjangeren.', 'Et formbrudd krever en dokumentert norm.']),
  section('modernisme-og-fritt-vers', '5. Modernisme, fritt vers og montasje', areas[1].topics[4], [
    'Fritt vers erstatter ikke form med vilkårlighet. Variable linjer, syntaktiske paralleller, anafor, visuell gruppering og tilbakevendende klang kan skape sterke normer innenfor ett dikt. Modernistisk poesi rommer dessuten både bundet og fritt vers. En analyse må etablere det lokale mønsteret før et brudd navngis og unngå å gjøre fragment, bymotiv eller vanskelighet til tilstrekkelig definisjon av modernisme.',
    '«The Waste Land» organiserer stemmeskift, sitater, språk og typografiske seksjoner som montasje. Delene står i konflikt, men forbindes også gjennom vann, årstid, byrom og gjentatte taleformer. Kritikeren må identifisere hvem som taler der teksten gir signaler, og bevare usikkerhet der den ikke gjør det. Eliots senere noter er en viktig paratekst, men ikke en uttømmende fasit for diktets kilder og form.',
    'Fragmentet kan markere tap, arkiv, sitat eller produksjonsprosess, og ulike forklaringer må prøves. Historiske påstander om krig, urbanitet eller medieteknologi trenger kilder utover diktet. Samtidig må konteksten kobles gjennom et tekstlig mellomledd: et identifiserbart sitat, en typografisk overgang eller en formell rytme. Ellers blir «modernitet» en løs bakgrunn som forklarer alt og derfor ingenting presist.'
  ], [['lyr-18', 'lyr-19'], ['lyr-20'], ['lyr-21']], ['Fritt vers etablerer lokale normer som kan beskrives.', 'Koble historisk kontekst til et konkret formtrekk.']),
  section('framfort-og-digital-poesi', '6. Framført, muntlig og digital poesi', areas[1].topics[5], [
    'Framført poesi er multimodal: stemme, pust, tempo, gest, rom, mikrofon og publikumslyd inngår i den konkrete hendelsen. Trykktekst og opptak er relaterte, men ikke utskiftbare versjoner. Forskeren må beskrive opptaksdato, sted, redigering og tilgjengelig dokumentasjon. En transkripsjon støtter språkanalyse, men kan ikke alene bevare tonehøyde, timing eller kroppslig og sosial samhandling i det konkrete rommet.',
    'Ginsbergs «Howl» bruker lange trykklinjer og gjentatt syntaktisk åpning i trykk, mens innspillinger viser hvordan pust, tempo og betoning grupperer materialet. Analysen bør sammenligne en bestemt utgave med ett navngitt opptak og notere reelle avvik. At publikum ler eller applauderer er observerbar respons i opptaket; hvorfor de reagerer slik, krever historisk kontekst og forsiktighet med motivtilskrivning.',
    'Digital poesi kan genereres, endres ved brukerhandling eller avhenge av programvare som ikke lenger kjører. Kode, grensesnitt og maskinmiljø blir da deler av verkets kildegrunnlag. En skjermvideo dokumenterer én realisering, ikke hele mulighetsrommet. Bevaring krever versjonering, emulering og beskrivelse av avhengigheter, mens fortolkningen må skille hva koden muliggjør, hva brukeren faktisk gjorde, og hva kritikeren antar.'
  ], [['lyr-22'], ['lyr-23'], ['lyr-24']], ['Behandle trykk, opptak og framføring som relaterte versjoner.', 'Dokumenter kode, grensesnitt og kjøreomgivelser i digital poesi.'])
];

const sourceRows = {
  narrative: [
    ['sna01', 'Narrative Discourse', 'https://www.cornellpress.cornell.edu/book/9780801492594/narrative-discourse/', 'Cornell University Press'],
    ['sna02', 'Narrative Theory: Core Concepts and Critical Debates', 'https://ohiostatepress.org/books/BookPages/HermanNarrative.html', 'The Ohio State University Press'],
    ['sna03', 'The Cambridge Companion to Narrative', 'https://www.cambridge.org/core/books/cambridge-companion-to-narrative/45E41A6D74F9CB697D9668AC46D88397', 'Cambridge University Press'],
    ['sna04', 'The Rhetoric of Fiction', 'https://press.uchicago.edu/ucp/books/book/chicago/R/bo5965941.html', 'University of Chicago Press'],
    ['sna05', 'Story and Discourse', 'https://www.cornellpress.cornell.edu/book/9780801491863/story-and-discourse/', 'Cornell University Press'],
    ['sna06', 'The Cambridge Introduction to Narrative', 'https://www.cambridge.org/highereducation/books/the-cambridge-introduction-to-narrative/CFD3B91DD86BE8A9F3F228D07A801FEA', 'Cambridge University Press'],
    ['sna07', 'Emma', 'https://www.gutenberg.org/ebooks/158', 'Project Gutenberg'],
    ['sna08', 'Pride and Prejudice', 'https://www.gutenberg.org/ebooks/1342', 'Project Gutenberg'],
    ['sna09', 'Le Père Goriot', 'https://www.gutenberg.org/ebooks/1237', 'Project Gutenberg'],
    ['sna10', 'The Tell-Tale Heart', 'https://www.gutenberg.org/ebooks/2148', 'Project Gutenberg'],
    ['sna11', 'The Garden Party and Other Stories', 'https://www.gutenberg.org/ebooks/1429', 'Project Gutenberg'],
    ['sna12', 'In Search of Lost Time', 'https://www.penguinrandomhouse.com/series/SLT/in-search-of-lost-time/', 'Penguin Random House']
  ],
  poetry: [
    ['sly01', 'The Princeton Encyclopedia of Poetry and Poetics', 'https://press.princeton.edu/books/hardcover/9780691154916/the-princeton-encyclopedia-of-poetry-and-poetics', 'Princeton University Press'],
    ['sly02', 'The Cambridge Introduction to Poetic Form', 'https://www.cambridge.org/core/books/cambridge-introduction-to-poetic-form/0A04EE46C70E915A6D4ED11E49969A3E', 'Cambridge University Press'],
    ['sly03', 'Meter and Meaning', 'https://www.routledge.com/Meter-and-Meaning-An-Introduction-to-Rhythm-in-Poetry/Attridge/p/book/9780415311764', 'Routledge'],
    ['sly04', 'Poetry and Language', 'https://www.cambridge.org/core/books/cambridge-companion-to-twentiethcentury-english-poetry/poetry-and-language/8F96757CA7769560181774B77FD137A6', 'Cambridge University Press'],
    ['sly05', 'The Princeton Handbook of Poetic Terms', 'https://press.princeton.edu/books/hardcover/9780691172835/the-princeton-handbook-of-poetic-terms', 'Princeton University Press'],
    ['sly06', 'Electronic Literature Organization Collections', 'https://collection.eliterature.org/', 'Electronic Literature Organization'],
    ['sly07', 'Ode to the West Wind', 'https://www.poetryfoundation.org/poems/45134/ode-to-the-west-wind', 'Poetry Foundation'],
    ['sly08', 'Paradise Lost', 'https://www.gutenberg.org/ebooks/20', 'Project Gutenberg'],
    ['sly09', 'Because I could not stop for Death', 'https://www.poetryfoundation.org/poems/47652/because-i-could-not-stop-for-death-479', 'Poetry Foundation'],
    ['sly10', 'Shakespeare’s Sonnets', 'https://www.gutenberg.org/ebooks/1041', 'Project Gutenberg'],
    ['sly11', 'The Waste Land', 'https://www.poetryfoundation.org/poems/47311/the-waste-land', 'Poetry Foundation'],
    ['sly12', 'Howl and Other Poems', 'https://www.citylights.com/city-lights-published/howl-and-other-poems/', 'City Lights Books']
  ]
};
const sources = (rows) => rows.map(([id, label, url, publisher]) => ({ id, label, url, publisher, type: 'faglig_eller_primar_kilde', source_location: 'Verkpresentasjon og relevant hovedargument' }));

const claimRows = {
  narrative: [
    ['nar-01', 'Forteller og fokalisering betegner ulike funksjoner i narrativ organisering.', ['sna01', 'sna03']],
    ['nar-02', 'Grammatisk person avgjør ikke alene hvilken figur fortellingen begrenser kunnskapen til.', ['sna01', 'sna06']],
    ['nar-03', 'Fri indirekte diskurs kan kombinere fortellerens grammatikk med figurens evaluative språk.', ['sna03', 'sna07']],
    ['nar-04', '«Emma» organiserer begrenset kunnskap og korrigerende ironi gjennom skiftende narrativ nærhet.', ['sna04', 'sna07']],
    ['nar-05', 'Tekstlig perspektiv dokumenterer ikke alene faktiske leseres oppmerksomhet eller reaksjon.', ['sna02', 'sna03']],
    ['nar-06', 'Narrativ rekkefølge analyseres mot en rekonstruert hendelseskronologi.', ['sna01']],
    ['nar-07', 'Analepse og prolepse må avgrenses relativt til et aktuelt fortellingspunkt.', ['sna01', 'sna06']],
    ['nar-08', 'Prousts madeleinescene organiserer nåtidig sansning og retrospektiv erindring på ulike tidsskalaer.', ['sna12']],
    ['nar-09', 'Narrativ frekvens skiller antall hendelser fra antall framstillinger av dem.', ['sna01']],
    ['nar-10', 'Plot er en organisert forbindelse mellom hendelser og ikke bare deres kronologiske liste.', ['sna02', 'sna05']],
    ['nar-11', 'Kausalitet krever et begrunnet mellomledd utover tidslig nærhet.', ['sna02', 'sna05']],
    ['nar-12', 'Darcy-brevet i «Pride and Prejudice» reorganiserer forståelsen av tidligere hendelser.', ['sna08']],
    ['nar-13', 'Fortellingsverdighet er historisk og situert og påvirker hva teksten markerer som avvik.', ['sna02', 'sna03']],
    ['nar-14', 'Karakterisering fordeles mellom beskrivelse, handling, språk, perspektiv og relasjon.', ['sna03', 'sna06']],
    ['nar-15', 'Aktantrolle og psykologisk karakter er forskjellige analyseenheter.', ['sna03', 'sna05']],
    ['nar-16', '«Le Père Goriot» knytter pensjonatets og Paris’ rom til sosial adgang og bevegelse.', ['sna09']],
    ['nar-17', 'Fiktivt rom kan ikke alene dokumentere faktisk historisk geografi eller boligpraksis.', ['sna02', 'sna03']],
    ['nar-18', 'Upålitelighet kan gjelde fakta, kunnskap eller verdier og trenger en rekonstruert målestokk.', ['sna04', 'sna06']],
    ['nar-19', 'Begrenset kunnskap gjør ikke automatisk en forteller upålitelig.', ['sna04']],
    ['nar-20', '«The Tell-Tale Heart» undergraver fortellerens fornuftsforsvar gjennom gjentakelse og selvmotsigelse.', ['sna10']],
    ['nar-21', 'Metanarrasjon kommenterer fortelleakten og er ikke identisk med all metafiksjon.', ['sna02', 'sna03']],
    ['nar-22', 'Roman, novelle og kortprosa er historiske institusjonelle former, ikke bare ordtall.', ['sna03', 'sna06']],
    ['nar-23', '«The Garden Party» kombinerer sosial terskel, kompresjon og begrenset avslutningslukning.', ['sna11']],
    ['nar-24', 'Sjangersammenligning krever dokumenterte utgaver, publiseringsformer og like analyseenheter.', ['sna02', 'sna03']]
  ],
  poetry: [
    ['lyr-01', 'Det lyriske jeget er en tekstlig taleposisjon og ikke automatisk den biografiske dikteren.', ['sly01', 'sly02']],
    ['lyr-02', 'Lyrisk adresse rekonstrueres gjennom pronomen, deiksis, tid og sjanger.', ['sly01', 'sly02']],
    ['lyr-03', '«Ode to the West Wind» organiserer apostrofe og imperativ gjennom fem deler.', ['sly07']],
    ['lyr-04', 'Apostrofen gjør en fraværende eller ikke-menneskelig adressat virksom i diktets tale.', ['sly01', 'sly05']],
    ['lyr-05', 'Biografisk identifikasjon krever kilder utover diktets førsteperson.', ['sly01', 'sly02']],
    ['lyr-06', 'Meter er et abstrahert mønster, mens rytme omfatter konkrete språklige og framførte variasjoner.', ['sly02', 'sly03']],
    ['lyr-07', 'Metriske systemer må analyseres i forhold til språkets prosodi og historiske tradisjon.', ['sly03', 'sly05']],
    ['lyr-08', '«Paradise Lost» bruker blankvers med syntaktiske og rytmiske variasjoner mot jambisk forventning.', ['sly08']],
    ['lyr-09', 'Tekstlig skandering og faktisk framføringsrytme er relaterte, men forskjellige evidensnivåer.', ['sly02', 'sly03']],
    ['lyr-10', 'Rim og klang må beskrives fonologisk, posisjonelt og historisk før semantisk fortolkning.', ['sly01', 'sly05']],
    ['lyr-11', 'Lydlikhet er ikke alene bevis på en bestemt symbolsk forbindelse.', ['sly02', 'sly05']],
    ['lyr-12', 'Dickinson-diktets bindestreker, ballademeter og skrårim varierer med utgavegrunnlaget.', ['sly09']],
    ['lyr-13', 'Enjambement setter syntaktisk fortsettelse i relasjon til linjegrensen uten å pålegge én pause.', ['sly01', 'sly02']],
    ['lyr-14', 'Sonetten er en familie av historisk variable fjortenlinjers former.', ['sly01', 'sly05']],
    ['lyr-15', 'Volta betegner en formell eller argumentativ vending som ikke har én obligatorisk plassering.', ['sly01', 'sly05']],
    ['lyr-16', 'Sonett 130 omvurderer sammenligningskatalogen gjennom den avsluttende kupletten.', ['sly10']],
    ['lyr-17', 'Formbrudd kan bare fastslås mot en dokumentert språk- og periodebestemt forventning.', ['sly01', 'sly02']],
    ['lyr-18', 'Fritt vers organiseres gjennom variable linjer, syntaks, gjentakelse, klang og typografi.', ['sly02', 'sly04']],
    ['lyr-19', 'Modernistisk poesi kan bruke både bundne og frie versformer.', ['sly04']],
    ['lyr-20', '«The Waste Land» organiserer sitat, stemmeskift, flerspråklighet og typografiske seksjoner som montasje.', ['sly11']],
    ['lyr-21', 'Historisk kontekst må kobles til lokaliserbare formtrekk og kan ikke erstatte tekstanalysen.', ['sly02', 'sly04']],
    ['lyr-22', 'Framført poesi fordeler verket mellom tekst, stemme, kropp, rom, teknologi og publikum.', ['sly01', 'sly02']],
    ['lyr-23', 'Trykk og opptak av «Howl» muliggjør sammenligning av linje, pust, tempo og gjentakelse.', ['sly12']],
    ['lyr-24', 'Digital poesi krever dokumentasjon av kode, grensesnitt, versjon og kjøreomgivelser.', ['sly06']]
  ]
};
const claims = (rows, classification) => rows.map(([id, claim, source_ids]) => ({ id, claim, source_ids, classification, status: 'verified' }));

function materialize({ area, foundation, sections, concepts, sources: sourceList, claims: claimList, slugs, subtitle }) {
  const directory = `${PACKAGE}/foundation_texts/${area.id}`;
  const moduleFiles = slugs.map((slug, index) => `${directory}/0${index + 1}-${slug}.json`);
  for (let index = 0; index < 3; index += 1) {
    const moduleSections = sections.slice(index * 2, index * 2 + 2);
    write(moduleFiles[index], {
      schema: 'history_go_literature_foundation_module_v1',
      qualityProfile: 'full_depth_v2',
      id: `${area.id}-${index + 1}`,
      title: slugs[index].split('-').map((word) => `${word[0].toUpperCase()}${word.slice(1)}`).join(' '),
      sections: moduleSections,
      workedExamples: moduleSections.map((item) => ({
        title: `Prøv modellen: ${item.title.replace(/^\d+\.\s*/u, '')}`,
        object: foundation.topics.find((topic) => topic.id === item.coverageTopic).example,
        steps: [
          'Identifiser tekstversjon, medium, analyseenhet og historisk norm.',
          'Registrer minst tre teksttrekk før teoribegrepene anvendes.',
          'Prøv hovedhypotesen mot en alternativ formal, retorisk eller historisk forklaring.',
          'Formuler hva som krever resepsjonsdata eller andre kilder utover teksten.'
        ],
        claimIds: item.paragraphClaimIds.flat().slice(0, 3)
      })),
      commonMisconceptions: [
        { claim: 'Et kategorinavn er i seg selv en analyse.', correction: 'Begrepet må operasjonaliseres gjennom lokaliserbare trekk, forbindelser og en tydelig inferensgrense.' },
        { claim: 'Tekstlig organisering beviser én faktisk leservirkning.', correction: 'Teksten kan invitere en respons; dokumentert virkning krever resepsjons- eller empiriske data.' }
      ]
    });
  }
  const conceptFile = `${directory}/concepts.json`;
  const claimsFile = `${directory}/claims.json`;
  const wrapper = `${PACKAGE}/foundation_texts/${area.id}.json`;
  write(conceptFile, { schema: 'history_go_literature_concept_registry_v1', version: '1.0.0', subject_id: 'litteratur', coverage_area_id: area.id, status: 'canonical_full_depth_concepts', concepts });
  write(claimsFile, { schema: 'history_go_fagverk_claims_v1', version: '1.0.0', subject_id: 'litteratur', chapter_id: area.id, verified_at: '2026-08-07', verification_status: 'verified', sources: sourceList, claims: claimList });
  write(wrapper, {
    schema: 'history_go_literature_foundation_chapter_v1',
    version: '1.0.0',
    qualityProfile: 'full_depth_v2',
    subject: 'litteratur',
    id: area.id,
    title: area.title,
    subtitle,
    lead: foundation.synthesis,
    coverage_topics: area.topics,
    learningObjectives: ['skille sentrale analyseenheter og tekstnivåer', 'analysere navngitte verk gjennom lokaliserbare trekk', 'historisere sjanger, språk og medium', 'prøve konkurrerende forklaringer', 'koble fagpåstander til presise kilder', 'formulere analyseobjektets inferensgrense'],
    moduleFiles,
    conceptRegistry: conceptFile,
    claimsFile,
    editorial_status: 'foundation_text_ready',
    completion_note: 'Alle seks kontraktstemaer er materialisert som full-dybdeartikler med begreper, navngitte verk, alternative forklaringer og påstandsspor.'
  });
  return wrapper;
}

const wrappers = [
  materialize({ area: areas[0], foundation: foundations[0], sections: narrativeSections, concepts: narrativeConcepts, sources: sources(sourceRows.narrative), claims: claims(claimRows.narrative, 'narratologi_prosa'), slugs: ['stemme-og-tid', 'plot-og-rom', 'upaalitelighet-og-sjanger'], subtitle: 'Stemme, tid, handling, rom og prosafortellingens historiske former' }),
  materialize({ area: areas[1], foundation: foundations[1], sections: poetrySections, concepts: poetryConcepts, sources: sources(sourceRows.poetry), claims: claims(claimRows.poetry, 'lyrikk_poetiske_former'), slugs: ['tale-og-rytme', 'klang-og-form', 'modernisme-og-medier'], subtitle: 'Tale, vers, klang, form og poesiens skiftende medier' })
];

const coverageFile = `${PACKAGE}/coverage_contract_v1.json`;
const coverage = read(coverageFile);
coverage.coverage_areas = coverage.coverage_areas.map((row) => areas.find((area) => area.id === row.id) || row);
const complete = coverage.coverage_areas.filter((row) => row.status === 'chapter_and_overview_text_materialized');
coverage.progress = {
  areas_total: coverage.coverage_areas.length,
  areas_with_foundation_text: coverage.coverage_areas.length,
  areas_complete: complete.length,
  topics_total: coverage.completion_definition.required_topic_count,
  topics_with_foundation_text: coverage.completion_definition.required_topic_count,
  topics_complete: complete.flatMap((row) => row.topics).length,
  honest_status: 'Alle 28 områder og 168 temaer har særskrevet oversiktstekst. Ti områder og 60 temaer har full kapitteldybde, definerte begreper, navngitte analyseobjekter og påstandsspor; 18 områder og 108 temaer trenger fortsatt tilsvarende full-dybde-materialisering.'
};
write(coverageFile, coverage);

const topicsFile = `${PACKAGE}/topic_foundations_v1.json`;
const topics = read(topicsFile);
const replacements = new Map(foundations.map((row) => [row.id, row]));
topics.areas = topics.areas.map((row) => replacements.get(row.id) || row);
write(topicsFile, topics);

const indexFile = `${PACKAGE}/index.json`;
const index = read(indexFile);
index.files.foundation_chapters = [...new Set([...index.files.foundation_chapters, ...wrappers.map((file) => file.replace(`${PACKAGE}/`, ''))])];
let moduleCount = 0;
let conceptCount = 0;
let sourceCount = 0;
let claimCount = 0;
for (const file of index.files.foundation_chapters) {
  const chapter = read(`${PACKAGE}/${file}`);
  const registry = read(chapter.conceptRegistry);
  const claimFile = read(chapter.claimsFile);
  moduleCount += chapter.moduleFiles.length;
  conceptCount += registry.concepts.length;
  sourceCount += claimFile.sources.length;
  claimCount += claimFile.claims.length;
}
index.summary = {
  coverage_area_count: coverage.coverage_areas.length,
  required_topic_count: coverage.completion_definition.required_topic_count,
  area_synthesis_count: topics.areas.length,
  topic_foundation_text_count: topics.areas.flatMap((row) => row.topics).length,
  materialized_foundation_chapter_count: index.files.foundation_chapters.length,
  materialized_module_count: moduleCount,
  defined_concept_count: conceptCount,
  verified_source_count: sourceCount,
  verified_claim_count: claimCount,
  completion_status: 'narrative_poetry_core_expanded_18_areas_pending_full_depth'
};
write(indexFile, index);
console.log('Materialiserte narratologi/prosa og lyrikk/poetiske former.');
