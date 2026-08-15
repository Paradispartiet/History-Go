# History GO — Aktsomhetsvurdering v1

Status: **canonical**  
Eier: `history_go_due_diligence`  
Versjon: **1.0**  
Sist kontrollert: **2026-08-15**

## 1. Formål og avgrensning

Dette dokumentet identifiserer faktiske og potensielle negative konsekvenser knyttet til History GOs egen virksomhet, produkter, teknologier, leverandører og forretningspartnere. Vurderingen skal brukes som et internt styringsverktøy uavhengig av om virksomheten på et gitt tidspunkt er juridisk pliktsubjekt etter særskilt lovgivning.

Dokumentet skal ikke brukes til å påstå at en risiko er kontrollert når informasjon mangler. **Ukjent** er en legitim risikostatus.

Aktsomhetsarbeidet skal være risikobasert og omfatte:

1. forankring av ansvarlighet i styring og retningslinjer;
2. kartlegging og prioritering av negativ påvirkning og risiko;
3. tiltak for å forebygge, redusere eller stanse negativ påvirkning;
4. oppfølging av om tiltak virker;
5. kommunikasjon av relevant informasjon;
6. gjenoppretting eller bidrag til gjenoppretting når History GO har forårsaket eller bidratt til skade.

Etiske grunnregler eies av [`ETHICAL_GUIDELINES_V1.md`](./ETHICAL_GUIDELINES_V1.md).

## 2. Risikomodell

Risiko vurderes kvalitativt etter **sannsynlighet** og **konsekvens**:

- Lav
- Middels
- Høy
- Ukjent, når kunnskapsgrunnlaget ikke er godt nok

Prioritering skal ta hensyn til hvor alvorlig potensiell skade er for mennesker, samfunn og miljø, ikke bare økonomisk risiko for History GO. Høy alvorlighet kan derfor gi høy prioritet selv når sannsynligheten er lavere.

## 3. Prioritert risikoregister

| Område | Konkret risiko | Sannsynlighet | Konsekvens | Prioritet | Viktigste tiltak | Ansvar |
|---|---|---|---|---|---|---|
| AI-tjenester | Hallusinasjoner, falske kilder eller syntetiske detaljer publiseres som fakta | Høy | Høy | **Kritisk** | AI aldri som faktakilde; source verification; menneskelig review; factuality-gates | Innholdsansvarlig |
| AI-tjenester | Persondata, konfidensielle data eller materiale med uklare rettigheter sendes til ekstern modell | Middels | Høy | **Høy** | Dataklassifisering; input-regler; leverandørkontroll; behandlings- og avtalevurdering | Produkt-/teknisk ansvarlig |
| Persondata og lokasjon | Presis eller historisk lokasjon brukes til overvåkning, stalking eller kartlegging av bevegelser | Middels | Høy | **Kritisk** | Dataminimering; eksplisitt funksjonsbehov; ingen Social live-location; retention; DPIA-vurdering ved høy risiko | Produkt-/teknisk ansvarlig |
| Barn og unge | Lokasjon, sosial kontakt, profilering eller manipulerende design gir uforholdsmessig risiko for mindreårige | Middels | Høy | **Kritisk** | Child-safety review; begrense data og eksponering; block/report/moderering; høyere personverngate | Produktansvarlig |
| Bilder og opphavsrett | Materiale publiseres uten tilstrekkelig lisens, tillatelse eller annet rettighetsgrunnlag | Middels | Høy | **Høy** | Rettighetsmetadata; kilde/lisensregister; ingen «funnet på nettet»-regel; fjerningsrutine | Innholdsansvarlig |
| Personbilder | Portrett publiseres uten tilstrekkelig vurdering av rettigheter eller privatliv | Lav–middels | Høy | **Høy** | Identitet-, kilde-, lisens- og portrettkontroll | Innholdsansvarlig |
| Feilinformasjon | Historiske, biografiske, vitenskapelige eller stedlige feil påvirker læring eller skader personer/institusjoner | Middels | Høy | **Kritisk** | `FACTUALITY_CONTRACT`; claim→source-sporbarhet; korrigeringsrutine; sterkere review for sensitive claims | Innholdsansvarlig |
| Diskriminering og AI-bias | Algoritmer, innhold eller moderering gir systematisk skjev behandling | Middels | Høy | **Høy** | Test av risikoutsatt output; menneskelig kontroll; avviksvei; review av høy-risiko automatisering | Produktansvarlig |
| Tilgjengelighet | Produktdesign utestenger mennesker med funksjonsnedsettelser | Middels | Middels–høy | **Høy** | Tilgjengelighet i design- og QA-gates; alternativer til rent fysisk/visuelt innhold | Produktansvarlig |
| Skytjenester | Datasikkerhetsbrudd, uoversiktlige underleverandører, utilstrekkelig sletting eller driftsavhengighet | Middels | Høy | **Høy** | Leverandørkart; tilgangskontroll; backup; eksport/sletting; sikkerhetskrav; exit-plan | Produkt-/teknisk ansvarlig |
| Leverandørkjede | Dårlige arbeidsforhold eller menneskerettighetsbrudd hos teknologi-, data-, modererings-, maskinvare- eller andre leverandører | Ukjent | Høy | **Høy** | Kartlegg vesentlige leverandører; innhent dokumentasjon; prioriter etter alvorlighet og påvirkningsmulighet; følg opp avvik | Leverandøransvarlig |
| Korrupsjon og interessekonflikt | Sponsor, partner eller leverandør påvirker innhold, innkjøp eller rangering gjennom fordeler | Lav | Høy | **Middels–høy** | Gave-/antikorrupsjonsregel; dokumentere konflikter; sponsing merkes | Virksomhetsansvarlig |
| Miljø | Unødvendig AI-bruk, generering, lagring og datatrafikk øker energi- og ressursbruk | Middels | Middels | **Middels** | Effektive modeller/tjenester; caching; medieoptimalisering; sletting av duplikater; leverandørinformasjon | Produkt-/teknisk ansvarlig |
| Teknologileverandører | Kritisk lock-in eller leverandørsvikt gjør data utilgjengelig eller vanskelig å flytte | Middels | Middels–høy | **Middels–høy** | Åpne formater; eksport; dokumentert backup; exit-plan | Produkt-/teknisk ansvarlig |

