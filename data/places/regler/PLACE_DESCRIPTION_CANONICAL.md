# History Go – canonical regler for `desc` og `popupDesc`

Status: aktiv og bindende  
Versjon: 4.2.1 – claim-first produksjon, setningssporbarhet, stoffstyrt lengde og versjonert ferdigstatus  
Maskinlesbar kontrakt: `data/places/regler/place_description_templates_v1.json`  
Produksjonspakke-schema: `data/places/regler/place_description_production_v4_2.schema.json`

## 1. Hovedregel

`desc` og `popupDesc` er brukerrettet kunnskapsinnhold. De skal fortelle dokumenterte fakta om det konkrete stedet.

Arbeidsrekkefølgen er alltid:

> identitetsport → inspectable kilder → claims → faktareview → tekst → setning–claim-kobling → redaksjonell review → validator

Aldri:

> kategori eller læringsmål → ønsket budskap → konstruert tekst → kilder i etterkant

Ingen faktisk bestanddel kan innføres i `desc` eller `popupDesc` uten støtte i et godkjent claim. En språklig plausibel setning er ikke tilstrekkelig dokumentasjon.

## 2. Identitetsport før research

Før researchen starter, skal produksjonspakken definere objektet i én presis setning:

> Denne oppføringen representerer [bygningen / institusjonen / virksomheten / ruten / monumentet / området] i perioden [x], ikke [nærliggende eller tidligere objekter].

Identiteten skal ha status `resolved` før teksten kan få status `ready_v4_2`.

Porten skal skille mellom blant annet:

- bygning og institusjon;
- dagens virksomhet og historisk virksomhet;
- byggeår og etableringsår;
- område og enkeltbygning;
- forfatter og fiksjonsfigur;
- minnested og hendelsessted;
- historisk adresse og dagens publikumsadresse.

Identitetsdefinisjonen hører i produksjonsmaterialet, ikke i `popupDesc`.

## 3. Obligatorisk påstandsregister

Hvert nytt eller revidert sted skal ha en produksjonspakke i:

`data/places/production/<place_id>.json`

Pakken skal minst inneholde:

- `placeId` og `placeFile`;
- identitetsdefinisjon og identitetsstatus;
- produksjonsstatus;
- claims med stabile claim-ID-er;
- kilde-URL, kildeplassering, kildetype og kontrolldato;
- setning–claim-kobling for både `desc` og `popupDesc`;
- teksthash for teksten som ble faktakontrollert;
- separat faktareview og redaksjonell review;
- quiz-readiness;
- versjonert ferdigstatus.

Et claim skal beskrive én etterprøvbar påstand eller én tett sammenhengende faktakjerne. Claims som samler mange uavhengige fakta i én post, skal deles.

Bindende regel:

> Ingen setning kan godkjennes dersom alle faktiske bestanddeler ikke finnes i ett eller flere verifiserte claims.

`externalLinks` alene er ikke et påstandsregister.

## 4. Setning–påstand-paritet

Etter at teksten er skrevet, skal hver setning kobles til konkrete claim-ID-er.

En setning skal feile dersom:

- den mangler claim;
- claimet bare støtter deler av setningen;
- setningen legger til en årsak, vurdering, rangering eller sammenligning som ikke finnes i kilden;
- flere korrekte fakta kombineres til en ny, udokumentert konklusjon;
- claimet er uverifisert, avvist eller foreldet;
- teksthashen ikke lenger samsvarer med teksten i place-filen.

Setningskoblingen skal bruke setningsnummer og claim-ID-er. Teksthashen gjør at redaksjonelle endringer ikke kan passere på gamle koblinger.

## 5. Egen port for sterke påstander

Superlativer, enerpåstander, årsaksforklaringer og rangeringer krever eksplisitt kildebevis.

Ord og konstruksjoner som `første`, `eldste`, `største`, `eneste`, `viktigste`, `avgjørende`, `førte til`, `på grunn av`, `derfor` og `dermed` skal behandles som sterke påstander når de brukes faktuelt.

Det tilknyttede claimet skal være merket `claimKind: "strong"`, ha `evidenceMode: "explicit"` og minst to uavhengige inspectable kilder. Generell kontekst eller rimelig slutning er ikke nok.

## 6. Tidsstatus for nåtidsopplysninger

