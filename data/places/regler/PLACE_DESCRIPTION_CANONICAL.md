# History Go – canonical regler for `desc` og `popupDesc`

Status: aktiv og bindende  
Versjon: 4.2 – claim-first produksjon, setningssporbarhet og versjonert ferdigstatus  
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

Følgende ord og konstruksjoner skal behandles som sterke påstander når de brukes faktuelt:

- første;
- eldste;
- største;
- minste;
- eneste;
- viktigste;
- ledende;
- særlig kjent for;
- avgjørende;
- førte til;
- på grunn av;
- derfor;
- dermed;
- revolusjonerte;
- endret for alltid.

Det tilknyttede claimet skal være merket som en sterk påstand og ha `evidenceMode: "explicit"`. Generell kontekst, rimelig slutning eller flere indirekte kilder er ikke nok.

## 6. Tidsstatus for nåtidsopplysninger

Påstander om dagens situasjon skal merkes med `temporalStatus: "current"` og ha en fersk `verifiedAt`.

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
- direkte underside, dokument, katalogpost eller arkivpost når det finnes, ikke bare en generell forside;
- kilden må støtte den konkrete påstanden, ikke bare omtale stedet;
- `sourceLocation` skal vise hvor i kilden støtten finnes.

Tillatte kildetyper og krav er definert maskinelt. En søkemotor-snutt, løs forside eller uinspiserbar referanse kan ikke alene gi status `verified`.

## 8. `desc`

`desc` er et konsentrert, faktabasert hovedsammendrag.

Normal målramme:

- 40–80 ord;
- normalt 2–4 setninger;
- normalt minst fire konkrete fakta når kildegrunnlaget tillater det.

`desc` bør vanligvis fortelle hva stedet er, når det ble etablert eller tatt i bruk, hvem eller hva som er sentralt, og hva som skjedde eller gjør stedet særpreget.

Unngå åpninger som:

- «Stedet viser hvordan …»;
- «Stedet symboliserer …»;
- «Stedet knytter … sammen»;
- «Stedet gjør det mulig å forstå …»;
- «Stedet spiller en viktig rolle i …».

## 9. `popupDesc`: organisk struktur, ikke seksavsnittsmal

`popupDesc` er en fullverdig, selvstendig stedartikkel.

Normal ramme:

- minst 300 ord når kildene faktisk gir nok stoff;
- normalt 300–600 ord;
- minst tre avsnitt;
- normalt 12–30 setninger;
- normalt minst tolv konkrete fakta;
- minst to tredeler av opplysningene skal være nye sammenlignet med `desc`.

Det finnes ingen fast seksavsnittsmal.

Avsnittstallet skal bestemmes av stoffets naturlige struktur. En tekst kan ha tre avsnitt når historien er konsentrert, fem når den følger tydelige tidslag, eller sju når stedet har mange dokumenterte funksjonsskifter.

Lengden skal aldri oppnås gjennom gjentakelse, generell analyse, oppramsing uten sammenheng eller interne produksjonsforklaringer.

## 10. Ordtall overstyrer aldri faktagrunnlaget

Dersom inspectable kilder ikke gir nok stoff til 300 gode ord, skal stedet ikke fylles ut for å nå minimumslengden.

Bruk en av disse produksjonsstatusene:

- `ready_v4_2`;
- `needs_research`;
- `source_conflict`;
- `identity_unresolved`;
- `blocked_insufficient_sources`;
- `metadata_correction_required`.

Bare `ready_v4_2` kan registreres som ferdig under standard 4.2.

## 11. To separate reviews

### Faktareview

Kontrollerer bare:

- navn;
- datoer og tidsrom;
- roller;
- årsaker og konsekvenser;
- sitater;
- tall og mål;
- nåtidsstatus;
- claim-dekning;
- kildekvalitet;
- metadata–tekst-konsistens.

Ingen språklig forbedring skal gjøres i denne fasen.

### Redaksjonell review

Kontrollerer:

- flyt;
- gjentakelser;
- variasjon;
- klarhet;
- interesse;
- unødvendig fagspråk;
- generiske åpninger og avslutninger.

Bindende regel:

> Den redaksjonelle passeringen kan ikke innføre nye fakta. Nye fakta krever nytt claim, ny faktakontroll og oppdatert setningsdekning.

## 12. Normal-quiz-test

En ferdig `popupDesc` skal gi minst åtte direkte faktaspørsmål med entydig fasit.

Spørsmålene skal samlet dekke minst fire av disse typene:

- hvem;
- når;
- hva;
- hvor;
- hvilket verk eller objekt;
- hva skjedde;
- hva ble bygget, produsert eller endret.

Minst fem spørsmål skal være helt normale kunnskapsspørsmål, ikke analyse-, metode- eller begrepsspørsmål.

Quiz-readiness lagres i produksjonspakken og valideres før `ready_v4_2`.

## 13. Likhetskontroll mellom tekster

Batchporten skal kontrollere:

- like åpninger;
- like avslutninger;
- gjenbrukte hele setninger;
- høy tekstlikhet mellom steder;
- generiske avsnitt som kan flyttes mellom steder.

