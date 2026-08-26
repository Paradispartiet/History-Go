# History GO — canonical Micro Place contract v1

Status: **authoritative**

Schema: `data/places/regler/micro_place_profile_v1.schema.json`

Runtime: `js/ui/micro-place-card.js`
Last verified: **2026-08-26**

## 1. Purpose

A Micro Place is a small, precisely located place that needs its own map marker,
but does not justify a full Content Factory package or a four-collection
PlaceCard. Examples include Lesekiosks, book cabinets, recycling/service points,
reuse points, memorial plaques and Stolpersteine.

Micro is a **content tier inside canonical Place**, not a parallel dataset or a
new map category. A Micro Place keeps its own stable `id`, file, coordinates,
category, subcategory and marker. A `parent_place_id` is only a relation and may
never absorb or replace that marker.

## 2. Required Place fields

Every Micro Place must have:

- unique stable `id` and canonical file;
- `name`, finite `lat` and `lon` and coordinate evidence;
- existing canonical `category` and a registered `subcategory_id`;
- `placeTier: "micro"`;
- a valid `micro_place_profile` v1;
- short, place-specific `desc`;
- at least one inspectable source link;
- manifest/index inclusion so the marker is actually available at runtime.

`micro_place_profile` records kind, current status, source location, verification
date and whether a real place quiz exists. It must not be stamped as reviewed by
the materializer that generated the candidate.

## 3. Reduced content contract

Micro Places do **not** require artificial People, Objects, Brands, Stories,
Reading Trails, Fagverk, language packages, badges, four PlaceCard collections or
an eight-question quiz. A Micro Place may also omit all image fields; if an
image is supplied, the ordinary path and provenance validation still applies.
Such content may be connected later only when real,
place-specific evidence supports it.

The minimum editorial gate is:

1. exact physical/service identity;
2. source-backed location and current status;
3. short text that distinguishes this Place from nearby or similar Micro Places;
4. sentence-level source/claim relevance;
5. no copied filler, invented inventory or self-approved review;
6. independent audit before production-ready promotion.

If `quizMode` is `none`, the PlaceCard hides the quiz action. If it is `place`, a
real place-specific quiz must exist; the flag must never manufacture quiz data.

## 4. Simplified PlaceCard

Micro Places use one compact identity panel instead of the normal image plus
four-collection grid. The panel shows:

- an icon and the registered Micro Place kind;
- its canonical category/subcategory identity;
- current availability status;
- the short Place description above it.

The footer keeps useful place actions such as **Mer info**, **Registrer besøk**,
**Rute** and **Notat**. It hides collection surfaces, the on-site social surface,
Badges and Observation. Quiz is shown only when `quizMode: "place"`.

Opening a standard Place after a Micro Place must fully restore the ordinary
PlaceCard. The Micro renderer may not mutate Place data or change map styling.

## 5. Oslo classification

The Oslo foundation onboarding uses Micro Places for 32 service-sized points:

- 21 `litteratur / lesekiosk` Places;
- 11 `natur / miljo_gjenbruk` Places.

The Miljø & gjenbruk Places additionally keep `circular_profile` for factual
service and reuse details. The profile does not turn them into full nature
PlaceCards.

The 2026 expansion adds 25 separately reviewed canonical Micro Places:

- 15 additional `natur / miljo_gjenbruk` service points;
- four `bla_skilt` Places under the relevant existing top category;
- six individual `historie / snublestein` Places.

This pilot is not an exhaustive inventory of Oslo's blue plaques or
Stolpersteine. Every physical plaque or stone keeps its own identity; shared
addresses or themes are relations, not reasons to merge markers.

## 6. Review integrity

Materialization may only emit pending review state. Promotion requires a
separate audit record that identifies its reviewer and checks:

- each sentence against only relevant claim IDs;
- source support and current-status wording;
- coordinate and identity separation;
- duplicate and generic text across the batch;
- Micro Place fields and compact PlaceCard behavior.

Permanent tests must fail if a generator writes `passed` itself, if a Micro Place
has a four-collection `place_card_profile`, or if a Micro Place loses its own
canonical marker identity.
