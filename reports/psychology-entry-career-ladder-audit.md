# Psychology Entry Career Ladder Audit

Audit date: 2026-08-13
Base: `02dbbf5eb984077cdc882584d64fab3d0b8dbca3`

## Result

The obsolete opening Psychology ranks have been replaced without changing their progression thresholds:

| Tier | Points | Canonical title | Career offer | Shared role scope |
| ---: | ---: | --- | --- | --- |
| 1 | 5 | Miljøassistent | direct | `psykologi_miljoarbeid` |
| 2 | 10 | Sosialassistent | direct | `psykologi_miljoarbeid` |
| 3 | 15 | Aktivitetsleder (omsorgsarbeid) | direct | `psykologi_miljoarbeid` |
| 4 | 25 | Miljøarbeider | direct | `psykologi_miljoarbeid` |

Removed canonical tier titles: `Titter`, `Analytiker`, `Atferdsobservatør`, `Samtalepartner`.

## Evidence

The four replacement titles are documented by Utdanning.no in the NAV/Aa-register title family for miljøarbeid. Utdanning.no also states that there is no single official education that grants the title miljøarbeider, while relevant education/experience may be required by an employer. Evidence is registered permanently as `utdanning_miljoarbeider` in `data/Civication/badgeCareerAuditPolicy.json`.

## Runtime architecture

All four entry titles intentionally share one work family rather than four duplicate simulations:

- canonical role scope: `psykologi_miljoarbeid`
- canonical role id: `psykologi_miljoarbeider`
- shared role model: `data/Civication/roleModels/psykologi/psykologi_miljoarbeid.json`
- FWG: `data/Civication/workGrammars/psykologi/psykologi_miljoarbeid.json`
- Life Story: `data/Civication/lifestory/roles/psykologi_miljoarbeid/`

`CivicationCareerRoleResolver` maps all four Badge titles to the shared scope. `CivicationRoleModelRuntime` now resolves through this canonical role-scope resolver before legacy title-slug lookup, so the new ladder does not depend on historical filenames such as `titter.json`.

## Professional boundary

The shared work grammar makes the first-line boundary explicit.

In scope:
- practical and social support
- activity and motivation
- concrete observation
- neutral documentation
- de-escalation
- professional boundaries
- safe escalation to the responsible professional

Out of scope:
- diagnosis
- independent psychotherapy
- changing medical or psychological treatment
- presenting assumptions as clinical assessments

The existing authorization gate for `Psykolog` and the dual authorization/specialist gate for `Spesialistpsykolog` remain unchanged.

## Life Story coverage

The first package has five independent threads and five playable choice scenes covering:

1. observation versus interpretation
2. motivation versus pressure
3. documentation versus stigma
4. trust versus safe escalation
5. family collaboration versus autonomy/privacy

The four opening jobs share the same story family because the core work grammar is the same; Badge progression changes responsibility and salary without pretending the professions are clinically different roles.

## Economy

Psychology now has explicit `salary_by_tier` entries for all 13 canonical tiers. The old tier-3 Science cross-requirement is removed because it was an unrelated quiz gate on ordinary first-line jobs. Regulated, appointed and academic roles remain protected by their explicit `career_offer` qualification policies.

## Permanent gates

`tests/civication-badge-career-matrix.test.js` now locks:
- exact opening titles and preserved thresholds
- absence of the four obsolete titles
- direct entry-job policy
- 13/13 Psychology salary coverage
- preservation of psychologist authorization gates
- FWG boundary against diagnosis
- active Life Story binding and minimum content depth

`tests/civication-psychology-entry-career-ladder.test.js` additionally verifies:
- all four titles resolve to `psykologi_miljoarbeid`
- shared canonical role id
- Life Story scope resolution
- shared roleModel manifest registration
- real RoleModelRuntime loading through `canonical_role_scope`
