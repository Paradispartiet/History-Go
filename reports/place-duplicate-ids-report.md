# Place duplicate IDs report

## 1) Kort status
Duplikatanalysen er nå gjort permanent som repo-rapport. Ingen datafiler eller runtime-filer er endret i denne oppgaven.

## 2) Totalt antall duplicate IDs
**82** duplicate IDs i `data/places/*.json` (top-level filer i `data/places`).

## 3) Metode
- Skannet `data/places/*.json`.
- Vurderte første aktive forekomst etter `PLACE_FILES_FALLBACK` i `js/boot.js`.
- Sammenlignet objekter per duplicate ID som **identiske** eller **ulike** (hele objektet).

## 4) Full liste over duplicate IDs

### aker_brygge
- duplicate_id: `aker_brygge`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Aker Brygge | category: by | year: 1989
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Aker Brygge | category: by | year: 1989

### akerselva
- duplicate_id: `akerselva`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Akerselva | category: by | year: 1850
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Akerselva | category: by | year: 1850

### alexander_kiellands_plass
- duplicate_id: `alexander_kiellands_plass`
- først brukt fallback-fil: `data/places/places_litteratur.json`
- vurdering: **ulike**
- forekomster:
  - data/places/oslo_places.json | name: Alexander Kiellands plass | category: litteratur | year: 1913
  - data/places/places_litteratur.json | name: Alexander Kiellands plass | category: litteratur | year: 1913

### alf_proysen_statue_nittedal
- duplicate_id: `alf_proysen_statue_nittedal`
- først brukt fallback-fil: `data/places/places_litteratur.json`
- vurdering: **ulike**
- forekomster:
  - data/places/oslo_places.json | name: Alf Prøysen-statuen – Nittedal kulturhus | category: litteratur | year: 2019
  - data/places/places_litteratur.json | name: Alf Prøysen-statuen – Nittedal kulturhus | category: litteratur | year: 2019

### bankplassen
- duplicate_id: `bankplassen`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Bankplassen | category: by | year: 1800
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Bankplassen | category: by | year: 1800

### barcode
- duplicate_id: `barcode`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **ulike**
- forekomster:
  - data/places/places_by.json | name: Barcode | category: by | year: 2016
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Barcode | category: by | year: 2016
  - data/places/places_kunst.json | name: Barcode | category: kunst | year: 2016

### birkelunden
- duplicate_id: `birkelunden`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Birkelunden | category: by | year: 1910
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Birkelunden | category: by | year: 1910

### bislett
- duplicate_id: `bislett`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Bislett | category: by | year: 1922
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Bislett | category: by | year: 1922

### bjorvika
- duplicate_id: `bjorvika`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Bjørvika | category: by | year: 2008
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Bjørvika | category: by | year: 2008

### bogstadveien
- duplicate_id: `bogstadveien`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Bogstadveien | category: by | year: 1870
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Bogstadveien | category: by | year: 1870

### botsparken
- duplicate_id: `botsparken`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Botsparken | category: by | year: 1900
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Botsparken | category: by | year: 1900

### camilla_collett_statue
- duplicate_id: `camilla_collett_statue`
- først brukt fallback-fil: `data/places/places_litteratur.json`
- vurdering: **ulike**
- forekomster:
  - data/places/oslo_places.json | name: Camilla Collett-statuen | category: litteratur | year: 1911
  - data/places/places_litteratur.json | name: Camilla Collett-statuen | category: litteratur | year: 1911

### carl_berner_plass
- duplicate_id: `carl_berner_plass`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Carl Berners plass | category: by | year: 1905
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Carl Berners plass | category: by | year: 1905

### christiania_torv
- duplicate_id: `christiania_torv`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Christiania Torv | category: by | year: 1648
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Christiania Torv | category: by | year: 1648

### damstredet_telthusbakken
- duplicate_id: `damstredet_telthusbakken`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **ulike**
- forekomster:
  - data/places/places_by.json | name: Damstredet og Telthusbakken | category: by | year: 1800
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Damstredet og Telthusbakken | category: by | year: 1800
  - data/places/places_historie.json | name: Damstredet og Telthusbakken | category: historie | year: 1750

