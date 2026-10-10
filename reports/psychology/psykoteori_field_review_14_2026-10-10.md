# Psykoteori: feltvis fagrevisjon av 14 kort

**Dato:** 2026-10-10  
**Omfang:** 14 eksisterende teorikort i `data/psychology/psychology_theories.json`, seks fagverkskapitler, 18 eksisterende emnekoblinger.  
**Status:** Revidert og dokumentert delkontroll; **0/14 fullt source-verified og 0/14 editorial-approved**. Ingen klinisk godkjenning.  
**Forløpere:** `reports/psychology/psykoteori_source_review_batch_01_2026-10-09.md` til `batch_04_2026-10-09.md`. 

## Kontrollmetode og kildeterskel

Alle 14 kort er gjennomgått felt for felt (`founders`, `period`, `idea`, `method`, `limit`, `example`, `contrast`) med utgangspunkt i faktisk korttekst, tidligere kildebatches og de konkrete originalarbeidene og oversiktene nedenfor. Vi skiller mellom (a) publikasjon/historikk, (b) teoretisk påstand, (c) empirisk test, (d) klinisk effekt og (e) anvendelse i et hypotetisk scenario. En bibliografisk kilde støtter bare (a) til noe annet er vist. DOI-/PubMed-opplysninger og tilgjengelige sammendrag er kontrollert der det er angitt; en slik kontroll er **ikke** fulltekstkritikk, uavhengig replikasjonsgjennomgang eller fullstendig claim-for-claim-verifisering.

For å hindre falsk faglig godkjenning står `source_review_state` som `partial_historical_method_review`; dekningsregisteret beholder `source_review_status=not_reviewed`, `editorial_review_status=not_reviewed` og tomme `verified_theory_claim_ids`/`verified_theory_source_ids`. De syv nye bibliografiske referansene er **ikke** tilordnet canonical claim-/source-ID-er uten dokumentert samsvar med Fagverkets aktuelle `claims.json`.

## Individuell vurdering (alle syv tekstfelt kontrollert)

### 1. Psykoanalyse — `psykoanalyse`
- **Forsker, verk, tidsrom:** Sigmund Freud, tradisjonens fremvekst fra 1890-årene; `Die Traumdeutung` publisert ved årsskiftet 1899/1900. Freud Museum og Library of Congress dokumenterer historikken, ikke alle mekanismene.
- **Påstand, metode, empirisk grense:** Fortolkning av konflikter og relasjoner er satt i eksplisitt historisk/teoretisk kontekst. Kliniske kasus og teksttolkning må skilles fra forskningsdesign som faktisk tester mekanismer.
- **Rival og eksempel:** Mot kognitiv psykologi med falsifiserbare, operasjonaliserte hypoteser; studentens muntlige prøvesituasjon er hypotetisk, ikke terapi eller en dokumentert pasienthistorie.
- **Rettet:** `idea`, `limit`, `contrast`. **Gjenstår:** systematisk effektlitteratur for konkrete psykodynamiske behandlingsformer; påstand for påstand-kobling.

### 2. Behaviorisme — `behaviorisme`
- **Historikk:** Watsons `Psychology as the Behaviorist Views It` (1913) skiller metodisk program fra Skinners senere operante forskning (sentrale arbeider 1953).
- **Mekanisme og metode:** Læringsprinsipper kan testes i kontrollerte oppsett og måles som atferd; negativ forsterkning må ikke omtales som straff.
- **Rival og eksempel:** Banduras observasjonslæring kan forklare læring før egen direkte konsekvens; varsel/telefon er hypotetisk atferdskjede.
- **Rettet:** `idea`, `limit`. **Gjenstår:** avgrensede overføringsstudier fra forsøksbetingelser til ulike hverdagsmiljøer.

