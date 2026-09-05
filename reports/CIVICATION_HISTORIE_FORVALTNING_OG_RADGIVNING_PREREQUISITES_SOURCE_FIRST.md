# Civication — Historie / Forvaltning og rådgivning prerequisite foundation — source first

## Scope lock

Canonical role: `historie/historie_forvaltning_og_radgivning`.

This is a prerequisite Career Gameplay foundation package, **not Role World completion**. The existing aggregate role model and work grammar are authoritative. The package must preserve their canonical work loops, quality axes and authority boundary, then add only the missing playable foundation required before a dedicated one-role Role World rollout.

Baseline on `main` `1b4f7a58e08d36487eca2c6cdd81c7ce44e0fca1`:

- Career status: `architecture_only`
- runtime gate: fail
- roleModel registration: absent even though the aggregate model file exists
- mail plan: absent
- mail types: 0/9
- Nine runtime gaps: `day_one`, `people`, `places`, `mail`, `knowledge`, `consequences`, `performance`, `progression`, `exit`
- workday loop: only grammar-level, not a tested playable loop
- readiness debt additionally names History Go affordance, People/Places integrity, persistent work object, waiting/handoff/rework and situated reputation
- Role World is explicitly out of scope for this prerequisite PR

## Canonical contracts that must not drift

Work loops remain exactly:

1. `problem -> mandat -> kilder -> alternativer -> vurdering -> råd -> dokumentasjon`
2. `ny informasjon -> konsekvensanalyse -> revisjon -> kvalitetssikring -> nytt beslutningsgrunnlag`

Authority remains exactly:

- may: `utrede og gi råd innen mandat`
- may not: `fatte vedtak uten myndighet`, `skjule vesentlige motargumenter`, `forfalske sikkerhet`, `erstatte regelverk med preferanse`

The five History career titles remain `direct` offers under the existing canonical career evidence: Saksbehandler, Førstekonsulent, Rådgiver, Seniorrådgiver and Spesialrådgiver. **Direct offer policy does not create delegated decision authority.** Formal authority, legal basis and the identity of the decision owner remain case- and organization-specific.

## Work-world foundation

Four fictional scenario actors:

- **Ingrid — seniorrådgiver og faglig kvalitetspartner.** Tests whether advice separates facts, interpretation, alternatives and uncertainty. She can demand a clearer professional basis, but cannot convert seniority into a legal basis or formal decision.
- **Jonas — regelverks- og hjemmelskontakt.** Makes legal-basis questions and escalation explicit. He can clarify which question needs legal or formal resolution, but does not turn a plausible interpretation into delegated authority.
- **Amina — dokumentasjons- og journalføringskoordinator.** Protects source provenance, versions, correspondence, hearing input and decision-trace continuity. Traceability is not itself substantive truth.
- **Eirik — bestiller- og ledergrensesnitt.** Makes scope, deadline and institutional need concrete. He can define the question and delivery need, but cannot order a predetermined historical/professional conclusion or make a preferred outcome lawful.

Four work surfaces:

1. `saksinntak_og_mandatbord` — problem, mandate, decision owner, deadline, scope and questions requiring escalation.
2. `kilde_og_faktagrunnlag` — sources, provenance, factual status, missing information, affected perspectives and confidence.
3. `alternativ_og_motargumentflate` — alternatives, counterarguments, consequences, disagreement and explicit uncertainty.
4. `kvalitet_og_beslutningshandoff` — advice version, review, open risks, legal/authority status, handoff and what the actual decision owner receives.

Persistent work object: **`saksgrunnlag_og_radgivningsspor`**. It must preserve mandate, sources/facts, source provenance, knowledge gaps, legal-basis questions, alternatives, counterarguments, assessment, advice, uncertainty, waiting state, owner, review, handoff and bounded rework across the same case.

Repeatable rhythm:

`problem -> mandat -> kilder/fakta -> alternativer -> vurdering -> waiting/venting på fakta, hjemmel, innspill eller mandatavklaring -> handoff -> råd -> kvalitetssikring -> revisjon/rework -> beslutningsgrunnlag -> læring`

Waiting is a legitimate work state. New facts, corrected source provenance, a clarified legal basis, material hearing input or a documented counterargument reopens only the affected claim/section/assessment with a new version and explicit owner.

## History Go affordance and authority boundary

History Go can help the player ask better questions about source criticism, historical context, institutional memory, archival absence, historiography and how past policy/administrative categories shape current framing. It is learning and question-improvement support.

History Go and the `historie` Badge:

- do not create a legal basis or delegated decision authority;
- cannot decide a case, approve a formal decision or replace the actual decision owner;
- cannot authenticate a source merely because it appears in the game;
- cannot turn an uncertain interpretation into a fact;
- cannot replace legal review, required hearing/consultation, privacy/ethics review or other governed process;
- cannot make a political or managerial preference into professional necessity.

## Mail plan

The playable source layer uses a 16-step deterministic plan with all nine canonical mail types and no fallback:

`job -> people -> knowledge -> job -> people -> conflict -> job -> people -> event -> micro -> job -> people -> followup -> story -> consequence -> job`

Fifteen source mails:

- 4 job: thin basis, deadline pressure, unclear authority/legal basis, late material information
- 4 people: senior adviser review, legal-basis escalation, documentation/journal trace, commissioner/leadership pressure
- 1 conflict: preferred conclusion versus professional basis
- 1 story: adviser identity versus institutional loyalty
- 1 event: new hearing/source material changes the case
- 1 micro: distinguish factual statement, assessment and recommendation
- 1 followup: bounded rework after clarification
- 1 knowledge: History Go source criticism and institutional memory with explicit authority boundary
- 1 consequence: later return of a shortcut or a transparent limitation

Every mail has two role-specific A/B decisions. Positive choices preserve mandate, traceability, alternatives, counterarguments and the correct decision owner. Negative choices hide uncertainty, compress material disagreement, imply authority that does not exist, or shape the basis to a preferred outcome. Choice wording must remain semantically distinct across the catalogs.

## Progression, performance and exit

Career progression can move among the five canonical advisory titles through actual employer processes and demonstrated responsibility, but this foundation never turns Badge level into formal authority. Possible exits include archive/documentation, museum/cultural-heritage work, research, project/administrative work and other advisory roles where the competence transfers without importing a decision mandate.

Positive performance means producing a decision-ready, traceable and bounded advisory basis. Negative performance includes hiding material counterarguments, treating deadline as evidence, presenting political/managerial preference as professional necessity, or implying a formal authority the role does not hold.

## Cross-role boundary

Readiness currently says `candidate_when_shared_work_is_real`. This prerequisite PR does **not** invent a cross-role runtime object. A later cross-role link may be materialized only when an actual shared work object is proven in canonical data; plausible cooperation with leadership, law, archive, museum, communication or politics is not enough by itself.

## Expected prerequisite result

After a green fail-closed materialization:

- Career status: `architecture_only` → `playable`
- runtime gate: fail → pass
- nine missing runtime components → zero
- aggregate role model registered in the manifest
- all five existing offer policies remain `direct`
- readiness classification: `needs_role_authored_work` → `rollout_ready`
- dedicated Role World remains unmaterialized and should retain only Role World-level authored debt, including `situated_reputation`
