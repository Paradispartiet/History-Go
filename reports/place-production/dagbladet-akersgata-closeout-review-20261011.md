# Dagbladet – Akersgata 49: sluttføring og publikasjonseierskap

Dato: 2026-10-11. Branch `production/dagbladet-akersgata-20261010`, PR [#6211](https://github.com/Paradispartiet/History-Go/pull/6211), base `c19467307501d99f5237eab0d561e2a1373fc39e`. Tidligere rapporter beskriver tidligere checkpoints; denne vurderingen eier sluttføringen og erstatter deres åpne produksjons- og UI-porter. Endelig CI-status avleses på den faktiske sluttcommit-en i PR-en før merge.

## Avisen som verk, eksemplaret som bilde

`data/places/README_place_rounds.md` §10A lar Media eie «utgivelser og sendinger» og skiller fysisk eksemplar fra abstrakt verk. §4 krever et bilde av et faktisk medlem. Referansesjekklisten §19 krever at historiske bilder presenteres som historiske. Ingen av disse krever at enhver autentisk illustrasjon av et løpende publikasjonsverk har samme dato som stedstilknytningen. Det tidligere arbeidskortets krav om en konkret forside fra 1967–2008 var en snevrere produksjonsbeslutning, ikke et eksplisitt krav i samlingskontrakten.

Medlemmet `dagbladet_papiravisen` er derfor papiravisen som løpende publikasjon, med dokumentert redaksjonstilknytning til dette huset i 1967–2008. Det er ikke avisnummeret fra 1905, og det er ikke et fysisk museumsobjekt. SNLs seksjon «Etterkrigstid og nyere tid» støtter morgenavis fra 1982 og tabloid fra 1983; Oslo byleksikons adressehistorikk støtter den senere redaksjonsadressen og utflyttingen i 2008. Eksisterende claims `claim_dagbladet_site`, `claim_dagbladet_morning` og `claim_dagbladet_tabloid` gjenbrukes.

Illustrasjonen er den norske Dagbladet-forsiden fra **2. januar 1905**, hentet uendret fra Wikimedia Commons. Filposten oppgir Dagbladet som opphav, Nasjonalbiblioteket som kilde og Public domain-status. Den lokale filen er 599 × 836 piksler, 178 401 byte, SHA-256 `b2298d946a693176dc0510e30dcda8de21d38808110eb91c977c13888afc1689`. Originalen er åpnet og visuelt kontrollert: avisnavn og dato stemmer. Ingen utsnitt, rekonstruksjon eller generert forside brukes.

- Kildepost: https://commons.wikimedia.org/wiki/File:Dagbladet_2._januar_1905_-_framside.JPG
- Original: https://upload.wikimedia.org/wikipedia/commons/f/fe/Dagbladet_2._januar_1905_-_framside.JPG
- Historisk funksjon: https://snl.no/Dagbladet
- Adressegrense: https://oslobyleksikon.no/side/Dagbladet

Den synlige medlemstittelen sier «faksimile 1905». Beskrivelsen sier både at hovedredaksjonen lå her i 1967–2008, og at illustrasjonen er eldre og ikke viser denne periodens format eller arbeid. Kreditering og Public domain-status følger den samme synlige beskrivelsen. Bildedato og stedstilknytningsperiode har separate metadata. Året 1905 blir ikke et nytt chronology-anker ved dette stedet.

Den generelle Brand-identiteten har egen logo og egen funksjon. Publications viser faktisk avisinnhold og den redaksjonelle utgivelsen. Ingen medlemspost kopieres til Objects. En tilfeldig fotografert matrett eller et eldre personportrett fra en nettartikkel brukes ikke som reservebilde for papiravisen.

Papiravisen er samlingens representative hovedutgivelse. Nettutgaven, bilagene og Sidesprang behandles fortsatt i Fagverk, kronologi, språk, quiz og lesespor; de får ikke separate bildefattige samlingskort. Det kreves ikke ett kort per dokumentert innslag i en avis. De historiske 1985/1986-forsidene fra forskningsartikkelen publiseres ikke: den tidligere rettighetsvurderingen av disse bildene står ved lag.

## Validering og visuell sluttkontroll

`npm run place:build -- dagbladet_akersgata` og `npm run place:verify -- dagbladet_akersgata` består. Place-open-materialisering, quizkontekst, workcard og quality-gate-projeksjon er bygget fra canonical eiere. Engelsk, spansk og portugisisk stedstekst har fortsatt gjeldende kildehash; ingen eldre oversettelse er erklært nyprodusert.

`npm run build:web` består. Dagbladet-integrasjon, samlingsrenderer, samlingslayout og Unified Place har **31 beståtte tester**. Stories, Place-open og Lesespor-race har **11 beståtte tester**, inkludert den faktiske feilrekkefølgen der Place-open fyller Stories før bakgrunnsaggregatet. Publikasjonstesten kontrollerer separat bildedato/stedsperiode, faktisk bildefil og oppløste claim-ID-er. Negativ testen beholder at en kvalifisert BLOCKED-samling blokkerer også etter en hypotetisk UI-godkjenning.

Faktisk app-kjøring: [Actions 38155614695](https://github.com/Paradispartiet/History-Go/actions/runs/38155614695), kildecommit `a5d5605f976a68b0018230920e8da6c046abeef9`. Botcommit `fda6512611cb9b6e58543e57112a8f36d68e3858` lagrer bare skjermbilder og maskinrapport i `reports/visual-qa/dagbladet-akersgata/20261011-closeout/`. **Alle 18 JPG-filer er åpnet og visuelt gjennomgått**, ikke bare et utvalg. Linux Chromium med emulerte viewporter; native Safari eller fysisk iPad hevdes ikke.

| Kontroll | Faktisk evidens og resultat |
| --- | --- |
| 320×844 og 390×844 | Begge topp-/nedre PlaceCard-bilder og begge publikasjonspopuper. Hele tittelord, leselig tekst, tilgjengelig lukking, synlig 1905-datering og lisens. Ingen horisontal sideoverflow. |
| 768×1024 og 1440×1000 | Begge topp-/nedre PlaceCard-bilder og publikasjonspopuper. Tre valgte samlinger med faktiske lastede medlemsbilder; hele avisarkets avishode og ytterkanter vises med contain. Et mørkt bildefelt holder Utgivelser-etiketten leselig. |
| People og Brands | iPad-popuper åpnet og kontrollert; begge åpner på alle fire bredder. Fire personer, synlig Osvold-illustrasjonsmerking og Stanghelles eksplisitte Dagbladet-periode 1995–2000. Hans primære Aftenposten-år 1991 beholdes. Hele Brand-logoen vises uten navneoverlapp. |
| Utgivelser | Alle fire popuper. Autentisk 599×836-faksimile vises som rektangulært avisark. Teksten skiller 1905-bildet fra redaksjonsperioden 1967–2008 og oppgir Dagbladet/Nasjonalbiblioteket/Commons og Public domain. |
| QuizCard | iPad-flip og utvidet visning gjennomgått. Flip, utvidelse og lukking utført på alle bredder. Ti spørsmål og fasit er gjennomgått i canonical innhold. |
| Fagverk og kilder | iPad-integrasjonen og den faktiske artikkelsiden gjennomgått. Artikkellenken fulgt på alle bredder; curated-status, ingen synlig unfinished-melding. Elleve synlige kildelenker inkluderer den eldre avisfaksimilen. |
| Stories og drift | Én canonical, én indeksert og én synlig fortelling etter global init på alle bredder. Alle fire profiler har null registrerte avvik og null JavaScript-sidefeil. |

Den første tre-samlingskjøringen viste at avisbildet fikk portrettets sirkel og at forhåndsvisningen beskar avishodet. Dette er rettet med CSS avgrenset til Dagbladets publikasjonsmedlem/sted. Ny kjøring måler contain og rektangulær thumbnail, og den faktiske visningen er kontrollert. CSS-cacheversjonen, TypeScript-kilden og generert bundle er oppdatert sammen. Engangsworkflowen fjernes i sluttcommit-en.

Hele leveransens redaksjonelle innhold er gjennomgått: stedstekst, alle åtte Fagverk-avsnitt/fem linser/fem nøkkelspørsmål, de fire kunnskapsenhetene, fem språkoppføringer, fire People-profiler, Brand, publikasjonsmedlem, kronologi, 28 normalquizspørsmål med alternativer/fasit, ti QuizCard-spørsmål, hele nettstart-fortellingen og fem Lesespor. Historiske kildekonflikter og tilbakeblikkenes begrensninger står synlig; Carey er navngitt teori og de to dokumenterte case-ene skilles fra analytiske spørsmål om leserne.

Objects, før/etter og News har dokumentert avgrenset N/A, ikke en skjult kvalifisert kandidat. Ingen global legacy-bilde-/kildemangel utenfor stedet erklæres løst. De tidligere Lesespor-advarslene beholdes. Ingen rettighetsforespørsel er sendt, og ingen rettighetsuklar 1985/1986-forside publiseres.

## Seksdelt kvalitetsvurdering

| Dimensjon | Score | Evidens og avgrensning |
| --- | --- | --- |
| Korrekthet og evidens | 4/5 | 33 sted-claims og egne personclaims; kilde-/setningskoblinger gjennomgått. Grunnleggelse, bygning, flytting og bildedato holdes fra hverandre. Retrospektive kilder er avgrenset, ikke behandlet som samtidige arbeidslogger. |
| Dekning og ferdigstillelse | 5/5 | Hele avtalte stedschecklisten er utført. People, Brand og reelt publikasjonsverk vises; Objects og betingede moduler har substansiert N/A. Alle innholdsenheter og 18 nye skjermbilder er gjennomgått; ingen åpne lokale restpunkter. |
| Faglig/redaksjonell kvalitet | 4/5 | Adressebundet avishistorie, separate redaksjonelle roller, navngitt Carey-perspektiv med begrensning og to dokumenterte case. Quiz starter med konkret kunnskap; ingen generisk filler eller påståtte leserfunn. |
| Teknisk integritet | 5/5 | Deterministisk Place-build/verify, synkronisert TypeScript-bundle, 31 integrasjons-/visningstester og 11 lasteregresjoner. Faktisk Chromium-app på fire bredder, alle tre popuper, QuizCard og artikkelnavigasjon; null registrerte feil. Final-head CI kreves separat før merge. |
| Sikkerhet og ansvarlighet | 5/5 | Originalfilens proveniens, dimensjoner og checksum er verifisert. Synlig datogrense, Public domain-kreditering og illustrasjonsmerking; de begrensede/uklare bildealternativene er utelukket. Ingen ekstern henvendelse eller persondataendring. |
| Vedlikeholdbarhet og etterprøvbarhet | 4/5 | Canonical workflow eier status, avledede filer materialiseres. Smal CSS-retting, kjørbar audit, negative gate-tester og uendrede daterte skjermbilder gir etterprøvbar evidens. Det store avledede datadiffet er fortsatt en reviewkostnad. |

**27/30; hver dimensjon minst 4. Innholds- og visuell kvalitetsport består.** `final_ui` settes PASS og V3-state complete etter denne gjennomgangen. Merge utføres først etter grønn CI på faktisk final PR-head, uendret forventet SHA og kontroll av base/reviewstatus; post-merge Main integrity avleses på mergecommit-en.
