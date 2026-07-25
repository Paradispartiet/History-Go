# Historie V5.5

Historie V5.5 er fagets kuraterings- og frysefase før V6-evidenslaget. V5.5 er ikke et fast antall automatisk genererte objekter. Faget er først ferdig når hvert planlagt domene er individuelt kuratert, produksjonskoblet og maskinelt kontrollert.

## Autoritativ modell

Disse filene er produksjons-canonical:

- `fagkart_historie_canonical_v4_5.json`
- `methods_historie_canonical_v4_5.json`
- `emner_historie_canonical_v4_5.json`
- `emnemapping_historie_canonical_v4_5.json`
- `historiepensum_canonical_v4_5.json`
- `quiz_generator_rules_historie_v5_1_source_priority_patch.json`

Filnavnene beholder foreløpig `v4_5` av kompatibilitetshensyn. Modenheten bestemmes av innholdet og V5.5-validatoren, ikke av filnavnet.

`historie_v5_5_domain_plan.json` definerer målbildet på 20 domener. Et domene som bare finnes i planen er `planned_only`; det er ikke canonical og kan ikke brukes som evidensanker.

## Hva som er avviklet

Følgende V5.0-artefakter var nyttige som planleggingsskisser, men er ikke autoritative:

- `historie_v5_registry.mjs`
- `historie_v5_blueprint.json`
- syntetiske `generated-v5`-filer
- genererte V5-filer med ett standardbegrep per emnetittel

Den tidligere registry-generatoren laget generiske definisjoner, roterte metoder og teorier mekanisk og markerte planlagte domener som komplette. Den er nå eksplisitt deaktivert og kan ikke brukes til V6.

## Fire modenhetsnivåer

- `planned_only`: finnes bare i 20-domeneplanen
- `production_partial`: finnes i produksjons-canonical, men mangler vertikal dybde
- `production_complete`: har minst 10 emner, 10 hooks, operative metoder, mappinger, case og tenkerbaner
- `freeze_ready`: er i tillegg individuelt kuratert og passerer hele V5.5-kontrakten

`production_complete` er ikke det samme som `freeze_ready`.

## Krav til et freeze-ready domene

Et domene må blant annet ha:

- minst 10 individuelt kuraterte emner
- minst 10 operative teorihooks
- minst 9 relevante metoder
- to selvstendige mappingbaner per emne
- konkret domenekjede fra kilde og sted til historisk konsekvens
- eksplisitte grenser mot nabofag og nabodomener
- kildebegrensning og kritisk distinksjon
- norske eller nordiske faglige bidrag der slike finnes
- tilstrekkelig casebredde
- permanent domenespesifikk validator

Hvert emne må ha en særskilt definisjon, kuraterte begreper, historiografisk konflikt, metodekobling, case, overlappsløsning, generatorvern og anti-mønstre. Uniform tekst fra emnetittelen godtas ikke.

## Validering

Kjør den sannferdige modenhetskontrollen og lagre rapporten:

```bash
mkdir -p reports/historie-v5
node tools/validate-historie-v5.mjs --write \
  | tee reports/historie-v5/validation-console.txt
```

Dette skriver:

- `reports/historie-v5/historie-v5-5-readiness.json`
- `reports/historie-v5/validation.txt`

Den vanlige kontrollen rapporterer `NOT_READY` uten å feile så lenge arbeidet pågår. Den endelige fryseporten er streng:

```bash
mkdir -p reports/historie-v5
node tools/validate-historie-v5.mjs --write --require-freeze \
  | tee reports/historie-v5/freeze-validation.txt
```

`--require-freeze` skal feile helt til alle 20 domener og de globale begreps-, teori-, metode-, skjevhets- og generatorportene er grønne.

## Arbeidsrekkefølge

1. Fullfør eksisterende deldomener vertikalt i produksjonsfilene.
2. Materialiser de åtte planlagte kjernedomenene én etter én.
3. Kurater begrepsregisteret og skill aktørkategorier, analytiske begreper og historiografiske begreper.
4. Bygg et typet teoriregister med forklaringsområde, forutsetninger, begrensninger og kritikk.
5. Kjør skjevhets-, språk-, case- og progresjonsrevisjon.
6. Frys V5.5.
7. Bygg V6-evidens og proveniens på de fryste ID-ene.

## V6-port

V6 er ikke tillatt bare fordi et blueprint inneholder 20 domener. `v6_allowed` blir først `true` når V5.5-rapporten har status `FREEZE_READY`.
