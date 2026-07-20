# Christian Radich — taxonomy decision

Date: 2026-07-20

## Decision

- Canonical id: `christian_radich`
- Primary category: `historie`
- Physical model: one historic mobile vessel represented by its documented permanent Oslo home-base marker at Skur 32 / Akershusutstikkeren
- Coordinate contract: ordinary verified `official_address` point with explicit home-berth semantics in content and coordinate note

## Why `historie`

Christian Radich is a preserved and actively operated full-rigged sailing ship launched in 1937, with a long history as a school ship and continuing use for maritime training, voyages and public activities. Its strongest History Go case is therefore maritime cultural history and living heritage rather than transport infrastructure or a generic visitor attraction.

The vessel is mobile, but its canonical place representation is justified by a separately documented fact: Akershusutstikkeren is its permanent Oslo home harbour and normal berth when it is in Oslo.

## Recommended emne anchors

- `em_his_spor_materialitet`
- `em_his_kulturminner_bevaring`
- `em_his_samtid_ettertid_fortelling`

These organise later content around the physical ship as historical evidence, preservation through active use, and the changing public story of a school ship that still sails.

## Core content angles

- construction and launch in 1937
- the full-rigged ship as material maritime history
- school-ship and maritime-training traditions
- preservation through continued active operation rather than static museum display
- the relationship between the mobile vessel and its long-term Oslo home harbour
- Akershusutstikkeren as the stable base without claiming that the ship is always physically present

## Guardrails

Avoid:

- presenting the home-base marker as live AIS tracking
- claiming that Christian Radich is always at Akershusutstikkeren
- using the current temporary office location as a vessel marker
- duplicating the broader `akershus_kaier` harbour-infrastructure place
- treating the ship merely as a tourist cruise product

## Coordinate-schema compatibility

The coordinate-source contract does not define a separate `home_berth` locator type. Canonical production should therefore use the existing verified address schema:

- `locatorType`: `poi`
- `sourceProvider`: `official_address`
- `sourceObjectId`: `geonorge-adresser-v1:0301:10077:9`
- `geocodeAccuracy`: `rooftop`
- `coordRole`: `display_marker`
- `coordType`: `address_point`
- `coordStatus`: `verified`

The place record and `coordNote` must state that the point represents the documented Oslo home base and normal berth, not the vessel's instantaneous position.

## Production gate

Coordinate, identity, overlap and taxonomy gates are resolved. `christian_radich` is ready for canonical production as one `historie` place.
