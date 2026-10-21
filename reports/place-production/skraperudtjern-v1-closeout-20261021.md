# Skraperudtjern – History Go v1 sluttkontroll (21.10.2026)

## Omfang
Én canonical plass: Skraperudtjern mellom Rustadsaga og Skullerudstua; eksisterende koordinater, vanngeometri og kategori beholdt. Dette er avgrenset **v1**, ikke V3/vFerdig. Samme produksjonsgren og PR #6530 hele veien.

## Produsert
- Norsk stedshistorisk fortelling om middelaldergården Skraperud, sagbruk og vannkraft ved Rustadsaga, sagflisavsetninger, overgang til dampkraft 1914 og senere bading. Historiske bunnavsetninger fremstilles ikke som synlige fra turstien.
- Kildepakke 4.2.1 med **26 kildepåstander**, sted- og omfangskontrakt, SHA256-hasher, full kildekobling til **3 + 22 setninger** i kort og lang fortelling, godkjente historiske spørsmålstyper. Eksterne kilder: Oslo byleksikon, Oslo Elveforum, Østensjø historielag, Skiforeningen og lokalhistoriske bildeposters tekstmetadata.
- Kuratert Fagverk-artikkel med **3 linser, 4 spørsmål, 6 begreper og 2 observerbare spor**.
- **21 fullquiz-spørsmål (3 × 7)** med fasit, kilder og Knowledge-tilknytning; **10 QuizCard-spørsmål** fra de samme faktakontrollerte spørsmålene.
- Oppdatert engelsk, spansk og portugisisk historiefortelling og oppdatert norsk kildehash. Oversettelsene er foreløpig merket \`machine_translated\`, ikke feilaktig som menneskelig språkvask.
- Lokalt stående WebP-foto **600 × 800** (vinter ved Skraperudtjern, Kjetil Ree 2021, CC BY-SA 3.0) og bredt WebP-foto **1400 × 900** (sommer ved Skraperudtjern, Kjetil Ree 2008, CC BY-SA 3.0). Kilde, transformasjon, dimensjoner og SHA256 dokumentert i \`reports/place-production/skraperudtjern-v1-images-20261021.json\`. Ingen bilde fra lokalhistorisk bildesamling ble brukt uten tillatelse.
- Generert og synkronisert Knowledge, Fagverk-release, place-open, stedskatalog, epokeindeks og bildebacklog fra kanoniske filer.

## Reell appkontroll
GitHub Actions: https://github.com/Paradispartiet/History-Go/actions/runs/39647594458 – **bestått**.

- 390 px: riktig sted og historisk engelsk fortelling, lokalt portrett lastet, QuizCard tekst synlig etter snuanimasjon, Fagverk tilgjengelig, quiz-rute fungerer.
- 1440 px: samme kontroller bestått.
- Fullquiz: **21/21 spørsmål** spilt riktig på **begge skjermbredder**, 3/3 sett, belønning/læringslogg registrert, **ingen falsk fysisk innsjekking**.
- Varige kontroller: \`tests/skraperudtjern-v1-real-browser.mjs\` og \`scripts/verify-ljanselva-fullquiz-browser.mjs skraperudtjern\`. En egen permanent GitHub Actions-jobb kjører disse ved senere relevante endringer.
- Browserbevis: \`skraperudtjern-v1-actual-app-qa\` fra godkjent GitHub Actions-kjøring med skjermbilder og quizrapport.

## Endelig mergeport
Etter at denne sluttrapporten og varig test-workflow er lagt inn, må alle **relevante CI-kontroller på nyeste PR-head** være reelt grønne. Bare da settes PR Ready og merges til \`main\`; merge-SHA og main verifiseres. Ikke bypass av CI og ikke ny parallell stedgren.

## Andre sluttkontroll etter samordning med main

GitHub Actions https://github.com/Paradispartiet/History-Go/actions/runs/39648898507 er **bestått**, inkludert regenerering av globale Knowledge-/Fagverkdata fra oppdatert `main`, og ny faktisk History Go-gjennomspilling på 390 og 1440 px med 21/21 fullquizspørsmål. Nye Poland-fagpakker fra main er bevart. Den midlertidige synkroniserings-workflowen fjernes; varig Skraperudtjern-browserworkflow beholdes.

## Kanoniske Knowledge-koblinger

Alle **21/21** fullquiz-spørsmål har nå generatorproduserte `primary_knowledge_unit_id` / `knowledge_unit_ids` og `knowledge_link_status=linked`. Egen genereringsjobb https://github.com/Paradispartiet/History-Go/actions/runs/39650487505 bestod `knowledge:canonical:check` og skrev det kildeforankrede resultatet tilbake til samme PR. Den midlertidige engangs-workflowen er fjernet før slutt-CI.
