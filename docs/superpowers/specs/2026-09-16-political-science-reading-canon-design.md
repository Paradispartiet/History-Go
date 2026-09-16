# Political Science Reading Canon Integration — Design

Date: 2026-09-16  
Repository: `Paradispartiet/History-Go`  
Baseline: `eeb4b00487cae410fe23f51ad55020ad21f8c8ca`  
Owner subject: `politikk`

## Purpose

Extend the existing History Go Politikk / Statsvitenskap corpus with reusable theories, concepts, mechanisms and methods derived from a curated set of scholarly works. The implementation must enrich the existing canonical Politikk architecture rather than create a parallel subject, a book-driven article hierarchy, or a duplicate theory registry.

The governing transformation is:

`works -> theory units -> existing political-science domains -> concepts/mechanisms/methods -> claims and assessments -> audited full-text integration`

A work is provenance and scholarly context. It is not, by itself, a runtime learning unit and it is not empirical verification of every claim associated with it.

## Existing architecture to preserve

Politikk already has canonical concept, emne, method, curriculum, mapping and runtime structures. The new layer must bind into these structures and preserve stable canonical IDs.

The existing curriculum architecture remains authoritative for navigation and progression. The current 13 canonical political-science domains remain the technical ownership registry for emner, methods, quizzes, claims and place bindings.

The sociology/anthropology advanced-theory extension provides the production pattern to reuse:

`reading_canon -> source_evidence -> domain_bindings -> production_registry -> fulltext / claims / assessment -> audit`

This design copies that workflow pattern, but Politikk remains the direct owner. No new top-level subject is created.

## Scope

### Central works

The following works enter the Politikk reading canon as central scholarly works because they contribute reusable concepts, mechanisms or methods across one or more existing canonical domains:

1. David Collier — *Working with Concepts*
2. David Waldner — *Qualitative Causal Inference and Explanation*
3. Tom Ginsburg, Aziz Z. Huq & Tarunabh Khaitan — *The Entrenchment of Democracy*
4. Thomas Poguntke & Wilhelm Hofmeister — *Political Parties and the Crisis of Democracy*
5. Sarah Brierley — *The Co-opted State*
6. Noah L. Nathan — *The Scarce State*
7. Henry Farrell & Abraham Newman — *Underground Empire*
8. Caroline Kuzemko — *Climate Politics*

### Debate work

9. John J. Mearsheimer & Sebastian Rosato — *How States Think*

This work must be represented as an explicit theory-and-debate source in international politics. It must not be materialized as the corpus's authoritative account of rationality or foreign-policy decision-making. Its associated units require explicit comparison with alternative approaches such as organizational-process models, bureaucratic politics, political psychology and constructivist accounts where relevant.

### Supporting works

The following works enter as supporting sources. They may create method units, measurement units or research-case units, but do not automatically create large theory families:

10. Jeff Gill & Le Bao — *Bayesian Social Science Statistics*
11. Michael L. Young & David C. Ziemer — *Polls, Pollsters, and Public Opinion*
12. Vanessa A. Williamson, Emmanuela Akor & Amanda B. Edgell — *Democracy in Trouble*

## Canon statuses

Every registered work has one of these corpus roles:

- `central`: source expected to generate multiple reusable theory, mechanism or method units across the existing curriculum.
- `debate`: source representing a contestable theoretical intervention that must be taught alongside documented alternatives.
- `supporting`: source used to strengthen methods, measurement, cases or empirical illustration without defining a broad canon family by itself.

These statuses describe pedagogical and architectural use inside History Go. They are not quality scores, ideological rankings or claims that one political position is preferable to another.

## Target domain bindings

Theory units bind to the existing Politikk domain registry. The likely primary owners are:

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
- `norsk_politikk_eos_flernivastyring` where a concrete comparative or governance link is justified

No new canonical domain may be created merely to mirror a book title or chapter structure. A new domain would require separate architectural justification outside this change.

## Theory-unit contract

The initial reading canon should produce approximately 50–80 meaningful theory/method/mechanism units. The target is depth and reuse, not a fixed quota.

Each unit must contain, at minimum:

- stable `id`
- `name`
- concise definition or proposition
- `unit_type`: one of `concept`, `mechanism`, `method`, `measurement`, `theory`, `debate_position`, `research_case`
- `summary`
- `analytic_question`
- `scope_conditions`
- `misuse_guardrail`
- `primary_domain_id`
- optional `secondary_domain_ids`
- provenance back to one or more works
- source-evidence status
- materialization status

Where the source supports it, a mechanism-oriented unit should also identify:

- relevant actors or entities
- causal or interpretive process
- expected observable implications
- plausible rival explanations

## Initial unit families by work

