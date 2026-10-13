# Det Norske Teatret – scenehistorie og claims (C6)

Dato: 13. oktober 2026. Kildebase: `5d8c1e3d30b1568dc7ef90b63ccacfad231394a1` (C5 merget). Replay-base: `840d2dc513dc5157c38637f9797cb9b32586b115` etter rapportsynkroniseringen i PR #6305.
Omfang: fem eksisterende manifestlastede People-profiler: Bjørn Sundquist, Bjørn Floberg, Iren Reppen, Rut Tellefsen og Tom Tellefsen. Ingen nye personer eller stedskoblinger.

## Aktivt checkpoint og regelgrunnlag

C6 viderefører den avgrensede historiske tekstkontrollen. Canonical Place er fortsatt `scenekunst`, med underbadges `teater`, `musikkteater`, `sceneproduksjon` og `dramaturgi`. People-filenes eldre kategori `musikk` er beholdt; en kategori-/metadata-migrering er ikke del av denne PR-en.

Gjeldende filer er hentet og inspisert før profilutvalg: AGENTS.md, PLACE_PRODUCTION_CHECKLIST, PLACE_PRODUCTION_CHECKLIST_REFERENCE_V1, PLACE_PRODUCTION_PROFILES, README_place_rounds, badge-index/routing, `data/badges/scenekunst.json`, PLACE_OBJECTS_CANONICAL, Brand-reglene, PEOPLE_PROFILE_CANONICAL, people-of-places-method, FACTUALITY_CONTRACT og PEOPLE_IMAGES. C6 endrer ikke Place, samlingsvalg eller fullproduksjonsstatus. Det eksisterende baseline-snapshotet beholdes.

## Dokumentert scenehistorie

| Person | Kildespor i revidert popup |
|---|---|
| Bjørn Sundquist | Debut i Johann utan land 1972, DNT fram til 1989, Nationaltheatret 1990–1996, Mosca i Volpone på Scene 2 i 1988 og tittelrollen i Onkel Vanja på samme scene i 1997. |
| Bjørn Floberg | Mick i Vaktmester'n 1974 og Molière 1980 før dagens hus; Volpone 1988, McMurphy 1992, Jean 1993 og Astrov i Onkel Vanja på Scene 2 i 1997. |
| Iren Reppen | DNT-ansettelse 1992, Irina 1993, Cressida på Hovudscenen 1994, Hedda 1996, Laura Isaksen i Bør Børson jr. 2001; teatersjef i Hålogaland 2009–2012; Oskepotts mor/Bestemor i Into the Woods på Hovudscenen 2022. |
| Rut Tellefsen | Cathrine i Frakt under havet 1956; SNLs debut-/ansettelsesopplysninger; Kristin i Korset 1963 på Hovudscenen i Stortingsgata 16; senere teaterarbeid og etablering av Telemark Teater. FORESTs oppføringer fra 1955 er uttrykkelig skilt fra SNLs debutår. |
| Tom Tellefsen | DNT-ansettelse 1960–2001; SNLs debutår 1959 og FORESTs smårolle i Dunungen 1957 oppgis som forskjellige kilderegistreringer; Willie 1986, Shylock 1991; skuespiller og medregissør ved nypremieren i Prøvesalen 21. mars 1996. |

