# HG Social Privacy Rules

History Go social is a knowledge guild, study society, exploration network, and learning-circle system. It must not become social media, a dating app, a follower graph, a presence map, or an engagement feed.

## Privacy defaults

All privacy settings default OFF except Public Profile:

- Public Profile: ON
- Visible in Match Lists: OFF
- Allow Meet Invites: OFF
- Allow Circle Invites: OFF
- Show Social Reputation: OFF

## Permission functions

- `canSeeProfile(viewerId, targetId)` requires no block and target public profile.
- `canSeeMatch(viewerId, targetId)` requires profile visibility, both users visible in match lists, and no block.
- `canSendInvite(viewerId, targetId)` requires profile visibility, target invite opt-in, no block, and moderation clearance.
- `canViewCircle(viewerId, circleId)` allows members and trusted non-blocked viewers with relevant circle access.
- `canViewSocialHistory(viewerId, targetId)` requires target reputation opt-in and established trust.

## Blocking effects

Blocking creates mutual invisibility and immediately removes the pair from match surfaces, shared circles, pending invites, confirmed-meet visibility, and trust links.

## Data retention

Auto-delete:

- declined invites: 30 days
- cancelled invites: 30 days
- temporary notifications: 14 days

Retain:

- reports, until moderation policy says otherwise

Never store:

- GPS
- live presence
- visit history
- last seen
- nearby people
- follower graph
- public activity feed
