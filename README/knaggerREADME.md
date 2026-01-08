

## 0. Grunnleggende føring

History Go skal bygges på:
- kontrollerte begreper
- tydelig rollefordeling mellom dataobjekter
- ingen fritekstkaos
- ingen duplisering av kunnskap

Alt videre arbeid skal respektere dette.

---

## 1. Hva History Go er

History Go er et kartbasert lærings- og oppdagelsessystem der:

- Ruter (elver, grøntdrag, sykkelveier, historiske traséer)
- Steder (places) langs rutene
- Emner (flora, fauna, historie, personer)

kobles sammen gjennom semantiske metadata, ikke løse beskrivelser.

Systemet skal:
- vise potensiell natur og historisk relevans
- kunne bygges ut med brukerobservasjoner senere
- være maskinlesbart og konsistent
- kunne brukes av AI uten gjetting

---

## 2. Kjerneprinsipp (låst)

Én sannhet per informasjonslag.

- Biologi → emner
- Historie → emner + profiler
- Kart → kontekst, ikke kunnskap

Ingen snarveier.

---

## 3. Knaggeregisteret (grunnmuren)

### 3.1 Hva knagger er

Knagger er et kontrollert vokabular (registry) som definerer:
- alle historiske begreper
- alle naturbegreper
- alle tidsperioder
- all bykontekst

Ingen andre ord skal brukes i places eller routes.

### 3.2 Filplassering

/data/registry/knagger.json  
(tidligere register_knagger_v0_2.json)

### 3.3 Innhold i knaggefilen

Historie:
- tema
- periode
- type
- nokkelfraser
- kilder

Natur:
- biotop
- jord
- lys
- fukt
- bykontekst

Hver knagg har:
{
  "id": "...",
  "label": "...",
  "short": "...",
  "sort": n
}

label = full visning  
short = kompakt UI-visning  
sort = kronologisk rekkefølge

### 3.4 Absolutte regler

IKKE:
- bruk fritekst i profiler
- lag variasjoner av samme begrep
- hardkod labels uten register

KUN:
- bruk ID-er fra registeret
- utvid registeret ved behov
- slå opp label/short i UI

---

## 4. Ruter (routes)

### 4.1 Rutens rolle

En rute beskriver:
- et sammenhengende landskap
- en historisk og naturmessig helhet

Eksempler:
- Akerselva
- Alnaelva
- Ljanselva
- sykkeltraséer
- historiske ferdselsårer

### 4.2 knagger_baseline

Ruter kan ha:

knagger_baseline:
- natur: biotop, jord, lys, fukt, bykontekst
- historie: tema, periode, type, nokkelfraser

Dette er:
- grove, generelle forhold
- det som gjelder langs store deler av ruta
- ment for rutevisning, ikke presisjon

### 4.3 Akerselva (implementert)

Akerselva-ruten har baseline-knagger for:
- elvekant
- grøntdrag
- kratt og busksjikt
- industrihistorie
- vannkraft
- byomforming

Periodevisningen er strammet slik at UI ikke blir støyete.

---

## 5. Steder (places)

### 5.1 Stedets rolle

Et place er:
- et konkret punkt eller delstrekning
- noe som presiserer ruten
- aldri en kopi av ruten

### 5.2 Profiler på places

Naturprofil:
- habitat: biotop, jord, lys, fukt
- bykontekst: typiske_steder

Historieprofil:
- tema
- periode
- type
- nokkelfraser
- kilder

Alle verdier er ID-er fra knagge-registeret.

### 5.3 Viktige regler

- Ikke alle places trenger profiler
- Profiler brukes kun der det er meningsfullt
- Ruten dekker resten

---

## 6. Emner (flora, fauna, historie)

### 6.1 Emnenes rolle

Emner er kunnskapsobjektene:
- planter
- insekter
- dyr
- historiske temaer
- personer

De inneholder:
- habitat
- fenologi
- økologi
- bykontekst
- observasjonstips
- quiz-koblinger

### 6.2 Samspill med kartet

- Rute = her gir det mening
- Place = her er det spesielt
- Emne = dette er arten / temaet

Ingen av disse skal gjøre de andres jobb.

### 6.3 Fremtidig (valgfritt)

Emner kan få:
knagger: biotop, lys, fukt

Dette gir full maskinell matching, men er ikke påkrevd nå.

---

## 7. Bevisste designvalg (låst)

IKKE:
- kopier biologi inn i places
- kopier historietekst inn i routes
- bruk fritekst-tags
- la AI finne på begreper

JA:
- register = semantisk fasit
- rute = ramme
- place = presisering
- emne = kunnskap

---

## 8. Status nå

FERDIG:
- Omfattende knagge-register
- Akerselva:
  - rute med baseline-knagger
  - places med natur- og historieprofiler
- Periodevisning med short + sort

KLAR FOR:
- Alnaelva
- Ljanselva
- UI-visning
- senere: brukerobservasjoner

---

## 9. Instruks til videre AI-arbeid

Dette dokumentet er gjeldende arkitektur.  
Ikke foreslå nye strukturer, alternative modeller eller parallelle systemer.  
Alt videre arbeid skal bygges direkte på dette rammeverket.

---

SLUTT
