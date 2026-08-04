# Historie – pensumarkitektur V1

## Resultat

Historie presenteres som et studieløp, ikke som en flat liste med 23 tekniske domener:

1. tid, kilder og historisk argumentasjon
2. kronologisk grunnkurs fra forhistorie til 1814
3. kronologisk grunnkurs fra 1814 til i dag
4. tematiske fagretninger
5. geografiske læringsstier og stedscaser

Den canonicale 23 × 10-modellen består som koblings- og evidensregister. Ingen av de 230 emnene, 230 teoriobjektene, 230 mappingene eller 105 metodene er slettet eller gitt nye id-er.

## Redaksjonelt tekstlag V1.1

Oversikten er ikke bare et navigasjonsregister. Den har en sammenhengende introduksjon til historiefaget, en leseguide og utdypende lærestoff for alle de 40 pedagogiske enhetene:

- 5 progresjonstrinn
- 9 kronologiske perioder
- 14 tematiske fagretninger
- 6 metodemoduler
- 6 geografiske læringsstier

Hver enhet har en kort inngang, en faglig oversiktstekst, tre konkrete læringsmål og tre nøkkelspørsmål. Kronologien, progresjonen og metodegrunnlaget presenteres som lesbare fullbreddeseksjoner framfor et rutenett av små bokser. Tematiske og geografiske spor beholder en kompakt oversikt, men viser den utdypende teksten og læringsmålene direkte; nøkkelspørsmål og tekniske innganger kan foldes ut.

Tekstlaget endrer ikke dekningsstatus. Antikken forklares som et planlagt faglig område, men står fortsatt som manglende. Tidlig moderne tid og samtidshistorien etter 1991 står fortsatt som delvis dekket til de har egne sammenhengende oversiktsløp.

## Redaksjonell fullføring V1.2

Historie har nå et komplett lærestofflag under oversikten:

- 23 av 23 canonicale fagområder har et redigert lærekapittel
- alle 230 emner inngår i minst ett kapittel
- kapitlene inneholder 234 seksjoner og 884 fagavsnitt
- brødtekstlaget inneholder om lag 54 000 ord
- alle 976 canonicale begreper kan søkes, filtreres og åpnes med definisjon, avgrensning, vanlig feilbruk, kildekrav og forbindelser
- alle ni hovedperioder har en egen sammenhengende periodeguide
- de 18 nye kapitlene har avsnittssporing til ferdige theory-evidence-objekter, canonicale claims og inspectable kilder

Redaksjonell fullføring og vurderingsdekning er fortsatt to forskjellige statuser. Antikken, tidlig moderne tid og perioden etter 1991 har nå fullverdige oversiktstekster. Den gamle `coverage_status` beholdes foreløpig for å vise hvor quiz-, case- og stedsevidens fortsatt er mangelfull. Brukerflaten viser derfor både «Periodeguide komplett» og den separate evidensstatusen.

Periodeguidene ligger i `data/fag/historie/period_guides_historie_v1.json`. De 23 lærekapitlene registreres i `data/fagverk/fagverk_registry.json`, og det fullstendige begrepsregisteret lastes fra `data/fag/historie/concepts_historie_canonical_v5_5.json`.

## Redaksjonell kvalitetsutvidelse V1.3

Den tidligere statusen «redaksjonelt komplett» var for grov. Den målte at alle fagområder og emner hadde tekst, men skilte ikke godt nok mellom fem håndbygde kapitler og atten deterministisk materialiserte kapitler. Statusregisteret bruker derfor nå `expanded_and_audited`.

De atten generator-eide kapitlene har fått et eget håndredigert fagprofil-lag i `data/fag/historie/editorial_profiles_historie_v1.json`:

- 18 selvstendige hovedfortellinger i stedet for én felles kapittelledetekst
- 54 dokumenterte stedscaser som allerede finnes i domenenes teori-evidens
- 72 redigerte ledd i årsakskjeder
- 18 reelle tolkningsspørsmål med to konkurrerende posisjoner og en redaksjonell behandling
- 54 ulike modulintroduksjoner
- 180 emnespesifikke redaksjonelle linser, én for hvert emne i de atten kapitlene

Fagprofilene endrer ikke canonicale emne-, teori-, claim- eller kilde-id-er. Materialisereren kombinerer den håndredigerte fortellingen med det eksisterende evidenslaget. Hvert emne beholder presis avsnittssporing: analytisk tekst står som analytisk, mens dokumenterte avsnitt peker til de aktuelle claimene.

