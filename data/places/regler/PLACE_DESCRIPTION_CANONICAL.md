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

## 8. `desc`: en leksikalsk ingress

`desc` er ikke en komprimert innholdsfortegnelse. Den er stedets leksikalske ingress: en kort, sammenhengende åpning som gir leseren ett tydelig hovedpoeng og lyst til å lese videre.

Det finnes ingen hard ord- eller setningsgrense. Mange gode `desc` vil naturlig ligge rundt 35–90 ord og én til tre setninger, men flyt og stoffvalg er viktigere enn tallet.

### Styrende idé

Før skrivingen skal redaktøren kunne fullføre setningen:

> Det viktigste leseren skal forstå etter denne ingressen, er at …

Bare fakta som tjener denne styrende ideen, hører hjemme i `desc`. Resten skal utsettes til `popupDesc`.

### Anbefalt bevegelse

1. Første setning identifiserer stedet og etablerer hovedbetydningen eller den sentrale historiske bevegelsen.
2. Neste setning utdyper med ett konkret spenn, brudd eller særpreg.
3. En tredje setning brukes bare når den fullfører samme tanke; den skal ikke åpne en ny miniatyrartikkel.

Setningene skal normalt følge kjent–ny-prinsippet: begynn med stedet eller en allerede etablert idé, og legg ny eller viktig informasjon mot slutten.

### Ikke skriv en kronologisk inventarliste

Unngå:

- rekker av navn, årstall, bygg eller hendelser;
- konstruksjoner som «fra A via B og C til D» når hvert ledd introduserer et nytt tema;
- tre setninger som hver forsøker å oppsummere en ny epoke;
- mer informasjon enn syntaksen kan bære naturlig;
- abstrakte betydningsord uten et konkret stedlig hovedpoeng.

En ingress kan inneholde få fakta og likevel være presis. Faktatetthet må aldri forveksles med oppramsing.

### Redaksjonell test

Før godkjenning skal `desc` bestå disse spørsmålene:

- Kan hovedpoenget gjengis i én enkel setning?
- Henger setning 2 naturlig sammen med setning 1?
- Har hvert navn og hvert årstall en nødvendig funksjon i ingressens hovedidé?
- Kan en detalj flyttes til `popupDesc` uten at identiteten eller hovedpoenget går tapt? Da skal den normalt flyttes.
- Høres teksten ut som en åpning når den leses høyt, eller som stikkord presset inn i helsetninger?
- Lover ingressen en artikkel som `popupDesc` faktisk leverer?

Unngå også generiske åpninger som «Stedet viser hvordan …», «Stedet symboliserer …» og «Stedet gjør det mulig å forstå …».

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

## 9A. Fortellingen om stedet er den redaksjonelle hovedoppgaven

**Bindende fra 2026-10-21:** En stedsbeskrivelse skal ikke være en administrativ oversikt forkledd som historie. Den skal gi leseren en etterprøvbar og levende forståelse av **hva stedet var, hvem som handlet der, hva som skjedde, hva som stod på spill, hvordan det endret seg, og hvorfor de materielle sporene betyr noe**. Denne regelen gjelder både nye steder og enhver innholdsbolk som reviderer eksisterende tekster.

### Prioritering av stoff

