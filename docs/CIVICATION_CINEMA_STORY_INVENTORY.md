# Civication Cinema – fortellingsinventar, trinn 1

Dato: 2026-11-28. Kilde: [Life Story-manifestet](../data/Civication/lifestory/manifest.json) og de 16 refererte scenes.json-filene på dokumentasjonsgrenen. Dette er en verifisert opptelling av rå sceneoppføringer, ikke alle Civication-historier, og ikke et antall ferdige filmer.

## Produksjonsgrunnlag

| Pakke | Scener | Tråd-ID-er brukt i scener | Valg |
| --- | ---: | ---: | ---: |
| [Felles privatliv](../data/Civication/lifestory/life/scenes.json) | 233 | 30 | 502 |
| [Arealplanlegger](../data/Civication/lifestory/roles/arealplanlegger/scenes.json) | 30 | 10 | 68 |
| [Renholder](../data/Civication/lifestory/roles/renholder/scenes.json) | 101 | 10 | 216 |
| [Ekspeditør](../data/Civication/lifestory/roles/ekspeditor/scenes.json) | 130 | 9 | 283 |
| [Miljøarbeid](../data/Civication/lifestory/roles/psykologi_miljoarbeid/scenes.json) | 5 | 5 | 15 |
| [Arbeids- og karriereveiledning](../data/Civication/lifestory/roles/psykologi_arbeids_og_karriereveiledning/scenes.json) | 5 | 5 | 15 |
| [Psykolog](../data/Civication/lifestory/roles/psykolog/scenes.json) | 5 | 5 | 15 |
| [Spesialistpsykolog](../data/Civication/lifestory/roles/spesialistpsykolog/scenes.json) | 5 | 5 | 15 |
| [Fagansvarlig](../data/Civication/lifestory/roles/fagansvarlig/scenes.json) | 5 | 5 | 15 |
| [Klinikkleder](../data/Civication/lifestory/roles/klinikkleder/scenes.json) | 5 | 5 | 15 |
| [Forsker (psykologi)](../data/Civication/lifestory/roles/forsker_psykologi/scenes.json) | 5 | 5 | 15 |
| [Professor (psykologi)](../data/Civication/lifestory/roles/professor_psykologi/scenes.json) | 5 | 5 | 15 |
| [Barnehageassistent](../data/Civication/lifestory/roles/barnehageassistent/scenes.json) | 11 | 5 | 24 |
| [Arbeidsledig](../data/Civication/lifestory/roles/arbeidsledig/scenes.json) | 136 | 21 | 310 |
| [Controller](../data/Civication/lifestory/roles/controller/scenes.json) | 10 | 5 | 20 |
| [Profesjonell utøver](../data/Civication/lifestory/roles/sport_utover/scenes.json) | 10 | 5 | 20 |
| **Sum** | **701** | **135** | **1563** |

Tråd-ID-er telles distinkt innen hver pakkes scener, ikke som en global unik mengde. Scene- og valgtall er rå innholdsoppføringer, ikke ett lineært spillforløp. Barnehageassistent er content_only i manifestet, Arbeidsledig system_role, de andre 13 rollepakker er Badge-bundet. Felles privatliv flettes inn i rollene av runneren. Rolleavgrensede tekstvarianter, fortsettelser og scenevilkår kan kreve ytterligere klipp; ikke multipliser privatpakken mekanisk med alle roller.

## Første avsenderkart

Disse ID-ene kommer fra feltet avsender i de faktiske scenene. De er ikke hele rollebesetningen og er heller ikke automatisk unike personer på tvers av historier. Samme avsender-ID i ulike pakker kan være ulike figurer. Rollepakke, persondefinisjon, representanter, tråd og scene må undersøkes før design.

- **Felles privatliv**: `venn`, `familie`.
- **Arealplanlegger**: `skolekontakt`, `plansjef`, `utbygger`, `utvalgssekretaer`, `nabo`, `politiker`.
- **Renholder**: `driftsleder`, `kontorbruker`, `verneombud`, `erfaren_kollega`.
- **Ekspeditør**: `butikksjef`, `erfaren_kollega`, `ny_kollega`, `stamkunde`.
- **Miljøarbeid**: `teamleder`, `erfaren_kollega`, `mina`, `paaroerende`.
- **Arbeids- og karriereveiledning**: `nora`, `kollega`, `arbeidsgiver`, `teamleder`, `nav_kontakt`.
- **Psykolog**: `pasient`, `kollega`, `veileder`.
- **Spesialistpsykolog**: `teamleder`, `psykolog`, `pasient`, `kollega`.
- **Fagansvarlig**: `kvalitet`, `kliniker`, `leder`.
- **Klinikkleder**: `avdelingsleder`, `fagansvarlig`, `divisjonsleder`, `tillitsvalgt`.
- **Forsker (psykologi)**: `prosjektleder`, `kollega`, `deltakeransvarlig`, `partner`.
- **Professor (psykologi)**: `phd`, `student`, `studieleder`, `kollega`.
- **Barnehageassistent**: `forelder_samir`, `pedagogisk_leder`, `erfaren_assistent`, `forelder_linn`, `styrer`.
- **Arbeidsledig**: `nav_veileder`, `bekjent`, `venn`, `mira`, `amir`, `booker`, `lea`, `elin`, `sara`, `ivar`, `nora`, `daniel`.
- **Controller**: `venn`, `familie`, `ingrid_okonomisjef`, `driftsleder`, `revisor`, `marius_regnskap`.
- **Profesjonell utøver**: `fysio_elias`, `trener_maja`, `lagkontakt_samir`, `lagkamerat_nora`, `sportslig_leder`, `kontraktansvarlig`, `venn`, `familie`.

