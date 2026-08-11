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

Den universelle Historie-auditen måler andelen av teoriobjektene i det til enhver tid godkjente canonicale inventaret som har kvalifiserende entries i evidensregisteret. I denne statusbaselinen består inventaret av 230 objekter, og produksjonen står på 130 av 230 etter at Velferd, rett og hverdagsliv V2 fullfører domenet med sosialforsikring og pensjon, bolig og materiell velferd, omsorgsarbeid og sosial reproduksjon, velferdsrett og tilgang samt bruker–tjeneste–forvaltning. V2 bruker to nye Stortinget-claims og streng gjenbruk av eksisterende validerte Oslo-caser.

Alle objekter i dagens inventar må ha validert evidensgrunnlag før status kan bli `COMPLETE`, men 230 er ikke en redaksjonell sluttkvote. Hvis heldekningsauditen etter `docs/HISTORY_UNIVERSAL_COVERAGE.md` og `docs/FAGVERK.md` finner et nytt relevant emne eller teoriobjekt, skal inventaret og denominator utvides. Full score mot et ufullstendig inventar kan ikke gi universell ferdigstatus.

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
- Propaganda, sensur, informasjonskontroll, fangenskap, vold og forfølgelse V1: **2** nye kvalifiserende teoriobjekter, **7** nye claims, **5** nye kilder, **3** nyvaliderte cases og **1** utvidet case.
- Overgangsrettferdighet, rettsoppgjør, kald krig, beredskap og sikkerhetsstat V1: **2** nye kvalifiserende teoriobjekter, **8** nye claims, **8** nye kilder, **1** nyvalidert case og **3** utvidede cases.
- Historisk tid: erfaringsrom, forventningshorisont, anakronisme og begrepsbruk V1: **2** nye kvalifiserende teoriobjekter ved ren gjenbruk; **0** nye claims, kilder, cases eller place-evidence-lenker.
- Minne, kulturarv og historiebruk V1: **3** nye kvalifiserende teoriobjekter, **6** nye claims, **4** nye kilder, **6** nye place-evidence-lenker og **5** utvidede validerte cases; digital kulturarv kvalifiseres ved ren claim-gjenbruk.
- Kilder, arkiv og spor V1: **3** nye kvalifiserende teoriobjekter, **2** nye claims, **2** nye kilder og **2** nye place-evidence-lenker; taushet/fravær og digitale kilder kvalifiseres hovedsakelig ved claim-gjenbruk.
- Offentlighet, mobilisering og bevegelser V1: **6** nye kvalifiserende teoriobjekter ved ren claim-gjenbruk; **0** nye claims, kilder, cases eller place-evidence-lenker.
- Byhistorie og stedsendring V1: **7** nye kvalifiserende teoriobjekter, **6** nye claims, **4** nye kilder, **10** nye place-evidence-lenker og **0** nye cases; grense/innlemmelse og gentrifisering får målrettet ny evidens, mens de øvrige fem objektene kombinerer gjenbruk med de nye Nydalen-claimene der det styrker anvendelsen. Regulering/plan-objektet dokumenterer plan og fysisk gjennomføring, ikke ekspropriasjonsvedtak eller erstatning, og gentrifiseringsobjektet dokumenterer sosialt endringsmønster og eiendomsdrevet funksjonsskifte uten å hevde individnivå-fortrengning.
- Makt, stat og institusjoner V1: **8** nye kvalifiserende teoriobjekter, **9** nye claims, **6** nye kilder, **9** nye place-evidence-lenker og **0** nye cases; fem objekter bygger hovedsakelig på claim-gjenbruk, mens embetsverk/byråkrati, lov/domstol/rettsstat og register/overvåking/disiplin får målrettet ny evidens. Register-objektet skiller eksplisitt demokratisk sikkerhetsovervåking fra nazistisk fange-klassifikasjon, statskapasitet avgrenses til dokumentert fiskal, tilsynsmessig og militær kapasitet, og krise/unntak-objektet skiller mellom rettslig kontinuitet, ekstraordinær administrasjon og faktisk institusjonelt brudd under okkupasjonen.
- Miljø, klima og landskap V1: **9** nye kvalifiserende teoriobjekter, **6** nye claims, **6** nye kilder, **6** nye place-evidence-lenker og **0** nye cases; energi og naturforvaltning kvalifiseres hovedsakelig ved gjenbruk, mens klima, forurensning, dyr–natur og miljørettferdighet får målrettet ny evidens. Klimaobjektet skiller trend, ekstremhendelse og tilpasning; miljørettferdighetsobjektene skiller global skala fra lokale årsakskjeder og hevder ikke individnivå-skade uten kilder. Alta-claimet bruker Eidsvolls plass som mobiliseringsanker, ikke som fysisk kraftverkslokasjon.
- Forhistorie og arkeologi V1: **9** nye kvalifiserende teoriobjekter, **17** nye claims, **11** nye kilder, **19** nye place-evidence-lenker, **7** nyvaliderte cases og **1** ny geografiprofil; null nye place-objekter. Neolitisering behandles som regional og gradvis overgang, bronsealderens utveksling skilles fra sikker motivtolkning, og bioarkeologi avgrenses eksplisitt mot representativ demografi.
- Velferd, rett og hverdagsliv V1: **5** nye kvalifiserende teoriobjekter, **11** nye claims, **9** nye kilder, **11** nye place-evidence-lenker og **4** nyvaliderte cases; null nye place- eller people-objekter. Institusjonskronologi og regelverk holdes eksplisitt adskilt fra faktisk tilgang, erfaring og utfall.
- Velferd, rett og hverdagsliv V2: **5** nye kvalifiserende teoriobjekter, **2** nye claims, **2** nye kilder og **2** nye place-evidence-lenker; null nye place- eller people-objekter. Sosialforsikring og pensjon får målrettet ny Stortinget-evidens, mens bolig, omsorg, tilgang og bruker–tjeneste–forvaltning kvalifiseres ved streng claim-gjenbruk.
- Totalt: **130 av 230** teoriobjekter (**56.5 %**).
- Universell status: **INCOMPLETE**.
- Gjenstående teoriobjekter: **100**.