Påstander om dagens situasjon skal merkes med `temporalStatus: "current"` og ha en fersk `verifiedAt`. Planlagte forhold skal merkes `planned`.

Dette gjelder blant annet formuleringer som:

- i dag;
- nå;
- holder til;
- drives av;
- brukes som;
- er under bygging;
- skal åpne;
- planlegges;
- forventes ferdig.

Regler:

1. Planer skal omtales som planlagte, ikke som gjennomførte.
2. Forventet åpning eller ferdigstillelse skal ha kilde og kontrolldato.
3. Utdaterte fremtidsplaner skal flagges.
4. En historisk tekst skal ikke avsluttes med gammel «dagens bruk».
5. Nåtidsclaims eldre enn validatorens ferskhetsgrense skal kontrolleres på nytt.

## 7. Kildekvalitet per påstand og tidslag

Minimumskrav:

- minst én primær, offentlig eller institusjonell kilde for stedets grunnidentitet;
- minst én konkret kilde for hvert sentrale tidslag;
- to uavhengige kilder for omstridte, overraskende eller sterke påstander;
- direkte underside, dokument, katalogpost eller arkivpost når det finnes;
- kilden må støtte den konkrete påstanden, ikke bare omtale stedet;
- `sourceLocation` skal vise hvor i kilden støtten finnes.

En søkemotor-snutt, løs forside eller uinspiserbar referanse kan ikke alene gi status `verified`.

## 8. `desc`

`desc` er et konsentrert, faktabasert hovedsammendrag.

Veiledende målramme:

- ofte 40–80 ord;
- ofte 2–4 setninger;
- normalt minst fire konkrete fakta når kildegrunnlaget tillater det.

Dette er redaksjonell veiledning, ikke en hard ordport. `desc` skal være så kort som mulig uten å miste stedets identitet, viktigste tidslag og særpreg.

Unngå åpninger som «Stedet viser hvordan …», «Stedet symboliserer …» og «Stedet gjør det mulig å forstå …».

## 9. `popupDesc`: stoffstyrt stedartikkel

`popupDesc` er en fullverdig, selvstendig stedartikkel.

### Ingen hard ordgrense

Det finnes ingen fast nedre eller øvre ordgrense for `popupDesc`.

Rundt **300–1200 ord** er et redaksjonelt orienteringsrom for mange steder, ikke en ferdigport:

- en liten oppføring med begrenset, men godt dokumentert stoff kan være kortere;
- et historisk komplekst sted med mange kildebelagte tidslag kan og bør være lengre;
- et sted med rik historie skal ikke presses ned mot et standardmål;
- en lang tekst skal ikke forkortes bare for å passe et tall;
- en kort tekst skal ikke fylles ut bare for å nå et tall.

Bindende regel:

> Stofftilgang, stedets kompleksitet, identitetsavgrensningen og kvaliteten på inspectable kilder skal bestemme lengden.

Validatoren skal ikke godkjenne eller avvise en tekst på grunnlag av ordtall alene. Den skal kontrollere substans, claim-dekning, kildekvalitet, struktur, quiz-readiness, tidsstatus, metadata og tekstlikhet.

### Organisk struktur

Det finnes ingen fast seksavsnittsmal. Avsnittstallet skal bestemmes av stoffets naturlige struktur.

En tekst kan ha tre avsnitt når historien er konsentrert, fem når den følger tydelige tidslag, eller flere når stedet har mange dokumenterte funksjonsskifter. Minst tre avsnitt er fortsatt normal forventning for en fullverdig artikkel, men avsnittene må ha reell funksjon.

Teksten skal normalt:

- ha en klar åpning som identifiserer stedet;
- dekke de viktigste dokumenterte tidslagene;
- gi navn, datoer, handlinger, fysiske detaljer og bruk;
- prioritere eldre og nyere historie etter kildenes og stedets faktiske tyngde;
- inneholde vesentlig ny informasjon sammenlignet med `desc`;
- gi nok direkte fakta til normale quizspørsmål.

Lengden skal aldri oppnås gjennom gjentakelse, generell analyse, oppramsing uten sammenheng eller interne produksjonsforklaringer.

## 10. Stoffgrunnlaget overstyrer ordtall

Når kildene gir lite, skal teksten være kort og presis. Når kildene gir mye, skal den få nødvendig plass.

