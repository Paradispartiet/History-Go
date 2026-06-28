# Implementation Status

## HG Social Layer

Status: local/mock v2 implemented

Next: backend contract + privacy rules

## HG Social v3

Status: backend-ready

Privacy: implemented

Blocking: implemented

Moderation: implemented

Trust: protected

Backend contract: defined

## HG Social QA + Guards

Status: added

Purpose: runtime privacy guard against forbidden social/location fields

## HG Social Demo + Smoke Test

Status: added

Purpose: local visual verification of knowledge-based social layer

## Main Health Checkpoint after HG Social v3

Status: green

Purpose: confirms social layer, profile hooks, Civication Home snapshots, browser globals and smoke tooling are stable on main.

## Civication Home / Nabolag gameplay v1
Status: implemented
Purpose: makes district/home choice affect rent pressure, housing status and progression.

- Home/nabolag now has a lightweight gameplay loop over `civi_home_v1` with current district, unlocks, weekly rent due/paid state, housing status, move history, and eviction warnings.
- District cards expose rent, prestige, requirements, tags, unlock/lock reason, current marker, affordability, move action, rent pressure, and housing status.
- Rent uses existing PC/economic capital helpers/storage when available; no new currency, GPS, live location, public visit history, social matching, place/person data, manifests, or full NAV implementation was added.

## Civication phase-bundle UI flow

Status: fixed

Purpose: makes delivered phase bundles visible/actionable so players can complete required items and advance phases.
