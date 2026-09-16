# Political Science Reading Canon Integration — Design

Date: 2026-09-16  
Repository: `Paradispartiet/History-Go`  
Baseline: `eeb4b00487cae410fe23f51ad55020ad21f8c8ca`  
Owner subject: `politikk`

## Purpose

Extend the existing History Go Politikk / Statsvitenskap corpus only where the current corpus has documented gaps. The implementation must enrich existing canonical Politikk concepts, methods, emner and full-text chapters rather than create a parallel subject, a book-driven article hierarchy, or duplicate theory registries.

The governing transformation is:

`works -> gap audit -> reusable theory/method/mechanism units -> existing Politikk owners -> claims/assessments -> audited integration`

A work is provenance and scholarly context. It is not, by itself, a runtime learning unit and it is not empirical verification of every claim associated with it.

## Existing architecture to preserve

Politikk already has canonical concept, emne, method, curriculum, mapping and runtime structures. The existing curriculum architecture and its 13 canonical domains remain authoritative for navigation, ownership and progression.

The sociology/anthropology advanced-theory extension provides the production pattern to reuse:

`reading_canon -> source_evidence -> domain_bindings -> production_registry -> fulltext / claims / assessment -> audit`

This design copies that workflow pattern while keeping Politikk as the direct owner.

## First-wave scope

The first implementation wave is deliberately narrow and gap-driven.

### Central works

The following eight works are in active first-wave scope because they are expected to fill identifiable gaps in concept analysis, causal inference, democratic institutions, parties, bureaucracy/state capacity, state-society relations, international political economy and climate politics:

1. David Collier — *Working with Concepts: Foundational Essays by David Collier, with Research Notes on Innovation in the Field*; edited by Zachary Elkins.
2. David Waldner — *Qualitative Causal Inference and Explanation*.
3. Tom Ginsburg, Aziz Z. Huq & Tarunabh Khaitan (eds.) — *The Entrenchment of Democracy: The Comparative Constitutional Design of Elections, Parties, and Voting*.
4. Thomas Poguntke & Wilhelm Hofmeister (eds.) — *Political Parties and the Crisis of Democracy: Organization, Resilience, and Reform*.
5. Sarah Brierley — *The Co-opted State: How Politicians' Control Over Bureaucrats' Careers Threatens Governance*.
6. Noah L. Nathan — *The Scarce State*.
7. Henry Farrell & Abraham L. Newman — *Underground Empire*.
8. Caroline Kuzemko — *Climate Politics*.

### Debate work

9. John J. Mearsheimer & Sebastian Rosato — *How States Think: The Rationality of Foreign Policy*.

This work is included as an explicit debate source in international politics, not as the corpus's authoritative account of rationality or foreign-policy decision-making. Any associated runtime learning unit must expose documented alternative explanatory families where relevant, including organizational-process, bureaucratic-politics, political-psychology and constructivist approaches.

## Deferred support works

These works remain registered as candidates but are not materialized in wave 1 unless the gap audit shows a concrete need that is not already covered by the existing Politikk corpus:

- Jeff Gill & Le Bao — *Bayesian Social Science Statistics: From the Very Beginning*.
- Clifford Young & Kathryn Ziemer — *Polls, Pollsters, and Public Opinion: A Guide for Decision-Makers*.
- Myles Williamson, Christopher Akor & Amanda B. Edgell — *Democracy in Trouble: Democratic Resilience and Breakdown from 1900 to 2022*.

Deferral is a scope decision, not a quality judgment. These sources may be activated later for Bayesian methods, polling/public-opinion measurement or a contemporary executive-aggrandizement research case if the deduplication audit identifies a real gap.

## Gap-first rule

No target number of new canonical IDs is mandatory.

The initial source layer may describe roughly 30–45 candidate theory, method, mechanism or debate units across the nine active works, but only units that survive deduplication and gap review are promoted.

A candidate is materialized only when at least one of the following is true:

- the concept or method is absent from the canonical Politikk registry;
- the existing canonical item lacks a necessary mechanism, scope condition or misuse guardrail;
- the existing full-text chapter lacks a substantively important explanatory contrast;
- the source materially strengthens a weak method or measurement treatment;
- a documented debate requires an explicit rival-theory comparison that is not currently present.

If fewer than 30 genuine gaps are found, fewer than 30 units should be added. Corpus growth is not a success metric.

## Corpus roles

Every registered work has one of these source-layer roles:

- `central`: expected to contribute multiple reusable units where gaps are demonstrated;
- `debate`: represents a contestable theoretical intervention that must be taught alongside documented alternatives;
- `deferred_support`: held outside wave-1 materialization pending gap evidence.

These are editorial architecture roles, not political, ideological or quality rankings.

## Target domain bindings

All promoted units bind to existing Politikk owners. Likely primary owners include:

