# History GO — Etiske retningslinjer v1

Status: **canonical**  
Eier: `history_go_ethics_and_responsible_business`  
Versjon: **1.0**  
Sist kontrollert: **2026-08-15**

## 1. Formål

History GO skal utvikles, drives og publiseres på en måte som respekterer mennesker, kunnskap, personvern, rettigheter, samfunn og miljø. Retningslinjene gjelder produktutvikling, programvare, innholds- og dataproduksjon, bruk av kunstig intelligens, behandling av personopplysninger og lokasjon, bilder og andre verk, leverandører, samarbeidspartnere, innkjøp, markedsføring, ansatte, oppdragstakere og andre som handler på vegne av History GO.

Der en annen canonical History GO-kontrakt stiller strengere krav, gjelder den strengeste regelen.

## 2. Grunnprinsipper

1. **Mennesker foran vekst.** Brukervekst, inntekter, datamengde eller produksjonshastighet skal ikke prioriteres foran grunnleggende rettigheter og sikkerhet.
2. **Sannhet foran fylde.** Manglende informasjon er bedre enn oppdiktet eller uverifisert informasjon.
3. **Personvern som standard.** Vi skal samle inn minst mulig persondata og bare bruke data til tydelige, legitime og dokumenterte formål.
4. **Menneskelig ansvar.** Automatisering og AI kan bistå arbeidet, men kan ikke overta virksomhetens ansvar.
5. **Åpenhet.** Vesentlige interesser, kommersielle påvirkninger, AI-bruk og usikkerhet skal ikke skjules.
6. **Ikke-diskriminering.** Produkt, innhold, rangering, moderering og automatisering skal ikke usaklig forskjellsbehandle mennesker.
7. **Rettighetsrespekt.** Opphavsrett, kildekrav, personvern, portrettrettigheter, lisenser og avtalevilkår skal respekteres.
8. **Aktsomhet i leverandørkjeden.** Lav pris eller teknisk bekvemmelighet fritar ikke History GO fra å undersøke vesentlig risiko hos leverandører.
9. **Korrigerbarhet.** Feil og avvik skal kunne rapporteres, undersøkes og rettes.
10. **Forholdsmessighet.** Mer inngripende funksjoner krever sterkere begrunnelse, dokumentasjon og kontroll.

## 3. Personvern og persondata

History GO skal praktisere dataminimering. Personopplysninger skal ikke samles inn «i tilfelle de blir nyttige senere». Før en ny type persondata tas i bruk skal formål, nødvendighet, tilgang, lagringstid, sletting, deling og risiko vurderes.

Særlig gjelder:

- presis lokasjon skal bare brukes når den er nødvendig for en eksplisitt brukerfunksjon;
- passiv sporing skal ikke innføres som standard;
- Social skal følge [`HG_SOCIAL_PRIVACY_RULES.md`](./HG_SOCIAL_PRIVACY_RULES.md), herunder forbudet mot GPS/live location, nearby/distance-to-person og inferred co-presence;
- private besøksdata skal ikke gjøres offentlige uten et nytt eksplisitt formål, gyldig behandlingsgrunnlag og risikovurdering;
- tilgang til persondata skal begrenses til det som er nødvendig;
- lagring skal ha definert formål og livssyklus;
- sletting og korrigering skal være praktisk mulig;
- persondata skal ikke sendes til AI-, analyse- eller andre tredjepartstjenester uten at behandlingen og leverandøren er vurdert.

Når en planlagt behandling sannsynligvis kan medføre høy risiko for fysiske personers rettigheter og friheter, skal behovet for en vurdering av personvernkonsekvenser (DPIA) vurderes før behandlingen tas i bruk.

## 4. Kilder, opphavsrett og bilder

History GO skal skille mellom **retten til å lese en kilde** og **retten til å gjenbruke innholdet fra kilden**.

Canonical [`FACTUALITY_CONTRACT.md`](./FACTUALITY_CONTRACT.md) gjelder for faktapåstander. I tillegg gjelder:

- tekst fra kilder skal normalt formuleres selvstendig;
- direkte sitater brukes begrenset og med korrekt attribusjon;
- bilder, lyd, video og andre verk krever dokumentert rettighetsgrunnlag, lisens, tillatelse eller annet gyldig grunnlag;
- fotograf, rettighetshaver, kilde og lisens skal registreres når det er relevant;
- personbilder skal vurderes både med hensyn til opphavsrett og retten til eget bilde;
- innhold med uklar rettighetsstatus skal ikke publiseres bare fordi materialet finnes på internett;
- genererte bilder skal ikke presenteres som historisk dokumentasjon;
- genererte bilder skal ikke presenteres som autentiske portretter av virkelige personer.

