# Post-#1419 preflight — profile/Civication/Knowledge Match integration audit

Dato: 2026-06-22  
Scope: Audit etter PR #1419 av profile page, Civication wallet/shop/status, badge merits, career outcome after FIRED, Knowledge Match social/invite state, match profile popup og debate tendency-overflaten.

## 1. TypeScript/build-status

### Kjørt baseline først

- `npm run typecheck` feilet på en konkret global-eksportdiagnostikk i `js/knowledgeMatch.js`: direkte `window.getIncomingMeetInvites`, `window.getOutgoingMeetInvites`, `window.renderMeetInviteInbox`, `window.acceptMeetInvite`, `window.declineMeetInvite` og `window.cancelMeetInvite` manglet Window-typing.
- `npm run typecheck:scripts` passerte.
- `npm run build:scripts` passerte.
- `npm run typecheck:tools` passerte.
- `npm run build:tools` passerte.
- Debatt-/task-bridge-testene passerte.

### Reparasjon utført

Kun en liten, verifisert typecheck-fiks ble gjort: de seks Knowledge Match invite-eksportene i `js/knowledgeMatch.js` ble flyttet fra dot-assignments til bracket-assignments for å matche eksisterende mønster for dynamiske globals uten å endre runtime-kontrakt eller localStorage-format.

### Status etter reparasjon

- `npm run typecheck` passerer.
- `npm run typecheck:scripts` passerer.
- `npm run build:scripts` passerer.
- `npm run typecheck:tools` passerer.
- `npm run build:tools` passerer.
- `git diff --check` passerer.

## 2. Profile integration

### Synlige profilseksjoner

`profile.html` har nå faner for:

- `Oversikt`: fortsett reisen, siste kunnskap/trivia, begreps-/kunnskapsprofil og Knowledge Match/Meet Invite Inbox.
- `Samling`: tidslinje, kortsamling, musikk, steder og personer.
- `Merker`: mine merker.
- `Kunnskap`: knowledge engine panel, kunnskapslogg/innsikt og lenke til kunnskapssiden.
- `Spill`: ekstern spillrad, Civication-kort/status/mailvalg og Groundhopper-panel.
- `Profilvalg`: notater, språk og profilhandlinger.

### Civication wallet/status på profil

- Profilens PC-verdi leser defensivt fra flere kilder i prioritert rekkefølge: `CivicationState.getWallet().balance`, `HG_CiviShop.getWallet().balance`, `getPCWallet()` og legacy `hg_pc_wallet_v1` (`balance` eller `pc`).
- `CivicationState` sin wallet-kilde er `hg_civi_wallet_v1`.
- `HG_CiviShop.getWallet()` leser `CivicationState.getWallet()` når tilgjengelig og faller tilbake til legacy `hg_pc_wallet_v1`; hvis state-wallet er 0 og legacy har saldo, synkroniseres saldo inn i state-wallet.
- Profilrendering tåler manglende Civication-state fordi wallet-lesing er pakket i try/catch og fordi Civication UI-kall kjøres gjennom `safeCall`/optional chaining.

### Badge merits og shop

- Badge merits leses fra `merits_by_category`.
- Shop gating krever bare at minst én av `requires_badges_any` har merit-poeng `> 0`, med alias-støtte for `populaerkultur`/`popkultur` og `næringsliv`/`naeringsliv`.
- Manglende eller malformed merits gir tomt objekt og dermed låst badge-gated innhold, ikke crash.

### Fired career outcome visibility

- Career outcome runtime skriver terminal outcome-state under `career_outcome_state` i Civication-state.
- Ved `FIRED` appendes aktiv stilling til jobbhistorikk før aktiv stilling nulles ut.
- Day-phase view model leser outcome-state direkte, slik at statusen kan vises selv når aktiv jobb er ryddet bort.
- Eksisterende career outcome-tester ble kjørt og passerer.

