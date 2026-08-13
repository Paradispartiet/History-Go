# Psychology Clinical Career Ladder Audit

Generated/checked: 2026-08-13

## Scope

This audit closes the canonical Psychology career block from `Psykolog` through `Klinikkleder` without treating History Go knowledge points as professional qualification.

| Tier | Threshold | Runtime gate | Canonical role_scope | Role model | FWG | Life Story |
| --- | ---: | --- | --- | --- | --- | --- |
| Psykolog | 115 | `authorization_required` → `no_psychologist_authorization_or_license` | `psykolog` | implemented | implemented | implemented |
| Spesialistpsykolog | 150 | `authorization_required` → psychologist authorization/licence + specialist approval | `spesialistpsykolog` | implemented | implemented | implemented |
| Fagansvarlig | 190 | `appointment_required` → `employer_appointment` | `fagansvarlig` | implemented | implemented | implemented |
| Klinikkleder | 240 | `appointment_required` → `employer_appointment` | `klinikkleder` | implemented | implemented | implemented |

All four retain their existing canonical `career_offer` policies. The implementation adds work identity and gameplay **behind** those gates; it does not weaken them.

## Corrections made

Three legacy generated role models had stale thresholds relative to `data/badges/psykologi.json`:

- `Spesialistpsykolog`: 160 → **150**
- `Fagansvarlig`: 210 → **190**
- `Klinikkleder`: 270 → **240**

`Psykolog` was already correct at 115. All four generic role-model stubs are replaced with work-specific models.

## Professional architecture

### Psykolog

The role models authorized clinical psychologist work: assessment, treatment, treatment responsibility where the actual position carries it, documentation, patient participation, risk/safety work and interdisciplinary collaboration. The Badge tier itself never supplies authorization or licence.

### Spesialistpsykolog

The role adds actual specialist approval to the psychologist gate and models greater clinical complexity, supervision, consultation, method quality and service development. Specialist status does not become generic authority outside the actual speciality and does not automatically grant statutory decision authority.

### Fagansvarlig

Civication `Fagansvarlig` is deliberately defined as **employer-appointed professional/quality responsibility**: procedures, competence development, supervision structure, incident learning, implementation and role clarification.

It is **not** the statutory `faglig ansvarlig` role under the Norwegian Mental Health Care Regulations. The statutory role has its own specialist/practice/designation requirements and legal decision authority. Civication therefore does not infer that authority from the Badge title.

### Klinikkleder

The role models strategic and operational clinic leadership: quality systems, patient pathways, staffing, competence, economy, results and change. Current Norwegian clinic-leader job evidence supports a broad leadership profile with relevant higher education and leadership experience; psychologist authorization is not treated as an inherent property of the title. Leadership therefore does not itself grant diagnosis, treatment or statutory clinical decision authority.

## Runtime separation

`js/Civication/systems/civicationCareerRoleResolver.js` now resolves the four titles independently:

- `Psykolog` → `psykolog` → `psykologi_psykolog`
- `Spesialistpsykolog` → `spesialistpsykolog` → `psykologi_spesialistpsykolog`
- `Fagansvarlig` → `fagansvarlig` → `psykologi_fagansvarlig`
- `Klinikkleder` → `klinikkleder` → `psykologi_klinikkleder`

The previous `psykologi_klinisk_og_fagledelse` future-split placeholder is removed from `badgeRoleMappings.json`; these roles no longer share or inherit the non-clinical environment-work or career-guidance scopes.

## Life Story differentiation

Each role has its own two-day, five-thread simulation:

- **Psykolog:** hypothesis vs premature closure, patient participation, confidentiality/team information, changing risk, supervision and uncertainty.
- **Spesialistpsykolog:** expert uncertainty, supervision without takeover, method fidelity vs adaptation, other-specialist input, service development.
- **Fagansvarlig:** incident learning, procedure vs judgement, supervision vs performance control, statutory authority boundary, implementation quality.
- **Klinikkleder:** critical staffing, quality signals vs production metrics, budget risk transfer, change pacing, leadership vs clinical authority.

The permanent endings test requires deterministic good/hard outcomes for all four, and `civication-psychology-clinical-career-ladder.test.js` builds every pack through the real Life Story validator and exercises the live career-offer gate.

## Evidence registry

Machine-readable evidence and boundary statements live in:

`data/Civication/psychologyClinicalCareerEvidence.json`

Primary public sources checked on 2026-08-13:

- Helsedirektoratet / health-personnel title protection and psychologist authorization boundary.
- Norsk psykologforening specialist regulations.
- Oslo University Hospital psychologist and psychologist-specialist job descriptions.
- Helsedirektoratet commentary on Mental Health Care Regulations § 4 (`faglig ansvarlig`).
- Helse Bergen clinic-leader job description for strategic, quality, personnel, competence, economy and result responsibility.

## Remaining Psychology career debt

After this block the only explicit higher-ladder role-scope debt in `badgeRoleMappings.json` is **Psychology academia**:

- `Forsker (psykologi)` — 300
- `Professor (psykologi)` — 380

Both already remain qualification-gated and must later receive a research/teaching work package rather than inheriting any clinical role.
