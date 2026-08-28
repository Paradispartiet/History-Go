# Civication Litteratur – Redaktør (bok) — Role World source-first

## Scope lock

This rollout covers exactly `litteratur/redaktor_bok` and closes only the remaining readiness debt:

- `rhythm_waiting_handoff_rework`
- `situated_reputation`

The role is already canonical and playable. Existing role model, work grammar, mail plan, authored mail scenes, authority boundaries and the current Scene Pipeline remain canonical. This PR must not invent a new runtime, employment entitlement, publishing authority, rights authority, contract authority, salary rule or generic editorial engine.

## Canonical foundation to preserve

- `data/Civication/roleModels/litteratur/redaktor_bok.json`
- `data/Civication/workGrammars/litteratur/redaktor_bok.json`
- `data/Civication/mailPlans/litteratur/redaktor_bok_plan.json`
- the nine existing Redaktør (bok) mail-family catalogs
- the existing distinction between author ownership, editorial recommendation, portfolio decision, market evidence and production constraints

The existing eight-step plan is preserved unchanged. This rollout does not rewrite its order or fallback policy; it adds an editorial Role World above the already canonical mail/work surfaces.

## Exact provenance set

The Role World must reuse exactly these nine existing scenes:

1. `data/Civication/mailFamilies/litteratur/job/redaktor_bok_job.json#litteratur_redaktor_bok_job_helhetslesing_001`
2. `data/Civication/mailFamilies/litteratur/people/redaktor_bok_people.json#litteratur_redaktor_bok_people_struktur_001`
3. `data/Civication/mailFamilies/litteratur/conflict/redaktor_bok_conflict.json#litteratur_redaktor_bok_conflict_slutt_001`
4. `data/Civication/mailFamilies/litteratur/knowledge/redaktor_bok_knowledge.json#litteratur_redaktor_bok_knowledge_motiv_001`
5. `data/Civication/mailFamilies/litteratur/event/redaktor_bok_event.json#litteratur_redaktor_bok_event_provelesning_001`
6. `data/Civication/mailFamilies/litteratur/micro/redaktor_bok_micro.json#litteratur_redaktor_bok_micro_stemme_001`
7. `data/Civication/mailFamilies/litteratur/followup/redaktor_bok_followup.json#litteratur_redaktor_bok_followup_struktur_001`
8. `data/Civication/mailFamilies/litteratur/story/redaktor_bok_story.json#litteratur_redaktor_bok_story_retning_001`
9. `data/Civication/mailFamilies/litteratur/consequence/redaktor_bok_consequence.json#litteratur_redaktor_bok_consequence_struktur_001`

The follow-up and consequence scenes already share `thread_key: litteratur_redaktor_bok_struktur_001`; this is the strongest canonical continuity anchor and must remain untouched.

## Rhythm contract

The missing realism layer is not more tasks but time: waiting, handoff, interruption, rework and delayed consequence around an editorial project that remains the same project.

The Role World must therefore show at least these states without creating runtime state:

- `waiting`: author revision, reader feedback, portfolio review or production information is genuinely pending; the editor must not manufacture certainty to stay busy.
- `handoff`: the editor sends a bounded question, recommendation or manuscript state to the author, editorial lead, market or production owner and records what the receiver actually owns.
- `rework`: new text, reader evidence or production constraints return and reopen only the affected editorial question rather than resetting the whole manuscript.
- `interruption`: urgent portfolio, market or schedule pressure enters the day without silently replacing the existing manuscript thread.
- `delayed_consequence`: a prior structural, voice or market decision returns later as reader comprehension, author trust, production cost or portfolio evidence.

The central rhythm anchor is `litteratur_redaktor_bok_struktur_001`: the author proposes one bounded structural experiment, the editor waits for a new version/reader response, and the consequence scene returns mixed evidence that must not be over-generalized into a full rewrite.

Authority does not change during waiting or handoff. A redaktør may recommend, coordinate and document within delegated editorial mandate, but may not promise publication, rights, contract terms or convert personal taste/market pressure into objective textual necessity.

## Situated reputation contract

There is no global reputation score. Standing must be audience-specific and may diverge across at least:

- `author`
- `editorial_leadership`
- `market_and_sales`
- `production`
- `peer_editors`
- `readers_or_test_readers`
- `rights_or_contract_owners`
- `private_relationships`

Legitimate divergence includes:

- Refusing to turn market uncertainty into a textual command can strengthen author and peer-editor trust while making the editor look less decisive to a commercially pressured audience.
- A slow, bounded structural experiment can improve author ownership and decision quality while frustrating production or portfolio actors who want immediate scope certainty.
- Preserving an unusual sentence rhythm can strengthen literary credibility while some readers still experience friction.
- Escalating rights, contract or publication authority to the correct owner can strengthen institutional trust while reducing the editor’s appearance of personal control.
- Admitting that a test result is mixed can reduce short-term certainty while improving longer-term editorial credibility.

Standing never grants authority. It cannot authorize publication, rights transfer, contract promises, commercial guarantees or takeover of the author’s voice.

## Cross-role boundary

Readiness marks cross-role as `candidate_when_shared_work_is_real`. This rollout does **not** materialize a cross-role runtime link. Author, market, production and editorial-lead interactions already exist as authored role surfaces; no second Role World currently shares a canonical persistent work object with this one. The world records the candidate status and keeps `materialized: false`.

## Materialization target

Materialize one editorial `civication_role_world_v1` world with:

- 14 days / 56 substantive beats
- the nine exact canonical source refs above
- at least five primary threads
- explicit waiting/handoff/rework/interruption/delayed-consequence rhythm
- audience-specific standing with no global score
- private aftermath and delayed consequences
- no new runtime state
- existing role model, work grammar and eight-step plan preserved
- cross-role candidate recorded but not materialized

Regenerate canonical scene registry, career gameplay audit and rollout readiness fail-closed. Pass a strict Redaktør (bok) Role World test, canonical Role World gates and the full Civication suite. TEMP workflow/materializer surfaces must be removed before the permanent verified commit is pushed.