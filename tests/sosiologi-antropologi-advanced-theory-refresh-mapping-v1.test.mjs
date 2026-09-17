import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const CONTRACT = new URL('../data/fag/politikk/sosiologi_antropologi/advanced_theory_fulltext_refresh_v1.json', import.meta.url);
const REQUIRED_WORK_IDS = [
  'adv01-bourdieu-distinction','adv02-goffman-presentation','adv03-elias-civilizing-process','adv04-foucault-discipline-punish','adv05-scott-seeing-state','adv06-anderson-imagined-communities','adv07-hirschman-exit-voice-loyalty','adv08-ostrom-governing-commons','adv09-graeber-debt','adv10-piketty-capital-ideology','adv11-rosa-social-acceleration','adv12-zuboff-surveillance-capitalism','adv13-jacobs-death-life','adv14-sennett-uses-disorder','adv15-latour-reassembling-social','adv16-geertz-interpretation-cultures','adv17-polanyi-great-transformation','adv18-arendt-human-condition','adv19-kahneman-thinking-fast-slow','adv20-haidt-righteous-mind'
];

const uniq = (xs) => new Set(xs).size === xs.length;

test('advanced theory refresh maps every work and theory unit to one canonical primary domain', () => {
  const contract = JSON.parse(fs.readFileSync(CONTRACT, 'utf8'));
  const rows = contract.work_refreshes ?? [];
  assert.equal(rows.length, 20);
  assert.deepEqual(rows.map((row) => row.work_id).sort(), [...REQUIRED_WORK_IDS].sort());
  assert.equal(uniq(rows.map((row) => row.work_id)), true);
  assert.equal(rows.every((row) => typeof row.primary_domain_id === 'string' && row.primary_domain_id.length > 0), true);
  assert.equal(rows.every((row) => Array.isArray(row.theory_unit_ids) && row.theory_unit_ids.length === 3), true);
  const theoryIds = rows.flatMap((row) => row.theory_unit_ids);
  assert.equal(theoryIds.length, 60);
  assert.equal(uniq(theoryIds), true);
  assert.deepEqual([...new Set(rows.map((row) => row.primary_domain_id))].sort(), [
    'antropologisk_teori',
    'digitalisering_vitenskap_teknologi_samfunn',
    'institusjoner_organisasjoner_arbeid_velferd',
    'normer_identitet_hverdagsliv',
    'sosiologisk_teori',
    'sted_by_migrasjon_transnasjonalitet',
    'ulikhet_klasse_kjonn_rasialisering'
  ]);
});
