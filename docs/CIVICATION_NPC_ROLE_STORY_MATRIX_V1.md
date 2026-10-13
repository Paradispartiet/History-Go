# Civication – NPC-rollebytter og tilbakevendende fortellinger (v1)

**Status 13. oktober 2026: Tre NPC-forløp (Stein, Frode, Inger) med 12 authored narrative scener, forsinket progresjon over arbeidsdager og egne rollehendelser. Målrettet CI har bestått, men PR #6285 er fremdeles draft.** Dette dokumentet viderefører PR #6285. Formålet er å materialisere rollebytter som konsekvenser av eksisterende Civication-scener, ikke innføre en ny Scene Pipeline, NPC-lagring eller History Go-identitet.

## Bekreftet teknisk grunnlag

- `CivicationNpcCharacterThreads` eier `hg_civi_npc_character_threads_v1`, med identitet, `trust_score`, `beats` og nå `role_history`.
- `recordRoleTransition(npcId, nextRef, eventId)` krever en eksplisitt, canonical rolleovergang. `CivicationNPCs.resolveActor()` leser og validerer kronologien.
- `CivicationChoiceDirector` er den kanoniske svargrensen etter en **vellykket** `EventEngine.answer`. `civication_scene_v1` er sceneformatet; den kompilerte katalogen er runtime-fasiten.
- `data/Civication/sceneContractV1.schema.json` tillater i dag **ikke** nye vilkårlige felt i `choice` eller `effects` (`additionalProperties: false`). En fremtidig `npc_role_transition_ops` må derfor føres gjennom schema, authored-source-normalisering, compiler og runtime. Det holder ikke å skrive et nytt JSON-felt i en mail.
- Verken rolle-API-et eller en narrativ rollehendelse eier spillerens lønn, ansettelse, myndighet, vennskap, History Go People eller History Go-unlocks.

## NPC-matrise: konkrete førsteproduksjoner

| ID / karakter | Nåværende rolle | Mulig ny rolle | Fortellingspremiss | Spillerens faktiske innflytelse | Senere møte |
| --- | --- | --- | --- | --- | --- |
| `stein_peer_mellomleder` / Stein Mæland | `naeringsliv/mellomleder` | `naeringsliv/avdelingsleder` | En avdeling får ny leder etter en konkret organisasjonsbeslutning. Stein får tilbudet; hans tidligere kollegaforhold til spilleren består. | Spilleren kan støtte, stille kritiske spørsmål eller holde avstand. Beslutningen om Steins stilling krever egen bekreftet hendelse, ikke spillerens ja. | Stein møter spilleren igjen som tidligere kollega i en ny posisjon; tidligere tillit avgjør hvor åpent han forteller om presset. |
| `frode_formann` / Frode Aas | `naeringsliv/formann` | `naeringsliv/mellomleder` | Etter dokumentert ansvar i en driftskrise blir Frode vurdert for en koordinerende lederrolle. Det oppstår spenning mellom lojalitet til skiftet og krav ovenfra. | Spilleren kan dokumentere innsatsen eller trekke fram mangler. Vurderingen er ikke en direkte tildeling av stilling. | Frode henviser konkret til hva spilleren sa i det første møtet. Ny rolle gir en annerledes konflikt, mens gammel relasjon består. |
| `inger_avdelingsleder` / Inger Holm | `naeringsliv/avdelingsleder` | `naeringsliv/mellomleder` | Omorganisering endrer Ingers ansvar. Rollen blir smalere uten at personen, tidligere valg eller faglige erfaringer slettes. | Spilleren kan svare med respekt, opportunisme eller taushet. Omorganiseringen besluttes ikke av spilleren. | Inger husker både sin tidligere myndighet og spillerens opptreden. Samtalen handler om tap av kontroll og profesjonell kontinuitet. |

Dette er **synopsiser**, ikke påstander om eksisterende spillscener eller formelle ansettelsesutfall. Ikke gjør rolleendringen automatisk eller tilfeldig. Scene- og stillingslogikk må bekrefte hva som faktisk skjer.

