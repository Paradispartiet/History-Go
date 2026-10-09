# Psykologrommet → Psykoteori → Psykologifagverket: produksjonsplan

**Dato:** 2026-10-09  
**Status:** Operativ plan / ikke redaksjonell ferdigmelding  
**Repository:** `Paradispartiet/History-Go`  
**Omfang:** Teoriinngangen i Psykologrommet; ikke omskriving av Psykologifagverket  
**Forløper:** [PR #6168](https://github.com/Paradispartiet/History-Go/pull/6168), fortsatt åpen per planleggingen

## 1. Beslutning og mål

Psykologrommet skal få et faglig sterkt, lesbart **Psykoteori**-lag. Brukeren skal kunne bevege seg mellom **teori → forklaring, evidens og begrensning → sammenligning → relevante canonicale emner → hele psykologifagverket**, og ved relevant belegg videre til historiske personer og steder i History Go. Psykoteori er et pedagogisk inngangslag, ikke et nytt fagverk, en klinisk tjeneste eller en kopi av pensumartiklene.

**Målbar dekningsdefinisjon:** Samtlige 58 canonicale psykologiemner skal ha minst én **faglig relevant, kilde- og claimforankret** teori-/modell-, metode-, empirisk eller institusjonshistorisk inngang fra Psykoteori. Ikke alle 58 emner behøver et unikt teorikort: ett kort kan dekke flere emner, og emner som institusjonshistorie, rettigheter eller krisepraksis skal **ikke** tildeles oppdiktede psykologiske teorier. Betegnelsen «full dekning» krever relevant bruk og faktisk evidens, ikke bare en teknisk lenke.

## 2. Dokumentert utgangspunkt

- Det eksisterer seks canonicale psykologikapitler i `data/fagverk/psykologi/`, med til sammen **58 unike `emne_ids`**.
- Alle 58 har egne emneartikkelfiler i `data/fagverk/psykologi/emneartikler/`. Fagverket har også universitetsmateriale og separat teori-integritetsregister. Det ville være feil å beskrive disse 44 uten direkte Psykoteori-kobling som manglende i **Fagverket**.
- Den **åpne** [PR #6168](https://github.com/Paradispartiet/History-Go/pull/6168) har et katalogutkast med **14** teorikort, koblet til **14 forskjellige emne-ID-er**. Dette utgjør **14/58 = 24,1 %** av direkte Psykoteori–emne-koblinger og **44/58** uten slik direkte kobling *i det PR-utkastet*. Antallet er ikke en måling av hele psykologiens faglige kvalitet og er **ikke publisert på `main`**.
- V1 har direkte ruter i `js/psychologyRoom.js` til `fagverk.html?subject=psykologi&chapter=<id>` og `&emne=<id>`, og krysslenker til `data/psychology/psychology_phenomena.json`.
- V1-testen `tests/civication-psychology-room-theory.test.js` bestod i siste CI-kjøring for #6168. To større workflows feilet på andre Civication-tester (blant annet avvik mot `data/Civication/careerGameplayMatrix.json`); feilenes opphav må bevises opp mot oppdatert `main` før eventuelle endringer. Det skal ikke gjøres vilkårlige Civication-rettelser for å få Psykoteori merget.

**Kildeskiller:** `main` eier dagens fagverk. #6168 er et separat, ennå umerget Psykoteori-utkast. Fremtidig arbeid må kontrollere deres aktuelle SHA-er og revidere denne baselinen om de endres.

## 3. Eierskap og arkitektur

| Ansvar | Canonical kilde / tenkt produksjonsplass |
|---|---|
| Fag-ID, emner, fagkart og metoder | `data/fag/fag_manifest.json` og `data/fag/psykologi/*canonical*` |
| Faglig substans og emneartikler | `data/fagverk/psykologi/<kapittel>.json`, tilhørende moduler, `emneartikler/` |
| Eksisterende teori-/forskerbindinger | `data/fag/psykologi/theory_integrity_bindings_psykologi_v1.json` |
| Kilder og claim-proveniens | Seks `data/fagverk/psykologi/<kapittel>/claims.json` og `data/fag/psykologi/kilder_psykologi_canonical_v1.json` |
| Kortversjoner og navigasjonspeker | `data/psychology/psychology_theories.json` i #6168, utvides kontrollert etter merge |
| Presentasjon, interaksjon | `js/psychologyRoom.js`, `css/psychologyRoom.css` |
| Fagverk-ruting | `fagverk.html?subject=psykologi&chapter=...` og `&emne=...`, eies av Fagverket |
| Steder/personer, quiz, Knowledge, progresjon | Respektive eksisterende canonical kilder; ingen parallelle ID-er eller lagringsmotorer |

**Bindende dokumenter:** `AGENTS.md`, `docs/FACTUALITY_CONTRACT.md`, `docs/FAGVERK.md`, `docs/FAGVERK_NAVIGATION.md`, `docs/SUBJECT_FILE_CONTRACT.md`, `data/fag/fagverk_theory_quality_contract_v1.json` (psykologi: `hybrid`), `data/fag/psykologi/psykologi_university_readiness_v1.json` og relevant `KNOWLEDGE_ARCHITECTURE`- og quizkontrakt ved senere integrasjon. Denne planen overstyrer **ingen** av disse.

## 4. Redaksjonell kontrakt for hvert teorikort

Et faglig ferdig teorikort må minst inneholde:

1. Canonical identitet, navn og en presis avgrensning av **teori, modell, metode eller empirisk ramme**. Forholdet mellom forklaring og beskrivelse må være klart.
2. Navngitte forskere og deres **konkrete** verk eller bidrag, med kildesjekket kronologi; ikke personnavn som quizpynt.
3. Faglig spørsmål, antakelser, sentrale begreper og påstander/mekanismer — pluss hva teorien **ikke** forklarer.
4. Faktisk empirisk belegg, forskningsdesign, målemetoder, styrker, svakheter og relevante alternative tolkninger; historisk betydning må ikke forveksles med evidens.
5. Minst én meningsfull rival/alternativ modell der fagfeltet er omstridt; sammenligningen skal vise ulike prediksjoner eller analytiske konsekvenser.
6. Et kildemerket historisk/dokumentert case **og** et separat klart merket **hypotetisk undervisningsscenario**, når emnet tillater dette. Dokumenterte steder/hendelser skal ha faktisk dokumentasjon; man trenger ikke konstruere sted for enhver teori.
7. Presis kobling til et eller flere eksisterende `emne_id` og korrekt `chapter_id`; ved behov `method_id`, `phenomenon_id`, person-/sted-ID, og tilbakekobling til det konkrete fagverksavsnittet.
8. `source_ids`, `claim_ids` og inspiserbare kildeankre som faktisk underbygger utsagnene. En generell lenke til et kapittel er **ikke** nok til å godkjenne kildekvaliteten på kortet.
9. Pedagogisk spørsmål og et begrunnet svar (kan brukes senere av quizmotoren), med eksplisitt usikkerhet og bruksgrenser.
10. For klinisk nært stoff: tydelig avgrensning mot diagnostikk, individuell vurdering og behandlingsråd; skåre- og profildata fra selvhjelpsrommet skal ikke brukes til å utlede diagnose eller teori «om brukeren».

Kilderekkefølge: originalarbeider/primærpublikasjoner, fagfellevurderte oppsummeringer og meta-analyser, vitenskapelige fagbøker/universitetsressurser, faglige organisasjoner og relevant institusjons-/arkivdokumentasjon. Kliniske prosedyrer krever aktuelle, faglige retningslinjer. Verifiser tittel, DOI/verk, utgave, relevans og faktisk påstand *før* godkjenning. Eksisterende kilder i `theory_integrity_bindings_psykologi_v1.json` er startpunkter, **ikke** automatisk godkjente bevis for nye påstander.

## 5. Komplett kartleggingsmatrise: 58/58 canonicale emner

Tabellene nedenfor er en **redaksjonell produksjonskø**, ikke godkjente teoripåstander. Kandidatene må kilde- og claim-verifiseres og kan erstattes dersom den faglige gjennomgangen tilsier det. «V1» betyr at PR #6168 allerede har direkte kobling; heller ikke disse er automatisk fullstendig kildeverifiserte i kortformat.

### 1. Fagtradisjoner, teori og forståelsen av sinnet — 14 emner

| Canonical emne-ID | Kandidat for teorikobling / empirisk ramme | Status i Psykoteori v1 |
|---|---|---|
| `em_psy_atferd_laring` | Operant læring; observasjonslæring (Bandura) | Må produseres / kobles |
| `em_psy_betinging_vaner` | Klassisk betinging (Pavlov); operant betinging (Skinner) | V1: Behaviorisme og operant læring |
| `em_psy_bevissthet_opplevelse` | Bevissthetsmodeller og fenomenologisk metode; empiriske begrensninger | Må produseres / kobles |
| `em_psy_diagnose_klassifikasjon` | Klassifikasjon, validitet og reliabilitet; historisk kritikk (ikke diagnosekort) | Må produseres / kobles |
| `em_psy_folelser_affekt` | Emosjonsteorier: appraisal, konstruksjon og fysiologiske modeller | Må produseres / kobles |
| `em_psy_forskning_metode` | Hypotesetesting, eksperimentdesign, konfundering og replikasjon (metodeløp) | Må produseres / kobles |
| `em_psy_hjerne_kognisjon` | Nevrokognitive forklaringsnivåer og hjerne–atferd-modeller | V1: Kognitiv psykologi |
| `em_psy_motivasjon_behov` | Selvbestemmelsesteori (Deci & Ryan); behov og motivasjon | Må produseres / kobles |
| `em_psy_nevroaffekt_regulering` | Nevroaffektive modeller; emosjonsregulering og evidensgrenser | Må produseres / kobles |
| `em_psy_personlighet_individ` | Big Five; HEXACO og situasjonelle forklaringer | V1: Femfaktormodellen (Big Five) |
| `em_psy_psykoanalyse` | Psykoanalyse som historisk tradisjon; empirisk status og rivaler | V1: Psykoanalyse |
| `em_psy_psykometri_maling` | Klassisk testteori; item response theory og målevaliditet | Må produseres / kobles |
| `em_psy_selv_utvikling_mening` | Humanistisk psykologi; selvbestemmelsesteori og mening | V1: Humanistisk psykologi |
| `em_psy_ubevisste_prosesser` | Dynamisk ubevisst versus kognitiv automatisering | Må produseres / kobles |

### 2. Kognisjon, følelser og atferd — 8 emner

| Canonical emne-ID | Kandidat for teorikobling / empirisk ramme | Status i Psykoteori v1 |
|---|---|---|
| `em_psy_affektregulering` | Gross' prosessmodell for emosjonsregulering | Må produseres / kobles |
| `em_psy_beslutning_valg` | Prospektteori; beslutning under usikkerhet | Må produseres / kobles |
| `em_psy_hverdagspsykologi` | Attribusjonsteori og hverdagsforklaringers grenser | Må produseres / kobles |
| `em_psy_kognisjon_tenkning` | Arbeidsminnemodeller; informasjonsbearbeiding | Må produseres / kobles |
| `em_psy_kognitive_bias` | Heuristikker og kognitive skjevheter; metodisk kritikk | V1: Heuristikker og kognitive skjevheter |
| `em_psy_oppmerksomhet_fokus` | Selektiv oppmerksomhet og kapasitetsmodeller | Må produseres / kobles |
| `em_psy_persepsjon_sansing` | Signal detection theory; prediktiv persepsjon som hypotese | Må produseres / kobles |
| `em_psy_stress_belastning` | Transaksjonell stressvurdering (Lazarus & Folkman) | V1: Stress og kognitiv vurdering |

### 3. Utvikling, oppvekst og læring — 9 emner

| Canonical emne-ID | Kandidat for teorikobling / empirisk ramme | Status i Psykoteori v1 |
|---|---|---|
| `em_psy_barn_ungdom` | Piagets kognitive utvikling; Vygotskijs sosiokulturelle perspektiv | Må produseres / kobles |
| `em_psy_familie_samspill` | Familiesystemperspektiver; tilknytning i kontekst | Må produseres / kobles |
| `em_psy_identitet_selv` | Eriksons psykososiale teori; identitetsstatus (Marcia) | Må produseres / kobles |
| `em_psy_laring_hukommelse` | Hukommelsesmodeller, gjenhenting og læringsforskning | Må produseres / kobles |
| `em_psy_livslop_overganger` | Livsløpsutvikling (Baltes); overgangsstudier | Må produseres / kobles |
| `em_psy_oppvekst_miljo` | Bronfenbrenners utviklingsøkologi | Må produseres / kobles |
| `em_psy_skole_motivasjon` | Selvbestemmelse; forventning–verdi og læringsmiljø | Må produseres / kobles |
| `em_psy_sosial_utvikling` | Sosial læring; utvikling av prososial atferd | V1: Sosial læring og mestringstro |
| `em_psy_tilknytning_relasjon` | Bowlby/Ainsworth; utviklingsstudier og begrensninger | V1: Tilknytningsteori |

### 4. Sosialpsykologi, normalitet og stigma — 8 emner

| Canonical emne-ID | Kandidat for teorikobling / empirisk ramme | Status i Psykoteori v1 |
|---|---|---|
| `em_psy_diagnose_hverdagsliv` | Merkingsprosesser, identitet og diagnosehistorie (kritisk linse) | Må produseres / kobles |
| `em_psy_ensomhet_tilhorighet` | Tilhørighetsmotivasjon; sosial støtte og nettverksforskning | Må produseres / kobles |
| `em_psy_fordommer_kategorisering` | Sosial kategorisering; intergruppeforskning | Må produseres / kobles |
| `em_psy_grupper_roller` | Sosial identitet; rolle- og gruppedynamikk | V1: Sosial identitetsteori |
| `em_psy_normalitet_avvik` | Sosiale normer; avviksdefinisjoner og kontekst | Må produseres / kobles |
| `em_psy_sosial_kontroll` | Normativ påvirkning, konformitet og makt | Må produseres / kobles |
| `em_psy_sosial_pavirkning` | Asch og konformitet; normativ versus informativ påvirkning | V1: Konformitet og sosial påvirkning |
| `em_psy_stigma_offentlighet` | Goffmans stigmaanalyse; strukturell stigmatisering | Må produseres / kobles |

### 5. Traume, krise, resiliens og omsorg — 7 emner

| Canonical emne-ID | Kandidat for teorikobling / empirisk ramme | Status i Psykoteori v1 |
|---|---|---|
| `em_psy_kollektiv_krise` | Kollektiv mestring, samfunnsressurser og kriserespons (empirisk) | Må produseres / kobles |
| `em_psy_resiliens_mestring` | Resiliens som utviklingsforløp og beskyttelsesfaktorer | V1: Resiliens og beskyttelsesfaktorer |
| `em_psy_risiko_beskyttelse` | Utviklingsøkologiske risiko- og beskyttelsesmodeller | Må produseres / kobles |
| `em_psy_sorg_tap` | Tosporsmodellen for sorg (Stroebe & Schut); variasjon over tid | Må produseres / kobles |
| `em_psy_traume_regulering` | Traumerelatert stress og reguleringsforskning; kliniske grenser | Må produseres / kobles |
| `em_psy_trygghet_tillit` | Tilknytning og sosial trygghet; miljø- og relasjonsfaktorer | Må produseres / kobles |
| `em_psy_vold_belastning` | Økologiske risiko-/beskyttelsesmodeller, ikke persondiagnostikk | Må produseres / kobles |

### 6. Psykisk helse, institusjoner og behandling — 12 emner

| Canonical emne-ID | Kandidat for teorikobling / empirisk ramme | Status i Psykoteori v1 |
|---|---|---|
| `em_psy_behandling_omsorg` | Evidensbasert praksis, omsorg og pasientmedvirkning | Må produseres / kobles |
| `em_psy_behandlingsformer` | Kognitiv atferdsterapi; relasjonelle tilnærminger og effektstudier | V1: Kognitiv terapi og kognitiv atferdsterapi |
| `em_psy_byrom_psykisk_helse` | Miljøpsykologi og byhelseforskning; kausalitet versus samvariasjon | Må produseres / kobles |
| `em_psy_institusjoner_psykiatri` | Psykiatrihistorie, institusjonsanalyse og rettigheter | Må produseres / kobles |
| `em_psy_krise_intervensjon` | Psykologisk førstehjelp som veiledet praksis, ikke universell teori | Må produseres / kobles |
| `em_psy_makt_omsorg` | Etikk, profesjonsmakt og rettighetsbaserte omsorgsmodeller | Må produseres / kobles |
| `em_psy_omsorg_system` | Systemperspektiver på tjenester, støtte og omsorg | Må produseres / kobles |
| `em_psy_pasientrolle_erfaring` | Recovery-orientert praksis og erfaringsperspektiver | Må produseres / kobles |
| `em_psy_psykisk_helse` | Biopsykososial modell; sosiale determinanter | V1: Biopsykososial modell |
| `em_psy_terapi_praksis` | Kognitiv terapi; behandlingsallianse og effekt/egnethet | Må produseres / kobles |
| `em_psy_terapirom_relasyon` | Rogers' relasjonsbetingelser; Bordins alliansemodell | Må produseres / kobles |
| `em_psy_velferd_psykisk_helse` | Sosiale determinanter og velferdssystem (empirisk/systemisk) | Må produseres / kobles |

**Summering:** 14 + 8 + 9 + 8 + 7 + 12 = **58** unike emner. **14** direkte koblet i det åpne V1-utkastet, **44** gjenstår å knytte fra teorilaget. Kategorier som gjelder rettigheter, tjenester, makt og institusjonshistorie får relevant forsknings-/systemperspektiv, ikke tvungne «personlighetsteorier».

## 6. Kontrollert produksjonsrekkefølge (en arbeidsoppgave av gangen)

### Trinn 0 — Stabiliser V1 og lås baseline

- Kontroller nyeste `main`, #6168 og diff før ytterligere produksjon.
- Kjør isolert `npm run test:psychology`, aktuell CI og mobil-/desktop-åpning; bevis årsak til hver feil. Skill ny regresjon fra eksisterende svikt i andre Civication-filer.
- Ferdigkriterium: V1 kan merges etter faktisk grønn relevant port uten å blande inn ubegrunnede endringer i History Go-kjernen eller Civication.

### Trinn 1 — Kildeaudit og dekning uten innholdsproduksjon

- Lag et **maskinlesbart dekningsregister** (foreslått `data/psychology/psychology_theory_coverage_v1.json`) som refererer canonical `emne_id`, faktisk teori-ID, `chapter_id`, kildestatus, claimstatus og redaksjonell status.
- Start med de 14 V1-kortene: kontroller hver faktapåstand mot eksisterende `claims.json`, emneartikler og teori-integritetsregister. Marker `verified`, `needs_source` eller `rework` på *påstandsnivå*.
- Finn overlapp: gjenbruk eksisterende gjennomarbeidet teori og kilde- og claimsporet tekst før en ny artikkel opprettes.
- Ferdigkriterium: 58 emner i dekningsregisteret (uten falsk «dekket»-status), alle 14 eksisterende kort gjennomgått, prioriterte gap rangert etter faglig betydning.

### Trinn 2 — Fagtradisjoner (14 emner)

- Fullfør definisjoner, metode og historisk kontekst; prioriter klassisk betinging, psykometri, emosjonsteori, selvbestemmelsesteori, nevropsykologiske modeller og vitenskapsteori.
- Behold skillet psykoanalysens historiske innflytelse vs empirisk bekreftelse og det dynamiske vs kognitive ubevisste.
- Ferdigkriterium: 14/14 får relevant, kildeankret perspektiv; alle tilhørende kort består redaksjonell kontrakt.

### Trinn 3 — Kognisjon, følelser og atferd (8 emner)

- Prioriter arbeidsminne, oppmerksomhet, persepsjon, beslutning, stress og emosjonsregulering. Sammenlign metoder og evidens, ikke bare teorinavn.
- Ferdigkriterium: 8/8 semantisk og kildemessig dekket; ingen formulering som gjør korrelasjon til årsak uten støtte.

### Trinn 4 — Utvikling, oppvekst og læring (9 emner)

- Prioriter Piaget, Vygotsky, Bronfenbrenner, Erikson, tilknytning, sosial læring og livsløpsforskning, med alder/kontekst og studienes begrensninger.
- Ferdigkriterium: 9/9 dekket; utviklingsmodeller framstilles ikke som skjebnebestemte stadier eller diagnosegrunnlag.

### Trinn 5 — Sosialpsykologi, normalitet og stigma (8 emner)

- Prioriter identitet, konformitet, fordommer, gruppedynamikk, tilhørighet og stigma. Skill sosialpsykologisk evidens fra normativ eller sosiologisk fortolkning.
- Ferdigkriterium: 8/8 dekket; ingen generalisering fra gruppefunn til konkrete personer.

### Trinn 6 — Traume, krise, resiliens og omsorg (7 emner)

- Prioriter risiko/beskyttelse, sorgteorier, resiliens og kollektive kriser; konsekvent varsom og dokumenterbar framstilling av vold og traume.
- Ferdigkriterium: 7/7 dekket; ingen obligatoriske sorgstadier, individuelle prediksjoner eller automatiserte terapeutiske anbefalinger.

### Trinn 7 — Psykisk helse, institusjoner og behandling (12 emner)

- Prioriter behandlingshistorie, terapi-modeller, allianse, system-/velferdsperspektiv, makt og rettigheter; velg praksisramme framfor fiktiv «teori» der det er riktig.
- Ferdigkriterium: 12/12 dekket; klinisk egnethet/effekt presenteres med forskningsbelegg, grenser og korrekt profesjonsansvar.

### Trinn 8 — Helhetlig integrasjon og sluttkontroll

- Konsolider like teorier, fjern overlapp, kvalitetsrevider 58/58 koblinger, kilde- og claimoppløsning og sammenligninger.
- Test teori → fenomen → teori, teori → kapittel/emne → tilbake, navigasjon/tastatur, små mobilskjermer, scroll og kontrast. Test både rene data og reell browser.
- Historiske personer/steder kobles bare når canonical relasjon er dokumentert; ny eller vesentlig revidert Place krever egen **PLACE_PRODUCTION_CHECKLIST**-preflight.
- Først deretter vurderes quiz- og progresjonsintegrasjon, under eksisterende quiz-/læringslogg-kontrakter. Korte teorikort skal ikke gi innsiktspoeng, behandlingseffekt eller kliniske profiler ved lesing.

**PR-strategi:** Trinn 0 og 1 hver i liten PR; trinn 2–7 per avgrensede faglige emnegrupper (typisk 3–6 dypt redigerte kort om gangen, ikke 58 genererte kort i ett sprang); trinn 8 separat. Beskytt fungerende runtime, bruk manifest/ID-koblinger, og gjennomfør source review før datamutering.

## 7. Permanent QA-port og statusregler

**Maskinell port** skal avvise: manglende/dupliserte teori-ID-er, ukjente `emne_id`/`chapter_id`, manglende faktisk dokumentert link, ugyldige claim-/source-ID-er, ødelagte toveislenker, kliniske resultatfelter i teoriobjekter, referanser til udokumenterte sted-/person-ID-er og generiske plassholdertekster. Den skal rapportere reell dekning **0–58** uten å telle tomme referanser.

**Redaksjonell port** skal kontrollere hver berørte tekst: teoretisk substans, presisjon i originalverk, riktige metode- og evidensgrenser, faktisk motteori, selvstendige eksempler, kilde–påstand-match, og tydelig skille mellom *dokumentert case* og *hypotetisk scenario*. Et fungerende schema kan ikke godkjenne vitenskapelig kvalitet alene.

**Teknisk port:** tester for `js/psychologyRoom.js`, kilde-/coverage-integritet, `fagverk.html`-deeplinks, regresjon av eksisterende tester/øvelser/refleksjons- og progresjonslagring, `npm run test:psychology`, relevant GitHub-CI på eksakt PR-head og faktisk mobil-/desktopbrowser. Ingen stille fallback som viser uriktige koblinger.

**Seksdimensjonal kvalitetsvurdering** iht. `AGENTS.md`: (1) korrekthet/evidens, (2) dekning, (3) faglig/redaksjonell kvalitet, (4) teknisk integritet, (5) sikkerhet/ansvarlighet, (6) vedlikeholdbarhet/etterprøvbarhet. Alle minst **4/5**, total minst **27/30**, ingen kritiske mangler og full kontroll av *samtlige* berørte kort. Scores skal ha bevis og stå i PR-/sluttrapport. Inntil dette er dokumentert: `planned` / `in_production` / `source_review`, ikke `complete`.

**Sluttdefinisjon:** 58/58 **faglig meningsfulle og kildeankrede** koblinger, alle teoriobjekter redaksjonelt validert, historisk og empirisk balanse, fungerende UI, browser-/mobile-QA og grønn relevant CI på eksakt SHA. Antall kort bestemmes av substans og overlapp, aldri som fast kvote.

## 8. Nærmeste konkrete arbeidsoppgave

**Første operative oppgave etter denne planen:** Gå tilbake til [PR #6168](https://github.com/Paradispartiet/History-Go/pull/6168), verifiser feilkilder mot nyeste `main`, sjekk at teorikortenes egne regresjoner består, og fullfør/sikre grunnutvidelsen uten sideeffekt i Civication. Deretter opprettes read-only 58-emners dekningsaudit før første nye teorikort produseres.
