# HG Social Moderation

HG Social moderation protects learning-focused interaction without creating popularity metrics or public feeds.

## Report reasons

- Harassment
- Spam
- Manipulation
- Unsafe behavior
- Other

## Moderation functions

- `reportUser(userId, targetId, reason)` creates an open report.
- `getReports()` returns reports for moderation review.
- `resolveReport(reportId)` marks a report resolved while retaining the record.
- `canInteract(userId, targetId)` blocks interaction when blocks, active reports, repeated declines, or trust safety rules fail.
- `canJoinCircle(userId, circleId)` combines privacy, block, circle, report, and trust checks.
- `canAttendMeet(userId, meetId)` prevents blocked or restricted users from sharing a meet.
- `getModerationFlags(userId)` summarizes report count, repeated declines, low-trust, and restriction state.

## Trust safety

Trust must not increase from invites alone, repeated requests, or unaccepted interactions. Trust can only increase from accepted meets, completed routes, completed shared quizzes, and completed shared observations.

## Product boundaries

The moderation layer must reinforce History Go as a knowledge graph social system. It must not introduce dating mechanics, follower counts, presence maps, nearby-user surfaces, public feeds, popularity rankings, or engagement loops.
