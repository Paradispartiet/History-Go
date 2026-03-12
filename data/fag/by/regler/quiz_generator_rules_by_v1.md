# Quizgenerator-regler for BY v1
Dette er laget fra `places_by_22_with_quiz_profiles_v2_refined.json` og `emner_by_31_patched_full_v2_concepts_restored.json`. Målet er at generatoren faktisk skal bruke `quiz_profile`-feltene i stedet for å ignorere dem.
## Hovedregel
Spørsmål skal genereres slik: **emne -> stedskarakter -> spørsmålsvinkel -> konkret spørsmål**. Et emne får aldri formulere spørsmål alene.
## Bindinger generatoren må følge
- Maks 1 spørsmål per emne-vinkel per sted.
- Maks 1 definisjonsspørsmål per sett.
- Minst 3 ulike spørsmålsfamilier per sett.
- Minst 2 stedsspesifikke trekk per sett.
- Minst 1 `must_include` per sett.
- Generiske åpninger skal blokkeres.
- Hvis `contrast_targets` finnes, skal minst ett kontrastspørsmål inn i hele quizpakken.

## Blokkerte formuleringer
- Hvorfor er dette stedet relevant for ...
- Hva gjør stedet til et eksempel på ...
- Hvilket begrep passer best ...
- Hva slags grøntområde er dette ...
- Hvordan fungerer stedet som byrom ...

## Foretrukne åpninger
- Hva forteller ...
- Hvorfor ble ...
- Hva skiller ...
- Hvordan merker man ...
- Hvilket spor ser man av ...
- Hva gjør at ...
- Hvorfor oppleves ...
- Hva var dette stedet før ...
- Hvilken løsning gjør ...
- Hvor i stedet ser man ...

## Spørsmålsfamilier
### gjenkjenning
- Formål: Identify the place through a concrete signature trait.
- Gode åpninger: Hva ved stedet gjør det lett å kjenne igjen, Hva er det første som skiller, Hvilket trekk gjør at
- Knowledge må: must name a concrete place trait, must add why the trait matters in the city
### historisk_endring
- Formål: Frame the place through change over time.
- Gode åpninger: Hva var dette stedet før, Hvorfor ble, Hvilken endring gjorde at
- Knowledge må: must mention at least one dated or periodized shift, must connect shift to current place character
### teknisk_fysisk
- Formål: Ask about construction, infrastructure, material or physical solution.
- Gode åpninger: Hvilken løsning gjør, Hva er bygget i, Hvordan er dette anlagt
- Knowledge må: must include a concrete technical or material detail, must explain what that detail enables
### bruk
- Formål: Ask about actual use, rhythms and user groups.
- Gode åpninger: Hva brukes stedet til i dag, Hvem virker stedet laget for, Hvordan merker man at
- Knowledge må: must describe actual use today, must avoid generic byliv wording
### romlig_lesning
- Formål: Read movement, openness, closure, direction and position in space.
- Gode åpninger: Hva gjør at stedet åpner seg, Hvor i stedet ser man, Hvordan leder stedet deg
- Knowledge må: must describe a spatial effect, must tie it to movement or orientation
### saertrekk
- Formål: Distinguish the place from similar places in Oslo.
- Gode åpninger: Hva skiller, Hvorfor oppleves dette annerledes enn, Hva gjør dette stedet ulikt
- Knowledge må: must state a real differentiator, must not fall back to generic category labels
### kontrast
- Formål: Use contrast against a nearby or comparable place.
- Gode åpninger: Hvorfor føles dette annerledes enn, Hva er den tydeligste forskjellen mellom, Hvilket trekk gjør at dette ikke fungerer som
- Knowledge må: must compare against an explicit contrast target or same-type place, must explain difference, not just name it
### tidslag
- Formål: Read multiple periods or surviving traces in the same place.
- Gode åpninger: Hvilket spor ser man av, Hvilke epoker kan fortsatt leses her, Hva i stedet røper at
- Knowledge må: must identify at least one surviving trace, must connect trace to present-day reading

## Knowledge-regel
Knowledge skal ikke bare gjenta svaret. Den skal vanligvis legge til minst to av disse lagene: historisk kontekst, materiale/fysisk trekk, bruk i dag, kontrast, eller hvorfor dette betyr noe i bylogikken.

## Eksempler fra faktiske steder
### Slottsparken (`slottsparken`)
- Primærvinkler: institusjon, bruk, form, utsyn_orientering
- Familier: gjenkjenning, romlig_lesning, saertrekk, kontrast
- Må ha med: forholdet til Slottet, dobbelrollen som representasjon og hverdag
- Bør støttes av emner: Parker som sosial infrastruktur, Opphold vs gjennomgang
### Oslo S (`oslo_s`)
- Primærvinkler: teknikk, bruk, konflikt_forandring, institusjon
- Familier: gjenkjenning, teknisk_fysisk, bruk, romlig_lesning
- Må ha med: rollen som nasjonal inngangsport, sammensmeltingen av mobilitet, venting og konsum
- Bør støttes av emner: Infrastruktur og mobilitet, Sosiale knutepunkt
### Torggata (`torggata`)
- Primærvinkler: historie, bruk, konflikt_forandring, materialitet
- Familier: historisk_endring, bruk, saertrekk, kontrast
- Må ha med: ombyggingen og oppgraderingen av gaten, spenningen mellom råere fortid og kuratert nåtid
- Bør støttes av emner: Gentrifisering, eiendom og spekulasjon, Styring, forvaltning og planmakt
### Grønlandsleiret (`gronlandsleiret`)
- Primærvinkler: historie, bruk, konflikt_forandring, institusjon
- Familier: gjenkjenning, bruk, saertrekk, kontrast
- Må ha med: hverdagshandelen, forskjellen mellom lokal intensitet og mer polert sentrumsgatelogikk
- Bør støttes av emner: Kommersielle gater og handelsstrøk, Sosial miks i offentlige rom
### Birkelunden (`birkelunden`)
- Primærvinkler: bruk, historie, vegetasjon, konflikt_forandring
- Familier: bruk, saertrekk, kontrast, tidslag
- Må ha med: parken som sosialt frirom, rollen i en tett og kommersielt aktiv bydel
- Bør støttes av emner: Parker som sosial infrastruktur, Opphold vs gjennomgang
