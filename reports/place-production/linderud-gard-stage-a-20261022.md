# Linderud gård – Stage A: kilde- og innholdsgrunnlag (22.10.2026)

> **Arbeidsstatus: innholdsutkast, IKKE publisert Place eller v1.** Dette er et separat, stedsspesifikt produksjonsspor for neste Oslo-bolk. Oslo-bolk 04, dens 17 steder og forsknings-PR #6563 skal ikke endres. Opprett ingen manifestpost eller spillerrettet status fra dette dokumentet alene.

## 1. Nullmåling og identitet

- Foreslått canonical ID: **linderud_gard**. Sted: Linderud gårds **bevarte hovedbygning og sammenhengende historiske hageanlegg**, Trondheimsveien 319, Oslo.
- Avgrensning: dagens museums-/hovedgårdsanlegg, **ikke** hele godsets tidligere 350 gårder, hele Linderud-strøket eller moderne butikksenter. Unngå å knytte enhver eldre godshendelse til selve dagens hovedbygning.
- Manifestkontroll mot main: 1547 filer, ingen filsti med «linderud» (22.10.2026). GitHub-kodesøk etter ordet ga ingen resultat. **Semantisk dublettsjekk av alle Place-navn, alias og nærliggende koordinater gjenstår.** Manglende navnetreff er ikke bevis på fravær.
- Adressen støttes av Oslo byleksikon og MiA. **Ingen GPS/pin, inngang eller besøksradius er godkjent.** Velg dokumentert offentlig tilgjengelig utepunkt og bekreft det geografisk før ny Place opprettes.
- Eksisterende desc/popupDesc for denne ID-en: **ingen kanonisk Place-fil identifisert i manifestet**. Ingen eldre tekst er erstattet.

## 2. READ-FIRST og kategorivurdering

Gjeldende main-versjoner er lest/undersøkt som første arbeidsgrunnlag i denne etappen: AGENTS.md; docs/PLACE_PRODUCTION_CHECKLIST.md; docs/PLACE_PRODUCTION_CHECKLIST_REFERENCE_V1.md; docs/PLACE_PRODUCTION_PROFILES.md; docs/PLACE_PRODUCTION_MINIMUM_V1.md; data/places/README_place_rounds.md; data/badges/index.json; data/badges/place_production_routing_v1.json; data/badges/historie.json; docs/PLACE_OBJECTS_CANONICAL.md; data/brands/brand_rules_v1_1.json; data/places/regler/PLACE_DESCRIPTION_CANONICAL.md; data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md.

- **Hovedbadge-forslag: historie**. Hovedfunksjonen er historisk gods-/gårdsmiljø med dokumenterte samfunns- og eierskapsendringer; byggestil er viktig, men ikke eneste eller primære faglige identitet.
- Underbadge-kandidater fra den canonicale Historie-badgen: **tidlig_modernetid**, **sosialhistorie**, **kulturminner_og_bevaring**, eventuelt **etterkrigstid**. Disse vurderes mot dokumenterte tidsspor; endelige underbadges låses først etter full source review.
- Historie-ruting: vurder People / Objects / Brands / historical_events. **Ingen samling eller samlingsmedlem er forhåndsgodkjent.** Mogens Lauritssøn og Erich Mogenssøn er mulige People-kandidater, men stedstilknytning, rettigheter til portrett og medlemsbilde må kontrolleres. Ingen tilfeldig gjenstand eller Brand skal brukes til å fylle samling.
- Historisk bygning og terrassert hage er **fysiske bestanddeler av stedet**; opprett ikke uten videre to ekstra Places eller en automatisk Structure-kolleksjon for en Historie-place.
- Profil/quiz/Fagverk: **ikke confirmed**. Tentativt standard fullprofil og minst micro/standard Fagverk vurderes først etter komplettert source review og historiefaglig case-/claimsspor. Det tekniske 1×10-v1-formatet regnes ikke som godkjent fullquiz.

