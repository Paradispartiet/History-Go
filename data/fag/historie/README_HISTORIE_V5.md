# Historie V5.5

Historie har nå et komplett dekningsskjelett med 20 domener, 200 emner, 200 hooks og 200 mappinger. Dekning er ikke det samme som faglig fryseklarhet.

V5.5 kan først fryses når emner, begreper og teoriobjekter er individuelt kuratert, semantisk differensiert og uten generatorspråk. Tellinger eller genererte standarddefinisjoner kan ikke åpne V6.

Kjør kvalitetsrevisjonen med:

```bash
mkdir -p reports/historie-v5
node tools/validate-historie-v5.mjs --write \
  | tee reports/historie-v5/validation-console.txt
```

Den endelige fryseporten er:

```bash
node tools/validate-historie-v5.mjs --write --require-freeze
```

V6 skal legge evidens, proveniens, kildevekting og motstridende forskning på ID-er som har passert denne kvalitetsporten.
