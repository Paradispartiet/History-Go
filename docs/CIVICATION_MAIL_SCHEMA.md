# Civication Mail Schema

Dette dokumentet beskriver minimumsstrukturen for Civication-mail. Schemaet gjelder først og fremst `planned` jobbmail, men skiller også tydelig mellom `planned`, `thread`, `life` og `phase`.

## Overordnet eierskap

| source_type | Eier | State |
|---|---|---|
| `planned` | `CivicationMailRuntime` | `mail_runtime_v1` |
| `thread` | `CivicationMailRuntime` | `mail_runtime_v1` |
| `life` | `CivicationLifeMailRuntime` | `life_mail_runtime_v1` |
| `phase` | `dayEvents.js` | phase/day history |

## Planned-mail: minimum

```json
{
  "id": "ekspeditor_kasse_prisavvik_001",
  "mail_type": "job",
  "mail_family": "kasse_og_pris",
  "subject": "Prisavvik i kassa – kunden har sett tilbudsskiltet",
  "summary": "Kassa viser en høyere pris enn skiltet i hylla.",
  "situation": [
    "En kunde kommer til kassa med en vare som går inn til høyere pris enn skiltet i hylla.",
    "Bak kunden bygger køen seg opp.",
    "Du må velge mellom tempo, korrekthet og kundetillit."
  ],
  "task_domain": "kasse",
  "competency": "noyaktighet",
  "pressure": "ko_bygger_seg_opp",
  "choice_axis": "tempo_vs_korrekthet",
  "consequence_axis": "kundetillit",
  "narrative_arc": "forste_uke_pa_gulvet",
  "choices": [
    {
      "id": "A",
      "label": "Stopp opp og sjekk skiltet før du korrigerer prisen",
      "effect": 1,
      "tags": ["noyaktighet", "kundetillit", "rutine"],
      "feedback": "Du taper litt tempo, men viser at prisen, kunden og rutinen tas på alvor."
    }
  ]
}
```

## Påkrevde felt

Alle mailer i `mailFamilies` skal ha:

- `id`
- `mail_type`
- `mail_family`
- `subject`
- `summary`
- `situation`
- `choices`

Alle choices skal ha:

- `id`
- `label`
- `effect`
- `tags`
- `feedback`

For arbeidslivssimulering anbefales også:

- `task_domain`
- `competency`
- `pressure`
- `choice_axis`
- `consequence_axis`
- `narrative_arc`

## Mail-type

### `job`
Konkrete arbeidsoppgaver.

Eksempler:

- prisavvik i kassa
- tom hylle
- varepåfylling før rush
- kampanjeskilt som er feil
- lagerstatus som ikke stemmer

### `people`
Relasjonelle arbeidssituasjoner.

Eksempler:

- ny kollega spør deg
- erfaren kollega lærer deg en snarvei
- leder tester deg med en liten oppgave
- kunde husker hvordan du håndterte en sak

### `conflict`
Regel-, verdi- eller rollekonflikt.

Eksempler:

- tempo mot korrekthet
- salg mot ærlighet
- service mot regel
- lojalitet mot integritet
- snarvei mot rutine

### `story`
Yrkesidentitet, mening og rolleforståelse.

Eksempler:

- hva service egentlig er
- hvordan gulvet bærer butikken
- hvordan taus kunnskap oppstår
- hvorfor gode rutiner ikke bare er byråkrati

### `event`
Større hendelser.

Eksempler:

- kampanjedag
- systemfeil
- svinnavvik
- travel dag
- uventet fravær
- revisjon

### `thread`
Oppfølging etter valg. Trigges via `triggers_on_choice` på choice.

## Choice-effekter

`effect` er fortsatt kortformen:

- `1` = konstruktivt valg
- `0` = blandet/risikabelt valg
- `-1` = problematisk valg

Men `tags` skal forklare hva valget egentlig påvirker.

Eksempler:

- `kundetillit`
- `noyaktighet`
- `tempo`
- `svinn_risiko`
- `integritet`
- `salg`
- `samarbeid`
- `stress`
- `leder_tillit`
- `kollega_tillit`
- `produktkunnskap`

## Vitenskapelig krav

En mail skal kunne forklares som en arbeidsanalyse:

```text
rolle + kontekst + oppgave + friksjon + valg + kompetanse + konsekvens
```

Hvis en mail ikke kan forklares slik, er den for løs.

## ID-konvensjon

Bruk stabil, lesbar ID:

```text
<role_scope>_<mail_type/domain>_<scenario>_<number>
```

Eksempler:

- `ekspeditor_kasse_prisavvik_001`
- `ekspeditor_kundemote_returoenske_001`
- `ekspeditor_people_ny_kollega_001`
- `ekspeditor_conflict_snarvei_001`
- `mellomleder_people_jahn_002`

## Filstruktur

Anbefalt struktur for Næringsliv:

```text
data/Civication/mailPlans/naeringsliv/<role_scope>_plan.json

data/Civication/mailFamilies/naeringsliv/job/<role_scope>_job.json
data/Civication/mailFamilies/naeringsliv/people/<role_scope>_people.json
data/Civication/mailFamilies/naeringsliv/conflict/<role_scope>_conflict.json
data/Civication/mailFamilies/naeringsliv/story/<role_scope>_story.json
data/Civication/mailFamilies/naeringsliv/event/<role_scope>_event.json
```

## Validator-regel

Validatoren skal feile hvis:

- samme mail-id brukes flere steder
- en mail mangler required fields
- choice mangler id/label/effect/tags/feedback
- planned-mail mangler task metadata når den ligger i Næringslivs arbeidsmodell
- en family-fil har tom `families`
- en family har tom `mails`
- JSON ikke kan parses

## Generator-regel

Generatoren skal aldri generere live i appen. Den skal bare produsere JSON-filer som kan leses, testes, redigeres og committes.

Runtime skal ikke improvisere innhold. Runtime skal velge blant ferdige, validerte mailer.
