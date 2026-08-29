# History Go – kanonisk quizproduksjon

**Versjon:** 3.4

**Status:** eneste bindende produksjonsprosedyre for nye og reviderte quizer

**Filnavnregel:** versjonen står i dokumentet; denne filen skal ikke erstattes av nye `V4`-, patch- eller pseudokodefiler.

Denne filen bestemmer arbeidsrekkefølge, innholdsregler og kontrollrekkefølge. Kategoriens fagfiler leverer faglig innhold, men kan ikke opptre som konkurrerende produksjonsregler.

## 1. Autoritetsrekkefølge

1. `data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md`
2. `data/quiz/regler/QUIZ_NORMAL_OPENING_POLICY_V1.json`
3. `data/fag/fag_manifest.json`
4. filene manifestet krever for valgt kategori
5. `data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json`
6. `data/quiz/regler/QUIZ_PACKAGE_SCHEMA_V1.json`
7. stedets dokumenterte kilder

`data/quiz/regler/QUIZ_TEMPLATE_REGISTRY_V2.json` registrerer disse filene. Eldre README-filer, generatorregler, patcher og pseudokodefiler er bare arkiv eller pekerfiler.

## 2. Ufravikelig produksjonsrekkefølge

Quizproduksjon skal alltid gå denne veien:

> **kategori og mål → eksisterende quiz-audit → fagmanifest → full fagpakke → stedets kilder → påstandsbank → faglig utvalg → adaptiv profil og eksakt settantall → settplan → spørsmål → audits → Knowledge**

Konkret:

1. Fastslå `categoryId` og `targetId`.
2. Auditér all eksisterende quiz for mål-ID-en før profil eller settantall velges: aktive manifestoppføringer, canonical quizfil, legacy-/arkivfiler, dubletter, eksisterende sett, spørsmål og Knowledge-koblinger.
3. Les `data/fag/fag_manifest.json`.
4. Slå opp kategorien og målstedets `source_brief`, og last samtlige `required_inputs`.
5. Les stedskort, historier, relasjoner og de gjennomgåtte eksterne kildene i kildegrunnlaget.
6. Bygg og kontroller påstandsbanken før spørsmål skrives.
7. Vurder pensummoduler, emner, teorihooks, metoder, teoretikere og verk.
8. Registrer både hva som ble vurdert og hva som faktisk ble valgt.
9. Velg adaptiv profil og **ett eksakt settantall** fra kategoriens `supersetQUIZMAL`.
10. Lås de to første settene til sju normale spørsmål hver etter `QUIZ_NORMAL_OPENING_POLICY_V1.json`.
11. Lag relativ settplan for progresjonen fra sett 3 og videre.
12. Skriv spørsmål fra dokumenterte påstander og observasjoner.
13. Lagre `production_context` i quizpakken.
14. Kjør innholds-, kontekst-, progresjons- og teorikontroll.
15. Generer eller synkroniser Knowledge-koblinger.

Følgende omvendte løp er ikke tillatt:

> emneetikett → finn et sted → konstruer et spørsmål som demonstrerer emnet

## 3. Manifestet er eneste filresolver

Produksjonen skal aldri finne fagfiler ved manuell gjetting eller hardkodede kategoristier. Kategorioppføringen i `data/fag/fag_manifest.json` bestemmer hvilke filer som skal lastes. For aktive produksjonsmål peker `quizProduction.targets` dessuten til målstedets kildegrunnlag, kontekstarterfakt og quizfil.

For en kategori med aktiv `quizProduction` skal alle disse nøklene normalt være obligatoriske:

- `pensum`
- `emner`
- `fagkart`
- `methods`
- `supersetQuizMal`
- `quizStandard`
- `quizQuestionSchema`

Kontekstbyggeren skal stoppe dersom en obligatorisk nøkkel, fil eller gyldig JSON-struktur mangler. Den skal registrere filsti, størrelse og innholdshash, slik at «lest» betyr at hele filen faktisk ble lastet.

