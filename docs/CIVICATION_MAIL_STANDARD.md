# Civication Mail Standard

Status: **authoringstandard for maildelivery/source-format**  
Sist reconcilet: **2026-08-18**

## 1. Grunnregel

`scene` er gameplay-enheten. Mail er én delivery.

En mailfil kan være et godt authored sourceformat for en scene, men runtime skal ikke anta at alt gameplay er mail. Det samme Role World-beatet kan materialiseres som mail, conversation, meeting, task eller notification.

Canonical scene- og runtimekontrakt: [`../data/Civication/SCENE_PIPELINE_V1.md`](../data/Civication/SCENE_PIPELINE_V1.md).

## 2. Hva en god maildelivery gjør

Når mail er riktig delivery, bør den:

- ha en konkret avsender eller institusjon;
- formidle en konkret situasjon;
- vise sosialt/faglig press uten å bli en forklaringsartikkel;
- ha `decision`, `task`, `ack` eller `info`-semantikk som faktisk passer innholdet;
- ha reelle valg bare når scenen faktisk er en beslutning;
- kunne bære relasjon, tillit, risiko, status, kunnskap eller senere konsekvens;
- passe inn i Role World-/mailPlan-/praksisfortellingens større bue.

`info` skal ikke få falske A/B-valg bare for å være «spillbar». `decision` skal ikke skjules som info hvis spilleren faktisk må velge.

## 3. Kort, konkret og situert

Maildelivery bør være mobilvennlig og rytmisk. `purpose` og `stakes` kan ligge i source-data som redaksjonelle kvalitetsfelt uten å vises direkte i UI.

God situasjon:

```text
Noen vil noe.
Noe står på spill.
Rollen din begrenser hva du kan gjøre.
Et valg eller en respons får en sosial/praktisk konsekvens.
```

Dårlig situasjon:

```text
Her er tre generiske svar på et abstrakt dilemma uten person, sted, historikk eller senere betydning.
```

## 4. Valg

Valg skal være konkrete handlinger eller replikker, ikke etiketter som «vær effektiv» eller «ta ansvar».

Gode forskjellsakser kan være:

- formell / uformell
- lojal oppover / lojal nedover
- faglig presisjon / tempo
- relasjonell / instrumentell
- synlighet / forsiktighet
- kortsiktig / langsiktig

Det skal ikke finnes ett åpenbart «moralsk riktig» svar i alle scener. Civication er først og fremst et konsekvenssystem.

## 5. Personer

En viktig avsender skal være del av en relasjon, ikke bare en tekstgenerator. For Role World-complete roller eies den dypere sosialstrukturen av [`CIVICATION_ROLE_WORLD_STANDARD.md`](./CIVICATION_ROLE_WORLD_STANDARD.md): klasseposisjon, status, makt over spilleren, mål, skjult side, talemåte og læringsfunksjon.

## 6. Sted

`place_id` skal brukes når stedet faktisk former situasjonen, institusjonen eller konflikten. Det skal ikke fylles som pynt.

## 7. Mailtyper er source-/dramaturgifunksjoner

Legacytypene `job`, `micro`, `people`, `conflict`, `followup`, `story`, `event`, `knowledge` og `consequence` kan fortsatt brukes i authored kilder og mappes til Scene Contract. De er ikke separate runtime-motorer.

## 8. Tråder

Et lokalt `triggers_on_choice` + `Re:`-followup kan vise at en person reagerer på et svar. Se [`CIVICATION_THREAD_STANDARD.md`](./CIVICATION_THREAD_STANDARD.md).

Dette må ikke forveksles med en **Role World primary thread**, som kan utvikle samme relasjon over 5–10 beats/scener og flere dager.

## 9. Role World

En god mail kan være sterk uten at hele rollen er fylt. `reference_complete` i Career Gameplay Matrix er derfor ikke Role World-completion.

For `role_world_complete` kreves blant annet:

- sosiologisk kjerne;
- recurring NPC-bibel;
- 14 dager × fire dramaturgiske faser;
- primære relasjonelle tråder;
- privat etterklang;
- forsinkede konsekvenser;
- materialisering gjennom eksisterende Scene Pipeline.

## 10. Film/Story Theme Bank

Abstrakte temaer kan brukes som redaksjonelt råmateriale via `data/Civication/roleWorldThemeBank.json`. Mailtekst skal aldri kopiere filmhandling, karakterer, dialog eller konkrete scener.

## 11. Runtimegrense

Normal work-runtime:

```text
mailFamilies / FWG / andre authored kilder
→ build/normalisering
→ civication_scene_v1
→ compiledSceneRegistryV1
→ SceneCatalog → SceneDirector
→ delivery / NextAction
→ ChoiceDirector
```

Rå `mailFamilies` er ikke en fallback ved null canonical scene. `RoleStoryletBridge`, `jobbmails`, gammel `buildMailPool` og generiske career-mails skal heller ikke overta.

## 12. Kvalitetssjekk

Før en ny mail-source legges inn:

1. Er mail riktig delivery for scenen?
2. Er avsender og situasjon konkret?
3. Er interaksjonsmodusen riktig?
4. Er valg reelle hvis det er en decision?
5. Har person/sted faktisk funksjon?
6. Passer den inn i en større tråd eller bue der relevant?
7. Kan den normaliseres til `civication_scene_v1`?
8. Bruker den eksisterende state/effects i stedet for å opprette skjult runtime?
9. Unngår den kopiert plot/dialog/karakter?
10. Skjuler den ingen innholdsmangel med generisk fallback?