Produksjonen skal stoppes eller merkes når stoffet ikke kan dokumenteres, ikke når teksten avviker fra et veiledende ordintervall.

Tillatte produksjonsstatuser:

- `ready_v4_2`;
- `needs_research`;
- `source_conflict`;
- `identity_unresolved`;
- `blocked_insufficient_sources`;
- `metadata_correction_required`.

Bare `ready_v4_2` kan registreres som ferdig under standard 4.2.

## 11. To separate reviews

### Faktareview

Kontrollerer navn, datoer, tidsrom, roller, årsaker, konsekvenser, sitater, tall, nåtidsstatus, claim-dekning, kildekvalitet og metadata–tekst-konsistens.

Ingen språklig forbedring skal gjøres i denne fasen.

### Redaksjonell review

Kontrollerer flyt, gjentakelser, variasjon, klarhet, interesse, unødvendig fagspråk, kronologisk balanse og generiske åpninger og avslutninger.

Redaksjonell review skal også spørre:

- Har et rikt sted fått nok plass?
- Er eldre historie fortrengt av nyere hendelser uten kildegrunn?
- Er teksten lang fordi stoffet krever det, eller fordi den gjentar seg?
- Er teksten kort fordi kildene er begrensede, eller fordi researchen stoppet for tidlig?

Bindende regel:

> Den redaksjonelle passeringen kan ikke innføre nye fakta. Nye fakta krever nytt claim, ny faktakontroll og oppdatert setningsdekning.

## 12. Normal-quiz-test

En ferdig `popupDesc` skal gi minst åtte direkte faktaspørsmål med entydig fasit. Minst fem skal være helt normale kunnskapsspørsmål, og spørsmålene skal samlet dekke minst fire typer som hvem, når, hva, hvor, hvilket verk eller objekt, hva skjedde og hva ble bygget eller endret.

Quiz-readiness lagres i produksjonspakken og valideres før `ready_v4_2`.

## 13. Likhetskontroll mellom tekster

Batchporten skal kontrollere like åpninger, like avslutninger, gjenbrukte hele setninger, høy tekstlikhet og generiske avsnitt som kan flyttes mellom steder.

Ingen hel setning på mer enn åtte ord skal gjenbrukes mellom to stedsartikler, med mindre det er en nødvendig offisiell tittel, et egennavn eller en fast kildeformulering som er eksplisitt unntatt.

Ingen tekst skal kunne flyttes til et annet sted ved bare å bytte egennavnet.

## 14. Metadata–tekst-konsistens

Før merge skal teksten og produksjonspakken kontrolleres mot `name`, `year`, `period`, `category`, adresse, koordinatidentitet, `externalLinks`, virksomhetens status og place-type.

Dersom metadata er feil, skal status være `metadata_correction_required`. Riktig tekst kan ikke brukes til å skjule feil metadata.

## 15. Forbudt brukerrettet metatekst

Følgende hører aldri hjemme i `desc` eller `popupDesc`:

- hva History Go kan bruke stedet til;
- spillerinstruksjoner;
- kategori, quizvinkel eller pedagogisk funksjon;
- kartpunkt, områdeanker, markøridentitet eller representasjonslogikk;
- koordinatstatus, geometri, kildeinnhenting, validering eller auditstatus;
- canonical-ID-er og interne felt;
- begrunnelser for datasettavgrensning.

## 16. PR-isolasjon

En PR som endrer `desc` eller `popupDesc` skal:

- endre den tilhørende 4.2-produksjonspakken;
- ikke blande inn regelendringer;
- ikke blande inn koordinatendringer;
- ikke blande inn genererte indekser;
- bestå changed-description-porten mot låst base og head.

Regelendringer, UI-endringer, fagverk og stedsinnhold skal derfor normalt ligge i separate PR-er.

## 17. Ferdigdefinisjon

Et sted er `current` under 4.2 bare når:

- identiteten er løst;
- alle tekstsetninger er claim-dekket;
- alle claims er inspectable og verifiserte;
- teksthashene stemmer;
- tidsavhengige claims er ferske;
- faktareview og redaksjonell review er bestått;
- quiz-readiness er bestått;
- metadata-, likhets- og PR-scope-portene er grønne;
- `completedUnder` er `4.2` og `currentStatus` er `current`.

Ordtall er ikke en del av ferdigdefinisjonen.
