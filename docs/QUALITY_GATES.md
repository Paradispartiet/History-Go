# Quality gates

AHA quality gates define conservative checks that protect AHA understanding from detached, stale, inconsistent, or unsafe output.

AHA Quality Status Surface V1 will present existing quality-gate results as a local read-only status surface. It must not change quality-gate logic, weaken existing requirements, start sync, activate EchoNet, or add approval actions.

Relevant AHA quality-gate inputs include:

- `sourceBinding`;
- `topicConsistency`;
- geopolitics consistency when relevant;
- stale-data guards;
- analysis run isolation;
- invalid or mismatch status.
