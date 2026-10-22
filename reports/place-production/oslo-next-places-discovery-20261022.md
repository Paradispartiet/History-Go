# Oslo – nye stedskandidater, separat forskningsspor (22.10.2026)

> **Kun kandidatresearch.** Ingen kanoniske Places, quiz, Fagverk, bilder eller produksjonsstatus er endret. Oslo-bolk 04 (17 steder, fullføres i en annen ChatGPT-arbeidsøkt) er eksplisitt utenfor scope. Ingen PR eller merge for den bolken er berørt.

## Repo-kontroll og avgrensning

- Kilde: `data/places/manifest.json` på `main` ved oppstart, basert på commit `8211c9c03747bdd66cafb6f55ec7190dd19ab9bb`. Manifestet lister **1547 stedfiler**, hvorav **574 har `/oslo/` i filstien**. Dette er en filnavnssjekk, ikke en full semantisk dublettkontroll.
- Kontrollerte eksisterende / **må ikke opprettes som nye**: `villa_grande`, `observatoriet`, `tandbergs_radiofabrikk_kjelsas`, `frysja_33_brekke_kraftstasjon`, `bryn_industriomrade`, `frysja_industriomrade`, `nydalen`, `kvaernerbyen_alna`, `tveten_gard`. Gjennomfør alias- og koordinatsjekk igjen før nye ID-er tas i bruk.
- Viktig grense: `frysja_industriomrade` representerer området med det tidligere Kjelsås Bruk. **Selve Kjelsås Bruk foreslås ikke som ny separat post** nå. Arbeiderboligene er en egen mulig fysisk identitet, men må vurderes særskilt.
- `kvaernerbyen_alna` representerer vannspeilet/kulverten, og ikke Kværner Brug som fabrikk; navnelikhet betyr ikke automatisk dublett.
- A betyr lovende kandidat med tydelig dokumenterbar identitet; B betyr kandidat med egen steds- eller avgrensningsusikkerhet. **Ingen kandidat er fullproduksjonsklar på dette stadiet.**

## 20 kandidater til separat neste Oslo-bolk

