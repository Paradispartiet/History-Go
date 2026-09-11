#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const storyFile = path.join(root, 'data/stories/stories_stortorget.json');
const stories = JSON.parse(fs.readFileSync(storyFile, 'utf8'));
const story = stories.find((entry) => entry?.id === 'st_stortorget_hovedmarked_1737');
if (!story) throw new Error('Mangler st_stortorget_hovedmarked_1737');

story.score = {
  narrative: 3,
  historical: 2,
  source: 5,
  play_value: 3,
  originality: 3,
  total: 16
};

fs.writeFileSync(storyFile, `${JSON.stringify(stories, null, 2)}\n`);
console.log('Stortorget Story score aligned with Stories integrity governance.');
