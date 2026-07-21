import fs from 'fs';
import path from 'path';

type AliasMap = Record<string, string>;

const aliases: AliasMap = { sagene_film: 'sagene', kampen_film: 'kampen', psykologirommet_oslo: 'psykologisk_institutt_uio', nrk_marienlyst: 'nrk_huset_marienlyst', jernbanetorget_trafikknutepunkt: 'jernbanetorget', akerhus_slott: 'akershus_festning', good_game_redaksjon: 'nrk_huset_marienlyst', nydalen_industristed: 'nydalen', loelva_historisk: 'alnaelva' , lekeplass_sofienbergparken: 'sofienbergparken_subkultur' , lekeplass_st_hanshaugen: 'st_hanshaugen_park' , lekeplass_birkelunden: 'birkelunden' , lekeplass_olaf_ryes_plass: 'olaf_ryes_plass' , lekeplass_botsparken: 'botsparken' , lekeplass_stensparken: 'stensparken' , treningssted_skur13: 'skur13' , lekeplass_frognerborgen: 'frognerparken' , sofienbergparken_subkultur: 'sofienbergparken' , treningssted_torshovdalen: 'torshovdalen' , treningssted_sognsvann: 'sognsvann' };
const root = process.cwd();
const targets: string[] = ['data/i18n/content/places', 'data/leksikon', 'data/places', 'data/quiz', 'data/stories', 'data/wonderkammer', 'data/Civication'];

function walk(d: string): string[] {
  if (!fs.existsSync(d)) return [];
  return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith('.json') ? [path.join(d, e.name)] : []
  );
}

let bad = 0;
for (const f of targets.flatMap((t) => walk(path.join(root, t)))) {
  const txt = fs.readFileSync(f, 'utf8');
  for (const [oldId, newId] of Object.entries(aliases)) {
    if (txt.includes(`"${oldId}"`)) {
      bad++;
      console.error(`${path.relative(root, f)} references legacy place id ${oldId} (canonical: ${newId})`);
    }
  }
}
if (bad) process.exit(1);
console.log('OK: no legacy place IDs found in checked JSON data.');
