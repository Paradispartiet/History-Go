# 🎨 History Go — Designguide (Offisiell)

Denne designguiden beskriver ALLE visuelle standarder for History Go-kort, grafikk, farger, ikoner, layout, typografi, format og filregler. Dokumentet er absolutt: alt visuelt innhold som produseres i History Go-prosjektet skal følge disse retningslinjene.

-----------------------------------------
# 1. FORMAT & KANVAS
-----------------------------------------

• Alltid liggende 2:1-format.  
• Det er aldri tillatt å kutte bilder, beskjære, zoome inn eller klippe kanter.  
• Hele motivet og hele rammen skal være synlig — 100%, alltid.  
• Forside og bakside skal alltid genereres som to kort ved siden av hverandre.  
• Bakgrunn skal alltid være transparent (PNG med alpha).  
• Ingen glød, vignett eller gradient som dekker hjørner.  
• Eksakt rammetykkelse som merkene bruker.  
• Rammefarge = kategoriens farge (ikke gull).

-----------------------------------------
# 2. KATEGORI-IDENTITETER
-----------------------------------------

Hver kategori har EKSAKT følgende forpliktelser:

1. **Farge** — rammen og alle kantlinjer skal bruke kategoriens hovedfarge.
2. **Merke** — kategoriens emblem skal brukes oppe til venstre.
3. **Ikonografi** — History Go-ikonet nederst til høyre på baksiden, aldri på forsiden.
4. **Teksttone** — beskrivelsen skal følge kategoriens språkform:

Kategorier og farger:

• Historie → beige / brun  
• Litteratur & Poesi → dyp brun / sepia  
• Musikk & Scenekunst → rosa / blå  
• Vitenskap → blå / lysblå  
• Kunst & Kultur → burgunder / oker  
• By & arkitektur → grønn-grå  
• Natur → grønn  
• Sport & Lek → gul-grønn  
• Populærkultur → neonrosa / lilla  
• Subkultur → mørk grå / cyan  
• Næringsliv → blågrå

Kategori-merket skal ALDRI overstige 13% av bredden på kortet.

-----------------------------------------
# 3. HISTORY GO-LOGOEN
-----------------------------------------

• History Go-ikonet skal alltid være originalversjonen: rund, blå midt, gul kant.  
• Ingen alternative farger.  
• Ingen effekter.  
• Ingen skalering som forvrenger proporsjoner.  
• Skal plasseres nederst til høyre på BAKSIDEN av kortet.  
• Størrelse: ca. 12% av kortets bredde.

-----------------------------------------
# 4. FORSIDE — PERSONKORT
-----------------------------------------

• Venstre 70% av kortet: personens bilde (illustrasjon eller foto + stilstilpasning).  
• Ingen tekst på bildet unntatt integrert skilt på statuer.  
• Kategorien-merke oppe til venstre.  
• Rammefarge = kategoriens farge.

Nederst på forsiden skal tre linjer stå:

1. Navn  
2. Årstall / epoke  
3. Kategoriske nøkkelord (maks 3 ord, f.eks. "opera • internasjonal karriere")

Under dette:  
`HG: [kategori-kode] [løpenr.] [versjon]`  

Aldri repetere navn/årstall på baksiden.

-----------------------------------------
# 5. BAKSIDE — PERSONKORT
-----------------------------------------

Bakside har struktur:

Overskrift:  
`[Navn]`  

Underoverskrift:  
`[Født–død]` eller `[aktiv periode]`

Kort fagtekst (maks 5 linjer):  
• Hvem personen var  
• Hvorfor de er viktig  
• Oslo-tilknytning  
• Relevante prestasjoner  
• Kontekst

Deretter kategori-spesifikk seksjon:

Musikk & scenekunst:
• Sjanger  
• Scener  
• Opptredener  

Litteratur:
• Verk  
• Tema  
• Epoke  

Vitenskap:
• Felt  
• Oppdagelse  
• Institusjon  

Kunst:
• Medium  
• Stil  
• Verk  

Historie:
• Rolle  
• Periode  
• Hendelse  

Nederst til høyre: History Go-logo.

-----------------------------------------
# 6. FORSIDE — STEDSKORT
-----------------------------------------

• Venstre 75%: illustrasjon/foto av stedet.  
• Kategorimerke øverst venstre.  
• Riktig fargekant.  
• Aldri zoom, aldri crop.  
• Transparent bakgrunn.

Nederst:

1. Stedsnavn  
2. Kort undertekst (én setning)  
3. HG-koden

-----------------------------------------
# 7. BAKSIDE — STEDSKORT
-----------------------------------------

Standardisert faktaliste:

Byggeår: …  
Byggherre: …  
Arkitekt: …  
Byggestil: …  
Byggematerialer: …  
Historisk kontekst: …

Deretter et kort avsnitt (4–6 linjer) med:  
• Stedets betydning  
• Historisk rolle  
• Relevante hendelser  
• Nåværende bruk  

History Go-logo nederst til høyre.

-----------------------------------------
# 8. FORSIDE — HENDELSESKORT
-----------------------------------------

• Hendelsesbilde  
• Kategori-merke oppe venstre  
• Ingen rammebrudd  
• Riktig fargekant  
• Transparent bakgrunn

Nederst:

[Hendelsens navn]  
[Årstall]  
[Stikkord – maks 3]

-----------------------------------------
# 9. BAKSIDE — HENDELSESKORT
-----------------------------------------

Faste punkter:

Tid: …  
Sted: …  
Årsak: …  
Konsekvens: …  
Ettervirkning: …

Kort avsnitt som binder hendelsen til Oslos utvikling.

History Go-ikon nederst til høyre.

-----------------------------------------
# 10. FILNAVN, STRUKTUR & MAPPER
-----------------------------------------

Personer:  
`/bilder/kort/people/[id].PNG`  

Steder:  
`/bilder/kort/places/[id].PNG`

Husk:  
• ALLTID .PNG  
• ALLTID store bokstaver i filendelsen  
• ALLTID korrekt mappestruktur  
• Ingen mellomrom

-----------------------------------------
# 11. ABSOLUTTE FORBUD
-----------------------------------------

❌ Stående kort  
❌ Cropping / kutting  
❌ Feil logo  
❌ For store kategori-merker  
❌ Gullkant  
❌ Repetere navn/årstall  
❌ Uklare rammer  
❌ Variasjoner i stil eller farge  
❌ Fotoeffekt på baksiden  
❌ Kunstig vignett  
❌ Automatisk genererte ansikter av ekte personer

-----------------------------------------
# 12. ABSOLUTT KRAV
-----------------------------------------

✔ Transparent bakgrunn  
✔ Helt korrekt merke  
✔ Helt korrekt History Go-ikon  
✔ Alltid liggende  
✔ Hele motivet synlig  
✔ Riktig kategori-farge  
✔ Enhetlig layout  
✔ Tekst uten feil  
✔ Klar hierarkisk struktur  

-----------------------------------------
# SLUTT PÅ DESIGNGUIDE
-----------------------------------------