Primærregistrene [Volpone 1988](https://forest.detnorsketeatret.no/produksjon/volpone-1988), [Onkel Vanja 1997](https://forest.detnorsketeatret.no/produksjon/onkel-vanja-1997), [Troilus og Cressida 1994](https://forest.detnorsketeatret.no/produksjon/troilus-og-cressida-19940820), [Bør Børson jr. 2001](https://forest.detnorsketeatret.no/produksjon/bor-borson-jr-20011013), [Into the Woods 2022](https://forest.detnorsketeatret.no/produksjon/into-the-woods-20220402), [Korset 1963](https://forest.detnorsketeatret.no/produksjon/kristin-lavransdatter--korset-19630920) og [Ein sørgjeleg time 1996](https://forest.detnorsketeatret.no/produksjon/ein-sorgjeleg-time-med-tom-tellefsen-kanskje-to-19960321) er åpnet og lest. Personregistrene og SNL-biografiene er koblet direkte i hver profil og claims-fil. [Teatrets husoversikt](https://www.detnorsketeatret.no/bakgrunnsartiklar/eit-eige-hus) støtter adresse-/husavgrensningen.

## Claims og ærlig status

Fem nye `history_go_people_claims_v1`-filer gir mapping av **26/26 reviderte popupsetninger**. Når én setning kombinerer biografi, dato og spillested, er tilleggskildene egne claims. Faktakontrollen av disse popupsetningene er gjennomført; redaksjonell kontroll fant ingen generisk ankerprosa eller gjenbrukte hele setninger over åtte ord.

Dette er fortsatt et **avgrenset scenehistorisk kildepass**, ikke full `ready_people_v1`-sertifisering av fem komplette legacy-profiler. `profileStatus` og claims-completion er `needs_research`; fullprofilens `fact_review` står derfor `pending`. Eldre korte ingress-/år-/tag-/kategorifelt er ikke oppgradert til full faktagodkjenning.

Særlig Flobergs eldre `desc` og `year:1972` trenger egen avklaring: FOREST dokumenterer rolle i januar 1973, SNL beskriver tilknytning etter skoleslutt i 1974, mens andre biografier oppgir 1972. C6 gjentar ikke 1972 som sikker ny popupopplysning og mapper ikke den eldre ingressen som verifisert. Rut og Toms debutår må fortsatt skilles fra tidligere arkivoppføringer. Reppens uendrede ingress bruker «teaterleder»; denne brede yrkesetiketten er ikke mappet som en påstand om et nåværende lederverv.

## Dataparitet og avgrensning

- Fem kildeposter matcher sine eksisterende runtime-poster før redigering.
- Alle **1 434 unike People-ID-er** er bevart, i samme rekkefølge.
- Alle **87 DNT-koblinger** er bevart; hver revidert profil har bare DNT i sitt eksisterende `places`.
- Runtime-sharding bruker generatorens stabile nøkkelsortering og **240 000 UTF-8-bytegrense**. Regenerering av baseline-snapshotet ga eksakt byteparitet før nye poster ble satt inn.
- `id`, `name`, `initials`, `desc`, `year`, `tags`, `category`, `placeId`, `places`, `image` og `cardImage` er kontrollert uendret.
- Bare de fem profilene, fem claims-filer, berørte People-shards, DNT place-open, de to avledede readiness-rapportene og dette notatet inngår i sluttdiffen.
- Ingen portretter, produksjonsbilder eller gjenstander importeres. Forestillinger-samlingen materialiseres ikke av denne PR-en.

## Utført lokal kontroll

`node tools/audit-people-profile-canonical.mjs --require-claims` i avgrenset checkout: **PASS, fem claims-filer**. Dette er ikke en lokal fullrepo-audit.
Generatorens shardingfunksjoner brukt mot komplette eksisterende People-runtime-snapshots: **PASS** for baseline-byteparitet, 1 434 unike ID-er, beskyttede felt og DNT-kildeparitet.
Separat setningskontroll med validatorens `splitSentences`: **PASS, 26 popupsetninger mappet**, ingen dupliserte setninger eller intern ankerprosa.
Fullrepo-audit, Civication-indeksparitet og øvrige CI-porter verifiseres på eksakt PR-head før merge. Nettleser- eller livegodkjenning hevdes ikke av de lokale kontrollene.

## Seksdelt kvalitetsvurdering – avgrenset C6-leveranse

| Dimensjon | Score | Evidens |
|---|---:|---|
| Korrekthet og evidens | 4/5 | Reviderte 26 popupsetninger inspisert mot kilder; eldre metadata tydelig holdt utenfor godkjenning. |
| Dekning og ferdigstillelse | 4/5 | Fem avtalte scenehistoriske tekster, kilder og claims; fullprofil og portretter fortsatt åpne. |
| Faglig/redaksjonell kvalitet | 4/5 | Konkrete roller, datoer og husgrenser; selvstendig prosa og ingen intern ankertekst. |
| Teknisk integritet | 5/5 etter grønn CI | Lokale paritetskontroller består; endelig score er betinget av fullrepo-CI på eksakt head. |
| Sikkerhet og ansvarlighet | 5/5 | Offentlig profesjonelt virke; ingen privatlivsinnsamling eller uavklarte medieimporter. |
| Etterprøvbarhet | 5/5 | Egne claims-filer, setningsmapping, direkte kilder og deterministisk runtime. |

**27/30 etter grønn CI.** Vurderingen gjelder bare den avgrensede C6-tekstleveransen. Ingen complete-/ready-status for hele People-profilene eller stedspakken.

## Fremdrift og neste port

C1–C5 omfatter 37 ulike scenehistorisk kildegjennomgåtte profiler. C6 legger til fem: **42/87 (48,3 %) har fått dedikert kildepass; 45 gjenstår**. Dette er ikke 42 ferdige People v1-profiler eller billedkort.

Hele stedspakken står fortsatt åpen: resterende personprofiler og metadatareview, portretter, Forestillinger, kvalifiserte Objects/Brands, separat frontImage, quiz/QuizCard og full visuell/runtime-akseptanse. Neste checkpoint velges etter review av C6.

## Readiness-reparasjon før final head

Review av første C6-head fant manglende regenerering av readiness-rapportene. Kontroll på uendret C5-main bekreftet at de også var foreldet etter akkurat 37 C1–C5-profiler. PR #6305 synkroniserte bare disse to rapportene og er merget i `840d2dc513dc5157c38637f9797cb9b32586b115`. C6 er replayet fra dette main-grunnlaget. De to nye readiness-rapportene har nå **bare de fem C6-personene** som endrede personrader mot replay-basen.

`node tools/audit-people-popup-readiness.mts --check`: PASS på komplette 779 manifestførte People-kildesnapshots, med bildeeksistens fra samme commits ikke-trunkerte Git-tre. `node tools/audit-people-profile-canonical.mjs --require-claims`: PASS med **115 innhentede claims-filer** (de 110 eksisterende manifestrefererte filene og C6s fem nye). Denne kjøringen overstyrer ikke de fem profilene sin avgrensede `needs_research`-status.

Final filscope er **17 filer**, inkludert de to synkroniserte readiness-rapportene. Fullrepo-CI kjøres på ny eksakt head etter replay; første heads grønne CI erstatter ikke denne runden.