## 4. Høyest prioriterte risikoområder

### 4.1 Lokasjon og persondata

History GO er et stedsbasert produkt. Lokasjon er derfor en innebygd risikofaktor selv når formålet med funksjonen er legitimt.

Mulig negativ påvirkning omfatter:

- avsløring av bosted, skole, arbeidssted eller rutiner;
- kartlegging av bevegelser;
- stalking eller uønsket kontakt;
- sosial profilering;
- utilsiktet eksponering av barn eller andre sårbare personer.

Eksisterende canonical grense i [`HG_SOCIAL_PRIVACY_RULES.md`](./HG_SOCIAL_PRIVACY_RULES.md): Social skal ikke bruke GPS/live location, nearby/distance-to-person, offentlig visit history, passive route traces eller inferred co-presence.

**Tiltak v1:**

- behold og håndhev denne grensen;
- kartlegg hvilke komponenter som faktisk behandler lokasjon;
- klassifiser dataflyt som `device-only`, `local`, `server`, `public` eller `third-party`;
- dokumenter formål og retention for serverlagrede persondata;
- vurder behovet for DPIA før nye behandlinger som sannsynligvis innebærer høy risiko;
- gjennomfør ny vurdering når behandlingens art, omfang, formål eller kontekst endres vesentlig.

### 4.2 AI og automatisert innholdsproduksjon

Mulig negativ påvirkning:

- oppdiktet innhold og falske kilder;
- diskriminerende eller stereotype framstillinger;
- lekkasje eller uønsket viderebruk av persondata;
- uklare rettigheter til input eller output;
- systematisk masseproduksjon av feil.

**Tiltak v1:**

- behold absolutt regel om at AI ikke er faktakilde;
- ingen direkte AI→production-publisering av faktainnhold uten source verification;
- begrens hvilke data som kan sendes til eksterne modeller;
- før leverandørregister over vesentlige AI-tjenester;
- vurder leverandørens lagring, bruk av kundedata, modelltrening og underleverandører når relevant;
- test automatiseringer med potensiell påvirkning på mennesker eller innhold for systematiske skjevheter og feil.

### 4.3 Barn og unge

Barn skal behandles som særskilt berørt gruppe når funksjoner omfatter lokasjon, sosiale forbindelser, meldinger/invitasjoner, profiler, betaling, personalisering eller offentlig aktivitet.

**Tiltak v1:**

Ingen ny funksjon som vesentlig øker sporing, profilering eller sosial eksponering av mindreårige skal lanseres uten eksplisitt child-safety- og personvernvurdering. Behovet for DPIA skal vurderes særskilt når behandlingen kan innebære høy risiko.

### 4.4 Faktisitet og feilinformasjon

History GO er et lærings- og kunnskapsprodukt. Feilinformasjon er derfor en kjernevirksomhetsrisiko.

Eksisterende canonical kontroll: [`FACTUALITY_CONTRACT.md`](./FACTUALITY_CONTRACT.md).

**Tiltak v1:**

