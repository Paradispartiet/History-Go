# Det Norske Teatret – People og konkrete sceneproduksjoner (C5)

**Kildepass:** 13. oktober 2026. **Omfang:** sju eksisterende canonical personposter, som allerede var koblet til `det_norske_teatret`. Ingen nye, løse personrelasjoner er opprettet.

## Historiske biografier med produksjonsevidens

| People-ID | Dokumentert scenehistorie | Primærkilder |
|---|---|---|
| `nils_sletta` | Ensemblemedlem fra 1969; dramatiserte og spilte Mattis i `Fuglane`, Scene 2, 1997; fikk Teaterkritikerprisen | [SNL](https://snl.no/Nils_Sletta), [teatrets egen Fuglane-historie](https://www.detnorsketeatret.no/framsyningar/fuglane), [bakgrunnsartikkel](https://www.detnorsketeatret.no/bakgrunnsartiklar/ein-ny-mattis-i-teaterhistoria) |
| `britt_langlie` | Piaf i 1980 (eldre spillested); fru Capuletti i `Romeo og Julie`, åpningsåret 1985; fru Johnstone i `Blodsbrør` 1989 | [FOREST: Britt Langlie](https://forest.detnorsketeatret.no/person/britt-langlie), [FOREST: Romeo og Julie 1985](https://forest.detnorsketeatret.no/produksjon/romeo-og-julie-1985) |
| `lasse_kolstad` | Tevje i `Spelemann på taket` 1967 og 1987; Gamle Profetikus i `Cats`, Hovudscenen, 9.11.1985; Peachum i `Tolvskillingsoperaen` 1992 | [FOREST: person](https://forest.detnorsketeatret.no/person/lasse-kolstad), [FOREST: Cats 1985](https://forest.detnorsketeatret.no/produksjon/cats-19851109), [Sceneweb](https://sceneweb.no/nb/artist/11335/Lasse_Kolstad) |
| `ane_dahl_torp` | `Andejakt` 2002, `Katt på heitt blekktak` 2007, Hedda-priset `Det gode menneske frå Sezuan` 2012, tekst-/sceneadaptasjon og fremføring i `Solaris korrigert` på Hovudscenen 2015 | [FOREST: Andejakt](https://forest.detnorsketeatret.no/produksjon/andejakt-20020905), [FOREST: Sezuan](https://forest.detnorsketeatret.no/produksjon/det-gode-menneske-fra-sezuan-20120113), [FOREST: Solaris korrigert](https://forest.detnorsketeatret.no/produksjon/solaris-korrigert-2015) |
| `henny_moan` | `Måken` 1987, `Madame de Sade` 1989, `Oidipus` 1992; Doreen Chapell i `Sjeler i natta`, Prøvesalen 2003; `Ad astra` 2007 | [SNL](https://snl.no/Henny_Moan), [FOREST: person](https://forest.detnorsketeatret.no/person/henny-moan), [FOREST: Sjeler i natta](https://forest.detnorsketeatret.no/produksjon/sjeler-i-natta-2003) |
| `ragnhild_hilt` | Ensemblet 1971–2014; `Angerhøy` 2005, `Hair` 2006 (rolle på video), `Brennande nesler` 2012, `Bikubesong` 2013 | [FOREST: Ragnhild Hilt](https://forest.detnorsketeatret.no/person/ragnhild-hilt) |
| `jorunn_kjellsby` | Kritikerprisen 1990–91 for `Salka Valka`; Ammen i `Romeo og Julie` 2001; Big Mama i `Katt på heitt blekktak` 2007; fru Yang i `Det gode menneske frå Sezuan` 2012 | [FOREST: person](https://forest.detnorsketeatret.no/person/jorunn-kjellsby), [FOREST: Katt på heitt blekktak](https://forest.detnorsketeatret.no/produksjon/katt-pa-heitt-blekktak-20070322), [FOREST: Sezuan](https://forest.detnorsketeatret.no/produksjon/det-gode-menneske-fra-sezuan-20120113) |

FOREST angir `Cats` som én produksjon på Hovudscenen med skandinaviapremiere 9. november 1985, 197 forestillinger og arkivnummer M730 F646 P627 PL206. Dette er ikke samme produksjon som enhver annen `Cats`-oppsetning. `Katt på heitt blekktak` hadde premiere 22. mars 2007 (Hovudscenen, 43 forestillinger) med Ane Dahl Torp som Margaret og Jorunn Kjellsby som Big Mama. `Solaris korrigert` hadde premiere 16. oktober 2015 på Hovudscenen (23 forestillinger) med Ane Dahl Torp som utøver/tilrettelegger.

## Hus, felt og bildereglene

Institusjonen (1912–) må fortsatt skilles fra huset i Kristian IVs gate (1985–). For Britt Langlie og Lasse Kolstad skiller tekstene bevisst tidligere priser og produksjoner fra 1985-husets konkrete oppsetninger. Nils Sletta og Ragnhild Hilt har også eldre ensamblespor utenfor det nye huset.

`desc`, `year`, `category`, `placeId`, `places`, `image` og `cardImage` ble ikke endret i C5. `year` kan inneholde et tidlig institusjonsanker og er **ikke** automatisk likt første arbeidsår i dagens bygning. Spesielt Henny Moans eksisterende `year:1950` må ikke tolkes som DNT-ansettelse (SNL oppgir DNT fra 1978); det krever egen metadata/avledet-systemkontroll før eventuell retting.

Fotografier av Nils Sletta i SNL er merket avgrenset gjenbruk. Oppsetningsbilder i FOREST fra blant annet Erik Berg, Per Maning og andre fotografer er ikke frie assets. Ingen portrett- eller scenefil er kopiert. Ingen kortkunst er påstått ferdig.

## Kontroll og neste port

C1 (5) + C2 (8) + C3 (10) + C4 (7) + C5 (7) = **37 ulike kildegjennomgåtte profiler av 87**; 50 gjenstår. Denne statusen angir redaksjonell kontroll, **ikke** 37 godkjente billedkort.

Runtime: `people-all.json` beholdt **1434 unike person-ID-er**, nå fordelt i sju deterministisk regenererte shards uten datatap. `place-open/det_norske_teatret.json` inneholder fortsatt **87** personer. Bare canonical kildeposter, disse genererte visningsfilene og rapporten endres. Civication-kode/rolleindekser, stedets quiz, Forestillinger-medlemsdata og brukerprogressjon er urørt.

Hele placepakka er fortsatt `BLOCKED`: blant annet 50 People-profiler, portréttlisensiering, forestillingsbilder, Objects, Brand-kandidatkontroll, eget frontImage, Quiz/QuizCard og faktisk UI-akseptanse står åpne.