- `statsvitenskapelig_metode_og_sammenligning`
- `komparativ_politikk_regimer_institusjoner`
- `valg_partier_velgeratferd`
- `styring_institusjoner_forvaltning`
- `offentlig_politikk_beslutning_implementering`
- `internasjonal_politikk_sikkerhet_samarbeid`
- `politisk_okonomi_stat_marked`
- `demokrati_representasjon_offentlighet`
- `fordeling_velferd_ulikhet`
- `konflikt_makt_sivilsamfunn`

No new canonical domain may be created merely to mirror a book title, chapter structure or author.

## Candidate families for wave 1

### Collier

Candidate gaps to audit:

- concept formation
- conceptual stretching
- ladders / hierarchies of generality
- typologies
- measurement validity
- dimensions, attributes and indicators
- disciplined comparison across cases

Primary owner: `statsvitenskapelig_metode_og_sammenligning`.

The source layer must distinguish Collier's own essays from editorial framing and commentary in the 2026 collected volume.

### Waldner

Candidate gaps to audit:

- qualitative causal inference
- invariant causal mechanisms
- event-history maps
- hypothetical interventions
- within-case causal structure
- comparison among causal-method traditions
- explanatory depth, density and relevance
- rival-explanation control

Primary owner: `statsvitenskapelig_metode_og_sammenligning`.

### Ginsburg, Huq & Khaitan edited volume

Candidate gaps to audit:

- democratic entrenchment
- constitutional design for democratic preservation
- constitutional treatment of elections
- party-related constitutional protections
- voting and suffrage protections
- institutional self-protection and trade-offs

Primary bindings: `demokrati_representasjon_offentlighet` and `komparativ_politikk_regimer_institusjoner`.

Because this is an edited volume, claim provenance must resolve to the relevant chapter author where the claim does not belong to the editors' own contribution.

### Poguntke & Hofmeister edited volume

Candidate gaps to audit:

- party organization
- party-system institutionalization
- party-society linkage
- representation and intermediation
- organizational adaptation and professionalization
- parties as possible sources of democratic resilience or failure

Primary bindings: `valg_partier_velgeratferd` and `komparativ_politikk_regimer_institusjoner`.

The phrase "crisis of democracy" must be treated as a research problem and attributed claim, not as a universal premise built into the corpus.

### Brierley

Candidate gaps to audit:

- political control over bureaucratic careers
- career incentives
- politicization of administration
- bureaucratic autonomy
- state capacity
- public-service performance
- administrative principal-agent mechanisms

Primary owner: `styring_institusjoner_forvaltning`.

Empirical claims must preserve the study's institutional and geographic scope rather than being generalized automatically.

### Nathan

Candidate gaps to audit:

- state presence versus state weakness
- uneven state capacity
- state-society relations
- historical institutional persistence
- territorial and distributive inequality
- elite capture
- clientelism
- conditional links to political violence

Primary bindings: `komparativ_politikk_regimer_institusjoner`, `politisk_okonomi_stat_marked`, and `styring_institusjoner_forvaltning`.

### Farrell & Newman

Candidate gaps to audit:

- weaponized interdependence
- network centrality and power
- chokepoints
- panopticon effects as defined in the relevant framework
- infrastructure-based coercion
- financial- and information-network leverage
- constraints on economic statecraft

Primary bindings: `politisk_okonomi_stat_marked` and `internasjonal_politikk_sikkerhet_samarbeid`.

Network position must not be materialized as unlimited or deterministic power.

### Kuzemko

Candidate gaps to audit:

- ideas, interests and institutions in climate politics
- politicization and depoliticization
- policy change and institutional feedback
- political economy of energy transitions
- interaction with sociotechnical transitions
- policy coordination and conflict
- distributional conflict in transition

Primary bindings: `offentlig_politikk_beslutning_implementering` and `politisk_okonomi_stat_marked`.

### Mearsheimer & Rosato

Candidate debate units to audit:

- theory-based rationality
- deliberative decision processes
- strategic reasoning
- rationality as a contested explanatory standard

Primary owner: `internasjonal_politikk_sikkerhet_samarbeid`.

These units must not be promoted unless the same learning context provides explicit contrast with relevant alternative explanatory traditions. The authors' account must be attributed as their theoretical argument rather than presented as settled disciplinary consensus.

## Unit contract

Each candidate source-layer unit contains, at minimum:

- stable candidate `id`
- `name`
- `unit_type`: `concept`, `mechanism`, `method`, `measurement`, `theory`, `debate_position` or `research_case`
- concise definition or proposition
- `summary`
- `analytic_question`
- `scope_conditions`
- `misuse_guardrail`
- proposed `primary_domain_id`
- optional `secondary_domain_ids`
- provenance to one or more exact source contributions
- deduplication result
- source-evidence status
- materialization status

