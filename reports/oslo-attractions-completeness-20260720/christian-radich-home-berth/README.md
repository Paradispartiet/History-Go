# Christian Radich — home-berth coordinate intake

Date: 2026-07-20

- Candidate: `christian_radich`
- Model: **historic mobile vessel with documented home berth**
- Land-base address: **Skur 32, Akershusstranda 9, Oslo**
- Finder status: **verified_candidate**
- Source object: **geonorge-adresser-v1:0301:10077:9**
- Coordinate: **59.90805979135746, 10.733834060566368**
- Proposed primary category: **historie**
- Final coordinate type: **home_berth_anchor**

The earlier City Centre audit was corrected after authoritative sources were re-evaluated. Christian Radich is mobile, but Akershusutstikkeren is a documented permanent Oslo home harbour rather than a loose office association.

VisitOSLO states that the ship lies at Akershusutstikkeren when it is not away on assignment. Oslo Havn states that Christian Radich has had its permanent place there since 1994 and explicitly describes the quay as the vessel's home harbour. The foundation's land base is Skur 32 at Akershusstranda 9, and the official Oslo Havn 2026 area map identifies the Akershusutstikkeren / Skur 32 quay area.

The normative address-first finder returned one clear Geonorge result for Skur 32. That point is therefore accepted as the stable **home-base and unlock marker** for the vessel, with the following hard semantic guard:

> The marker is not live tracking and does not guarantee that Christian Radich is physically present. It represents the documented Oslo home berth where the vessel normally lies when it is in Oslo.

The existing `akershus_kaier` canonical place remains the broader linear harbour and quay record. It is not a duplicate of the vessel place.

Coordinate and overlap gates are ready. Final taxonomy should now confirm `historie` before canonical production.
