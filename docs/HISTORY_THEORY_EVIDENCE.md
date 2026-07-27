# Historie — teori-evidens

## Formål

Teoriobjektene i Historie V5.5 er kuraterte analyseverktøy, men den frosne basen dokumenterer ikke i seg selv at hvert objekt er prøvd mot konkrete historiske claims, kilder og cases. V6-evidenslaget etablerer derfor et separat, canonical register for dokumentert teoribruk.

## Autoritetsgrense

- `theory_objects_historie_canonical_v5_5.json` eier teoriobjektenes definisjoner, forklaringsområde, begrensninger, metodekoblinger og tenkerkoblinger.
- Den frosne V5.5-filen beholder `evidence_ready: false` og skal ikke omskrives for å føre V6-produksjonsstatus.
- `theory_evidence_historie_contract_v1.json` eier kvalifikasjonskravene.
- `theory_evidence_historie_canonical_v1.json` eier V6-status og koblingen mellom teori, claims, kilder, cases, steder og validert place evidence.
- `validate-historie-theory-evidence.mjs` er permanent maskinell port.

## Kvalifikasjonskrav

Et teoriobjekt kan registreres som `evidence_ready` i piloten bare når det har:

1. minst tre eksisterende canonical claims;
2. minst to forskjellige cases og steder;
3. minst to canonical kilder med repositoryproveniens og eksplisitte begrensninger;
4. minst to claim-typer og flere tidsankre;
5. validert sted–claim–kildekobling for hvert claim;
6. teorispesifikk begrunnelse, begrensninger, alternativ fortolkning og vilkår som kan svekke anvendelsen;
7. eksplisitt avgrensning mot å gjøre ett sted, én geografi eller én kilde til universelt bevis.

## Betydningen av `evidence_ready`

`evidence_ready` betyr at teoriobjektet har et kontrollerbart evidensgrunnlag som består den gjeldende kontrakten. Det betyr ikke at teorien er bevist, universelt gyldig eller uttømmende dokumentert. Teorier brukes til å organisere og prøve fortolkninger; de er ikke historiske fakta i seg selv.

Batchene er `multi_case_geographic_pilot` i Oslo/Akershus. Hvert objekt står derfor samtidig med `universalization_status: provisional_not_universal`. Senere batcher må utvide periode-, geografi-, aktør- og kildetypebredden uten å senke tersklene.

## Fullføringsregel

Den universelle Historie-auditen måler andelen av de 230 teoriobjektene som har kvalifiserende entries i evidensregisteret. De tre første batchene etablerte 32 objekter. Politisk kronologi evidens V1 tilfører tre objekter på grunnlag av 13 nye claims, 11 nye kildeposter og to nyvaliderte cases. Produksjonen står dermed på 35 av 230. Universell produksjonsstatus forblir `INCOMPLETE` frem til 230 av 230 objekter har et validert evidensgrunnlag.

## Produksjonsstatus

- Batch 1: **10** kvalifiserende teoriobjekter.
- Batch 2: **12** nye kvalifiserende teoriobjekter.
- Batch 3: **10** nye kvalifiserende teoriobjekter med egne claim-profiler.
- Politisk kronologi evidens V1: **3** nye kvalifiserende teoriobjekter, **13** nye claims og **2** nyvaliderte cases.
- Totalt: **35 av 230** teoriobjekter (**15,2 %**).
- Universell status: **INCOMPLETE**.
- Produksjonsavhengigheter: `reports/historie-theory-evidence/history-theory-evidence-gap-inventory-v2.md`.
