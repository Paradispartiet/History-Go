# Rockefeller – browser QA for v1, 2026-11-01

PR #6877 corrected the Story, PR #6880 supplied Fagverk, and PR #6883 corrected fullquiz capacities and meta questions with Knowledge parity.

This PR adds **no runtime content changes**. It exercises the *actual app* at 390px/1440px: PlaceCard portrait, flip to the ten source QuizCard questions, People popup, own Fagverk page and chapter links. Then completes all five canonical fullquiz sets through the real quiz engine on both viewports, including rewards, persisted learning and no accidental physical place visit.

Evidence: GitHub Actions artifact `rockefeller-v1-real-app-evidence`, screenshots plus machine-readable report. All checks must pass before marking `content_level=v1`. The external-source basis and direct artist-to-venue People relationships require a separate editorial evidence check; the browser test alone confirms visibility, not proof of their claimed stage connections.

Current formal status: `v1_candidate` until successful QA and editorial review. Do not automatically promote from this QA instrumentation PR.
