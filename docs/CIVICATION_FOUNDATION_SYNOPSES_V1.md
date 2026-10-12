# Civication – synopsiser for de ti grunnkapitlene (dag 8–13)

**Status:** Redaksjonell revisjon av eksisterende fortsettelser. Kilden er faktiske fortsettelsesfiler på `main` (12. oktober 2026); ingen eksisterende scene, choice eller state er omskrevet. Strukturen her beskriver hvordan scenenes logikk skal bevares når Mira, Lea og Arvid opphører som obligatoriske identiteter.

**Prinsipp:** En synopsis er **ikke** en påstand om at foreslåtte People-varianter er autorisert eller implementert. Kontakter må være eksplisitt tilgjengelige etter History Go-oppdagelse, og fakta, simulator og reelle sosiale roller må holdes fra hverandre.

## Grunnkapittelmatrise

| ID | Dager | Spillrolle | Dramaturgisk motor | Videreføring |
| --- | --- | --- | --- | --- |
| [`musikk_med_mira`](../data/Civication/lifestory/continuations/musikk_med_mira.json) | 8–10 | `musikk_frilansmusiker` | Nysgjerrighet på samarbeid mot tid, kapasitet og usikker avtale. | Dag 11–13 |
| [`sideprosjekt_med_lea`](../data/Civication/lifestory/continuations/sideprosjekt_med_lea.json) | 8–10 | `naeringsliv_sideprosjektbygger` | Prototypelyst mot den begrensede tiden og det faktiske problemet. | Dag 11–13 |
| [`frilans_med_lea`](../data/Civication/lifestory/continuations/frilans_med_lea.json) | 8–10 | `naeringsliv_frilanser` | Ønske om oppdrag mot uklar leveranse og gratisarbeid. | Dag 11–13 |
| [`grunder_med_lea`](../data/Civication/lifestory/continuations/grunder_med_lea.json) | 8–10 | `naeringsliv_grunderdrommer` | Forelskelse i løsning mot usikkerheten om et behov faktisk eksisterer. | Dag 11–13 |
| [`sideprosjekt_neste_steg`](../data/Civication/lifestory/continuations/sideprosjekt_neste_steg.json) | 11–13 | `naeringsliv_sideprosjektbygger` | Bygge mer mot lære hva som allerede er prøvd. | Dag 14–16 |
| [`frilans_neste_steg`](../data/Civication/lifestory/continuations/frilans_neste_steg.json) | 11–13 | `naeringsliv_frilanser` | Fristelsen til å si ja mot behovet for et presist tilbud. | Dag 14–16 |
| [`grunder_neste_steg`](../data/Civication/lifestory/continuations/grunder_neste_steg.json) | 11–13 | `naeringsliv_grunderdrommer` | Entusiasme for løsning mot behovet for å motbevise hypotesen. | Dag 14–16 |
| [`musikk_foresporselen`](../data/Civication/lifestory/continuations/musikk_foresporselen.json) | 11–13 | `musikk_frilansmusiker` | Mulighet til å opptre mot uklar tid, forberedelse og vilkår. | Dag 14–16 |
| [`miljo_med_arvid`](../data/Civication/lifestory/continuations/miljo_med_arvid.json) | 8–10 | `subkultur_gangster` | Ønske om deltakelse mot forventninger om innsats og uklare tjenester. | Dag 11–13 |
| [`miljo_navnet_ditt`](../data/Civication/lifestory/continuations/miljo_navnet_ditt.json) | 11–13 | `subkultur_gangster` | Anerkjennelse i miljøet mot ansvar for andres forventninger. | Dag 14–16 |

## F01 – Musikken etter den første uka

**Eksisterende pakke:** `data/Civication/lifestory/continuations/musikk_med_mira.json` · `role_scope=musikk_frilansmusiker` · dag 8–10.

**Synopsis / etablert inngang:** Et kort sett kan ha blitt gjennomført eller uteblitt. I begge tilfeller kommer en ny mulighet til å prøve musikk sammen, men historien må huske hvilken inngang spilleren har.

