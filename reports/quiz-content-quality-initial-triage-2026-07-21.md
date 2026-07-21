# Første triage: quizinnhold og gjentatte teorimaler

Dato: 2026-07-21  
Status: første kodebaserte arbeidskø, før full auditrapport fra en komplett checkout

## Problemet

Flere stedsquizer er produsert etter feil rekkefølge:

> emne eller begrep → konstruert stedsspørsmål

Dette har gitt mange spørsmål som ber spilleren velge en «faglig lesning», et emne eller et begrep, ofte med ett langt korrekt svar og to åpenbart svake alternativer.

Korrekt produksjonsrekkefølge er nå definert i `data/quiz/regler/QUIZ_INNHOLDSSTANDARD_V1.md`:

> kilde eller verifiserbar observasjon → konkret påstand → spørsmål → emnekobling som metadata

## Reparert i første batch

### Deichman Bjørvika

- gammel pakke: seks sett og omfattende emne-/begrepsproduksjon
- ny pakke: fire sett, 20 spørsmål
- balanse: 14 fakta, 6 årsak/sammenheng, 0 teorimaler
- kilder: Oslo kommune, Atelier Oslo, FutureBuilt og IFLA

### Ullevaal Stadion

- den tidligere omskrivingen gjorde quizen til en prøve i hvordan stadion burde «leses»
- ny pakke: to sett, 10 spørsmål
- balanse: 7 fakta, 3 årsak/sammenheng, 0 teorimaler
- kilder: Norges Fotballforbund og Store norske leksikon

## Høyeste prioritet: eksakte «faglig lesning»-treff

Disse filene hadde treff på formuleringen «mest presise faglige lesningen» eller svært nær samme mal i første GitHub-søk:

1. `data/quiz/by/ring_3_sets.json`
2. `data/quiz/by/oslo_s_sets.json`
3. `data/quiz/by/tjuvholmen_sets.json`
4. `data/quiz/by/st_hanshaugen_park_sets.json`
5. `data/quiz/by/radhusplassen_sets.json`
6. `data/quiz/by/majorstua_sets.json`
7. `data/quiz/by/torggata_sets.json`
8. `data/quiz/by/vigelandsparken_sets.json`
9. `data/quiz/historie/akershus_festning_sets.json`
10. `data/quiz/by/kampen_kirke_sets.json`

Deichman var også i denne gruppen, men er reparert i første batch.

## Neste søkegruppe: «Hvorfor passer …» og emnespråk

Første brede kodegjennomgang fant tilsvarende mønstre i eller rundt blant annet:

### By

- `data/quiz/by/operaen_sets.json`
- `data/quiz/by/grunerlokka_sets.json`
- `data/quiz/by/stephen_butkus_sets.json`
- `data/quiz/by/gronland_basarene_sets.json`
- `data/quiz/by/markveien_sets.json`

### Historie og politikk

- `data/quiz/historie/nedre_foss_sets.json`
- `data/quiz/politikk/youngstorget_sets.json`

### Natur

- `data/quiz/natur/stilla_nydalen_sets.json`
- `data/quiz/natur/svartdalen_sets.json`

### Litteratur

- `data/quiz/litteratur/pedro_sets.json`
- `data/quiz/litteratur/norli_universitetsgata_sets.json`
- `data/quiz/litteratur/tronsmo_bokhandel_sets_merged.json`
- `data/quiz/litteratur/henrik_wergeland_park_sets_merged.json`

### Musikk

- `data/quiz/musikk/john_dee_sets_merged_REVISED.json`
- `data/quiz/musikk/salt_sets_merged.json`

Dette er en søkeliste, ikke en endelig dom over hele filen. Hver fil skal kontrolleres mot aktivt manifest, faktisk spørsmålsfordeling og kildegrunnlag før omskriving.

## Arbeidsrekkefølge

1. Kjør full audit og lag maskinlesbar rapport.
2. Reparer filer med høy teoriandel og eksakte forbudte maler først.
3. Behold gode fakta og reelle sammenhengsspørsmål.
4. Kutt svake sett i stedet for å fylle dem på nytt.
5. Verifiser kilder før hvert nytt spørsmål skrives.
6. Lås reparerte filer med regresjonstester.

## Kommandoer

```bash
npm run test:quiz-content-audit
npm run audit:quiz-content
npm run audit:quiz-content:report
```

`audit:quiz-content:report` skriver den fullstendige arbeidslisten til `reports/quiz-content-quality.json`.
