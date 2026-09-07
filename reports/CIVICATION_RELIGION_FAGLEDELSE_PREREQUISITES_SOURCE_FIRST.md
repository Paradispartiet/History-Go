# Civication Religion / Fagledelse prerequisites — source-first

## Scope lock

- One canonical role scope: `religion/religion_fagledelse`.
- Fagansvarlig, Seksjonsleder, Avdelingsleder, Avdelingsdirektør and Direktør remain `appointment_required` with `employer_appointment`.
- Higher Religion badge tiers never imply broader budget, personnel or decision authority than the player's actual delegation.
- No Role World is authored in this prerequisite package.

## Existing sources preserved

- `data/badges/religion.json` is authoritative for the five career-offer gates.
- Existing Religion career/life split remains authoritative.
- The existing Fagledelse role model and work grammar are upgraded in-place to v2 rather than replaced by a parallel role.

## Materialized prerequisite layer

- Four fictional scenario actors: senior quality, law/ethics/habilitation, people/operations, and representation/community contact.
- Four role-owned work surfaces for mandate/resources, faglig quality/disagreement, representation/ethics/pressure, and decision/handoff/follow-up.
- One persistent work object: `fagledelseslogg_mandat_prioritering_ressurser_kvalitet_uenighet_beslutning_og_oppfolging`.
- Fifteen canonical mails across all nine required mail types and a 16-step plan with no generic fallback.
- History Go can improve historical and institutional questions about religion, pluralism, organizations and representation, but cannot replace current sources, employer_appointment, actual delegation or mandate to represent a faith or worldview community.

## Expected readiness effect

- `religion/religion_fagledelse` should move from needs_role_authored_work to playable / rollout_ready after generated audits.
- Situated reputation is foundation-only here; the dedicated Role World remains the next separate rollout step.
