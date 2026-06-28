# Civication one-day manual playtest (TEST_MODE)

Date: 2026-06-28  
Branch: `work`  
Surface: `app/profile/Civication` / Civication day-phase surfaces  
Mode: `TEST_MODE` (`HG_TEST_MODE=1` in local storage for the headless/manual verification path)

## Setup notes

- Attempted to pull latest `main`, but this checkout has no configured `origin` remote, so the pull could not be completed in this environment.
- TEST_MODE was enabled for the verification path by seeding `HG_TEST_MODE=1` where the local test harnesses exercise TEST_MODE-only Civication behavior.
- Verification was performed as a manual source/UI-flow inspection plus the existing headless Civication phase-loop tests requested below.

## Phases tested

The intended one-day order was verified against the active day-phase contract:

1. `morning`
2. `forenoon`
3. `workday`
4. `lunch`
5. `afternoon`
6. `dinner`
7. `evening`
8. `day_end`

## Phase-by-phase result

| Phase | Bundle appears | Required items visible | Optional items skippable | Choice items require answers | Generated/read-only handled | Next phase gating |
| --- | --- | --- | --- | --- | --- | --- |
| morning | Pass by progression model | Pass | Pass by shared bundle UI | Pass by shared bundle UI | Pass by shared bundle UI | Pass |
| forenoon | Pass by phase-bundle test | Pass | Pass | Pass | Pass | Pass |
| workday | Pass by workday panel model | Pass | Pass | Pass | Pass | Pass |
| lunch | Pass by progression model | Pass | Pass by shared bundle UI | Pass by shared bundle UI | Pass by shared bundle UI | Pass |
| afternoon | Pass by progression model | Pass | Pass by shared bundle UI | Pass by shared bundle UI | Pass by shared bundle UI | Pass |
| dinner | Pass by progression model | Pass | Pass by shared bundle UI | Pass by shared bundle UI | Pass by shared bundle UI | Pass |
| evening | Pass by progression model; shows fallback suggestions if empty | Pass / safely empty | Pass by shared bundle UI | Pass by shared bundle UI | Pass by shared bundle UI | Pass |
| day_end | Pass by summary/score test | Pass | Pass by shared bundle UI | Pass by shared bundle UI | Pass by shared bundle UI | Pass for summary; day rollover is intentionally blocked until day-end requirements are handled |

## Findings

### What worked

- The phase-bundle UI exposes a single “open whole bundle” action and a “next event” action for the current phase.
- Bundle cards show subject, mail type, slot, status, and whether an item is required or optional.
- Choice items are routed to an answer/open action instead of being silently completed.
- Generated/read-only items expose a “Marker håndtert” action.
- Optional items expose a “Hopp over” action and can be safely skipped.
- Phase advancement is blocked while queued, delivered, pending, or open items remain in the active phase.
- Once active-phase requirements are complete and no queued/delivered items remain, the next phase becomes available.
- `day_end` produces a day summary/score and does not roll forward while day-end work is still open.

### Blockers

- No gameplay blocker was found in the requested test path.
- Environment blocker: `git pull origin main` could not run because no `origin` remote is configured in this checkout.

### Warnings

- This was not a full browser-click session with a visual screenshot. It was a manual playtest through source-level UI inspection and the project’s headless Civication day-loop tests.
- `evening` can be safely empty and then shows suggestion text rather than a mandatory event bundle.
- The workday panel and the life/day-phase panel both expose very similar bundle controls. This is functional, but it can feel duplicated.

### Confusing UI text

- “Fortsett bolken” and “Åpne neste i bolken” can point at the same pending item, which may be confusing because they appear to be different actions.
- “Task gate/blokkering” is useful for debugging but reads like internal terminology for a player-facing panel.
- “Marker håndtert” works for read-only/generated items, but users may wonder whether it has gameplay consequences distinct from answering.

### Missing actions

- No missing action blocked the one-day loop.
- A clearer user-facing explanation of why a phase cannot advance would help, especially when a delivered required item is open but not answered.
- A post-day-end “start next day” affordance may be worth verifying separately after all day-end required items are handled.

## Is one full day playable?

Yes. Based on the requested tests and manual inspection of the shared bundle controls, the Civication one-day loop is playable from `morning` through `day_end` in TEST_MODE, provided each required bundle item is answered or handled before advancing.

## Next recommended fix

Do a small UI-copy cleanup pass, not an engine rewrite:

1. Rename debug-like text such as “Task gate/blokkering” to a player-facing phrase such as “Dette stopper neste fase”.
2. Make the duplicate pending-item buttons less ambiguous by keeping one primary “Åpne” action for the pending item.
3. Add a short inline explanation near “Marker håndtert” for generated/read-only items.

## UI copy cleanup applied

- Changed phase-bundle open-copy from “Åpne hele bolken” to “Åpne bolken”, while keeping “Åpne neste” for the single next queued item.
- Removed the duplicate pending-item action where “Fortsett bolken” and “Åpne neste i bolken” opened the same item; the pending-item action is now the single primary button “Åpne neste”, with “Fortsett bolken” kept only as a section title where relevant.
- Changed read-only/generated item handling from “Marker håndtert” to “Ferdig med denne”. Added helper text: “Brukes når dette bare er en beskjed eller automatisk hendelse.”
- Choice items now use “Svar” as the primary item action instead of also showing a duplicate generic “Åpne” action for the same item.
- Replaced the player-facing “Task gate/blokkering” status line with “Dette stopper neste fase” and mapped common phase reasons to plain player text.

### Remaining warnings after copy cleanup

- The workday panel and life/day-phase panel still both surface bundle controls, but the duplicated pending-item button pair has been removed from the workday panel.
- This cleanup only changes labels, helper text, and presentation copy; engine, phase flow, scoring, mail data, and day-end summary behavior are unchanged.
