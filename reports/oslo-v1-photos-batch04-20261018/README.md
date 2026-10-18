# Oslo – Ankerbrua, Hausmannsbrua og Hausmania

Tre steder har ni separate lokale WebP-filer og oppdatert canonical Place, lettindeks og place-open-runtime. Dette er bildeleveranse, ikke ny fullproduksjon av de eksisterende stedene.

[Kontaktark: hero, portrett og kort for alle tre](contact-sheet.jpg).

| Sted | Motiv | Fotograf / rettighet |
| --- | --- | --- |
| Ankerbrua | Samme dokumentarfoto fra 2008 beholdt; tre formatutsnitt viser brospenn og elverom. | Mahlum, [Commons-original](https://commons.wikimedia.org/wiki/File:Ankerbrua_Oslo.jpg), public domain |
| Hausmannsbrua | Nordside og buekonstruksjon fra 2011 erstatter den tidligere lille hovedbildekilden. | Helge Høifødt, [Commons-original](https://commons.wikimedia.org/wiki/File:Hausmanns_bru_north_side.jpg), CC BY-SA 3.0 |
| Hausmania | Fargerik fasade mot gangveien ved Akerselva, fotografert i 2017. | Hellando, [Commons-original](https://commons.wikimedia.org/wiki/File:Hausmania_fasade.jpg), CC BY-SA 4.0 |

Hero er 1400×900, portrett er 900×1350 og kort er 900×600. Hvert format har eget utsnitt. Hausmania-portrettet er en fasadedetalj; hele bokstavskiltet ligger i hero-/kortutsnittet. Bildedatoene vises i bildetekst og metadata, og bildene beskrives ikke som fotografier tatt i 2026. Tidligere bildefiler og Før–etter-par beholdes på sine egne filstier.

## Utført kontroll

[Produksjon og målrettet Chromium-kontroll](https://github.com/Paradispartiet/History-Go/actions/runs/39161850902) bestod. Alle tre kildene ble kontrollert mot Commons' fotograf- og lisensmetadata før nedlasting. Kildestørrelser, kilde-URL, fotograf, lisenslenke, filstier og utsnitt er registrert i [produksjonsrapporten](report.json) og i hvert steds bilde-/portrett-/kortmetadata.

[Maskinlesbar nettleserrapport](browser-report.json): **6/6 består**, tre steder ved 390 og 768 px. Appen lastet de riktige bildene, brukte de lagrede fokuspunktene og viste hele PlaceCard-tittelen. Faktisk klikk snudde hvert kort til en QuizCard med innhold. Ingen app-feil eller blokkere ble registrert. Alle 18 app-skjermbildene (hero, portrett og QuizCard ved begge bredder) og alle ni kildeutsnittene er gjennomgått visuelt. Skjermbildene finnes i workflow-artifaktet `oslo-batch04-photo-review`.

Dette er én målrettet kjøring for de tre berørte stedene. Det er ikke gjennomført ny full katalog- eller nettleserregresjon for tidligere godkjente bilder. Fysisk mobil er ikke kontrollert; `v1_candidate` og fullproduksjonsstatus er uendret.

## Reproduksjon av quizkontekst

Bildestiene og bildemetadataene inngår i Place-filens og lettindeksens deterministiske kontrollsummer. Etter materialisering regenereres derfor bare de tre berørte quizkontekstene:

```bash
node scripts/build-quiz-production-context.mjs --category by --target ankerbrua --output data/quiz/production_context/by/ankerbrua.json
node scripts/build-quiz-production-context.mjs --category by --target hausmannsbrua --output data/quiz/production_context/by/hausmannsbrua.json
node scripts/build-quiz-production-context.mjs --category subkultur --target hausmania --output data/quiz/production_context/subkultur/hausmania.json
```

Diffen endrer bare `bytes`/`sha256` for target og `selection_bytes`/`selection_sha256` for indeksutvalget i hvert kontekstarkiv. Ingen spørsmål, kildeclaims eller quizprofiler endres. Alle ni WebP-filer er separat dekodet og kontrollert mot eksakte dimensjoner; canonical, indeks og runtime peker på samme filer, og alle ni rettighetsregistreringene samsvarer.

## To åpne bildesaker

| Sted | Det som mangler | Neste nødvendige kilde |
| --- | --- | --- |
| Alna ved Smalvoll | Et gjenbrukbart foto som er sikkert stedfestet til den aktuelle Smalvoll-korridoren. Bilder fra Svartdalen, Alnaparken eller Brynfossen erstatter ikke dette stedet. | Et stedfestet, lisensiert elve-/korridorfoto eller eget fotografi fra området. |
| Torggata Blad | Dagens eiendomsfoto av Hausmanns gate 19 er bare registrert som offisiell redaksjonell referanse. Den registreringen dokumenterer ikke en fri gjenbrukslisens. | Dokumentert tillatelse eller et lisensiert fotografi av den faktiske historiske adressen. |

Commons-kategoriene for Alna og Hausmanns gate samt søk etter Smalvollen og Hausmanns gate 19 gav ikke en bekreftet løsning i denne bolken. Det er et avgrenset søkeresultat, ikke bevis for at egnede bilder ikke finnes. De to sakene beholdes åpne uten å blokkere de tre bildeleveransene.

Produksjonsbolken på 21 steder har dermed **19 steder med lokale bildesett og registrerte rettigheter**, og **2 åpne foto-/rettighetssaker**. Dette tallet er ikke et antall endelig godkjente v1-steder.

## Kvalitetsvurdering for bildeleveransen

| Dimensjon | Score | Evidens |
| --- | --- | --- |
| Korrekthet og evidens | 5/5 | Tre Commons-originaler, fotograf/lisens kontrollert før nedlasting; filbindinger og opptaksår er sporbare. |
| Dekning og ferdigstillelse | 5/5 | Alle tre valgte steder har tre varianter og synkronisert canonical/indeks/runtime. To kildehold er eksplisitt utenfor denne leveransen. |
| Redaksjonell kvalitet | 4/5 | Alle ni utsnitt og seks app-visninger vurdert. Hausmania-portrettet er bevisst en detalj; broenes hovedkonstruksjon beholdes. |
| Teknisk integritet | 4/5 | Seks av seks Chromium-visninger og QuizCard-klikk består; fysisk mobil er ikke kontrollert. Ordinær merge følger PR-porten. |
| Sikkerhet og ansvarlighet | 5/5 | Fotograf, lisens, endringer og dato er dokumentert; ingen lånt nabomotiv eller udokumentert rettighetsgodkjenning. |
| Vedlikeholdbarhet og etterprøvbarhet | 5/5 | Reproduserbart kilde-/utsnittsskript, uforanderlige filstier, rapport og skjermbilder. Gjentatt materialisering stoppes før overskriving. |

**28/30 for bildeleveransen.** Redaksjonell gjennomgang og målrettet visningskontroll er godkjent. Publisering følger ordinær grønn PR-head.
