# Vettakollen – History Go v1 sluttkontroll, 21.10.2026

## Omfang og identitet
Kanonisk Place `vettakollen` fra eksisterende OSM peak node 301173327, uten nye koordinater, aliaser eller parallell stedsmodell. Toppens høyde oppgis som 418 meter i Oslo byleksikon og 419 meter hos SNL; det populære utsiktspunktet på ca. 378 meter er fysisk et annet punkt lenger sør.

## Produsert på PR #6542
- Engasjerende norsk historiefortelling om vardeplassen, den historiske kobberdriften 1704–1714, baneåpning 1898, stasjonsbygg 1907, postkontor 1989 og dagens turterreng mot Fuglemyra.
- V4.2.1 med 25 kildepåstander, 3+24 kildebelagte setninger, to SHA256-verifiserte tekster, redaksjonell kildekontroll og fire quizspørsmålstyper.
- Fagverk med fire artikler, tre perspektiver, fire spørsmål, seks begreper og to observerbare spor. Kapittel-ID for geologi er kanonisk `geologi_landskap_tid`.
- 21 fullquizspørsmål i 3 sett à 7, 10 QuizCard-spørsmål og 21 kanoniske Knowledge-koblinger.
- To lokale dokumentarfoto (WebP): Anders Beer Wilse fra Holmendammen (1929, CC BY-SA 3.0) og utsikten fra Vettakollen, ukjent fotograf (1920-årene, offentlig eie/PD-Norway). Fotograf, lisens, originale dimensjoner, utsnitt og SHA256 dokumentert i `reports/place-production/vettakollen-v1-images-20261021.json`.
- Oversettelser en/es/pt med korrekt kildehash, synkronisert Fagverk-release, Place-open, epokeindeks, stedskatalog og Knowledge.
- Reell mobil/desktop-app-test og gjennomspilling av hele quizen; permanent regress i `tests/vettakollen-v1-real-browser.mjs` og `.github/workflows/vettakollen-v1-browser.yml`.

## Kvalitetsporter
- Bildegenerering og kildebasert data-/oversettelsesgenerering bestått i GitHub Actions.
- Browser-test 390/1440 px, QuizCard etter snuanimasjon, Fagverk og 21/21 fullquiz på begge bredder: PASS på commit `16546531a3` (https://github.com/Paradispartiet/History-Go/actions/runs/39671777459).
- Særskilt kildeskjemakontroll og Fagverk-audit korrigert og bestått på `525ca84942` via https://github.com/Paradispartiet/History-Go/actions/runs/39672487254.
- **Endelig v1-status betinget av 18/18 relevante grønne CI-kontroller på nyeste PR-head etter opprydding.** Ikke merge før dette er kontrollert.
