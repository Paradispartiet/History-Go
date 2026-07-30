# Musikk – generalisering av fulltekstevidensvalidator til alle canonicale domener v1

Dato: 2026-07-30

## Formål

Denne infrastrukturen åpner ingen nye Musikk-emner, claims, direct objects eller subject-pathway-sett.

Endringen fjerner en tidligere analyse-spesifikk begrensning i `tools/validate-musikk-fulltext-evidence-v1.mjs`: validatoren leste bare `modules_v2/musikalsk_analyse_lyd_struktur.json` og krevde eksplisitt `domain_id = musikalsk_analyse_lyd_struktur` for alle fulltekstevidensfiler.

Det var korrekt mens fulltekstevidenspiloten bare bestod av analysedomenets seks emner, men ville gjøre første evidensfil i et annet canonicalt domene strukturelt umulig å validere.

## Ny valideringsmodell

Validatoren leser nå canonical modulfilene direkte fra:

`data/fag/musikk/musikkvitenskap_canonical_v1/index.json#files.canonical_modules`

Dermed avledes den tillatte domenestrukturen fra den canonicale pakken i stedet for fra en hardkodet enkeltmodul.

Validatoren bygger:

- settet av canonicale `domain_id`-er fra alle modulene
- én samlet `topicById` over alle canonicale emner

Den kontrollerer i tillegg at:

- antall canonicale modulfiler matcher `summary.domain_count`
- antall unike domener matcher `summary.domain_count`
- antall unike emner på tvers av modulene matcher `summary.topic_count`

Med dagens canonicale pakke betyr dette **8 domener / 48 emner**.

## Regler som ikke endres

Generaliseringen svekker ingen evidensport. Følgende regler er uendret:

- fulltekst må være gjennomgått før et claim kan være `claim_ready_editorial`
- production extensions kan ikke endre canonicalt bibliografisk basistall
- claim type må finnes i research contract og være tillatt for emnet
- metode må finnes i metodeprotokollene og være tillatt for emnet
- direct object-type må være tillatt for emnet
- provenance-kilder må være fulltekstgjennomgått i topic-filen
- minst to direkte objektlokatorer kreves
- artikkellokator og direkte objektlokator holdes atskilt
- rights må være kompatible med faktisk History Go-bruk
- uløst kommersiell kompatibilitet eller ikke-redistribuerbart objekt tvinger `external_link_and_metadata_only`
- uncertainty og prohibited inference er obligatoriske
- question release krever løst topic-level direct-object gate

Eksisterende seks analysefiler valideres altså etter samme regler som før; eneste forskjell er at canonical topic/domain-oppslag nå er globalt og evidensdrevet.

## Produksjonsflate

Denne PR-en skal bestå av nøyaktig to filer:

1. `tools/validate-musikk-fulltext-evidence-v1.mjs`
2. `reports/musikk-canonical-migration/musikk-fulltext-validator-all-domains-v1.md`

Ingen indeks, scientific package, quiz, Knowledge-data eller canonical modul endres.

## Neste gate

Når generaliseringen er grønn og merget, kan første emne i `historisk_musikkvitenskap_historiografi` få en ordinær fulltekst-/direct-object-evidensfil under samme kontrakt.

Førstekandidaten er `em_musikk_vit_kildekritikk_musikkhistorie`, men den åpnes ikke av denne infrastrukturen. Kandidaten må fortsatt dokumentere fulltekst, en identifisert primærkilde, minst ett uavhengig kontrollspor, konkret provenance/versjon, minst to objektlokatorer og eksplisitt rights-gate før question release.
