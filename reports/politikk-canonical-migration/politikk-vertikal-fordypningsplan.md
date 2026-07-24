# Vertikal fordypningsplan for Politikk & samfunn

Revisjon: `politikk-vertical-depth-plan-2026-07-24`

## Mål

Politikkpensumet skal utvikles fra et bredt statsvitenskapelig fagkart til et vertikalt, progresjonsbasert bachelorpensum. Utvidelsen skal skje i aktive canonical-filer, uten overlay, parallell runtime eller løsrevne teorilister.

## Prinsipper

1. Statsvitenskap forblir hoveddisiplin.
2. Nye emner skal utdype eksisterende domener, ikke opprette nye domener uten faglig nødvendighet.
3. Hvert emne skal ha ekstern `claim_basis`, eksplisitt analyseenhet, definert politisk utfall, mekanisme, metode, konkurrerende forklaring og gyldighetsområde.
4. Teoretikernavn er aldri tilstrekkelig fasit.
5. Norske og lokale case skal kobles til komparative og internasjonale forskningsspørsmål.
6. Hver fase får permanent validator, spørsmålsplaner og dokumentert progresjon.

## Fase 1 — Politiske institusjoner og konstitusjonell politikk

**Status:** Fullført og merget i PR #3680.

**Formål:** Gi komparativ politikk og institusjonsanalysen full bachelorbredde.

Temaer:

- parlamentarisme og presidentstyre
- flertallsdemokrati og konsensusdemokrati
- enhetsstat, føderalisme og territorial maktfordeling
- ett- og tokammersystemer
- regjeringsdannelse, koalisjoner og mindretallsregjeringer
- mistillit, kabinettspørsmål og oppløsningsrett
- vetospillere og beslutningskapasitet
- domstolskontroll og konstitusjonelle domstoler
- forholdet mellom utøvende og lovgivende makt
- demokratisk tilbakegang og institusjonell uthuling

Leveranse:

- 10 nye hooks
- 10 nye emner
- 6 nye institusjonsmetoder
- 10 nye emnemappinger med to produksjonsbaner hver
- 10 nye kilde- og metodeforankrede spørsmålsplaner
- utvidet permanent validator

## Fase 2 — Politisk teori og ideologier

**Status:** Fullført på arbeidsbranch i PR #3685; ordinær CI er sluttport før merge.

**Formål:** Bygge en eksplisitt normativ og ideologisk akse som skiller empirisk forklaring fra normativ begrunnelse.

Temaer:

- liberalisme, konservatisme og sosialisme
- sosialdemokrati og demokratisk sosialisme
- republikanisme og ikke-dominans
- feminisme og politisk likhet
- grønn politisk teori
- nasjonalisme og statsborgerskap
- populisme og folkebegrepet
- frihet, likhet, autoritet og legitimitet
- demokrati som normativt ideal
- sivil ulydighet og politisk forpliktelse

Leveranse:

- 10 nye hooks
- 10 nye emner i `em_pol_teorifordypning_*`
- 4 normative analysemetoder
- 10 emnemappinger med to argumentasjonsbaner hver
- 10 spørsmålsplaner med kilde, empirisk kontekst, normativt premiss, argument, motargument, konsekvens og avgrensning
- generatorkontrakt som forbyr å presentere normative påstander som empiriske fakta
- permanent fasevalidator

## Fase 3 — Norsk politikk, EU og flernivåstyring

**Status:** Neste fase etter at fase 2 er merget og kontrollert på `main`.

**Formål:** Gjøre pensumet direkte anvendelig på norske steder, institusjoner og politiske prosesser.

Temaer:

- Stortinget, regjeringen, departementene og komitésystemet
- mindretallsparlamentarisme og parlamentarisk kontroll
- partiorganisasjon og skillelinjer i Norge
- kommuner, fylkeskommuner og lokaldemokrati
- stat–kommune-relasjoner og flernivåstyring
- Sametinget, urfolkspolitikk og konsultasjonsordninger
- EØS, EU og europeisk integrasjon
- internasjonale regler i nasjonal og lokal gjennomføring
- norsk utenriks- og sikkerhetspolitikk
- korporatisme, trepartssamarbeid og organiserte interesser

Leveranse:

- 12–15 emner og hooks
- institusjonskart for norsk politikk
- kobling mellom steder, offentlige dokumenter og komparative spørsmål
- egne norske progresjons- og casekrav

## Kvalitetsporter

Hver fase skal bestå:

- canonical JSON-parsing
- referanseintegritet mellom fagkart, emner, metoder, mappinger, pensum og generator
- minimumskrav til mekanismer, distinksjoner, metoder og konkurrerende forklaringer
- `git diff --check`
- ordinære Data checks
- TypeScript typecheck og build guard
- ingen overlay eller midlertidige byggefiler ved merge

## Rekkefølge

Fase 1 og fase 2 er gjennomført sekvensielt. Fase 3 starter først etter at fase 2 er merget og sluttkontrollert på `main`, fordi den norske institusjons- og casearkitekturen skal bygge på både institusjons- og teorigrunnlaget.