1. **Begynn med stedets egen historie og særpreg:** en faktisk virksomhet, hendelse, konflikt, person, handling, oppfinnelse, levemåte eller endring. Skriv om konkrete mennesker og steder før overordnede kategorier.
2. **Fortell hendelsesforløp, ikke registerhistorie:** når kildene tillater det, vis hvem som gjorde hva, under hvilke vilkår, hvilke problemer eller valg som oppstod, og hva som fulgte. La det historiske forløpet gi artikkelen retning.
3. **Forklar hva stedet representerer gjennom handling og fakta:** industrihistorie kan handle om vannkraft, arbeid, fabrikker, eierskap og nye maskiner; et byrom kan handle om møteplasser, ferdsel, fortrengning, protest eller handel. Ikke nøye deg med abstrakter som «stedet representerer industriell transformasjon».
4. **Gi leseren noe å se for seg:** fysiske forhold, hvordan mennesker brukte bygningen/området, konkrete produkter, dokumenterte hendelser og spor som faktisk finnes eller har forsvunnet. Skill historisk miljø fra dagens utsikt.
5. **Sett bare inn årstall når de driver fortellingen:** viktige vendepunkter og nødvendige kronologiske skiller hører med; eierskifter, bygningsår, vedtaksår og restaureringsår som ikke gjør historien tydeligere, flyttes til kronologi/epoker eller utelates fra prosaen. Det finnes ingen kunstig dato- eller personkvote.
6. **Skriv vanlig, levende norsk sakprosa:** bruk aktive verb og konkrete substantiv. Forklar fagord bare der de hjelper leseren. Fjern tunge nominaliseringer og passiver som skjuler hvem som handlet.
7. **Vær historieforteller, ikke romanforfatter:** aldri dikt opp dialog, indre tanker, motiv, dramatikk, øyenvitneskildringer, årsaksforhold eller hendelser. En engasjerende tekst kan være helt sann; alle faktiske påstander er fortsatt underlagt claim-, kilde- og faktareview i seksjonene over.
8. **Utvikle et stedlig perspektiv:** teksten skal ikke kunne flyttes til et annet sted ved navnebytte. Når et sted har dokumenterte konflikter, menneskeskjebner eller særlige episoder, skal de vurderes foran lange rekker av tekniske og administrative fakta.

### Redaksjonell feilport – omskriv hvis disse problemene finnes

- Artikkelen er først og fremst en rekke årstall, eiere, adresser, vedtak, endrede navn eller bygningsfaser.
- Teksten er full av abstrakte formuleringer som «representerer», «utgjør», «fremstår som», «har betydning for», «brukes som inngang til», uten konkrete scener, handlinger eller virkninger.
- Det mangler en forståelig hovedfortelling, til tross for at kildene dokumenterer hendelser, mennesker, arbeid, kultur eller konflikt.
- De samme faktaene gjentas mellom `desc` og `popupDesc` i stedet for å bli utviklet.
- Språket høres ut som et internt notat, byråkratisk rapport, datamodell, planbeskrivelse eller quizproduksjon.
- Teksten er kildekorrekt, men lite interessant å lese; teknisk og faktuell PASS oppveier aldri en svak redaksjonell vurdering.

### Slik gjennomføres revisjon

- **Også eksisterende «ferdige» tekster skal vurderes redaksjonelt i nye produksjonsbolker.** Gjenbruk faktisk gode tekster, men ikke behold en svak tekst bare fordi kildepakken, schemaet eller en tidligere PR er godkjent. Dokumenter den konkrete svakheten; slik innholdsforbedring er reelt nytt arbeid etter tidligere-arbeid-gaten, ikke en anledning til å gjenta forskningen uten grunn.
- Les kildepakke, tekst og dokumenterte hendelser før omskriving. Velg én bærende fortelling for `desc` og en mer fullstendig, organisk fortelling for `popupDesc`. Ikke press begge inn i en kronologisk huskeliste.
- Gjør egen **fortellerkontroll**: Kan en leser etterpå gjenfortelle hva som faktisk skjedde her, hvem det gjaldt, og hvorfor stedet er særegent? Er det en konkret episode eller et tydelig dokumentert handlingsforløp når kildegrunnlaget gir rom for det? Vil leseren forstå stedet bedre ved å stå der?
- Mangler kildene et interessant hendelsesforløp, skriv en konsis, presis historie om det som faktisk er kjent. Ikke kompensér med oppdiktede scener eller generiske fortellinger.
- **Etter hver faktisk tekstendring:** oppdater claims og setning–claim-koblinger, tekstdigest/hash, separat fakta- og redaksjonell review, quiz-readiness og avledet runtime/oversettelser. Følg PR-isolasjonen i §16. Regler og stedstekster endres normalt i separate PR-er.

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
