# Glads mølle og Vaterlands historiske elveløp — tekstleveranse 20. oktober 2026

Base: `10c25734f75321d112eeeb22c5d269b5392695cd` (main). Branch: `production/glads-molle-vaterland-history-20261020`.

## Scope og nullmåling

Dette er en avgrenset historisk tekst- og kildeleveranse etter v4.2.1. Begge canonicale Places, bilder, QuizCards og quizfiler fantes. Ingen av stedene hadde en v4.2-pakke eller Historie-produksjonsrapport. Glads mølle hadde en kort saklig tekst med utilstrekkelig sporbarhet; Vaterlands popup inneholdt intern representasjonsprosa i stedet for en historisk artikkel. Oversettelsene på en/es/pt hadde gammel generisk spillprosa og omtalte mølleøkonomi som matforsyning uten skille fra papirproduksjon.

Hovedbadge er `historie` for begge. Glads aktive underbadges prioriterer papirproduksjon, energi, eierskap og bevaring; Vaterlands prioriterer elvekontakt, sanering, sosialt byrom og endring av gatenettet. Alle aktive underbadge-ID-er finnes i historie.json. Etter kildelesing er planen avgrenset til tekst, kildepakker, historiske emnekoblinger, Historie-case, oversettelser og avledet runtime/tidslinje. Ingen confirmed fullproduksjonsprofil eller nye PlaceCard-samlinger opprettes. Bildestatus, quizstatus og `v3_complete: false` beholdes. Leveransen er ikke vFerdig eller godkjenning av samtlige legacy-felt.

Own-place-grenser: Glads mølle er bygningen Sandakerveien 10A, ikke Bentse Brug eller Hjula-anlegget. Vaterland-oppføringen er elvestrekningen fra broområdet mot fjorden, ikke hele bydelen eller Vaterlandsparken. Koordinater og ankerdata er uendret.

## Kilder og redaksjonell kontroll

Begge artiklene er lest i sin helhet mot de åpnete eksterne kildene. `data/places/production/<id>.json` eier claim-ID-er, konkrete kildeplasseringer, setningsdekning, teksthash og separate fakta-/språkreviews. Historie-rapportene eier avgrensede case, aktører, kildesammenligning og tolkningsgrenser. De historiske fagregistrene ble undersøkt for eksisterende stedsevidens; ingen treff for disse ID-ene ble brukt som erstatning for ekstern dokumentasjon.

- Glads mølle: 18 verifiserte claims. Oslo byleksikon dokumenterer eierskap, bruk, fredning og restaurering; Norsk Teknisk Museum og Oslo Museum dokumenterer papirhåndverket og bekrefter eldste bevarte fabrikkbygning langs Akerselva. Lokalhistoriewiki viser til byleksikonet og telles ikke som uavhengig bevis. Kommunens omtale fra 2020 brukes som historisk bevaringskontekst, ikke som oppdatert leietakerregister.
- Vaterland: 17 verifiserte claims. Byleksikonets elve-, gate- og bydelsartikler sammenholdes med Akerselvas Venner og Bymiljøetatens aktuelle kulvertside. Den siste dokumenterer betinget båtferdsel og oppgraderingen i 2023. Ingen åpning av elva presenteres som gjennomført.
- 20 faktaspørsmål med fasit og claim-lenker finnes som kandidater. Ingen nye quizsett eller fasiter aktiveres.
- Seks oversettelser er omskrevet fra den norske teksten og kontrollert for samme navn, tidsrom og begrensninger; `_sourceHash` er beregnet fra canonical navn/desc/popupDesc.

Avviste detaljer: kulvertlengden spriker mellom kildene (430 og om lag 600 meter), og kildene daterer revne broer ulikt. Lengde og eksakte rivningsår utelates. Bortreguleringen av Elvegata i 1989 er ikke likestilt med alle rivningsdatoer. Glads papirdrift avsluttes i 1870-årene, ikke et oppdiktet eksakt 1875. Grammofonplateproduksjon oppgis som før 1958, ikke et oppdiktet 1950. Hjulas overtakelse i 1880 skilles fra eksakt installasjonsdato for kraftutstyret.

## Verifisering

