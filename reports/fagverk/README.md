# Fagverket — inventar, status og runtime-audits

Status: **reproduserbare operative rapporter**  
Canonical kontrakt: [`docs/FAGVERK.md`](../../docs/FAGVERK.md)  
Maskinlesbart inventar: [`data/fagverk/subject_inventory.json`](../../data/fagverk/subject_inventory.json)  
Maskinlesbar status: [`data/fagverk/subject_status.json`](../../data/fagverk/subject_status.json)

Denne mappen eier ikke fagarkitekturen eller betydningen av ferdigstatusene. Den inneholder deterministiske rapporter som viser hva repositoryet faktisk kan dokumentere.

## Rapporter

- `subject-baseline.json` — levende projeksjon av 17 toppfag, én Teknologi-spesialisering, fire schemafamilier, 72 required kjernefiler og gjeldende navigasjons-, audit- og redaksjonell status.
- `general-engine-audit.json` — evidens for den felles fagsidemotoren, manifest-first lasting, adaptergrensen, normalisert modell og fravær av politikkfallback.
- `kunst-phase3-audit.json` — individuell Fase 3-gate for Kunst: seks canonicale fagområder, 21 aktive emner, 21 metoder, 21 mappinger og 60 hooks uten syntetiske fagområder eller overrapporterte kapitler.
- `media-phase3-audit.json` — individuell Fase 3-gate for Media: seks hovedområder, 120 aktive hovedemner, 163 samlede metoder, 120 mappinger og 60 hooks, samt Populærkultur som komplett nested mediefelt med 56 emner uten konkurrerende toppfag.
- `psykologi-phase3-audit.json` — individuell Fase 3-gate for Psykologi: seks canonicale fagområder, 58 aktive emner, 58 metoder, 58 mappinger og 60 hooks, med full emnedekning og eksplisitt vern mot diagnostisering av enkeltpersoner.
- `by-pilot-audit.json` — individuell fase-2-gate for By som `by_compatibility`: tolv fagkart-eide fagområder, 82 source-emner, 14 canonicale metoder, 81 hooks og kurs-/curriculum-moduler som separate progresjonslag.
- `by-byliv-offentlige-rom-phase4-audit.json` — første Fase 4-kapittelgate for By: sju Byliv-emner, tre metoder, tre moduler, ni seksjoner, 18 verified claims og 12 inspectable kilder med full avsnittssporing.
- `by-byliv-sosial-offentlighet-phase4-audit.json` — andre Fase 4-kapittelgate for By: sju Byliv-emner, tre metoder, tre moduler, ni seksjoner, 18 verified claims og 12 gjenbrukte inspectable institusjonelle kilder med låst kildeproveniens.
- `by-byliv-hendelser-midlertidighet-phase4-audit.json` — tredje Fase 4-kapittelgate for By: seks Byliv-emner, fire metoder, tre moduler, ni seksjoner, 18 verified claims og 13 inspectable kilder med temporal status-guard og eksplisitt pilot≠permanent-effekt.
- `by-byliv-stemning-mikrokomfort-phase4-audit.json` — fjerde Fase 4-kapittelgate for By: fem Byliv-emner, fem metoder, tre moduler, ni seksjoner, 18 verified claims og 13 inspectable kilder med målefabrikasjons- og evidenslagvakt.
- `vitenskap-pilot-audit.json` — sluttport for fase 2: seks Vitenskap-fagområder med 93 integrerte emner, 84 metoder, 93 mappinger og 60 hooks, samt Teknologi som nested `technology_scientific_v2_4`-spesialisering med 12 områder, 48 emner, 35 metoder og 36 hooks.
- `musikk-subject-audit.json` — flerkapittelgate for Musikkvitenskap med exact canonical domene-, emne-, metode-, claim- og kildeprojeksjon fra frigitt fulltekstevidens.
- `historie-subject-audit.json` — individuell strukturaudit for Historie gjennom standard canonical-adapteren.
- `natur-pilot-audit.json` — individuell utbyggingsevidens for Natur: canonical tolvdelsrekkefølge, 65 emner, 45 metoder, 65 mappingrader, 110 hooks og 11 redigerte lærekapitler.
- `religion-pilot-audit.json` — individuell fase-2-gate for Religion som `foundation_v1`: fire fagkart-eide fagområder, åtte aktive emner, åtte canonicale metoder, tre pensummoduler som progresjonslag og eksplisitte representasjonsprinsipper.
- `scenekunst-phase3-audit.json` — individuell Fase 3-gate for Scenekunst som `foundation_v1`: fire fagkart-eide fagområder, åtte aktive emner, ni canonicale metoder, åtte mappinger, null syntetiske hooks og tre pensummoduler som separat progresjonslag.
- `sport-phase3-audit.json` — individuell Fase 3-gate for Sport: seks canonicale fagområder, 116 aktive emner, 109 metoder, 116 mappinger og 60 hooks med bevart Knowledge- og Groundhopper-logikk.
- `filosofi-phase3-audit.json` — individuell Fase 3-gate for Filosofi: 13 områder, 54 emner, 27 metoder, 37 hooks, 162 begreper og 157 teoretikeroppføringer med referanseintegritet.
- `film-tv-phase3-audit.json` — individuell Fase 3-gate for Film & TV: seks områder, 120 emner, 107 metoder, 120 mappinger og 60 hooks med audiovisuelle source-first- og kategorigrenser.
- `natur-quality-audit.json` — emne-, metode-, quiz-, Knowledge- og merkesidekvalitet for Natur & miljø.
- `natur-fagkart-quality-audit.json` — kvalitets- og referansegate for alle 110 Natur-hooks og 65 emner, inkludert egne fagkartlag for artskunnskap, evolusjon, botanikk, zoologi og fysiologi.
- `natur-universal-coverage-audit.json` — dokumenterer hvilke biologiske og geologiske fagområder som må materialiseres før Natur kan bli redaksjonelt komplett.
- `naeringsliv-makt-regulering-baerekraft-audit.json` — deterministisk sluttkapittelgate for tre emner, elleve metoder, tre moduler, 42 claims og 22 inspectable kilder.
- `naeringsliv-logistikk-infrastruktur-okonomisk-rom-audit.json` — deterministisk kapittelgate for tre emner, ni metoder, tre moduler, 42 claims og 22 inspectable kilder.
- `naeringsliv-teknologi-innovasjon-plattformer-audit.json` — deterministisk kapittelgate for sju emner, ti metoder, tre moduler, 42 claims og 22 inspectable kilder.
- `naeringsliv-handel-forbruk-marked-audit.json` — deterministisk kapittelgate for fem emner, elleve metoder, tre moduler, 54 claims og 25 inspectable kilder.
- `naeringsliv-kapital-eierskap-finans-audit.json` — deterministisk kapittelgate for ni emner, fjorten metoder, tre moduler, 40 claims og 20 inspectable kilder.
- `naeringsliv-arbeid-produksjon-verdiskaping-audit.json` — deterministisk kapittelgate for ni emner, nitten metoder, tre moduler, 40 claims og 20 inspectable kilder.
- `naeringsliv-specialization-chapters-audit.json` — samlet permanent fullkapittelgate for seks fordypninger, 54 seksjoner, 162 fagavsnitt, 162 claims og 54 inspectable kilder.
- `naeringsliv-quality-audit.json` — deterministisk materialiserings- og kvalitetsgate for seks fagområder, tolv kapitler, 38 emner, 27 metoder, 60 hooks, seks akademiske spor og fem profesjonsspor med 25 moduler.
- `politikk-quality-audit.json` — deterministisk kvalitetsgate for 13 fagområder, 123 emner, 71 metoder, 123 mappingrader, quiz, Knowledge, merke og Fagverk-visning.
- `politikk-thinker-integrity-audit.json` — kontrollerer at alle Politikk-tenker-ID-er har ett canonicalt visningsnavn og at alle forekomster er synkronisert.
- `politikk-forvaltning-audit.json` — kapittelgate for 15 emner, 21 metoder, tre redigerte moduler, 36 sporede claims og 24 inspectable kilder.
- `politikk-parlamentarisme-audit.json` — kapittelgate for 14 emner, 23 metoder, tre redigerte moduler, 36 sporede claims og 30 inspectable kilder.
- `subkultur-baseline-audit.json` — låst gaprapport for Subkultur: 6/8 eksisterende domener, 72/80 emner, 69/80 mappinger, 0/8 kapitler og eksplisitte teori-, runtime-, case-, People-, Quiz- og Knowledge-hull før materialisering.
- `subkultur-foundation-audit.json` — levende integritetsgate for åttedomenefoundationen: 80 emner og hooks, 43 operative metoder, 80 mappinger, 72/72 semantisk stabile legacy-ID-er og åtte eksplisitt godkjente nye ID-er.
- `subkultur-evidence-audit.json` — permanent teori-/evidensgate for 80/80 teoriobjekter, 160 canonicale claims, 23 kuraterte kilder, eksplisitte evidenslenker og casekrav med stemmebalanse, personvern og stigmavern.
- `subkultur-chapters-audit.json` — permanent kapittel- og profilgate for åtte kapitler, 24 moduler, 72 seksjoner, 216 unike fagavsnitt, 160 claimkoblinger, 48 stedskoblinger og tre geografiske profiler med eksplisitt caseutfall.
- `subkultur-case-evidence-audit.json` — permanent casekildegate som krever ready A–H-rapport, miljønær kilde, uavhengig kontroll, alle fem casekrav, eksplisitt slutningsgrense og etikkport før en profilkandidat kan få `validated_case`.
- `politikk-regimer-institusjoner-audit.json` — kapittelgate for 15 emner, 16 metoder, tre redigerte moduler, 29 sporede claims og 16 inspectable kilder.
- `politikk-valg-partier-velgeratferd-audit.json` — kapittelgate for 5 emner, 5 metoder, tre redigerte moduler, 33 sporede claims og 23 inspectable kilder.
- `politikk-offentlig-politikk-beslutning-implementering-audit.json` — kapittelgate for 5 emner, 5 metoder, tre redigerte moduler, 33 sporede claims og 21 bærende kilder.
- `politikk-internasjonal-politikk-sikkerhet-samarbeid-audit.json` — kapittelgate for 5 emner, 4 metoder, tre redigerte moduler, 34 sporede claims og 21 inspectable kilder.
- `politikk-politisk-okonomi-stat-marked-audit.json` — kapittelgate for 5 emner, 4 metoder, tre redigerte moduler, 34 sporede claims og 25 inspectable kilder.
- `politikk-statsvitenskapelig-metode-og-sammenligning-audit.json` — kapittelgate for 5 emner, 5 metoder, tre redigerte moduler, 36 sporede claims og 25 inspectable kilder.
- `politikk-norsk-politikk-eos-eu-flernivastyring-audit.json` — kapittelgate for 12 emner, 6 metoder, tre redigerte moduler, 46 sporede claims og 34 inspectable kilder.
- `politikk-rett-lov-rettssikkerhet-audit.json` — kapittelgate for 11 emner, 15 metoder, tre redigerte moduler, 44 sporede claims og 30 inspectable kilder.
- `politikk-fordeling-velferd-ulikhet-audit.json` — kapittelgate for 9 emner, 15 metoder, tre redigerte moduler, 45 sporede claims og 30 inspectable kilder.