### deichman_bjorvika
- duplicate_id: `deichman_bjorvika`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **ulike**
- forekomster:
  - data/places/oslo_places.json | name: Deichman Bjørvika | category: litteratur | year: 2020
  - data/places/places_by.json | name: Deichman Bjørvika | category: by | year: 2020
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Deichman Bjørvika | category: by | year: 2020
  - data/places/places_litteratur.json | name: Deichman Bjørvika | category: litteratur | year: 2020

### deichman_grunerlokka
- duplicate_id: `deichman_grunerlokka`
- først brukt fallback-fil: `data/places/places_litteratur.json`
- vurdering: **ulike**
- forekomster:
  - data/places/oslo_places.json | name: Deichman Grünerløkka | category: litteratur | year: 1914
  - data/places/places_litteratur.json | name: Deichman Grünerløkka | category: litteratur | year: 1914

### eldorado_bokhandel
- duplicate_id: `eldorado_bokhandel`
- først brukt fallback-fil: `data/places/places_litteratur.json`
- vurdering: **ulike**
- forekomster:
  - data/places/oslo_places.json | name: Eldorado Bokhandel | category: litteratur | year: 1924
  - data/places/places_litteratur.json | name: Eldorado Bokhandel | category: litteratur | year: 1924

### gamle_deichman
- duplicate_id: `gamle_deichman`
- først brukt fallback-fil: `data/places/places_litteratur.json`
- vurdering: **ulike**
- forekomster:
  - data/places/oslo_places.json | name: Gamle Deichman | category: litteratur | year: 1890
  - data/places/places_litteratur.json | name: Gamle Deichman | category: litteratur | year: 1890

### gamle_trikkestallen
- duplicate_id: `gamle_trikkestallen`
- først brukt fallback-fil: `data/places/places_historie.json`
- vurdering: **ulike**
- forekomster:
  - data/places/oslo_places.json | name: Gamle trikkestallen på Sagene | category: historie | year: 1899
  - data/places/places_historie.json | name: Gamle trikkestallen på Sagene | category: historie | year: 1899

### gronland_basarene
- duplicate_id: `gronland_basarene`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Grønland basarene | category: by | year: 1901
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Grønland basarene | category: by | year: 1901

### gronland_kirke
- duplicate_id: `gronland_kirke`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Grønland kirke | category: by | year: 1869
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Grønland kirke | category: by | year: 1869

### gronlandsleiret
- duplicate_id: `gronlandsleiret`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Grønlandsleiret | category: by | year: 1860
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Grønlandsleiret | category: by | year: 1860

### grotta
- duplicate_id: `grotta`
- først brukt fallback-fil: `data/places/places_litteratur.json`
- vurdering: **ulike**
- forekomster:
  - data/places/oslo_places.json | name: Grotten | category: litteratur | year: 1924
  - data/places/places_litteratur.json | name: Grotten | category: litteratur | year: 1924

### grunerlokka_helgesens_tm
- duplicate_id: `grunerlokka_helgesens_tm`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Grünerløkka – Helgesens / Thorvald Meyers | category: by | year: 1880
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Grünerløkka – Helgesens / Thorvald Meyers | category: by | year: 1880

### helsfyr
- duplicate_id: `helsfyr`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Helsfyr | category: by | year: 1966
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Helsfyr | category: by | year: 1966

### henrik_wergeland_statue
- duplicate_id: `henrik_wergeland_statue`
- først brukt fallback-fil: `data/places/places_litteratur.json`
- vurdering: **ulike**
- forekomster:
  - data/places/oslo_places.json | name: Henrik Wergeland-statuen | category: litteratur | year: 1881
  - data/places/places_litteratur.json | name: Henrik Wergeland-statuen | category: litteratur | year: 1881

### ibsen_quotes
- duplicate_id: `ibsen_quotes`
- først brukt fallback-fil: `data/places/places_litteratur.json`
- vurdering: **ulike**
- forekomster:
  - data/places/oslo_places.json | name: Ibsen sitater | category: litteratur | year: 2006
  - data/places/places_litteratur.json | name: Ibsen sitater | category: litteratur | year: 2006

### inger_hagerups_plass
- duplicate_id: `inger_hagerups_plass`
- først brukt fallback-fil: `data/places/places_litteratur.json`
- vurdering: **ulike**
- forekomster:
  - data/places/oslo_places.json | name: Inger Hagerups plass | category: litteratur | year: 1990
  - data/places/places_litteratur.json | name: Inger Hagerups plass | category: litteratur | year: 1990

