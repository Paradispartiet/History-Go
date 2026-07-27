# Musikkvitenskap canonical v2

Denne katalogen er den vitenskapelige autoriteten for nye musikkfaglige emner, metoder, spørsmålsplaner og kildegrunnlag i History Go.

Pakken beskriver musikkvitenskap som forskningsfelt. Den er ikke en studieplan og skal ikke inneholde studiepoeng, semestre, arbeidskrav eller eksamensopplegg.

Start i `index.json`. Alle referanser er relative til denne katalogen.

## Aktiv faglig autoritet

- `domain_catalog_v2.json`: åtte vitenskapelige domener
- `modules_v2/*.json`: åtte aktive moduler med 48 forskningsmessig avgrensede temaer og 48 evidens- og metodebundne spørsmålsplaner
- `content_contract_defaults_v2.json`: felles evidens-, svar-, kilde- og distraktorkontrakter
- `method_protocols_v1.json`: canonicale metodeprotokoller
- `theory_and_debates_v1.json`: teoritradisjoner og aktive fagdebatter
- `research_contract.json`: påstands-, evidens- og dybdekontrakt
- `scholarly_source_standard_v1.json`: kilde-, metadata- og proveniensstandard
- `source_dossier_contract_v1.json`: kumulativ kontrakt for temavise forsknings- og kildegrunnlag
- `scholarly_source_registries_v1/*.json`: fire registre for musikalsk analyse
- `scholarly_source_registries_v2/*.json`: fire konsoliderte registre for historisk musikkvitenskap
- `source_dossiers_v1/musikalsk_analyse_lyd_struktur/*.json`: seks analysedossierer
- `source_dossiers_v2/historisk_musikkvitenskap_historiografi/*.json`: seks styrkede historiedossierer

Kildepakken dekker nå to domener, åtte registre, tolv temadossierer og 47 unike forskningspublikasjoner. Alle ni historiske kilder fra den første historiebatchen er bevart; 17 nye unike kilder er lagt til og fordelt på fire faglige registre.

Kildedossierene er ikke pensumlister og ikke systematiske litteraturgjennomganger. De dokumenterer et kontrollert bibliografisk grunnlag. Detaljpåstander krever fortsatt relevant fulltekst, presis side-, kapittel-, dokument-, takt- eller tidskodelokator og et identifisert direkte musikk- eller kildeobjekt.

Historiedossierene skiller katalogmetadata fra evidens i selve objektet. De krever etter kildetypen:

- fonds–samling–serie–arkivpost–referansekode
- original–kopi–avskrift–utgave–digitalisering
- opptakshendelse–take/matrix–master–utgivelse–reutgivelse
- beslutning/ressurs–aktør–gjennomføring–observerbart utfall
- avsendende ledd–mellomledd–mottakende ledd–lokal omforming

Filene i `modules/` er beholdt som legacy kildeinventar for eksisterende avhengigheter. De er ikke lenger autoritet for tema-, metode-, teori- eller spørsmålsproduksjon. `legacy_module_id_map_v1.json` oversetter gamle ID-er til canonicale ID-er.

Aktiv emnerevisjon: `musikkvitenskap-emnemigrasjon-v2-2026-07-27`

Aktiv kilderevisjon: `musikkvitenskap-kildegrunnlag-to-domener-v3-2026-07-28`
