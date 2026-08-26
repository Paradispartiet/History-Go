# Civication Role World rollout — Film/TV Produksjonsassistent

Status: Materialized on the controlled-rollout branch; completion is valid only after the role-specific gate, full Civication suite, PR checks, exact-head merge, and post-merge verification are green.

## Scope and debt closed

- Canonical role: `film_tv/produksjonsassistent`
- Queue position at rollout start: 1
- Targeted readiness debt: `situated_reputation`
- Cross-role companion candidates: `film_tv/programleder` and `film_tv/regissor`; no cross-role object is required or fabricated in this PR
- Runtime policy: existing Scene Pipeline remains canonical; no new runtime or parallel scene format

## Materialization

- 14 days × four phases = 56 unique, provenance-backed beats
- Persistent work object: `film_tv_pa_shoot_day_case_001`
- Seven new authored scenes: open case, location handoff, bounded History Go work while waiting, location response, call/data rework, unit-move safety event, and authority-bounded closure
- Situated standing is audience-specific for Amir, Sara, Ida, production office, transport, and set crew; standing never grants authority
- Operative approval remains with Amir; location and safety authority remain with their owners; pay, credit and working-term promises are forbidden

## Quality assessment

This branch targets 29/30 after machine verification and editorial inspection:
- Correctness 5/5
- Test coverage 5/5
- Editorial quality 5/5
- Technical integration 5/5
- Safety and authority boundaries 5/5
- Maintainability 4/5