## Regenerering

```bash
node scripts/audit-fagverk-subject-inventory.mjs --write-report
node scripts/audit-fagverk-subject-inventory.mjs
node scripts/audit-fagverk-general-engine.mjs --write-report
node scripts/audit-fagverk-general-engine.mjs
node scripts/audit-fagverk-kunst-phase3.mjs --write-report
node scripts/audit-fagverk-kunst-phase3.mjs
node scripts/audit-fagverk-media-phase3.mjs --write-report
node scripts/audit-fagverk-media-phase3.mjs
node scripts/audit-fagverk-psykologi-phase3.mjs --write-report
node scripts/audit-fagverk-psykologi-phase3.mjs
node scripts/audit-fagverk-by-pilot.mjs --write-report
node scripts/audit-fagverk-by-pilot.mjs
node scripts/audit-fagverk-by-byliv-offentlige-rom-phase4.mjs --write-report
node scripts/audit-fagverk-by-byliv-offentlige-rom-phase4.mjs
node scripts/audit-fagverk-by-byliv-sosial-offentlighet-phase4.mjs --write-report
node scripts/audit-fagverk-by-byliv-sosial-offentlighet-phase4.mjs
node scripts/audit-fagverk-by-byliv-hendelser-midlertidighet-phase4.mjs --write-report
node scripts/audit-fagverk-by-byliv-hendelser-midlertidighet-phase4.mjs
node scripts/audit-fagverk-by-byliv-stemning-mikrokomfort-phase4.mjs --write-report
node scripts/audit-fagverk-by-byliv-stemning-mikrokomfort-phase4.mjs
node scripts/audit-fagverk-vitenskap-pilot.mjs --write-report
node scripts/audit-fagverk-vitenskap-pilot.mjs
node scripts/audit-fagverk-musikk.mjs --write-report
node scripts/audit-fagverk-musikk.mjs
node scripts/audit-fagverk-historie.mjs --write-report
node scripts/audit-fagverk-historie.mjs
node scripts/audit-fagverk-natur-pilot.mjs --write-report
node scripts/audit-fagverk-natur-pilot.mjs
node scripts/audit-fagverk-religion-pilot.mjs --write-report
node scripts/audit-fagverk-religion-pilot.mjs
node scripts/audit-fagverk-scenekunst-phase3.mjs --write-report
node scripts/audit-fagverk-scenekunst-phase3.mjs
node scripts/audit-fagverk-sport-phase3.mjs --write-report
node scripts/audit-fagverk-sport-phase3.mjs
node scripts/audit-fagverk-filosofi-phase3.mjs --write-report
node scripts/audit-fagverk-filosofi-phase3.mjs
node scripts/audit-fagverk-film-tv-phase3.mjs --write-report
node scripts/audit-fagverk-film-tv-phase3.mjs
node scripts/audit-natur-subject-quality.mjs --write-report
node scripts/audit-natur-subject-quality.mjs
node scripts/audit-natur-fagkart-quality.mjs --write-report
node scripts/audit-natur-fagkart-quality.mjs
node scripts/audit-natur-universal-coverage.mjs --write-report
node scripts/audit-natur-universal-coverage.mjs
node scripts/audit-naeringsliv-chapter-makt-regulering-baerekraft.mjs --write-report
node scripts/audit-naeringsliv-chapter-makt-regulering-baerekraft.mjs
node scripts/audit-naeringsliv-chapter-logistikk-infrastruktur-okonomisk-rom.mjs --write-report
node scripts/audit-naeringsliv-chapter-logistikk-infrastruktur-okonomisk-rom.mjs
node scripts/audit-naeringsliv-chapter-teknologi-innovasjon-plattformer.mjs --write-report
node scripts/audit-naeringsliv-chapter-teknologi-innovasjon-plattformer.mjs
node scripts/audit-naeringsliv-chapter-handel-forbruk-marked.mjs --write-report
node scripts/audit-naeringsliv-chapter-handel-forbruk-marked.mjs
node scripts/audit-naeringsliv-chapter-kapital-eierskap-finans.mjs --write-report
node scripts/audit-naeringsliv-chapter-kapital-eierskap-finans.mjs
node scripts/audit-naeringsliv-chapter-arbeid-produksjon-verdiskaping.mjs --write-report
node scripts/audit-naeringsliv-chapter-arbeid-produksjon-verdiskaping.mjs
node scripts/audit-naeringsliv-subject-quality.mjs --write-report
node scripts/audit-naeringsliv-subject-quality.mjs
node scripts/audit-naeringsliv-specialization-chapters.mjs --write-report
node scripts/audit-naeringsliv-specialization-chapters.mjs
node scripts/audit-politikk-subject-quality.mjs --write-report
node scripts/audit-politikk-subject-quality.mjs
node scripts/audit-politikk-thinker-integrity.mjs --write-report
node scripts/audit-politikk-thinker-integrity.mjs
node scripts/audit-politikk-chapter-forvaltning.mjs --write-report
node scripts/audit-politikk-chapter-forvaltning.mjs
node scripts/audit-politikk-chapter-parlamentarisme.mjs --write-report
node scripts/audit-politikk-chapter-parlamentarisme.mjs
node scripts/audit-politikk-chapter-regimer-institusjoner.mjs --write-report
node scripts/audit-politikk-chapter-regimer-institusjoner.mjs
node scripts/audit-politikk-chapter-valg-partier-velgeratferd.mjs --write-report
node scripts/audit-politikk-chapter-valg-partier-velgeratferd.mjs
node scripts/audit-politikk-chapter-offentlig-politikk-beslutning-implementering.mjs --write-report
node scripts/audit-politikk-chapter-offentlig-politikk-beslutning-implementering.mjs
node scripts/audit-politikk-chapter-internasjonal-politikk-sikkerhet-samarbeid.mjs --write-report
node scripts/audit-politikk-chapter-internasjonal-politikk-sikkerhet-samarbeid.mjs
node scripts/audit-politikk-chapter-politisk-okonomi-stat-marked.mjs --write-report
node scripts/audit-politikk-chapter-politisk-okonomi-stat-marked.mjs
node scripts/audit-politikk-chapter-statsvitenskapelig-metode-og-sammenligning.mjs --write-report
node scripts/audit-politikk-chapter-statsvitenskapelig-metode-og-sammenligning.mjs
node scripts/audit-politikk-chapter-norsk-politikk-eos-eu-flernivastyring.mjs --write-report
node scripts/audit-politikk-chapter-norsk-politikk-eos-eu-flernivastyring.mjs
node scripts/audit-politikk-chapter-rett-lov-rettssikkerhet.mjs --write-report
node scripts/audit-politikk-chapter-rett-lov-rettssikkerhet.mjs
node scripts/audit-politikk-chapter-fordeling-velferd-ulikhet.mjs --write-report
node scripts/audit-politikk-chapter-fordeling-velferd-ulikhet.mjs
node scripts/audit-subkultur-fagverk-baseline.mjs --write-report
node scripts/audit-subkultur-fagverk-baseline.mjs
node tools/build-subkultur-foundation-v1.mjs --write
node tools/build-subkultur-foundation-v1.mjs --check
node scripts/audit-subkultur-foundation-v1.mjs --write-report
node scripts/audit-subkultur-foundation-v1.mjs
node tools/build-subkultur-evidence-v1.mjs --write
node tools/build-subkultur-evidence-v1.mjs --check
node scripts/audit-subkultur-evidence-v1.mjs --write-report
node scripts/audit-subkultur-evidence-v1.mjs
node tools/build-subkultur-chapters-v1.mjs --write
node tools/build-subkultur-chapters-v1.mjs --check
node scripts/audit-subkultur-chapters-v1.mjs --write-report
node scripts/audit-subkultur-chapters-v1.mjs
node tools/build-subkultur-case-evidence-v1.mjs --write
node tools/build-subkultur-case-evidence-v1.mjs --check
node scripts/audit-subkultur-case-evidence-v1.mjs --write-report
node scripts/audit-subkultur-case-evidence-v1.mjs
node --test tests/fagverk-subject-inventory.test.mjs tests/fagverk-general-engine.test.mjs tests/fagverk-historie.test.mjs tests/fagverk-natur-pilot.test.mjs tests/natur-subject-quality.test.mjs tests/natur-fagkart-quality.test.mjs tests/natur-universal-coverage.test.mjs tests/naeringsliv-chapter-arbeid-produksjon-verdiskaping.test.mjs tests/naeringsliv-chapter-kapital-eierskap-finans.test.mjs tests/naeringsliv-chapter-handel-forbruk-marked.test.mjs tests/naeringsliv-chapter-teknologi-innovasjon-plattformer.test.mjs tests/naeringsliv-chapter-logistikk-infrastruktur-okonomisk-rom.test.mjs tests/naeringsliv-chapter-teknologi-innovasjon-plattformer.test.mjs tests/naeringsliv-subject-quality.test.mjs tests/politikk-subject-quality.test.mjs tests/politikk-thinker-integrity.test.mjs tests/politikk-chapter-forvaltning.test.mjs tests/politikk-chapter-parlamentarisme.test.mjs tests/politikk-chapter-regimer-institusjoner.test.mjs tests/politikk-chapter-valg-partier-velgeratferd.test.mjs tests/politikk-chapter-offentlig-politikk-beslutning-implementering.test.mjs tests/politikk-chapter-internasjonal-politikk-sikkerhet-samarbeid.test.mjs tests/politikk-chapter-politisk-okonomi-stat-marked.test.mjs tests/politikk-chapter-statsvitenskapelig-metode-og-sammenligning.test.mjs tests/politikk-chapter-norsk-politikk-eos-eu-flernivastyring.test.mjs tests/politikk-chapter-rett-lov-rettssikkerhet.test.mjs tests/politikk-chapter-fordeling-velferd-ulikhet.test.mjs
```

