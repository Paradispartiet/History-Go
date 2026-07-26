# History GO — stedspopup-system

Status: **canonical**  
Eier: `place_popup_presentation_contract`  
Runtime: `js/ui/place-popup-v2.js`  
Design: `css/place-popup-v2.css`  
Sist kontrollert: **2026-07-26**

Dette dokumentet definerer hvordan den rike stedspopupen skal bygges, hvilke strukturerte place-felt den kan lese, og hvordan ulike stedstyper skal presenteres uten at alle steder presses inn i samme mal.

## 1. Rolle og avgrensning

PlaceCard er stedets kompakte kontrollrom. Stedspopupen er stedets fordypningsflate.

Stedspopupen skal:

- vise `popupDesc` som hovedartikkel;
- bruke `desc` som kort ingress når tekstene er forskjellige;
- gjøre stedets fysiske utstrekning, innhold og historiske lag forståelige;
- vise type-spesifikke nøkkeltall når de er kildebelagt og strukturert;
- gjenbruke canonical people, relations, stories, events, Wonderkammer og knowledge;
- skjule tomme seksjoner;
- fungere på mobil, iPad og desktop;
- aldri opprette en parallell place-identitet.

Canonical stedssannhet ligger fortsatt i det manifest-lastede place-objektet. Popupen er en presentasjon av disse dataene, ikke et eget stedssystem.

## 2. Fast informasjonsrekkefølge

Alle stedstyper følger samme overordnede rytme:

1. **Header** — kategori, navn, år og stedstype.
2. **Hero** — hovedbilde med kontrollert fallback.
3. **Kort fortalt** — `desc` når den ikke er identisk med hovedartikkelen.
4. **Nøkkelfakta** — bare felter med faktiske verdier.
5. **Om stedet** — hele `popupDesc`, avsnittsbevart.
6. **Type-spesifikke seksjoner** — mål, delsteder, historiske lag, natur, arkitektur eller annen relevant struktur.
7. **Se etter på stedet** — observerbare særtrekk fra `quiz_profile`.
8. **Koblinger** — people, relations, Wonderkammer, knowledge, events og stories.
9. **Kilder** — kildeoversikt når `source_summary.safe_sources` finnes.
10. **Observasjoner** — bare når brukeren faktisk har observasjoner.

Tom informasjon skal ikke erstattes av bokser med «ingen … ennå». Fravær av data skal gi en renere popup, ikke mer støy.

## 3. Felles feltkontrakt

### 3.1 `spatial_profile`

Brukes for kildebelagte mål og fysisk form.

```json
{
  "spatial_profile": {
    "area_m2": 48000,
    "linear_extent_m": 500,
    "highest_point": {
      "name": "Blåsen",
      "elevation_masl": 81
    },
    "height_m": null,
    "terrain_type": "kalksteinsrygg",
    "landform": "langstrakt høydepark",
    "boundary_description": "Mellom Pilestredet, Stensgata, Thereses gate og Sporveisgata.",
    "measurement_status": "source_verified",
    "sources": []
  }
}
```

Regler:

- lagre areal i kvadratmeter;
- lagre lengde og høyde i meter;
- `elevation_masl` betyr meter over havet;
- `height_m` betyr fysisk byggehøyde eller konstruksjonshøyde;
- popupen formaterer enhetene, mens source-data beholder tallverdiene;
- estimater må merkes eksplisitt;
- gameplay-radius `r` er ikke stedets areal eller fysiske utstrekning.

### 3.2 `temporal_profile`

Brukes for noen få tydelige hovedmilepæler.

```json
{
  "temporal_profile": {
    "official_name_year": 1891,
    "development_period": "1890–1900",
    "completed_year": 1943
  }
}
```

`year` kan fortsatt være stedets primære år. `temporal_profile` brukes når ett enkelt år ikke forklarer stedets utvikling.

### 3.3 `subplaces`

Brukes når stedet inneholder tydelige delsteder, objekter eller soner.

```json
{
  "subplaces": [
    {
      "id": "blasen",
      "name": "Blåsen",
      "type": "utsiktspunkt_fjellknaus",
      "summary": "Øverste del av parken."
    }
  ]
}
```

