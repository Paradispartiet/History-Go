# Civication rolle-skolemaler

Dette dokumentet er arbeidsgrunnlag for å bygge Civication-roller som små faglige skoler i arbeidsstillinger.

Målet er at hver jobb skal lære spilleren hvordan en bestemt del av arbeidslivet, samfunnet, organisasjonen og hverdagsmakten faktisk fungerer.

Fast arbeidsregel:

```text
Først bygger vi rollen som skole.
Så bygger vi den som spill.
Så bygger vi humor/twists.
```

Humor, absurditet og twists skal komme senere som et presist lag oppå faglig korrekt rolleforståelse. Grunnmodellen skal være sosiologisk, konkret og arbeidslivsnær.

---

## 1. Rolle som sosiologisk skole

Bruk denne malen før JSON skrives.

```text
ROLLE-SKOLE

Rolle:
role_id:
role_scope:
kategori:
nivå:

1. Sosiologisk kjerne
Hva lærer denne jobben spilleren om samfunnet?
Hvilken del av arbeidslivet åpner rollen?
Hvilke institusjoner, maktformer eller sosiale logikker blir synlige gjennom rollen?

2. Arbeidets faktiske praksis
Hva gjør spilleren konkret i løpet av en arbeidsdag?
Hvilke oppgaver gjentas?
Hvilke oppgaver virker små, men betyr mye?
Hvilke praktiske rytmer, avbrudd, frister og avhengigheter styrer dagen?

3. Institusjonell plassering
Hvem bestemmer over rollen?
Hvem er rollen avhengig av?
Hvem rapporterer rollen til?
Hvilke systemer, regler, rutiner, standarder og skjemaer former arbeidet?

4. Klasse, status og hierarki
Hvor ligger rollen i arbeidslivets rangorden?
Hva gir rollen lav eller høy status?
Hva ser andre ned på, men rollen selv vet er viktig?
Hvilke former for respekt, usynlighet eller anerkjennelse preger rollen?

5. Taus kunnskap
Hva må læres gjennom praksis?
Hva står ikke i manualen?
Hva forstår bare de som har vært i rollen en stund?
Hvilke små tegn, snarveier, rytmer og uformelle regler må spilleren lære å lese?

6. Kapitalformer
Økonomisk kapital:
Kulturell kapital:
Sosial kapital:
Symbolsk kapital:

7. Makt
Formell makt:
Uformell makt:
Makt over egen arbeidstid:
Makt over andre:
Makt gjennom kunnskap:
Maktløshet:

8. Typiske konflikter
Konflikt 1:
Konflikt 2:
Konflikt 3:
Konflikt 4:

9. Dilemmaer
Hvilke valg har ingen perfekt løsning?
Hva koster det å gjøre det riktige?
Hva koster det å være lojal?
Hva koster det å si ifra?
Hva koster det å beskytte seg selv?

10. Hva spilleren skal lære
-
-
-
-
-

11. Rollen som skole
Etter å ha spilt denne rollen skal spilleren forstå:
-
-
-

12. Senere humor/twist-lag
Hvilke situasjoner kan senere få absurd, tørr eller satirisk vri?
-
-
-
```

---

## 2. Rolleinnhold til `data/Civication/roles/naer_*.json`

Dette er mal for rikt rolleinnhold. Den skal brukes etter at rolle-skolen er skrevet faglig.

```json
{
  "schema": "civication_role_content_v1",
  "version": 1,
  "category": "naeringsliv",
  "tier_label": "",
  "role_id": "",
  "role_name": "",
  "role_level": 0,
  "primary_conflict": "",
  "secondary_conflict": "",
  "background_conflict": "",
  "tone": [
    "",
    "",
    ""
  ],
  "role_summary": "",
  "actual_work": [
    "",
    "",
    "",
    "",
    ""
  ],
  "key_skills": [
    "",
    "",
    "",
    "",
    ""
  ],
  "common_irritations": [
    "",
    "",
    ""
  ],
  "misconception": "",
  "what_player_learns": [
    "",
    "",
    ""
  ],
  "knowledge_layers": {
    "field_knowledge": [
      "",
      "",
      ""
    ],
    "role_knowledge": [
      "",
      "",
      ""
    ],
    "situational_knowledge": [
      "",
      "",
      ""
    ]
  },
  "scenario_families": [
    {
      "family_id": "",
      "title": "",
      "primary_conflict": "",
      "secondary_conflict": "",
      "what_it_teaches": [
        "",
        "",
        ""
      ]
    }
  ],
  "storylets": []
}
```

