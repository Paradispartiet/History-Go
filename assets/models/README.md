# Civication 3D-kart – bygningsmodeller (hybrid)

Dette er modell-registeret for det 3D-kartet i Civication (`CivicationThreeMap`).
Kartet er **hybrid**: bygg som har en registrert `.glb`/`.gltf`-modell bruker den
ekte modellen; alt annet faller tilbake til de innebygde primitiv-modellene. Så
lenge registeret er tomt skjer ingen visuell endring.

## Slik legger du til ekte 3D-modeller

1. Skaff gratis CC0-modeller (ingen kreditering nødvendig):
   - **Kenney** – https://kenney.nl → *Assets* → søk «City» (f.eks. «City Kit»).
     Last ned ZIP-en, finn `.glb`/`.gltf`-filene i `Models/`-mappen.
   - **Poly Pizza** – https://poly.pizza → søk (f.eks. «house», «church») →
     *Download → GLB*. Én fil av gangen.
   - **Quaternius** – https://quaternius.com – flere CC0 low-poly bypakker.

2. Legg filene i denne mappen (`assets/models/`), f.eks. `apartment.glb`,
   `shop.glb`, `slottet.glb`.

3. Registrer dem i `manifest.json`:

   ```json
   {
     "buildingTypes": {
       "apartment": "apartment.glb",
       "commerce": "shop.glb",
       "church": "church.glb"
     },
     "landmarks": {
       "slottet": "slottet.glb",
       "operaen": "operaen.glb"
     }
   }
   ```

   - **buildingTypes**: nøkkelen er miniatyr-typen (se `PLACE_MINIATURE_TYPES` i
     `js/Civication/ui/CivicationThreeMap.js`): `apartment`, `commerce`, `default`,
     `museum`, `church`, `school`, `university`, `station`, `stadium`, `library`,
     `theatre`, `cinema`, `music_venue`, `gallery`, `waterfront`, `industrial`,
     `civic`, `subculture`, `park`, `square`, `street`, `ice_arena`,
     `sports_field`, `playground`.
   - **landmarks**: nøkkelen er landemerke-id (se `OSLO_KEY_LANDMARKS`):
     `slottet`, `operaen`, `stortinget`, `radhuset`, `akershus`, `barcode`,
     `munch`, `holmenkollen`, `nationaltheatret`, `oslo_s`, `aker_brygge`,
     `frognerparken`, `ullevaal`, `bislett`, `jordal`, `kampen`, `toyen_torg`,
     `posthuset`, `oslo_plaza`, `deichman`.

4. Åpne `Civication.html` – modellene lastes automatisk og erstatter primitivene.

## Skalering

Du trenger ikke skalere modellene manuelt: hver modell auto-skaleres og sentreres
så den passer i kartet (bunnen legges på bakken, bredden normaliseres). Finjuster
per modell ved behov med valgfrie felt i manifestet:

```json
"apartment": { "file": "apartment.glb", "scale": 1.1, "rotationY": 0, "yOffset": 0 }
```

## Lisens

Bruk kun modeller du har rett til å distribuere. **CC0** (Kenney, Poly Pizza,
Quaternius) er trygt – fritt å committe i repoet uten kreditering.
