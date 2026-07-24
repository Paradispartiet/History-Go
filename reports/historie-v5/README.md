# Historie V5 – canonical completion

Historie V5 er formalisert som en deterministisk canonical-pakke med eksplisitt kontrakt, faglig blueprint, generator og validator.

## Omfang

- 20 hoveddomener
- 160 aktive emner
- 160 kjernebegreper
- 160 teorihooks
- 79 teoriobjekter
- minst 6 metoder per domene

## Nye og utvidede domener

Alle tidligere domener er løftet til minst åtte emner. I tillegg er kjønn/familie/livsløp, økonomi/handel, religion/livssyn, samisk og urfolkshistorie, miljø/klima, vitenskap/teknologi/kunnskap, global/transnasjonal historie og offentlighet/mobilisering formalisert.

## Kjøring

```bash
mkdir -p reports/historie-v5
node tools/build-historie-v5.mjs --write \
  | tee reports/historie-v5/validation.txt
```

Uten `--write` validerer skriptet blueprinten og den genererte pakken i minnet.

## Kvalitetsporter

Validatoren kontrollerer domeneminimum, referensiell integritet, teori- og metodekoblinger, historiografiske konflikter, kilde- og korroboreringskrav, læringsprogresjon og at stoppord ikke registreres som selvstendige begreper.

V5 gir stabile canonical-ID-er som V6 kan bruke til evidens-, kilde- og proveniensobjekter.
