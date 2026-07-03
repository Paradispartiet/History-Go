# AHA Quality Status Surface V1

## Purpose

AHA Quality Status Surface V1 is a local, read-only status surface that explains the quality of AHA understanding for the current conversation or analysis. It does not create new understanding; it presents existing quality-gate results in a conservative, safe form.

It answers:

- Is the insight source-bound?
- Is the topic consistent?
- Is the output protected against stale data?
- Is the analysis isolated from the previous run?
- Is there mismatch or invalid status?
- Can the snapshot be shown as safe, weak, or blocked?

It is not:

- a new analysis model;
- sync;
- EchoNet;
- an approval surface;
- project management;
- a backend model;
- a raw debug log;
- permanent memory;
- an export format alone.

## V1 output contract

The V1 contract is documentation-only for now. Runtime is not started in this PR.

```js
{
  version: "aha_quality_status_surface_v1",
  localOnly: true,
  readOnly: true,
  noSync: true,
  sourceScope: "current_conversation_or_analysis",
  status: "unknown" | "ok" | "warning" | "blocked",
  checks: {
    sourceBinding: {
      status: "unknown" | "passed" | "warning" | "failed",
      sourceBound: null
    },
    topicConsistency: {
      status: "unknown" | "passed" | "warning" | "failed",
      topicConsistent: null
    },
    staleData: {
      status: "unknown" | "passed" | "warning" | "failed",
      staleDataGuarded: null
    },
    analysisIsolation: {
      status: "unknown" | "passed" | "warning" | "failed",
      isolated: null
    }
  },
  safeSummary: {
    headline: "",
    lines: []
  },
  safety: {
    rawUserTextIncluded: false,
    privateUrlsIncluded: false,
    userIdentifiersIncluded: false,
    approvalActionAvailable: false,
    syncAvailable: false,
    echoNetAvailable: false
  }
}
```

## Field explanations

- `version`: Identifies the contract as `aha_quality_status_surface_v1`.
- `localOnly`: Locks the surface to local presentation only.
- `readOnly`: Confirms that the surface cannot write state, persist memory, or trigger actions.
- `noSync`: Confirms that the surface never starts sync or prepares a sync write.
- `sourceScope`: Limits the source context to the current conversation or current analysis result.
- `status`: The overall safety status. It must be conservative and can only be `unknown`, `ok`, `warning`, or `blocked`.
- `checks.sourceBinding`: Shows whether AHA understanding is bound to a safe source or analysis result, not stale or detached output.
- `checks.topicConsistency`: Shows whether output stays on the same topic and avoids stale or irrelevant topic bleed.
- `checks.staleData`: Shows whether stale-data guards protect against old analyses or previous runs.
- `checks.analysisIsolation`: Shows whether the analysis is isolated from earlier analysis runs.
- `safeSummary`: Short explanatory lines for humans. It must not include raw user data, source excerpts, private URLs, raw invalid fields, or full debug details.
- `safety`: Explicit locks proving the surface is not sync, approval, EchoNet, or a raw-data surface.

## Conservative status rules

- If `sourceBinding` fails, the overall `status` is at least `warning` and often `blocked`.
- If `topicConsistency` fails, the overall `status` is at least `warning` and often `blocked`.
- If the stale-data guard fails, the overall `status` is `blocked`.
- If analysis isolation is unknown, the overall `status` is no better than `warning`.
- If all checks are unknown, the overall `status` is `unknown`, not `ok`.
- If all required checks pass, the overall `status` can be `ok`.
- Invalid or mismatch status must be presented conservatively. It must not be converted into `ok` without passing source binding, topic consistency, stale-data, and analysis-isolation checks.

## Safety rules

AHA Quality Status Surface V1 must:

- be read-only;
- be local-only;
- not run sync;
- not write to `localStorage`;
- not read raw transcript;
- not send data to a backend;
- not use `fetch`;
- not show raw user data;
- not show private URLs;
- not show source excerpts;
- not show raw invalid fields if they can contain user data;
- not include `userId` or email;
- not use approval actions;
- not publish or share;
- not activate EchoNet.

## Relationship to AHA Conversation Insight Snapshot V1

AHA Conversation Insight Snapshot V1 shows what AHA understands. AHA Quality Status Surface V1 shows how safe that understanding is.

- Snapshot is understanding.
- Quality Status is quality explanation.
- Quality Status can later support Snapshot Preview by explaining whether a snapshot is safe, weak, or blocked.
- Neither surface runs sync.
- Neither surface activates EchoNet.
- Neither surface is an approval surface.

## Relationship to AHA Sync Overview V1

AHA Sync Overview V1 shows local coverage and patterns in source-event signals. AHA Quality Status Surface V1 shows the quality of one conversation or analysis.

Quality status must not be mixed with sync readiness. It does not decide target readiness, database readiness, manual sync execution, retry eligibility, or audit-write state.

## Relationship to existing quality gates

V1 reuses existing quality-gate results. It does not invent a new scoring model or weaken existing gates.

The relevant gates are:

- `sourceBinding`;
- `topicConsistency`;
- geopolitics consistency when relevant;
- stale-data guards;
- analysis run isolation;
- invalid or mismatch status.

Geopolitics consistency is not a separate top-level field in the initial V1 contract. When relevant, it should inform the conservative `topicConsistency`, `sourceBinding`, or overall `status` presentation without exposing raw user text or source excerpts.

## Not in V1

- manual approval;
- approve/reject actions;
- backend storage;
- sync;
- EchoNet graph;
- publishing or sharing;
- raw transcript browser;
- source review UI;
- project dashboard;
- automatic actions;
- PR or repository planning.

## Possible later V2

A later V2 can be considered for user-reviewed insight preparation.

V2 is not started here. Approval actions do not exist in this surface. Sync does not exist in this surface. EchoNet is not activated by this surface.
