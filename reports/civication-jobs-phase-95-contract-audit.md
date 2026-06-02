# Phase 95: Civication jobs contract diagnostics audit

## Current baseline summary

Generated from `npm run typecheck:report` on 2026-06-02 after Phase 94.

| Metric | Current baseline |
| --- | ---: |
| Total TypeScript diagnostic lines | 1518 |
| Files with diagnostics | 180 |
| `js/Civication/**` diagnostic lines | 263 |
| `js/Civication/core/civicationEventEngine.js` diagnostic lines | 0 |
| `js/Civication/core/civicationJobs.js` diagnostic lines | 3 |

Phase 94 removed the two `TS2362`/`TS2363` diagnostics in `js/Civication/core/civicationEventEngine.js` by making the `weekKey()` date arithmetic explicitly numeric. Phase 95 is read-only: no runtime files, job/state files, UI/CSS/DOM files, data files, schema/declaration files, `tsconfig.json`, package metadata, stories, places, people, import tooling, or HTML files are changed.

## Diagnostics under audit

| Line | Code | Function / block | Expression | Contract category |
| ---: | --- | --- | --- | --- |
| 323 | TS2769 | `prependInboxEvents(events)` | `.map(makeInboxEnvelope).concat(existing)` | concat/array envelope shape |
| 429 | TS2345 | `maybeOfferCareerProgression(active)` / `fagarbeider` promotion branch | `pushOffer({ career_id, career_name, title: "Mellomleder", threshold, points_at_offer })` | offer/pushOffer contract; missing optional brand/employer context |
| 448 | TS2345 | `maybeOfferCareerProgression(active)` / `mellomleder` promotion branch | `pushOffer({ career_id, career_name, title: "Formann", threshold, points_at_offer })` | offer/pushOffer contract; missing optional brand/employer context |

## Diagnostic 1: inbox concat envelope shape

### TypeScript diagnostic

`js/Civication/core/civicationJobs.js(323,15): error TS2769: No overload matches this call.` TypeScript infers the new items as `{ status: string; createdAt: number; event: any; }[]` because `makeInboxEnvelope()` always returns an inbox envelope with `status`, `createdAt`, and `event`. It separately sees `existing` as `{ event?: { id?: string | number } }[]` because `prependInboxEvents()` locally narrows it to only the field needed for duplicate detection.

### Code location and expression

- Function: `prependInboxEvents(events)`.
- Block: the code filters new events against existing inbox IDs, wraps the new events with `makeInboxEnvelope()`, concatenates the prior inbox, then calls `window.HG_CiviEngine?.setInbox?.(next)`.
- Expression: `valid.filter(...).map(makeInboxEnvelope).concat(existing)`.

### Runtime value shape

At runtime, `makeInboxEnvelope(eventObj)` creates objects shaped as:

```js
{
  status: "pending",
  createdAt: Date.now(),
  event: eventObj
}
```

The `existing` value comes from `window.HG_CiviEngine?.getInbox?.() || []`. In the current runtime, inbox state is also exposed by `CivicationState.getInbox()` and stored via `CivicationState.setInbox(arr)`, which accepts any array and persists it or delegates to `CivicationMailEngine.replaceInbox()`. The local type at line 318 deliberately describes only `{ event?: { id?: string | number } }` because duplicate detection only reads `x?.event?.id`; it does not prove that existing inbox items lack `status`/`createdAt`.

### Downstream consumers

- `window.HG_CiviEngine?.setInbox?.(next)` receives the concatenated array from `prependInboxEvents()`.
- `CivicationState.getInbox()` / `setInbox()` are the source-of-truth fallback inbox accessors and persist arrays without requiring a tighter item schema.
- `CivicationUI.getChannelBuckets()` reads inbox arrays and delegates to `CivicationEventChannels.splitInbox`; `findPendingFromItems()` looks for `item.status === "pending"` and returns `item.event`.
- `CivicationInboxTopActionUI`, `CivicationMiniSectionsUI`, `civicationLifeMailRuntime`, and `civicationBlockedJobMessages` read inboxes through mail/state/engine accessors and generally treat items as dynamic envelope-like values.

### Classification

- **concat/array envelope shape:** yes. This is the direct TypeScript failure.
- **offer/pushOffer contract:** no.
- **missing optional brand/employer context:** no.
- **unsafe broad cast candidate:** only if fixed with a file-wide `any` or broad inbox `any[]`; that should be avoided.
- **actual data contract to formalise:** likely yes, but narrowly: the inbox item envelope has a runtime shape that should eventually be documented as a local/shared inbox item contract. Phase 96 does not need a global schema change if it only validates/annotates this local concat boundary.

## Diagnostics 2 and 3: progression offer payload versus pushOffer contract

### TypeScript diagnostics

Both diagnostics are `TS2345` against calls to `pushOffer()`:

- Line 429: the `fagarbeider` branch offers `Mellomleder`.
- Line 448: the `mellomleder` branch offers `Formann`.

The object passed to `pushOffer()` contains only `career_id`, `career_name`, `title`, `threshold`, and `points_at_offer`. TypeScript infers `pushOffer`'s destructured parameter from all fields listed in its signature: `brand_id`, `brand_name`, `brand_type`, `brand_group`, `sector`, `place_id`, and `employer_context` are therefore treated as required properties even though the implementation normalizes missing values to `null`.

