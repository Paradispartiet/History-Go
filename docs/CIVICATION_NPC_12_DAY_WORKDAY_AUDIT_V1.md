# Civication – 12 arbeidsdager med NPC-rollefortellinger (audit v1)

**Omfang:** PR #6285, solo-first, tre fiktive NPC-er og 12 eksisterende scener.  
**Kontrollfil:** `tests/civication-npc-workday-distribution.test.js`  
**Kjøres av:** `.github/workflows/civication-npc-story.yml`

## Fremgangsmåte og gyldighetsområde

Testen starter `CivicationDailyMailBuilder.buildQueue` og
`CivicationNarrativeSceneSource` fra ekte JS-kilder. Den leser det faktiske
`mailDayProgram.json`, alle tilgjengelige narrativfiler via manifestet,
rolleindeksen, NPC-katalogen og eksisterende mailfamilier fra repository.
NPC-valg sendes gjennom eksisterende ChoiceDirector, Daily-svarmiddleware og
den eksisterende `hg_civi_npc_character_threads_v1`-lagringen.

Tiden, state, localStorage, `CivicationWorkdayRuntime` og EventEngine er
kontrollerte testdobbeltobjekter. En deterministisk primær planjobb-mail
injiseres per dag for å sikre at den reserverte jobb-slotten er besatt.
Testen svarer på alle påkrevde arbeidsfaser, inkludert eventuelle innskutte
narrativmeldinger. Private faser verifiseres for jobb-/NPC-lekkasje, men
simuleres ikke som fullstendig brukerreise i nettleser.

Dermed dokumenterer testen **reell valg-/dagskølogikk under kontrollerte
forutsetninger**, ikke en bekreftet produksjonsopplevelse på iPad eller en
validering av samtlige alternative spillerprofiler.

## Observert arbeidsdagfordeling – fagarbeider

| Arbeidsdag | Stein Mæland | Frode Aas | Inger Holm | Andre jobbmailer |
| --- | --- | --- | --- | ---: |
| 1 | `stein_peer_priority` | `frode_line_stop` | `inger_cost_dispute` | 6 |
| 2 | `stein_job_opening` | `frode_promotion_process` | `inger_reorganization_notice` | 6 |
| 3 | – | – | – | 9 |
| 4 | `stein_confirmed_appointment` | `frode_confirmed_appointment` | `inger_confirmed_reorganization` | 6 |
| 5 | `stein_new_role_followup` | `frode_roster_followup` | `inger_knowledge_followup` | 6 |
| 6–12 | – | – | – | 9 per dag |

**Resultat:** 12/12 NPC-kapitler i kronologisk orden, innen dag 5, på
4 dager med tre samtidige NPC-kapitler; 8 dager uten disse NPC-kapitlene.
Ingen NPC-rollefortelling ble avvist av en ordinær jobbmail i dette
kontrollerte testtilfellet.

## Årsak til den synkroniserte progresjonen

1. Alle tre strømmer har `type: work` og er gyldige for
   spillerrollen `fagarbeider` fra starten.
2. De tre JSON-forløpene bruker identiske intervaller mellom kapitlene:
   `0, 1, 2, 1` **fullførte arbeidsdager**.
3. `storyletsForSlot` i `civicationNarrativeSceneSource.js` finner én
   tilgjengelig storylet per strøm og sorterer på `storyletWeight`.
   Disse tre strømmene har ingen innbyrdes variasjon i prioritet.
4. `buildQueue` i `civicationDailyMailBuilder.js` har tilstrekkelig
   arbeidsfasekapasitet til å ta inn alle tre samme dag. Det finnes ikke
   egen NPC-kvote, veksling, avstand mellom *ulike* karakterforløp eller
   prioritering av en pågående relasjon.

Resultatet følger dermed av nåværende valg- og tidsregler. Det er
**ikke** avdekket et brudd i kapittelrekkefølgen eller en feil ved
`recordRoleTransition`. Dette er en dramaturgisk fordeling som må
vurderes separat.

## Regresjoner som følger audit-testen

- Ufullført arbeidsdag åpner ikke neste NPC-kapittel ved ny kalenderdato.
- Senere kapitler følger minst det deklarerte antallet fullførte
  arbeidsdager etter forrige svar.
- Alle NPC-scener plasseres i `forenoon` eller `workday`; de havner
  ikke i privat fase.
- NPC-identitet, alle reaksjonsbeats og én kanonisk rolleovergang per
  karakter bevares etter aksepterte valg.
- Lokal omstart med beholdt state/localStorage reproduserer rollehistorikken
  og tilbyr ikke fullførte kapitler om igjen.
- Overgang fra `fagarbeider` til `mellomleder` gjør Steins strøm
  utilgjengelig mens Frode er fortsatt kvalifisert. Retur til
  `fagarbeider` viderefører Steins kapittelprogresjon.

## Avgrenset konklusjon og neste beslutning

**Funksjonell progresjon:** Implementert.  
**Sammenhengende, individuelt fordelt livsforløp:** Ikke godt nok dokumentert;
12-dagersloggen påviser synkronisering.

Ikke opprett en ny NPC-lagring eller en parallell scheduler.
En eventuell dramaturgisk forbedring må bygge på den eksisterende
`narrative_state_v1` og `hg_civi_npc_character_threads_v1`,
med klare akseptkriterier for variasjon mellom fortellinger og regresjon
mot ordinære arbeidsmail.

**Kvalitetssikring før merge:** målrettet NPC-workflow, full Civication-
regresjon, browser-smoke, typecheck og dokumentasjonskontroll må alle
vurderes på siste commit. Sluttkontroll av faktisk innboks/visning
gjenstår og er ikke dokumentert av denne node-baserte simuleringen.