**Grunnkonflikt:** Nysgjerrighet på samarbeid mot tid, kapasitet og usikker avtale.

**Beslutningsprinsipp ved migrering:** Avtal konkret prøve eller velg pause/annen løsning; gjennomføring må dokumenteres.

**Sen tilbakekomst:** Dag 11 kan bookeren sende en ny forespørsel; den tidligere prøven eller avlysningen beholder riktig status.

**Symposium må vise:** Det korte settets status, ny invitasjon, valgt svar og faktisk utført/avbrutt prøve.

**People-port:** `existing_scene_pack` er ikke en ekte People-relasjon. Bevar historikk, lag egne personspesifikke scener når governance godkjenner simulering; ellers bruk People kun som dokumentert bakgrunn for en separat fiktiv rolle.

## F02 – Et prosjekt som får være lite

**Eksisterende pakke:** `data/Civication/lifestory/continuations/sideprosjekt_med_lea.json` · `role_scope=naeringsliv_sideprosjektbygger` · dag 8–10.

**Synopsis / etablert inngang:** Et tidligere møte kan ha gitt en grov modell, bare spørsmål, eller ingen gjennomført samtale. Prosjektet har ennå ikke gitt kunder eller inntekter.

**Grunnkonflikt:** Prototypelyst mot den begrensede tiden og det faktiske problemet.

**Beslutningsprinsipp ved migrering:** Velg en avgrenset prøve og noter hva som faktisk ble observert, eller behold prosjektet på egne premisser.

**Sen tilbakekomst:** Dag 11 må bygge videre på modell, spørsmål eller fravær av møte, uten å tilskrive en deltaker erfaring fra en prøve som ikke fant sted.

**Symposium må vise:** Samtale/prøve, avtalestatus, plan og innholdet som faktisk ble undersøkt.

**People-port:** `existing_scene_pack` er ikke en ekte People-relasjon. Bevar historikk, lag egne personspesifikke scener når governance godkjenner simulering; ellers bruk People kun som dokumentert bakgrunn for en separat fiktiv rolle.

## F03 – En forespørsel er ikke et oppdrag

**Eksisterende pakke:** `data/Civication/lifestory/continuations/frilans_med_lea.json` · `role_scope=naeringsliv_frilanser` · dag 8–10.

**Synopsis / etablert inngang:** Prosjektbyggeren spør om en skisse, men verken pris eller arbeidsomfang er avtalt. Tidligere kontakt kan ha vært prototyp, samtale eller et nei.

**Grunnkonflikt:** Ønske om oppdrag mot uklar leveranse og gratisarbeid.

**Beslutningsprinsipp ved migrering:** Avklar arbeid og forbehold skriftlig, eller avslå uten å konstruere et betalt oppdrag.

**Sen tilbakekomst:** Før et eventuelt tilbud på dag 11 må spillet kontrollere hva som faktisk var avtalt om omfang, pris og kapasitet.

**Symposium må vise:** Forespørsel, eventuelt møte, grense for arbeidet, ingen oppdiktet kontrakt.

**People-port:** `existing_scene_pack` er ikke en ekte People-relasjon. Bevar historikk, lag egne personspesifikke scener når governance godkjenner simulering; ellers bruk People kun som dokumentert bakgrunn for en separat fiktiv rolle.

## F04 – Hvem har egentlig problemet?

**Eksisterende pakke:** `data/Civication/lifestory/continuations/grunder_med_lea.json` · `role_scope=naeringsliv_grunderdrommer` · dag 8–10.

**Synopsis / etablert inngang:** Spilleren undersøker om en idé svarer på et behov. Prosjektbyggeren kan ha delt erfaring fra pappdeler, men er ikke automatisk kunde eller partner.

**Grunnkonflikt:** Forelskelse i løsning mot usikkerheten om et behov faktisk eksisterer.

**Beslutningsprinsipp ved migrering:** Still et åpent behovsspørsmål eller arbeide videre alene uten å forutsette kjøp.

**Sen tilbakekomst:** Den følgende samtalen på dag 11 må bare bruke opplysninger fra møtet hvis det fant sted.