Ingen hel setning på mer enn åtte ord skal gjenbrukes mellom to stedsartikler, med mindre det er en nødvendig offisiell tittel, et egennavn eller en fast kildeformulering som er eksplisitt unntatt.

Ingen tekst skal kunne flyttes til et annet sted ved bare å bytte egennavnet.

## 14. Metadata–tekst-konsistens

Før merge skal teksten og produksjonspakken kontrolleres mot:

- `name`;
- `year`;
- `period`;
- `category`;
- adresse;
- koordinatidentitet;
- `externalLinks`;
- virksomhetens status;
- place-type.

Dersom metadata er feil, skal status være `metadata_correction_required`. Tekstproduksjonen skal stoppe til rettingen er eksplisitt utført.

Riktig tekst kan ikke brukes til å skjule feil metadata i samme objekt.

## 15. Forbudt brukerrettet metatekst

Følgende hører aldri hjemme i `desc` eller `popupDesc`:

- «History Go kan bruke stedet til …»;
- «I History Go …»;
- spillerinstruksjoner som «Se hvordan …» eller «Husk at …»;
- hva spilleren skal, bør eller kan forstå;
- kategori, quizvinkel eller pedagogisk funksjon;
- kartpunkt, områdeanker, markøridentitet eller representasjonslogikk;
- koordinatstatus, geometri, kildeinnhenting, validering eller auditstatus;
- canonical-ID-er, interne felt eller produsentinstruksjoner;
- begrunnelser for hvorfor ett datasettobjekt holdes adskilt fra et annet.

Slike opplysninger skal ligge i produksjonspakken, koordinatdokumentasjonen eller andre interne felt.

## 16. Innhold før analyse

Prioriter:

- egennavn;
- årstall og tydelige tidsrom;
- hendelser og handlinger;
- bygninger, verk, produkter, arter og gjenstander;
- materialer, mål og tekniske løsninger;
- konkrete funksjoner og bruk;
- endringer, konflikter og resultater;
- overraskende, dokumenterte detaljer.

Abstrakte ord som «betydning», «spenning», «rolle», «identitet», «åpenhet», «sikkerhet», «transformasjon» og «samfunn» er ikke fakta alene.

Underholdning skal komme fra virkeligheten og kildene, ikke oppdiktet dialog, tanker, publikumsreaksjoner, vær, lyder eller stemning.

## 17. PR-isolasjon og indeksvern

En stedsbeskrivelses-PR skal ikke inneholde urelaterte koordinat-, metadata-, regel- eller indeksendringer.

Bindende porter:

1. Regelendringer og stedsinnhold skal normalt ligge i separate PR-er.
2. Beskrivelsesendringer og koordinatendringer skal ikke blandes.
3. En generert indeks skal bare endres når en canonical kildefil i samme PR krever det.
4. Dersom regenerering endrer andre steder, skal PR-en stoppe.
5. En endret `desc` eller `popupDesc` skal ha en endret 4.2-produksjonspakke for samme `place_id`.
6. En produksjonspakke må peke på den faktiske canonical place-filen.

CI-porten bruker git-diffen til å håndheve dette for nye og reviderte beskrivelser.

## 18. Versjonert ferdigstatus

«Ferdig» er alltid knyttet til en standardversjon.

En 4.2-registrering skal minst lagre:

- `completedUnder: "4.2"`;
- `currentStatus: "current"`;
- `sourceVerifiedAt`;
- antall verifiserte claims;
- `factualReview: "passed"`;
- `editorialReview: "passed"`;
- `validatorVersion`.

Steder som tidligere var ferdige under 4.0 eller 4.1, skal ikke automatisk regnes som 4.2-ferdige. De får:

- `completedUnder: "4.0"` eller `"4.1"`;
- `currentStatus: "requires_4_2_review"`.

## 19. Ferdigkriterium under 4.2

Et sted er ferdig når:

1. identiteten er løst;
2. metadata er konsistente;
3. alle faktiske bestanddeler finnes i verifiserte claims;
4. hver setning er koblet til claims;
5. teksthashen samsvarer med kontrollert tekst;
6. sterke og tidsavhengige påstander har særskilt bevis;
7. `desc` er konsentrert og faktabasert;
8. `popupDesc` er rik uten fylltekst;
9. faktareview er bestått;
10. redaksjonell review er bestått uten nye fakta;
11. normal-quiz-testen er bestått;
12. likhetskontrollen er bestått;
13. PR-scope og indeksvern er bestått;
14. ferdigstatusen er registrert som `completedUnder: "4.2"`;
15. 4.2-validatoren passerer uten feil.

## 20. Migrering

Den eldre globale auditten kan fortsatt brukes til å finne korte, generiske eller manglende tekster. Den avgjør ikke 4.2-ferdigstatus.

4.2 innføres fremoverrettet:

- nye beskrivelser må følge 4.2;
- reviderte beskrivelser må følge 4.2;
- eldre ferdige steder beholder historisk status, men markeres `requires_4_2_review`;
- utilstrekkelig dokumentasjon gir blokkert status, ikke fylltekst.
