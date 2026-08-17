# Philosophy quality audit

## Scope

This audit is a maintenance-quality review of the completed Philosophy corpus. It does **not** reopen canonical completion. The canonical contract remains 20 domains, 68 standalone articles, 204 concepts, 34 methods, 51 hooks and 20 chapters.

The review read actual prose from a representative stress-test article in every one of the 20 canonical domains. Selection emphasized articles where superficial structure could conceal weak philosophy: argumentation, epistemic injustice, modality, free will, normative ethics, distributive justice, coloniality, art status, scientific paradigms, AI personhood, phenomenology, animal moral status, non-Western traditions, language, religion, law, mathematics, action, physics and probability.

## Findings

### Strong substantive quality

The corpus is not uniformly shallow. The audit found genuinely substantive argument reconstruction, real rival positions, explicit objections and replies, and useful source boundaries in many articles. The recently expanded university fields are especially strong. Representative examples include normative ethics, epistemic injustice, Indian and Buddhist philosophy, philosophy of language, philosophy of religion, philosophy of law, philosophy of mathematics, philosophy of physics and philosophy of probability.

### Systematic source-integrity problem

A systematic defect remains in an older generated layer. In several articles the prose reconstructs one debate while `thinker_refs` and `primary_work_refs` point to unrelated domain-level thinkers and works. The existing university-depth gate counts primary works but does not require those works to ground the actual reconstructed debate. This can make `primary_work_grounding: true` technically pass while the declared primary bibliography does not support the argument being presented.

Representative failures found by direct prose review include:

- **Informal logic and fallacies**: the argument turns on C. L. Hamblin and Douglas Walton, while declared thinkers/works are largely Frege, Tarski, Anscombe, Haack and unrelated works.
- **Causation, necessity and possibility**: the argument uses Hume, Kripke and Lewis, while declared primary anchors omit key Hume/Kripke grounding and include unrelated domain-level works.
- **Free will and responsibility**: the argument uses van Inwagen, Hume and Frankfurt, while most declared thinker/work references concern other philosophy-of-mind figures.
- **Justice, equality and distribution**: the argument uses Rawls, Nozick and Sen, while Rawls and Sen are missing from the declared primary grounding.
- **Artworks, art status and institutions**: the argument uses Weitz, Danto and Dickie, while declared thinkers/works belong largely to other aesthetics debates.
- **Paradigms and research programmes**: the argument uses Kuhn, Lakatos and Feyerabend, while key Kuhn/Lakatos primary grounding is absent.
- **Phenomenology, lifeworld and body**: the argument uses Husserl, Heidegger and Merleau-Ponty, while declared references point to largely different existential/phenomenological figures.
- **Animal moral status**: the argument uses Singer, Regan and Korsgaard, while most declared references are unrelated environmental-philosophy anchors.

This is a **systematic quality problem**, not a completion-count problem. The repair therefore belongs in one Philosophy quality-repair PR and must not start a new completion cycle.

### Isolated issues

The audit also found smaller, non-systematic issues in otherwise strong material, including an irrelevant Hume primary reference in the action-philosophy sample and a malformed Fuller sentence in the philosophy-of-law sample. These should be repaired with the same source-integrity cleanup.

## Permanent QA requirement

A university-reviewed Philosophy article must satisfy all of the following in addition to the existing university-depth gate:

1. Declared `thinker_refs` must correspond to thinkers actually used in substantive prose, not decorative domain-level names.
2. Declared `primary_work_refs` must be explicitly anchored in the theory/history section together with a relevant thinker or position.
3. Canonical debate thinkers must be reflected in `thinker_refs` when they exist in the canonical thinker registry.
4. Generic theory-history text that merely lists primary works without connecting them to arguments does not count as primary-work grounding.
5. The audit must report the complete offender set across all 68 canonical articles, not only a hand-picked passing sample.

The permanent executable contract is `tests/fagverk-filosofi-source-integrity.test.mjs`, run by `.github/workflows/fagverk-filosofi-source-integrity.yml`.