**Regel-preflight:** CLI-bevis skal registreres ved faktisk produksjon av canonical Place: 
    node scripts/place-production-rule-preflight.mjs record --workcard reports/place-production/linderud-gard-workcard-current.json --place-id linderud_gard --category historie

Dette er **ikke kjørt** i denne connector-baserte etappen; ingen regelhash/PASS er fabrikert. Lag gyldig workcard i den faktiske repo-kjøringen og verifiser med samme skript **før fullproduksjon og confirmed profil**.

## 3. Avgrensede kilder og claim-register

Nedenstående er kildereferanser og eksplisitt kildevurdering, ikke import- eller fotolisens.

| Claim | Påstand og scope | Støtte | Kontrollstatus |
|---|---|---|---|
| LG-01 | Gården var kirkegods i middelalderen; gjelder gården, ikke nåværende bygning | Oslo byleksikon; MiA | Samstemmige offentlige kildeutdrag |
| LG-02 | Trelasthandler Mogens Lauritssøn kjøpte Linderud i 1679 | MiA «De skapte Linderud»; byleksikon | Samstemmige kildeutdrag |
| LG-03 | Sønnen Erich Mogenssøn fikk hovedbygningen reist tidlig på 1700-tallet | MiA; Oslo byleksikon | **Årstall uavklart: 1713 hos MiA, 1714 i byleksikon; ikke quiz eksakt byggeår** |
| LG-04 | Godssamlingen omfattet rundt 350 gårder og omfattende skog/sagbruk mot slutten av 1700-tallet | Oslo byleksikon; SNL | Samstemmige kildeutdrag; ikke framstill alle gårdene som del av dagens tomt |
| LG-05 | Hageanlegget har barokke elementer som lindehall og hasseltunneler | MiA «Mogenssøn og Mathiesen» | Museumsbeskrivelse; dokumenter endringer over tid |
| LG-06 | Rosehagen har gjennomgått omforminger på 1800- og 1900-tallet; dagens blomsterbed er ikke uendret fra 1713 | MiA «Utforsk det historiske hageanlegget» | Museumsbeskrivelse; dateringspresisjon kontrolleres i fulltekst |
| LG-07 | Linderud Stiftelse ble opprettet i 1954 av arvingene | Oslo byleksikon; SNL | Samstemmige kildeutdrag |
| LG-08 | Etterkrigstidens byutvikling endret tidligere jordbruksarealer til boligbebyggelse | Oslo kommune, «Oslos ukjente perler» | Kommunalt kildeutdrag; detaljer om arealomfang sjekkes |
| LG-09 | Hovedbygningen inneholder De Mathiesenske Samlinger | Oslo kommune, «Oslos ukjente perler» | Kommunalt kildeutdrag |
| LG-10 | Museene i Akershus driver museumsformidling på Linderud | MiA «Om Linderud gård» | Dagens driftsopplysning; datér ved publisering |
| LG-11 | Godsets hovedsete har vært Eidsvold Værk fra 1894 | Oslo byleksikon; SNL | Samstemmige kildeutdrag; skill fra dagens Linderud-anlegg |

Kilder:
- Oslo byleksikon: https://oslobyleksikon.no/side/Linderud_g%C3%A5rd
- MiA gårdshistorie: https://mia.no/linderud/linderud-gards-historie
- MiA Mogenssøn og Mathiesen: https://mia.no/linderud/mogensson-og-mathiesen
- MiA hage: https://mia.no/linderud/utforsk-det-historiske-hageanlegget
- MiA om anlegget: https://mia.no/linderud/om
- Oslo kommune: https://magasin.oslo.kommune.no/byplan/oslos-ukjente-perler
- SNL: https://snl.no/Linderud

**Kildebegrensning:** Flere museums-URL-er lot seg verifisere gjennom søkemotorens tekstutdrag, men direkte gjenåpning ga 403 i denne kjøringen. Merk derfor ikke full lesing eller endelig kilde-til-setning-review som PASS. Hent originalt publikumsinnhold og avklar claim-koblinger før canonical publisering. Det er ikke brukt uautoriserte bilder.

