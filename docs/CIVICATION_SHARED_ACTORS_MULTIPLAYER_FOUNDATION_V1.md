# Civication – felles aktører og flerspillerklar rollemodell (v1)

**Beslutning 12. oktober 2026.** Civication er først en fungerende livssimulator for én spiller. Alle eksisterende canonical Role Worlds er gjenbrukbare **rollebeskrivelser** for både spillere og fiktive karakterer. En senere onlinedel er **frivillig og serverstyrt**. Denne PR-en starter ikke server, endrer ikke jobbrettigheter, implementerer ikke online matchmaking og endrer ikke History Go-kjernen.

## Eksisterende grunnlag, kontrollert i repoet

| Lag | Faktisk kilde | Prinsipp |
| --- | --- | --- |
| Rolleunivers | `data/Civication/roleWorlds/index.json` | 244 unike `(category, role_scope)` og deres Role World paths; 85 career-role og 159 life-position verdener |
| Yrkesrettigheter | Career, RoleModel og rolle-/arbeidsmotorene | Å kjenne en rolle er ikke det samme som å ha jobben eller fullmakten |
| NPC-katalog | `data/Civication/npcs/**`, Role World `recurring_people_archetypes`, friends | Fiktive aktører og dramaturgiske funksjoner; disse må ikke bli History Go People |
| Sosiale relasjoner | `civicationRelationshipEngine.js`, FriendsEngine | Egen historikk; blir ikke automatisk vennskap ved rolletildeling |
| Life Story, Scene Pipeline og Symposium | Eksisterende scene-/save-eiere | ID-er, valg, tidslinjer og tidligere svar består |
| Historiske People | `civicationHistoryPeopleBridge.js` og canonical People | Read-only historiske fagreferanser, aldri automatisk navn eller bilde på fiktive NPC-er |
| Første People-/fortellingsatlas | Draft PR #6283 | 24 C-synopsiser og 45 eksisterende kapitler; kan migreres separat |

**Viktig:** `role_world_complete` betyr faglig/redaksjonelt komplett Role World, ikke at 244 spillerkarrierer allerede har samme runtime-, inntekts- eller tilgjengelighetsnivå.

## Identitet, rolle og dramaturgi er tre forskjellige dimensjoner

| Felt | Spillerfigur | Fiktiv NPC | History Go-person |
| --- | --- | --- | --- |
| Identitet | `player:...` | `npc:...` | Canonical `person_id` i separat People-system |
| Kontroll | Lokal bruker i solo; senere autentisert bruker på server | Simulasjonen | Ikke en Civication-spillaktør |
| Role World | Enhver relevant canonical rollekategori og `role_scope` | Samme rollekatalog | Dokumentert faglig virke, ikke jobb-/NPC-rolle |
| Dramaturgisk funksjon | Hovedperson i egen fortelling | Kollegial, konkurrerende, venn, mentor, organisasjonsrolle osv. | Kunnskap, historiske eksempler, relevant sted |
| Progresjon | Egne valg, lønn, plikter, History Go-oppgaver | Egen begrenset og sporbar simulert tilstand | Historisk canon uendret |
| Sosial interaksjon | Frivillige valg | Simulert interaksjon | Ikke fiktiv samtale som om den var virkelig |

Én fiktiv karakter kan skifte stilling uten å skifte identitet. En arbeidsplass kan få ny innehaver uten at den forrige karakteren slettes eller at deres vennskaps-/scenehistorie endres.

`js/Civication/systems/civicationActorRoleContract.js` er et **rent, opt-in kontraktsbibliotek** som lastes før NPC-katalogen, men som ikke skriver lagring eller starter scener på egen hånd. Det gjør følgende, og bare dette:

- Validerer `(category, role_scope)` mot den **faktiske** Role World-indeksen.
- Lager separate `player:`- og `npc:`-identiteter som kan referere til nøyaktig samme rolle.
- Tillater en eksplisitt, hendelses-ID-merket rolleovergang uten å bytte karakter-ID.
- Avviser forsøk på å gjøre `canonical_person_id` til NPC, eller å injisere en nettspilleridentitet fra klienten.
- Holder lønn, avtaler, relasjoner, ansettelse, Story og permissions utenfor rollekontrakten.

Det er **ikke** en ny parallel scene-motor og **ikke** en ny lagringskilde. Faktisk gameplay i dag bruker fortsatt de eksisterende runtime-eierne.

## Avvik som denne PR-en lukker