`subject-baseline.json` er ikke lenger låst til at alle fag må stå urørt på Phase 0. Status kan bare flyttes videre når portalstatus, individuell audit og redaksjonell status følger den bindende progresjonsregelen.

## Hva inventarauditen blokkerer

Auditen feiler når kategori-, manifest-, portal-, inventar- eller statusrekkefølgen avviker; required kjernefiler mangler; schemafamilien ikke samsvarer med manifestet; eller en status hevder mer fremdrift enn navigasjon og audit kan dokumentere.

## Hva motor-auditen blokkerer

Motor-auditen feiler når:

- `fagverk.html` laster politikkspesifikk subject-runtime;
- `subject` mangler eller får alias-/politikkfallback;
- required filstier hardkodes utenfor `data/fag/fag_manifest.json`;
- merkesiden ikke løses gjennom portalregisteret;
- et materialisert fag mangler fagområder, emner eller metoder;
- emner peker til ukjente fagområder eller metoder;
- committed runtime-rapport ikke samsvarer med faktisk kode og data.

## Gjeldende produksjonsstatus

Musikk står `materialized`, `audited` og `complete`. Åtte fullverdige kapitler dekker alle 48 emner i de åtte canonicale fagområdene med 24 moduler, 72 seksjoner, 216 fagavsnitt, 55 uendrede claims og 67 unike inspiserbare kapittelkilder. Alle 48 temaer har løst fulltekst-, direkte-objekt- og rettighetsport. Videre arbeid er vedlikehold, kildeoppdatering og utvidelse med stedscase som følger den samme evidenskontrakten.