Målstedets `source_brief` ligger under `data/quiz/production_briefs/<kategori>/`. Den inneholder gjennomgåtte eksterne kilder, påstander og det eksplisitte faglige utvalget. Kildegrunnlaget er input til kontekstbyggeren; den ferdige quizen er output og skal derfor ikke brukes til å utlede sin egen plan.

Startkommando:

```bash
npm run quiz:context -- --category by --target deichman_bjorvika
```

Et varig arbeidsgrunnlag kan skrives med:

```bash
npm run quiz:context -- --category by --target deichman_bjorvika \
  --output data/quiz/production_context/by/deichman_bjorvika.json
```

## 4. Fagfilenes roller

Alle obligatoriske filer skal leses og vurderes. De har ulike roller:

- `pensum`: hva spilleren gradvis skal lære
- `emner`: hvilke faglige problemer og begreper stedet åpner for
- `fagkart`: hvilke teorihooks, teoretikere og verk som kan gi merverdi
- `methods`: hva spilleren må observere, sammenligne, kartlegge eller analysere
- `supersetQuizMal`: hvordan fagpakken brukes sammen for kategorien
- `quizStandard`: denne produksjonsprosedyren
- `quizQuestionSchema`: feltkontrakten for hvert spørsmål

Alle filene skal vurderes, men de skal ikke presses synlig inn i hver quiz. Et valg skal begrunnes med stedlig eller historisk relevans. Et ikke-valg skal kunne spores som vurdert, men utelatt.

## 5. Kilder og påstandsbank

Synlige faktapåstander skal primært bygge på:

1. primærkilder og offisielle institusjons- eller forvaltningskilder
2. lokale og historiske kilder
3. arkiver, museer, oppslagsverk og faglitteratur
4. verifiserbare observasjoner ved stedet
5. kvalitetssikret forskning og dokumentasjon

Interne fagfiler er styring og metadata, ikke faktakilder.

Påstandsbanken skal for hver enhet registrere:

- en konkret, etterprøvbar påstand eller observasjon
- hvor påstanden kommer fra
- hvilke eksterne kilder som støtter den
- om den kan brukes direkte, krever ny kildekontroll eller skal holdes tilbake
- hvilke spørsmål som eventuelt allerede bruker den

En URL som bare er samlet inn, er ikke det samme som en lest og verifisert kilde. Hver kilde i `source_brief` skal ha `review_status` og et kort `review_note`. Produsenten må åpne og kontrollere kilden før status settes til `reviewed`; kontekstbyggeren laster og validerer dette grunnlaget uten å være avhengig av ferdige spørsmål.

### 5.1 Produktfase og utsatt institusjonell evidenssyntese

`data/fag/FAGPRODUKSJON_CANONICAL.md` fastsetter gjeldende produktfase for fagproduksjon. Vanlig quizproduksjon skal fortsette med relevante, leste og sporbare kilder, presist språk og nødvendige sikkerhetsforbehold.

En egen systematisk evidenssyntese utført av History Go er ikke et generelt krav for hver vanlig fakta-, teori- eller metodepåstand. Påstandens styrke skal likevel aldri overstige det kontrollerte kildegrunnlaget.

Full systematisk evidenssyntese er en utsatt institusjonell forskningsfase. PRESS-review, betalte databasesøk, dobbelt screening, biasvurdering, syntese og sikkerhetsgradering kan ikke startes eller markeres som utført uten en eksplisitt prosjektbeslutning etter at appen har tilstrekkelig økonomi, databaseadgang og uavhengige menneskelige fagroller.

Forskningsinfrastruktur som allerede finnes skal bevares. Beredskap, schemas og låste søkestrategier er ikke det samme som gjennomført evidensarbeid eller publiseringsklare claims.

## 6. Adaptiv quizprofil

Kategoriens superset definerer profilene:

- `narrow`: 3 sett × 7 spørsmål
- `normal`: 4 sett × 7 spørsmål
- `rich`: 5–8 sett × 7 spørsmål
- `major`: 8–10 sett × 7 spørsmål

Profilen velges ut fra dokumentert stoffmengde og faglig bredde, ikke ut fra ønsket lengde. En quiz skal aldri fylles med svake spørsmål for å treffe en profil. Hvis kildematerialet ikke bærer planen, skal profilen reduseres.

