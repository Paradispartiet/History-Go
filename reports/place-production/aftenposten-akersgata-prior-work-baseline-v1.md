# Aftenposten – Akersgata 51: tidligere arbeid og statisk utgangspunkt

Dato: 2026-10-08
Place: `aftenposten_akersgata`
Repository: `Paradispartiet/History-Go`
Kontrollert main: `6a76914f103c755bcd4a681dec711430fa887105`
Status: innledende audit; stedet er ikke fullprodusert.

## Avgrensning og valg

Aftenposten – Akersgata 51 er valgt som neste sted i dette arbeidsløpet etter Klassekampen. Valget er en prioritering i arbeidsløpet, ikke en påstand om en vedtatt repository-kø. VG-huset, NRK-huset og Dagbladets Akersgata-sted ble også lest før valget.

Canonical kilde er `data/places/media/oslo/places_oslo_media/aftenposten_akersgata.json`, registrert gjennom `data/places/manifest.json`. Identiteten i eksisterende godkjente data er Aftenpostens historiske hovedadresse Akersgata 51 i perioden 1876–2003. Nummer 49 og dagens nummer 55 har separate canonicale eiere; dette stedet skal ikke erstatte dem eller hele Akersgata.

Denne rapporten dokumenterer repository-tilstanden. Historiske kilder er ikke åpnet og kontrollert på nytt i denne auditen. Ingen produksjonsprofil, samlingsmedlemmer eller endelig innholdsplan er bekreftet.

## Tidligere-arbeid-gate

Søk omfattet `aftenposten_akersgata`, Aftenposten, Akersgata 51 og quizhistorikk; kildefilens commit-historikk og tilknyttede PR-er ble også lest. Connectorens PR-søk returnerte enkelte irrelevante treff; bare individuelt verifiserte PR-er brukes som mergebevis.