The first pass should cover at least the following reusable material without treating the list as an exhaustive quota.

### Collier

- concept formation
- conceptual stretching
- ladder / hierarchy of generality
- typologies
- measurement validity
- dimensions, attributes and indicators
- family resemblance and classical definitions where supported
- disciplined comparison across cases

Primary owner: `statsvitenskapelig_metode_og_sammenligning`.

### Waldner

- qualitative causal inference
- causal mechanisms
- process evidence
- event-history maps
- within-case causal structure
- comparison among causal-method traditions
- explanation patterns and rival explanations

Primary owner: `statsvitenskapelig_metode_og_sammenligning`.

### Ginsburg, Huq & Khaitan

- democratic entrenchment
- constitutional design and democratic preservation
- electoral-system protections
- suffrage protections
- party-system protections
- institutional self-protection and its trade-offs
- distinction between democratic procedure and entrenchment devices

Primary bindings: `demokrati_representasjon_offentlighet` and `komparativ_politikk_regimer_institusjoner`.

### Poguntke & Hofmeister

- party organization
- party-system institutionalization
- linkage between parties and society
- party adaptation
- representation and intermediation
- organizational professionalization
- crisis claims as an empirical question rather than a presumed condition

Primary bindings: `valg_partier_velgeratferd` and `komparativ_politikk_regimer_institusjoner`.

### Brierley

- political control of bureaucracy
- career incentives
- politicization of administration
- bureaucratic autonomy
- state capacity
- bureaucratic performance and service delivery
- principal-agent problems in administrative careers

Primary owner: `styring_institusjoner_forvaltning`.

### Nathan

- state presence versus state weakness
- state-society relations
- historical institutional persistence
- territorial and distributive inequality
- elite capture
- clientelism
- political violence as a conditional mechanism
- uneven state capacity

Primary bindings: `komparativ_politikk_regimer_institusjoner`, `politisk_okonomi_stat_marked`, and `styring_institusjoner_forvaltning`.

### Farrell & Newman

- weaponized interdependence
- network centrality and power
- chokepoints
- panopticon effects where documented
- infrastructure-based coercion
- financial-network leverage
- information-network leverage
- sanctions and economic statecraft constraints

Primary bindings: `politisk_okonomi_stat_marked` and `internasjonal_politikk_sikkerhet_samarbeid`.

### Kuzemko

- ideas, interests and institutions in climate politics
- politicization and depoliticization
- policy change and institutional feedback
- political economy of energy transitions
- sociotechnical transition interaction
- policy coordination and conflict
- distributional conflict in transition

Primary bindings: `offentlig_politikk_beslutning_implementering` and `politisk_okonomi_stat_marked`.

### Mearsheimer & Rosato

- theory-based rationality
- deliberative decision processes
- strategic reasoning
- rationality as a contested explanatory standard
- contrast with organizational-process models
- contrast with bureaucratic-politics models
- contrast with political-psychology explanations
- contrast with constructivist accounts of preferences and interpretation

Primary owner: `internasjonal_politikk_sikkerhet_samarbeid`.

Every associated runtime learning unit must signal that the framework is debated and must expose at least one alternative explanatory family. The corpus must not present the authors' account as settled disciplinary consensus.

### Gill & Bao

- Bayesian inference
- prior, likelihood and posterior
- posterior uncertainty
- Bayesian model comparison where supported
- hierarchical modeling where supported
- computational workflow in R/Python as method support

Primary owner: `statsvitenskapelig_metode_og_sammenligning`.

### Young & Ziemer

- sampling and representativeness
- question wording
- likely-voter and population definitions
- weighting
- house effects
- uncertainty and margins of error
- aggregation and trend interpretation
- evaluating pollsters and polling claims

Primary bindings: `valg_partier_velgeratferd` and `statsvitenskapelig_metode_og_sammenligning`.

### Williamson, Akor & Edgell

- executive aggrandizement as a research construct
- indicators of democratic erosion
- democratic resilience and resistance
- institutional responses
- measurement and case-comparison issues

Primary bindings: `demokrati_representasjon_offentlighet` and `komparativ_politikk_regimer_institusjoner`.

This work is a contemporary research case and evidence source, not the sole theory of democratic backsliding.

## Source and evidence architecture

Add a Politikk-specific advanced political-science source layer following the proven sociology pattern:

1. `advanced_political_science_reading_canon_v1.json`
2. `advanced_political_science_source_evidence_v1.json`
3. `advanced_political_science_domain_bindings_v1.json`
4. `advanced_political_science_production_registry_v1.json`

The reading canon stores works and theory-unit proposals. Source evidence stores bibliographic and claim-level support. Domain bindings assign a primary materialization owner and optional secondary context. The production registry tracks whether each unit has actually reached canonical fulltext, claims, assessment and audit.

