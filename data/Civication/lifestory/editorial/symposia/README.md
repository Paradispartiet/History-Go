# Civication – hovedregister og fortellingssymposier

> Redaksjonell produksjonsdokumentasjon, 12. oktober 2026. **Ikke** et nytt runtime-register og **ikke** en erklæring om at alle rollene har 34 spillbare dager.

## Leserekkefølge og autoritet

1. [Hovedregister med alle ID-er](indexV1.json) er maskinlesbart og peker tilbake til de kanoniske kildene.
2. [15 formelle rollesymposier](formalRolesV1.json) viser jobb, ansvar, conflicts, relasjoner, aktører, avslutninger og faglige fortellerspor.
3. [21 livsposisjoner, del 1](lifePositions01V1.json) og [del 2](lifePositions02V1.json) viser dramaturgi, rolleverdener, arketypiske bipersoner, 14-dagers beatplan, forsinkede følger og materialiseringskilder.
4. [45 kapittelsymposier, del 1](chapters01V1.json), [del 2](chapters02V1.json) og [del 3](chapters03V1.json) viser originalscener, valg, betingelser, relasjonsendringer, kapitlenes åpning, komplikasjon og mulige utfall.
5. [People-fagkoblinger pr. rolle](historicalPeoplePlanV1.json) viser alle 36 rollenes koblingsfelt og hvilke virkelige People-referanser som fortsatt mangler kilderevisjon. **0 individuelle koblinger er godkjent hittil.**
6. [Person- og identitetsregister](charactersV1.json) viser **110 rollelokale Civication-bipersoner**, de seks redaksjonelle navn/alias-oppføringene og skillet til History Go People.
7. [Produksjonsplan og godkjenningskrav](PRODUKSJONSPLAN.md) styrer hva som må kvalitetssikres før nye kapitler skrives.

Kanonisk autoritet: `data/Civication/lifestory/manifest.json` for formelle roller, `data/Civication/lifestory/roles/arbeidsledig/role.json#symposium.rollebroer` for livsposisjoner, `roleFirstStoryArchitectureV1.json` for redaksjonell typologi og de faktiske `continuations/*.json` for spillede kapitler. Verken symposiumfilene eller denne oversikten åpner roller, skifter jobb, gir Badge eller gir ParadiseCoin.

## Dekning

| Registrert innhold | Status |
|---|---:|
| Formelle rollepakker med redaksjonelt symposium | **15** |
| Livsposisjoner med dramaturgisk symposium | **21** |
| Eksisterende fortsettelseskapitler med symposium | **45** |
| Livsposisjoner med egne fortsettelseskapitler | **5/21** |
| Fortsettelser med forgjenger i annen livsposisjon | **21** |
| Rowlokale personposter (ikke deduplisert globalt) | **110** |
| Litterære hovedspor / modellplott / samtidige typer | **24 / 7 / 24** |

14-dagers sesongbeater i `lifePositions*.json` er redaksjonelle planposter fra rolleverdenene, ikke automatisk spillbare `Lifestory`-scener. `chapters*.json` beskriver faktiske eksisterende kapitteldata. De to planlagene må holdes separate inntil uttrykkelig materialisering og integrasjon er godkjent.

## Formelle roller (15)

| Rolle-ID | Rolle | Status | Plot / hovedspor / fortellingstype |
|---|---|---|---|
| `arbeidsledig` | Arbeidsledig | Systemrolle | `P02` · `L03` · `C01` |
| `arealplanlegger` | Arealplanlegger | Jobbpakke | `P03` · `L17` · `C06` |
| `renholder` | Renholder | Jobbpakke | `P06` · `L06` · `C17` |
| `ekspeditor` | Ekspeditør | Jobbpakke | `P03` · `L17` · `C23` |
| `psykologi_miljoarbeid` | Miljøarbeid og oppfølging | Jobbpakke | `P03` · `L11` · `C12` |
| `psykologi_arbeids_og_karriereveiledning` | Arbeids- og karriereveiledning | Jobbpakke | `P04` · `L17` · `C19` |
| `psykolog` | Psykolog | Jobbpakke | `P03` · `L17` · `C06` |
| `spesialistpsykolog` | Spesialistpsykolog | Jobbpakke | `P03` · `L13` · `C22` |
| `fagansvarlig` | Fagansvarlig | Jobbpakke | `P03` · `L19` · `C22` |
| `klinikkleder` | Klinikkleder | Jobbpakke | `P06` · `L07` · `C06` |
| `forsker_psykologi` | Forsker (psykologi) | Jobbpakke | `P03` · `L20` · `C22` |
| `professor_psykologi` | Professor (psykologi) | Jobbpakke | `P07` · `L13` · `C20` |
| `barnehageassistent` | Barnehageassistent / pedagogisk medarbeider | Ikke jobbopptjent innhold | `P03` · `L11` · `C20` |
| `controller` | Controller | Jobbpakke | `P03` · `L12` · `C22` |
| `sport_utover` | Profesjonell utøver | Jobbpakke | `P02` · `L15` · `C19` |

