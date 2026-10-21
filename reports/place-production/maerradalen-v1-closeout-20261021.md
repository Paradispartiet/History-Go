# Mærradalen – History Go v1 sluttkontroll (21.10.2026)

## Sted
Den eksisterende canonical Place-ID-en `maerradalen` bevares, med samme naturkategori og OSM-identitet. Dalen må ikke forveksles med Mærradalsbekken som hele vassdraget, Kolsåsbanens bro eller Husebyskogen.

## Produsert
- Stedshistorie med 3 korte og 24 lange setninger om forkastningsdal, bekk, Hovseters bekkelukking, usikre navneteorier, husmannsplassen Mærradalen, Kolsåsbanens bro, og dalens rike biologiske mangfold.
- v4.2.1 produksjonspakke med 27 kildeutsagn, SHA256-hasher, setningsdekning og kildeknyttet quizReadiness.
- Fullquiz med 21 spørsmål (3 × 7) og ett QuizCard med 10 spørsmål; samtlige 21 har generatorproduserte Knowledge-koblinger `linked`.
- Kuratert Fagverk: fire artikkelavsnitt, tre utforskningslinser, fire undersøkelsesspørsmål, seks begreper, to observerbare spor.
- To faktisk materialiserte, lokalt lagrede WebP-foto fra Wikimedia Commons, Kjetil Ree, CC BY-SA 3.0. Metadata med kilde, fotograf, cropping og kontrollsummer i `reports/place-production/maerradalen-v1-images-20261021.json`.
- Norsk kildehistorie oversatt til en/es/pt med oppdaterte source hashes; generert Knowledge, Fagverk-release, Place-open, epokeindeks og stedsindeks.
- Varig mobil/desktop-test `tests/maerradalen-v1-real-browser.mjs` og GitHub workflow `.github/workflows/maerradalen-v1-browser.yml`; fullquiz real-app runner `scripts/verify-ljanselva-fullquiz-browser.mjs maerradalen`.

## Siste godkjenningsport
På den nyeste PR-head må relevant GitHub CI og faktisk nettlesergjennomspilling ved 390 og 1440 px bestå: bilde, QuizCard etter fullført flip-animasjon, Fagverk, quiznavigasjon og 21/21 fasiter på begge bredder uten falsk fysisk innsjekking. Frem til grønt CI er dette et utkast, ikke en verifisert v1-avslutning. Midlertidige engangs-workflows fjernes før merge.

## Kildekrav
- `https://oslobyleksikon.no/side/M%C3%A6rradalen`
- `https://oslobyleksikon.no/side/M%C3%A6rradalsbekken`
- `https://lokalhistoriewiki.no/M%C3%A6rradalen_(Oslo)`
- `https://www.osloelveforum.org/om-maerradalsbekken/`
- `https://naturvernforbundet.no/content/uploads/2024/06/Grevlingen_2_2024_digital-url-konvertert.pdf`

Navneforklaringene er teorier og planregulert vern må ikke omtales som om hele dalen er naturreservat.
