# Etne sport batch 2 — research

## Scope

Dedicated second `sport` batch for Etne municipality. Current `main` was searched before source creation for selected IDs, names and relevant variants. No existing canonical records were found for the five selected places.

Selected:

1. `etne_tennisanlegg`
2. `skanevik_skatepark`
3. `sjokanten_trivsel_skanevik`
4. `etne_kyokushin_dojo`
5. `fikse_skytebane`

## Candidate decisions

### Etne tennisanlegg

Etne IL documents two modern Playrite Clayrite artificial-clay tennis courts and a permanent booking-based tennis offer. Matchi lists the facility at Stadionvegen 12. This is a distinct sports facility even though it shares a postal/site address with other activity facilities in the wider Stadionvegen cluster.

Sources:
- https://www.etneil.no/idretter/tennis
- https://www.etneil.no/aktuelt/onsker-du-a-spille-tennis
- https://www.matchi.se/facilities/etnetennis

### Skånevik skatepark

The skatepark is a dedicated poured-concrete outdoor skate facility. Brettstedet documents construction in 2015; Explore The Fjord treats it as a named independent Skånevik activity place.

Sources:
- https://www.brettstedet.no/info.asp?id=18764&show=Skatespots
- https://explorethefjord.no/Skanevik/aktiviteter/i-skanevik/

### Sjøkanten Trivsel

Etne municipality lists Sjøkanten Trivsel as the municipality's outdoor swimming pool. Current descriptions document an outdoor heated 25-metre pool with four swimming lanes, a children's pool and service facilities; local reporting documents the strong volunteer-built character and use for school swimming instruction.

Sources:
- https://www.etne.kommune.no/kultur-og-fritid/idrett-og-friluftsliv/friluftsomrade/
- https://www.etne.kommune.no/Organisasjon/OrganisasjonVis.aspx?MId1=3694&OrganisasjonId=47
- https://www.ietne.no/aktuelt/eit-dugnadseventyr-i-skanevik
- https://explorethefjord.no/aktiviteter/sjokanten-trivsel/

### Etne Kyokushin-dojoen

Norges Kyokushin Karate Organisasjon lists Etne Kyokushin Karate Klubb with a permanent local training address, while current Brønnøysund data gives the club's business address as Stadionvegen 38. The place record represents the fixed dojo/training arena, not the club as an abstract organization.

Sources:
- https://www.nkko.no/klubber
- https://virksomhet.brreg.no/nb/oppslag/enheter/993454729
- https://www.etne.kommune.no/Organisasjon/OrganisasjonVis.aspx?MId1=3694&OrganisasjonId=59

### Fikse skytebane

Fikse is a named, active shooting range used for organized shooting, training, competitions and hunter-education activity. The shooting-range guide documents both outdoor and indoor range functions. The nearby Fikse clay-target range is explicitly documented as lying just across the municipal boundary in Vindafjord and is not part of this canonical record.

Sources:
- https://www.skytebaneguide.no/club/10676
- https://www.ejff.org/fikse-leirduebane.243673.nn.html
- https://www.njff.no/rogaland/vindafjord/aktivitetskalender/vjfl-jegerprove-2026
- https://www.etne.kommune.no/Organisasjon/OrganisasjonVis.aspx?MId1=3694&OrganisasjonId=62

## Excluded / deferred

### Etne pumptrack

Strong candidate, but deferred because it is listed at Stadionvegen 12 together with the already canonical `etne_bmx_og_skatepark`. Before creating another record, the physical relationship should be audited as either a separate track or an extension of the existing BMX/skate record.

Source:
- https://www.shapers.no/prosjekter/etne-pumptrack

### Separate pitches inside existing football complexes

Not created. Batch 1 already consolidates the main Etne and Skånevik outdoor football complexes and avoids one canonical place per sub-pitch.

## Coordinate policy

- `etne_tennisanlegg`: resolve Stadionvegen 12 through Kartverket/Geonorge; shared postal anchor with the BMX/skate facility must be explicitly disclosed, not treated as proof that the facilities are identical.
- `skanevik_skatepark`: resolve the documented Fv34/Fylkesvei address where possible; otherwise use a disclosed representative skatepark-area anchor.
- `sjokanten_trivsel_skanevik`: resolve Åsheimsvegen 1 through Kartverket/Geonorge and audit proximity to the existing Skånevik Fjordhotel record.
- `etne_kyokushin_dojo`: resolve Stadionvegen 38 through Kartverket/Geonorge.
- `fikse_skytebane`: prefer a Kartverket Stedsnavn facility point. Any fallback must remain on the Etne side of the municipal boundary and must not silently use the neighbouring clay-target range in Vindafjord.