- claim/source-sporbarhet skal brukes der lokale kontrakter krever eller datasettets risiko tilsier det;
- sensitivt innhold prioriteres for sterkere kilde- og formuleringreview;
- dokumenterte feil skal rettes i canonical data, ikke bare i visningen;
- samme feil skal søkes etter i andre objekter når den kan være systematisk;
- vesentlige korrigeringer dokumenteres i relevant PR/audit.

### 4.5 Bilder og rettigheter

Mulig negativ påvirkning:

- krenkelse av opphavsrett eller lisensvilkår;
- feil attribusjon;
- krenkelse av retten til eget bilde;
- feil identitet eller falsk historisk dokumentasjon.

**Tiltak v1:**

- behold og utvid eksisterende rights-/attribution-gates;
- publiser ikke materiale med uklar rettighetsstatus bare fordi det er teknisk tilgjengelig;
- vurder personbilder særskilt;
- bruk ikke genererte bilder som autentisk dokumentasjon eller autentiske portretter av virkelige personer;
- ha en rask korrigerings-/fjerningsvei ved dokumentert rettighetsbrudd.

### 4.6 Tilgjengelighet

Mulig negativ påvirkning:

- sentrale læringsfunksjoner blir utilgjengelige for brukere med syns-, motoriske, kognitive eller andre funksjonsnedsettelser;
- fysisk besøkslogikk skaper unødvendige barrierer for læring;
- informasjon formidles bare gjennom farge, bilde eller utilgjengelig interaksjon.

**Tiltak v1:**

- bygg tilgjengelighet inn i relevante design- og QA-gates;
- test sentrale brukerreiser med tastatur/alternativ navigasjon, zoom og relevante hjelpemidler;
- bruk tekstalternativer og semantisk struktur;
- tilby forholdsmessige alternativer når en fysisk handling ikke er nødvendig for selve læringsinnholdet.

### 4.7 Leverandørkjeden

Første leverandørkartlegging skal minst vurdere kategoriene:

- hosting og skytjenester;
- database og backend;
- AI- og modelltjenester;
- Git/repository/CI;
- kart og geodata;
- analyse og telemetri;
- e-post og varsling;
- bilde- og medietjenester;
- eventuelle betalingsleverandører;
- eksterne utviklere, moderatorer og andre oppdragstakere.

For hver vesentlig leverandør registreres så langt opplysningene er tilgjengelige og relevante:

1. tjeneste og leverandør;
2. hvorfor den brukes;
3. hvilke data leverandøren får;
4. kjente underleverandører;
5. datalokasjon;
6. sikkerhets- og personverndokumentasjon;
7. informasjon om menneskerettigheter og arbeidsforhold;
8. miljøinformasjon;
9. mulighet for eksport, sletting og exit;
10. uavklarte punkter og neste tiltak.

Manglende informasjon registreres uttrykkelig som ukjent.

## 5. Leverandørprioritering

History GO skal ikke forsøke å kontrollere alle leverandører like mye. Førsteprioritet er leverandører der kombinasjonen av følgende er størst:

- alvorlig potensiell skade;
- store datamengder;
- behandling av persondata eller lokasjon;
- barn eller andre sårbare grupper som berørte;
- AI eller automatiserte beslutninger;
- komplekse underleverandørkjeder;
- høy risiko for dårlige arbeidsforhold eller menneskerettighetsbrudd;
- stor teknisk avhengighet;
- svak åpenhet om praksis og leverandørkjede.

Aktsomhetsarbeidet skal være risikobasert fremfor et rent dokumentasjons- eller spørreskjemaritual.

## 6. Tiltaksplan v1

### P0 — grunnkontroller

- [ ] Opprette og vedlikeholde et register over vesentlige leverandører.
- [ ] Kartlegge behandlinger av lokasjon og persondata.
- [ ] Klassifisere dataflyt til AI- og skytjenester.
- [ ] Dokumentere virksomhetens image-rights-gate og fjerningsvei.
- [ ] Etablere child-safety gate for nye sosiale funksjoner som kan øke risiko for mindreårige.
- [ ] Utpeke ansvar for personvern, innhold og leverandøroppfølging.
- [ ] Dokumentere prosess for alvorlige innholds-, rettighets- og personvernavvik.

### P1 — operativ styring

- [ ] Gjennomgå vesentlige leverandører etter risikoprioritet.
- [ ] Dokumentere formål, retention og sletting for vesentlige serverlagrede persondata.
- [ ] Teste relevante AI-/algoritmefunksjoner for skjevhet og systematiske feil.
- [ ] Gjennomføre tilgjengelighetsaudit av sentrale brukerreiser.
- [ ] Kartlegge lisensstatus for aktive bilde- og mediekilder med høyest risiko.
- [ ] Ta gave-, antikorrupsjons- og interessekonfliktreglene inn i relevante avtale-/arbeidsrutiner.