Tidligere versjon av `civicationHistoryPeopleBridge.js` kunne dekorere en access-map-arketype ved å erstatte `name`, `description` og portrettidentitet med en innsamlet historisk People-profil. `CivicationPeopleUI` viste deretter ekte navn og People-bilde i listen over byens sosiale figurer.

Ny kontrakt: arketypen beholder eget navn og egen beskrivelse; en eventuell samlet People får en egen `history_go_learning_reference` med `kind=historical_knowledge_only`. PeopleUI omtaler dette som historisk fagreferanse og bruker ikke historisk People-portrett som NPC-avatar. RoleModelRuntime sine faktisk innsamlede `history_people` i rollemailene bevares som faglig grunnlag.

Gamle lagrede scenevalg, actor-ID-er, `personRepresentanter` og archive-snapshots omskrives ikke i denne PR-en. Andre legacy People/NPC-koblinger skal kartlegges før en bredere migrering.

## Første solo-integrasjon: eksisterende NPC-er

Denne leveransen utvider samme PR med en **etterprøvbar, begrenset** binding av allerede eksisterende fiktive katalogkarakterer. Det opprettes ikke nye fiktive identiteter og ingen scene/mailer skrives om.

| Eksisterende NPC-ID | Katalogtittel | Canonical Role World | Identitet |
| --- | --- | --- | --- |
| `inger_avdelingsleder` | Avdelingsleder | `naeringsliv/avdelingsleder` | `npc:inger_avdelingsleder` |
| `stein_peer_mellomleder` | Mellomleder, naboavdeling | `naeringsliv/mellomleder` | `npc:stein_peer_mellomleder` |
| `frode_formann` | Formann, B-skift | `naeringsliv/formann` | `npc:frode_formann` |

**Hvorfor bare tre?** Katalogen har ti fiktive NPC-er. De øvrige syv har ikke et uttrykkelig samsvar mellom sin konkrete tittel og en kontrollert canonical Role World i denne produksjonspakken; derfor får de ingen gjetningsbasert rolle. De fortsetter som fullverdige eksisterende mail-avsendere.

`data/Civication/npcs/naeringsliv.json` beholder alle ti NPC-ID-er/navn; kun de tre har nå eksplisitte `role_ref`. `civicationNPCs.js` bevarer `lookup`, `all`, `load` og eksisterende mail-oppførsel. En ny `resolveActor(npcId)` gjør et behovsstyrt oppslag i canonical `roleWorlds/index.json` og validerer bindingen via `CivicationActorRoleContract`. Den returnerer `null` for umappet NPC, manglende indeks eller ugyldig rolle; ingen fallback som gir oppdiktet myndighet.

`civicationShellLoader.js` laster rollekontrakten før NPC-katalogen i både standard- og legacy-shell. Ingen ekstra nedlasting av hele rollekatalogen skjer ved vanlig NPC-mailoppslag; den skjer først ved eksplisitt `resolveActor`-kall. En slik aktørreferanse er foreløpig **read-only** og gir ikke en faktisk jobb, frie relasjoner, offline-handlinger, lagringsmigrering eller simulert jobbkarriere.

**Verifikasjon:** `tests/civication-npc-role-bridge.test.js` kontrollerer de tre eksakte koblingene, alle ti legacy-NPC-er, ingen eager role-fetch, null-resultat ved manglende indeks, stabil `npc:`-identitet, ingen `localStorage`-skriverett og lastrekkefølge i begge shell. Dette er første begrensede kodekobling, **ikke** allmenn karaktergenerering eller online-multiplayer.

## Individuell NPC-historikk – eksisterende lager (videreføring 13. oktober)

**Kontrollert eierskap:** `js/Civication/systems/day/dayNpcCharacterThreads.js` eier allerede `hg_civi_npc_character_threads_v1`, som lagrer karakterenes egne `trust_score`, `appearances`, `status`, `focus_families` og `beats`. Relasjoner via personlige meldinger forblir eid av `civicationFriendMessages.js` / `civicationRelationshipEngine.js` og kobles ikke automatisk til en likt navngitt NPC. Vi lager ikke et nytt karakterlager.