Hvis `id`, `place_id` eller `target_id` treffer et eksisterende canonical place, blir kortet klikkbart. Et delsted uten eget canonical place vises som innhold i moderstedet og skal ikke automatisk opprettes som nytt sted.

### 3.4 `history_layers`

Brukes til en lesbar tidslinje, ikke som erstatning for `popupDesc`.

```json
{
  "history_layers": [
    {
      "id": "parkopparbeiding",
      "period": "1890–1900",
      "sort_order": 50,
      "title": "Første parkopparbeiding",
      "summary": "Opparbeidingen ble finansiert av Brændevinssamlaget."
    }
  ]
}
```

- `period` er brukerrettet tekst;
- `sort_order` bestemmer visningsrekkefølgen;
- `summary` skal være konkret og kort;
- usikre hypoteser skal ikke inn i tidslinjen før kildekravet er oppfylt.

### 3.5 `nature_profile`

Popupen kan vise terreng, naturtyper, habitater, observerbare arter, sesong og en kort naturfaglig oppsummering. Artslister skal være stedsspesifikke og kildebelagte. En tilfeldig liste over vanlige byarter er ikke innhold.

### 3.6 `source_summary`

`source_summary.safe_sources` kan vises nederst som en kort kildeoversikt. Popupen skal ikke vise interne research-notater, hold-back-påstander eller tekniske coordinate-notater som vanlig brukerinnhold.

## 4. Stedstypeprofiler

Fellesstrukturen er lik, men nøkkeltallene og seksjonene varierer.

### 4.1 Park og grøntområde

Prioriter areal, høyeste punkt, høyde over havet, terrengform, geologi, parkens lengde eller hovedakse, delsteder, utsiktspunkter, lekeområder, kulturminner, historiske lag, naturtyper, arter, ferdigstillelse og større ombygginger. Stensparken er referanseimplementasjonen.

### 4.2 Gate, vei og allé

Prioriter start og slutt, samlet lengde, kartlagte segmenter, viktige kryss og adresser, gatebredde når relevant, kollektivtransport, teknisk infrastruktur, navnehistorie og store ombygginger. Storgata er referanse for lineær utstrekning.

### 4.3 Bygning

Prioriter arkitekt, byggeår, stil, materialer, konstruksjon, grunnflate, byggehøyde, etasjer, kapasitet, vernestatus, hovedinngang, bygningsdeler, opprinnelig og nåværende bruk samt større ombygginger.

### 4.4 Torg, plass og offentlig byrom

Prioriter areal, avgrensning, tilstøtende gater, viktige fasader, monumenter, markeder, demonstrasjoner, seremonier, hverdagsbruk, dekke, møblering og historiske ombygginger.

### 4.5 Elv, bekk, innsjø og kyststed

Prioriter lengde, areal eller vannflate, kilde, utløp, nedbørfelt, høydefall, strømningsretning, broer, fosser, dammer, naturtyper, arter, flom, regulering, industri og restaurering.

### 4.6 Rute, sti og historisk ferdselsåre

Prioriter start, slutt, total lengde, etapper, stopp, stigning, høydeprofil, underlag, framkommelighet, ferdselsmåte, vanskelighetsgrad, sesong, sikkerhetsforhold og historisk funksjon.

### 4.7 Institusjon og anlegg

Prioriter grunnlagt år, dagens hovedsted, tidligere adresser, funksjon, bygninger, delanlegg, samlinger, saler, kapasitet, sentrale personer, verk og institusjonelle milepæler. Institusjonen og bygningen skal ikke blandes sammen dersom de har ulik identitet og historie.

### 4.8 Kulturminne, monument og kunstverk

Prioriter kunstner, arkitekt eller produsent, år, materiale, mål, teknikk, motiv, inskripsjon, funksjon, plassering i moderstedet, vernestatus, flytting, restaurering og senere bruk.

### 4.9 Arkeologisk område og historisk lokalitet

Prioriter datering, bruksperioder, område, avgrensning, synlige strukturer, funn, undersøkelses- og utgravningshistorie, vernestatus og tydelig skille mellom dokumenterte funn og hypoteser.

### 4.10 Bydel, strøk og større område

