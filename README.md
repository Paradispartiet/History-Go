# 🧭 History GO

History GO er et stedbasert lærings- og spillunivers der byen fungerer som spillbrett. Spilleren oppdager steder, tar quiz, låser opp kunnskap, samler personer/steder/merker og kan bruke kunnskapen videre i egne spillmoduler som Civication, Football Manager, Film Producer, Kunstskolen og Skrivekunstakademiet.

Denne rot-README-en skal være **startside og veiviser**, ikke idéarkiv. Lange konsepter, audits og produktnotater skal ligge i `docs/`, `README/` eller relevant modulmappe.

---

## Start her

| Behov | Les dette |
|---|---|
| Overordnet systembeskrivelse | [`README/README.md`](./README/README.md) |
| Systemkart og arkitektur | [`README/SYSTEM_MAP.md`](./README/SYSTEM_MAP.md) |
| Systemkontrakter og regler | [`README/SYSTEM_REGISTRY.md`](./README/SYSTEM_REGISTRY.md) |
| Pensum, emner og progresjon | [`README/README.pensum.md`](./README/README.pensum.md) |
| Civication mailsystem og rollemodeller | [`data/Civication/README-mailsystem-og-rolemodels.md`](./data/Civication/README-mailsystem-og-rolemodels.md) |
| Civication arbeidsdag / fase-audit | [`docs/CIVICATION_WORKDAY_PHASE_INTEGRATION_AUDIT.md`](./docs/CIVICATION_WORKDAY_PHASE_INTEGRATION_AUDIT.md) |
| Hvorfor spillet føles rotete / spillbar hovedvei | [`docs/CIVICATION_PLAYABLE_FLOW_AUDIT.md`](./docs/CIVICATION_PLAYABLE_FLOW_AUDIT.md) |
| AHA Music → History Go | [`docs/AHA_MUSIC_INTEGRATION.md`](./docs/AHA_MUSIC_INTEGRATION.md) |
| Civication rollepakke-standard | [`docs/CIVICATION_ROLE_PACK_STANDARD.md`](./docs/CIVICATION_ROLE_PACK_STANDARD.md) |
| Utviklernotater | [`README/README_DEV.md`](./README/README_DEV.md) |

---

## Spillbar hovedreise

### 1. History GO-kjernen

```text
Kart
  → sted
  → check-in / quiz
  → stedmerke + kunnskap + person/place-unlock
  → profil / samling / ruter / videre anbefaling
```

Kjernen skal være enkel: finn et sted, gjør én tydelig handling, få én tydelig belønning, se hva som åpnet seg videre.

### 2. Civication-kjernen

```text
Velg / lås opp rolle
  → Dagens fase viser status
  → Neste handling er eneste svarflate
  → svar på aktiv sak
  → konsekvens / læring / task / relasjon
  → neste sak eller neste fase
  → dagslutt / oppsummering / ny dag
```

**Regel:** Spilleren skal aldri måtte lete mellom Innboks, Dagens fase, WorkdayPanel og gamle eventflater for å skjønne hva som er neste aktive handling. Disse flatene kan vise kontekst, men **Neste handling** skal eie selve valget.

### 3. AHA-kjernen

```text
History GO / Civication lager hendelser og kunnskap
  → AHA analyserer, forklarer og strukturerer
  → AHA skal ikke være primær navigasjon i spill-løkken
```

AHA er analyse- og innsiktslag. Når AHA blandes inn i selve spillflyten, må det skje som en tydelig handling: “analyser dette”, “forklar dette”, “flytt/importer data”, ikke som skjult ekstra navigasjon.

---

## Hvorfor det har blitt rotete

1. **README ble både forside, idébibel og statusarkiv.** Roten sa at all dokumentasjon lå i `/README/`, men fortsatte likevel med lang idétekst og delvis overlappende status. Det gjorde startpunktet uklart.

2. **Civication har flere motorer rundt samme arbeidsdag.** `MailRuntime` eier langsiktig rolleprogresjon, `DailyMailBuilder` bygger dagsrytmen, `MailEngine` lagrer innboks, `EventEngine` svarer på hendelser, `DayProgression` vurderer fase, og UI-lagene viser ulike deler av samme tilstand. Det er kraftig, men gir blindveier hvis ikke én flate eier “hva gjør jeg nå?”.

3. **Det finnes fallback-innhold.** Når en rolle mangler gode nok `mailFamilies`, `choices` eller slot-spesifikt innhold, kan systemet falle tilbake på generiske saker og generiske valg. Da får spilleren følelsen av at alle tråder har samme svaralternativer.

4. **Fasebegrepet er ikke helt ryddig i hodet til systemet.** Noen dokumenter beskriver arbeidsdagen som fem faser, mens `mailDayProgram` opererer med en mer detaljert dagsrytme. Det gjør at UI og dokumentasjon kan peke spilleren i litt ulike retninger.

5. **Det er for mange sekundære innganger.** Innboks, Dagens fase, WorkdayPanel, profilkort, tasks, knowledge, AHA og gamle eventflater kan alle fremstå som “neste sted å gå”. Spillet trenger én hovedknapp og en hard regel for hva som er primær handling.

Se den konkrete analysen og oppryddingsrekkefølgen i [`docs/CIVICATION_PLAYABLE_FLOW_AUDIT.md`](./docs/CIVICATION_PLAYABLE_FLOW_AUDIT.md).

---

## Navigasjonsregel fra nå

```text
Statusflater forklarer.
Neste handling lar spilleren handle.
Innboks arkiverer og kontekstualiserer.
WorkdayPanel gir oversikt.
Dagens fase viser progresjon.
Ingen av dem skal konkurrere om å være svarflaten.
```

Konsekvens:

- Ikke legg nye svarvalg direkte i Dagens fase.
- Ikke gjør Innboks til en parallell aktiv spillflate for dagens fasesak.
- Ikke la WorkdayPanel starte egen progresjon.
- Ikke lag ny dagmotor hvis `DailyMailBuilder + mailDayProgram` kan eie det.
- Ikke legg nye rolle-mappings lokalt i UI eller EventEngine når resolver/runtime allerede finnes.

---

## Viktige kommandoer

```bash
npm run build:web
npm run smoke:web
npm run test:civication
npm run test:civication-next-action
npm run civication:boot-smoke
npm run audit:civication:role-packs
npm run tools:check
```

For steddata:

```bash
npm run places:index:build
npm run places:index:check
```

`data/places/places_index.json` er build-output og skal regenereres fra source-filene under `data/places/...`, ikke håndredigeres.

---

## README-regel

Rot-README-en skal bare svare på:

1. Hva er prosjektet?
2. Hvor starter man?
3. Hva er spillbar hovedreise?
4. Hvilke dokumenter er autoritative?
5. Hvilke kommandoer sjekker at ting henger sammen?

Alt annet skal flyttes til dedikerte dokumenter. Det er nødvendig fordi prosjektet nå består av flere spill og moduler, og fordi en lang blandet README gjør at både utvikler og spiller mister veien gjennom systemet.