### 3. Kognitiv psykologi — `kognitiv_psykologi`
- **Historikk:** 1950-/1960-tallets kognitive vending, Neissers `Cognitive Psychology` (1967), dokumentert i tidligere kilder.
- **Mekanisme og evidens:** Reaksjonstid, feil og minneprestasjoner brukes til å prøve prosessmodeller; en modell som passer én oppgave er ikke enerådende.
- **Rival og eksempel:** Eksplisitte modeller for interne prosesser sammenholdes med behavioristiske beskrivelser; forelesningsminne er hypotetisk.
- **Rettet:** `method`, `limit`. **Gjenstår:** teori- og replikasjonsavhengig gyldighet for særskilte minnemodeller.

### 4. Humanistisk psykologi — `humanistisk_psykologi`
- **Historikk:** Rogers (1957) om betingelser i terapeutisk relasjon og Maslow (1943) om motivasjon er beslektede, men separate originale bidrag.
- **Metode og evidens:** Historiske teoripåstander skilles fra data om pasientutfall; kvalitative intervjuer beviser ikke automatisk universell vekstmodell.
- **Rival og eksempel:** Behaviorismens operasjonaliserte læringsbetingelser settes opp mot erfaring, mening og relasjon; elevens studievalg er hypotetisk.
- **Rettet:** `idea`, `method`, `contrast`. **Gjenstår:** indikasjonsspesifikk empirisk evaluering av relasjonsbetingelser og behandlingsutfall.

### 5. Femfaktormodellen — `femfaktormodellen`
- **Historikk:** Goldberg, Costa og McCraes sentrale utviklingsbidrag beskrevet i McCrae og John (1992) og Widiger og Crego (2019).
- **Evidens/metode:** Faktoranalyse, reliabilitet og konstruktvaliditet gir statistisk trekkstruktur; skårer er ikke diagnoser.
- **Reell alternativ modell:** Ashton og Lee (2007), HEXACO med seks dimensjoner og ærlighet–ydmykhet som viktig forskjell. https://pubmed.ncbi.nlm.nih.gov/18453460/
- **Rettet:** `method`, `contrast`; én ny kilde. **Gjenstår:** begreps- og krysskulturelle tester av måleinvarians og situasjonseffekter.

### 6. Heuristikker — `heuristikker`
- **Historikk:** Tversky og Kahneman (1974) om tilgjengelighet, representativitet og ankring. 1974-artikkelen brukes **ikke** som evidens for framing-eksemplet.
- **Separat primærkilde til eksemplet:** Tversky og Kahneman (1981), `The Framing of Decisions and the Psychology of Choice`. https://pubmed.ncbi.nlm.nih.gov/7455683/
- **Rival:** Gigerenzer og Gaissmaier (2011) om økologisk rasjonalitet; simple strategier kan være presise i visse miljøer. https://doi.org/10.1146/annurev-psych-120709-145346
- **Rettet:** `idea`, `method`, `contrast`; to nye kilder. **Gjenstår:** avgrensning av framing-effekten på tvers av oppgaver og populasjoner, samt individuelle mål med dokumentert reliabilitet.

### 7. Stress og kognitiv vurdering — `stressvurdering`
- **Originalstudie:** Folkman, Lazarus mfl. (1986) undersøker primær/sekundær vurdering, coping og utfall innen individ i naturlige stressende møter. https://pubmed.ncbi.nlm.nih.gov/3712234/
- **Mekanisme/metode:** Skiller krav, oppfattet betydning og mestringsmuligheter; observerte sammenhenger er ikke automatisk kausalitet.
- **Alternativt nivå:** Fysiologiske stressreaksjoner må undersøkes ved egne mål, ikke bortforklares som tanker.
- **Rettet:** `idea`, `method`, `contrast`. **Gjenstår:** nyere synteser om tidsforløp og forholdet til kronisk fysiologisk belastning.