### jernbanetorget
- duplicate_id: `jernbanetorget`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Jernbanetorget | category: by | year: 1854
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Jernbanetorget | category: by | year: 1854

### kampen_kirke
- duplicate_id: `kampen_kirke`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Kampen kirke | category: by | year: 1882
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Kampen kirke | category: by | year: 1882

### karl_johan
- duplicate_id: `karl_johan`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Karl Johans gate | category: by | year: 1848
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Karl Johans gate | category: by | year: 1848

### kulturkirken_jakob_litteratur
- duplicate_id: `kulturkirken_jakob_litteratur`
- først brukt fallback-fil: `data/places/places_litteratur.json`
- vurdering: **ulike**
- forekomster:
  - data/places/oslo_places.json | name: Kulturkirken Jakob | category: litteratur | year: 2000
  - data/places/places_litteratur.json | name: Kulturkirken Jakob | category: litteratur | year: 2000

### litteraturhuset
- duplicate_id: `litteraturhuset`
- først brukt fallback-fil: `data/places/places_litteratur.json`
- vurdering: **ulike**
- forekomster:
  - data/places/oslo_places.json | name: Litteraturhuset | category: litteratur | year: 2007
  - data/places/places_litteratur.json | name: Litteraturhuset | category: litteratur | year: 2007

### majorstuen_krysset
- duplicate_id: `majorstuen_krysset`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Majorstuen krysset | category: by | year: 1930
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Majorstuen krysset | category: by | year: 1930

### majorstuen_tbanestasjon
- duplicate_id: `majorstuen_tbanestasjon`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Majorstuen T-banestasjon | category: by | year: 1898
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Majorstuen T-banestasjon | category: by | year: 1898

### markveien
- duplicate_id: `markveien`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Markveien | category: by | year: 1880
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Markveien | category: by | year: 1880

### nasjonalbiblioteket
- duplicate_id: `nasjonalbiblioteket`
- først brukt fallback-fil: `data/places/places_litteratur.json`
- vurdering: **ulike**
- forekomster:
  - data/places/oslo_places.json | name: Nasjonalbiblioteket | category: litteratur | year: 1914
  - data/places/places_litteratur.json | name: Nasjonalbiblioteket | category: litteratur | year: 1914

### nationaltheatret
- duplicate_id: `nationaltheatret`
- først brukt fallback-fil: `data/places/places_litteratur.json`
- vurdering: **ulike**
- forekomster:
  - data/places/oslo_places.json | name: Nationaltheatret | category: litteratur | year: 1899
  - data/places/places_litteratur.json | name: Nationaltheatret | category: litteratur | year: 1899

### nationaltheatret_stasjon
- duplicate_id: `nationaltheatret_stasjon`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Nationaltheatret stasjon | category: by | year: 1928
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Nationaltheatret stasjon | category: by | year: 1928

### nobelinstituttet
- duplicate_id: `nobelinstituttet`
- først brukt fallback-fil: `data/places/places_historie.json`
- vurdering: **ulike**
- forekomster:
  - data/places/oslo_places.json | name: Nobelinstituttet | category: vitenskap | year: 1905
  - data/places/places_historie.json | name: Nobelinstituttet | category: vitenskap | year: 1905

### norli_universitetsgata
- duplicate_id: `norli_universitetsgata`
- først brukt fallback-fil: `data/places/places_litteratur.json`
- vurdering: **ulike**
- forekomster:
  - data/places/oslo_places.json | name: Norli Universitetsgata | category: litteratur | year: 1890
  - data/places/places_litteratur.json | name: Norli Universitetsgata | category: litteratur | year: 1890

### nydalen
- duplicate_id: `nydalen`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Nydalen | category: by | year: 2000
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Nydalen | category: by | year: 2000

### olaf_ryes_plass
- duplicate_id: `olaf_ryes_plass`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Olaf Ryes plass | category: by | year: 1890
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Olaf Ryes plass | category: by | year: 1890

### operahuset
- duplicate_id: `operahuset`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Operahuset | category: by | year: 2008
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Operahuset | category: by | year: 2008

