# Bispelokket people-research

## Konklusjon

Bruk bare én sikker personkobling nå:

- `jens_stoltenberg` → `bispelokket`

Dette er nok til å gjøre people-rundingen grønn uten å fylle stedet med løse byutviklingsnavn.

## Hvorfor Jens Stoltenberg

Bispelokket-koblingen er direkte og hendelsesbasert: Stoltenberg var statsminister da den fysiske rivingen av Bispelokket ble markert/startet 4. november 2011.

Dette passer som en `kontekst`-/hendelsesrelasjon, ikke som arkitekt, planlegger eller eier.

Anbefalt relasjon:

```json
{
  "id": "rel_bispelokket_jens_stoltenberg_riving",
  "type": "markerte_riving",
  "place": "bispelokket",
  "person": "jens_stoltenberg",
  "label": "Markerte starten på rivingen",
  "why": "Som statsminister markerte Jens Stoltenberg starten på den fysiske rivingen av Bispelokket 4. november 2011. Koblingen er direkte knyttet til Bispelokkets overgang fra trafikkmaskin til revet bybarriere.",
  "source": "Bispelokket research: Wikipedia oppgir at den fysiske rivningen ble lansert av statsminister Jens Stoltenberg 4. november 2011, med NRK 2011 som kilde."
}
```

## Ikke brukt nå

- Kong Harald V: relevant for åpningen av Operatunnelen/Bjørvikatunnelen, men koblingen er mer indirekte til Bispelokket.
- Arkitekter/Barcode-navn: passer bedre på Barcode/Bjørvika, ikke på Bispelokket som trafikkmaskin.
- Nåværende aktører i Bjørvika: de er allerede dekket under brands/aktører.

## Datagrep

Relasjonen er lagt i den eksisterende sekundære relasjonsfilen som allerede lastes i boot:

- `data/relations_philanthropy.json`

Dette bør senere vurderes ryddet til en mer generell supplementfil, men denne PR-en holder endringen liten og uten boot-refaktor.