Where the source supports it, mechanism units should also identify actors/entities, process, observable implications and plausible rival explanations.

## Source and evidence architecture

Add a Politikk-specific source layer following the proven sociology pattern:

1. `advanced_political_science_reading_canon_v1.json`
2. `advanced_political_science_source_evidence_v1.json`
3. `advanced_political_science_domain_bindings_v1.json`
4. `advanced_political_science_production_registry_v1.json`

The reading canon stores works and candidate units. Source evidence stores bibliographic and claim-level support. Domain bindings identify existing owners. The production registry records whether a unit was rejected as duplicate, deferred, merged into an existing canonical item or materialized through fulltext/claims/assessment/audit.

## Materialization rules

- Book registration does not count as materialized content.
- Candidate-unit registration does not count as a published claim.
- Existing canonical IDs are reused whenever they already represent the same concept or method.
- Existing items may be enriched instead of duplicated.
- Secondary bindings do not create or complete domains.
- Runtime claims require claim-level evidence and integration into the owning chapter or legitimate reuse overlay.
- Existing Politikk content must not be moved or deleted merely to fit the source layer.
- Generated/runtime-owned artifacts must be rebuilt through their existing owners rather than hand-edited.
- Existing strict-completion status is not reset solely because the source layer grows.

## Political-science neutrality and uncertainty

The corpus must distinguish descriptive empirical claims, causal explanations, measurement choices, theoretical propositions, normative arguments and contested interpretations.

Contested theories must be attributed. Country-, institution-, time- or population-specific findings require explicit scope conditions and may not be restated as current universal facts without separate evidence.

## Misuse guardrails

At minimum, the first wave must prevent these errors:

- treating a concept label as a valid measure by itself;
- treating correlation as a demonstrated mechanism;
- treating process evidence as decisive without considering rival explanations;
- treating party-system crisis as universal or inevitable;
- equating all political oversight of administration with politicization;
- equating sparse state presence with complete state absence;
- treating network centrality as unlimited coercive capacity;
- reducing climate politics to one interest, institution or ideology;
- treating one theory of rationality in international politics as disciplinary consensus.

## Assessments

Assessment items are generated from promoted concepts, mechanisms and methods, not book trivia.

Preferred forms include concept/indicator discrimination, scope-condition violations, rival explanations, falsifying evidence, mechanism recognition, method choice and empirical-versus-normative distinctions.

Publication year, author-name recall and title matching do not count as substantive curriculum coverage.

## Quality gates

Wave 1 is complete only when:

1. bibliographic metadata is source-audited;
2. all active candidate IDs are unique;
3. every candidate has exact provenance;
4. every candidate has a proposed existing domain owner;
5. deduplication against existing Politikk concepts/methods/emner is recorded;
6. duplicates are merged or rejected rather than assigned new canonical IDs;
7. every promoted unit has scope conditions and a misuse guardrail;
8. debate units expose documented alternatives;
9. edited-volume claims resolve to the relevant contribution rather than being attributed generically to the editors;
10. source evidence exists before runtime claims are promoted;
11. no one-book-one-article structure is introduced;
12. deferred support works remain non-materialized unless an audit proves a gap;
13. relevant Politikk/Fagverk and repository-wide gates pass on the exact implementation head.

## Expected production sequence

1. Register and source-audit the nine active works and three deferred support works.
2. Generate a gap-audit candidate set from the nine active works.
3. Deduplicate every candidate against existing canonical concepts, methods and emner before creating new IDs.
4. Record each candidate as `reuse_existing`, `enrich_existing`, `new_gap`, `defer` or `reject_duplicate`.
5. Bind surviving units to existing Politikk owners.
6. Add claim-level source evidence and explicit scope conditions.
7. Integrate only approved gaps into owning full-text chapters or reuse overlays.
8. Extend concepts/methods/emner only when the audit proves a genuine canonical gap.
9. Add application-focused assessments.
10. Regenerate owner-generated runtime/index artifacts and run exact-head regression gates.

## Non-goals

This wave does not:

- create a new top-level Statsvitenskap subject;
- replace or expand the current 13-domain Politikk registry without separate justification;
- create one article per book;
- force 30, 45 or any fixed number of new canonical units;
- materialize the three deferred support works by default;
- claim that every argument in the selected sources is canonical truth;
- rank political actors, parties, policies or ideologies;
- infer current political conclusions from historically or geographically bounded studies without current evidence;
- restructure unrelated Politikk content.

## Success criterion

The first wave succeeds if it makes the existing Politikk corpus more precise and explanatory with the smallest defensible set of additions: genuine gaps are filled, existing items are strengthened instead of duplicated, debate is represented as debate, and every promoted claim remains traceable to source, scope and owner.