Lokale bildekontrakter, blant annet [`PEOPLE_IMAGES.md`](./PEOPLE_IMAGES.md), kan stille strengere krav.

## 5. Bruk av kunstig intelligens

AI kan brukes som **verktøy**, men ikke som autoritet.

Følgende gjelder:

- en språkmodell er aldri en faktakilde;
- AI-genererte faktapåstander skal verifiseres mot inspectable kilder før publisering;
- AI-tekst skal ikke massepubliseres uten relevant kvalitetskontroll;
- AI skal ikke brukes til å konstruere manglende historiske fakta, sitater, relasjoner, koordinater eller biografiske opplysninger;
- sensitiv, privat eller konfidensiell informasjon skal ikke legges inn i eksterne AI-systemer uten dokumentert vurdering og godkjent behandlingsgrunnlag;
- modelloutput skal vurderes for skjevheter, diskriminering og systematiske feil når bruken kan påvirke mennesker eller brukerrettet innhold;
- mennesket eller rollen som godkjenner resultatet beholder ansvaret;
- vesentlig bruk av generativ AI i produksjonen skal kunne dokumenteres internt;
- AI-leverandører inngår i virksomhetens leverandør- og risikovurdering.

## 6. Ikke-diskriminering og mangfold

History GO skal ikke bruke design, innhold, rangering, moderering eller automatiserte systemer på måter som usaklig forskjellsbehandler mennesker.

Det innebærer blant annet:

- gjennomgang av AI- og algoritmeoutput for systematiske skjevheter når risikoen tilsier det;
- respektfull behandling av minoriteter, religioner, kulturer, kjønn, funksjonsvariasjoner og andre grupper;
- ikke å gjengi historiske fordommer som dagens sannheter;
- å skille mellom dokumentasjon av diskriminerende historie og egen diskriminerende framstilling;
- å unngå stereotype eller dehumaniserende framstillinger;
- å ha en vei for korrigering av dokumenterte feil.

Kontroversielle historiske, politiske og samfunnsmessige emner skal fortsatt kunne behandles faglig. Etikkreglene skal ikke brukes til å skjule dokumenterte konflikter eller ubehagelige fakta.

## 7. Korrupsjon, gaver og interessekonflikter

History GO aksepterer ikke bestikkelser, skjulte motytelser eller utilbørlig påvirkning.

Ingen som handler på vegne av History GO skal:

- motta betaling eller fordeler for å endre faktainnhold uten å opplyse om den kommersielle sammenhengen;
- la sponsorer kjøpe seg til historiske konklusjoner eller faglige vurderinger;
- tilby eller motta gaver med formål om å påvirke en beslutning;
- skjule økonomiske eller personlige interessekonflikter;
- favorisere en leverandør på grunn av private fordeler.

Små, alminnelige oppmerksomheter kan aksepteres når de åpenbart ikke påvirker en beslutning. Ved tvil skal gaven eller fordelen avvises eller dokumenteres og vurderes av virksomhetsansvarlig.

## 8. Leverandører og samarbeidspartnere

Leverandører skal ikke vurderes bare etter pris og funksjonalitet. For vesentlige leverandører skal History GO så langt det er forholdsmessig undersøke relevante forhold som:

- personvern og informasjonssikkerhet;
- databehandling, datalokasjon og underleverandører;
- mulighet for eksport og sletting av data;
- grunnleggende menneskerettigheter og anstendige arbeidsforhold;
- diskriminering og korrupsjonsrisiko;
- miljø- og ressursbelastning;
- bruk av AI og kundedata til modelltrening;
- opphavsrett og lisensvilkår;
- teknisk avhengighet og exit-mulighet.

Manglende informasjon skal registreres som **ukjent risiko**, ikke automatisk tolkes som lav risiko.

Detaljert risikoregister og tiltak eies av [`DUE_DILIGENCE_ASSESSMENT_V1.md`](./DUE_DILIGENCE_ASSESSMENT_V1.md).

## 9. Barn og unge

Barn og unge krever et høyere beskyttelsesnivå. History GO skal derfor:

- begrense innsamling av personopplysninger om mindreårige;
- unngå unødvendig presis lokasjon og sosial eksponering;
- ikke bruke manipulerende design for å presse barn til deling, kjøp eller langvarig bruk;
- gjøre sikkerhet og personvern forståelig for målgruppen;
- vurdere alder og modenhet når sosiale funksjoner utvikles;
- ikke profilere barn kommersielt uten en særskilt og dokumentert vurdering av lovlighet, nødvendighet og risiko;
- utforme rapportering, blokkering og moderering slik at barn ikke må eksponere mer informasjon enn nødvendig for å få hjelp;
- gjennomføre en ny child-safety- og personvernvurdering før funksjoner som kan koble mindreårige til ukjente personer aktiveres.