## Valgte livsposisjoner (21)

| Livsposisjon | Kanonisk ID | Eksisterende fortsettelser | Plot / hovedspor / fortellingstype |
|---|---|---:|---|
| Frilansmusiker | `musikk_frilansmusiker` | 11 | `P07` · `L15` · `C19` |
| Gangster | `subkultur_gangster` | 12 | `P03` · `L02` · `C07` |
| Sideprosjektbygger | `naeringsliv_sideprosjektbygger` | 8 | `P03` · `L17` · `C03` |
| Frilanser | `naeringsliv_frilanser` | 11 | `P03` · `L20` · `C04` |
| Gründerdrømmer | `naeringsliv_grunderdrommer` | 3 | `P02` · `L06` · `C03` |
| Skrivebordspoet | `litteratur_skrivebordspoet` | 0 | `P07` · `L24` · `C19` |
| Ateliermenneske | `kunst_ateliermenneske` | 0 | `P07` · `L21` · `C19` |
| Improentusiast | `scenekunst_improentusiast` | 0 | `P05` · `L13` · `C20` |
| Klubbmenneske | `sport_klubbmenneske` | 0 | `P05` · `L11` · `C20` |
| Grasrotbygger | `politikk_grasrotbygger` | 0 | `P03` · `L19` · `C20` |
| Organisasjonsmenneske | `politikk_organisasjonsmenneske` | 0 | `P06` · `L07` · `C08` |
| Byvandrer | `by_byvandrer` | 0 | `P04` · `L22` · `C21` |
| Flanør | `by_flanor` | 0 | `P04` · `L09` · `C21` |
| Lokalhistoriker | `historie_lokalhistoriker` | 0 | `P03` · `L20` · `C22` |
| Fuglekikker | `natur_fuglekikker` | 0 | `P04` · `L22` · `C22` |
| Sanker | `natur_sanker` | 0 | `P03` · `L17` · `C22` |
| Folkeforsker | `vitenskap_folkeforsker` | 0 | `P03` · `L20` · `C22` |
| Maker | `vitenskap_maker` | 0 | `P02` · `L17` · `C23` |
| Filmklubbmenneske | `film_tv_filmklubbmenneske` | 0 | `P05` · `L13` · `C20` |
| Bokklubbmenneske | `litteratur_bokklubbmenneske` | 0 | `P05` · `L13` · `C20` |
| Konsertgjenger | `musikk_konsertgjenger` | 0 | `P04` · `L23` · `C02` |

De 16 livsposisjonene uten fortsettelser **har ikke** ferdige Life Story-kapittelkjeder; rolleverden, narrative streams og sesongplan er selvstendige innholdslag. Ikke marker dem ferdigspilt basert på antall planlagte beats.

## Fortsettelseskapitler (45)

Dager under er fortsettelsesvinduet utledet fra `etterDag`; den faktiske åpning og slutt er dokumentert inne i hvert kapittelsymposium. Kryssing mellom livsposisjoner krever alltid selvstendig, kanonisk aktiv rolle; det er ikke et automatisk rollebytte.