## Første sekvens – Stein og den ledige avdelingen

| Sekvens | Domene / sceneform | Konkret hendelse | Tilstand som må være lesbar |
| --- | --- | --- | --- |
| S1 – tidligere kollega | Arbeid / samtale | Stein og spilleren vurderer en omstridt prioritering. Spillerens svar påvirker tillit, ikke rolle. | Eksisterende NPC-ID, tidligere tillit og beat |
| S2 – den ledige rollen | Arbeid / melding | Avdelingen varsler at lederstillingen skal besettes. Ingen rolleendring ennå. | Story-flagg og unik scene-ID i eksisterende Scene Pipeline |
| S3 – bekreftet endring | Arbeid / beslutningsmelding | Etter en dokumentert organisasjonsbeslutning tiltrer Stein den nye rollen. Kun her er `recordRoleTransition` legitim. | Stabil `event_id`, `npc_id`, `from`, `to`; vellykket svartransaksjon; ingen duplicate writes |
| S4 – ettervirkning | Arbeid / møte minst én senere scene | Stein tar opp samme prioritering fra S1 i lys av ny posisjon. Replikkene varierer med gammel tillit og den validerte nye rollen. | Les `trust_score`, `beats` og `resolveActor()` uten å mutere dem |
| S5 – ny uenighet | Arbeid / konsekvensscene | Spilleren må velge om Steins tidligere støtte skal veie tyngre enn nye saklige innvendinger. | Et nytt valg skal gi nytt beat, men ingen ny rollehendelse uten en ny faktisk overgang |

**Synopsis:** Stein har lenge vært en kompetent, men beregnende sidestilt mellomleder. Under en krevende omlegging argumenterer han for tydeligere ansvarslinjer, mens spilleren får se hvordan argumentet rammer kollegaene. Noen scener senere får Stein ansvaret for en avdeling. Når de møtes igjen, kjenner han fortsatt spilleren – men den gamle kollegiale likestillingen finnes ikke lenger. En spiller som har støttet ham får større åpenhet; en spiller som har kritisert ham møter mer formell begrunnelse. Ingen av reaksjonene skal erstatte NPC-identiteten, skrive om gamle hendelser eller automatisk belønne spilleren med penger og myndighet.

## Implementert første vertikalsnitt – Stein

- Kilde: `data/Civication/narratives/work/naeringsliv/stein_role_change.json`, registrert i eksisterende `data/Civication/narratives/manifest.json`. Fire scene-ID-er er styrt av tidligere svarflagg, og streamen gjelder foreløpig aktiv spillerrolle `fagarbeider`.
- Scene-produsent: eksisterende `CivicationNarrativeSceneSource`, med eksplisitt `npc_story`-metadata i *det allerede runtime-materialiserte narrative stream-formatet*. Slik metadata er **ikke** lagt inn i den kompilerte work-scene-kontrakten og må ikke uten videre brukes i `mailFamilies`.
- Svar og lagring: `CivicationChoiceDirector` registrerer en avgrenset handler i **eksisterende** `dayNpcCharacterThreads.js`. Den validerer NPC-ID, canonical rolle og hendelses-ID før `recordRoleTransition` skriver samme karakterlager. Reaksjonsbeat har en stabil ID, så duplikatsvar ikke dobbeltteller tillit.
- Senere møte: Sceneadapteren leser historisk `trust_score`, velger utvidet replikk og krever persistert ny `role_ref` for siste scene. Den lager ingen nye personidentiteter.
- Kontroll: `tests/civication-npc-stein-role-story.test.js` tester valg, rollehistorikk, idempotens, reload, tillitsvariant og mislykket svar. `civication-choice-director-daily-middleware.test.js` er utvidet for å kontrollere at feilet narrative svar ruller tilbake progresjonsflagg.