Prioriter forståelig avgrensning, areal når det finnes en datert kilde, delområder, hovedakser, landskap, topografi, utviklingsfaser, institusjoner, møteplasser og transport. Demografi skal bare vises med årstall og kilde.

### 4.11 Idrettsanlegg

Prioriter åpnet år, ombygginger, kapasitet, banemål, anleggstype, hjemmeaktører, delanlegg, viktige arrangementer, rekorder, arkitektur og konstruksjon.

### 4.12 Industrielt og teknisk sted

Prioriter produksjon eller teknisk funksjon, driftsperiode, maskiner, konstruksjoner, energikilde, størrelse, kapasitet, ytelse, råvarer, transportforbindelser, arbeidsliv, nedleggelse og gjenbruk.

## 5. Presentasjonsregler

1. Vis bare kildebelagte og strukturerte fakta.
2. Ikke trekk tall automatisk ut av `popupDesc`.
3. Ikke bruk coordinate-radius som areal eller fysisk radius.
4. Ikke vis interne ID-er, sourceObjectId, `coordNote`, auditstatus eller researchgjeld i vanlig popup.
5. Ikke dupliser samme verdi i flere seksjoner uten en tydelig funksjon.
6. Type-spesifikke seksjoner skal forsvinne helt når data mangler.
7. `popupDesc` skal fortsatt følge den bindende tekstkontrakten.
8. Delsteder skal beskrive faktisk romlig eller funksjonell inndeling.
9. Historiske lag skal være kronologiske og observerbare der det er mulig.
10. Naturinnhold skal beskrive stedet, ikke domenet generelt.

## 6. Bildelogikk

Bildekandidater prøves i denne rekkefølgen: `popupImage`, `image`, `cardImage`, `imageCard`, `frontImage`. Når ingen kandidater virker, skal popupen vise en designet stedflate. Et ødelagt bildeikon skal aldri være sluttresultatet.

## 7. Responsivitet og tilgjengelighet

- Popupen skal ha én intern vertikal scrollflate.
- Lukkeknappen skal være tilgjengelig uten scrolling.
- Mobil og smal iPad-visning skal bruke én kolonne.
- Klikkbare delsteder og personer skal være faktiske knapper.
- Teksten skal være lesbar uten hover.
- Farge skal ikke være eneste signal.
- Lange arts- og kildeoversikter skal pakkes uten horisontal sidescroll.

## 8. Stensparken som pilot

Stensparken demonstrerer hele parkprofilen:

- ca. 48 dekar parkareal;
- ca. 500 meter kalksteinsrygg;
- Blåsen som høyeste punkt, 81 meter over havet;
- delsteder som Blåsen, Korpehaugen, Fagerborg kirke og Kjærlighetskarusellen;
- historiske lag fra middelalderens Sten gård til dagens park;
- kalkrik tørrbakke, blomstereng og registrert fugleliv;
- kildeoversikt fra Oslo kommune, Oslo byleksikon og øvrige trygge stedskilder.

Piloten skal ikke bli en Stensparken-spesial i koden. Den bruker de samme generiske feltene som andre parker senere kan fylle.

## 9. QA

Ved endring av popupen eller de strukturerte feltene:

1. kjør `node --check js/ui/place-popup-v2.js`;
2. kjør popup-regresjonstestene;
3. parse alle endrede JSON-filer;
4. kontroller at popupen skjuler tomme seksjoner;
5. kontroller minst én park, én gate og én bygning;
6. kontroller mobil/iPad-breddene;
7. kjør dokumentasjonsstyring når canonical dokumenter eller registry endres;
8. kjør relevant place-health og manifestkontroll når place-data endres.

## 10. Eierskap

- `docs/PLACE_POPUP_SYSTEM.md` eier presentasjons- og stedstypekontrakten.
- `docs/PLACE_STANDARD.md` eier modenhets- og produktstandarden for steder.
- place JSON eier stedets faktiske data.
- `js/ui/place-popup-v2.js` eier runtime-renderingen.
- `css/place-popup-v2.css` eier utformingen.
- `data/places/regler/PLACE_DESCRIPTION_CANONICAL.md` eier tekstkravene.
- coordinate-kontraktene eier koordinatsemantikk og kan ikke overstyres av popupen.