**Symposium må vise:** Hypotese, tidligere observasjon, hvem som ble spurt, ingen salgspåstand.

**People-port:** `existing_scene_pack` er ikke en ekte People-relasjon. Bevar historikk, lag egne personspesifikke scener når governance godkjenner simulering; ellers bruk People kun som dokumentert bakgrunn for en separat fiktiv rolle.

## F05 – Etter lysten til å bygge

**Eksisterende pakke:** `data/Civication/lifestory/continuations/sideprosjekt_neste_steg.json` · `role_scope=naeringsliv_sideprosjektbygger` · dag 11–13.

**Synopsis / etablert inngang:** Etter den første prosjektperioden ser spilleren på sine notater. I noen forløp beholdt spilleren tid til prosjektet, i andre ble det lagt bort.

**Grunnkonflikt:** Bygge mer mot lære hva som allerede er prøvd.

**Beslutningsprinsipp ved migrering:** Sjekk bruk og dokumentasjon, eller parker prosjektet uten å miste historikken.

**Sen tilbakekomst:** På dag 14–16 skal videreføringen reagere på om tid, skisse eller et spørsmål faktisk ble beholdt.

**Symposium må vise:** Notat, valgt neste steg og prosjektets faktiske status.

**People-port:** `existing_scene_pack` er ikke en ekte People-relasjon. Bevar historikk, lag egne personspesifikke scener når governance godkjenner simulering; ellers bruk People kun som dokumentert bakgrunn for en separat fiktiv rolle.

## F06 – Før et tilbud sendes

**Eksisterende pakke:** `data/Civication/lifestory/continuations/frilans_neste_steg.json` · `role_scope=naeringsliv_frilanser` · dag 11–13.

**Synopsis / etablert inngang:** Prosjektbyggeren vil vite hva en enkel oversikt over pappdeler ville omfatte. Det gamle frilanskapitlet kan ha sluttet med et begrenset utkast eller et nei.

**Grunnkonflikt:** Fristelsen til å si ja mot behovet for et presist tilbud.

**Beslutningsprinsipp ved migrering:** Presiser leveransen og skriv et utkast, eller avslå før arbeid og pris påstås.

**Sen tilbakekomst:** Dag 14–16 skal bygge på et eventuelt utkast, ikke en kontrakt som aldri ble inngått.

**Symposium må vise:** Omfang, utkast, grense og foreløpig status.

**People-port:** `existing_scene_pack` er ikke en ekte People-relasjon. Bevar historikk, lag egne personspesifikke scener når governance godkjenner simulering; ellers bruk People kun som dokumentert bakgrunn for en separat fiktiv rolle.

## F07 – Et svar fra én person

**Eksisterende pakke:** `data/Civication/lifestory/continuations/grunder_neste_steg.json` · `role_scope=naeringsliv_grunderdrommer` · dag 11–13.

**Synopsis / etablert inngang:** En kontakt tilbyr sin erfaring med et konkret hverdagsproblem. Erfaringen er ett datapunkt, ikke et marked eller en bestilling.

**Grunnkonflikt:** Entusiasme for løsning mot behovet for å motbevise hypotesen.

**Beslutningsprinsipp ved migrering:** Noter begrensningene ved enkeltobservasjonen, eller utsett videre arbeid.

**Sen tilbakekomst:** Dag 14–16 skal huske om spilleren faktisk fikk et svar og hvordan dette ble tolket.

**Symposium må vise:** Hypotese, registrert enkeltrespons og videre plan.

**People-port:** `existing_scene_pack` er ikke en ekte People-relasjon. Bevar historikk, lag egne personspesifikke scener når governance godkjenner simulering; ellers bruk People kun som dokumentert bakgrunn for en separat fiktiv rolle.

## F08 – Omfanget før spillejobben

**Eksisterende pakke:** `data/Civication/lifestory/continuations/musikk_foresporselen.json` · `role_scope=musikk_frilansmusiker` · dag 11–13.

