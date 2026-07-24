# Sport & lek – teori- og kvalitetsløft v5

Status: **validert**

Dette løftet gjør Sport & lek til et bredere og mer presist fagdomene uten å bryte eksisterende `em_sport_`-ID-er eller produksjonsquizer.

## Omfang

- 14 fagområder
- 56 teorihooks
- 40 kuraterte analysemetoder
- 18 pensummoduler
- 183 teoretikere, trenertradisjoner og institusjonelle pionerer
- 123 registrerte verkreferanser
- 140 definerte begreper

## Hva som er forbedret

Det eksisterende v4.5-laget har stor dekning, men mange emne- og metodeposter bruker repeterte standardformuleringer. V5-laget beholder derfor v4.5 som ID-kompatibilitetslag og legger et kuratert kvalitetslag over det.

Kvalitetslaget dekker:

- lek, spill, regler og sportens egenart
- idrettshistorie, standardisering, amatørisme og profesjonalisering
- arena, sted, Groundhopper, byutvikling og idrettsminne
- taktikk, spillmodell, rom, overganger og beslutninger
- motorisk læring, øvelsesdesign, feedback og representativitet
- treningsfysiologi, periodisering, restitusjon og RED-S
- biomekanikk, målevaliditet, tracking og skadeepidemiologi
- motivasjon, mestringstro, press, lagkohesjon og ledelse
- barneidrett, spesialisering, frafall, pedagogikk og safeguarding
- klubb, forbund, frivillighet, økonomi, megaarrangement og styring
- supporterkultur, medier, rivalisering, lokalitet og global fandom
- kjønn, rasisering, paraidrett, tilgjengelighet og interseksjonalitet
- fair play, doping, utøverdata og dommerteknologi
- folkehelse, aktivitetsulikhet, byrom, natur og klima

## Produksjonsregler

Spørsmål skal starte i et dokumentert idrettsanker: arena, kamp, regel, utøver, lag, øvelse, datasett, organisasjon, historisk hendelse eller praksis.

Teori og begreper skal forklare mekanismen i caset. Navnet på en teoretiker er ikke i seg selv en kunnskapstest. Resultater og rekorder skal brukes til å lære bort vilkår, metode, betydning eller mekanisme – ikke som løs trivia.

Trenings- og helsestoff skal skille:

- gruppefunn fra individuell vurdering
- korrelasjon fra årsak
- tallforskjell fra praktisk relevant endring
- treningsveiledning fra medisinsk diagnose

## Kompatibilitet

`emner_sport_canonical_v4_5.json` og de eksisterende metode-ID-ene beholdes som aktiv kompatibilitetsflate. V5-filer brukes gjennom `supersetQUIZMAL_sport.json` til å skjerpe teori, kilder, begreper, metodevalg og forklaring.

## Validering

`tools/validate-sport-theory-quality.mjs` kontrollerer:

- minimumsomfang og unike ID-er
- alle kryssreferanser
- minst fire relevante teoretikere per hook
- minst fem begreper og to metoder per hook
- komplette pensummoduler
- presise definisjoner og avgrensninger
- blokkering av navnegjetting, medisinsk overtramp og personlig supporterpreferanse
- bevaring av `em_sport_`-kompatibilitet

Valideringsrapporten har status `passed` og ingen registrerte feil.