### 8. Tilknytning — `tilknytning`
- **Historikk:** Bowlbys teori og Ainsworths empiriske arbeid holdes atskilt; historisk gjennomgang av Strange Situation hos Rosmalen mfl. (2015). https://doi.org/10.1002/jhbs.21729
- **Metode/belegg:** Feltobservasjon, standardisert separasjon/gjenforening og longitudinelle metaanalyser. Metaanalyser dokumenterer moderat, ikke absolutt, stabilitet.
- **Grense og scenario:** Forskningsprosedyren brukes **ikke** som individuell diagnose eller bevis for omsorgskvalitet ut fra én økt.
- **Rettet:** `method`, `limit`, `example`; én ny kilde. **Gjenstår:** måleinvarians og kultur-/familiekontekst i full gjennomgang.

### 9. Sosial læring og mestringstro — `sosial_laring`
- **Originalarbeider:** Bandura, Ross og Ross (1961) studerte imitasjon i en bestemt laboppgave; Bandura (1977) introduserte mestringstro som teoretisk mekanisme.
- **Metode/grense:** Modellæring og oppgavespesifikk mestringstro er ikke synonymt, og laboratoriesituasjonen gir ingen universalprediksjon.
- **Rival og scenario:** Operant forsterkning av egen handling versus indirekte observasjonslæring; klasseeksemplet er hypotetisk.
- **Rettet:** `idea`, `limit`. **Gjenstår:** kausal og kontekstuell effektlitteratur for self-efficacy utover originalverkets teoripåstand.

### 10. Sosial identitet — `sosial_identitet`
- **Originalforskning:** Tajfel mfl. (1971) dokumenterer minimumsgruppefunn, som ikke i seg selv er en full formulering av senere sosial identitetsteori.
- **Reell rival:** Sherifs intergruppeforskningsprogram fra 1954/1961 om konkurranse, konflikt og felles mål. https://www.yorku.ca/pclassic/Sherif/chap2.htm
- **Metode og anvendelse:** Kategoriseringsforsøk og gruppeidentifikasjon krever kontekst og analyse på gruppenivå; studentgruppe-eksemplet er hypotetisk.
- **Rettet:** `idea`, `contrast`; én ny kilde. **Gjenstår:** direkte historisk kilde til Tajfel–Turners senere teoretiske syntese, replikerbarhet og rivalmodelltest.

### 11. Konformitet — `konformitet`
- **Originalarbeid:** Asch (1956) undersøkte spesifikke svar under flertallspress, ikke en allmenn prosentandel 'konforme personer'.
- **Uavhengig syntese:** Bond og Smith (1996) samlet 133 Asch-lignende studier fra 17 land; nivået varierer med kultur og tidspunkt. https://doi.org/10.1037/0033-2909.119.1.111
- **Rival/eksempel:** Ulike normative og identifikasjonsbaserte påvirkningsmekanismer; feilaktig linjesvar er hypotetisk oppgave.
- **Rettet:** `method`, `limit`; én ny kilde. **Gjenstår:** nyere replisering og digital kontekst; canonical `src-descriptive-injunctive` har en dokumentert tittel–URL-mismatch, se batch 04.

### 12. Resiliens — `resiliens`
- **Teori og empirisk analyse:** Masten (2001) beskriver beskyttende utviklingssystemer, ikke uforanderlig 'styrke'.
- **Meta-evidens:** Zalta mfl. (2021) finner sammenheng mellom sosial støtte og selvrapporterte PTSD-symptomer i ikke-kliniske traumeeksponerte voksenutvalg, med høy heterogenitet. https://pubmed.ncbi.nlm.nih.gov/33271023/
- **Grense:** Observasjon av symptomer kan ikke brukes til å tildele skyld, klinisk risikoskår eller individuell prognose.
- **Rettet:** `idea`, `method`, `limit`. **Gjenstår:** kausale design og distinksjon mellom symptomendring og positiv tilpasning.