## 10. Tilgjengelighet

History GO skal søke å være brukbart også for mennesker med funksjonsnedsettelser. Tilgjengelighet skal inngå i produktarbeidet fra starten og omfatte blant annet:

- semantisk struktur og hensiktsmessig tastatur-/alternativ navigasjon;
- tekstalternativer til meningsbærende bilder;
- lesbar tekst og tydelige tilstander;
- informasjon som ikke er avhengig av bare farge;
- hensyn til zoom, skjermleser og ulike skjermstørrelser;
- alternative måter å få tilgang til sentralt læringsinnhold når en fysisk handling ikke er tilgjengelig for alle.

## 11. Ansvarlig innholdsproduksjon

History GO skal produsere kunnskapsinnhold med høy faglig integritet. [`FACTUALITY_CONTRACT.md`](./FACTUALITY_CONTRACT.md) gjelder fullt ut.

Produsenter skal i tillegg:

- skille mellom dokumentert fakta, kildebasert analyse og usikkerhet;
- representere kildeuenighet når den er relevant;
- ikke fylle inn kunnskap for å nå kvoter, readiness eller completeness;
- merke kommersielt eller sponset innhold tydelig;
- unngå sensasjonalisering på bekostning av sannhet;
- utvise særlig varsomhet med levende personer, barn, private forhold og alvorlige beskyldninger;
- rette dokumenterte feil i canonical source-data;
- dokumentere usikkerhet i stedet for å skjule den.

## 12. Miljø og digitale ressurser

Digitale tjenester har ressurs- og miljøkostnader. History GO skal derfor søke å:

- unngå unødvendige AI-kall og regenereringer;
- bruke en modell eller tjeneste som står i rimelig forhold til oppgaven;
- cache og gjenbruke beregninger der dette er forsvarlig;
- unngå unødvendig lagring av store filer og duplikater;
- optimalisere bilder og andre medier;
- redusere unødvendig datatrafikk;
- etterspørre relevant miljøinformasjon fra større teknologi- og skyleverandører.

Miljøhensyn skal ikke brukes som begrunnelse for å svekke sikkerhet, tilgjengelighet eller faglig kvalitet.

## 13. Varsling, avvik og korrigering

Mistanke om alvorlige brudd på disse retningslinjene skal kunne rapporteres. Ved bekreftet avvik skal History GO, avhengig av alvorlighetsgrad:

1. stoppe eller begrense den aktuelle aktiviteten;
2. sikre relevant dokumentasjon;
3. undersøke årsaken;
4. redusere skade;
5. rette data, produkt eller prosess;
6. kontakte berørte personer eller relevante parter når det er nødvendig;
7. følge opp leverandører eller samarbeidspartnere;
8. dokumentere læringspunkter;
9. forbedre kontrollene.

## 14. Ansvar og revisjon

Overordnet virksomhetsansvar kan ikke outsources. Følgende ansvarsområder skal være tydelige selv dersom samme person innehar flere roller:

- **Virksomhetsansvarlig:** overordnet etikk, prioritering, antikorrupsjon og interessekonflikter.
- **Produkt-/teknisk ansvarlig:** personvern, sikkerhet, tilgjengelighet og leverandørteknologi.
- **Innholdsansvarlig:** faktisitet, kilder, rettigheter og redaksjonelle vurderinger.
- **Leverandøransvarlig:** avtaler, leverandørkartlegging og oppfølging.

Retningslinjene gjennomgås minst årlig og ved vesentlige endringer i produktet, leverandørkjeden, AI-bruken eller risikobildet.

## 15. Normativt og faglig grunnlag

Denne policyen er utformet for å være i tråd med History GOs eksisterende canonical kontrakter og med forventningene til ansvarlig næringsliv som Innovasjon Norge beskriver for kunder og partnere. Den er ikke en juridisk konklusjon om hvilke særskilte lovplikter som gjelder virksomheten til enhver tid.

Eksterne referanser:

- Innovasjon Norge, **Ansvarlig næringsliv**: https://kompetansesenter.innovasjonnorge.no/kurs/ansvarlig-naeringsliv
- Innovasjon Norge, krav og forventninger om OECD-retningslinjer, menneskerettigheter, miljø og forebygging av korrupsjon: https://www.innovasjonnorge.no/kontor-internasjonalt/internasjonal-satsing-og-eksport-til-tyskland
- Datatilsynet, **Vurdering av personvernkonsekvenser (DPIA)**: https://www.datatilsynet.no/rettigheter-og-plikter/virksomhetenes-plikter/vurdering-av-personvernkonsekvenser/
- Lovdata, åndsverkloven § 104 **Retten til eget bilde**: https://lovdata.no/lov/2018-06-15-40/§104
