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
| 6 | Hvilket av disse er et dokumentert element i Linderuds historiske hage? | A Et drivhus i glass fra 2000-tallet; B En renessansefestning; C En lindehall; D En romersk akvedukt | C | LG-05 |
| 7 | Hva er riktig om dagens rosehage? | A Den er aldri endret; B Den ble først anlagt i 2007; C Den ble bygd som parkeringsplass; D Den har blitt omformet i flere perioder | D | LG-06 |
| 8 | Hva kjennetegnet godset utover selve hovedgården? | A Skog og sagbruk; B Kun én sjøbod; C Ett steinbrudd; D Et fiskevær | A | LG-04 |
| 9 | Hva skjedde med mye av det tidligere jordbrukslandet etter krigen? | A Det ble havneanlegg; B Det ble boligbebyggelse; C Det ble flyplass; D Det ble sjø | B | LG-08 |
| 10 | Hvilket år ble Linderud Stiftelse opprettet? | A 1894; B 1940; C 1954; D 2007 | C | LG-07 |

**Quiz-revisjon:** Nr. 6 og 8 har for lite plausible distraktorer og må forbedres. Fasit og begrunnelser skal skrives kilde for kilde og kontrolleres mot fullquizstandard før import. Dette er **ikke** en godkjent QuizCard eller et fullquizsett. Den ordinære quizkontrakten krever minimum 3×7 for narrow og 4×7 for normal, med særskilt kilde-/Knowledge-/manifestkobling.

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
