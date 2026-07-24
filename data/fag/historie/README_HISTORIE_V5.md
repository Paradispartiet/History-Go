# Historie V5

Historie V5 er nå definert som en eksplisitt canonical-kontrakt, ikke bare som en løs samling fagkartoppgraderinger.

## Omfang

- 20 domener
- 200 aktive emner
- 355 canonical-begreper
- 20 teoriobjekter fordelt på rammeverk, mellomnivåmodeller, analytiske begreper og historiografiske tradisjoner
- 12 metode-ID-er
- historiografiske konflikter, blindsoner og generatorbegrensninger på emnenivå

De åtte nye domenene er:

1. Kjønn, familie, seksualitet og livsløp
2. Økonomi, handel og materielle systemer
3. Religion, reformasjon og livssyn
4. Samisk og urfolkshistorie
5. Miljø-, klima- og landskapshistorie
6. Vitenskap-, teknologi- og kunnskapshistorie
7. Global, kolonial og transnasjonal historie
8. Offentlighet, mobilisering og sosiale bevegelser

## Canonical kilde

`historie_v5_registry.mjs` er den deterministiske kilden for domener, emner, begreper og teoriobjekter. Dette hindrer at flere store genererte JSON-filer driver fra hverandre.

Materialiser lesbare JSON-filer med:

```bash
mkdir -p reports/historie-v5
node tools/materialize-historie-v5.mjs | tee reports/historie-v5/materialization.txt
```

Valider hele V5-kontrakten med:

```bash
mkdir -p reports/historie-v5
node tools/validate-historie-v5.mjs | tee reports/historie-v5/validation.txt
```

Validatoren kontrollerer blant annet:

- minimum 20 domener
- minimum åtte emner, åtte begreper, åtte metoder og åtte teoriobjekter per domene
- unike og gyldige ID-er
- ingen foreldreløse referanser
- historiografiske konflikter
- Oslo-forankring og internasjonalt sammenligningsspor
- kildekrav, tidsavgrensning og teori etter case
- definisjoner, misbruksvern og begrensninger

V6 skal bygge evidens, proveniens, kildevekting og motstridende forskning på toppen av disse stabile ID-ene.
