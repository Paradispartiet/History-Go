# Spotmeeting Inbox Cards v1

## Scope
Social Meet / Spotmeeting now renders inbox entries as grouped invite cards. This work does not add backend support, free chat, live position, nearby discovery, followers, or feed behavior.

## Inbox groups
- Pending
- Accepted
- Completed
- Declined / cancelled

## Card content
Each invite card shows the context title, context type, preset message label, participant display name when available, status, and created/updated timestamps when present.

## Supported actions
- Pending: Godta, Avslå, and Avbryt for invites created by the current user.
- Accepted: Marker gjennomført and Avbryt.
- Completed: read-only.

## Privacy result
The renderer uses only preset invite metadata from `HG_Spotmeeting.getSpotmeetingInbox()` and does not render free-text messaging, live position, nearby people, distance, last-seen, followers, or feed controls.
