# People of Places — Akershus festning batch 1 research

## Scope

This starts a new People of Places series for `akershus_festning`.

The gate is intentionally strict:

- the person must have a concrete documented relation to Akershus festning itself
- loose Oslo history, general war participation, later memorial culture, or thematic association is not sufficient
- existing canonical people are never duplicated
- `akerhus_slott` and `akershus_festning` are both active place IDs and are treated as distinct anchors unless a deliberate cross-link is warranted

## Canonical audit of the initial shortlist

### Existing canonical records — no duplicate created

#### Håkon V Magnusson

- canonical id: `haakon_v_magnusson`
- primary `placeId`: `akerhus_slott`
- existing `places`: `akerhus_slott`, `middelalder_oslo`
- decision: keep existing canonical record; no duplicate

Forsvarsbygg identifies Håkon V Magnusson as the king under whom construction of Akershus began and who made Akershus a royal residence and national power centre. The existing canonical record is already anchored to the more specific active place `akerhus_slott`.

#### Christian IV

- canonical id: `christian_iv`
- primary `placeId`: `christiania_torv`
- existing `places`: `christiania_torv`, `akerhus_slott`, `bankplassen`
- decision: keep existing canonical record; no duplicate

Forsvarsbygg identifies Christian IV as one of the central figures in the 16th- and 17th-century modernization of Akershus into a bastion fortress. The existing canonical record already links him to `akerhus_slott` and retains the stronger primary anchor at Christiania Torv.

#### Vidkun Quisling

- canonical id: `vidkun_quisling`
- primary `placeId`: `akerhus_slott`
- existing `places`: `akerhus_slott`
- decision: keep existing canonical record; no duplicate

The existing record already uses the active castle place as its direct anchor. Quisling was installed as minister-president at the 1942 Statsakt on Akershus and was executed at the fortress in 1945, but no duplicate record is created for the broader fortress place.

## New canonical people

### Hannibal Sehested

- proposed id: `hannibal_sehested`
- existing canonical match: none found
- role: stattholder in Norway, høvedsmann at Akershus and lensherre of Akershus len from 1642
- explicit place connection: held office at Akershus, lived there as stattholder, and is directly tied to the major modernization phase of the castle and fortress
- significance: central 17th-century state, military and fiscal figure; direct institutional and physical Akershus connection
- action: `new_person`

Sources:

- Forsvarsbygg: `https://www.forsvarsbygg.no/eiendomsforvaltning/festningene/akershus-festning`
- Store norske leksikon: `https://snl.no/Hannibal_Sehested`
- Store norske leksikon, Akershus slott og festning: `https://snl.no/Akershus_slott_og_festning`

### Ulrik Frederik Gyldenløve

- proposed id: `ulrik_frederik_gyldenlove`
- existing canonical match: none found, including broader `Gyldenløve` search
- role: stattholder in Norway from 1664 to 1699
- explicit place connection: documented as being in activity at Akershus in June 1664 as stattholder and stiftamtmann
- significance: one of the longest-serving and most powerful stattholders in Norway under the absolutist monarchy
- action: `new_person`

Source:

- Store norske leksikon: `https://snl.no/Ulrik_Frederik_Gyldenl%C3%B8ve`

### Karl XII

- proposed id: `karl_xii`
- existing canonical match: none found under Karl XII / Carl XII variants
- role: Swedish king and commander of the 1716 invasion
- explicit place connection: personally led the army that occupied Christiania and besieged Akershus festning in 1716
- significance: the failed siege is one of the defining military episodes in the fortress's history
- action: `new_person`

Sources:

- Forsvarsbygg: `https://www.forsvarsbygg.no/eiendomsforvaltning/festningene/akershus-festning`
- Store norske leksikon: `https://snl.no/beleiringen_av_Akershus_festning_-_1716`
- Store norske leksikon: `https://snl.no/den_svenske_invasjonen_av_Norge_i_1716`

### Jørgen Christopher von Klenow

- proposed id: `jorgen_christopher_von_klenow`
- existing canonical match: none found
- role: commandant at Akershus
- explicit place connection: commanded the fortress and led its defence during the 1716 Swedish siege
- significance: the central on-site defender in one of Akershus festning's most important military episodes
- action: `new_person`

Sources:

- Store norske leksikon: `https://snl.no/J%C3%B8rgen_Christopher_von_Klenow`
- Store norske leksikon: `https://snl.no/beleiringen_av_Akershus_festning_-_1716`

### Knut Alvsson

- proposed id: `knut_alvsson`
- existing canonical match: none found under Knut Alvsson / Knut Alvssøn variants
- role: knight, former høvedsmann and leader of the 1501–1502 rebellion against King Hans
- explicit place connection: captured and controlled Akershus festning in 1502 and successfully held it against an attempt to retake it
- significance: Akershus was a central power base in the largest rebellion of the Danish period
- action: `new_person`

Sources:

- Store norske leksikon: `https://snl.no/Knut_Alvsson`
- Lokalhistoriewiki: `https://lokalhistoriewiki.no/wiki/Knut_Alvsson`

## Rejected or deferred candidates

### Odd Nansen

Rejected for this place series. His documented Akershus stay on 30 September 1943 was only a few hours in the prison yard while awaiting onward transport. His historical significance is clear, but the physical place connection is too marginal for this gate.

### Peder Tordenskjold

Not selected for Akershus festning. His naval operations were strategically important to the failure of Karl XII's 1716 campaign, but the documented connection is to the wider campaign and supply lines rather than direct activity at the fortress itself.

### Einar Gerhardsen and Trygve Bratteli

Both were found as existing canonical people and are not duplicated. Any future Akershus relation should be handled by auditing and updating their existing records rather than creating new person IDs.

## Batch decision

Batch 1 adds exactly five new canonical people with strong, direct and historically consequential Akershus festning relations:

1. Hannibal Sehested
2. Ulrik Frederik Gyldenløve
3. Karl XII
4. Jørgen Christopher von Klenow
5. Knut Alvsson

No marginal replacement candidates were used.