Historie står `materialized`, `audited` og `chapters_in_progress`. Fire av 23 fagområder har registrerte fullverdige kapitler: historisk tid og periodisering, kilder/arkiv/spor, makt/stat/institusjoner og middelalder/kirke/kongemakt. Nitten fagområder, universell theory-evidence og full publiseringsaudit gjenstår.

Natur står `materialized`, `audited` og `chapters_in_progress`. De seks opprinnelige miljøkapitlene og biologifase 1 er bevart. Evolusjon/biologisk mangfold og organismebiologi/fysiologi er nå materialisert med egne emner, metoder, mappinger, fagkart og kapitler. Elleve kapitler dekker alle 65 materialiserte emner. Sopp/lav/mikroorganismer og geologiens indre prosesser står fortsatt som eksplisitte hull før faget kan bli `complete`.

Økonomi og næringsliv står `materialized`, `audited` og `complete`. Faget har seks canonicale grunnkapitler og seks fullverdige fordypningskapitler: makroøkonomi og økonomisk politikk; regnskap og økonomistyring; markedsføring og strategi; kvantitative metoder og business analytics; forretningsjus, skatt og compliance; internasjonal økonomi, operations og prosjekt. Fordypningene tilfører 54 seksjoner, 162 fagavsnitt, 162 sporede claims og 54 inspectable autoritative kilder. Universitetslaget dekker seks akademiske spor og alle 36 kjerneemnene individuelt; handelshøgskolelaget dekker fem profesjonsspor og 25 moduler. Runtime skiller grunnkapitler fra fordypninger, normaliserer begge pedagogiske feltvarianter og laster kilder fra alle kapitlenes `claimsFile`.