Denne løypen gir ikke Stein en autoritativ stillingstildeling; rollebyttet er en narrativ Role World-referanse. Ingen spiller får lønn eller nye rettigheter av hendelsen. **Produksjonsgodkjenning krever bestått CI på siste commit og faktisk brukerreisetest.**


## Tre rollefortellinger – samlet produksjonsmatrise

Den maskinlesbare redaksjonelle fasiten ligger i [`npcRoleStoryMatrixV1.json`](../data/Civication/narratives/editorial/npcRoleStoryMatrixV1.json). Den inneholder 3 selvstendige aktørtråder og 12 scene-ID-er og er **ikke** en ny runtime-motor. Autoritativt sceneinnhold er fortsatt de tre JSON-kildene, registrert i `narratives/manifest.json`.

| NPC | Scene 1 – problem | Scene 2 – organisasjonens prosess | Scene 3 – faktisk rollehendelse | Scene 4 – forsinket ettervirkning |
| --- | --- | --- | --- | --- |
| Stein Mæland | `stein_peer_priority` – omstridt ressursfordeling, tillit | `stein_job_opening` – intern avdelingslederstilling | `stein_confirmed_appointment` – mellomleder → avdelingsleder | `stein_new_role_followup` – gammel uenighet i nytt koordineringsmøte |
| Frode Aas | `frode_line_stop` – vibrasjoner, produksjonspress og ansvar | `frode_promotion_process` – utlysning, vurdering og dokumentasjon | `frode_confirmed_appointment` – formann → mellomleder | `frode_roster_followup` – belastende vaktplan og lojalitet til skiftet |
| Inger Holm | `inger_cost_dispute` – kuttforslag og nattskiftets faktiske arbeid | `inger_reorganization_notice` – varslet sammenslåing | `inger_confirmed_reorganization` – avdelingsleder → mellomleder | `inger_knowledge_followup` – faglig kunnskap uten tidligere signaturmyndighet |

**Tidsmatrise:** Kapittel 2 krever minst én fullført ny arbeidsdag etter kapittel 1; kapittel 3 krever ytterligere to; kapittel 4 krever minst én til. Dette er gater på `narrative_state_v1.stream_progress[*].answered_workday_day` kombinert med `CivicationWorkdayRuntime.getWorkdayDayIndex()`. Dermed er det ordinære spilldager, ikke brukerens virkelige ventetid, som styrer neste kapittel. Avvist svar rulles tilbake av den eksisterende DailyMailBuilder-middleware.

**Frode – synopsis:** Et uavklart maskinavvik viser forskjellen mellom produktivitetspress og dokumenterbar sikkerhet. Spilleren kan bidra med konkrete observasjoner eller holde avstand. Frode får deretter muligheten til en mellomlederstilling gjennom en separat organisatorisk vurdering. Etter utnevnelsen må han lage en vaktplan som utsetter de samme kollegaene for mer belastning. Tilliten fra avvikssaken bestemmer hvordan han går inn i samtalen, mens spillerens innvendinger kan endre den faglige dialogen, ikke ansettelsesvedtaket.

**Inger – synopsis:** Et nedbemanningsforslag baseres på målbare timer uten å fange opp oppgavene nattskiftet faktisk løser. En senere omorganisering gjør at Inger mister budsjett- og personalansvaret. Hennes faglige erfaring forsvinner ikke sammen med tittelen. Når en vedlikeholdsrutine mangler godkjenner, må spilleren velge mellom å bidra til en dokumentert overlevering og å la saken vente. Samtalen preges av om spilleren tidligere hjalp henne med konkrete opplysninger eller avviste henne.

**Rollebasert avgrensning:** Steins serie er for `fagarbeider`; Frode og Inger er skrevet for `fagarbeider` og `mellomleder`. Denne avgrensningen ligger i scene-kildenes `applies_when.role_scopes`, og ikke i et nytt globalt NPC-rollesystem. Rollebyttet gjelder den fiktive bipersonens canonical Role World-referanse. Spillerens aktive jobb, lønn og myndighet er uendret.

