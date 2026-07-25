# Historie V5.5

Historie er fryseklar for V6 når produksjonsfilene inneholder 20 individuelt kuraterte domener, 200 emner, 200 teorihooks og 200 tospors mappinger. Syntetiske parallelle V5-registre er deaktivert.

Kjør:

```bash
mkdir -p reports/historie-v5
node tools/validate-historie-v5.mjs --write | tee reports/historie-v5/validation-console.txt
```

V6 skal legge evidens, proveniens, kildevekting og motstridende forskning på de frosne ID-ene.
