# People of Places — Eidsvollsbygningen batch 5 research

## Scope

Batch 5 audited five candidates for explicit physical participation in the Riksforsamlingen at Eidsvoll in 1814. Existing canonical people records were checked before new IDs were created.

## Candidate audit

### Peder Anker

- name: Peder Anker
- existingPersonId: `peder_anker`
- existingFile: `data/people/historie/oslo/people_historie_oslo.json`
- existingPrimaryAnchor: `bogstad_gard`
- representativeOf: Akershus amt
- roleAtEidsvoll: Representative; elected the Riksforsamlingen's first president
- explicitPlaceConnection: Participated physically in the Riksforsamlingen at Eidsvoll in 1814
- action: `already_covered`
- sources:
  - https://eidsvoll1814.no/eidsvollsmennene
  - https://eidsvoll1814.no/peder-anker
- notes: The existing canonical record already contains `eidsvollsbygningen` in `places`. `bogstad_gard` remains the stronger primary anchor, so no person-data change is needed and no duplicate is created.

### Jens Schow Fabricius

- name: Jens Schow Fabricius
- existingPersonId: none found
- existingFile: none found
- existingPrimaryAnchor: none
- representativeOf: Sjødefensionen
- roleAtEidsvoll: Representative; president from 25 April to 2 May; initiated the closing reconciliation/brother-chain gesture on 20 May
- explicitPlaceConnection: Participated physically in the Riksforsamlingen at Eidsvoll in 1814
- action: `new_person`
- sources:
  - https://eidsvoll1814.no/eidsvollsmennene
  - https://eidsvoll1814.no/jens-schow-fabricius
- notes: New canonical ID `jens_schow_fabricius`. The record centers his documented assembly role, not his broader naval career.

### Frederik Meltzer

- name: Frederik Meltzer
- existingPersonId: none found
- existingFile: none found
- existingPrimaryAnchor: none
- representativeOf: Bergen
- roleAtEidsvoll: Representative; member of the Finance Committee; proposed restricting eligibility to the Storting for removable royal officials
- explicitPlaceConnection: Participated physically in the Riksforsamlingen at Eidsvoll in 1814
- action: `new_person`
- sources:
  - https://eidsvoll1814.no/eidsvollsmennene
  - https://eidsvoll1814.no/frederik-meltzer
- notes: New canonical ID `frederik_meltzer`. His later flag design is not used as the primary Eidsvoll rationale.

### Jonas Rein

- name: Jonas Rein
- existingPersonId: none found
- existingFile: none found
- existingPrimaryAnchor: none
- representativeOf: Bergen
- roleAtEidsvoll: Representative; member of the Constitutional Committee; prominent speaker for the independence side
- explicitPlaceConnection: Participated physically in the Riksforsamlingen at Eidsvoll in 1814
- action: `new_person`
- sources:
  - https://eidsvoll1814.no/eidsvollsmennene
  - https://eidsvoll1814.no/jonas-rein
  - https://eidsvoll1814.no/dagbok/april-1814
- notes: New canonical ID `jonas_rein`. The person text avoids presenting disputed assessments of individual speeches as an uncontested fact.

### Andreas Rogert

- name: Andreas Rogert
- existingPersonId: none found
- existingFile: none found
- existingPrimaryAnchor: none
- representativeOf: Trondhjem
- roleAtEidsvoll: Representative; member of the Constitutional Committee; vice president in the first week
- explicitPlaceConnection: Participated physically in the Riksforsamlingen at Eidsvoll in 1814
- action: `new_person`
- sources:
  - https://eidsvoll1814.no/eidsvollsmennene
  - https://eidsvoll1814.no/andreas-rogert
- notes: New canonical ID `andreas_rogert`. The record distinguishes his Eidsvoll role from his broader judicial career.

## Batch result

- `already_covered`: 1
- `new_person`: 4
- `cross_link`: 0
- `reject`: 0

No replacement candidate was introduced for Peder Anker. He remains part of the audited five-candidate batch, but requires no data mutation because the existing canonical record is already correctly linked to `eidsvollsbygningen`.