### Forhold til litterært atlas

I PR #6283 er `narrativeCrosswalkV1.json` og 24 C-typer redaksjonelle kryssreferanser. Denne matrisen noterer **foreløpige tematiske kandidater**, ikke nye autoritative koblinger: Stein C06/C23 (faglig integritet og vedvarende feil), Frode C17/C23 (slitasje og et arbeidsproblem som ikke forsvinner), Inger C06/C23 (faglig integritet ved endret organisasjon). Bokers plot-koder og de 24 L-sporene endres ikke. En senere redaksjonell kontroll må ta stilling til konkrete L-/P-koblinger og om C-typene passer i spillerrollene; ingen tildeling er aktivert i runtime.

### Test- og godkjenningsgrense

- `tests/civication-npc-stein-role-story.test.js` dekker alle tre aktører, alle 12 authored scene-ID-er, reelle ChoiceDirector-valg, minstekravet mellom arbeidsdager, replikkvarianter for tillit, idempotens og rollehistorikk etter reload.
- `civication-choice-director-daily-middleware.test.js` verifiserer rollback av narrative fremdriftsflagg når et svar ikke blir akseptert.
- Fokusert NPC CI, TypeScript guard, dokumentasjon og workflow-routing har bestått i forrige kontrollrunde; full Civication-regresjon er separat påvirket av generert readiness-data som også finnes uendret i main.
- **Ikke godkjent som sluttført brukerreise:** full nettlesergjennomgang fra dagskø via inbox, innslag i spilldialogen, visning etter neste spilldag og endelig PR-merge mangler dokumentert sluttbevis.

## Implementeringsgrense – videre generalisering til kompilerte work-scener

1. Velg en eksisterende **canonical authored source** og en faktisk scene-ID for S1–S4. Kontroller at den kompileres til `civication_scene_v1` og blir levert via `SceneDirector`; ikke bruk rå `jobbmails` som ny fallback.
2. Definer én avgrenset, typet `npc_role_transition_ops` i scene-kontrakten: `npc_id`, `event_id`, `from`, `to` og grunnlag i scenevalg/bekreftet narrativ hendelse. Kun `fictional_npc` med eksplisitt katalogrolle kan berøres.
3. Før operasjonen hele veien gjennom schema, compiler og ChoiceDirector, som skal kalle **eksisterende** `recordRoleTransition` først etter vellykket svar. Ingen ny localStorage-nøkkel og ingen direkteskriving fra visning eller mail.
4. La senere møter lese de samme aktør-, tillits- og beat-opplysningene. Replikker for høy/lav tillit må kunne testes uten å skape eller tilbakeskrive state.
5. Test replay, gammel save, ukjent NPC, ugyldig Role World, duplikat `event_id`, tapt rolleindeks, samtidige svar, ikke-godkjent valg, samt at lønn og History Go-data er urørt. Kjør scene-compiler-sync, TypeScript guard, Civication-regresjoner og nettleser-smoke.

## Godkjenningskriterier

- Én **faktisk spillbar** sekvens S1–S4 fra scene til konsekvens; loggen og neste møte viser samme fiktive NPC gjennom rollebyttet.
- Reaksjonen tar hensyn til tidligere relasjon; høy og lav tillit gir meningsfulle, forskjellige svar uten å endre autorisasjon.
- Et nytt svar etter reload gir ikke duplikat rollehistorikk; et avvist eller mislykket svar gir ingen rollehendelse.
- Dagens 10 katalog-NPC-er og eksisterende avsender-ID-er beholdes. History Go People er bare kildebelagte fagreferanser.
- Først etter grønne relevante tester kan sekvensen omtales som produksjonsklar.

**Kobling til litterære hovedspor:** Redaksjonelt hovedspor, grunnplott og Civication-fortellertype skal tas fra eksisterende fortellingsatlas i PR #6283 etter kontroll; denne matrisen oppretter ikke nye grunnplott-ID-er eller omklassifiserer allerede skrevne synopsis.