Politikk står `materialized`, `audited` og `complete`. Alle tretten canonicale fagområder har fullproduserte kapitler med tre redigerte moduler, exact canonical emne- og metodedekning, inspectable kilder, påstandsregister, avsnittssporing, permanent audit og test. Sluttmoderniseringen omfatter `Offentlig forvaltning` og `Parlamentarisme, representasjon og offentlighet`; den felles sluttgaten bekrefter at 13/13 kapitler følger brief–claims–audit-kontrakten. Faget har dessuten permanente kvalitetsgater for 123 emner, 71 operative metoder, 123 mappingrader, 152 hooks, normal quizåpning, Knowledge-leveranse og canonical ID–navn-integritet for teoripersoner.

Subkultur står `materialized`, `audited` og `complete`. Faget har åtte canonicale fagområder, 80 individuelt redigerte emner og teoriobjekter, 43 operative metoder, åtte fullverdige kapitler, 42 validerte cases med 84 balanserte casekilder, åtte fagområdeforløp med 40 kildebelagte spørsmål og 44 canonicale Knowledge-enheter. Runtime-manifestet binder domene, emne, kapittel, case, assessment og Knowledge sammen; legacyquiz er auditert rad for rad og koblet ut av runtime. Neste port er permanent kildevedlikehold.