| Prioritet | Kandidat / forslag til ID | Lokalisering | Historisk hovedgrep | Primærkilde | Avgrensning/åpen kontroll |
|---|---|---|---|---|---|
| A | **Linderud gård** (`linderud_gard`) | Trondheimsveien 319 | Herregård, godsøkonomi og barokkhage; hovedbygning og park | [Oslo byleksikon](https://oslobyleksikon.no/side/Linderud_%28g%C3%A5rd%29); [ekstra kilde](https://mia.no/linderud/om) | Gården egen identitet, ingen treff på navn/ID i manifest |
| A | **Ekebergrestauranten** (`ekebergrestauranten`) | Kongsveien 15 | Tidlig norsk funksjonalisme 1929, krig og fredning | [Oslo byleksikon](https://oslobyleksikon.no/side/Ekebergrestauranten) | Anlegget må avgrenses fra Ekebergparken og Ekebergsletta |
| A | **Christiania Spigerverk** (`christiania_spigerverk_nydalen`) | Nydalsveien 16 (historisk industriområde) | Stålproduksjon 1853–1989 og omstilling i Nydalen | [Oslo byleksikon](https://oslobyleksikon.no/side/Christiania_Spigerverk) | Avgrens fabrikk fra eksisterende områdested Nydalen; koordinat for historisk anlegg må fastsettes |
| A | **Kristiania Teglverk** (`kristiania_teglverk_bryn`) | Nils Hansens vei **14/18 (uavklart adressenummer)** | Teglproduksjon fra 1897; bevart ovn og industribygg | [Oslo byleksikon](https://oslobyleksikon.no/side/Kristiania_Teglverk) | **Koordinat HOLD:** Kilder spriker mellom 14 og 18; avgrens mot Bryn industriområde, Zinkhvidtfabrikken og revne Bryn Teglverk |
| A | **Mustads arbeiderboliger** (`mustad_arbeiderboliger_lilleaker`) | Mustads vei 3–5 | Arbeiderfamilienes hverdag, 1880-årene og fredningskamp i 1990-årene | [Oslo byleksikon](https://oslobyleksikon.no/side/Mustads_vei) | Kun offentlig dokumentert bygningshistorie; unngå private beboeropplysninger |
| A | **Arctanderbyen** (`arctanderbyen`) | Egnehjemveien 1 (blått skilt; området omfatter Svingen/Egnehjemveien) | Norges første hageby 1910–11, boligreform og arbeiderhjem | [Oslo byleksikon](https://oslobyleksikon.no/side/Arctanderbyen) | Én områdeidentitet; ankres til offentlig skilt, ikke privat bolig |
| A | **Østre Aker kirke** (`ostre_aker_kirke`) | Ulvenveien 110 | Nygotisk kirke, innviet 1860; Groruddalens historie | [Oslo byleksikon](https://oslobyleksikon.no/side/%C3%98stre_Aker_kirke) | Kirkegård skilles fra selve kirken |
| A | **Grefsen Bad** (`grefsen_bad`) | Kjelsåsveien 51 (historisk sted) | Vannkur fra 1858, deretter tuberkulosebehandling | [Oslo byleksikon](https://oslobyleksikon.no/side/Grefsen_Bad) | Historisk belegg må skilles fra senere utbygging; foto/oppmøtepunkt kontrolleres |
| A | **Grefsen og Disen Vels velhus / Grefsen kino** (`grefsen_disen_velhus`) | Kjelsåsveien 18 | Velhus 1928–29; 'Svetter'n' kino, krigslasarett, jazzmiljø | [Oslo byleksikon](https://oslobyleksikon.no/side/Kjels%C3%A5sveien) | Én bygning; kino ikke egen Place uten særskilt identitetskontroll |
| A | **Østre Grefsen gård** (`ostre_grefsen_gard`) | Kjelsåsveien 43 | Gårdshistorie fra 1600-tallet; bevart hovedbygning fra ca. 1800 | [Oslo byleksikon](https://oslobyleksikon.no/side/%C3%98stre_Grefsen_g%C3%A5rd) | Ikke bland med Grefsen Bad eller Grefsen gård-navnevarianter |
| A | **Frognerseteren** (`frognerseteren`) | Holmenkollveien 200 | Friluftsliv og dragestil; restaurant fra 1891 | [Oslo byleksikon](https://oslobyleksikon.no/side/Frognerseteren) | Restaurant, Heftyevilla og stasjon skilles eksplisitt |
| A | **Grefsenkollen restaurant** (`grefsenkollen_restaurant`) | Grefsenkollveien 100 | Utsiktsrestaurant fra 1927, rekreasjon og krigsbruk | [Oslo byleksikon](https://oslobyleksikon.no/side/Grefsen%C3%A5sen); [ekstra kilde](https://oslobyleksikon.no/side/Grefsenkollen) | Avgrens restaurant fra åsen som natursted |
| A | **Kværner Brug** (`kvaerner_brug`) | Turbinveien 2/4 (tidligere Kværnerveien 10) | Jernstøperi fra 1853, maskinindustri og Alnas vannkraft | [Oslo byleksikon](https://oslobyleksikon.no/side/Kv%C3%A6rner_Brug) | Eksisterende Kværnerbyen ved Alna gjelder vannspeil, ikke industribedriften |
| A | **Sarabråten** (`sarabraten`) | Sarabråten ved nordøstre Nøklevann (koordinat gjenstår) | Heftyes sommersted fra 1850-årene, tidlig organisert friluftsliv og ruiner | [Oslo byleksikon](https://oslobyleksikon.no/side/Sarabr%C3%A5ten) | Nøyaktig geometri og dagens tilgjengelige spor kontrolleres |
| A | **Sæterhytten** (`saeterhytten_bygdoy`) | Dronningbjerget på Bygdøy (adresse/koordinat gjenstår) | Utfartssted fra 1862, Ibsens åpningsdikt og kongelig folkepark | [Oslo byleksikon](https://oslobyleksikon.no/side/S%C3%A6terhytten); [ekstra kilde](https://www.riksantikvaren.no/fredninger/fredning-av-bygdoy-kulturmiljo/) | Vurder som eget kulturminne innen større Bygdøy-kulturmiljø |
| B | **Østensjø gård** (`ostensjo_gard`) | Valborgs vei (Nordre/Søndre tun; eksakt punkt gjenstår) | Jordbruk og fredet oldtidsvei, bygningstradisjoner | [Oslo byleksikon](https://oslobyleksikon.no/side/%C3%98stensj%C3%B8_g%C3%A5rd) | Avgjør om Nordre og Søndre bør være egne steder |
| B | **Kjelsås Bruks arbeiderboliger** (`kjelsas_bruk_arbeiderboliger`) | Kjelsåsveien 143 a–c | Bevarte/flyttede arbeiderboliger fra 1889, i dag kunstnerboliger | [Oslo byleksikon](https://oslobyleksikon.no/side/Kjels%C3%A5sveien) | Avgrens mot Frysja industriområde; selve Kjelsås Bruk er allerede representert der |
| A | **Østre Aker kirkegård** (`ostre_aker_kirkegard`) | Ulvenveien 114 | Kirkegård innviet 1860, gravkultur og anonym minnelund | [Oslo byleksikon](https://oslobyleksikon.no/side/%C3%98stre_Aker_kirkeg%C3%A5rd) | Skal ikke duplisere kirkeplassen |
| B | **Grefsen brannstasjon (tidligere)** (`grefsen_brannstasjon`) | Kjelsåsveien 69b | Funkisbygg oppført 1938, brannvern og forstadshistorie | [Oslo byleksikon](https://oslobyleksikon.no/side/Kjels%C3%A5sveien) | Verifiser dagens fasade, eiendomsidentitet og fotomulighet |
| B | **Bryn Teglverk (historisk tomt)** (`bryn_teglverk_historisk`) | Tvetenveien 54 (historisk adresse) | Teglverket fra 1873 og Oslos boligbygging; bygningen revet | [Oslo byleksikon](https://oslobyleksikon.no/side/Bryn_Teglverk) | Kun historisk tomt: ikke presenter revet bygg som bevart; stedspinne trenger særskilt kontroll |

## Arbeidsrekkefølge – nye steder, ingen inngrep i Oslo-bolk 04

1. Først kjør **semantisk dublettkontroll** i hele `data/places/manifest.json`, ikke bare filnavn, og sjekk naboplasseringer (region versus enkeltbygg). Fjern tvilsomme dubletter framfor å skape produksjonsgjeld.
2. For de beste ca. 20 kandidatene: dokumenter riktig offentlig pinneadresse/koordinat og minst én kontrollert faglig kilde. For historiske tomter, vis eksplisitt at bygningen er borte. Ikke anta rettigheter til arkivfoto.
3. Før **noen** Place-produksjon: les alle gjeldende ni READ-FIRST-filer angitt i rotens `AGENTS.md`, og fastsett hovedbadge → underbadges → source review → bekreftet produksjonsprofil → endelig innholdsplan. Opprett regel-preflight/workcard per faktisk Place, som CI krever.
4. Bruk `docs/PLACE_PRODUCTION_MINIMUM_V1.md`: historietekst, publiserbart bilde, egen Fagverk-side, gjennomgått fullquiz, ti kontrollerte spørsmål, samsvarende QuizCard og testet appvisning. Ikke merk `vFerdig` tidlig. Lag dedikert PR senere med kun de nye stedene, uten endringer i Oslo-bolk 04 eller parallelloppgaver.

## Kildetyper

- Oslo byleksikon artiklene over brukes som avgrenset historisk forskningsgrunnlag, med enkeltlenker for hvert sted.
- <https://www.oslo.kommune.no/plan-bygg-og-eiendom/kulturminner-og-kulturmiljo/gul-liste/> og <https://www.kulturminnesok.no/> kan brukes til å kontrollere vernestatus — **ingen vernestatus er automatisk tilordnet kandidatene**.
- DigitaltMuseum / Oslo Museum og Nasjonalbiblioteket kan gi historiske motiv; lisens, kreditering og tillatt bruk må sjekkes per konkret foto før publisering.

*Dette dokumentet er kun en kandidatoversikt, ikke en statusrapport om den andre arbeidsøkten.*

## Kontrollrunde 2 – kildepakker for de første tre stedene (22.10.2026)

**Status:** Dette er redaksjonelt researchgrunnlag for neste Oslo-bolk, ikke et utført READ-FIRST, godkjent produksjonsprofil, Place, QuizCard eller publiserbart v1. Ingen kartkoordinater eller bildefiler er godkjent. Oslo-bolk 04 og dens 17 steder berøres ikke.

### R1 – Linderud gård, foreslått ID `linderud_gard`

- **Egen fysisk identitet:** Historisk hovedbygning og hage-/parkanlegg ved **Trondheimsveien 319**. Det finnes ingen manifestfil med «linderud» i filstien (kontroll av `data/places/manifest.json` på `main`). Adressen bekreftes både av Oslo byleksikon og driftsinstitusjonen MiA. Pin skal senere knyttes til dokumentert offentlig tilgjengelig del av gårdsanlegget, ikke en vilkårlig privat bygning.
- **Kildebelagte historiske grep:** Gården var kirkegods i middelalderen. Fra 1679 vokste den fram som sentrum for en omfattende godssamling under Mogens Lauritssøn. Hovedbygningen stammer fra begynnelsen av 1700-tallet; Oslo byleksikon oppgir **1714**, mens MiAs tilgjengelighetsinformasjon bruker **1713** om bygget. Verifiser årstall mot bygningshistorisk museumsdokumentasjon før detaljquiz. Godset hadde mange husmannsplasser (11 oppgitt for 1854). Under okkupasjonen ble uthusene rekvirert; etter krigen ble mye av jordveien utparsellert. Hovedbygning og hage er bevart.
- **Fortellergrep (utkast, ikke canonical tekst):** Fra et gods som samlet hundrevis av gårder, sagbruk og skogeiendommer, står Linderud tilbake med hovedhus, gamle alleer og terrasserte hager. De synlige sporene forteller både om rikdom og om arbeidslivet til folkene som drev godset. Det som forsvant med etterkrigstidens utparsellering, gjør de bevarte delene særlig viktige.
- **Tema til quiz/Fagverk:** kirkegods; godsutvikling fra 1679; forskjellen mellom gården og godssamlingen; husmannsplasser; hovedbygningens alder med kildeforbehold; den terrasserte hagen; gamle alleer; bruk under okkupasjonen; utparsellering på 1950-tallet; bevaring/fredning i 1960. Dette er **10 tema**, ikke ferdige godkjente spørsmål.
- **Stedlig kontroll:** MiA oppgir hagen som gratis og åpen hele året, mens innvendig besøk i hovedbygningen krever omvisning. Behold pin på tilgjengelig uteområde. Fotoidé: offentlig synlig hovedfasade + hageanlegg, med tre separate utsnitt; fotograf, originallisens og bruksrett er **ikke avklart**.
- **Kilder:** [Oslo byleksikon: Linderud gård](https://oslobyleksikon.no/side/Linderud_g%C3%A5rd), [MiA: Hagen](https://mia.no/linderud/hagen), [MiA: Åpningstider](https://mia.no/linderud/apningstider), [MiA: Tilgjengelighet](https://mia.no/linderud/om/tilgjengelighet).
- **Nivå:** kildepakke for historisk fortelling **utført**; eksakt GPS, kildeårstall, rettighetsklarerte bilder, READ-FIRST, Badge/source-review, fullquiz, Fagverk, app-QA **gjenstår**.

### R2 – Ekebergrestauranten, foreslått ID `ekebergrestauranten`

- **Egen fysisk identitet:** Restaurantbygningen **Kongsveien 15**, avgrenset fra eksisterende `ekebergparken` (kunstparken) og `ekebergparken_museum` (Lunds hus i **Kongsveien 23**). De to eksisterende Place-filene ble lest fra `main`: de dekker andre bygninger/anlegg. Pin skal dokumentere restauranten, helst offentlig utepunkt ved bygningen.
- **Kildebelagte historiske grep:** Første restaurant på stedet ble reist i 1916 av en paviljong fra Jubileumsutstillingen 1914. Lars Backers nye funksjonalistiske bygning sto ferdig i **1929**. Under andre verdenskrig brukte tyske styrker stedet som kommandopost og offiserskvarter. Et ras ned i en tunnel under bygningen rammet lokalene i **1953**. Den ble fredet i **2001**, sto lenge tom etter nedlagt drift i **1997**, og gjenåpnet etter restaurering i **2005**.
- **Fortellergrep (utkast):** Et sted bygget for utsikt og selskapsliv ble både et tidlig ikon for funksjonalismen og et militært punkt under okkupasjonen. Etter krigen ble bygningen preget av ombygging, grunnproblemer og forfall før den ble tatt vare på og åpnet igjen. Fasaden forteller derfor også om hva Oslo valgte å bevare.
- **Tema til quiz/Fagverk:** Jubileumsutstillingen 1914; første restaurant 1916; Lars Backer; funksjonalisme; bygget 1927–29; Schous-bryggeriets lånevilkår; okkupasjonsbruk; tunnelraset 1953; fredning i 2001; gjenåpning i 2005. **10 tema, ikke validerte spørsmål.**
- **Stedlig kontroll:** Adresse bekreftet i Oslo byleksikon, SNL og gårdeiers oversikt. Fotoidé: karakteristiske vindusflater og buet inngang, ikke kun utsikten fra terrassen. SNL viser et eldre bilde merket «falt i det fri», men original, fotograf, rettighet og historisk/midlertidig bildetekst må kontrolleres før import; **ingen bildefil er tatt inn**.
- **Kilder:** [Oslo byleksikon: Ekebergrestauranten](https://oslobyleksikon.no/side/Ekebergrestauranten), [SNL: Ekebergrestauranten](https://snl.no/Ekebergrestauranten), [Arkitektur N](https://old.arkitektur-n.no/prosjekter/ekebergrestauranten), [Eiendomsspar: Kongsveien 15](https://eiendomsspar.no/eiendommer/kongsveien-ekebergrestauranten/).
- **Nivå:** historisk kildepakke og identitetsavgrensning **utført**; nøyaktig GPS, bilderettigheter, READ-FIRST, Badge/source-review, fullquiz, Fagverk, app-QA **gjenstår**.

### R3 – Kristiania Teglverk, foreslått ID `kristiania_teglverk_bryn`

- **Viktig ny adressekonflikt – HOLD:** Oslo byleksikon bruker **Nils Hansens vei 14**, mens [Teglverk.no](https://teglverk.no/kristiania-teglverk/), [lokalhistoriewikiens adresseliste](https://lokalhistoriewiki.no/Nils_Hansens_vei_%28Oslo%29) og [oversikten over Oslos teglverk](https://lokalhistoriewiki.no/wiki/Teglverk_i_Oslo_kommune) viser **Nils Hansens vei 18** for Kristiania Teglverk og **14** for Den Norske Zinkhvidt-Fabrik. En [kommunal kulturminneutredning](https://ellipsen.no/wp-content/uploads/2017/02/strategisk-plan-hovinbyen-vedlegg-3-kulturminnegrunnlag.pdf) omtaler **14 og 18 samlet**. **Ingen endelig pin eller 14/18-adresse skal publiseres** før matrikkel/bygningskart/Byantikvaren bekrefter eksakt bygning og trygg, offentlig synlig posisjon. Ikke la den tidligere candidate-tabellens «14» bli tolket som endelig.
- **Egen fysisk identitet med overlapp:** Eksisterende canonical `bryn_industriomrade` nevner allerede Kristiania Teglverk og den bevarte industribygningen. En separat Place må gi en **stedsspesifikk opplevelse av selve teglverket og ringovnen**, ikke kopiere områdestedet. Må holdes adskilt fra **Bryn Teglverk**, grunnlagt 1873 ved tidligere Tvetenveien 54, hvis bygning er revet.
- **Kildebelagte historiske grep:** Kristiania Teglverk ble grunnlagt **1897**; driften stanset etter byggekrakket **1898** og kom i gang igjen **1912**. En større brann i **1936** førte til gjenoppbygging og modernisering. Fabrikken produserte blant annet murstein, takstein og drensrør, før driften stanset i 1960-årene. Kildene beskriver at deler av bygningen og ringovnen er bevart. Kildeopplysninger om eierforhold må kryssjekkes før quiz.
- **Fortellergrep (utkast):** Teglverket forteller om hvordan byvekst gjorde leire til byggevarer, og hvordan den samme industrien ble sårbar for konjunkturbrudd. Produksjonen ble stanset av byggekrakket rett etter oppstart og endret etter en brann. En bevart ringovn er et håndfast spor etter både arbeid og teknikk; men publikum må ikke loves adgang inne i bygningen.
- **Tema til quiz/Fagverk:** etableringen 1897; byggekrakket 1898; restart 1912; tegl og byvekst; ringovnens funksjon; teglproduktmangfold; brannen 1936; modernisering etter brannen; nedleggelse i 1960-årene; forskjellen mellom Kristiania og Bryn Teglverk. **10 tema, ikke validerte spørsmål.**
- **Foto/tilgang:** Den kjente arkivfotografien som er merket *Bryn Teglverk* må **ikke brukes som identitetsbevis/forsidefoto for Kristiania Teglverk**. Finn lovlig, navne- og bygningsidentifisert motiv av riktig anlegg og moderne fasade fra offentlig sted. Foto hos Teglverk.no kan ikke gjenbrukes uten lisenskontroll. Verken privat areal eller adgang til ovnens interiør er avklart.
- **Kilder:** [Oslo byleksikon: Kristiania Teglverk](https://oslobyleksikon.no/side/Kristiania_Teglverk), [Oslo byleksikon: Bryn Teglverk](https://oslobyleksikon.no/side/Bryn_Teglverk), [Teglverk.no](https://teglverk.no/kristiania-teglverk/), [Østensjø historielag](https://www.ostensjo-hist.no/rundt_vannet/RV-artikler-pdf/rv4_a2.html), [lokalhistoriewiki: Nils Hansens vei](https://lokalhistoriewiki.no/Nils_Hansens_vei_%28Oslo%29), [kommunal kulturminneutredning](https://ellipsen.no/wp-content/uploads/2017/02/strategisk-plan-hovinbyen-vedlegg-3-kulturminnegrunnlag.pdf).
- **Nivå:** kildepakke **utført med adressesperre**; bygningsidentitet/pin, bilde, rettigheter, READ-FIRST, Badge/source-review, fullquiz, Fagverk og app-QA **gjenstår**.

### Kontroll mot eksisterende Place-eiere

Ved lesning på `main` ble disse faktiske filene brukt til semantisk sammenligning (manifeststiene er relative til `data/`):
- `data/places/kunst/oslo/places_kunst/ekebergparken.json` – park og skulpturer, **ikke** selve restauranten.
- `data/places/historie/oslo/places_historie/ekebergparken_museum.json` – museum i Lunds hus, **ikke** restauranten.
- `data/places/naeringsliv/oslo/places_naeringsliv/bryn_industriomrade.json` – **inneholder allerede opplysninger om Kristiania Teglverk**, så eget sted krever distinkt fysisk anker og egen faglig læringsoppgave.
- `data/places/by/oslo/places/nydalen.json` – omtaler allerede Christiania Spiger- og Valseværk i områdets historie; samme prinsipielle avgrensning må gjelde ved eventuell ny fabrikk-Place.

**Tidligere foreslått produksjonsrekkefølge (erstattet av beslutningen nedenfor):** Linderud gård → Ekebergrestauranten → Kristiania Teglverk **etter adressesperre**. Ingen canonical file, status, quiz, bilde eller kategori er endret. Før en eneste canonical Place-write: les alle ni READ-FIRST-filer på aktuell produksjonsgren, fastsett hovedbadge → underbadges → source review → confirmed profil → endelig innholdsplan, og registrer `rule_preflight`. Lag deretter minst én felles isolert produksjons-PR for nye steder i separat neste Oslo-bolk. Oslo-bolk 04 er aldri del av dette sporet.

## Beslutning – avgrenset felles femstedsbolk (22.10.2026)

**Aktivt utvalg, i denne rekkefølgen:**

1. **Linderud gård** (`linderud_gard`) – gjenbruk og fullfør kilde-/claim-arbeidet i PR #6567 uten å duplisere eller overskrive det. Avklar 1713/1714 før spørsmål om eksakt byggeår; forankre offentlig utepunkt, foto og tilgjengelighet.
2. **Ekebergrestauranten** (`ekebergrestauranten`) – avgrens restaurantbygningen fra Ekebergparken/museet; kontroller bygningshistorie, fotoidentitet og lovlig utsnitt.
3. **Frognerseteren** (`frognerseteren`) – egen restaurantbygning som stedsanker; skill den fra Frognerseteren stasjon, Heftyevillaen og det videre utfartsområdet. Kontroller adresse/offentlig pin.
4. **Sarabråten** (`sarabraten`) – det historiske sommerstedets dokumenterte ruiner/spor, ikke et generelt Nøklevann-punkt. Fastsett kartanker og offentlig tilgjengelig sti uten å antyde at bygningene står.
5. **Sæterhytten** (`saeterhytten_bygdoy`) – særskilt bygning/kulturminne på Dronningberget, ikke Bygdøy samlet; verifiser eksakt adresse, stedsanker og visningsrett.

**Eksplisitt HOLD utenfor femstedsbolken:** Kristiania Teglverk (`kristiania_teglverk_bryn`). Avvik mellom Nils Hansens vei 14 og 18 samt sammenblanding av teglverk, zinkhvidtfabrikk, bevarte bygninger og ringovn må avklares mot eiendoms-/bygningsregister og kulturminnekilder før ny pin, bilde eller canonical Place. Ikke erstatt med gjetning eller trekk inn Bryn Teglverk.

**Felles leveransekriterier for hvert av de fem stedene:** semantisk dublettsøk i manifest og nabosteder; obligatorisk READ-FIRST etter AGENTS.md på produksjonsgren; Badge/routing og dokumentert source review; bekreftet profil og `rule_preflight` per sted; kildebelagt `desc`/`popupDesc` med faktiske mennesker, hendelser og stedlige spor; gjennomgått fullquiz etter canonical profil, ti kontrollerte QuizCard-spørsmål, egen Fagverk-side, korrekt og rettighetsklart bilde, og faktisk mobil-/desktopvisning. Samle produksjonen i én felles implementasjonsbolk/PR og kjør endringsrelevante tester samlet. Ingen v1-, complete- eller mergepåstand uten evidens.

**Avgrensning:** De øvrige kandidatene i tabellen er kun senere forskningskø, ikke del av denne produksjonen. Oslo-bolk 04 og PR #6567 skal ikke få parallelle eller motstridende canonical endringer. Denne beslutningen er kun en endring i forsknings-/scope-dokumentet, ikke levert stedskode eller app-QA.

## Beslutning 2 – seks steder, Kristiania Teglverk inkludert (22.10.2026)

Den forrige femstedsavgrensningen **erstattes**: Samlet produksjonsutvalg er nå **Linderud gård, Ekebergrestauranten, Frognerseteren, Sarabråten, Sæterhytten og Kristiania Teglverk**. De øvrige kandidatene forblir i researchkø. Linderuds eksisterende Stage A-arbeid i PR #6567 skal gjenbrukes, og Oslo-bolk 04 er fortsatt utenfor scope.

### Kristiania Teglverk – ny evidens for fysisk adresse

- **Nils Hansens vei 18 er beste dokumenterte adresse for selve teglverket.** Teglverk.no (2025), Lokalhistoriewikis adresseoversikt og teglverksoversikt plasserer eksplisitt teglverket på nummer 18. Adresseoversikten knytter derimot **nummer 14 til Den Norske Zinkhvidt-Fabrik**. En sekundær eiendomsoversikt viser dessuten en byggesak på nummer 18 med saksbeskrivelsen «Tidligere Kristiania Teglverk» (må verifiseres mot kommunens originale byggesaksregister). Oslo byleksikon oppgir fortsatt 14, og avviket skal beholdes i kilde-/claimregisteret, ikke skjules.
- **Bygningsidentitet:** Bevarte teglverksbygninger med ringovn ved Alna nord for elven, ikke tidligere Bryn Teglverk (revet) eller zinkhvidtfabrikken. Kilder beskriver nordøstre teglgavl, bindingsverk og ringovn på grunnplanet. Dette er særskilt faglig stoff utover områdestedet `bryn_industriomrade`.
- **Historisk substans:** anlagt 1897, produksjonsstans etter byggekrakket 1898, gjenstart 1912, brann og gjenoppbygging 1936, nedleggelse sent i 1960-årene; arbeid med murstein, takstein og drensrør. Fortellingen skal handle om tegl, byggeboom, teknisk varmegjenvinning i ringovnen, arbeidsliv og hvorfor bevart industriarkitektur betyr noe.
- **Kilder kontrollert for dette beslutningsnotatet:** https://teglverk.no/kristiania-teglverk/ ; https://lokalhistoriewiki.no/Nils_Hansens_vei_%28Oslo%29 ; https://lokalhistoriewiki.no/wiki/Teglverk_i_Oslo_kommune ; https://lokalhistoriewiki.no/wiki/Teglverk_i_Oslo ; https://oslobyleksikon.no/side/Kristiania_Teglverk ; https://listings.no/e/b97e6b552fd4 . Ingen av disse erstatter nødvendig original matrikkel-/byggesaksverifikasjon.
- **Resterende kart-/publiseringsport:** Kontroller matrikkel og faktisk offentlig, trygg utsideposisjon før koordinat eller gameplay-radius settes. Ikke lov offentlig inngang til privat ringovn. Velg foto som utvetydig viser riktig bygning, med lisens/kreditering og sjekket utsnitt. Ikke kopier bilder fra teglverk.no uten tillatelse/lisens.

**Status:** Teglverket er gjenåpnet som aktivt produksjonssted, men **ikke** erklært canonical v1 eller publiseringsklart. Seksstedsbolken krever READ-FIRST, individuelle rule-preflight-bevis, source/claim-review, korrekt fullquiz/QuizCard/Fagverk, medier og faktisk app-QA etter samme port som de fem øvrige stedene. Dette er en research-/scope-endring, ingen Place-runtimeendring.
