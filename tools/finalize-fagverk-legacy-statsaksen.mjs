#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERIFIED_AT = '2026-08-31';

const targets = {
  'data/places/politikk/oslo/places_politikk/stortinget.json': {
    schema: 'history_go_place_fagverk_v2',
    level: 'standard',
    status: 'curated',
    intro: 'Stortinget kan leses som både bygning og institusjon: fasaden gjør den lovgivende statsmakten synlig, men hvem som forbereder, vedtar og kontrollerer politikk må undersøkes gjennom parlamentariske regler, dokumenter og voteringer – ikke gjennom arkitekturen alene.',
    article: [
      'Stortingsbygningen ble tatt i bruk i 1866 og ga nasjonalforsamlingen et eget fysisk hus. Den halvsirkelformede salen er synlig i fasaden, og Løvebakken markerer overgangen mellom offentlig byrom og institusjon. Dette gjør parlamentarisk makt fysisk lesbar, men bygningen må skilles fra Eidsvolls plass utenfor og fra Regjeringskvartalet, der departementene og regjeringens politiske ledelse har andre oppgaver.',
      'Stortingets arbeid foregår gjennom flere ledd. Komiteene forbereder saker og avgir innstillinger, mens formelle vedtak treffes i plenum. Lover, statsbudsjett og kontroll med regjeringen følger dokumenterte prosedyrer. Et regjeringsforslag er derfor ikke et stortingsvedtak, og et budsjettvedtak viser fullmakt og ramme – ikke automatisk faktisk pengebruk eller virkning.',
      'Parlamentarisk offentlighet er også selektiv. Plenumsdebatter er åpne, strømmes og refereres, mens mye forberedende arbeid foregår utenfor kameraenes utsnitt. Anna Rogstads møte i salen i 1911 viser samtidig hvordan endringer i politisk representasjon kan få en konkret romlig scene. En analyse av Stortinget bør derfor koble synlige symboler og mediebilder til de dokumentene som viser hva institusjonen faktisk gjorde.'
    ],
    subject_ids: ['politikk'],
    emne_ids: ['em_pol_demokrati_representasjon', 'em_pol_parlamentarisme_maktbalanse', 'em_pol_mediert_offentlighet'],
    chapter_ids: ['parlamentarisme'],
    lenses: [
      {
        id: 'stortinget-representasjon',
        title: 'Representasjon i en politisk sal',
        prompt: 'Hvordan kan Stortingssalen brukes til å undersøke hvem som får representere velgere, og hvorfor er synlig tilstedeværelse bare én del av representasjon?',
        subject_id: 'politikk',
        emne_id: 'em_pol_demokrati_representasjon',
        evidence: 'Koble rommet til daterte representasjonsdata og historiske kilder, som dokumentasjonen av Anna Rogstads møte i 1911.'
      },
      {
        id: 'stortinget-maktbalanse',
        title: 'Forslag, behandling og vedtak',
        prompt: 'Hvordan skiller regjeringens forslag, komiteenes forberedelse og Stortingets plenumsvedtak seg fra hverandre?',
        subject_id: 'politikk',
        emne_id: 'em_pol_parlamentarisme_maktbalanse',
        evidence: 'Bruk Stortingets beskrivelser av lovarbeid, budsjettarbeid, komiteer, voteringer og kontrollvirksomhet.'
      },
      {
        id: 'stortinget-mediert-offentlighet',
        title: 'Det synlige parlamentet',
        prompt: 'Hva gjør direktesendinger, pressebilder og referater synlig, og hvilke deler av den parlamentariske prosessen forblir mindre synlige?',
        subject_id: 'politikk',
        emne_id: 'em_pol_mediert_offentlighet',
        evidence: 'Sammenlign åpne plenumsflater med dokumenterte prosedyrer for komité- og partigrupparbeid uten å likestille mediedekning med hele prosessen.'
      },
      {
        id: 'stortinget-kontroll',
        title: 'Kontroll er mer enn kritikk',
        prompt: 'Hvordan kan du skille ordinær parlamentarisk kontroll fra politisk kritikk og det særskilte virkemiddelet mistillit?',
        subject_id: 'politikk',
        emne_id: 'em_pol_parlamentarisme_maktbalanse',
        evidence: 'Følg Stortingets egne beskrivelser av spørsmål, høringer, kontrollsaker og formelle vedtak.'
      }
    ],
    guiding_questions: [
      'Hva kan selve stortingsbygningen fortelle om institusjonens rolle, og hva krever dokumenter og prosedyrer?',
      'Hvorfor er en komitéinnstilling ikke det samme som et stortingsvedtak?',
      'Hvordan skiller Stortingets lovgivende og kontrollerende rolle seg fra regjeringens utøvende rolle?',
      'Hva blir synlig gjennom plenumsdebatter og mediedekning, og hva blir mindre synlig?',
      'Hvordan kan Anna Rogstads møte i 1911 brukes til å undersøke representasjon som historisk endring?'
    ],
    concepts: ['representasjon', 'parlamentarisme', 'komité', 'plenum', 'votering', 'lovgivende makt', 'budsjettmyndighet', 'parlamentarisk kontroll', 'mediert offentlighet'],
    observable_traces: [
      {
        title: 'Salen i fasaden',
        observation: 'Den halvsirkelformede stortingssalen kan leses i hovedfasaden mot Karl Johans gate.',
        interpretation_boundary: 'Fasaden dokumenterer et arkitektonisk grep, men viser ikke alene hvordan saker behandles eller makt fordeles i institusjonen.',
        source_urls: ['https://www.stortinget.no/no/Stortinget-og-demokratiet/Historikk/stortingsbygningen/om-stortingsbygningen/']
      },
      {
        title: 'Løvebakken og stortingsløvene',
        observation: 'Oppkjørselen og granittløvene markerer en tydelig fysisk overgang mellom byrommet og hovedinngangen.',
        interpretation_boundary: 'Symbolene kan observeres og dateres, men deres politiske betydning må tolkes med historiske kilder og kan ikke brukes som mål på dagens legitimitet.',
        source_urls: ['https://www.stortinget.no/no/Stortinget-og-demokratiet/Historikk/stortingsbygningen/om-stortingsbygningen/stortingslovene/']
      }
    ],
    source_urls: [
      'https://www.stortinget.no/no/Stortinget-og-demokratiet/Storting-og-regjering/kort-om-stortinget/',
      'https://www.stortinget.no/no/Stortinget-og-demokratiet/Historikk/stortingsbygningen/om-stortingsbygningen/',
      'https://www.stortinget.no/no/Stortinget-og-demokratiet/Lover-og-instrukser/forretningsorden/',
      'https://www.stortinget.no/no/stortinget-og-demokratiet/arbeidet/budsjettarbeidet/',
      'https://www.stortinget.no/no/Stortinget-og-demokratiet/kvinner-pa-stortinget/Anna-Rogstad/'
    ],
    verified_at: VERIFIED_AT
  },

  'data/places/politikk/oslo/places_politikk/eidsvolls_plass.json': {
    schema: 'history_go_place_fagverk_v2',
    level: 'standard',
    status: 'curated',
    intro: 'Eidsvolls plass er et offentlig politisk rom foran Stortinget, men ikke en beslutningsinstitusjon. Stedet egner seg til å undersøke hvordan protest, minne, adgangsregler og mediedekning kan gjøre krav synlige uten at synlighet i seg selv beviser representativitet eller politisk virkning.',
    article: [
      'Eidsvolls plass fikk navn i 1864 og ligger som en åpen park- og markeringsoverflate foran Stortinget. Nærheten til nasjonalforsamlingen gir demonstrasjoner og markeringer en tydelig politisk scene, men plassen vedtar verken lover eller budsjetter. Det analytiske skillet mellom arena og beslutningsorgan er derfor grunnleggende.',
      'Wergelandmonumentet fra 1881 og protesthistorien etter andre verdenskrig viser at offentlighet på stedet både handler om minne og om samtidige krav. Alta-aksjonen i 1979 er et godt eksempel: sultestreiken gjorde konflikten synlig og inngår i en større historie om samiske rettigheter, men påvirkning må spores videre til daterte dokumenter, behandling og vedtak.',
      'Stortingets ordning for markeringer viser også at offentlig tilgang er organisert. Tildeling av plass er ikke støtte til et budskap, og et fotografi av en markering dokumenterer et tidspunkt og et utsnitt – ikke hvem som representerer opinionen eller hvilken virkning arrangementet fikk. Feltarbeid bør derfor kombinere romlig observasjon med kildekritikk.'
    ],
    subject_ids: ['politikk'],
    emne_ids: ['em_pol_demokrati_representasjon', 'em_pol_offentlighet_debatt', 'em_pol_mediert_offentlighet'],
    chapter_ids: ['parlamentarisme'],
    lenses: [
      {
        id: 'eidsvolls-plass-arena-beslutning',
        title: 'Arena og beslutning',
        prompt: 'Hvordan kan du skille det som skjer på demonstrasjonsplassen fra de formelle beslutningene som tas inne i politiske institusjoner?',
        subject_id: 'politikk',
        emne_id: 'em_pol_demokrati_representasjon',
        evidence: 'Følg en konkret markering videre til dokumenterte saker, behandlinger eller vedtak i stedet for å anta påvirkning fra nærhet alene.'
      },
      {
        id: 'eidsvolls-plass-offentlighet',
        title: 'Regulert offentlighet',
        prompt: 'Hva forteller reglene for bruk av Eidsvolls plass om hvem som får arrangere markeringer og hvilke aktiviteter ordningen omfatter?',
        subject_id: 'politikk',
        emne_id: 'em_pol_offentlighet_debatt',
        evidence: 'Bruk Stortingets publiserte regler for markeringer og skill tilgang til arena fra institusjonell støtte.'
      },
      {
        id: 'eidsvolls-plass-mediert',
        title: 'Synlighet gjennom bilder',
        prompt: 'Hva kan et presse- eller dokumentarfoto av en markering vise, og hvilke påstander om representativitet eller effekt kan det ikke bære alene?',
        subject_id: 'politikk',
        emne_id: 'em_pol_mediert_offentlighet',
        evidence: 'Skill observerbare telt, plakater og folkemengder fra slutninger om opinion, deltakernes identitet og politisk virkning.'
      },
      {
        id: 'eidsvolls-plass-minne-protest',
        title: 'Minne og protest i samme rom',
        prompt: 'Hvordan møtes Wergelandmonumentet og nyere protesthistorie i samme offentlige plassrom?',
        subject_id: 'politikk',
        emne_id: 'em_pol_offentlighet_debatt',
        evidence: 'Bruk daterte monument- og protestkilder og unngå å gjøre fysisk nærhet til bevis for ett samlet politisk budskap.'
      }
    ],
    guiding_questions: [
      'Hvor går grensen mellom Eidsvolls plass som politisk arena og Stortinget som beslutningsinstitusjon?',
      'Hva innebærer det at Stortinget tildeler plass til en markering uten å støtte budskapet?',
      'Hvordan kan Alta-aksjonen undersøkes uten å forveksle synlighet med dokumentert politisk effekt?',
      'Hva kan et fotografi av en markering fortelle, og hvilke spørsmål må besvares med andre kilder?',
      'Hvordan påvirker monumenter, ganglinjer og nærheten til Stortinget måten plassen fungerer som offentlig scene på?'
    ],
    concepts: ['offentlighet', 'demonstrasjon', 'markering', 'representasjon', 'politisk arena', 'mediert synlighet', 'minnekultur', 'påvirkning', 'kildekritikk'],
    observable_traces: [
      {
        title: 'Wergelandmonumentet',
        observation: 'Bronsemonumentet over Henrik Wergeland står som et permanent minnespor i den åpne plassen.',
        interpretation_boundary: 'Monumentet dokumenterer en offentlig minnehandling og plassering, men sier ikke alene noe om dagens enighet om personen eller budskapet.',
        source_urls: ['https://oslobyleksikon.no/side/Henrik_Wergeland-statuen']
      },
      {
        title: 'Markeringsoverflaten foran Stortinget',
        observation: 'Den åpne flaten, ganglinjene og avstanden til stortingsbygningen gjør det mulig å samles synlig nær nasjonalforsamlingen.',
        interpretation_boundary: 'Romlig nærhet og synlighet dokumenterer en arena, men ikke politisk representativitet, støtte eller beslutningseffekt.',
        source_urls: ['https://www.stortinget.no/no/Hva-skjer-pa-Stortinget/markeringer-pa-eidsvolls-plass/', 'https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/eidsvolls-plass/']
      }
    ],
    source_urls: [
      'https://www.stortinget.no/no/Stortinget-og-demokratiet/sesjonsrapporter/stortingsaret-20162017/eidsvolls-plass/',
      'https://www.stortinget.no/no/Hva-skjer-pa-Stortinget/markeringer-pa-eidsvolls-plass/',
      'https://www.stortinget.no/no/Stortinget-og-demokratiet/Historikk/historisk-dokumentasjon/Protest/',
      'https://www.stortinget.no/no/Stortinget-og-demokratiet/Grunnloven/levende-grunnlov/',
      'https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/eidsvolls-plass/'
    ],
    verified_at: VERIFIED_AT
  },

  'data/places/politikk/oslo/slottet/slottet.json': {
    schema: 'history_go_place_fagverk_v2',
    level: 'standard',
    status: 'curated',
    intro: 'Det kongelige slott viser hvordan monarki, statsforvaltning og offentlig representasjon møtes i én bygning. Stedet bør leses med et tydelig skille mellom kongebolig, Kongen i statsråd og regjeringens politiske arbeid – og mellom synlige symboler og den formelle myndigheten som dokumenteres i Grunnloven, regler og protokoller.',
    article: [
      'Slottets byggeprosess viser tidlig at kongelig initiativ og statlig representasjon var avhengig av parlamentariske bevilgninger. Stortinget bevilget midler, avslo en ny bevilgning i 1827 og finansierte senere en redusert utgave. Bygningen kan derfor undersøkes som resultat av både arkitektonisk planlegging og en konkret makt- og budsjettforhandling.',
      'Etter 1905 ble Slottet permanent bolig for en norsk kongefamilie. Samtidig er Statsrådsalen et formelt møtested for Kongen i statsråd. Regjeringen forbereder sakene gjennom departementene, og monarken driver ikke partipolitikk eller daglig regjeringsledelse. Det institusjonelle språket må derfor leses presist: residens, statsoverhode og statsråd er forskjellige funksjoner som møtes på samme sted.',
      'Fasaden, flagget, audienser og seremonier gjør monarkiet synlig i byen. Slike symboler kan dokumenteres og analyseres, men de viser ikke alene politisk legitimitet, popularitet eller hvem som befinner seg i hvert rom. En faglig lesning kobler derfor arkitektur og ritual til de offentlige reglene som forklarer hva signalene faktisk betyr.'
    ],
    subject_ids: ['politikk'],
    emne_ids: ['em_pol_institusjoner_styring', 'em_pol_parlamentarisme_maktbalanse', 'em_pol_symbolsk_makt'],
    chapter_ids: ['forvaltning', 'parlamentarisme'],
    lenses: [
      {
        id: 'slottet-bygging-bevilgning',
        title: 'Kongelig initiativ og parlamentarisk bevilgning',
        prompt: 'Hva viser byggeprosessen om forholdet mellom kongelig initiativ og Stortingets kontroll med statlige bevilgninger?',
        subject_id: 'politikk',
        emne_id: 'em_pol_parlamentarisme_maktbalanse',
        evidence: 'Bruk Slottets dokumenterte bygge- og bevilgningshistorie og skill økonomisk myndighet fra arkitektonisk initiativ.'
      },
      {
        id: 'slottet-statsrad',
        title: 'Kongen i statsråd',
        prompt: 'Hvordan skiller Kongen i statsråd seg fra regjeringens daglige politiske ledelse og departementenes saksforberedelse?',
        subject_id: 'politikk',
        emne_id: 'em_pol_institusjoner_styring',
        evidence: 'Bruk Regjeringens beskrivelse av statsråd og protokoller; møtestedet på Slottet gjør ikke bygningen til et departement.'
      },
      {
        id: 'slottet-symbolsk-makt',
        title: 'Arkitektur og symbolsk makt',
        prompt: 'Hvilke sider av monarkiets representasjon kan faktisk observeres i fasade, akse og seremonielle signaler?',
        subject_id: 'politikk',
        emne_id: 'em_pol_symbolsk_makt',
        evidence: 'Beskriv synlige elementer først og bruk institusjonelle kilder før du tolker hva de betyr politisk.'
      },
      {
        id: 'slottet-residens-institusjon',
        title: 'Bolig, arbeidsplass og statsarena',
        prompt: 'Hvordan kan samme bygning være privat residens, arbeidssted og arena for offentlige statsakter uten at funksjonene blandes sammen?',
        subject_id: 'politikk',
        emne_id: 'em_pol_institusjoner_styring',
        evidence: 'Sammenhold Kongehusets beskrivelser av Slottet med Regjeringens beskrivelser av statsråd.'
      }
    ],
    guiding_questions: [
      'Hvordan viser finansieringen av Slottet et samspill mellom kongelig initiativ og parlamentarisk bevilgningsmakt?',
      'Hva er forskjellen mellom Slottet som residens og Slottet som møtested for Kongen i statsråd?',
      'Hvorfor betyr uttrykket Kongen i statsråd ikke at monarken driver daglig partipolitikk?',
      'Hva kan flagg, fasade og seremonier dokumentere, og hva kan de ikke bevise om politisk legitimitet?',
      'Hvordan endret 1905 bruken av Slottet uten å oppheve skillet mellom monarki og folkevalgte organer?'
    ],
    concepts: ['konstitusjonelt monarki', 'statsoverhode', 'statsråd', 'bevilgningsmakt', 'maktbalanse', 'statsforvaltning', 'residens', 'symbolsk makt', 'institusjonelt ritual'],
    observable_traces: [
      {
        title: 'Hovedfasaden i Karl Johans akse',
        observation: 'Slottets nyklassisistiske hovedfasade avslutter perspektivet fra Karl Johans gate og gjør kongeboligen visuelt dominerende i byaksen.',
        interpretation_boundary: 'Aksen og arkitekturen kan beskrives fysisk, men de kan ikke alene dokumentere politisk legitimitet eller institusjonell maktfordeling.',
        source_urls: ['https://www.kongehuset.no/kongelige-eiendommer/det-kongelige-slott/slottets-historie-og-arkitektur']
      },
      {
        title: 'Flagget over Slottet',
        observation: 'Flagging fra Slottet følger publiserte regler og fungerer som et synlig institusjonelt signal.',
        interpretation_boundary: 'Flagget skal tolkes etter de publiserte flaggreglene og kan ikke brukes til å kartlegge personers bevegelser eller aktivitet inne i bygningen.',
        source_urls: ['https://www.kongehuset.no/monarkiet/kongelige-symboler/flagging-fra-slottet']
      }
    ],
    source_urls: [
      'https://www.kongehuset.no/kongelige-eiendommer/det-kongelige-slott',
      'https://www.kongehuset.no/kongelige-eiendommer/det-kongelige-slott/slottets-historie-og-arkitektur',
      'https://www.kongehuset.no/kongelige-eiendommer/det-kongelige-slott/statsradsalen',
      'https://www.regjeringen.no/no/dokumenter/om-statsrad/id593521/?ch=1',
      'https://www.regjeringen.no/no/dokumenter/om-statsrad/id593521/?ch=5'
    ],
    verified_at: VERIFIED_AT
  },

  'data/places/politikk/oslo/slottsplassen.json': {
    schema: 'history_go_place_fagverk_v2',
    level: 'standard',
    status: 'curated',
    intro: 'Slottsplassen er et offentlig representasjonsrom der monarkiet blir synlig gjennom monument, vakthold og gjentatte seremonier. Faglig analyse må skille selve plassen fra Slottet, symbolsk makt fra formell beslutningsmakt og offentlig observasjon fra kartlegging av sikkerhetsrutiner.',
    article: [
      'Slottsplassen er den åpne, halvsirkelformede flaten foran Det kongelige slott og endepunktet for Karl Johans gate. Karl Johan-monumentet fra 1875, fasaden og plassformen bygger et sterkt representasjonsrom. At monarkiet er visuelt fremtredende her betyr likevel ikke at regjeringens daglige styring foregår på plassen eller at monumentet kan brukes som mål på politisk oppslutning.',
      'Gardens vakthold viser hvordan sikkerhetsoppgave og seremoni kan være synlige samtidig. Vaktparader og andre ordninger har endret seg historisk, og en offentlig observatør kan beskrive oppstilling og ritual uten å kartlegge sikkerhetsrutiner, våpen, enkeltgardister eller kongefamiliens bevegelser. Nettopp denne grensen er en viktig del av kilde- og feltarbeidet.',
      '17. mai-tradisjonen knytter plassen til et gjentatt møte mellom kongehus og offentlighet. Haakon VII og Maud hilste barnetoget fra balkongen i 1906, men tradisjonen har hatt avbrudd og er ikke uforanderlig. Slottsplassen viser dermed hvordan institusjonelle ritualer skaper kontinuitet gjennom kalender, rute og kroppslig gjentakelse samtidig som praksiser kan endres.'
    ],
    subject_ids: ['politikk'],
    emne_ids: ['em_pol_institusjoner_styring', 'em_pol_demokrati_representasjon', 'em_pol_symbolsk_makt'],
    chapter_ids: ['forvaltning', 'parlamentarisme'],
    lenses: [
      {
        id: 'slottsplassen-representasjonsrom',
        title: 'Offentlig representasjonsrom',
        prompt: 'Hvordan fordeler plassformen, monumentet og Slottets fasade oppmerksomhet i byrommet?',
        subject_id: 'politikk',
        emne_id: 'em_pol_symbolsk_makt',
        evidence: 'Beskriv romlige og materielle trekk først; vurder politiske betydninger mot historiske og institusjonelle kilder.'
      },
      {
        id: 'slottsplassen-ritual',
        title: 'Ritual og institusjon',
        prompt: 'Hvordan skaper gjentatte seremonier kontinuitet, og hva viser dokumenterte endringer og avbrudd om tradisjon?',
        subject_id: 'politikk',
        emne_id: 'em_pol_institusjoner_styring',
        evidence: 'Bruk Kongehusets historikk om barnetog og Gardens dokumenterte rolle; unngå å behandle dagens praksis som tidløs.'
      },
      {
        id: 'slottsplassen-synlig-makt',
        title: 'Synlig makt og formell myndighet',
        prompt: 'Hva er forskjellen mellom at monarkiet er synlig på Slottsplassen og at en institusjon har formell beslutningsmakt?',
        subject_id: 'politikk',
        emne_id: 'em_pol_demokrati_representasjon',
        evidence: 'Skill offentlig representasjon fra de formelle rollene til Stortinget, regjeringen og statsoverhodet.'
      },
      {
        id: 'slottsplassen-vakthold-grense',
        title: 'Vakthold som synlig institusjon',
        prompt: 'Hva kan studeres ved Gardens synlige vakthold uten å gå over grensen til sikkerhetskartlegging?',
        subject_id: 'politikk',
        emne_id: 'em_pol_institusjoner_styring',
        evidence: 'Hold observasjonen til offentlig synlige, historisk dokumenterte ritualer og fysiske objekter; ikke registrer operative rutiner eller enkeltpersoner.'
      }
    ],
    guiding_questions: [
      'Hvorfor må Slottsplassen skilles fra Slottet og Slottsparken når politisk funksjon analyseres?',
      'Hvordan virker Karl Johan-monumentet og byaksen som symbolsk representasjon uten å måle opinion?',
      'På hvilke måter er Gardens vakthold både sikkerhetsoppgave og offentlig seremoni?',
      'Hva viser 17. mai-tradisjonens gjentakelse og avbrudd om hvordan institusjonelle ritualer fungerer?',
      'Hvilke observasjoner kan gjøres trygt fra offentlig område, og hvilke sikkerhetsopplysninger skal ikke samles inn?'
    ],
    concepts: ['representasjonsrom', 'symbolsk makt', 'konstitusjonelt monarki', 'offentlig ritual', 'vakthold', 'institusjonell kontinuitet', 'tradisjon', 'formell myndighet', 'feltetikk'],
    observable_traces: [
      {
        title: 'Karl Johan-monumentet i plassrommet',
        observation: 'Rytterstatuen fra 1875 står som et permanent monument mellom den åpne plassen og Slottets hovedfasade.',
        interpretation_boundary: 'Monumentet dokumenterer offentlig minnekultur og symbolbruk, men kan ikke alene brukes som mål på støtte til monarkiet eller personen som fremstilles.',
        source_urls: ['https://oslobyleksikon.no/side/Karl_Johan-statuen']
      },
      {
        title: 'Fra ferdselsflate til seremoniarena',
        observation: 'Den samme åpne flaten brukes til hverdagsferdsel og til organiserte offentlige ritualer som 17. mai.',
        interpretation_boundary: 'Feltobservasjon kan beskrive rombruk og synlige avgrensninger, men skal ikke registrere sikkerhetsrutiner, enkeltgardister eller kongefamiliens bevegelser.',
        source_urls: ['https://www.kongehuset.no/nyheter/barnetogets-historie', 'https://www.kongehuset.no/det-kongelige-hoff/hoffets-avdelinger/hans-majestet-kongens-garde']
      }
    ],
    source_urls: [
      'https://www.kongehuset.no/det-kongelige-hoff/hoffets-avdelinger/hans-majestet-kongens-garde',
      'https://www.kongehuset.no/nyheter/barnetogets-historie',
      'https://oslobyleksikon.no/side/Karl_Johan-statuen'
    ],
    verified_at: VERIFIED_AT
  }
};

for (const [relative, fagverk] of Object.entries(targets)) {
  const absolute = path.join(ROOT, relative);
  const data = JSON.parse(fs.readFileSync(absolute, 'utf8'));
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(`${relative}: expected a single Place object`);
  }
  if (!data.id) throw new Error(`${relative}: missing Place id`);
  if (data.production_status !== 'complete') {
    throw new Error(`${relative}: legacy retrofit is only allowed for production_status=complete`);
  }
  if (data.fagverk?.status === 'curated') {
    throw new Error(`${relative}: already has curated Fagverk; refusing parallel overwrite`);
  }
  data.fagverk = fagverk;
  fs.writeFileSync(absolute, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`Curated Fagverk: ${data.id}`);
}