## 4. Brukerrettet tekst – redaksjonelt utkast, IKKE canonical

**Foreslått desc:**

Bak trærne ved Trondheimsveien ligger Linderud gård, et bevart hovedhus og hageanlegg fra tiden da slektens trelasthandel og jordegods gjorde stedet til sentrum for store eiendommer. Mens jordene rundt ble bygget ned etter krigen, ble huset og hagen tatt vare på.

**Foreslått popupDesc:**

Linderud begynte ikke som en herskapelig lystgård. I middelalderen var dette kirkegods. Da trelasthandler Mogens Lauritssøn kjøpte gården i 1679, ble den utgangspunktet for en mye større eiendomssamling. Mot slutten av 1700-tallet omfattet godset hundrevis av gårder, i tillegg til skog og sagbruk. Det er en annen målestokk enn det bevarte anlegget dagens besøkende møter.

Sønnen Erich Mogenssøn lot reise hovedbygningen tidlig på 1700-tallet. Ved huset ble det anlagt en formell hage med lange trelinjer, vann og gangveier. Hagen må likevel leses som et sted i forandring: Den fikk nye former i senere århundrer, og dagens rosebed er ikke en urørt kopi av hele den første barokkhagen.

Her ligger også en sosial historie. Godset var ikke bare eiernes bolig og hage, men en organisering av arbeid, jord og ressurser. De mange gårdene og husmannsplassene peker mot mennesker som drev jordbruket og det økonomiske livet, men som ikke etterlot like synlige spor som hovedhuset.

Etter andre verdenskrig ble store deler av det tidligere jordbrukslandskapet tatt i bruk til boligbygging. Linderud Stiftelse, opprettet i 1954, fikk en viktig rolle i bevaringen av hovedbygningen og parken. Dagens museumsanlegg lar oss derfor se både hva storgodset en gang var, og hvor mye av landskapet som har endret seg rundt det.

**Redaksjonell sperre:** Disse formuleringene må gjennom setning–claim-paritet, selvstendig faktareview og redaksjonell review; «Linderud ble sentrum» må knyttes tydelig til godssamlingen, ikke bygningen. Ikke publiser før kildekontroll.

## 5. Ti QuizCard-kandidater – konkrete spørsmål, ikke validert fullquiz

Svaralternativer er foreløpige; endelig fasitindeks beregnes fra riktig alternativ, og appens shuffle skal beholdes.

| Nr. | Spørsmål | Alternativer (A–D) | Fasit | Claim |
|---|---|---|---|---|
| 1 | Hvilken type eiendom var Linderud i middelalderen? | A Kirkegods; B Kommunal park; C Jernverksgrunn; D Handelsstasjon | A | LG-01 |
| 2 | Hvem kjøpte Linderud i 1679? | A Haagen Mathiesen; B Erich Mogenssøn; C Mogens Lauritssøn; D Jess Carlsen | C | LG-02 |
| 3 | Hvilken næring var Mogens Lauritssøn særlig knyttet til? | A Steinbrudd; B Trelasthandel; C Fiskeri; D Skipsbygging | B | LG-02 |
| 4 | Hvem fikk reist Linderuds hovedbygning tidlig på 1700-tallet? | A Peder Griffenfeld; B Christian Pierre Mathiesen; C Haagen Mathiesen; D Erich Mogenssøn | D | LG-03 |
| 5 | Hvor stor var godssamlingen omtrent mot slutten av 1700-tallet? | A Rundt 35 gårder; B Rundt 350 gårder; C Rundt 3 500 gårder; D Bare hovedgården | B | LG-04 |
| 6 | Hvilket av disse hageelementene regnes som bevart fra barokkanlegget? | A Nyere rosebed med buksbom; B Den lange lindehallen; C En romantisk trapp fra 1900-tallet; D Slyngende grusganger fra 1800-tallet | B | LG-05, LG-06 |
| 7 | Hva er riktig om dagens rosehage? | A Den er aldri endret; B Den ble først anlagt i 2007; C Den ble bygd som parkeringsplass; D Den har blitt omformet i flere perioder | D | LG-06 |
| 8 | Hvor har godsets hovedsete ligget siden 1894? | A Bogstad gård; B Bærums Verk; C Eidsvold Værk; D Nordre Skøyen hovedgård | C | LG-11 |
| 9 | Hva skjedde med mye av det tidligere jordbrukslandet etter krigen? | A Det ble havneanlegg; B Det ble boligbebyggelse; C Det ble flyplass; D Det ble sjø | B | LG-08 |
| 10 | Hvilket år ble Linderud Stiftelse opprettet? | A 1894; B 1940; C 1954; D 2007 | C | LG-07 |

