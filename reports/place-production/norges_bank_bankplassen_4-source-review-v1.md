# Norges Bank – Bankplassen 4 — source review

Dato: 2026-09-14  
Canonical place ID: `norges_bank_bankplassen_4`  
Baseline: `23406dddc51ede9472e937f6ae52965403cfc70c`

## Identitet og avgrensning

Canonical place er den stående bankbygningen på Bankplassen 4 som Norges Bank tok i bruk som hovedsete i 1906. Den skal ikke slås sammen med Groschs eldre bankbygning på Bankplassen 3 (`grunnlovsbygget_bankplassen`) eller dagens Norges Bank på Bankplassen 2 (`norges_bank_bankplassen_2`). Christiania Theater lå omtrent på samme tomt 1837–1899, men er allerede representert som historiske Wonderkammer-lag under dette stedet og skal ikke få en ny overlappende markør.

Eksisterende Geonorge-adressepunkt og koordinater beholdes uendret.

## Nullmåling før produksjon

På baseline finnes identitet, koordinater, kort `desc`/`popupDesc`, emnekoblinger, quizprofil og én ekstern Oppdag Kvadraturen-lenke. Det mangler full produksjonsstatus, den faste 2×2 PlaceCard-profilen, bildeklare People/Object/Brand/Productions-samlinger, dedikert portrait/frontImage og QuizCard-bilde, source-ledet 3×7-quiz, People-profil med claims, stedsleksikon, språkspor, lesespor, standard Fagverk-side og Næringsliv-case/produksjonskontrakter.

## Canonical routing

Primærkategori: `naeringsliv`.

Aktive underbadges som kan bæres av kildene:

- `bank_og_finans` — Norges Bank som sentralbank, hovedsete, kapital- og betalingsinfrastruktur.
- `arbeidsliv_og_fag` — 80 ansatte ved åpningen, bankdrift og seddeltrykkeriet som konkret arbeids-/produksjonsspor.

Full PlaceCard følger standard Næringsliv-profil: `people` · `objects` · `brands` · `productions`. `related` og Christiania Theater-lagene er ikke samlinger.

## Kilder og hva de bærer

1. Norges Bank, «History of Norges Bank»: hovedsetet flyttet til Kristiania 1. januar 1897; nytt hovedkvarter på Bankplassen åpnet i 1906 for 80 ansatte, inkludert seddeltrykkeriets arbeidere; Bankplassen 4 var bankens kontorer 1906–1986.
2. Norges Bank, «Norges Bank’s Printing Works – 190 years»: seddeltrykkeriet flyttet til Oslo i 1907 og lå på gateplan i den nye 1906-bygningen; mange ansatte flyttet fra Trondheim; trykkeriet flyttet til separat bygg i 1934 etter økt aktivitet.
3. Norges Bank, «Banknotes 1901–1945 (Series II)»: fra 1907 ble alle sedlene i serie II trykt i Norge på papir fra Alvøen.
4. Oppdag Kvadraturen, «Bankplassen 4 – Christiania Theater og Norges Bank»: stedsidentitet, teaterlaget og overgangen til bankbygg.
5. Oppdag Kvadraturen, «Stil og arkitektur – Bankplassen»: bankbygningens arkitektur og skulpturgruppen «Fred og arbeid»/«Arbeid og fred» ved hovedinngangen.
6. Store norske leksikon, «Bankplassen (Oslo)»: Christiania Theater ble revet i 1899 for å gi plass til Norges Banks andre bygning, ferdig i 1906.
7. Norges Bank årsrapport 2025: Bankplassen 4 ble overført fra Norges Bank til staten i 1986; fra 1. januar 2026 gikk forvaltningsansvaret fra Statsbygg til Forsvarsbygg uten at den opprinnelige overføringsavtalen ble endret.
8. Wikidata/Wikimedia Commons for Karl Gether Bomhoff: identitet og portrettkandidat; Norges Banks egne historiske sider brukes for bankrollen og tidsperioden.
9. Wikimedia Commons-dokumentasjon brukes bare for bilder med verifisert åpen lisens/public domain.

## Produksjonsvalg

**People:** Karl Gether Bomhoff. Han ledet Norges Bank 1893–1920 og er direkte knyttet til perioden da hovedsetet flyttet til Kristiania og Bankplassen 4 ble tatt i bruk. Arkitekt Ingvar Hjorth og billedhugger Lars Utne holdes som mulige sekundærpersoner; de legges ikke inn bare for å fylle samlingen.

**Object:** fasadeskulpturgruppen «Arbeid og fred» ved hovedinngangen. Dette er et fysisk, stedsspesifikt og bildeklart element, ikke selve bygningen forkledd som Object.

**Brand:** Norges Bank som selvstendig institusjonsidentitet. Brand-kortet skal bruke autentisk stedstilknyttet ordmerke/fasadeidentitet eller annen verifisert referensiell framstilling, ikke en generert logo.

**Production:** seddeltrykking ved Bankplassen 4, 1907–1934. Dette er en dokumentert fysisk produksjonsprosess i bygningen og gir et langt sterkere Næringsliv-anker enn en generell formulering om «banktjenester».

## Holdt tilbake / avvist

- Christiania Theater som ny canonical markør — eksisterende Wonderkammer-lag gjenbrukes.
- Bankplassen 3 eller Bankplassen 2 som samme sted — eksplisitt avvist.
- Påstand om at Bankplassen 4 fortsatt er Norges Banks hovedkontor — banken flyttet ut i 1986.
- Påstand om at Forsvarsbyggs forvaltningsansvar fra 2026 betyr at Forsvaret allerede har en bestemt operativ virksomhet i bygningen — kilden bærer bare forvaltnings-/eiendomsoverføringen.
- Generert eller rekonstruert historisk seddel-/logoillustrasjon dersom en dokumentert åpen kilde ikke kan verifiseres.
- Tall om ansatte, trykkvolum eller produktivitet brukt som årsaksbevis uten eksplisitt kildegrunnlag.

## Profilbeslutning

`standard`. Stedet har tilstrekkelig kildedybde til fire ekte samlinger, 3×7 source-ledet quiz, chronology, lesespor, språk og standard Fagverk uten filler. Før fullføring skal alle binærbilder verifiseres, generator-eide indekser rematerialiseres, og exact-head porter være grønne.

## Closure-materialisering

Generator-eide scenario-People-, epoke-, lesespor- og place-open-indekser er rematerialisert med repoets egne byggere. Canonical READ-FIRST-evidens er registrert med `place-production-rule-preflight.mjs record`, og workcarden validerer med ferske regelhashes. Denne noten dokumenterer materialiseringen; final exact-head CI og interaktiv slutt-QA forblir egne merge-porter.
