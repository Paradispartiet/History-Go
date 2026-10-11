# Arbeiderbladet / Dagsavisen – visuell sluttkontroll

Dato: 11. oktober 2026. Sted: `arbeiderbladet_youngstorget`.

## Avgrensning og kildegrunnlag

Denne sluttkontrollen gjelder visning av redaksjonsstedet i Folketeaterbygningen ved Youngstorget (Arbeiderbladet 1934–1988, med opphold under okkupasjonen 1940–1945). Arbeiderbladets `desc` og `popupDesc`, 32 verifiserte historiske claims og alle relevante kilde- og setningskoblinger fra [PR #6229](https://github.com/Paradispartiet/History-Go/pull/6229) er bevart uendret.

Tidligere closeout [PR #6214](https://github.com/Paradispartiet/History-Go/pull/6214) bygde på eldre main og ble ikke merget. De nødvendige rettelsene ble i stedet overført på en ren gren fra commit `da131e46c339ac56c6d909680717f922e1ebf28a`, uten å kopiere gammel beskrivelse eller eldre produksjonspakke.

## Funn og rettelser

1. Dagsavisens autentiske negative logo måtte få mørk kontrastflate og avstand til etiketten, også i mobilens Brand-forhåndsvisning.
2. Harald Stanghelles synlige People-teaser måtte dekke hans tid som journalist i Arbeiderbladet fra 1982 og tilflyttingsgrensen Youngstorget–Hasle 1988. Personclaims og genererte People-, Place-open- og Civication-indekser ble synkronisert fra kildedata.
3. Den lange Fagverk-tittelen klippet ord på trange skjermer. Stedsspesifikk container-beregning tilpasser tittelen til tekstkolonnens bredde.
4. `hovedorgan` var ikke synlig i Språkleksikon fordi oppføringen hadde feil type; canonical type er korrigert til `fagord`.
5. Første nye Chromium-kjøring fant ordsplitting i PlaceCard-tittelen på 320/390 px. Neste kjøring var teknisk grønn, men manuell inspeksjon av bildet avdekket at tittelen fortsatt kolliderte med lyd-/favorittikonene. En begrenset CSS-gridretting reserverer egen høyrekolonne for lyd, favoritt, People og Merker; siste kontroll viser ingen kollisjon eller isolert bindestrek. Det er ikke opprettet nye UI-funksjoner.

## Testbevis

- [Siste kjøring på 320/390/768/1440 px](https://github.com/Paradispartiet/History-Go/actions/runs/38175133599), eksakt test-head `fdff0f974170353837e9f765d8aa46bb05676394`, fullført med **success**.
- [Skjermbilder og maskinlesbar audit](https://github.com/Paradispartiet/History-Go/actions/runs/38175133599/artifacts/11716145205): 21 JPG-visninger + `visual-audit.json`. Bildene for begge mobilbredder, iPad, desktop, Brand-popup, People-popup og Fagverk ble åpnet og visuelt vurdert.
- Auditresultat: fire av fire profiler med `issues: []` og `pageErrors: []`; alle fem språkoppføringer til stede, tre samlinger, synlige kilder/datering for historisk faksimile, QuizCard-flip og utvidelse. Logoens bakgrunn målt som `rgb(32, 37, 49)`, avstand under forhåndsvisningen 34 px. Hvert ord i overskriften målte én sammenhengende tekstboks på alle fire bredder.
- 12 relevante GitHub Actions-workflows bestod ved dette test-headet, inkludert Data checks, TypeScript, Place-open, Fagverk, språk og Place Sheet. Regenererte filer ble kontrollert mot canonical eiere.
- Testen er utført i Linux Chromium med mobil-/iPad-profiler. Fysisk iPad og native Safari er ikke eksplisitt verifisert.

## Sluttvurdering

De registrerte stedsspesifikke avvikene er lukket etter både kjørbar test og manuell bildereview. Visuell kvalitet er **PASS**, med begrensningen om native Safari. Ingen funksjoner, nye fiktive historiske opplysninger eller global designendring inngår.

Arbeidsflyten kan registrere `manual_reviews.final_ui.status: PASS`, `blockers: []` og `state: complete`; de to V3-projeksjonene skal være avledet fra canonical workflow. Den midlertidige test-workflowen skal fjernes før merge. CI må bestå på endelig PR-head, med etterkontroll på `main`.
