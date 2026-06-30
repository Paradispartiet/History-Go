# Spotmeeting Inbox Cards v1

## Scope
Social Meet / Spotmeeting renders compact inbox cards for player-readable invite handling. This work does not touch Civication and does not add backend support, free chat, GPS/live location, nearby discovery, followers, or feed behavior.

## Empty state
When the Spotmeeting inbox has no invites, players see:
- “Ingen kunnskapsmøter ennå.”
- “Send et forslag fra et stedskort.”

## Inbox groups
- Venter på svar
- Avtalt
- Gjennomført
- Avslått eller avbrutt

## Helper text
- “Kunnskapsmøter bruker bare forhåndsvalg, ikke fritekst.”
- “Du deler ikke posisjon eller live-status.”

## Card content and layout
Each invite card stays compact for iPad-sized screens:
- one-line title with overflow truncation
- short meta line with context type, participant, and latest timestamp
- preset invite text on a single compact line
- action buttons wrap on one row when space allows
- no large modal and no new tab behavior

## Supported actions
- Pending: Godta, Avslå, and Avbryt forslag for invites created by the current user.
- Accepted: Marker som gjennomført and Avbryt forslag.
- Completed / declined / cancelled: read-only.

## Privacy result
The renderer uses only preset invite metadata from `HG_Spotmeeting.getSpotmeetingInbox()` and does not render free-text messaging, live position, nearby people, distance, last-seen, followers, or feed controls.
