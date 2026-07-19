import { readFile, writeFile } from 'node:fs/promises';

const aggregatePath = 'data/places/kunst/oslo/places_kunst.json';
const preservedNatureProfile = {
  type: 'skogkledd høyde / bergterreng / lysninger og kantsoner',
  title: 'Skogen som kunstrom',
  summary: 'Ekebergparken ligger i et kupert skoglandskap der trær, berg, stier og lysninger styrer både naturforholdene og møtet med kunsten. Natur-rundingen viser hvordan skoglag, grunnlendt mark, solåpne kanter og utsiktspunkter skaper mange små leveområder på den samme høyden, samtidig som ferdsel og kunstløype legger et tydelig menneskelig mønster gjennom terrenget.',
  themes: [
    'blandingsskog og trekroner',
    'berg, skrenter og grunnlendt mark',
    'lysåpne kanter og skoglysninger',
    'insekter og smådyr i skogsmiljø',
    'terreng, utsikt og menneskelig ferdsel',
  ],
  nearby_place_ids: ['bjorvika', 'oslo_s', 'radhusplassen'],
};

const aggregate = JSON.parse(await readFile(aggregatePath, 'utf8'));
if (!Array.isArray(aggregate)) {
  throw new Error('Expected Kunst Oslo aggregate to be an array.');
}

const aggregateEkeberg = aggregate.find((place) => place?.id === 'ekebergparken');
if (!aggregateEkeberg) {
  throw new Error('Could not find ekebergparken in Kunst Oslo aggregate.');
}

if (aggregateEkeberg.nature_profile) {
  if (JSON.stringify(aggregateEkeberg.nature_profile) !== JSON.stringify(preservedNatureProfile)) {
    throw new Error('Aggregate nature_profile differs from the preserved verified profile.');
  }
  console.log('Ekebergparken nature_profile already synchronized.');
} else {
  const rebuilt = {};
  for (const [key, value] of Object.entries(aggregateEkeberg)) {
    if (key === 'learning_hooks') rebuilt.nature_profile = preservedNatureProfile;
    rebuilt[key] = value;
  }
  if (!Object.hasOwn(rebuilt, 'nature_profile')) rebuilt.nature_profile = preservedNatureProfile;
  Object.keys(aggregateEkeberg).forEach((key) => delete aggregateEkeberg[key]);
  Object.assign(aggregateEkeberg, rebuilt);
  await writeFile(aggregatePath, `${JSON.stringify(aggregate, null, 2)}\n`, 'utf8');
  console.log('Copied verified Ekebergparken nature_profile into aggregate.');
}