**Synopsis / etablert inngang:** Bookeren tilbyr et kort sett på dag 16, men tidligere øving kan ha blitt gjennomført eller avlyst; ingen booking er ennå garantert.

**Grunnkonflikt:** Mulighet til å opptre mot uklar tid, forberedelse og vilkår.

**Beslutningsprinsipp ved migrering:** Be om opplysninger om omfang og vilkår eller la være å forplikte seg.

**Sen tilbakekomst:** Dag 14–16 må respektere svaret; et spørsmål fra bookeren er ikke en bekreftet spillejobb.

**Symposium må vise:** Forespørsel, bekreftelse eller fravær av den, vilkår og tidslinje.

**People-port:** `existing_scene_pack` er ikke en ekte People-relasjon. Bevar historikk, lag egne personspesifikke scener når governance godkjenner simulering; ellers bruk People kun som dokumentert bakgrunn for en separat fiktiv rolle.

## F09 – Miljøkontakten og plassen din

**Eksisterende pakke:** `data/Civication/lifestory/continuations/miljo_med_arvid.json` · `role_scope=subkultur_gangster` · dag 8–10.

**Synopsis / etablert inngang:** Historien åpner forskjellig når spilleren tidligere satte avstand, gjennomførte en oppgave eller avslo. Det gamle svaret skal fortsatt gjelde.

**Grunnkonflikt:** Ønske om deltakelse mot forventninger om innsats og uklare tjenester.

**Beslutningsprinsipp ved migrering:** Avklar egen rolle, vurder kontakt på nytt eller behold avstanden.

**Sen tilbakekomst:** Når invitasjonen vurderes dag 11 skal gammel avstand, tidligere innsats og eventuelle grenser fortsatt være synlige.

**Symposium må vise:** Oppgave, avslag, avtalt tidsramme og hvem som hadde tillatelse til hva.

**People-port:** `existing_scene_pack` er ikke en ekte People-relasjon. Bevar historikk, lag egne personspesifikke scener når governance godkjenner simulering; ellers bruk People kun som dokumentert bakgrunn for en separat fiktiv rolle.

## F10 – Hvem får snakke for deg?

**Eksisterende pakke:** `data/Civication/lifestory/continuations/miljo_navnet_ditt.json` · `role_scope=subkultur_gangster` · dag 11–13.

**Synopsis / etablert inngang:** En invitasjonstekst har et åpent kontaktfelt. Spilleren har en tidligere relasjon til miljøkontakten, men ingen ny oppgave er automatisk avtalt.

**Grunnkonflikt:** Anerkjennelse i miljøet mot ansvar for andres forventninger.

**Beslutningsprinsipp ved migrering:** Tillat navn med definert ansvar, be om korrigering eller nekt bruk.

**Sen tilbakekomst:** Dag 14–16 må sitere den faktiske avtalen om navnebruk, ikke legge spilleren på arbeidslisten automatisk.

**Symposium må vise:** Invitasjonsutkast, samtykke, arbeidsliste og eventuelle endringer.

**People-port:** `existing_scene_pack` er ikke en ekte People-relasjon. Bevar historikk, lag egne personspesifikke scener når governance godkjenner simulering; ellers bruk People kun som dokumentert bakgrunn for en separat fiktiv rolle.


## Fremdriftsregel: før dag 14 begynner

Kjør hver av de fem rollebanene i minst tre forskjellige innganger: tidligere møte gjennomført; tidligere møte avlyst/avslått; ingen tilsvarende kontakt registrert. Ikke anta at alle tre utfall er spillbare i legacy-materialet uten å teste. Oppfølging må aldri tilbakedatere en samtale, kunde, booking, jobb, betaling eller vennestatus.

Etter migrering skal hver av de ti pakkene ha navngitt **kilde**, **rolle**, **tilgangskrav**, **eventuell People-ID**, **lovlig fiksjonsmodus**, **scene-ID**, **valgflagg**, **et senere konsekvenspunkt** og **Symposium-tekst**. Disse feltene er en produksjonssjekkliste, ikke et nytt lagringsskjema.