**Quiz-revisjon:** Spørsmålene er ennå ikke validerte mot fullquizkontrakten, og distraktorer, kildekoblinger og fasitforklaringer trenger faglig kvalitetssikring. Fasit og begrunnelser skal skrives kilde for kilde og kontrolleres mot fullquizstandard før import. Dette er **ikke** en godkjent QuizCard eller et fullquizsett. Den ordinære quizkontrakten krever minimum 3×7 for narrow og 4×7 for normal, med særskilt kilde-/Knowledge-/manifestkobling.

## 6. Fagverk-idé – unik læringsjobb, ikke schema-validert blokk

**Arbeidstittel:** Fra storgods til bylandskap – Linderud gjennom tre hundre år.

Kjerne: Skill mellom Linderud som gård, hovedbygning, godsøkonomi og nåværende museum. Undersøk hvordan trelastformuen, eiernes politiske posisjon og arbeidsfordelingen ved husmannsplasser henger sammen med sporene som faktisk er bevart. Sammenlign 1700-tallets landskap med etterkrigstidens utbygging uten å anta at alt vi ser i dagens hage er fra samme tid.

Tre undersøkelsesspørsmål:
1. Hvilke kilder forteller om eiernes makt, og hvilke trengs for å forstå husmennenes arbeids- og levevilkår?
2. Hvordan kan en hage være både et levn fra barokktiden og et resultat av senere restaurering?
3. Hva går tapt når et stort jordbrukslandskap blir boligområde, og hvilke historiske spor står igjen?

Dette må senere materialiseres som Place-eid, kildebasert Fagverk etter gjeldende schema med aktiv registry, runtime og app-QA – ikke som generisk fallback.

## 7. Eksplisitt arbeidskø før første canonical Place

1. **Semantisk dublettkontroll:** gjennomgå navne-/aliasfelter og stedspunkter rundt Trondheimsveien 319, samt mulige eksisterende Linderud-områdeposter.
2. **Kilde- og regelport:** åpne originalpublikasjonene på nytt; avklar byggeår, underbadges, minst 10 skarpe claims, eventuelle Historie-casekrav; kjør den faktiske CLI-preflighten i repoet og sjekk SHA-ferskhet.
3. **Stedsanker og bilder:** verifiser offentlig pin/koordinat; lisensier konkret motiv og gjør tre separate WebP-utsnitt (image, frontImage, cardImage); ikke bruk katalogfoto uten rettigheter.
4. **Canonical integrasjon:** opprett én Place-fil med historisk tekst, kilder, source review og Fagverk; lag gyldig fullquiz og QuizCard/Knowledge-kobling. Hold status under produksjon til alt er validert.
5. **Kvalitetsgate:** målrettede schema-/manifest-/quiz-/Fagverk-/image-tester, faktisk mobil- og desktop-visning og seksdelt kvalitetsvurdering. Ingen v1/vFerdig, merge eller ferdigmelding før dokumenterte porter.

**Scope-kontroll:** Denne filen er eneste foreslåtte endring i denne Stage A-grenen. Ingen fil i Oslo-bolk 04, eksisterende Place, produksjonsstatus eller forsknings-PR #6563 skal endres.

