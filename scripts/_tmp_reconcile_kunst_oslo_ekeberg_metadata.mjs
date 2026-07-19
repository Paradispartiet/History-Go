import { readFile, writeFile } from 'node:fs/promises';

const aggregatePath = 'data/places/kunst/oslo/places_kunst.json';
const splitPath = 'data/places/kunst/oslo/places_kunst/ekebergparken.json';

const aggregate = JSON.parse(await readFile(aggregatePath, 'utf8'));
const splitEkeberg = JSON.parse(await readFile(splitPath, 'utf8'));

if (!Array.isArray(aggregate)) {
  throw new Error('Expected Kunst Oslo aggregate to be an array.');
}

const aggregateEkeberg = aggregate.find((place) => place?.id === 'ekebergparken');
if (!aggregateEkeberg) {
  throw new Error('Could not find ekebergparken in Kunst Oslo aggregate.');
}
if (!splitEkeberg?.nature_profile) {
  throw new Error('Existing Ekebergparken split record has no nature_profile to preserve.');
}

if (aggregateEkeberg.nature_profile) {
  const aggregateValue = JSON.stringify(aggregateEkeberg.nature_profile);
  const splitValue = JSON.stringify(splitEkeberg.nature_profile);
  if (aggregateValue !== splitValue) {
    throw new Error('Aggregate and split nature_profile differ; refusing automatic overwrite.');
  }
  console.log('Ekebergparken nature_profile already synchronized.');
} else {
  const learningHooksIndex = Object.keys(aggregateEkeberg).indexOf('learning_hooks');
  if (learningHooksIndex === -1) {
    aggregateEkeberg.nature_profile = splitEkeberg.nature_profile;
  } else {
    const rebuilt = {};
    for (const [key, value] of Object.entries(aggregateEkeberg)) {
      if (key === 'learning_hooks') rebuilt.nature_profile = splitEkeberg.nature_profile;
      rebuilt[key] = value;
    }
    Object.keys(aggregateEkeberg).forEach((key) => delete aggregateEkeberg[key]);
    Object.assign(aggregateEkeberg, rebuilt);
  }
  await writeFile(aggregatePath, `${JSON.stringify(aggregate, null, 2)}\n`, 'utf8');
  console.log('Copied Ekebergparken nature_profile from split record into aggregate.');
}
