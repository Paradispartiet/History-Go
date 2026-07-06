# privatePhaseMailFamilies

Private fase-mailer for Civications **døgnrytme** (ikke arbeidsdag). Én fil per
privat fase:

- `morning.json`
- `lunch.json`
- `afternoon.json`
- `dinner.json`
- `evening.json`
- `day_end.json`

Bygges av `CivicationPrivatePhaseMailBuilder`
(`js/Civication/systems/civicationPrivatePhaseMailBuilder.js`). Se «To rytmer» i
`js/Civication/README.md`.

## Hva de handler om

Kun livet utenfor jobben: morgenrutine, mat, hvile, økonomi, familie, venner,
fritid, helse, søvn, læring, personlig kalender, sosialt liv, energi og psyke.

## Hva de ALDRI handler om

Aktiv jobbcase, arbeidsgiveroppgave, plansjef, utvalg, utbygger, plankart,
Lillebekk, varelevering, rolleprogresjon, mailPlan, role_scope, arbeidsleveranse.

## Kontrakt

- Maks 1 aktiv mail per privat fase.
- Builderen stempler autoritativt disse feltene på hver mail:
  `source_type:"daily_private_phase"`, `channel:"private"`,
  `messageChannel:"private"`, `mail_class:"daily_private"`, `role_scope:""`,
  `career_id:""`, `role_id:""`, `employer_id:""`, `workday_related:false`.
- Bruker **ikke** mailPlan, role mail families, plannedPrimary eller role_scope.

## Skjema (per fil)

```jsonc
{
  "schema": "civication_private_phase_mail_family_v1",
  "phase": "morning",
  "phase_label": "Morgen",
  "topics": ["morgenrutine", "søvn", "…"],
  "mails": [
    {
      "id": "private_morning_rutine_001",
      "topic": "morgenrutine",
      "subject": "…",
      "summary": "…",
      "situation": ["…", "…"],
      "choices": [
        { "id": "A", "label": "…", "reply": "…", "effect": 1, "tags": ["helse"], "feedback": "…" }
      ]
    }
  ]
}
```

Feltene `source_type`/`channel`/`messageChannel`/`mail_class`/`role_scope`/
`career_id`/`role_id`/`employer_id`/`workday_related` kan stå på toppnivå som
dokumentasjon, men er uansett garantert av builderen.
