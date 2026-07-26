# History GO — uavhengige læringsspill

Status: **operational architecture guide**
Sist kontrollert: **2026-07-26**

Dette dokumentet beskriver grensen mellom History GO, profil/AHA, Civication og de uavhengige læringsspillene. Det maskinlesbare registeret eier hvilke spill som finnes og deres oppgitte status.

## Autoritetsrekkefølge

1. `data/historygo/shared/game_registry.json` eier spill-ID-er, navn, status, entry-paths og deklarerte read/write-flater.
2. `js/historyGoGameRegistry.js` eier lasting og rendering av spillkort i profilen.
3. `profile.html` eier profilens Spill-fane og runtime-innlasting.
4. `tests/history-go-game-registry.test.js` validerer register, profiltilkobling og renderer.
5. Hvert spillrepo eller lokal spillmodul eier sin egen motor, state og faktiske progresjonsadapter.

Ved konflikt gjelder registeret, runtime og den spillspesifikke implementasjonen.

## Låst uavhengighetsregel

```text
History GO eier felles samlinger og registeret.
Profil/AHA viser læringsidentitet og samlet status.
Civication kan lenke til og lese avgrensede resultater.
Civication skal ikke være spillmotor, datakildeeier eller progresjonseier.
Hvert spill skal kunne kjøre uten Civication.
```

## Registrerte spill

På kontrolltidspunktet inneholder registeret fem spill:

| gameId | Spill | Registrert status |
| --- | --- | --- |
| `hgFootballManager` | HG Football Manager | `external_scaffold` |
| `hgFilmProducer` | HG Film Producer | `data_scaffold` |
| `hgArtSchool` | Kunstskolen | `data_scaffold` |
| `hgChildrenLiteratureGame` | Barnebokakademiet | `data_scaffold_v1` |
| `hgWritingAcademy` | Skrivekunstakademiet | `external_scaffold` |

Statusverdiene er registerstatus, ikke en garanti for full spillbarhet, komplett adapter eller produksjonsklar synkronisering.

## Felles History GO-lag

Registeret deklarerer delte samlinger som spill kan lese:

```text
places
people
works
institutions
routes
badges
objects
relations
```

Nye felles samlinger skal bare legges til når de faktisk finnes som en avgrenset History GO-kilde. Spill skal ikke kopiere hele place-, people- eller knowledge-modellen inn i egne parallelle sannheter.

## Profil- og write-grense

`writesBackToProfile` i registeret beskriver hvilke profilområder et spill er ment å kunne påvirke. Feltlisten implementerer ikke lagring i seg selv.

Faktisk write-back krever:

1. spillspesifikk state og validering;
2. en eksplisitt adapter til History GO/profil;
3. idempotent eller dokumentert merge-atferd;
4. test av at ett spill ikke overskriver et annet spills state;
5. profiloppdatering etter vellykket write.

Etter en vellykket progresjonsendring skal spillet sende refresh-signalet:

```js
window.dispatchEvent(new Event("updateProfile"));
```

Eventet er et oppdateringssignal. Det er ikke selve dataskrivingen og skal ikke brukes som bevis på at en adapter finnes.

## Profilflaten

`historyGoGameRegistry.js`:

- laster registeret med `cache: "no-store"`;
- normaliserer den eldre `civication`-nøkkelen til `spill` for Spill-fanen;
- renderer ett kort per registrert spill;
- åpner eksterne spill med `noopener noreferrer`;
- viser registerstatus og antall deklarerte read/write-felter.

Profilflaten skal ikke hardkode en separat spilliste. Nye eller fjernede spill skal komme fra registeret.

## Rettighetsregel

Spill kan bruke navn, titler, historiske fakta, steder, institusjoner, tema, formgrep, epoketrekk, public-domain-materiale og brukerens egne verk.

Spill skal ikke importere eller gjengi opphavsrettsbeskyttet boktekst, filmmanus, bilder eller kunstverk som treningsdata eller oppgaveinnhold uten dokumentert rettighetsgrunnlag. Private Goodreads-felt skal ikke eksponeres gjennom registeret eller profilflaten.

## Endringsflyt

Når et spill legges til eller endres:

1. oppdater `data/historygo/shared/game_registry.json`;
2. verifiser `gameId`, status og `entryPath`;
3. dokumenter reelle read- og write-avhengigheter;
4. oppdater spillspesifikk adapter og tester;
5. oppdater `tests/history-go-game-registry.test.js` dersom den forventede registerlisten endres;
6. kontroller profilen manuelt.

## Validering

```bash
node tests/history-go-game-registry.test.js
```

Registeret er den delte katalogen. Spillbarhet, progresjon og lagring må fortsatt bevises i hvert spill.