### oscar_braaten_statuen
- duplicate_id: `oscar_braaten_statuen`
- først brukt fallback-fil: `data/places/places_litteratur.json`
- vurdering: **ulike**
- forekomster:
  - data/places/oslo_places.json | name: Oscar Braaten-statuen | category: litteratur | year: 1956
  - data/places/places_litteratur.json | name: Oscar Braaten-statuen | category: litteratur | year: 1956

### oslo_bussterminal
- duplicate_id: `oslo_bussterminal`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Oslo bussterminal | category: by | year: 1987
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Oslo bussterminal | category: by | year: 1987

### oslo_s
- duplicate_id: `oslo_s`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Oslo S | category: by | year: 1980
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Oslo S | category: by | year: 1980

### proysenhuset_rudshogda
- duplicate_id: `proysenhuset_rudshogda`
- først brukt fallback-fil: `data/places/places_litteratur.json`
- vurdering: **ulike**
- forekomster:
  - data/places/oslo_places.json | name: Prøysenhuset – Rudshøgda | category: litteratur | year: 2014
  - data/places/places_litteratur.json | name: Prøysenhuset – Rudshøgda | category: litteratur | year: 2014

### radhusplassen
- duplicate_id: `radhusplassen`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Rådhusplassen | category: by | year: 1950
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Rådhusplassen | category: by | year: 1950

### ring_3
- duplicate_id: `ring_3`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Ring 3 | category: by | year: 1970
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Ring 3 | category: by | year: 1970

### rodelokka
- duplicate_id: `rodelokka`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Rodeløkka | category: by | year: 1870
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Rodeløkka | category: by | year: 1870

### romsaås
- duplicate_id: `romsaås`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Romsås | category: by | year: 1970
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Romsås | category: by | year: 1970

### ruth_maier_minne
- duplicate_id: `ruth_maier_minne`
- først brukt fallback-fil: `data/places/places_litteratur.json`
- vurdering: **ulike**
- forekomster:
  - data/places/oslo_places.json | name: Ruth Maier-minnesmerke | category: litteratur | year: 2010
  - data/places/places_litteratur.json | name: Ruth Maier-minnesmerke | category: litteratur | year: 2010

### sigrid_undset_statue
- duplicate_id: `sigrid_undset_statue`
- først brukt fallback-fil: `data/places/places_litteratur.json`
- vurdering: **ulike**
- forekomster:
  - data/places/oslo_places.json | name: Sigrid Undset-statuen | category: litteratur | year: 1982
  - data/places/places_litteratur.json | name: Sigrid Undset-statuen | category: litteratur | year: 1982

### slottet
- duplicate_id: `slottet`
- først brukt fallback-fil: `data/places/places_historie.json`
- vurdering: **ulike**
- forekomster:
  - data/places/oslo_places.json | name: Det kongelige slott | category: historie | year: 1849
  - data/places/places_historie.json | name: Det kongelige slott | category: historie | year: 1849

### slottsparken
- duplicate_id: `slottsparken`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Slottsparken | category: by | year: 1840
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Slottsparken | category: by | year: 1840

### sofienberg_kirke
- duplicate_id: `sofienberg_kirke`
- først brukt fallback-fil: `data/places/places_historie.json`
- vurdering: **ulike**
- forekomster:
  - data/places/oslo_places.json | name: Sofienberg kirke | category: historie | year: 1877
  - data/places/places_historie.json | name: Sofienberg kirke | category: historie | year: 1877

### sofienbergparken_subkultur
- duplicate_id: `sofienbergparken_subkultur`
- først brukt fallback-fil: `data/places/places_subkultur.json`
- vurdering: **ulike**
- forekomster:
  - data/places/oslo_places.json | name: Sofienbergparken | category: subkultur | year: 1980
  - data/places/places_subkultur.json | name: Sofienbergparken | category: subkultur | year: 1980

### sorenga
- duplicate_id: `sorenga`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Sørenga | category: by | year: 2015
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Sørenga | category: by | year: 2015

### spikersuppa
- duplicate_id: `spikersuppa`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Spikersuppa | category: by | year: 1930
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Spikersuppa | category: by | year: 1930

### st_hanshaugen_park
- duplicate_id: `st_hanshaugen_park`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: St. Hanshaugen park | category: by | year: 1876
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: St. Hanshaugen park | category: by | year: 1876