Religion står `materialized`, `audited` og `structure_ready` som den andre godkjente fase-2-piloten. Foundation-pakken går gjennom den samme manifest-first-motoren som standardfagene, men fagkartets fire kategorier eier renderer-fagområdene mens de tre pensummodulene bare eier progresjon. Alle åtte aktive emner har løst fagområde og to canonicale metodekoblinger. Redigerte kapitler, claims og kapittelkilder gjenstår og er derfor ikke overrapportert.

By står `materialized`, `audited` og `structure_ready` som den tredje godkjente fase-2-piloten. Compatibility-adapteren bruker fagkartets tolv kategorier som eneste renderer-fagområder og bevarer alle 82 source-emner, 14 canonicale metoder og 81 hooks. Fem tidligere ukoblede aktive emner er lagt inn i eksisterende, semantisk riktige hooks, slik at motoren ikke oppretter kunstige fallback-områder. De sju pensummodulene og åtte curriculum-modulene er progresjonslag; redigerte kapitler, claims og kapittelkilder gjenstår.

Vitenskap står `materialized`, `audited` og `structure_ready` som den fjerde og siste fase-2-piloten. Standardadapteren viser seks canonicale fagområder, 93 emner, 84 metoder, 93 mappinger og 60 hooks. Tretten etterregistrerte emner er integrert i de eksisterende områdene, mappingregisteret og generatorgrunnlaget. Teknologi bevares under Vitenskap gjennom sin egen adapter med tolv områder, 48 aktive emner, 35 metoder og 36 hooks; det opprettes verken toppfag, topprute eller separat badge. Redigerte Vitenskap-kapitler, claims og kapittelkilder gjenstår.