---

## 3. Job Learning Profile

Dette er kort læringskontrakt for `data/Civication/jobLearningProfiles.json > profiles[role_id]`.

`jobLearningProfiles.json` skal ikke være full rollebeskrivelse. Den skal kun definere læringsverdi, hva rollen lærer spilleren, mastery threshold, overførbare ferdigheter og dead-end risk.

```json
"naer_<rolle>": {
  "learning_value": "high",
  "teaches": [
    "",
    "",
    "",
    "",
    "",
    ""
  ],
  "mastery_threshold": 8,
  "usefulness": "high",
  "transferable_skills": [
    "",
    "",
    "",
    "",
    "",
    ""
  ],
  "dead_end_risk": "medium"
}
```

Bruk:

```text
learning_value = hvor mye rollen faktisk lærer spilleren
teaches = korte setninger om hva rollen lærer
mastery_threshold = hvor mange kvalifiserende jobbmail-steg før rollen mestres
usefulness = hvor overførbar læringen er
transferable_skills = ferdigheter spilleren tar med videre
dead_end_risk = om rollen kan bli rutine/blindvei
```

---

## 4. Scenariofamilie

Scenariofamilier er broen mellom sosiologisk rolleforståelse og spillbare situasjoner.

```json
{
  "family_id": "",
  "title": "",
  "primary_conflict": "",
  "secondary_conflict": "",
  "what_it_teaches": [
    "",
    "",
    ""
  ],
  "typical_situations": [
    "",
    "",
    ""
  ],
  "sociological_point": "",
  "workplace_logic": "",
  "possible_twist_later": ""
}
```

Eksempel:

```json
{
  "family_id": "rutine_som_skjult_kompetanse",
  "title": "Rutine som skjult kompetanse",
  "primary_conflict": "tempo_vs_kvalitet",
  "secondary_conflict": "synlig_enkelhet_vs_skjult_kompleksitet",
  "what_it_teaches": [
    "at rutinearbeid ofte bærer organisasjonen uten å bli anerkjent",
    "at det som ser enkelt ut utenfra kan kreve presis lokal kunnskap",
    "at stabilitet er en form for kompetanse"
  ],
  "typical_situations": [
    "en liten feil i rekkefølgen skaper forsinkelse flere ledd senere",
    "en ny regel virker fornuftig på papiret, men passer dårlig i praksis",
    "en erfaren kollega løser noe raskt uten å kunne forklare hele metoden"
  ],
  "sociological_point": "Arbeidets verdi ligger ofte i usynlig koordinering, ikke bare i formell kompetanse.",
  "workplace_logic": "Den som kjenner rytmen, holder systemet i gang.",
  "possible_twist_later": "Ledelsen innfører et forbedringsskjema som gjør forbedringene tregere."
}
```

---

## 5. Storylet

Storylets er konkrete situasjoner spilleren møter. De skal være små, presise arbeidslivssituasjoner med valg som sier noe om rollen.

```json
{
  "id": "",
  "family_id": "",
  "title": "",
  "primary_conflict": "",
  "secondary_conflict": "",
  "tone": [
    "",
    "",
    ""
  ],
  "summary": "",
  "situation": [
    ""
  ],
  "choices": [
    {
      "id": "A",
      "label": "",
      "tags": [
        ""
      ],
      "effect_bias": ""
    },
    {
      "id": "B",
      "label": "",
      "tags": [
        ""
      ],
      "effect_bias": ""
    },
    {
      "id": "C",
      "label": "",
      "tags": [
        ""
      ],
      "effect_bias": ""
    }
  ],
  "what_player_learns": [
    "",
    ""
  ],
  "progress_tags": [
    "",
    "",
    ""
  ],
  "capital_bias": [
    "",
    ""
  ],
  "psyche_bias": [
    "",
    ""
  ]
}
```

---

## 6. MailPlan

MailPlan definerer dramaturgisk progresjon for en rolle. Den skal ikke inneholde selve mailteksten.

