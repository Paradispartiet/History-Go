# Place coordinate sync command

## Bakgrunn

Source-filer er eneste sannhet for place-koordinater. Index-filer, inkludert `data/places/places_index.json`, er genererte cacher og skal ikke håndredigeres.

Parity- og index-checkene kan oppdage at en index ikke matcher source, men de skal ikke selv skrive om index. Derfor finnes det nå en trygg standardkommando som først regenererer index fra source og deretter kjører kontrollene.

## Standardflyt ved koordinatendringer

Når koordinater eller koordinatmetadata endres i source, kjør:

```bash
npm run places:coords:sync
```

Kommandoen gjør to ting i rekkefølge:

1. `npm run places:index:build` — regenererer index fra source.
2. `npm run places:index:check` — verifiserer at generert index matcher source og at koordinat-parity er grønn.

Ikke håndrediger index-filer. Hvis `places:coords:sync` eller underliggende `places:index:check` feiler, betyr det at index fortsatt ikke matcher source, eller at en av de tilknyttede index-/koordinatkontrollene fant et avvik som må rettes i source eller generatorflyten.

## Pipeline-regel

Pipelines som skriver koordinater til source må ikke gå rett til `places:index:check`. De må først kjøre `places:index:build`, slik at checken validerer en regenerert cache mot source.

`places:coords:pipeline:write` følger derfor denne rekkefølgen:

```bash
npm run places:coords:candidates:all && npm run places:coords:apply:write && npm run places:index:build && npm run places:index:check && npm run places:coords:gate
```

## Avgrensning

Denne endringen innfører bare trygg kommando- og pipelineflyt. Den endrer ikke koordinater, DataHub eller index-innhold manuelt.
