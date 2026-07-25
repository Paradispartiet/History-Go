# Historie V5.5 – modenhetsrapporter

Denne mappen dokumenterer faktisk produksjonsmodenhet for Historie før V6. Tidligere rapporter som beskrev 160 eller 200 automatisk genererte emner som en ferdig canonical-pakke er erstattet av en kontroll mot de aktive produksjonsfilene.

## Generer rapport

```bash
mkdir -p reports/historie-v5
node tools/validate-historie-v5.mjs --write \
  | tee reports/historie-v5/validation-console.txt
```

Dette oppdaterer:

- `historie-v5-5-readiness.json`: detaljert maskinlesbar status per domene og emne
- `validation.txt`: kompakt status med manglende porter

## Endelig frysekontroll

```bash
mkdir -p reports/historie-v5
node tools/validate-historie-v5.mjs --write --require-freeze \
  | tee reports/historie-v5/freeze-validation.txt
```

Den strenge kontrollen skal feile fram til alle 20 planlagte domener er individuelt kuratert, produksjonskoblet og `freeze_ready`, og de globale begreps-, teori-, metode-, språk- og skjevhetsportene er grønne.

Rapporten er et modenhetsbevis, ikke et evidenslag. V6 kan først begynne når `v6_allowed` er `true`.