### Code locations and expressions

- Function: `maybeOfferCareerProgression(active)`.
- First block: current title `fagarbeider`, qualifying flags open a `Mellomleder` offer.
- Second block: current title `mellomleder`, qualifying flags open a `Formann` offer.
- Expressions: two `return pushOffer({ ... })` calls that pass the core promotion identity/threshold fields only.

### Runtime value shape

The runtime progression offer payloads are intentionally minimal career-progression objects:

```js
{
  career_id: currentCareerId,
  career_name: String(active?.career_name || "Næringsliv").trim(),
  title: "Mellomleder" | "Formann",
  threshold: Number(active?.threshold || 0) + 1,
  points_at_offer: Number(active?.threshold || 0) + 1
}
```

`pushOffer()` then builds a stored offer object with the core fields plus generated `offer_key`, `status`, `created_iso`, `expires_iso`, and optional employer/brand context normalized as `null` when omitted. That means missing brand/employer fields are not currently a runtime exception inside `pushOffer()`.

### Downstream consumers

- `getOffers()`, `setOffers()`, `expireOffers()`, `getLatestPendingOffer()`, `declineOffer()`, and `acceptOffer()` all operate on the stored offer array in `hg_job_offers_v1`.
- `acceptOffer()` forwards accepted offer fields to `CivicationState.setActivePosition()`, including the normalized optional brand/employer context fields.
- `ensureCuratedFirstJobSequence(offer)` builds first-job inbox events from accepted offers and reads role/career display fields plus `offer_key`; it does not require brand/employer context.
- `CivicationUI` reads `getLatestPendingOffer()`, accepts/declines by `offer_key`, and displays pending offer information.
- `civicationBrandEmployerBridge.js` patches `CivicationJobs.pushOffer` for ekspeditør/butikkmedarbeider-style offers and may enrich payloads with `brand_id`, `brand_name`, `brand_type`, `brand_group`, `sector`, `place_id`, and `employer_context` before calling the original `pushOffer`. This is a runtime signal that brand/employer context can exist, but it is not universal for all career progression offers.
- `CivicationBrandJobUI`, `CivicationEventEngine`, and role/story helpers use `active.brand_id` or `active.employer_context` when present and generally tolerate missing/empty brand context.

### Classification

- **concat/array envelope shape:** no.
- **offer/pushOffer contract:** yes. The inferred parameter is too strict relative to the implementation's null-normalization behavior.
- **missing optional brand/employer context:** yes. The missing fields appear optional at runtime for generic progression offers, but may be required by specific patched brand-employer flows.
- **unsafe broad cast candidate:** yes if solved by casting the whole `pushOffer` payload or file to `any`. That would hide real offer contract regressions and should be rejected.
- **actual data contract to formalise:** yes. The distinction between a minimal offer input and a stored offer record should be formalised, but it should be done narrowly and only after agreeing whether brand/employer context is optional for all non-brand progression offers.

## Warnings for future fix phases

Do not use a TypeScript migration pass to change job semantics. In particular:

- Do **not** add empty or dummy `brand_id`, `brand_name`, `brand_type`, `brand_group`, `sector`, `place_id`, or `employer_context` values merely to satisfy TypeScript.
- Do **not** change offer semantics, promotion eligibility, thresholds, duplicate detection, expiration, accept/decline behavior, or return values.
- Do **not** change inbox/job-state flow or the way first-job onboarding events are prepended.
- Do **not** change how promotions/offers are stored in `hg_job_offers_v1` or how active positions are written to `hg_active_position_v1`.
- Do **not** use a broad `any` around the whole file, the whole `pushOffer` function, the whole inbox, or the entire `CivicationJobs` export.
- Do **not** mix the inbox concat issue with an offer-contract change unless a later phase explicitly scopes both and includes runtime review. Phase 96 should have only one target.

## Recommended Phase 96

Recommended Phase 96 should have **one safe target**:

1. `js/Civication/core/civicationJobs.js` only: add a narrow local inbox-envelope typedef/cast around the existing `prependInboxEvents()` concat boundary, if review confirms that `window.HG_CiviEngine.getInbox()` returns the same envelope shape already consumed by `setInbox()` / UI inbox readers.

Suggested scope for Phase 96:

- Define a local inbox item/envelope shape that covers the fields actually used at this boundary: optional `status`, optional `createdAt`, and required/optional `event` with optional `id`.
- Type `makeInboxEnvelope()` and the `existing` inbox read consistently enough that `.concat(existing)` no longer asks TypeScript to combine incompatible array element shapes.
- Keep runtime output identical; do not alter `status`, `createdAt`, `event`, ordering, duplicate filtering, or the `setInbox()` call.
- Leave the two `pushOffer()` diagnostics for a later offer-contract phase, because that pass should decide whether to introduce a narrow `CivicationJobOfferInput` typedef with optional brand/employer fields or adjust the `pushOffer` parameter contract.

This recommendation intentionally chooses the inbox concat envelope target over the offer/pushOffer target. The offer diagnostics are probably fixable with a narrow input typedef where brand/employer fields are optional, but that change formalises a more sensitive promotion/brand-employer contract and should not be combined with the inbox shape fix.
