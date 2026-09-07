# Politikk / Parlamentarisk arbeid — prerequisite source-first closure

## Scope

- This package closes the runtime prerequisite gaps around day one, People, Places, mail, knowledge and workday-loop evidence for `politikk_parlamentarisk_arbeid`.
- It preserves `Stortingsrepresentant` as `appointment_required` with qualification `election_or_mandate`; it never converts the role to direct badge unlock.
- It is prerequisite completion, not Role World completion. The dedicated Role World remains a separate one-role rollout PR.

## Canonical evidence and authority

- `data/Civication/politikkCareerLifeEvidence.json` already cites Stortinget for the representative role and classifies it as a formal active Civication position behind the election gate.
- The representative may work through committee, hearing, party group, questions, proposals, debate and voting only inside the active mandate and Storting procedures.
- A personal vote, party position, committee remark, popularity, History Go knowledge or situated reputation is never a Storting decision, law, budget authority or new mandate.

## Materialized foundation

- Four fictional scenario actors and four parliamentary work surfaces.
- Persistent work object: `parlamentarisk_sakslogg_dokument_horing_innstilling_plenum_og_oppfolging` with explicit waiting, handoff and bounded rework.
- Fifteen source mails across all nine canonical mail types: 4 job, 4 people and one each of conflict, story, event, micro, followup, knowledge and consequence.
- Sixteen-step mail plan with no generic fallback.
- History Go can improve historical and institutional questions about democracy and Parliament, but cannot replace current documents, law, budget evidence, confidentiality controls, election_or_mandate or voting.

## Expected readiness effect

- politikk/politikk_parlamentarisk_arbeid should move from needs_role_authored_work to playable / rollout_ready after generated audits.
- No Role World file is authored in this prerequisite package.
