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

**Åpent før `source_verified`:** full vurdering av alle relevante primærforsøk og effektstørrelsenes sensitivitet for placebo-/ventelistekontroller, frafall, utfallsmål og kliniske retningslinjer. Becks 1963-original er nå gjennomgått i en lesbar tredjepartsreproduksjon av originaltrykket, med bibliografisk kontroll mot JAMA (se seksjon 11).

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

Denne kontrollen gjelder **faktisk leste, navngitte tekststeder**, ikke full godkjenning av alle fire teorikort. Forordet er i tillegg kontrollert mot [Sigmund Freud Edition, den vitenskapelige utgaven av originaltrykket fra 1895 (sidene III–IV)](https://www.freudedition.net/werke/vorwort/druckschrift-24), som oppgir sin originalkilde, faksimile og tekststatus.

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


## 9. Originalarbeider – metode, utvalg, resultater og forskningshistorie (ny kildekontroll 10. oktober 2026)

**Proveniens:** Publikasjonene identifiseres mot originaltidsskriftenes bibliografiske arkiver og forlag. Der lesbar originaltekst kommer fra tredjepartsreproduksjon, er dette *angitt eksplisitt*. Forlagets originalmetadata, originale tekstutdrag, bibliotekskataloger og indekserte sammendrag er ikke samme verifikasjonsnivå. Ingen full nyanalysering av rådata er gjennomført.

### Bowlby, 1958 – begreper og opprinnelig hypotese

- **Original:** John Bowlby, *The Nature of the Child's Tie to His Mother*, *International Journal of Psycho-Analysis* **39**, 350–373 (1958). [PubMed PMID 13610508](https://pubmed.ncbi.nlm.nih.gov/13610508/) bekrefter oppføringen, og [Wellcome-arkivet](https://wellcomecollection.org/works/ebjjsja2) har originaltrykk/reprint.
- **Kontrollert originaltekst:** Tilgjengelige utdrag av [reprodusert artikkel](https://www.studocu.com/in/document/indian-institute-of-psychology-research/counseling-psychology/bowlby-1958-the-nature-of-the-child-s-tie-to-his-mother/96429548), side 350 med note 2 og hypotesen om fem atferdskomponenter. Bowlby presiserte selv at uttrykket mor sikter til *personen som gir barnet omsorg og som barnet knytter seg til*, ikke nødvendigvis biologisk mor. Han foreslo **suging, klamring, følging, gråt og smil** som delsystemer. Dette er hans historiske teori, ikke en evidensbasert test av en bestemt biologisk mor–barn-relasjon.
- **Metodisk avgrensning:** Artikkelen er teoriformulering med tolkning av observasjoner, etologi og klinisk materiale, **ikke en kohort-RCT eller effektstudie**. Originalens øvrige argumentasjon og kritiske data er ikke uavhengig analysert fullstendig. Tilknytningskortet oppgir eksplisitt denne grensen.

### Ainsworth og Bell, 1970 – kontroll av originalmetoden

- **Original:** Mary D. S. Ainsworth og Silvia M. Bell, *Attachment, Exploration, and Separation: Illustrated by the Behavior of One-Year-Olds in a Strange Situation*, *Child Development* **41**(1), 49–67 (1970). [JSTORs originalregistrering](https://www.jstor.org/stable/1127388) og [PubMed PMID 5490680](https://pubmed.ncbi.nlm.nih.gov/5490680/) bekrefter bibliografien; PubMed har ikke sammendrag.
- **Kildetilgang:** [Tekstlig reproduksjon av JSTOR-artikkelens originaltrykk på StudyLib](https://studylib.net/doc/28483723/ainsworth-attachment--exploration--and-separation-illustr...), kontrollert med originalens trykte sidetall **49–67**. Dette er en tredjepartsopplasting, ikke en utgiverattestert tekst; originalbibliografien er kontrollert separat.
- **Metode og utvalg (trykte s. 53–56):** **56 hvite middelklassebarn** i alderen **49–51 uker**, rekruttert gjennom barneleger. **23** kom fra en longitudinell hjemmestudie og **33** fra et annet prosjekt. Åtte episoder, inkludert observasjon med omsorgsperson, fremmed, to separasjoner og gjenforening. Episodene kunne avkortes dersom barnet viste sterk uro. To observatører dikterte løpende observasjoner med 15-sekunds markeringer i store deler av materialet, men protokollen og observatørbemanningen var ikke helt identiske for hele utvalget.
- **Reliabilitet (trykte s. 54–56):** Forfatterne oppgir bl.a. korrelasjoner fra **4 tilfeller observert av begge**, **8 tilfeldig valgte tilfeller dobbeltkodet** for frekvensmål og **14 tilfeller dobbeltvurdert** for andre atferdsskalaer. Flere rapporterte korrelasjoner var høye, men de bygger på små delutvalg og på **spesifikke mål**. De må ikke forveksles med universell reliabilitet eller validitet for senere fireveis tilknytningsklassifikasjon.
- **Rapporterte funn (s. 56–59):** Utforsking sank når mor var borte, gråt og søk økte under separasjoner og nærhetssøking økte ved gjenforening. Dette er **gruppegjennomsnittlige mønstre i én historisk observasjonsstudie**. Det ble ikke demonstrert at én standardepisode kan diagnostisere et barns tilknytning eller vurdere omsorgspersoners samlede kvalitet.
- **Risiko for skjevhet og kunnskapshull:** Sosialt begrenset utvalg, avhengighet mellom episodene, metodisk variasjon under innsamlingen og små reliabilitetsdelutvalg. Senere analyse av instrumentets kulturelle måleinvarians og mer omfattende rådatamateriale gjenstår. Resultatene i **Opie mfl. (2021)** gjelder nyere metaanalyse og skal ikke retroaktivt tilskrives Ainsworth og Bell.

### Werner, 1989 og 1993 – longitudinelle originalanalyser

- **1989:** Emmy E. Werner, *High-Risk Children in Young Adulthood: A Longitudinal Study from Birth to 32 Years*, *American Journal of Orthopsychiatry* **59**, 72–81, DOI [10.1111/j.1939-0025.1989.tb01636.x](https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1939-0025.1989.tb01636.x). Forlagets **originalsammendrag** angir analyser av fødselskohorten fra 1955 og at betydningen av risiko/beskyttelse skiftet mellom livsfaser, delvis ulikt etter kjønn. Ingen spesifikke numeriske kausale effekter er tillagt artikkelen.
- **1993:** Werner, *Risk, Resilience, and Recovery: Perspectives from the Kauai Longitudinal Study*, *Development and Psychopathology* **5**(4), 503–515, DOI [10.1017/S095457940000612X](https://www.cambridge.org/core/journals/development-and-psychopathology/article/abs/risk-resilience-and-recovery-perspectives-from-the-kauai-longitudinal-study/DC3C3F10587A1A7D04C0310270717B3E). Artikkelen kom i **trykt årgang 1993**, men forlagets nettside viser **2009** som tidspunktet for digital publisering. Dette skal ikke feiltolkes som at studien stammer fra 2009. Originalforfatterens sammendrag lister oppfølging ved **fødsel, 1, 2, 10, 18 og 32 år**.
- **Metodekritikk:** Startkohorten på **698 barn** er ikke det samme som analysens tilgjengelige antall ved hver oppfølging. Werner (1993) er nå i tillegg delvis lest i originaltrykksreproduksjon: studien identifiserte 201 høyrisikobarn blant overlevende i 698-kohorten og 72 motstandsdyktige innenfor denne høyrisikogruppen. Ved 32-årsoppfølging ble tilgjengelig data rapportert for 88 % av den motstandsdyktige høyrisikogruppen, 90 % av tenåringsmødrene og 80 % av høyrisikounge med alvorlig psykisk helse- og/eller lovbruddshistorie. Disse tre er undergruppespesifikke oppfølgingsandeler, **ikke** totalretensjon for 698-kohorten. Et samlet, uavhengig revidert frafallsregnskap og full vurdering av konfunderingsmodellene gjenstår. Resultater for **Zaltas voksne PTSD-populasjon (2021)** er uavhengig litteratur og ikke et direkte estimat fra Kauai-kohorten.

### Beck, 1963 – historisk observasjon versus klinisk effekt

- **Original:** Aaron T. Beck, *Thinking and Depression: I. Idiosyncratic Content and Cognitive Distortions*, *Archives of General Psychiatry* **9**(4), 324–333 (1963), DOI [10.1001/archpsyc.1963.01720160014002](https://jamanetwork.com/journals/jamapsychiatry/article-abstract/488402). [PubMed PMID 14045261](https://pubmed.ncbi.nlm.nih.gov/14045261/) har ikke sammendrag.
- **Faktisk inspisert tekst:** JAMA-originalens innledning ble først lest på forlagssiden. Deretter er **alle ti sidene av originaltrykket (324–333)** gjennomgått via [lesbar tredjepartsreproduksjon](https://essex-behavioural-therapy.co.uk/documents/client/Aaron%20T.%20Beck%20Article%2C%201963.pdf). Metadata er sammenholdt med JAMA; vertskapet for kopien er ikke utgiver.
- **Konklusjon etter originaltekstgjennomgang:** Becks kliniske utvalg, sammenligningsgruppe, datainnsamling, funn og eksplisitte metodeforbehold kan nå etterprøves i originaltrykket. Studien gjaldt **50 pasienter med depresjon og 31 ikke-deprimerte psykiatriske sammenligningspasienter**; den målte ikke randomisert CBT-effekt. Separate effektstudier er fortsatt **Kovacs mfl. (1981)** og **Cuijpers mfl. (2023)**. Uavhengig design- og biasvurdering er fortsatt ikke sluttført.

### Status etter denne runden

| Kort | Primærtekst nå faktisk undersøkt | Sentrale åpne spørsmål | Godkjenning |
| --- | --- | --- | --- |
| `tilknytning` | Bowlby-originalens begrepsdel og Ainsworth/Bell-originalens metode/funn i digitalisert reproduksjon | Uavhengig kvalitetskontroll av fullstendige originaltabeller, kulturell generaliserbarhet og senere målevaliditet | **Ikke godkjent** |
| `resiliens` | Werner 1989 forlagssammendrag; Werner 1993 originaltrykksreproduksjon, metode og delresultater s. 503–509 | Resten av primærresultatene, samlet frafall, modelljusteringer og originalbok | **Ikke godkjent** |
| `kognitiv_terapi` | Beck 1963, originaltrykk s. 324–333 i tredjepartsreproduksjon; JAMA-bibliografi kontrollert | Uavhengig vurdering av seleksjons- og observatørbias, replikasjon og mekanismens kausalitet | **Ikke godkjent** |
| `psykoanalyse` | Breuer/Freud 1895, forord kontrollert mot kritisk tekstutgave | Full kontroll av kasus, moderne PDT-forsøkenes risiko-for-skjevhet og mekanismer | **Ikke godkjent** |

Eksisterende **32 påstandsenheter**, `source_review_state=partial_historical_method_review`, `source_review_status=not_reviewed`, `editorial_review_status=not_reviewed` og 14-korts baseline beholdes til den komplette kvalitetsporten faktisk er bestått.


## 10. Kvalitativ revisjon av Werner (1993) – differensierte nevnere og oppfølging

**Primærkilde:** Werner (1993), *Development and Psychopathology* 5:503–515, [Cambridge publiseringsoppføring](https://www.cambridge.org/core/journals/development-and-psychopathology/article/abs/risk-resilience-and-recovery-perspectives-from-the-kauai-longitudinal-study/DC3C3F10587A1A7D04C0310270717B3E), sammenholdt med [lesbar reproduksjon av originaltrykket](https://www.scribd.com/document/799482252/Werner-1993). Reproduksjonen er ikke utgiverattestert; metodiske utsagn skal derfor beholde sporbar tilgangsgrad.

| Originaltrykk | Påstand som nå kan kontrolleres | Evidensgrense |
| --- | --- | --- |
| s. 503–504 | Fødselskohorten var **698** barn på Kauai i 1955; Werner rapporterer at **54 %** vokste opp i fattigdom | Måler historisk kohort og dens kontekst; ikke en landsrepresentativ, randomisert gruppe |
| s. 504–505 | Av de overlevende barna ble **201** klassifisert som høyrisiko etter sammensatte kriterier; **72 av de 201** hadde positivt utviklingsforløp som ikke viste de alvorlige problemene som ble definert for andre i gruppen | Klassifikasjonene er operasjonalisert for denne kohorten; tallet 72 er **ikke** andelen av alle 698 fødsler |
| s. 505–507 | Voksenutfall ble vurdert med semistrukturerte intervjuer og offentlige dokumenter som bl.a. helsetjeneste-/rettsregistreringer | Intervjuer og offentlige registre har ulik dekning; rettslige og helsemessige indikatorer er ikke nøytrale universelle mål på «suksess» |
| s. 507 | Voksenoppfølgingen inkluderte **88 %** av tidligere motstandsdyktige høyrisikodeltakere, **90 %** av tenåringsmødre og **80 %** av høyrisikoungdom med historikk for alvorlige problemer | Andeler gjelder **separate undergrupper**, ikke hele fødselskohorten eller eksakte effektstørrelser |
| s. 509 ff. | Forfatteren analyserte sammenkoblede beskyttelsesfaktorer og livsløp, bl.a. støtte fra andre voksne, skole og overgang til voksenliv | Longitudinelle sammenhenger kan ikke uten videre tolkes som kausale effekter av omsorg, kjønn eller én bestemt ressurs |

**Særskilt metodisk risiko:** Klassifikasjon av resiliens krever både forhåndsdefinert belastning og utviklingsutfall. Utvalgsseleksjon, overlevelse, voksenoppsporing og definisjon av «god tilpasning» kan påvirke hva man observerer. Påstand om en **universell «én tredel»-regel** ville være uriktig: 72 er en beskrevet undergruppe blant 201 høyrisikobarn, og oppfølgingsandelene har egne nevnere.

Den strukturerte kildeaudit-filen har nå i tillegg `original_publication_audit.entries` med **åtte eksplisitte primærkildeporter**, nøyaktig tilgangsgrad og det faglige punktet som fortsatt blokkerer `source_verified`. Hele teorikortene forblir **ikke godkjent**, selv om bestemte bibliografiske og metodiske delpåstander er bedre belagt.


## 11. Nytt primærkildegjennombrudd: Beck (1963) – originalartikkel med metodisk kritikk

**Proveniens (kontroll 10. oktober 2026):** [JAMA Psychiatry, originalpublikasjon](https://jamanetwork.com/journals/jamapsychiatry/article-abstract/488402), DOI `10.1001/archpsyc.1963.01720160014002`, sammenholdt med [skannet originaltrykk hos tredjepartsvert (ti sider, 324–333)](https://essex-behavioural-therapy.co.uk/documents/client/Aaron%20T.%20Beck%20Article%2C%201963.pdf). Tredjepartsverten er **ikke** originalutgiver, men avtrykkets bibliografi, sidetall og artikkelstruktur samsvarer med JAMA. Originaltrykkets s. 325, 326, 332 og 333 er lest for metode, funn og metodekritikk.

| Kontrollpunkt | Dokumentert i Becks originalartikkel | Vitenskapelig grense |
| --- | --- | --- |
| Utvalg, s. 325 | **50** deprimerte pasienter (16 menn, 34 kvinner; 18–48 år), **31** ikke-deprimerte psykiatriske sammenligningspasienter. Hovedsakelig middel-/overklasse; pasientene ble sett i terapi/psykoanalyse. | Klinisk, ikke befolkningsrepresentativ seleksjon; historiske diagnosekategorier svarer ikke direkte til dagens kriterier. |
| Datagrunnlag, s. 325 | Beck nedtegnet selv håndskrevne opplysninger i behandlingssamtaler, både pasienters retrospektive rapporter og spontane ytringer. | Terapeut var samtidig registrator; ingen rapportert uavhengig blindet koding av det sentrale samtalematerialet. Risiko for selektiv rapportering, bekreftelses- og observatørbias. |
| Rapportererte funn, s. 326 og 333 | Negative selvevalueringer, selvbebreidelse, opplevd deprivasjon og katastrofetolkninger ble beskrevet hos deprimerte pasienter; flere typer kognitive forvrengninger ble kategorisert. | Grupper ble sammenlignet på kliniske beskrivelser, ikke på et forhåndsregistrert, randomisert mekanismeforsøk. |
| Forfatterens egne forbehold, s. 332–333 | Beck påpeker begrenset generaliserbarhet og problemene med håndskrevne terapinotater; han omtaler behov for mer systematiske undersøkelser og blindet koding. | Hypotesen om at tanker forårsaker depresjon er **ikke bevist**. Beck åpner selv for gjensidig påvirkning mellom affekt og kognisjon. |
| Behandlingseffekt | Studien beskrev tankeinhold og kliniske fortolkninger; det var ikke tilfeldig fordeling mellom CBT og kontrollbehandling. | Klinisk CBT-effekt må undersøkes i andre studier, med spesifisert indikasjon og sammenligningsbetingelse. |

### Foreløpig selvstendig metodekritisk gjennomgang – de fire teoritradisjonene

Dette er en **kvalitativ, kildespesifikk** vurdering av tydelige feilkilder. Den er ikke en full, dobbeltvurdert ROBINS-I-/RoB-2-evaluering, og vurderingskriteriene er ulike for historisk teori, laboratorieobservasjon, longitudinell kohort og kasuistikk.

| Primærgrunnlag | Vesentlig risiko for skjevhet | Beslutning for History Go |
| --- | --- | --- |
| Breuer/Freud 1895 | Kasusutvelgelse og terapeutens tolkning; mangler uavhengig kausal test | Godt belegg for **historisk praksis**; ikke godkjenning av Freuds mekanismer. |
| Ainsworth/Bell 1970 | 56 sosialt ensartede spedbarn; 23/33 fra ulike opplegg; reliabilitetsdelutvalg 4/8/14 og prosedyrer med variasjon | Historisk observasjonsfunn; ikke generell diagnostisk validitet eller kulturell generaliserbarhet. |
| Werner 1989/1993 og Werner/Smith 1982 | Observasjonell kohort; risikodefinisjon, tap til oppfølging, endrede livsfaser og mulige konfunderende faktorer | Utviklingsforløp og samvariasjoner; **ikke** en kausal «resiliensprosent» eller universell beskyttelsesfaktor. |
| Beck 1963 | Klinisk seleksjon, notatbasert registrering og mulig terapeut-/observatørbias; ingen randomisering | Dokumentert begreps-/forskningstradisjon og kliniske observasjoner, **ikke** isolert årsaksmodell eller terapibevis. |

**Ny status:** Full 1963-originaltekst er funnet og gjennomgått for den aktuelle, avgrensede metodekontrollen. Den tidligere sperren «kun innledning tilgjengelig» for *Beck 1963* er derfor lukket. Den bredere sperren på grunn av **uavhengig bias- og replikasjonskontroll** består. Werner og Smiths bok fra 1982 er fortsatt ikke fulltekstkontrollert. **0/4 `source_verified`, 0/4 redaksjonelt godkjent; ingen endring i kortenes statusfelt.**


## 12. Werner/Smith (1982) og Werner (1993) – særskilt bokkontroll og utvidet metodekritikk

**Kontrollens proveniens, 10. oktober 2026:**
- **1982-originalbok:** Werner, Emmy E. og Smith, Ruth S., *Vulnerable, but Invincible: A Longitudinal Study of Resilient Children and Youth*. McGraw-Hill (1982), ISBN 0-07-069445-1, 229 nummererte sider. Kontrollert mot [Google Books' bibliografiske oppføring og begrensede innholdsoversikt](https://books.google.com/books?id=1YqZAAAAIAAJ) og [Open Library-utgaven, OL4260161M](https://openlibrary.org/books/OL4260161M/Vulnerable_but_invincible); Wellcomes bibliografipost er allerede registrert. Den digitaliserte boken er **ikke** tilgjengelig for fullstendig kildelesning gjennom de kontrollerte åpne visningene. Søkeord og delvis innholdsfortegnelse **verifiserer ikke** metode, frafall eller resultattabeller.
- **Skille mellom forskningsfaser:** Den nevnte 1982-boken om barn og ungdom må ikke tilskrives den senere **32-årsoppfølgingen**. Werners 1989-artikkel dokumenterer eksplisitt oppfølging fra fødsel til 32 år i publisert abstract ([Wiley, januar 1989](https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1939-0025.1989.tb01636.x)). Werner (1993) henviser til *Overcoming the Odds: High Risk Children from Birth to Adulthood* (Werner og Smith, **1992**) for en mer detaljert beskrivelse av voksenoppfølgingen og stidiagrammene (se s. 503 og 508–509). Disse tre arbeidene har ulike dokumentasjonsfunksjoner.
- **1993-originalartikkel:** [Cambridge University Press' forlagsregistrering](https://www.cambridge.org/core/journals/development-and-psychopathology/article/abs/risk-resilience-and-recovery-perspectives-from-the-kauai-longitudinal-study/DC3C3F10587A1A7D04C0310270717B3E), `Development and Psychopathology` 5(4):503–515, DOI `10.1017/S095457940000612X`. **Alle trykte sider 503–515 er nå undersøkt** via [lesbar tekstlig tredjepartsreproduksjon](https://www.scribd.com/document/799482252/Werner-1993). Forlaget attesterer publikasjonen, **ikke** kopien. Denne tilgangen er sterkere enn bare abstract, men gir ikke uavhengig rådatakontroll.

### 12.1 Resultater og metode som originalen eksplisitt dokumenterer

| Trykt side | Observasjon fra originalartikkelen | Korrekt evidensnivå |
| --- | --- | --- |
| 503–505 | Fødselskohort `N=698` fra 1955, definert høyrisikogruppe `n=201` blant overlevende, og `n=72` i et positivt forløp innenfor denne høyrisikogruppen. Omtrent 54 % av startkohorten vokste opp i fattigdom. | Historiske utvalg og studiens egne operasjonaliseringer. **Ingen universell en-tredelsregel**; `72/201` gjelder den definerte undergruppen. |
| 505–507 | Oppfølging med semistrukturerte voksenintervjuer og samfunnsregistre; vokseninformasjon for 88 %, 90 % og 80 % av **tre forskjellige undergrupper**. | Intervju-/registerdata; prosentene skal **ikke** slås sammen til kohortens totale retensjon. |
| 508–510 | Werner beskriver `latent-variables path analyses` for forbindelser mellom tidligere egenskaper, sosial støtte, skoleutvikling og voksenutfall. Mer detaljerte stidiagrammer oppgis å finnes i **Werner og Smith (1992), appendiks I, s. 240–245**. | En observasjonell, modellavhengig stianalyse. **Ikke** et randomisert forsøk eller bekreftelse på at hver modellert sti er kausal. Fullstendige koeffisienter og modelltilpasning kan ikke revideres uten 1992-vedlegget. |
| 510–511 | Originalen beskriver ulik mønsterstyrke etter kjønn og livsfase, blant annet forskjeller mellom individuelle ressurser og støtte utenfra. | Analyse i denne kohorten, med tids- og kulturkontekst; ikke stabile, universelle kjønnsregler. |
| 513 | Werner presiserer at forskningen gjelder barn og unge som etablerte positive forløp med **uformell støtte**, ikke mottakere av evaluerte intervensjonstjenester. | Kan **ikke** brukes som direkte effektstudie av bestemte tiltak, selv om den kan generere hypoteser. |
| 513–514 | Werner advarer om overføring på tvers av kulturelle **utviklingsnisjer** og omtaler at samme egenskap kan ha ulik verdi i ulike sammenhenger. | En metodisk generaliseringsgrense formulert av originalforfatteren selv. |

### 12.2 Uavhengig kvalitativ vurdering av mulige feilkilder

- **Seleksjon/definisjon:** Resiliensundergruppen er definert ved både tidligere risikokriterier og registrerte utviklingsutfall; en slik klassifisering kan påvirkes av måleinstrumenter og hvilke utfall forskerne anser som problematiske. Resultatene er følsomme for dette valget.
- **Frafall og overlevelse:** Startkohorten og de tre nevnte voksenundergruppene har ulike nevnere. Uten fullstendig oversikt over dødsfall, oppsporing, manglende målinger og forskjeller mellom fulgte/ikke-fulgte kan risiko for selektiv oppfølging ikke lukkes.
- **Utfallsvaliditet:** Intervju, egne vurderinger og offentlige registre kan gi ulike observasjonsgrenser. For eksempel er skoleprestasjoner, lovbruddsregistrering og subjektiv livstilfredshet forskjellige konstruksjoner som ikke uten videre summeres til en universell «god tilpasning»-skår.
- **Statistiske antakelser:** At en latent stianalyse beskriver en tidsordnet sammenheng, fjerner ikke uobserverte fellesårsaker, målefeil eller risiko for feil modellspesifikasjon. En statistisk «sti» er ikke det samme som kausal identifikasjon. De opprinnelige analysediagrammene fra 1992 og de fullstendige modellkoeffisientene er ikke kontrollert.
- **Overførbarhet:** Studien beskriver et stedfestet, flerkulturelt historisk utvalg fra Kauai. Werners egne kulturforbehold tilsier at man ikke kan bruke resultatene som ubetingede normer for enkeltbarn eller andre miljøer.
- **Intervensjon:** Kohortstudien er viktig for teori og forebyggingshypoteser, men dokumenterer ikke behandlings- eller programeffekt. Den separate Zalta-metaanalysen gjelder voksne med traumebakgrunn og skal ikke brukes til å fylle dette hullet.

**Restanse, eksplisitt avgrenset:** Full tilgang til Werner og Smith (1982), Werner (1989) artikkelmetode og Werner og Smith (1992), særlig appendiks I s. 240–245, samt et fullstendig frafallsregnskap og vurdering av eventuelle uavhengige kohortreplikasjoner. En 13-siders tredjepartsreproduksjon av Werner (1993) lukker et *tilgangshull for artikkelen*, men ikke disse vitenskapelige kontrollkravene.

**Beslutning:** Resilienskortets kronologi, metode og begrensninger er presisert. `source_review_state=partial_historical_method_review`, `source_review_status=not_reviewed` og `editorial_review_status=not_reviewed` beholdes. Fremdeles **0/4 `source_verified`** for produksjonsgruppe 1; ingen uverifiserte canonical-ID-er eller individuelle prognoser.


## 13. Werner og Smith (1992) – egen primærkildeport og uavklart kohortnevner

**Forlags- og katalogkontroll:** [Cornell University Press, `Overcoming the Odds` (1992)](https://cornellpress.cornell.edu/book/9780801480188/overcoming-the-odds/), originalt ISBN 9780801480188, og [US National Library of Medicine, NLM ID 101063381](https://www.ncbi.nlm.nih.gov/nlmcatalog/101063381). 1993-artikkelen henviser eksplisitt til **Werner og Smith (1992), appendiks I, trykte s. 240–245**, for stidiagrammer. Cornell annonserer en åpen utgave under lisens CC BY-NC-ND 4.0. Den komplette teksten og appendikset er **ikke** hentet inn og verifisert ved denne kontrollen; forlagets tilgangsopplysning er derfor ikke lik gjennomført originalfulltekstlesning.

### 13.1 Tallene beskriver ikke samme mengde

| Oppføring | Oppgitt N | Hva oppføringen faktisk dokumenterer | Feilaktig slutning som må unngås |
| --- | ---: | --- | --- |
| Werner 1993, trykt s. 503–504 | **698** | Antallet barn født i 1955 som ble utgangspunktet for den opprinnelige Kauai-undersøkelsen | At 698 er antall voksne ved 32-årsoppfølging |
| Cornell University Press' omtale av Werner og Smith (1992) | **505** | Antall menn og kvinner som forlaget sier voksenstudien bygger på | At `505 / 698` er metodisk verifisert retensjon uten å kjenne kriteriene |
| NLM-katalogomtale av Werner og Smith (1992) | **614** | Katalogen omtaler «a 1955 cohort of births (614 births)» og oppgir voksenutvalget til 505 | At 614 uten videre betyr overlevende eller en annen dokumentert undergruppe. NLM-tallet må forenes med 1993-originalen før den nevneren kan brukes. |
| Werner 1993, trykt s. 504–507 | **201 og 72** | Definert høyrisikogruppe og positiv utvikling innen denne | At de er komplette undergrupper av alle voksne eller universelle andeler |
| Werner 1993, trykt s. 507 | **88 / 90 / 80 %** | Oppfølging innenfor tre forskjellige historisk definerte undergrupper | At disse tre prosentene er samlet retensjonsgrad |

**Dette er et faktisk kildekritisk avvik, ikke et regnestykke som kan «fikses» med antakelser.** Uten opprinnelige tabeller for inklusjon, fødselskohort, overlevende, emigrasjon, oppsporing og deltakelse kan ingen utregning fra 505, 614 og 698 autoriseres som studiens totale retensjon. Katalogtekst kan også inneholde forenkling eller feil: originalverkenes metodekapitler er avgjørende.

### 13.2 Kildedekning og faglig sperre

- **Sikkert dokumentert:** Et eget oppfølgingsverk fra 1992 ble utgitt av Cornell University Press. Bokens forlagsomtale beskriver 505 voksne. NLM-katalogen beskriver den samme boken med 505 voksne, men et avvikende fødselstall, 614. Werner (1993) oppgir 698 for 1955-startkohorten.
- **Foreløpig utilgjengelig for direkte kontroll:** 1992-verkets komplette metode- og frafallsregnskap, appendiks I og stidiagrammenes faktiske koeffisienter; dessuten 1982-bokens primærtabeller. Cornell oppgir åpent nedlastbart format, men fullteksttilgang ble ikke gjennomført i den aktuelle gjennomgangen.
- **Neste avklaringsport:** Kontrollér 1992-metodekapittelet og appendiks I s. 240–245 og skriv et eksplisitt flytskjema for inkluderte og ekskluderte deltakere ved hver måling, med proveniens for hvert N. Deretter vurder modellerte indirekte/medierte forbindelser, sensitivitetsanalyser og kulturell generaliserbarhet opp mot moderne metodestandard.

**Registerendring:** `original_publication_audit.entries` økes fra 8 til **9**, med særskilt `resiliens_werner_smith_1992`, uten å øke antallet påstandsenheter (32) eller oppgradere noen teori. `source_verified=0/4` består.


### 13.3 Lokalisert originalt metodeapparat – bibliografisk kontroll, ikke fulltekstrevisjon

**Ny dokumentkontroll 10. oktober 2026:** En [digitalisert tredjepartskopi av originalutgavens innholdsfortegnelse](https://external.dandelon.com/download/attachments/dandelon/ids/AT002A83A5830F7925FA4C1257D1C002C734A.pdf) er lest og visuelt kontrollert. Denne kopien er **bare tre PDF-sider** (forside og innholdsoversikt) og inneholder ikke selve appendiksene. Innholdsoversikten angir følgende *trykte* sider i Werner og Smith (1992):

| Originalside | Navngitt del i innholdsoversikten | Kildekritisk bruk |
| ---: | --- | --- |
| 173 | Kapittel 9, «Protective Factors and Adult Adaptation» | Identifisert for direkte metode- og resultatrevisjon, ikke undersøkt fulltekst. |
| 213 | Appendiks I: tabell 1–28 | Plassering bekreftet; de enkelte tabellene er **ikke** avlest. |
| 242 | Appendiks I: figur A1–A4 | Plassering bekreftet; diagrammer, estimater og modelltilpasning er **ikke** undersøkt. |
| 249 | Appendiks II: «Summary of Data Base: Kauai Longitudinal Study» | Primært kontrollpunkt for å avklare kohort- og oppfølgingsnevnere. |
| 251 | Skåringssystem for prenatale/perinatale komplikasjoner | Kontrollpunkt for operasjonalisering av risiko. |
| 253–260 | Voksenoppfølgingens intervjuer, spørreskjema og vurderingssystem | Kontrollpunkt for målevaliditet og definisjoner av voksenutfall. |

**Sammenstilling:** Werners henvisning i 1993-artikkelen til appendiks I s. 240–245 kan nå knyttes til en identifisert figurseksjon fra **s. 242**. Det bekrefter *hvor* materialet skal finnes, ikke hva pilene, de latente variablene eller koeffisientene faktisk viser. [Google Books' katalogoversikt](https://books.google.com/books/about/Overcoming_the_Odds.html?id=b0f4Xo_sjUIC) og [ERIC ED344979](https://eric.ed.gov/?id=ED344979) understøtter bokens identitet og voksenstudien (505), men ga alene ingen forklaring på NLMs 614 mot originalartikkelens 698. En ny, eksplisitt **sekundærkildedokumentert** forklaring er nå ført under 13.4; primærverifikasjon gjenstår.

**Utgavekontroll:** [Google Books' 2019-registrering av samme verk](https://books.google.com.sg/books?id=lf6tDwAAQBAJ) plasserer Appendix I ved s. **211** og Appendix II ved s. **247**, mens originalutgavens skannede innholdsfortegnelse identifiserer henholdsvis tabellene fra s. **213** og databaseregisteret fra s. **249**. Dette kan skyldes ulik paginering/utgaveoppsett. Derfor må både sidehenvisning og utgave/ISBN dokumenteres når originalappendiksene faktisk hentes; sidetall fra 1992 og 2019 skal ikke blandes uten side-for-side-verifikasjon.

**Revidert kontrollrekkefølge:** (1) Skaff verifiserbar originalfulltekst av appendiks II s. 249 og introduserende metodekapittel fra s. 17; (2) lag kildebundet kohort-/oppfølgingsflyt for 698, 614 og 505 uten antatte nevnerdefinisjoner; (3) gjennomgå tabell 1–28 og figur A1–A4 samt modellspesifikasjon, konfundering og frafall. Cornell annonserer åpen tilgjengelighet, men verifisert fulltekst for disse sidene foreligger fortsatt **ikke**. Alle faglige statusflagg og 32 påstandsenheter er uendret.


### 13.4 Ny sekundærkilde om nevneren 614 – sannsynlig løsning, ikke primærkildegodkjent

**Ny kilde, dokumentert 10. oktober 2026:** [Sandra S. Clemmer (1998), *Modifying School Curricula to Promote the Resiliency of At-Risk Children: A Case Study*, Virginia Polytechnic Institute and State University, doktoravhandling, PDF-side 27 (nullbasert sideindeks 26), trykt s. 17](https://vtechworks.lib.vt.edu/bitstreams/76732796-0454-4c10-b63a-41cd164f56ba/download). Forside/forfatter/datering og det konkrete avsnittet er visuelt kontrollert i universitetsarkivets skann. Clemmer skriver at oppfølgingsdata forelå for **505 av 614 overlevende kohortmedlemmer**, svarandel omkring **82 %**, og henviser til **Werner og Smith (1992), s. 26–34**. Universitetets avhandling er en *sekundær framstilling av originalen*, ikke råmateriale eller primærverifikasjon.

| Tall | Kildekjede | Presis, foreløpig tolkning | Hva som fortsatt mangler |
| ---: | --- | --- | --- |
| **698** | Werner 1993, trykt s. 503–504 | Opprinnelig 1955-fødselskohort | Originalt kohortregister, døds-/utflyttingsavgrensning. |
| **614** | Clemmer 1998, trykt s. 17 med eksplisitt 1992-henvisning | **Mulig antall overlevende** ved voksenoppfølging, og dermed nevneren for svarandel. NLMs sammendrag kaller derimot tallet «births»; den teksten er ikke tilstrekkelig presis. | Direkte lesning av Werner/Smith 1992 s. 26–34 og Appendix II s. 249; på hvilket tidspunkt «surviving» måles, og hvem som ellers ble ekskludert. |
| **505** | Cornell-forlagets omtale; NLM; Clemmer 1998 | Voksne med oppfølgingsdata, *hvis* Clemmers referat av 1992-originalen er riktig. | Primærtabell og presisering av fullstendige/delvise data og om alle 505 inngår i samtlige analyser. |

**Betydning:** Regnestykket `505/614 ≈ 82,2 %` kan *foreløpig refereres som en sekundærkildes oppgitte oppfølgingsandel*, **ikke** presenteres som et selvstendig primærverifisert frafallsestimat eller brukes til å si at `698-614 = 84` personer døde. Det sistnevnte kan ikke konkluderes uten primærmaterialets tidsavgrensning, datadefinisjoner og eventuelle andre eksklusjoner. Heller ikke `505/698` er gyldig som voksenstudiens justerte svarandel uten en dokumentert flyt. Distinksjonen mellom samlet kohortoppfølging og de tre rapporterte undergruppeprosentene 88/90/80 opprettholdes.

**Kildehierarki og beslutning:** Clemmers **1998-doktoravhandling er et betydelig spor**, fordi den både knytter 614 til begrepet «surviving» og peker på originale metodesider, men den oppgraderer **ikke** `source_verified`. Neste låste primærkildeport er Werner/Smith 1992 **s. 26–34**, deretter **Appendix II s. 249–260** og stidiagrammer i **Appendix I s. 240–245**. Først når nevner og frafallsgrunner er bekreftet med sidereferanser kan kohortregnskapet og modellernes seleksjonsskjevhet vurderes kvantitativt.


### 13.5 Voksenutfall som sammensatt mål – utfallsmålenes validitet og primærkildetilgang

**Ny avgrenset originaltekstkontroll (Werner 1993, trykt s. 505–506).** Kontrollen bygger på [lesbar tredjepartsreproduksjon av originalartikkelen](https://www.scribd.com/document/799482252/Werner-1993), med bibliografi kontrollert mot [Cambridge University Press](https://www.cambridge.org/core/journals/development-and-psychopathology/article/risk-resilience-and-recovery-perspectives-from-the-kauai-longitudinal-study/DC3C3F10587A1A7D04C0310270717B3E). Forfatteren definerer vurdering av voksen tilpasning fra **to komplementære datatyper**, ikke fra én universell resiliensskår:

| Utfallskilde | Beskrevet operasjonalisering i 1993-originalen | Kildekritisk konsekvens |
| --- | --- | --- |
| Semistrukturert voksenintervju | Deltakernes opplevelse av arbeid/utdanning, relasjoner til partnere, barn og andre, familie-/sosialt liv og psykisk velvære | Ulike subjektive livskvalitetskriterier er ikke nødvendigvis måleinvariante over kjønn, epoke eller kultur; intervju-/kodingsreliabilitet må etterprøves. |
| Samfunns- og myndighetsregistre | Skole og arbeid, registreringer hos rettsvesen, psykiatriske helsetjenester og andre offentlige instanser | Registerdekning varierer med geografisk tilstedeværelse, praksis for registrering og faktisk tilgang til tjenester; registrert hendelse er ikke identisk med faktisk forekomst. |
| Forskerdefinerte negative indikatorer | S. 506 nevner bl.a. domfellelser, mishandling, forsømt forsørgelse, kroniske rusproblemer og psykiatriske/psykosomatiske lidelser som tegn på manglende vellykket voksen tilpasning | Konstruktet blander sosial funksjon, juridiske forhold og helse; dette må omtales som *studiens historiske vurderingskriterier*, ikke som moralsk rangering, klinisk diagnose eller objektiv resiliensindikator for enkeltpersoner. |

**Viktige distinksjoner:** At rettsregisteret også ble benyttet til å undersøke skilsmisser og sivile saker, betyr **ikke** at enhver skilsmisse eller sivilsak automatisk ble klassifisert som negativt voksenutfall. Den konkrete skåringsregelen står i Werner og Smith (1992), appendiks II, og er fortsatt ikke kontrollert. Tilsvarende er behandling i psykisk helsevern et mål på **registrert tjenestekontakt**, ikke nødvendigvis symptombelastning. Mulige seleksjonsforskjeller mellom personer som forble på Hawaii og personer utenfor registerdekning må testes mot de opprinnelige reglene.

**Boktilgang fortsatt ikke godkjent:** [Cornell University Press](https://cornellpress.cornell.edu/book/9780801480188/overcoming-the-odds/) annonserer en åpen nedlastbar utgave, og [De Gruyter Brill](https://www.degruyterbrill.com/document/doi/10.7591/9781501711992/html) indekserer 2019-eBokens kapitler («The Context of the Study» fra s. 17, «Appendixes» fra s. 211). Den undersøkte kapittelsiden hos De Gruyter markerer imidlertid kapittelinnhold som utilgjengelig fra denne tilgangen, og fullstendige primærsider **26–34, 240–245 og 249–260** er ennå ikke avlest. Metadata, innholdsoversikt, åpen-tilgangsmerking og studier av sekundærkilder **er ikke** fulltekstverifisering. Det er heller ikke korrekt å bruke detaljene i 1993-artikkelen som bevis på 1992-appendiksets ukontrollerte skåringsvekter, sti-estimater eller frafallsdefinisjoner.

**Faglig konklusjon:** Resilienskortet og kilde–påstand-matrisen kan legitimt opplyse hvilke typer data Werner beskrev i 1993 og hvilke tolkninger de ikke tillater. 1992-originalens utvalgskriterier, skåringsregler, kontroll for konfundering og faktiske sti-koeffisienter er uavklarte. Derfor er `full_original_review_complete=false` og `source_verified=0/4` uendret; det er ikke gjennomført en full ekstern reanalyse av modellene.


### 13.6 Sekundærkilder 1998/2009: 837, 698, 614 og 505 samt modelltyper

**Avgrenset oppfølgingskontroll 10. oktober 2026, etter seksjon 13.5.** Kildene nedenfor er to faktisk leste universitetsavhandlinger og kontrollerte bibliografiske forlagsregistreringer, **ikke** en ny fulltekstlesning av Werner og Smith (1992).

| Kilde | Dokumentert utsagn | Kildekritisk vurdering |
| --- | --- | --- |
| [Sandra S. Clemmer (1998), *Modifying School Curricula to Promote the Resiliency of At-Risk Children*, Virginia Tech, trykt s. 17 / PDF-side 27](https://vtechworks.lib.vt.edu/bitstreams/76732796-0454-4c10-b63a-41cd164f56ba/download) | Sekundærgjengivelse av 505 oppfulgte av 614 «surviving» medlemmer ved 31–32 år, med henvisning til Werner/Smith 1992 s. 26–34. | Relevant kryssjekk for oppfølgingsnevneren; ikke direkte kontroll av hvilken dato «surviving» gjelder eller hvorfor personer ikke inngår. |
| [John W. Hodge (2009), *Let Our Youth Speak*, Virginia Tech, trykt s. 40–44 / PDF-sider 51–55](https://vtechworks.lib.vt.edu/bitstreams/9ad30459-8961-409c-9143-4eb128e9cae8/download) | Oppgir et **starttall 837**, at 505 er «332 fewer» (837 − 505 = 332), og at 505 er 82 % av 614 overlevende. Hodge oppgir **1989** for *Vulnerable, but Invincible*. Det finnes et dokumentert opptrykk fra **1989**, så henvisningen kan være korrekt dersom det er denne utgaven han brukte. | Aritmetikken med **837** er riktig gitt *hans valgte nevner*, men **837 er ikke den dokumenterte 698-barnskohorten i Werner (1993)**. Avhandlingen forklarer ikke et tilstrekkelig kildebelagt sprang 837 → 698; referansen til 1989-utgaven er **ikke i seg selv en feildatering**, men avhandlingens konkrete bibliografiske utgavehenvisning må fortsatt kontrolleres. Må **ikke** brukes som dokumentasjon på 332 frafalte barn. |
| [Emmy Werner (1993), trykt s. 503–504, originaltrykk-reproduksjon](https://www.scribd.com/document/799482252/Werner-1993) | 698 barn født på Kauai i 1955. | Direkte originalartikkelbelegg for antallet barn i fødselskohorten. |
| [Cornell University Press, bokomtale](https://cornellpress.cornell.edu/book/9780801480188/overcoming-the-odds/) og [NLM-katalogen](https://www.ncbi.nlm.nih.gov/nlmcatalog/101063381) | Begge oppgir 505 voksne; NLM beskriver 614 som «births». | Katalogomtaler er ikke metodetabeller. Ordet «births» kan ikke uten primærkontroll likestilles med sekundærkildenes «surviving». |

**837 er nå en *egen ubekreftet nevner*, ikke et alternativt attestert tall for fødte barn.** En nyere [tertiær nettoversikt](https://en.arabpsychology.com/experiments/kauai-longitudinal-study-resilience-werner-smith/) omtaler 837 som *registrerte svangerskap* før en kohort på 698 levende fødte, men gir ikke verifiserbare primærsidetall for tallrekken. Mulig forskjell mellom svangerskap og levende fødte er dermed en **hypotese**, ikke en godkjent forklaring. 837 − 698 = 139 er bare en differanse mellom to uavklarte definisjoner, **ikke** et påvist antall fostertap, dødfødsler eller eksklusjoner. 698 − 614 = 84 er på samme måte **ikke** bekreftet antall dødsfall.

**Metodisk skille:** Hodge (2009), s. 42–44, beskriver *diskriminantfunksjonsanalyse* av gruppetilhørighet ved 31–32 år, mens Werners artikkel fra 1993, s. 508–510, beskriver *stianalyse med latente variabler*. [Google Books' 2019-register](https://books.google.com.sg/books?id=lf6tDwAAQBAJ) indekserer blant annet «discriminant function», «canonical correlation» og «latent variables». Dette gjør flere analysetyper plausible i bokverket, men **gir ingen grunnlag for å behandle klassifikasjonsnøyaktighet fra diskriminantanalyse som sti-koeffisienter, kausale indirekte effekter eller validerte prediksjoner på nye personer**. Fullstendige analyseutvalg, koeffisienter, tilpasningsmål, klassifikasjonsprosedyrer og validering er uavklart.

**Sekundær opplysning om operasjonalisering:** Hodge (2009), s. 43, oppgir seks kriterier for «successful coping», inkludert tilfredshet med arbeid, partner, foreldrerolle og relasjoner samt sosial støtte og livstilfredshet. Han skriver i ett av disse kriteriene «no record of divorce or abuse» og oppgir 478/505 som «successful adult adaptation». Dette er **ikke kontrollert mot den originale skåringsmanualen** og kan ikke overføres som fasit til teorikortet. Det øker behovet for etterprøving av normative og kulturelt betingede kriterier; det er ikke grunnlag for å hevde at skilsmisse eller kontakt med tjenester i seg selv betyr fravær av resiliens.

**Låst restanse:** Avles Werner og Smith (1992), s. **26–34** og appendiks II (spesifikk utgave/paginering kreves) for definisjonene 837, 698, 614 og 505, overlevelse/oppsporing, nevner per utfall, samt de faktiske skåringsreglene. Avles deretter appendiks I med modellfigurene og de relevante tabellene før kvalitativ eller kvantitativ modell-/biasgodkjenning. Cornell oppgir en åpen bokutgave, men faktisk nedlasting/lesing av de primære delene er **ikke verifisert i denne kontrollen**. **Ingen** kildestatus oppgraderes, ingen ny «retensjonsprosent» fra startkohorten rapporteres og de 32 påstandsenhetene er uendret.


### 13.7 Utgavekontroll: 1989-opptrykk, fullteksttilgang og gjenværende originalkrav

**Bokutgavene må skilles fra nye forskningsstudier.** [CiNii Books (NCID BA13269997)](https://ci.nii.ac.jp/ncid/BA13269997?l=en), [Open Library (OL2182607M)](https://openlibrary.org/books/OL2182607M/Vulnerable_but_invincible) og [Google Books' opptrykkspost](https://books.google.com/books/about/Vulnerable_But_Invincible.html?id=J7K_QgAACAAJ) dokumenterer at *Vulnerable, but Invincible* ble gitt ut første gang av McGraw-Hill **1982**, mens **Adams, Bannister, Cox publiserte et opptrykk i 1989** (ISBN 0937431036; 228 nummererte sider). Werner selv henviser til nettopp **1989-opptrykket** med tillegget «Originally published by McGraw Hill, 1982» i [Acta Paediatrica, 1997, referanse 2](https://onlinelibrary.wiley.com/doi/10.1111/j.1651-2227.1997.tb18356.x). Dermed var rapportens tidligere omtale av Hodges 1989-henvisning som feil **uriktig og er korrigert**. Det er fremdeles ikke bekreftet hvilken utgave Hodge faktisk brukte, men 1989 er ikke i seg selv en feil. Den **selvstendige** Werner-artikkelen fra 1989 (*High-Risk Children in Young Adulthood*) og den **nye** Werner/Smith-boken *Overcoming the Odds* fra 1992 må fortsatt holdes atskilt fra dette opptrykket.

**1992-originalverket og tilgangen til metodeapparatet – faktisk kontroll utført:** [Cornell University Press' bokside](https://cornellpress.cornell.edu/book/9780801480188/overcoming-the-odds/) merker verket «Open Access», mens [De Gruyter Brills kapittelregistrering for kapittel 4](https://www.degruyterbrill.com/document/doi/10.7591/9781501711992-007/html) uttrykkelig viser «You are currently not able to access this content». Forsøk på åpning av fullbok-PDF via dokumentets offentlige DOI-adresse \`https://www.degruyter.com/document/doi/10.7591/9781501711992/pdf\` ga **ikke tilgjengelig dokument** i dette oppslaget. **En OA-etikett og lenke til PDF er derfor ikke verifisert leseadgang eller fulltekstrevisjon.** Tilgang kan variere med klient og institusjon. Originalsidene **26–34**, **240–245** og appendiks II med datadefinisjoner, skåringskriterier og modelldiagrammer er **fortsatt ikke lest**, og verken 837 → 698 → 614 → 505 eller sti-modellenes estimater skal oppgraderes til primærbekreftede tall.

**Separat metodisk kvalitetskrav ved senere tilgang:** (1) dokumentere *utgave og sidetall* for hver primærside; (2) bygge deltakerflyt med eksplisitt nevner, eksklusjon og måletidspunkt; (3) skille diskriminantfunksjonsanalyse, kanonisk korrelasjon og latent stianalyse; (4) hente faktiske sti-koeffisienter, metode for estimering, utvalgsstørrelse per modell, modelltilpasning og håndtering av manglende data; (5) vurdere overførbarhet og validitet av voksenutfall. Ingen slike resultater er funnet via bare katalogtekst. Det er **ingen ny studie, ingen beregnet samlet kohortretensjon, ingen vitenskapelig godkjenning**.

**Revisjonsbeslutning:** Rettet utgavehistorie på resilienskort og dekningsspeil. Den pågående kildekontrollen omfatter fortsatt **32 eksisterende underpåstander og 9 originalpublikasjonsporter**. Alle \`full_original_review_complete\` forblir \`false\`, og \`source_verified\` er fortsatt **0 av 4**.


## 14. Lohmöller (1984) og PLS: metodehistorisk identifikasjon uten modellgodkjenning

**Kildekontroll 10. oktober 2026.** Werner (1993), trykt s. 508, skriver eksplisitt at hun benyttet *latent-variables path analyses* og henviser til **Lohmöller (1984)**; se [1993-originalens lesbare reproduksjon](https://www.scribd.com/document/799482252/Werner-1993), kontrollert mot Cambridge University Press' artikkelmetadata. [Jan-Bernd Lohmöllers metodebok fra 1989, publisert hos Springer/Physica](https://link.springer.com/book/10.1007/978-3-642-52512-4) dokumenterer at *Partial Least Squares* (PLS) er metodefamilien i hans arbeid med modeller med latente variabler; bokens kapittel «The Basic and the Extended PLS Method» starter s. 27, og «Predictive vs. Structural Modeling: PLS vs. ML» starter s. 199. [Den originale metodeartikkelen fra 1988](https://pubmed.ncbi.nlm.nih.gov/26782261/) bekrefter tittelen *The PLS Program System: Latent Variables Path Analysis with Partial Least Squares Estimation*.

**Det er metodisk uholdbart å tolke denne bibliografiske koblingen som bevis for en bestemt estimator eller spesifikk implementering i Kauai-modellene.** Werner og Smiths *Overcoming the Odds* (1992), appendiks I, har fortsatt ikke vært tilgjengelig til fullstendig lesning. Vi kjenner derfor ikke de faktiske sti-koeffisientene, antall deltakere per modell, operasjonalisering av latente variabler, håndtering av manglende data, intern validering eller hvilke tilpasnings-/usikkerhetsmål som eventuelt ble beregnet. En PLS-metodereferanse er heller ikke det samme som kausal identifikasjon, eksperimentell effekt eller replikert forklaringsmodell.

**Tilgangsporten er fortsatt åpen:** Cornell University Press merker 1992-boken som Open Access, og De Gruyter Brill indekserer hele boken og kapittel-/appendikssider, men forsøk på åpning av de direkte bok-PDF-endepunktene via tilgjengelig nettleser gav ikke lesbart originaldokument. Disse forsøkene verifiserer verken metodekapittelet s. 26–34, figurer A1–A4 eller data-/skåringsappendiks II. Opplysningene er derfor lagt til som kildeavgrenset *metodehistorie* i det eksisterende resilienskortet og én tilhørende påstandsenhet, ikke som en reanalyse.

**Registerbeslutning:** Ingen nye canonical claim/source-ID-er, 32 påstandsenheter, 9 originale kildekontrollporter og fortsatt 0/4 sluttgodkjente kort. `full_original_review_complete=false` og `source_verified` uendret.


## 15. Primærtilgang og kildekonflikt: 614 fødsler eller overlevende

**Tilgangskontroll 10. oktober 2026:** [Cornell University Press](https://cornellpress.cornell.edu/book/9780801480188/overcoming-the-odds/) beskriver *Overcoming the Odds* (Werner og Smith, 1992) som *Open Access* med CC BY-NC-ND 4.0-lisens, mens [De Gruyter Brills bokregistrering](https://www.degruyterbrill.com/document/doi/10.7591/9781501711992/html) viser bokas frontmateriell som «Publicly Available». [Kapittel 4](https://www.degruyterbrill.com/document/doi/10.7591/9781501711992-007/html) vises samtidig med «You are currently not able to access this content». Direkte oppslag mot eBokens PDF-adresse `https://www.degruyter.com/document/doi/10.7591/9781501711992/pdf` ga ingen tilgjengelig PDF i web-visningen. Dette er en **verifisert tilgangsbegrensning i denne kontrollen**, ikke bevis for at boken ikke finnes åpent andre steder. Den offentlige [ERIC-registreringen](https://eric.ed.gov/?id=ED344979) oppgir et sammendrag om 505 voksne, **ikke** bokens fullstendige datatabeller.

**Kildekonflikten består på definisjonsnivå:** [Werners artikkel fra 1993](https://www.cambridge.org/core/journals/development-and-psychopathology/article/abs/risk-resilience-and-recovery-perspectives-from-the-kauai-longitudinal-study/DC3C3F10587A1A7D04C0310270717B3E) angir 698 fødte barn; [NLMs katalogsammendrag](https://www.ncbi.nlm.nih.gov/nlmcatalog/101063381) omtaler en kohort på «614 births», mens [Clemmer (1998), trykt s. 17](https://vtechworks.lib.vt.edu/bitstreams/76732796-0454-4c10-b63a-41cd164f56ba/download) angir 614 *overlevende* og 505 oppfulgte, med eksplisitt sekundærhenvisning til Werner/Smith (1992), s. 26–34. Begge kan ikke automatisk gis samme operasjonelle betydning. Dessuten oppgir enkelte sekundære fremstillinger 837 med andre og uklare nevnerdefinisjoner. Den autoritative originalteksten med inklusjoner/eksklusjoner er **ikke kontrollert**. Ingen av differansene 837−698, 698−614 eller 614−505 kan beskrives som kategoriserte utfall (f.eks. dødsfall eller ikke-deltakelse) uten å kjenne når og hvordan tallene ble definert.

**Neste primærkildeport (og eneste faglige løsning):** Verifiserbar lesning av Werner/Smith (1992) **s. 26–34** og Appendix II (originalens s. 249–260 / eventuelt andre sidetall i 2019-utgaven) for kohortflyt og skåringsregler; deretter Appendix I med figur A1–A4 for faktisk stianalyse. Registrer originalutgave, side, nevner per analysesteg og eventuelt overlevelse/oppsporing før retensjonsestimater eller parameterverdier publiseres. Ikke skap fiktive tabeller på grunnlag av publisert indeks.

**Implementert sikkerhetsgrense:** Teorikortets `limit`, eksisterende claim-enheters kildeforbehold og 14-korts evidensmatrise skiller nå eksplisitt NLMs *614 births* fra sekundærkildenes *614 survivors* og 1993-originalens *698 births*. Denne presiseringen oppgraderer **ikke** primærkildestatus eller `source_verified` (fortsatt 0/4).


## 16. Werners egen kohortbeskrivelse fra 1989 – treårig svangerskapsregister og voksenoppsporing

**Ny primærkildelesning 10. oktober 2026:** Emmy E. Werner, «Children of the Garden Island», *Scientific American* **260(4)**, april 1989, trykte s. **106–111**, i [seks siders reproduksjon lagret hos University of North Carolina Wilmington](https://people.uncw.edu/hungerforda/Infancy/PDF/gardenisland.pdf). Alle seks PDF-sider er **kontrollert visuelt**. Dette er en **samtidig, forfatterbasert forskerredegjørelse i et populærvitenskapelig tidsskrift**, ikke originaldatasettene eller en fagfellevurdert reanalyse. Teksten er skrevet av Emmy Werner selv og gir derfor høyere proveniens for studiens historikk enn en uspesifisert sekundærkilde.

| Originalside | Direkte avlest fra Werner (1989) | Nødvendig definisjonsavgrensning |
| --- | --- | --- |
| **106** | **2 203 svangerskap** registrert i **1954–1956**, inkludert **240 fosterdødsfall** og **1 963 levende fødte**. Av sistnevnte ble **698 barn født i 1955** valgt som fødselskohort. | Tallene 2 203 / 240 / 1 963 gjelder **tre år**, mens 698 gjelder **fødte barn i ett år**. Differansene kan ikke brukes til å beskrive 837 eller 614 uten ytterligere dokumentasjon. |
| **106** | Oppfølging ved alder 1, 2, 10, 18 og 31–32 år. Werner beskriver tidlige oppfølgingsandeler på **96 % av levende barn** ved toårskontrollen, **90 % av overlevende** ved tiårskontrollen og **88 % av kohorten** ved 18-årskontrollen. | Nevnerne og tidspunktet er forskjellige og må ikke slås sammen til en generell «retensjonsrate». Tallene er avrundede forfatteropplysninger uten en samlet individflyttabell. |
| **108D** | Werner omtaler **201 høyrisikobarn**, 129 med senere alvorlige problemer, og **72 med positivt utviklingsforløp**. | Særskilt historisk definert undergruppe, ikke generelt utfallsmål for hele kohorten. |
| **110** | Oppsporingsarbeid startet i **1985**; forskerne fant **545 personer**, omtalt som omtrent **80 % av kohorten**. Werner fant **62 av de 72** tidligere «resiliente» ungdommene. | 545 er oppsporede i dette historiske oppsporingssteget. **Ikke** en kontrollert nevneridentitet med de 505 voksne forlaget beskriver i *Overcoming the Odds* (1992). Det er heller ikke dokumentert at alle 545 inngikk i samtlige analyser. |
| **111** | Werner omtaler forskningens forebyggingsimplikasjoner, men skriver at evaluering av slike intervensjonsprogrammer fortsatt kan bidra til å forstå prosessene. | Observasjonell kohortkunnskap er ikke en randomisert eller kontrollert dokumentasjon av programeffekt. |

**Betydning for uavklarte 837/614/505:** Denne nye primærkilden bekrefter **698** som fødselskohortens størrelse og dokumenterer et tidligere oppsporingstall **545**. Den definerer **ikke 837**, og det står **ikke** at 614 er antall fødte eller overlevende ved 31–32 år. Den løser dermed **ikke** kildekonflikten mellom NLM-katalogens «614 births» og de sekundære avhandlingenes «614 survivors». En mulig forbindelse til antall svangerskap i et bestemt år kan **ikke sluttes fra totalen for 1954–1956**. 505 fra 1992-forlagets omtale må fortsatt verifiseres mot originalbokens inklusjons- og analyseutvalg.

**Beslutning:** Originalartikkelen fra 1989 er registrert som selvstendig historisk primærkildespor for `resiliens__method` og metode-/begrensningsfeltene, med nytt URL-speil i deknings- og evidensmatrisene. Den eksisterende `resiliens__limit` får en kildesatt generaliseringsgrense om ulike historiske voksenutvalg. Den løser **ikke** 1992-originalbokens sperrede metodeappendikser. Fortsatt **14 teorikort, 32 påstandsenheter, 9 primærkildeporter, 0/4 vitenskapelig godkjente**; ingen nye canonical claim/source-ID-er eller påstått reanalyse.


## 17. Originalartikkel fra 1968: tiårsutvalg 866 er ikke 1955-fødselskohorten 698

**Ny primærpublikasjonsport 11. oktober 2026.** Emmy Werner, J. M. Bierman, Fern E. French, Kenneth Simonian, Angie Connor, Ruth S. Smith og Myrna Campbell (1968), «Reproductive and Environmental Casualties: A Report on the 10-Year Follow-Up of the Children of the Kauai Pregnancy Study», *Pediatrics* 42(1):112–127, DOI [10.1542/peds.42.1.112](https://doi.org/10.1542/peds.42.1.112). [American Academy of Pediatrics' originalpubliserte sammendrag](https://publications.aap.org/pediatrics/article/42/1/112/44332/REPRODUCTIVE-AND-ENVIRONMENTAL-CASUALTIES-A-REPORT) er lest, mens artikkelens fulle 16 sider er registrert som betalings-/tilgangsbegrenset og **ikke** lest.

**Eksakt utvalgsavgrensning:** Det originale forlagssammendraget sier at en kohort født **1955** og en **separat valgt gruppe født 1956** ble inkludert i tiårsundersøkelsen, **N=866**. Den senere longitudinelle **1955-fødselskohorten N=698** fra Werner (1993) er derfor **ikke** samme analysenevner. Ingen subtraksjon mellom 866 og 698 eller andre tall kan tolkes som frafall, overlevelse eller eksklusjon. Utvalget fra 1956 er ikke tallfestet separat i sammendraget og skal ikke estimeres ved differanse.

**Undersøkelsesdesign og observerte sammenhenger:** Artikkelens sammendrag beskriver opplysninger fra registre, lærervurderinger, gruppetester og diagnostiske vurderinger ved tiårsalder, med uavhengige hjemmemiljøvurderinger av sosioøkonomisk status, læringsstimulering og emosjonell støtte. Forskerne rapporterte særlige sensoriske/sentralnervøse og kognitive forskjeller i den lille gruppen som hadde overlevd alvorlige perinatale komplikasjoner; miljøvurderingene var også assosiert med intellektuelle, skolefaglige og emosjonelle problemer. Dette er **observasjonelle sammenhenger fra sammendraget**, ikke en kausal identifikasjon av bestemte beskyttelsesmekanismer, behandlingseffekt eller garanti om barns voksenutfall.

**Kildestyrke og videre krav:** Originalt forlagssammendrag er sikrere dokumentasjon på publikasjon og oppgitte hovedresultater enn en sekundær avhandling, men det verifiserer **ikke** full tabellstruktur, analyser, seleksjon, mulig frafall eller måleinstrumentenes validitet. 1968-artikkelen er derfor ført som en **egen originalkildeport** med status `publisher_abstract_only`. Den åpne 1992-bokoppføringen hos Cornell gir fortsatt **ikke verifisert** full tilgang til metodekapittelet (s. 26–34) og appendiks I/II. Konflikten omkring 614 og 505 og usikkerheten om PLS-stier forblir åpne.

**Registerstatus etter denne endringen:** **14** teorikort, **32** påstandsenheter, **10** originalpublikasjonsporter (ny: 1968), **0/4** `source_verified`. Ingen oppgradering av faglige eller redaksjonelle godkjenningsflagg. 


## 18. Ainsworth og Bell (1970) – fulltekst, skåringsreliabilitet og NAPS 00762

**11. oktober 2026 – full originaltekst kontrollert.** Hele det trykte tidsskriftbidraget til Mary D. Salter Ainsworth og Silvia M. Bell, «Attachment, Exploration, and Separation: Illustrated by the Behavior of One-Year-Olds in a Strange Situation», *Child Development* **41(1):49–67** (1970), er gjennomgått i [20-siders JSTOR-merket tredjepartsreproduksjon](https://www.fre.uy/a/e68bbdc6/Ainsworth.Attachmentexplorationandseparation.pdf), kontrollert bibliografisk mot [PubMed PMID 5490680](https://pubmed.ncbi.nlm.nih.gov/5490680/) og [JSTOR, DOI 10.2307/1127388](https://www.jstor.org/stable/1127388). PDF-ens første side er JSTOR-forside; de påfølgende 19 sidene er originaltrykkets s. 49–67. Metode og tabell ble dessuten visuelt kontrollert i originalskannet format. Dette er **komplett lesning av den trykte artikkelen**, ikke kontroll av alle tilhørende separat arkiverte instrumenter, rådata eller en uavhengig replikasjon.

| Primærside | Dokumentert metode/funn | Avgrensning |
| --- | --- | --- |
| **49, 53** | **56** spedbarn fra **hvite middelklassefamilier**. To delutvalg: **23** fra et longitudinelt hjemmestudieprosjekt observert ved **51 uker**, og **33** fra Bells selvstendige prosjekt observert ved **49 uker**. | To datakilder med ulike observasjonshistorier, ingen representativ befolkningssampling. |
| **53–54** | **Åtte standardiserte episoder**, men ulike kode-/observasjonsprosedyrer under datainnsamlingen: to observatører vanligvis; for de første **14** ble lydopptaksmetoden erstattet av diktat + skriftlige notater; for Bells **33** barn var Bell eneste observatør. | Observasjonsrutinene var ikke identiske for alle 56; forfatterne dokumenterer dette i originalteksten. |
| **54** | Reliabilitet på observasjonsnarrativet undersøkt i **fire** dobbeltobserverte kasus, med rapporterte Pearson-koeffisienter **0,99** for tre utforskningsmål og **0,98** for gråt. | Fire dobbeltobserverte tilfeller er ikke test av generell instrumentvaliditet eller tilfeldig samplet reliabilitet for alle 56. |
| **54–55** | Uavhengig koding av frekvensmål i **åtte tilfeldig valgte** kasus: rapporterte korrelasjoner **0,99, 0,93, 0,98, 0,99** for henholdsvis lokomotorisk, manipulerende, visuell utforskning og gråt. Kodingsintervallet var 15 sekunder og standardepisode 3 minutter. | Ulike reliabilitetsoperasjoner skal ikke slås sammen til én tallfestet klinisk målesikkerhet. |
| **55–56** | Fem grupper sosial atferd ble kodet til **sjupunktsskalaer**; to uavhengige skårere ble undersøkt på **14 tilfeldig valgte** kasus. Forfatterne rapporterer rho **0,93** (nærhetssøking), **0,97** (kontaktvedlikehold), **0,93** (unngåelse), **0,96** (kontaktmotstand), **0,94** (søk). | Dette er skåringsreliabilitet for konkrete observerte atferder, **ikke** generelle diagnostiske tilknytningskategorier. |
| **56, fotnote 1** | Prosedyre, instruksjoner til mor, frekvenskoding og sosial atferdskoding ble deponert hos **National Auxiliary Publications Service, dokument 00762**. | **NAPS 00762 er identifisert i originalen, men ikke lokalisert/avlest**, så instrumentreplikasjon kan ikke fullgodkjennes. |
| **57 og 60** | Reaksjoner er episoderelaterte. Gråt økte **ikke signifikant** ved bare fremmeds tilstedeværelse (episode 3, rapportert **p = 0,068**); senere separasjonsrespons var forskjellig. Originalens **tabell 1** viser observerte kontaktmotstands- og unngåelsesfordelinger. | Ikke omtolk dette til årsaksbevis eller sikre klassifikasjoner av barn. |
| **64–65** | Ainsworth og Bell presiserer at *tilknytning* ikke er det samme som øyeblikkelig *tilknytningsatferd*, at et kort observasjonsvindu kan villede, og at det er for tidlig å rangere selve tilknytningsstyrken. | Forfatterne selv avviser enkle, absolutte slutninger fra én kort laboratoriesekvens. |

**Forskningshistorisk konsekvens:** Artikkelen i 1970 presenterer en *illustrasjon* av etologiske hypoteser, atferdsbalanse og separasjon/gjenforening i laboratoriet. Den er ikke en universelt validert klinisk test og kan ikke brukes til å diagnostisere tilknytningskvalitet hos et bestemt barn. Koblingen mellom senere klassifikasjonssystemer og denne første undersøkelsen må tids- og kildeavgrenses. **Resterende kildeport:** NAPS **00762** og uavhengig metodisk vurdering/replikasjon. Det eksisterende **1970-auditregisterets adgangsnivå er oppdatert** fra delvis originalreproduksjon til full trykt artikkel, uten å oppgradere `source_verified` eller legge til påstandsenheter/kildeporter. Opprinnelige 1992-spørsmål om Kauai er fortsatt uavklarte.


## 19. ERIC-originalmanuskript fra 1969: A/B/C, hjemmevaliditet og NAPS 00762

**Originaldokument identifisert og analysert 11. oktober 2026.** Mary D. Salter Ainsworth, Silvia M. V. Bell og Donelda J. Stayton, *Individual Differences in Strange-Situational Behaviour of One-Year-Olds*, Johns Hopkins University, **juli 1969**. [ERIC ED056742: original forskningsmanuskript på 38 sider](https://files.eric.ed.gov/fulltext/ED056742.pdf) (PDF på 39 sider inkludert ERICs dokumentomslag). [ERICs katalog](https://eric.ed.gov/?id=ED056742) bekrefter forfattere, dato og tittelen. Manuskriptets introduksjon, metode, utvalgsbeskrivelse, klassifikasjonskriterier og diskusjon er lest, og de avgjørende trykte sidene **5 og 26** er også kontrollert visuelt mot skannede sider. De opprinnelige tabell- og figurbladene finnes i PDF-en; hele det kvantitative materialet er **ikke separat reanalysert**.

| Originalens trykte side | Direkte dokumentert | Begrensning |
| --- | --- | --- |
| **1–3** | Etablerer den åtte episoder lange laboratorieprosedyren som undersøkelse av samspillet mellom tilknytning og utforskning. Forfatterne understreker at replikasjon i flere utvalg kreves for å validere metoden. | En standardisert kort labprosedyre er ikke en diagnose eller bevis for kausal omsorgspåvirkning. |
| **3–4** | 23 hvite middelklassepar i langtidsstudie fra fødselen og 33 andre par observert i Strange Situation; alle 56 kunne kategoriseres etter laboratorieatferd, men bare **23** hadde langvarige hjemmeobservasjoner for en direkte sammenligning. | **N=56 for laboratoriet** er ikke N=56 for validering mot hjemmesituasjonen. |
| **4–8** | Forfatterne beskriver A/B/C og **åtte undergrupper**, med gjenforeningsatferd som sentralt klassifikasjonsgrunnlag. De gir uttrykkelig detaljerte kriterier for gruppene. | Dette er en klassifikasjonsbeskrivelse i et 1969-manuskript, ikke selvstendige NAPS 00762-kodeinstruksjoner eller validitet utenfor utvalget. |
| **3–4, fotnote 2** | Forfatterne viser selv til National Auxiliary Publications Service **NAPS 00762** med deponerte instruksjoner for situasjonsprosedyren, til mor og for frekvens-/sosial atferdskoding. | **NAPS 00762 ble ikke funnet i fulltekst** i ERIC-PDF-en eller i de undersøkbare åpne postene. |
| **26–27** | Avviser å rangere barn som mer eller mindre sterkt tilknyttet ut fra én dimensjon, fordi ulike atferdskriterier ville gi motstridende rekkefølger. Krever videre replikasjon, andre aldre og andre kulturelle kontekster; påpeker at enslydende atferdsvariabelnavn kan skjule ulike definisjoner. | Disse er forskernes *egne* historiske metodiske begrensninger og bør følges i History Go; ingen universell enkeltbarnsprognose. |

**Bibliografisk proveniens:** Manuskriptet er fra **juli 1969**, og beskriver et sammendrag presentert samme måned med senere forkortet publisering planlagt i H. R. Schaffers redigerte bok. [Cambridge University Press' bibliografi](https://www.cambridge.org/core/books/abs/cambridge-encyclopedia-of-child-development/social-and-emotional-development/2CBEE1ABA8535F610E87223C64CB57DE) bekrefter senere publisering av Ainsworth/Bell/Stayton som kapittel i **1971**. Ingen side-for-side-kollasjon mellom forfattermanuskriptet og bokkapittelet er gjennomført. [Wellcome Collections arkivkatalog](https://wellcomecollection.org/works/r7t3nned) har dessuten et uavhengig registrert manuskriptutkast, **PP/BOW/J.1/13**, datert ca. 1969, i John Bowlbys papirer. Arkivkopien er **ikke** lest og kan derfor ikke brukes som dokumentasjon på identisk ordlyd.

**Hvorfor NAPS 00762 fortsatt er åpen:** [College & Research Libraries News, 1973](https://crln.acrl.org/index.php/crlnews/article/view/21767/27384) bekrefter at National Auxiliary Publications Service var en mikrofiche- og kopisentral som distribuerte vedleggsdokumenter etter NAPS-nummer. [American Chemical Societys arkivhistoriske fremstilling (2012)](https://doi.org/10.1021/bk-2012-1110.ch003) beskriver at ASIS&T ikke visste hvor den gamle NAPS-samlingen var blitt av. Opplysningen gjelder tjenestens historiske materialer generelt og **beviser ikke at NAPS 00762 er tapt**. Søkene ga ikke et selvstendig, verifiserbart digitalt eksemplar av dokument 00762. Arkivkontakt/fysisk samlingssøk, særlig i Bowlby-arkivet og eldre mikrofichebeholdninger, er en mulig videre vei, men erstatter ikke dokumentkontroll.

**Faglig beslutning:** Registrer en **egen originalkildeport** for ERIC 1969-manuskriptet med avgrenset sidekontroll og separat krav om NAPS 00762. Ikke endre tilgangsnivået for det allerede gjennomgåtte 1970-tidsskriftbidraget; ikke markere manualen som funnet; ikke innføre 1971-tekst som fullstendig originalrevidert. `source_verified=0/4` forblir sperret. Registeret har nå **11** originalkildeporter, **32** eksisterende påstandsenheter og **14** teorikort.


## 20. Kodeappendiksene i Patterns of Attachment – lokalisert, men ikke fulltekstlest

**Kontroll 11. oktober 2026:** [Routledge/Psychology Press' forlagsoversikt for *Patterns of Attachment*](https://www.routledge.com/Patterns-of-Attachment-A-Psychological-Study-of-the-Strange-Situation/Ainsworth-Blehar-Waters-Wall/p/book/9780203758045) og den [delvis tilgjengelige 2015 Classic Edition-PDF-en](https://mindsplain.com/wp-content/uploads/2021/01/Ainsworth-Patterns-of-Attachment.pdf) (148 PDF-sider, **ikke full 466-siders bok**) dokumenterer følgende bibliografiske søkesteder:

| 2015 Classic Edition | Trykt førsteside | Formål oppgitt i original innholdsfortegnelse | Kontrollstatus |
| --- | ---: | --- | --- |
| Appendix I: Instructions to the Mother | **316** | Instruksjoner til mor i testsituasjonen | Innholdsoversikt verifisert, **tekst ulest** |
| Appendix II: Instructions for Coding and Tabulating Frequency of Behaviors | **319** | Koding og opptelling av frekvensatferd | Innholdsoversikt verifisert, **tekst ulest** |
| Appendix III: Scoring System for Interactive Behaviors | **336** | Skåringssystem for interaksjonsatferd | Innholdsoversikt verifisert, **tekst ulest** |

**Primærkildens egen utgavehistorie:** 2015-forordet, trykte s. **x–xi**, sier at den nye Classic Edition tilfører ekstra appendikser med fulltekst av hjemmets *secure-base*-mål og mors sensitivitetsskalaer; i bokas innholdsfortegnelse er disse oppført som **IV og V**, og et supplerende statistikkappendiks er **VI**. Disse nyere hjemmemålene må **ikke** uten videre regnes som historiske deler av den eldre 1970-publikasjonen eller NAPS 00762. Kodingsappendiksene **I–III** er ikke merket som nye i 2015-innholdsfortegnelsen, men er heller ikke lest her og må sammenholdes med originalutgaven før man hevder tekstidentitet.

**Viktig bibliografisk nyanse:** [Google Books / Open Library](https://openlibrary.org/books/OL22127096M/Patterns_of_attachment) registrerer den opprinnelige Erlbaum-boken som **1978**, mens [Routledges 1st Edition-side](https://www.routledge.com/Patterns-of-Attachment-A-Psychological-Study-of-the-Strange-Situation/Ainsworth-Blehar-Waters-Wall/p/book/9781315802428) omtaler førsteutgivelse i **1979**. Disse registreringene må knyttes til faktiske trykk/ISBN før årstallet kan kalles en bibliografisk feil. Pagineringen er dessuten utgaveavhengig; side 316/319/336 gjelder **2015 Classic Edition**.

**Forholdet til NAPS 00762:** Ainsworth og Bell (1970), s. 56, henviste til et separat deponert dokument for åtteepisodersprosedyren, instrukser til mor, frekvenskoding og koding av sosial samhandling. Titlene i *Patterns of Attachment* tilsvarer **deler av den samme funksjonelle kategorien av instruksjoner**, og gir derfor et mer målrettet fremtidig sammenligningsgrunnlag. Men de er **ikke verifisert som ordrett identiske**, og verken NAPS 00762, selve bokappendiksene eller forskjellene mellom 1978/1979 og 2015 er gjennomgått. Den 148-siders tilgjengelige PDF-en hopper over appendiksene og viser etter utvalgte bokkapitler referansene. Det er ikke faglig grunnlag for å godkjenne skåringsmanualen.

**Beslutning:** Ny separat originalpublikasjonsport `tilknytning_ainsworth_blehar_waters_wall_1978_1979`, tilgangsstatus **forlagsinnhold + delvis 2015-utdrag, appendikser uleste**. Ingen endring i originalkildestatus for ERIC 1969 eller tidsskriftoriginal 1970. Totalt **12** originalkildeporter, **32** eksisterende påstandsenheter, **14** teorikort, **0/4** `source_verified`.


## 21. Originalforordet fra 1978: hva Strange Situation faktisk målte

**Ny, direkte primærkildelesning 11. oktober 2026.** Ainsworth, Blehar, Waters og Wall: *Patterns of Attachment*, originalforordet **«Preface (1978)»** gjengitt i [2015 Classic Edition (148-siders delvis PDF)](https://tilknytning.nu/wp-content/uploads/2023/04/Ainsworth-Patterns-of-Attachment.pdf). 1978-originalforordets trykte s. **xli**, **xliii–xliv** og 2015-forordets s. **x** er kontrollert i de skannede sidene (PDF-sider 42, 44–45 og 11, med PDF-side 1 som indeks 0). Dette er forfatterens opprinnelige metodeforbehold og et moderne redaktørforord; **ikke** fulltekst av metodekapittel 2–3, appendiks I–III eller NAPS 00762.

| Primærside | Forfatternes dokumenterte presisering | Hva History Go kan/ikke kan hevde |
| --- | --- | --- |
| **xli (1978)** | Strange Situation er *ikke et eksperiment i ordets bokstavelige forstand*: barn ble ikke fordelt på forskjellige behandlinger og mulige rekkefølgeeffekter ble ikke kontrollert. Alle fikk samme episoder i samme rekkefølge for å synliggjøre individuelle atferdsmønstre. | **Korrekt:** standardisert observasjonsprosedyre. **Feil:** randomisert effekttest av separasjon eller kausalt bevis på omsorgseffekt. |
| **xliii–xliv (1978)** | Forfatterne oppga informert deltakelse og mulighet til å avbryte episoder, men erkjente at situasjonen kunne være lite sammenlignbar for barn i andre kulturer og ikke burde påtvinges uvillige familier. | Historisk kontekstspesifikk metode; ikke universell standardtest eller krav til foreldre/barn. Forskerne rapporterer egen vurdering av sikkerhet, ikke en uavhengig skadeevaluering. |
| **xliv (1978)** | Bokens metodekapittel omtaler **106 spedbarn totalt fra fire delutvalg** og tre forskjellige reduksjonsmåter for atferd: frekvensmåling av diskrete atferder, kategorisk skåring av sosial interaksjon og gruppering etter organisert atferdsmønster. | Bokens **106** må ikke behandles som samme nevner som **56** i Ainsworth/Bell (1970) eller **23** i 1969-manuskriptets hjemmeobservasjonsanalyse. Fremdeles ikke selvstendig kontroll av undergruppefordelinger i kapittel 2. |
| **x (2015)** | Redaktørene sier at den nye utgaven legger til fullstendige hjemmemål for «secure base» og mors sensitivitet, som opprinnelig var bare skissert. | Disse **tilkomne** kodemålene må ikke tilbakedateres til NAPS 00762 eller presenteres som fullt tilgjengelige i 1970. |

**Metodisk konsekvens:** Deltakerutvalg og instrumentdel skal alltid oppgis sammen med resultatene. At alle barn opplever samme episoderekkefølge sikrer en viss standardisering, men eliminerer **ikke** ordreeffekter; den samlede labsekvensen er ikke randomisert behandling. Forskjeller i observert atferd kan beskrives som mønstre, ikke årsakseffekt eller klinisk diagnose. **NAPS 00762, kapittel 2–3 og appendiks I–III fortsatt uleste.** Registeret er oppdatert med kontrollert forordstilgang uten ny originalkildeport: fortsatt **12 kildeporter, 32 påstandsenheter, 14 teorikort og 0/4 slutttatt kildegodkjenning**.


## 22. Everett Waters (2002): direkte lesbar kodingsveiledning, fortsatt ikke NAPS 00762

**Ny faktisk metodetekst kontrollert 11. oktober 2026:** [Everett Waters, *The Ainsworth Strange Situation*, 18-siders PDF fra Stony Brook Universitys tilknytningsforskning](https://psychology.psy.sunysb.edu/attachment/measures/content/ss_scoring.pdf). Forfatteren er **medforfatter av Ainsworth, Blehar, Waters og Wall (1978)**. På PDF-s. **1** opplyser Waters at skåringsmaterialet er bearbeidet/utdratt fra 1978-boken, mens kommentarene og en egen likhetsmatrise er hans egne. Han gir sin egen henvisning som **Waters (2002)**. Dokumentet er en **senere metodeveiledning skrevet av en opprinnelig medforsker**, ikke det separat deponerte NAPS-dokumentet 00762 fra rundt 1970, og ikke nødvendigvis ordrett de samme tekstene som i bokappendiksene.

| PDF-side / trykt side | Faktisk dokumentert innhold | Nødvendig kildeavgrensning |
| --- | --- | --- |
| **1 / 1** | Veiledningen anbefaler lyd/video av hele situasjonen, iterativ gjennomgang av kritiske 5–10-sekunders atferdssekvenser, justering av separasjonstid når barnet er svært opprørt, opplæring hos erfarne kodere og rapportering av kodersamsvar. | Dette beskriver en senere praksis anbefalt av Waters, ikke en uforandret 1970-protokoll eller en universell klinisk test. |
| **1–2 / 1–2** | Primær vekt på **gjenforeningsepisodene 5 og 8**, men hele de åtte episodene skal vurderes. Waters beskriver **fire sjuleddede interaksjonsskalaer**: nærhetssøking, kontaktvedlikehold, unngåelse og kontaktmotstand. | Originalartikkelen fra **1970** beskrev **fem** sosialatferdsmål som inngikk i dens reliabilitetskontroll. De fem historiske målene og de fire klassifikasjonssentrale skalaene i Waters' senere veiledning er forskjellige analyseenheter og kan ikke brukes om hverandre. |
| **11 / 11** | Beslutninger skal bygge på **flere samsvarende atferdsindikatorer**, ikke ett øyeblikk; ved avbrutt observasjon eller mangelfull video er «can't classify» en legitim konklusjon. | Utelatt klassifikasjon er en del av forskningsmetoden, ikke bevis for omsorgssvikt, klinisk tilstand eller lav tilknytning. |
| **14 / 14** | Kategori **D (desorganisert)** er eksplisitt merket som **ikke del av Ainsworths opprinnelige skåringssystem**, med henvisninger til Main og Solomon (1990) og senere litteratur. | Dette viser en historisk utvidelse av klassifikasjonssystemet og må **ikke** føres som et opprinnelig 1969/1970-funn. Faglig og klinisk bruk krever uavhengige valideringskilder. |

**Hva dette endrer:** History Go kan dokumentere konkrete observerbare kodekriterier og tolkningsgrenser fra en **førstehåndskilde med medforfatterproveniens**, fremfor bare en senere lærebokoversikt eller innholdsfortegnelse. Dokumentet gir også en kildebasert forklaring på hvorfor standardisert prosedyre ikke betyr helt mekanisk gjennomføring, og hvorfor erfarne kodere kan avstå fra klassifikasjon når datagrunnlaget er for svakt.

**Hva det ikke løser:** Denne 2002-veiledningen **er ikke NAPS 00762**. Opplysningen om at kodeinnholdet er hentet fra *Patterns of Attachment* betyr ikke at alle de originale bokappendiksene I–III eller deponeringsdokumentet er tekstkritisk sammenholdt. Det er fremdeles ikke dokumentert originalutgavens komplette kodeinstruksjoner, en empirisk fullverdig kodersamsvarsreanalyse eller ekstern, kulturell og klinisk validitet. NAPS 00762, *Patterns of Attachment* appendiks I–III og Werner/Smith (1992) appendiksene forblir åpne kildeporter. Status **14 teorikort, 32 eksisterende påstandsenheter, 13 registrerte primær-/opphavskildeporter, 0 av 4 sluttgodkjente**, uten godkjenningsoppgradering.


## 23. Bowlby 1958 – originaltekst, monotropi og forskningshistorisk kausalavgrensning

**Primærtekstkontroll 11. oktober 2026.** John Bowlby, «The Nature of the Child's Tie to His Mother», *International Journal of Psycho-Analysis* **39(5):350–373** (1958), [24-siders lesbar reproduksjon av originaltrykket](https://scispace.com/pdf/the-nature-of-the-child-s-tie-to-his-mother-1y4tsohzwc.pdf). Originalens bibliografi er kontrollert mot [PubMed PMID 13610508](https://pubmed.ncbi.nlm.nih.gov/13610508/) og [Wellcome Collection PP/BOW/K.11/52](https://wellcomecollection.org/works/ebjjsja2). Samtlige trykte sider er tilgjengelige som skannede sider i reproduksjonen; **nøkkelpartiene s. 350–351, 365–366 og 369–370 er konkret tekst- og visuelt kontrollert**. Artikkelen er i seg selv en psykoanalytisk-etologisk teori- og forskningsprogramtekst, **ikke** en ny longitudinell kohort, en klinisk diagnostisk manual eller en randomisert test.

| Originalside | Eksakt forskningshistorisk funn | Kildekritisk avgrensning |
| --- | --- | --- |
| **350, fotnote 2** | Bowlby forklarer at han omtaler «mor» for enkelhets skyld, men mener *personen som faktisk gir omsorg og som barnet knytter seg til*, ikke nødvendigvis biologisk mor. | Historiske ord om «mother» må ikke gjengis som et eksklusivt biologisk kriterium. Samtidig diskuterte Bowlby en historisk hypotese om sterk preferanse, som ikke må skjules ved moderne omformulering. |
| **350–351** | Før egen modell setter Bowlby opp fire konkurrrerende forklaringer: *secondary drive* (behovstilfredsstillelse), *primary object sucking*, *primary object clinging* og *return-to-womb craving*. Han foreslår så en teori om **fem komponentresponser**: suging, klamring, følging, gråt og smil, påvirket av etologiske sammenligninger og observasjonsmateriale. | Dette er hypoteser og teorihistorisk kontrast, ikke fem uavhengig kvantitativt validerte utviklingsmekanismer. |
| **365–366** | Bowlby understreker uttrykkelig at den etologiske modellen ennå er en antakelse og utlegger hvilket framtidig observasjons-/eksperimentprogram som må teste utløsere, avslutningsbetingelser, modning og konflikter mellom responser. | Egen fremtidig forskningsplan er et argument **mot** å fremstille originalteksten som allerede validert effektforskning. |
| **369–370** | Bowlby innfører **monotropi** som betegnelse for en tendens til at responsene samles rundt en bestemt omsorgsfigur. På s. 370 presiserer han selv at termen er **beskrivende og ikke hevder kausal forklaring**. Han skriver også at tendensen mot én bestemt omsorgsfigur krever nyanser og forbehold. | Monotropi i 1958 er ikke et observerbart bevis for at andre omsorgspersoner er uten betydning; heller ikke et grunnlag for diagnose, sikker enkeltbarnsprognose eller utledning av omsorgsutfall. |

**Et nødvendig historisk skille:** Bowlby diskuterte allerede i 1958 en sterk, særlig preferanse for en omsorgsfigur, og anvendte tidstypiske antakelser om «mothering». Å lese fotnote 2 isolert og konkludere at hans tekst var en moderne flertilknytningsteori ville derfor også være feil. Den vitenskapelige framstillingen må **både** bevare hans faktiske definisjon av en omsorgsfigur, **og** angi monotropiens historisk normative karakter og manglende kausale validering. Ainsworths 1969–1970-observasjoner og senere klassifikasjonssystemer må holdes tydelig atskilt fra Bowlbys teoridannelse i 1958.

**Status og port:** Den eksisterende originalkildeporten \`tilknytning_bowlby_1958\` oppdateres fra et kort originalutdrag til *lesbar full 24-siders reproduksjon, med nøkkelsider kontrollert*. Det er **ikke** gjennomført systematisk, uavhengig validering av alle 1958-artikkelens historiske dyre- og menneskeobservasjoner. En slik kvalitetsvurdering og senere teori-/replikasjonskritikk gjenstår. Ingen ny source_verified-godkjenning, ingen ny påstandsenhet og ingen ny kildeport opprettes. Gruppe 1 står fortsatt med **14 teorikort, 32 eksisterende påstandsenheter og 13 kildekontrollporter, 0/4 sluttgodkjent**. NAPS 00762, kodeappendiksene i *Patterns of Attachment* og Werner/Smith 1992-appendiksene er fortsatt ulest.


## 24. To 1981-publikasjoner om CBT: klinisk ettårsutfall kontra symptomtidsrekkefølge

**Primærkildekontroll 11. oktober 2026.** Etter Becks kliniske observasjonsstudie fra 1963 og behandlingsmanualen fra 1979 ble to **atskilte** forskningsartikler publisert i 1981. Disse undersøkte ulike spørsmål, hadde ulike analysehorisonter og kan ikke brukes om hverandre som verifikasjon av Becks kognitive årsaksteori.

| Original publikasjon | Direkte dokumentert i originalt tidsskriftsammendrag | Åpen metodeport |
| --- | --- | --- |
| **Kovacs, Rush, Beck og Hollon (januar 1981)**, «Depressed Outpatients Treated With Cognitive Therapy or Pharmacotherapy: A One-Year Follow-up», *Archives of General Psychiatry* **38(1):33–39**, [JAMA originalpublikasjon](https://jamanetwork.com/journals/jamapsychiatry/article-abstract/492460), DOI **10.1001/archpsyc.1981.01780260035003**. | **44** ikke-psykotiske og ikke-bipolare polikliniske depresjonspasienter i **12 ukers** sammenligning av kognitiv terapi med imipramin; **35** hadde fullført protokollen og inngikk i **ett års naturalistisk oppfølging**. Én forskjell i *selvrapporterte* depresjonssymptomer var statistisk signifikant i favør av kognitiv terapi; andre mellomgruppeforskjeller var ikke signifikante. | Full randomisering/fordeling, terapeut- og assessorblindhet, frafall/seleksjon inn i de 35, protokollendringer, oppfølging og koeffisienter trenger hele originalartikkelen. Kontrollert randomisert behandlingsperiode kan ikke uten videre utvides til kontrollert ettårsoppfølging. |
| **Rush, Kovacs, Beck, Weissenburger og Hollon (september 1981)**, «Differential effects of cognitive therapy and pharmacotherapy on depressive symptoms», *Journal of Affective Disorders* **3(3):221–229**, [Elseviers originalpubliserte sammendrag](https://www.sciencedirect.com/science/article/pii/0165032781900240), DOI **10.1016/0165-0327(81)90024-0**, også [PubMed PMID 6456289](https://pubmed.ncbi.nlm.nih.gov/6456289/). | **35** depresjonspasienter undersøkt med **cross-lagged panel analyses** av tidsforholdet mellom selvoppfatning, håpløshet, humør, motivasjon og vegetative symptomer i **behandlingsuke 1–4** under kognitiv terapi eller imipramin. I kognitiv-terapi-gruppen lå endringer i håpløshet/selvoppfatning/humør vanligvis forut for vegetative og motivasjonelle endringer; legemiddelgruppen viste ikke et tilsvarende konsistent mønster. | *Temporalt forløp* er ikke det samme som en kausalt isolert tankemekanisme. Forfatterne etterlyste selv ytterligere placebo- eller ventelistekontroll før de kunne fastslå en spesifikk effekt av kognitiv terapi. Originalens fullstendige panelmodell, målefrekvens, koeffisienter, manglende data og pasientflyt er **ikke kontrollert**. |

**Streng kohortgrense.** Begge artikler omtaler **N=35**, men materialet dokumenterer **ikke automatisk** at deltakerne og analysene er identiske. Den andre artikkelen er en **innenfor-behandling-analyse** av de første fire ukene og kan ikke erstattes med eller likestilles med den første artikkelens **ettårsutfall**. Eventuelt overlapp, korrespondanse til den opprinnelige 44-personersgruppen og behandlingstildeling må undersøkes mot fullteksten før man presenterer en felles dataflyt eller retensjonsprosent.

**Hypotese og effekt må holdes atskilt.** Becks originalartikkel fra **1963** kartla observasjonsbaserte tankemønstre, uten randomisert behandling. Artiklene fra **1981** gikk henholdsvis videre til en klinisk sammenligning med naturalistisk oppfølging og til statistisk analyse av symptomrekkefølge. Ingen av delene utgjør i seg selv et endelig bevis for at korrigering av automatiske tanker **forårsaket** bedring, eller for at slike mekanismer er identiske ved alle depresjonstilstander.

**Dokumentstatus:** Elsevier og JAMA har levert publiserte original-*abstracts* og primærbibliografi. De komplette metodene i Rush-artikkelen er **ikke fulltekstlest** (Elseviers visning er adgangsbegrenset), og JAMA-oppfølgingens fulle tabeller er også uavklart. Vi oppretter derfor én **ny originalpublikasjonsport** \`kognitiv_terapi_rush_1981\` med korrekt status \`publisher_abstract_read_fulltext_unavailable\`. Den eksisterende \`kognitiv_terapi_kovacs_1981\` forblir uendret. Oppdateringene gir **14 originale kildeporter**, **32 eksisterende påstandsenheter** og **14 teorikort**, fortsatt **0/4 kildegodkjente**. History Go er ikke et behandlingsverktøy, og denne kildekontrollen innebærer ingen medisinske råd eller diagnose.


## 25. Rush mfl. (1977) – originalt behandlingseksperiment, utvalg og kontrollproblemer

**Direkte originalkildekontroll 11. oktober 2026:** Rush, A. J., Beck, A. T., Kovacs, M. og Hollon, S. D. (1977), «Comparative Efficacy of Cognitive Therapy and Pharmacotherapy in the Treatment of Depressed Outpatients», *Cognitive Therapy and Research* **1(1):17–37**, DOI [10.1007/BF01173502](https://doi.org/10.1007/BF01173502), i [21-siders tilgjengelig originaltrykksreproduksjon](https://dradamvolungis.com/wp-content/uploads/2012/01/efficacy-of-cognitive-therapy-treatment-for-depression-rush-et-al-1977.pdf). Manuskriptet er etterprøvd mot Springers/OpenAlex' bibliografiske metadata og undersøkt på de trykte sidene **17, 22–25, 27 og 31–35**, inkludert direkte visuell kontroll av metodetabeller og diskusjon. Det er **ikke** gjennomført full uavhengig omregning av alle utfallstabeller.

| Side | Verifisert funn | Avgrensning |
| --- | --- | --- |
| **17, 22–23** | Av **110 fullt evaluerte** søkere ble **41** inkludert; **19** ble fordelt til kognitiv terapi og **22** til imipramin. Studien gjelder voksne unipolart deprimerte polikliniske pasienter; 26 kvinner og 15 menn. | Ikke representativ populasjon eller generelt belegg for andre psykiatriske diagnoser. Den senere oppfølgingen fra 1981 oppgir **44** ved baseline. Opprinnelse og mulig videre rekruttering for forskjellen **41 vs. 44 er ikke dokumentert**. |
| **22–23** | Inklusjon krevde bl.a. BDI **≥20**, HRS-D **≥14** og Feighner-kriterier; tidligere dårlig respons på adekvat trisyklisk behandling inngikk i eksklusjonene. Tildeling ble kalt tilfeldig, men **begrenset av terapeutenes ledige tid**, og skjedde **før** evalueringen. | Randomiseringens detaljer, skjult tildeling og konsekvensene av tilgangen på terapeut må vurderes kritisk. Ikke automatisk lik rekrutteringsmekanisme som seinere 1981-analyser. |
| **23–24** | CT tilbød opptil **20 sesjoner à 50 minutter**, mens legemiddelgruppen fikk opptil **12 sesjoner à 20 minutter** under dosering med imipramin. Independent klinisk evaluering ble forsøkt, men klinikerne var **ikke blindet**; de kunne gjennomskue tildeling via legemiddelbivirkninger. | Ulik kontaktmengde og manglende assessorblinding kan påvirke effektforskjell. Effekten av terapiens særskilte kognitive virkningsmekanisme kan ikke skilles fra alle uspesifikke kontaktfaktorer. |
| **25–27** | **1/19** i CT avbrøt etter tre timer da krisen løste seg uavhengig av terapien, mens **8/22** i imipramin sluttet: to grunnet bivirkninger, én på grunn av akutt suicidal krise med behandlingsbytte og fem mot terapeutens råd, hovedsakelig grunnet manglende respons. Artikkelen omtaler også analyser av fullførere og av gruppene inkludert fra starten. | Dette er **forskjellig frafall knyttet til behandlingstype**, med mulig bias i per-protokoll-resultater. Ikke anta at de 32 fullførerne (18 CT + 14 medikament) er de **35** fra den senere ettårsrapporten; deltakerdefinisjon og datatidspunkt er ikke bekreftet. |
| **27, 31–35** | Forfatterne rapporterte større symptomreduksjon i CT-gruppen på BDI og klinikervurderinger, men diskuterte **selv** seleksjonsbias, forventningsbias, manglende blinding, differensielt frafall, forskjellig kontaktmengde og settingens betydning. På side 35 etterlyses videre kryssvalidering. | En historisk positiv behandlingseffekt er ikke identisk med kausal bevisføring for Becks teori om at endring i automatiske tanker isolert frambringer bedring. |

**Nødvendig kohortregnskap før vitenskapelig godkjenning:** 1977-artikkelen angir **N=41 ved fordeling**; Kovacs mfl. (1981, *Archives of General Psychiatry* 38:33–39) rapporterer **N=44 ved behandlingens start og N=35 i naturalistisk ettårsoppfølging**; Rush mfl. (1981, *Journal of Affective Disorders* 3:221–229) rapporterer **N=35 analysert i behandlingsuke 1–4**. De tre tallsettene **41 / 44 / 35** må kontrolleres mot de to 1981-fulltekstene før det kan hevdes identiske personutvalg, tilleggspasienter, frafall eller bestemt overlapp. Selv om forfattergruppen og behandlingsmiljøet overlapper, kan enkeltindividers flyt **ikke konstrueres matematisk** fra sammendrag.

**Kildestatus og vedtak:** Opprett én ny originalport `kognitiv_terapi_rush_1977` med kontroll av utvalg, design og sentrale resultater i lesbar originaltekst, og behold både `kognitiv_terapi_kovacs_1981` og `kognitiv_terapi_rush_1981` som uleste i fulltekst. Den nye porten oppgraderer **ikke** metode- eller årsaksgodkjenning. Registrene står med **15 originale kildekontrollporter, 32 eksisterende påstandsenheter, 14 teorikort og 0/4 sluttgodkjente**. Ingen endringer i History Go-/Civication-motoren.


## 26. Deltakerflyt 1977–1981: ni frafall i begge rapporter, men ulike nevnere

**Kontroll 11. oktober 2026.** Denne revisjonen skiller tre forskjellige analyser som noen senere fremstillinger omtaler som én tidlig CBT-forskningslinje. Den **originale 1977-artikkelen** [Rush, Beck, Kovacs og Hollon, Cognitive Therapy and Research 1:17–37](https://dradamvolungis.com/wp-content/uploads/2012/01/efficacy-of-cognitive-therapy-treatment-for-depression-rush-et-al-1977.pdf) oppgir på s. **17 og 25** eksakte gruppenevnere og frafall. **Kovacs mfl. (1981)** oppgir et annet start- og fullførertall i sitt [originalpubliserte JAMA-sammendrag](https://jamanetwork.com/journals/jamapsychiatry/article-abstract/492460). **Rush mfl. (1981)** publiserte dessuten en [separat korttidsanalyse](https://pubmed.ncbi.nlm.nih.gov/6456289/) av symptomrekkefølge, med N=35, men uten full tilgjengelig deltakerkobling.

| Dokument og tidspunkt | Startutvalg | Behandlingsfullførere/analyseutvalg | Aritmetisk differanse | Primærbelegg og tolkning |
| --- | ---: | ---: | ---: | --- |
| **Rush mfl. 1977, behandling inntil 12 uker** | **41**: 19 CT + 22 imipramin | **32**: 18 CT + 14 imipramin | **9**: 1 CT + 8 imipramin | [Originaltrykk, s. 17 og 25](https://dradamvolungis.com/wp-content/uploads/2012/01/efficacy-of-cognitive-therapy-treatment-for-depression-rush-et-al-1977.pdf). Behandlernes forklaring på avslutningene er oppført, men en uavhengig, protokollbasert frafallsklassifisering er ikke revidert. |
| **Kovacs mfl. januar 1981, 12-ukers behandling + ettårsoppfølging** | **44** pasienter omtalt som behandlet | **35** som fullførte protokollen og inngikk i naturalistisk oppfølging | **9** ifølge sammendragets ulike nevnere | [JAMA-originalabstract, *Archives of General Psychiatry* 38:33–39](https://jamanetwork.com/journals/jamapsychiatry/article-abstract/492460). **Ingen åpne gruppevise nevnere, datoer eller individ-ID-er** i abstractet, og artikkelens fulltekst krever tilgang. |
| **Rush mfl. september 1981, symptomtidsrekkefølge uke 1–4** | **Ikke oppgitt i tilgjengelig abstract** | **35** analysert under CT eller imipramin | **Kan ikke beregnes** fra abstractet | [Elsevier-originalabstract, *Journal of Affective Disorders* 3:221–229](https://www.sciencedirect.com/science/article/pii/0165032781900240). Kort panelmodell, ikke naturalistisk ettårsoppfølging. |


**Utvidet tabell- og utfallskontroll av 1977-originalen, trykte s. 25–30 (11. oktober 2026):** Originalens s. 26 beskriver *endpoint analysis*: Når behandling ble avsluttet før tiden, ble siste registrerte skår videreført i påfølgende analyser for det aktuelle målet (*last observation carried forward*, LOCF-lignende imputasjon). Dette er **ikke** det samme som komplette målinger ved planlagt behandlingsslutt. Tabellenes analysetall varierer fordi noen skåringer manglet også hos protokollfullførere.

| 1977-originalens analyse | CT | Imipramin | Metodisk presisering |
| --- | ---: | ---: | --- |
| Tildelt behandling (s. 17, 25) | 19 | 22 | 41 totalt, behandlingsstart |
| Protokollfullførere (s. 25) | 18 | 14 | 32 totalt, etter 1 og 8 behandlingsavbrudd |
| BDI, tabell III (s. 26), kun fullførere | 18 | 14 | Samme antall som protokollfullførerne |
| BDI, tabell III, fullførere + avbrudd | 19 | 22 | Siste observerte skår videreført ved avbrudd |
| Hamilton depresjon, tabell IV (s. 26), kun fullførere | 15 | 14 | Ikke alle 32 har gyldig før-/ettermåling for denne skalaen |
| Hamilton depresjon, tabell IV, med avbrudd | 16 | 20 | Ikke alle 41 har nødvendig skåringsgrunnlag |
| Raskin depresjon, tabell IV, kun fullførere | 14 | 10 | Annet skala-spesifikt datautvalg |
| Raskin depresjon, tabell IV, med avbrudd | 15 | 14 | Ikke et nytt behandlingsutvalg |
| Hamilton angst, tabell VI (s. 29), kun fullførere | 15 | 13 | Egne skala-spesifikke målinger |
| Hamilton angst, tabell VI, med avbrudd | 16 | 18 | Enkelte før-/ettermålinger mangler |
| Kontakt ved ca. 3 og 6 måneders oppfølging (s. 29) | 19 | 19 | **38** oppfulgte; tre fra legemiddelgruppen avslo oppfølging |

Oppfølgingen av **38** ved tre/seks måneder er et annet utfallstidspunkt og omfatter flere enn de **32** som fullførte behandlingen. Den kan **ikke** omdøpes til 32 protokollfullførere, de 35 fullførerne beskrevet av Kovacs mfl. (1981), eller de 35 analyseenhetene i Rush (1981/1982). Tabellene dokumenterer dessuten at analyser med imputert endepunkt og analyser av bare fullførere har ulike nevnergrupper. Denne nye direkte tabellkontrollen gjelder **1977-artikkelen**, og løser ikke personkoblingen til de tilgangsbegrensede 1981–1982-originalene. Ingen deltakermatrise eller ny kildeport fastslås.

**Matematisk konsekvens:** Hvis man feilaktig antar at ettårsstudiens 35 fullførere er *nøyaktig* de samme 32 som fullførte 1977-studiens rapporterte behandling, oppstår en direkte selvmotsigelse. 35 og 32 kan ikke være identiske komplett definerte utvalg. Fordi **44 − 35 = 9** og **41 − 32 = 9**, er antallet som ikke inngår i de rapporterte fullførergruppene aritmetisk det samme; **det dokumenterer ikke at de ni personene, årsakene eller protokollene er de samme**. En mulig senere inkludering av tre personer, andre kriterier for fullført behandling eller en annen prøveramme må behandles som *hypoteser*, ikke fakta. Det kan heller ikke uten videre fastslås at Rush' **35 analyseenheter** i den andre 1981-artikkelen er de samme 35 i Kovacs' ettårsoppfølging.

**Samtidig vitenskapelig kritikk:** Allerede i **juni 1978** publiserte Joseph Becker og Marc A. Schuckit [«The comparative efficacy of cognitive therapy and pharmacotherapy in the treatment of depressions», *Cognitive Therapy and Research* 2:193–197](https://link.springer.com/article/10.1007/BF01172734), DOI **10.1007/BF01172734**. Deres originalpubliserte sammendrag, gjenfunnet i bibliografiske indekser, roste flere designtrekk, men stilte spørsmål ved om type, dosering og varighet av legemiddelbehandlingen utgjorde en optimal sammenligning. Rush, Hollon, Beck og Kovacs svarte i [«Depression: Must pharmacotherapy fail for cognitive therapy to succeed?», samme tidsskrift 2:199–206](https://link.springer.com/article/10.1007/BF01172735), DOI **10.1007/BF01172735**, og anerkjente i originalabstractet at vidtrekkende konklusjoner fra én studie ville være uholdbare, og at studien særlig omfattet kronisk eller tilbakevendende depresjon. Begge artiklene er **bibliografisk kontrollert hos Springer**, men **fulltekstene er ikke gjennomgått**. Denne samtidige fagdebatten viser at avgrensningene ble diskutert umiddelbart etter 1977-funnet; den beviser ikke hvilken legemiddelprotokoll som ville gitt et bestemt resultat.

**Videre godkjenningskrav:** Les hele [Kovacs 1981 s. 33–39](https://doi.org/10.1001/archpsyc.1981.01780260035003), særlig rekruttering, gruppeattribusjon, etterslep, datoer og protokollfullføring, samt hele [Rush 1981 s. 221–229](https://doi.org/10.1016/0165-0327(81)90024-0), særlig panelmodell, utvalgsidentitet og deltakertabeller. Før dette foreligger, skal **ingen felles pasient-flyttabell, identifisert «+3»-kohort, felles frafallsprosent eller kausal mediator-effekt** registreres som verifisert.

**Registerbeslutning:** Dette er en **avstemming av allerede registrerte originalkilder**, ikke en ny studie eller ny godkjent canonical påstand. Eksisterende `kognitiv_terapi__method` og `kognitiv_terapi__limit` er oppdatert og speilet i deknings-/evidensregistrene. **14 teorikort, 32 påstandsenheter, 15 kildekontrollporter og fortsatt 0/4 godkjente.** Kode/History Go/Civication er uendret.


## 27. 1982-originalen om håpløshet og selvoppfatning: tre N=35-analyser uten dokumentert personkobling

**Primærpublikasjonskontroll 11. oktober 2026.** A. John Rush, Aaron T. Beck, Maria Kovacs, Jan Weissenburger og Steven D. Hollon publiserte «Comparison of the effects of cognitive therapy and pharmacotherapy on hopelessness and self-concept», *American Journal of Psychiatry* **139(7):862–866** (juli 1982), DOI [10.1176/ajp.139.7.862](https://doi.org/10.1176/ajp.139.7.862), PMID **7091401**. [PubMeds originalreferanse med tidsskriftets abstract](https://pubmed.ncbi.nlm.nih.gov/7091401/) og [American Psychiatric Associations egen tidsskriftsoppføring](https://psychiatryonline.org/doi/10.1176/ajp.139.7.862) er kontrollert. **Fulltekst (fem trykte sider) krever tilgang** hos utgiveren og er **ikke lest**; alle nedenstående empiriske opplysninger er avgrenset til originalabstractet.

**Verifisert av abstractet:** Studien sammenlignet kognitiv terapi med imipramin hos **35 ikke-psykotiske unipolart deprimerte polikliniske pasienter** over **omtrent 11 uker**. Forfatterne oppga **større forbedring i håpløshet og mer generelle forbedringer i selvoppfatning** i den kognitive terapigruppen enn i imipramingruppen. Abstractet identifiserer **ikke** gruppefordeling, konkrete skårer, effektstørrelser, frafall, blindingsprosedyrer, modellspesifikasjoner eller deltaker-ID-er. Det kan derfor ikke brukes til å attestere disse forholdene, og resultatet er **ikke** et kausalt bevis for at endring i tanker alene forårsaket klinisk bedring.

| Publikasjon | Populasjonsopplysning | Undersøkt tid / utfall | Hva vi ikke vet |
| --- | --- | --- | --- |
| **Rush/Beck/Kovacs/Hollon 1977**, *Cognitive Therapy and Research* 1:17–37, [originaltrykk](https://dradamvolungis.com/wp-content/uploads/2012/01/efficacy-of-cognitive-therapy-treatment-for-depression-rush-et-al-1977.pdf) | **41 tildelt**, 19 CT og 22 imipramin; **32 fullførere** | Inntil 12 ukers behandlingsforsøk | Om 1977-utvalget kan kobles til alle senere analyseutvalg |
| **Kovacs/Rush/Beck/Hollon januar 1981**, *Archives of General Psychiatry* 38:33–39, [originalabstract](https://pubmed.ncbi.nlm.nih.gov/7006557/) | **44 behandlet; 35 fullførte** | 12 ukers behandling og naturalistisk ettårsoppfølging | Gruppevise tall og forklaring på avviket mot 1977 |
| **Rush/Kovacs/Beck/Weissenburger/Hollon september 1981**, *Journal of Affective Disorders* 3:221–229, [originalabstract](https://pubmed.ncbi.nlm.nih.gov/6456289/) | **35 analysert** | Kryssforskjøvet panelanalyse av symptomrekkefølge i uke **1–4** | Om 35 er de samme som ettårsstudiens 35, samt detaljerte panelkoeffisienter |
| **Rush/Beck/Kovacs/Weissenburger/Hollon juli 1982**, *American Journal of Psychiatry* 139:862–866, [originalabstract](https://pubmed.ncbi.nlm.nih.gov/7091401/) | **35 analysert** | Ca. **11 uker**, håpløshet og selvoppfatning ved CT vs. imipramin | Identiteten til de 35, gruppefordeling, modelldetaljer og om analyser avgrenser samme personer |

**Metodisk betydning:** De tre senere arbeidene som oppgir **N=35**, er reelle og forskjellige originalpublikasjoner med ulike utfall og tidsperspektiver. Det er **mulig** at de bygger på samme behandlingsprogram eller overlappende personer, men **ikke verifisert** at de 35 er identiske på individnivå. Samme N kan ikke brukes som dokumentasjon på sammenfall. Ingen frafallsbro kan rekonstrueres fra de publiserte sammendragene. Heller ikke kan en statistisk signifikant mellomgruppeforskjell i håpløshet brukes til å hevde at kognitive endringer er isolert kausalt mellomledd i forbedring av alle depresjonssymptomer.

**Beslutning:** Opprett én ny, særskilt originalpublikasjonsport `kognitiv_terapi_rush_1982` med status **publisher-original-abstract kontrollert; full artikkel ulest**. Behold eksisterende uavklarte porter for 1977, 1981-følgeartiklene og metodisk validering. Tidslinje, metode, begrensninger, tre påstandsenheter, evidensmatrise, dekningsregister og målrettede tester oppdateres uten nye canonical ID-er eller kliniske/individuelle årsakspåstander. Status: **14 teorikort, 32 påstandsenheter, 16 kildekontrollporter, 0/4 vitenskapelig sluttgodkjente**. Ingen endringer i History Go-/Civication-funksjoner.


## 28. Kognitiv terapi – målrettet kildeport, deltakeravstemming og beslutning per påstand (11. oktober 2026)

**Revisjonens scope:** Eksisterende teorikort `kognitiv_terapi`, de åtte eksisterende underpåstandene og de fire originale publikasjonene fra 1977–1982; ingen nye pasientdata er tilgjengelige. Dette er en **fullstendig redaksjonell vurdering av kortets åtte felt på nåværende bevisnivå**, men **ikke en fullført primærkildekontroll eller vitenskapelig sluttgodkjenning**.

### 28.1 Tilgangs- og originalstatus

| Original | Kilde/tilgang kontrollert | Direkte dokumenterte opplysninger | Hva som fremdeles ikke er verifisert |
| --- | --- | --- | --- |
| [Rush, Beck, Kovacs og Hollon (1977), s. 17–37](https://dradamvolungis.com/wp-content/uploads/2012/01/efficacy-of-cognitive-therapy-treatment-for-depression-rush-et-al-1977.pdf) | Originaltrykk-reproduksjon, inkludert metodetekst og tabeller, lest/visuelt kontrollert; bibliografi kryssjekket mot DOI 10.1007/BF01173502. | 41 behandlingsfordelte (19 CT/22 imipramin), 32 fullførere (18/14), frafall 1/8 med beskrevne grunner, og forskjeller mellom skalaenes analyse-N. | Primærdata/protokoll og fullstendig uavhengig rekalkulering av alle resultater er ikke tilgjengelige. |
| [Kovacs, Rush, Beck og Hollon (januar 1981), s. 33–39](https://jamanetwork.com/journals/jamapsychiatry/article-abstract/492460) | JAMA-originalabstract og PDF-lenke kontrollert. PDF-handlingen returnerer artikkelens tilgangsbegrensede sammendrag, og forlaget tilbyr pålogging/betalt artikkeltilgang. En [Scribd-oppføring](https://www.scribd.com/document/948964256/Depressed-Outpatients-Treated-With-Cognitive-Therapy-or-Pharmacotherapy-a-One-Year-Follow-Up) er bare **én side med abstract og referanse**, ikke originalfulltekst. | 44 behandlet gjennom 12 uker, 35 protokollfullførere i naturalistisk ettårsoppfølging, én signifikant selvrapportert depresjonsforskjell og ingen andre signifikante mellomgruppeforskjeller som beskrevet i abstractet. | Originalsidene 33–39 med gruppevise nevnere, utvalgskriterier, tabeller, rekrutteringsdatoer, interkurrente behandlinger, tap til oppfølging og grunnlaget for 41/44-avviket. **Tilgangsstatus: fulltekst ikke skaffet.** |
| [Rush, Kovacs, Beck, Weissenburger og Hollon (september 1981), s. 221–229](https://www.sciencedirect.com/science/article/pii/0165032781900240) | Originalt Elsevier-abstract; fulltekst ikke tilgjengelig ved kontrollen. | N=35, kryssforskjøvet panelanalyse av de første fire ukene, beskrevet tidsrekkefølge for symptomendringer; forfatterne krever nye placebo-/ventelistekontroller. | Deltakerlisten relativt til Kovacs 1981 og Rush 1982, allokering, fullstendige panelmatriser, modellantakelser, håndtering av manglende ukedata. |
| [Rush, Beck, Kovacs, Weissenburger og Hollon (juli 1982), s. 862–866](https://psychiatryonline.org/doi/10.1176/ajp.139.7.862) | Forlagets originalabstract / [PubMed](https://pubmed.ncbi.nlm.nih.gov/7091401/); utgiveren krever artikkeltilgang for fulltekst. | N=35, omtrent 11 uker, CT mot imipramin; større rapportert bedring i håpløshet og bredere selvoppfatning ved CT. | Individ-/gruppetall, tabeller, eksakte effektmål, frafallshåndtering, eventuell flergangsrapportering av samme pasienter. |

**Viktig klassifikasjon:** De tre 1981–1982-artiklene med N=35 representerer **tre forskjellige publikasjoner og analyseformål**, ikke tre uavhengige randomiserte forsøk. Mulig overlapp er uavklart; de må *ikke* summeres som N=105 eller tolkes som uavhengig replikasjon. Originalabstractet fra 1981 bekrefter heller ikke at N=35 ved ettårsoppfølging er et ubetinget representativt analyseutvalg av alle 44 behandlede.

### 28.2 Logisk avstemming og fare for falsk presisjon

- **1977:** 41 fordelt = 19 CT + 22 imipramin; 32 fullførere = 18 CT + 14 imipramin; 9 avbrudd = 1 CT + 8 imipramin. I originalens trykte s. 25 oppgis for avbruddene: CT-avbruddet etter uavhengig løst krise; i legemiddelarmen 2 bivirkninger, 1 akutt suicidal krise/behandlingsskifte og 5 mot behandlers råd (hovedsakelig manglende respons). Ulike grunner innebærer mulig informativt frafall.
- **1981 ettår:** 44 behandlet og 35 protokollfullførere, også aritmetisk differanse 9. Originalabstractet gir **ikke** gruppevise antall eller spesifikke grunner; derfor er det *ikke* kildegrunnlag for å trekke 1977-årsakene over på 1981-utvalget.
- **1977 analyse-N:** Originaltrykkets BDI-skårer bruker 18/14 fullførere og 19/22 når tidlige avbrudd inkluderes med videreført siste skår; Hamilton- og Raskin-tabeller har færre komplette skårer. Analyser med videreført siste observasjon er ikke likeverdige med en moderne, robust intensjon-om-å-behandle-analyse. 38 pasienter med kontakt ved 3-/6-måneders oppfølging er **heller ikke** de samme som 32 protokollfullførere.
- **Mulig 41 → 44 og 32 → 35:** «Tre ekstra inkluderte» er en logisk mulig, men **ikke verifisert**, forklaring. Alternative definisjoner av rekruttert, tildelt, behandlet eller fullført, ulik rapporteringsperiode eller andre skåringsgrunnlag kan ikke avvises. Ingen primærkildedokumentasjon angir identiteten til tre personer.
- **1981/1982 35 + 35 + 35:** Felles forfattere og behandlingstyper øker behovet for kohortkobling, men verifiserer ikke overlapp. Separate mål og oppfølgingstider kan analyseres på samme materiale uten å være uavhengige forsøk; om dette skjedde her krever metodedelene.

### 28.3 Metodekritikk – separat fra historisk interesse

| Risiko-/designområde | Hva 1977-originalen faktisk viser | Vurdering for kortet |
| --- | --- | --- |
| Rekruttering og randomiseringsprosess | 110 grundig vurderte; 41 inkluderte. Fordelingen beskrives som tilfeldig, **begrenset av tilgjengelig terapeuttid**, og fant sted før endelig vurdering (s. 22–23). | «Randomisert» kan siteres som forfatternes beskrivelse, men allokeringsskjuling og mulig tildelingsbias er **ikke dokumentert uproblematisk**. |
| Intervensjonskontrast | Maksimalt 20 CT-sesjoner à ca. 50 min mot opptil 12 farmakologiske konsultasjoner à ca. 20 min (s. 23–24); maksimal kontaktkapasitet, **ikke målt gjennomsnittlig dose**. | Ulik struktur, forventning og kontaktintensitet kan konfundere sammenligningen. Det er feil å sammenligne som om kontakt var ekvivalent. |
| Måling | Den uavhengige kliniske rataren var **ikke blindet** for tildeling (s. 23). | Risiko for deteksjonsbias særlig for klinikervurderte endepunkter. |
| Manglende data | 1/19 mot 8/22 behandlingsavbrudd, ulike frafallsgrunner, skala-spesifikke gyldige N og videreført siste skår i enkelte endepunktsanalyser. | Per-protokoll-estimater kan være selektert; imputasjon gir egne antakelser og kan skjule symptomutvikling etter avbrudd. |
| Historisk effektkonklusjon | Studien rapporterte større symptomreduksjon med CT mot **imipramin i denne konteksten**. Forfatterne diskuterte selv mulige alternative forklaringer. | Ikke bevis for generell overlegenhet over moderne farmakoterapi, og ikke et særskilt mediatorbevis for Becks tankemodell. |
| 1981–1982 endepunkter | 1981: naturalistisk oppfølging og separat tidsforskjøvet panel; 1982: håpløshet/selvoppfatning. Bare abstracts tilgjengelige. | Ingen full RoB-2-vurdering, eksakte effektestimater eller konklusjon om deltakeridentitet kan gis uten de respektive metodetekstene. |

### 28.4 Påstand-for-påstand-vurdering av det eksisterende kortet

| Påstandsenhet | Vurdering av faktisk tekst | Vedtak på nåværende kildenivå |
| --- | --- | --- |
| `kognitiv_terapi__founders` | Ellis og Beck representerer beslektede, men historisk separate terapitradisjoner; Becks originalarbeid (1963) var klinisk observasjon, ikke behandlingseffektforsøk. | **Historisk avgrenset påstand støttet**; behold åpent fullstendig redaksjonelt godkjenningsflagg. |
| `kognitiv_terapi__period` | Publikasjonsårene 1963, 1977, 1979, 1981, 1982 og 2023 er etterprøvet i originalpublikasjons-/forlagsmetadata. 1981–1982 er ulike publikasjoner, ikke uavhengige replikasjoner. | **Bibliografi/tidslinje støttet**; forsøkets kohortidentitet ikke verifisert. |
| `kognitiv_terapi__idea` | Beck (1963) beskrev bestemte depressive tankeinnhold, men kliniske observasjoner demonstrerte ikke årsaksretningen. | **Kildeavgrenset teoriutvikling støttet**, ingen mekanismegodkjenning. |
| `kognitiv_terapi__method` | 1977-designet og skala-spesifikke N er kontrollert direkte. 1981–1982 har bare abstract-kontroll; 41/32 og 44/35 er publiserte, avvikende regnskap uten verifisert personbro. | **Ikke fullstendig metodeverifisert**. Blokker påstått felles kohort, gruppefordeling i 1981/1982 og formell RoB-lukking. |
| `kognitiv_terapi__limit` | Frafall, ikke-blindet vurdering, ulik pasientkontakt og manglende kausal mediatoridentifikasjon er reelle begrensninger. Kovacs-abstractet gir bare én signifikant selvrapportert forskjell etter ett år. | **Begrensningene er faglig nødvendige og støttet**; ingen generell langtids- eller behandlingspreferansepåstand. |
| `kognitiv_terapi__contrast` | Behandlingseffekt og bekreftelse av en omfattende årsaksteori er forskjellige evidenspåstander. | **Metodisk holdbart skille**, ikke individuell behandlingsrangering. |
| `kognitiv_terapi__example` | Eksplisitt fiktiv studentøvelse uten klinisk konklusjon. | **Redaksjonelt korrekt hypotetisk merking**. |
| `kognitiv_terapi__example_secondary` | Eksplisitt hypotetisk metodeøvelse, ikke påstand om faktiske RCT-pasienter eller History Go-behandling. | **Redaksjonelt korrekt hypotetisk merking**. |

**Presisering av nyere effekttall:** [Cuijpers mfl. (2023), original fulltekst](https://pmc.ncbi.nlm.nih.gov/articles/PMC9840507/) inkluderte **409 forsøk og 518 sammenligninger totalt**, mens hovedestimatet **g=0,79** for CBT mot kontrolltilstander bygde på **271 sammenligninger**, ikke samtlige 409 studier. Heterogeniteten var **I²=85 %**; avgrenset til lav risiko for skjevhet var **g=0,60**, og trim-and-fill-justering ga **g=0,47**. Den marginale hovedforskjellen mot andre psykoterapier var **g=0,06**, men forsvant i de fleste sensitivitetsanalysene. Det er derfor riktig å bevare kortets effektforbehold og *feil* å omskrive 1977-forsøkets enkeltresultater som en universell rangering av behandlinger.

### 28.5 Beslutning og neste obligatoriske primærbelegg

**Vitenskapelig beslutning: `kognitiv_terapi` er ikke `source_verified`.** Åtte av åtte eksisterende felt er redaksjonelt vurdert mot nåværende kildetilgang; dette er **ikke** det samme som åtte fulltekstverifiserte påstander. Kravene for å avslutte er:

1. Skaff og les **Kovacs mfl. 1981 s. 33–39**, dokumenter nøyaktig behandlingstildeling, deltakergjennomstrømning, alle nevnerdefinisjoner, ettårsintervensjoner, komplett resultatgrunnlag og konkret forklaring på 1977-versus-1981-tallene.
2. Skaff og les **Rush mfl. september 1981 s. 221–229**, kontroller datagrunnlagets identitet, analysetidspunkter, kryssforskjøvningsmatriser, frafall og om temporale relasjoner er robust mot alternativ spesifikasjon.
3. Skaff og les **Rush mfl. juli 1982 s. 862–866**, kontroller gruppevis N, skalaer, antall gyldige observasjoner, statistiske analyser og om 35-personersutvalget faktisk overlapper de to 1981-utvalgene.
4. Før en eksplisitt **publikasjon–kohort–mål–tidspunkt–analyse**-matrise og separat risiko-for-skjevhet-vurdering. Dersom originalene ikke identifiserer personer eller deltakerflyt, marker overlapp som *ikke etterprøvbart*, ikke som bevist eller motbevist.

**Prosessport:** PR #6206 må forbli **draft**. Ingen endring i `source_review_state`, `source_verified`, godkjenningsfelter, kliniske råd, Civication eller History Go-kjerne. Status etter denne dokumentasjonskontrollen: **16 registrerte originalporter, 32 eksisterende påstandsenheter, 14 teorikort, 0 av 4 vitenskapelig godkjent**. Denne seksjonen dokumenterer de faktiske utestående kravene i stedet for å redusere dem.


## 29. Kognitiv terapi – Beck-arkivet, imipraminprotokoll og kontroll av tilgang (11. oktober 2026)

### 29.1 Nytt spor til upublisert/originalt metodegrunnlag

**Original arkivkatalog kontrollert, ikke arkivmappene:** University of Pennsylvania Archives and Records Center har bevart [*Aaron T. Beck Papers*, samlingssignatur **UPT 50 B393**](https://archives.upenn.edu/collections/finding-aid/upt50b393/), i en omfattende fysisk manuskriptsamling (finding aid utarbeidet 2009). Katalogen identifiserer følgende spesielt relevante mapper:

| Arkivboks/mappe | Katalogpost | Datering i katalog | Mulig forskningsbetydning og begrensning |
| --- | --- | --- | --- |
| **49/45** | «Cognitive-behavioral psychotherapy versus antidepressant medication», presentert av Maria Kovacs og A. John Rush | **april 1976** | Dokumentert presentasjon før den trykte 1977-rapporten; faktisk utvalg, metode og eventuelle data er **ikke lest**. |
| **50/4** | «Comparative efficacy of cognitive therapy and pharmacotherapy in the treatment of depressed outpatients», Rush mfl.; *Cognitive Therapy and Research* | **1977** | Arkivert manuskript/trykkspor til 1977-artikkelen; mulig kontroll mot den publiserte N=41-versjonen. |
| **50/52** | «Differential effects of cognitive therapy and pharmacotherapy on hopelessness and self concept», A. J. Rush mfl. | **1980** | Forløper eller relatert manuskript er en **hypotese**, ikke dokumentert at dette er teksten til 1982-publikasjonen eller september-1981-publikasjonen. |
| **52/45** | «#127, one-year follow-up of depressed outpatients treated with cognitive therapy or pharmacotherapy», Maria Kovacs mfl. | **1980** | Mest direkte arkivspor mot **Kovacs mfl. 1981 (N=44/35)** og det uavklarte 1977-regnskapet N=41/32. Manuskriptet er **ikke hentet**. |

**Kildestatus:** Dette er en offisiell *finding aid* som bekrefter at slike mapper er katalogført. Arkivkatalogen inneholder **ikke** reproduksjon av artiklene, deltakerflyttabeller eller anonymiserte rådata. Tilgang til de fysiske arkivdokumentene må avklares med University Archives under institusjonens [arkivprotokoll](https://archives.upenn.edu/collections/finding-aid/upt50b393/). Bestill eventuelt først en **anonymisert, aggregert metode-/deltakerflyt-avskrift**, ikke identifiserbare pasientjournaler. Å bevise individuelle pasientkoblinger er verken gjennomført eller nødvendig for publisering av en redelig vitenskapelig avgrensning: dersom primærkildene ikke oppgir kohortkobling, blir den **uavklart**.

**Kildekravet er ikke løst:** Den nøyaktige koblingen mellom 41/32 i 1977, 44/35 i januar 1981 og N=35 i september 1981 og juli 1982 er fortsatt ikke bekreftet. Oppføringen «1980» i katalogen er **manuskriptets katalogdatering**, ikke en ny offentlig artikkel eller bevis for annet pasientutvalg.

### 29.2 1977-originalen: konkret medikamentdoserings- og behandlingsstruktur

Ytterligere direkte lesning og visuell kontroll av [Rush mfl. 1977, trykte s. **23–27, 29, 32–33**](https://dradamvolungis.com/wp-content/uploads/2012/01/efficacy-of-cognitive-therapy-treatment-for-depression-rush-et-al-1977.pdf) bekrefter følgende:

1. **Planlagt legemiddelforløp på s. 24:** Imipramin startet på **75 mg ved sengetid**, ble økt/holdt på **150 mg daglig i uke 2–4**, kunne etter klinisk behov økes til **200 mg i uke 5–7** og **inntil 250 mg i uke 8–10**; **de to siste ukene ble brukt til nedtrapping og seponering**. Dette er en *beskrevet protokoll*; den dokumenterer ikke hvilke doser hver person faktisk mottok eller etterlevelse.
2. **Ny, substansiell metodisk begrensning på s. 27 (fotnote 3):** Forfatterne bemerket at gjennomsnittlig BDI i legemiddelgruppen **økte med 2,43** mellom uke 10 og uke 12, mot reduksjon på **2,17** i CT-gruppen; økningen var knyttet til betydelig symptomforverring hos **én person**. Forfatterne spurte uttrykkelig om utflating i bedringen hos legemiddelpasienter kunne henge sammen med dosereduksjon og anbefalte at framtidige studier opprettholdt full dose gjennom hele behandlingen før nedtrapping. Dette gir **mulig konkurrerende forklaring**, *ikke bevis for at nedtrappingen forårsaket forskjellen*.
3. **Observerte og tilbudte terapidoser er ulike:** CT-protokollen tillot **opptil 20 økter à 50 minutter**, men fullførerne mottok i gjennomsnitt **15,3 økter** på **10,90 uker**. Legemiddelgruppen hadde tilbud om opptil 12 ukentlige **20-minutters konsultasjoner**, og fullførerne var i behandling i gjennomsnitt **10,86 uker**. Sammenligningen gjelder ulike intervensjonsforløp og kontaktmuligheter; ikke identisk terapeutkontakt.
4. **Balanserende metodeopplysninger på s. 25:** Begge intervensjonene ble gjennomført etter behandlingsmanual. Psykoterapisamtalene ble tatt opp og terapeuter ble veiledet ukentlig, og et tilfeldig opptaksutvalg var undersøkt av en uavhengig forskningsassistent. Disse prosedyrene støtter rapportert etterlevelse av *behandlingsinstruksjonene*, men reparerer ikke manglende blindet utfallsvurdering eller likt behandlingsvolum. Studieforfatterne behandlet selv **ingen** CT-pasienter i dette forsøket.
5. **Målekompletthet på s. 26 og 29:** BDI-kompletthet (18/14 fullførere; 19/22 inkludert avbrudd) kan ikke projiseres over på Hamilton eller Raskin, der N varierer. BDI med videreført siste observasjon er ikke reell uke-12-observasjon for alle.
6. **Forfatterkritikken s. 32–33:** Rush mfl. drøftet selv muligheten for seleksjons-, forventnings-, frafalls-, vurderings- og kontaktbias. At terapimanual og supervisjon fantes, er derfor et designpluss innen intervensjonsintegritet, men **ikke** en kontroll for hele intervensjonskontrasten.

**Forholdet til samtidig legemiddelkritikk:** Becker og Schuckits kritikk (1978) om hvorvidt legemiddelprotokollen var en adekvat komparator har fortsatt bare abstract-/bibliografistatus i denne revisjonen. Den nøyaktig kontrollerte 1977-protokollen viser nå hvorfor spørsmålet er faglig relevant; den gir **ikke** grunnlag for å konkludere at en bestemt alternativ dose eller varighet nødvendigvis ville snudd behandlingsresultatet.

### 29.3 Status / videre verifiseringsport

- **Direkte verifisert fra original 1977:** doserings- og nedtrappingsplan; faktisk gjennomsnittlig CT-sesjonsantall; manual-/supervisjonsprosedyre; rapporterte BDI-endringer i uke 10–12 med én spesielt utslagsgivende observasjon. Dette styrker metodekritikken, men er **ikke en rekonstruksjon av individuelle data**.
- **Direkte verifisert fra University of Pennsylvanias originale arkivkatalog:** eksistens, datering og mappesignaturer for fire relevante arkivinnførsler. **Ingen innholdsgodkjenning** fra disse arkivmappene.
- **Fortsatt åpne fulltekster:** Kovacs (1981) s. 33–39, Rush (1981) s. 221–229, Rush (1982) s. 862–866. Arkivoriginale manuskripter kan brukes til historisk kontroll, men må sammenholdes med **faktisk publisert versjon** og erstatte den ikke uten dokumentasjon av forskjellene.
- **Ingen statuspromotering:** `source_review_state=partial_historical_method_review`, åtte felt vurdert, **16 kildeporter totalt**, 32 underpåstander totalt, **0/4** teorikort kilde-/vitenskapelig sluttgodkjent. PR skal forbli **draft**. Ingen felles utvalgsstørrelse eller spesifikk kognitiv kausalmediator er fastslått.



## 30. Kognitiv terapi – konkret primærkildetilgang og arkivbestilling (11. oktober 2026)

**Status:** Dette er en kildeanskaffelseslogg og en praktisk bestillingsspesifikasjon, **ikke** en ferdig fulltekstrevisjon. Ingen av de tre etterspurte originalfulltekstene fra 1981–1982 ble hentet eller lest i denne kontrollen. Det publiserte deltakerregnskapet **41/32** i 1977 versus **44/35** i 1981 er fortsatt uavklart; Rush-studienes respektive **N=35** er ikke individkoblet.

### 30.1 Konkrete tilgangsresultater

| Dokument | Verifisert tilgangsforsøk | Nåværende bevisnivå |
| --- | --- | --- |
| Kovacs, Rush, Beck og Hollon (1981), *Archives of General Psychiatry* 38:33–39, DOI [10.1001/archpsyc.1981.01780260035003](https://doi.org/10.1001/archpsyc.1981.01780260035003) | [Forlagets PDF-lenke](https://jamanetwork.com/journals/jamapsychiatry/articlepdf/492460/archpsyc_38_1_003.pdf) fører ved offentlig tilgang tilbake til abstract/innlogging; JAMA angir kjøp eller institusjonstilgang. | Originalabstract kontrollert; originalsidene 33–39 **ikke lest**. |
| Rush, Kovacs, Beck, Weissenburger og Hollon (1981), *Journal of Affective Disorders* 3:221–229, DOI [10.1016/0165-0327(81)90024-0](https://doi.org/10.1016/0165-0327(81)90024-0) | [Elseviers forlagsside](https://www.sciencedirect.com/science/article/pii/0165032781900240) viser metode-/resultatabstract, men ingen etterprøvbar åpen fulltekst i denne kontrollen. | Originalabstract kontrollert; artikkelsider og panelmatriser **ikke lest**. |
| Rush, Beck, Kovacs, Weissenburger og Hollon (1982), *American Journal of Psychiatry* 139:862–866, DOI [10.1176/ajp.139.7.862](https://doi.org/10.1176/ajp.139.7.862) | [Forlagets PDF-endepunkt](https://psychiatryonline.org/doi/pdf/10.1176/ajp.139.7.862?download=true) er identifisert, men returnerte HTTP 403 ved henteforsøk; [PubMed](https://pubmed.ncbi.nlm.nih.gov/7091401/) bekrefter abstract og bibliografi. | Originalabstract kontrollert; artikkelsider 862–866 **ikke lest**. |

En lenke med «PDF» i adresse eller søkeresultat er **ikke** bevis for at originalens sidetekst eller tabeller er gjennomgått. Ingen av publikasjonene er derfor oppgradert til fulltekstverifisert.

### 30.2 Originalmanuskripter ved University of Pennsylvania Archives

Den offisielle [*Aaron T. Beck Papers*, UPT 50 B393](https://archives.upenn.edu/collections/finding-aid/upt50b393/), katalogfører særlig følgende **ikke gjennomleste** mulige kildebroer:

| Boks/mappe | Katalogert materiale | Faglig undersøkelsesspørsmål |
| --- | --- | --- |
| **52/45** | Manuskript #127, *one-year follow-up of depressed outpatients treated with cognitive therapy or pharmacotherapy* (Kovacs mfl., 1980) | Kan manuskriptet forklare 44/35 og eventuelle forskjeller fra den publiserte 1977-rapporten? |
| **12/36** | Steven D. Hollon, *Manuscripts and research material, 1977–1981* | Finnes kontrollert studie-/rekrutteringsbeskrivelse eller kobling til den første behandlingsstudien? |
| **4/34** | Brian Shaw, *Cognitive therapy outcome studies*, tabell (1977) | Kan samtidige aggregerte tabeller bidra til å avklare teller-/nevnerdefinisjoner? |
| **49/22** | *Cognitive therapy versus pharmacotherapy of depression*, Steven D. Hollon mfl. (august 1977) | Sammenhold rapporteringsperiode, utvalgskriterier og analyser mot 1977-originalen. |
| **50/52** | *Differential effects of cognitive therapy and pharmacotherapy on hopelessness and self concept*, Rush mfl. (1980) | Kan dette være et forarbeid til senere analyser, og beskrives eventuelle analyseutvalg? **Tekstidentitet er ikke bekreftet.** |

**Arkivets egen bestillingsordning er kontrollert:** [Research Services and Fees](https://archives.upenn.edu/research/services-fees/) oppgir mulighet for digital reproduksjon, **inntil 100 PDF-sider uten sideavgift**, men forskningsassistanse kan medføre gebyrer og tilgang krever arkivets aksept. Offisiell kontakt: [University Archives](https://archives.upenn.edu/archives-info/contact/), **uarc@pobox.upenn.edu**. [Penn Libraries Request a Scan](https://www.library.upenn.edu/services/request-scan) beskriver en separat ordning for tidsskriftartikler og spesialsamlinger; tilgjengelighet for eksterne brukere må bekreftes. **Ingen forespørsel er sendt, ingen dokumenter bestilt og ingen betaling avtalt.**

**Forespørselens avgrensning:** Be om publiserte originalartikler, eventuelt allerede tilgjengelige skann av de fem ovennevnte manuskript-/tabellmappene, samt kun **anonymiserte/aggregert rapporterte** utvalgstall. Ikke be om identifiserbare pasientjournaler.

### 30.3 Kontrollport ved faktisk dokumentmottak

1. Noter utgave, fysisk sidetall, proveniens og hele originalens tilgjengelighet per verk.
2. Rekonstruer for **hver publikasjon**: screenet → inkludert → tildelt → behandlet → protokollfullført → gyldig måling → analyse → oppfølging, med gruppevise nevnere og grunner til frafall bare der originalen faktisk angir dem.
3. Skill **rekrutteringsutvalg**, **fullførere**, **korttidsanalyse** og **oppfølgingsanalyse**. Dokumenter eksplisitt om 41/32 og 44/35 er samme studiedeltakere etter ulike inklusjons-/dataregler, utvidet rekruttering eller separate utvalg. Et konstant differansetall på tre er ikke nok.
4. Sammenhold Rush 1981 og Rush 1982 med Kovacs 1981 på tidsperiode, inklusjonskriterier, behandlingsarmer, utvalgsflyt og analysemål. Merk **dokumentert overlapp**, **dokumentert ikke-overlapp** eller **ukjent**; ikke summer tre N=35-publikasjoner til tre uavhengige behandlingseksperimenter.
5. Før separat skjevhetsvurdering av tildeling, ublindede vurderere, ulik kontaktmengde, interkurrent behandling, informativt frafall, håndtering av manglende verdier og alternative årsaksforklaringer. Godkjenn kun formuleringer med etterprøvbart, direkte belegg.

**Sperre opprettholdes:** Kildeanskaffelsen er fortsatt ufullført; ingen kohortavvik er løst og ingen ny vitenskapelig evidens er påvist. `kognitiv_terapi` er **ikke** `source_verified`, PR #6206 forblir **draft**, og verken kort, påstandsregister, godkjenningsfelt eller History Go-/Civication-kode endres i denne dokumentasjonsoppdateringen.


## 31. Kognitiv terapi – uavhengig historisk kohortomtale fra 1986 (11. oktober 2026)

**Nytt gjennomlest dokument:** I.M. Blackburn, K.M. Eunson og S. Bishop, *A two-year naturalistic follow-up of depressed patients treated with cognitive therapy, pharmacotherapy and a combination of both*, *Journal of Affective Disorders* **10** (1986), s. 67–75. [Lesbar ni-siders reproduksjon av originaltrykket](https://gwern.net/doc/psychiatry/depression/1986-blackburn.pdf). Originalens trykte s. **68**, venstre spalte, er kontrollert visuelt.

**Viktig nytt historiografisk belegg:** Blackburn mfl. omtaler eksplisitt Kovacs mfl. (1981) som en ettårs naturalistisk oppfølging av **pasientene fra Rush mfl. (1977)** som fikk kognitiv terapi eller imipramin. Dette er et samtidig fagfellevurdert, **sekundært vitnesbyrd om studiedesignets historiske sammenheng**, ikke primærdokumentasjon av identiske pasientlister eller den nøyaktige rekrutteringsflyten. Det øker grunnlaget for å omtale de to publikasjonene som samme **forskningsforløp**, men er **ikke** dokumentasjon for at alle 41 pasienter i 1977 og 44 i 1981 hadde identisk inklusjon.

| Avgrenset spørsmål | Dokumentasjon etter 1986-funnet | Faglig tillatt konklusjon |
| --- | --- | --- |
| Fulgte Kovacs mfl. (1981) opp det tidligere Rush-forsøket? | Blackburn mfl. 1986, s. 68, skriver dette eksplisitt om den opprinnelige Rush-populasjonen. | **Sterk sekundærstøtte** for samme historiske forskningsforløp; fortsatt ikke primærverifisert på individ-/inklusjonsnivå. |
| Hvorfor **41/32** i 1977, men **44/35** i 1981? | Begge publiserte tallsett står uendret; Blackburn gir ingen tildelings- eller deltakerflytbro. | **Uavklart.** Ingen tre nye personer, definisjonsendring eller frafallsårsak skal konstrueres. |
| Er Rush september 1981 og juli 1982 samme **N=35** som Kovacs? | Blackburn omtaler ikke disse analytiske koblingene eller deltakerfordelingen. | **Uavklart** for begge. Ingen antatt N=105 og ingen uavhengig replikasjon påstås. |
| Er Blackburn mfl. (1986) en ny primærkilde til Rush-kohorten? | Artikkelen har sin **egen separate britiske behandlingsstudie** med annen rekruttering og toårig oppfølging, og refererer til Rush/Kovacs i bakgrunnen. | **Nei.** Blackburns egne deltakertall må aldri slås sammen med Rush/Kovacs. |

**Kildestatus og tiltak:** Det nye funnet endrer **tolkningsstyrken for historisk studieforbindelse**, ikke det verifiserte deltakerregnskapet eller de åtte eksisterende påstandsenhetenes godkjenning. Et ferdig e-postutkast til University of Pennsylvania Archives er **lagret, ikke sendt**; det ber om tilgjengelighet, eventuell skanning og forhåndspris for relevante arkivmapper, særlig boks 52/mappe 45. Arkivets [offisielle reproduksjonsvilkår](https://archives.upenn.edu/research/services-fees/) innebærer at sideavgift kan være null for de første 100 PDF-sidene, mens **forskningsservice likevel kan faktureres**; ingen ordre, utgift eller betaling er autorisert.

**Vedtak:** Ingen av de tre 1981–1982-originalfulltekstene er lest; studieidentitet på individnivå, 41/32 mot 44/35 og de to Rush-utvalgene er fortsatt åpne primærkildekrav. Ingen nye canonical ID-er eller kildeporter opprettes på grunnlag av et sekundært historisk kildevitnesbyrd. `source_verified` opprettholdes som **false** og PR #6206 som **draft**. Ingen påstand om kausal kognitiv mediator eller selvstendig behandlingsrangering.