## 3. Civication shop/wallet

### Canonical wallet-kilde

- Canonical Civication wallet-kilde er `CivicationState.getWallet()` / `CivicationState.updateWallet()` mot `hg_civi_wallet_v1`.
- Legacy bridge finnes fortsatt for `hg_pc_wallet_v1` og globale `getPCWallet`/`savePCWallet`.

### Shop render-/data-kilde

- Shop-pakker lastes via `HG_CiviShop.getPacks()` fra første tilgjengelige av `data/Civication/commercial_packs.json`, `data/civication_packs.json`, `data/commercial_packs.json`, `data/packs.json`.
- Stores lastes via `HG_CiviShop.getStores()` fra `data/Civication/stores.json` eller `data/stores.json`.
- Synlig shop-innhold kommer fra `getVisibleStores()` og `getVisiblePacks()`, som kombinerer History Go/Civication place access, nabolagsgating og badge merit-gating.

### Fallback og write behavior

- Manglende wallet gir `{ balance: 0, last_tick_iso: null }`.
- Manglende inventory lager en tom inventory i `hg_pc_inventory_v1`; dette er en write-on-first-read for inventory, men ikke en economy/balance-write.
- Shop visibility (`getVisibleStores`/`getVisiblePacks`) er read-only for wallet/balance/merits.
- `buyPack()` er eneste tydelige state-mutator i shop-flowen: den trekker saldo, skriver inventory og dispatcher `updateProfile`.

## 4. Knowledge Match social layer

### State og localStorage keys

Knowledge Match bruker disse nøklene:

- `hg_public_profile_v1`: lokal offentlig profil.
- `hg_public_profiles_v1`: lokal directory/mock directory for offentlige profiler.
- `hg_knowledge_meet_invites_v1`: Meet Invite Inbox.
- I fingerprinten leses også eksisterende lærings-/meritkilder som `quiz_progress`, `merits_by_category`, `hg_learning_log_v1`, `emne_coverage` og eventuelt `HGLearningLog`.

### Match profile popup-kontrakt

- `openMatchProfile(userId)` finner profil fra lokal bruker eller directory, lukker eksisterende popup, lager `#matchProfilePopup`, renderer offentlig profil og felles kunnskapsspor, og kobler `Foreslå møte` til meet invite-modal via global bridge.
- Tom/manglende profil returnerer `null` og lager ikke popup.
- Popup-kontrakten eksponeres via `window.openMatchProfile`, `window.renderMatchProfile` og `window.HGKnowledgeMatch`.

### Meet Invite Inbox-kontrakt

- Invitasjoner normaliseres ved lesing og filtreres bort hvis `inviteId`, `fromUserId` eller `toUserId` mangler.
- Inbox deler visning i incoming/outgoing, sorterer nyeste først og viser tom-state uten crash.
- Statusendringer (`accepted`, `declined`, `cancelled`) oppdaterer eksisterende invite-id, skriver hele invite-listen tilbake og re-render inbox.
- Det finnes ikke dedupe-regel for flere nye invitasjoner til samme person/sted/tid; `sendMeetInvite()` oppretter alltid ny unik `inviteId`. Det er ikke en regressjon, men en risiko/naturlig neste cleanup hvis produktet ønsker én aktiv invite per kombinasjon.

## 5. Debate tendencies on profile or connected surfaces

- `Dine debatt-tendenser` er fortsatt isolert til debatt-/Civication debate-surface og underliggende debate tendency-overflate, ikke en egen profile-seksjon.
- Dette er riktig for denne audit-PR-en: ingen ny stor profile UI ble bygget.
- Naturlig senere kobling er en read-only profilseksjon à la `Min verdi-/debattprofil`, men den bør bygges i egen PR med egen testdekning og uten å endre debate data.

## 6. Cross-system risks

### localStorage key collisions