| Handling | API | Vedvarende konsekvens |
| --- | --- | --- |
| Les aktør med aktuell rolle | `CivicationNPCs.resolveActor(npcId)` | Replayer tidligere godkjente rollebytter fra eksisterende karaktertrådlager uten skriving |
| Forhåndsvis rollebytte | `CivicationNPCs.previewRoleTransition(npcId, nextRef, eventId)` | Ingen lagring eller jobbstatus; canonical validering |
| Registrer eksplisitt solo-fortellingshendelse | `CivicationNpcCharacterThreads.recordRoleTransition(npcId, nextRef, eventId)` | Utvider samme lagrede karakter med `actor_id`, `role_ref` og kronologisk `role_history` |
| NPC reagerer senere på en spillerbeslutning | Eksisterende `updateCharacterThreadFromReaction` | Oppdaterer fortsatt tillit og beats; beholder samtidig rollehistorikken |
| Leser gammel lokal People-cache | `CivicationPeopleEngine.readState()` | Sanitiserer tidligere historiske NPC-navn **i minnet** før sosiale reaksjoner; gammel save overskrives ikke |

Rollehistorikk krever eksplisitt NPC-ID, canonical `category/role_scope` og unik `event_id`. Samtidige forespørsler per NPC serialiseres. Ved replay må `from` matche faktisk forrige rolle, `to` være registrert og `event_id` unik; korrupte hendelser gir `null` heller enn å skape en fiktiv stilling. Historikken ligger i **eksisterende** `characters[npcId]` og er ikke en autoritet for ansettelse, lønn, pensjon, History Go-unlocks eller sosiale relasjoner. `lookup()` og eldre mail-ID-er beholder samme oppførsel.

Merk at dette er en lokal **hendelses-API** for fremtidige valg/scener. Den genererer ingen rolleendringer selv, og kobler foreløpig bare de tre uttrykkelig mappede `naeringsliv`-NPC-ene til canonical rollekatalog. Senere eksplisitte sceneskripter må selv velge når en velbegrunnet rolleendringshendelse faktisk skjer. Det er **ikke** sanntids- eller nettbasert samspill.

Testfiler: `tests/civication-npc-role-history-persistence.test.js` (reload, samme lagringsnøkkel, reaksjonshistorikk, samtidighet, duplikatvern og korrupt data), og `tests/civication-people-legacy-cache-guard.test.js` (gammel People-kobling holdes utenfor sosiale fiksjonsreaksjoner).

## Synopsiser for NPC-rollebytter

Tre eksisterende fiktive NPC-er har nå en egen [produksjonsmatrise med rollebytte- og oppfølgingssynopsiser](./CIVICATION_NPC_ROLE_STORY_MATRIX_V1.md). Dokumentet skiller planlagt storyinnhold fra implementert runtime og identifiserer at scene-kontrakten og compiler må støtte en eksplisitt rollehendelse før slike scener kan være spillbare. Ingen rolle- eller relasjonsoppdateringer aktiveres av planfilen.

## Samspill i én spillverden: produksjonsmatrise

| Interaksjon | I solo | I frivillig online | Eier og krav |
| --- | --- | --- | --- |
| Kollegasamtale | Fiktiv NPC | Spiller eller NPC | Scene Pipeline og relasjonsmotor |
| Stillingsrolle | Spiller eller NPC kan ha rollen som identitetsreferanse | Samme canonical rollekatalog | Jobbstatus valideres fortsatt av Career/Role Runtime |
| Ledig oppdrag | NPC-/systemforespørsel | Autentisert spiller kan tilby | Aksept, omfang, fullmakt og betaling krever autorisert handling |
| Konsert/prosjekt | Individuelt scenario | Flere deltagere kan akseptere samme arrangement | Server eier avtaler og deltakerliste; ikke klientens lokale state |
| To spillere med samme yrke | Ikke relevant | Begge kan være frilansmusikere | Ingen kunstig global knapphet på rolletype |
| Én konkret stilling | NPC eller lokal spiller i den aktuelle fiktive verden | Høyst én aktiv innehaver dersom jobben er eksklusiv | Serverstyrt stillings-/occupancy-lås, separate fra rolletypen |
| Bytte stillingsinnehaver | Bevar personhistorie | Eksplisitt oppsigelse, tilbud eller overføring | Versjonskontrollert hendelse og revisjonsspor |
| Offline spiller | Lokal historie går videre når spilleren faktisk spiller | Ingen nye løfter eller gjeld på spillerens vegne | Innboks/invitasjon ligger uavklart til autentisert valg |
| History Go-kunnskap | Besøk, quiz, dokumentert People | Egne ferdighets-/kunnskapsgater for hver spiller | History Go forblir separat, read-only fra Civication |

