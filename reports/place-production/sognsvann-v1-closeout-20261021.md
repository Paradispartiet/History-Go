# Sognsvann – History Go v1 sluttkontroll (21.10.2026)

## Omfang
Én eksisterende kanonisk fysisk innsjø: `sognsvann` (OSM relation 448255). Ingen duplikat av Sognsvannsbanen, treningsrunde eller gruveobjekter. Posisjon og innsjøgeometri er uendret.

## Ferdigstilt innhold
- Redaksjonell norsk fortelling om Sogneberg Jernbrug og gruvedrift, Morten Krabbes søknad i 1538, tidligere husmannsplasser, kommunalt vannverk og klorering, Sognsvannsbanen, krigstidens leir og overgangen til offentlig friluftsliv.
- Kildepakke `data/places/production/sognsvann.json` med **24 dokumenterte kildepåstander**, 3/3 korte og 20/20 lange setninger med claim-ID-er, korrekt SHA256 og reviewstatus `passed`.
- Kuratert Fagverk: 4 artikkelavsnitt, 3 linser, 4 undersøkelsesspørsmål, 6 begreper og 2 observerbare spor.
- 21 ulike kildedokumenterte fullquizspørsmål (3×7), **21/21** kanoniske Knowledge-linker og QuizCard med 10 av de samme spørsmålene.
- Oppdaterte en/es/pt-fortellinger, kildehash og ærlig maskinoversettelsesstatus.
- To lokalt lagrede, lisensierte WebP-fotografier av Ryan Hodnett (Wikimedia Commons, CC BY-SA 4.0): stående 600×800 og bredt 1400×900, med kilde, fotoår og SHA256. Både Place og place-open peker på lokale filer. `visualReview` dokumenterer faktisk nettleserrendering, ikke manuell kunstnerisk bildegranskning.
- Kanoniske Knowledge-, Fagverk-release-, place-open-, epoke- og stedskatalogdata regenerert etter kildetekstene.

## Reell appakseptanse
[GitHub Actions-kjøring #39658644514](https://github.com/Paradispartiet/History-Go/actions/runs/39658644514) – **bestått**. Permanent `tests/sognsvann-v1-real-browser.mjs` og `.github/workflows/sognsvann-v1-browser.yml`.

- Ved mobilbredden **390 px** og desktop **1440 px**: ekte History Go åpner riktig innsjø, norsk/oversatt historiefortelling, foto dekodes, QuizCard kan snus og leses etter animasjonen, tilstanden beholdes ved samme-steds rehydrering, quiznavigasjon virker og Fagverk viser 3 linser og 4 spørsmål.
- Faktisk gjennomspilling av **21/21 fullquizspørsmål**, 3/3 sett, både mobil og desktop; belønning og læringshendelser, ingen falsk fysisk innsjekking.
- Skjermbildebevis: `sognsvann-v1-permanent-browser-evidence` (artifact på ovennevnte kjøring).
- Fagverk-release, Place-open, kildepakke og bildebacklog ble synkronisert mot aktivt sted.

## Sluttport
GitHub CI på commit `e48162a1c3b8a54aadad30647be585be285f3195` bestod 17/17 relevante arbeidsflyter, inkludert `Epoch viewer quality`, `Fagverk and place learning` og virkelig browser-akseptanse. Endelig fotoreview-markør og denne sluttrapporten utløser en ny PR-kjøring; **merge bare hvis alle kontroller også består på endelig head**, og bekreft deretter merge-SHA på `main`.
