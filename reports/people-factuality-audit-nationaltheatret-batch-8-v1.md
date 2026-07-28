# People factuality audit — Nationaltheatret batch 8 v1

Kontrolldato: **2026-07-28**
Standard: `people_profile_v1.0`
Profiler: `charles_marowitz`, `david_knudsen`, `edith_roger`, `einar_skavlan`

## Avgrensning

Batchen gjelder bare canonical People-data, claims, People-gaten og avledede People-indekser. Eksisterende History GO-profiler er brukt som reparasjonsmål, ikke som faktakilder. Ingen Places-, coordinate-, quiz- eller fagfiler skal endres.

## Charles Marowitz

Kilder:

- Sceneweb: `En folkefiende` (1979)
- Store norske leksikon: Charles Marowitz
- The Guardian: nekrolog over Charles Marowitz

Publisert:

- amerikansk regissør, dramatiker og teaterkritiker med hovedvirke i Storbritannia
- oppvekst på Lower East Side i en jiddischtalende innvandrerfamilie
- studier ved London Academy of Music and Dramatic Art etter militærtjeneste
- grunnleggelsen av The Open Space i 1968
- konkret regi og bearbeidelse av `En folkefiende` på Nationaltheatret i 1979
- norske produksjoner av `Hedda` og `Like for like`

### Kildekonflikt

Store norske leksikon oppgir fødselsåret 1934, mens The Guardians nekrolog oppgir 1932. Profilen publiserer derfor ikke et ubestridt `birth_date`. Konflikten er lagret som `birth_year_conflict` og synliggjort i `popupDesc`.

## David Knudsen

Kilder:

- Sceneweb: David Knudsen
- Store norske leksikon og Norsk biografisk leksikon
- Sceneweb-produksjonene `Det lykkelige valg` (1914), `Vildanden` (1928) og `Tante Ulrikke` (1937)

Publisert:

- livsdata og oppvekst i et akademisk miljø
- eksamen fra Kristiania Handelsgymnasium i 1893
- tidlig arbeid i forretningslivet og opphold i London og Bordeaux
- profesjonell debut ved Den Nationale Scene i 1902
- ansettelse ved Nationaltheatret 1911–1940
- tre konkrete roller ved Nationaltheatret
- filmdebut og utmerkelse i 1945

## Edith Roger

Kilder:

- Sceneweb: Edith Roger
- Store norske leksikon: Edith Roger
- Sceneweb-produksjonene `Den stundesløse` (1968), `Peer Gynt` (1975 og 1985) og `Hedda Gabler` (1988)

Publisert:

- livsdata og yrkesrollene danser, koreograf og sceneinstruktør
- oppvekst i Son og dokumentert danseopplæring
- dansearbeid ved Svenska Dansteatern, Ny Norsk Ballett og Den Norske Opera
- sceneinstruktør ved Nationaltheatret 1967–1997
- første oppsetninger på Amfiscenen og hovedscenen
- fire konkrete regioppgaver
- tre dokumenterte utmerkelser

## Einar Skavlan

Kilder:

- Sceneweb: Einar Skavlan
- Sceneweb: Nationaltheatrets teatersjefer
- Norsk biografisk leksikon: Einar Skavlan

Publisert:

- livsdata og fullt navn
- politisk preget barndomshjem
- juridisk embetseksamen og journaliststart
- sjefredaktørperioden i Dagbladet
- teatersjefstart ved Nationaltheatret i 1928
- arrestasjonen i 1942 og 19 måneder på Grini
- bøkene `Knut Hamsun` og `Gunnar Heiberg`

### Kildekonflikt

Sceneweb og Nationaltheatrets sjefsliste oppgir sjefperioden 1928–1930. Norsk biografisk leksikon oppgir 1928–1929. Konflikten er lagret som `nationaltheatret_period_conflict`. `year` publiseres derfor bare som startåret 1928, mens verkoppføringen og `popupDesc` viser den dokumenterte uenigheten.

## Ferdigstatus

Alle fire profiler har:

- `profileStandard: people_profile_v1.0`
- `profileStatus: ready_people_v1`
- verifisert identitet
- komplett felt–claim-paritet
- komplett setning–claim-paritet
- separat faktareview og redaksjonell review
- Wikipedia bare som `further_reading`

Ingen profil er fylt ut for å nå et bestemt antall utdanninger, verk, kilder eller avsnitt.