- Ingen objektiv key collision funnet mellom Civication wallet (`hg_civi_wallet_v1`), legacy PC wallet (`hg_pc_wallet_v1`), inventory (`hg_pc_inventory_v1`), Knowledge Match profiles (`hg_public_profile_v1`/`hg_public_profiles_v1`) og meet invites (`hg_knowledge_meet_invites_v1`).
- Risiko: `hg_public_profiles_v1` er lokal directory/mock state og kan forveksles med server-side directory senere. Bør dokumenteres hvis sync/backend legges til.

### Duplicate rendering

- `renderKnowledgeMatches()` kaller `renderMeetInviteInbox()`, og profile `updateProfile` kaller `renderKnowledgeMatches()`. Siden root innerHTML erstattes og listeners bindes på nytt til nye noder, ble det ikke funnet dobbeltregistrering på samme node.
- `CivicationDebateUI` lytter på både DOMContentLoaded, `updateProfile` og `civi:booted`; render erstatter panelinnholdet og knytter listeners til nye knapper, så auditten fant ikke dobbel action-registrering.

### Broken fallbacks

- Profilens PC-render tåler manglende Civication state/shop/globals.
- Knowledge Match tåler tom directory, privat lokal profil, tom invite-list og missing popup target.
- Badge-gated shop tåler manglende merits ved å låse gated innhold.

### Global namespace

- Knowledge Match eksponerer flere globals (`buildKnowledgeFingerprint`, `getKnowledgeMatches`, `sendMeetInvite`, invite helpers, popup helpers) samt samlet `HGKnowledgeMatch`.
- Den konkrete typecheck-feilen lå nettopp i noen av disse direkte Window-eksportene og er reparert uten å endre runtime-navn.
- Fremtidig cleanup: foretrekk `window.HGKnowledgeMatch.*` som primær API og hold frie globals kun som kompatibilitetsbro.

### State writes on render

- Profilrender for PC/status er read-only.
- Shop visibility er read-only, men `HG_CiviShop.getInv()` skriver en tom inventory på første lesing hvis den mangler. Dette kan være akseptabelt legacy behavior, men bør være kjent hvis shop-render bruker `getInv()` bare for preview.
- Knowledge Match render skriver ikke invites/profiles bortsett fra brukerhandling på public toggle eller invite actions.

## 7. Recommended next PR

Anbefalt neste PR: **profile integration tests**.

Begrunnelse:

- Denne auditten fant én liten typecheck-feil i Knowledge Match globals, men ikke en runtime dataformat-feil som krever ny feature eller modellendring.
- Det finnes relevante tester for debate/task bridge og career outcome, men ingen direkte eksisterende tester for profile rendering, Civication shop/badge gating, Knowledge Match, Meet Invite Inbox eller match profile popup.
- En liten test-PR bør dekke read-only kontraktene: profile PC fallback, missing Civication state, Knowledge Match empty state, popup open/close, invite status transitions og badge-gated visible packs.

## Testmangler notert

Det ble ikke funnet eksisterende tester for:

- profile rendering som helhet
- Civication shop rendering / visible packs
- badge merit gating i shop
- Knowledge Match social layer
- Meet Invite Inbox localStorage-flow
- match profile popup

Eksisterende relevante tester funnet og kjørt:

- `tests/civication-career-outcome-view-model.test.js`
- `tests/civication-career-outcome-reachability.test.js`
- `tests/civication-career-outcomes.test.js`
- `tests/civication-career-role-resolver.test.js`
- Debate/task bridge-testene fra oppgaven

## Ikke endret

- Ingen koordinatkandidatpipeline ble endret.
- Ingen unrelated data ble endret.
- Ingen service worker ble endret.
- Ingen TypeScript-oppsett/tsconfig ble endret.
- Ingen debate data ble endret.
- Ingen Civication economy/balance-regler ble endret.
- Ingen badge merit-regler ble endret.
- Ingen Knowledge Match localStorage keys eller dataformat ble endret.
