# Psykoteori – vitenskapelig kildekontroll, produksjonsgruppe 1

**Dato:** 2026-10-10 · **Omfang:** `psykoanalyse`, `tilknytning`, `resiliens`, `kognitiv_terapi` · **Repository:** History-Go
**Beslutning:** *Kildespesifikke underpåstander forbedret og delvis kontrollert; ingen av de fire kortene er fullt kildeverifisert eller redaksjonelt godkjent.*
**Statuskontrakt:** `source_review_state=partial_historical_method_review` i katalogen, `source_review_status=not_reviewed` og `editorial_review_status=not_reviewed` i dekningsregisteret. Null nye canonical claim-/source-ID-er er opprettet.

## Metode, kildenivå og status

Kontrollobjektet er **utsagn × kilde × forskningsdesign**, ikke bare en fungerende lenke. For hvert kort skilles (1) original historisk publikasjon, (2) opprinnelig påstand, (3) observert empirisk funn, (4) senere systematisk evidens, (5) konkurrerende tolkninger og (6) klinisk eller individuell generaliseringsgrense. Primærutgaver, arkivposter, forlagsopplysninger, artikkelsammendrag og tilgjengelig fulltekst har ulik dokumentasjonsstyrke.

**Evidensnivå i denne gjennomgangen:**
- `historical_bibliography_checked`: forfatter, verk, årstall og dokumentert opprinnelse; ikke mekanisme- eller effektbevis.
- `abstract_or_index_checked`: eksplisitte resultater/metoder i indeksert sammendrag; ikke full risiko-for-skjevhet-audit.
- `open_fulltext_consulted`: en tilgjengelig forskningsartikkel er lest for dens rapporterte design, resultater og begrensninger; ikke uavhengig ny metaanalyse.
- `unresolved_fulltext`: originalens komplette metodedel, datasett, alle analyser eller full teknisk kvalitetssjekk er ikke verifisert. Dette **blokkerer** status `source_verified`.

## 1. Psykoanalyse

**Historisk spor:** Breuer og Freud utga *Studien über Hysterie* i **1895**, med kliniske kasus. Freud benyttet ordet psykoanalyse i **1896**; *Die Traumdeutung* ble publisert ved årsskiftet **1899/1900**. Dette er faghistoriske milepæler, ikke empirisk validering av en teori om drømmesymboler.

