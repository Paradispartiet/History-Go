# Åkrafjorden – Vann-Nett geometri-audit

## Formål

Denne revisjonen undersøker om Åkrafjorden kan avgrenses med offisielle kystvannforekomstpolygoner i stedet for det gamle navnepunktet med radius. Vannforekomster er forvaltningsenheter med navngitt geometri og stabile ID-er.

## Resultat

- Kystvannforekomster som krysser søkeområdet: **15**
- Treff med Åkrafjorden i egenskapene: **1**
- Kilde: Miljødirektoratet / Vann-Nett, laget Kystvannforekomster
- Forespørsel: https://arcgis001.miljodirektoratet.no/arcgis/rest/services/vann_nett_ekstern/Vannmiljo/MapServer/1/query?where=1%3D1&geometry=5.7%2C59.62%2C6.58%2C59.98&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=*&returnGeometry=true&outSR=4326&f=geojson

### Del 1

- Feature-ID: `2243`
- Geometri: `Polygon`
- Polygoner: 1
- Ringer: 9
- Punkter: 2397
- Avgrensningsboks: `[5.9356472115639045,59.73366649120492,6.380831833196089,59.876530312435705]`
- Nøkkelegenskaper:

```json
{
  "OBJECTID": 2243,
  "EUSurfaceWaterBodyCode": "NO0260020600-C",
  "WaterBodyID": "0260020600-C",
  "Name": "Åkrafjorden",
  "RiverBasinID": "042",
  "SubUnitID": "5109-02",
  "CompetentAuthorityID": "4600",
  "RiverBasinDistrictID": "5109",
  "CatchmentID": "042.52",
  "EcoRegionID": "N",
  "WaterCategoryId": "CW",
  "NaturalCodeId": "NWB",
  "IsWaterbody": 1,
  "EcologicalStatusId": "1_High",
  "ChemicalStatusId": "3_poor",
  "EcologicalPotentialId": "N/A",
  "EcologicalStatusTargetId": "2_Good",
  "EcologicalPotentialTargetId": "N/A",
  "ChemicalStatusTargetId": "2_good"
}
```

## Neste beslutning

Dersom treffene dekker hele Åkrafjorden uten nabofjorder, kan polygonene brukes som canonical geometry og Artskart-revisjonsflate. Dersom vannforvaltningen deler fjorden i flere navngitte delområder, skal History GO bevare hele fjordstedet som en sammensatt multipolygon med alle relevante stabile vannforekomst-ID-er. Ingen artsdata publiseres fra det gamle navnepunktet.