### 13. Kognitiv terapi / CBT — `kognitiv_terapi`
- **Historikk:** Becks `Cognitive Therapy of Depression` (1979) og Ellis' relaterte, egne rasjonell-emotive tilnærming skilles fra hverandre.
- **Effektbelegg:** Cuijpers mfl. (2023), 409 forsøk / 52 702 deltakere om CBT ved depresjon, med moderate–store forskjeller mot kontrollbetingelser og ingen robust generell overlegenhet over andre psykoterapier. https://pubmed.ncbi.nlm.nih.gov/36640411/
- **Klinisk grense:** Resultat gjelder utvalgte indikasjoner og måleoppsett; kortets øvelse er et hypotetisk skoleeksempel, ikke behandling.
- **Rettet:** `idea`, `method`, `limit`, `contrast`; én ny kilde. **Gjenstår:** kritisk fulltekstanalyse av risiko for skjevhet, skade og indikasjonsspesifikke retningslinjer.

### 14. Biopsykososial modell — `biopsykososial_modell`
- **Historikk:** Engel (1977) lanserer en utvidet medisinsk forklaringsramme. https://pubmed.ncbi.nlm.nih.gov/847460/
- **Metode og rival:** Hvert biologisk, psykologisk og sosialt ledd må gjøres målbart og prøves; en snevrere biomedisinsk modell har andre, ofte mer avgrensede prediksjoner.
- **Grense:** WHOs systemveiledning er normativ kontekst, ikke empirisk validering av Engels rammeverk; søvn/arbeid/støtte er hypotetiske forskningsvariabler.
- **Rettet:** `idea`, `method`, `contrast`. **Gjenstår:** konkret testbar mekanisme- og kausalitetsbinding i hvert anvendte emne.

## Integritet og restanse

- **14/14** kort har feltvis tekstgjennomgang; det betyr ikke at alle 14 har fått fulltext-/claim-verifikasjon.
- **7** nye kildeankre på **6** kort, med tekst om hva de støtter, og identisk URL-speil i dekningsregisterets primærposter.
- **18/58** emner er direkte koblet; **40** mangler direkte inngang, men eksisterer allerede i Fagverket.
- **0/14** full kildegodkjenning; **0/14** redaksjonell sluttgodkjenning. Ikke endre dette automatisk.
- **Uavklart fra forrige batch:** `src-descriptive-injunctive` i kapittelet `sosialpsykologi-normalitet-og-stigma/claims.json` har mistilpasset tittel/URL og skal kildeavklares i en egen, avgrenset canonical retting før denne kilden brukes som teoribevis.
- For endelig `source_verified` kreves kilde–påstand-matrise per kort med korrekte canonical claim- og source-ID-er, fulltekst/primæranalyse og vurdering av empirisk styrke. For `editorial_pass` kreves i tillegg dokumentert historisk case, rival med analytisk konsekvens, løst fagverkbånd og manuell tverrkort-review. **Ikke merk en lenke som ferdig bare fordi den peker til et emne.**

## Kvalitetsevaluering (AGENTS.md, foreløpig)

| Dimensjon | Score / 5 | Begrunnelse |
|---|---:|---|
| Korrekthet og evidens | 3 | Konkrete original-/oversiktskilder og metodiske forbehold, men ikke full tekst- og claimkontroll |
| Dekning og ferdigstillelse | 3 | Alle 14 kort feltgjennomgått; verifikasjon og 40 manglende emnekoblinger gjenstår i hele programmet |
| Faglig/redaksjonell kvalitet | 4 | Rettet konkrete metode-/rivalfeil og fjernet for vidtrekkende slutninger |
| Teknisk integritet | 3 | Avventer faktisk CI og kjørbar audit på denne PR-head |
| Sikkerhet og ansvarlighet | 5 | Ingen diagnoser, brukerprofiler, behandlingspåstander uten indikasjon eller poengendringer |
| Vedlikeholdbarhet/etterprøvbarhet | 4 | Felt- og kildeendringer er kildeangitt; katalog og dekningsregister speiles |

**Sum foreløpig: 22/30. Ikke 'høy kvalitet'/ferdig eller klar for vitenskapelig sluttgodkjenning.** En teknisk grønn PR kan bare godkjenne denne evidensavgrensede forbedringsbatchen, ikke 14 fullstendig kildegodkjente kort.