- `node scripts/validate-place-description-production-v4_2_policy.mjs --all`: 217 pakker, 206 ready, 0 blokkerende feil. Ordtall behandles etter den canonicale stoffstyrte policyen.
- Direkte `validateHistoriePlaceReport` for begge nye rapporter: 0 feil. Historiske emne-ID-er kontrolleres mot canonical emnefil.
- `node --test tests/epoke-place-index.test.mjs tests/epoker-runtime-place-index.test.mjs tests/epoke-viewer.test.mjs`: 38/38 bestått etter at lokal checkout fikk testavhengigheter og de eksisterende Fiskehallen-bildene. Første forsøk hadde kun manglende lokale filer/moduler; ingen testkrav ble svekket.
- `node scripts/build-epoke-place-index.mjs --check` og `node scripts/build-place-open-payloads.mjs --check`: i sync. Places-index er regenerert fra den uendrede canonicale byggeren; diffen gjelder bare de to ingressene.
- Alle seks oversettelseshashene og begge index-ingressene er kontrollert med assertions.
- `git diff --check`: bestått. Begge artikler, kildepakker, Historie-case og oversettelser er gjennomgått, ikke bare et utvalg.
- Ingen layout- eller runtimekode er endret. Dette er ikke en ny visuell fullproduksjonskontroll eller ny godkjenning av eksisterende quiz- og bildeflater.

## Seksdelt kvalitetsvurdering av tekstbolken

| Dimensjon | Score | Evidens / grense |
| --- | --- | --- |
| Korrekthet og evidens | 5/5 | 35 claims, setningsdekning, kildeplasseringer og eksplisitt holdback av motstridende opplysninger. |
| Dekning og ferdigstillelse | 4/5 | Begge avtalte tekst- og kildeleveranser, seks oversettelser og avledninger dekket; ingen påstand om full stedsproduksjon. |
| Faglig/redaksjonell kvalitet | 5/5 | Papirhåndverk, eierskap og vern skilles fra Vaterlands elvegater, båthavn og overdekking; ingen generisk spillprosa. |
| Teknisk integritet | 4/5 | Beskrivelsesvalidator, begge Historie-rapporter, 38 tidslinjetester, runtime- og hashkontroll; ingen ny nettleserregresjon av uendrede flater. |
| Sikkerhet og ansvarlighet | 5/5 | Dagens båtferdsel er betinget av vannføring; ingen påstand om fri adgang, dagens leietakere eller garantert trygg gjennomfart. |
| Vedlikeholdbarhet og etterprøvbarhet | 5/5 | Stabile claims, kildeplasseringer, schemaer, hash og deterministisk materialisering; ingen regel- eller systemendring. |

Totalt **28/30**, ingen uløste blokkere innen tekstleveransens scope. Automatiske kontroller beviser struktur og paritet; faktavurderingen bygger på separat manuell kildelesing.

## Leste obligatoriske regelfiler (SHA-256 på basen)

De gjeldende filene ble lest før innholdsplanen ble bestemt. Dette er lesebevis for den avgrensede tekstbolken, ikke et generert fullprofil-workcard eller en ny fullproduksjonsgodkjenning.

- `docs/PLACE_PRODUCTION_CHECKLIST.md`: `57da7fb09cb23bb55133bcd6639fa5d3e2c7fd8b912ab3e1398dbcbe80b4f1d8`
- `docs/PLACE_PRODUCTION_CHECKLIST_REFERENCE_V1.md`: `2fba6e0e7e6747b6c95266c57ca875ce7b6b2bfbe5e9e1abac79c02ad35aee0d`
- `docs/PLACE_PRODUCTION_PROFILES.md`: `b42bb5cc086737acc0046d8d871c54f10b2b7fdf1d56cf0a447b02b9227feb8b`
- `data/places/README_place_rounds.md`: `9e7eb88f4c701b8588473e63bb03697762f3c178df7716acdc12a16d406c4525`
- `data/badges/index.json`: `7a796a0902c6ec0f651241d062363f2dfd8a196e9eebfc78baf960e4f507fdbf`
- `data/badges/place_production_routing_v1.json`: `97e1b78c1797a5194492ef16a66f3c9d3d5b543c093a35962fd60bbb7be3d721`
- `data/badges/historie.json`: `f33595ccbd1bf21e2cb5048a855d1077e29be8b2cde95decd2ff6ccbed010b9c`
- `docs/PLACE_OBJECTS_CANONICAL.md`: `ccc3f438c8c235d9b60c9d0280a215c1862220b1988a4f6a7bca7060b53c1799`
- `data/brands/brand_rules_v1_1.json`: `c8009c5f872560c46a164d3399e193cd7fd33d80ecb70f37496f8ad1b89b786a`
