# HG Social Architecture

## 1. Core principle

HG Social is a knowledge-based social layer for History Go. It connects people through what they are curious about, what they learn, and which historical themes they choose to explore together.

The social model is intentionally designed around explicit user intent. A user should be able to discover compatible knowledge interests, invite someone to a meet, join a learning circle, or collaborate on a route or quiz without exposing live presence, passive movement data, or popularity metrics.

## Hard rule

History Go social is knowledge-based, not location-based.

It must never use:

- live GPS presence
- nearby people
- visit history
- last seen
- follower counts
- public activity feed

## 2. What the system does

HG Social provides a structured way for users to interact around historical knowledge and shared learning goals.

It can:

- Show public learning profiles that users intentionally publish.
- Generate knowledge fingerprints from declared interests and learning behavior that is safe to summarize.
- Suggest matches based on compatible themes, eras, places, routes, and quiz interests.
- Support meet invites where both users explicitly opt in.
- Track confirmed meets as private agreements between participants.
- Use trust signals to make social interactions safer.
- Support learning circles for small group exploration.
- Allow users to collaborate through shared routes, quizzes, and observations.

## 3. What it never does

HG Social must not become a surveillance, popularity, or passive tracking system.

It never:

- Shows who is physically nearby.
- Shows live GPS presence.
- Stores or exposes a user's visit history as a social signal.
- Shows when a user was last seen.
- Ranks users by follower counts.
- Publishes a global or public activity feed.
- Infers social availability from background location.
- Makes a user visible to others without explicit profile and privacy choices.

## 4. Public profiles

Public profiles are intentionally limited and learning-oriented. They represent what a user wants others to know about their historical interests, not where the user is or what they recently did.

A public profile may include:

- Display name.
- Avatar or visual identity.
- Short bio.
- Preferred historical themes.
- Favorite eras or domains.
- Public learning goals.
- Optional badges earned through learning or contribution.

A public profile must not include:

- Live location.
- Nearby status.
- Visit history.
- Last seen timestamp.
- Follower count.
- Public activity feed.

## 5. Knowledge fingerprints

A knowledge fingerprint is a privacy-preserving summary of a user's historical interests and learning orientation. It exists to support matching and discovery without exposing raw behavior logs.

A fingerprint may be based on:

- Explicitly selected interests.
- Preferred themes, periods, places, and routes.
- Quiz topics the user chooses to associate with their profile.
- Learning circle participation categories.
- Saved or shared knowledge areas when the user opts in.

A fingerprint should be coarse-grained, explainable, and editable. Users should understand why a match or suggestion appears and should be able to change the inputs that affect it.

## 6. Match engine

The match engine connects users through compatible knowledge interests. It should explain matches in terms of shared curiosity rather than proximity.

Match signals may include:

- Shared themes.
- Compatible historical periods.
- Similar learning goals.
- Interest in the same route category.
- Complementary quiz strengths.
- Membership in overlapping learning circles.

The match engine must not use:

- Live GPS presence.
- Nearby people detection.
- Visit history.
- Last seen.
- Follower count.
- Public activity feed ranking.

## 7. Meet invites

Meet invites are explicit requests between users who choose to interact. They are not automatic proximity notifications.

A meet invite should include:

- Sender and recipient.
- Proposed topic or route.
- Optional proposed time window.
- Optional meeting context chosen by the sender.
- Message or reason for the invite.
- Clear accept, decline, and ignore actions.

Meet invites should be rate-limited, reportable, and block-aware. The recipient should remain in control of whether a conversation or meet is created.

## 8. Confirmed meets

A confirmed meet is created only after all required participants explicitly accept the invitation. It represents a mutual agreement, not inferred co-presence.

Confirmed meets may include:

- Participants.
- Shared topic, route, quiz, or observation context.
- Scheduled time.
- Optional meeting notes visible only to participants.
- Cancellation or completion state.

Confirmed meets must remain private to participants unless all participants explicitly choose a shareable artifact, such as a collaborative route summary or learning circle note.

## 9. Trust score

Trust score is a safety and quality signal for social interactions. It should help reduce spam, abuse, and low-quality invites without becoming a popularity metric.

Trust signals may include:

- Completed profile safety checks.
- Confirmed participation history without reports.
- Positive completion of collaborative learning actions.
- Moderation state.
- Block and report outcomes.

Trust score must not be displayed as a public popularity rank. It should be used carefully for safety thresholds, rate limits, and moderation decisions.

## 10. Learning circles

Learning circles are small groups organized around a shared historical topic, route, theme, place, or challenge. They are designed for collaboration and guided discovery.

A learning circle may support:

- Member list with explicit membership.
- Shared learning goal.
- Route or quiz collection.
- Group notes or observations.
- Invite and moderation rules.
- Circle-level privacy settings.

Learning circles should avoid public feed behavior. Updates should be scoped to members and should not become a global activity stream.

## 11. Shared routes

Shared routes let users collaborate around historical journeys. A route can become a shared object when users intentionally save, invite, or contribute to it.

Shared route features may include:

- Route title and description.
- Historical theme.
- Stops or story points.
- Participant notes.
- Suggested preparation questions.
- Completion or reflection prompts.

Shared routes must not expose who is currently on the route, who is nearby, or which users recently visited a stop.

## 12. Shared quiz

Shared quiz supports learning through collaborative or comparative knowledge challenges. The goal is learning, not public ranking.

Shared quiz features may include:

- Topic-based quiz sessions.
- Invite-only participation.
- Team or circle mode.
- Explanation-focused answers.
- Private result summaries for participants.
- Optional learning recommendations.

Shared quiz must not create public leaderboards based on follower-style popularity. If ranking exists, it should be scoped, temporary, and tied to an explicit quiz session.

## 13. Shared observations

Shared observations are user-created notes, reflections, or findings connected to a historical topic, route, object, or learning circle.

Shared observations may include:

- Text notes.
- Photo or media attachments when allowed.
- Source references.
- Route or quiz context.
- Circle-only visibility.
- Moderation and report controls.

Shared observations should be intentionally shared to a specific context. They should not become passive evidence of where a user has been.

## 14. Future backend needs

The local/mock v2 implementation should evolve into a backend contract that preserves the same privacy model.

Future backend work should define:

- Profile visibility schema.
- Knowledge fingerprint schema and user controls.
- Match request and explanation contract.
- Meet invite lifecycle endpoints.
- Confirmed meet privacy and retention rules.
- Trust score inputs, thresholds, and moderation hooks.
- Learning circle membership and role model.
- Shared route collaboration schema.
- Shared quiz session schema.
- Shared observation visibility and moderation schema.
- Blocking, reporting, and abuse prevention rules.
- Data retention policy for all social objects.
- Privacy review checklist for every new social signal.
