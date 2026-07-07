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

## Prinsipp: en projeksjon av History Go-profilen

> **Private fase-mailer er en projeksjon av History Go-profilen. De skal speile
> hva spilleren har samlet, besøkt, lært og bygget opp. Arbeidslivsmail tilhører
> bare arbeidsdagen.**

To spillere med **samme jobb** men ulik History Go-profil skal få **ulike**
private fase-mailer. Samme profil med **ulik jobb** skal få **samme** private
fase-mailer. Jobb (aktiv rolle, role mail families, mailPlan, workday-case) er
aldri kilde til en privat fase-mail.

Profilen leses av `CivicationProfileSignalBridge.getSignals()`, som normaliserer
identitet, kapital, psyke og History Go-samlingen (steder, kategorier, badges,
quiz-styrker, folk møtt, nylige steder, favorittbydeler) til `profileTags` og
`privatePhaseWeights`. Builderen velger mail etter disse — **profilmatch slår
alltid tilfeldig/dato-rotasjon**; dato-rotasjon brukes bare mellom like gode
kandidater, og uten profiltreff faller den tilbake til en trygg generisk pool.

### profileTags og privatePhaseWeights

`privatePhaseWeights` (0..1): `culture`, `sport`, `nature`, `politics`,
`social`, `learning`, `economy`, `rest`, `family`, `subculture`.

`profileTags` inkluderer temaene over når vekten er høy nok, pluss `low_energy`
/ `rest` ved lav psyke/energi, `people` ved nok folk møtt, canonical
domenetags fra besøkte steder og badges (f.eks. `kunst`, `sport`, `natur`,
`politikk`, `subkultur`) og `identity_<dominant>`.

Signalene som mates inn (alle med trygg fallback hvis kilden mangler):
`HG_IdentityCore` / `hg_identity_v1`, `hg_capital_v1`, `CivicationPsyche` /
`hg_psyche_v1` (inkl. `energy`), `visited_places`, `merits_by_category`,
`people_collected`, `hg_learning_log_v1`, og steds-indeksen for kategori/bydel.

### Profilfelter på en mail-kandidat

| Felt | Betydning |
| --- | --- |
| `requiresAnyProfileTags` | Mailen er kandidat kun hvis minst én tag matcher spillerens `profileTags`. Mangler feltet, er mailen i den generiske poolen. |
| `preferredProfileTags` | Myk preferanse; matchede tags løfter scoren litt. |
| `avoidAnyProfileTags` | Mailen utelukkes hvis en av disse matcher. |
| `weightFrom` | Liste av signal-stier (f.eks. `"capital.cultural"`, `"privatePhaseWeights.sport"`, `"identity.focus.political"`) som summeres til scoren. Verdier >1 tolkes som 0..100 og normaliseres. |

Lav energi (`low_energy`) demper alle ikke-hvile-mailer og løfter hvile/søvn, så
`evening`/`day_end` vekter ro — aldri mer press.

Konkrete profil-mailer finnes for kultur (lesing/bokhandel/museum/utstilling/
kultursted), sport (trening/bane/kamp), natur (gåtur/park/ro/utsikt), politikk
(lokalmøte/debatt/sak), sosialt (møte venn/ringe kontakt), økonomi (budsjett/
billig mat/spare), subkultur/musikk (konsert/klubb/nisjemiljø) og lav
energi (hvile/søvn/ro).

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
      // Profilfelter (valgfrie): styrer projeksjonen fra History Go-profilen.
      "requiresAnyProfileTags": ["culture", "kunst", "learning"],
      "preferredProfileTags": ["culture"],
      "avoidAnyProfileTags": ["low_energy"],
      "weightFrom": ["capital.cultural", "identity.focus.cultural"],
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

En mail **uten** `requiresAnyProfileTags` er en generisk fallback-mail (nøytralt
privatliv, aldri jobb) og velges kun når ingen profilmatch finnes.

Feltene `source_type`/`channel`/`messageChannel`/`mail_class`/`role_scope`/
`career_id`/`role_id`/`employer_id`/`workday_related` kan stå på toppnivå som
dokumentasjon, men er uansett garantert av builderen.
