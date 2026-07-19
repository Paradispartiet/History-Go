# Vulkan industriområde – PlaceCard rounds batch 1

Dato: 2026-07-19

## Avgrensning

Batchen fortsetter Akerselva-ruten etter Nedre Foss og fyller Vulkan industriområde sine ni canonical rundinger i by-profilen. Koordinatene eies av Oslo coordinate control batch 34 og verifiseres mot coordinate-evidence; denne batchen endrer dem ikke.

## Canonical år

Legacy-verdien `1857` erstattes med `1873`, dokumentert grunnleggelsesår for Vulkan Jernstøberi og mekaniske Verksted. Eldre industri på tomten – blant annet Bagaas Brug og virksomhet fra 1840- og 1850-årene – beholdes som forhistorie, ikke som Vulkan-bedriftens startår.

## Personer

- canonical `kristin_jarmund` gjenbrukes
- Halvor Hoaas opprettes som grunnlegger med direkte fysisk Vulkan-kobling
- Ferdinand Ludvig Vibe opprettes som medeier/enereeier med direkte fysisk Vulkan-kobling
- Axel Ingvald Spone Amundsen opprettes som eier og industrileder med direkte fysisk Vulkan-kobling

Eksisterende canonical people-data auditeres før opprettelse for å hindre ID- og navneduplikater.

## Rundinger

1. Personer
2. Natur
3. Merker
4. Verk
5. Civication
6. Aktører
7. Før/nå
8. Fortellinger
9. Leksikon

## Split-sikkerhet

Ingen full Akerselva-splitting. Bare `vulkan_industriomrade.json`, Vulkan-raden i route index og Vulkan-radens hash i split-manifestet endres blant route-place-filene.

## Kilder

- Oslo byleksikon – Vulkan Jernstøberi og mekaniske Verksted
- Store norske leksikon – Vulkan Jernstøberi og mekaniske Verksted
- Oslo byleksikon – Vulkan (område)
- Store norske leksikon – Vulkan (område i Oslo)
- Oslo byleksikon – Bagaas Brug
- Store norske leksikon – Axel Ingvald Spone Amundsen

## Sluttstatus

Den materialiserte sluttstaten har bestått målrettet Vulkan-test, canonical PlaceCard-rundingaudit, place-index build/check, split-manifest sync, People-of-Places audit, JSON-parse og `git diff --check`.

Koordinatparitet kontrolleres mot den canonical coordinate-evidence-posten fra Oslo coordinate control batch 34 i stedet for å hardkode lat/lon i innholdstesten. People-of-Places rapporterer null ugyldige stedsreferanser og null duplikate person-ID-er. Midlertidig finalizer og workflow er fjernet fra slutt­differansen.