## 8. Ettersjekk 22.10.2026 – katalogdublett, stedspunkt og fotorettigheter (Stage B-undersøkelse)

> **Status:** Det er gjennomført skrivebordsbasert katalog-, kartkilde- og lisenssjekk. Dette er IKKE gjennomført regel-preflight, stedskontroll, bildeimport, fullquiz, Fagverk-integrasjon, browser-QA eller v1. Ingen canonical Place eller releasefiler endres av dette notatet.

### 8A. Dokumentert dublett-/nærhetskontroll

- Faktisk lest `data/places/manifest.json` (**1547** filbaner) og `data/places/places_index.json` (**1534** indekserte Places med kildefil). Sammenligning på `sourceFile` gir **13** manifestfiler som ikke forekommer i indeksen.
- Kontroll av `id`, `name` og `aliases` i alle 1534 indekserte Places gav **null** kandidater med navnet «Linderud»; ett tilfeldig teksttreff på ordet i Aftenpostens `desc` gjelder en senere trykkeriadresse og er **ikke** et sted med identiteten Linderud gård.
- Alle 13 uindekserte manifestfiler ble åpnet og kontrollert for `id`, `name`, koordinater og omtale av «Linderud». De fordeler seg på én Alnaelva-hovedsteder-fil, tre andre naturfiler og ni subkulturfiler; ingen er Linderud gård. Dermed er **1547/1547** katalogførte filbaner dekket av navne-/stedsidentitetskontroll, uten dokumentert direkte dublett.
- Avstandsmåling fra foreløpig anleggspunkt **59.94194, 10.83380** til indekserte koordinater (haversine; luftlinje): **ingen innen 500 m**; nærmeste indekserte sted er `alnabru_jernbane_og_logistikk` («Alnabru godsterminal»), ca. **960 m** unna, radius 350 m. De 13 unntaksfilenes posisjoner gir heller ingen kollisjon; Alnaelva-hovedsteder er ca. 1,05 km unna. Avstand er ikke bevis for samme sted, men her samsvarer navn, kategori og geografisk atskillelse.
- Avgrensning: dette er katalogkontroll mot den lesbare manifest-/indeksversjonen av `main` 22.10.2026, ikke bevis for at ingen framtidige PR-er, uindekserte eksterne databaser eller ugyldige historiske alias kan overlappe. Revider dublettkontrollen rett før canonical fil skrives.

### 8B. Kildesamsvar for stedsanker; ingen spillerpin godkjent

