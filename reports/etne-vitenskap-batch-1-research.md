# Etne vitenskap batch 1 — research og canonical-vurdering

**Dato:** 2026-07-18

## Kandidat

- `etneelva_forskningsplattform`
- navn: `Nasjonal forskingsplattform i Etneelva`
- foreslått hovedkategori: `vitenskap`

## Audit mot dagens main før opprettelse

Det finnes allerede en aktiv natur-record for `etneelva`, men den representerer selve vassdraget som et bredt natursted. Den eksisterende koordinatkontrakten sier eksplisitt at punktet er et representativt linjeanker for nedre Etneelva og **ikke** et presist punkt for oppvandringsfella.

Det gjør forskningsplattformen til en separat fysisk og funksjonell kandidat:

- `etneelva` → natursted / vassdrag / nasjonalt laksevassdrag
- `etneelva_forskningsplattform` → konkret forskningsinfrastruktur / instrument / feltlaboratorium

Søk etter kandidatnavn og sentrale navnevarianter i repoets PR-historikk ga ingen eksisterende eller skjult parallell Etne-vitenskap-record.

## Hvorfor hovedkategori er vitenskap

Havforskningsinstituttet beskriver anlegget som en nasjonal forskingsplattform og viktig infrastruktur for forskning og forvaltning. Oppvandringsfella dekker hele elva på tvers, og fisk som passerer blir håndtert enkeltvis for registrering, klassifisering, måling og prøvetaking. Plattformen produserer lange dataserier og materiale til forskningsprosjekter, overvåkingsprogrammer og nasjonal forvaltning.

Hovedobjektet er dermed ikke elva som landskap eller rekreasjonssted, men et konkret vitenskapelig måle- og feltanlegg. Dette følger vitenskapspakkens canonical regel om at steder kan ligge i `vitenskap` når hovedpoenget er forskningsinfrastruktur, instrument, måling, datasett, feltarbeid, miljøovervåking eller dokumentert forskningsmiljø.

## Dokumentert vitenskapsanker

Havforskningsinstituttets materiale dokumenterer blant annet:

- Fjord- og elvelaboratoriet i Etneelva ble etablert i 2013.
- Oppvandringsfella er en flyteristfelle som sperrer hele elvebredden, omtrent 40 meter.
- Fisk blir artsbestemt og vurdert som vill eller rømt.
- Lengde og vekt måles, og det tas blant annet skjell- og DNA-prøver.
- PIT-merking og andre datasystemer brukes for å følge bestandsutvikling og overlevelse.
- Dataene inngår i forskningsprosjekter, overvåkingsprogrammer, databaser og nasjonale rapporter.

Dette gir et tydelig stedlig vitenskapsanker i både instrumentet, metoden, datainnsamlingen og forskningsinfrastrukturen.

## Fysisk lokalisering

Den ferdig monterte fella ble i april 2013 dokumentert av Etne Jeger- og Fiskerforening som plassert **ovenfor Enge bru i sone 3**. Tidligere lokaliseringsarbeid beskrev sone 3 som omtrent **15 meter ovenfor Enge bru** og sone 4 som aktuelle lokaliteter; den senere monteringsmeldingen bekrefter at den faktiske fella ble lagt ovenfor Enge bru i sone 3.

Havforskningsinstituttets nyere kartmateriale viser også fella i Etnevassdraget, men de tilgjengelige nettflatene eksponerer ikke et stabilt maskinlesbart objekt-ID eller et direkte oppmålt WGS84-punkt for selve fella.

### Coordinate decision

Første canonical source-record bruker derfor:

- `coordType: semantic_anchor`
- `coordStatus: needs_manual_visual_qa`
- `lat: 59.66611`
- `lon: 5.94722`
- `r: 120`

Dette er **ikke** hevdet å være et oppmålt fellepunkt. Det er et konservativt displayanker i den dokumenterte lokale delen av nedre Etneelva, mens den fysiske relasjonen til Enge bru er dokumentert i `coordNote`.

Punktet er foreløpig identisk med det brede `etneelva`-linjeankeret. Dette skal ikke skjules: identiteten er separat, men koordinaten må oppgraderes dersom et stabilt bro-/felleobjekt eller et direkte kartfestet WGS84-punkt blir tilgjengelig. Inntil da beholdes `needs_manual_visual_qa`; det skal ikke overklassifiseres til `verified`.

## Canonical emnevalg

Valgte emner:

- `em_vit_feltarbeid_observasjon`
  - fysisk feltarbeid, observasjon, prøvetaking og stedfestede biologiske data
- `em_vit_eksperiment_maling`
  - systematisk måling, prøver, merking, kontroll og etterprøvbar datainnsamling
- `em_vit_miljo_okologi_system`
  - bestander, økologiske systemer, menneskelig påvirkning og langtidsobservasjoner
- `em_vit_forskningsinfrastruktur`
  - selve fella og feltstasjonen som varig nasjonal forskningsplattform

Alle fire bruker `em_vit_*` og er valgt ut fra den faktiske vitenskapelige praksisen ved stedet, ikke ved å oversette emner fra naturkategorien.

## Avgrensning mot `etneelva`

Den nye recorden skal aldri brukes som en ny generell elvebeskrivelse.

`etneelva_forskningsplattform` skal spørres gjennom:

- instrument og fysisk fellekonstruksjon
- hvordan hele oppvandringen kan observeres
- registrering, måling og prøvetaking av enkeltfisk
- PIT, genetikk, skjellprøver og lange dataserier
- forskningsinfrastrukturens rolle i overvåking og forvaltning

`etneelva` skal fortsatt dekke:

- vassdraget
- landskapet
- villaksen som natur- og forvaltningssystem
- nasjonalt laksevassdrag

## Kilder

1. Havforskningsinstituttet, **Etneelva: Slik overvakar forskarane laks og sjøaure** — institusjonsside for den nasjonale forskingsplattformen.
2. Havforskningsinstituttet, **Årsrapport fra Fjord- og elvelaboratoriet i Etne 2024** — etablering, formål, metoder, målinger, prøvetaking og langtidsdata.
3. Havforskningsinstituttet, **Årsrapport fra Fjord- og elvelaboratoriet i Etne 2025** — oppdatert metodebeskrivelse av den ca. 40 meter brede flyteristfella og prøvetakingen.
4. Etne Jeger- og Fiskerforening, **Fiskefella er ferdig montert**, 14.04.2013 — dokumenterer endelig plassering ovenfor Enge bru i sone 3.
5. Etne Jeger- og Fiskerforening, **Positivt medlemsmøte med fiskefelle som hovudtema** — dokumenterer lokaliseringsarbeidet og sone 3 omtrent 15 meter ovenfor Enge bru.
6. Repoets aktive `data/places/natur/vestland/etneelva.json` — duplicate/overlap-audit og eksplisitt avgrensning av eksisterende naturanker.
7. `data/fag/vitenskap/SET_MAL_README_vitenskap_v4_3.md` og canonical vitenskap-emnedata — kategori- og emnekontroll.

## Videre koordinatoppgradering

En senere coordinate-QA bør prioritere ett av følgende:

1. stabilt NVDB/Kartverket-objekt for Enge bru kombinert med direkte dokumentert fellegeometri,
2. offisiell HI-geometri eller koordinat for fella,
3. annet stabilt offentlig kartobjekt som identifiserer selve forskningsinstallasjonen.

Når et slikt objekt finnes, kan displayankeret flyttes fra det delte elveankeret og få `sourceObjectId`. `coordStatus` skal bare settes til `verified` dersom coordinate-source-contracten faktisk er oppfylt.