| Kapittel-ID | Rolle-ID | Dager | Forgjenger | Sjekk |
|---|---|---|---|---|
| `musikk_med_mira` | `musikk_frilansmusiker` | 8–10 | Første fortsettelse | — |
| `sideprosjekt_med_lea` | `naeringsliv_sideprosjektbygger` | 8–10 | Første fortsettelse | — |
| `frilans_med_lea` | `naeringsliv_frilanser` | 8–10 | Første fortsettelse | — |
| `grunder_med_lea` | `naeringsliv_grunderdrommer` | 8–10 | Første fortsettelse | — |
| `sideprosjekt_neste_steg` | `naeringsliv_sideprosjektbygger` | 11–13 | `sideprosjekt_med_lea`, `frilans_med_lea`, `grunder_med_lea` | **Kontroller rollebytte** |
| `frilans_neste_steg` | `naeringsliv_frilanser` | 11–13 | `sideprosjekt_med_lea`, `frilans_med_lea`, `grunder_med_lea` | **Kontroller rollebytte** |
| `grunder_neste_steg` | `naeringsliv_grunderdrommer` | 11–13 | `sideprosjekt_med_lea`, `frilans_med_lea`, `grunder_med_lea` | **Kontroller rollebytte** |
| `musikk_foresporselen` | `musikk_frilansmusiker` | 11–13 | `musikk_med_mira` | — |
| `miljo_med_arvid` | `subkultur_gangster` | 8–10 | Første fortsettelse | — |
| `miljo_navnet_ditt` | `subkultur_gangster` | 11–13 | `miljo_med_arvid` | — |
| `musikk_etter_foresporselen` | `musikk_frilansmusiker` | 14–16 | `musikk_foresporselen` | — |
| `sideprosjekt_etter_neste_steg` | `naeringsliv_sideprosjektbygger` | 14–16 | `sideprosjekt_neste_steg` | — |
| `frilans_etter_neste_steg` | `naeringsliv_frilanser` | 14–16 | `frilans_neste_steg` | — |
| `grunder_etter_neste_steg` | `naeringsliv_grunderdrommer` | 14–16 | `grunder_neste_steg` | — |
| `miljo_etter_invitasjonen` | `subkultur_gangster` | 14–16 | `miljo_navnet_ditt` | — |
| `sideprosjekt_kryss_med_mira` | `naeringsliv_sideprosjektbygger` | 17–19 | `musikk_etter_foresporselen` | **Kontroller rollebytte** |
| `miljo_kryss_med_lea` | `subkultur_gangster` | 17–19 | `sideprosjekt_etter_neste_steg` | **Kontroller rollebytte** |
| `musikk_kryss_med_arvid` | `musikk_frilansmusiker` | 17–19 | `miljo_etter_invitasjonen` | **Kontroller rollebytte** |
| `miljo_kryss_med_frilans` | `subkultur_gangster` | 17–19 | `frilans_etter_neste_steg` | **Kontroller rollebytte** |
| `musikk_kryss_med_grunder` | `musikk_frilansmusiker` | 17–19 | `grunder_etter_neste_steg` | **Kontroller rollebytte** |
| `miljo_etter_leas_program` | `subkultur_gangster` | 20–22 | `sideprosjekt_kryss_med_mira` | **Kontroller rollebytte** |
| `musikk_etter_arvids_tekst` | `musikk_frilansmusiker` | 20–22 | `miljo_kryss_med_lea` | **Kontroller rollebytte** |
| `frilans_etter_miras_navn` | `naeringsliv_frilanser` | 20–22 | `musikk_kryss_med_arvid` | **Kontroller rollebytte** |
| `frilans_etter_arvids_kreditering` | `naeringsliv_frilanser` | 20–22 | `miljo_kryss_med_frilans` | **Kontroller rollebytte** |
| `miljo_etter_miras_lyd` | `subkultur_gangster` | 20–22 | `musikk_kryss_med_grunder` | **Kontroller rollebytte** |
| `lea_etter_arvids_ansvar` | `naeringsliv_sideprosjektbygger` | 23–25 | `miljo_etter_leas_program` | **Kontroller rollebytte** |
| `mira_etter_samtalen_med_lea` | `musikk_frilansmusiker` | 23–25 | `musikk_etter_arvids_tekst` | — |
| `arvid_etter_leas_notat` | `subkultur_gangster` | 23–25 | `frilans_etter_miras_navn` | **Kontroller rollebytte** |
| `arvid_etter_leas_grense` | `subkultur_gangster` | 23–25 | `frilans_etter_arvids_kreditering` | **Kontroller rollebytte** |
| `mira_etter_lydfilens_rykte` | `musikk_frilansmusiker` | 23–25 | `miljo_etter_miras_lyd` | **Kontroller rollebytte** |
| `arvid_etter_leas_tillit` | `subkultur_gangster` | 26–28 | `lea_etter_arvids_ansvar` | **Kontroller rollebytte** |
| `lea_etter_miras_vennskap` | `naeringsliv_sideprosjektbygger` | 26–28 | `mira_etter_samtalen_med_lea` | **Kontroller rollebytte** |
| `lea_etter_arvids_fortelling` | `naeringsliv_frilanser` | 26–28 | `arvid_etter_leas_notat` | **Kontroller rollebytte** |
| `lea_etter_arvids_avstand` | `naeringsliv_frilanser` | 26–28 | `arvid_etter_leas_grense` | **Kontroller rollebytte** |
| `mira_etter_nye_takter` | `musikk_frilansmusiker` | 26–28 | `mira_etter_lydfilens_rykte` | — |
| `arvid_og_det_aapne_lokalet` | `subkultur_gangster` | 29–31 | `arvid_etter_leas_tillit` | — |
| `lea_og_sporsmaalene_som_gjenstaar` | `naeringsliv_sideprosjektbygger` | 29–31 | `lea_etter_miras_vennskap` | — |
| `lea_og_kildene_i_skrivearbeidet` | `naeringsliv_frilanser` | 29–31 | `lea_etter_arvids_fortelling` | — |
| `lea_og_fellesskapet_uten_plikt` | `naeringsliv_frilanser` | 29–31 | `lea_etter_arvids_avstand` | — |
| `mira_og_musikken_i_hverdagen` | `musikk_frilansmusiker` | 29–31 | `mira_etter_nye_takter` | — |
| `arvid_og_nokkelen_til_lokalet` | `subkultur_gangster` | 32–34 | `arvid_og_det_aapne_lokalet` | — |
| `lea_og_den_foerste_hypotesen` | `naeringsliv_sideprosjektbygger` | 32–34 | `lea_og_sporsmaalene_som_gjenstaar` | — |
| `lea_og_foresporselen_om_honorar` | `naeringsliv_frilanser` | 32–34 | `lea_og_kildene_i_skrivearbeidet` | — |
| `lea_og_elins_vanskelige_uke` | `naeringsliv_frilanser` | 32–34 | `lea_og_fellesskapet_uten_plikt` | — |
| `mira_og_invitasjonen_fra_musikeren` | `musikk_frilansmusiker` | 32–34 | `mira_og_musikken_i_hverdagen` | — |