**Rolletype ≠ stillingsforekomst.** En frilansmusikerrolle kan eies av hundre forskjellige aktører. En unik deltidsstilling kan ha én innehaver. Stillingen har egen `position_id`, med ansvarskontrakt og gyldighetsperiode, og kan ikke opprettes av en fiktiv rollebeskrivelse.

## Flerspiller: autoritative grenser

Et senere nettbasert Civication må gi hver spiller et serververifisert `account_id` og én eller flere spillavatarer, med `actor_id` som **spillidentitet**, ikke persondata eller History Go-person-ID. Backend knytter kontoeier til aktør. Klientens `localStorage` kan være visning/cache, men aldri fasit for andre spilleres penger, jobber eller avtaler.

En foreslått delt hendelse skal minimum ha:

| Felt | Formål |
| --- | --- |
| `event_id` | Entydig idempotensnøkkel; hindrer dobbeltbetaling/dobbeltaksept |
| `world_id` | Hvilken felles verden hendelsen tilhører |
| `actor_id` / `target_actor_id` | Egne Civication-aktører, ikke History Go People |
| `actor_version` / `position_version` | Oppdatering uten å overskrive samtidige valg |
| `action_type` | Godkjent domenehandling: invitasjon, svar, oppdrag, avtale osv. |
| `authorization` | Serverkontroll av kontoeier, rolle, myndighet og consent |
| `accepted_at` / `status` | Ingen resultatpåstand uten relevant aksept |
| `scope` | Spillkonsekvens og tydelig grense mot historie-/personvernopplysninger |
| `symposium_ref` | Personlig sporbarhet for hvert deltakende subjekt |

Dette er **en designkontrakt**, ikke implementerte databasefelt. Første nettversjon kan bruke asynkrone invitasjoner i stedet for sanntidskart og MMO-simulering.

Ingen nettspiller får lov til å sende handlinger i en annens navn, styre en offline avatar, låne vedkommendes History Go-unlocks, tildele seg jobb-/økonomirettigheter, eller tvinge fram en relasjon. Kontakter må kunne blokkeres og rapporteres; profil- og posisjonsdeling må være frivillig. Reelle GPS-posisjoner må aldri publiseres som en del av sosial tilstedeværelse.

## Realistisk produksjonsrekkefølge

| Fase | Produkt | Godkjenningsbevis |
| --- | --- | --- |
| A — dette arbeidet | Identitetsskille, felles rollekontrakt, plan og tester | 244 canonical roller fungerer for begge aktørtyper; History Go-navn overtar ikke NPC-identitet |
| B — solo | Koble eksisterende NPC-er trinnvis til Role Worlds; egne relasjoner og historikk | Musikk, prosjekt og miljø kan gjennomspilles uten innsamlede People; bevarer saves/scene-ID-er |
| C — brukerprofiler | Serverbasert konto og frivillig synlig karakterprofil | Signert/autentisert eierskap, personvern og gjenoppretting |
| D — asynkront samspill | Invitasjon, svar, enkle felles oppdrag | To kontoer, duplikatforespørsler, avslag/offline og replay testet |
| E — felles prosjekter | Arrangement, oppdrag, roller og avtalestatus | Serverautorisert samsvar mellom alle deltakernes Symposium-historier |
| F — delt økonomi | Kontrakter, betaling og eventuell rolleoverdragelse | Autoritativ transaksjonslogg, idempotens, tvisteløp og rollback |
| G — eventuell sanntid | Samtidig online tilstedeværelse, kart og trafikk | Belastning, misbrukshåndtering, sikkerhet, synkronisering og moderering |

Ingen fase må tvinge en solo-spiller inn i en felles verden. Fiktive aktører kan fylle sosiale roller når spillere er fraværende. En person som ikke har gitt sitt samtykke kan aldri få et nytt forpliktende valg «utført» av en NPC.

## Test og ferdigdefinisjon

- `tests/civication-shared-actor-role-contract.test.js`: alle 244 Role Worlds, rolleparitet, skille mot History Go, rollevandring og ingen klientautorisert online-identitet.
- `tests/civication-history-people-bridge.test.js`: fiktive navnerader bevares med/uten People; kildevalg, kategorier og RoleModel-læringsreferanser beholdes.
- Alle øvrige eksisterende Civication-tester må fortsatt bestå.
- **Denne fasen er ikke «multiplayer implementert».** Neste jobb etter godkjent CI er en avgrenset solo-integrasjon som kobler eksisterende rolle-/karakterdata til denne felles identitetskontrakten uten ny scene-motor.