The exact location should remain under `data/fag/politikk/` unless an existing Politikk subdirectory already owns the relevant source-layer convention at implementation time.

## Materialization rules

- A book registration does not count as a materialized theory unit.
- A theory-unit proposal does not count as a published claim.
- A secondary domain binding does not create or complete a domain.
- Runtime claims require source evidence and integration into the owning canonical chapter or strict reuse overlay.
- Existing Politikk content must not be moved or deleted merely to accommodate the new material.
- Existing stable IDs must be reused when a concept or method is already canonical.
- New IDs are permitted only for genuinely missing concepts, mechanisms, methods or research-case units.
- Duplicate formulations of an existing canonical concept must be merged into the existing concept rather than create synonyms as separate canonical units.

## Claims, uncertainty and political neutrality

The corpus must distinguish:

- descriptive empirical claims
- causal explanations
- measurement choices
- theoretical propositions
- normative arguments
- contested interpretations

For contested political-science theories, the text must identify the relevant scholarly disagreement rather than present one framework as the corpus's political judgment.

Empirical claims from country-, period- or institution-specific studies require explicit scope conditions. No case-specific finding may be generalized to current politics, another population or another institutional setting without separate evidence.

## Misuse guardrails

Every unit requires a guardrail against common misuse. At minimum, the corpus must prevent the following errors:

- treating conceptual labels as self-validating measurements
- treating correlation as a demonstrated mechanism
- treating process tracing as proof without rival-explanation control
- treating party-system crisis as universal or inevitable
- equating politicization of bureaucracy with all political oversight
- equating sparse state presence with complete state absence
- treating network centrality as unlimited coercive power
- treating climate-policy conflict as reducible to one interest or ideology
- treating rationality in international politics as disciplinary consensus
- presenting Bayesian priors as arbitrary preferences rather than model assumptions to be justified and checked
- treating a single poll or pollster as direct measurement of public opinion without sampling and design context
- treating one operationalization of democratic erosion as the complete phenomenon

## Assessments and quiz generation

Assessment items should be generated from reusable theory units and mechanisms, not from book trivia.

Good assessment forms include:

- choose the correct concept for a described mechanism
- distinguish concept definition from indicator
- identify scope-condition violations
- compare rival explanations
- identify what evidence would weaken a claim
- distinguish an empirical finding from a normative inference
- choose an appropriate method for a causal or measurement problem

Questions such as publication year, author-name recall or isolated title matching should not count as substantive curriculum coverage.

## Quality gates

Implementation is complete only when the change proves:

1. all registered work IDs are unique;
2. all theory-unit IDs are unique;
3. every theory unit has provenance;
4. every theory unit has a primary existing domain owner;
5. all domain IDs resolve against the Politikk canonical registry;
6. every unit has scope conditions and a misuse guardrail;
7. debate units expose required alternatives;
8. supporting works do not silently become broad theory authorities;
9. source evidence exists before runtime claims are promoted;
10. existing canonical concept/method IDs are reused where applicable;
11. no book-title-to-article one-to-one structure is introduced;
12. generated/runtime-owned artifacts are regenerated through their existing owners rather than hand-edited;
13. relevant Politikk/Fagverk tests and repository-wide gates pass on the exact implementation head.

## Expected production sequence

1. Register and source-audit the 12 works.
2. Materialize the first approximately 60 theory/method/mechanism units in the reading canon.
3. Deduplicate them against existing canonical concepts and methods.
4. Bind each unit to an existing primary Politikk domain.
5. Create claim-level source evidence and scope conditions.
6. Integrate units into owning fulltext chapters or strict reuse overlays.
7. Add or extend canonical concept/method/emne entries only where the deduplication audit proves a real gap.
8. Add assessments centered on application and discrimination rather than book recall.
9. Regenerate any owner-generated indexes/runtime artifacts.
10. Run exact-head Politikk, Fagverk and repository regression gates.

## Non-goals

This change does not:

- create a new top-level Statsvitenskap subject;
- replace the current 13-domain Politikk registry;
- create twelve book articles;
- claim that every argument in the selected books is canonical truth;
- rank political actors, parties, policies or ideologies;
- infer contemporary political conclusions from historical or geographically bounded research without current evidence;
- restructure unrelated Politikk content;
- reset existing strict-completion status merely because the source layer is expanded.

## Success criteria

The extension succeeds when a learner can encounter the new material as reusable political-science concepts, methods and mechanisms inside the existing curriculum, with clear provenance, scope, rival explanations and misuse protection, while the underlying book canon remains an auditable scholarly source layer rather than the navigation model itself.
