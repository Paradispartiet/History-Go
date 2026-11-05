# Minneparken – sluttkontroll og releasebeslutning (3. november 2026)

**Beslutning: HOLD / IKKE PUBLISER.** Dette er en oppdatert revisjonsstatus for [draft PR #6966](https://github.com/Paradispartiet/History-Go/pull/6966), ikke en godkjenning av fysisk ferdigstatus eller ekstern fagfellevurdering.

## Faktisk fullført og etterprøvd

| Leveranse | Resultat og bevis |
|---|---|
| Historisk PlaceCard / Fagverk | Mobil og desktop bestått. [Actions #41608954142](https://github.com/Paradispartiet/History-Go/actions/runs/41608954142). |
| Daterte visuelle bevis | Public-domain-foto fra **15. juli 2007**, historisk bildetekst, proveniens og ikke-overlappende knapptekst bestod tidligere browser-QA. Bildet beskriver **ikke** nåtilstanden. |
| Fullquiz | **21/21**, 3 × 7; riktig fremdrift og belønning uten fysisk besøksregistrering, mobil og desktop. [Actions #41608954142](https://github.com/Paradispartiet/History-Go/actions/runs/41608954142). |
| QuizCard | **10/10**, kontrollert fasit- og kildeparitet, flipp, utvidelse og tastaturbetjening, mobil og desktop. Samme Actions-kjøring. |
| Knowledge | **32 kanoniske enheter** er synkronisert i commit [0c8ff446](https://github.com/Paradispartiet/History-Go/commit/0c8ff446bee4e3926e9b6b0cc569eb603389bd92); 21/21 fullquiz- og 10/10 QuizCard-spørsmål er `linked`. `knowledge:canonical:write`, `--check`, kildelenke- og kontrakttester bestod i [Actions #41608081923](https://github.com/Paradispartiet/History-Go/actions/runs/41608081923). **0 kontraktsfeil**, men øvrig katalog har fortsatt advarsler. |
| Story-kandidat og kronologi | Kildebundet episode-v1-fortelling og kronologi finnes. Full Stories-integritet bestod ved isolert testregistrering ([Actions #41586542715](https://github.com/Paradispartiet/History-Go/actions/runs/41586542715)); streng kontroll bestod igjen etter main-oppdatering i #41608954142. |
| Integrasjon | Oppdatert `main` er flettet **til draft-grenen** etter eksakt endringskontroll, offisielle generatorer, streng Knowledge-/Story-/quizkontroll og ekte mobil-/desktop-Browser QA i [Actions #41608954142](https://github.com/Paradispartiet/History-Go/actions/runs/41608954142). Ingen merge til `main` eller deploy. |

## Åpne release-porter – ingen automatisk godkjenning

**F – fysisk dokumentasjon / dagsaktuell tilstand: `N/A`.** Oslo kommunes [Minneparken-side](https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/minneparken/) og [Middelalderbyen-oversikt](https://www.oslo.kommune.no/slik-bygger-vi-oslo/middelalderbyen/) omtaler deler av tilretteleggingen i plan- og framtidsform. [Middelalder-Oslo / Petter Molaug](https://www.middelalder.no/middelalderbyen-i-dag/middelalderbeltet/589-minneparken-og-hallvardskatedralen) dokumenterte uferdig gangsti og gressplen i november **2025**. Ingen av disse dokumenterer sluttføring eller fysisk tilstand pr. 3. november **2026**. Et public-domain-foto fra 2007 er kilde til historisk tilstand, ikke befaring eller ferdigattest i 2026.

**Nødvendig før F kan vurderes:** datert 2026-kilde fra Kulturetaten/Byantikvaren eller etterprøvbar feltbefaring som særskilt omtaler gressplen, gangsti, universell tilgjengelighet, gjerder/sikring, frilagt sørmur og nyere oppmurt apside. Kilden skal opplyse observasjonsdato og gjeldende tilstand; anslag eller framtidsplaner teller ikke som sluttbevis. En eventuell dokumentasjon av fortsatt uferdig anlegg skal føre til fortsatt `N/A`, ikke `PASS`.

**G – quiz, Knowledge og redaksjonell aksept: `N/A`.** Teknisk Knowledge-register er nå reelt synkronisert og kontrakttestet. Fremdeles mangler **uavhengig redaksjonell** etterkontroll og eksplisitt publiseringsbeslutning om de 21 spørsmålene, de 10 QuizCard-spørsmålene, fasit, datobindinger og kildeformuleringer. Verken `data/quiz/manifest.json` eller `data/quizcards/historie/manifest.json` inneholder Minneparken. En signert gjennomgang må foreligge før kontrollerte manifestendringer og endelig live-app QA; kanoniske ID-er er ikke release-godkjenning.

**H – kronologi og Story: `N/A`.** Én kilde- og formatvalidert episode-v1-kandidat ligger i `data/stories/stories_minneparken_gamlebyen.json`. Det mangler uavhengig narrativ fagredaksjon, eksplisitt godkjenning og interaktiv Story-QA etter manifestregistrering. De to aktive Story-manifestene skal ikke endres før dette er oppfylt.

## Sikker releaseprosedyre

1. Dokumenter og signer F-vurderingen med **fersk, datert faktisk kilde**. Ved utilstrekkelig bevis: fortsatt HOLD.
2. La en annen ansvarlig redaktør enn forfatteren kontrollere samtlige quizspørsmål, Knowledge-lenker og Story-kandidaten; registrer hvem, når, hva og eventuelle rettelser, uten å opprette fiktive signaturer.
3. Først etter reelle F/G/H-`PASS`: oppdater aktive quiz-, QuizCard- og Story-manifester etter kanonisk format og kjør full kvalitets-, browser- og release-CI på **siste integrerte PR-head**.
4. Behold `status: blocked` og PR draft inntil alle porter og obligatoriske tester er grønne. Merge og deploy er separate handlinger etter verifisert godkjenning.

### Signeringsfelt (ikke utfylt)

| Port | Ansvarlig redaktør / myndighet | Signert dato og etterprøvbar kilde | Beslutning |
|---|---|---|---|
| F | Ikke bekreftet | Ingen sluttbevis for november 2026 | **N/A** |
| G | Ikke bekreftet | Teknisk grønn; uavhengig aksept mangler | **N/A** |
| H | Ikke bekreftet | Teknisk grønn; uavhengig narrativ aksept mangler | **N/A** |

**Dette dokumentet er en overleverings- og beslutningslogg, ikke en automatisk unntaksprosedyre.** Ingen validatorgrenser er senket, ingen manglende godkjenning er konstruert, og ingen produksjonsrelease er utført.
