# Vertikal fordypningsplan for Litteratur

Revisjon: `litteratur-vertical-depth-plan-2026-07-24`

## Mål

Litteraturpensumet skal utvikles fra et bredt canonical fagkart til et vertikalt, progresjonsbasert bachelorpensum i litteraturvitenskap. Utvidelsen skjer direkte i aktive canonical-filer, uten overlay, parallell runtime eller løsrevne teorilister.

**Samlet status:** Alle tre faser er gjennomført, faglig validert og merget med full Data-/TypeScript-sluttkontroll.

## Prinsipper

1. Litteraturvitenskap er hoveddisiplin; historie, sosiologi, språkvitenskap, medievitenskap og kulturstudier brukes som støttefag.
2. Spørsmål starter i konkret tekst, verk, utgave, forfatter, oversettelse, institusjon, leserpraksis eller dokumentert litterært sted.
3. Tekstobservasjon, tolkning, historisk kontekst og empirisk påstand skal skilles eksplisitt.
4. Teoretikernavn er aldri tilstrekkelig fasit.
5. Forfatterbiografi kan støtte, men aldri erstatte, tekst-, verk- eller feltanalyse.
6. Norske og lokale case kobles til nordiske, komparative og verdenslitterære spørsmål.
7. Hver fase får permanent validator, spørsmålsplaner, dokumentert progresjon og ordinær Data-/TypeScript-CI.

## Fase 1 — Poetikk, narratologi og tekstlig analyse

**Status:** Fullført og validert med 354 fagkontroller samt full Data-/TypeScript-sluttport.

**Formål:** Gi tekst-, form- og sjangeranalysen full bachelorbredde og tydelige inferensgrenser.

Temaer:

- plot, hendelse og narrativ organisering
- forteller, fokalisering og upålitelighet
- fri indirekte diskurs, bevissthetsfremstilling og polyfoni
- tid, minne, rekkefølge, varighet og frekvens
- retorikk, adressat og implisitt leser
- hermeneutikk, fortolkningskonflikt og tekstlig evidens
- lyrisk stemme, rytme, metrikk og linjebrudd
- drama, dialog, sceneanvisning og fremførbarhet
- metafor, metonymi, symbol og billedfelt
- litterær etikk, affekt og erfaringsform

Leveranse:

- 10 nye hooks
- 10 nye emner i `em_lit_poetikk_*`
- 6 nye spesialiserte analysemetoder
- 10 nye emnemappinger med to analysebaner hver
- 10 kilde- og tekstforankrede spørsmålsplaner
- aktiv poetikk- og narratologiakse i fagkart, pensum og generator
- permanent fasevalidator

## Fase 2 — Litteraturhistorie, verdenslitteratur, oversettelse og medieformer

**Status:** Fullført og squash-merget i PR #3706 med 387 fagkontroller og full Data-/TypeScript-sluttport.

**Formål:** Bygge historisk, komparativ og transnasjonal dybde fra antikkens sjangre til digitale og multimodale tekster.

Temaer:

- litteraturhistorisk periodisering og samtidige tradisjoner
- antikk, middelalder, renessanse og tidligmodernitet
- romantikk, realisme, naturalisme og modernisme
- avantgarde, postmodernisme og samtid
- komparativ litteratur og verdenslitteratur
- oversettelse, uoversettelighet og flerspråklighet
- koloniale og postkoloniale litterære systemer
- bokhistorie, utgaver, paratekst og tekstoverlevering
- muntlighet, opplesning og lydlitteratur
- digital litteratur, plattform og elektronisk tekst
- adaptasjon og intermedialitet
- sjangerhistorie, kanonendring og resepsjon

Leveranse:

- 12 nye hooks og emner
- 6 nye historiske, komparative og mediale metoder
- 12 mappinger og spørsmålsplaner
- historisk og verdenslitterær progresjonsakse
- permanente kilde-, utgave- og oversettelseskrav

## Fase 3 — Norsk, nordisk og samisk litteratur; institusjoner, lesere og steder

**Status:** Fullført og squash-merget i PR #3711 med 464 fagkontroller og full Data-/TypeScript-sluttport.

**Formål:** Gjøre pensumet direkte anvendelig på norske og nordiske verk, språk, institusjoner og litterære steder uten nasjonal selvtilstrekkelighet.

Temaer:

- norrøn litteratur og tekstoverlevering
- dansk-norsk skriftkultur og 1800-tallets offentlighet
- nasjonsbygging, språkstrid og litterær kanon
- realisme, naturalisme og modernisme i Norge og Norden
- etterkrigslitteratur og samtid
- samisk litteratur, muntlighet, språk og institusjoner
- kvensk, romani-/romanés- og minoritetslitteratur
- barnelitteratur og ungdomslitteratur
- forlag, redaksjoner, kritikere og priser
- bibliotek, leserhistorie og litteraturformidling
- sensur, ytringsfrihet og litterær offentlighet
- litterære Oslo-steder, bytekst og minnekultur
- kulturpolitikk, innkjøpsordning og litterær økonomi
- forfatterarkiv, manuskripter og etterliv

Leveranse:

- 14 nye hooks og emner
- 6 norske/nordiske institusjons- og stedsmetoder
- 14 mappinger og spørsmålsplaner
- litterært institusjons- og stedskart
- krav om nordisk sammenligningsgrunnlag og oppdaterte institusjonskilder

## Samlet canonical-status etter fase 3

- 6 domener
- 96 hooks
- 67 emner
- 47 metoder
- 64 mappinger
- 36 spørsmålsplaner fra de tre fordypningsfasene

## Kvalitetsporter

Alle tre faser har bestått:

- canonical JSON-parsing
- referanseintegritet mellom fagkart, emner, metoder, mappinger, pensum og generator
- minimumskrav til tekstgrunnlag, metode, fortolkningsbelegg, distinksjoner og konkurrerende lesninger
- `git diff --check`
- ordinære Data checks
- TypeScript typecheck og build guard
- ingen overlay, engangsbygger, base64-pakke, byggerdeler eller midlertidig workflow ved merge