```json
{
  "schema": "civication_mail_plan_v1",
  "category": "naeringsliv",
  "role_scope": "",
  "role_id": "",
  "title": "",
  "description": "",
  "sequence": [
    {
      "step": 1,
      "type": "job",
      "phase": "intro",
      "allowed_families": [
        "<role_scope>_intro_v2"
      ],
      "fallback_types": [
        "job",
        "story"
      ]
    },
    {
      "step": 2,
      "type": "job",
      "phase": "basic_practice",
      "allowed_families": [
        "<role_scope>_job"
      ],
      "fallback_types": [
        "job",
        "conflict"
      ]
    },
    {
      "step": 3,
      "type": "conflict",
      "phase": "first_pressure",
      "allowed_families": [
        "<role_scope>_conflict"
      ],
      "fallback_types": [
        "job",
        "story"
      ]
    },
    {
      "step": 4,
      "type": "story",
      "phase": "role_identity",
      "allowed_families": [
        "<role_scope>_story"
      ],
      "fallback_types": [
        "job",
        "conflict"
      ]
    },
    {
      "step": 5,
      "type": "event",
      "phase": "external_pressure",
      "allowed_families": [
        "<role_scope>_event"
      ],
      "fallback_types": [
        "conflict",
        "story"
      ]
    }
  ]
}
```

---

## 7. MailFamily

MailFamily inneholder konkrete jobbmailer. Mailene skal være simuleringer, ikke bare meldinger.

```json
{
  "schema": "civication_mail_family_catalog_v2",
  "category": "naeringsliv",
  "role_scope": "",
  "mail_type": "job",
  "families": [
    {
      "id": "",
      "title": "",
      "purpose": "",
      "learning_focus": [
        "",
        ""
      ],
      "mails": [
        {
          "id": "",
          "mail_type": "job",
          "mail_family": "",
          "role_scope": "",
          "from": "",
          "place_id": "",
          "subject": "",
          "summary": "",
          "purpose": "",
          "stakes": "",
          "situation": [
            ""
          ],
          "task_domain": "",
          "competency": "",
          "pressure": "",
          "choice_axis": "",
          "consequence_axis": "",
          "narrative_arc": "",
          "learning_focus": [
            "",
            ""
          ],
          "choices": [
            {
              "id": "A",
              "label": "",
              "reply": "",
              "tags": [
                ""
              ],
              "effect": 0,
              "feedback": "",
              "triggers_on_choice": ""
            },
            {
              "id": "B",
              "label": "",
              "reply": "",
              "tags": [
                ""
              ],
              "effect": 0,
              "feedback": ""
            }
          ]
        }
      ],
      "threads": []
    }
  ]
}
```

---

## 8. Faglig kontroll før rollen godkjennes

```text
KVALITETSSJEKK FOR ROLLE

1. Faglig riktighet
- Bygger rollen på en realistisk forståelse av arbeidshverdagen?
- Viser rollen faktisk praksis, ikke bare tittel?
- Har rollen sosiologisk substans?

2. Spillbarhet
- Finnes det konkrete situasjoner?
- Finnes det valg med konsekvenser?
- Finnes det progresjon fra nybegynner til mestring?

3. Læring
- Lærer spilleren noe om arbeidsliv, makt, klasse, organisasjon eller institusjoner?
- Har rollen tydelige transferable skills?
- Er mastery_threshold logisk?

4. Sosial presisjon
- Viser rollen formell og uformell makt?
- Viser rollen status, hierarki og avhengighet?
- Viser rollen taus kunnskap?

5. Datastruktur
- role_id matcher learning profile
- role_scope matcher mailPlan og mailFamilies
- allowed_families finnes faktisk som family.id
- choices har minst to reelle valg
- storylets ligger i rolleinnhold, ikke i jobLearningProfiles
- progresjon lagres i state, ikke i statiske datafiler
```

---

## 9. Minimumskrav til en ferdig rollepakke

```text
En ferdig rollepakke skal ha:

1. Faglig rolle-skole i chat eller dokumentasjon
2. Rolleinnhold i data/Civication/roles/naer_<rolle>.json
3. Egen profil i data/Civication/jobLearningProfiles.json > profiles[role_id]
4. MailPlan i data/Civication/mailPlans/naeringsliv/<role_scope>_plan.json
5. MailFamilies for intro, job, conflict, story og event
6. Konsistente role_id, role_scope og family.id-er
7. Validering via relevante audit/test-skript
```

---

## 10. Kjerneformel

```text
Rolle = arbeidspraksis + sosiologisk logikk + læringsmål + spillbare valg + konsekvenser
```

Dette er standarden for videre Civication-rollebygging.
