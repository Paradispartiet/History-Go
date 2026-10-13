# Det Norske Teatret – People, sceneproduksjoner og rolleankre C5

**Kildekontroll 13. oktober 2026.** Sju eksisterende People-profiler, uten nye ID-er eller bilder. Popuptekstene er omskrevet fra intern `personanker`-begrunnelse til konkrete, kildebelagte roller på Det Norske Teatret, med skille mellom huset som åpnet i Kristian IVs gate 1985 og tidligere spillesteder.

| Person | Dokumentert stedshistorie | Kilder |
|---|---|---|
| Nils Sletta | Ansatt fra 1969; Mattis og meddramatisering i `Fuglane`, premiere 15. mars 1997 på Scene 2; Teaterkritikerprisen for Mattis | [Sceneweb: Fuglane 1997](https://sceneweb.no/nb/production/46540/Fuglane), [DNT: Fuglane](https://www.detnorsketeatret.no/framsyningar/fuglane), [DNT: Ein ny Mattis i teaterhistoria](https://www.detnorsketeatret.no/bakgrunnsartiklar/ein-ny-mattis-i-teaterhistoria) |
| Britt Langlie | `Piaf` 29. november 1980 før flyttingen; fru Capuletti i åpningsproduksjonen `Romeo og Julie`, 19. september 1985; fru Johnstone i `Blodsbrør` 1989; mora i `Brand` 2015 | [FOREST: Britt Langlie](https://forest.detnorsketeatret.no/person/britt-langlie), [FOREST: Romeo og Julie 1985](https://forest.detnorsketeatret.no/produksjon/romeo-og-julie-1985) |
| Lasse Kolstad | Tevje i `Spelemann på taket` 1968, gamle scene; Håkon Hamre i `Skipper nest Gud` september 1985; Gamle Profetikus i `Cats` 9. november 1985, Hovudscenen; Tevje på ny i 1987 | [FOREST: Lasse Kolstad](https://forest.detnorsketeatret.no/person/lasse-kolstad), [FOREST: Cats 1985](https://forest.detnorsketeatret.no/produksjon/cats-19851109) |
| Ane Dahl Torp | Irina i `Andejakt` (Scene 2, 2002), Margaret i `Katt på heitt blekktak` 2007, Shen Te/Shui Ta i `Det gode menneske frå Sezuan` 2012 (Heddaprisen), scenetilrettelegging og spill i `Solaris korrigert` 2015 | [FOREST: Andejakt](https://forest.detnorsketeatret.no/produksjon/andejakt-20020905), [FOREST: Sezuan](https://forest.detnorsketeatret.no/produksjon/det-gode-menneske-fra-sezuan-20120113), [FOREST: Solaris korrigert](https://forest.detnorsketeatret.no/produksjon/solaris-korrigert-2015) |
| Henny Moan | `Måken` 1987, `Madame de Sade` 1989, `Oidipus` 1992, Doreen Chapell i `Sjeler i natta` (Prøvesalen) 2003, `Ad astra` 2007 | [FOREST: Henny Moan](https://forest.detnorsketeatret.no/person/henny-moan), [FOREST: Sjeler i natta](https://forest.detnorsketeatret.no/produksjon/sjeler-i-natta-2003) |
| Ragnhild Hilt | Ensemble 1971–2014; Laila i `Angerhøy` 2005, videoopptak som Bergers mor i `Hair` 2006, Kitty Kielland i `Brennande nesler` 2012, mor i `Bikubesong` 2013 | [FOREST: Ragnhild Hilt](https://forest.detnorsketeatret.no/person/ragnhild-hilt) |
| Jorunn Kjellsby | `Salka Valka` 1990–1991 (Teaterkritikerprisen), Ammen i `Romeo og Julie` 2001, Big Mama i `Katt på heitt blekktak` 2007, fru Yang i `Det gode menneske frå Sezuan` 2012 | [FOREST: Jorunn Kjellsby](https://forest.detnorsketeatret.no/person/jorunn-kjellsby), [FOREST: Katt på heitt blekktak](https://forest.detnorsketeatret.no/produksjon/katt-pa-heitt-blekktak-20070322) |

## Redaksjonell kontroll

- En feil ble fanget under kildeverifikasjonen: Kolstads Tevje-forestilling åpnet i **1968**, ikke i 1967; prisperioden 1967–1968 skal ikke forveksles med produksjonsdato. Feilen er rettet i canonical People og begge genererte visningsflater.
- Påstandsgrunnlag: det faktiske historiske FOREST-arkivet, teatrets egne artikler og Sceneweb. For samlingen Forestillinger er dette identifiserte **kandidater**, ikke publiserte medlemmmer. Eldre `Piaf` 1980 eller `Spelemann på taket` 1968 spilles ikke baklengs inn i huset fra 1985.
- `popupDesc`, `source_urls`, `externalLinks` og `verifiedAt` er de eneste tilsiktede nye canonical feltene. `desc`, `year`, `image`, `cardImage`, `placeId`, `category`, Places, quiz og Civication-data er uendret.
- FOREST-arkivfoto og Sceneweb-bilder er ikke importert, fordi tilgjengelighet på nettet ikke dokumenterer gjenbruksrett. Egne personportretter, samlingsgrafikk, korrekt frontbilde, Quiz og QuizCard er fortsatt åpne.

## Paritet og status

De avledede `data/runtime/people-all/part-*.json`-shardene er bygd om med eksisterende sorterings- og bytegrensekontrakt. Kildegrunnlaget omfatter alle **1 434** unike People i runtime og **87** people-relasjoner i teatrets place-open. Kontroll mot eksakt PR-head må bestå før merge.

C1–C5 gir **37 forskjellige kildegjennomgåtte av 87** People; **50 gjenstår**. Denne runden er en kilde- og datadelproduksjon, **ikke full ferdigstillelse** av Det Norske Teatret. `BLOCKED` beholdes til bilder, samlinger, QuizCard, quiz og brukerflate er faktisk ferdige.
