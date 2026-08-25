# Bankplassen – workcard

Status: `READY FOR FINAL QA`

Branchgrunnlag: `agent/content-factory-pilot-03-bankplassen-complete-v1` rebased på PlaceCard-fullhetsendringen på `main`.

## 1. Eierskap

- Canonical enhet er selve Bankplassen som navngitt offentlig plassrom.
- `grunnlovsbygget_bankplassen`, `norges_bank_bankplassen_4`, `norges_bank_bankplassen_2` og `cafe_engebret` er separate Places.
- Ole Høiland-fortellingen beholdes hos den gamle bankbygningen. Teaterhendelser beholdes hos teater-/Bankplassen 4-laget.
- Tematiske People-ankre er fjernet fra plassflaten; Sverre Fehn er flyttet til det faktiske bygningsstedet. Johannes Brun er beholdt som direkte Bankplassen-person fordi monumentet over ham står i selve plassrommet.

## 2. Evidens

- Geometri: OSM relation 12044741, kryssjekket mot Wikidata og separate byggesteder.
- Historie: Oslo byleksikon og Oppdag Kvadraturen/Byantikvaren.
- Bankbygninger: Norges Bank og Nasjonalmuseet.
- Teater og kafé: Oslo byleksikon og SNL.
- Kunst: fire verkssider fra Oppdag Kvadraturen/Oslo kommunes kunstsamling.
- Bilder: Oslo Museum/Wikimedia Commons (1838, public domain) og Øyvind Holmstad/Wikimedia Commons (2023, CC BY-SA 4.0).
- Produksjonspakken `data/places/production/bankplassen.json` binder alle 21 synlige setninger til 15 verifiserte claims.

## 3. Fag

- Emner: torg/plass som scene, offentlig rom, historiske lag og transformasjon/ombruk.
- Quizens finalsett binder William H. Whyte og `met_feltobservasjon` til konkret observasjon av opphold og bevegelse.
- `fagverk-sted.html?place=bankplassen` er obligatorisk QA-mål.

## 4. Kjerneinnhold og popup

- `desc`: 60 ord og ett styrende grep – plassrommet mellom selvstendige institusjoner.
- `popupDesc`: seks avsnitt med identitet, etablering, bank/teater, park/kafé, ombruk og kunst/observasjon.
- Historielag: fem.
- Før/nå: litografi 1838 mot foto 2023, uttrykkelig avgrenset som ulike kildetyper og ikke identisk kameraposisjon.
- Kilder: full safe-source-liste og bildeattribusjon.
- Nyheter: `N/A` – ingen evergreen, stedsspesifikk nyhet er dokumentert; volatile arrangementer brukes ikke som filler.
- Lesespor: de institusjonelle kildene i popup/kildearket er den dokumenterte fordypningsveien; ingen separat, svak lesespor-post opprettes.

## 5. Entiteter

- People: Johannes Brun, direkte knyttet til Bankplassen gjennom den dokumenterte statuen og det tidligere Christiania Theater-laget.
- Stories: `N/A` som ny Bankplassen-Story; eksisterende Ole Høiland-story eies av `grunnlovsbygget_bankplassen`.
- Objects: fire fysiske og stedsspesifikke kunstverk.
- Brands: Engebret Café er stedets dokumenterte Brands-samling.
- Related: fire canonical nabosteder.
- Natur: `N/A` som egen naturprofil; trærne omtales bare som del av det dokumenterte plassrommet.
- Språk: `N/A` – ingen stedsspesifikk dialekt eller lokalt uttrykk er dokumentert.

## 6. Læring og stedshandling

- Quiz: `rich_5x7`, 35 unike claims og 35 canonical Knowledge-enheter.
- Første 2×7 er normale, direkte spørsmål.
- Ruteoppgaven er erstattet med faktisk feltobservasjon av 1828-, 1906- og 1986-lagene og kunst i gateplanet.

## 7. PlaceCard

- VALGTE PLACECARD-SAMLINGER: `people`, `objects`, `brands`, `related`.
- People rendres som sirkel; Objects, Brands og Related som avrundede rektangler i fast 2×2-layout.
- Samlingene er innholdsmessig ærlige: Johannes Brun, fire kunstobjekter, Engebret Café og fire relaterte steder. Bilder er ikke samling.
- Quiz forblir synlig primærhandling.

## 8. Sluttport

- Canonical/index-paritet, schema, quiz, Knowledge, runtime, popup, desktop/mobil og CI må være grønne før merge.
- Ingen annen plass enn Bankplassen endres innholdsmessig; People-endringene er avgrensede eierskapsrettinger som fjerner falske Bankplassen-koblinger.
