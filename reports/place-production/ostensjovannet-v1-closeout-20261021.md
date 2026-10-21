# Østensjøvannet – v1-aksept og sluttdokumentasjon (21.10.2026)

## Beslutningsgrunnlag
Én produksjonsgren, PR #6522. Avgrenset sted `ostensjovannet` i Oslo (Miljødirektoratets vernegeometri VV00000972), ikke et homonym i Ås. Gamle vernekartankre og koblet flora/fauna er bevart. Leveransen er en v1-historiefortelling, **ikke full V3/vFerdig**.

Kanonisk innsjøtekst forteller om boligveksten etter krigen, billøp på isen, menneskeskapte fugleøyer 1960–65, organisering for vern 1983/1988, reservatvedtaket 2. oktober 1992 og vedtaket om større miljøpark i 2002.

## Innhold
- Kilde- og setningsrapport `data/places/production/ostensjovannet.json`: 27 claims, tre `desc`-setninger og 19 `popupDesc`-setninger koblet til identifiserte kilder.
- Kuratert stedseid Fagverk (nivå `standard`), fire undersøkelsesspørsmål, tre undersøkelseslinser, to observerbare spor og et læringsorientert begrepsapparat.
- Fullquiz `data/quiz/natur/ostensjovannet_sets.json`: 21 forskjellige kildekoblede spørsmål i tre sett à sju.
- QuizCard `data/quizcards/natur/topp10_natur_ostensjovannet_20261021.json`: ti spørsmål hentet fra nøyaktig samme fullquiz, med samsvarende svar og kilder.
- Genererte Knowledge-ID-er, norsk + nye engelske/spanske/portugisiske fortellinger, generert Fagverk-release og place-open, epokeindeks og bildeoversikt.

## Fotografier
- `bilder/places/ostensjovannet_front_portrait.webp`, ekte fotografi av Kjetil Ree, 24.06.2008, CC BY-SA 3.0, 600×800, mot Abildsø med innsjøflate i midten og by-/skoglandskap rundt.
- `bilder/places/ostensjovannet_landscape.webp`, ekte fotografi av Kjetil Ree, 25.05.2008, CC BY-SA 3.0, 1400×900, siv, innsjø, fugler og høyblokkene på Bøler. Godt eksempel på byutvikling langs sårbar våtmark.
- Begge lokale WebP-er er visuelt inspisert som faktiske filer og automatisk godkjent etter nettlesertest; dette gjelder v1, ikke full bildesamling.
- Bildekreditering og konverteringsinformasjon: `reports/place-production/ostensjovannet-v1-images-20261021.json`, `frontImageMeta`, `imageMeta`.

## Faktisk nettlesertest
GitHub Actions `Temporary Østensjøvannet v1 source sync and real browser QA`, vellykket kjøring https://github.com/Paradispartiet/History-Go/actions/runs/39624427845.
- Reell app, `index.html` og steddata ved **390 og 1440 px**, lokalt fotomotiv og hero, korrekt oversatt historiefortelling.
- QuizCard flip kontrolleres etter 800 ms, innholdstekst og synlig flate kontrolleres, samt at samme-sted åpning ikke mister kortet.
- Real-app fullquiz gjennomspilles **21/21 spørsmål på begge bredder**, med progresjon, én unlock, uten falskt fysisk besøk.
- Fagverk-siden åpnes med riktig tittel, fire spørsmål, tre linser og ingen appfeil.
- Bevis: `tests/ostensjovannet-v1-real-browser.mjs` og `scripts/verify-ostensjovannet-fullquiz-browser.mjs`, skjermbilder og rapport som Actions-artifact.

## Rettslig kildegrense
Verneforskriften datert 1992 behandles som kilde til det **historiske** vernevedtaket. Statsforvalterens 2026-utkast er et høringsforslag, ikke dokumentasjon på en ikraftsatt erstatningsforskrift. Någjeldende ferdselsregler bør ikke sluttes fra et utkast.

## Endelig mergeport
GitHub Actions for den forrige, bot-forfattede `7dc47834`-commiten kunne være `action_required`. **Bare beståtte, faktisk kjørte relevante CI-jobber på siste PR-head gir merge.** Da markeres #6522 Ready og merges til main med eksakt SHA-kontroll, og merge-commit kontrolleres mot main. Ingen parallell branch. Neste sted etter vellykket merge: Bogstadvannet.
