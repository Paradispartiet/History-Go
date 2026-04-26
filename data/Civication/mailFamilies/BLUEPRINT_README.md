# Mail-familie blueprint (v2)

Eksempel: `naeringsliv/job/arbeider_intro_v2.json` + `naeringsliv/npcs/naeringsliv.json`.

Demonstrerer fire grep som forsterker mailene **uten ny director-kode**:

## 1. Navngitte avsendere via `from`

Hver mail har `from: "<npc_id>"` som peker til NPC-katalogen i
`data/Civication/npcs/<kategori>.json`. NPC-katalogen definerer
navn, tittel, "voice" og hjemsted én gang.

UI-en kan slå opp NPC-en og vise:

> **Egil Berg** — Skiftleder, kontrollrommet
> *Re: Skiftet i morgen — Lilleborg*

i stedet for et tomt avsenderfelt.

## 2. Konkret stedsforankring via `place_id`

Hver mail peker til en HG-place. Når UI viser mailen, kan den vise
stedet (eller la brukeren klikke videre til stedet i HG).
`place_id`-er må finnes i `data/places/`-manifestet.

## 3. Re:-kjeder via `triggers_on_choice`

Et valg kan ha `triggers_on_choice: "<thread_id>"`. Når brukeren
velger det alternativet, legger systemet thread-mailen i inbox
(samme dag eller neste tick).

Threads ligger på familie-nivå under `"threads": [...]`. De har
samme schema som vanlige mails, men leves *kun* når de trigges.

Effekt: én mail blir til en tråd-samtale på 2–3 mails.

## 4. Subjects og choices skrevet som ekte mail-emner og replikker

Før: `"label": "Følge flyten tett og lære mens du gjør"`
Etter: `"label": "Møt opp 06:45 med termos."` + `"reply": "..."`

`reply` er valgfritt — det er den korte teksten UI viser i Re:-tråd
*som ditt svar*. Hvis ikke satt brukes label.

## Datamodell

```
{
  "schema": "civication_mail_family_catalog_v2",
  "category": "naeringsliv",
  "role_scope": "arbeider",
  "mail_type": "job",

  "families": [
    {
      "id": "arbeider_intro_v2",
      "mails": [
        {
          "id": "...",
          "from": "egil_kontrollrom",       // NEW: NPC-id
          "place_id": "lilleborg_fabrikker", // NEW: HG-place
          "subject": "Re: Skiftet i morgen",
          "situation": [...],
          "choices": [
            {
              "id": "A",
              "label": "Møt opp 06:45 med termos.",
              "reply": "Møt opp 06:45 med termos.",  // NEW: kort svar
              "tags": [...],
              "effect": 0,
              "feedback": "...",
              "triggers_on_choice": "egil_thread_morning_a"  // NEW
            }
          ]
        }
      ],

      "threads": [                           // NEW: Re:-oppfølgere
        {
          "id": "egil_thread_morning_a",
          "from": "egil_kontrollrom",
          "place_id": "lilleborg_fabrikker",
          "subject": "Re: Re: Skiftet i morgen",
          "situation": [...],
          "choices": [...]
        }
      ]
    }
  ]
}
```

## Kompatibilitet

Eksisterende V1-mailer fortsetter å fungere uendret. Director-koden
trenger små tilføyelser for å:

1. Slå opp `from` mot NPC-katalogen ved render (~10 linjer)
2. Når en choice velges, sjekke `triggers_on_choice` og enkø
   thread-mailen (~15 linjer)
3. La UI vise NPC-navn og place-link (~20 linjer i CivicationUI)

Til sammen ~45 linjer kode for å aktivere V2. V1-mailer ser identiske
ut for brukeren.

## Hvordan oversette eksisterende familie

For hver V1-familie, gjør disse passene:

1. **Velg NPC-galleri.** 3–5 navn per kategori. Skriv dem inn i
   `data/Civication/npcs/<kategori>.json`.
2. **Velg place-pool.** 3–5 HG-places som passer rolle/scenario.
3. **Tildel `from` og `place_id` per mail.** En NPC kan dukke opp
   i flere mails for å bygge bekjentskap.
4. **Skriv om subjects** som ekte mail-emner. Eksempler:
   - "Forbedring uten mandat" → "Forslag på linje B"
   - "Du merker blikkene før ordene" → "Tempo i dag"
5. **Skriv om choices** som korte handlinger eller direkte sitat.
   Tenk replikk, ikke konsept.
6. **Legg til `reply` på minst halvparten** av choices, så UI kan
   vise tråden senere.
7. **Skriv 1 thread per choice** for de viktigste mailene
   (ikke alle — start med dem som markerer relasjoner).