## Produksjonsprinsipp

Hver eksisterende rolle, jobb, livsposisjon og Life Story behandles som et fortellingsforløp med egen cast og kulisser. Ingen felles påtvunget hovedkarakter. Spilleren opptrer i subjektivt kamera, indirekte utsnitt eller et rolleavgrenset design når den konkrete historien krever det. Ingen visuell identitet utledes fra navn alene. Felles karakterer og kulisser gjenbrukes bare når kildeinnholdet underbygger at det faktisk er samme person/sted.

Først kartlegges kanonisk scene-ID, tråd, fase, forfattet tekst, avsender, rollepersoner, faktiske steder og valgbetingelser. Deretter storyboard, karakterreferanser, kulisse, shot-liste og eventuelle konsekvensklipp. Ikke skriv nye fortellinger som erstatning for eksisterende scener. Medieregisteret er separat fra spilltilstand.

## Neste kartleggingsetappe

- Les rolledefinisjoner, trådpersoner, symposiumfortsettelser og rolleavgrensede tekstvarianter. Avsenderkartet suppleres med full cast og dokumenterte steder.
- Kartlegg eksisterende roleWorlds, narratives, jobbmail og øvrige livsposisjonsforløp separat. Identifiser faktisk kilde/overlapp med Life Story, ikke dobbelttell.
- Velg en konkret eksisterende scene fra en av de dokumenterte historiene som visuell pilot; ikke konstruer en ny universell hovedperson.

Status: første manifestinventar ferdig; full katalog, karakter-/kulissedesign, storyboard og filmproduksjon gjenstår.

## Trinn 2 – fortsettelser og øvrige kilderegistre (2026-11-28)

[Maskinlesbart kilderegister](CIVICATION_CINEMA_SOURCE_REGISTER.json) inneholder alle 45 fortsettelsesreferanser fra Arbeidsledig-rollens symposium, med opptelling fra hver faktisk JSON-fil, 21 rollebroer, 50 narrative streams, tre life-mail-pakker og seks næringslivsjobbmail-pakker. De siste registrene er foreløpig kun referanseinventar; ikke tell disse som ferdige, distinkte scener.

| Fortsettelsesspor | Kapitler | Scener | Valg |
| --- | ---: | ---: | ---: |
| Frilansmusiker / Mira | 11 | 129 | 254 |
| Sideprosjektbygger / Lea | 8 | 123 | 239 |
| Frilanser / Lea | 11 | 138 | 262 |
| Gründerdrømmer / Lea | 3 | 26 | 50 |
| Miljøkontakten / Arvid | 12 | 143 | 277 |
| **Fortsettelser totalt** | **45** | **559** | **1 082** |
| **Grunnpakker + fortsettelser** | | **1 260** | **2 645** |

Tallene gjelder rå forfattede scene-/valgoppføringer i de leste filene, ikke unike filmklipp eller alle mulige spillerforløp. Eksplisitte sted-ID-er i fortsettelsesfilene omfatter hjem, øvingsrom, prosjektbord og pub; feltet er ikke nødvendigvis den faktiske dramatiske kulissen. Karakterer og steder må også leses ut av situasjonsteksten. Neste trinn: opptelling av de 50 narrative stream-filene og øvrige jobbmail-manifester, kartlegging av kildeoverlapp og rollebesetning.

## Trinn 3 – Narrative (2026-11-28)

Alle 50 stream-filer i [Narrative-manifestet](../data/Civication/narratives/manifest.json) er lest som JSON, kontrollert mot manifest-ID og telt ut fra storylets og choices. Kilderegisteret inneholder tittel, type, avsendere, blob-SHA og antall for hver fil.

| Kildemappe | Pakker | Storylets | Valg |
| --- | ---: | ---: | ---: |
| leisure | 44 | 602 | 1 188 |
| work | 4 | 18 | 36 |
| conflict | 1 | 5 | 10 |
| class_cases | 1 | 6 | 12 |
| **Narrative totalt** | **50** | **631** | **1 246** |

Samlet rått manusgrunnlag: 701 grunnscener + 559 fortsettelsesscener + 631 Narrative-storylets = **1 891 oppføringer**, med **3 891 valg**. Dette er ikke en deduplisert filmliste. Samme rolle eller person kan opptre på tvers av kilder, og enkelte situasjoner kan overlappe. Storylets skal beholde sine egne kanoniske ID-er og vilkår; medieregisteret skal kunne koble flere kilde-ID-er til samme film bare når den redaksjonelle gjennomgangen fastslår samsvar. Ingen omskriving av spillmotor eller kildemanus er gjort.

Gjenstår: øvrige jobbmail-manifester og life-mail-pakker, rolleverdener, fullstendig karakter- og kulissekartlegging, konkret scenevis produksjonsregister og pilotproduksjon. Se [kilderegisteret](CIVICATION_CINEMA_SOURCE_REGISTER.json).