Kunst står `materialized`, `audited` og `structure_ready` som det første individuelt materialiserte Fase 3-faget. Standardadapteren viser seks canonicale fagområder, 21 aktive emner, 21 metoder, 21 mappinger og 60 hooks. `Materialitet, teknikk og håndverk i kunst` er integrert i `Produksjon og praksis`, mens det eldre skjulte hookavviket for `Hverdagsestetikk` er lukket gjennom de allerede canonicale mappingene. Det er ikke opprettet syntetiske områder eller redaksjonelle kapitler; claims, kilder og fulltekstproduksjon gjenstår.

Media står `materialized`, `audited` og `structure_ready` som det andre individuelt materialiserte Fase 3-faget. Standardadapteren viser seks canonicale hovedområder, 120 aktive hovedemner, 163 metoder i den samlede katalogen, 120 mappinger og 60 hovedhooks. `AV- og TV-produksjon` og `Kritikk og kommentar` er integrert i eksisterende områder og hooks. Populærkultur er bevart som et komplett nested mediefelt med seks områder, 56 emner, 48 metoder, 56 mappinger og 60 hooks uten egen portalpost eller toppfagsstatus. Det er ikke opprettet syntetiske områder eller redaksjonelle kapitler; claims, kilder og fulltekstproduksjon gjenstår.

Alle fire fase-2-piloter er materialisert og auditert: Natur, Religion, By og Vitenskap med Teknologi som nested spesialisering. Fase 3 materialiserer de resterende fagene individuelt; Kunst og Media er godkjent, og de øvrige planlagte fagene beholder tom subject-rute til deres egne porter består.