### stensparken
- duplicate_id: `stensparken`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Stensparken | category: by | year: 1890
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Stensparken | category: by | year: 1890

### storgata
- duplicate_id: `storgata`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Storgata | category: by | year: 1850
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Storgata | category: by | year: 1850

### tigeren
- duplicate_id: `tigeren`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Tigerstatuen | category: by | year: 2000
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Tigerstatuen | category: by | year: 2000

### tjuvholmen
- duplicate_id: `tjuvholmen`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **ulike**
- forekomster:
  - data/places/places_by.json | name: Tjuvholmen | category: by | year: 2010
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Tjuvholmen | category: by | year: 2010
  - data/places/places_kunst.json | name: Tjuvholmen | category: kunst | year: 2005

### torggata
- duplicate_id: `torggata`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Torggata | category: by | year: 1850
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Torggata | category: by | year: 1850

### toyen_torg
- duplicate_id: `toyen_torg`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Tøyen torg | category: by | year: 1972
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Tøyen torg | category: by | year: 1972

### trikk_17_18
- duplicate_id: `trikk_17_18`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Trikkelinje 17/18 | category: by | year: 1924
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Trikkelinje 17/18 | category: by | year: 1924

### tronsmo_bokhandel
- duplicate_id: `tronsmo_bokhandel`
- først brukt fallback-fil: `data/places/places_litteratur.json`
- vurdering: **ulike**
- forekomster:
  - data/places/oslo_places.json | name: Tronsmo Bokhandel | category: litteratur | year: 1973
  - data/places/places_litteratur.json | name: Tronsmo Bokhandel | category: litteratur | year: 1973

### tvergastein
- duplicate_id: `tvergastein`
- først brukt fallback-fil: `data/places/places_vitenskap.json`
- vurdering: **ulike**
- forekomster:
  - data/places/oslo_places.json | name: Tvergastein | category: vitenskap | year: 1937
  - data/places/places_vitenskap.json | name: Tvergastein | category: vitenskap | year: 1937

### ullern
- duplicate_id: `ullern`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Ullern | category: by | year: 1930
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Ullern | category: by | year: 1930

### ullevål_hageby
- duplicate_id: `ullevål_hageby`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **ulike**
- forekomster:
  - data/places/oslo_places.json | name: Ullevål Hageby | category: litteratur | year: 1918
  - data/places/places_by.json | name: Ullevål Hageby | category: by | year: 1915
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Ullevål Hageby | category: by | year: 1915
  - data/places/places_litteratur.json | name: Ullevål Hageby | category: litteratur | year: 1918

### universitetets_gamle_hovedbygning
- duplicate_id: `universitetets_gamle_hovedbygning`
- først brukt fallback-fil: `data/places/places_vitenskap.json`
- vurdering: **ulike**
- forekomster:
  - data/places/oslo_places.json | name: Universitetets gamle hovedbygning | category: vitenskap | year: 1852
  - data/places/places_vitenskap.json | name: Universitetets gamle hovedbygning | category: vitenskap | year: 1852

### universitetets_gamle_kjemi
- duplicate_id: `universitetets_gamle_kjemi`
- først brukt fallback-fil: `data/places/places_vitenskap.json`
- vurdering: **ulike**
- forekomster:
  - data/places/oslo_places.json | name: Universitetets gamle kjemibygning | category: vitenskap | year: 1865
  - data/places/places_vitenskap.json | name: Universitetets gamle kjemibygning | category: vitenskap | year: 1865

### universitetsplassen
- duplicate_id: `universitetsplassen`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Universitetsplassen | category: by | year: 1852
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Universitetsplassen | category: by | year: 1852

### vaalerenga
- duplicate_id: `vaalerenga`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Vålerenga | category: by | year: 1860
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Vålerenga | category: by | year: 1860

### var_frelsers_gravlund
- duplicate_id: `var_frelsers_gravlund`
- først brukt fallback-fil: `data/places/places_historie.json`
- vurdering: **ulike**
- forekomster:
  - data/places/oslo_places.json | name: Vår Frelsers gravlund | category: litteratur | year: 1808
  - data/places/places_historie.json | name: Vår Frelsers gravlund | category: historie | year: 1808
  - data/places/places_litteratur.json | name: Vår Frelsers gravlund | category: litteratur | year: 1808

