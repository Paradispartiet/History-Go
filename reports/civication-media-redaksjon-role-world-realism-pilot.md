# Civication Journalist — structurally different Role World pilot D

Date: **2026-08-24**

Role: `media/media_redaksjon`, centered on `media_journalist`

Status: **full Role World and runtime pilot proven; Role World Realism Matrix remains a separate next PR**

## Why journalism

The fresh readiness audit compared teaching and journalism. Teaching was thin or `architecture_only`, while `media/media_redaksjon` was already canonical `playable` with a specific work grammar, a source/desk/watch-editor relationship web, three verified media places and a complete nine-type mail surface. Journalism was therefore the strongest candidate for testing a genuinely different world structure instead of producing another job package.

The pilot uses the fictional newsroom `fjordby_dagblad_redaksjonen_001` and fictional scenario people. `vg_huset` is only a canonical History Go knowledge anchor; the pilot does not make VG a fictional employer and does not put invented dialogue in the mouths of real people.

## The persistent story

```text
source alert and open evidence ledger
→ request for anonymity and editor handoff
→ waiting for the editor + History Go at VG-huset
→ situated source or professional trust response
→ editor feedback and rework of the same draft
→ version-specific publication approval
→ audience supplies verifiable corrective knowledge
→ visible correction and professional closure
```

All nine new scenes use `media_redaksjon_publication_case_001`. The object moves through source foundation, `awaiting_approval`, verification, rework, `awaiting_decision`, publication, reopening for correction and `completed`. Approval objects separately preserve source-protection and publication decisions. No new engine, scene format or day loop is introduced.

## Complete Role World

`data/Civication/roleWorlds/media/media_redaksjon.json` provides:

- exactly 14 days × morning/lunch/afternoon/evening = 56 unique beats;
- six primary threads across editor authority, source trust, audience feedback, professional culture, private leakage and evidence/rework;
- eight recurring social positions: Lina, Jonas, Amina, Ellen, Arvid, Sara, Mari and Olav;
- eight slow axes, including editor/source/audience trust, evidence trace, professional culture and correction quality;
- six explicit private-aftermath patterns and seven delayed consequences;
- broad file#id provenance across the role model, grammar, canonical mail families, VG place/story/quiz data and the existing Scene Pipeline.

## Authority and situated reputation

The source-protection scene creates a real tradeoff:

| Choice | Source Ellen | Editor Jonas | Watch editor Lina | Later scene |
| --- | ---: | ---: | ---: | --- |
| Precise editor handoff | -1 | +3 | +2 | Jonas shares the risk assessment early |
| Personal anonymity promise | +3 | -3 | -2 | Ellen sends more while Jonas restricts the process |

Both branches preserve the same authority rule: the journalist may document the need and request approval, but cannot personally guarantee anonymity. Later professional or source trust changes information sharing, feedback and relationship pressure; it never grants source-protection or publication authority.

The pilot exposed one necessary general contract field. Sources are neither `public` nor `professional`, so the existing bounded situated-standing audience vocabulary now accepts `source:*` alongside `manager:*`, `team:*`, `professional:*` and `public:*`. The change is additive in the existing schema, compiler and `civicationSocialStanding` helper. Its permanent test proves that source standing remains separate from legacy/global `career.reputation`.

## History Go and feedback/rework

`media_redaksjon_realism_knowledge_vg_001` sends the player to the canonical `vg_huset` place and existing quiz/story evidence. The task teaches one bounded distinction:

- audience response says something about reception;
- documentation says what can be evidenced;
- public interest is an editorial assessment;
- publication remains an editor decision.

Correct completion opens a third rework choice that separates those four surfaces before Jonas evaluates the version. The task gives a better journalistic sorting tool, not a qualification or approval.

After publication, Sara's document-backed audience feedback reopens the same case because ingress and graphics blur an internal priority list with a formal waiting list. The player must either rebuild all affected surfaces and propose a visible correction or make a silent local edit. Audience, source and editor standing react differently. Correction is therefore ordinary professional work and social memory, not a separate post-publication engine.

## Permanent proof

- **286/286 Civication test files** pass, including learning-profile and knowledge-requirement audits;
- `tests/civication-media-redaksjon-role-world-realism-pilot.test.js` protects the 56-beat world, all file#id provenance, the nine-scene vertical, opposing standing branches, authority boundaries and History Go affordance; a 96-branch semantic traversal proves that every authored trust, rework, publication, correction and closure choice reaches `completed`;
- `tests/civication-situated-reputation.test.js` now proves the bounded `source:*` audience without global-score leakage;
- the general Role World contract preserves the original five-world reference wave and registers journalism separately as the fourth structural pilot;
- source → compiled registry parity remains clean for all new scenes.

Materialized registry:

- **1135 scenes**
- **44 roles**
- **347 compiled sources**
- **0 shadowed duplicates**
- registry hash: `87dcd44a68485fd10935e6872245cbf3d39b8f6c11c8e900a954a34f4ca1d360`

## What Pilot D teaches the future Matrix

Proven cross-role candidates:

- persistent object identity and history;
- institution and authority context;
- deadline, waiting, handoff, interrupt and rework;
- History Go affordance without authority leakage;
- situated audiences that can be manager, team, professional, public or source;
- explicit People, Places and provenance;
- feedback that can reopen the same object after an apparent delivery.

Role-type-specific fields that must remain owned by journalism:

- `publication_case`, source-protection and publication-approval object kinds;
- evidence layers, attribution and simultaneous reply;
- source confidentiality and source motive;
- headline/ingress/graphics/version surfaces;
- visible correction and editorial after-critique.

Pilot D completes the agreed 3–4 structurally different pilots. The next PR should be the small Matrix/gate PR; broad role rollout must still wait for that gate.

## Six-part quality assessment

| Dimension | Score | Evidence |
| --- | ---: | --- |
| Correctness and evidence | 5/5 | VG place/story/quiz data is used only for documented publishing and audience context; fictional institution and people carry all invented drama. |
| Coverage and completion | 5/5 | 56 unique beats, six multi-day threads, nine compiled scenes and the complete alert→correction→closure object lifecycle are permanently tested. |
| Professional/editorial quality | 5/5 | Source dependence, simultaneous reply, editor authority, audience knowledge, correction and professional culture remain distinct pressures and relationships. |
| Technical integrity | 5/5 | Existing work-object, rhythm, authority, task, standing and Scene Pipeline contracts are reused; only the bounded `source:*` audience vocabulary is extended. |
| Safety and responsibility | 5/5 | No real person receives fictional dialogue, no real newsroom is made the employer, and trust, History Go or Badge status cannot grant source protection or publication authority. |
| Maintainability and auditability | 5/5 | Canonical family files, exact file#id provenance, generated registry/matrix parity, no fallback steps and a role-specific permanent gate keep the implementation reviewable. |

**Total: 30/30.** Pilot D is complete within scope. The Matrix and broad rollout are explicitly not part of this PR.
