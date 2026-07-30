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

De tidligere batchene er hovedsakelig `multi_case_geographic_pilot` i Oslo/Akershus. Samiske kontaktsoner i middelalderen V1 innfører en egen manifeststyrt profil for nordlige kontaktsoner i Sápmi. Sápmi og Ruija statsdannelse V1 innfører en egen profil for relasjonene mellom samiske og kvenske/norskfinske institusjoner, offentlig mobilisering og nasjonale beslutningsorganer. Hvert objekt står fortsatt med `universalization_status: provisional_not_universal`: profilene dokumenterer stedsspesifikke anvendelser, ikke universell gyldighet. Senere batcher må fortsette å utvide periode-, geografi-, aktør- og kildetypebredden uten å senke tersklene.

## Fullføringsregel

Den universelle Historie-auditen måler andelen av de 230 teoriobjektene som har kvalifiserende entries i evidensregisteret. Produksjonen står på 69 av 230 etter at okkupasjon, samarbeid, tilpasning, motstand og gråsoner V1 er lagt til. Universell produksjonsstatus forblir `INCOMPLETE` frem til 230 av 230 objekter har et validert evidensgrunnlag.

## Produksjonsstatus

- Batch 1: **10** kvalifiserende teoriobjekter.
- Batch 2: **12** nye kvalifiserende teoriobjekter.
- Batch 3: **10** nye kvalifiserende teoriobjekter med egne claim-profiler.
- Politisk kronologi evidens V1: **3** nye kvalifiserende teoriobjekter, **13** nye claims og **2** nyvaliderte cases.
- Bevegelsesoffentligheter evidens V1: **4** nye kvalifiserende teoriobjekter, **13** nye claims og **3** nyvaliderte cases.
- Ritual og resepsjon evidens V1: **2** nye kvalifiserende teoriobjekter, **9** nye claims og **1** nyvalidert case; arkivtaushet holdes tilbake.
- Kildeformfamilier evidens V1: **5** nye kvalifiserende teoriobjekter, **17** nye claims og **2** nyvaliderte cases.
- Middelalder sosial-, økonomi- og rettsevidens V1: **5** nye kvalifiserende teoriobjekter, **21** nye claims og **4** nyvaliderte cases; svartedauden holdes tilbake.
- Middelalderby og Oslo-evidens V1: **2** nye kvalifiserende teoriobjekter, **6** nye claims og **4** utvidede validerte cases.
- Svartedauden og senmiddelalderens omforming V1: **1** nytt kvalifiserende teoriobjekt, **4** nye claims, **1** nyvalidert case og **1** utvidet case.
- Samiske kontaktsoner i middelalderen V1: **1** nytt kvalifiserende teoriobjekt, **6** nye claims, **2** nyvaliderte cases, **3** nye kilder og **1** ny geografiprofil.
- Embetsstat, demokratisering og kommunalt selvstyre V1: **2** nye kvalifiserende teoriobjekter, **5** nye claims og **2** utvidede cases.
- Sápmi og Ruija statsdannelse V1: **2** nye kvalifiserende teoriobjekter, **9** nye claims, **3** nyvaliderte cases, **11** nye kilder og **1** ny geografiprofil.
- Fabrikkorganisering og arbeidstid, lønn og ferdighet V1: **2** nye kvalifiserende teoriobjekter, **7** nye claims, **2** nyvaliderte cases og **1** utvidet case.
- Arbeidsmiljø, risiko, helse, kjønn og lønn V1: **2** nye kvalifiserende teoriobjekter, **4** nye claims, **4** nye kilder og **2** nyvaliderte cases.
- Arbeiderbolig, hushold, livsvilkår, arbeidsvandring og rekruttering V1: **2** nye kvalifiserende teoriobjekter, **2** nye claims, **1** ny kilde og **3** utvidede cases.
- Organisering, streik, forhandling, avindustrialisering, ombruk og industriarv V1: **2** nye kvalifiserende teoriobjekter, **2** nye claims, **2** nye kilder og **1** nyvalidert case.
- Okkupasjon, samarbeid, tilpasning, motstand og gråsoner V1: **2** nye kvalifiserende teoriobjekter, **3** nye claims, **2** nye kilder og **1** nyvalidert case.
- Totalt: **69 av 230** teoriobjekter (**30.0 %**).
- Universell status: **INCOMPLETE**.
- Gjenstående teoriobjekter: **161**.