`tools/validate-historie-editorial-quality.mjs` kontrollerer at alle atten profiler er komplette, at stedscasene finnes i fagområdets teori-evidens, at hver emne-id har sin egen linse, og at profilteksten faktisk er materialisert i kapittel, moduler og produksjonsbrief. Den gamle felles ledeteksten er eksplisitt forbudt i disse kapitlene.

## Fire adskilte dimensjoner

### Kronologisk grunnstamme

Grunnstammen har ni perioder fra forhistorie til samtid. Den svarer på hva studenten lærer først og gjør tidsforløpet synlig før tematiske fordypninger.

Statusen er bevisst streng:

- seks perioder er dekket
- tidlig moderne tid er delvis dekket
- samtid etter 1991 er delvis dekket
- antikken og eldre globale sivilisasjoner mangler et dedikert fagfelt

Generelle treff om imperier, religion eller handel får ikke skjule antikkgapet.

### Tematiske fagretninger

Fjorten fagretninger brukes på tvers av periodene: politisk og institusjonell historie, sosialhistorie, økonomi, arbeid, kultur og ideer, religion, kjønn og familie, migrasjon og minoriteter, samisk og urfolk, global og kolonial historie, vitenskap og teknologi, miljø, by og sted samt minne og historiebruk.

### Metode og historiografi

Metodene er samlet i seks forståelige grunnmoduler. Hele metoderegisteret består, men oversikten starter med kuraterte innganger til kildekritikk, periodisering, materielle og muntlige kilder, kvantitative og romlige metoder, aktør- og institusjonsanalyse samt historiebruk og forskningsetikk.

### Geografiske læringsstier

Geografi presenteres som seks skalaer: lokalhistorie og Oslo, Norge, Norden, Europa, global historie og sammenvevd/transnasjonal historie. Eksisterende geografiprofiler vises som aktive realiseringer; fravær av profil betyr ikke at en universell geograficelle later som den er ferdig lokal produksjon.

## Kurateringsregel

Den nye arkitekturen forbyr faste emnekvoter som faglig mål. Antall emner i et spor skal følge stoffets behov. Minimumskrav er kvalitetsporter, ikke fyllemål. Det eldre kravet om nøyaktig ti emner per domene behandles foreløpig som compatibility-data fordi quiz-, evidens- og fagverkssystemene fortsatt peker på de canonicale id-ene.

## Teknisk kontrakt

Canonical fil:

- `data/fag/historie/curriculum_architecture_historie_v1.json`

Permanent port:

- `node tools/validate-historie-curriculum-architecture.mjs`
- `node tools/validate-historie-editorial-quality.mjs`
- `node tools/materialize-historie-editorial-chapters.mjs --check`

Porten kontrollerer blant annet:

- gyldige emne-, domene-, metode-, profil- og geograficelle-id-er
- sammenhengende rekkefølge i alle navigasjonslag
- synlige og ærlige kronologiske gap
- at delvis dekning har reelle innganger og en konkret neste handling
- at manglende dekning ikke fylles med løse tematiske treff
- at alle 23 domener er klassifisert i minst ett pedagogisk lag
- at 23 domener, 230 emner og 105 metoder er bevart under migreringen
- at den nye arkitekturen ikke gjeninnfører eksakte emnekvoter
- at alle 40 pedagogiske enheter beholder reelle oversiktstekster, tre læringsmål og tre fullstendige nøkkelspørsmål
- at fagintroduksjonen og leseguiden ikke kan erstattes av korte registeretiketter
- at alle ni perioder har tre sammenhengende hoveddeler, reelle fagavsnitt, sentrale begreper og tverrgående forbindelser
- at redaksjonell periodedekning ikke overskriver en svakere quiz- eller evidensstatus
- at de atten utvidede kapitlene beholder 18 fagprofiler, 180 emnelinser, 54 stedscaser, 72 årsaksledd og 18 tolkningsdebatter
- at alle kuraterte stedscaser allerede er dokumentert i domenets canonicale teori-evidens
- at materialiserte kapitler er deterministisk identiske med fagprofilene og det canonicale evidenslaget

## Videre vedlikehold

Fagverket er strukturelt dekkende og redaksjonelt utvidet og auditert. Videre arbeid er kildevedlikehold og nye dokumenterte caseutvidelser:

1. utvide quiz-, case- og stedsevidens for Antikken, tidlig moderne tid og samtid etter 1991
2. auditere de 230 emnene for reelle dubletter og feiljusterte id/tittel-par
3. erstatte gamle eksakt-ti-validatorer med minimums-, bredde- og prioriteringsporter
4. oppdatere kilder og periodeguider når historieforskning eller kildegrunnlag endres

Slike endringer skal gjennomføres uten å svekke ferdig claim-, kilde-, place-evidence- eller theory-evidence-sporing.
