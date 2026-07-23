import { promises as fs } from 'node:fs';
import path from 'node:path';

// One-shot finalizer: remove the unverified bedehus marker, rebuild indexes, then self-delete via the permanent runner.
const root = process.cwd();
const manifestPath = path.join(root, 'data/places/manifest.json');
const readmePath = path.join(root, 'reports/etne-religion-subculture-batch/README.md');

async function removeIfExists(relativePath) {
  try {
    await fs.rm(path.join(root, relativePath), { recursive: true, force: true });
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
}

const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
const rejectedPath = 'places/religion/vestland/etne/skanevik_bedehus.json';
manifest.files = (manifest.files || []).filter((entry) => entry !== rejectedPath);
await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

await removeIfExists('data/places/religion/vestland/etne/skanevik_bedehus.json');
await removeIfExists('reports/etne-religion-subculture-batch/osm/skanevik_bedehus_1.json');
await removeIfExists('reports/etne-religion-subculture-batch/osm/skanevik_bedehus_2.json');
await removeIfExists('reports/etne-religion-subculture-batch/validation');
await removeIfExists('.github/workflows/etne-religion-subculture-fresh-v2.yml');

const readme = `# Etne religion og skatekultur

Dato: 2026-07-23

## Nye Religion-steder

- Etne kyrkje
- Skånevik kyrkje
- Frette kapell

## Utsett stad

- Skånevik bedehus er ikkje aktivert. Kommunen oppgir Tjedlavegen 38, medan Brønnøysund registrerer Skånevik Indremisjon c/o Kristoffer Tjelle på Tjellevegen 38. Nominatim-oppslaget som tidlegare vart brukt gav berre eit unamngitt adresse-/huspunkt, ikkje eit fysisk objekt dokumentert som bedehus. History Go gjetter derfor ikkje ein kartmarkør; staden må få eit eige verifisert bygningsanker før aktivering.

## Subkultur-vurdering

- Etne BMX- og skatepark: Sport som primærkategori, Subkultur som sekundært lag. Eiga BMX-/skateforeining, eigenorganisert aktivitet og ungdomskultur er dokumentert i den eksisterande recorden.
- Skånevik skatepark: Sport som primærkategori, Subkultur som sekundært lag. Den permanente streetprega skateparken representerer spesifikk skatepraksis og scene, ikkje berre eit generisk idrettsanlegg.
- Etne pumptrack: framleis berre Sport. Fleirbruks hjulaktivitet og lågterskeltilbod er dokumentert, men kjeldegrunnlaget etablerer ikkje eit like tydeleg sjølvstendig skate-/subkulturmiljø.

## Koordinatprinsipp

Etne kyrkje og Skånevik kyrkje bruker eksakte Geonorge-adressepunkt krysskontrollerte mot sjølvstendige kyrkjeposisjonar. Frette kapell bruker direkte OSM-bygningsgeometri for way 557505490, verifisert som place_of_worship og chapel og krysskontrollert mot Norges Kirker.

Ingen duplikatmarkør er oppretta for eksisterande kyrkjer eller kulturarenaer.
`;
await fs.mkdir(path.dirname(readmePath), { recursive: true });
await fs.writeFile(readmePath, readme);

console.log(JSON.stringify({
  removedPlaceId: 'skanevik_bedehus',
  manifestEntryRemoved: true,
  retainedReligionPlaces: ['etne_kyrkje', 'skanevik_kyrkje', 'frette_kapell'],
  secondarySubculturePlaces: ['etne_bmx_og_skatepark', 'skanevik_skatepark'],
  pureSportPlace: 'etne_pumptrack'
}, null, 2));
