# Blå skilt i Oslo — 2026 delta batch 1 — representasjonsbeslutning

Dato: 2026-07-19

## Auditresultat

Den automatiske auditen fant:

- fem av fem nåværende skiltadresser med entydige address-first-resultater fra Geonorge;
- ingen eksisterende canonical place-match på navn eller eksakt adresse for noen av de fem;
- Aud Schønemann finnes allerede som canonical person, knyttet til `nrk_huset_marienlyst`;
- ingen eksisterende Wonderkammer-dekning for de fem nye skiltstedene.

## Hovedbeslutning

Alle fem integreres som små canonical **minnesteder for selve det offentlige blå skiltet**.

Recorden skal ikke tolkes som:

- en invitasjon inn i en privat bolig;
- en påstand om at en moderne bygning er identisk med et revet historisk bygg;
- et millimeterpresist punkt for selve metallskiltet;
- et nytt sted bare fordi en kjent person en gang bodde på adressen.

Det som gjør stedet canonical er at det nå finnes en offentlig, fysisk og varig minnemarkør som er ment å oppsøkes og leses i byrommet.

## Kategorier

### Aud Schønemann

- id: `bla_skilt_aud_schonemann_vetlandsveien_69d`
- primary: `populaerkultur`
- secondary: `historie`

Skiltets gameplay-identitet er norsk skuespiller-, film- og TV-historie.

### Stein Mehren

- id: `bla_skilt_stein_mehren_ullevalsveien_60`
- primary: `litteratur`
- secondary: `historie`

Skiltet er et litterært minnested knyttet til forfatterens mangeårige hjem.

### Christopher Hornsrud

- id: `bla_skilt_christopher_hornsrud_mogens_thorsens_gate_5`
- primary: `politikk`
- secondary: `historie`

Skiltet er et politisk minnested for Norges første statsminister fra Arbeiderpartiet.

### Helverschous løkke

- id: `bla_skilt_helverschous_lokke_munkedamsveien_35`
- primary: `historie`

Recorden gjelder skiltet ved Munkedamsveien 35. Løkkehuset ble revet i 1896, og dagens Grøndahlgården skal ikke presenteres som den historiske bygningen.

### Enerhaugens Samfund

- id: `bla_skilt_enerhaugen_samfund_smedgata_34`
- primary: `historie`
- secondary: `politikk`

Recorden gjelder skiltet som ble montert ved dagens Smedgata 34 i 2026. Eldre kilder knytter den revne Samfund-bygningen til Smedgata 38. Denne forskjellen bevares eksplisitt i dataene.

## Koordinatmodell

Alle fem bruker den offisielle Geonorge-adressekoordinaten som dokumentert `display_marker` for skiltadressen.

Det er samme type modell som allerede brukes for blant annet `ruth_maier_minne`: et offentlig minneobjekt er dokumentert ved en konkret adresse, og adressepunktet fungerer som skilt-/minneanker uten å hevde millimeterpresisjon for objektet.

Radius settes til 35 meter for å signalisere at dette er små, presise minnepunkter og ikke store områdeankre.

## Skaleringsregel for senere Blå skilt-batcher

Et nytt Blått skilt kan bli canonical når:

1. skiltet er offentlig tilgjengelig fra gate eller offentlig rom;
2. skiltets adresse eller fysiske plassering kan dokumenteres;
3. det ikke allerede finnes en bedre canonical parent som skiltet naturlig bør ligge under;
4. recorden representerer skiltet/minnestedet presist og ikke feilaktig gjør privat interiør eller en revet bygning til dagens besøksobjekt.

Dersom en robust canonical parent allerede finnes, skal skiltet normalt berike den eksisterende place-recorden eller ligge som underordnet stedlig innhold i stedet for å skape en dublettmarkør.