### vigelandsparken
- duplicate_id: `vigelandsparken`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **ulike**
- forekomster:
  - data/places/places_by.json | name: Vigelandsparken | category: by | year: 1947
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Vigelandsparken | category: by | year: 1947
  - data/places/places_kunst.json | name: Vigelandsparken | category: kunst | year: 1947

### vinderen
- duplicate_id: `vinderen`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Vinderen | category: by | year: 1920
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Vinderen | category: by | year: 1920

### voienvolden
- duplicate_id: `voienvolden`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **ulike**
- forekomster:
  - data/places/oslo_places.json | name: Vøienvolden gård | category: litteratur | year: 1720
  - data/places/places_by.json | name: Voienvolden | category: by | year: 1716
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Voienvolden | category: by | year: 1716
  - data/places/places_litteratur.json | name: Vøienvolden gård | category: litteratur | year: 1720

### vulkan_energisentral
- duplicate_id: `vulkan_energisentral`
- først brukt fallback-fil: `data/places/places_by.json`
- vurdering: **identiske**
- forekomster:
  - data/places/places_by.json | name: Vulkan energisentral | category: by | year: 2012
  - data/places/places_by_22_with_quiz_profiles_v2_refined.json | name: Vulkan energisentral | category: by | year: 2012

## 5) Lavrisiko-duplikater
Identiske duplikater mellom `places_by.json` og `places_by_22_with_quiz_profiles_v2_refined.json`:
- aker_brygge
- akerselva
- bankplassen
- birkelunden
- bislett
- bjorvika
- bogstadveien
- botsparken
- carl_berner_plass
- christiania_torv
- gronland_basarene
- gronland_kirke
- gronlandsleiret
- grunerlokka_helgesens_tm
- helsfyr
- jernbanetorget
- kampen_kirke
- karl_johan
- majorstuen_krysset
- majorstuen_tbanestasjon
- markveien
- nationaltheatret_stasjon
- nydalen
- olaf_ryes_plass
- operahuset
- oslo_bussterminal
- oslo_s
- radhusplassen
- ring_3
- rodelokka
- romsaås
- slottsparken
- sorenga
- spikersuppa
- st_hanshaugen_park
- stensparken
- storgata
- tigeren
- torggata
- toyen_torg
- trikk_17_18
- ullern
- universitetsplassen
- vaalerenga
- vinderen
- vulkan_energisentral

## 6) Semantiske duplikater på tvers av kategorier
- barcode: kategorier = by, kunst; først fallback = data/places/places_by.json
- vigelandsparken: kategorier = by, kunst; først fallback = data/places/places_by.json
- tjuvholmen: kategorier = by, kunst; først fallback = data/places/places_by.json
- voienvolden: kategorier = litteratur, by; først fallback = data/places/places_by.json
- deichman_bjorvika: kategorier = litteratur, by; først fallback = data/places/places_by.json
- ullevål_hageby: kategorier = litteratur, by; først fallback = data/places/places_by.json
- var_frelsers_gravlund: kategorier = litteratur, historie; først fallback = data/places/places_historie.json

## 7) Anbefalt minimal rotårsaksretting
- Velg én canonical kilde per ID i aktive fallback-filer.
- Behold semantisk overlapp via referanser/tagger i stedet for duplicate place-objekter.
- Start med lavrisiko-duplikatene (identiske objekter) før semantiske krysskategorier.

## 8) Risiko for i18n/sourceHash
- Endring av place-objekter kan påvirke i18n-workflows som bygger på stabile ID-er og innholds-hash.
- Flytting/sletting av duplikater kan gi hash-drift i avledede datasett hvis ikke canonicalisering gjøres deterministisk.
- Derfor anbefales trinnvis PR med tydelig migreringslogg per ID.

## 9) Neste trygge PR
1. Fjern kun identiske lavrisiko-duplikater mellom `places_by.json` og `places_by_22_with_quiz_profiles_v2_refined.json`.
2. Verifiser at fallback-opplasting og quiz-stier gir uendret runtime-atferd.
3. Kjør i18n/sourceHash-audit og dokumenter null-regresjon.
4. Ta semantiske krysskategorier i separat PR.