| Påstand / kortfelt | Konkret kilde | Kontroll og metodekritikk |
| --- | --- | --- |
| `founders`, `period` – Breuer/Freud 1895, 1896 og 1899–1900 | [Library of Congress – Freud timeline](https://www.loc.gov/collections/sigmund-freud-papers/articles-and-essays/timeline/); [1895-førsteutgave](https://www.loc.gov/item/76454571/) | `historical_bibliography_checked`. Arkivets poster oppgir verk og datoer, ikke pasientenes kliniske utfall. |
| `idea` – kasus og tolkning var grunnleggende i tradisjonen | [Breuer/Freud 1895, LoC](https://www.loc.gov/item/76454571/); [Wellcome-utgave](https://wellcomecollection.org/works/zx99vg7t/items?canvas=11) | Originalverkets dokumenterte innholdsstruktur er kasus og fortolkning. Ingen kontrollgruppe eller uavhengig replikasjon som bekrefter Freuds symbolske kausalitet. |
| `method`, `limit` – moderne psykodynamisk terapi må skilles fra Freuds historiske mekanismer | [Leichsenring mfl. 2023, åpen fulltekst](https://pmc.ncbi.nlm.nih.gov/articles/PMC10168167/) | `open_fulltext_consulted`. Forhåndsregistrert umbrella review av metaanalyser/RCT-er for **voksne** med depresjon, angst, personlighets- og somatiske symptomlidelser; funn støtter visse moderne psykoterapier, *ikke* original psykoanalytisk årsaksteori. Forfatterne drøfter eldre/små forsøk, behandlingsheterogenitet, bias og behov for flere studier. |
| `contrast` – teoriens begreper og behandlingsutfall er forskjellige beviskrav | [Leichsenring mfl. 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10168167/); [Freud Museum om fagkritikk](https://www.freud.org.uk/education/higher-education/freud-and-his-legacy-therapy-psychology-neuroscience/) | Museumssiden er et *undervisningstilbud*, ikke en klinisk metaanalyse. Den er beholdt som kilde til undervisningskontekst, ikke effektestimat. |

**Dokumentert historisk eksempel:** Kasusmaterialet i `Studien über Hysterie` (1895). Det dokumenterer at en bestemt metode ble praktisert og rapportert; vi tillegger ikke casene påvist årsaksforklaring. **Hypotetiske eksempler i appen:** de to eksisterende scenarioene er fortsatt merket undervisningsscenario.

**Åpent før `source_verified`:** uavhengig fulltekstbasert kontroll av originale kasus og falsifiserbare mekanismehypoteser; distinkt analyse av ulike former for psykodynamisk behandling og risiko for allegiance-/publikasjonsbias. Enkelte fulltekster og individuelle RCT-er er ikke kontrollert.

## 2. Tilknytningsteori

**Historisk spor:** Bowlbys `The Nature of the Child's Tie to his Mother` (**1958**) er en teoriformulering. Mary Ainsworths Uganda- og Baltimore-observasjoner, sammen med Ainsworth og Bells `Attachment, exploration, and separation` (**1970**) og boken `Patterns of Attachment` (**1978**), bidro til standardiserte observasjonsmetoder. Feltarbeid, teori og stabilitetsmetaanalyser har forskjellige empiriske oppgaver.

| Påstand / kortfelt | Konkret kilde | Kontroll og metodekritikk |
| --- | --- | --- |
| `founders`, `period` – Bowlby 1958 og Ainsworth 1970/1978 | [Wellcome – Bowlby 1958](https://wellcomecollection.org/works/ebjjsja2); [Ainsworth/Bell 1970](https://pubmed.ncbi.nlm.nih.gov/5490680/); [Van Rosmalen mfl. 2015](https://doi.org/10.1002/jhbs.21729) | `historical_bibliography_checked`. Van Rosmalen er vitenskapshistorisk undersøkelse av instrumentets forløpere; 1970-primærartikkelen er bibliografisk kontrollert, men full originalanalyse er ikke gjennomført. |
| `method` – standardisert separasjon og gjenforening | [Van Rosmalen mfl. 2015](https://doi.org/10.1002/jhbs.21729); [Ainsworth/Bell 1970](https://pubmed.ncbi.nlm.nih.gov/5490680/) | Tilknytning og utforsking undersøkes i spesifikke betingelser, ikke gjennom fri fortolkning av barnets personlighet. |
| `limit` – moderat stabilitet og publiseringsskjevhet | [Opie mfl. 2021, PMID 32772822](https://pubmed.ncbi.nlm.nih.gov/32772822/) | `abstract_or_index_checked`. Metaanalyse av tidlig barndom med Strange Situation-baserte metoder: trygg/utrygg `r=0,28`, fire kategorier `κ=0,23`; indikasjoner på publiseringsskjevhet. Dette er *gruppestabilitet*, ingen diagnose eller årsakseffekt. |
| `limit` – lengre tidsrom er ikke samme datasett | [Pinquart, Feussner og Ahnert 2013, PMID 23210665](https://pubmed.ncbi.nlm.nih.gov/23210665/) | Metaanalyse over bredere aldersperioder og instrumenter, med moderat gjennomsnittlig stabilitet. Estimater fra ulike utvalg skal ikke smeltes sammen til én prosent. |

**Dokumentert forskningscase:** Ainsworth og Bells publiserte Strange Situation-arbeid (1970), som illustrerer metodens historiske bruk. **Hypotetiske eksempler i appen:** ingen individuell omsorgsvurdering eller klassifikasjon av faktiske barn.

**Åpent før `source_verified`:** uavhengig fulltekstgjennomgang av klassifikasjonenes reliabilitet, metodisk heterogenitet, kulturell/målemessig generaliserbarhet og alle relevante originaltabeller. Originalverket fra 1958 og Ainsworth 1970 er ikke linje-for-linje-validert.

## 3. Resiliens og beskyttelsesfaktorer

**Historisk spor:** Werner og Smiths longitudinelle Kauai-program tok utgangspunkt i en fødselskohort fra **1955**; boka *Vulnerable, but Invincible* kom i **1982**. Masten sammenfattet i **2001** utviklingsresiliens som vanlige adaptive prosesser i samspill mellom systemer, ikke som en uforanderlig egenskap. I **2018** videreførte hun teorihistorien på individ- og familienivå.

| Påstand / kortfelt | Konkret kilde | Kontroll og metodekritikk |
| --- | --- | --- |
| `founders`, `period` – Werner/Smith 1982 | [Wellcome – Vulnerable, but Invincible](https://wellcomecollection.org/works/wxaez2sy); [WorldCat](https://search.worldcat.org/title/Vulnerable-but-invincible-%3A-a-longitudinal-study-of-resilient-children-and-youth/oclc/7551134) | `historical_bibliography_checked`. Bibliotekskatalogene bekrefter forfattere, verk, år og longitudinelt opplegg; **ikke** validert tallfestet årsakseffekt fra selve boken. |
| `idea` – systemiske tilpasningsprosesser | [Masten 2001, PMID 11315249](https://pubmed.ncbi.nlm.nih.gov/11315249/); [Masten 2018](https://doi.org/10.1111/jftr.12255) | `abstract_or_index_checked`. Teori-/forskningsoverblikk fra flere utviklingsdesign, ikke ett kontrollert inngrep som isolerer effekten av støtte. |
| `method`, `limit` – støtte og PTSD hos voksne | [Zalta mfl. 2021, PMID 33271023](https://pubmed.ncbi.nlm.nih.gov/33271023/) | `abstract_or_index_checked`. Ikke-kliniske, traumeeksponerte **voksne**: tverrsnitt `r=-0,27` (139 studier), longitudinelt `r=-0,25` (37 studier); `I²=91,6 %` og `86,5 %`. Ikke direkte måling av barns utviklingsresiliens, og ikke bevis for beskyttelsens kausale effekt. |

**Dokumentert forskningscase:** Kauai-studiens faktiske langsgående forskningsprogram. Ingen ubekreftede individhistorier eller universelle «resiliensprosenter» brukes. **Hypotetiske eksempler i appen:** de to studieoppleggene er pedagogiske konstruksjoner.

**Åpent før `source_verified`:** originalkohortens fulltekst/metodetabeller, frafallsanalyser, justering for konfundering, direkte effekt-/mekanismestudier for barn og anvendelsesgrenser på tvers av kulturer og livsfaser.

## 4. Kognitiv terapi og CBT

**Historisk spor:** Ellis utviklet en egen rasjonell-emotiv linje på 1950-tallet. Becks *Thinking and Depression I* ble publisert i **1963**; Beck, Rush, Shaw og Emerys *Cognitive Therapy of Depression* kom i **1979**. Tidlige kontrollerte kliniske studier ble senere fulgt av store synteser.

| Påstand / kortfelt | Konkret kilde | Kontroll og metodekritikk |
| --- | --- | --- |
| `founders`, `period` – Beck 1963 og manualen 1979 | [Beck 1963, PMID 14045261](https://pubmed.ncbi.nlm.nih.gov/14045261/); [Guilford – originalutgave](https://www.guilford.com/books/Cognitive-Therapy-of-Depression/Beck-Rush-Shaw-Emery/9781572305823/prior-editions) | `historical_bibliography_checked`. Den indekserte 1963-artikkelen har ikke sammendrag på PubMed. Historisk originaltekst og manualen er **ikke** RCT-bevis. |
| Tidlig dokumentert behandlingseksempel | [Kovacs, Rush, Beck og Hollon 1981, PMID 7006557](https://pubmed.ncbi.nlm.nih.gov/7006557/) | `abstract_or_index_checked`. Kontrollert klinisk forsøk/følgeundersøkelse med 44 polikliniske pasienter; seleksjon og størrelse begrenser overføring. Et enkelt tidlig forsøk avgjør ikke moderne evidens. |
| `method`, `limit` – 2023-metaanalyse av CBT ved depresjon | [Cuijpers mfl. 2023, åpen fulltekst](https://onlinelibrary.wiley.com/doi/full/10.1002/wps.21069) | `open_fulltext_consulted`. 409 RCT-er, 518 sammenligninger, 52 702 deltakere; samlet `g=0,79` mot kontroller. For *andre psykoterapier* `g=0,06` i hovedanalysen (signifikant), men lav risiko for bias `g=0,02`, 95 % KI `-0,05` til `0,09`. Ulike kontrollbetingelser og bias forklarer hvorfor et enkelt globalt effekttall ville villede. |
| `contrast` – CBT versus psykodynamisk behandling | [Cuijpers 2023](https://onlinelibrary.wiley.com/doi/full/10.1002/wps.21069); [Leichsenring 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10168167/) | Ulike oversikter og diagnoseområder; indirekte kryssstudiesammenligninger beviser **ikke** generell overlegenhet eller en felles mekanisme. |

**Dokumentert forskningscase:** Kovacs mfl. (1981) kontrollert behandling/følgeundersøkelse, presentert med avgrenset populasjon. **Hypotetiske eksempler i appen:** studieøvelsene i kortet er ikke anbefalinger om egenbehandling.

**Åpent før `source_verified`:** full vurdering av alle relevante primærforsøk og effektstørrelsenes sensitivitet for placebo-/ventelistekontroller, frafall, utfallsmål og kliniske retningslinjer. Becks 1963-original er foreløpig bare bibliografisk kontrollert.

## 5. Sammenligning på tvers av de fire kortene

| Kort | Primær evidensform | Hva forskningen *kan* vise | Hva den *ikke* viser |
| --- | --- | --- | --- |
| Psykoanalyse | Historiske kasus; moderne PDT-RCT/metaanalyser | Tradisjonshistorie og indikasjonsspesifikke behandlingsutfall | At Freuds opprinnelige tolkning av et kasus eller en drøm er riktig |
| Tilknytning | Feltobservasjoner, standardisert SSP, longitudinell metaanalyse | Mønstre og gjennomsnittlig stabilitet under spesifiserte målinger | Diagnose, omsorgsdom eller sikker individuell framtidsprognose |
| Resiliens | Longitudinelle kohorter og utviklingssynteser; voksen-PTSD-korrelasjoner | Samvariasjon og varierende tilpasningsforløp | Én medfødt «styrke» eller kausal effekt av all støtte |
| CBT | Modellartikler, kliniske RCT-er og RCT-metaanalyser | Effekt av konkrete behandlingsformer på definerte utfall | Universell overlegenhet, effektgaranti eller at all kognitiv teori er validert |

## 6. Forholdet til canonical Fagverk og publiseringsport

- `psykoanalyse` → `em_psy_psykoanalyse`, eksisterende `fti-08` og `fti-09` gjelder **museumshistorie og undervisning**; ingen av dem dokumenterer PDT-effekt.
- `tilknytning` → `em_psy_tilknytning_relasjon`, `uol-04`, `uol-05`, `uol-06` og `uol-26` bygger på de registrerte metaanalysene. Ny historisk litteratur får **ingen** oppdiktede canonical-ID-er.
- `resiliens` → `em_psy_resiliens_mestring`, `tkr-20` og `tkr-24` gjelder sosial støtte / PTSD og sammensatt beskyttelse, ikke direkte kausal barns resiliens.
- `kognitiv_terapi` → `em_psy_behandlingsformer`, `phi-07` gjelder norsk veiledet eBehandling, **ikke** originalforskning eller effektresultat fra Cuijpers.
- Koblingene til `em_psy_risiko_beskyttelse` beholdes uendret; ingen av de 40 emnene uten direkte teorikobling er tilordnet en udokumentert teori.
- Ingen Civication-karrierebevis, poeng, personskåring, diagnoser eller History Go-kjerne endres.

**Godkjenningsbeslutning:** 0 av 4 kort oppgraderes. En publiserings- eller CI-bestått PR for kildegrunnlaget skal ikke utløse `source_verified` før *hver* underpåstand har fullstendig sjekket original-/studiedokumentasjon, metodekritikk og tilstrekkelig eksternt belegg. Datamodellen har foreløpig ikke feltvis dokumentasjon for komplett fulltekstgjennomgang. Dette er en reell faglig sperre, ikke en testfeil.

**Neste faglige restanse innen gruppe 1:** Originalfulltekster (Bowlby/Ainsworth, Beck 1963, Werner/Smith, historiske Freud-kasus) og kvalitativ uavhengig review av de valgte systematiske oversiktene. Markér først den eksakte påstanden som verifisert, deretter hele kortet ved uttømmende vurdering.
