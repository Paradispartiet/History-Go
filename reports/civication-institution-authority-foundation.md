# Civication institutional structure and authority foundation

## Scope

This foundation makes institutional limits playable without introducing a second scene engine or a parallel institution state store. Existing Civication scenes remain unchanged unless they explicitly opt into the new authority contract.

The static institutional structure is authored as `authority_context` on a canonical scene. Dynamic approval, escalation and capacity state remains persistent in the existing `CivicationState.work_world` through ordinary work objects.

This PR does not roll out another role and does not change the Career Gameplay Matrix classification of any role.

## Canonical contract

`authority_context` defines a bounded institutional situation:

- `institution_id` and `unit_id`
- the active `role_scope`
- `reporting_line`
- optional peer functions, external counterparts and goal/pressure references
- named approval points with an approver and persistent approval work-object id
- action-specific authority rules: `direct`, `approval_required`, `influence_only`, or `forbidden`
- named resources/capacity with `available`, `limited`, or `unavailable` baseline state and optional persistent resource work-object ids
- named escalation paths with a target actor and persistent escalation work-object id

A choice may opt into the contract through `authority_action` with one of five intents:

- `execute`
- `recommend`
- `request_approval`
- `wait`
- `escalate`

The Scene Registry compiler validates ids, bounded collection sizes, allowed fields, action/rule bindings, resource references, approval references and escalation references fail-closed. A `request_approval` choice must create the matching `approval` work object in `pending` state. An `escalate` choice must create the matching `escalation` work object in `open` state.

## Runtime ownership

`CivicationInstitutionAuthority` is a pure resolver. It does not persist state.

The existing `CivicationWorkWorld` remains the sole owner of dynamic work-world state:

- approval request: `kind=approval`, `status=pending`
- later approval response: transition the same work object to `granted` or `denied`
- escalation: `kind=escalation`, `status=open`
- capacity/resource override: a referenced work object can expose `available`, `limited`, or `unavailable` as its current status

This makes approval and waiting durable across scenes and reloads with the same identity/history semantics already used for ordinary work cases.

## Choice gate

The existing ChoiceDirector around-answer pipeline is reused. `institutionAuthority` runs after the canonical choice/interaction boundary and before EventEngine commits the answer.

Therefore an authority-bound `execute` choice cannot reach EventEngine when:

- the role only has influence/recommendation authority
- formal approval is required but has not been granted
- approval was denied
- the active role scope does not match the authored institutional role
- a required capacity resource is unavailable

`request_approval`, `wait`, `recommend` and `escalate` remain real authored player actions rather than narrative labels.

## Regression proof

`tests/civication-institution-authority-foundation.test.js` proves:

1. strict schema ownership for `authority_context` and `authority_action`
2. compiler preservation into canonical scenes and compatibility projections
3. compiler rejection of a fake approval request that does not create the matching pending approval work object
4. pre-answer blocking of unauthorized execution before EventEngine is called
5. approval request -> persistent pending approval object -> wait -> manager grant -> execution becomes available
6. dynamic resource capacity can later block an otherwise authorized execution
7. the existing work-object Scene Pipeline remains the consequence/state owner

The permanent foundation is intentionally role-agnostic. The next implementation slice can use it for History Go knowledge -> choice affordances, followed by the second full pilot `by/by_radgiver_plan`.
