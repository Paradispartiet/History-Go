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
| `idea` – kasus og tolkning var grunnleggende i tradisjonen | [Breuer/Freud 1895, LoC](https://www.loc.gov/item/76454571/); [Library of Congress – originalverket fra 1895](https://www.loc.gov/item/76454571/) | Originalverkets dokumenterte innholdsstruktur er kasus og fortolkning. Ingen kontrollgruppe eller uavhengig replikasjon som bekrefter Freuds symbolske kausalitet. |
| `method`, `limit` – moderne psykodynamisk terapi må skilles fra Freuds historiske mekanismer | [Leichsenring mfl. 2023, åpen fulltekst](https://pmc.ncbi.nlm.nih.gov/articles/PMC10168167/) | `open_fulltext_consulted`. Forhåndsregistrert systematisk paraplyoversikt av metaanalyser/RCT-er for **voksne** med depresjon, angst, personlighets- og somatiske symptomlidelser; funn støtter visse moderne psykoterapier, *ikke* original psykoanalytisk årsaksteori. Forfatterne drøfter eldre/små forsøk, behandlingsheterogenitet, bias og behov for flere studier. |
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
| `method`, `limit` – 2023-metaanalyse av CBT ved depresjon | [Cuijpers mfl. 2023, åpen fulltekst](https://onlinelibrary.wiley.com/doi/full/10.1002/wps.21069) | `open_fulltext_consulted`. 409 RCT-er, 518 sammenligninger, 52 702 deltakere; samlet `g=0,79` mot kontroller. For *andre psykoterapier* `g=0,06` i hovedanalysen (signifikant), men lav risiko for bias `g=0,02`, 95 % KI `-0,05` til `0,09`. Ulike kontrollbetingelser og bias forklarer hvorfor et enkelt globalt effekttall ville være misvisende. |
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

## 7. Utvidet etterprøvbarhet – påstand for påstand (10. oktober 2026)

Den nye strukturerte filen `reports/psychology/psykoteori_claim_units_group1_2026-10-10.json` dokumenterer **32 vurderingsenheter**: alle åtte synlige innholdsfelt (`founders`, `period`, `idea`, `method`, `limit`, `contrast`, `example`, `example_secondary`) × fire kort. Hver enhet har en avgrenset påstand, direkte kildeanker, angitt nivå på faktisk kildeinnsyn, metodisk motargument og en eksplisitt påminnelse om at totalstatus fortsatt er uverifisert. De åtte hypotetiske undervisningsscenariene er kontrollert som **redaksjonell merking**, ikke empiriske hendelser.

### Resultat fra uavhengig re-kontroll av publikasjoner

- **Psykoanalyse:** Library of Congress bekrefter `Studien über Hysterie` (1895), Freuds bruk av navnet i 1896 og `Die Traumdeutung` (1899–1900). Leichsenring mfl. (2023), *World Psychiatry* 22:286–304, DOI `10.1002/wps.21104`, ble kontrollert mot tilgjengelig fagartikkel med metoder, resultater og diskusjon. Forskergruppen undersøkte **moderne psykodynamisk psykoterapi hos voksne**, ikke gyldigheten av Freuds originale teori om drømmer og symbolske konflikter. Oversiktens egne konklusjoner om behandlingseffekt bygger på et vurderingssystem og er ikke uavhengig verifikasjon av alt historisk teoristoff.
- **Tilknytning:** Wellcomes Bowlby-arkiv bekrefter artikkelen fra 1958; PubMed bekrefter Ainsworth og Bell (1970), PMID 5490680, men uten sammendrag. Ainsworth, Blehar, Waters og Walls bok har **bibliografisk dateringssprik**: 1978 i enkelte bibliografiske oppføringer og 1979 hos forlagets gjeldende beskrivelse. Dette framgår nå av kortet. Opie mfl. (2021) er tilgjengelig som fulltekst via [PubMed Central](https://pmc.ncbi.nlm.nih.gov/articles/PMC7612040/). Resultater er `r = 0,28` (95 % KI 0,21–0,35) for trygg/utrygg og `κ = 0,23` (95 % KI 0,17–0,29) for fireveis klassifikasjon. Publiseringsskjevhet ble indikert ved Egger-testene (`p = 0,021` og `p = 0,007`), men en metaanalyse av gruppedata er **ikke** en test av omsorgskvaliteten hos et enkelt barn.
- **Resiliens:** Originalboken *Vulnerable, but Invincible* (Werner og Smith, 1982) finnes i Wellcomes bibliotekskatalog. Australian Institute of Family Studies registrerer Kauai-kohorten fra 1955 med 698 barn. Masten (2001, 2018) beskriver utviklingssystemer. Zalta mfl. (2021), PMID 33271023, er tilgjengelig som [åpen artikkel](https://pmc.ncbi.nlm.nih.gov/articles/PMC8101258/), med 139 tverrsnittsstudier / 37 longitudinelle studier av selvrapportert støtte og PTSD-plager hos **traumeeksponerte voksne**. `r = −0,27` og `r = −0,25` er sammenhenger, ikke estimater for årsaksvirkning eller barns resiliens.
- **CBT:** Ellis’ `Rational Psychotherapy` (*Journal of General Psychology*, 1958, DOI `10.1080/00221309.1958.9710170`) gir en separat primærkilde for hans gren av terapiutviklingen. Beck (1963) er kontrollert bibliografisk og med tilgjengelig forlagssammendrag. Kovacs mfl. (1981) gjelder **44** deprimerte voksne polikliniske pasienter i en kontrollert klinisk studie med oppfølging. Cuijpers mfl. (2023) er kontrollert mot [åpen original fulltekst](https://onlinelibrary.wiley.com/doi/full/10.1002/wps.21069): CBT mot kontroller `g = 0,79` med høy heterogenitet (`I² = 85 %`), lav risiko-for-bias-undergruppe `g = 0,60`, og publikasjonsjustert `g = 0,47`. Sammenligning mot andre psykoterapier: `g = 0,06`, i hovedanalysen signifikant, men ikke robust i de fleste sensitivitetsanalyser. Effektstørrelser er utvalgs- og kontrollgruppeavhengige.

### Åpen faglig sperre

`historical_bibliography_checked` betyr **ikke** at originalens komplette metodetabeller er lest. Fullstendig kritisk gjennomgang av originalkasuistikken fra 1895, Bowlby (1958), Ainsworth/Bell (1970), Kauai-bokas kohortfrafall og Beck (1963), sammen med triangulering av sekundær- og primærstudier, er fortsatt nødvendig for `source_verified`. Den nye påstandsmatrisen gjør manglene synlige, men løser dem ikke automatisk. **0/4 source-verified, 0/4 editorial-approved.**

## 8. Kildekontroll av originaltekst og oppfølgingsfunn (10. oktober 2026)

Denne kontrollen gjelder **faktisk leste, navngitte tekststeder**, ikke full godkjenning av alle fire teorikort.

### 8.1 Breuer og Freud (1895) – originalt forord og kasusutvelgelse

- **Verifikasjon:** [`Studien über Hysterie`, originalt forord transkribert på Wikisource](https://de.wikisource.org/wiki/Studien_%C3%BCber_Hysterie), kontrollert mot [førsteutgavens bibliografiske innholdsbeskrivelse hos Library of Congress](https://www.loc.gov/item/76454571/). Originalverket har kasusbeskrivelser, teori og en forløpertekst fra 1893.
- **Hva forfatterne selv opplyser:** De skriver at materialet bygger på privatpasienter fra en bestemt sosial kontekst, at pasientgjenkjenning gjorde offentliggjøring av enkelte observasjoner uforsvarlig, og at dette påvirket utvalget som ble publisert. Dette er *direkte primærkildekritikk*: publisert materiale representerer ikke nødvendigvis alt klinisk materiale.
- **Metodisk rekkevidde:** Direkte forordskontroll gir støtte for seleksjons- og rapporteringsbegrensninger. Den beviser ikke at kasusenes symptomer hadde de foreslåtte ubevisste årsakene; hele kasusmaterialet er ikke verifisert i denne runden. Mer spesifikke vurderinger av etikken må vurderes i lys av 1895-konteksten og etterfølgende forskningsstandarder.

### 8.2 Ainsworth (1970) versus Opie mfl. (2021)

- [Ainsworth og Bell (1970), PMID 5490680](https://pubmed.ncbi.nlm.nih.gov/5490680/) er bibliografisk identifisert, **uten sammendrag på PubMed**. Kortet skal ikke utgi artikkelens originale kodings- eller reliabilitetsresultater som fulltekstkontrollert.
- [Opie mfl. (2021), fulltekst i PubMed Central](https://pmc.ncbi.nlm.nih.gov/articles/PMC7612040/) presenterer senere metaanalyse av Strange Situation-baserte målinger i tidlig barndom. Fireveis `κ = 0,23` med `95 % KI [0,17; 0,29]` og trygg/utrygg `r = 0,28` med `95 % KI [0,21; 0,35]` står i resultat- og sammenligningsavsnittene. Forfatterne diskuterer variasjon etter utviklingsperiode og hvilke studier som inngår. Tallene er **sjansjustert kappa versus korrelasjon**, ikke to prosenter og ikke identiske måleobjekter.
- Kontrollen gir god evidens for **de eksakte rapporterte metaanalysetallene**, men full kritisk analyse av Ainsworths primære studier og klassifikasjonenes kulturelle måleinvarians er ikke avsluttet.

### 8.3 Kauai-kohorten – design før årsaksslutning

- Australian Institute of Family Studies viser [Kauai Longitudinal Study i sin internasjonale studietabell](https://aifs.gov.au/all-research/research-reports/childrens-health-and-development), som oppgir Kauai/Hawaii, start **1955**, utvalg **698**, rekruttering ved fødsel, seks registrerte innsamlingstidspunkter og oppfølging gjennom 32 år på tidspunktet for oversikten. Beskriver et etnisk sammensatt utvalg, omtrent halvparten fra familier i fattigdom.
- [Werner og Smith (1982), `Vulnerable, but Invincible`](https://wellcomecollection.org/works/wxaez2sy) er en faktisk historisk bok om dette longitudinelle materialet, men biblioteksposten har ikke effekttabeller.
- Utvalgsstørrelsen beskriver startkohorten. Uten frafalls-/måledata kan **698 ikke tolkes som N ved alle oppfølginger**, og utfall kan ikke knyttes kausalt til én bestemt faktor bare fra studiedesignet.
- [Zalta mfl. (2021)](https://pmc.ncbi.nlm.nih.gov/articles/PMC8101258/) undersøker voksne traumeeksponerte utvalg, med **139** tverrsnittsstudier og **37** longitudinelle studier (145 og 38 uavhengige effektstørrelser). `r = −0,27` og `r = −0,25` er støtte/PTSD-korrelasjoner, ikke en ny Kauai-analyse.

### 8.4 Beck, Kovacs og Cuijpers – longitudinell behandling versus mekanisme

- [Beck (1963), original publiseringsoppføring hos JAMA Psychiatry](https://jamanetwork.com/journals/jamapsychiatry/article-abstract/488402) har en innledende artikkeltekst om kognitive prosesser ved depresjon. Publiseringen **dokumenterer forskningshistorien**, ikke effektstørrelser for CBT.
- [Kovacs, Rush, Beck og Hollon (1981), PMID 7006557](https://pubmed.ncbi.nlm.nih.gov/7006557/) beskriver 44 ikke-psykotiske, ikke-bipolare deprimerte polikliniske pasienter i en kontrollert **12-ukers** sammenligning av kognitiv terapi mot imipramin. **35 protokollfullførere** ble undersøkt i **naturalistisk ettårsoppfølging**. Én selvrapportert depresjonsforskjell favoriserte CBT og var statistisk signifikant; øvrige omtalte mellomgruppeforskjeller var **ikke** signifikante. Dette må **ikke** formidles som at ingen av forskjellene var signifikante eller som bevist generell langtidsoverlegenhet.
- [Cuijpers mfl. (2023), fulltekst og tabell 2](https://onlinelibrary.wiley.com/doi/full/10.1002/wps.21069): `g = 0,79` mot kontroller, `I² = 85 %` og prediksjonsintervall `−0,45 til 2,04`. Etter begrensning til studier med lav risiko for skjevhet er `g = 0,60`, og etter trim-and-fill-korreksjon for publiseringsskjevhet `g = 0,47`. Mot andre psykoterapier var forskjellen `g = 0,06` i hovedanalysen, men ikke robust i flere sensitivitetsanalyser.
- **Avgrensning:** Original artikkel, tidlig behandlingsforsøk og moderne metaanalyse undersøker ikke det samme. Innholdet blir vitenskapelig feil om de slås sammen som direkte dokumentasjon for Becks kognitive årsaksmodell.

### 8.5 Revisjonsbeslutning og gjenstående krav

Den maskinlesbare 32-enheters påstandskontrollen er revidert med disse kildenes konkrete innhold og begrensninger. **Ingen enhet har `full_original_review_complete=true`; ingen teorikort er `source_verified`.** Dette betyr ikke at ingen funn er støttet; det betyr at *hele teorikortets kildeport* fortsatt krever kritisk originaltekstgjennomgang, utvalgs-/frafallsanalyse og tilstrekkelig dekning av hver underpåstand. Tredjeparts gjengivelse av primærverk eller metaanalyser kan ikke fylle de utestående leddene automatisk.