### 6.1 Eksisterende quiz skal auditeres før profilvalg

En revisjon starter aldri fra null bare fordi den nye produksjonspakken skal skrives på nytt. Før profil og settantall låses, skal produksjonen dokumentere:

- hvilke aktive og arkiverte quizfiler som allerede finnes for `targetId`;
- hvor mange sett og spørsmål som allerede er aktive;
- hvilke eksisterende spørsmål/påstander som beholdes, omskrives, flyttes, slås sammen eller utelates;
- om samme mål finnes under flere kategorier, filnavn eller manifestoppføringer;
- hvilke Knowledge-enheter som allerede eies av eksisterende quiz.

Et `profile_hint`, en bestilling i et `source_brief` eller en tidligere kort quiz er bare input til vurderingen. Ingen av dem kan forhåndslåse profilen eller overskrive eksisterende quiz uten audit.

### 6.2 Profil og eksakt settantall er to forskjellige beslutninger

`narrow` og `normal` har faste antall: henholdsvis **3 × 7** og **4 × 7**. `rich` og `major` er intervaller, men en produksjon kan ikke lagre bare intervallet. Den skal velge og begrunne ett eksakt `set_count`:

| Profil | Tillatt settantall | Bruk |
| --- | ---: | --- |
| `narrow` | 3 | Avgrenset mål med få uavhengige, sterke påstander. |
| `normal` | 4 | Solid hovedhistorie og minst ett tydelig faglig broledd. |
| `rich` | 5–8 | Flere kildebelagte perioder, miljøer, personer, funksjoner, konfliktlinjer eller faglige spor. |
| `major` | 8–10 | Hovedsted med bred dokumentasjon som bærer flere selvstendige progresjonsløp. |

For `rich` og `major` skal hvert planlagte sett ha en egen læringsjobb og en tilstrekkelig, ikke-duplisert påstandsbank. Det eksakte antallet er antallet slike kildebårne settplaner innenfor profilintervallet.

- Velg ikke nedre grense av bekvemmelighet når materialet bærer flere selvstendige sett.
- Velg ikke øvre grense ved å splitte samme fortelling, hendelse eller påstand kunstig.
- Et `major`-sted skal ha **10 × 7** når kildene bærer ti reelt forskjellige settplaner, inkludert selvstendig konflikt-/historiefordypning og avsluttende syntese/sammenligning.
- Hvis et `major`-sted stoppes på 8 eller 9 sett, skal `production_context` navngi hvilke mulige ekstra spor som ble vurdert og hvorfor de ikke bar et selvstendig sett.

Profilbegrunnelsen skal vise bredden i materialet, ikke bare oppgi etiketten. Et omfattende institusjons-, bygnings- eller historiekompleks kan ikke klassifiseres som `narrow` uten en eksplisitt evidensbasert forklaring på hvorfor de dokumenterte periodene, personene, byggene, hendelsene, konfliktene og funksjonene likevel ikke bærer flere sett.

Alle profiler med minst to sett følger den samme absolutte åpningen: sett 1 og sett 2 skal hver ha sju normale, direkte og kildebelagte quizspørsmål. Kategoriens profil kan skjerpe denne regelen, for eksempel ved å utsette teori til sett 4, men kan aldri redusere de fjorten normale åpningsspørsmålene.

## 7. Absolutt normalåpning og relativ videre progresjon

`QUIZ_NORMAL_OPENING_POLICY_V1.json` er en global invariant for alle aktive quizmål med minst to sett:

- **sett 1:** sju normale spørsmål om sted, person, institusjon, funksjon, verk, art, hendelse eller andre direkte fakta
- **sett 2:** sju normale spørsmål om historie, personer, bruk, endring, årsak, sammenheng, observasjon eller konkret sammenligning
- spørsmålene skal kunne forstås uten kjennskap til fagplan, metode, hook, teoretiker eller produksjonsmodell
- eksplisitt metode-, begreps- og teoribinding kan ikke drive de første fjorten spørsmålene
- faglige klassifikasjonsfelt som `emne_id`, `core_concepts` og `concept_focus` kan ligge bak et normalt spørsmål, men må ikke gjøre spørsmålsflaten akademisk