### P2 — løpende forbedring

- [ ] Innhente relevant miljøinformasjon fra store digitale leverandører.
- [ ] Redusere unødvendig modell-, lagrings- og mediebruk.
- [ ] Gjennomgå leverandørkjeden minst årlig og ved vesentlige endringer.
- [ ] Oppdatere denne vurderingen når ny informasjon endrer risikobildet.

## 7. Oppfølging og indikatorer

Aktsomhetsarbeidet skal måle effekt, ikke bare dokumentproduksjon. Aktuelle indikatorer er:

- andel vesentlige leverandører som er vurdert;
- antall uavklarte leverandører med høy eller kritisk risiko;
- antall persondatabehandlinger uten dokumentert formål eller retention;
- antall AI-pipelines med brukerrettet faktainnhold uten dokumentert menneskelig/source review;
- andel risikoutsatte bilder med dokumentert rights-status;
- antall alvorlige faktisitetsavvik;
- tid fra dokumentert feil til canonical retting;
- antall åpne tilgjengelighetsavvik med høy alvorlighet;
- antall åpne child-safety-avvik;
- antall vesentlige leverandøravvik uten tiltaksplan.

Indikatorer skal ikke brukes til å skjule alvorlige enkelthendelser bak et godt gjennomsnitt.

## 8. Gjenoppretting og korrigering

Når History GO har forårsaket eller bidratt til skade, skal passende korrigering eller gjenoppretting vurderes. Dette kan omfatte:

- sletting av ulovlig eller unødvendig lagret data;
- korrigering av feil informasjon;
- fjerning av materiale uten tilstrekkelig rettighetsgrunnlag;
- kontakt med berørte personer eller rettighetshavere når relevant;
- sikkerhetstiltak;
- leverandøroppfølging eller avslutning;
- kompensasjon eller andre tiltak når dette er påkrevd;
- endring av produkt, policy eller prosess for å hindre gjentakelse.

## 9. Ansvar

- **Virksomhetsansvarlig:** eier den overordnede aktsomhetsprosessen og prioriterer alvorlige funn.
- **Produkt-/teknisk ansvarlig:** eier kartlegging av persondata, lokasjon, sikkerhet, skytjenester, AI-teknologi og teknisk leverandørrisiko.
- **Innholdsansvarlig:** eier faktisitet, kilder, bilder, opphavsrett og ansvarlig publisering.
- **Leverandøransvarlig:** eier leverandørregister, dokumentinnhenting, uavklarte leverandørforhold og oppfølging.

Samme person kan inneha flere roller i en liten virksomhet, men ansvarsområdene skal ikke forsvinne av den grunn.

## 10. Revisjon

Aktsomhetsvurderingen oppdateres:

- minst årlig;
- ved vesentlige nye leverandører;
- ved vesentlig endret AI-bruk;
- ved nye eller vesentlig endrede behandlinger av persondata eller lokasjon;
- før funksjoner med høy child-safety- eller sosial risiko lanseres;
- etter alvorlige hendelser;
- når ny informasjon vesentlig endrer vurderingen av en leverandør eller risiko.

Dato, hovedendringer og ansvarlig for revisjonen skal dokumenteres.

## 11. Normativt og faglig grunnlag

Denne v1-vurderingen er laget som et praktisk History GO-styringsverktøy og er ikke en juridisk konklusjon om hvilke særskilte rapporteringsplikter virksomheten omfattes av. Den bygger på eksisterende History GO-kontrakter og på risikobasert ansvarlighetsarbeid slik det beskrives av Innovasjon Norge og personvernmyndighetene.

Eksterne referanser:

- Innovasjon Norge, **Ansvarlig næringsliv**: https://kompetansesenter.innovasjonnorge.no/kurs/ansvarlig-naeringsliv
- Innovasjon Norge, krav og forventninger til ansvarlig næringsliv, OECD-retningslinjer og aktsomhetsvurderinger: https://www.innovasjonnorge.no/kontor-internasjonalt/internasjonal-satsing-og-eksport-til-tyskland
- Datatilsynet, **Når må man gjennomføre en vurdering av personvernkonsekvenser?**: https://www.datatilsynet.no/rettigheter-og-plikter/virksomhetenes-plikter/vurdering-av-personvernkonsekvenser/nar-ma-man-gjennomfore-en-vurdering-av-personvernkonsekvenser/
- Datatilsynet, **Risiko og risikovurdering**: https://www.datatilsynet.no/rettigheter-og-plikter/virksomhetenes-plikter/vurdering-av-personvernkonsekvenser/risikovurdering/
- Lovdata, åndsverkloven § 104 **Retten til eget bilde**: https://lovdata.no/lov/2018-06-15-40/§104