- **Adresse:** Trondheimsveien 319, 0593 Oslo. Samstemmig Oslo kommune, Oslo byleksikon og MiA.
- **Forslag til foreløpig anleggspunkt:** `lat: 59.94194`, `lon: 10.83380`, fra Lokalhistoriewiki-siden *Linderud (gård i Oslo)*: https://lokalhistoriewiki.no/index.php/Linderud_(g%C3%A5rd_i_Oslo).
- Uavhengige, omtrentlige anleggssentre: Mapcarta/GeoNames gård **59.94188, 10.83366** (https://mapcarta.com/31336468); OSM-avledet museumsbygning **59.94189, 10.83378** (https://mapcarta.com/W80871207). Samstemmer i størrelsesorden titalls meter, men ingen er dokumentasjon på trygg/åpen inngangsplassering.
- MiA bekrefter at den historiske **hagen er åpen hele året**, og omtaler grusvei gjennom alleen, på gårdsplassen og gjennom hasseltunnelen/lindehallen. Kilder: https://mia.no/linderud/hagen og https://mia.no/linderud/om/tilgjengelighet. Det er likevel ikke koordinatfestet hvilken gangveiposisjon som er best for spill og ferdsel.
- **Koordinatbeslutning:** godkjent *geografisk identitet / foreløpig anleggspunkt*, **ikke** endelig `coordRole`, `r`, offentlig inngang eller gameplay-pin. Velg kontrollerbart offentlig utepunkt og test avstand/radius før registrering.

### 8C. Lisensverifisert primærkandidat for stedsfoto (ikke importert)

- Anbefalt motiv for første produksjonsforsøk: **«Linderud gård hovedbygning2.JPG»**, hovedbygningen sett fra sør med hagen foran, foto **Helge Høifødt**, tatt 25.07.2008, original **3872×2592**. Originalfilens Commons-side dokumenterer fotografens eget arbeid og **CC BY-SA 3.0**: https://commons.wikimedia.org/wiki/File:Linderud_g%C3%A5rd_hovedbygning2.JPG.
- Mulig alternativ med innkjørsel: **«Linderud gård hovedbygning1.JPG»**, Helge Høifødt, 25.07.2008, **CC BY-SA 3.0**, https://commons.wikimedia.org/wiki/File:Linderud_g%C3%A5rd_hovedbygning1.JPG. Alternativet fra vest, **hovedbygning3.JPG**, har tilsvarende opphavs- og lisensmetadata, men bildeutsnitt må vurderes visuelt for dagens PlaceCard: https://commons.wikimedia.org/wiki/File:Linderud_g%C3%A5rd_hovedbygning3.JPG.
- **Påkrevd kreditering:** «Foto: Helge Høifødt / Wikimedia Commons, CC BY-SA 3.0», lenke til filside og lisens https://creativecommons.org/licenses/by-sa/3.0/; beskriv bearbeiding (beskjæring/WebP). Bearbeidede versjoner må distribueres på vilkår som er forenlige med ShareAlike.
- **Bildestatus:** kun kandidat, metadata og lisens gjennomgått. Ingen binærfiler lastet inn i repo; ingen tre separate WebP-utgaver, ingen `image/frontImage/cardImage`, ingen mobil-/desktop-QA. Ikke bruk museumsnettstedets bildeserver som om deres foto automatisk er frie.

### 8D. Faktakontroll: byggeår og hageanlegg

- MiAs informasjonsside og tilgjengelighetside bruker **1713**: https://mia.no/linderud/om og https://mia.no/linderud/om/tilgjengelighet.
- Oslo byleksikon bruker **1714**: https://oslobyleksikon.no/side/Linderud_g%C3%A5rd. SNL beskriver oppføring «omkring 1713»: https://snl.no/Linderud.
- Hold formuleringen **«tidlig på 1700-tallet»** og ingen quiz om eksakt år inntil kildekonflikten er avklart.
- MiA bekrefter at hagen blander trekk fra **renessanse, barokk, engelsk landskapsstil og funksjonalisme**, og har blant annet terrasser, speilkanal, hasseltunnel og en 180 meter lang lindehall (https://mia.no/linderud/hagen). Fagverk og quiz bør skille bevarte elementer, senere omforminger og restaurering tydelig.

**Neste reelle produksjonsport:** løp gjeldende READ-FIRST og `node scripts/place-production-rule-preflight.mjs record ...` i sjekket ut repo; dokumenter kommandoresultat. Deretter velges offentlig utepunkt, originalbilder hentes og tre WebP-varianter lages, før canonical Place, 3×7 eller 4×7 fullquiz, identisk QuizCard-10 og Fagverk opprettes i samme stedsbolk. `v1_candidate` eller `v1` skal ikke settes fra denne rapporten.


## 9. Stage C – nye kildebekreftede historiespor og korrigert fortelling (22.10.2026)

> **Status:** Indekserte sidetekster og kildesammendrag fra Oslo byleksikon og MiAs hagesider ble kontrollert 22.10.2026; direkte åpning av originalsidene ga 403/timeout, så fulltekstreview er ikke godkjent. En strukturert kilde-/påstandsbank med 35 konkrete claims fra seks kildereferanser er nå skrevet til `data/quiz/production_briefs/historie/linderud_gard.json` på samme PR-gren. Filen er **ikke registrert som aktivt quizmål**. Ingen quiz, Place, fotobinarier, Fagverk-registry, workcard-PASS eller app-QA er produsert. Denne seksjonen erstatter ikke pliktig preflight.

### 9A. Nye presise historiske belegg

- **Eierskap og penger (LG-C01–C09):** Oslo byleksikon bekrefter kronens overdragelse til Peder Griffenfeld i 1673 og overgangen til Mogens Lauritssøn fra 1679. MiA presiserer at Mogens betalte **300 riksdaler**, at bruket da var forholdsvis lite og drevet av en forpakter, og at hans sønn Erich kjøpte det fra faren i **1713**. Dette er en *kjøpsdato* og må ikke brukes som endelig byggeår. Kilder: [Oslo byleksikon](https://oslobyleksikon.no/side/Linderud_%28g%C3%A5rd%29); [MiA – De skapte Linderud](https://mia.no/linderud/mogensson-og-mathiesen).
- **Arkitektur (LG-C10–C12, C20–C21):** Hovedbygningen var opprinnelig i utmurt bindingsverk med flerfarget eksteriør; MiA beskriver blyinnfattede vinduer. Oslo byleksikon oppgir østforlengelse i **1809** og paneling/takomlegging i **1840-årene**. Det vi ser i dag er dermed ikke et uforandret 1710-tallshus. Kilder: samme to publikasjoner.
- **Hagehistorie (LG-C13–C19):** MiA beskriver barokkens lindehall, hasseltunneler, vann og hageakse. Terrassehagen fikk landskapspreg på 1800-tallet; nåværende form er sterkt preget av **restaureringen på 1950-tallet**, mens regelmessige buksbomkantede rosebed er nyere. Speilkanalen oppgis til 70 meter. Kilder: [MiA – Hagen](https://mia.no/linderud/hagen) og [MiA – Utforsk hagen](https://mia.no/linderud/utforsk-det-historiske-hageanlegget).
- **Arbeid og makt (LG-C22–C27):** Godssamlingen omfattet omkring **350 gårder** mot slutten av 1700-tallet og var knyttet til sagbruk og skog. Oslo byleksikon navngir i **1771** fire husmannsplasser (Smedplassen, to Linderudplasser og Bonebechen), mens **1854** hadde 11 plasser. Dette kan gi særskilt sosialhistorie uten å oppfinne biografier om navnløse husmenn. Kilde: Oslo byleksikon.
- **Okkupasjon og etterkrig (LG-C28–C34):** Ifølge Oslo byleksikon ble **store deler av gårdsanlegget**, men **ikke våningshuset**, rekvirert under okkupasjonen. Soldater var innkvartert i uthusene, og et jorde ved Trondheimsveien ble brukt som feltflyplass. Etter frigjøringen var Milorg-mannskaper forlagt på gården. På 1950-tallet ble store deler av jordveien utparsellert, uthus revet og hovedbygning/parkanlegg bevart. Arvingene opprettet Linderud Stiftelse i **1954**.

### 9B. Tydelige, uløste kildeforskjeller

1. **Byggeåret:** Oslo byleksikon: 1714. MiAs tilgjengelighetsside: 1713. MiAs eierhistorie oppgir 1713 som året da Erich kjøpte gården av faren, ikke som et entydig ferdigår. Spilltekst: **«tidlig på 1700-tallet»**. Ingen quiz om 1713/1714 som byggeår.
2. **Lindehallens lengde:** MiAs [hageoversikt](https://mia.no/linderud/hagen) oppgir **180 meter**, men MiAs [eierhistorie](https://mia.no/linderud/mogensson-og-mathiesen) omtaler **200 meter** ved anleggelsen. Det kan gjelde ulike tidspunkt eller avrunding. Ingen ubetinget lengdeclaim før detaljkontroll.
3. **Hva er bevart:** At barokkhagens hovedstruktur er bevart betyr **ikke** at terrasser, rosebed og beplantning er uendret. Ikke la eldre quizkandidat nr. 6 bli lest som at hele dagens lindehall og blomsterprakt er originale og urørte.
4. **Stedets grense:** Et gods med 350 gårder og et jorde brukt som feltflyplass er **ikke** det samme som dagens parkareal. Ved geografiske spørsmålsformuleringer må man skille historisk eierskap, utmark/jorder og dagens besøkbare anlegg.

### 9C. Revidert fortelling til redaksjonell og source→claim-review – ikke publisert

**Revidert `desc`:**

Da trelasthandler Mogens Lauritssøn kjøpte Linderud i 1679, var det ennå et lite gårdsbruk. Sønnen Erich lot reise et herskapelig hus med barokkhage, mens familien bygde opp et stort gods. Huset og parken står igjen etter at mye av jordbrukslandskapet ble bygget ned på 1900-tallet.

**Revidert `popupDesc`:**

Linderud var kirkegods lenge før stedet fikk sitt herskapelige hovedhus. I 1679 kjøpte trelasthandleren Mogens Lauritssøn et forholdsvis lite gårdsbruk som ble drevet av en forpakter. Da sønnen Erich overtok i 1713, begynte han å forme en lystgård. Hovedbygningen som ble reist tidlig på 1700-tallet, hadde en gang et langt mer fargerikt ytre enn den hvite fasaden vi møter i dag. Senere ble huset både forlenget og ombygd.

Bak den store hagen lå også et stort arbeids- og eiendomssystem. Mot slutten av 1700-tallet omfattet Linderud-godset omkring 350 gårder, skog og sagbruk. Ved selve Linderud registrerte man fire husmannsplasser i 1771 og elleve i 1854. Hovedhuset forteller mest om eierne; husmannsplassene minner om mennesker som arbeidet i det samme landskapet, men satte færre synlige spor i det bevarte anlegget.

Sør for huset ligger terrassehagen, med lange linjer, hasseltunnel, vannspeil og lindehall. Hagen bærer spor av barokken, men også av senere tiders smak. På 1800-tallet fikk den preg av engelsk landskapsstil. Restaureringen på 1950-tallet og nyere rosebed har formet mye av synsinntrykket. Det er nettopp lagene av endringer som gjør hagen historisk interessant.

Under den tyske okkupasjonen ble uthus brukt til innkvartering av soldater, og et jorde ved Trondheimsveien tjente som feltflyplass; våningshuset ble ikke rekvirert. Etter frigjøringen var Milorg-mannskaper forlagt her. Etter krigen ble store deler av jordveien utparsellert og uthusene revet. Da arvingene opprettet Linderud Stiftelse i 1954, var gårdens rolle i ferd med å endres fra jordbruks- og godsmiljø til et bevart historisk anlegg omgitt av den voksende byen.

**Paritetsmerking for fremtidig 4.2-review:** Avsnitt 1: C02/C04/C07–C12/C20–C21. Avsnitt 2: C22–C25; sosialhistorisk tolkning skal gjennomgås selvstendig. Avsnitt 3: C13–C19. Avsnitt 4: C28–C34. Disse referansene er en redaksjonell peker, **ikke** canonical setningsparitets-, hash- eller reviewbevis.

### 9D. Produksjonsprioritet etter denne kildelesingen

1. **Prøve med faktisk checkout:** utfør siste READ-FIRST og preflight-CLI; verifiser at 35-claim-kilden oppfyller forventet parserkontrakt uten registrering som aktiv quiz.
2. **Lever samme stedsbolk:** velg trygg offentlig pin, hent lisensiert Commons-original, lag tre individuelle WebP-utsnitt; bygg Place med 4.2-pakke, Fagverk-side og dokumentert fullquiz på kildene, ikke på tekstutkastet alene.
3. **Kjør portene én gang etter bolken:** targeted schema/quiz/Knowledge/QuizCard/registry/image og faktisk mobil-/desktop-QA. Dersom disse ikke lar seg kjøre i connector-økten, behold status som uferdig. **Ikke opprett flere administrative Stage-filer** i stedet for å bygge stedet.

**Isolasjon:** Oslo-bolk 04 og forsknings-PR #6563 forblir urørt.