| Del | Siste identifiserte godkjente tilstand | Kontroll mot låst main | Beslutning |
| --- | --- | --- | --- |
| Koordinat og historisk anker | Merget [PR #3198](https://github.com/Paradispartiet/History-Go/pull/3198), merge `3ef91faa1f9b8e9d64ca61e2f46f778ccab8836b` | `lat`, `lon`, `r`, `coordStatus`, `coordRole`, `coordType`, `coordSourceId` og `sourceObjectId` er identiske med mergeversjonen. Evidensfil finnes. | ALLEREDE FERDIG som eksisterende koordinatleveranse. Ingen konkret regresjon funnet; ingen ny geokoding. |
| desc og popupDesc | Merget [PR #4253](https://github.com/Paradispartiet/History-Go/pull/4253), merge `e86fad822ceced7c446a3d684de8cd9888c24237` | Hele parsed place-objektet ved merge er identisk med dagens kildefil, inkludert begge tekstfeltene. | ALLEREDE FERDIG som tidligere tekstleveranse. Dagens fullproduksjonskrav må vurderes separat; paritet er ikke en ny factuality-godkjenning. |
| Eget fagverk og fullproduksjonsgrunnlag | Ingen `fagverk`- eller `place_card_profile`-blokk i dagens place-kilde. Ingen `aftenposten_akersgata.json` blant 183 entries i `data/places/production/`. | Dette er direkte kontroll av eksisterende source og produksjonskatalog, ikke konklusjon om alt eldre fagstoff. | REELT NYTT ARBEID for manglende Place-eid struktur og produksjonsgrunnlag. Kilder må gjennomgås før innhold bestemmes. |

Koordinatevidens: `data/coordinate-evidence/oslo/media/aftenposten_akersgata.json`. Evidensfilens eldre `coordinateDecision: do_not_change_coordinates_yet` må leses sammen med `evidenceStatus: applied_to_place`, `currentCoordinate.coordStatus: verified_historical_source` og beslutningens `canBecomeVerified: true`. Det eldre feltet alene beviser ikke en koordinatregresjon.

Andre identifiserte historikkspor som må kontrolleres ved aktuell subsystemfase:

- [#559](https://github.com/Paradispartiet/History-Go/pull/559): leksikon og Wonderkammer-pakke.
- [#597](https://github.com/Paradispartiet/History-Go/pull/597): Wonderkammer-previewkoblinger.
- [#537](https://github.com/Paradispartiet/History-Go/pull/537): personer og stedsankre.
- [#876](https://github.com/Paradispartiet/History-Go/pull/876) og [#892](https://github.com/Paradispartiet/History-Go/pull/892): Story-fil og manifestregistrering.
- Quizcommit [4784f95](https://github.com/Paradispartiet/History-Go/commit/4784f95f0046002ae019f1aac8259c797dcd7686): eksisterende quizsett.
- [#4536](https://github.com/Paradispartiet/History-Go/pull/4536): Historie-evidens med Aftenposten-case.
- [#4786](https://github.com/Paradispartiet/History-Go/pull/4786): Aftenposten som case i Media-fagverket. Dette erstatter ikke en Place-eid `fagverk`-blokk.
- [#705](https://github.com/Paradispartiet/History-Go/pull/705) og [#710](https://github.com/Paradispartiet/History-Go/pull/710): tidligere Lesespor-opprydding av betalingslåst materiale.

Disse søketreffene er historikkspor, ikke nye attestasjoner om hver PRs merge, faglige kvalitet eller dagens kontraktsoppfyllelse. Ingen av disse subsystemene omskrives i denne leveransen.

## Statisk utgangspunkt

Runtime er lest fra `data/runtime/place-open/aftenposten_akersgata.json`. Quiz er lest i sin helhet fra `data/quiz/media/aftenposten_akersgata_sets.json`.

| Flate | Observasjon ved låst main | Videre kontroll |
| --- | --- | --- |
| Hovedbadge | `media`, canonical Medier-badge og routing lest | Behold identiteten; bruk badge som researchruting. |
| Underbadges | `underbadge_ids` mangler i kildefilen | `aviser`, `journalistikk` og `mediehus_og_redaksjoner` er mulige researchspor, ikke vedtatt utvalg. |
| Fagverk | Place-kilden mangler egen `fagverk`-blokk | Undersøk eksisterende fag-/Historie-evidens før ny Place-eid substans. Nettleserflaten er ikke vurdert. |
| Bilde og PlaceCard | `image`, `frontImage` og `place_card_profile` mangler i kildefilen | Asset-register, tidligere bilder og hele QuizCard-resolveren må auditeres før nye assets opprettes. Manglende source-felt beviser ikke at ingen fil finnes. |
| Quiz | 6 sett × 3 spørsmål = 18; alle 18 har `answerIndex: 0`. Flere spørsmål bruker intern Story-data, generatorregel eller holdbackregel som grunnlag. | Bevar som baseline; gjennomfør egen tidligere-arbeid-gate, ekstern kildekontroll, plausibel distraktorreview og adaptiv produksjonsplan før eventuell revisjon. |
| Leksikon | 4 runtime-entries; alle har tom `sources[]` | Andre kildefelt kan finnes. Tom liste alene beviser ikke fullstendig kildefravær; claim-/kildeaudit gjenstår. |
| People | 3 runtime-personer: `trine_eilertsen`, `harald_stanghelle`, `per_egil_hegge` | Kontroller konkret fysisk tilknytning og tidsdekning til nummer 51-perioden per person før endring. Ingen relasjon er avvist her. |
| Stories | 1 runtime-Story: `st_aftenposten_akersgata_schibsted_presseakse_1860`, år 1860 | Skill institusjonsstart fra stedet som begynner i 1876; vurder narrativ og fysisk forankring selvstendig. Årsforskjellen alene er ikke ugyldighetsbevis. |
| Wonderkammer | 1 top-level runtime-record og 3 `connections_preview`-ID-er i place-kilden | Bevar og inspiser innholdet; top-level-antallet er ikke antall kamre eller kvalifiserte Objects. |
| Språk | Runtime `language: null`; ingen textual place-ID-match i lest språkmanifest | Stedsspesifikt navne-/begrepsspor må researches. Dette enkeltstedet får ikke automatisk eierskap til områdedialekt. |
| Brands, relasjoner og Lesespor | Runtime-arrayene er tomme | Dette er datatilstand, aldri grunnlag alene for begrunnet N/A. |
| Chronology/epoke, før/etter og nyheter | Ikke ferdig undersøkt i denne auditen | Søk eksisterende canonicale eiere og historikk før research og materialisering. |
| Produksjonsstatus | Ingen bekreftet produksjonsprofil eller slutt-QA | Stedet har ingen fullproduksjons-PASS i denne rapporten. |

## Neste konkrete fase

Utfør stedsspesifikk source review for den eksisterende Akersgata 51-identiteten, med gjenbrukskontroll av Media- og Historie-evidensen. Dokumenter påstand → kilde → sourceLocation og tidsavgrensning. Deretter kan underbadges og produksjonsprofil bekreftes og endelig innholdsplan bestemmes i canonical rekkefølge.

Før fullproduksjon må alle gjeldende READ-FIRST-filer være lest i sin helhet og helperen `scripts/place-production-rule-preflight.mjs` registrere ekte regelhash-bevis i aktuelt workcard. Denne rapporten er ikke et V3-workcard, en håndlaget hashattestasjon eller en erstatning for source review.

## Kontroller og begrensninger

Utført: låst main-ref kontrollert på nytt; tidligere koordinat- og tekst-PR-er individuelt kontrollert som merget; sourceparitet kontrollert programmessig; manifest/source, koordinatbevis, runtime og alle quizspørsmål lest; produksjonskatalog inspisert.

Dette er en dokumentasjonsendring. Ingen canonical place-, quiz-, people-, Story-, asset- eller genererte runtimefiler endres. Det er ikke kjørt lokale produksjonskommandoer, browser-QA eller ny factuality-review. PR-CI må leses separat; eksisterende grønn CI fra Klassekampen brukes ikke som testbevis for Aftenposten.

## Kvalitetsvurdering av rapporten

Vurderingen gjelder denne innledende, statiske rapporten, ikke stedsproduksjonen.

| Dimensjon | Score | Evidens |
| --- | --- | --- |
| Korrekthet og evidens | 5/5 | Låst ref, konkrete filbaner, verifisert merge og direkte felt-/objektparitet. |
| Dekning og ferdigstillelse | 4/5 | Tidligere koordinat/tekst og innledende datautgangspunkt dekket; øvrige subsystemgater er eksplisitt åpne. |
| Faglig/redaksjonell kvalitet | 4/5 | Skiller historisk adresse, institusjon, runtimefunn og uavklarte kandidater uten filler eller nye historieclaims. |
| Teknisk integritet | 5/5 | Ren rapport; ingen runtime- eller sourceendring. Kjørbar place-/browseraudit hevdes ikke. |
| Sikkerhet og ansvarlighet | 5/5 | Ingen personrelasjon fjernet uten evidens; ingen N/A utledet fra tomme arrays eller ny kildeattestasjon. |
| Vedlikeholdbarhet og etterprøvbarhet | 5/5 | Fast base-SHA, eksplisitte historikklenker, filbaner og avgrenset neste fase. |

Sum: 28/30 for rapportens avgrensede scope. Aftenposten-stedet forblir uferdig.
