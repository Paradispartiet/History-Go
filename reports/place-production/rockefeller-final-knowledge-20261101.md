# Rockefeller – editorial Knowledge cleanup toward formal v1 (1 November 2026)

Real-app QA was **completed and passed** in PR #6889 (GitHub Actions run 41352193574): native PlaceCard, Fagverk, people popup, pictures, QuizCard on 390 and 1440 px and full gameplay of 30 quiz questions/5 sets, reward exactly once and no physical visit write.

The quiz questions were corrected in #6883. Five remaining Knowledge explanations (questions 1,2,3,5,28) still described internal data files or legacy quiz details, not Rockefeller history. This PR replaces them with source-backed venue facts, corrects the vague q3 address answer to the exact public entrance at Mariboes gate 5B, and retains 30 quiz IDs and ten QuizCard IDs.

Knowledge generation must preserve existing KU IDs where claims are uniquely owned. Q28 previously shared a legacy KU ID with a Sentrum Scene question: the old KU remains with that other question; q28 gains a distinct canonical KU for its new claim. Do not repurpose an ID already used for a different fact.

Sources:
- https://oslobyleksikon.no/side/Rockefeller
- https://oslobyleksikon.no/side/Torggata_bad
- https://www.rockefeller.no/om-oss
- https://www.rockefeller.no/kontakt
- https://www.rockefeller.no/booking-utleie-johndee

**Status:** `v1_candidate` until Knowledge registry/parity pass; formal status change is separate.