## Personmodell: tre separate nivåer

**Spiller:** Har en kanonisk jobbrolle og eventuelt en selvvalgt livsposisjon. Historien handler om spillerens handlinger, økonomi, moral, relasjoner og konsekvenser; bipersonens navn velger ikke rolle.

**Civication-bipersoner:** Fiktive personer får stabile, navneromsatte ID-er, for eksempel `arbeidsledig:mira`, `arbeidsledig:lea` og `arbeidsledig:amir` (fortellernavnet Arvid). Lokale ID-er i andre roller er **ikke automatisk** samme person. En pasient kalt Lea i psykologyrket skal for eksempel ikke blandes med prosjektbyggeren Lea.

**History Go People:** Reelle, dokumenterte personer, også nålevende, kan bidra med historisk og faglig bakgrunn. De får aldri automatisk fiktiv dialog, fiktive valg eller fiktive relasjoner. De seks ID-ene som per i dag finnes i `persontype.representanter` er **eldre substitusjonskandidater, ikke godkjent personcasting**. `lifestoryState.bindPersonTypes` og `presentText` utfører fortsatt substitusjon i runtime; dette må migreres med kompatibilitetstest på en egen teknisk oppgave.

## Bruk av 24/7/24

De 24 litterære hovedsporene, syv modellplottene og 24 samtidige fortellingstypene er dramaturgiske tolkningsrammer, ikke statiske oppskrifter eller automatisk skjebne. Hver rolle har én primær kobling for redaksjonell styring. Flere strukturer kan kombineres så lenge rollens realistiske liv, eksisterende valg og spillbarhet kommer først.

## Status og begrensninger

**Dette er nå dokumentert:** alle registerførte roller og posisjoner, alle eksisterende fortsettelseskapitler, redaksjonelt persongrunnlag og typologisk kobling.

**Dette er ennå ikke produksjonsgodkjent:** personmigrering, faktiske People-fagkoblinger for hver rolle, rollebytte-kryssing, 16 manglende kapittelkjeder og alle regresjonstester. Se [produksjonsplanen](PRODUKSJONSPLAN.md).

