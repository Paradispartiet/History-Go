# Etne People of Places batch 17

## Scope

Batch 17 covers the previously uncovered canonical place `skanevik_kultur_og_idrettshall` with two named people whose roles are explicitly tied to the physical construction of the hall:

- `jan_henning_jespersen` — documented building leader during erection of the building
- `leif_jonny_johansen` — documented interior leader during the construction process

The batch does not add current board members, generic volunteers, event participants or people with only organisational associations.

## Primary source

Skånevik kultur- og idrettshall's own history page states that the project was organised through extensive local volunteer work. It documents that wall elements were erected in 1989 and explicitly names:

- Jan Henning Jespersen as `byggjeleiar under reisinga av bygget`
- Leif Jonny Johansen as `innredningsleiar`

The same source says the first floor was finished near the end of 1991, the first PE lesson took place on 3 January 1992, and the inauguration party was held in autumn 1994.

Source:
- https://skaanevikidrettshall.no/historie/

## Independent place cross-check

Brønnøysundregistrene confirms the active legal entity `SKÅNEVIK KULTUR- OG IDRETTSHALL SA` at Ligrendvegen 11, 5593 Skånevik, matching the existing canonical place anchor.

Source:
- https://virksomhet.brreg.no/nb/oppslag/enheter/970972285

## Canonical and duplicate audit

Fresh searches against current `main` were performed before creation for:

- `jan_henning_jespersen`
- `Jan Henning Jespersen`
- `Jespersen Skånevik`
- `leif_jonny_johansen`
- `Leif Jonny Johansen`

No existing canonical people identities or existing people links to the hall were found in the pre-batch audit. The batch regression test repeats the identity audit across the complete people manifest after integration, using normalized IDs, names and selected aliases.

## Role and date discipline

The source gives direct physical project roles, but it does not provide exact appointment dates for either role. Both entries therefore use `year: null` rather than converting the 1989 wall-element milestone into an unsupported role start date.

The records are deliberately narrow:

- Jespersen is not described as sole project leader or sole builder.
- Johansen is not described as personally responsible for all interior work or technical installations.
- Neither record claims a current operating role at the hall.

## Category decision

The existing canonical place is in `kunst` and is explicitly framed as a culture and multi-purpose arena rather than only a sports facility. The two people records therefore follow the place into the canonical people category `kunst`.

## Expected coverage effect

Batch 16 reported 57 of 81 active Etne places covered and 24 uncovered. Provided no unrelated Etne place changes land before integration, batch 17 should cover one additional place and leave 23 uncovered.