Fra sett 3 er progresjonen relativ til quizens totale lengde:

- **brodel:** årsak, sammenheng, metode og første fagbegreper
- **sluttdel:** emner, teori, teoretikere, verk, sammenligning og syntese

En quiz med tre sett kan nå fag- og teorilaget i sett 3. En kategori kan kreve senere teoristart, men aldri tidligere enn sett 3. Den globale 2 × 7-åpningen går foran kategoriens relative faseplan.

### 7.1 Svarrekkefølge og posisjonsbias — obligatorisk shuffle

Lagret `answerIndex` dokumenterer hvilket alternativ som er korrekt i canonical data. Det er **ikke** en instruks om hvor det riktige svaret skal vises.

- Quizruntime skal lage en ny kopi av svaralternativene og shuffle dem for hvert vist spørsmål i hvert quizforsøk.
- Når alternativene shuffles, skal korrekt indeks remappes til den nye visningsrekkefølgen før brukerens valg vurderes.
- Runtime skal aldri mutere `options`, `choices`, `answer` eller `answerIndex` i canonical quizdata.
- Nye og reviderte quizfiler skal fordele lagrede korrekt-svar-posisjoner og kan ikke legge alle eller nesten alle riktige svar i samme slot. Første alternativ skal spesielt aldri brukes som systematisk fasitposisjon.
- Det er tillatt at et enkelt spørsmål tilfeldig får samme visningsposisjon som i kildefilen etter shuffle. Kravet gjelder reell randomisering, ikke at én bestemt posisjon forbys.
- Å flytte alle riktige svar til en annen fast posisjon er ikke en løsning; både produksjonsdata og runtime skal være fri for systematisk posisjonsmønster.

CI skal stoppe nye eller endrede quizfiler med fast eller ekstremt konsentrert lagret fasitposisjon, i tillegg til å kontrollere at korrekt indeks faktisk peker på `answer` når begge feltene finnes.

## 8. Innholdsbalanse

For en quizpakke med minst ti spørsmål er normalområdet:

- **50–60 % konkrete fakta**
- **20–30 % årsak, utvikling og sammenheng**
- **15–25 % emne-, metode-, teori- og begrepsspørsmål**

Dette er et kvalitetsområde, ikke en grunn til å dikte eller gjenta stoff. En liten eller svært konkret quiz kan avvike når `production_context` forklarer hvorfor. Den globale 2 × 7-åpningen har alltid forrang: en quiz med tre sett vil nødvendigvis være mer faktatung enn normalområdet, og skal ikke presses inn i prosentmålet med oppkonstruerte spørsmål.

### Konkrete fakta

Spør om personer, år, perioder, verk, bygninger, hendelser, funksjoner, materialer, teknikker, arter, resultater og synlige spor.

### Årsak, utvikling og sammenheng

Spør hvorfor noe ble bygd, flyttet, endret, bevart eller revet, hva det førte til, og hvordan dokumenterte forhold henger sammen.

### Emne, metode, teori og begrep

Spørsmålet skal lære et faglig redskap som faktisk gjør den konkrete situasjonen tydeligere. Det skal ikke teste om spilleren gjenkjenner hvilket alternativ som høres mest akademisk ut.

## 8.1 Faglig bevaringsregel

En revisjon skal ikke gjøre quizen faglig flatere. Før spørsmål flyttes, forkortes eller omskrives, skal produsenten kartlegge hvilke dokumenterte fakta, metoder, begreper og forklaringer de bærer.

Et relevant faglig poeng kan bevares i:

- et konkret spørsmål
- `knowledge`
- `emne_id` eller `related_emner`
- `core_concepts` eller `concept_focus`
- `method_id` eller en gyldig teoribinding
- Knowledge eller et annet fordypningslag

Det som tas bort, skal være overflødig, svakt dokumentert eller bevart et annet sted. «Enklere språk» betyr ikke at presise faguttrykk skal slettes når de faktisk lærer spilleren noe.

## 9. Teoribinding

Et teoribærende spørsmål skal ha:

- konkret `claim_basis`
- gyldig `emne_id`
- gyldig `topic_hook_id`
- gyldig `thinker_id` eller `work`
- stedlig eller historisk anker i `source`
- `theory_ref.why_it_helps`, som forklarer hvilken merverdi teorien gir

God rekkefølge:

> dokumentert detalj → faglig problem → teori som skjerper forståelsen

Teori kan tidligst introduseres i sett 3. Kategoriens profil kan utsette teoristarten ytterligere, men kan ikke flytte teori eller eksplisitt metode inn i de første fjorten spørsmålene.

Blokkerte overflater:

- «Hvilken teoretiker passer best?»
- «Hvilken teori beskriver stedet best?»
- «Hvordan kan stedet leses som …?»
- «Hvorfor passer stedet til emnet …?»
- spørsmål som omtaler fagplan, fagkart, mapping, hook eller generator

## 10. Spørsmål og svaralternativer

Bruk naturlige åpninger som «Hvem», «Når», «Hva», «Hvor», «Hvilken», «Hvorfor» og «Hvordan» når stoffet krever det.

I sett 1 og sett 2 skal spørsmålene oppleves som vanlig quiz. Direkte observasjoner, konkrete sammenligninger og enkle hvorfor-/hvordan-spørsmål er tillatt når svaret følger av dokumenterte opplysninger. Formuleringer som «Hvordan kan stedet leses som …?», «Hva er den mest presise faglige lesningen …?», «Hvilket begrep beskriver best …?», «Hvilken mekanisme forklarer best …?» og «Hvilken teoretiker …?» er forbudt i åpningsblokken.

Svaralternativene skal:

- være plausible og sammenlignbare
- ligge på omtrent samme faglige og språklige nivå
- ikke avsløre fasiten gjennom lengde eller presisjon
- ikke bruke åpenbare umuligheter som standarddistraktorer

`knowledge` skal forklare videre og ikke bare gjenta svaret.

## 11. Pakkemetadata

Alle nyproduserte eller fullt reviderte quizpakker skal følge `QUIZ_PACKAGE_SCHEMA_V1.json` og ha en `production_context` som minst lagrer:

- manifestkategori og profil
- versjonen av denne prosedyren
- sti til målstedets kildegrunnlag
- alle resolverte fagfiler
- alle obligatoriske filer som ble lastet
- valgte pensummoduler, emner, hooks, metoder, teoretikere og verk
- sti til det genererte kontekstdokumentet
- status for kildegjennomgang
- eksisterende quiz-audit med behold/omskriv/flytt/fjern-beslutning
- valgt eksakt `set_count` og evidensbasert profilbegrunnelse
- kandidatspor som ble holdt tilbake ved valg under profilens øvre grense

Metadata skal beskrive den faktiske produksjonen. Det er ikke tillatt å fylle inn filer eller fagvalg som ikke ble brukt.

## 12. Kontrollrekkefølge

Kjør minst:

```bash
npm run audit:quiz-content
npm run audit:quiz-templates
npm run audit:quiz-production-context
npm run audit:quiz-progression
npm run audit:quiz-theory-binding
npm run test:quiz-content-audit
```

Kontrollene skal verifisere:

1. at manifestet resolver hele fagpakken
2. at lagrede ID-er finnes i de resolverte fagfilene
3. at sett 1 og sett 2 har nøyaktig sju normale spørsmål hver
4. at åpningsspørsmålene har kilder, gyldig svar og plausible svaralternativer
5. at eksisterende quiz er auditert, og at valgt profil, eksakt settantall og videre settprogresjon stemmer
6. at teorispørsmål er bundet til påstand, emne, hook og teori
7. at spørsmålene følger innholdsbalanse, språk- og kildereglene

## 13. Eldre regler

Eldre standarder, set-maler, generatorregler, patcher og pseudokodefiler kan beholdes for historikk, men de skal:

- være merket som erstattet eller være rene pekerfiler
- peke til denne filen
- ikke definere egen produksjonsrekkefølge eller balanse
- aldri registreres som autoritet i manifestet

Endringer i produksjonsprosedyren gjøres her og får nytt versjonsnummer inne i dokumentet.
