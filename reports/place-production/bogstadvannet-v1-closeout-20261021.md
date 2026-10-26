# Bogstadvannet – v1-sluttføring (21.10.2026)

## Avgrenset beslutningsgrunnlag
Dette gjelder bare den kanoniske innsjøen `bogstadvannet` mellom Oslo og Bærum, ikke Bogstad gård og ikke Bogstaddammen som særskilt kulturminne. Opprinnelig OSM-ankring, lat/lon, identitet, kategori og badges er bevart. Én PR: #6523.

## Faktisk levert innhold
- Kildebasert historisk fortelling om Fåd-/Fåvannet, tømmerfløting og roing over innsjøen, regulering ved Osdammen rundt 1869, Ossaga 1870–1913, steindemningen 1913, isuttak fram til 1930-årene og nyere friluftsbruk.
- Kildepakke v4.2: **21 kildepåstander**, 3 setninger i kortteksten og 23 setninger i hovedfortellingen med eksplisitt claim-dekning. Stedsidentitet, daterte og nåtidige påstander behandles separat.
- Kuratert Fagverk: egen artikkel, 3 undersøkelseslinser, 4 spørsmål, 2 observerbare spor og seks faglige begreper.
- Fullquiz: 3 × 7 = **21 distinkte spørsmål** med kilde, fasit og Knowledge-lenker. QuizCard: **10 spørsmål** som samsvarer med fullquizens fasit og kilder.
- Både `data/quiz/manifest.json` og `data/quizcards/natur/manifest.json` er registrert. Historisk stedsindeks, Fagverk-release, Knowledge, place-open og bildebacklog er synkronisert.
- Norske originaltekster og oppdaterte oversettelser på **engelsk, spansk og portugisisk**, med kontrollert `_sourceHash`.

## Fotoaksept
- Lokalt portrett: `bilder/places/bogstadvannet_front_portrait.webp` 600 × 800. Ekte foto av Steinar Midtskogen fra 2006, public domain. Kilde: https://commons.wikimedia.org/wiki/File:Bogstadvannet-20060527.jpg
- Lokal hero: `bilder/places/bogstadvannet_landscape.webp` 1400 × 900. Ekte foto av Øyvind Holmstad fra 2022, CC BY-SA 4.0. Kilde: https://commons.wikimedia.org/wiki/File:Tur_til_Oslo_og_Bogstad_sommeren_2022_-_Bogstadvannet_-_2.jpg
- Begge faktisk åpnet fra repositoryet, med passende utsnitt av selve innsjøen. Kreditering, transformasjon og sha256 for lokalfiler ligger i kildemetadata og `reports/place-production/bogstadvannet-v1-images-20261021.json`. Ingen rettighetsforespørsler er sendt.

## Ferdige tekniske kontroller
**GitHub Actions:** https://github.com/Paradispartiet/History-Go/actions/runs/39629018234 — `build-and-audit` bestått etter en korreksjon av kanonisk filsti for bildeaksepten.

Faktisk History Go-app `index.html` ble åpnet i Chromium, ikke en statisk mock:
- 390 px mobil: historiefortelling, portrett og hero, QuizCard med synlig tekst etter snuanimasjonen, Fagverk og quizrute bestått.
- 1440 px desktop: samme kontroller bestått.
- **Alle 21 fullquiz-spørsmål** ble spilt og bestått på *begge* bredder, tre sett fullført, belønning registrert og ingen falsk fysisk besøksregistrering.
- Knowledge canonical build/check fullført med 0 feilspørsmål; i18n-ferskhet kontrollert for en/es/pt, Fagverk-release og place-open synkronisert.
- Testfiler beholdt: `tests/bogstadvannet-v1-real-browser.mjs` og `scripts/verify-bogstadvannet-fullquiz-browser.mjs`.

## Siste mergeport
Første selvoppdaterende workflow-commit kom fra GitHub Actions og utløste `action_required` i pull_request-arbeidsflyter; dette teller **ikke** som grønne kontroller. PR-en skal først merges når **reelle GitHub Actions-jobber på siste head** er bestått. Merk da PR Ready, squash-merge til main og kontroller main-SHA.

Denne avslutningen gjelder **v1**, ikke full V3/vFerdig. READ-FIRST-rapporten er bevisst historisk nullmåling, ikke sann status for senere leveranser.
