# VG-huset — People-kandidatkontroll, fase 3

Dato: 2026-10-09 · Place: `vg_huset` · Hovedbadge: `media` · Status: **BLOCKED, ikke medlemssamling-PASS**.

## Kontroll mot faktisk canonical People-data

Kilden er `data/people/media/oslo/people_media_oslo.json`. Seks tidligere personer er knyttet til `vg_huset`. Ingen av de seks har personspesifikk treff i den eksisterende `data/people/people_image_attributions.json` (87 registreringer). Deres lokale `bilder/kort/people/*.PNG`-referanser er dermed **ikke dokumentasjon på klarert lisens/identitet eller medlemspreview**. Det er ikke kontrollert at filene faktisk eksisterer eller er visuelt egnet; ingen bildefil er erstattet.

| Person | Eksisterende relation | Funn og kilde | Fase-3-beslutning |
| --- | --- | --- | --- |
| `gard_steiro` | VG ansvarlig redaktør fra 2017 | VGs [offisielle kontaktside](https://www.vg.no/informasjon/kontakt-oss) lister ham som ansvarlig redaktør/adm. direktør og Akersgata 55 som besøksadresse. Samtidig er dette en **institusjons-/arbeidsadressekobling**, ikke bevis for hvert internt rom eller oppmøte. | **BLOCKED** inntil canonical People Profile, bildekilde og faktisk preview er kontrollert. |
| `torry_pedersen` | VGs tidligere ansvarlige redaktør | [Lokalhistoriewiki](https://lokalhistoriewiki.no/wiki/Verdens_Gang) oppgir ansvarlig redaktør 2011–2017, etter flyttingen til nr. 55 i 1994. Stedlig relasjon er plausibel gjennom dokumentert avisadresse, men mangler person-eid kilde- og bildepakke. | **BLOCKED** inntil person-eid claim og foto. |
| `bernt_olufsen` | VG-redaktør 1994–2011 | [Lokalhistoriewiki](https://lokalhistoriewiki.no/wiki/Verdens_Gang) oppgir hans redaktørperiode 1994–2011, mens VG allerede hadde etablert nr. 55. Eksakt tittel og periodisering i nåværende `desc` må behandles separat, ikke avledes fra et gammelt redaktørfoto. | **BLOCKED** inntil personprofil og foto er dokumentert. |
| `hanne_skartveit` | Politisk redaktør (nåværende ordlyd) | [VG 03.11.2023](https://www.vg.no/nyheter/i/BWLMXQ/hanne-skartveit-slutter-som-politisk-redaktoer-i-vg-jeg-velger-kjaerligheten) dokumenterer at hun sluttet som politisk redaktør og gikk til en fristilt redaktørstilling. Dagens `desc` er derfor foreldet i nåtidsform; VG har fortsatt en forfatterside, men ikke samme tittel. | **BLOCKED – konkret tekst- og kilderegresjon**, rett med kontrollert People Profile/claim og bildebevis, ikke stilltiende i Place-rekorden. |
| `trine_eilertsen` | Aftenpostens politiske redaktør fra 2014 | Eksisterende `trine_eilertsen.claims.json` knytter til Aftenpostens flytting til nr. 55 i 2014, men feltet `completion.fact_review` er `pending` og personstatus `legacy_unreviewed`. Det er ikke riktig å regne henne som ferdig bare fordi relasjonen finnes. | **BLOCKED** til fact review og bildeproveniens er godkjent. |
| `kare_valebrokk` | Primær `vg_huset`, `year:1980` | [VGs minneord «En journalistisk entreprenør»](https://www.vg.no/nyheter/i/6LppL/en-journalistisk-entreprenoer) viser Valebrokk i **det gamle VG-huset** sammen med Bernt Olufsen. Dagens hus er dokumentert oppført først i 1994. Generell tabloid-/VG-tilknytning er ikke tilstrekkelig til person–**nybygg**-kobling. Personen mangler også bilde. | **AVVIS SOM AKTUELL VG-HUSET-MEDLEM**. Egen retting må finne korrekt historisk primæranker eller lovlig modell for person uten feilaktig sted. Ikke gi ham `PASS` her. |

## Metode og avgrensning

- Bindende kontrakter: `docs/people-of-places-method.md`, `docs/PEOPLE_PROFILE_CANONICAL.md`, `docs/PEOPLE_IMAGES.md`, `data/places/README_place_rounds.md`.
- Ingen av disse kan opptas i `place_card_profile.collection_ids` før minst én relevant person har ferdig kilde-/profilreview **og** lokalt, lovlig, lastbart portrett med identitets- og rettighetsproveniens.
- Personen skal være knyttet til det fysiske stedet i rett periode. VGs grunnleggelse i Akersgata 34 er ikke automatisk VG-huset fra 1994.
- Behold eksisterende People-filer uendret i denne kandidaten-auditen. De skal korrigeres gjennom egen kontrollert People-produksjon, ikke ved å fjerne relasjoner og etterlate ugyldige tomme `places`-arrays.

**Faseavgjørelse:** People er en reell kandidatsamling, men **BLOCKED**. Neste arbeid er retting av Valebrokks historiske anker, Skartveits utdaterte nåtidstittel og kilde-/bildeproveniens for høyt prioriterte representanter. Images/Objects/Brands/Productions, QuizCard og endelig PlaceCard følger etter dette. Ingen ferdigstatus eller merge.

## Fase 3A – korrigerende datamerge 2026-10-09

**Endringene gjelder fem manglende bildebaner og én utdatert personbeskrivelse. Samlingen er fortsatt BLOCKED.**

- Direkte GitHub-filoppslag for `bilder/kort/people/{torry_pedersen,gard_steiro,hanne_skartveit,bernt_olufsen,trine_eilertsen}.PNG` ga 404. Navnelisten for både `bilder/kort/people/` (151 filer) og `bilder/people/` (29 filer) har ingen tilsvarende fil. Dette bekrefter et faktisk runtime-manglende asset, ikke bare en ufullstendig attribusjonsregistrering.
- For disse fem personene er `image` og `cardImage` derfor satt til tom streng i canonical `data/people/media/oslo/people_media_oslo.json`, slik at appen kan bruke sin eksisterende initial-/placeholdermekanisme fremfor å be nettleseren laste bilder som ikke finnes. **Ingen nye portretter eller lisenser er laget eller godkjent.**
- `hanne_skartveit` er korrigert til politisk redaktør **2009–2023**, deretter overgang til fristilt redaktørstilling i november 2023. `year` ble satt til kildebelagt **2009** i stedet for **2014**. [VGs eget intervju 3. november 2023](https://www.vg.no/nyheter/i/BWLMXQ/hanne-skartveit-slutter-som-politisk-redaktoer-i-vg-jeg-velger-kjaerligheten) gir datoene. [VGs besøksadresse](https://www.vg.no/informasjon/kontakt-oss) begrunner organisasjonsankeret, men er ikke bevis for hvilket fysisk kontor Skartveit satt på.
- Ny source-/field-/sentence-mappet claimbank: `data/people/claims/media/oslo/redaksjoner/hanne_skartveit.claims.json`, `3/3` verified claims. Profilen har status `blocked_insufficient_sources` inntil portrett/proveniens og ferdig People-presentasjon er godkjent; ingen `ready_people_v1` erklæres.
- Kåre Valebrokk og øvrige kandidaters uavklarte historiske stedskoblinger er ikke forsøkt «fikset» med tilfeldig anker. Eksisterende plassreferanse beholdes under **BLOCKED** til korrekt fysisk sted er dokumentert.

Den siste ferdigstatusen krever separate godkjente People-portretter og faktisk PlaceCard-medlems-/popup-QA. Ingen samlingsreferanse er materialisert på dette grunnlaget.

## Fase 3B – runtime og lisensierte portrettkandidater

- `npm run audit:people-profile-canonical`: **PASS**, 102 claimfiler; syv People Profile-tester **PASS**; `npm run audit:people-of-places`: **PASS**, ingen ugyldige place-ID-er.
- `npm run place-open:build` og `npm run place-open:check` er begge gjennomført. Kun `data/runtime/people-all/part-004.json`, `data/runtime/place-open/vg_huset.json` og de to avledede `reports/people-of-places-status.*` ble committet i runtime-synken. Alle 1 533 Place-open-payloads kontrollerte deterministisk.
- Den **globale** bildeauditens feil er registrert separat: 263 manglende lokale bilder, 303 bildereferanser uten `imageMeta`, ett ukjent/ikke-tillatt lisensobjekt og én kollisjon. Dette er et bredere, eksisterende datagjeldsspørsmål; **ingen PASS for VG-husets portretter er utledet fra at øvrige People-tester består**.
- [Målrettet bildekandidatkjøring #37988680751](https://github.com/Paradispartiet/History-Go/actions/runs/37988680751) returnerte **seks Commons-kandidater for to personer**, null oppslagsfeil, og alle med `approved: false`. Hele kandidatfilen er lagret som [GitHub Actions-artifact #11643838314](https://github.com/Paradispartiet/History-Go/actions/runs/37988680751/artifacts/11643838314), ikke slått sammen i global `people_image_candidates.json`.
- **Gard Steiro:** sterkt identitetsmerket `NMD 2019 toppmøtet 2019 13 (46893491935) (cropped).jpg`, Thor Brødreskift / Nordiske Mediedager, CC BY-SA 2.0, kandidat-ID `gard_steiro__nmd_2019_toppm_tet_2019_13_46893491935_cropped_jpg`. To andre gruppemotiver fikk bare `identity.status: review` og må ikke velges som portrett uten bilde-/identitetskontroll.
- **Hanne Skartveit:** sterkt identitetsmerket `Hanne Skartveit 0002.jpg`, Bjørn Erik Pedersen, CC BY 2.5, kandidat-ID `hanne_skartveit__hanne_skartveit_0002_jpg`. Commons-originalen dokumenterer fotograf/identitet/lisens og 2009-dato. De to andre kandidatene er `identity.status: review`.
- **Ikke ferdigstilt:** Ingen av kandidatene er `approved: true`, nedlastet, materialisert eller koblet til People. Det gjenstår eksplisitt godkjenning av faktisk bildemotiv og lisens, standard `people:images:apply`/re-audit, samt full PlaceCard-/popup-QA før People `PASS`.

Dette endrer ikke forrige beslutning om Kåre Valebrokks udokumenterte direkte kobling til nybygget, og ingen samling er aktivert.

## Fase 3C – to source-reviewed People-profiler og faktiske portretter

**Dato:** 2026-10-09. **Delstatus:** Gard Steiro og Hanne Skartveit har fått canonical `ready_people_v1`; hele People-samlingen for VG-huset er fortsatt **BLOCKED**.

- **Gard Steiro:** Originalt Commons-fotografi fra Nordiske Mediedager 2019, Thor Brødreskift / Nordiske Mediedager, **CC BY-SA 2.0**, 2020 × 2676 piksler. Lokal fil `bilder/kort/people/gard_steiro.jpg`, `image` og `cardImage` peker til denne. Canonical kilde-/setningsbank: `data/people/claims/media/oslo/redaksjoner/gard_steiro.claims.json` med **6/6 verified**. VGs ledelses-/kontaktside og SNL bekrefter tiltredelse januar 2017 og tidligere redaktørperioder. `profileStatus: ready_people_v1`.
- **Hanne Skartveit:** Originalt Commons-fotografi tatt ved Litteraturhuset i 2009 av Bjørn Erik Pedersen, **CC BY 2.5**, 2128 × 2040 piksler. Lokal fil `bilder/kort/people/hanne_skartveit.jpg` og samme `image`/`cardImage`. Canonical profilbank `data/people/claims/media/oslo/redaksjoner/hanne_skartveit.claims.json`, nå **4/4 verified**, inkludert fotograf-/lisenserklæring. Politisk redaktør i VG 2009–2023; overgang til fristilt redaktørstilling i 2023. `profileStatus: ready_people_v1`.
- Begge bildefiler er importert fra de godkjente Commons-originalene gjennom den eksisterende People-image-pipelinen, ikke generert eller rekonstruert. `data/people/people_image_attributions.json` har fotograf/kreditering og lisenslenke; `data/people/people_image_candidates.json` bevarer de andre 22 kandidatene.
- Kontrollert faktisk fil og pikselstørrelse, `imageMeta`, provenance og attribusjonsregistrering under [original-apply #37989536057](https://github.com/Paradispartiet/History-Go/actions/runs/37989536057) (**PASS**). Etter at begge profilene fikk `ready_people_v1`, bestod [People v1 final sync #37989908725](https://github.com/Paradispartiet/History-Go/actions/runs/37989908725) (**PASS**) med People Profile Canonical, regresjonstester, People-of-Places og deterministisk `place-open:check`.
- De midlertidige bilde- og QA-workflowene er fjernet fra PR. Avledede `people-all`-sharder (004–006), VG-place-open og People-attribusjon/statusrapporter er synkronisert.

### Avgrensning som fortsatt blokkerer PlaceCard People-samling

- **Torry Pedersen, Bernt Olufsen og Trine Eilertsen** har ennå ikke ferdige lisensierte portretter/profil-review for VG-husets PlaceCard; eksisterende ugyldige bildefilreferanser er fjernet, ikke erstattet med generiske bilder.
- **Kåre Valebrokk:** feilaktig direkte tilknytning til dagens VG-hus er dokumentert, men korrekt canonical primæranker må kontrolleres før en relasjonsendring.
- People-samlingen skal **ikke** settes `PASS` eller aktiveres som full samling før kvalifiserte medlemmer og faktiske popuper/rettigheter er gjennomgått samlet. Enkeltpersoners `ready_people_v1` er ikke PlaceCard-final-QA.

Neste fase: faktisk full PlaceCard-samlingsaudit for People, Objects, Brands og Media/Productions; separat QuizCard og slutt-QA.
