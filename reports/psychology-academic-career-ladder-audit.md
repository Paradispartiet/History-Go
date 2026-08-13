# Psychology Academic Career Ladder Audit

Checked: 2026-08-13

## Result

The final explicit Psychology role-scope debt is closed.

| Badge tier | Threshold | Runtime gate | Canonical scope | roleModel | FWG | Life Story |
| --- | ---: | --- | --- | --- | --- | --- |
| Forsker (psykologi) | 300 | `qualification_required` → `academic_qualification_and_employment` | `forsker_psykologi` | implemented | implemented | implemented |
| Professor (psykologi) | 380 | `qualification_required` → `academic_qualification_and_employment` | `professor_psykologi` | implemented | implemented | implemented |

Both roles remain fail-closed until the existing academic qualification/employment gate is explicitly satisfied. Badge points are knowledge progression, not employment or academic qualification.

## Stale role-model corrections

The previous generated role models were not aligned with canonical Badge data:

- `Forsker (psykologi)`: **330 → 300**
- `Professor (psykologi)`: **400 → 380**

Both generic stubs have been replaced with work-specific models.

## Forsker (psykologi)

The researcher scope models knowledge production rather than a prestige tier:

- research-question and study-design work
- data collection, quality assurance and analysis
- research ethics and personal-data boundaries
- scientific writing and reporting
- project collaboration and research communication
- explicit separation of planned and exploratory analysis
- transparent handling of null findings and sensitivity analyses

The evidence deliberately does **not** pretend that every Norwegian `forsker` position has one identical degree threshold. Concrete researcher positions define their own relevant education and experience requirements. Civication therefore keeps the existing general academic qualification-and-employment runtime gate and makes the role-specific requirements explicit in evidence/content.

## Professor (psykologi)

The professor scope is materially different from the researcher scope. It adds:

- research-program and grant development
- university teaching and educational-quality work
- supervision of students and researchers
- assessment and academic judgement
- authorship, credit and mentoring power
- responsibility for building a research and learning environment in which senior positions can still be challenged

The qualification boundary is grounded in the Norwegian university and college regulations: relevant doctorate/equivalent competence, educational competence, Norwegian-language requirements and significant research contributions at the highest level, with institutional competence assessment and possible additional requirements.

Professor status is academic. It does not imply psychologist authorization, diagnosis/treatment authority or clinical leadership.

## Life Story differentiation

### Researcher week

Five work threads across two days:

1. a null finding that conflicts with the project story
2. an attractive analysis discovered after seeing the data
3. a delivery deadline before data quality is complete
4. an external partner asking for a simple actionable conclusion
5. a sensitivity analysis that weakens the manuscript's headline result

Deterministic endpoints:

- good: `etterprovbar_forsker`
- hard: `resultatet_foran_metoden`

### Professor week

Five work threads across two days:

1. a PhD candidate's idea fits the professor's grant proposal
2. supervision can become giving the answer
3. teaching quality competes with a large grant deadline
4. a junior colleague's data challenge the professor's own theory
5. authorship order tests whether hierarchy or contribution determines credit

Deterministic endpoints:

- good: `miljo_som_taler_imot_deg`
- hard: `professoren_som_tyngdepunkt`

Both packages preserve the canonical shared Life Story cast (`venn = Jonas`, `familie = Søsteren din`) and are built through the same validator as the existing Civication roles.

## Full Psychology ladder after this pass

`data/Civication/badgeRoleMappings.json` now has `implementation_status: complete_canonical_ladder_implemented` and zero `future_split_candidates` for Psychology.

All 13 canonical Badge titles have an explicit role scope:

- 4 entry titles → `psykologi_miljoarbeid`
- 3 guidance titles → `psykologi_arbeids_og_karriereveiledning`
- Psykolog → `psykolog`
- Spesialistpsykolog → `spesialistpsykolog`
- Fagansvarlig → `fagansvarlig`
- Klinikkleder → `klinikkleder`
- Forsker (psykologi) → `forsker_psykologi`
- Professor (psykologi) → `professor_psykologi`

This closes **role-scope/Life Story coverage** for the canonical Psychology Badge ladder. It does not claim that every role pack has mail-plan/mail-family depth or exact per-tier salary materialization; those remain separate cross-career production dimensions and must not be hidden by this status.

## Permanent gate

`tests/civication-psychology-academic-career-ladder.test.js` locks:

- exact 300/380 thresholds
- existing academic runtime qualification gates
- distinct researcher/professor scopes and IDs
- grounded roleModels and FWGs
- clinical-authority separation
- active Life Story bindings and real validator builds
- canonical shared cast
- no remaining Psychology `future_split_candidates`
- all 13 canonical Psychology Badge labels mapped
- runtime failure without academic qualification/employment evidence

`tests/civication-lifestory-endings.test.js` additionally locks distinct good/hard endings for both active academic roles.

## Source registry

Machine-readable source details are stored in:

`data/Civication/psychologyAcademicCareerEvidence.json`

Primary sources checked 2026-08-13 include the Norwegian Universities and Colleges Regulations, University of Bergen appointment rules, University of Bergen Psychology researcher/professor material, and a current researcher vacancy at the Faculty of Psychology.
